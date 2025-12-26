import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { TriggerChip } from '@/components/shared/TriggerChip';
import { useMeals } from '@/contexts/MealContext';
import { useToast } from '@/hooks/use-toast';
import { MealEntry, RATING_LABELS } from '@/types';
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
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">History</h1>
            {pendingCount > 0 && (
              <p className="text-sm text-coral">
                {pendingCount} meal{pendingCount !== 1 ? 's' : ''} need rating
              </p>
            )}
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          {(['all', 'pending', 'completed'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-card text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'all' && 'All'}
              {type === 'pending' && `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}`}
              {type === 'completed' && 'Completed'}
            </button>
          ))}
        </div>

        {/* Entry List */}
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onRate={() => setRatingEntry(entry)}
              onDelete={() => handleDelete(entry.id, entry.meal_description)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="text-5xl">📝</div>
            <h3 className="font-semibold text-foreground">
              {filter === 'all' && 'No entries yet'}
              {filter === 'pending' && 'No pending ratings'}
              {filter === 'completed' && 'No completed ratings'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all' && 'Start logging meals to track your bloating patterns.'}
              {filter === 'pending' && "You're all caught up!"}
              {filter === 'completed' && 'Complete some ratings to see them here.'}
            </p>
            {filter === 'all' && (
              <Button
                variant="sage"
                onClick={() => navigate('/add-entry')}
                className="mt-4"
              >
                Log Your First Meal
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={!!ratingEntry} onOpenChange={() => setRatingEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate this meal</DialogTitle>
            <DialogDescription>
              How did {ratingEntry?.meal_description} make you feel?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RatingScale value={null} onChange={handleRate} size="lg" />
          </div>
          <button
            onClick={handleSkip}
            className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
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
}: {
  entry: MealEntry;
  onRate: () => void;
  onDelete: () => void;
}) {
  const isPending = entry.rating_status === 'pending';

  return (
    <Card variant={isPending ? 'pending' : 'elevated'}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Photo */}
          {entry.photo_url ? (
            <img
              src={entry.photo_url}
              alt=""
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
              🍽️
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground line-clamp-1">
                  {entry.meal_description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.created_at), 'MMM d, h:mm a')} ·{' '}
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 text-xs bg-muted rounded-full capitalize">
                {entry.portion_size}
              </span>
              <span className="px-2 py-0.5 text-xs bg-muted rounded-full capitalize">
                {entry.eating_speed}
              </span>
              <span className="px-2 py-0.5 text-xs bg-muted rounded-full capitalize">
                {entry.social_setting === 'with_others' ? 'With others' : 'Solo'}
              </span>
            </div>

            {/* Triggers */}
            {entry.detected_triggers && entry.detected_triggers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.detected_triggers.map((trigger, i) => (
                  <TriggerChip
                    key={i}
                    category={trigger.category}
                    food={trigger.food}
                    size="sm"
                  />
                ))}
              </div>
            )}

            {/* Rating or Rate Button */}
            <div className="mt-3">
              {entry.bloating_rating ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">
                    {entry.bloating_rating <= 2 ? '😊' : entry.bloating_rating >= 4 ? '😣' : '😐'}
                  </span>
                  <span className="text-muted-foreground">
                    Bloating: <span className="font-medium text-foreground">{entry.bloating_rating}/5</span> - {RATING_LABELS[entry.bloating_rating]}
                  </span>
                </div>
              ) : isPending ? (
                <Button variant="coral" size="sm" onClick={onRate}>
                  ⏰ Rate Now
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Skipped</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
