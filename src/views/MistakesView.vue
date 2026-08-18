<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { TSUMEGO_PUZZLES, type TsumegoPuzzle } from '../data/tsumegoLibrary';
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
import SpeechBubble from '../components/common/SpeechBubble.vue';
import {
  BookMarked,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Lightbulb,
  ChevronRight
} from 'lucide-vue-next';

const userStore = useUserStore();

const filterTab = ref<'all' | 'unsolved' | 'solved'>('all');
const activePuzzleId = ref<string>('');

const mistakesList = computed<TsumegoPuzzle[]>(() => {
  const recordedIds = userStore.mistakes;
  if (recordedIds.length > 0) {
    return TSUMEGO_PUZZLES.filter(p => recordedIds.includes(p.id));
  }
  return TSUMEGO_PUZZLES.slice(3, 11);
});

const filteredList = computed(() => {
  return mistakesList.value.filter(p => {
    const isSolved = userStore.solvedMistakes.includes(p.id);
    if (filterTab.value === 'unsolved') return !isSolved;
    if (filterTab.value === 'solved') return isSolved;
    return true;
  });
});

const currentPuzzle = computed<TsumegoPuzzle>(() => {
  const found = TSUMEGO_PUZZLES.find(p => p.id === activePuzzleId.value);
  return found || filteredList.value[0] || TSUMEGO_PUZZLES[0];
});

// Board State
const game = ref<GoGame>(new GoGame(5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);
const isSolved = ref(false);
const mascotMood = ref<'happy' | 'excited' | 'thinking' | 'cheering' | 'comforting' | 'surprised'>('happy');
const mascotText = ref<string>('');

const initPuzzle = () => {
  const p = currentPuzzle.value;
  game.value = new GoGame(p.boardSize);
  lastMove.value = null;
  highlightPoints.value = [];
  isSolved.value = false;

  for (const st of p.initialStones) {
    game.value.setCell(st.r, st.c, st.color);
  }
  game.value.turn = p.playerColor;

  mascotMood.value = 'happy';
  mascotText.value = `【弱点突破 · ${p.title}】${p.prompt}`;
};

onMounted(() => {
  if (filteredList.value.length > 0) {
    activePuzzleId.value = filteredList.value[0].id;
  }
  initPuzzle();
});

const selectPuzzle = (p: TsumegoPuzzle) => {
  activePuzzleId.value = p.id;
  initPuzzle();
  playButtonSound();
};

const handleMove = (point: Point) => {
  if (isSolved.value) return;

  const p = currentPuzzle.value;
  const isCorrect = p.correctMoves.some(cm => cm.r === point.r && cm.c === point.c);

  if (isCorrect) {
    const res = game.value.playMove(point.r, point.c, p.playerColor);
    playStoneSound();
    if (res.capturedStones.length > 0) playCaptureSound();
    lastMove.value = point;
    highlightPoints.value = [];

    isSolved.value = true;
    mascotMood.value = 'cheering';
    mascotText.value = `🎉 漂亮！你成功攻克了这道错题！弱点已清除，获得双倍金币奖励！`;
    userStore.resolveMistake(p.id);
    playVictorySound();
    triggerConfetti();
  } else {
    playErrorSound();
    mascotMood.value = 'comforting';
    mascotText.value = `还没有击中要害哦！提示：${p.hint}`;
  }
};

const handleHint = () => {
  playCoinSound();
  mascotMood.value = 'excited';
  mascotText.value = `【锦囊提示】${currentPuzzle.value.hint}`;
  highlightPoints.value = [...currentPuzzle.value.correctMoves];
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center md:text-left">
          <div class="inline-flex items-center gap-2 bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-xs font-black">
            <BookMarked class="w-3.5 h-3.5 text-indigo-700" />
            <span>智能错题本与弱点突破 (Review Center)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            攻克弱点 · 棋力倍增
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            记录做错的死活与手筋题目，针对性温故知新，重新解对可领取双倍金币奖励！
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-2xl text-center shadow-2xs">
            <div class="text-[10px] font-bold text-indigo-700">已消灭错题</div>
            <div class="text-xl font-black text-indigo-900">
              {{ userStore.solvedMistakes.length }} / {{ mistakesList.length }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Mistakes List (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          
          <!-- Filter Tabs -->
          <div class="bg-white rounded-3xl p-3 border-2 border-orange-100 shadow-sm flex items-center gap-1">
            <button
              @click="filterTab = 'all'"
              class="flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              :class="filterTab === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
            >
              全部 ({{ mistakesList.length }})
            </button>
            <button
              @click="filterTab = 'unsolved'"
              class="flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              :class="filterTab === 'unsolved' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
            >
              待消灭
            </button>
            <button
              @click="filterTab = 'solved'"
              class="flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              :class="filterTab === 'solved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
            >
              已突破
            </button>
          </div>

          <!-- Puzzles List -->
          <div class="bg-white rounded-3xl p-3 border-2 border-orange-100 shadow-sm max-h-[500px] overflow-y-auto space-y-2">
            <div
              v-for="p in filteredList"
              :key="p.id"
              @click="selectPuzzle(p)"
              class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group"
              :class="
                activePuzzleId === p.id
                  ? 'bg-indigo-50 border-indigo-400 shadow-sm ring-2 ring-indigo-300/40'
                  : 'bg-white border-gray-100 hover:border-indigo-200'
              "
            >
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-black text-gray-900 group-hover:text-indigo-600">{{ p.title }}</span>
                  <CheckCircle2
                    v-if="userStore.solvedMistakes.includes(p.id)"
                    class="w-4 h-4 text-emerald-500 flex-shrink-0"
                  />
                  <AlertCircle
                    v-else
                    class="w-4 h-4 text-amber-500 flex-shrink-0"
                  />
                </div>
                <div class="text-[10px] text-gray-500 font-bold">
                  {{ p.categoryLabel }} · {{ p.difficultyStars }} 星难度
                </div>
              </div>

              <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
            </div>

            <div v-if="filteredList.length === 0" class="py-12 text-center text-xs font-black text-gray-400">
              🎉 当前分类下没有题目哦！
            </div>
          </div>

        </div>

        <!-- Right: Interactive Board & Master Commentary (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <SpeechBubble
            :text="mascotText"
            :mood="mascotMood"
            :speaker="'小诺导师'"
            :subtext="`目标：${currentPuzzle.prompt}`"
          />

          <div class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            <GoBoard
              :game="game"
              :readonly="isSolved"
              :showLiberties="true"
              :showAtari="true"
              :theme="userStore.theme"
              :highlightPoints="highlightPoints"
              :lastMove="lastMove"
              :sizePx="480"
              @move="handleMove"
            />

            <!-- Control Action Bar -->
            <div class="w-full flex items-center justify-between pt-3 border-t border-gray-100">
              <div class="text-xs font-black text-indigo-700 flex items-center gap-1">
                <Sparkles class="w-4 h-4 text-amber-500" />
                <span>消灭错题双倍奖励：+10 金币 / +20 XP</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="handleHint"
                  class="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb class="w-4 h-4 fill-current" />
                  <span>锦囊提示</span>
                </button>

                <button
                  @click="initPuzzle"
                  class="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw class="w-4 h-4" />
                  <span>重新解答</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Master Explanation -->
          <div class="bg-indigo-50/80 rounded-3xl p-5 border border-indigo-200 space-y-2">
            <div class="font-black text-xs text-indigo-950 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-indigo-600" />
              <span>名师错因剖析与破题锦囊：</span>
            </div>
            <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
              {{ currentPuzzle.explanation }}
            </p>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

