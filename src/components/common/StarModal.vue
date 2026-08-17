<script setup lang="ts">
import { watch, computed } from 'vue';
import { Star, Coins, Zap, ArrowRight, RotateCcw, Map, Trophy, BookOpen } from 'lucide-vue-next';
import type { Lesson } from '../../data/chapters';
import { playVictorySound, triggerConfetti } from '../../lib/audio';
import { useAdventureStore } from '../../stores/adventureStore';
import { useUserStore } from '../../stores/userStore';

const props = defineProps<{
  isOpen: boolean;
  lesson: Lesson;
  stars: number;
  hasNextLesson?: boolean;
}>();

const emit = defineEmits<{
  (e: 'next'): void;
  (e: 'replay'): void;
  (e: 'map'): void;
  (e: 'close'): void;
}>();

const adventureStore = useAdventureStore();
const userStore = useUserStore();

// Random encouraging voice lines from NuoNuo
const encouragingQuotes = [
  '太聪明啦！你落子的速度像闪电一样快！',
  '完美命中要点！这步手筋走得有九段大师的风采！',
  '太厉害啦！白棋在你面前完全没有还手之力！',
  '智慧之光在棋盘上闪耀，你又变强了一大步！'
];

const randomQuote = computed(() => {
  const hash = (props.lesson.id.charCodeAt(0) || 0) % encouragingQuotes.length;
  return encouragingQuotes[hash];
});

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      playVictorySound();
      triggerConfetti();

      // Automatically sync progress to Pinia Store & LocalStorage
      adventureStore.completeLevel(props.lesson.id, props.stars, {
        exp: props.lesson.rewards.exp,
        coins: props.lesson.rewards.coins
      });
      userStore.recordPuzzleSolved();
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-md select-none animate-fade-in"
    >
      <div class="flex min-h-screen items-center justify-center p-4 sm:p-6 text-center">
        <div
          class="relative w-full max-w-lg transform rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 transition-all my-8 animate-pop-in z-[10000]"
        >
          <!-- Top Mascot Trophy Badge -->
          <div class="relative -mt-14 mb-3 flex justify-center">
            <div
              class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 p-2 shadow-xl border-4 border-white flex items-center justify-center animate-bounce-subtle"
            >
              <Trophy class="w-10 h-10 text-white drop-shadow" />
            </div>
          </div>

          <!-- Victory Title -->
          <h2 class="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
            闯关成功！太棒啦！
          </h2>
          <p class="text-xs sm:text-sm font-bold text-orange-600 mb-4">
            {{ lesson.title }} <span class="text-gray-300">|</span> {{ lesson.titleEn }}
          </p>

          <!-- 3-Star Rating Animation -->
          <div class="flex justify-center items-center gap-3 my-4">
            <div
              v-for="s in 3"
              :key="s"
              class="transform transition-transform duration-300"
              :class="s <= stars ? 'scale-110 text-amber-400' : 'text-gray-200'"
            >
              <Star
                class="w-10 h-10 sm:w-12 sm:h-12 fill-current drop-shadow-md"
              />
            </div>
          </div>

          <!-- Mascot Encouraging Bubble -->
          <div class="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 text-xs sm:text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span class="text-2xl flex-shrink-0">🐼</span>
            <p class="text-left leading-relaxed">
              小诺说：“{{ randomQuote }}”
            </p>
          </div>

          <!-- Rewards Summary Cards -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex items-center justify-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 shadow-sm">
                <Coins class="w-4 h-4" />
              </div>
              <div class="text-left">
                <div class="text-[10px] font-extrabold text-amber-700">金币奖励</div>
                <div class="text-base font-black text-amber-900">+{{ lesson.rewards.coins }}</div>
              </div>
            </div>

            <div class="bg-indigo-50 rounded-2xl p-3 border border-indigo-200 flex items-center justify-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                <Zap class="w-4 h-4" />
              </div>
              <div class="text-left">
                <div class="text-[10px] font-extrabold text-indigo-700">棋力经验</div>
                <div class="text-base font-black text-indigo-900">+{{ lesson.rewards.exp }} XP</div>
              </div>
            </div>
          </div>

          <!-- Bilingual Term Commentary Box -->
          <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200 text-left mb-6 space-y-2">
            <div class="flex items-center gap-2 text-xs font-black text-orange-900">
              <BookOpen class="w-4 h-4 text-orange-600" />
              <span>名师点睛与双语术语 (Master Commentary)</span>
            </div>

            <div class="bg-white/90 rounded-xl p-2.5 border border-orange-100 flex items-center justify-between">
              <div>
                <span class="font-black text-sm text-gray-900">{{ lesson.bilingualTerm.chinese }}</span>
                <span class="text-xs text-orange-600 font-semibold ml-1.5">{{ lesson.bilingualTerm.pinyin }}</span>
              </div>
              <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ lesson.bilingualTerm.english }}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
              {{ lesson.explanation }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-2.5">
            <button
              @click="emit('map')"
              class="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold flex items-center justify-center gap-2 transition active:scale-95 text-xs sm:text-sm"
            >
              <Map class="w-4 h-4" />
              <span>返回地图</span>
            </button>

            <button
              @click="emit('replay')"
              class="flex-1 py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold flex items-center justify-center gap-2 transition active:scale-95 text-xs sm:text-sm"
            >
              <RotateCcw class="w-4 h-4" />
              <span>再练一次</span>
            </button>

            <button
              v-if="hasNextLesson"
              @click="emit('next')"
              class="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition active:scale-95 text-xs sm:text-sm"
            >
              <span>进入下一关</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

