import type { GradeLevel } from '../../types/curriculum';
import type { AbilityDimensionId } from '../ability/types';
import type { EducationTrackId } from '../growth/tracks';

/** 全国新版统编学科：学校层只接语文、数学，不把课表里的音体美塞进来 */
export type TextbookSubjectId = 'chinese' | 'math';

/** 教材版本。当前家庭用的是 2024 起全国新版统编 */
export type TextbookEditionId = 'pep-2024';

export const TEXTBOOK_SUBJECT_IDS: TextbookSubjectId[] = ['chinese', 'math'];
export const DEFAULT_TEXTBOOK_EDITION: TextbookEditionId = 'pep-2024';

export const TEXTBOOK_SUBJECT_LABEL: Record<TextbookSubjectId, string> = {
  chinese: '语文',
  math: '数学'
};

export type CatalogStatus = 'seed' | 'pending';

export type DualTrackDiffKind = 'same' | 'pace' | 'emphasis' | 'extra';

/**
 * 课内知识点 → 围棋能力映射。
 * 只做观察/推理的对应说明，不生成额外习题，也不写 AbilityEvent（避免用作业勾选伪造能力分）。
 */
export interface SchoolAbilityBridge {
  knowledgeTag: string;
  dimensionId: AbilityDimensionId;
  goSkillHint: string;
}

/** 课时元数据：grade-subject-chapter（单元）-lesson。不内置课文/例题全文 */
export interface TextbookLessonMeta {
  id: string;
  editionId: TextbookEditionId;
  gradeLevel: GradeLevel;
  subjectId: TextbookSubjectId;
  unitNumber: number;
  unitTitle: string;
  lessonNumber: number;
  title: string;
  beijingPoints: string[];
  hometownLessonId: string;
  hometownTitle: string;
  diffKind: DualTrackDiffKind;
  diffNote: string;
  estimatedPreviewMinutes: number;
  estimatedReviewMinutes: number;
  abilityBridges: SchoolAbilityBridge[];
  catalogStatus: CatalogStatus;
}

export interface TextbookChapterMeta {
  id: string;
  editionId: TextbookEditionId;
  gradeLevel: GradeLevel;
  subjectId: TextbookSubjectId;
  unitNumber: number;
  title: string;
  lessonIds: string[];
  catalogStatus: CatalogStatus;
}

export type CurriculumTrackRole = 'school' | 'hometown';

/**
 * 北京本校教材课时进度。
 * 与档案顶层 `schoolTrack: EducationTrackId`（城市轴）分开：那边记「跟哪座城」，这里记「学到哪一课」。
 */
export interface SchoolTrackState {
  role: 'school';
  city: EducationTrackId;
  editionId: TextbookEditionId;
  gradeLevel: GradeLevel;
  completedLessonIds: string[];
  activeChapterId: string | null;
  updatedAt: number;
}

/** 衡水同年级教材课时进度。一年级只记录，不据此给儿童加第二套作业 */
export interface HometownTrackState {
  role: 'hometown';
  city: EducationTrackId;
  editionId: TextbookEditionId;
  gradeLevel: GradeLevel;
  completedLessonIds: string[];
  activeChapterId: string | null;
  updatedAt: number;
}

export type CurriculumTrackState = SchoolTrackState | HometownTrackState;

export interface DailyHomeworkItem {
  id: string;
  subjectId: TextbookSubjectId;
  parentNote: string;
  linkedLessonId?: string;
  estimatedMinutes: number;
  createdAt: number;
}

export interface DailyHomeworkRecord {
  date: string;
  items: DailyHomeworkItem[];
  updatedAt: number;
}

export type SchoolTaskKind = 'school_homework' | 'preview' | 'review';

export type SchoolTaskStatus = 'pending' | 'done' | 'dropped_for_sleep';

/** 儿童侧只允许出现动词开头的短句，不含双轨差异 */
export interface SchoolTaskChildView {
  verbTitle: string;
  shortHint: string;
}

/** 家长侧备注：作业原话、耗时、差异、围棋映射。不对儿童展示 */
export interface SchoolTaskParentView {
  note: string;
  estimatedMinutes: number;
  dualTrackHint?: string;
  abilityBridge?: string;
  sleepNote?: string;
}

export interface DailyStudyTask {
  id: string;
  date: string;
  kind: SchoolTaskKind;
  subjectId: TextbookSubjectId;
  estimatedMinutes: number;
  status: SchoolTaskStatus;
  sourceHomeworkId?: string;
  sourceLessonId?: string;
  child: SchoolTaskChildView;
  parent: SchoolTaskParentView;
  /** 越小越该保留：1 校内作业，2 复习，3 预习 */
  sleepPriority: number;
}

export interface DualTrackDiffItem {
  lessonId: string;
  subjectId: TextbookSubjectId;
  beijingTitle: string;
  hometownTitle: string;
  kind: DualTrackDiffKind;
  note: string;
}

export interface DualTrackViewModel {
  school: SchoolTrackState;
  hometown: HometownTrackState;
  diffs: DualTrackDiffItem[];
  schoolStarted: boolean;
  hometownStarted: boolean;
  /** 一年级：只展示差异记录，不给补充学习建议 */
  gradeOneRecordOnly: boolean;
  /** returnWindow 已到达：家长可见补充建议 */
  supplementEnabled: boolean;
  supplementSuggestions: string[];
}

export interface SleepBudget {
  bedtimeMinutes: number;
  remainingMinutes: number;
  pastBedtime: boolean;
}

export interface SchoolEmptyState {
  code: 'not-started';
  childLabel: '尚未开始';
  parentLabel: '尚未开始';
}

export interface SchoolLayerState {
  bedtimeMinutes: number;
  schoolTrack: SchoolTrackState;
  hometownTrack: HometownTrackState;
  homeworkByDate: Record<string, DailyHomeworkRecord>;
  taskDoneByDate: Record<string, string[]>;
}

/** AI 小诺学校层输出：引导者，禁止直接给标准答案 */
export interface SchoolTutorDualOutput {
  child: string;
  parent: string;
}
