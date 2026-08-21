<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import { playButtonSound, playVictorySound, playErrorSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

interface IdiomItem {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  missingIdx: number;
  options: string[];
}

const idioms: IdiomItem[] = [
  {
    id: 'id_1',
    word: '画龙点睛',
    pinyin: 'huà lóng diǎn jīng',
    meaning: '原形容梁代画家张僧繇画龙点上眼睛使龙飞走的故事。比喻在关键地方加上精辟的语言使内容更加深刻生动。',
    missingIdx: 3,
    options: ['晴', '睛', '晶', '清']
  },
  {
    id: 'id_2',
    word: '守株待兔',
    pinyin: 'shǒu zhū dài tù',
    meaning: '比喻妄想不经过努力而侥幸得到成功，或死守狭隘经验不知变通。',
    missingIdx: 1,
    options: ['珠', '猪', '株', '主']
  },
  {
    id: 'id_3',
    word: '狐假虎威',
    pinyin: 'hú jiǎ hǔ wēi',
    meaning: '狐狸借着老虎的威风吓跑百兽。比喻依仗别人的势力来欺压人。',
    missingIdx: 1,
    options: ['真', '加', '架', '假']
  }
];

const currentIdx = ref(0);
const currentIdiom = ref<IdiomItem>(idioms[0]);
const isAnswered = ref(false);

const handleChoose = (opt: string) => {
  if (isAnswered.value) return;
  const correctChar = currentIdiom.value.word[currentIdiom.value.missingIdx];

  if (opt === correctChar) {
    isAnswered.value = true;
    playVictorySound();
    speakText(`回答正确！${currentIdiom.value.word}，${currentIdiom.value.meaning}`);
    userStore.addCoins(25, `攻克成语【${currentIdiom.value.word}】`);
    userStore.addExp(40);
    confetti({ particleCount: 60, spread: 50 });
  } else {
    playErrorSound();
    speakText('字形不对哦，再仔细想一想！');
  }
};

const nextIdiom = () => {
  playButtonSound();
  isAnswered.value = false;
  currentIdx.value = (currentIdx.value + 1) % idioms.length;
  currentIdiom.value = idioms[currentIdx.value];
};

const goBack = () => {
  playButtonSound();
  router.push('/subject/chinese');
};
</script>

<template>
  <div class="min-h-screen bg-amber-50/60 pb-20 select-none">
    <header class="bg-gradient-to-r from-amber-600 to-red-600 text-white py-6 px-4 shadow-md">
      <div class="max-w-xl mx-auto flex items-center justify-between">
        <button
          @click="goBack"
          class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回语文馆</span>
        </button>

        <h1 class="text-xl sm:text-2xl font-cartoon font-bold flex items-center gap-2">
          <span>🐉</span>
          <span>趣味成语大挑战</span>
        </h1>
      </div>
    </header>

    <main class="max-w-xl mx-auto px-4 mt-8">
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-xl text-center">
        <div class="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">
          成语填字关卡 {{ currentIdx + 1 }}/{{ idioms.length }}
        </div>
        <h2 class="text-xl font-cartoon font-bold text-slate-800 mb-6 tracking-wide">
          找出正确的成语缺失字！
        </h2>

        <div class="grid grid-cols-4 gap-3 my-6">
          <div
            v-for="(char, idx) in currentIdiom.word"
            :key="idx"
            :class="[
              'aspect-square rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md border-3 transition-all',
              idx === currentIdiom.missingIdx
                ? isAnswered
                  ? 'bg-emerald-500 text-white border-emerald-400 scale-105'
                  : 'bg-amber-100 text-amber-600 border-dashed border-amber-400'
                : 'bg-amber-50 text-slate-800 border-amber-200'
            ]"
          >
            {{ (idx === currentIdiom.missingIdx && !isAnswered) ? '?' : char }}
          </div>
        </div>

        <div v-if="!isAnswered" class="grid grid-cols-4 gap-3 my-6">
          <button
            v-for="opt in currentIdiom.options"
            :key="opt"
            @click="handleChoose(opt)"
            class="py-4 rounded-2xl bg-slate-50 hover:bg-amber-400 hover:text-slate-900 border-2 border-slate-200 hover:border-amber-500 font-black text-2xl text-slate-800 shadow-sm active:scale-95 transition-all"
          >
            {{ opt }}
          </button>
        </div>

        <div v-else class="my-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-left animate-fade-in">
          <div class="text-base font-black text-amber-900 mb-1">
            【{{ currentIdiom.word }}】（{{ currentIdiom.pinyin }}）
          </div>
          <div class="text-xs sm:text-sm font-bold text-amber-800 leading-relaxed">
            {{ currentIdiom.meaning }}
          </div>
        </div>

        <button
          v-if="isAnswered"
          @click="nextIdiom"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-lg shadow-lg active:scale-95 transition-all"
        >
          下一题 ➔
        </button>
      </div>
    </main>
  </div>
</template>


