import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImageIcon, X, Sparkles, Pencil, RefreshCw, Plus, ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FODMAPGuide } from '@/components/triggers/FODMAPGuide';
import { TriggerSelectorModal } from '@/components/triggers/TriggerSelectorModal';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DetectedTrigger, validateTriggers, getTriggerCategory, TRIGGER_CATEGORIES } from '@/types';

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
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [detectedTriggers, setDetectedTriggers] = useState<DetectedTrigger[]>([]);

  // Trigger selector modal
  const [showTriggerModal, setShowTriggerModal] = useState(false);

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

      setAiDescription(data.meal_description || 'A meal');
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
        
        const { data: uploadData, error: uploadError } = await supabase.storage
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Section - Full Bleed Hero */}
      <section className="relative w-full h-[45vh] min-h-[300px] overflow-hidden bg-gradient-to-br from-muted to-secondary">
        {!photoUrl ? (
          /* Photo Upload Options */
          <div className="absolute inset-0 flex items-center justify-center gap-6 p-6">
            {/* Camera Button */}
            <button
              onClick={openCamera}
              disabled={isAnalyzing}
              className="flex flex-col items-center gap-4 p-8 glass-panel transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="p-5 rounded-full bg-primary/10 border border-primary/20">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Camera</span>
            </button>

            {/* Gallery Button */}
            <button
              onClick={openGallery}
              disabled={isAnalyzing}
              className="flex flex-col items-center gap-4 p-8 glass-panel transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="p-5 rounded-full bg-lavender/30 border border-lavender/40">
                <ImageIcon className="w-10 h-10 text-secondary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Gallery</span>
            </button>
          </div>
        ) : (
          /* Photo Preview with Gradient Overlay */
          <>
            <img
              src={photoUrl}
              alt="Your meal"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 photo-gradient-overlay pointer-events-none" />
            
            {/* Loading overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                <span className="font-medium text-foreground">Analyzing your meal...</span>
              </div>
            )}
            
            {/* Retake button */}
            {!isAnalyzing && (
              <button
                onClick={removePhoto}
                className="absolute top-4 right-4 p-3 rounded-full bg-card/30 backdrop-blur-xl border border-card/40 transition-all duration-200 hover:bg-card/50 hover:scale-110 active:scale-95"
              >
                <RefreshCw className="w-5 h-5 text-primary-foreground" />
              </button>
            )}
            
            {/* Close button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 p-3 rounded-full bg-card/30 backdrop-blur-xl border border-card/40 transition-all duration-200 hover:bg-card/50 hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </button>
          </>
        )}
        
        {/* Header for non-photo state */}
        {!photoUrl && (
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-3 rounded-full bg-card/50 backdrop-blur-xl border border-border/50 transition-all duration-200 hover:bg-card/70"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        )}
      </section>

      {/* Scrollable Content */}
      <section className="flex-1 -mt-6 relative z-10 rounded-t-[2rem] bg-background overflow-y-auto pb-32">
        <div className="p-5 space-y-4">
          {/* AI Analysis Results */}
          {photoAnalyzed && (
            <div className="space-y-4 animate-slide-up">
              {/* AI Detection Card */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl drop-shadow-sm">✨</span>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">AI Detected</h3>
                  </div>
                  <button
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                    className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 transition-all duration-200 hover:bg-primary/20 hover:scale-105 active:scale-95"
                  >
                    <Pencil className="w-4 h-4 text-primary" />
                  </button>
                </div>

                {isEditingDescription ? (
                  <Textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe your meal..."
                    className="resize-none bg-card/50 border-border/50"
                    autoFocus
                  />
                ) : (
                  <p className="text-foreground/80 leading-relaxed">
                    {aiDescription || 'Tap edit to describe your meal'}
                  </p>
                )}
              </div>

              {/* Triggers Card */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl drop-shadow-sm">🎯</span>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">Detected Triggers</h3>
                  </div>
                </div>

                {/* FODMAP Guide */}
                <FODMAPGuide />

                {/* Trigger Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {detectedTriggers.map((trigger, index) => {
                    const categoryInfo = getTriggerCategory(trigger.category);
                    
                    return (
                      <div
                        key={index}
                        className="group flex items-center gap-2 px-4 py-2.5 bg-card/80 backdrop-blur-sm border border-card/60 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                        style={{ 
                          borderLeftWidth: '3px',
                          borderLeftColor: categoryInfo?.color || 'hsl(var(--primary))'
                        }}
                      >
                        {/* Colored dot */}
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ 
                            backgroundColor: categoryInfo?.color || 'hsl(var(--primary))',
                            boxShadow: `0 0 0 3px ${categoryInfo?.color || 'hsl(var(--primary))'}20`
                          }}
                        />
                        
                        {/* Trigger info */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            {categoryInfo?.displayName || trigger.category}
                          </span>
                          {trigger.food && (
                            <span className="text-xs text-muted-foreground">{trigger.food}</span>
                          )}
                        </div>
                        
                        {/* Confidence badge */}
                        {trigger.confidence && (
                          <span className="text-2xs font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-lg">
                            {trigger.confidence}%
                          </span>
                        )}
                        
                        {/* Delete button */}
                        <button
                          onClick={() => removeTrigger(index)}
                          className="ml-1 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/20 hover:scale-110"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Trigger Button */}
                  <button
                    onClick={() => setShowTriggerModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary/40 rounded-2xl transition-all duration-200 hover:bg-primary/15 hover:border-primary/60 hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Add Trigger</span>
                  </button>
                </div>
              </div>

              {/* Bloating Rating Card */}
              <div className="glass-panel p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">How bloated? <span className="text-sm font-normal text-muted-foreground">(optional)</span></h3>
                  <p className="text-sm text-muted-foreground mt-1">We'll remind you in 90 minutes</p>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setBloatingRating(bloatingRating === rating ? null : rating)}
                      className={`flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl border transition-all duration-300 ${
                        bloatingRating === rating
                          ? 'bg-gradient-to-br from-primary to-sage-dark border-primary/50 scale-105 shadow-lg'
                          : 'bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:scale-105'
                      }`}
                      style={{
                        boxShadow: bloatingRating === rating 
                          ? '0 8px 16px hsl(var(--primary) / 0.3)' 
                          : undefined
                      }}
                    >
                      <span className={`text-2xl font-bold ${
                        bloatingRating === rating ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {rating}
                      </span>
                      <span className={`text-2xs font-semibold uppercase tracking-wide ${
                        bloatingRating === rating ? 'text-primary-foreground/90' : 'text-muted-foreground'
                      }`}>
                        {RATING_LABELS[rating]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State - Instructions */}
          {!photoUrl && (
            <div className="text-center py-8 space-y-3">
              <h2 className="text-xl font-bold text-foreground">Log Your Meal</h2>
              <p className="text-muted-foreground">Take a photo or choose from your gallery to get started</p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Save Button */}
      {photoAnalyzed && (
        <div className="fixed bottom-6 left-5 right-5 z-50">
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className={`w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-sage-dark rounded-full floating-button transition-all duration-300 ${
              !isValid || isSaving 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-3 text-primary-foreground font-semibold">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <span className="text-primary-foreground font-semibold text-lg tracking-tight">Save Meal Entry</span>
                <ArrowRight className="w-5 h-5 text-primary-foreground" />
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