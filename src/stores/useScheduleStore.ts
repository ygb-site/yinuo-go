import type { GradeYear, TermSemester, ScheduleVersionRecord } from '../types/scheduleVersion';
export * from '../types/scheduleVersion';
import { defineStore } from 'pinia';
import { useUserStore } from './useUserStore';

/** 周一到周五 */
export type WeekdayId = 1 | 2 | 3 | 4 | 5;

/** 京西校区一年级科目 */
export type SubjectTone =
  | 'rose'
  | 'sky'
  | 'indigo'
  | 'amber'
  | 'emerald'
  | 'orange'
  | 'violet'
  | 'pink'
  | 'teal'
  | 'cyan'
  | 'slate'
  | 'lime';

export type PredefinedSubjectId =
  | 'empty'
  | 'bandui'
  | 'yuwen1'
  | 'yuwen2'
  | 'shuxue'
  | 'quweishuxue'
  | 'yingyu'
  | 'quweiyingyu'
  | 'kexue'
  | 'laodong'
  | 'zonghe'
  | 'daofa'
  | 'yinyue'
  | 'tiyu'
  | 'gushi'
  | 'meishu1'
  | 'xinli';

export type SubjectId = PredefinedSubjectId | string;

export interface ScheduleSubject {
  id: SubjectId;
  name: string;
  shortName: string;
  emoji: string;
  tone: SubjectTone;
  defaultTeacher?: string;
  isCustom?: boolean;
}

export type PeriodSlotType = 'morning_read' | 'morning' | 'afternoon' | 'evening';

export interface SchedulePeriod {
  id: number;
  label: string;
  time: string;
  slotType: PeriodSlotType;
  afternoon?: boolean;
}

/** 挂在学员档案上、跟云端一起同步的课表数据 */
export interface ChildScheduleData {
  hasSchedule?: boolean;
  grid: ScheduleGrid;
  schoolName: string;
  className: string;
  studentName?: string;
  teachers?: Record<string, string>;
  gradeYear?: GradeYear;
  gradeLabel?: string;
  /** 官方课表版本；变更时自动覆盖为最新官方表 */
  version?: string;
  /** 完整的课表版本归档库（分年级、分上下学期、分日期版本、各版本老师映射，随档案上云） */
  versionRecords?: ScheduleVersionRecord[];
  /** 自定义节次时段配置（支持早读、8节课、晚自习等，随档案上云） */
  periods?: SchedulePeriod[];
  /** 用户自定义新增的课程名录 */
  customSubjects?: ScheduleSubject[];
  /** 当前正在查看/生效的版本 ID */
  activeRecordId?: string;
}

export const WEEKDAYS: { id: WeekdayId; name: string; shortName: string }[] = [
  { id: 1, name: '周一', shortName: '一' },
  { id: 2, name: '周二', shortName: '二' },
  { id: 3, name: '周三', shortName: '三' },
  { id: 4, name: '周四', shortName: '四' },
  { id: 5, name: '周五', shortName: '五' }
];

export const DEFAULT_SCHEDULE_PERIODS: SchedulePeriod[] = [
  { id: 1, label: '第1节', time: '08:00-08:40', slotType: 'morning', afternoon: false },
  { id: 2, label: '第2节', time: '08:50-09:30', slotType: 'morning', afternoon: false },
  { id: 3, label: '第3节', time: '09:50-10:30', slotType: 'morning', afternoon: false },
  { id: 4, label: '第4节', time: '10:40-11:20', slotType: 'morning', afternoon: false },
  { id: 5, label: '第5节', time: '14:00-14:40', slotType: 'afternoon', afternoon: true },
  { id: 6, label: '第6节', time: '14:50-15:30', slotType: 'afternoon', afternoon: true }
];

export const SCHEDULE_PERIODS: SchedulePeriod[] = DEFAULT_SCHEDULE_PERIODS;

/** 上午第 1–4 节 / 下午第 5–6 节（UI 分组用） */
export const MORNING_PERIODS = SCHEDULE_PERIODS.filter((p) => !p.afternoon);
export const AFTERNOON_PERIODS = SCHEDULE_PERIODS.filter((p) => !!p.afternoon);

/** 人大附小京西分校 · 一年级 1.1 班科目（展示一律用全称，不用简写） */
export const SCHEDULE_SUBJECTS: ScheduleSubject[] = [
  { id: 'yuwen1', name: '语文1', shortName: '语文1', emoji: '📖', tone: 'rose' },
  { id: 'yuwen2', name: '语文2', shortName: '语文2', emoji: '📕', tone: 'rose' },
  { id: 'shuxue', name: '数学', shortName: '数学', emoji: '🔢', tone: 'sky' },
  { id: 'quweishuxue', name: '趣味数学', shortName: '趣味数学', emoji: '🧩', tone: 'cyan' },
  { id: 'yingyu', name: '英语', shortName: '英语', emoji: '🔤', tone: 'indigo' },
  { id: 'quweiyingyu', name: '趣味英语', shortName: '趣味英语', emoji: '🗣️', tone: 'violet' },
  { id: 'daofa', name: '道德与法治', shortName: '道德与法治', emoji: '⚖️', tone: 'amber' },
  { id: 'laodong', name: '劳动', shortName: '劳动', emoji: '🌱', tone: 'emerald' },
  { id: 'kexue', name: '科学', shortName: '科学', emoji: '🔬', tone: 'teal' },
  { id: 'tiyu', name: '体育与健康', shortName: '体育与健康', emoji: '⚽', tone: 'orange' },
  { id: 'yinyue', name: '音乐', shortName: '音乐', emoji: '🎵', tone: 'violet' },
  { id: 'meishu1', name: '美术1', shortName: '美术1', emoji: '🎨', tone: 'pink' },
  { id: 'gushi', name: '校本古诗', shortName: '校本古诗', emoji: '📜', tone: 'amber' },
  { id: 'zonghe', name: '综合实践', shortName: '综合实践', emoji: '🛠️', tone: 'lime' },
  { id: 'bandui', name: '班队会', shortName: '班队会', emoji: '🏫', tone: 'slate' },
  { id: 'xinli', name: '心理游戏', shortName: '心理游戏', emoji: '🧠', tone: 'pink' },
  { id: 'empty', name: '空课', shortName: '空课', emoji: '⬜', tone: 'slate' }
];

export type ScheduleGrid = Record<string, SubjectId>;

/** 官方课表版本：京西校区 26-27 学年 · 一年级 1.1 班 */
export const OFFICIAL_SCHEDULE_VERSION = 'jw-1.1-2627-v3-blank';

const DEFAULT_SCHOOL_NAME = '中国人民大学附属小学京西分校';
const DEFAULT_CLASS_NAME = '1.1班';
const DEFAULT_STUDENT_NAME = '杨一诺';
const LOCAL_SCHEDULE_KEY = 'yinuo_go_schedule_store_v5';

/** 京西校区 26-27 学年 · 一年级 1.1 班各节次任课教师表 */
export const OFFICIAL_SCHEDULE_TEACHERS: Record<string, string> = {
  // 周一
  '1-1': '王岩梅', // 班队会
  '1-2': '李慧',   // 数学
  '1-3': '张琪',   // 校本古诗
  '1-4': '田永甜', // 道德与法治
  '1-5': '石旺晰', // 体育与健康
  '1-6': '王冲',   // 心理游戏
  // 周二
  '2-1': '王岩梅', // 语文1
  '2-2': '李慧',   // 数学
  '2-3': '李雪梅', // 趣味数学
  '2-4': '闫金莉', // 音乐
  '2-5': '王岩梅', // 语文1
  '2-6': '石旺晰', // 体育与健康
  // 周三
  '3-1': '李慧',   // 数学
  '3-2': '王岩梅', // 语文1
  '3-3': '周梦琪', // 科学
  '3-4': '石旺晰', // 体育与健康
  '3-5': '高慧',   // 美术1
  '3-6': '高慧',   // 美术1
  // 周四
  '4-1': '王岩梅', // 语文1
  '4-2': '刘娜',   // 英语
  '4-3': '李慧',   // 劳动
  '4-4': '李丽丽', // 语文2
  '4-5': '闫金莉', // 音乐
  '4-6': '石旺晰', // 体育与健康
  // 周五
  '5-1': '李慧',   // 数学
  '5-2': '王岩梅', // 语文1
  '5-3': '李丽丽', // 综合实践
  '5-4': '石旺晰', // 体育与健康
  '5-5': '王慧敏', // 趣味英语
  '5-6': '王岩梅'  // 语文1
};


export const LOCAL_HAS_SCHEDULE_KEY = 'yinuo_has_schedule_v5';

export function readStoredHasSchedule(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return localStorage.getItem(LOCAL_HAS_SCHEDULE_KEY) === 'true';
  } catch {
    return false;
  }
}

export const LOCAL_CUSTOM_SUBJECTS_KEY = 'yinuo_custom_subjects_v5';

export function readStoredCustomSubjects(): ScheduleSubject[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(LOCAL_CUSTOM_SUBJECTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export const LOCAL_SCHEDULE_VERSIONS_KEY = "yinuo_schedule_version_records_v1";

export function createInitialVersionRecords(): ScheduleVersionRecord[] {
  return [
    {
      id: "g1-term1-blank",
      gradeYear: "g1",
      gradeLabel: "一年级",
      term: "term1",
      termLabel: "上学期",
      versionDate: "2026.09.07",
      title: "一年级上学期 (待AI识别排课)",
      note: "",
      schoolName: DEFAULT_SCHOOL_NAME,
      className: DEFAULT_CLASS_NAME,
      grid: createEmptyGrid(),
      teachers: {},
      isCurrent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

function readStoredVersionRecords(): ScheduleVersionRecord[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return createInitialVersionRecords();
    }
    const raw = localStorage.getItem(LOCAL_SCHEDULE_VERSIONS_KEY);
    if (!raw) return createInitialVersionRecords();
    const parsed = JSON.parse(raw);
    // 若本地仅有旧默认数据，自动重置为全新的空白状态，方便用户体验 AI 识图排课
    if (Array.isArray(parsed) && parsed.some(p => p.id === 'g1-term1-20260907')) {
      const blank = createInitialVersionRecords();
      localStorage.setItem(LOCAL_SCHEDULE_VERSIONS_KEY, JSON.stringify(blank));
      return blank;
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return createInitialVersionRecords();
  } catch {
    return createInitialVersionRecords();
  }
}

function cellKey(day: WeekdayId, period: number): string {
  return `${day}-${period}`;
}

export function createEmptyGrid(periods: SchedulePeriod[] = DEFAULT_SCHEDULE_PERIODS): ScheduleGrid {
  const grid: ScheduleGrid = {};
  for (const day of WEEKDAYS) {
    for (const period of periods) {
      grid[cellKey(day.id, period.id)] = 'empty';
    }
  }
  return grid;
}

/** 京西校区 26-27 学年 · 一年级 1.1 班官方课表 */
export function createOfficialGrid(): ScheduleGrid {
  return createEmptyGrid();
}

export function createOfficialScheduleData(): ChildScheduleData {
  return {
    grid: createOfficialGrid(),
    schoolName: DEFAULT_SCHOOL_NAME,
    className: DEFAULT_CLASS_NAME,
    studentName: DEFAULT_STUDENT_NAME,
    version: OFFICIAL_SCHEDULE_VERSION,
    versionRecords: createInitialVersionRecords(),
    customSubjects: [],
    activeRecordId: 'g1-term1-blank'
  };
}

export function createDefaultScheduleData(): ChildScheduleData {
  return createOfficialScheduleData();
}

function cloneScheduleData(data: ChildScheduleData): ChildScheduleData {
  return {
    grid: { ...createEmptyGrid(), ...data.grid },
    schoolName: data.schoolName || DEFAULT_SCHOOL_NAME,
    className: data.className || DEFAULT_CLASS_NAME,
    studentName: data.studentName || DEFAULT_STUDENT_NAME,
    version: data.version,
    versionRecords: data.versionRecords ? JSON.parse(JSON.stringify(data.versionRecords)) : undefined,
    customSubjects: data.customSubjects ? JSON.parse(JSON.stringify(data.customSubjects)) : undefined,
    activeRecordId: data.activeRecordId
  };
}

function countFilledCells(grid: ScheduleGrid): number {
  return Object.values(grid).filter((id) => id && id !== 'empty').length;
}

/** 选课弹窗等：浅底色块 */
export const SUBJECT_TONE_CLASS: Record<ScheduleSubject['tone'], string> = {
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  sky: 'bg-sky-100 text-sky-800 border-sky-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  amber: 'bg-amber-100 text-amber-900 border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  lime: 'bg-lime-100 text-lime-800 border-lime-200'
};

/** 纸质课表格子：只用字色区分科目（今日摘要等轻量场景） */
export const SUBJECT_CELL_CLASS: Record<ScheduleSubject['tone'], string> = {
  rose: 'text-rose-800',
  sky: 'text-sky-800',
  indigo: 'text-indigo-800',
  amber: 'text-amber-900',
  emerald: 'text-emerald-800',
  orange: 'text-orange-800',
  violet: 'text-violet-800',
  pink: 'text-pink-800',
  teal: 'text-teal-800',
  cyan: 'text-cyan-800',
  slate: 'text-slate-600',
  lime: 'text-lime-800'
};

/** 海报风格子：柔和底色 + 字色，适合贴墙打印 */
export const SUBJECT_POSTER_CLASS: Record<ScheduleSubject['tone'], string> = {
  rose: 'bg-rose-100/90 text-rose-800 border-rose-200/80',
  sky: 'bg-sky-100/90 text-sky-800 border-sky-200/80',
  indigo: 'bg-indigo-100/90 text-indigo-800 border-indigo-200/80',
  amber: 'bg-amber-100/90 text-amber-900 border-amber-200/80',
  emerald: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/80',
  orange: 'bg-orange-100/90 text-orange-800 border-orange-200/80',
  violet: 'bg-violet-100/90 text-violet-800 border-violet-200/80',
  pink: 'bg-pink-100/90 text-pink-800 border-pink-200/80',
  teal: 'bg-teal-100/90 text-teal-800 border-teal-200/80',
  cyan: 'bg-cyan-100/90 text-cyan-800 border-cyan-200/80',
  slate: 'bg-slate-100/90 text-slate-600 border-slate-200/80',
  lime: 'bg-lime-100/90 text-lime-800 border-lime-200/80'
};

/** 今日课程色点 */
export const SUBJECT_DOT_CLASS: Record<ScheduleSubject['tone'], string> = {
  rose: 'bg-rose-400',
  sky: 'bg-sky-400',
  indigo: 'bg-indigo-400',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
  orange: 'bg-orange-400',
  violet: 'bg-violet-400',
  pink: 'bg-pink-400',
  teal: 'bg-teal-400',
  cyan: 'bg-cyan-400',
  slate: 'bg-slate-300',
  lime: 'bg-lime-500'
};

export function getSubjectById(id: SubjectId | string | undefined | null): ScheduleSubject {
  if (!id || id === 'empty') {
    return SCHEDULE_SUBJECTS.find((s) => s.id === 'empty')!;
  }
  const builtin = SCHEDULE_SUBJECTS.find((s) => s.id === id);
  if (builtin) return builtin;

  try {
    const store = useScheduleStore();
    if (store && store.customSubjects) {
      const custom = store.customSubjects.find((s) => s.id === id);
      if (custom) return custom;
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(LOCAL_CUSTOM_SUBJECTS_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const found = list.find((s: ScheduleSubject) => s.id === id);
          if (found) return found;
        }
      }
    }
  } catch {}

  return {
    id: String(id),
    name: String(id),
    shortName: String(id).slice(0, 4),
    emoji: '📘',
    tone: 'sky'
  };
}

/** JS getDay(): 0=周日 … 6=周六 → 课表 weekday；周末返回 null */
export function getTodayWeekdayId(date = new Date()): WeekdayId | null {
  const jsDay = date.getDay();
  if (jsDay === 0 || jsDay === 6) return null;
  return jsDay as WeekdayId;
}

function readLegacyLocalSchedule(): ChildScheduleData | null {
  try {
    const raw = localStorage.getItem(LOCAL_SCHEDULE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const src = parsed?.grid ? parsed : parsed;
    if (!src?.grid || typeof src.grid !== 'object') return null;
    return {
      grid: { ...createEmptyGrid(), ...src.grid },
      schoolName: typeof src.schoolName === 'string' ? src.schoolName : DEFAULT_SCHOOL_NAME,
      className: typeof src.className === 'string' ? src.className : DEFAULT_CLASS_NAME,
      studentName: typeof src.studentName === 'string' ? src.studentName : DEFAULT_STUDENT_NAME,
      version: typeof src.version === 'string' ? src.version : undefined
    };
  } catch {
    return null;
  }
}

export const useScheduleStore = defineStore('schedule', {
  state: () => {
    const official = createOfficialScheduleData();
    const initialRecords = readStoredVersionRecords();
    const currentRec = initialRecords.find((r) => r.isCurrent) || initialRecords[0];

    return {
      hasSchedule: readStoredHasSchedule() as boolean,
      grid: (currentRec ? { ...currentRec.grid } : official.grid) as ScheduleGrid,
      teachers: (currentRec?.teachers ? { ...currentRec.teachers } : {}) as Record<string, string>,
      periods: (currentRec?.periods && currentRec.periods.length > 0 ? JSON.parse(JSON.stringify(currentRec.periods)) : DEFAULT_SCHEDULE_PERIODS) as SchedulePeriod[],
      customSubjects: readStoredCustomSubjects() as ScheduleSubject[],
      versionRecords: initialRecords as ScheduleVersionRecord[],
      activeRecordId: (currentRec ? currentRec.id : "g1-term1-blank") as string,
      selectedDay: (getTodayWeekdayId() || 1) as WeekdayId,
      selectedPeriod: 1,
      schoolName: currentRec ? currentRec.schoolName : official.schoolName,
      className: currentRec ? currentRec.className : official.className,
      gradeYear: (currentRec ? currentRec.gradeYear : 'g1') as GradeYear,
      gradeLabel: (currentRec ? currentRec.gradeLabel : '一年级') as string,
      studentName: official.studentName || DEFAULT_STUDENT_NAME,
      version: official.version as string,
      hydratedProfileId: "" as string
    };
  },
  getters: {
    allSubjects(state): ScheduleSubject[] {
      return state.customSubjects;
    },
    knownTeachers(state): string[] {
      const set = new Set<string>();
      if (state.teachers) {
        Object.values(state.teachers).forEach((t) => {
          if (t && t.trim()) set.add(t.trim());
        });
      }
      if (state.customSubjects) {
        state.customSubjects.forEach((s) => {
          if (s.defaultTeacher && s.defaultTeacher.trim()) set.add(s.defaultTeacher.trim());
        });
      }
      return Array.from(set);
    },
    activeRecord(state): ScheduleVersionRecord {
      return state.versionRecords.find((r) => r.id === state.activeRecordId) || state.versionRecords[0];
    },
    currentExecutingRecord(state): ScheduleVersionRecord {
      return state.versionRecords.find((r) => r.isCurrent) || state.versionRecords[0];
    },
    cellTeacher(state) {
      return (day: WeekdayId, period: number): string => {
        const key = cellKey(day, period);
        return state.teachers?.[key] || '';
      };
    },
    cellSubject() {
      return (day: WeekdayId, period: number): ScheduleSubject => {
        const id = this.grid[cellKey(day, period)] || 'empty';
        return getSubjectById(id);
      };
    },
    todayCourses(): { period: SchedulePeriod; subject: ScheduleSubject; teacher: string }[] {
      return this.coursesForWeekday(getTodayWeekdayId());
    },
    /** 下一个有课的工作日课程（周五晚看周一） */
    nextSchoolDayCourses(): { weekdayId: WeekdayId; weekdayName: string; courses: { period: SchedulePeriod; subject: ScheduleSubject; teacher: string }[] } | null {
      const todayJs = new Date().getDay();
      for (let offset = 1; offset <= 7; offset += 1) {
        const jsDay = (todayJs + offset) % 7;
        if (jsDay === 0 || jsDay === 6) continue;
        const weekdayId = jsDay as WeekdayId;
        const courses = this.coursesForWeekday(weekdayId);
        if (courses.length === 0) continue;
        const weekdayName = WEEKDAYS.find((d) => d.id === weekdayId)?.name || '明天';
        return { weekdayId, weekdayName, courses };
      }
      return null;
    },
    coursesForWeekday() {
      return (weekday: WeekdayId | null): { period: SchedulePeriod; subject: ScheduleSubject; teacher: string }[] => {
        if (!weekday) return [];
        return SCHEDULE_PERIODS.map((period) => ({
          period,
          subject: getSubjectById(this.grid[cellKey(weekday, period.id)] || 'empty'),
          teacher: OFFICIAL_SCHEDULE_TEACHERS[cellKey(weekday, period.id)] || ''
        })).filter((row) => row.subject.id !== 'empty');
      };
    },
    filledCellCount(): number {
      return countFilledCells(this.grid);
    },
    displayStudentName(): string {
      const userStore = useUserStore();
      if (this.studentName) return this.studentName;
      if (userStore.hasProfile && userStore.currentProfile.nickname) {
        return userStore.currentProfile.nickname;
      }
      return DEFAULT_STUDENT_NAME;
    }
  },
  actions: {
        /** 用户主动创建专属课表（填写学校、年级、班级等） */
    createSchedule(params: {
      schoolName: string;
      className: string;
      gradeYear: GradeYear;
      gradeLabel: string;
      term: TermSemester;
      termLabel: string;
      studentName?: string;
      periods?: SchedulePeriod[];
    }) {
      const cleanDate = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      const periods = params.periods && params.periods.length > 0 ? params.periods : DEFAULT_SCHEDULE_PERIODS;
      this.schoolName = params.schoolName.trim();
      this.className = params.className.trim();
      this.gradeYear = params.gradeYear || "g1";
      this.gradeLabel = params.gradeLabel || "一年级";
      if (params.studentName) {
        this.studentName = params.studentName.trim();
      }
      this.periods = JSON.parse(JSON.stringify(periods));
      this.teachers = {};
      this.grid = createEmptyGrid(periods);

      const newId = `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newVersion: ScheduleVersionRecord = {
        id: newId,
        gradeYear: params.gradeYear,
        gradeLabel: params.gradeLabel,
        term: params.term,
        termLabel: params.termLabel,
        versionDate: cleanDate,
        title: `${this.gradeLabel} ${this.className}课表`,
        note: '',
        schoolName: this.schoolName,
        className: this.className,
        grid: { ...this.grid },
        teachers: {},
        periods: JSON.parse(JSON.stringify(periods)),
        isCurrent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.versionRecords && this.versionRecords.length > 0) {
        this.versionRecords.forEach(r => { r.isCurrent = false; });
        this.versionRecords.unshift(newVersion);
      } else {
        this.versionRecords = [newVersion];
      }

      this.activeRecordId = newVersion.id;
      this.hasSchedule = true;

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(LOCAL_HAS_SCHEDULE_KEY, 'true');
        }
      } catch (e) {}

      this.persistVersionRecords();
      this.persistToProfile();
    },

    /** 彻底清空并删除整张课表，回到全新未创建的空白引导状态 */
    deleteEntireSchedule() {
      this.hasSchedule = false;
      this.schoolName = '';
      this.className = '';
      this.studentName = '';
      this.grid = createEmptyGrid();
      this.teachers = {};
      this.periods = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE_PERIODS));
      this.versionRecords = [];
      this.activeRecordId = '';

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(LOCAL_HAS_SCHEDULE_KEY);
          localStorage.removeItem(LOCAL_SCHEDULE_VERSIONS_KEY);
          localStorage.removeItem(LOCAL_SCHEDULE_KEY);
        }
      } catch (e) {}

      const userStore = useUserStore();
      if (userStore.hasProfile) {
        userStore.currentProfile.schedule = undefined;
        userStore.touchSave();
      }
    },

    deleteScheduleRecord(recordId: string) {
      this.versionRecords = this.versionRecords.filter((r) => r.id !== recordId);
      if (this.versionRecords.length === 0) {
        this.deleteEntireSchedule();
        return;
      }
      const hasCurrent = this.versionRecords.some((r) => r.isCurrent);
      if (!hasCurrent) {
        this.versionRecords[0].isCurrent = true;
      }
      const nextActive = this.versionRecords.find((r) => r.isCurrent) || this.versionRecords[0];
      this.switchVersionRecord(nextActive.id);
      this.persistVersionRecords();
      this.persistToProfile();
    },

    addCustomSubject(params: {
      name: string;
      shortName?: string;
      emoji?: string;
      tone?: SubjectTone;
      defaultTeacher?: string;
    }): ScheduleSubject {
      const trimmed = params.name.trim();
      const existing = this.allSubjects.find((s) => s.name === trimmed);
      if (existing) {
        if (params.defaultTeacher && !existing.defaultTeacher) {
          existing.defaultTeacher = params.defaultTeacher.trim();
          this.persistCustomSubjects();
        }
        return existing;
      }

      const id = 'subj_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const tones: SubjectTone[] = ['sky', 'rose', 'indigo', 'emerald', 'amber', 'violet', 'teal', 'orange', 'cyan', 'lime'];
      const randomTone = tones[Math.floor(Math.random() * tones.length)];

      const newSubj: ScheduleSubject = {
        id,
        name: trimmed,
        shortName: params.shortName?.trim() || trimmed.slice(0, 4),
        emoji: params.emoji?.trim() || '📘',
        tone: params.tone || randomTone,
        defaultTeacher: params.defaultTeacher?.trim() || '',
        isCustom: true
      };

      this.customSubjects.push(newSubj);
      this.persistCustomSubjects();
      return newSubj;
    },

    deleteCustomSubject(subjectId: string) {
      this.customSubjects = this.customSubjects.filter((s) => s.id !== subjectId);
      this.persistCustomSubjects();
    },

    persistCustomSubjects() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(LOCAL_CUSTOM_SUBJECTS_KEY, JSON.stringify(this.customSubjects));
        }
      } catch (e) {
        console.error('Failed to persist custom subjects', e);
      }
    },

    /** 同时排定课程与任课教师 */
    setCellSchedule(day: WeekdayId, period: number, subjectId: string, teacherName?: string) {
      const key = cellKey(day, period);
      this.grid[key] = subjectId;
      if (teacherName !== undefined) {
        if (teacherName.trim()) this.teachers[key] = teacherName.trim();
        else delete this.teachers[key];
      }

      const rec = this.versionRecords.find((r) => r.id === this.activeRecordId);
      if (rec) {
        rec.grid[key] = subjectId;
        if (!rec.teachers) rec.teachers = {};
        if (teacherName !== undefined) {
          rec.teachers[key] = teacherName.trim();
        }
        rec.updatedAt = new Date().toISOString();
        this.persistVersionRecords();
      }

      this.persistToProfile();
    },

    /** 同步当前节次至活跃版本 */
    syncPeriodsToActiveRecord() {
      const rec = this.versionRecords.find((r) => r.id === this.activeRecordId);
      if (rec) {
        rec.periods = JSON.parse(JSON.stringify(this.periods));
        rec.updatedAt = new Date().toISOString();
        this.persistVersionRecords();
      }
      this.persistToProfile();
    },

    /** 添加自定义节次（如早读、第7节、晚自习） */
    addCustomPeriod(params: { label: string; time?: string; slotType: PeriodSlotType }): SchedulePeriod {
      // 计算唯一正整数 ID
      const maxId = this.periods.reduce((max, p) => Math.max(max, p.id), 0);
      const newId = maxId + 1;
      const afternoon = params.slotType === 'afternoon' || params.slotType === 'evening';

      const newPeriod: SchedulePeriod = {
        id: newId,
        label: params.label.trim(),
        time: params.time?.trim() || '',
        slotType: params.slotType,
        afternoon
      };

      this.periods.push(newPeriod);
      this.sortPeriods();
      this.syncPeriodsToActiveRecord();
      return newPeriod;
    },

    /** 排序节次：早读 -> 上午 -> 下午 -> 晚自习 */
    sortPeriods() {
      const slotOrder: Record<PeriodSlotType, number> = {
        morning_read: 1,
        morning: 2,
        afternoon: 3,
        evening: 4
      };
      this.periods.sort((a, b) => {
        const slotDiff = slotOrder[a.slotType] - slotOrder[b.slotType];
        if (slotDiff !== 0) return slotDiff;
        return a.id - b.id;
      });
    },

    /** 删除节次 */
    removePeriod(periodId: number) {
      if (this.periods.length <= 1) {
        return false;
      }
      this.periods = this.periods.filter((p) => p.id !== periodId);
      this.syncPeriodsToActiveRecord();
      return true;
    },

    /** 一键开启早读 / 晨读 */
    enableMorningRead(time = '07:45-08:15') {
      const exists = this.periods.some((p) => p.slotType === 'morning_read' || p.label.includes('早读') || p.label.includes('晨读'));
      if (exists) return;
      const minId = this.periods.reduce((min, p) => Math.min(min, p.id), 1);
      const id = minId > 10 ? 10 : Math.max(100, Date.now() % 1000);
      const newP: SchedulePeriod = {
        id,
        label: '早读',
        time,
        slotType: 'morning_read',
        afternoon: false
      };
      this.periods.unshift(newP);
      this.sortPeriods();
      this.syncPeriodsToActiveRecord();
    },

    /** 一键扩充为 8 节课（追加第7节、第8节） */
    enableEightPeriods() {
      const has7 = this.periods.some((p) => p.label.includes('7'));
      const has8 = this.periods.some((p) => p.label.includes('8'));
      if (!has7) {
        this.periods.push({
          id: 7,
          label: '第7节',
          time: '15:40-16:20',
          slotType: 'afternoon',
          afternoon: true
        });
      }
      if (!has8) {
        this.periods.push({
          id: 8,
          label: '第8节',
          time: '16:30-17:10',
          slotType: 'afternoon',
          afternoon: true
        });
      }
      this.sortPeriods();
      this.syncPeriodsToActiveRecord();
    },

    /** 一键开启晚自习 / 课后托管 */
    enableEveningStudy(time = '18:00-19:30') {
      const exists = this.periods.some((p) => p.slotType === 'evening' || p.label.includes('晚自习'));
      if (exists) return;
      const maxId = this.periods.reduce((max, p) => Math.max(max, p.id), 0);
      this.periods.push({
        id: maxId + 1,
        label: '晚自习',
        time,
        slotType: 'evening',
        afternoon: true
      });
      this.sortPeriods();
      this.syncPeriodsToActiveRecord();
    },

    /** 恢复标准 6 节课 */
    resetPeriodsToDefault() {
      this.periods = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE_PERIODS));
      this.syncPeriodsToActiveRecord();
    },

    persistVersionRecords() {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem(LOCAL_SCHEDULE_VERSIONS_KEY, JSON.stringify(this.versionRecords));
        }
      } catch (e) {
        console.error("Failed to save schedule versions", e);
      }
    },

    /** 切换查看或编辑的课表版本 */
    switchVersionRecord(recordId: string) {
      const target = this.versionRecords.find((r) => r.id === recordId);
      if (!target) return;
      this.activeRecordId = target.id;
      this.periods = target.periods && target.periods.length > 0 ? JSON.parse(JSON.stringify(target.periods)) : DEFAULT_SCHEDULE_PERIODS;
      this.grid = { ...createEmptyGrid(), ...target.grid };
      this.schoolName = target.schoolName || DEFAULT_SCHOOL_NAME;
      this.className = target.className || DEFAULT_CLASS_NAME;
      this.gradeYear = target.gradeYear || 'g1';
      this.gradeLabel = target.gradeLabel || '一年级';
    },

    /** 将某个版本设为当前正式执行版本 */
    setRecordAsCurrent(recordId: string) {
      this.versionRecords.forEach((r) => {
        r.isCurrent = r.id === recordId;
      });
      this.switchVersionRecord(recordId);
      this.persistVersionRecords();
      this.persistToProfile();
    },

    /** 保存为新版本（如新日期、新年级或新学期） */
    saveNewVersionRecord(params: {
      gradeYear: GradeYear;
      gradeLabel: string;
      term: TermSemester;
      termLabel: string;
      versionDate: string;
      title: string;
      note?: string;
      setAsCurrent?: boolean;
    }): ScheduleVersionRecord {
      const cleanDate = params.versionDate.trim() || new Date().toISOString().slice(0, 10).replace(/-/g, ".");
      const newId = params.gradeYear + "-" + params.term + "-" + cleanDate.replace(/./g, "") + "-" + Date.now().toString(36).slice(-4);
      const active = this.activeRecord;
      const currentTeachers = active && active.teachers ? { ...active.teachers } : { ...OFFICIAL_SCHEDULE_TEACHERS };

      if (params.setAsCurrent) {
        this.versionRecords.forEach((r) => {
          r.isCurrent = false;
        });
      }

      const newRecord: ScheduleVersionRecord = {
        id: newId,
        gradeYear: params.gradeYear,
        gradeLabel: params.gradeLabel,
        term: params.term,
        termLabel: params.termLabel,
        versionDate: cleanDate,
        title: params.title.trim() || (params.gradeLabel + params.termLabel + " " + cleanDate + "版"),
        note: params.note ? params.note.trim() : "",
        schoolName: this.schoolName,
        className: this.className,
        grid: { ...this.grid },
        teachers: currentTeachers,
        isCurrent: Boolean(params.setAsCurrent),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.versionRecords.unshift(newRecord);
      this.activeRecordId = newRecord.id;
      this.persistVersionRecords();
      if (params.setAsCurrent) {
        this.persistToProfile();
      }
      return newRecord;
    },

    /** 修改当前版本的基本信息 */
    updateActiveRecordMeta(params: {
      title?: string;
      note?: string;
      versionDate?: string;
    }) {
      const rec = this.versionRecords.find((r) => r.id === this.activeRecordId);
      if (!rec) return;
      if (params.title !== undefined) rec.title = params.title.trim();
      if (params.note !== undefined) rec.note = params.note.trim();
      if (params.versionDate !== undefined) rec.versionDate = params.versionDate.trim();
      rec.updatedAt = new Date().toISOString();
      this.persistVersionRecords();
    },

    /** 修改当前版本的某节课老师 */
    updateCellTeacher(day: WeekdayId, period: number, teacherName: string) {
      const rec = this.versionRecords.find((r) => r.id === this.activeRecordId);
      if (!rec) return;
      if (!rec.teachers) rec.teachers = {};
      rec.teachers[cellKey(day, period)] = teacherName.trim();
      rec.updatedAt = new Date().toISOString();
      this.persistVersionRecords();
    },

    /** 删除历史课表版本（当前执行中不允许删除） */
    deleteVersionRecord(recordId: string): boolean {
      const target = this.versionRecords.find((r) => r.id === recordId);
      if (!target || target.isCurrent) return false;
      this.versionRecords = this.versionRecords.filter((r) => r.id !== recordId);
      if (this.activeRecordId === recordId) {
        const fallback = this.versionRecords.find((r) => r.isCurrent) || this.versionRecords[0];
        if (fallback) {
          this.switchVersionRecord(fallback.id);
        }
      }
      this.persistVersionRecords();
      return true;
    },

    /** 从当前学员档案拉取课表；版本过旧则覆盖为官方课表 */
    hydrateFromProfile() {
      const userStore = useUserStore();

      // 检测新版本重置标记，清除旧系统残留脏数据
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const OVERHAUL_KEY = 'yinuo_schedule_overhaul_v3_clean';
          if (!localStorage.getItem(OVERHAUL_KEY)) {
            localStorage.setItem(OVERHAUL_KEY, 'true');
            this.deleteEntireSchedule();
            return;
          }
        }
      } catch (e) {}

      if (!userStore.hasProfile) {
        this.hydratedProfileId = '';
        const legacy = readLegacyLocalSchedule();
        if (legacy && legacy.hasSchedule) {
          this.applyScheduleData(legacy);
          return;
        }
        this.hasSchedule = false;
        return;
      }

      const profile = userStore.currentProfile;
      const existing = profile.schedule;
      if (existing && existing.hasSchedule && existing.grid) {
        this.applyScheduleData(cloneScheduleData(existing as ChildScheduleData));
        this.hydratedProfileId = profile.id;
        return;
      }

      this.hasSchedule = false;
      this.hydratedProfileId = profile.id;
    },

    applyScheduleData(data: ChildScheduleData) {
      this.grid = { ...createEmptyGrid(), ...data.grid };
      this.schoolName = data.schoolName || DEFAULT_SCHOOL_NAME;
      this.className = data.className || DEFAULT_CLASS_NAME;
      this.studentName = data.studentName || DEFAULT_STUDENT_NAME;
      this.version = data.version || '';
      this.teachers = data.teachers ? { ...data.teachers } : {};
      if (data.gradeYear) this.gradeYear = data.gradeYear;
      if (data.gradeLabel) this.gradeLabel = data.gradeLabel;
      if (data.hasSchedule !== undefined) { this.hasSchedule = Boolean(data.hasSchedule); } else if (data.grid && Object.keys(data.grid).length > 0) { this.hasSchedule = true; }

      if (Array.isArray(data.versionRecords) && data.versionRecords.length > 0) {
        this.versionRecords = JSON.parse(JSON.stringify(data.versionRecords));
        this.persistVersionRecords();
      }
      if (Array.isArray(data.customSubjects) && data.customSubjects.length > 0) {
        this.customSubjects = JSON.parse(JSON.stringify(data.customSubjects));
        this.persistCustomSubjects();
      }
      if (data.periods && Array.isArray(data.periods) && data.periods.length > 0) {
        this.periods = JSON.parse(JSON.stringify(data.periods));
      }
      if (data.activeRecordId) {
        this.activeRecordId = data.activeRecordId;
      }
    },

    persistToProfile() {
      const snapshot: ChildScheduleData = {
        hasSchedule: this.hasSchedule,
        grid: { ...this.grid },
        schoolName: this.schoolName,
        className: this.className,
        studentName: this.studentName,
        teachers: { ...this.teachers },
        gradeYear: this.gradeYear,
        gradeLabel: this.gradeLabel,
        version: this.version || OFFICIAL_SCHEDULE_VERSION,
        periods: this.periods ? JSON.parse(JSON.stringify(this.periods)) : undefined,
        versionRecords: this.versionRecords ? JSON.parse(JSON.stringify(this.versionRecords)) : undefined,
        customSubjects: this.customSubjects ? JSON.parse(JSON.stringify(this.customSubjects)) : undefined,
        activeRecordId: this.activeRecordId
      };

      try {
        localStorage.setItem(LOCAL_SCHEDULE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore quota
      }

      const userStore = useUserStore();
      if (!userStore.hasProfile) return;

      userStore.currentProfile.schedule = snapshot;
      userStore.touchSave();
    },

    selectCell(day: WeekdayId, period: number) {
      this.selectedDay = day;
      this.selectedPeriod = period;
    },
    setCell(day: WeekdayId, period: number, subjectId: SubjectId) {
      this.grid[cellKey(day, period)] = subjectId;
      const rec = this.versionRecords.find((r) => r.id === this.activeRecordId);
      if (rec) {
        rec.grid[cellKey(day, period)] = subjectId;
        rec.updatedAt = new Date().toISOString();
        this.persistVersionRecords();
      }
      this.persistToProfile();
    },
    setSelectedCellSubject(subjectId: SubjectId) {
      this.setCell(this.selectedDay, this.selectedPeriod, subjectId);
    },
    /** 恢复京西校区官方课表 */
    fillSample() {
      const official = createOfficialScheduleData();
      this.applyScheduleData(official);
      this.persistToProfile();
    },
    clearAll() {
      this.grid = createEmptyGrid();
      this.versionRecords = createInitialVersionRecords();
      this.activeRecordId = this.versionRecords[0].id;
      this.version = OFFICIAL_SCHEDULE_VERSION;
      this.persistVersionRecords();
      this.persistToProfile();
    },
    updateMeta(partial: {
      schoolName?: string;
      className?: string;
      gradeYear?: GradeYear;
      gradeLabel?: string;
      studentName?: string;
    }) {
      if (partial.schoolName !== undefined) this.schoolName = partial.schoolName;
      if (partial.className !== undefined) this.className = partial.className;
      if (partial.gradeYear !== undefined) this.gradeYear = partial.gradeYear;
      if (partial.gradeLabel !== undefined) this.gradeLabel = partial.gradeLabel;
      if (partial.studentName !== undefined) this.studentName = partial.studentName;

      if (this.versionRecords.length > 0) {
        const active = this.activeRecord || this.versionRecords[0];
        if (active) {
          if (partial.schoolName !== undefined) active.schoolName = partial.schoolName;
          if (partial.className !== undefined) active.className = partial.className;
          if (partial.gradeYear !== undefined) active.gradeYear = partial.gradeYear;
          if (partial.gradeLabel !== undefined) active.gradeLabel = partial.gradeLabel;
          active.updatedAt = new Date().toISOString();
        }
        this.persistVersionRecords();
      }
      this.persistToProfile();
    }
  }
});
