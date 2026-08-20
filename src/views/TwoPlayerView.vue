<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
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
import { showConfirm, showAlert } from '../utils/alert';
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
  Sparkles,
  ArrowLeft,
  Maximize2,
  Minimize2
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const isZenMode = ref(false);

const goBack = async () => {
  if (!isGameOver.value && game.value.history.length > 0) {
    const ok = await showConfirm({
      title: '离开对局提示',
      message: '当前面对面对弈还在进行中，确定要返回吗？棋局已为你自动保存，随时可以回来继续！',
      type: 'warning',
      confirmText: '确定离开',
      cancelText: '继续对局'
    });
    if (!ok) return;
  }
  playButtonSound();
  router.push('/battle');
};

const STORAGE_KEY = 'yinuo_active_twoplayer_match';

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
const autoPassNotice = ref<string>('');

const blackCaptures = computed(() => game.value.capturedByBlack);
const whiteCaptures = computed(() => game.value.capturedByWhite);
const currentTurn = computed(() => game.value.turn);

// Save match state to survive accidental refreshes
const saveMatchState = () => {
  if (typeof window === 'undefined') return;
  if (isGameOver.value || game.value.history.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const payload = {
    boardSize: boardSize.value,
    komi: komi.value,
    history: game.value.history,
    blackSeconds: blackSeconds.value,
    whiteSeconds: whiteSeconds.value,
    blackName: blackName.value,
    whiteName: whiteName.value,
    lastMove: lastMove.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

// Restore ongoing match on page reload
const restoreMatchState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.history || data.history.length === 0) return false;

    boardSize.value = data.boardSize || 9;
    komi.value = data.komi || 3.5;
    blackSeconds.value = data.blackSeconds || 0;
    whiteSeconds.value = data.whiteSeconds || 0;
    blackName.value = data.blackName || '黑方 (玩家1)';
    whiteName.value = data.whiteName || '白方 (玩家2)';

    const g = new GoGame(boardSize.value, komi.value);
    for (const rec of data.history) {
      if (rec.point === null) {
        g.pass(rec.color);
      } else {
        g.playMove(rec.point.r, rec.point.c, rec.color);
      }
    }
    game.value = g;
    lastMove.value = data.lastMove || null;
    return true;
  } catch {
    return false;
  }
};

const initGame = (isFresh = false) => {
  if (!isFresh && restoreMatchState()) {
    isGameOver.value = false;
    showScoreModal.value = false;
    scoreResult.value = null;
    showAlert({
      title: '✨ 棋局已自动恢复',
      message: '小诺已为你完整找回刚才未下完的棋局与计时，请继续对弈吧！',
      type: 'success',
      confirmText: '继续对局 🚀'
    });
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
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
  initGame(false);

  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (!isGameOver.value && game.value.history.length > 0) {
      if (currentTurn.value === 'B') {
        blackSeconds.value++;
      } else {
        whiteSeconds.value++;
      }
      saveMatchState();
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
  saveMatchState();

  // 1. Check if game is immediately finished
  if (game.value.isGameFinished()) {
    let reason = '双方双双停一手（Pass），棋局定型自动数子判定输赢！';
    if (game.value.isBoardFull()) {
      reason = '全盘交叉点已全部下满，自动进入终局点目结算！';
    } else if (!game.value.hasLegalMoves('B') && !game.value.hasLegalMoves('W')) {
      reason = '全盘已无任何有效着法，自动终局数子结算！';
    }
    triggerScoringSettlement(reason);
    return;
  }

  // 2. Check if the next player has any legal moves left
  const nextColor = game.value.turn;
  if (!game.value.hasLegalMoves(nextColor)) {
    game.value.pass(nextColor);
    saveMatchState();

    const nextStones = game.value.getStoneCount(nextColor);
    if (game.value.isGameFinished() || nextStones === 0) {
      triggerScoringSettlement('一方棋子已无处可落且被完全包围，自动终局数子判定胜负！');
      return;
    } else {
      const nextName = nextColor === 'B' ? blackName.value : whiteName.value;
      autoPassNotice.value = nextName + ' 当前已无合法落子点，已自动停一手 (Pass)';
      setTimeout(() => {
        autoPassNotice.value = '';
      }, 3000);
    }
  }
};

const handlePass = () => {
  if (isGameOver.value) return;

  const ends = game.value.pass();
  playButtonSound();
  saveMatchState();

  if (ends || game.value.isGameFinished()) {
    triggerScoringSettlement('双方连续停一手，棋局正式终局！裁判自动数子结算！');
    return;
  }

  const nextColor = game.value.turn;
  if (!game.value.hasLegalMoves(nextColor)) {
    game.value.pass(nextColor);
    saveMatchState();
    triggerScoringSettlement('停一手后对方亦无合法落子点，自动终局数子判定胜负！');
  }
};

const triggerScoringSettlement = (reasonDesc: string) => {
  isGameOver.value = true;
  showTerritory.value = true;
  localStorage.removeItem(STORAGE_KEY);

  const score = game.value.calculateScore();
  scoreResult.value = score;
  winReason.value = reasonDesc;
  showScoreModal.value = true;

  playVictorySound();
  triggerConfetti();

  // Record user stats if active profile exists
  if (userStore.hasProfile) {
    userStore.recordGameEnd(score.winner === 'B', score.winner === 'B' ? blackCaptures.value : whiteCaptures.value, game.value.history.length);
    userStore.addCoins(30);
    userStore.addExp(60);
  }
};

const handleManualCountScore = () => {
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
      localStorage.removeItem(STORAGE_KEY);
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
    saveMatchState();
  }
};

const changeSize = (size: BoardSize) => {
  boardSize.value = size;
  initGame(true);
};

const toggleZenMode = () => {
  isZenMode.value = !isZenMode.value;
  playButtonSound();
};
</script>

<template>
  <div
    class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] select-none transition-all"
    :class="isZenMode ? 'p-1 sm:p-3 bg-[#F8F5EE]' : 'py-3 sm:py-8 px-2.5 sm:px-6 lg:px-8'"
  >
    <div class="max-w-6xl mx-auto space-y-3 sm:space-y-4">

      <!-- =========================================================
           MODE 1: 🧘 ZEN / ZONE 纯净沉浸模式 (极简紧凑 · 专为手机优化)
           ========================================================= -->
      <div v-if="isZenMode" class="space-y-2 max-w-lg mx-auto animate-fade-in">
        
        <!-- Top Sleek VS Status HUD Bar -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border-2 border-orange-200 shadow-sm flex items-center justify-between gap-2">
          <!-- Back & Return -->
          <button
            @click="goBack"
            class="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 transition active:scale-95 cursor-pointer flex-shrink-0"
            title="返回对弈竞技"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>

          <!-- White Info -->
          <div
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all flex-1 min-w-0"
            :class="currentTurn === 'W' && !isGameOver ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300' : 'bg-gray-50 border-gray-200'"
          >
            <span class="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 flex-shrink-0 shadow-2xs"></span>
            <div class="min-w-0 flex-1 leading-tight">
              <div class="text-xs font-black text-gray-900 truncate">{{ whiteName }}</div>
              <div class="text-[10px] text-gray-500 font-bold">提:{{ whiteCaptures }} · {{ formatTime(whiteSeconds) }}</div>
            </div>
            <span v-if="currentTurn === 'W' && !isGameOver" class="w-2 h-2 rounded-full bg-indigo-500 animate-ping flex-shrink-0"></span>
          </div>

          <!-- VS Badge -->
          <div class="text-[11px] font-black text-orange-600 px-1 font-mono flex-shrink-0">
            VS
          </div>

          <!-- Black Info -->
          <div
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all flex-1 min-w-0"
            :class="currentTurn === 'B' && !isGameOver ? 'bg-amber-50 border-orange-400 ring-2 ring-orange-300' : 'bg-gray-50 border-gray-200'"
          >
            <span class="w-3.5 h-3.5 rounded-full bg-gray-900 flex-shrink-0 shadow-2xs"></span>
            <div class="min-w-0 flex-1 leading-tight">
              <div class="text-xs font-black text-gray-900 truncate">{{ blackName }}</div>
              <div class="text-[10px] text-gray-500 font-bold">提:{{ blackCaptures }} · {{ formatTime(blackSeconds) }}</div>
            </div>
            <span v-if="currentTurn === 'B' && !isGameOver" class="w-2 h-2 rounded-full bg-orange-500 animate-ping flex-shrink-0"></span>
          </div>

          <!-- Exit Zen Mode Button -->
          <button
            @click="toggleZenMode"
            class="p-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 font-black transition active:scale-95 cursor-pointer flex-shrink-0 shadow-2xs"
            title="退出专注模式"
          >
            <Minimize2 class="w-4 h-4" />
          </button>
        </div>

        <!-- Center: Maximized Board -->
        <div class="bg-white rounded-3xl p-2.5 sm:p-4 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center relative">
          <!-- Live auto pass / game notice -->
          <div v-if="autoPassNotice" class="absolute top-3 z-30 animate-bounce-subtle">
            <span class="text-xs font-black bg-amber-500 text-white px-3 py-1 rounded-full shadow-md">
              📢 {{ autoPassNotice }}
            </span>
          </div>

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
            :sizePx="460"
            @move="handleMove"
          />
        </div>

        <!-- Bottom: Ultra-compact 1-Row Action Toolbar -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl p-2 border-2 border-orange-100 shadow-sm flex items-center justify-between gap-1 sm:gap-1.5">
          <button
            @click="handleUndo"
            :disabled="isGameOver || game.history.length === 0"
            class="flex-1 py-2 px-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>悔棋</span>
          </button>

          <button
            @click="handlePass"
            :disabled="isGameOver"
            class="flex-1 py-2 px-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Flag class="w-3.5 h-3.5" />
            <span>停一手</span>
          </button>

          <button
            @click="showLiberties = !showLiberties"
            class="py-2 px-2 rounded-xl border text-xs font-black transition active:scale-95 cursor-pointer flex items-center justify-center gap-0.5"
            :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-500'"
            title="开关数气"
          >
            <Eye class="w-3.5 h-3.5" />
          </button>

          <button
            @click="showAtari = !showAtari"
            class="py-2 px-2 rounded-xl border text-xs font-black transition active:scale-95 cursor-pointer flex items-center justify-center gap-0.5"
            :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-900' : 'bg-gray-50 border-gray-200 text-gray-500'"
            title="开关叫吃预警"
          >
            <AlertTriangle class="w-3.5 h-3.5" />
          </button>

          <button
            @click="handleManualCountScore"
            class="flex-1 py-2 px-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs transition active:scale-95 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
          >
            <Scale class="w-3.5 h-3.5" />
            <span>点目数子</span>
          </button>

          <button
            @click="() => initGame(true)"
            class="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 font-black text-xs transition active:scale-95 cursor-pointer"
            title="清盘重开"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      <!-- =========================================================
           MODE 2: 🖥️ FULL DESKTOP LAYOUT (完整模式)
           ========================================================= -->
      <template v-else>
        <!-- Header Banner -->
        <div class="bg-white rounded-3xl p-4 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <button
                @click="goBack"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-black transition active:scale-95 cursor-pointer border border-orange-200 shadow-2xs"
                title="返回对弈竞技"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>返回对弈竞技</span>
              </button>

              <button
                @click="toggleZenMode"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black transition active:scale-95 cursor-pointer shadow-2xs hover:from-amber-600"
                title="切换到纯净专注下棋模式"
              >
                <Maximize2 class="w-3.5 h-3.5" />
                <span>🧘 专注模式 (Zone)</span>
              </button>

              <div class="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-black">
                <Users class="w-3.5 h-3.5 text-purple-700" />
                <span>亲子面对面对弈</span>
              </div>
            </div>
            <h1 class="text-xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
              双人同屏对战棋盘
            </h1>
            <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
              支持 5x5 到 13x13 棋盘、双人计时钟、断线与防误刷自动恢复、终局自动点目数子！
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

        <!-- Main Play Layout: On mobile, board is prioritized at top (order-1) -->
        <div class="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          <!-- Right / Top: Interactive GoBoard (order-1 on mobile, 8 cols on desktop) -->
          <div class="order-1 lg:order-2 lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4 w-full">
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

              <div class="flex items-center gap-2">
                <span v-if="autoPassNotice" class="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 animate-pulse">
                  📢 {{ autoPassNotice }}
                </span>
                <span class="text-[11px] text-gray-400 font-medium">
                  {{ isGameOver ? '对局已终局判定' : '提示：防误刷新已启用 · 双方停一手或无处可下自动判输赢' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Left / Bottom: Match Control & Players Info (order-2 on mobile, 4 cols on desktop) -->
          <div class="order-2 lg:order-1 lg:col-span-4 space-y-3.5 sm:space-y-4 w-full">
            
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

              <!-- Automated Scoring Button -->
              <button
                @click="handleManualCountScore"
                class="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Scale class="w-4 h-4" />
                <span>裁判点目 · 判定输赢</span>
              </button>

              <button
                @click="() => initGame(true)"
                class="w-full py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>清盘重新开局</span>
              </button>
            </div>

          </div>

        </div>
      </template>

    </div>

    <!-- 🏆 Two Player Settlement Score Modal -->
    <Teleport to="body">
      <div
        v-if="showScoreModal && scoreResult"
        class="fixed inset-0 z-[10000] overflow-hidden bg-black/65 no-scrollbar modal-overlay backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-4"
        @click.self="showScoreModal = false"
      >
        <div
          class="relative w-full max-w-md max-h-[96vh] overflow-y-auto no-scrollbar modal-card transform rounded-3xl bg-white p-5 sm:p-7 text-center shadow-2xl border-4 border-amber-300 transition-all animate-pop-in z-[10001] space-y-4"
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
              @click="() => initGame(true)"
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

