import { motion } from 'framer-motion';
import { getFoodPhoto, PexelsPhoto } from '@/lib/pexels';
import { useState, useEffect } from 'react';

interface EditorialFoodItemProps {
  foodName: string;
  count?: number;
  bloatingLevel?: number; // 1-5
  onClick?: () => void;
  index?: number;
}

/**
 * Editorial-style food item with premium magazine aesthetic
 * Uses Pexels API for high-quality food imagery
 */
export function EditorialFoodItem({
  foodName,
  count,
  bloatingLevel,
  onClick,
  index = 0,
}: EditorialFoodItemProps) {
  const [photo, setPhoto] = useState<PexelsPhoto | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const foodPhoto = getFoodPhoto(foodName);
    setPhoto(foodPhoto);

    // Preload image
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = foodPhoto.src;
  }, [foodName]);

  // Get bloating indicator color
  const getBloatingColor = (level?: number) => {
    if (!level) return null;
    if (level <= 2) return { bg: 'bg-forest/10', text: 'text-forest', label: 'Low' };
    if (level <= 3) return { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Medium' };
    return { bg: 'bg-burnt/10', text: 'text-burnt', label: 'High' };
  };

  const bloatingStyle = getBloatingColor(bloatingLevel);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="editorial-item cursor-pointer group"
    >
      {/* Food Image */}
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-glass">
        {photo && (
          <>
            {/* Placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-sage animate-pulse" />
            )}

            {/* Image */}
            <motion.img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-base text-charcoal capitalize truncate group-hover:text-forest transition-colors duration-300">
          {foodName}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {count !== undefined && (
            <span className="text-xs text-charcoal/50 font-medium">
              {count} {count === 1 ? 'time' : 'times'}
            </span>
          )}
          {bloatingStyle && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bloatingStyle.bg} ${bloatingStyle.text}`}>
              {bloatingStyle.label}
            </span>
          )}
        </div>
      </div>

      {/* Chevron indicator */}
      <motion.div
        className="w-6 h-6 flex items-center justify-center rounded-full bg-sage/50 text-charcoal/30 group-hover:bg-forest/10 group-hover:text-forest transition-colors duration-300"
        initial={false}
        animate={{ x: 0 }}
        whileHover={{ x: 2 }}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

interface EditorialFoodListProps {
  foods: Array<{
    name: string;
    count?: number;
    bloatingLevel?: number;
  }>;
  title?: string;
  maxItems?: number;
  onItemClick?: (foodName: string) => void;
}

/**
 * Editorial-style food list with magazine aesthetic
 */
export function EditorialFoodList({
  foods,
  title = "Most Logged",
  maxItems = 5,
  onItemClick,
}: EditorialFoodListProps) {
  const displayedFoods = foods.slice(0, maxItems);

  if (displayedFoods.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-bold text-charcoal">{title}</h3>
        <span className="text-xs font-semibold text-charcoal/40 bg-sage/50 px-3 py-1 rounded-full">
          {foods.length} items
        </span>
      </div>

      {/* Food Items */}
      <div className="space-y-3">
        {displayedFoods.map((food, index) => (
          <EditorialFoodItem
            key={food.name}
            foodName={food.name}
            count={food.count}
            bloatingLevel={food.bloatingLevel}
            index={index}
            onClick={() => onItemClick?.(food.name)}
          />
        ))}
      </div>

      {/* View All Link */}
      {foods.length > maxItems && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full py-3 text-sm font-semibold text-forest bg-forest/10 rounded-2xl hover:bg-forest/15 transition-colors tactile-press"
        >
          View all {foods.length} items
        </motion.button>
      )}
    </motion.div>
  );
}
