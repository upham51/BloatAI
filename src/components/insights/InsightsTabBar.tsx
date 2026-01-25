import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ChevronRight, BarChart3, FlaskConical, Bot, FileText } from 'lucide-react';
import { useState } from 'react';
import { useMilestones } from '@/contexts/MilestonesContext';
import { InsightTab, INSIGHT_TABS } from '@/types/milestones';
import { haptics } from '@/lib/haptics';

interface InsightsTabBarProps {
  activeTab: InsightTab;
  onTabChange: (tab: InsightTab) => void;
}

const tabIcons = {
  analysis: BarChart3,
  experiments: FlaskConical,
  ai_guide: Bot,
  blueprint: FileText,
};

const tabColors = {
  analysis: {
    active: 'from-sage to-mint',
    bg: 'bg-sage/10',
    text: 'text-sage-dark',
  },
  experiments: {
    active: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-100/50',
    text: 'text-purple-600',
  },
  ai_guide: {
    active: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-100/50',
    text: 'text-rose-600',
  },
  blueprint: {
    active: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-100/50',
    text: 'text-amber-600',
  },
};

export function InsightsTabBar({ activeTab, onTabChange }: InsightsTabBarProps) {
  const { isTabUnlocked, getTabUnlockProgress } = useMilestones();
  const [showLockedModal, setShowLockedModal] = useState<InsightTab | null>(null);

  const handleTabClick = (tabId: InsightTab) => {
    if (isTabUnlocked(tabId)) {
      haptics.medium();
      onTabChange(tabId);
    } else {
      haptics.lockedTap();
      setShowLockedModal(tabId);
    }
  };

  return (
    <>
      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg mb-6">
        {INSIGHT_TABS.map((tab) => {
          const isUnlocked = isTabUnlocked(tab.id);
          const isActive = activeTab === tab.id;
          const Icon = tabIcons[tab.id];
          const colors = tabColors[tab.id];
          const progress = getTabUnlockProgress(tab.id);

          return (
            <motion.button
              key={tab.id}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl transition-colors ${
                isActive
                  ? `bg-gradient-to-r ${colors.active} text-white shadow-md`
                  : isUnlocked
                    ? `${colors.bg} ${colors.text} hover:bg-white/50`
                    : 'bg-muted/20 text-muted-foreground/50'
              }`}
              onClick={() => handleTabClick(tab.id)}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {!isUnlocked && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-muted-foreground/40 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Lock className="w-2 h-2 text-white" />
                  </motion.div>
                )}
              </div>
              <span className="text-[10px] font-semibold truncate max-w-full">
                {tab.title}
              </span>

              {/* Progress indicator for locked tabs */}
              {!isUnlocked && progress.percentage > 0 && (
                <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${colors.active} opacity-60`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                  />
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Locked Tab Modal */}
      <AnimatePresence>
        {showLockedModal && (
          <LockedTabModal
            tabId={showLockedModal}
            onClose={() => setShowLockedModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function LockedTabModal({ tabId, onClose }: { tabId: InsightTab; onClose: () => void }) {
  const { getTabUnlockProgress } = useMilestones();
  const tab = INSIGHT_TABS.find(t => t.id === tabId);
  const progress = getTabUnlockProgress(tabId);
  const Icon = tabIcons[tabId];
  const colors = tabColors[tabId];

  if (!tab) return null;

  const getUnlockSteps = () => {
    switch (tabId) {
      case 'analysis':
        return [
          { done: progress.current >= 1, text: 'Log your first meal' },
          { done: progress.current >= 2, text: 'Rate your first meal' },
          { done: progress.current >= 3, text: 'Log and rate 3 meals total' },
        ];
      case 'experiments':
        return [
          { done: progress.current >= 1, text: 'Complete Day 1 of tracking' },
          { done: progress.current >= 2, text: 'Complete Day 2 of tracking' },
          { done: progress.current >= 3, text: 'Complete your 72-hour streak' },
        ];
      case 'ai_guide':
        return [
          { done: progress.current >= 3, text: 'Track for 3 days' },
          { done: progress.current >= 5, text: 'Track for 5 days' },
          { done: progress.current >= 7, text: 'Complete your 7-day baseline' },
        ];
      case 'blueprint':
        return [
          { done: progress.current >= 30, text: 'Reach 30-day milestone' },
          { done: progress.current >= 60, text: 'Reach 60-day milestone' },
          { done: progress.current >= 90, text: 'Complete 90 days of tracking' },
        ];
      default:
        return [];
    }
  };

  const steps = getUnlockSteps();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient header */}
        <div className={`h-24 bg-gradient-to-br ${colors.active} relative overflow-hidden`}>
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.active} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </div>

        <div className="p-6 pt-10">
          {/* Lock icon */}
          <div className="flex justify-center mb-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-center text-foreground mb-2">
            {tab.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-center text-muted-foreground mb-6">
            {tab.description}
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span className="font-semibold">{Math.round(progress.percentage)}%</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colors.active}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              How to unlock:
            </p>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  step.done ? 'bg-sage/10' : 'bg-muted/10'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  step.done
                    ? 'bg-gradient-to-br from-sage to-mint'
                    : 'bg-muted/30'
                }`}>
                  {step.done ? (
                    <motion.svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className={`text-sm ${step.done ? 'text-sage-dark font-medium' : 'text-muted-foreground'}`}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${colors.active} text-white font-semibold shadow-lg flex items-center justify-center gap-2`}
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue Logging
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
