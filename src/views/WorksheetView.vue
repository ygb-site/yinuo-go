<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { TSUMEGO_PUZZLES } from '../data/tsumegoLibrary';
import { useUserStore } from '../stores/useUserStore';
import {
  Printer,
  ArrowLeft,
  BookOpen
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// Select 6 curated tsumego puzzles for standard A4 page layout
const puzzles = computed(() => {
  return TSUMEGO_PUZZLES.slice(0, 6);
});

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] py-6 px-4 select-none print:bg-white print:p-0">
    
    <!-- Top Action Bar (Hidden when printing) -->
    <div class="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm print:hidden">
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>返回</span>
      </button>

      <div class="text-center">
        <h1 class="text-base sm:text-lg font-black text-gray-900">少儿围棋 A4 标准打印题单 (Worksheet)</h1>
        <p class="text-xs text-gray-500 font-medium">支持浏览器一键打印为纸质练习册</p>
      </div>

      <button
        @click="handlePrint"
        class="px-5 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
      >
        <Printer class="w-4 h-4" />
        <span>立即打印 🖨️</span>
      </button>
    </div>

    <!-- A4 Paper Container -->
    <div class="max-w-4xl mx-auto bg-white border-2 border-gray-200 shadow-lg p-8 sm:p-12 space-y-6 print:border-none print:shadow-none print:p-4 print:max-w-full">
      
      <!-- Worksheet Header -->
      <div class="border-b-2 border-gray-800 pb-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-gray-900 font-cartoon">
            一诺弈学 · 少儿死活手筋实战题单
          </h2>
          <div class="text-xs text-gray-500 font-bold mt-1">
            专注力 · 算路深度 · 手筋敏锐度特训
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-bold text-gray-700">
          <div class="border-b border-gray-400 pb-0.5 min-w-[100px]">
            姓名：<span class="font-black">{{ userStore.nickname }}</span>
          </div>
          <div class="border-b border-gray-400 pb-0.5 min-w-[80px]">
            得分：_____
          </div>
        </div>
      </div>

      <!-- 6-Grid Puzzles (2 cols x 3 rows) -->
      <div class="grid grid-cols-2 gap-6">
        <div
          v-for="(p, idx) in puzzles"
          :key="p.id"
          class="border-2 border-gray-300 rounded-2xl p-4 space-y-3 print:border-gray-800"
        >
          <div class="flex items-center justify-between border-b border-gray-200 pb-1.5 text-xs font-black">
            <span class="text-orange-600">第 {{ idx + 1 }} 题：{{ p.title }}</span>
            <span class="text-gray-400">【{{ p.categoryLabel }}】</span>
          </div>

          <div class="text-[11px] text-gray-700 font-medium leading-snug">
            {{ p.prompt }}
          </div>

          <!-- Printable Pure CSS Grid Board representation -->
          <div class="w-40 h-40 mx-auto relative bg-[#FDFBF7] border border-gray-800 grid grid-cols-4 grid-rows-4 p-1 shadow-inner">
            <!-- Grid Lines inside -->
            <div
              v-for="r in 4"
              :key="`row-${r}`"
              class="border-b border-r border-gray-400 relative"
            ></div>

            <!-- Stones Overlay -->
            <div
              v-for="st in p.initialStones"
              :key="`stone-${st.r}-${st.c}`"
              class="absolute w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transform -translate-x-1/2 -translate-y-1/2 shadow-xs"
              :class="st.color === 'B' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-800 text-gray-900'"
              :style="{
                left: (st.c / (p.boardSize - 1)) * 100 + '%',
                top: (st.r / (p.boardSize - 1)) * 100 + '%'
              }"
            ></div>
          </div>

          <div class="text-[10px] text-gray-400 pt-1 text-center font-bold border-t border-gray-100">
            请在正确落子交叉点画「◯」标记
          </div>
        </div>
      </div>

      <!-- Page Break & Answer Key (for teachers/parents) -->
      <div class="pt-8 border-t-2 border-dashed border-gray-400 page-break space-y-3">
        <div class="text-xs font-black text-gray-800 uppercase flex items-center gap-1.5">
          <BookOpen class="w-4 h-4 text-orange-600" />
          <span>参考答案与名师精解（家长/老师查对专用）：</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div
            v-for="(p, idx) in puzzles"
            :key="`ans-${p.id}`"
            class="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-1"
          >
            <div class="font-black text-gray-900">第 {{ idx + 1 }} 题：{{ p.bilingualKey.term }}</div>
            <div class="text-gray-600 text-[11px]">{{ p.explanation }}</div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
