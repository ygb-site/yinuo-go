<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { GoBoard } from '../engine/GoBoard';
import { GoAI, AI_BOTS, type AIDifficulty, type AIPersonality } from '../engine/GoAI';
import type { Point, StoneColor, ScoreBreakdown } from '../engine/types';
import { useUserStore } from '../stores/userStore';
import { sound } from '../utils/sound';
import GoBoardComponent from '../components/GoBoard.vue';
import MascotNuoNuo, { type MascotMood } from '../components/MascotNuoNuo.vue';
import ScoreModal from '../components/ScoreModal.vue';
import {
  Bot,
  Lightbulb,
  RotateCcw,
  Flag,
  Hand,
  Eye,
  AlertTriangle,
  Flame,
  ArrowLeft,
  Undo2,
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const goBack = () => {
  sound.playButtonSound();
  router.push('/battle');
};

const selectedBot = ref<AIDifficulty>('puppy');
const boardSize = ref<number>(9);
const userColor = ref<StoneColor>('B');
const komi = ref<number>(5.5);

// Game Board State
const board = ref<GoBoard>(new GoBoard(9, 5.5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);
const isBotThinking = ref(false);
const mascotMood = ref<MascotMood>('happy');
const mascotMessage = ref<string>('');

// Assistant settings
const showLiberties = ref(userStore.showLibertiesOverlay);
const showAtari = ref(userStore.showAtariAlerts);
const showTerritory = ref(userStore.showTerritoryHeatmap);

// Modal state
const isGameOver = ref(false);
const scoreResult = ref<ScoreBreakdown | null>(null);
const showScoreModal = ref(false);

const activeBotInfo = computed<AIPersonality>(() => AI_BOTS[selectedBot.value]);

const initGame = () => {
  board.value = new GoBoard(boardSize.value, komi.value);
  lastMove.value = null;
  highlightPoints.value = [];
  isGameOver.value = false;
  scoreResult.value = null;
  showScoreModal.value = false;
  isBotThinking.value = false;

  mascotMood.value = 'happy';
  mascotMessage.value = `【${activeBotInfo.value.name}】：“${activeBotInfo.value.catchphrase}” 准备好了吗？开始对局！`;

  // If user plays White, bot (Black) moves first!
  if (userColor.value === 'W') {
    triggerBotMove();
  }
};

onMounted(() => {
  initGame();
});

const handlePlay = (point: Point) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }

  if (isGameOver.value || isBotThinking.value) return;

  const currentTurn = board.value.turn;
  if (currentTurn !== userColor.value) return;

  const { r, c } = point;
  const result = board.value.playMove(r, c, userColor.value);

  if (!result.success) {
    sound.playErrorSound();
    mascotMood.value = 'comforting';
    mascotMessage.value = '这里是禁着点或者已经有棋子啦，换个地方试试吧！';
    return;
  }

  lastMove.value = point;
  highlightPoints.value = [];
  sound.playStoneSound();

  if (result.capturedStones.length > 0) {
    sound.playCaptureSound();
    mascotMood.value = 'cheering';
    mascotMessage.value = `好棋！提掉了对手 ${result.capturedStones.length} 颗子！`;
  }

  // Trigger bot's turn
  triggerBotMove();
};

const triggerBotMove = () => {
  const botColor = board.value.getOpponentColor(userColor.value);
  isBotThinking.value = true;
  mascotMood.value = 'thinking';
  mascotMessage.value = `${activeBotInfo.value.name} 正在认真思考中...`;

  const thinkTime = 400 + Math.random() * 400;

  setTimeout(() => {
    if (isGameOver.value) return;

    const movePoint = GoAI.selectMove(board.value, selectedBot.value, botColor);

    if (!movePoint) {
      const ends = board.value.pass(botColor);
      sound.playButtonSound();
      mascotMood.value = 'happy';
      mascotMessage.value = `${activeBotInfo.value.name} 选择了虚手 (Pass)！`;
      if (ends) endGame();
    } else {
      const result = board.value.playMove(movePoint.r, movePoint.c, botColor);
      sound.playStoneSound();
      lastMove.value = movePoint;

      if (result.capturedStones.length > 0) {
        sound.playCaptureSound();
        mascotMood.value = 'excited';
        mascotMessage.value = `${activeBotInfo.value.name} 发动进攻，吃掉了你的棋子！小心防守哦！`;
      } else {
        mascotMood.value = 'happy';
        mascotMessage.value = `${activeBotInfo.value.name} 落子在 (${movePoint.r + 1}, ${movePoint.c + 1})。轮到你啦！`;
      }
    }

    isBotThinking.value = false;
  }, thinkTime);
};

const handlePass = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (isGameOver.value || isBotThinking.value) return;

  sound.playButtonSound();
  const ends = board.value.pass(userColor.value);
  mascotMood.value = 'happy';
  mascotMessage.value = '你选择了虚手 (Pass)。';

  if (ends) {
    endGame();
  } else {
    triggerBotMove();
  }
};

const handleUndo = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (isGameOver.value || isBotThinking.value) return;
  // Undo 2 plies (both bot and player)
  if (board.value.history.length >= 2) {
    board.value.undo();
    board.value.undo();
    sound.playButtonSound();
    lastMove.value = board.value.history.length > 0 ? board.value.history[board.value.history.length - 1].point : null;
    mascotMood.value = 'happy';
    mascotMessage.value = '已悔棋两步，重新仔细想想怎么走吧！';
  } else if (board.value.history.length === 1) {
    board.value.undo();
    sound.playButtonSound();
    lastMove.value = null;
  }
};

const handleResign = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (isGameOver.value) return;
  sound.playErrorSound();
  isGameOver.value = true;
  mascotMood.value = 'comforting';
  mascotMessage.value = '胜败乃兵家常事，下局一定能赢！';
  const botColor = board.value.getOpponentColor(userColor.value);
  scoreResult.value = {
    blackStones: 0,
    whiteStones: 0,
    blackTerritory: 0,
    whiteTerritory: 0,
    dame: 0,
    komi: board.value.komi,
    blackTotal: 0,
    whiteTotal: 0,
    winner: botColor,
    margin: 99,
    territoryMap: []
  };
  showScoreModal.value = true;
};

const handleAIMoveHint = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playHintSound();
  sound.fireMiniSparkles();
  const hint = GoAI.getBestMoveHint(board.value, userColor.value);
  if (hint) {
    highlightPoints.value = [hint.point];
    mascotMood.value = 'excited';
    mascotMessage.value = `【小诺妙招】：建议下在闪光点，理由是【${hint.reason}】！`;
  }
};

const endGame = () => {
  isGameOver.value = true;
  const score = board.value.calculateScore();
  scoreResult.value = score;
  showScoreModal.value = true;

  const won = score.winner === userColor.value;
  if (won) {
    sound.playWinSound();
    sound.fireCelebrationConfetti();
    userStore.addExp(150);
    userStore.addCoins(50);
    mascotMood.value = 'cheering';
    mascotMessage.value = `太棒啦！你战胜了 ${activeBotInfo.value.name}！获得 150 经验与 50 金币！`;

    // Unlock badges based on bot
    if (selectedBot.value === 'puppy') userStore.unlockBadge('defeat_puppy');
    if (selectedBot.value === 'kitty') userStore.unlockBadge('defeat_kitty');
    if (selectedBot.value === 'fox') userStore.unlockBadge('defeat_fox');
    if (selectedBot.value === 'panda') userStore.unlockBadge('defeat_panda');
    if (selectedBot.value === 'master') userStore.unlockBadge('defeat_master');
  } else {
    sound.playErrorSound();
    userStore.addExp(40);
    userStore.addCoins(10);
  }

  userStore.recordGameEnd(
    won,
    userColor.value === 'B' ? board.value.capturedByBlack : board.value.capturedByWhite,
    board.value.history.length
  );
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-8 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div class="space-y-1.5 sm:space-y-2 text-center md:text-left z-10">
          <div class="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <button
              @click="goBack"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-black transition active:scale-95 cursor-pointer border border-orange-200 shadow-2xs"
              title="返回对弈竞技"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>返回对弈竞技</span>
            </button>
            <div class="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-black">
              <Bot class="w-3.5 h-3.5" />
              <span>智能人机对弈场 (AI Arena)</span>
            </div>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            挑战萌宠围棋大师
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            选择不同棋力的对手，开启辅助提示，在实战中磨砺棋艺！
          </p>
        </div>

        <!-- Bot Selector Buttons -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto z-10">
          <button
            v-for="(bot, key) in AI_BOTS"
            :key="key"
            @click="selectedBot = key; initGame()"
            class="px-3 py-2 rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-black whitespace-nowrap flex-shrink-0 cursor-pointer shadow-2xs"
            :class="
              selectedBot === key
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-orange-50'
            "
          >
            <span class="text-base">{{ bot.avatar }}</span>
            <span>{{ bot.name }}</span>
            <span class="text-[10px] opacity-80">({{ bot.rank }})</span>
          </button>
        </div>
      </div>

      <!-- Main Battle Layout: On Mobile, Board is placed prominently at top -->
      <div class="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">

        <!-- Right / Top Column: Mascot & Board (order-1 on mobile, 8 cols on desktop) -->
        <div class="order-1 lg:order-2 lg:col-span-8 space-y-4">
          <!-- Mascot NuoNuo -->
          <MascotNuoNuo
            :message="mascotMessage"
            :mood="mascotMood"
            :speakerName="activeBotInfo.name"
            :subtext="`当前对局：${boardSize}x${boardSize} 棋盘 · ${userColor === 'B' ? '你执黑' : '你执白'}`"
          />

          <!-- GoBoard Card -->
          <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            
            <!-- In-Board Mini Stats Header (Mobile visible) -->
            <div class="w-full flex items-center justify-between pb-2 border-b border-gray-100 text-xs font-bold">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ activeBotInfo.avatar }}</span>
                <span class="font-black text-gray-800">{{ activeBotInfo.name }}</span>
                <span class="text-[10px] font-black bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                  {{ activeBotInfo.rank }}
                </span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="text-emerald-700 font-extrabold">你提: {{ userColor === 'B' ? board.capturedByBlack : board.capturedByWhite }}</span>
                <span class="text-gray-300">|</span>
                <span class="text-rose-700 font-extrabold">AI提: {{ userColor === 'B' ? board.capturedByWhite : board.capturedByBlack }}</span>
              </div>
            </div>

            <!-- GoBoard Component -->
            <GoBoardComponent
              :board="board"
              :playerColor="userColor"
              :lastMove="lastMove"
              :highlightPoints="highlightPoints"
              :showLiberties="showLiberties"
              :showAtari="showAtari"
              :showTerritory="showTerritory"
              :theme="userStore.theme"
              :manualMove="true"
              :sizePx="440"
              :disabled="isGameOver || isBotThinking || board.turn !== userColor"
              @play="handlePlay"
            />

            <!-- In-Board Quick Action Bar -->
            <div class="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <div class="flex items-center gap-1.5">
                <button
                  @click="handleAIMoveHint"
                  :disabled="isGameOver || isBotThinking"
                  class="py-2 px-3 sm:px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Lightbulb class="w-4 h-4 fill-current" />
                  <span>AI 推荐点</span>
                </button>

                <button
                  @click="handleUndo"
                  :disabled="isGameOver || isBotThinking || board.history.length === 0"
                  class="py-2 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-40"
                >
                  <Undo2 class="w-3.5 h-3.5" />
                  <span>悔棋</span>
                </button>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  @click="handlePass"
                  :disabled="isGameOver || isBotThinking"
                  class="py-2 px-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Hand class="w-3.5 h-3.5" />
                  <span>虚手</span>
                </button>

                <button
                  @click="handleResign"
                  :disabled="isGameOver"
                  class="py-2 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Flag class="w-3.5 h-3.5" />
                  <span>认输数子</span>
                </button>

                <button
                  @click="initGame"
                  class="py-2 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>重开</span>
                </button>
              </div>
            </div>

            <!-- Helper Toggles Bar -->
            <div class="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs font-bold">
              <div class="flex items-center gap-2">
                <button
                  @click="showLiberties = !showLiberties"
                  class="px-2.5 py-1 rounded-xl border transition flex items-center gap-1 active:scale-95 text-[11px] cursor-pointer"
                  :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <Eye class="w-3 h-3" />
                  <span>显示气数</span>
                </button>

                <button
                  @click="showAtari = !showAtari"
                  class="px-2.5 py-1 rounded-xl border transition flex items-center gap-1 active:scale-95 text-[11px] cursor-pointer"
                  :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <AlertTriangle class="w-3 h-3" />
                  <span>叫吃警报</span>
                </button>

                <button
                  @click="showTerritory = !showTerritory"
                  class="px-2.5 py-1 rounded-xl border transition flex items-center gap-1 active:scale-95 text-[11px] cursor-pointer"
                  :class="showTerritory ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <Flame class="w-3 h-3" />
                  <span>领地预览</span>
                </button>
              </div>

              <div class="text-[11px] font-black text-gray-400">
                手数: {{ board.history.length }}
              </div>
            </div>
          </div>
        </div>

        <!-- Left / Bottom Column: Settings & Personality (order-2 on mobile, 4 cols on desktop) -->
        <div class="order-2 lg:order-1 lg:col-span-4 space-y-4">
          <!-- Opponent Card -->
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-200 p-2 border-2 border-orange-300 flex items-center justify-center text-3xl shadow-sm">
                {{ activeBotInfo.avatar }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base font-black text-gray-900">{{ activeBotInfo.name }}</span>
                  <span class="text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    {{ activeBotInfo.rank }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 font-medium mt-1">
                  {{ activeBotInfo.description }}
                </p>
              </div>
            </div>

            <!-- Game Setup Options (Board Size & Color) -->
            <div class="space-y-3 pt-2 border-t border-gray-100 text-xs font-bold text-gray-700">
              <div class="flex items-center justify-between">
                <span>棋盘路数</span>
                <div class="flex gap-1">
                  <button
                    v-for="s in [5, 7, 9, 13, 19]"
                    :key="s"
                    @click="boardSize = s; initGame()"
                    class="px-2 py-1 rounded-lg border text-xs font-black transition cursor-pointer"
                    :class="boardSize === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'"
                  >
                    {{ s }}x{{ s }}
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span>执子先后</span>
                <div class="flex gap-1">
                  <button
                    @click="userColor = 'B'; initGame()"
                    class="px-3 py-1 rounded-lg border text-xs font-black transition cursor-pointer"
                    :class="userColor === 'B' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200'"
                  >
                    执黑先下
                  </button>
                  <button
                    @click="userColor = 'W'; initGame()"
                    class="px-3 py-1 rounded-lg border text-xs font-black transition cursor-pointer"
                    :class="userColor === 'W' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-gray-50 border-gray-200'"
                  >
                    执白后下
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Score Breakdown Modal -->
    <ScoreModal
      v-if="scoreResult"
      :isOpen="showScoreModal"
      :score="scoreResult"
      :userColor="userColor"
      @close="showScoreModal = false"
      @restart="initGame"
    />
  </div>
</template>
