/**
 * Secure Storage Service
 * Uses iOS Keychain for secure storage of sensitive data like API keys.
 * Supports iCloud Keychain sync for cross-device access.
 */

import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';

// Keys for stored items
export const SECURE_KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
  TTS_API_KEY: 'google_tts_api_key',
  ENCRYPTION_KEY: 'diary_encryption_key',
} as const;

const isNative = Capacitor.isNativePlatform();

/**
 * Initialize secure storage with iCloud sync enabled
 */
export async function initSecureStorage(): Promise<void> {
  if (!isNative) return;

  try {
    // Enable iCloud Keychain sync globally
    await SecureStorage.setSynchronize(true);
  } catch (error) {
    console.error('Failed to initialize secure storage:', error);
  }
}

/**
 * Store a value securely in Keychain
 */
export async function setSecureValue(key: string, value: string): Promise<boolean> {
  if (!isNative) {
    // Fallback to localStorage on web (not secure, but functional)
    localStorage.setItem(`secure_${key}`, value);
    return true;
  }

  try {
    await SecureStorage.set(key, value, true, true); // sync = true, accessibility = true
    return true;
  } catch (error) {
    console.error(`Failed to set secure value for ${key}:`, error);
    return false;
  }
}

/**
 * Get a value from secure storage
 */
export async function getSecureValue(key: string): Promise<string | null> {
  if (!isNative) {
    return localStorage.getItem(`secure_${key}`);
  }

  try {
    const result = await SecureStorage.get(key, true); // sync = true
    return result ?? null;
  } catch (_error) {
    // Key might not exist
    return null;
  }
}

/**
 * Remove a value from secure storage
 */
export async function removeSecureValue(key: string): Promise<boolean> {
  if (!isNative) {
    localStorage.removeItem(`secure_${key}`);
    return true;
  }

  try {
    await SecureStorage.remove(key, true); // sync = true
    return true;
  } catch (error) {
    console.error(`Failed to remove secure value for ${key}:`, error);
    return false;
  }
}

/**
 * Clear all secure storage
 */
export async function clearSecureStorage(): Promise<void> {
  if (!isNative) {
    Object.values(SECURE_KEYS).forEach(key => {
      localStorage.removeItem(`secure_${key}`);
    });
    return;
  }

  try {
    await SecureStorage.clear();
  } catch (error) {
    console.error('Failed to clear secure storage:', error);
  }
}

/**
 * Generate a random encryption key for diary content
 * This key is stored in Keychain and used for AES encryption
 */
export async function getOrCreateEncryptionKey(): Promise<string> {
  let key = await getSecureValue(SECURE_KEYS.ENCRYPTION_KEY);

  if (!key) {
    // Generate a new 256-bit key
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    await setSecureValue(SECURE_KEYS.ENCRYPTION_KEY, key);
  }

  return key;
}

/**
 * Check if secure storage is available
 */
export function isSecureStorageAvailable(): boolean {
  return isNative;
}
