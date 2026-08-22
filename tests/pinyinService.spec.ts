import { describe, it, expect } from 'vitest';
import { PinyinService } from '../src/services/pinyinService';

describe('PinyinService Tests', () => {
  it('should get tone symbol pinyin accurately', () => {
    const result = PinyinService.getPinyin('天地人');
    expect(result).toBe('tiān dì rén');
  });

  it('should get tone none pinyin', () => {
    const result = PinyinService.getPinyinNone('围棋');
    expect(result).toBe('wei qi');
  });

  it('should get pinyin numbers format', () => {
    const result = PinyinService.getPinyinNum('北京');
    expect(result).toBe('bei3 jing1');
  });

  it('should parse character details (initial, final, tone)', () => {
    const detail = PinyinService.getCharPinyinDetail('好');
    expect(detail.char).toBe('好');
    expect(detail.initial).toBe('h');
    expect(detail.tone).toBe(3);
    expect(detail.isPolyphone).toBe(true);
    expect(detail.polyphones).toContain('hǎo');
    expect(detail.polyphones).toContain('hào');
  });

  it('should parse sentence into individual characters with pinyin', () => {
    const parsed = PinyinService.parseSentence('少儿学围棋');
    expect(parsed.length).toBe(5);
    expect(parsed[0].char).toBe('少');
    expect(parsed[2].char).toBe('学');
  });
});
