import type { ScheduleGrid } from '../stores/useScheduleStore';

export type GradeYear = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6';

export type TermSemester = 'term1' | 'term2'; // term1: 上学期 (秋季), term2: 下学期 (春季)

export const GRADE_YEAR_OPTIONS: { id: GradeYear; label: string; shortLabel: string }[] = [
  { id: 'g1', label: '一年级', shortLabel: '一年级' },
  { id: 'g2', label: '二年级', shortLabel: '二年级' },
  { id: 'g3', label: '三年级', shortLabel: '三年级' },
  { id: 'g4', label: '四年级', shortLabel: '四年级' },
  { id: 'g5', label: '五年级', shortLabel: '五年级' },
  { id: 'g6', label: '六年级', shortLabel: '六年级' }
];

export const TERM_SEMESTER_OPTIONS: { id: TermSemester; label: string; season: string }[] = [
  { id: 'term1', label: '上学期', season: '秋季学期' },
  { id: 'term2', label: '下学期', season: '春季学期' }
];

export interface ScheduleVersionRecord {
  id: string; // 唯一ID，如 "g1-term1-20260907"
  gradeYear: GradeYear; // 年级 'g1' | 'g2' ...
  gradeLabel: string; // "一年级"
  term: TermSemester; // 学期 'term1' | 'term2'
  termLabel: string; // "上学期" | "下学期"
  versionDate: string; // 格式 "YYYY.MM.DD"，例如 "2026.09.07"
  title: string; // 版本名称，如 "校区最新核定版"
  note?: string; // 变更说明，如 "周一古诗与周四语文2对调"
  schoolName: string;
  className: string;
  grid: ScheduleGrid; // 课表格子课程分布
  teachers: Record<string, string>; // 每节课的任课老师映射表，key 为 "day-period" 如 "1-1": "王岩梅"
  periods?: any[]; // 该版本专属的节次时段配置（支持早读、8节课、晚自习等）
  isCurrent: boolean; // 是否为当前生效执行版本
  createdAt: string;
  updatedAt: string;
}

