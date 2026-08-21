<script setup lang="ts">
import { useRouter } from 'vue-router';
import { playButtonSound } from '../../lib/audio';
import { speakText, stopSpeech } from '../../utils/speech';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();

interface PhonicsLetter {
  letter: string;
  phonics: string;
  exampleWord: string;
  exampleMeaning: string;
  icon: string;
}

const letters: PhonicsLetter[] = [
  { letter: 'Aa', phonics: '/æ/', exampleWord: 'Apple', exampleMeaning: '苹果', icon: '🍎' },
  { letter: 'Bb', phonics: '/b/', exampleWord: 'Bear', exampleMeaning: '小熊', icon: '🐻' },
  { letter: 'Cc', phonics: '/k/', exampleWord: 'Cat', exampleMeaning: '猫咪', icon: '🐱' },
  { letter: 'Dd', phonics: '/d/', exampleWord: 'Dog', exampleMeaning: '小狗', icon: '🐶' },
  { letter: 'Ee', phonics: '/e/', exampleWord: 'Egg', exampleMeaning: '鸡蛋', icon: '🥚' },
  { letter: 'Ff', phonics: '/f/', exampleWord: 'Fish', exampleMeaning: '小鱼', icon: '🐟' },
  { letter: 'Gg', phonics: '/ɡ/', exampleWord: 'Grape', exampleMeaning: '葡萄', icon: '🍇' },
  { letter: 'Hh', phonics: '/h/', exampleWord: 'Hat', exampleMeaning: '帽子', icon: '🎩' },
  { letter: 'Ii', phonics: '/ɪ/', exampleWord: 'Igloo', exampleMeaning: '冰屋', icon: '🧊' },
  { letter: 'Jj', phonics: '/dʒ/', exampleWord: 'Juice', exampleMeaning: '果汁', icon: '🧃' },
  { letter: 'Kk', phonics: '/k/', exampleWord: 'Kite', exampleMeaning: '风筝', icon: '🪁' },
  { letter: 'Ll', phonics: '/l/', exampleWord: 'Lion', exampleMeaning: '狮子', icon: '🦁' },
  { letter: 'Mm', phonics: '/m/', exampleWord: 'Monkey', exampleMeaning: '猴子', icon: '🐒' },
  { letter: 'Nn', phonics: '/n/', exampleWord: 'Nose', exampleMeaning: '鼻子', icon: '👃' },
  { letter: 'Oo', phonics: '/ɒ/', exampleWord: 'Orange', exampleMeaning: '橙子', icon: '🍊' },
  { letter: 'Pp', phonics: '/p/', exampleWord: 'Panda', exampleMeaning: '熊猫', icon: '🐼' },
  { letter: 'Qq', phonics: '/kw/', exampleWord: 'Queen', exampleMeaning: '王后', icon: '👑' },
  { letter: 'Rr', phonics: '/r/', exampleWord: 'Rabbit', exampleMeaning: '兔子', icon: '🐰' },
  { letter: 'Ss', phonics: '/s/', exampleWord: 'Sun', exampleMeaning: '太阳', icon: '☀️' },
  { letter: 'Tt', phonics: '/t/', exampleWord: 'Tiger', exampleMeaning: '老虎', icon: '🐯' },
  { letter: 'Uu', phonics: '/ʌ/', exampleWord: 'Umbrella', exampleMeaning: '雨伞', icon: '☂️' },
  { letter: 'Vv', phonics: '/v/', exampleWord: 'Violin', exampleMeaning: '小提琴', icon: '🎻' },
  { letter: 'Ww', phonics: '/w/', exampleWord: 'Water', exampleMeaning: '水', icon: '💧' },
  { letter: 'Xx', phonics: '/ks/', exampleWord: 'Fox', exampleMeaning: '狐狸', icon: '🦊' },
  { letter: 'Yy', phonics: '/j/', exampleWord: 'Yellow', exampleMeaning: '黄色', icon: '🟡' },
  { letter: 'Zz', phonics: '/z/', exampleWord: 'Zebra', exampleMeaning: '斑马', icon: '🦓' }
];

const playPhonics = (item: PhonicsLetter) => {
  playButtonSound();
  speakText(`${item.letter}, ${item.phonics}, ${item.exampleWord}`);
};

const goBack = () => {
  stopSpeech();
  playButtonSound();
  router.push('/subject/english');
};
</script>

<template>
  <div class="min-h-screen bg-purple-50/60 pb-20 select-none">
    <header class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 px-4 shadow-md">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <button
          @click="goBack"
          class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回英语馆</span>
        </button>

        <h1 class="text-xl sm:text-2xl font-cartoon font-bold flex items-center gap-2">
          <span>🔊</span>
          <span>自然拼读 26 字母发音板</span>
        </h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 mt-8">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="item in letters"
          :key="item.letter"
          @click="playPhonics(item)"
          class="bg-white rounded-3xl p-5 border-3 border-purple-100 hover:border-purple-400 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer flex flex-col items-center text-center group"
        >
          <div class="text-3xl mb-1 group-hover:scale-110 transition-transform">
            {{ item.icon }}
          </div>
          <div class="text-3xl font-black text-purple-900 group-hover:text-purple-600">
            {{ item.letter }}
          </div>
          <div class="text-xs font-black px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full mt-1">
            {{ item.phonics }}
          </div>
          <div class="text-sm font-bold text-slate-700 mt-2">
            {{ item.exampleWord }}
          </div>
          <div class="text-xs text-slate-400 font-semibold">
            {{ item.exampleMeaning }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

