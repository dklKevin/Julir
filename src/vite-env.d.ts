/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * All VITE_ prefixed variables are available in the app
 * and are public. Do not add API keys here.
 */
interface ImportMetaEnv {
  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;

  // API Endpoints
  readonly VITE_GEMINI_API_ENDPOINT: string;
  readonly VITE_GOOGLE_TTS_ENDPOINT: string;

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_ERROR_TRACKING: string;
  readonly VITE_DEMO_MODE: string;

  // Speech Configuration
  readonly VITE_SPEECH_LANGUAGE: string;
  readonly VITE_SILENCE_TIMEOUT: string;
  readonly VITE_MAX_RECORDING_DURATION: string;
  readonly VITE_AUTO_LISTEN_DELAY: string;

  // External Services
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_SENTRY_DSN?: string;

  // Build Configuration
  readonly VITE_BASE_URL: string;

  // Vite Built-in
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Global type definitions for build-time constants
 */
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
