import { describe, expect, it } from 'vitest';
import { resolveDayPhase, localDateKey } from '../src/domain/today/dayPhase';
import { buildPackList, packHighlight } from '../src/domain/today/packList';
import { buildHomeworkHints } from '../src/domain/today/homeworkHints';
import { resolveDayPlan } from '../src/domain/today/dayPlan';
import { pickShadowDrillForDate } from '../src/data/hengshuiShadowDrills';
import { getSubjectById, SCHEDULE_PERIODS } from '../src/stores/useScheduleStore';

function atHour(hour: number, minute = 0, weekday = 1): Date {
  // 2026-09-07 是周一
  const d = new Date(2026, 8, 7 + (weekday - 1), hour, minute, 0, 0);
  return d;
}

describe('今天页时段与双轨轻练', () => {
  it('早中晚夜按时段划分', () => {
    expect(resolveDayPhase(atHour(7)).id).toBe('morning');
    expect(resolveDayPhase(atHour(12, 30)).id).toBe('noon');
    expect(resolveDayPhase(atHour(18)).id).toBe('evening');
    expect(resolveDayPhase(atHour(23)).id).toBe('night');
  });

  it('周六日标记为周末', () => {
    const saturday = new Date(2026, 8, 5, 9, 0, 0, 0);
    expect(resolveDayPhase(saturday).isWeekend).toBe(true);
  });

  it('美术日会提醒水彩笔，作业清单跟科目走', () => {
    const courses = [
      { period: SCHEDULE_PERIODS[0], subject: getSubjectById('meishu1') },
      { period: SCHEDULE_PERIODS[1], subject: getSubjectById('shuxue') }
    ];
    const pack = buildPackList(courses);
    expect(pack.some((item) => item.label === '水彩笔')).toBe(true);
    expect(packHighlight(pack)).toContain('美术');

    const homework = buildHomeworkHints(courses);
    expect(homework.some((h) => h.id === 'shuxue')).toBe(true);
    expect(homework.some((h) => h.id === 'meishu1')).toBe(true);
  });

  it('日计划跨日重置', () => {
    const yesterday = resolveDayPlan({
      date: '1999-01-01',
      packChecked: true,
      homeworkDoneIds: ['shuxue'],
      shadowDone: true,
      noonGoDone: true
    });
    expect(yesterday.date).toBe(localDateKey());
    expect(yesterday.packChecked).toBe(false);
    expect(yesterday.shadowDone).toBe(false);
  });

  it('同一天影子题稳定', () => {
    const a = pickShadowDrillForDate('2026-09-02');
    const b = pickShadowDrillForDate('2026-09-02');
    expect(a.id).toBe(b.id);
    expect(a.choices.length).toBe(4);
  });
});
