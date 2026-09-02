import type { ScheduleSubject, SubjectId } from '../../stores/useScheduleStore';

export interface HomeworkHint {
  id: string;
  title: string;
  detail: string;
  emoji: string;
}

const SUBJECT_HOMEWORK: Partial<Record<SubjectId, Omit<HomeworkHint, 'id'>>> = {
  yuwen1: { title: '语文：读一遍课文', detail: '读给家人听也行，顺口即可。', emoji: '📖' },
  yuwen2: { title: '语文：写今天学的字', detail: '每个字写 2～3 遍，写完自己认一遍。', emoji: '✏️' },
  shuxue: { title: '数学：口算 5 题', detail: '不追求难题，算对、字迹清楚就行。', emoji: '🔢' },
  quweishuxue: { title: '趣味数学：想一题好玩的', detail: '用今天学的点，编一道小问题给爸妈。', emoji: '🧩' },
  yingyu: { title: '英语：跟读 3 个词', detail: '跟录音或家长读，听清再开口。', emoji: '🔤' },
  quweiyingyu: { title: '趣味英语：说一句今天学的', detail: '对着镜子说一遍也算完成。', emoji: '🗣️' },
  kexue: { title: '科学：说一个新发现', detail: '今天课上最有趣的一点，讲给家人听。', emoji: '🔬' },
  gushi: { title: '古诗：背一句给家人听', detail: '会背一句就算，不强求全首。', emoji: '📜' },
  meishu1: { title: '美术：收好作品', detail: '把画放进书包夹层，别折坏。', emoji: '🎨' },
  laodong: { title: '劳动：做一件家务小事', detail: '收碗、摆鞋、浇花，任选一件。', emoji: '🌱' }
};

/** 按今日课程推导作业收口清单（最多 4 条，避免堆满） */
export function buildHomeworkHints(courses: { subject: ScheduleSubject }[]): HomeworkHint[] {
  const seen = new Set<string>();
  const hints: HomeworkHint[] = [];

  for (const row of courses) {
    const template = SUBJECT_HOMEWORK[row.subject.id];
    if (!template) continue;
    const id = row.subject.id;
    if (seen.has(id)) continue;
    seen.add(id);
    hints.push({ id, ...template });
    if (hints.length >= 4) break;
  }

  if (hints.length === 0) {
    hints.push({
      id: 'rest',
      title: '今天没有硬作业',
      detail: '可以读 10 分钟喜欢的书，或早点休息。',
      emoji: '🌙'
    });
  }

  return hints;
}
