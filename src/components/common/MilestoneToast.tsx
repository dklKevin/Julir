/**
 * Milestone Toast - Celebrates user achievements with quick-win moments
 * Shows celebratory toasts for milestones like first entry, streaks, etc.
 */

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Flame, Star, Heart, Zap, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils';

interface Milestone {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const MILESTONES: Record<string, Milestone> = {
  first_entry: {
    id: 'first_entry',
    icon: <Star size={24} />,
    title: 'First Entry!',
    description: 'You\'ve started your journaling journey. Keep it up!',
    color: 'from-amber-400 to-orange-500',
  },
  streak_3: {
    id: 'streak_3',
    icon: <Flame size={24} />,
    title: '3 Day Streak!',
    description: 'You\'re building a great habit. Consistency is key!',
    color: 'from-orange-400 to-red-500',
  },
  streak_7: {
    id: 'streak_7',
    icon: <Flame size={24} />,
    title: 'Week Warrior!',
    description: 'A full week of journaling! You\'re on fire!',
    color: 'from-red-400 to-pink-500',
  },
  streak_30: {
    id: 'streak_30',
    icon: <Trophy size={24} />,
    title: 'Monthly Master!',
    description: '30 days of consistent journaling. Incredible dedication!',
    color: 'from-purple-400 to-indigo-500',
  },
  entries_5: {
    id: 'entries_5',
    icon: <Heart size={24} />,
    title: '5 Entries!',
    description: 'Your journal is growing. Each entry matters.',
    color: 'from-pink-400 to-rose-500',
  },
  entries_10: {
    id: 'entries_10',
    icon: <Zap size={24} />,
    title: '10 Entries!',
    description: 'Double digits! You\'re a dedicated journaler.',
    color: 'from-yellow-400 to-amber-500',
  },
  entries_25: {
    id: 'entries_25',
    icon: <Trophy size={24} />,
    title: '25 Entries!',
    description: 'A quarter century of reflections. Amazing!',
    color: 'from-emerald-400 to-teal-500',
  },
};

const STORAGE_KEY = 'julir-achieved-milestones';

// Helper to get stored milestones - called only once at init
function getInitialAchieved(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

export function MilestoneToast() {
  const { savedEntries, currentStreak, isDark } = useApp();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  // Initialize from localStorage once
  const [achievedMilestones, setAchievedMilestones] = useState<Set<string>>(getInitialAchieved);

  // Check for new milestones when entries or streak changes
  useEffect(() => {
    // Don't show new milestones if one is already active
    if (activeMilestone) return;

    const entryCount = savedEntries.length;
    const newMilestones: string[] = [];

    // Entry count milestones
    if (entryCount >= 1 && !achievedMilestones.has('first_entry')) {
      newMilestones.push('first_entry');
    }
    if (entryCount >= 5 && !achievedMilestones.has('entries_5')) {
      newMilestones.push('entries_5');
    }
    if (entryCount >= 10 && !achievedMilestones.has('entries_10')) {
      newMilestones.push('entries_10');
    }
    if (entryCount >= 25 && !achievedMilestones.has('entries_25')) {
      newMilestones.push('entries_25');
    }

    // Streak milestones
    if (currentStreak >= 3 && !achievedMilestones.has('streak_3')) {
      newMilestones.push('streak_3');
    }
    if (currentStreak >= 7 && !achievedMilestones.has('streak_7')) {
      newMilestones.push('streak_7');
    }
    if (currentStreak >= 30 && !achievedMilestones.has('streak_30')) {
      newMilestones.push('streak_30');
    }

    // Show the first unachieved milestone
    if (newMilestones.length > 0) {
      const milestoneId = newMilestones[0];
      const milestone = MILESTONES[milestoneId];
      if (milestone) {
        // Use timeout to avoid synchronous setState
        const timer = setTimeout(() => {
          haptic('success');
          setActiveMilestone(milestone);

          // Mark as achieved
          const updated = new Set(achievedMilestones);
          updated.add(milestoneId);
          setAchievedMilestones(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [savedEntries.length, currentStreak, achievedMilestones, activeMilestone]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (activeMilestone) {
      const timer = setTimeout(() => {
        setActiveMilestone(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeMilestone]);

  const handleDismiss = useCallback(() => {
    haptic('light');
    setActiveMilestone(null);
  }, []);

  if (!activeMilestone) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl ${
          isDark ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-200'
        }`}
      >
        {/* Icon with gradient background */}
        <div className={`p-2 rounded-xl bg-gradient-to-br ${activeMilestone.color} text-white`}>
          {activeMilestone.icon}
        </div>

        {/* Content */}
        <div className="pr-2">
          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-stone-800'}`}>
            {activeMilestone.title}
          </h3>
          <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {activeMilestone.description}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={`p-1 rounded-full transition ${
            isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-100'
          }`}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
