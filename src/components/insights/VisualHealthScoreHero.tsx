import { useMemo } from 'react';
import { AnimatedStomachCharacter } from './AnimatedStomachCharacter';

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

  return (
    <div className="premium-card p-6 shadow-sm rounded-xl">
      {/* Animated Stomach Character - Main Focus */}
      <div className="relative flex flex-col items-center">
        <AnimatedStomachCharacter healthScore={healthScore} ringColor={ringColor} />

        {/* Clean Score Display */}
        <div className="flex items-baseline gap-2 mt-4">
          <div
            className="text-6xl font-bold transition-all duration-500"
            style={{ color: ringColor }}
          >
            {healthScore}
          </div>
          <div className="text-2xl text-muted-foreground font-medium">/100</div>
        </div>

        {/* Status Text */}
        <div
          className={`text-lg font-semibold mt-2 ${textColor}`}
        >
          {level}
        </div>
      </div>
    </div>
  );
}
