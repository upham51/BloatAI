import React from 'react';
import { motion } from 'framer-motion';
import { useMeals } from '@/contexts/MealContext';
import { useMilestones } from '@/contexts/MilestonesContext';
import { useToast } from '@/hooks/use-toast';
import { RATING_LABELS } from '@/types';
import { haptics } from '@/lib/haptics';

interface InlineRatingProps {
  entryId: string;
}

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

export const InlineRating = React.memo(function InlineRating({ entryId }: InlineRatingProps) {
  const { updateRating, skipRating } = useMeals();
  const { getPendingExperimentMealId, completeExperiment } = useMilestones();
  const { toast } = useToast();

  const handleRate = async (rating: number) => {
    haptics.success();
    try {
      await updateRating(entryId, rating);

      const pendingExperimentMealId = getPendingExperimentMealId();
      if (pendingExperimentMealId && pendingExperimentMealId === entryId) {
        await completeExperiment(entryId, rating);
        toast({
          title: 'Experiment Complete!',
          description: 'Check your Experiments tab to see the results.'
        });
      } else {
        toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
      }
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
});
