<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
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
import { showAlert } from '../utils/alert';
import {
  RotateCcw,
  Sparkles,
  Lightbulb,
  Volume2,
  VolumeX,
  HelpCircle,
  Users,
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

const route = useRoute();

const STORAGE_KEY = 'yinuo_active_gomoku';

// Modes
type Mode = 'ai' | 'twoPlayer' | 'puzzle';
const currentMode = ref<Mode>('twoPlayer');

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

// Refresh History Records
const refreshHistory = () => {
  historyRecords.value = getLocalGameRecords('gomoku');
};

const saveGomokuState = () => {
  if (typeof window === 'undefined') return;
  if (isReplayMode.value || currentMode.value === 'puzzle') return;
  if (winner.value || moveHistory.value.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const payload = {
    currentMode: currentMode.value,
    aiDifficulty: aiDifficulty.value,
    board: board.value.map((row) => [...row]),
    currentTurn: currentTurn.value,
    lastMove: lastMove.value,
    moveHistory: moveHistory.value,
    winRateHistory: winRateHistory.value,
    gameStartTime: gameStartTime.value
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
};

const restoreGomokuState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.moveHistory) || data.moveHistory.length === 0) return false;
    if (!Array.isArray(data.board) || data.board.length !== 15) return false;

    currentMode.value = 'twoPlayer';
    if (data.aiDifficulty === 'easy' || data.aiDifficulty === 'medium' || data.aiDifficulty === 'hard') {
      aiDifficulty.value = data.aiDifficulty;
    }
    board.value = data.board.map((row: number[]) => [...row]);
    currentTurn.value = data.currentTurn === 2 ? 2 : 1;
    lastMove.value = data.lastMove || null;
    moveHistory.value = data.moveHistory;
    winRateHistory.value = Array.isArray(data.winRateHistory) ? data.winRateHistory : [];
    gameStartTime.value = typeof data.gameStartTime === 'number' ? data.gameStartTime : Date.now();
    winner.value = null;
    winningLine.value = null;
    return true;
  } catch {
    return false;
  }
};

const initGame = (isFresh = false) => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;

  if (!isFresh && restoreGomokuState()) {
    showVictoryModal.value = false;
    puzzleCompleted.value = false;
    refreshHistory();
    showAlert({
      title: '✨ 棋局已自动恢复',
      message: '小诺已为你找回刚才未下完的五子棋，请继续对弈吧！',
      type: 'success',
      confirmText: '继续对弈 🚀'
    });
    if (currentMode.value === 'ai' && currentTurn.value === 2) {
      scheduleAiTurn();
    }
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
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

const handleSvgBoardClick = (e: MouseEvent) => {
  const svg = e.currentTarget as SVGSVGElement;
  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const loc = pt.matrixTransform(ctm.inverse());
  const c = Math.round((loc.x - BOARD_PADDING) / CELL_SIZE);
  const r = Math.round((loc.y - BOARD_PADDING) / CELL_SIZE);
  if (r < 0 || r > 14 || c < 0 || c > 14) return;
  onCellClick(r, c);
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

  currentTurn.value = player === 1 ? 2 : 1;
  saveGomokuState();

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
  localStorage.removeItem(STORAGE_KEY);
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

  const winnerName = p === 1 ? '黑方 (你)' : '白方 (玩家2)';
  const winnerAvatar = p === 1 ? '⚫' : '⚪';

  const record: UnifiedGameRecord = {
    id: 'gomoku_' + Date.now(),
    gameType: 'gomoku',
    gameTypeName: '五子棋',
    mode: currentMode.value,
    modeName: currentMode.value === 'twoPlayer' ? '亲子同屏' : '杀法闯关',
    title: `${dateStr} · 经典五子棋 (双人对战)`,
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
  saveGomokuState();
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
  initGame(true);
};

// Current replay active move
const currentReplayMove = computed<GomokuMove | null>(() => {
  if (!isReplayMode.value || !currentReplayGame.value || replayStepIndex.value === 0) return null;
  const moves = currentReplayGame.value.moves as GomokuMove[];
  return moves[replayStepIndex.value - 1] || null;
});

const themeStyles = {
  boardBg: '#e6a863',
  gridColor: '#78350f',
  starColor: '#78350f',
  labelColor: '#92400e'
};

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

onMounted(() => {
  const qMode = route.query.mode as Mode;
  const qDiff = route.query.diff as 'easy' | 'medium' | 'hard';
  if (qMode && ['ai', 'twoPlayer'].includes(qMode)) currentMode.value = 'twoPlayer';
  if (qDiff && ['easy', 'medium', 'hard'].includes(qDiff)) aiDifficulty.value = qDiff;
  initGame();
});

onUnmounted(() => {
  stopReplayAutoPlay();
});
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#F8F6F2] py-3 sm:py-5 lg:py-6 px-2.5 sm:px-5 lg:px-6 select-none font-sans">
    <div class="max-w-7xl mx-auto space-y-3 sm:space-y-4">

      <!-- Top Action Toolbar Bar -->
      <div class="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
        <!-- Left Title Badge -->
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg border border-blue-200 shrink-0">
            ⚪
          </div>
          <div class="flex items-center gap-1.5 min-w-0 truncate">
            <h2 class="text-sm sm:text-base font-black text-slate-900 truncate">经典五子棋</h2>
            <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap" :class="isReplayMode ? 'bg-cyan-100 text-cyan-800 animate-pulse' : 'bg-blue-50 text-blue-800 border border-blue-200'">
              {{ isReplayMode ? ('复盘 (' + replayStepIndex + '/' + (currentReplayGame?.moves as any[])?.length + ')') : '亲子同屏' }}
            </span>
          </div>
        </div>

        <!-- Right Quick Action Buttons -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            v-if="isReplayMode"
            @click="exitReplayMode"
            class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
            <span>退出复盘</span>
          </button>

          <template v-else>
            <!-- 提示 Button -->
            <button
              @click="provideHint"
              :disabled="isAiThinking || !!winner"
              class="px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            >
              <Lightbulb class="w-3.5 h-3.5 fill-current" />
              <span>提示</span>
            </button>

            <!-- 悔棋 Button -->
            <button
              @click="undoMove"
              :disabled="isAiThinking || moveHistory.length === 0 || !!winner"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-200/80 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>悔棋</span>
            </button>

            <!-- 重新开始 Button -->
            <button
              @click="initGame(true)"
              class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
              title="重新开始"
            >
              <RefreshCw class="w-4 h-4" />
            </button>

            <!-- 历史记录 Button -->
            <button
              @click="showHistoryModal = true"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs sm:text-sm flex items-center gap-1 border border-indigo-200 transition-all cursor-pointer active:scale-95"
              title="对局记录与复盘"
            >
              <History class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">记录</span>
              <span v-if="historyRecords.length > 0" class="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black">
                {{ historyRecords.length }}
              </span>
            </button>

            <!-- 规则 Button -->
            <button
              @click="showRulesModal = true"
              class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
              title="玩法规则"
            >
              <HelpCircle class="w-4 h-4" />
            </button>

            <!-- 音效 Button -->
            <button
              @click="toggleAudio"
              class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer active:scale-95 hidden sm:flex"
            >
              <Volume2 v-if="!isMuted" class="w-4 h-4 text-emerald-600" />
              <VolumeX v-else class="w-4 h-4 text-slate-400" />
            </button>
          </template>
        </div>
      </div>

      <!-- 棋盘在左、控制区在右；顶对齐，避免控制区被垂直居中悬空 -->
      <main class="flex-1 flex flex-col lg:flex-row items-start gap-4 sm:gap-6 w-full">
        <!-- 右侧控制区（窄屏在棋盘下方） -->
        <section class="w-full lg:w-80 flex flex-col gap-3.5 order-2 shrink-0">
          <!-- Replay Control Panel (When in Replay Mode) -->
          <div v-if="isReplayMode && currentReplayGame" class="bg-white rounded-3xl p-5 border-2 border-cyan-400/80 shadow-2xs flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-cyan-800 flex items-center gap-1.5">
                <History class="w-4 h-4 text-cyan-600" />
                <span>智能复盘推演</span>
              </span>
              <span class="text-xs font-mono font-bold text-slate-500">
                {{ replayStepIndex }} / {{ (currentReplayGame?.moves as any[])?.length || 0 }} 步
              </span>
            </div>

            <!-- Scrubbing Slider -->
            <input
              type="range"
              min="0"
              :max="(currentReplayGame?.moves as any[])?.length || 0"
              :value="replayStepIndex"
              @input="seekReplayStep(Number(($event.target as HTMLInputElement).value))"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />

            <!-- Playback Bar -->
            <div class="grid grid-cols-5 gap-1.5 items-center">
              <button
                @click="seekReplayStep(0)"
                :disabled="replayStepIndex === 0"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
              >
                <SkipBack class="w-4 h-4" />
              </button>
              <button
                @click="seekReplayStep(replayStepIndex - 1)"
                :disabled="replayStepIndex === 0"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button
                @click="toggleReplayAutoPlay"
                class="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Pause v-if="isReplayAutoPlaying" class="w-5 h-5" />
                <Play v-else class="w-5 h-5 fill-white" />
              </button>
              <button
                @click="seekReplayStep(replayStepIndex + 1)"
                :disabled="replayStepIndex >= ((currentReplayGame?.moves as any[])?.length || 0)"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
              <button
                @click="seekReplayStep((currentReplayGame?.moves as any[])?.length || 0)"
                :disabled="replayStepIndex >= ((currentReplayGame?.moves as any[])?.length || 0)"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
              >
                <SkipForward class="w-4 h-4" />
              </button>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                @click="forkPlayFromHere"
                class="w-full py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles class="w-4 h-4 text-amber-600" />
                <span>从此步接盘继续下</span>
              </button>
            </div>
          </div>

          <!-- Normal Controls -->
          <template v-else>
            <!-- Mode Tabs -->
            <div class="bg-white rounded-2xl p-1.5 border-2 border-slate-200/90 shadow-2xs">
              <div class="py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-purple-600 text-white shadow-xs">
                <Users class="w-4 h-4" />
                <span>亲子同屏</span>
              </div>
            </div>

            <!-- Match Status Card -->
            <div class="bg-white rounded-3xl p-5 border-2 border-slate-200/90 shadow-2xs space-y-4">
              <!-- Current Turn Display -->
              <div class="p-3.5 rounded-2xl border-2 transition-all" :class="currentTurn === 1 ? 'bg-slate-900 text-white border-slate-800 shadow-xs' : 'bg-slate-50 text-slate-900 border-slate-300 shadow-xs'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded-full border-2" :class="currentTurn === 1 ? 'bg-black border-white/60' : 'bg-white border-slate-400'"></span>
                    <span class="font-black text-sm">{{ currentTurn === 1 ? '黑方回合 (先行)' : '白方回合' }}</span>
                  </div>
                  <span v-if="isAiThinking" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold animate-pulse">
                    AI计算中...
                  </span>
                  <span v-else class="text-xs font-mono opacity-80">
                    已下: {{ moveHistory.length }} 手
                  </span>
                </div>
              </div>

              <!-- Move List Drawer Button -->
              <button
                @click="showMoveListDrawer = !showMoveListDrawer"
                class="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between border border-slate-200 transition-all cursor-pointer"
              >
                <span class="flex items-center gap-1.5">
                  <ListOrdered class="w-4 h-4 text-blue-600" />
                  <span>棋谱步骤列表 ({{ moveHistory.length }} 手)</span>
                </span>
                <span class="text-[11px] text-slate-400">{{ showMoveListDrawer ? '收起 ▲' : '展开 ▼' }}</span>
              </button>

              <div v-if="showMoveListDrawer" class="max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-mono">
                <div
                  v-for="m in moveHistory"
                  :key="m.stepIndex"
                  class="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white text-slate-700"
                >
                  <span class="text-slate-400 w-6">#{{ m.stepIndex }}</span>
                  <span class="flex-1">{{ m.player === 1 ? '⚫ 黑' : '⚪ 白' }} {{ String.fromCharCode(65 + m.c) }}{{ 15 - m.r }}</span>
                  <span v-if="m.qualityBadge" class="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800">
                    {{ m.qualityBadge }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- AI Win-Rate Sparkline Card -->
          <div class="bg-white rounded-3xl p-4 border-2 border-slate-200/90 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800">
              <span class="flex items-center gap-1.5 text-blue-700">
                <Sparkles class="w-4 h-4 text-amber-500" />
                <span>AI 实时胜率走势</span>
              </span>
              <div class="flex items-center gap-2 font-mono text-[11px]">
                <span class="text-slate-900 font-bold">黑: {{ isReplayMode && currentReplayMove ? currentReplayMove.blackWinRate : currentWinRate.blackWinRate }}%</span>
                <span class="text-blue-600 font-bold">白: {{ isReplayMode && currentReplayMove ? currentReplayMove.whiteWinRate : currentWinRate.whiteWinRate }}%</span>
              </div>
            </div>

            <div class="w-full h-16 bg-slate-50 rounded-xl p-1.5 border border-slate-200 relative overflow-hidden flex items-center justify-center">
              <div class="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-300"></div>
              <svg viewBox="0 0 280 70" class="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="wrGomokuGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#ef4444" stop-opacity="0.9" />
                  </linearGradient>
                </defs>
                <polyline
                  v-if="getWinRatePoints"
                  :points="getWinRatePoints"
                  fill="none"
                  stroke="url(#wrGomokuGrad)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <!-- 左侧 15x15 棋盘 -->
        <section class="flex-1 flex flex-col items-center justify-start relative w-full order-1 min-w-0">
          <!-- White Pedestal Board Base Card -->
          <div class="bg-white rounded-3xl p-3 sm:p-5 border-2 border-slate-200/90 shadow-sm flex flex-col items-center justify-center relative w-full max-w-[min(96vw,680px,calc(100vh-140px))] aspect-square">
            <svg
              viewBox="0 0 600 600"
              class="w-full h-full select-none cursor-pointer rounded-2xl drop-shadow-md"
              @click="handleSvgBoardClick"
            >
              <!-- Board Background Base -->
              <rect x="0" y="0" width="600" height="600" rx="16" :fill="themeStyles.boardBg" stroke="#451a03" stroke-width="4" />

              <!-- Board Inner Decorative Border -->
              <rect x="12" y="12" width="576" height="576" rx="8" fill="none" :stroke="themeStyles.gridColor" stroke-width="1.5" stroke-opacity="0.4" />

              <!-- 15x15 Grid Lines -->
              <g :stroke="themeStyles.gridColor" stroke-width="1.5">
                <line
                  v-for="r in 15"
                  :key="'h_' + r"
                  :x1="BOARD_PADDING"
                  :y1="BOARD_PADDING + (r - 1) * CELL_SIZE"
                  :x2="600 - BOARD_PADDING"
                  :y2="BOARD_PADDING + (r - 1) * CELL_SIZE"
                />
                <line
                  v-for="c in 15"
                  :key="'v_' + c"
                  :x1="BOARD_PADDING + (c - 1) * CELL_SIZE"
                  :y1="BOARD_PADDING"
                  :x2="BOARD_PADDING + (c - 1) * CELL_SIZE"
                  :y2="600 - BOARD_PADDING"
                />
              </g>

              <!-- Star Points -->
              <g :fill="themeStyles.starColor">
                <circle
                  v-for="(sp, idx) in GOMOKU_STAR_POINTS"
                  :key="'sp_' + idx"
                  :cx="getSvgCoord(sp.r, sp.c).cx"
                  :cy="getSvgCoord(sp.r, sp.c).cy"
                  r="4"
                />
              </g>

              <!-- Coordinates Labeling -->
              <g :fill="themeStyles.labelColor" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">
                <text v-for="c in 15" :key="'col_t_' + c" :x="BOARD_PADDING + (c - 1) * CELL_SIZE" y="24">{{ String.fromCharCode(65 + c - 1) }}</text>
                <text v-for="c in 15" :key="'col_b_' + c" :x="BOARD_PADDING + (c - 1) * CELL_SIZE" y="588">{{ String.fromCharCode(65 + c - 1) }}</text>
                <text v-for="r in 15" :key="'row_l_' + r" x="20" :y="BOARD_PADDING + (r - 1) * CELL_SIZE + 4">{{ 16 - r }}</text>
                <text v-for="r in 15" :key="'row_r_' + r" x="580" :y="BOARD_PADDING + (r - 1) * CELL_SIZE + 4">{{ 16 - r }}</text>
              </g>

              <!-- Stones -->
              <g>
                <template v-for="(row, r) in board" :key="'r_' + r">
                  <template v-for="(cell, c) in row" :key="'c_' + c">
                    <g v-if="cell !== 0" :transform="'translate(' + getSvgCoord(r, c).cx + ', ' + getSvgCoord(r, c).cy + ')'">
                      <!-- Stone Shadow -->
                      <circle cx="2" cy="3" r="16" fill="#000000" fill-opacity="0.35" />

                      <!-- Black Stone -->
                      <template v-if="cell === 1">
                        <circle cx="0" cy="0" r="16.5" fill="url(#gomokuBlackStone)" />
                        <ellipse cx="-4" cy="-5" rx="5" ry="2.5" fill="#ffffff" fill-opacity="0.4" transform="rotate(-30, -4, -5)" />
                      </template>

                      <!-- White Stone -->
                      <template v-else>
                        <circle cx="0" cy="0" r="16.5" fill="url(#gomokuWhiteStone)" stroke="#cbd5e1" stroke-width="0.8" />
                        <ellipse cx="-4" cy="-5" rx="5" ry="2.5" fill="#ffffff" fill-opacity="0.85" transform="rotate(-30, -4, -5)" />
                      </template>
                    </g>
                  </template>
                </template>
              </g>

              <!-- Last Move Indicator Marker -->
              <g v-if="lastMove" :transform="'translate(' + getSvgCoord(lastMove.r, lastMove.c).cx + ', ' + getSvgCoord(lastMove.r, lastMove.c).cy + ')'">
                <circle cx="0" cy="0" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" class="animate-ping" />
                <circle cx="0" cy="0" r="3.5" fill="#ef4444" />
              </g>

              <defs>
                <radialGradient id="gomokuBlackStone" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stop-color="#64748b" />
                  <stop offset="35%" stop-color="#1e293b" />
                  <stop offset="100%" stop-color="#020617" />
                </radialGradient>
                <radialGradient id="gomokuWhiteStone" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="65%" stop-color="#f8fafc" />
                  <stop offset="100%" stop-color="#cbd5e1" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <!-- Bottom Tip Banner -->
          <div class="mt-3 text-center text-xs sm:text-sm font-bold text-amber-950 flex items-center justify-center gap-2 bg-amber-100/90 border border-amber-300/80 px-5 py-2 rounded-full shadow-2xs">
            <span v-if="isReplayMode">
              🔍 拖动进度条或点击播放按钮分步复盘推演
            </span>
            <span v-else-if="!isAiThinking">
              👆 点击任意交叉点落子 · 五子连珠获胜！
            </span>
            <span v-else class="text-blue-700 animate-pulse">
              🤖 AI 正在计算最佳连五攻防点...
            </span>
          </div>
        </section>
      </main>

    </div>

    <!-- History Records & Review Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="showHistoryModal = false">
      <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full h-[520px] max-h-[85vh] shadow-2xl border-2 border-slate-200/90 flex flex-col space-y-4 overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shadow-2xs">
              📜
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900">五子棋历史对局与复盘</h3>
              <p class="text-xs text-slate-400">已保存 {{ historyRecords.length }} 局历史对战棋谱</p>
            </div>
          </div>
          <button @click="showHistoryModal = false" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
          <div
            v-for="rec in historyRecords"
            :key="rec.id"
            class="bg-slate-50 hover:bg-amber-50/60 rounded-2xl p-3.5 border border-slate-200/90 hover:border-amber-400 flex items-center justify-between gap-3 transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0" :class="rec.isUserWinner ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'">
                {{ rec.isUserWinner ? '🏆' : '🥈' }}
              </div>
              <div class="flex flex-col gap-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-slate-900">
                    {{ rec.modeName }}
                  </span>
                  <span class="text-xs font-bold text-slate-700">
                    胜者: {{ rec.winnerAvatar }} {{ rec.winnerName }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                  <span>总步数: {{ rec.totalMoves }} 步</span>
                  <span>•</span>
                  <span>{{ rec.playedAt }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="startReplay(rec)"
                class="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Play class="w-3.5 h-3.5 fill-white" />
                <span>复盘</span>
              </button>
              <button
                @click="deleteUnifiedGameRecord(rec.id); refreshHistory();"
                class="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 active:scale-95 transition-all cursor-pointer"
                title="删除记录"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-if="historyRecords.length === 0" class="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
            <span class="text-4xl mb-2">📭</span>
            <p class="font-medium">暂无五子棋对局记录</p>
            <p class="text-xs mt-1">完成对局后，棋谱将自动保存于此，支持分步复盘！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Victory Modal -->
    <div v-if="showVictoryModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-300 flex flex-col items-center text-center relative overflow-hidden space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl shadow-sm animate-bounce">
          🏆
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900">五子连珠 · 对局大胜利！</h2>
        <p class="text-xs sm:text-sm text-slate-600">
          恭喜 <strong class="text-amber-600">{{ winner === 1 ? '黑方' : '白方' }}</strong> 达成五子连珠，获得对决胜利！
        </p>

        <div class="flex items-center gap-3 w-full pt-3">
          <button
            @click="historyRecords.length > 0 && startReplay(historyRecords[0])"
            class="flex-1 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            立即复盘
          </button>
          <button
            @click="initGame(true)"
            class="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            再来一局
          </button>
        </div>
      </div>
    </div>

    <!-- Rules Modal -->
    <div v-if="showRulesModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="showRulesModal = false">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-slate-200 flex flex-col space-y-3.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📖</span>
            <h3 class="text-base sm:text-lg font-black text-slate-900">五子棋快速规则</h3>
          </div>
          <button @click="showRulesModal = false" class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2.5 text-xs sm:text-sm text-slate-600">
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-blue-800">1. 基本规则：</strong> 黑先白后，双方轮流在 15×15 棋盘交叉点落一子。
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-amber-800">2. 胜利条件：</strong> 横、竖、斜任意方向率先连成 5 颗同色棋子者获胜！
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-emerald-800">3. 核心攻防：</strong> 抢先制造“活三”与“冲四”，逼迫对手防守并形成双杀必胜局面！
          </div>
        </div>

        <button @click="showRulesModal = false" class="mt-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs sm:text-sm cursor-pointer">
          我明白了，开始下棋！
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
