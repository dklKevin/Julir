/**
 * Haptic Feedback Utilities
 * Provides tactile feedback on supported devices using the Vibration API.
 * Falls back silently on unsupported devices (iOS Safari, desktop).
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,           // Quick tap
  medium: 25,          // Button press
  heavy: 50,           // Significant action
  success: [30, 50, 30], // Double pulse for success
  warning: [50, 30, 50, 30, 50], // Triple pulse warning
  error: [100, 50, 100], // Strong double for error
  selection: 15,       // List item selection
};

/**
 * Check if haptic feedback is supported
 */
export const supportsHaptics = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback with a named pattern
 */
export const haptic = (pattern: HapticPattern = 'medium'): void => {
  if (!supportsHaptics()) return;

  try {
    navigator.vibrate(HAPTIC_PATTERNS[pattern]);
  } catch {
    // Silently fail - haptics are enhancement only
  }
};

/**
 * Trigger custom haptic pattern
 * @param pattern - Duration in ms, or array of [vibrate, pause, vibrate, ...]
 */
export const hapticCustom = (pattern: number | number[]): void => {
  if (!supportsHaptics()) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail
  }
};

/**
 * Stop any ongoing vibration
 */
export const hapticStop = (): void => {
  if (!supportsHaptics()) return;

  try {
    navigator.vibrate(0);
  } catch {
    // Silently fail
  }
};
