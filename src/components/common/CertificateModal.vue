<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '../../stores/useUserStore';
import {
  Award,
  X,
  Printer
} from 'lucide-vue-next';

export type CertificateType = 'go' | 'math' | 'chinese' | 'english';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    rankTitle?: string;
    rankLevel?: number;
    initialType?: CertificateType;
  }>(),
  {
    rankTitle: '活棋智多星 5K',
    rankLevel: 5,
    initialType: 'go'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();
const currentCertType = ref<CertificateType>(props.initialType);

const certConfig = computed(() => {
  switch (currentCertType.value) {
    case 'math':
      return {
        id: 'math',
        title: '小学数学口算速算小状元荣誉证书',
        enTitle: 'YINUO ACADEMY · MATH SPEED MASTER',
        sealTitle: '一诺数理',
        sealSubtitle: '速算小能手',
        awardTitle: '🏅 口算天天练·百题特等奖',
        desc: '在【一诺启思数理思维馆】完成100以内进退位加减法与口算极限冲刺考验，思维敏捷，计算精准，特授予：',
        themeBorder: 'border-blue-500',
        goldBorder: 'border-blue-600',
        textGold: 'text-blue-900',
        gradient: 'from-[#F0F7FF] via-[#E8F3FF] to-[#DBEDFF]'
      };
    case 'chinese':
      return {
        id: 'chinese',
        title: '国学经典诗词博雅小名士荣誉证书',
        enTitle: 'YINUO ACADEMY · CHINESE POETRY SCHOLAR',
        sealTitle: '一诺博雅',
        sealSubtitle: '诗词小博士',
        awardTitle: '🏅 部编古诗词背诵·卓越博雅之星',
        desc: '在【一诺博雅国学语文馆】完成唐诗三百首与部编版经典诗词背诵点读，字正腔圆，博闻强记，特授予：',
        themeBorder: 'border-amber-500',
        goldBorder: 'border-amber-600',
        textGold: 'text-amber-900',
        gradient: 'from-[#FFFDF5] via-[#FFF9E6] to-[#FFF3CC]'
      };
    case 'english':
      return {
        id: 'english',
        title: '少儿英语自然拼读探索之星荣誉证书',
        enTitle: 'YINUO ACADEMY · PHONICS EXPLORER',
        sealTitle: '一诺灵犀',
        sealSubtitle: 'Phonics之星',
        awardTitle: '🏅 自然拼读·地道口语卓越勋章',
        desc: '在【一诺灵犀少儿英语馆】完成26字母Phonics自然拼读与核心高频词大挑战，发音标准，自信开口，特授予：',
        themeBorder: 'border-purple-500',
        goldBorder: 'border-purple-600',
        textGold: 'text-purple-900',
        gradient: 'from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]'
      };
    case 'go':
    default:
      return {
        id: 'go',
        title: '少儿围棋段级位荣誉证书',
        enTitle: 'YINUO GO ACADEMY · HONOR CERTIFICATE',
        sealTitle: '一诺弈学',
        sealSubtitle: '段位认证',
        awardTitle: `🏅 ${props.rankTitle} 称号`,
        desc: '在【一诺弈学少儿启蒙学院】完成系统修习与死活对战考验，棋理通达，手筋敏锐，特授予：',
        themeBorder: 'border-amber-400',
        goldBorder: 'border-[#C99700]',
        textGold: 'text-[#5C3800]',
        gradient: 'from-[#FFFDF7] via-[#FFF8E7] to-[#FFF3D6]'
      };
  }
});

const certificateNo = computed(() => {
  const prefix = currentCertType.value.toUpperCase();
  return `YN${prefix}-` + new Date().getFullYear() + '-' + Math.abs(userStore.currentProfile.createdAt % 100000).toString().padStart(6, '0');
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
      <div class="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 space-y-5 animate-pop-in print:border-none print:shadow-none print:m-0">
        
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition print:hidden cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Certificate Type Selector (Hidden in print) -->
        <div class="flex items-center justify-center gap-2 print:hidden overflow-x-auto no-scrollbar pt-2">
          <button
            v-for="tab in [
              { id: 'go', name: '♟️ 围棋段位证书' },
              { id: 'math', name: '🔢 口算状元证书' },
              { id: 'chinese', name: '🏮 诗词小名士证书' },
              { id: 'english', name: '🔤 英语拼读证书' }
            ]"
            :key="tab.id"
            @click="currentCertType = tab.id as any"
            :class="[
              'px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap',
              currentCertType === tab.id
                ? 'bg-amber-500 text-white shadow-sm scale-103'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- Printable Certificate Body -->
        <div
          :class="[
            'relative p-6 sm:p-10 rounded-2xl border-4 text-center space-y-5 shadow-inner overflow-hidden bg-gradient-to-br',
            certConfig.goldBorder,
            certConfig.gradient
          ]"
        >
          <!-- Corner Flourishes -->
          <div class="absolute top-2 left-2 text-xl select-none opacity-70">╔══</div>
          <div class="absolute top-2 right-2 text-xl select-none opacity-70">══╗</div>
          <div class="absolute bottom-2 left-2 text-xl select-none opacity-70">╚══</div>
          <div class="absolute bottom-2 right-2 text-xl select-none opacity-70">══╝</div>

          <!-- Top Seal Badge -->
          <div class="flex justify-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-lg border-2 border-white flex items-center justify-center">
              <Award class="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow" />
            </div>
          </div>

          <!-- Header Titles -->
          <div class="space-y-1">
            <div class="text-[11px] font-black tracking-widest uppercase opacity-75">
              {{ certConfig.enTitle }}
            </div>
            <h1 class="text-2xl sm:text-3xl font-cartoon font-bold tracking-wider" :class="certConfig.textGold">
              {{ certConfig.title }}
            </h1>
          </div>

          <!-- Student & Award Text -->
          <div class="py-3.5 px-4 sm:px-6 bg-white/80 rounded-2xl border border-amber-200/80 space-y-3 shadow-xs">
            <p class="text-sm sm:text-base font-bold text-gray-800 leading-relaxed">
              兹证明学员 <span class="text-xl sm:text-2xl font-black text-orange-600 underline decoration-amber-400 underline-offset-4 px-2">{{ userStore.nickname }}</span>（{{ userStore.avatar }}）
            </p>
            <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
              {{ certConfig.desc }}
            </p>
            <div class="inline-block py-2 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-lg sm:text-2xl font-cartoon font-bold shadow-md">
              {{ certConfig.awardTitle }}
            </div>
          </div>

          <!-- Footer Seals & Dates -->
          <div class="pt-4 border-t border-amber-300/80 flex items-center justify-between text-left text-xs font-bold text-gray-600">
            <div>
              <div>证书编号：<span class="font-mono text-gray-800 font-bold">{{ certificateNo }}</span></div>
              <div class="mt-0.5">发证日期：{{ issueDate }}</div>
            </div>

            <!-- Red Seal Stamp -->
            <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-rose-600 text-rose-600 flex flex-col items-center justify-center rotate-[-12deg] p-1 font-black shadow-xs bg-white/60">
              <div class="text-[9px] leading-tight">{{ certConfig.sealTitle }}</div>
              <div class="text-xs font-black my-0.5">⭐ 导师小诺 ⭐</div>
              <div class="text-[8px] leading-tight">{{ certConfig.sealSubtitle }}</div>
            </div>
          </div>

        </div>

        <!-- Action Buttons (Print & Close) -->
        <div class="flex flex-col sm:flex-row gap-3 pt-1 print:hidden">
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
            返回成长中心
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

