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

  // Get gradient CSS for score text
  const getScoreGradient = () => {
    if (healthScore >= 70) {
      return 'bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-300';
    } else if (healthScore >= 31) {
      return 'bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400';
    } else {
      return 'bg-gradient-to-br from-red-500 via-orange-500 to-orange-400';
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl rounded-3xl border border-gray-100/50 p-10 transition-all duration-500"
      style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Your Bloat Health Score
        </h1>
        <p className="text-base text-gray-600 mt-3 font-medium">
          {insight}
        </p>
      </div>

      {/* Circular Score Visualization with Character */}
      <div className="flex flex-col items-center justify-center mb-10">
        <CircularScoreRing score={healthScore} size={340} strokeWidth={36}>
          <AnimatedStomachCharacter healthScore={healthScore} />
        </CircularScoreRing>
      </div>

      {/* Score and State Display */}
      <div className="flex flex-col items-center justify-center space-y-4 mb-8">
        <div className="flex items-baseline gap-3">
          <span
            className={`text-7xl font-extrabold tracking-tight ${getScoreGradient()} bg-clip-text text-transparent transition-all duration-500`}
            style={{
              textShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            {healthScore}
          </span>
          <span className="text-xl text-gray-400 font-medium">/100</span>
        </div>
        <div className={`text-lg font-bold tracking-widest ${textColor} uppercase transition-all duration-500`}
          style={{
            letterSpacing: '0.15em',
          }}
        >
          {level}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-6 border-t border-gray-200/60">
        <span className="font-medium">{totalMeals} meals tracked</span>
        <span className="text-gray-300">•</span>
        <span className="font-medium">{lowBloatingCount} comfortable</span>
        <span className="text-gray-300">•</span>
        <span className="font-medium">{highBloatingCount} challenging</span>
      </div>
    </div>
  );
}
