/**
 * Application configuration constants.
 * Centralized configuration for easy maintenance.
 *
 * Environment variables are loaded from .env files via Vite.
 * All VITE_ prefixed env vars are available at build time.
 */

import type { AppSettings, UserProfile } from '../types';
import { DEFAULT_CHARACTER } from './characters';
import { DEFAULT_THEME } from './theme';

/**
 * Type-safe environment variable getter with fallback
 */
const getEnv = (key: string, fallback: string): string => {
  return import.meta.env[key] ?? fallback;
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : fallback;
};

const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

/** localStorage keys */
export const STORAGE_KEYS = {
  ENTRIES: 'julir_entries',
  GEMINI_KEY: 'julir_gemini_key',
  TTS_KEY: 'julir_tts_key',
  USER_PROFILE: 'julir_user_profile',
  SETTINGS: 'julir_settings',
} as const;

/** API endpoints - configurable via environment variables */
export const API_ENDPOINTS = {
  GEMINI: getEnv(
    'VITE_GEMINI_API_ENDPOINT',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  ),
  GOOGLE_TTS: getEnv(
    'VITE_GOOGLE_TTS_ENDPOINT',
    'https://texttospeech.googleapis.com/v1/text:synthesize'
  ),
} as const;

/** Speech recognition settings - configurable via environment variables */
export const SPEECH_CONFIG = {
  /** Language for speech recognition */
  LANGUAGE: getEnv('VITE_SPEECH_LANGUAGE', 'en-US'),
  /** Silence timeout before auto-stop (ms) */
  SILENCE_TIMEOUT: getEnvNumber('VITE_SILENCE_TIMEOUT', 4000),
  /** Maximum recording duration (ms) */
  MAX_DURATION: getEnvNumber('VITE_MAX_RECORDING_DURATION', 60000),
  /** Delay after speech ends before auto-listening (ms) */
  AUTO_LISTEN_DELAY: getEnvNumber('VITE_AUTO_LISTEN_DELAY', 2500),
} as const;

/** Feature flags - configurable via environment variables */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
  ENABLE_ERROR_TRACKING: getEnvBoolean('VITE_ENABLE_ERROR_TRACKING', false),
  DEMO_MODE: getEnvBoolean('VITE_DEMO_MODE', false),
} as const;

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  selectedCharacter: DEFAULT_CHARACTER,
  theme: DEFAULT_THEME,
  soundEnabled: true,
  geminiApiKey: getEnv('VITE_GEMINI_API_KEY', ''),
  googleTtsApiKey: getEnv('VITE_GOOGLE_TTS_API_KEY', ''),
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

/** App metadata - uses environment variables with fallbacks */
export const APP_INFO = {
  NAME: getEnv('VITE_APP_NAME', 'Julir'),
  DESCRIPTION: getEnv('VITE_APP_DESCRIPTION', 'Your voice companion for daily reflections'),
  VERSION: getEnv('VITE_APP_VERSION', '2.0.0'),
} as const;

/** External service configuration */
export const EXTERNAL_SERVICES = {
  GOOGLE_ANALYTICS_ID: getEnv('VITE_GOOGLE_ANALYTICS_ID', ''),
  SENTRY_DSN: getEnv('VITE_SENTRY_DSN', ''),
} as const;

/** Build information (injected at build time) */
export const BUILD_INFO = {
  VERSION: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : APP_INFO.VERSION,
  BUILD_TIME: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString(),
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;
