import type {
  RootCauseQuizAnswers,
  QuizScores,
  CategoryScore,
  RiskLevel,
} from '@/types/quiz';

// ============================================================
// SCORING CONSTANTS
// ============================================================

const CATEGORY_WEIGHTS = {
  aerophagia: 1.0,
  motility: 1.2,
  dysbiosis: 1.3,
  brainGut: 1.1,
  hormonal: 0.8,
  structural: 1.0,
  lifestyle: 0.9,
};

const MAX_SCORES = {
  aerophagia: 10,
  motility: 11,
  dysbiosis: 11,
  brainGut: 14,
  hormonal: 6,
  structural: 10,
  lifestyle: 6,
};

// ============================================================
// INDIVIDUAL QUESTION SCORING FUNCTIONS
// ============================================================

// Section 1: Eating & Breathing Mechanics
function scoreEatingPace(pace: string): number {
  const scores: Record<string, number> = {
    'very-fast': 2,
    'moderate': 1,
    'slow': 0,
  };
  return scores[pace] || 0;
}

function scoreEatingHabits(habits: string[]): number {
  if (habits.includes('none')) return 0;
  return Math.min(habits.length, 6);
}

function scoreLiquidConsumption(consumption: string): number {
  const scores: Record<string, number> = {
    'large-amounts': 2,
    'moderate-amounts': 1,
    'minimal': 0,
    'rarely-drink': 1,
  };
  return scores[consumption] || 0;
}

function scoreBreathingPattern(pattern: string): number {
  const scores: Record<string, number> = {
    'often-mouth': 2,
    'sometimes-mouth': 1,
    'usually-nose': 0,
    'never-noticed': 0,
  };
  return scores[pattern] || 0;
}

// Section 2: Gut Motor Function
function scoreBowelPattern(pattern: string): number {
  const scores: Record<string, number> = {
    'less-than-3': 3,
    '3-6-weekly': 1,
    'daily': 0,
    'multiple-daily': 1,
  };
  return scores[pattern] || 0;
}

function scoreStoolType(type: string): number {
  const scores: Record<string, number> = {
    'type-1-2': 3,
    'type-3-4': 0,
    'type-5-6': 2,
    'type-7': 3,
  };
  return scores[type] || 0;
}

function scoreEarlyFullness(fullness: string): number {
  const scores: Record<string, number> = {
    'few-bites': 3,
    'quickly': 2,
    'normal': 0,
    'rarely-full': 1,
  };
  return scores[fullness] || 0;
}

function scoreActivityLevel(level: string): number {
  const scores: Record<string, number> = {
    'sedentary': 2,
    'light': 1,
    'moderate': 0,
    'very-active': 0,
  };
  return scores[level] || 0;
}

// Section 3: Microbial Balance
function scoreAntibioticUse(use: string): number {
  const scores: Record<string, number> = {
    '3-plus': 3,
    '1-2': 2,
    'none': 0,
  };
  return scores[use] || 0;
}

function scoreAcidRefluxMeds(meds: string): number {
  const scores: Record<string, number> = {
    'daily-ppi': 3,
    'previous-ppi': 2,
    'occasional-antacids': 1,
    'never': 0,
  };
  return scores[meds] || 0;
}

function scoreBloatingPattern(pattern: string): number {
  const scores: Record<string, number> = {
    'morning-fasting': 2,
    'progressive-day': 3,
    'post-meal-1-2hrs': 1,
    'random': 1,
  };
  return scores[pattern] || 0;
}

function scoreProbioticIntake(intake: string): number {
  const scores: Record<string, number> = {
    'daily': 0,
    'weekly': 1,
    'rarely': 2,
    'never-worse': 3,
  };
  return scores[intake] || 0;
}

// Section 4: Brain-Gut Connection
function scoreStressImpact(impact: string): number {
  const scores: Record<string, number> = {
    'immediate-correlation': 3,
    'worse-stressful': 2,
    'minimal-connection': 1,
    'no-relationship': 0,
  };
  return scores[impact] || 0;
}

function scoreVacationDifference(diff: string): number {
  const scores: Record<string, number> = {
    'significantly-better': 3,
    'somewhat-better': 2,
    'no-difference': 0,
    'actually-worse': 1,
  };
  return scores[diff] || 0;
}

function scoreSleepQuality(quality: string): number {
  const scores: Record<string, number> = {
    'poor': 3,
    'fair': 2,
    'good': 1,
    'excellent': 0,
  };
  return scores[quality] || 0;
}

function scoreStressManagement(practices: string[]): number {
  if (practices.includes('none')) return 3;
  const count = practices.length;
  if (count >= 4) return 0;
  if (count >= 2) return 1;
  if (count === 1) return 2;
  return 3;
}

function scoreWorkLifeBalance(balance: string): number {
  const scores: Record<string, number> = {
    'constantly-overwhelmed': 3,
    'frequently-stressed': 2,
    'manageable': 1,
    'well-balanced': 0,
  };
  return scores[balance] || 0;
}

// Section 5: Hormonal & Cyclical
function scoreMenstrualEffect(effect: string | undefined): number {
  if (!effect) return 0;
  const scores: Record<string, number> = {
    'severe-bloating': 3,
    'moderate-bloating': 2,
    'minimal-bloating': 1,
    'no-pattern': 0,
    'post-menopausal-na': 0,
  };
  return scores[effect] || 0;
}

function scoreTimeSeasonalPattern(pattern: string): number {
  const scores: Record<string, number> = {
    'evening-worse': 2,
    'seasonal-worse': 2,
    'consistent': 0,
    'morning-predominant': 3,
  };
  return scores[pattern] || 0;
}

// Section 6: Structural & Medical
function scoreSurgeryHistory(history: string): number {
  const scores: Record<string, number> = {
    'multiple': 3,
    'one-significant': 2,
    'minor-only': 1,
    'none': 0,
  };
  return scores[history] || 0;
}

function scorePelvicFloorIssues(issues: string | undefined): number {
  if (!issues) return 0;
  const scores: Record<string, number> = {
    'diagnosed': 3,
    'suspected': 2,
    'post-pregnancy': 1,
    'no-issues': 0,
  };
  return scores[issues] || 0;
}

function scoreCurrentMedications(meds: string[]): number {
  if (meds.includes('none')) return 0;
  return Math.min(meds.length, 6);
}

function scoreDiagnosedConditions(conditions: string[]): number {
  if (conditions.includes('none')) return 0;
  const score = conditions.length * 2;
  return Math.min(score, 10);
}

// Section 7: Physical Activity & Posture
function scoreDailyPosture(posture: string): number {
  const scores: Record<string, number> = {
    'hunched-8plus': 3,
    'good-sitting-6-8': 2,
    'mix-sit-stand': 1,
    'active-minimal-sit': 0,
  };
  return scores[posture] || 0;
}

function scoreDigestiveActivities(activities: string): number {
  const scores: Record<string, number> = {
    'never': 3,
    'occasionally-1-2': 2,
    'regularly-3-4': 1,
    'daily': 0,
  };
  return scores[activities] || 0;
}

// ============================================================
// CATEGORY SCORING FUNCTIONS
// ============================================================

function calculateAerophagiaScore(answers: RootCauseQuizAnswers): number {
  return (
    scoreEatingPace(answers.eatingPace) +
    scoreEatingHabits(answers.eatingHabits) +
    scoreLiquidConsumption(answers.liquidConsumption) +
    scoreBreathingPattern(answers.breathingPattern)
  );
}

function calculateMotilityScore(answers: RootCauseQuizAnswers): number {
  return (
    scoreBowelPattern(answers.bowelPattern) +
    scoreStoolType(answers.stoolType) +
    scoreEarlyFullness(answers.earlyFullness) +
    scoreActivityLevel(answers.activityLevel)
  );
}

function calculateDysbiosisScore(answers: RootCauseQuizAnswers): number {
  return (
    scoreAntibioticUse(answers.antibioticUse) +
    scoreAcidRefluxMeds(answers.acidRefluxMeds) +
    scoreBloatingPattern(answers.bloatingPattern) +
    scoreProbioticIntake(answers.probioticIntake)
  );
}

function calculateBrainGutScore(answers: RootCauseQuizAnswers): number {
  return (
    scoreStressImpact(answers.stressImpact) +
    scoreVacationDifference(answers.vacationDifference) +
    scoreSleepQuality(answers.sleepQuality) +
    scoreStressManagement(answers.stressManagement) +
    scoreWorkLifeBalance(answers.workLifeBalance)
  );
}

function calculateHormonalScore(answers: RootCauseQuizAnswers): number {
  return (
    scoreMenstrualEffect(answers.menstrualEffect) +
    scoreTimeSeasonalPattern(answers.timeSeasonalPattern)
  );
}

function calculateStructuralScore(answers: RootCauseQuizAnswers): number {
  return (
    scoreSurgeryHistory(answers.surgeryHistory) +
    scorePelvicFloorIssues(answers.pelvicFloorIssues) +
    scoreCurrentMedications(answers.currentMedications) +
    scoreDiagnosedConditions(answers.diagnosedConditions)
  );
}

function calculateLifestyleScore(answers: RootCauseQuizAnswers): number {
  return (
    scoreDailyPosture(answers.dailyPosture) +
    scoreDigestiveActivities(answers.digestiveActivities)
  );
}

// ============================================================
// MAIN SCORING FUNCTION
// ============================================================

function getCategoryLevel(score: number, maxScore: number): 'Low' | 'Moderate' | 'High' {
  const percentage = (score / maxScore) * 100;
  if (percentage < 33) return 'Low';
  if (percentage < 66) return 'Moderate';
  return 'High';
}

export function calculateQuizScores(answers: RootCauseQuizAnswers): QuizScores {
  const aerophagiaScore = calculateAerophagiaScore(answers);
  const motilityScore = calculateMotilityScore(answers);
  const dysbiosisScore = calculateDysbiosisScore(answers);
  const brainGutScore = calculateBrainGutScore(answers);
  const hormonalScore = calculateHormonalScore(answers);
  const structuralScore = calculateStructuralScore(answers);
  const lifestyleScore = calculateLifestyleScore(answers);

  return {
    aerophagia: {
      score: aerophagiaScore,
      maxScore: MAX_SCORES.aerophagia,
      level: getCategoryLevel(aerophagiaScore, MAX_SCORES.aerophagia),
      weight: CATEGORY_WEIGHTS.aerophagia,
    },
    motility: {
      score: motilityScore,
      maxScore: MAX_SCORES.motility,
      level: getCategoryLevel(motilityScore, MAX_SCORES.motility),
      weight: CATEGORY_WEIGHTS.motility,
    },
    dysbiosis: {
      score: dysbiosisScore,
      maxScore: MAX_SCORES.dysbiosis,
      level: getCategoryLevel(dysbiosisScore, MAX_SCORES.dysbiosis),
      weight: CATEGORY_WEIGHTS.dysbiosis,
    },
    brainGut: {
      score: brainGutScore,
      maxScore: MAX_SCORES.brainGut,
      level: getCategoryLevel(brainGutScore, MAX_SCORES.brainGut),
      weight: CATEGORY_WEIGHTS.brainGut,
    },
    hormonal: {
      score: hormonalScore,
      maxScore: MAX_SCORES.hormonal,
      level: getCategoryLevel(hormonalScore, MAX_SCORES.hormonal),
      weight: CATEGORY_WEIGHTS.hormonal,
    },
    structural: {
      score: structuralScore,
      maxScore: MAX_SCORES.structural,
      level: getCategoryLevel(structuralScore, MAX_SCORES.structural),
      weight: CATEGORY_WEIGHTS.structural,
    },
    lifestyle: {
      score: lifestyleScore,
      maxScore: MAX_SCORES.lifestyle,
      level: getCategoryLevel(lifestyleScore, MAX_SCORES.lifestyle),
      weight: CATEGORY_WEIGHTS.lifestyle,
    },
  };
}

export function calculateOverallScore(scores: QuizScores): number {
  const weightedSum = Object.entries(scores).reduce((sum, [_, categoryScore]) => {
    const weightedScore = (categoryScore.score / categoryScore.maxScore) * categoryScore.weight;
    return sum + weightedScore;
  }, 0);

  const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const normalizedScore = (weightedSum / totalWeight) * 100;

  return Math.round(Math.min(Math.max(normalizedScore, 0), 100));
}

export function getRiskLevel(overallScore: number): RiskLevel {
  if (overallScore <= 25) return 'Low';
  if (overallScore <= 50) return 'Moderate';
  if (overallScore <= 75) return 'High';
  return 'Severe';
}

export function getTopCauses(scores: QuizScores): string[] {
  const sortedCategories = Object.entries(scores)
    .map(([category, score]) => ({
      category,
      normalizedScore: (score.score / score.maxScore) * score.weight,
      level: score.level,
    }))
    .filter((item) => item.level !== 'Low')
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 3);

  return sortedCategories.map((item) => item.category);
}

export function detectRedFlags(answers: RootCauseQuizAnswers, scores: QuizScores): string[] {
  const flags: string[] = [];

  // Structural score >= 8
  if (scores.structural.score >= 8) {
    flags.push('Consider GI specialist consultation for structural concerns');
  }

  // Motility issues + severe constipation/diarrhea
  if (scores.motility.score >= 9 && (answers.stoolType === 'type-1-2' || answers.stoolType === 'type-7')) {
    flags.push('Possible motility disorder - medical evaluation recommended');
  }

  // Dysbiosis + frequent antibiotics
  if (scores.dysbiosis.score >= 9 && answers.antibioticUse === '3-plus') {
    flags.push('Severe dysbiosis risk - consider SIBO breath test');
  }

  // Daily bloating + high overall score
  // (Note: bloating frequency comes from onboarding data, not quiz)

  // Multiple high-risk categories
  const highRiskCount = Object.values(scores).filter((s) => s.level === 'High').length;
  if (highRiskCount >= 3) {
    flags.push('Multiple contributing factors detected - comprehensive GI workup recommended');
  }

  return flags;
}

// ============================================================
// CATEGORY DISPLAY NAMES
// ============================================================

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  aerophagia: 'Eating Mechanics (Air Swallowing)',
  motility: 'Gut Motility',
  dysbiosis: 'Microbial Balance',
  brainGut: 'Brain-Gut Axis',
  hormonal: 'Hormonal Factors',
  structural: 'Structural/Medical',
  lifestyle: 'Lifestyle/Posture',
};
