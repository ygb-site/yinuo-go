import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useScheduleStore } from '../src/stores/useScheduleStore';

describe('Schedule Multi-Version & Multi-Grade Archiving System', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with blank clean schedule version ready for AI import', () => {
    const store = useScheduleStore();
    expect(store.versionRecords.length).toBeGreaterThanOrEqual(1);

    const currentRec = store.versionRecords.find(r => r.isCurrent);
    expect(currentRec).toBeDefined();
    expect(currentRec?.id).toBe('g1-term1-blank');
    expect(currentRec?.gradeYear).toBe('g1');
    expect(currentRec?.term).toBe('term1');
    expect(currentRec?.gradeLabel).toBe('一年级');
    expect(currentRec?.termLabel).toBe('上学期');
    expect(currentRec?.grid['1-1']).toBe('empty');
  });

  it('should switch between versions and update current view grid and teachers', () => {
    const store = useScheduleStore();

    // 默认是空白待排版
    expect(store.activeRecord.id).toBe('g1-term1-blank');
    expect(store.cellSubject(1, 1).id).toBe('empty');

    // 新增一个测试版本
    const newRec = store.saveNewVersionRecord({
      gradeYear: 'g1',
      gradeLabel: '一年级',
      term: 'term1',
      termLabel: '上学期',
      versionDate: '2026.09.07',
      title: '测试版本',
      setAsCurrent: false
    });

    store.switchVersionRecord(newRec.id);
    expect(store.activeRecord.id).toBe(newRec.id);

    // 切回空白版
    store.switchVersionRecord('g1-term1-blank');
    expect(store.activeRecord.id).toBe('g1-term1-blank');
  });

  it('should support creating future versions (e.g. Grade 1 Term 2 or Grade 2)', () => {
    const store = useScheduleStore();
    const initialCount = store.versionRecords.length;

    // 创建二年级上学期版本
    const g2Rec = store.saveNewVersionRecord({
      gradeYear: 'g2',
      gradeLabel: '二年级',
      term: 'term1',
      termLabel: '上学期',
      versionDate: '2027.09.01',
      title: '京西校区二年级上学期新课表',
      note: '升入二年级课程安排',
      setAsCurrent: false
    });

    expect(store.versionRecords.length).toBe(initialCount + 1);
    expect(g2Rec.gradeYear).toBe('g2');
    expect(g2Rec.term).toBe('term1');
    expect(g2Rec.versionDate).toBe('2027.09.01');
    expect(store.activeRecordId).toBe(g2Rec.id);
  });

  it('should allow setting a historical version as current', () => {
    const store = useScheduleStore();
    expect(store.currentExecutingRecord.id).toBe('g1-term1-blank');

    const v2 = store.saveNewVersionRecord({
      gradeYear: 'g1',
      gradeLabel: '一年级',
      term: 'term1',
      termLabel: '上学期',
      versionDate: '2026.09.15',
      title: '新版',
      setAsCurrent: true
    });

    expect(store.currentExecutingRecord.id).toBe(v2.id);

    // 恢复空白版为当前
    store.setRecordAsCurrent('g1-term1-blank');
    expect(store.currentExecutingRecord.id).toBe('g1-term1-blank');
  });

  it('should prevent deleting the current executing version', () => {
    const store = useScheduleStore();
    const currentId = store.currentExecutingRecord.id;

    const deleteSuccess = store.deleteVersionRecord(currentId);
    expect(deleteSuccess).toBe(false);
    expect(store.versionRecords.some(r => r.id === currentId)).toBe(true);
  });
});
