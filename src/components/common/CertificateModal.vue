<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '../../stores/useUserStore';

import {
  Award,
  X,
  Printer
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  rankTitle: string;
  rankLevel: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();

const certificateNo = computed(() => {
  return 'YNGO-' + new Date().getFullYear() + '-' + Math.abs(userStore.currentProfile.createdAt % 100000).toString().padStart(6, '0');
});

const issueDate = computed(() => {
  const d = new Date();
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
});

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-hidden bg-black/70 no-scrollbar modal-overlay backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 space-y-6 animate-pop-in print:border-none print:shadow-none print:m-0">
        
        <!-- Close Button (hidden in print) -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition print:hidden"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Printable Certificate Body -->
        <div class="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-[#FFFDF7] via-[#FFF8E7] to-[#FFF3D6] border-4 border-[#C99700] text-center space-y-6 shadow-inner overflow-hidden">
          
          <!-- Corner Traditional Flourishes -->
          <div class="absolute top-2 left-2 text-[#C99700] text-xl select-none opacity-80">╔══</div>
          <div class="absolute top-2 right-2 text-[#C99700] text-xl select-none opacity-80">══╗</div>
          <div class="absolute bottom-2 left-2 text-[#C99700] text-xl select-none opacity-80">╚══</div>
          <div class="absolute bottom-2 right-2 text-[#C99700] text-xl select-none opacity-80">══╝</div>

          <!-- Top Seal Badge -->
          <div class="flex justify-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-lg border-2 border-white flex items-center justify-center">
              <Award class="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow" />
            </div>
          </div>

          <!-- Header Titles -->
          <div class="space-y-1">
            <div class="text-xs font-black tracking-widest text-[#8A6700] uppercase">
              YINUO GO ACADEMY · HONOR CERTIFICATE
            </div>
            <h1 class="text-2xl sm:text-4xl font-cartoon font-bold text-[#5C3800] tracking-widest">
              少儿围棋段级位荣誉证书
            </h1>
          </div>

          <!-- Student & Rank Award Text -->
          <div class="py-3 px-4 sm:px-6 bg-white/70 rounded-2xl border border-amber-200/80 space-y-3">
            <p class="text-sm sm:text-base font-bold text-gray-800 leading-relaxed">
              兹证明小棋手 <span class="text-xl sm:text-2xl font-black text-orange-600 underline decoration-amber-400 underline-offset-4 px-2">{{ userStore.nickname }}</span>（{{ userStore.avatar }}）
            </p>
            <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
              在【一诺弈学少儿启蒙学院】完成系统修习与死活对战考验，棋理通达，手筋敏锐，特授予：
            </p>
            <div class="inline-block py-2 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xl sm:text-3xl font-cartoon font-bold shadow-md">
              🏅 {{ rankTitle }} 称号
            </div>
          </div>

          <!-- Footer Seals & Dates -->
          <div class="pt-4 border-t border-amber-300/80 flex items-center justify-between text-left text-xs font-bold text-gray-600">
            <div>
              <div>证书编号：<span class="font-mono text-gray-800">{{ certificateNo }}</span></div>
              <div class="mt-0.5">发证日期：{{ issueDate }}</div>
            </div>

            <!-- Red Seal Stamp -->
            <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-rose-600 text-rose-600 flex flex-col items-center justify-center rotate-[-12deg] p-1 font-black shadow-xs bg-white/40">
              <div class="text-[9px] leading-tight">一诺弈学</div>
              <div class="text-xs font-black my-0.5">⭐ 导师小诺 ⭐</div>
              <div class="text-[8px] leading-tight">认证印章</div>
            </div>
          </div>

        </div>

        <!-- Action Buttons (Print & Share - hidden in print) -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
          <button
            @click="handlePrint"
            class="flex-1 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>🖨️ 打印 / 另存为 PDF 证书</span>
          </button>
          
          <button
            @click="emit('close')"
            class="flex-1 py-3.5 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm transition active:scale-95 flex items-center justify-center cursor-pointer"
          >
            返回成就馆
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
