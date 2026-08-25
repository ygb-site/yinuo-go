import type { LearningNodeId, SkillId, Mastery } from '../learning/types';

export type AbilityDimensionId =
  | 'logic'
  | 'calculation'
  | 'spatial'
  | 'concentration'
  | 'memory'
  | 'language';

export const ABILITY_DIMENSION_NAMES: Record<AbilityDimensionId, string> = {
  logic: '逻辑推理',
  calculation: '计算能力',
  spatial: '空间感知',
  concentration: '专注力',
  memory: '记忆力',
  language: '语言表达'
};

export interface AbilityEvent {
  id: string;
  profileId: string;
  at: number;
  dimensionId: AbilityDimensionId;
  skillId: SkillId;
  performance: number; // 0.0 ~ 1.0
  difficulty: 1 | 2 | 3 | 4 | 5;
  weight: number; // 0.0 ~ 1.0
  sourceNodeId?: LearningNodeId;
  sourceEventId?: string;
}

export interface SkillProgress {
  skillId: SkillId;
  mastery: Mastery;
  recentPerformance: number[];
  trend: 'up' | 'flat' | 'down' | 'unknown';
}

export interface AbilityDimensionState {
  dimensionId: AbilityDimensionId;
  name: string;
  score: number | null; // null = no data/insufficient samples
  sampleCount: number;
  confidence: 'none' | 'low' | 'medium' | 'high';
  delta7d: number | null;
  delta30d: number | null;
  trend: 'up' | 'flat' | 'down' | 'unknown';
  strongestSkillId?: SkillId;
  weakestSkillId?: SkillId;
  lastUpdatedAt: number | null;
}

export interface AbilityProfile {
  profileId: string;
  computedAt: number;
  dimensions: Record<AbilityDimensionId, AbilityDimensionState>;
  skills: SkillProgress[];
  highlights: string[];
  concerns: string[];
}

