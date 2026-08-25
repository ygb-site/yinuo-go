import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../src/stores/useUserStore';
import { computeDimensionState, buildAbilityProfile } from '../src/domain/ability/abilityEngine';

describe('Phase 7: Parent Mode & Growth Verification', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('demonstrates honest degradation when no learning events exist for a dimension', () => {
    const state = computeDimensionState('language', []);
    expect(state.confidence).toBe('none');
    expect(state.score).toBeNull();
  });

  it('computes confidence: low and hides score when sample count is less than 5', () => {
    const events = [
      {
        id: 'ev_1',
        profileId: 'kid_1',
        at: Date.now(),
        dimensionId: 'calculation' as const,
        skillId: 'go.liberties',
        performance: 1.0,
        difficulty: 2 as const,
        weight: 1.0
      }
    ];

    const state = computeDimensionState('calculation', events);
    expect(state.sampleCount).toBe(1);
    expect(state.confidence).toBe('low');
    expect(state.score).toBeNull();
  });

  it('computes score and confidence: medium when sample count reaches 5', () => {
    const now = Date.now();
    const events = Array.from({ length: 6 }, (_, i) => ({
      id: `ev_${i}`,
      profileId: 'kid_1',
      at: now - i * 1000,
      dimensionId: 'spatial' as const,
      skillId: 'go.eyes',
      performance: 1.0,
      difficulty: 2 as const,
      weight: 1.0
    }));

    const state = computeDimensionState('spatial', events, now);
    expect(state.sampleCount).toBe(6);
    expect(state.confidence).toBe('medium');
    expect(state.score).toBe(100);
  });
});

