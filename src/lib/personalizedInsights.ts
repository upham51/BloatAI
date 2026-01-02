import type { Profile } from '@/types';
import type { RootCauseAssessment } from '@/types/quiz';
import type { MealEntry } from '@/types';

/**
 * Personalized Insights Generator
 *
 * This acts like a wise nutritionist with 60 years of experience,
 * explaining bloating causes and solutions in simple 8th-grade language.
 */

// ============================================================
// MAIN INSIGHTS GENERATOR
// ============================================================

export interface PersonalizedInsight {
  greeting: string;
  mainMessage: string;
  rootCauseExplanation: string;
  foodAdvice: string[];
  lifestyleAdvice: string[];
  progressNote: string | null;
  medicationNote: string | null;
  encouragement: string;
}

export function generatePersonalizedInsights(
  profile: Profile | null,
  assessment: RootCauseAssessment | null,
  mealEntries: MealEntry[]
): PersonalizedInsight | null {
  // Need at least profile or assessment to generate insights
  if (!profile && !assessment) return null;

  const greeting = generateGreeting(profile);
  const mainMessage = generateMainMessage(profile, assessment, mealEntries);
  const rootCauseExplanation = generateRootCauseExplanation(assessment, profile);
  const foodAdvice = generateFoodAdvice(assessment, mealEntries, profile);
  const lifestyleAdvice = generateLifestyleAdvice(assessment, profile);
  const progressNote = generateProgressNote(profile, mealEntries);
  const medicationNote = generateMedicationNote(profile);
  const encouragement = generateEncouragement(profile, assessment);

  return {
    greeting,
    mainMessage,
    rootCauseExplanation,
    foodAdvice,
    lifestyleAdvice,
    progressNote,
    medicationNote,
    encouragement,
  };
}

// ============================================================
// GREETING BASED ON PROFILE
// ============================================================

function generateGreeting(profile: Profile | null): string {
  if (!profile) return "Hey there! Let's figure out what's going on with your tummy.";

  const goal = profile.primary_goal;

  if (goal === 'find-triggers') {
    return "Great news! I've been studying your eating patterns, and I found some clues about what might be bothering you.";
  } else if (goal === 'track-patterns') {
    return "I've been tracking your patterns, and here's what I'm seeing.";
  } else if (goal === 'manage-symptoms') {
    return "Let's talk about managing your bloating. I have some ideas that might help.";
  } else {
    return "I've analyzed your data, and I want to share what I've learned.";
  }
}

// ============================================================
// MAIN MESSAGE - The "WHY"
// ============================================================

function generateMainMessage(
  profile: Profile | null,
  assessment: RootCauseAssessment | null,
  mealEntries: MealEntry[]
): string {
  const bloatingFrequency = profile?.bloating_frequency;
  const hasQuiz = !!assessment;
  const hasMeals = mealEntries.length > 0;

  // If they bloat daily and we have quiz data
  if (bloatingFrequency === 'daily' && hasQuiz) {
    return "Since you're dealing with bloating every day, the good news is that means we have lots of opportunities to figure out the pattern and fix it!";
  }

  // If they bloat frequently
  if ((bloatingFrequency === 'daily' || bloatingFrequency === 'few-times-week') && hasMeals) {
    const highBloatCount = mealEntries.filter(m => m.bloating_rating && m.bloating_rating >= 4).length;
    if (highBloatCount > 0) {
      return `You've had ${highBloatCount} rough meal${highBloatCount > 1 ? 's' : ''} recently. Let's figure out what those meals had in common so we can avoid it.`;
    }
  }

  // If they have assessment data
  if (hasQuiz && assessment) {
    const riskLevel = assessment.risk_level;
    if (riskLevel === 'High' || riskLevel === 'Severe') {
      return "Your quiz results show there are a few different things contributing to your bloating. Don't worry—we can tackle them one at a time.";
    } else if (riskLevel === 'Moderate') {
      return "The good news is your quiz shows nothing too concerning. A few simple changes should make a big difference!";
    } else {
      return "Your quiz results look pretty good! It seems like your bloating might be coming from specific foods rather than bigger health issues.";
    }
  }

  return "Based on what you've shared, let me help you understand what's happening and what you can do about it.";
}

// ============================================================
// ROOT CAUSE EXPLANATION - In Simple Terms
// ============================================================

function generateRootCauseExplanation(
  assessment: RootCauseAssessment | null,
  profile: Profile | null
): string {
  if (!assessment) {
    return "Take the Root Cause Quiz to get a personalized explanation of WHY you're bloating. It's like getting an x-ray of your digestive system!";
  }

  // Get top 2 contributing causes
  const causes = [
    { name: 'Aerophagia (Swallowing Air)', score: assessment.aerophagia_score, max: 10 },
    { name: 'Gut Motility (Food Movement)', score: assessment.motility_score, max: 11 },
    { name: 'Gut Bacteria Balance', score: assessment.dysbiosis_score, max: 11 },
    { name: 'Stress & Mind-Gut Connection', score: assessment.brain_gut_score, max: 14 },
    { name: 'Hormones', score: assessment.hormonal_score, max: 6 },
    { name: 'Medical/Structural Issues', score: assessment.structural_score, max: 10 },
    { name: 'Lifestyle & Posture', score: assessment.lifestyle_score, max: 6 },
  ]
    .map(c => ({ ...c, percentage: (c.score / c.max) * 100 }))
    .sort((a, b) => b.percentage - a.percentage);

  const topCause = causes[0];
  const secondCause = causes[1];

  let explanation = '';

  // Explain the #1 cause in simple terms
  if (topCause.name === 'Aerophagia (Swallowing Air)') {
    explanation = "Think of your belly like a balloon. When you eat too fast, talk while eating, or drink carbonated drinks, you're blowing air into that balloon. That's why you feel puffy! ";
  } else if (topCause.name === 'Gut Motility (Food Movement)') {
    explanation = "Imagine your gut is like a highway for food. Right now, there's a traffic jam—food is moving through too slowly. When food sits around, it ferments and creates gas, like leaving fruit out too long. ";
  } else if (topCause.name === 'Gut Bacteria Balance') {
    explanation = "Your gut has trillions of tiny bacteria (the good guys!) that help digest food. Think of them like a garden—when the garden gets overgrown with weeds, things don't work right. Your gut bacteria might be out of balance. ";
  } else if (topCause.name === 'Stress & Mind-Gut Connection') {
    explanation = "Here's something cool: your gut and brain are connected like best friends on a phone call. When you're stressed, your brain tells your gut to slow down or act weird. It's called the gut-brain axis. ";
  } else if (topCause.name === 'Hormones') {
    if (profile?.biological_sex === 'female') {
      explanation = "Your hormones (especially around your period) can make your gut act differently. It's totally normal—many women bloat more at certain times of the month. ";
    } else {
      explanation = "Your hormones affect how your gut works. Think of hormones like messengers that tell your body what to do—sometimes they tell your gut to hold onto water or slow down. ";
    }
  } else if (topCause.name === 'Medical/Structural Issues') {
    explanation = "Your quiz suggests there might be something structural going on with your digestive system. This could be something like a hiatal hernia or partial blockage—like a kink in a garden hose. ";
  } else if (topCause.name === 'Lifestyle & Posture') {
    explanation = "The way you sit, stand, and move affects your digestion! Slouching compresses your belly like squeezing a tube of toothpaste—food can't move through easily. ";
  }

  // Add the second cause if it's also significant
  if (secondCause.percentage > 40) {
    if (secondCause.name === 'Aerophagia (Swallowing Air)') {
      explanation += "You're also swallowing extra air, which adds to the puffiness.";
    } else if (secondCause.name === 'Gut Motility (Food Movement)') {
      explanation += "Plus, food is moving through your system slowly, giving it time to ferment.";
    } else if (secondCause.name === 'Gut Bacteria Balance') {
      explanation += "On top of that, your gut bacteria might need some rebalancing.";
    } else if (secondCause.name === 'Stress & Mind-Gut Connection') {
      explanation += "Stress is also playing a role—your gut is sensitive to your emotions.";
    } else if (secondCause.name === 'Hormones') {
      explanation += "Your hormones are also affecting things, especially at certain times.";
    } else if (secondCause.name === 'Lifestyle & Posture') {
      explanation += "Your daily habits and posture are also contributing to the problem.";
    }
  }

  return explanation;
}

// ============================================================
// FOOD ADVICE - Specific & Actionable
// ============================================================

function generateFoodAdvice(
  assessment: RootCauseAssessment | null,
  mealEntries: MealEntry[],
  profile: Profile | null
): string[] {
  const advice: string[] = [];

  // Get top triggers from meal data
  const triggerCounts: Record<string, number> = {};
  mealEntries.forEach(meal => {
    if (meal.bloating_rating && meal.bloating_rating >= 4) {
      meal.detected_triggers?.forEach(trigger => {
        triggerCounts[trigger.category] = (triggerCounts[trigger.category] || 0) + 1;
      });
    }
  });

  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  // Give specific advice based on top triggers
  if (topTriggers.includes('fodmaps-fructans')) {
    advice.push("🌾 Wheat and bread are showing up a lot in your rough meals. Try switching to sourdough bread (the fermentation breaks down those tricky sugars!) or rice-based options for a week.");
  }

  if (topTriggers.includes('fodmaps-gos')) {
    advice.push("🫘 Beans and legumes might be too much for your gut right now. If you love them, try smaller portions (like 1/4 cup instead of a full cup) and rinse canned beans really well.");
  }

  if (topTriggers.includes('fodmaps-lactose')) {
    advice.push("🥛 Dairy might be the culprit. Try lactose-free milk or hard cheeses (aged cheddar, parmesan) which have way less lactose than soft cheese or milk.");
  }

  if (topTriggers.includes('dairy')) {
    advice.push("🧀 Dairy products are appearing in your bloaty meals. Consider trying almond milk, oat milk, or coconut yogurt instead—many people feel so much better!");
  }

  if (topTriggers.includes('cruciferous')) {
    advice.push("🥦 Broccoli and cabbage family veggies create lots of gas. Try cooking them instead of eating raw (heat breaks down the gas-causing stuff), or switch to easier veggies like zucchini, carrots, or spinach.");
  }

  if (topTriggers.includes('high-fat')) {
    advice.push("🍟 Fried and fatty foods slow down your digestion like a traffic jam. Try baking, grilling, or air-frying instead—you'll still get crispy food without the heavy grease!");
  }

  if (topTriggers.includes('carbonated')) {
    advice.push("🥤 Carbonated drinks are literally bubbles going into your belly. Switch to still water with lemon, herbal tea, or flat beverages for a week and see how much better you feel.");
  }

  // If no triggers yet, give general advice based on assessment
  if (advice.length === 0 && assessment) {
    if (assessment.dysbiosis_score > 6) {
      advice.push("🦠 Focus on gut-healing foods: plain yogurt with live cultures, sauerkraut, kimchi (start small!), and bone broth. Think of these as fertilizer for your good gut bacteria.");
    }

    if (assessment.motility_score > 6) {
      advice.push("🚶 Add movement-friendly foods: warm liquids in the morning (like tea or warm lemon water), prunes or kiwi, and foods with natural fiber like oatmeal. These help food move through faster.");
    }

    advice.push("💧 Drink water between meals, not during meals. This helps your stomach acid work better and prevents diluting your digestive juices.");
  }

  // If still no advice, give beginner-friendly general advice
  if (advice.length === 0) {
    advice.push("📝 Keep logging meals! Once we have more data about what makes you bloat, I can give you super specific food swaps.");
    advice.push("🥗 In the meantime, try simple, plain foods for a few days: rice, chicken, cooked carrots, bananas. See if you feel better—then add foods back one at a time.");
  }

  return advice.slice(0, 4); // Max 4 pieces of advice
}

// ============================================================
// LIFESTYLE ADVICE - Based on Root Cause
// ============================================================

function generateLifestyleAdvice(
  assessment: RootCauseAssessment | null,
  profile: Profile | null
): string[] {
  const advice: string[] = [];

  if (!assessment) {
    advice.push("🧘 Try eating without distractions—no phone, no TV. Just you and your food. This helps you eat slower and chew better.");
    advice.push("⏰ Wait 3-4 hours between meals to let your gut fully digest before adding more food.");
    return advice;
  }

  // Aerophagia (air swallowing) advice
  if (assessment.aerophagia_score > 5) {
    advice.push("🐢 Slow down! I know it sounds simple, but eating slower and chewing each bite 20-30 times cuts down the air you swallow by like half.");
    advice.push("🤐 Try to avoid talking while you have food in your mouth—every time you talk, you gulp air.");
    if (assessment.aerophagia_score > 7) {
      advice.push("🚭 Skip the gum, straws, and smoking/vaping. All of these make you swallow tons of extra air without realizing it.");
    }
  }

  // Motility advice
  if (assessment.motility_score > 6) {
    advice.push("🚶‍♀️ Take a 10-15 minute walk after meals. Movement helps food move through your gut—think of it like helping traffic flow on a highway.");
    advice.push("☕ Have something warm in the morning (tea, warm water with lemon). Warmth wakes up your digestive system like stretching before exercise.");
  }

  // Brain-gut connection advice
  if (assessment.brain_gut_score > 8) {
    advice.push("🧠 Your gut is super sensitive to stress. Try 5 deep belly breaths before eating—in through nose for 4, hold for 4, out through mouth for 6. This tells your gut 'we're safe, you can digest now.'");
    advice.push("😴 Prioritize sleep. When you're tired, your gut doesn't work as well. Aim for 7-8 hours—it's like giving your gut a full recharge.");
  }

  // Hormonal advice (for females)
  if (assessment.hormonal_score > 3 && profile?.biological_sex === 'female') {
    advice.push("📅 Track your cycle! Many women need to eat differently at different times of the month. Be extra gentle with your gut the week before your period.");
  }

  // Lifestyle/posture advice
  if (assessment.lifestyle_score > 3) {
    advice.push("🪑 Sit up straight when you eat! Slouching compresses your organs. Imagine a straight line from your ear to your hip—that's good posture for digestion.");
    advice.push("⏱️ Don't lie down for at least 2 hours after eating. Gravity helps food move through—lying down is like trying to pour water uphill.");
  }

  return advice.slice(0, 4); // Max 4 pieces of advice
}

// ============================================================
// PROGRESS NOTE
// ============================================================

function generateProgressNote(
  profile: Profile | null,
  mealEntries: MealEntry[]
): string | null {
  if (mealEntries.length < 5) return null;

  const ratedMeals = mealEntries.filter(m => m.bloating_rating !== null);
  if (ratedMeals.length < 3) return null;

  const recentMeals = ratedMeals.slice(0, 5);
  const olderMeals = ratedMeals.slice(5, 10);

  if (olderMeals.length < 3) return null;

  const recentAvg = recentMeals.reduce((sum, m) => sum + (m.bloating_rating || 0), 0) / recentMeals.length;
  const olderAvg = olderMeals.reduce((sum, m) => sum + (m.bloating_rating || 0), 0) / olderMeals.length;

  const improvement = olderAvg - recentAvg;

  if (improvement > 0.5) {
    return `🎉 You're improving! Your average bloating has dropped from ${olderAvg.toFixed(1)} to ${recentAvg.toFixed(1)}. Whatever changes you've made are working—keep it up!`;
  } else if (improvement < -0.5) {
    return `🤔 Your bloating has increased a bit recently (from ${olderAvg.toFixed(1)} to ${recentAvg.toFixed(1)}). Look back at what changed in your diet or stress levels this week.`;
  } else {
    return `📊 Your bloating has been pretty consistent (averaging ${recentAvg.toFixed(1)}/5). This is good data—now let's use it to find patterns!`;
  }
}

// ============================================================
// MEDICATION NOTE
// ============================================================

function generateMedicationNote(profile: Profile | null): string | null {
  if (!profile?.medications || profile.medications.length === 0) return null;

  const meds = profile.medications.map(m => m.toLowerCase());
  const concerningMeds = [
    'ppi', 'omeprazole', 'pantoprazole', 'lansoprazole', 'prilosec', 'nexium',
    'antibiotic', 'amoxicillin', 'metformin', 'iron supplement'
  ];

  const hasConcerningMed = meds.some(med =>
    concerningMeds.some(concerning => med.includes(concerning))
  );

  if (hasConcerningMed) {
    return "💊 Some of your medications (like PPIs or antibiotics) can affect gut bacteria and digestion. This is normal and expected—just something to be aware of. Never stop medications without talking to your doctor!";
  }

  return "💊 I see you're taking medications. Always check with your doctor before making big diet changes, especially if your meds need to be taken with food.";
}

// ============================================================
// ENCOURAGEMENT
// ============================================================

function generateEncouragement(
  profile: Profile | null,
  assessment: RootCauseAssessment | null
): string {
  const mealCount = profile ? 0 : 0; // We don't have meal count here, but keeping structure

  const encouragements = [
    "Remember: bloating is your body's way of sending you a message. We're learning to speak its language!",
    "You're doing great by tracking this stuff. Most people just suffer in silence—you're actually doing something about it!",
    "Small changes add up. Even fixing one thing can make a huge difference in how you feel.",
    "Be patient with yourself. Your gut didn't get this way overnight, and it won't heal overnight—but it WILL heal.",
    "Think of this as becoming a detective for your own body. Every meal is a clue!",
  ];

  if (assessment?.risk_level === 'Low') {
    return "Good news: your quiz results suggest this is fixable with diet and lifestyle changes. You've got this!";
  }

  if (assessment?.risk_level === 'High' || assessment?.risk_level === 'Severe') {
    return "I know it feels overwhelming, but here's the truth: now that we know what's going on, we can actually DO something about it. One step at a time.";
  }

  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

// ============================================================
// DISPLAY NAME HELPERS
// ============================================================

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  aerophagia_score: 'Swallowing Air',
  motility_score: 'Gut Movement',
  dysbiosis_score: 'Gut Bacteria',
  brain_gut_score: 'Stress & Mind-Gut',
  hormonal_score: 'Hormones',
  structural_score: 'Medical/Structural',
  lifestyle_score: 'Lifestyle & Posture',
};
