/**
 * Custom hook for Web Speech API speech recognition.
 * Handles browser compatibility and provides clean interface.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { SPEECH_CONFIG } from '../constants';
import { correctTranscript } from '../utils/textUtils';

interface UseSpeechRecognitionOptions {
  /** Called when transcript changes */
  onTranscript?: (transcript: string) => void;
  /** Called when recording ends */
  onEnd?: (finalTranscript: string) => void;
  /** Silence timeout in ms */
  silenceTimeout?: number;
  /** Max recording duration in ms */
  maxDuration?: number;
}

interface UseSpeechRecognitionReturn {
  /** Whether currently recording */
  isRecording: boolean;
  /** Current transcript */
  transcript: string;
  /** Set transcript manually (for text input) */
  setTranscript: (text: string) => void;
  /** Start recording */
  startListening: () => void;
  /** Stop recording */
  stopListening: () => void;
  /** Clear transcript */
  resetTranscript: () => void;
  /** Whether speech recognition is supported */
  isSupported: boolean;
}

/**
 * Hook for managing speech recognition.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    onTranscript,
    onEnd,
    silenceTimeout = SPEECH_CONFIG.SILENCE_TIMEOUT,
    maxDuration = SPEECH_CONFIG.MAX_DURATION,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>('');

  // Check for browser support and initialize
  useEffect(() => {
    // Web Speech API may be prefixed in some browsers
    const windowWithSpeech = window as Window & {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SpeechRecognitionAPI =
      windowWithSpeech.SpeechRecognition ||
      windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = SPEECH_CONFIG.LANGUAGE;

    recognition.onstart = () => {
      setIsRecording(true);

      // Set max duration timer
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
      maxDurationTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, maxDuration);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }

      const corrected = correctTranscript(currentTranscript);
      transcriptRef.current = corrected;
      setTranscript(corrected);
      onTranscript?.(corrected);

      // Reset silence timer on each result
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, silenceTimeout);
    };

    recognition.onend = () => {
      setIsRecording(false);

      // Clear timers and null refs to prevent memory leaks
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }

      onEnd?.(transcriptRef.current);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);

      // Clear timers on error to prevent memory leaks
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount or dependency change
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [silenceTimeout, maxDuration, onTranscript, onEnd]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isRecording) return;

    try {
      transcriptRef.current = '';
      setTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }, [isRecording]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
  }, []);

  const setTranscriptManual = useCallback((text: string) => {
    transcriptRef.current = text;
    setTranscript(text);
  }, []);

  return {
    isRecording,
    transcript,
    setTranscript: setTranscriptManual,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
}
