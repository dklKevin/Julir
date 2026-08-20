/**
 * Session Completed Overlay - Shows after saving a journal entry
 * Features confetti celebration and options to start new or go home
 */

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, BookOpen, Plus, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils';

// Confetti particle type
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

// Generate confetti particles
function generateConfetti(count: number): ConfettiParticle[] {
  const colors = [
    '#f472b6', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f87171'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    velocity: {
      x: (Math.random() - 0.5) * 4,
      y: 2 + Math.random() * 3,
    },
    rotationSpeed: (Math.random() - 0.5) * 10,
  }));
}

export function SessionCompletedOverlay() {
  const {
    sessionCompleted,
    startNewSession,
    handleRestart,
    setShowHistory,
    currentStreak,
    colors,
    isDark,
    character,
  } = useApp();

  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [showContent, setShowContent] = useState(false);

  // Trigger confetti and haptic on mount
  useEffect(() => {
    if (sessionCompleted) {
      haptic('success');
      setConfetti(generateConfetti(50));

      // Stagger content appearance
      const timer = setTimeout(() => setShowContent(true), 300);

      // Clean up confetti after animation
      const cleanupTimer = setTimeout(() => setConfetti([]), 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    } else {
      setShowContent(false);
      setConfetti([]);
    }
  }, [sessionCompleted]);

  // Animate confetti
  const hasConfetti = confetti.length > 0;
  useEffect(() => {
    if (!hasConfetti) return;

    const interval = setInterval(() => {
      setConfetti(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.velocity.x,
            y: p.y + p.velocity.y,
            rotation: p.rotation + p.rotationSpeed,
            velocity: {
              ...p.velocity,
              y: p.velocity.y + 0.1, // gravity
            },
          }))
          .filter(p => p.y < 120) // Remove particles that fell off screen
      );
    }, 50);

    return () => clearInterval(interval);
  }, [hasConfetti]);

  const handleStartNew = useCallback(() => {
    haptic('medium');
    startNewSession();
  }, [startNewSession]);

  const handleGoHome = useCallback(() => {
    haptic('light');
    handleRestart();
  }, [handleRestart]);

  const handleViewJournal = useCallback(() => {
    haptic('light');
    handleRestart();
    setShowHistory(true);
  }, [handleRestart, setShowHistory]);

  if (!sessionCompleted) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-auto">
      {/* Confetti Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map(p => (
          <div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg)`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Semi-transparent overlay */}
      <div
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        } ${isDark ? 'bg-stone-950/70' : 'bg-white/70'}`}
      />

      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Success Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pop ${colors.accentBg} text-white shadow-xl`}
        >
          <Sparkles size={36} />
        </div>

        {/* Success Message */}
        <h2 className={`text-2xl font-serif font-bold mb-2 ${colors.accent}`}>
          Entry Saved!
        </h2>
        <p className={`text-center mb-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
          Your reflection has been safely stored.
        </p>

        {/* Streak Badge */}
        {currentStreak > 0 && (
          <div
            className={`px-4 py-2 rounded-full mb-8 flex items-center gap-2 animate-fade-in ${
              currentStreak >= 7
                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                : currentStreak >= 3
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
            style={{ animationDelay: '200ms' }}
          >
            <span className="text-lg">🔥</span>
            <span className="font-medium">{currentStreak} day streak!</span>
          </div>
        )}

        {/* Character Message */}
        <div
          className={`max-w-sm text-center mb-8 p-4 rounded-2xl animate-fade-in ${colors.soft} ${colors.border} border`}
          style={{ animationDelay: '400ms' }}
        >
          <span className="text-2xl mb-2 block">{character.emoji}</span>
          <p className={`text-sm italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
            "Thank you for sharing with me today. Take care of yourself!"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={handleStartNew}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 btn-press focus-ring ${colors.accentBg} hover:opacity-90 transition`}
          >
            <Plus size={18} />
            New Entry
          </button>
          <button
            type="button"
            onClick={handleViewJournal}
            className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 btn-press focus-ring border transition ${
              isDark
                ? 'border-stone-700 hover:bg-stone-800'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <BookOpen size={18} />
            View Journal
          </button>
        </div>

        {/* Home link */}
        <button
          type="button"
          onClick={handleGoHome}
          className={`mt-4 text-sm flex items-center gap-1 transition ${
            isDark ? 'text-stone-500 hover:text-stone-400' : 'text-stone-400 hover:text-stone-500'
          }`}
        >
          <Home size={14} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
