import type { AbilityDimensionId } from '../ability/types';

export type DomainId = string;
export type LegacySubjectId = 'go' | 'checkers' | 'gomoku';

export interface Domain {
  id: DomainId;
  name: string;
  shortName: string;
  isPrimary: boolean;
  hasContent: boolean;
  accent: 'learning' | 'growth' | 'challenge';
  primaryAbilities: AbilityDimensionId[];
}

export type LearningNodeKind =
  | 'course'
  | 'chapter'
  | 'lesson'
  | 'drill'
  | 'match'
  | 'exam'
  | 'reference';

export type LearningNodeId = string;

export interface Skill {
  id: SkillId;
  domainId: DomainId;
  name: string;
  abilityWeights: Partial<Record<AbilityDimensionId, number>>;
  prerequisiteIds: SkillId[];
  level: 1 | 2 | 3 | 4 | 5;
}

export type SkillId = string;

export interface KnowledgePointSkillMap {
  knowledgePointId: string;
  skillId: SkillId;
}

export type UnlockRule =
  | { type: 'always' }
  | { type: 'node-completed'; nodeId: LearningNodeId }
  | { type: 'nodes-completed'; nodeIds: LearningNodeId[]; count?: number }
  | { type: 'lesson-count'; count: number }
  | { type: 'skill-mastery'; skillId: SkillId; minLevel: number }
  | { type: 'rank'; minRankLevel: number }
  | { type: 'all'; rules: UnlockRule[] }
  | { type: 'any'; rules: UnlockRule[] };

export interface UnlockEvaluation {
  unlocked: boolean;
  reason?: string;
  progress?: { current: number; required: number };
}

export interface RewardSpec {
  first: { coins: number; exp: number; stars?: number };
  repeat?: { coins: number; exp: number };
  rewardDomain: string;
  dailyCap?: { capId: string; limit: number };
}

export interface LearningNode {
  id: LearningNodeId;
  domainId: DomainId;
  kind: LearningNodeKind;
  title: string;
  subtitle?: string;
  description?: string;
  parentId?: LearningNodeId;
  order: number;
  knowledgePointIds: string[];
  skillIds: SkillId[];
  unlock: UnlockRule;
  reward: RewardSpec;
  route: string;
  estimatedMinutes: number;
  legacyIds: string[];
  payload?: unknown;
}

export interface Progress {
  nodeId: LearningNodeId;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  stars: 0 | 1 | 2 | 3;
  bestScore?: number;
  attempts: number;
  firstCompletedAt?: number;
  lastAttemptAt?: number;
  totalSeconds: number;
}

export interface Mastery {
  skillId: SkillId;
  level: number;
  confidence: 'low' | 'medium' | 'high';
  totalCount: number;
  correctCount: number;
  lastPracticedAt: number;
  streak: number;
}

