import type { CoreSubjectId, UniversalChapter, UniversalLesson } from '../../types/curriculum';
import { GO_UNIVERSAL_CHAPTERS } from './goCurriculum';
import { MATH_CHAPTERS } from './mathCurriculum';
import { CHINESE_CHAPTERS } from './chineseCurriculum';
import { ENGLISH_CHAPTERS } from './englishCurriculum';

export const CURRICULUM_REGISTRY: Record<CoreSubjectId, UniversalChapter[]> = {
  go: GO_UNIVERSAL_CHAPTERS,
  math: MATH_CHAPTERS,
  chinese: CHINESE_CHAPTERS,
  english: ENGLISH_CHAPTERS
};

export const getChaptersBySubject = (subjectId: any): UniversalChapter[] => {
  return (CURRICULUM_REGISTRY as any)[subjectId] || [];
};

export const getAllLessonsBySubject = (subjectId: any): UniversalLesson[] => {
  const chapters = getChaptersBySubject(subjectId);
  const lessons: UniversalLesson[] = [];
  for (const ch of chapters) {
    lessons.push(...ch.lessons);
  }
  return lessons;
};

export const getLessonById = (lessonId: string): UniversalLesson | null => {
  for (const subjectKey of Object.keys(CURRICULUM_REGISTRY) as CoreSubjectId[]) {
    const lessons = getAllLessonsBySubject(subjectKey);
    const found = lessons.find(l => l.id === lessonId);
    if (found) return found;
  }
  return null;
};

