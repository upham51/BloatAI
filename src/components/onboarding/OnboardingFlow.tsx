import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PrimaryGoal } from '@/types/quiz';
import {
  Camera,
  Map,
  Sparkles,
  BookOpen,
  History,
  ChevronRight,
  Leaf,
} from 'lucide-react';

type OnboardingStep =
  | 'start'
  | 'discover'
  | 'track'
  | 'patterns'
  | 'name'
  | 'goal'
  | 'finish';

const STEPS: OnboardingStep[] = [
  'start',
  'discover',
  'track',
  'patterns',
  'name',
  'goal',
  'finish',
];

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

// Glass card wrapper used throughout onboarding
function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

// Floating background particles
function BackgroundParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#4AEDC4]/30"
          style={{
            left: `${10 + (i * 7.3) % 80}%`,
            top: `${5 + (i * 11.7) % 85}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Icon cards that float around the logo
function FloatingCards({ visible }: { visible: boolean }) {
  const cards = [
    { icon: '🥗', label: 'Meals', x: -80, y: -60 },
    { icon: '📊', label: 'Insights', x: 80, y: -40 },
    { icon: '🧠', label: 'AI', x: -60, y: 60 },
    { icon: '✨', label: 'Patterns', x: 70, y: 50 },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className="absolute"
          style={{ left: '50%', top: '50%' }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
          animate={
            visible
              ? {
                  opacity: 1,
                  x: card.x,
                  y: card.y,
                  scale: 1,
                }
              : { opacity: 0, x: 0, y: 0, scale: 0.3 }
          }
          transition={{
            duration: 0.7,
            delay: i * 0.12,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <GlassCard className="px-3 py-2 flex items-center gap-2">
            <span className="text-lg">{card.icon}</span>
            <span className="text-xs font-medium text-white/70">
              {card.label}
            </span>
          </GlassCard>
        </motion.div>
      ))}
    </>
  );
}

// Continue button anchored to bottom of screen
function ContinueButton({
  onClick,
  disabled = false,
  label = 'Continue',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#4AEDC4] to-[#8BAF9E] text-[#0A1628] active:scale-95"
    >
      {label}
      <ChevronRight className="w-5 h-5" />
    </motion.button>
  );
}

// Step wrapper with consistent layout
function StepContainer({
  children,
  stepKey,
}: {
  children: React.ReactNode;
  stepKey: string;
}) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full px-6 pt-safe-top"
    >
      {children}
    </motion.div>
  );
}

// Feature tile for the bento grid
function FeatureTile({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <GlassCard className="p-4 flex flex-col items-center text-center gap-2 h-full">
        <div className="w-10 h-10 rounded-xl bg-[#4AEDC4]/15 flex items-center justify-center text-[#4AEDC4]">
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-white/50 leading-tight">{desc}</p>
      </GlassCard>
    </motion.div>
  );
}

// Goal selection tile
function GoalTile({
  emoji,
  title,
  desc,
  selected,
  onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 backdrop-blur-xl ${
        selected
          ? 'bg-[#4AEDC4]/15 border-[#4AEDC4]/50'
          : 'bg-white/[0.05] border-white/[0.1] active:bg-white/[0.08]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-base font-semibold ${selected ? 'text-[#4AEDC4]' : 'text-white'}`}
          >
            {title}
          </h4>
          <p className="text-sm text-white/50 mt-0.5">{desc}</p>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-[#4AEDC4] flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <span className="text-[#0A1628] text-sm font-bold">✓</span>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('start');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<PrimaryGoal | ''>('');
  const [showCards, setShowCards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const currentIndex = STEPS.indexOf(step);

  // Auto-advance from start screen after 2.5s
  useEffect(() => {
    if (step === 'start') {
      const cardsTimer = setTimeout(() => setShowCards(true), 800);
      const advanceTimer = setTimeout(() => setStep('discover'), 2800);
      return () => {
        clearTimeout(cardsTimer);
        clearTimeout(advanceTimer);
      };
    }
  }, [step]);

  // Focus name input when entering name step
  useEffect(() => {
    if (step === 'name') {
      const t = setTimeout(() => nameInputRef.current?.focus(), 500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Update user display name
      if (name.trim()) {
        await supabase.auth.updateUser({
          data: { full_name: name.trim() },
        });
      }

      // Update profile with goal and mark onboarding complete
      const { error } = await supabase
        .from('profiles')
        .update({
          primary_goal: goal || 'general-wellness',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: `Welcome, ${name.trim() || 'friend'}!`,
        description: "Let's start tracking your meals.",
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1628] overflow-hidden">
      <BackgroundParticles />

      {/* Progress indicator - hidden on start/finish */}
      {step !== 'start' && step !== 'finish' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 z-10 px-6 pt-4"
        >
          <div className="flex gap-1.5 max-w-xs mx-auto">
            {STEPS.filter((s) => s !== 'start' && s !== 'finish').map(
              (s, i) => {
                const activeIndex = STEPS.filter(
                  (s) => s !== 'start' && s !== 'finish'
                ).indexOf(step);
                return (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= activeIndex
                        ? 'bg-[#4AEDC4]'
                        : 'bg-white/10'
                    }`}
                  />
                );
              }
            )}
          </div>
        </motion.div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        {/* ── STEP: START ── */}
        {step === 'start' && (
          <StepContainer stepKey="start">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4AEDC4] to-[#8BAF9E] flex items-center justify-center shadow-lg">
                  <Leaf className="w-10 h-10 text-[#0A1628]" strokeWidth={2} />
                </div>
                {/* Glow ring */}
                <motion.div
                  className="absolute -inset-4 rounded-[28px] border border-[#4AEDC4]/20"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl font-display font-bold text-white mt-6"
              >
                BloatAI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-sm text-white/50 mt-2 font-body"
              >
                Decode your body's signals
              </motion.p>

              <FloatingCards visible={showCards} />
            </div>
          </StepContainer>
        )}

        {/* ── STEP: DISCOVER ── */}
        {step === 'discover' && (
          <StepContainer stepKey="discover">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mb-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4AEDC4]/20 to-[#8BAF9E]/20 border border-[#4AEDC4]/20 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-[#4AEDC4]" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl font-display font-bold text-white leading-tight mb-4"
              >
                Decode Your{'\n'}Body's Signals
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-base text-white/60 mb-8 max-w-[280px] leading-relaxed font-body"
              >
                AI-powered meal tracking that learns your unique digestive
                patterns
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <GlassCard className="px-4 py-2 inline-flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4AEDC4] animate-pulse" />
                  <span className="text-xs font-medium text-white/70 font-body">
                    Powered by Claude AI
                  </span>
                </GlassCard>
              </motion.div>
            </div>

            <div className="pb-10">
              <ContinueButton onClick={goNext} />
            </div>
          </StepContainer>
        )}

        {/* ── STEP: TRACK ── */}
        {step === 'track' && (
          <StepContainer stepKey="track">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="mb-8"
              >
                <GlassCard className="w-32 h-32 flex flex-col items-center justify-center gap-2">
                  <Camera
                    className="w-12 h-12 text-[#4AEDC4]"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs text-white/50 font-body">
                    10 sec
                  </span>
                </GlassCard>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-2xl font-display font-bold text-white mb-3"
              >
                10-Second Meal Logging
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-base text-white/60 max-w-[300px] leading-relaxed font-body"
              >
                Snap a photo. We analyze ingredients, portions, and potential
                triggers instantly.
              </motion.p>
            </div>

            <div className="pb-10">
              <ContinueButton onClick={goNext} />
            </div>
          </StepContainer>
        )}

        {/* ── STEP: PATTERNS ── */}
        {step === 'patterns' && (
          <StepContainer stepKey="patterns">
            <div className="flex-1 flex flex-col justify-center px-2">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-2xl font-display font-bold text-white text-center mb-8"
              >
                Everything You Need
              </motion.h2>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
                <FeatureTile
                  icon={<Map className="w-5 h-5" />}
                  title="Trigger Map"
                  desc="Identify your personal food triggers"
                  delay={0.2}
                />
                <FeatureTile
                  icon={<Sparkles className="w-5 h-5" />}
                  title="Smart Insights"
                  desc="AI-powered pattern recognition"
                  delay={0.3}
                />
                <FeatureTile
                  icon={<BookOpen className="w-5 h-5" />}
                  title="FODMAP Guide"
                  desc="Built-in food sensitivity reference"
                  delay={0.4}
                />
                <FeatureTile
                  icon={<History className="w-5 h-5" />}
                  title="Meal History"
                  desc="Complete log with trends"
                  delay={0.5}
                />
              </div>
            </div>

            <div className="pb-10">
              <ContinueButton onClick={goNext} />
            </div>
          </StepContainer>
        )}

        {/* ── STEP: NAME ── */}
        {step === 'name' && (
          <StepContainer stepKey="name">
            <div className="flex-1 flex flex-col justify-center px-2">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-3xl font-display font-bold text-white text-center mb-2"
              >
                What should we{'\n'}call you?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-sm text-white/40 text-center mb-10 font-body"
              >
                We'll personalize your experience
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-xs mx-auto w-full"
              >
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) goNext();
                  }}
                  placeholder="Your name"
                  className="w-full bg-transparent text-center text-2xl font-display font-semibold text-white placeholder:text-white/20 border-0 border-b-2 border-white/10 focus:border-[#4AEDC4]/60 focus:outline-none pb-3 transition-colors duration-300"
                  autoComplete="given-name"
                />
                {/* Gradient underline glow */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#4AEDC4]/40 to-transparent mt-[-2px]" />
              </motion.div>
            </div>

            <div className="pb-10">
              <ContinueButton
                onClick={goNext}
                disabled={!name.trim()}
              />
            </div>
          </StepContainer>
        )}

        {/* ── STEP: GOAL ── */}
        {step === 'goal' && (
          <StepContainer stepKey="goal">
            <div className="flex-1 flex flex-col justify-center px-2">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-3xl font-display font-bold text-white text-center mb-2"
              >
                What's your goal?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-sm text-white/40 text-center mb-8 font-body"
              >
                We'll tailor your experience
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-3 max-w-sm mx-auto w-full"
              >
                <GoalTile
                  emoji="🩺"
                  title="Manage IBS"
                  desc="Track symptoms and find relief strategies"
                  selected={goal === 'reduce-symptoms'}
                  onClick={() => setGoal('reduce-symptoms')}
                />
                <GoalTile
                  emoji="🥦"
                  title="FODMAP Sensitivity"
                  desc="Identify trigger foods and safe alternatives"
                  selected={goal === 'identify-triggers'}
                  onClick={() => setGoal('identify-triggers')}
                />
                <GoalTile
                  emoji="🌿"
                  title="General Wellness"
                  desc="Improve overall digestive health"
                  selected={goal === 'general-wellness'}
                  onClick={() => setGoal('general-wellness')}
                />
              </motion.div>
            </div>

            <div className="pb-10">
              <ContinueButton
                onClick={goNext}
                disabled={!goal}
              />
            </div>
          </StepContainer>
        )}

        {/* ── STEP: FINISH ── */}
        {step === 'finish' && (
          <StepContainer stepKey="finish">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
              {/* Celebration glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#4AEDC4]/10 blur-3xl" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="relative mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4AEDC4] to-[#8BAF9E] flex items-center justify-center">
                  <span className="text-3xl">✨</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl font-display font-bold text-white mb-3"
              >
                Welcome, {name.trim() || 'friend'}!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-base text-white/60 max-w-[280px] leading-relaxed font-body mb-4"
              >
                Your personalized digestive wellness journey starts now.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <GlassCard className="px-5 py-3 inline-block">
                  <p className="text-sm text-[#4AEDC4]/80 font-medium font-body">
                    Log 3 meals to unlock your first insights
                  </p>
                </GlassCard>
              </motion.div>
            </div>

            <div className="pb-10">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 disabled:opacity-40 bg-gradient-to-r from-[#4AEDC4] to-[#8BAF9E] text-[#0A1628] active:scale-95"
              >
                {isSubmitting ? 'Setting up...' : 'Begin Tracking'}
              </motion.button>
            </div>
          </StepContainer>
        )}
      </AnimatePresence>
    </div>
  );
}
