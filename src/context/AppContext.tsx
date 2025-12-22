/**
 * App Context - Centralized state management for Julir app
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Message, DiaryEntry, CharacterId, Theme, UserProfile, SummaryStyleId, MoodId } from '../types';
import {
  DEFAULT_CHARACTER,
  getCharacter,
  getColorScheme,
  SPEECH_CONFIG,
  DEFAULT_SUMMARY_STYLE,
  calculateMoodStats,
} from '../constants';
import { useLocalStorage, useSpeechRecognition, useSpeechSynthesis } from '../hooks';
import { createGeminiService } from '../services';
import {
  generateId,
  correctTranscript,
  sanitizeName,
  getDisplayName,
  isValidName,
} from '../utils';
import {
  getCalendarDays,
  formatDateKey,
  getPreviousMonth,
  getNextMonth,
  groupEntriesByDate,
} from '../utils/calendarUtils';

// ============================================================================
// TYPES
// ============================================================================

interface AppContextType {
  // User Profile
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  displayName: string;
  hasValidName: boolean;

  // Session State
  hasStarted: boolean;
  setHasStarted: (value: boolean) => void;
  sessionCompleted: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  transcript: string;
  setTranscript: (value: string) => void;
  isRecording: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  // Diary State
  diaryEntry: string | null;
  setDiaryEntry: (value: string | null) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  savedEntries: DiaryEntry[];
  setSavedEntries: (entries: DiaryEntry[]) => void;

  // Settings
  selectedCharacter: CharacterId;
  setSelectedCharacter: (id: CharacterId) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  googleTtsApiKey: string;
  setGoogleTtsApiKey: (key: string) => void;

  // UI State
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  showCharacterSelect: boolean;
  setShowCharacterSelect: (show: boolean) => void;
  showStyleSelector: boolean;
  setShowStyleSelector: (show: boolean) => void;
  showInsights: boolean;
  setShowInsights: (show: boolean) => void;
  showProfileSetup: boolean;
  setShowProfileSetup: (show: boolean) => void;
  currentTime: Date;

  // Summary Style
  selectedSummaryStyle: SummaryStyleId;
  setSelectedSummaryStyle: (style: SummaryStyleId) => void;

  // Mood State
  selectedMood: MoodId | null;
  setSelectedMood: (mood: MoodId | null) => void;
  moodStats: ReturnType<typeof calculateMoodStats>;

  // Search & Calendar State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  historyViewMode: 'list' | 'calendar';
  setHistoryViewMode: (mode: 'list' | 'calendar') => void;
  calendarYear: number;
  setCalendarYear: (year: number) => void;
  calendarMonth: number;
  setCalendarMonth: (month: number) => void;
  selectedCalendarDate: string | null;
  setSelectedCalendarDate: (date: string | null) => void;
  moodFilter: MoodId | 'all';
  setMoodFilter: (filter: MoodId | 'all') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Derived State
  character: ReturnType<typeof getCharacter>;
  colors: ReturnType<typeof getColorScheme>;
  isDark: boolean;
  filteredEntries: DiaryEntry[];
  entriesByDate: Map<string, DiaryEntry[]>;
  selectedDateEntries: DiaryEntry[];
  calendarDays: (number | null)[];
  currentStreak: number;

  // Refs (only those needed by components)
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isWrappingUpRef: React.MutableRefObject<boolean>;

  // Handlers
  speakText: (text: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  toggleRecording: () => void;
  handleSendMessage: (text: string) => Promise<void>;
  handleStartSession: () => void;
  handleEndDay: () => void;
  generateDiaryWithStyle: (styleId: SummaryStyleId) => Promise<void>;
  handleRestart: () => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleCalendarDayClick: (day: number) => void;
  handleGoToToday: () => void;
  clearSearchAndFilters: () => void;
  saveEntry: () => void;
  deleteEntry: (id: string) => void;
  togglePinEntry: (id: string) => void;
  updateEntryTags: (id: string, tags: string[]) => void;
  handleSaveProfile: (name: string) => void;
  allTags: string[];
  hasDraft: boolean;
  restoreDraft: () => void;
  clearDraft: () => void;
  startNewSession: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function AppProvider({ children }: { children: React.ReactNode }) {
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

  // Session State
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Diary State
  const [diaryEntry, setDiaryEntry] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedEntries, setSavedEntries] = useLocalStorage<DiaryEntry[]>('julir_entries', []);
  const [draftEntry, setDraftEntry] = useLocalStorage<string | null>('julir_draft', null);
  const [draftMessages, setDraftMessages] = useLocalStorage<Message[]>('julir_draft_messages', []);

  // Settings State
  const [selectedCharacter, setSelectedCharacter] = useLocalStorage<CharacterId>(
    'julir_character',
    DEFAULT_CHARACTER
  );
  const [theme, setTheme] = useLocalStorage<Theme>('julir_theme', 'light');
  const [voiceSpeed, setVoiceSpeed] = useLocalStorage<number>('julir_voice_speed', 1.0);
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('julir_sound', true);
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('julir_gemini_key', '');
  const [googleTtsApiKey, setGoogleTtsApiKey] = useLocalStorage<string>('julir_tts_key', '');

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Search & Calendar State
  const [searchQuery, setSearchQuery] = useState('');
  const [historyViewMode, setHistoryViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState<MoodId | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Summary Style State
  const [selectedSummaryStyle, setSelectedSummaryStyle] = useLocalStorage<SummaryStyleId>(
    'julir_summary_style',
    DEFAULT_SUMMARY_STYLE
  );

  // Mood State
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);

  // -------------------------------------------------------------------------
  // REFS
  // -------------------------------------------------------------------------

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isWrappingUpRef = useRef(false);
  const autoListenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------------------
  // DERIVED STATE
  // -------------------------------------------------------------------------

  const character = useMemo(() => getCharacter(selectedCharacter), [selectedCharacter]);
  const colors = useMemo(() => getColorScheme(character.color, theme), [character.color, theme]);
  const isDark = theme === 'dark';
  const geminiService = useMemo(() => createGeminiService(geminiApiKey), [geminiApiKey]);

  const displayName = useMemo(() => getDisplayName(userProfile.name), [userProfile.name]);
  const hasValidName = useMemo(() => isValidName(userProfile.name), [userProfile.name]);

  const moodStats = useMemo(() => calculateMoodStats(savedEntries), [savedEntries]);

  const filteredEntries = useMemo(() => {
    let filtered = savedEntries;
    if (moodFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.mood === moodFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (entry) =>
          entry.content.toLowerCase().includes(query) ||
          entry.title.toLowerCase().includes(query) ||
          entry.date.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [savedEntries, searchQuery, moodFilter]);

  const entriesByDate = useMemo(() => groupEntriesByDate(savedEntries), [savedEntries]);

  const selectedDateEntries = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return savedEntries.filter((entry) => entry.date === selectedCalendarDate);
  }, [savedEntries, selectedCalendarDate]);

  const calendarDays = useMemo(
    () => getCalendarDays(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  );

  // Calculate current streak (consecutive days with entries)
  const currentStreak = useMemo(() => {
    if (savedEntries.length === 0) return 0;

    // Parse dates and sort them in descending order (most recent first)
    const dates = savedEntries
      .map((entry) => {
        const [month, day, year] = entry.date.split('/').map(Number);
        return new Date(year, month - 1, day);
      })
      .sort((a, b) => b.getTime() - a.getTime());

    // Remove duplicates (multiple entries same day)
    const uniqueDates: Date[] = [];
    for (const date of dates) {
      if (uniqueDates.length === 0 || uniqueDates[uniqueDates.length - 1].toDateString() !== date.toDateString()) {
        uniqueDates.push(date);
      }
    }

    if (uniqueDates.length === 0) return 0;

    // Check if most recent entry is today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mostRecent = uniqueDates[0];
    mostRecent.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0; // Streak broken

    // Count consecutive days
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const current = uniqueDates[i - 1];
      const prev = uniqueDates[i];
      const diff = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [savedEntries]);

  // Create voice config with speed override
  const adjustedVoiceConfig = useMemo(() => ({
    ...character.voiceConfig,
    speakingRate: voiceSpeed,
  }), [character.voiceConfig, voiceSpeed]);

  // -------------------------------------------------------------------------
  // SPEECH RECOGNITION HOOK
  // -------------------------------------------------------------------------

  const {
    isRecording,
    transcript,
    setTranscript,
    startListening: startRecognition,
    stopListening: stopRecognition,
    resetTranscript,
    isSupported: isRecognitionSupported,
  } = useSpeechRecognition();

  // -------------------------------------------------------------------------
  // SPEECH SYNTHESIS HOOK
  // -------------------------------------------------------------------------

  const handleSpeechEnd = useCallback(() => {
    // Auto-listen after speech ends (if not wrapping up and no diary)
    if (!isWrappingUpRef.current && !diaryEntry) {
      if (autoListenTimerRef.current) {
        clearTimeout(autoListenTimerRef.current);
      }
      autoListenTimerRef.current = setTimeout(() => {
        startRecognition();
      }, SPEECH_CONFIG.AUTO_LISTEN_DELAY);
    }
  }, [diaryEntry, startRecognition]);

  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis({
    apiKey: googleTtsApiKey,
    voiceConfig: adjustedVoiceConfig,
    enabled: soundEnabled,
    onEnd: handleSpeechEnd,
  });

  // -------------------------------------------------------------------------
  // SPEECH COORDINATION
  // -------------------------------------------------------------------------

  /**
   * Speak text - stops recognition first, then speaks
   */
  const speakText = useCallback(
    async (text: string) => {
      // Stop recognition before speaking
      stopRecognition();

      // Clear any pending auto-listen timer
      if (autoListenTimerRef.current) {
        clearTimeout(autoListenTimerRef.current);
      }

      // Speak the text (onEnd callback handles auto-listen)
      await speak(text);
    },
    [stopRecognition, speak]
  );

  const startListening = useCallback(() => {
    if (!isRecognitionSupported) {
      alert('Speech recognition not supported. Try Chrome.');
      return;
    }
    startRecognition();
  }, [isRecognitionSupported, startRecognition]);

  const stopListening = useCallback(() => {
    stopRecognition();
  }, [stopRecognition]);

  const toggleRecording = useCallback(() => {
    if (!isRecognitionSupported) {
      alert('Speech recognition not supported. Try Chrome.');
      return;
    }
    if (isRecording) {
      stopRecognition();
    } else {
      startRecognition();
    }
  }, [isRecognitionSupported, isRecording, startRecognition, stopRecognition]);

  // -------------------------------------------------------------------------
  // EFFECTS
  // -------------------------------------------------------------------------

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasValidName) {
      setShowProfileSetup(true);
    }
  }, [hasValidName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup auto-listen timer on unmount
  useEffect(() => {
    return () => {
      if (autoListenTimerRef.current) {
        clearTimeout(autoListenTimerRef.current);
      }
    };
  }, []);

  // Auto-save diary entry draft
  useEffect(() => {
    if (diaryEntry) {
      setDraftEntry(diaryEntry);
    }
  }, [diaryEntry, setDraftEntry]);

  // Auto-save messages periodically (every 30 seconds when there are messages)
  useEffect(() => {
    if (messages.length > 0 && hasStarted) {
      const saveTimer = setTimeout(() => {
        setDraftMessages(messages);
      }, 30000);
      return () => clearTimeout(saveTimer);
    }
  }, [messages, hasStarted, setDraftMessages]);

  // Save messages immediately when session ends
  useEffect(() => {
    if (!hasStarted && messages.length > 0) {
      setDraftMessages(messages);
    }
  }, [hasStarted, messages, setDraftMessages]);

  // -------------------------------------------------------------------------
  // MESSAGE HANDLERS
  // -------------------------------------------------------------------------

  const handleSendMessage = useCallback(
    async (text: string) => {
      const cleanText = correctTranscript(text.trim());
      if (!cleanText) return;

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
      resetTranscript();
      setIsLoading(true);

      const aiResponse = await geminiService.chat({
        character,
        history: messages,
        userInput: cleanText,
        userName: displayName || undefined,
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
    [messages, character, displayName, geminiService, speakText, resetTranscript]
  );

  // Auto-send when recording stops with transcript
  useEffect(() => {
    if (!isRecording && transcript.trim().length > 1) {
      const timer = setTimeout(() => handleSendMessage(transcript), 500);
      return () => clearTimeout(timer);
    }
  }, [isRecording, transcript, handleSendMessage]);

  // -------------------------------------------------------------------------
  // SESSION HANDLERS
  // -------------------------------------------------------------------------

  const handleStartSession = useCallback(() => {
    setHasStarted(true);
    isWrappingUpRef.current = false;
    setShowCharacterSelect(false);

    let greeting = character.greeting;
    if (hasValidName && displayName) {
      greeting = greeting.replace(/Tell me/i, `${displayName}, tell me`);
    }

    const greetingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    };

    setMessages([greetingMessage]);
    speakText(greeting);
  }, [character, hasValidName, displayName, speakText]);

  const handleEndDay = useCallback(() => {
    if (messages.filter((m) => m.role === 'user').length < 1) return;

    // Stop all speech activity
    stopRecognition();
    stopSpeaking();

    // Clear timers
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
    }

    setShowStyleSelector(true);
  }, [messages, stopRecognition, stopSpeaking]);

  const generateDiaryWithStyle = useCallback(
    async (styleId: SummaryStyleId) => {
      isWrappingUpRef.current = true;
      setShowStyleSelector(false);
      setIsLoading(true);

      const entryText = await geminiService.generateDiary({
        history: messages,
        userName: displayName || undefined,
        summaryStyleId: styleId,
      });

      setDiaryEntry(entryText);
      setEditingId(null);
      setIsLoading(false);
      setSelectedSummaryStyle(styleId);
    },
    [messages, displayName, geminiService, setSelectedSummaryStyle]
  );

  const handleRestart = useCallback(() => {
    // Stop all speech activity
    stopRecognition();
    stopSpeaking();

    // Clear timers
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
    }

    // Reset state
    setMessages([]);
    resetTranscript();
    setHasStarted(false);
    setSessionCompleted(false);
    setDiaryEntry(null);
    setEditingId(null);
    isWrappingUpRef.current = false;
  }, [stopRecognition, stopSpeaking, resetTranscript]);

  // Start a completely new session (after saving)
  const startNewSession = useCallback(() => {
    // Stop all speech activity
    stopRecognition();
    stopSpeaking();

    // Clear timers
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
    }

    // Reset for new session
    setMessages([]);
    resetTranscript();
    setSessionCompleted(false);
    setDiaryEntry(null);
    setEditingId(null);
    isWrappingUpRef.current = false;

    // Start new session immediately with greeting
    let greeting = character.greeting;
    if (hasValidName && displayName) {
      greeting = greeting.replace(/Tell me/i, `${displayName}, tell me`);
    }

    const greetingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    };

    setMessages([greetingMessage]);
    speakText(greeting);
  }, [stopRecognition, stopSpeaking, resetTranscript, character, hasValidName, displayName, speakText]);

  // -------------------------------------------------------------------------
  // CALENDAR HANDLERS
  // -------------------------------------------------------------------------

  const handlePrevMonth = useCallback(() => {
    const { year, month } = getPreviousMonth(calendarYear, calendarMonth);
    setCalendarYear(year);
    setCalendarMonth(month);
    setSelectedCalendarDate(null);
  }, [calendarYear, calendarMonth]);

  const handleNextMonth = useCallback(() => {
    const { year, month } = getNextMonth(calendarYear, calendarMonth);
    setCalendarYear(year);
    setCalendarMonth(month);
    setSelectedCalendarDate(null);
  }, [calendarYear, calendarMonth]);

  const handleCalendarDayClick = useCallback(
    (day: number) => {
      const dateKey = formatDateKey(calendarYear, calendarMonth, day);
      const hasEntries = entriesByDate.has(dateKey);
      if (hasEntries) {
        setSelectedCalendarDate(dateKey);
      }
    },
    [calendarYear, calendarMonth, entriesByDate]
  );

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth());
    setSelectedCalendarDate(null);
  }, []);

  const clearSearchAndFilters = useCallback(() => {
    setSearchQuery('');
    setMoodFilter('all');
    setSelectedCalendarDate(null);
  }, []);

  // -------------------------------------------------------------------------
  // ENTRY HANDLERS
  // -------------------------------------------------------------------------

  const saveEntry = useCallback(() => {
    if (!diaryEntry) return;

    const title = diaryEntry.split('\n')[0] || 'Untitled';
    const isNewEntry = !editingId;

    if (editingId) {
      const updated = savedEntries.map((entry) =>
        entry.id === editingId
          ? { ...entry, content: diaryEntry, title, mood: selectedMood || entry.mood }
          : entry
      );
      setSavedEntries(updated);
    } else {
      const newEntry: DiaryEntry = {
        id: generateId(),
        date: new Date().toLocaleDateString(),
        title,
        content: diaryEntry,
        mood: selectedMood || undefined,
        characterId: selectedCharacter,
        summaryStyleId: selectedSummaryStyle,
      };
      setSavedEntries([newEntry, ...savedEntries]);
    }

    setDiaryEntry(null);
    setEditingId(null);
    setSelectedMood(null);
    isWrappingUpRef.current = false;

    // Clear drafts after saving
    setDraftEntry(null);
    setDraftMessages([]);

    // Mark session as completed for new entries (not edits)
    if (isNewEntry) {
      setSessionCompleted(true);
    }
  }, [
    diaryEntry,
    editingId,
    savedEntries,
    setSavedEntries,
    selectedCharacter,
    selectedSummaryStyle,
    selectedMood,
    setDraftEntry,
    setDraftMessages,
  ]);

  const deleteEntry = useCallback(
    (id: string) => {
      setSavedEntries(savedEntries.filter((e) => e.id !== id));
    },
    [savedEntries, setSavedEntries]
  );

  const togglePinEntry = useCallback(
    (id: string) => {
      setSavedEntries(
        savedEntries.map((entry) =>
          entry.id === id ? { ...entry, isPinned: !entry.isPinned } : entry
        )
      );
    },
    [savedEntries, setSavedEntries]
  );

  const updateEntryTags = useCallback(
    (id: string, tags: string[]) => {
      setSavedEntries(
        savedEntries.map((entry) =>
          entry.id === id ? { ...entry, tags } : entry
        )
      );
    },
    [savedEntries, setSavedEntries]
  );

  // Get all unique tags from entries
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    savedEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [savedEntries]);

  // Check if there's a draft to restore
  const hasDraft = useMemo(() => {
    return !!(draftEntry || (draftMessages && draftMessages.length > 0));
  }, [draftEntry, draftMessages]);

  // Restore saved draft
  const restoreDraft = useCallback(() => {
    if (draftMessages && draftMessages.length > 0) {
      setMessages(draftMessages);
      setHasStarted(true);
    }
    if (draftEntry) {
      setDiaryEntry(draftEntry);
    }
  }, [draftMessages, draftEntry]);

  // Clear all drafts
  const clearDraft = useCallback(() => {
    setDraftEntry(null);
    setDraftMessages([]);
  }, [setDraftEntry, setDraftMessages]);

  // -------------------------------------------------------------------------
  // PROFILE HANDLERS
  // -------------------------------------------------------------------------

  const handleSaveProfile = useCallback(
    (name: string) => {
      const sanitized = sanitizeName(name);
      if (!sanitized) return;

      setUserProfile({
        name: sanitized,
        createdAt: userProfile.createdAt || new Date(),
        lastActiveAt: new Date(),
      });
      setShowProfileSetup(false);
    },
    [userProfile.createdAt, setUserProfile]
  );

  // -------------------------------------------------------------------------
  // CONTEXT VALUE
  // -------------------------------------------------------------------------

  const value: AppContextType = {
    // User Profile
    userProfile,
    setUserProfile,
    displayName,
    hasValidName,

    // Session State
    hasStarted,
    setHasStarted,
    sessionCompleted,
    messages,
    setMessages,
    transcript,
    setTranscript,
    isRecording,
    isSpeaking,
    isLoading,
    setIsLoading,

    // Diary State
    diaryEntry,
    setDiaryEntry,
    editingId,
    setEditingId,
    savedEntries,
    setSavedEntries,

    // Settings
    selectedCharacter,
    setSelectedCharacter,
    theme,
    setTheme,
    voiceSpeed,
    setVoiceSpeed,
    soundEnabled,
    setSoundEnabled,
    geminiApiKey,
    setGeminiApiKey,
    googleTtsApiKey,
    setGoogleTtsApiKey,

    // UI State
    showSettings,
    setShowSettings,
    showHistory,
    setShowHistory,
    showCharacterSelect,
    setShowCharacterSelect,
    showStyleSelector,
    setShowStyleSelector,
    showInsights,
    setShowInsights,
    showProfileSetup,
    setShowProfileSetup,
    currentTime,

    // Summary Style
    selectedSummaryStyle,
    setSelectedSummaryStyle,

    // Mood State
    selectedMood,
    setSelectedMood,
    moodStats,

    // Search & Calendar
    searchQuery,
    setSearchQuery,
    historyViewMode,
    setHistoryViewMode,
    calendarYear,
    setCalendarYear,
    calendarMonth,
    setCalendarMonth,
    selectedCalendarDate,
    setSelectedCalendarDate,
    moodFilter,
    setMoodFilter,
    showFilters,
    setShowFilters,

    // Derived State
    character,
    colors,
    isDark,
    filteredEntries,
    entriesByDate,
    selectedDateEntries,
    calendarDays,
    currentStreak,

    // Refs (only those needed by components)
    messagesEndRef,
    isWrappingUpRef,

    // Handlers
    speakText,
    startListening,
    stopListening,
    toggleRecording,
    handleSendMessage,
    handleStartSession,
    handleEndDay,
    generateDiaryWithStyle,
    handleRestart,
    handlePrevMonth,
    handleNextMonth,
    handleCalendarDayClick,
    handleGoToToday,
    clearSearchAndFilters,
    saveEntry,
    deleteEntry,
    togglePinEntry,
    updateEntryTags,
    handleSaveProfile,
    allTags,
    hasDraft,
    restoreDraft,
    clearDraft,
    startNewSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
