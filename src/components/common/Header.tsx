/**
 * App Header - Logo, character name, and action buttons
 */

import {
  Volume2,
  VolumeX,
  Moon,
  Sun,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Feather,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTimeGreeting, haptic } from '../../utils';

export function Header() {
  const {
    character,
    colors,
    isDark,
    hasValidName,
    displayName,
    currentTime,
    soundEnabled,
    setSoundEnabled,
    setTheme,
    setShowHistory,
    setShowInsights,
    setShowCharacterSelect,
    showSettings,
    setShowSettings,
  } = useApp();

  return (
    <header className="relative z-10 p-4 sm:p-6" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${colors.accentBg} text-white shadow-lg`}>
            <Feather size={20} />
          </div>
          <div>
            <h1 className={`text-xl font-serif font-bold tracking-tight ${colors.accent}`}>
              {character.name}
            </h1>
            <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              {hasValidName ? `Hi, ${displayName}` : getTimeGreeting(currentTime)}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1" aria-label="App controls">
          <button
            type="button"
            onClick={() => {
              haptic('selection');
              setSoundEnabled(!soundEnabled);
            }}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            aria-pressed={soundEnabled}
            className={`p-2.5 rounded-xl transition-all btn-press focus-ring ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
            }`}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            onClick={() => {
              haptic('selection');
              setTheme(isDark ? 'light' : 'dark');
            }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2.5 rounded-xl transition-all btn-press focus-ring ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => {
              haptic('light');
              setShowHistory(true);
            }}
            aria-label="Open journal history"
            className={`p-2.5 rounded-xl transition-all btn-press focus-ring ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
            }`}
          >
            <BookOpen size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              haptic('light');
              setShowInsights(true);
            }}
            aria-label="View insights and analytics"
            className={`p-2.5 rounded-xl transition-all btn-press focus-ring ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
            }`}
          >
            <BarChart3 size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              haptic('light');
              setShowCharacterSelect(true);
            }}
            aria-label="Change character"
            className={`p-2.5 rounded-xl transition-all btn-press focus-ring ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
            }`}
          >
            <Users size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              haptic('selection');
              setShowSettings(!showSettings);
            }}
            aria-label={showSettings ? 'Close settings' : 'Open settings'}
            aria-expanded={showSettings}
            className={`p-2.5 rounded-xl transition-all btn-press focus-ring ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
            }`}
          >
            <Settings size={18} />
          </button>
        </nav>
      </div>
    </header>
  );
}
