import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FileText,
  Crown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Utensils,
  Leaf,
  Ban,
  ThumbsUp,
  Heart,
} from 'lucide-react';
import { useMilestones } from '@/contexts/MilestonesContext';
import { GutHealthBlueprint } from '@/types/milestones';
import { TRIGGER_CATEGORIES } from '@/types';
import { haptics } from '@/lib/haptics';
import { ConfettiMicroAnimation } from '@/components/milestones/ConfettiMicroAnimation';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export function BlueprintTab() {
  const { generateBlueprint, getBlueprint, milestoneState } = useMilestones();

  const [blueprint, setBlueprint] = useState<GutHealthBlueprint | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  // Load existing blueprint
  useEffect(() => {
    const existing = getBlueprint();
    if (existing) {
      setBlueprint(existing);
    }
  }, [getBlueprint]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    haptics.blueprintUnlock();

    // Dramatic pause for premium feel
    await new Promise(resolve => setTimeout(resolve, 3000));

    const result = await generateBlueprint();
    if (result) {
      setBlueprint(result);
      setShowReveal(true);
    }
    setIsGenerating(false);
  };

  // Progress state (before 90 days)
  const currentDay = milestoneState?.tier5.currentDay || 0;
  const isComplete = milestoneState?.tier5.blueprintUnlocked || false;

  // Not yet unlocked state
  if (!isComplete && !blueprint) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Gut Blueprint</h2>
              <p className="text-sm text-muted-foreground">Your complete gut health map</p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <ProgressCard currentDay={currentDay} />
        </StaggerItem>

        <StaggerItem>
          <PreviewCard />
        </StaggerItem>
      </StaggerContainer>
    );
  }

  // Ready to generate state
  if (isComplete && !blueprint && !isGenerating) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Blueprint Ready!</h2>
              <p className="text-sm text-muted-foreground">90 days of data analyzed</p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <GenerateCard onGenerate={handleGenerate} />
        </StaggerItem>
      </StaggerContainer>
    );
  }

  // Generating state
  if (isGenerating) {
    return <GeneratingState />;
  }

  // Reveal animation
  if (showReveal && blueprint) {
    return (
      <RevealAnimation
        blueprint={blueprint}
        onComplete={() => setShowReveal(false)}
      />
    );
  }

  // Blueprint display
  if (blueprint) {
    return <BlueprintDisplay blueprint={blueprint} />;
  }

  return null;
}

function ProgressCard({ currentDay }: { currentDay: number }) {
  const milestones = [
    { day: 30, label: '30 Days', icon: '🌟' },
    { day: 60, label: '60 Days', icon: '💫' },
    { day: 90, label: 'Blueprint', icon: '👑' },
  ];

  const progressPercentage = Math.min((currentDay / 90) * 100, 100);

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100/50 via-yellow-50/30 to-amber-100/50 backdrop-blur-xl border border-amber-200/40 shadow-xl"
    >
      {/* Map visualization */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 200}
              cy={Math.random() * 100}
              r={2 + Math.random() * 4}
              fill="currentColor"
              className="text-amber-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </svg>
      </div>

      <div className="relative p-5">
        <div className="text-center mb-6">
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-3xl">{currentDay < 30 ? '🗺️' : currentDay < 60 ? '🌟' : currentDay < 90 ? '💫' : '👑'}</span>
          </motion.div>
          <h3 className="text-2xl font-bold text-foreground mb-1">
            Day {currentDay} of 90
          </h3>
          <p className="text-muted-foreground text-sm">
            Building your Gut Health Blueprint
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 bg-white/50 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Milestone markers */}
          {milestones.map((milestone) => (
            <div
              key={milestone.day}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center"
              style={{ left: `${(milestone.day / 90) * 100}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span className="text-[8px]">{milestone.icon}</span>
            </div>
          ))}
        </div>

        {/* Milestone labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.day}
              className={`text-center ${currentDay >= milestone.day ? 'text-amber-600 font-semibold' : ''}`}
            >
              {milestone.label}
            </div>
          ))}
        </div>

        {/* Days remaining */}
        <div className="text-center p-3 bg-white/50 rounded-xl">
          <span className="text-amber-600 font-bold">{90 - currentDay} days</span>
          <span className="text-muted-foreground"> until your Blueprint</span>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewCard() {
  const previewItems = [
    { icon: '🎯', title: 'Confirmed Triggers', description: 'Your verified food sensitivities' },
    { icon: '✅', title: 'Safe Foods List', description: 'Foods that work for your gut' },
    { icon: '🍽️', title: 'Personal Food Pyramid', description: 'Your optimal eating guide' },
    { icon: '⏰', title: 'Best Eating Times', description: 'Your circadian rhythm chart' },
    { icon: '📈', title: 'Progress Journey', description: 'Your 90-day improvement story' },
    { icon: '🧬', title: 'Gut Profile Name', description: 'Your unique gut type' },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/40 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-foreground">What You'll Unlock</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {previewItems.map((item, index) => (
          <motion.div
            key={index}
            className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="text-lg mb-1 block">{item.icon}</span>
            <p className="text-xs font-semibold text-foreground">{item.title}</p>
            <p className="text-[10px] text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GenerateCard({ onGenerate }: { onGenerate: () => void }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100/50 via-yellow-50/30 to-amber-100/50 backdrop-blur-xl border border-amber-200/40 shadow-xl p-6 text-center"
    >
      <motion.div
        className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-xl"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Crown className="w-12 h-12 text-white" />
      </motion.div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        Your Blueprint is Ready!
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        90 days of gut health data has been analyzed. Generate your complete personalized blueprint now.
      </p>

      <motion.button
        className="w-full max-w-xs mx-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold shadow-xl flex items-center justify-center gap-2"
        onClick={onGenerate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Sparkles className="w-5 h-5" />
        Generate My Blueprint
      </motion.button>
    </motion.div>
  );
}

function GeneratingState() {
  const messages = [
    'Analyzing 90 days of data...',
    'Identifying confirmed triggers...',
    'Building your food pyramid...',
    'Mapping circadian patterns...',
    'Creating your gut profile...',
    'Finalizing your blueprint...',
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-xl mb-6"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        }}
      >
        <Crown className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        className="h-2 w-56 bg-amber-100 rounded-full overflow-hidden mb-4"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          className="text-muted-foreground"
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
  blueprint,
  onComplete,
}: {
  blueprint: GutHealthBlueprint;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 3500),
      setTimeout(() => onComplete(), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-yellow-50 to-white flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-md w-full text-center">
        {/* Crown reveal */}
        <motion.div
          className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={stage >= 1 ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: "spring", damping: 10 }}
        >
          <Crown className="w-14 h-14 text-white" />
        </motion.div>

        {/* Profile name reveal */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <p className="text-amber-600 font-semibold text-sm uppercase tracking-wide mb-2">
                You are
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {blueprint.gutProfileName}
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {blueprint.gutProfileDescription}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold shadow-lg"
              onClick={onComplete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Full Blueprint
            </motion.button>
          )}
        </AnimatePresence>

        <ConfettiMicroAnimation trigger={stage >= 2} variant="burst" color="gold" intensity="high" />
      </div>
    </motion.div>
  );
}

function BlueprintDisplay({ blueprint }: { blueprint: GutHealthBlueprint }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile']));

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedSections(newSet);
    haptics.light();
  };

  return (
    <StaggerContainer className="space-y-4">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Blueprint</h2>
              <p className="text-xs text-muted-foreground">
                Generated {new Date(blueprint.generatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Profile Card */}
      <StaggerItem>
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100/50 via-yellow-50/30 to-amber-100/50 backdrop-blur-xl border border-amber-200/40 shadow-xl p-5"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🧬</span>
            </div>
            <p className="text-amber-600 font-semibold text-xs uppercase tracking-wide mb-1">
              Your Gut Profile
            </p>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {blueprint.gutProfileName}
            </h3>
            <p className="text-muted-foreground text-sm">
              {blueprint.gutProfileDescription}
            </p>
          </div>
        </motion.div>
      </StaggerItem>

      {/* Triggers Section */}
      <StaggerItem>
        <CollapsibleSection
          title="Confirmed Triggers"
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
          isExpanded={expandedSections.has('triggers')}
          onToggle={() => toggleSection('triggers')}
          badge={`${blueprint.confirmedTriggers.length}`}
          badgeColor="bg-rose-100 text-rose-700"
        >
          <div className="space-y-2">
            {blueprint.confirmedTriggers.map((trigger, index) => {
              const category = TRIGGER_CATEGORIES.find(c => c.id === trigger.category);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <span className="font-medium text-sm">{category?.displayName}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    trigger.severity === 'strong' ? 'bg-rose-200 text-rose-700' :
                    trigger.severity === 'moderate' ? 'bg-orange-200 text-orange-700' :
                    'bg-amber-200 text-amber-700'
                  }`}>
                    {trigger.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      </StaggerItem>

      {/* Safe Foods Section */}
      <StaggerItem>
        <CollapsibleSection
          title="Safe Foods"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          isExpanded={expandedSections.has('safe')}
          onToggle={() => toggleSection('safe')}
          badge={`${blueprint.safeFoods.length}`}
          badgeColor="bg-emerald-100 text-emerald-700"
        >
          <div className="space-y-2">
            {blueprint.safeFoods.map((food, index) => {
              const category = TRIGGER_CATEGORIES.find(c => c.id === food.category);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <span className="font-medium text-sm">{category?.displayName}</span>
                  </div>
                  <span className="text-xs text-emerald-600">
                    {food.avgBloatingScore.toFixed(1)}/5 avg
                  </span>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      </StaggerItem>

      {/* Food Pyramid Section */}
      <StaggerItem>
        <CollapsibleSection
          title="Your Food Pyramid"
          icon={<Utensils className="w-4 h-4 text-amber-500" />}
          isExpanded={expandedSections.has('pyramid')}
          onToggle={() => toggleSection('pyramid')}
        >
          <div className="space-y-3">
            <PyramidLevel
              icon={<Ban className="w-4 h-4" />}
              title="Avoid Completely"
              items={blueprint.foodPyramid.avoidCompletely}
              color="rose"
            />
            <PyramidLevel
              icon={<AlertTriangle className="w-4 h-4" />}
              title="Limit Intake"
              items={blueprint.foodPyramid.limitIntake}
              color="amber"
            />
            <PyramidLevel
              icon={<ThumbsUp className="w-4 h-4" />}
              title="Enjoy Freely"
              items={blueprint.foodPyramid.enjoyFreely}
              color="emerald"
            />
            <PyramidLevel
              icon={<Heart className="w-4 h-4" />}
              title="Healing Foods"
              items={blueprint.foodPyramid.healingFoods}
              color="purple"
            />
          </div>
        </CollapsibleSection>
      </StaggerItem>

      {/* Optimal Times Section */}
      <StaggerItem>
        <CollapsibleSection
          title="Optimal Eating Times"
          icon={<Clock className="w-4 h-4 text-blue-500" />}
          isExpanded={expandedSections.has('times')}
          onToggle={() => toggleSection('times')}
        >
          <div className="space-y-3">
            {Object.entries(blueprint.optimalEatingTimes).map(([meal, data]) => (
              <div key={meal} className="p-3 rounded-xl bg-blue-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm capitalize">{meal}</span>
                  <span className="text-xs text-blue-600 font-medium">
                    {data.start} - {data.end}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{data.note}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </StaggerItem>

      {/* Weekly Patterns Section */}
      <StaggerItem>
        <CollapsibleSection
          title="Weekly Patterns"
          icon={<Calendar className="w-4 h-4 text-purple-500" />}
          isExpanded={expandedSections.has('weekly')}
          onToggle={() => toggleSection('weekly')}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Best Day</p>
              <p className="font-bold text-emerald-600">{blueprint.bestDayOfWeek}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Most Challenging</p>
              <p className="font-bold text-rose-600">{blueprint.worstDayOfWeek}</p>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-purple-50/50 text-center">
            <p className="text-sm">
              {blueprint.weekendVsWeekday === 'better_weekends'
                ? 'Your gut handles weekends better than weekdays'
                : blueprint.weekendVsWeekday === 'better_weekdays'
                  ? 'Your gut prefers weekday eating patterns'
                  : 'Your digestion is consistent throughout the week'}
            </p>
          </div>
        </CollapsibleSection>
      </StaggerItem>

      {/* Progress Journey Section */}
      <StaggerItem>
        <CollapsibleSection
          title="Your Progress Journey"
          icon={<TrendingUp className="w-4 h-4 text-sage" />}
          isExpanded={expandedSections.has('progress')}
          onToggle={() => toggleSection('progress')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Overall Improvement</span>
              <span className="text-lg font-bold text-sage">
                {blueprint.progressJourney.overallImprovement}%
              </span>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Week 1', value: blueprint.progressJourney.week1Avg },
                { label: 'Week 4', value: blueprint.progressJourney.week4Avg },
                { label: 'Week 8', value: blueprint.progressJourney.week8Avg },
                { label: 'Week 12', value: blueprint.progressJourney.week12Avg },
              ].map((week, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">{week.label}</span>
                  <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sage to-mint rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(1 - (week.value - 1) / 4) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8">{week.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      </StaggerItem>
    </StaggerContainer>
  );
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  badge,
  badgeColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-foreground">{title}</span>
          {badge && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PyramidLevel({
  icon,
  title,
  items,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: 'rose' | 'amber' | 'emerald' | 'purple';
}) {
  const colors = {
    rose: 'bg-rose-50/50 text-rose-600',
    amber: 'bg-amber-50/50 text-amber-600',
    emerald: 'bg-emerald-50/50 text-emerald-600',
    purple: 'bg-purple-50/50 text-purple-600',
  };

  if (items.length === 0) return null;

  return (
    <div className={`p-3 rounded-xl ${colors[color].split(' ')[0]}`}>
      <div className={`flex items-center gap-2 mb-2 ${colors[color].split(' ')[1]}`}>
        {icon}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 6).map((item, index) => (
          <span
            key={index}
            className="px-2 py-0.5 bg-white/50 rounded-full text-xs text-foreground"
          >
            {item}
          </span>
        ))}
        {items.length > 6 && (
          <span className="px-2 py-0.5 bg-white/50 rounded-full text-xs text-muted-foreground">
            +{items.length - 6} more
          </span>
        )}
      </div>
    </div>
  );
}
