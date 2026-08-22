<script setup lang="ts">
import { ref, computed, nextTick, watch, watchEffect, onMounted } from 'vue';
import { useAiTutorStore } from '../../stores/useAiTutorStore';
import { useUserStore } from '../../stores/useUserStore';
import { sound } from '../../utils/sound';
import { speakText, stopSpeech } from '../../utils/speech';
import { showAlert } from '../../utils/alert';
import {
  startSpeechRecognition,
  stopSpeechRecognition,
  isListening,
  transcriptText
} from '../../utils/speechRecognition';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  MessageCircle,
  Dices,
  Settings,
  X,
  Volume2,
  Send,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Lightbulb,
  RefreshCw,
  Award,
  Mic,
  Eye,
  EyeOff
} from 'lucide-vue-next';

const tutorStore = useAiTutorStore();
const userStore = useUserStore();

const userInput = ref('');
const chatScrollRef = ref<HTMLElement | null>(null);
const selectedVariationOption = ref<string | null>(null);
const variationResult = ref<'correct' | 'wrong' | null>(null);
const isMascotHovered = ref(false);
const showApiKey = ref(false);
const isSavingConfig = ref(false);

const subjectName = computed(() => {
  const s = tutorStore.currentContext?.subjectId;
  if (s === 'go') return '围棋';
  if (s === 'math') return '数学';
  if (s === 'chinese') return '语文';
  if (s === 'english') return '英语';
  return '全科学堂';
});

const subjectIcon = computed(() => {
  const s = tutorStore.currentContext?.subjectId;
  if (s === 'go') return '♟️';
  if (s === 'math') return '🔢';
  if (s === 'chinese') return '🏮';
  if (s === 'english') return '🔤';
  return '📚';
});

// 少儿免打字场景化快捷提问卡片
const kidQuickCards = computed(() => {
  const s = tutorStore.currentContext?.subjectId;
  if (s === 'math') {
    return [
      { text: '这道算式怎么算呀？', icon: '💡' },
      { text: '为什么这里要进位/退位？', icon: '🔍' },
      { text: '用吃苹果做个比喻吧！', icon: '🍎' },
      { text: '有什么好记的速算口诀吗？', icon: '🎵' },
      { text: '小诺快读这道题给我听！', icon: '🗣️' },
      { text: '小诺夸夸我，给我加加油！', icon: '🌟' }
    ];
  }
  if (s === 'go') {
    return [
      { text: '这步棋应该下在哪里呀？', icon: '💡' },
      { text: '我的棋子还剩几口气？', icon: '🌬️' },
      { text: '什么是真眼和假眼呀？', icon: '👁️' },
      { text: '对方叫吃我该怎么逃跑？', icon: '🏃' },
      { text: '这道死活题有什么要诀？', icon: '📜' },
      { text: '小诺夸夸我，给我加加油！', icon: '🌟' }
    ];
  }
  if (s === 'chinese') {
    return [
      { text: '这个字怎么读、怎么写？', icon: '✍️' },
      { text: '有什么好记的笔顺口诀吗？', icon: '💡' },
      { text: '这个字的偏旁代表什么？', icon: '🔍' },
      { text: '能把这首诗读给我听听吗？', icon: '🗣️' },
      { text: '小诺夸夸我，给我加加油！', icon: '🌟' }
    ];
  }
  return [
    { text: '这个单词怎么发音呀？', icon: '🔊' },
    { text: '这个字母组合怎么拼读？', icon: '🔤' },
    { text: '能读一遍例句给我听吗？', icon: '🗣️' },
    { text: '小诺夸夸我，给我加加油！', icon: '🌟' }
  ];
});

function scrollToBottom() {
  nextTick(() => {
    if (chatScrollRef.value) {
      chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
    }
  });
}

watch(
  () => tutorStore.chatMessages.length,
  () => {
    scrollToBottom();
  }
);

watch(
  () => tutorStore.activeTab,
  () => {
    tutorStore.ensureContext();
    if (tutorStore.activeTab === 'chat') {
      scrollToBottom();
    }
  }
);

watchEffect(() => {
  if (!tutorStore.config.endpoint || tutorStore.config.endpoint.includes('api.openai.com')) {
    tutorStore.config.endpoint = 'https://api.deepseek.com/v1/chat/completions';
  }
  if (!tutorStore.config.model || tutorStore.config.model === 'gpt-4o-mini' || !tutorStore.config.model.trim()) {
    tutorStore.config.model = 'deepseek-v4-flash';
  }
});

onMounted(() => {
  tutorStore.ensureContext();
});

async function handleSendMessage(text?: string) {
  const content = text || userInput.value;
  if (!content || !content.trim()) return;
  userInput.value = '';
  await tutorStore.sendUserMessage(content);
  scrollToBottom();
}

function toggleVoiceInput() {
  sound.playButtonSound();
  if (isListening.value) {
    stopSpeechRecognition();
  } else {
    stopSpeech();
    startSpeechRecognition(
      (text, isFinal) => {
        userInput.value = text;
        if (isFinal && text.trim()) {
          setTimeout(() => {
            handleSendMessage(text);
          }, 400);
        }
      },
      () => {
        if (userInput.value.trim()) {
          handleSendMessage(userInput.value);
        }
      },
      (errMsg) => {
        showAlert({
          title: '语音识别提示 🎤',
          message: errMsg || '手机浏览器网页语音功能受限。您可以直接点击下方的快捷提问卡片，或使用手机键盘上的麦克风直接语音转文字哦！',
          type: 'info'
        });
      }
    );
  }
}

function handleInputFocus() {
  setTimeout(() => {
    scrollToBottom();
  }, 250);
}

function handleChooseVariationOption(optionId: string) {
  tutorStore.ensureContext();
  if (!tutorStore.variationQuiz || variationResult.value === 'correct') return;
  selectedVariationOption.value = optionId;
  if (optionId === tutorStore.variationQuiz.correctId) {
    variationResult.value = 'correct';
    sound.playWinSound();
    userStore.addCoins(10, '变式题挑战成功', '🌟');
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
  } else {
    variationResult.value = 'wrong';
    sound.playErrorSound();
  }
}

function refreshVariation() {
  selectedVariationOption.value = null;
  variationResult.value = null;
  tutorStore.ensureContext();
  if (tutorStore.currentContext) {
    tutorStore.setContext(tutorStore.currentContext);
  }
}

function readMessageText(text: string) {
  sound.playButtonSound();
  speakText(text);
}

async function handleSaveConfig() {
  isSavingConfig.value = true;
  tutorStore.saveConfig({
    mode: 'custom_api',
    endpoint: tutorStore.config.endpoint,
    apiKey: tutorStore.config.apiKey,
    model: tutorStore.config.model
  });

  if (userStore.isLoggedIn) {
    const ok = await userStore.syncToCloudNow();
    isSavingConfig.value = false;
    if (ok) {
      sound.playWinSound();
      showAlert({
        title: '云端同步成功 ☁️',
        message: '大模型配置与 API Key 已成功保存，并实时同步至您的家长云端账号！在手机、平板等任意设备登录均会自动生效。',
        type: 'success'
      });
    } else {
      showAlert({
        title: '已保存至本地 💾',
        message: '大模型配置已成功保存至当前浏览器（刷新不会丢失）。云端同步遇到微小网络波动：' + (userStore.syncError || '稍后会自动重试'),
        type: 'info'
      });
    }
  } else {
    isSavingConfig.value = false;
    sound.playWinSound();
    showAlert({
      title: '已保存至本地 💾',
      message: '大模型配置与 API Key 已成功保存于当前浏览器，刷新页面不会丢失！\n\n💡 提示：登录家长账号后可自动多端云同步，换设备免重复输入。',
      type: 'info'
    });
  }
}
</script>

<template>
  <!-- 1. 悬浮伴学助教按钮 (Floating Mascot Button) -->
  <div
    v-if="!tutorStore.isOpen"
    class="fixed bottom-20 right-3.5 md:bottom-24 md:right-8 z-40 flex items-center group cursor-pointer select-none"
    @mouseenter="isMascotHovered = true"
    @mouseleave="isMascotHovered = false"
    @click="tutorStore.openTutor('hints')"
  >
    <!-- 待机亲切气泡 -->
    <div
      class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 mr-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-amber-200 text-xs font-bold text-amber-900 animate-bounce duration-1000"
    >
      <Lightbulb class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
      <span>有疑问？点我问小诺！</span>
    </div>

    <!-- 萌宠呼吸球 -->
    <div
      class="relative w-13 h-13 md:w-15 md:h-15 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 p-0.5 shadow-xl transition-transform transform group-hover:scale-110 active:scale-95 border-2 border-white"
    >
      <div class="w-full h-full rounded-full bg-amber-50 flex items-center justify-center text-2xl md:text-3xl relative overflow-hidden shadow-inner">
        <span>🐼</span>
        <div class="absolute inset-0 bg-amber-300/20 rounded-full animate-ping opacity-75 pointer-events-none"></div>
      </div>
      <div class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black shadow">
        AI
      </div>
    </div>
  </div>

  <!-- 2. 小诺 AI 伴学导师全局对话弹窗 (Modal / Bottom Sheet on Mobile) -->
  <div
    v-if="tutorStore.isOpen"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    @click="tutorStore.closeTutor()"
  >
    <div
      class="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-amber-200 flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden animate-pop-in"
      @click.stop
    >
      <!-- 🌟 Header 顶部栏 (精致清爽) -->
      <div class="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 px-4 py-3 flex items-center justify-between shadow-sm relative text-white flex-shrink-0">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-white/95 shadow-sm flex items-center justify-center text-2xl border border-amber-200 flex-shrink-0">
            🐼
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h3 class="font-black text-white text-base tracking-wide drop-shadow-2xs">小诺 AI 伴学导师</h3>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white backdrop-blur-xs border border-white/30">
                {{ subjectIcon }} {{ subjectName }}
              </span>
            </div>
            <p class="text-[11px] text-amber-100 font-medium truncate max-w-[240px] sm:max-w-xs mt-0.5">
              {{ tutorStore.currentContext?.knowledgePointTitle || tutorStore.currentContext?.lessonTitle || '启发式思维点拨 · 语音伴读' }}
            </p>
          </div>
        </div>

        <button
          @click="tutorStore.closeTutor()"
          class="w-8 h-8 rounded-full bg-black/15 hover:bg-black/25 text-white flex items-center justify-center transition active:scale-90 flex-shrink-0 cursor-pointer"
          title="关闭"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 📑 功能分段标签栏 (Segmented Capsule Tabs) -->
      <div class="p-2 bg-amber-50/60 border-b border-amber-100 flex-shrink-0 select-none">
        <div class="grid grid-cols-4 gap-1 bg-amber-100/60 p-1 rounded-2xl">
          <button
            @click="tutorStore.setTab('hints')"
            :class="[
              'py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer',
              tutorStore.activeTab === 'hints'
                ? 'bg-white text-amber-900 shadow-sm font-black'
                : 'text-amber-800/70 hover:text-amber-900 hover:bg-white/40'
            ]"
          >
            <Lightbulb class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>梯度点拨</span>
          </button>

          <button
            @click="tutorStore.setTab('chat')"
            :class="[
              'py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer',
              tutorStore.activeTab === 'chat'
                ? 'bg-white text-amber-900 shadow-sm font-black'
                : 'text-amber-800/70 hover:text-amber-900 hover:bg-white/40'
            ]"
          >
            <MessageCircle class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span>问问小诺</span>
          </button>

          <button
            @click="tutorStore.setTab('variation')"
            :class="[
              'py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer',
              tutorStore.activeTab === 'variation'
                ? 'bg-white text-amber-900 shadow-sm font-black'
                : 'text-amber-800/70 hover:text-amber-900 hover:bg-white/40'
            ]"
          >
            <Dices class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>举一反三</span>
          </button>

          <button
            @click="tutorStore.setTab('settings')"
            :class="[
              'py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer',
              tutorStore.activeTab === 'settings'
                ? 'bg-white text-amber-900 shadow-sm font-black'
                : 'text-amber-800/70 hover:text-amber-900 hover:bg-white/40'
            ]"
          >
            <Settings class="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span>设置</span>
          </button>
        </div>
      </div>

      <!-- 📖 弹窗 Body 内容区域 (响应式视口适配) -->
      <div class="flex-1 overflow-y-auto p-3.5 sm:p-4 bg-[#FAF8F5] space-y-3 min-h-0">
        
        <!-- Tab 1: 🌟 梯度点拨 (3步渐进式启发) -->
        <div v-if="tutorStore.activeTab === 'hints'" class="space-y-3">
          
          <!-- 题目与背景回顾栏 -->
          <div class="bg-white rounded-2xl p-3 border border-amber-200/80 flex items-start gap-2.5 shadow-2xs">
            <div class="p-1.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0 mt-0.5">
              <BookOpen class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[11px] font-bold text-amber-700">当前探究点：</div>
              <div class="text-xs sm:text-sm font-black text-gray-900 mt-0.5 break-words leading-snug">
                {{ tutorStore.currentContext?.questionPrompt || '核心知识点思维探究' }}
              </div>
            </div>
          </div>

          <!-- 3 步梯度胶囊切换器 -->
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="step in [1, 2, 3]"
              :key="step"
              @click="tutorStore.setHintStep(step as 1 | 2 | 3)"
              :class="[
                'py-2 px-2 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border',
                tutorStore.currentHintStep === step
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
              ]"
            >
              <span>{{ step === 1 ? '💡 1.思路' : step === 2 ? '🔍 2.关键' : '🎯 3.详解' }}</span>
            </button>
          </div>

          <!-- 提示卡片内容 -->
          <div class="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-sm space-y-3 text-left">
            <!-- 头部：标题与一键朗读 -->
            <div class="flex items-center justify-between gap-2">
              <div class="font-black text-amber-950 text-sm sm:text-base flex items-center gap-1.5 truncate">
                <Sparkles class="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span class="truncate">{{ tutorStore.currentHint?.title || '小诺伴学点拨' }}</span>
              </div>
              <button
                @click="tutorStore.readCurrentHint()"
                class="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full text-xs font-black transition active:scale-95 flex-shrink-0 cursor-pointer"
              >
                <Volume2 class="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>点读伴读</span>
              </button>
            </div>

            <!-- 小诺拟人化启发语录 -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl p-3.5 border border-amber-100/80 text-amber-950 text-xs sm:text-sm font-bold leading-relaxed shadow-2xs">
              🗣️ {{ tutorStore.currentHint?.speechText || '跟着小诺一起动脑筋，先看清规则与步骤！' }}
            </div>

            <!-- 详细引导拆解 -->
            <div
              v-if="tutorStore.currentHint?.content && tutorStore.currentHint.content !== tutorStore.currentHint.speechText"
              class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line bg-gray-50/70 p-3 rounded-2xl border border-gray-100"
            >
              {{ tutorStore.currentHint.content }}
            </div>

            <!-- 底部鼓励小徽章 -->
            <div class="flex items-center gap-1.5 pt-1 text-xs font-bold text-emerald-600">
              <Award class="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{{ tutorStore.currentHint?.encouragement || '动动脑筋，你一定可以掌握！' }}</span>
            </div>
          </div>
        </div>

        <!-- Tab 2: 💬 问问小诺 (AI 问答 + 移动端自适应键盘防挤压) -->
        <div v-if="tutorStore.activeTab === 'chat'" class="flex flex-col h-[55vh] sm:h-[400px] max-h-[500px] min-h-[220px]">
          <!-- 聊天消息流 (支持自适应收缩) -->
          <div ref="chatScrollRef" class="flex-1 overflow-y-auto min-h-0 space-y-2.5 pr-1 pb-2">
            <div
              v-for="msg in tutorStore.chatMessages"
              :key="msg.id"
              :class="[
                'flex gap-2 max-w-[92%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              ]"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 shadow-2xs',
                  msg.role === 'user' ? 'bg-amber-500 text-white' : 'bg-amber-100 border border-amber-300'
                ]"
              >
                {{ msg.role === 'user' ? '👶' : '🐼' }}
              </div>
              <div
                :class="[
                  'p-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-2xs whitespace-pre-line break-words',
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-none'
                    : 'bg-white border border-amber-200/80 text-gray-800 rounded-tl-none'
                ]"
              >
                <div>{{ msg.text }}</div>
                
                <button
                  v-if="msg.role === 'assistant'"
                  @click="readMessageText(msg.text)"
                  class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-[10px] font-bold text-amber-800 transition active:scale-95 cursor-pointer"
                  title="朗读"
                >
                  <Volume2 class="w-3 h-3 text-amber-600" />
                  <span>读给我听 🔊</span>
                </button>
              </div>
            </div>

            <!-- 麦克风录音中的波形提示 -->
            <div v-if="isListening" class="bg-amber-100 border-2 border-amber-400 p-3 rounded-2xl animate-pulse flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center animate-ping flex-shrink-0">
                <Mic class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="text-xs font-black text-amber-900">🎤 小诺正在认真听你说话...</div>
                <div class="text-xs text-amber-800 font-medium truncate">
                  {{ transcriptText || '说完了小诺马上回答你哦！' }}
                </div>
              </div>
            </div>

            <!-- AI 思考中动画 -->
            <div v-if="tutorStore.isAiThinking" class="flex gap-2 mr-auto max-w-[85%] items-center">
              <div class="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-base flex-shrink-0">
                🐼
              </div>
              <div class="bg-white border border-amber-200 rounded-2xl rounded-tl-none p-3 shadow-2xs text-xs text-amber-700 flex items-center gap-1.5">
                <RefreshCw class="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>小诺正在动脑筋组织语言中...</span>
              </div>
            </div>
          </div>

          <!-- 免打字一键快捷提问卡片 -->
          <div class="py-1 border-t border-amber-100/80 flex-shrink-0">
            <div class="text-[10px] font-bold text-amber-800 mb-1 flex items-center gap-1">
              <span>👉 快捷提问（点一下直接问）：</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-1">
              <button
                v-for="(card, idx) in kidQuickCards"
                :key="idx"
                @click="handleSendMessage(card.text)"
                class="p-1.5 px-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-left font-bold text-[11px] text-amber-950 flex items-center gap-1.5 transition active:scale-95 shadow-2xs truncate cursor-pointer"
              >
                <span class="text-xs flex-shrink-0">{{ card.icon }}</span>
                <span class="truncate">{{ card.text }}</span>
              </button>
            </div>
          </div>

          <!-- 底部输入与语音说话按钮 -->
          <div class="flex items-center gap-1.5 pt-1.5 border-t border-gray-100 flex-shrink-0">
            <button
              @click="toggleVoiceInput"
              :class="[
                'px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1 shadow-xs transition active:scale-95 flex-shrink-0 cursor-pointer',
                isListening
                  ? 'bg-red-500 text-white animate-bounce'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
              ]"
              title="语音说话"
            >
              <Mic :class="['w-3.5 h-3.5', isListening ? 'animate-pulse' : '']" />
              <span>{{ isListening ? '正在听...' : '语音' }}</span>
            </button>

            <input
              v-model="userInput"
              @focus="handleInputFocus"
              @keyup.enter="handleSendMessage()"
              placeholder="也可以输入提问内容..."
              class="flex-1 px-3 py-2 rounded-xl border border-amber-200 focus:border-amber-500 focus:outline-none text-xs sm:text-sm bg-white"
            />
            
            <button
              @click="handleSendMessage()"
              :disabled="!userInput.trim() || tutorStore.isAiThinking"
              class="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow-2xs transition active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Send class="w-3.5 h-3.5" />
              <span>发送</span>
            </button>
          </div>
        </div>

        <!-- Tab 3: 🎲 举一反三 (变式挑战) -->
        <div v-if="tutorStore.activeTab === 'variation'" class="space-y-3">
          <div v-if="tutorStore.variationQuiz" class="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-sm space-y-3.5 text-left">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Dices class="w-4 h-4" />
                </div>
                <span class="font-extrabold text-gray-900 text-sm sm:text-base">智能变式巩固挑战</span>
              </div>
              <button
                @click="refreshVariation()"
                class="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <RefreshCw class="w-3.5 h-3.5" />
                <span>换一题</span>
              </button>
            </div>

            <!-- 变式题干 -->
            <div class="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 text-sm font-black text-emerald-950 text-center leading-relaxed">
              {{ tutorStore.variationQuiz.prompt }}
            </div>

            <!-- 选项列表 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="opt in tutorStore.variationQuiz.options"
                :key="opt.id"
                @click="handleChooseVariationOption(opt.id)"
                :class="[
                  'p-3 rounded-2xl font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-between text-left cursor-pointer',
                  selectedVariationOption === opt.id
                    ? opt.id === tutorStore.variationQuiz.correctId
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-rose-500 text-white border-rose-600'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                ]"
              >
                <span>{{ opt.text }}</span>
                <span v-if="selectedVariationOption === opt.id" class="text-xs">
                  {{ opt.id === tutorStore.variationQuiz.correctId ? '✅ 正确' : '❌ 再想想' }}
                </span>
              </button>
            </div>

            <!-- 结果与解析 -->
            <div
              v-if="variationResult === 'correct'"
              class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1"
            >
              <div class="font-extrabold flex items-center gap-1 text-emerald-700">
                <CheckCircle2 class="w-4 h-4" />
                <span>太棒啦！完全做对！获得 +10 金币 🪙</span>
              </div>
              <div class="leading-relaxed">{{ tutorStore.variationQuiz.explanation }}</div>
            </div>

            <div
              v-else-if="variationResult === 'wrong'"
              class="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-1.5"
            >
              <AlertCircle class="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>小诺提示：{{ tutorStore.variationQuiz.hint }}</span>
            </div>
          </div>
        </div>

        <!-- Tab 4: ⚙️ 助教设置 (安全与引擎配置) -->
        <div v-if="tutorStore.activeTab === 'settings'" class="space-y-3 text-left">
          <div class="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-3.5">
            <h4 class="font-extrabold text-gray-900 text-sm sm:text-base">AI 伴学引擎模式</h4>

            <!-- 引擎模式选择 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                @click="tutorStore.saveConfig({ mode: 'builtin' })"
                :class="[
                  'p-2.5 rounded-2xl border-2 text-left transition cursor-pointer',
                  tutorStore.config.mode === 'builtin'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-gray-200 hover:border-amber-200'
                ]"
              >
                <div class="text-xs font-black">🟢 本地启发引擎</div>
                <div class="text-[10px] text-gray-500 mt-0.5">离线极速 · 零门槛</div>
              </button>

              <button
                @click="() => {
                  if (!tutorStore.config.endpoint || tutorStore.config.endpoint.includes('api.openai.com')) {
                    tutorStore.config.endpoint = 'https://api.deepseek.com/v1/chat/completions';
                  }
                  if (!tutorStore.config.model || tutorStore.config.model === 'gpt-4o-mini') {
                    tutorStore.config.model = 'deepseek-v4-flash';
                  }
                  tutorStore.saveConfig({ mode: 'custom_api' });
                }"
                :class="[
                  'p-2.5 rounded-2xl border-2 text-left transition cursor-pointer',
                  tutorStore.config.mode === 'custom_api'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-gray-200 hover:border-amber-200'
                ]"
              >
                <div class="text-xs font-black">🟣 自定义大模型</div>
                <div class="text-[10px] text-gray-500 mt-0.5">DeepSeek / OpenAI</div>
              </button>

              <button
                @click="tutorStore.saveConfig({ mode: 'cloud' })"
                :class="[
                  'p-2.5 rounded-2xl border-2 text-left transition cursor-pointer',
                  tutorStore.config.mode === 'cloud'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-gray-200 hover:border-amber-200'
                ]"
              >
                <div class="text-xs font-black">🔵 Supabase 云端</div>
                <div class="text-[10px] text-gray-500 mt-0.5">Edge Functions</div>
              </button>
            </div>

            <!-- 自定义 API 选项 -->
            <div v-if="tutorStore.config.mode === 'custom_api'" class="space-y-2.5 pt-2 border-t border-gray-100">
              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">API Endpoint (接口地址)</label>
                <input
                  v-model="tutorStore.config.endpoint"
                  placeholder="https://api.deepseek.com/v1/chat/completions"
                  class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:border-amber-500 focus:outline-none bg-gray-50/50"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">API Key</label>
                <div class="relative">
                  <input
                    v-model="tutorStore.config.apiKey"
                    :type="showApiKey ? 'text' : 'password'"
                    placeholder="sk-..."
                    class="w-full pl-3 pr-9 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:border-amber-500 focus:outline-none bg-gray-50/50"
                  />
                  <button
                    type="button"
                    @click="showApiKey = !showApiKey"
                    class="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <Eye v-if="!showApiKey" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>

                <div class="mt-1.5 p-2 rounded-xl text-[10px] leading-relaxed flex items-start gap-1.5" :class="userStore.isLoggedIn ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-amber-50 border border-amber-200 text-amber-900'">
                  <span class="flex-shrink-0">{{ userStore.isLoggedIn ? '☁️' : '💡' }}</span>
                  <span>{{ userStore.isLoggedIn ? 'API Key 已安全保存于本地与云端，刷新或换设备均无需重新输入！' : 'API Key 已自动保存于当前浏览器，刷新页面不会丢失。登录家长账号可跨设备同步！' }}</span>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">模型名称 (Model)</label>
                <input
                  v-model="tutorStore.config.model"
                  placeholder="deepseek-v4-flash"
                  class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:border-amber-500 focus:outline-none bg-gray-50/50"
                />
              </div>

              <button
                type="button"
                @click="handleSaveConfig"
                :disabled="isSavingConfig"
                class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 disabled:opacity-60 text-white rounded-xl font-black text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw v-if="isSavingConfig" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isSavingConfig ? '正在保存并同步...' : '💾 保存并立即生效' }}</span>
              </button>
            </div>

            <!-- 语音朗读设置 -->
            <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-gray-800">自动伴读朗读</div>
                <div class="text-[10px] text-gray-500">点开提示或回答时自动用阳光童声朗读</div>
              </div>
              <input
                type="checkbox"
                v-model="tutorStore.config.autoSpeech"
                class="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.18s ease-out;
}
.animate-pop-in {
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>

