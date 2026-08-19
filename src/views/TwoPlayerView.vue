<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { GoGame } from '../engine/GoGame';
import type { Point, BoardSize, StoneColor, ScoreBreakdown } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import {
  playStoneSound,
  playCaptureSound,
  playErrorSound,
  playButtonSound,
  playVictorySound,
  triggerConfetti
} from '../lib/audio';
import { showConfirm } from '../utils/alert';
import GoBoard from '../components/board/GoBoard.vue';
import {
  Users,
  RotateCcw,
  Eye,
  AlertTriangle,
  Flag,
  Trophy,
  X,
  Wind,
  Layers,
  Scale,
  Sparkles
} from 'lucide-vue-next';

const userStore = useUserStore();

const boardSize = ref<BoardSize>(9);
const komi = ref<number>(3.5); // 9路默认贴3.5目或5.5目
const game = ref<GoGame>(new GoGame(9, 3.5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);

// Visual assistants
const showLiberties = ref(true);
const showAtari = ref(true);
const showBreathingTubes = ref(true);
const showTerritory = ref(false);

const blackName = ref('黑方 (玩家1)');
const whiteName = ref('白方 (玩家2)');

// Clocks
const blackSeconds = ref(0);
const whiteSeconds = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

// Game Over & Settlement
const isGameOver = ref(false);
const showScoreModal = ref(false);
const scoreResult = ref<ScoreBreakdown | null>(null);
const winReason = ref<string>(''); // 'scoring' | 'resign'
const resignedPlayerColor = ref<StoneColor | null>(null);

const blackCaptures = computed(() => game.value.capturedByBlack);
const whiteCaptures = computed(() => game.value.capturedByWhite);
const currentTurn = computed(() => game.value.turn);

const initGame = () => {
  const k = boardSize.value <= 7 ? 2.5 : boardSize.value === 9 ? 3.5 : 5.5;
  komi.value = k;
  game.value = new GoGame(boardSize.value, k);
  lastMove.value = null;
  highlightPoints.value = [];
  blackSeconds.value = 0;
  whiteSeconds.value = 0;
  isGameOver.value = false;
  showScoreModal.value = false;
  scoreResult.value = null;
  showTerritory.value = false;
  winReason.value = '';
  resignedPlayerColor.value = null;
  playButtonSound();
};

onMounted(() => {
  initGame();
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (!isGameOver.value) {
      if (currentTurn.value === 'B') {
        blackSeconds.value++;
      } else {
        whiteSeconds.value++;
      }
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const handleMove = (point: Point) => {
  if (isGameOver.value) return;

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

  // Check if consecutive passes triggered
  if (game.value.consecutivePasses >= 2) {
    triggerScoringSettlement('双双停一手（Pass），棋局定型进入自动点目！');
  }
};

const handlePass = () => {
  if (isGameOver.value) return;

  game.value.pass();
  playButtonSound();

  if (game.value.consecutivePasses >= 2) {
    triggerScoringSettlement('双方连续停一手，棋局正式终局！裁判自动数子结算！');
  }
};

const triggerScoringSettlement = (reasonDesc: string) => {
  isGameOver.value = true;
  showTerritory.value = true;
  const score = game.value.calculateScore();
  scoreResult.value = score;
  winReason.value = reasonDesc;
  showScoreModal.value = true;

  playVictorySound();
  triggerConfetti();

  // Record user stats if active profile exists
  userStore.recordGameEnd(score.winner === 'B', score.winner === 'B' ? blackCaptures.value : whiteCaptures.value, game.value.history.length);
  userStore.addCoins(30);
  userStore.addExp(60);
};

const handleManualCountScore = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  triggerScoringSettlement('主动申请裁判点目数子判定胜负！');
};

const handleResign = (color: StoneColor) => {
  const pName = color === 'B' ? blackName.value : whiteName.value;
  showConfirm({
    title: '确认认输？',
    message: `${pName} 确定要认输吗？对方将直接获得胜利！`,
    type: 'warning',
    confirmText: '确定认输',
    cancelText: '继续对局'
  }).then(confirmed => {
    if (confirmed) {
      isGameOver.value = true;
      resignedPlayerColor.value = color;
      winReason.value = `${pName} 宣布认输，胜负已定！`;
      const winnerColor = color === 'B' ? 'W' : 'B';
      scoreResult.value = {
        blackStones: game.value.capturedByWhite,
        whiteStones: game.value.capturedByBlack,
        blackTerritory: 0,
        whiteTerritory: 0,
        dame: 0,
        komi: komi.value,
        blackTotal: 0,
        whiteTotal: 0,
        winner: winnerColor,
        margin: 99,
        territoryMap: []
      };
      showScoreModal.value = true;
      playVictorySound();
      triggerConfetti();
    }
  });
};

const handleUndo = () => {
  if (isGameOver.value) return;
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
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-3 sm:py-8 px-2.5 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-4 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div class="space-y-1 text-center md:text-left">
          <div class="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-black">
            <Users class="w-3.5 h-3.5 text-purple-700" />
            <span>亲子面对面对弈 (Pass & Play · 自动判输赢)</span>
          </div>
          <h1 class="text-xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            双人同屏对战棋盘
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            支持 5x5 到 13x13 棋盘、双人计时钟、连续停一手自动点目判定输赢与精美结算弹窗！
          </p>
        </div>

        <!-- Size Switchers -->
        <div class="flex items-center bg-amber-50 p-1 sm:p-1.5 rounded-2xl border border-orange-200 shadow-inner gap-1">
          <button
            v-for="s in [5, 7, 9, 13]"
            :key="s"
            @click="changeSize(s as BoardSize)"
            class="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
            :class="boardSize === s ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
          >
            {{ s }}x{{ s }} 盘
          </button>
        </div>
      </div>

      <!-- Main Play Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        <!-- Left: Match Control & Players Info (4 cols) -->
        <div class="lg:col-span-4 space-y-3.5 sm:space-y-4">
          
          <!-- White Player Card (Player 2) -->
          <div
            class="rounded-3xl p-4 sm:p-5 border-2 transition-all"
            :class="
              isGameOver && scoreResult?.winner === 'W'
                ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300'
                : currentTurn === 'W' && !isGameOver
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-400 shadow-md ring-2 ring-indigo-300'
                : 'bg-white border-gray-100'
            "
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-white border-2 border-gray-400 inline-block shadow-inner flex-shrink-0"></span>
                <input
                  v-model="whiteName"
                  class="font-black text-xs sm:text-sm text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-indigo-500 focus:outline-none max-w-[130px]"
                  title="点击修改白方昵称"
                />
              </div>
              <span
                v-if="isGameOver && scoreResult?.winner === 'W'"
                class="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-bounce"
              >
                🏆 获胜者
              </span>
              <span
                v-else-if="currentTurn === 'W' && !isGameOver"
                class="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full animate-pulse"
              >
                当前走棋
              </span>
            </div>

            <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-100">
              <span class="text-gray-500">已提黑子：{{ whiteCaptures }}</span>
              <span class="font-mono text-indigo-900 bg-white px-2.5 py-1 rounded-xl border border-indigo-100 shadow-2xs">
                ⏱️ {{ formatTime(whiteSeconds) }}
              </span>
            </div>

            <div v-if="!isGameOver" class="mt-2.5 pt-2 border-t border-gray-100 flex justify-end">
              <button
                @click="handleResign('W')"
                class="text-[11px] font-black text-gray-400 hover:text-rose-600 transition cursor-pointer"
              >
                白方认输
              </button>
            </div>
          </div>

          <!-- Black Player Card (Player 1) -->
          <div
            class="rounded-3xl p-4 sm:p-5 border-2 transition-all"
            :class="
              isGameOver && scoreResult?.winner === 'B'
                ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300'
                : currentTurn === 'B' && !isGameOver
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-400 shadow-md ring-2 ring-orange-300'
                : 'bg-white border-gray-100'
            "
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-gray-900 inline-block shadow-sm flex-shrink-0"></span>
                <input
                  v-model="blackName"
                  class="font-black text-xs sm:text-sm text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-orange-500 focus:outline-none max-w-[130px]"
                  title="点击修改黑方昵称"
                />
              </div>
              <span
                v-if="isGameOver && scoreResult?.winner === 'B'"
                class="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-bounce"
              >
                🏆 获胜者
              </span>
              <span
                v-else-if="currentTurn === 'B' && !isGameOver"
                class="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse"
              >
                当前走棋
              </span>
            </div>

            <div class="flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-100">
              <span class="text-gray-500">已提白子：{{ blackCaptures }}</span>
              <span class="font-mono text-orange-950 bg-white px-2.5 py-1 rounded-xl border border-orange-100 shadow-2xs">
                ⏱️ {{ formatTime(blackSeconds) }}
              </span>
            </div>

            <div v-if="!isGameOver" class="mt-2.5 pt-2 border-t border-gray-100 flex justify-end">
              <button
                @click="handleResign('B')"
                class="text-[11px] font-black text-gray-400 hover:text-rose-600 transition cursor-pointer"
              >
                黑方认输
              </button>
            </div>
          </div>

          <!-- Controls Box -->
          <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm space-y-3">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between">
              <span>对局操作与辅助</span>
              <span class="text-orange-600 font-bold">贴 {{ komi }} 目</span>
            </div>

            <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                @click="showBreathingTubes = !showBreathingTubes"
                class="py-2 px-1.5 rounded-2xl border text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                :class="showBreathingTubes ? 'bg-emerald-100 border-emerald-300 text-emerald-950' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <Wind class="w-3.5 h-3.5 text-emerald-600" />
                <span>呼吸管</span>
              </button>

              <button
                @click="showLiberties = !showLiberties"
                class="py-2 px-1.5 rounded-2xl border text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-950' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>数气</span>
              </button>

              <button
                @click="showAtari = !showAtari"
                class="py-2 px-1.5 rounded-2xl border text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-950' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>叫吃预警</span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                @click="handleUndo"
                :disabled="isGameOver"
                class="py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>悔棋一手</span>
              </button>

              <button
                @click="handlePass"
                :disabled="isGameOver"
                class="py-2.5 px-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Flag class="w-3.5 h-3.5" />
                <span>停一手 Pass</span>
              </button>
            </div>

            <!-- Automated Scoring / Referee Decision Button -->
            <button
              @click="handleManualCountScore"
              class="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scale class="w-4 h-4" />
              <span>裁判点目 · 判定输赢</span>
            </button>

            <button
              @click="initGame"
              class="w-full py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>清盘重新开局</span>
            </button>
          </div>

        </div>

        <!-- Right: Interactive GoBoard (8 cols) -->
        <div class="lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
          <GoBoard
            :game="game"
            :manualMove="true"
            :readonly="isGameOver"
            :showLiberties="showLiberties"
            :showAtari="showAtari"
            :showBreathingTubes="showBreathingTubes"
            :showTerritory="showTerritory"
            :theme="userStore.theme"
            :highlightPoints="highlightPoints"
            :lastMove="lastMove"
            :sizePx="520"
            @move="handleMove"
          />

          <!-- Territory Shading Toggle & Game State Hint -->
          <div class="w-full flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-bold text-gray-500">
            <div class="flex items-center gap-2">
              <button
                @click="showTerritory = !showTerritory"
                class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-black cursor-pointer active:scale-95"
                :class="showTerritory ? 'bg-indigo-100 border-indigo-300 text-indigo-900' : 'bg-gray-50 border-gray-200 text-gray-600'"
              >
                <Layers class="w-3.5 h-3.5" />
                <span>领地热力图</span>
              </button>
            </div>

            <span class="text-[11px] text-gray-400">
              {{ isGameOver ? '对局已终局判定' : '提示：双方连续停一手（Pass）自动判输赢' }}
            </span>
          </div>
        </div>

      </div>

    </div>

    <!-- 🏆 Two Player Settlement Score Modal (双人同屏专属对弈结算弹窗) -->
    <Teleport to="body">
      <div
        v-if="showScoreModal && scoreResult"
        class="fixed inset-0 z-[10000] overflow-y-auto bg-black/65 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-4"
        @click.self="showScoreModal = false"
      >
        <div
          class="relative w-full max-w-md max-h-[96vh] overflow-y-auto transform rounded-3xl bg-white p-5 sm:p-7 text-center shadow-2xl border-4 border-amber-300 transition-all animate-pop-in z-[10001] space-y-4"
        >
          <!-- Close Button -->
          <button
            type="button"
            @click="showScoreModal = false"
            class="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
            title="关闭"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Top Trophy Icon -->
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 mx-auto p-1.5 shadow-lg flex items-center justify-center text-3xl text-white border-2 border-white animate-bounce-subtle">
            <Trophy class="w-8 h-8" />
          </div>

          <!-- Victory Announcement Title -->
          <div class="space-y-1">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
              <Sparkles class="w-3.5 h-3.5" />
              <span>对局终局 · 裁判数子结算</span>
            </div>

            <h2 class="text-xl sm:text-2xl font-cartoon font-bold text-gray-900">
              {{
                resignedPlayerColor
                  ? (resignedPlayerColor === 'B' ? ('🎉 ' + whiteName + ' 获胜！') : ('🎉 ' + blackName + ' 获胜！'))
                  : scoreResult.winner === 'B'
                  ? ('🎉 ' + blackName + ' 获胜！')
                  : scoreResult.winner === 'W'
                  ? ('🎉 ' + whiteName + ' 获胜！')
                  : '🤝 双方势均力敌·和棋！'
              }}
            </h2>
            <p class="text-xs text-orange-600 font-bold">
              {{ winReason }}
            </p>
          </div>

          <!-- Score Details Comparison Card -->
          <div class="grid grid-cols-2 gap-3 text-left">
            <!-- Black Card -->
            <div
              class="p-3.5 rounded-2xl border-2 transition"
              :class="scoreResult.winner === 'B' ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/40 shadow-xs' : 'bg-gray-50 border-gray-200'"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                  <span class="w-3 h-3 rounded-full bg-gray-900 inline-block"></span>
                  <span class="truncate">{{ blackName }}</span>
                </span>
                <span v-if="scoreResult.winner === 'B'" class="text-[10px] font-black text-amber-800 bg-amber-200 px-1.5 py-0.2 rounded-full">
                  胜方
                </span>
              </div>
              <div class="text-xl sm:text-2xl font-black text-gray-900 leading-none my-1">
                {{ scoreResult.blackTotal }} <span class="text-xs font-bold text-gray-500">子/目</span>
              </div>
              <div class="text-[10px] text-gray-500 font-bold space-y-0.5">
                <div>活子: {{ scoreResult.blackStones }} + 围空: {{ scoreResult.blackTerritory }}</div>
                <div>提白子: {{ blackCaptures }} 颗</div>
                <div>耗时: {{ formatTime(blackSeconds) }}</div>
              </div>
            </div>

            <!-- White Card -->
            <div
              class="p-3.5 rounded-2xl border-2 transition"
              :class="scoreResult.winner === 'W' ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-300/40 shadow-xs' : 'bg-gray-50 border-gray-200'"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                  <span class="w-3 h-3 rounded-full bg-white border border-gray-400 inline-block"></span>
                  <span class="truncate">{{ whiteName }}</span>
                </span>
                <span v-if="scoreResult.winner === 'W'" class="text-[10px] font-black text-indigo-800 bg-indigo-200 px-1.5 py-0.2 rounded-full">
                  胜方
                </span>
              </div>
              <div class="text-xl sm:text-2xl font-black text-gray-900 leading-none my-1">
                {{ scoreResult.whiteTotal }} <span class="text-xs font-bold text-gray-500">子/目</span>
              </div>
              <div class="text-[10px] text-gray-500 font-bold space-y-0.5">
                <div>活子: {{ scoreResult.whiteStones }} + 围空: {{ scoreResult.whiteTerritory }}</div>
                <div>贴目: {{ scoreResult.komi }} 目 · 提子: {{ whiteCaptures }}</div>
                <div>耗时: {{ formatTime(whiteSeconds) }}</div>
              </div>
            </div>
          </div>

          <!-- Margin description banner -->
          <div v-if="!resignedPlayerColor && scoreResult.margin < 90" class="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-950">
            📊 根据中国围棋数子法计算，胜方净领先 <span class="text-sm font-black text-orange-600">{{ scoreResult.margin }}</span> 目/子！
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2.5 pt-2">
            <button
              @click="showScoreModal = false"
              class="flex-1 py-3 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
            >
              查看棋盘复盘
            </button>

            <button
              @click="initGame"
              class="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw class="w-4 h-4" />
              <span>再战一局 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

