import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, X, Sparkles, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { FODMAPGuide } from '@/components/triggers/FODMAPGuide';
import { DetectedTriggersList } from '@/components/triggers/DetectedTriggersList';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DetectedTrigger, validateTriggers } from '@/types';

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

  // Optional bloating rating
  const [showRatingSection, setShowRatingSection] = useState(false);
  const [bloatingRating, setBloatingRating] = useState<number | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Form is valid when we have a photo and AI has analyzed it
  const isValid = photoUrl && photoAnalyzed && aiDescription.trim();

  // Handle file selection (camera or gallery)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
    setPhotoFile(file);

    // Analyze with AI
    await analyzePhoto(file);
  };

  // Trigger file input for gallery
  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = '';
      fileInputRef.current.click();
    }
  };

  // Trigger file input for camera
  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };

  // Analyze photo with AI
  const analyzePhoto = async (file: File) => {
    setIsAnalyzing(true);
    setPhotoAnalyzed(false);

    try {
      // Convert file to base64 for AI analysis
      const base64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageUrl: base64 }
      });

      if (error) throw error;

      // Set AI-generated description
      setAiDescription(data.meal_description || 'A meal');
      
      // Validate and set triggers
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
      // Still allow saving with manual entry
      setAiDescription('');
      setPhotoAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Remove photo and reset
  const removePhoto = () => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
    setPhotoUrl(null);
    setPhotoFile(null);
    setPhotoAnalyzed(false);
    setAiDescription('');
    setDetectedTriggers([]);
    setIsEditingDescription(false);
  };

  // Upload photo to storage and save entry
  const handleSave = async () => {
    if (!isValid || !user) return;

    setIsSaving(true);

    try {
      let uploadedPhotoUrl = null;

      // Upload photo if we have one
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
    <AppLayout>
      <div className="p-4 space-y-6 pb-24">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <h1 className="text-2xl font-bold text-foreground">Log Meal</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Photo Section */}
        <section className="space-y-3">
          {!photoUrl ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Camera Button */}
              <button
                onClick={openCamera}
                disabled={isAnalyzing}
                className="h-40 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] touch-manipulation"
              >
                <div className="p-4 rounded-full bg-primary/10">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <span className="font-medium text-foreground">Take Photo</span>
              </button>

              {/* Gallery Button */}
              <button
                onClick={openGallery}
                disabled={isAnalyzing}
                className="h-40 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] touch-manipulation"
              >
                <div className="p-4 rounded-full bg-secondary/50">
                  <Image className="w-8 h-8 text-secondary-foreground" />
                </div>
                <span className="font-medium text-foreground">Gallery</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={photoUrl}
                alt="Your meal"
                className="w-full h-48 rounded-2xl object-cover"
              />
              
              {/* Loading overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 rounded-2xl bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <span className="text-sm font-medium text-foreground">Analyzing your meal...</span>
                </div>
              )}
              
              {/* Remove button */}
              {!isAnalyzing && (
                <button
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* AI Analysis Results */}
        {photoAnalyzed && (
          <div className="space-y-4 animate-scale-in">
            {/* AI-Generated Meal Description */}
            <Card variant="elevated">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Detected</span>
                  </div>
                  <button
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
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
                    className="resize-none"
                    autoFocus
                  />
                ) : (
                  <p className="text-foreground">
                    {aiDescription || 'Tap edit to describe your meal'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* FODMAP Guide */}
            <FODMAPGuide />

            {/* Detected Triggers */}
            <Card variant="elevated">
              <CardContent className="p-4">
                <DetectedTriggersList
                  triggers={detectedTriggers}
                  onTriggersChange={setDetectedTriggers}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Optional Rating Section */}
        {photoAnalyzed && (
          <section className="space-y-3">
            <button
              onClick={() => setShowRatingSection(!showRatingSection)}
              className="flex items-center justify-between w-full py-2 text-left"
            >
              <div>
                <span className="text-sm font-medium text-foreground">
                  Rate bloating now?
                </span>
                <span className="text-xs text-muted-foreground ml-2">(optional)</span>
              </div>
              {showRatingSection ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {showRatingSection && (
              <Card variant="elevated" className="p-4 animate-slide-down">
                <p className="text-xs text-muted-foreground mb-3">
                  Or we'll remind you in 90 minutes
                </p>
                <RatingScale
                  value={bloatingRating}
                  onChange={setBloatingRating}
                />
                {bloatingRating && (
                  <button
                    onClick={() => setBloatingRating(null)}
                    className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear rating
                  </button>
                )}
              </Card>
            )}
          </section>
        )}

        {/* Save Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            variant="sage"
            size="xl"
            className="w-full max-w-lg mx-auto"
            disabled={!isValid || isSaving}
            onClick={handleSave}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Meal Entry'
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
