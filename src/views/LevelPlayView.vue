<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CURRICULUM_CHAPTERS, type LevelItem } from '../data/curriculum';
import { GoBoard } from '../engine/GoBoard';
import type { Point } from '../engine/types';
import { useAdventureStore } from '../stores/adventureStore';
import { useUserStore } from '../stores/userStore';
import { sound } from '../utils/sound';
import GoBoardComponent from '../components/GoBoard.vue';
import MascotNuoNuo, { type MascotMood } from '../components/MascotNuoNuo.vue';
import LevelCompleteModal from '../components/LevelCompleteModal.vue';
import {
  Lightbulb,
  RotateCcw,
  Eye,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Star,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const adventureStore = useAdventureStore();
const userStore = useUserStore();

// Flatten all levels to find current level
const allLevels = computed<LevelItem[]>(() => {
  const list: LevelItem[] = [];
  for (const c of CURRICULUM_CHAPTERS) {
    list.push(...c.levels);
  }
  return list;
});

const currentLevel = computed<LevelItem>(() => {
  const id = route.params.id as string;
  const found = allLevels.value.find(l => l.id === id);
  return found || allLevels.value[0];
});

const currentIndex = computed(() => {
  return allLevels.value.findIndex(l => l.id === currentLevel.value.id);
});

const hasNextLevel = computed(() => {
  return currentIndex.value < allLevels.value.length - 1;
});

const nextLevelItem = computed(() => {
  if (hasNextLevel.value) {
    return allLevels.value[currentIndex.value + 1];
  }
  return null;
});

// Board & Play State
const board = ref<GoBoard>(new GoBoard(5));
const lastMove = ref<Point | null>(null);
const mascotMood = ref<MascotMood>('happy');
const mascotMessage = ref<string>('');
const isCompleted = ref(false);
const showCompleteModal = ref(false);
const stepIndex = ref(0);
const attempts = ref(0);
const highlightPoints = ref<Point[]>([]);
const isBotThinking = ref(false);
const earnedStars = ref(3);

const showLiberties = ref(userStore.showLibertiesOverlay);
const showAtari = ref(userStore.showAtariAlerts);

const initLevel = () => {
  const lvl = currentLevel.value;
  board.value = new GoBoard(lvl.boardSize);
  lastMove.value = null;
  stepIndex.value = 0;
  isCompleted.value = false;
  showCompleteModal.value = false;
  highlightPoints.value = [];
  isBotThinking.value = false;
  earnedStars.value = 3;

  // Place initial stones
  for (const st of lvl.initialStones) {
    board.value.setCell(st.r, st.c, st.color);
  }
  board.value.turn = lvl.playerColor;

  mascotMood.value = 'happy';
  mascotMessage.value = `【${lvl.title}】${lvl.story} 你的任务：${lvl.goal}`;
};

onMounted(() => {
  initLevel();
});

watch(() => route.params.id, () => {
  initLevel();
});

const handlePlay = (point: Point) => {
  if (isCompleted.value || isBotThinking.value) return;

  const lvl = currentLevel.value;
  const { r, c } = point;

  // Validate legality
  const check = board.value.isLegalMove(r, c, lvl.playerColor);
  if (!check.legal) {
    sound.playErrorSound();
    mascotMood.value = 'comforting';
    mascotMessage.value = `哎呀，这里不能落子哦：${check.reason}。换个地方试试吧！`;
    return;
  }

  // Handle Level Step Logic
  if (lvl.type === 'step_by_step' && lvl.solutionSequence) {
    const expectedStep = lvl.solutionSequence[stepIndex.value];
    if (expectedStep && expectedStep.playerMove.r === r && expectedStep.playerMove.c === c) {
      // Correct step!
      const moveRes = board.value.playMove(r, c, lvl.playerColor);
      sound.playStoneSound();
      if (moveRes.capturedStones.length > 0) sound.playCaptureSound();
      lastMove.value = point;
      highlightPoints.value = [];

      // Check if bot needs to respond
      if (expectedStep.botResponse) {
        isBotThinking.value = true;
        mascotMood.value = 'thinking';
        mascotMessage.value = '小诺走棋中...';

        setTimeout(() => {
          if (expectedStep.botResponse) {
            board.value.playMove(
              expectedStep.botResponse.r,
              expectedStep.botResponse.c,
              board.value.getOpponentColor(lvl.playerColor)
            );
            sound.playStoneSound();
            lastMove.value = expectedStep.botResponse;
          }
          isBotThinking.value = false;
          stepIndex.value++;

          if (expectedStep.botComment) {
            mascotMood.value = 'excited';
            mascotMessage.value = expectedStep.botComment;
          }

          // Check if finished
          if (stepIndex.value >= lvl.solutionSequence!.length) {
            triggerWin();
          }
        }, 600);
      } else {
        stepIndex.value++;
        if (stepIndex.value >= lvl.solutionSequence.length) {
          triggerWin();
        }
      }
      return;
    } else {
      // Wrong move in sequence
      sound.playErrorSound();
      attempts.value++;
      if (attempts.value >= 2) earnedStars.value = Math.max(1, earnedStars.value - 1);
      mascotMood.value = 'comforting';
      mascotMessage.value = `这一步不太对哦~ 仔细想想：${lvl.hint}`;
      return;
    }
  }

  // General Goal Validation (place_stone, capture, save, make_life)
  const isTargetMove = lvl.validMoves?.some(p => p.r === r && p.c === c);

  if (isTargetMove) {
    const moveRes = board.value.playMove(r, c, lvl.playerColor);
    sound.playStoneSound();
    if (moveRes.capturedStones.length > 0) sound.playCaptureSound();
    lastMove.value = point;
    highlightPoints.value = [];
    triggerWin();
  } else {
    // Check if move actually captures or solves
    const testBoard = board.value.clone();
    const moveRes = testBoard.playMove(r, c, lvl.playerColor);

    if (lvl.type === 'capture' && moveRes.capturedStones.length > 0) {
      board.value.playMove(r, c, lvl.playerColor);
      sound.playStoneSound();
      sound.playCaptureSound();
      lastMove.value = point;
      triggerWin();
    } else {
      sound.playErrorSound();
      attempts.value++;
      if (attempts.value >= 2) earnedStars.value = Math.max(1, earnedStars.value - 1);
      mascotMood.value = 'comforting';
      mascotMessage.value = `这一步没有达成目标哦！提示：${lvl.hint}`;
    }
  }
};

const triggerWin = () => {
  isCompleted.value = true;
  mascotMood.value = 'cheering';
  mascotMessage.value = `太神啦！你成功完成了【${currentLevel.value.title}】！点击下方查看名师解析与丰厚奖励吧！`;

  adventureStore.completeLevel(
    currentLevel.value.id,
    earnedStars.value,
    currentLevel.value.rewards
  );

  setTimeout(() => {
    showCompleteModal.value = true;
  }, 500);
};

const handleHint = () => {
  sound.playHintSound();
  sound.fireMiniSparkles();
  const lvl = currentLevel.value;
  mascotMood.value = 'excited';
  mascotMessage.value = `【小诺锦囊】${lvl.hint}`;

  if (lvl.solutionSequence && lvl.solutionSequence[stepIndex.value]) {
    highlightPoints.value = [lvl.solutionSequence[stepIndex.value].playerMove];
  } else if (lvl.validMoves && lvl.validMoves.length > 0) {
    highlightPoints.value = [...lvl.validMoves];
  }
};

const handleRestart = () => {
  sound.playButtonSound();
  initLevel();
};

const handleNextLevel = () => {
  if (nextLevelItem.value) {
    showCompleteModal.value = false;
    router.push(`/adventure/${nextLevelItem.value.id}`);
  }
};

const handleBackToMap = () => {
  sound.playButtonSound();
  router.push('/adventure');
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- Top Header Bar -->
      <div class="flex items-center justify-between bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm">
        <button
          @click="handleBackToMap"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-extrabold text-xs sm:text-sm transition active:scale-95"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>关卡列表</span>
        </button>

        <!-- Chapter & Level Index -->
        <div class="text-center">
          <div class="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-wide">
            {{ currentLevel.chapterTitle }}
          </div>
          <h1 class="text-base sm:text-xl font-black text-gray-900">
            {{ currentLevel.title }}
          </h1>
        </div>

        <!-- Reward Stars Indicator -->
        <div class="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200">
          <div v-for="s in 3" :key="s">
            <Star
              class="w-4 h-4"
              :class="s <= earnedStars ? 'text-amber-400 fill-current' : 'text-gray-200'"
            />
          </div>
        </div>
      </div>

      <!-- Mascot NuoNuo Dialogue & Instructions -->
      <MascotNuoNuo
        :message="mascotMessage"
        :mood="mascotMood"
        :subtext="`目标：${currentLevel.goal}`"
      />

      <!-- Interactive Go Board Section -->
      <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
        <GoBoardComponent
          :board="board"
          :playerColor="currentLevel.playerColor"
          :lastMove="lastMove"
          :highlightPoints="highlightPoints"
          :showLiberties="showLiberties"
          :showAtari="showAtari"
          :theme="userStore.theme"
          :sizePx="480"
          :disabled="isCompleted || isBotThinking"
          @play="handlePlay"
        />

        <!-- In-game Assistant Bar & Controls -->
        <div class="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs font-bold">
          <!-- Live Assistant Toggles -->
          <div class="flex items-center gap-2">
            <button
              @click="showLiberties = !showLiberties"
              class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95"
              :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>显示气数</span>
            </button>

            <button
              @click="showAtari = !showAtari"
              class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95"
              :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
              <span>叫吃预警</span>
            </button>
          </div>

          <!-- Actions: Hint & Restart -->
          <div class="flex items-center gap-2">
            <button
              @click="handleHint"
              class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Lightbulb class="w-4 h-4 fill-current" />
              <span>提示锦囊</span>
            </button>

            <button
              @click="handleRestart"
              class="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold transition active:scale-95 flex items-center gap-1.5"
            >
              <RotateCcw class="w-4 h-4" />
              <span>重新开始</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bilingual Knowledge Card below board -->
      <div class="bg-amber-50/70 rounded-3xl p-5 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <BookOpen class="w-4 h-4 text-orange-600" />
            <span class="text-xs font-black text-orange-900">本关专攻术语</span>
          </div>
          <div class="flex items-center gap-2 text-sm font-extrabold text-gray-800">
            <span>{{ currentLevel.termBilingual.chinese }}</span>
            <span class="text-xs text-orange-600">{{ currentLevel.termBilingual.pinyin }}</span>
            <span class="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-amber-200">
              {{ currentLevel.termBilingual.english }}
            </span>
          </div>
          <p class="text-xs text-gray-600 font-medium">
            {{ currentLevel.termBilingual.concept }}
          </p>
        </div>
      </div>

    </div>

    <!-- Victory Modal -->
    <LevelCompleteModal
      :isOpen="showCompleteModal"
      :level="currentLevel"
      :stars="earnedStars"
      :hasNextLevel="hasNextLevel"
      @next="handleNextLevel"
      @replay="handleRestart"
      @map="handleBackToMap"
    />
  </div>
</template>


