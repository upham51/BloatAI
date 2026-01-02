import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, TrendingDown, TrendingUp, CheckCircle2, Download } from 'lucide-react';
import type { RootCauseAssessment } from '@/types/quiz';
import { format } from 'date-fns';
import { CATEGORY_DISPLAY_NAMES } from '@/lib/quizScoring';

interface AssessmentResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: RootCauseAssessment;
  comparison?: {
    current: RootCauseAssessment;
    previous: RootCauseAssessment;
    improvements: Array<{ category: string; change: number; percentageChange: number }>;
    overallChange: number;
  } | null;
}

export function AssessmentResultsModal({
  isOpen,
  onClose,
  assessment,
  comparison,
}: AssessmentResultsModalProps) {
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

  const categories = [
    { name: 'Aerophagia', key: 'aerophagia_score', max: 10 },
    { name: 'Gut Motility', key: 'motility_score', max: 11 },
    { name: 'Microbial Balance', key: 'dysbiosis_score', max: 11 },
    { name: 'Brain-Gut Axis', key: 'brain_gut_score', max: 14 },
    { name: 'Hormonal Factors', key: 'hormonal_score', max: 6 },
    { name: 'Structural/Medical', key: 'structural_score', max: 10 },
    { name: 'Lifestyle/Posture', key: 'lifestyle_score', max: 6 },
  ];

  const getCategoryLevel = (score: number, max: number): string => {
    const percentage = (score / max) * 100;
    if (percentage < 33) return 'Low Risk';
    if (percentage < 66) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Root Cause Assessment Results</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Completed {format(new Date(assessment.completed_at), 'MMMM d, yyyy')}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">Overall Summary</h3>
                <Badge className={`${getRiskColor(assessment.risk_level)} mt-2`}>
                  {assessment.risk_level} Risk
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{assessment.overall_score}</div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>

            {assessment.ai_report_summary && (
              <p className="text-sm">{assessment.ai_report_summary}</p>
            )}
          </div>

          {/* Progress Comparison */}
          {comparison && comparison.overallChange !== 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                Progress Comparison
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comparison.previous.completed_at), 'MMM d')} vs{' '}
                  {format(new Date(comparison.current.completed_at), 'MMM d')}
                </span>
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{comparison.previous.overall_score}</div>
                  <div className="text-xs text-muted-foreground">Previous</div>
                </div>
                <div className="text-center flex items-center justify-center">
                  {comparison.overallChange > 0 ? (
                    <div className="flex flex-col items-center">
                      <TrendingDown className="w-6 h-6 text-green-600 mb-1" />
                      <span className="text-sm font-medium text-green-600">
                        -{comparison.overallChange}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <TrendingUp className="w-6 h-6 text-orange-600 mb-1" />
                      <span className="text-sm font-medium text-orange-600">
                        +{Math.abs(comparison.overallChange)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{comparison.current.overall_score}</div>
                  <div className="text-xs text-muted-foreground">Now</div>
                </div>
              </div>

              {comparison.improvements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Category Changes</h4>
                  {comparison.improvements.map((imp) => (
                    <div key={imp.category} className="flex items-center justify-between text-sm">
                      <span>{imp.category}</span>
                      <span
                        className={
                          imp.change > 0 ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'
                        }
                      >
                        {imp.change > 0 ? '↓' : '↑'} {Math.abs(imp.change)} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {comparison.overallChange > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 mt-4">
                  <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                    🎉 Great progress! Your changes are working. Keep it up!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold">Detailed Breakdown</h3>
            {categories.map((category) => {
              const score = assessment[category.key as keyof RootCauseAssessment] as number;
              const percentage = (score / category.max) * 100;
              const level = getCategoryLevel(score, category.max);

              return (
                <div key={category.key} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {level}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {score}/{category.max}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Action Steps */}
          {assessment.ai_report_action_steps && assessment.ai_report_action_steps.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Immediate Action Steps
              </h3>
              <ul className="space-y-2">
                {assessment.ai_report_action_steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Long-term Recommendations */}
          {assessment.ai_report_long_term && assessment.ai_report_long_term.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Long-Term Recommendations</h3>
              <ul className="space-y-2">
                {assessment.ai_report_long_term.map((rec, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Red Flags */}
          {assessment.red_flags && assessment.red_flags.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 text-orange-900 dark:text-orange-100 mb-2">
                <AlertCircle className="w-5 h-5" />
                Medical Consultation Recommended
              </h3>
              <ul className="space-y-1">
                {assessment.red_flags.map((flag, index) => (
                  <li key={index} className="text-sm text-orange-800 dark:text-orange-200">
                    • {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
