/** 课程表皮肤 = 完全不同的 UI 表现形式（布局/材质/构图），不是调色板 */

export type ScheduleSkinId =
  | 'poster'
  | 'classic'
  | 'day-cards'
  | 'split'
  | 'sticky'
  | 'chalkboard'
  | 'scrapbook'
  | 'timeline'
  | 'bento'
  | 'bricks';

export interface ScheduleSkin {
  id: ScheduleSkinId;
  name: string;
  /** 一句话说明「长什么样」 */
  tagline: string;
  /** 选择器上的形态标签 */
  formLabel: string;
  /** 选择器预览色点（只作点缀，不代表皮肤本质） */
  swatches: [string, string, string];
  /** 导出 PNG 底色 */
  exportBgHex: string;
  pageBg: string;
}

export const SCHEDULE_SKINS: ScheduleSkin[] = [
  {
    id: 'poster',
    name: '暖纸海报',
    tagline: '圆角色块表格 · 上午下午侧栏',
    formLabel: '色块表',
    swatches: ['#FFF8EE', '#FDE68A', '#7DD3FC'],
    exportBgHex: '#FFF8EE',
    pageBg: 'bg-[#F4F1EA]'
  },
  {
    id: 'classic',
    name: '学校纸表',
    tagline: '密线格子 · 像教务处发的纸',
    formLabel: '密线格',
    swatches: ['#FFFFFF', '#111827', '#DC2626'],
    exportBgHex: '#FFFFFF',
    pageBg: 'bg-[#F3F4F6]'
  },
  {
    id: 'day-cards',
    name: '五日分栏',
    tagline: '周一到周五各一张竖卡',
    formLabel: '分日卡',
    swatches: ['#EFF6FF', '#BFDBFE', '#1D4ED8'],
    exportBgHex: '#F8FAFC',
    pageBg: 'bg-[#EEF2FF]'
  },
  {
    id: 'split',
    name: '上下分板',
    tagline: '上午一块板 · 下午一块板',
    formLabel: '分板',
    swatches: ['#FEF3C7', '#BAE6FD', '#0F766E'],
    exportBgHex: '#FFFBEB',
    pageBg: 'bg-[#F8F4E8]'
  },
  {
    id: 'sticky',
    name: '便签贴墙',
    tagline: '软木板 + 微微歪的便利贴',
    formLabel: '便签',
    swatches: ['#D6B89A', '#FEF08A', '#FDA4AF'],
    exportBgHex: '#E8D5B5',
    pageBg: 'bg-[#E7D3B0]'
  },
  {
    id: 'chalkboard',
    name: '粉笔黑板',
    tagline: '深绿黑板 · 粉笔字课表',
    formLabel: '黑板',
    swatches: ['#14532D', '#86EFAC', '#FDE68A'],
    exportBgHex: '#14532D',
    pageBg: 'bg-[#0F172A]'
  },
  {
    id: 'scrapbook',
    name: '手账贴纸',
    tagline: '胶带装饰 · 粉蓝双色 · 科目带 emoji',
    formLabel: '手账',
    swatches: ['#FCE7F3', '#F9A8D4', '#7DD3FC'],
    exportBgHex: '#FFF5FB',
    pageBg: 'bg-gradient-to-br from-pink-100 via-rose-50 to-sky-100'
  },
  {
    id: 'timeline',
    name: '一日轴线',
    tagline: '竖轴节点 · 每天一条线',
    formLabel: '轴线',
    swatches: ['#F1F5F9', '#38BDF8', '#6366F1'],
    exportBgHex: '#F8FAFC',
    pageBg: 'bg-[#F1F5F9]'
  },
  {
    id: 'bento',
    name: '杂志便当格',
    tagline: '大小不一的杂志拼贴构图',
    formLabel: '拼贴',
    swatches: ['#FAFAF9', '#F97316', '#0EA5E9'],
    exportBgHex: '#FAFAF9',
    pageBg: 'bg-[#F5F5F4]'
  },
  {
    id: 'bricks',
    name: '卡通积木',
    tagline: '粗描边硬阴影 · 乐高块感',
    formLabel: '积木',
    swatches: ['#FEF3C7', '#FB7185', '#38BDF8'],
    exportBgHex: '#FEF9C3',
    pageBg: 'bg-[#FEF3C7]'
  }
];

const SKIN_STORAGE_KEY = 'yinuo_go_schedule_skin_v2';
const SCRAPBOOK_SPLIT_KEY = 'yinuo_go_schedule_scrapbook_split';

/** 手账贴纸：粉蓝怎么分 */
export type ScrapbookColorSplit = 'am-pm' | 'week-split' | 'page-split' | 'diagonal';

export const SCRAPBOOK_COLOR_SPLITS: {
  id: ScrapbookColorSplit;
  name: string;
  tagline: string;
}[] = [
  { id: 'am-pm', name: '上下渐变', tagline: '从上到下：粉慢慢变蓝' },
  { id: 'week-split', name: '按天渐变', tagline: '周一到周五：粉慢慢变蓝' },
  { id: 'page-split', name: '左右渐变', tagline: '从左到右：粉慢慢变蓝' },
  { id: 'diagonal', name: '斜向渐变', tagline: '左上粉 · 右下蓝，斜着过渡' }
];

export const DEFAULT_SCHEDULE_SKIN_ID: ScheduleSkinId = 'scrapbook';
export const DEFAULT_SCRAPBOOK_SPLIT: ScrapbookColorSplit = 'am-pm';

export function getScheduleSkin(id: ScheduleSkinId | string | null | undefined): ScheduleSkin {
  return SCHEDULE_SKINS.find((s) => s.id === id) || SCHEDULE_SKINS[0];
}

export function readStoredScheduleSkinId(): ScheduleSkinId {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULE_SKIN_ID;
  try {
    const raw = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (raw && SCHEDULE_SKINS.some((s) => s.id === raw)) return raw as ScheduleSkinId;
  } catch {
    /* ignore */
  }
  return DEFAULT_SCHEDULE_SKIN_ID;
}

export function storeScheduleSkinId(id: ScheduleSkinId) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SKIN_STORAGE_KEY, id);
  } catch (err) {
    console.warn('storeScheduleSkinId', err);
  }
}

export function readStoredScrapbookSplit(): ScrapbookColorSplit {
  if (typeof window === 'undefined') return DEFAULT_SCRAPBOOK_SPLIT;
  try {
    const raw = window.localStorage.getItem(SCRAPBOOK_SPLIT_KEY);
    if (raw && SCRAPBOOK_COLOR_SPLITS.some((s) => s.id === raw)) {
      return raw as ScrapbookColorSplit;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SCRAPBOOK_SPLIT;
}

export function storeScrapbookSplit(id: ScrapbookColorSplit) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SCRAPBOOK_SPLIT_KEY, id);
  } catch (err) {
    console.warn('storeScrapbookSplit', err);
  }
}
