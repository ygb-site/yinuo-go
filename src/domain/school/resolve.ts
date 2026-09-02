import { isEducationTrackId, resolveGradeLevel, type EducationTrackId } from '../growth/tracks';
import { localDateKey } from '../today/dayPhase';
import {
  DEFAULT_TEXTBOOK_EDITION,
  type CurriculumTrackState,
  type DailyHomeworkItem,
  type DailyHomeworkRecord,
  type HometownTrackState,
  type SchoolLayerState,
  type SchoolTrackState,
  type TextbookSubjectId
} from './types';
import type { GradeLevel } from '../../types/curriculum';

/** 一年级默认 21:00 就寝。用分钟数避免时区字符串解析歧义 */
export const DEFAULT_BEDTIME_MINUTES = 21 * 60;
export const MIN_BEDTIME_MINUTES = 19 * 60 + 30;
export const MAX_BEDTIME_MINUTES = 22 * 60;
export const MIN_TASK_MINUTES = 10;
export const MAX_TASK_MINUTES = 20;

const SUBJECT_IDS: TextbookSubjectId[] = ['chinese', 'math'];

export function clampBedtimeMinutes(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_BEDTIME_MINUTES;
  if (n < MIN_BEDTIME_MINUTES) return MIN_BEDTIME_MINUTES;
  if (n > MAX_BEDTIME_MINUTES) return MAX_BEDTIME_MINUTES;
  return Math.round(n / 30) * 30;
}

export function clampTaskMinutes(value: unknown, fallback = 15): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  if (n < MIN_TASK_MINUTES) return MIN_TASK_MINUTES;
  if (n > MAX_TASK_MINUTES) return MAX_TASK_MINUTES;
  return Math.round(n);
}

export function isTextbookSubjectId(value: unknown): value is TextbookSubjectId {
  return value === 'chinese' || value === 'math';
}

function cloneStringIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of input) {
    if (typeof item !== 'string' || !item || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

export function emptySchoolTrack(
  city: EducationTrackId,
  gradeLevel: GradeLevel,
  now = Date.now()
): SchoolTrackState {
  return {
    role: 'school',
    city: isEducationTrackId(city) ? city : 'beijing',
    editionId: DEFAULT_TEXTBOOK_EDITION,
    gradeLevel: resolveGradeLevel(gradeLevel),
    completedLessonIds: [],
    activeChapterId: null,
    updatedAt: now
  };
}

export function emptyHometownTrack(
  city: EducationTrackId,
  gradeLevel: GradeLevel,
  now = Date.now()
): HometownTrackState {
  return {
    role: 'hometown',
    city: isEducationTrackId(city) ? city : 'hengshui',
    editionId: DEFAULT_TEXTBOOK_EDITION,
    gradeLevel: resolveGradeLevel(gradeLevel),
    completedLessonIds: [],
    activeChapterId: null,
    updatedAt: now
  };
}

function resolveTrack<T extends CurriculumTrackState>(
  input: Partial<T> | null | undefined,
  fallback: T
): T {
  const completedLessonIds = cloneStringIds(input?.completedLessonIds);
  const activeChapterId =
    typeof input?.activeChapterId === 'string' && input.activeChapterId
      ? input.activeChapterId
      : null;
  return {
    ...fallback,
    city: isEducationTrackId(input?.city) ? input.city : fallback.city,
    gradeLevel: resolveGradeLevel(input?.gradeLevel, fallback.gradeLevel),
    completedLessonIds,
    activeChapterId,
    updatedAt: typeof input?.updatedAt === 'number' ? input.updatedAt : fallback.updatedAt
  };
}

export function emptyHomeworkRecord(date = localDateKey(), now = Date.now()): DailyHomeworkRecord {
  return { date, items: [], updatedAt: now };
}

function resolveHomeworkItem(raw: unknown): DailyHomeworkItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<DailyHomeworkItem>;
  if (typeof item.id !== 'string' || !item.id) return null;
  if (!isTextbookSubjectId(item.subjectId)) return null;
  const parentNote = typeof item.parentNote === 'string' ? item.parentNote.trim().slice(0, 200) : '';
  const linkedLessonId =
    typeof item.linkedLessonId === 'string' && item.linkedLessonId ? item.linkedLessonId : undefined;
  return {
    id: item.id,
    subjectId: item.subjectId,
    parentNote,
    linkedLessonId,
    estimatedMinutes: clampTaskMinutes(item.estimatedMinutes, 15),
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now()
  };
}

export function resolveHomeworkRecord(
  input?: Partial<DailyHomeworkRecord> | null,
  date = localDateKey()
): DailyHomeworkRecord {
  if (!input || input.date !== date) {
    return emptyHomeworkRecord(date);
  }
  const items: DailyHomeworkItem[] = [];
  const seen = new Set<string>();
  for (const raw of Array.isArray(input.items) ? input.items : []) {
    const item = resolveHomeworkItem(raw);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return {
    date,
    items,
    updatedAt: typeof input.updatedAt === 'number' ? input.updatedAt : Date.now()
  };
}

export function emptySchoolLayer(
  schoolCity: EducationTrackId = 'beijing',
  hometownCity: EducationTrackId = 'hengshui',
  gradeLevel: GradeLevel = 'g1_t1',
  now = Date.now()
): SchoolLayerState {
  return {
    bedtimeMinutes: DEFAULT_BEDTIME_MINUTES,
    schoolTrack: emptySchoolTrack(schoolCity, gradeLevel, now),
    hometownTrack: emptyHometownTrack(hometownCity, gradeLevel, now),
    homeworkByDate: {},
    taskDoneByDate: {}
  };
}

export function resolveSchoolLayer(
  input?: Partial<SchoolLayerState> | null,
  schoolCity: EducationTrackId = 'beijing',
  hometownCity: EducationTrackId = 'hengshui',
  gradeLevel: GradeLevel = 'g1_t1'
): SchoolLayerState {
  const fallback = emptySchoolLayer(schoolCity, hometownCity, gradeLevel);
  if (!input) return fallback;

  const homeworkByDate: Record<string, DailyHomeworkRecord> = {};
  if (input.homeworkByDate && typeof input.homeworkByDate === 'object') {
    for (const [key, value] of Object.entries(input.homeworkByDate)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      homeworkByDate[key] = resolveHomeworkRecord(value, key);
    }
  }

  const taskDoneByDate: Record<string, string[]> = {};
  if (input.taskDoneByDate && typeof input.taskDoneByDate === 'object') {
    for (const [key, value] of Object.entries(input.taskDoneByDate)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      taskDoneByDate[key] = cloneStringIds(value);
    }
  }

  return {
    bedtimeMinutes: clampBedtimeMinutes(input.bedtimeMinutes),
    schoolTrack: resolveTrack(input.schoolTrack, fallback.schoolTrack),
    hometownTrack: resolveTrack(input.hometownTrack, fallback.hometownTrack),
    homeworkByDate,
    taskDoneByDate
  };
}

export function isTrackStarted(track: CurriculumTrackState): boolean {
  return track.activeChapterId !== null || track.completedLessonIds.length > 0;
}

export function notStartedLabel(): '尚未开始' {
  return '尚未开始';
}

export function allowedSubjects(): TextbookSubjectId[] {
  return [...SUBJECT_IDS];
}
