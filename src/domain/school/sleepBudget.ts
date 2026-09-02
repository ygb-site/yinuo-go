import type { DailyStudyTask, SleepBudget } from './types';
import { DEFAULT_BEDTIME_MINUTES } from './resolve';

function minutesOfDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function computeSleepBudget(bedtimeMinutes: number, now = new Date()): SleepBudget {
  const current = minutesOfDay(now);
  const pastBedtime = current >= bedtimeMinutes || current < 5 * 60;
  const remainingMinutes = pastBedtime ? 0 : Math.max(0, bedtimeMinutes - current);
  return {
    bedtimeMinutes,
    remainingMinutes,
    pastBedtime
  };
}

export function formatBedtimeLabel(bedtimeMinutes: number): string {
  const hours = Math.floor(bedtimeMinutes / 60);
  const minutes = bedtimeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export const BEDTIME_OPTIONS: { value: number; label: string }[] = [
  { value: 19 * 60 + 30, label: '19:30' },
  { value: 20 * 60, label: '20:00' },
  { value: 20 * 60 + 30, label: '20:30' },
  { value: DEFAULT_BEDTIME_MINUTES, label: '21:00' },
  { value: 21 * 60 + 30, label: '21:30' },
  { value: 22 * 60, label: '22:00' }
];

/**
 * 睡眠优先：超时不再追加任务；剩余时间不够时先丢掉预习，再丢掉复习。
 * 校内作业也让路——作业与睡眠冲突时优先睡眠。
 */
export function applySleepShrink(tasks: DailyStudyTask[], budget: SleepBudget): DailyStudyTask[] {
  if (tasks.length === 0) return [];

  const ordered = [...tasks].sort((a, b) => a.sleepPriority - b.sleepPriority);
  if (budget.pastBedtime || budget.remainingMinutes <= 0) {
    return ordered.map((task) => ({
      ...task,
      status: task.status === 'done' ? 'done' : 'dropped_for_sleep',
      parent: {
        ...task.parent,
        sleepNote: '已过就寝时间，今晚不再做学校任务。'
      }
    }));
  }

  let used = 0;
  const result: DailyStudyTask[] = [];
  for (const task of ordered) {
    if (task.status === 'done') {
      result.push(task);
      continue;
    }
    if (used + task.estimatedMinutes > budget.remainingMinutes) {
      result.push({
        ...task,
        status: 'dropped_for_sleep',
        parent: {
          ...task.parent,
          sleepNote: `距就寝只剩 ${budget.remainingMinutes} 分钟，先睡觉，这份明天再看。`
        }
      });
      continue;
    }
    used += task.estimatedMinutes;
    result.push(task);
  }
  return result;
}
