import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, AlertCircle } from 'lucide-react';
import { TriggerConfidenceLevel } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';

interface InteractiveTriggerAnalysisProps {
  triggerConfidence: TriggerConfidenceLevel[];
}

interface ChartDataItem {
  id: string;
  displayName: string;
  impactScore: number; // The bloat impact score (avgWith - avgWithout)
  bloatPercentage: number; // For display purposes
  color: string;
  occurrences: number;
  avgBloatingWith: number;
  avgBloatingWithout: number;
  topFoods: string[];
  percentage: number;
  confidence: 'high' | 'investigating' | 'needsData';
  confidencePercentage: number;
}

export function InteractiveTriggerAnalysis({ triggerConfidence }: InteractiveTriggerAnalysisProps) {
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(null);

  // Prepare chart data
  const chartData = useMemo(() => {
    // Include ALL logged categories and ensure they all show visible bars
    const allCategories = triggerConfidence.map(trigger => {
      const categoryInfo = getTriggerCategory(trigger.category);

      // Impact Score: (avgBloatingWith - avgBloatingWithout)
      // Use absolute value for bar length to ensure ALL triggers are visible
      // Minimum bar size of 5% to ensure even zero-impact triggers show up
      const impactScore = trigger.impactScore;
      const absImpact = Math.abs(impactScore);
      const bloatPercentage = Math.max(5, Math.round((absImpact / 5) * 100));

      return {
        id: trigger.category,
        displayName: categoryInfo?.displayName || trigger.category,
        impactScore,
        bloatPercentage,
        color: '', // Will be assigned below
        occurrences: trigger.occurrences,
        avgBloatingWith: trigger.avgBloatingWith,
        avgBloatingWithout: trigger.avgBloatingWithout,
        topFoods: trigger.topFoods,
        percentage: trigger.percentage,
        confidence: trigger.confidence,
        confidencePercentage: trigger.confidencePercentage,
      } as ChartDataItem;
    })
    .sort((a, b) => b.impactScore - a.impactScore); // Sort by impact score (highest first)

    // Assign colors based on impact score thresholds
    // Red/Orange for triggers that increase bloating (harmful)
    // Teal/Green for triggers that decrease or don't affect bloating (helpful/neutral)
    allCategories.forEach((item) => {
      // High positive impact: 2.0+ differential (Red - Bad trigger)
      if (item.impactScore >= 2.0) {
        item.color = '#EF5350'; // Red
      }
      // Moderate positive impact: 1.0-1.9 differential (Orange - Moderate trigger)
      else if (item.impactScore >= 1.0) {
        item.color = '#FFA726'; // Orange
      }
      // Low positive impact: 0.5-0.9 differential (Light Orange - Mild trigger)
      else if (item.impactScore >= 0.5) {
        item.color = '#FFB74D'; // Light Orange
      }
      // Near-zero or negative impact: Below 0.5 differential (Teal - Safe/Helpful)
      else {
        item.color = '#26A69A'; // Teal
      }
    });

    return allCategories;
  }, [triggerConfidence]);

  if (chartData.length === 0) {
    return (
      <div className="premium-card p-8 shadow-sm rounded-xl text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No triggers identified yet. Keep logging meals!</p>
      </div>
    );
  }

  const handleBarClick = (data: ChartDataItem) => {
    setExpandedTrigger(expandedTrigger === data.id ? null : data.id);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload as ChartDataItem;

    return (
      <div className="premium-card p-3 border border-primary/20 shadow-lg">
        <div className="text-sm font-semibold text-foreground mb-1">{data.displayName}</div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Impact: +{data.impactScore.toFixed(1)} bloating differential</div>
          <div>{data.confidencePercentage}% confidence ({data.occurrences} meals)</div>
          <div className="text-[10px] opacity-70">Click for details</div>
        </div>
      </div>
    );
  };

  return (
    <div className="premium-card p-6 shadow-sm rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-coral/30 to-coral/10">
          <Target className="w-5 h-5 text-coral" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-foreground text-xl">Top Bloat Triggers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click a bar to see detailed insights
          </p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.1)' }} />
            <Bar
              dataKey="bloatPercentage"
              radius={[0, 8, 8, 0]}
              animationDuration={1500}
              onClick={(data) => handleBarClick(data)}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={expandedTrigger === entry.id ? 1 : 0.85}
                  className="transition-opacity hover:opacity-100"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Severity Legend - Simplified */}
      <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-border/30 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#26A69A]" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FFA726]" />
          <span className="text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#EF5350]" />
          <span className="text-muted-foreground">High</span>
        </div>
      </div>

      {/* Selected Trigger Details */}
      {expandedTrigger && (() => {
        const trigger = chartData.find(t => t.id === expandedTrigger);
        if (!trigger) return null;

        return (
          <div className="pt-2 border-t border-border/30">
            <div className="p-4 rounded-lg bg-gradient-to-r from-coral/10 to-transparent border border-coral/30 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-12 rounded-full"
                  style={{ backgroundColor: trigger.color }}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm">{trigger.displayName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {trigger.occurrences}x logged • {trigger.percentage}% of meals • {trigger.confidencePercentage}% confidence
                  </p>
                </div>
                {/* Confidence Badge - Top Right */}
                <div className={`
                  relative px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide
                  flex items-center gap-1.5 shadow-md
                  ${trigger.confidence === 'high'
                    ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-950'
                    : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-900'
                  }
                `}>
                  {/* Badge Shine Effect */}
                  <div className={`
                    absolute inset-0 rounded-lg opacity-40
                    ${trigger.confidence === 'high'
                      ? 'bg-gradient-to-tr from-transparent via-white to-transparent'
                      : 'bg-gradient-to-tr from-transparent via-white to-transparent'
                    }
                  `} style={{ transform: 'skewX(-20deg)' }} />

                  {/* Badge Content */}
                  <span className="relative z-10 flex items-center gap-1">
                    {trigger.confidence === 'high' ? '🏆' : '🔍'}
                    {trigger.confidence === 'high' ? 'High Confidence' : 'Investigating'}
                  </span>
                </div>
              </div>

              {/* Risk Gauge */}
              <div className="space-y-3 pt-2 border-t border-border/30">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Trigger Risk
                </h4>

                <div className="flex items-center gap-6">
                  {/* Circular Risk Gauge */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        opacity="0.2"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke={trigger.color}
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - trigger.avgBloatingWith / 5)}`}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold" style={{ color: trigger.color }}>
                        {Math.round((trigger.avgBloatingWith / 5) * 100)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Risk
                      </div>
                    </div>
                  </div>

                  {/* Risk Description */}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {trigger.impactScore >= 2.0
                        ? `${trigger.displayName} increases bloating by ${trigger.impactScore.toFixed(1)} points on average. Strong correlation detected.`
                        : trigger.impactScore >= 1.0
                        ? `Moderate bloating risk with ${trigger.displayName.toLowerCase()}. Impact: +${trigger.impactScore.toFixed(1)} points.`
                        : trigger.impactScore > 0
                        ? `Low impact detected. ${trigger.displayName} adds ${trigger.impactScore.toFixed(1)} points to bloating.`
                        : `No negative impact detected. May actually help reduce bloating.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Foods */}
              {trigger.topFoods.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Common Foods
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trigger.topFoods.map((food, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-coral/10 text-coral text-xs font-medium border border-coral/20"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
