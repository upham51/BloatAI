import { useState, useEffect } from 'react';
import { ChevronRight, Heart } from 'lucide-react';
import { getSafeAlternativesDetailed, type SafeAlternativeItem } from '@/lib/triggerUtils';
import { getTriggerCategory } from '@/types';
import { getFoodImage } from '@/lib/pexelsApi';

interface RecommendationCardsProps {
  topTriggers: string[]; // Array of trigger category IDs
}

interface AlternativeWithImage extends SafeAlternativeItem {
  imageUrl?: string;
  photographer?: string;
}

export function RecommendationCards({ topTriggers }: RecommendationCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, AlternativeWithImage[]>>({});

  if (topTriggers.length === 0) {
    return null;
  }

  const recommendations = topTriggers.slice(0, 3).map((triggerId) => {
    const category = getTriggerCategory(triggerId);
    const alternativesData = getSafeAlternativesDetailed(triggerId);

    return {
      triggerId,
      triggerName: category?.displayName || triggerId,
      alternatives: alternativesData?.alternatives.slice(0, 6) || [],
      color: category?.color || '#7FB069',
      examples: category?.examples || '',
    };
  });

  const currentRec = recommendations[currentIndex];

  // Load images for alternatives
  useEffect(() => {
    const loadImages = async () => {
      for (const rec of recommendations) {
        if (loadedImages[rec.triggerId]) continue;

        const alternativesWithImages = await Promise.all(
          rec.alternatives.map(async (alt) => {
            try {
              // Create very specific search query for each food
              const specificQuery = getSpecificSearchQuery(alt.name);
              const imageData = await getFoodImage(specificQuery);

              return {
                ...alt,
                imageUrl: imageData?.url,
                photographer: imageData?.photographer,
              };
            } catch (error) {
              console.error(`Failed to load image for ${alt.name}:`, error);
              return alt;
            }
          })
        );

        setLoadedImages((prev) => ({
          ...prev,
          [rec.triggerId]: alternativesWithImages,
        }));
      }
    };

    loadImages();
  }, [recommendations]);

  const currentAlternatives = loadedImages[currentRec.triggerId] || currentRec.alternatives;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'left' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="premium-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-mint/30 to-sage/20">
            <Heart className="w-5 h-5 text-mint" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">
              Safe Alternatives
            </h3>
            <p className="text-xs text-muted-foreground">
              Better choices for your gut
            </p>
          </div>
        </div>
        {recommendations.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30">
            <span className="font-bold text-foreground text-sm">{currentIndex + 1}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{recommendations.length}</span>
          </div>
        )}
      </div>

      {/* Swipeable Card */}
      <div className="relative">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-lavender/10 via-mint/5 to-sage/10 border border-border/50 transition-all duration-300">
          <div className="p-6 space-y-5">
            {/* Header section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-mint">
                  INSTEAD OF
                </span>
              </div>
              <div className="flex items-start gap-3">
                <h4 className="text-2xl font-bold text-foreground">
                  {currentRec.triggerName}
                </h4>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {currentRec.examples}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30" />

            {/* Alternative foods grid with images */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <p className="text-sm font-bold text-foreground">
                  Try these instead:
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentAlternatives.map((alt: AlternativeWithImage, i: number) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-xl border border-border/50 hover:border-mint/50 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer h-32"
                  >
                    {/* Background Image */}
                    {alt.imageUrl && (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${alt.imageUrl})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      </div>
                    )}

                    {/* Fallback gradient if no image */}
                    {!alt.imageUrl && (
                      <div className="absolute inset-0 bg-gradient-to-br from-mint/20 via-sage/10 to-lavender/20" />
                    )}

                    {/* Content */}
                    <div className="relative h-full p-3 flex flex-col justify-end">
                      <span className="text-sm font-bold text-white drop-shadow-md mb-0.5">
                        {alt.name}
                      </span>
                      {alt.portion && (
                        <span className="text-xs text-white/90 font-medium drop-shadow">
                          {alt.portion}
                        </span>
                      )}
                      {alt.notes && (
                        <span className="text-xs text-white/80 drop-shadow mt-0.5">
                          {alt.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium bottom accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-mint via-sage to-lavender" />
        </div>

        {/* Navigation dots */}
        {recommendations.length > 1 && (
          <div className="flex items-center justify-center gap-2.5 mt-5">
            {recommendations.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-8 h-2.5 bg-primary shadow-sm'
                    : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to recommendation ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe arrows - improved design */}
        {recommendations.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={() => handleSwipe('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-3 rounded-full bg-card border-2 border-border/50 shadow-xl hover:scale-110 hover:border-primary/50 transition-all"
                aria-label="Previous recommendation"
              >
                <ChevronRight className="w-5 h-5 text-foreground rotate-180" />
              </button>
            )}
            {currentIndex < recommendations.length - 1 && (
              <button
                onClick={() => handleSwipe('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-3 rounded-full bg-card border-2 border-border/50 shadow-xl hover:scale-110 hover:border-primary/50 transition-all"
                aria-label="Next recommendation"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Generate very specific search queries for Pexels API
 * to get accurate food images
 */
function getSpecificSearchQuery(foodName: string): string {
  const name = foodName.toLowerCase();

  // Map food names to very specific Pexels search queries
  const specificQueries: Record<string, string> = {
    'sourdough bread': 'artisan sourdough bread loaf sliced',
    'gluten-free bread': 'gluten free bread sliced toast',
    'chickpea pasta': 'chickpea pasta bowl cooked',
    'rice pasta': 'rice pasta gluten free noodles',
    'white rice': 'white rice bowl steamed jasmine',
    'quinoa': 'quinoa bowl cooked grain',
    'garlic-infused oil': 'garlic infused olive oil bottle',
    'scallions': 'fresh green scallions spring onions',
    'edamame': 'edamame beans bowl steamed',
    'canned lentils': 'cooked lentils bowl healthy',
    'canned chickpeas': 'chickpeas bowl cooked garbanzo',
    'firm tofu': 'firm tofu block white protein',
    'tempeh': 'tempeh block fermented soy',
    'eggs': 'fresh eggs protein breakfast',
    'cashew milk': 'cashew milk glass dairy free',
    'almond milk': 'almond milk glass dairy alternative',
    'coconut milk': 'coconut milk can creamy',
    'lactose-free milk': 'lactose free milk glass dairy',
    'hard cheeses': 'hard cheese cheddar parmesan block',
    'lactose-free yogurt': 'yogurt bowl healthy probiotic',
    'blueberries': 'fresh blueberries bowl berries',
    'strawberries': 'fresh strawberries red berries',
    'raspberries': 'fresh raspberries red berries',
    'oranges': 'fresh orange citrus fruit sliced',
    'kiwi': 'kiwi fruit sliced green fresh',
    'grapes': 'fresh grapes bunch purple green',
    'pineapple': 'fresh pineapple tropical fruit sliced',
    'cantaloupe': 'cantaloupe melon sliced orange',
    'maple syrup': 'pure maple syrup bottle natural',
    'white/brown sugar': 'white brown sugar bowl granulated',
    'rice malt syrup': 'rice syrup bottle natural sweetener',
    'stevia': 'stevia natural sweetener green leaves',
    'glucose': 'glucose sugar cubes white',
    'oats': 'rolled oats bowl oatmeal grain',
    'corn tortillas': 'corn tortillas stack mexican',
    'bell peppers': 'colorful bell peppers red yellow green',
    'carrots': 'fresh carrots orange vegetables',
    'zucchini': 'fresh zucchini green vegetable',
    'cucumber': 'fresh cucumber sliced green',
    'spinach': 'fresh spinach leaves green',
    'eggplant': 'fresh eggplant purple vegetable',
    'sweet potatoes': 'sweet potato orange roasted',
    'tomatoes': 'fresh tomatoes red ripe',
    'bok choy': 'bok choy fresh asian greens',
    'kale': 'fresh kale leaves green superfood',
    'grilled chicken breast': 'grilled chicken breast lean protein',
    'baked salmon': 'baked salmon fillet omega 3',
    'air-fried options': 'air fryer healthy crispy food',
    'turkey': 'turkey breast lean meat protein',
    'cod or tilapia': 'white fish fillet cod tilapia',
    'olive oil': 'olive oil bottle extra virgin',
    'still water': 'glass of water fresh hydration',
    'peppermint tea': 'peppermint tea cup herbal',
    'ginger tea': 'ginger tea cup fresh root',
    'rooibos tea': 'rooibos red tea cup herbal',
    'cranberry juice': 'cranberry juice glass red',
    'infused water': 'infused water pitcher cucumber mint',
    'dark chocolate': 'dark chocolate bar cocoa',
    'lactose-free ice cream': 'ice cream scoop bowl dessert',
    'plain potato chips': 'potato chips crispy snack',
    'popcorn': 'popcorn bowl air popped',
    'rice crackers': 'rice crackers healthy snack',
    'fresh fruit': 'fresh fruit bowl colorful',
    'maple syrup treats': 'maple syrup dessert pancakes',
    'red wine': 'red wine glass pour',
    'white wine': 'white wine glass chilled',
    'sparkling wine': 'sparkling wine champagne glass',
    'vodka': 'vodka bottle clear spirit',
    'gin': 'gin bottle juniper spirit',
    'whiskey': 'whiskey glass amber liquor',
    'tequila': 'tequila shot glass lime',
    'corn tortilla chips': 'corn tortilla chips bowl salsa',
    'hard-boiled eggs': 'hard boiled eggs peeled protein',
    'cheese cubes': 'cheese cubes snack platter',
  };

  // Return specific query if exists, otherwise construct from name
  if (specificQueries[name]) {
    return specificQueries[name];
  }

  // Fallback: add descriptive keywords to the food name
  return `${foodName} fresh food healthy meal`;
}
