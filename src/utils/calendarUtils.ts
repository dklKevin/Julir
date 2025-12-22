/**
 * Calendar Utility Functions
 * Helper functions for calendar rendering and date manipulation.
 */

/**
 * Get the number of days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the day of the week (0-6, 0 = Sunday) for the first day of a month
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Get an array of day numbers for a calendar month grid
 * Includes padding for days from previous/next months
 */
export const getCalendarDays = (year: number, month: number): (number | null)[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: (number | null)[] = [];

  // Add empty slots for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add the days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

/**
 * Format a date as a locale string matching the entry date format
 */
export const formatDateKey = (year: number, month: number, day: number): string => {
  return new Date(year, month, day).toLocaleDateString();
};

/**
 * Parse a date string to get year, month, day
 */
export const parseDateString = (dateStr: string): { year: number; month: number; day: number } | null => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
};

/**
 * Get month name from month index
 */
export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

/**
 * Get short month name
 */
export const getShortMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month];
};

/**
 * Get day names for calendar header
 */
export const getDayNames = (short: boolean = true): string[] => {
  if (short) {
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  }
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
};

/**
 * Check if a date is today
 */
export const isToday = (year: number, month: number, day: number): boolean => {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

/**
 * Get previous month
 */
export const getPreviousMonth = (year: number, month: number): { year: number; month: number } => {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
};

/**
 * Get next month
 */
export const getNextMonth = (year: number, month: number): { year: number; month: number } => {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
};

/**
 * Group entries by date
 */
export const groupEntriesByDate = <T extends { date: string }>(
  entries: T[]
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();

  entries.forEach((entry) => {
    const existing = grouped.get(entry.date);
    if (existing) {
      existing.push(entry);
    } else {
      grouped.set(entry.date, [entry]);
    }
  });

  return grouped;
};

/**
 * Get entries for a specific date
 */
export const getEntriesForDate = <T extends { date: string }>(
  entries: T[],
  year: number,
  month: number,
  day: number
): T[] => {
  const dateKey = formatDateKey(year, month, day);
  return entries.filter((entry) => entry.date === dateKey);
};

/**
 * Check if a month has any entries
 */
export const monthHasEntries = <T extends { date: string }>(
  entries: T[],
  year: number,
  month: number
): boolean => {
  return entries.some((entry) => {
    const parsed = parseDateString(entry.date);
    return parsed && parsed.year === year && parsed.month === month;
  });
};

/**
 * Get unique months that have entries
 */
export const getMonthsWithEntries = <T extends { date: string }>(
  entries: T[]
): { year: number; month: number }[] => {
  const months = new Set<string>();

  entries.forEach((entry) => {
    const parsed = parseDateString(entry.date);
    if (parsed) {
      months.add(`${parsed.year}-${parsed.month}`);
    }
  });

  return Array.from(months)
    .map((key) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
};
