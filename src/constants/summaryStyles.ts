/**
 * Summary Style Definitions
 * Four distinct vibes for diary entry generation.
 * Each style produces a different emotional tone and structure.
 */

import type { SummaryStyleId, SummaryStyle } from '../types';

/**
 * The four summary styles available for diary generation.
 * Each creates a unique, expressive entry that wraps up the user's day.
 */
export const SUMMARY_STYLES: Record<SummaryStyleId, SummaryStyle> = {
  reflective: {
    id: 'reflective',
    name: 'Reflective',
    emoji: '🌙',
    description: 'Thoughtful & introspective',
    color: 'indigo',
    keywords: ['deep', 'mindful', 'contemplative'],
    prompt: `Write a deeply reflective and introspective diary entry based on this conversation.

STYLE: Thoughtful, contemplative, and deeply personal. Like a late-night journal entry by candlelight.

STRUCTURE:
1. Opening: Set the emotional scene of the day with sensory details
2. Body: Weave together everything the user shared - their experiences, feelings, encounters, and thoughts. Connect the dots between different moments they mentioned.
3. Reflection: Explore the deeper meaning or patterns in what they experienced
4. Closing: End with a gentle insight or question for tomorrow

TONE:
- Write in first person, as if the user is writing their own diary
- Use rich, evocative language that captures the texture of their day
- Draw connections between different things they mentioned
- Include moments of pause and wonder
- Be genuine, not overly poetic - this is real life, not fiction

LENGTH: 4-6 meaningful paragraphs that feel complete and satisfying.

IMPORTANT:
- Incorporate EVERYTHING significant the user mentioned
- Tie together different threads from their day into a cohesive narrative
- Capture their actual emotions and experiences, don't invent new ones
- Make them feel truly heard and their day truly captured`,
  },

  upbeat: {
    id: 'upbeat',
    name: 'Upbeat',
    emoji: '☀️',
    description: 'Positive & energizing',
    color: 'amber',
    keywords: ['bright', 'grateful', 'hopeful'],
    prompt: `Write an upbeat, positive diary entry based on this conversation that celebrates the day.

STYLE: Warm, optimistic, and energizing. Like a sunny morning journal entry with your favorite coffee.

STRUCTURE:
1. Opening: Start with genuine appreciation for something from their day
2. Highlights: Capture all the good moments, wins (big or small), and things that brought joy
3. Silver Linings: If they mentioned challenges, acknowledge them but find the growth or lesson
4. Forward Look: End with excitement or hope for what's ahead

TONE:
- Write in first person, as the user reflecting on their day
- Be genuinely positive without being fake or dismissive of real struggles
- Find the bright spots and moments worth celebrating
- Use warm, inviting language that feels like a hug
- Sprinkle in gratitude naturally throughout

LENGTH: 4-5 paragraphs that leave a warm glow.

IMPORTANT:
- Include ALL the positive moments they mentioned
- If they shared difficulties, acknowledge them with compassion then pivot to resilience
- Tie everything together to show it was a day worth living
- Make them smile when they read it back`,
  },

  storyteller: {
    id: 'storyteller',
    name: 'Storyteller',
    emoji: '📖',
    description: 'Narrative & vivid',
    color: 'purple',
    keywords: ['dramatic', 'cinematic', 'immersive'],
    prompt: `Write this diary entry as a compelling narrative story based on the conversation.

STYLE: Vivid, cinematic, and engaging. Like the opening chapter of a personal memoir.

STRUCTURE:
1. Scene Setting: Drop the reader into a specific moment from their day with sensory details
2. Rising Action: Build through the events and encounters they described
3. Key Moments: Highlight the turning points, realizations, or meaningful interactions
4. Resolution: Bring the narrative threads together in a satisfying way
5. Closing Image: End with a vivid moment or image that encapsulates the day

TONE:
- Write in first person, making the user the protagonist of their own story
- Use vivid, descriptive language that paints pictures
- Include dialogue snippets if they mentioned conversations
- Create narrative tension and release
- Make ordinary moments feel meaningful and cinematic

LENGTH: 5-7 paragraphs that read like a chapter from their life story.

IMPORTANT:
- Transform everything they shared into narrative gold
- Use "show, don't tell" - describe actions and scenes, not just summaries
- Connect their experiences into a cohesive story arc
- Make their day feel like it matters, because it does`,
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    emoji: '✨',
    description: 'Clean & poetic',
    color: 'slate',
    keywords: ['elegant', 'sparse', 'powerful'],
    prompt: `Write a minimal, poetic diary entry based on this conversation. Less is more.

STYLE: Sparse, elegant, and powerful. Like a haiku expanded into prose poetry.

STRUCTURE:
1. A single striking image or moment to anchor the entry
2. Brief, powerful sentences that capture the essence of what they shared
3. White space and breathing room between thoughts
4. A final line that lingers

TONE:
- Write in first person, distilling their day to its essence
- Every word must earn its place
- Use line breaks and short paragraphs for rhythm
- Capture feeling through imagery, not explanation
- Leave room for the reader to fill in the spaces

FORMAT:
- Use short paragraphs, often just 1-2 sentences
- Include intentional white space (empty lines between sections)
- Think of it as prose poetry

LENGTH: Brief but complete - quality over quantity. Around 8-15 carefully chosen lines.

IMPORTANT:
- Distill everything they mentioned into its purest form
- Find the single thread that ties their day together
- Make each word count
- Create something they'll want to read again`,
  },
};

/**
 * Default summary style
 */
export const DEFAULT_SUMMARY_STYLE: SummaryStyleId = 'reflective';

/**
 * Get all summary style IDs
 */
export const getSummaryStyleIds = (): SummaryStyleId[] => {
  return Object.keys(SUMMARY_STYLES) as SummaryStyleId[];
};

/**
 * Get a specific summary style by ID
 */
export const getSummaryStyle = (id: SummaryStyleId): SummaryStyle => {
  return SUMMARY_STYLES[id];
};

/**
 * Get color scheme classes for a summary style
 */
export const getSummaryStyleColors = (styleId: SummaryStyleId, isDark: boolean) => {
  const style = SUMMARY_STYLES[styleId];
  const colorMap: Record<string, { bg: string; accent: string; border: string; soft: string }> = {
    indigo: {
      bg: isDark ? 'bg-indigo-900/20' : 'bg-indigo-50',
      accent: isDark ? 'text-indigo-400' : 'text-indigo-600',
      border: isDark ? 'border-indigo-800' : 'border-indigo-200',
      soft: isDark ? 'bg-indigo-900/30' : 'bg-indigo-100/50',
    },
    amber: {
      bg: isDark ? 'bg-amber-900/20' : 'bg-amber-50',
      accent: isDark ? 'text-amber-400' : 'text-amber-600',
      border: isDark ? 'border-amber-800' : 'border-amber-200',
      soft: isDark ? 'bg-amber-900/30' : 'bg-amber-100/50',
    },
    purple: {
      bg: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
      accent: isDark ? 'text-purple-400' : 'text-purple-600',
      border: isDark ? 'border-purple-800' : 'border-purple-200',
      soft: isDark ? 'bg-purple-900/30' : 'bg-purple-100/50',
    },
    slate: {
      bg: isDark ? 'bg-slate-800/50' : 'bg-slate-50',
      accent: isDark ? 'text-slate-300' : 'text-slate-600',
      border: isDark ? 'border-slate-700' : 'border-slate-200',
      soft: isDark ? 'bg-slate-800/30' : 'bg-slate-100/50',
    },
  };

  return colorMap[style.color] || colorMap.indigo;
};
