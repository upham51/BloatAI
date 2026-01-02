import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Apple,
  Activity,
} from 'lucide-react';
import type { Profile } from '@/types';
import type { RootCauseAssessment } from '@/types/quiz';
import type { MealEntry } from '@/types';
import { generatePersonalizedInsights } from '@/lib/personalizedInsights';

interface PersonalizedInsightsCardProps {
  profile: Profile | null;
  assessment: RootCauseAssessment | null;
  mealEntries: MealEntry[];
}

/**
 * PersonalizedInsightsCard
 *
 * Combines quiz results + onboarding data + meal tracking
 * to generate personalized insights written like a friendly
 * nutritionist explaining things to an 8th grader.
 *
 * Updates every time the insights page is visited.
 */
export function PersonalizedInsightsCard({
  profile,
  assessment,
  mealEntries,
}: PersonalizedInsightsCardProps) {
  const insights = generatePersonalizedInsights(profile, assessment, mealEntries);

  // Don't show if we don't have enough data
  if (!insights) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-lavender/10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-lg">Get Your Personal Insights!</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Complete the onboarding questions and Root Cause Quiz to unlock personalized advice
            from our AI nutritionist.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5 bg-gradient-to-br from-background via-lavender/5 to-mint/5 border-2 border-primary/20">
      {/* Header with Greeting */}
      <div className="flex items-start gap-3">
        <div
          className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0"
          style={{
            boxShadow:
              '0 4px 12px hsl(var(--primary) / 0.2), inset 0 1px 1px hsl(0 0% 100% / 0.2)',
          }}
        >
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-xl text-foreground mb-1">Your Personal Insights</h2>
          <p className="text-sm text-muted-foreground italic">{insights.greeting}</p>
        </div>
      </div>

      {/* Main Message */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {insights.mainMessage}
        </p>
      </div>

      {/* Root Cause Explanation */}
      {assessment && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Why You're Bloating</h3>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-sm text-foreground leading-relaxed">
              {insights.rootCauseExplanation}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              Overall Score: {assessment.overall_score}/100
            </Badge>
            <Badge variant="outline" className="text-xs">
              {assessment.risk_level} Risk
            </Badge>
          </div>
        </div>
      )}

      {/* Food Advice */}
      {insights.foodAdvice.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">What to Eat (and Avoid)</h3>
          </div>
          <div className="space-y-2">
            {insights.foodAdvice.map((advice, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-mint/20 to-primary/5 border border-primary/10"
              >
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground leading-relaxed flex-1">{advice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Advice */}
      {insights.lifestyleAdvice.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Lifestyle Tips</h3>
          </div>
          <div className="space-y-2">
            {insights.lifestyleAdvice.map((advice, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-lavender/15 to-primary/5 border border-primary/10"
              >
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground leading-relaxed flex-1">{advice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Note */}
      {insights.progressNote && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-coral/10 to-peach/10 border border-coral/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-coral mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground font-medium">{insights.progressNote}</p>
          </div>
        </div>
      )}

      {/* Medication Note */}
      {insights.medicationNote && (
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-900 dark:text-orange-100">
              {insights.medicationNote}
            </p>
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className="pt-3 border-t border-border">
        <p className="text-sm text-center text-muted-foreground italic font-medium">
          {insights.encouragement}
        </p>
      </div>

      {/* Call to Action if no quiz taken */}
      {!assessment && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground mb-3">
            Take the Root Cause Quiz for even more personalized insights!
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-primary">
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">Available in your Dashboard</span>
          </div>
        </div>
      )}
    </Card>
  );
}
