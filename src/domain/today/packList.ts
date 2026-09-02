import type { ScheduleSubject, SubjectId } from '../../stores/useScheduleStore';

/** 按科目推导「书包要带什么」；一年级实用清单，不是教科书全套 */
const SUBJECT_PACK_ITEMS: Partial<Record<SubjectId, string[]>> = {
  yuwen1: ['语文书', '田字格本'],
  yuwen2: ['语文书', '田字格本'],
  shuxue: ['数学书', '口算本'],
  quweishuxue: ['数学书'],
  yingyu: ['英语书'],
  quweiyingyu: ['英语书'],
  kexue: ['科学书'],
  daofa: ['道德与法治书'],
  yinyue: ['音乐书'],
  meishu1: ['美术书', '水彩笔', '图画本'],
  tiyu: ['运动鞋', '水壶'],
  laodong: ['劳动课用品（如有布置）'],
  gushi: ['古诗本或语文书'],
  zonghe: ['综合实践材料（如有布置）'],
  bandui: [],
  xinli: [],
  empty: []
};

const WEEKDAY_BASE_ITEMS = ['文具盒', '水杯', '红领巾'];

export interface PackItem {
  id: string;
  label: string;
  /** 来自哪门课；基础项为空 */
  fromSubject?: string;
}

/** 根据当天课程去重生成带物清单 */
export function buildPackList(courses: { subject: ScheduleSubject }[]): PackItem[] {
  const seen = new Set<string>();
  const items: PackItem[] = [];

  const push = (label: string, fromSubject?: string) => {
    if (!label || seen.has(label)) return;
    seen.add(label);
    items.push({
      id: label,
      label,
      fromSubject
    });
  };

  for (const base of WEEKDAY_BASE_ITEMS) {
    push(base);
  }

  for (const row of courses) {
    const extras = SUBJECT_PACK_ITEMS[row.subject.id] || [];
    for (const label of extras) {
      push(label, row.subject.name);
    }
  }

  return items;
}

/** 出门前一句话：点出最特别的带物 */
export function packHighlight(items: PackItem[]): string {
  const special = items.find((item) => item.fromSubject && !WEEKDAY_BASE_ITEMS.includes(item.label));
  if (!special) return '文具盒、水杯、红领巾带齐就出发。';
  return `今天有${special.fromSubject}，别忘了带「${special.label}」。`;
}
