<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { AiTutorService, type AiTutorStepHint, type AiVariationQuiz } from '../services/aiTutorService';
import type { MistakeRecord, SubjectId, DailyLearningReport } from '../types/curriculum';
import { showAlert } from '../utils/alert';
import {
  playButtonSound,
  playWinSound,
  playErrorSound,
  playStoneSound
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
  Brain,
  Trash2,
  Play,
  Check,
  Flame,
  Search,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// Subject Tabs: 'all' | 'math' | 'chinese' | 'english' | 'go'
const activeSubjectTab = ref<SubjectId | 'all'>('all');

// Status Filter: 'pending' (待消灭) | 'resolved' (已消灭) | 'all' (全部)
const activeStatusFilter = ref<'pending' | 'resolved' | 'all'>('pending');

// Search Query Filter
const searchQuery = ref('');

// Read subject query from route
onMounted(() => {
  userStore.purgeDemoMistakes();
  const qSub = route.query.subject as SubjectId | undefined;
  if (qSub && ['math', 'chinese', 'english', 'go'].includes(qSub)) {
    activeSubjectTab.value = qSub;
  }
  if (route.query.quiz === 'true') {
    setTimeout(() => {
      startRandomQuiz(activeSubjectTab.value, 5);
    }, 200);
  }
});

const allUnifiedMistakes = computed<MistakeRecord[]>(() => {
  return (userStore.mistakeRecords || []).filter(m => !String(m.id || '').startsWith('sample_'));
});

// Filtered list by subject, status, and search query
const filteredMistakesList = computed<MistakeRecord[]>(() => {
  let list = allUnifiedMistakes.value;

  if (activeSubjectTab.value !== 'all') {
    list = list.filter(m => m.subjectId === activeSubjectTab.value);
  }

  if (activeStatusFilter.value === 'pending') {
    list = list.filter(m => !m.resolved);
  } else if (activeStatusFilter.value === 'resolved') {
    list = list.filter(m => m.resolved);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      m =>
        m.questionPrompt.toLowerCase().includes(q) ||
        m.knowledgePointTitle.toLowerCase().includes(q) ||
        m.topic.toLowerCase().includes(q) ||
        m.correctAnswer.toLowerCase().includes(q)
    );
  }

  return list;
});

// Subject Counts (Pending mistakes)
const getPendingCountBySubject = (sub: SubjectId | 'all') => {
  if (sub === 'all') {
    return allUnifiedMistakes.value.filter(m => !m.resolved).length;
  }
  return allUnifiedMistakes.value.filter(m => m.subjectId === sub && !m.resolved).length;
};

// Global Stats
const totalMistakesCount = computed(() => allUnifiedMistakes.value.length);
const pendingMistakesCount = computed(() => allUnifiedMistakes.value.filter(m => !m.resolved).length);
const resolvedMistakesCount = computed(() => allUnifiedMistakes.value.filter(m => m.resolved).length);
const masteryRate = computed(() => {
  if (totalMistakesCount.value === 0) return 100;
  return Math.round((resolvedMistakesCount.value / totalMistakesCount.value) * 100);
});

// =========================================================================
// 🎲 核心模块：错题随机出题练习模式 (Random Mistake Quiz Runner)
// =========================================================================
const isQuizModeActive = ref(false);
const quizSubjectScope = ref<SubjectId | 'all'>('all');
const quizQuestionCount = ref<number>(5);
const quizQuestions = ref<MistakeRecord[]>([]);
const currentQuizIdx = ref(0);
const selectedQuizOption = ref<string | null>(null);
const quizInputAnswer = ref<string>('');
const isQuizEvaluated = ref(false);
const isQuizCurrentCorrect = ref(false);
const quizFeedbackText = ref('');
const sessionEliminatedCount = ref(0);
const sessionTotalCoins = ref(0);
const isQuizFinished = ref(false);

// Current Quiz Question
const currentQuizItem = computed<MistakeRecord | null>(() => {
  return quizQuestions.value[currentQuizIdx.value] || null;
});

// Start Random Mistake Quiz
const normalizeAns = (s: string) => (s || '').trim().toLowerCase().replace(/\s+/g, '');

const shuffleList = <T>(list: T[]): T[] => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

const isQuizAnswerCorrect = (item: MistakeRecord, userAns: string) => {
  const u = normalizeAns(userAns);
  const c = normalizeAns(item.correctAnswer);
  if (!u || !c) return false;
  if (u === c) return true;

  const opts = item.options || [];
  for (const opt of opts) {
    const id = typeof opt === 'string' ? opt : opt.id;
    const text = typeof opt === 'string' ? opt : opt.text;
    const hit = normalizeAns(id) === u || normalizeAns(text) === u;
    if (!hit) continue;
    if (normalizeAns(id) === c || normalizeAns(text) === c) return true;
  }
  return false;
};

const collectPendingMistakes = (scope: SubjectId | 'all') => {
  let candidates = allUnifiedMistakes.value.filter(m => !m.resolved);
  if (scope !== 'all') {
    candidates = candidates.filter(m => m.subjectId === scope);
  }

  const seen = new Set<string>();
  const unique: MistakeRecord[] = [];
  for (const m of candidates) {
    const key = m.subjectId + '|' + normalizeAns(m.questionPrompt);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(m);
  }
  return unique;
};

const startRandomQuiz = (scope: SubjectId | 'all' = activeSubjectTab.value, count = 5) => {
  playButtonSound();
  quizSubjectScope.value = scope;
  quizQuestionCount.value = count;

  const candidates = collectPendingMistakes(scope);
  if (candidates.length === 0) {
    showAlert({
      title: '暂时没有待消灭的错题',
      message: '已经答对并移出的题目不会再抽到。做错新题后，才会进入错题本随机练。',
      type: 'info'
    });
    return;
  }

  quizQuestions.value = shuffleList(candidates).slice(0, Math.min(count, candidates.length));

  currentQuizIdx.value = 0;
  selectedQuizOption.value = null;
  quizInputAnswer.value = '';
  isQuizEvaluated.value = false;
  isQuizCurrentCorrect.value = false;
  quizFeedbackText.value = '';
  sessionEliminatedCount.value = 0;
  sessionTotalCoins.value = 0;
  isQuizFinished.value = false;
  isQuizModeActive.value = true;

  speakText('错题随机出题练习开始！只练还没攻克的错题，答对了立刻移出，加油！');
};

// Generate options for quiz item if missing
const getQuizOptions = (item: MistakeRecord) => {
  if (item.options && item.options.length > 0) {
    return item.options.map(opt => typeof opt === 'string' ? { id: opt, text: opt } : opt);
  }

  // Auto generate options around correct answer
  const correct = item.correctAnswer.trim();
  const set = new Set<string>([correct]);
  if (item.userAnswer && item.userAnswer !== correct && item.userAnswer !== '未作答') {
    set.add(item.userAnswer.trim());
  }

  const numVal = parseInt(correct, 10);
  if (!isNaN(numVal)) {
    const plausible = [numVal - 10, numVal + 10, numVal - 1, numVal + 1, numVal - 2, numVal + 2];
    for (const d of plausible.sort(() => 0.5 - Math.random())) {
      if (set.size >= 4) break;
      if (d > 0 && String(d) !== correct) set.add(String(d));
    }
  }

  while (set.size < 4) {
    set.add('备选选项 ' + (set.size + 1));
  }

  return Array.from(set).sort(() => 0.5 - Math.random()).map(val => ({ id: val, text: val }));
};

// Submit Quiz Answer in Random Mode
const handleQuizSubmit = (chosenOption?: string) => {
  if (isQuizEvaluated.value || !currentQuizItem.value) return;

  const item = currentQuizItem.value;
  let userAns = '';

  if (chosenOption !== undefined) {
    selectedQuizOption.value = chosenOption;
    userAns = chosenOption.trim();
  } else if (selectedQuizOption.value) {
    userAns = selectedQuizOption.value.trim();
  } else if (quizInputAnswer.value.trim()) {
    userAns = quizInputAnswer.value.trim();
  } else {
    return;
  }

  isQuizEvaluated.value = true;
  const isMatch = isQuizAnswerCorrect(item, userAns);

  isQuizCurrentCorrect.value = isMatch;

  if (isMatch) {
    playWinSound();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    sessionEliminatedCount.value++;
    sessionTotalCoins.value += 30;

    // 🌟 答对了，就从错题本移出！
    userStore.resolveSubjectMistake(item.id, true);
    item.resolved = true;

    quizFeedbackText.value = '🎉 太棒了！回答完全正确！已从错题本成功移出！(+30金币 +40经验)';
    speakText('太棒了！回答正确，错题已彻底消灭！');

    // Smooth auto transition to next question
    setTimeout(() => {
      goToNextQuizQuestion();
    }, 1200);
  } else {
    playErrorSound();
    // Record mistake count update
    userStore.recordSubjectMistake({
      subjectId: item.subjectId,
      gradeLevel: item.gradeLevel,
      topic: item.topic,
      knowledgePointId: item.knowledgePointId,
      knowledgePointTitle: item.knowledgePointTitle,
      questionPrompt: item.questionPrompt,
      userAnswer: userAns,
      correctAnswer: item.correctAnswer,
      errorCategory: item.errorCategory,
      errorReason: item.errorReason,
      questionType: item.questionType,
      options: item.options
    });

    quizFeedbackText.value = `❌ 作答有误（你选了：${userAns}），正确答案是【${item.correctAnswer}】。已保留在错题本继续巩固！`;
    speakText('这题还不太对，看看解析稍后继续攻克！');
  }
};

// Next Quiz Question
const goToNextQuizQuestion = () => {
  if (currentQuizIdx.value < quizQuestions.value.length - 1) {
    currentQuizIdx.value++;
    selectedQuizOption.value = null;
    quizInputAnswer.value = '';
    isQuizEvaluated.value = false;
    isQuizCurrentCorrect.value = false;
    quizFeedbackText.value = '';
  } else {
    finishQuiz();
  }
};

// Finish Random Quiz
const finishQuiz = () => {
  isQuizFinished.value = true;
  playWinSound();
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  speakText(`错题大消灭挑战完成！本次共成功移出 ${sessionEliminatedCount.value} 道错题，太优秀了！`);
};

// Close Quiz Mode
const closeQuizMode = () => {
  stopSpeech();
  isQuizModeActive.value = false;
  isQuizFinished.value = false;
};

// =========================================================================
// 🎯 单题重做模式 (Single Mistake Direct Redo Modal)
// =========================================================================
const activeRedoMistake = ref<MistakeRecord | null>(null);
const singleRedoSelected = ref<string | null>(null);
const singleRedoInput = ref('');
const isSingleRedoEvaluated = ref(false);
const isSingleRedoCorrect = ref(false);

const openSingleRedo = (item: MistakeRecord) => {
  playButtonSound();
  activeRedoMistake.value = item;
  singleRedoSelected.value = null;
  singleRedoInput.value = '';
  isSingleRedoEvaluated.value = false;
  isSingleRedoCorrect.value = false;
  speakText('攻克错题：' + item.questionPrompt);
};

const submitSingleRedo = (chosen?: string) => {
  if (!activeRedoMistake.value || isSingleRedoEvaluated.value) return;
  const item = activeRedoMistake.value;
  const ans = (chosen || singleRedoSelected.value || singleRedoInput.value).trim();
  if (!ans) return;

  isSingleRedoEvaluated.value = true;
  const isRight = isQuizAnswerCorrect(item, ans);

  isSingleRedoCorrect.value = isRight;

  if (isRight) {
    playWinSound();
    confetti({ particleCount: 80, spread: 60 });
    // 答对了，立即从错题本移出！
    userStore.resolveSubjectMistake(item.id, true);
    item.resolved = true;
    speakText('太聪明啦！这道错题已被彻底攻克并移出错题本！');
  } else {
    playErrorSound();
    speakText('还差一点点，对照解析再想想看！');
  }
};

const closeSingleRedo = () => {
  activeRedoMistake.value = null;
};

// Manual Remove from Mistake Notebook
const handleManualRemove = (item: MistakeRecord) => {
  playStoneSound();
  userStore.removeSubjectMistake(item.id);
};

// Clear all resolved mistakes
const clearResolved = () => {
  playButtonSound();
  userStore.clearResolvedMistakes(activeSubjectTab.value === 'all' ? undefined : activeSubjectTab.value);
};

// =========================================================================
// 🤖 AI 启发式逐步辅导与变式题
// =========================================================================
const activeTutorMistake = ref<MistakeRecord | null>(null);
const currentStepHintIndex = ref<number>(0);
const tutorHints = ref<AiTutorStepHint[]>([]);
const activeVariationQuiz = ref<AiVariationQuiz | null>(null);
const selectedVariationOption = ref<string | null>(null);
const isVariationSubmitted = ref(false);

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

const startVariationQuiz = () => {
  if (!activeTutorMistake.value) return;
  playButtonSound();
  activeVariationQuiz.value = AiTutorService.generateVariationQuiz(activeTutorMistake.value);
  selectedVariationOption.value = null;
  isVariationSubmitted.value = false;
  speakText('小诺考考你：这是一道同类变式题，举一反三试试看！');
};

const submitVariationQuiz = () => {
  if (!activeVariationQuiz.value || !selectedVariationOption.value || isVariationSubmitted.value) return;
  isVariationSubmitted.value = true;

  const isCorrect = selectedVariationOption.value === activeVariationQuiz.value.correctId;
  if (isCorrect) {
    playWinSound();
    confetti({ particleCount: 80, spread: 70 });
    if (activeTutorMistake.value) {
      userStore.resolveSubjectMistake(activeTutorMistake.value.id, true);
      activeTutorMistake.value.resolved = true;
    }
    speakText('太聪明啦！变式题完全做对，弱点彻底消灭！');
  } else {
    playErrorSound();
    speakText('还差一点点，看看小诺的解析再试试！');
  }
};

// =========================================================================
// 📊 家长每日学情闭环报告
// =========================================================================
const showParentReportModal = ref(false);
const dailyReport = ref<DailyLearningReport | null>(null);

const openDailyParentReport = () => {
  playButtonSound();
  const todayStr = new Date().toLocaleDateString('zh-CN');
  dailyReport.value = AiTutorService.generateDailyParentReport(
    todayStr,
    userStore.solvedPuzzles.length + 3,
    allUnifiedMistakes.value,
    resolvedMistakesCount.value
  );
  showParentReportModal.value = true;
};

const goBack = () => {
  playButtonSound();
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] py-3 sm:py-6 px-2.5 sm:px-6 select-none">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">

      <!-- Breadcrumb & Top Bar -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <button
          @click="goBack"
          class="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border border-amber-300 shadow-2xs cursor-pointer shrink-0"
        >
          <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>返回大厅</span>
        </button>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <button
            @click="openDailyParentReport"
            class="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <FileText class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span class="hidden sm:inline">📊 每日学情报告 (家长端)</span>
            <span class="sm:hidden">📊 学情报告</span>
          </button>

          <div class="hidden sm:flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3 py-1.5 rounded-full text-xs font-black border border-rose-200">
            <BookMarked class="w-3.5 h-3.5 text-rose-600" />
            <span>智能错题本</span>
          </div>
        </div>
      </div>

      <!-- Header Hero Banner -->
      <div class="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-lg sm:shadow-xl relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div class="space-y-2 sm:space-y-3 text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>智能收录 · 随机出题 · 答对自动移出</span>
            </div>
            <h1 class="text-xl sm:text-4xl font-cartoon font-bold tracking-wide drop-shadow-sm">
              全学科错题攻坚大本营
            </h1>
            <p class="text-xs sm:text-sm text-white/90 font-medium max-w-xl leading-relaxed line-clamp-2">
              做题做错自动入本！一键开启错题随机抽题练，答对即刻移出错题本并领双倍金币！
            </p>
          </div>

          <!-- Quick Action Card -->
          <div class="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 sm:p-5 border border-white/25 text-center w-full md:w-auto min-w-0 md:min-w-[240px] flex flex-col justify-between gap-2.5 sm:gap-3">
            <div>
              <div class="text-xs font-bold text-white/80">待消灭错题总数</div>
              <div class="text-3xl font-black text-amber-300 mt-0.5">
                {{ pendingMistakesCount }} <span class="text-sm font-bold text-white/80">道</span>
              </div>
              <div class="text-[10px] text-white/70 mt-0.5">攻克率 {{ masteryRate }}%</div>
            </div>

            <!-- Primary Random Quiz CTA Button -->
            <button
              @click="startRandomQuiz(activeSubjectTab, 5)"
              :disabled="pendingMistakesCount === 0"
              class="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-900 font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Flame class="w-4 h-4 text-rose-600 fill-current animate-bounce" />
              <span>🎲 错题随机出题练习</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Stats Dashboard -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white rounded-2xl p-4 border-2 border-rose-100 shadow-xs flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-black shrink-0">
            📕
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold">待消灭错题</div>
            <div class="text-xl sm:text-2xl font-black text-rose-600">{{ pendingMistakesCount }} 道</div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-xs flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-black shrink-0">
            🏆
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold">已攻克移出</div>
            <div class="text-xl sm:text-2xl font-black text-emerald-600">{{ resolvedMistakesCount }} 道</div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 border-2 border-purple-100 shadow-xs flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-black shrink-0">
            🎯
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold">错题攻克率</div>
            <div class="text-xl sm:text-2xl font-black text-purple-600">{{ masteryRate }}%</div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 border-2 border-amber-100 shadow-xs flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-black shrink-0">
            🪙
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold">消灭奖励金币</div>
            <div class="text-xl sm:text-2xl font-black text-amber-600">+{{ resolvedMistakesCount * 30 }} 币</div>
          </div>
        </div>
      </div>

      <!-- Subject Tabs & Filter Toolbar -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-sm space-y-4">
        <!-- Subject Tabs Switcher -->
        <div class="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              v-for="sub in [
                { id: 'all', name: '📚 全部语数外', count: getPendingCountBySubject('all') },
                { id: 'math', name: '🔢 数学数理', count: getPendingCountBySubject('math') },
                { id: 'chinese', name: '🏮 国学语文', count: getPendingCountBySubject('chinese') },
                { id: 'english', name: '🔤 趣味英语', count: getPendingCountBySubject('english') },
                { id: 'go', name: '♟️ 围棋死活', count: getPendingCountBySubject('go') }
              ]"
              :key="sub.id"
              @click="activeSubjectTab = sub.id as any"
              :class="[
                'px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
                activeSubjectTab === sub.id
                  ? 'bg-rose-500 text-white shadow-md scale-102'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-rose-50/50'
              ]"
            >
              <span>{{ sub.name }}</span>
              <span
                class="text-[10px] px-1.5 py-0.2 rounded-full"
                :class="activeSubjectTab === sub.id ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-700 font-bold'"
              >
                {{ sub.count }}
              </span>
            </button>
          </div>

          <!-- Quick Random Exercise Launcher -->
          <div class="flex items-center gap-2">
            <button
              @click="startRandomQuiz(activeSubjectTab, 5)"
              class="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play class="w-3.5 h-3.5 fill-current" />
              <span>抽 5 题练</span>
            </button>

            <button
              @click="startRandomQuiz(activeSubjectTab, 10)"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm rounded-2xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>抽 10 题练</span>
            </button>
          </div>
        </div>

        <!-- Filter Sub-bar: Status Tabs & Search -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              @click="activeStatusFilter = 'pending'"
              :class="[
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
                activeStatusFilter === 'pending'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              待攻克消灭 ({{ pendingMistakesCount }})
            </button>

            <button
              @click="activeStatusFilter = 'resolved'"
              :class="[
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
                activeStatusFilter === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              已消灭移出 ({{ resolvedMistakesCount }})
            </button>

            <button
              @click="activeStatusFilter = 'all'"
              :class="[
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
                activeStatusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              全部 ({{ totalMistakesCount }})
            </button>

            <button
              v-if="resolvedMistakesCount > 0"
              @click="clearResolved"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-1 border border-slate-200"
              title="清理已消灭错题"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>清理已消灭</span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索错题或考查知识点..."
              class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>
      </div>

      <!-- MISTAKES CARDS GRID -->
      <div v-if="filteredMistakesList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
        <div
          v-for="item in filteredMistakesList"
          :key="item.id"
          class="bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between"
          :class="item.resolved ? 'border-emerald-300 bg-emerald-50/30 opacity-75' : 'border-rose-200 shadow-sm hover:border-rose-300'"
        >
          <div>
            <!-- Badge & Subject & Status -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-full"
                  :class="
                    item.subjectId === 'math' ? 'bg-blue-100 text-blue-800' :
                    item.subjectId === 'chinese' ? 'bg-amber-100 text-amber-800' :
                    item.subjectId === 'english' ? 'bg-purple-100 text-purple-800' :
                    'bg-emerald-100 text-emerald-800'
                  "
                >
                  {{ item.subjectId === 'math' ? '🔢 数学' : item.subjectId === 'chinese' ? '🏮 语文' : item.subjectId === 'english' ? '🔤 英语' : '♟️ 围棋' }}
                </span>
                <span class="text-xs font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {{ item.knowledgePointTitle }}
                </span>
              </div>

              <span v-if="item.resolved" class="text-xs font-black text-emerald-600 flex items-center gap-1">
                <CheckCircle2 class="w-4 h-4" />
                <span>已攻克移出</span>
              </span>
              <span v-else class="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Brain class="w-3.5 h-3.5" />
                <span>待消灭</span>
              </span>
            </div>

            <!-- Problem Prompt -->
            <div class="text-xl sm:text-2xl font-black text-slate-900 my-2.5 leading-snug">
              {{ item.questionPrompt }}
            </div>

            <!-- Mistake Breakdown -->
            <div class="space-y-1.5 text-xs font-bold pt-3 border-t border-slate-100">
              <div class="text-rose-600">❌ 之前错答：{{ item.userAnswer }}</div>
              <div class="text-emerald-700 font-black">✅ 正确标准：{{ item.correctAnswer }}</div>
              <div class="text-slate-500 text-[11px] leading-relaxed">💡 错误成因：{{ item.errorReason }}</div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="mt-4 flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
            <button
              v-if="!item.resolved"
              @click="openSingleRedo(item)"
              class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>🎯 立即重做 (答对移出)</span>
            </button>

            <button
              @click="openAiTutor(item)"
              class="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-purple-200"
            >
              <Bot class="w-3.5 h-3.5 text-purple-600" />
              <span>AI 启发辅导</span>
            </button>

            <button
              @click="handleManualRemove(item)"
              class="py-2.5 px-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 font-bold text-xs transition-all flex items-center justify-center cursor-pointer"
              title="从错题本移出"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-3xl p-12 text-center border-2 border-slate-200 shadow-sm space-y-4">
        <div class="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
          🎉
        </div>
        <h3 class="text-xl font-cartoon font-bold text-slate-800">太棒啦！当前没有待消灭的错题！</h3>
        <p class="text-xs sm:text-sm text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
          你在语数外练习中表现非常棒！做题时如果做错了，系统会自动帮你收录进错题本，方便随时随机复习攻坚。
        </p>
        <button
          @click="activeStatusFilter = 'all'"
          class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
        >
          查看全部历史错题记录
        </button>
      </div>

    </div>

    <!-- =========================================================================
         🎲 MODAL 1: 错题随机出题练习互动中心 (Random Mistake Quiz Runner)
         ========================================================================= -->
    <Teleport to="body">
      <div
        v-if="isQuizModeActive"
        class="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      >
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border-4 border-rose-300 space-y-5 relative animate-pop-in">
          
          <!-- Top Header & Progress -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center font-black text-sm">
                🎲
              </span>
              <div>
                <h3 class="text-base font-black text-slate-900">
                  错题大消灭 · 随机挑战
                </h3>
                <div class="text-[11px] font-bold text-slate-400">
                  第 {{ currentQuizIdx + 1 }} / {{ quizQuestions.length }} 题 · 答对即移出错题本
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                已移出: {{ sessionEliminatedCount }} 道
              </span>
              <button
                @click="closeQuizMode"
                class="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Active Question Card -->
          <div v-if="!isQuizFinished && currentQuizItem" class="space-y-4">
            
            <!-- Subject and Knowledge Point -->
            <div class="flex items-center justify-between text-xs font-black">
              <span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {{ currentQuizItem.knowledgePointTitle }}
              </span>
              <span class="text-slate-400">考点: {{ currentQuizItem.topic }}</span>
            </div>

            <!-- Question Prompt Box -->
            <div class="p-5 bg-gradient-to-br from-amber-50/80 to-rose-50/70 rounded-3xl border-3 border-rose-200 text-center shadow-inner">
              <div class="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                {{ currentQuizItem.questionPrompt }}
              </div>
            </div>

            <!-- Choice Options Mode -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                v-for="opt in getQuizOptions(currentQuizItem)"
                :key="opt.id"
                @click="handleQuizSubmit(opt.text)"
                :disabled="isQuizEvaluated"
                :class="[
                  'p-4 rounded-2xl border-3 text-left font-black text-base sm:text-lg transition-all flex items-center justify-between cursor-pointer shadow-sm active:scale-95',
                  selectedQuizOption === opt.text
                    ? isQuizCurrentCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 scale-102 ring-2 ring-emerald-200'
                      : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                    : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/40 text-slate-800'
                ]"
              >
                <span>{{ opt.text }}</span>
                <Check v-if="selectedQuizOption === opt.text && isQuizCurrentCorrect" class="w-5 h-5 text-emerald-600" />
                <X v-else-if="selectedQuizOption === opt.text && !isQuizCurrentCorrect" class="w-5 h-5 text-rose-600" />
              </button>
            </div>

            <!-- Feedback Message Banner -->
            <div
              v-if="isQuizEvaluated"
              :class="[
                'p-4 rounded-2xl text-xs sm:text-sm font-black text-left space-y-1.5 animate-fade-in border-2',
                isQuizCurrentCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              ]"
            >
              <div class="flex items-center gap-1.5 text-base">
                <span>{{ isQuizCurrentCorrect ? '🎉 回答完全正确！' : '❌ 作答有误' }}</span>
              </div>
              <div class="leading-relaxed">{{ quizFeedbackText }}</div>
              <div class="text-[11px] text-slate-600 font-medium pt-1 border-t border-slate-200/60">
                💡 知识点解析：{{ currentQuizItem.errorReason }}
              </div>

              <!-- Next Button -->
              <div class="pt-2">
                <button
                  @click="goToNextQuizQuestion"
                  class="w-full py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white font-black text-sm rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  {{ currentQuizIdx < quizQuestions.length - 1 ? '继续下一道错题 ➔' : '查看挑战结算报告 🏆' }}
                </button>
              </div>
            </div>

          </div>

          <!-- Quiz Completion Summary Screen -->
          <div v-else-if="isQuizFinished" class="text-center py-4 space-y-5 animate-fade-in">
            <div class="text-6xl animate-bounce">🏆</div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-cartoon font-bold text-slate-900">
                错题大消灭挑战完成！
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                攻克弱点，思维能力更上一层楼！
              </p>
            </div>

            <div class="grid grid-cols-3 gap-3 bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
              <div class="p-2">
                <div class="text-[10px] text-slate-500 font-bold">本次挑战题数</div>
                <div class="text-2xl font-black text-slate-900 mt-0.5">{{ quizQuestions.length }} 道</div>
              </div>
              <div class="p-2">
                <div class="text-[10px] text-emerald-700 font-bold">成功消灭移出</div>
                <div class="text-2xl font-black text-emerald-600 mt-0.5">{{ sessionEliminatedCount }} 道</div>
              </div>
              <div class="p-2">
                <div class="text-[10px] text-amber-700 font-bold">获得金币奖励</div>
                <div class="text-2xl font-black text-amber-600 mt-0.5">+{{ sessionTotalCoins }} 🪙</div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                @click="startRandomQuiz(quizSubjectScope, quizQuestionCount)"
                class="flex-1 py-3.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw class="w-4 h-4" />
                <span>再来一轮随机练习</span>
              </button>

              <button
                @click="closeQuizMode"
                class="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-2xl transition cursor-pointer"
              >
                返回错题本
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- =========================================================================
         🎯 MODAL 2: 单题立即重做弹窗 (Single Mistake Quick Redo Modal)
         ========================================================================= -->
    <Teleport to="body">
      <div
        v-if="activeRedoMistake"
        class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        @click.self="closeSingleRedo"
      >
        <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border-4 border-rose-300 space-y-4 relative animate-pop-in">
          <button
            @click="closeSingleRedo"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-xl shadow-md text-white">
              🎯
            </div>
            <div>
              <span class="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                错题单题重做 · 答对立即移出
              </span>
              <h3 class="text-lg font-black text-slate-900 mt-0.5">
                {{ activeRedoMistake.knowledgePointTitle }}
              </h3>
            </div>
          </div>

          <!-- Problem Prompt -->
          <div class="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 text-center">
            <div class="text-xl sm:text-2xl font-black text-slate-900 my-1">
              {{ activeRedoMistake.questionPrompt }}
            </div>
          </div>

          <!-- Options Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              v-for="opt in getQuizOptions(activeRedoMistake)"
              :key="opt.id"
              @click="submitSingleRedo(opt.text)"
              :disabled="isSingleRedoEvaluated"
              :class="[
                'p-3.5 rounded-2xl text-left font-black text-sm border-2 transition-all flex items-center justify-between cursor-pointer',
                singleRedoSelected === opt.text
                  ? isSingleRedoCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-rose-500 bg-rose-50 text-rose-900'
                  : 'border-slate-200 bg-white hover:border-rose-300'
              ]"
            >
              <span>{{ opt.text }}</span>
              <Check v-if="singleRedoSelected === opt.text && isSingleRedoCorrect" class="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          <!-- Evaluated feedback -->
          <div
            v-if="isSingleRedoEvaluated"
            :class="[
              'p-3.5 rounded-2xl text-xs font-black space-y-1',
              isSingleRedoCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
            ]"
          >
            <div>{{ isSingleRedoCorrect ? '🎉 太棒了！回答正确！已从错题本移出！+30金币 +40经验！' : '❌ 还差一点点，已保留在错题本中！' }}</div>
            <div class="text-[11px] text-slate-600 font-medium">{{ activeRedoMistake.errorReason }}</div>
            
            <button
              @click="closeSingleRedo"
              class="mt-2 w-full py-2 bg-white rounded-xl border border-slate-300 text-slate-800 font-black cursor-pointer"
            >
              完成并返回
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- =========================================================================
         🤖 MODAL 3: AI STEP-BY-STEP MISTAKE TUTOR & VARIATION MODAL
         ========================================================================= -->
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

    <!-- =========================================================================
         📊 MODAL 4: 家长每日学情闭环报告 (Parent Daily Learning Report)
         ========================================================================= -->
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


