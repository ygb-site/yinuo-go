<script setup lang="ts">
import { ref, computed } from 'vue';
import { GO_DICTIONARY, type DictEntry } from '../data/dictionaryData';
import { GoBoard } from '../engine/GoBoard';
import type { Point } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound, playStoneSound } from '../lib/audio';
import GoBoardComponent from '../components/GoBoard.vue';
import {
  BookMarked,
  Sparkles,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Eye
} from 'lucide-vue-next';

const userStore = useUserStore();

const searchQuery = ref('');
const activeCategory = ref<string>('all');
const activeEntryId = ref<string>(GO_DICTIONARY[0].id);
const mobileTab = ref<'list' | 'detail'>('list');

const filteredEntries = computed(() => {
  return GO_DICTIONARY.filter(item => {
    const matchCat = activeCategory.value === 'all' || item.category === activeCategory.value;
    const matchSearch =
      !searchQuery.value.trim() ||
      item.chinese.includes(searchQuery.value) ||
      item.english.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.pinyin.includes(searchQuery.value);
    return matchCat && matchSearch;
  });
});

const currentEntryIndex = computed(() => {
  return filteredEntries.value.findIndex(e => e.id === activeEntryId.value);
});

const currentEntry = computed<DictEntry>(() => {
  const found = GO_DICTIONARY.find(e => e.id === activeEntryId.value);
  return found || filteredEntries.value[0] || GO_DICTIONARY[0];
});

// Demo Board State for current active entry
const demoBoard = ref<GoBoard>(new GoBoard(5));
const demoLastMove = ref<Point | null>(null);

const setupDemoBoard = (entry: DictEntry) => {
  demoBoard.value = new GoBoard(entry.demoBoardSize);
  demoLastMove.value = null;
  for (const st of entry.demoInitialStones) {
    demoBoard.value.setCell(st.r, st.c, st.color);
  }
};

const selectEntry = (entry: DictEntry) => {
  activeEntryId.value = entry.id;
  playButtonSound();
  setupDemoBoard(entry);
  mobileTab.value = 'detail';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const prevEntry = () => {
  const idx = currentEntryIndex.value;
  if (idx > 0) {
    selectEntry(filteredEntries.value[idx - 1]);
  }
};

const nextEntry = () => {
  const idx = currentEntryIndex.value;
  if (idx >= 0 && idx < filteredEntries.value.length - 1) {
    selectEntry(filteredEntries.value[idx + 1]);
  }
};

// Initialize demo board
setupDemoBoard(currentEntry.value);

const handleDemoPlay = (point: Point) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  demoLastMove.value = point;
  playStoneSound();
};

const resetDemoBoard = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  playButtonSound();
  setupDemoBoard(currentEntry.value);
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-8 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div class="space-y-1.5 sm:space-y-2 text-center md:text-left z-10">
          <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black">
            <BookMarked class="w-3.5 h-3.5" />
            <span>少儿围棋双语小字典 (Go Dictionary)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            围棋核心术语中英双解
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            天元星位、四大黄金线、气、叫吃、手筋、死活全收录，配有生动童趣比喻与微型实战小黑板！
          </p>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-72 z-10">
          <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索术语（如：天元、星位、气）..."
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      <!-- Mobile Tab Switcher (lg:hidden) -->
      <div class="lg:hidden flex items-center bg-amber-100/70 p-1 rounded-2xl border border-orange-200 shadow-inner">
        <button
          @click="mobileTab = 'list'"
          class="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          :class="mobileTab === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-orange-600'"
        >
          <List class="w-4 h-4" />
          <span>📚 术语列表 ({{ filteredEntries.length }})</span>
        </button>
        <button
          @click="mobileTab = 'detail'"
          class="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer truncate px-2"
          :class="mobileTab === 'detail' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
        >
          <Eye class="w-4 h-4 flex-shrink-0" />
          <span class="truncate">🔍 术语详解 ({{ currentEntry.chinese }})</span>
        </button>
      </div>

      <!-- Main Layout: Term List & Interactive Details -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

        <!-- Left List Column (5 cols) -->
        <div
          class="lg:col-span-5 space-y-4"
          :class="{ 'hidden lg:block': mobileTab === 'detail' }"
        >
          <!-- Category Filters -->
          <div class="bg-white rounded-3xl p-4 border-2 border-orange-100 shadow-sm space-y-2.5">
            <div class="flex flex-wrap gap-1.5">
              <button
                @click="activeCategory = 'all'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="activeCategory === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                全部术语
              </button>
              <button
                @click="activeCategory = 'board_positions'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="activeCategory === 'board_positions' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                🧭 棋盘地名
              </button>
              <button
                @click="activeCategory = 'basic'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="activeCategory === 'basic' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                🌱 基础概念
              </button>
              <button
                @click="activeCategory = 'tesuji'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="activeCategory === 'tesuji' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                ⚡ 吃子手筋
              </button>
              <button
                @click="activeCategory = 'life_death'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="activeCategory === 'life_death' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                🏰 死活眼位
              </button>
              <button
                @click="activeCategory = 'opening_shape'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="activeCategory === 'opening_shape' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                👑 布局地盘
              </button>
            </div>
          </div>

          <!-- Term Cards Scroll Area -->
          <div class="bg-white rounded-3xl p-3 border-2 border-orange-100 shadow-sm max-h-[580px] overflow-y-auto space-y-2">
            <div
              v-for="entry in filteredEntries"
              :key="entry.id"
              @click="selectEntry(entry)"
              class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group"
              :class="
                activeEntryId === entry.id
                  ? 'bg-orange-50 border-orange-400 shadow-sm ring-2 ring-orange-300/40'
                  : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'
              "
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-gray-900 group-hover:text-orange-600">{{ entry.chinese }}</span>
                  <span class="text-xs text-orange-600 font-bold">{{ entry.pinyin }}</span>
                </div>
                <div class="text-[11px] font-bold text-gray-400">
                  {{ entry.english }}
                </div>
              </div>

              <span
                class="text-[10px] font-black px-2 py-0.5 rounded-full border"
                :class="entry.badgeColor"
              >
                {{ entry.categoryName }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Detail & Live Interactive Demo Board (7 cols) -->
        <div
          class="lg:col-span-7 space-y-4"
          :class="{ 'hidden lg:block': mobileTab === 'list' }"
        >
          <!-- Mobile In-Detail Stepper Header (lg:hidden) -->
          <div class="lg:hidden flex items-center justify-between bg-white rounded-2xl p-3 border border-orange-200 shadow-2xs">
            <button
              @click="mobileTab = 'list'"
              class="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-black flex items-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>术语列表</span>
            </button>

            <div class="text-xs font-black text-gray-700">
              第 {{ currentEntryIndex + 1 }} / {{ filteredEntries.length }} 项
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="prevEntry"
                :disabled="currentEntryIndex <= 0"
                class="p-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="上一个"
              >
                <ChevronLeft class="w-4 h-4 text-gray-700" />
              </button>
              <button
                @click="nextEntry"
                :disabled="currentEntryIndex >= filteredEntries.length - 1"
                class="p-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="下一个"
              >
                <ChevronRight class="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-5 sm:p-8 border-2 border-orange-100 shadow-sm space-y-5 sm:space-y-6">
            
            <!-- Term Title Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-2xl sm:text-3xl font-black text-gray-900">
                    {{ currentEntry.chinese }}
                  </h2>
                  <span class="text-base font-extrabold text-orange-600">
                    {{ currentEntry.pinyin }}
                  </span>
                </div>
                <div class="text-sm font-bold text-gray-400 mt-0.5">
                  {{ currentEntry.english }}
                </div>
              </div>

              <span
                class="self-start sm:self-auto text-xs font-black px-3 py-1 rounded-full border"
                :class="currentEntry.badgeColor"
              >
                {{ currentEntry.categoryName }}
              </span>
            </div>

            <!-- Kid-friendly Analogy Box -->
            <div class="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 flex items-start gap-3">
              <span class="text-2xl flex-shrink-0">💡</span>
              <div class="space-y-0.5">
                <div class="text-xs font-black text-amber-900">小诺的趣味童言秒懂：</div>
                <p class="text-xs sm:text-sm font-bold text-amber-800 leading-relaxed">
                  {{ currentEntry.kidAnalogy }}
                </p>
              </div>
            </div>

            <!-- Professional Explanation -->
            <div class="space-y-2">
              <h4 class="text-xs font-black text-gray-500 uppercase tracking-wide">
                专业棋理定义 (Definition)
              </h4>
              <p class="text-sm text-gray-700 font-medium leading-relaxed">
                {{ currentEntry.fullDesc }}
              </p>
            </div>

            <!-- Live Interactive Mini Demo Board -->
            <div class="bg-orange-50/50 rounded-3xl p-4 sm:p-5 border border-orange-200 space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-1.5 text-xs font-black text-orange-900">
                  <Sparkles class="w-4 h-4 text-orange-500" />
                  <span>互动小黑板 · 动手下下一诺演练</span>
                </div>
                <button
                  @click="resetDemoBoard"
                  class="text-[11px] font-black text-orange-600 hover:text-orange-700 bg-white px-2.5 py-1 rounded-full border border-orange-200 shadow-sm active:scale-95 cursor-pointer"
                >
                  重置演示
                </button>
              </div>

              <!-- Mini Board Component -->
              <div class="flex justify-center py-2">
                <GoBoardComponent
                  :board="demoBoard"
                  :playerColor="'B'"
                  :lastMove="demoLastMove"
                  :highlightPoints="currentEntry.demoInteractiveMoves"
                  :showLiberties="true"
                  :showAtari="true"
                  :sizePx="320"
                  @play="handleDemoPlay"
                />
              </div>

              <p class="text-xs text-center text-orange-900/80 font-bold">
                {{ currentEntry.demoExplanation }}
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  </div>
</template>
