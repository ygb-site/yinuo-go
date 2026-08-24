<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  generateDrillQuestions,
  DRILL_TYPE_OPTIONS,
  type MathDrillType,
  type MathDrillQuestion
} from '../../services/mathDrillEngine';
import { useUserStore } from '../../stores/useUserStore';
import { useAiTutorStore } from '../../stores/useAiTutorStore';
import {
  playButtonSound,
  playWinSound,
  playErrorSound,
  playStoneSound
} from '../../lib/audio';
import { speakText } from '../../utils/speech';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Printer,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  PenTool,
  Eraser,
  Trash2,
  Send,
  Sparkles,
  BookOpen,
  Check,
  X
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const tutorStore = useAiTutorStore();

// Step state: 'config' | 'playing' | 'result' | 'print'
const currentStep = ref<'config' | 'playing' | 'result' | 'print'>('config');

// Config Options (Default: 30 Questions, Carry & Borrow Drill)
const selectedType = ref<MathDrillType>('add_sub_100_carry');
const selectedCount = ref<number>(30);

// Drill Exam State
const questions = ref<MathDrillQuestion[]>([]);
const currentIdx = ref(0);
const inputAnswer = ref('');
const isSubmitModalOpen = ref(false);

// Filter in Result View: 'all' | 'wrong' | 'carry' | 'borrow'
const resultFilter = ref<'all' | 'wrong' | 'carry' | 'borrow' | 'mixed'>('all');

// Mobile view mode: 'keypad' | 'scratchpad'
const mobileViewMode = ref<'keypad' | 'scratchpad'>('keypad');

// Elapsed Timer
const startTime = ref(0);
const totalTimeMs = ref(0);
const elapsedTimeSec = ref(0);
let timerInterval: any = null;

// ==========================================
// 🖊️ TABLET STYLUS SCRATCHPAD CANVAS STATE
// ==========================================
const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentTool = ref<'pen' | 'eraser'>('pen');
const penColor = ref<string>('#1e3a8a'); // Default sketch blue
const penSize = ref<number>(3);
let isDrawing = false;
let ctx: CanvasRenderingContext2D | null = null;
let lastX = 0;
let lastY = 0;

// Print Mode Options
const showAnswerKeyInPrint = ref(true);

// ==========================================
// 📊 COMPUTED PROPERTIES
// ==========================================
const currentQuestion = computed<MathDrillQuestion | null>(() => {
  return questions.value[currentIdx.value] || null;
});

const answeredCount = computed(() => {
  return questions.value.filter(q => q.userAnswer !== undefined && q.userAnswer !== null).length;
});

const unansweredCount = computed(() => {
  return questions.value.length - answeredCount.value;
});

const correctQuestions = computed(() => {
  return questions.value.filter(q => q.isCorrect === true);
});

const wrongQuestions = computed(() => {
  return questions.value.filter(q => q.isCorrect === false || (q.userAnswer === null || q.userAnswer === undefined));
});


const score = computed(() => {
  if (questions.value.length === 0) return 0;
  return Math.round((correctQuestions.value.length / questions.value.length) * 100);
});

const averageTimePerQuestion = computed(() => {
  if (questions.value.length === 0 || totalTimeMs.value === 0) return 0;
  return ((totalTimeMs.value / 1000) / questions.value.length).toFixed(1);
});

const formattedTime = computed(() => {
  const min = Math.floor(elapsedTimeSec.value / 60);
  const sec = elapsedTimeSec.value % 60;
  return `${min > 0 ? min + '分' : ''}${sec < 10 && min > 0 ? '0' : ''}${sec}秒`;
});

// Category Performance Analysis
const carryAddStats = computed(() => {
  const list = questions.value.filter(q => q.category === 'carry_add');
  if (list.length === 0) return null;
  const correct = list.filter(q => q.isCorrect === true).length;
  const rate = Math.round((correct / list.length) * 100);
  return { total: list.length, correct, rate };
});

const borrowSubStats = computed(() => {
  const list = questions.value.filter(q => q.category === 'borrow_sub');
  if (list.length === 0) return null;
  const correct = list.filter(q => q.isCorrect === true).length;
  const rate = Math.round((correct / list.length) * 100);
  return { total: list.length, correct, rate };
});

const mixedStats = computed(() => {
  const list = questions.value.filter(q => q.category === 'mixed');
  if (list.length === 0) return null;
  const correct = list.filter(q => q.isCorrect === true).length;
  const rate = Math.round((correct / list.length) * 100);
  return { total: list.length, correct, rate };
});

// Filtered Questions in Result Screen
const displayedResultQuestions = computed(() => {
  if (resultFilter.value === 'wrong') {
    return questions.value.filter(q => q.isCorrect !== true);
  }
  if (resultFilter.value === 'carry') {
    return questions.value.filter(q => q.category === 'carry_add');
  }
  if (resultFilter.value === 'borrow') {
    return questions.value.filter(q => q.category === 'borrow_sub');
  }
  if (resultFilter.value === 'mixed') {
    return questions.value.filter(q => q.category === 'mixed');
  }
  return questions.value;
});

// Diagnostic Commentary
const diagnosticAdvice = computed(() => {
  if (score.value === 100) {
    return '太神啦！30道高难度进位退位计算全部正确！口算心算功底非常扎实，继续保持！';
  }
  if (borrowSubStats.value && borrowSubStats.value.rate < 70) {
    return '退位减法是本次失分的主要环节。注意：个位不够减向十位借1当10后，十位计算时千万别忘了减去借走的1哦！';
  }
  if (carryAddStats.value && carryAddStats.value.rate < 70) {
    return '进位加法中个位相加满十向十位进1时，计算十位不要漏加上进位的1哦！建议在草稿板上标注进位小标记。';
  }
  if (score.value >= 80) {
    return '表现很棒！大部分题目均准确拿下，个别细节稍作梳理，错题一键重练即可完全掌握！';
  }
  return '加减法进退位是小学一二年级核心考点，建议对照解析逐题理清“凑十”与“借位破十”思路，针对错题多加练习！';
});

// ==========================================
// 🖊️ CANVAS METHODS
// ==========================================
const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
};

const clearCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const getCanvasPos = (e: MouseEvent | TouchEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();

  if ('touches' in e && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  } else if ('clientX' in e) {
    return {
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top
    };
  }
  return { x: 0, y: 0 };
};

const startDraw = (e: MouseEvent | TouchEvent) => {
  isDrawing = true;
  const pos = getCanvasPos(e);
  lastX = pos.x;
  lastY = pos.y;
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing || !ctx) return;
  const pos = getCanvasPos(e);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);

  if (currentTool.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 24;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = penColor.value;
    ctx.lineWidth = penSize.value;
  }

  ctx.stroke();
  lastX = pos.x;
  lastY = pos.y;
};

const stopDraw = () => {
  isDrawing = false;
};

// ==========================================
// 🚀 EXAM WORKFLOW & ANSWER RECORDING
// ==========================================

// Synchronize inputAnswer with current question's recorded answer
const syncCurrentAnswerToInput = () => {
  if (!currentQuestion.value) return;
  tutorStore.setContext({
    subjectId: 'math',
    questionPrompt: currentQuestion.value.expression,
    userAnswer: inputAnswer.value,
    correctAnswer: String(currentQuestion.value.correctAnswer),
    knowledgePointTitle: currentQuestion.value.categoryName,
    errorReason: currentQuestion.value.explanation
  });
  if (currentQuestion.value.userAnswer !== undefined && currentQuestion.value.userAnswer !== null) {
    inputAnswer.value = String(currentQuestion.value.userAnswer);
  } else {
    inputAnswer.value = '';
  }
};

// Save current input to the current question without judging or popping answer
const saveCurrentInput = () => {
  if (!currentQuestion.value) return;
  if (inputAnswer.value.trim() !== '') {
    currentQuestion.value.userAnswer = parseInt(inputAnswer.value, 10);
  } else {
    currentQuestion.value.userAnswer = null;
  }
};

// Start a fresh drill exam
const startDrill = () => {
  playButtonSound();
  questions.value = generateDrillQuestions({
    type: selectedType.value,
    count: selectedCount.value
  });
  currentIdx.value = 0;
  inputAnswer.value = '';
  elapsedTimeSec.value = 0;
  isSubmitModalOpen.value = false;
  currentStep.value = 'playing';

  startTime.value = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedTimeSec.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);

  nextTick(() => {
    initCanvas();
  });
};

// Navigate to a specific question index via question palette / answer sheet
const jumpToQuestion = (idx: number) => {
  if (idx < 0 || idx >= questions.value.length) return;
  playStoneSound();
  saveCurrentInput();
  currentIdx.value = idx;
  syncCurrentAnswerToInput();
};

// Next Question (Smooth transition, NO immediate right/wrong popup!)
const goToNext = () => {
  playStoneSound();
  saveCurrentInput();
  if (currentIdx.value < questions.value.length - 1) {
    currentIdx.value++;
    syncCurrentAnswerToInput();
  } else {
    // Reached the end of exam -> prompt submit
    isSubmitModalOpen.value = true;
  }
};

// Previous Question
const goToPrev = () => {
  playStoneSound();
  saveCurrentInput();
  if (currentIdx.value > 0) {
    currentIdx.value--;
    syncCurrentAnswerToInput();
  }
};

// Keypad input handlers
const handleNumberInput = (num: string) => {
  playStoneSound();
  if (inputAnswer.value.length < 5) {
    inputAnswer.value += num;
    saveCurrentInput();
  }
};

const handleDelete = () => {
  playButtonSound();
  inputAnswer.value = inputAnswer.value.slice(0, -1);
  saveCurrentInput();
};

const handleClear = () => {
  playButtonSound();
  inputAnswer.value = '';
  saveCurrentInput();
};

// Open submission confirmation modal
const triggerSubmitConfirm = () => {
  playButtonSound();
  saveCurrentInput();
  isSubmitModalOpen.value = true;
};

// Submit Exam and Calculate Final Scores & Explanations
const submitExam = () => {
  playButtonSound();
  saveCurrentInput();
  isSubmitModalOpen.value = false;
  clearInterval(timerInterval);
  totalTimeMs.value = Date.now() - startTime.value;

  // Grade all questions at once
  questions.value.forEach(q => {
    if (q.userAnswer !== undefined && q.userAnswer !== null) {
      q.isCorrect = q.userAnswer === q.correctAnswer;
    } else {
      q.isCorrect = false;
    }

    if (!q.isCorrect) {
      userStore.recordSubjectMistake({
        subjectId: 'math',
        topic: q.categoryName || '100以内加减法',
        knowledgePointTitle: q.categoryName || '100以内进退位计算',
        questionPrompt: q.expression + ' = ?',
        userAnswer: q.userAnswer !== undefined && q.userAnswer !== null ? String(q.userAnswer) : '未作答',
        correctAnswer: String(q.correctAnswer),
        errorCategory: 'calculation',
        errorReason: q.explanation || ('计算 ' + q.expression + ' 时发生偏差，正确答案为 ' + q.correctAnswer + '。'),
        questionType: 'fill_blank',
        template: q.expression + ' = [?]'
      });
    } else {
      userStore.resolveMatchingMistake('math', q.expression + ' = ?');
    }
  });

  currentStep.value = 'result';
  resultFilter.value = 'all';

  // Reward Coins & Exp
  const rewardCoins = Math.max(10, Math.round(score.value / 2));
  const rewardExp = Math.max(20, score.value);
  userStore.addCoins(rewardCoins, `完成口算全卷练习(${questions.value.length}题)`);
  userStore.addExp(rewardExp);

  // Audio & celebration
  if (score.value >= 90) {
    playWinSound();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    speakText(`太棒啦！交卷成功，得分 ${score.value} 分，表现非常优秀！`);
  } else if (score.value >= 60) {
    playWinSound();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    speakText(`交卷完成！得分 ${score.value} 分，来看看错题解析吧！`);
  } else {
    playErrorSound();
    speakText(`交卷完成，得分 ${score.value} 分。不要灰心，一键重练把错题全部拿下！`);
  }
};

// Retry Mistakes Only
const retryMistakes = () => {
  playButtonSound();
  if (wrongQuestions.value.length === 0) return;
  questions.value = wrongQuestions.value.map(q => ({
    ...q,
    userAnswer: undefined,
    isCorrect: undefined
  }));
  currentIdx.value = 0;
  inputAnswer.value = '';
  elapsedTimeSec.value = 0;
  isSubmitModalOpen.value = false;
  currentStep.value = 'playing';

  startTime.value = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedTimeSec.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);

  nextTick(() => {
    initCanvas();
  });
};

// Scroll directly to a question in result analysis
const scrollToResultQuestion = (qId: string) => {
  resultFilter.value = 'all';
  nextTick(() => {
    const el = document.getElementById(`result-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-blue-400');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-blue-400');
      }, 1500);
    }
  });
};

const openPrintMode = () => {
  playButtonSound();
  if (questions.value.length === 0) {
    questions.value = generateDrillQuestions({
      type: selectedType.value,
      count: selectedCount.value
    });
  }
  currentStep.value = 'print';
};

const triggerSystemPrint = () => {
  window.print();
};

// Physical keyboard listener
const handleKeyDown = (e: KeyboardEvent) => {
  if (currentStep.value !== 'playing') return;
  if (isSubmitModalOpen.value) return;

  if (e.key >= '0' && e.key <= '9') {
    handleNumberInput(e.key);
  } else if (e.key === 'Backspace') {
    handleDelete();
  } else if (e.key === 'Enter') {
    goToNext();
  } else if (e.key === 'ArrowRight') {
    goToNext();
  } else if (e.key === 'ArrowLeft') {
    goToPrev();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  clearInterval(timerInterval);
});

const goBack = () => {
  playButtonSound();
  router.push('/subject/math');
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] py-3 sm:py-6 px-3 sm:px-6 select-none print:bg-white print:p-0">
    <!-- Top Global Header (Hidden in Print) -->
    <div v-if="currentStep !== 'print'" class="max-w-6xl mx-auto mb-4 flex items-center justify-between">
      <button
        @click="goBack"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border border-amber-300 shadow-2xs cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>返回数理馆</span>
      </button>

      <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
        <button @click="router.push('/')" class="hover:text-blue-600 hover:underline">学堂大厅</button>
        <span>/</span>
        <button @click="router.push('/subject/math')" class="hover:text-blue-600 hover:underline">数理馆</button>
        <span>/</span>
        <span class="text-blue-700 font-black">口算全卷挑战</span>
      </div>
    </div>

    <!-- ==========================================
         STEP 1: CONFIGURATION SCREEN (出题配置中心)
         ========================================== -->
    <main v-if="currentStep === 'config'" class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <!-- Hero Banner -->
      <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 space-y-2">
          <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black">
            <Sparkles class="w-3.5 h-3.5 text-amber-300" />
            <span>智能组卷 · 连续作答 · 统一交卷判分与对错解析</span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-cartoon font-bold text-white tracking-wide drop-shadow-sm">
            数学口算全卷天天练 (30题进退位考卷)
          </h1>
          <p class="text-xs sm:text-sm text-white/90 font-medium max-w-xl leading-relaxed">
            严谨强化进位加法与退位减法！一口气做完30题后统一交卷，生成深度诊断与保姆级竖式对错解析。
          </p>
        </div>
      </div>

      <!-- Scope Selector -->
      <div class="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-md space-y-4">
        <h2 class="text-lg font-cartoon font-bold text-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>🎯</span>
            <span>选择出题计算难度与范围</span>
          </div>
          <span class="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            难度升级 · 严格保证进退位
          </span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            v-for="opt in DRILL_TYPE_OPTIONS"
            :key="opt.id"
            @click="selectedType = opt.id"
            :class="[
              'p-4 rounded-2xl border-3 transition-all cursor-pointer flex flex-col justify-between',
              selectedType === opt.id
                ? 'bg-blue-50/90 border-blue-500 shadow-md scale-[1.01] ring-2 ring-blue-200'
                : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'
            ]"
          >
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-black text-base text-slate-900">{{ opt.name }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-black',
                    opt.badge === '推荐首选' ? 'bg-amber-400 text-amber-950 shadow-2xs' : 'bg-blue-100 text-blue-800'
                  ]"
                >
                  {{ opt.badge }}
                </span>
              </div>
              <p class="text-xs text-slate-500 font-bold leading-relaxed">
                {{ opt.desc }}
              </p>
            </div>
            <div class="mt-2.5 text-[11px] font-black text-blue-700">
              适合：{{ opt.grade }}
            </div>
          </div>
        </div>
      </div>

      <!-- Question Count Picker (Default 30 Questions) -->
      <div class="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-md space-y-4">
        <h2 class="text-lg font-cartoon font-bold text-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>📝</span>
            <span>选择试卷题量 (默认 30 题标准试卷)</span>
          </div>
          <span class="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            全部做完后统一交卷
          </span>
        </h2>

        <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          <button
            v-for="cnt in [10, 20, 30, 50, 100]"
            :key="cnt"
            @click="selectedCount = cnt"
            :class="[
              'py-3.5 px-3 rounded-2xl font-black text-base border-3 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5',
              selectedCount === cnt
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg scale-105 ring-2 ring-blue-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
            ]"
          >
            <span class="text-xl sm:text-2xl">{{ cnt }} 题</span>
            <span class="text-[10px] opacity-90 font-bold">
              {{ cnt === 30 ? '🔥 推荐标准卷' : cnt === 20 ? '快速巩固' : cnt === 10 ? '精悍小测' : cnt === 50 ? '深度冲刺' : '百题耐力王' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <button
          @click="startDrill"
          class="flex-1 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base sm:text-xl shadow-lg hover:shadow-blue-200 transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer min-w-0"
        >
          <Play class="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0" />
          <span class="hidden sm:inline">开始连续作答 ({{ selectedCount }}题 · 答完交卷)</span>
          <span class="sm:hidden truncate">开始连续作答 ({{ selectedCount }}题)</span>
        </button>

        <button
          @click="openPrintMode"
          class="py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-white border-2 border-blue-300 hover:border-blue-500 text-blue-700 font-black text-sm sm:text-base shadow-sm hover:bg-blue-50/50 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
        >
          <Printer class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span class="hidden sm:inline">生成 A4 纸质试卷与答案</span>
          <span class="sm:hidden">🖨️ A4 试卷</span>
        </button>
      </div>
    </main>

    <!-- ==========================================
         STEP 2: EXAM PLAYING (连续作答 · 答题卡 · 统一交卷)
         ========================================== -->
    <main v-else-if="currentStep === 'playing' && currentQuestion" class="max-w-6xl mx-auto animate-fade-in space-y-4">
      
      <!-- Top Exam HUD & Question Palette Navigator (30题答题卡) -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-100 shadow-md space-y-3.5">
        
        <!-- Status Bar -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2.5">
            <span class="px-3.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-black shadow-xs">
              第 {{ currentIdx + 1 }} / {{ questions.length }} 题
            </span>
            <span class="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              已答 <strong class="text-blue-600">{{ answeredCount }}</strong> 题 · 剩余 <strong class="text-rose-500">{{ unansweredCount }}</strong> 题
            </span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Timer -->
            <div class="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-black">
              <Clock class="w-3.5 h-3.5 text-amber-600" />
              <span>用时：{{ formattedTime }}</span>
            </div>

            <!-- Hand-in / Submit Button -->
            <button
              @click="triggerSubmitConfirm"
              class="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-emerald-200 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send class="w-3.5 h-3.5" />
              <span>交卷判分</span>
            </button>
          </div>
        </div>

        <!-- 30 Questions Visual Grid Bar (答题卡横向快速切换) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          <button
            v-for="(q, idx) in questions"
            :key="q.id"
            @click="jumpToQuestion(idx)"
            :class="[
              'w-8 h-8 rounded-xl text-xs font-black shrink-0 transition-all flex items-center justify-center cursor-pointer border-2',
              idx === currentIdx
                ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300 scale-110'
                : q.userAnswer !== undefined && q.userAnswer !== null
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
            ]"
            :title="`第 ${idx + 1} 题${q.userAnswer !== undefined && q.userAnswer !== null ? ' (已作答: ' + q.userAnswer + ')' : ' (未作答)'}`"
          >
            {{ idx + 1 }}
          </button>
        </div>
      </div>

      <!-- Main Studio: Left Math Question & Input + Right Scratchpad Canvas -->
      <!-- Mobile Mode Switcher (Hidden on Tablet / Desktop >= md) -->
      <div class="md:hidden flex items-center bg-blue-50/80 p-1 rounded-2xl border border-blue-200 shadow-2xs">
        <button
          @click="mobileViewMode = 'keypad'"
          :class="[
            'flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer',
            mobileViewMode === 'keypad'
              ? 'bg-white text-blue-800 shadow-sm'
              : 'text-slate-600 hover:text-blue-700'
          ]"
        >
          <span>🔢 答题键盘</span>
        </button>
        <button
          @click="mobileViewMode = 'scratchpad'; nextTick(() => initCanvas())"
          :class="[
            'flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer',
            mobileViewMode === 'scratchpad'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-amber-700'
          ]"
        >
          <span>📝 验算草稿板</span>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        </button>
      </div>

      <!-- Main Studio: Left Math Question & Input + Right Scratchpad Canvas -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        
        <!-- LEFT: Arithmetic Problem & Answer Keypad (占 5 列) -->
        <div
          class="md:col-span-5 flex-col justify-between space-y-3 sm:space-y-4"
          :class="mobileViewMode === 'scratchpad' ? 'hidden md:flex' : 'flex'"
        >
          <!-- Problem Equation Card -->
          <div class="rounded-3xl p-6 sm:p-7 border-3 border-blue-200 bg-white shadow-lg text-center flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden">
            <!-- Category Tag -->
            <div class="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-2">
              <span>{{ currentQuestion.categoryName }}</span>
            </div>

            <!-- Big Math Formula Expression -->
            <div class="text-4xl sm:text-5xl font-black text-slate-900 tracking-wider flex items-center justify-center gap-3">
              <span>{{ currentQuestion.expression }}</span>
              <span class="text-blue-500 font-extrabold">=</span>
              <span
                :class="[
                  'inline-flex items-center justify-center min-w-[3.5rem] h-14 sm:h-16 px-3.5 rounded-2xl border-3 text-3xl sm:text-4xl font-black shadow-inner transition-all',
                  inputAnswer
                    ? 'bg-blue-50/80 border-blue-500 text-blue-800'
                    : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
                ]"
              >
                {{ inputAnswer || '?' }}
              </span>
            </div>

            <div class="text-[11px] font-bold text-slate-400 mt-2">
              键盘可直接输入数字，按回车或“下一题”保存并进入下一题
            </div>
          </div>

          <!-- Large Numeric Keypad -->
          <div class="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm space-y-2.5">
            <div class="grid grid-cols-3 gap-2.5">
              <button
                v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                :key="n"
                @click="handleNumberInput(n)"
                class="py-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 font-black text-2xl text-slate-800 shadow-2xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                {{ n }}
              </button>

              <button
                @click="handleClear"
                class="py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 font-black text-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                清空
              </button>

              <button
                @click="handleNumberInput('0')"
                class="py-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 font-black text-2xl text-slate-800 shadow-2xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                0
              </button>

              <button
                @click="handleDelete"
                class="py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-200 font-black text-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                ⌫ 删除
              </button>
            </div>

            <!-- Navigation Buttons: Previous & Next / Submit -->
            <button
              @click="mobileViewMode = 'scratchpad'; nextTick(() => initCanvas())"
              class="md:hidden w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <span>📝 切换至手写草稿板（同屏演算不上下滑动）</span>
            </button>

            <!-- Navigation Buttons: Previous & Next / Submit -->
            <div class="flex items-center gap-2 pt-1">
              <button
                @click="goToPrev"
                :disabled="currentIdx === 0"
                class="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft class="w-4 h-4" />
                <span>上一题</span>
              </button>

              <button
                v-if="currentIdx < questions.length - 1"
                @click="goToNext"
                class="flex-1 py-3.5 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-black text-sm sm:text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer min-w-0"
              >
                <span class="hidden sm:inline">保存并下一题</span>
                <span class="sm:hidden truncate">下一题</span>
                <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </button>

              <button
                v-else
                @click="triggerSubmitConfirm"
                class="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-black text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send class="w-5 h-5" />
                <span>全部完成 · 准备交卷</span>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: TABLET STYLUS SCRATCHPAD CANVAS (占 7 列) -->
        <div
          class="md:col-span-7 bg-white rounded-3xl p-3.5 sm:p-5 border-3 border-amber-300 shadow-xl flex-col justify-between min-h-[380px] sm:min-h-[420px]"
          :class="mobileViewMode === 'keypad' ? 'hidden md:flex' : 'flex'"
        >
          <!-- Mobile Pinned Problem Header in Scratchpad Mode -->
          <div class="md:hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-2 px-3 mb-2 flex items-center justify-between shadow-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full shrink-0">第 {{ currentIdx + 1 }} 题</span>
              <span class="text-base font-black tracking-wider truncate">{{ currentQuestion.expression }} =</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div
                :class="[
                  'min-w-[3rem] h-8 rounded-xl border-2 flex items-center justify-center px-2 text-base font-black',
                  inputAnswer ? 'bg-white text-blue-900 border-white' : 'bg-white/15 text-white border-white/30'
                ]"
              >
                {{ inputAnswer || '?' }}
              </div>
              <button
                @click="mobileViewMode = 'keypad'"
                class="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-black rounded-xl active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                切回键盘
              </button>
            </div>
          </div>
          
          <!-- Scratchpad Toolbar -->
          <div class="flex items-center justify-between pb-3 border-b border-amber-100 gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>📝</span>
                <span>手写演算草稿板</span>
              </span>
              <span class="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline">
                支持平板手写笔 · 竖式进退位演算
              </span>
            </div>

            <!-- Tools: Pen / Eraser / Color / Clear -->
            <div class="flex items-center gap-2">
              <!-- Pen tool -->
              <button
                @click="currentTool = 'pen'"
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-all',
                  currentTool === 'pen'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <PenTool class="w-3.5 h-3.5" />
                <span>铅笔</span>
              </button>

              <!-- Color choices for pen -->
              <div v-if="currentTool === 'pen'" class="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  v-for="col in ['#1e3a8a', '#b91c1c', '#15803d', '#0f172a']"
                  :key="col"
                  @click="penColor = col"
                  :class="[
                    'w-5 h-5 rounded-full transition-transform cursor-pointer',
                    penColor === col ? 'scale-125 ring-2 ring-offset-1 ring-blue-500' : 'opacity-70 hover:opacity-100'
                  ]"
                  :style="{ backgroundColor: col }"
                ></button>
              </div>

              <!-- Eraser tool -->
              <button
                @click="currentTool = 'eraser'"
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-all',
                  currentTool === 'eraser'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <Eraser class="w-3.5 h-3.5" />
                <span>橡皮</span>
              </button>

              <!-- Clear Canvas Button -->
              <button
                @click="clearCanvas"
                class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="清空草稿"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>清空草稿</span>
              </button>
            </div>
          </div>

          <!-- Canvas Paper Area with Subtle Grid Background -->
          <div class="relative flex-1 rounded-2xl bg-[#FFFDF9] border-2 border-dashed border-amber-200 overflow-hidden my-2 cursor-crosshair min-h-[300px]">
            <!-- Grid Lines pattern background -->
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#f3ede2_1px,transparent_1px),linear-gradient(to_bottom,#f3ede2_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-80"></div>

            <!-- HTML5 Interactive Canvas -->
            <canvas
              ref="canvasRef"
              class="relative z-10 w-full h-full touch-none"
              @mousedown="startDraw"
              @mousemove="draw"
              @mouseup="stopDraw"
              @mouseleave="stopDraw"
              @touchstart.passive="startDraw"
              @touchmove.prevent="draw"
              @touchend="stopDraw"
            ></canvas>

            <div class="absolute bottom-2 right-3 z-0 text-[11px] font-bold text-slate-300 pointer-events-none select-none">
              草稿演算区 · 自由列竖式
            </div>
          </div>

          <!-- Mobile Quick Numeric Ribbon (免切键盘直接输入答案并下一题) -->
          <div class="md:hidden pt-2 border-t border-amber-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']"
              :key="num"
              @click="handleNumberInput(num)"
              class="w-7 h-8 rounded-xl bg-slate-100 active:bg-blue-200 border border-slate-300 font-black text-sm text-slate-800 shrink-0 flex items-center justify-center active:scale-95 cursor-pointer"
            >
              {{ num }}
            </button>
            <button
              @click="handleDelete"
              class="px-2 h-8 rounded-xl bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs shrink-0 flex items-center justify-center cursor-pointer"
              title="删除"
            >
              ⌫
            </button>
            <button
              @click="handleClear"
              class="px-1.5 h-8 rounded-xl bg-rose-100 active:bg-rose-200 text-rose-800 border border-rose-300 font-black text-xs shrink-0 flex items-center justify-center cursor-pointer"
              title="清空"
            >
              清
            </button>
            <button
              @click="goToNext"
              class="flex-1 min-w-[62px] h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shrink-0 flex items-center justify-center gap-0.5 shadow-xs ml-0.5 cursor-pointer"
            >
              <span>{{ currentIdx < questions.length - 1 ? '下一题' : '交卷' }}</span>
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>

          <div class="hidden md:flex text-[11px] text-slate-400 font-bold items-center justify-between px-1">
            <span>💡 提示：可以在草稿纸上自由演算，写好后在左侧输入答案</span>
            <span class="text-amber-700 font-semibold">支持点击上方答题卡随意检查修改</span>
          </div>

        </div>

      </div>

      <!-- Submit Confirmation Modal -->
      <div
        v-if="isSubmitModalOpen"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      >
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-3 border-blue-200 text-center space-y-4 animate-pop-in">
          <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto border-2 border-blue-200">
            📑
          </div>

          <h3 class="text-xl font-cartoon font-bold text-slate-900">
            确认交卷并查看成绩？
          </h3>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 space-y-2 text-left">
            <div class="flex items-center justify-between">
              <span>试卷总题数：</span>
              <span class="font-black text-slate-900">{{ questions.length }} 题</span>
            </div>
            <div class="flex items-center justify-between">
              <span>已完成作答：</span>
              <span class="font-black text-emerald-600">{{ answeredCount }} 题</span>
            </div>
            <div class="flex items-center justify-between">
              <span>未作答题数：</span>
              <span :class="['font-black', unansweredCount > 0 ? 'text-rose-600' : 'text-slate-500']">
                {{ unansweredCount }} 题
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>当前已用时：</span>
              <span class="font-black text-slate-800">{{ formattedTime }}</span>
            </div>
          </div>

          <p v-if="unansweredCount > 0" class="text-xs text-rose-500 font-bold">
            ⚠️ 提示：你还有 {{ unansweredCount }} 道题未填写答案，未作答将按 0 分计算。
          </p>
          <p v-else class="text-xs text-emerald-600 font-bold">
            🎉 全部题目已完成作答！准备好查看你的得分和详细解析了吗？
          </p>

          <div class="flex items-center gap-3 pt-2">
            <button
              @click="isSubmitModalOpen = false"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl text-sm transition-all cursor-pointer"
            >
              继续答题检查
            </button>
            <button
              @click="submitExam"
              class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-black rounded-2xl text-sm shadow-md transition-all cursor-pointer"
            >
              确认交卷判分
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- ==========================================
         STEP 3: RESULT & REPORT SCREEN (交卷结算 & 深度对错诊断)
         ========================================== -->
    <main v-else-if="currentStep === 'result'" class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Top Score Hero Card -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-3 border-blue-200 shadow-2xl text-center space-y-6">
        <div class="text-6xl animate-bounce">
          {{ score === 100 ? '👑' : score >= 90 ? '🏆' : score >= 60 ? '🌟' : '💪' }}
        </div>

        <div>
          <h2 class="text-2xl sm:text-3xl font-cartoon font-bold text-slate-900">
            {{ score === 100 ? '满分口算大师！太神啦！' : score >= 90 ? '优秀！口算高能达人！' : score >= 60 ? '顺利交卷，掌握良好！' : '再接再厉，逐题攻克难点！' }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-bold mt-1">
            完成 {{ questions.length }} 道 100 以内进位退位口算全卷挑战
          </p>
        </div>

        <!-- Score & Key Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/70 rounded-2xl p-4 border border-blue-100">
          <div class="p-2">
            <div class="text-[11px] font-bold text-slate-500">最终总分</div>
            <div class="text-3xl sm:text-4xl font-black text-blue-600 mt-0.5">{{ score }} <span class="text-sm font-bold">分</span></div>
          </div>
          <div class="p-2">
            <div class="text-[11px] font-bold text-slate-500">答对 / 总题</div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {{ correctQuestions.length }} / {{ questions.length }}
            </div>
          </div>
          <div class="p-2">
            <div class="text-[11px] font-bold text-slate-500">答题总用时</div>
            <div class="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{{ formattedTime }}</div>
          </div>
          <div class="p-2">
            <div class="text-[11px] font-bold text-slate-500">平均每题</div>
            <div class="text-2xl sm:text-3xl font-black text-purple-600 mt-1">{{ averageTimePerQuestion }} <span class="text-sm font-bold">秒</span></div>
          </div>
        </div>

        <!-- Diagnostic Feedback Banner -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 text-left flex items-start gap-3">
          <div class="text-2xl shrink-0 mt-0.5">💡</div>
          <div class="space-y-1">
            <div class="text-xs font-black text-amber-900">学情深度诊断与提分建议：</div>
            <div class="text-xs text-amber-800 font-medium leading-relaxed">
              {{ diagnosticAdvice }}
            </div>
          </div>
        </div>

        <!-- Capability Breakdown Breakdown Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div v-if="carryAddStats" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span class="text-xs font-black text-slate-800">进位加法专项 (满十进一)</span>
              <div class="text-[11px] text-slate-500 font-bold mt-0.5">
                做对 {{ carryAddStats.correct }} / {{ carryAddStats.total }} 题
              </div>
            </div>
            <div class="text-right">
              <span :class="['text-base font-black', carryAddStats.rate >= 80 ? 'text-emerald-600' : 'text-amber-600']">
                {{ carryAddStats.rate }}% 正确率
              </span>
            </div>
          </div>

          <div v-if="borrowSubStats" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span class="text-xs font-black text-slate-800">退位减法专项 (借一当十)</span>
              <div class="text-[11px] text-slate-500 font-bold mt-0.5">
                做对 {{ borrowSubStats.correct }} / {{ borrowSubStats.total }} 题
              </div>
            </div>
            <div class="text-right">
              <span :class="['text-base font-black', borrowSubStats.rate >= 80 ? 'text-emerald-600' : 'text-rose-600']">
                {{ borrowSubStats.rate }}% 正确率
              </span>
            </div>
          </div>
                  <div v-if="mixedStats" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span class="text-xs font-black text-slate-800">加减混合专项 (多步心算)</span>
              <div class="text-[11px] text-slate-500 font-bold mt-0.5">
                做对 {{ mixedStats.correct }} / {{ mixedStats.total }} 题
              </div>
            </div>
            <div class="text-right">
              <span :class="['text-base font-black', mixedStats.rate >= 80 ? 'text-emerald-600' : 'text-amber-600']">
                {{ mixedStats.rate }}% 正确率
              </span>
            </div>
          </div>
        </div>

        <!-- 30-Question Answer Sheet Map (答题卡对错全景图) -->
        <div class="space-y-3 pt-2 text-left">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>📋</span>
              <span>全卷答题卡总览 (点击题号定位解析)</span>
            </h3>
            <div class="flex items-center gap-3 text-[11px] font-bold text-slate-500">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>正确 ({{ correctQuestions.length }})</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>错误/未答 ({{ wrongQuestions.length }})</span>
            </div>
          </div>

          <div class="grid grid-cols-6 sm:grid-cols-10 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <button
              v-for="(q, idx) in questions"
              :key="q.id"
              @click="scrollToResultQuestion(q.id)"
              :class="[
                'h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-0.5 cursor-pointer border-2',
                q.isCorrect === true
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs hover:bg-emerald-600'
                  : 'bg-rose-500 text-white border-rose-600 shadow-2xs hover:bg-rose-600 animate-pulse-subtle'
              ]"
              :title="`第 ${idx + 1} 题: ${q.expression} = ${q.correctAnswer} (${q.isCorrect ? '正确' : '做错'})`"
            >
              <span>{{ idx + 1 }}</span>
              <Check v-if="q.isCorrect === true" class="w-3 h-3 stroke-[3]" />
              <X v-else class="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <button
            v-if="wrongQuestions.length > 0"
            @click="retryMistakes"
            class="flex-1 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>一键重练本次 {{ wrongQuestions.length }} 道错题</span>
          </button>

          <button
            @click="startDrill"
            class="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play class="w-4 h-4 fill-current" />
            <span>再来一套全新 {{ selectedCount }} 题</span>
          </button>

          <button
            @click="openPrintMode"
            class="py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-black text-sm rounded-2xl border-2 border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>打印试卷与解析</span>
          </button>
        </div>
      </div>

      <!-- ==========================================
           DETAILED QUESTION ANALYSIS & STEP EXPLANATIONS
           ========================================== -->
      <div class="space-y-4">
        <!-- Filter Tabs -->
        <div class="flex items-center justify-between gap-3 flex-wrap bg-white rounded-2xl p-3 border-2 border-blue-100 shadow-xs">
          <div class="flex items-center gap-2">
            <BookOpen class="w-4 h-4 text-blue-600" />
            <span class="text-sm font-black text-slate-800">全卷逐题深度解析与思路拆解</span>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              @click="resultFilter = 'all'"
              :class="[
                'px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer',
                resultFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              全部题目 ({{ questions.length }})
            </button>
            <button
              @click="resultFilter = 'wrong'"
              :class="[
                'px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer',
                resultFilter === 'wrong'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              ]"
            >
              仅看错题 ({{ wrongQuestions.length }})
            </button>
            <button
              v-if="carryAddStats"
              @click="resultFilter = 'carry'"
              :class="[
                'px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer',
                resultFilter === 'carry'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              进位加法 ({{ carryAddStats.total }})
            </button>
            <button
              v-if="borrowSubStats"
              @click="resultFilter = 'borrow'"
              :class="[
                'px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer',
                resultFilter === 'borrow'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              退位减法 ({{ borrowSubStats.total }})
            </button>
            <button
              v-if="mixedStats"
              @click="resultFilter = 'mixed'"
              :class="[
                'px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer',
                resultFilter === 'mixed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              加减混合 ({{ mixedStats.total }})
            </button>
          </div>
        </div>

        <!-- Question Explanations List -->
        <div class="space-y-3.5">
          <div
            v-for="q in displayedResultQuestions"
            :id="`result-q-${q.id}`"
            :key="q.id"
            :class="[
              'rounded-3xl p-5 sm:p-6 border-3 transition-all duration-300 space-y-3.5 bg-white',
              q.isCorrect === true
                ? 'border-emerald-200 shadow-xs'
                : 'border-rose-300 shadow-md bg-rose-50/30'
            ]"
          >
            <!-- Card Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center text-white',
                    q.isCorrect === true ? 'bg-emerald-500' : 'bg-rose-500'
                  ]"
                >
                  {{ questions.indexOf(q) + 1 }}
                </span>
                <span class="text-xs font-black text-slate-800">
                  {{ q.categoryName }}
                </span>
              </div>

              <!-- Answer Status Tag -->
              <div class="flex items-center gap-2">
                <span v-if="q.isCorrect === true" class="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>回答正确</span>
                </span>
                <span v-else class="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                  <XCircle class="w-3.5 h-3.5" />
                  <span>回答错误</span>
                </span>
              </div>
            </div>

            <!-- Problem & Answer Comparison Line -->
            <div class="flex items-center justify-between flex-wrap gap-4 py-1">
              <!-- Equation -->
              <div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
                <span>{{ q.expression }}</span>
                <span class="text-blue-500 mx-2">=</span>
                <span class="text-emerald-600 font-extrabold">{{ q.correctAnswer }}</span>
              </div>

              <!-- User vs Correct -->
              <div class="flex items-center gap-4 text-xs font-black">
                <div class="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span class="text-slate-400">你的作答：</span>
                  <span :class="q.isCorrect === true ? 'text-emerald-600 text-sm' : 'text-rose-600 text-sm line-through'">
                    {{ q.userAnswer !== undefined && q.userAnswer !== null ? q.userAnswer : '未作答' }}
                  </span>
                </div>

                <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span class="text-emerald-800">标准答案：</span>
                  <span class="text-emerald-700 text-sm font-black">{{ q.correctAnswer }}</span>
                </div>
              </div>
            </div>

            <!-- Step-by-Step Educational Explanation Box -->
            <div class="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1.5">
              <div class="font-black flex items-center gap-1 text-blue-900">
                <Sparkles class="w-3.5 h-3.5 text-blue-600" />
                <span>思维精讲与竖式拆解：</span>
              </div>
              <p class="font-medium leading-relaxed pl-4 border-l-2 border-blue-400">
                {{ q.explanation }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ==========================================
         STEP 4: A4 STANDARD PRINTABLE WORKSHEET (带答案与解析)
         ========================================== -->
    <main v-else-if="currentStep === 'print'" class="max-w-4xl mx-auto animate-fade-in">
      <!-- Print Control Toolbar (Hidden in Print) -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-100 shadow-md mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          @click="currentStep = 'config'"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回配置中心</span>
        </button>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 text-xs font-black text-slate-700 cursor-pointer">
            <input type="checkbox" v-model="showAnswerKeyInPrint" class="rounded text-blue-600 focus:ring-blue-500" />
            <span>在题单末尾附带参考答案与解析</span>
          </label>

          <button
            @click="triggerSystemPrint"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>立即打印 (Print A4)</span>
          </button>
        </div>
      </div>

      <!-- Printable Sheet Canvas (Standard A4 Page) -->
      <div class="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-lg print:border-none print:shadow-none print:p-0">
        <!-- Worksheet Header -->
        <div class="text-center pb-6 border-b-2 border-slate-900 mb-6">
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-slate-900 tracking-wider mb-2">
            一诺未来学堂 · 小学数学口算全卷天天练
          </h1>
          <div class="text-xs text-slate-600 font-bold mb-4">
            专项：100 以内进位退位加减法练习题单（题量：{{ questions.length }} 题）
          </div>

          <!-- Student Info Line -->
          <div class="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 px-4">
            <span>班级：___________</span>
            <span>姓名：___________</span>
            <span>日期：____月____日</span>
            <span>用时：____分____秒</span>
            <span>得分：___________</span>
          </div>
        </div>

        <!-- 3-Column Math Questions Grid -->
        <div class="grid grid-cols-3 gap-y-6 gap-x-8 text-base sm:text-lg font-black text-slate-900 font-mono">
          <div
            v-for="(q, i) in questions"
            :key="q.id"
            class="flex items-center justify-between border-b border-dashed border-slate-300 pb-1"
          >
            <span class="text-xs text-slate-400 font-sans mr-2">({{ i + 1 }})</span>
            <span class="tracking-wide">{{ q.expression }} = </span>
            <span class="w-12"></span>
          </div>
        </div>

        <!-- Optional Answer Key & Explanations on the bottom -->
        <div v-if="showAnswerKeyInPrint" class="mt-12 pt-6 border-t-2 border-slate-300 text-xs text-slate-600">
          <div class="font-black text-slate-900 mb-2">【参考答案与关键解析】</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
            <div v-for="(q, i) in questions" :key="q.id" class="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span class="font-black text-slate-900">({{ i + 1 }}) {{ q.expression }} = {{ q.correctAnswer }}</span>
              <div class="text-[10px] text-slate-500 font-sans mt-0.5">{{ q.explanation }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes pulseSubtle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.92; transform: scale(0.98); }
}
.animate-pulse-subtle {
  animation: pulseSubtle 2s infinite ease-in-out;
}

@media print {
  body {
    background: white !important;
  }
}
</style>





