/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions
 * Enhanced with creative, addictive patterns for premium UX
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Store interval references for cleanup
let scanningIntervalId: ReturnType<typeof setInterval> | null = null;
let pulsingIntervalId: ReturnType<typeof setInterval> | null = null;

export const haptics = {
  /**
   * Trigger a haptic feedback
   * @param style - The intensity/style of the haptic feedback
   */
  impact: (style: HapticStyle = 'medium') => {
    // Check if the Vibration API is supported
    if (!navigator.vibrate) {
      return;
    }

    // Map styles to vibration patterns (in milliseconds)
    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10], // Double tap pattern
      warning: [15, 100, 15, 100, 15], // Triple tap pattern
      error: [20, 100, 20, 100, 20, 100, 20], // Intense pattern
    };

    const pattern = patterns[style];
    navigator.vibrate(pattern);
  },

  /**
   * Success haptic - double tap
   */
  success: () => {
    haptics.impact('success');
  },

  /**
   * Error haptic - intense triple tap
   */
  error: () => {
    haptics.impact('error');
  },

  /**
   * Light tap for buttons
   */
  light: () => {
    haptics.impact('light');
  },

  /**
   * Medium tap for selections
   */
  medium: () => {
    haptics.impact('medium');
  },

  /**
   * Heavy tap for important actions
   */
  heavy: () => {
    haptics.impact('heavy');
  },

  /**
   * Warning haptic
   */
  warning: () => {
    haptics.impact('warning');
  },

  /**
   * Custom pattern - for advanced haptic sequences
   */
  pattern: (vibrationPattern: number[]) => {
    if (!navigator.vibrate) return;
    navigator.vibrate(vibrationPattern);
  },

  /**
   * Heavy pulsing haptic for scanning animation
   * Creates a rhythmic heartbeat-like pulse that syncs with visual scanning
   * Runs continuously until stopped
   */
  startScanningPulse: () => {
    if (!navigator.vibrate) return;

    // Clear any existing interval
    haptics.stopScanningPulse();

    // Initial heavy burst to signal start
    navigator.vibrate([40, 100, 40, 100, 60]);

    // Heartbeat pulse pattern - heavy double-tap every 600ms
    // Mimics a scanning "heartbeat" rhythm
    scanningIntervalId = setInterval(() => {
      // Heavy double-tap pulse like a heartbeat
      navigator.vibrate([35, 80, 50]);
    }, 600);
  },

  /**
   * Stop the scanning pulse
   */
  stopScanningPulse: () => {
    if (scanningIntervalId) {
      clearInterval(scanningIntervalId);
      scanningIntervalId = null;
    }
    // Final completion burst
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30, 50, 60, 100, 80]);
    }
  },

  /**
   * Phase change haptic - signals transition between scanning phases
   * Gets progressively stronger with each phase
   */
  scanPhaseChange: (phaseNumber: number) => {
    if (!navigator.vibrate) return;

    // Escalating intensity based on phase (0-4)
    const patterns = [
      [20, 40, 20],                    // Phase 0: Light double tap
      [25, 50, 35],                    // Phase 1: Medium pulse
      [30, 40, 30, 40, 40],            // Phase 2: Triple pulse
      [35, 50, 40, 50, 50],            // Phase 3: Stronger triple
      [40, 30, 40, 30, 40, 30, 60],    // Phase 4: Intense finale buildup
    ];

    const pattern = patterns[Math.min(phaseNumber, 4)];
    navigator.vibrate(pattern);
  },

  /**
   * Scan complete celebration - triumphant haptic sequence
   */
  scanComplete: () => {
    if (!navigator.vibrate) return;

    // Triumphant completion pattern - builds up then releases
    // Like a "ta-da!" moment
    navigator.vibrate([
      30, 50,   // Quick tap
      40, 50,   // Slightly stronger
      50, 50,   // Building...
      60, 80,   // Pause for drama
      80,       // Big finale hit
    ]);
  },

  /**
   * SUPER ADDICTIVE Log Meal button haptic
   * Multi-stage satisfying feedback that makes you WANT to press it again
   * Inspired by slot machine "win" feedback
   */
  logMealPress: () => {
    if (!navigator.vibrate) return;

    // Stage 1: Initial satisfying "click" with depth
    navigator.vibrate([
      50, 30,   // Strong initial impact
      35, 25,   // Quick secondary tap
      25,       // Soft bounce
    ]);

    // Stage 2: Delayed "reward" burst (after 150ms)
    setTimeout(() => {
      if (!navigator.vibrate) return;
      navigator.vibrate([
        40, 40,   // Build up
        50, 40,   // Rising
        60, 50,   // Peak
        45,       // Satisfying release
      ]);
    }, 150);

    // Stage 3: Final "celebration" micro-burst (after 350ms)
    setTimeout(() => {
      if (!navigator.vibrate) return;
      navigator.vibrate([
        30, 30, 30, 30, 35, 30, 40,  // Rapid celebration taps
      ]);
    }, 350);
  },

  /**
   * Quick "anticipation" tap when button is touched but before full press
   */
  logMealTouch: () => {
    if (!navigator.vibrate) return;
    // Subtle anticipation vibration
    navigator.vibrate([15, 20, 10]);
  },

  /**
   * Continuous exciting pulse while saving
   * Creates anticipation during the save operation
   */
  startSavingPulse: () => {
    if (!navigator.vibrate) return;

    haptics.stopSavingPulse();

    // Excited rapid pulse while saving
    pulsingIntervalId = setInterval(() => {
      navigator.vibrate([20, 60, 25, 60, 30]);
    }, 300);
  },

  /**
   * Stop the saving pulse with success flourish
   */
  stopSavingPulse: () => {
    if (pulsingIntervalId) {
      clearInterval(pulsingIntervalId);
      pulsingIntervalId = null;
    }
  },

  /**
   * Ultimate success celebration - for when meal is saved
   * Slot machine jackpot-style celebration
   */
  mealSavedCelebration: () => {
    if (!navigator.vibrate) return;

    // Big celebration pattern
    navigator.vibrate([
      50, 40,           // Initial hit
      60, 50,           // Building
      70, 60,           // Peak
      40, 40, 40, 40,   // Rapid celebration
      50, 100,          // Pause
      80,               // Final satisfying thump
    ]);
  },

  // ==========================================
  // MILESTONE HAPTICS - Premium Retention Engine
  // ==========================================

  /**
   * Micro-milestone complete - satisfying single checkmark
   * 180ms total to match the visual stroke-draw animation
   */
  milestoneComplete: () => {
    if (!navigator.vibrate) return;
    // Precise, satisfying "tick" with subtle trail
    navigator.vibrate([15, 30, 25, 20, 15]);
  },

  /**
   * Progress tick - subtle feedback as progress bar fills
   * Used for visual progress animations
   */
  progressTick: () => {
    if (!navigator.vibrate) return;
    // Quick, barely-there pulse
    navigator.vibrate([8]);
  },

  /**
   * Tier unlock - triumphant pattern for major unlocks
   * Pattern Detection, Experiments, AI Guide, Blueprint
   */
  tierUnlock: () => {
    if (!navigator.vibrate) return;
    // Dramatic build-up with satisfying release
    navigator.vibrate([
      20, 40,   // Initial attention
      30, 40,   // Building
      40, 50,   // Rising
      50, 60,   // Peak tension
      70, 30,   // Release hit 1
      60, 30,   // Release hit 2
      80,       // Final triumphant thump
    ]);
  },

  /**
   * Badge reveal - when achievement badges animate in
   */
  badgeReveal: () => {
    if (!navigator.vibrate) return;
    // Quick exciting burst
    navigator.vibrate([25, 30, 35, 30, 45]);
  },

  /**
   * Confetti burst - micro celebration effect
   */
  confettiBurst: () => {
    if (!navigator.vibrate) return;
    // Sparkly rapid taps like confetti landing
    navigator.vibrate([10, 20, 15, 20, 10, 20, 15, 20, 10, 30, 20]);
  },

  /**
   * Streak milestone - for 72-hour streak completion
   */
  streakComplete: () => {
    if (!navigator.vibrate) return;
    // Triple celebration pattern
    navigator.vibrate([
      30, 50, 40, 50, 50,  // First wave
      60, 100,              // Pause
      40, 40, 40, 40, 40,  // Rapid celebration
      70,                   // Final hit
    ]);
  },

  /**
   * Experiment start - anticipation pattern
   */
  experimentStart: () => {
    if (!navigator.vibrate) return;
    // Scientific "beep boop" feel
    navigator.vibrate([20, 60, 30, 60, 20]);
  },

  /**
   * Experiment complete - discovery celebration
   */
  experimentComplete: () => {
    if (!navigator.vibrate) return;
    // "Eureka!" moment
    navigator.vibrate([
      15, 30,   // Quick intro
      25, 40,   // Build
      35, 50,   // Rising
      50, 30,   // Peak
      40, 30, 35, 30, 30, 30,  // Excited taps
      60,       // Final discovery hit
    ]);
  },

  /**
   * AI Guide reveal - magical reveal pattern
   */
  aiGuideReveal: () => {
    if (!navigator.vibrate) return;
    // Mystical, premium feel
    navigator.vibrate([
      10, 50,   // Soft start
      20, 40,   // Gentle build
      30, 40,
      40, 50,
      50, 60,
      60, 100,  // Dramatic pause
      80, 50,   // Grand reveal
      60,       // Settling
    ]);
  },

  /**
   * Blueprint unlock - ultimate achievement
   */
  blueprintUnlock: () => {
    if (!navigator.vibrate) return;
    // The most satisfying pattern - 90 days of work culminated
    navigator.vibrate([
      // Fanfare intro
      40, 40, 50, 40, 60, 60,
      // Dramatic pause
      80, 150,
      // Triumphant sequence
      70, 30, 70, 30, 70, 50,
      // Celebration burst
      40, 20, 40, 20, 40, 20, 40, 40,
      // Grand finale
      100,
    ]);
  },

  /**
   * Day completion - daily milestone achieved
   */
  dayComplete: () => {
    if (!navigator.vibrate) return;
    // Satisfying daily "ding"
    navigator.vibrate([20, 40, 30, 30, 25]);
  },

  /**
   * Unlock tease - when tapping locked content
   */
  lockedTap: () => {
    if (!navigator.vibrate) return;
    // Subtle "nope" feel
    navigator.vibrate([15, 50, 10]);
  },
};
