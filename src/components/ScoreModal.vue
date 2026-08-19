<script setup lang="ts">
import { ref } from 'vue';
import type { ScoreBreakdown, StoneColor } from '../engine/types';
import { Trophy, RotateCcw, X, HelpCircle } from 'lucide-vue-next';

const props = defineProps<{
  score: ScoreBreakdown;
  userColor: StoneColor;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'restart'): void;
}>();

const showExplanation = ref(false);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-hidden bg-black/65 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-6 text-center no-scrollbar modal-overlay"
      @click.self="emit('close')"
    >
      <div
        class="relative w-full max-w-md max-h-[90vh] overflow-y-auto transform rounded-3xl bg-white p-5 sm:p-7 text-center shadow-2xl border-4 border-amber-300 transition-all my-auto animate-pop-in z-[10000] space-y-3.5 no-scrollbar modal-card"
      >
        <!-- Close Button -->
        <button
          type="button"
          @click="emit('close')"
          class="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
          title="关闭"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Victory / Result Header -->
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 mx-auto p-1.5 shadow-md flex items-center justify-center text-3xl text-white border-2 border-white animate-bounce-subtle">
          <Trophy class="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div class="space-y-0.5">
          <h3 class="text-xl sm:text-2xl font-cartoon font-bold text-gray-900">
            终局形势判定 (Scoring)
          </h3>
          <p class="text-[11px] text-gray-500 font-bold">
            根据中国围棋数子法规则统计活子数与围地面积
          </p>
        </div>

        <!-- Result Details -->
        <div class="grid grid-cols-2 gap-2.5 text-left">
          <!-- Black Score -->
          <div
            class="p-3 rounded-2xl border-2"
            :class="score.winner === 'B' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/40 shadow-xs' : 'bg-gray-50 border-gray-200'"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-black text-xs sm:text-sm text-gray-800 flex items-center gap-1">
                <span class="w-3 h-3 rounded-full bg-black inline-block"></span>
                <span>黑棋 (Black)</span>
              </span>
              <span v-if="score.winner === 'B'" class="text-[9px] sm:text-[10px] font-black text-amber-800 bg-amber-200 px-1.5 py-0.2 rounded-full">
                胜方
              </span>
            </div>
            <div class="text-lg sm:text-2xl font-black text-gray-900 leading-none my-1">
              {{ score.blackTotal }} <span class="text-[11px] font-bold text-gray-500">子/目</span>
            </div>
            <div class="text-[10px] text-gray-400 font-bold mt-1">
              活子 {{ score.blackStones }} + 空 {{ score.blackTerritory }}
            </div>
          </div>

          <!-- White Score -->
          <div
            class="p-3 rounded-2xl border-2"
            :class="score.winner === 'W' ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300/40 shadow-xs' : 'bg-gray-50 border-gray-200'"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-black text-xs sm:text-sm text-gray-800 flex items-center gap-1">
                <span class="w-3 h-3 rounded-full bg-white border border-gray-400 inline-block"></span>
                <span>白棋 (White)</span>
              </span>
              <span v-if="score.winner === 'W'" class="text-[9px] sm:text-[10px] font-black text-indigo-800 bg-indigo-200 px-1.5 py-0.2 rounded-full">
                胜方
              </span>
            </div>
            <div class="text-lg sm:text-2xl font-black text-gray-900 leading-none my-1">
              {{ score.whiteTotal }} <span class="text-[11px] font-bold text-gray-500">子/目</span>
            </div>
            <div class="text-[10px] text-gray-400 font-bold mt-1">
              活子 {{ score.whiteStones }} + 空 {{ score.whiteTerritory }} (贴{{ score.komi }}目)
            </div>
          </div>
        </div>

        <!-- Winner Banner -->
        <div class="p-3 rounded-2xl bg-orange-100 text-orange-950 font-black text-xs sm:text-sm border border-orange-200">
          {{
            score.winner === userColor
              ? '🏆 胜负结果：🎉 恭喜你获得胜利！'
              : score.winner === 'TIE'
              ? '🏆 胜负结果：🤝 双方势均力敌·和棋！'
              : '🏆 胜负结果：很遗憾，再接再厉哦！'
          }}
          <span v-if="score.margin < 90">(领先 {{ score.margin }} 目/子)</span>
        </div>

        <!-- 💡 Mini FAQ: 什么是“目”和“胜半子”？ -->
        <div class="bg-amber-50/80 rounded-2xl p-2.5 sm:p-3 border border-amber-200 text-left space-y-1 text-xs">
          <div
            @click="showExplanation = !showExplanation"
            class="font-black text-amber-950 flex items-center justify-between cursor-pointer"
          >
            <div class="flex items-center gap-1">
              <HelpCircle class="w-3.5 h-3.5 text-amber-700" />
              <span>小科普：什么是“目”与“胜半子”？</span>
            </div>
            <button class="text-[10px] text-orange-600 font-bold">
              {{ showExplanation ? '收起 ▲' : '详情 ▼' }}
            </button>
          </div>

          <div v-show="showExplanation" class="text-[10px] sm:text-[11px] text-gray-700 font-medium leading-relaxed pt-1 space-y-1 border-t border-amber-200/60 mt-1">
            <p>• <strong class="text-gray-900">“目”（目数）</strong>：指围住的空交叉点数量，完整包围 1 个空格就是 1 目地盘。</p>
            <p>• <strong class="text-gray-900">“领先 X 目”</strong>：指计算完活子、围空与贴目后，赢的一方比输的一方多占领了 X 个空交叉点。</p>
            <p>• <strong class="text-gray-900">“胜半子/半目胜”</strong>：围棋最小的极限差距（0.5 目），代表仅以半个微小空位的微弱优势奇迹险胜！</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-1">
          <button
            @click="emit('close')"
            class="flex-1 py-2.5 sm:py-3 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
          >
            查看盘面
          </button>
          <button
            @click="emit('restart')"
            class="flex-1 py-2.5 sm:py-3 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>再来一局</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

