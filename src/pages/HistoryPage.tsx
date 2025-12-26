import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MoreVertical, Clock, CheckCircle2, Flame, Edit3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { EditMealModal } from '@/components/meals/EditMealModal';
import { useMeals } from '@/contexts/MealContext';
import { useToast } from '@/hooks/use-toast';
import { MealEntry, RATING_LABELS, RATING_EMOJIS, getTriggerCategory } from '@/types';
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FilterType = 'all' | 'high-bloating' | 'this-week';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { entries, deleteEntry, updateRating, skipRating } = useMeals();
  const { toast } = useToast();

  const [filter, setFilter] = useState<FilterType>('all');
  const [ratingEntry, setRatingEntry] = useState<MealEntry | null>(null);
  const [editEntry, setEditEntry] = useState<MealEntry | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const thisWeekEntries = entries.filter(e => isAfter(new Date(e.created_at), weekAgo));
    const highBloatingEntries = entries.filter(e => e.bloating_rating && e.bloating_rating >= 4);
    
    const weeklyRated = thisWeekEntries.filter(e => e.bloating_rating);
    const weeklyAvg = weeklyRated.length > 0 
      ? weeklyRated.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / weeklyRated.length 
      : 0;

    // Find most common trigger
    const triggerCounts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        triggerCounts[trigger.category] = (triggerCounts[trigger.category] || 0) + 1;
      });
    });
    const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      thisWeekCount: thisWeekEntries.length,
      highBloatingCount: highBloatingEntries.length,
      weeklyAvg,
      topTrigger: topTrigger ? { category: topTrigger[0], count: topTrigger[1] } : null,
    };
  }, [entries]);

  // Calculate user average for comparison
  const userAvg = useMemo(() => {
    const rated = entries.filter(e => e.bloating_rating);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / rated.length;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let filtered = [...entries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (filter === 'high-bloating') {
      filtered = filtered.filter((e) => e.bloating_rating && e.bloating_rating >= 4);
    } else if (filter === 'this-week') {
      const weekAgo = subDays(new Date(), 7);
      filtered = filtered.filter((e) => isAfter(new Date(e.created_at), weekAgo));
    }

    return filtered;
  }, [entries, filter]);

  const handleDelete = async (id: string, description: string) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;

    await deleteEntry(id);
    toast({
      title: 'Entry deleted',
      description: `"${description}" has been removed.`,
    });
  };

  const handleRate = async (rating: number) => {
    if (!ratingEntry) return;
    await updateRating(ratingEntry.id, rating);
    toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
    setRatingEntry(null);
  };

  const handleSkip = async () => {
    if (!ratingEntry) return;
    await skipRating(ratingEntry.id);
    toast({ title: 'Rating skipped' });
    setRatingEntry(null);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-lavender/10 to-mint/10">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-5 w-32 h-32 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-5 pb-32 max-w-lg mx-auto space-y-5">
          {/* Header */}
          <header className="pt-2 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {entries.length} meal{entries.length !== 1 ? 's' : ''} logged
            </p>
          </header>

          {/* Quick Stats Banner */}
          {entries.length >= 3 && (
            <div 
              className="glass-card p-4 flex gap-4 animate-slide-up opacity-0"
              style={{ animationDelay: '25ms', animationFillMode: 'forwards' }}
            >
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">Avg This Week</p>
                <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                  {stats.weeklyAvg > 0 ? (
                    <>
                      <span className="text-base">{stats.weeklyAvg <= 2 ? '😊' : stats.weeklyAvg >= 4 ? '😣' : '😐'}</span>
                      {stats.weeklyAvg.toFixed(1)}/5
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">No data</span>
                  )}
                </p>
              </div>
              <div className="w-px bg-border" />
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">Top Trigger</p>
                {stats.topTrigger ? (
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getTriggerCategory(stats.topTrigger.category)?.color }}
                    />
                    <span className="text-sm font-bold text-foreground truncate">
                      {getTriggerCategory(stats.topTrigger.category)?.displayName?.split(' - ')[1] || 
                       getTriggerCategory(stats.topTrigger.category)?.displayName}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None yet</p>
                )}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div 
            className="glass-card p-1.5 flex gap-1.5 animate-slide-up opacity-0" 
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-primary to-sage-dark text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              style={filter === 'all' ? { boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)' } : undefined}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setFilter('high-bloating')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                filter === 'high-bloating'
                  ? 'bg-gradient-to-r from-primary to-sage-dark text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              style={filter === 'high-bloating' ? { boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)' } : undefined}
            >
              <span className="flex items-center justify-center gap-1">
                <Flame className="w-3 h-3" />
                High ({stats.highBloatingCount})
              </span>
            </button>
            <button
              onClick={() => setFilter('this-week')}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                filter === 'this-week'
                  ? 'bg-gradient-to-r from-primary to-sage-dark text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              style={filter === 'this-week' ? { boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)' } : undefined}
            >
              This Week ({stats.thisWeekCount})
            </button>
          </div>

          {/* Entry List */}
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                userAvg={userAvg}
                onRate={() => setRatingEntry(entry)}
                onEdit={() => setEditEntry(entry)}
                onDelete={() => handleDelete(entry.id, entry.meal_description)}
                delay={100 + index * 50}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredEntries.length === 0 && (
            <div 
              className="glass-card text-center py-16 space-y-4 animate-slide-up opacity-0"
              style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                <span className="text-4xl">
                  {filter === 'all' && '📝'}
                  {filter === 'high-bloating' && '🎉'}
                  {filter === 'this-week' && '📅'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  {filter === 'all' && 'No entries yet'}
                  {filter === 'high-bloating' && 'No high bloating meals!'}
                  {filter === 'this-week' && 'No meals this week'}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {filter === 'all' && 'Start logging meals to track your bloating patterns.'}
                  {filter === 'high-bloating' && "Great news! You haven't had any high-bloating meals."}
                  {filter === 'this-week' && 'Log some meals to see them here.'}
                </p>
              </div>
              {filter === 'all' && (
                <Button
                  onClick={() => navigate('/add-entry')}
                  className="mt-4 bg-gradient-to-r from-primary to-sage-dark text-primary-foreground rounded-full px-8 py-6 font-semibold shadow-lg"
                  style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.35)' }}
                >
                  Log Your First Meal
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={!!ratingEntry} onOpenChange={() => setRatingEntry(null)}>
        <DialogContent className="max-w-sm mx-auto bg-card/95 backdrop-blur-xl border-border/50 rounded-3xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold">Rate Your Meal</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              How did <span className="font-medium text-foreground">{ratingEntry?.meal_description}</span> make you feel?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RatingScale value={null} onChange={handleRate} size="lg" />
          </div>
          <button onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground py-3 rounded-xl transition-colors hover:bg-muted/30">
            Skip for now
          </button>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <EditMealModal
        entry={editEntry}
        open={!!editEntry}
        onClose={() => setEditEntry(null)}
      />
    </AppLayout>
  );
}

function EntryCard({
  entry,
  userAvg,
  onRate,
  onEdit,
  onDelete,
  delay = 0,
}: {
  entry: MealEntry;
  userAvg: number;
  onRate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  delay?: number;
}) {
  const isPending = entry.rating_status === 'pending';
  const isHighBloating = entry.bloating_rating && entry.bloating_rating >= 4;
  const isAboveAvg = entry.bloating_rating && userAvg > 0 && entry.bloating_rating > userAvg + 0.5;

  return (
    <div 
      className={`glass-card overflow-hidden animate-slide-up opacity-0 ${
        isPending ? 'ring-2 ring-coral/30 ring-offset-2 ring-offset-background' : ''
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Photo */}
          {entry.photo_url ? (
            <img
              src={entry.photo_url}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center text-3xl flex-shrink-0">
              🍽️
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground line-clamp-2 leading-tight">
                  {entry.meal_description}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                </p>
              </div>

              {/* BIGGER Bloating Rating */}
              {entry.bloating_rating && (
                <div className={`flex flex-col items-center px-3 py-2 rounded-xl ${
                  entry.bloating_rating <= 2 
                    ? 'bg-primary/15' 
                    : entry.bloating_rating >= 4 
                      ? 'bg-coral/15' 
                      : 'bg-muted/50'
                }`}>
                  <span className="text-2xl">{RATING_EMOJIS[entry.bloating_rating]}</span>
                  <span className={`text-sm font-bold ${
                    entry.bloating_rating <= 2 
                      ? 'text-primary' 
                      : entry.bloating_rating >= 4 
                        ? 'text-coral' 
                        : 'text-foreground'
                  }`}>
                    {entry.bloating_rating}/5
                  </span>
                  <span className="text-2xs text-muted-foreground">{RATING_LABELS[entry.bloating_rating]}</span>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 rounded-xl hover:bg-muted/50">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={onEdit} className="rounded-lg">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive rounded-lg">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Triggers */}
            {entry.detected_triggers && entry.detected_triggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {entry.detected_triggers.slice(0, 3).map((trigger, i) => {
                  const categoryInfo = getTriggerCategory(trigger.category);
                  return (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: `${categoryInfo?.color}15`,
                        color: categoryInfo?.color,
                        border: `1px solid ${categoryInfo?.color}30`
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryInfo?.color }} />
                      {trigger.food || categoryInfo?.displayName?.split(' - ')[1] || categoryInfo?.displayName}
                    </span>
                  );
                })}
                {entry.detected_triggers.length > 3 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                    +{entry.detected_triggers.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Above Average Warning */}
            {isAboveAvg && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-coral">
                <TrendingUp className="w-3 h-3" />
                <span>{Math.round(((entry.bloating_rating! - userAvg) / userAvg) * 100)}% above your average</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Footer */}
      {!entry.bloating_rating && isPending && (
        <div className="px-4 py-3 border-t bg-gradient-to-r from-coral/10 to-peach/10 border-coral/20">
          <button
            onClick={onRate}
            className="flex items-center gap-2 text-sm font-semibold text-coral hover:text-coral/80 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Rate Now — How do you feel?
          </button>
        </div>
      )}
    </div>
  );
}
