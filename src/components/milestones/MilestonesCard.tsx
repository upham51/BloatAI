import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  Lock,
  Trophy,
  Target,
  Zap,
  Brain,
  Crown,
  Gift,
  CheckCircle2,
  ChevronDown,
  Star,
  Flame,
  Map,
  Compass
} from 'lucide-react';
import { useMilestones } from '@/contexts/MilestonesContext';
import { MilestoneCheckmark, MilestoneConnector } from './MilestoneCheckmark';
import { ConfettiMicroAnimation, TierUnlockAnimation } from './ConfettiMicroAnimation';
import { haptics } from '@/lib/haptics';
import { useState, useEffect } from 'react';

// Tier configuration with rewards and motivation
const tierConfig = {
  1: {
    name: 'Foundation',
    tagline: 'Plant the seeds of understanding',
    icon: Target,
    color: 'sage',
    gradient: 'from-sage/20 via-mint/10 to-sage-light/20',
    accentGradient: 'from-sage to-mint',
    bgColor: 'bg-sage/10',
    borderColor: 'border-sage/30',
    textColor: 'text-sage-dark',
    description: 'Start logging to teach the AI about your unique body',
    reward: 'AI Pattern Detection',
    rewardIcon: '🔬',
    rewardDescription: 'Unlock intelligent meal analysis',
    whyItMatters: 'Your first meals create the foundation for everything. Each log teaches the AI what makes YOUR body unique.',
  },
  2: {
    name: 'Evidence',
    tagline: 'Build your body of proof',
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-100/30 via-orange-50/20 to-yellow-100/30',
    accentGradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    description: '72 hours of data reveals your patterns',
    reward: 'Experiment Lab',
    rewardIcon: '🧪',
    rewardDescription: 'Run elimination experiments',
    whyItMatters: '72 hours gives the AI enough data to spot preliminary patterns in when and how your bloating occurs.',
  },
  3: {
    name: 'Discovery',
    tagline: 'Confirm your first trigger',
    icon: Brain,
    color: 'purple',
    gradient: 'from-purple-100/30 via-violet-50/20 to-lavender/30',
    accentGradient: 'from-purple-400 to-violet-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    description: 'Test a suspected trigger scientifically',
    reward: 'Confirmed Triggers',
    rewardIcon: '✅',
    rewardDescription: 'Know exactly what affects you',
    whyItMatters: 'Experiments turn hunches into proof. You\'ll know for certain what foods to avoid—no more guessing.',
  },
  4: {
    name: 'Intelligence',
    tagline: 'Meet your personal AI guide',
    icon: Sparkles,
    color: 'rose',
    gradient: 'from-rose-100/30 via-pink-50/20 to-rose-100/30',
    accentGradient: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    description: '7 days of data powers personalized guidance',
    reward: 'AI Health Guide',
    rewardIcon: '🤖',
    rewardDescription: 'Get personalized recommendations',
    whyItMatters: 'A full week captures weekday and weekend patterns. Your AI Guide can finally give you tailored advice.',
  },
  5: {
    name: 'Mastery',
    tagline: 'Claim your complete blueprint',
    icon: Crown,
    color: 'gold',
    gradient: 'from-amber-100/30 via-yellow-50/20 to-amber-100/30',
    accentGradient: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    description: '90 days to complete gut mastery',
    reward: 'Gut Blueprint',
    rewardIcon: '👑',
    rewardDescription: 'Your complete personalized gut map',
    whyItMatters: '90 days of data creates your definitive guide—triggers, safe foods, optimal timing, everything you need.',
  },
};

// Milestone details for each tier
const getMilestoneDetails = (tier: number) => {
  switch (tier) {
    case 1:
      return [
        { id: 'first_meal', label: 'Log your first meal', short: '1', icon: '🍽️' },
        { id: 'first_rating', label: 'Rate how you feel', short: '2', icon: '⭐' },
        { id: 'three_meals', label: 'Log 3 rated meals', short: '3', icon: '📊' },
        { id: 'pattern_detection', label: 'AI analysis activated', short: '✓', icon: '🔬' },
      ];
    case 2:
      return [
        { id: 'evidence_day1', label: 'Complete Day 1', short: '1', icon: '1️⃣' },
        { id: 'evidence_day2', label: 'Complete Day 2', short: '2', icon: '2️⃣' },
        { id: 'evidence_day3', label: 'Complete Day 3', short: '3', icon: '🏆' },
      ];
    case 3:
      return [
        { id: 'first_experiment', label: 'Complete elimination test', short: '🧪', icon: '🧪' },
      ];
    case 4:
      return [
        { id: 'weekly_baseline', label: 'Track for 7 days', short: '7', icon: '📅' },
        { id: 'ai_guide', label: 'AI Guide consultation', short: '🤖', icon: '🤖' },
      ];
    case 5:
      return [
        { id: 'day_30', label: '30 days of tracking', short: '30', icon: '🌟' },
        { id: 'day_60', label: '60 days of tracking', short: '60', icon: '💫' },
        { id: 'day_90', label: 'Blueprint complete', short: '90', icon: '👑' },
      ];
    default:
      return [];
  }
};

export function MilestonesCard() {
  const navigate = useNavigate();
  const {
    milestoneState,
    getCurrentTier,
    getTierProgress,
    getNextMilestone,
    isMilestoneComplete,
    pendingEvents,
    clearPendingEvent,
  } = useMilestones();

  const [showUnlock, setShowUnlock] = useState(false);
  const [currentUnlockEvent, setCurrentUnlockEvent] = useState<typeof pendingEvents[0] | null>(null);
  const [expandedTier, setExpandedTier] = useState<number | null>(null);

  // Handle pending events (show unlock animations)
  useEffect(() => {
    const tierUnlocks = pendingEvents.filter(e => e.type === 'tier_unlock');
    if (tierUnlocks.length > 0 && !showUnlock) {
      setCurrentUnlockEvent(tierUnlocks[0]);
      setShowUnlock(true);
    }
  }, [pendingEvents, showUnlock]);

  const handleUnlockComplete = () => {
    setShowUnlock(false);
    if (currentUnlockEvent) {
      const index = pendingEvents.findIndex(e => e.milestoneId === currentUnlockEvent.milestoneId);
      if (index !== -1) {
        clearPendingEvent(index);
      }
    }
    setCurrentUnlockEvent(null);
  };

  if (!milestoneState) return null;

  const currentTier = getCurrentTier();
  const tierInfo = tierConfig[currentTier as keyof typeof tierConfig] || tierConfig[1];
  const TierIcon = tierInfo.icon;
  const progress = getTierProgress(currentTier);
  const nextMilestone = getNextMilestone();

  // Calculate total progress across all tiers
  const calculateTotalProgress = () => {
    let completed = 0;
    const total = 13; // Total milestones across all tiers

    // Tier 1: 4 milestones
    if (isMilestoneComplete('first_meal')) completed++;
    if (isMilestoneComplete('first_rating')) completed++;
    if (isMilestoneComplete('three_meals')) completed++;
    if (isMilestoneComplete('pattern_detection')) completed++;

    // Tier 2: 3 milestones
    if (isMilestoneComplete('evidence_day1')) completed++;
    if (isMilestoneComplete('evidence_day2')) completed++;
    if (isMilestoneComplete('evidence_day3')) completed++;

    // Tier 3: 1 milestone
    if (isMilestoneComplete('first_experiment')) completed++;

    // Tier 4: 2 milestones
    if (isMilestoneComplete('weekly_baseline')) completed++;
    if (isMilestoneComplete('ai_guide')) completed++;

    // Tier 5: 3 milestones
    if (isMilestoneComplete('day_30')) completed++;
    if (isMilestoneComplete('day_60')) completed++;
    if (isMilestoneComplete('day_90')) completed++;

    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const totalProgress = calculateTotalProgress();

  const isTierComplete = (tier: number) => {
    const milestones = getMilestoneDetails(tier);
    return milestones.every(m => isMilestoneComplete(m.id));
  };

  const isTierLocked = (tier: number) => tier > currentTier;
  const isTierCurrent = (tier: number) => tier === currentTier;

  const handleTierClick = (tier: number) => {
    if (isTierLocked(tier)) return;
    haptics.light();
    setExpandedTier(expandedTier === tier ? null : tier);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.medium();

    if (currentTier === 1) {
      navigate('/add-entry');
    } else if (currentTier === 3 && !isMilestoneComplete('first_experiment')) {
      navigate('/insights?tab=experiments');
    } else {
      navigate('/insights');
    }
  };

  // Set current tier as expanded by default
  useEffect(() => {
    if (expandedTier === null) {
      setExpandedTier(currentTier);
    }
  }, [currentTier]);

  return (
    <>
      {/* Tier Unlock Animation */}
      <TierUnlockAnimation
        show={showUnlock}
        tier={currentUnlockEvent?.tier || 1}
        title={currentUnlockEvent?.title || ''}
        description={currentUnlockEvent?.description || ''}
        onComplete={handleUnlockComplete}
      />

      {/* Main Card */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-sage/15"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-br from-sage/20 via-mint/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-lavender/15 via-purple-100/10 to-transparent blur-3xl" />
        </div>

        <div className="relative">
          {/* Header Section */}
          <div className="p-6 pb-4">
            {/* Title and overall progress */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <motion.div
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage via-mint to-sage-light flex items-center justify-center shadow-lg shadow-sage/30"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Compass className="w-4 h-4 text-white" />
                  </motion.div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">
                    Unlock Your Body's Secrets
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground ml-10">
                  Complete milestones to reveal what makes your gut unique
                </p>
              </div>
            </div>

            {/* Overall Progress Ring */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-sage/10 via-transparent to-mint/10 border border-sage/20">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="fill-none stroke-sage/20"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="fill-none stroke-sage"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 176" }}
                    animate={{ strokeDasharray: `${(totalProgress.percentage / 100) * 176} 176` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-sage-dark">{totalProgress.percentage}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">Journey Progress</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-sage-dark font-medium">
                    Tier {currentTier} of 5
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalProgress.completed} of {totalProgress.total} milestones complete
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((tier) => (
                    <div
                      key={tier}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        isTierComplete(tier)
                          ? 'bg-sage'
                          : tier === currentTier
                          ? 'bg-sage/50'
                          : 'bg-sage/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tier Roadmap */}
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((tier) => {
                const tierData = tierConfig[tier as keyof typeof tierConfig];
                const TierIconComponent = tierData.icon;
                const isComplete = isTierComplete(tier);
                const isLocked = isTierLocked(tier);
                const isCurrent = isTierCurrent(tier);
                const isExpanded = expandedTier === tier;
                const tierMilestones = getMilestoneDetails(tier);
                const tierProgress = getTierProgress(tier);

                return (
                  <motion.div
                    key={tier}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      isLocked
                        ? 'bg-gray-50/50 border border-gray-200/50'
                        : isComplete
                        ? `${tierData.bgColor} border ${tierData.borderColor}`
                        : isCurrent
                        ? 'bg-white border-2 border-sage/40 shadow-lg shadow-sage/10'
                        : `${tierData.bgColor} border ${tierData.borderColor}`
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: tier * 0.05 }}
                  >
                    {/* Tier Header */}
                    <motion.div
                      className={`p-4 cursor-pointer ${isLocked ? 'opacity-60' : ''}`}
                      onClick={() => handleTierClick(tier)}
                      whileTap={!isLocked ? { scale: 0.99 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        {/* Tier Icon */}
                        <motion.div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${
                            isLocked
                              ? 'bg-gray-200'
                              : `bg-gradient-to-br ${tierData.accentGradient}`
                          }`}
                          whileHover={!isLocked ? { scale: 1.05, rotate: 3 } : {}}
                        >
                          {isLocked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <TierIconComponent className="w-5 h-5 text-white" />
                          )}
                        </motion.div>

                        {/* Tier Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-sm ${isLocked ? 'text-gray-400' : 'text-foreground'}`}>
                              {tier}. {tierData.name}
                            </h3>
                            {isComplete && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-sage-dark font-medium">
                                Complete
                              </span>
                            )}
                            {isCurrent && !isComplete && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium animate-pulse">
                                Active
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${isLocked ? 'text-gray-400' : 'text-muted-foreground'}`}>
                            {tierData.tagline}
                          </p>
                        </div>

                        {/* Reward Badge */}
                        <div className="flex items-center gap-2">
                          {!isLocked && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                              isComplete ? 'bg-white/80' : 'bg-white/50'
                            }`}>
                              <span className="text-base">{tierData.rewardIcon}</span>
                              <span className={`text-xs font-medium ${isComplete ? tierData.textColor : 'text-muted-foreground'}`}>
                                {tierData.reward}
                              </span>
                            </div>
                          )}
                          {!isLocked && (
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className={`w-4 h-4 ${isLocked ? 'text-gray-300' : 'text-muted-foreground'}`} />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Progress bar for current tier */}
                      {isCurrent && !isComplete && (
                        <div className="mt-3 relative h-2 bg-sage/20 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-sage to-mint rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${tierProgress.percentage}%` }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      )}
                    </motion.div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && !isLocked && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="px-4 pb-4">
                            {/* Why It Matters */}
                            <div className="p-3 rounded-xl bg-white/60 border border-white/80 mb-3">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Sparkles className="w-3 h-3 text-sage-dark" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-0.5">Why This Matters</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {tierData.whyItMatters}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Milestone Steps */}
                            <div className="space-y-2">
                              {tierMilestones.map((milestone, index) => {
                                const isCompleted = isMilestoneComplete(milestone.id);
                                const isPrevCompleted = index === 0 || isMilestoneComplete(tierMilestones[index - 1]?.id);
                                const isActive = !isCompleted && isPrevCompleted && isCurrent;

                                return (
                                  <motion.div
                                    key={milestone.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                      isCompleted
                                        ? 'bg-sage/10 border border-sage/20'
                                        : isActive
                                        ? 'bg-white border border-sage/30 shadow-sm'
                                        : 'bg-gray-50/50 border border-gray-100'
                                    }`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <MilestoneCheckmark
                                      isComplete={isCompleted}
                                      isActive={isActive}
                                      size="sm"
                                      color={isCompleted ? 'mint' : isActive ? 'sage' : 'lavender'}
                                      showGlow={isCompleted}
                                    />
                                    <span className={`text-sm flex-1 ${
                                      isCompleted
                                        ? 'text-sage-dark font-medium'
                                        : isActive
                                        ? 'text-foreground font-medium'
                                        : 'text-muted-foreground'
                                    }`}>
                                      {milestone.label}
                                    </span>
                                    {isCompleted && (
                                      <CheckCircle2 className="w-4 h-4 text-sage" />
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Unlock Reward Preview */}
                            {!isComplete && (
                              <motion.div
                                className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="flex items-center gap-2">
                                  <Gift className="w-4 h-4 text-amber-600" />
                                  <span className="text-xs font-semibold text-amber-800">Complete to unlock:</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-lg">{tierData.rewardIcon}</span>
                                  <div>
                                    <p className="text-sm font-bold text-amber-900">{tierData.reward}</p>
                                    <p className="text-xs text-amber-700">{tierData.rewardDescription}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Current Action CTA */}
          {nextMilestone && (
            <div className="px-4 pb-5">
              <motion.div
                className="p-4 rounded-2xl bg-gradient-to-r from-sage/10 via-mint/5 to-sage-light/10 border border-sage/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sage to-mint flex items-center justify-center">
                        <Target className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-sage-dark uppercase tracking-wide">
                        Your Next Step
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground text-sm mb-0.5">
                      {nextMilestone.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {nextMilestone.description}
                    </p>
                  </div>

                  <motion.button
                    className="ml-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sage to-mint text-white text-sm font-bold shadow-lg shadow-sage/30 flex items-center gap-1.5"
                    onClick={handleActionClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentTier === 1 ? 'Log Meal' : 'Continue'}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Journey Complete State */}
          {currentTier === 5 && isMilestoneComplete('day_90') && (
            <div className="px-4 pb-5">
              <motion.div
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border border-amber-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 text-sm">Journey Complete!</h4>
                    <p className="text-xs text-amber-700">
                      Your personalized Gut Blueprint is ready
                    </p>
                  </div>
                  <motion.button
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-bold shadow-lg"
                    onClick={() => navigate('/insights?tab=blueprint')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Blueprint
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Confetti for milestone completions */}
        <ConfettiMicroAnimation
          trigger={pendingEvents.some(e => e.type === 'milestone_complete')}
          variant="sparkle"
          color="sage"
          intensity="low"
        />
      </motion.div>
    </>
  );
}

// Compact version for use in headers or smaller spaces
export function MilestonesCompact() {
  const { getCurrentTier, getTierProgress, getNextMilestone, isMilestoneComplete } = useMilestones();
  const navigate = useNavigate();

  const currentTier = getCurrentTier();
  const progress = getTierProgress(currentTier);
  const tierInfo = tierConfig[currentTier as keyof typeof tierConfig] || tierConfig[1];

  // Calculate total progress
  const calculateTotalProgress = () => {
    let completed = 0;
    const milestoneIds = [
      'first_meal', 'first_rating', 'three_meals', 'pattern_detection',
      'evidence_day1', 'evidence_day2', 'evidence_day3',
      'first_experiment',
      'weekly_baseline', 'ai_guide',
      'day_30', 'day_60', 'day_90'
    ];
    milestoneIds.forEach(id => {
      if (isMilestoneComplete(id)) completed++;
    });
    return { completed, total: 13, percentage: Math.round((completed / 13) * 100) };
  };

  const totalProgress = calculateTotalProgress();

  return (
    <motion.button
      className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-sage/20 shadow-md"
      onClick={() => {
        haptics.light();
        navigate('/insights');
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-9 h-9">
        <svg className="w-9 h-9 -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15"
            className="fill-none stroke-sage/20"
            strokeWidth="3"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="15"
            className="fill-none stroke-sage"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ strokeDasharray: `${(totalProgress.percentage / 100) * 94} 94` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className="w-4 h-4 text-sage-dark" />
        </div>
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold text-foreground">Tier {currentTier}</p>
        <p className="text-[10px] text-muted-foreground">{totalProgress.completed}/13 milestones</p>
      </div>
    </motion.button>
  );
}
