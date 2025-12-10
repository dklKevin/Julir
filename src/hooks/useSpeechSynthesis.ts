/**
 * Custom hook for text-to-speech using Google Cloud TTS with browser fallback.
 */

import { useState, useRef, useCallback } from 'react';
import type { VoiceConfig } from '../types';
import { API_ENDPOINTS } from '../constants';
import { prepareForSpeech } from '../utils/textUtils';

interface UseSpeechSynthesisOptions {
  /** Google Cloud TTS API key (falls back to browser TTS if not provided) */
  apiKey?: string;
  /** Voice configuration */
  voiceConfig: VoiceConfig;
  /** Whether sound is enabled */
  enabled?: boolean;
  /** Called when speech ends */
  onEnd?: () => void;
}

interface UseSpeechSynthesisReturn {
  /** Whether currently speaking */
  isSpeaking: boolean;
  /** Speak the given text */
  speak: (text: string) => Promise<void>;
  /** Stop current speech */
  stop: () => void;
}

/**
 * Hook for managing text-to-speech.
 */
export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions
): UseSpeechSynthesisReturn {
  const { apiKey, voiceConfig, enabled = true, onEnd } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Stop current audio playback.
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  /**
   * Speak using browser's built-in TTS (fallback).
   */
  const speakWithBrowserTTS = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceConfig.speakingRate;
        utterance.pitch = 1 + voiceConfig.pitch / 10;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          onEnd?.();
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [voiceConfig, onEnd]
  );

  /**
   * Speak using Google Cloud TTS API.
   */
  const speakWithGoogleTTS = useCallback(
    async (text: string): Promise<void> => {
      if (!apiKey) {
        return speakWithBrowserTTS(text);
      }

      try {
        setIsSpeaking(true);

        const response = await fetch(`${API_ENDPOINTS.GOOGLE_TTS}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: voiceConfig.languageCode,
              name: voiceConfig.name,
              ssmlGender: voiceConfig.ssmlGender,
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: voiceConfig.speakingRate,
              pitch: voiceConfig.pitch,
            },
          }),
        });

        if (!response.ok) {
          console.error('TTS API error, falling back to browser TTS');
          return speakWithBrowserTTS(text);
        }

        const data = await response.json();
        const audioContent = data.audioContent;

        // Convert base64 to audio blob
        const audioBlob = new Blob(
          [Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        return new Promise((resolve) => {
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            onEnd?.();
            resolve();
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            speakWithBrowserTTS(text).then(resolve);
          };

          audio.play().catch(() => {
            speakWithBrowserTTS(text).then(resolve);
          });
        });
      } catch (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);
        return speakWithBrowserTTS(text);
      }
    },
    [apiKey, voiceConfig, speakWithBrowserTTS, onEnd]
  );

  /**
   * Main speak function - prepares text and speaks.
   */
  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!enabled || !text.trim()) return;

      // Stop any current playback
      stop();

      // Prepare text for speech (phonetic conversions, remove problematic chars)
      const speechText = prepareForSpeech(text);

      if (apiKey) {
        return speakWithGoogleTTS(speechText);
      } else {
        return speakWithBrowserTTS(speechText);
      }
    },
    [enabled, apiKey, speakWithGoogleTTS, speakWithBrowserTTS, stop]
  );

  return {
    isSpeaking,
    speak,
    stop,
  };
}
