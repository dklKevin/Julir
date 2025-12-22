/**
 * Text utility functions for processing and formatting.
 */

import { JULIR_PHONETIC, TRANSCRIPT_CORRECTIONS } from '../constants';

/**
 * Correct common speech recognition mistakes in transcript.
 * @param text - Raw transcript text
 * @returns Corrected text
 */
export const correctTranscript = (text: string): string => {
  let corrected = text;

  for (const [mistake, correction] of Object.entries(TRANSCRIPT_CORRECTIONS)) {
    const regex = new RegExp(`\\b${mistake}\\b`, 'gi');
    corrected = corrected.replace(regex, correction);
  }

  return corrected;
};

/**
 * Prepare text for speech synthesis.
 * Converts names to phonetic versions and removes problematic characters.
 * @param text - Text to prepare
 * @returns Speech-ready text
 */
export const prepareForSpeech = (text: string): string => {
  return text
    .replace(/Julir/gi, JULIR_PHONETIC)
    .replace(/~/g, ''); // Tilde is spoken as "tilda"
};

/**
 * Generate unique ID for messages/entries.
 * @returns Unique ID string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Format date for display.
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display.
 * @param date - Date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get time-based greeting.
 * @param date - Current date
 * @returns Appropriate greeting
 */
export const getTimeGreeting = (date: Date = new Date()): string => {
  const hour = date.getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Late night thoughts';
};

/**
 * Truncate text to a maximum length.
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Safely parse JSON with fallback.
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed value or fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/** Maximum allowed name length */
const MAX_NAME_LENGTH = 50;

/**
 * Sanitize and validate a user name.
 * - Trims whitespace
 * - Limits length to prevent UI issues
 * - Removes potentially problematic characters
 * @param name - Raw name input
 * @returns Sanitized name
 */
export const sanitizeName = (name: string | null | undefined): string => {
  if (!name) return '';

  return name
    .trim()
    .substring(0, MAX_NAME_LENGTH)
    .replace(/[<>{}[\]\\]/g, '') // Remove potentially problematic characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Get a safe display name with optional fallback.
 * @param name - User's name
 * @param fallback - Optional fallback if name is empty
 * @returns Display-safe name or fallback
 */
export const getDisplayName = (name: string | null | undefined, fallback?: string): string => {
  const sanitized = sanitizeName(name);
  return sanitized || fallback || '';
};

/**
 * Check if a name is valid (non-empty after sanitization).
 * @param name - Name to check
 * @returns True if name is valid
 */
export const isValidName = (name: string | null | undefined): boolean => {
  return sanitizeName(name).length > 0;
};
