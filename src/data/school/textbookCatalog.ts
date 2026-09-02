import type { GradeLevel } from '../../types/curriculum';
import type {
  CatalogStatus,
  DualTrackDiffKind,
  SchoolAbilityBridge,
  TextbookChapterMeta,
  TextbookEditionId,
  TextbookLessonMeta,
  TextbookSubjectId
} from '../../domain/school/types';
import { DEFAULT_TEXTBOOK_EDITION } from '../../domain/school/types';

export const TEXTBOOK_CATALOG_VERSION = 'pep-2024-g1t1-seed-v1';

interface LessonSeed {
  lessonNumber: number;
  title: string;
  beijingPoints?: string[];
  hometownTitle?: string;
  diffKind?: DualTrackDiffKind;
  diffNote?: string;
  preview?: number;
  review?: number;
  bridges?: SchoolAbilityBridge[];
  catalogStatus?: CatalogStatus;
}

interface UnitSeed {
  unitNumber: number;
  title: string;
  catalogStatus?: CatalogStatus;
  lessons: LessonSeed[];
}

function lessonId(subject: TextbookSubjectId, grade: GradeLevel, unit: number, lesson: number): string {
  return `${subject}:${grade}:u${unit}:l${lesson}`;
}

function chapterId(subject: TextbookSubjectId, grade: GradeLevel, unit: number): string {
  return `${subject}:${grade}:u${unit}`;
}

function expandUnit(
  subject: TextbookSubjectId,
  grade: GradeLevel,
  edition: TextbookEditionId,
  unit: UnitSeed
): { chapter: TextbookChapterMeta; lessons: TextbookLessonMeta[] } {
  const chapterKey = chapterId(subject, grade, unit.unitNumber);
  const lessons: TextbookLessonMeta[] = unit.lessons.map((seed) => {
    const id = lessonId(subject, grade, unit.unitNumber, seed.lessonNumber);
    const status = seed.catalogStatus || (seed.beijingPoints && seed.beijingPoints.length > 0 ? 'seed' : 'pending');
    return {
      id,
      editionId: edition,
      gradeLevel: grade,
      subjectId: subject,
      unitNumber: unit.unitNumber,
      unitTitle: unit.title,
      lessonNumber: seed.lessonNumber,
      title: seed.title,
      beijingPoints: seed.beijingPoints || [],
      hometownLessonId: id,
      hometownTitle: seed.hometownTitle || seed.title,
      diffKind: seed.diffKind || 'same',
      diffNote: seed.diffNote || '',
      estimatedPreviewMinutes: seed.preview || 12,
      estimatedReviewMinutes: seed.review || 10,
      abilityBridges: seed.bridges || [],
      catalogStatus: status
    };
  });

  return {
    chapter: {
      id: chapterKey,
      editionId: edition,
      gradeLevel: grade,
      subjectId: subject,
      unitNumber: unit.unitNumber,
      title: unit.title,
      lessonIds: lessons.map((item) => item.id),
      catalogStatus: unit.catalogStatus || 'seed'
    },
    lessons
  };
}

/**
 * 一年级上册目录骨架。只放单元/课时名、课标要点短句、两地差异标记。
 * 不内置课文全文、拼音表、例题原题——这些后续按课时填充。
 */
const CHINESE_G1_T1: UnitSeed[] = [
  {
    unitNumber: 1,
    title: '识字一',
    lessons: [
      {
        lessonNumber: 1,
        title: '天地人',
        beijingPoints: ['认识天、地、人', '观察象形字轮廓'],
        diffKind: 'emphasis',
        diffNote: '两地课文相同。衡水更常要求当堂会认；一年级只记录，不追加抄写。',
        bridges: [
          {
            knowledgeTag: 'observe-form',
            dimensionId: 'spatial',
            goSkillHint: '看「天、地、人」的字形轮廓，和看清棋形是同一类观察。'
          }
        ]
      },
      {
        lessonNumber: 2,
        title: '金木水火土',
        beijingPoints: ['认识金木水火土', '发现字与事物的对应'],
        diffKind: 'same',
        diffNote: ''
      },
      { lessonNumber: 3, title: '口耳目' },
      { lessonNumber: 4, title: '日月水火' },
      { lessonNumber: 5, title: '对韵歌' }
    ]
  },
  {
    unitNumber: 2,
    title: '汉语拼音',
    catalogStatus: 'pending',
    lessons: [
      { lessonNumber: 1, title: 'a o e', catalogStatus: 'pending' },
      { lessonNumber: 2, title: 'i u ü', catalogStatus: 'pending' },
      { lessonNumber: 3, title: 'b p m f', catalogStatus: 'pending' },
      { lessonNumber: 4, title: 'd t n l', catalogStatus: 'pending' }
    ]
  },
  {
    unitNumber: 3,
    title: '课文',
    lessons: [
      {
        lessonNumber: 1,
        title: '秋天',
        beijingPoints: ['朗读短文', '找出秋天的景物'],
        diffKind: 'pace',
        diffNote: '京西课堂活动更多；衡水朗读遍数要求更紧。一年级不另加衡水朗读作业。',
        bridges: [
          {
            knowledgeTag: 'sequence',
            dimensionId: 'logic',
            goSkillHint: '景物先看到什么、后看到什么，练的是按顺序观察。'
          }
        ]
      },
      { lessonNumber: 2, title: '小小的船' },
      { lessonNumber: 3, title: '江南' },
      { lessonNumber: 4, title: '四季' },
      { lessonNumber: 5, title: '影子' },
      { lessonNumber: 6, title: '比尾巴' }
    ]
  },
  {
    unitNumber: 4,
    title: '识字二',
    catalogStatus: 'pending',
    lessons: [
      { lessonNumber: 1, title: '车马', catalogStatus: 'pending' },
      { lessonNumber: 2, title: '日月明', catalogStatus: 'pending' },
      { lessonNumber: 3, title: '小书包', catalogStatus: 'pending' },
      { lessonNumber: 4, title: '升国旗', catalogStatus: 'pending' }
    ]
  }
];

const MATH_G1_T1: UnitSeed[] = [
  {
    unitNumber: 1,
    title: '准备课',
    lessons: [
      {
        lessonNumber: 1,
        title: '数一数',
        beijingPoints: ['10 以内点数', '同样多、多、少'],
        diffKind: 'pace',
        diffNote: '衡水口算起步更赶熟练度；一年级只标记，不另发口算卷。',
        bridges: [
          {
            knowledgeTag: 'count-compare',
            dimensionId: 'calculation',
            goSkillHint: '点数和比较多少，和数气、比气是同一类仔细。'
          }
        ]
      }
    ]
  },
  {
    unitNumber: 2,
    title: '1～5 的认识和加减法',
    lessons: [
      {
        lessonNumber: 1,
        title: '1～5 的认识',
        beijingPoints: ['认数 1～5', '对应实物点数'],
        diffKind: 'emphasis',
        diffNote: '两地内容相同。衡水默写数字更勤；北京更重学具操作。'
      },
      { lessonNumber: 2, title: '分与合' },
      { lessonNumber: 3, title: '加减法' }
    ]
  },
  {
    unitNumber: 3,
    title: '认识立体图形',
    catalogStatus: 'pending',
    lessons: [{ lessonNumber: 1, title: '长方体、正方体、圆柱、球', catalogStatus: 'pending' }]
  },
  {
    unitNumber: 4,
    title: '6～10 的认识和加减法',
    catalogStatus: 'pending',
    lessons: [
      { lessonNumber: 1, title: '6、7 的认识', catalogStatus: 'pending' },
      { lessonNumber: 2, title: '8、9 的认识', catalogStatus: 'pending' },
      { lessonNumber: 3, title: '10 的认识', catalogStatus: 'pending' }
    ]
  },
  {
    unitNumber: 5,
    title: '11～20 各数的认识',
    catalogStatus: 'pending',
    lessons: [{ lessonNumber: 1, title: '11～20 各数的认识', catalogStatus: 'pending' }]
  },
  {
    unitNumber: 6,
    title: '认识钟表',
    catalogStatus: 'pending',
    lessons: [{ lessonNumber: 1, title: '认识整时', catalogStatus: 'pending' }]
  },
  {
    unitNumber: 7,
    title: '20 以内的进位加法',
    catalogStatus: 'pending',
    lessons: [{ lessonNumber: 1, title: '9 加几', catalogStatus: 'pending' }]
  }
];

const CHAPTERS: TextbookChapterMeta[] = [];
const LESSONS: TextbookLessonMeta[] = [];

function load(subject: TextbookSubjectId, grade: GradeLevel, units: UnitSeed[]) {
  for (const unit of units) {
    const expanded = expandUnit(subject, grade, DEFAULT_TEXTBOOK_EDITION, unit);
    CHAPTERS.push(expanded.chapter);
    LESSONS.push(...expanded.lessons);
  }
}

load('chinese', 'g1_t1', CHINESE_G1_T1);
load('math', 'g1_t1', MATH_G1_T1);

export const TEXTBOOK_CHAPTERS: TextbookChapterMeta[] = CHAPTERS;
export const TEXTBOOK_LESSONS: TextbookLessonMeta[] = LESSONS;

export function findLessonById(id?: string | null): TextbookLessonMeta | undefined {
  if (!id) return undefined;
  return LESSONS.find((item) => item.id === id);
}

export function findChapterById(id?: string | null): TextbookChapterMeta | undefined {
  if (!id) return undefined;
  return CHAPTERS.find((item) => item.id === id);
}

export function listChaptersForGrade(
  gradeLevel: GradeLevel,
  subjectId?: TextbookSubjectId
): TextbookChapterMeta[] {
  return CHAPTERS.filter((item) => {
    if (item.gradeLevel !== gradeLevel) return false;
    if (subjectId && item.subjectId !== subjectId) return false;
    return true;
  });
}

export function listLessonsForGrade(
  gradeLevel: GradeLevel,
  subjectId?: TextbookSubjectId
): TextbookLessonMeta[] {
  return LESSONS.filter((item) => {
    if (item.gradeLevel !== gradeLevel) return false;
    if (subjectId && item.subjectId !== subjectId) return false;
    return true;
  });
}

export function lessonsInChapter(chapterId: string): TextbookLessonMeta[] {
  const chapter = findChapterById(chapterId);
  if (!chapter) return [];
  return chapter.lessonIds
    .map((id) => findLessonById(id))
    .filter((item): item is TextbookLessonMeta => Boolean(item));
}

export function lastCompletedLesson(
  completedIds: string[],
  gradeLevel: GradeLevel
): TextbookLessonMeta | undefined {
  if (completedIds.length === 0) return undefined;
  const lastId = completedIds[completedIds.length - 1];
  const found = findLessonById(lastId);
  if (found) return found;
  const all = listLessonsForGrade(gradeLevel);
  for (let i = all.length - 1; i >= 0; i -= 1) {
    if (completedIds.includes(all[i].id)) return all[i];
  }
  return undefined;
}

export function firstIncompleteLesson(
  completedIds: string[],
  gradeLevel: GradeLevel,
  activeChapterId?: string | null
): TextbookLessonMeta | undefined {
  const done = new Set(completedIds);
  if (activeChapterId) {
    const inChapter = lessonsInChapter(activeChapterId).find((item) => !done.has(item.id));
    if (inChapter) return inChapter;
  }
  return listLessonsForGrade(gradeLevel).find((item) => !done.has(item.id));
}

export function chapterOptions(gradeLevel: GradeLevel, subjectId?: TextbookSubjectId) {
  return listChaptersForGrade(gradeLevel, subjectId).map((item) => ({
    value: item.id,
    label: `${item.subjectId === 'chinese' ? '语文' : '数学'} · ${item.title}`
  }));
}

export function lessonOptions(gradeLevel: GradeLevel, subjectId?: TextbookSubjectId) {
  return listLessonsForGrade(gradeLevel, subjectId).map((item) => ({
    value: item.id,
    label: `${item.unitTitle} · ${item.title}`
  }));
}

export function pendingCatalogCount(): number {
  return LESSONS.filter((item) => item.catalogStatus === 'pending').length;
}
