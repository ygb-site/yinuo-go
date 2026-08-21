<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { playButtonSound, playWinSound, playErrorSound } from '../../lib/audio';
import { speakText, stopSpeech } from '../../utils/speech';
import {
  PINYIN_INITIALS_DATA,
  PINYIN_DAN_YUNMU,
  PINYIN_FU_YUNMU,
  PINYIN_ZHENGTI_DATA,
  PINYIN_TONES_MAP,
  getBlendedPinyinDetail,
  type PinyinInitialItem,
  type PinyinFinalItem,
  type PinyinZhengtiItem
} from '../../data/pinyinDictionary';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Volume2
} from 'lucide-vue-next';

const router = useRouter();

// Main Mode Tabs: 'soundboard' (点读大本营) | 'tones' (四声调小汽车) | 'blender' (魔法拼读器) | 'quiz' (听音辨音大闯关)
const activeTab = ref<'soundboard' | 'tones' | 'blender' | 'quiz'>('soundboard');

// ==========================================
// 1. PINYIN SOUNDBOARD DATA (全套拼音大卡)
// ==========================================
const soundboardCategory = ref<'dan' | 'sheng' | 'fu' | 'zheng'>('dan');

type AnyPinyinCard = PinyinInitialItem | PinyinFinalItem | PinyinZhengtiItem;

const danYunMu = PINYIN_DAN_YUNMU;
const shengMu = PINYIN_INITIALS_DATA;
const fuYunMu = PINYIN_FU_YUNMU;
const zhengTi = PINYIN_ZHENGTI_DATA;

const currentCards = computed<AnyPinyinCard[]>(() => {
  switch (soundboardCategory.value) {
    case 'dan': return danYunMu;
    case 'sheng': return shengMu;
    case 'fu': return fuYunMu;
    case 'zheng': return zhengTi;
  }
});

const activePinyin = ref<AnyPinyinCard>(danYunMu[0]);

const playCard = (card: AnyPinyinCard) => {
  playButtonSound();
  activePinyin.value = card;
  const spokenText = `${card.spokenName}，${card.rhymeSpoken}，${card.sampleWord}的${card.sampleChar}`;
  speakText(spokenText);
};

// ==========================================
// 2. TONES SIMULATOR (四声调小汽车)
// ==========================================
const toneLetter = ref<string>('a');
const toneIndex = ref<number>(1);

const tonesData = computed(() => {
  return PINYIN_TONES_MAP[toneLetter.value] || PINYIN_TONES_MAP.a;
});

const playTone = (t: number) => {
  toneIndex.value = t;
  playButtonSound();
  const currentToneMap = tonesData.value;
  const toneItem = (currentToneMap as any)['t' + t];
  let tip = '';
  if (t === 1) { tip = '一声平，平地开车'; }
  else if (t === 2) { tip = '二声扬，上坡加油'; }
  else if (t === 3) { tip = '三声拐弯，下坡又上坡'; }
  else if (t === 4) { tip = '四声降，下坡冲刺'; }

  // 标准带调汉字朗读，避免纯字母被读成英文
  speakText(`${toneItem.char}——，第${t}声，${tip}`);
};

// ==========================================
// 3. PINYIN BLENDER (魔法拼读器)
// ==========================================
const selectedSheng = ref<string>('b');
const selectedYun = ref<string>('à');

const blendedDetail = computed(() => {
  return getBlendedPinyinDetail(selectedSheng.value, selectedYun.value);
});

const playBlended = () => {
  playButtonSound();
  speakText(blendedDetail.value.spokenSpellingText);
};

// ==========================================
// 4. AUDIO QUIZ (听音辨音大闯关)
// ==========================================
interface QuizItem {
  id: string;
  category: string;
  audioPinyin: string;
  voiceText: string;
  hintText: string;
  options: string[];
  correct: string;
}

const quizList: QuizItem[] = [
  { id: '1', category: '声母辨析', audioPinyin: 'b', voiceText: '请选出声母：玻', hintText: '收听广播 玻 玻 玻', options: ['b', 'd', 'p', 'q'], correct: 'b' },
  { id: '2', category: '声母辨析', audioPinyin: 'p', voiceText: '请选出声母：坡', hintText: '泼水泼水 坡 坡 坡', options: ['p', 'q', 'b', 'd'], correct: 'p' },
  { id: '3', category: '声母辨析', audioPinyin: 'd', voiceText: '请选出声母：得', hintText: '左下半圆 得 得 得', options: ['d', 'b', 't', 'p'], correct: 'd' },
  { id: '4', category: '声母辨析', audioPinyin: 't', voiceText: '请选出声母：特', hintText: '伞柄朝下 特 特 特', options: ['t', 'f', 'l', 'd'], correct: 't' },
  { id: '5', category: '翘舌声母', audioPinyin: 'zh', voiceText: '请选出翘舌声母：知', hintText: '蜘蛛织网 知 知 知', options: ['zh', 'z', 'ch', 'c'], correct: 'zh' },
  { id: '6', category: '平舌声母', audioPinyin: 'z', voiceText: '请选出平舌声母：资', hintText: '写字写字 资 资 资', options: ['z', 'zh', 'c', 's'], correct: 'z' },
  { id: '7', category: '复韵母辨析', audioPinyin: 'ai', voiceText: '请选出复韵母：挨', hintText: '挨在一起 挨 挨 挨', options: ['ai', 'ei', 'ui', 'ao'], correct: 'ai' },
  { id: '8', category: '复韵母辨析', audioPinyin: 'ou', voiceText: '请选出复韵母：欧', hintText: '海鸥海鸥 欧 欧 欧', options: ['ou', 'iu', 'ao', 'ui'], correct: 'ou' },
  { id: '9', category: '整体认读', audioPinyin: 'zhi', voiceText: '请选出整体认读音节：织', hintText: '织毛衣 织，不用拼直接读', options: ['zhi', 'chi', 'shi', 'zi'], correct: 'zhi' },
  { id: '10', category: '整体认读', audioPinyin: 'yu', voiceText: '请选出整体认读音节：鱼', hintText: '金鱼吐泡 鱼，大y带小ü脱帽', options: ['yu', 'wu', 'yi', 'yue'], correct: 'yu' }
];

const quizIdx = ref(0);
const quizScore = ref(0);
const isQuizAnswered = ref(false);
const quizFeedback = ref('');

const currentQuiz = computed(() => quizList[quizIdx.value]);

const playQuizAudio = () => {
  playButtonSound();
  speakText(currentQuiz.value.voiceText);
};

const handleQuizAnswer = (opt: string) => {
  if (isQuizAnswered.value) return;
  isQuizAnswered.value = true;

  if (opt === currentQuiz.value.correct) {
    playWinSound();
    quizScore.value += 10;
    quizFeedback.value = `太棒啦！回答完全正确！🎉 这是【${currentQuiz.value.correct}】`;
    confetti({ particleCount: 60, spread: 50 });
  } else {
    playErrorSound();
    quizFeedback.value = `听错啦，正确发音是：【${currentQuiz.value.correct}】（${currentQuiz.value.hintText}）`;
  }
};

const nextQuiz = () => {
  playButtonSound();
  isQuizAnswered.value = false;
  quizFeedback.value = '';
  quizIdx.value = (quizIdx.value + 1) % quizList.length;
  setTimeout(() => {
    playQuizAudio();
  }, 400);
};

const switchTab = (tab: 'soundboard' | 'tones' | 'blender' | 'quiz') => {
  activeTab.value = tab;
  if (tab === 'quiz') {
    setTimeout(playQuizAudio, 300);
  }
};

const goBack = () => {
  stopSpeech();
  playButtonSound();
  router.push('/subject/chinese');
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] pb-20 select-none">
    <!-- Top Header -->
    <header class="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-6 px-4 shadow-md">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <button
          @click="goBack"
          class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回语文馆</span>
        </button>

        <h1 class="text-xl sm:text-3xl font-cartoon font-bold flex items-center gap-2">
          <span>👑</span>
          <span>汉语拼音魔法王国 (Pinyin Master)</span>
        </h1>

        <div class="text-xs font-black bg-white/20 px-3 py-1 rounded-full hidden sm:block">
          部编版一年级上册 · 标准语音拼读
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 mt-6 space-y-6">
      
      <!-- ==========================================
           FOUR MAIN PINYIN MODES TABS
           ========================================== -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-2 rounded-3xl border-2 border-amber-200 shadow-sm">
        <button
          @click="switchTab('soundboard')"
          :class="[
            'py-3 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'soundboard'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-102'
              : 'text-slate-600 hover:bg-amber-50'
          ]"
        >
          <span>📢 拼音点读大本营</span>
        </button>

        <button
          @click="switchTab('tones')"
          :class="[
            'py-3 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'tones'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-102'
              : 'text-slate-600 hover:bg-amber-50'
          ]"
        >
          <span>🚗 四声调小汽车</span>
        </button>

        <button
          @click="switchTab('blender')"
          :class="[
            'py-3 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'blender'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-102'
              : 'text-slate-600 hover:bg-amber-50'
          ]"
        >
          <span>🧪 声韵魔法拼读器</span>
        </button>

        <button
          @click="switchTab('quiz')"
          :class="[
            'py-3 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'quiz'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-102'
              : 'text-slate-600 hover:bg-amber-50'
          ]"
        >
          <span>🎯 听音辨音大闯关</span>
        </button>
      </div>

      <!-- ==========================================
           TAB 1: PINYIN SOUNDBOARD (拼音点读大本营)
           ========================================== -->
      <div v-if="activeTab === 'soundboard'" class="space-y-6 animate-fade-in">
        <!-- Sub category filter -->
        <div class="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          <button
            v-for="cat in [
              { id: 'dan', name: '6个单韵母 (a o e i u ü)' },
              { id: 'sheng', name: '23个声母 (b p m f d t n l...)' },
              { id: 'fu', name: '18个复韵母与鼻韵母' },
              { id: 'zheng', name: '16个整体认读音节' }
            ]"
            :key="cat.id"
            @click="soundboardCategory = cat.id as any"
            :class="[
              'px-4 py-2 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer',
              soundboardCategory === cat.id
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            ]"
          >
            {{ cat.name }}
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Pinyin Cards Grid -->
          <div class="lg:col-span-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <button
              v-for="card in currentCards"
              :key="card.pinyin"
              @click="playCard(card)"
              :class="[
                'aspect-square rounded-3xl p-3 border-3 flex flex-col items-center justify-between transition-all transform active:scale-90 cursor-pointer shadow-xs group',
                activePinyin.pinyin === card.pinyin
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white border-amber-600 scale-105 shadow-md ring-3 ring-amber-200'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50/60'
              ]"
            >
              <span class="text-xs">{{ card.icon }}</span>
              <span class="text-3xl sm:text-4xl font-black tracking-wider group-hover:scale-110 transition-transform">
                {{ card.pinyin }}
              </span>
              <span class="text-[10px] opacity-80 font-bold truncate max-w-full">
                {{ card.sampleWord }}
              </span>
            </button>
          </div>

          <!-- Right: Active Pinyin Studio Detail Card -->
          <div class="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border-3 border-amber-200 shadow-xl flex flex-col justify-between space-y-4 text-center">
            <div>
              <div class="text-5xl mb-2">{{ activePinyin.icon }}</div>
              <div class="text-6xl sm:text-7xl font-black text-amber-600 tracking-wider">
                {{ activePinyin.pinyin }}
              </div>
              <div class="text-sm font-black text-slate-800 mt-2 flex items-center justify-center gap-2">
                <span>【{{ activePinyin.name }}】</span>
                <span class="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-bold">
                  读作：{{ activePinyin.sound }}
                </span>
              </div>

              <!-- Rhyme Box -->
              <div class="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-bold text-amber-900 leading-relaxed text-left">
                🎵 <span class="font-black">发音口诀：</span><br />
                {{ activePinyin.rhyme }}
              </div>

              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-700">
                🌱 示范字例：【{{ activePinyin.sampleChar }}】（{{ activePinyin.sampleWord }}）
              </div>
            </div>

            <button
              @click="playCard(activePinyin)"
              class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 class="w-5 h-5" />
              <span>跟读标准发音与口诀</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================
           TAB 2: 4 TONES SIMULATOR (四声调小汽车)
           ========================================== -->
      <div v-else-if="activeTab === 'tones'" class="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-xl space-y-8 animate-fade-in text-center">
        <div>
          <div class="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black mb-2">
            声调规则大本营
          </div>
          <h2 class="text-2xl sm:text-3xl font-cartoon font-bold text-slate-900">
            四声调小汽车模拟器
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-bold mt-1">
            一声平、二声扬、三声拐弯、四声降！
          </p>
        </div>

        <!-- Single Vowel Switcher -->
        <div class="flex items-center justify-center gap-2">
          <span class="text-xs font-black text-slate-500">选择韵母：</span>
          <button
            v-for="l in ['a', 'o', 'e', 'i', 'u', 'ü']"
            :key="l"
            @click="toneLetter = l; playTone(toneIndex)"
            :class="[
              'w-10 h-10 rounded-xl text-lg font-black border-2 transition-all cursor-pointer',
              toneLetter === l
                ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
            ]"
          >
            {{ l }}
          </button>
        </div>

        <!-- 4 Tones Road Map Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="t in [1, 2, 3, 4]"
            :key="t"
            @click="playTone(t)"
            :class="[
              'p-5 rounded-3xl border-3 flex flex-col items-center justify-between cursor-pointer transition-all transform active:scale-95 shadow-sm group',
              toneIndex === t
                ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white border-amber-600 scale-105 shadow-lg ring-3 ring-amber-200'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
            ]"
          >
            <div class="text-xs font-black opacity-80">第 {{ t }} 声</div>
            <div class="text-5xl font-black my-3 group-hover:scale-110 transition-transform">
              {{ (tonesData as any)['t' + t].sym }}
            </div>
            <div class="text-xs font-black mb-1 text-amber-700">
              读作：{{ (tonesData as any)['t' + t].char }}
            </div>
            <div class="text-[11px] font-bold opacity-90">
              {{ t === 1 ? '🚗 一声平 (平地开)' : t === 2 ? '🚗 二声扬 (上坡冲)' : t === 3 ? '🚗 三声拐弯 (下坡上坡)' : '🚗 四声降 (下坡冲)' }}
            </div>
          </div>
        </div>
      </div>

      <!-- ==========================================
           TAB 3: PINYIN BLENDER (魔法拼读器)
           ========================================== -->
      <div v-else-if="activeTab === 'blender'" class="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-xl space-y-6 animate-fade-in">
        <div class="text-center">
          <h2 class="text-2xl sm:text-3xl font-cartoon font-bold text-slate-900">
            声韵魔法拼读合成器
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-bold mt-1">
            左边选声母，右边选带声调的韵母，一键拼出标准汉语音节！
          </p>
        </div>

        <!-- Blender Equation View -->
        <div class="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 rounded-3xl p-6 border-3 border-amber-300 text-center shadow-inner space-y-3">
          <div class="flex items-center justify-center gap-3 sm:gap-6">
            <div class="flex flex-col items-center">
              <span class="text-4xl sm:text-6xl font-black text-amber-900">{{ selectedSheng }}</span>
              <span class="text-xs font-bold text-amber-700">({{ blendedDetail.shengSound }})</span>
            </div>

            <span class="text-2xl sm:text-4xl font-extrabold text-amber-500">+</span>

            <div class="flex flex-col items-center">
              <span class="text-4xl sm:text-6xl font-black text-orange-900">{{ selectedYun }}</span>
              <span class="text-xs font-bold text-orange-700">({{ blendedDetail.yunSound }})</span>
            </div>

            <span class="text-2xl sm:text-4xl font-extrabold text-amber-500">=</span>

            <div class="flex flex-col items-center">
              <span class="text-5xl sm:text-7xl font-black text-rose-600 animate-bounce">{{ blendedDetail.blendedPinyin }}</span>
              <span v-if="blendedDetail.sampleChar" class="text-xs font-black text-rose-700">({{ blendedDetail.sampleChar }})</span>
            </div>
          </div>

          <!-- Sample Character Display Pill -->
          <div v-if="blendedDetail.sampleChar" class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 border border-amber-300 rounded-full text-xs sm:text-sm font-black text-amber-900 shadow-xs">
            <span>🌱 拼读字例：【{{ blendedDetail.sampleChar }}】（{{ blendedDetail.sampleWord }}）</span>
          </div>
          <div v-else class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 border border-amber-200 rounded-full text-xs font-bold text-slate-600">
            <span>💡 拼读发音：{{ blendedDetail.shengSound }} - {{ blendedDetail.yunSound }} -> {{ blendedDetail.blendedPinyin }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <!-- Left: Shengmu Selector -->
          <div class="space-y-2">
            <div class="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>1. 选择声母 (Initials)：</span>
              <span class="text-amber-600 font-bold">当前：{{ selectedSheng }} ({{ blendedDetail.shengSound }})</span>
            </div>
            <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              <button
                v-for="s in ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's']"
                :key="s"
                @click="selectedSheng = s; playBlended()"
                :class="[
                  'py-2 rounded-xl text-base font-black border transition-all cursor-pointer',
                  selectedSheng === s ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-xs' : 'bg-white text-slate-800 hover:bg-amber-50'
                ]"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Right: Yunmu Selector -->
          <div class="space-y-2">
            <div class="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>2. 选择带声调韵母 (Vowels)：</span>
              <span class="text-orange-600 font-bold">当前：{{ selectedYun }} ({{ blendedDetail.yunSound }})</span>
            </div>
            <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              <button
                v-for="y in ['ā', 'á', 'ǎ', 'à', 'ō', 'ó', 'ǒ', 'ò', 'ē', 'é', 'ě', 'è', 'ī', 'í', 'ǐ', 'ì', 'ū', 'ú', 'ǔ', 'ù', 'ái', 'ài', 'ǎo', 'ào', 'ān', 'àn', 'āng', 'àng']"
                :key="y"
                @click="selectedYun = y; playBlended()"
                :class="[
                  'py-2 rounded-xl text-base font-black border transition-all cursor-pointer',
                  selectedYun === y ? 'bg-orange-500 text-white border-orange-600 scale-105 shadow-xs' : 'bg-white text-slate-800 hover:bg-orange-50'
                ]"
              >
                {{ y }}
              </button>
            </div>
          </div>
        </div>

        <button
          @click="playBlended"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black text-lg sm:text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Volume2 class="w-6 h-6" />
          <span>大声拼读出来：{{ selectedSheng }}（{{ blendedDetail.shengSound }}） - {{ selectedYun }}（{{ blendedDetail.yunSound }}） -> {{ blendedDetail.blendedPinyin }}<span v-if="blendedDetail.sampleChar">（{{ blendedDetail.sampleChar }}）</span></span>
        </button>
      </div>

      <!-- ==========================================
           TAB 4: AUDIO QUIZ (听音辨音大闯关)
           ========================================== -->
      <div v-else-if="activeTab === 'quiz'" class="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-xl space-y-6 animate-fade-in text-center">
        <div>
          <div class="flex items-center justify-between text-xs font-black text-slate-500 mb-2">
            <span class="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">{{ currentQuiz.category }}</span>
            <span>第 {{ quizIdx + 1 }}/{{ quizList.length }} 题</span>
            <span class="text-amber-600 font-bold">得分：{{ quizScore }} 分</span>
          </div>
          <h2 class="text-2xl font-cartoon font-bold text-slate-900">
            仔细听！选出你听到的标准拼音
          </h2>
        </div>

        <!-- Speaker Button Card -->
        <button
          @click="playQuizAudio"
          class="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="点击重新听发音"
        >
          <Volume2 class="w-14 h-14 group-hover:animate-bounce" />
        </button>
        <p class="text-xs text-slate-400 font-bold">点击大喇叭播放标准汉语发音</p>

        <!-- 4 Options Grid -->
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="opt in currentQuiz.options"
            :key="opt"
            @click="handleQuizAnswer(opt)"
            :disabled="isQuizAnswered"
            :class="[
              'py-5 rounded-2xl text-3xl font-black border-3 transition-all cursor-pointer',
              isQuizAnswered
                ? opt === currentQuiz.correct
                  ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
            ]"
          >
            {{ opt }}
          </button>
        </div>

        <!-- Feedback Message -->
        <div v-if="quizFeedback" class="text-sm font-black text-amber-800 animate-fade-in p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          {{ quizFeedback }}
        </div>

        <button
          v-if="isQuizAnswered"
          @click="nextQuiz"
          class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black text-lg rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
        >
          下一题 ➔
        </button>
      </div>

    </main>
  </div>
</template>
