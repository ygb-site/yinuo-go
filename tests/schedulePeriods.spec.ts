import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useScheduleStore } from '../src/stores/useScheduleStore';

describe('Schedule Dynamic Periods & Slots Architecture', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useScheduleStore();
    store.resetPeriodsToDefault();
  });

  it('should initialize with standard 6 periods', () => {
    const store = useScheduleStore();
    expect(store.periods.length).toBe(6);
    expect(store.periods[0].label).toBe('第1节');
    expect(store.periods[5].label).toBe('第6节');
  });

  it('should support enabling morning read slot', () => {
    const store = useScheduleStore();
    store.enableMorningRead('07:45-08:15');

    expect(store.periods.length).toBe(7);
    expect(store.periods[0].label).toBe('早读');
    expect(store.periods[0].slotType).toBe('morning_read');
  });

  it('should support expanding to 8 periods', () => {
    const store = useScheduleStore();
    store.enableEightPeriods();

    expect(store.periods.length).toBe(8);
    expect(store.periods.some(p => p.label === '第7节')).toBe(true);
    expect(store.periods.some(p => p.label === '第8节')).toBe(true);
  });

  it('should support enabling evening study slot', () => {
    const store = useScheduleStore();
    store.enableEveningStudy('18:00-19:30');

    expect(store.periods.some(p => p.label === '晚自习')).toBe(true);
    const eveningP = store.periods.find(p => p.label === '晚自习');
    expect(eveningP?.slotType).toBe('evening');
  });

  it('should allow adding custom periods and removing periods', () => {
    const store = useScheduleStore();
    const initLen = store.periods.length;

    const customP = store.addCustomPeriod({
      label: '课后答疑',
      time: '17:20-18:00',
      slotType: 'afternoon'
    });

    expect(store.periods.length).toBe(initLen + 1);
    expect(customP.label).toBe('课后答疑');

    const removed = store.removePeriod(customP.id);
    expect(removed).toBe(true);
    expect(store.periods.length).toBe(initLen);
  });

  it('should support resetting back to 6 periods', () => {
    const store = useScheduleStore();
    store.enableMorningRead();
    store.enableEightPeriods();
    store.enableEveningStudy();
    expect(store.periods.length).toBeGreaterThan(6);

    store.resetPeriodsToDefault();
    expect(store.periods.length).toBe(6);
  });
});

