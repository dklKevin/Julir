/**
 * Service for interacting with Google Gemini API.
 * Handles chat completions and diary entry generation.
 */

import type { Message, Character } from '../types';
import { API_ENDPOINTS, DIARY_PROMPT } from '../constants';
import { formatDate } from '../utils/textUtils';

interface GeminiServiceOptions {
  /** Gemini API key */
  apiKey: string;
}

interface ChatOptions {
  /** Character for personality */
  character: Character;
  /** Message history */
  history: Message[];
  /** New user input */
  userInput: string;
  /** User's name for personalization */
  userName?: string;
}

interface DiaryOptions {
  /** Message history */
  history: Message[];
  /** User's name */
  userName?: string;
}

/**
 * Service class for Gemini API interactions.
 */
export class GeminiService {
  private apiKey: string;

  constructor(options: GeminiServiceOptions) {
    this.apiKey = options.apiKey;
  }

  /**
   * Check if service is configured with API key.
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Generate chat response from Gemini.
   */
  async chat(options: ChatOptions): Promise<string> {
    const { character, history, userInput, userName } = options;

    if (!this.apiKey) {
      // Return random demo response
      const responses = character.demoResponses;
      return responses[Math.floor(Math.random() * responses.length)];
    }

    try {
      // Build system prompt with user name if available
      let systemPrompt = character.systemPrompt;
      if (userName) {
        systemPrompt += `\n\nThe user's name is ${userName}. You may occasionally use their name naturally in conversation.`;
      }
      systemPrompt += '\n\nKeep responses to 1-2 sentences. Be conversational but brief.';

      const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...history.map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
            { role: 'user', parts: [{ text: userInput }] },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Having trouble connecting. Please check your API key.';
    }
  }

  /**
   * Generate diary entry from conversation.
   */
  async generateDiary(options: DiaryOptions): Promise<string> {
    const { history, userName } = options;

    // Extract only user messages
    const userMessages = history
      .filter((m) => m.role === 'user')
      .map((m) => m.content);

    const dateStr = formatDate(new Date());

    if (!this.apiKey) {
      // Generate simple demo entry
      const content = userMessages.join('. ').toLowerCase() || 'I took some time to reflect.';
      return `${dateStr}\n\nToday, ${content}`;
    }

    try {
      const userContent = userMessages.join('\n- ');
      let prompt = `${DIARY_PROMPT}\n\nWhat the user shared:\n- ${userContent}`;

      if (userName) {
        prompt = `The user's name is ${userName}.\n\n${prompt}`;
      }

      const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const entry = data.candidates[0].content.parts[0].text;

      return `${dateStr}\n\n${entry}`;
    } catch (error) {
      console.error('Diary generation error:', error);
      return `${dateStr}\n\nError generating entry.`;
    }
  }
}

/**
 * Create a new Gemini service instance.
 */
export const createGeminiService = (apiKey: string): GeminiService => {
  return new GeminiService({ apiKey });
};
