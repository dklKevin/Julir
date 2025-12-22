/**
 * Chat Area - Message display
 */

import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils';

// Detect emotional tone from user messages to show character reactions
const MOOD_PATTERNS: { pattern: RegExp; reaction: string; label: string }[] = [
  { pattern: /\b(happy|great|amazing|wonderful|excited|love|joy|blessed)\b/i, reaction: '💖', label: 'Feeling happy' },
  { pattern: /\b(sad|upset|crying|hurt|disappointed|lonely|miss)\b/i, reaction: '🤗', label: 'Offering comfort' },
  { pattern: /\b(angry|frustrated|annoyed|mad|hate|furious)\b/i, reaction: '💪', label: 'Understanding' },
  { pattern: /\b(worried|anxious|nervous|scared|afraid|stress)\b/i, reaction: '🌟', label: 'Reassuring' },
  { pattern: /\b(grateful|thankful|appreciate|blessed)\b/i, reaction: '✨', label: 'Celebrating' },
  { pattern: /\b(tired|exhausted|drained|overwhelmed)\b/i, reaction: '☕', label: 'Supportive' },
  { pattern: /\b(proud|accomplished|achieved|success|won)\b/i, reaction: '🎉', label: 'Celebrating' },
  { pattern: /\b(confused|unsure|lost|stuck)\b/i, reaction: '💡', label: 'Guiding' },
];

function detectMoodReaction(content: string): { reaction: string; label: string } | null {
  for (const { pattern, reaction, label } of MOOD_PATTERNS) {
    if (pattern.test(content)) {
      return { reaction, label };
    }
  }
  return null;
}

export function ChatArea() {
  const { messages, isLoading, character, colors, isDark, messagesEndRef } = useApp();

  // Calculate reactions for assistant messages based on preceding user message
  const messageReactions = useMemo(() => {
    const reactions = new Map<string, { reaction: string; label: string }>();
    for (let i = 1; i < messages.length; i++) {
      const msg = messages[i];
      const prevMsg = messages[i - 1];
      if (msg.role === 'assistant' && prevMsg.role === 'user') {
        const reaction = detectMoodReaction(prevMsg.content);
        if (reaction) {
          reactions.set(msg.id, reaction);
        }
      }
    }
    return reactions;
  }, [messages]);

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-36 relative z-10">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto space-y-4 pt-2">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end animate-send' : 'justify-start animate-fade-in'}`}
            style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
          >
            <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
              {msg.role === 'assistant' && (
                <div className="relative shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${colors.accentBg} text-white`}
                  >
                    {character.emoji}
                  </div>
                  {/* Mood reaction indicator */}
                  {messageReactions.has(msg.id) && (
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] animate-bounce-in ${
                        isDark ? 'bg-stone-800' : 'bg-white'
                      } shadow-sm border ${colors.border}`}
                      title={messageReactions.get(msg.id)?.label}
                    >
                      {messageReactions.get(msg.id)?.reaction}
                    </div>
                  )}
                </div>
              )}
              <div
                className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? `${colors.userBubble} text-white rounded-br-sm shadow-lg`
                    : `glass-bubble border ${colors.border} rounded-bl-sm shadow-sm`
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p
                  className={`text-[10px] mt-2 ${
                    msg.role === 'user'
                      ? 'text-white/60'
                      : isDark
                      ? 'text-stone-500'
                      : 'text-stone-400'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in" role="status" aria-label={`${character.name} is thinking`}>
            <div className="flex gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${colors.accentBg} text-white pulse-glow`}
                aria-hidden="true"
              >
                {character.emoji}
              </div>
              <div className="flex flex-col gap-1">
                <div
                  className={`px-4 py-3 rounded-2xl rounded-bl-sm glass-bubble border ${colors.border}`}
                >
                  <div className="flex gap-1.5 items-center" aria-hidden="true">
                    <div className={`w-2 h-2 rounded-full ${colors.accentBg} typing-dot`} />
                    <div className={`w-2 h-2 rounded-full ${colors.accentBg} typing-dot`} />
                    <div className={`w-2 h-2 rounded-full ${colors.accentBg} typing-dot`} />
                  </div>
                </div>
                <span className={`text-[10px] ml-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  {character.name} is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}
