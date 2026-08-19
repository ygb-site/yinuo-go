<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { TSUMEGO_PUZZLES, type TsumegoPuzzle } from '../data/tsumegoLibrary';
import { GoGame } from '../engine/GoGame';
import type { Point } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import {
  playStoneSound,
  playCaptureSound,
  playErrorSound,
  playVictorySound,
  playButtonSound,
  triggerConfetti
} from '../lib/audio';
import GoBoard from '../components/board/GoBoard.vue';
import SpeechBubble from '../components/common/SpeechBubble.vue';
import CertificateModal from '../components/common/CertificateModal.vue';
import {
  Award,
  Trophy,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  ArrowRight
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const goBack = () => {
  playButtonSound();
  router.push('/battle');
};

// Exam Stages: 3 tsumego questions
const currentExamIndex = ref(0);
const examPuzzles = computed<TsumegoPuzzle[]>(() => {
  return [TSUMEGO_PUZZLES[0], TSUMEGO_PUZZLES[3], TSUMEGO_PUZZLES[6]];
});

const currentPuzzle = computed<TsumegoPuzzle>(() => {
  return examPuzzles.value[currentExamIndex.value] || examPuzzles.value[0];
});

// Board State
const game = ref<GoGame>(new GoGame(5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);
const isQuestionSolved = ref(false);
const isExamPassed = ref(false);
const showCertificateModal = ref(false);

const mascotMood = ref<'happy' | 'excited' | 'thinking' | 'cheering' | 'comforting' | 'surprised'>('happy');
const mascotText = ref<string>('小棋手你好！欢迎来到段级位考级挑战场！请沉着思考，连续通过 3 道死活综合大题，赢取官方段位荣誉证书！');

const initExamQuestion = () => {
  const p = currentPuzzle.value;
  game.value = new GoGame(p.boardSize);
  lastMove.value = null;
  highlightPoints.value = [];
  isQuestionSolved.value = false;

  for (const st of p.initialStones) {
    game.value.setCell(st.r, st.c, st.color);
  }
  game.value.turn = p.playerColor;

  mascotMood.value = 'happy';
  mascotText.value = `【考题第 ${currentExamIndex.value + 1} / 3 题】${p.prompt}`;
};

onMounted(() => {
  initExamQuestion();
});

const handleMove = (point: Point) => {
  if (isQuestionSolved.value) return;

  const p = currentPuzzle.value;
  const isCorrect = p.correctMoves.some(cm => cm.r === point.r && cm.c === point.c);

  if (isCorrect) {
    const res = game.value.playMove(point.r, point.c, p.playerColor);
    playStoneSound();
    if (res.capturedStones.length > 0) playCaptureSound();
    lastMove.value = point;
    highlightPoints.value = [];

    isQuestionSolved.value = true;
    mascotMood.value = 'cheering';

    if (currentExamIndex.value < examPuzzles.value.length - 1) {
      mascotText.value = '🎉 正解！答对了一道大题，点击下方进入下一题！';
      playVictorySound();
    } else {
      // Complete all exam
      isExamPassed.value = true;
      mascotText.value = '🏆 太不可思议了！你全对通过了本次段级位考核！荣誉证书已颁发！';
      userStore.addExp(200);
      userStore.addCoins(100);
      playVictorySound();
      triggerConfetti();
      setTimeout(() => {
        showCertificateModal.value = true;
      }, 500);
    }
  } else {
    playErrorSound();
    mascotMood.value = 'comforting';
    mascotText.value = '哎呀，这步棋在考级中没有命中要害，不要气馁，重新审视局面再试一次！';
  }
};

const handleNextExamQuestion = () => {
  if (currentExamIndex.value < examPuzzles.value.length - 1) {
    currentExamIndex.value++;
    initExamQuestion();
    playButtonSound();
  }
};

const restartExam = () => {
  currentExamIndex.value = 0;
  isExamPassed.value = false;
  initExamQuestion();
  playButtonSound();
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

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
            <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
              <Award class="w-3.5 h-3.5 text-amber-700" />
              <span>少儿段级位考级挑战赛 (Rank Exam)</span>
            </div>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            棋力考级认证与荣誉证书
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            通过综合死活考题挑战，赢取小诺导师亲自颁发的带有专属证书编号的荣誉大奖状！
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="isExamPassed"
            @click="showCertificateModal = true"
            class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy class="w-4 h-4" />
            <span>查看我的荣誉证书 📜</span>
          </button>
        </div>
      </div>

      <!-- Main Exam Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Exam Progress Stepper (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-4">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between">
              <span>考级挑战进度</span>
              <span class="text-orange-600 font-bold">第 {{ currentExamIndex + 1 }} / 3 题</span>
            </div>

            <!-- Stepper Indicators -->
            <div class="space-y-2.5">
              <div
                v-for="(p, idx) in examPuzzles"
                :key="p.id"
                class="p-3 rounded-2xl border-2 transition flex items-center justify-between"
                :class="
                  idx === currentExamIndex
                    ? 'bg-amber-50 border-amber-400 font-black shadow-xs'
                    : idx < currentExamIndex || isExamPassed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                "
              >
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black"
                    :class="
                      idx < currentExamIndex || isExamPassed
                        ? 'bg-emerald-500 text-white'
                        : idx === currentExamIndex
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    "
                  >
                    {{ idx + 1 }}
                  </span>
                  <span class="text-xs font-bold">{{ p.title }}</span>
                </div>

                <CheckCircle2 v-if="idx < currentExamIndex || (idx === currentExamIndex && isQuestionSolved)" class="w-4 h-4 text-emerald-600" />
                <span v-else class="text-[10px] text-gray-400">待解答</span>
              </div>
            </div>

            <button
              @click="restartExam"
              class="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>重新开始考级</span>
            </button>
          </div>

        </div>

        <!-- Right: Exam Board & Controls (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <SpeechBubble
            :text="mascotText"
            :mood="mascotMood"
            :speaker="'考级主考官 · 小诺'"
            :subtext="`考题：${currentPuzzle.prompt}`"
          />

          <div class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            <GoBoard
              :game="game"
              :readonly="isQuestionSolved"
              :showLiberties="true"
              :showAtari="true"
              :theme="userStore.theme"
              :highlightPoints="highlightPoints"
              :lastMove="lastMove"
              :sizePx="480"
              @move="handleMove"
            />

            <!-- Next Question or Victory Action -->
            <div v-if="isQuestionSolved" class="w-full flex justify-center pt-2 animate-bounce-subtle">
              <button
                v-if="currentExamIndex < examPuzzles.length - 1"
                @click="handleNextExamQuestion"
                class="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>进入下一道考题</span>
                <ArrowRight class="w-4 h-4" />
              </button>
              
              <button
                v-else
                @click="showCertificateModal = true"
                class="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Trophy class="w-4 h-4" />
                <span>领取段位荣誉证书 📜</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Certificate Modal -->
    <CertificateModal
      :isOpen="showCertificateModal"
      :rankTitle="userStore.currentRank.title"
      :rankLevel="userStore.currentRank.rankLevel"
      @close="showCertificateModal = false"
    />
  </div>
</template>
