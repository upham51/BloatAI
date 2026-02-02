import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MealEntry {
  id: string;
  created_at: string;
  meal_title?: string | null;
  custom_title?: string | null;
  bloating_rating?: number | null;
  selected_triggers?: string[] | null;
  ai_detected_foods?: string[] | null;
}

interface CorrelationTeaserProps {
  entries: MealEntry[];
  className?: string;
}

// Common trigger foods to look for patterns
const TRIGGER_CATEGORIES = {
  dairy: ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'ice cream', 'lactose', 'dairy'],
  gluten: ['bread', 'pasta', 'wheat', 'gluten', 'flour', 'cereal', 'oat', 'barley'],
  legumes: ['beans', 'lentils', 'chickpeas', 'legumes', 'peas', 'soy', 'tofu'],
  cruciferous: ['broccoli', 'cauliflower', 'cabbage', 'brussels', 'kale'],
  allium: ['onion', 'garlic', 'leek', 'shallot'],
  fodmap: ['apple', 'pear', 'mango', 'watermelon', 'honey', 'agave'],
  carbonated: ['soda', 'sparkling', 'carbonated', 'fizzy', 'beer'],
  caffeine: ['coffee', 'espresso', 'latte', 'caffeine'],
  alcohol: ['wine', 'beer', 'alcohol', 'cocktail', 'spirits'],
  fried: ['fried', 'deep fried', 'crispy', 'chips', 'fries'],
  spicy: ['spicy', 'chili', 'hot sauce', 'jalapeño', 'curry'],
};

interface Correlation {
  trigger: string;
  displayName: string;
  avgBloating: number;
  occurrences: number;
  emoji: string;
  severity: 'low' | 'moderate' | 'high';
}

const getTriggerEmoji = (trigger: string): string => {
  const emojiMap: Record<string, string> = {
    dairy: '🧀',
    gluten: '🍞',
    legumes: '🫘',
    cruciferous: '🥦',
    allium: '🧅',
    fodmap: '🍎',
    carbonated: '🥤',
    caffeine: '☕',
    alcohol: '🍷',
    fried: '🍟',
    spicy: '🌶️',
  };
  return emojiMap[trigger] || '🍽️';
};

const getTriggerDisplayName = (trigger: string): string => {
  const nameMap: Record<string, string> = {
    dairy: 'Dairy',
    gluten: 'Gluten',
    legumes: 'Legumes',
    cruciferous: 'Cruciferous veggies',
    allium: 'Onion/Garlic',
    fodmap: 'High-FODMAP fruits',
    carbonated: 'Carbonated drinks',
    caffeine: 'Caffeine',
    alcohol: 'Alcohol',
    fried: 'Fried foods',
    spicy: 'Spicy foods',
  };
  return nameMap[trigger] || trigger;
};

/**
 * CorrelationTeaser - Shows potential food-bloating correlations
 * Provides immediate value by teasing patterns discovered in user data
 */
export function CorrelationTeaser({ entries, className = '' }: CorrelationTeaserProps) {
  const navigate = useNavigate();

  const correlations = useMemo((): Correlation[] => {
    const triggerStats: Record<string, { totalBloating: number; count: number }> = {};

    entries.forEach((entry) => {
      if (!entry.bloating_rating || entry.bloating_rating < 1) return;

      const foodText = [
        entry.meal_title,
        entry.custom_title,
        ...(entry.ai_detected_foods || []),
        ...(entry.selected_triggers || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // Check each trigger category
      Object.entries(TRIGGER_CATEGORIES).forEach(([category, keywords]) => {
        const hasMatch = keywords.some((keyword) => foodText.includes(keyword));
        if (hasMatch) {
          if (!triggerStats[category]) {
            triggerStats[category] = { totalBloating: 0, count: 0 };
          }
          triggerStats[category].totalBloating += entry.bloating_rating!;
          triggerStats[category].count++;
        }
      });
    });

    // Calculate averages and find significant correlations
    const results: Correlation[] = [];

    Object.entries(triggerStats).forEach(([trigger, stats]) => {
      if (stats.count >= 2) {
        // Need at least 2 occurrences
        const avgBloating = stats.totalBloating / stats.count;
        if (avgBloating >= 2.5) {
          // Only show if bloating is moderate or higher
          let severity: 'low' | 'moderate' | 'high' = 'low';
          if (avgBloating >= 4) severity = 'high';
          else if (avgBloating >= 3) severity = 'moderate';

          results.push({
            trigger,
            displayName: getTriggerDisplayName(trigger),
            avgBloating,
            occurrences: stats.count,
            emoji: getTriggerEmoji(trigger),
            severity,
          });
        }
      }
    });

    // Sort by average bloating (highest first)
    return results.sort((a, b) => b.avgBloating - a.avgBloating).slice(0, 3);
  }, [entries]);

  // Placeholder correlations for new users
  const placeholderCorrelations: Correlation[] = [
    {
      trigger: 'dairy',
      displayName: 'Dairy',
      avgBloating: 3.5,
      occurrences: 0,
      emoji: '🧀',
      severity: 'moderate',
    },
    {
      trigger: 'gluten',
      displayName: 'Gluten',
      avgBloating: 3.2,
      occurrences: 0,
      emoji: '🍞',
      severity: 'moderate',
    },
  ];

  const displayCorrelations = correlations.length > 0 ? correlations : placeholderCorrelations;
  const isPlaceholder = correlations.length === 0;

  const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'high':
        return 'from-rose-500 to-red-500';
      case 'moderate':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-teal-500 to-emerald-500';
    }
  };

  const getSeverityBg = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'high':
        return 'bg-rose-50 border-rose-200/50';
      case 'moderate':
        return 'bg-amber-50 border-amber-200/50';
      default:
        return 'bg-teal-50 border-teal-200/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-black text-foreground text-lg tracking-tight">Pattern Insights</h4>
        </div>
        {!isPlaceholder && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/insights')}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </motion.button>
        )}
      </div>

      {isPlaceholder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
        >
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-primary">Coming soon:</span> Log more meals to discover
            your personal food triggers
          </p>
        </motion.div>
      )}

      <div className="space-y-3">
        {displayCorrelations.map((correlation, index) => (
          <motion.div
            key={correlation.trigger}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isPlaceholder ? 0.6 : 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-xl border ${getSeverityBg(correlation.severity)} ${isPlaceholder ? 'opacity-60' : ''}`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Emoji icon */}
                <motion.div
                  whileHover={!isPlaceholder ? { scale: 1.1, rotate: 5 } : {}}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm border border-white/80 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-xl">{correlation.emoji}</span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h5 className="font-bold text-foreground">{correlation.displayName}</h5>
                    <div
                      className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${getSeverityColor(correlation.severity)} text-white text-[10px] font-bold uppercase tracking-wide`}
                    >
                      {correlation.severity === 'high'
                        ? 'Strong link'
                        : correlation.severity === 'moderate'
                          ? 'Possible link'
                          : 'Mild'}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-snug">
                    {isPlaceholder ? (
                      <>Sample: Track meals with {correlation.displayName.toLowerCase()} to discover patterns</>
                    ) : (
                      <>
                        {correlation.occurrences > 1 ? (
                          <>
                            In <span className="font-bold text-foreground">{correlation.occurrences} meals</span> with{' '}
                            {correlation.displayName.toLowerCase()}, average bloating was{' '}
                            <span className="font-bold text-foreground">
                              {correlation.avgBloating.toFixed(1)}/5
                            </span>
                          </>
                        ) : (
                          <>Bloating of {correlation.avgBloating.toFixed(1)}/5 after eating {correlation.displayName.toLowerCase()}</>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Severity indicator bar */}
            <div
              className={`h-1 bg-gradient-to-r ${getSeverityColor(correlation.severity)}`}
              style={{ width: `${(correlation.avgBloating / 5) * 100}%` }}
            />
          </motion.div>
        ))}
      </div>

      {/* Encouragement for users with some data but no correlations yet */}
      {!isPlaceholder && correlations.length === 0 && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800 text-sm">Looking good!</p>
              <p className="text-xs text-emerald-600 mt-1">
                No strong bloating patterns detected yet. Keep logging to track your triggers.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Warning for high-severity patterns */}
      {correlations.some((c) => c.severity === 'high') && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200/50 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700">
            <span className="font-bold">Consider discussing with a healthcare provider</span> about
            your identified triggers for personalized dietary advice.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
