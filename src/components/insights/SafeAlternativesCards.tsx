import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Leaf, Sparkles } from 'lucide-react';
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
    gradient: 'from-amber-400 via-orange-400 to-rose-400'
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
    gradient: 'from-amber-400 via-orange-400 to-rose-400'
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
    gradient: 'from-emerald-400 via-teal-400 to-cyan-400'
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
    gradient: 'from-blue-400 via-indigo-400 to-purple-400'
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
    gradient: 'from-pink-400 via-rose-400 to-red-400'
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
    gradient: 'from-pink-400 via-rose-400 to-red-400'
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
    gradient: 'from-green-400 via-emerald-400 to-teal-400'
  },
  sweeteners: {
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
    gradient: 'from-green-400 via-emerald-400 to-teal-400'
  },
  'fatty-food': {
    title: 'Veggies & Other "Healthy" Triggers',
    description: 'Fatty and fried foods slow gastric emptying and can worsen bloating.',
    betterOptions: [
      {
        title: 'Cooking methods',
        items: ['Baking', 'Grilling', 'Air-frying with moderate oil']
      },
      {
        title: 'Healthier fats',
        items: ['Extra-virgin olive oil', 'Avocado oil', 'Small portions']
      }
    ],
    quickRecipes: [
      { name: 'Asian Chicken Salad', description: 'Shredded chicken + cabbage + bell peppers + cucumber + peanuts with soy-lime-ginger dressing' },
      { name: 'Brussels Sprout Salad', description: 'Shredded Brussels sprouts + pomegranate seeds + parsley + lemon-mustard vinaigrette' },
      { name: 'Herbed Popcorn', description: 'Air-popped popcorn + olive oil + rosemary + paprika' }
    ],
    imageQuery: 'grilled chicken healthy',
    gradient: 'from-orange-400 via-amber-400 to-yellow-400'
  },
  carbonated: {
    title: 'Veggies & Other "Healthy" Triggers',
    description: 'Carbonated drinks can trap gas in the gut.',
    betterOptions: [
      {
        title: 'Better drinks',
        items: ['Still water', 'Herbal teas', 'Water with citrus slices']
      }
    ],
    quickRecipes: [
      { name: 'Infused Water', description: 'Still water + lemon + cucumber + mint' },
      { name: 'Herbal Tea Blend', description: 'Peppermint or ginger tea' }
    ],
    imageQuery: 'herbal tea mint',
    gradient: 'from-cyan-400 via-blue-400 to-indigo-400'
  },
  alcohol: {
    title: 'Veggies & Other "Healthy" Triggers',
    description: 'Beer and sugary cocktails can be especially gassy.',
    betterOptions: [
      {
        title: 'If tolerated',
        items: ['Small amounts of wine or clear spirits with water', 'Avoid beer and sugary cocktails']
      }
    ],
    quickRecipes: [
      { name: 'Simple Wine Spritzer', description: 'Small wine portion + still water' },
    ],
    imageQuery: 'wine glass elegant',
    gradient: 'from-purple-400 via-violet-400 to-fuchsia-400'
  },
  processed: {
    title: 'Veggies & Other "Healthy" Triggers',
    description: 'Highly processed foods can worsen bloating.',
    betterOptions: [
      {
        title: 'Focus on',
        items: ['Minimally processed options', 'Lean meats', 'Plain rice', 'Potatoes', 'Simple sauces with herbs, citrus, and olive oil']
      }
    ],
    quickRecipes: [
      { name: 'Simple Grilled Protein', description: 'Chicken or fish + herbs + lemon + olive oil' },
      { name: 'Rice & Veggie Bowl', description: 'Plain rice + steamed carrots + zucchini + grilled protein' }
    ],
    imageQuery: 'simple grilled chicken',
    gradient: 'from-slate-400 via-gray-400 to-zinc-400'
  }
};

export function SafeAlternativesCards({ triggerConfidence }: SafeAlternativesCardsProps) {
  const [cards, setCards] = useState<AlternativeCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
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
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="text-green-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Safe Alternatives
          </h2>
        </div>
        <div className="animate-pulse">
          <div className="h-[600px] bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <Leaf className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Safe Alternatives
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Better choices for your top triggers
            </p>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex items-center gap-1.5">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-6 h-2 bg-green-600 dark:bg-green-400'
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Card Container */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative"
      >
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-full shadow-xl hover:scale-110 transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 group"
          aria-label="Previous card"
        >
          <ChevronLeft className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400" size={24} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-full shadow-xl hover:scale-110 transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 group"
          aria-label="Next card"
        >
          <ChevronRight className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400" size={24} />
        </button>

        {/* Card Content */}
        <div
          key={currentIndex}
          className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-5 duration-300"
        >
          {/* Hero Image Section */}
          <div className="relative h-48 overflow-hidden">
            {currentCard.imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{
                  backgroundImage: `url(${currentCard.imageUrl})`,
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.gradient} opacity-60`}></div>
              </div>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.gradient}`}></div>
            )}

            {/* Title Overlay */}
            <div className="relative h-full flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-white drop-shadow-lg" size={20} />
                <span className="text-white/90 text-sm font-medium drop-shadow-md">
                  Trigger {currentIndex + 1} of {cards.length}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_16px_rgb(0_0_0_/_90%)]">
                {currentCard.title}
              </h3>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                <span className="font-semibold">Why it triggers:</span> {currentCard.description}
              </p>
            </div>

            {/* Better Options */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Better Options
              </h4>
              <div className="space-y-3">
                {currentCard.betterOptions.map((option, idx) => (
                  <div key={idx} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <h5 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-2">
                      {option.title}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {option.items.map((item, itemIdx) => (
                        <span
                          key={itemIdx}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-green-200 dark:border-green-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Recipe Ideas */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Quick Recipe Ideas
              </h4>
              <div className="space-y-2">
                {currentCard.quickRecipes.map((recipe, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow"
                  >
                    <h5 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-1">
                      {recipe.name}
                    </h5>
                    <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Counter */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Swipe or use arrows to explore more alternatives
        </p>
      </div>
    </div>
  );
}
