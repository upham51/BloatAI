import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Clock,
  TrendingDown,
  TrendingUp,
  Minus,
  Beaker,
  Target,
  Lightbulb,
} from 'lucide-react';
import { useMilestones } from '@/contexts/MilestonesContext';
import { useMeals } from '@/contexts/MealContext';
import { TRIGGER_CATEGORIES } from '@/types';
import { Experiment, ExperimentResult } from '@/types/milestones';
import { haptics } from '@/lib/haptics';
import { ConfettiMicroAnimation } from '@/components/milestones/ConfettiMicroAnimation';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export function ExperimentsTab() {
  const {
    getCurrentExperiment,
    getCompletedExperiments,
    getSuggestedExperiment,
    startExperiment,
    cancelExperiment,
  } = useMilestones();
  const navigate = useNavigate();

  const currentExperiment = getCurrentExperiment();
  const completedExperiments = getCompletedExperiments();
  const suggestedExperiment = getSuggestedExperiment();

  const [showStartModal, setShowStartModal] = useState(false);

  const handleStartExperiment = () => {
    if (suggestedExperiment) {
      haptics.experimentStart();
      startExperiment(
        suggestedExperiment.category,
        suggestedExperiment.name,
        suggestedExperiment.hypothesis
      );
      setShowStartModal(false);
    }
  };

  return (
    <StaggerContainer className="space-y-6">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Experiments</h2>
            <p className="text-sm text-muted-foreground">Test and confirm your triggers</p>
          </div>
        </div>
      </StaggerItem>

      {/* Active Experiment */}
      {currentExperiment ? (
        <StaggerItem>
          <ActiveExperimentCard
            experiment={currentExperiment}
            onCancel={cancelExperiment}
          />
        </StaggerItem>
      ) : (
        <StaggerItem>
          {/* Suggested Experiment */}
          {suggestedExperiment ? (
            <SuggestedExperimentCard
              suggestion={suggestedExperiment}
              onStart={() => setShowStartModal(true)}
            />
          ) : (
            <NoExperimentCard />
          )}
        </StaggerItem>
      )}

      {/* How It Works (if no experiments yet) */}
      {completedExperiments.length === 0 && !currentExperiment && (
        <StaggerItem>
          <HowItWorksCard />
        </StaggerItem>
      )}

      {/* Completed Experiments */}
      {completedExperiments.length > 0 && (
        <StaggerItem>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Completed Experiments ({completedExperiments.length})
            </h3>
            <div className="space-y-3">
              {completedExperiments.map((experiment, index) => (
                <CompletedExperimentCard key={experiment.id} experiment={experiment} index={index} />
              ))}
            </div>
          </div>
        </StaggerItem>
      )}

      {/* Start Experiment Modal */}
      <AnimatePresence>
        {showStartModal && suggestedExperiment && (
          <StartExperimentModal
            suggestion={suggestedExperiment}
            onStart={handleStartExperiment}
            onClose={() => setShowStartModal(false)}
          />
        )}
      </AnimatePresence>
    </StaggerContainer>
  );
}

function ActiveExperimentCard({
  experiment,
  onCancel,
}: {
  experiment: Experiment;
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const startTime = new Date(experiment.startedAt);
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60 / 60);

  const category = TRIGGER_CATEGORIES.find(c => c.id === experiment.triggerCategory);

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100/50 via-violet-50/30 to-purple-100/50 backdrop-blur-xl border border-purple-200/40 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative p-5">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-300/40"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-purple-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-semibold text-purple-700">Active Experiment</span>
          </motion.div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{elapsed}h elapsed</span>
          </div>
        </div>

        {/* Experiment details */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground mb-1">
            The {experiment.triggerName} Detective
          </h3>
          <p className="text-sm text-muted-foreground">
            {experiment.hypothesis}
          </p>
        </div>

        {/* Control data */}
        {experiment.bloatingWithTrigger !== null && (
          <div className="bg-white/50 rounded-2xl p-4 mb-4 border border-white/40">
            <p className="text-xs text-muted-foreground mb-2">Your baseline with {experiment.triggerName}:</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">
                {experiment.bloatingWithTrigger.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/5 avg bloating</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <motion.button
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 text-white font-semibold shadow-lg flex items-center justify-center gap-2"
            onClick={() => {
              haptics.medium();
              navigate('/add-entry', {
                state: {
                  isExperimentMeal: true,
                  experimentTriggerCategory: experiment.triggerCategory,
                  experimentTriggerName: experiment.triggerName
                }
              });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Beaker className="w-4 h-4" />
            Log Experiment Meal
          </motion.button>

          <motion.button
            className="py-3 px-4 rounded-xl bg-muted/20 text-muted-foreground font-medium border border-muted/30"
            onClick={() => {
              haptics.light();
              onCancel();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SuggestedExperimentCard({
  suggestion,
  onStart,
}: {
  suggestion: { category: string; name: string; hypothesis: string };
  onStart: () => void;
}) {
  const category = TRIGGER_CATEGORIES.find(c => c.id === suggestion.category);

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100/40 via-white/60 to-violet-100/40 backdrop-blur-xl border border-purple-200/40 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: category?.color + '20' }}
            >
              <Target className="w-6 h-6" style={{ color: category?.color }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Suggested</p>
              <h3 className="text-lg font-bold text-foreground">Test {suggestion.name}</h3>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Based on your meal data, <strong>{suggestion.name}</strong> appears frequently when you report higher bloating.
          Test it to confirm.
        </p>

        <motion.button
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 text-white font-semibold shadow-lg flex items-center justify-center gap-2"
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-4 h-4" />
          Start Experiment
        </motion.button>
      </div>
    </motion.div>
  );
}

function NoExperimentCard() {
  return (
    <div className="text-center py-8 px-4 bg-muted/10 rounded-3xl border border-muted/20">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
        <FlaskConical className="w-8 h-8 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No Experiments Yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Continue logging meals to help us identify potential triggers for your experiments.
      </p>
    </div>
  );
}

function HowItWorksCard() {
  const steps = [
    {
      icon: '🔍',
      title: 'Identify',
      description: 'We analyze your meals to find suspected triggers',
    },
    {
      icon: '🧪',
      title: 'Test',
      description: 'Eat a meal without the suspected trigger',
    },
    {
      icon: '📊',
      title: 'Confirm',
      description: 'Compare your bloating to establish causation',
    },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-5 border border-white/40">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-foreground">How Experiments Work</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">{step.icon}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CompletedExperimentCard({ experiment, index }: { experiment: Experiment; index: number }) {
  const getResultIcon = (result: ExperimentResult) => {
    switch (result) {
      case 'trigger_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-rose-500" />;
      case 'trigger_cleared':
        return <XCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getResultColor = (result: ExperimentResult) => {
    switch (result) {
      case 'trigger_confirmed':
        return 'from-rose-100/50 to-red-100/50 border-rose-200/40';
      case 'trigger_cleared':
        return 'from-emerald-100/50 to-green-100/50 border-emerald-200/40';
      default:
        return 'from-amber-100/50 to-yellow-100/50 border-amber-200/40';
    }
  };

  const getResultLabel = (result: ExperimentResult) => {
    switch (result) {
      case 'trigger_confirmed':
        return 'Trigger Confirmed';
      case 'trigger_cleared':
        return 'Trigger Cleared';
      default:
        return 'Inconclusive';
    }
  };

  const getTrendIcon = () => {
    if (experiment.percentageChange === null) return <Minus className="w-4 h-4" />;
    if (experiment.percentageChange > 0) return <TrendingDown className="w-4 h-4 text-emerald-500" />;
    if (experiment.percentageChange < 0) return <TrendingUp className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };

  return (
    <motion.div
      className={`rounded-2xl bg-gradient-to-br ${getResultColor(experiment.result)} backdrop-blur-sm p-4 border`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getResultIcon(experiment.result)}
          <span className="font-semibold text-foreground">{experiment.triggerName}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(experiment.completedAt || '').toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{experiment.resultExplanation}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/50">
          {getResultLabel(experiment.result)}
        </span>

        {experiment.percentageChange !== null && (
          <div className="flex items-center gap-1 text-xs">
            {getTrendIcon()}
            <span className="font-medium">
              {Math.abs(Math.round(experiment.percentageChange))}% change
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StartExperimentModal({
  suggestion,
  onStart,
  onClose,
}: {
  suggestion: { category: string; name: string; hypothesis: string };
  onStart: () => void;
  onClose: () => void;
}) {
  const category = TRIGGER_CATEGORIES.find(c => c.id === suggestion.category);

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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-400 to-violet-500 p-6 text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <FlaskConical className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-1">Start Experiment</h3>
          <p className="text-purple-100 text-sm">Test your suspected trigger</p>
        </div>

        <div className="p-6">
          {/* Trigger info */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-4"
            style={{ backgroundColor: category?.color + '15' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: category?.color + '30' }}
            >
              <Target className="w-5 h-5" style={{ color: category?.color }} />
            </div>
            <div>
              <p className="font-bold text-foreground">{suggestion.name}</p>
              <p className="text-xs text-muted-foreground">{category?.examples}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <p className="text-sm text-foreground font-medium">Your mission:</p>
            <p className="text-sm text-muted-foreground">{suggestion.hypothesis}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 text-white font-semibold shadow-lg"
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Now
            </motion.button>
            <motion.button
              className="py-3 px-4 rounded-xl bg-muted/20 text-muted-foreground font-medium"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Later
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
