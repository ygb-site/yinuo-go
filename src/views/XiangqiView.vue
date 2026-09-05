<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import confetti from 'canvas-confetti';
import XiangqiBoard from '../components/board/XiangqiBoard.vue';
import {
  XIANGQI_ROWS,
  applyXiangqiMove,
  chooseXiangqiAiMove,
  cloneXiangqiBoard,
  createInitialXiangqiBoard,
  evaluateXiangqiWinRate,
  findKing,
  generateLegalMovesFrom,
  getPositionStatus,
  oppositeSide,
  replayXiangqiMoves,
  type XiangqiBoard as XiangqiBoardState,
  type XiangqiLegalMove,
  type XiangqiMove,
  type XiangqiSide
} from '../engine/xiangqi/xiangqiEngine';
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
  BookOpen,
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

const route = useRoute();
const router = useRouter();

const STORAGE_KEY = 'yinuo_active_xiangqi';

const board = ref<XiangqiBoardState>(createInitialXiangqiBoard());
const currentTurn = ref<XiangqiSide>('red');
const selected = ref<{ r: number; c: number } | null>(null);
const lastMove = ref<{ fromR: number; fromC: number; toR: number; toC: number } | null>(null);
const hintMove = ref<XiangqiLegalMove | null>(null);
const winner = ref<XiangqiSide | null>(null);
const status = ref<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing');

const gameStartTime = ref(Date.now());
const moveHistory = ref<XiangqiMove[]>([]);
const winRateHistory = ref<WinRatePoint[]>([]);

const isReplayMode = ref(false);
const currentReplayGame = ref<UnifiedGameRecord | null>(null);
const replayStepIndex = ref(0);
const isReplayAutoPlaying = ref(false);
const replaySpeed = ref(1);
let replayTimer: ReturnType<typeof setTimeout> | null = null;

const showVictoryModal = ref(false);
const showRulesModal = ref(false);
const showHistoryModal = ref(false);
const showMoveListDrawer = ref(false);
const historyRecords = ref<UnifiedGameRecord[]>([]);

const isMuted = ref(checkersAudio.isMuted);
const toggleAudio = () => {
  isMuted.value = !isMuted.value;
  checkersAudio.isMuted = isMuted.value;
};

const currentWinRate = computed(() => evaluateXiangqiWinRate(board.value));

const legalTargets = computed(() => {
  if (!selected.value || winner.value || isReplayMode.value) return [];
  return generateLegalMovesFrom(board.value, selected.value.r, selected.value.c);
});

const checkedKing = computed(() => {
  if (status.value !== 'check' && status.value !== 'checkmate') return null;
  return findKing(board.value, currentTurn.value);
});

const refreshHistory = () => {
  historyRecords.value = getLocalGameRecords('xiangqi');
};

const saveXiangqiState = () => {
  if (typeof window === 'undefined') return;
  if (isReplayMode.value) return;
  if (winner.value || moveHistory.value.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const payload = {
    board: cloneXiangqiBoard(board.value),
    currentTurn: currentTurn.value,
    lastMove: lastMove.value,
    moveHistory: moveHistory.value,
    winRateHistory: winRateHistory.value,
    gameStartTime: gameStartTime.value,
    status: status.value
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
};

const restoreXiangqiState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.moveHistory) || data.moveHistory.length === 0) return false;
    if (!Array.isArray(data.board) || data.board.length !== XIANGQI_ROWS) return false;

    board.value = data.board.map((row: XiangqiBoardState[number]) =>
      row.map((cell) => (cell ? { ...cell } : null))
    );
    currentTurn.value = data.currentTurn === 'black' ? 'black' : 'red';
    lastMove.value = data.lastMove || null;
    moveHistory.value = data.moveHistory;
    winRateHistory.value = Array.isArray(data.winRateHistory) ? data.winRateHistory : [];
    gameStartTime.value = typeof data.gameStartTime === 'number' ? data.gameStartTime : Date.now();
    winner.value = null;
    status.value = data.status === 'check' ? 'check' : 'playing';
    selected.value = null;
    hintMove.value = null;
    return true;
  } catch {
    return false;
  }
};

const stopReplayAutoPlay = () => {
  isReplayAutoPlaying.value = false;
  if (replayTimer) {
    clearTimeout(replayTimer);
    replayTimer = null;
  }
};

const initGame = (isFresh = false) => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  selected.value = null;
  hintMove.value = null;

  if (!isFresh && restoreXiangqiState()) {
    showVictoryModal.value = false;
    refreshHistory();
    showAlert({
      title: '✨ 棋局已自动恢复',
      message: '小诺已为你找回刚才未下完的象棋，请继续对弈吧！',
      type: 'success',
      confirmText: '继续对弈 🚀'
    });
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  board.value = createInitialXiangqiBoard();
  currentTurn.value = 'red';
  lastMove.value = null;
  winner.value = null;
  status.value = 'playing';
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
};

const executeMove = (fromR: number, fromC: number, toR: number, toC: number) => {
  const moving = board.value[fromR][fromC];
  if (!moving) return;

  const applied = applyXiangqiMove(board.value, fromR, fromC, toR, toC);
  if (!applied) return;

  const wrBefore = winRateHistory.value[winRateHistory.value.length - 1]?.player1WinRate || 50;
  board.value = applied.board;
  lastMove.value = { fromR, fromC, toR, toC };
  selected.value = null;
  hintMove.value = null;
  checkersAudio.playStep();

  const wrCurrent = evaluateXiangqiWinRate(board.value);
  const wrAfter = wrCurrent.redWinRate;
  const delta = moving.side === 'red' ? wrAfter - wrBefore : wrBefore - wrAfter;
  const nextSide = oppositeSide(moving.side);
  const nextStatus = getPositionStatus(board.value, nextSide);
  status.value = nextStatus;

  const moveRecord: XiangqiMove = {
    fromR,
    fromC,
    toR,
    toC,
    piece: { ...moving },
    captured: applied.captured,
    stepIndex: moveHistory.value.length + 1,
    notation: applied.notation,
    redWinRate: wrCurrent.redWinRate,
    blackWinRate: wrCurrent.blackWinRate,
    delta,
    timestamp: Date.now()
  };
  moveHistory.value.push(moveRecord);
  winRateHistory.value.push({
    stepIndex: moveRecord.stepIndex,
    player1WinRate: wrCurrent.redWinRate,
    player2WinRate: wrCurrent.blackWinRate,
    delta,
    comment: applied.notation
  });

  if (nextStatus === 'checkmate' || nextStatus === 'stalemate') {
    winner.value = moving.side;
    triggerVictory(moving.side, nextStatus);
    return;
  }

  currentTurn.value = nextSide;
  saveXiangqiState();
};

const triggerVictory = (side: XiangqiSide, endStatus: 'checkmate' | 'stalemate') => {
  localStorage.removeItem(STORAGE_KEY);
  showVictoryModal.value = true;
  checkersAudio.playVictory();

  try {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });
  } catch {}

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const winnerName = side === 'red' ? '红方' : '黑方';

  const record: UnifiedGameRecord = {
    id: 'xiangqi_' + Date.now(),
    gameType: 'xiangqi',
    gameTypeName: '中国象棋',
    mode: 'twoPlayer',
    modeName: '亲子同屏',
    title: `${dateStr} · 中国象棋`,
    playedAt: dateStr,
    createdAt: Date.now(),
    winnerName,
    winnerAvatar: side === 'red' ? '🔴' : '⚫',
    winnerPlayerId: side,
    isUserWinner: side === 'red',
    totalMoves: moveHistory.value.length,
    durationSeconds: Math.round((Date.now() - gameStartTime.value) / 1000),
    metadata: { endStatus },
    moves: [...moveHistory.value],
    winRateHistory: [...winRateHistory.value]
  };

  saveUnifiedGameRecord(record);
  refreshHistory();
};

const onPointClick = (r: number, c: number) => {
  if (winner.value || isReplayMode.value) return;

  const cell = board.value[r][c];
  if (selected.value) {
    const dest = legalTargets.value.find((m) => m.toR === r && m.toC === c);
    if (dest) {
      executeMove(dest.fromR, dest.fromC, dest.toR, dest.toC);
      return;
    }
    if (cell && cell.side === currentTurn.value) {
      selected.value = { r, c };
      hintMove.value = null;
      checkersAudio.playSelect();
      return;
    }
    selected.value = null;
    return;
  }

  if (!cell || cell.side !== currentTurn.value) return;
  selected.value = { r, c };
  hintMove.value = null;
  checkersAudio.playSelect();
};

const undoMove = () => {
  if (isReplayMode.value || moveHistory.value.length === 0 || winner.value) return;

  checkersAudio.playUndo();
  const undoCount = 1;
  const remain = moveHistory.value.slice(0, -undoCount);
  moveHistory.value = remain;
  winRateHistory.value = winRateHistory.value.slice(0, remain.length + 1);
  board.value = replayXiangqiMoves(remain);
  currentTurn.value = remain.length % 2 === 0 ? 'red' : 'black';
  const prev = remain[remain.length - 1];
  lastMove.value = prev
    ? { fromR: prev.fromR, fromC: prev.fromC, toR: prev.toR, toC: prev.toC }
    : null;
  winner.value = null;
  status.value = getPositionStatus(board.value, currentTurn.value);
  selected.value = null;
  hintMove.value = null;
  saveXiangqiState();
};

const provideHint = () => {
  if (winner.value || isReplayMode.value) return;
  const best = chooseXiangqiAiMove(board.value, currentTurn.value, 'hard');
  if (!best) return;
  checkersAudio.playSelect();
  selected.value = { r: best.fromR, c: best.fromC };
  hintMove.value = best;
};

const startReplay = (rec: UnifiedGameRecord) => {
  showVictoryModal.value = false;
  showHistoryModal.value = false;
  isReplayMode.value = true;
  currentReplayGame.value = rec;
  replayStepIndex.value = 0;
  isReplayAutoPlaying.value = false;
  selected.value = null;
  hintMove.value = null;
  winner.value = null;
  board.value = createInitialXiangqiBoard();
  lastMove.value = null;
  checkersAudio.playSelect();
};

const seekReplayStep = (step: number) => {
  if (!currentReplayGame.value) return;
  const moves = currentReplayGame.value.moves as XiangqiMove[];
  const clamped = Math.max(0, Math.min(moves.length, step));
  replayStepIndex.value = clamped;
  board.value = replayXiangqiMoves(moves, clamped);
  const cur = clamped > 0 ? moves[clamped - 1] : null;
  lastMove.value = cur
    ? { fromR: cur.fromR, fromC: cur.fromC, toR: cur.toR, toC: cur.toC }
    : null;
  if (clamped > 0) checkersAudio.playStep();
};

const toggleReplayAutoPlay = () => {
  if (isReplayAutoPlaying.value) {
    stopReplayAutoPlay();
    return;
  }
  isReplayAutoPlaying.value = true;
  runReplayAutoLoop();
};

const runReplayAutoLoop = () => {
  if (!isReplayAutoPlaying.value || !currentReplayGame.value) return;
  const moves = currentReplayGame.value.moves as XiangqiMove[];
  if (replayStepIndex.value >= moves.length) {
    stopReplayAutoPlay();
    return;
  }
  seekReplayStep(replayStepIndex.value + 1);
  replayTimer = setTimeout(runReplayAutoLoop, Math.round(800 / replaySpeed.value));
};

const forkPlayFromHere = () => {
  if (!currentReplayGame.value) return;
  const rec = currentReplayGame.value;
  const moves = (rec.moves as XiangqiMove[]).slice(0, replayStepIndex.value);
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  moveHistory.value = [...moves];
  winRateHistory.value = (rec.winRateHistory as WinRatePoint[]).slice(0, moves.length + 1);
  board.value = replayXiangqiMoves(moves);
  currentTurn.value = moves.length % 2 === 0 ? 'red' : 'black';
  winner.value = null;
  status.value = getPositionStatus(board.value, currentTurn.value);
  const prev = moves[moves.length - 1];
  lastMove.value = prev
    ? { fromR: prev.fromR, fromC: prev.fromC, toR: prev.toR, toC: prev.toC }
    : null;
  selected.value = null;
  hintMove.value = null;
  checkersAudio.playSelect();
};

const exitReplayMode = () => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  initGame(true);
};

const currentReplayMove = computed<XiangqiMove | null>(() => {
  if (!isReplayMode.value || !currentReplayGame.value || replayStepIndex.value === 0) return null;
  const moves = currentReplayGame.value.moves as XiangqiMove[];
  return moves[replayStepIndex.value - 1] || null;
});

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

const statusBanner = computed(() => {
  if (isReplayMode.value) return '拖动进度条，一步步回看这盘棋';
  if (status.value === 'check') return currentTurn.value === 'red' ? '红帅被将军！快应将' : '黑将被将军！快应将';
  if (currentTurn.value === 'red') return '先点己方棋子，再点要走的交叉点';
  return '轮到黑方走棋';
});

onMounted(() => {
  void route.query;
  initGame();
});

onUnmounted(() => {
  stopReplayAutoPlay();
});
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] bg-[#F8F6F2] py-3 sm:py-5 lg:py-6 px-2.5 sm:px-5 lg:px-6 select-none font-sans">
    <div class="max-w-7xl mx-auto space-y-3 sm:space-y-4">
      <div class="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg border border-rose-200 shrink-0">
            🐴
          </div>
          <div class="flex items-center gap-1.5 min-w-0 truncate">
            <h2 class="text-sm sm:text-base font-black text-slate-900 truncate">中国象棋 <span class="text-[10px] sm:text-xs font-bold text-slate-400">Xiangqi</span></h2>
            <span
              class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap"
              :class="isReplayMode ? 'bg-cyan-100 text-cyan-800 animate-pulse' : 'bg-rose-50 text-rose-800 border border-rose-200'"
            >
              {{ isReplayMode ? ('复盘 (' + replayStepIndex + '/' + ((currentReplayGame?.moves as XiangqiMove[])?.length || 0) + ')') : '亲子同屏' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            v-if="isReplayMode"
            type="button"
            class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            @click="exitReplayMode"
          >
            <X class="w-3.5 h-3.5" />
            <span>退出复盘</span>
          </button>

          <template v-else>
            <button
              type="button"
              class="px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-all cursor-pointer active:scale-95"
              :disabled="!!winner"
              @click="provideHint"
            >
              <Lightbulb class="w-3.5 h-3.5 fill-current" />
              <span>提示</span>
            </button>
            <button
              type="button"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-200/80 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
              :disabled="moveHistory.length === 0 || !!winner"
              @click="undoMove"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>悔棋</span>
            </button>
            <button
              type="button"
              class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
              title="重新开始"
              @click="initGame(true)"
            >
              <RefreshCw class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs sm:text-sm flex items-center gap-1 border border-indigo-200 transition-all cursor-pointer active:scale-95"
              title="对局记录与复盘"
              @click="showHistoryModal = true"
            >
              <History class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">记录</span>
              <span v-if="historyRecords.length > 0" class="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black">
                {{ historyRecords.length }}
              </span>
            </button>
            <button
              type="button"
              class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
              title="玩法规则"
              @click="showRulesModal = true"
            >
              <HelpCircle class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer active:scale-95 hidden sm:flex"
              @click="toggleAudio"
            >
              <Volume2 v-if="!isMuted" class="w-4 h-4 text-emerald-600" />
              <VolumeX v-else class="w-4 h-4 text-slate-400" />
            </button>
          </template>
        </div>
      </div>

      <main class="flex-1 flex flex-col lg:flex-row items-start gap-4 sm:gap-6 w-full">
        <section class="w-full lg:w-80 flex flex-col gap-3.5 order-2 shrink-0">
          <div v-if="isReplayMode && currentReplayGame" class="bg-white rounded-3xl p-5 border-2 border-cyan-400/80 shadow-2xs flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-cyan-800 flex items-center gap-1.5">
                <History class="w-4 h-4 text-cyan-600" />
                <span>智能复盘推演</span>
              </span>
              <span class="text-xs font-mono font-bold text-slate-500">
                {{ replayStepIndex }} / {{ ((currentReplayGame?.moves as XiangqiMove[])?.length || 0) }} 步
              </span>
            </div>
            <input
              type="range"
              min="0"
              :max="((currentReplayGame?.moves as XiangqiMove[])?.length || 0)"
              :value="replayStepIndex"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              @input="seekReplayStep(Number(($event.target as HTMLInputElement).value))"
            >
            <div class="grid grid-cols-5 gap-1.5 items-center">
              <button type="button" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer" :disabled="replayStepIndex === 0" @click="seekReplayStep(0)">
                <SkipBack class="w-4 h-4" />
              </button>
              <button type="button" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer" :disabled="replayStepIndex === 0" @click="seekReplayStep(replayStepIndex - 1)">
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button type="button" class="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer" @click="toggleReplayAutoPlay">
                <Pause v-if="isReplayAutoPlaying" class="w-5 h-5" />
                <Play v-else class="w-5 h-5 fill-white" />
              </button>
              <button type="button" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer" :disabled="replayStepIndex >= ((currentReplayGame?.moves as XiangqiMove[])?.length || 0)" @click="seekReplayStep(replayStepIndex + 1)">
                <ChevronRight class="w-5 h-5" />
              </button>
              <button type="button" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer" :disabled="replayStepIndex >= ((currentReplayGame?.moves as XiangqiMove[])?.length || 0)" @click="seekReplayStep(((currentReplayGame?.moves as XiangqiMove[])?.length || 0))">
                <SkipForward class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              class="w-full py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              @click="forkPlayFromHere"
            >
              <Sparkles class="w-4 h-4 text-amber-600" />
              <span>从此步接盘继续下</span>
            </button>
          </div>

          <template v-else>
            <div class="bg-white rounded-2xl p-1.5 border-2 border-slate-200/90 shadow-2xs grid grid-cols-2 gap-1.5">
              <button
                type="button"
                class="py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-rose-50 text-rose-800 cursor-pointer"
                @click="router.push('/xiangqi')"
              >
                <BookOpen class="w-4 h-4" />
                <span>学堂</span>
              </button>
              <button
                type="button"
                class="py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-amber-50 text-amber-800 cursor-pointer"
                @click="router.push('/xiangqi/endgame')"
              >
                <Puzzle class="w-4 h-4" />
                <span>残局</span>
              </button>
            </div>

            <div class="bg-white rounded-2xl py-2 px-1 border-2 border-slate-200/90 shadow-2xs">
              <div class="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-purple-600 text-white shadow-xs">
                <Users class="w-4 h-4" />
                <span>亲子同屏</span>
              </div>
            </div>

            <div class="bg-white rounded-3xl p-5 border-2 border-slate-200/90 shadow-2xs space-y-4">
              <div
                class="p-3.5 rounded-2xl border-2 transition-all"
                :class="currentTurn === 'red' ? 'bg-rose-50 text-rose-950 border-rose-300 shadow-xs' : 'bg-slate-900 text-white border-slate-800 shadow-xs'"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded-full border-2" :class="currentTurn === 'red' ? 'bg-rose-600 border-white' : 'bg-slate-800 border-slate-400'" />
                    <span class="font-black text-sm">{{ currentTurn === 'red' ? '红方回合 (先行)' : '黑方回合' }}</span>
                  </div>
                  <span class="text-xs font-mono opacity-80">已下 {{ moveHistory.length }} 手</span>
                </div>
                <p v-if="status === 'check'" class="text-xs font-bold mt-2 text-amber-700">正在被将军，必须应将！</p>
              </div>

              <button
                type="button"
                class="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between border border-slate-200 transition-all cursor-pointer"
                @click="showMoveListDrawer = !showMoveListDrawer"
              >
                <span class="flex items-center gap-1.5">
                  <ListOrdered class="w-4 h-4 text-rose-600" />
                  <span>棋谱步骤 ({{ moveHistory.length }} 手)</span>
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
                  <span class="flex-1">{{ m.notation }}</span>
                </div>
              </div>
            </div>
          </template>

          <div class="bg-white rounded-3xl p-4 border-2 border-slate-200/90 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800">
              <span class="flex items-center gap-1.5 text-rose-700">
                <Sparkles class="w-4 h-4 text-amber-500" />
                <span>局势评估</span>
              </span>
              <div class="flex items-center gap-2 font-mono text-[11px]">
                <span class="text-rose-700 font-bold">红: {{ isReplayMode && currentReplayMove ? currentReplayMove.redWinRate : currentWinRate.redWinRate }}%</span>
                <span class="text-slate-700 font-bold">黑: {{ isReplayMode && currentReplayMove ? currentReplayMove.blackWinRate : currentWinRate.blackWinRate }}%</span>
              </div>
            </div>
            <div class="w-full h-16 bg-slate-50 rounded-xl p-1.5 border border-slate-200 relative overflow-hidden flex items-center justify-center">
              <div class="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-300" />
              <svg viewBox="0 0 280 70" class="w-full h-full overflow-visible">
                <polyline
                  v-if="getWinRatePoints"
                  :points="getWinRatePoints"
                  fill="none"
                  stroke="#e11d48"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <p class="text-[11px] text-slate-500 font-medium">{{ currentWinRate.statusText }}</p>
          </div>
        </section>

        <section class="flex-1 flex flex-col items-center justify-start relative w-full order-1 min-w-0">
          <div class="bg-white rounded-3xl p-3 sm:p-5 border-2 border-slate-200/90 shadow-sm flex flex-col items-center justify-center relative w-full max-w-[min(96vw,640px)]">
            <XiangqiBoard
              :board="board"
              :selected="selected"
              :last-move="lastMove"
              :legal-targets="legalTargets"
              :hint-move="hintMove"
              :checked-king="checkedKing"
              :disabled="!!winner || isReplayMode"
              @point-click="onPointClick"
            />
          </div>

          <div class="mt-3 text-center text-xs sm:text-sm font-bold text-amber-950 flex items-center justify-center gap-2 bg-amber-100/90 border border-amber-300/80 px-5 py-2 rounded-full shadow-2xs">
            {{ statusBanner }}
          </div>
        </section>
      </main>
    </div>

    <div
      v-if="showHistoryModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="showHistoryModal = false"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full h-[520px] max-h-[85vh] shadow-2xl border-2 border-slate-200/90 flex flex-col space-y-4 overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shadow-2xs">📜</div>
            <div>
              <h3 class="text-lg font-black text-slate-900">象棋历史对局与复盘</h3>
              <p class="text-xs text-slate-400">已保存 {{ historyRecords.length }} 局棋谱</p>
            </div>
          </div>
          <button type="button" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer" @click="showHistoryModal = false">
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
                  <span class="text-xs font-black text-slate-900">{{ rec.modeName }}</span>
                  <span class="text-xs font-bold text-slate-700">胜者: {{ rec.winnerAvatar }} {{ rec.winnerName }}</span>
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
                type="button"
                class="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                @click="startReplay(rec)"
              >
                <Play class="w-3.5 h-3.5 fill-white" />
                <span>复盘</span>
              </button>
              <button
                type="button"
                class="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 active:scale-95 transition-all cursor-pointer"
                title="删除记录"
                @click="deleteUnifiedGameRecord(rec.id); refreshHistory();"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-if="historyRecords.length === 0" class="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
            <span class="text-4xl mb-2">📭</span>
            <p class="font-medium">暂无象棋对局记录</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showVictoryModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-300 flex flex-col items-center text-center relative overflow-hidden space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl shadow-sm animate-bounce">🏆</div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900">{{ status === 'stalemate' ? '困毙取胜' : '将死获胜' }}</h2>
        <p class="text-xs sm:text-sm text-slate-600">
          恭喜 <strong class="text-rose-600">{{ winner === 'red' ? '红方' : '黑方' }}</strong>
          {{ status === 'stalemate' ? '把对方困住，无子可走！' : '将死对方，赢下这盘象棋！' }}
        </p>
        <div class="flex items-center gap-3 w-full pt-3">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            @click="historyRecords.length > 0 && startReplay(historyRecords[0])"
          >
            立即复盘
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            @click="initGame(true)"
          >
            再来一局
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showRulesModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="showRulesModal = false"
    >
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-slate-200 flex flex-col space-y-3.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📖</span>
            <h3 class="text-base sm:text-lg font-black text-slate-900">中国象棋快速规则</h3>
          </div>
          <button type="button" class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer" @click="showRulesModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-2.5 text-xs sm:text-sm text-slate-600">
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-rose-800">1. 走法：</strong>红先黑后。车直行、马走日、象走田、士斜走九宫、炮翻山吃子、兵过河才能横走。
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-amber-800">2. 将军：</strong>走完后如果能下一步吃掉对方将/帅，就是将军。被将的一方必须应将。
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-emerald-800">3. 胜负：</strong>将死对方，或把对方走成无子可走（困毙），即获胜。两帅不能隔空对面。
          </div>
        </div>
        <button type="button" class="mt-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs sm:text-sm cursor-pointer" @click="showRulesModal = false">
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
