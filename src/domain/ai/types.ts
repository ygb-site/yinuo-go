import type { DomainId, LearningNodeId, LearningNodeKind } from '../learning/types';
import type { AbilityDimensionId } from '../ability/types';
import type { AgeStage } from '../../design-system/ageStage';

export type InputRefusalCode =
  | 'empty'
  | 'too-long'
  | 'prompt-injection'
  | 'off-topic-unsafe'
  | 'personal-info'
  | 'contact-request'
  | 'rate-limited';

export type InputVerdict =
  | { action: 'allow'; text: string }
  | { action: 'sanitize'; text: string; removed: string[] }
  | { action: 'refuse'; reasonCode: InputRefusalCode; kidMessage: string };

export interface InputSafetyContext {
  studentNickname?: string;
  recentInputCountIn10s?: number;
  totalSessionMessageCount?: number;
}

export type GuardIssue =
  | 'unsafe-content'
  | 'privacy-leak'
  | 'prompt-leak'
  | 'instruction'
  | 'off-topic'
  | 'age-inappropriate'
  | 'markup'
  | 'too-long'
  | 'empty';

export type GuardVerdict =
  | { action: 'approve'; text: string }
  | { action: 'rewrite'; text: string; removed: GuardIssue[] }
  | { action: 'reject'; issues: GuardIssue[]; fallbackText: string };

export interface GuardContext {
  topic?: string;
  knowledgePointTitle?: string;
}

export type SpeakableText = string & { readonly __speakable: unique symbol };

export interface DualAudienceOutput {
  child: string;
  parent: string;
}

export interface TutorContext {
  domain: { id: DomainId; name: string };
  currentNode?: { id: LearningNodeId; title: string; kind: LearningNodeKind };
  currentQuestion?: {
    prompt: string;
    options?: string[];
    userAnswer?: string;
    correctAnswer?: string;
  };
  currentKnowledgePoints: Array<{ id: string; title: string }>;
  recentMistakes: Array<{
    knowledgePointTitle: string;
    questionPrompt: string;
    userAnswer: string;
    correctAnswer: string;
    errorCategory: string;
    errorReason?: string;
    wrongCount: number;
  }>;
  learnerStage: AgeStage;
  learnerNickname: string;
  recentHistory: {
    lessonsCompletedLast7d: number;
    accuracyLast7d: number | null;
    streak: number;
  };
  currentAbility: Array<{
    dimensionId: AbilityDimensionId;
    score: number | null;
    confidence: string;
  }>;
  chatHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
}

