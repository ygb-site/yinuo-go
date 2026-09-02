import { defineStore } from 'pinia';
import { useUserStore } from './useUserStore';

/** 周一到周五 */
export type WeekdayId = 1 | 2 | 3 | 4 | 5;

/** 京西校区一年级科目 */
export type SubjectId =
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

export interface ScheduleSubject {
  id: SubjectId;
  name: string;
  shortName: string;
  emoji: string;
  tone: 'rose' | 'sky' | 'indigo' | 'amber' | 'emerald' | 'orange' | 'violet' | 'pink' | 'teal' | 'cyan' | 'slate' | 'lime';
}

export interface SchedulePeriod {
  id: number;
  label: string;
  time: string;
  afternoon?: boolean;
}

/** 挂在学员档案上、跟云端一起同步的课表数据 */
export interface ChildScheduleData {
  grid: ScheduleGrid;
  schoolName: string;
  className: string;
  studentName?: string;
  /** 官方课表版本；变更时自动覆盖为最新官方表 */
  version?: string;
}

export const WEEKDAYS: { id: WeekdayId; name: string; shortName: string }[] = [
  { id: 1, name: '周一', shortName: '一' },
  { id: 2, name: '周二', shortName: '二' },
  { id: 3, name: '周三', shortName: '三' },
  { id: 4, name: '周四', shortName: '四' },
  { id: 5, name: '周五', shortName: '五' }
];

export const SCHEDULE_PERIODS: SchedulePeriod[] = [
  { id: 1, label: '第1节', time: '08:00' },
  { id: 2, label: '第2节', time: '08:50' },
  { id: 3, label: '第3节', time: '09:50' },
  { id: 4, label: '第4节', time: '10:40' },
  { id: 5, label: '第5节', time: '14:00', afternoon: true },
  { id: 6, label: '第6节', time: '14:50', afternoon: true }
];

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
export const OFFICIAL_SCHEDULE_VERSION = 'jw-1.1-2627-v1';

const DEFAULT_SCHOOL_NAME = '中国人民大学附属小学京西分校';
const DEFAULT_CLASS_NAME = '1.1班';
const DEFAULT_STUDENT_NAME = '杨一诺';
const LOCAL_SCHEDULE_KEY = 'yinuo_go_schedule_store';

function cellKey(day: WeekdayId, period: number): string {
  return `${day}-${period}`;
}

export function createEmptyGrid(): ScheduleGrid {
  const grid: ScheduleGrid = {};
  for (const day of WEEKDAYS) {
    for (const period of SCHEDULE_PERIODS) {
      grid[cellKey(day.id, period.id)] = 'empty';
    }
  }
  return grid;
}

/** 京西校区 26-27 学年 · 一年级 1.1 班官方课表 */
export function createOfficialGrid(): ScheduleGrid {
  const g = createEmptyGrid();
  const put = (day: WeekdayId, period: number, subject: SubjectId) => {
    g[cellKey(day, period)] = subject;
  };

  // 周一
  put(1, 1, 'bandui');
  put(1, 2, 'shuxue');
  put(1, 3, 'yuwen2');
  put(1, 4, 'daofa');
  put(1, 5, 'tiyu');
  put(1, 6, 'xinli');
  // 周二
  put(2, 1, 'yuwen1');
  put(2, 2, 'shuxue');
  put(2, 3, 'quweishuxue');
  put(2, 4, 'yinyue');
  put(2, 5, 'yuwen1');
  put(2, 6, 'tiyu');
  // 周三
  put(3, 1, 'shuxue');
  put(3, 2, 'yuwen1');
  put(3, 3, 'kexue');
  put(3, 4, 'tiyu');
  put(3, 5, 'meishu1');
  put(3, 6, 'meishu1');
  // 周四
  put(4, 1, 'yuwen1');
  put(4, 2, 'yingyu');
  put(4, 3, 'laodong');
  put(4, 4, 'gushi');
  put(4, 5, 'yinyue');
  put(4, 6, 'tiyu');
  // 周五
  put(5, 1, 'shuxue');
  put(5, 2, 'yuwen1');
  put(5, 3, 'zonghe');
  put(5, 4, 'tiyu');
  put(5, 5, 'quweiyingyu');
  put(5, 6, 'yuwen1');

  return g;
}

export function createOfficialScheduleData(): ChildScheduleData {
  return {
    grid: createOfficialGrid(),
    schoolName: DEFAULT_SCHOOL_NAME,
    className: DEFAULT_CLASS_NAME,
    studentName: DEFAULT_STUDENT_NAME,
    version: OFFICIAL_SCHEDULE_VERSION
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
    version: data.version
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

/** 纸质课表格子：只用字色区分科目 */
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
  return (
    SCHEDULE_SUBJECTS.find((s) => s.id === id) ||
    SCHEDULE_SUBJECTS.find((s) => s.id === 'empty')!
  );
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
    return {
      grid: official.grid as ScheduleGrid,
      selectedDay: (getTodayWeekdayId() || 1) as WeekdayId,
      selectedPeriod: 1,
      schoolName: official.schoolName,
      className: official.className,
      studentName: official.studentName || DEFAULT_STUDENT_NAME,
      version: official.version as string,
      hydratedProfileId: '' as string
    };
  },
  getters: {
    cellSubject() {
      return (day: WeekdayId, period: number): ScheduleSubject => {
        const id = this.grid[cellKey(day, period)] || 'empty';
        return getSubjectById(id);
      };
    },
    todayCourses(): { period: SchedulePeriod; subject: ScheduleSubject }[] {
      return this.coursesForWeekday(getTodayWeekdayId());
    },
    /** 下一个有课的工作日课程（周五晚看周一） */
    nextSchoolDayCourses(): { weekdayId: WeekdayId; weekdayName: string; courses: { period: SchedulePeriod; subject: ScheduleSubject }[] } | null {
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
      return (weekday: WeekdayId | null): { period: SchedulePeriod; subject: ScheduleSubject }[] => {
        if (!weekday) return [];
        return SCHEDULE_PERIODS.map((period) => ({
          period,
          subject: getSubjectById(this.grid[cellKey(weekday, period.id)] || 'empty')
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
    /** 从当前学员档案拉取课表；版本过旧则覆盖为官方课表 */
    hydrateFromProfile() {
      const userStore = useUserStore();
      const official = createOfficialScheduleData();

      if (!userStore.hasProfile) {
        this.hydratedProfileId = '';
        const legacy = readLegacyLocalSchedule();
        if (legacy?.version === OFFICIAL_SCHEDULE_VERSION) {
          this.applyScheduleData(legacy);
          return;
        }
        this.applyScheduleData(official);
        try {
          localStorage.setItem(LOCAL_SCHEDULE_KEY, JSON.stringify(official));
        } catch {
          // ignore
        }
        return;
      }

      const profile = userStore.currentProfile;
      const existing = profile.schedule;
      if (existing?.grid && existing.version === OFFICIAL_SCHEDULE_VERSION) {
        this.applyScheduleData(cloneScheduleData(existing as ChildScheduleData));
        this.hydratedProfileId = profile.id;
        return;
      }

      // 无课表或旧版本：写入官方课表并上云
      profile.schedule = official;
      this.applyScheduleData(official);
      this.hydratedProfileId = profile.id;
      userStore.touchSave();
    },

    applyScheduleData(data: ChildScheduleData) {
      this.grid = { ...createEmptyGrid(), ...data.grid };
      this.schoolName = data.schoolName || DEFAULT_SCHOOL_NAME;
      this.className = data.className || DEFAULT_CLASS_NAME;
      this.studentName = data.studentName || DEFAULT_STUDENT_NAME;
      this.version = data.version || '';
    },

    persistToProfile() {
      const snapshot: ChildScheduleData = {
        grid: { ...this.grid },
        schoolName: this.schoolName,
        className: this.className,
        studentName: this.studentName,
        version: this.version || OFFICIAL_SCHEDULE_VERSION
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
      this.version = OFFICIAL_SCHEDULE_VERSION;
      this.persistToProfile();
    },
    updateMeta(partial: Partial<Pick<ChildScheduleData, 'schoolName' | 'className' | 'studentName'>>) {
      if (partial.schoolName !== undefined) this.schoolName = partial.schoolName;
      if (partial.className !== undefined) this.className = partial.className;
      if (partial.studentName !== undefined) this.studentName = partial.studentName;
      this.persistToProfile();
    }
  }
});
