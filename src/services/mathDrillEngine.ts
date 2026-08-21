export type MathDrillType =
  | 'add_sub_10'          // 10以内加减法
  | 'add_sub_20'          // 20以内进位退位加减法
  | 'add_sub_100_simple'  // 100以内不进位不退位加减
  | 'add_sub_100_carry'   // 100以内进位退位加减法 (核心刚需)
  | 'add_sub_100_mixed'   // 100以内连加连减与混合运算
  | 'multi_div_99';       // 九九乘法与表内除法

export interface MathDrillQuestion {
  id: string;
  expression: string;     // e.g. "47 + 38"
  op: string;             // "+" | "-" | "×" | "÷"
  num1: number;
  num2: number;
  num3?: number;
  op2?: string;
  correctAnswer: number;
  userAnswer?: number | null;
  isCorrect?: boolean | null;
  timeSpentMs?: number;
}

export interface MathDrillConfig {
  type: MathDrillType;
  count: number;          // 10, 20, 30, 50
  allowNegative?: boolean;
}

export const DRILL_TYPE_OPTIONS = [
  {
    id: 'add_sub_100_carry' as MathDrillType,
    name: '100以内进位退位加减法',
    grade: '一二年级核心',
    desc: '包含两位数进位加法、退位减法，锻炼口算与心算能力',
    badge: '最推荐'
  },
  {
    id: 'add_sub_100_mixed' as MathDrillType,
    name: '100以内连加连减与混合',
    grade: '二年级培优',
    desc: '三数混合运算，如 38 + 27 - 19，培养专注力与计算条理',
    badge: '进阶挑战'
  },
  {
    id: 'add_sub_100_simple' as MathDrillType,
    name: '100以内整十数与不进位加减',
    grade: '一年级下册',
    desc: '整十数相加减、两位数加减一位数不进位口算',
    badge: '基础巩固'
  },
  {
    id: 'add_sub_20' as MathDrillType,
    name: '20以内进位加法与退位减法',
    grade: '一年级上册',
    desc: '凑十法、破十法经典题型，打好计算坚实基石',
    badge: '基石必修'
  },
  {
    id: 'add_sub_10' as MathDrillType,
    name: '10以内加减法',
    grade: '一年级上册基础',
    desc: '认识数与数量，理解加法合并与减法去除',
    badge: '萌新入门'
  },
  {
    id: 'multi_div_99' as MathDrillType,
    name: '九九乘法表与表内除法',
    grade: '二年级乘除法',
    desc: '乘法口诀熟练背诵与反向除法计算',
    badge: '乘除快算'
  }
];

export function generateDrillQuestions(config: MathDrillConfig): MathDrillQuestion[] {
  const { type, count } = config;
  const questions: MathDrillQuestion[] = [];
  const existingSet = new Set<string>();

  let attempts = 0;
  while (questions.length < count && attempts < count * 20) {
    attempts++;
    let q: MathDrillQuestion | null = null;

    if (type === 'add_sub_10') {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * (10 - n1 + 1));
        q = {
          id: `m10_${questions.length + 1}`,
          expression: `${n1} + ${n2}`,
          op: '+',
          num1: n1,
          num2: n2,
          correctAnswer: n1 + n2
        };
      } else {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * (n1 + 1));
        q = {
          id: `m10_${questions.length + 1}`,
          expression: `${n1} - ${n2}`,
          op: '-',
          num1: n1,
          num2: n2,
          correctAnswer: n1 - n2
        };
      }
    } else if (type === 'add_sub_20') {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        // 20以内进位加法 (如 8 + 7, 9 + 6)
        const n1 = Math.floor(Math.random() * 8) + 3; // 3~10
        const n2 = Math.floor(Math.random() * (20 - n1)) + (11 - n1 > 0 ? 11 - n1 : 2);
        const safeN2 = Math.min(Math.max(2, n2), 20 - n1);
        q = {
          id: `m20_${questions.length + 1}`,
          expression: `${n1} + ${safeN2}`,
          op: '+',
          num1: n1,
          num2: safeN2,
          correctAnswer: n1 + safeN2
        };
      } else {
        // 20以内退位减法 (如 15 - 8, 13 - 7)
        const n1 = Math.floor(Math.random() * 9) + 11; // 11~19
        const n2 = Math.floor(Math.random() * (n1 - 2)) + 2; // 2~n1-1
        q = {
          id: `m20_${questions.length + 1}`,
          expression: `${n1} - ${n2}`,
          op: '-',
          num1: n1,
          num2: n2,
          correctAnswer: n1 - n2
        };
      }
    } else if (type === 'add_sub_100_simple') {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        // 整十加 或 两位数加一位数不进位 (如 43 + 5, 30 + 50)
        const isTens = Math.random() > 0.5;
        if (isTens) {
          const n1 = (Math.floor(Math.random() * 8) + 1) * 10;
          const n2 = (Math.floor(Math.random() * (9 - n1 / 10)) + 1) * 10;
          q = {
            id: `m100s_${questions.length + 1}`,
            expression: `${n1} + ${n2}`,
            op: '+',
            num1: n1,
            num2: n2,
            correctAnswer: n1 + n2
          };
        } else {
          const tens = (Math.floor(Math.random() * 8) + 1) * 10;
          const units = Math.floor(Math.random() * 5) + 1;
          const n1 = tens + units;
          const n2 = Math.floor(Math.random() * (9 - units)) + 1;
          q = {
            id: `m100s_${questions.length + 1}`,
            expression: `${n1} + ${n2}`,
            op: '+',
            num1: n1,
            num2: n2,
            correctAnswer: n1 + n2
          };
        }
      } else {
        // 整十减 或 不退位减法 (如 78 - 6, 80 - 30)
        const tens = (Math.floor(Math.random() * 8) + 2) * 10;
        const units = Math.floor(Math.random() * 8) + 1;
        const n1 = tens + units;
        const n2 = Math.floor(Math.random() * units) + 1;
        q = {
          id: `m100s_${questions.length + 1}`,
          expression: `${n1} - ${n2}`,
          op: '-',
          num1: n1,
          num2: n2,
          correctAnswer: n1 - n2
        };
      }
    } else if (type === 'add_sub_100_carry') {
      // 100以内两位数加减法（重点：进位与退位，真实小学高频考点）
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const n1 = Math.floor(Math.random() * 70) + 12; // 12~81
        const maxN2 = 99 - n1;
        if (maxN2 < 9) continue;
        const n2 = Math.floor(Math.random() * (maxN2 - 8)) + 9; // 9~maxN2
        q = {
          id: `m100c_${questions.length + 1}`,
          expression: `${n1} + ${n2}`,
          op: '+',
          num1: n1,
          num2: n2,
          correctAnswer: n1 + n2
        };
      } else {
        const n1 = Math.floor(Math.random() * 70) + 25; // 25~94
        const n2 = Math.floor(Math.random() * (n1 - 10)) + 9; // 9~n1-1
        q = {
          id: `m100c_${questions.length + 1}`,
          expression: `${n1} - ${n2}`,
          op: '-',
          num1: n1,
          num2: n2,
          correctAnswer: n1 - n2
        };
      }
    } else if (type === 'add_sub_100_mixed') {
      // 连加连减与加减混合运算 (如 36 + 28 - 19)
      const n1 = Math.floor(Math.random() * 40) + 15;
      const n2 = Math.floor(Math.random() * 35) + 10;
      const intermediate = n1 + n2;
      const n3 = Math.floor(Math.random() * (intermediate - 5)) + 5;
      q = {
        id: `m100m_${questions.length + 1}`,
        expression: `${n1} + ${n2} - ${n3}`,
        op: '+',
        num1: n1,
        num2: n2,
        num3: n3,
        op2: '-',
        correctAnswer: intermediate - n3
      };
    } else if (type === 'multi_div_99') {
      const isMulti = Math.random() > 0.4;
      if (isMulti) {
        const n1 = Math.floor(Math.random() * 8) + 2; // 2~9
        const n2 = Math.floor(Math.random() * 8) + 2; // 2~9
        q = {
          id: `m99_${questions.length + 1}`,
          expression: `${n1} × ${n2}`,
          op: '×',
          num1: n1,
          num2: n2,
          correctAnswer: n1 * n2
        };
      } else {
        const divisor = Math.floor(Math.random() * 8) + 2; // 2~9
        const quotient = Math.floor(Math.random() * 8) + 2; // 2~9
        const dividend = divisor * quotient;
        q = {
          id: `m99_${questions.length + 1}`,
          expression: `${dividend} ÷ ${divisor}`,
          op: '÷',
          num1: dividend,
          num2: divisor,
          correctAnswer: quotient
        };
      }
    }

    if (q && !existingSet.has(q.expression)) {
      existingSet.add(q.expression);
      questions.push(q);
    }
  }

  return questions;
}

