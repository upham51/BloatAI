import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Flame,
  Target,
  Lightbulb,
  Activity,
  Award,
  Clock,
  MinusCircle,
} from 'lucide-react';
import { ComprehensiveAdvancedInsights } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';

interface ComprehensiveInsightsCardProps {
  insights: ComprehensiveAdvancedInsights;
}

export function ComprehensiveInsightsCard({ insights }: ComprehensiveInsightsCardProps) {
  const [selectedSection, setSelectedSection] = useState<'triggers' | 'combinations' | 'progress' | 'recommendations'>('triggers');

  // Prepare trigger confidence data
  const highConfidenceTriggers = insights.triggerConfidence.filter(t => t.confidence === 'high');
  const investigatingTriggers = insights.triggerConfidence.filter(t => t.confidence === 'investigating');
  const needsDataTriggers = insights.triggerConfidence.filter(t => t.confidence === 'needsData');

  // Prepare weekly comparison chart data
  const weeklyComparisonData = useMemo(() => {
    return [
      {
        name: 'This Week',
        bloating: insights.weeklyComparison.thisWeekAvgBloating,
        fill: insights.weeklyComparison.trend === 'improving' ? 'hsl(var(--primary))' : 'hsl(var(--coral))',
      },
      {
        name: 'Overall',
        bloating: insights.weeklyComparison.overallAvgBloating,
        fill: 'hsl(var(--muted-foreground))',
      },
    ];
  }, [insights.weeklyComparison]);

  // Success metrics visualization
  const successData = useMemo(() => {
    return [
      { metric: 'Comfort Rate', value: insights.successMetrics.comfortableMealRate, max: 100 },
      { metric: 'Avoidance', value: insights.successMetrics.triggerAvoidanceRate, max: 100 },
    ];
  }, [insights.successMetrics]);

  const getTrendIcon = () => {
    if (insights.weeklyComparison.trend === 'improving') {
      return <TrendingUp className="w-5 h-5 text-primary" />;
    } else if (insights.weeklyComparison.trend === 'worsening') {
      return <TrendingDown className="w-5 h-5 text-coral" />;
    }
    return <MinusCircle className="w-5 h-5 text-muted-foreground" />;
  };

  const getTrendText = () => {
    if (insights.weeklyComparison.trend === 'improving') {
      return 'Improving!';
    } else if (insights.weeklyComparison.trend === 'worsening') {
      return 'Needs attention';
    }
    return 'Stable';
  };

  const getTrendColor = () => {
    if (insights.weeklyComparison.trend === 'improving') return 'text-primary';
    if (insights.weeklyComparison.trend === 'worsening') return 'text-coral';
    return 'text-muted-foreground';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="premium-card p-3 border border-primary/20 shadow-lg">
        <div className="text-sm font-semibold text-foreground mb-1">{data.name}</div>
        <div className="text-xs text-muted-foreground">
          Avg Bloating: <span className="font-bold text-primary">{data.bloating}/5</span>
        </div>
      </div>
    );
  };

  return (
    <div className="premium-card p-6 space-y-6">
      {/* Header with hero stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Insights Dashboard</h2>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-semibold ${getTrendColor()}`}>
              {getTrendText()}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time analysis of your trigger patterns and progress
        </p>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* High Confidence Triggers */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-coral/10 to-coral/5 border border-coral/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-coral" />
            <span className="text-xs font-medium text-coral">Confirmed Triggers</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {highConfidenceTriggers.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">5+ occurrences</p>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Current Streak</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {insights.successMetrics.currentStreak}
          </div>
          <p className="text-xs text-muted-foreground mt-1">comfortable meals</p>
        </div>

        {/* Improvement */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-peach/10 to-peach/5 border border-peach/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-peach" />
            <span className="text-xs font-medium text-peach">14-Day Progress</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {insights.successMetrics.improvementPercentage > 0 ? '+' : ''}
            {insights.successMetrics.improvementPercentage}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">improvement rate</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedSection('triggers')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            selectedSection === 'triggers'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
          }`}
        >
          🎯 Triggers
        </button>
        <button
          onClick={() => setSelectedSection('combinations')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            selectedSection === 'combinations'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
          }`}
        >
          🔗 Combinations
        </button>
        <button
          onClick={() => setSelectedSection('progress')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            selectedSection === 'progress'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
          }`}
        >
          📈 Progress
        </button>
        <button
          onClick={() => setSelectedSection('recommendations')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            selectedSection === 'recommendations'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
          }`}
        >
          💡 Next Steps
        </button>
      </div>

      {/* Content Sections */}
      <div className="min-h-[400px]">
        {/* TRIGGERS SECTION */}
        {selectedSection === 'triggers' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Trigger Confidence Rankings
            </h3>

            {/* High Confidence */}
            {highConfidenceTriggers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-coral animate-pulse" />
                  <span className="text-sm font-bold text-coral uppercase tracking-wide">High Confidence</span>
                  <span className="text-xs text-muted-foreground">(5+ occurrences)</span>
                </div>
                <div className="space-y-2">
                  {highConfidenceTriggers.map((trigger, index) => {
                    const categoryInfo = getTriggerCategory(trigger.category);
                    return (
                      <div
                        key={trigger.category}
                        className="p-4 rounded-xl bg-gradient-to-r from-coral/5 to-transparent border border-coral/20 hover:border-coral/40 transition-all cursor-pointer group"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'slideInRight 0.5s ease-out',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-foreground text-base">
                                {categoryInfo?.displayName || trigger.category}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-coral/20 text-coral text-xs font-semibold">
                                {trigger.occurrences}x
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Avg bloating: <span className="font-bold text-coral">{trigger.avgBloatingWith}/5</span> with vs{' '}
                              <span className="font-bold text-primary">{trigger.avgBloatingWithout}/5</span> without
                            </p>
                            {trigger.topFoods.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {trigger.topFoods.map((food, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded-md bg-coral/10 text-coral text-xs font-medium"
                                  >
                                    {food}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-coral">{trigger.percentage}%</div>
                            <div className="text-xs text-muted-foreground">of meals</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Investigating */}
            {investigatingTriggers.length > 0 && (
              <div className="space-y-2 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-peach animate-pulse" />
                  <span className="text-sm font-bold text-peach uppercase tracking-wide">Investigating</span>
                  <span className="text-xs text-muted-foreground">(2-4 occurrences)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {investigatingTriggers.map((trigger, index) => {
                    const categoryInfo = getTriggerCategory(trigger.category);
                    return (
                      <div
                        key={trigger.category}
                        className="p-3 rounded-lg bg-gradient-to-r from-peach/5 to-transparent border border-peach/20 hover:border-peach/40 transition-all"
                        style={{
                          animationDelay: `${(highConfidenceTriggers.length + index) * 100}ms`,
                          animation: 'slideInRight 0.5s ease-out',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-foreground text-sm">
                            {categoryInfo?.displayName || trigger.category}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded-full bg-peach/20 text-peach text-xs font-semibold">
                            {trigger.occurrences}x
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Avg: <span className="font-bold text-peach">{trigger.avgBloatingWith}/5</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Need More Data */}
            {needsDataTriggers.length > 0 && needsDataTriggers.length <= 3 && (
              <div className="space-y-2 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Need More Data</span>
                  <span className="text-xs text-muted-foreground">(1 occurrence)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {needsDataTriggers.slice(0, 3).map((trigger) => {
                    const categoryInfo = getTriggerCategory(trigger.category);
                    return (
                      <span
                        key={trigger.category}
                        className="px-3 py-1.5 rounded-full bg-muted/20 text-muted-foreground text-xs font-medium border border-border/50"
                      >
                        {categoryInfo?.displayName || trigger.category}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {highConfidenceTriggers.length === 0 && investigatingTriggers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No triggers identified yet. Keep logging meals!</p>
              </div>
            )}
          </div>
        )}

        {/* COMBINATIONS SECTION */}
        {selectedSection === 'combinations' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-coral" />
              Food Combinations
            </h3>

            {insights.combinations.length > 0 ? (
              <div className="space-y-3">
                {insights.combinations.map((combo, index) => {
                  const trigger1Info = getTriggerCategory(combo.triggers[0]);
                  const trigger2Info = getTriggerCategory(combo.triggers[1]);

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-gradient-to-r from-coral/10 via-peach/5 to-transparent border border-coral/30 hover:border-coral/50 transition-all"
                      style={{
                        animationDelay: `${index * 150}ms`,
                        animation: 'slideInLeft 0.5s ease-out',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-coral text-white text-xs font-bold">
                          ⚠️ Worse Together
                        </span>
                        <span className="text-xs text-muted-foreground">{combo.occurrences} times</span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 text-center">
                          <div className="text-sm font-bold text-foreground">
                            {trigger1Info?.displayName || combo.triggers[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">+</div>
                          <div className="text-sm font-bold text-foreground">
                            {trigger2Info?.displayName || combo.triggers[1]}
                          </div>
                        </div>
                        <div className="text-center px-4 py-2 rounded-lg bg-coral/10">
                          <div className="text-2xl font-bold text-coral">{combo.avgBloatingTogether}</div>
                          <div className="text-xs text-muted-foreground">together</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span>Separately: <span className="font-bold text-primary">{combo.avgBloatingSeparate}/5</span></span>
                        <span>•</span>
                        <span>
                          Difference: <span className="font-bold text-coral">
                            +{(combo.avgBloatingTogether - combo.avgBloatingSeparate).toFixed(1)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No significant food combinations detected yet.</p>
                <p className="text-xs mt-2">Need at least 5 meals to identify patterns.</p>
              </div>
            )}
          </div>
        )}

        {/* PROGRESS SECTION */}
        {selectedSection === 'progress' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              This Week vs Overall
            </h3>

            {/* Weekly Comparison Chart */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyComparisonData}>
                  <defs>
                    <linearGradient id="improvingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="worseningGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--coral))" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(var(--coral))" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="bloating"
                    radius={[8, 8, 0, 0]}
                    animationDuration={2000}
                    animationBegin={100}
                  >
                    {weeklyComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0 && insights.weeklyComparison.trend === 'improving'
                            ? 'url(#improvingGradient)'
                            : index === 0 && insights.weeklyComparison.trend === 'worsening'
                            ? 'url(#worseningGradient)'
                            : entry.fill
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* New Patterns Alert */}
            {insights.weeklyComparison.newPatterns.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-peach/10 to-transparent border border-peach/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-peach flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">New Pattern Alert</h4>
                    <p className="text-sm text-muted-foreground">
                      {insights.weeklyComparison.newPatterns.join(', ')} appeared more frequently this week
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Comfortable Meals</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {insights.successMetrics.comfortableMealRate}%
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
                    style={{
                      width: `${insights.successMetrics.comfortableMealRate}%`,
                      animationDelay: '200ms',
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-peach/10 to-peach/5 border border-peach/20">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-peach" />
                  <span className="text-xs font-medium text-peach">Trigger Avoidance</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {insights.successMetrics.triggerAvoidanceRate}%
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-peach to-peach/60 rounded-full transition-all duration-1000"
                    style={{
                      width: `${insights.successMetrics.triggerAvoidanceRate}%`,
                      animationDelay: '400ms',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Streaks */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-primary/10 via-peach/5 to-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-foreground">Your Streaks</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <div>
                      <span className="text-2xl font-bold text-primary">{insights.successMetrics.currentStreak}</span>
                      <span className="text-xs text-muted-foreground ml-1">current</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-peach">{insights.successMetrics.longestStreak}</span>
                      <span className="text-xs text-muted-foreground ml-1">best</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">14-Day Change</div>
                  <div className="text-2xl font-bold text-primary">
                    {insights.successMetrics.currentAvgBloating}
                    <span className="text-sm text-muted-foreground ml-1">/ 5</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    was {insights.successMetrics.previousPeriodAvgBloating}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS SECTION */}
        {selectedSection === 'recommendations' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              What to Test Next
            </h3>

            {insights.testingRecommendations.length > 0 ? (
              <div className="space-y-3">
                {insights.testingRecommendations.map((rec, index) => {
                  const getIcon = () => {
                    if (rec.type === 'eliminate') return <Flame className="w-5 h-5 text-coral" />;
                    if (rec.type === 'reintroduce') return <Clock className="w-5 h-5 text-primary" />;
                    return <AlertCircle className="w-5 h-5 text-peach" />;
                  };

                  const getColor = () => {
                    if (rec.priority === 'high') return 'coral';
                    if (rec.priority === 'medium') return 'peach';
                    return 'primary';
                  };

                  const color = getColor();

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl bg-gradient-to-r from-${color}/10 to-transparent border border-${color}/30 hover:border-${color}/50 transition-all cursor-pointer group`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideInUp 0.5s ease-out',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {getIcon()}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground">{rec.food}</h4>
                            <span className={`px-2 py-0.5 rounded-full bg-${color}/20 text-${color} text-xs font-semibold uppercase`}>
                              {rec.type}
                            </span>
                            {rec.priority === 'high' && (
                              <span className="px-2 py-0.5 rounded-full bg-coral text-white text-xs font-bold">
                                HIGH PRIORITY
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                          {rec.daysAvoided && (
                            <p className="text-xs text-primary font-semibold mt-2">
                              ✓ Avoided for {rec.daysAvoided} days
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No specific recommendations yet.</p>
                <p className="text-xs mt-2">Keep tracking meals to get personalized testing suggestions!</p>
              </div>
            )}

            {/* General Advice */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">Keep Going!</h4>
                  <p className="text-sm text-muted-foreground">
                    Continue logging your meals to build a more complete picture of your triggers.
                    The more data you track, the more accurate your insights become.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-4 border-t border-border/30">
        <p className="text-xs text-center text-muted-foreground">
          Updated in real-time • Based on {insights.triggerConfidence.reduce((sum, t) => sum + t.occurrences, 0)} meal entries
        </p>
      </div>
    </div>
  );
}

// Add keyframe animations to global CSS
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('insights-animations')) {
  styleTag.id = 'insights-animations';
  document.head.appendChild(styleTag);
}
