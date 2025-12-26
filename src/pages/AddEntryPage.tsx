import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { OptionToggle } from '@/components/shared/OptionToggle';
import { RatingScale } from '@/components/shared/RatingScale';
import { TriggerChip } from '@/components/shared/TriggerChip';
import { useMeals } from '@/contexts/MealContext';
import { useToast } from '@/hooks/use-toast';
import {
  PortionSize,
  EatingSpeed,
  SocialSetting,
  DetectedTrigger,
  PORTION_OPTIONS,
  SPEED_OPTIONS,
  SOCIAL_OPTIONS,
} from '@/types';

// Mock triggers for demo (will be replaced with AI analysis)
const MOCK_TRIGGERS: DetectedTrigger[] = [
  { category: 'FODMAPs-fructans', food: 'garlic', confidence: 85 },
  { category: 'dairy', food: 'cheese', confidence: 90 },
];

export default function AddEntryPage() {
  const navigate = useNavigate();
  const { addEntry } = useMeals();
  const { toast } = useToast();

  const [mealDescription, setMealDescription] = useState('');
  const [portionSize, setPortionSize] = useState<PortionSize | null>(null);
  const [eatingSpeed, setEatingSpeed] = useState<EatingSpeed | null>(null);
  const [socialSetting, setSocialSetting] = useState<SocialSetting | null>(null);
  const [bloatingRating, setBloatingRating] = useState<number | null>(null);
  const [showRatingSection, setShowRatingSection] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [detectedTriggers, setDetectedTriggers] = useState<DetectedTrigger[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isValid = mealDescription.trim() && portionSize && eatingSpeed && socialSetting;

  const handlePhotoCapture = async () => {
    // For demo, use a placeholder and mock triggers
    // In production, this would open camera and call AI
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPhotoUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop');
    setDetectedTriggers(MOCK_TRIGGERS);
    setIsAnalyzing(false);
    
    toast({
      title: 'Photo analyzed!',
      description: 'We detected some potential triggers.',
    });
  };

  const removePhoto = () => {
    setPhotoUrl(null);
    setDetectedTriggers([]);
  };

  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);

    try {
      const ratingDueAt = bloatingRating
        ? null
        : new Date(Date.now() + 90 * 60 * 1000).toISOString();

      await addEntry({
        meal_description: mealDescription.trim(),
        photo_url: photoUrl,
        portion_size: portionSize!,
        eating_speed: eatingSpeed!,
        social_setting: socialSetting!,
        bloating_rating: bloatingRating,
        rating_status: bloatingRating ? 'completed' : 'pending',
        rating_due_at: ratingDueAt,
        detected_triggers: detectedTriggers,
      });

      toast({
        title: 'Meal logged! 🎉',
        description: bloatingRating
          ? 'Thanks for rating your meal.'
          : "We'll remind you to rate in 90 minutes.",
      });

      navigate('/dashboard');
    } catch (error) {
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
      <div className="p-4 space-y-6">
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
            <button
              onClick={handlePhotoCapture}
              disabled={isAnalyzing}
              className="w-full h-48 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99] touch-manipulation"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing your meal...</span>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-primary/10">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Take Photo of Your Meal</p>
                    <p className="text-sm text-muted-foreground">AI will detect potential triggers</p>
                  </div>
                </>
              )}
            </button>
          ) : (
            <div className="relative">
              <img
                src={photoUrl}
                alt="Meal"
                className="w-full h-48 rounded-2xl object-cover"
              />
              <button
                onClick={removePhoto}
                className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Detected Triggers */}
          {detectedTriggers.length > 0 && (
            <Card variant="elevated" className="animate-scale-in">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Detected Potential Triggers</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedTriggers.map((trigger, i) => (
                    <TriggerChip
                      key={i}
                      category={trigger.category}
                      food={trigger.food}
                      confidence={trigger.confidence}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Meal Description */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            What did you eat?
          </label>
          <Textarea
            placeholder="Describe your meal..."
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </section>

        {/* Options */}
        <OptionToggle<PortionSize>
          label="How much?"
          options={PORTION_OPTIONS}
          value={portionSize}
          onChange={setPortionSize}
        />

        <OptionToggle<EatingSpeed>
          label="Eating speed?"
          options={SPEED_OPTIONS}
          value={eatingSpeed}
          onChange={setEatingSpeed}
        />

        <OptionToggle<SocialSetting>
          label="Social setting?"
          options={SOCIAL_OPTIONS}
          value={socialSetting}
          onChange={setSocialSetting}
        />

        {/* Optional Rating Section */}
        <section className="space-y-3">
          <button
            onClick={() => setShowRatingSection(!showRatingSection)}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <span className="text-sm font-medium text-foreground">
              Rate bloating now? (optional)
            </span>
            {showRatingSection ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {showRatingSection && (
            <Card variant="elevated" className="p-4 animate-slide-down">
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

        {/* Save Button */}
        <Button
          variant="sage"
          size="xl"
          className="w-full"
          disabled={!isValid || isSaving}
          onClick={handleSave}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Entry'
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
