/**
 * Chat Footer - Input controls and actions
 */

import { useMemo } from 'react';
import { Mic, MicOff, Send, RotateCcw, PenTool } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils/haptics';

// Quick reply suggestions based on conversation state
const STARTER_PROMPTS = [
  "I had a great day today",
  "Something's been on my mind",
  "I'm feeling grateful for...",
  "Today was challenging",
];

const CONTINUE_PROMPTS = [
  "Tell me more",
  "That reminds me of...",
  "I also want to mention...",
  "Actually, I feel...",
];

// Audio waveform bars component
// Heights based on index for stable rendering
const BAR_HEIGHTS = [10, 14, 12, 16, 11];

function AudioWaveform({ isActive, color }: { isActive: boolean; color: string }) {
  return (
    <div className="flex items-center justify-center gap-0.5 h-4" aria-hidden="true">
      {BAR_HEIGHTS.map((height, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${color} ${
            isActive ? 'voice-wave-bar' : 'h-1'
          }`}
          style={{
            height: isActive ? `${height}px` : '4px',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ChatFooter() {
  const {
    transcript,
    setTranscript,
    isRecording,
    isSpeaking,
    isLoading,
    toggleRecording,
    handleSendMessage,
    handleRestart,
    handleEndDay,
    character,
    colors,
    isDark,
    messages,
  } = useApp();

  // Disable end day if no user messages yet
  const hasUserMessages = messages.filter(m => m.role === 'user').length > 0;

  // Determine which quick replies to show
  const quickReplies = useMemo(() => {
    // Don't show if there's already text, recording, speaking, or loading
    if (transcript || isRecording || isSpeaking || isLoading) return [];

    // Show starter prompts for first message, continue prompts after
    return hasUserMessages ? CONTINUE_PROMPTS : STARTER_PROMPTS;
  }, [transcript, isRecording, isSpeaking, isLoading, hasUserMessages]);

  const handleQuickReply = (text: string) => {
    haptic('light');
    setTranscript(text);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = transcript.trim();
    if (messageText) {
      haptic('medium');
      setTranscript(''); // Clear input immediately
      handleSendMessage(messageText);
    }
  };

  const onToggleRecording = () => {
    haptic(isRecording ? 'light' : 'medium');
    toggleRecording();
  };

  const onRestart = () => {
    haptic('light');
    handleRestart();
  };

  const onEndDay = () => {
    haptic('success');
    handleEndDay();
  };

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-20 p-4 border-t backdrop-blur-xl ${
        isDark ? 'bg-stone-950/90 border-stone-800' : 'bg-white/90 border-stone-200'
      }`}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto space-y-3">
        {/* Recording waveform indicator */}
        {isRecording && !transcript && (
          <div className="flex items-center justify-center gap-2 py-1">
            <AudioWaveform isActive={isRecording} color="bg-red-500" />
            <span className={`text-xs font-medium text-red-500 animate-pulse`}>
              Listening...
            </span>
            <AudioWaveform isActive={isRecording} color="bg-red-500" />
          </div>
        )}

        {transcript && (
          <div
            className={`text-center text-sm ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            } ${isRecording ? 'animate-pulse' : ''}`}
          >
            "{transcript}"
          </div>
        )}

        {isSpeaking && (
          <div className="flex items-center justify-center gap-2 py-1">
            <AudioWaveform isActive={true} color={colors.accentBg} />
            <span className={`text-xs font-medium ${colors.accent}`}>
              {character.name} is speaking...
            </span>
            <AudioWaveform isActive={true} color={colors.accentBg} />
          </div>
        )}

        {/* Quick reply suggestion chips */}
        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center animate-fade-in">
            {quickReplies.map((text, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickReply(text)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all tap-scale hover:scale-105 ${
                  isDark
                    ? 'bg-stone-800/80 border-stone-700 hover:bg-stone-700'
                    : 'bg-white/80 border-stone-200 hover:bg-stone-50'
                } ${colors.accent}`}
              >
                {text}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRestart}
            title="Start over"
            aria-label="Start conversation over"
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer border btn-press focus-ring ${
              isDark
                ? 'bg-stone-800 border-stone-700 hover:bg-stone-700'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={onToggleRecording}
            disabled={isSpeaking}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            aria-pressed={isRecording}
            title={isRecording ? 'Stop recording' : 'Start recording'}
            className={`relative h-12 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 btn-press focus-ring ${
              isRecording
                ? 'bg-red-500 text-white animate-recording-pulse'
                : `${colors.accentBg} text-white shadow-lg hover:scale-105`
            }`}
          >
            {isRecording && (
              <span className="absolute inset-0 rounded-xl listening-indicator text-red-400" />
            )}
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <form
            onSubmit={onSubmit}
            className={`flex-1 flex flex-col rounded-xl border px-3 transition-all ${
              isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'
            } ${isRecording ? 'ring-2 ring-red-500/30' : ''}`}
          >
            <div className="flex items-center">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={isRecording ? 'Listening...' : 'Type your thoughts...'}
                aria-label="Message input"
                maxLength={500}
                className="flex-1 bg-transparent py-3 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!transcript.trim()}
                aria-label="Send message"
                className={`p-2 rounded-lg disabled:opacity-30 transition cursor-pointer btn-press focus-ring ${colors.accent}`}
              >
                <Send size={18} />
              </button>
            </div>
            {/* Character counter - shows when typing */}
            {transcript.length > 0 && (
              <div className={`flex justify-end pb-1.5 -mt-1`}>
                <span className={`text-[10px] transition-colors ${
                  transcript.length >= 450
                    ? 'text-amber-500'
                    : transcript.length >= 500
                    ? 'text-red-500'
                    : isDark
                    ? 'text-stone-600'
                    : 'text-stone-400'
                }`}>
                  {transcript.length}/500
                </span>
              </div>
            )}
          </form>

          <button
            type="button"
            onClick={onEndDay}
            disabled={!hasUserMessages}
            aria-label="Finish and create diary entry"
            title={hasUserMessages ? 'Finish and create diary entry' : 'Start a conversation first'}
            className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition cursor-pointer border btn-press focus-ring disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-stone-800 border-stone-700 hover:bg-stone-700 disabled:hover:bg-stone-800'
                : 'bg-white border-stone-200 hover:bg-stone-50 disabled:hover:bg-white'
            }`}
          >
            <PenTool size={16} className={hasUserMessages ? colors.accent : ''} />
            <span className="hidden sm:inline">Finish</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
