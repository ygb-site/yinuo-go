<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import HanziWriterPlayer from '../../components/common/HanziWriterPlayer.vue';
import { HANZI_VOCABULARY_LIST, type HanziVocabularyItem } from '../../data/hanziLibrary';
import { DictionaryService } from '../../services/dictionaryService';
import { useUserStore } from '../../stores/useUserStore';
import { playButtonSound, playWinSound } from '../../lib/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Search } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// Navigation & Filters
const selectedGrade = ref<string>('all');
const searchQuery = ref<string>('');
const selectedCategory = ref<string>('all');

// Active Character State
const activeCharId = ref<string>(HANZI_VOCABULARY_LIST[0].id);

// 🌟 家长/学生自定义输入查字 (Custom Input)
const customInputText = ref<string>('');
const customCharList = ref<string[]>([]);
const isCustomActive = ref<boolean>(false);
const activeCustomChar = ref<string>('学');
const studioRef = ref<HTMLElement | null>(null);
const showCharDetails = ref(false);

const writerSize = computed(() => {
  if (typeof window === 'undefined') return 200;
  return window.innerWidth < 1024 ? 156 : 200;
});

const gradeTabs = [
  { id: 'all', name: '全部生字', count: HANZI_VOCABULARY_LIST.length },
  { id: '一年级上册', name: '一年级上册', count: HANZI_VOCABULARY_LIST.filter((h: HanziVocabularyItem) => h.grade === '一年级上册').length },
  { id: '一年级下册', name: '一年级下册', count: HANZI_VOCABULARY_LIST.filter((h: HanziVocabularyItem) => h.grade === '一年级下册').length },
  { id: '二年级上册', name: '二年级上册', count: HANZI_VOCABULARY_LIST.filter((h: HanziVocabularyItem) => h.grade === '二年级上册').length },
  { id: '二年级下册', name: '二年级下册', count: HANZI_VOCABULARY_LIST.filter((h: HanziVocabularyItem) => h.grade === '二年级下册').length }
];

const categories = computed<string[]>(() => {
  const set = new Set<string>();
  HANZI_VOCABULARY_LIST.forEach((item: HanziVocabularyItem) => set.add(item.category));
  return Array.from(set);
});

const filteredList = computed<HanziVocabularyItem[]>(() => {
  return DictionaryService.searchHanzi(searchQuery.value, selectedGrade.value);
});

// Calculate current active character object
const currentChar = computed<HanziVocabularyItem>(() => {
  if (isCustomActive.value && activeCustomChar.value) {
    return DictionaryService.lookupHanzi(activeCustomChar.value);
  }

  const found = HANZI_VOCABULARY_LIST.find((c: HanziVocabularyItem) => c.id === activeCharId.value);
  return found || filteredList.value[0] || HANZI_VOCABULARY_LIST[0];
});

const scrollStudioIntoView = () => {
  if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
  nextTick(() => {
    studioRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
};

const selectChar = (item: HanziVocabularyItem) => {
  playButtonSound();
  isCustomActive.value = false;
  activeCharId.value = item.id;
  scrollStudioIntoView();
};

// Handle custom parent input
const handleCustomSearch = () => {
  const raw = customInputText.value.trim();
  if (!raw) return;

  // Extract all Chinese characters from input
  const matches = raw.match(/[\u4e00-\u9fa5]/g);
  if (matches && matches.length > 0) {
    customCharList.value = matches;
    activeCustomChar.value = matches[0];
    isCustomActive.value = true;
    playButtonSound();
    scrollStudioIntoView();
  }
};

const selectCustomChar = (char: string) => {
  playButtonSound();
  activeCustomChar.value = char;
  isCustomActive.value = true;
  scrollStudioIntoView();
};

const handleQuizPassed = () => {
  playWinSound();
  confetti({ particleCount: 70, spread: 60 });
  userStore.addCoins(20, `掌握生字【${currentChar.value.char}】笔顺`);
  userStore.addExp(30);
  userStore.recordKnowledgePractice('chinese.g1.strokes.order', true);
};

const goBack = () => {
  playButtonSound();
  router.push('/subject/chinese');
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] pb-20 select-none">
    <!-- Top Header -->
    <header class="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-md">
      <div class="max-w-6xl mx-auto grid grid-cols-[minmax(3.5rem,auto)_1fr_minmax(3.5rem,auto)] items-center gap-2 sm:gap-3">
        <button
          @click="goBack"
          class="justify-self-start shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/20 hover:bg-white/30 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span class="sm:hidden">返回</span>
          <span class="hidden sm:inline">返回语文馆</span>
        </button>

        <h1 class="min-w-0 text-center text-base sm:text-xl md:text-2xl font-cartoon font-bold tracking-wide truncate">
          ✍️ 生字笔顺
        </h1>

        <span class="justify-self-end hidden md:inline-flex text-[11px] font-black bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">
          部编版 · 任意查字
        </span>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 mt-3 sm:mt-5 space-y-4 sm:space-y-6">
      <!-- 手机：笔顺演练在上；电脑：左侧字库、右侧演练 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- ==========================================
             LEFT COLUMN: Textbook Character Library (占7列)
             ========================================== -->
        <div class="lg:col-span-7 space-y-4 order-2 lg:order-1">
          <!-- 家长专属：任意输入汉字查笔顺 -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border-3 border-amber-300 shadow-md space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                  ✏️
                </span>
                <div>
                  <h3 class="text-base sm:text-lg font-cartoon font-bold text-slate-900 tracking-wide">
                    家长/学生任意输入查笔顺（支持全国所有汉字）
                  </h3>
                  <p class="text-xs text-slate-500 font-bold">
                    输入老师布置的生字、词语或孩子的名字（如：“诺”、“学”、“爱”、“自强不息”），立即演示笔顺与描红测验！
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-1">
              <div class="relative flex-1">
                <input
                  v-model="customInputText"
                  @keyup.enter="handleCustomSearch"
                  type="text"
                  placeholder="在此输入想要练习的任意汉字或词句..."
                  class="w-full pl-4 pr-12 py-3 bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl text-base font-black text-slate-900 focus:outline-none shadow-inner"
                />
              </div>

              <button
                @click="handleCustomSearch"
                :disabled="!customInputText.trim()"
                class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>立即查笔顺</span>
                <span>🔍</span>
              </button>
            </div>

            <div v-if="customCharList.length > 0" class="flex items-center gap-2 pt-2 flex-wrap animate-fade-in">
              <span class="text-xs font-black text-amber-900">点击逐字练习：</span>
              <button
                v-for="c in customCharList"
                :key="c"
                @click="selectCustomChar(c)"
                :class="[
                  'w-10 h-10 rounded-xl text-lg font-black border-2 transition-all cursor-pointer shadow-xs',
                  isCustomActive && activeCustomChar === c
                    ? 'bg-amber-500 text-white border-amber-600 scale-110 shadow-md ring-2 ring-amber-300'
                    : 'bg-amber-50 text-slate-800 border-amber-200 hover:bg-amber-100'
                ]"
              >
                {{ c }}
              </button>
            </div>

            <div class="flex items-center gap-2 pt-1 text-xs text-slate-400 font-bold flex-wrap">
              <span>快捷试试：</span>
              <button
                v-for="sample in ['诺', '学', '爱', '龙', '赢', '中国', '未来']"
                :key="sample"
                @click="customInputText = sample; handleCustomSearch()"
                class="px-2.5 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {{ sample }}
              </button>
            </div>
          </div>

          <!-- Grade Filter Tabs -->
          <div class="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-amber-200 shadow-xs">
            <button
              v-for="tab in gradeTabs"
              :key="tab.id"
              @click="selectedGrade = tab.id; selectedCategory = 'all'; isCustomActive = false"
              :class="[
                'py-2 px-3 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1',
                selectedGrade === tab.id && !isCustomActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-amber-50'
              ]"
            >
              <span>{{ tab.name }}</span>
              <span
                class="text-[10px] px-1.5 py-0.2 rounded-full"
                :class="selectedGrade === tab.id && !isCustomActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>

          <!-- Search & Category Filters -->
          <div class="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2">
            <!-- Search Input -->
            <div class="relative flex-1">
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="在教材字表中搜索 (如: 天 或 tiān)..."
                class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            <!-- Category Pills -->
            <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                @click="selectedCategory = 'all'"
                :class="[
                  'px-2.5 py-1 rounded-lg text-[11px] font-black shrink-0 transition-all cursor-pointer',
                  selectedCategory === 'all'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                ]"
              >
                全部类型
              </button>
              <button
                v-for="cat in categories"
                :key="cat"
                @click="selectedCategory = cat"
                :class="[
                  'px-2.5 py-1 rounded-lg text-[11px] font-black shrink-0 transition-all cursor-pointer',
                  selectedCategory === cat
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                ]"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Characters Grid Box -->
          <div class="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm">
            <div class="text-xs font-black text-slate-400 mb-3 px-1 flex items-center justify-between">
              <span>部编教材生字库 (共 {{ filteredList.length }} 个)</span>
              <span class="text-amber-600 hidden lg:inline">点击任意生字，在右侧演练笔顺 ➔</span>
              <span class="text-amber-600 lg:hidden">点选生字，笔顺在上方演练 ↑</span>
            </div>

            <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5 max-h-[280px] lg:max-h-[460px] overflow-y-auto p-1">
              <button
                v-for="item in filteredList"
                :key="item.id"
                @click="selectChar(item)"
                :class="[
                  'aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all transform active:scale-90 cursor-pointer shadow-2xs group',
                  !isCustomActive && activeCharId === item.id
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white border-amber-600 scale-105 shadow-md ring-3 ring-amber-200'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                ]"
              >
                <span class="text-2xl sm:text-3xl font-black group-hover:scale-110 transition-transform">
                  {{ item.char }}
                </span>
                <span class="text-[10px] font-bold opacity-80 mt-0.5">
                  {{ item.pinyin }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- ==========================================
             RIGHT COLUMN: Interactive Hanzi Studio (占5列)
             ========================================== -->
        <div
          ref="studioRef"
          class="lg:col-span-5 order-1 lg:order-2 bg-white rounded-3xl p-4 sm:p-7 border-3 border-amber-200 shadow-xl flex flex-col justify-between space-y-3 sm:space-y-6 sticky top-2 z-20 max-h-[58vh] overflow-y-auto lg:max-h-none lg:static scroll-mt-3"
        >
          <div>
            <div class="lg:hidden mb-2 text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-center">
              笔顺演练在这里 · 向下选字后点「看笔顺动画」
            </div>

            <!-- Title row -->
            <div class="flex items-center justify-between pb-3 sm:pb-4 border-b border-amber-100">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                    {{ currentChar.grade }}
                  </span>
                  <span v-if="currentChar.strokeCount > 0" class="text-xs text-slate-400 font-bold">
                    部首：{{ currentChar.radical }} · {{ currentChar.strokeCount }} 画
                  </span>
                </div>
                <h2 class="text-xl sm:text-3xl font-cartoon font-bold text-slate-900 mt-1 tracking-wide">
                  认识生字【{{ currentChar.char }}】
                </h2>
              </div>

              <span class="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {{ currentChar.category }}
              </span>
            </div>

            <!-- Hanzi Writer Studio Mount -->
            <div class="py-2 sm:py-4 flex justify-center">
              <HanziWriterPlayer
                :character="currentChar.char"
                :pinyin="currentChar.pinyin"
                :meaning="currentChar.meaning"
                :size="writerSize"
                @complete="handleQuizPassed"
              />
            </div>

            <!-- Character Details Card：手机默认收起，避免挡住字库 -->
            <div class="space-y-3">
              <button
                type="button"
                class="lg:hidden w-full py-2 text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer"
                @click="showCharDetails = !showCharDetails"
              >
                {{ showCharDetails ? '收起字义组词' : '展开字义 · 组词 · 造句' }}
              </button>

              <div
                class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2"
                :class="showCharDetails ? 'block' : 'hidden lg:block'"
              >
                <div class="text-xs text-amber-950 font-bold">
                  💡 <span class="font-black">字义解析：</span>{{ currentChar.meaning }}
                </div>

                <div class="text-xs font-black text-amber-900 flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-200/60">
                  <span>📚 常用组词：</span>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="w in currentChar.words"
                      :key="w"
                      class="px-2.5 py-0.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-800 shadow-2xs"
                    >
                      {{ w }}
                    </span>
                  </div>
                </div>

                <div class="text-xs text-amber-950 font-bold leading-relaxed pt-1">
                  📝 <span class="font-black">造句示范：</span>{{ currentChar.sampleSentence }}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>


