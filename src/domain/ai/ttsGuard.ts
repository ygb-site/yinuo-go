import type { SpeakableText } from './types';
import { guardResponse } from './responseGuard';

/**
 * Prepares approved speakable text by stripping emojis and symbols for child speech synthesis
 */
export function prepareForSpeech(text: string): SpeakableText | null {
  if (!text || typeof text !== 'string') return null;

  // First pass: Run through response guard
  const verdict = guardResponse(text);
  const cleanText = verdict.action === 'reject' ? verdict.fallbackText : verdict.text;

  // Second pass: Strip emojis, markdown, and format coordinates for pleasant pronunciation
  let speakable = cleanText
    .replace(/[^一-龥a-zA-Z0-9，。！？、：；,.!?:; ]/g, '')
    .trim();

  // Limit to max 120 chars for comfortable speech length
  if (speakable.length > 120) {
    const periodIdx = speakable.indexOf('。', 60);
    if (periodIdx !== -1 && periodIdx <= 120) {
      speakable = speakable.slice(0, periodIdx + 1);
    } else {
      speakable = speakable.slice(0, 120) + '。';
    }
  }

  if (!speakable) return null;

  return speakable as SpeakableText;
}
