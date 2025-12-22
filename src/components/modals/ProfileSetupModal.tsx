/**
 * Profile Setup Modal - Initial user name setup
 */

import { useState } from 'react';
import { User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isValidName } from '../../utils';

export function ProfileSetupModal() {
  const { showProfileSetup, setShowProfileSetup, colors, isDark, handleSaveProfile } = useApp();
  const [profileNameInput, setProfileNameInput] = useState('');

  if (!showProfileSetup) return null;

  const onSave = () => {
    handleSaveProfile(profileNameInput);
    setProfileNameInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-3xl p-8 shadow-2xl ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${colors.accentBg} text-white`}>
            <User size={24} />
          </div>
          <div>
            <h2 className={`text-2xl font-serif font-bold ${colors.accent}`}>
              Welcome to Julir
            </h2>
            <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Let's get to know you
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label
            className={`text-sm font-medium mb-2 block ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}
          >
            What's your name?
          </label>
          <input
            type="text"
            value={profileNameInput}
            onChange={(e) => setProfileNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            placeholder="Enter your name..."
            autoFocus
            maxLength={50}
            className={`w-full p-4 rounded-xl border outline-none transition-all text-lg ${
              isDark
                ? 'bg-stone-800 border-stone-700 focus:border-stone-600'
                : 'bg-stone-50 border-stone-200 focus:border-stone-300'
            }`}
          />
          <p className={`text-xs mt-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            Your companion will use your name to personalize conversations
          </p>
        </div>

        <button
          onClick={onSave}
          disabled={!isValidName(profileNameInput)}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 ${colors.accentBg}`}
        >
          Continue
        </button>

        <button
          onClick={() => setShowProfileSetup(false)}
          className={`w-full mt-3 py-2 text-sm ${isDark ? 'text-stone-500' : 'text-stone-400'}`}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
