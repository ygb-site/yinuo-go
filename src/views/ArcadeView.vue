<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { GoGame } from '../engine/GoGame';
import type { Point } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import {
  playStoneSound,
  playCaptureSound,
  playErrorSound,
  playVictorySound,
  playCoinSound,
  playButtonSound,
  triggerConfetti
} from '../lib/audio';
import GoBoard from '../components/board/GoBoard.vue';
import {
  Zap,
  Flame,
  Clock,
  Coins,
  Eye,
  Sparkles,
  Gamepad2
} from 'lucide-vue-next';

const userStore = useUserStore();

type GameMode = 'speedCapture' | 'countLiberties' | 'connectCut';
const currentMode = ref<GameMode>('speedCapture');

// Game Engine State
const game = ref<GoGame>(new GoGame(5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);

// Arcade Loop State
const isPlaying = ref(false);
const timeLeft = ref(60);
const score = ref(0);
const combo = ref(0);
const maxCombo = ref(0);
const correctCount = ref(0);
const showGameOverModal = ref(false);
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Count Liberties Mode specific
const currentTargetGroup = ref<Point[]>([]);
const currentTargetLibertyCount = ref<number>(0);
const showFeedback = ref<boolean>(false);
const isLastAnswerCorrect = ref<boolean>(false);

// Connect/Cut Mode specific
const connectCutQuestion = ref<{
  question: string;
  correctAnswer: 'connect' | 'cut';
  coord: Point;
}>({
  question: '',
  correctAnswer: 'connect',
  coord: { r: 2, c: 2 }
});

// Speed capture puzzle generator
const generateSpeedCapturePuzzle = () => {
  const g = new GoGame(5);
  lastMove.value = null;
  highlightPoints.value = [];

  const types = ['center', 'corner', 'edge', 'two_stones'];
  const picked = types[Math.floor(Math.random() * types.length)];

  if (picked === 'corner') {
    // Corner capture at (0,0)
    g.setCell(0, 0, 'W');
    g.setCell(0, 1, 'B');
  } else if (picked === 'edge') {
    // Edge capture at (2,0)
    g.setCell(2, 0, 'W');
    g.setCell(1, 0, 'B');
    g.setCell(3, 0, 'B');
  } else if (picked === 'two_stones') {
    // Two stones at (2,2) and (2,3)
    g.setCell(2, 2, 'W');
    g.setCell(2, 3, 'W');
    g.setCell(1, 2, 'B');
    g.setCell(1, 3, 'B');
    g.setCell(3, 2, 'B');
    g.setCell(3, 3, 'B');
    g.setCell(2, 1, 'B');
  } else {
    // Center single stone at (2,2)
    g.setCell(2, 2, 'W');
    g.setCell(1, 2, 'B');
    g.setCell(3, 2, 'B');
    g.setCell(2, 1, 'B');
  }

  g.turn = 'B';
  game.value = g;
};

// Count liberties generator
const generateCountLibertiesPuzzle = () => {
  const g = new GoGame(5);
  lastMove.value = null;
  showFeedback.value = false;

  const patterns = [
    // 1 liberty
    () => {
      g.setCell(2, 2, 'W');
      g.setCell(1, 2, 'B');
      g.setCell(3, 2, 'B');
      g.setCell(2, 1, 'B');
      currentTargetGroup.value = [{ r: 2, c: 2 }];
      currentTargetLibertyCount.value = 1;
      highlightPoints.value = [{ r: 2, c: 2 }];
    },
    // 2 liberties
    () => {
      g.setCell(0, 0, 'W');
      currentTargetGroup.value = [{ r: 0, c: 0 }];
      currentTargetLibertyCount.value = 2;
      highlightPoints.value = [{ r: 0, c: 0 }];
    },
    // 3 liberties
    () => {
      g.setCell(2, 0, 'W');
      currentTargetGroup.value = [{ r: 2, c: 0 }];
      currentTargetLibertyCount.value = 3;
      highlightPoints.value = [{ r: 2, c: 0 }];
    },
    // 4 liberties
    () => {
      g.setCell(2, 2, 'W');
      currentTargetGroup.value = [{ r: 2, c: 2 }];
      currentTargetLibertyCount.value = 4;
      highlightPoints.value = [{ r: 2, c: 2 }];
    },
    // 5+ liberties (2 connected stones in center)
    () => {
      g.setCell(2, 2, 'W');
      g.setCell(2, 3, 'W');
      currentTargetGroup.value = [{ r: 2, c: 2 }, { r: 2, c: 3 }];
      currentTargetLibertyCount.value = 6;
      highlightPoints.value = [{ r: 2, c: 2 }, { r: 2, c: 3 }];
    }
  ];

  const picked = patterns[Math.floor(Math.random() * patterns.length)];
  picked();
  g.turn = 'B';
  game.value = g;
};

// Connect / Cut puzzle generator
const generateConnectCutPuzzle = () => {
  const g = new GoGame(5);
  lastMove.value = null;

  const isCut = Math.random() > 0.5;
  if (isCut) {
    g.setCell(1, 2, 'W');
    g.setCell(2, 3, 'W');
    g.setCell(1, 3, 'B');
    g.setCell(3, 2, 'B');
    connectCutQuestion.value = {
      question: '黑棋在此处落子是【分断白棋】还是【自己连接】？',
      correctAnswer: 'cut',
      coord: { r: 2, c: 2 }
    };
    highlightPoints.value = [{ r: 2, c: 2 }];
  } else {
    g.setCell(2, 1, 'B');
    g.setCell(2, 3, 'B');
    g.setCell(1, 2, 'W');
    g.setCell(3, 2, 'W');
    connectCutQuestion.value = {
      question: '黑棋在此处落子是【连接黑子】还是【分断白棋】？',
      correctAnswer: 'connect',
      coord: { r: 2, c: 2 }
    };
    highlightPoints.value = [{ r: 2, c: 2 }];
  }

  g.turn = 'B';
  game.value = g;
};

const startGame = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  isPlaying.value = true;
  timeLeft.value = 60;
  score.value = 0;
  combo.value = 0;
  maxCombo.value = 0;
  correctCount.value = 0;
  showGameOverModal.value = false;
  playButtonSound();

  if (currentMode.value === 'speedCapture') {
    generateSpeedCapturePuzzle();
  } else if (currentMode.value === 'countLiberties') {
    generateCountLibertiesPuzzle();
  } else {
    generateConnectCutPuzzle();
  }

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      endGame();
    }
  }, 1000);
};

const endGame = () => {
  if (timerInterval) clearInterval(timerInterval);
  isPlaying.value = false;
  showGameOverModal.value = true;

  const coinsEarned = Math.max(5, Math.floor(score.value / 40));
  userStore.recordArcadeScore(currentMode.value, score.value, coinsEarned);
  playVictorySound();
  triggerConfetti();
};

const switchMode = (mode: GameMode) => {
  if (isPlaying.value) {
    if (timerInterval) clearInterval(timerInterval);
    isPlaying.value = false;
  }
  currentMode.value = mode;
  playButtonSound();
  if (mode === 'speedCapture') generateSpeedCapturePuzzle();
  else if (mode === 'countLiberties') generateCountLibertiesPuzzle();
  else generateConnectCutPuzzle();
};

const handleBoardMove = (point: Point) => {
  if (!isPlaying.value || currentMode.value !== 'speedCapture') return;

  const testGame = game.value.clone();
  const res = testGame.playMove(point.r, point.c, 'B');

  if (res.success && res.capturedStones.length > 0) {
    game.value.playMove(point.r, point.c, 'B');
    playStoneSound();
    playCaptureSound();

    combo.value++;
    if (combo.value > maxCombo.value) maxCombo.value = combo.value;
    correctCount.value++;
    const bonus = 100 + combo.value * 25;
    score.value += bonus;

    setTimeout(() => {
      generateSpeedCapturePuzzle();
    }, 250);
  } else {
    playErrorSound();
    combo.value = 0;
  }
};

const handleLibertyChoice = (choice: number) => {
  if (!isPlaying.value || currentMode.value !== 'countLiberties') return;

  const actual = currentTargetLibertyCount.value;
  const isCorrect = (choice === 5 && actual >= 5) || choice === actual;

  showFeedback.value = true;
  isLastAnswerCorrect.value = isCorrect;

  if (isCorrect) {
    playCoinSound();
    combo.value++;
    if (combo.value > maxCombo.value) maxCombo.value = combo.value;
    correctCount.value++;
    score.value += 100 + combo.value * 20;

    setTimeout(() => {
      generateCountLibertiesPuzzle();
    }, 400);
  } else {
    playErrorSound();
    combo.value = 0;
  }
};

const handleConnectCutChoice = (choice: 'connect' | 'cut') => {
  if (!isPlaying.value || currentMode.value !== 'connectCut') return;

  const isCorrect = choice === connectCutQuestion.value.correctAnswer;
  showFeedback.value = true;
  isLastAnswerCorrect.value = isCorrect;

  if (isCorrect) {
    playCoinSound();
    combo.value++;
    if (combo.value > maxCombo.value) maxCombo.value = combo.value;
    correctCount.value++;
    score.value += 120 + combo.value * 30;

    setTimeout(() => {
      generateConnectCutPuzzle();
    }, 400);
  } else {
    playErrorSound();
    combo.value = 0;
  }
};

onMounted(() => {
  generateSpeedCapturePuzzle();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center md:text-left">
          <div class="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-black">
            <Zap class="w-3.5 h-3.5 fill-current" />
            <span>趣味反应乐园 · 60秒极限特训</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            极速手筋与反应挑战
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            在紧张刺激的倒计时中建立对“气”与“提子”的闪电直觉，赢取丰厚金币！
          </p>
        </div>

        <!-- Mode Selectors -->
        <div class="flex items-center bg-amber-50 p-1.5 rounded-2xl border border-orange-200 shadow-inner gap-1">
          <button
            @click="switchMode('speedCapture')"
            class="px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
            :class="currentMode === 'speedCapture' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
          >
            <Zap class="w-3.5 h-3.5 fill-current" />
            <span>⚡ 闪电提子</span>
          </button>

          <button
            @click="switchMode('countLiberties')"
            class="px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
            :class="currentMode === 'countLiberties' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>🔢 数气大作战</span>
          </button>

          <button
            @click="switchMode('connectCut')"
            class="px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
            :class="currentMode === 'connectCut' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
          >
            <Gamepad2 class="w-3.5 h-3.5" />
            <span>🔗 连络与分断</span>
          </button>
        </div>
      </div>

      <!-- Main Game Dashboard -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Live Stats & Instructions (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          
          <!-- Timer & Score Card -->
          <div class="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-lg space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-xs font-black bg-white/20 px-3 py-1 rounded-full">
                <Clock class="w-4 h-4" />
                <span>剩余时间</span>
              </div>
              <div class="text-3xl font-black font-mono">
                {{ timeLeft }}s
              </div>
            </div>

            <!-- Score & Combo -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-white/20">
              <div class="bg-black/10 rounded-2xl p-3 text-center">
                <div class="text-[10px] font-bold text-white/80">当前得分</div>
                <div class="text-2xl font-black text-yellow-200 font-mono">{{ score }}</div>
              </div>

              <div class="bg-black/10 rounded-2xl p-3 text-center relative overflow-hidden">
                <div class="text-[10px] font-bold text-white/80">连击 Combo</div>
                <div class="text-2xl font-black text-white font-mono flex items-center justify-center gap-1">
                  <Flame v-if="combo >= 3" class="w-5 h-5 text-yellow-300 animate-bounce" />
                  <span>{{ combo }}x</span>
                </div>
              </div>
            </div>

            <!-- Start / Stop Button -->
            <button
              v-if="!isPlaying"
              @click="startGame"
              class="w-full py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-orange-600 font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap class="w-4 h-4 fill-current" />
              <span>开始 60 秒极速挑战 🚀</span>
            </button>
            <div v-else class="text-center text-xs font-black bg-white/20 py-2.5 rounded-xl">
              🔥 正在挑战中，请全神贯注！
            </div>
          </div>

          <!-- Mode Guidance Box -->
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-2.5 text-xs font-medium text-gray-700">
            <div class="font-black text-gray-900 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-orange-500" />
              <span>玩法规则：</span>
            </div>
            <p v-if="currentMode === 'speedCapture'">
              棋盘上会不断出现被叫吃的白子，在 60 秒内以最快速度点击提吃白子！连击越高得分翻倍！
            </p>
            <p v-else-if="currentMode === 'countLiberties'">
              观察棋盘上高亮的这块棋，数一数它一共有几口气，快速点击下方气数按钮！
            </p>
            <p v-else>
              快速判断棋盘上高亮的交汇点，黑棋落子属于“连络”还是“分断”？
            </p>
            <div class="pt-2 border-t border-gray-100 flex items-center justify-between font-black text-orange-600">
              <span>历史最高分：</span>
              <span class="font-mono text-sm">
                {{ userStore.arcadeHighScores[currentMode] || 0 }} 分
              </span>
            </div>
          </div>

        </div>

        <!-- Right: Interactive Go Board & Controls (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-5">
            
            <GoBoard
              :game="game"
              :readonly="!isPlaying || currentMode !== 'speedCapture'"
              :showLiberties="true"
              :showAtari="true"
              :theme="userStore.theme"
              :highlightPoints="highlightPoints"
              :lastMove="lastMove"
              :sizePx="460"
              @move="handleBoardMove"
            />

            <!-- Specific Control Buttons for Count Liberties Mode -->
            <div v-if="currentMode === 'countLiberties' && isPlaying" class="w-full space-y-2 animate-fade-in">
              <div class="text-center text-xs font-black text-gray-600">
                请选择高亮棋子的气数：
              </div>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="n in [1, 2, 3, 4, 5]"
                  :key="n"
                  @click="handleLibertyChoice(n)"
                  class="py-3 rounded-2xl font-black text-sm sm:text-base border-2 transition active:scale-95 cursor-pointer bg-gradient-to-tr from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-orange-300 text-orange-950 shadow-xs"
                >
                  {{ n === 5 ? '5+ 气' : n + ' 气' }}
                </button>
              </div>
            </div>

            <!-- Specific Control Buttons for Connect / Cut Mode -->
            <div v-if="currentMode === 'connectCut' && isPlaying" class="w-full space-y-2 animate-fade-in">
              <div class="text-center text-xs font-black text-gray-700">
                {{ connectCutQuestion.question }}
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="handleConnectCutChoice('connect')"
                  class="py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md transition active:scale-95 cursor-pointer"
                >
                  🛡️ 己方连络 (Connect)
                </button>
                <button
                  @click="handleConnectCutChoice('cut')"
                  class="py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-md transition active:scale-95 cursor-pointer"
                >
                  ⚔️ 分断敌棋 (Cut)
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- Game Over Modal -->
    <div
      v-if="showGameOverModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl text-center space-y-4 animate-pop-in">
        <div class="text-5xl">🏆</div>
        <h2 class="text-2xl font-black text-gray-900">挑战完成！太厉害了！</h2>
        
        <div class="grid grid-cols-2 gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <div>
            <div class="text-xs font-bold text-amber-700">最终得分</div>
            <div class="text-2xl font-black text-amber-900 font-mono">{{ score }}</div>
          </div>
          <div>
            <div class="text-xs font-bold text-amber-700">最高连击</div>
            <div class="text-2xl font-black text-orange-600 font-mono">{{ maxCombo }}x</div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 bg-indigo-50 p-3 rounded-2xl border border-indigo-200 text-xs font-bold text-indigo-900">
          <Coins class="w-4 h-4 text-amber-500" />
          <span>获得金币奖励：+{{ Math.max(5, Math.floor(score / 40)) }}</span>
        </div>

        <button
          @click="startGame"
          class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          再战一局 🚀
        </button>
      </div>
    </div>

  </div>
</template>

