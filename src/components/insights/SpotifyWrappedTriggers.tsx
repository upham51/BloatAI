import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriggerConfidenceLevel } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';
import { getFoodImage, getCategorySearchQuery } from '@/lib/pexelsApi';
import { ChevronDown, ChevronUp, Eye, Zap, AlertTriangle, Leaf, Check, ChefHat, AlertCircle, Sparkles } from 'lucide-react';

// Safe alternatives data integrated from SafeAlternativesCards
const SAFE_ALTERNATIVES_DATA: Record<string, {
  title: string;
  description: string;
  betterOptions: { title: string; items: string[] }[];
  quickRecipes: { name: string; description: string }[];
}> = {
  grains: {
    title: 'Savory Carbs & Gluten',
    description: 'Many savory carbs (pasta, bread, pizza crusts) are wheat-based and high in fructans, which commonly trigger bloating.',
    betterOptions: [
      { title: 'Gluten-free grains', items: ['White rice', 'Quinoa', 'Oats', 'Corn', 'Buckwheat', 'Potatoes'] },
      { title: 'Gluten-free products', items: ['Gluten-free pasta', 'Sourdough bread', 'Gluten-free orzo'] },
      { title: 'Cooking tips', items: ['Swap butter with olive oil'] }
    ],
    quickRecipes: [
      { name: 'Lemon Herb Quinoa Bowl', description: 'Quinoa + grilled chicken + cucumber + tomatoes + olive oil, lemon, and herbs' },
      { name: 'Gluten-Free Orzo Salad', description: 'Gluten-free orzo + cucumber + tomato + lemon vinaigrette' },
      { name: 'Crispy Potato Wedges', description: 'Roast potatoes in olive oil with salt, pepper, and herbs' }
    ]
  },
  gluten: {
    title: 'Savory Carbs & Gluten',
    description: 'Many savory carbs (pasta, bread, pizza crusts) are wheat-based and high in fructans, which commonly trigger bloating.',
    betterOptions: [
      { title: 'Gluten-free grains', items: ['White rice', 'Quinoa', 'Oats', 'Corn', 'Buckwheat', 'Potatoes'] },
      { title: 'Gluten-free products', items: ['Gluten-free pasta', 'Sourdough bread', 'Gluten-free orzo'] },
      { title: 'Cooking tips', items: ['Swap butter with olive oil'] }
    ],
    quickRecipes: [
      { name: 'Lemon Herb Quinoa Bowl', description: 'Quinoa + grilled chicken + cucumber + tomatoes + olive oil, lemon, and herbs' },
      { name: 'Gluten-Free Orzo Salad', description: 'Gluten-free orzo + cucumber + tomato + lemon vinaigrette' },
      { name: 'Crispy Potato Wedges', description: 'Roast potatoes in olive oil with salt, pepper, and herbs' }
    ]
  },
  beans: {
    title: 'Beans & Other Legumes',
    description: 'Beans are rich in galacto-oligosaccharides (GOS), a FODMAP class that can cause gas and bloating.',
    betterOptions: [
      { title: 'Small portions', items: ['Well-rinsed canned lentils or chickpeas in modest amounts'] },
      { title: 'Protein alternatives', items: ['Eggs', 'Chicken', 'Fish', 'Tofu', 'Firm tempeh'] },
      { title: 'Texture substitutes', items: ['Quinoa', 'Rice', 'Roasted chickpeas (modest portions)'] }
    ],
    quickRecipes: [
      { name: 'Chicken & Red Lentil Skillet', description: 'Small portion of red lentils + chicken thighs + broth + carrots + spices over rice' },
      { name: 'Tofu Banh Mi Bowl', description: 'Rice + marinated tofu + pickled carrots/daikon + cabbage and cilantro' },
      { name: 'Crunchy Roasted Chickpeas', description: 'Rinse canned chickpeas, toss with olive oil and spices, roast until crisp' }
    ]
  },
  dairy: {
    title: 'Dairy',
    description: 'Lactose in milk, soft cheeses, and ice cream is a common bloating trigger.',
    betterOptions: [
      { title: 'Lactose-free options', items: ['Lactose-free milk and yogurt', 'Small amounts of cream'] },
      { title: 'Lower-lactose cheeses', items: ['Cheddar', 'Swiss', 'Parmesan'] },
      { title: 'Plant milks', items: ['Almond milk', 'Oat milk', 'Rice milk', 'Coconut milk'] }
    ],
    quickRecipes: [
      { name: 'Lactose-Free Yogurt Parfait', description: 'Lactose-free yogurt + strawberries or blueberries + pumpkin seeds' },
      { name: 'Creamy Salmon Chowder', description: 'Salmon + potatoes + carrots + leek greens + coconut milk' },
      { name: 'Cheese & Rice Crackers', description: 'Hard cheese slices with gluten-free rice crackers' }
    ]
  },
  fruit: {
    title: 'Fruit & Sugar',
    description: 'Fructose and sugar alcohols in fruit and sweeteners can ferment and cause bloating.',
    betterOptions: [
      { title: 'Lower-FODMAP fruits', items: ['Bananas', 'Blueberries', 'Strawberries', 'Grapes', 'Kiwi', 'Oranges'] },
      { title: 'Limit these', items: ['Apples', 'Pears', 'Mango', 'Watermelon', 'Dried fruit'] },
      { title: 'Better sweeteners', items: ['Table sugar (small amounts)', 'Maple syrup', 'Rice syrup'] }
    ],
    quickRecipes: [
      { name: 'Strawberry-Banana Smoothie', description: 'Banana + frozen strawberries + lactose-free yogurt + dairy-free milk' },
      { name: 'Protein Waffles', description: 'Oat or buckwheat-based waffle + maple syrup + berries' },
      { name: 'Low-FODMAP Energy Balls', description: 'Oats + peanut butter + chia seeds + maple syrup rolled into bites' }
    ]
  },
  sugar: {
    title: 'Fruit & Sugar',
    description: 'Fructose and sugar alcohols in fruit and sweeteners can ferment and cause bloating.',
    betterOptions: [
      { title: 'Lower-FODMAP fruits', items: ['Bananas', 'Blueberries', 'Strawberries', 'Grapes', 'Kiwi', 'Oranges'] },
      { title: 'Limit these', items: ['Apples', 'Pears', 'Mango', 'Watermelon', 'Dried fruit'] },
      { title: 'Better sweeteners', items: ['Table sugar (small amounts)', 'Maple syrup', 'Rice syrup'] }
    ],
    quickRecipes: [
      { name: 'Strawberry-Banana Smoothie', description: 'Banana + frozen strawberries + lactose-free yogurt + dairy-free milk' },
      { name: 'Protein Waffles', description: 'Oat or buckwheat-based waffle + maple syrup + berries' },
      { name: 'Low-FODMAP Energy Balls', description: 'Oats + peanut butter + chia seeds + maple syrup rolled into bites' }
    ]
  },
  veggies: {
    title: 'Veggies & Other "Healthy" Triggers',
    description: 'Onions, garlic, certain crucifers, and mushrooms are classic bloat bombs due to FODMAP content.',
    betterOptions: [
      { title: 'Gentler vegetables', items: ['Carrots', 'Cucumber', 'Eggplant', 'Green beans', 'Lettuce', 'Spinach', 'Zucchini', 'Bell peppers'] },
      { title: 'Flavor alternatives', items: ['Garlic-infused oil instead of whole garlic or onion'] },
      { title: 'Other swaps', items: ['Still water vs carbonated', 'Baking/grilling vs frying'] }
    ],
    quickRecipes: [
      { name: 'Asian Chicken Salad', description: 'Shredded chicken + cabbage + bell peppers + cucumber + peanuts with soy-lime-ginger dressing' },
      { name: 'Brussels Sprout Salad', description: 'Shredded Brussels sprouts + pomegranate seeds + parsley + lemon-mustard vinaigrette' },
      { name: 'Herbed Popcorn', description: 'Air-popped popcorn + olive oil + rosemary + paprika' }
    ]
  },
  sweeteners: {
    title: 'Sweeteners & Sugar Alcohols',
    description: 'Artificial sweeteners (sorbitol, xylitol, mannitol) and high-fructose corn syrup can cause gas and bloating.',
    betterOptions: [
      { title: 'Better sweeteners', items: ['Pure maple syrup', 'Table sugar (small amounts)', 'Stevia', 'Rice malt syrup'] },
      { title: 'Avoid these', items: ['Sorbitol', 'Xylitol', 'Mannitol', 'High-fructose corn syrup', 'Agave'] },
      { title: 'Natural sweet options', items: ['Low-FODMAP fruits', 'Dark chocolate (small amounts)', 'Vanilla extract'] }
    ],
    quickRecipes: [
      { name: 'Maple-Sweetened Oatmeal', description: 'Rolled oats + maple syrup + cinnamon + blueberries' },
      { name: 'Dark Chocolate Bark', description: 'Dark chocolate + pumpkin seeds + dried cranberries' },
      { name: 'Vanilla Chia Pudding', description: 'Chia seeds + almond milk + vanilla + maple syrup + strawberries' }
    ]
  },
  'fatty-food': {
    title: 'Fatty & Fried Foods',
    description: 'Fatty and fried foods slow gastric emptying and can worsen bloating.',
    betterOptions: [
      { title: 'Cooking methods', items: ['Baking', 'Grilling', 'Air-frying', 'Steaming', 'Poaching'] },
      { title: 'Healthier fats', items: ['Extra-virgin olive oil', 'Avocado oil', 'Coconut oil (small amounts)'] },
      { title: 'Protein swaps', items: ['Grilled chicken breast', 'Baked fish', 'Lean turkey', 'Tofu'] }
    ],
    quickRecipes: [
      { name: 'Baked Lemon Chicken', description: 'Chicken breast + lemon + herbs + olive oil baked until golden' },
      { name: 'Grilled Salmon Bowl', description: 'Grilled salmon + quinoa + steamed vegetables + lemon-dill sauce' },
      { name: 'Air-Fried Sweet Potato Fries', description: 'Sweet potato wedges + light olive oil spray + paprika + salt' }
    ]
  },
  carbonated: {
    title: 'Carbonated Drinks',
    description: 'Carbonated drinks introduce gas bubbles into the digestive system, which can get trapped and cause bloating.',
    betterOptions: [
      { title: 'Better drinks', items: ['Still water', 'Herbal teas', 'Water with citrus', 'Coconut water', 'Fresh juice (diluted)'] },
      { title: 'Avoid these', items: ['Soda', 'Sparkling water', 'Beer', 'Champagne', 'Energy drinks'] },
      { title: 'Flavor ideas', items: ['Mint leaves', 'Lemon/lime slices', 'Cucumber', 'Fresh ginger', 'Berries'] }
    ],
    quickRecipes: [
      { name: 'Cucumber Mint Water', description: 'Still water + fresh cucumber slices + mint leaves + lemon' },
      { name: 'Ginger Lemon Tea', description: 'Fresh ginger + hot water + lemon + honey' },
      { name: 'Berry Infusion', description: 'Still water + crushed strawberries + blueberries + basil' }
    ]
  },
  alcohol: {
    title: 'Alcohol & Cocktails',
    description: 'Beer and sugary cocktails can be especially gassy. Beer contains carbonation and fermentable carbs.',
    betterOptions: [
      { title: 'If tolerated (small amounts)', items: ['Dry wine (red or white)', 'Clear spirits with water', 'Vodka soda with lime'] },
      { title: 'Avoid these', items: ['Beer', 'Sugary cocktails', 'Sweet mixed drinks', 'Champagne', 'Cider'] },
      { title: 'Better mixers', items: ['Still water', 'Fresh lemon/lime juice', 'Cranberry juice (small amounts)'] }
    ],
    quickRecipes: [
      { name: 'Simple Wine Spritzer', description: 'Small dry wine portion + still water + fresh lemon' },
      { name: 'Clean Vodka Tonic', description: 'Vodka + still water + lime + fresh mint' },
      { name: 'Mocktail Alternative', description: 'Still water + muddled berries + lime + mint' }
    ]
  },
  processed: {
    title: 'Processed Foods',
    description: 'Highly processed foods often contain artificial additives, high sodium, and hidden FODMAPs that worsen bloating.',
    betterOptions: [
      { title: 'Whole food swaps', items: ['Fresh vegetables', 'Lean meats', 'Plain rice', 'Potatoes', 'Fresh fish', 'Eggs'] },
      { title: 'Minimally processed', items: ['Plain yogurt (lactose-free)', 'Canned beans (rinsed)', 'Frozen vegetables', 'Plain oats'] },
      { title: 'Cooking from scratch', items: ['Simple sauces with herbs', 'Homemade dressings', 'Fresh-cooked meals'] }
    ],
    quickRecipes: [
      { name: 'Simple Grilled Protein', description: 'Chicken or fish + fresh herbs + lemon + extra-virgin olive oil' },
      { name: 'Rice & Veggie Bowl', description: 'Plain white rice + steamed carrots + zucchini + grilled chicken' },
      { name: 'Homemade Salad Dressing', description: 'Olive oil + lemon juice + Dijon mustard + salt + pepper' }
    ]
  }
};

interface SpotifyWrappedTriggersProps {
  triggerConfidence: TriggerConfidenceLevel[];
}

interface TriggerCardData {
  category: string;
  displayName: string;
  impactScore: number;
  enhancedImpactScore: number;
  occurrences: number;
  avgBloatingWith: number;
  percentage: number;
  topFoods: string[];
  imageUrl: string | null;
  consistencyFactor: number;
  frequencyWeight: number;
  recencyBoost: number;
  personalBaselineAdjustment: number;
  recentOccurrences: number;
}

function getSeverityLabel(impactScore: number): string {
  if (impactScore >= 2.0) return 'Severe Trigger';
  if (impactScore >= 1.0) return 'Strong Trigger';
  if (impactScore >= 0.5) return 'Moderate Trigger';
  return 'Mild Trigger';
}

function getGradientColors(impactScore: number): { from: string; to: string; glow: string } {
  if (impactScore >= 2.0) return { from: 'from-rose-500', to: 'to-red-600', glow: 'shadow-rose-500/30' };
  if (impactScore >= 1.0) return { from: 'from-orange-500', to: 'to-amber-600', glow: 'shadow-orange-500/30' };
  if (impactScore >= 0.5) return { from: 'from-amber-400', to: 'to-yellow-500', glow: 'shadow-amber-500/30' };
  return { from: 'from-emerald-400', to: 'to-teal-500', glow: 'shadow-emerald-500/30' };
}

function getSeverityColor(impactScore: number): string {
  if (impactScore >= 2.0) return 'bg-gradient-to-r from-rose-500 to-red-600';
  if (impactScore >= 1.0) return 'bg-gradient-to-r from-orange-500 to-amber-600';
  if (impactScore >= 0.5) return 'bg-gradient-to-r from-amber-400 to-yellow-500';
  return 'bg-gradient-to-r from-emerald-400 to-teal-500';
}

function getSeverityBadgeColor(impactScore: number): string {
  if (impactScore >= 2.0) return 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30';
  if (impactScore >= 1.0) return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30';
  if (impactScore >= 0.5) return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
  return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
}

function getSeverityBorderColor(impactScore: number): string {
  if (impactScore >= 2.0) return 'border-rose-500';
  if (impactScore >= 1.0) return 'border-orange-500';
  if (impactScore >= 0.5) return 'border-amber-400';
  return 'border-emerald-400';
}

function getSeverityGlowStyle(impactScore: number): React.CSSProperties {
  if (impactScore >= 2.0) return { filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.7)) drop-shadow(0 0 12px rgba(244,63,94,0.4))' };
  if (impactScore >= 1.0) return { filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.7)) drop-shadow(0 0 12px rgba(249,115,22,0.4))' };
  if (impactScore >= 0.5) return { filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.7)) drop-shadow(0 0 12px rgba(251,191,36,0.4))' };
  return { filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.7)) drop-shadow(0 0 12px rgba(52,211,153,0.4))' };
}

export function SpotifyWrappedTriggers({ triggerConfidence }: SpotifyWrappedTriggersProps) {
  const [topTriggers, setTopTriggers] = useState<TriggerCardData[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    async function loadTriggerData() {
      // Get top 5 triggers sorted by enhanced impact score
      const sorted = [...triggerConfidence]
        .sort((a, b) => (b.enhancedImpactScore || b.impactScore) - (a.enhancedImpactScore || a.impactScore))
        .slice(0, 5);

      // Load images for each trigger
      const triggersWithImages = await Promise.all(
        sorted.map(async (trigger) => {
          const categoryInfo = getTriggerCategory(trigger.category);

          // Use moody/aesthetic category-specific query for Pexels
          const searchQuery = getCategorySearchQuery(trigger.category);
          const imageData = await getFoodImage(searchQuery, trigger.category).catch(() => null);

          return {
            category: trigger.category,
            displayName: categoryInfo?.displayName || trigger.category,
            impactScore: trigger.impactScore,
            enhancedImpactScore: trigger.enhancedImpactScore || trigger.impactScore,
            occurrences: trigger.occurrences,
            avgBloatingWith: trigger.avgBloatingWith,
            percentage: trigger.percentage,
            topFoods: trigger.topFoods,
            imageUrl: imageData?.url || null,
            consistencyFactor: trigger.consistencyFactor || 0,
            frequencyWeight: trigger.frequencyWeight || 0,
            recencyBoost: trigger.recencyBoost || 0,
            personalBaselineAdjustment: trigger.personalBaselineAdjustment || 0,
            recentOccurrences: trigger.recentOccurrences || 0,
          } as TriggerCardData;
        })
      );

      setTopTriggers(triggersWithImages);
      setImagesLoading(false);
    }

    loadTriggerData();
  }, [triggerConfidence]);

  if (imagesLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] shadow-2xl"
      >
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-orange-100/70 to-amber-100/80" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-rose-400/20 to-orange-400/15 rounded-full blur-3xl"
        />

        <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/80 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Top Suspect Foods
            </h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="h-24 bg-gradient-to-r from-gray-200/50 to-gray-100/50 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (topTriggers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-orange-100/70 to-amber-100/80" />

        <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/80 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Top Suspect Foods
            </h2>
          </div>
          <p className="text-muted-foreground font-medium">
            Keep logging meals to identify your triggers!
          </p>
        </div>
      </motion.div>
    );
  }

  const topTrigger = topTriggers[0];
  const gradientColors = getGradientColors(topTrigger.impactScore);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-rose-500/10"
    >
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-orange-100/70 to-amber-100/80" />

      {/* Animated gradient orbs for depth */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-rose-400/25 to-orange-400/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-amber-400/20 to-yellow-300/15 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-orange-300/15 to-rose-300/10 rounded-full blur-2xl"
      />

      {/* Premium glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-rose-500/20"
            >
              <AlertTriangle className="w-6 h-6 text-rose-600" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                Top Suspect Foods
              </h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                What your body may be reacting to
              </p>
            </div>
          </motion.div>

          {/* Hero Card - #1 Trigger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-[1.5rem] h-56 cursor-pointer group shadow-xl ${gradientColors.glow}`}
            >
              {/* Full-strength photography background */}
              {topTrigger.imageUrl && (
                <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
                  <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${topTrigger.imageUrl})` }}
                  />
                  {/* Bottom 35% scrim for text readability - no color overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.1) 35%, transparent 50%)',
                    }}
                  />
                </div>
              )}

              {/* Fallback gradient if no image */}
              {!topTrigger.imageUrl && (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.to}`} />
              )}

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Section - Glassmorphism Rank Badge + Glowing Signal Bars */}
                <div className="flex justify-between items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className={`px-4 py-2 rounded-full backdrop-blur-xl bg-black/30 border-2 ${getSeverityBorderColor(topTrigger.impactScore)} shadow-lg`}
                    style={{
                      boxShadow: `0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                  >
                    <span className="text-sm font-bold text-white drop-shadow-md">
                      #1 Trigger
                    </span>
                  </motion.div>

                  {/* Severity indicator bar with glow effect */}
                  <div className="flex items-center gap-1.5" style={getSeverityGlowStyle(topTrigger.impactScore)}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <motion.div
                        key={level}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.6 + level * 0.1, duration: 0.3 }}
                        className={`w-2 rounded-full ${
                          topTrigger.impactScore >= level * 0.5
                            ? 'bg-white'
                            : 'bg-white/30'
                        }`}
                        style={{ height: `${8 + level * 4}px` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Section */}
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-3xl font-black mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_12px_rgb(0_0_0_/_80%)]"
                  >
                    {topTrigger.displayName}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center gap-3 text-sm flex-wrap"
                  >
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                      <span className="font-bold drop-shadow-md">
                        {getSeverityLabel(topTrigger.impactScore)} • {topTrigger.occurrences} times
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Expand Button for #1 */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExpandedIndex(expandedIndex === 0 ? null : 0)}
              className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground font-semibold hover:text-foreground transition-all py-3 rounded-xl hover:bg-white/50"
            >
              {expandedIndex === 0 ? (
                <>
                  <ChevronUp size={18} />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown size={18} />
                  Why is this #1?
                </>
              )}
            </motion.button>

            {/* Expanded Details for #1 */}
            <AnimatePresence>
              {expandedIndex === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    {/* Stats Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative overflow-hidden rounded-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/80 to-yellow-50/90" />
                      <div className="relative backdrop-blur-xl bg-white/40 border-2 border-white/60 rounded-2xl p-5">
                        <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Zap size={16} className="text-white" />
                          </div>
                          <span>Why is {topTrigger.displayName} ranked #1?</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/80">
                            <div className="text-2xl font-black text-orange-600">{topTrigger.occurrences}</div>
                            <div className="text-xs text-muted-foreground font-semibold">meals with this</div>
                          </div>
                          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/80">
                            <div className="text-2xl font-black text-amber-600">{topTrigger.avgBloatingWith}/5</div>
                            <div className="text-xs text-muted-foreground font-semibold">avg bloating</div>
                          </div>
                          {topTrigger.consistencyFactor > 0 && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/80">
                              <div className="text-2xl font-black text-rose-600">{Math.round(topTrigger.consistencyFactor * 100)}%</div>
                              <div className="text-xs text-muted-foreground font-semibold">consistency</div>
                            </div>
                          )}
                          {topTrigger.recentOccurrences > 0 && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/80">
                              <div className="text-2xl font-black text-purple-600">{topTrigger.recentOccurrences}</div>
                              <div className="text-xs text-muted-foreground font-semibold">times this week</div>
                            </div>
                          )}
                        </div>

                        {topTrigger.topFoods.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-orange-200/50">
                            <div className="text-xs font-bold text-muted-foreground mb-2">Common foods:</div>
                            <div className="flex flex-wrap gap-2">
                              {topTrigger.topFoods.slice(0, 4).map((food, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-full bg-white/80 text-xs font-semibold text-foreground border border-orange-200/50 shadow-sm">
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Why It Triggers Section */}
                    {SAFE_ALTERNATIVES_DATA[topTrigger.category] && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/90 via-pink-50/80 to-red-50/90" />
                          <div className="relative backdrop-blur-xl bg-white/40 border-2 border-white/60 rounded-2xl p-5">
                            <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                                <AlertCircle size={16} className="text-white" />
                              </div>
                              <span>Why it triggers bloating</span>
                            </h4>
                            <p className="text-sm text-rose-900/80 leading-relaxed">
                              {SAFE_ALTERNATIVES_DATA[topTrigger.category].description}
                            </p>
                          </div>
                        </motion.div>

                        {/* Better Options Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90" />
                          <div className="relative backdrop-blur-xl bg-white/40 border-2 border-white/60 rounded-2xl p-5">
                            <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Check size={16} className="text-white" />
                              </div>
                              <span>Better Options</span>
                              <Sparkles size={14} className="text-emerald-500 ml-auto" />
                            </h4>
                            <div className="space-y-4">
                              {SAFE_ALTERNATIVES_DATA[topTrigger.category].betterOptions.map((option, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 + idx * 0.1 }}
                                >
                                  <h5 className="font-bold text-emerald-800 text-xs mb-2 uppercase tracking-wide">
                                    {option.title}
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {option.items.map((item, itemIdx) => (
                                      <motion.span
                                        key={itemIdx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + idx * 0.1 + itemIdx * 0.05 }}
                                        className="inline-flex items-center px-3 py-2 rounded-xl bg-white/80 text-xs font-semibold text-foreground/90 shadow-sm border border-emerald-200/50 hover:bg-white hover:shadow-md hover:border-emerald-300/50 transition-all cursor-default"
                                      >
                                        <Leaf size={12} className="text-emerald-500 mr-1.5" />
                                        {item}
                                      </motion.span>
                                    ))}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* Quick Recipes Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-fuchsia-50/90" />
                          <div className="relative backdrop-blur-xl bg-white/40 border-2 border-white/60 rounded-2xl p-5">
                            <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <ChefHat size={16} className="text-white" />
                              </div>
                              <span>Quick Recipe Ideas</span>
                            </h4>
                            <div className="space-y-3">
                              {SAFE_ALTERNATIVES_DATA[topTrigger.category].quickRecipes.map((recipe, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 + idx * 0.1 }}
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-violet-200/50 hover:shadow-lg hover:border-violet-300/50 transition-all cursor-pointer group"
                                >
                                  <h5 className="font-bold text-violet-800 text-sm mb-1 group-hover:text-violet-900 transition-colors">
                                    {recipe.name}
                                  </h5>
                                  <p className="text-xs text-violet-700/70 leading-relaxed">
                                    {recipe.description}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Other Top Triggers - Compact Cards */}
          {topTriggers.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="overflow-visible"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <Eye size={16} className="text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Also watch out for:
                </h3>
              </div>
              <div className="space-y-3 pb-2">
                {topTriggers.slice(1).map((trigger, idx) => {
                  const actualIndex = idx + 1;
                  const isExpanded = expandedIndex === actualIndex;
                  const colors = getGradientColors(trigger.impactScore);

                  return (
                    <motion.div
                      key={trigger.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setExpandedIndex(isExpanded ? null : actualIndex)}
                        className={`relative overflow-hidden rounded-2xl h-[5.5rem] cursor-pointer group transition-all duration-300 shadow-lg ${colors.glow}`}
                      >
                        {/* Full-strength photography background */}
                        {trigger.imageUrl ? (
                          <>
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                              style={{ backgroundImage: `url(${trigger.imageUrl})` }}
                            />
                            {/* Left-to-right scrim: dark shelf for text, photo reveals on right */}
                            <div
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 65%, transparent 85%)',
                              }}
                            />
                          </>
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to}`} />
                        )}

                        {/* Content */}
                        <div className="relative h-full flex items-center justify-between px-5">
                          <div className="flex items-center gap-3.5">
                            {/* Severity signal bars with glow */}
                            <div className="flex items-center gap-1" style={getSeverityGlowStyle(trigger.impactScore)}>
                              {[1, 2, 3].map((level) => (
                                <div
                                  key={level}
                                  className={`w-1.5 rounded-full transition-all ${
                                    trigger.impactScore >= level * 0.7
                                      ? 'bg-white'
                                      : 'bg-white/25'
                                  }`}
                                  style={{ height: `${10 + level * 4}px` }}
                                />
                              ))}
                            </div>
                            <div>
                              <div className="font-bold text-white text-[15px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                                {trigger.displayName}
                              </div>
                              <div className="text-xs text-white/70 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                                {getSeverityLabel(trigger.impactScore)} • {trigger.occurrences} meals
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {/* Glassmorphism score badge */}
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-xl bg-black/25 text-white border ${getSeverityBorderColor(trigger.impactScore)} shadow-sm`}>
                              {trigger.avgBloatingWith.toFixed(1)}/5
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={18} className="text-white/70 drop-shadow-md" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-3">
                              {/* Quick Stats */}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="grid grid-cols-3 gap-2"
                              >
                                <div className="bg-gradient-to-br from-orange-50/90 to-amber-50/90 backdrop-blur-sm rounded-xl p-3 border border-orange-200/50 text-center">
                                  <div className="text-lg font-black text-orange-600">{trigger.avgBloatingWith}/5</div>
                                  <div className="text-[10px] text-muted-foreground font-semibold">bloating</div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 backdrop-blur-sm rounded-xl p-3 border border-amber-200/50 text-center">
                                  <div className="text-lg font-black text-amber-600">{trigger.percentage}%</div>
                                  <div className="text-[10px] text-muted-foreground font-semibold">of meals</div>
                                </div>
                                <div className="bg-gradient-to-br from-rose-50/90 to-pink-50/90 backdrop-blur-sm rounded-xl p-3 border border-rose-200/50 text-center">
                                  <div className="text-lg font-black text-rose-600">{trigger.occurrences}</div>
                                  <div className="text-[10px] text-muted-foreground font-semibold">times</div>
                                </div>
                              </motion.div>

                              {/* Why It Triggers */}
                              {SAFE_ALTERNATIVES_DATA[trigger.category] && (
                                <>
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-gradient-to-br from-rose-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl p-4 border border-rose-200/50"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                                        <AlertCircle size={10} className="text-white" />
                                      </div>
                                      <span className="text-xs font-bold text-rose-800">Why it triggers</span>
                                    </div>
                                    <p className="text-[11px] text-rose-900/70 leading-relaxed">
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].description}
                                    </p>
                                  </motion.div>

                                  {/* Better Options */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <Check size={10} className="text-white" />
                                      </div>
                                      <span className="text-xs font-bold text-emerald-800">Better Options</span>
                                      <Sparkles size={10} className="text-emerald-500 ml-auto" />
                                    </div>
                                    <div className="space-y-3">
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].betterOptions.slice(0, 2).map((option, optIdx) => (
                                        <div key={optIdx}>
                                          <div className="text-[10px] font-bold text-emerald-700 mb-1.5 uppercase tracking-wide">{option.title}</div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {option.items.slice(0, 4).map((item, itemIdx) => (
                                              <span
                                                key={itemIdx}
                                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/80 text-[10px] font-semibold text-foreground/80 border border-emerald-200/50"
                                              >
                                                <Leaf size={8} className="text-emerald-500 mr-1" />
                                                {item}
                                              </span>
                                            ))}
                                            {option.items.length > 4 && (
                                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100/80 text-[10px] font-bold text-emerald-700">
                                                +{option.items.length - 4} more
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>

                                  {/* Quick Recipe */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-4 border border-violet-200/50"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                        <ChefHat size={10} className="text-white" />
                                      </div>
                                      <span className="text-xs font-bold text-violet-800">Try this recipe</span>
                                    </div>
                                    <div className="bg-white/70 rounded-lg p-3 border border-violet-200/30">
                                      <div className="font-bold text-violet-800 text-xs mb-1">
                                        {SAFE_ALTERNATIVES_DATA[trigger.category].quickRecipes[0].name}
                                      </div>
                                      <p className="text-[10px] text-violet-700/70 leading-relaxed">
                                        {SAFE_ALTERNATIVES_DATA[trigger.category].quickRecipes[0].description}
                                      </p>
                                    </div>
                                  </motion.div>
                                </>
                              )}

                              {/* Fallback if no alternatives data */}
                              {!SAFE_ALTERNATIVES_DATA[trigger.category] && trigger.topFoods.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.15 }}
                                  className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/80"
                                >
                                  <div className="text-[10px] font-bold text-muted-foreground mb-2">Common foods:</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {trigger.topFoods.slice(0, 4).map((food, foodIdx) => (
                                      <span key={foodIdx} className="px-2.5 py-1 rounded-lg bg-white/80 text-[10px] font-semibold text-foreground border border-gray-200/50">
                                        {food}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
