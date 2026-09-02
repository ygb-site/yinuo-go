import type { GradeLevel } from '../../types/curriculum';
import { hometownShadowIsTight, type GrowthTrackFields } from '../growth/tracks';
import { findChapterById, findLessonById, listLessonsForGrade } from '../../data/school/textbookCatalog';
import type {
  CurriculumTrackState,
  DualTrackDiffItem,
  DualTrackViewModel,
  HometownTrackState,
  SchoolTrackState
} from './types';
import { isTrackStarted } from './resolve';

function gradeYear(gradeLevel?: GradeLevel): number {
  return Number(String(gradeLevel || 'g1_t1').slice(1, 2)) || 1;
}

/** 儿童端学校层不因衡水差异加第二套作业；四年级前一律不加 */
export function shouldEmitChildHometownWork(gradeLevel?: GradeLevel): boolean {
  return gradeYear(gradeLevel) >= 4;
}

/** 家长端补充学习建议：returnWindow 到达且年级进入收紧窗口 */
export function shouldShowParentSupplement(tracks: GrowthTrackFields, gradeLevel?: GradeLevel): boolean {
  return hometownShadowIsTight(tracks, gradeLevel);
}

export function collectDualTrackDiffs(school: SchoolTrackState): DualTrackDiffItem[] {
  // 一年级两地同用统编目录；差异写在课时元数据上
  const lessons = listLessonsForGrade(school.gradeLevel);
  const diffs: DualTrackDiffItem[] = [];
  for (const lesson of lessons) {
    if (lesson.diffKind === 'same' && !lesson.diffNote) continue;
    diffs.push({
      lessonId: lesson.id,
      subjectId: lesson.subjectId,
      beijingTitle: lesson.title,
      hometownTitle: lesson.hometownTitle,
      kind: lesson.diffKind,
      note: lesson.diffNote
    });
  }
  return diffs;
}

function chapterTitle(track: CurriculumTrackState): string | null {
  if (!track.activeChapterId) return null;
  const chapter = findChapterById(track.activeChapterId);
  return chapter?.title || null;
}

export function buildSupplementSuggestions(
  school: SchoolTrackState,
  hometown: HometownTrackState,
  diffs: DualTrackDiffItem[]
): string[] {
  const suggestions: string[] = [];
  const schoolChapter = chapterTitle(school);
  const hometownChapter = chapterTitle(hometown);

  if (schoolChapter && hometownChapter && schoolChapter !== hometownChapter) {
    suggestions.push(`北京当前在「${schoolChapter}」，衡水记录在「${hometownChapter}」。回老家窗口已到，按差异补熟练度，不另开第二套练习册。`);
  }

  const emphasis = diffs.filter((item) => item.kind === 'pace' || item.kind === 'emphasis').slice(0, 2);
  for (const item of emphasis) {
    suggestions.push(`${item.beijingTitle}：${item.note}`);
  }

  return suggestions.slice(0, 3);
}

export function buildDualTrackView(
  school: SchoolTrackState,
  hometown: HometownTrackState,
  tracks: GrowthTrackFields,
  gradeLevel?: GradeLevel
): DualTrackViewModel {
  const diffs = collectDualTrackDiffs(school);
  const gradeOneRecordOnly = gradeYear(gradeLevel) <= 1;
  const supplementEnabled = shouldShowParentSupplement(tracks, gradeLevel) && !gradeOneRecordOnly;
  return {
    school,
    hometown,
    diffs,
    schoolStarted: isTrackStarted(school),
    hometownStarted: isTrackStarted(hometown),
    gradeOneRecordOnly,
    supplementEnabled,
    supplementSuggestions: supplementEnabled ? buildSupplementSuggestions(school, hometown, diffs) : []
  };
}

export function parentDiffHintForLesson(lessonId: string | undefined): string | undefined {
  if (!lessonId) return undefined;
  const lesson = findLessonById(lessonId);
  if (!lesson) return undefined;
  if (lesson.diffKind === 'same' && !lesson.diffNote) return undefined;
  return lesson.diffNote;
}
