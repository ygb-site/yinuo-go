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
  ArrowRight,
  Lock,
  Sparkles,
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const goBack = () => {
  playButtonSound();
  router.push('/battle');
};

/**
 * 6 大阶梯考级体系定义 (Tiered Rank Exam System)
 */
export interface ExamTier {
  tierId: number;
  targetRankLevel: number;
  rankTitle: string;
  rankTitleEn: string;
  badge: string;
  themeColor: string;
  description: string;
  puzzleIndices: [number, number, number];
  rewardExp: number;
  rewardCoins: number;
  minUnlockedRankLevel: number;
}

const EXAM_TIERS: ExamTier[] = [
  {
    tierId: 1,
    targetRankLevel: 2,
    rankTitle: '吃子小达人 20K',
    rankTitleEn: 'Capture Scout 20K',
    badge: '🐾',
    themeColor: 'from-teal-400 to-cyan-500',
    description: '考核重点：一口拔子、抱吃与门吃基本功',
    puzzleIndices: [0, 1, 2],
    rewardExp: 250,
    rewardCoins: 60,
    minUnlockedRankLevel: 1
  },
  {
    tierId: 2,
    targetRankLevel: 3,
    rankTitle: '做眼小能手 15K',
    rankTitleEn: 'Eye Builder 15K',
    badge: '⚔️',
    themeColor: 'from-blue-400 to-indigo-500',
    description: '考核重点：直三做眼、识别假眼与双眼做活',
    puzzleIndices: [15, 16, 24],
    rewardExp: 450,
    rewardCoins: 100,
    minUnlockedRankLevel: 2
  },
  {
    tierId: 3,
    targetRankLevel: 4,
    rankTitle: '手筋小飞侠 10K',
    rankTitleEn: 'Tesuji Hero 10K',
    badge: '⚡',
    themeColor: 'from-purple-400 to-violet-500',
    description: '考核重点：倒扑魔术、双叫吃绝杀与飞枷大网',
    puzzleIndices: [3, 4, 7],
    rewardExp: 650,
    rewardCoins: 150,
    minUnlockedRankLevel: 3
  },
  {
    tierId: 4,
    targetRankLevel: 5,
    rankTitle: '活棋智多星 5K',
    rankTitleEn: 'Life Master 5K',
    badge: '🏰',
    themeColor: 'from-pink-400 to-rose-500',
    description: '考核重点：破眼点杀、扑入破眼与紧气对杀',
    puzzleIndices: [25, 26, 35],
    rewardExp: 850,
    rewardCoins: 200,
    minUnlockedRankLevel: 4
  },
  {
    tierId: 5,
    targetRankLevel: 6,
    rankTitle: '九路小棋圣 1D',
    rankTitleEn: 'Junior 1 Dan',
    badge: '👑',
    themeColor: 'from-amber-400 to-yellow-500',
    description: '考核重点：金鸡独立、双活共存与全局打劫实战',
    puzzleIndices: [10, 20, 41],
    rewardExp: 1300,
    rewardCoins: 300,
    minUnlockedRankLevel: 5
  },
  {
    tierId: 6,
    targetRankLevel: 7,
    rankTitle: '一诺小九段 9D',
    rankTitleEn: 'YiNuo Grandmaster 9D',
    badge: '🌟',
    themeColor: 'from-rose-500 via-amber-500 to-yellow-400',
    description: '考核重点：滚打包收、花六聚杀与双叫吃造劫神之一手',
    puzzleIndices: [8, 33, 45],
    rewardExp: 2000,
    rewardCoins: 500,
    minUnlockedRankLevel: 6
  }
];

// Current Selected Exam Tier
const currentTierId = ref<number>(1);
const currentTier = computed<ExamTier>(() => {
  return EXAM_TIERS.find(t => t.tierId === currentTierId.value) || EXAM_TIERS[0];
});

// Current Question Index inside 3 questions
const currentExamIndex = ref(0);

const examPuzzles = computed<TsumegoPuzzle[]>(() => {
  const [i1, i2, i3] = currentTier.value.puzzleIndices;
  return [
    TSUMEGO_PUZZLES[i1] || TSUMEGO_PUZZLES[0],
    TSUMEGO_PUZZLES[i2] || TSUMEGO_PUZZLES[1],
    TSUMEGO_PUZZLES[i3] || TSUMEGO_PUZZLES[2]
  ];
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
const mascotText = ref<string>('');

const isTierUnlocked = (tier: ExamTier) => {
  return userStore.currentRank.rankLevel >= tier.minUnlockedRankLevel;
};

const isTierPassed = (tier: ExamTier) => {
  return userStore.currentRank.rankLevel >= tier.targetRankLevel;
};

const selectTier = (tier: ExamTier) => {
  if (!isTierUnlocked(tier)) {
    playErrorSound();
    return;
  }
  playButtonSound();
  currentTierId.value = tier.tierId;
  currentExamIndex.value = 0;
  isExamPassed.value = isTierPassed(tier);
  initExamQuestion();
};

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
  mascotText.value = "【" + currentTier.value.rankTitle + " 考题第 " + (currentExamIndex.value + 1) + " / 3 题】" + p.prompt;
};

onMounted(() => {
  const curLevel = userStore.currentRank.rankLevel;
  const nextTier = EXAM_TIERS.find(t => t.targetRankLevel > curLevel) || EXAM_TIERS[EXAM_TIERS.length - 1];
  currentTierId.value = nextTier.tierId;
  isExamPassed.value = isTierPassed(nextTier);
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
      mascotText.value = '🎉 正解！命中要害点，点击下方进入下一题！';
      playVictorySound();
    } else {
      isExamPassed.value = true;
      mascotMood.value = 'cheering';
      mascotText.value = "🏆 恭喜通过【" + currentTier.value.rankTitle + "】考级！棋力飞跃提升，荣誉证书已颁发！";

      userStore.addExp(currentTier.value.rewardExp);
      userStore.addCoins(currentTier.value.rewardCoins);

      playVictorySound();
      triggerConfetti();

      setTimeout(() => {
        showCertificateModal.value = true;
      }, 500);
    }
  } else {
    playErrorSound();
    mascotMood.value = 'comforting';
    mascotText.value = '哎呀，这步棋在考级中没有击中要害，仔细审视局面再试一次！';
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
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-3 sm:py-8 px-2.5 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-4 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div class="space-y-1 text-center md:text-left w-full md:w-auto">
          <div class="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <button
              @click="goBack"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-black transition active:scale-95 cursor-pointer border border-orange-200 shadow-2xs"
              title="返回对弈竞技"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>返回对弈竞技</span>
            </button>
            <div class="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
              <Award class="w-3.5 h-3.5 text-amber-700" />
              <span>少儿段级位考级升级中心 (Rank Exam)</span>
            </div>
          </div>
          <h1 class="text-xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide pt-1">
            阶梯考级认证与段位升级
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium">
            当前棋力：<span class="font-black text-orange-600">{{ userStore.currentRank.title }}</span>（{{ userStore.exp }} XP），通过综合死活考题直升更高段位！
          </p>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <button
            @click="showCertificateModal = true"
            class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy class="w-4 h-4" />
            <span>查看我的荣誉证书 📜</span>
          </button>
        </div>
      </div>

      <!-- 🌟 6 大阶梯考级关卡选择条 -->
      <div class="space-y-2">
        <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between px-1">
          <span>选择考级段位 (Select Rank Target)</span>
          <span class="text-orange-600 font-black">当前目标：{{ currentTier.rankTitle }}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          <div
            v-for="tier in EXAM_TIERS"
            :key="tier.tierId"
            @click="selectTier(tier)"
            class="p-3 sm:p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between relative cursor-pointer group"
            :class="
              currentTierId === tier.tierId
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-400 shadow-md ring-2 ring-orange-300'
                : isTierPassed(tier)
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-50'
                : isTierUnlocked(tier)
                ? 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
                : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
            "
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-2xl">{{ tier.badge }}</span>
              <span
                v-if="isTierPassed(tier)"
                class="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded-full flex items-center gap-0.5"
              >
                <CheckCircle2 class="w-2.5 h-2.5" /> 已通过
              </span>
              <span
                v-else-if="currentTierId === tier.tierId"
                class="text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.2 rounded-full animate-pulse"
              >
                考核中
              </span>
              <span
                v-else-if="!isTierUnlocked(tier)"
                class="text-[9px] text-gray-400 font-bold flex items-center gap-0.5"
              >
                <Lock class="w-3 h-3" /> 未解锁
              </span>
            </div>

            <div class="space-y-0.5 my-1">
              <div class="font-black text-xs sm:text-sm text-gray-900 truncate">{{ tier.rankTitle }}</div>
              <div class="text-[10px] text-gray-500 font-medium line-clamp-1">{{ tier.description.split('：')[1] || tier.description }}</div>
            </div>

            <div class="pt-1.5 border-t border-gray-100/80 flex items-center justify-between text-[10px] font-black">
              <span class="text-indigo-600">+{{ tier.rewardExp }} XP</span>
              <span class="text-amber-600">+{{ tier.rewardCoins }} 币</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Exam Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        <!-- Left: Current Exam Tier Status & 3 Questions Progress (4 cols) -->
        <div class="lg:col-span-4 space-y-3.5 sm:space-y-4">
          
          <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm space-y-3.5">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <div class="text-[10px] font-black text-orange-600 uppercase">当前考核考级</div>
                <h3 class="text-base font-black text-gray-900 flex items-center gap-1.5">
                  <span>{{ currentTier.badge }}</span>
                  <span>{{ currentTier.rankTitle }}</span>
                </h3>
              </div>
              <span class="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-xl">
                第 {{ currentExamIndex + 1 }} / 3 题
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="(p, idx) in examPuzzles"
                :key="p.id"
                class="p-2.5 sm:p-3 rounded-2xl border-2 transition flex items-center justify-between"
                :class="
                  idx === currentExamIndex
                    ? 'bg-amber-50 border-amber-400 font-black shadow-xs ring-1 ring-amber-300'
                    : idx < currentExamIndex || isExamPassed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                "
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
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
                  <span class="text-xs font-bold truncate">{{ p.title }}</span>
                </div>

                <CheckCircle2 v-if="idx < currentExamIndex || (idx === currentExamIndex && isQuestionSolved)" class="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span v-else class="text-[10px] text-gray-400 flex-shrink-0">待解答</span>
              </div>
            </div>

            <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
              <div class="font-black text-amber-950 flex items-center gap-1">
                <Sparkles class="w-3.5 h-3.5 text-amber-600" />
                <span>通关升级奖励：</span>
              </div>
              <div class="flex items-center gap-3 font-bold text-gray-700 pt-0.5">
                <span class="text-indigo-800">经验 +{{ currentTier.rewardExp }} XP (直升段位)</span>
                <span class="text-amber-800">金币 +{{ currentTier.rewardCoins }} 🪙</span>
              </div>
            </div>

            <button
              @click="restartExam"
              class="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>重新开始本阶考级</span>
            </button>
          </div>

        </div>

        <!-- Right: Exam Board & Controls (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <SpeechBubble
            :text="mascotText"
            :mood="mascotMood"
            :speaker="'考级主考官 · 小诺'"
            :subtext="'当前考题：' + currentPuzzle.prompt"
          />

          <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
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
                <span>领取【{{ currentTier.rankTitle }}】证书 📜</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Certificate Modal -->
    <CertificateModal
      :isOpen="showCertificateModal"
      :rankTitle="currentTier.rankTitle"
      :rankLevel="currentTier.targetRankLevel"
      @close="showCertificateModal = false"
    />
  </div>
</template>
