import { describe, it, expect } from 'vitest';
import { RIDDLES_DATA, RIDDLE_CATEGORIES } from '../src/data/riddlesData';

describe('Riddles & Brain Teasers Data Integrity Tests', () => {
  it('should have non-empty riddles repository', () => {
    expect(RIDDLES_DATA.length).toBeGreaterThanOrEqual(20);
  });

  it('should have valid category categories metadata', () => {
    expect(RIDDLE_CATEGORIES.length).toBe(7);
  });

  it('should have valid fields and options containing the answer for each riddle', () => {
    for (const r of RIDDLES_DATA) {
      expect(r.id).toBeDefined();
      expect(r.question.length).toBeGreaterThan(0);
      expect(r.answer.length).toBeGreaterThan(0);
      expect(r.hint.length).toBeGreaterThan(0);
      expect(r.explanation.length).toBeGreaterThan(0);
      expect(r.options.length).toBe(4);
      expect(r.options).toContain(r.answer);
    }
  });

  it('should have unique riddle IDs', () => {
    const ids = RIDDLES_DATA.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
