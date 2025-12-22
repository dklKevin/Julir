/**
 * Welcome Screen - Pre-session landing page
 */

import { useMemo } from 'react';
import { Clock, Users, Play, RotateCcw, X, Flame, BookOpen, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, haptic } from '../../utils';

// Daily writing prompts that rotate based on day
const DAILY_PROMPTS = [
  "What made you smile today?",
  "What's on your mind right now?",
  "Describe your day in three words...",
  "What are you grateful for?",
  "What challenged you today?",
  "What's something new you learned?",
  "How are you really feeling?",
];

export function WelcomeScreen() {
  const {
    character,
    colors,
    isDark,
    hasValidName,
    displayName,
    currentTime,
    setShowCharacterSelect,
    handleStartSession,
    hasDraft,
    restoreDraft,
    clearDraft,
    currentStreak,
    savedEntries,
  } = useApp();

  // Get daily prompt based on day of year
  const dailyPrompt = useMemo(() => {
    const dayOfYear = Math.floor((currentTime.getTime() - new Date(currentTime.getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  }, [currentTime]);

  // Quick stats for returning users
  const hasEntries = savedEntries.length > 0;

  const handleStart = () => {
    haptic('medium');
    handleStartSession();
  };

  const handleChangeCompanion = () => {
    haptic('light');
    setShowCharacterSelect(true);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
      <div className="mb-8">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${colors.soft} border ${colors.border}`}
        >
          <Clock size={14} className={colors.accent} />
          <span className={`text-sm font-medium ${colors.accent}`}>{formatDate(currentTime)}</span>
        </div>

        <div
          className={`relative p-8 rounded-3xl ${colors.paper} border ${colors.border} shadow-xl backdrop-blur-sm max-w-sm mx-auto`}
        >
          <div
            className={`absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 ${colors.border} rounded-tl-lg`}
          />
          <div
            className={`absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 ${colors.border} rounded-br-lg`}
          />

          <span className="text-5xl mb-4 block">{character.emoji}</span>
          <h1 className={`text-3xl font-serif font-bold mb-3 ${colors.accent}`}>{character.name}</h1>

          <div className="flex justify-center gap-2 mb-4">
            {character.keywords.map((keyword, i) => (
              <span
                key={i}
                className={`text-xs px-3 py-1 rounded-full font-medium ${colors.soft} ${colors.accent} border ${colors.border}`}
              >
                {keyword}
              </span>
            ))}
          </div>

          <p className={`text-sm italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {hasValidName
              ? `Ready to listen, ${displayName}`
              : 'Your voice companion for daily reflections'}
          </p>
        </div>
      </div>

      {/* Quick stats for returning users */}
      {hasEntries && (
        <div className="flex items-center justify-center gap-4 mb-4">
          {currentStreak > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600'
            }`}>
              <Flame size={14} />
              <span className="text-sm font-medium">{currentStreak} day streak</span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-600'
          }`}>
            <BookOpen size={14} />
            <span className="text-sm font-medium">{savedEntries.length} entries</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleChangeCompanion}
        className={`mb-4 px-5 py-2 rounded-full text-sm font-medium transition-all tap-scale ${
          isDark ? 'bg-stone-800 hover:bg-stone-700' : 'bg-white hover:bg-stone-50'
        } border ${colors.border}`}
      >
        <Users size={14} className="inline mr-2" />
        Change Companion
      </button>

      {/* Draft recovery notice */}
      {hasDraft && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl border flex items-center gap-3 max-w-xs animate-fade-in ${
            isDark ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <RotateCcw size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1 text-left">
            <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Unsaved draft found
            </p>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={restoreDraft}
                className={`text-xs font-medium ${colors.accent} hover:underline`}
              >
                Restore
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className={`text-xs ${isDark ? 'text-stone-500 hover:text-stone-400' : 'text-stone-400 hover:text-stone-500'}`}
              >
                Discard
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className={`p-1 rounded ${isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-200'}`}
          >
            <X size={14} className={isDark ? 'text-stone-500' : 'text-stone-400'} />
          </button>
        </div>
      )}

      {/* Daily prompt */}
      <div className={`mb-6 px-4 py-3 rounded-xl max-w-xs glass-bubble border ${colors.border}`}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={12} className={colors.accent} />
          <span className={`text-[10px] uppercase tracking-wider font-medium ${colors.accent}`}>
            Today's prompt
          </span>
        </div>
        <p className={`text-sm italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
          "{dailyPrompt}"
        </p>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className={`px-8 py-4 text-white rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 tap-scale flex items-center gap-3 ${colors.accentBg}`}
      >
        <Play size={20} fill="currentColor" />
        Start Writing
      </button>

      <p className={`mt-6 text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
        Tap to begin • Voice & text enabled
      </p>
    </div>
  );
}
