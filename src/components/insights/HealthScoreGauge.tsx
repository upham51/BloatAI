import { useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface HealthScoreGaugeProps {
  avgBloating: number; // 0-5 scale
  totalMeals: number;
  lowBloatingCount: number;
  highBloatingCount?: number;
}

export function HealthScoreGauge({ avgBloating, totalMeals, lowBloatingCount, highBloatingCount = 0 }: HealthScoreGaugeProps) {
  const healthScore = useMemo(() => {
    // Convert average bloating (1-5) to health score (0-100)
    // Lower bloating = higher health score
    const bloatingScore = ((5 - avgBloating) / 4) * 100;

    // Factor in success rate (low bloating meals)
    const successRate = totalMeals > 0 ? (lowBloatingCount / totalMeals) * 100 : 0;

    // Weighted average (70% bloating score, 30% success rate)
    const composite = bloatingScore * 0.7 + successRate * 0.3;

    return Math.round(Math.max(0, Math.min(100, composite)));
  }, [avgBloating, totalMeals, lowBloatingCount]);

  const { level, color, bgColor, ringColor } = useMemo(() => {
    if (healthScore >= 70) {
      return {
        level: 'Healthy',
        color: 'hsl(var(--primary))',
        bgColor: 'bg-primary/10',
        ringColor: '#10b981', // Green
      };
    } else if (healthScore >= 41) {
      return {
        level: 'Moderate',
        color: 'hsl(var(--peach))',
        bgColor: 'bg-peach/10',
        ringColor: '#f97316', // Orange
      };
    } else {
      return {
        level: 'Needs Attention',
        color: 'hsl(var(--coral))',
        bgColor: 'bg-coral/10',
        ringColor: '#ef4444', // Red
      };
    }
  }, [healthScore]);

  // Calculate weekly progress (simulated for now - in production, this would compare with previous week's data)
  const weeklyChange = useMemo(() => {
    // Simulate weekly change based on current score
    // In a real implementation, you'd calculate this from historical data
    const change = Math.round((healthScore - 50) * 0.1);
    return change;
  }, [healthScore]);

  const chartData = [
    {
      name: 'Health Score',
      value: healthScore,
      fill: ringColor,
    },
  ];

  const goalScore = 60;

  return (
    <div className="premium-card p-5">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-foreground text-lg">Your Bloat Health Score</h3>
        <p className="text-xs text-muted-foreground">
          Based on your bloating patterns
        </p>
      </div>

      {/* Ring Chart */}
      <div className="relative mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <defs>
              {/* Zone gradients */}
              <linearGradient id="redZone" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="orangeZone" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="greenZone" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
              </linearGradient>
            </defs>

            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />

            {/* Background with zones */}
            <RadialBar
              background={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
              dataKey="value"
              cornerRadius={8}
              fill={
                healthScore >= 70 ? 'url(#greenZone)' :
                healthScore >= 41 ? 'url(#orangeZone)' :
                'url(#redZone)'
              }
              animationDuration={3500}
              animationBegin={200}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-5xl font-bold mb-1 transition-all duration-500"
            style={{ color: ringColor }}
          >
            {healthScore}
          </div>
          <div className="text-xs text-muted-foreground font-medium">out of 100</div>
          <div
            className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}
            style={{ color: ringColor }}
          >
            {level}
          </div>
        </div>
      </div>

      {/* Weekly Progress & Goal */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
          <span className="text-sm text-muted-foreground">This week:</span>
          <div className="flex items-center gap-1.5">
            {weeklyChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-primary" />
            ) : (
              <TrendingDown className="w-4 h-4 text-coral" />
            )}
            <span className={`text-sm font-bold ${weeklyChange >= 0 ? 'text-primary' : 'text-coral'}`}>
              {weeklyChange >= 0 ? '+' : ''}{weeklyChange} points
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
          <span className="text-sm text-muted-foreground">Your goal:</span>
          <span className="text-sm font-bold text-foreground">{goalScore}+ (Low risk)</span>
        </div>
      </div>

      {/* Zone Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 text-xs pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="text-muted-foreground">0-40</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f97316]" />
          <span className="text-muted-foreground">41-69</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#10b981]" />
          <span className="text-muted-foreground">70-100</span>
        </div>
      </div>

      {/* Improvement Plan Button */}
      <button
        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${bgColor} hover:opacity-80`}
        style={{ color: ringColor }}
        onClick={() => {
          // Navigate to improvement plan or show modal
          // This can be implemented based on app's routing
          console.log('View Improvement Plan clicked');
        }}
      >
        View Improvement Plan →
      </button>

      {/* Score Breakdown - Collapsible or minimal */}
      <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Avg Bloating Score</span>
          <span className="font-semibold text-foreground">{avgBloating.toFixed(1)}/5</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Comfortable Meals</span>
          <span className="font-semibold text-foreground">
            {lowBloatingCount}/{totalMeals} ({Math.round((lowBloatingCount / totalMeals) * 100)}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Uncomfortable Meals</span>
          <span className="font-semibold text-foreground">
            {highBloatingCount}/{totalMeals} ({Math.round((highBloatingCount / totalMeals) * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
