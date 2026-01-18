import { useState, useEffect } from 'react';
import { TriggerConfidenceLevel } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';
import { getFoodImage } from '@/lib/pexelsApi';
import { Flame, Leaf, ChevronDown, ChevronUp, TrendingUp, Zap } from 'lucide-react';

interface SpotifyWrappedTriggersProps {
  triggerConfidence: TriggerConfidenceLevel[];
}

interface TriggerCardData {
  category: string;
  displayName: string;
  emoji: string;
  impactScore: number;
  enhancedImpactScore: number;
  occurrences: number;
  avgBloatingWith: number;
  percentage: number;
  topFoods: string[];
  imageUrl: string | null;
  consistencyFactor: number;
  frequencyWeight: number;
  recencyBoost: number;
  personalBaselineAdjustment: number;
  recentOccurrences: number;
}

function getImpactEmoji(impactScore: number): string {
  if (impactScore >= 2.0) return '🔥';
  if (impactScore >= 1.0) return '🌶️';
  if (impactScore >= 0.5) return '⚠️';
  return '🌿';
}

function getSeverityLabel(impactScore: number): string {
  if (impactScore >= 2.0) return 'Severe Trigger';
  if (impactScore >= 1.0) return 'Strong Trigger';
  if (impactScore >= 0.5) return 'Moderate Trigger';
  return 'Mild Trigger';
}

function getGradientClass(impactScore: number): string {
  if (impactScore >= 2.0) return 'from-red-500 to-orange-500';
  if (impactScore >= 1.0) return 'from-orange-500 to-amber-500';
  if (impactScore >= 0.5) return 'from-amber-500 to-yellow-500';
  return 'from-emerald-500 to-teal-500';
}

export function SpotifyWrappedTriggers({ triggerConfidence }: SpotifyWrappedTriggersProps) {
  const [topTriggers, setTopTriggers] = useState<TriggerCardData[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    async function loadTriggerData() {
      // Get top 5 triggers sorted by enhanced impact score
      const sorted = [...triggerConfidence]
        .sort((a, b) => (b.enhancedImpactScore || b.impactScore) - (a.enhancedImpactScore || a.impactScore))
        .slice(0, 5);

      // Load images for each trigger
      const triggersWithImages = await Promise.all(
        sorted.map(async (trigger) => {
          const categoryInfo = getTriggerCategory(trigger.category);
          const topFood = trigger.topFoods[0] || categoryInfo?.displayName || trigger.category;

          // Fetch image from Pexels
          const imageData = await getFoodImage(topFood, trigger.category).catch(() => null);

          return {
            category: trigger.category,
            displayName: categoryInfo?.displayName || trigger.category,
            emoji: categoryInfo?.emoji || '🍽️',
            impactScore: trigger.impactScore,
            enhancedImpactScore: trigger.enhancedImpactScore || trigger.impactScore,
            occurrences: trigger.occurrences,
            avgBloatingWith: trigger.avgBloatingWith,
            percentage: trigger.percentage,
            topFoods: trigger.topFoods,
            imageUrl: imageData?.url || null,
            consistencyFactor: trigger.consistencyFactor || 0,
            frequencyWeight: trigger.frequencyWeight || 0,
            recencyBoost: trigger.recencyBoost || 0,
            personalBaselineAdjustment: trigger.personalBaselineAdjustment || 0,
            recentOccurrences: trigger.recentOccurrences || 0,
          } as TriggerCardData;
        })
      );

      setTopTriggers(triggersWithImages);
      setImagesLoading(false);
    }

    loadTriggerData();
  }, [triggerConfidence]);

  if (imagesLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Top Bloat Triggers
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topTriggers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Top Bloat Triggers
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Keep logging meals to identify your triggers!
        </p>
      </div>
    );
  }

  const topTrigger = topTriggers[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Flame className="text-orange-500" size={24} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Your Top Bloat Triggers
        </h2>
      </div>

      {/* Hero Card - #1 Trigger */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-2xl h-64 group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-gray-100 dark:bg-gray-800">
          {/* Background Image with Overlay */}
          {topTrigger.imageUrl && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${topTrigger.imageUrl})`,
                }}
              ></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(topTrigger.impactScore)} opacity-40`}></div>
            </div>
          )}

          {/* Fallback gradient if no image */}
          {!topTrigger.imageUrl && (
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(topTrigger.impactScore)}`}></div>
          )}

          {/* Content Overlay */}
          <div className="relative h-full flex flex-col justify-between p-6 text-white">
            {/* Top Section - Impact Emoji */}
            <div>
              <div className="text-6xl mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">{getImpactEmoji(topTrigger.impactScore)}</div>
            </div>

            {/* Bottom Section */}
            <div>
              <h3 className="text-3xl font-bold mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_12px_rgb(0_0_0_/_80%)]">
                {topTrigger.displayName}
              </h3>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <div className="bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-lg border border-white/30 shadow-lg">
                  <span className="font-semibold drop-shadow-md">
                    {getSeverityLabel(topTrigger.impactScore)} • {topTrigger.occurrences}/{topTrigger.occurrences} times
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expand Button for #1 */}
        <button
          onClick={() => setExpandedIndex(expandedIndex === 0 ? null : 0)}
          className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {expandedIndex === 0 ? (
            <>
              <ChevronUp size={16} />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Why is this #1?
            </>
          )}
        </button>

        {/* Expanded Details for #1 */}
        {expandedIndex === 0 && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3 animate-in slide-in-from-top duration-200">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap size={16} className="text-orange-500" />
              Why is {topTrigger.displayName} ranked #1?
            </h4>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                <div>
                  <span className="font-medium">Eaten in {topTrigger.occurrences} meals</span>
                  {topTrigger.percentage > 0 && ` (${topTrigger.percentage}% of your meals)`}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                <div>
                  <span className="font-medium">Average bloating: {topTrigger.avgBloatingWith}/5</span>
                  <span className="text-xs ml-1">
                    ({topTrigger.personalBaselineAdjustment >= 0 ? '+' : ''}
                    {topTrigger.personalBaselineAdjustment.toFixed(1)} above your baseline)
                  </span>
                </div>
              </div>

              {topTrigger.consistencyFactor > 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <span className="font-medium">
                      Consistency: {Math.round(topTrigger.consistencyFactor * 100)}%
                    </span>
                    <span className="text-xs ml-1">
                      ({topTrigger.consistencyFactor >= 0.8 ? 'Very reliable trigger' : 'Sometimes causes bloating'})
                    </span>
                  </div>
                </div>
              )}

              {topTrigger.recentOccurrences > 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <span className="font-medium">Recent trend:</span>{' '}
                    {topTrigger.recentOccurrences} times in the last 7 days
                    {topTrigger.recencyBoost > 1.0 && (
                      <span className="text-xs ml-1">(Getting worse)</span>
                    )}
                  </div>
                </div>
              )}

              {topTrigger.topFoods.length > 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <span className="font-medium">Common foods:</span>{' '}
                    {topTrigger.topFoods.slice(0, 3).join(', ')}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Impact Score: {topTrigger.enhancedImpactScore.toFixed(2)}
                  <span className="ml-2">
                    (Weighted by consistency, frequency, and recency)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Top Triggers - Compact Cards */}
      {topTriggers.length > 1 && (
        <div className="overflow-visible">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Also watch out for:
          </h3>
          <div className="space-y-3 pb-2">
            {topTriggers.slice(1).map((trigger, idx) => {
              const actualIndex = idx + 1;
              const isExpanded = expandedIndex === actualIndex;

              return (
                <div key={trigger.category}>
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : actualIndex)}
                    className="relative overflow-hidden rounded-xl h-24 cursor-pointer group transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                  >
                    {/* Background Image */}
                    {trigger.imageUrl && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-20 transition-transform duration-500 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${trigger.imageUrl})`,
                        }}
                      ></div>
                    )}

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${getGradientClass(trigger.impactScore)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                    {/* Content */}
                    <div className="relative h-full flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getImpactEmoji(trigger.impactScore)}</div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {trigger.displayName}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {getSeverityLabel(trigger.impactScore)} • {trigger.occurrences} meals
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2 text-xs animate-in slide-in-from-top duration-200">
                      <div className="text-gray-600 dark:text-gray-400 space-y-1.5">
                        <div>• Average bloating: {trigger.avgBloatingWith}/5</div>
                        <div>• Appears in {trigger.percentage}% of meals</div>
                        {trigger.topFoods.length > 0 && (
                          <div>• Common: {trigger.topFoods.slice(0, 2).join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
