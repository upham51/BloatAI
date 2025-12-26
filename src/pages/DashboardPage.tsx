import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, LogOut, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { TriggerChip } from '@/components/shared/TriggerChip';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { RATING_LABELS, MealEntry } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getPendingEntry, getRecentEntries, getTotalCount, getCompletedCount, updateRating, skipRating } = useMeals();
  const { toast } = useToast();

  const pendingEntry = getPendingEntry();
  const recentEntries = getRecentEntries(3);
  const totalCount = getTotalCount();
  const completedCount = getCompletedCount();

  const firstName = user?.display_name?.split(' ')[0] || 'there';

  const handleRate = async (rating: number) => {
    if (!pendingEntry) return;
    await updateRating(pendingEntry.id, rating);
    toast({
      title: 'Rating saved!',
      description: `You rated "${pendingEntry.meal_description}" as ${RATING_LABELS[rating].toLowerCase()}.`,
    });
  };

  const handleSkip = async () => {
    if (!pendingEntry) return;
    await skipRating(pendingEntry.id);
    toast({
      title: 'Rating skipped',
      description: 'You can still rate this meal from your history.',
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {firstName}!
            </h1>
            <p className="text-muted-foreground">{formatDate(new Date())}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        {/* Pending Rating Card */}
        {pendingEntry && (
          <Card variant="pending" className="animate-scale-in">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <span className="text-xl">⏰</span>
                <CardTitle className="text-base text-coral">How did this make you feel?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-foreground">{pendingEntry.meal_description}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(pendingEntry.created_at), { addSuffix: true })}
                </p>
              </div>
              
              <RatingScale value={null} onChange={handleRate} />
              
              <button
                onClick={handleSkip}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip for now
              </button>
            </CardContent>
          </Card>
        )}

        {/* Primary Action */}
        <Button
          variant="sage"
          size="xl"
          className="w-full shadow-elevated"
          onClick={() => navigate('/add-entry')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Log New Meal
        </Button>

        {/* Stats Row */}
        {totalCount > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card variant="elevated" className="p-4">
              <div className="text-2xl font-bold text-foreground">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Meals logged</div>
            </Card>
            <Card variant="elevated" className="p-4">
              <div className="text-2xl font-bold text-primary">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Rated meals</div>
            </Card>
          </div>
        )}

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Meals</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
                className="text-primary"
              >
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <EntryPreviewCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Insights Teaser */}
        {completedCount >= 5 ? (
          <Card
            variant="success"
            className="cursor-pointer hover:shadow-medium transition-shadow"
            onClick={() => navigate('/insights')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Your Insights are Ready!</h3>
                <p className="text-sm text-muted-foreground">
                  View your personalized bloating analysis
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <Card variant="muted" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Unlock Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Rate {5 - completedCount} more meal{5 - completedCount !== 1 ? 's' : ''} to see patterns
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </Card>
        )}

        {/* Empty State */}
        {totalCount === 0 && (
          <div className="text-center py-8 space-y-3 animate-fade-in">
            <div className="text-5xl">🥗</div>
            <h3 className="font-semibold text-foreground">No meals logged yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Start tracking your meals to discover your unique bloating triggers
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function EntryPreviewCard({ entry }: { entry: MealEntry }) {
  const isPending = entry.rating_status === 'pending';

  return (
    <Card variant={isPending ? 'pending' : 'elevated'} className="p-3">
      <div className="flex items-center gap-3">
        {entry.photo_url ? (
          <img
            src={entry.photo_url}
            alt=""
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
            🍽️
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{entry.meal_description}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
          </p>
        </div>
        
        {entry.bloating_rating && (
          <div className="text-right">
            <div className="text-lg">{entry.bloating_rating <= 2 ? '😊' : entry.bloating_rating >= 4 ? '😣' : '😐'}</div>
            <div className="text-xs text-muted-foreground">{entry.bloating_rating}/5</div>
          </div>
        )}
        
        {isPending && (
          <span className="px-2 py-1 text-xs font-medium bg-coral/20 text-coral rounded-full">
            Rate
          </span>
        )}
      </div>
      
      {entry.detected_triggers && entry.detected_triggers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.detected_triggers.slice(0, 3).map((trigger, i) => (
            <TriggerChip
              key={i}
              category={trigger.category}
              food={trigger.food}
              size="sm"
            />
          ))}
          {entry.detected_triggers.length > 3 && (
            <span className="text-xs text-muted-foreground px-2 py-0.5">
              +{entry.detected_triggers.length - 3} more
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
