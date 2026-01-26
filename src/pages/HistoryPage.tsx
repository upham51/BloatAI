import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MoreVertical, Clock, Flame, Edit3, TrendingUp, Pencil, X, Check, FileText, Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { EmptyState } from '@/components/shared/EmptyState';
import { EditMealModal } from '@/components/meals/EditMealModal';
import { EditTitleModal } from '@/components/meals/EditTitleModal';
import { MealPhoto } from '@/components/meals/MealPhoto';
import { useMeals } from '@/contexts/MealContext';
import { useToast } from '@/hooks/use-toast';
import { MealEntry, RATING_LABELS, RATING_EMOJIS, getTriggerCategory, QUICK_NOTES } from '@/types';
import { formatDistanceToNow, format, isAfter, subDays, isToday, isYesterday, startOfDay } from 'date-fns';
import { formatTriggerDisplay } from '@/lib/triggerUtils';
import { haptics } from '@/lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { entries, deleteEntry, updateRating, skipRating, updateEntry, hasMore, loadMore, isLoading: entriesLoading } = useMeals();
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

    // Find top trigger by bloating impact (not just frequency)
    // Weight triggers by the bloating rating of meals they appear in
    const triggerStats: Record<string, { count: number; totalBloating: number; highBloatingCount: number }> = {};
    entries.forEach(entry => {
      if (entry.rating_status !== 'completed' || !entry.bloating_rating) return;
      entry.detected_triggers?.forEach(trigger => {
        if (!triggerStats[trigger.category]) {
          triggerStats[trigger.category] = { count: 0, totalBloating: 0, highBloatingCount: 0 };
        }
        triggerStats[trigger.category].count += 1;
        triggerStats[trigger.category].totalBloating += entry.bloating_rating!;
        if (entry.bloating_rating! >= 4) {
          triggerStats[trigger.category].highBloatingCount += 1;
        }
      });
    });

    // Calculate impact score: higher avg bloating + more occurrences = higher impact
    // Score = (avgBloating * 0.6) + (highBloatingRate * 0.4) - requires at least 2 occurrences
    const topTrigger = Object.entries(triggerStats)
      .filter(([_, stats]) => stats.count >= 2) // Need at least 2 meals to be meaningful
      .map(([category, stats]) => {
        const avgBloating = stats.totalBloating / stats.count;
        const highBloatingRate = stats.highBloatingCount / stats.count;
        const impactScore = (avgBloating * 0.6) + (highBloatingRate * 4 * 0.4); // Scale high rate to match avg scale
        return { category, count: stats.count, impactScore };
      })
      .sort((a, b) => b.impactScore - a.impactScore)[0];

    return {
      thisWeekCount: thisWeekEntries.length,
      highBloatingCount: highBloatingEntries.length,
      weeklyAvg,
      topTrigger: topTrigger ? { category: topTrigger.category, count: topTrigger.count } : null,
    };
  }, [entries]);

  // Calculate user average for comparison
  const userAvg = useMemo(() => {
    const rated = entries.filter(e => e.bloating_rating);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / rated.length;
  }, [entries]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    let filtered = [...entries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (filter === 'high-bloating') {
      filtered = filtered.filter((e) => e.bloating_rating && e.bloating_rating >= 4);
    } else if (filter === 'this-week') {
      const weekAgo = subDays(new Date(), 7);
      filtered = filtered.filter((e) => isAfter(new Date(e.created_at), weekAgo));
    }

    // Group by date
    const groups: { date: string; label: string; entries: MealEntry[] }[] = [];
    const dateMap = new Map<string, MealEntry[]>();

    filtered.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      const dateKey = format(startOfDay(entryDate), 'yyyy-MM-dd');

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(entry);
    });

    // Convert map to array with labels
    dateMap.forEach((entries, dateKey) => {
      const date = new Date(dateKey);
      let label: string;

      if (isToday(date)) {
        label = 'Today';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
      } else {
        label = format(date, 'EEEE, MMM d');
      }

      groups.push({ date: dateKey, label, entries });
    });

    return groups;
  }, [entries, filter]);

  const filteredEntries = useMemo(() => {
    return groupedEntries.flatMap(group => group.entries);
  }, [groupedEntries]);

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
        <div className="min-h-screen relative">
          <StaggerContainer className="relative z-10 px-5 pt-4 pb-32 max-w-lg mx-auto space-y-5 w-full">

            {/* PREMIUM Hero Header - Ultra-polished like Dashboard */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[2.5rem] h-44 shadow-2xl shadow-orange-500/15"
              >
                {/* Enhanced gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 via-amber-100/70 to-peach/80" />

                {/* Multiple animated gradient orbs */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 25, 0],
                    y: [0, -15, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-orange-400/25 to-amber-400/20 rounded-full blur-3xl"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, -20, 0],
                    y: [0, 15, 0],
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-rose-400/20 to-coral/15 rounded-full blur-3xl"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-peach/15 to-amber-200/10 rounded-full blur-2xl"
                />

                {/* Premium glassmorphic overlay */}
                <div className="relative h-full backdrop-blur-2xl bg-white/50 border-2 border-white/70 shadow-inner">
                  <div className="relative h-full p-7 flex flex-col justify-between">
                    {/* Icon badge - top right */}
                    <div className="absolute top-5 right-5">
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 5 }}
                        whileTap={{ scale: 0.96 }}
                        className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-white/90 via-white/70 to-white/80 backdrop-blur-md border-2 border-white/95 shadow-xl flex items-center justify-center"
                      >
                        <History className="w-7 h-7 text-orange-600 drop-shadow-sm" strokeWidth={2.5} />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col items-start gap-1.5 pr-20">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-[0.7rem] font-extrabold text-foreground/50 tracking-[0.15em] uppercase"
                      >
                        Your Journey
                      </motion.span>
                      <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-5xl font-black tracking-tight text-foreground leading-[0.95] drop-shadow-lg"
                        style={{
                          textShadow: '0 2px 20px rgba(0,0,0,0.08)'
                        }}
                      >
                        History
                      </motion.h1>
                    </div>

                    {/* Stats badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="flex items-center gap-2.5 px-5 py-2.5 rounded-[1.25rem] bg-white/90 backdrop-blur-md border-2 border-white/95 shadow-xl shadow-orange-500/10"
                      >
                        <span className="text-2xl drop-shadow-sm">📝</span>
                        <div className="flex flex-col leading-tight">
                          <span className="text-[0.6rem] font-extrabold text-muted-foreground/70 uppercase tracking-[0.1em]">Logged</span>
                          <span className="text-lg font-black text-foreground">{entries.length} <span className="text-xs font-bold text-muted-foreground">meals</span></span>
                        </div>
                      </motion.div>
                      {stats.highBloatingCount > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="flex items-center gap-2.5 px-5 py-2.5 rounded-[1.25rem] bg-white/90 backdrop-blur-md border-2 border-white/95 shadow-xl shadow-rose-500/10"
                        >
                          <span className="text-2xl drop-shadow-sm">🔥</span>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[0.6rem] font-extrabold text-muted-foreground/70 uppercase tracking-[0.1em]">Triggers</span>
                            <span className="text-lg font-black text-foreground">{stats.highBloatingCount}</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Quick Stats Banner - Premium Design */}
            {entries.length >= 3 && (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-purple-500/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100/80 via-lavender/70 to-pink-100/80" />

                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-12 -top-12 w-40 h-40 bg-purple-400/15 rounded-full blur-2xl"
                  />

                  <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80">
                    <div className="p-5 flex gap-4">
                      <div className="flex-1 text-center">
                        <p className="text-[0.65rem] font-extrabold text-muted-foreground/70 uppercase tracking-[0.1em] mb-1">Avg This Week</p>
                        <div className="flex items-center justify-center gap-2">
                          {stats.weeklyAvg > 0 ? (
                            <>
                              <span className="text-2xl">{stats.weeklyAvg <= 2 ? '😊' : stats.weeklyAvg >= 4 ? '😣' : '😐'}</span>
                              <span className="text-2xl font-black text-foreground">{stats.weeklyAvg.toFixed(1)}</span>
                              <span className="text-sm font-bold text-muted-foreground">/5</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">No data</span>
                          )}
                        </div>
                      </div>
                      <div className="w-px bg-white/50" />
                      <div className="flex-1 text-center">
                        <p className="text-[0.65rem] font-extrabold text-muted-foreground/70 uppercase tracking-[0.1em] mb-1">Top Trigger</p>
                        {stats.topTrigger ? (
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{ backgroundColor: getTriggerCategory(stats.topTrigger.category)?.color }}
                            />
                            <span className="text-base font-black text-foreground truncate">
                              {getTriggerCategory(stats.topTrigger.category)?.displayName?.split(' - ')[1] ||
                               getTriggerCategory(stats.topTrigger.category)?.displayName}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-muted-foreground">None yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* Filter Tabs - Premium Design */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative overflow-hidden rounded-[1.5rem] shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 via-white/70 to-gray-50/80" />

                <div className="relative backdrop-blur-xl bg-white/70 border-2 border-white/80 p-2 flex gap-2">
                  {[
                    { key: 'all' as FilterType, label: `All (${entries.length})`, icon: null },
                    { key: 'high-bloating' as FilterType, label: `High (${stats.highBloatingCount})`, icon: <Flame className="w-3.5 h-3.5" /> },
                    { key: 'this-week' as FilterType, label: `This Week (${stats.thisWeekCount})`, icon: null },
                  ].map((tab) => (
                    <motion.button
                      key={tab.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilter(tab.key)}
                      className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        filter === tab.key
                          ? 'bg-gradient-to-br from-primary via-primary to-teal-600 text-white shadow-lg shadow-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/80'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </StaggerItem>

            {/* Entry List - Grouped by Date */}
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {groupedEntries.map((group, groupIndex) => (
                  <motion.div
                    key={group.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 + groupIndex * 0.05, duration: 0.5 }}
                    className="space-y-4"
                  >
                    {/* Date Header */}
                    <motion.h2
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + groupIndex * 0.05, duration: 0.4 }}
                      className="text-sm font-black text-foreground/60 uppercase tracking-[0.15em] px-2"
                    >
                      {group.label}
                    </motion.h2>

                    {/* Entries for this date */}
                    <div className="space-y-4">
                      {group.entries.map((entry, entryIndex) => {
                        const globalIndex = groupedEntries
                          .slice(0, groupIndex)
                          .reduce((sum, g) => sum + g.entries.length, 0) + entryIndex;

                        return (
                          <PremiumEntryCard
                            key={entry.id}
                            entry={entry}
                            userAvg={userAvg}
                            onRate={() => setRatingEntry(entry)}
                            onEdit={() => setEditEntry(entry)}
                            onDelete={() => handleDelete(entry.id, entry.meal_description)}
                            onViewDetails={() => handleOpenDetails(entry)}
                            onEditTitle={() => setEditTitleEntry(entry)}
                            delay={0.2 + groupIndex * 0.05 + entryIndex * 0.05}
                            isFirstPhoto={globalIndex === 0 && !!entry.photo_url}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More Button */}
            {hasMore && filteredEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadMore}
                  disabled={entriesLoading}
                  className="relative overflow-hidden rounded-2xl px-8 py-4 font-bold shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-teal-600/90" />
                  <div className="relative flex items-center gap-2 text-white">
                    {entriesLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Load More
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* Empty State */}
            {filteredEntries.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
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
              </motion.div>
            )}
          </StaggerContainer>
        </div>
      </PageTransition>

      {/* Rating Dialog - Ultra Premium */}
      <Dialog open={!!ratingEntry} onOpenChange={() => setRatingEntry(null)}>
        <DialogContent className="max-w-sm mx-auto rounded-[2rem] border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/90 via-pink-100/80 to-orange-100/90" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-16 -top-16 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"
          />

          <div className="relative backdrop-blur-2xl bg-white/70 -m-6 p-6 rounded-[2rem]">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-black">How bloated?</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                How did <span className="font-bold text-foreground">{ratingEntry?.custom_title || ratingEntry?.meal_title || 'your meal'}</span> make you feel?
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((rating, index) => {
                const getGradient = (r: number) => {
                  if (r <= 2) return 'from-emerald-400 to-teal-500';
                  if (r === 3) return 'from-amber-400 to-orange-500';
                  return 'from-rose-400 to-red-500';
                };

                return (
                  <motion.button
                    key={rating}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRate(rating)}
                    className={`relative overflow-hidden flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-2xl bg-gradient-to-br ${getGradient(rating)} text-white shadow-lg transition-all`}
                  >
                    <span className="text-2xl font-black drop-shadow-sm">{rating}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">
                      {RATING_LABELS[rating]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSkip}
              className="w-full text-sm text-muted-foreground font-bold hover:text-foreground py-3 rounded-xl transition-colors hover:bg-white/50"
            >
              Skip for now
            </motion.button>
          </div>
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

      {/* Details Drawer - Premium Design */}
      <Drawer open={!!detailsEntry} onOpenChange={(open) => !open && setDetailsEntry(null)}>
        <DrawerContent className="max-h-[90vh] rounded-t-[2rem] border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100/50 rounded-t-[2rem]" />

          <div className="relative">
            <DrawerHeader className="text-left pt-6 px-6">
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  {detailsEntry?.meal_emoji || '🍽️'}
                </motion.span>
                <div>
                  <DrawerTitle className="text-xl font-black">
                    {detailsEntry && getMealDisplayTitle(detailsEntry)}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs text-muted-foreground font-medium">
                    {detailsEntry && format(new Date(detailsEntry.created_at), 'EEEE, MMMM d, yyyy · h:mm a')}
                    {detailsEntry?.entry_method === 'text' && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-2xs">
                        Text entry
                      </span>
                    )}
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            {detailsEntry && (
              <div className="px-6 pb-10 space-y-5 overflow-y-auto max-h-[65vh]">
                {/* Photo */}
                {detailsEntry.photo_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl overflow-hidden shadow-xl"
                  >
                    <MealPhoto
                      photoUrl={detailsEntry.photo_url}
                      className="w-full aspect-video object-cover"
                      priority={true}
                    />
                  </motion.div>
                )}

                {/* Full Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-foreground">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {detailsEntry.meal_description}
                  </p>
                </div>

                {/* Rating - Premium Card */}
                {detailsEntry.bloating_rating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    <div className={`absolute inset-0 ${
                      detailsEntry.bloating_rating <= 2
                        ? 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80'
                        : detailsEntry.bloating_rating === 3
                        ? 'bg-gradient-to-br from-amber-100/80 to-yellow-100/80'
                        : 'bg-gradient-to-br from-rose-100/80 to-red-100/80'
                    }`} />
                    <div className="relative backdrop-blur-xl bg-white/50 p-4 flex items-center gap-4">
                      <span className="text-4xl">{RATING_EMOJIS[detailsEntry.bloating_rating]}</span>
                      <div>
                        <p className="font-black text-foreground text-lg">{RATING_LABELS[detailsEntry.bloating_rating]}</p>
                        <p className="text-xs text-muted-foreground font-bold">Bloating: {detailsEntry.bloating_rating}/5</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* All Triggers */}
                {detailsEntry.detected_triggers && detailsEntry.detected_triggers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-foreground">
                      Detected Triggers ({detailsEntry.detected_triggers.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {detailsEntry.detected_triggers.map((trigger, i) => {
                        const categoryInfo = getTriggerCategory(trigger.category);
                        return (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-3 py-1.5 text-sm font-bold rounded-full flex items-center gap-1.5 shadow-sm"
                            style={{
                              backgroundColor: `${categoryInfo?.color}20`,
                              color: categoryInfo?.color,
                              border: `1.5px solid ${categoryInfo?.color}40`
                            }}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: categoryInfo?.color }}
                            />
                            {trigger.food || categoryInfo?.displayName}
                          </motion.span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h3>
                    {!isEditingNotes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingNotes(true)}
                        className="text-xs h-7 font-bold"
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
                        className="min-h-[80px] rounded-xl resize-none border-2 focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground text-right font-medium">
                        {notesInput.length}/200 characters
                      </p>

                      {/* Quick note chips */}
                      <div className="flex flex-wrap gap-2">
                        {QUICK_NOTES.map((note, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const newNotes = notesInput
                                ? `${notesInput}, ${note.label}`
                                : note.label;
                              setNotesInput(newNotes.slice(0, 200));
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded-full border-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all"
                          >
                            {note.emoji} {note.label}
                          </motion.button>
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
                          className="flex-1 rounded-xl font-bold"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveNotes}
                          className="flex-1 rounded-xl font-bold bg-gradient-to-r from-primary to-teal-600"
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  ) : detailsEntry.notes ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-sm text-muted-foreground italic font-medium">
                        {detailsEntry.notes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic font-medium">
                      No notes added
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}

// Inline Rating Component for pending entries - Premium Design
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

  // Gradient helper functions matching Dashboard style
  const getGradient = (r: number) => {
    if (r <= 2) return 'from-emerald-400 to-teal-500';
    if (r === 3) return 'from-amber-400 to-orange-500';
    return 'from-rose-400 to-red-500';
  };

  const getShadow = (r: number) => {
    if (r <= 2) return 'shadow-emerald-500/30';
    if (r === 3) return 'shadow-amber-500/30';
    return 'shadow-rose-500/30';
  };

  return (
    <div className="px-4 py-4 border-t border-white/30 bg-white/30 backdrop-blur-sm">
      <p className="text-sm font-bold text-foreground mb-3">How did this meal make you feel?</p>
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((rating, index) => (
          <motion.button
            key={rating}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              haptics.light();
              handleRate(rating);
            }}
            className={`relative overflow-hidden flex flex-col items-center justify-center gap-1.5 py-4 px-1 rounded-[1rem] backdrop-blur-md bg-white/70 border-2 border-white/85 hover:border-white shadow-lg hover:shadow-xl ${getShadow(rating)} transition-all duration-500 group`}
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(rating)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <span className="relative text-2xl font-black text-foreground group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-sm">
              {rating}
            </span>
            <span className="relative text-[8px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground group-hover:text-white/95 transition-colors duration-300">
              {RATING_LABELS[rating]}
            </span>
          </motion.button>
        ))}
      </div>
      <button
        onClick={handleSkip}
        className="text-xs text-muted-foreground font-bold hover:text-foreground transition-colors"
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

// PREMIUM ENTRY CARD - The star of the show with beautiful gradient backgrounds
function PremiumEntryCard({
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
  const rating = entry.bloating_rating;

  const displayTitle = entry.custom_title || entry.meal_title || getQuickMealTitle(entry);
  const displayEmoji = entry.meal_emoji || '🍽️';

  // Premium gradient configurations based on rating
  const getCardStyle = (rating: number | null) => {
    if (!rating) {
      // Unrated - Elegant neutral with subtle purple tint
      return {
        gradient: 'from-gray-100/90 via-slate-100/80 to-gray-50/90',
        orb1: 'bg-gray-400/15',
        orb2: 'bg-slate-400/10',
        shadow: 'shadow-gray-500/10',
        accent: 'bg-gray-500',
        iconBg: 'from-gray-50 to-slate-100',
      };
    }
    if (rating <= 2) {
      // Green - Perfect, no bloating
      return {
        gradient: 'from-emerald-100/90 via-teal-100/80 to-green-50/90',
        orb1: 'bg-emerald-400/20',
        orb2: 'bg-teal-400/15',
        shadow: 'shadow-emerald-500/15',
        accent: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        iconBg: 'from-emerald-50 to-teal-100',
      };
    }
    if (rating === 3) {
      // Yellow/Amber - Moderate bloating
      return {
        gradient: 'from-amber-100/90 via-yellow-100/80 to-orange-50/90',
        orb1: 'bg-amber-400/20',
        orb2: 'bg-yellow-400/15',
        shadow: 'shadow-amber-500/15',
        accent: 'bg-gradient-to-br from-amber-500 to-orange-500',
        iconBg: 'from-amber-50 to-yellow-100',
      };
    }
    // Red/Coral - High bloating trigger
    return {
      gradient: 'from-rose-100/90 via-red-100/80 to-coral/90',
      orb1: 'bg-rose-400/20',
      orb2: 'bg-red-400/15',
      shadow: 'shadow-rose-500/15',
      accent: 'bg-gradient-to-br from-rose-500 to-red-600',
      iconBg: 'from-rose-50 to-red-100',
    };
  };

  const style = getCardStyle(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-[1.75rem] cursor-pointer group shadow-xl ${style.shadow}`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />

      {/* Animated orbs for depth */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -right-12 -top-12 w-32 h-32 ${style.orb1} rounded-full blur-2xl`}
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -10, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={`absolute -left-8 -bottom-8 w-28 h-28 ${style.orb2} rounded-full blur-2xl`}
      />

      {/* Premium glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 group-hover:bg-white/70 transition-all duration-500">
        {/* Rating Indicator Badge - Top Right */}
        {rating ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute top-3 right-3 w-12 h-12 rounded-2xl ${style.accent} flex items-center justify-center shadow-lg z-10`}
          >
            <div className="flex items-baseline">
              <span className="text-white font-black text-sm">{rating}</span>
              <span className="text-white/80 font-bold text-[10px]">/5</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-gradient-to-br from-gray-100/90 to-slate-100/90 backdrop-blur-md border border-white/60 shadow-md z-10"
          >
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">No rating</span>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="flex gap-4 p-4" onClick={onViewDetails}>
          {/* Square Photo with premium styling */}
          {entry.photo_url ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <MealPhoto
                photoUrl={entry.photo_url}
                className="w-20 h-20 rounded-2xl shadow-lg cursor-pointer object-cover flex-shrink-0 border-2 border-white/80"
                priority={isFirstPhoto}
                thumbnail={true}
              />
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-lg cursor-pointer flex-shrink-0 border-2 border-white/80`}
            >
              <span className="text-3xl drop-shadow-sm">
                {entry.entry_method === 'text' ? '✍️' : displayEmoji}
              </span>
            </motion.div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 pr-8">
            {/* Title Row */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0 drop-shadow-sm">{displayEmoji}</span>
              <h3 className="font-black text-foreground text-base truncate leading-tight">
                {displayTitle}
              </h3>
            </div>

            {/* Time & Rating Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-bold">
                  {format(new Date(entry.created_at), 'h:mm a')}
                </p>
              </div>
              {rating && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{RATING_EMOJIS[rating]}</span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {RATING_LABELS[rating]}
                  </span>
                </div>
              )}
            </div>

            {/* Trigger badges preview */}
            {entry.detected_triggers && entry.detected_triggers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {entry.detected_triggers.slice(0, 2).map((trigger, i) => {
                  const categoryInfo = getTriggerCategory(trigger.category);
                  return (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: `${categoryInfo?.color}25`,
                        color: categoryInfo?.color,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: categoryInfo?.color }}
                      />
                      {trigger.food || categoryInfo?.displayName?.split(' - ')[1]}
                    </span>
                  );
                })}
                {entry.detected_triggers.length > 2 && (
                  <span className="text-[10px] font-bold text-muted-foreground">
                    +{entry.detected_triggers.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu Button - Absolute positioned */}
        <div className="absolute top-4 right-14">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-white/50">
              <DropdownMenuItem onClick={onEditTitle} className="rounded-lg font-medium">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="rounded-lg font-medium">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive rounded-lg font-medium">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Inline Rating (Full Width Below) */}
        {!entry.bloating_rating && isPending && (
          <InlineRating entryId={entry.id} />
        )}
      </div>
    </motion.div>
  );
}
