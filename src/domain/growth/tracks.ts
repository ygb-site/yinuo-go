import { isGradeLevel, type GradeLevel } from '../../types/curriculum';

/** 当前在读 / 老家对齐用的城市轨道 */
export type EducationTrackId = 'beijing' | 'hengshui';

/** 预计回老家上学的时间窗口 */
export type ReturnWindowId = 'g1_end' | 'g2_g3' | 'g4_g6' | 'unsure';

/** current = 跟当前学校；hometown = 已切到老家学校 */
export type TrackRole = 'current' | 'hometown';

export const EDUCATION_TRACK_IDS: EducationTrackId[] = ['beijing', 'hengshui'];
export const RETURN_WINDOW_IDS: ReturnWindowId[] = ['g1_end', 'g2_g3', 'g4_g6', 'unsure'];
export const TRACK_ROLE_IDS: TrackRole[] = ['current', 'hometown'];

export const DEFAULT_SCHOOL_TRACK: EducationTrackId = 'beijing';
export const DEFAULT_HOMETOWN_TRACK: EducationTrackId = 'hengshui';
export const DEFAULT_RETURN_WINDOW: ReturnWindowId = 'g4_g6';
export const DEFAULT_TRACK_ROLE: TrackRole = 'current';

export const EDUCATION_TRACK_OPTIONS: { id: EducationTrackId; label: string; hint: string }[] = [
  { id: 'beijing', label: '北京', hint: '跟当前在读学校（人大附小京西）' },
  { id: 'hengshui', label: '衡水', hint: '跟老家学校进度对齐' }
];

export const RETURN_WINDOW_OPTIONS: { id: ReturnWindowId; label: string; hint: string }[] = [
  { id: 'g1_end', label: '一年级结束或二年级', hint: '保底会更紧，一年级就要盯熟练度' },
  { id: 'g2_g3', label: '二、三年级', hint: '中段回老家，三年级开始收紧对照' },
  { id: 'g4_g6', label: '四到六年级', hint: '北京这几年先存关系、好奇心和习惯' },
  { id: 'unsure', label: '还不确定', hint: '按随时可能回处理，只补习惯不并行练习册' }
];

export const TRACK_ROLE_OPTIONS: { id: TrackRole; label: string }[] = [
  { id: 'current', label: '仍在北京上学（学校轴 = 北京）' },
  { id: 'hometown', label: '已回衡水上学（学校轴切到衡水）' }
];

export interface GrowthTrackFields {
  schoolTrack: EducationTrackId;
  hometownTrack: EducationTrackId;
  returnWindow: ReturnWindowId;
  trackRole: TrackRole;
}

export const TOGETHER_ITEM_IDS = ['go', 'read', 'outdoor', 'chore'] as const;
export type TogetherItemId = (typeof TOGETHER_ITEM_IDS)[number];

export const TOGETHER_ITEMS: { id: TogetherItemId; title: string; detail: string; route?: string }[] = [
  { id: 'go', title: '亲子下一盘棋', detail: '面对面对弈一盘，不打分，下完即可。', route: '/two-player' },
  { id: 'read', title: '共读 10 分钟', detail: '你读他听也可以，插嘴是好现象。' },
  { id: 'outdoor', title: '一次户外观察', detail: '公园、阳台或回家路上，只盯住一件真东西。' },
  { id: 'chore', title: '一件他能负责的家务', detail: '装书包、收碗、浇花。做完算数，不追求完美。' }
];

export interface TogetherWeekState {
  weekKey: string;
  done: Record<TogetherItemId, boolean>;
}

export function isEducationTrackId(value: unknown): value is EducationTrackId {
  return value === 'beijing' || value === 'hengshui';
}

export function isReturnWindowId(value: unknown): value is ReturnWindowId {
  return value === 'g1_end' || value === 'g2_g3' || value === 'g4_g6' || value === 'unsure';
}

export function isTrackRole(value: unknown): value is TrackRole {
  return value === 'current' || value === 'hometown';
}

export function resolveGrowthTracks(input?: Partial<GrowthTrackFields> | null): GrowthTrackFields {
  return {
    schoolTrack: isEducationTrackId(input?.schoolTrack) ? input.schoolTrack : DEFAULT_SCHOOL_TRACK,
    hometownTrack: isEducationTrackId(input?.hometownTrack) ? input.hometownTrack : DEFAULT_HOMETOWN_TRACK,
    returnWindow: isReturnWindowId(input?.returnWindow) ? input.returnWindow : DEFAULT_RETURN_WINDOW,
    trackRole: isTrackRole(input?.trackRole) ? input.trackRole : DEFAULT_TRACK_ROLE
  };
}

export function resolveGradeLevel(value: unknown, fallback: GradeLevel = 'g1_t1'): GradeLevel {
  return isGradeLevel(value) ? value : fallback;
}

/** 本周一起做：完成不算能力分，只给家长看见「这周做过」 */
export function emptyTogetherDone(): Record<TogetherItemId, boolean> {
  return {
    go: false,
    read: false,
    outdoor: false,
    chore: false
  };
}

export function currentTogetherWeekKey(now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function resolveTogetherWeek(input?: Partial<TogetherWeekState> | null, now = new Date()): TogetherWeekState {
  const weekKey = currentTogetherWeekKey(now);
  if (!input || input.weekKey !== weekKey) {
    return { weekKey, done: emptyTogetherDone() };
  }
  const done = emptyTogetherDone();
  for (const id of TOGETHER_ITEM_IDS) {
    done[id] = Boolean(input.done?.[id]);
  }
  return { weekKey, done };
}

export function activeSchoolTrack(tracks: GrowthTrackFields): EducationTrackId {
  return tracks.trackRole === 'hometown' ? tracks.hometownTrack : tracks.schoolTrack;
}

/**
 * 收紧窗口：家长端开始看同龄熟练度对照。
 * 与「儿童端是否出现影子轻练」分开——轻练从一年级就有。
 */
export function hometownShadowIsTight(tracks: GrowthTrackFields, gradeLevel?: GradeLevel): boolean {
  if (tracks.returnWindow === 'g1_end') return true;
  const year = Number(String(gradeLevel || 'g1_t1').slice(1, 2));
  if (tracks.returnWindow === 'g2_g3') return year >= 3;
  return year >= 4;
}

/**
 * 一年级起儿童端每天可出现一道衡水影子轻练（口算/识字量级）。
 * 老家轴或学校轴任一是衡水即开启；不是预习包，不堆第二套作业。
 */
export function hometownShadowLiteEnabled(tracks: GrowthTrackFields): boolean {
  return tracks.hometownTrack === 'hengshui' || tracks.schoolTrack === 'hengshui';
}
