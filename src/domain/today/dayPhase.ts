/** 儿童「今天」页按时段切换主内容 */

export type DayPhaseId = 'morning' | 'noon' | 'evening' | 'night';

export interface DayPhaseInfo {
  id: DayPhaseId;
  /** 问候里用的时段称呼 */
  greeting: string;
  /** 一句话说明现在该干什么 */
  focus: string;
  /** 是否周末（周六日） */
  isWeekend: boolean;
}

/**
 * 按时段划分：
 * - 早 05:00–11:29：出门与今日课表
 * - 午 11:30–14:59：午休轻练
 * - 晚 15:00–21:59：作业收口 + 明日准备
 * - 夜 22:00–04:59：该休息了
 */
export function resolveDayPhase(now = new Date()): DayPhaseInfo {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;
  const jsDay = now.getDay();
  const isWeekend = jsDay === 0 || jsDay === 6;

  if (totalMinutes >= 5 * 60 && totalMinutes < 11 * 60 + 30) {
    return {
      id: 'morning',
      greeting: '早上好',
      focus: isWeekend ? '周末不赶课，先选一件轻松的事。' : '先看清今天要上什么课、书包里该带什么。',
      isWeekend
    };
  }

  if (totalMinutes >= 11 * 60 + 30 && totalMinutes < 15 * 60) {
    return {
      id: 'noon',
      greeting: '中午好',
      focus: isWeekend ? '午后可以下一盘棋，或做一道影子轻练。' : '午休只做一件轻的：围棋一关，或衡水影子一题。',
      isWeekend
    };
  }

  if (totalMinutes >= 15 * 60 && totalMinutes < 22 * 60) {
    return {
      id: 'evening',
      greeting: hour < 18 ? '下午好' : '晚上好',
      focus: isWeekend ? '把今天想做的收个口，明天再轻松继续。' : '先把作业收口，再看明天课表和要带的东西。',
      isWeekend
    };
  }

  return {
    id: 'night',
    greeting: '夜深了',
    focus: '该睡觉了。明天的课表已经帮你备好，醒了再看。',
    isWeekend
  };
}

/** 本地日历日 yyyy-mm-dd，给日课打卡用 */
export function localDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
