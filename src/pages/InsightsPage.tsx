import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import InsightsLoader from '@/components/shared/InsightsLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { BloatHeatmap } from '@/components/insights/BloatHeatmap';
import { VisualHealthScoreHero } from '@/components/insights/VisualHealthScoreHero';
import { SpotifyWrappedTriggers } from '@/components/insights/SpotifyWrappedTriggers';
import { InsightsTabBar } from '@/components/insights/InsightsTabBar';
import { ExperimentsTab } from '@/components/insights/ExperimentsTab';
import { AIGuideTab } from '@/components/insights/AIGuideTab';
import { BlueprintTab } from '@/components/insights/BlueprintTab';
import { useMeals } from '@/contexts/MealContext';
import { useMilestones } from '@/contexts/MilestonesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getIconForTrigger } from '@/lib/triggerUtils';
import { generateComprehensiveInsight, generateAdvancedInsights } from '@/lib/insightsAnalysis';
import { GrainTexture } from '@/components/ui/grain-texture';
import { InsightTab } from '@/types/milestones';

export default function InsightsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: userProfile } = useProfile(user?.id);
  const { entries, getCompletedCount } = useMeals();
  const { isTabUnlocked } = useMilestones();
  const completedCount = getCompletedCount();
  const neededForInsights = 3;
  // Check completed entries for insights, not just total entries
  const hasEnoughData = completedCount >= neededForInsights;

  // Tab state from URL or default to 'analysis'
  const tabFromUrl = searchParams.get('tab') as InsightTab | null;
  const [activeTab, setActiveTab] = useState<InsightTab>(tabFromUrl || 'analysis');

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ['analysis', 'experiments', 'ai_guide', 'blueprint'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Handle tab change
  const handleTabChange = (tab: InsightTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Loading state for AI magic animation
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisKey, setAnalysisKey] = useState(0);

  // Trigger re-analysis on page visit - optimized for faster loading
  useEffect(() => {
    setIsAnalyzing(true);
    setAnalysisKey(prev => prev + 1);

    // Minimal loading delay for smooth UX (reduced from 800ms)
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [completedCount]); // Re-run when completed entries change (includes new ratings)

  // Generate comprehensive insights using new analysis engine
  const insights = useMemo(() => {
    return generateComprehensiveInsight(entries);
  }, [entries]); // Recompute whenever entries array changes

  // Generate advanced insights for comprehensive card
  const advancedInsights = useMemo(() => {
    return generateAdvancedInsights(entries);
  }, [entries]);

  // Full-screen loading state
  if (isAnalyzing && hasEnoughData) {
    return (
      <AppLayout>
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
          <GrainTexture />
          <InsightsLoader />
          <p className="mt-6 text-lg font-semibold text-primary animate-pulse">
            Analyzing your insights
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crunching the numbers...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (!hasEnoughData) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="min-h-screen relative">
            {/* Premium animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-lavender/20 via-mint/15 to-background" />

            {/* Animated gradient orbs */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                x: [0, 25, 0],
                y: [0, -15, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-10 w-60 h-60 bg-gradient-to-br from-primary/20 to-mint/15 rounded-full blur-3xl pointer-events-none"
            />

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                x: [0, -20, 0],
                y: [0, 15, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-60 right-5 w-48 h-48 bg-gradient-to-tr from-lavender/25 to-purple-300/15 rounded-full blur-3xl pointer-events-none"
            />

            <GrainTexture />

            <StaggerContainer className="relative z-10 p-5 pt-8 max-w-lg mx-auto">
              <StaggerItem>
                <header className="mb-8">
                  <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-4xl font-black text-foreground tracking-tight"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  >
                    Insights
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-muted-foreground font-semibold mt-1"
                  >
                    Your personalized analysis
                  </motion.p>
                </header>
              </StaggerItem>

              <StaggerItem>
                <EmptyState
                  IconComponent={Sparkles}
                  title="Insights Coming Soon!"
                  description={`Rate ${neededForInsights - completedCount} more meal${neededForInsights - completedCount !== 1 ? 's' : ''} to unlock your personalized analysis.`}
                  actionLabel="Log a Meal"
                  onAction={() => navigate('/add-entry')}
                />
              </StaggerItem>

              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mt-6 relative overflow-hidden rounded-[2rem] shadow-xl"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/80 via-purple-100/70 to-pink-100/80" />

                  {/* Animated orb */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 15, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/15 rounded-full blur-2xl"
                  />

                  {/* Glass overlay */}
                  <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/80 rounded-[2rem] p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground font-bold">Progress</span>
                      <span className="font-black text-primary text-lg">{completedCount}/{neededForInsights}</span>
                    </div>
                    <div className="relative h-4 rounded-full overflow-hidden bg-white/60 border border-white/80 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / neededForInsights) * 100}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                        style={{
                          backgroundSize: '200% 100%',
                          animation: 'gradientShift 3s ease infinite',
                        }}
                      >
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        />
                      </motion.div>
                    </div>
                    {/* Milestone markers */}
                    <div className="flex justify-between mt-4">
                      {[1, 2, 3].map((day) => (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + day * 0.1, duration: 0.4 }}
                          className={`flex flex-col items-center ${
                            completedCount >= day ? 'opacity-100' : 'opacity-40'
                          } transition-all`}
                        >
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            completedCount >= day
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-white shadow-lg shadow-indigo-500/50'
                              : 'bg-muted border-muted-foreground/30'
                          }`} />
                          <span className={`text-xs font-bold mt-2 ${
                            completedCount >= day ? 'text-foreground' : 'text-muted-foreground/60'
                          }`}>Meal {day}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="min-h-screen relative">
          {/* Premium animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-lavender/15 via-mint/10 to-background" />

          {/* Animated gradient orbs */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-5 w-72 h-72 bg-gradient-to-br from-primary/15 to-mint/10 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              x: [0, -25, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[400px] right-0 w-64 h-64 bg-gradient-to-tr from-coral/15 to-rose-300/10 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[800px] left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-lavender/15 to-purple-300/10 rounded-full blur-3xl pointer-events-none"
          />

          <GrainTexture />

          <StaggerContainer className="relative z-10 p-6 pb-32 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <StaggerItem>
              <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-2"
              >
                <h1
                  className="text-4xl font-black text-foreground tracking-tight"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  Insights
                </h1>
                <p className="text-muted-foreground font-semibold mt-1">
                  Your personalized gut health analysis
                </p>
              </motion.header>
            </StaggerItem>

            {/* Tab Bar */}
            <StaggerItem>
              <InsightsTabBar activeTab={activeTab} onTabChange={handleTabChange} />
            </StaggerItem>

            {/* Tab Content */}
            {activeTab === 'experiments' && isTabUnlocked('experiments') && (
              <ExperimentsTab />
            )}

            {activeTab === 'ai_guide' && isTabUnlocked('ai_guide') && (
              <AIGuideTab />
            )}

            {activeTab === 'blueprint' && (
              <BlueprintTab />
            )}

            {/* Analysis Tab Content (default) */}
            {activeTab === 'analysis' && (
              <>
            {/* 1. HERO SECTION - Bloat Health Score */}
            {insights && (
              <StaggerItem>
                <VisualHealthScoreHero
                  avgBloating={insights.avgBloating}
                  totalMeals={insights.totalMeals}
                  lowBloatingCount={insights.lowBloatingCount}
                  highBloatingCount={insights.highBloatingCount}
                />
              </StaggerItem>
            )}

            {/* 2. SPOTIFY WRAPPED TRIGGERS - Premium Cards */}
            {advancedInsights && advancedInsights.triggerConfidence.length > 0 && (
              <StaggerItem>
                <SpotifyWrappedTriggers triggerConfidence={advancedInsights.triggerConfidence} />
              </StaggerItem>
            )}

            {/* 3. BLOAT HEATMAP CALENDAR */}
            <StaggerItem>
              <BloatHeatmap entries={entries} />
            </StaggerItem>

            {/* 5. TOP FOODS - Most logged */}
            {insights?.topFoods && insights.topFoods.length > 0 && (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative overflow-hidden rounded-[2rem] shadow-xl"
                >
                  {/* Premium gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender/30 via-purple-100/20 to-pink-100/30" />

                  {/* Animated orb */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 15, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-lavender/30 to-purple-300/20 rounded-full blur-3xl"
                  />

                  {/* Glass overlay */}
                  <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem] p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender/40 to-purple-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-purple-500/20"
                      >
                        <UtensilsCrossed className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
                      </motion.div>
                      <div>
                        <h2 className="font-black text-foreground text-xl tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                          Most Logged Foods
                        </h2>
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5">Your eating patterns</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {insights.topFoods.map((item, index) => {
                        const icon = getIconForTrigger(item.food);
                        return (
                          <motion.div
                            key={item.food}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 hover:bg-white/80 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender/50 to-purple-500/20 border border-white/80 flex items-center justify-center text-lg shadow-sm">
                              {icon}
                            </div>
                            <span className="flex-1 font-bold text-foreground">{item.food}</span>
                            <span className="text-sm font-black text-purple-600 bg-purple-500/10 px-3 py-1.5 rounded-full">
                              {item.count}x
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* 6. BLOATING GUIDE */}
            <StaggerItem>
              <BloatingGuide />
            </StaggerItem>
              </>
            )}
          </StaggerContainer>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
