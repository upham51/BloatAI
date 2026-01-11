import { useMemo } from 'react';
import { AnimatedStomachCharacter } from './AnimatedStomachCharacter';
import { CircularScoreRing } from './CircularScoreRing';

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

  const { level, stateLabel, insight, textColor } = useMemo(() => {
    if (healthScore >= 70) {
      return {
        level: 'Optimal',
        stateLabel: 'Excellent Health',
        insight: 'Your digestion is functioning optimally',
        textColor: 'text-emerald-600',
      };
    } else if (healthScore >= 31) {
      return {
        level: 'Moderate',
        stateLabel: 'Good Progress',
        insight: 'Your digestion is under moderate strain',
        textColor: 'text-amber-600',
      };
    } else {
      return {
        level: 'Strained',
        stateLabel: 'Needs Attention',
        insight: 'Your digestion needs focused care',
        textColor: 'text-red-600',
      };
    }
  }, [healthScore]);

  return (
    <div
      className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100/50 p-8 transition-all duration-500"
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Your Bloat Health Score
        </h1>
        <p className="text-sm text-gray-600 mt-2 font-medium">
          {insight}
        </p>
      </div>

      {/* Circular Score Visualization with Character */}
      <div className="flex flex-col items-center justify-center mb-8">
        <CircularScoreRing score={healthScore} size={280} strokeWidth={8}>
          <AnimatedStomachCharacter healthScore={healthScore} />
        </CircularScoreRing>
      </div>

      {/* Score and State Display */}
      <div className="flex flex-col items-center justify-center space-y-3 mb-6">
        <div className="flex items-baseline gap-2">
          <span className={`text-6xl font-bold tracking-tight ${textColor} transition-all duration-500`}>
            {healthScore}
          </span>
          <span className="text-lg text-gray-400 font-medium">/100</span>
        </div>
        <div className={`text-base font-semibold tracking-wide ${textColor} uppercase`}>
          {level}
        </div>
        <div className="text-sm text-gray-500">
          {stateLabel}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
        <span className="font-medium">{totalMeals} meals tracked</span>
        <span className="text-gray-300">•</span>
        <span className="font-medium">{lowBloatingCount} comfortable</span>
        <span className="text-gray-300">•</span>
        <span className="font-medium">{highBloatingCount} challenging</span>
      </div>
    </div>
  );
}
