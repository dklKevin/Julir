/**
 * App Lock Hook
 * Manages biometric lock state for the application.
 */

import { useState, useEffect, useCallback } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  type BiometricStatus,
} from '../services/biometricService';

interface UseAppLockOptions {
  /** Whether app lock is enabled in settings */
  enabled: boolean;
  /** Called when lock state changes */
  onLockChange?: (isLocked: boolean) => void;
}

interface UseAppLockReturn {
  /** Whether the app is currently locked */
  isLocked: boolean;
  /** Whether biometrics are available */
  biometricStatus: BiometricStatus | null;
  /** Whether currently authenticating */
  isAuthenticating: boolean;
  /** Last error message */
  error: string | null;
  /** Attempt to unlock */
  unlock: () => Promise<boolean>;
  /** Lock the app */
  lock: () => void;
  /** Check and update biometric availability */
  checkAvailability: () => Promise<BiometricStatus>;
}

const isNative = Capacitor.isNativePlatform();

/**
 * Hook for managing app lock with biometrics
 */
export function useAppLock(options: UseAppLockOptions): UseAppLockReturn {
  const { enabled, onLockChange } = options;

  const [isLocked, setIsLocked] = useState(enabled);
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check biometric availability on mount and when enabled changes
  useEffect(() => {
    if (enabled) {
      checkBiometricAvailability().then(setBiometricStatus);
    }
  }, [enabled]);

  // Lock on app background (native only)
  useEffect(() => {
    if (!isNative || !enabled) return;

    const handleAppStateChange = App.addListener('appStateChange', (state) => {
      if (!state.isActive && enabled) {
        // App went to background - lock it
        setIsLocked(true);
        onLockChange?.(true);
      }
    });

    return () => {
      handleAppStateChange.remove();
    };
  }, [enabled, onLockChange]);

  // Update lock state when enabled changes
  useEffect(() => {
    if (!enabled && isLocked) {
      setIsLocked(false);
      onLockChange?.(false);
    } else if (enabled && !isLocked && biometricStatus?.isAvailable) {
      // Just enabled - require authentication
      setIsLocked(true);
      onLockChange?.(true);
    }
  }, [enabled, isLocked, biometricStatus?.isAvailable, onLockChange]);

  const checkAvailability = useCallback(async () => {
    const status = await checkBiometricAvailability();
    setBiometricStatus(status);
    return status;
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (!enabled || !isLocked) {
      return true;
    }

    if (!biometricStatus?.isAvailable) {
      // If biometrics not available, just unlock (fallback)
      setIsLocked(false);
      onLockChange?.(false);
      return true;
    }

    setIsAuthenticating(true);
    setError(null);

    const result = await authenticateWithBiometrics('Unlock your diary');

    setIsAuthenticating(false);

    if (result.success) {
      setIsLocked(false);
      onLockChange?.(false);
      return true;
    } else {
      setError(result.error || 'Authentication failed');
      return false;
    }
  }, [enabled, isLocked, biometricStatus?.isAvailable, onLockChange]);

  const lock = useCallback(() => {
    if (enabled && biometricStatus?.isAvailable) {
      setIsLocked(true);
      onLockChange?.(true);
    }
  }, [enabled, biometricStatus?.isAvailable, onLockChange]);

  return {
    isLocked: enabled && isLocked,
    biometricStatus,
    isAuthenticating,
    error,
    unlock,
    lock,
    checkAvailability,
  };
}
