import type { EventValidity, LearningEvent, RewardEvent } from './types';
import { REWARD_SPECS } from './rewardSpecs';
import { buildRewardKey } from '../../utils/rewardKey';

export const MIN_REWARDED_MOVES = 20;
export const MIN_REWARDED_SECONDS = 20;

/**
 * Universal match validity evaluation
 */
export function evaluateMatchValidity(input: {
  moveCount: number;
  resigned: boolean;
  durationSeconds?: number;
  usedUnlimitedHints?: boolean;
}): EventValidity {
  if (input.resigned) {
    return { valid: false, reason: 'surrendered' };
  }
  if (input.moveCount < MIN_REWARDED_MOVES) {
    return { valid: false, reason: 'too-short' };
  }
  if (input.durationSeconds !== undefined && input.durationSeconds < MIN_REWARDED_SECONDS) {
    return { valid: false, reason: 'too-short' };
  }
  return { valid: true };
}

/**
 * Builds a concrete RewardEvent from a LearningEvent
 */
export function buildRewardEventFromLearning(event: LearningEvent): RewardEvent | null {
  if (!event.validity.valid) {
    return null;
  }

  switch (event.type) {
    case 'lesson-completed': {
      const spec = REWARD_SPECS['lesson'];
      const key = buildRewardKey('lesson', event.nodeId || event.id, 'first');
      return {
        idempotencyKey: key,
        sourceEventId: event.id,
        coins: spec.first.coins,
        exp: spec.first.exp,
        stars: event.outcome.stars || 3,
        reason: '主线关卡通关奖励',
        icon: '🎯'
      };
    }

    case 'drill-completed': {
      const spec = REWARD_SPECS['drill'];
      const key = buildRewardKey('drill', event.nodeId || event.id, new Date(event.at).toISOString().slice(0, 10));
      return {
        idempotencyKey: key,
        sourceEventId: event.id,
        coins: spec.first.coins,
        exp: spec.first.exp,
        stars: 0,
        reason: '专项技能训练奖励',
        icon: '⚡',
        dailyCap: spec.dailyCap
      };
    }

    case 'match-finished': {
      const isWin = event.outcome.success;
      const spec = isWin ? REWARD_SPECS['match-win'] : REWARD_SPECS['match-lose'];
      const key = buildRewardKey('match', event.domainId || 'go', event.id, isWin ? 'win' : 'lose');
      return {
        idempotencyKey: key,
        sourceEventId: event.id,
        coins: spec.first.coins,
        exp: spec.first.exp,
        stars: 0,
        reason: isWin ? '实战对局获胜奖励' : '实战对局完赛鼓励',
        icon: '⚔️'
      };
    }

    case 'exam-passed': {
      const spec = REWARD_SPECS['exam'];
      const key = buildRewardKey('exam', event.nodeId || event.id);
      return {
        idempotencyKey: key,
        sourceEventId: event.id,
        coins: spec.first.coins,
        exp: spec.first.exp,
        stars: 0,
        reason: '定段考级认证奖励',
        icon: '📜'
      };
    }

    case 'mistake-resolved': {
      const spec = REWARD_SPECS['mistake'];
      const key = buildRewardKey('mistake', event.nodeId || event.id);
      return {
        idempotencyKey: key,
        sourceEventId: event.id,
        coins: spec.first.coins,
        exp: spec.first.exp,
        stars: 0,
        reason: '消灭错题弱点奖励',
        icon: '💪'
      };
    }

    case 'daily-task-completed': {
      const spec = REWARD_SPECS['daily-task'];
      const key = buildRewardKey('study-task', event.nodeId || event.id, 'complete');
      return {
        idempotencyKey: key,
        sourceEventId: event.id,
        coins: spec.first.coins,
        exp: spec.first.exp,
        stars: 0,
        reason: '每日学习任务完成奖励',
        icon: '📅',
        dailyCap: spec.dailyCap
      };
    }

    default:
      return null;
  }
}


