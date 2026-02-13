import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, FileText, Sparkles, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { EmptyState } from '@/components/shared/EmptyState';
import { EditMealModal } from '@/components/meals/EditMealModal';
import { EditTitleModal } from '@/components/meals/EditTitleModal';
import { MealPhoto } from '@/components/meals/MealPhoto';
import { EntryCard, getMealDisplayTitle } from '@/components/meals/EntryCard';
import { useMeals } from '@/contexts/MealContext';
import { useMilestones } from '@/contexts/MilestonesContext';
import { useToast } from '@/hooks/use-toast';
import { MealEntry, RATING_LABELS, RATING_EMOJIS, getTriggerCategory, QUICK_NOTES } from '@/types';
import { format, isAfter, subDays, isToday, isYesterday, startOfDay } from 'date-fns';
import { haptics } from '@/lib/haptics';
import { getHistoryHeroBackground, fetchHistoryHeroBackground } from '@/lib/pexels';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { getPendingExperimentMealId, completeExperiment } = useMilestones();
  const { toast } = useToast();

  const [filter, setFilter] = useState<FilterType>('all');
  const [ratingEntry, setRatingEntry] = useState<MealEntry | null>(null);
  const [editEntry, setEditEntry] = useState<MealEntry | null>(null);
  const [detailsEntry, setDetailsEntry] = useState<MealEntry | null>(null);
  const [editTitleEntry, setEditTitleEntry] = useState<MealEntry | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  // Calming hero background (static fallback, then async collection upgrade)
  const [heroBackground, setHeroBackground] = useState(() => getHistoryHeroBackground());

  // Fetch hero background from Pexels collection
  useEffect(() => {
    let cancelled = false;
    fetchHistoryHeroBackground().then((photo) => {
      if (!cancelled) setHeroBackground(photo);
    });
    return () => { cancelled = true; };
  }, []);

  // Preload hero background with cleanup
  useEffect(() => {
    const img = new Image();
    img.src = heroBackground.src;
    return () => { img.src = ''; };
  }, [heroBackground]);

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

  const handleDelete = useCallback(async (id: string, description: string) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;

    await deleteEntry(id);
    toast({
      title: 'Entry deleted',
      description: `"${description}" has been removed.`,
    });
  }, [deleteEntry, toast]);

  const handleRate = async (rating: number) => {
    if (!ratingEntry) return;
    haptics.success();
    try {
      await updateRating(ratingEntry.id, rating);

      // Check if this is a pending experiment meal
      const pendingExperimentMealId = getPendingExperimentMealId();
      if (pendingExperimentMealId && pendingExperimentMealId === ratingEntry.id) {
        // Complete the experiment with this rating
        await completeExperiment(ratingEntry.id, rating);
        toast({
          title: 'Experiment Complete!',
          description: 'Check your Experiments tab to see the results.'
        });
      } else {
        toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
      }
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

  return (
    <AppLayout>
      <PageTransition>
        <div className="min-h-screen relative">
          {/* Subtle botanical line art - delicate branch silhouettes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <svg
              viewBox="0 0 200 700"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -right-10 top-48 w-64 h-auto opacity-[0.035] text-forest"
            >
              {/* Main stem */}
              <path
                d="M100 700 Q95 580 100 480 Q105 380 95 280 Q88 180 100 60"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Right leaves */}
              <path d="M100 580 Q125 560 145 568 Q125 578 100 580" fill="currentColor" opacity="0.4" />
              <path d="M102 440 Q130 418 152 428 Q128 440 102 440" fill="currentColor" opacity="0.35" />
              <path d="M100 300 Q126 280 146 292 Q124 302 100 300" fill="currentColor" opacity="0.3" />
              <path d="M100 180 Q124 162 142 174 Q122 184 100 180" fill="currentColor" opacity="0.25" />
              {/* Left leaves */}
              <path d="M98 520 Q72 502 55 514 Q74 524 98 520" fill="currentColor" opacity="0.35" />
              <path d="M96 380 Q68 362 50 375 Q70 385 96 380" fill="currentColor" opacity="0.3" />
              <path d="M98 240 Q72 222 56 236 Q74 246 98 240" fill="currentColor" opacity="0.25" />
              <path d="M96 120 Q70 105 55 118 Q72 128 96 120" fill="currentColor" opacity="0.2" />
            </svg>
            {/* Secondary smaller branch on the left */}
            <svg
              viewBox="0 0 120 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -left-8 bottom-32 w-32 h-auto opacity-[0.025] text-forest"
            >
              <path
                d="M60 400 Q58 320 62 240 Q64 160 58 80"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path d="M62 340 Q80 325 92 332 Q78 342 62 340" fill="currentColor" opacity="0.35" />
              <path d="M60 260 Q42 248 30 258 Q44 265 60 260" fill="currentColor" opacity="0.3" />
              <path d="M62 180 Q78 168 90 178 Q76 186 62 180" fill="currentColor" opacity="0.25" />
              <path d="M60 110 Q44 98 34 108 Q46 115 60 110" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          <StaggerContainer className="relative z-10 px-5 pt-4 pb-32 max-w-lg mx-auto space-y-5 w-full">

            {/* ORGANIC MODERNISM Hero - Matching Dashboard aesthetic */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[32px] h-52 shadow-glass-xl"
              >
                {/* Pexels Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${heroBackground.src})` }}
                />

                {/* Organic gradient overlays for depth and readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-forest/40 via-forest/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />

                {/* Glass content */}
                <div className="relative h-full">
                  <div className="relative h-full p-7 flex flex-col justify-between">
                    {/* Title - bottom left with display serif font */}
                    <div className="flex flex-col items-start gap-2 pr-16 mt-auto">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0, duration: 0.2 }}
                        className="text-[11px] font-semibold text-white/80 tracking-[0.2em] uppercase font-body"
                      >
                        Your Journey
                      </motion.span>
                      <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0, duration: 0.2 }}
                        className="text-display-xl font-display font-bold text-white leading-[0.95] drop-shadow-lg"
                        style={{
                          textShadow: '0 4px 24px rgba(0,0,0,0.3)'
                        }}
                      >
                        History
                      </motion.h1>
                    </div>

                    {/* Compact stat badges - bottom right (40-50% smaller than before) */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0, duration: 0.2 }}
                      className="absolute bottom-5 right-5 flex items-center gap-2"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-glass border border-white/50"
                      >
                        <FileText className="w-4 h-4 text-forest" />
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-charcoal">{entries.length}</span>
                          <span className="text-[10px] font-medium text-charcoal/60">meals</span>
                        </div>
                      </motion.div>
                      {stats.highBloatingCount > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-glass border border-white/50"
                        >
                          <Flame className="w-4 h-4 text-burnt" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-charcoal">{stats.highBloatingCount}</span>
                            <span className="text-[10px] font-medium text-charcoal/60">triggers</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Quick Stats Banner - Glass Card */}
            {entries.length >= 3 && (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0.2 }}
                  className="glass-card p-5"
                >
                  <div className="flex gap-4">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mb-1.5">Avg This Week</p>
                      <div className="flex items-center justify-center gap-2">
                        {stats.weeklyAvg > 0 ? (
                          <>
                            <span className="text-lg">{stats.weeklyAvg <= 2 ? '😊' : stats.weeklyAvg >= 4 ? '😣' : '😐'}</span>
                            <span className="text-xl font-bold text-charcoal">{stats.weeklyAvg.toFixed(1)}</span>
                            <span className="text-xs font-medium text-charcoal/50">/5</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-charcoal/50">No data</span>
                        )}
                      </div>
                    </div>
                    <div className="w-px bg-charcoal/10" />
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mb-1.5">Top Trigger</p>
                      {stats.topTrigger ? (
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getTriggerCategory(stats.topTrigger.category)?.color }}
                          />
                          <span className="text-sm font-bold text-charcoal truncate">
                            {getTriggerCategory(stats.topTrigger.category)?.displayName?.split(' - ')[1] ||
                             getTriggerCategory(stats.topTrigger.category)?.displayName}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-charcoal/50">None yet</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* Filter Tabs - Clean Glass Design */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0.2 }}
                className="glass-card p-1.5 flex gap-1.5"
              >
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
                    className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      filter === tab.key
                        ? 'bg-gradient-to-br from-forest to-forest-light text-white shadow-md shadow-forest/20'
                        : 'text-charcoal/50 hover:text-charcoal hover:bg-sage/50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </motion.button>
                ))}
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
                      className="text-xs font-bold text-charcoal/45 uppercase tracking-[0.15em] px-1"
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
                          <EntryCard
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
                  className="relative overflow-hidden rounded-2xl px-8 py-3.5 font-bold shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-forest to-forest-light" />
                  <div className="relative flex items-center gap-2 text-white text-sm">
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
