<script setup lang="ts">
import { computed } from 'vue';
import type { LiveMoveEvaluation } from '../../services/goReviewService';
import { Sparkles, Award, AlertTriangle, ShieldCheck } from 'lucide-vue-next';

const props = defineProps<{
  evaluation: LiveMoveEvaluation | null;
}>();

const badgeStyle = computed(() => {
  if (!props.evaluation) return 'bg-slate-100 border-slate-200 text-slate-700';
  switch (props.evaluation.themeColor) {
    case 'purple':
      return 'bg-purple-50/95 border-purple-400 text-purple-950 shadow-xs ring-1 ring-purple-300/40';
    case 'emerald':
      return 'bg-emerald-50/95 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-300/40';
    case 'rose':
      return 'bg-rose-50/95 border-rose-400 text-rose-950 shadow-xs ring-1 ring-rose-300/40 animate-pulse';
    case 'amber':
      return 'bg-amber-50/95 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-300/40';
    case 'blue':
    default:
      return 'bg-sky-50/95 border-sky-300 text-sky-950 shadow-xs';
  }
});

const pillHeaderBg = computed(() => {
  if (!props.evaluation) return 'bg-slate-200 text-slate-800';
  switch (props.evaluation.themeColor) {
    case 'purple':
      return 'bg-purple-600 text-white';
    case 'emerald':
      return 'bg-emerald-600 text-white';
    case 'rose':
      return 'bg-rose-600 text-white';
    case 'amber':
      return 'bg-amber-500 text-white';
    case 'blue':
    default:
      return 'bg-sky-600 text-white';
  }
});
</script>

<template>
  <transition
    mode="out-in"
    enter-active-class="transition-all duration-180 ease-out"
    enter-from-class="opacity-0 -translate-y-1 scale-98"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-120 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-1 scale-98"
  >
    <div
      v-if="evaluation"
      :key="evaluation.stepIndex"
      class="w-full sm:max-w-md backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border-2 transition-colors select-none shadow-xs"
      :class="badgeStyle"
    >
      <!-- Top Row: Step Tag + Tactic Badge + Delta -->
      <div class="flex items-center justify-between gap-1.5 mb-1 flex-wrap">
        <div class="flex items-center gap-1.5 min-w-0">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-black shadow-2xs shrink-0 flex items-center gap-1"
            :class="pillHeaderBg"
          >
            <Sparkles v-if="evaluation.themeColor === 'purple'" class="w-3 h-3" />
            <Award v-else-if="evaluation.themeColor === 'emerald'" class="w-3 h-3" />
            <AlertTriangle v-else-if="evaluation.themeColor === 'rose'" class="w-3 h-3" />
            <ShieldCheck v-else class="w-3 h-3" />
            <span>{{ evaluation.termBadge }}</span>
          </span>

          <span class="text-[11px] font-black text-slate-800 truncate">
            第 {{ evaluation.stepIndex }} 手 · {{ evaluation.coordLabel }}
          </span>
        </div>

        <span
          v-if="evaluation.winRateDelta !== 0"
          :class="[
            'text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full shrink-0',
            evaluation.winRateDelta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          ]"
        >
          胜率 {{ evaluation.winRateDelta > 0 ? '+' : '' }}{{ evaluation.winRateDelta }}%
        </span>
      </div>

      <!-- Bottom Commentary -->
      <p class="text-[11px] font-bold leading-tight line-clamp-2" :class="evaluation.themeColor === 'rose' ? 'text-rose-900' : 'text-slate-700'">
        {{ evaluation.commentary }}
      </p>
    </div>
  </transition>
</template>
