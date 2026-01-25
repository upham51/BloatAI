import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Save,
  Share2,
  Heart,
} from 'lucide-react';
import { useMilestones } from '@/contexts/MilestonesContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIGuideConsultation } from '@/types/milestones';
import { haptics } from '@/lib/haptics';
import { ConfettiMicroAnimation } from '@/components/milestones/ConfettiMicroAnimation';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export function AIGuideTab() {
  const { user } = useAuth();
  const { generateAIGuide, getAIGuideConsultation, milestoneState } = useMilestones();

  const [consultation, setConsultation] = useState<AIGuideConsultation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  // Load existing consultation
  useEffect(() => {
    const existing = getAIGuideConsultation();
    if (existing) {
      setConsultation(existing);
      setHasRevealed(true);
    }
  }, [getAIGuideConsultation]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    haptics.aiGuideReveal();

    // Simulate AI thinking time for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await generateAIGuide();
    if (result) {
      setConsultation(result);
      setShowReveal(true);
    }
    setIsGenerating(false);
  };

  const handleRevealComplete = () => {
    setShowReveal(false);
    setHasRevealed(true);
  };

  const firstName = user?.email?.split('@')[0] || 'there';

  // Not yet generated state
  if (!consultation && !isGenerating) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Guide</h2>
              <p className="text-sm text-muted-foreground">Your personal gut health consultant</p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <GenerateCard onGenerate={handleGenerate} firstName={firstName} />
        </StaggerItem>
      </StaggerContainer>
    );
  }

  // Generating state
  if (isGenerating) {
    return <GeneratingState />;
  }

  // Reveal animation
  if (showReveal && consultation) {
    return (
      <RevealAnimation
        consultation={consultation}
        firstName={firstName}
        onComplete={handleRevealComplete}
      />
    );
  }

  // Consultation display
  if (consultation) {
    return (
      <ConsultationDisplay
        consultation={consultation}
        firstName={firstName}
      />
    );
  }

  return null;
}

function GenerateCard({ onGenerate, firstName }: { onGenerate: () => void; firstName: string }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100/50 via-pink-50/30 to-rose-100/50 backdrop-blur-xl border border-rose-200/40 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative p-6 text-center">
        {/* AI Avatar */}
        <motion.div
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-xl"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Bot className="w-12 h-12 text-white" />
        </motion.div>

        <h3 className="text-xl font-bold text-foreground mb-2">
          Hello, {firstName}!
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Based on your 7-day journey, I'm ready to provide your personalized gut health consultation.
        </p>

        <motion.button
          className="w-full max-w-xs mx-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold shadow-xl flex items-center justify-center gap-2"
          onClick={onGenerate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-5 h-5" />
          Generate My Consultation
        </motion.button>
      </div>
    </motion.div>
  );
}

function GeneratingState() {
  const messages = [
    'Analyzing your meal patterns...',
    'Identifying trigger correlations...',
    'Examining time-of-day patterns...',
    'Formulating recommendations...',
    'Preparing your consultation...',
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-xl mb-6"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Bot className="w-10 h-10 text-white" />
      </motion.div>

      <motion.div
        className="h-1 w-48 bg-rose-100 rounded-full overflow-hidden mb-4"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          className="text-muted-foreground text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {messages[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function RevealAnimation({
  consultation,
  firstName,
  onComplete,
}: {
  consultation: AIGuideConsultation;
  firstName: string;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 3000),
      setTimeout(() => onComplete(), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-md w-full text-center">
        {/* Stage 0-1: Avatar reveal */}
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={stage >= 1 ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: "spring", damping: 12 }}
        >
          <Bot className="w-12 h-12 text-white" />
        </motion.div>

        {/* Stage 2: Greeting */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <TypewriterText text={`Hello, ${firstName}!`} className="text-2xl font-bold text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 3: Message */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-muted-foreground mb-6">
                Your personalized gut health consultation is ready.
              </p>
              <motion.button
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold shadow-lg"
                onClick={onComplete}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Consultation
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfettiMicroAnimation trigger={stage >= 2} variant="burst" color="celebration" intensity="medium" />
      </div>
    </motion.div>
  );
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
}

function ConsultationDisplay({
  consultation,
  firstName,
}: {
  consultation: AIGuideConsultation;
  firstName: string;
}) {
  return (
    <StaggerContainer className="space-y-6">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Your AI Guide</h2>
            <p className="text-xs text-muted-foreground">
              Generated {new Date(consultation.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* Greeting Card */}
      <StaggerItem>
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100/50 via-pink-50/30 to-rose-100/50 backdrop-blur-xl border border-rose-200/40 shadow-xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground mb-2">
                Hello, {firstName}!
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {consultation.analysis}
              </p>
            </div>
          </div>
        </motion.div>
      </StaggerItem>

      {/* Action Plan */}
      <StaggerItem>
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/40 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-foreground">Your Action Plan</h3>
          </div>

          <div className="space-y-3">
            <ActionItem
              number={1}
              text={consultation.actionPlan.recommendation1}
            />
            <ActionItem
              number={2}
              text={consultation.actionPlan.recommendation2}
            />
          </div>
        </div>
      </StaggerItem>

      {/* Behavioral Changes */}
      <StaggerItem>
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/40 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-foreground">Lifestyle Tips</h3>
          </div>

          <div className="space-y-2">
            {consultation.actionPlan.behavioralChanges.map((change, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{change}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </StaggerItem>

      {/* Insights Summary */}
      <StaggerItem>
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/40 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-foreground">Key Insights</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InsightBadge
              icon={<Clock className="w-4 h-4" />}
              label="Best Time"
              value={consultation.personalizedInsights.optimalEatingTime}
            />
            <InsightBadge
              icon={<Target className="w-4 h-4" />}
              label="Pattern"
              value={consultation.personalizedInsights.sensitivityPattern.split(' ')[0]}
            />
          </div>

          {consultation.personalizedInsights.confirmedTriggers.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50/50">
              <p className="text-xs font-semibold text-rose-600 mb-2">Confirmed Triggers:</p>
              <div className="flex flex-wrap gap-2">
                {consultation.personalizedInsights.confirmedTriggers.map((trigger, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-medium"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}

function ActionItem({ number, text }: { number: number; text: string }) {
  return (
    <motion.div
      className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: number * 0.1 }}
    >
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-white">{number}</span>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </motion.div>
  );
}

function InsightBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
      <div className="flex items-center gap-2 text-amber-600 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground capitalize">{value}</p>
    </div>
  );
}
