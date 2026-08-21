<script setup lang="ts">
import { ref } from 'vue';
import type { HanziQuestionStep } from '../../types/curriculum';
import { playButtonSound, playWinSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import { Volume2, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps<{
  step: HanziQuestionStep;
  themeColor?: string;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
}>();

const isCompleted = ref(false);

const playCharVoice = () => {
  playButtonSound();
  speakText(`${props.step.char}，${props.step.pinyin}，${props.step.meaning}`);
};

const handleFinishLearning = () => {
  if (isCompleted.value) return;
  isCompleted.value = true;
  playWinSound();
  setTimeout(() => {
    emit('pass');
  }, 600);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-4 px-2">
    <!-- Big Hanzi Display Card with Tian Zi Ge grid styling -->
    <div class="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-amber-50 border-6 border-red-500 shadow-xl flex items-center justify-center mb-6 overflow-hidden">
      <div class="absolute inset-0 border-b-2 border-r-2 border-red-200 border-dashed pointer-events-none"></div>
      <div class="absolute inset-y-0 left-1/2 w-0.5 border-r-2 border-red-200 border-dashed pointer-events-none"></div>
      <div class="absolute inset-x-0 top-1/2 h-0.5 border-b-2 border-red-200 border-dashed pointer-events-none"></div>

      <div class="relative z-10 text-8xl sm:text-9xl font-black text-slate-900 select-none">
        {{ step.char }}
      </div>

      <div class="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-red-600 text-white rounded-full font-bold text-sm sm:text-base shadow-sm">
        {{ step.pinyin }}
      </div>

      <button
        @click="playCharVoice"
        class="absolute bottom-3 right-3 p-2.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full shadow-md transition-transform active:scale-95 z-20"
        title="朗读发音"
      >
        <Volume2 class="w-5 h-5" />
      </button>
    </div>

    <!-- Meaning & Radical info -->
    <div class="w-full bg-white/95 rounded-3xl p-5 border-3 border-amber-200 shadow-md text-center mb-6">
      <div class="text-xl sm:text-2xl font-black text-slate-800 mb-2">
        释义：{{ step.meaning }}
      </div>
      <div class="flex items-center justify-center gap-4 text-sm sm:text-base font-bold text-slate-600">
        <span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">部首：{{ step.radical }}</span>
        <span class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full">笔画数：{{ step.strokeCount }} 画</span>
      </div>

      <div v-if="step.strokes && step.strokes.length > 0" class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-2">
        <span class="text-xs font-bold text-slate-400 self-center">笔顺：</span>
        <span
          v-for="(st, i) in step.strokes"
          :key="i"
          class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
        >
          {{ i + 1 }}. {{ st }}
        </span>
      </div>

      <div v-if="step.words && step.words.length > 0" class="mt-3 flex flex-wrap justify-center gap-2">
        <span
          v-for="w in step.words"
          :key="w"
          class="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-800 rounded-full text-xs sm:text-sm font-bold"
        >
          {{ w }}
        </span>
      </div>
    </div>

    <!-- Complete learning action button -->
    <button
      @click="handleFinishLearning"
      class="w-full max-w-sm py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xl shadow-lg hover:shadow-orange-200 transform hover:scale-103 active:scale-95 transition-all flex items-center justify-center gap-2"
    >
      <CheckCircle2 class="w-6 h-6" />
      <span>我学会啦，下一题！</span>
    </button>
  </div>
</template>

