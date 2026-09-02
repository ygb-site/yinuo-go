import { describe, expect, it } from 'vitest';
import { resolveGrowthTracks } from '../src/domain/growth/tracks';
import {
  applySleepShrink,
  buildDualTrackView,
  buildSchoolTasks,
  childVisibleTasks,
  computeSleepBudget,
  emptySchoolTrack,
  looksLikeStandardAnswer,
  notStartedLabel,
  primaryChildTask,
  resolveSchoolLayer,
  sanitizeSchoolTutorOutput,
  shouldEmitChildHometownWork,
  shouldShowParentSupplement
} from '../src/domain/school';
import { pendingCatalogCount, TEXTBOOK_LESSONS } from '../src/data/school/textbookCatalog';

const g1Tracks = resolveGrowthTracks({ returnWindow: 'g4_g6' });

describe('学校层教材接入', () => {
  it('无作业无进度时任务为空，文案是尚未开始而不是 0 分', () => {
    const layer = resolveSchoolLayer();
    const tasks = buildSchoolTasks({
      date: '2026-09-02',
      homeworkItems: [],
      schoolTrack: layer.schoolTrack,
      doneIds: [],
      tracks: g1Tracks,
      gradeLevel: 'g1_t1'
    });
    expect(tasks).toEqual([]);
    expect(notStartedLabel()).toBe('尚未开始');
    expect(layer.schoolTrack.activeChapterId).toBeNull();
    expect(layer.schoolTrack.completedLessonIds).toEqual([]);
  });

  it('家长录入作业后生成儿童短句和家长备注，儿童侧不含衡水差异', () => {
    const layer = resolveSchoolLayer();
    const tasks = buildSchoolTasks({
      date: '2026-09-02',
      homeworkItems: [
        {
          id: 'hw1',
          subjectId: 'chinese',
          parentNote: '读秋天，生字写两遍',
          linkedLessonId: 'chinese:g1_t1:u3:l1',
          estimatedMinutes: 15,
          createdAt: 1
        }
      ],
      schoolTrack: layer.schoolTrack,
      doneIds: [],
      tracks: g1Tracks,
      gradeLevel: 'g1_t1'
    });

    const homework = tasks.find((item) => item.kind === 'school_homework');
    expect(homework).toBeTruthy();
    expect(homework?.child.verbTitle.startsWith('读')).toBe(true);
    expect(homework?.child.shortHint).toContain('秋天');
    expect(homework?.child.verbTitle).not.toContain('衡水');
    expect(homework?.child.shortHint).not.toContain('衡水');
    expect(homework?.parent.note).toContain('读秋天');
    expect(homework?.estimatedMinutes).toBe(15);
    expect(tasks.some((item) => item.kind === 'review')).toBe(true);
  });

  it('一年级不给儿童增加衡水课业，家长补充建议要等 returnWindow', () => {
    expect(shouldEmitChildHometownWork('g1_t1')).toBe(false);
    expect(shouldShowParentSupplement(g1Tracks, 'g1_t1')).toBe(false);

    const view = buildDualTrackView(
      emptySchoolTrack('beijing', 'g1_t1'),
      resolveSchoolLayer().hometownTrack,
      g1Tracks,
      'g1_t1'
    );
    expect(view.gradeOneRecordOnly).toBe(true);
    expect(view.supplementEnabled).toBe(false);
    expect(view.supplementSuggestions).toEqual([]);
    expect(view.schoolStarted).toBe(false);

    const tight = resolveGrowthTracks({ returnWindow: 'g4_g6' });
    expect(shouldShowParentSupplement(tight, 'g4_t1')).toBe(true);
  });

  it('过了就寝时间后学校任务让路，作业也让路', () => {
    const tasks = buildSchoolTasks({
      date: '2026-09-02',
      homeworkItems: [
        {
          id: 'hw1',
          subjectId: 'math',
          parentNote: '口算第 3 页',
          estimatedMinutes: 15,
          createdAt: 1
        }
      ],
      schoolTrack: emptySchoolTrack('beijing', 'g1_t1'),
      doneIds: [],
      tracks: g1Tracks,
      gradeLevel: 'g1_t1'
    });
    const night = new Date(2026, 8, 2, 21, 30, 0, 0);
    const shrunk = applySleepShrink(tasks, computeSleepBudget(21 * 60, night));
    expect(shrunk.every((item) => item.status === 'dropped_for_sleep')).toBe(true);
    expect(childVisibleTasks(shrunk)).toEqual([]);
    expect(primaryChildTask(shrunk)).toBeNull();
  });

  it('剩余时间不够时先丢掉预习再丢掉复习', () => {
    const schoolTrack = emptySchoolTrack('beijing', 'g1_t1');
    schoolTrack.activeChapterId = 'chinese:g1_t1:u1';
    const tasks = buildSchoolTasks({
      date: '2026-09-02',
      homeworkItems: [
        {
          id: 'hw1',
          subjectId: 'chinese',
          parentNote: '读天地人',
          linkedLessonId: 'chinese:g1_t1:u1:l1',
          estimatedMinutes: 15,
          createdAt: 1
        }
      ],
      schoolTrack,
      doneIds: [],
      tracks: g1Tracks,
      gradeLevel: 'g1_t1'
    });
    const now = new Date(2026, 8, 2, 20, 30, 0, 0);
    const shrunk = applySleepShrink(tasks, computeSleepBudget(21 * 60, now));
    const pending = shrunk.filter((item) => item.status === 'pending');
    expect(pending.some((item) => item.kind === 'school_homework')).toBe(true);
    expect(pending.some((item) => item.kind === 'preview')).toBe(false);
  });

  it('AI 小诺学校层禁止直接给标准答案，并拆成儿童/家长两块', () => {
    expect(looksLikeStandardAnswer('正确答案是 12')).toBe(true);
    const sanitized = sanitizeSchoolTutorOutput({
      child: '正确答案是 B',
      parent: '直接告诉他选 B'
    });
    expect(sanitized.child).not.toContain('正确答案');
    expect(sanitized.parent).not.toContain('选 B');
  });

  it('目录是课时骨架，仍有待填充的原始元数据', () => {
    expect(TEXTBOOK_LESSONS.length).toBeGreaterThan(10);
    expect(TEXTBOOK_LESSONS.every((item) => item.title.length > 0)).toBe(true);
    expect(pendingCatalogCount()).toBeGreaterThan(0);
  });
});
