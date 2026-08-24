<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  SCHOOL_STAGES,
  K12_SUBJECTS,
  SAMPLE_TEXTBOOK_CHAPTERS,
  generateHomeworkSmartQuiz,
  type TextbookChapter
} from '../data/k12Curriculum';
import type {
  SchoolStage,
  GradeLevel,
  SubjectId,
  ExamQuestion,
  HomeworkEntry
} from '../types/curriculum';
import { useUserStore } from '../stores/useUserStore';
import { useAiTutorStore } from '../stores/useAiTutorStore';
import { playButtonSound, playWinSound, playErrorSound } from '../lib/audio';
import { showAlert } from '../utils/alert';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Upload,
  Camera,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Printer,
  Trash2,
  Bot
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const tutorStore = useAiTutorStore();

// Selection State
const selectedStage = ref<SchoolStage>('primary');
const selectedGrade = ref<GradeLevel>('g1_t1');
const selectedSubject = ref<SubjectId>('math');
const selectedVersion = ref<string>('renjiao');

// Homework form
const customChapter = ref<string>('');
const customPages = ref<string>('');
const homeworkDescription = ref<string>('');
const uploadedImageUrl = ref<string | null>(null);
const isGenerating = ref<boolean>(false);

// Generated Quiz State
const currentMode = ref<'input' | 'practicing' | 'result' | 'history'>('input');
const generatedQuestions = ref<ExamQuestion[]>([]);
const userAnswers = ref<Record<string, string>>({});
const questionResults = ref<Record<string, boolean>>({});

// Local Homework History
const homeworkHistory = ref<HomeworkEntry[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('yinuo_hw_history');
  if (saved) {
    try {
      homeworkHistory.value = JSON.parse(saved);
    } catch {}
  }
});

const saveHistory = () => {
  localStorage.setItem('yinuo_hw_history', JSON.stringify(homeworkHistory.value));
};

// Filtered subjects for current stage
const availableSubjects = computed(() => {
  return K12_SUBJECTS.filter(s => s.stages.includes(selectedStage.value));
});

const currentSubjectMeta = computed(() => {
  return K12_SUBJECTS.find(s => s.id === selectedSubject.value) || K12_SUBJECTS[1];
});

// Filtered textbook chapters
const matchingChapters = computed(() => {
  return SAMPLE_TEXTBOOK_CHAPTERS.filter(
    c => c.subjectId === selectedSubject.value && c.gradeLevel === selectedGrade.value
  );
});

const selectChapterPreset = (ch: TextbookChapter) => {
  playButtonSound();
  customChapter.value = ch.unitName + ' - ' + ch.lessonTitle;
  customPages.value = ch.pageRange;
};

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedImageUrl.value = event.target?.result as string;
      if (!homeworkDescription.value) {
        homeworkDescription.value = '已拍照上传作业（' + file.name + '），包含今日课后习题与重点变式。';
      }
    };
    reader.readAsDataURL(file);
  }
};

const startGenerateQuiz = () => {
  if (!customChapter.value && !homeworkDescription.value && !uploadedImageUrl.value) {
    showAlert({
      title: '请填写作业信息',
      message: '请选择课本章节、输入作业要求或上传作业照片，以便小诺 AI 为你精准出题！',
      type: 'warning'
    });
    return;
  }

  playButtonSound();
  isGenerating.value = true;

  setTimeout(() => {
    const quiz = generateHomeworkSmartQuiz(
      selectedSubject.value,
      selectedGrade.value,
      homeworkDescription.value || customChapter.value,
      customPages.value
    );
    generatedQuestions.value = quiz;
    userAnswers.value = {};
    questionResults.value = {};
    isGenerating.value = false;
    currentMode.value = 'practicing';
  }, 600);
};

const submitQuiz = () => {
  playButtonSound();
  let correctCount = 0;
  
  generatedQuestions.value.forEach(q => {
    const uAns = (userAnswers.value[q.id] || '').trim();
    const isCorrect = uAns.length > 0 && (
      uAns.toLowerCase() === q.correctAnswer.toLowerCase() ||
      q.correctAnswer.includes(uAns) ||
      uAns.includes(q.correctAnswer.slice(0, 1))
    );

    questionResults.value[q.id] = isCorrect;
    if (isCorrect) {
      correctCount++;
    } else {
      userStore.recordSubjectMistake({
        subjectId: selectedSubject.value,
        gradeLevel: selectedGrade.value,
        topic: customChapter.value || '每日作业错题',
        knowledgePointTitle: q.knowledgePoint,
        questionPrompt: q.prompt,
        userAnswer: uAns || '(未作答)',
        correctAnswer: q.correctAnswer,
        errorCategory: 'calculation',
        errorReason: '作业练习错误，需进一步巩固',
        stepHints: q.stepGuide || [q.explanation]
      });
    }
  });

  const entry: HomeworkEntry = {
    id: 'hw_' + Date.now(),
    createdAt: Date.now(),
    dateStr: new Date().toLocaleDateString('zh-CN'),
    stage: selectedStage.value,
    gradeLevel: selectedGrade.value,
    subjectId: selectedSubject.value,
    textbookVersion: selectedVersion.value,
    chapterTitle: customChapter.value || '日常作业',
    pageRange: customPages.value || '随堂',
    homeworkContent: homeworkDescription.value,
    imageUrl: uploadedImageUrl.value || undefined,
    keyKnowledgePoints: generatedQuestions.value.map(q => q.knowledgePoint),
    generatedQuiz: generatedQuestions.value,
    quizCompleted: true,
    quizScore: Math.round((correctCount / generatedQuestions.value.length) * 100)
  };
  homeworkHistory.value.unshift(entry);
  saveHistory();

  if (correctCount === generatedQuestions.value.length) {
    playWinSound();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    userStore.addCoins(20, '作业针对练习全部通关');
  } else {
    playErrorSound();
    userStore.addCoins(5, '完成作业练习');
  }

  currentMode.value = 'result';
};

const printWorksheet = () => {
  window.print();
};

const askAiHelp = (q: ExamQuestion) => {
  playButtonSound();
  tutorStore.openTutor('hints', {
    subjectId: selectedSubject.value,
    lessonTitle: customChapter.value || '今日作业针对练习',
    knowledgePointTitle: q.knowledgePoint,
    questionPrompt: q.prompt,
    correctAnswer: q.correctAnswer,
    errorReason: '今日作业变式点拨'
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
            @click="currentMode = 'input'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition', currentMode === 'input' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200']"
          >
            上传作业
          </button>
          <button
            @click="currentMode = 'history'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition', currentMode === 'history' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200']"
          >
            作业记录 ({{ homeworkHistory.length }})
          </button>
        </div>
      </div>

      <!-- Mode 1: Homework Upload & Setup -->
      <div v-if="currentMode === 'input'" class="space-y-5">
        
        <!-- Hero Title Card -->
        <div class="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
          <div class="relative z-10 space-y-2">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black">
              <Sparkles class="w-3.5 h-3.5 text-amber-200" />
              <span>每日随堂作业与课本关联系统</span>
            </div>
            <h1 class="text-xl sm:text-3xl font-cartoon font-bold">
              📸 今日作业上传 · 智能生成练习
            </h1>
            <p class="text-xs sm:text-sm text-white/90 max-w-2xl font-medium">
              放学后拍下老师布置的作业或点选课本页码，小诺 AI 将自动提取核心考点，生成 3 道举一反三变式巩固题，彻底告别盲目刷题！
            </p>
          </div>
        </div>

        <!-- Stage & Subject Selector -->
        <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-200 shadow-xs space-y-4">
          
          <!-- Stage Tabs -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              1. 选择学段与年级：
            </label>
            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                v-for="stg in SCHOOL_STAGES"
                :key="stg.id"
                @click="selectedStage = stg.id; selectedGrade = stg.grades[0]"
                :class="[
                  'p-2.5 sm:p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center gap-2.5',
                  selectedStage === stg.id
                    ? 'border-orange-500 bg-orange-50/60 shadow-sm text-orange-900 font-black'
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

          <!-- Subject Tabs -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              2. 选择今日作业学科：
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="sub in availableSubjects"
                :key="sub.id"
                @click="selectedSubject = sub.id"
                :class="[
                  'px-3.5 py-2 rounded-xl border-2 text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5',
                  selectedSubject === sub.id
                    ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                ]"
              >
                <span>{{ sub.icon }}</span>
                <span>{{ sub.name }}</span>
              </button>
            </div>
          </div>

          <!-- Textbook Version Selector -->
          <div v-if="currentSubjectMeta.textbookVersions.length > 0">
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              3. 课本教材版本（支持北京课改版 / 冀教版 / 部编版）：
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="ver in currentSubjectMeta.textbookVersions"
                :key="ver.id"
                @click="selectedVersion = ver.id"
                :class="[
                  'px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer',
                  selectedVersion === ver.id
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-black'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                ]"
              >
                {{ ver.name }}
              </button>
            </div>
          </div>

        </div>

        <!-- Homework Details & Textbook Binding Card -->
        <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-200 shadow-xs space-y-4">
          <h3 class="text-sm sm:text-base font-cartoon font-bold text-slate-800 flex items-center gap-2">
            <BookOpen class="w-4 h-4 text-orange-500" />
            <span>关联课本章节与作业内容</span>
          </h3>

          <!-- Chapter Presets Grid -->
          <div v-if="matchingChapters.length > 0">
            <div class="text-xs font-bold text-slate-500 mb-2">
              📖 快速点选课本同步章节：
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="ch in matchingChapters"
                :key="ch.id"
                @click="selectChapterPreset(ch)"
                class="p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 bg-slate-50 hover:bg-orange-50/40 cursor-pointer transition flex items-center justify-between"
              >
                <div class="min-w-0 pr-2">
                  <div class="text-xs font-black text-slate-800 truncate">{{ ch.unitName }}</div>
                  <div class="text-[11px] text-slate-500 truncate">{{ ch.lessonTitle }}</div>
                </div>
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200 text-orange-600 shrink-0">
                  {{ ch.pageRange }}
                </span>
              </div>
            </div>
          </div>

          <!-- Manual Input & Photo Upload -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            <!-- Left: Manual Input -->
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">
                  课本单元/课题：
                </label>
                <input
                  v-model="customChapter"
                  type="text"
                  placeholder="例如：第三单元 5以内加减法"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">
                  课本/练习册页码：
                </label>
                <input
                  v-model="customPages"
                  type="text"
                  placeholder="例如：第 24-26 页"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">
                  老师布置的作业内容与要求（可选）：
                </label>
                <textarea
                  v-model="homeworkDescription"
                  rows="3"
                  placeholder="例如：口算练习册第18页，重点做进位加法，要求写清计算步骤..."
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-orange-500 focus:outline-hidden font-medium resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Right: Photo Upload -->
            <div class="flex flex-col justify-between border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
              <div v-if="!uploadedImageUrl" class="py-6 space-y-3">
                <div class="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl">
                  <Camera class="w-6 h-6" />
                </div>
                <div>
                  <div class="text-xs sm:text-sm font-black text-slate-700">拍照或上传今日作业</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">支持随堂本、练习册、老师微信群发的作业照片</div>
                </div>
                <label class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs cursor-pointer shadow-sm">
                  <Upload class="w-3.5 h-3.5" />
                  <span>选择作业图片</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                </label>
              </div>

              <div v-else class="space-y-3">
                <div class="relative rounded-xl overflow-hidden max-h-48 border border-slate-200">
                  <img :src="uploadedImageUrl" alt="作业照片" class="w-full h-full object-cover" />
                </div>
                <button
                  @click="uploadedImageUrl = null"
                  class="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1 mx-auto"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>删除并重新拍照</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Submit Button -->
          <div class="pt-3">
            <button
              @click="startGenerateQuiz"
              :disabled="isGenerating"
              class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Sparkles class="w-5 h-5 animate-spin" v-if="isGenerating" />
              <Sparkles class="w-5 h-5" v-else />
              <span>{{ isGenerating ? 'AI 正在分析考点并生成变式题...' : '🤖 一键智能生成针对性练习 (3道题)' }}</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Mode 2: Practicing Mode -->
      <div v-else-if="currentMode === 'practicing'" class="space-y-5">
        
        <div class="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
              {{ currentSubjectMeta.name }} · 针对性巩固练
            </span>
            <h2 class="text-base sm:text-xl font-cartoon font-bold text-slate-800 mt-1">
              {{ customChapter || '今日作业核心考点过关' }} (共 {{ generatedQuestions.length }} 题)
            </h2>
          </div>
          <button
            @click="printWorksheet"
            class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer class="w-4 h-4 text-slate-600" />
            <span>打印练习单</span>
          </button>
        </div>

        <!-- Question Cards -->
        <div class="space-y-4">
          <div
            v-for="(q, idx) in generatedQuestions"
            :key="q.id"
            class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs space-y-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                  {{ idx + 1 }}
                </span>
                <span class="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  考点：{{ q.knowledgePoint }}
                </span>
              </div>
              <button
                @click="askAiHelp(q)"
                class="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Bot class="w-3.5 h-3.5" />
                <span>小诺启发点拨</span>
              </button>
            </div>

            <p class="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
              {{ q.prompt }}
            </p>

            <!-- Option Choices if single_choice -->
            <div v-if="q.options && q.options.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                v-for="opt in q.options"
                :key="opt"
                @click="userAnswers[q.id] = opt"
                :class="[
                  'p-3 rounded-xl border text-left text-xs sm:text-sm font-bold transition cursor-pointer',
                  userAnswers[q.id] === opt
                    ? 'border-orange-500 bg-orange-50 text-orange-900 font-black ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                ]"
              >
                {{ opt }}
              </button>
            </div>

            <!-- Input field for calculation / fill_blank / solution -->
            <div v-else class="pt-1">
              <input
                v-model="userAnswers[q.id]"
                type="text"
                placeholder="在此输入你的计算答案或简答..."
                class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold focus:border-orange-500 focus:outline-hidden"
              />
            </div>

          </div>
        </div>

        <!-- Submit Action -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="currentMode = 'input'"
            class="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-black text-xs sm:text-sm cursor-pointer"
          >
            返回修改作业
          </button>
          <button
            @click="submitQuiz"
            class="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer"
          >
            提交批改与结算
          </button>
        </div>

      </div>

      <!-- Mode 3: Result & Review Mode -->
      <div v-else-if="currentMode === 'result'" class="space-y-5">
        <div class="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md text-center space-y-3">
          <div class="text-3xl">🎉</div>
          <h2 class="text-xl sm:text-2xl font-cartoon font-bold text-slate-800">
            作业变式巩固已完成！
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            做错的题目已自动收录进【全科错题本】，小诺已生成分步解析与变式题。
          </p>
          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              @click="currentMode = 'input'"
              class="px-5 py-2 rounded-xl bg-orange-500 text-white font-black text-xs sm:text-sm cursor-pointer"
            >
              继续上传新作业
            </button>
            <button
              @click="router.push('/mistakes')"
              class="px-5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs sm:text-sm cursor-pointer"
            >
              前往错题本攻克
            </button>
          </div>
        </div>

        <!-- Detailed Review List -->
        <div class="space-y-4">
          <div
            v-for="(q, idx) in generatedQuestions"
            :key="q.id"
            :class="[
              'rounded-3xl p-5 sm:p-6 border-2 bg-white shadow-xs space-y-3',
              questionResults[q.id] ? 'border-emerald-200' : 'border-rose-200'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 v-if="questionResults[q.id]" class="w-4 h-4 text-emerald-600" />
                <XCircle v-else class="w-4 h-4 text-rose-600" />
                <span>第 {{ idx + 1 }} 题：{{ questionResults[q.id] ? '回答正确' : '需重点复习' }}</span>
              </span>
              <span class="text-[11px] font-bold text-slate-400">考点：{{ q.knowledgePoint }}</span>
            </div>

            <p class="text-sm font-bold text-slate-800">{{ q.prompt }}</p>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div><span class="font-bold text-slate-500">你的回答：</span><span :class="questionResults[q.id] ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'">{{ userAnswers[q.id] || '(未作答)' }}</span></div>
              <div><span class="font-bold text-slate-500">标准正解：</span><span class="text-emerald-700 font-black">{{ q.correctAnswer }}</span></div>
              <div class="pt-1 text-slate-600 font-medium"><span class="font-bold text-slate-700">名师解析：</span>{{ q.explanation }}</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Mode 4: Homework History List -->
      <div v-else-if="currentMode === 'history'" class="space-y-4">
        <div class="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs flex items-center justify-between">
          <h2 class="text-base sm:text-xl font-cartoon font-bold text-slate-800">
            📚 历史作业与伴学记录 (共 {{ homeworkHistory.length }} 次)
          </h2>
          <button
            @click="currentMode = 'input'"
            class="px-3.5 py-1.5 rounded-xl bg-orange-500 text-white font-black text-xs cursor-pointer"
          >
            + 上传今日作业
          </button>
        </div>

        <div v-if="homeworkHistory.length === 0" class="bg-white rounded-3xl p-10 text-center border-2 border-slate-200 text-slate-400 text-xs font-bold">
          暂无作业记录，快去上传第一份作业吧！
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in homeworkHistory"
            :key="item.id"
            class="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between"
          >
            <div class="space-y-1 min-w-0 pr-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                  {{ item.dateStr }}
                </span>
                <span class="text-xs font-bold text-slate-600">{{ item.subjectId.toUpperCase() }}</span>
                <span class="text-xs font-bold text-slate-400">{{ item.pageRange }}</span>
              </div>
              <div class="text-xs sm:text-sm font-black text-slate-800 truncate">
                {{ item.chapterTitle }}
              </div>
              <div class="text-[11px] text-slate-500 truncate">
                考点：{{ item.keyKnowledgePoints.join('、') }}
              </div>
            </div>

            <div class="text-right shrink-0">
              <div class="text-base sm:text-lg font-cartoon font-black text-orange-600">
                {{ item.quizScore !== undefined ? item.quizScore + '分' : '已完成' }}
              </div>
              <span class="text-[10px] text-slate-400">变式训练</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
