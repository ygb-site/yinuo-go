<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '../../stores/useUserStore';
import {
  Award,
  X,
  Printer
} from 'lucide-vue-next';

export type CertificateType = 'go' | 'checkers' | 'gomoku';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    rankTitle?: string;
    certType?: CertificateType;
  }>(),
  {
    isOpen: false,
    rankTitle: '少儿围棋初段 · 弈林小名士',
    certType: 'go'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();
const currentCertType = ref<CertificateType>(props.certType);

// Dynamic certificate themes based on game mode
const certConfig = computed(() => {
  switch (currentCertType.value) {

    case 'checkers':
      return {
        id: 'checkers',
        title: '快乐六角跳棋小棋圣荣誉证书',
        enTitle: 'YINUO ACADEMY · CHINESE CHECKERS CHAMPION',
        sealTitle: '一诺跳棋',
        sealSubtitle: '连跳冠军',
        awardTitle: '🏅 六角跳棋步法策略·卓越棋艺之星',
        desc: '在【一诺六角跳棋乐园】完成多局博弈对决与连环跳步法推演，运筹帷幄，身手矫捷，特授予：',
        themeBorder: 'border-amber-500',
        goldBorder: 'border-amber-600',
        textGold: 'text-amber-900',
        gradient: 'from-[#FFFDF5] via-[#FFF9E6] to-[#FFF3CC]'
      };
    case 'gomoku':
      return {
        id: 'gomoku',
        title: '欢乐五子棋连珠大师荣誉证书',
        enTitle: 'YINUO ACADEMY · GOMOKU GRANDMASTER',
        sealTitle: '一诺连珠',
        sealSubtitle: '五子大师',
        awardTitle: '🏅 五子连珠攻防策略·卓越棋道之星',
        desc: '在【一诺欢乐五子棋馆】掌握先手制胜、双三攻防与冲四布局，眼明手快，攻守兼备，特授予：',
        themeBorder: 'border-teal-500',
        goldBorder: 'border-teal-600',
        textGold: 'text-teal-900',
        gradient: 'from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]'
      };
    case 'go':
    default:
      return {
        id: 'go',
        title: '少儿围棋段级位官方模拟认证证书',
        enTitle: 'YINUO GO ACADEMY · OFFICIAL RANK CERTIFICATE',
        sealTitle: '一诺弈学',
        sealSubtitle: '官方定级',
        awardTitle: '🏅 围棋博弈通关·卓越棋士荣誉',
        desc: '在【一诺奕学少儿围棋学堂】完成死活题训练、主线关卡与人机对弈实战考核，棋艺精湛，特授予：',
        themeBorder: 'border-emerald-500',
        goldBorder: 'border-emerald-600',
        textGold: 'text-emerald-900',
        gradient: 'from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]'
      };
  }
});

const todayStr = computed(() => {
  const d = new Date();
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
});

const certCode = computed(() => {
  const idStr = (userStore.currentUserId || 'KID').slice(0, 4).toUpperCase();
  const time = Date.now().toString().slice(-6);
  return `YN-${currentCertType.value.toUpperCase()}-${idStr}-${time}`;
});

const printCert = () => {
  window.print();
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-300 flex flex-col max-h-[92vh]"
    >
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shrink-0">
        <div class="flex items-center gap-2">
          <Award class="w-6 h-6 text-amber-200 animate-bounce" />
          <h3 class="text-lg font-black tracking-wide">🏆 荣誉证书颁发殿堂</h3>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="printCert"
            class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>打印证书</span>
          </button>
          <button
            @click="emit('close')"
            class="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Cert Type Switcher Tabs -->
      <div class="p-3 bg-amber-50/70 border-b border-amber-200 shrink-0">
        <div class="flex items-center justify-center gap-2 print:hidden overflow-x-auto no-scrollbar pt-1">
          <button
            v-for="tab in [
              { id: 'go', name: '♟️ 围棋考级证书' },
              { id: 'checkers', name: '⭐ 六角跳棋证书' },
              { id: 'gomoku', name: '⚪ 五子连珠证书' }
            ]"
            :key="tab.id"
            @click="currentCertType = tab.id as any"
            :class="[
              'px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap',
              currentCertType === tab.id
                ? 'bg-amber-500 text-white shadow-sm scale-105'
                : 'bg-white text-slate-600 hover:bg-amber-100 border border-amber-200'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Printable Certificate Canvas Area -->
      <div class="p-6 sm:p-8 overflow-y-auto print:p-0 flex items-center justify-center">
        <div
          :class="[
            'w-full bg-gradient-to-b rounded-2xl p-6 sm:p-8 relative border-8 shadow-inner text-center select-none',
            certConfig.gradient,
            certConfig.goldBorder
          ]"
        >
          <!-- Certificate Header -->
          <div class="space-y-1">
            <div class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {{ certConfig.enTitle }}
            </div>
            <h2 class="text-xl sm:text-2xl font-cartoon font-black tracking-wider text-slate-900">
              {{ certConfig.title }}
            </h2>
          </div>

          <!-- Recipient Name -->
          <div class="mt-4 pb-2 border-b-2 border-dashed border-amber-300 inline-block px-8">
            <span class="text-2xl sm:text-3xl font-black text-slate-800 tracking-wide">
              {{ userStore.nickname }}
            </span>
            <span class="text-xs font-bold text-slate-500 ml-2">小棋手</span>
          </div>

          <!-- Certificate Body Description -->
          <p class="mt-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-bold max-w-lg mx-auto">
            {{ certConfig.desc }}
          </p>

          <!-- Awarded Rank / Honor Pill -->
          <div class="mt-4">
            <span class="inline-block px-5 py-2 rounded-2xl bg-amber-400 text-slate-900 font-cartoon font-black text-sm sm:text-base shadow-md border-2 border-white">
              {{ rankTitle || certConfig.awardTitle }}
            </span>
          </div>

          <!-- Certificate Footer & Stamp Seal -->
          <div class="mt-8 pt-4 flex items-end justify-between text-left text-xs font-bold text-slate-500 border-t border-amber-200/60">
            <div class="space-y-0.5">
              <div>证书编号：<span class="font-mono text-slate-700 font-black">{{ certCode }}</span></div>
              <div>发证机构：一诺未来学堂 · 棋艺与益智博弈认证委员会</div>
              <div>颁发日期：<span class="text-slate-700">{{ todayStr }}</span></div>
            </div>

            <!-- Official Seal Badge -->
            <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-red-500 text-red-500 flex flex-col items-center justify-center p-1 font-black transform -rotate-12 select-none shadow-sm opacity-90">
              <div class="text-[9px] border-b border-red-400 pb-0.5">{{ certConfig.sealTitle }}</div>
              <div class="text-xs font-black my-0.5">★ 官方认证 ★</div>
              <div class="text-[9px] border-t border-red-400 pt-0.5">{{ certConfig.sealSubtitle }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


