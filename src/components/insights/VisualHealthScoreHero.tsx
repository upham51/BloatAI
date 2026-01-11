import { useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface VisualHealthScoreHeroProps {
  avgBloating: number; // 0-5 scale
  totalMeals: number;
  lowBloatingCount: number;
  highBloatingCount?: number;
}

export function VisualHealthScoreHero({
  avgBloating,
  totalMeals,
  lowBloatingCount,
  highBloatingCount = 0
}: VisualHealthScoreHeroProps) {
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

  const { level, ringColor, textColor } = useMemo(() => {
    if (healthScore >= 70) {
      return {
        level: 'Excellent',
        ringColor: '#10b981', // Green
        textColor: 'text-primary',
      };
    } else if (healthScore >= 41) {
      return {
        level: 'Good Progress',
        ringColor: '#f97316', // Orange
        textColor: 'text-peach',
      };
    } else {
      return {
        level: 'Keep Going',
        ringColor: '#ef4444', // Red
        textColor: 'text-coral',
      };
    }
  }, [healthScore]);

  const chartData = [
    {
      name: 'Health Score',
      value: healthScore,
      fill: ringColor,
    },
  ];

  return (
    <div className="premium-card p-8 shadow-sm rounded-xl">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Your Bloat Health Score</h1>
        <p className="text-sm text-muted-foreground mt-1">Your digestive wellness at a glance</p>
      </div>

      {/* Radial Chart - The North Star */}
      <div className="relative mb-6">
        <ResponsiveContainer width="100%" height={240}>
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
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={ringColor} stopOpacity={0.8} />
                <stop offset="100%" stopColor={ringColor} stopOpacity={1} />
              </linearGradient>
            </defs>

            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />

            <RadialBar
              background={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
              dataKey="value"
              cornerRadius={10}
              fill="url(#scoreGradient)"
              animationDuration={2000}
              animationBegin={100}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-7xl font-bold mb-2 transition-all duration-500"
            style={{ color: ringColor }}
          >
            {healthScore}
          </div>
          <div className="text-sm text-muted-foreground font-medium mb-1">out of 100</div>
          <div
            className={`text-base font-semibold ${textColor}`}
          >
            {level}
          </div>
        </div>
      </div>

      {/* Simple description below */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Based on {totalMeals} rated meals • {lowBloatingCount} comfortable • {highBloatingCount} challenging
        </p>
      </div>
    </div>
  );
}
