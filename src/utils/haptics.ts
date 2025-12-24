/**
 * Haptic Feedback Utilities
 * Uses native Capacitor haptics on iOS/Android, falls back to Vibration API on web.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNative } from './platform';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Web fallback patterns using Vibration API
const WEB_HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [30, 50, 30],
  warning: [50, 30, 50, 30, 50],
  error: [100, 50, 100],
  selection: 15,
};

/**
 * Check if haptic feedback is supported
 */
export const supportsHaptics = (): boolean => {
  if (isNative()) {
    return true; // Capacitor Haptics is always available on native
  }
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback with a named pattern
 * Uses native iOS Taptic Engine when available
 */
export const haptic = async (pattern: HapticPattern = 'medium'): Promise<void> => {
  try {
    if (isNative()) {
      // Use native Capacitor haptics
      switch (pattern) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          await Haptics.selectionEnd();
          break;
        default:
          await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } else {
      // Web fallback using Vibration API
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(WEB_HAPTIC_PATTERNS[pattern]);
      }
    }
  } catch {
    // Silently fail - haptics are enhancement only
  }
};

/**
 * Trigger custom haptic pattern
 * @param pattern - Duration in ms, or array of [vibrate, pause, vibrate, ...]
 */
export const hapticCustom = async (pattern: number | number[]): Promise<void> => {
  try {
    if (isNative()) {
      // For custom patterns on native, use a simple vibration
      await Haptics.vibrate();
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    }
  } catch {
    // Silently fail
  }
};

/**
 * Stop any ongoing vibration
 */
export const hapticStop = (): void => {
  try {
    if (!isNative() && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }
  } catch {
    // Silently fail
  }
};
