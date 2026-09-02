import { findLessonById, firstIncompleteLesson, lastCompletedLesson } from '../../data/school/textbookCatalog';
import type {
  DailyHomeworkItem,
  DailyStudyTask,
  SchoolTrackState,
  TextbookLessonMeta,
  TextbookSubjectId
} from './types';
import { parentDiffHintForLesson, shouldShowParentSupplement } from './dualTrack';
import { parentAbilityBridgeText } from './goAbilityBridge';
import type { GrowthTrackFields } from '../growth/tracks';
import type { GradeLevel } from '../../types/curriculum';

const HOMEWORK_CHILD: Record<TextbookSubjectId, { verbTitle: string; shortHint: string }> = {
  chinese: { verbTitle: '读今天的语文作业', shortHint: '按老师留的做，读给家人听也行。' },
  math: { verbTitle: '做今天的数学作业', shortHint: '算对、字迹清楚就行，不追求难题。' }
};

const PREVIEW_CHILD: Record<TextbookSubjectId, (title: string) => { verbTitle: string; shortHint: string }> = {
  chinese: (title) => ({
    verbTitle: `读一读「${title}」`,
    shortHint: '读两遍，认识的字指给家人看。'
  }),
  math: (title) => ({
    verbTitle: `看一看「${title}」`,
    shortHint: '翻开书看例题，先看懂再动笔。'
  })
};

const REVIEW_CHILD: Record<TextbookSubjectId, (title: string) => { verbTitle: string; shortHint: string }> = {
  chinese: (title) => ({
    verbTitle: `再认「${title}」的字`,
    shortHint: '合上书，指给家人认三个字。'
  }),
  math: (title) => ({
    verbTitle: `再练「${title}」`,
    shortHint: '口算三道类似的，不算新题海。'
  })
};

function homeworkChildView(item: DailyHomeworkItem): { verbTitle: string; shortHint: string } {
  const base = HOMEWORK_CHILD[item.subjectId];
  const note = item.parentNote.trim();
  if (!note) return base;
  const short = note.length > 24 ? `${note.slice(0, 22)}…` : note;
  return {
    verbTitle: base.verbTitle,
    shortHint: short
  };
}

function parentHomeworkNote(item: DailyHomeworkItem, lesson?: TextbookLessonMeta | null): string {
  const parts = [item.parentNote.trim() || '家长已记下今天的校内作业。'];
  if (lesson) parts.push(`对应课时：${lesson.title}。`);
  return parts.join('');
}

function buildHomeworkTask(item: DailyHomeworkItem, date: string, doneIds: Set<string>): DailyStudyTask {
  const lesson = item.linkedLessonId ? findLessonById(item.linkedLessonId) : undefined;
  return {
    id: `hw:${item.id}`,
    date,
    kind: 'school_homework',
    subjectId: item.subjectId,
    estimatedMinutes: item.estimatedMinutes,
    status: doneIds.has(`hw:${item.id}`) ? 'done' : 'pending',
    sourceHomeworkId: item.id,
    sourceLessonId: item.linkedLessonId,
    child: homeworkChildView(item),
    parent: {
      note: parentHomeworkNote(item, lesson),
      estimatedMinutes: item.estimatedMinutes,
      dualTrackHint: parentDiffHintForLesson(item.linkedLessonId),
      abilityBridge: parentAbilityBridgeText(lesson)
    },
    sleepPriority: 1
  };
}

function buildLessonTask(params: {
  kind: 'preview' | 'review';
  lesson: TextbookLessonMeta;
  date: string;
  doneIds: Set<string>;
  includeDiff: boolean;
}): DailyStudyTask {
  const { kind, lesson, date, doneIds, includeDiff } = params;
  const minutes = kind === 'preview' ? lesson.estimatedPreviewMinutes : lesson.estimatedReviewMinutes;
  const id = `${kind}:${lesson.id}:${date}`;
  const child =
    kind === 'preview' ? PREVIEW_CHILD[lesson.subjectId](lesson.title) : REVIEW_CHILD[lesson.subjectId](lesson.title);
  return {
    id,
    date,
    kind,
    subjectId: lesson.subjectId,
    estimatedMinutes: minutes,
    status: doneIds.has(id) ? 'done' : 'pending',
    sourceLessonId: lesson.id,
    child,
    parent: {
      note:
        kind === 'preview'
          ? `预习下一课时「${lesson.title}」，${minutes} 分钟内结束，不额外加练习册。`
          : `复习「${lesson.title}」，只过今天学过的点，不加新题。`,
      estimatedMinutes: minutes,
      dualTrackHint: includeDiff ? parentDiffHintForLesson(lesson.id) : undefined,
      abilityBridge: parentAbilityBridgeText(lesson)
    },
    sleepPriority: kind === 'review' ? 2 : 3
  };
}

function uniqueById(tasks: DailyStudyTask[]): DailyStudyTask[] {
  const seen = new Set<string>();
  const result: DailyStudyTask[] = [];
  for (const task of tasks) {
    if (seen.has(task.id)) continue;
    seen.add(task.id);
    result.push(task);
  }
  return result;
}

export interface BuildSchoolTasksInput {
  date: string;
  homeworkItems: DailyHomeworkItem[];
  schoolTrack: SchoolTrackState;
  doneIds: string[];
  tracks: GrowthTrackFields;
  gradeLevel?: GradeLevel;
}

/**
 * 由家长录入作业 + 当前教材章节生成预习/复习。
 * 一年级不因衡水差异加儿童任务；无作业且无进度时返回空数组，由 UI 渲染「尚未开始」。
 */
export function buildSchoolTasks(input: BuildSchoolTasksInput): DailyStudyTask[] {
  const doneIds = new Set(input.doneIds);
  const includeDiff = shouldShowParentSupplement(input.tracks, input.gradeLevel);
  const tasks: DailyStudyTask[] = [];

  for (const item of input.homeworkItems) {
    tasks.push(buildHomeworkTask(item, input.date, doneIds));
  }

  const linkedLessonIds = input.homeworkItems
    .map((item) => item.linkedLessonId)
    .filter((id): id is string => Boolean(id));

  const trackStarted =
    Boolean(input.schoolTrack.activeChapterId) || input.schoolTrack.completedLessonIds.length > 0;

  if (input.homeworkItems.length === 0 && !trackStarted) {
    return uniqueById(tasks).slice(0, 3);
  }

  const reviewLesson =
    (linkedLessonIds[0] ? findLessonById(linkedLessonIds[0]) : undefined) ||
    lastCompletedLesson(input.schoolTrack.completedLessonIds, input.schoolTrack.gradeLevel);

  const previewLesson = firstIncompleteLesson(
    input.schoolTrack.completedLessonIds,
    input.schoolTrack.gradeLevel,
    input.schoolTrack.activeChapterId
  );

  if (reviewLesson) {
    tasks.push(
      buildLessonTask({
        kind: 'review',
        lesson: reviewLesson,
        date: input.date,
        doneIds,
        includeDiff
      })
    );
  }

  if (previewLesson && previewLesson.id !== reviewLesson?.id) {
    tasks.push(
      buildLessonTask({
        kind: 'preview',
        lesson: previewLesson,
        date: input.date,
        doneIds,
        includeDiff
      })
    );
  }

  return uniqueById(tasks).slice(0, 3);
}

export function childVisibleTasks(tasks: DailyStudyTask[]): DailyStudyTask[] {
  return tasks.filter((task) => task.status !== 'dropped_for_sleep');
}

export function primaryChildTask(tasks: DailyStudyTask[]): DailyStudyTask | null {
  const visible = childVisibleTasks(tasks);
  const pending = visible.find((task) => task.status === 'pending');
  return pending || visible[0] || null;
}
