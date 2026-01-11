import { Utensils, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface KeyStatsRowProps {
  ratedMeals: number;
  currentStreak: number;
  improvementPercentage: number;
}

export function KeyStatsRow({ ratedMeals, currentStreak, improvementPercentage }: KeyStatsRowProps) {
  const isImproving = improvementPercentage > 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Rated Meals */}
      <div className="premium-card p-5 text-center shadow-sm rounded-xl hover:shadow-md transition-all">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="text-4xl font-bold text-foreground mb-1">{ratedMeals}</div>
        <div className="text-xs text-muted-foreground font-medium">Rated Meals</div>
      </div>

      {/* Current Streak */}
      <div className="premium-card p-5 text-center shadow-sm rounded-xl hover:shadow-md transition-all">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-peach/20 to-peach/10">
            <Award className="w-6 h-6 text-peach" />
          </div>
        </div>
        <div className="text-4xl font-bold text-foreground mb-1">{currentStreak}</div>
        <div className="text-xs text-muted-foreground font-medium">Current Streak</div>
      </div>

      {/* 14-Day Progress */}
      <div className="premium-card p-5 text-center shadow-sm rounded-xl hover:shadow-md transition-all">
        <div className="flex justify-center mb-3">
          <div className={`p-3 rounded-full bg-gradient-to-br ${
            isImproving ? 'from-primary/20 to-primary/10' : 'from-coral/20 to-coral/10'
          }`}>
            {isImproving ? (
              <TrendingUp className="w-6 h-6 text-primary" />
            ) : (
              <TrendingDown className="w-6 h-6 text-coral" />
            )}
          </div>
        </div>
        <div className={`text-4xl font-bold mb-1 ${
          isImproving ? 'text-primary' : 'text-coral'
        }`}>
          {improvementPercentage > 0 ? '+' : ''}{improvementPercentage}%
        </div>
        <div className="text-xs text-muted-foreground font-medium">14-Day Progress</div>
      </div>
    </div>
  );
}
