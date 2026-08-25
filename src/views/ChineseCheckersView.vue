<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
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
  getCheckersSeats,
  parseCheckersPlayerCount,
  type MoveOption,
  type CampId,
  type PlayerConfig,
  type CheckersPlayerCount
} from '../engine/checkers/checkersEngine';
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
  ListOrdered,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next';

const route = useRoute();

const STORAGE_KEY = 'yinuo_active_checkers';

// Game Modes
type BattleMode = 'ai' | 'twoPlayer';
type Mode = BattleMode | 'puzzle';
const currentMode = ref<Mode>('twoPlayer');
const playerCount = ref<CheckersPlayerCount>(2);
const isImmersiveMode = ref<boolean>(false);

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

// Live Move Log
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

// Win Rate Tracking
const winRateHistory = ref<WinRatePoint[]>([]);

// Game Metadata
const gameStartTime = ref<number>(Date.now());
const turnCount = ref<number>(0);
const bestComboHops = ref<number>(0);
const winner = ref<PlayerConfig | null>(null);

// Modals
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

// Puzzle State
const currentPuzzleIndex = ref<number>(0);
const puzzleCompleted = ref<boolean>(false);

// Local Records
const historyRecords = ref<UnifiedGameRecord[]>([]);

// Player Definitions with vibrant jewel & marble color styling
const ALL_PLAYERS_DEF: Record<number, PlayerConfig> = {
  1: {
    id: 1,
    campId: 3, // South
    targetCampId: 0, // North
    name: '你 (红玛瑙)',
    avatar: '👦',
    colorName: '红玛瑙',
    colorHex: '#ef4444',
    darkColorHex: '#991b1b',
    glowColor: '#fca5a5',
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
    darkColorHex: '#1e40af',
    glowColor: '#93c5fd',
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
    darkColorHex: '#065f46',
    glowColor: '#6ee7b7',
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
    darkColorHex: '#92400e',
    glowColor: '#fcd34d',
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
    darkColorHex: '#6b21a8',
    glowColor: '#d8b4fe',
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
    darkColorHex: '#9d174d',
    glowColor: '#f9a8d4',
    isAi: true
  }
};

const HUMAN_LABELS: Record<number, { name: string; avatar: string }> = {
  1: { name: '玩家1 (红方)', avatar: '🔴' },
  2: { name: '玩家2 (蓝方)', avatar: '🔵' },
  3: { name: '玩家3 (绿方)', avatar: '🟢' },
  4: { name: '玩家4 (黄方)', avatar: '🟡' },
  5: { name: '玩家5 (紫方)', avatar: '🟣' },
  6: { name: '玩家6 (粉方)', avatar: '🩷' }
};

const matchModeLabel = computed(() => {
  if (currentMode.value === 'puzzle') return '连跳闯关';
  return '亲子同屏 · ' + playerCount.value + '人';
});

const buildSeatedPlayers = (): PlayerConfig[] => {
  const seats = getCheckersSeats(playerCount.value);
  const isLocal = currentMode.value === 'twoPlayer';
  return seats.map((defId, index) => {
    const base = ALL_PLAYERS_DEF[defId];
    if (isLocal) {
      const label = HUMAN_LABELS[defId] || { name: '玩家' + defId, avatar: '⚪' };
      return {
        ...base,
        name: label.name,
        avatar: label.avatar,
        isAi: false
      };
    }
    if (index === 0) {
      return {
        ...base,
        name: '你 (红玛瑙)',
        avatar: '👦',
        isAi: false
      };
    }
    if (playerCount.value === 2) {
      const aiAvatar = aiDifficulty.value === 'easy' ? '🐼' : aiDifficulty.value === 'medium' ? '🦊' : '🐉';
      const aiName = aiDifficulty.value === 'easy' ? '萌宝小贝 (简单)' : aiDifficulty.value === 'medium' ? '智多星小狐 (中等)' : '龙龙大师 (挑战)';
      return {
        ...base,
        name: aiName,
        avatar: aiAvatar,
        isAi: true,
        aiDifficulty: aiDifficulty.value
      };
    }
    return {
      ...base,
      name: base.colorName + ' AI',
      isAi: true,
      aiDifficulty: aiDifficulty.value
    };
  });
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
const NODE_SIZE = 17;
const MARBLE_RADIUS = 15.5;

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
  return evaluateCheckersWinRate(boardState.value, activePlayers.value[0], activePlayers.value[1] || activePlayers.value[0]);
});

const refreshHistory = () => {
  historyRecords.value = getLocalGameRecords('checkers');
};

const saveCheckersState = () => {
  if (typeof window === 'undefined') return;
  if (isReplayMode.value || currentMode.value === 'puzzle') return;
  if (winner.value || liveMoveLogs.value.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const payload = {
    currentMode: currentMode.value,
    playerCount: playerCount.value,
    aiDifficulty: aiDifficulty.value,
    boardState: boardState.value,
    initialBoardState: initialBoardState.value,
    currentTurn: currentTurn.value,
    moveHistory: moveHistory.value,
    liveMoveLogs: liveMoveLogs.value,
    winRateHistory: winRateHistory.value,
    turnCount: turnCount.value,
    bestComboHops: bestComboHops.value,
    gameStartTime: gameStartTime.value
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
};

const restoreCheckersState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.liveMoveLogs) || data.liveMoveLogs.length === 0) return false;
    if (!data.boardState || typeof data.boardState !== 'object') return false;

    currentMode.value = 'twoPlayer';
    playerCount.value = parseCheckersPlayerCount(data.playerCount);
    if (data.aiDifficulty === 'easy' || data.aiDifficulty === 'medium' || data.aiDifficulty === 'hard') {
      aiDifficulty.value = data.aiDifficulty;
    }

    activePlayers.value = buildSeatedPlayers();
    boardState.value = { ...data.boardState };
    initialBoardState.value = data.initialBoardState && typeof data.initialBoardState === 'object'
      ? { ...data.initialBoardState }
      : { ...data.boardState };
    currentTurn.value = typeof data.currentTurn === 'number' ? data.currentTurn : activePlayers.value[0].id;
    moveHistory.value = Array.isArray(data.moveHistory) ? data.moveHistory : [];
    liveMoveLogs.value = data.liveMoveLogs;
    winRateHistory.value = Array.isArray(data.winRateHistory) ? data.winRateHistory : [];
    turnCount.value = typeof data.turnCount === 'number' ? data.turnCount : liveMoveLogs.value.length;
    bestComboHops.value = typeof data.bestComboHops === 'number' ? data.bestComboHops : 0;
    gameStartTime.value = typeof data.gameStartTime === 'number' ? data.gameStartTime : Date.now();
    winner.value = null;
    selectedNodeId.value = null;
    availableMoves.value = [];
    hoveredMove.value = null;
    hintMove.value = null;
    return true;
  } catch {
    return false;
  }
};

const initGame = (isFresh = false) => {
  stopReplayAutoPlay();
  isReplayMode.value = false;
  currentReplayGame.value = null;
  selectedNodeId.value = null;
  availableMoves.value = [];
  hoveredMove.value = null;
  hintMove.value = null;

  if (!isFresh && restoreCheckersState()) {
    showVictoryModal.value = false;
    puzzleCompleted.value = false;
    refreshHistory();
    showAlert({
      title: '✨ 棋局已自动恢复',
      message: '小诺已为你找回刚才未下完的跳棋，请继续对弈吧！',
      type: 'success',
      confirmText: '继续对弈 🚀'
    });
    const turnPlayer = activePlayers.value.find((p) => p.id === currentTurn.value);
    if (turnPlayer?.isAi) {
      scheduleAiTurn(turnPlayer);
    }
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
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
    comment: '开局平稳'
  }];
  gameStartTime.value = Date.now();

  const newState: Record<string, number> = {};

  if (currentMode.value === 'puzzle') {
    loadPuzzle(currentPuzzleIndex.value);
    return;
  }

  activePlayers.value = buildSeatedPlayers();
  for (const p of activePlayers.value) {
    for (const hole of CAMPS[p.campId]) {
      newState[hole] = p.id;
    }
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

  const restoreTo = (entry: HistoryRecord) => {
    boardState.value = { ...entry.boardState };
    currentTurn.value = entry.currentTurn;
  };

  if (currentMode.value === 'ai') {
    const humanId = activePlayers.value.find((p) => !p.isAi)?.id;
    while (moveHistory.value.length > 1) {
      const last = moveHistory.value[moveHistory.value.length - 1];
      moveHistory.value.pop();
      if (liveMoveLogs.value.length > 0) liveMoveLogs.value.pop();
      if (winRateHistory.value.length > 1) winRateHistory.value.pop();
      const prev = moveHistory.value[moveHistory.value.length - 1];
      restoreTo(prev);
      if (last.currentTurn === humanId) break;
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
  saveCheckersState();
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

        const jumpArc = isHop ? Math.sin(progress * Math.PI) * 0.35 : 0;
        const scaleMod = 1 + jumpArc * 0.6;

        animatingMarble.value = {
          playerId: currentP.id,
          x: curX,
          y: curY - jumpArc,
          scale: scaleMod
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
  boardState.value = {
    ...boardState.value,
    [move.to]: currentP.id
  };

  const wrBefore = winRateHistory.value[winRateHistory.value.length - 1]?.player1WinRate || 50;
  const wrCurrent = evaluateCheckersWinRate(boardState.value, activePlayers.value[0], activePlayers.value[1] || activePlayers.value[0]);
  const delta = currentP.id === 1 ? (wrCurrent.p1WinRate - wrBefore) : (wrBefore - wrCurrent.p1WinRate);

  let comment = move.isJump ? ('完成 ' + move.hops + ' 连跳飞跃') : '单步平稳前行';
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

  const hasWon = currentMode.value === 'puzzle'
    ? false
    : checkPlayerWin(currentP.id, currentP.targetCampId, boardState.value);

  if (currentMode.value === 'puzzle') {
    const puzzle = PUZZLE_LEVELS[currentPuzzleIndex.value];
    if (move.to === puzzle.targetNodeId) {
      triggerVictory(currentP);
      return;
    }
  } else if (hasWon) {
    triggerVictory(currentP);
    return;
  }

  saveCheckersState();
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
  localStorage.removeItem(STORAGE_KEY);
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
  const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  const battleLabel = '亲子同屏';
  const modeName = currentMode.value === 'puzzle'
    ? ('连跳闯关 (第' + (currentPuzzleIndex.value + 1) + '关)')
    : (battleLabel + ' · ' + playerCount.value + '人');

  const record: UnifiedGameRecord = {
    id: 'checkers_' + Date.now(),
    gameType: 'checkers',
    gameTypeName: '快乐六角跳棋',
    mode: currentMode.value,
    modeName,
    title: dateStr + ' · 快乐跳棋 (' + modeName + ')',
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
      aiDifficulty: currentMode.value === 'ai' ? aiDifficulty.value : undefined,
      playerCount: currentMode.value === 'puzzle' ? undefined : playerCount.value
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
    const move = moves[clamped - 1];
    boardState.value = { ...move.boardStateAfter };
    if (move.isJump) {
      checkersAudio.playHop(move.hops);
    } else {
      checkersAudio.playStep();
    }
  }
};

const toggleReplayAutoPlay = () => {
  isReplayAutoPlaying.value = !isReplayAutoPlaying.value;
  if (isReplayAutoPlaying.value) {
    runReplayAutoLoop();
  } else {
    stopReplayAutoPlay();
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
  initGame(true);
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
    return x + ',' + y;
  }).join(' ');
});

const themeStyles = {
  bg: 'from-amber-950/40 via-stone-900 to-amber-950/60',
  panelBg: 'bg-stone-900/80 border-amber-500/20 text-stone-100',
  boardBgGradStart: '#fae3b6',
  boardBgGradMid: '#dfa45b',
  boardBgGradEnd: '#b8772f',
  rimOuter: '#5c2d0c',
  rimInner: '#8f4f18',
  rimHighlight: '#fde68a',
  holeDefault: '#4a250a',
  holeStroke: '#78350f',
  holeHighlight: '#fef3c7',
  gridLine: '#8a4b16',
  starBorder: '#92400e',
  campOpacity: 0.38,
  accentColor: '#f59e0b'
};

const getCampFill = (campId: CampId) => {
  const op = 0.32;
  switch (campId) {
    case 0: return 'rgba(59, 130, 246, ' + op + ')'; // Blue North
    case 1: return 'rgba(16, 185, 129, ' + op + ')'; // Green NE
    case 2: return 'rgba(236, 72, 153, ' + op + ')'; // Pink SE
    case 3: return 'rgba(239, 68, 68, ' + op + ')';  // Red South
    case 4: return 'rgba(245, 158, 11, ' + op + ')'; // Amber SW
    case 5: return 'rgba(168, 85, 247, ' + op + ')'; // Purple NW
    default: return 'transparent';
  }
};

const getTrajectoryPath = (pathIds: string[]) => {
  const pts = pathIds.map(id => {
    const n = NODE_MAP[id];
    return getSvgCoord(n.x, n.y);
  });
  if (pts.length < 2) return '';

  let d = 'M ' + pts[0].cx + ' ' + pts[0].cy;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const midX = (p1.cx + p2.cx) / 2;
    const midY = (p1.cy + p2.cy) / 2 - 18;
    d += ' Q ' + midX + ' ' + midY + ' ' + p2.cx + ' ' + p2.cy;
  }
  return d;
};

const switchPlayerCount = (count: CheckersPlayerCount) => {
  playerCount.value = count;
  initGame(true);
};

onMounted(() => {
  const qMode = String(route.query.mode || '');
  const qDiff = route.query.diff as 'easy' | 'medium' | 'hard';
  if (qMode === 'threePlayer') {
    currentMode.value = 'twoPlayer';
    playerCount.value = 3;
  } else if (qMode === 'multiPlayer') {
    currentMode.value = 'twoPlayer';
    playerCount.value = 6;
  } else {
    currentMode.value = 'twoPlayer';
    playerCount.value = parseCheckersPlayerCount(route.query.players);
  }
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
          <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg border border-amber-200 shrink-0">
            ⭐
          </div>
          <div class="flex items-center gap-1.5 min-w-0 truncate">
            <h2 class="text-sm sm:text-base font-black text-slate-900 truncate">快乐六角跳棋</h2>
            <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap" :class="isReplayMode ? 'bg-cyan-100 text-cyan-800 animate-pulse' : 'bg-amber-50 text-amber-800 border border-amber-200'">
              {{ isReplayMode ? ('复盘 (' + replayStepIndex + '/' + (currentReplayGame?.moves as any[])?.length + ')') : matchModeLabel }}
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
              :disabled="isAnimating || isAiThinking || !!winner"
              class="px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            >
              <Lightbulb class="w-3.5 h-3.5 fill-current" />
              <span>提示</span>
            </button>

            <!-- 悔棋 Button -->
            <button
              @click="undoMove"
              :disabled="isAnimating || isAiThinking || moveHistory.length <= 1 || !!winner"
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

            <!-- 放大/沉浸模式 Button -->
            <button
              @click="isImmersiveMode = !isImmersiveMode"
              class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs sm:text-sm flex items-center gap-1 border border-cyan-200 transition-all cursor-pointer active:scale-95"
              :title="isImmersiveMode ? '恢复标准视图' : '超大棋盘'"
            >
              <Minimize2 v-if="isImmersiveMode" class="w-3.5 h-3.5 text-cyan-700" />
              <Maximize2 v-else class="w-3.5 h-3.5 text-cyan-700" />
              <span class="hidden sm:inline">{{ isImmersiveMode ? '标准' : '放大' }}</span>
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

      <!-- 棋盘在左、控制区在右；顶对齐 -->
      <main class="flex-1 flex flex-col lg:flex-row items-start gap-4 sm:gap-6 w-full">
        <!-- 右侧控制区（窄屏在棋盘下方） -->
        <section
          v-show="!isImmersiveMode"
          class="w-full lg:w-80 flex flex-col gap-3.5 order-2 shrink-0 transition-all duration-300"
        >
          <!-- Replay Control Panel (When in Replay Mode) -->
          <div v-if="isReplayMode && currentReplayGame" class="bg-white rounded-3xl p-5 border-2 border-cyan-400/80 shadow-2xs flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-cyan-800 flex items-center gap-1.5">
                <History class="w-4 h-4 text-cyan-600" />
                <span>跳棋智能复盘</span>
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
                :disabled="replayStepIndex >= (currentReplayGame.moves as any[]).length"
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
            <!-- Mode Tabs + Player Count -->
            <div class="bg-white rounded-2xl p-1.5 border-2 border-slate-200/90 shadow-2xs">
              <div class="py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-purple-600 text-white shadow-xs">
                <Users class="w-4 h-4" />
                <span>亲子同屏</span>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-3 border-2 border-slate-200/90 shadow-2xs space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>对战人数</span>
                <span class="text-slate-500 font-medium">{{ playerCount }} 人开局</span>
              </div>
              <div class="grid grid-cols-5 gap-1">
                <button
                  v-for="n in ([2, 3, 4, 5, 6] as CheckersPlayerCount[])"
                  :key="'pc_' + n"
                  @click="switchPlayerCount(n)"
                  class="py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                  :class="playerCount === n ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
                >
                  {{ n }}人
                </button>
              </div>
            </div>

            <!-- Match Status & Base Progress Card -->
            <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200/90 shadow-2xs space-y-3.5">
              <!-- Current Turn Display -->
              <div
                class="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all shadow-xs"
                :style="{
                  backgroundColor: (currentPlayer?.colorHex || '#ef4444') + '15',
                  borderColor: (currentPlayer?.colorHex || '#ef4444') + '88'
                }"
              >
                <div
                  class="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md border-2 shrink-0"
                  :style="{
                    backgroundColor: currentPlayer?.colorHex || '#ef4444',
                    borderColor: currentPlayer?.glowColor || '#f87171'
                  }"
                >
                  {{ currentPlayer?.avatar || '👦' }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-black text-sm text-slate-900 flex items-center gap-2">
                    <span class="truncate">{{ currentPlayer?.name || '' }}</span>
                    <span v-if="isAiThinking" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold animate-pulse">
                      思考中...
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: currentPlayer?.colorHex || '#ef4444' }"></span>
                    <span>入营进度: <strong class="text-slate-900">{{ getPlayerProgress(currentPlayer).count }}</strong> / 10 颗</span>
                  </div>
                </div>
              </div>

              <!-- Base Progress Bar List -->
              <div v-if="currentMode !== 'puzzle'" class="space-y-1.5">
                <div class="text-xs text-slate-500 font-medium">大本营进驻进度：</div>
                <div class="space-y-1.5">
                  <div
                    v-for="p in activePlayers"
                    :key="p.id"
                    class="bg-slate-50 rounded-xl p-2 flex items-center justify-between border border-slate-200"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <div
                        class="w-3.5 h-3.5 rounded-full border shrink-0"
                        :style="{ backgroundColor: p.colorHex, borderColor: p.glowColor }"
                      ></div>
                      <span class="text-xs font-bold text-slate-700 truncate">{{ p.name }}</span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <div class="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          class="h-full transition-all duration-500 rounded-full"
                          :style="{
                            width: getPlayerProgress(p).percent + '%',
                            backgroundColor: p.colorHex
                          }"
                        ></div>
                      </div>
                      <span class="text-xs font-mono font-bold text-slate-600 w-8 text-right">
                        {{ getPlayerProgress(p).count }}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Move History Drawer Button -->
              <button
                @click="showMoveListDrawer = !showMoveListDrawer"
                class="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between border border-slate-200 transition-all cursor-pointer"
              >
                <span class="flex items-center gap-1.5">
                  <ListOrdered class="w-4 h-4 text-amber-500" />
                  <span>对局棋谱 ({{ liveMoveLogs.length }} 步)</span>
                </span>
                <span class="text-[11px] text-slate-400 flex items-center gap-1">
                  {{ showMoveListDrawer ? '收起' : '展开' }}
                  <ChevronUp v-if="showMoveListDrawer" class="w-3.5 h-3.5" />
                  <ChevronDown v-else class="w-3.5 h-3.5" />
                </span>
              </button>

              <div v-if="showMoveListDrawer" class="max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-mono">
                <div
                  v-for="m in liveMoveLogs"
                  :key="m.stepIndex"
                  class="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white text-slate-700"
                >
                  <span class="text-slate-400 w-6">#{{ m.stepIndex }}</span>
                  <span class="flex-1 truncate">{{ m.playerAvatar }} {{ m.fromId }} ➔ {{ m.toId }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" :class="m.isJump ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'">
                    {{ m.isJump ? (m.hops + '跳') : '1步' }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- AI Win Rate Sparkline Card -->
          <div class="bg-white rounded-3xl p-4 border-2 border-slate-200/90 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800">
              <span class="flex items-center gap-1.5 text-blue-700">
                <Sparkles class="w-4 h-4 text-amber-500" />
                <span>AI 实时胜率走势</span>
              </span>
              <div class="flex items-center gap-2 font-mono text-[11px]">
                <span class="text-red-600 font-bold">你: {{ isReplayMode && currentReplayMove ? currentReplayMove.player1WinRate : currentLiveWinRate.p1WinRate }}%</span>
                <span class="text-blue-600 font-bold">对手: {{ isReplayMode && currentReplayMove ? currentReplayMove.player2WinRate : currentLiveWinRate.p2WinRate }}%</span>
              </div>
            </div>

            <div class="w-full h-16 bg-slate-50 rounded-xl p-1.5 border border-slate-200 relative overflow-hidden flex items-center justify-center">
              <div class="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-300"></div>
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
        </section>

        <!-- 左侧六角棋盘 -->
        <section class="flex-1 min-w-0 flex flex-col items-center justify-start relative w-full order-1">
          <!-- White Pedestal Board Base Card -->
          <div
            class="bg-white rounded-3xl p-3 sm:p-5 border-2 border-slate-200/90 shadow-sm flex flex-col items-center justify-center relative w-full aspect-square transition-all duration-300"
            :class="isImmersiveMode ? 'max-w-[min(98vw,860px,calc(100vh-120px))]' : 'max-w-[min(96vw,720px,calc(100vh-140px))]'"
          >
            <svg viewBox="0 0 700 700" class="block w-full h-auto drop-shadow-md select-none overflow-visible">
              <defs>
                <radialGradient id="board_surface_grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" :stop-color="themeStyles.boardBgGradStart" />
                  <stop offset="75%" :stop-color="themeStyles.boardBgGradMid" />
                  <stop offset="100%" :stop-color="themeStyles.boardBgGradEnd" />
                </radialGradient>

                <radialGradient id="board_rim_grad" cx="50%" cy="50%" r="50%">
                  <stop offset="92%" :stop-color="themeStyles.rimInner" />
                  <stop offset="97%" :stop-color="themeStyles.rimHighlight" />
                  <stop offset="100%" :stop-color="themeStyles.rimOuter" />
                </radialGradient>

                <radialGradient id="marble_grad_1" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                  <stop offset="20%" stop-color="#fca5a5" />
                  <stop offset="50%" stop-color="#ef4444" />
                  <stop offset="85%" stop-color="#b91c1c" />
                  <stop offset="100%" stop-color="#7f1d1d" />
                </radialGradient>

                <radialGradient id="marble_grad_2" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                  <stop offset="20%" stop-color="#93c5fd" />
                  <stop offset="50%" stop-color="#3b82f6" />
                  <stop offset="85%" stop-color="#1d4ed8" />
                  <stop offset="100%" stop-color="#1e3a8a" />
                </radialGradient>

                <radialGradient id="marble_grad_3" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                  <stop offset="20%" stop-color="#6ee7b7" />
                  <stop offset="50%" stop-color="#10b981" />
                  <stop offset="85%" stop-color="#047857" />
                  <stop offset="100%" stop-color="#064e3b" />
                </radialGradient>

                <radialGradient id="marble_grad_4" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                  <stop offset="20%" stop-color="#fde68a" />
                  <stop offset="50%" stop-color="#f59e0b" />
                  <stop offset="85%" stop-color="#b45309" />
                  <stop offset="100%" stop-color="#78350f" />
                </radialGradient>

                <radialGradient id="marble_grad_5" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                  <stop offset="20%" stop-color="#d8b4fe" />
                  <stop offset="50%" stop-color="#a855f7" />
                  <stop offset="85%" stop-color="#7e22ce" />
                  <stop offset="100%" stop-color="#581c87" />
                </radialGradient>

                <radialGradient id="marble_grad_6" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                  <stop offset="20%" stop-color="#fbcfe8" />
                  <stop offset="50%" stop-color="#ec4899" />
                  <stop offset="85%" stop-color="#be185d" />
                  <stop offset="100%" stop-color="#831843" />
                </radialGradient>

                <radialGradient id="hole_pit_grad" cx="45%" cy="40%" r="55%">
                  <stop offset="0%" :stop-color="themeStyles.holeDefault" stop-opacity="0.95" />
                  <stop offset="80%" :stop-color="themeStyles.holeStroke" stop-opacity="0.85" />
                  <stop offset="100%" :stop-color="themeStyles.holeDefault" stop-opacity="1" />
                </radialGradient>

                <filter id="marble_shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#000000" flood-opacity="0.45" />
                </filter>
                <filter id="board_shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.4" />
                </filter>
              </defs>

              <!-- Board Base -->
              <g filter="url(#board_shadow)">
                <circle cx="350" cy="350" r="346" :fill="themeStyles.rimOuter" />
                <circle cx="350" cy="350" r="344" fill="url(#board_rim_grad)" />
                <circle cx="350" cy="350" r="332" :stroke="themeStyles.rimHighlight" stroke-width="2" fill="none" opacity="0.6" />
                <circle cx="350" cy="350" r="328" :stroke="themeStyles.rimOuter" stroke-width="1.5" stroke-dasharray="4,6" fill="none" opacity="0.4" />
                <circle cx="350" cy="350" r="324" fill="url(#board_surface_grad)" />
              </g>

              <!-- Six Camp Triangular Inlays -->
              <polygon points="350,48.6 437,199.3 263,199.3" :fill="getCampFill(0)" :stroke="themeStyles.starBorder" stroke-width="1.5" stroke-opacity="0.6" />
              <polygon points="350,651.4 437,500.7 263,500.7" :fill="getCampFill(3)" :stroke="themeStyles.starBorder" stroke-width="1.5" stroke-opacity="0.6" />
              <polygon points="611,199.3 524,350 437,199.3" :fill="getCampFill(1)" :stroke="themeStyles.starBorder" stroke-width="1.5" stroke-opacity="0.6" />
              <polygon points="89,500.7 176,350 263,500.7" :fill="getCampFill(4)" :stroke="themeStyles.starBorder" stroke-width="1.5" stroke-opacity="0.6" />
              <polygon points="611,500.7 437,500.7 524,350" :fill="getCampFill(2)" :stroke="themeStyles.starBorder" stroke-width="1.5" stroke-opacity="0.6" />
              <polygon points="89,199.3 176,350 263,199.3" :fill="getCampFill(5)" :stroke="themeStyles.starBorder" stroke-width="1.5" stroke-opacity="0.6" />

              <polygon
                points="437,199.3 524,350 437,500.7 263,500.7 176,350 263,199.3"
                fill="rgba(0,0,0,0.03)"
                :stroke="themeStyles.starBorder"
                stroke-width="1.8"
                stroke-opacity="0.5"
              />

              <!-- Grid Lines -->
              <g class="grid-lines" opacity="0.35">
                <line
                  v-for="l in BOARD_GRID_LINES"
                  :key="l.id"
                  :x1="getSvgCoord(l.x1, l.y1).cx"
                  :y1="getSvgCoord(l.x1, l.y1).cy"
                  :x2="getSvgCoord(l.x2, l.y2).cx"
                  :y2="getSvgCoord(l.x2, l.y2).cy"
                  :stroke="themeStyles.gridLine"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </g>

              <!-- Replay Trajectory -->
              <g v-if="isReplayMode && currentReplayMove">
                <path :d="getTrajectoryPath(currentReplayMove.path)" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-dasharray="8,6" class="animate-pulse" />
              </g>

              <!-- Preview Curves -->
              <g v-if="hoveredMove && !isReplayMode">
                <path :d="getTrajectoryPath(hoveredMove.path)" fill="none" :stroke="themeStyles.accentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="8,6" class="animate-pulse" />
              </g>
              <g v-if="hintMove && !isReplayMode">
                <path :d="getTrajectoryPath(hintMove.move.path)" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-dasharray="9,5" />
              </g>

              <!-- Holes & Marbles -->
              <g>
                <g
                  v-for="node in BOARD_NODES"
                  :key="node.id"
                  :transform="'translate(' + getSvgCoord(node.x, node.y).cx + ', ' + getSvgCoord(node.x, node.y).cy + ')'"
                  @click="onNodeClick(node.id)"
                  @mouseenter="hoveredMove = availableMoves.find(m => m.to === node.id) || null"
                  @mouseleave="hoveredMove = null"
                  class="cursor-pointer group"
                >
                  <circle cx="0" cy="0" :r="NODE_SIZE + 6" fill="transparent" />
                  <circle cx="0" cy="0" :r="NODE_SIZE" :fill="themeStyles.holeDefault" :stroke="themeStyles.holeStroke" stroke-width="2" />
                  <circle cx="0" cy="0" :r="NODE_SIZE - 2" fill="url(#hole_pit_grad)" />
                  <circle cx="0" cy="0" :r="NODE_SIZE - 4" fill="#000000" fill-opacity="0.25" />

                  <circle
                    v-if="!boardState[node.id] && NODE_CAMP_MAP[node.id] !== undefined"
                    cx="0"
                    cy="0"
                    r="3.5"
                    :fill="ALL_PLAYERS_DEF[NODE_CAMP_MAP[node.id] === 3 ? 1 : NODE_CAMP_MAP[node.id] === 0 ? 2 : NODE_CAMP_MAP[node.id] + 1]?.colorHex || '#ffffff'"
                    fill-opacity="0.35"
                  />

                  <!-- Replay Highlight -->
                  <template v-if="isReplayMode && currentReplayMove">
                    <circle v-if="currentReplayMove.fromId === node.id" cx="0" cy="0" :r="NODE_SIZE + 6" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="5,3" />
                    <circle v-if="currentReplayMove.toId === node.id" cx="0" cy="0" :r="NODE_SIZE + 7" fill="none" stroke="#38bdf8" stroke-width="3.5" class="animate-pulse" />
                  </template>

                  <!-- Legal Target -->
                  <template v-if="!isReplayMode && availableMoves.some(m => m.to === node.id)">
                    <circle cx="0" cy="0" :r="NODE_SIZE + 5" fill="none" :stroke="themeStyles.accentColor" stroke-width="3" stroke-dasharray="5,3" class="animate-pulse" />
                    <circle cx="0" cy="0" :r="NODE_SIZE - 1" :fill="themeStyles.accentColor" fill-opacity="0.4" />
                    <g transform="translate(0, -22)">
                      <rect x="-22" y="-11" width="44" height="22" rx="11" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" filter="url(#marble_shadow)" />
                      <text x="0" y="4.5" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">
                        {{ availableMoves.find(m => m.to === node.id)?.hops ? (availableMoves.find(m => m.to === node.id)!.hops + '跳') : '+1步' }}
                      </text>
                    </g>
                  </template>

                  <!-- Marble Piece -->
                  <template v-if="boardState[node.id]">
                    <g
                      filter="url(#marble_shadow)"
                      :class="[selectedNodeId === node.id ? '-translate-y-2 scale-110' : 'group-hover:-translate-y-0.5 group-hover:scale-105', 'transition-all duration-200']"
                    >
                      <circle
                        v-if="selectedNodeId === node.id"
                        cx="0"
                        cy="0"
                        :r="MARBLE_RADIUS + 6"
                        fill="none"
                        :stroke="ALL_PLAYERS_DEF[boardState[node.id]]?.glowColor || '#ffffff'"
                        stroke-width="3"
                        stroke-dasharray="4,2"
                        class="animate-spin"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        :r="MARBLE_RADIUS"
                        :fill="'url(#marble_grad_' + boardState[node.id] + ')'"
                        :stroke="ALL_PLAYERS_DEF[boardState[node.id]]?.darkColorHex"
                        stroke-width="1.2"
                      />
                      <ellipse cx="4.5" cy="5.5" rx="6.5" ry="3.5" fill="#ffffff" fill-opacity="0.4" transform="rotate(-25, 4.5, 5.5)" />
                      <ellipse cx="-4.5" cy="-4.5" rx="5" ry="2.8" fill="#ffffff" fill-opacity="0.92" transform="rotate(-30, -4.5, -4.5)" />
                      <circle cx="-1" cy="-7" r="1" fill="#ffffff" fill-opacity="0.9" />
                    </g>
                  </template>
                </g>
              </g>

              <!-- Animating Marble -->
              <g
                v-if="animatingMarble"
                :transform="'translate(' + getSvgCoord(animatingMarble.x, animatingMarble.y).cx + ', ' + getSvgCoord(animatingMarble.x, animatingMarble.y).cy + ') scale(' + animatingMarble.scale + ')'"
                filter="url(#marble_shadow)"
              >
                <circle
                  cx="0"
                  cy="0"
                  :r="MARBLE_RADIUS"
                  :fill="'url(#marble_grad_' + animatingMarble.playerId + ')'"
                  :stroke="ALL_PLAYERS_DEF[animatingMarble.playerId]?.darkColorHex"
                  stroke-width="1.2"
                />
                <ellipse cx="4.5" cy="5.5" rx="6.5" ry="3.5" fill="#ffffff" fill-opacity="0.4" transform="rotate(-25, 4.5, 5.5)" />
                <ellipse cx="-4.5" cy="-4.5" rx="5" ry="2.8" fill="#ffffff" fill-opacity="0.95" transform="rotate(-30, -4.5, -4.5)" />
                <circle cx="-1" cy="-7" r="1" fill="#ffffff" fill-opacity="0.9" />
              </g>
            </svg>
          </div>

          <!-- Bottom Tip -->
          <div class="mt-3 text-center text-xs sm:text-sm font-bold text-amber-950 flex items-center justify-center gap-2 bg-amber-100/90 border border-amber-300/80 px-5 py-2 rounded-full shadow-2xs">
            <span v-if="isReplayMode">
              🔍 拖动进度条或点击播放按钮分步复盘推演
            </span>
            <span v-else-if="!selectedNodeId && !isAiThinking">
              👆 点击你的弹珠查看可以跳跃或移动的位置
            </span>
            <span v-else-if="selectedNodeId && !isAiThinking" class="text-amber-800 font-bold flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-amber-600" />
              点击发光圆圈即可直接一键起飞！
            </span>
            <span v-else-if="isAiThinking" class="text-blue-700 animate-pulse">
              🤖 对手正在计算最远连跳路线...
            </span>
          </div>
        </section>
      </main>

    </div>

    <!-- History Records Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="showHistoryModal = false">
      <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full h-[520px] max-h-[85vh] shadow-2xl border-2 border-slate-200/90 flex flex-col space-y-4 overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shadow-2xs">
              📜
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900">跳棋历史对局与复盘</h3>
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
            <p class="font-medium">暂无跳棋对局记录</p>
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
        <h2 class="text-xl sm:text-2xl font-black text-slate-900">恭喜大获全胜！</h2>
        <p class="text-xs sm:text-sm text-slate-600">
          <strong class="text-amber-600">{{ winner?.name }}</strong> 率先将全部弹珠运送至目标大本营！
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
            <h3 class="text-base sm:text-lg font-black text-slate-900">跳棋超简单玩法秘籍</h3>
          </div>
          <button @click="showRulesModal = false" class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2.5 text-xs sm:text-sm text-slate-600">
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-blue-800">1. 单步平移：</strong> 弹珠可以向相邻的任意 6 个相邻空位平移一格。
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-amber-800">2. 跨步跳跃（搭桥）：</strong> 当紧邻有棋子且正后方为空时，可直接跨跃跳入空位！
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-emerald-800">3. 连续飞跃（连跳）：</strong> 一回合可借多个棋子连续多次跳跃，直接横跨棋盘！
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <strong class="text-purple-800">4. 胜利条件：</strong> 率先将己方全部弹珠运送至正对面大本营者获胜！
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
