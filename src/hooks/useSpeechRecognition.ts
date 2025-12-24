/**
 * Custom hook for speech recognition.
 * Uses native Capacitor plugin on iOS/Android, falls back to Web Speech API on web.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition';
import { SPEECH_CONFIG } from '../constants';
import { correctTranscript } from '../utils/textUtils';
import { isNative, isPluginAvailable } from '../utils/platform';

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
 * Uses native APIs on iOS/Android for better performance and accuracy.
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
  const useNativeRef = useRef<boolean>(false);
  const nativeListenerRef = useRef<(() => void) | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const initRecognition = async () => {
      // Check if running on native platform with speech recognition available
      if (isNative() && isPluginAvailable('SpeechRecognition')) {
        try {
          // Request permissions on native
          const { speechRecognition, microphone } = await NativeSpeechRecognition.requestPermissions();
          if (speechRecognition === 'granted' && microphone === 'granted') {
            useNativeRef.current = true;
            setIsSupported(true);
            return;
          }
        } catch (error) {
          console.warn('Native speech recognition not available:', error);
        }
      }

      // Fall back to Web Speech API
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
      useNativeRef.current = false;

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

        // Clear timers
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

        // Clear timers on error
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
    };

    initRecognition();

    // Cleanup on unmount
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      if (nativeListenerRef.current) {
        nativeListenerRef.current();
        nativeListenerRef.current = null;
      }
    };
  }, [silenceTimeout, maxDuration, onTranscript, onEnd]);

  const startListening = useCallback(async () => {
    if (isRecording) return;

    try {
      transcriptRef.current = '';
      setTranscript('');

      if (useNativeRef.current) {
        // Use native Capacitor speech recognition
        setIsRecording(true);

        // Set up listener for partial results
        const listener = await NativeSpeechRecognition.addListener(
          'partialResults',
          (data: { matches: string[] }) => {
            if (data.matches && data.matches.length > 0) {
              const corrected = correctTranscript(data.matches[0]);
              transcriptRef.current = corrected;
              setTranscript(corrected);
              onTranscript?.(corrected);

              // Reset silence timer
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
              }
              silenceTimerRef.current = setTimeout(() => {
                NativeSpeechRecognition.stop();
              }, silenceTimeout);
            }
          }
        );
        nativeListenerRef.current = () => listener.remove();

        // Set max duration timer
        if (maxDurationTimerRef.current) {
          clearTimeout(maxDurationTimerRef.current);
        }
        maxDurationTimerRef.current = setTimeout(() => {
          NativeSpeechRecognition.stop();
        }, maxDuration);

        // Start listening
        await NativeSpeechRecognition.start({
          language: SPEECH_CONFIG.LANGUAGE,
          partialResults: true,
          popup: false,
        });
      } else if (recognitionRef.current) {
        // Use Web Speech API
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
    }
  }, [isRecording, onTranscript, silenceTimeout, maxDuration]);

  const stopListening = useCallback(async () => {
    try {
      if (useNativeRef.current) {
        await NativeSpeechRecognition.stop();
        setIsRecording(false);

        // Clear timers
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (maxDurationTimerRef.current) {
          clearTimeout(maxDurationTimerRef.current);
          maxDurationTimerRef.current = null;
        }

        // Remove listener
        if (nativeListenerRef.current) {
          nativeListenerRef.current();
          nativeListenerRef.current = null;
        }

        onEnd?.(transcriptRef.current);
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setIsRecording(false);
    }
  }, [onEnd]);

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
