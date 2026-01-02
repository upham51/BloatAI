import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { AgeRange, BiologicalSex, PrimaryGoal, BloatingFrequency, OnboardingData } from '@/types/quiz';
import { Sparkles, Target, Calendar, Activity, Pill } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, userId, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [ageRange, setAgeRange] = useState<AgeRange | ''>('');
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | ''>('');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | ''>('');
  const [bloatingFrequency, setBloatingFrequency] = useState<BloatingFrequency | ''>('');
  const [medicationInput, setMedicationInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return ageRange && biologicalSex;
      case 1:
        return primaryGoal;
      case 2:
        return bloatingFrequency;
      case 3:
        return true; // Medications are optional
      case 4:
        return true; // Final step
      default:
        return false;
    }
  };

  const handleAddMedication = () => {
    const trimmed = medicationInput.trim();
    if (trimmed && !medications.includes(trimmed)) {
      setMedications([...medications, trimmed]);
      setMedicationInput('');
    }
  };

  const handleRemoveMedication = (med: string) => {
    setMedications(medications.filter((m) => m !== med));
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    try {
      // First, verify the user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, onboarding_completed')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error(`Cannot fetch profile: ${fetchError.message}`);
      }

      if (!existingProfile) {
        console.error('Profile does not exist for userId:', userId);
        throw new Error('Profile not found. Please try logging out and back in.');
      }

      console.log('Updating profile for user:', existingProfile.email);

      const onboardingData: OnboardingData = {
        ageRange: ageRange as AgeRange,
        biologicalSex: biologicalSex as BiologicalSex,
        primaryGoal: primaryGoal as PrimaryGoal,
        bloatingFrequency: bloatingFrequency as BloatingFrequency,
        medications,
        completedAt: new Date().toISOString(),
      };

      const updateData = {
        age_range: onboardingData.ageRange,
        biological_sex: onboardingData.biologicalSex,
        primary_goal: onboardingData.primaryGoal,
        bloating_frequency: onboardingData.bloatingFrequency,
        medications: onboardingData.medications,
        onboarding_completed: true,
        onboarding_completed_at: onboardingData.completedAt,
      };

      console.log('Attempting to update with data:', updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Supabase update error:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }

      toast({
        title: 'Profile ready!',
        description: "Let's start tracking your meals.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);

      // Provide helpful error messages
      let errorMessage = error?.message || 'Please try again.';

      // Check for common database errors
      if (error?.code === '42703' || errorMessage.includes('column') || errorMessage.includes('does not exist')) {
        errorMessage = 'Database setup required. Please check ONBOARDING_DEBUG.md in the repository for SQL migration instructions.';
      } else if (error?.code === '42501' || errorMessage.includes('permission denied')) {
        errorMessage = 'Permission error. Please check your Supabase RLS policies.';
      } else if (errorMessage.includes('Profile not found')) {
        errorMessage = 'Profile not found. Try logging out and back in.';
      }

      toast({
        title: 'Error saving profile',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-lg" hideCloseButton>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to Gut Guardian</h2>
            <p className="text-sm text-muted-foreground">
              {step === 0 && '5 quick questions to personalize your experience'}
              {step === 1 && 'What brings you here?'}
              {step === 2 && "Let's understand your baseline"}
              {step === 3 && 'Any medications or supplements?'}
              {step === 4 && "You're all set!"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Step {step + 1} of {totalSteps}
            </p>
          </div>

          {/* Question Steps */}
          <div className="min-h-[300px]">
            {/* Step 1: Age & Sex */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age range
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['18-25', '26-35', '36-45', '46-55', '56-65', '65+'] as AgeRange[]).map((age) => (
                      <Button
                        key={age}
                        variant={ageRange === age ? 'default' : 'outline'}
                        onClick={() => setAgeRange(age)}
                        className="w-full"
                      >
                        {age}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Biological sex</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={biologicalSex === 'male' ? 'default' : 'outline'}
                      onClick={() => setBiologicalSex('male')}
                      className="w-full"
                    >
                      Male
                    </Button>
                    <Button
                      variant={biologicalSex === 'female' ? 'default' : 'outline'}
                      onClick={() => setBiologicalSex('female')}
                      className="w-full"
                    >
                      Female
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Primary Goal */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">What brings you to Gut Guardian?</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'find-triggers' as PrimaryGoal, label: 'Find my food triggers' },
                    { value: 'track-patterns' as PrimaryGoal, label: 'Track patterns for my doctor' },
                    { value: 'manage-symptoms' as PrimaryGoal, label: 'Manage daily symptoms' },
                    { value: 'general-wellness' as PrimaryGoal, label: 'General digestive wellness' },
                  ].map((goal) => (
                    <Button
                      key={goal.value}
                      variant={primaryGoal === goal.value ? 'default' : 'outline'}
                      onClick={() => setPrimaryGoal(goal.value)}
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      {goal.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Bloating Frequency */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">How often do you experience bloating?</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'daily' as BloatingFrequency, label: 'Daily' },
                    { value: 'few-times-week' as BloatingFrequency, label: 'Few times a week' },
                    { value: 'weekly' as BloatingFrequency, label: 'Weekly' },
                    { value: 'occasionally' as BloatingFrequency, label: 'Occasionally' },
                    { value: 'rarely' as BloatingFrequency, label: 'Rarely (prevention focused)' },
                  ].map((freq) => (
                    <Button
                      key={freq.value}
                      variant={bloatingFrequency === freq.value ? 'default' : 'outline'}
                      onClick={() => setBloatingFrequency(freq.value)}
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      {freq.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Medications */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Any current medications or supplements?</h3>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type medication name..."
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMedication();
                      }
                    }}
                  />
                  <Button onClick={handleAddMedication} variant="outline">
                    Add
                  </Button>
                </div>

                {medications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medications.map((med) => (
                      <div
                        key={med}
                        className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {med}
                        <button
                          onClick={() => handleRemoveMedication(med)}
                          className="ml-1 hover:text-primary/70"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {medications.length === 0 && (
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    className="w-full text-muted-foreground"
                  >
                    Skip - I'll add later
                  </Button>
                )}
              </div>
            )}

            {/* Step 5: Ready to Start */}
            {step === 4 && (
              <div className="text-center space-y-6 py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
                  <span className="text-3xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Profile ready!</h3>
                  <p className="text-muted-foreground">
                    Let's log your first meal and start tracking patterns.
                  </p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-primary font-medium">
                    💡 Insights unlock after 3 entries. Takes about 1 day to see patterns!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {step > 0 && step < 4 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < 3 && (
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Continue
              </Button>
            )}
            {step === 3 && medications.length > 0 && (
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving...' : 'Get Started'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
