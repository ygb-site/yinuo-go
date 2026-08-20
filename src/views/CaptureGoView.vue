<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GoGame } from '../engine/GoGame';
import { GoAI } from '../engine/GoAI';
import type { Point, StoneColor, BoardSize } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import {
  playStoneSound,
  playCaptureSound,
  playErrorSound,
  playVictorySound,
  playButtonSound,
  triggerConfetti
} from '../lib/audio';
import { showConfirm, showAlert } from '../utils/alert';
import GoBoard from '../components/board/GoBoard.vue';
import SpeechBubble from '../components/common/SpeechBubble.vue';
import { Swords, RotateCcw, ArrowLeft, X, Maximize2, Minimize2 } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const isZenMode = ref(false);

const goBack = async () => {
  if (!gameOver.value && game.value.history.length > 0) {
    const ok = await showConfirm({
      title: '离开对局提示',
      message: '当前吃子棋对局还在进行中，确定要返回吗？棋局已为你自动保存，随时可以回来继续！',
      type: 'warning',
      confirmText: '确定离开',
      cancelText: '继续对局'
    });
    if (!ok) return;
  }
  playButtonSound();
  router.push('/battle');
};

const STORAGE_KEY = 'yinuo_active_capturego';

// Game settings
const boardSize = ref<BoardSize>(5);
const captureTarget = ref<number>(1); // 1, 3, 5

// Match State
const game = ref<GoGame>(new GoGame(5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);
const isBotThinking = ref(false);
const gameOver = ref(false);
const winner = ref<StoneColor | null>(null);
const showWinModal = ref(false);

// Mascot NuoNuo Reaction State
const mascotMood = ref<'happy' | 'excited' | 'thinking' | 'cheering' | 'comforting' | 'surprised'>('happy');
const mascotText = ref<string>('你好呀！我是你的吃子棋对手小诺，先吃满目标子数的小朋友获胜哦！');

const blackCaptures = computed(() => game.value.capturedByBlack);
const whiteCaptures = computed(() => game.value.capturedByWhite);

const saveCaptureGoalState = () => {
  if (typeof window === 'undefined') return;
  if (gameOver.value || game.value.history.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const payload = {
    boardSize: boardSize.value,
    captureTarget: captureTarget.value,
    history: game.value.history,
    lastMove: lastMove.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const restoreCaptureGoalState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.history || data.history.length === 0) return false;

    boardSize.value = data.boardSize || 5;
    captureTarget.value = data.captureTarget || 1;

    const g = new GoGame(boardSize.value);
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

const initMatch = (isFresh = false) => {
  if (!isFresh && restoreCaptureGoalState()) {
    gameOver.value = false;
    winner.value = null;
    showWinModal.value = false;
    mascotMood.value = 'happy';
    mascotText.value = '✨ 已为你自动恢复刚才未下完的吃子棋对局！';
    showAlert({
      title: '✨ 棋局已自动恢复',
      message: '小诺已为你找回刚才的吃子棋进度，继续进攻吧！',
      type: 'success',
      confirmText: '继续对局 🚀'
    });
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  game.value = new GoGame(boardSize.value);
  lastMove.value = null;
  highlightPoints.value = [];
  isBotThinking.value = false;
  gameOver.value = false;
  winner.value = null;
  showWinModal.value = false;
  mascotMood.value = 'happy';
  mascotText.value = `比赛开始！目标：先吃 ${captureTarget.value} 颗子获胜！黑棋先下哦！`;
  playButtonSound();
};

onMounted(() => {
  initMatch(false);
});

const handlePlayerMove = (point: Point) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (gameOver.value || isBotThinking.value) return;

  const { r, c } = point;
  const res = game.value.playMove(r, c, 'B');

  if (!res.success) {
    playErrorSound();
    mascotMood.value = 'comforting';
    mascotText.value = res.errorReason?.includes('已有棋子')
      ? '这里已经有棋子啦，请选择空的交叉点落子哦！'
      : `哎呀，这里不能落子哦：${res.errorReason || '禁着点'}`;
    return;
  }

  playStoneSound();
  lastMove.value = point;
  saveCaptureGoalState();

  if (res.capturedStones.length > 0) {
    playCaptureSound();
    mascotMood.value = 'surprised';
    mascotText.value = `哇！好漂亮的手筋，一下子提掉了我 ${res.capturedStones.length} 颗白子！`;
  } else {
    mascotMood.value = 'thinking';
    mascotText.value = '黑子落定！小诺正在认真构思反击方案...';
  }

  // Check if player won
  if (game.value.capturedByBlack >= captureTarget.value) {
    handleWin('B');
    return;
  }

  // Check if board full or game finished
  if (game.value.isGameFinished() || (!game.value.hasLegalMoves('B') && !game.value.hasLegalMoves('W'))) {
    handleWin(game.value.capturedByBlack >= game.value.capturedByWhite ? 'B' : 'W');
    return;
  }

  // Trigger AI move
  isBotThinking.value = true;

  setTimeout(() => {
    runAIMove();
  }, 500);
};

const runAIMove = () => {
  if (gameOver.value) return;

  const movePoint = GoAI.selectMove(game.value as any, 'kitty', 'W');
  isBotThinking.value = false;

  if (movePoint) {
    const res = game.value.playMove(movePoint.r, movePoint.c, 'W');
    playStoneSound();
    lastMove.value = movePoint;
    saveCaptureGoalState();

    if (res.capturedStones.length > 0) {
      playCaptureSound();
      mascotMood.value = 'excited';
      mascotText.value = `嘿嘿，小诺也提到了 ${res.capturedStones.length} 颗黑子哦！要小心防守啦~`;
    } else {
      mascotMood.value = 'happy';
      mascotText.value = '小诺落子完毕！轮到黑棋走啦，看准气门继续进攻！';
    }

    // Check if AI won
    if (game.value.capturedByWhite >= captureTarget.value) {
      handleWin('W');
      return;
    }

    // Check if board full or game finished
    if (game.value.isGameFinished() || (!game.value.hasLegalMoves('B') && !game.value.hasLegalMoves('W'))) {
      handleWin(game.value.capturedByBlack >= game.value.capturedByWhite ? 'B' : 'W');
      return;
    }
  } else {
    // AI passes
    game.value.pass('W');
    saveCaptureGoalState();
    mascotMood.value = 'comforting';
    mascotText.value = '小诺这回合选择停一手 (Pass)！该你落子啦！';
  }
};

const handleWin = (winColor: StoneColor) => {
  gameOver.value = true;
  winner.value = winColor;
  localStorage.removeItem(STORAGE_KEY);

  if (winColor === 'B') {
    mascotMood.value = 'cheering';
    mascotText.value = '🎉 太神啦！你率先吃够了目标子数，赢下了这盘对决！';
    const coins = captureTarget.value * 15;
    const exp = captureTarget.value * 25;
    userStore.recordCaptureGoWin(coins, exp);
    playVictorySound();
    triggerConfetti();
  } else {
    mascotMood.value = 'happy';
    mascotText.value = '小诺先完成了吃子目标~ 不要灰心，换个思路再来一局！';
    userStore.recordCaptureGoMatch();
    playErrorSound();
  }

  setTimeout(() => {
    showWinModal.value = true;
  }, 400);
};

const changeBoardSize = (size: BoardSize) => {
  boardSize.value = size;
  initMatch(true);
};

const changeTarget = (target: number) => {
  captureTarget.value = target;
  initMatch(true);
};

const toggleZenMode = () => {
  isZenMode.value = !isZenMode.value;
  playButtonSound();
};
</script>

<template>
  <div
    class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] select-none transition-all"
    :class="isZenMode ? 'p-1 sm:p-3 bg-[#F8F5EE]' : 'py-4 sm:py-8 px-3 sm:px-6 lg:px-8'"
  >
    <div class="max-w-6xl mx-auto space-y-3 sm:space-y-6">

      <!-- =========================================================
           MODE 1: 🧘 ZEN / ZONE 纯净沉浸模式 (极简紧凑 · 专为手机优化)
           ========================================================= -->
      <div v-if="isZenMode" class="space-y-2 max-w-lg mx-auto animate-fade-in">
        
        <!-- Top Sleek Target HUD Bar -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border-2 border-orange-200 shadow-sm flex items-center justify-between gap-2">
          <!-- Back & Return -->
          <button
            @click="goBack"
            class="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 transition active:scale-95 cursor-pointer flex-shrink-0"
            title="返回对弈竞技"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>

          <!-- Player Score -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-orange-300 flex-1 min-w-0">
            <span class="w-3.5 h-3.5 rounded-full bg-black flex-shrink-0"></span>
            <div class="min-w-0 flex-1 leading-tight">
              <div class="text-xs font-black text-gray-900 truncate">{{ userStore.nickname }}</div>
              <div class="text-[10px] text-amber-700 font-bold">已吃: {{ blackCaptures }} / {{ captureTarget }}</div>
            </div>
          </div>

          <!-- Target Center Tag -->
          <div class="bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs flex-shrink-0">
            先吃 {{ captureTarget }} 子
          </div>

          <!-- AI Score -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 flex-1 min-w-0">
            <span class="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 flex-shrink-0"></span>
            <div class="min-w-0 flex-1 leading-tight">
              <div class="text-xs font-black text-gray-900 truncate">小诺</div>
              <div class="text-[10px] text-indigo-700 font-bold">已吃: {{ whiteCaptures }} / {{ captureTarget }}</div>
            </div>
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
        <div class="bg-white rounded-3xl p-3 sm:p-5 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center relative">
          <GoBoard
            :game="game"
            :readonly="gameOver || isBotThinking"
            :manualMove="true"
            :showLiberties="true"
            :showAtari="true"
            :theme="userStore.theme"
            :highlightPoints="highlightPoints"
            :lastMove="lastMove"
            :sizePx="460"
            @move="handlePlayerMove"
          />
        </div>

        <!-- Bottom: Ultra-compact 1-Row Toolbar -->
        <div class="bg-white/95 backdrop-blur-md rounded-2xl p-2 border-2 border-orange-100 shadow-sm flex items-center justify-between gap-1.5">
          <button
            @click="() => initMatch(true)"
            class="flex-1 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>重新开始本局</span>
          </button>

          <button
            @click="goBack"
            class="py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-black text-xs transition active:scale-95 cursor-pointer"
          >
            返回大厅
          </button>
        </div>

      </div>

      <!-- =========================================================
           MODE 2: 🖥️ FULL DESKTOP LAYOUT (完整模式)
           ========================================================= -->
      <template v-else>
        <!-- Header Banner -->
        <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1.5 text-center md:text-left">
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

              <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
                <Swords class="w-3.5 h-3.5 text-amber-700" />
                <span>极速吃子棋对战 (防误触 · 刷新自动恢复)</span>
              </div>
            </div>
            <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
              萌宠吃子棋对局
            </h1>
            <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
              规则超简单的吃子对弈！无需繁琐计算地盘，先吃够目标子数即可获胜，全程自动保存！
            </p>
          </div>

          <!-- User Stats -->
          <div class="flex items-center gap-3">
            <div class="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-center shadow-2xs">
              <div class="text-[10px] font-bold text-amber-700">吃子棋胜场</div>
              <div class="text-xl font-black text-amber-900">
                {{ userStore.captureGoStats.wins }} 胜 / {{ userStore.captureGoStats.matches }} 战
              </div>
            </div>
          </div>
        </div>

        <!-- Main Layout: On mobile board is prioritized at top -->
        <div class="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
          
          <!-- Right / Top: Board & Mascot Dialogue (order-1 on mobile, 8 cols on desktop) -->
          <div class="order-1 lg:order-2 lg:col-span-8 space-y-4 w-full">
            <SpeechBubble
              :text="mascotText"
              :mood="mascotMood"
              :speaker="'小诺 (NuoNuo)'"
              :subtext="isBotThinking ? '小诺正在思考...' : '轮到黑棋落子'"
            />

            <div class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
              <GoBoard
                :game="game"
                :readonly="gameOver || isBotThinking"
                :manualMove="true"
                :showLiberties="true"
                :showAtari="true"
                :theme="userStore.theme"
                :highlightPoints="highlightPoints"
                :lastMove="lastMove"
                :sizePx="480"
                @move="handlePlayerMove"
              />
            </div>
          </div>

          <!-- Left / Bottom: Match Config & Scoreboard (order-2 on mobile, 4 cols on desktop) -->
          <div class="order-2 lg:order-1 lg:col-span-4 space-y-4 w-full">
            
            <!-- Live Scoreboard -->
            <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-4">
              <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between">
                <span>吃子计分牌</span>
                <span class="text-orange-600 font-black">目标：先吃 {{ captureTarget }} 子</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <!-- Player Black -->
                <div class="bg-amber-50 rounded-2xl p-3.5 border border-orange-200 text-center space-y-1">
                  <div class="flex items-center justify-center gap-1.5 text-xs font-black text-gray-800">
                    <span class="w-3.5 h-3.5 rounded-full bg-black inline-block"></span>
                    <span class="truncate">{{ userStore.nickname }} (你 · 执黑先手)</span>
                  </div>
                  <div class="text-3xl font-black text-gray-900 font-mono">
                    {{ blackCaptures }} / {{ captureTarget }}
                  </div>
                  <div class="text-[10px] font-bold text-amber-700">已提白子数</div>
                </div>

                <!-- AI White -->
                <div class="bg-indigo-50 rounded-2xl p-3.5 border border-indigo-200 text-center space-y-1">
                  <div class="flex items-center justify-center gap-1.5 text-xs font-black text-gray-800">
                    <span class="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 inline-block"></span>
                    <span>导师小诺 (AI 自动执白)</span>
                  </div>
                  <div class="text-3xl font-black text-indigo-900 font-mono">
                    {{ whiteCaptures }} / {{ captureTarget }}
                  </div>
                  <div class="text-[10px] font-bold text-indigo-700">已提黑子数</div>
                </div>
              </div>

              <!-- Match Control Settings -->
              <div class="space-y-3 pt-2 border-t border-gray-100 text-xs font-black">
                <!-- Win Target -->
                <div>
                  <div class="text-gray-500 mb-1.5">胜利目标：</div>
                  <div class="grid grid-cols-3 gap-1.5">
                    <button
                      v-for="t in [1, 3, 5]"
                      :key="t"
                      @click="changeTarget(t)"
                      class="py-2 rounded-xl border transition active:scale-95 cursor-pointer"
                      :class="captureTarget === t ? 'bg-orange-500 text-white border-transparent shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200'"
                    >
                      先吃 {{ t }} 子
                    </button>
                  </div>
                </div>

                <!-- Board Size -->
                <div>
                  <div class="text-gray-500 mb-1.5">棋盘大小：</div>
                  <div class="grid grid-cols-3 gap-1.5">
                    <button
                      v-for="s in [5, 7, 9]"
                      :key="s"
                      @click="changeBoardSize(s as BoardSize)"
                      class="py-2 rounded-xl border transition active:scale-95 cursor-pointer"
                      :class="boardSize === s ? 'bg-orange-500 text-white border-transparent shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200'"
                    >
                      {{ s }}x{{ s }} 盘
                    </button>
                  </div>
                </div>

                <!-- Restart Button -->
                <button
                  @click="() => initMatch(true)"
                  class="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw class="w-4 h-4" />
                  <span>重新开始对局</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </template>

    </div>

    <!-- Win Modal -->
    <div
      v-if="showWinModal"
      class="fixed inset-0 z-50 overflow-hidden bg-black/60 no-scrollbar modal-overlay backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
      @click.self="showWinModal = false"
    >
      <div class="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl text-center space-y-4 animate-pop-in">
        <!-- Close button in top-right -->
        <button
          type="button"
          @click="showWinModal = false"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
          title="关闭"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="text-5xl">{{ winner === 'B' ? '🎉' : '🤗' }}</div>
        <h2 class="text-2xl font-black text-gray-900 font-cartoon">
          {{ winner === 'B' ? '恭喜获胜！太棒啦！' : '小诺险胜一筹！' }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-600 font-medium">
          {{ winner === 'B' ? '你率先完成了吃子目标，展现了超强的手筋捕捉能力！' : '再来一局，发挥你敏锐的棋感反超小诺吧！' }}
        </p>

        <div v-if="winner === 'B'" class="grid grid-cols-2 gap-3 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs font-black">
          <div class="text-amber-800">金币奖励 +{{ captureTarget * 15 }}</div>
          <div class="text-indigo-800">经验奖励 +{{ captureTarget * 25 }} XP</div>
        </div>

        <div class="flex gap-2.5 pt-2">
          <button
            type="button"
            @click="showWinModal = false"
            class="flex-1 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
          >
            返回棋盘
          </button>
          <button
            type="button"
            @click="() => initMatch(true)"
            class="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>再战一局 🚀</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

