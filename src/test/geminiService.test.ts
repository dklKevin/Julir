import { afterEach, describe, expect, it, vi } from 'vitest';
import { CHARACTERS } from '../constants';
import { createGeminiService } from '../services/geminiService';
import type { Message } from '../types';

const history: Message[] = [
  { id: '1', role: 'user', content: 'Today was long.', timestamp: new Date() },
  { id: '2', role: 'assistant', content: 'Tell me more.', timestamp: new Date() },
];

describe('geminiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reports configuration from the API key', () => {
    expect(createGeminiService('').isConfigured()).toBe(false);
    expect(createGeminiService('secret').isConfigured()).toBe(true);
  });

  it('returns a demo chat reply without an API key', async () => {
    const service = createGeminiService('');
    const reply = await service.chat({
      character: CHARACTERS.julir,
      history: [],
      userInput: 'hello',
    });
    expect(CHARACTERS.julir.demoResponses).toContain(reply);
  });

  it('calls Gemini for chat and diary when a key is present', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'I hear you.' }] } }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Monday, I walked and thought.' }] } }],
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const service = createGeminiService('test-key');
    const chat = await service.chat({
      character: CHARACTERS.julir,
      history,
      userInput: 'hello',
      userName: 'Ada',
    });
    expect(chat).toBe('I hear you.');

    const diary = await service.generateDiary({
      history,
      userName: 'Ada',
      summaryStyleId: 'minimal',
    });
    expect(diary).toMatch(/I walked and thought/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns fallback text when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const service = createGeminiService('test-key');

    await expect(
      service.chat({
        character: CHARACTERS.julir,
        history: [],
        userInput: 'hello',
      })
    ).resolves.toMatch(/trouble connecting/i);

    await expect(service.generateDiary({ history })).resolves.toMatch(/Error generating entry/);
  });

  it('writes styled demo diary entries without an API key', async () => {
    const service = createGeminiService('');
    const reflective = await service.generateDiary({ history, summaryStyleId: 'reflective' });
    const upbeat = await service.generateDiary({ history: [], summaryStyleId: 'upbeat' });
    const storyteller = await service.generateDiary({ history, summaryStyleId: 'storyteller' });
    const minimal = await service.generateDiary({ history, summaryStyleId: 'minimal' });

    expect(reflective).toMatch(/reflecting on what unfolded/);
    expect(upbeat).toMatch(/I took some time to reflect/);
    expect(storyteller).toMatch(/The day began like any other/);
    expect(minimal).toMatch(/Some days speak in whispers/);
  });
});
