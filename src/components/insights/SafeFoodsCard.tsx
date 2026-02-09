import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Leaf, Minus, ChevronDown } from 'lucide-react';
import { MealEntry, TRIGGER_CATEGORIES } from '@/types';

interface SafeFoodsCardProps {
  entries: MealEntry[];
}

interface SafeFood {
  food: string;
  avgBloating: number;
  occurrences: number;
  category: string;
  categoryDisplayName: string;
}

const VISIBLE_COUNT = 5;

const easing: [number, number, number, number] = [0.16, 1, 0.3, 1];

function getCategoryDisplayName(categoryId: string): string {
  const cat = TRIGGER_CATEGORIES.find((c) => c.id === categoryId);
  return cat?.displayName ?? categoryId;
}

export function SafeFoodsCard({ entries }: SafeFoodsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const safeFoods = useMemo(() => {
    const completedEntries = entries.filter(
      (e) => e.rating_status === 'completed' && e.bloating_rating !== null
    );

    if (completedEntries.length === 0) return [];

    // Track each specific food's bloating scores and category
    const foodStats: Record<
      string,
      { totalBloating: number; count: number; category: string }
    > = {};

    completedEntries.forEach((entry) => {
      entry.detected_triggers?.forEach((trigger) => {
        const foodName = trigger.food || trigger.category;
        if (!foodName) return;

        if (!foodStats[foodName]) {
          foodStats[foodName] = {
            totalBloating: 0,
            count: 0,
            category: trigger.category,
          };
        }
        foodStats[foodName].totalBloating += entry.bloating_rating!;
        foodStats[foodName].count++;
      });
    });

    // Filter to foods with avg bloating <= 2 and at least 2 occurrences
    const safe: SafeFood[] = Object.entries(foodStats)
      .filter(([, stats]) => {
        const avg = stats.totalBloating / stats.count;
        return avg <= 2 && stats.count >= 2;
      })
      .map(([food, stats]) => ({
        food,
        avgBloating:
          Math.round((stats.totalBloating / stats.count) * 10) / 10,
        occurrences: stats.count,
        category: stats.category,
        categoryDisplayName: getCategoryDisplayName(stats.category),
      }))
      .sort((a, b) => a.avgBloating - b.avgBloating)
      .slice(0, 12);

    return safe;
  }, [entries]);

  const visibleFoods = expanded
    ? safeFoods
    : safeFoods.slice(0, VISIBLE_COUNT);
  const hiddenCount = safeFoods.length - VISIBLE_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easing }}
      className="relative overflow-hidden rounded-[2rem] shadow-xl"
    >
      <div className="relative bg-white border border-border/40 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-5"
          >
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-emerald-500/10"
            >
              <ShieldCheck className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h2
                className="text-2xl font-black text-foreground tracking-tight"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
              >
                Safe for You
              </h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Common triggers that don't seem to affect you
              </p>
            </div>
          </motion.div>

          {/* Food items or empty state */}
          {safeFoods.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-gray-50/80 to-stone-50/90" />
              <div className="relative backdrop-blur-xl bg-white/40 border-2 border-white/60 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center">
                  <Minus className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-foreground/70 mb-1">
                  None yet
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                  Keep logging meals — foods you eat often with low bloating will show up here
                </p>
              </div>
            </motion.div>
          ) : (
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-2.5"
              >
                <AnimatePresence initial={false}>
                  {visibleFoods.map((item, idx) => (
                    <motion.div
                      key={item.food}
                      initial={{ opacity: 0, scale: 0.85, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -5 }}
                      transition={{
                        delay: expanded ? idx * 0.03 : 0.35 + idx * 0.06,
                        duration: 0.45,
                        ease: easing,
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/40 shadow-sm hover:shadow-md hover:border-emerald-300/50 transition-all cursor-default"
                    >
                      <Leaf size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground/85">
                        {item.food}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/70 bg-foreground/[0.04] px-1.5 py-0.5 rounded-md">
                        {item.categoryDisplayName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600/70 bg-emerald-100/60 px-1.5 py-0.5 rounded-md">
                        {item.avgBloating}/5
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Expand / Collapse button */}
              {hiddenCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  onClick={() => setExpanded((prev) => !prev)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600/80 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                  {expanded
                    ? 'Show less'
                    : `+${hiddenCount} more`}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
