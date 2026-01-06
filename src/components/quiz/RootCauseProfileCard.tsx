import { useState, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, TrendingUp, RefreshCw, Eye } from 'lucide-react';
import { RootCauseQuiz } from './RootCauseQuiz';
import { AssessmentResultsModal } from './AssessmentResultsModal';
import { useRootCauseAssessment, useAssessmentComparison } from '@/hooks/useRootCauseAssessment';
import { CATEGORY_DISPLAY_NAMES } from '@/lib/quizScoring';
import type { Profile } from '@/types';
import { format } from 'date-fns';

interface RootCauseProfileCardProps {
  userId: string;
  userProfile?: Profile;
}

export const RootCauseProfileCard = memo(function RootCauseProfileCard({ userId, userProfile }: RootCauseProfileCardProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { data: assessment, isLoading, refetch } = useRootCauseAssessment(userId);
  const comparison = useAssessmentComparison(userId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  // If no assessment, show CTA to take quiz
  if (!assessment) {
    return (
      <>
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Unlock Deeper Insights</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Take our 5-minute Root Cause Assessment to understand WHY you bloat, not just WHAT causes it
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Personalized insights beyond food triggers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Identify gut motility, stress, and hormonal factors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Get customized action steps and recommendations</span>
              </li>
            </ul>

            <Button onClick={() => setShowQuiz(true)} className="w-full" size="lg">
              Take Root Cause Assessment (5 min)
            </Button>
          </div>
        </Card>

        <RootCauseQuiz
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          userId={userId}
          userProfile={userProfile}
          onComplete={() => {
            refetch();
          }}
        />
      </>
    );
  }

  // Show assessment results
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const topCauseScores = [
    { name: 'Aerophagia', score: assessment.aerophagia_score, max: 10 },
    { name: 'Motility', score: assessment.motility_score, max: 11 },
    { name: 'Dysbiosis', score: assessment.dysbiosis_score, max: 11 },
    { name: 'Brain-Gut', score: assessment.brain_gut_score, max: 14 },
    { name: 'Hormonal', score: assessment.hormonal_score, max: 6 },
    { name: 'Structural', score: assessment.structural_score, max: 10 },
    { name: 'Lifestyle', score: assessment.lifestyle_score, max: 6 },
  ]
    .sort((a, b) => (b.score / b.max) - (a.score / a.max))
    .slice(0, 3);

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">Root Cause Profile</h3>
                <Badge className={getRiskColor(assessment.risk_level)}>
                  {assessment.risk_level} Risk
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Completed {format(new Date(assessment.completed_at), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowResults(true)}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQuiz(true)}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retake
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Health Score</span>
              <span className="font-bold">{assessment.overall_score}/100</span>
            </div>
            <Progress value={100 - assessment.overall_score} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Lower is better - {100 - assessment.overall_score}% health score
            </p>
          </div>

          {/* Top Contributors */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Primary Contributors</h4>
            {topCauseScores.map((cause, index) => {
              const percentage = (cause.score / cause.max) * 100;
              const isHigh = percentage > 66;
              return (
                <div key={cause.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {index + 1}. {cause.name}
                      {isHigh && <AlertCircle className="w-3 h-3 text-orange-500" />}
                    </span>
                    <span className="text-muted-foreground">
                      {cause.score}/{cause.max}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-1.5"
                  />
                </div>
              );
            })}
          </div>

          {/* Comparison with previous (if exists) */}
          {comparison && comparison.overallChange !== 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium">Progress Since Last Assessment</h4>
              <div className="flex items-center gap-2">
                {comparison.overallChange > 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Improved by {comparison.overallChange} points
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                      Increased by {Math.abs(comparison.overallChange)} points
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Tip */}
          {assessment.ai_report_action_steps && assessment.ai_report_action_steps.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm font-medium text-primary mb-1">💡 Quick Action</p>
              <p className="text-sm">{assessment.ai_report_action_steps[0]}</p>
            </div>
          )}

          {/* Red Flags */}
          {assessment.red_flags && assessment.red_flags.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Medical Consultation Recommended
                </p>
                <p className="text-xs text-orange-800 dark:text-orange-200">
                  {assessment.red_flags[0]}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <RootCauseQuiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        userId={userId}
        userProfile={userProfile}
        onComplete={() => {
          refetch();
        }}
      />

      <AssessmentResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        assessment={assessment}
        comparison={comparison}
      />
    </>
  );
});
