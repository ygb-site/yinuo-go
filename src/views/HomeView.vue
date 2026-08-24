<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  useCustomCurriculumStore,
  type DaySubjectTask
} from '../stores/customCurriculumStore';
import { useUserStore } from '../stores/useUserStore';
import { useAiTutorStore } from '../stores/useAiTutorStore';
import { GRADE_LEVELS, type SchoolStage, type ExamRegion, type ExamQuestion } from '../types/curriculum';
import { generateHomeworkSmartQuiz } from '../data/k12Curriculum';
import { playButtonSound, playWinSound, playErrorSound } from '../lib/audio';
import { showAlert, showConfirm } from '../utils/alert';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  Calendar,
  Camera,
  Sparkles,
  ArrowRight,
  Bot,
  Calculator,
  PenTool,
  Volume2,
  BookMarked,
  BookOpen,
  X
} from 'lucide-vue-next';

const router = useRouter();
const curriculumStore = useCustomCurriculumStore();
const userStore = useUserStore();
const tutorStore = useAiTutorStore();

// =========================================================================
// 1. Modal States
// =========================================================================
// Create Grade Modal
const showCreateGradeModal = ref(false);
const newGradeStage = ref<SchoolStage>('primary');
const newGradeName = ref<string>('一年级上册');
const newGradeRegion = ref<ExamRegion>('hengshui');
const newGradeInitTextbooks = ref<boolean>(true);

// Create Day Modal


// Add Subject to Day Modal
const showAddSubjectToDayModal = ref(false);
const availableSubjectOptions = [
  { key: 'math', name: '数学', icon: '🔢' },
  { key: 'chinese', name: '语文', icon: '🏮' },
  { key: 'english', name: '英语', icon: '🔤' },
  { key: 'science', name: '科学', icon: '🔬' },
  { key: 'ethics', name: '道德与法治', icon: '⚖️' },
  { key: 'physics', name: '物理', icon: '⚡' },
  { key: 'chemistry', name: '化学', icon: '🧪' },
  { key: 'biology', name: '生物', icon: '🧬' },
  { key: 'history', name: '历史', icon: '📜' },
  { key: 'geography', name: '地理', icon: '🌏' }
];

// Textbook Library Modal
const showTextbookModal = ref(false);
const selectedTbSubjectKey = ref<string>('math');
const newChapterUnit = ref<string>('');
const newChapterTitle = ref<string>('');
const newChapterPages = ref<string>('');

// Active Quiz Practicing State
const practicingTask = ref<DaySubjectTask | null>(null);
const isGeneratingQuiz = ref<boolean>(false);
const userAnswers = ref<Record<string, string>>({});
const questionResults = ref<Record<string, boolean>>({});
const showQuizModal = ref<boolean>(false);
const quizStep = ref<'practicing' | 'result'>('practicing');

// Filtered grade options based on stage
const gradeOptions = computed(() => {
  return GRADE_LEVELS.filter(g => g.stage === newGradeStage.value);
});

// Current active textbook
const currentTextbook = computed(() => {
  return curriculumStore.activeTextbooks.find(t => t.subjectKey === selectedTbSubjectKey.value);
});

// =========================================================================
// 2. Grade Actions
// =========================================================================
const openCreateGrade = () => {
  playButtonSound();
  newGradeStage.value = 'primary';
  newGradeName.value = '一年级上册';
  newGradeRegion.value = 'hengshui';
  newGradeInitTextbooks.value = true;
  showCreateGradeModal.value = true;
};

const handleConfirmCreateGrade = () => {
  playButtonSound();
  if (!newGradeName.value.trim()) {
    showAlert({ title: '请输入年级名称', message: '请选择或输入年级名称', type: 'warning' });
    return;
  }

  curriculumStore.createGrade({
    stage: newGradeStage.value,
    name: newGradeName.value.trim(),
    region: newGradeRegion.value,
    initDefaultTextbooks: newGradeInitTextbooks.value,
    createFirstDay: true
  });

  showCreateGradeModal.value = false;
  confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
};

const handleDeleteGrade = async (gradeId: string, gradeName: string) => {
  playButtonSound();
  const ok = await showConfirm({
    title: '删除年级确认',
    message: `确定要删除【${gradeName}】档案吗？该年级下的所有天数、作业与练习记录将一并删除。`,
    type: 'delete',
    confirmText: '确定删除',
    cancelText: '取消'
  });
  if (ok) {
    curriculumStore.deleteGrade(gradeId);
  }
};

// =========================================================================
// 3. Day Actions (在年级下建天)
// =========================================================================
const handleQuickCreateToday = () => {
  if (!curriculumStore.activeGrade) return;
  playButtonSound();
  curriculumStore.createDay(curriculumStore.activeGrade.id);
  confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
};



const handleDeleteDay = async (dayId: string, dayTitle: string) => {
  if (!curriculumStore.activeGrade) return;
  playButtonSound();
  const ok = await showConfirm({
    title: '删除伴学记录',
    message: `确定删除【${dayTitle}】这天的伴学记录吗？`,
    type: 'delete',
    confirmText: '确定删除',
    cancelText: '取消'
  });
  if (ok) {
    curriculumStore.deleteDay(curriculumStore.activeGrade.id, dayId);
  }
};

// =========================================================================
// 4. Day Subject Task Actions (在当天里选语数外等学科)
// =========================================================================
const openAddSubjectToDay = () => {
  playButtonSound();
  showAddSubjectToDayModal.value = true;
};

const handleAddSubjectToCurrentDay = (subOpt: { key: string; name: string; icon: string }) => {
  if (!curriculumStore.activeGrade || !curriculumStore.activeDay) return;
  playButtonSound();
  curriculumStore.addTaskToDay(curriculumStore.activeGrade.id, curriculumStore.activeDay.id, subOpt);
  showAddSubjectToDayModal.value = false;
};

const handleRemoveTask = async (taskId: string, subName: string) => {
  if (!curriculumStore.activeGrade || !curriculumStore.activeDay) return;
  playButtonSound();
  const ok = await showConfirm({
    title: '移除学科作业',
    message: `确定从今天移除【${subName}】作业吗？`,
    type: 'delete',
    confirmText: '确定移除',
    cancelText: '取消'
  });
  if (ok) {
    curriculumStore.removeTaskFromDay(curriculumStore.activeGrade.id, curriculumStore.activeDay.id, taskId);
  }
};

// Textbook options for a specific subject
const getChaptersForSubject = (subjectKey: string) => {
  const tb = curriculumStore.activeTextbooks.find(t => t.subjectKey === subjectKey);
  return tb ? tb.chapters : [];
};

const handleImageUpload = (task: DaySubjectTask, e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      task.imageUrl = event.target?.result as string;
      if (!task.homeworkPrompt) {
        task.homeworkPrompt = `已拍照上传作业（${file.name}）`;
      }
      curriculumStore.saveToStorage();
    };
    reader.readAsDataURL(file);
  }
};

// =========================================================================
// 5. Generate AI Smart Quiz & Practice for Task
// =========================================================================
const startQuizForTask = (task: DaySubjectTask) => {
  playButtonSound();
  practicingTask.value = task;
  isGeneratingQuiz.value = true;
  showQuizModal.value = true;
  quizStep.value = 'practicing';

  setTimeout(() => {
    const questions = generateHomeworkSmartQuiz(
      (task.subjectKey as any) || 'math',
      (curriculumStore.activeGrade?.id as any) || 'g1_t1',
      task.homeworkPrompt || task.chapterTitle,
      task.pageRange
    );
    task.generatedQuestions = questions;
    userAnswers.value = {};
    questionResults.value = {};
    isGeneratingQuiz.value = false;
    curriculumStore.saveToStorage();
  }, 600);
};

const submitQuiz = () => {
  if (!practicingTask.value || !curriculumStore.activeGrade || !curriculumStore.activeDay) return;
  playButtonSound();
  let correctCount = 0;

  practicingTask.value.generatedQuestions.forEach(q => {
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
        subjectId: (practicingTask.value?.subjectKey as any) || 'math',
        gradeLevel: (curriculumStore.activeGrade?.id as any) || 'g1_t1',
        topic: practicingTask.value?.chapterTitle || '今日作业针对练习',
        knowledgePointTitle: q.knowledgePoint,
        questionPrompt: q.prompt,
        userAnswer: uAns || '(未作答)',
        correctAnswer: q.correctAnswer,
        errorCategory: 'calculation',
        errorReason: '每日作业变式题错误，重点巩固',
        stepHints: q.stepGuide || [q.explanation]
      });
    }
  });

  const score = Math.round((correctCount / practicingTask.value.generatedQuestions.length) * 100);
  practicingTask.value.isCompleted = true;
  practicingTask.value.score = score;
  curriculumStore.saveToStorage();

  if (correctCount === practicingTask.value.generatedQuestions.length) {
    playWinSound();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    userStore.addCoins(20, '完成作业变式练习(全对)');
  } else {
    playErrorSound();
    userStore.addCoins(5, '完成作业变式练习');
  }

  quizStep.value = 'result';
};

const askAiTutor = (q: ExamQuestion) => {
  playButtonSound();
  tutorStore.openTutor('hints', {
    subjectId: (practicingTask.value?.subjectKey as any) || 'math',
    lessonTitle: practicingTask.value?.chapterTitle || '每日作业针对练习',
    knowledgePointTitle: q.knowledgePoint,
    questionPrompt: q.prompt,
    correctAnswer: q.correctAnswer,
    errorReason: '今日作业变式点拨'
  });
};

// =========================================================================
// 6. Textbook Management Actions
// =========================================================================
const openTextbookManager = (subKey: string = 'math') => {
  playButtonSound();
  selectedTbSubjectKey.value = subKey;
  newChapterUnit.value = '';
  newChapterTitle.value = '';
  newChapterPages.value = '';
  showTextbookModal.value = true;
};

const handleAddChapterToTextbook = () => {
  if (!curriculumStore.activeGrade || !newChapterTitle.value.trim()) {
    showAlert({ title: '请输入课题名称', message: '如：5以内数的认识与加减法', type: 'warning' });
    return;
  }
  playButtonSound();
  curriculumStore.addChapterToTextbook(curriculumStore.activeGrade.id, selectedTbSubjectKey.value, {
    unitName: newChapterUnit.value.trim() || '单元要点',
    lessonTitle: newChapterTitle.value.trim(),
    pageRange: newChapterPages.value.trim() || '随堂',
    coreKnowledge: [newChapterTitle.value.trim()]
  });
  newChapterUnit.value = '';
  newChapterTitle.value = '';
  newChapterPages.value = '';
};

const handleDeleteChapter = (chId: string) => {
  if (!curriculumStore.activeGrade) return;
  playButtonSound();
  curriculumStore.deleteChapterFromTextbook(curriculumStore.activeGrade.id, selectedTbSubjectKey.value, chId);
};

const navigateTo = (path: string) => {
  playButtonSound();
  router.push(path);
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] py-3 sm:py-5 lg:py-6 px-3 sm:px-5 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      
      <!-- ================================================================= -->
      <!-- Case A: Completely Empty Initial State (尚未创建年级) -->
      <!-- ================================================================= -->
      <div
        v-if="!curriculumStore.hasGrades"
        class="bg-white rounded-3xl p-6 sm:p-12 border-2 border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-5 my-8"
      >
        <div class="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
          🎒
        </div>

        <div class="space-y-2">
          <h1 class="text-xl sm:text-3xl font-cartoon font-bold text-slate-800">
            开启专属学业伴学中枢
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            从当前年级开始（如一年级），每天放学建立当天伴学，按天自由勾选语数外，关联课本、拍照上传作业，AI 实时生成针对练习！
          </p>
        </div>

        <div class="pt-2">
          <button
            @click="openCreateGrade"
            class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
          >
            <Plus class="w-5 h-5" />
            <span>+ 创建一年级伴学档案</span>
          </button>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- Case B: Main Living Hub (年级 -> 下面建天 -> 当天选语数外) -->
      <!-- ================================================================= -->
      <div v-else class="space-y-4 sm:space-y-6">
        
        <!-- 1. Top Grade Tabs & Management Strip -->
        <div class="bg-white rounded-3xl p-3.5 sm:p-4 border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <!-- Left: Grade Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span class="text-xs font-black text-slate-400 uppercase tracking-wider shrink-0">年级：</span>
            <div class="flex items-center gap-1.5 shrink-0">
              <div
                v-for="g in curriculumStore.grades"
                :key="g.id"
                class="flex items-center gap-1"
              >
                <button
                  @click="curriculumStore.setActiveGrade(g.id)"
                  :class="[
                    'px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 border',
                    curriculumStore.activeGradeId === g.id
                      ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs ring-2 ring-orange-200'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                  ]"
                >
                  <span>{{ g.stage === 'primary' ? '🎒' : g.stage === 'junior' ? '📐' : '🏛️' }}</span>
                  <span>{{ g.name }}</span>
                </button>
                <button
                  v-if="curriculumStore.grades.length > 1"
                  @click.stop="handleDeleteGrade(g.id, g.name)"
                  class="text-slate-300 hover:text-rose-500 p-1 rounded-md"
                  title="删除该年级档案"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Grade Actions (Add Grade & Textbook Manager) -->
          <div class="flex items-center gap-2 shrink-0 justify-end">
            <button
              @click="openTextbookManager('math')"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1 cursor-pointer transition"
            >
              <BookOpen class="w-3.5 h-3.5 text-orange-500" />
              <span>本学期课本库 ({{ curriculumStore.activeTextbooks.length }}本)</span>
            </button>
            <button
              @click="openCreateGrade"
              class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition active:scale-95"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>创建新年级</span>
            </button>
          </div>

        </div>

        <!-- 2. Main Two-Column Structure: Days Timeline (Left) + Day Subjects Workspace (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          <!-- ============================================================= -->
          <!-- Left Column: Days List (年级下面建的天数列表) -->
          <!-- ============================================================= -->
          <div class="lg:col-span-4 bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3">
            
            <div class="flex items-center justify-between">
              <h3 class="text-sm sm:text-base font-cartoon font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar class="w-4 h-4 text-orange-500" />
                <span>{{ curriculumStore.activeGrade?.name }} · 每日伴学</span>
              </h3>
              <span class="text-[11px] font-bold text-slate-400">共 {{ curriculumStore.activeDays.length }} 天</span>
            </div>

            <!-- Create New Day Button -->
            <button
              @click="handleQuickCreateToday"
              class="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition transform active:scale-95"
            >
              <Plus class="w-4 h-4" />
              <span>+ 新建今日伴学 (今天)</span>
            </button>

            <!-- Days Timeline Scroll Area -->
            <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              <div
                v-if="curriculumStore.activeDays.length === 0"
                class="text-center py-8 text-xs text-slate-400 font-bold"
              >
                点击上方按钮，开启第一天的作业与伴学
              </div>

              <div
                v-for="(day, idx) in curriculumStore.activeDays"
                :key="day.id"
                @click="curriculumStore.setActiveDay(day.id)"
                :class="[
                  'p-3 sm:p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between group',
                  curriculumStore.activeDayId === day.id
                    ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                ]"
              >
                <div class="min-w-0 pr-2 space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-black text-slate-800 truncate">{{ day.dayTitle }}</span>
                    <span v-if="idx === 0" class="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      最新
                    </span>
                  </div>

                  <!-- Tasks Summary in this day -->
                  <div class="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                    <span v-for="t in day.tasks" :key="t.id" class="inline-flex items-center gap-0.5">
                      <span>{{ t.subjectIcon }}</span>
                      <span :class="t.isCompleted ? 'text-emerald-600' : 'text-slate-400'">{{ t.subjectName }}</span>
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[11px] font-black text-orange-600 bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                    {{ day.tasks.filter(t => t.isCompleted).length }}/{{ day.tasks.length }}
                  </span>
                  <button
                    @click.stop="handleDeleteDay(day.id, day.dayTitle)"
                    class="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition"
                    title="删除此天"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- ============================================================= -->
          <!-- Right Column: Day Detail & Subjects (当天里选语数外等学科) -->
          <!-- ============================================================= -->
          <div class="lg:col-span-8 space-y-4">
            
            <div v-if="curriculumStore.activeDay" class="space-y-4">
              
              <!-- Day Header Banner -->
              <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {{ curriculumStore.activeGrade?.name }}
                    </span>
                    <span class="text-xs font-bold text-slate-400">{{ curriculumStore.activeDay.dateStr }}</span>
                  </div>
                  <h2 class="text-base sm:text-xl font-cartoon font-bold text-slate-900 mt-1">
                    {{ curriculumStore.activeDay.dayTitle }} · 学科作业清单
                  </h2>
                </div>

                <!-- Add Subject to This Day Button -->
                <div class="flex items-center gap-2">
                  <button
                    @click="openAddSubjectToDay"
                    class="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition active:scale-95"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>+ 当天添加学科 (语/数/外/物化生)</span>
                  </button>
                </div>
              </div>

              <!-- Subject Task Cards inside this Day -->
              <div class="space-y-3.5">
                <div
                  v-if="curriculumStore.activeDay.tasks.length === 0"
                  class="bg-white rounded-3xl p-10 text-center border-2 border-slate-200 text-slate-400 text-xs font-bold"
                >
                  当天尚未添加学科，请点击右上角【+ 当天添加学科】
                </div>

                <div
                  v-for="task in curriculumStore.activeDay.tasks"
                  :key="task.id"
                  class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 hover:border-orange-300 shadow-xs transition space-y-3"
                >
                  <!-- Subject Task Header -->
                  <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div class="flex items-center gap-2.5">
                      <span class="text-2xl">{{ task.subjectIcon }}</span>
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="text-base font-cartoon font-bold text-slate-900">{{ task.subjectName }}作业</h4>
                          <span
                            :class="[
                              'text-[10px] font-black px-2 py-0.2 rounded-full',
                              task.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            ]"
                          >
                            {{ task.isCompleted ? `已完成 (${task.score || 100}分)` : '待练习' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      @click="handleRemoveTask(task.id, task.subjectName)"
                      class="text-slate-300 hover:text-rose-500 p-1 transition"
                      title="移除本科目"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Homework Binding & Form -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <!-- 1. Chapter Binding -->
                    <div>
                      <label class="block text-[11px] font-bold text-slate-500 mb-1">课本章节：</label>
                      <select
                        v-model="task.chapterTitle"
                        @change="curriculumStore.saveToStorage()"
                        class="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:border-orange-500 focus:outline-hidden"
                      >
                        <option value="随堂知识点">-- 自定义随堂要点 --</option>
                        <option
                          v-for="ch in getChaptersForSubject(task.subjectKey)"
                          :key="ch.id"
                          :value="ch.unitName + ' - ' + ch.lessonTitle"
                        >
                          {{ ch.unitName }} - {{ ch.lessonTitle }} ({{ ch.pageRange }})
                        </option>
                      </select>
                    </div>

                    <!-- 2. Page Range -->
                    <div>
                      <label class="block text-[11px] font-bold text-slate-500 mb-1">课本/练习册页码：</label>
                      <input
                        v-model="task.pageRange"
                        @input="curriculumStore.saveToStorage()"
                        type="text"
                        placeholder="例如：第 14-16 页"
                        class="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-orange-500 focus:outline-hidden"
                      />
                    </div>

                  </div>

                  <!-- Homework Content & Photo -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div class="sm:col-span-2">
                      <input
                        v-model="task.homeworkPrompt"
                        @input="curriculumStore.saveToStorage()"
                        type="text"
                        placeholder="老师布置的作业要求（如：口算第15页、生字抄写两遍...）"
                        class="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label class="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 text-orange-700 text-xs font-bold cursor-pointer hover:bg-orange-100/50 transition truncate">
                        <Camera class="w-3.5 h-3.5 shrink-0" />
                        <span class="truncate">{{ task.imageUrl ? '已上传照片' : '拍照上传作业' }}</span>
                        <input type="file" accept="image/*" class="hidden" @change="handleImageUpload(task, $event)" />
                      </label>
                    </div>
                  </div>

                  <!-- Actions & Specific Tools -->
                  <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    
                    <!-- Left: Subject Built-in Tools -->
                    <div class="flex items-center gap-1.5">
                      <button
                        v-if="task.subjectKey === 'math'"
                        @click="navigateTo('/subject/math/drill')"
                        class="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Calculator class="w-3 h-3" />
                        <span>口算练</span>
                      </button>

                      <button
                        v-if="task.subjectKey === 'chinese'"
                        @click="navigateTo('/subject/chinese/hanzi')"
                        class="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <PenTool class="w-3 h-3" />
                        <span>生字描红</span>
                      </button>

                      <button
                        v-if="task.subjectKey === 'english'"
                        @click="navigateTo('/subject/english/phonics')"
                        class="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 class="w-3 h-3" />
                        <span>自然拼读</span>
                      </button>

                      <button
                        @click="navigateTo(`/mistakes?subject=${task.subjectKey}`)"
                        class="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <BookMarked class="w-3 h-3" />
                        <span>错题本</span>
                      </button>
                    </div>

                    <!-- Right: Generate Practice Button -->
                    <button
                      @click="startQuizForTask(task)"
                      class="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition transform active:scale-95 ml-auto"
                    >
                      <Sparkles class="w-3.5 h-3.5 text-amber-200" />
                      <span>{{ task.isCompleted ? '重新练习针对题' : '🤖 AI 生成变式针对练 (3题)' }}</span>
                    </button>

                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>

        <!-- Section 3: Brain Strategy & Board Games Pavilion (棋艺馆独立保留) -->
        <div>
          <div class="flex items-center justify-between mb-3 px-1">
            <h3 class="text-base sm:text-xl font-cartoon font-bold text-slate-800 flex items-center gap-2">
              <span>♟️</span>
              <span>益智棋艺阁 (独立课余思维乐园)</span>
            </h3>
            <span class="text-xs font-bold text-slate-400">
              劳逸结合 · 启智博弈
            </span>
          </div>

          <div
            @click="navigateTo('/learn')"
            class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-5 sm:p-6 text-white shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group"
          >
            <div class="flex items-center gap-4 text-center sm:text-left">
              <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
                ♟️
              </div>
              <div>
                <div class="flex items-center justify-center sm:justify-start gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25">益智博弈</span>
                  <span class="text-xs text-white/80 font-bold">围棋 / 跳棋 / 五子棋</span>
                </div>
                <h4 class="text-lg sm:text-2xl font-cartoon font-bold mt-1 tracking-wide">
                  棋艺馆 · 智慧对弈天地
                </h4>
                <p class="text-xs sm:text-sm text-white/90 font-medium mt-0.5">
                  围棋28关启蒙闯关、46道死活题库、AI分级对战、六角跳棋与五子棋对决。
                </p>
              </div>
            </div>

            <button class="px-5 py-2.5 rounded-2xl bg-white text-emerald-900 font-black text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform shrink-0 flex items-center gap-1.5">
              <span>进入棋艺馆</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- ================================================================= -->
    <!-- Modal 1: Create Grade Modal -->
    <!-- ================================================================= -->
    <div
      v-if="showCreateGradeModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-cartoon font-bold text-slate-900 flex items-center gap-2">
            <span>🎓</span>
            <span>创建新年级档案</span>
          </h3>
          <button @click="showCreateGradeModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3">
          <!-- Stage -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">选择学段：</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="newGradeStage = 'primary'; newGradeName = '一年级上册'"
                :class="['py-2 rounded-xl text-xs font-bold border transition cursor-pointer', newGradeStage === 'primary' ? 'border-orange-500 bg-orange-50 text-orange-950 font-black' : 'border-slate-200 text-slate-600']"
              >
                🎒 小学
              </button>
              <button
                type="button"
                @click="newGradeStage = 'junior'; newGradeName = '初一上册(七年级)'"
                :class="['py-2 rounded-xl text-xs font-bold border transition cursor-pointer', newGradeStage === 'junior' ? 'border-blue-500 bg-blue-50 text-blue-950 font-black' : 'border-slate-200 text-slate-600']"
              >
                📐 初中
              </button>
              <button
                type="button"
                @click="newGradeStage = 'senior'; newGradeName = '高一上册(必修一)'"
                :class="['py-2 rounded-xl text-xs font-bold border transition cursor-pointer', newGradeStage === 'senior' ? 'border-purple-500 bg-purple-50 text-purple-950 font-black' : 'border-slate-200 text-slate-600']"
              >
                🏛️ 高中
              </button>
            </div>
          </div>

          <!-- Grade Option -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">选择具体年级学期：</label>
            <div class="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1">
              <button
                v-for="g in gradeOptions"
                :key="g.id"
                type="button"
                @click="newGradeName = g.name"
                :class="['p-2 rounded-xl text-xs text-left border transition cursor-pointer truncate', newGradeName === g.name ? 'border-orange-500 bg-orange-50 text-orange-950 font-black' : 'border-slate-200 text-slate-600']"
              >
                {{ g.name }}
              </button>
            </div>
          </div>

          <!-- Region Style -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">考查标准风格：</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="newGradeRegion = 'hengshui'"
                :class="['p-2 rounded-xl text-xs border text-left cursor-pointer transition', newGradeRegion === 'hengshui' ? 'border-rose-500 bg-rose-50 text-rose-950 font-black' : 'border-slate-200 text-slate-600']"
              >
                <div class="font-black">🔥 河北衡水标准</div>
                <div class="text-[10px] text-slate-400 mt-0.5">高密度·重双基·防陷阱</div>
              </button>
              <button
                type="button"
                @click="newGradeRegion = 'beijing'"
                :class="['p-2 rounded-xl text-xs border text-left cursor-pointer transition', newGradeRegion === 'beijing' ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-black' : 'border-slate-200 text-slate-600']"
              >
                <div class="font-black">🏛️ 北京素养标准</div>
                <div class="text-[10px] text-slate-400 mt-0.5">情境探究·重思维逻辑</div>
              </button>
            </div>
          </div>

          <div class="pt-1">
            <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input v-model="newGradeInitTextbooks" type="checkbox" class="rounded text-orange-500" />
              <span>自动初始化语文、数学、英语本学期课本目录</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="showCreateGradeModal = false"
            class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
          >
            取消
          </button>
          <button
            @click="handleConfirmCreateGrade"
            class="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-black shadow-sm"
          >
            确认创建
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- Modal 2: Add Subject to Day Modal (在当天添加学科) -->
    <!-- ================================================================= -->
    <div
      v-if="showAddSubjectToDayModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-cartoon font-bold text-slate-900 flex items-center gap-2">
            <span>➕</span>
            <span>为今天添加学科作业</span>
          </h3>
          <button @click="showAddSubjectToDayModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-slate-500">
          选择今天有课后作业或需要练习的学科：
        </p>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="sub in availableSubjectOptions"
            :key="sub.key"
            @click="handleAddSubjectToCurrentDay(sub)"
            class="p-3 rounded-2xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 flex items-center gap-2.5 transition cursor-pointer text-left"
          >
            <span class="text-2xl">{{ sub.icon }}</span>
            <span class="text-xs sm:text-sm font-black text-slate-800">{{ sub.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- Modal 3: Textbook Library & Chapters (学期课本库) -->
    <!-- ================================================================= -->
    <div
      v-if="showTextbookModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 max-w-2xl w-full border-2 border-slate-200 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base sm:text-lg font-cartoon font-bold text-slate-900 flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-orange-500" />
            <span>{{ curriculumStore.activeGrade?.name }} · 本学期课本库</span>
          </h3>
          <button @click="showTextbookModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Subject Tabs -->
        <div class="flex gap-2 border-b border-slate-100 pb-2">
          <button
            v-for="tb in curriculumStore.activeTextbooks"
            :key="tb.subjectKey"
            @click="selectedTbSubjectKey = tb.subjectKey"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5',
              selectedTbSubjectKey === tb.subjectKey
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            <span>{{ tb.icon }}</span>
            <span>{{ tb.subjectName }}</span>
          </button>
        </div>

        <!-- Current Textbook Details & Add Chapter Form -->
        <div v-if="currentTextbook" class="space-y-3 flex-1 overflow-y-auto">
          <div class="text-xs font-bold text-slate-500">
            当前课本：<span class="text-slate-800 font-black">{{ currentTextbook.textbookName }}</span>
          </div>

          <!-- Add Chapter Bar -->
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div class="text-xs font-black text-slate-700">+ 录入新章节：</div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                v-model="newChapterUnit"
                type="text"
                placeholder="单元名 (如: 第一单元)"
                class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              />
              <input
                v-model="newChapterTitle"
                type="text"
                placeholder="课题 (如: 5以内加减法)"
                class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              />
              <input
                v-model="newChapterPages"
                type="text"
                placeholder="页码 (如: 第14-25页)"
                class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              />
            </div>
            <button
              @click="handleAddChapterToTextbook"
              class="w-full py-1.5 bg-orange-500 text-white rounded-xl text-xs font-black shadow-2xs hover:bg-orange-600 transition cursor-pointer"
            >
              + 确认录入章节
            </button>
          </div>

          <!-- Chapter List -->
          <div class="space-y-1.5">
            <div v-if="currentTextbook.chapters.length === 0" class="text-center py-6 text-xs text-slate-400 font-bold">
              暂无章节记录，请在上方录入目录
            </div>
            <div
              v-for="ch in currentTextbook.chapters"
              :key="ch.id"
              class="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
            >
              <div class="min-w-0 pr-2">
                <div class="text-xs font-black text-slate-800 truncate">{{ ch.unitName }} - {{ ch.lessonTitle }}</div>
                <div class="text-[10px] text-slate-400">{{ ch.pageRange }}</div>
              </div>
              <button
                @click="handleDeleteChapter(ch.id)"
                class="text-slate-300 hover:text-rose-500 p-1"
                title="删除章节"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 text-right">
          <button
            @click="showTextbookModal = false"
            class="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black cursor-pointer"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- Modal 4: AI Smart Quiz & Practice for Task -->
    <!-- ================================================================= -->
    <div
      v-if="showQuizModal && practicingTask"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full border-2 border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base sm:text-lg font-cartoon font-bold text-slate-900 flex items-center gap-2">
            <span>{{ practicingTask.subjectIcon }}</span>
            <span>{{ practicingTask.subjectName }} · 今日变式练习 (3道题)</span>
          </h3>
          <button @click="showQuizModal = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Practicing Step -->
        <div v-if="quizStep === 'practicing'" class="space-y-4">
          <div v-if="isGeneratingQuiz" class="text-center py-10 space-y-2">
            <Sparkles class="w-8 h-8 text-orange-500 animate-spin mx-auto" />
            <div class="text-xs sm:text-sm font-black text-slate-700">小诺 AI 正在根据今日课本与作业提炼考点...</div>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(q, idx) in practicingTask.generatedQuestions"
              :key="q.id"
              class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-orange-600">第 {{ idx + 1 }} 题 · 考点: {{ q.knowledgePoint }}</span>
                <button
                  @click="askAiTutor(q)"
                  class="text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <Bot class="w-3 h-3" />
                  <span>点拨</span>
                </button>
              </div>

              <p class="text-xs sm:text-sm font-bold text-slate-800">{{ q.prompt }}</p>

              <!-- Option Choices -->
              <div v-if="q.options && q.options.length > 0" class="grid grid-cols-2 gap-2 pt-1">
                <button
                  v-for="opt in q.options"
                  :key="opt"
                  @click="userAnswers[q.id] = opt"
                  :class="['p-2 rounded-xl text-left text-xs font-bold border transition cursor-pointer', userAnswers[q.id] === opt ? 'border-orange-500 bg-orange-100 text-orange-950 font-black ring-1 ring-orange-300' : 'border-slate-200 bg-white text-slate-700']"
                >
                  {{ opt }}
                </button>
              </div>

              <!-- Input for Fill blank -->
              <div v-else class="pt-1">
                <input
                  v-model="userAnswers[q.id]"
                  type="text"
                  placeholder="在此输入计算答案..."
                  class="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div v-if="!isGeneratingQuiz" class="flex items-center justify-end gap-2 pt-2">
            <button
              @click="showQuizModal = false"
              class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
            >
              稍后再练
            </button>
            <button
              @click="submitQuiz"
              class="px-6 py-2 rounded-xl bg-orange-500 text-white text-xs font-black shadow-sm cursor-pointer hover:bg-orange-600"
            >
              提交批改
            </button>
          </div>
        </div>

        <!-- Result Step -->
        <div v-else-if="quizStep === 'result'" class="space-y-4 text-center">
          <div class="text-3xl">🎉</div>
          <h4 class="text-base sm:text-lg font-cartoon font-bold text-slate-800">
            {{ practicingTask.subjectName }}变式练习已完成！
          </h4>
          <p class="text-xs text-slate-500">
            本次得分：<span class="font-black text-orange-600 text-sm">{{ practicingTask.score }} 分</span>。错题已自动入库全科错题本。
          </p>

          <div class="space-y-2 text-left pt-2">
            <div
              v-for="(q, idx) in practicingTask.generatedQuestions"
              :key="q.id"
              :class="['p-3 rounded-xl border text-xs space-y-1', questionResults[q.id] ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200']"
            >
              <div class="flex items-center justify-between">
                <span class="font-black">{{ idx + 1 }}. {{ q.prompt }}</span>
                <span :class="questionResults[q.id] ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'">
                  {{ questionResults[q.id] ? '正确' : '错误' }}
                </span>
              </div>
              <div class="text-slate-600"><span class="font-bold">标准正解：</span>{{ q.correctAnswer }}</div>
              <div class="text-slate-500 text-[11px]"><span class="font-bold">名师解析：</span>{{ q.explanation }}</div>
            </div>
          </div>

          <div class="pt-3">
            <button
              @click="showQuizModal = false"
              class="w-full py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer hover:bg-orange-600"
            >
              完成并关闭
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

