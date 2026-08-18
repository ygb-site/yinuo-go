<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Navbar from '../../components/Navbar.vue';
import GoBoard from '../../components/GoBoard.vue';
import { TSUMEGO_PUZZLES, type TsumegoPuzzle } from '../../data/tsumegoLibrary';
import { GoGame } from '../../engine/GoGame';
import { useUserStore } from '../../stores/userStore';
import { sound } from '../../utils/sound';
import { Sparkles, ArrowRight, RotateCcw, Lightbulb, CheckCircle2, ChevronRight } from 'lucide-vue-next';

const userStore = useUserStore();
const currentIndex = ref(0);
const curPuzzle = computed(() => TSUMEGO_PUZZLES[currentIndex.value] || TSUMEGO_PUZZLES[0]);

const game = ref(new GoGame(5));
const isSolved = ref(false);
const lastMove = ref<{ r: number; c: number } | null>(null);

const loadPuzzle = (idx: number) => {
  currentIndex.value = idx;
  const p = TSUMEGO_PUZZLES[idx];
  game.value = new GoGame(p.boardSize as any);
  if (p.initialStones) {
    for (const s of p.initialStones) {
      game.value.setCell(s.r, s.c, s.color);
    }
  }
  game.value.turn = p.playerColor || 'B';
  isSolved.value = false;
  lastMove.value = null;
};

onMounted(() => {
  loadPuzzle(0);
});

const handleMove = (pt: { r: number; c: number }) => {
  if (isSolved.value) return;
  const p = curPuzzle.value;
  const ok = p.correctMoves && p.correctMoves.some(m => m.r === pt.r && m.c === pt.c);

  if (ok) {
    game.value.setCell(pt.r, pt.c, p.playerColor || 'B');
    isSolved.value = true;
    lastMove.value = pt;
    sound.playWinSound();
    sound.fireCelebrationConfetti();
    userStore.recordPuzzleSolved(p.id);
  } else {
    sound.playErrorSound();
    uni.showToast({ title: '没有命中死活要点，再试一次！', icon: 'none' });
  }
};

const nextPuzzle = () => {
  if (currentIndex.value < TSUMEGO_PUZZLES.length - 1) {
    loadPuzzle(currentIndex.value + 1);
    sound.playButtonSound();
  }
};

const resetCurrent = () => {
  loadPuzzle(currentIndex.value);
  sound.playButtonSound();
};
</script>

<template>
  <view class="min-h-screen bg-[#FDFBF7] flex flex-col font-sans select-none pb-24">
    <Navbar />

    <view class="flex-1 py-3 px-3 sm:px-6">
      <view class="max-w-4xl mx-auto space-y-4">
        
        <!-- Header Prompt Card -->
        <view class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-purple-100 shadow-sm flex items-center justify-between">
          <view class="space-y-1">
            <view class="flex items-center gap-2">
              <text class="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                {{ curPuzzle.categoryLabel }}
              </text>
              <text class="text-xs font-bold text-gray-400">
                第 {{ currentIndex + 1 }} / {{ TSUMEGO_PUZZLES.length }} 题
              </text>
            </view>
            <view class="text-lg sm:text-xl font-black text-gray-900">
              {{ curPuzzle.title }}
            </view>
            <view class="text-xs text-gray-600 font-medium">
              {{ curPuzzle.prompt }}
            </view>
          </view>
        </view>

        <!-- GoBoard Area -->
        <view class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center">
          <GoBoard
            :game="game"
            :readonly="isSolved"
            :lastMove="lastMove"
            @play="handleMove"
          />
        </view>

        <!-- Solved Card -->
        <view v-if="isSolved" class="bg-emerald-50 rounded-3xl p-4 sm:p-6 border-2 border-emerald-300 shadow-sm space-y-3">
          <view class="flex items-center justify-between">
            <view class="flex items-center gap-2 text-emerald-800 font-black text-base">
              <CheckCircle2 class="w-5 h-5 text-emerald-600" />
              <text>正解！太厉害啦！</text>
            </view>
            <text class="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              🪙 +30 金币 / ⚡ +80 XP
            </text>
          </view>

          <view class="text-xs text-gray-700 leading-relaxed font-medium bg-white/80 p-3 rounded-2xl border border-emerald-200">
            {{ curPuzzle.explanation }}
          </view>

          <view
            @click="nextPuzzle"
            class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <text>进入下一题</text>
            <ArrowRight class="w-4 h-4 text-white" />
          </view>
        </view>

        <!-- Helper Bottom Buttons -->
        <view v-else class="flex gap-3">
          <view
            @click="resetCurrent"
            class="flex-1 py-2.5 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
          >
            <RotateCcw class="w-3.5 h-3.5 text-gray-500" />
            <text>重新摆盘</text>
          </view>
        </view>

      </view>
    </view>
  </view>
</template>

