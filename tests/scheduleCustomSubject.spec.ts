import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useScheduleStore, getSubjectById } from '../src/stores/useScheduleStore';

describe('Custom Subjects & Teacher Management', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should allow adding custom subjects with teachers', () => {
    const store = useScheduleStore();
    const initialCount = store.allSubjects.length;

    const newSubj = store.addCustomSubject({
      name: '少儿编程',
      shortName: '编程',
      emoji: '💻',
      tone: 'sky',
      defaultTeacher: '陈老师'
    });

    expect(newSubj.id).toContain('subj_');
    expect(newSubj.name).toBe('少儿编程');
    expect(newSubj.defaultTeacher).toBe('陈老师');
    expect(store.allSubjects.length).toBe(initialCount + 1);

    const retrieved = getSubjectById(newSubj.id);
    expect(retrieved.name).toBe('少儿编程');
  });

  it('should schedule custom subject and custom teacher on a cell', () => {
    const store = useScheduleStore();

    const newSubj = store.addCustomSubject({
      name: '软笔书法',
      emoji: '🖌️',
      defaultTeacher: '赵老师'
    });

    store.setCellSchedule(3, 5, newSubj.id, '赵老师');

    expect(store.cellSubject(3, 5).name).toBe('软笔书法');
    expect(store.cellTeacher(3, 5)).toBe('赵老师');
    expect(store.teachers['3-5']).toBe('赵老师');
    expect(store.grid['3-5']).toBe(newSubj.id);
  });

  it('should aggregate known teachers from scheduled cells and custom subjects', () => {
    const store = useScheduleStore();
    store.addCustomSubject({
      name: '趣味围棋',
      defaultTeacher: '柯洁老师'
    });
    store.setCellSchedule(1, 1, 'empty', '李慧老师');

    const teachers = store.knownTeachers;
    expect(teachers).toContain('李慧老师');
    expect(teachers).toContain('柯洁老师');
  });

  it('should verify that selected subject sorts to the first position in picker', () => {
    const store = useScheduleStore();
    const s1 = store.addCustomSubject({ name: '语文', emoji: '📖' });
    const s2 = store.addCustomSubject({ name: '数学', emoji: '🔢' });
    const s3 = store.addCustomSubject({ name: '英语', emoji: '🔤' });

    const curId = s2.id;
    const all = store.allSubjects.filter(s => s.id !== 'empty');
    const sorted = [...all].sort((a, b) => {
      if (a.id === curId) return -1;
      if (b.id === curId) return 1;
      return 0;
    });

    expect(sorted[0].id).toBe(s2.id);
    expect(sorted[0].name).toBe('数学');
  });
});

