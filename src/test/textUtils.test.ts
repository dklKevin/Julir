import { describe, it, expect } from 'vitest';
import {
  correctTranscript,
  prepareForSpeech,
  generateId,
  formatDate,
  formatTime,
  getTimeGreeting,
  truncate,
  safeJsonParse,
  sanitizeName,
  getDisplayName,
  isValidName,
} from '../utils/textUtils';

describe('textUtils', () => {
  describe('correctTranscript', () => {
    it('corrects common Julir mishearings', () => {
      expect(correctTranscript('Hi Julia')).toBe('Hi Julir');
      expect(correctTranscript('hey julie')).toBe('hey Julir');
      expect(correctTranscript('the jeweler said hi')).toBe('the Julir said hi');
    });

    it('leaves unrelated words alone', () => {
      expect(correctTranscript('hello world')).toBe('hello world');
    });
  });

  describe('prepareForSpeech', () => {
    it('uses the phonetic spelling and strips tildes', () => {
      expect(prepareForSpeech('Julir ~hello~')).toBe('Jewleer hello');
    });
  });

  describe('generateId', () => {
    it('returns a timestamped unique id', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
      expect(generateId()).not.toBe(id);
    });
  });

  describe('formatDate / formatTime', () => {
    it('formats a known date and time', () => {
      const date = new Date(2026, 7, 20, 14, 5);
      expect(formatDate(date)).toMatch(/August/);
      expect(formatDate(date)).toMatch(/2026/);
      expect(formatTime(date)).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('getTimeGreeting', () => {
    it('returns morning, afternoon, evening, and late-night greetings', () => {
      expect(getTimeGreeting(new Date(2026, 0, 1, 8))).toBe('Good morning');
      expect(getTimeGreeting(new Date(2026, 0, 1, 13))).toBe('Good afternoon');
      expect(getTimeGreeting(new Date(2026, 0, 1, 19))).toBe('Good evening');
      expect(getTimeGreeting(new Date(2026, 0, 1, 22))).toBe('Late night thoughts');
    });
  });

  describe('truncate', () => {
    it('returns short text unchanged and truncates long text', () => {
      expect(truncate('short', 10)).toBe('short');
      expect(truncate('abcdefghij', 5)).toBe('abcde...');
    });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON and falls back on invalid input', () => {
      expect(safeJsonParse('{"a":1}', { a: 0 })).toEqual({ a: 1 });
      expect(safeJsonParse('not-json', { a: 0 })).toEqual({ a: 0 });
    });
  });

  describe('name helpers', () => {
    it('sanitizes, validates, and displays names', () => {
      expect(sanitizeName('  Ann<>  ')).toBe('Ann');
      expect(sanitizeName(null)).toBe('');
      expect(sanitizeName('a'.repeat(80)).length).toBe(50);
      expect(getDisplayName('  Sam  ')).toBe('Sam');
      expect(getDisplayName('   ', 'Friend')).toBe('Friend');
      expect(getDisplayName(undefined)).toBe('');
      expect(isValidName('Ada')).toBe(true);
      expect(isValidName('   ')).toBe(false);
    });
  });
});
