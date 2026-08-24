<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  SCHOOL_STAGES,
  K12_SUBJECTS,
  generateExamPaper
} from '../data/k12Curriculum';
import type {
  SchoolStage,
  GradeLevel,
  SubjectId,
  ExamRegion,
  ExamType,
  ExamPaper,
  ExamQuestion
} from '../types/curriculum';
import { useUserStore } from '../stores/useUserStore';
import { useAiTutorStore } from '../stores/useAiTutorStore';
import { playButtonSound, playWinSound, playErrorSound } from '../lib/audio';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Sparkles,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Bot,
  Zap
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const tutorStore = useAiTutorStore();

// Configuration State
const selectedStage = ref<SchoolStage>('primary');
const selectedGrade = ref<GradeLevel>('g1_t1');
const selectedSubject = ref<SubjectId>('math');
const selectedExamType = ref<ExamType>('midterm');
const selectedRegion = ref<ExamRegion>('hengshui');
const questionCount = ref<number>(20);

// Paper State
const currentStep = ref<'config' | 'exam' | 'result' | 'history'>('config');
const currentPaper = ref<ExamPaper | null>(null);
const userAnswers = ref<Record<string, string>>({});
const questionResults = ref<Record<string, boolean>>({});
const totalEarnedScore = ref<number>(0);

// Timer State
const timerRemainingSeconds = ref<number>(45 * 60);
let timerInterval: any = null;

// Local Paper History
const paperHistory = ref<ExamPaper[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('yinuo_exam_history');
  if (saved) {
    try {
      paperHistory.value = JSON.parse(saved);
    } catch {}
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const saveHistory = () => {
  localStorage.setItem('yinuo_exam_history', JSON.stringify(paperHistory.value));
};

const availableSubjects = computed(() => {
  return K12_SUBJECTS.filter(s => s.stages.includes(selectedStage.value));
});

const examTypesList = [
  { id: 'weekly', name: '周考强化卷', icon: '📅', desc: '每周重点过关检测' },
  { id: 'monthly', name: '月度诊断卷', icon: '🌙', desc: '阶段知识综合摸底' },
  { id: 'midterm', name: '期中全真模拟', icon: '🏆', desc: '半期综合大检阅' },
  { id: 'final', name: '期末素养统考', icon: '🎓', desc: '学期终极通关评测' }
];

const startGenerateExam = () => {
  playButtonSound();
  const paper = generateExamPaper({
    stage: selectedStage.value,
    gradeLevel: selectedGrade.value,
    subjectId: selectedSubject.value,
    examType: selectedExamType.value,
    region: selectedRegion.value,
    questionCount: questionCount.value
  });

  currentPaper.value = paper;
  userAnswers.value = {};
  questionResults.value = {};
  totalEarnedScore.value = 0;
  timerRemainingSeconds.value = paper.durationMinutes * 60;

  // Start timer
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timerRemainingSeconds.value > 0) {
      timerRemainingSeconds.value--;
    } else {
      submitExam();
    }
  }, 1000);

  currentStep.value = 'exam';
};

const formatTimer = computed(() => {
  const m = Math.floor(timerRemainingSeconds.value / 60);
  const s = timerRemainingSeconds.value % 60;
  return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
});

const submitExam = () => {
  if (timerInterval) clearInterval(timerInterval);
  playButtonSound();

  if (!currentPaper.value) return;

  let earned = 0;
  currentPaper.value.questions.forEach(q => {
    const uAns = (userAnswers.value[q.id] || '').trim();
    const isCorrect = uAns.length > 0 && (
      uAns.toLowerCase() === q.correctAnswer.toLowerCase() ||
      q.correctAnswer.includes(uAns) ||
      uAns.includes(q.correctAnswer.slice(0, 1))
    );

    questionResults.value[q.id] = isCorrect;
    if (isCorrect) {
      earned += q.score;
    } else {
      userStore.recordSubjectMistake({
        subjectId: selectedSubject.value,
        gradeLevel: selectedGrade.value,
        topic: currentPaper.value?.title || '全真模拟试卷',
        knowledgePointTitle: q.knowledgePoint,
        questionPrompt: q.prompt,
        userAnswer: uAns || '(未作答)',
        correctAnswer: q.correctAnswer,
        errorCategory: 'calculation',
        errorReason: '试卷测试答错，重点复习',
        stepHints: q.stepGuide || [q.explanation]
      });
    }
  });

  totalEarnedScore.value = earned;

  // Save to history
  paperHistory.value.unshift(currentPaper.value);
  saveHistory();

  if (earned >= currentPaper.value.totalScore * 0.8) {
    playWinSound();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    userStore.addCoins(30, '模拟考试取得优异成绩');
  } else {
    playErrorSound();
    userStore.addCoins(10, '完成全真模拟考试');
  }

  currentStep.value = 'result';
};

const printExamPaper = () => {
  window.print();
};

const askAiTutor = (q: ExamQuestion) => {
  playButtonSound();
  tutorStore.openTutor('hints', {
    subjectId: selectedSubject.value,
    lessonTitle: currentPaper.value?.title || '全真试卷模拟考',
    knowledgePointTitle: q.knowledgePoint,
    questionPrompt: q.prompt,
    correctAnswer: q.correctAnswer,
    errorReason: '全真试卷模拟考题点拨'
  });
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] py-4 sm:py-6 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-5xl mx-auto space-y-5">
      
      <!-- Top Navigation & Header -->
      <div class="flex items-center justify-between">
        <button
          @click="router.push('/')"
          class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4 text-orange-500" />
          <span>返回学堂</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            @click="currentStep = 'config'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition', currentStep === 'config' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200']"
          >
            出卷中心
          </button>
          <button
            @click="currentStep = 'history'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition', currentStep === 'history' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200']"
          >
            历史试卷 ({{ paperHistory.length }})
          </button>
        </div>
      </div>

      <!-- Step 1: Exam Configuration Center -->
      <div v-if="currentStep === 'config'" class="space-y-5">
        
        <!-- Hero Title Card -->
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
          <div class="relative z-10 space-y-2">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black">
              <Sparkles class="w-3.5 h-3.5 text-amber-200" />
              <span>全真智能出卷与素养评估系统</span>
            </div>
            <h1 class="text-xl sm:text-3xl font-cartoon font-bold">
              📝 全真智能出卷台 · 北京卷 vs 衡水卷
            </h1>
            <p class="text-xs sm:text-sm text-white/90 max-w-2xl font-medium">
              支持小学、初中、高中全学段，一键自选生成【北京素养探究卷】与【河北衡水严谨强化卷】，支持在线模拟答题与 A4 标准试卷一键打印！
            </p>
          </div>
        </div>

        <!-- Configuration Card -->
        <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-200 shadow-xs space-y-5">
          
          <!-- 1. School Stage & Grade Selector -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              1. 选择学段与年级：
            </label>
            <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
              <button
                v-for="stg in SCHOOL_STAGES"
                :key="stg.id"
                @click="selectedStage = stg.id; selectedGrade = stg.grades[0]"
                :class="[
                  'p-2.5 sm:p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center gap-2.5',
                  selectedStage === stg.id
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm text-blue-950 font-black'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                ]"
              >
                <span class="text-xl sm:text-2xl">{{ stg.icon }}</span>
                <div>
                  <div class="text-xs sm:text-sm font-bold">{{ stg.name }}</div>
                  <div class="text-[10px] text-slate-400 truncate hidden sm:block">{{ stg.subtitle }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. Subject Selector -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              2. 选择考试学科：
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="sub in availableSubjects"
                :key="sub.id"
                @click="selectedSubject = sub.id"
                :class="[
                  'px-3.5 py-2 rounded-xl border-2 text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5',
                  selectedSubject === sub.id
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                ]"
              >
                <span>{{ sub.icon }}</span>
                <span>{{ sub.name }}</span>
              </button>
            </div>
          </div>

          <!-- 3. Region Flavor Selector (Core Feature) -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              3. 选择地域出卷标准与考查风格：
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <!-- Beijing Style -->
              <div
                @click="selectedRegion = 'beijing'"
                :class="[
                  'p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3',
                  selectedRegion === 'beijing'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                ]"
              >
                <div class="text-2xl">🏛️</div>
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-cartoon font-bold text-indigo-950">北京素养探究卷</span>
                    <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">海淀/西城教研</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed font-medium">
                    侧重生活真实情境、跨学科探究、多步骤逻辑推导与开放表达，启发思维广度。
                  </p>
                </div>
              </div>

              <!-- Hengshui Style -->
              <div
                @click="selectedRegion = 'hengshui'"
                :class="[
                  'p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3',
                  selectedRegion === 'hengshui'
                    ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                ]"
              >
                <div class="text-2xl">🔥</div>
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-cartoon font-bold text-rose-950">河北衡水严谨强化卷</span>
                    <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">百校大联考</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed font-medium">
                    高运算量、高密度、考查基础扎实度、经典易错变式与严谨大题规范，抗陷阱能力强。
                  </p>
                </div>
              </div>

            </div>
          </div>

          <!-- 4. Exam Type Selector -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              4. 选择试卷类型：
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="t in examTypesList"
                :key="t.id"
                @click="selectedExamType = t.id as ExamType"
                :class="[
                  'p-3 rounded-2xl border-2 text-center transition cursor-pointer',
                  selectedExamType === t.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-black'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                ]"
              >
                <div class="text-xl mb-1">{{ t.icon }}</div>
                <div class="text-xs font-bold">{{ t.name }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">{{ t.desc }}</div>
              </button>
            </div>
          </div>

          <!-- Generate Action Button -->
          <div class="pt-2">
            <button
              @click="startGenerateExam"
              class="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition transform active:scale-98 cursor-pointer"
            >
              <Zap class="w-5 h-5 text-amber-300" />
              <span>🚀 立即生成全真试卷并开启模拟考</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Step 2: In-Exam Paper View -->
      <div v-else-if="currentStep === 'exam' && currentPaper" class="space-y-5">
        
        <!-- Exam Floating Toolbar -->
        <div class="sticky top-16 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 border-2 border-slate-200 shadow-md flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-sm">
              <Clock class="w-4 h-4 text-rose-500 animate-pulse" />
              <span>倒计时：{{ formatTimer }}</span>
            </div>
            <span class="text-xs font-bold text-slate-500 hidden sm:inline">
              满分：{{ currentPaper.totalScore }} 分
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="printExamPaper"
              class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1 cursor-pointer"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>打印试卷 (A4)</span>
            </button>
            <button
              @click="submitExam"
              class="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm cursor-pointer"
            >
              交卷批改
            </button>
          </div>
        </div>

        <!-- Paper Sheet Container (A4 Style) -->
        <div class="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-sm space-y-6">
          
          <!-- Exam Header -->
          <div class="text-center border-b-2 border-slate-800 pb-5 space-y-2">
            <div class="text-xs font-black text-slate-500 tracking-widest">
              {{ currentPaper.paperCode }} · 绝密★启用前
            </div>
            <h1 class="text-lg sm:text-2xl font-serif font-black text-slate-900 tracking-wide">
              {{ currentPaper.title }}
            </h1>
            <div class="flex items-center justify-center gap-6 text-xs text-slate-600 font-bold pt-2">
              <span>考生姓名：_____________</span>
              <span>准考证号：_____________</span>
              <span>得分：_____________</span>
            </div>
            <p class="text-[11px] text-slate-400 pt-1">
              考生须知：1. 本试卷共 {{ currentPaper.questions.length }} 道小题，满分 {{ currentPaper.totalScore }} 分，考试时间 {{ currentPaper.durationMinutes }} 分钟。2. 请将答案端正书写在相应横线上。
            </p>
          </div>

          <!-- Questions List -->
          <div class="space-y-6">
            <div
              v-for="(q, idx) in currentPaper.questions"
              :key="q.id"
              class="space-y-3 pt-2"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  <span class="font-black">{{ idx + 1 }}.</span>
                  <span>（{{ q.score }}分）</span>
                  <span>{{ q.prompt }}</span>
                </div>
                <button
                  @click="askAiTutor(q)"
                  class="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Bot class="w-3 h-3" />
                  <span>点拨</span>
                </button>
              </div>

              <!-- Options if choice -->
              <div v-if="q.options && q.options.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                <button
                  v-for="opt in q.options"
                  :key="opt"
                  @click="userAnswers[q.id] = opt"
                  :class="[
                    'p-2.5 rounded-xl border text-left text-xs sm:text-sm font-bold transition cursor-pointer',
                    userAnswers[q.id] === opt
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-200'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ opt }}
                </button>
              </div>

              <!-- Input for Fill blank / calculation / solution -->
              <div v-else class="pl-4">
                <input
                  v-model="userAnswers[q.id]"
                  type="text"
                  placeholder="请输入答题结果与步骤..."
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <!-- Bottom Submit Button -->
          <div class="pt-6 border-t border-slate-200 text-center">
            <button
              @click="submitExam"
              class="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base shadow-md cursor-pointer"
            >
              完成答题，立即交卷
            </button>
          </div>

        </div>

      </div>

      <!-- Step 3: Result & Report View -->
      <div v-else-if="currentStep === 'result' && currentPaper" class="space-y-5">
        
        <!-- Score Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
            <Award class="w-4 h-4 text-blue-500" />
            <span>智能自动阅卷完成</span>
          </div>

          <div class="text-4xl sm:text-5xl font-cartoon font-black text-blue-600">
            {{ totalEarnedScore }} <span class="text-lg text-slate-400 font-bold">/ {{ currentPaper.totalScore }} 分</span>
          </div>

          <p class="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            本次按照【{{ currentPaper.region === 'hengshui' ? '河北衡水严谨标准' : '北京素养探究标准' }}】进行智能评分与解析，错题已归集至错题本。
          </p>

          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              @click="currentStep = 'config'"
              class="px-5 py-2 rounded-xl bg-blue-600 text-white font-black text-xs sm:text-sm cursor-pointer"
            >
              生成新试卷
            </button>
            <button
              @click="router.push('/mistakes')"
              class="px-5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs sm:text-sm cursor-pointer"
            >
              攻克本次错题
            </button>
          </div>
        </div>

        <!-- Review Question Cards -->
        <div class="space-y-4">
          <div
            v-for="(q, idx) in currentPaper.questions"
            :key="q.id"
            :class="[
              'bg-white rounded-3xl p-5 sm:p-6 border-2 shadow-xs space-y-3',
              questionResults[q.id] ? 'border-emerald-200' : 'border-rose-200'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 v-if="questionResults[q.id]" class="w-4 h-4 text-emerald-600" />
                <XCircle v-else class="w-4 h-4 text-rose-600" />
                <span>第 {{ idx + 1 }} 题（{{ q.score }}分）：{{ questionResults[q.id] ? '得分' : '失分' }}</span>
              </span>
              <span class="text-xs font-bold text-slate-400">考点：{{ q.knowledgePoint }}</span>
            </div>

            <p class="text-sm font-bold text-slate-800">{{ q.prompt }}</p>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div><span class="font-bold text-slate-500">你的作答：</span><span :class="questionResults[q.id] ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'">{{ userAnswers[q.id] || '(未作答)' }}</span></div>
              <div><span class="font-bold text-slate-500">标准答案：</span><span class="text-emerald-700 font-black">{{ q.correctAnswer }}</span></div>
              <div class="pt-1 text-slate-600 font-medium"><span class="font-bold text-slate-700">名师详析：</span>{{ q.explanation }}</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Step 4: History Papers -->
      <div v-else-if="currentStep === 'history'" class="space-y-4">
        <div class="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs flex items-center justify-between">
          <h2 class="text-base sm:text-xl font-cartoon font-bold text-slate-800">
            📑 历史模拟考卷档案 (共 {{ paperHistory.length }} 份)
          </h2>
          <button
            @click="currentStep = 'config'"
            class="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-black text-xs cursor-pointer"
          >
            + 生成新试卷
          </button>
        </div>

        <div v-if="paperHistory.length === 0" class="bg-white rounded-3xl p-10 text-center border-2 border-slate-200 text-slate-400 text-xs font-bold">
          暂无历史试卷记录，快去生成第一份考卷吧！
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="paper in paperHistory"
            :key="paper.id"
            class="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between"
          >
            <div class="space-y-1 min-w-0 pr-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {{ paper.region === 'hengshui' ? '衡水卷' : '北京卷' }}
                </span>
                <span class="text-xs font-bold text-slate-600">{{ paper.subjectId.toUpperCase() }}</span>
                <span class="text-xs font-bold text-slate-400">{{ paper.paperCode }}</span>
              </div>
              <div class="text-xs sm:text-sm font-black text-slate-800 truncate">
                {{ paper.title }}
              </div>
            </div>

            <div class="text-right shrink-0">
              <div class="text-base sm:text-lg font-cartoon font-black text-blue-600">
                满分 {{ paper.totalScore }}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
