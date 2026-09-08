import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  useScheduleStore,
  createOfficialGrid,
  OFFICIAL_SCHEDULE_VERSION
} from '../src/stores/useScheduleStore';

describe('Official Schedule (Clean Blank Slate for AI Recognition Testing)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with completely blank schedule grid for clean AI testing', () => {
    const grid = createOfficialGrid();
    // 验证所有格子均为 empty 空白
    expect(grid['1-1']).toBe('empty');
    expect(grid['1-2']).toBe('empty');
    expect(grid['1-3']).toBe('empty');
    expect(grid['2-1']).toBe('empty');
    expect(grid['5-6']).toBe('empty');

    const store = useScheduleStore();
    expect(store.versionRecords.length).toBeGreaterThanOrEqual(1);
    expect(store.cellSubject(1, 1).id).toBe('empty');
  });

  it('should have updated version to trigger auto-sync and clean slate', () => {
    expect(OFFICIAL_SCHEDULE_VERSION).toBe('jw-1.1-2627-v3-blank');
  });
});
