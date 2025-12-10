/**
 * Application configuration constants.
 * Centralized configuration for easy maintenance.
 */

import type { AppSettings, UserProfile } from '../types';
import { DEFAULT_CHARACTER } from './characters';
import { DEFAULT_THEME } from './theme';

/** localStorage keys */
export const STORAGE_KEYS = {
  ENTRIES: 'julir_entries',
  GEMINI_KEY: 'julir_gemini_key',
  TTS_KEY: 'julir_tts_key',
  USER_PROFILE: 'julir_user_profile',
  SETTINGS: 'julir_settings',
} as const;

/** API endpoints */
export const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  GOOGLE_TTS: 'https://texttospeech.googleapis.com/v1/text:synthesize',
} as const;

/** Speech recognition settings */
export const SPEECH_CONFIG = {
  /** Language for speech recognition */
  LANGUAGE: 'en-US',
  /** Silence timeout before auto-stop (ms) */
  SILENCE_TIMEOUT: 4000,
  /** Maximum recording duration (ms) */
  MAX_DURATION: 60000,
  /** Delay after speech ends before auto-listening (ms) */
  AUTO_LISTEN_DELAY: 2500,
} as const;

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  selectedCharacter: DEFAULT_CHARACTER,
  theme: DEFAULT_THEME,
  soundEnabled: true,
  geminiApiKey: '',
  googleTtsApiKey: '',
};

/** Default user profile */
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  createdAt: new Date(),
  lastActiveAt: new Date(),
};

/** Diary generation prompt template */
export const DIARY_PROMPT = `Based on this conversation, write a SHORT diary entry (3-5 sentences max) in first person.

RULES:
- Only include what the USER actually said - their words, their experiences
- Do NOT add interpretation or assumed feelings
- Keep it simple and factual
- Use the user's own language when possible
- Format: Start with "Today," then summarize what they shared

Conversation:`;

/** Words to correct in transcription (speech recognition often mishears "Julir") */
export const TRANSCRIPT_CORRECTIONS: Record<string, string> = {
  julia: 'Julir',
  julie: 'Julir',
  jeweler: 'Julir',
  jewelers: 'Julir',
};

/** App metadata */
export const APP_INFO = {
  NAME: 'Julir',
  DESCRIPTION: 'Your voice companion for daily reflections',
  VERSION: '2.0.0',
} as const;
