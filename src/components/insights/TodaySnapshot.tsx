import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { format, parseISO, isToday } from 'date-fns';

interface MealEntry {
  id: string;
  created_at: string;
  meal_title?: string | null;
  custom_title?: string | null;
  meal_type?: string | null;
  photo_url?: string | null;
  bloating_rating?: number | null;
}

interface TodaySnapshotProps {
  entries: MealEntry[];
  className?: string;
}

// Emoji mappings for meal types and times
const getMealEmoji = (entry: MealEntry): string => {
  const title = (entry.custom_title || entry.meal_title || '').toLowerCase();
  const mealType = (entry.meal_type || '').toLowerCase();
  const hour = new Date(entry.created_at).getHours();

  // Check for specific food keywords
  if (title.includes('coffee') || title.includes('latte') || title.includes('cappuccino')) return '☕';
  if (title.includes('tea')) return '🍵';
  if (title.includes('smoothie')) return '🥤';
  if (title.includes('juice')) return '🧃';
  if (title.includes('water')) return '💧';
  if (title.includes('salad')) return '🥗';
  if (title.includes('pizza')) return '🍕';
  if (title.includes('burger')) return '🍔';
  if (title.includes('sandwich')) return '🥪';
  if (title.includes('sushi')) return '🍣';
  if (title.includes('pasta') || title.includes('noodle')) return '🍝';
  if (title.includes('rice')) return '🍚';
  if (title.includes('soup')) return '🍲';
  if (title.includes('chicken')) return '🍗';
  if (title.includes('steak') || title.includes('beef')) return '🥩';
  if (title.includes('fish') || title.includes('salmon')) return '🐟';
  if (title.includes('egg')) return '🥚';
  if (title.includes('bread') || title.includes('toast')) return '🍞';
  if (title.includes('croissant') || title.includes('pastry')) return '🥐';
  if (title.includes('cake') || title.includes('dessert')) return '🍰';
  if (title.includes('ice cream')) return '🍦';
  if (title.includes('fruit')) return '🍎';
  if (title.includes('yogurt')) return '🥛';
  if (title.includes('cereal') || title.includes('oatmeal')) return '🥣';
  if (title.includes('snack')) return '🍿';
  if (title.includes('supplement') || title.includes('vitamin') || title.includes('pill')) return '💊';

  // Fall back to meal type
  if (mealType === 'breakfast' || (hour >= 5 && hour < 11)) return '🥐';
  if (mealType === 'lunch' || (hour >= 11 && hour < 15)) return '🥗';
  if (mealType === 'dinner' || (hour >= 17 && hour < 22)) return '🍽️';
  if (mealType === 'snack') return '🍎';

  // Default by time of day
  if (hour >= 5 && hour < 11) return '🌅';
  if (hour >= 11 && hour < 15) return '☀️';
  if (hour >= 15 && hour < 18) return '🌤️';
  if (hour >= 18 && hour < 22) return '🌙';
  return '🌃';
};

const getBloatIndicator = (rating: number | null | undefined): { emoji: string; color: string } => {
  if (!rating) return { emoji: '', color: '' };
  if (rating <= 1.5) return { emoji: '😊', color: 'text-emerald-500' };
  if (rating <= 2.5) return { emoji: '🙂', color: 'text-teal-500' };
  if (rating <= 3.5) return { emoji: '😐', color: 'text-amber-500' };
  if (rating <= 4.5) return { emoji: '😕', color: 'text-orange-500' };
  return { emoji: '😣', color: 'text-rose-500' };
};

/**
 * TodaySnapshot - Visual timeline of today's logged meals
 * Shows instant value even with minimal data
 */
export function TodaySnapshot({ entries, className = '' }: TodaySnapshotProps) {
  const todaysMeals = useMemo(() => {
    return entries
      .filter((e) => isToday(parseISO(e.created_at)))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [entries]);

  if (todaysMeals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-black text-foreground text-lg tracking-tight">Today's Snapshot</h4>
          <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
            {format(new Date(), 'EEE, MMM d')}
          </span>
        </div>
        <div className="flex items-center justify-center py-8 px-4 rounded-2xl bg-white/50 border-2 border-dashed border-white/80">
          <div className="text-center">
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl block mb-2"
            >
              🌅
            </motion.span>
            <p className="text-sm font-bold text-muted-foreground">
              No meals logged yet today
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Tap the + button to get started
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black text-foreground text-lg tracking-tight">Today's Snapshot</h4>
        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
          {format(new Date(), 'EEE, MMM d')}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />

        <div className="space-y-3">
          {todaysMeals.map((entry, index) => {
            const emoji = getMealEmoji(entry);
            const bloat = getBloatIndicator(entry.bloating_rating);
            const time = format(parseISO(entry.created_at), 'h:mm a');
            const title = entry.custom_title || entry.meal_title || 'Meal';

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative flex items-center gap-4"
              >
                {/* Timeline dot with emoji */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className="relative z-10 w-12 h-12 rounded-xl bg-white/90 border-2 border-white shadow-lg flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-2xl">{emoji}</span>
                </motion.div>

                {/* Meal info */}
                <div className="flex-1 min-w-0 py-2 px-4 rounded-xl bg-white/70 border border-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-foreground truncate text-sm">{title}</p>
                    <span className="text-xs font-semibold text-muted-foreground/70 flex-shrink-0">
                      {time}
                    </span>
                  </div>
                  {entry.bloating_rating && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-sm ${bloat.color}`}>{bloat.emoji}</span>
                      <span className="text-xs text-muted-foreground">
                        Bloating: {entry.bloating_rating}/5
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow connector to next */}
                {index < todaysMeals.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="absolute left-6 -bottom-1.5 text-primary/40"
                  >
                    ↓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary footer */}
        {todaysMeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: todaysMeals.length * 0.1 + 0.2 }}
            className="mt-4 pt-3 border-t border-white/50"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-muted-foreground">
                {todaysMeals.length} meal{todaysMeals.length !== 1 ? 's' : ''} logged
              </span>
              {todaysMeals.filter((m) => m.bloating_rating).length > 0 && (
                <span className="font-semibold text-muted-foreground/60">
                  {todaysMeals.filter((m) => m.bloating_rating).length} rated
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
