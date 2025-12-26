import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMeals } from '@/contexts/MealContext';
import { TRIGGER_DISPLAY } from '@/types';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { entries, getCompletedCount } = useMeals();
  const completedCount = getCompletedCount();
  const neededForInsights = 5;
  const hasEnoughData = completedCount >= neededForInsights;

  const insights = useMemo(() => {
    const completedEntries = entries.filter(e => e.rating_status === 'completed');
    if (completedEntries.length < 5) return null;

    const avgBloating = completedEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / completedEntries.length;
    const triggerStats: Record<string, { count: number; totalBloating: number; foods: Set<string> }> = {};
    
    completedEntries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        if (!triggerStats[trigger.category]) {
          triggerStats[trigger.category] = { count: 0, totalBloating: 0, foods: new Set() };
        }
        triggerStats[trigger.category].count++;
        triggerStats[trigger.category].totalBloating += entry.bloating_rating || 0;
        triggerStats[trigger.category].foods.add(trigger.food);
      });
    });

    const triggerRankings = Object.entries(triggerStats)
      .map(([category, stats]) => ({
        category,
        avgBloating: stats.totalBloating / stats.count,
        frequency: stats.count,
        foods: Array.from(stats.foods),
      }))
      .sort((a, b) => b.avgBloating - a.avgBloating)
      .slice(0, 5);

    const goodDays = completedEntries.filter(e => (e.bloating_rating || 0) <= 2).length;

    return { avgBloating, triggerRankings, goodDays, totalMeals: completedEntries.length };
  }, [entries]);

  if (!hasEnoughData) {
    return (
      <AppLayout>
        <div className="p-4 pt-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Insights</h1>
            <p className="text-muted-foreground">Your personalized bloating analysis</p>
          </header>

          <Card variant="elevated" className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-2">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Insights Coming Soon!</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Rate {neededForInsights - completedCount} more meal{neededForInsights - completedCount !== 1 ? 's' : ''} to unlock your personalized bloating analysis.
              </p>
              <div className="max-w-xs mx-auto mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{completedCount}/{neededForInsights}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${(completedCount / neededForInsights) * 100}%` }} />
                </div>
              </div>
              <Button variant="sage" className="mt-6" onClick={() => navigate('/add-entry')}>Log a Meal</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        <header className="pt-2">
          <h1 className="text-2xl font-bold text-foreground">Your Insights</h1>
          <p className="text-muted-foreground">Based on {insights?.totalMeals} rated meals</p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <Card variant="elevated" className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {(insights?.avgBloating || 0) <= 2.5 ? <TrendingDown className="w-4 h-4 text-primary" /> : <TrendingUp className="w-4 h-4 text-coral" />}
              <span className="text-sm text-muted-foreground">Avg Bloating</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{insights?.avgBloating.toFixed(1)}/5</div>
          </Card>
          <Card variant="elevated" className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Good Days</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{insights?.goodDays}</div>
          </Card>
        </div>

        {insights?.triggerRankings && insights.triggerRankings.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-coral" /> Your Top Triggers
            </h2>
            <div className="space-y-2">
              {insights.triggerRankings.map((trigger, index) => {
                const display = TRIGGER_DISPLAY[trigger.category] || { name: trigger.category };
                return (
                  <Card key={trigger.category} variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-sm font-bold text-coral">{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{display.name}</p>
                        <p className="text-xs text-muted-foreground">{trigger.foods.slice(0, 3).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{trigger.avgBloating.toFixed(1)}/5</p>
                        <p className="text-xs text-muted-foreground">avg bloating</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        <Card variant="success" className="p-4">
          <h3 className="font-semibold text-foreground mb-2">💡 Quick Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span>Keep logging meals to improve accuracy</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span>Try eliminating your top trigger for a week</span></li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}
