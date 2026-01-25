import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Leaf, Sparkles, Check, ChefHat } from 'lucide-react';
import { TriggerConfidenceLevel } from '@/lib/insightsAnalysis';
import { getFoodImage } from '@/lib/pexelsApi';

interface SafeAlternativesCardsProps {
  triggerConfidence: TriggerConfidenceLevel[];
}

interface AlternativeCardData {
  category: string;
  displayName: string;
  title: string;
  description: string;
  betterOptions: { title: string; items: string[] }[];
  quickRecipes: { name: string; description: string }[];
  imageUrl: string | null;
  imageQuery: string;
  gradient: string;
  lightGradient: string;
}

// Comprehensive safe alternatives data
const SAFE_ALTERNATIVES_DATA: Record<string, Omit<AlternativeCardData, 'category' | 'displayName' | 'imageUrl'>> = {
  grains: {
    title: 'Savory Carbs & Gluten',
    description: 'Many savory carbs (pasta, bread, pizza crusts) are wheat-based and high in fructans, which commonly trigger bloating.',
    betterOptions: [
      {
        title: 'Gluten-free grains',
        items: ['White rice', 'Quinoa', 'Oats', 'Corn', 'Buckwheat', 'Potatoes']
      },
      {
        title: 'Gluten-free products',
        items: ['Gluten-free pasta', 'Sourdough or gluten-free bread', 'Gluten-free orzo']
      },
      {
        title: 'Cooking tips',
        items: ['Swap butter with extra-virgin olive oil']
      }
    ],
    quickRecipes: [
      { name: 'Lemon Herb Quinoa Bowl', description: 'Quinoa + grilled chicken + cucumber + tomatoes + olive oil, lemon, and herbs' },
      { name: 'Gluten-Free Orzo Salad', description: 'Gluten-free orzo + cucumber + tomato + lemon vinaigrette' },
      { name: 'Crispy Potato Wedges', description: 'Roast potatoes in olive oil with salt, pepper, and herbs' }
    ],
    imageQuery: 'quinoa bowl healthy',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    lightGradient: 'from-amber-100/80 via-orange-100/70 to-rose-100/80'
  },
  gluten: {
    title: 'Savory Carbs & Gluten',
    description: 'Many savory carbs (pasta, bread, pizza crusts) are wheat-based and high in fructans, which commonly trigger bloating.',
    betterOptions: [
      {
        title: 'Gluten-free grains',
        items: ['White rice', 'Quinoa', 'Oats', 'Corn', 'Buckwheat', 'Potatoes']
      },
      {
        title: 'Gluten-free products',
        items: ['Gluten-free pasta', 'Sourdough or gluten-free bread', 'Gluten-free orzo']
      },
      {
        title: 'Cooking tips',
        items: ['Swap butter with extra-virgin olive oil']
      }
    ],
    quickRecipes: [
      { name: 'Lemon Herb Quinoa Bowl', description: 'Quinoa + grilled chicken + cucumber + tomatoes + olive oil, lemon, and herbs' },
      { name: 'Gluten-Free Orzo Salad', description: 'Gluten-free orzo + cucumber + tomato + lemon vinaigrette' },
      { name: 'Crispy Potato Wedges', description: 'Roast potatoes in olive oil with salt, pepper, and herbs' }
    ],
    imageQuery: 'quinoa bowl healthy',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    lightGradient: 'from-amber-100/80 via-orange-100/70 to-rose-100/80'
  },
  beans: {
    title: 'Beans & Other Legumes',
    description: 'Beans are rich in galacto-oligosaccharides (GOS), a FODMAP class that can cause gas and bloating.',
    betterOptions: [
      {
        title: 'Small portions',
        items: ['Well-rinsed canned lentils or chickpeas in modest amounts']
      },
      {
        title: 'Protein alternatives',
        items: ['Eggs', 'Chicken', 'Fish', 'Tofu', 'Firm tempeh']
      },
      {
        title: 'Texture substitutes',
        items: ['Quinoa', 'Rice', 'Roasted chickpeas (modest portions)']
      }
    ],
    quickRecipes: [
      { name: 'Chicken & Red Lentil Skillet', description: 'Small portion of red lentils + chicken thighs + broth + carrots + spices over rice' },
      { name: 'Tofu Banh Mi Bowl', description: 'Rice + marinated tofu + pickled carrots/daikon + cabbage and cilantro' },
      { name: 'Crunchy Roasted Chickpeas', description: 'Rinse canned chickpeas, toss with olive oil and spices, roast until crisp' }
    ],
    imageQuery: 'tofu bowl asian',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    lightGradient: 'from-emerald-100/80 via-teal-100/70 to-cyan-100/80'
  },
  dairy: {
    title: 'Dairy',
    description: 'Lactose in milk, soft cheeses, and ice cream is a common bloating trigger.',
    betterOptions: [
      {
        title: 'Lactose-free options',
        items: ['Lactose-free milk and yogurt', 'Small amounts of cream or heavy cream']
      },
      {
        title: 'Lower-lactose cheeses',
        items: ['Cheddar', 'Swiss', 'Parmesan']
      },
      {
        title: 'Plant milks',
        items: ['Almond milk', 'Oat milk', 'Rice milk', 'Lactose-free soy milk']
      }
    ],
    quickRecipes: [
      { name: 'Lactose-Free Yogurt Parfait', description: 'Lactose-free yogurt + strawberries or blueberries + pumpkin seeds' },
      { name: 'Creamy Salmon Chowder', description: 'Salmon + potatoes + carrots + leek greens + coconut milk' },
      { name: 'Cheese & Rice Crackers', description: 'Hard cheese slices with gluten-free rice crackers' }
    ],
    imageQuery: 'yogurt parfait berries',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    lightGradient: 'from-blue-100/80 via-indigo-100/70 to-purple-100/80'
  },
  fruit: {
    title: 'Fruit & Sugar',
    description: 'Fructose and sugar alcohols in fruit and sweeteners can ferment and cause bloating.',
    betterOptions: [
      {
        title: 'Lower-FODMAP fruits',
        items: ['Bananas', 'Blueberries', 'Strawberries', 'Grapes', 'Kiwi', 'Oranges', 'Honeydew', 'Cantaloupe']
      },
      {
        title: 'Limit these',
        items: ['Apples', 'Pears', 'Mango', 'Watermelon', 'Dried fruit']
      },
      {
        title: 'Better sweeteners',
        items: ['Table sugar (small amounts)', 'Maple syrup', 'Rice syrup']
      }
    ],
    quickRecipes: [
      { name: 'Strawberry-Banana Smoothie', description: 'Banana + frozen strawberries + lactose-free yogurt + dairy-free milk' },
      { name: 'Protein Waffles', description: 'Oat or buckwheat-based waffle + maple syrup + berries' },
      { name: 'Low-FODMAP Energy Balls', description: 'Oats + peanut butter + chia seeds + maple syrup rolled into bites' }
    ],
    imageQuery: 'fresh berries strawberries',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    lightGradient: 'from-pink-100/80 via-rose-100/70 to-red-100/80'
  },
  sugar: {
    title: 'Fruit & Sugar',
    description: 'Fructose and sugar alcohols in fruit and sweeteners can ferment and cause bloating.',
    betterOptions: [
      {
        title: 'Lower-FODMAP fruits',
        items: ['Bananas', 'Blueberries', 'Strawberries', 'Grapes', 'Kiwi', 'Oranges', 'Honeydew', 'Cantaloupe']
      },
      {
        title: 'Limit these',
        items: ['Apples', 'Pears', 'Mango', 'Watermelon', 'Dried fruit']
      },
      {
        title: 'Better sweeteners',
        items: ['Table sugar (small amounts)', 'Maple syrup', 'Rice syrup']
      }
    ],
    quickRecipes: [
      { name: 'Strawberry-Banana Smoothie', description: 'Banana + frozen strawberries + lactose-free yogurt + dairy-free milk' },
      { name: 'Protein Waffles', description: 'Oat or buckwheat-based waffle + maple syrup + berries' },
      { name: 'Low-FODMAP Energy Balls', description: 'Oats + peanut butter + chia seeds + maple syrup rolled into bites' }
    ],
    imageQuery: 'fresh berries strawberries',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    lightGradient: 'from-pink-100/80 via-rose-100/70 to-red-100/80'
  },
  veggies: {
    title: 'Veggies & Other "Healthy" Triggers',
    description: 'Onions, garlic, certain crucifers, and mushrooms are classic bloat bombs due to FODMAP content.',
    betterOptions: [
      {
        title: 'Gentler vegetables',
        items: ['Carrots', 'Cucumber', 'Eggplant', 'Green beans', 'Lettuce', 'Spinach', 'Zucchini', 'Bell peppers', 'Tomatoes', 'Potatoes']
      },
      {
        title: 'Flavor alternatives',
        items: ['Garlic-infused oil instead of whole garlic or onion']
      },
      {
        title: 'Other swaps',
        items: ['Still water vs carbonated drinks', 'Baking/grilling vs frying', 'Wine/spirits vs beer']
      }
    ],
    quickRecipes: [
      { name: 'Asian Chicken Salad', description: 'Shredded chicken + cabbage + bell peppers + cucumber + peanuts with soy-lime-ginger dressing' },
      { name: 'Brussels Sprout Salad', description: 'Shredded Brussels sprouts + pomegranate seeds + parsley + lemon-mustard vinaigrette' },
      { name: 'Herbed Popcorn', description: 'Air-popped popcorn + olive oil + rosemary + paprika' }
    ],
    imageQuery: 'colorful vegetable salad',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    lightGradient: 'from-green-100/80 via-emerald-100/70 to-teal-100/80'
  },
  sweeteners: {
    title: 'Sweeteners & Sugar Alcohols',
    description: 'Artificial sweeteners (sorbitol, xylitol, mannitol) and high-fructose corn syrup can cause gas and bloating.',
    betterOptions: [
      {
        title: 'Better sweeteners',
        items: ['Pure maple syrup', 'Table sugar (small amounts)', 'Stevia', 'Glucose syrup', 'Rice malt syrup']
      },
      {
        title: 'Avoid these',
        items: ['Sorbitol', 'Xylitol', 'Mannitol', 'High-fructose corn syrup', 'Agave nectar']
      },
      {
        title: 'Natural sweet options',
        items: ['Low-FODMAP fruits', 'Dark chocolate (small amounts)', 'Vanilla extract']
      }
    ],
    quickRecipes: [
      { name: 'Maple-Sweetened Oatmeal', description: 'Rolled oats + maple syrup + cinnamon + blueberries' },
      { name: 'Dark Chocolate Bark', description: 'Dark chocolate + pumpkin seeds + dried cranberries' },
      { name: 'Vanilla Chia Pudding', description: 'Chia seeds + almond milk + vanilla + maple syrup + strawberries' }
    ],
    imageQuery: 'maple syrup natural sweetener',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    lightGradient: 'from-yellow-100/80 via-amber-100/70 to-orange-100/80'
  },
  'fatty-food': {
    title: 'Fatty & Fried Foods',
    description: 'Fatty and fried foods slow gastric emptying and can worsen bloating.',
    betterOptions: [
      {
        title: 'Cooking methods',
        items: ['Baking', 'Grilling', 'Air-frying with moderate oil', 'Steaming', 'Poaching']
      },
      {
        title: 'Healthier fats',
        items: ['Extra-virgin olive oil', 'Avocado oil', 'Coconut oil (small amounts)']
      },
      {
        title: 'Protein swaps',
        items: ['Grilled chicken breast', 'Baked fish', 'Lean turkey', 'Tofu']
      }
    ],
    quickRecipes: [
      { name: 'Baked Lemon Chicken', description: 'Chicken breast + lemon + herbs + olive oil baked until golden' },
      { name: 'Grilled Salmon Bowl', description: 'Grilled salmon + quinoa + steamed vegetables + lemon-dill sauce' },
      { name: 'Air-Fried Sweet Potato Fries', description: 'Sweet potato wedges + light olive oil spray + paprika + salt' }
    ],
    imageQuery: 'grilled chicken healthy',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    lightGradient: 'from-orange-100/80 via-amber-100/70 to-yellow-100/80'
  },
  carbonated: {
    title: 'Carbonated Drinks',
    description: 'Carbonated drinks introduce gas bubbles into the digestive system, which can get trapped and cause bloating.',
    betterOptions: [
      {
        title: 'Better drinks',
        items: ['Still water', 'Herbal teas', 'Water with citrus slices', 'Coconut water', 'Fresh juice (diluted)']
      },
      {
        title: 'Avoid these',
        items: ['Soda', 'Sparkling water', 'Beer', 'Champagne', 'Energy drinks']
      },
      {
        title: 'Flavor ideas',
        items: ['Mint leaves', 'Lemon/lime slices', 'Cucumber', 'Fresh ginger', 'Berries']
      }
    ],
    quickRecipes: [
      { name: 'Cucumber Mint Water', description: 'Still water + fresh cucumber slices + mint leaves + lemon' },
      { name: 'Ginger Lemon Tea', description: 'Fresh ginger + hot water + lemon + honey' },
      { name: 'Berry Infusion', description: 'Still water + crushed strawberries + blueberries + basil' }
    ],
    imageQuery: 'herbal tea mint',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    lightGradient: 'from-cyan-100/80 via-blue-100/70 to-indigo-100/80'
  },
  alcohol: {
    title: 'Alcohol & Cocktails',
    description: 'Beer and sugary cocktails can be especially gassy. Beer contains carbonation and fermentable carbs, while mixed drinks often have high-fructose mixers.',
    betterOptions: [
      {
        title: 'If tolerated (small amounts)',
        items: ['Dry wine (red or white)', 'Clear spirits with water', 'Vodka soda with lime']
      },
      {
        title: 'Avoid these',
        items: ['Beer', 'Sugary cocktails', 'Sweet mixed drinks', 'Champagne', 'Cider']
      },
      {
        title: 'Better mixers',
        items: ['Still water', 'Fresh lemon/lime juice', 'Cranberry juice (small amounts)', 'Club soda (if tolerated)']
      }
    ],
    quickRecipes: [
      { name: 'Simple Wine Spritzer', description: 'Small dry wine portion + still water + fresh lemon' },
      { name: 'Clean Vodka Tonic', description: 'Vodka + still water + lime + fresh mint' },
      { name: 'Mocktail Alternative', description: 'Sparkling water + muddled berries + lime + mint (if carbonation tolerated)' }
    ],
    imageQuery: 'wine glass elegant',
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
    lightGradient: 'from-purple-100/80 via-violet-100/70 to-fuchsia-100/80'
  },
  processed: {
    title: 'Processed Foods',
    description: 'Highly processed foods often contain artificial additives, high sodium, unhealthy fats, and hidden FODMAPs that can worsen bloating and digestive discomfort.',
    betterOptions: [
      {
        title: 'Whole food swaps',
        items: ['Fresh vegetables', 'Lean meats', 'Plain rice', 'Potatoes', 'Fresh fish', 'Eggs']
      },
      {
        title: 'Minimally processed options',
        items: ['Plain yogurt (lactose-free)', 'Canned beans (rinsed well)', 'Frozen vegetables (no sauce)', 'Plain oats']
      },
      {
        title: 'Cooking from scratch',
        items: ['Simple sauces with herbs, citrus, and olive oil', 'Homemade salad dressings', 'Fresh-cooked meals']
      }
    ],
    quickRecipes: [
      { name: 'Simple Grilled Protein', description: 'Chicken or fish + fresh herbs + lemon + extra-virgin olive oil' },
      { name: 'Rice & Veggie Bowl', description: 'Plain white rice + steamed carrots + zucchini + grilled chicken' },
      { name: 'Homemade Salad Dressing', description: 'Olive oil + lemon juice + Dijon mustard + salt + pepper' }
    ],
    imageQuery: 'simple grilled chicken',
    gradient: 'from-slate-500 via-gray-500 to-zinc-500',
    lightGradient: 'from-slate-100/80 via-gray-100/70 to-zinc-100/80'
  }
};

export function SafeAlternativesCards({ triggerConfidence }: SafeAlternativesCardsProps) {
  const [cards, setCards] = useState<AlternativeCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    async function loadAlternativesData() {
      // Get top 5 triggers sorted by impact score - EXACT same logic as SpotifyWrappedTriggers
      const sorted = [...triggerConfidence]
        .sort((a, b) => (b.enhancedImpactScore || b.impactScore) - (a.enhancedImpactScore || a.impactScore))
        .slice(0, 5);

      // Load images for each trigger
      const cardsWithImages = await Promise.all(
        sorted.map(async (trigger) => {
          const alternativeData = SAFE_ALTERNATIVES_DATA[trigger.category];

          if (!alternativeData) {
            console.warn(`No safe alternatives data for category: ${trigger.category}`);
            return null;
          }

          // Fetch beautiful image from Pexels
          const imageData = await getFoodImage(alternativeData.imageQuery, trigger.category).catch(() => null);

          return {
            category: trigger.category,
            displayName: trigger.category,
            ...alternativeData,
            imageUrl: imageData?.url || null,
          } as AlternativeCardData;
        })
      );

      const validCards = cardsWithImages.filter((card): card is AlternativeCardData => card !== null);
      setCards(validCards);
      setImagesLoading(false);
    }

    loadAlternativesData();
  }, [triggerConfidence]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  if (imagesLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] shadow-2xl"
      >
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/80 via-teal-100/70 to-cyan-100/80" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-400/20 to-teal-400/15 rounded-full blur-3xl"
        />

        <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/80 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Safe Alternatives
            </h2>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-[500px] bg-gradient-to-r from-gray-200/50 to-gray-100/50 rounded-2xl"
          />
        </div>
      </motion.div>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-emerald-500/10"
    >
      {/* Multi-layer gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.lightGradient}`} />

      {/* Animated gradient orbs for depth */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-emerald-400/25 to-teal-400/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-cyan-400/20 to-blue-300/15 rounded-full blur-3xl"
      />

      {/* Premium glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <Leaf className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                  Safe Alternatives
                </h2>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  Better choices for your top triggers
                </p>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-2">
              {cards.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                      : 'w-2.5 h-2.5 bg-gray-300/70 hover:bg-gray-400/70'
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Card Container */}
          <div
            ref={containerRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="relative"
          >
            {/* Navigation Buttons */}
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border-2 border-white/80 hover:bg-white transition-all duration-300 group"
              aria-label="Previous card"
            >
              <ChevronLeft className="text-foreground/70 group-hover:text-emerald-600 transition-colors" size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border-2 border-white/80 hover:bg-white transition-all duration-300 group"
              aria-label="Next card"
            >
              <ChevronRight className="text-foreground/70 group-hover:text-emerald-600 transition-colors" size={24} />
            </motion.button>

            {/* Card Content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] overflow-hidden shadow-xl border-2 border-white/80"
              >
                {/* Hero Image Section */}
                <div className="relative h-44 overflow-hidden">
                  {currentCard.imageUrl ? (
                    <motion.div
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${currentCard.imageUrl})` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.gradient} opacity-60`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </motion.div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.gradient}`} />
                  )}

                  {/* Title Overlay */}
                  <div className="relative h-full flex flex-col justify-end p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="flex items-center gap-2 mb-2"
                    >
                      <div className="px-3 py-1.5 rounded-full backdrop-blur-md bg-white/20 border border-white/30">
                        <div className="flex items-center gap-2">
                          <Sparkles className="text-white drop-shadow-lg" size={14} />
                          <span className="text-white/90 text-xs font-bold drop-shadow-md">
                            Trigger {currentIndex + 1} of {cards.length}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-2xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_16px_rgb(0_0_0_/_90%)]"
                    >
                      {currentCard.title}
                    </motion.h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-5">
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-amber-50/80 backdrop-blur-sm border-2 border-amber-200/50 rounded-2xl p-4"
                  >
                    <p className="text-sm text-amber-900 leading-relaxed">
                      <span className="font-bold">Why it triggers:</span> {currentCard.description}
                    </p>
                  </motion.div>

                  {/* Better Options */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <Check size={14} className="text-emerald-600" />
                      </div>
                      <h4 className="text-base font-bold text-foreground">
                        Better Options
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {currentCard.betterOptions.map((option, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="bg-emerald-50/80 backdrop-blur-sm rounded-xl p-4 border-2 border-emerald-200/50"
                        >
                          <h5 className="font-bold text-emerald-800 text-sm mb-2">
                            {option.title}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {option.items.map((item, itemIdx) => (
                              <span
                                key={itemIdx}
                                className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/80 text-xs font-semibold text-foreground/80 shadow-sm border border-emerald-200/50 hover:bg-white hover:shadow-md transition-all"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Quick Recipe Ideas */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <ChefHat size={14} className="text-purple-600" />
                      </div>
                      <h4 className="text-base font-bold text-foreground">
                        Quick Recipe Ideas
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {currentCard.quickRecipes.map((recipe, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + idx * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-200/50 cursor-pointer hover:shadow-md transition-all"
                        >
                          <h5 className="font-bold text-purple-800 text-sm mb-1">
                            {recipe.name}
                          </h5>
                          <p className="text-xs text-purple-700/80 leading-relaxed">
                            {recipe.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-muted-foreground font-medium">
              Swipe or use arrows to explore more alternatives
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
