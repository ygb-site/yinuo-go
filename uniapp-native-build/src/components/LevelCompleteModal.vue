<script setup lang="ts">
import { Star, Coins, Zap, ArrowRight, RotateCcw, Map, BookOpen, X } from 'lucide-vue-next';
import type { LevelItem } from '../data/curriculum';

const props = defineProps<{
  isOpen: boolean;
  level: LevelItem;
  stars: number;
  hasNextLevel: boolean;
}>();

const emit = defineEmits<{
  (e: 'next'): void;
  (e: 'replay'): void;
  (e: 'map'): void;
}>();
</script>

<template>
  
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-4"
      @click.self="emit('map')"
    >
      <div
        class="relative w-full max-w-md max-h-[96vh] overflow-y-auto transform rounded-3xl bg-white p-5 sm:p-6 text-center shadow-2xl border-4 border-amber-300 transition-all animate-pop-in z-[10000] my-auto"
      >
        <!-- Close Button -->
        <button
          type="button"
          @click="emit('map')"
          class="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer z-10"
          title="关闭"
        >
          <X class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <!-- Celebratory Tag -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-1.5 shadow-2xs">
          <span>🎉</span>
          <span>顺利通关</span>
          <span>🏆</span>
        </div>

        <!-- Victory Title -->
        <h2 class="text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent leading-tight font-cartoon tracking-wide">
          闯关成功！太棒啦！
        </h2>
        <p class="text-[11px] sm:text-xs font-bold text-gray-500 mt-0.5 mb-2 line-clamp-1">
          {{ level.title }}
        </p>

        <!-- 3-Star Rating Animation -->
        <div class="flex justify-center items-center gap-2.5 my-2">
          <div
            v-for="s in 3"
            :key="s"
            class="transform transition-all duration-300"
            :class="s <= stars ? 'scale-110 text-amber-400 drop-shadow-[0_4px_10px_rgba(251,191,36,0.5)]' : 'text-gray-200'"
          >
            <Star
              class="w-8 h-8 sm:w-10 sm:h-10 fill-current"
            />
          </div>
        </div>

        <!-- Rewards Summary Cards -->
        <div class="grid grid-cols-2 gap-2 mb-2.5">
          <div class="bg-amber-50/80 rounded-2xl p-2 sm:p-2.5 border border-amber-200 flex items-center justify-center gap-2">
            <div class="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 shadow-2xs">
              <Coins class="w-4 h-4" />
            </div>
            <div class="text-left">
              <div class="text-[9px] font-extrabold text-amber-700 leading-tight">金币奖励</div>
              <div class="text-sm font-black text-amber-900 leading-none mt-0.5">+{{ level.rewards.coins }}</div>
            </div>
          </div>

          <div class="bg-indigo-50/80 rounded-2xl p-2 sm:p-2.5 border border-indigo-200 flex items-center justify-center gap-2">
            <div class="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-2xs">
              <Zap class="w-4 h-4" />
            </div>
            <div class="text-left">
              <div class="text-[9px] font-extrabold text-indigo-700 leading-tight">棋力经验</div>
              <div class="text-sm font-black text-indigo-900 leading-none mt-0.5">+{{ level.rewards.exp }} XP</div>
            </div>
          </div>
        </div>

        <!-- Bilingual Term Commentary Box -->
        <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-2.5 sm:p-3 border border-orange-200 text-left mb-3 space-y-1 shadow-2xs">
          <div class="flex items-center gap-1.5 text-[11px] font-black text-orange-900">
            <BookOpen class="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
            <span>名师点睛 (Key Takeaway)</span>
          </div>
          <p class="text-[10px] sm:text-xs text-gray-700 font-medium leading-relaxed">
            {{ level.explanation }}
          </p>
        </div>

        <!-- Action Buttons: Responsive Grid / Stack -->
        <div class="space-y-1.5 sm:space-y-0 sm:flex sm:gap-2">
          <!-- Next Level Primary Button -->
          <button
            v-if="hasNextLevel"
            @click="emit('next')"
            class="w-full sm:flex-1 py-2.5 sm:py-3 px-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 text-white font-black shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 transition active:scale-95 text-xs sm:text-sm order-1 sm:order-3 cursor-pointer"
          >
            <span>进入下一关</span>
            <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <!-- Secondary Action Buttons in 1 Row on Mobile -->
          <div class="grid grid-cols-2 gap-1.5 w-full sm:flex-1 sm:flex sm:gap-2 order-2 sm:order-1">
            <button
              @click="emit('map')"
              class="py-2 sm:py-3 px-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center gap-1 transition active:scale-95 text-[11px] sm:text-xs cursor-pointer"
            >
              <Map class="w-3.5 h-3.5 text-gray-500" />
              <span>返回地图</span>
            </button>

            <button
              @click="emit('replay')"
              class="py-2 sm:py-3 px-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center justify-center gap-1 transition active:scale-95 text-[11px] sm:text-xs cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5 text-amber-600" />
              <span>再练一次</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  
</template>


