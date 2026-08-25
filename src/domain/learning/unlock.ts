import type { UnlockRule, UnlockEvaluation } from './types';

export interface UnlockContext {
  completedNodeIds: Set<string>;
  totalCompletedLessons: number;
  currentRankLevel?: number;
}

export function evaluateUnlock(rule: UnlockRule, ctx: UnlockContext): UnlockEvaluation {
  switch (rule.type) {
    case 'always':
      return { unlocked: true };

    case 'node-completed': {
      const isCompleted = ctx.completedNodeIds.has(rule.nodeId);
      return {
        unlocked: isCompleted,
        reason: isCompleted ? undefined : '需先通关前置关卡'
      };
    }

    case 'nodes-completed': {
      const required = rule.count ?? rule.nodeIds.length;
      const completed = rule.nodeIds.filter((id) => ctx.completedNodeIds.has(id)).length;
      const unlocked = completed >= required;
      return {
        unlocked,
        reason: unlocked ? undefined : `需先完成指定前置任务 (${completed}/${required})`,
        progress: { current: completed, required }
      };
    }

    case 'lesson-count': {
      const unlocked = ctx.totalCompletedLessons >= rule.count;
      return {
        unlocked,
        reason: unlocked ? undefined : `需累计通关 ${rule.count} 个主线关卡 (${ctx.totalCompletedLessons}/${rule.count})`,
        progress: { current: ctx.totalCompletedLessons, required: rule.count }
      };
    }

    case 'rank': {
      const rank = ctx.currentRankLevel || 1;
      const unlocked = rank >= rule.minRankLevel;
      return {
        unlocked,
        reason: unlocked ? undefined : `需要达到 ${rule.minRankLevel} 级段位`
      };
    }

    case 'all': {
      for (const r of rule.rules) {
        const ev = evaluateUnlock(r, ctx);
        if (!ev.unlocked) return ev;
      }
      return { unlocked: true };
    }

    case 'any': {
      for (const r of rule.rules) {
        const ev = evaluateUnlock(r, ctx);
        if (ev.unlocked) return { unlocked: true };
      }
      return { unlocked: false, reason: '未满足任一解锁条件' };
    }

    default:
      return { unlocked: true };
  }
}


