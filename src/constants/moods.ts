/**
 * Mood Definitions for Diary Entries
 * Each mood has an emoji, color scheme, and descriptive label.
 */

import type { MoodId, Mood } from '../types';

/**
 * The available moods for diary entries.
 * Organized in a spectrum from positive to challenging emotions.
 */
export const MOODS: Record<MoodId, Mood> = {
  joyful: {
    id: 'joyful',
    emoji: '😊',
    label: 'Joyful',
    description: 'Happy, delighted, content',
    color: 'amber',
    intensity: 'positive',
  },
  excited: {
    id: 'excited',
    emoji: '🤩',
    label: 'Excited',
    description: 'Energized, enthusiastic, pumped',
    color: 'orange',
    intensity: 'positive',
  },
  grateful: {
    id: 'grateful',
    emoji: '🙏',
    label: 'Grateful',
    description: 'Thankful, appreciative, blessed',
    color: 'emerald',
    intensity: 'positive',
  },
  peaceful: {
    id: 'peaceful',
    emoji: '😌',
    label: 'Peaceful',
    description: 'Calm, serene, at ease',
    color: 'sky',
    intensity: 'positive',
  },
  hopeful: {
    id: 'hopeful',
    emoji: '🌟',
    label: 'Hopeful',
    description: 'Optimistic, looking forward',
    color: 'violet',
    intensity: 'positive',
  },
  loved: {
    id: 'loved',
    emoji: '🥰',
    label: 'Loved',
    description: 'Cherished, connected, warm',
    color: 'pink',
    intensity: 'positive',
  },
  neutral: {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    description: 'Okay, balanced, steady',
    color: 'slate',
    intensity: 'neutral',
  },
  thoughtful: {
    id: 'thoughtful',
    emoji: '🤔',
    label: 'Thoughtful',
    description: 'Reflective, contemplative, pensive',
    color: 'indigo',
    intensity: 'neutral',
  },
  tired: {
    id: 'tired',
    emoji: '😴',
    label: 'Tired',
    description: 'Exhausted, drained, sleepy',
    color: 'zinc',
    intensity: 'neutral',
  },
  anxious: {
    id: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    description: 'Worried, nervous, uneasy',
    color: 'yellow',
    intensity: 'challenging',
  },
  frustrated: {
    id: 'frustrated',
    emoji: '😤',
    label: 'Frustrated',
    description: 'Annoyed, irritated, stuck',
    color: 'red',
    intensity: 'challenging',
  },
  sad: {
    id: 'sad',
    emoji: '😢',
    label: 'Sad',
    description: 'Down, melancholy, blue',
    color: 'blue',
    intensity: 'challenging',
  },
  stressed: {
    id: 'stressed',
    emoji: '😫',
    label: 'Stressed',
    description: 'Overwhelmed, pressured, tense',
    color: 'rose',
    intensity: 'challenging',
  },
  lonely: {
    id: 'lonely',
    emoji: '🥺',
    label: 'Lonely',
    description: 'Isolated, disconnected, alone',
    color: 'purple',
    intensity: 'challenging',
  },
};

/**
 * Get all mood IDs
 */
export const getMoodIds = (): MoodId[] => {
  return Object.keys(MOODS) as MoodId[];
};

/**
 * Get moods grouped by intensity
 */
export const getMoodsByIntensity = () => {
  const positive = getMoodIds().filter((id) => MOODS[id].intensity === 'positive');
  const neutral = getMoodIds().filter((id) => MOODS[id].intensity === 'neutral');
  const challenging = getMoodIds().filter((id) => MOODS[id].intensity === 'challenging');
  return { positive, neutral, challenging };
};

/**
 * Get a specific mood by ID
 */
export const getMood = (id: MoodId): Mood => {
  return MOODS[id];
};

/**
 * Get color classes for a mood
 */
export const getMoodColors = (moodId: MoodId, isDark: boolean) => {
  const mood = MOODS[moodId];
  const colorMap: Record<string, { bg: string; text: string; border: string; soft: string }> = {
    amber: {
      bg: isDark ? 'bg-amber-500' : 'bg-amber-400',
      text: isDark ? 'text-amber-400' : 'text-amber-600',
      border: isDark ? 'border-amber-700' : 'border-amber-300',
      soft: isDark ? 'bg-amber-900/30' : 'bg-amber-100',
    },
    orange: {
      bg: isDark ? 'bg-orange-500' : 'bg-orange-400',
      text: isDark ? 'text-orange-400' : 'text-orange-600',
      border: isDark ? 'border-orange-700' : 'border-orange-300',
      soft: isDark ? 'bg-orange-900/30' : 'bg-orange-100',
    },
    emerald: {
      bg: isDark ? 'bg-emerald-500' : 'bg-emerald-400',
      text: isDark ? 'text-emerald-400' : 'text-emerald-600',
      border: isDark ? 'border-emerald-700' : 'border-emerald-300',
      soft: isDark ? 'bg-emerald-900/30' : 'bg-emerald-100',
    },
    sky: {
      bg: isDark ? 'bg-sky-500' : 'bg-sky-400',
      text: isDark ? 'text-sky-400' : 'text-sky-600',
      border: isDark ? 'border-sky-700' : 'border-sky-300',
      soft: isDark ? 'bg-sky-900/30' : 'bg-sky-100',
    },
    violet: {
      bg: isDark ? 'bg-violet-500' : 'bg-violet-400',
      text: isDark ? 'text-violet-400' : 'text-violet-600',
      border: isDark ? 'border-violet-700' : 'border-violet-300',
      soft: isDark ? 'bg-violet-900/30' : 'bg-violet-100',
    },
    pink: {
      bg: isDark ? 'bg-pink-500' : 'bg-pink-400',
      text: isDark ? 'text-pink-400' : 'text-pink-600',
      border: isDark ? 'border-pink-700' : 'border-pink-300',
      soft: isDark ? 'bg-pink-900/30' : 'bg-pink-100',
    },
    slate: {
      bg: isDark ? 'bg-slate-500' : 'bg-slate-400',
      text: isDark ? 'text-slate-400' : 'text-slate-600',
      border: isDark ? 'border-slate-700' : 'border-slate-300',
      soft: isDark ? 'bg-slate-800/50' : 'bg-slate-100',
    },
    indigo: {
      bg: isDark ? 'bg-indigo-500' : 'bg-indigo-400',
      text: isDark ? 'text-indigo-400' : 'text-indigo-600',
      border: isDark ? 'border-indigo-700' : 'border-indigo-300',
      soft: isDark ? 'bg-indigo-900/30' : 'bg-indigo-100',
    },
    zinc: {
      bg: isDark ? 'bg-zinc-500' : 'bg-zinc-400',
      text: isDark ? 'text-zinc-400' : 'text-zinc-600',
      border: isDark ? 'border-zinc-700' : 'border-zinc-300',
      soft: isDark ? 'bg-zinc-800/50' : 'bg-zinc-100',
    },
    yellow: {
      bg: isDark ? 'bg-yellow-500' : 'bg-yellow-400',
      text: isDark ? 'text-yellow-400' : 'text-yellow-600',
      border: isDark ? 'border-yellow-700' : 'border-yellow-300',
      soft: isDark ? 'bg-yellow-900/30' : 'bg-yellow-100',
    },
    red: {
      bg: isDark ? 'bg-red-500' : 'bg-red-400',
      text: isDark ? 'text-red-400' : 'text-red-600',
      border: isDark ? 'border-red-700' : 'border-red-300',
      soft: isDark ? 'bg-red-900/30' : 'bg-red-100',
    },
    blue: {
      bg: isDark ? 'bg-blue-500' : 'bg-blue-400',
      text: isDark ? 'text-blue-400' : 'text-blue-600',
      border: isDark ? 'border-blue-700' : 'border-blue-300',
      soft: isDark ? 'bg-blue-900/30' : 'bg-blue-100',
    },
    rose: {
      bg: isDark ? 'bg-rose-500' : 'bg-rose-400',
      text: isDark ? 'text-rose-400' : 'text-rose-600',
      border: isDark ? 'border-rose-700' : 'border-rose-300',
      soft: isDark ? 'bg-rose-900/30' : 'bg-rose-100',
    },
    purple: {
      bg: isDark ? 'bg-purple-500' : 'bg-purple-400',
      text: isDark ? 'text-purple-400' : 'text-purple-600',
      border: isDark ? 'border-purple-700' : 'border-purple-300',
      soft: isDark ? 'bg-purple-900/30' : 'bg-purple-100',
    },
  };

  return colorMap[mood.color] || colorMap.slate;
};

/**
 * Calculate mood statistics from entries
 */
export interface MoodStats {
  totalEntries: number;
  entriesWithMood: number;
  moodCounts: Record<MoodId, number>;
  mostFrequentMood: MoodId | null;
  positivePercentage: number;
  neutralPercentage: number;
  challengingPercentage: number;
  currentStreak: number;
  longestStreak: number;
  recentMoods: { date: string; mood: MoodId }[];
}

export const calculateMoodStats = (entries: Array<{ date: string; mood?: string }>): MoodStats => {
  const moodCounts: Record<MoodId, number> = {} as Record<MoodId, number>;
  getMoodIds().forEach((id) => (moodCounts[id] = 0));

  let entriesWithMood = 0;
  const recentMoods: { date: string; mood: MoodId }[] = [];

  // Count moods
  entries.forEach((entry) => {
    if (entry.mood && entry.mood in MOODS) {
      const moodId = entry.mood as MoodId;
      moodCounts[moodId]++;
      entriesWithMood++;
      recentMoods.push({ date: entry.date, mood: moodId });
    }
  });

  // Find most frequent mood
  let mostFrequentMood: MoodId | null = null;
  let maxCount = 0;
  getMoodIds().forEach((id) => {
    if (moodCounts[id] > maxCount) {
      maxCount = moodCounts[id];
      mostFrequentMood = id;
    }
  });

  // Calculate percentages by intensity
  const { positive, neutral, challenging } = getMoodsByIntensity();
  const positiveCount = positive.reduce((sum, id) => sum + moodCounts[id], 0);
  const neutralCount = neutral.reduce((sum, id) => sum + moodCounts[id], 0);
  const challengingCount = challenging.reduce((sum, id) => sum + moodCounts[id], 0);

  const positivePercentage = entriesWithMood > 0 ? Math.round((positiveCount / entriesWithMood) * 100) : 0;
  const neutralPercentage = entriesWithMood > 0 ? Math.round((neutralCount / entriesWithMood) * 100) : 0;
  const challengingPercentage = entriesWithMood > 0 ? Math.round((challengingCount / entriesWithMood) * 100) : 0;

  // Calculate streaks (consecutive days with entries)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Check if today or yesterday has an entry for current streak
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
  const hasRecentEntry = sortedEntries.some(e => e.date === today || e.date === yesterday);

  if (hasRecentEntry) {
    // Calculate current streak
    let lastDate: Date | null = null;
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      if (lastDate === null) {
        currentStreak = 1;
        lastDate = entryDate;
      } else {
        const diffDays = Math.round((lastDate.getTime() - entryDate.getTime()) / 86400000);
        if (diffDays === 1) {
          currentStreak++;
          lastDate = entryDate;
        } else {
          break;
        }
      }
    }
  }

  // Calculate longest streak
  let prevDate: Date | null = null;
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((prevDate.getTime() - entryDate.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    prevDate = entryDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    totalEntries: entries.length,
    entriesWithMood,
    moodCounts,
    mostFrequentMood,
    positivePercentage,
    neutralPercentage,
    challengingPercentage,
    currentStreak,
    longestStreak,
    recentMoods: recentMoods.slice(0, 7), // Last 7 entries with moods
  };
};
