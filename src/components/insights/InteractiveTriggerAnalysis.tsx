import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronUp, Target, AlertCircle } from 'lucide-react';
import { TriggerConfidenceLevel } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';

interface InteractiveTriggerAnalysisProps {
  triggerConfidence: TriggerConfidenceLevel[];
}

interface ChartDataItem {
  id: string;
  displayName: string;
  impactScore: number;
  color: string;
  occurrences: number;
  avgBloatingWith: number;
  avgBloatingWithout: number;
  topFoods: string[];
  percentage: number;
  confidence: 'high' | 'investigating' | 'needsData';
}

export function InteractiveTriggerAnalysis({ triggerConfidence }: InteractiveTriggerAnalysisProps) {
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(null);

  // Impact-based color mapping for medical-grade appearance
  const getImpactColor = (score: number): string => {
    if (score <= 15) return '#4CAF50';   // Green - low impact
    if (score <= 30) return '#9BC53D';   // Yellow-green - moderate low
    if (score <= 45) return '#FFC857';   // Yellow - moderate
    if (score <= 60) return '#F4A261';   // Orange - elevated
    return '#E76F51';                    // Red - high impact
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return triggerConfidence
      .filter(t => t.confidence === 'high' || t.confidence === 'investigating')
      .map(trigger => {
        const categoryInfo = getTriggerCategory(trigger.category);

        // Calculate impact score (frequency × severity)
        const impactScore = trigger.occurrences * trigger.avgBloatingWith;

        // Determine color based on impact score (not confidence)
        const color = getImpactColor(impactScore);

        return {
          id: trigger.category,
          displayName: categoryInfo?.displayName || trigger.category,
          impactScore: Math.round(impactScore * 10) / 10,
          color,
          occurrences: trigger.occurrences,
          avgBloatingWith: trigger.avgBloatingWith,
          avgBloatingWithout: trigger.avgBloatingWithout,
          topFoods: trigger.topFoods,
          percentage: trigger.percentage,
          confidence: trigger.confidence,
        } as ChartDataItem;
      })
      .sort((a, b) => b.impactScore - a.impactScore); // Sort by impact
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
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-semibold text-foreground">{data.displayName}</div>
          <div
            className={`w-2 h-2 rounded-full ${
              data.confidence === 'high' ? 'bg-foreground' : 'bg-foreground/30'
            }`}
            title={data.confidence === 'high' ? 'High confidence' : 'Investigating'}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Impact Score: <span className="font-bold" style={{ color: data.color }}>{data.impactScore}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {data.confidence === 'high' ? 'High confidence trigger' : 'Still investigating'} • Click for details
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
          <h2 className="font-bold text-foreground text-xl">Trigger Analysis</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click a bar to see detailed insights
          </p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-[300px]">
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
              label={{ value: 'Impact Score', position: 'bottom', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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
              dataKey="impactScore"
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

      {/* Impact-based Legend */}
      <div className="space-y-2 pt-2 border-t border-border/30">
        <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#4CAF50]" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#9BC53D]" />
            <span className="text-muted-foreground">Moderate-Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#FFC857]" />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#F4A261]" />
            <span className="text-muted-foreground">Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#E76F51]" />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Colors show impact severity • <span className="font-semibold">●</span> = High confidence • <span className="opacity-50">○</span> = Investigating
        </p>
      </div>

      {/* Collapsible Details */}
      <div className="space-y-3 pt-2">
        {chartData.map((trigger) => (
          <Collapsible.Root
            key={trigger.id}
            open={expandedTrigger === trigger.id}
            onOpenChange={() => handleBarClick(trigger)}
          >
            <Collapsible.Trigger className="w-full">
              <div className={`
                flex items-center justify-between p-4 rounded-lg
                transition-all cursor-pointer
                ${expandedTrigger === trigger.id
                  ? 'bg-gradient-to-r from-coral/10 to-transparent border border-coral/30'
                  : 'bg-muted/10 border border-transparent hover:border-border/50'
                }
              `}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: trigger.color }}
                  />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-sm">{trigger.displayName}</h3>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          trigger.confidence === 'high' ? 'bg-foreground' : 'bg-foreground/30'
                        }`}
                        title={trigger.confidence === 'high' ? 'High confidence' : 'Investigating'}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {trigger.occurrences}x logged • {trigger.percentage}% of meals
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="text-xs text-muted-foreground">Impact</div>
                    <div className="text-lg font-bold" style={{ color: trigger.color }}>
                      {trigger.impactScore}
                    </div>
                  </div>
                  {expandedTrigger === trigger.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </Collapsible.Trigger>

            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
              <div className="p-4 mt-2 rounded-lg bg-muted/5 border border-border/30 space-y-3">
                {/* Bloating Comparison */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Bloating Comparison
                  </h4>

                  {/* With Trigger */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">With {trigger.displayName}</span>
                      <span className="font-bold text-coral">{trigger.avgBloatingWith}/5</span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-coral rounded-full transition-all duration-500"
                        style={{ width: `${(trigger.avgBloatingWith / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Without Trigger */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Without {trigger.displayName}</span>
                      <span className="font-bold text-primary">{trigger.avgBloatingWithout}/5</span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(trigger.avgBloatingWithout / 5) * 100}%` }}
                      />
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

                {/* Confidence Badge */}
                <div className="pt-2 border-t border-border/30">
                  <span className={`
                    px-3 py-1.5 rounded-full text-xs font-bold uppercase
                    ${trigger.confidence === 'high'
                      ? 'bg-coral/20 text-coral'
                      : 'bg-peach/20 text-peach'
                    }
                  `}>
                    {trigger.confidence === 'high' ? 'High Confidence' : 'Investigating'}
                  </span>
                </div>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </div>
    </div>
  );
}
