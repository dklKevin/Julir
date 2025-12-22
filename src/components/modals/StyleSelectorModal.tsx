/**
 * Summary Style Selector Modal
 */

import { X, PenTool, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSummaryStyleIds, getSummaryStyle, getSummaryStyleColors } from '../../constants';

export function StyleSelectorModal() {
  const {
    showStyleSelector,
    setShowStyleSelector,
    selectedSummaryStyle,
    generateDiaryWithStyle,
    colors,
    isDark,
  } = useApp();

  if (!showStyleSelector) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowStyleSelector(false)}
      />
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 shadow-2xl ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${colors.accentBg} text-white`}>
              <PenTool size={18} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Choose Your Vibe</h2>
              <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                How should we capture your day?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowStyleSelector(false)}
            className="p-2 opacity-50 hover:opacity-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className={`text-sm mb-5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
          Each style creates a unique diary entry that wraps up everything you shared.
        </p>

        <div className="space-y-3">
          {getSummaryStyleIds().map((styleId) => {
            const style = getSummaryStyle(styleId);
            const styleColors = getSummaryStyleColors(styleId, isDark);
            const isSelected = selectedSummaryStyle === styleId;

            return (
              <button
                key={styleId}
                type="button"
                onClick={() => generateDiaryWithStyle(styleId)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] ${
                  isSelected
                    ? `${styleColors.border} ${styleColors.bg}`
                    : `border-transparent ${
                        isDark ? 'bg-stone-800 hover:bg-stone-750' : 'bg-stone-50 hover:bg-stone-100'
                      }`
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{style.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${isSelected ? styleColors.accent : ''}`}>
                        {style.name}
                      </h3>
                      {isSelected && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${styleColors.soft} ${styleColors.accent}`}
                        >
                          Last used
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      {style.description}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {style.keywords.map((keyword, i) => (
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
                  <Sparkles
                    size={16}
                    className={`mt-1 transition-opacity ${isSelected ? styleColors.accent : 'opacity-0'}`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className={`mt-5 pt-4 border-t ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
          <p className={`text-xs text-center ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
            Your selection will be remembered for next time
          </p>
        </div>
      </div>
    </div>
  );
}
