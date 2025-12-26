import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MoreVertical, Clock, CheckCircle2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { useMeals } from '@/contexts/MealContext';
import { useToast } from '@/hooks/use-toast';
import { MealEntry, RATING_LABELS, getTriggerCategory } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
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

type FilterType = 'all' | 'pending' | 'completed';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { entries, deleteEntry, updateRating, skipRating } = useMeals();
  const { toast } = useToast();

  const [filter, setFilter] = useState<FilterType>('all');
  const [ratingEntry, setRatingEntry] = useState<MealEntry | null>(null);

  const filteredEntries = useMemo(() => {
    let filtered = [...entries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (filter === 'pending') {
      filtered = filtered.filter((e) => e.rating_status === 'pending');
    } else if (filter === 'completed') {
      filtered = filtered.filter((e) => e.rating_status === 'completed');
    }

    return filtered;
  }, [entries, filter]);

  const pendingCount = entries.filter((e) => e.rating_status === 'pending').length;

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
    toast({
      title: 'Rating saved!',
      description: `You rated "${ratingEntry.meal_description}" as ${RATING_LABELS[rating].toLowerCase()}.`,
    });
    setRatingEntry(null);
  };

  const handleSkip = async () => {
    if (!ratingEntry) return;
    await skipRating(ratingEntry.id);
    toast({
      title: 'Rating skipped',
    });
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">History</h1>
                {pendingCount > 0 && (
                  <p className="text-sm text-coral font-medium flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4" />
                    {pendingCount} meal{pendingCount !== 1 ? 's' : ''} need rating
                  </p>
                )}
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Filter className="w-5 h-5 text-primary" />
              </div>
            </div>
          </header>

          {/* Premium Filter Tabs */}
          <div 
            className="glass-card p-1.5 flex gap-1.5 animate-slide-up opacity-0" 
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            {(['all', 'pending', 'completed'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === type
                    ? 'bg-gradient-to-r from-primary to-sage-dark text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                style={filter === type ? {
                  boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)'
                } : undefined}
              >
                {type === 'all' && 'All'}
                {type === 'pending' && (
                  <span className="flex items-center justify-center gap-1.5">
                    Pending
                    {pendingCount > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        filter === type 
                          ? 'bg-primary-foreground/20 text-primary-foreground' 
                          : 'bg-coral/20 text-coral'
                      }`}>
                        {pendingCount}
                      </span>
                    )}
                  </span>
                )}
                {type === 'completed' && (
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Done
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Entry List */}
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onRate={() => setRatingEntry(entry)}
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
                  {filter === 'pending' && '🎉'}
                  {filter === 'completed' && '📊'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  {filter === 'all' && 'No entries yet'}
                  {filter === 'pending' && 'All caught up!'}
                  {filter === 'completed' && 'No completed ratings'}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {filter === 'all' && 'Start logging meals to track your bloating patterns.'}
                  {filter === 'pending' && "You've rated all your meals. Great job!"}
                  {filter === 'completed' && 'Complete some ratings to see them here.'}
                </p>
              </div>
              {filter === 'all' && (
                <Button
                  onClick={() => navigate('/add-entry')}
                  className="mt-4 bg-gradient-to-r from-primary to-sage-dark text-primary-foreground rounded-full px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.35)' }}
                >
                  Log Your First Meal
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating Dialog - Premium Glass Style */}
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
          <button
            onClick={handleSkip}
            className="w-full text-sm text-muted-foreground hover:text-foreground py-3 rounded-xl transition-colors hover:bg-muted/30"
          >
            Skip for now
          </button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function EntryCard({
  entry,
  onRate,
  onDelete,
  delay = 0,
}: {
  entry: MealEntry;
  onRate: () => void;
  onDelete: () => void;
  delay?: number;
}) {
  const isPending = entry.rating_status === 'pending';

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
                  {format(new Date(entry.created_at), 'MMM d, h:mm a')} · {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 rounded-xl hover:bg-muted/50">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={onDelete} className="text-destructive rounded-lg">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Triggers - Premium Pills */}
            {entry.detected_triggers && entry.detected_triggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {entry.detected_triggers.slice(0, 3).map((trigger, i) => {
                  const categoryInfo = getTriggerCategory(trigger.category);
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5"
                      style={{
                        backgroundColor: `${categoryInfo?.color}15`,
                        color: categoryInfo?.color,
                        border: `1px solid ${categoryInfo?.color}30`
                      }}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: categoryInfo?.color }}
                      />
                      {trigger.food || categoryInfo?.displayName}
                    </span>
                  );
                })}
                {entry.detected_triggers.length > 3 && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                    +{entry.detected_triggers.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Footer */}
      <div className={`px-4 py-3 border-t ${
        isPending 
          ? 'bg-gradient-to-r from-coral/10 to-peach/10 border-coral/20' 
          : 'bg-muted/20 border-border/30'
      }`}>
        {entry.bloating_rating ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">
              {entry.bloating_rating <= 2 ? '😊' : entry.bloating_rating >= 4 ? '😣' : '😐'}
            </span>
            <span className="text-muted-foreground">
              Bloating: <span className="font-bold text-foreground">{entry.bloating_rating}/5</span>
              <span className="text-muted-foreground"> — {RATING_LABELS[entry.bloating_rating]}</span>
            </span>
          </div>
        ) : isPending ? (
          <button
            onClick={onRate}
            className="flex items-center gap-2 text-sm font-semibold text-coral hover:text-coral/80 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Rate Now — How do you feel?
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Rating skipped</span>
        )}
      </div>
    </div>
  );
}
