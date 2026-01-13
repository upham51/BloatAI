import { useState, useEffect } from 'react';
import { ChefHat, ExternalLink, Clock, Users, Sparkles, Loader2 } from 'lucide-react';
import { useMeals } from '@/contexts/MealContext';
import { getSafeFoodRecipes, Recipe } from '@/lib/spoonacularApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { isLowBloating } from '@/lib/bloatingUtils';

export function RecipeSuggester() {
  const { entries } = useMeals();
  const { toast } = useToast();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Extract safe ingredients from user's low-bloating meals
  const getSafeIngredients = (): string[] => {
    const completedEntries = entries.filter(
      e => e.rating_status === 'completed' && isLowBloating(e.bloating_rating)
    );

    if (completedEntries.length === 0) return [];

    // Extract foods from meal descriptions (simple text analysis)
    const commonFoods = new Set<string>();

    completedEntries.forEach(entry => {
      const description = entry.meal_description.toLowerCase();

      // Extract common food keywords
      const foodKeywords = [
        'chicken', 'salmon', 'rice', 'quinoa', 'spinach', 'carrot',
        'zucchini', 'cucumber', 'tomato', 'lettuce', 'egg', 'potato',
        'sweet potato', 'banana', 'strawberry', 'blueberry', 'oats',
        'turkey', 'fish', 'tofu', 'kale', 'bell pepper'
      ];

      foodKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
          commonFoods.add(keyword);
        }
      });
    });

    return Array.from(commonFoods).slice(0, 5); // Use top 5 safe ingredients
  };

  // Get trigger categories to exclude
  const getTriggerCategories = (): string[] => {
    const completedEntries = entries.filter(e => e.rating_status === 'completed');

    const triggerCounts: Record<string, number> = {};

    completedEntries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        triggerCounts[trigger.category] = (triggerCounts[trigger.category] || 0) + 1;
      });
    });

    // Get top 3 most frequent trigger categories
    return Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  };

  // Fetch recipe suggestions
  const fetchRecipes = async () => {
    setIsLoading(true);

    try {
      const safeIngredients = getSafeIngredients();
      const triggerCategories = getTriggerCategories();

      const fetchedRecipes = await getSafeFoodRecipes(
        safeIngredients,
        triggerCategories,
        6
      );

      if (fetchedRecipes.length === 0) {
        // Check if API key is configured
        setHasApiKey(false);
        toast({
          title: 'API Key Required',
          description: 'Add VITE_SPOONACULAR_API_KEY to your .env file to enable recipes.',
        });
      } else {
        setRecipes(fetchedRecipes);
        setHasApiKey(true);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load recipe suggestions. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recipes on component mount
  useEffect(() => {
    if (entries.length > 0) {
      fetchRecipes();
    }
  }, [entries.length]); // Only refetch when entry count changes

  // Don't render if not enough data
  if (entries.filter(e => e.rating_status === 'completed').length < 3) {
    return null;
  }

  // Show setup message if API key not configured
  if (!hasApiKey) {
    return (
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange/30 to-peach/30">
            <ChefHat className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">Recipe Suggestions</h3>
            <p className="text-xs text-muted-foreground">
              Personalized recipes based on your safe foods
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-sm text-muted-foreground mb-3">
            Recipe suggestions require a Spoonacular API key (free tier: 150 requests/day).
          </p>
          <ol className="text-xs text-muted-foreground space-y-2 ml-4 list-decimal">
            <li>Sign up at <a href="https://spoonacular.com/food-api/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">spoonacular.com</a></li>
            <li>Get your free API key</li>
            <li>Add <code className="px-1 py-0.5 bg-muted rounded">VITE_SPOONACULAR_API_KEY</code> to your .env file</li>
            <li>Restart your development server</li>
          </ol>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="premium-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange/30 to-peach/30">
            <ChefHat className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">Recipe Suggestions</h3>
            <p className="text-xs text-muted-foreground">
              Finding delicious recipes for you...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // No recipes found
  if (recipes.length === 0) {
    return null;
  }

  const currentRecipe = recipes[currentIndex];

  return (
    <div className="premium-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange/30 to-peach/30">
            <ChefHat className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">Recipe Suggestions</h3>
            <p className="text-xs text-muted-foreground">
              Based on your safe foods
            </p>
          </div>
        </div>
        {recipes.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30">
            <span className="font-bold text-foreground text-sm">{currentIndex + 1}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{recipes.length}</span>
          </div>
        )}
      </div>

      {/* Recipe Card */}
      <div className="relative">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange/5 via-peach/5 to-coral/5 border border-border/50">
          {/* Recipe Image */}
          {currentRecipe.image && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={currentRecipe.image}
                alt={currentRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Recipe Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  Gut-Friendly Recipe
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground line-clamp-2">
                {currentRecipe.title}
              </h4>
            </div>

            {/* Recipe Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {currentRecipe.readyInMinutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{currentRecipe.readyInMinutes} min</span>
                </div>
              )}
              {currentRecipe.servings && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{currentRecipe.servings} servings</span>
                </div>
              )}
            </div>

            {/* Diet Tags */}
            {currentRecipe.diets && currentRecipe.diets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentRecipe.diets.slice(0, 3).map((diet, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            )}

            {/* View Recipe Button */}
            {currentRecipe.sourceUrl && (
              <Button
                onClick={() => window.open(currentRecipe.sourceUrl, '_blank')}
                className="w-full"
                variant="default"
              >
                View Full Recipe
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Accent Bar */}
          <div className="h-1 w-full bg-gradient-to-r from-orange via-peach to-coral" />
        </div>

        {/* Navigation Dots */}
        {recipes.length > 1 && (
          <div className="flex items-center justify-center gap-2.5 mt-5">
            {recipes.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-8 h-2.5 bg-primary shadow-sm'
                    : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to recipe ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pro Tip */}
      <div className="p-4 rounded-xl bg-mint/5 border border-mint/20">
        <p className="text-xs leading-relaxed">
          <span className="font-bold text-foreground">💡 Pro tip:</span>{' '}
          <span className="text-muted-foreground">
            These recipes are suggested based on ingredients from your low-bloating meals. Always check ingredients for your specific triggers!
          </span>
        </p>
      </div>
    </div>
  );
}
