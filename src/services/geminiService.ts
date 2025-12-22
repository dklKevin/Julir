/**
 * Service for interacting with Google Gemini API.
 * Handles chat completions and diary entry generation.
 */

import type { Message, Character, SummaryStyleId } from '../types';
import { API_ENDPOINTS, getSummaryStyle, DEFAULT_SUMMARY_STYLE } from '../constants';
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
  /** Summary style for generation */
  summaryStyleId?: SummaryStyleId;
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
   * Generate diary entry from conversation with expressive summary styles.
   */
  async generateDiary(options: DiaryOptions): Promise<string> {
    const { history, userName, summaryStyleId = DEFAULT_SUMMARY_STYLE } = options;

    // Get the selected summary style
    const summaryStyle = getSummaryStyle(summaryStyleId);

    // Extract messages with context
    const userMessages = history
      .filter((m) => m.role === 'user')
      .map((m) => m.content);

    const dateStr = formatDate(new Date());
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

    if (!this.apiKey) {
      // Generate demo entry based on style
      const content = userMessages.join('. ') || 'I took some time to reflect.';
      return this.generateDemoEntry(dateStr, content, summaryStyle.id);
    }

    try {
      // Build comprehensive conversation context
      const conversationContext = history.map((m) => {
        const prefix = m.role === 'user' ? 'I said' : 'Companion responded';
        return `${prefix}: "${m.content}"`;
      }).join('\n');

      // Build the full expressive prompt
      const fullPrompt = `${summaryStyle.prompt}

CONTEXT:
- Date: ${dateStr} (${dayOfWeek})
- Time: ${timeOfDay}
${userName ? `- Writer's name: ${userName}` : ''}

THE FULL CONVERSATION:
${conversationContext}

KEY THINGS THE USER SHARED:
${userMessages.map((m, i) => `${i + 1}. "${m}"`).join('\n')}

Now write the diary entry in first person. Start directly with the content - do NOT include the date as it will be added automatically. Make sure to weave together EVERYTHING they shared into a cohesive, ${summaryStyle.name.toLowerCase()} narrative.`;

      const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let entry = data.candidates[0].content.parts[0].text;

      // Clean up the entry - remove any date if AI included it at the start
      entry = entry.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i, '');
      entry = entry.replace(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{0,4}\s*/i, '');
      entry = entry.replace(/^\d{1,2}\/\d{1,2}\/\d{2,4}\s*/i, '');

      return `${dateStr}\n\n${entry.trim()}`;
    } catch (error) {
      console.error('Diary generation error:', error);
      return `${dateStr}\n\nError generating entry. Please try again.`;
    }
  }

  /**
   * Generate a demo entry when no API key is available
   */
  private generateDemoEntry(dateStr: string, content: string, styleId: SummaryStyleId): string {
    const demoEntries: Record<SummaryStyleId, string> = {
      reflective: `${dateStr}\n\nAs I sit with the quiet of this moment, I find myself reflecting on what unfolded today. ${content}\n\nThere's something about putting these thoughts into words that helps me see the threads connecting one moment to the next. Today reminded me that even ordinary days carry meaning when we pause to notice them.\n\nI wonder what tomorrow will bring, and what new understanding I'll find there.`,

      upbeat: `${dateStr}\n\nWhat a day! ${content}\n\nLooking back, I'm grateful for the moments that made me smile today. Even the challenging parts had their silver linings - they're teaching me something, helping me grow.\n\nI'm ending this day with a warm feeling in my chest and genuine excitement for what's next. Here's to more days like this one!`,

      storyteller: `${dateStr}\n\nThe day began like any other, but as it unfolded, it became uniquely mine.\n\n${content}\n\nIf I were to tell this story to someone, I'd want them to know that today mattered. Not because anything extraordinary happened, but because I was here, fully present, writing my own chapter.\n\nAnd so the day draws to a close, another page turned in the book of my life.`,

      minimal: `${dateStr}\n\n${content}\n\nSome days speak in whispers.\n\nThis was one of them.\n\nEnough.`,
    };

    return demoEntries[styleId];
  }
}

/**
 * Create a new Gemini service instance.
 */
export const createGeminiService = (apiKey: string): GeminiService => {
  return new GeminiService({ apiKey });
};
