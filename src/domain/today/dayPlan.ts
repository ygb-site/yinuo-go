import { localDateKey } from './dayPhase';

/** 当天「今天」页勾选进度，随档案上云 */
export interface DayPlanState {
  date: string;
  packChecked: boolean;
  homeworkDoneIds: string[];
  shadowDone: boolean;
  /** 午休选了围棋轻练 */
  noonGoDone: boolean;
}

export function emptyDayPlan(now = new Date()): DayPlanState {
  return {
    date: localDateKey(now),
    packChecked: false,
    homeworkDoneIds: [],
    shadowDone: false,
    noonGoDone: false
  };
}

export function resolveDayPlan(input?: Partial<DayPlanState> | null, now = new Date()): DayPlanState {
  const today = localDateKey(now);
  if (!input || input.date !== today) {
    return emptyDayPlan(now);
  }
  return {
    date: today,
    packChecked: Boolean(input.packChecked),
    homeworkDoneIds: Array.isArray(input.homeworkDoneIds)
      ? input.homeworkDoneIds.filter((id): id is string => typeof id === 'string')
      : [],
    shadowDone: Boolean(input.shadowDone),
    noonGoDone: Boolean(input.noonGoDone)
  };
}
