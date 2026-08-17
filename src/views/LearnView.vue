<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CHAPTERS_DATA, type Lesson } from '../data/chapters';
import { useAdventureStore } from '../stores/adventureStore';
import { useUserStore } from '../stores/userStore';
import { playButtonSound, playErrorSound } from '../../src/lib/audio';
import {
  Star,
  Lock,
  Play,
  Gamepad2,
  Coins
} from 'lucide-vue-next';

const router = useRouter();
const adventureStore = useAdventureStore();
const userStore = useUserStore();

const activeChapterId = ref<number>(1);

const selectChapter = (id: number) => {
  activeChapterId.value = id;
  playButtonSound();
};

const isLessonUnlocked = (lessonId: string): boolean => {
  if (lessonId === 'lesson_1_1' || lessonId === 'c1_l1') return true;
  // Flatten all lessons
  const allLessons: Lesson[] = [];
  for (const c of CHAPTERS_DATA) {
    allLessons.push(...c.lessons);
  }
  const idx = allLessons.findIndex(l => l.id === lessonId);
  if (idx <= 0) return true;
  const prevLesson = allLessons[idx - 1];
  return !!adventureStore.completedLevels[prevLesson.id];
};

const getLessonStars = (lessonId: string): number => {
  const rec = adventureStore.completedLevels[lessonId];
  return rec ? rec.stars : 0;
};

const startLesson = (lesson: Lesson) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (!isLessonUnlocked(lesson.id)) {
    playErrorSound();
    return;
  }
  playButtonSound();
  router.push(`/lesson/${lesson.id}`);
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-8">

      <!-- Header Hero Card -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div class="space-y-2 text-center md:text-left z-10">
          <div class="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-black">
            <Gamepad2 class="w-3.5 h-3.5" />
            <span>少儿启蒙闯关大冒险 (Adventure Map)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            围棋小精灵成长之路
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            跟着萌宠小诺一起闯关，从认识星位到掌握绝妙吃子手筋，收集满天繁星！
          </p>
        </div>

        <!-- User Stats Pill Header -->
        <div class="flex items-center gap-4 bg-amber-50 rounded-2xl p-4 border border-amber-200 z-10">
          <div class="text-center">
            <div class="text-[10px] font-extrabold text-amber-700">收集星星</div>
            <div class="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Star class="w-5 h-5 text-amber-500 fill-current" />
              <span>{{ adventureStore.totalStarsEarned }}</span>
            </div>
          </div>
          <div class="w-px h-8 bg-amber-200"></div>
          <div class="text-center">
            <div class="text-[10px] font-extrabold text-amber-700">金币奖励</div>
            <div class="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Coins class="w-5 h-5 text-amber-500" />
              <span>{{ userStore.coins }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chapter Selection Tabs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="chap in CHAPTERS_DATA"
          :key="chap.id"
          @click="selectChapter(chap.id)"
          class="p-5 rounded-3xl border-2 transition-all transform hover:scale-102 active:scale-95 text-left flex items-center justify-between"
          :class="
            activeChapterId === chap.id
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/25 ring-2 ring-orange-300'
              : 'bg-white text-gray-800 border-gray-100 hover:border-orange-200 shadow-sm'
          "
        >
          <div class="flex items-center gap-4">
            <span class="text-3xl sm:text-4xl">{{ chap.icon }}</span>
            <div>
              <span
                class="text-[10px] font-black px-2 py-0.5 rounded-full"
                :class="activeChapterId === chap.id ? 'bg-white/30 text-white' : 'bg-orange-50 text-orange-600'"
              >
                第 {{ chap.id }} 章
              </span>
              <h3 class="text-base sm:text-lg font-black mt-0.5">
                {{ chap.title.split('：')[1] || chap.title }}
              </h3>
              <p
                class="text-xs font-medium mt-0.5 line-clamp-1"
                :class="activeChapterId === chap.id ? 'text-white/80' : 'text-gray-500'"
              >
                {{ chap.description }}
              </p>
            </div>
          </div>

          <div
            class="text-xs font-black px-3 py-1.5 rounded-xl border"
            :class="activeChapterId === chap.id ? 'bg-white text-orange-600 border-white' : 'bg-gray-50 text-gray-700 border-gray-200'"
          >
            {{ chap.lessons.length }} 关
          </div>
        </button>
      </div>

      <!-- Current Chapter Adventure Path Grid -->
      <div
        v-for="chap in CHAPTERS_DATA"
        :key="`map-${chap.id}`"
        v-show="activeChapterId === chap.id"
        class="space-y-6 animate-fade-in"
      >
        <!-- Chapter Header Banner -->
        <div class="bg-gradient-to-r rounded-3xl p-6 text-white shadow-md" :class="chap.themeColor">
          <div class="text-xs font-black uppercase tracking-wider opacity-90">{{ chap.titleEn }}</div>
          <h2 class="text-xl sm:text-2xl font-black mt-1">{{ chap.title }}</h2>
          <p class="text-xs sm:text-sm font-medium opacity-90 mt-1 max-w-xl">
            {{ chap.description }}
          </p>
        </div>

        <!-- Lessons Cards Path Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(lesson, idx) in chap.lessons"
            :key="lesson.id"
            @click="startLesson(lesson)"
            class="rounded-3xl p-6 border-2 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between cursor-pointer"
            :class="
              isLessonUnlocked(lesson.id)
                ? 'bg-white border-gray-100 hover:border-orange-300 shadow-sm hover:shadow-xl'
                : 'bg-gray-50/75 border-gray-200 opacity-60 cursor-not-allowed'
            "
          >
            <!-- Top Row: Index Badge, Type Tag & Star Rating -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span
                  class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm"
                  :class="isLessonUnlocked(lesson.id) ? 'bg-gradient-to-tr from-orange-500 to-amber-500' : 'bg-gray-400'"
                >
                  {{ idx + 1 }}
                </span>
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-md"
                  :class="lesson.type === 'story' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'"
                >
                  {{ lesson.type === 'story' ? '📖 讲解模式' : '🧩 死活练习' }}
                </span>
              </div>

              <!-- Stars Earned -->
              <div class="flex items-center gap-1">
                <Star
                  v-for="s in 3"
                  :key="s"
                  class="w-4 h-4"
                  :class="s <= getLessonStars(lesson.id) ? 'text-amber-400 fill-current' : 'text-gray-200'"
                />
              </div>
            </div>

            <!-- Main Content -->
            <div class="space-y-1.5 mb-4">
              <h3 class="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <span>{{ lesson.title }}</span>
                <Lock v-if="!isLessonUnlocked(lesson.id)" class="w-4 h-4 text-gray-400" />
              </h3>
              <p class="text-xs text-orange-600 font-bold">
                {{ lesson.subtitle }}
              </p>
              <p class="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
                {{ lesson.goalText }}
              </p>
            </div>

            <!-- Footer: Bilingual Term tag & Launch Button -->
            <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span class="text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                ✨ {{ lesson.bilingualTerm.chinese }} ({{ lesson.bilingualTerm.english }})
              </span>

              <button
                v-if="isLessonUnlocked(lesson.id)"
                class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black shadow-md hover:from-orange-600 hover:to-amber-600 transition flex items-center gap-1"
              >
                <span>{{ getLessonStars(lesson.id) > 0 ? '再战' : '开始' }}</span>
                <Play class="w-3 h-3 fill-current" />
              </button>
              <span v-else class="text-xs font-bold text-gray-400 flex items-center gap-1">
                <Lock class="w-3.5 h-3.5" /> 待解锁
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

