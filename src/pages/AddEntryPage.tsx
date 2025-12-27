import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImageIcon, X, Sparkles, Pencil, RefreshCw, Plus, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FODMAPGuide } from '@/components/triggers/FODMAPGuide';
import { TriggerSelectorModal } from '@/components/triggers/TriggerSelectorModal';
import { NotesInput } from '@/components/meals/NotesInput';
import { TextOnlyEntry } from '@/components/meals/TextOnlyEntry';
import CounterLoader from '@/components/shared/CounterLoader';
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

type EntryMode = 'photo' | 'text';

// Text only mode component wrapper
function TextOnlyModeWrapper({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Back button */}
      <div className="px-6 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
          Back to photo
        </button>
      </div>
      <TextOnlyEntry />
    </div>
  );
}

export default function AddEntryPage() {
  const navigate = useNavigate();
  const { addEntry } = useMeals();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Entry mode
  const [entryMode, setEntryMode] = useState<EntryMode>('photo');

  // Photo & AI analysis state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoAnalyzed, setPhotoAnalyzed] = useState(false);

  // AI-generated content
  const [aiDescription, setAiDescription] = useState('');
  const [creativeMealTitle, setCreativeMealTitle] = useState('');
  const [mealCategory, setMealCategory] = useState('');
  const [mealEmoji, setMealEmoji] = useState('🍽️');
  const [titleOptions, setTitleOptions] = useState<string[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [detectedTriggers, setDetectedTriggers] = useState<DetectedTrigger[]>([]);

  // Notes
  const [notes, setNotes] = useState('');

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
      setCreativeMealTitle(data.creative_title || data.meal_title || 'Delicious Meal');
      setMealCategory(data.meal_category || 'Homemade');
      setMealEmoji(data.meal_emoji || '🍽️');
      setTitleOptions(data.title_options || [data.creative_title || 'Delicious Meal']);
      
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
    setMealEmoji('🍽️');
    setTitleOptions([]);
    setDetectedTriggers([]);
    setIsEditingDescription(false);
    setNotes('');
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
          // Store the file path, not the public URL (bucket is now private)
          uploadedPhotoUrl = fileName;
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
        custom_title: creativeMealTitle || null,
        meal_emoji: mealEmoji,
        meal_title: creativeMealTitle,
        title_options: titleOptions,
        notes: notes || null,
        entry_method: 'photo',
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
    <div className="min-h-screen bg-gradient-to-br from-background via-lavender/10 to-mint/10 flex flex-col max-w-lg mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Mode - No Toggle */}
      {entryMode === 'photo' && !photoUrl ? (
        /* Premium Photo Upload UI */
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
          {/* Decorative blobs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-lavender/30 rounded-full blur-3xl pointer-events-none" />
          
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-3 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg transition-all duration-200 hover:bg-card active:scale-95 z-10"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          
          {/* Content */}
          <div className="relative z-10 text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Log Your Meal</h1>
            <p className="text-muted-foreground">Snap a photo to analyze your food</p>
          </div>
          
          <div className="relative z-10 flex gap-5">
            {/* Camera Button */}
            <button
              onClick={openCamera}
              disabled={isAnalyzing}
              className="group flex flex-col items-center gap-4 p-8 bg-card/90 backdrop-blur-xl rounded-[2rem] border border-border/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2 active:scale-95"
              style={{ boxShadow: '0 20px 40px -12px hsl(var(--foreground) / 0.15), 0 8px 20px -8px hsl(var(--foreground) / 0.1)' }}
            >
              <div className="p-5 rounded-2xl bg-primary transition-transform group-hover:scale-110">
                <Camera className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Camera</span>
            </button>

            {/* Gallery Button */}
            <button
              onClick={openGallery}
              disabled={isAnalyzing}
              className="group flex flex-col items-center gap-4 p-8 bg-card/90 backdrop-blur-xl rounded-[2rem] border border-border/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2 active:scale-95"
              style={{ boxShadow: '0 20px 40px -12px hsl(var(--foreground) / 0.15), 0 8px 20px -8px hsl(var(--foreground) / 0.1)' }}
            >
              <div className="p-5 rounded-2xl bg-lavender transition-transform group-hover:scale-110">
                <ImageIcon className="w-8 h-8 text-secondary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Gallery</span>
            </button>
          </div>
          
          {/* Text Only Link - Below buttons */}
          <button
            onClick={() => setEntryMode('text')}
            className="relative z-10 mt-8 text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Or describe your meal with text
          </button>
          
          {/* Tips */}
          <p className="relative z-10 text-xs text-muted-foreground text-center mt-8 max-w-xs">
            💡 Tip: Good lighting helps our AI detect ingredients more accurately
          </p>
        </div>
      ) : entryMode === 'text' && !photoUrl ? (
        /* Text Only Mode */
        <TextOnlyModeWrapper onBack={() => setEntryMode('photo')} />
      ) : (
        <>
          <section className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">
            <img
              src={photoUrl}
              alt="Your meal"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent pointer-events-none" />
            
            {/* Loading overlay with Counter Loader */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-card/95 backdrop-blur-xl flex items-center justify-center">
                <CounterLoader />
              </div>
            )}
            
            {/* Creative meal title overlay */}
            {photoAnalyzed && aiDescription && (
              <div className="absolute bottom-0 left-0 right-0 p-6 animate-slide-up">
                <p className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-widest mb-1">{mealCategory}</p>
                <h1 className="text-2xl font-bold text-primary-foreground drop-shadow-lg tracking-tight line-clamp-2">
                  {creativeMealTitle || 'Your meal'}
                </h1>
              </div>
            )}
            
            {/* Action buttons */}
            {!isAnalyzing && (
              <>
                <button
                  onClick={removePhoto}
                  className="absolute top-4 right-4 p-3 rounded-full bg-card/30 backdrop-blur-xl border border-card/50 shadow-lg transition-all duration-200 hover:bg-card/50 active:scale-95"
                >
                  <RefreshCw className="w-5 h-5 text-primary-foreground" />
                </button>
                
                <button
                  onClick={() => navigate(-1)}
                  className="absolute top-4 left-4 p-3 rounded-full bg-card/30 backdrop-blur-xl border border-card/50 shadow-lg transition-all duration-200 hover:bg-card/50 active:scale-95"
                >
                  <X className="w-5 h-5 text-primary-foreground" />
                </button>
              </>
            )}
          </section>

          {/* Scrollable Content */}
          <section className="flex-1 -mt-6 relative z-10 rounded-t-[2rem] bg-background overflow-y-auto shadow-[0_-8px_30px_-12px_hsl(var(--foreground)/0.15)]">
            <div className="p-5 space-y-4 pt-8">
          {/* AI Analysis Results */}
          {photoAnalyzed && (
            <div className="space-y-4">
              {/* AI Detection Card - Stagger 1 */}
              <div 
                className="glass-card p-5 animate-slide-up opacity-0" 
                style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg">What We Found</h3>
                  </div>
                  <button
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                    className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors active:scale-95"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {isEditingDescription ? (
                  <Textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your meal..."
                    className="resize-none bg-muted/30 border-border/50 rounded-2xl"
                    autoFocus
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {aiDescription || 'Tap edit to describe your meal'}
                  </p>
                )}
              </div>

              {/* Triggers Card - Stagger 2 */}
              <div 
                className="glass-card p-5 animate-slide-up opacity-0" 
                style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-coral/30 to-peach/30">
                      <span className="text-lg">🎯</span>
                    </div>
                    <h3 className="font-bold text-foreground text-lg">Detected Triggers</h3>
                  </div>
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center gap-1.5 text-xs text-primary font-semibold px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    Guide {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {showGuide && <FODMAPGuide />}

                {/* Beautiful Trigger Pills */}
                {detectedTriggers.length > 0 ? (
                  <div className="space-y-2.5">
                    {detectedTriggers.map((trigger, index) => {
                      const categoryInfo = getTriggerCategory(trigger.category);
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 group transition-all duration-200 hover:-translate-y-0.5"
                          style={{ 
                            boxShadow: '0 4px 12px -2px hsl(var(--foreground) / 0.08), 0 2px 6px -2px hsl(var(--foreground) / 0.04)'
                          }}
                        >
                          {/* Icon Badge */}
                          <div 
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: `linear-gradient(135deg, ${categoryInfo?.color}25 0%, ${categoryInfo?.color}15 100%)`,
                              boxShadow: `0 2px 8px ${categoryInfo?.color}20`
                            }}
                          >
                            <div 
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ 
                                backgroundColor: categoryInfo?.color || 'hsl(var(--primary))',
                                boxShadow: `0 0 8px ${categoryInfo?.color || 'hsl(var(--primary))'}50`
                              }}
                            />
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-[15px]">
                              {categoryInfo?.displayName || trigger.category}
                            </p>
                            {trigger.food && (
                              <p className="text-sm text-muted-foreground truncate">{trigger.food}</p>
                            )}
                          </div>
                          
                          {/* Remove button */}
                          <button
                            onClick={() => removeTrigger(index)}
                            className="p-2 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-90 opacity-0 group-hover:opacity-100"
                            aria-label="Remove trigger"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-sm text-muted-foreground">No triggers detected — looking good!</p>
                  </div>
                )}

                {/* Add Trigger Button */}
                <button
                  onClick={() => setShowTriggerModal(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-semibold transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  Add Trigger
                </button>
              </div>

              {/* Bloating Rating Card - Stagger 3 */}
              <div 
                className="glass-card p-5 animate-slide-up opacity-0" 
                style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-sky/40 to-sky-light/40">
                    <span className="text-lg">📊</span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg">How bloated?</h3>
                </div>
                <p className="text-xs text-muted-foreground ml-12 mb-5">Optional — We'll remind you in 90 min</p>

                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setBloatingRating(bloatingRating === rating ? null : rating)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all duration-200 ${
                        bloatingRating === rating
                          ? 'border-primary bg-primary text-primary-foreground scale-105'
                          : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30'
                      }`}
                      style={bloatingRating === rating ? {
                        boxShadow: '0 8px 20px hsl(var(--primary) / 0.35)'
                      } : undefined}
                    >
                      <span className={`text-2xl font-bold ${
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

          {/* Sticky Save Button at Bottom of Content */}
          {photoAnalyzed && (
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
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
                    Save Meal Entry
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
        </>
      )}
    </div>
  );
}
