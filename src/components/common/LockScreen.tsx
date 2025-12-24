/**
 * Lock Screen - Biometric authentication screen
 * Shows when app lock is enabled and requires Face ID / Touch ID
 */

import { useState, useEffect, useCallback } from 'react';
import { Lock, Fingerprint, ScanFace, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  authenticateWithBiometrics,
  checkBiometricAvailability,
  getBiometryName,
  type BiometricStatus,
} from '../../services/biometricService';
import { haptic } from '../../utils';

interface LockScreenProps {
  onUnlock: () => void;
  characterEmoji?: string;
  characterName?: string;
}

export function LockScreen({ onUnlock, characterEmoji = '📔', characterName = 'Julir' }: LockScreenProps) {
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState(false);

  const handleAuthenticate = useCallback(async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setError(null);
    setShowRetry(false);
    haptic('light');

    const result = await authenticateWithBiometrics('Unlock your diary');

    setIsAuthenticating(false);

    if (result.success) {
      haptic('success');
      onUnlock();
    } else {
      haptic('error');
      setError(result.error || 'Authentication failed');
      setShowRetry(true);
    }
  }, [isAuthenticating, onUnlock]);

  // Check biometric availability on mount and auto-trigger
  useEffect(() => {
    checkBiometricAvailability().then(status => {
      setBiometricStatus(status);
      // Auto-trigger authentication if biometrics available
      if (status.isAvailable) {
        handleAuthenticate();
      }
    });
  }, [handleAuthenticate]);

  // Get the appropriate icon based on biometry type
  const getBiometricIcon = () => {
    switch (biometricStatus?.biometryType) {
      case 'face':
        return <ScanFace size={48} className="text-white" />;
      case 'fingerprint':
        return <Fingerprint size={48} className="text-white" />;
      case 'iris':
        return <Eye size={48} className="text-white" />;
      default:
        return <Lock size={48} className="text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-10 bg-pink-500" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-10 bg-purple-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        {/* App icon */}
        <div className="mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-4xl shadow-2xl">
            {characterEmoji}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-serif font-bold text-white mb-2">
          {characterName}
        </h1>
        <p className="text-stone-400 text-sm mb-12">
          Your diary is locked
        </p>

        {/* Biometric button */}
        <button
          type="button"
          onClick={handleAuthenticate}
          disabled={isAuthenticating || !biometricStatus?.isAvailable}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isAuthenticating
              ? 'bg-stone-700 scale-95'
              : 'bg-gradient-to-br from-pink-500 to-rose-600 hover:scale-105 active:scale-95'
          } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAuthenticating ? (
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            getBiometricIcon()
          )}

          {/* Pulse animation when not authenticating */}
          {!isAuthenticating && biometricStatus?.isAvailable && (
            <span className="absolute inset-0 rounded-full animate-ping bg-pink-500/20" />
          )}
        </button>

        {/* Biometry type label */}
        <p className="text-stone-300 text-sm mt-6 font-medium">
          {isAuthenticating
            ? 'Authenticating...'
            : biometricStatus?.isAvailable
            ? `Tap to unlock with ${getBiometryName(biometricStatus.biometryType)}`
            : 'Biometrics not available'}
        </p>

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Retry button */}
        {showRetry && (
          <button
            type="button"
            onClick={handleAuthenticate}
            className="mt-4 px-6 py-2 rounded-full text-sm font-medium text-white bg-stone-700 hover:bg-stone-600 transition-colors"
          >
            Try Again
          </button>
        )}

        {/* Security notice */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2 text-stone-500 text-xs">
          <ShieldCheck size={14} />
          <span>Your entries are encrypted and secure</span>
        </div>
      </div>
    </div>
  );
}
