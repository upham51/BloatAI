import { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotesInput } from './NotesInput';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MealEntry, DetectedTrigger, COMMON_TRIGGERS, RATING_LABELS, getTriggerCategory } from '@/types';

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

  const toggleTrigger = (triggerId: string) => {
    const triggerInfo = COMMON_TRIGGERS.find(t => t.id === triggerId);
    if (!triggerInfo) return;

    const exists = selectedTriggers.some(t => t.category === triggerInfo.category && t.food === triggerInfo.name);
    if (exists) {
      setSelectedTriggers(prev => prev.filter(t => !(t.category === triggerInfo.category && t.food === triggerInfo.name)));
    } else {
      setSelectedTriggers(prev => [...prev, {
        category: triggerInfo.category,
        food: triggerInfo.name,
        confidence: 1
      }]);
    }
  };

  const isTriggerSelected = (triggerId: string) => {
    const triggerInfo = COMMON_TRIGGERS.find(t => t.id === triggerId);
    if (!triggerInfo) return false;
    return selectedTriggers.some(t => t.category === triggerInfo.category && t.food === triggerInfo.name);
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

  const handleSave = async () => {
    if (!user) return;
    
    const title = selectedMeal 
      ? getMealTitle(selectedMeal) 
      : manualMealTitle.trim();
    
    if (!title) return;

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

          {/* Trigger Selection */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Select potential triggers (optional):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_TRIGGERS.map((trigger) => {
                const categoryInfo = getTriggerCategory(trigger.category);
                const isSelected = isTriggerSelected(trigger.id);
                return (
                  <button
                    key={trigger.id}
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-current bg-current/10'
                        : 'border-border/50 bg-card hover:border-current/30'
                    }`}
                    style={{ 
                      color: isSelected ? categoryInfo?.color : undefined,
                      borderColor: isSelected ? categoryInfo?.color : undefined
                    }}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryInfo?.color }}
                    />
                    <span className={`text-sm font-medium ${isSelected ? '' : 'text-foreground'}`}>
                      {trigger.name}
                    </span>
                  </button>
                );
              })}
            </div>
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
