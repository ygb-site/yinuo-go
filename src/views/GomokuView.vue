<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import confetti from 'canvas-confetti';
import {
  GOMOKU_STAR_POINTS,
  createEmptyBoard,
  checkGomokuWin,
  chooseGomokuAiMove,
  evaluateGomokuWinRate,
  evaluateGomokuMoveQuality,
  GOMOKU_PUZZLES,
  type StoneColor,
  type GomokuMove
} from '../engine/gomoku/gomokuEngine';
import { checkersAudio } from '../engine/checkers/checkersAudio';
import {
  saveUnifiedGameRecord,
  getLocalGameRecords,
  deleteUnifiedGameRecord,
  type UnifiedGameRecord,
  type WinRatePoint
} from '../services/gameRecordsService';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Volume2,
  VolumeX,
  HelpCircle,
  Palette,
  Users,
  Bot,
  Puzzle,
  ChevronRight,
  RefreshCw,
  X,
  History,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  Trash2,
  ListOrdered
} from 'lucide-vue-next';

const router = useRouter();

// Modes
type Mode = 'ai' | 'twoPlayer' | 'puzzle';
const currentMode = ref<Mode>('ai');

// Theme: 'wood' | 'ink' | 'candy'
const currentTheme = ref<'wood' | 'ink' | 'candy'>('wood');

// AI Settings
const aiDifficulty = ref<'easy' | 'medium' | 'hard'>('easy');
const aiSpeed = ref<'normal' | 'fast' | 'slow'>('normal');

// Board State: 15x15 matrix (0 = empty, 1 = Black, 2 = White)
const board = ref<number[][]>(createEmptyBoard());
const currentTurn = ref<StoneColor>(1); // 1 = Black, 2 = White
const lastMove = ref<{ r: number; c: number } | null>(null);
const winningLine = ref<{ r: number; c: number }[] | null>(null);
const winner = ref<StoneColor | null>(null);

const isAiThinking = ref<boolean>(false);
const gameStartTime = ref<number>(Date.now());

// Live Moves & Win Rate History
const moveHistory = ref<GomokuMove[]>([]);
const winRateHistory = ref<WinRatePoint[]>([]);

// Replay State
const isReplayMode = ref<boolean>(false);
const currentReplayGame = ref<UnifiedGameRecord | null>(null);
const replayStepIndex = ref<number>(0);
const isReplayAutoPlaying = ref<boolean>(false);
const replaySpeed = ref<number>(1);
let replayTimer: ReturnType<typeof setTimeout> | null = null;

// Modals State
const showVictoryModal = ref<boolean>(false);
const showRulesModal = ref<boolean>(false);
const showHistoryModal = ref<boolean>(false);
const showMoveListDrawer = ref<boolean>(false);


// Puzzle State
const currentPuzzleIndex = ref<number>(0);
const puzzleCompleted = ref<boolean>(false);

// Local Records List
const historyRecords = ref<UnifiedGameRecord[]>([]);

// Audio Mute
const isMuted = ref(checkersAudio.isMuted);
const toggleAudio = () => {
  isMuted.value = !isMuted.value;
  checkersAudio.isMuted = isMuted.value;
};

// Current Win Rate
const currentWinRate = computed(() => {
  return evaluateGomokuWinRate(board.value);
});

// Coordinate Converter for SVG (15x15 board spans from 30 to 570)
const CELL_SIZE = 38;
const BOARD_PADDING = 38;

const getSvgCoord = (r: number, c: number) => {
  return {
    cx: BOARD_PADDING + c * CELL_SIZE,
    cy: BOARD_PADDING + r * CELL_SIZE
  };
};

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

// Format Coordinate String (e.g. H8)
const formatCoord = (r: number, c: number) => {
  return `${letters[c]}${15 - r}`;
};

// Refresh History Records
const refreshHistory = () => {
  historyRecords.value = getLocalGameRecords('gomoku');
};

// Initialize Game
const initGame = () => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  board.value = createEmptyBoard();
  currentTurn.value = 1;
  lastMove.value = null;
  winningLine.value = null;
  winner.value = null;
  showVictoryModal.value = false;
  moveHistory.value = [];
  winRateHistory.value = [{
    stepIndex: 0,
    player1WinRate: 50,
    player2WinRate: 50,
    delta: 0,
    comment: '开局'
  }];
  gameStartTime.value = Date.now();
  refreshHistory();

  if (currentMode.value === 'puzzle') {
    loadPuzzle(currentPuzzleIndex.value);
  }
};

// Load Puzzle
const loadPuzzle = (idx: number) => {
  const p = GOMOKU_PUZZLES[idx] || GOMOKU_PUZZLES[0];
  currentPuzzleIndex.value = idx;
  puzzleCompleted.value = false;
  winner.value = null;
  showVictoryModal.value = false;
  lastMove.value = null;
  winningLine.value = null;
  isReplayMode.value = false;

  board.value = p.initialBoard.map((row: number[]) => [...row]);
  currentTurn.value = p.player;
  moveHistory.value = [];
  winRateHistory.value = [{
    stepIndex: 0,
    player1WinRate: 50,
    player2WinRate: 50,
    delta: 0,
    comment: p.title
  }];
};

// On Board Cell Click
const onCellClick = (r: number, c: number) => {
  if (isAiThinking.value || winner.value || isReplayMode.value) return;
  if (board.value[r][c] !== 0) return;

  // In AI mode, prevent click during AI turn
  if (currentMode.value === 'ai' && currentTurn.value === 2) return;

  executeMove(r, c, currentTurn.value);
};

// Execute Move
const executeMove = (r: number, c: number, player: StoneColor) => {
  board.value[r][c] = player;
  lastMove.value = { r, c };
  checkersAudio.playStep();

  // Evaluate Win Rate after this move
  const wrBefore = winRateHistory.value[winRateHistory.value.length - 1]?.player1WinRate || 50;
  const wrCurrent = evaluateGomokuWinRate(board.value);
  const wrAfter = wrCurrent.blackWinRate;
  const delta = player === 1 ? (wrAfter - wrBefore) : (wrBefore - wrAfter);

  // Check Win
  const winRes = checkGomokuWin(board.value, r, c, player);
  const quality = evaluateGomokuMoveQuality(delta, winRes.win);

  const moveRecord: GomokuMove = {
    r,
    c,
    player,
    stepIndex: moveHistory.value.length + 1,
    blackWinRate: wrCurrent.blackWinRate,
    whiteWinRate: wrCurrent.whiteWinRate,
    delta,
    quality: quality.quality,
    qualityBadge: quality.qualityBadge,
    qualityDesc: quality.qualityDesc,
    comment: quality.comment,
    timestamp: Date.now()
  };

  moveHistory.value.push(moveRecord);
  winRateHistory.value.push({
    stepIndex: moveRecord.stepIndex,
    player1WinRate: wrCurrent.blackWinRate,
    player2WinRate: wrCurrent.whiteWinRate,
    delta,
    quality: quality.quality,
    qualityBadge: quality.qualityBadge,
    comment: quality.comment
  });

  if (winRes.win) {
    winner.value = player;
    winningLine.value = winRes.winningLine || null;
    triggerVictory(player);
    return;
  }

  // Next Turn
  currentTurn.value = player === 1 ? 2 : 1;

  // Trigger AI turn if AI mode
  if (currentMode.value === 'ai' && currentTurn.value === 2) {
    scheduleAiTurn();
  }
};

// Schedule AI Turn
const scheduleAiTurn = () => {
  isAiThinking.value = true;
  const delay = aiSpeed.value === 'fast' ? 300 : aiSpeed.value === 'slow' ? 800 : 500;

  setTimeout(() => {
    if (winner.value || isReplayMode.value) {
      isAiThinking.value = false;
      return;
    }

    const aiMove = chooseGomokuAiMove(board.value, 2, aiDifficulty.value);
    isAiThinking.value = false;

    if (aiMove) {
      executeMove(aiMove.r, aiMove.c, 2);
    }
  }, delay);
};

// Trigger Victory Celebration & Save to Unified Database
const triggerVictory = (p: StoneColor) => {
  showVictoryModal.value = true;
  checkersAudio.playVictory();

  try {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });
  } catch (e) {}

  if (currentMode.value === 'puzzle') {
    puzzleCompleted.value = true;
  }

  // Save to unified game records (LocalStorage + Supabase Cloud)
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const winnerName = p === 1 ? '黑方 (你)' : (currentMode.value === 'ai' ? '萌宠AI' : '白方 (玩家2)');
  const winnerAvatar = p === 1 ? '⚫' : '⚪';

  const record: UnifiedGameRecord = {
    id: 'gomoku_' + Date.now(),
    gameType: 'gomoku',
    gameTypeName: '五子棋',
    mode: currentMode.value,
    modeName: currentMode.value === 'ai' ? '人机对弈' : currentMode.value === 'twoPlayer' ? '亲子双人' : '杀法闯关',
    title: `${dateStr} · 经典五子棋 (${currentMode.value === 'ai' ? '人机对战' : '双人对战'})`,
    playedAt: dateStr,
    createdAt: Date.now(),
    winnerName,
    winnerAvatar,
    winnerPlayerId: p,
    isUserWinner: p === 1,
    totalMoves: moveHistory.value.length,
    durationSeconds: Math.round((Date.now() - gameStartTime.value) / 1000),
    moves: [...moveHistory.value],
    winRateHistory: [...winRateHistory.value]
  };

  saveUnifiedGameRecord(record);
  refreshHistory();
};

// Undo Move
const undoMove = () => {
  if (isAiThinking.value || isReplayMode.value || moveHistory.value.length === 0) return;

  checkersAudio.playUndo();
  winner.value = null;
  winningLine.value = null;

  if (currentMode.value === 'ai') {
    // Undo 2 steps in AI mode
    const count = moveHistory.value.length >= 2 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const last = moveHistory.value.pop();
      if (last) {
        board.value[last.r][last.c] = 0;
      }
      winRateHistory.value.pop();
    }
    currentTurn.value = 1;
  } else {
    // Undo 1 step in 2P
    const last = moveHistory.value.pop();
    if (last) {
      board.value[last.r][last.c] = 0;
      currentTurn.value = last.player;
    }
    winRateHistory.value.pop();
  }

  const prevLast = moveHistory.value[moveHistory.value.length - 1];
  lastMove.value = prevLast ? { r: prevLast.r, c: prevLast.c } : null;
};

// Hint Move
const provideHint = () => {
  if (isAiThinking.value || winner.value || isReplayMode.value) return;
  const best = chooseGomokuAiMove(board.value, currentTurn.value, 'hard');
  if (best) {
    checkersAudio.playSelect();
    lastMove.value = { r: best.r, c: best.c };
  }
};

// Start Replay
const startReplay = (rec: UnifiedGameRecord) => {
  showVictoryModal.value = false;
  showHistoryModal.value = false;
  isReplayMode.value = true;
  currentReplayGame.value = rec;
  replayStepIndex.value = 0;
  isReplayAutoPlaying.value = false;

  board.value = createEmptyBoard();
  lastMove.value = null;
  winningLine.value = null;
  checkersAudio.playSelect();
};

// Seek Replay Step
const seekReplayStep = (step: number) => {
  if (!currentReplayGame.value) return;
  const moves = currentReplayGame.value.moves as GomokuMove[];
  const clamped = Math.max(0, Math.min(moves.length, step));
  replayStepIndex.value = clamped;

  const newB = createEmptyBoard();
  for (let i = 0; i < clamped; i++) {
    const m = moves[i];
    newB[m.r][m.c] = m.player;
  }
  board.value = newB;

  const curM = clamped > 0 ? moves[clamped - 1] : null;
  lastMove.value = curM ? { r: curM.r, c: curM.c } : null;

  if (clamped > 0) {
    checkersAudio.playStep();
  }
};

// Replay Auto-Play Controller
const toggleReplayAutoPlay = () => {
  if (isReplayAutoPlaying.value) {
    stopReplayAutoPlay();
  } else {
    isReplayAutoPlaying.value = true;
    runReplayAutoLoop();
  }
};

const stopReplayAutoPlay = () => {
  isReplayAutoPlaying.value = false;
  if (replayTimer) {
    clearTimeout(replayTimer);
    replayTimer = null;
  }
};

const runReplayAutoLoop = () => {
  if (!isReplayAutoPlaying.value || !currentReplayGame.value) return;
  const moves = currentReplayGame.value.moves as GomokuMove[];
  if (replayStepIndex.value >= moves.length) {
    stopReplayAutoPlay();
    return;
  }

  seekReplayStep(replayStepIndex.value + 1);
  const delay = Math.round(800 / replaySpeed.value);
  replayTimer = setTimeout(runReplayAutoLoop, delay);
};

// Fork & Play from Replay
const forkPlayFromHere = () => {
  if (!currentReplayGame.value) return;
  const moves = (currentReplayGame.value.moves as GomokuMove[]).slice(0, replayStepIndex.value);
  stopReplayAutoPlay();
  isReplayMode.value = false;

  moveHistory.value = [...moves];
  winRateHistory.value = (currentReplayGame.value.winRateHistory as WinRatePoint[]).slice(0, replayStepIndex.value + 1);
  currentTurn.value = (moves.length % 2 === 0 ? 1 : 2) as StoneColor;
  checkersAudio.playSelect();
};

const exitReplayMode = () => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  initGame();
};

// Current replay active move
const currentReplayMove = computed<GomokuMove | null>(() => {
  if (!isReplayMode.value || !currentReplayGame.value || replayStepIndex.value === 0) return null;
  const moves = currentReplayGame.value.moves as GomokuMove[];
  return moves[replayStepIndex.value - 1] || null;
});

// Theme Colors
const themeStyles = computed(() => {
  if (currentTheme.value === 'wood') {
    return {
      bg: 'from-amber-950 via-amber-900 to-amber-950',
      boardBg: '#e6a863',
      gridColor: '#78350f',
      starColor: '#78350f',
      labelColor: '#92400e'
    };
  } else if (currentTheme.value === 'ink') {
    return {
      bg: 'from-slate-950 via-slate-900 to-slate-950',
      boardBg: '#1e293b',
      gridColor: '#64748b',
      starColor: '#38bdf8',
      labelColor: '#94a3b8'
    };
  } else {
    return {
      bg: 'from-pink-950 via-purple-950 to-rose-950',
      boardBg: '#fbcfe8',
      gridColor: '#db2777',
      starColor: '#9d174d',
      labelColor: '#be185d'
    };
  }
});

// Win Rate Graph Polyline generator
const getWinRatePoints = computed(() => {
  const list = isReplayMode.value && currentReplayGame.value
    ? (currentReplayGame.value.winRateHistory as WinRatePoint[])
    : winRateHistory.value;

  if (list.length === 0) return '';
  const width = 280;
  const height = 70;
  const maxIdx = Math.max(1, list.length - 1);

  return list.map((pt, i) => {
    const x = Math.round((i / maxIdx) * width);
    const y = Math.round(height - (pt.player1WinRate / 100) * height);
    return `${x},${y}`;
  }).join(' ');
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/learn');
  }
};

onMounted(() => {
  initGame();
});

onUnmounted(() => {
  stopReplayAutoPlay();
});
</script>

<template>
  <div
    class="min-h-screen w-full bg-gradient-to-b text-slate-100 flex flex-col select-none transition-colors duration-500 overflow-x-hidden font-sans"
    :class="themeStyles.bg"
  >
    <!-- Top Nav Header -->
    <header class="w-full bg-black/40 backdrop-blur-md border-b border-white/10 px-2 sm:px-4 py-2 sm:py-3 sticky top-0 z-30 flex items-center justify-between shadow-lg gap-1.5 sm:gap-2">
      <!-- Left Branding -->
      <div class="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
        <button
          @click="goBack"
          class="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/10 flex items-center gap-1 text-xs sm:text-sm font-medium shrink-0 cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span class="hidden sm:inline">返回</span>
        </button>

        <div class="flex items-center gap-1.5 min-w-0">
          <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-sm sm:text-xl shadow-md shrink-0">
            ⚪
          </div>
          <h1 class="text-xs sm:text-base md:text-lg font-black tracking-wide bg-gradient-to-r from-amber-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent truncate flex items-center gap-1.5">
            <span class="whitespace-nowrap">经典五子棋</span>
            <span v-if="!isReplayMode" class="hidden md:inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-normal whitespace-nowrap">
              AI胜率分析版
            </span>
            <span v-else class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-bold whitespace-nowrap animate-pulse">
              复盘 ({{ replayStepIndex }}/{{ (currentReplayGame?.moves as any[]).length }})
            </span>
          </h1>
        </div>
      </div>

      <!-- Right Action Buttons -->
      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          v-if="isReplayMode"
          @click="exitReplayMode"
          class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md transition-all whitespace-nowrap"
        >
          <X class="w-3.5 h-3.5" />
          <span>退出复盘</span>
        </button>

        <template v-else>
          <!-- 记录与复盘 Button -->
          <button
            @click="showHistoryModal = true"
            class="px-2 sm:px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md border border-indigo-400/30 whitespace-nowrap active:scale-95 transition-all"
            title="对局记录与复盘"
          >
            <History class="w-3.5 h-3.5 text-indigo-200" />
            <span class="hidden sm:inline">记录</span>
            <span v-if="historyRecords.length > 0" class="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black">
              {{ historyRecords.length }}
            </span>
          </button>

          <!-- 提示 Button -->
          <button
            @click="provideHint"
            :disabled="isAiThinking || !!winner"
            class="px-2 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
          >
            <Lightbulb class="w-3.5 h-3.5 text-slate-950" />
            <span>提示</span>
          </button>

          <!-- 悔棋 Button -->
          <button
            @click="undoMove"
            :disabled="isAiThinking || moveHistory.length === 0 || !!winner"
            class="px-2 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-medium text-xs sm:text-sm flex items-center gap-1 border border-white/10 disabled:opacity-40 transition-all whitespace-nowrap"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>悔棋</span>
          </button>

          <!-- 重新开始 Button -->
          <button
            @click="initGame"
            class="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 transition-all shrink-0"
            title="重新开始"
          >
            <RefreshCw class="w-3.5 h-3.5" />
          </button>

          <!-- 规则 Button -->
          <button
            @click="showRulesModal = true"
            class="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 transition-all shrink-0"
            title="玩法规则"
          >
            <HelpCircle class="w-3.5 h-3.5" />
          </button>

          <!-- 音效 Button -->
          <button
            @click="toggleAudio"
            class="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 transition-all shrink-0"
          >
            <Volume2 v-if="!isMuted" class="w-3.5 h-3.5 text-emerald-400" />
            <VolumeX v-else class="w-3.5 h-3.5 text-slate-400" />
          </button>
        </template>
      </div>
    </header>

    <!-- Main Game Container -->
    <main class="flex-1 flex flex-col lg:flex-row items-center justify-center p-2 sm:p-4 gap-4 max-w-7xl mx-auto w-full">
      <!-- Left Control & Status Panel -->
      <section class="w-full lg:w-80 flex flex-col gap-3 order-2 lg:order-1">
        <!-- Replay Player (in Replay mode) -->
        <div v-if="isReplayMode && currentReplayGame" class="bg-black/40 backdrop-blur-md rounded-2xl p-4 border-2 border-cyan-500/40 flex flex-col gap-3 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <History class="w-4 h-4" />
              <span>五子棋智能复盘</span>
            </span>
            <span class="text-xs font-mono font-bold text-slate-300">
              {{ replayStepIndex }} / {{ (currentReplayGame.moves as any[]).length }} 手
            </span>
          </div>

          <!-- Scrubbing Slider -->
          <div class="flex flex-col gap-1">
            <input
              type="range"
              min="0"
              :max="(currentReplayGame.moves as any[]).length"
              :value="replayStepIndex"
              @input="seekReplayStep(Number(($event.target as HTMLInputElement).value))"
              class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <!-- Playback Buttons Bar -->
          <div class="grid grid-cols-5 gap-1 items-center">
            <button
              @click="seekReplayStep(0)"
              :disabled="replayStepIndex === 0"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
            >
              <SkipBack class="w-4 h-4" />
            </button>
            <button
              @click="seekReplayStep(replayStepIndex - 1)"
              :disabled="replayStepIndex === 0"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <button
              @click="toggleReplayAutoPlay"
              class="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              <Pause v-if="isReplayAutoPlaying" class="w-5 h-5" />
              <Play v-else class="w-5 h-5 fill-white" />
            </button>
            <button
              @click="seekReplayStep(replayStepIndex + 1)"
              :disabled="replayStepIndex >= (currentReplayGame.moves as any[]).length"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
            <button
              @click="seekReplayStep((currentReplayGame.moves as any[]).length)"
              :disabled="replayStepIndex >= (currentReplayGame.moves as any[]).length"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
            >
              <SkipForward class="w-4 h-4" />
            </button>
          </div>

          <!-- Speed & Fork Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-white/10">
            <div class="flex items-center gap-1">
              <span class="text-[11px] text-slate-400">倍速:</span>
              <button
                v-for="s in [0.5, 1, 2]"
                :key="s"
                @click="replaySpeed = s"
                class="px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all"
                :class="replaySpeed === s ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-white/5 text-slate-400 border-white/10'"
              >
                {{ s }}x
              </button>
            </div>

            <button
              @click="forkPlayFromHere"
              class="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>从此手继续对弈</span>
            </button>
          </div>

          <!-- Step Commentary -->
          <div v-if="currentReplayMove" class="bg-white/5 rounded-xl p-2.5 border border-white/10 text-xs">
            <div class="flex items-center justify-between font-bold text-slate-200 mb-1">
              <span>{{ currentReplayMove.player === 1 ? '⚫ 黑方' : '⚪ 白方' }} (第 {{ currentReplayMove.stepIndex }} 手)</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-bold">
                {{ currentReplayMove.qualityBadge }}
              </span>
            </div>
            <div class="text-slate-300 leading-relaxed font-mono">
              落子点：<span class="text-amber-300 font-bold">{{ formatCoord(currentReplayMove.r, currentReplayMove.c) }}</span>
            </div>
            <div class="text-slate-400 text-[11px] mt-1">{{ currentReplayMove.comment }}</div>
          </div>
        </div>

        <!-- Normal Mode Panels (when not in replay) -->
        <template v-else>
          <!-- Mode Tabs -->
          <div class="bg-black/30 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 grid grid-cols-3 gap-1">
            <button
              @click="currentMode = 'ai'; initGame();"
              class="py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1"
              :class="currentMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
            >
              <Bot class="w-4 h-4" />
              <span>人机对弈</span>
            </button>
            <button
              @click="currentMode = 'twoPlayer'; initGame();"
              class="py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1"
              :class="currentMode === 'twoPlayer' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
            >
              <Users class="w-4 h-4" />
              <span>亲子同屏</span>
            </button>
            <button
              @click="currentMode = 'puzzle'; initGame();"
              class="py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1"
              :class="currentMode === 'puzzle' ? 'bg-amber-500 text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-slate-200'"
            >
              <Puzzle class="w-4 h-4" />
              <span>杀法闯关</span>
            </button>
          </div>

          <!-- Controls Box -->
          <div class="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
            <!-- AI Difficulty Selection -->
            <div v-if="currentMode === 'ai'" class="flex flex-col gap-2">
              <div class="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>对手难度：</span>
                <span class="text-amber-300 font-bold">
                  {{ aiDifficulty === 'easy' ? '🐼 萌宝 (简单)' : aiDifficulty === 'medium' ? '🦊 小狐 (中等)' : '🐉 龙龙 (大师)' }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                <button
                  @click="aiDifficulty = 'easy'; initGame();"
                  class="py-1.5 rounded-xl text-xs font-bold border transition-all"
                  :class="aiDifficulty === 'easy' ? 'bg-blue-500/30 border-blue-400 text-blue-200' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'"
                >
                  🐼 简单
                </button>
                <button
                  @click="aiDifficulty = 'medium'; initGame();"
                  class="py-1.5 rounded-xl text-xs font-bold border transition-all"
                  :class="aiDifficulty === 'medium' ? 'bg-purple-500/30 border-purple-400 text-purple-200' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'"
                >
                  🦊 中等
                </button>
                <button
                  @click="aiDifficulty = 'hard'; initGame();"
                  class="py-1.5 rounded-xl text-xs font-bold border transition-all"
                  :class="aiDifficulty === 'hard' ? 'bg-rose-500/30 border-rose-400 text-rose-200' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'"
                >
                  🐉 大师
                </button>
              </div>
            </div>

            <!-- Puzzle Selector -->
            <div v-if="currentMode === 'puzzle'" class="flex flex-col gap-2">
              <div class="text-xs text-amber-300 font-bold">残局关卡选择：</div>
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  v-for="(pzl, idx) in GOMOKU_PUZZLES"
                  :key="pzl.id"
                  @click="loadPuzzle(idx)"
                  class="w-8 h-8 shrink-0 rounded-xl font-black text-xs flex items-center justify-center border transition-all"
                  :class="currentPuzzleIndex === idx ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' : 'bg-white/10 text-white border-white/10'"
                >
                  {{ idx + 1 }}
                </button>
              </div>
              <div class="bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/20 text-xs">
                <div class="font-bold text-amber-300 mb-0.5">{{ GOMOKU_PUZZLES[currentPuzzleIndex]?.title }}</div>
                <div class="text-slate-300 leading-relaxed">{{ GOMOKU_PUZZLES[currentPuzzleIndex]?.desc }}</div>
                <div class="mt-1.5 flex items-center gap-1 text-emerald-300 font-bold">
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>目标：{{ GOMOKU_PUZZLES[currentPuzzleIndex]?.targetGoalText }}</span>
                </div>
              </div>
            </div>

            <!-- Current Turn Box -->
            <div class="border-t border-white/10 pt-3 flex flex-col gap-2">
              <div class="text-xs text-slate-400 flex items-center justify-between">
                <span>当前执子回合</span>
                <span class="text-slate-400">已走: {{ moveHistory.length }} 手</span>
              </div>
              <div
                class="flex items-center gap-3 p-2.5 rounded-xl border transition-all"
                :class="currentTurn === 1 ? 'border-slate-600 bg-slate-800/60' : 'border-slate-300 bg-slate-100/20'"
              >
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-lg border-2"
                  :class="currentTurn === 1 ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'"
                >
                  {{ currentTurn === 1 ? '⚫' : '⚪' }}
                </div>
                <div class="flex-1">
                  <div class="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{{ currentTurn === 1 ? '黑方 (先行)' : (currentMode === 'ai' ? '白方 (萌宠AI)' : '白方 (后行)') }}</span>
                    <span v-if="isAiThinking" class="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 animate-pulse">
                      思考落子中...
                    </span>
                  </div>
                  <div class="text-xs text-slate-300 mt-0.5">
                    {{ currentWinRate.statusText }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Move History Drawer Toggle -->
            <button
              @click="showMoveListDrawer = !showMoveListDrawer"
              class="mt-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-between border border-white/10 transition-all"
            >
              <span class="flex items-center gap-1.5">
                <ListOrdered class="w-3.5 h-3.5 text-amber-400" />
                <span>棋谱步骤列表 ({{ moveHistory.length }} 手)</span>
              </span>
              <span class="text-[10px] text-slate-400">{{ showMoveListDrawer ? '收起 ▲' : '展开 ▼' }}</span>
            </button>

            <!-- Collapsible Move List Drawer -->
            <div v-if="showMoveListDrawer" class="max-h-40 overflow-y-auto space-y-1 bg-black/40 p-2 rounded-xl border border-white/10 text-xs font-mono">
              <div
                v-for="m in moveHistory"
                :key="m.stepIndex"
                class="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/10 text-slate-300"
              >
                <span class="text-slate-500 w-6">#{{ m.stepIndex }}</span>
                <span class="flex-1 truncate">{{ m.player === 1 ? '⚫' : '⚪' }} {{ formatCoord(m.r, m.c) }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" :class="m.quality === 'god_move' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-slate-400'">
                  {{ m.qualityBadge }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- AI Win-Rate Evaluation Curve Graph Panel -->
        <div class="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-200">
            <span class="flex items-center gap-1 text-cyan-300">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>AI 实时胜率走势图</span>
            </span>
            <div class="flex items-center gap-2 text-[10px] font-mono">
              <span class="text-slate-300">黑: {{ isReplayMode && currentReplayMove ? currentReplayMove.blackWinRate : currentWinRate.blackWinRate }}%</span>
              <span class="text-slate-400">白: {{ isReplayMode && currentReplayMove ? currentReplayMove.whiteWinRate : currentWinRate.whiteWinRate }}%</span>
            </div>
          </div>

          <!-- Dynamic SVG Win Rate Line Chart -->
          <div class="w-full h-20 bg-slate-950/60 rounded-xl p-2 border border-white/10 relative overflow-hidden flex items-center justify-center">
            <!-- 50% Balance Baseline -->
            <div class="absolute left-0 right-0 top-1/2 border-b border-dashed border-white/20"></div>

            <svg viewBox="0 0 280 70" class="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="winRateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
                  <stop offset="100%" stop-color="#ef4444" stop-opacity="0.8" />
                </linearGradient>
              </defs>

              <polyline
                v-if="getWinRatePoints"
                :points="getWinRatePoints"
                fill="none"
                stroke="url(#winRateGrad)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- Theme Selector -->
        <div class="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Palette class="w-4 h-4 text-pink-400" />
            <span>棋盘皮肤：</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="currentTheme = 'wood'"
              class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all border"
              :class="currentTheme === 'wood' ? 'bg-amber-700 text-white border-amber-500' : 'bg-white/5 text-slate-400 border-white/10'"
            >
              🪵 榧木
            </button>
            <button
              @click="currentTheme = 'ink'"
              class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all border"
              :class="currentTheme === 'ink' ? 'bg-slate-700 text-white border-slate-500' : 'bg-white/5 text-slate-400 border-white/10'"
            >
              🌑 水墨
            </button>
            <button
              @click="currentTheme = 'candy'"
              class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all border"
              :class="currentTheme === 'candy' ? 'bg-pink-600 text-white border-pink-400' : 'bg-white/5 text-slate-400 border-white/10'"
            >
              🍬 糖果
            </button>
          </div>
        </div>
      </section>

      <!-- Center 15x15 Gomoku Board -->
      <section class="flex-1 flex flex-col items-center justify-center relative w-full order-1 lg:order-2">
        <div class="relative w-full max-w-[620px] aspect-square flex items-center justify-center p-1 sm:p-2">
          <svg
            viewBox="0 0 608 608"
            class="w-full h-full drop-shadow-2xl select-none"
          >
            <defs>
              <!-- Black Stone 3D Radial Gradient -->
              <radialGradient id="blackStoneGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#555555" />
                <stop offset="40%" stop-color="#222222" />
                <stop offset="100%" stop-color="#050505" />
              </radialGradient>

              <!-- White Stone 3D Radial Gradient -->
              <radialGradient id="whiteStoneGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="60%" stop-color="#e2e8f0" />
                <stop offset="100%" stop-color="#94a3b8" />
              </radialGradient>

              <!-- Stone Drop Shadow -->
              <filter id="gomokuShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.5" />
              </filter>
            </defs>

            <!-- Board Base Plate -->
            <rect
              x="8"
              y="8"
              width="592"
              height="592"
              rx="16"
              :fill="themeStyles.boardBg"
              stroke="#522504"
              stroke-width="5"
            />

            <!-- Coordinate Labels (Letters & Numbers) -->
            <g :fill="themeStyles.labelColor" font-size="11" font-weight="bold" text-anchor="middle">
              <!-- Top & Bottom Letters -->
              <text v-for="(l, cIdx) in letters" :key="'col_top_' + cIdx" :x="BOARD_PADDING + cIdx * CELL_SIZE" y="24">
                {{ l }}
              </text>
              <text v-for="(l, cIdx) in letters" :key="'col_bot_' + cIdx" :x="BOARD_PADDING + cIdx * CELL_SIZE" y="594">
                {{ l }}
              </text>
              <!-- Left & Right Numbers -->
              <text v-for="rIdx in 15" :key="'row_left_' + rIdx" x="22" :y="BOARD_PADDING + (rIdx - 1) * CELL_SIZE + 4">
                {{ 16 - rIdx }}
              </text>
              <text v-for="rIdx in 15" :key="'row_right_' + rIdx" x="586" :y="BOARD_PADDING + (rIdx - 1) * CELL_SIZE + 4">
                {{ 16 - rIdx }}
              </text>
            </g>

            <!-- 15x15 Grid Lines -->
            <g :stroke="themeStyles.gridColor" stroke-width="1.2" opacity="0.85">
              <!-- Horizontal Lines -->
              <line
                v-for="r in 15"
                :key="'hline_' + r"
                :x1="BOARD_PADDING"
                :y1="BOARD_PADDING + (r - 1) * CELL_SIZE"
                :x2="BOARD_PADDING + 14 * CELL_SIZE"
                :y2="BOARD_PADDING + (r - 1) * CELL_SIZE"
              />
              <!-- Vertical Lines -->
              <line
                v-for="c in 15"
                :key="'vline_' + c"
                :x1="BOARD_PADDING + (c - 1) * CELL_SIZE"
                :y1="BOARD_PADDING"
                :x2="BOARD_PADDING + (c - 1) * CELL_SIZE"
                :y2="BOARD_PADDING + 14 * CELL_SIZE"
              />
            </g>

            <!-- 5 Star Points (天元与星位) -->
            <g :fill="themeStyles.starColor">
              <circle
                v-for="(st, sIdx) in GOMOKU_STAR_POINTS"
                :key="'star_' + sIdx"
                :cx="getSvgCoord(st.r, st.c).cx"
                :cy="getSvgCoord(st.r, st.c).cy"
                r="4.5"
              />
            </g>

            <!-- Winning 5 in a row connecting golden bar -->
            <g v-if="winningLine">
              <polyline
                :points="winningLine.map(pt => `${getSvgCoord(pt.r, pt.c).cx},${getSvgCoord(pt.r, pt.c).cy}`).join(' ')"
                fill="none"
                stroke="#fbbf24"
                stroke-width="5"
                stroke-linecap="round"
                class="animate-pulse"
              />
            </g>

            <!-- Interactive Intersections & Stones -->
            <g>
              <template v-for="r in 15" :key="'row_group_' + r">
                <g
                  v-for="c in 15"
                  :key="'cell_' + (r-1) + '_' + (c-1)"
                  :transform="`translate(${getSvgCoord(r-1, c-1).cx}, ${getSvgCoord(r-1, c-1).cy})`"
                  @click="onCellClick(r-1, c-1)"
                  class="cursor-pointer"
                >
                  <!-- Hitbox Area -->
                  <circle cx="0" cy="0" :r="CELL_SIZE / 2" fill="transparent" />

                  <!-- Hover ghost preview when empty -->
                  <circle
                    v-if="board[r-1][c-1] === 0 && !winner && !isReplayMode"
                    cx="0"
                    cy="0"
                    :r="CELL_SIZE * 0.42"
                    fill="none"
                    stroke="#ffffff"
                    stroke-width="1.5"
                    opacity="0"
                    class="hover:opacity-60 transition-opacity"
                  />

                  <!-- Stone -->
                  <template v-if="board[r-1][c-1] !== 0">
                    <g filter="url(#gomokuShadow)">
                      <circle
                        cx="0"
                        cy="0"
                        :r="CELL_SIZE * 0.44"
                        :fill="board[r-1][c-1] === 1 ? 'url(#blackStoneGrad)' : 'url(#whiteStoneGrad)'"
                        :stroke="board[r-1][c-1] === 1 ? '#000000' : '#cbd5e1'"
                        stroke-width="1"
                      />
                      <!-- Highlight glint -->
                      <ellipse
                        cx="-4"
                        cy="-4"
                        rx="4"
                        ry="2"
                        fill="#ffffff"
                        fill-opacity="0.65"
                        transform="rotate(-30, -4, -4)"
                      />
                    </g>
                  </template>

                  <!-- Last Move Marker Red Dot -->
                  <circle
                    v-if="lastMove && lastMove.r === (r-1) && lastMove.c === (c-1)"
                    cx="0"
                    cy="0"
                    r="4"
                    fill="#ef4444"
                    class="animate-ping"
                  />
                  <circle
                    v-if="lastMove && lastMove.r === (r-1) && lastMove.c === (c-1)"
                    cx="0"
                    cy="0"
                    r="3.5"
                    fill="#ef4444"
                  />
                </g>
              </template>
            </g>
          </svg>
        </div>

        <!-- Quick Tips Bar -->
        <div class="mt-2 text-center text-xs sm:text-sm font-medium text-slate-300 flex items-center justify-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <span v-if="isReplayMode" class="text-cyan-300 font-bold">
            🔍 拖动进度条或点击播放按钮分步复盘推演
          </span>
          <span v-else-if="!isAiThinking && !winner">
            👆 点击任意交叉点落子 · 五子连珠获胜！
          </span>
          <span v-else-if="isAiThinking" class="text-amber-300 font-bold animate-pulse">
            🤖 对手正在计算最佳攻防落点...
          </span>
        </div>
      </section>
    </main>

    <!-- History Records Modal -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div class="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh]">
        <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📜</span>
            <div>
              <h3 class="text-lg font-black text-white">五子棋对局记录与复盘</h3>
              <p class="text-xs text-slate-400">已保存 {{ historyRecords.length }} 局历史对战棋谱</p>
            </div>
          </div>
          <button
            @click="showHistoryModal = false"
            class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div
            v-for="rec in historyRecords"
            :key="rec.id"
            class="bg-white/5 hover:bg-white/10 rounded-2xl p-3.5 border border-white/10 flex items-center justify-between gap-3 transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0" :class="rec.isUserWinner ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-slate-800 border border-white/10 text-slate-400'">
                {{ rec.isUserWinner ? '🏆' : '🥈' }}
              </div>
              <div class="flex flex-col gap-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-amber-300 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                    {{ rec.modeName }}
                  </span>
                  <span class="text-xs font-bold text-white">
                    胜者: {{ rec.winnerAvatar }} {{ rec.winnerName }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                  <span>总手数: {{ rec.totalMoves }} 手</span>
                  <span>•</span>
                  <span>{{ rec.playedAt }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="startReplay(rec)"
                class="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
              >
                <Play class="w-3.5 h-3.5 fill-white" />
                <span>复盘</span>
              </button>
              <button
                @click="deleteUnifiedGameRecord(rec.id); refreshHistory();"
                class="p-1.5 rounded-xl bg-white/5 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 border border-white/10 active:scale-95 transition-all"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-if="historyRecords.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
            <span class="text-4xl mb-2">📭</span>
            <p class="text-sm font-medium">暂无五子棋对局记录</p>
            <p class="text-xs mt-1">完成对局后，棋谱将自动保存于此，支持AI胜率曲线复盘！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Victory Modal -->
    <div
      v-if="showVictoryModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div class="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          🏆
        </div>

        <h2 class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent mb-2">
          五子连珠 · 大获全胜！
        </h2>

        <p class="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
          <span class="font-bold text-amber-300">{{ winner === 1 ? '黑方 (你)' : (currentMode === 'ai' ? '萌宠AI' : '白方') }}</span>
          率先完成五子连珠！
        </p>

        <!-- Buttons -->
        <div class="flex items-center gap-2 w-full">
          <button
            @click="startReplay(historyRecords[0])"
            class="flex-1 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <History class="w-4 h-4" />
            <span>立即复盘</span>
          </button>
          <button
            @click="initGame"
            class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw class="w-4 h-4" />
            <span>再玩一局</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Rules Modal -->
    <div
      v-if="showRulesModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div class="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 class="text-lg font-black text-white flex items-center gap-2">📖 五子棋规则秘籍</h3>
          <button @click="showRulesModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>
        <div class="space-y-3 text-xs text-slate-300">
          <div class="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong class="text-blue-300">1. 先行与轮流：</strong> 黑先白后，双方轮流在交叉点落下一子。
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong class="text-amber-300">2. 胜负判定：</strong> 任意横、竖、斜方向率先连成同色五子者获胜！
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong class="text-emerald-300">3. 攻防要诀：</strong> “见三就挡，做四连五”，抢先形成双活三或冲四活三必胜！
          </div>
        </div>
        <button @click="showRulesModal = false" class="mt-5 py-2.5 rounded-xl bg-blue-600 font-bold text-white shadow-lg">
          我明白了，开始对弈！
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

