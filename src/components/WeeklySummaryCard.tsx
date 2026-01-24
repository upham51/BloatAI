import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { RefreshCw, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MetricCard } from '@/components/MetricCard';
import { SwapRow } from '@/components/SwapRow';
import { useMeals } from '@/contexts/MealContext';
import { calculateWeeklySummary, WeeklySummary } from '@/lib/weeklySummary';
import { EmptyState } from '@/components/shared/EmptyState';

export function WeeklySummaryCard() {
  const { entries } = useMeals();
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate summary
  const summary: WeeklySummary | null = useMemo(() => {
    return calculateWeeklySummary(entries);
  }, [entries, refreshKey]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Not enough data
  if (!summary) {
    return (
      <Card variant="premium" className="luxurious-summary mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Weekly Nutrition Summary</CardTitle>
              <CardDescription>Your personalized insights refresh weekly</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Not enough data yet"
            description="Track at least 3 meals this week to generate your summary."
            actionLabel="Log a meal"
            onAction={() => window.location.href = '/log'}
            IconComponent={Calendar}
          />
        </CardContent>
      </Card>
    );
  }

  const {
    dateRange,
    metrics,
    comparison,
    narrative,
    smartSwaps,
    dataQuality,
  } = summary;

  // Format date range
  const startDate = format(new Date(dateRange.start), 'MMM d');
  const endDate = format(new Date(dateRange.end), 'MMM d, yyyy');

  return (
    <Card variant="premium" className="luxurious-summary mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-xl">Weekly Nutrition Summary</CardTitle>
              {dataQuality.confidenceLevel === 'high' && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  High Confidence
                </span>
              )}
              {dataQuality.confidenceLevel === 'medium' && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  Medium Confidence
                </span>
              )}
            </div>
            <CardDescription className="text-sm text-gray-600">
              {startDate} – {endDate}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Narrative Section */}
        <div className="narrative space-y-3">
          <p className="clinical-text text-gray-700 leading-relaxed">
            {narrative.opening}
          </p>
          {dataQuality.hasComparisonData && (
            <p className="clinical-text text-gray-700 leading-relaxed">
              {narrative.trend}
            </p>
          )}
          <p className="clinical-text text-gray-700 leading-relaxed font-medium">
            {narrative.keyFinding}
          </p>
          {narrative.watchArea && (
            <p className="clinical-text text-gray-600 leading-relaxed italic">
              {narrative.watchArea}
            </p>
          )}
        </div>

        <Separator className="bg-gray-200/50" />

        {/* Key Metrics Grid */}
        <div>
          <h3 className="section-title text-base font-semibold text-gray-900 mb-4 tracking-wide">
            Key Metrics
          </h3>
          <div className="metrics-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              value={metrics.avgBloating.toFixed(1)}
              label="Average Bloating"
              sublabel={`out of 5`}
              change={dataQuality.hasComparisonData ? comparison.weekOverWeekChange : undefined}
              trend={comparison.trend === 'improving' ? 'down' : comparison.trend === 'worsening' ? 'up' : 'stable'}
            />
            <MetricCard
              value={`${metrics.comfortablePercentage}%`}
              label="Comfortable Meals"
              sublabel={`${metrics.comfortableMeals}/${metrics.totalMeals} meals`}
            />
            <MetricCard
              value={metrics.currentStreak}
              label="Current Streak"
              sublabel="consecutive comfortable"
            />
            <MetricCard
              value={metrics.bestDay}
              label="Best Day"
              sublabel={`Avg ${metrics.bestDayAvg.toFixed(1)}/5`}
            />
          </div>
        </div>

        {smartSwaps.length > 0 && (
          <>
            <Separator className="bg-gray-200/50" />

            {/* Smart Swaps Section */}
            <div>
              <h3 className="section-title text-base font-semibold text-gray-900 mb-4 tracking-wide">
                Evidence-Based Substitutions
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Based on triggers identified this week, consider these clinically-validated alternatives:
              </p>
              <div className="swaps-list space-y-2">
                {smartSwaps.map((swap, index) => (
                  <SwapRow
                    key={index}
                    trigger={swap.trigger}
                    alternatives={swap.alternatives}
                    occurrences={swap.occurrences}
                    avgBloating={swap.avgBloating}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {!dataQuality.hasComparisonData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Week-over-week comparison will be available after you track meals for two consecutive weeks.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center text-xs text-gray-500 italic">
        <span>Generated {format(new Date(), 'MMM d, yyyy \'at\' h:mm a')}</span>
        <span>{metrics.totalMeals} meal{metrics.totalMeals !== 1 ? 's' : ''} analyzed</span>
      </CardFooter>
    </Card>
  );
}
