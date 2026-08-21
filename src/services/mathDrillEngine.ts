export type MathDrillType =
  | 'add_sub_100_carry'   // 100以内进位退位加减法 (核心刚需 · 严格保证进位与退位)
  | 'add_sub_100_mixed'   // 100以内连加连减与混合运算
  | 'add_sub_20'          // 20以内进位加法与退位减法 (凑十/破十)
  | 'multi_div_99'        // 九九乘法与表内除法
  | 'add_sub_100_simple'  // 100以内不进位不退位加减
  | 'add_sub_10';         // 10以内加减法

export type QuestionCategory =
  | 'carry_add'      // 进位加法
  | 'borrow_sub'     // 退位减法
  | 'mixed'          // 连加连减/混合运算
  | 'multi'          // 表内乘法
  | 'div'            // 表内除法
  | 'simple';        // 基础不进不退

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
  category: QuestionCategory;
  categoryName: string;
  explanation: string;
  isCarryOrBorrow: boolean;
}

export interface MathDrillConfig {
  type: MathDrillType;
  count: number;          // 10, 20, 30, 50, 100
  allowNegative?: boolean;
}

export const DRILL_TYPE_OPTIONS = [
  {
    id: 'add_sub_100_carry' as MathDrillType,
    name: '100以内进位退位加减法 (难度升级)',
    grade: '一二年级核心 · 必出进退位',
    desc: '严格保证进位加法（满十进一）与退位减法（借一当十、整十整百退位），锻炼真实口算心算能力',
    badge: '推荐首选'
  },
  {
    id: 'add_sub_100_mixed' as MathDrillType,
    name: '100以内连加连减与加减混合',
    grade: '二年级培优 · 三数连算',
    desc: '三数混合运算，每一步均含进退位计算，提升多步心算抗干扰能力与条理性',
    badge: '进阶挑战'
  },
  {
    id: 'add_sub_20' as MathDrillType,
    name: '20以内进位加法与退位减法',
    grade: '一年级核心 · 凑十与破十',
    desc: '凑十法进位加法、破十法退位减法专项，打牢低年级计算基石',
    badge: '基石必修'
  },
  {
    id: 'multi_div_99' as MathDrillType,
    name: '九九乘法表与表内除法',
    grade: '二年级乘除法',
    desc: '乘法口诀熟练背诵与反向表内除法极速口算',
    badge: '乘除快算'
  },
  {
    id: 'add_sub_100_simple' as MathDrillType,
    name: '100以内整十数与不进位加减',
    grade: '一年级下册 · 基础巩固',
    desc: '整十数相加减、两位数加减一位数不进位不退位口算',
    badge: '基础巩固'
  },
  {
    id: 'add_sub_10' as MathDrillType,
    name: '10以内加减法',
    grade: '一年级上册 · 萌新入门',
    desc: '认识数与数量，理解加法合并与减法去除',
    badge: '萌新入门'
  }
];

function buildExplanation(
  op: string,
  n1: number,
  n2: number,
  ans: number,
  category: QuestionCategory,
  n3?: number,
  op2?: string
): string {
  if (category === 'carry_add') {
    const u1 = n1 % 10;
    const u2 = n2 % 10;
    const t1 = Math.floor(n1 / 10);
    const t2 = Math.floor(n2 / 10);
    const uSum = u1 + u2;
    return `【进位加法解析】① 个位相加：${u1} + ${u2} = ${uSum}，个位写 ${uSum % 10}，向十位进 1；② 十位相加：${t1} + ${t2} + 1(进位) = ${t1 + t2 + 1}；③ 综合得数是 ${ans}。`;
  }

  if (category === 'borrow_sub') {
    if (n1 === 100) {
      const u2 = n2 % 10;
      const t2 = Math.floor(n2 / 10);
      return `【整百连续退位】100 - ${n2}：① 个位 0 减 ${u2} 不够，向十位借，十位是 0 继续向百位借 1；② 个位 10 - ${u2} = ${10 - u2}；③ 十位 9 - ${t2} = ${9 - t2}；④ 最终得数是 ${ans}。`;
    }
    const u1 = n1 % 10;
    const u2 = n2 % 10;
    const t1 = Math.floor(n1 / 10);
    const t2 = Math.floor(n2 / 10);
    if (u1 < u2) {
      return `【退位减法解析】① 个位 ${u1} 减 ${u2} 不够减，向十位借 1 当 10，个位计算 10 + ${u1} - ${u2} = ${10 + u1 - u2}；② 十位 ${t1} 被借走 1 剩 ${t1 - 1}，十位计算 ${t1 - 1} - ${t2} = ${t1 - 1 - t2}；③ 最终得数是 ${ans}。`;
    }
  }

  if (category === 'mixed' && n3 !== undefined && op2) {
    const step1 = op === '+' ? n1 + n2 : n1 - n2;
    return `【加减混合解析】按从左至右顺序计算：第一步 ${n1} ${op} ${n2} = ${step1}；第二步 ${step1} ${op2} ${n3} = ${ans}。`;
  }

  if (category === 'multi') {
    return `【乘法口诀解析】想乘法口诀：${n1} × ${n2} = ${ans}。`;
  }

  if (category === 'div') {
    return `【表内除法解析】想乘算除：想 ( ? ) × ${n2} = ${n1}，因为 ${ans} × ${n2} = ${n1}，所以商是 ${ans}。`;
  }

  if (op === '+') {
    return `【加法解析】${n1} + ${n2} = ${ans}。`;
  } else {
    return `【减法解析】${n1} - ${n2} = ${ans}。`;
  }
}

export function generateDrillQuestions(config: MathDrillConfig): MathDrillQuestion[] {
  const { type, count } = config;
  const questions: MathDrillQuestion[] = [];
  const existingSet = new Set<string>();

  let attempts = 0;
  while (questions.length < count && attempts < count * 50) {
    attempts++;
    let q: MathDrillQuestion | null = null;

    if (type === 'add_sub_100_carry') {
      // 100以内严格进位加法与退位减法 (难度加大，无水题)
      const isAdd = Math.random() > 0.5;

      if (isAdd) {
        // 进位加法: 必须满足 u1 + u2 >= 10
        const isTwoDigit = Math.random() > 0.25; // 75% 两位数+两位数, 25% 两位数+一位数
        const u1 = Math.floor(Math.random() * 8) + 2; // 2..9
        const minU2 = 10 - u1;
        const u2 = Math.floor(Math.random() * (10 - minU2)) + minU2; // minU2..9

        if (isTwoDigit) {
          const t1 = Math.floor(Math.random() * 6) + 1; // 1..6
          const maxT2 = 8 - t1; // keep sum <= 100 or slight over 100
          const t2 = Math.floor(Math.random() * maxT2) + 1; // 1..maxT2
          const n1 = t1 * 10 + u1;
          const n2 = t2 * 10 + u2;
          const ans = n1 + n2;

          q = {
            id: `m100c_${questions.length + 1}`,
            expression: `${n1} + ${n2}`,
            op: '+',
            num1: n1,
            num2: n2,
            correctAnswer: ans,
            category: 'carry_add',
            categoryName: '两位数进位加法',
            explanation: buildExplanation('+', n1, n2, ans, 'carry_add'),
            isCarryOrBorrow: true
          };
        } else {
          const t1 = Math.floor(Math.random() * 8) + 1; // 1..8
          const n1 = t1 * 10 + u1;
          const n2 = u2;
          const ans = n1 + n2;

          q = {
            id: `m100c_${questions.length + 1}`,
            expression: `${n1} + ${n2}`,
            op: '+',
            num1: n1,
            num2: n2,
            correctAnswer: ans,
            category: 'carry_add',
            categoryName: '两位数加一位数进位',
            explanation: buildExplanation('+', n1, n2, ans, 'carry_add'),
            isCarryOrBorrow: true
          };
        }
      } else {
        // 退位减法: 必须满足 u1 < u2 (借一当十)
        const subTypeRand = Math.random();

        if (subTypeRand < 0.15) {
          // 15% 100 减两位数 (整百连续退位高频必考题)
          const n1 = 100;
          const n2 = Math.floor(Math.random() * 80) + 11; // 11..90
          const ans = n1 - n2;
          q = {
            id: `m100c_${questions.length + 1}`,
            expression: `${n1} - ${n2}`,
            op: '-',
            num1: n1,
            num2: n2,
            correctAnswer: ans,
            category: 'borrow_sub',
            categoryName: '100减两位数连续退位',
            explanation: buildExplanation('-', n1, n2, ans, 'borrow_sub'),
            isCarryOrBorrow: true
          };
        } else if (subTypeRand < 0.35) {
          // 20% 整十数减两位数 (如 80 - 36, 70 - 24)
          const t1 = Math.floor(Math.random() * 7) + 3; // 3..9 -> 30..90
          const n1 = t1 * 10;
          const u2 = Math.floor(Math.random() * 8) + 2; // 2..9
          const t2 = Math.floor(Math.random() * (t1 - 1)) + 1; // 1..t1-1
          const n2 = t2 * 10 + u2;
          const ans = n1 - n2;
          q = {
            id: `m100c_${questions.length + 1}`,
            expression: `${n1} - ${n2}`,
            op: '-',
            num1: n1,
            num2: n2,
            correctAnswer: ans,
            category: 'borrow_sub',
            categoryName: '整十数退位减法',
            explanation: buildExplanation('-', n1, n2, ans, 'borrow_sub'),
            isCarryOrBorrow: true
          };
        } else {
          // 65% 两位数减两位数/一位数退位
          const isTwoDigit = Math.random() > 0.25;
          const u1 = Math.floor(Math.random() * 9); // 0..8
          const u2 = Math.floor(Math.random() * (9 - u1)) + u1 + 1; // u1+1..9 (u1 < u2 guaranteed)

          if (isTwoDigit) {
            const t1 = Math.floor(Math.random() * 7) + 3; // 3..9
            const t2 = Math.floor(Math.random() * (t1 - 1)) + 1; // 1..t1-1
            const n1 = t1 * 10 + u1;
            const n2 = t2 * 10 + u2;
            const ans = n1 - n2;

            q = {
              id: `m100c_${questions.length + 1}`,
              expression: `${n1} - ${n2}`,
              op: '-',
              num1: n1,
              num2: n2,
              correctAnswer: ans,
              category: 'borrow_sub',
              categoryName: '两位数退位减法',
              explanation: buildExplanation('-', n1, n2, ans, 'borrow_sub'),
              isCarryOrBorrow: true
            };
          } else {
            const t1 = Math.floor(Math.random() * 8) + 2; // 2..9
            const n1 = t1 * 10 + u1;
            const n2 = u2;
            const ans = n1 - n2;

            q = {
              id: `m100c_${questions.length + 1}`,
              expression: `${n1} - ${n2}`,
              op: '-',
              num1: n1,
              num2: n2,
              correctAnswer: ans,
              category: 'borrow_sub',
              categoryName: '两位数减一位数退位',
              explanation: buildExplanation('-', n1, n2, ans, 'borrow_sub'),
              isCarryOrBorrow: true
            };
          }
        }
      }
    } else if (type === 'add_sub_100_mixed') {
      // 100以内连加连减与加减混合运算 (三数混合)
      const mixedPattern = Math.random();

      if (mixedPattern < 0.4) {
        // A + B - C (进位 + 退位)
        const u1 = Math.floor(Math.random() * 7) + 3;
        const u2 = Math.floor(Math.random() * (10 - (10 - u1))) + (10 - u1);
        const t1 = Math.floor(Math.random() * 4) + 1;
        const t2 = Math.floor(Math.random() * 3) + 1;
        const n1 = t1 * 10 + u1;
        const n2 = t2 * 10 + u2;
        const step1 = n1 + n2;
        const n3 = Math.floor(Math.random() * (step1 - 15)) + 11;
        const ans = step1 - n3;

        q = {
          id: `m100m_${questions.length + 1}`,
          expression: `${n1} + ${n2} - ${n3}`,
          op: '+',
          num1: n1,
          num2: n2,
          num3: n3,
          op2: '-',
          correctAnswer: ans,
          category: 'mixed',
          categoryName: '加减混合运算',
          explanation: buildExplanation('+', n1, n2, ans, 'mixed', n3, '-'),
          isCarryOrBorrow: true
        };
      } else if (mixedPattern < 0.7) {
        // A - B + C (退位 + 进位)
        const n1 = Math.floor(Math.random() * 40) + 50; // 50..89
        const n2 = Math.floor(Math.random() * 25) + 15; // 15..39
        const step1 = n1 - n2;
        const n3 = Math.floor(Math.random() * 30) + 12;
        const ans = step1 + n3;

        q = {
          id: `m100m_${questions.length + 1}`,
          expression: `${n1} - ${n2} + ${n3}`,
          op: '-',
          num1: n1,
          num2: n2,
          num3: n3,
          op2: '+',
          correctAnswer: ans,
          category: 'mixed',
          categoryName: '减加混合运算',
          explanation: buildExplanation('-', n1, n2, ans, 'mixed', n3, '+'),
          isCarryOrBorrow: true
        };
      } else {
        // A + B + C (连加进位)
        const n1 = Math.floor(Math.random() * 25) + 15;
        const n2 = Math.floor(Math.random() * 25) + 15;
        const n3 = Math.floor(Math.random() * 20) + 12;
        const ans = n1 + n2 + n3;

        q = {
          id: `m100m_${questions.length + 1}`,
          expression: `${n1} + ${n2} + ${n3}`,
          op: '+',
          num1: n1,
          num2: n2,
          num3: n3,
          op2: '+',
          correctAnswer: ans,
          category: 'mixed',
          categoryName: '三数连加运算',
          explanation: buildExplanation('+', n1, n2, ans, 'mixed', n3, '+'),
          isCarryOrBorrow: true
        };
      }
    } else if (type === 'add_sub_20') {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        // 20以内进位加法 (凑十法, sum in 11..18)
        const n1 = Math.floor(Math.random() * 7) + 3; // 3..9
        const minN2 = 11 - n1;
        const n2 = Math.floor(Math.random() * (10 - minN2)) + minN2; // minN2..9
        const ans = n1 + n2;
        q = {
          id: `m20_${questions.length + 1}`,
          expression: `${n1} + ${n2}`,
          op: '+',
          num1: n1,
          num2: n2,
          correctAnswer: ans,
          category: 'carry_add',
          categoryName: '20以内进位加法 (凑十法)',
          explanation: `【凑十法解析】将 ${n2} 拆成 ${10 - n1} 和 ${n2 - (10 - n1)}，${n1} + ${10 - n1} = 10，10 + ${n2 - (10 - n1)} = ${ans}。`,
          isCarryOrBorrow: true
        };
      } else {
        // 20以内退位减法 (破十法, 11..18 - 2..9, units digit < n2)
        const u1 = Math.floor(Math.random() * 8) + 1; // 1..8
        const n1 = 10 + u1; // 11..18
        const n2 = Math.floor(Math.random() * (9 - u1)) + u1 + 1; // u1+1..9
        const ans = n1 - n2;
        q = {
          id: `m20_${questions.length + 1}`,
          expression: `${n1} - ${n2}`,
          op: '-',
          num1: n1,
          num2: n2,
          correctAnswer: ans,
          category: 'borrow_sub',
          categoryName: '20以内退位减法 (破十法)',
          explanation: `【破十法解析】把 ${n1} 分成 10 和 ${u1}，先算 10 - ${n2} = ${10 - n2}，再算 ${10 - n2} + ${u1} = ${ans}。`,
          isCarryOrBorrow: true
        };
      }
    } else if (type === 'multi_div_99') {
      const isMulti = Math.random() > 0.4;
      if (isMulti) {
        const n1 = Math.floor(Math.random() * 8) + 2; // 2..9
        const n2 = Math.floor(Math.random() * 8) + 2; // 2..9
        const ans = n1 * n2;
        q = {
          id: `m99_${questions.length + 1}`,
          expression: `${n1} × ${n2}`,
          op: '×',
          num1: n1,
          num2: n2,
          correctAnswer: ans,
          category: 'multi',
          categoryName: '九九表内乘法',
          explanation: buildExplanation('×', n1, n2, ans, 'multi'),
          isCarryOrBorrow: false
        };
      } else {
        const divisor = Math.floor(Math.random() * 8) + 2; // 2..9
        const quotient = Math.floor(Math.random() * 8) + 2; // 2..9
        const dividend = divisor * quotient;
        q = {
          id: `m99_${questions.length + 1}`,
          expression: `${dividend} ÷ ${divisor}`,
          op: '÷',
          num1: dividend,
          num2: divisor,
          correctAnswer: quotient,
          category: 'div',
          categoryName: '九九表内除法',
          explanation: buildExplanation('÷', dividend, divisor, quotient, 'div'),
          isCarryOrBorrow: false
        };
      }
    } else if (type === 'add_sub_100_simple') {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const tens = (Math.floor(Math.random() * 8) + 1) * 10;
        const units = Math.floor(Math.random() * 5) + 1;
        const n1 = tens + units;
        const n2 = Math.floor(Math.random() * (9 - units)) + 1;
        const ans = n1 + n2;
        q = {
          id: `m100s_${questions.length + 1}`,
          expression: `${n1} + ${n2}`,
          op: '+',
          num1: n1,
          num2: n2,
          correctAnswer: ans,
          category: 'simple',
          categoryName: '100以内不进位加法',
          explanation: buildExplanation('+', n1, n2, ans, 'simple'),
          isCarryOrBorrow: false
        };
      } else {
        const tens = (Math.floor(Math.random() * 7) + 2) * 10;
        const units = Math.floor(Math.random() * 7) + 2;
        const n1 = tens + units;
        const n2 = Math.floor(Math.random() * (units - 1)) + 1;
        const ans = n1 - n2;
        q = {
          id: `m100s_${questions.length + 1}`,
          expression: `${n1} - ${n2}`,
          op: '-',
          num1: n1,
          num2: n2,
          correctAnswer: ans,
          category: 'simple',
          categoryName: '100以内不退位减法',
          explanation: buildExplanation('-', n1, n2, ans, 'simple'),
          isCarryOrBorrow: false
        };
      }
    } else if (type === 'add_sub_10') {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * (10 - n1 + 1));
        const ans = n1 + n2;
        q = {
          id: `m10_${questions.length + 1}`,
          expression: `${n1} + ${n2}`,
          op: '+',
          num1: n1,
          num2: n2,
          correctAnswer: ans,
          category: 'simple',
          categoryName: '10以内加法',
          explanation: buildExplanation('+', n1, n2, ans, 'simple'),
          isCarryOrBorrow: false
        };
      } else {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * (n1 + 1));
        const ans = n1 - n2;
        q = {
          id: `m10_${questions.length + 1}`,
          expression: `${n1} - ${n2}`,
          op: '-',
          num1: n1,
          num2: n2,
          correctAnswer: ans,
          category: 'simple',
          categoryName: '10以内减法',
          explanation: buildExplanation('-', n1, n2, ans, 'simple'),
          isCarryOrBorrow: false
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

