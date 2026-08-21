<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { POETRY_LIBRARY, type PoemItem, type PoemLine } from '../../data/poetryLibrary';
import { useUserStore } from '../../stores/useUserStore';
import { playButtonSound, playWinSound } from '../../lib/audio';
import { speakText, stopSpeech } from '../../utils/speech';
import { pinyin } from 'pinyin-pro';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Bookmark,
  Search,
  Sparkles,
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// Library State
const selectedCategory = ref<string>('all');
const searchQuery = ref<string>('');
const activePoemId = ref<string>(POETRY_LIBRARY[0].id);

// 🌟 家长/学生任意输入自定义古诗 (Custom Poem Input)
const isCustomPoem = ref<boolean>(false);
const customTitle = ref<string>('');
const customAuthor = ref<string>('');
const customDynasty = ref<string>('唐');
const customContent = ref<string>('');
const customPoemObj = ref<PoemItem | null>(null);

const categories = [
  { id: 'all', name: '全部古诗', count: POETRY_LIBRARY.length },
  { id: '小学一二年级必背', name: '小学一二年级必背', count: POETRY_LIBRARY.filter(p => p.category === '小学一二年级必背').length },
  { id: '唐诗三百首·五言绝句', name: '五言绝句', count: POETRY_LIBRARY.filter(p => p.category === '唐诗三百首·五言绝句').length },
  { id: '唐诗三百首·七言绝句', name: '七言绝句', count: POETRY_LIBRARY.filter(p => p.category === '唐诗三百首·七言绝句').length },
  { id: '唐诗三百首·古体乐府', name: '古体乐府', count: POETRY_LIBRARY.filter(p => p.category === '唐诗三百首·古体乐府').length }
];

const filteredPoems = computed<PoemItem[]>(() => {
  let list = POETRY_LIBRARY;

  if (selectedCategory.value !== 'all') {
    list = list.filter((p: PoemItem) => p.category === selectedCategory.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      (p: PoemItem) =>
        p.title.includes(q) ||
        p.author.includes(q) ||
        p.lines.some((l: PoemLine) => l.text.includes(q))
    );
  }

  return list;
});

const currentPoem = computed<PoemItem>(() => {
  if (isCustomPoem.value && customPoemObj.value) {
    return customPoemObj.value;
  }
  const found = POETRY_LIBRARY.find((p: PoemItem) => p.id === activePoemId.value);
  return found || filteredPoems.value[0] || POETRY_LIBRARY[0];
});

const selectPoem = (item: PoemItem) => {
  playButtonSound();
  stopSpeech();
  isCustomPoem.value = false;
  activePoemId.value = item.id;
};

// Handle Custom Poem Auto-Pinyin & Creation
const handleCreateCustomPoem = () => {
  const text = customContent.value.trim();
  if (!text) return;

  const rawLines = text
    .split(/[\n，。？！；,?!;]/)
    .map(s => s.trim())
    .filter(Boolean);

  const lines: PoemLine[] = rawLines.map(lineText => ({
    text: lineText,
    pinyin: pinyin(lineText, { toneType: 'symbol' })
  }));

  customPoemObj.value = {
    id: 'custom_poem',
    title: customTitle.value.trim() || '自定义古诗',
    dynasty: customDynasty.value.trim() || '经典',
    author: customAuthor.value.trim() || '传统名篇',
    category: '自定义导入',
    lines,
    appreciation: '通过 pinyin-pro 智能注音引擎自动生成的带拼音声画朗读诗篇。'
  };

  isCustomPoem.value = true;
  playWinSound();
};

const playFullPoem = () => {
  playButtonSound();
  const p = currentPoem.value;
  const content = `${p.title}，${p.dynasty}代，${p.author}。${p.lines.map((l: PoemLine) => l.text).join('，')}`;
  speakText(content);
};

const playLine = (lineText: string) => {
  playButtonSound();
  speakText(lineText);
};

const handleMarkRecited = () => {
  playWinSound();
  confetti({ particleCount: 90, spread: 70 });
  userStore.addCoins(40, `背诵古诗《${currentPoem.value.title}》`);
  userStore.addExp(60);
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
          <span>📜</span>
          <span>经典古诗文点读与背诵大本营</span>
        </h1>

        <div class="text-xs font-black bg-white/20 px-3 py-1 rounded-full hidden sm:block">
          唐诗三百首 + 小学必备75首
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 mt-6 space-y-6">
      
      <!-- ==========================================
           🌟 家长/学生：自定义输入任意古诗自动注音区
           ========================================== -->
      <div class="bg-white rounded-3xl p-5 sm:p-6 border-3 border-amber-300 shadow-md space-y-3">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
            📜
          </span>
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900">
              智能古诗输入点读机（支持输入全国任意诗篇）
            </h3>
            <p class="text-xs text-slate-500 font-bold">
              粘贴或输入任意古诗词，智能注音引擎（pinyin-pro）会自动生成标准带声调拼音与声画点读！
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <input
            v-model="customTitle"
            type="text"
            placeholder="诗歌标题 (如: 游子吟)"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-amber-400"
          />
          <input
            v-model="customAuthor"
            type="text"
            placeholder="诗人作者 (如: 孟郊)"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-amber-400"
          />
          <input
            v-model="customContent"
            type="text"
            placeholder="诗句内容 (如: 慈母手中线，游子身上衣...)"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[11px] text-slate-400 font-bold">
            💡 支持任意逗号句号或换行，自动分行并注上拼音
          </span>

          <button
            @click="handleCreateCustomPoem"
            :disabled="!customContent.trim()"
            class="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black text-xs rounded-xl shadow-sm active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>智能注音并开启点读</span>
          </button>
        </div>
      </div>

      <!-- Main Layout Grid: Left List + Right Reader -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- ==========================================
             LEFT: Poetry Index List & Search (占 5 列)
             ========================================== -->
        <div class="lg:col-span-5 space-y-3">
          <!-- Category Tabs -->
          <div class="flex gap-1 bg-white p-1.5 rounded-2xl border-2 border-amber-200 shadow-xs overflow-x-auto no-scrollbar">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id; isCustomPoem = false"
              :class="[
                'py-1.5 px-3 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1',
                selectedCategory === cat.id && !isCustomPoem
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-amber-50'
              ]"
            >
              <span>{{ cat.name }}</span>
              <span
                class="text-[10px] px-1.5 py-0.2 rounded-full"
                :class="selectedCategory === cat.id && !isCustomPoem ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'"
              >
                {{ cat.count }}
              </span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative bg-white rounded-2xl p-2 border-2 border-slate-200 shadow-xs">
            <Search class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索诗名、作者、名句 (如: 李白 / 春晓)..."
              class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          <!-- Poems List -->
          <div class="space-y-2 max-h-[520px] overflow-y-auto p-1">
            <button
              v-for="p in filteredPoems"
              :key="p.id"
              @click="selectPoem(p)"
              :class="[
                'w-full p-3.5 rounded-2xl border-2 text-left font-black transition-all flex items-center justify-between cursor-pointer shadow-2xs group',
                !isCustomPoem && activePoemId === p.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-md scale-102'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
              ]"
            >
              <div>
                <div class="text-sm sm:text-base flex items-center gap-2">
                  <span>《{{ p.title }}》</span>
                  <span
                    class="text-[10px] px-1.5 py-0.2 rounded-md font-bold"
                    :class="!isCustomPoem && activePoemId === p.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ p.category }}
                  </span>
                </div>
                <div class="text-xs opacity-80 mt-0.5 font-bold">
                  〔{{ p.dynasty }}〕{{ p.author }}
                </div>
              </div>
              <Bookmark class="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <!-- ==========================================
             RIGHT: Interactive Poetry Studio (占 7 列)
             ========================================== -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <!-- Header: Title & Poet -->
            <div class="text-center pb-6 border-b border-amber-100">
              <div class="inline-block px-3 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-black mb-2">
                {{ currentPoem.category }}
              </div>
              <h2 class="text-3xl sm:text-4xl font-cartoon font-bold text-slate-900 tracking-wider">
                {{ currentPoem.title }}
              </h2>
              <div class="mt-1.5 text-sm font-bold text-amber-700">
                〔{{ currentPoem.dynasty }}〕{{ currentPoem.author }}
              </div>
            </div>

            <!-- Verse Lines with Auto Pinyin -->
            <div class="py-6 space-y-4 text-center">
              <div
                v-for="(line, idx) in currentPoem.lines"
                :key="idx"
                @click="playLine(line.text)"
                class="cursor-pointer group hover:bg-amber-50/80 p-2.5 rounded-2xl transition-all"
                title="点击朗读此句"
              >
                <!-- Line Pinyin -->
                <div class="text-xs sm:text-sm font-bold text-amber-600/80 mb-0.5 tracking-wider font-mono">
                  {{ line.pinyin }}
                </div>
                <!-- Line Chinese Hanzi -->
                <div class="text-2xl sm:text-3xl font-black text-slate-800 tracking-widest group-hover:text-amber-800 transition-colors flex items-center justify-center gap-2">
                  <span>{{ line.text }}</span>
                  <Volume2 class="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            <!-- Appreciation Note -->
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-bold text-amber-900 leading-relaxed">
              💡 <span class="font-black">诗词大意与赏析：</span>{{ currentPoem.appreciation }}
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
            <button
              @click="playFullPoem"
              class="px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-sm flex items-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Volume2 class="w-4 h-4 text-amber-700" />
              <span>全文配乐朗读</span>
            </button>

            <button
              @click="handleMarkRecited"
              class="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-black text-sm flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>我背会啦 (+40金币)</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>


