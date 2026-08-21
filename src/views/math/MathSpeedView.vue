<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import { playButtonSound, playVictorySound, playErrorSound } from '../../lib/audio';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Timer,
  Trophy,
  Flame
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

interface MathProblem {
  num1: number;
  num2: number;
  op: '+' | '-';
  ans: number;
  options: number[];
}

const isPlaying = ref(false);
const isGameOver = ref(false);
const score = ref(0);
const timeLeft = ref(30);
const combo = ref(0);
const maxCombo = ref(0);
let timer: any = null;

const currentProblem = ref<MathProblem>({
  num1: 3,
  num2: 4,
  op: '+',
  ans: 7,
  options: [5, 6, 7, 8]
});

const generateProblem = (): MathProblem => {
  const isAdd = Math.random() > 0.4;
  let n1: number, n2: number, ans: number;

  if (isAdd) {
    n1 = Math.floor(Math.random() * 9) + 1;
    n2 = Math.floor(Math.random() * 9) + 1;
    ans = n1 + n2;
  } else {
    n1 = Math.floor(Math.random() * 10) + 5;
    n2 = Math.floor(Math.random() * n1) + 1;
    ans = n1 - n2;
  }

  const set = new Set<number>([ans]);
  while (set.size < 4) {
    const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    const candidate = Math.max(0, ans + delta);
    set.add(candidate);
  }

  return {
    num1: n1,
    num2: n2,
    op: isAdd ? '+' : '-',
    ans,
    options: Array.from(set).sort(() => 0.5 - Math.random())
  };
};

const startGame = () => {
  playButtonSound();
  isPlaying.value = true;
  isGameOver.value = false;
  score.value = 0;
  combo.value = 0;
  maxCombo.value = 0;
  timeLeft.value = 30;
  currentProblem.value = generateProblem();

  clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      endGame();
    }
  }, 1000);
};

const handleAnswer = (val: number) => {
  if (!isPlaying.value || isGameOver.value) return;

  if (val === currentProblem.value.ans) {
    playVictorySound();
    combo.value++;
    if (combo.value > maxCombo.value) maxCombo.value = combo.value;
    score.value += 10 + combo.value * 2;
    if (combo.value % 5 === 0) {
      timeLeft.value = Math.min(45, timeLeft.value + 3);
    }
    currentProblem.value = generateProblem();
  } else {
    playErrorSound();
    combo.value = 0;
    currentProblem.value = generateProblem();
  }
};

const endGame = () => {
  clearInterval(timer);
  isPlaying.value = false;
  isGameOver.value = true;

  const coinsEarned = Math.floor(score.value / 3);
  const expEarned = Math.floor(score.value / 2);
  userStore.addCoins(coinsEarned, '速算冲天竞技场奖励');
  userStore.addExp(expEarned);

  if (score.value > 100) {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }
};

onUnmounted(() => {
  clearInterval(timer);
});

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

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-sm border border-amber-500/30">
          <Trophy class="w-4 h-4" />
          <span>得分: {{ score }}</span>
        </div>
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto my-6">
      <div v-if="!isPlaying && !isGameOver" class="w-full bg-slate-800/90 rounded-3xl p-8 border border-slate-700 text-center shadow-2xl">
        <div class="w-20 h-20 rounded-3xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-4xl mx-auto mb-4 border border-blue-500/30">
          🚀
        </div>
        <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-white">速算冲天竞技场</h1>
        <p class="text-slate-400 font-bold text-sm mt-2 max-w-sm mx-auto">
          30秒极限口算挑战！连续答对触发连击加分与时间奖励！
        </p>

        <button
          @click="startGame"
          class="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xl shadow-lg hover:shadow-blue-500/30 transform hover:scale-103 active:scale-95 transition-all"
        >
          开始极速冲刺！
        </button>
      </div>

      <div v-else-if="isPlaying" class="w-full space-y-6">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-2xl border border-slate-700 font-black">
            <Timer class="w-5 h-5 text-rose-400" />
            <span class="text-xl text-rose-400">{{ timeLeft }}s</span>
          </div>

          <div v-if="combo > 1" class="flex items-center gap-1 px-3.5 py-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full font-black text-sm animate-bounce">
            <Flame class="w-4 h-4 fill-current" />
            <span>{{ combo }} 连击！</span>
          </div>
        </div>

        <div class="w-full bg-gradient-to-b from-slate-800 to-slate-850 rounded-3xl p-8 sm:p-10 border-2 border-blue-500/40 shadow-2xl text-center">
          <div class="text-5xl sm:text-7xl font-black text-white tracking-widest flex items-center justify-center gap-4">
            <span>{{ currentProblem.num1 }}</span>
            <span class="text-blue-400 font-extrabold">{{ currentProblem.op }}</span>
            <span>{{ currentProblem.num2 }}</span>
            <span class="text-amber-400">=</span>
            <span class="text-slate-400">?</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="opt in currentProblem.options"
            :key="opt"
            @click="handleAnswer(opt)"
            class="py-6 rounded-3xl bg-slate-800 hover:bg-blue-600 border-2 border-slate-700 hover:border-blue-400 text-3xl sm:text-4xl font-black text-white shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <div v-else-if="isGameOver" class="w-full bg-slate-800/95 rounded-3xl p-8 border border-slate-700 text-center shadow-2xl">
        <div class="text-5xl mb-3">🏆</div>
        <h2 class="text-3xl font-black text-white">挑战结算</h2>
        
        <div class="grid grid-cols-2 gap-4 my-6">
          <div class="bg-slate-700/50 p-4 rounded-2xl">
            <div class="text-xs text-slate-400 font-bold">最终总得分</div>
            <div class="text-3xl font-black text-amber-400 mt-1">{{ score }}</div>
          </div>
          <div class="bg-slate-700/50 p-4 rounded-2xl">
            <div class="text-xs text-slate-400 font-bold">最高连击</div>
            <div class="text-3xl font-black text-orange-400 mt-1">{{ maxCombo }} 次</div>
          </div>
        </div>

        <button
          @click="startGame"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xl shadow-lg active:scale-95 transition-all"
        >
          再挑战一次！
        </button>
      </div>
    </main>

    <footer class="text-center text-xs text-slate-500 font-bold">
      一诺启思 · 数理思维馆
    </footer>
  </div>
</template>

