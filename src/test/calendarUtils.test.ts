import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getCalendarDays,
  formatDateKey,
  parseDateString,
  getMonthName,
  getShortMonthName,
  getDayNames,
  isToday,
  isFutureDate,
  getPreviousMonth,
  getNextMonth,
  groupEntriesByDate,
  getEntriesForDate,
  monthHasEntries,
  getMonthsWithEntries,
} from '../utils/calendarUtils';

describe('calendarUtils', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts days and first weekday of a month', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28);
    expect(getDaysInMonth(2024, 1)).toBe(29);
    expect(getFirstDayOfMonth(2026, 7)).toBe(new Date(2026, 7, 1).getDay());
  });

  it('builds a padded calendar grid', () => {
    const days = getCalendarDays(2026, 7);
    const firstDay = getFirstDayOfMonth(2026, 7);
    expect(days.slice(0, firstDay).every((d) => d === null)).toBe(true);
    expect(days.filter((d) => d !== null)).toHaveLength(31);
    expect(days[firstDay]).toBe(1);
  });

  it('formats and parses date keys', () => {
    const key = formatDateKey(2026, 7, 20);
    expect(key).toBe(new Date(2026, 7, 20).toLocaleDateString());
    expect(parseDateString('2026-08-20')).toEqual({ year: 2026, month: 7, day: 20 });
    expect(parseDateString('not-a-date')).toBeNull();
  });

  it('returns month and day names', () => {
    expect(getMonthName(0)).toBe('January');
    expect(getMonthName(11)).toBe('December');
    expect(getShortMonthName(7)).toBe('Aug');
    expect(getDayNames()).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    expect(getDayNames(false)[0]).toBe('Sunday');
  });

  it('detects today and future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12));

    expect(isToday(2026, 7, 20)).toBe(true);
    expect(isToday(2026, 7, 19)).toBe(false);
    expect(isFutureDate(2026, 7, 21)).toBe(true);
    expect(isFutureDate(2026, 7, 20)).toBe(false);
    expect(isFutureDate(2026, 7, 19)).toBe(false);
  });

  it('walks months across year boundaries', () => {
    expect(getPreviousMonth(2026, 0)).toEqual({ year: 2025, month: 11 });
    expect(getPreviousMonth(2026, 7)).toEqual({ year: 2026, month: 6 });
    expect(getNextMonth(2026, 11)).toEqual({ year: 2027, month: 0 });
    expect(getNextMonth(2026, 7)).toEqual({ year: 2026, month: 8 });
  });

  it('groups and filters entries by date', () => {
    const aug20 = formatDateKey(2026, 7, 20);
    const entries = [
      { date: aug20, id: 'a' },
      { date: aug20, id: 'b' },
      { date: '2026-08-21', id: 'c' },
      { date: '2026-01-01', id: 'd' },
    ];

    const grouped = groupEntriesByDate(entries);
    expect(grouped.get(aug20)).toHaveLength(2);
    expect(getEntriesForDate(entries, 2026, 7, 20)).toHaveLength(2);
    expect(monthHasEntries(entries, 2026, 7)).toBe(true);
    expect(monthHasEntries(entries, 2026, 2)).toBe(false);

    const months = getMonthsWithEntries(entries);
    expect(months[0]).toEqual({ year: 2026, month: 7 });
    expect(months).toContainEqual({ year: 2026, month: 0 });
  });

  it('skips unparseable dates when listing months', () => {
    expect(getMonthsWithEntries([{ date: 'not-a-date' }])).toEqual([]);
  });
});
