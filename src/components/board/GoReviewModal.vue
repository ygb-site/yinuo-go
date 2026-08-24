<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { GoGame } from '../../engine/GoGame';
import type { BoardSize, MoveRecord, Point } from '../../engine/types';
import {
  generateGameReview,
  type GameReviewReport,
  type StepReviewInfo
} from '../../services/goReviewService';
import GoBoard from './GoBoard.vue';
import { playStoneSound, playButtonSound } from '../../lib/audio';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flame,
  AlertTriangle,
  Award
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  history: MoveRecord[];
  boardSize: BoardSize;
  komi: number;
  blackName?: string;
  whiteName?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentStepIndex = ref(0);
const isAutoPlaying = ref(false);
let playInterval: ReturnType<typeof setInterval> | null = null;

const report = computed<GameReviewReport>(() => {
  return generateGameReview(props.history, props.boardSize, props.komi);
});

// Reconstructed board at currentStepIndex
const replayGame = computed<GoGame>(() => {
  const g = new GoGame(props.boardSize, props.komi);
  const targetCount = currentStepIndex.value;
  for (let i = 0; i < targetCount && i < props.history.length; i++) {
    const rec = props.history[i];
    if (rec.point === null) {
      g.pass(rec.color);
    } else {
      g.playMove(rec.point.r, rec.point.c, rec.color);
    }
  }
  return g;
});

const currentStepInfo = computed<StepReviewInfo | null>(() => {
  if (currentStepIndex.value === 0) return null;
  return report.value.steps[currentStepIndex.value - 1] || null;
});

const currentLastMove = computed<Point | null>(() => {
  if (currentStepIndex.value === 0) return null;
  const rec = props.history[currentStepIndex.value - 1];
  return rec ? rec.point : null;
});

const goToStep = (step: number) => {
  const max = props.history.length;
  currentStepIndex.value = Math.max(0, Math.min(max, step));
  playStoneSound();
};

const nextStep = () => {
  if (currentStepIndex.value < props.history.length) {
    goToStep(currentStepIndex.value + 1);
  } else {
    stopAutoPlay();
  }
};

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    goToStep(currentStepIndex.value - 1);
  }
};

const toggleAutoPlay = () => {
  playButtonSound();
  if (isAutoPlaying.value) {
    stopAutoPlay();
  } else {
    if (currentStepIndex.value >= props.history.length) {
      currentStepIndex.value = 0;
    }
    isAutoPlaying.value = true;
    playInterval = setInterval(() => {
      if (currentStepIndex.value < props.history.length) {
        currentStepIndex.value++;
        playStoneSound();
      } else {
        stopAutoPlay();
      }
    }, 1200);
  }
};

const stopAutoPlay = () => {
  isAutoPlaying.value = false;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      currentStepIndex.value = props.history.length;
    } else {
      stopAutoPlay();
    }
  }
);

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-hidden bg-slate-900/75 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-2 sm:p-4 text-center"
      @click.self="emit('close')"
    >
      <div
        class="relative w-full max-w-5xl max-h-[95vh] overflow-hidden transform rounded-3xl bg-[#FDFBF7] text-left shadow-2xl border-4 border-amber-300 transition-all flex flex-col animate-pop-in"
      >
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-3.5 sm:p-4 px-5 flex items-center justify-between shadow-sm shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg shrink-0">
              🔍
            </div>
            <div>
              <h3 class="font-cartoon font-bold text-base sm:text-xl tracking-wide flex items-center gap-2">
                <span>围棋 AI 全局复盘与胜负转折剖析</span>
                <span class="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full hidden sm:inline">
                  {{ boardSize }}x{{ boardSize }} 棋盘 · 共 {{ history.length }} 手
                </span>
              </h3>
              <p class="text-[10px] sm:text-xs text-amber-100 font-medium truncate">
                {{ report.summaryHeadline }} · 直击落败发端手与胜负分水岭
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer shrink-0"
            title="关闭复盘"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Grid: Left Board + Right Step Analysis) -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-0">
          
          <!-- LEFT: Replay Board & Playback Controls (7 cols on desktop) -->
          <div class="lg:col-span-7 flex flex-col justify-between space-y-3">
            
            <!-- Board Container -->
            <div class="bg-white rounded-3xl p-3 sm:p-4 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center relative">
              <GoBoard
                :game="replayGame"
                :readonly="true"
                :showCoordinates="true"
                :showLiberties="true"
                :showAtari="true"
                :lastMove="currentLastMove"
                :sizePx="460"
              />
            </div>

            <!-- Playback Scrubber & Control Bar -->
            <div class="bg-white rounded-2xl p-3 border-2 border-orange-100 shadow-xs space-y-2">
              
              <!-- Progress Slider -->
              <div class="flex items-center gap-3">
                <span class="text-xs font-black text-slate-700 min-w-[50px]">
                  第 {{ currentStepIndex }} / {{ history.length }} 手
                </span>
                <input
                  type="range"
                  min="0"
                  :max="history.length"
                  v-model.number="currentStepIndex"
                  @input="playStoneSound"
                  class="flex-1 accent-orange-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              <!-- Buttons Row (First / Prev / AutoPlay / Next / Last) -->
              <div class="flex items-center justify-between gap-1 sm:gap-2">
                <button
                  @click="goToStep(0)"
                  :disabled="currentStepIndex === 0"
                  class="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 disabled:opacity-30 cursor-pointer"
                  title="回到初始局面"
                >
                  <ChevronsLeft class="w-4 h-4" />
                  <span class="hidden sm:inline">开局</span>
                </button>

                <button
                  @click="prevStep"
                  :disabled="currentStepIndex === 0"
                  class="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 font-black text-xs flex items-center gap-1 active:scale-95 disabled:opacity-30 cursor-pointer"
                  title="上一手"
                >
                  <ChevronLeft class="w-4 h-4" />
                  <span>上一手</span>
                </button>

                <button
                  @click="toggleAutoPlay"
                  class="py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                >
                  <component :is="isAutoPlaying ? Pause : Play" class="w-4 h-4" />
                  <span>{{ isAutoPlaying ? '暂停' : '自动演示' }}</span>
                </button>

                <button
                  @click="nextStep"
                  :disabled="currentStepIndex >= history.length"
                  class="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 font-black text-xs flex items-center gap-1 active:scale-95 disabled:opacity-30 cursor-pointer"
                  title="下一手"
                >
                  <span>下一手</span>
                  <ChevronRight class="w-4 h-4" />
                </button>

                <button
                  @click="goToStep(history.length)"
                  :disabled="currentStepIndex >= history.length"
                  class="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 disabled:opacity-30 cursor-pointer"
                  title="跳到终局"
                >
                  <span class="hidden sm:inline">终局</span>
                  <ChevronsRight class="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          <!-- RIGHT: Step Detail, Key Watershed Turning Points (5 cols on desktop) -->
          <div class="lg:col-span-5 flex flex-col justify-between space-y-3">
            
            <!-- 🌟 Key Watershed Quick Action Banner (胜负核心分水岭直击) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <!-- Decisive Win Point -->
              <button
                v-if="report.decisiveWinMove"
                @click="goToStep(report.decisiveWinMove.stepIndex)"
                class="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 text-left cursor-pointer hover:border-emerald-500 hover:shadow-xs transition active:scale-95 flex items-center justify-between"
              >
                <div class="min-w-0">
                  <div class="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                    <Award class="w-3 h-3 text-emerald-600" />
                    <span>🌟 奠定胜局点</span>
                  </div>
                  <div class="text-xs font-black text-slate-900 mt-0.5 truncate">
                    第 {{ report.decisiveWinMove.stepIndex }} 手 · {{ report.decisiveWinMove.coordLabel }}
                  </div>
                </div>
                <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-950 shrink-0">
                  确立胜势
                </span>
              </button>

              <!-- Fatal Defeat Point -->
              <button
                v-if="report.fatalDefeatMove"
                @click="goToStep(report.fatalDefeatMove.stepIndex)"
                class="p-2.5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-300 text-left cursor-pointer hover:border-rose-500 hover:shadow-xs transition active:scale-95 flex items-center justify-between"
              >
                <div class="min-w-0">
                  <div class="text-[10px] font-black text-rose-800 flex items-center gap-1">
                    <AlertTriangle class="w-3 h-3 text-rose-600" />
                    <span>💥 落败发端点</span>
                  </div>
                  <div class="text-xs font-black text-slate-900 mt-0.5 truncate">
                    第 {{ report.fatalDefeatMove.stepIndex }} 手 · {{ report.fatalDefeatMove.coordLabel }}
                  </div>
                </div>
                <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-950 shrink-0">
                  由此落败
                </span>
              </button>
            </div>

            <!-- Active Step Info Card -->
            <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm space-y-3">
              
              <div v-if="currentStepInfo" class="space-y-3">
                <!-- Step Header: Player & Quality Badge -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-full inline-block shadow-xs border"
                      :class="currentStepInfo.color === 'B' ? 'bg-slate-900 border-black' : 'bg-white border-gray-400'"
                    ></span>
                    <span class="font-black text-slate-900 text-sm sm:text-base">
                      第 {{ currentStepInfo.stepIndex }} 手 · {{ currentStepInfo.color === 'B' ? (blackName || '黑方') : (whiteName || '白方') }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span
                      v-if="currentStepInfo.isFatalDefeatPoint"
                      class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse"
                    >
                      💥 败着始发
                    </span>
                    <span
                      v-else-if="currentStepInfo.isDecisiveWinPoint"
                      class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs"
                    >
                      🏆 胜势确立
                    </span>

                    <span
                      class="px-2.5 py-0.5 rounded-full text-xs font-black"
                      :class="[
                        currentStepInfo.quality === 'god_move' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                        currentStepInfo.quality === 'great_move' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        currentStepInfo.quality === 'blunder' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                        currentStepInfo.quality === 'slow_move' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-slate-100 text-slate-700'
                      ]"
                    >
                      {{ currentStepInfo.qualityBadge }}
                    </span>
                  </div>
                </div>

                <!-- Coordinate & Win Rate Swing -->
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                  <div>
                    <span class="text-slate-400">落子坐标：</span>
                    <span class="font-black text-slate-900 font-mono text-sm">{{ currentStepInfo.coordLabel }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400">胜率波动：</span>
                    <span
                      :class="[
                        'font-black font-mono',
                        currentStepInfo.winRateDelta > 0 ? 'text-emerald-600' : currentStepInfo.winRateDelta < 0 ? 'text-rose-600' : 'text-slate-600'
                      ]"
                    >
                      {{ currentStepInfo.winRateDelta > 0 ? '+' : '' }}{{ currentStepInfo.winRateDelta }}%
                    </span>
                  </div>
                </div>

                <!-- Win Rate Meter at this Step -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[11px] font-black text-slate-600">
                    <span>⚪ 白 {{ currentStepInfo.whiteWinRate }}%</span>
                    <span>⚫ 黑 {{ currentStepInfo.blackWinRate }}%</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 flex">
                    <div class="h-full bg-indigo-500 rounded-l-full transition-all duration-300" :style="{ width: currentStepInfo.whiteWinRate + '%' }"></div>
                    <div class="h-full bg-amber-500 rounded-r-full transition-all duration-300" :style="{ width: currentStepInfo.blackWinRate + '%' }"></div>
                  </div>
                </div>

                <!-- Tactical Commentary -->
                <div class="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs font-bold text-amber-950 leading-relaxed">
                  💡 <span class="font-black">名师复盘点评：</span>{{ currentStepInfo.comment }}
                </div>
              </div>

              <!-- Empty / Step 0 State -->
              <div v-else class="text-center py-6 text-slate-400 text-xs font-bold space-y-1">
                <div class="text-3xl">♟️</div>
                <p>当前处于开局初始局面</p>
                <p class="text-[11px] text-slate-400">请点击上方“下一手”或转折点开启逐步复盘！</p>
              </div>
            </div>

            <!-- Major Turning Points List (关键胜负转折点全览) -->
            <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm space-y-2 flex-1 overflow-hidden flex flex-col">
              <div class="flex items-center justify-between text-xs font-black text-slate-900 pb-1 border-b border-gray-100">
                <span class="flex items-center gap-1.5">
                  <Flame class="w-4 h-4 text-orange-500" />
                  <span>全局关键胜负手清单</span>
                </span>
                <span class="text-[10px] text-slate-400 font-bold">
                  {{ report.keyTurningSteps.length }} 个节点
                </span>
              </div>

              <div class="space-y-1.5 overflow-y-auto max-h-[140px] pr-1">
                <button
                  v-for="ts in report.keyTurningSteps"
                  :key="'ts-' + ts.stepIndex"
                  @click="goToStep(ts.stepIndex)"
                  :class="[
                    'w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition active:scale-98 cursor-pointer border',
                    currentStepIndex === ts.stepIndex
                      ? 'bg-amber-100/90 border-amber-400 text-amber-950 font-black shadow-xs'
                      : 'bg-slate-50 hover:bg-amber-50/50 border-slate-200 text-slate-700'
                  ]"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="w-3 h-3 rounded-full inline-block shrink-0"
                      :class="ts.color === 'B' ? 'bg-black' : 'bg-white border border-gray-400'"
                    ></span>
                    <span class="font-black">第 {{ ts.stepIndex }} 手</span>
                    <span class="font-mono text-slate-500">{{ ts.coordLabel }}</span>
                    <span v-if="ts.isFatalDefeatPoint" class="text-[9px] font-black text-rose-600 bg-rose-100 px-1 rounded">
                      落败始点
                    </span>
                    <span v-else-if="ts.isDecisiveWinPoint" class="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1 rounded">
                      奠定胜局
                    </span>
                  </div>

                  <span
                    class="px-2 py-0.2 rounded-full text-[10px] font-black shrink-0"
                    :class="[
                      ts.quality === 'god_move' ? 'bg-purple-200 text-purple-900' :
                      ts.quality === 'great_move' ? 'bg-emerald-200 text-emerald-900' :
                      ts.quality === 'blunder' ? 'bg-rose-200 text-rose-900' :
                      'bg-amber-200 text-amber-900'
                    ]"
                  >
                    {{ ts.qualityBadge }}
                  </span>
                </button>
              </div>

              <p class="text-[10px] text-slate-400 font-medium pt-1 truncate">
                {{ report.summaryCommentary }}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  </Teleport>
</template>
