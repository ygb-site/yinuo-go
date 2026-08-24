<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SUBJECTS_CONFIG } from '../data/subjectsData';
import { getChaptersBySubject } from '../data/academicCurriculum';
import { GRADE_LEVELS, type SubjectId, type GradeLevel, type UniversalChapter, type UniversalLesson } from '../types/curriculum';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound, playErrorSound } from '../lib/audio';
import { showAlert } from '../utils/alert';
import {
  ArrowRight,
  Star,
  ArrowLeft,
  BookOpen,
  Zap,
  Lock,
  Play,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const subjectId = computed<SubjectId>(() => {
  const s = route.params.id as SubjectId;
  return s && (SUBJECTS_CONFIG as any)[s] ? s : 'math';
});

const subjectMeta = computed(() => {
  return (SUBJECTS_CONFIG as any)[subjectId.value] || SUBJECTS_CONFIG.math;
});

// All chapters for this subject
const allChapters = computed<UniversalChapter[]>(() => {
  return getChaptersBySubject(subjectId.value);
});

// 🌟 Only display grade level tabs that actually have curriculum chapters for this subject
const availableGradeLevels = computed(() => {
  if (subjectId.value === 'go') return [];
  const existingGradeIds = new Set(allChapters.value.map(ch => ch.gradeLevel).filter(Boolean));
  const list = GRADE_LEVELS.filter(g => existingGradeIds.has(g.id));
  return list.length > 0 ? list : [GRADE_LEVELS[0]];
});

// Active Selected Grade Level: default to first available grade
const activeGrade = ref<GradeLevel>('g1_t1');

watch(
  () => [subjectId.value, availableGradeLevels.value],
  () => {
    if (availableGradeLevels.value.length > 0 && !availableGradeLevels.value.some(g => g.id === activeGrade.value)) {
      activeGrade.value = availableGradeLevels.value[0].id;
    }
  },
  { immediate: true }
);

// Active Section Tab: 'curriculum' (教材同步主线) | 'tools' (专项训练与工具)
const activeSection = ref<'curriculum' | 'tools'>('curriculum');

// Filter chapters by selected grade level
const filteredChapters = computed<UniversalChapter[]>(() => {
  if (subjectId.value === 'go') return allChapters.value;
  return allChapters.value.filter(ch => ch.gradeLevel === activeGrade.value || (!ch.gradeLevel && activeGrade.value === 'g1_t1'));
});

const gradeLessons = computed<UniversalLesson[]>(() => {
  const list: UniversalLesson[] = [];
  for (const c of filteredChapters.value) {
    list.push(...c.lessons);
  }
  return list;
});

const completedCount = computed(() => {
  return gradeLessons.value.filter((l: UniversalLesson) => !!userStore.progress[l.id]?.completed).length;
});

const totalStarsEarned = computed(() => {
  return gradeLessons.value.reduce((acc: number, l: UniversalLesson) => {
    return acc + (userStore.progress[l.id]?.stars || 0);
  }, 0);
});

const progressPercent = computed(() => {
  if (gradeLessons.value.length === 0) return 0;
  return Math.round((completedCount.value / gradeLessons.value.length) * 100);
});

const isLessonUnlocked = (lesson: UniversalLesson) => {
  // First lesson is always unlocked
  const currentChapter = allChapters.value.find(c => c.id === lesson.chapterId);
  if (!currentChapter) return true;
  const idx = currentChapter.lessons.findIndex(l => l.id === lesson.id);
  if (idx === 0) return true;
  if (userStore.progress[lesson.id]?.completed) return true;
  const prevLesson = currentChapter.lessons[idx - 1];
  return !!userStore.progress[prevLesson?.id]?.completed;
};

const handleOpenLesson = (lesson: UniversalLesson) => {
  if (!isLessonUnlocked(lesson)) {
    playErrorSound();
    showAlert({
      title: '关卡尚未解锁',
      message: '小勇士别着急！需要先通关前面的基础关卡才能解锁本课哦！',
      type: 'warning'
    });
    return;
  }
  playButtonSound();
  router.push(`/subject/${subjectId.value}/lesson/${lesson.id}`);
};

const navigateTo = (path: string) => {
  playButtonSound();
  router.push(path);
};

const goCampus = () => {
  playButtonSound();
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] pb-20 select-none">
    <!-- Top Hero Subject Banner -->
    <div :class="['relative overflow-hidden text-white pt-4 sm:pt-6 pb-8 sm:pb-12 px-3 sm:px-6 bg-gradient-to-r shadow-lg', subjectMeta.bgGradient]">
      <div class="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

      <div class="max-w-5xl mx-auto relative z-10">
        <!-- Back to Campus -->
        <button
          @click="goCampus"
          class="mb-3 sm:mb-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 shadow-sm border border-white/20 cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>返回大厅</span>
        </button>

        <div class="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div class="text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] sm:text-xs font-black mb-2 sm:mb-3 border border-white/30 shadow-xs">
              <span>{{ subjectMeta.icon }}</span>
              <span>{{ subjectMeta.badge }}</span>
              <span>•</span>
              <span>人教版小学同步</span>
            </div>

            <h1 class="text-2xl sm:text-4xl lg:text-5xl font-cartoon font-bold text-white tracking-wider drop-shadow-md">
              {{ subjectMeta.title }}
            </h1>
            <p class="mt-1 sm:mt-2 text-xs sm:text-base text-white/90 font-bold max-w-xl">
              {{ subjectMeta.slogan }}
            </p>
          </div>

          <!-- Quick Stats Pill -->
          <div class="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white w-full md:w-auto min-w-0 md:min-w-[220px] shadow-lg text-center">
            <div class="text-[11px] sm:text-xs font-bold text-white/80 mb-0.5 sm:mb-1">通关进度</div>
            <div class="text-xl sm:text-3xl font-black flex items-center justify-center gap-1">
              <span>{{ completedCount }}</span>
              <span class="text-xs sm:text-sm opacity-70">/ {{ gradeLessons.length }} 关</span>
            </div>

            <div class="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
              <div
                class="bg-amber-300 h-full rounded-full transition-all duration-500"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>

            <div class="mt-2 text-[11px] sm:text-xs font-black text-amber-200 flex items-center justify-center gap-2">
              <span class="inline-flex items-center gap-1">
                <Star class="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {{ totalStarsEarned }} 星
              </span>
              <span class="opacity-50">·</span>
              <span>🪙 {{ userStore.coins }} 金币</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="max-w-5xl mx-auto px-3 sm:px-6 -mt-5 sm:-mt-6 relative z-20 space-y-4 sm:space-y-6">
      
      <!-- 1. GRADE LEVEL SELECTOR (学段年级切换器) -->
      <div v-if="subjectId !== 'go' && availableGradeLevels.length > 1" class="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border-2 border-slate-200 shadow-md">
        <div class="text-xs font-black text-slate-400 mb-1.5 sm:mb-2 px-1 sm:px-2 flex items-center gap-1.5">
          <span>🎒</span>
          <span>选择学习年级与学期：</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          <button
            v-for="grade in availableGradeLevels"
            :key="grade.id"
            @click="activeGrade = grade.id"
            :class="[
              'p-2 sm:p-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm border-2 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer',
              activeGrade === grade.id
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-amber-500 shadow-md scale-[1.02]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
            ]"
          >
            <span class="text-xs sm:text-base font-extrabold font-cartoon tracking-wide">{{ grade.name }}</span>
            <span class="text-[9px] sm:text-[10px] opacity-80 font-semibold">{{ grade.badge }}</span>
          </button>
        </div>
      </div>

      <!-- 2. SECTION SWITCHER TABS (课件闯关 vs 专项工具) -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="activeSection = 'curriculum'"
          :class="[
            'flex-1 py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-xs border-2 cursor-pointer',
            activeSection === 'curriculum'
              ? 'bg-white text-slate-900 border-amber-400 shadow-md ring-2 ring-amber-200 font-extrabold'
              : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
          ]"
        >
          <BookOpen class="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          <span class="font-cartoon tracking-wide hidden sm:inline">📖 教材同步课件闯关</span>
          <span class="font-cartoon tracking-wide sm:hidden">📖 课本同步闯关</span>
        </button>

        <button
          @click="activeSection = 'tools'"
          :class="[
            'flex-1 py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-xs border-2 cursor-pointer',
            activeSection === 'tools'
              ? 'bg-white text-slate-900 border-amber-400 shadow-md ring-2 ring-amber-200 font-extrabold'
              : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
          ]"
        >
          <Zap class="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          <span class="font-cartoon tracking-wide hidden sm:inline">⚡ 专项训练与工具箱</span>
          <span class="font-cartoon tracking-wide sm:hidden">⚡ 专项训练工具</span>
        </button>
      </div>

      <!-- TAB 1: TEXTBOOK CURRICULUM CHAPTERS (课本同步闯关) -->
      <div v-if="activeSection === 'curriculum'" class="space-y-4 sm:space-y-6 animate-fade-in">
        <div v-if="filteredChapters.length === 0" class="p-6 sm:p-8 text-center bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200">
          <p class="text-sm sm:text-base font-bold text-slate-500 font-cartoon">该年级内容正在加速上线中，敬请期待！</p>
        </div>

        <div
          v-for="chapter in filteredChapters"
          :key="chapter.id"
          class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border-2 border-slate-200 shadow-md space-y-3 sm:space-y-4"
        >
          <!-- Chapter Header -->
          <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 text-xl sm:text-2xl flex items-center justify-center shadow-inner shrink-0">
                {{ chapter.icon }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <span class="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-amber-400 text-slate-900 shrink-0">
                    {{ chapter.badge }}
                  </span>
                  <h3 class="text-base sm:text-xl font-cartoon font-bold text-slate-900 tracking-wide truncate">
                    {{ chapter.title }}
                  </h3>
                </div>
                <p class="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5 truncate">
                  {{ chapter.subtitle }}
                </p>
              </div>
            </div>
          </div>

          <!-- Lessons Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
            <div
              v-for="lesson in chapter.lessons"
              :key="lesson.id"
              @click="handleOpenLesson(lesson)"
              :class="[
                'p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all transform flex items-center justify-between cursor-pointer min-w-0',
                isLessonUnlocked(lesson)
                  ? 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-400 hover:scale-[1.01] shadow-2xs'
                  : 'bg-slate-100/70 border-slate-200 opacity-60'
              ]"
            >
              <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0">
                  {{ lesson.icon }}
                </div>
                <div class="min-w-0">
                  <h4 class="font-cartoon font-bold text-slate-800 text-xs sm:text-base tracking-wide truncate">
                    {{ lesson.title }}
                  </h4>
                  <p class="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">
                    {{ lesson.subtitle }}
                  </p>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="shrink-0 ml-2">
                <div
                  v-if="userStore.progress[lesson.id]?.completed"
                  class="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] sm:text-[11px] font-black"
                >
                  <Star class="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-500" />
                  <span>{{ userStore.progress[lesson.id]?.stars || 3 }}星</span>
                </div>
                <div
                  v-else-if="isLessonUnlocked(lesson)"
                  class="p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full shadow-2xs"
                >
                  <Play class="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                </div>
                <div
                  v-else
                  class="p-1.5 bg-slate-200 text-slate-400 rounded-full"
                >
                  <Lock class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: SPECIALIZED TOOLS & PLAYGROUNDS (专项工具与竞技场) -->
      <div v-else class="space-y-4 animate-fade-in">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <div
            v-for="feat in subjectMeta.features"
            :key="feat.title"
            @click="navigateTo(feat.route)"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between group min-w-0"
          >
            <div>
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-amber-50 transition-all shadow-inner shrink-0">
                {{ feat.icon }}
              </div>
              <h4 class="text-base sm:text-xl font-cartoon font-bold text-slate-800 group-hover:text-amber-600 transition-colors tracking-wide truncate">
                {{ feat.title }}
              </h4>
              <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-normal sm:leading-relaxed line-clamp-2">
                {{ feat.desc }}
              </p>
            </div>

            <div class="mt-4 sm:mt-6 flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 text-xs font-black text-slate-400 group-hover:text-amber-600">
              <span class="font-cartoon text-xs">立即进入体验</span>
              <ArrowRight class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

