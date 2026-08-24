<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import confetti from 'canvas-confetti';
import {
  type SudokuSize,
  type SudokuDifficulty,
  type SudokuTheme,
  type SudokuCell,
  type SudokuPuzzleDef,
  SUDOKU_CONFIGS,
  SUDOKU_THEMES,
  PRESET_SUDOKU_LEVELS,
  generateSudokuPuzzle,
  findSmartHint,
  isValidPlacement,
  type SmartHintResult
} from '../engine/sudoku/sudokuEngine';
import { sound } from '../utils/sound';
import { playStoneSound, playVictorySound, playErrorSound, playCoinSound } from '../lib/audio';
import { useUserStore } from '../stores/useUserStore';
import { showAlert } from '../utils/alert';
import {
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  Eraser,
  Pencil,
  RefreshCw,
  Play,
  Pause,
  Layers,
  X
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// Game Configuration
const currentSize = ref<SudokuSize>(4);
const currentDifficulty = ref<SudokuDifficulty>('easy');
const currentTheme = ref<SudokuTheme>('number');
const isNotesMode = ref<boolean>(false);

// Board State: 2D array of SudokuCell
const grid = ref<SudokuCell[][]>([]);
const solutionGrid = ref<number[][]>([]);
const selectedCell = ref<{ row: number; col: number } | null>(null);

// History for Undo
interface UndoState {
  grid: { row: number; col: number; value: number; notes: number[] }[][];
}
const undoHistory = ref<UndoState[]>([]);

// Smart Hint State
const activeHint = ref<SmartHintResult | null>(null);
const mascotMood = ref<"happy" | "thinking" | "cheering" | "comforting">("happy");
const mascotMessage = ref<string>('欢迎来到智趣数独王国！选择格子并填入不重复的数字或图案吧！');

// Timer State
const timerSeconds = ref<number>(0);
const isPaused = ref<boolean>(false);
let timerInterval: any = null;

// Victory Modal State
const showVictoryModal = ref<boolean>(false);
const isLevelComplete = ref<boolean>(false);
const hintsUsedCount = ref<number>(0);
const mistakesCount = ref<number>(0);

// Preset Level Selector Modal
const showLevelModal = ref<boolean>(false);
const currentPuzzleTitle = ref<string>('四宫格 · 初尝数独');

// Available Preset Levels for current size
const filteredPresetLevels = computed(() => {
  return PRESET_SUDOKU_LEVELS.filter(p => p.size === currentSize.value);
});

// Current Theme Symbols
const themeSymbols = computed(() => {
  return SUDOKU_THEMES[currentTheme.value].symbols;
});

// Get Display Symbol for a value (1..size)
const getDisplaySymbol = (val: number) => {
  if (val < 1 || val > currentSize.value) return '';
  return themeSymbols.value[val - 1];
};

// Box configuration for grid lines
const boxConfig = computed(() => {
  return SUDOKU_CONFIGS[currentSize.value];
});

// Calculate remaining counts for keypad numbers
const numberCounts = computed(() => {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= currentSize.value; i++) {
    counts[i] = 0;
  }
  for (let r = 0; r < currentSize.value; r++) {
    for (let c = 0; c < currentSize.value; c++) {
      const val = grid.value[r]?.[c]?.value;
      if (val && val >= 1 && val <= currentSize.value) {
        counts[val] = (counts[val] || 0) + 1;
      }
    }
  }
  return counts;
});

// Selected cell info
const selectedValue = computed(() => {
  if (!selectedCell.value) return 0;
  const { row, col } = selectedCell.value;
  return grid.value[row]?.[col]?.value || 0;
});

// Format timer mm:ss
const formattedTime = computed(() => {
  const m = Math.floor(timerSeconds.value / 60).toString().padStart(2, '0');
  const s = (timerSeconds.value % 60).toString().padStart(2, '0');
  return m + ':' + s;
});

// Start / Stop Timer
const startTimer = () => {
  stopTimer();
  timerInterval = setInterval(() => {
    if (!isPaused.value && !isLevelComplete.value) {
      timerSeconds.value++;
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  sound.playButtonSound();
};

// Save & Restore Local Storage State
const STORAGE_KEY = 'yinuo_active_sudoku_game';

const saveGameState = () => {
  if (typeof window === 'undefined' || isLevelComplete.value) return;
  try {
    const rawGrid = grid.value.map(row =>
      row.map(cell => ({
        row: cell.row,
        col: cell.col,
        value: cell.value,
        solutionValue: cell.solutionValue,
        isInitial: cell.isInitial,
        notes: cell.notes
      }))
    );
    const payload = {
      size: currentSize.value,
      difficulty: currentDifficulty.value,
      theme: currentTheme.value,
      timerSeconds: timerSeconds.value,
      hintsUsed: hintsUsedCount.value,
      mistakes: mistakesCount.value,
      title: currentPuzzleTitle.value,
      solution: solutionGrid.value,
      grid: rawGrid
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
};

// Initialize or Load Game
const initGame = (preset?: SudokuPuzzleDef) => {
  stopTimer();
  timerSeconds.value = 0;
  isPaused.value = false;
  isLevelComplete.value = false;
  showVictoryModal.value = false;
  activeHint.value = null;
  undoHistory.value = [];
  hintsUsedCount.value = 0;
  mistakesCount.value = 0;

  let initial: number[][];
  let sol: number[][];

  if (preset) {
    currentSize.value = preset.size;
    currentDifficulty.value = preset.difficulty;
    currentPuzzleTitle.value = preset.title;
    initial = preset.initialGrid;
    sol = preset.solutionGrid;
  } else {
    currentPuzzleTitle.value = (currentSize.value === 4 ? '四宫格' : currentSize.value === 6 ? '六宫格' : '九宫格') + ' · 随机探险';
    const generated = generateSudokuPuzzle(currentSize.value, currentDifficulty.value);
    initial = generated.initial;
    sol = generated.solution;
  }

  solutionGrid.value = sol;
  grid.value = initial.map((row, r) =>
    row.map((val, c) => ({
      row: r,
      col: c,
      value: val,
      solutionValue: sol[r][c],
      isInitial: val !== 0,
      notes: []
    }))
  );

  // Auto-select first empty cell
  selectedCell.value = null;
  for (let r = 0; r < currentSize.value; r++) {
    for (let c = 0; c < currentSize.value; c++) {
      if (grid.value[r][c].value === 0) {
        selectedCell.value = { row: r, col: c };
        break;
      }
    }
    if (selectedCell.value) break;
  }

  mascotMood.value = "happy";
  mascotMessage.value = '新对局开始啦！仔细观察每行、每列与每宫，找出唯一数字吧！';
  startTimer();
};

// Save current board for undo
const recordUndo = () => {
  const snapshot = grid.value.map(row =>
    row.map(cell => ({
      row: cell.row,
      col: cell.col,
      value: cell.value,
      notes: [...cell.notes]
    }))
  );
  undoHistory.value.push({ grid: snapshot });
  if (undoHistory.value.length > 30) {
    undoHistory.value.shift();
  }
};

const handleUndo = () => {
  if (undoHistory.value.length === 0 || isLevelComplete.value) return;
  sound.playButtonSound();
  const lastState = undoHistory.value.pop();
  if (lastState) {
    for (let r = 0; r < currentSize.value; r++) {
      for (let c = 0; c < currentSize.value; c++) {
        grid.value[r][c].value = lastState.grid[r][c].value;
        grid.value[r][c].notes = [...lastState.grid[r][c].notes];
        grid.value[r][c].isError = false;
        grid.value[r][c].isHinted = false;
      }
    }
    activeHint.value = null;
  }
};

// Handle Cell Click
const selectCell = (row: number, col: number) => {
  if (isPaused.value || isLevelComplete.value) return;
  selectedCell.value = { row, col };
  playStoneSound();
  activeHint.value = null;
};

// Check if cell is in same row, col, or box as selected
const isHighlightedRelatively = (r: number, c: number) => {
  if (!selectedCell.value) return false;
  const { row, col } = selectedCell.value;
  if (r === row || c === col) return true;
  const { boxRows, boxCols } = boxConfig.value;
  const sameBox =
    Math.floor(r / boxRows) === Math.floor(row / boxRows) &&
    Math.floor(c / boxCols) === Math.floor(col / boxCols);
  return sameBox;
};

// Input Number
const inputNumber = (num: number) => {
  if (isPaused.value || isLevelComplete.value || !selectedCell.value) return;
  const { row, col } = selectedCell.value;
  const cell = grid.value[row]?.[col];
  if (!cell || cell.isInitial) return;

  recordUndo();

  if (isNotesMode.value) {
    // Toggle pencil notes
    const idx = cell.notes.indexOf(num);
    if (idx >= 0) {
      cell.notes.splice(idx, 1);
    } else {
      cell.notes.push(num);
      cell.notes.sort((a, b) => a - b);
    }
    sound.playButtonSound();
    return;
  }

  // Value mode
  cell.notes = [];
  cell.isHinted = false;

  if (cell.value === num) {
    // Tap same number again to toggle clear
    cell.value = 0;
    cell.isError = false;
    sound.playButtonSound();
    return;
  }

  cell.value = num;

  // Validate conflict
  const currentMatrix = grid.value.map(row => row.map(c => c.value));
  const isConflict = !isValidPlacement(currentMatrix, row, col, num, currentSize.value);
  cell.isError = isConflict;

  if (isConflict) {
    playErrorSound();
    mistakesCount.value++;
    mascotMood.value = 'comforting';
    mascotMessage.value = '哎呀，同行、同列或同宫已经有相同的图案啦！检查一下哦！';
  } else {
    playStoneSound();
    mascotMood.value = 'happy';
    mascotMessage.value = '太棒了！填入正确，继续加油！';
    // Check completion
    checkVictory();
  }

  saveGameState();
};

// Erase Cell
const eraseCell = () => {
  if (isPaused.value || isLevelComplete.value || !selectedCell.value) return;
  const { row, col } = selectedCell.value;
  const cell = grid.value[row]?.[col];
  if (!cell || cell.isInitial) return;

  recordUndo();
  cell.value = 0;
  cell.notes = [];
  cell.isError = false;
  cell.isHinted = false;
  sound.playButtonSound();
  saveGameState();
};

// Check Victory
const checkVictory = () => {
  for (let r = 0; r < currentSize.value; r++) {
    for (let c = 0; c < currentSize.value; c++) {
      const cell = grid.value[r][c];
      if (cell.value === 0 || cell.isError || cell.value !== cell.solutionValue) {
        return;
      }
    }
  }

  // All filled correctly!
  stopTimer();
  isLevelComplete.value = true;
  showVictoryModal.value = true;
  playVictorySound();
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });

  // Reward gold & stars
  if (userStore.hasProfile) {
    userStore.addCoins(30, '数独通关奖励');
    userStore.addExp(40);
    playCoinSound();
  }

  mascotMood.value = 'cheering';
  mascotMessage.value = '🎉 太厉害啦！你成功解开了整个数独迷宫，数学逻辑力大爆发！';
  localStorage.removeItem(STORAGE_KEY);
};

// Smart Hint
const provideSmartHint = () => {
  if (isPaused.value || isLevelComplete.value) return;
  hintsUsedCount.value++;

  const currentMatrix = grid.value.map(row => row.map(c => c.value));
  const hint = findSmartHint(currentMatrix, solutionGrid.value, currentSize.value);

  if (hint) {
    activeHint.value = hint;
    selectedCell.value = { row: hint.row, col: hint.col };
    grid.value[hint.row][hint.col].isHinted = true;
    mascotMood.value = 'thinking';
    mascotMessage.value = hint.explanation;
    sound.playWinSound();
  } else {
    showAlert({
      title: '盘面提示',
      message: '当前盘面所有空格均符合规则，继续推导即可！',
      type: 'info'
    });
  }
};

// Switch Size Mode
const switchSize = (size: SudokuSize) => {
  if (currentSize.value === size) return;
  currentSize.value = size;
  initGame();
};

// Switch Difficulty
const switchDifficulty = (diff: SudokuDifficulty) => {
  if (currentDifficulty.value === diff) return;
  currentDifficulty.value = diff;
  initGame();
};

// Go Back
const goBack = () => {
  sound.playButtonSound();
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/subject/math');
  }
};

onMounted(() => {
  // Check if query specifies size or preset
  const querySize = Number(route.query.size);
  if ([4, 6, 9].includes(querySize)) {
    currentSize.value = querySize as SudokuSize;
  }
  initGame();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<template>
  <div class="min-h-screen w-full bg-[#FDFBF7] flex flex-col font-sans select-none pb-12 sm:pb-6">
    <!-- Top Header -->
    <header class="w-full bg-white/90 backdrop-blur-md border-b border-orange-100 px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs gap-2">
      <!-- Left: Back & Title -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          @click="goBack"
          class="p-1.5 sm:p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95 transition-all flex items-center gap-1 text-xs sm:text-sm font-bold border border-amber-300 shadow-2xs cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span class="hidden sm:inline">返回</span>
        </button>

        <div class="flex items-center gap-1.5">
          <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-sm sm:text-xl shadow-xs text-white">
            🧩
          </div>
          <div>
            <h1 class="text-sm sm:text-base md:text-lg font-black text-gray-900 flex items-center gap-1.5">
              <span>智趣数独王国</span>
              <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {{ currentSize }}×{{ currentSize }}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <!-- Center: Timer & Pause -->
      <div class="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-black text-amber-800 shadow-2xs">
        <span>⏱️</span>
        <span>{{ formattedTime }}</span>
        <button
          @click="togglePause"
          class="p-1 rounded-full hover:bg-amber-200/70 active:scale-90 text-amber-900 transition-all cursor-pointer ml-0.5"
          :title="isPaused ? '继续' : '暂停'"
        >
          <Play v-if="isPaused" class="w-3 h-3 fill-amber-900" />
          <Pause v-else class="w-3 h-3 fill-amber-900" />
        </button>
      </div>

      <!-- Right: Mode & Theme Quick Switch -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Theme Selector Dropdown -->
        <select
          v-model="currentTheme"
          class="bg-white border border-gray-200 rounded-xl px-2 py-1 text-xs font-bold text-gray-700 shadow-2xs cursor-pointer hover:border-orange-300 focus:outline-none"
        >
          <option value="number">🔢 数字</option>
          <option value="fruit">🍎 水果</option>
          <option value="animal">🐶 萌宠</option>
          <option value="gem">💎 宝石</option>
        </select>

        <!-- New Game / Reset -->
        <button
          @click="initGame()"
          class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">换一局</span>
        </button>
      </div>
    </header>

    <!-- Main Game Container -->
    <main class="flex-1 max-w-5xl mx-auto w-full p-2.5 sm:p-5 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8">
      <!-- Left Column: Board & Mascot -->
      <div class="flex-1 flex flex-col items-center max-w-[min(94vw,520px)] w-full gap-3">
        <!-- Difficulty & Specs Pill Selector -->
        <div class="w-full flex items-center justify-between gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs">
          <!-- Size Switchers -->
          <div class="flex items-center gap-1">
            <button
              v-for="s in ([4, 6, 9] as SudokuSize[])"
              :key="s"
              @click="switchSize(s)"
              class="px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer"
              :class="currentSize === s ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ s === 4 ? '4×4 萌宝' : s === 6 ? '6×6 启智' : '9×9 大师' }}
            </button>
          </div>

          <!-- Difficulty Switchers -->
          <div class="flex items-center gap-1">
            <button
              v-for="d in ([{ id: 'easy', label: '简单' }, { id: 'medium', label: '进阶' }, { id: 'hard', label: '大师' }] as const)"
              :key="d.id"
              @click="switchDifficulty(d.id)"
              class="px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
              :class="currentDifficulty === d.id ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black' : 'text-gray-400 hover:text-gray-600'"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <!-- Mascot Speech Bubble -->
        <div class="w-full bg-amber-50/90 border border-amber-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-2xs animate-fade-in">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xl shrink-0 shadow-xs">
            {{ mascotMood === 'cheering' ? '🎉' : mascotMood === 'thinking' ? '💡' : mascotMood === 'comforting' ? '🌱' : '🦁' }}
          </div>
          <div class="text-xs text-amber-950 font-bold leading-snug flex-1">
            {{ mascotMessage }}
          </div>
        </div>

        <!-- Sudoku Board Grid -->
        <div
          class="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border-3 sm:border-4 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
          :class="isPaused ? 'filter blur-md' : ''"
        >
          <!-- Rows -->
          <div
            v-for="(row, r) in grid"
            :key="'row_' + r"
            class="flex-1 flex w-full"
            :class="[
              r > 0 && r % boxConfig.boxRows === 0 ? 'border-t-3 sm:border-t-4 border-slate-800' : (r > 0 ? 'border-t border-slate-200' : '')
            ]"
          >
            <!-- Cells -->
            <div
              v-for="(cell, c) in row"
              :key="'cell_' + r + '_' + c"
              @click="selectCell(r, c)"
              class="flex-1 h-full flex items-center justify-center relative cursor-pointer transition-colors duration-150 select-none"
              :class="[
                c > 0 && c % boxConfig.boxCols === 0 ? 'border-l-3 sm:border-l-4 border-slate-800' : (c > 0 ? 'border-l border-slate-200' : ''),
                selectedCell?.row === r && selectedCell?.col === c
                  ? 'bg-blue-200/90 ring-3 ring-blue-500 ring-inset z-10'
                  : cell.value > 0 && cell.value === selectedValue
                  ? 'bg-amber-100/90 font-black'
                  : isHighlightedRelatively(r, c)
                  ? 'bg-blue-50/60'
                  : 'bg-white hover:bg-slate-50',
                cell.isError ? '!bg-rose-100 !text-rose-600 animate-shake' : '',
                cell.isHinted ? '!bg-yellow-200 animate-pulse' : ''
              ]"
            >
              <!-- Filled Value / Symbol -->
              <span
                v-if="cell.value > 0"
                class="font-cartoon leading-none transition-transform"
                :class="[
                  currentSize === 4 ? 'text-2xl sm:text-4xl' : currentSize === 6 ? 'text-xl sm:text-3xl' : 'text-base sm:text-2xl',
                  cell.isInitial ? 'font-black text-slate-900' : 'font-extrabold text-blue-600',
                  cell.isError ? '!text-rose-600' : ''
                ]"
              >
                {{ getDisplaySymbol(cell.value) }}
              </span>

              <!-- Candidate Notes (Pencil Marks) -->
              <div
                v-else-if="cell.notes.length > 0"
                class="grid w-full h-full p-0.5 gap-0.5 text-[8px] sm:text-[10px] font-bold text-slate-400 leading-none items-center justify-items-center"
                :class="currentSize === 4 ? 'grid-cols-2 grid-rows-2' : currentSize === 6 ? 'grid-cols-3 grid-rows-2' : 'grid-cols-3 grid-rows-3'"
              >
                <span
                  v-for="n in currentSize"
                  :key="'note_' + n"
                  class="flex items-center justify-center"
                  :class="cell.notes.includes(n) ? 'text-indigo-600 font-black' : 'opacity-0'"
                >
                  {{ currentTheme === 'number' ? n : getDisplaySymbol(n) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pause Overlay -->
        <div
          v-if="isPaused"
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20 rounded-3xl"
        >
          <div class="text-4xl">⏸️</div>
          <div class="text-white text-lg font-black">对局已暂停</div>
          <button
            @click="togglePause"
            class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-2xl shadow-lg active:scale-95 cursor-pointer"
          >
            继续挑战 🚀
          </button>
        </div>
      </div>

      <!-- Right Column: Keypad & Tools Panel -->
      <div class="w-full lg:w-80 flex flex-col gap-3 max-w-[min(94vw,520px)]">
        <!-- Action Toolbar -->
        <div class="grid grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs">
          <!-- Undo -->
          <button
            @click="handleUndo"
            :disabled="undoHistory.length === 0"
            class="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 disabled:opacity-40 transition-all text-gray-700 cursor-pointer"
            title="撤销上一步"
          >
            <RotateCcw class="w-4 h-4 text-blue-600" />
            <span class="text-[10px] font-bold mt-1">撤销</span>
          </button>

          <!-- Erase -->
          <button
            @click="eraseCell"
            class="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gray-50 hover:bg-rose-50 active:scale-95 transition-all text-gray-700 hover:text-rose-600 cursor-pointer"
            title="清空当前格"
          >
            <Eraser class="w-4 h-4 text-rose-500" />
            <span class="text-[10px] font-bold mt-1">橡皮擦</span>
          </button>

          <!-- Notes Toggle -->
          <button
            @click="isNotesMode = !isNotesMode"
            class="flex flex-col items-center justify-center py-2 px-1 rounded-xl active:scale-95 transition-all cursor-pointer relative"
            :class="isNotesMode ? 'bg-indigo-600 text-white shadow-xs font-black' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'"
            title="草稿/笔记模式"
          >
            <Pencil class="w-4 h-4" :class="isNotesMode ? 'text-amber-300' : 'text-indigo-600'" />
            <span class="text-[10px] font-bold mt-1">草稿 {{ isNotesMode ? '开' : '关' }}</span>
          </button>

          <!-- Smart Hint -->
          <button
            @click="provideSmartHint"
            class="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-b from-amber-100 to-yellow-100 hover:from-amber-200 text-amber-900 border border-amber-300 active:scale-95 transition-all cursor-pointer"
            title="获得小诺推理提示"
          >
            <Lightbulb class="w-4 h-4 text-amber-600" />
            <span class="text-[10px] font-bold mt-1">提示</span>
          </button>
        </div>

        <!-- Touch Number / Symbol Keypad -->
        <div class="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div class="text-xs font-black text-gray-700 flex items-center justify-between">
            <span>选择填入{{ currentTheme === 'number' ? '数字' : '图案' }}</span>
            <span class="text-[10px] text-gray-400 font-normal">点击填入</span>
          </div>

          <div
            class="grid gap-2"
            :class="currentSize === 4 ? 'grid-cols-4' : currentSize === 6 ? 'grid-cols-3' : 'grid-cols-3'"
          >
            <button
              v-for="n in currentSize"
              :key="'btn_' + n"
              @click="inputNumber(n)"
              class="relative py-3 sm:py-3.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer group shadow-2xs"
              :class="[
                numberCounts[n] >= currentSize
                  ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-b from-white to-amber-50/40 border-amber-200 hover:border-orange-400 hover:bg-amber-100/50'
              ]"
            >
              <span
                class="font-cartoon font-black leading-none group-hover:scale-110 transition-transform"
                :class="currentTheme === 'number' ? 'text-2xl sm:text-3xl text-slate-900' : 'text-2xl sm:text-3xl'"
              >
                {{ getDisplaySymbol(n) }}
              </span>

              <!-- Remaining count badge -->
              <span
                class="text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded-full"
                :class="numberCounts[n] >= currentSize ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'"
              >
                {{ currentSize - (numberCounts[n] || 0) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Curated Level Pack Trigger -->
        <button
          @click="showLevelModal = true"
          class="w-full py-2.5 px-4 rounded-2xl bg-white border border-gray-200 hover:border-indigo-300 text-slate-800 font-bold text-xs flex items-center justify-between shadow-2xs transition-all cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <Layers class="w-4 h-4 text-indigo-600" />
            <span>精选趣味数独关卡</span>
          </div>
          <span class="text-xs text-indigo-600 font-black">查看全部 ➔</span>
        </button>
      </div>
    </main>

    <!-- Victory Modal -->
    <div
      v-if="showVictoryModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full text-center border-4 border-amber-300 shadow-2xl space-y-4">
        <div class="text-5xl animate-bounce">🏆</div>
        <h2 class="text-2xl font-cartoon font-bold text-gray-900">
          挑战成功！太棒啦！
        </h2>
        <p class="text-xs text-gray-500">
          恭喜你成功解开 {{ currentPuzzleTitle }}！
        </p>

        <!-- Stats Pill Grid -->
        <div class="grid grid-cols-3 gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-200">
          <div>
            <div class="text-[10px] text-gray-500 font-bold">用时</div>
            <div class="text-sm font-black text-amber-900 font-mono">{{ formattedTime }}</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 font-bold">提示使用</div>
            <div class="text-sm font-black text-blue-600">{{ hintsUsedCount }} 次</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 font-bold">奖励金币</div>
            <div class="text-sm font-black text-amber-600">🪙 +30</div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="initGame()"
            class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer"
          >
            再来一局 🚀
          </button>
          <button
            @click="goBack"
            class="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm active:scale-95 transition-all cursor-pointer"
          >
            返回
          </button>
        </div>
      </div>
    </div>

    <!-- Preset Level Selector Modal -->
    <div
      v-if="showLevelModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-5 max-w-md w-full border-2 border-gray-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
          <div class="flex items-center gap-2">
            <Layers class="w-5 h-5 text-indigo-600" />
            <h3 class="text-base font-black text-gray-900">少儿精选数独题卡</h3>
          </div>
          <button
            @click="showLevelModal = false"
            class="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Level Cards -->
        <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div
            v-for="p in filteredPresetLevels"
            :key="p.id"
            @click="initGame(p); showLevelModal = false"
            class="p-3.5 rounded-2xl border-2 border-gray-200 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50/50 flex items-center justify-between cursor-pointer transition-all active:scale-98"
          >
            <div class="space-y-1">
              <div class="text-sm font-black text-gray-900 flex items-center gap-2">
                <span>{{ p.title }}</span>
                <span class="text-[10px] px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {{ p.difficulty === 'easy' ? '简单' : p.difficulty === 'medium' ? '进阶' : '大师' }}
                </span>
              </div>
              <div class="text-xs text-gray-400">初始提供 {{ p.cluesCount }} 个线索</div>
            </div>
            <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-2xs">
              开始挑战
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
}
.animate-shake {
  animation: shake 0.35s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
