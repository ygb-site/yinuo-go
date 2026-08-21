<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FillBlankQuestionStep } from '../../types/curriculum';
import { playButtonSound, playWinSound, playErrorSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import { Volume2, Delete } from 'lucide-vue-next';

const props = defineProps<{
  step: FillBlankQuestionStep;
  themeColor?: string;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
  (e: 'fail', message?: string, detail?: any): void;
}>();

const filledAnswer = ref<string>('');
const isSubmitting = ref(false);

const parts = computed(() => {
  return props.step.template.split('[?]');
});

const defaultPool = computed(() => {
  if (props.step.optionsPool && props.step.optionsPool.length > 0) {
    return props.step.optionsPool;
  }
  if (props.step.keypadType === 'number') {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  }
  return ['A', 'B', 'C', 'D', 'E', 'F'];
});

const handleInput = (val: string) => {
  if (isSubmitting.value) return;
  playButtonSound();
  filledAnswer.value = val;
  checkAnswer();
};

const clearInput = () => {
  playButtonSound();
  filledAnswer.value = '';
};

const checkAnswer = () => {
  const isMatch = props.step.correctAnswers.some(
    ans => ans.trim().toLowerCase() === filledAnswer.value.trim().toLowerCase()
  );

  isSubmitting.value = true;

  if (isMatch) {
    playWinSound();
    setTimeout(() => {
      emit('pass');
    }, 700);
  } else {
    playErrorSound();
    setTimeout(() => {
      isSubmitting.value = false;
      filledAnswer.value = '';
      emit("fail", props.step.hint, {
        userAnswer: filledAnswer.value,
        correctAnswer: props.step.correctAnswers.join(" / "),
        errorCategory: "concept",
        errorReason: props.step.explanation || props.step.hint
      });
    }, 900);
  }
};

const playAudio = (text: string) => {
  playButtonSound();
  speakText(text);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-4 px-2">
    <!-- Prompt -->
    <div class="w-full bg-white/90 backdrop-blur rounded-3xl p-5 border-3 border-amber-200 shadow-md text-center mb-6">
      <div class="flex items-center justify-center gap-3">
        <span class="text-xl sm:text-2xl font-black text-slate-800">
          {{ step.promptText }}
        </span>
        <button
          v-if="step.promptVoice"
          @click="playAudio(step.promptVoice)"
          class="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full transition-transform active:scale-95 shadow-sm"
        >
          <Volume2 class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Template Display Card -->
    <div class="w-full bg-amber-50/90 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-lg text-center mb-8">
      <div class="flex items-center justify-center gap-3 text-3xl sm:text-5xl font-black text-slate-800">
        <span>{{ parts[0] }}</span>
        <span class="inline-flex items-center justify-center min-w-[3.5rem] h-14 sm:h-16 px-3 bg-white border-4 border-dashed border-amber-400 rounded-2xl text-amber-600 shadow-inner">
          {{ filledAnswer || '?' }}
        </span>
        <span v-if="parts[1]">{{ parts[1] }}</span>
      </div>
    </div>

    <!-- Keypad / Candidate Options -->
    <div class="w-full flex flex-wrap justify-center gap-3 sm:gap-4 max-w-md">
      <button
        v-for="item in defaultPool"
        :key="item"
        @click="handleInput(item)"
        :disabled="isSubmitting"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-3 border-slate-200 hover:border-amber-400 hover:bg-amber-100/60 font-black text-2xl sm:text-3xl text-slate-800 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        {{ item }}
      </button>

      <button
        @click="clearInput"
        :disabled="!filledAnswer || isSubmitting"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-50 border-3 border-rose-200 text-rose-600 font-bold shadow-md hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center"
        title="清除"
      >
        <Delete class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

