import { describe, it, expect } from 'vitest';
import { prepareForSpeech } from '../../src/domain/ai/ttsGuard';

describe('AI Safety: TTS Guard Tests', () => {
  it('strips emojis and special symbols for pleasant child speech', () => {
    const inputWithEmoji = '🌟 恭喜你答对啦！【正解】落在 C3，做成两只独立真眼！🎉';
    const speakable = prepareForSpeech(inputWithEmoji);

    expect(speakable).toBeDefined();
    expect(speakable).not.toContain('🌟');
    expect(speakable).not.toContain('🎉');
    expect(speakable).not.toContain('【');
    expect(speakable).toContain('恭喜你答对啦');
  });

  it('limits word length to under 120 chars', () => {
    const longText = '这是一段非常非常长的教学解析语句。'.repeat(10);
    const speakable = prepareForSpeech(longText);

    expect(speakable).toBeDefined();
    expect((speakable as string).length).toBeLessThanOrEqual(125);
  });

  it('returns null for empty text', () => {
    expect(prepareForSpeech('')).toBeNull();
  });
});

