/**
 * Theme and color scheme definitions.
 * Provides consistent styling across the application.
 */

import type { ColorScheme, Theme } from '../types';

/**
 * Generate color scheme for a character color in a given theme.
 */
export const getColorScheme = (
  color: 'rose' | 'amber' | 'sky' | 'purple',
  theme: Theme
): ColorScheme => {
  const isDark = theme === 'dark';

  const schemes: Record<typeof color, { light: ColorScheme; dark: ColorScheme }> = {
    rose: {
      light: {
        bg: 'bg-gradient-to-br from-rose-50 via-amber-50/30 to-rose-100/50',
        paper: 'bg-white/80',
        accent: 'text-rose-600',
        accentBg: 'bg-rose-500',
        border: 'border-rose-200/60',
        userBubble: 'bg-gradient-to-br from-rose-500 to-rose-600',
        soft: 'bg-rose-50/80',
      },
      dark: {
        bg: 'bg-stone-950',
        paper: 'bg-stone-900/90',
        accent: 'text-rose-400',
        accentBg: 'bg-rose-500/90',
        border: 'border-stone-800',
        userBubble: 'bg-rose-600/90',
        soft: 'bg-stone-800/50',
      },
    },
    amber: {
      light: {
        bg: 'bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/50',
        paper: 'bg-white/80',
        accent: 'text-amber-700',
        accentBg: 'bg-amber-600',
        border: 'border-amber-200/60',
        userBubble: 'bg-gradient-to-br from-amber-500 to-amber-600',
        soft: 'bg-amber-50/80',
      },
      dark: {
        bg: 'bg-stone-950',
        paper: 'bg-stone-900/90',
        accent: 'text-amber-400',
        accentBg: 'bg-amber-600/90',
        border: 'border-stone-800',
        userBubble: 'bg-amber-600/90',
        soft: 'bg-stone-800/50',
      },
    },
    sky: {
      light: {
        bg: 'bg-gradient-to-br from-sky-50 via-slate-50/30 to-sky-100/50',
        paper: 'bg-white/80',
        accent: 'text-sky-600',
        accentBg: 'bg-sky-500',
        border: 'border-sky-200/60',
        userBubble: 'bg-gradient-to-br from-sky-500 to-sky-600',
        soft: 'bg-sky-50/80',
      },
      dark: {
        bg: 'bg-stone-950',
        paper: 'bg-stone-900/90',
        accent: 'text-sky-400',
        accentBg: 'bg-sky-500/90',
        border: 'border-stone-800',
        userBubble: 'bg-sky-600/90',
        soft: 'bg-stone-800/50',
      },
    },
    purple: {
      light: {
        bg: 'bg-gradient-to-br from-purple-50 via-fuchsia-50/30 to-purple-100/50',
        paper: 'bg-white/80',
        accent: 'text-purple-600',
        accentBg: 'bg-purple-500',
        border: 'border-purple-200/60',
        userBubble: 'bg-gradient-to-br from-purple-500 to-purple-600',
        soft: 'bg-purple-50/80',
      },
      dark: {
        bg: 'bg-stone-950',
        paper: 'bg-stone-900/90',
        accent: 'text-purple-400',
        accentBg: 'bg-purple-500/90',
        border: 'border-stone-800',
        userBubble: 'bg-purple-600/90',
        soft: 'bg-stone-800/50',
      },
    },
  };

  return isDark ? schemes[color].dark : schemes[color].light;
};

/** Default theme */
export const DEFAULT_THEME: Theme = 'light';
