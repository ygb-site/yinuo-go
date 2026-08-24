<script setup lang="ts">
import { computed } from 'vue';
import { GoGame } from '../../engine/GoGame';
import { calculateWinRate, type WinRateSnapshot } from '../../services/goReviewService';
import { Sparkles, TrendingUp, Search } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    game: GoGame;
    blackName?: string;
    whiteName?: string;
    canReview?: boolean;
  }>(),
  {
    blackName: '黑方',
    whiteName: '白方',
    canReview: true
  }
);

const emit = defineEmits<{
  (e: 'openReview'): void;
}>();

const winRate = computed<WinRateSnapshot>(() => {
  return calculateWinRate(props.game);
});
</script>

<template>
  <div class="w-full bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border-2 border-orange-100 shadow-xs select-none">
    <!-- Top Row: Win Rate Percentages & Match Status -->
    <div class="flex items-center justify-between gap-2 mb-1.5 text-xs font-black">
      
      <!-- White Win Rate (Left) -->
      <div class="flex items-center gap-1.5 text-indigo-900 min-w-0">
        <span class="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 inline-block shadow-2xs shrink-0"></span>
        <span class="truncate max-w-[80px] sm:max-w-[120px] text-gray-700">{{ whiteName }}</span>
        <span class="text-xs sm:text-sm font-mono font-black text-indigo-600">{{ winRate.whiteWinRate }}%</span>
      </div>

      <!-- Center Status Badge -->
      <div class="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs text-amber-900 font-black shadow-2xs shrink-0">
        <TrendingUp class="w-3 h-3 text-amber-600 shrink-0" />
        <span>{{ winRate.statusText }}</span>
      </div>

      <!-- Black Win Rate (Right) -->
      <div class="flex items-center gap-1.5 text-orange-950 min-w-0 justify-end">
        <span class="text-xs sm:text-sm font-mono font-black text-orange-600">{{ winRate.blackWinRate }}%</span>
        <span class="truncate max-w-[80px] sm:max-w-[120px] text-gray-700">{{ blackName }}</span>
        <span class="w-3.5 h-3.5 rounded-full bg-slate-900 inline-block shadow-2xs shrink-0"></span>
      </div>

    </div>

    <!-- Center Tug-of-War Real-Time Win Rate Bar -->
    <div class="relative w-full h-3 sm:h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 flex shadow-inner">
      <!-- White Share (Left) -->
      <div
        class="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-l-full transition-all duration-500 relative"
        :style="{ width: winRate.whiteWinRate + '%' }"
      ></div>

      <!-- Center Balance Split Marker -->
      <div class="w-0.5 h-full bg-white/80 z-10 shrink-0"></div>

      <!-- Black Share (Right) -->
      <div
        class="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-r-full transition-all duration-500 relative"
        :style="{ width: winRate.blackWinRate + '%' }"
      ></div>
    </div>

    <!-- Bottom Subtext & AI Review Trigger -->
    <div class="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1.5 px-0.5">
      <div class="flex items-center gap-1 truncate">
        <Sparkles class="w-3 h-3 text-amber-500 shrink-0" />
        <span class="text-slate-500 truncate">{{ winRate.leadDesc }}</span>
      </div>

      <button
        v-if="canReview && game.history.length > 0"
        @click="emit('openReview')"
        class="text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 shrink-0 font-black cursor-pointer active:scale-95 transition-transform"
        title="打开全局逐步复盘分析"
      >
        <Search class="w-3 h-3 text-orange-500" />
        <span>AI 复盘分析</span>
      </button>
    </div>
  </div>
</template>

