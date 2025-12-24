/**
 * Database Service - SQLite storage with encryption
 * Provides persistent, encrypted storage for diary entries and settings.
 * Falls back to localStorage on web platform.
 */

import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import type { DiaryEntry, UserProfile } from '../types';

// Database configuration
const DB_NAME = 'julir_diary';
const DB_VERSION = 1;

// Encryption key (in production, derive from user's biometric or secure enclave)
// This is a placeholder - real implementation should use Keychain
const ENCRYPTION_KEY = 'julir-secure-key-2025';

// SQLite connection singleton
let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;
let isInitialized = false;

// Check if we're on a native platform
const isNative = Capacitor.isNativePlatform();

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<boolean> {
  if (isInitialized) return true;

  if (!isNative) {
    // On web, we'll use localStorage fallback
    isInitialized = true;
    return true;
  }

  try {
    sqlite = new SQLiteConnection(CapacitorSQLite);

    // Check connection consistency
    const retCC = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    if (retCC.result && isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(
        DB_NAME,
        true, // encrypted
        'no-encryption', // We'll add encryption separately
        DB_VERSION,
        false // not read-only
      );
    }

    await db.open();

    // Create tables
    await createTables();

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Fall back to localStorage
    isInitialized = true;
    return false;
  }
}

/**
 * Create database tables
 */
async function createTables(): Promise<void> {
  if (!db) return;

  const createEntriesTable = `
    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      content_encrypted TEXT,
      mood TEXT,
      character_id TEXT,
      summary_style_id TEXT,
      is_pinned INTEGER DEFAULT 0,
      tags TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProfileTable = `
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT,
      created_at TEXT,
      last_active_at TEXT
    );
  `;

  await db.execute(createEntriesTable);
  await db.execute(createSettingsTable);
  await db.execute(createProfileTable);
}

/**
 * Simple XOR encryption for diary content
 * Note: In production, use proper AES encryption with Keychain-stored keys
 */
function encryptContent(content: string, key: string): string {
  let result = '';
  for (let i = 0; i < content.length; i++) {
    result += String.fromCharCode(content.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
}

function decryptContent(encrypted: string, key: string): string {
  try {
    const decoded = atob(encrypted); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return encrypted; // Return as-is if decryption fails
  }
}

// ============================================================================
// DIARY ENTRIES
// ============================================================================

/**
 * Save a diary entry (encrypted)
 */
export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
  if (!isNative || !db) {
    // Fallback to localStorage with encryption
    const entries = getDiaryEntriesFromLocalStorage();
    const encrypted = {
      ...entry,
      content: encryptContent(entry.content, ENCRYPTION_KEY),
    };
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = encrypted;
    } else {
      entries.unshift(encrypted);
    }
    localStorage.setItem('julir_entries_encrypted', JSON.stringify(entries));
    return;
  }

  const encryptedContent = encryptContent(entry.content, ENCRYPTION_KEY);
  const tags = entry.tags ? JSON.stringify(entry.tags) : null;

  const sql = `
    INSERT OR REPLACE INTO diary_entries
    (id, date, title, content, content_encrypted, mood, character_id, summary_style_id, is_pinned, tags, updated_at)
    VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  await db.run(sql, [
    entry.id,
    entry.date,
    entry.title,
    encryptedContent,
    entry.mood || null,
    entry.characterId || null,
    entry.summaryStyleId || null,
    entry.isPinned ? 1 : 0,
    tags,
  ]);
}

/**
 * Get all diary entries (decrypted)
 */
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  if (!isNative || !db) {
    return getDiaryEntriesFromLocalStorage();
  }

  try {
    const result = await db.query('SELECT * FROM diary_entries ORDER BY created_at DESC');

    if (!result.values) return [];

    return result.values.map(row => ({
      id: row.id,
      date: row.date,
      title: row.title,
      content: row.content_encrypted
        ? decryptContent(row.content_encrypted, ENCRYPTION_KEY)
        : row.content,
      mood: row.mood || undefined,
      characterId: row.character_id || undefined,
      summaryStyleId: row.summary_style_id || undefined,
      isPinned: row.is_pinned === 1,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
    }));
  } catch (error) {
    console.error('Failed to get diary entries:', error);
    return getDiaryEntriesFromLocalStorage();
  }
}

/**
 * Delete a diary entry
 */
export async function deleteDiaryEntry(id: string): Promise<void> {
  if (!isNative || !db) {
    const entries = getDiaryEntriesFromLocalStorage();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem('julir_entries_encrypted', JSON.stringify(filtered));
    return;
  }

  await db.run('DELETE FROM diary_entries WHERE id = ?', [id]);
}

/**
 * Helper to get entries from localStorage with decryption
 */
function getDiaryEntriesFromLocalStorage(): DiaryEntry[] {
  try {
    // Try encrypted storage first
    const encrypted = localStorage.getItem('julir_entries_encrypted');
    if (encrypted) {
      const entries = JSON.parse(encrypted);
      return entries.map((e: DiaryEntry) => ({
        ...e,
        content: decryptContent(e.content, ENCRYPTION_KEY),
      }));
    }

    // Fall back to unencrypted (migrate on next save)
    const unencrypted = localStorage.getItem('julir_entries');
    if (unencrypted) {
      return JSON.parse(unencrypted);
    }

    return [];
  } catch {
    return [];
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Save a setting
 */
export async function saveSetting(key: string, value: string): Promise<void> {
  if (!isNative || !db) {
    localStorage.setItem(`julir_${key}`, value);
    return;
  }

  await db.run(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
    [key, value]
  );
}

/**
 * Get a setting
 */
export async function getSetting(key: string): Promise<string | null> {
  if (!isNative || !db) {
    return localStorage.getItem(`julir_${key}`);
  }

  try {
    const result = await db.query('SELECT value FROM settings WHERE key = ?', [key]);
    return result.values?.[0]?.value || null;
  } catch {
    return localStorage.getItem(`julir_${key}`);
  }
}

/**
 * Get all settings as object
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  if (!isNative || !db) {
    const settings: Record<string, string> = {};
    const keys = ['character', 'theme', 'voice_speed', 'sound', 'gemini_key', 'tts_key', 'summary_style', 'biometric_enabled'];
    for (const key of keys) {
      const value = localStorage.getItem(`julir_${key}`);
      if (value) settings[key] = value;
    }
    return settings;
  }

  try {
    const result = await db.query('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    result.values?.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  } catch {
    return {};
  }
}

// ============================================================================
// USER PROFILE
// ============================================================================

/**
 * Save user profile
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!isNative || !db) {
    localStorage.setItem('julir_user_profile', JSON.stringify(profile));
    return;
  }

  await db.run(
    `INSERT OR REPLACE INTO user_profile (id, name, created_at, last_active_at) VALUES (1, ?, ?, ?)`,
    [
      profile.name,
      profile.createdAt instanceof Date ? profile.createdAt.toISOString() : profile.createdAt,
      profile.lastActiveAt instanceof Date ? profile.lastActiveAt.toISOString() : profile.lastActiveAt,
    ]
  );
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  if (!isNative || !db) {
    const stored = localStorage.getItem('julir_user_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastActiveAt: new Date(parsed.lastActiveAt),
      };
    }
    return null;
  }

  try {
    const result = await db.query('SELECT * FROM user_profile WHERE id = 1');
    if (!result.values?.[0]) return null;

    const row = result.values[0];
    return {
      name: row.name || '',
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.last_active_at),
    };
  } catch {
    return null;
  }
}

// ============================================================================
// MIGRATION
// ============================================================================

/**
 * Migrate data from localStorage to SQLite
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (!isNative || !db) return;

  try {
    // Migrate entries
    const entriesJson = localStorage.getItem('julir_entries');
    if (entriesJson) {
      const entries: DiaryEntry[] = JSON.parse(entriesJson);
      for (const entry of entries) {
        await saveDiaryEntry(entry);
      }
      // Keep localStorage as backup, but mark as migrated
      localStorage.setItem('julir_entries_migrated', 'true');
    }

    // Migrate settings
    const settingKeys = [
      ['julir_character', 'character'],
      ['julir_theme', 'theme'],
      ['julir_voice_speed', 'voice_speed'],
      ['julir_sound', 'sound'],
      ['julir_gemini_key', 'gemini_key'],
      ['julir_tts_key', 'tts_key'],
      ['julir_summary_style', 'summary_style'],
    ];

    for (const [localKey, dbKey] of settingKeys) {
      const value = localStorage.getItem(localKey);
      if (value) {
        await saveSetting(dbKey, value);
      }
    }

    // Migrate profile
    const profileJson = localStorage.getItem('julir_user_profile');
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      await saveUserProfile({
        ...profile,
        createdAt: new Date(profile.createdAt),
        lastActiveAt: new Date(profile.lastActiveAt),
      });
    }

    console.warn('Migration from localStorage complete');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
  if (sqlite) {
    await sqlite.closeConnection(DB_NAME, false);
    sqlite = null;
  }
  isInitialized = false;
}
