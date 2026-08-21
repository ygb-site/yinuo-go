<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { playButtonSound, playWinSound, playErrorSound } from '../../lib/audio';
import { speakText, stopSpeech } from '../../utils/speech';
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

interface PinyinCard {
  pinyin: string;
  name: string;
  rhyme: string;
  sampleChar: string;
  sampleWord: string;
  icon: string;
}

// 6 单韵母
const danYunMu: PinyinCard[] = [
  { pinyin: 'a', name: '单韵母 a', rhyme: '圆圆脸蛋扎小辫，张大嘴巴 a a a', sampleChar: '阿', sampleWord: '阿姨', icon: '👧' },
  { pinyin: 'o', name: '单韵母 o', rhyme: '太阳出来红通通，公鸡打鸣 o o o', sampleChar: '窝', sampleWord: '鸟窝', icon: '🐓' },
  { pinyin: 'e', name: '单韵母 e', rhyme: '清清池塘一只鹅，水中倒影 e e e', sampleChar: '鹅', sampleWord: '白鹅', icon: '🦢' },
  { pinyin: 'i', name: '单韵母 i', rhyme: '衣服衣服穿身上，一颗小扣 i i i', sampleChar: '衣', sampleWord: '衣服', icon: '👕' },
  { pinyin: 'u', name: '单韵母 u', rhyme: '乌龟乌龟慢吞吞，嘴巴突出 u u u', sampleChar: '乌', sampleWord: '乌龟', icon: '🐢' },
  { pinyin: 'ü', name: '单韵母 ü', rhyme: '小鱼吐泡跃龙门，吹起口哨 ü ü ü', sampleChar: '鱼', sampleWord: '小鱼', icon: '🐟' }
];

// 23 声母
const shengMu: PinyinCard[] = [
  { pinyin: 'b', name: '声母 b', rhyme: '收听广播 b b b，右下半圆 b b b', sampleChar: '八', sampleWord: '八个', icon: '📻' },
  { pinyin: 'p', name: '声母 p', rhyme: '泼水泼水 p p p，右上半圆 p p p', sampleChar: '爬', sampleWord: '爬山', icon: '🧗' },
  { pinyin: 'm', name: '声母 m', rhyme: '两个门洞 m m m，摸人捉迷藏 m m m', sampleChar: '妈', sampleWord: '妈妈', icon: '👩' },
  { pinyin: 'f', name: '声母 f', rhyme: '一根拐杖 f f f，手扶拐杖 f f f', sampleChar: '风', sampleWord: '大风', icon: '💨' },
  { pinyin: 'd', name: '声母 d', rhyme: '左下半圆 d d d，得得马蹄 d d d', sampleChar: '大', sampleWord: '大山', icon: '⛰️' },
  { pinyin: 't', name: '声母 t', rhyme: '伞柄朝下 t t t，特别特别 t t t', sampleChar: '天', sampleWord: '蓝天', icon: '☀️' },
  { pinyin: 'n', name: '声母 n', rhyme: '一个门洞 n n n，小哪吒 n n n', sampleChar: '你', sampleWord: '你好', icon: '👋' },
  { pinyin: 'l', name: '声母 l', rhyme: '一根小棒 l l l，快乐快乐 l l l', sampleChar: '乐', sampleWord: '快乐', icon: '😄' },
  { pinyin: 'g', name: '声母 g', rhyme: '一只白鸽 g g g，鸽子鸽子 g g g', sampleChar: '歌', sampleWord: '唱歌', icon: '🕊️' },
  { pinyin: 'k', name: '声母 k', rhyme: '蝌蚪蝌蚪 k k k，水里游 k k k', sampleChar: '开', sampleWord: '开花', icon: '🌸' },
  { pinyin: 'h', name: '声母 h', rhyme: '一把椅子 h h h，坐下喝水 h h h', sampleChar: '河', sampleWord: '小河', icon: '🌊' },
  { pinyin: 'j', name: '声母 j', rhyme: '母鸡母鸡 j j j，蝴蝶飞来 j j j', sampleChar: '鸡', sampleWord: '小鸡', icon: '🐥' },
  { pinyin: 'q', name: '声母 q', rhyme: '七个气球 q q q，气球升天 q q q', sampleChar: '七', sampleWord: '七个', icon: '🎈' },
  { pinyin: 'x', name: '声母 x', rhyme: '刀切西瓜 x x x，大红西瓜 x x x', sampleChar: '西', sampleWord: '西瓜', icon: '🍉' },
  { pinyin: 'zh', name: '翘舌声母 zh', rhyme: '蜘蛛织网 zh zh zh，织毛衣 zh zh zh', sampleChar: '中', sampleWord: '中国', icon: '🇨🇳' },
  { pinyin: 'ch', name: '翘舌声母 ch', rhyme: '小皮尺 ch ch ch，大皮尺 ch ch ch', sampleChar: '春', sampleWord: '春天', icon: '🌱' },
  { pinyin: 'sh', name: '翘舌声母 sh', rhyme: '狮子狮子 sh sh sh，威风凛凛 sh sh sh', sampleChar: '手', sampleWord: '小手', icon: '🦁' },
  { pinyin: 'r', name: '翘舌声母 r', rhyme: '一轮红日 r r r，日光普照 r r r', sampleChar: '日', sampleWord: '红日', icon: '🌅' },
  { pinyin: 'z', name: '平舌声母 z', rhyme: '写字写字 z z z，认真写字 z z z', sampleChar: '早', sampleWord: '早上', icon: '✍️' },
  { pinyin: 'c', name: '平舌声母 c', rhyme: '小刺猬 c c c，满身长刺 c c c', sampleChar: '草', sampleWord: '小草', icon: '🦔' },
  { pinyin: 's', name: '平舌声母 s', rhyme: '蚕儿吐丝 s s s，半个圆圈 s s s', sampleChar: '四', sampleWord: '四个', icon: '🐛' },
  { pinyin: 'y', name: '声母 y', rhyme: '树杈树杈 y y y，大树杈 y y y', sampleChar: '月', sampleWord: '月亮', icon: '🌙' },
  { pinyin: 'w', name: '声母 w', rhyme: '小屋屋顶 w w w，漂亮小屋 w w w', sampleChar: '我', sampleWord: '我们', icon: '🏠' }
];

// 18 复韵母与鼻韵母
const fuYunMu: PinyinCard[] = [
  { pinyin: 'ai', name: '复韵母 ai', rhyme: '挨在一起 ai ai ai，紧挨着 ai ai ai', sampleChar: '爱', sampleWord: '爱心', icon: '❤️' },
  { pinyin: 'ei', name: '复韵母 ei', rhyme: '小鹿拔草 ei ei ei，加油使劲 ei ei ei', sampleChar: '北', sampleWord: '北方', icon: '🧭' },
  { pinyin: 'ui', name: '复韵母 ui', rhyme: '围巾围巾 ui ui ui，漂亮围巾 ui ui ui', sampleChar: '水', sampleWord: '河水', icon: '🧣' },
  { pinyin: 'ao', name: '复韵母 ao', rhyme: '一件棉袄 ao ao ao，暖和棉袄 ao ao ao', sampleChar: '高', sampleWord: '高山', icon: '🧥' },
  { pinyin: 'ou', name: '复韵母 ou', rhyme: '海鸥海鸥 ou ou ou，飞越大海 ou ou ou', sampleChar: '狗', sampleWord: '小狗', icon: '🐶' },
  { pinyin: 'iu', name: '复韵母 iu', rhyme: '邮票邮票 iu iu iu，游泳健将 iu iu iu', sampleChar: '九', sampleWord: '九个', icon: '🏊' },
  { pinyin: 'ie', name: '复韵母 ie', rhyme: '一片椰树 ie ie ie，椰子甜甜 ie ie ie', sampleChar: '叶', sampleWord: '树叶', icon: '🌴' },
  { pinyin: 'üe', name: '复韵母 üe', rhyme: '一轮明月 üe üe üe，月光如水 üe üe üe', sampleChar: '月', sampleWord: '月光', icon: '🌕' },
  { pinyin: 'er', name: '特殊韵母 er', rhyme: '一只耳朵 er er er，耳听八方 er er er', sampleChar: '耳', sampleWord: '耳朵', icon: '👂' },
  { pinyin: 'an', name: '前鼻韵母 an', rhyme: '天安门前 an an an', sampleChar: '安', sampleWord: '安全', icon: '🏛️' },
  { pinyin: 'en', name: '前鼻韵母 en', rhyme: '按动门铃 en en en', sampleChar: '人', sampleWord: '大人', icon: '🔔' },
  { pinyin: 'in', name: '前鼻韵母 in', rhyme: '绿树成荫 in in in', sampleChar: '金', sampleWord: '金子', icon: '🌲' },
  { pinyin: 'un', name: '前鼻韵母 un', rhyme: '白云滚滚 un un un', sampleChar: '春', sampleWord: '春天', icon: '☁️' },
  { pinyin: 'ün', name: '前鼻韵母 ün', rhyme: '白云飘飘 ün ün ün', sampleChar: '云', sampleWord: '白云', icon: '⛅' },
  { pinyin: 'ang', name: '后鼻韵母 ang', rhyme: '昂首挺胸 ang ang ang', sampleChar: '羊', sampleWord: '小羊', icon: '🐑' },
  { pinyin: 'eng', name: '后鼻韵母 eng', rhyme: '一盏台灯 eng eng eng', sampleChar: '风', sampleWord: '大风', icon: '💡' },
  { pinyin: 'ing', name: '后鼻韵母 ing', rhyme: '雄鹰翱翔 ing ing ing', sampleChar: '星', sampleWord: '星星', icon: '🦅' },
  { pinyin: 'ong', name: '后鼻韵母 ong', rhyme: '敲响大钟 ong ong ong', sampleChar: '中', sampleWord: '中国', icon: '🔔' }
];

// 16 整体认读音节
const zhengTi: PinyinCard[] = [
  { pinyin: 'zhi', name: '整体认读 zhi', rhyme: '织毛衣 zhi，不用拼，直接读', sampleChar: '只', sampleWord: '一只鸟', icon: '🧶' },
  { pinyin: 'chi', name: '整体认读 chi', rhyme: '吃西瓜 chi，不用拼，直接读', sampleChar: '吃', sampleWord: '吃饭', icon: '🍉' },
  { pinyin: 'shi', name: '整体认读 shi', rhyme: '小狮子 shi，不用拼，直接读', sampleChar: '十', sampleWord: '十个', icon: '🦁' },
  { pinyin: 'ri', name: '整体认读 ri', rhyme: '红日升 ri，不用拼，直接读', sampleChar: '日', sampleWord: '今日', icon: '☀️' },
  { pinyin: 'zi', name: '整体认读 zi', rhyme: '写大字 zi，不用拼，直接读', sampleChar: '子', sampleWord: '儿子', icon: '✍️' },
  { pinyin: 'ci', name: '整体认读 ci', rhyme: '小刺猬 ci，不用拼，直接读', sampleChar: '次', sampleWord: '一次', icon: '🦔' },
  { pinyin: 'si', name: '整体认读 si', rhyme: '吐细丝 si，不用拼，直接读', sampleChar: '四', sampleWord: '四季', icon: '🧵' },
  { pinyin: 'yi', name: '整体认读 yi', rhyme: '一件衣服 yi，大y带小i', sampleChar: '一', sampleWord: '第一', icon: '👕' },
  { pinyin: 'wu', name: '整体认读 wu', rhyme: '漂亮小屋 wu，大w带小u', sampleChar: '五', sampleWord: '五个', icon: '🏠' },
  { pinyin: 'yu', name: '整体认读 yu', rhyme: '金鱼吐泡 yu，大y带小ü脱帽', sampleChar: '鱼', sampleWord: '小鱼', icon: '🐟' },
  { pinyin: 'ye', name: '整体认读 ye', rhyme: '椰子椰树 ye，大y带ie', sampleChar: '也', sampleWord: '也是', icon: '🌴' },
  { pinyin: 'yue', name: '整体认读 yue', rhyme: '明月高悬 yue，大y带üe', sampleChar: '月', sampleWord: '月亮', icon: '🌙' },
  { pinyin: 'yuan', name: '整体认读 yuan', rhyme: '公园游玩 yuan，大y带üan', sampleChar: '元', sampleWord: '一元钱', icon: '⛲' },
  { pinyin: 'yin', name: '整体认读 yin', rhyme: '音乐美妙 yin，大y带in', sampleChar: '音', sampleWord: '音乐', icon: '🎵' },
  { pinyin: 'yun', name: '整体认读 yun', rhyme: '白云飘荡 yun，大y带ün', sampleChar: '云', sampleWord: '云彩', icon: '☁️' },
  { pinyin: 'ying', name: '整体认读 ying', rhyme: '老鹰飞翔 ying，大y带ing', sampleChar: '鹰', sampleWord: '雄鹰', icon: '🦅' }
];

const currentCards = computed(() => {
  switch (soundboardCategory.value) {
    case 'dan': return danYunMu;
    case 'sheng': return shengMu;
    case 'fu': return fuYunMu;
    case 'zheng': return zhengTi;
  }
});

const activePinyin = ref<PinyinCard>(danYunMu[0]);

const playCard = (card: PinyinCard) => {
  playButtonSound();
  activePinyin.value = card;
  speakText(`${card.pinyin}，${card.rhyme}，${card.sampleWord}的${card.sampleChar}`);
};

// ==========================================
// 2. TONES SIMULATOR (四声调小汽车)
// ==========================================
const toneLetter = ref<string>('a');
const toneIndex = ref<number>(1);

const tonesData: Record<string, { t1: string; t2: string; t3: string; t4: string }> = {
  a: { t1: 'ā', t2: 'á', t3: 'ǎ', t4: 'à' },
  o: { t1: 'ō', t2: 'ó', t3: 'ǒ', t4: 'ò' },
  e: { t1: 'ē', t2: 'é', t3: 'ě', t4: 'è' },
  i: { t1: 'ī', t2: 'í', t3: 'ǐ', t4: 'ì' },
  u: { t1: 'ū', t2: 'ú', t3: 'ǔ', t4: 'ù' },
  ü: { t1: 'ǖ', t2: 'ǘ', t3: 'ǚ', t4: 'ǜ' }
};

const playTone = (t: number) => {
  toneIndex.value = t;
  playButtonSound();
  const currentToneMap = tonesData[toneLetter.value];
  let soundStr = '';
  let tip = '';
  if (t === 1) { soundStr = currentToneMap.t1; tip = '一声平，平地开车'; }
  else if (t === 2) { soundStr = currentToneMap.t2; tip = '二声扬，上坡加油'; }
  else if (t === 3) { soundStr = currentToneMap.t3; tip = '三声拐弯，下坡又上坡'; }
  else if (t === 4) { soundStr = currentToneMap.t4; tip = '四声降，下坡冲刺'; }

  speakText(`${soundStr}，${tip}`);
};

// ==========================================
// 3. PINYIN BLENDER (魔法拼读器)
// ==========================================
const selectedSheng = ref<string>('b');
const selectedYun = ref<string>('à');

const blendedResult = computed(() => {
  return selectedSheng.value + selectedYun.value;
});

const playBlended = () => {
  playButtonSound();
  speakText(`${selectedSheng.value}，${selectedYun.value}，${blendedResult.value}`);
};

// ==========================================
// 4. AUDIO QUIZ (听音辨音大闯关)
// ==========================================
interface QuizItem {
  audioPinyin: string;
  voiceText: string;
  options: string[];
  correct: string;
}

const quizList: QuizItem[] = [
  { audioPinyin: 'b', voiceText: 'b', options: ['b', 'd', 'p', 'q'], correct: 'b' },
  { audioPinyin: 'p', voiceText: 'p', options: ['p', 'q', 'b', 'd'], correct: 'p' },
  { audioPinyin: 'zh', voiceText: 'zh', options: ['zh', 'z', 'ch', 'c'], correct: 'zh' },
  { audioPinyin: 'ai', voiceText: 'ai', options: ['ai', 'ei', 'ui', 'ao'], correct: 'ai' },
  { audioPinyin: 'zhi', voiceText: 'zhi', options: ['zhi', 'chi', 'shi', 'zi'], correct: 'zhi' }
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
    quizScore.value += 20;
    quizFeedback.value = '太棒啦！回答完全正确！🎉';
    confetti({ particleCount: 60, spread: 50 });
  } else {
    playErrorSound();
    quizFeedback.value = `听错啦，正确发音是：${currentQuiz.value.correct}`;
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
          一年级上册必备基石
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
              <div class="text-sm font-black text-slate-800 mt-2">
                【{{ activePinyin.name }}】
              </div>

              <!-- Rhyme Box -->
              <div class="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-bold text-amber-900 leading-relaxed">
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
              <span>跟读发音与口诀</span>
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
              {{ (tonesData[toneLetter as keyof typeof tonesData] as any)['t' + t] }}
            </div>
            <div class="text-xs font-black">
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
        <div class="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 rounded-3xl p-6 border-3 border-amber-300 text-center shadow-inner flex items-center justify-center gap-4 sm:gap-6">
          <span class="text-4xl sm:text-6xl font-black text-amber-900">{{ selectedSheng }}</span>
          <span class="text-2xl sm:text-4xl font-extrabold text-amber-500">+</span>
          <span class="text-4xl sm:text-6xl font-black text-orange-900">{{ selectedYun }}</span>
          <span class="text-2xl sm:text-4xl font-extrabold text-amber-500">=</span>
          <span class="text-5xl sm:text-7xl font-black text-rose-600 animate-bounce">{{ blendedResult }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <!-- Left: Shengmu Selector -->
          <div class="space-y-2">
            <div class="text-xs font-black text-slate-700">1. 选择声母 (Initials)：</div>
            <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              <button
                v-for="s in ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's']"
                :key="s"
                @click="selectedSheng = s; playBlended()"
                :class="[
                  'py-2 rounded-xl text-base font-black border transition-all cursor-pointer',
                  selectedSheng === s ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-800'
                ]"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Right: Yunmu Selector -->
          <div class="space-y-2">
            <div class="text-xs font-black text-slate-700">2. 选择带声调韵母 (Vowels)：</div>
            <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              <button
                v-for="y in ['ā', 'á', 'ǎ', 'à', 'ō', 'ó', 'ǒ', 'ò', 'ē', 'é', 'ě', 'è', 'ī', 'í', 'ǐ', 'ì', 'ū', 'ú', 'ǔ', 'ù', 'ái', 'ài', 'ǎo', 'ào', 'ān', 'àn', 'āng', 'àng']"
                :key="y"
                @click="selectedYun = y; playBlended()"
                :class="[
                  'py-2 rounded-xl text-base font-black border transition-all cursor-pointer',
                  selectedYun === y ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-800'
                ]"
              >
                {{ y }}
              </button>
            </div>
          </div>
        </div>

        <button
          @click="playBlended"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Volume2 class="w-6 h-6" />
          <span>大声拼读出来：{{ selectedSheng }} - {{ selectedYun }} -> {{ blendedResult }}</span>
        </button>
      </div>

      <!-- ==========================================
           TAB 4: AUDIO QUIZ (听音辨音大闯关)
           ========================================== -->
      <div v-else-if="activeTab === 'quiz'" class="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-xl space-y-6 animate-fade-in text-center">
        <div>
          <div class="flex items-center justify-between text-xs font-black text-slate-500 mb-2">
            <span>闯关进度：第 {{ quizIdx + 1 }}/{{ quizList.length }} 题</span>
            <span class="text-amber-600 font-bold">得分：{{ quizScore }} 分</span>
          </div>
          <h2 class="text-2xl font-cartoon font-bold text-slate-900">
            仔细听！选出你听到的拼音
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
        <p class="text-xs text-slate-400 font-bold">点击大喇叭重新播放发音</p>

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
        <div v-if="quizFeedback" class="text-sm font-black text-amber-800 animate-fade-in">
          {{ quizFeedback }}
        </div>

        <button
          v-if="isQuizAnswered"
          @click="nextQuiz"
          class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-lg rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
        >
          下一题 ➔
        </button>
      </div>

    </main>
  </div>
</template>

