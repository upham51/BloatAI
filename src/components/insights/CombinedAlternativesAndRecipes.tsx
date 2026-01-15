import { useState, useEffect } from 'react';
import { ChevronRight, Heart, Sparkles, ChefHat, ExternalLink, Clock, Users, Loader2 } from 'lucide-react';
import { getSafeAlternativesDetailed, type SafeAlternativeItem } from '@/lib/triggerUtils';
import { getTriggerCategory } from '@/types';
import { useMeals } from '@/contexts/MealContext';
import { getSafeFoodRecipes, Recipe } from '@/lib/spoonacularApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { isLowBloating } from '@/lib/bloatingUtils';
import { getFoodImage } from '@/lib/pexelsApi';

interface CombinedAlternativesAndRecipesProps {
  topTriggers: string[]; // Array of trigger category IDs
}

interface AlternativeWithImage extends SafeAlternativeItem {
  imageUrl: string | null;
  loading: boolean;
}

interface TriggerRecommendation {
  triggerId: string;
  triggerName: string;
  alternatives: AlternativeWithImage[];
  keyBrands: string[];
  protip: string;
  color: string;
  examples: string;
}

export function CombinedAlternativesAndRecipes({ topTriggers }: CombinedAlternativesAndRecipesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRecipes, setShowRecipes] = useState(false);
  const [recommendations, setRecommendations] = useState<TriggerRecommendation[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(true);

  const { entries } = useMeals();
  const { toast } = useToast();

  // Load alternatives with images for top 5 triggers
  useEffect(() => {
    async function loadAlternativesWithImages() {
      const triggers = topTriggers.slice(0, 5).map((triggerId) => {
        const category = getTriggerCategory(triggerId);
        const alternativesData = getSafeAlternativesDetailed(triggerId);

        return {
          triggerId,
          triggerName: category?.displayName || triggerId,
          alternatives: (alternativesData?.alternatives.slice(0, 6) || []).map(alt => ({
            ...alt,
            imageUrl: null,
            loading: true,
          })),
          keyBrands: alternativesData?.keyBrands || [],
          protip: alternativesData?.protip || 'Swap gradually, one food at a time, to identify what works best for you.',
          color: category?.color || '#7FB069',
          examples: category?.examples || '',
        };
      });

      setRecommendations(triggers);

      // Load images for all alternatives
      for (let triggerIdx = 0; triggerIdx < triggers.length; triggerIdx++) {
        const trigger = triggers[triggerIdx];
        for (let altIdx = 0; altIdx < trigger.alternatives.length; altIdx++) {
          const alt = trigger.alternatives[altIdx];
          try {
            const imageData = await getFoodImage(alt.name, trigger.triggerId);

            setRecommendations(prev => {
              const updated = [...prev];
              if (updated[triggerIdx]?.alternatives[altIdx]) {
                updated[triggerIdx].alternatives[altIdx] = {
                  ...updated[triggerIdx].alternatives[altIdx],
                  imageUrl: imageData?.url || null,
                  loading: false,
                };
              }
              return updated;
            });
          } catch (error) {
            console.error(`Failed to load image for ${alt.name}:`, error);
            setRecommendations(prev => {
              const updated = [...prev];
              if (updated[triggerIdx]?.alternatives[altIdx]) {
                updated[triggerIdx].alternatives[altIdx] = {
                  ...updated[triggerIdx].alternatives[altIdx],
                  imageUrl: null,
                  loading: false,
                };
              }
              return updated;
            });
          }
        }
      }
    }

    if (topTriggers.length > 0) {
      loadAlternativesWithImages();
    }
  }, [topTriggers]);

  // Extract safe ingredients from user's low-bloating meals
  const getSafeIngredients = (): string[] => {
    const completedEntries = entries.filter(
      e => e.rating_status === 'completed' && isLowBloating(e.bloating_rating)
    );

    if (completedEntries.length === 0) return [];

    const commonFoods = new Set<string>();

    completedEntries.forEach(entry => {
      const description = entry.meal_description.toLowerCase();

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

    return Array.from(commonFoods).slice(0, 5);
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

    return Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  };

  // Fetch recipe suggestions
  const fetchRecipes = async () => {
    setIsLoadingRecipes(true);

    try {
      const safeIngredients = getSafeIngredients();
      const triggerCategories = getTriggerCategories();

      const fetchedRecipes = await getSafeFoodRecipes(
        safeIngredients,
        triggerCategories,
        6
      );

      if (fetchedRecipes.length === 0) {
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
      setIsLoadingRecipes(false);
    }
  };

  // Load recipes when showing recipe tab
  useEffect(() => {
    if (showRecipes && recipes.length === 0 && !isLoadingRecipes) {
      fetchRecipes();
    }
  }, [showRecipes]);

  if (recommendations.length === 0) {
    return null;
  }

  const currentRec = recommendations[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'left' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="premium-card p-6 space-y-5">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-mint/30 to-sage/20">
            {showRecipes ? (
              <ChefHat className="w-5 h-5 text-orange" />
            ) : (
              <Heart className="w-5 h-5 text-mint" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">
              {showRecipes ? 'Recipe Suggestions' : 'Safe Alternatives'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {showRecipes ? 'Based on your safe foods' : 'Better choices for your gut'}
            </p>
          </div>
        </div>
        {!showRecipes && recommendations.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30">
            <span className="font-bold text-foreground text-sm">{currentIndex + 1}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{recommendations.length}</span>
          </div>
        )}
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
        <button
          onClick={() => setShowRecipes(false)}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            !showRecipes
              ? 'bg-card shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Safe Alternatives
        </button>
        <button
          onClick={() => setShowRecipes(true)}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            showRecipes
              ? 'bg-card shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recipes
        </button>
      </div>

      {/* Content */}
      {!showRecipes ? (
        // Safe Alternatives Section
        <div className="relative">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-lavender/10 via-mint/5 to-sage/10 border border-border/50 transition-all duration-300">
            <div className="p-6 space-y-5">
              {/* Header section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wide text-primary">
                    Instead of
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-bold text-foreground">
                    {currentRec.triggerName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
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
                  {currentRec.alternatives.map((alt: AlternativeWithImage, i: number) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-mint/50 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer h-32"
                    >
                      {/* Background Image at 100% opacity */}
                      {alt.imageUrl && !alt.loading && (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${alt.imageUrl})`,
                          }}
                        />
                      )}

                      {/* Loading state */}
                      {alt.loading && (
                        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-end p-3 text-white">
                        <span className="text-sm font-bold drop-shadow-lg leading-tight">
                          {alt.name}
                        </span>
                        {alt.portion && (
                          <span className="text-xs font-medium drop-shadow-md mt-0.5 text-mint-200">
                            {alt.portion}
                          </span>
                        )}
                        {alt.notes && (
                          <span className="text-xs drop-shadow-md mt-0.5 text-white/90">
                            {alt.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key brands section */}
              {currentRec.keyBrands.length > 0 && (
                <div className="p-4 rounded-xl bg-lavender/5 border border-lavender/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-lavender mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">Recommended Brands:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {currentRec.keyBrands.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pro tip section */}
              <div className="p-4 rounded-xl bg-mint/5 border border-mint/20">
                <p className="text-xs leading-relaxed">
                  <span className="font-bold text-foreground">💚 Pro tip:</span>{' '}
                  <span className="text-muted-foreground">
                    {currentRec.protip}
                  </span>
                </p>
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

          {/* Swipe arrows */}
          {recommendations.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={() => handleSwipe('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-3 rounded-full bg-card border-2 border-border/50 shadow-xl hover:scale-110 hover:border-primary/50 transition-all z-10"
                  aria-label="Previous recommendation"
                >
                  <ChevronRight className="w-5 h-5 text-foreground rotate-180" />
                </button>
              )}
              {currentIndex < recommendations.length - 1 && (
                <button
                  onClick={() => handleSwipe('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-3 rounded-full bg-card border-2 border-border/50 shadow-xl hover:scale-110 hover:border-primary/50 transition-all z-10"
                  aria-label="Next recommendation"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        // Recipe Suggestions Section
        <div>
          {isLoadingRecipes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !hasApiKey ? (
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
          ) : recipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recipes found. Try logging more meals!
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange/5 via-peach/5 to-coral/5 border border-border/50">
                {/* Recipe Image */}
                {recipes[currentRecipeIndex]?.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipes[currentRecipeIndex].image}
                      alt={recipes[currentRecipeIndex].title}
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
                      {recipes[currentRecipeIndex]?.title}
                    </h4>
                  </div>

                  {/* Recipe Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {recipes[currentRecipeIndex]?.readyInMinutes && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{recipes[currentRecipeIndex].readyInMinutes} min</span>
                      </div>
                    )}
                    {recipes[currentRecipeIndex]?.servings && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{recipes[currentRecipeIndex].servings} servings</span>
                      </div>
                    )}
                  </div>

                  {/* Diet Tags */}
                  {recipes[currentRecipeIndex]?.diets && recipes[currentRecipeIndex].diets.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipes[currentRecipeIndex].diets.slice(0, 3).map((diet, i) => (
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
                  {recipes[currentRecipeIndex]?.sourceUrl && (
                    <Button
                      onClick={() => window.open(recipes[currentRecipeIndex].sourceUrl, '_blank')}
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
                      onClick={() => setCurrentRecipeIndex(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentRecipeIndex
                          ? 'w-8 h-2.5 bg-primary shadow-sm'
                          : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to recipe ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pro Tip */}
          {recipes.length > 0 && (
            <div className="p-4 rounded-xl bg-mint/5 border border-mint/20 mt-5">
              <p className="text-xs leading-relaxed">
                <span className="font-bold text-foreground">💡 Pro tip:</span>{' '}
                <span className="text-muted-foreground">
                  These recipes are suggested based on ingredients from your low-bloating meals. Always check ingredients for your specific triggers!
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
