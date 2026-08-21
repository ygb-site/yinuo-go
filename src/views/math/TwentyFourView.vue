<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import { playButtonSound, playVictorySound } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Lightbulb, CheckCircle2 } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

interface CardPuzzle {
  cards: number[];
  solution: string;
}

const puzzles: CardPuzzle[] = [
  { cards: [3, 3, 8, 8], solution: '8 / (3 - 8/3) = 24' },
  { cards: [1, 2, 3, 4], solution: '1 * 2 * 3 * 4 = 24' },
  { cards: [4, 4, 4, 4], solution: '(4 + 4) * 4 - 4 = 24 或 4*4 + 4 + 4 = 24' },
  { cards: [2, 3, 4, 6], solution: '(2 + 4) * (6 - 3) = 24 或 2 * 3 * 4 = 24' },
  { cards: [5, 5, 5, 1], solution: '(5 - 1/5) * 5 = 24' }
];

const currentIdx = ref(0);
const currentPuzzle = ref<CardPuzzle>(puzzles[0]);
const showSolution = ref(false);

const nextPuzzle = () => {
  playButtonSound();
  showSolution.value = false;
  currentIdx.value = (currentIdx.value + 1) % puzzles.length;
  currentPuzzle.value = puzzles[currentIdx.value];
};

const toggleSolution = () => {
  playButtonSound();
  showSolution.value = !showSolution.value;
};

const handleSolved = () => {
  playVictorySound();
  confetti({ particleCount: 80, spread: 60 });
  userStore.addCoins(30, '攻克24点谜题');
  userStore.addExp(50);
  setTimeout(() => {
    nextPuzzle();
  }, 1000);
};

const goBack = () => {
  playButtonSound();
  router.push('/subject/math');
};
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 select-none">
    <header class="max-w-xl w-full mx-auto flex items-center justify-between">
      <button
        @click="goBack"
        class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm flex items-center gap-1.5 transition-all"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>返回数理馆</span>
      </button>

      <div class="text-xs font-bold text-slate-400">
        题目 {{ currentIdx + 1 }}/{{ puzzles.length }}
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto my-6">
      <div class="w-full bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 text-center shadow-2xl">
        <div class="text-xs font-black text-blue-400 uppercase tracking-wider mb-2">24 Point Brain Storm</div>
        <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-white">24 点四则运算大挑战</h1>
        <p class="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          利用这 4 张数字卡片，使用 ＋、－、×、÷ 算出 24 吧！
        </p>

        <div class="grid grid-cols-4 gap-3 sm:gap-4 my-8">
          <div
            v-for="(c, i) in currentPuzzle.cards"
            :key="i"
            class="aspect-square rounded-2xl bg-gradient-to-b from-white to-slate-100 text-slate-900 font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl border-2 border-amber-300"
          >
            {{ c }}
          </div>
        </div>

        <div v-if="showSolution" class="p-4 bg-blue-900/40 border border-blue-500/40 rounded-2xl text-amber-300 font-black text-lg mb-6 animate-fade-in">
          💡 参考解法：{{ currentPuzzle.solution }}
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            @click="toggleSolution"
            class="px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 font-bold text-sm text-slate-300 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Lightbulb class="w-4 h-4 text-amber-400" />
            <span>{{ showSolution ? '隐藏提示' : '查看提示' }}</span>
          </button>

          <button
            @click="handleSolved"
            class="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 class="w-5 h-5" />
            <span>我想出来啦！</span>
          </button>

          <button
            @click="nextPuzzle"
            class="px-4 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 font-bold text-sm text-slate-300 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>换一题</span>
          </button>
        </div>
      </div>
    </main>

    <footer class="text-center text-xs text-slate-500 font-bold">
      一诺启思 · 智力冲浪
    </footer>
  </div>
</template>

