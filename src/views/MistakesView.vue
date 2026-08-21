<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { TSUMEGO_PUZZLES, type TsumegoPuzzle } from '../data/tsumegoLibrary';
import { useUserStore } from '../stores/useUserStore';
import { AiTutorService, type AiTutorStepHint, type AiVariationQuiz } from '../services/aiTutorService';
import type { MistakeRecord, SubjectId, DailyLearningReport } from '../types/curriculum';
import {
  playButtonSound,
  playWinSound,
  playErrorSound
} from '../lib/audio';
import { speakText, stopSpeech } from '../utils/speech';
import confetti from 'canvas-confetti';
import {
  BookMarked,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Bot,
  Volume2,
  X,
  FileText,
  Brain
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// Subject Tabs: 'math' | 'chinese' | 'english' | 'go'
const activeSubjectTab = ref<SubjectId>('math');

// Initial mock fallback mistakes to ensure rich interactive demo
const DEFAULT_SAMPLE_MISTAKES: MistakeRecord[] = [
  {
    id: 'sample_m_1',
    subjectId: 'math',
    gradeLevel: 'g2_t1',
    topic: '两位数进位加法',
    knowledgePointTitle: '100以内进位加法（满十进一）',
    questionPrompt: '47 + 38',
    userAnswer: '75',
    correctAnswer: '85',
    errorCategory: 'calculation',
    errorReason: '个位 7+8=15 满十，忘记给十位加上进位的 1，导致十位算成 4+3=7。',
    createdAt: Date.now() - 3600000,
    resolved: false
  },
  {
    id: 'sample_m_2',
    subjectId: 'math',
    gradeLevel: 'g2_t1',
    topic: '两位数退位减法',
    knowledgePointTitle: '100以内退位减法（借一当十）',
    questionPrompt: '72 - 38',
    userAnswer: '44',
    correctAnswer: '34',
    errorCategory: 'calculation',
    errorReason: '个位 2 减 8 不够减向十位借 1，十位 7 变成 6 后未减去被借走的 1。',
    createdAt: Date.now() - 7200000,
    resolved: false
  },
  {
    id: 'sample_c_1',
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    topic: '汉字笔顺规范',
    knowledgePointTitle: '部编版一年级生字「天」笔顺',
    questionPrompt: '生字「天」的正确笔顺',
    userAnswer: '先写撇再写两横',
    correctAnswer: '横、横、撇、捺',
    errorCategory: 'rule',
    errorReason: '汉字笔顺规则「先横后竖，从上到下」，第一笔为短横，第二笔为长横，第三笔撇不可出头。',
    createdAt: Date.now() - 5400000,
    resolved: false
  },
  {
    id: 'sample_e_1',
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    topic: '自然拼读与双写规则',
    knowledgePointTitle: '短元音 /æ/ 与水果单词 Apple',
    questionPrompt: 'Spell the word: 苹果',
    userAnswer: 'Aple',
    correctAnswer: 'Apple',
    errorCategory: 'spelling',
    errorReason: '短元音 /æ/ 后的辅音字母通常需要双写字母 p，拼写为 A-p-p-l-e。',
    createdAt: Date.now() - 1800000,
    resolved: false
  },
  {
    id: 'sample_g_1',
    subjectId: 'go',
    topic: '两眼做活基本要领',
    knowledgePointTitle: '死活城堡：真眼与假眼区分',
    questionPrompt: '白棋逼近时，黑棋如何在角部做活？',
    userAnswer: '在外部随便连一手',
    correctAnswer: '占据眼位做成两只独立真眼',
    errorCategory: 'rule',
    errorReason: '死活要领「两眼活棋，做眼要趁早」，角部只有做出两只互不相通的真眼才不可被提吃。',
    createdAt: Date.now() - 9000000,
    resolved: false
  }
];

// Unified Mistakes List by Subject
const currentSubjectMistakes = computed<MistakeRecord[]>(() => {
  const storeList = userStore.mistakeRecords.filter(m => m.subjectId === activeSubjectTab.value);
  const fallbackList = DEFAULT_SAMPLE_MISTAKES.filter(m => m.subjectId === activeSubjectTab.value);

  const map = new Map<string, MistakeRecord>();
  for (const item of storeList) map.set(item.id, item);
  for (const item of fallbackList) {
    if (!map.has(item.id) && !userStore.mistakeRecords.some(m => m.questionPrompt === item.questionPrompt)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
});

// Go Puzzles
const goMistakesList = computed<TsumegoPuzzle[]>(() => {
  const recordedIds = userStore.mistakes;
  if (recordedIds.length > 0) {
    return TSUMEGO_PUZZLES.filter(p => recordedIds.includes(p.id));
  }
  return TSUMEGO_PUZZLES.slice(3, 8);
});

// AI Step-by-Step Tutor Modal State
const activeTutorMistake = ref<MistakeRecord | null>(null);
const currentStepHintIndex = ref<number>(0);
const tutorHints = ref<AiTutorStepHint[]>([]);
const isAiSpeaking = ref(false);

// AI Variation Quiz Modal State
const activeVariationQuiz = ref<AiVariationQuiz | null>(null);
const selectedVariationOption = ref<string | null>(null);
const isVariationSubmitted = ref(false);

// Parent Daily Report Modal State
const showParentReportModal = ref(false);
const dailyReport = ref<DailyLearningReport | null>(null);

// Open AI Tutor
const openAiTutor = (item: MistakeRecord) => {
  playButtonSound();
  activeTutorMistake.value = item;
  currentStepHintIndex.value = 0;
  tutorHints.value = AiTutorService.getProgressiveHints(item);
  activeVariationQuiz.value = null;
  speakTutorHint(tutorHints.value[0]);
};

const speakTutorHint = (hint: AiTutorStepHint) => {
  if (!hint) return;
  isAiSpeaking.value = true;
  speakText(hint.speechText);
};

const nextTutorStep = () => {
  playButtonSound();
  if (currentStepHintIndex.value < tutorHints.value.length - 1) {
    currentStepHintIndex.value++;
    speakTutorHint(tutorHints.value[currentStepHintIndex.value]);
  }
};

const closeAiTutor = () => {
  stopSpeech();
  activeTutorMistake.value = null;
  currentStepHintIndex.value = 0;
};

// Start Variation Quiz
const startVariationQuiz = () => {
  if (!activeTutorMistake.value) return;
  playButtonSound();
  activeVariationQuiz.value = AiTutorService.generateVariationQuiz(activeTutorMistake.value);
  selectedVariationOption.value = null;
  isVariationSubmitted.value = false;
  speakText('小诺考考你：这是一道同类变式题，举一反三试试看！');
};

// Submit Variation Quiz
const submitVariationQuiz = () => {
  if (!activeVariationQuiz.value || !selectedVariationOption.value || isVariationSubmitted.value) return;
  isVariationSubmitted.value = true;

  const isCorrect = selectedVariationOption.value === activeVariationQuiz.value.correctId;
  if (isCorrect) {
    playWinSound();
    confetti({ particleCount: 80, spread: 70 });
    if (activeTutorMistake.value) {
      userStore.resolveSubjectMistake(activeTutorMistake.value.id);
      activeTutorMistake.value.resolved = true;
    }
    speakText('太聪明啦！变式题完全做对，弱点彻底消灭！');
  } else {
    playErrorSound();
    speakText('还差一点点，看看小诺的解析再试试！');
  }
};

// Open Parent Daily Report
const openDailyParentReport = () => {
  playButtonSound();
  const todayStr = new Date().toLocaleDateString('zh-CN');
  const allMistakes = [...userStore.mistakeRecords, ...DEFAULT_SAMPLE_MISTAKES];
  const resolvedCount = allMistakes.filter(m => m.resolved).length;
  dailyReport.value = AiTutorService.generateDailyParentReport(
    todayStr,
    userStore.solvedPuzzles.length + 3,
    allMistakes,
    resolvedCount
  );
  showParentReportModal.value = true;
};

const goBack = () => {
  playButtonSound();
  router.push('/learn');
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] py-6 px-4 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Breadcrumb & Top Bar -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <button
          @click="goBack"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border border-amber-300 shadow-2xs cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回学堂大厅</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            @click="openDailyParentReport"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <FileText class="w-4 h-4" />
            <span>📊 每日学情报告 (家长端)</span>
          </button>

          <div class="flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-black">
            <BookMarked class="w-4 h-4 text-rose-600" />
            <span>全学科 AI 智能错题本中心</span>
          </div>
        </div>
      </div>

      <!-- Header Hero Banner -->
      <div class="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2 text-center md:text-left">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>AI 启发辅导 · 举一反三变式题 · 攻克领双倍金币</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-cartoon font-bold tracking-wide drop-shadow-sm">
              全学科智能错题辅导中心
            </h1>
            <p class="text-xs sm:text-sm text-white/90 font-medium max-w-xl">
              结合 AI 助教逐步提示，不直接报答案，先启发思考，配合自适应变式题训练彻底消灭知识漏洞！
            </p>
          </div>

          <!-- Reward Box -->
          <div class="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[200px]">
            <div class="text-[11px] font-bold text-white/80">攻克变式题特权</div>
            <div class="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">🪙 双倍金币奖励</div>
            <div class="text-[10px] text-white/70 mt-1">消灭一个弱点，思维能力升一级</div>
          </div>
        </div>
      </div>

      <!-- Subject Tabs Switcher -->
      <div class="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        <button
          v-for="sub in [
            { id: 'math', name: '🔢 数学口算错题', count: currentSubjectMistakes.length },
            { id: 'chinese', name: '🏮 语文生字拼音', count: DEFAULT_SAMPLE_MISTAKES.filter(m => m.subjectId === 'chinese').length },
            { id: 'english', name: '🔤 趣味英语词汇', count: DEFAULT_SAMPLE_MISTAKES.filter(m => m.subjectId === 'english').length },
            { id: 'go', name: '♟️ 围棋死活手筋', count: goMistakesList.length }
          ]"
          :key="sub.id"
          @click="activeSubjectTab = sub.id as any"
          :class="[
            'px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
            activeSubjectTab === sub.id
              ? 'bg-rose-500 text-white shadow-md scale-102'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50/50'
          ]"
        >
          <span>{{ sub.name }}</span>
          <span
            class="text-[10px] px-1.5 py-0.2 rounded-full"
            :class="activeSubjectTab === sub.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'"
          >
            {{ sub.count }}
          </span>
        </button>
      </div>

      <!-- MISTAKES CARDS GRID (Math, Chinese, English) -->
      <div v-if="activeSubjectTab !== 'go'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
        <div
          v-for="item in currentSubjectMistakes"
          :key="item.id"
          class="bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between"
          :class="item.resolved ? 'border-emerald-300 bg-emerald-50/40 opacity-70' : 'border-rose-200 shadow-sm hover:border-rose-300'"
        >
          <div>
            <!-- Badge & Status -->
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {{ item.knowledgePointTitle }}
              </span>
              <span v-if="item.resolved" class="text-xs font-black text-emerald-600 flex items-center gap-1">
                <CheckCircle2 class="w-4 h-4" />
                <span>已攻克 (+30金币)</span>
              </span>
              <span v-else class="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Brain class="w-3.5 h-3.5" />
                <span>待重练消灭</span>
              </span>
            </div>

            <!-- Problem Prompt -->
            <div class="text-2xl sm:text-3xl font-black text-slate-900 my-2">
              {{ item.questionPrompt }}
            </div>

            <!-- Mistake Breakdown -->
            <div class="space-y-1.5 text-xs font-bold pt-3 border-t border-slate-100">
              <div class="text-rose-600">❌ 之前错答：{{ item.userAnswer }}</div>
              <div class="text-emerald-700 font-black">✅ 正确标准：{{ item.correctAnswer }}</div>
              <div class="text-slate-500 text-[11px] leading-relaxed">💡 错误成因：{{ item.errorReason }}</div>
            </div>
          </div>

          <!-- Actions: AI Step-by-Step Tutor Button -->
          <div class="mt-4 flex gap-2">
            <button
              v-if="!item.resolved"
              @click="openAiTutor(item)"
              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot class="w-4 h-4 text-amber-300" />
              <span>🤖 AI 启发式渐进辅导 (三步点拨)</span>
            </button>
            <button
              v-else
              @click="openAiTutor(item)"
              class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>查看思路复盘</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 4: GO MISTAKES -->
      <div v-else class="space-y-4 animate-fade-in">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="p in goMistakesList"
            :key="p.id"
            class="bg-white rounded-3xl p-5 border-2 border-emerald-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span class="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {{ p.category }}
              </span>
              <div class="text-lg font-black text-slate-900 my-2">{{ p.title }}</div>
              <p class="text-xs text-slate-500 font-bold line-clamp-2">{{ p.hint }}</p>
            </div>

            <button
              @click="router.push('/tsumego')"
              class="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              前往死活棋盘攻克 →
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- 🤖 MODAL 1: AI STEP-BY-STEP MISTAKE TUTOR & VARIATION MODAL -->
    <Teleport to="body">
      <div
        v-if="activeTutorMistake"
        class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        @click.self="closeAiTutor"
      >
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border-4 border-rose-300 space-y-4 relative animate-pop-in">
          <button
            @click="closeAiTutor"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-2xl shadow-md text-white">
              🤖
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                <Sparkles class="w-3.5 h-3.5 text-rose-500" />
                <span>小诺 AI 启发式智能辅导</span>
              </div>
              <h3 class="text-lg font-black text-slate-900 mt-0.5">
                {{ activeTutorMistake.knowledgePointTitle }}
              </h3>
            </div>
          </div>

          <div class="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200">
            <div class="text-xs text-rose-700 font-bold">错题原题：</div>
            <div class="text-xl font-black text-slate-900 my-1">
              {{ activeTutorMistake.questionPrompt }}
            </div>
            <div class="text-xs font-bold text-slate-600">
              错选/错答：<span class="text-rose-600">{{ activeTutorMistake.userAnswer }}</span>
            </div>
          </div>

          <div v-if="!activeVariationQuiz" class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-slate-500">
                启发进度：第 {{ currentStepHintIndex + 1 }} / {{ tutorHints.length }} 步
              </span>
              <button
                @click="speakTutorHint(tutorHints[currentStepHintIndex])"
                class="inline-flex items-center gap-1 text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl cursor-pointer"
              >
                <Volume2 class="w-3.5 h-3.5" />
                <span>小诺语音讲题</span>
              </button>
            </div>

            <div class="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-orange-200 space-y-2">
              <div class="text-sm font-black text-orange-900 flex items-center gap-1.5">
                <Brain class="w-4 h-4 text-orange-600" />
                <span>{{ tutorHints[currentStepHintIndex]?.title }}</span>
              </div>
              <div class="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                {{ tutorHints[currentStepHintIndex]?.content }}
              </div>
              <div class="text-[11px] font-black text-orange-700 pt-1 border-t border-orange-200/60">
                🌟 小诺鼓励：{{ tutorHints[currentStepHintIndex]?.encouragement }}
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                v-if="currentStepHintIndex < tutorHints.length - 1"
                @click="nextTutorStep"
                class="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>下一步启发点拨 →</span>
              </button>

              <button
                v-else
                @click="startVariationQuiz"
                class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-bounce-subtle"
              >
                <Sparkles class="w-4 h-4 text-amber-300" />
                <span>我懂了！去做 1 道举一反三变式题 (领双倍金币)</span>
              </button>
            </div>
          </div>

          <!-- VARIATION QUIZ SECTION -->
          <div v-else class="space-y-3 animate-fade-in">
            <div class="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs font-black text-purple-900 flex items-center gap-1.5">
              <Brain class="w-4 h-4 text-purple-600" />
              <span>举一反三 · 变式题闯关</span>
            </div>

            <div class="text-lg sm:text-xl font-black text-slate-900 text-center py-2">
              {{ activeVariationQuiz.prompt }}
            </div>

            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="opt in activeVariationQuiz.options"
                :key="opt.id"
                @click="selectedVariationOption = opt.id"
                :class="[
                  'p-3 rounded-2xl text-left font-black text-xs sm:text-sm border-2 transition-all flex items-center justify-between cursor-pointer',
                  selectedVariationOption === opt.id
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                ]"
              >
                <span>{{ opt.text }}</span>
                <span class="text-[10px] text-slate-400 font-bold">{{ opt.subText }}</span>
              </button>
            </div>

            <button
              v-if="!isVariationSubmitted"
              @click="submitVariationQuiz"
              :disabled="!selectedVariationOption"
              class="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              提交变式题答案
            </button>

            <div v-else class="p-3.5 rounded-2xl text-xs font-black space-y-1" :class="selectedVariationOption === activeVariationQuiz.correctId ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'">
              <div>{{ selectedVariationOption === activeVariationQuiz.correctId ? '🎉 太棒了！回答正确！+30金币 +40经验！' : '❌ 还差一点点！' }}</div>
              <div class="text-[11px] text-slate-600 font-medium leading-relaxed">{{ activeVariationQuiz.explanation }}</div>
              <button
                @click="closeAiTutor"
                class="mt-2 w-full py-2 bg-white rounded-xl border border-slate-300 text-slate-800 font-black cursor-pointer"
              >
                完成攻克返回错题本
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- 📊 MODAL 2: PARENT DAILY LEARNING REPORT MODAL -->
    <Teleport to="body">
      <div
        v-if="showParentReportModal && dailyReport"
        class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        @click.self="showParentReportModal = false"
      >
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border-4 border-indigo-300 space-y-4 relative animate-pop-in">
          <button
            @click="showParentReportModal = false"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-md text-white">
              📊
            </div>
            <div>
              <div class="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
                每日学情闭环报告 · {{ dailyReport.date }}
              </div>
              <h3 class="text-lg font-black text-slate-900 mt-0.5">
                {{ userStore.nickname }} 专属学情洞察
              </h3>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <div class="text-[10px] text-blue-600 font-bold">今日专注时长</div>
              <div class="text-lg font-black text-blue-900 mt-0.5">{{ dailyReport.totalMinutes }} 分钟</div>
            </div>
            <div class="p-3 bg-purple-50 rounded-2xl border border-purple-100">
              <div class="text-[10px] text-purple-600 font-bold">通关关卡数</div>
              <div class="text-lg font-black text-purple-900 mt-0.5">{{ dailyReport.completedLessons }} 关</div>
            </div>
            <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div class="text-[10px] text-emerald-600 font-bold">已消灭错题</div>
              <div class="text-lg font-black text-emerald-900 mt-0.5">{{ dailyReport.resolvedMistakesCount }} 道</div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs">
              <span class="font-black text-emerald-800">🌟 掌握较好知识点：</span>
              <div class="text-emerald-700 mt-1 font-medium">{{ dailyReport.masteredKnowledgePoints.join('、') }}</div>
            </div>
            <div class="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs">
              <span class="font-black text-rose-800">⚠️ 需要加强薄弱点：</span>
              <div class="text-rose-700 mt-1 font-medium">{{ dailyReport.weakKnowledgePoints.join('、') }}</div>
            </div>
          </div>

          <div class="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 text-xs">
            <div class="font-black text-amber-900 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-amber-600" />
              <span>小诺 AI 伴学家长辅导建议：</span>
            </div>
            <p class="text-slate-700 leading-relaxed font-medium">
              {{ dailyReport.parentAdvice }}
            </p>
          </div>

          <button
            @click="showParentReportModal = false"
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl transition cursor-pointer shadow-md"
          >
            已阅读学情洞察
          </button>
        </div>
      </div>
    </Teleport>

  </div>
</template>

