/**
 * Julir - Voice Diary Companion App
 * Main application component with modular architecture.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic,
  MicOff,
  BookOpen,
  Send,
  Settings,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Save,
  Download,
  Trash2,
  X,
  Edit2,
  Play,
  Users,
  Feather,
  Clock,
  Heart,
  Sparkles,
  PenTool,
  User,
  RotateCcw,
} from 'lucide-react';

// Types
import type { Message, DiaryEntry, CharacterId, Theme, UserProfile } from './types';

// Constants
import {
  CHARACTERS,
  DEFAULT_CHARACTER,
  getCharacter,
  getCharacterIds,
  getColorScheme,
  SPEECH_CONFIG,
} from './constants';

// Hooks
import { useLocalStorage } from './hooks';

// Services
import { createGeminiService, StorageService } from './services';

// Utils
import { generateId, formatDate, formatTime, getTimeGreeting, correctTranscript, prepareForSpeech } from './utils';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function JulirApp() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  // User Profile
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('julir_user_profile', {
    name: '',
    createdAt: new Date(),
    lastActiveAt: new Date(),
  });
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');

  // Session State
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Diary State
  const [diaryEntry, setDiaryEntry] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedEntries, setSavedEntries] = useLocalStorage<DiaryEntry[]>('julir_entries', []);

  // Settings State
  const [selectedCharacter, setSelectedCharacter] = useLocalStorage<CharacterId>(
    'julir_character',
    DEFAULT_CHARACTER
  );
  const [theme, setTheme] = useLocalStorage<Theme>('julir_theme', 'light');
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('julir_sound', true);
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('julir_gemini_key', '');
  const [googleTtsApiKey, setGoogleTtsApiKey] = useLocalStorage<string>('julir_tts_key', '');

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // -------------------------------------------------------------------------
  // REFS
  // -------------------------------------------------------------------------

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoListenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isWrappingUpRef = useRef(false);

  // -------------------------------------------------------------------------
  // DERIVED STATE
  // -------------------------------------------------------------------------

  const character = useMemo(() => getCharacter(selectedCharacter), [selectedCharacter]);
  const colors = useMemo(() => getColorScheme(character.color, theme), [character.color, theme]);
  const isDark = theme === 'dark';
  const geminiService = useMemo(() => createGeminiService(geminiApiKey), [geminiApiKey]);

  // -------------------------------------------------------------------------
  // EFFECTS
  // -------------------------------------------------------------------------

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if profile setup needed
  useEffect(() => {
    if (!userProfile.name) {
      setShowProfileSetup(true);
    }
  }, [userProfile.name]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = SPEECH_CONFIG.LANGUAGE;

    recognition.onstart = () => {
      setIsRecording(true);
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = setTimeout(
        () => recognition.stop(),
        SPEECH_CONFIG.MAX_DURATION
      );
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const corrected = correctTranscript(currentTranscript);
      setTranscript(corrected);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(
        () => recognition.stop(),
        SPEECH_CONFIG.SILENCE_TIMEOUT
      );
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  // Auto-send when recording stops
  useEffect(() => {
    if (!isRecording && transcript.trim().length > 1) {
      const timer = setTimeout(() => handleSendMessage(transcript), 500);
      return () => clearTimeout(timer);
    }
  }, [isRecording, transcript]);

  // -------------------------------------------------------------------------
  // SPEECH FUNCTIONS
  // -------------------------------------------------------------------------

  const speakText = useCallback(
    async (text: string) => {
      if (!soundEnabled) return;

      // Stop listening to prevent mic picking up AI speech
      recognitionRef.current?.stop();
      setIsRecording(false);

      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();
      if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);

      const speechText = prepareForSpeech(text);

      // Try Google TTS if key available
      if (googleTtsApiKey) {
        try {
          setIsSpeaking(true);

          const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                input: { text: speechText },
                voice: {
                  languageCode: character.voiceConfig.languageCode,
                  name: character.voiceConfig.name,
                  ssmlGender: character.voiceConfig.ssmlGender,
                },
                audioConfig: {
                  audioEncoding: 'MP3',
                  speakingRate: character.voiceConfig.speakingRate,
                  pitch: character.voiceConfig.pitch,
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const audioBlob = new Blob(
              [Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))],
              { type: 'audio/mp3' }
            );
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              if (!isWrappingUpRef.current && !diaryEntry) {
                autoListenTimerRef.current = setTimeout(
                  startListening,
                  SPEECH_CONFIG.AUTO_LISTEN_DELAY
                );
              }
            };

            await audio.play();
            return;
          }
        } catch (error) {
          console.error('TTS error:', error);
        }
      }

      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = character.voiceConfig.speakingRate;
      utterance.pitch = 1 + character.voiceConfig.pitch / 10;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (!isWrappingUpRef.current && !diaryEntry) {
          autoListenTimerRef.current = setTimeout(
            startListening,
            SPEECH_CONFIG.AUTO_LISTEN_DELAY
          );
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [soundEnabled, googleTtsApiKey, character, diaryEntry]
  );

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isRecording) return;
    try {
      setTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }, [isRecording]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported. Try Chrome.');
      return;
    }
    if (isRecording) stopListening();
    else startListening();
  }, [isRecording, startListening, stopListening]);

  // -------------------------------------------------------------------------
  // MESSAGE HANDLERS
  // -------------------------------------------------------------------------

  const handleSendMessage = useCallback(
    async (text: string) => {
      const cleanText = correctTranscript(text.trim());
      if (!cleanText) return;

      // Prevent duplicate messages
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg && lastUserMsg.content === cleanText) return;

      const newMessage: Message = {
        id: generateId(),
        role: 'user',
        content: cleanText,
        timestamp: new Date(),
      };

      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      setTranscript('');
      setIsLoading(true);

      const aiResponse = await geminiService.chat({
        character,
        history: messages,
        userInput: cleanText,
        userName: userProfile.name || undefined,
      });

      setIsLoading(false);

      const responseMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages([...newMessages, responseMessage]);
      speakText(aiResponse);
    },
    [messages, character, userProfile.name, geminiService, speakText]
  );

  // -------------------------------------------------------------------------
  // SESSION HANDLERS
  // -------------------------------------------------------------------------

  const handleStartSession = useCallback(() => {
    setHasStarted(true);
    isWrappingUpRef.current = false;
    setShowCharacterSelect(false);

    // Personalized greeting
    let greeting = character.greeting;
    if (userProfile.name) {
      greeting = greeting.replace(
        /Tell me/i,
        `${userProfile.name}, tell me`
      );
    }

    const greetingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    };

    setMessages([greetingMessage]);
    speakText(greeting);
  }, [character, userProfile.name, speakText]);

  const handleEndDay = useCallback(async () => {
    isWrappingUpRef.current = true;

    // Stop all audio/recording
    recognitionRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    // Clear timers
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);

    setIsRecording(false);
    setIsSpeaking(false);

    // Need at least one user message
    if (messages.filter((m) => m.role === 'user').length < 1) {
      isWrappingUpRef.current = false;
      return;
    }

    setIsLoading(true);
    const entryText = await geminiService.generateDiary({
      history: messages,
      userName: userProfile.name || undefined,
    });
    setDiaryEntry(entryText);
    setEditingId(null);
    setIsLoading(false);
  }, [messages, userProfile.name, geminiService]);

  const handleRestart = useCallback(() => {
    // Stop all audio/recording
    recognitionRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    // Clear timers
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);

    // Reset state
    setIsRecording(false);
    setIsSpeaking(false);
    setMessages([]);
    setTranscript('');
    setHasStarted(false);
    setDiaryEntry(null);
    setEditingId(null);
    isWrappingUpRef.current = false;
  }, []);

  // -------------------------------------------------------------------------
  // ENTRY HANDLERS
  // -------------------------------------------------------------------------

  const saveEntry = useCallback(() => {
    if (!diaryEntry) return;

    const title = diaryEntry.split('\n')[0] || 'Untitled';

    if (editingId) {
      const updated = savedEntries.map((entry) =>
        entry.id === editingId ? { ...entry, content: diaryEntry, title } : entry
      );
      setSavedEntries(updated);
    } else {
      const newEntry: DiaryEntry = {
        id: generateId(),
        date: new Date().toLocaleDateString(),
        title,
        content: diaryEntry,
        characterId: selectedCharacter,
      };
      setSavedEntries([newEntry, ...savedEntries]);
    }

    setDiaryEntry(null);
    setEditingId(null);
    isWrappingUpRef.current = false;
  }, [diaryEntry, editingId, savedEntries, setSavedEntries, selectedCharacter]);

  const deleteEntry = useCallback(
    (id: string) => {
      setSavedEntries(savedEntries.filter((e) => e.id !== id));
    },
    [savedEntries, setSavedEntries]
  );

  const downloadEntry = useCallback((entry: DiaryEntry) => {
    const blob = new Blob([entry.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary_${entry.date.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // -------------------------------------------------------------------------
  // PROFILE HANDLERS
  // -------------------------------------------------------------------------

  const handleSaveProfile = useCallback(() => {
    if (!profileNameInput.trim()) return;

    setUserProfile({
      name: profileNameInput.trim(),
      createdAt: userProfile.createdAt || new Date(),
      lastActiveAt: new Date(),
    });
    setShowProfileSetup(false);
    setProfileNameInput('');
  }, [profileNameInput, userProfile.createdAt, setUserProfile]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

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

      {/* Profile Setup Modal */}
      {showProfileSetup && (
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
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                placeholder="Enter your name..."
                autoFocus
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
              onClick={handleSaveProfile}
              disabled={!profileNameInput.trim()}
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
      )}

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${colors.accentBg} text-white shadow-lg`}>
              <Feather size={20} />
            </div>
            <div>
              <h1 className={`text-xl font-serif font-bold tracking-tight ${colors.accent}`}>
                {character.name}
              </h1>
              <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                {userProfile.name ? `Hi, ${userProfile.name}` : getTimeGreeting(currentTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl transition-all ${
                isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
              }`}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2.5 rounded-xl transition-all ${
                isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
              }`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className={`p-2.5 rounded-xl transition-all ${
                isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
              }`}
            >
              <BookOpen size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowCharacterSelect(true)}
              className={`p-2.5 rounded-xl transition-all ${
                isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
              }`}
            >
              <Users size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl transition-all ${
                isDark ? 'hover:bg-stone-800' : 'hover:bg-white/60'
              }`}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="relative z-20 px-4 sm:px-6 pb-4">
          <div
            className={`max-w-2xl mx-auto p-5 rounded-2xl border backdrop-blur-sm ${colors.paper} ${colors.border}`}
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
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, name: e.target.value, lastActiveAt: new Date() })
                  }
                  className={`w-full p-3 rounded-xl border outline-none transition-all text-sm ${
                    isDark
                      ? 'bg-stone-800 border-stone-700 focus:border-stone-600'
                      : 'bg-white border-stone-200 focus:border-stone-300'
                  }`}
                />
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
      )}

      {/* Character Selection Modal */}
      {showCharacterSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCharacterSelect(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl ${
              isDark ? 'bg-stone-900' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Heart size={20} className={colors.accent} />
                <h2 className="text-xl font-serif font-bold">Choose Companion</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCharacterSelect(false)}
                className="p-2 opacity-50 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {getCharacterIds().map((charId) => {
                const char = CHARACTERS[charId];
                const isSelected = selectedCharacter === charId;
                const charColors = getColorScheme(char.color, theme);

                return (
                  <button
                    key={charId}
                    type="button"
                    onClick={() => setSelectedCharacter(charId)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? `${charColors.border} ${charColors.soft}`
                        : `border-transparent ${isDark ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-50 hover:bg-stone-100'}`
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{char.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-bold">{char.name}</h3>
                        <div className="flex gap-2 mt-1">
                          {char.keywords.map((keyword, i) => (
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
                      {isSelected && <Sparkles size={18} className={charColors.accent} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {!hasStarted && (
              <button
                type="button"
                onClick={handleStartSession}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all transform hover:scale-[1.02] ${colors.accentBg} shadow-lg`}
              >
                Begin with {character.name}
              </button>
            )}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div
            className={`relative w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl ${
              isDark ? 'bg-stone-900' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className={colors.accent} />
                <h2 className="text-xl font-serif font-bold">Journal</h2>
              </div>
              <button type="button" onClick={() => setShowHistory(false)}>
                <X size={20} />
              </button>
            </div>

            {savedEntries.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                <PenTool size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No entries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                      isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p
                        className={`text-xs font-medium ${
                          isDark ? 'text-stone-500' : 'text-stone-400'
                        }`}
                      >
                        {entry.date}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDiaryEntry(entry.content);
                            setEditingId(entry.id);
                            setShowHistory(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadEntry(entry)}
                          className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`text-sm line-clamp-3 font-serif ${
                        isDark ? 'text-stone-300' : 'text-stone-600'
                      }`}
                    >
                      {entry.content.split('\n').slice(2).join(' ').substring(0, 150)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <div className="mb-8">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${colors.soft} border ${colors.border}`}
            >
              <Clock size={14} className={colors.accent} />
              <span className={`text-sm font-medium ${colors.accent}`}>
                {formatDate(currentTime)}
              </span>
            </div>

            <div
              className={`relative p-8 rounded-3xl ${colors.paper} border ${colors.border} shadow-xl backdrop-blur-sm max-w-sm mx-auto`}
            >
              <div
                className={`absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 ${colors.border} rounded-tl-lg`}
              />
              <div
                className={`absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 ${colors.border} rounded-br-lg`}
              />

              <span className="text-5xl mb-4 block">{character.emoji}</span>
              <h1 className={`text-3xl font-serif font-bold mb-3 ${colors.accent}`}>
                {character.name}
              </h1>

              <div className="flex justify-center gap-2 mb-4">
                {character.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${colors.soft} ${colors.accent} border ${colors.border}`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <p className={`text-sm italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                {userProfile.name
                  ? `Ready to listen, ${userProfile.name}`
                  : 'Your voice companion for daily reflections'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCharacterSelect(true)}
            className={`mb-4 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              isDark ? 'bg-stone-800 hover:bg-stone-700' : 'bg-white hover:bg-stone-50'
            } border ${colors.border}`}
          >
            <Users size={14} className="inline mr-2" />
            Change Companion
          </button>

          <button
            type="button"
            onClick={handleStartSession}
            className={`px-8 py-4 text-white rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 ${colors.accentBg}`}
          >
            <Play size={20} fill="currentColor" />
            Start Writing
          </button>

          <p className={`mt-6 text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
            Click to begin • Voice enabled
          </p>
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-36 relative z-10">
            <div className="max-w-2xl mx-auto space-y-4 pt-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                    {msg.role === 'assistant' && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${colors.accentBg} text-white`}
                      >
                        {character.emoji}
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? `${colors.userBubble} text-white rounded-br-sm shadow-lg`
                          : `${colors.paper} border ${colors.border} rounded-bl-sm shadow-sm backdrop-blur-sm`
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
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${colors.accentBg} text-white`}
                    >
                      {character.emoji}
                    </div>
                    <div
                      className={`p-4 rounded-2xl rounded-bl-sm ${colors.paper} border ${colors.border}`}
                    >
                      <div className="flex gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${colors.accentBg} animate-bounce`}
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${colors.accentBg} animate-bounce`}
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${colors.accentBg} animate-bounce`}
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Footer Controls */}
          <footer
            className={`fixed bottom-0 left-0 right-0 z-20 p-4 border-t backdrop-blur-xl ${
              isDark ? 'bg-stone-950/90 border-stone-800' : 'bg-white/90 border-stone-200'
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-3">
              {transcript && (
                <div
                  className={`text-center text-sm ${
                    isDark ? 'text-stone-400' : 'text-stone-500'
                  } animate-pulse`}
                >
                  "{transcript}"
                </div>
              )}

              {isSpeaking && (
                <div className={`text-center text-xs font-medium animate-pulse ${colors.accent}`}>
                  {character.name} is speaking...
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  title="Start over"
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-stone-800 border-stone-700 hover:bg-stone-700'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isSpeaking}
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                      : `${colors.accentBg} text-white shadow-lg hover:scale-105`
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(transcript);
                  }}
                  className={`flex-1 flex items-center rounded-xl border px-3 ${
                    isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <input
                    type="text"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={isRecording ? 'Listening...' : 'Type your thoughts...'}
                    className="flex-1 bg-transparent py-3 outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!transcript}
                    className={`p-2 rounded-lg disabled:opacity-30 transition cursor-pointer ${colors.accent}`}
                  >
                    <Send size={18} />
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleEndDay}
                  className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition cursor-pointer border ${
                    isDark
                      ? 'bg-stone-800 border-stone-700 hover:bg-stone-700'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <PenTool size={16} className={colors.accent} />
                  <span className="hidden sm:inline">Finish</span>
                </button>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Diary Entry Modal */}
      {diaryEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg h-[80vh] flex flex-col rounded-3xl shadow-2xl relative overflow-hidden ${
              isDark ? 'bg-stone-900' : 'bg-white'
            }`}
          >
            <div className={`p-6 border-b ${colors.border} ${colors.soft}`}>
              <button
                type="button"
                onClick={() => {
                  setDiaryEntry(null);
                  setEditingId(null);
                  isWrappingUpRef.current = false;
                }}
                className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${colors.accentBg} text-white`}>
                  <PenTool size={18} />
                </div>
                <div>
                  <h2 className={`text-xl font-serif font-bold ${colors.accent}`}>
                    {editingId ? 'Edit Entry' : 'Your Entry'}
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Edit before saving
                  </p>
                </div>
              </div>
            </div>

            <textarea
              value={diaryEntry}
              onChange={(e) => setDiaryEntry(e.target.value)}
              className={`flex-1 w-full p-6 font-serif text-lg leading-loose resize-none outline-none ${
                isDark ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-700'
              }`}
              style={{ lineHeight: '2' }}
            />

            <div className={`p-4 border-t ${colors.border} flex gap-3`}>
              <button
                type="button"
                onClick={saveEntry}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition flex items-center justify-center gap-2 ${colors.accentBg} hover:opacity-90`}
              >
                <Save size={18} />
                {editingId ? 'Update' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiaryEntry(null);
                  setEditingId(null);
                  isWrappingUpRef.current = false;
                }}
                className={`px-6 py-3 rounded-xl font-medium transition border ${
                  isDark ? 'border-stone-700 hover:bg-stone-800' : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
