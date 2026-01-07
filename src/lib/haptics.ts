/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

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
};
