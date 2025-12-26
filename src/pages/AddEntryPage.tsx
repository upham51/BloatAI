import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImageIcon, X, Sparkles, Pencil, RefreshCw, Plus, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FODMAPGuide } from '@/components/triggers/FODMAPGuide';
import { TriggerSelectorModal } from '@/components/triggers/TriggerSelectorModal';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DetectedTrigger, validateTriggers, getTriggerCategory } from '@/types';

const RATING_LABELS: Record<number, string> = {
  1: 'None',
  2: 'Mild',
  3: 'Moderate',
  4: 'Strong',
  5: 'Severe',
};

export default function AddEntryPage() {
  const navigate = useNavigate();
  const { addEntry } = useMeals();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo & AI analysis state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoAnalyzed, setPhotoAnalyzed] = useState(false);

  // AI-generated content
  const [aiDescription, setAiDescription] = useState('');
  const [creativeMealTitle, setCreativeMealTitle] = useState('');
  const [mealCategory, setMealCategory] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [detectedTriggers, setDetectedTriggers] = useState<DetectedTrigger[]>([]);

  // Trigger selector modal & guide
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Optional bloating rating
  const [bloatingRating, setBloatingRating] = useState<number | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Form is valid when we have a photo and AI has analyzed it
  const isValid = photoUrl && photoAnalyzed && aiDescription.trim();

  // Handle file selection (camera or gallery)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
    setPhotoFile(file);
    await analyzePhoto(file);
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = '';
      fileInputRef.current.click();
    }
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };

  // Generate creative meal title from description
  const generateCreativeTitle = (description: string) => {
    // Simple client-side title generation based on description
    const words = description.split(' ');
    const foodKeywords = ['pasta', 'salad', 'chicken', 'beef', 'fish', 'rice', 'bread', 'soup', 'pizza', 'burger', 'sandwich', 'steak', 'tacos', 'curry', 'noodles', 'sushi'];
    const adjectives = ['Homestyle', 'Garden Fresh', 'Golden', 'Classic', 'Savory', 'Delicious', 'Artisan', 'Gourmet'];
    
    let mainFood = 'Meal';
    for (const word of words) {
      if (foodKeywords.some(k => word.toLowerCase().includes(k))) {
        mainFood = word.charAt(0).toUpperCase() + word.slice(1);
        break;
      }
    }
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${adjective} ${mainFood}`;
  };

  const getMealCategory = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('breakfast') || desc.includes('eggs') || desc.includes('pancake') || desc.includes('toast')) {
      return 'Breakfast';
    } else if (desc.includes('salad') || desc.includes('vegetable')) {
      return 'Light & Fresh';
    } else if (desc.includes('pasta') || desc.includes('rice') || desc.includes('noodle')) {
      return 'Comfort Food';
    } else if (desc.includes('soup') || desc.includes('stew')) {
      return 'Warming';
    }
    return 'Homemade';
  };

  const analyzePhoto = async (file: File) => {
    setIsAnalyzing(true);
    setPhotoAnalyzed(false);

    try {
      const base64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageUrl: base64 }
      });

      if (error) throw error;

      const description = data.meal_description || 'A delicious meal';
      setAiDescription(description);
      setCreativeMealTitle(generateCreativeTitle(description));
      setMealCategory(getMealCategory(description));
      
      const validTriggers = validateTriggers(data.triggers || []);
      setDetectedTriggers(validTriggers);
      setPhotoAnalyzed(true);

      if (validTriggers.length > 0) {
        toast({
          title: 'Photo analyzed!',
          description: `Detected ${validTriggers.length} potential trigger${validTriggers.length !== 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: 'Photo analyzed!',
          description: 'No common triggers detected.',
        });
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis failed',
        description: 'Could not analyze the photo. Please try again.',
      });
      setAiDescription('');
      setPhotoAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setPhotoFile(null);
    setPhotoAnalyzed(false);
    setAiDescription('');
    setCreativeMealTitle('');
    setMealCategory('');
    setDetectedTriggers([]);
    setIsEditingDescription(false);
  };

  const removeTrigger = (index: number) => {
    setDetectedTriggers(prev => prev.filter((_, i) => i !== index));
  };

  const addTrigger = (trigger: DetectedTrigger) => {
    const exists = detectedTriggers.some(
      t => t.category === trigger.category && t.food === trigger.food
    );
    if (!exists) {
      setDetectedTriggers(prev => [...prev, trigger]);
    }
    setShowTriggerModal(false);
  };

  const handleSave = async () => {
    if (!isValid || !user) return;

    setIsSaving(true);

    try {
      let uploadedPhotoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('meal-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('meal-photos')
            .getPublicUrl(fileName);
          uploadedPhotoUrl = urlData.publicUrl;
        }
      }

      const ratingDueAt = bloatingRating
        ? null
        : new Date(Date.now() + 90 * 60 * 1000).toISOString();

      await addEntry({
        meal_description: aiDescription.trim(),
        photo_url: uploadedPhotoUrl,
        portion_size: null,
        eating_speed: null,
        social_setting: null,
        bloating_rating: bloatingRating,
        rating_status: bloatingRating ? 'completed' : 'pending',
        rating_due_at: ratingDueAt,
        detected_triggers: detectedTriggers,
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Section - Full Bleed Hero */}
      <section className="relative w-full aspect-square max-h-[50vh] overflow-hidden bg-gradient-to-br from-sage-light/50 to-lavender/30">
        {!photoUrl ? (
          /* Photo Upload Options */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Log Your Meal</h1>
            <p className="text-muted-foreground text-center text-sm">Take a photo or choose from your gallery</p>
            
            <div className="flex gap-4 mt-4">
              {/* Camera Button */}
              <button
                onClick={openCamera}
                disabled={isAnalyzing}
                className="flex flex-col items-center gap-3 p-6 bg-card rounded-3xl border border-border/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                style={{ boxShadow: '0 8px 24px -8px hsl(var(--foreground) / 0.1)' }}
              >
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-sm">Camera</span>
              </button>

              {/* Gallery Button */}
              <button
                onClick={openGallery}
                disabled={isAnalyzing}
                className="flex flex-col items-center gap-3 p-6 bg-card rounded-3xl border border-border/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                style={{ boxShadow: '0 8px 24px -8px hsl(var(--foreground) / 0.1)' }}
              >
                <div className="p-4 rounded-2xl bg-lavender/40">
                  <ImageIcon className="w-8 h-8 text-secondary-foreground" />
                </div>
                <span className="font-semibold text-foreground text-sm">Gallery</span>
              </button>
            </div>
          </div>
        ) : (
          /* Photo Preview with Gradient Overlay */
          <>
            <img
              src={photoUrl}
              alt="Your meal"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent pointer-events-none" />
            
            {/* Loading overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                <span className="font-medium text-foreground">Analyzing your meal...</span>
              </div>
            )}
            
            {/* Creative meal title overlay */}
            {photoAnalyzed && creativeMealTitle && (
              <div className="absolute bottom-0 left-0 right-0 p-5 animate-slide-up">
                <h1 className="text-2xl font-bold text-primary-foreground drop-shadow-lg">{creativeMealTitle}</h1>
                <p className="text-sm text-primary-foreground/80 font-medium mt-0.5">{mealCategory}</p>
              </div>
            )}
            
            {/* Action buttons */}
            {!isAnalyzing && (
              <>
                <button
                  onClick={removePhoto}
                  className="absolute top-4 right-4 p-3 rounded-full bg-card/40 backdrop-blur-xl border border-card/50 transition-all duration-200 hover:bg-card/60 active:scale-95"
                >
                  <RefreshCw className="w-5 h-5 text-primary-foreground" />
                </button>
                
                <button
                  onClick={() => navigate(-1)}
                  className="absolute top-4 left-4 p-3 rounded-full bg-card/40 backdrop-blur-xl border border-card/50 transition-all duration-200 hover:bg-card/60 active:scale-95"
                >
                  <X className="w-5 h-5 text-primary-foreground" />
                </button>
              </>
            )}
          </>
        )}
        
        {/* Header for non-photo state */}
        {!photoUrl && (
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-3 rounded-full bg-card/80 border border-border/50 transition-all duration-200 hover:bg-card"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        )}
      </section>

      {/* Scrollable Content */}
      <section className="flex-1 -mt-4 relative z-10 rounded-t-3xl bg-background overflow-y-auto pb-36">
        <div className="p-5 space-y-4">
          {/* AI Analysis Results */}
          {photoAnalyzed && (
            <div className="space-y-4">
              {/* AI Detection Card - Stagger 1 */}
              <div className="bg-card rounded-3xl p-5 border border-border/50 animate-slide-up" 
                   style={{ animationDelay: '0ms', boxShadow: '0 4px 20px -4px hsl(var(--foreground) / 0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">AI Detected</h3>
                  </div>
                  <button
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                    className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {isEditingDescription ? (
                  <Textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe your meal..."
                    className="resize-none bg-muted/30 border-border/50"
                    autoFocus
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {aiDescription || 'Tap edit to describe your meal'}
                  </p>
                )}
              </div>

              {/* Triggers Card - Stagger 2 */}
              <div className="bg-card rounded-3xl p-5 border border-border/50 animate-slide-up" 
                   style={{ animationDelay: '100ms', boxShadow: '0 4px 20px -4px hsl(var(--foreground) / 0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Detected Triggers</h3>
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center gap-1 text-xs text-primary font-medium"
                  >
                    Guide {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {showGuide && <FODMAPGuide />}

                {/* Beautiful Trigger Pills */}
                {detectedTriggers.length > 0 ? (
                  <div className="space-y-2">
                    {detectedTriggers.map((trigger, index) => {
                      const categoryInfo = getTriggerCategory(trigger.category);
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl group transition-all duration-200 hover:bg-muted/50"
                        >
                          {/* Colored indicator */}
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ 
                              backgroundColor: categoryInfo?.color || 'hsl(var(--primary))',
                              boxShadow: `0 0 8px ${categoryInfo?.color || 'hsl(var(--primary))'}60`
                            }}
                          />
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">
                              {categoryInfo?.displayName || trigger.category}
                            </p>
                            {trigger.food && (
                              <p className="text-xs text-muted-foreground truncate">{trigger.food}</p>
                            )}
                          </div>
                          
                          {/* Confidence */}
                          {trigger.confidence && (
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                              {trigger.confidence}%
                            </span>
                          )}
                          
                          {/* Delete */}
                          <button
                            onClick={() => removeTrigger(index)}
                            className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                          >
                            <X className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No triggers detected</p>
                )}

                {/* Add Trigger Button */}
                <button
                  onClick={() => setShowTriggerModal(true)}
                  className="w-full mt-3 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-semibold text-sm transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <Plus className="w-4 h-4" />
                  Add Trigger
                </button>
              </div>

              {/* Bloating Rating Card - Stagger 3 */}
              <div className="bg-card rounded-3xl p-5 border border-border/50 animate-slide-up" 
                   style={{ animationDelay: '200ms', boxShadow: '0 4px 20px -4px hsl(var(--foreground) / 0.06)' }}>
                <h3 className="font-bold text-foreground">How bloated?</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-4">Optional – We'll remind you in 90 min</p>

                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setBloatingRating(bloatingRating === rating ? null : rating)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-2xl border-2 transition-all duration-200 ${
                        bloatingRating === rating
                          ? 'border-primary bg-primary text-primary-foreground scale-105'
                          : 'border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/40'
                      }`}
                      style={bloatingRating === rating ? {
                        boxShadow: '0 4px 12px hsl(var(--primary) / 0.3)'
                      } : undefined}
                    >
                      <span className={`text-xl font-bold ${
                        bloatingRating === rating ? '' : 'text-foreground'
                      }`}>
                        {rating}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        bloatingRating === rating ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {RATING_LABELS[rating]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Floating Save Button */}
      {photoAnalyzed && (
        <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-40">
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className={`w-full h-14 flex items-center justify-center gap-2 rounded-full transition-all duration-300 ${
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
                <span className="font-semibold">Save Meal Entry</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Trigger Selector Modal */}
      <TriggerSelectorModal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        onAdd={addTrigger}
      />
    </div>
  );
}