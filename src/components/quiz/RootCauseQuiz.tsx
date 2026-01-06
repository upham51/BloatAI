import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QUIZ_QUESTIONS } from '@/lib/quizQuestions';
import {
  calculateQuizScores,
  calculateOverallScore,
  getRiskLevel,
  getTopCauses,
  detectRedFlags,
} from '@/lib/quizScoring';
import type { RootCauseQuizAnswers, RootCauseAssessment } from '@/types/quiz';
import type { Profile } from '@/types';
import { AlertCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface RootCauseQuizProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userProfile?: Profile;
  onComplete?: (assessment: RootCauseAssessment) => void;
}

export function RootCauseQuiz({ isOpen, onClose, userId, userProfile, onComplete }: RootCauseQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<RootCauseQuizAnswers>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter out skipped questions based on user profile
  const activeQuestions = QUIZ_QUESTIONS.filter((q) => {
    if (q.skipLogic) {
      const shouldSkip = q.skipLogic({
        ...answers,
        biologicalSex: userProfile?.biological_sex as any,
      } as any);
      return !shouldSkip;
    }
    return true;
  });

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalQuestions = activeQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Get current answer
  const getCurrentAnswer = (): string | string[] | undefined => {
    const questionId = currentQuestion.id;
    const kebabToCamel = (str: string) =>
      str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const key = kebabToCamel(questionId) as keyof RootCauseQuizAnswers;
    return answers[key] as any;
  };

  const handleSingleChoice = (value: string) => {
    const questionId = currentQuestion.id;
    const kebabToCamel = (str: string) =>
      str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const key = kebabToCamel(questionId) as keyof RootCauseQuizAnswers;

    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiChoice = (value: string, checked: boolean) => {
    const questionId = currentQuestion.id;
    const kebabToCamel = (str: string) =>
      str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const key = kebabToCamel(questionId) as keyof RootCauseQuizAnswers;

    const currentValues = (answers[key] as string[]) || [];

    let newValues: string[];
    if (value === 'none') {
      // If selecting "none", clear all other selections
      newValues = checked ? ['none'] : [];
    } else {
      // Remove "none" if selecting another option
      const filteredValues = currentValues.filter((v) => v !== 'none');
      newValues = checked
        ? [...filteredValues, value]
        : filteredValues.filter((v) => v !== value);
    }

    setAnswers((prev) => ({
      ...prev,
      [key]: newValues,
    }));
  };

  const canProceed = () => {
    const answer = getCurrentAnswer();
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    try {
      // Calculate scores - all synchronous, very fast
      const scores = calculateQuizScores(answers as RootCauseQuizAnswers);
      const overallScore = calculateOverallScore(scores);
      const riskLevel = getRiskLevel(overallScore);
      const topCauses = getTopCauses(scores);
      const redFlags = detectRedFlags(answers as RootCauseQuizAnswers, scores);

      // Generate AI reports - synchronous, very fast
      const aiReportSummary = generateAIReportSummary(scores, overallScore, riskLevel);
      const aiReportActionSteps = generateActionSteps(scores, topCauses);
      const aiReportLongTerm = generateLongTermRecommendations(scores, topCauses);

      // Calculate retake number using a subquery - single fast query
      const { data: countData } = await (supabase as any)
        .from('root_cause_assessments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      const retakeNumber = (countData?.length || 0) + 1;

      // Prepare assessment data - ensure all fields are valid
      const assessmentData = {
        user_id: userId,
        completed_at: new Date().toISOString(),
        aerophagia_score: Math.max(0, Math.min(10, scores.aerophagia.score || 0)),
        motility_score: Math.max(0, Math.min(11, scores.motility.score || 0)),
        dysbiosis_score: Math.max(0, Math.min(11, scores.dysbiosis.score || 0)),
        brain_gut_score: Math.max(0, Math.min(14, scores.brainGut.score || 0)),
        hormonal_score: Math.max(0, Math.min(6, scores.hormonal.score || 0)),
        structural_score: Math.max(0, Math.min(10, scores.structural.score || 0)),
        lifestyle_score: Math.max(0, Math.min(6, scores.lifestyle.score || 0)),
        overall_score: Math.max(0, Math.min(100, overallScore || 0)),
        risk_level: riskLevel || 'Low',
        top_causes: topCauses || [],
        red_flags: redFlags || [],
        individual_answers: answers,
        retake_number: retakeNumber,
        ai_report_summary: aiReportSummary,
        ai_report_action_steps: aiReportActionSteps,
        ai_report_long_term: aiReportLongTerm,
        ai_report_medical_consult: redFlags.length > 0 ? redFlags.join(' | ') : null,
      };

      // Single database insert
      const { data: savedAssessment, error } = await (supabase as any)
        .from('root_cause_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }

      toast({
        title: 'Assessment complete!',
        description: 'Your personalized insights are ready.',
      });

      if (onComplete && savedAssessment) {
        onComplete(savedAssessment as unknown as RootCauseAssessment);
      }

      // Reset form and close
      setAnswers({});
      setCurrentQuestionIndex(0);
      onClose();
    } catch (error: any) {
      console.error('Quiz submission error:', error);

      // Provide more detailed error message
      const errorMessage = error?.message || 'Please try again.';
      const isValidationError = errorMessage.includes('check constraint') || errorMessage.includes('violates');

      toast({
        title: isValidationError ? 'Invalid data detected' : 'Error saving assessment',
        description: isValidationError
          ? 'Some answers are out of range. Please contact support.'
          : errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  }, [isOpen]);

  if (!currentQuestion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Root Cause Assessment
            {currentQuestion.explanation && (
              <div className="group relative inline-block">
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-popover border rounded-md shadow-md text-sm text-popover-foreground left-full ml-2 top-0">
                  {currentQuestion.explanation}
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Section {currentQuestion.sectionNumber}: {currentQuestion.section}
              </span>
              <span className="font-medium">
                {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Q{currentQuestion.questionNumber}: {currentQuestion.text}
            </h3>

            {/* Single Choice */}
            {currentQuestion.type === 'single-choice' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option) => {
                  const isSelected = getCurrentAnswer() === option.value;
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => handleSingleChoice(option.value)}
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      <div className="flex flex-col items-start">
                        <span>{option.label}</span>
                        {option.sublabel && (
                          <span className="text-xs opacity-70">{option.sublabel}</span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Multi Choice */}
            {currentQuestion.type === 'multi-choice' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option) => {
                  const currentValues = (getCurrentAnswer() as string[]) || [];
                  const isChecked = currentValues.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleMultiChoice(option.value, checked as boolean)
                        }
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.sublabel && (
                          <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Red Flag Warning (if applicable) */}
          {currentQuestion.id === 'diagnosed-conditions' && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                This information helps us provide personalized insights. We never share your health data.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Calculating...' : 'Complete Assessment'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// AI REPORT GENERATION (Simplified for MVP)
// ============================================================

function generateAIReportSummary(scores: any, overallScore: number, riskLevel: string): string {
  const topCategory = Object.entries(scores)
    .sort(([, a]: any, [, b]: any) => (b.score / b.maxScore) - (a.score / a.maxScore))[0];

  return `Based on your responses, your bloating appears to have a ${riskLevel.toLowerCase()} risk profile with an overall score of ${overallScore}/100. Your primary contributing factor appears to be ${topCategory[0]}.`;
}

function generateActionSteps(scores: any, topCauses: string[]): string[] {
  const steps: string[] = [];

  if (topCauses.includes('motility')) {
    steps.push('Start a morning routine: 16oz warm water + 10-min walk before breakfast');
    steps.push('Eat dinner 3+ hours before bed');
  }

  if (topCauses.includes('brainGut')) {
    steps.push('Try 5-min box breathing before meals');
    steps.push('Aim for 7-8 hours of sleep');
  }

  if (topCauses.includes('aerophagia')) {
    steps.push('Slow down eating - aim for 20+ minutes per meal');
    steps.push('Avoid drinking through straws');
  }

  if (topCauses.includes('dysbiosis')) {
    steps.push('Consider adding fermented foods to your diet');
    steps.push('Track meals carefully to identify trigger patterns');
  }

  if (steps.length === 0) {
    steps.push('Continue tracking meals to identify specific triggers');
    steps.push('Stay hydrated between meals');
    steps.push('Take a 10-minute walk after meals');
  }

  return steps.slice(0, 5);
}

function generateLongTermRecommendations(scores: any, topCauses: string[]): string[] {
  const recs: string[] = [];

  if (topCauses.includes('structural') || topCauses.includes('motility')) {
    recs.push('Consider GI specialist consultation for comprehensive evaluation');
  }

  if (topCauses.includes('dysbiosis')) {
    recs.push('Discuss probiotic supplementation with your healthcare provider');
  }

  if (topCauses.includes('brainGut')) {
    recs.push('Develop consistent stress management routine (meditation, exercise, therapy)');
  }

  recs.push('Continue using Gut Guardian to track patterns over time');
  recs.push('Re-take this assessment in 30 days to measure progress');

  return recs;
}
