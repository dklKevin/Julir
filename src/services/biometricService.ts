/**
 * Biometric Authentication Service
 * Provides Face ID / Touch ID authentication for app locking.
 * Falls back gracefully on unsupported platforms.
 */

import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

export interface BiometricStatus {
  isAvailable: boolean;
  biometryType: 'face' | 'fingerprint' | 'iris' | 'none';
  errorMessage?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

// Check if running on native platform
const isNative = Capacitor.isNativePlatform();

/**
 * Check if biometric authentication is available
 */
export async function checkBiometricAvailability(): Promise<BiometricStatus> {
  if (!isNative) {
    return {
      isAvailable: false,
      biometryType: 'none',
      errorMessage: 'Biometric authentication requires the native iOS app',
    };
  }

  try {
    const result = await NativeBiometric.isAvailable();

    let biometryType: 'face' | 'fingerprint' | 'iris' | 'none' = 'none';

    switch (result.biometryType) {
      case BiometryType.FACE_ID:
      case BiometryType.FACE_AUTHENTICATION:
        biometryType = 'face';
        break;
      case BiometryType.TOUCH_ID:
      case BiometryType.FINGERPRINT:
        biometryType = 'fingerprint';
        break;
      case BiometryType.IRIS:
        biometryType = 'iris';
        break;
      default:
        biometryType = 'none';
    }

    return {
      isAvailable: result.isAvailable,
      biometryType,
      errorMessage: result.isAvailable ? undefined : result.errorCode?.toString(),
    };
  } catch (error) {
    return {
      isAvailable: false,
      biometryType: 'none',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Authenticate using biometrics (Face ID / Touch ID)
 */
export async function authenticateWithBiometrics(
  reason: string = 'Unlock your diary'
): Promise<AuthResult> {
  if (!isNative) {
    return {
      success: false,
      error: 'Biometric authentication requires the native iOS app',
    };
  }

  try {
    // First check availability
    const availability = await checkBiometricAvailability();
    if (!availability.isAvailable) {
      return {
        success: false,
        error: availability.errorMessage || 'Biometrics not available',
      };
    }

    // Perform authentication
    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Julir',
      subtitle: 'Unlock your diary',
      description: 'Use Face ID or Touch ID to access your diary entries',
      maxAttempts: 3,
      useFallback: true, // Allow passcode fallback
    });

    return { success: true };
  } catch (error) {
    // User cancelled or authentication failed
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

    // Check for specific error cases
    if (errorMessage.includes('cancel') || errorMessage.includes('Cancel')) {
      return { success: false, error: 'Authentication cancelled' };
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Store credentials securely using device biometrics
 * This can be used to store encryption keys
 */
export async function storeSecureCredentials(
  server: string,
  username: string,
  password: string
): Promise<boolean> {
  if (!isNative) return false;

  try {
    await NativeBiometric.setCredentials({
      server,
      username,
      password,
    });
    return true;
  } catch (error) {
    console.error('Failed to store credentials:', error);
    return false;
  }
}

/**
 * Retrieve stored credentials (requires biometric authentication)
 */
export async function getSecureCredentials(
  server: string
): Promise<{ username: string; password: string } | null> {
  if (!isNative) return null;

  try {
    const credentials = await NativeBiometric.getCredentials({ server });
    return {
      username: credentials.username,
      password: credentials.password,
    };
  } catch (error) {
    console.error('Failed to get credentials:', error);
    return null;
  }
}

/**
 * Delete stored credentials
 */
export async function deleteSecureCredentials(server: string): Promise<boolean> {
  if (!isNative) return false;

  try {
    await NativeBiometric.deleteCredentials({ server });
    return true;
  } catch (error) {
    console.error('Failed to delete credentials:', error);
    return false;
  }
}

/**
 * Get a user-friendly name for the biometry type
 */
export function getBiometryName(type: BiometricStatus['biometryType']): string {
  switch (type) {
    case 'face':
      return 'Face ID';
    case 'fingerprint':
      return 'Touch ID';
    case 'iris':
      return 'Iris Scan';
    default:
      return 'Biometrics';
  }
}

/**
 * Get the appropriate icon name for the biometry type
 */
export function getBiometryIcon(type: BiometricStatus['biometryType']): string {
  switch (type) {
    case 'face':
      return 'scan-face';
    case 'fingerprint':
      return 'fingerprint';
    case 'iris':
      return 'eye';
    default:
      return 'lock';
  }
}
