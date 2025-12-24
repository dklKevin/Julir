/**
 * Settings Panel - API keys and user settings
 */

import { useState, useEffect } from 'react';
import { Settings, Volume2, Shield, Fingerprint, ScanFace, Lock, FileText, Trash2, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeName, haptic } from '../../utils';
import {
  checkBiometricAvailability,
  getBiometryName,
  type BiometricStatus,
} from '../../services/biometricService';
import { PrivacyPolicy } from '../common/PrivacyPolicy';
import { DeleteDataModal } from '../common/DeleteDataModal';

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
    biometricLockEnabled,
    setBiometricLockEnabled,
    colors,
    isDark,
    deleteAllData,
  } = useApp();

  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check biometric availability when settings opens
  useEffect(() => {
    if (showSettings) {
      checkBiometricAvailability().then(setBiometricStatus);
    }
  }, [showSettings]);

  if (!showSettings) return null;

  // Calculate thumb position percentage for custom styling
  const thumbPosition = ((voiceSpeed - 0.5) / 1.5) * 100;

  // Get the appropriate biometric icon based on type
  const getBiometricIcon = () => {
    switch (biometricStatus?.biometryType) {
      case 'face':
        return <ScanFace size={16} />;
      case 'fingerprint':
        return <Fingerprint size={16} />;
      default:
        return <Lock size={16} />;
    }
  };

  const handleBiometricToggle = () => {
    haptic('selection');
    setBiometricLockEnabled(!biometricLockEnabled);
  };

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
              htmlFor="user-name"
              className={`text-xs font-medium mb-1.5 block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Your Name
            </label>
            <input
              id="user-name"
              type="text"
              placeholder="Enter your name..."
              value={userProfile.name}
              maxLength={50}
              autoComplete="name"
              aria-describedby="name-hint"
              onChange={(e) =>
                setUserProfile({
                  ...userProfile,
                  name: sanitizeName(e.target.value),
                  lastActiveAt: new Date(),
                })
              }
              className={`w-full p-3 rounded-xl border outline-none transition-all text-sm min-h-[44px] ${
                isDark
                  ? 'bg-stone-800 border-stone-700 focus:border-stone-600'
                  : 'bg-white border-stone-200 focus:border-stone-300'
              }`}
            />
            <span id="name-hint" className="sr-only">Your name will be used to personalize the diary experience</span>
          </div>

          {/* Biometric Lock */}
          {biometricStatus?.isAvailable && (
            <div>
              <div className="flex items-center justify-between min-h-[44px]">
                <label
                  id="biometric-label"
                  className={`text-xs font-medium flex items-center gap-1.5 ${
                    isDark ? 'text-stone-400' : 'text-stone-500'
                  }`}
                >
                  <Shield size={12} aria-hidden="true" />
                  App Lock with {getBiometryName(biometricStatus.biometryType)}
                </label>
                <button
                  type="button"
                  onClick={handleBiometricToggle}
                  className={`relative w-12 h-7 rounded-full transition-all min-w-[48px] min-h-[44px] flex items-center ${
                    biometricLockEnabled
                      ? colors.accentBg
                      : isDark
                      ? 'bg-stone-700'
                      : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={biometricLockEnabled}
                  aria-labelledby="biometric-label"
                  aria-describedby="biometric-desc"
                >
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-all flex items-center justify-center ${
                      biometricLockEnabled ? 'left-6' : 'left-1'
                    }`}
                    aria-hidden="true"
                  >
                    {getBiometricIcon()}
                  </span>
                </button>
              </div>
              <p id="biometric-desc" className={`text-[10px] mt-1.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                {biometricLockEnabled
                  ? 'Your diary is protected. Authentication required when app opens.'
                  : 'Enable to require authentication when opening the app.'}
              </p>
            </div>
          )}

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
              htmlFor="gemini-api-key"
              className={`text-xs font-medium mb-1.5 block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Gemini API Key
            </label>
            <input
              id="gemini-api-key"
              type="password"
              placeholder="For AI conversations..."
              value={geminiApiKey}
              autoComplete="off"
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className={`w-full p-3 rounded-xl border outline-none transition-all text-sm min-h-[44px] ${
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
                className="underline min-h-[44px] inline-flex items-center"
              >
                aistudio.google.com
              </a>
            </p>
          </div>

          {/* TTS API Key */}
          <div>
            <label
              htmlFor="tts-api-key"
              className={`text-xs font-medium mb-1.5 block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Google Cloud TTS API Key
            </label>
            <input
              id="tts-api-key"
              type="password"
              placeholder="For natural voice..."
              value={googleTtsApiKey}
              autoComplete="off"
              onChange={(e) => setGoogleTtsApiKey(e.target.value)}
              className={`w-full p-3 rounded-xl border outline-none transition-all text-sm min-h-[44px] ${
                isDark
                  ? 'bg-stone-800 border-stone-700 focus:border-stone-600'
                  : 'bg-white border-stone-200 focus:border-stone-300'
              }`}
            />
          </div>

          {/* Privacy & Data Section */}
          <div className={`pt-4 mt-4 border-t ${colors.border}`}>
            <p className={`text-xs font-medium mb-3 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Privacy & Data
            </p>

            {/* Privacy Policy */}
            <button
              type="button"
              onClick={() => {
                haptic('selection');
                setShowPrivacyPolicy(true);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors mb-2 min-h-[44px] ${
                isDark
                  ? 'bg-stone-800 hover:bg-stone-750 active:bg-stone-700'
                  : 'bg-stone-50 hover:bg-stone-100 active:bg-stone-150'
              }`}
              aria-label="View privacy policy"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className={colors.accent} />
                <span className="text-sm font-medium">Privacy Policy</span>
              </div>
              <ChevronRight size={16} className="opacity-50" />
            </button>

            {/* Delete All Data */}
            <button
              type="button"
              onClick={() => {
                haptic('warning');
                setShowDeleteModal(true);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors min-h-[44px] ${
                isDark
                  ? 'bg-red-900/20 hover:bg-red-900/30 active:bg-red-900/40'
                  : 'bg-red-50 hover:bg-red-100 active:bg-red-150'
              }`}
              aria-label="Delete all data from the app"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-red-500" />
                <span className="text-sm font-medium text-red-500">Delete All Data</span>
              </div>
              <ChevronRight size={16} className="text-red-500 opacity-50" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrivacyPolicy
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
      <DeleteDataModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={deleteAllData}
      />
    </div>
  );
}
