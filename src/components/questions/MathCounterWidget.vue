<script setup lang="ts">
import { ref } from 'vue';
import type { MathCounterQuestionStep } from '../../types/curriculum';
import { playButtonSound, playWinSound, playErrorSound, playStoneSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import { Volume2, CheckCircle2, RotateCcw } from 'lucide-vue-next';

const props = defineProps<{
  step: MathCounterQuestionStep;
  themeColor?: string;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
  (e: 'fail', message?: string): void;
}>();

const countedIndexes = ref<number[]>([]);
const isChecking = ref(false);

const toggleCount = (idx: number) => {
  if (isChecking.value) return;
  playStoneSound();
  if (countedIndexes.value.includes(idx)) {
    countedIndexes.value = countedIndexes.value.filter(i => i !== idx);
  } else {
    countedIndexes.value.push(idx);
    speakText(String(countedIndexes.value.length));
  }
};

const handleConfirm = () => {
  if (isChecking.value) return;
  isChecking.value = true;

  if (countedIndexes.value.length === props.step.targetCount) {
    playWinSound();
    setTimeout(() => {
      emit('pass');
    }, 700);
  } else {
    playErrorSound();
    setTimeout(() => {
      isChecking.value = false;
      emit('fail', `当前数了 ${countedIndexes.value.length} 个，再仔细数一数哦！`);
    }, 800);
  }
};

const resetCount = () => {
  playButtonSound();
  countedIndexes.value = [];
};

const playAudio = (text: string) => {
  playButtonSound();
  speakText(text);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-4 px-2">
    <!-- Prompt -->
    <div class="w-full bg-white/90 backdrop-blur rounded-3xl p-5 border-3 border-blue-200 shadow-md text-center mb-6">
      <div class="flex items-center justify-center gap-3">
        <span class="text-xl sm:text-2xl font-black text-slate-800">
          {{ step.promptText }}
        </span>
        <button
          v-if="step.promptVoice"
          @click="playAudio(step.promptVoice)"
          class="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-transform active:scale-95 shadow-sm"
        >
          <Volume2 class="w-5 h-5" />
        </button>
      </div>
      <p class="text-xs sm:text-sm text-slate-500 font-bold mt-2">
        💡 点击每一个 {{ step.itemIcon }} 物品进行点数，最后点击确认
      </p>
    </div>

    <!-- Items Grid Container -->
    <div class="w-full bg-blue-50/80 rounded-3xl p-6 border-4 border-blue-200 shadow-inner mb-6 flex flex-wrap items-center justify-center gap-4 min-h-[160px]">
      <button
        v-for="idx in step.targetCount"
        :key="idx"
        @click="toggleCount(idx)"
        :class="[
          'relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl text-4xl sm:text-5xl flex items-center justify-center transition-all transform active:scale-90 shadow-md border-3',
          countedIndexes.includes(idx)
            ? 'bg-blue-500 border-blue-600 scale-105 shadow-blue-200'
            : 'bg-white border-slate-200 hover:border-blue-300 hover:scale-102'
        ]"
      >
        <span>{{ step.itemIcon }}</span>

        <span
          v-if="countedIndexes.includes(idx)"
          class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-900 border-2 border-white text-xs font-black flex items-center justify-center shadow"
        >
          {{ countedIndexes.indexOf(idx) + 1 }}
        </span>
      </button>
    </div>

    <!-- Count Summary & Actions -->
    <div class="w-full flex items-center justify-between gap-4 max-w-sm">
      <button
        @click="resetCount"
        :disabled="countedIndexes.length === 0"
        class="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1.5"
      >
        <RotateCcw class="w-4 h-4" />
        重数
      </button>

      <button
        @click="handleConfirm"
        class="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-lg shadow-lg hover:shadow-blue-200 transform hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle2 class="w-5 h-5" />
        <span>确认（已数 {{ countedIndexes.length }} 个）</span>
      </button>
    </div>
  </div>
</template>

