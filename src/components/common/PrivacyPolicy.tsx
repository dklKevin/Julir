/**
 * Privacy Policy Screen
 * Required for App Store compliance (Guideline 5.1.1)
 */

import { X, Shield, Eye, Lock, Trash2, Cloud, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  const { colors, isDark } = useApp();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
    >
      <div
        className={`relative w-full max-w-lg max-h-[85vh] mx-4 rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${colors.border} ${isDark ? 'bg-stone-900' : 'bg-white'}`}>
          <div className="flex items-center gap-2">
            <Shield size={20} className={colors.accent} />
            <h2 id="privacy-title" className="text-lg font-semibold">
              Privacy Policy
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'
            }`}
            aria-label="Close privacy policy"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-60px)]">
          <div className={`space-y-6 text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
            {/* Intro */}
            <p>
              Julir is designed with your privacy as the top priority. Your diary entries
              are personal, and we've built the app to keep them that way.
            </p>

            {/* Data Collection */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className={colors.accent} />
                <h3 className={`font-semibold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  Data Collection
                </h3>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Your diary entries are stored locally on your device</li>
                <li>Your name (optional) is stored locally for personalization</li>
                <li>API keys you provide are stored securely on your device</li>
                <li>We do not collect analytics or tracking data</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} className={colors.accent} />
                <h3 className={`font-semibold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  Data Storage & Security
                </h3>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>All diary content is encrypted at rest using AES encryption</li>
                <li>Encryption keys are stored in iOS Keychain (secure enclave)</li>
                <li>Optional Face ID/Touch ID protection for app access</li>
                <li>Data never leaves your device unless you use iCloud backup</li>
              </ul>
            </section>

            {/* Third Party Services */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Cloud size={16} className={colors.accent} />
                <h3 className={`font-semibold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  Third-Party Services
                </h3>
              </div>
              <p className="mb-2">
                If you provide API keys, Julir communicates with:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>
                  <strong>Google Gemini API</strong> - Your conversation messages are sent
                  to generate AI responses. Google's privacy policy applies.
                </li>
                <li>
                  <strong>Google Cloud Text-to-Speech</strong> - Text is sent to generate
                  voice audio. Google's privacy policy applies.
                </li>
              </ul>
              <p className="mt-2 text-xs opacity-75">
                These services are only used when you provide your own API keys.
                No data is shared if you don't configure API keys.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Eye size={16} className={colors.accent} />
                <h3 className={`font-semibold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  Your Rights
                </h3>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>View all your data directly in the app</li>
                <li>Export your entries as PDF or images</li>
                <li>Delete individual entries at any time</li>
                <li>Delete all data and reset the app completely</li>
              </ul>
            </section>

            {/* Data Deletion */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Trash2 size={16} className="text-red-500" />
                <h3 className={`font-semibold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  Data Deletion
                </h3>
              </div>
              <p>
                You can delete all your data at any time from Settings → Delete All Data.
                This action is irreversible and removes all diary entries, settings,
                and personal information from your device.
              </p>
            </section>

            {/* Contact */}
            <section className={`pt-4 border-t ${colors.border}`}>
              <p className="text-xs opacity-75">
                Last updated: December 2025
              </p>
              <p className="text-xs opacity-75 mt-1">
                Questions? Contact us at privacy@julir.app
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
