<script setup lang="ts">
import type { ScoreBreakdown, StoneColor } from '../engine/types';
import { Trophy, RotateCcw, X } from 'lucide-vue-next';

const props = defineProps<{
  score: ScoreBreakdown;
  userColor: StoneColor;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'restart'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-md select-none animate-fade-in"
      @click.self="emit('close')"
    >
      <div class="flex min-h-screen items-center justify-center p-4 sm:p-6 text-center">
        <div
          class="relative w-full max-w-md transform rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 transition-all my-8 animate-pop-in z-[10000]"
        >
          <!-- Close Button -->
          <button
            type="button"
            @click="emit('close')"
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
            title="关闭"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Victory / Result Header -->
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 mx-auto p-1.5 shadow-md flex items-center justify-center text-3xl mb-3 border-2 border-white">
            <Trophy class="w-8 h-8 text-white" />
          </div>

          <h3 class="text-2xl font-black text-gray-900 mb-1">
            终局形势判定 (Chinese Area Scoring)
          </h3>
          <p class="text-xs text-gray-500 font-bold mb-4">
            根据中国围棋数子法规则统计子数与领地
          </p>

          <!-- Result Details -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <!-- Black Score -->
            <div
              class="p-4 rounded-2xl border-2"
              :class="score.winner === 'B' ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-200'"
            >
              <div class="flex items-center justify-center gap-1 text-sm font-black text-gray-800 mb-1">
                <span class="w-3.5 h-3.5 rounded-full bg-black inline-block"></span>
                <span>黑棋 (Black)</span>
              </div>
              <div class="text-2xl font-black" :class="score.winner === 'B' ? 'text-orange-600' : 'text-gray-700'">
                {{ score.blackTotal }} 子
              </div>
              <div class="text-[10px] text-gray-400 font-bold mt-1">
                活子 {{ score.blackStones }} + 空 {{ score.blackTerritory }}
              </div>
            </div>

            <!-- White Score -->
            <div
              class="p-4 rounded-2xl border-2"
              :class="score.winner === 'W' ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-200'"
            >
              <div class="flex items-center justify-center gap-1 text-sm font-black text-gray-800 mb-1">
                <span class="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 inline-block"></span>
                <span>白棋 (White)</span>
              </div>
              <div class="text-2xl font-black" :class="score.winner === 'W' ? 'text-orange-600' : 'text-gray-700'">
                {{ score.whiteTotal }} 子
              </div>
              <div class="text-[10px] text-gray-400 font-bold mt-1">
                活子 {{ score.whiteStones }} + 空 {{ score.whiteTerritory }} (贴{{ score.komi }}目)
              </div>
            </div>
          </div>

          <!-- Winner Banner -->
          <div class="p-3.5 rounded-2xl bg-orange-100 text-orange-950 font-black text-sm mb-6 border border-orange-200">
            🏆 胜负结果：{{ score.winner === userColor ? '🎉 恭喜你获得胜利！' : '很遗憾，再接再厉哦！' }} (领先 {{ score.margin }} 目/子)
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="emit('close')"
              class="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm transition active:scale-95"
            >
              查看盘面
            </button>
            <button
              @click="emit('restart')"
              class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <RotateCcw class="w-4 h-4" />
              <span>再来一局</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

