import { useState, useMemo } from 'react';
import { Search, X, ArrowRight, ChevronDown, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotesInput } from './NotesInput';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MealEntry, DetectedTrigger, RATING_LABELS, getTriggerCategory, TRIGGER_CATEGORIES } from '@/types';
import { validateMealDescription } from '@/lib/bloatingUtils';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export function TextOnlyEntry() {
  const navigate = useNavigate();
  const { addEntry, entries } = useMeals();
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null);
  const [manualMealTitle, setManualMealTitle] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<DetectedTrigger[]>([]);
  const [notes, setNotes] = useState('');
  const [bloatingRating, setBloatingRating] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get unique recent meals (last 30 days, unique by title)
  const recentMeals = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const seen = new Set<string>();
    return entries
      .filter(e => new Date(e.created_at) >= thirtyDaysAgo)
      .filter(e => {
        const title = e.custom_title || e.meal_title || e.meal_description.slice(0, 30);
        if (seen.has(title.toLowerCase())) return false;
        seen.add(title.toLowerCase());
        return true;
      })
      .slice(0, 6);
  }, [entries]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    const seen = new Set<string>();
    return entries
      .filter(e => {
        const title = e.custom_title || e.meal_title || e.meal_description;
        return title.toLowerCase().includes(query);
      })
      .filter(e => {
        const title = (e.custom_title || e.meal_title || e.meal_description.slice(0, 30)).toLowerCase();
        if (seen.has(title)) return false;
        seen.add(title);
        return true;
      })
      .slice(0, 5);
  }, [entries, searchQuery]);

  const getMealTitle = (meal: MealEntry) => {
    return meal.custom_title || meal.meal_title || meal.meal_description.slice(0, 30);
  };

  const getMealEmoji = (meal: MealEntry) => {
    return meal.meal_emoji || '🍽️';
  };

  const addTriggerFromCategory = (categoryId: string) => {
    const categoryInfo = getTriggerCategory(categoryId);
    if (!categoryInfo) return;
    
    const exists = selectedTriggers.some(t => t.category === categoryId);
    if (exists) return;
    
    setSelectedTriggers(prev => [...prev, {
      category: categoryId,
      food: categoryInfo.displayName,
      confidence: 1
    }]);
  };

  const removeTrigger = (index: number) => {
    setSelectedTriggers(prev => prev.filter((_, i) => i !== index));
  };

  const selectMeal = (meal: MealEntry) => {
    setSelectedMeal(meal);
    setSelectedTriggers(meal.detected_triggers || []);
    setSearchQuery('');
  };

  const clearSelection = () => {
    setSelectedMeal(null);
    setSelectedTriggers([]);
  };

  const handleAICategorizeTriggers = async () => {
    const mealText = manualMealTitle.trim();

    if (!mealText) {
      toast({
        variant: 'destructive',
        title: 'No meal entered',
        description: 'Please enter a meal name first.',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-meal-text', {
        body: { mealText }
      });

      if (error) throw error;

      if (data?.triggers && Array.isArray(data.triggers)) {
        // Add new triggers, avoiding duplicates
        const newTriggers = data.triggers.filter((newTrigger: DetectedTrigger) =>
          !selectedTriggers.some(existing => existing.category === newTrigger.category)
        );

        if (newTriggers.length > 0) {
          setSelectedTriggers(prev => [...prev, ...newTriggers]);
          toast({
            title: 'Triggers detected!',
            description: `Found ${newTriggers.length} potential trigger${newTriggers.length !== 1 ? 's' : ''}.`,
          });
        } else {
          toast({
            title: 'No new triggers found',
            description: 'All detected triggers are already added.',
          });
        }
      } else if (data?.triggers?.length === 0) {
        toast({
          title: 'No triggers detected',
          description: 'This meal appears to be low in common triggers!',
        });
      }
    } catch (error) {
      console.error('AI categorization error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to analyze',
        description: 'Please try again or add triggers manually.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const title = selectedMeal
      ? getMealTitle(selectedMeal)
      : manualMealTitle.trim();

    // Validate meal description
    const validation = validateMealDescription(title);
    if (!validation.valid) {
      toast({
        variant: 'destructive',
        title: 'Invalid meal name',
        description: validation.error || 'Please enter a valid meal name.',
      });
      return;
    }

    // Warn if no triggers selected (but allow save)
    if (selectedTriggers.length === 0 && !selectedMeal) {
      toast({
        title: 'No triggers added',
        description: 'Adding triggers helps us provide better insights.',
      });
    }

    setIsSaving(true);

    try {
      const ratingDueAt = bloatingRating
        ? null
        : new Date(Date.now() + 90 * 60 * 1000).toISOString();

      await addEntry({
        meal_description: title,
        photo_url: null,
        portion_size: null,
        eating_speed: null,
        social_setting: null,
        bloating_rating: bloatingRating,
        rating_status: bloatingRating ? 'completed' : 'pending',
        rating_due_at: ratingDueAt,
        detected_triggers: selectedTriggers,
        custom_title: title,
        meal_emoji: selectedMeal?.meal_emoji || '🍽️',
        meal_title: title,
        title_options: [],
        notes: notes || null,
        entry_method: 'text',
      });

      toast({
        title: 'Meal logged!',
        description: bloatingRating
          ? 'Thanks for rating your meal.'
          : "We'll remind you to rate in 90 minutes.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = selectedMeal || manualMealTitle.trim();

  return (
    <div className="flex-1 flex flex-col p-5 space-y-5 overflow-y-auto pb-32">
      {/* Search Section */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">What did you eat?</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or type meal name..."
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 bg-card rounded-2xl border border-border/50 p-2">
            {searchResults.map((meal) => (
              <button
                key={meal.id}
                onClick={() => selectMeal(meal)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-2xl">{getMealEmoji(meal)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{getMealTitle(meal)}</p>
                  <p className="text-xs text-muted-foreground">
                    Last eaten {new Date(meal.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Meals */}
      {!selectedMeal && !searchQuery && recentMeals.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Recent meals:
          </p>
          <div className="flex flex-wrap gap-2">
            {recentMeals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => selectMeal(meal)}
                className="px-3 py-2 rounded-full bg-card border border-border/50 text-sm font-medium hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {getMealEmoji(meal)} {getMealTitle(meal)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Meal Card */}
      {selectedMeal && (
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getMealEmoji(selectedMeal)}</span>
              <span className="font-bold text-foreground">{getMealTitle(selectedMeal)}</span>
            </div>
            <button
              onClick={clearSelection}
              className="text-sm text-primary font-medium hover:underline"
            >
              Change
            </button>
          </div>

          {selectedTriggers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Known triggers:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTriggers.map((trigger, i) => {
                  const categoryInfo = getTriggerCategory(trigger.category);
                  return (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${categoryInfo?.color}15`,
                        color: categoryInfo?.color,
                        border: `1px solid ${categoryInfo?.color}30`
                      }}
                    >
                      {trigger.food}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry */}
      {!selectedMeal && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">Or enter manually:</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <Input
            value={manualMealTitle}
            onChange={(e) => setManualMealTitle(e.target.value.slice(0, 40))}
            placeholder="e.g., Chicken Caesar Salad"
            className="rounded-xl"
          />

          {/* AI Categorization Button */}
          {manualMealTitle.trim() && (
            <button
              onClick={handleAICategorizeTriggers}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Categorize Triggers</span>
                </>
              )}
            </button>
          )}

          {/* Trigger Selection - Dropdown Style */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {selectedTriggers.length > 0 ? 'Detected triggers:' : 'Or add triggers manually:'}
            </p>
            
            {/* Selected Triggers */}
            {selectedTriggers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTriggers.map((trigger, index) => {
                  const categoryInfo = getTriggerCategory(trigger.category);
                  return (
                    <span
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${categoryInfo?.color}15`,
                        color: categoryInfo?.color,
                        border: `1px solid ${categoryInfo?.color}30`
                      }}
                    >
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: categoryInfo?.color }} 
                      />
                      {categoryInfo?.displayName}
                      <button 
                        onClick={() => removeTrigger(index)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            
            {/* Dropdown Selector */}
            <Select onValueChange={addTriggerFromCategory}>
              <SelectTrigger className="w-full rounded-xl bg-card border-border/50">
                <SelectValue placeholder="+ Add a trigger category..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {TRIGGER_CATEGORIES.map((category) => {
                  const isSelected = selectedTriggers.some(t => t.category === category.id);
                  if (isSelected) return null;
                  return (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <span className="font-medium">{category.displayName}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {category.examples}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Helpful hint */}
            {!selectedMeal && selectedTriggers.length === 0 && manualMealTitle.trim().length > 0 && !isAnalyzing && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-900">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-violet-800 dark:text-violet-200">
                  <span className="font-semibold">Try AI categorization!</span> Click the button above to automatically detect triggers in your meal.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="glass-card p-4">
        <NotesInput value={notes} onChange={setNotes} />
      </div>

      {/* Bloating Rating */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <label className="text-sm font-semibold text-foreground">
            How do you feel right now?
          </label>
        </div>
        <p className="text-xs text-muted-foreground">You can update this later</p>
        
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => setBloatingRating(bloatingRating === rating ? null : rating)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                bloatingRating === rating
                  ? 'border-primary bg-primary text-primary-foreground scale-105'
                  : 'border-border/50 bg-card hover:border-primary/30'
              }`}
            >
              <span className="text-xl font-bold">{rating}</span>
              <span className="text-2xs">{RATING_LABELS[rating]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 left-0 right-0 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className={`w-full h-[56px] flex items-center justify-center gap-3 rounded-2xl font-semibold text-base transition-all duration-300 ${
            !isValid || isSaving 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary to-sage-dark text-primary-foreground hover:-translate-y-0.5 active:scale-[0.98]'
          }`}
          style={isValid && !isSaving ? {
            boxShadow: '0 8px 24px -4px hsl(var(--primary) / 0.4)'
          } : undefined}
        >
          {isSaving ? (
            <>
              <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Entry
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
