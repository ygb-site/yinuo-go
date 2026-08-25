import type { MistakeRecord, SubjectId, DailyLearningReport, GradeLevel } from '../types/curriculum';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { redactSecrets } from '../utils/safeError';
import { checkInput } from '../domain/ai/inputSafety';
import { guardResponse, SAFE_KID_FALLBACK } from '../domain/ai/responseGuard';

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
  lessonTitle?: string;
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
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export type AIProviderId = 'local-rule' | 'custom-openai' | 'supabase-edge';

export interface AIProvider {
  /** provider 身份标识：用于审计「当前到底在用哪条链路」 */
  readonly id: AIProviderId;
  ask(request: AICompletionRequest): Promise<string>;
}

/** 儿童可见的统一兜底文案：任何异常都只呈现这一句，绝不带原始错误信息 */
export const KID_SAFE_AI_FALLBACK_TEXT = SAFE_KID_FALLBACK;

/**
 * 1. 本地启发式规则引擎（100% 离线可用，响应 0ms，针对儿童友好拟人化设计）
 */
export class LocalRuleAIProvider implements AIProvider {
  public readonly id: AIProviderId = 'local-rule';

  public async ask(request: AICompletionRequest): Promise<string> {
    const q = request.userMessage.toLowerCase();

    if (q.includes('夸') || q.includes('加油') || q.includes('棒')) {
      const compliments = [
        '宝贝你太棒啦！每下一颗棋子、每解开一道题，你的大脑都在变得更聪明！🌟',
        '加油小勇士！大棋圣也是从一颗一颗棋子数气练出来的，小诺一直陪着你！💪',
        '你的专注力超级棒！无论输赢，享受思考的乐趣最重要！🚀'
      ];
      return compliments[Math.floor(Math.random() * compliments.length)];
    }

    if (q.includes('气') || q.includes('几口气')) {
      return '🌟 小诺助教点拨：横线与竖线直接相连的相邻空交叉点就是“气”！斜线是不算气的哦。只要把对方所有气堵死，就能一把提走啦！🌬️';
    }

    if (q.includes('眼') || q.includes('真眼') || q.includes('假眼')) {
      return '🌟 小诺助教点拨：真眼是四周都有己方棋子保护、对方不能直接落子的禁入点！两只完整的独立真眼才能永远活棋哦！👁️';
    }

    if (q.includes('跳棋') || q.includes('搭桥')) {
      return '🌟 小诺助教点拨：跳棋小秘诀：前方紧挨着一颗棋子、且其后方是空位时，可以直接跳过去！如果连着排好几个，就能像彩虹桥一样连续大跳跃啦！⭐';
    }

    if (q.includes('五子棋') || q.includes('连珠')) {
      return '🌟 小诺助教点拨：五子棋制胜要诀：先手抢占中心，时刻盯紧对方有没有连续三子（活三）。构造“双三”或者“四三”就能让对手防不胜防！⚪';
    }

    return '🌟 小诺助教点拨：在棋艺探索中，多观察全局断点与连络，先想一步再落子，你一定会找到最好的正解！💡 加油，你一定可以独立解出来的！✨';
  }
}

/**
 * 2. 自定义 OpenAI / DeepSeek 标准协议 Provider
 */
export class CustomOpenAIProvider implements AIProvider {
  public readonly id: AIProviderId = 'custom-openai';

  private endpoint: string;
  private apiKey: string;
  private model: string;

  constructor(
    endpoint: string,
    apiKey: string,
    model: string = 'deepseek-v4-flash'
  ) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.model = model;
  }

  public async ask(request: AICompletionRequest): Promise<string> {
    if (!this.apiKey || !this.apiKey.trim()) {
      return new LocalRuleAIProvider().ask(request);
    }

    const messages = [
      { role: 'system', content: request.systemPrompt }
    ];

    if (request.history && request.history.length > 0) {
      for (const h of request.history.slice(-6)) {
        messages.push({ role: h.role, content: h.text });
      }
    }

    messages.push({ role: 'user', content: request.userMessage });

    const cleanEndpoint = (this.endpoint || 'https://api.deepseek.com/v1/chat/completions').trim();

    const response = await fetch(cleanEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: this.model || 'deepseek-v4-flash',
        messages,
        temperature: 0.7,
        max_tokens: 450
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI 接口请求异常 (${response.status}): ${redactSecrets(errText).slice(0, 100)}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || SAFE_KID_FALLBACK;
  }
}

/**
 * 3. Supabase Edge Functions Provider
 */
export class SupabaseEdgeAIProvider implements AIProvider {
  public readonly id: AIProviderId = 'supabase-edge';

  public async ask(request: AICompletionRequest): Promise<string> {
    if (!isSupabaseConfigured()) {
      return new LocalRuleAIProvider().ask(request);
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return new LocalRuleAIProvider().ask(request);
    }

    const { data, error } = await supabase.functions.invoke('ai-tutor-companion', {
      body: {
        systemPrompt: request.systemPrompt,
        userMessage: request.userMessage,
        history: request.history
      }
    });

    if (error || !data?.reply) {
      return new LocalRuleAIProvider().ask(request);
    }

    return data.reply;
  }
}

export class AiTutorService {
  private static provider: AIProvider = new LocalRuleAIProvider();

  public static setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  /** 当前生效的 provider 身份：默认恒为离线本地规则引擎 */
  public static getProviderId(): AIProviderId {
    return this.provider.id;
  }

  public static sanitizeKidContent(input: string, maxLen = 300): string {
    if (!input) return '';
    return input
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, maxLen);
  }

  public static buildSystemPrompt(ctx: AiTutorStudentContext): string {
    const studentName = ctx.studentNickname || '小朋友';
    const kpTitle = ctx.knowledgePointTitle || '棋艺核心知识';

    return `你叫“小诺”，是一诺未来学堂的 AI 伴学小导师（形象是一只聪明可爱、温暖幽默的大熊猫 🐼）。
你的对话对象是 4~12 岁的少儿小棋手（当前学生：${studentName}）。
当前对弈/题目：${ctx.questionPrompt}
核心知识点：【${kpTitle}】
标准正确答案：${ctx.correctAnswer}

教学指导原则（极重要）：
1. 绝对不要直接把答案扔给孩子！要像苏格拉底启发法一样，用充满童趣的语言、生动的比喻，一步步引导孩子自己观察棋盘、数气并推导出正解。
2. 语言必须亲切生动、温暖充满鼓励，多使用 🌟、♟️、⭐、💡 等可爱 emoji。
3. 单次回复控制在 3 句话以内（100字左右），适合小朋友快速阅读与语音朗读。
4. 遇到挫折时给予孩子最大的心理支持与安全感。`;
  }

  public static async askKidTutor(
    ctx: AiTutorStudentContext,
    userMessage: string,
    history?: Array<{ role: 'user' | 'assistant'; text: string }>
  ): Promise<string> {
    // 1. Input Safety Layer Check
    const verdict = checkInput(userMessage);
    if (verdict.action === 'refuse') {
      return verdict.kidMessage;
    }

    const cleanMsg = verdict.text;
    if (!cleanMsg) {
      const subjectName = ctx.subjectId === 'go' ? '围棋' : ctx.subjectId === 'checkers' ? '跳棋' : '五子棋';
      const tip = ctx.subjectId === 'checkers'
        ? '观察前方相邻棋子，寻找连续搭桥跳跃的机会'
        : ctx.subjectId === 'gomoku'
        ? '注意防守对方活三，抢先构造四三胜势'
        : '从围棋的“气”、死活和连接入手';
      return `🌟 小诺助教点拨：你好呀，${ctx.studentNickname || '小棋手'}！我是小诺 🐼。在${subjectName}练习中遇到难题别担心，试着${tip}吧！`;
    }

    const systemPrompt = this.buildSystemPrompt(ctx);
    try {
      const rawReply = await this.provider.ask({
        systemPrompt,
        userMessage: cleanMsg,
        history
      });

      // 2. Response Guard Output Sanitization
      const outputGuard = guardResponse(rawReply);
      return outputGuard.action === 'reject' ? outputGuard.fallbackText : outputGuard.text;
    } catch {
      // 3. Fallback safely to local rule without technical leaks
      return SAFE_KID_FALLBACK;
    }
  }

  public static getProgressiveHints(mistake: MistakeRecord): AiTutorStepHint[] {
    const { questionPrompt, userAnswer, correctAnswer, topic, errorReason } = mistake;
    return [
      {
        step: 1,
        type: 'concept_reminder',
        title: '第 1 步：数一数气与观察全局',
        speechText: '小诺提示：先仔细数一数双方棋子的“气”，看看哪里有危险或机会！',
        content: '题目：「' + questionPrompt + '」，核心关键：【' + (topic || '气的概念与连接') + '】。先看自己和对方各有几口气！',
        encouragement: '静下心来仔细数气，你一定会找到好手！'
      },
      {
        step: 2,
        type: 'key_operation',
        title: '第 2 步：寻找关键着手点',
        speechText: '关键战术：紧气、长气、做眼还是切断？',
        content: errorReason || '判断是要主动叫吃对方，还是要保护自己的断点长气逃跑。',
        encouragement: '太棒了，再想想下一步落在哪里最关键！'
      },
      {
        step: 3,
        type: 'solution_breakdown',
        title: '第 3 步：最佳正解揭秘',
        speechText: '正解落子在 ' + correctAnswer + '！刚才误下了 ' + userAnswer + '，记住房子的两只真眼与分断要领！',
        content: '标准着手：【' + correctAnswer + '】。刚才落在了 ' + userAnswer + '，理清了气与棋形，棋力大增！',
        encouragement: '攻克了一个死活弱点，向小棋圣更进一步！'
      }
    ];
  }

  public static generateVariationQuiz(mistake: MistakeRecord): AiVariationQuiz {
    const { questionPrompt, correctAnswer } = mistake;
    return {
      id: 'var_' + Date.now(),
      subjectId: 'go',
      prompt: '【棋形手筋变式】' + questionPrompt + '，黑先第一步应当落在哪里？',
      options: [
        { id: 'opt_a', text: correctAnswer || '关键交叉点', subText: '正解手筋' },
        { id: 'opt_b', text: '外侧缓着', subText: '气紧盲区' },
        { id: 'opt_c', text: '错误断点', subText: '自紧其气' },
        { id: 'opt_d', text: '无效挡角', subText: '脱离主战场' }
      ].sort(() => Math.random() - 0.5),
      correctId: correctAnswer || '关键交叉点',
      hint: '回忆真眼与做活要诀，抢占行棋要点。',
      explanation: '正解着手为【' + correctAnswer + '】。在实战中要时刻关注己方棋子的气与眼位！'
    };
  }

  public static generateDailyParentReport(
    dateStr: string,
    completedLessonsCount: number,
    mistakes: MistakeRecord[],
    studyMinutes = 20
  ): DailyLearningReport {
    const totalMinutes = Math.max(10, studyMinutes);
    const resolvedCount = mistakes.filter(m => m.resolved).length;
    const weakPoints = mistakes.filter(m => !m.resolved).map(m => m.topic || '数气与死活');
    const masteredPoints = mistakes.filter(m => m.resolved).map(m => m.topic || '两眼做活');

    const advice = weakPoints.length > 0
      ? '今天宝贝在【' + weakPoints[0] + '】上偶有疏漏，已通过 AI 渐进式提示完成订正。建议明天继续挑战死活题巩固棋感！'
      : '宝贝今天表现极佳，所有对弈与闯关全部顺利通过！保持专注与探索兴趣！';

    return {
      date: dateStr,
      totalMinutes,
      subjectMinutes: {
        go: totalMinutes
      },
      completedLessons: completedLessonsCount,
      masteredKnowledgePoints: Array.from(new Set(masteredPoints)).slice(0, 4),
      weakKnowledgePoints: Array.from(new Set(weakPoints)).slice(0, 3),
      mistakesCount: mistakes.length,
      resolvedMistakesCount: resolvedCount,
      parentAdvice: advice,
      tomorrowRecommendations: [
        '在每日死活题库中攻克 2 道死活题',
        '与萌宠 AI 完成 1 局对弈',
        '在错题本中复习攻克 1 处死活弱点'
      ]
    };
  }
}


