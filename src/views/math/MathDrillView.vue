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
  Flame,
  Zap,
  ArrowRight,
  PenTool,
  Eraser,
  Trash2,
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// Step state: 'config' | 'playing' | 'result' | 'print'
const currentStep = ref<'config' | 'playing' | 'result' | 'print'>('config');

// Config Options
const selectedType = ref<MathDrillType>('add_sub_100_carry');
const selectedCount = ref<number>(20);

// Drill State
const questions = ref<MathDrillQuestion[]>([]);
const currentIdx = ref(0);
const inputAnswer = ref('');
const isChecking = ref(false);
const comboStreak = ref(0);
const maxCombo = ref(0);

// Elapsed Timer (No stressful countdown, gentle relaxed tracking)
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
const showAnswerKeyInPrint = ref(false);

const currentQuestion = computed<MathDrillQuestion | null>(() => {
  return questions.value[currentIdx.value] || null;
});

const correctCount = computed(() => {
  return questions.value.filter(q => q.isCorrect).length;
});

const wrongQuestions = computed(() => {
  return questions.value.filter(q => q.isCorrect === false);
});

const score = computed(() => {
  if (questions.value.length === 0) return 0;
  return Math.round((correctCount.value / questions.value.length) * 100);
});

const averageTimePerQuestion = computed(() => {
  if (questions.value.length === 0 || totalTimeMs.value === 0) return 0;
  return ((totalTimeMs.value / 1000) / questions.value.length).toFixed(1);
});

const formattedTime = computed(() => {
  const min = Math.floor(elapsedTimeSec.value / 60);
  const sec = elapsedTimeSec.value % 60;
  return `${min > 0 ? min + '分' : ''}${sec}秒`;
});

// Canvas Setup
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

const startDrill = () => {
  playButtonSound();
  questions.value = generateDrillQuestions({
    type: selectedType.value,
    count: selectedCount.value
  });
  currentIdx.value = 0;
  inputAnswer.value = '';
  isChecking.value = false;
  comboStreak.value = 0;
  maxCombo.value = 0;
  elapsedTimeSec.value = 0;
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

const handleNumberInput = (num: string) => {
  if (isChecking.value) return;
  playStoneSound();
  if (inputAnswer.value.length < 5) {
    inputAnswer.value += num;
  }
};

const handleDelete = () => {
  if (isChecking.value) return;
  playButtonSound();
  inputAnswer.value = inputAnswer.value.slice(0, -1);
};

const handleClear = () => {
  if (isChecking.value) return;
  playButtonSound();
  inputAnswer.value = '';
};

const submitAnswer = () => {
  if (isChecking.value || !inputAnswer.value || !currentQuestion.value) return;

  const userNum = parseInt(inputAnswer.value, 10);
  const isRight = userNum === currentQuestion.value.correctAnswer;

  currentQuestion.value.userAnswer = userNum;
  currentQuestion.value.isCorrect = isRight;

  isChecking.value = true;

  if (isRight) {
    playWinSound();
    comboStreak.value++;
    if (comboStreak.value > maxCombo.value) maxCombo.value = comboStreak.value;
    if (comboStreak.value >= 3 && comboStreak.value % 3 === 0) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  } else {
    playErrorSound();
    comboStreak.value = 0;
  }

  setTimeout(() => {
    if (currentIdx.value < questions.value.length - 1) {
      currentIdx.value++;
      inputAnswer.value = '';
      isChecking.value = false;
      // Auto clean scratchpad for next question
      clearCanvas();
    } else {
      finishDrill();
    }
  }, isRight ? 400 : 1000);
};

const finishDrill = () => {
  clearInterval(timerInterval);
  totalTimeMs.value = Date.now() - startTime.value;
  currentStep.value = 'result';

  const rewardCoins = Math.round(score.value / 2);
  const rewardExp = score.value;
  userStore.addCoins(rewardCoins, `完成口算天天练(${selectedCount.value}题)`);
  userStore.addExp(rewardExp);

  if (score.value >= 90) {
    playWinSound();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    speakText('太棒啦！口算全对，表现真优秀！');
  } else {
    speakText(`完成口算练习，得分 ${score.value} 分，继续加油！`);
  }
};

const openPrintMode = () => {
  playButtonSound();
  questions.value = generateDrillQuestions({
    type: selectedType.value,
    count: selectedCount.value
  });
  currentStep.value = 'print';
};

const triggerSystemPrint = () => {
  window.print();
};

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
  isChecking.value = false;
  comboStreak.value = 0;
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

// Physical keyboard support
const handleKeyDown = (e: KeyboardEvent) => {
  if (currentStep.value !== 'playing') return;

  if (e.key >= '0' && e.key <= '9') {
    handleNumberInput(e.key);
  } else if (e.key === 'Backspace') {
    handleDelete();
  } else if (e.key === 'Enter') {
    submitAnswer();
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
  <div class="min-h-screen bg-[#FDFBF7] py-4 sm:py-6 px-3 sm:px-6 select-none print:bg-white print:p-0">
    <!-- Top Global Header (Hidden in Print) -->
    <div v-if="currentStep !== 'print'" class="max-w-6xl mx-auto mb-4 flex items-center justify-between">
      <button
        @click="goBack"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border border-amber-300 shadow-2xs cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>返回数理馆</span>
      </button>

      <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
        <button @click="router.push('/')" class="hover:text-blue-600 hover:underline">学堂大厅</button>
        <span>/</span>
        <button @click="router.push('/subject/math')" class="hover:text-blue-600 hover:underline">数理馆</button>
        <span>/</span>
        <span class="text-blue-700 font-black">口算天天练</span>
      </div>
    </div>

    <!-- ==========================================
         STEP 1: CONFIGURATION SCREEN (出题配置中心)
         ========================================== -->
    <main v-if="currentStep === 'config'" class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <!-- Hero Banner -->
      <div class="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 space-y-2">
          <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black">
            <Zap class="w-3.5 h-3.5 text-amber-300" />
            <span>小学一二年级核心 · 平板手写草稿与口算</span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-cartoon font-bold text-white tracking-wide drop-shadow-sm">
            数学口算天天练 (Daily Math Drill)
          </h1>
          <p class="text-xs sm:text-sm text-white/90 font-medium max-w-xl">
            专为平板手写笔优化！内置流畅演算草稿纸、100以内加减法动态防重出题与 A4 纸质题单生成。
          </p>
        </div>
      </div>

      <!-- Scope Selector -->
      <div class="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-md space-y-4">
        <h2 class="text-lg font-cartoon font-bold text-slate-800 flex items-center gap-2">
          <span>🎯</span>
          <span>选择出题计算范围</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            v-for="opt in DRILL_TYPE_OPTIONS"
            :key="opt.id"
            @click="selectedType = opt.id"
            :class="[
              'p-4 rounded-2xl border-3 transition-all cursor-pointer flex flex-col justify-between',
              selectedType === opt.id
                ? 'bg-blue-50/80 border-blue-500 shadow-md scale-102 ring-2 ring-blue-200'
                : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'
            ]"
          >
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-black text-base text-slate-900">{{ opt.name }}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                  {{ opt.badge }}
                </span>
              </div>
              <p class="text-xs text-slate-500 font-bold leading-relaxed">
                {{ opt.desc }}
              </p>
            </div>
            <div class="mt-2 text-[10px] font-bold text-blue-600">
              适合：{{ opt.grade }}
            </div>
          </div>
        </div>
      </div>

      <!-- Question Count Picker -->
      <div class="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-md space-y-4">
        <h2 class="text-lg font-cartoon font-bold text-slate-800 flex items-center gap-2">
          <span>📝</span>
          <span>选择每日练习题量</span>
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="cnt in [10, 20, 30, 50]"
            :key="cnt"
            @click="selectedCount = cnt"
            :class="[
              'py-3.5 px-4 rounded-2xl font-black text-base border-3 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5',
              selectedCount === cnt
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400 shadow-lg scale-105'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
            ]"
          >
            <span class="text-xl sm:text-2xl">{{ cnt }} 题</span>
            <span class="text-[10px] opacity-80 font-bold">
              {{ cnt === 20 ? '🔥 推荐练习' : cnt === 10 ? '快速小测' : cnt === 30 ? '深度巩固' : '耐力进阶' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          @click="startDrill"
          class="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xl shadow-xl hover:shadow-blue-200 transform hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Play class="w-6 h-6 fill-current" />
          <span>开始手写草稿与口算 ({{ selectedCount }}题)</span>
        </button>

        <button
          @click="openPrintMode"
          class="py-4 px-6 rounded-2xl bg-white border-2 border-blue-300 hover:border-blue-500 text-blue-700 font-black text-base shadow-md hover:bg-blue-50/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Printer class="w-5 h-5" />
          <span>生成 A4 打印纸质题单</span>
        </button>
      </div>
    </main>

    <!-- ==========================================
         STEP 2: INTERACTIVE DRILL WITH SCRATCHPAD (左题右草稿)
         ========================================== -->
    <main v-else-if="currentStep === 'playing' && currentQuestion" class="max-w-6xl mx-auto animate-fade-in space-y-4">
      
      <!-- Top Status HUD (No Stressful Countdown!) -->
      <div class="bg-white rounded-2xl p-3.5 border-2 border-blue-100 shadow-xs flex items-center justify-between gap-4">
        <!-- Progress Counter -->
        <div class="flex items-center gap-2">
          <span class="px-3.5 py-1 bg-blue-500 text-white rounded-full text-xs font-black shadow-xs">
            第 {{ currentIdx + 1 }} / {{ questions.length }} 题
          </span>
          <span class="text-xs text-slate-400 font-bold hidden sm:inline">
            已完成 {{ currentIdx }} 题 (正确率: {{ currentIdx > 0 ? Math.round((correctCount / currentIdx) * 100) : 100 }}%)
          </span>
        </div>

        <!-- Combo Streak Tag -->
        <div v-if="comboStreak > 1" class="flex items-center gap-1 px-3 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full font-black text-xs animate-bounce">
          <Flame class="w-3.5 h-3.5 fill-current text-orange-500" />
          <span>{{ comboStreak }} 连对！</span>
        </div>

        <!-- Soft Elapsed Stopwatch -->
        <div class="text-xs text-slate-500 font-bold">
          已用时：<span class="font-black text-slate-800">{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Main Studio: Left Math Question + Right Scratchpad Canvas -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        <!-- LEFT: Arithmetic Problem & Answer Keypad (占 5 列) -->
        <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
          <!-- Problem Equation Card -->
          <div
            :class="[
              'rounded-3xl p-6 sm:p-8 border-4 shadow-lg text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[160px]',
              currentQuestion.isCorrect === true
                ? 'bg-emerald-50 border-emerald-400'
                : currentQuestion.isCorrect === false
                  ? 'bg-rose-50 border-rose-400 animate-shake'
                  : 'bg-white border-blue-200'
            ]"
          >
            <div class="text-4xl sm:text-6xl font-black text-slate-900 tracking-wider flex items-center justify-center gap-3">
              <span>{{ currentQuestion.expression }}</span>
              <span class="text-blue-500 font-extrabold">=</span>
              <span class="inline-flex items-center justify-center min-w-[3.5rem] h-14 sm:h-16 px-3 rounded-2xl bg-slate-50 border-3 border-dashed border-blue-300 text-blue-700 shadow-inner text-3xl sm:text-4xl">
                {{ inputAnswer || '?' }}
              </span>
            </div>

            <!-- Feedback -->
            <div v-if="currentQuestion.isCorrect === true" class="mt-3 flex items-center gap-1.5 text-emerald-600 font-black text-base animate-bounce">
              <CheckCircle2 class="w-5 h-5" />
              <span>回答正确！+10分</span>
            </div>
            <div v-else-if="currentQuestion.isCorrect === false" class="mt-3 flex items-center gap-1.5 text-rose-600 font-black text-sm">
              <XCircle class="w-5 h-5" />
              <span>正确答案是：{{ currentQuestion.correctAnswer }}</span>
            </div>
          </div>

          <!-- Large Numeric Keypad -->
          <div class="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm space-y-2.5">
            <div class="grid grid-cols-3 gap-2.5">
              <button
                v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                :key="n"
                @click="handleNumberInput(n)"
                :disabled="isChecking"
                class="py-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 font-black text-2xl text-slate-800 shadow-2xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                {{ n }}
              </button>

              <button
                @click="handleClear"
                :disabled="isChecking"
                class="py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 font-black text-base active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                清空
              </button>

              <button
                @click="handleNumberInput('0')"
                :disabled="isChecking"
                class="py-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 font-black text-2xl text-slate-800 shadow-2xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                0
              </button>

              <button
                @click="handleDelete"
                :disabled="isChecking"
                class="py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-200 font-black text-base active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                ⌫ 删除
              </button>
            </div>

            <!-- Submit Button -->
            <button
              @click="submitAnswer"
              :disabled="!inputAnswer || isChecking"
              class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 text-white font-black text-lg shadow-md disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>确认提交结果</span>
              <ArrowRight class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- RIGHT: TABLET STYLUS SCRATCHPAD CANVAS (占 7 列) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border-3 border-amber-300 shadow-xl flex flex-col justify-between min-h-[420px]">
          
          <!-- Scratchpad Toolbar -->
          <div class="flex items-center justify-between pb-3 border-b border-amber-100 gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>📝</span>
                <span>手写演算草稿板</span>
              </span>
              <span class="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline">
                支持平板手写笔 / 竖式计算
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

          <div class="text-[11px] text-slate-400 font-bold flex items-center justify-between px-1">
            <span>💡 提示：可以在草稿纸上随意列竖式计算，算好后在左侧输入答案</span>
            <span class="text-amber-700 font-semibold">进入下一题时会自动清空草稿</span>
          </div>

        </div>

      </div>
    </main>

    <!-- ==========================================
         STEP 3: RESULT & REPORT SCREEN (成绩结算)
         ========================================== -->
    <main v-else-if="currentStep === 'result'" class="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-3 border-blue-200 shadow-2xl text-center space-y-6">
        <div class="text-6xl animate-bounce">
          {{ score >= 90 ? '🏆' : score >= 60 ? '🌟' : '💪' }}
        </div>

        <div>
          <h2 class="text-2xl sm:text-3xl font-cartoon font-bold text-slate-900">
            {{ score === 100 ? '满分通关！太神啦！' : score >= 90 ? '优秀！口算小达人！' : score >= 60 ? '顺利完成，继续加油！' : '再接再厉，消灭错题！' }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-bold mt-1">
            完成 {{ questions.length }} 道 100 以内加减法口算练习
          </p>
        </div>

        <!-- Score & Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
          <div>
            <div class="text-[11px] font-bold text-slate-500">最终得分</div>
            <div class="text-2xl sm:text-3xl font-black text-blue-600">{{ score }} 分</div>
          </div>
          <div>
            <div class="text-[11px] font-bold text-slate-500">答对题目</div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-600">{{ correctCount }} / {{ questions.length }}</div>
          </div>
          <div>
            <div class="text-[11px] font-bold text-slate-500">总计用时</div>
            <div class="text-2xl sm:text-3xl font-black text-slate-800">{{ formattedTime }}</div>
          </div>
          <div>
            <div class="text-[11px] font-bold text-slate-500">平均每题</div>
            <div class="text-2xl sm:text-3xl font-black text-purple-600">{{ averageTimePerQuestion }} 秒</div>
          </div>
        </div>

        <!-- Mistakes List (if any) -->
        <div v-if="wrongQuestions.length > 0" class="text-left space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <h3 class="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>本次错题记录 ({{ wrongQuestions.length }}道)</span>
            </h3>
            <button
              @click="retryMistakes"
              class="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-rose-200 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>一键重练错题</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
            <div
              v-for="wq in wrongQuestions"
              :key="wq.id"
              class="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between text-sm font-black"
            >
              <span class="text-slate-800">{{ wq.expression }} = ?</span>
              <div class="text-xs flex items-center gap-2">
                <span class="text-rose-600 line-through">错答: {{ wq.userAnswer }}</span>
                <span class="text-emerald-600">正确: {{ wq.correctAnswer }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            @click="startDrill"
            class="flex-1 py-3.5 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>再练一组新题 (自动防重)</span>
          </button>

          <button
            @click="currentStep = 'config'"
            class="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-base rounded-2xl active:scale-95 transition-all cursor-pointer"
          >
            返回设置
          </button>
        </div>
      </div>
    </main>

    <!-- ==========================================
         STEP 4: A4 STANDARD PRINTABLE WORKSHEET
         ========================================== -->
    <main v-else-if="currentStep === 'print'" class="max-w-4xl mx-auto animate-fade-in">
      <!-- Print Control Toolbar (Hidden in Print) -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-100 shadow-md mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          @click="currentStep = 'config'"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回设置</span>
        </button>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 text-xs font-black text-slate-700 cursor-pointer">
            <input type="checkbox" v-model="showAnswerKeyInPrint" class="rounded text-blue-600 focus:ring-blue-500" />
            <span>在题单末尾附带参考答案</span>
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
            一诺未来学堂 · 小学数学口算天天练
          </h1>
          <div class="text-xs text-slate-600 font-bold mb-4">
            专项：100 以内加减法练习题单（题量：{{ questions.length }} 题）
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

        <!-- Optional Answer Key on the bottom -->
        <div v-if="showAnswerKeyInPrint" class="mt-12 pt-6 border-t-2 border-slate-300 text-xs text-slate-600">
          <div class="font-black text-slate-900 mb-2">【参考答案】</div>
          <div class="grid grid-cols-6 gap-2 font-mono">
            <div v-for="(q, i) in questions" :key="q.id">
              ({{ i + 1 }}) {{ q.correctAnswer }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.35s ease-in-out;
}

@media print {
  body {
    background: white !important;
  }
}
</style>

