/**
 * Core type definitions for the Julir diary companion app.
 * All types are centralized here for maintainability and type safety.
 */

/** Supported character identifiers */
export type CharacterId = 'julir' | 'solomon' | 'eli' | 'jennifer';

/** Chat message roles */
export type MessageRole = 'user' | 'assistant';

/** Theme options */
export type Theme = 'light' | 'dark';

/** Voice gender options for TTS */
export type VoiceGender = 'FEMALE' | 'MALE';

/** Summary style identifiers for diary generation */
export type SummaryStyleId = 'reflective' | 'upbeat' | 'storyteller' | 'minimal';

/** Mood identifiers for diary entries */
export type MoodId =
  | 'joyful'
  | 'excited'
  | 'grateful'
  | 'peaceful'
  | 'hopeful'
  | 'loved'
  | 'neutral'
  | 'thoughtful'
  | 'tired'
  | 'anxious'
  | 'frustrated'
  | 'sad'
  | 'stressed'
  | 'lonely';

/** Mood intensity levels */
export type MoodIntensity = 'positive' | 'neutral' | 'challenging';

/**
 * Mood definition for diary entries
 */
export interface Mood {
  /** Unique identifier */
  id: MoodId;
  /** Emoji representation */
  emoji: string;
  /** Display label */
  label: string;
  /** Short description */
  description: string;
  /** Color theme key */
  color: string;
  /** Emotional intensity category */
  intensity: MoodIntensity;
}

/**
 * Summary style definition for diary generation
 */
export interface SummaryStyle {
  /** Unique identifier */
  id: SummaryStyleId;
  /** Display name */
  name: string;
  /** Emoji representation */
  emoji: string;
  /** Short description */
  description: string;
  /** Color theme key */
  color: string;
  /** Keywords describing the style */
  keywords: string[];
  /** The prompt template for diary generation */
  prompt: string;
}

/**
 * Chat message structure
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** Who sent the message */
  role: MessageRole;
  /** Message content */
  content: string;
  /** When the message was sent */
  timestamp: Date;
}

/**
 * Saved diary entry structure
 */
export interface DiaryEntry {
  /** Unique identifier */
  id: string;
  /** Display date string */
  date: string;
  /** Entry title (usually the date) */
  title: string;
  /** Full diary content */
  content: string;
  /** Mood for this entry */
  mood?: MoodId;
  /** Character used for this entry */
  characterId?: CharacterId;
  /** Summary style used for generation */
  summaryStyleId?: SummaryStyleId;
  /** Whether entry is pinned/favorited */
  isPinned?: boolean;
  /** Tags for categorization */
  tags?: string[];
}

/**
 * User profile information
 */
export interface UserProfile {
  /** User's display name */
  name: string;
  /** When the profile was created */
  createdAt: Date;
  /** Last time user interacted */
  lastActiveAt: Date;
}

/**
 * Google Cloud TTS voice configuration
 */
export interface VoiceConfig {
  /** Language code (e.g., 'en-US') */
  languageCode: string;
  /** Voice name (e.g., 'en-US-Neural2-F') */
  name: string;
  /** Voice gender */
  ssmlGender: VoiceGender;
  /** Speaking rate (0.25 to 4.0) */
  speakingRate: number;
  /** Pitch adjustment (-20.0 to 20.0) */
  pitch: number;
}

/**
 * Character definition
 */
export interface Character {
  /** Unique identifier */
  id: CharacterId;
  /** Display name */
  name: string;
  /** Three keywords describing personality */
  keywords: [string, string, string];
  /** Emoji representation */
  emoji: string;
  /** Color theme key */
  color: 'rose' | 'amber' | 'sky' | 'purple';
  /** TTS voice configuration */
  voiceConfig: VoiceConfig;
  /** Initial greeting message */
  greeting: string;
  /** System prompt for AI */
  systemPrompt: string;
  /** Demo responses when no API key */
  demoResponses: string[];
}

/**
 * Application settings stored in localStorage
 */
export interface AppSettings {
  /** Selected character */
  selectedCharacter: CharacterId;
  /** UI theme */
  theme: Theme;
  /** Whether sound is enabled */
  soundEnabled: boolean;
  /** Gemini API key */
  geminiApiKey: string;
  /** Google Cloud TTS API key */
  googleTtsApiKey: string;
}

/**
 * Color scheme for a character theme
 */
export interface ColorScheme {
  /** Background gradient/color */
  bg: string;
  /** Paper/card background */
  paper: string;
  /** Accent text color */
  accent: string;
  /** Accent background color */
  accentBg: string;
  /** Border color */
  border: string;
  /** User message bubble */
  userBubble: string;
  /** Soft background for highlights */
  soft: string;
}

/**
 * API response types
 */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export interface TTSResponse {
  audioContent: string;
}

/**
 * Hook return types
 */
export interface UseSpeechRecognitionReturn {
  isRecording: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => void;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}
