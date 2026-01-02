import type { QuizQuestion } from '@/types/quiz';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ============================================================
  // SECTION 1: Eating & Breathing Mechanics (4 Questions)
  // ============================================================
  {
    id: 'eating-pace',
    section: 'Eating & Breathing Mechanics',
    sectionNumber: 1,
    questionNumber: 1,
    text: 'Eating Pace',
    type: 'single-choice',
    explanation: 'Eating too quickly can cause you to swallow more air',
    options: [
      { value: 'very-fast', label: 'Very fast', sublabel: '< 10 min per meal' },
      { value: 'moderate', label: 'Moderate', sublabel: '10-20 min' },
      { value: 'slow', label: 'Slow', sublabel: '20+ min' },
    ],
  },
  {
    id: 'eating-habits',
    section: 'Eating & Breathing Mechanics',
    sectionNumber: 1,
    questionNumber: 2,
    text: 'Eating Habits',
    type: 'multi-choice',
    explanation: 'These habits can increase air swallowing',
    options: [
      { value: 'chew-gum', label: 'Chew gum frequently' },
      { value: 'use-straws', label: 'Use straws regularly' },
      { value: 'talk-eating', label: 'Talk while eating' },
      { value: 'eat-stressed', label: 'Eat while stressed/rushed' },
      { value: 'carbonated-daily', label: 'Drink carbonated beverages daily' },
      { value: 'smoke-vape', label: 'Smoke or vape' },
      { value: 'none', label: 'None of these apply' },
    ],
  },
  {
    id: 'liquid-consumption',
    section: 'Eating & Breathing Mechanics',
    sectionNumber: 1,
    questionNumber: 3,
    text: 'Liquid Consumption with Meals',
    type: 'single-choice',
    options: [
      { value: 'large-amounts', label: 'Large amounts before/during meals' },
      { value: 'moderate-amounts', label: 'Moderate amounts' },
      { value: 'minimal', label: 'Minimal - mostly between meals' },
      { value: 'rarely-drink', label: 'I rarely drink water' },
    ],
  },
  {
    id: 'breathing-pattern',
    section: 'Eating & Breathing Mechanics',
    sectionNumber: 1,
    questionNumber: 4,
    text: 'Breathing Pattern Awareness',
    type: 'single-choice',
    options: [
      { value: 'often-mouth', label: 'Often breathe through mouth' },
      { value: 'sometimes-mouth', label: 'Sometimes mouth breathe when stressed' },
      { value: 'usually-nose', label: 'Usually breathe through nose' },
      { value: 'never-noticed', label: 'Never noticed' },
    ],
  },

  // ============================================================
  // SECTION 2: Gut Motor Function (4 Questions)
  // ============================================================
  {
    id: 'bowel-pattern',
    section: 'Gut Motor Function',
    sectionNumber: 2,
    questionNumber: 5,
    text: 'Bowel Movement Pattern',
    type: 'single-choice',
    options: [
      { value: 'less-than-3', label: 'Less than 3x per week' },
      { value: '3-6-weekly', label: '3-6x per week' },
      { value: 'daily', label: 'Daily' },
      { value: 'multiple-daily', label: 'Multiple times daily' },
    ],
  },
  {
    id: 'stool-type',
    section: 'Gut Motor Function',
    sectionNumber: 2,
    questionNumber: 6,
    text: 'Stool Consistency (Bristol Scale)',
    type: 'single-choice',
    options: [
      { value: 'type-1-2', label: 'Type 1-2', sublabel: 'Hard, lumpy' },
      { value: 'type-3-4', label: 'Type 3-4', sublabel: 'Ideal consistency' },
      { value: 'type-5-6', label: 'Type 5-6', sublabel: 'Loose' },
      { value: 'type-7', label: 'Type 7', sublabel: 'Watery' },
    ],
  },
  {
    id: 'early-fullness',
    section: 'Gut Motor Function',
    sectionNumber: 2,
    questionNumber: 7,
    text: 'Early Fullness/Upper Discomfort',
    type: 'single-choice',
    options: [
      { value: 'few-bites', label: 'Get full after just a few bites' },
      { value: 'quickly', label: 'Feel full quickly but can finish meal' },
      { value: 'normal', label: 'Normal fullness patterns' },
      { value: 'rarely-full', label: 'Rarely feel full' },
    ],
  },
  {
    id: 'activity-level',
    section: 'Gut Motor Function',
    sectionNumber: 2,
    questionNumber: 8,
    text: 'Daily Activity Level',
    type: 'single-choice',
    options: [
      { value: 'sedentary', label: 'Sedentary', sublabel: '< 30min movement' },
      { value: 'light', label: 'Light activity', sublabel: '30-60min' },
      { value: 'moderate', label: 'Moderate', sublabel: '60-120min' },
      { value: 'very-active', label: 'Very active', sublabel: '120+ min' },
    ],
  },

  // ============================================================
  // SECTION 3: Microbial Balance (4 Questions)
  // ============================================================
  {
    id: 'antibiotic-use',
    section: 'Microbial Balance',
    sectionNumber: 3,
    questionNumber: 9,
    text: 'Antibiotic Use (Past Year)',
    type: 'single-choice',
    options: [
      { value: '3-plus', label: '3+ courses' },
      { value: '1-2', label: '1-2 courses' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    id: 'acid-reflux-meds',
    section: 'Microbial Balance',
    sectionNumber: 3,
    questionNumber: 10,
    text: 'Acid Reflux Medication History',
    type: 'single-choice',
    options: [
      { value: 'daily-ppi', label: 'Daily PPI use (current)' },
      { value: 'previous-ppi', label: 'Previous PPI use (stopped)' },
      { value: 'occasional-antacids', label: 'Occasional antacids' },
      { value: 'never', label: 'Never used' },
    ],
  },
  {
    id: 'bloating-pattern',
    section: 'Microbial Balance',
    sectionNumber: 3,
    questionNumber: 11,
    text: 'Bloating Pattern Throughout Day',
    type: 'single-choice',
    options: [
      { value: 'morning-fasting', label: 'Worst in morning, fasting' },
      { value: 'progressive-day', label: 'Progressively worse as day goes on' },
      { value: 'post-meal-1-2hrs', label: 'Peaks 1-2 hours after meals' },
      { value: 'random', label: 'Random/no clear pattern' },
    ],
  },
  {
    id: 'probiotic-intake',
    section: 'Microbial Balance',
    sectionNumber: 3,
    questionNumber: 12,
    text: 'Probiotic/Fermented Food Intake',
    type: 'single-choice',
    options: [
      { value: 'daily', label: 'Daily probiotics/fermented foods' },
      { value: 'weekly', label: 'Weekly consumption' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never-worse', label: 'Never - or makes bloating WORSE' },
    ],
  },

  // ============================================================
  // SECTION 4: Brain-Gut Connection (5 Questions)
  // ============================================================
  {
    id: 'stress-impact',
    section: 'Brain-Gut Connection',
    sectionNumber: 4,
    questionNumber: 13,
    text: 'Stress Impact on Bloating',
    type: 'single-choice',
    options: [
      { value: 'immediate-correlation', label: 'Direct correlation - stress = immediate bloating' },
      { value: 'worse-stressful', label: 'Bloating worse during stressful periods' },
      { value: 'minimal-connection', label: 'Minimal connection' },
      { value: 'no-relationship', label: "No relationship I've noticed" },
    ],
  },
  {
    id: 'vacation-difference',
    section: 'Brain-Gut Connection',
    sectionNumber: 4,
    questionNumber: 14,
    text: 'Weekend/Vacation Bloating Difference',
    type: 'single-choice',
    options: [
      { value: 'significantly-better', label: 'Significantly better on vacation/weekends' },
      { value: 'somewhat-better', label: 'Somewhat better' },
      { value: 'no-difference', label: 'No difference' },
      { value: 'actually-worse', label: 'Actually worse (different routine)' },
    ],
  },
  {
    id: 'sleep-quality',
    section: 'Brain-Gut Connection',
    sectionNumber: 4,
    questionNumber: 15,
    text: 'Sleep Quality',
    type: 'single-choice',
    options: [
      { value: 'poor', label: 'Poor', sublabel: '< 6hrs or frequently disrupted' },
      { value: 'fair', label: 'Fair', sublabel: '6-7hrs, some disruption' },
      { value: 'good', label: 'Good', sublabel: '7-8hrs, minimal disruption' },
      { value: 'excellent', label: 'Excellent', sublabel: '8+ hrs, quality sleep' },
    ],
  },
  {
    id: 'stress-management',
    section: 'Brain-Gut Connection',
    sectionNumber: 4,
    questionNumber: 16,
    text: 'Stress Management Practices',
    type: 'multi-choice',
    options: [
      { value: 'meditation', label: 'Regular meditation/mindfulness' },
      { value: 'exercise-3plus', label: 'Exercise 3+ times/week' },
      { value: 'therapy', label: 'Therapy/counseling' },
      { value: 'breathing', label: 'Breathing exercises' },
      { value: 'none', label: 'None currently' },
    ],
  },
  {
    id: 'work-life-balance',
    section: 'Brain-Gut Connection',
    sectionNumber: 4,
    questionNumber: 17,
    text: 'Work-Life Balance',
    type: 'single-choice',
    options: [
      { value: 'constantly-overwhelmed', label: 'Constantly overwhelmed' },
      { value: 'frequently-stressed', label: 'Frequently stressed' },
      { value: 'manageable', label: 'Manageable most days' },
      { value: 'well-balanced', label: 'Well-balanced' },
    ],
  },

  // ============================================================
  // SECTION 5: Hormonal & Cyclical (2 Questions)
  // ============================================================
  {
    id: 'menstrual-effect',
    section: 'Hormonal & Cyclical',
    sectionNumber: 5,
    questionNumber: 18,
    text: 'Menstrual Cycle Effects (Females Only)',
    type: 'single-choice',
    skipLogic: (answers) => answers.biologicalSex === 'male',
    options: [
      { value: 'severe-bloating', label: 'Severe bloating pre-period (PMS)' },
      { value: 'moderate-bloating', label: 'Moderate bloating pre-period' },
      { value: 'minimal-bloating', label: 'Minimal menstrual bloating' },
      { value: 'no-pattern', label: 'No noticeable pattern' },
      { value: 'post-menopausal-na', label: 'Post-menopausal/N/A' },
    ],
  },
  {
    id: 'time-seasonal-pattern',
    section: 'Hormonal & Cyclical',
    sectionNumber: 5,
    questionNumber: 19,
    text: 'Time-of-Day/Seasonal Patterns',
    type: 'single-choice',
    options: [
      { value: 'evening-worse', label: 'Bloating worse in evening always' },
      { value: 'seasonal-worse', label: 'Bloating worse in certain seasons' },
      { value: 'consistent', label: 'Consistent throughout day/year' },
      { value: 'morning-predominant', label: 'Morning bloating predominant' },
    ],
  },

  // ============================================================
  // SECTION 6: Structural & Medical (4 Questions)
  // ============================================================
  {
    id: 'surgery-history',
    section: 'Structural & Medical',
    sectionNumber: 6,
    questionNumber: 20,
    text: 'Abdominal Surgery History',
    type: 'single-choice',
    options: [
      { value: 'multiple', label: 'Multiple abdominal surgeries' },
      { value: 'one-significant', label: 'One significant surgery', sublabel: 'C-section, appendectomy, etc.' },
      { value: 'minor-only', label: 'Minor procedure only' },
      { value: 'none', label: 'No surgical history' },
    ],
  },
  {
    id: 'pelvic-floor-issues',
    section: 'Structural & Medical',
    sectionNumber: 6,
    questionNumber: 21,
    text: 'Pelvic Floor Issues (Females Only)',
    type: 'single-choice',
    skipLogic: (answers) => answers.biologicalSex === 'male',
    options: [
      { value: 'diagnosed', label: 'Diagnosed pelvic floor dysfunction' },
      { value: 'suspected', label: 'Suspected issues', sublabel: 'Leakage, pain, etc.' },
      { value: 'post-pregnancy', label: 'Post-pregnancy concerns' },
      { value: 'no-issues', label: 'No known issues' },
    ],
  },
  {
    id: 'current-medications',
    section: 'Structural & Medical',
    sectionNumber: 6,
    questionNumber: 22,
    text: 'Current Medications',
    type: 'multi-choice',
    options: [
      { value: 'opioids', label: 'Opioids/pain medications' },
      { value: 'antidepressants', label: 'Antidepressants/anxiety meds' },
      { value: 'blood-pressure', label: 'Blood pressure medications' },
      { value: 'diabetes', label: 'Diabetes medications' },
      { value: 'birth-control', label: 'Hormonal birth control' },
      { value: 'thyroid', label: 'Thyroid medications' },
      { value: 'none', label: 'None of these' },
    ],
  },
  {
    id: 'diagnosed-conditions',
    section: 'Structural & Medical',
    sectionNumber: 6,
    questionNumber: 23,
    text: 'Diagnosed Conditions',
    type: 'multi-choice',
    options: [
      { value: 'ibs', label: 'IBS (diagnosed by doctor)' },
      { value: 'ibd', label: 'IBD (Crohn\'s/Ulcerative Colitis)' },
      { value: 'sibo', label: 'SIBO (diagnosed)' },
      { value: 'food-intolerances', label: 'Food intolerances (tested)' },
      { value: 'endometriosis', label: 'Endometriosis' },
      { value: 'hypothyroidism', label: 'Hypothyroidism' },
      { value: 'diabetes', label: 'Diabetes' },
      { value: 'none', label: 'None diagnosed' },
    ],
  },

  // ============================================================
  // SECTION 7: Physical Activity & Posture (2 Questions)
  // ============================================================
  {
    id: 'daily-posture',
    section: 'Physical Activity & Posture',
    sectionNumber: 7,
    questionNumber: 24,
    text: 'Typical Daily Posture',
    type: 'single-choice',
    options: [
      { value: 'hunched-8plus', label: 'Sitting hunched over 8+ hours' },
      { value: 'good-sitting-6-8', label: 'Sitting with good posture 6-8 hours' },
      { value: 'mix-sit-stand', label: 'Mix of sitting/standing throughout day' },
      { value: 'active-minimal-sit', label: 'Active job - minimal sitting' },
    ],
  },
  {
    id: 'digestive-activities',
    section: 'Physical Activity & Posture',
    sectionNumber: 7,
    questionNumber: 25,
    text: 'Digestive-Supporting Activities',
    type: 'single-choice',
    options: [
      { value: 'never', label: 'Never do specific activities for digestion' },
      { value: 'occasionally-1-2', label: 'Occasionally', sublabel: '1-2x/week' },
      { value: 'regularly-3-4', label: 'Regularly', sublabel: '3-4x/week' },
      { value: 'daily', label: 'Daily', sublabel: 'Walking after meals, yoga, stretching' },
    ],
  },
];

// Group questions by section for navigation
export const QUIZ_SECTIONS = QUIZ_QUESTIONS.reduce((sections, question) => {
  const sectionName = question.section;
  if (!sections[sectionName]) {
    sections[sectionName] = [];
  }
  sections[sectionName].push(question);
  return sections;
}, {} as Record<string, QuizQuestion[]>);

export const SECTION_NAMES = Array.from(new Set(QUIZ_QUESTIONS.map((q) => q.section)));
