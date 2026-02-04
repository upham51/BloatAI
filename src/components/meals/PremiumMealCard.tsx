import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Keyboard, Scan } from 'lucide-react';
import { getRandomMealTexture } from '@/lib/pexels';
import { cn } from '@/lib/utils';

interface PremiumMealCardProps {
  title: string;
  description?: string;
  icon: 'camera' | 'keyboard' | 'scan';
  onClick: () => void;
  index?: number;
  variant?: 'default' | 'featured';
}

const iconMap = {
  camera: Camera,
  keyboard: Keyboard,
  scan: Scan,
};

/**
 * Premium meal logging card with Pexels texture background
 * Features dark moody aesthetic with glass overlay
 */
export function PremiumMealCard({
  title,
  description,
  icon,
  onClick,
  index = 0,
  variant = 'default',
}: PremiumMealCardProps) {
  const [texture, setTexture] = useState<{ src: string; alt: string } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const Icon = iconMap[icon];

  useEffect(() => {
    // Get a random texture for this card
    const selectedTexture = getRandomMealTexture();
    setTexture(selectedTexture);

    // Preload the image
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = selectedTexture.src;
  }, []);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[32px] text-left transition-all duration-500 tactile-press group",
        variant === 'featured' ? 'h-48 col-span-2' : 'h-40'
      )}
    >
      {/* Pexels texture background */}
      {texture && (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-transform duration-700",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundImage: `url(${texture.src})`,
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Fallback gradient while loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-dark to-charcoal" />
      )}

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal/80 via-charcoal/60 to-charcoal/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />

      {/* Glass highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col justify-between">
        {/* Icon */}
        <motion.div
          className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
        </motion.div>

        {/* Text */}
        <div>
          <h3 className="font-display text-xl font-bold text-white mb-1 drop-shadow-lg">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-white/70 font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Subtle arrow indicator */}
        <motion.div
          className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.button>
  );
}

interface MealLoggingGridProps {
  onPhotoClick: () => void;
  onTextClick: () => void;
  onScanClick?: () => void;
}

/**
 * Premium meal logging grid with Bento-style layout
 */
export function MealLoggingGrid({
  onPhotoClick,
  onTextClick,
  onScanClick,
}: MealLoggingGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="font-display text-xl font-bold text-charcoal px-1">
        Log a Meal
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <PremiumMealCard
          title="Take Photo"
          description="Snap your meal"
          icon="camera"
          onClick={onPhotoClick}
          index={0}
          variant="featured"
        />
        <PremiumMealCard
          title="Type It"
          description="Describe your meal"
          icon="keyboard"
          onClick={onTextClick}
          index={1}
        />
        {onScanClick && (
          <PremiumMealCard
            title="Scan"
            description="Barcode lookup"
            icon="scan"
            onClick={onScanClick}
            index={2}
          />
        )}
      </div>
    </motion.div>
  );
}
