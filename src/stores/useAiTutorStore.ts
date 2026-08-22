import { defineStore } from 'pinia';
import {
  AiTutorService,
  CustomOpenAIProvider,
  LocalRuleAIProvider,
  SupabaseEdgeAIProvider,
  type AiTutorStepHint,
  type AiVariationQuiz,
  type AiTutorStudentContext
} from '../services/aiTutorService';
import type { SubjectId } from '../types/curriculum';
import { useUserStore } from './useUserStore';
import { sound } from '../utils/sound';
import { speakText, stopSpeech } from '../utils/speech';

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
 * 根据当前所在学科生成针对性的默认知识点探究上下文
 */
export function getDefaultContextForSubject(subjectId: SubjectId = 'go'): AiTutorStudentContext {
  if (subjectId === 'math') {
    return {
      subjectId: 'math',
      questionPrompt: '38 + 47 = ? (两位数进位加法探究)',
      userAnswer: '75',
      correctAnswer: '85',
      knowledgePointTitle: '两位数进位加法',
      lessonTitle: '进位加法巧算',
      errorReason: '个位相加 8 + 7 = 15 满十，向十位进 1，十位计算为 3 + 4 + 1 = 8。'
    };
  }
  if (subjectId === 'chinese') {
    return {
      subjectId: 'chinese',
      questionPrompt: '汉字笔画顺序与间架结构规范探究',
      userAnswer: '未作答',
      correctAnswer: '先横后竖，从上到下',
      knowledgePointTitle: '汉字笔顺规范',
      lessonTitle: '汉字偏旁与笔顺',
      errorReason: '笔顺口诀：先横后竖，先撇后捺，从上到下，从左到右，先中间后两边。'
    };
  }
  if (subjectId === 'english') {
    return {
      subjectId: 'english',
      questionPrompt: 'Phonics 自然拼读发音与音节拼读规律',
      userAnswer: '未作答',
      correctAnswer: '根据发音规律拆分音节',
      knowledgePointTitle: '自然拼读法',
      lessonTitle: '元音与辅音发音',
      errorReason: '注意长短元音区别与自然拼读发音规律，按音节拆分拼读。'
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
  if (path.includes('/subject/math') || path.includes('/drill') || path.includes('/twenty-four') || path.includes('/speed')) {
    return 'math';
  }
  if (path.includes('/subject/chinese') || path.includes('/pinyin') || path.includes('/hanzi') || path.includes('/poetry') || path.includes('/idiom') || path.includes('/riddles')) {
    return 'chinese';
  }
  if (path.includes('/subject/english') || path.includes('/phonics') || path.includes('/flashcards')) {
    return 'english';
  }
  return 'go';
}

const DEFAULT_FALLBACK_CONTEXT: AiTutorStudentContext = getDefaultContextForSubject('go');

if (typeof window !== 'undefined' && window.localStorage) {
  try {
    ['aiTutorStore', 'yinuo_go_ai_tutor', 'yinuo_go_ai_tutor_v2'].forEach(k => {
      const raw = window.localStorage.getItem(k);
      if (raw && (raw.includes('api.openai.com') || raw.includes('gpt-4o-mini'))) {
        window.localStorage.removeItem(k);
      }
    });
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
        text: '嗨！我是你的 AI 伴学小导师「小诺」🐼！遇到不会的题目或者想探究解题思路，随时都可以问我哦！',
        time: Date.now()
      }
    ] as ChatMessage[],
    isAiThinking: false,
    config: {
      mode: 'builtin' as 'builtin' | 'custom_api' | 'cloud',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      apiKey: '',
      model: 'deepseek-v4-flash',
      autoSpeech: true
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
      // 自动修正并确保默认写入 DeepSeek 官方接口规范与模型
      if (!this.config.endpoint || this.config.endpoint.includes('api.openai.com')) {
        this.config.endpoint = 'https://api.deepseek.com/v1/chat/completions';
      }
      if (!this.config.model || this.config.model === 'gpt-4o-mini') {
        this.config.model = 'deepseek-v4-flash';
      }

      if (this.config.mode === 'custom_api' && this.config.apiKey) {
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
        // 如果当前未设置上下文，或当前上下文与当前页面所属学科不一致，自动切换到当前学科的默认知识点
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

      // 提取提问前的历史多轮对话上下文 (最近 6 轮)
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
      } catch (err: any) {
        this.chatMessages.push({
          id: 'bot_' + Date.now(),
          role: 'assistant',
          text: '小诺在努力思考中，遇到了一点小网络问题：' + (err.message || '未知错误') + '。别灰心，我们再试一次！',
          time: Date.now()
        });
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
    }
  },

  persist: {
    key: 'yinuo_go_ai_tutor_v3',
    pick: ['config.mode', 'config.endpoint', 'config.apiKey', 'config.model', 'config.autoSpeech']
  }
});

