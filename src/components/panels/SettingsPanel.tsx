/**
 * Settings Panel - API keys and user settings
 */

import { Settings, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeName } from '../../utils';

export function SettingsPanel() {
  const {
    showSettings,
    userProfile,
    setUserProfile,
    voiceSpeed,
    setVoiceSpeed,
    geminiApiKey,
    setGeminiApiKey,
    googleTtsApiKey,
    setGoogleTtsApiKey,
    colors,
    isDark,
  } = useApp();

  if (!showSettings) return null;

  // Calculate thumb position percentage for custom styling
  const thumbPosition = ((voiceSpeed - 0.5) / 1.5) * 100;

  return (
    <div className="relative z-20 px-4 sm:px-6 pb-4">
      <div
        className={`max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto p-5 rounded-2xl border backdrop-blur-sm ${colors.paper} ${colors.border}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className={colors.accent} />
          <h3 className={`font-semibold text-sm ${colors.accent}`}>Settings</h3>
        </div>

        <div className="space-y-4">
          {/* User Name */}
          <div>
            <label
              className={`text-xs font-medium mb-1.5 block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name..."
              value={userProfile.name}
              maxLength={50}
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  name: sanitizeName(e.target.value),
                  lastActiveAt: new Date(),
                })
              }
              className={`w-full p-3 rounded-xl border outline-none transition-all text-sm ${
                isDark
                  ? 'bg-stone-800 border-stone-700 focus:border-stone-600'
                  : 'bg-white border-stone-200 focus:border-stone-300'
              }`}
            />
          </div>

          {/* Voice Speed */}
          <div>
            <label
              className={`text-xs font-medium mb-2 flex items-center gap-1.5 ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              <Volume2 size={12} />
              Voice Speed: {voiceSpeed.toFixed(1)}x
            </label>
            <div className="relative">
              {/* Custom track background */}
              <div
                className={`absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full ${
                  isDark ? 'bg-stone-700' : 'bg-stone-200'
                }`}
              />
              {/* Filled portion of track */}
              <div
                className={`absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full ${colors.accentBg}`}
                style={{ width: `${thumbPosition}%` }}
              />
              {/* The actual range input */}
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="relative w-full h-6 appearance-none bg-transparent cursor-pointer z-10
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-stone-300
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-stone-300
                  [&::-moz-range-thumb]:shadow-md
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-track]:bg-transparent
                  [&::-webkit-slider-runnable-track]:bg-transparent"
              />
            </div>
            <div className={`flex justify-between text-[10px] mt-1.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              <span>0.5x</span>
              <span>1.0x</span>
              <span>1.5x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Gemini API Key */}
          <div>
            <label
              className={`text-xs font-medium mb-1.5 block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="For AI conversations..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className={`w-full p-3 rounded-xl border outline-none transition-all text-sm ${
                isDark
                  ? 'bg-stone-800 border-stone-700 focus:border-stone-600'
                  : 'bg-white border-stone-200 focus:border-stone-300'
              }`}
            />
            <p className={`text-[10px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              Get key at{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                aistudio.google.com
              </a>
            </p>
          </div>

          {/* TTS API Key */}
          <div>
            <label
              className={`text-xs font-medium mb-1.5 block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Google Cloud TTS API Key
            </label>
            <input
              type="password"
              placeholder="For natural voice..."
              value={googleTtsApiKey}
              onChange={(e) => setGoogleTtsApiKey(e.target.value)}
              className={`w-full p-3 rounded-xl border outline-none transition-all text-sm ${
                isDark
                  ? 'bg-stone-800 border-stone-700 focus:border-stone-600'
                  : 'bg-white border-stone-200 focus:border-stone-300'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
