import type { DomainId, LearningNodeId, SkillId } from '../learning/types';

export type LearningEventType =
  | 'lesson-completed'
  | 'question-answered'
  | 'drill-completed'
  | 'match-finished'
  | 'exam-passed'
  | 'mistake-resolved'
  | 'daily-task-completed'
  | 'daily-check-in'
  | 'badge-unlocked';

export interface EventValidity {
  valid: boolean;
  reason?:
    | 'too-short'
    | 'surrendered'
    | 'replay'
    | 'self-authored'
    | 'assisted';
}

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  profileId: string;
  at: number;
  nodeId?: LearningNodeId;
  domainId?: DomainId;
  skillIds?: SkillId[];
  knowledgePointIds?: string[];
  outcome: {
    success: boolean;
    performance?: number; // 0.0 ~ 1.0
    stars?: 0 | 1 | 2 | 3;
    score?: number;
    durationSeconds?: number;
  };
  validity: EventValidity;
}

export type IdempotencyKey = string;

export interface RewardEvent {
  idempotencyKey: IdempotencyKey;
  sourceEventId: string;
  coins: number;
  exp: number;
  stars: number;
  reason: string;
  icon: string;
  dailyCap?: { capId: string; limit: number };
}

export interface RewardTransaction {
  idempotencyKey: IdempotencyKey;
  grantedAt: number;
  coins: number;
  exp: number;
  stars: number;
  reason: string;
  balanceAfter?: { coins: number; exp: number; stars: number };
}


