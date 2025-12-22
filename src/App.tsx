/**
 * Julir - Voice Diary Companion App
 * Main application component with modular architecture.
 */

import { AppProvider, useApp } from './context/AppContext';
import {
  Header,
  WelcomeScreen,
  ChatArea,
  ChatFooter,
  ProfileSetupModal,
  CharacterSelectModal,
  StyleSelectorModal,
  DiaryModal,
  HistoryPanel,
  InsightsPanel,
  SettingsPanel,
  ErrorBoundary,
  SessionCompletedOverlay,
  OnboardingTooltip,
  MilestoneToast,
} from './components';

// ============================================================================
// APP CONTENT (uses context)
// ============================================================================

function AppContent() {
  const { hasStarted, sessionCompleted, character, colors, isDark } = useApp();

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-500 ${colors.bg} ${
        isDark ? 'text-stone-100' : 'text-stone-800'
      }`}
    >
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-stone-700' : `bg-${character.color}-200`
          }`}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-stone-800' : `bg-${character.color}-300`
          }`}
        />
      </div>

      {/* Modals */}
      <ProfileSetupModal />
      <CharacterSelectModal />
      <StyleSelectorModal />
      <DiaryModal />

      {/* Panels */}
      <HistoryPanel />
      <InsightsPanel />

      {/* Header */}
      <Header />

      {/* Settings Panel */}
      <SettingsPanel />

      {/* Main Content */}
      {!hasStarted ? (
        <WelcomeScreen />
      ) : (
        <>
          {/* Blur effect when session is completed */}
          <div className={`transition-all duration-500 ${sessionCompleted ? 'blur-sm pointer-events-none' : ''}`}>
            <ChatArea />
            <ChatFooter />
          </div>
        </>
      )}

      {/* Session Completed Overlay */}
      <SessionCompletedOverlay />

      {/* Onboarding for first-time users */}
      <OnboardingTooltip />

      {/* Milestone celebrations */}
      <MilestoneToast />
    </div>
  );
}

// ============================================================================
// MAIN APP (provides context)
// ============================================================================

export default function JulirApp() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
