import { beforeEach, describe, expect, it, vi } from 'vitest';

const platformMocks = vi.hoisted(() => ({
  isNative: vi.fn(() => false),
}));

const hapticsMocks = vi.hoisted(() => ({
  impact: vi.fn(),
  notification: vi.fn(),
  vibrate: vi.fn(),
  selectionStart: vi.fn(),
  selectionChanged: vi.fn(),
  selectionEnd: vi.fn(),
}));

vi.mock('../utils/platform', () => ({
  isNative: platformMocks.isNative,
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: hapticsMocks.impact,
    notification: hapticsMocks.notification,
    vibrate: hapticsMocks.vibrate,
    selectionStart: hapticsMocks.selectionStart,
    selectionChanged: hapticsMocks.selectionChanged,
    selectionEnd: hapticsMocks.selectionEnd,
  },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
  NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
}));

import { haptic, hapticCustom, hapticStop, supportsHaptics } from '../utils/haptics';

describe('haptics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    platformMocks.isNative.mockReturnValue(false);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('detects web vibration support', () => {
    expect(supportsHaptics()).toBe(true);
    platformMocks.isNative.mockReturnValue(true);
    expect(supportsHaptics()).toBe(true);
  });

  it('uses the Vibration API on web', async () => {
    await haptic('light');
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
    await haptic('success');
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 50, 30]);
    await hapticCustom([10, 20, 10]);
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 20, 10]);
    hapticStop();
    expect(navigator.vibrate).toHaveBeenCalledWith(0);
  });

  it('uses Capacitor haptics on native', async () => {
    platformMocks.isNative.mockReturnValue(true);

    await haptic('light');
    expect(hapticsMocks.impact).toHaveBeenCalledWith({ style: 'LIGHT' });
    await haptic('medium');
    expect(hapticsMocks.impact).toHaveBeenCalledWith({ style: 'MEDIUM' });
    await haptic('heavy');
    expect(hapticsMocks.impact).toHaveBeenCalledWith({ style: 'HEAVY' });
    await haptic('success');
    expect(hapticsMocks.notification).toHaveBeenCalledWith({ type: 'SUCCESS' });
    await haptic('warning');
    expect(hapticsMocks.notification).toHaveBeenCalledWith({ type: 'WARNING' });
    await haptic('error');
    expect(hapticsMocks.notification).toHaveBeenCalledWith({ type: 'ERROR' });
    await haptic('selection');
    expect(hapticsMocks.selectionStart).toHaveBeenCalled();
    expect(hapticsMocks.selectionChanged).toHaveBeenCalled();
    expect(hapticsMocks.selectionEnd).toHaveBeenCalled();
    await hapticCustom(40);
    expect(hapticsMocks.vibrate).toHaveBeenCalled();
  });

  it('swallows haptic errors', async () => {
    hapticsMocks.impact.mockRejectedValueOnce(new Error('no haptic'));
    platformMocks.isNative.mockReturnValue(true);
    await expect(haptic('medium')).resolves.toBeUndefined();

    (navigator.vibrate as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('blocked');
    });
    platformMocks.isNative.mockReturnValue(false);
    await expect(hapticCustom(10)).resolves.toBeUndefined();
    expect(() => hapticStop()).not.toThrow();
  });
});
