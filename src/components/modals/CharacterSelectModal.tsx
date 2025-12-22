/**
 * Character Selection Modal
 */

import { X, Heart, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CHARACTERS, getCharacterIds, getColorScheme } from '../../constants';

export function CharacterSelectModal() {
  const {
    showCharacterSelect,
    setShowCharacterSelect,
    selectedCharacter,
    setSelectedCharacter,
    hasStarted,
    handleStartSession,
    character,
    colors,
    isDark,
    theme,
  } = useApp();

  if (!showCharacterSelect) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowCharacterSelect(false)}
      />
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart size={20} className={colors.accent} />
            <h2 className="text-xl font-serif font-bold">Choose Companion</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCharacterSelect(false)}
            className="p-2 opacity-50 hover:opacity-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {getCharacterIds().map((charId) => {
            const char = CHARACTERS[charId];
            const isSelected = selectedCharacter === charId;
            const charColors = getColorScheme(char.color, theme);

            return (
              <button
                key={charId}
                type="button"
                onClick={() => setSelectedCharacter(charId)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? `${charColors.border} ${charColors.soft}`
                    : `border-transparent ${
                        isDark ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-50 hover:bg-stone-100'
                      }`
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{char.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold">{char.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {char.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isDark ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isSelected && <Sparkles size={18} className={charColors.accent} />}
                </div>
              </button>
            );
          })}
        </div>

        {!hasStarted && (
          <button
            type="button"
            onClick={handleStartSession}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all transform hover:scale-[1.02] ${colors.accentBg} shadow-lg`}
          >
            Begin with {character.name}
          </button>
        )}
      </div>
    </div>
  );
}
