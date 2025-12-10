import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock SpeechRecognition
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  start() {
    if (this.onstart) this.onstart();
  }

  stop() {
    if (this.onend) this.onend();
  }

  abort() {
    if (this.onend) this.onend();
  }
}

// Mock SpeechSynthesis
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [
    {
      name: 'Google US English',
      lang: 'en-US',
      voiceURI: 'Google US English',
      default: true,
      localService: false,
    },
    {
      name: 'Microsoft David',
      lang: 'en-US',
      voiceURI: 'Microsoft David',
      default: false,
      localService: true,
    },
  ]),
  onvoiceschanged: null as (() => void) | null,
  speaking: false,
  pending: false,
  paused: false,
};

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text = '';
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(text?: string) {
    if (text) this.text = text;
  }
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Apply mocks to window
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition,
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: MockSpeechSynthesisUtterance,
});

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
