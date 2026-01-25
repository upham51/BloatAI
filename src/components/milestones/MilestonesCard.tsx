import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Lock, Trophy, Target, Zap, Brain, Crown } from 'lucide-react';
import { useMilestones } from '@/contexts/MilestonesContext';
import { MilestoneCheckmark, MilestoneConnector } from './MilestoneCheckmark';
import { ConfettiMicroAnimation, TierUnlockAnimation } from './ConfettiMicroAnimation';
import { haptics } from '@/lib/haptics';
import { useState, useEffect } from 'react';

const tierConfig = {
  1: {
    name: 'First Clues',
    icon: Target,
    color: 'sage',
    gradient: 'from-sage/20 via-mint/10 to-sage-light/20',
    accentGradient: 'from-sage to-mint',
    description: 'Log and rate your first meals',
  },
  2: {
    name: '72-Hour Evidence',
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-100/30 via-orange-50/20 to-yellow-100/30',
    accentGradient: 'from-amber-400 to-orange-500',
    description: 'Build your evidence streak',
  },
  3: {
    name: 'Active Discovery',
    icon: Brain,
    color: 'purple',
    gradient: 'from-purple-100/30 via-violet-50/20 to-lavender/30',
    accentGradient: 'from-purple-400 to-violet-500',
    description: 'Test your first trigger',
  },
  4: {
    name: 'AI Guide',
    icon: Sparkles,
    color: 'rose',
    gradient: 'from-rose-100/30 via-pink-50/20 to-rose-100/30',
    accentGradient: 'from-rose-400 to-pink-500',
    description: 'Unlock your AI consultation',
  },
  5: {
    name: 'Gut Blueprint',
    icon: Crown,
    color: 'gold',
    gradient: 'from-amber-100/30 via-yellow-50/20 to-amber-100/30',
    accentGradient: 'from-amber-400 to-yellow-500',
    description: 'Your complete gut health map',
  },
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

  // Determine which milestones to show based on current tier
  const getMilestonesForTier = () => {
    switch (currentTier) {
      case 1:
        return [
          { id: 'first_meal', label: 'Log meal', short: '1st' },
          { id: 'first_rating', label: 'Rate meal', short: '2nd' },
          { id: 'three_meals', label: '3 meals', short: '3rd' },
          { id: 'pattern_detection', label: 'AI active', short: '🔬' },
        ];
      case 2:
        return [
          { id: 'evidence_day1', label: 'Day 1', short: 'D1' },
          { id: 'evidence_day2', label: 'Day 2', short: 'D2' },
          { id: 'evidence_day3', label: 'Day 3', short: 'D3' },
        ];
      case 3:
        return [
          { id: 'first_experiment', label: 'Experiment', short: '🧪' },
        ];
      case 4:
        return [
          { id: 'weekly_baseline', label: '7 days', short: '7d' },
          { id: 'ai_guide', label: 'AI Guide', short: '🤖' },
        ];
      case 5:
        return [
          { id: 'day_30', label: '30 days', short: '30' },
          { id: 'day_60', label: '60 days', short: '60' },
          { id: 'day_90', label: 'Blueprint', short: '👑' },
        ];
      default:
        return [];
    }
  };

  const milestones = getMilestonesForTier();

  const handleCardClick = () => {
    haptics.light();
    navigate('/insights');
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.medium();

    if (currentTier === 1) {
      navigate('/add');
    } else if (currentTier === 3 && !isMilestoneComplete('first_experiment')) {
      navigate('/insights?tab=experiments');
    } else {
      navigate('/insights');
    }
  };

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
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tierInfo.gradient} backdrop-blur-xl border border-white/40 shadow-xl shadow-sage/10`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleCardClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${tierInfo.accentGradient} opacity-20 blur-3xl`}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 10, 0],
              y: [0, -10, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br ${tierInfo.accentGradient} opacity-15 blur-2xl`}
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -5, 0],
              y: [0, 5, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierInfo.accentGradient} flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <TierIcon className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Your Gut Health Journey</h3>
                <p className="text-xs text-muted-foreground">{tierInfo.name}</p>
              </div>
            </div>

            {/* Tier badge */}
            <motion.div
              className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${tierInfo.accentGradient} text-white text-xs font-bold shadow-md`}
              whileHover={{ scale: 1.05 }}
            >
              Tier {currentTier}
            </motion.div>
          </div>

          {/* Progress Timeline */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              {milestones.map((milestone, index) => {
                const isComplete = isMilestoneComplete(milestone.id);
                const isActive = !isComplete && (index === 0 || isMilestoneComplete(milestones[index - 1]?.id));

                return (
                  <div key={milestone.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <MilestoneCheckmark
                        isComplete={isComplete}
                        isActive={isActive}
                        size="md"
                        color={isComplete ? 'mint' : isActive ? 'sage' : 'lavender'}
                        showGlow={isComplete}
                      />
                      <span className={`text-[10px] mt-1.5 font-medium ${
                        isComplete ? 'text-sage-dark' : isActive ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}>
                        {milestone.short}
                      </span>
                    </div>

                    {index < milestones.length - 1 && (
                      <MilestoneConnector
                        isComplete={isComplete}
                        isActive={isActive}
                        orientation="horizontal"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-white/30 rounded-full overflow-hidden mb-4">
            <motion.div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${tierInfo.accentGradient} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
          </div>

          {/* Current Goal Card */}
          {nextMilestone && (
            <motion.div
              className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎯</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      Current Goal
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
                  className={`ml-3 px-4 py-2 rounded-xl bg-gradient-to-r ${tierInfo.accentGradient} text-white text-xs font-bold shadow-lg flex items-center gap-1`}
                  onClick={handleActionClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentTier === 1 ? 'Log' : 'Go'}
                  <ChevronRight className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Next unlock teaser */}
          {currentTier < 5 && (
            <motion.div
              className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Lock className="w-3 h-3" />
              <span>
                Next: <span className="font-semibold text-foreground">
                  {tierConfig[(currentTier + 1) as keyof typeof tierConfig]?.name || 'Complete'}
                </span>
              </span>
            </motion.div>
          )}

          {/* Completion state */}
          {currentTier === 5 && isMilestoneComplete('day_90') && (
            <motion.div
              className="mt-3 flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Journey Complete! View your Blueprint →
              </span>
            </motion.div>
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
  const { getCurrentTier, getTierProgress, getNextMilestone } = useMilestones();
  const navigate = useNavigate();

  const currentTier = getCurrentTier();
  const progress = getTierProgress(currentTier);
  const tierInfo = tierConfig[currentTier as keyof typeof tierConfig] || tierConfig[1];

  return (
    <motion.button
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tierInfo.gradient} border border-white/40 shadow-md`}
      onClick={() => {
        haptics.light();
        navigate('/insights');
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tierInfo.accentGradient} flex items-center justify-center`}>
        <span className="text-[10px] text-white font-bold">{currentTier}</span>
      </div>
      <div className="h-1.5 w-12 bg-white/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${tierInfo.accentGradient} rounded-full`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-foreground">{Math.round(progress.percentage)}%</span>
    </motion.button>
  );
}
