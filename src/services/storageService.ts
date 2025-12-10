/**
 * Service for managing localStorage operations.
 * Provides type-safe access to persisted data.
 */

import type { DiaryEntry, UserProfile, AppSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_USER_PROFILE } from '../constants';
import { safeJsonParse } from '../utils/textUtils';

/**
 * Storage service for managing persisted data.
 */
export const StorageService = {
  /**
   * Get all diary entries.
   */
  getEntries(): DiaryEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? safeJsonParse<DiaryEntry[]>(data, []) : [];
  },

  /**
   * Save all diary entries.
   */
  saveEntries(entries: DiaryEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  },

  /**
   * Add a new diary entry.
   */
  addEntry(entry: DiaryEntry): DiaryEntry[] {
    const entries = this.getEntries();
    const updated = [entry, ...entries];
    this.saveEntries(updated);
    return updated;
  },

  /**
   * Update an existing entry.
   */
  updateEntry(id: string, updates: Partial<DiaryEntry>): DiaryEntry[] {
    const entries = this.getEntries();
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    this.saveEntries(updated);
    return updated;
  },

  /**
   * Delete an entry.
   */
  deleteEntry(id: string): DiaryEntry[] {
    const entries = this.getEntries();
    const updated = entries.filter((entry) => entry.id !== id);
    this.saveEntries(updated);
    return updated;
  },

  /**
   * Get user profile.
   */
  getUserProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) return DEFAULT_USER_PROFILE;

    const profile = safeJsonParse<UserProfile>(data, DEFAULT_USER_PROFILE);
    // Convert date strings back to Date objects
    return {
      ...profile,
      createdAt: new Date(profile.createdAt),
      lastActiveAt: new Date(profile.lastActiveAt),
    };
  },

  /**
   * Save user profile.
   */
  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  /**
   * Update user profile.
   */
  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...updates, lastActiveAt: new Date() };
    this.saveUserProfile(updated);
    return updated;
  },

  /**
   * Check if user has completed profile setup.
   */
  hasUserProfile(): boolean {
    const profile = this.getUserProfile();
    return Boolean(profile.name && profile.name.trim().length > 0);
  },

  /**
   * Get app settings.
   */
  getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? safeJsonParse<AppSettings>(data, DEFAULT_SETTINGS) : DEFAULT_SETTINGS;
  },

  /**
   * Save app settings.
   */
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  /**
   * Update app settings.
   */
  updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.saveSettings(updated);
    return updated;
  },

  /**
   * Get Gemini API key (stored separately for security).
   */
  getGeminiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '';
  },

  /**
   * Save Gemini API key.
   */
  saveGeminiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);
  },

  /**
   * Get Google TTS API key (stored separately for security).
   */
  getTtsKey(): string {
    return localStorage.getItem(STORAGE_KEYS.TTS_KEY) || '';
  },

  /**
   * Save Google TTS API key.
   */
  saveTtsKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.TTS_KEY, key);
  },

  /**
   * Clear all stored data.
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
