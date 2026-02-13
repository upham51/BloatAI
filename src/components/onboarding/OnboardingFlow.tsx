import { motion, AnimatePresence, PanInfo, useReducedMotion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PrimaryGoal } from '@/types/quiz';
import type { OnboardingScreen, PexelsPhoto } from '@/lib/pexels';
import {
  getAllOnboardingBackgrounds,
  fetchAllOnboardingBackgrounds,
  preloadImages } from
'@/lib/pexels';
import {
  Camera,
  Map,
  Sparkles,
  BookOpen,
  History,
  ChevronRight,
  ArrowRight } from
'lucide-react';

// ── Types ──

type OnboardingStep =
'discover' |
'track' |
'patterns' |
'name' |
'goal' |
'finish';

const STEPS: OnboardingStep[] = [
'discover',
'track',
'patterns',
'name',
'goal',
'finish'];


interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

// Map steps to Pexels collection screens
const STEP_TO_SCREEN: Record<OnboardingStep, OnboardingScreen | null> = {
  discover: 'hero',
  track: 'camera',
  patterns: 'features',
  name: 'personal',
  goal: 'goals',
  finish: null // Finish uses a glow effect, no background image
};

// ── Color Palette ──

const COLORS = {
  midnight: '#0B1120',
  emerald: '#10B981',
  violet: '#8B5CF6',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  success: '#34D399',
  muted: '#94A3B8',
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.1)'
} as const;

// ── Animation Variants ──

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 }
};

// ── Sub-Components ──

/** Full-bleed background image with Ken Burns zoom effect */
function CinematicBackground({
  photo,
  isActive,
  reducedMotion




}: {photo: PexelsPhoto | null;isActive: boolean;reducedMotion: boolean;}) {
  if (!photo) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true">

      <motion.img
        src={photo.src}
        alt=""
        role="presentation"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1 }}
        animate={
        isActive && !reducedMotion ?
        { scale: [1, 1.1, 1] } :
        { scale: 1 }
        }
        transition={
        isActive && !reducedMotion ?
        {
          scale: {
            duration: 24,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1]
          }
        } :
        undefined
        } />


      {/* Gradient overlay — fades image into midnight at the bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            transparent 30%,
            rgba(11, 17, 32, 0.3) 45%,
            rgba(11, 17, 32, 0.65) 55%,
            rgba(11, 17, 32, 0.88) 65%,
            ${COLORS.midnight} 78%
          )`
        }} />

    </div>);

}

/** Floating background particles with staggered motion */
function BackgroundParticles({ reducedMotion }: {reducedMotion: boolean;}) {
  if (reducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) =>
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${8 + i * 5.7 % 84}%`,
          top: `${10 + i * 9.3 % 80}%`,
          width: i % 3 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 3 : 2,
          background:
          i % 4 === 0 ?
          COLORS.emerald :
          i % 4 === 1 ?
          COLORS.violet :
          `${COLORS.textPrimary}40`
        }}
        animate={{
          y: [0, -(12 + i % 5 * 4), 0],
          opacity: [0.15, 0.45, 0.15]
        }}
        transition={{
          duration: 4 + i % 4,
          repeat: Infinity,
          delay: i * 0.3,
          ease: 'easeInOut'
        }} />

      )}
    </div>);

}

/** Animated progress indicator with expanding active dot */
function ProgressIndicator({
  steps,
  currentIndex



}: {steps: OnboardingStep[];currentIndex: number;}) {
  const visibleSteps = steps.filter((s) => s !== 'finish');
  const activeIndex = visibleSteps.indexOf(steps[currentIndex]);

  return (
    <div
      className="flex gap-2 justify-center items-center"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={visibleSteps.length}
      aria-label={`Step ${currentIndex + 1} of ${visibleSteps.length}`}>

      {visibleSteps.map((_, i) =>
      <motion.div
        key={i}
        className="rounded-full"
        animate={{
          width: i === activeIndex ? 24 : 8,
          height: 8,
          backgroundColor:
          i <= activeIndex ? COLORS.emerald : `${COLORS.textPrimary}20`
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />

      )}
    </div>);

}

/** Glass morphism card wrapper */
function GlassCard({
  children,
  className = '',
  selected = false




}: {children: React.ReactNode;className?: string;selected?: boolean;}) {
  return (
    <div
      className={`backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
      selected ?
      'bg-[#10B981]/10 border-[#10B981]/40' :
      'bg-white/[0.06] border-white/[0.1]'} ${
      className}`}>

      {children}
    </div>);

}

/** Premium CTA button with glow and micro-interactions */
function PrimaryButton({
  onClick,
  disabled = false,
  label = 'Continue',
  reducedMotion





}: {onClick: () => void;disabled?: boolean;label?: string;reducedMotion: boolean;}) {
  return (
    <motion.button
      initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      whileHover={reducedMotion ? undefined : { scale: 1.02, boxShadow: `0 12px 40px ${COLORS.emerald}50` }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-full max-w-xs mx-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-[#10B981] text-white active:bg-[#059669]"
      style={{
        boxShadow: disabled ? 'none' : `0 8px 32px ${COLORS.emerald}30`
      }}>

      {label}
      <ArrowRight className="w-5 h-5" />
    </motion.button>);

}

/** Step container with slide transitions and swipe support */
function StepContainer({
  children,
  stepKey,
  direction,
  onSwipeLeft,
  onSwipeRight,
  reducedMotion







}: {children: React.ReactNode;stepKey: string;direction: number;onSwipeLeft?: () => void;onSwipeRight?: () => void;reducedMotion: boolean;}) {
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && info.velocity.x < 0 && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > threshold && info.velocity.x > 0 && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <motion.div
      key={stepKey}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 80 : -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -80 : 80 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      drag={reducedMotion ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
      className="flex flex-col h-full">

      {children}
    </motion.div>);

}

/** Feature tile for bento grid */
function FeatureTile({
  icon,
  title,
  desc,
  delay,
  reducedMotion






}: {icon: React.ReactNode;title: string;desc: string;delay: number;reducedMotion: boolean;}) {
  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>

      <GlassCard className="p-4 flex flex-col items-center text-center gap-2.5 h-full">
        <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-[#F8FAFC]">{title}</h4>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{desc}</p>
      </GlassCard>
    </motion.div>);

}

/** Goal selection tile with radio-style indicator */
function GoalTile({
  title,
  desc,
  selected,
  onClick,
  reducedMotion






}: {title: string;desc: string;selected: boolean;onClick: () => void;reducedMotion: boolean;}) {
  return (
    <motion.button
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${title}: ${desc}`}
      className="w-full text-left">

      <GlassCard selected={selected} className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h4
              className={`text-base font-semibold tracking-wide ${
              selected ? 'text-[#10B981]' : 'text-[#F8FAFC]'}`
              }>

              {title}
            </h4>
            <p className="text-sm text-[#94A3B8] mt-0.5 leading-relaxed">{desc}</p>
          </div>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            selected ? 'border-[#10B981]' : 'border-[#64748B]'}`
            }>

            {selected &&
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-3 h-3 rounded-full bg-[#10B981]" />

            }
          </div>
        </div>
      </GlassCard>
    </motion.button>);

}

// ── Main Component ──

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('discover');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<PrimaryGoal | ''>('');
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  // Pexels backgrounds: start with sync fallbacks, upgrade async
  const [backgrounds, setBackgrounds] = useState(() => getAllOnboardingBackgrounds());

  useEffect(() => {
    let cancelled = false;
    fetchAllOnboardingBackgrounds().then((photos) => {
      if (!cancelled) {
        setBackgrounds(photos);
        preloadImages(Object.values(photos));
      }
    });
    return () => {cancelled = true;};
  }, []);

  // Preload fallback images on mount
  useEffect(() => {
    preloadImages(Object.values(backgrounds));
    // Only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIndex = STEPS.indexOf(step);

  // Focus name input when entering name step
  useEffect(() => {
    if (step === 'name') {
      const t = setTimeout(() => nameInputRef.current?.focus(), 500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      setDirection(1);
      setStep(STEPS[nextIndex]);
    }
  }, [currentIndex]);

  const goBack = useCallback(() => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setDirection(-1);
      setStep(STEPS[prevIndex]);
    }
  }, [currentIndex]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Update user display name
      if (name.trim()) {
        await supabase.auth.updateUser({
          data: { full_name: name.trim() }
        });
      }

      // Update profile with goal and mark onboarding complete
      const { error } = await supabase.
      from('profiles').
      update({
        primary_goal: goal || 'general-wellness',
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }).
      eq('id', userId);

      if (error) throw error;

      toast({
        title: `Welcome, ${name.trim() || 'friend'}!`,
        description: "Let's start tracking your meals."
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSwipeForward = () => {
    if (step === 'name' && !name.trim()) return false;
    if (step === 'goal' && !goal) return false;
    if (step === 'finish') return false;
    return true;
  };

  const handleSwipeLeft = () => {
    if (canSwipeForward()) goNext();
  };

  const handleSwipeRight = () => {
    goBack();
  };

  // Get background photo for current step
  const currentScreen = STEP_TO_SCREEN[step];
  const currentBackground = currentScreen ? backgrounds[currentScreen] : null;

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: COLORS.midnight }}
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding">

      {/* Mobile-width container — constrains portrait images and centers content */}
      <div className="relative w-full max-w-md h-full overflow-hidden">
        {/* Cinematic background image with Ken Burns */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0">

            <CinematicBackground
              photo={currentBackground}
              isActive={true}
              reducedMotion={reducedMotion} />

          </motion.div>
        </AnimatePresence>

        {/* Particle overlay */}
        <BackgroundParticles reducedMotion={reducedMotion} />

        {/* Progress indicator - hidden on finish */}
        {step !== 'finish' &&
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="absolute top-0 left-0 right-0 z-10 px-6 pt-5">

            <ProgressIndicator steps={STEPS} currentIndex={currentIndex} />
          </motion.div>
        }

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
        {/* ── STEP: DISCOVER (Hero) ── */}
        {step === 'discover' &&
          <StepContainer
            key="discover"
            stepKey="discover"
            direction={direction}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            reducedMotion={reducedMotion}>

            <div className="flex-1" />

            {/* Content anchored to bottom over gradient */}
            <div className="relative z-10 px-6 pb-14 flex flex-col items-center text-center">
              <motion.div
                {...scaleIn}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-6">

                <div className="onboarding-dot-loader" aria-hidden="true" />
              </motion.div>

              <motion.h2
                {...fadeUp}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="text-[32px] font-display font-bold text-[#F8FAFC] leading-[1.2] tracking-[-0.01em] mb-3">

                Decode Your{'\n'}Body's Signals
              </motion.h2>

              <motion.p
                {...fadeUp}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base text-[#CBD5E1] leading-[1.6] tracking-[0.3px] font-body mb-6 max-w-[320px] mx-auto">

                AI-powered meal tracking that learns your unique digestive
                patterns
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="mb-8">

                <GlassCard className="px-4 py-2 inline-flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-[#c3603c]" />
                  <span className="text-xs font-medium text-[#CBD5E1] font-body">Powered by Gemini

                  </span>
                </GlassCard>
              </motion.div>

              <PrimaryButton
                onClick={goNext}
                label="Get Started"
                reducedMotion={reducedMotion} />


              {/* Skip hint */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                onClick={goNext}
                className="w-full text-center mt-4 text-sm text-[#94A3B8] font-body"
                aria-label="Skip onboarding">

                Swipe or tap to continue
              </motion.button>
            </div>
          </StepContainer>
          }

        {/* ── STEP: TRACK (Camera Feature) ── */}
        {step === 'track' &&
          <StepContainer
            key="track"
            stepKey="track"
            direction={direction}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            reducedMotion={reducedMotion}>

            <div className="flex-1" />

            <div className="relative z-10 px-6 pb-14 flex flex-col items-center text-center">
              <motion.div
                {...scaleIn}
                transition={{
                  delay: 0.1,
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className="mb-6">

                <GlassCard className="w-28 h-28 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                  <Camera
                    className="w-10 h-10 text-[#10B981]"
                    strokeWidth={1.5} />

                  {/* Shutter animation ring */}
                  {!reducedMotion &&
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#10B981]/20"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }} />

                  }
                </GlassCard>
              </motion.div>

              <motion.h2
                {...fadeUp}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-[28px] font-display font-bold text-[#F8FAFC] leading-[1.2] tracking-[-0.01em] mb-3">

                10-Second{'\n'}Meal Logging
              </motion.h2>

              <motion.p
                {...fadeUp}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-base text-[#CBD5E1] leading-[1.6] tracking-[0.3px] font-body mb-8 max-w-[320px] mx-auto">

                Snap a photo. We analyze ingredients, portions, and potential
                triggers instantly.
              </motion.p>

              <PrimaryButton
                onClick={goNext}
                reducedMotion={reducedMotion} />

            </div>
          </StepContainer>
          }

        {/* ── STEP: PATTERNS (Value Prop / Features) ── */}
        {step === 'patterns' &&
          <StepContainer
            key="patterns"
            stepKey="patterns"
            direction={direction}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            reducedMotion={reducedMotion}>

            <div className="flex-1" />

            <div className="relative z-10 px-6 pb-14">
              <motion.h2
                {...fadeUp}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-[28px] font-display font-bold text-[#F8FAFC] text-center leading-[1.2] tracking-[-0.01em] mb-2">

                Everything You Need
              </motion.h2>

              <motion.p
                {...fadeUp}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-sm text-[#94A3B8] text-center mb-6 font-body">

                A complete suite of tools for digestive wellness
              </motion.p>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-8">
                <FeatureTile
                  icon={<Map className="w-5 h-5" />}
                  title="Trigger Map"
                  desc="Identify your personal food triggers"
                  delay={0.25}
                  reducedMotion={reducedMotion} />

                <FeatureTile
                  icon={<Sparkles className="w-5 h-5" />}
                  title="Smart Insights"
                  desc="AI-powered pattern recognition"
                  delay={0.35}
                  reducedMotion={reducedMotion} />

                <FeatureTile
                  icon={<BookOpen className="w-5 h-5" />}
                  title="FODMAP Guide"
                  desc="Built-in food sensitivity reference"
                  delay={0.45}
                  reducedMotion={reducedMotion} />

                <FeatureTile
                  icon={<History className="w-5 h-5" />}
                  title="Meal History"
                  desc="Complete log with trends"
                  delay={0.55}
                  reducedMotion={reducedMotion} />

              </div>

              <PrimaryButton
                onClick={goNext}
                reducedMotion={reducedMotion} />

            </div>
          </StepContainer>
          }

        {/* ── STEP: NAME (Personalization) ── */}
        {step === 'name' &&
          <StepContainer
            key="name"
            stepKey="name"
            direction={direction}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            reducedMotion={reducedMotion}>

            <div className="flex-1" />

            <div className="relative z-10 px-6 pb-14 flex flex-col items-center text-center">
              <motion.h2
                {...fadeUp}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-[32px] font-display font-bold text-[#F8FAFC] leading-[1.2] tracking-[-0.01em] mb-2">

                What should we{'\n'}call you?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-sm text-[#94A3B8] mb-10 font-body">

                We'll personalize your experience
              </motion.p>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-xs w-full mb-8">

                <GlassCard className="px-5 py-4">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim()) goNext();
                    }}
                    placeholder="Your name"
                    aria-label="Your name"
                    autoComplete="given-name"
                    className="w-full bg-transparent text-lg font-display font-semibold text-[#F8FAFC] placeholder:text-[#64748B] border-0 focus:outline-none tracking-wide" />

                </GlassCard>
                {/* Accent underline */}
                <motion.div
                  className="h-[2px] mt-0.5 rounded-full"
                  animate={{
                    background: name.trim() ?
                    `linear-gradient(to right, ${COLORS.emerald}, ${COLORS.violet})` :
                    `linear-gradient(to right, transparent, ${COLORS.emerald}20, transparent)`
                  }}
                  transition={{ duration: 0.3 }} />

              </motion.div>

              <PrimaryButton
                onClick={goNext}
                disabled={!name.trim()}
                reducedMotion={reducedMotion} />

            </div>
          </StepContainer>
          }

        {/* ── STEP: GOAL (Goal Setting) ── */}
        {step === 'goal' &&
          <StepContainer
            key="goal"
            stepKey="goal"
            direction={direction}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            reducedMotion={reducedMotion}>

            <div className="flex-1" />

            <div className="relative z-10 px-6 pb-14 flex flex-col items-center text-center">
              <motion.h2
                {...fadeUp}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-[32px] font-display font-bold text-[#F8FAFC] leading-[1.2] tracking-[-0.01em] mb-2">

                What's your goal?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-sm text-[#94A3B8] mb-6 font-body">

                We'll tailor your experience
              </motion.p>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-3 max-w-sm w-full mb-8">

                <GoalTile
                  title="Manage IBS"
                  desc="Track symptoms and find relief strategies"
                  selected={goal === 'reduce-symptoms'}
                  onClick={() => setGoal('reduce-symptoms')}
                  reducedMotion={reducedMotion} />

                <GoalTile
                  title="FODMAP Sensitivity"
                  desc="Identify trigger foods and safe alternatives"
                  selected={goal === 'identify-triggers'}
                  onClick={() => setGoal('identify-triggers')}
                  reducedMotion={reducedMotion} />

                <GoalTile
                  title="General Wellness"
                  desc="Improve overall digestive health"
                  selected={goal === 'general-wellness'}
                  onClick={() => setGoal('general-wellness')}
                  reducedMotion={reducedMotion} />

              </motion.div>

              <PrimaryButton
                onClick={goNext}
                disabled={!goal}
                label="Continue"
                reducedMotion={reducedMotion} />

            </div>
          </StepContainer>
          }

        {/* ── STEP: FINISH (Celebration) ── */}
        {step === 'finish' &&
          <StepContainer
            key="finish"
            stepKey="finish"
            direction={direction}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            reducedMotion={reducedMotion}>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              {/* Celebration glow backdrop */}
              {!reducedMotion &&
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                aria-hidden="true">

                  <div
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl"
                  style={{
                    background: `radial-gradient(circle, ${COLORS.emerald}20 0%, ${COLORS.violet}10 50%, transparent 70%)`
                  }} />

                </motion.div>
              }

              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className="relative mb-6">

                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#8B5CF6] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                {!reducedMotion &&
                <motion.div
                  className="absolute -inset-3 rounded-full border border-[#10B981]/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }} />

                }
              </motion.div>

              <motion.h2
                {...fadeUp}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-[32px] font-display font-bold text-[#F8FAFC] leading-[1.2] tracking-[-0.01em] mb-3">

                Welcome, {name.trim() || 'friend'}!
              </motion.h2>

              <motion.p
                {...fadeUp}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-base text-[#CBD5E1] max-w-[300px] leading-[1.6] font-body mb-6">

                Your personalized digestive wellness journey starts now.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-8">

                <GlassCard className="px-5 py-3 inline-block">
                  <p className="text-sm text-[#34D399] font-medium font-body">
                    Log 3 meals to unlock your first insights
                  </p>
                </GlassCard>
              </motion.div>
            </div>

            <div className="relative z-10 px-6 pb-14">
              <motion.button
                initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onClick={handleFinish}
                disabled={isSubmitting}
                aria-label={isSubmitting ? 'Setting up your account' : 'Begin Tracking'}
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base transition-colors duration-200 disabled:opacity-40 text-white active:bg-[#059669]"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.violet})`,
                  boxShadow: `0 8px 32px ${COLORS.emerald}30`
                }}>

                {isSubmitting ? 'Setting up...' : 'Begin Tracking'}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </div>
          </StepContainer>
          }
      </AnimatePresence>
      </div>
    </div>);

}