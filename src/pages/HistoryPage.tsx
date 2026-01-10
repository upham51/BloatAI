import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MoreVertical, Clock, Flame, Edit3, TrendingUp, Pencil, X, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { EmptyState } from '@/components/shared/EmptyState';
import { EditMealModal } from '@/components/meals/EditMealModal';
import { EditTitleModal } from '@/components/meals/EditTitleModal';
import { MealPhoto } from '@/components/meals/MealPhoto';
import { useMeals } from '@/contexts/MealContext';
import { useToast } from '@/hooks/use-toast';
import { MealEntry, RATING_LABELS, RATING_EMOJIS, getTriggerCategory, QUICK_NOTES } from '@/types';
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';
import { formatTriggerDisplay } from '@/lib/triggerUtils';
import { haptics } from '@/lib/haptics';
import { GrainTexture } from '@/components/ui/grain-texture';
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

type FilterType = 'all' | 'high-bloating' | 'this-week';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { entries, deleteEntry, updateRating, skipRating, updateEntry } = useMeals();
  const { toast } = useToast();

  const [filter, setFilter] = useState<FilterType>('all');
  const [ratingEntry, setRatingEntry] = useState<MealEntry | null>(null);
  const [editEntry, setEditEntry] = useState<MealEntry | null>(null);
  const [detailsEntry, setDetailsEntry] = useState<MealEntry | null>(null);
  const [editTitleEntry, setEditTitleEntry] = useState<MealEntry | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState('');

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

  // Group entries by date for cleaner organization
  const groupedEntries = useMemo(() => {
    const groups: { label: string; entries: MealEntry[] }[] = [];
    const today = new Date();
    const yesterday = subDays(today, 1);
    const weekAgo = subDays(today, 7);

    const todayEntries = filteredEntries.filter(e =>
      format(new Date(e.created_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    );
    const yesterdayEntries = filteredEntries.filter(e =>
      format(new Date(e.created_at), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
    );
    const thisWeekEntries = filteredEntries.filter(e => {
      const entryDate = new Date(e.created_at);
      return isAfter(entryDate, weekAgo) &&
             format(entryDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd') &&
             format(entryDate, 'yyyy-MM-dd') !== format(yesterday, 'yyyy-MM-dd');
    });
    const earlierEntries = filteredEntries.filter(e =>
      !isAfter(new Date(e.created_at), weekAgo)
    );

    if (todayEntries.length > 0) groups.push({ label: 'Today', entries: todayEntries });
    if (yesterdayEntries.length > 0) groups.push({ label: 'Yesterday', entries: yesterdayEntries });
    if (thisWeekEntries.length > 0) groups.push({ label: 'This Week', entries: thisWeekEntries });
    if (earlierEntries.length > 0) groups.push({ label: 'Earlier', entries: earlierEntries });

    return groups;
  }, [filteredEntries]);

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
    haptics.success();
    try {
      await updateRating(ratingEntry.id, rating);
      toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
      setRatingEntry(null);
    } catch (error) {
      console.error('Failed to save rating:', error);
      toast({
        title: 'Failed to save rating',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSkip = async () => {
    if (!ratingEntry) return;
    try {
      await skipRating(ratingEntry.id);
      toast({ title: 'Rating skipped' });
      setRatingEntry(null);
    } catch (error) {
      console.error('Failed to skip rating:', error);
      toast({
        title: 'Failed to skip rating',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!detailsEntry) return;
    await updateEntry(detailsEntry.id, { notes: notesInput.trim() || null });
    setDetailsEntry({ ...detailsEntry, notes: notesInput.trim() || undefined });
    setIsEditingNotes(false);
    toast({ title: 'Notes updated' });
  };

  const handleOpenDetails = (entry: MealEntry) => {
    setDetailsEntry(entry);
    setNotesInput(entry.notes || '');
    setIsEditingNotes(false);
  };

  const getMealDisplayTitle = (entry: MealEntry) => {
    return entry.custom_title || entry.meal_title || getQuickMealTitle(entry);
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-lavender/10 to-mint/10">
        <GrainTexture />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-5 w-32 h-32 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-5 pb-32 max-w-lg mx-auto space-y-5">
          {/* Header - Centered & Elevated */}
          <header className="text-center pt-6 pb-4 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">History</h1>
            <p className="text-sm text-muted-foreground/60 mt-1.5">
              {entries.length} meal{entries.length !== 1 ? 's' : ''} logged
            </p>
          </header>

          {/* Compact Stats - Side by side with icons */}
          {entries.length >= 3 && (
            <div
              className="flex gap-2 animate-slide-up opacity-0"
              style={{ animationDelay: '25ms', animationFillMode: 'forwards' }}
            >
              <div className="flex-1 premium-card p-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs text-muted-foreground/70">Week Avg</p>
                    <p className="text-sm font-bold text-foreground">
                      {stats.weeklyAvg > 0 ? `${stats.weeklyAvg.toFixed(1)}/5` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 premium-card p-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-coral flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs text-muted-foreground/70">Top Trigger</p>
                    {stats.topTrigger ? (
                      <p className="text-sm font-bold text-foreground truncate">
                        {getTriggerCategory(stats.topTrigger.category)?.displayName?.split(' - ')[1] ||
                         getTriggerCategory(stats.topTrigger.category)?.displayName || 'None'}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Pills - Minimal Style */}
          <div
            className="flex gap-1 justify-center animate-slide-up opacity-0"
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-3 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setFilter('high-bloating')}
              className={`py-2 px-3 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === 'high-bloating'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-1">
                High ({stats.highBloatingCount})
              </span>
            </button>
            <button
              onClick={() => setFilter('this-week')}
              className={`py-2 px-3 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === 'this-week'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Week ({stats.thisWeekCount})
            </button>
          </div>

          {/* Entry List - Grouped by Date */}
          <div className="space-y-6">
            {groupedEntries.map((group, groupIndex) => (
              <div key={group.label} className="space-y-3">
                {/* Date Header */}
                <div
                  className="flex items-center gap-3 animate-slide-up opacity-0"
                  style={{ animationDelay: `${100 + groupIndex * 30}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="h-px bg-border flex-1" />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </h2>
                  <div className="h-px bg-border flex-1" />
                </div>

                {/* Entries in this group */}
                <div className="space-y-2.5">
                  {group.entries.map((entry, entryIndex) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      userAvg={userAvg}
                      onRate={() => setRatingEntry(entry)}
                      onEdit={() => setEditEntry(entry)}
                      onDelete={() => handleDelete(entry.id, entry.meal_description)}
                      onViewDetails={() => handleOpenDetails(entry)}
                      onEditTitle={() => setEditTitleEntry(entry)}
                      delay={120 + groupIndex * 30 + entryIndex * 40}
                      isFirstPhoto={groupIndex === 0 && entryIndex === 0 && !!entry.photo_url}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEntries.length === 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
            >
              <EmptyState
                icon={filter === 'all' ? '📝' : filter === 'high-bloating' ? '🎉' : '📅'}
                title={
                  filter === 'all'
                    ? 'No entries yet'
                    : filter === 'high-bloating'
                    ? 'No high bloating meals!'
                    : 'No meals this week'
                }
                description={
                  filter === 'all'
                    ? 'Start logging meals to track your bloating patterns.'
                    : filter === 'high-bloating'
                    ? "Great news! You haven't had any high-bloating meals."
                    : 'Log some meals to see them here.'
                }
                actionLabel={filter === 'all' ? 'Log Your First Meal' : undefined}
                onAction={filter === 'all' ? () => navigate('/add-entry') : undefined}
              />
            </div>
          )}
        </div>
      </div>
      </PageTransition>

      {/* Rating Dialog */}
      <Dialog open={!!ratingEntry} onOpenChange={() => setRatingEntry(null)}>
        <DialogContent className="max-w-sm mx-auto bg-card/95 backdrop-blur-xl border-border/50 rounded-3xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold">How bloated?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              How did <span className="font-medium text-foreground">{ratingEntry?.meal_description}</span> make you feel?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 px-2">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(rating => {
                // Dynamic color scoring: 1-2 Green, 3 Amber, 4-5 Coral
                const getRatingColor = (r: number) => {
                  if (r <= 2) return 'border-primary bg-primary text-primary-foreground';
                  if (r === 3) return 'border-yellow-500 bg-yellow-500 text-white';
                  return 'border-coral bg-coral text-white';
                };

                return (
                  <button
                    key={rating}
                    onClick={() => handleRate(rating)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${getRatingColor(rating)}`}
                    style={{
                      boxShadow: rating <= 2
                        ? '0 8px 20px hsl(var(--primary) / 0.35)'
                        : rating === 3
                        ? '0 8px 20px rgba(234, 179, 8, 0.35)'
                        : '0 8px 20px hsl(var(--coral) / 0.35)'
                    }}
                  >
                    <span className="text-2xl font-bold">
                      {rating}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">
                      {RATING_LABELS[rating]}
                    </span>
                  </button>
                );
              })}
            </div>
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

      {/* Edit Title Modal */}
      {editTitleEntry && (
        <EditTitleModal
          isOpen={!!editTitleEntry}
          onClose={() => setEditTitleEntry(null)}
          currentTitle={getMealDisplayTitle(editTitleEntry)}
          currentEmoji={editTitleEntry.meal_emoji || '🍽️'}
          titleOptions={(editTitleEntry.title_options as string[]) || []}
          onSave={async (newTitle) => {
            await updateEntry(editTitleEntry.id, { custom_title: newTitle });
            toast({ title: 'Title updated' });
          }}
        />
      )}

      {/* Details Drawer */}
      <Drawer open={!!detailsEntry} onOpenChange={(open) => !open && setDetailsEntry(null)}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{detailsEntry?.meal_emoji || '🍽️'}</span>
              <DrawerTitle className="text-lg font-bold">
                {detailsEntry && getMealDisplayTitle(detailsEntry)}
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-xs text-muted-foreground">
              {detailsEntry && format(new Date(detailsEntry.created_at), 'EEEE, MMMM d, yyyy · h:mm a')}
              {detailsEntry?.entry_method === 'text' && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-2xs">
                  Text entry
                </span>
              )}
            </DrawerDescription>
          </DrawerHeader>
          
          {detailsEntry && (
            <div className="px-4 pb-8 space-y-5 overflow-y-auto">
              {/* Photo */}
              {detailsEntry.photo_url && (
                <MealPhoto
                  photoUrl={detailsEntry.photo_url}
                  className="w-full aspect-video object-cover rounded-2xl shadow-md"
                  priority={true}
                />
              )}
              
              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {detailsEntry.meal_description}
                </p>
              </div>
              
              {/* Rating */}
              {detailsEntry.bloating_rating && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30">
                  <span className="text-3xl">{RATING_EMOJIS[detailsEntry.bloating_rating]}</span>
                  <div>
                    <p className="font-bold text-foreground">{RATING_LABELS[detailsEntry.bloating_rating]}</p>
                    <p className="text-xs text-muted-foreground">Bloating: {detailsEntry.bloating_rating}/5</p>
                  </div>
                </div>
              )}
              
              {/* All Triggers */}
              {detailsEntry.detected_triggers && detailsEntry.detected_triggers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Detected Triggers ({detailsEntry.detected_triggers.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detailsEntry.detected_triggers.map((trigger, i) => {
                      const categoryInfo = getTriggerCategory(trigger.category);
                      return (
                        <span
                          key={i}
                          className="px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1.5"
                          style={{
                            backgroundColor: `${categoryInfo?.color}15`,
                            color: categoryInfo?.color,
                            border: `1px solid ${categoryInfo?.color}30`
                          }}
                        >
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: categoryInfo?.color }} 
                          />
                          {trigger.food || categoryInfo?.displayName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </h3>
                  {!isEditingNotes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs h-7"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      {detailsEntry.notes ? 'Edit' : 'Add'}
                    </Button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-3">
                    <Textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value.slice(0, 200))}
                      placeholder="How did you feel? Any context..."
                      className="min-h-[80px] rounded-xl resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {notesInput.length}/200 characters
                    </p>
                    
                    {/* Quick note chips */}
                    <div className="flex flex-wrap gap-2">
                      {QUICK_NOTES.map((note, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const newNotes = notesInput
                              ? `${notesInput}, ${note.label}`
                              : note.label;
                            setNotesInput(newNotes.slice(0, 200));
                          }}
                          className="px-3 py-1.5 text-xs rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-colors"
                        >
                          {note.emoji} {note.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingNotes(false);
                          setNotesInput(detailsEntry.notes || '');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        className="flex-1 bg-gradient-to-r from-primary to-sage-dark"
                      >
                        Save Notes
                      </Button>
                    </div>
                  </div>
                ) : detailsEntry.notes ? (
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground italic">
                      {detailsEntry.notes}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No notes added
                  </p>
                )}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}

// Inline Rating Component for pending entries
function InlineRating({ entryId }: { entryId: string }) {
  const { updateRating, skipRating } = useMeals();
  const { toast } = useToast();
  
  const handleRate = async (rating: number) => {
    haptics.success();
    try {
      await updateRating(entryId, rating);
      toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
    } catch (error) {
      console.error('Failed to save rating:', error);
      toast({
        title: 'Failed to save rating',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSkip = async () => {
    haptics.light();
    try {
      await skipRating(entryId);
      toast({ title: 'Rating skipped' });
    } catch (error) {
      console.error('Failed to skip rating:', error);
      toast({
        title: 'Failed to skip rating',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="px-4 py-4 border-t border-border/50 bg-muted/30">
      <p className="text-sm font-medium text-foreground mb-3">How did this meal make you feel?</p>
      <div className="flex justify-between gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => {
              haptics.light();
              handleRate(rating);
            }}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-primary/10 transition-colors"
          >
            <span className="text-2xl">{RATING_EMOJIS[rating]}</span>
            <span className="text-2xs text-muted-foreground">{RATING_LABELS[rating]}</span>
          </button>
        ))}
      </div>
      <button 
        onClick={handleSkip} 
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}

function getQuickMealTitle(entry: MealEntry) {
  // If user set a custom title, use it
  if (entry.custom_title) return entry.custom_title;
  
  // If AI generated a title, use it
  if (entry.meal_title) return entry.meal_title;

  const foods = Array.from(
    new Set((entry.detected_triggers || []).map(t => (t.food || '').trim()).filter(Boolean))
  );

  if (foods.length > 0) {
    return foods.slice(0, 3).join(' • ');
  }

  // Fallback: compress the AI prose into a short noun phrase
  const firstSentence = entry.meal_description.split(/[.!?\n]/)[0] || entry.meal_description;
  let s = firstSentence.trim().replace(/^"|"$/g, '');

  // Remove common verbose openers
  s = s
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/^(?:\w+\s+){0,3}(stack|bowl|plate|serving)\s+of\s+/i, '')
    .replace(/^(vibrant|hearty|delicious|generous|beautiful|tall)\s+/i, '');

  // Prefer the part before the first comma
  s = (s.split(',')[0] || s).trim();

  const words = s.split(/\s+/).filter(Boolean);
  const short = words.slice(0, 4).join(' ');
  return short.length > 0 ? short : 'Meal';
}

function EntryCard({
  entry,
  userAvg,
  onRate,
  onEdit,
  onDelete,
  onViewDetails,
  onEditTitle,
  delay = 0,
  isFirstPhoto = false,
}: {
  entry: MealEntry;
  userAvg: number;
  onRate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onEditTitle: () => void;
  delay?: number;
  isFirstPhoto?: boolean;
}) {
  const isPending = entry.rating_status === 'pending';
  const isHighBloating = entry.bloating_rating && entry.bloating_rating >= 4;
  const isAboveAvg = entry.bloating_rating && userAvg > 0 && entry.bloating_rating > userAvg + 0.5;

  const displayTitle = entry.custom_title || entry.meal_title || getQuickMealTitle(entry);
  const displayEmoji = entry.meal_emoji || '🍽️';

  return (
    <div
      className={`premium-card overflow-hidden animate-slide-up opacity-0 ${
        isPending ? 'ring-2 ring-coral/30 ring-offset-1 ring-offset-background' : ''
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Horizontal Card Layout - Image Left, Content Right */}
      <div className="flex gap-3 p-3">
        {/* Small Photo - Left Side (Fixed Size) */}
        {entry.photo_url ? (
          <MealPhoto
            photoUrl={entry.photo_url}
            onClick={onViewDetails}
            className="w-20 h-20 rounded-xl object-cover shadow-sm cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
            priority={isFirstPhoto}
          />
        ) : (
          <div
            onClick={onViewDetails}
            className="w-20 h-20 rounded-xl bg-muted/30 flex items-center justify-center text-2xl cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
          >
            {entry.entry_method === 'text' ? '✍️' : '🍽️'}
          </div>
        )}

        {/* Main Content - Right Side (Flexible) */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Title Row with Menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <button
                onClick={onEditTitle}
                className="group w-full text-left"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base flex-shrink-0">{displayEmoji}</span>
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                    {displayTitle}
                  </span>
                  <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </button>

              {/* Timestamp below title */}
              <p className="text-2xs text-muted-foreground/60 mt-0.5">
                {format(new Date(entry.created_at), 'MMM d, h:mm a')}
              </p>
            </div>

            {/* Rating + Menu in top right */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {entry.bloating_rating && (
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                  entry.bloating_rating <= 2
                    ? 'bg-primary/10'
                    : entry.bloating_rating === 3
                      ? 'bg-yellow-50'
                      : 'bg-coral/10'
                }`}>
                  <span className="text-sm">{RATING_EMOJIS[entry.bloating_rating]}</span>
                  <span className={`text-xs font-bold ${
                    entry.bloating_rating <= 2
                      ? 'text-primary'
                      : entry.bloating_rating === 3
                        ? 'text-yellow-600'
                        : 'text-coral'
                  }`}>
                    {entry.bloating_rating}
                  </span>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-muted/50">
                    <MoreVertical className="w-3 h-3" />
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
          </div>

          {/* Triggers - Minimal colored dots with labels */}
          {entry.detected_triggers && entry.detected_triggers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {entry.detected_triggers.slice(0, 2).map((trigger, i) => {
                const categoryInfo = getTriggerCategory(trigger.category);
                return (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-2xs text-muted-foreground"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryInfo?.color }}
                    />
                    {trigger.food || categoryInfo?.displayName?.split(' - ')[1] || categoryInfo?.displayName}
                  </span>
                );
              })}
              {entry.detected_triggers.length > 2 && (
                <span className="text-2xs text-muted-foreground/70">
                  +{entry.detected_triggers.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline Rating (Full Width Below) */}
      {!entry.bloating_rating && isPending && (
        <InlineRating entryId={entry.id} />
      )}
    </div>
  );
}
