<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { GoGame } from '../engine/GoGame';
import type { Point, BoardSize } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import {
  playStoneSound,
  playCaptureSound,
  playErrorSound,
  playButtonSound
} from '../lib/audio';
import GoBoard from '../components/board/GoBoard.vue';
import {
  Users,
  RotateCcw,
  Eye,
  AlertTriangle,
  Flag
} from 'lucide-vue-next';

const userStore = useUserStore();

const boardSize = ref<BoardSize>(9);
const game = ref<GoGame>(new GoGame(9));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);

const showLiberties = ref(true);
const showAtari = ref(true);

const blackName = ref('黑方 (先手)');
const whiteName = ref('白方 (后手)');

const blackSeconds = ref(0);
const whiteSeconds = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const blackCaptures = computed(() => game.value.capturedByBlack);
const whiteCaptures = computed(() => game.value.capturedByWhite);
const currentTurn = computed(() => game.value.turn);

const initGame = () => {
  game.value = new GoGame(boardSize.value);
  lastMove.value = null;
  highlightPoints.value = [];
  blackSeconds.value = 0;
  whiteSeconds.value = 0;
  playButtonSound();
};

onMounted(() => {
  initGame();
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (currentTurn.value === 'B') {
      blackSeconds.value++;
    } else {
      whiteSeconds.value++;
    }
  }, 1000);
});

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const handleMove = (point: Point) => {
  const { r, c } = point;
  const res = game.value.playMove(r, c);

  if (!res.success) {
    playErrorSound();
    return;
  }

  playStoneSound();
  if (res.capturedStones.length > 0) {
    playCaptureSound();
  }
  lastMove.value = point;
};

const handlePass = () => {
  game.value.pass();
  playButtonSound();
};

const handleUndo = () => {
  if (game.value.history.length > 0) {
    game.value.undo();
    lastMove.value = game.value.history.length > 0 ? game.value.history[game.value.history.length - 1].point : null;
    playButtonSound();
  }
};

const changeSize = (size: BoardSize) => {
  boardSize.value = size;
  initGame();
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center md:text-left">
          <div class="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-black">
            <Users class="w-3.5 h-3.5 text-purple-700" />
            <span>亲子面对面对弈 (Pass & Play)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            双人同屏对战棋盘
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            适合平板或电脑平放，支持计时钟、气数辅助与一键悔棋，家长与小朋友随时来一盘！
          </p>
        </div>

        <!-- Size Switchers -->
        <div class="flex items-center bg-amber-50 p-1.5 rounded-2xl border border-orange-200 shadow-inner gap-1">
          <button
            v-for="s in [5, 7, 9, 13]"
            :key="s"
            @click="changeSize(s as BoardSize)"
            class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
            :class="boardSize === s ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
          >
            {{ s }}x{{ s }} 盘
          </button>
        </div>
      </div>

      <!-- Main Play Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Match Control & Players Info (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          
          <!-- White Player Card -->
          <div
            class="rounded-3xl p-4 sm:p-5 border-2 transition-all"
            :class="
              currentTurn === 'W'
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-400 shadow-md ring-2 ring-indigo-300'
                : 'bg-white border-gray-100'
            "
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-white border-2 border-gray-400 inline-block shadow-inner"></span>
                <span class="font-black text-sm text-gray-900">{{ whiteName }} (玩家2 手动下)</span>
              </div>
              <span
                v-if="currentTurn === 'W'"
                class="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full animate-pulse"
              >
                当前走棋
              </span>
            </div>

            <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-100">
              <span class="text-gray-500">已提黑子：{{ whiteCaptures }}</span>
              <span class="font-mono text-indigo-900 bg-white px-2.5 py-1 rounded-xl border border-indigo-100">
                ⏱️ {{ formatTime(whiteSeconds) }}
              </span>
            </div>
          </div>

          <!-- Black Player Card -->
          <div
            class="rounded-3xl p-4 sm:p-5 border-2 transition-all"
            :class="
              currentTurn === 'B'
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-400 shadow-md ring-2 ring-orange-300'
                : 'bg-white border-gray-100'
            "
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-gray-900 inline-block shadow-sm"></span>
                <span class="font-black text-sm text-gray-900">{{ blackName }} (玩家1 手动下)</span>
              </div>
              <span
                v-if="currentTurn === 'B'"
                class="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse"
              >
                当前走棋
              </span>
            </div>

            <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-100">
              <span class="text-gray-500">已提白子：{{ blackCaptures }}</span>
              <span class="font-mono text-orange-950 bg-white px-2.5 py-1 rounded-xl border border-orange-100">
                ⏱️ {{ formatTime(blackSeconds) }}
              </span>
            </div>
          </div>

          <!-- Controls Box -->
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-3">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide">
              对局辅助与操作
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                @click="showLiberties = !showLiberties"
                class="py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-950' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>显示气数</span>
              </button>

              <button
                @click="showAtari = !showAtari"
                class="py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-950' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>叫吃预警</span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                @click="handleUndo"
                class="py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>悔棋一手</span>
              </button>

              <button
                @click="handlePass"
                class="py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Flag class="w-3.5 h-3.5" />
                <span>停一手 Pass</span>
              </button>
            </div>

            <button
              @click="initGame"
              class="w-full py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw class="w-4 h-4" />
              <span>清盘重下</span>
            </button>
          </div>

        </div>

        <!-- Right: Interactive GoBoard (8 cols) -->
        <div class="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
          <GoBoard
            :game="game"
            :manualMove="true"
            :showLiberties="showLiberties"
            :showAtari="showAtari"
            :theme="userStore.theme"
            :highlightPoints="highlightPoints"
            :lastMove="lastMove"
            :sizePx="520"
            @move="handleMove"
          />
        </div>

      </div>

    </div>
  </div>
</template>

