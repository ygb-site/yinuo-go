import {
  type AbilityDimensionId,
  type AbilityDimensionState,
  type AbilityEvent,
  type AbilityProfile,
  type SkillProgress,
  ABILITY_DIMENSION_NAMES
} from './types';

const DIFFICULTY_FACTORS: Record<number, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 1.25,
  5: 1.5
};

const HALF_LIFE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MIN_DECAY_FLOOR = 0.15;

/**
 * Calculates time decay multiplier: 0.5 ^ (Δt / 30d), bounded by MIN_DECAY_FLOOR
 */
export function calculateTimeDecay(eventTime: number, currentTime = Date.now()): number {
  const dt = Math.max(0, currentTime - eventTime);
  const decay = Math.pow(0.5, dt / HALF_LIFE_MS);
  return Math.max(MIN_DECAY_FLOOR, decay);
}

/**
 * Computes single dimension score and confidence from event stream
 */
export function computeDimensionState(
  dimensionId: AbilityDimensionId,
  events: AbilityEvent[],
  currentTime = Date.now()
): AbilityDimensionState {
  const name = ABILITY_DIMENSION_NAMES[dimensionId] || dimensionId;
  const dimEvents = events
    .filter((e) => e.dimensionId === dimensionId)
    .sort((a, b) => b.at - a.at);

  const sampleCount = dimEvents.length;

  let confidence: 'none' | 'low' | 'medium' | 'high' = 'none';
  if (sampleCount >= 20) {
    confidence = 'high';
  } else if (sampleCount >= 5) {
    confidence = 'medium';
  } else if (sampleCount >= 1) {
    confidence = 'low';
  }

  if (sampleCount === 0 || confidence === 'none' || confidence === 'low') {
    return {
      dimensionId,
      name,
      score: null,
      sampleCount,
      confidence,
      delta7d: null,
      delta30d: null,
      trend: 'unknown',
      lastUpdatedAt: dimEvents[0]?.at || null
    };
  }

  // Weighted score calculation
  let weightedSum = 0;
  let totalWeight = 0;

  for (const e of dimEvents) {
    const diffFactor = DIFFICULTY_FACTORS[e.difficulty] || 1.0;
    const decay = calculateTimeDecay(e.at, currentTime);
    const w = (e.weight || 1.0) * diffFactor * decay;

    weightedSum += Math.max(0, Math.min(1, e.performance)) * w;
    totalWeight += w;
  }

  const rawScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
  const score = Math.max(0, Math.min(100, rawScore));

  // Compute 7d and 30d window trends
  const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = currentTime - 14 * 24 * 60 * 60 * 1000;

  const recent7d = dimEvents.filter((e) => e.at >= sevenDaysAgo);
  const prev7d = dimEvents.filter((e) => e.at >= fourteenDaysAgo && e.at < sevenDaysAgo);

  let delta7d: number | null = null;
  let trend: 'up' | 'flat' | 'down' | 'unknown' = 'unknown';

  if (recent7d.length >= 3 && prev7d.length >= 3) {
    const avgRecent = recent7d.reduce((s, e) => s + e.performance, 0) / recent7d.length;
    const avgPrev = prev7d.reduce((s, e) => s + e.performance, 0) / prev7d.length;
    delta7d = Math.round((avgRecent - avgPrev) * 100);

    if (delta7d >= 3) trend = 'up';
    else if (delta7d <= -3) trend = 'down';
    else trend = 'flat';
  }

  return {
    dimensionId,
    name,
    score,
    sampleCount,
    confidence,
    delta7d,
    delta30d: null,
    trend,
    lastUpdatedAt: dimEvents[0]?.at || null
  };
}

/**
 * Builds full AbilityProfile from an event stream and skill progression records
 */
export function buildAbilityProfile(
  profileId: string,
  events: AbilityEvent[],
  skills: SkillProgress[] = [],
  currentTime = Date.now()
): AbilityProfile {
  const dimensions: AbilityDimensionId[] = [
    'logic',
    'calculation',
    'spatial',
    'concentration',
    'memory',
    'language'
  ];

  const dimStates: Record<AbilityDimensionId, AbilityDimensionState> = {} as any;

  for (const d of dimensions) {
    dimStates[d] = computeDimensionState(d, events, currentTime);
  }

  // Generate rule-based natural language conclusions
  const highlights: string[] = [];
  const concerns: string[] = [];

  for (const d of dimensions) {
    const st = dimStates[d];
    if (st.confidence === 'high' || st.confidence === 'medium') {
      if ((st.score !== null && st.score >= 75) || (st.delta7d !== null && st.delta7d >= 5)) {
        highlights.push(`【${st.name}】表现突出（当前评估：${st.score}分），近期手筋与推理准确率稳步提升！🌟`);
      } else if ((st.score !== null && st.score <= 55) || (st.delta7d !== null && st.delta7d <= -5)) {
        concerns.push(`【${st.name}】遇到部分难点（当前评估：${st.score}分），建议加强基础练习与专项死活题突破。💡`);
      }
    }
  }

  return {
    profileId,
    computedAt: currentTime,
    dimensions: dimStates,
    skills,
    highlights: highlights.slice(0, 2),
    concerns: concerns.slice(0, 2)
  };
}

