import { describe, it, expect } from 'vitest';
import {
  evaluateMatchValidity,
  buildRewardEventFromLearning,
  MIN_REWARDED_MOVES
} from '../../src/domain/reward/rewardEngine';
import type { LearningEvent } from '../../src/domain/reward/types';

describe('Domain: Reward Engine', () => {
  it('evaluates match validity correctly', () => {
    // 1. Resigned -> Invalid
    expect(evaluateMatchValidity({ moveCount: 30, resigned: true }).valid).toBe(false);
    expect(evaluateMatchValidity({ moveCount: 30, resigned: true }).reason).toBe('surrendered');

    // 2. Too short (< 20 moves) -> Invalid
    expect(evaluateMatchValidity({ moveCount: 10, resigned: false }).valid).toBe(false);
    expect(evaluateMatchValidity({ moveCount: 10, resigned: false }).reason).toBe('too-short');

    // 3. Valid match (>= 20 moves, duration >= 20s) -> Valid
    expect(evaluateMatchValidity({ moveCount: 22, resigned: false, durationSeconds: 45 }).valid).toBe(true);
  });

  it('builds RewardEvent from valid LearningEvent deterministically', () => {
    const event: LearningEvent = {
      id: 'les_c1_l1',
      type: 'lesson-completed',
      profileId: 'kid_1',
      at: 1700000000000,
      nodeId: 'go:lesson:c1/l1',
      outcome: { success: true, stars: 3 },
      validity: { valid: true }
    };

    const reward = buildRewardEventFromLearning(event);
    expect(reward).toBeDefined();
    expect(reward?.coins).toBe(20);
    expect(reward?.exp).toBe(50);
    expect(reward?.stars).toBe(3);
    expect(reward?.idempotencyKey).toBe('reward:lesson:go:lesson:c1/l1:first');
  });

  it('returns null for invalid LearningEvent', () => {
    const event: LearningEvent = {
      id: 'match_1',
      type: 'match-finished',
      profileId: 'kid_1',
      at: 1700000000000,
      outcome: { success: true },
      validity: { valid: false, reason: 'too-short' }
    };

    expect(buildRewardEventFromLearning(event)).toBeNull();
  });
});

