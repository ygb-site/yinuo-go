import type { SchoolTutorDualOutput } from './types';

const ANSWER_PATTERNS = [
  /正确答案[是为：:]/i,
  /标准答案/i,
  /答案是/,
  /选\s*[ABCD甲乙丙丁]/i,
  /等于\s*\d+\s*$/
];

const CHILD_FALLBACK = '先自己看一看、想一想。卡住了就告诉家人你看到了什么。';
const PARENT_FALLBACK = '陪着看过程，不要直接报答案。时间不够就收工睡觉。';

export function looksLikeStandardAnswer(text: string): boolean {
  if (!text) return false;
  return ANSWER_PATTERNS.some((pattern) => pattern.test(text));
}

export function sanitizeSchoolTutorOutput(raw: SchoolTutorDualOutput): SchoolTutorDualOutput {
  const child = (raw.child || '').trim() || CHILD_FALLBACK;
  const parent = (raw.parent || '').trim() || PARENT_FALLBACK;
  return {
    child: looksLikeStandardAnswer(child) ? CHILD_FALLBACK : child.slice(0, 120),
    parent: looksLikeStandardAnswer(parent)
      ? PARENT_FALLBACK
      : parent.slice(0, 240)
  };
}

export const SCHOOL_TUTOR_SYSTEM_RULES = [
  '你是引导者，不是答案机器。禁止直接输出习题标准答案、选项字母或最终得数。',
  '输出必须分两块：child（给儿童，动词开头短句）和 parent（给家长，可含陪读建议）。',
  '儿童输出里禁止出现双轨差异、衡水、排名、时长 KPI。',
  '私有家庭系统，禁止任何获客、加微信、外链转化话术。'
].join('\n');
