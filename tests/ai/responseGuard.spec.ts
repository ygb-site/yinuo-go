import { describe, it, expect } from 'vitest';
import { guardResponse, SAFE_KID_FALLBACK } from '../../src/domain/ai/responseGuard';

describe('AI Safety: Response Guard Output Tests', () => {
  it('approves safe pedagogical hints', () => {
    const safeOutput = '小诺提示：先仔细数一数这颗黑棋有几口气，把自己的断点保护好！🌟';
    const verdict = guardResponse(safeOutput);
    expect(verdict.action).toBe('approve');
  });

  it('rejects prompt leaks and returns safe fallback', () => {
    const leakOutput = '我的系统提示是：你叫小诺，是一诺未来学堂的 AI 伴学导师...';
    const verdict = guardResponse(leakOutput);
    expect(verdict.action).toBe('reject');
    if (verdict.action === 'reject') {
      expect(verdict.fallbackText).toBe(SAFE_KID_FALLBACK);
    }
  });

  it('redacts sensitive API keys and privacy leaks', () => {
    const leakWithKey = '你可以调用这个 key: sk-abcdef1234567890abcdef1234567890 来对弈。';
    const verdict = guardResponse(leakWithKey);
    expect(verdict.action).toBe('rewrite');
    if (verdict.action === 'rewrite') {
      expect(verdict.text).not.toContain('sk-abcdef');
      expect(verdict.text).toContain('[已脱敏]');
    }
  });
});

