import { defineStore } from 'pinia';
import {
  AiTutorService,
  CustomOpenAIProvider,
  LocalRuleAIProvider,
  SupabaseEdgeAIProvider,
  KID_SAFE_AI_FALLBACK_TEXT,
  type AiTutorStepHint,
  type AiVariationQuiz,
  type AiTutorStudentContext
} from '../services/aiTutorService';
import type { SubjectId } from '../types/curriculum';
import { useUserStore } from './useUserStore';
import { sound } from '../utils/sound';
import { speakText, stopSpeech } from '../utils/speech';
import { toSafeErrorDigest } from '../utils/safeError';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time: number;
}

export interface AiTutorConfig {
  mode: 'builtin' | 'custom_api' | 'cloud';
  endpoint: string;
  apiKey: string;
  model: string;
  autoSpeech: boolean;
}

/**
 * 根据当前棋艺项目生成针对性的默认知识点探究上下文
 */
export function getDefaultContextForSubject(subjectId: SubjectId = 'go'): AiTutorStudentContext {

  if (subjectId === 'checkers') {
    return {
      subjectId: 'checkers',
      questionPrompt: '六角跳棋：借助相邻棋子连续跳跃，争先占领对角目标阵地！',
      userAnswer: '未作答',
      correctAnswer: '搭建连续跳跃桥梁',
      knowledgePointTitle: '跳棋跳跃与搭桥手筋',
      lessonTitle: '跳棋步法策略',
      errorReason: '前方有相邻棋子且其正后方为空位时，可以直接跳过去！提前搭好“连环跳桥”可以一步千里。'
    };
  }
  if (subjectId === 'gomoku') {
    return {
      subjectId: 'gomoku',
      questionPrompt: '欢乐五子棋：横、竖、斜任意方向连成五子即获胜，注意防守活三和冲四！',
      userAnswer: '未作答',
      correctAnswer: '先手抢占双三或活四',
      knowledgePointTitle: '五子棋连珠攻防',
      lessonTitle: '五子棋制胜要诀',
      errorReason: '在己方做活三的同时，一定要时刻盯紧对方的连子，形成“四三胜”或“双三胜”锁定胜局。'
    };
  }
  // 🌟 默认围棋主线上下文 (一诺弈学核心学科)
  return {
    subjectId: 'go',
    questionPrompt: '1-1 棋盘与黑白小精灵：围棋棋子落在横线与竖线的交叉点上！',
    userAnswer: '未作答',
    correctAnswer: '落在交叉点上，黑先白后',
    knowledgePointTitle: '棋盘与生命之气',
    lessonTitle: '1-1 棋盘与黑白小精灵',
    errorReason: '围棋棋子不下在方格子里，而是落在“横线与竖线的交叉点”上！黑先白后，一人下一颗。'
  };
}

export function detectActiveSubjectFromRoute(): SubjectId {
  if (typeof window === 'undefined') return 'go';
  const path = window.location.pathname || '';
  if (path.includes('/checkers')) return 'checkers';
  if (path.includes('/gomoku')) return 'gomoku';
  return 'go';
}

const DEFAULT_FALLBACK_CONTEXT: AiTutorStudentContext = getDefaultContextForSubject('go');

export const AI_TUTOR_PERSIST_KEY = 'yinuo_go_ai_tutor_v3';

/**
 * 允许落盘的字段白名单。
 * apiKey 永远不在其中：第三方模型密钥只存活于当前会话的内存。
 */
export const AI_TUTOR_PERSISTED_FIELDS = [
  'config.mode',
  'config.endpoint',
  'config.model',
  'config.autoSpeech'
] as const;

/** 历史版本用过的持久化 key，升级路径上一并清理 */
const LEGACY_PERSIST_KEYS = [AI_TUTOR_PERSIST_KEY, 'yinuo_go_ai_tutor_v2', 'yinuo_go_ai_tutor'];

/**
 * 清除浏览器存储里历史版本落盘的第三方密钥。
 *
 * pick 只能保证「今后不再写入」，已经存在于 localStorage 的旧 JSON 仍带着 apiKey，
 * 必须主动改写掉，否则密钥会一直躺在用户磁盘上。
 */
export function purgeLegacyPersistedApiKey(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  for (const storageKey of LEGACY_PERSIST_KEYS) {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(storageKey);
    } catch {
      return;
    }
    if (!raw || !raw.includes('apiKey')) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.config && typeof parsed.config === 'object' && 'apiKey' in parsed.config) {
        delete parsed.config.apiKey;
        window.localStorage.setItem(storageKey, JSON.stringify(parsed));
      } else if ('apiKey' in (parsed || {})) {
        delete parsed.apiKey;
        window.localStorage.setItem(storageKey, JSON.stringify(parsed));
      }
    } catch {
      // 旧数据结构无法解析时直接丢弃整条，宁可丢配置也不留密钥
      try {
        window.localStorage.removeItem(storageKey);
      } catch {}
    }
  }

  // sessionStorage 从来不是设计中的存放位置，出现即视为历史脏数据
  try {
    for (const storageKey of LEGACY_PERSIST_KEYS) {
      window.sessionStorage?.removeItem(storageKey);
    }
  } catch {}
}

export const useAiTutorStore = defineStore('aiTutorStore', {
  state: () => ({
    isOpen: false,
    activeTab: 'hints' as 'hints' | 'chat' | 'variation' | 'settings',
    currentContext: DEFAULT_FALLBACK_CONTEXT as AiTutorStudentContext | null,
    hints: [] as AiTutorStepHint[],
    currentHintStep: 1 as 1 | 2 | 3,
    variationQuiz: null as AiVariationQuiz | null,
    chatMessages: [
      {
        id: 'welcome_1',
        role: 'assistant',
        text: '嗨！我是你的 AI 伴学小导师「小诺」🐼！在下棋、做死活题或棋艺对弈时遇到疑问，随时都可以问我哦！',
        time: Date.now()
      }
    ] as ChatMessage[],
    isAiThinking: false,
    config: {
      // builtin 对应离线本地规则引擎（local-rule）：默认不把儿童提问送出设备
      mode: 'builtin' as 'builtin' | 'custom_api' | 'cloud',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      apiKey: '',
      model: 'deepseek-v4-flash',
      // 自动朗读默认关闭：默认开启会在未经家长确认的情况下直接出声
      autoSpeech: false
    } as AiTutorConfig
  }),

  getters: {
    currentHint(state): AiTutorStepHint {
      const list = state.hints && state.hints.length > 0 ? state.hints : AiTutorService.getProgressiveHints({
        id: 'ctx_fallback',
        subjectId: state.currentContext?.subjectId || 'go',
        topic: state.currentContext?.knowledgePointTitle || '数气与棋形',
        knowledgePointTitle: state.currentContext?.knowledgePointTitle || '数气与棋形',
        questionPrompt: state.currentContext?.questionPrompt || '棋盘与生命之气',
        userAnswer: state.currentContext?.userAnswer || '未作答',
        correctAnswer: state.currentContext?.correctAnswer || '正解着手',
        errorCategory: 'concept',
        errorReason: state.currentContext?.errorReason || '',
        createdAt: Date.now(),
        resolved: false
      });
      return list.find(h => h.step === state.currentHintStep) || list[0];
    }
  },

  actions: {
    initProvider() {
      if (!this.config.endpoint || this.config.endpoint.includes('api.openai.com')) {
        this.config.endpoint = 'https://api.deepseek.com/v1/chat/completions';
      }
      if (!this.config.model || this.config.model === 'gpt-4o-mini') {
        this.config.model = 'deepseek-v4-flash';
      }

      // 默认（含配置缺失、密钥为空、云端不可用）一律回落到离线本地规则引擎 local-rule
      if (this.config.mode === 'custom_api' && this.config.apiKey.trim()) {
        AiTutorService.setProvider(
          new CustomOpenAIProvider(this.config.endpoint, this.config.apiKey, this.config.model)
        );
      } else if (this.config.mode === 'cloud') {
        try {
          AiTutorService.setProvider(new SupabaseEdgeAIProvider());
        } catch {
          AiTutorService.setProvider(new LocalRuleAIProvider());
        }
      } else {
        AiTutorService.setProvider(new LocalRuleAIProvider());
      }
    },

    ensureContext() {
      if (!this.config.endpoint || this.config.endpoint.includes('api.openai.com')) {
        this.config.endpoint = 'https://api.deepseek.com/v1/chat/completions';
      }
      if (!this.config.model || this.config.model === 'gpt-4o-mini') {
        this.config.model = 'deepseek-v4-flash';
      }
      if (!this.currentContext) {
        const detectedSub = detectActiveSubjectFromRoute();
        this.currentContext = getDefaultContextForSubject(detectedSub);
      }
      if (!this.hints || this.hints.length === 0 || !this.variationQuiz) {
        this.setContext(this.currentContext);
      }
    },

    setContext(ctx: AiTutorStudentContext) {
      this.currentContext = ctx;
      const topicName = ctx.knowledgePointTitle || ctx.lessonTitle || '核心要点';
      const guidance = AiTutorService.getProgressiveHints({
        id: 'ctx_' + Date.now(),
        subjectId: ctx.subjectId,
        topic: topicName,
        knowledgePointTitle: topicName,
        questionPrompt: ctx.questionPrompt,
        userAnswer: ctx.userAnswer || '未作答',
        correctAnswer: ctx.correctAnswer || '正解',
        errorCategory: 'concept',
        errorReason: ctx.errorReason || '',
        createdAt: Date.now(),
        resolved: false
      });
      this.hints = guidance;
      this.currentHintStep = 1;
      this.variationQuiz = AiTutorService.generateVariationQuiz({
        id: 'ctx_v_' + Date.now(),
        subjectId: ctx.subjectId,
        topic: topicName,
        knowledgePointTitle: topicName,
        questionPrompt: ctx.questionPrompt,
        userAnswer: ctx.userAnswer || '未作答',
        correctAnswer: ctx.correctAnswer || '正解',
        errorCategory: 'concept',
        errorReason: ctx.errorReason || '',
        createdAt: Date.now(),
        resolved: false
      });
    },

    openTutor(tab: 'hints' | 'chat' | 'variation' | 'settings' = 'hints', ctx?: AiTutorStudentContext) {
      this.initProvider();
      if (ctx) {
        this.setContext(ctx);
      } else {
        const detectedSub = detectActiveSubjectFromRoute();
        if (!this.currentContext || this.currentContext.subjectId !== detectedSub) {
          this.setContext(getDefaultContextForSubject(detectedSub));
        } else {
          this.ensureContext();
        }
      }
      this.activeTab = tab;
      this.isOpen = true;
      sound.playButtonSound();

      if (this.config.autoSpeech && this.currentHint) {
        speakText(this.currentHint.speechText);
      }
    },

    closeTutor() {
      this.isOpen = false;
      stopSpeech();
    },

    setTab(tab: 'hints' | 'chat' | 'variation' | 'settings') {
      if (!this.config.endpoint || this.config.endpoint.includes('api.openai.com')) {
        this.config.endpoint = 'https://api.deepseek.com/v1/chat/completions';
      }
      if (!this.config.model || this.config.model === 'gpt-4o-mini' || !this.config.model.trim()) {
        this.config.model = 'deepseek-v4-flash';
      }
      this.ensureContext();
      this.activeTab = tab;
      sound.playButtonSound();
      stopSpeech();
      if (tab === 'hints' && this.config.autoSpeech && this.currentHint) {
        speakText(this.currentHint.speechText);
      }
    },

    setHintStep(step: 1 | 2 | 3) {
      this.ensureContext();
      this.currentHintStep = step;
      sound.playButtonSound();
      stopSpeech();
      if (this.currentHint) {
        if (this.config.autoSpeech) {
          speakText(this.currentHint.speechText);
        }
      }
    },

    readCurrentHint() {
      this.ensureContext();
      if (this.currentHint) {
        speakText(this.currentHint.speechText + '。' + this.currentHint.content);
      }
    },

    async sendUserMessage(questionText: string) {
      const q = questionText.trim();
      if (!q) return;

      const prevHistory = this.chatMessages
        .filter(m => m.id !== 'welcome_1')
        .map(m => ({ role: m.role, text: m.text }));

      this.chatMessages.push({
        id: 'user_' + Date.now(),
        role: 'user',
        text: q,
        time: Date.now()
      });

      this.isAiThinking = true;
      this.initProvider();

      const ctx = this.currentContext || getDefaultContextForSubject('go');

      try {
        const reply = await AiTutorService.askKidTutor(ctx, q, prevHistory);
        this.chatMessages.push({
          id: 'bot_' + Date.now(),
          role: 'assistant',
          text: reply,
          time: Date.now()
        });
        sound.playStarSound();
        if (this.config.autoSpeech) {
          speakText(reply);
        }
      } catch (err) {
        // 儿童只看到统一兜底文案；原始异常仅在开发环境脱敏后落本地日志
        this.chatMessages.push({
          id: 'bot_' + Date.now(),
          role: 'assistant',
          text: KID_SAFE_AI_FALLBACK_TEXT,
          time: Date.now()
        });
        if (import.meta.env?.DEV) {
          console.warn('[AiTutor Ask Failed]', toSafeErrorDigest(err));
        }
      } finally {
        this.isAiThinking = false;
      }
    },

    saveConfig(cfg: Partial<AiTutorConfig>) {
      this.config = { ...this.config, ...cfg };
      this.initProvider();
      try {
        const userStore = useUserStore();
        if (userStore.isLoggedIn) {
          userStore.touchSave();
        }
      } catch {}
    },

    /**
     * 应用来自云端/外部的配置：只接受非密钥字段。
     *
     * 历史版本曾把 apiKey 写进云端 settings_data，这里必须显式忽略，
     * 否则「不持久化」会被云端恢复链路重新打穿。
     */
    applyRemoteConfig(cfg: Record<string, unknown>) {
      if (!cfg || typeof cfg !== 'object') return;

      if (cfg.mode === 'builtin' || cfg.mode === 'custom_api' || cfg.mode === 'cloud') {
        this.config.mode = cfg.mode;
      }
      if (typeof cfg.endpoint === 'string' && cfg.endpoint.trim()) {
        this.config.endpoint = cfg.endpoint.trim();
      }
      if (typeof cfg.model === 'string' && cfg.model.trim()) {
        this.config.model = cfg.model.trim();
      }
      if (typeof cfg.autoSpeech === 'boolean') {
        this.config.autoSpeech = cfg.autoSpeech;
      }

      this.initProvider();
    },

    /**
     * 清空当前会话内存中的第三方密钥
     */
    clearApiKey() {
      this.config.apiKey = '';
      this.initProvider();
    }
  },

  persist: {
    key: AI_TUTOR_PERSIST_KEY,
    // apiKey 刻意不落盘：第三方模型密钥只在当前会话的内存中存活
    pick: [...AI_TUTOR_PERSISTED_FIELDS],
    afterHydrate(ctx) {
      // 清除历史版本明文写入 localStorage 的密钥（内存 + 已落盘的 JSON 都要清）
      if (ctx.store.config.apiKey) {
        ctx.store.config.apiKey = '';
      }
      purgeLegacyPersistedApiKey();
    }
  }
});


