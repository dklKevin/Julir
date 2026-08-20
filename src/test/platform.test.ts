import { beforeEach, describe, expect, it, vi } from 'vitest';

const capacitorMocks = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => false),
  getPlatform: vi.fn(() => 'web'),
  isPluginAvailable: vi.fn(() => false),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: capacitorMocks.isNativePlatform,
    getPlatform: capacitorMocks.getPlatform,
    isPluginAvailable: capacitorMocks.isPluginAvailable,
  },
}));

import {
  getPlatform,
  isAndroid,
  isIOS,
  isNative,
  isPluginAvailable,
  isWeb,
} from '../utils/platform';

describe('platform', () => {
  beforeEach(() => {
    capacitorMocks.isNativePlatform.mockReturnValue(false);
    capacitorMocks.getPlatform.mockReturnValue('web');
    capacitorMocks.isPluginAvailable.mockReturnValue(false);
  });

  it('reports web by default', () => {
    expect(isNative()).toBe(false);
    expect(isWeb()).toBe(true);
    expect(isIOS()).toBe(false);
    expect(isAndroid()).toBe(false);
    expect(getPlatform()).toBe('web');
    expect(isPluginAvailable('Haptics')).toBe(false);
  });

  it('detects native iOS', () => {
    capacitorMocks.isNativePlatform.mockReturnValue(true);
    capacitorMocks.getPlatform.mockReturnValue('ios');
    capacitorMocks.isPluginAvailable.mockReturnValue(true);

    expect(isNative()).toBe(true);
    expect(isIOS()).toBe(true);
    expect(isAndroid()).toBe(false);
    expect(isWeb()).toBe(false);
    expect(getPlatform()).toBe('ios');
    expect(isPluginAvailable('SpeechRecognition')).toBe(true);
  });

  it('detects Android', () => {
    capacitorMocks.getPlatform.mockReturnValue('android');
    expect(isAndroid()).toBe(true);
    expect(getPlatform()).toBe('android');
  });
});
