import { describe, it, expect } from 'vitest';
import {
  computeDimensionState,
  buildAbilityProfile,
  calculateTimeDecay
} from '../../src/domain/ability/abilityEngine';
import type { AbilityEvent } from '../../src/domain/ability/types';

describe('Domain: Ability Growth Engine', () => {
  it('calculates exponential time decay with minimum floor', () => {
    const now = Date.now();
    expect(calculateTimeDecay(now, now)).toBe(1.0);
    // 30 days ago -> approx 0.5
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const decay30d = calculateTimeDecay(thirtyDaysAgo, now);
    expect(decay30d).toBeCloseTo(0.5, 1);
    // 300 days ago -> bounded by floor 0.15
    const longAgo = now - 300 * 24 * 60 * 60 * 1000;
    expect(calculateTimeDecay(longAgo, now)).toBe(0.15);
  });

  it('returns confidence: none and score: null when sample count is 0', () => {
    const state = computeDimensionState('spatial', []);
    expect(state.confidence).toBe('none');
    expect(state.score).toBeNull();
    expect(state.sampleCount).toBe(0);
  });

  it('computes weighted score when samples are sufficient', () => {
    const now = Date.now();
    const events: AbilityEvent[] = Array.from({ length: 10 }, (_, i) => ({
      id: `evt_${i}`,
      profileId: 'kid_1',
      at: now - i * 1000,
      dimensionId: 'spatial',
      skillId: 'go.eyes',
      performance: 1.0,
      difficulty: 3,
      weight: 1.0
    }));

    const state = computeDimensionState('spatial', events, now);
    expect(state.sampleCount).toBe(10);
    expect(state.confidence).toBe('medium');
    expect(state.score).toBe(100);
  });

  it('builds complete AbilityProfile and generates rule-based insights', () => {
    const now = Date.now();
    const events: AbilityEvent[] = [
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `sp_${i}`,
        profileId: 'kid_1',
        at: now - i * 1000,
        dimensionId: 'spatial' as const,
        skillId: 'go.eyes',
        performance: 0.9,
        difficulty: 3 as const,
        weight: 1.0
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `calc_${i}`,
        profileId: 'kid_1',
        at: now - i * 1000,
        dimensionId: 'calculation' as const,
        skillId: 'go.counting',
        performance: 0.4,
        difficulty: 3 as const,
        weight: 1.0
      }))
    ];

    const profile = buildAbilityProfile('kid_1', events, [], now);
    expect(profile.profileId).toBe('kid_1');
    expect(profile.dimensions.spatial.score).toBeGreaterThanOrEqual(80);
    expect(profile.dimensions.calculation.score).toBeLessThanOrEqual(50);
    expect(profile.highlights.length).toBeGreaterThanOrEqual(1);
    expect(profile.concerns.length).toBeGreaterThanOrEqual(1);
  });
});

