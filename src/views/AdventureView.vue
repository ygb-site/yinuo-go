<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CURRICULUM_CHAPTERS, type LevelItem } from '../data/curriculum';
import { useAdventureStore } from '../stores/adventureStore';
import { sound } from '../utils/sound';
import { Star, Lock, Play, Trophy } from 'lucide-vue-next';

const router = useRouter();
const adventureStore = useAdventureStore();

const activeChapterId = ref<number>(1);

const selectChapter = (id: number) => {
  activeChapterId.value = id;
  sound.playButtonSound();
};

const playLevel = (level: LevelItem) => {
  if (!adventureStore.isLevelUnlocked(level.id)) {
    sound.playErrorSound();
    return;
  }
  sound.playButtonSound();
  router.push(`/adventure/${level.id}`);
};

const getLevelStars = (levelId: string): number => {
  const rec = adventureStore.completedLevels[levelId];
  return rec ? rec.stars : 0;
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-8">

      <!-- Header & Mascot Intro -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm">
        <div class="space-y-2 text-center md:text-left">
          <div class="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-black">
            <Trophy class="w-3.5 h-3.5" />
            <span>闯关大冒险 · 5 大进阶篇章</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-gray-900">
            围棋王国大冒险 (Go Adventure)
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium">
            每个关卡都配有小诺的亲切引导与名师解析，通关收集 3 颗星赢取丰厚金币与段位经验！
          </p>
        </div>

        <div class="flex items-center gap-4 bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <div class="text-center">
            <div class="text-xs font-bold text-amber-700">总收集星星</div>
            <div class="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Star class="w-6 h-6 text-amber-500 fill-current" />
              <span>{{ adventureStore.totalStarsEarned }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chapter Tabs -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button
          v-for="chap in CURRICULUM_CHAPTERS"
          :key="chap.id"
          @click="selectChapter(chap.id)"
          class="p-4 rounded-3xl border-2 transition-all transform hover:scale-102 active:scale-95 text-left flex flex-col justify-between relative overflow-hidden"
          :class="
            activeChapterId === chap.id
              ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/25 ring-2 ring-orange-300'
              : 'bg-white text-gray-800 border-gray-100 hover:border-orange-200 shadow-sm'
          "
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">{{ chap.icon }}</span>
            <span
              class="text-[10px] font-black px-2 py-0.5 rounded-full"
              :class="activeChapterId === chap.id ? 'bg-white/30 text-white' : 'bg-orange-50 text-orange-600'"
            >
              第 {{ chap.id }} 章
            </span>
          </div>

          <div>
            <div class="font-black text-xs sm:text-sm line-clamp-1">
              {{ chap.title.split('：')[1] || chap.title }}
            </div>
            <div
              class="text-[10px] mt-1 font-bold"
              :class="activeChapterId === chap.id ? 'text-white/80' : 'text-gray-400'"
            >
              {{ adventureStore.getChapterProgress(chap.id).completed }} / {{ chap.levels.length }} 关
            </div>
          </div>

          <!-- Mini Progress Bar -->
          <div class="w-full bg-black/10 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="activeChapterId === chap.id ? 'bg-white' : 'bg-orange-500'"
              :style="{ width: `${adventureStore.getChapterProgress(chap.id).percent}%` }"
            ></div>
          </div>
        </button>
      </div>

      <!-- Current Chapter Level Cards Grid / Path -->
      <div
        v-for="chap in CURRICULUM_CHAPTERS"
        :key="`panel-${chap.id}`"
        v-show="activeChapterId === chap.id"
        class="space-y-6 animate-fade-in"
      >
        <!-- Chapter Banner Card -->
        <div class="bg-gradient-to-r rounded-3xl p-6 text-white shadow-md relative overflow-hidden" :class="chap.themeColor">
          <div class="relative z-10 space-y-1">
            <div class="text-xs font-black uppercase tracking-wider opacity-90">
              {{ chap.titleEn }}
            </div>
            <h2 class="text-xl sm:text-2xl font-black">{{ chap.title }}</h2>
            <p class="text-xs sm:text-sm font-medium opacity-90 max-w-xl">
              {{ chap.description }}
            </p>
          </div>
        </div>

        <!-- Levels List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(level, idx) in chap.levels"
            :key="level.id"
            @click="playLevel(level)"
            class="rounded-3xl p-5 sm:p-6 border-2 transition-all transform hover:-translate-y-1 relative flex flex-col justify-between cursor-pointer"
            :class="
              adventureStore.isLevelUnlocked(level.id)
                ? 'bg-white border-gray-100 hover:border-orange-300 shadow-sm hover:shadow-xl'
                : 'bg-gray-50/80 border-gray-200 opacity-65 cursor-not-allowed'
            "
          >
            <!-- Top Row: Level Index Badge & Star Rating -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span
                  class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm"
                  :class="adventureStore.isLevelUnlocked(level.id) ? 'bg-gradient-to-tr from-orange-500 to-amber-500' : 'bg-gray-400'"
                >
                  {{ idx + 1 }}
                </span>
                <span class="text-xs font-bold text-gray-500">
                  {{ level.boardSize }}x{{ level.boardSize }} 棋盘
                </span>
              </div>

              <!-- Stars Earned -->
              <div class="flex items-center gap-1">
                <div v-for="s in 3" :key="s">
                  <Star
                    class="w-4 h-4"
                    :class="s <= getLevelStars(level.id) ? 'text-amber-400 fill-current' : 'text-gray-200'"
                  />
                </div>
              </div>
            </div>

            <!-- Main Content -->
            <div class="space-y-1.5 mb-4">
              <h3 class="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <span>{{ level.title }}</span>
                <span v-if="!adventureStore.isLevelUnlocked(level.id)">
                  <Lock class="w-4 h-4 text-gray-400" />
                </span>
              </h3>
              <p class="text-xs text-orange-600 font-bold">
                {{ level.subtitle }}
              </p>
              <p class="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {{ level.goal }}
              </p>
            </div>

            <!-- Footer: Bilingual Term tag and Play button -->
            <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span class="text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                📖 {{ level.termBilingual.chinese }} ({{ level.termBilingual.english }})
              </span>

              <button
                v-if="adventureStore.isLevelUnlocked(level.id)"
                class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black shadow-md hover:from-orange-600 hover:to-amber-600 transition flex items-center gap-1"
              >
                <span>{{ getLevelStars(level.id) > 0 ? '再战' : '出发' }}</span>
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


