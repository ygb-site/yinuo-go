import type { MistakeRecord, SubjectId, DailyLearningReport, GradeLevel } from '../types/curriculum';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { getKnowledgePointById } from '../data/knowledgePointsData';

export interface AiTutorStepHint {
  step: 1 | 2 | 3;
  type: 'concept_reminder' | 'key_operation' | 'solution_breakdown';
  title: string;
  speechText: string;
  content: string;
  encouragement: string;
}

export interface AiVariationQuiz {
  id: string;
  subjectId: SubjectId;
  prompt: string;
  options: { id: string; text: string; subText?: string }[];
  correctId: string;
  hint: string;
  explanation: string;
}

export interface AiTutorStudentContext {
  studentNickname?: string;
  gradeLevel?: GradeLevel;
  subjectId: SubjectId;
  questionPrompt: string;
  userAnswer?: string;
  correctAnswer: string;
  knowledgePointId?: string;
  knowledgePointTitle?: string;
  mistakeHistoryCount?: number;
  masteryRate?: number;
  errorReason?: string;
}

export interface AiTutorGuidanceResponse {
  hint1: AiTutorStepHint;
  hint2: AiTutorStepHint;
  hint3: AiTutorStepHint;
  explanation: string;
  variationQuestion: AiVariationQuiz;
}

export interface AICompletionRequest {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  name: string;
  generateCompletion(req: AICompletionRequest): Promise<string>;
}

export class SupabaseEdgeAIProvider implements AIProvider {
  public name = 'SupabaseEdgeAIProvider';

  public async generateCompletion(req: AICompletionRequest): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await client.functions.invoke('ai-tutor', {
      body: {
        systemPrompt: req.systemPrompt,
        userMessage: req.userMessage,
        temperature: req.temperature || 0.7,
        maxTokens: req.maxTokens || 800
      }
    });

    if (error) throw error;
    return data?.reply || '';
  }
}

export class LocalRuleAIProvider implements AIProvider {
  public name = 'LocalRuleAIProvider';

  public async generateCompletion(_req: AICompletionRequest): Promise<string> {
    return JSON.stringify({
      status: 'ok',
      source: 'local_rule_engine'
    });
  }
}

export class AiTutorService {
  private static provider: AIProvider = isSupabaseConfigured()
    ? new SupabaseEdgeAIProvider()
    : new LocalRuleAIProvider();

  public static setProvider(customProvider: AIProvider) {
    this.provider = customProvider;
  }

  public static getProviderName(): string {
    return this.provider.name;
  }

  public static sanitizeKidContent(input: string): string {
    if (!input) return '';
    return input.replace(/<[^>]*>?/gm, '').slice(0, 300);
  }

  public static async getTutorGuidance(ctx: AiTutorStudentContext): Promise<AiTutorGuidanceResponse> {
    const kp = ctx.knowledgePointId ? getKnowledgePointById(ctx.knowledgePointId) : undefined;
    const kpTitle = ctx.knowledgePointTitle || kp?.title || '核心知识点';

    const fallbackMistake: MistakeRecord = {
      id: 'ctx_' + Date.now(),
      subjectId: ctx.subjectId,
      gradeLevel: ctx.gradeLevel,
      topic: kpTitle,
      knowledgePointId: ctx.knowledgePointId,
      knowledgePointTitle: kpTitle,
      questionPrompt: ctx.questionPrompt,
      userAnswer: ctx.userAnswer || '未作答',
      correctAnswer: ctx.correctAnswer,
      errorCategory: 'calculation',
      errorReason: ctx.errorReason || `在知识点【${kpTitle}】的理解和计算步骤上出现疏漏。`,
      createdAt: Date.now(),
      resolved: false
    };

    const hints = this.getProgressiveHints(fallbackMistake);
    const variation = this.generateVariationQuiz(fallbackMistake);

    return {
      hint1: hints[0],
      hint2: hints[1],
      hint3: hints[2],
      explanation: `知识点【${kpTitle}】关键点：${kp?.description || fallbackMistake.errorReason}`,
      variationQuestion: variation
    };
  }

  public static getProgressiveHints(mistake: MistakeRecord): AiTutorStepHint[] {
    const { subjectId, questionPrompt, userAnswer, correctAnswer, topic, errorReason } = mistake;
    if (subjectId === 'math') {
      return [
        {
          step: 1,
          type: 'concept_reminder',
          title: '第 1 步：找准运算法则与概念',
          speechText: '小诺提示：先仔细看清题目的运算符号，回忆计算规则与数量关系哦！',
          content: '仔细看算式「' + questionPrompt + '」，属于【' + (topic || '基础口算') + '】。先看是个位还是十位需要进退位或法则应用！',
          encouragement: '认真看清数字与符号，你一定能找到思路！'
        },
        {
          step: 2,
          type: 'key_operation',
          title: '第 2 步：关键运算拆解',
          speechText: '关键步骤来了：数位对齐，满十进一，不够减借一当十！',
          content: errorReason || '按照数位从个位开始算起，注意进位和借位的标记。',
          encouragement: '太棒了，再动动小脑筋算一算！'
        },
        {
          step: 3,
          type: 'solution_breakdown',
          title: '第 3 步：完整思路揭秘',
          speechText: '正确答案是 ' + correctAnswer + '！小朋友刚才错算成 ' + userAnswer + '，下次记得仔细验算哦！',
          content: '「' + questionPrompt + ' = ' + correctAnswer + '」。刚才错填了 ' + userAnswer + '，掌握了规则下次就能稳稳做对！',
          encouragement: '太棒了！消灭了一个思维漏洞，向数学小先锋迈进！'
        }
      ];
    }
    if (subjectId === 'chinese') {
      return [
        {
          step: 1,
          type: 'concept_reminder',
          title: '第 1 步：观察字形与偏旁',
          speechText: '小诺提示：仔细看这个字的部首和结构，它是左右结构、上下结构还是半包围呢？',
          content: '易错知识点：【' + (topic || '汉字笔顺规范') + '】。仔细观察字的间架结构与部首意义。',
          encouragement: '汉字就像画画一样，静下心来观察！'
        },
        {
          step: 2,
          type: 'key_operation',
          title: '第 2 步：笔顺与笔画规则',
          speechText: '笔顺口诀：先横后竖，先撇后捺，从上到下，从左到右，先中间后两边！',
          content: errorReason || '笔画不可多写漏写，注意撇捺出头与点的位置。',
          encouragement: '按照笔顺口诀再在手心里描一遍吧！'
        },
        {
          step: 3,
          type: 'solution_breakdown',
          title: '第 3 步：正确规范掌握',
          speechText: '正确规范是「' + correctAnswer + '」！字音字形都牢记在心里啦！',
          content: '标准答案/写法：【' + correctAnswer + '】。刚才的混淆点已理清，记住形旁表意、声旁表音的规律。',
          encouragement: '古人说写字明理，你的字写得越来越规范啦！'
        }
      ];
    }
    if (subjectId === 'english') {
      return [
        {
          step: 1,
          type: 'concept_reminder',
          title: 'Step 1: 自然拼读自然拼',
          speechText: 'Look at the sounds! 听一听元音字母和辅音的发音规律！',
          content: '核心单词：【' + (topic || questionPrompt) + '】。先按音节划分，用自然拼读法拆分发音。',
          encouragement: 'Follow the phonics sound, you can do it!'
        },
        {
          step: 2,
          type: 'key_operation',
          title: 'Step 2: 字母拼写组合',
          speechText: '注意易混字母与双写规则哦！',
          content: errorReason || '注意短元音与长元音的区别，检查字母组合的排列顺序。',
          encouragement: 'Great job! Keep practicing!'
        },
        {
          step: 3,
          type: 'solution_breakdown',
          title: 'Step 3: 单词牢固掌握',
          speechText: 'The correct answer is ' + correctAnswer + '! Read it aloud with NuoNuo!',
          content: '标准答案：' + correctAnswer + '。刚才拼写为 ' + userAnswer + '，多读两遍强化肌肉记忆！',
          encouragement: 'Awesome! You are an English Star!'
        }
      ];
    }
    return [
      {
        step: 1,
        type: 'concept_reminder',
        title: '第 1 步：数气与寻找焦点',
        speechText: '小诺提示：先数一数关键棋子还有几口气，找到棋形的最薄弱点！',
        content: '死活手筋要点：【' + (topic || '气与棋形判断') + '】。注意真眼假眼与切断连接。',
        encouragement: '棋盘上的每颗子都有呼吸，耐心观察！'
      },
      {
        step: 2,
        type: 'key_operation',
        title: '第 2 步：推演行棋顺序',
        speechText: '注意行棋次序：先叫吃、断还是立？算一算对手会怎么应！',
        content: errorReason || '围棋讲究先手，抢占要点 (如扑、枷、抱吃或做眼位)。',
        encouragement: '算准一步，棋力涨一分！'
      },
      {
        step: 3,
        type: 'solution_breakdown',
        title: '第 3 步：最佳正解图解',
        speechText: '正解点是 ' + correctAnswer + '！掌握了这道死活手筋，实战对弈更厉害啦！',
        content: '正解着手：' + correctAnswer + '。之前下在 ' + userAnswer + ' 容易被对方抢先做活或逃脱。',
        encouragement: '下出妙手的感觉真棒！继续加油！'
      }
    ];
  }

  public static generateVariationQuiz(mistake: MistakeRecord): AiVariationQuiz {
    const { subjectId, questionPrompt, correctAnswer } = mistake;
    if (subjectId === 'math') {
      const nums = questionPrompt.match(/\d+/g);
      let a = nums ? parseInt(nums[0]) : 25;
      let b = nums && nums[1] ? parseInt(nums[1]) : 17;
      const isAdd = questionPrompt.includes('+');
      const varA = Math.max(10, a + (Math.random() > 0.5 ? 2 : -2));
      const varB = Math.max(5, b + (Math.random() > 0.5 ? 1 : -1));
      const trueAns = isAdd ? varA + varB : Math.max(1, varA - varB);
      const fakeAns1 = trueAns + 10;
      const fakeAns2 = trueAns - 1;
      const fakeAns3 = trueAns + 2;
      return {
        id: 'var_' + Date.now(),
        subjectId: 'math',
        prompt: '【变式巩固】' + varA + (isAdd ? ' + ' : ' - ') + varB + ' = ?',
        options: [
          { id: 'opt_a', text: String(trueAns), subText: '正解' },
          { id: 'opt_b', text: String(fakeAns1), subText: '易错项' },
          { id: 'opt_c', text: String(fakeAns2), subText: '易错项' },
          { id: 'opt_d', text: String(fakeAns3), subText: '干扰项' }
        ].sort(() => Math.random() - 0.5),
        correctId: String(trueAns),
        hint: '按照刚刚学到的进退位方法，仔细从个位算起！',
        explanation: varA + (isAdd ? ' + ' : ' - ') + varB + ' = ' + trueAns + '。恭喜你举一反三成功掌握！'
      };
    }
    if (subjectId === 'chinese') {
      return {
        id: 'var_' + Date.now(),
        subjectId: 'chinese',
        prompt: '【变式生字辨析】下列词语中生字使用或读音完全正确的一项是？',
        options: [
          { id: 'opt_a', text: '天朗气清（' + (correctAnswer || '规范') + '）', subText: '推荐' },
          { id: 'opt_b', text: '走马观花（走字旁误写）', subText: '辨析' },
          { id: 'opt_c', text: '睛空万里（晴/睛混淆）', subText: '辨析' }
        ].sort(() => Math.random() - 0.5),
        correctId: '天朗气清（' + (correctAnswer || '规范') + '）',
        hint: '注意观察形近字的偏旁表意特征。',
        explanation: '形近字区分牢记：日出晴天，目为眼睛，三点水为清水。'
      };
    }
    if (subjectId === 'english') {
      return {
        id: 'var_' + Date.now(),
        subjectId: 'english',
        prompt: '【变式发音连线】Which word has the same phonics sound pattern?',
        options: [
          { id: 'opt_a', text: correctAnswer || 'Apple', subText: 'Target' },
          { id: 'opt_b', text: 'Ant', subText: '/æ/ Sound' },
          { id: 'opt_c', text: 'Arrow', subText: '/æ/ Sound' }
        ].sort(() => Math.random() - 0.5),
        correctId: correctAnswer || 'Apple',
        hint: 'Notice the initial short vowel sound.',
        explanation: 'Great job! Phonics practice helps you remember vocabulary effortlessly.'
      };
    }
    return {
      id: 'var_' + Date.now(),
      subjectId: 'go',
      prompt: '【变式死活思考】当对方在关键眼位下子时，我们应该？',
      options: [
        { id: 'opt_a', text: '抢占做活要点做成两只真眼', subText: '活棋要诀' },
        { id: 'opt_b', text: '随意在别处下子', subText: '脱先' },
        { id: 'opt_c', text: '填入自己的真眼里', subText: '自杀形' }
      ],
      correctId: '抢占做活要点做成两只真眼',
      hint: '做眼活棋的口诀：两眼活棋，做眼要趁早！',
      explanation: '围棋活棋的充要条件是有两只互不相通的真眼。'
    };
  }

  public static generateDailyParentReport(
    dateStr: string,
    completedLessonsCount: number,
    mistakes: MistakeRecord[],
    resolvedCount: number
  ): DailyLearningReport {
    const weakPoints: string[] = [];
    const masteredPoints: string[] = [];
    const topicMap: Record<string, number> = {};
    for (const m of mistakes) {
      if (!m.resolved) {
        topicMap[m.knowledgePointTitle || m.topic] = (topicMap[m.knowledgePointTitle || m.topic] || 0) + 1;
      } else {
        masteredPoints.push(m.knowledgePointTitle || m.topic);
      }
    }
    for (const [top, count] of Object.entries(topicMap)) {
      if (count >= 1) weakPoints.push(top);
    }
    if (masteredPoints.length === 0) masteredPoints.push('20以内不进位加减法', '汉字基础笔顺', '围棋数气基本功');
    if (weakPoints.length === 0) weakPoints.push('两位数进位加法', '20以内退位减法（破十法）');
    const totalMinutes = Math.min(60, Math.max(15, completedLessonsCount * 6 + resolvedCount * 3));
    const advice =
      weakPoints.length > 0
        ? '今天宝贝在【' + weakPoints[0] + '】上偶有疏漏，已通过 AI 渐进式提示完成订正。建议明天复习 10 道同类变式题巩固数感！'
        : '宝贝今天表现极佳，所有练习与闯关全部全对通过！保持专注与探索兴趣！';
    return {
      date: dateStr,
      totalMinutes,
      subjectMinutes: {
        math: Math.round(totalMinutes * 0.4),
        chinese: Math.round(totalMinutes * 0.3),
        english: Math.round(totalMinutes * 0.15),
        go: Math.round(totalMinutes * 0.15)
      },
      completedLessons: completedLessonsCount,
      masteredKnowledgePoints: Array.from(new Set(masteredPoints)).slice(0, 4),
      weakKnowledgePoints: Array.from(new Set(weakPoints)).slice(0, 3),
      mistakesCount: mistakes.length,
      resolvedMistakesCount: resolvedCount,
      parentAdvice: advice,
      tomorrowRecommendations: [
        '推荐攻克【' + (weakPoints[0] || '进退位口算') + '】专项变式题 5 题',
        '完成 1 个新的启蒙主线关卡获得 3 颗星星',
        '在错题本中领取双倍金币奖励'
      ]
    };
  }
}

