import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatedOnboardingScreen1 } from './AnimatedOnboardingScreen1';
import { AnimatedOnboardingScreen2 } from './AnimatedOnboardingScreen2';
import { AnimatedOnboardingScreen3 } from './AnimatedOnboardingScreen3';
import { ChevronRight } from 'lucide-react';

interface AnimatedOnboardingProps {
  onComplete: () => void;
}

export function AnimatedOnboarding({ onComplete }: AnimatedOnboardingProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    draggable: true,
    skipSnaps: false
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
    setCanScrollNext(emblaApi.canScrollNext());
    setCanScrollPrev(emblaApi.canScrollPrev());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const screens = [
    { component: <AnimatedOnboardingScreen1 />, title: 'Clarity' },
    { component: <AnimatedOnboardingScreen2 />, title: 'Patterns' },
    { component: <AnimatedOnboardingScreen3 />, title: 'Insights' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      {/* Carousel */}
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {screens.map((screen, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 h-full"
            >
              {screen.component}
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3"
      >
        {screens.map((screen, index) => (
          <motion.button
            key={index}
            onClick={() => scrollTo(index)}
            className="relative group"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Dot background */}
            <motion.div
              className="w-3 h-3 rounded-full transition-colors"
              animate={{
                backgroundColor: currentIndex === index
                  ? 'hsl(160, 35%, 75%)'
                  : 'hsl(220, 15%, 85%)'
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Active dot glow */}
            {currentIndex === index && (
              <motion.div
                className="absolute inset-0 rounded-full bg-sage"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground/90 text-background text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none"
            >
              {screen.title}
            </motion.div>
          </motion.button>
        ))}
      </motion.div>

      {/* Navigation hints */}
      <AnimatePresence>
        {canScrollPrev && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.6, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full shadow-soft flex items-center justify-center border-2 border-muted"
          >
            <ChevronRight className="w-6 h-6 rotate-180 text-foreground" />
          </motion.button>
        )}

        {canScrollNext && currentIndex < screens.length - 1 && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.6, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full shadow-soft flex items-center justify-center border-2 border-muted"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Swipe hint - only on first screen */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            x: [20, 40, 20]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
          className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground pointer-events-none"
        >
          <span className="text-sm font-medium">Swipe</span>
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      )}

      {/* Get Started button - only on last screen */}
      {currentIndex === screens.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
        >
          <motion.button
            onClick={onComplete}
            className="px-12 py-4 bg-gradient-to-r from-sage via-mint to-sky text-foreground rounded-2xl font-bold text-lg shadow-elevated hover:shadow-elevated border-2 border-sage/50"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 12px 40px -12px rgba(0,0,0,0.15)'
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 8px 32px -8px rgba(0,0,0,0.12)',
                '0 12px 40px -8px rgba(0,0,0,0.15)',
                '0 8px 32px -8px rgba(0,0,0,0.12)'
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
          >
            <span className="flex items-center gap-2">
              Let's Begin
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
