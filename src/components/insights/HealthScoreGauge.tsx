import { useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

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

  const { level, color, bgColor, message } = useMemo(() => {
    if (healthScore >= 80) {
      return {
        level: 'Excellent',
        color: 'hsl(var(--mint))',
        bgColor: 'from-mint/20 to-mint/10',
        message: 'Your gut is thriving! Keep up the great work.',
      };
    } else if (healthScore >= 60) {
      return {
        level: 'Good',
        color: 'hsl(var(--primary))',
        bgColor: 'from-primary/20 to-primary/10',
        message: 'You\'re on the right track. Small improvements add up!',
      };
    } else if (healthScore >= 40) {
      return {
        level: 'Fair',
        color: 'hsl(var(--peach))',
        bgColor: 'from-peach/20 to-peach/10',
        message: 'Progress is happening. Stay consistent with tracking.',
      };
    } else {
      return {
        level: 'Needs Attention',
        color: 'hsl(var(--coral))',
        bgColor: 'from-coral/20 to-coral/10',
        message: 'Keep tracking to identify patterns and improve.',
      };
    }
  }, [healthScore]);

  const chartData = [
    {
      name: 'Health Score',
      value: healthScore,
      fill: color,
    },
  ];

  return (
    <div className="premium-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${bgColor}`}>
          <span className="text-xl">💚</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Gut Health Score</h3>
          <p className="text-xs text-muted-foreground">
            Based on your bloating patterns
          </p>
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <defs>
              <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={1} />
              </linearGradient>
            </defs>

            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />

            <RadialBar
              background={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
              dataKey="value"
              cornerRadius={10}
              fill="url(#gaugeGradient)"
              animationDuration={2000}
              animationBegin={200}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-5xl font-bold mb-1 transition-all duration-500"
            style={{ color }}
          >
            {healthScore}
          </div>
          <div className="text-sm font-semibold text-muted-foreground">out of 100</div>
          <div
            className="mt-2 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {level}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Avg Bloating Score</span>
          <span className="font-semibold text-foreground">{avgBloating.toFixed(1)}/5</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Comfortable Meals</span>
          <span className="font-semibold text-foreground">
            {lowBloatingCount}/{totalMeals} ({Math.round((lowBloatingCount / totalMeals) * 100)}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Uncomfortable Meals</span>
          <span className="font-semibold text-foreground">
            {highBloatingCount}/{totalMeals} ({Math.round((highBloatingCount / totalMeals) * 100)}%)
          </span>
        </div>
      </div>

      {/* Message */}
      <div className={`mt-4 p-3 rounded-xl bg-gradient-to-br ${bgColor} border border-primary/10`}>
        <p className="text-xs text-center text-foreground font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}
