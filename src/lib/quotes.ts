// Comprehensive quote database with 100+ context-aware quotes

export const QUOTE_CATEGORIES = {
  ENCOURAGEMENT: 'encouragement',
  GUT_HEALTH: 'gut-health',
  FOOD_WISDOM: 'food-wisdom',
  SELF_CARE: 'self-care',
  PROGRESS: 'progress',
  MINDFULNESS: 'mindfulness',
  JOURNEY: 'journey'
} as const;

export interface Quote {
  id: number;
  category: string;
  text: string;
  author: string;
  context: string[];
}

export const QUOTES: Quote[] = [
  // ENCOURAGEMENT (for when user is making progress)
  { id: 1, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Every meal you log is a step toward understanding your body better.", author: "Dr. Sarah Chen", context: ['improving', 'consistent'] },
  { id: 2, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "You're not broken. You're just discovering what works for your unique body.", author: "Dr. Sarah Chen", context: ['improving', 'early_journey'] },
  { id: 3, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Knowledge is power, especially when it's knowledge about your own body.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 4, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "You are your own best healer. The answers are in your data.", author: "Dr. Sarah Chen", context: ['improving', 'consistent'] },
  { id: 5, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Trust your gut — literally. It's communicating with you.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 6, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Each entry brings you closer to digestive freedom.", author: "Dr. Sarah Chen", context: ['improving'] },
  { id: 7, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "You're building a personal map of your body. That's powerful.", author: "Dr. Sarah Chen", context: ['consistent'] },
  { id: 8, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Consistency creates clarity. Keep logging.", author: "Dr. Sarah Chen", context: ['consistent'] },
  { id: 9, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Your dedication today shapes your comfort tomorrow.", author: "Dr. Sarah Chen", context: ['improving'] },
  { id: 10, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Small wins compound into big breakthroughs.", author: "Dr. Sarah Chen", context: ['improving', 'general'] },

  // GUT-BRAIN CONNECTION
  { id: 11, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "95% of your body's serotonin lives in your gut. You're literally building happiness from the inside out.", author: "Dr. Will Cole", context: ['general', 'educational'] },
  { id: 12, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "The enteric nervous system has over 100 million neurons. It truly is a second brain.", author: "Dr. Emeran Mayer", context: ['general', 'educational'] },
  { id: 13, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Your gut microbiome can change in as little as 24 hours based on what you eat.", author: "Dr. Tim Spector", context: ['improving', 'hopeful'] },
  { id: 14, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Your gut is home to 100 trillion microorganisms. Taking care of them takes care of you.", author: "Dr. Robynne Chutkan", context: ['educational'] },
  { id: 15, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "A healthy gut means a healthy mind. The connection is undeniable.", author: "Dr. David Perlmutter", context: ['general'] },
  { id: 16, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Your digestive system is not just processing food — it's processing emotions too.", author: "Dr. Giulia Enders", context: ['general'] },
  { id: 17, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "The microbiome in your gut influences everything from mood to immunity. Feed it well.", author: "Dr. Emeran Mayer", context: ['general'] },
  { id: 18, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Gut bacteria produce neurotransmitters that directly affect your brain chemistry.", author: "Dr. Mark Hyman", context: ['educational'] },
  { id: 19, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "The vagus nerve is a superhighway between your gut and brain.", author: "Dr. Emeran Mayer", context: ['educational'] },
  { id: 20, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Inflammation often starts in the gut. Heal your gut, heal your body.", author: "Dr. Will Cole", context: ['general'] },

  // FOOD WISDOM
  { id: 21, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Tell me what you eat, and I will tell you who you are.", author: "Jean Anthelme Brillat-Savarin", context: ['general'] },
  { id: 22, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Let food be thy medicine and medicine be thy food.", author: "Hippocrates", context: ['general', 'healing'] },
  { id: 23, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison.", author: "Ann Wigmore", context: ['educational'] },
  { id: 24, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Eat breakfast like a king, lunch like a prince, and dinner like a pauper.", author: "Adelle Davis", context: ['general'] },
  { id: 25, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Nature provides all without pollution. Eat food that remembers where it came from.", author: "Michael Pollan", context: ['general'] },
  { id: 26, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Cooking is the ultimate act of love — for yourself and others.", author: "Maya Angelou", context: ['general'] },
  { id: 27, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Don't eat anything your great-grandmother wouldn't recognize as food.", author: "Michael Pollan", context: ['educational'] },
  { id: 28, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Your body is a temple, but only if you treat it as one.", author: "Astrid Alauda", context: ['general'] },
  { id: 29, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Eat food. Not too much. Mostly plants.", author: "Michael Pollan", context: ['general'] },
  { id: 30, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "The first wealth is health.", author: "Ralph Waldo Emerson", context: ['general'] },

  // SELF-CARE & HEALING
  { id: 31, category: QUOTE_CATEGORIES.SELF_CARE, text: "Healing your gut is not about restriction. It's about understanding what works for YOUR unique body.", author: "Dr. Will Cole", context: ['general', 'supportive'] },
  { id: 32, category: QUOTE_CATEGORIES.SELF_CARE, text: "Rest is not idleness; it's essential for digestive health.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 33, category: QUOTE_CATEGORIES.SELF_CARE, text: "Stress digests differently. Be gentle with yourself.", author: "Dr. Sarah Chen", context: ['struggling', 'supportive'] },
  { id: 34, category: QUOTE_CATEGORIES.SELF_CARE, text: "Self-care is not selfish. It's essential.", author: "Audre Lorde", context: ['general', 'supportive'] },
  { id: 35, category: QUOTE_CATEGORIES.SELF_CARE, text: "Your body hears everything your mind says.", author: "Naomi Judd", context: ['general'] },
  { id: 36, category: QUOTE_CATEGORIES.SELF_CARE, text: "Nourishing yourself in a way that helps you flourish is attainable.", author: "Deborah Day", context: ['improving'] },
  { id: 37, category: QUOTE_CATEGORIES.SELF_CARE, text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", context: ['general'] },
  { id: 38, category: QUOTE_CATEGORIES.SELF_CARE, text: "Caring for your gut is caring for your whole self.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 39, category: QUOTE_CATEGORIES.SELF_CARE, text: "Health is a relationship between you and your body.", author: "Terri Guillemets", context: ['general'] },
  { id: 40, category: QUOTE_CATEGORIES.SELF_CARE, text: "Sleep, hydration, and stress management are as important as diet.", author: "Dr. Mark Hyman", context: ['educational'] },

  // PROGRESS (for when struggling)
  { id: 41, category: QUOTE_CATEGORIES.PROGRESS, text: "Progress isn't linear. Some days will be rough, and that's okay. The data you're collecting matters.", author: "Dr. Sarah Chen", context: ['struggling', 'rough_days'] },
  { id: 42, category: QUOTE_CATEGORIES.PROGRESS, text: "Every 'bad day' teaches you something. You're building a map of your body's signals.", author: "Dr. Sarah Chen", context: ['struggling'] },
  { id: 43, category: QUOTE_CATEGORIES.PROGRESS, text: "Setbacks are setups for comebacks.", author: "Dr. Sarah Chen", context: ['struggling'] },
  { id: 44, category: QUOTE_CATEGORIES.PROGRESS, text: "A flare-up is data, not defeat. Learn from it.", author: "Dr. Sarah Chen", context: ['struggling', 'rough_days'] },
  { id: 45, category: QUOTE_CATEGORIES.PROGRESS, text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", context: ['early_journey'] },
  { id: 46, category: QUOTE_CATEGORIES.PROGRESS, text: "You're closer to answers than you think.", author: "Dr. Sarah Chen", context: ['struggling', 'supportive'] },
  { id: 47, category: QUOTE_CATEGORIES.PROGRESS, text: "Every expert was once a beginner. Every success was once a struggle.", author: "Unknown", context: ['early_journey'] },
  { id: 48, category: QUOTE_CATEGORIES.PROGRESS, text: "Difficult roads lead to beautiful destinations.", author: "Zig Ziglar", context: ['struggling'] },
  { id: 49, category: QUOTE_CATEGORIES.PROGRESS, text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay", context: ['struggling', 'supportive'] },
  { id: 50, category: QUOTE_CATEGORIES.PROGRESS, text: "Be patient with yourself. Self-growth is tender.", author: "Brianna Wiest", context: ['struggling', 'early_journey'] },

  // MINDFULNESS
  { id: 51, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Listen to your gut. It's trying to tell you something.", author: "Traditional Wisdom", context: ['general'] },
  { id: 52, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Your body whispers before it screams. Learn to listen early.", author: "Dr. Mark Hyman", context: ['general', 'early_journey'] },
  { id: 53, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Mindful eating is a gift you give yourself.", author: "Thich Nhat Hanh", context: ['general'] },
  { id: 54, category: QUOTE_CATEGORIES.MINDFULNESS, text: "When you eat, just eat. Give your digestion your full attention.", author: "Dr. Sarah Chen", context: ['educational'] },
  { id: 55, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Pause before you eat. Your gut will thank you.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 56, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Digestion begins in the mind. Calm your thoughts before your meal.", author: "Dr. Emeran Mayer", context: ['educational'] },
  { id: 57, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Awareness is the greatest agent for change.", author: "Eckhart Tolle", context: ['general'] },
  { id: 58, category: QUOTE_CATEGORIES.MINDFULNESS, text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh", context: ['general'] },
  { id: 59, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Chew your drink and drink your food.", author: "Mahatma Gandhi", context: ['educational'] },
  { id: 60, category: QUOTE_CATEGORIES.MINDFULNESS, text: "Eating slowly allows your body to catch up with your mind.", author: "Dr. Sarah Chen", context: ['educational'] },

  // JOURNEY
  { id: 61, category: QUOTE_CATEGORIES.JOURNEY, text: "Small shifts in your diet can lead to massive improvements in how you feel.", author: "Dr. Sarah Chen", context: ['early_journey'] },
  { id: 62, category: QUOTE_CATEGORIES.JOURNEY, text: "Your gut healing journey is unique. Compare yourself only to yesterday's you.", author: "Dr. Sarah Chen", context: ['early_journey', 'supportive'] },
  { id: 63, category: QUOTE_CATEGORIES.JOURNEY, text: "The beginning is always today.", author: "Mary Shelley", context: ['early_journey'] },
  { id: 64, category: QUOTE_CATEGORIES.JOURNEY, text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", context: ['struggling', 'early_journey'] },
  { id: 65, category: QUOTE_CATEGORIES.JOURNEY, text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", context: ['consistent'] },
  { id: 66, category: QUOTE_CATEGORIES.JOURNEY, text: "Every meal is a new opportunity to nourish yourself.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 67, category: QUOTE_CATEGORIES.JOURNEY, text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", context: ['early_journey'] },
  { id: 68, category: QUOTE_CATEGORIES.JOURNEY, text: "The secret of getting ahead is getting started.", author: "Mark Twain", context: ['early_journey'] },
  { id: 69, category: QUOTE_CATEGORIES.JOURNEY, text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn", context: ['general'] },
  { id: 70, category: QUOTE_CATEGORIES.JOURNEY, text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", context: ['early_journey'] },

  // MORE ENCOURAGEMENT
  { id: 71, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Believe in your body's ability to heal.", author: "Dr. Sarah Chen", context: ['supportive', 'improving'] },
  { id: 72, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "You're doing better than you think.", author: "Dr. Sarah Chen", context: ['struggling', 'supportive'] },
  { id: 73, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Every day is a fresh start for your gut.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 74, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Your commitment to tracking is already a win.", author: "Dr. Sarah Chen", context: ['consistent'] },
  { id: 75, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "You're investing in yourself. That's never wasted.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 76, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Celebrate your good gut days. They're signs of progress.", author: "Dr. Sarah Chen", context: ['improving'] },
  { id: 77, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Your body remembers every kind choice you make.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 78, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Trust the process. Insights are coming.", author: "Dr. Sarah Chen", context: ['early_journey'] },
  { id: 79, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "You're not alone in this journey.", author: "Dr. Sarah Chen", context: ['supportive'] },
  { id: 80, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Your future self will thank you for tracking today.", author: "Dr. Sarah Chen", context: ['consistent'] },

  // MORE GUT HEALTH SCIENCE
  { id: 81, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "70-80% of your immune system lives in your gut.", author: "Dr. Alessio Fasano", context: ['educational'] },
  { id: 82, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Fiber is food for your friendly gut bacteria.", author: "Dr. Will Bulsiewicz", context: ['educational'] },
  { id: 83, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Diversity in your diet means diversity in your microbiome.", author: "Dr. Tim Spector", context: ['educational'] },
  { id: 84, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Your gut produces more dopamine than your brain.", author: "Dr. Emeran Mayer", context: ['educational'] },
  { id: 85, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Fermented foods are nature's probiotics.", author: "Dr. Will Bulsiewicz", context: ['educational'] },
  { id: 86, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "A thriving microbiome is a thriving you.", author: "Dr. Tim Spector", context: ['general'] },
  { id: 87, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Your gut communicates with your brain every second.", author: "Dr. Emeran Mayer", context: ['educational'] },
  { id: 88, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Antibiotics saved lives but also need gut recovery.", author: "Dr. Martin Blaser", context: ['educational'] },
  { id: 89, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "The gut-brain axis is the most important connection in your body.", author: "Dr. Emeran Mayer", context: ['educational'] },
  { id: 90, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "Short-chain fatty acids from fiber feed your gut lining.", author: "Dr. Will Bulsiewicz", context: ['educational'] },

  // HOPEFUL & HEALING
  { id: 91, category: QUOTE_CATEGORIES.SELF_CARE, text: "Your gut can heal. Give it time and the right conditions.", author: "Dr. Sarah Chen", context: ['supportive', 'hopeful'] },
  { id: 92, category: QUOTE_CATEGORIES.SELF_CARE, text: "Healing is not linear, but it is possible.", author: "Dr. Sarah Chen", context: ['struggling', 'hopeful'] },
  { id: 93, category: QUOTE_CATEGORIES.SELF_CARE, text: "Your body wants to heal. Support it.", author: "Dr. Sarah Chen", context: ['hopeful'] },
  { id: 94, category: QUOTE_CATEGORIES.SELF_CARE, text: "Patience with your body is a form of self-love.", author: "Dr. Sarah Chen", context: ['supportive'] },
  { id: 95, category: QUOTE_CATEGORIES.SELF_CARE, text: "Be curious, not judgmental about your symptoms.", author: "Dr. Sarah Chen", context: ['supportive'] },
  { id: 96, category: QUOTE_CATEGORIES.SELF_CARE, text: "Your symptoms are signals, not sentences.", author: "Dr. Sarah Chen", context: ['struggling', 'supportive'] },
  { id: 97, category: QUOTE_CATEGORIES.SELF_CARE, text: "Compassion for yourself accelerates healing.", author: "Dr. Sarah Chen", context: ['supportive'] },
  { id: 98, category: QUOTE_CATEGORIES.SELF_CARE, text: "Honor your body's rhythms.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 99, category: QUOTE_CATEGORIES.SELF_CARE, text: "Gentle changes create lasting results.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 100, category: QUOTE_CATEGORIES.SELF_CARE, text: "Your wellness journey is worth every step.", author: "Dr. Sarah Chen", context: ['general'] },

  // BONUS QUOTES
  { id: 101, category: QUOTE_CATEGORIES.MINDFULNESS, text: "The way you eat is the way you live.", author: "Dr. Sarah Chen", context: ['general'] },
  { id: 102, category: QUOTE_CATEGORIES.JOURNEY, text: "Data reveals patterns. Patterns reveal solutions.", author: "Dr. Sarah Chen", context: ['consistent', 'improving'] },
  { id: 103, category: QUOTE_CATEGORIES.ENCOURAGEMENT, text: "Your gut diary is your roadmap to wellness.", author: "Dr. Sarah Chen", context: ['consistent'] },
  { id: 104, category: QUOTE_CATEGORIES.GUT_HEALTH, text: "A calm gut equals a calm mind.", author: "Dr. Emeran Mayer", context: ['general'] },
  { id: 105, category: QUOTE_CATEGORIES.FOOD_WISDOM, text: "Eat to nourish, not just to fill.", author: "Unknown", context: ['general'] },
];

export interface UserProgress {
  recentTrend: 'improving' | 'worsening' | 'stable';
  goodDaysCount: number;
  roughDaysCount: number;
  totalEntries: number;
  streak: number;
}

// Context-aware quote selection
export function getQuoteForContext(userProgress?: UserProgress): Quote {
  let context: string[] = ['general'];
  
  if (userProgress) {
    const { recentTrend, goodDaysCount, roughDaysCount, totalEntries, streak } = userProgress;
    
    // Determine user context
    if (recentTrend === 'improving' && goodDaysCount > roughDaysCount) {
      context = ['improving', 'encouragement'];
    } else if (roughDaysCount > goodDaysCount) {
      context = ['struggling', 'supportive'];
    } else if (totalEntries < 10) {
      context = ['early_journey', 'educational'];
    } else if (streak >= 7) {
      context = ['consistent', 'encouragement'];
    }
  }
  
  // Filter quotes by context
  const relevantQuotes = QUOTES.filter(quote =>
    quote.context.some(c => context.includes(c))
  );
  
  // If no context match, use general quotes
  const quotesToChooseFrom = relevantQuotes.length > 0 
    ? relevantQuotes 
    : QUOTES.filter(q => q.context.includes('general'));
  
  // Get quote of the day (changes daily, same for all users that day)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quoteIndex = dayOfYear % quotesToChooseFrom.length;
  
  return quotesToChooseFrom[quoteIndex];
}

// Get time-based greeting
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

// Get dynamic meal prompt
export function getMealPrompt(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "What's for breakfast?";
  if (hour >= 11 && hour < 14) return 'Log your lunch';
  if (hour >= 14 && hour < 17) return 'Snack time?';
  if (hour >= 17 && hour < 21) return "What's for dinner?";
  return 'Late night snack?';
}
