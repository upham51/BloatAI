import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriggerConfidenceLevel } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';
import { getFoodImage } from '@/lib/pexelsApi';
import { ChevronDown, ChevronUp, TrendingUp, Zap, AlertTriangle, Check, X, ChefHat, AlertCircle, Lightbulb, ShieldCheck, Ban } from 'lucide-react';

// Comprehensive safe alternatives data with clear safe/avoid separation
const SAFE_ALTERNATIVES_DATA: Record<string, {
  title: string;
  description: string;
  safeOptions: string[];
  avoidOptions: string[];
  tip: string;
  quickRecipes: { name: string; ingredients: string }[];
}> = {
  grains: {
    title: 'Savory Carbs & Gluten',
    description: 'Many savory carbs (pasta, bread, pizza crusts) are wheat-based and high in fructans, which commonly trigger bloating.',
    safeOptions: [
      'White rice (unlimited)',
      'Quinoa',
      'Oats (certified GF)',
      'Potatoes',
      'Sourdough bread (2 slices)',
      'Gluten-free pasta',
      'Corn tortillas',
      'Rice noodles',
      'Buckwheat',
      'Garlic-infused oil (for flavor)',
      'Scallions (green parts only)'
    ],
    avoidOptions: [
      'Regular bread',
      'Regular pasta',
      'Wheat-based cereals',
      'Couscous',
      'Whole garlic',
      'Whole onion'
    ],
    tip: 'Sourdough\'s fermentation naturally breaks down fructans, making it easier to digest than regular bread. Choose long-fermented varieties.',
    quickRecipes: [
      { name: 'Lemon Herb Quinoa Bowl', ingredients: 'Quinoa, grilled chicken, cucumber, cherry tomatoes, olive oil, lemon juice, fresh herbs' },
      { name: 'Garlic-Infused Pasta', ingredients: 'Gluten-free pasta, garlic-infused olive oil, parmesan, fresh basil, cherry tomatoes' },
      { name: 'Crispy Roasted Potatoes', ingredients: 'Baby potatoes, olive oil, rosemary, salt, pepper, roasted until golden' }
    ]
  },
  gluten: {
    title: 'Savory Carbs & Gluten',
    description: 'Many savory carbs (pasta, bread, pizza crusts) are wheat-based and high in fructans, which commonly trigger bloating.',
    safeOptions: [
      'White rice (unlimited)',
      'Quinoa',
      'Oats (certified GF)',
      'Potatoes',
      'Sourdough bread (2 slices)',
      'Gluten-free pasta',
      'Corn tortillas',
      'Rice noodles',
      'Buckwheat'
    ],
    avoidOptions: [
      'Regular bread',
      'Regular pasta',
      'Wheat-based cereals',
      'Couscous',
      'Barley',
      'Rye'
    ],
    tip: 'Gluten-free doesn\'t always mean low FODMAP. Check labels for hidden onion, garlic, honey, and high-FODMAP flours.',
    quickRecipes: [
      { name: 'Rice Noodle Stir-Fry', ingredients: 'Rice noodles, vegetables, soy sauce, ginger, sesame oil, protein of choice' },
      { name: 'Loaded Baked Potato', ingredients: 'Baked potato, butter, chives (green parts), hard cheese, sour cream (small amount)' },
      { name: 'Quinoa Buddha Bowl', ingredients: 'Quinoa, roasted vegetables, tahini dressing, pumpkin seeds, fresh greens' }
    ]
  },
  beans: {
    title: 'Beans & Legumes',
    description: 'Beans are rich in galacto-oligosaccharides (GOS), a FODMAP class that causes gas and bloating in most people.',
    safeOptions: [
      'Canned lentils (¼ cup, rinsed well)',
      'Canned chickpeas (¼ cup, rinsed well)',
      'Firm tofu (unlimited)',
      'Tempeh (fermented)',
      'Eggs',
      'Edamame (½ cup max)'
    ],
    avoidOptions: [
      'Dried beans (all types)',
      'Black beans',
      'Kidney beans',
      'Baked beans',
      'Hummus (large portions)',
      'Split peas'
    ],
    tip: 'Canned beans have 60-70% fewer FODMAPs than dried. Always rinse thoroughly to remove the liquid containing oligosaccharides.',
    quickRecipes: [
      { name: 'Tofu Scramble', ingredients: 'Firm tofu crumbled, turmeric, paprika, spinach, cherry tomatoes, served with rice' },
      { name: 'Lentil & Chicken Bowl', ingredients: 'Small portion canned lentils (rinsed), grilled chicken, carrots, rice, lemon dressing' },
      { name: 'Tempeh Stir-Fry', ingredients: 'Marinated tempeh, bok choy, bell peppers, ginger, rice noodles' }
    ]
  },
  dairy: {
    title: 'Dairy Products',
    description: 'Lactose in milk, soft cheeses, and ice cream is a common bloating trigger. Hard aged cheeses are naturally lower in lactose.',
    safeOptions: [
      'Lactose-free milk',
      'Lactose-free yogurt',
      'Hard cheeses (cheddar, parmesan, swiss)',
      'Butter (small amounts)',
      'Almond milk',
      'Oat milk',
      'Coconut milk',
      'Brie & camembert (small portions)'
    ],
    avoidOptions: [
      'Regular milk',
      'Soft cheeses (ricotta, cottage)',
      'Ice cream',
      'Heavy cream (large amounts)',
      'Milk chocolate',
      'Cream-based sauces'
    ],
    tip: 'Hard aged cheeses like parmesan have almost no lactose. The longer the aging process, the less lactose remains.',
    quickRecipes: [
      { name: 'Lactose-Free Parfait', ingredients: 'Lactose-free yogurt, strawberries, blueberries, pumpkin seeds, drizzle of maple syrup' },
      { name: 'Parmesan Risotto', ingredients: 'Arborio rice, chicken broth, parmesan, butter, white wine, fresh herbs' },
      { name: 'Coconut Milk Smoothie', ingredients: 'Coconut milk, banana, frozen berries, spinach, chia seeds' }
    ]
  },
  fruit: {
    title: 'Fruits',
    description: 'Fructose in certain fruits can ferment in the gut and cause bloating. Stick to lower-fructose options.',
    safeOptions: [
      'Bananas (ripe)',
      'Blueberries (1 cup)',
      'Strawberries (10)',
      'Grapes',
      'Oranges',
      'Kiwi (2)',
      'Pineapple (1 cup)',
      'Cantaloupe (¾ cup)',
      'Raspberries (⅓ cup)'
    ],
    avoidOptions: [
      'Apples',
      'Pears',
      'Mango',
      'Watermelon',
      'Cherries',
      'Dried fruit',
      'Fruit juice (large amounts)',
      'Peaches',
      'Plums'
    ],
    tip: 'Berries are generally safer choices. If you love apples, try small portions and see how you respond individually.',
    quickRecipes: [
      { name: 'Berry Smoothie Bowl', ingredients: 'Frozen strawberries, banana, lactose-free yogurt, topped with blueberries and seeds' },
      { name: 'Tropical Fruit Salad', ingredients: 'Pineapple, kiwi, oranges, grapes, fresh mint, squeeze of lime' },
      { name: 'Banana Oat Pancakes', ingredients: 'Mashed banana, oats, eggs, cinnamon, served with maple syrup and berries' }
    ]
  },
  sugar: {
    title: 'Sugars & Sweeteners',
    description: 'Sugar alcohols and high-fructose sweeteners can cause significant bloating and digestive discomfort.',
    safeOptions: [
      'Table sugar (moderate)',
      'Maple syrup',
      'Rice malt syrup',
      'Glucose',
      'Stevia (2 tsp)',
      'Dark chocolate (30g, 70%+)'
    ],
    avoidOptions: [
      'High-fructose corn syrup',
      'Honey (large amounts)',
      'Agave',
      'Sorbitol',
      'Xylitol',
      'Mannitol',
      'Erythritol',
      'Sugar-free candies'
    ],
    tip: 'Sugar alcohols (ending in -ol) are major bloating triggers. Check labels on "sugar-free" products carefully.',
    quickRecipes: [
      { name: 'Maple Glazed Salmon', ingredients: 'Salmon fillet, maple syrup, soy sauce, ginger, served with rice and vegetables' },
      { name: 'Dark Chocolate Bark', ingredients: 'Melted dark chocolate, pumpkin seeds, dried cranberries, sea salt flakes' },
      { name: 'Vanilla Rice Pudding', ingredients: 'Rice, lactose-free milk, vanilla, maple syrup, cinnamon' }
    ]
  },
  veggies: {
    title: 'Vegetables',
    description: 'Onions, garlic, cruciferous vegetables, and mushrooms contain FODMAPs that can cause bloating.',
    safeOptions: [
      'Carrots (unlimited)',
      'Cucumber (unlimited)',
      'Bell peppers (all colors)',
      'Zucchini',
      'Spinach',
      'Lettuce',
      'Tomatoes',
      'Eggplant',
      'Green beans',
      'Bok choy',
      'Potatoes',
      'Garlic-infused oil'
    ],
    avoidOptions: [
      'Onion (all types)',
      'Garlic',
      'Cauliflower (large portions)',
      'Mushrooms',
      'Asparagus',
      'Artichokes',
      'Brussels sprouts (large)',
      'Snow peas'
    ],
    tip: 'For garlic flavor without the bloat, use garlic-infused oil. The FODMAPs don\'t transfer to oil, only the flavor does.',
    quickRecipes: [
      { name: 'Rainbow Veggie Stir-Fry', ingredients: 'Bell peppers, carrots, zucchini, bok choy, ginger, garlic-infused oil, soy sauce' },
      { name: 'Mediterranean Salad', ingredients: 'Cucumber, tomatoes, olives, feta, spinach, olive oil, lemon dressing' },
      { name: 'Roasted Veggie Medley', ingredients: 'Zucchini, eggplant, bell peppers, cherry tomatoes, olive oil, herbs' }
    ]
  },
  sweeteners: {
    title: 'Artificial Sweeteners',
    description: 'Artificial sweeteners, especially sugar alcohols, can cause significant gas and bloating.',
    safeOptions: [
      'Pure maple syrup',
      'Table sugar (small amounts)',
      'Stevia',
      'Rice malt syrup',
      'Glucose syrup',
      'Brown sugar'
    ],
    avoidOptions: [
      'Sorbitol',
      'Xylitol',
      'Mannitol',
      'Erythritol',
      'Isomalt',
      'High-fructose corn syrup',
      'Agave nectar',
      'Sugar-free gum'
    ],
    tip: 'Check ingredient lists for anything ending in "-ol" - these are sugar alcohols and major bloating culprits.',
    quickRecipes: [
      { name: 'Maple Oatmeal', ingredients: 'Rolled oats, lactose-free milk, maple syrup, banana, cinnamon, walnuts' },
      { name: 'Homemade Lemonade', ingredients: 'Fresh lemon juice, water, table sugar, ice, mint leaves' },
      { name: 'Chia Seed Pudding', ingredients: 'Chia seeds, almond milk, maple syrup, vanilla, topped with berries' }
    ]
  },
  'fatty-food': {
    title: 'Fatty & Fried Foods',
    description: 'High-fat foods slow gastric emptying, causing food to sit longer in the stomach and ferment.',
    safeOptions: [
      'Grilled chicken breast',
      'Baked fish',
      'Air-fried foods',
      'Lean turkey',
      'Olive oil (cooking)',
      'Avocado oil',
      'Grilled vegetables',
      'Steamed dishes'
    ],
    avoidOptions: [
      'Deep-fried foods',
      'Fast food',
      'Creamy sauces',
      'Fatty cuts of meat',
      'Fried chicken',
      'French fries',
      'Onion rings',
      'Heavy cream dishes'
    ],
    tip: 'Baking, grilling, and air-frying give you similar textures to frying without the digestive burden.',
    quickRecipes: [
      { name: 'Lemon Herb Chicken', ingredients: 'Chicken breast, lemon, rosemary, thyme, olive oil, roasted until golden' },
      { name: 'Grilled Salmon', ingredients: 'Salmon fillet, dill, lemon, olive oil, served with quinoa and steamed vegetables' },
      { name: 'Air-Fried Sweet Potato Fries', ingredients: 'Sweet potato wedges, olive oil spray, paprika, salt, dipped in maple mustard' }
    ]
  },
  carbonated: {
    title: 'Carbonated Drinks',
    description: 'The CO₂ gas in carbonated drinks gets trapped in the digestive system, directly causing bloating.',
    safeOptions: [
      'Still water',
      'Herbal teas (peppermint, ginger)',
      'Water with lemon/lime',
      'Coconut water',
      'Fresh-brewed iced tea',
      'Infused water (cucumber, mint)',
      'Lactose-free milk'
    ],
    avoidOptions: [
      'Soda / soft drinks',
      'Sparkling water',
      'Beer',
      'Champagne',
      'Energy drinks',
      'Kombucha',
      'Sparkling wine',
      'Club soda'
    ],
    tip: 'Even "healthy" sparkling water causes bloating. The carbonation itself is the problem, not just the sugars.',
    quickRecipes: [
      { name: 'Cucumber Mint Infusion', ingredients: 'Still water, fresh cucumber slices, mint leaves, lemon wedges, ice' },
      { name: 'Ginger Wellness Tea', ingredients: 'Fresh ginger slices, hot water, lemon, honey (small amount), served warm or iced' },
      { name: 'Berry Infused Water', ingredients: 'Still water, muddled strawberries, blueberries, fresh basil leaves' }
    ]
  },
  alcohol: {
    title: 'Alcohol & Cocktails',
    description: 'Beer contains carbonation and fermentable carbs. Sugary cocktails often have high-fructose mixers.',
    safeOptions: [
      'Dry red wine (5 oz)',
      'Dry white wine (5 oz)',
      'Vodka with still water',
      'Gin with lime juice',
      'Whiskey (neat or rocks)',
      'Tequila with fresh lime'
    ],
    avoidOptions: [
      'Beer (all types)',
      'Cider',
      'Sugary cocktails',
      'Rum (with sugary mixers)',
      'Champagne',
      'Sweet wines',
      'Margarita mixes',
      'Drinks with juice'
    ],
    tip: 'Stick to dry wines or clear spirits with still water or fresh citrus. Avoid all carbonated mixers.',
    quickRecipes: [
      { name: 'Wine Spritzer (Still)', ingredients: 'Dry white wine, still water, fresh lemon slice, ice' },
      { name: 'Clean Vodka Lime', ingredients: 'Vodka, still water, fresh lime juice, lime wedge, mint' },
      { name: 'Mocktail Option', ingredients: 'Still water, muddled berries, fresh lime, mint, ice' }
    ]
  },
  processed: {
    title: 'Processed Foods',
    description: 'Processed foods often contain hidden onion/garlic powder, inulin, high-fructose corn syrup, and other FODMAP additives.',
    safeOptions: [
      'Fresh vegetables',
      'Fresh meats',
      'Plain rice',
      'Plain potatoes',
      'Eggs',
      'Plain oats',
      'Frozen plain vegetables',
      'FODY Foods brand'
    ],
    avoidOptions: [
      'Premade sauces',
      'Seasoning packets',
      'Processed meats (check labels)',
      'Instant noodles',
      'Granola bars',
      'Protein bars',
      'Premade soups',
      'Chips with seasonings'
    ],
    tip: 'Always check labels for onion powder, garlic powder, honey, inulin, chicory root, and HFCS - they\'re hidden everywhere.',
    quickRecipes: [
      { name: 'Simple Grilled Chicken', ingredients: 'Chicken breast, olive oil, salt, pepper, fresh herbs, lemon' },
      { name: 'Homemade Rice Bowl', ingredients: 'Plain rice, grilled protein, steamed carrots, zucchini, soy sauce, ginger' },
      { name: 'DIY Salad Dressing', ingredients: 'Olive oil, lemon juice, Dijon mustard, salt, pepper, fresh herbs' }
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
          const topFood = trigger.topFoods[0] || categoryInfo?.displayName || trigger.category;

          // Fetch image from Pexels
          const imageData = await getFoodImage(topFood, trigger.category).catch(() => null);

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
              Your Top Bloat Triggers
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
              Your Top Bloat Triggers
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
                Your Top Bloat Triggers
              </h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Based on your meal history
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
              {/* Background Image with Overlay */}
              {topTrigger.imageUrl && (
                <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
                  <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${topTrigger.imageUrl})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.to} opacity-50`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
              )}

              {/* Fallback gradient if no image */}
              {!topTrigger.imageUrl && (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.to}`} />
              )}

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Section - Severity Badge */}
                <div className="flex justify-between items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className={`px-4 py-2 rounded-full backdrop-blur-md bg-white/20 border border-white/30 shadow-lg`}
                  >
                    <span className="text-sm font-bold text-white drop-shadow-md">
                      #1 Trigger
                    </span>
                  </motion.div>

                  {/* Severity indicator bar */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <motion.div
                        key={level}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.6 + level * 0.1, duration: 0.3 }}
                        className={`w-2 rounded-full ${
                          topTrigger.impactScore >= level * 0.5
                            ? 'bg-white shadow-lg'
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
                    {/* Why It Triggers + Stats Combined */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative overflow-hidden rounded-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50" />
                      <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-5">
                        {/* Why section */}
                        <div className="flex items-start gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 flex items-center justify-center flex-shrink-0">
                            <AlertCircle size={20} className="text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm mb-1">Why {topTrigger.displayName} triggers bloating</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {SAFE_ALTERNATIVES_DATA[topTrigger.category]?.description || `${topTrigger.displayName} has been consistently linked to your bloating episodes.`}
                            </p>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                          <div className="text-center">
                            <div className="text-2xl font-black text-foreground">{topTrigger.occurrences}</div>
                            <div className="text-[11px] text-muted-foreground font-medium">occurrences</div>
                          </div>
                          <div className="w-px h-10 bg-gray-200" />
                          <div className="text-center">
                            <div className="text-2xl font-black text-foreground">{topTrigger.avgBloatingWith}<span className="text-base font-bold text-muted-foreground">/5</span></div>
                            <div className="text-[11px] text-muted-foreground font-medium">avg bloating</div>
                          </div>
                          <div className="w-px h-10 bg-gray-200" />
                          <div className="text-center">
                            <div className="text-2xl font-black text-foreground">{topTrigger.percentage}%</div>
                            <div className="text-[11px] text-muted-foreground font-medium">of meals</div>
                          </div>
                        </div>

                        {/* Common foods */}
                        {topTrigger.topFoods.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-xs font-semibold text-muted-foreground">Your common triggers: </span>
                            <span className="text-xs text-foreground">{topTrigger.topFoods.slice(0, 4).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {SAFE_ALTERNATIVES_DATA[topTrigger.category] && (
                      <>
                        {/* Safe Options Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" />
                          <div className="relative bg-white/60 backdrop-blur-xl border border-emerald-200/60 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <ShieldCheck size={16} className="text-white" />
                              </div>
                              <h4 className="font-bold text-emerald-900">Safe to Eat</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {SAFE_ALTERNATIVES_DATA[topTrigger.category].safeOptions.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.25 + idx * 0.03 }}
                                  className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/60 transition-colors"
                                >
                                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} className="text-emerald-600" strokeWidth={3} />
                                  </div>
                                  <span className="text-sm text-foreground">{item}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* Avoid Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-red-50 to-pink-50" />
                          <div className="relative bg-white/60 backdrop-blur-xl border border-rose-200/60 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                                <Ban size={16} className="text-white" />
                              </div>
                              <h4 className="font-bold text-rose-900">Avoid These</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {SAFE_ALTERNATIVES_DATA[topTrigger.category].avoidOptions.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.35 + idx * 0.03 }}
                                  className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/60 transition-colors"
                                >
                                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                                    <X size={12} className="text-rose-600" strokeWidth={3} />
                                  </div>
                                  <span className="text-sm text-foreground">{item}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* Pro Tip Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50" />
                          <div className="relative bg-white/60 backdrop-blur-xl border border-amber-200/60 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                                <Lightbulb size={16} className="text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-amber-900 mb-1">Pro Tip</h4>
                                <p className="text-sm text-amber-800/80 leading-relaxed">
                                  {SAFE_ALTERNATIVES_DATA[topTrigger.category].tip}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Recipe Ideas */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="relative overflow-hidden rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50" />
                          <div className="relative bg-white/60 backdrop-blur-xl border border-violet-200/60 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                <ChefHat size={16} className="text-white" />
                              </div>
                              <h4 className="font-bold text-violet-900">Recipe Ideas</h4>
                            </div>
                            <div className="space-y-4">
                              {SAFE_ALTERNATIVES_DATA[topTrigger.category].quickRecipes.map((recipe, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.55 + idx * 0.1 }}
                                  className="bg-white/70 rounded-xl p-4 border border-violet-100"
                                >
                                  <h5 className="font-bold text-violet-900 text-sm mb-2">{recipe.name}</h5>
                                  <p className="text-xs text-violet-700/80 leading-relaxed">{recipe.ingredients}</p>
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
                  <TrendingUp size={16} className="text-amber-600" />
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
                        className={`relative overflow-hidden rounded-2xl h-20 cursor-pointer group transition-all duration-300 shadow-lg ${colors.glow}`}
                      >
                        {/* Background Image */}
                        {trigger.imageUrl && (
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-25"
                            style={{ backgroundImage: `url(${trigger.imageUrl})` }}
                          />
                        )}

                        {/* Gradient base */}
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} opacity-10 group-hover:opacity-20 transition-opacity`} />

                        {/* Content */}
                        <div className="relative h-full flex items-center justify-between px-5">
                          <div className="flex items-center gap-4">
                            {/* Severity indicator */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3].map((level) => (
                                <div
                                  key={level}
                                  className={`w-1.5 rounded-full transition-all ${
                                    trigger.impactScore >= level * 0.7
                                      ? `${getSeverityColor(trigger.impactScore)}`
                                      : 'bg-gray-200 dark:bg-gray-700'
                                  }`}
                                  style={{ height: `${10 + level * 4}px` }}
                                />
                              ))}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">
                                {trigger.displayName}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium">
                                {getSeverityLabel(trigger.impactScore)} • {trigger.occurrences} meals
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getSeverityBadgeColor(trigger.impactScore)}`}>
                              {trigger.avgBloatingWith.toFixed(1)}/5
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={18} className="text-muted-foreground" />
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
                              {/* Why + Stats */}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60"
                              >
                                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                  {SAFE_ALTERNATIVES_DATA[trigger.category]?.description || `${trigger.displayName} has been linked to your bloating.`}
                                </p>
                                <div className="flex items-center justify-between text-center pt-3 border-t border-gray-100">
                                  <div>
                                    <div className="text-lg font-black text-foreground">{trigger.avgBloatingWith}<span className="text-sm font-bold text-muted-foreground">/5</span></div>
                                    <div className="text-[10px] text-muted-foreground">bloating</div>
                                  </div>
                                  <div className="w-px h-8 bg-gray-200" />
                                  <div>
                                    <div className="text-lg font-black text-foreground">{trigger.percentage}%</div>
                                    <div className="text-[10px] text-muted-foreground">of meals</div>
                                  </div>
                                  <div className="w-px h-8 bg-gray-200" />
                                  <div>
                                    <div className="text-lg font-black text-foreground">{trigger.occurrences}</div>
                                    <div className="text-[10px] text-muted-foreground">times</div>
                                  </div>
                                </div>
                              </motion.div>

                              {SAFE_ALTERNATIVES_DATA[trigger.category] && (
                                <>
                                  {/* Safe Options - Compact */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/60"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <Check size={10} className="text-white" strokeWidth={3} />
                                      </div>
                                      <span className="text-xs font-bold text-emerald-800">Safe Options</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].safeOptions.slice(0, 5).map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex items-center gap-2 text-xs text-emerald-900/80">
                                          <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                          {item}
                                        </div>
                                      ))}
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].safeOptions.length > 5 && (
                                        <div className="text-[10px] text-emerald-600 font-semibold mt-2">
                                          +{SAFE_ALTERNATIVES_DATA[trigger.category].safeOptions.length - 5} more options
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>

                                  {/* Avoid Options - Compact */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gradient-to-br from-rose-50 to-red-50 backdrop-blur-sm rounded-xl p-4 border border-rose-200/60"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                                        <X size={10} className="text-white" strokeWidth={3} />
                                      </div>
                                      <span className="text-xs font-bold text-rose-800">Avoid These</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].avoidOptions.slice(0, 4).map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex items-center gap-2 text-xs text-rose-900/80">
                                          <div className="w-1 h-1 rounded-full bg-rose-400" />
                                          {item}
                                        </div>
                                      ))}
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].avoidOptions.length > 4 && (
                                        <div className="text-[10px] text-rose-600 font-semibold mt-2">
                                          +{SAFE_ALTERNATIVES_DATA[trigger.category].avoidOptions.length - 4} more to avoid
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>

                                  {/* Pro Tip - Compact */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-sm rounded-xl p-4 border border-amber-200/60"
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Lightbulb size={10} className="text-white" />
                                      </div>
                                      <p className="text-xs text-amber-900/80 leading-relaxed">
                                        <span className="font-bold">Tip: </span>
                                        {SAFE_ALTERNATIVES_DATA[trigger.category].tip}
                                      </p>
                                    </div>
                                  </motion.div>

                                  {/* Quick Recipe - Compact */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-violet-50 to-purple-50 backdrop-blur-sm rounded-xl p-4 border border-violet-200/60"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                        <ChefHat size={10} className="text-white" />
                                      </div>
                                      <span className="text-xs font-bold text-violet-800">Try This</span>
                                    </div>
                                    <div className="font-semibold text-violet-900 text-xs mb-1">
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].quickRecipes[0].name}
                                    </div>
                                    <p className="text-[11px] text-violet-700/70 leading-relaxed">
                                      {SAFE_ALTERNATIVES_DATA[trigger.category].quickRecipes[0].ingredients}
                                    </p>
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
                                  <div className="text-xs font-semibold text-muted-foreground mb-2">Common triggers:</div>
                                  <div className="text-xs text-foreground">{trigger.topFoods.slice(0, 4).join(', ')}</div>
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
