<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import confetti from 'canvas-confetti';
import {
  BOARD_NODES,
  NODE_MAP,
  CAMPS,
  NODE_CAMP_MAP,
  getLegalMoves,
  chooseAiMove,
  checkPlayerWin,
  getPlayerGoalCount,
  evaluateCheckersWinRate,
  PUZZLE_LEVELS,
  BOARD_GRID_LINES,
  type MoveOption,
  type CampId,
  type PlayerConfig
} from '../engine/checkers/checkersEngine';
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
  Zap,
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
  ListOrdered,
  Maximize2,
  Minimize2
} from 'lucide-vue-next';

const router = useRouter();

// Game Modes
type Mode = 'ai' | 'twoPlayer' | 'multiPlayer' | 'puzzle';
const currentMode = ref<Mode>('ai');
const isImmersiveMode = ref<boolean>(false);

// Themes: 'galaxy' | 'wood' | 'candy'
const currentTheme = ref<'galaxy' | 'wood' | 'candy'>('galaxy');

// AI Difficulty & Speed
const aiDifficulty = ref<'easy' | 'medium' | 'hard'>('easy');
const aiSpeed = ref<'normal' | 'fast' | 'slow'>('normal');

// Board State: Map of nodeId -> playerId (1..6)
const boardState = ref<Record<string, number>>({});
const initialBoardState = ref<Record<string, number>>({});

// Current Turn: Player ID
const currentTurn = ref<number>(1);
const isAiThinking = ref<boolean>(false);
const isAnimating = ref<boolean>(false);

// Active Selection & Legal Moves
const selectedNodeId = ref<string | null>(null);
const availableMoves = ref<MoveOption[]>([]);
const hoveredMove = ref<MoveOption | null>(null);

// Hint Move Highlight
const hintMove = ref<{ fromId: string; move: MoveOption } | null>(null);

// Animation Marble position override during hop
const animatingMarble = ref<{
  playerId: number;
  x: number;
  y: number;
  scale: number;
} | null>(null);

// History for Undo
interface HistoryRecord {
  boardState: Record<string, number>;
  currentTurn: number;
}
const moveHistory = ref<HistoryRecord[]>([]);

// Live Move Log & Win-rate Curve History
interface LiveCheckersMove {
  stepIndex: number;
  playerId: number;
  playerName: string;
  playerAvatar: string;
  fromId: string;
  toId: string;
  path: string[];
  isJump: boolean;
  hops: number;
  player1WinRate: number;
  player2WinRate: number;
  comment: string;
  timestamp: number;
  boardStateAfter: Record<string, number>;
}

const liveMoveLogs = ref<LiveCheckersMove[]>([]);
const winRateHistory = ref<WinRatePoint[]>([]);
const gameStartTime = ref<number>(Date.now());

// Statistics
const turnCount = ref<number>(0);
const bestComboHops = ref<number>(0);

// Victory & Modals State
const winner = ref<PlayerConfig | null>(null);
const showVictoryModal = ref<boolean>(false);
const showRulesModal = ref<boolean>(false);
const showHistoryModal = ref<boolean>(false);
const showMoveListDrawer = ref<boolean>(false);

// Replay State
const isReplayMode = ref<boolean>(false);
const currentReplayGame = ref<UnifiedGameRecord | null>(null);
const replayStepIndex = ref<number>(0);
const isReplayAutoPlaying = ref<boolean>(false);
const replaySpeed = ref<number>(1);
let replayTimer: ReturnType<typeof setTimeout> | null = null;

// Puzzle Challenge State
const currentPuzzleIndex = ref<number>(0);
const puzzleCompleted = ref<boolean>(false);

// History Records
const historyRecords = ref<UnifiedGameRecord[]>([]);

// Player Definitions
const ALL_PLAYERS_DEF: Record<number, PlayerConfig> = {
  1: {
    id: 1,
    campId: 3, // South
    targetCampId: 0, // North
    name: '你 (红玛瑙)',
    avatar: '👦',
    colorName: '红玛瑙',
    colorHex: '#ef4444',
    darkColorHex: '#b91c1c',
    glowColor: '#f87171',
    isAi: false
  },
  2: {
    id: 2,
    campId: 0, // North
    targetCampId: 3, // South
    name: '萌宝小贝',
    avatar: '🐼',
    colorName: '蓝宝石',
    colorHex: '#3b82f6',
    darkColorHex: '#1d4ed8',
    glowColor: '#60a5fa',
    isAi: true,
    aiDifficulty: 'easy'
  },
  3: {
    id: 3,
    campId: 1, // NE
    targetCampId: 4, // SW
    name: '翡翠绿',
    avatar: '🐸',
    colorName: '翡翠绿',
    colorHex: '#10b981',
    darkColorHex: '#047857',
    glowColor: '#34d399',
    isAi: true
  },
  4: {
    id: 4,
    campId: 4, // SW
    targetCampId: 1, // NE
    name: '金琥珀',
    avatar: '🐥',
    colorName: '金琥珀',
    colorHex: '#f59e0b',
    darkColorHex: '#b45309',
    glowColor: '#fbbf24',
    isAi: true
  },
  5: {
    id: 5,
    campId: 5, // NW
    targetCampId: 2, // SE
    name: '紫水晶',
    avatar: '🦄',
    colorName: '紫水晶',
    colorHex: '#a855f7',
    darkColorHex: '#7e22ce',
    glowColor: '#c084fc',
    isAi: true
  },
  6: {
    id: 6,
    campId: 2, // SE
    targetCampId: 5, // NW
    name: '珊瑚粉',
    avatar: '🌸',
    colorName: '珊瑚粉',
    colorHex: '#ec4899',
    darkColorHex: '#be185d',
    glowColor: '#f472b6',
    isAi: true
  }
};

// Active Players
const activePlayers = ref<PlayerConfig[]>([]);

// Audio Mute toggle
const isMuted = ref(checkersAudio.isMuted);
const toggleAudio = () => {
  isMuted.value = !isMuted.value;
  checkersAudio.isMuted = isMuted.value;
};

// SVG Board Geometry
const scale = 43.5;
const NODE_SIZE = 18;
const MARBLE_RADIUS = 16.5;

const getSvgCoord = (x: number, y: number) => {
  return {
    cx: +(350 + x * scale).toFixed(1),
    cy: +(350 + y * scale).toFixed(1)
  };
};

const defaultPlayer: PlayerConfig = ALL_PLAYERS_DEF[1];

const currentPlayer = computed<PlayerConfig>(() => {
  return activePlayers.value.find(p => p.id === currentTurn.value) || activePlayers.value[0] || defaultPlayer;
});

const getPlayerProgress = (player?: PlayerConfig | null) => {
  if (!player) return { count: 0, percent: 0 };
  const count = getPlayerGoalCount(player.id, player.targetCampId, boardState.value);
  return {
    count,
    percent: Math.round((count / 10) * 100)
  };
};

// Live Win Rate
const currentLiveWinRate = computed(() => {
  if (activePlayers.value.length < 2) return { p1WinRate: 50, p2WinRate: 50, statusText: '进行中' };
  return evaluateCheckersWinRate(boardState.value, activePlayers.value[0], activePlayers.value[1]);
});

const refreshHistory = () => {
  historyRecords.value = getLocalGameRecords('checkers');
};

// Initialize Game
const initGame = () => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  selectedNodeId.value = null;
  availableMoves.value = [];
  hoveredMove.value = null;
  hintMove.value = null;
  winner.value = null;
  showVictoryModal.value = false;
  turnCount.value = 0;
  bestComboHops.value = 0;
  moveHistory.value = [];
  liveMoveLogs.value = [];
  winRateHistory.value = [{
    stepIndex: 0,
    player1WinRate: 50,
    player2WinRate: 50,
    delta: 0,
    comment: '开局阵型'
  }];
  animatingMarble.value = null;
  gameStartTime.value = Date.now();
  refreshHistory();

  const newState: Record<string, number> = {};

  if (currentMode.value === 'ai') {
    const p1: PlayerConfig = {
      ...ALL_PLAYERS_DEF[1],
      name: '你 (红玛瑙)',
      avatar: '👦',
      isAi: false
    };
    const aiAvatar = aiDifficulty.value === 'easy' ? '🐼' : aiDifficulty.value === 'medium' ? '🦊' : '🐉';
    const aiName = aiDifficulty.value === 'easy' ? '萌宝小贝 (简单)' : aiDifficulty.value === 'medium' ? '智多星小狐 (中等)' : '龙龙大师 (挑战)';
    const p2: PlayerConfig = {
      ...ALL_PLAYERS_DEF[2],
      name: aiName,
      avatar: aiAvatar,
      isAi: true,
      aiDifficulty: aiDifficulty.value
    };
    activePlayers.value = [p1, p2];

    for (const hole of CAMPS[p1.campId]) newState[hole] = p1.id;
    for (const hole of CAMPS[p2.campId]) newState[hole] = p2.id;
  } else if (currentMode.value === 'twoPlayer') {
    const p1: PlayerConfig = {
      ...ALL_PLAYERS_DEF[1],
      name: '玩家1 (红方)',
      avatar: '🔴',
      isAi: false
    };
    const p2: PlayerConfig = {
      ...ALL_PLAYERS_DEF[2],
      name: '玩家2 (蓝方)',
      avatar: '🔵',
      isAi: false
    };
    activePlayers.value = [p1, p2];

    for (const hole of CAMPS[p1.campId]) newState[hole] = p1.id;
    for (const hole of CAMPS[p2.campId]) newState[hole] = p2.id;
  } else if (currentMode.value === 'multiPlayer') {
    activePlayers.value = [
      { ...ALL_PLAYERS_DEF[1], isAi: false },
      { ...ALL_PLAYERS_DEF[2], isAi: true, aiDifficulty: 'easy' },
      { ...ALL_PLAYERS_DEF[3], isAi: true, aiDifficulty: 'easy' },
      { ...ALL_PLAYERS_DEF[4], isAi: true, aiDifficulty: 'easy' },
      { ...ALL_PLAYERS_DEF[5], isAi: true, aiDifficulty: 'easy' },
      { ...ALL_PLAYERS_DEF[6], isAi: true, aiDifficulty: 'easy' }
    ];

    for (const p of activePlayers.value) {
      for (const hole of CAMPS[p.campId]) {
        newState[hole] = p.id;
      }
    }
  } else if (currentMode.value === 'puzzle') {
    loadPuzzle(currentPuzzleIndex.value);
    return;
  }

  boardState.value = newState;
  initialBoardState.value = { ...newState };
  currentTurn.value = activePlayers.value[0].id;
  saveHistoryState();
};

// Load Puzzle Level
const loadPuzzle = (levelIdx: number) => {
  const puzzle = PUZZLE_LEVELS[levelIdx] || PUZZLE_LEVELS[0];
  currentPuzzleIndex.value = levelIdx;
  puzzleCompleted.value = false;
  winner.value = null;
  showVictoryModal.value = false;
  selectedNodeId.value = null;
  availableMoves.value = [];
  hintMove.value = null;
  isReplayMode.value = false;

  activePlayers.value = [
    {
      ...ALL_PLAYERS_DEF[1],
      name: '挑战小勇士',
      avatar: '⭐',
      campId: puzzle.playerCamp,
      targetCampId: puzzle.targetCamp,
      isAi: false
    }
  ];

  boardState.value = { ...puzzle.boardState };
  initialBoardState.value = { ...puzzle.boardState };
  currentTurn.value = 1;
  turnCount.value = 0;
  moveHistory.value = [];
  liveMoveLogs.value = [];
  winRateHistory.value = [{
    stepIndex: 0,
    player1WinRate: 50,
    player2WinRate: 50,
    delta: 0,
    comment: puzzle.title
  }];
  saveHistoryState();

  if (puzzle.activePiece && boardState.value[puzzle.activePiece]) {
    setTimeout(() => {
      onNodeClick(puzzle.activePiece);
    }, 200);
  }
};

const saveHistoryState = () => {
  moveHistory.value.push({
    boardState: { ...boardState.value },
    currentTurn: currentTurn.value
  });
  if (moveHistory.value.length > 50) {
    moveHistory.value.shift();
  }
};

const undoMove = () => {
  if (isAnimating.value || isAiThinking.value || isReplayMode.value || moveHistory.value.length <= 1) return;

  checkersAudio.playUndo();

  if (currentMode.value === 'ai') {
    if (moveHistory.value.length >= 3) {
      moveHistory.value.pop();
      const prev = moveHistory.value.pop();
      if (prev) {
        boardState.value = { ...prev.boardState };
        currentTurn.value = prev.currentTurn;
      }
      liveMoveLogs.value.splice(-2);
      winRateHistory.value.splice(-2);
    } else {
      moveHistory.value.pop();
      const prev = moveHistory.value[0];
      boardState.value = { ...prev.boardState };
      currentTurn.value = prev.currentTurn;
      liveMoveLogs.value = [];
      winRateHistory.value = [winRateHistory.value[0]];
    }
  } else {
    moveHistory.value.pop();
    const prev = moveHistory.value[moveHistory.value.length - 1];
    boardState.value = { ...prev.boardState };
    currentTurn.value = prev.currentTurn;
    liveMoveLogs.value.pop();
    winRateHistory.value.pop();
  }

  selectedNodeId.value = null;
  availableMoves.value = [];
  hintMove.value = null;
  hoveredMove.value = null;
};

const onNodeClick = (nodeId: string) => {
  if (isAnimating.value || isAiThinking.value || winner.value || isReplayMode.value) return;

  const currentP = currentPlayer.value;
  if (currentP.isAi) return;

  const pieceOwner = boardState.value[nodeId];

  if (pieceOwner === currentP.id) {
    selectedNodeId.value = nodeId;
    availableMoves.value = getLegalMoves(nodeId, boardState.value, currentP.campId, currentP.targetCampId);
    hintMove.value = null;
    checkersAudio.playSelect();
    return;
  }

  if (selectedNodeId.value) {
    const move = availableMoves.value.find(m => m.to === nodeId);
    if (move) {
      executeMove(selectedNodeId.value, move);
    } else {
      selectedNodeId.value = null;
      availableMoves.value = [];
      hoveredMove.value = null;
    }
  }
};

const executeMove = async (fromId: string, move: MoveOption) => {
  isAnimating.value = true;
  const currentP = currentPlayer.value;
  const path = move.path;

  if (move.hops > bestComboHops.value) {
    bestComboHops.value = move.hops;
  }

  const tempState = { ...boardState.value };
  delete tempState[fromId];
  boardState.value = tempState;

  for (let i = 0; i < path.length - 1; i++) {
    const startNode = NODE_MAP[path[i]];
    const endNode = NODE_MAP[path[i + 1]];
    const isHop = move.isJump;

    if (isHop) {
      checkersAudio.playHop(i + 1);
    } else {
      checkersAudio.playStep();
    }

    const duration = isHop ? 180 : 140;
    const startTime = performance.now();

    await new Promise<void>(resolve => {
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);

        const curX = startNode.x + (endNode.x - startNode.x) * progress;
        const curY = startNode.y + (endNode.y - startNode.y) * progress;

        const arc = isHop ? Math.sin(progress * Math.PI) * 0.9 : 0;
        const scale = 1 + arc * 0.3;

        animatingMarble.value = {
          playerId: currentP.id,
          x: curX,
          y: curY - arc * 0.6,
          scale
        };

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  animatingMarble.value = null;
  boardState.value[move.to] = currentP.id;

  // Evaluate Win-Rate after move
  const wrBefore = winRateHistory.value[winRateHistory.value.length - 1]?.player1WinRate || 50;
  const wrCurrent = activePlayers.value.length >= 2
    ? evaluateCheckersWinRate(boardState.value, activePlayers.value[0], activePlayers.value[1])
    : { p1WinRate: 50, p2WinRate: 50, statusText: '' };

  const delta = currentP.id === 1 ? (wrCurrent.p1WinRate - wrBefore) : (wrBefore - wrCurrent.p1WinRate);

  let comment = move.isJump ? `完成 ${move.hops} 连跳飞跃` : '单步平稳前行';
  if (move.hops >= 4) comment = '🚀 超级连跳！大步挺进！';

  liveMoveLogs.value.push({
    stepIndex: liveMoveLogs.value.length + 1,
    playerId: currentP.id,
    playerName: currentP.name,
    playerAvatar: currentP.avatar,
    fromId,
    toId: move.to,
    path: [...move.path],
    isJump: move.isJump,
    hops: move.hops,
    player1WinRate: wrCurrent.p1WinRate,
    player2WinRate: wrCurrent.p2WinRate,
    comment,
    timestamp: Date.now(),
    boardStateAfter: { ...boardState.value }
  });

  winRateHistory.value.push({
    stepIndex: liveMoveLogs.value.length,
    player1WinRate: wrCurrent.p1WinRate,
    player2WinRate: wrCurrent.p2WinRate,
    delta,
    quality: move.hops >= 3 ? 'god_move' : move.hops >= 1 ? 'great_move' : 'normal_move',
    qualityBadge: move.hops >= 3 ? '妙手连跳' : move.hops >= 1 ? '好手' : '稳步',
    comment
  });

  if (NODE_CAMP_MAP[move.to] === currentP.targetCampId && NODE_CAMP_MAP[fromId] !== currentP.targetCampId) {
    checkersAudio.playGoalChime();
  }

  selectedNodeId.value = null;
  availableMoves.value = [];
  hoveredMove.value = null;
  hintMove.value = null;
  isAnimating.value = false;
  turnCount.value++;

  saveHistoryState();

  // Check Win / Puzzle Completion
  if (currentMode.value === 'puzzle') {
    const puzzle = PUZZLE_LEVELS[currentPuzzleIndex.value];
    if (move.to === puzzle.targetNodeId) {
      triggerVictory(currentP);
      return;
    }
  } else {
    const hasWon = checkPlayerWin(currentP.id, currentP.targetCampId, boardState.value);
    if (hasWon) {
      triggerVictory(currentP);
      return;
    }
  }

  advanceTurn();
};

const advanceTurn = () => {
  const currentIndex = activePlayers.value.findIndex(p => p.id === currentTurn.value);
  const nextIndex = (currentIndex + 1) % activePlayers.value.length;
  currentTurn.value = activePlayers.value[nextIndex].id;

  const nextPlayer = activePlayers.value[nextIndex];
  if (nextPlayer.isAi) {
    scheduleAiTurn(nextPlayer);
  }
};

const scheduleAiTurn = (aiPlayer: PlayerConfig) => {
  isAiThinking.value = true;
  const delay = aiSpeed.value === 'fast' ? 350 : aiSpeed.value === 'slow' ? 950 : 600;

  setTimeout(() => {
    if (winner.value || isReplayMode.value) {
      isAiThinking.value = false;
      return;
    }

    const aiAction = chooseAiMove(aiPlayer, boardState.value);
    isAiThinking.value = false;

    if (aiAction) {
      executeMove(aiAction.fromId, aiAction.move);
    } else {
      advanceTurn();
    }
  }, delay);
};

const triggerVictory = (p: PlayerConfig) => {
  winner.value = p;
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

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const modeNameMap: Record<Mode, string> = {
    ai: '人机对战',
    twoPlayer: '亲子双人',
    multiPlayer: '6人派对',
    puzzle: '连跳闯关'
  };

  const record: UnifiedGameRecord = {
    id: 'checkers_' + Date.now(),
    gameType: 'checkers',
    gameTypeName: '六角跳棋',
    mode: currentMode.value,
    modeName: modeNameMap[currentMode.value],
    title: `${dateStr} · 快乐跳棋 (${modeNameMap[currentMode.value]})`,
    playedAt: dateStr,
    createdAt: Date.now(),
    winnerName: p.name,
    winnerAvatar: p.avatar,
    winnerPlayerId: p.id,
    isUserWinner: p.id === 1,
    totalMoves: liveMoveLogs.value.length,
    durationSeconds: Math.round((Date.now() - gameStartTime.value) / 1000),
    metadata: {
      bestComboHops: bestComboHops.value,
      aiDifficulty: currentMode.value === 'ai' ? aiDifficulty.value : undefined
    },
    initialState: { ...initialBoardState.value },
    moves: [...liveMoveLogs.value],
    winRateHistory: [...winRateHistory.value]
  };

  saveUnifiedGameRecord(record);
  refreshHistory();
};

// Replay Functions
const startReplay = (record: UnifiedGameRecord) => {
  showVictoryModal.value = false;
  showHistoryModal.value = false;
  isReplayMode.value = true;
  currentReplayGame.value = record;
  replayStepIndex.value = 0;
  isReplayAutoPlaying.value = false;

  boardState.value = record.initialState ? { ...(record.initialState as Record<string, number>) } : {};
  selectedNodeId.value = null;
  availableMoves.value = [];
  hintMove.value = null;
  checkersAudio.playSelect();
};

const seekReplayStep = (step: number) => {
  if (!currentReplayGame.value) return;
  const moves = currentReplayGame.value.moves as LiveCheckersMove[];
  const clamped = Math.max(0, Math.min(moves.length, step));
  replayStepIndex.value = clamped;

  if (clamped === 0) {
    boardState.value = currentReplayGame.value.initialState ? { ...(currentReplayGame.value.initialState as Record<string, number>) } : {};
  } else {
    const m = moves[clamped - 1];
    boardState.value = { ...m.boardStateAfter };
    if (m.isJump) {
      checkersAudio.playHop(m.hops);
    } else {
      checkersAudio.playStep();
    }
  }
};

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
  const moves = currentReplayGame.value.moves as LiveCheckersMove[];
  if (replayStepIndex.value >= moves.length) {
    stopReplayAutoPlay();
    return;
  }

  seekReplayStep(replayStepIndex.value + 1);
  const delay = Math.round(900 / replaySpeed.value);
  replayTimer = setTimeout(runReplayAutoLoop, delay);
};

const forkPlayFromHere = () => {
  if (!currentReplayGame.value) return;
  const currentStep = replayStepIndex.value;
  stopReplayAutoPlay();
  isReplayMode.value = false;

  const moves = (currentReplayGame.value.moves as LiveCheckersMove[]).slice(0, currentStep);
  liveMoveLogs.value = [...moves];
  winRateHistory.value = (currentReplayGame.value.winRateHistory as WinRatePoint[]).slice(0, currentStep + 1);
  turnCount.value = currentStep;

  currentTurn.value = (currentStep % 2 === 0 ? 1 : 2);
  saveHistoryState();
  checkersAudio.playSelect();
};

const exitReplayMode = () => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  initGame();
};

const currentReplayMove = computed<LiveCheckersMove | null>(() => {
  if (!isReplayMode.value || !currentReplayGame.value || replayStepIndex.value === 0) return null;
  const moves = currentReplayGame.value.moves as LiveCheckersMove[];
  return moves[replayStepIndex.value - 1] || null;
});

const provideHint = () => {
  if (isAnimating.value || isAiThinking.value || winner.value || isReplayMode.value) return;
  const currentP = currentPlayer.value;
  if (currentP.isAi) return;

  const bestAi = chooseAiMove({ ...currentP, aiDifficulty: 'hard' }, boardState.value);
  if (bestAi) {
    hintMove.value = bestAi;
    selectedNodeId.value = bestAi.fromId;
    availableMoves.value = getLegalMoves(bestAi.fromId, boardState.value, currentP.campId, currentP.targetCampId);
    checkersAudio.playSelect();
  }
};

// Win Rate Polyline for Checkers
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

const themeStyles = computed(() => {
  if (currentTheme.value === 'galaxy') {
    return {
      bg: 'from-slate-950 via-indigo-950 to-slate-900',
      boardBg: '#0b1120',
      boardBorder: '#38bdf8',
      holeDefault: '#1e293b',
      holeStroke: '#334155',
      gridLine: '#38bdf8'
    };
  } else if (currentTheme.value === 'wood') {
    return {
      bg: 'from-amber-950 via-amber-900 to-amber-950',
      boardBg: '#5c2605',
      boardBorder: '#d97706',
      holeDefault: '#3f1702',
      holeStroke: '#78350f',
      gridLine: '#fbbf24'
    };
  } else {
    return {
      bg: 'from-pink-900 via-purple-900 to-rose-950',
      boardBg: '#3b0764',
      boardBorder: '#f472b6',
      holeDefault: '#2e1065',
      holeStroke: '#581c87',
      gridLine: '#f472b6'
    };
  }
});

const getCampTint = (campId: CampId) => {
  switch (campId) {
    case 0: return 'rgba(59, 130, 246, 0.25)';
    case 1: return 'rgba(16, 185, 129, 0.25)';
    case 2: return 'rgba(236, 72, 153, 0.25)';
    case 3: return 'rgba(239, 68, 68, 0.25)';
    case 4: return 'rgba(245, 158, 11, 0.25)';
    case 5: return 'rgba(168, 85, 247, 0.25)';
    default: return 'transparent';
  }
};

const getTrajectoryPath = (pathIds: string[]) => {
  const pts = pathIds.map(id => {
    const n = NODE_MAP[id];
    return getSvgCoord(n.x, n.y);
  });
  if (pts.length < 2) return '';

  let d = `M ${pts[0].cx} ${pts[0].cy}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const midX = (p1.cx + p2.cx) / 2;
    const midY = (p1.cy + p2.cy) / 2 - 16;
    d += ` Q ${midX} ${midY} ${p2.cx} ${p2.cy}`;
  }
  return d;
};

const switchMode = (mode: Mode) => {
  currentMode.value = mode;
  initGame();
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/learn');
  }
};

// Initialize game immediately during setup
initGame();

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
            ⭐
          </div>
          <h1 class="text-xs sm:text-base md:text-lg font-black tracking-wide bg-gradient-to-r from-amber-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent truncate flex items-center gap-1.5 max-w-[110px] sm:max-w-none">
            <span class="whitespace-nowrap">快乐六角跳棋</span>
            <span v-if="!isReplayMode" class="hidden md:inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-normal whitespace-nowrap">
              少儿益智版
            </span>
            <span v-else class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-bold whitespace-nowrap animate-pulse">
              复盘 ({{ replayStepIndex }}/{{ (currentReplayGame?.moves as any[])?.length || 0 }})
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

          <!-- 棋盘放大/沉浸模式 Button -->
          <button
            @click="isImmersiveMode = !isImmersiveMode"
            class="px-2 sm:px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500/40 text-cyan-200 font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md border border-cyan-400/30 whitespace-nowrap active:scale-95 transition-all"
            :title="isImmersiveMode ? '恢复标准视图' : '超大沉浸棋盘'"
          >
            <Minimize2 v-if="isImmersiveMode" class="w-3.5 h-3.5 text-cyan-300" />
            <Maximize2 v-else class="w-3.5 h-3.5 text-cyan-300" />
            <span class="hidden sm:inline">{{ isImmersiveMode ? '标准' : '放大' }}</span>
          </button>
          <!-- 提示 Button -->
          <button
            @click="provideHint"
            :disabled="isAnimating || isAiThinking || !!winner"
            class="px-2 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
          >
            <Lightbulb class="w-3.5 h-3.5 text-slate-950" />
            <span>提示</span>
          </button>

          <!-- 悔棋 Button -->
          <button
            @click="undoMove"
            :disabled="isAnimating || isAiThinking || moveHistory.length <= 1 || !!winner"
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
            class="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 transition-all shrink-0 hidden sm:flex"
          >
            <Volume2 v-if="!isMuted" class="w-3.5 h-3.5 text-emerald-400" />
            <VolumeX v-else class="w-3.5 h-3.5 text-slate-400" />
          </button>
        </template>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 flex flex-col xl:flex-row items-center justify-center p-2 sm:p-4 gap-4 max-w-7xl mx-auto w-full">
      <!-- Left Control & Status Panel -->
      <section
        v-show="!isImmersiveMode"
        class="w-full xl:w-80 flex flex-col gap-3 order-2 xl:order-1 transition-all duration-300"
      >
        <!-- Replay Control Panel (When in Replay Mode) -->
        <div v-if="isReplayMode && currentReplayGame" class="bg-black/40 backdrop-blur-md rounded-2xl p-4 border-2 border-cyan-500/40 flex flex-col gap-3 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <History class="w-4 h-4" />
              <span>跳棋智能复盘</span>
            </span>
            <span class="text-xs font-mono font-bold text-slate-300">
              {{ replayStepIndex }} / {{ (currentReplayGame?.moves as any[])?.length || 0 }} 步
            </span>
          </div>

          <!-- Scrubbing Slider -->
          <div class="flex flex-col gap-1">
            <input
              type="range"
              min="0"
              :max="(currentReplayGame?.moves as any[])?.length || 0"
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
              :disabled="replayStepIndex >= ((currentReplayGame?.moves as any[])?.length || 0)"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
            <button
              @click="seekReplayStep((currentReplayGame?.moves as any[])?.length || 0)"
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
              <span>从此步接盘</span>
            </button>
          </div>

          <!-- Current Step Explanation -->
          <div v-if="currentReplayMove" class="bg-white/5 rounded-xl p-2.5 border border-white/10 text-xs">
            <div class="flex items-center justify-between font-bold text-slate-200 mb-1">
              <span>{{ currentReplayMove.playerAvatar }} {{ currentReplayMove.playerName }}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-bold">
                {{ currentReplayMove.isJump ? (`🦘 ${currentReplayMove.hops}连跳`) : '单步移动' }}
              </span>
            </div>
            <div class="text-slate-300 leading-relaxed font-mono">
              从 <span class="text-amber-300 font-bold">{{ currentReplayMove.fromId }}</span> ➔ 跳至 <span class="text-cyan-300 font-bold">{{ currentReplayMove.toId }}</span>
            </div>
          </div>
        </div>

        <!-- Normal Mode Tabs (When not in replay) -->
        <template v-else>
          <div class="bg-black/30 backdrop-blur-md rounded-2xl p-1 sm:p-1.5 border border-white/10 grid grid-cols-4 gap-1">
            <button
              @click="switchMode('ai')"
              class="py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col items-center gap-0.5 sm:gap-1 whitespace-nowrap"
              :class="currentMode === 'ai' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
            >
              <Bot class="w-4 h-4" />
              <span>人机对弈</span>
            </button>
            <button
              @click="switchMode('twoPlayer')"
              class="py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col items-center gap-0.5 sm:gap-1 whitespace-nowrap"
              :class="currentMode === 'twoPlayer' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
            >
              <Users class="w-4 h-4" />
              <span>双人同屏</span>
            </button>
            <button
              @click="switchMode('puzzle')"
              class="py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col items-center gap-0.5 sm:gap-1 whitespace-nowrap"
              :class="currentMode === 'puzzle' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
            >
              <Puzzle class="w-4 h-4" />
              <span>连跳闯关</span>
            </button>
            <button
              @click="switchMode('multiPlayer')"
              class="py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col items-center gap-0.5 sm:gap-1 whitespace-nowrap"
              :class="currentMode === 'multiPlayer' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
            >
              <Zap class="w-4 h-4" />
              <span>6人派对</span>
            </button>
          </div>

          <!-- Controls Box -->
          <div class="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
            <!-- AI Mode Settings -->
            <div v-if="currentMode === 'ai'" class="flex flex-col gap-2.5">
              <div class="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>对手难度选择：</span>
                <span class="text-amber-300 font-bold">
                  {{ aiDifficulty === 'easy' ? '🐼 萌宝 (简单)' : aiDifficulty === 'medium' ? '🦊 小狐 (中等)' : '🐉 龙龙 (大师)' }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                <button
                  @click="aiDifficulty = 'easy'; initGame();"
                  class="py-1.5 rounded-xl text-xs font-bold border transition-all"
                  :class="aiDifficulty === 'easy' ? 'bg-blue-500/30 border-blue-400 text-blue-200' : 'bg-white/5 border-white/10 text-slate-400'"
                >
                  🐼 简单
                </button>
                <button
                  @click="aiDifficulty = 'medium'; initGame();"
                  class="py-1.5 rounded-xl text-xs font-bold border transition-all"
                  :class="aiDifficulty === 'medium' ? 'bg-purple-500/30 border-purple-400 text-purple-200' : 'bg-white/5 border-white/10 text-slate-400'"
                >
                  🦊 中等
                </button>
                <button
                  @click="aiDifficulty = 'hard'; initGame();"
                  class="py-1.5 rounded-xl text-xs font-bold border transition-all"
                  :class="aiDifficulty === 'hard' ? 'bg-rose-500/30 border-rose-400 text-rose-200' : 'bg-white/5 border-white/10 text-slate-400'"
                >
                  🐉 大师
                </button>
              </div>
            </div>

            <!-- Puzzle Mode Selector -->
            <div v-if="currentMode === 'puzzle'" class="flex flex-col gap-2">
              <div class="text-xs text-amber-300 font-bold">关卡选择：</div>
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  v-for="(pzl, idx) in PUZZLE_LEVELS"
                  :key="pzl.id"
                  @click="loadPuzzle(idx)"
                  class="w-8 h-8 shrink-0 rounded-xl font-black text-xs flex items-center justify-center border transition-all"
                  :class="currentPuzzleIndex === idx ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' : 'bg-white/10 text-white border-white/10'"
                >
                  {{ idx + 1 }}
                </button>
              </div>
              <div class="bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/20 text-xs">
                <div class="font-bold text-amber-300 mb-0.5">{{ PUZZLE_LEVELS[currentPuzzleIndex]?.title }}</div>
                <div class="text-slate-300 leading-relaxed">{{ PUZZLE_LEVELS[currentPuzzleIndex]?.desc }}</div>
                <div class="mt-1.5 flex items-center gap-1 text-emerald-300 font-bold">
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>目标：{{ PUZZLE_LEVELS[currentPuzzleIndex]?.targetGoalText }}</span>
                </div>
              </div>
            </div>

            <!-- Current Turn Display -->
            <div class="border-t border-white/10 pt-3 flex flex-col gap-2">
              <div class="text-xs text-slate-400 flex items-center justify-between">
                <span>当前执子回合</span>
                <span class="text-slate-400">已走回合: {{ turnCount }}</span>
              </div>
              <div
                class="flex items-center gap-3 p-2.5 rounded-xl border transition-all"
                :style="{
                  backgroundColor: (currentPlayer?.colorHex || '#ef4444') + '22',
                  borderColor: (currentPlayer?.colorHex || '#ef4444') + '66'
                }"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2"
                  :style="{
                    backgroundColor: currentPlayer?.colorHex || '#ef4444',
                    borderColor: currentPlayer?.glowColor || '#f87171'
                  }"
                >
                  {{ currentPlayer?.avatar || '👦' }}
                </div>
                <div class="flex-1">
                  <div class="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{{ currentPlayer?.name || '' }}</span>
                    <span v-if="isAiThinking" class="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 animate-pulse">
                      思考跳跃中...
                    </span>
                  </div>
                  <div class="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: currentPlayer?.colorHex || '#ef4444' }"></span>
                    <span>进军大本营 (已进: {{ getPlayerProgress(currentPlayer).count }}/10)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Players Progress List -->
            <div v-if="currentMode !== 'puzzle'" class="flex flex-col gap-2">
              <div class="text-xs text-slate-400 font-medium">大本营进驻进度：</div>
              <div class="flex flex-col gap-1.5">
                <div
                  v-for="p in activePlayers"
                  :key="p.id"
                  class="bg-white/5 rounded-xl p-2 flex items-center justify-between border border-white/5"
                >
                  <div class="flex items-center gap-2">
                    <div
                      class="w-4 h-4 rounded-full border"
                      :style="{ backgroundColor: p.colorHex, borderColor: p.glowColor }"
                    ></div>
                    <span class="text-xs font-medium text-slate-200">{{ p.name }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                      <div
                        class="h-full transition-all duration-500 rounded-full"
                        :style="{
                          width: getPlayerProgress(p).percent + '%',
                          backgroundColor: p.colorHex
                        }"
                      ></div>
                    </div>
                    <span class="text-xs font-mono font-bold text-slate-300 w-8 text-right">
                      {{ getPlayerProgress(p).count }}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Move History Drawer Button -->
            <button
              @click="showMoveListDrawer = !showMoveListDrawer"
              class="mt-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-between border border-white/10 transition-all"
            >
              <span class="flex items-center gap-1.5">
                <ListOrdered class="w-3.5 h-3.5 text-amber-400" />
                <span>对局棋谱 ({{ liveMoveLogs.length }} 步)</span>
              </span>
              <span class="text-[10px] text-slate-400">{{ showMoveListDrawer ? '收起 ▲' : '展开 ▼' }}</span>
            </button>

            <!-- Collapsible Move List Drawer -->
            <div v-if="showMoveListDrawer" class="max-h-40 overflow-y-auto space-y-1 bg-black/40 p-2 rounded-xl border border-white/10 text-xs font-mono">
              <div
                v-for="m in liveMoveLogs"
                :key="m.stepIndex"
                class="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/10 text-slate-300"
              >
                <span class="text-slate-500 w-6">#{{ m.stepIndex }}</span>
                <span class="flex-1 truncate">{{ m.playerAvatar }} {{ m.fromId }} ➔ {{ m.toId }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" :class="m.isJump ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-slate-400'">
                  {{ m.isJump ? (m.hops + '跳') : '1步' }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- AI Win-Rate & Progress Evaluation Chart Panel -->
        <div class="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-200">
            <span class="flex items-center gap-1 text-cyan-300">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>AI 实时胜率走势图</span>
            </span>
            <div class="flex items-center gap-2 text-[10px] font-mono">
              <span class="text-red-400">你: {{ isReplayMode && currentReplayMove ? currentReplayMove.player1WinRate : currentLiveWinRate.p1WinRate }}%</span>
              <span class="text-blue-400">对手: {{ isReplayMode && currentReplayMove ? currentReplayMove.player2WinRate : currentLiveWinRate.p2WinRate }}%</span>
            </div>
          </div>

          <div class="w-full h-20 bg-slate-950/60 rounded-xl p-2 border border-white/10 relative overflow-hidden flex items-center justify-center">
            <div class="absolute left-0 right-0 top-1/2 border-b border-dashed border-white/20"></div>

            <svg viewBox="0 0 280 70" class="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="checkersWrGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.9" />
                </linearGradient>
              </defs>

              <polyline
                v-if="getWinRatePoints"
                :points="getWinRatePoints"
                fill="none"
                stroke="url(#checkersWrGrad)"
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
              @click="currentTheme = 'galaxy'"
              class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all border"
              :class="currentTheme === 'galaxy' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white/5 text-slate-400 border-white/10'"
            >
              🌌 星空
            </button>
            <button
              @click="currentTheme = 'wood'"
              class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all border"
              :class="currentTheme === 'wood' ? 'bg-amber-700 text-white border-amber-500' : 'bg-white/5 text-slate-400 border-white/10'"
            >
              🪵 原木
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

      <!-- Center Hexagram Board -->
      <section class="flex-1 flex flex-col items-center justify-center relative w-full order-1 xl:order-2">
        <div
          class="relative w-full aspect-square flex items-center justify-center p-1 sm:p-2 transition-all duration-300"
          :class="isImmersiveMode ? 'max-w-[min(98vw,880px,calc(100vh-100px))]' : 'max-w-[min(96vw,740px,calc(100vh-130px))]'"
        >
          <svg viewBox="0 0 700 700" class="w-full h-full drop-shadow-2xl select-none overflow-visible">
            <defs>
              <radialGradient
                v-for="p in Object.values(ALL_PLAYERS_DEF)"
                :key="'grad_' + p.id"
                :id="'marble_grad_' + p.id"
                cx="32%"
                cy="32%"
                r="68%"
              >
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                <stop offset="28%" :stop-color="p.glowColor" />
                <stop offset="70%" :stop-color="p.colorHex" />
                <stop offset="100%" :stop-color="p.darkColorHex" />
              </radialGradient>

              <filter id="drop_shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.65" />
              </filter>
            </defs>

            <!-- Board Base Rounded Background -->
            <circle cx="350" cy="350" r="342" :fill="themeStyles.boardBg" :stroke="themeStyles.boardBorder" stroke-width="4" opacity="0.96" />
            <circle cx="350" cy="350" r="332" fill="none" :stroke="themeStyles.boardBorder" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.35" />

            <!-- 6-Pointed Star Outer Boundary -->
            <polygon
              points="350,48.6 437,199.3 611,199.3 524,350 611,500.7 437,500.7 350,651.4 263,500.7 89,500.7 176,350 89,199.3 263,199.3"
              fill="none"
              :stroke="themeStyles.boardBorder"
              stroke-width="2"
              stroke-opacity="0.4"
            />

            <!-- 6 Camp Background Triangles -->
            <polygon points="350,48.6 437,199.3 263,199.3" :fill="getCampTint(0)" />
            <polygon points="350,651.4 437,500.7 263,500.7" :fill="getCampTint(3)" />
            <polygon points="611,199.3 524,350 437,199.3" :fill="getCampTint(1)" />
            <polygon points="89,500.7 176,350 263,500.7" :fill="getCampTint(4)" />
            <polygon points="611,500.7 437,500.7 524,350" :fill="getCampTint(2)" />
            <polygon points="89,199.3 176,350 263,199.3" :fill="getCampTint(5)" />

            <!-- Board Mesh Grid Lines -->
            <g class="grid-lines" opacity="0.28">
              <line
                v-for="l in BOARD_GRID_LINES"
                :key="l.id"
                :x1="getSvgCoord(l.x1, l.y1).cx"
                :y1="getSvgCoord(l.x1, l.y1).cy"
                :x2="getSvgCoord(l.x2, l.y2).cx"
                :y2="getSvgCoord(l.x2, l.y2).cy"
                :stroke="themeStyles.gridLine"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </g>

            <!-- Replay Active Move Trajectory Path -->
            <g v-if="isReplayMode && currentReplayMove">
              <path
                :d="getTrajectoryPath(currentReplayMove.path)"
                fill="none"
                stroke="#fbbf24"
                stroke-width="5"
                stroke-dasharray="8,5"
                class="animate-pulse"
              />
            </g>

            <!-- Trajectory Preview Curves -->
            <g v-if="hoveredMove && !isReplayMode">
              <path
                :d="getTrajectoryPath(hoveredMove.path)"
                fill="none"
                stroke="#38bdf8"
                stroke-width="4"
                stroke-dasharray="8,6"
                class="animate-pulse"
              />
            </g>
            <g v-if="hintMove && !isReplayMode">
              <path
                :d="getTrajectoryPath(hintMove.move.path)"
                fill="none"
                stroke="#fbbf24"
                stroke-width="5"
                stroke-dasharray="9,5"
              />
            </g>

            <!-- Holes & Pieces -->
            <g>
              <g
                v-for="node in BOARD_NODES"
                :key="node.id"
                :transform="`translate(${getSvgCoord(node.x, node.y).cx}, ${getSvgCoord(node.x, node.y).cy})`"
                @click="onNodeClick(node.id)"
                @mouseenter="hoveredMove = availableMoves.find(m => m.to === node.id) || null"
                @mouseleave="hoveredMove = null"
                class="cursor-pointer group"
              >
                <!-- Invisible oversized hit target for super smooth clicking/touching -->
                <circle cx="0" cy="0" :r="NODE_SIZE + 5" fill="transparent" />

                <!-- Base Hole -->
                <circle cx="0" cy="0" :r="NODE_SIZE" :fill="themeStyles.holeDefault" :stroke="themeStyles.holeStroke" stroke-width="2.5" />
                <circle cx="0" cy="0" :r="NODE_SIZE - 4" fill="#000000" fill-opacity="0.35" />

                <!-- Replay Highlight -->
                <template v-if="isReplayMode && currentReplayMove">
                  <circle v-if="currentReplayMove.fromId === node.id" cx="0" cy="0" :r="NODE_SIZE + 5" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="5,3" />
                  <circle v-if="currentReplayMove.toId === node.id" cx="0" cy="0" :r="NODE_SIZE + 6" fill="none" stroke="#38bdf8" stroke-width="3.5" class="animate-pulse" />
                </template>

                <!-- Legal Move Target Highlight -->
                <template v-if="!isReplayMode && availableMoves.some(m => m.to === node.id)">
                  <circle cx="0" cy="0" :r="NODE_SIZE + 5" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5,3" class="animate-pulse" />
                  <circle cx="0" cy="0" :r="NODE_SIZE - 2" fill="#38bdf8" fill-opacity="0.45" />
                  <g transform="translate(0, -23)">
                    <rect x="-21" y="-11" width="42" height="22" rx="11" fill="#0284c7" stroke="#e0f2fe" stroke-width="1.5" filter="url(#drop_shadow)" />
                    <text x="0" y="4.5" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">
                      {{ availableMoves.find(m => m.to === node.id)?.hops ? (availableMoves.find(m => m.to === node.id)!.hops + '跳') : '1步' }}
                    </text>
                  </g>
                </template>

                <!-- Puzzle Marker -->
                <template v-if="!isReplayMode && currentMode === 'puzzle' && node.id === PUZZLE_LEVELS[currentPuzzleIndex]?.targetNodeId">
                  <circle cx="0" cy="0" :r="NODE_SIZE + 7" fill="none" stroke="#f59e0b" stroke-width="3.5" class="animate-ping" />
                  <circle cx="0" cy="0" :r="NODE_SIZE + 5" fill="#fbbf24" fill-opacity="0.3" />
                  <text x="0" y="6" text-anchor="middle" font-size="16">⭐</text>
                </template>

                <!-- Marble Piece -->
                <template v-if="boardState[node.id]">
                  <g filter="url(#drop_shadow)" :class="[selectedNodeId === node.id ? 'scale-115' : 'group-hover:scale-108', 'transition-transform duration-200']">
                    <circle v-if="selectedNodeId === node.id" cx="0" cy="0" :r="MARBLE_RADIUS + 5" fill="none" :stroke="ALL_PLAYERS_DEF[boardState[node.id]]?.glowColor || '#ffffff'" stroke-width="3.5" class="animate-pulse" />
                    <circle cx="0" cy="0" :r="MARBLE_RADIUS" :fill="`url(#marble_grad_${boardState[node.id]})`" :stroke="ALL_PLAYERS_DEF[boardState[node.id]]?.darkColorHex" stroke-width="2" />
                    <ellipse cx="-5" cy="-5" rx="5" ry="3" fill="#ffffff" fill-opacity="0.85" transform="rotate(-30, -5, -5)" />
                  </g>
                </template>
              </g>
            </g>

            <!-- Animating Marble -->
            <g v-if="animatingMarble" :transform="`translate(${getSvgCoord(animatingMarble.x, animatingMarble.y).cx}, ${getSvgCoord(animatingMarble.x, animatingMarble.y).cy}) scale(${animatingMarble.scale})`" filter="url(#drop_shadow)">
              <circle cx="0" cy="0" :r="MARBLE_RADIUS" :fill="`url(#marble_grad_${animatingMarble.playerId})`" :stroke="ALL_PLAYERS_DEF[animatingMarble.playerId]?.darkColorHex" stroke-width="2" />
              <ellipse cx="-5" cy="-5" rx="5" ry="3" fill="#ffffff" fill-opacity="0.9" transform="rotate(-30, -5, -5)" />
            </g>
          </svg>
        </div>

        <div class="mt-2 text-center text-xs sm:text-sm font-medium text-slate-300 flex items-center justify-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <span v-if="isReplayMode" class="text-cyan-300 font-bold">
            🔍 拖动进度条或点击播放按钮分步复盘推演
          </span>
          <span v-else-if="!selectedNodeId && !isAiThinking">
            👆 点击你的弹珠查看可以跳跃或移动的位置
          </span>
          <span v-else-if="selectedNodeId && !isAiThinking" class="text-cyan-300 font-bold flex items-center gap-1">
            <Sparkles class="w-4 h-4 text-amber-300" />
            点击发光圆圈即可直接一键起飞！
          </span>
          <span v-else-if="isAiThinking" class="text-amber-300 font-bold animate-pulse">
            🤖 对手正在计算最远连跳路线...
          </span>
        </div>
      </section>
    </main>

    <!-- History Records & Review Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh]">
        <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📜</span>
            <div>
              <h3 class="text-lg font-black text-white">跳棋对局记录与复盘</h3>
              <p class="text-xs text-slate-400">已保存 {{ historyRecords.length }} 局历史对战棋谱</p>
            </div>
          </div>
          <button @click="showHistoryModal = false" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
            <X class="w-5 h-5" />
          </button>
        </div>

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
                  <span>总步数: {{ rec.totalMoves }} 步</span>
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
            <p class="text-sm font-medium">暂无跳棋对局记录</p>
            <p class="text-xs mt-1">完成对局后，棋谱将自动保存于此，支持分步复盘！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Victory Modal -->
    <div v-if="showVictoryModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          🏆
        </div>

        <h2 class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent mb-2">
          {{ currentMode === 'puzzle' ? '闯关大胜利！' : '恭喜大获全胜！' }}
        </h2>

        <p class="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
          <span class="font-bold text-amber-300">{{ winner?.name }}</span>
          {{ currentMode === 'puzzle' ? '成功找到了最棒的跳跃通道！' : '率先将全部10颗弹珠运送至对角大本营！' }}
        </p>

        <!-- Buttons -->
        <div class="flex items-center gap-2 w-full">
          <button
            @click="historyRecords.length > 0 && startReplay(historyRecords[0])"
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
    <div v-if="showRulesModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📖</span>
            <h3 class="text-lg font-black text-white">跳棋超简单玩法秘籍</h3>
          </div>
          <button @click="showRulesModal = false" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs text-slate-300">
          <div class="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong class="text-blue-300">1. 单步走：</strong> 弹珠可以向相邻的任意6个相邻空位移动一格。
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong class="text-amber-300">2. 飞跃跳：</strong> 前方有子且后方为空，即可直接跳过它！
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong class="text-emerald-300">3. 连续跳（搭桥）：</strong> 跳过一个子后若还能跳，可一回合连续跳跃横跨棋盘！
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong class="text-purple-300">4. 胜利：</strong> 先把全部10颗弹珠运至正对面大本营者获胜！
          </div>
        </div>

        <button @click="showRulesModal = false" class="mt-6 py-3 rounded-2xl bg-blue-600 font-bold text-white shadow-lg">
          我明白了，开始对局！
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

