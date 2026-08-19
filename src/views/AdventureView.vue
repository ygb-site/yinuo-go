<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { CHAPTERS_DATA, type Lesson } from "../data/chapters";
import { useAdventureStore } from "../stores/adventureStore";
import { useUserStore } from "../stores/useUserStore";
import { playButtonSound, playErrorSound } from "../../src/lib/audio";
import {
  Star,
  Lock,
  Play,
  Gamepad2,
  Coins,
  ArrowLeft
} from "lucide-vue-next";

const router = useRouter();
const adventureStore = useAdventureStore();
const userStore = useUserStore();

const activeChapterId = ref<number>(1);

const selectChapter = (id: number) => {
  activeChapterId.value = id;
  playButtonSound();
};

const isLessonUnlocked = (lessonId: string): boolean => {
  if (lessonId === "lesson_1_1" || lessonId === "c1_l1") return true;
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
  router.push("/lesson/" + lesson.id);
};

const goBack = () => {
  playButtonSound();
  router.push("/learn");
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-8">

      <!-- Top Navigation & Header Hero Card -->
      <div class="bg-white rounded-3xl p-4 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div class="space-y-2 text-center md:text-left z-10 w-full md:w-auto">
          <div class="flex items-center justify-between md:justify-start gap-2">
            <button
              @click="goBack"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-black transition active:scale-95 cursor-pointer border border-orange-200 shadow-2xs"
              title="返回启蒙学堂"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>返回启蒙学堂</span>
            </button>

            <div class="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-black">
              <Gamepad2 class="w-3.5 h-3.5" />
              <span>趣味主线地图 · 6 大篇章</span>
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            围棋小精灵成长之路
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            跟着萌宠小诺一起闯关，从认识交叉点与气到掌握绝妙吃子手筋，收集满天繁星！
          </p>
        </div>

        <!-- User Stats Pill Header -->
        <div class="flex items-center gap-4 bg-amber-50 rounded-2xl p-3 sm:p-4 border border-amber-200 z-10 shadow-2xs flex-shrink-0">
          <div class="text-center">
            <div class="text-[10px] font-extrabold text-amber-700">收集星星</div>
            <div class="text-xl sm:text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Star class="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current" />
              <span>{{ adventureStore.totalStarsEarned }}</span>
            </div>
          </div>
          <div class="w-px h-7 bg-amber-200"></div>
          <div class="text-center">
            <div class="text-[10px] font-extrabold text-amber-700">金币奖励</div>
            <div class="text-xl sm:text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Coins class="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span>{{ userStore.coins }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Horizontal Chapter Scrollable Tabs (lg:hidden) -->
      <div class="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          v-for="chap in CHAPTERS_DATA"
          :key="'mobile-chap-' + chap.id"
          @click="selectChapter(chap.id)"
          class="px-3.5 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 whitespace-nowrap flex-shrink-0 transition active:scale-95 cursor-pointer"
          :class="
            activeChapterId === chap.id
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md ring-2 ring-orange-300'
              : 'bg-white text-gray-700 border-orange-200/80 shadow-2xs hover:bg-orange-50'
          "
        >
          <span class="text-base">{{ chap.icon }}</span>
          <span>第{{ chap.id }}章 ({{ chap.lessons.length }}关)</span>
        </button>
      </div>

      <!-- Desktop Chapter Selection 6-Grid (hidden lg:grid) -->
      <div class="hidden lg:grid lg:grid-cols-3 gap-4">
        <button
          v-for="chap in CHAPTERS_DATA"
          :key="chap.id"
          @click="selectChapter(chap.id)"
          class="p-5 rounded-3xl border-2 transition-all transform hover:scale-102 active:scale-95 text-left flex items-center justify-between gap-3 group cursor-pointer"
          :class="
            activeChapterId === chap.id
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/25 ring-2 ring-orange-300/60'
              : 'bg-white text-gray-800 border-gray-100 hover:border-orange-200 shadow-sm'
          "
        >
          <div class="flex items-center gap-3.5 flex-1 min-w-0">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-xs transition transform group-hover:scale-110"
              :class="activeChapterId === chap.id ? 'bg-white/20' : 'bg-orange-50 border border-orange-100'"
            >
              {{ chap.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <span
                class="text-[10px] font-black px-2 py-0.5 rounded-full inline-block mb-1"
                :class="activeChapterId === chap.id ? 'bg-white/30 text-white' : 'bg-orange-100 text-orange-800'"
              >
                第 {{ chap.id }} 章
              </span>
              <h3 class="text-sm sm:text-base font-cartoon font-bold tracking-wide truncate leading-tight">
                {{ chap.title.split('：')[1] || chap.title }}
              </h3>
              <p
                class="text-[11px] font-medium mt-1 line-clamp-1 opacity-90"
                :class="activeChapterId === chap.id ? 'text-white/80' : 'text-gray-500'"
              >
                {{ chap.description }}
              </p>
            </div>
          </div>

          <div
            class="text-xs font-black px-3 py-1.5 rounded-2xl border flex-shrink-0 whitespace-nowrap text-center flex items-center justify-center min-w-[56px] shadow-xs"
            :class="activeChapterId === chap.id ? 'bg-white text-orange-600 border-white shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200'"
          >
            {{ chap.lessons.length }} 关
          </div>
        </button>
      </div>

      <!-- Current Chapter Adventure Path Grid -->
      <div
        v-for="chap in CHAPTERS_DATA"
        :key="'map-' + chap.id"
        v-show="activeChapterId === chap.id"
        class="space-y-4 sm:space-y-6 animate-fade-in"
      >
        <!-- Chapter Header Banner -->
        <div class="bg-gradient-to-r rounded-3xl p-5 sm:p-6 text-white shadow-md" :class="chap.themeColor">
          <div class="text-[11px] sm:text-xs font-black uppercase tracking-wider opacity-90">{{ chap.titleEn }}</div>
          <h2 class="text-xl sm:text-2xl font-cartoon font-bold tracking-wide mt-1">{{ chap.title }}</h2>
          <p class="text-xs sm:text-sm font-medium opacity-90 mt-1 max-w-xl">
            {{ chap.description }}
          </p>
        </div>

        <!-- Lessons Cards Path Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          <div
            v-for="(lesson, idx) in chap.lessons"
            :key="lesson.id"
            @click="startLesson(lesson)"
            class="rounded-3xl p-4 sm:p-6 border-2 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between cursor-pointer"
            :class="
              isLessonUnlocked(lesson.id)
                ? 'bg-white border-gray-100 hover:border-orange-300 shadow-sm hover:shadow-md active:scale-98'
                : 'bg-gray-50/75 border-gray-200 opacity-60 cursor-not-allowed'
            "
          >
            <!-- Top Row: Index Badge, Type Tag & Star Rating -->
            <div class="flex items-center justify-between mb-2 sm:mb-3">
              <div class="flex items-center gap-2">
                <span
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm flex-shrink-0"
                  :class="isLessonUnlocked(lesson.id) ? 'bg-gradient-to-tr from-orange-500 to-amber-500' : 'bg-gray-400'"
                >
                  {{ chap.id }}-{{ idx + 1 }}
                </span>
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-full"
                  :class="
                    lesson.type === 'story'
                      ? 'bg-blue-100 text-blue-800'
                      : lesson.type === 'multi_step'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-rose-100 text-rose-800'
                  "
                >
                  {{ lesson.type === 'story' ? '📖 趣味故事' : lesson.type === 'multi_step' ? '✨ 互动闯关 (3练)' : '🎯 围棋死活' }}
                </span>
              </div>

              <!-- Stars Earned -->
              <div class="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <Star
                  v-for="s in 3"
                  :key="s"
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  :class="s <= getLessonStars(lesson.id) ? 'text-amber-400 fill-current' : 'text-gray-200'"
                />
              </div>
            </div>

            <!-- Title & Description -->
            <div class="space-y-1 my-1 sm:my-2">
              <h3 class="text-sm sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <span>{{ lesson.title }}</span>
                <Lock v-if="!isLessonUnlocked(lesson.id)" class="w-3.5 h-3.5 text-gray-400 inline" />
              </h3>
              <p class="text-[11px] sm:text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                {{ lesson.description }}
              </p>
            </div>

            <!-- Bottom Target & Reward / Action (Strictly 1 Line, No Text Wrap) -->
            <div class="pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-3 mt-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-orange-600 font-black text-[11px] sm:text-xs truncate leading-tight"
                  :title="lesson.goalText"
                >
                  目标：{{ lesson.goalText }}
                </div>
              </div>

              <button
                class="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0"
                :class="
                  isLessonUnlocked(lesson.id)
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                "
              >
                <Play class="w-3 h-3 fill-current flex-shrink-0" />
                <span class="whitespace-nowrap">{{ getLessonStars(lesson.id) > 0 ? '再次挑战' : '开始闯关' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
