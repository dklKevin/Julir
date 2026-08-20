/**
 * Onboarding Tooltip - Shows helpful tips for first-time users
 * Progressive disclosure pattern - only shows relevant tips at the right time
 */

import { useState, useEffect } from 'react';
import { X, Mic, PenTool, BookOpen, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils';

interface TooltipStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: TooltipStep[] = [
  {
    id: 'welcome',
    icon: <Sparkles size={20} />,
    title: 'Welcome to Julir!',
    description: 'Your personal voice diary companion. Speak or type your thoughts, and I\'ll help you reflect on your day.',
    position: 'bottom',
  },
  {
    id: 'voice',
    icon: <Mic size={20} />,
    title: 'Voice Recording',
    description: 'Tap the microphone to speak. I\'ll transcribe your words and respond naturally.',
    position: 'top',
  },
  {
    id: 'finish',
    icon: <PenTool size={20} />,
    title: 'Save Your Entry',
    description: 'When you\'re done chatting, tap "Finish" to create a beautiful journal entry.',
    position: 'top',
  },
  {
    id: 'history',
    icon: <BookOpen size={20} />,
    title: 'Your Journal',
    description: 'View all your past entries, track your mood over time, and export your memories.',
    position: 'bottom',
  },
];

const STORAGE_KEY = 'julir-onboarding-completed';

export function OnboardingTooltip() {
  const { hasStarted, colors, isDark, savedEntries } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  // Show onboarding after a short delay for first-time users with no entries
  useEffect(() => {
    if (hasCompleted || savedEntries.length > 0) return;
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [savedEntries.length, hasCompleted]);

  // Advance to the voice tip when a session starts, without syncing state in an effect
  const displayStep = hasStarted && currentStep === 0 && !hasCompleted ? 1 : currentStep;

  const handleNext = () => {
    haptic('light');
    if (displayStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(displayStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    haptic('success');
    setIsVisible(false);
    setHasCompleted(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleDismiss = () => {
    haptic('light');
    handleComplete();
  };

  if (!isVisible || hasCompleted) return null;

  const step = ONBOARDING_STEPS[displayStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop with spotlight effect */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={handleDismiss} />

      {/* Tooltip */}
      <div
        className={`absolute pointer-events-auto max-w-xs p-4 rounded-2xl shadow-xl animate-pop ${
          isDark ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-200'
        } ${
          displayStep === 0
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : displayStep === 1 || displayStep === 2
            ? 'bottom-28 left-1/2 -translate-x-1/2'
            : 'top-20 right-4'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={`absolute top-2 right-2 p-1 rounded-full transition ${
            isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-100'
          }`}
          aria-label="Close onboarding"
        >
          <X size={14} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-6">
          <div className={`p-2 rounded-xl ${colors.accentBg} text-white shrink-0`}>
            {step.icon}
          </div>
          <div>
            <h3 className={`font-medium mb-1 ${colors.accent}`}>{step.title}</h3>
            <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              {step.description}
            </p>
          </div>
        </div>

        {/* Progress and actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === displayStep
                    ? colors.accentBg
                    : i < displayStep
                    ? `${colors.accentBg} opacity-50`
                    : isDark
                    ? 'bg-stone-600'
                    : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          {/* Next/Done button */}
          <button
            type="button"
            onClick={handleNext}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition tap-scale ${colors.accentBg} text-white hover:opacity-90`}
          >
            {displayStep === ONBOARDING_STEPS.length - 1 ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
