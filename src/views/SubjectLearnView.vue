<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getChaptersBySubject } from '../data/academicCurriculum';
import { SUBJECTS_CONFIG } from '../data/subjectsData';
import type { SubjectId, UniversalChapter, UniversalLesson } from '../types/curriculum';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound, playErrorSound } from '../lib/audio';
import { showAlert } from '../utils/alert';
import {
  ArrowLeft,
  Star,
  Lock,
  Play
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const subjectId = computed<SubjectId>(() => {
  const s = route.params.subjectId as SubjectId;
  return s && SUBJECTS_CONFIG[s] ? s : 'math';
});

const subjectMeta = computed(() => {
  return SUBJECTS_CONFIG[subjectId.value] || SUBJECTS_CONFIG.math;
});

const chapters = computed<UniversalChapter[]>(() => {
  return getChaptersBySubject(subjectId.value);
});

const allLessons = computed<UniversalLesson[]>(() => {
  const list: UniversalLesson[] = [];
  for (const c of chapters.value) {
    list.push(...c.lessons);
  }
  return list;
});

const isLessonUnlocked = (lesson: UniversalLesson, index: number) => {
  if (index === 0) return true;
  if (userStore.progress[lesson.id]?.completed) return true;
  const prevLesson = allLessons.value[index - 1];
  return !!userStore.progress[prevLesson?.id]?.completed;
};

const handleOpenLesson = (lesson: UniversalLesson, index: number) => {
  if (!isLessonUnlocked(lesson, index)) {
    playErrorSound();
    const prev = allLessons.value[index - 1];
    showAlert({
      title: '关卡尚未解锁',
      message: `小勇士别着急！需要先通关【${prev?.title || '上一关'}】才能解锁这关哦！`,
      type: 'warning'
    });
    return;
  }

  playButtonSound();
  router.push(`/subject/${subjectId.value}/lesson/${lesson.id}`);
};

const goBack = () => {
  playButtonSound();
  router.push(`/subject/${subjectId.value}`);
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 select-none">
    <!-- Header -->
    <header :class="['text-white py-8 px-4 sm:px-6 bg-gradient-to-r shadow-md relative overflow-hidden', subjectMeta.bgGradient]">
      <div class="max-w-4xl mx-auto relative z-10">
        <button
          @click="goBack"
          class="mb-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-sm font-black transition-all active:scale-95 border border-white/20"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回学科主页</span>
        </button>

        <div class="flex items-center gap-4">
          <div class="text-4xl sm:text-5xl">{{ subjectMeta.icon }}</div>
          <div>
            <h1 class="text-2xl sm:text-4xl font-cartoon font-bold text-white tracking-wider drop-shadow-md">{{ subjectMeta.title }}</h1>
            <p class="text-sm sm:text-base text-white/90 font-bold mt-1">
              按章节循序渐进闯关，点亮每一颗智慧之星！
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Chapters & Lessons Container -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
      <div
        v-for="chapter in chapters"
        :key="chapter.id"
        class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md"
      >
        <!-- Chapter Header -->
        <div class="flex items-start justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {{ chapter.icon }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-900">
                  第 {{ chapter.id }} 单元
                </span>
                <h2 class="text-xl sm:text-2xl font-cartoon font-bold text-slate-800 tracking-wide">
                  {{ chapter.title }}
                </h2>
              </div>
              <p class="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                {{ chapter.subtitle }}
              </p>
            </div>
          </div>
        </div>

        <!-- Lesson Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="lesson in chapter.lessons"
            :key="lesson.id"
            @click="handleOpenLesson(lesson, allLessons.findIndex(l => l.id === lesson.id))"
            :class="[
              'p-5 rounded-2xl border-2 transition-all transform flex items-center justify-between cursor-pointer',
              isLessonUnlocked(lesson, allLessons.findIndex(l => l.id === lesson.id))
                ? 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-400 hover:scale-102 shadow-sm'
                : 'bg-slate-100/70 border-slate-200 opacity-60'
            ]"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm shrink-0">
                {{ lesson.icon }}
              </div>
              <div>
                <h3 class="font-cartoon font-bold text-slate-800 text-base sm:text-lg tracking-wide">
                  {{ lesson.title }}
                </h3>
                <p class="text-xs text-slate-500 font-semibold mt-0.5 line-clamp-1">
                  {{ lesson.subtitle }}
                </p>
              </div>
            </div>

            <!-- Status Indicator -->
            <div class="shrink-0 ml-3">
              <div
                v-if="userStore.progress[lesson.id]?.completed"
                class="flex items-center gap-0.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black"
              >
                <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{{ userStore.progress[lesson.id]?.stars || 3 }}星</span>
              </div>
              <div
                v-else-if="isLessonUnlocked(lesson, allLessons.findIndex(l => l.id === lesson.id))"
                class="p-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full shadow-sm"
              >
                <Play class="w-4 h-4 fill-current" />
              </div>
              <div
                v-else
                class="p-2 bg-slate-200 text-slate-400 rounded-full"
              >
                <Lock class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>


