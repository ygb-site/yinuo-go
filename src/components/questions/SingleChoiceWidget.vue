<script setup lang="ts">
import { ref } from 'vue';
import type { ChoiceQuestionStep, ChoiceOption } from '../../types/curriculum';
import MathFormula from '../math/MathFormula.vue';
import { playButtonSound, playWinSound, playErrorSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import { Volume2, CheckCircle2, XCircle } from 'lucide-vue-next';

const props = defineProps<{
  step: ChoiceQuestionStep;
  themeColor?: string;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
  (e: 'fail', message?: string): void;
}>();

const selectedId = ref<string | null>(null);
const isAnswered = ref(false);
const isCorrect = ref(false);

const handleSelect = (option: ChoiceOption) => {
  if (isAnswered.value) return;
  selectedId.value = option.id;
  isAnswered.value = true;
  
  if (option.audioText) {
    speakText(option.audioText);
  }

  const correct = props.step.correctOptionIds.includes(option.id);
  isCorrect.value = correct;

  if (correct) {
    playWinSound();
    setTimeout(() => {
      emit('pass');
    }, 900);
  } else {
    playErrorSound();
    setTimeout(() => {
      isAnswered.value = false;
      selectedId.value = null;
      emit('fail', props.step.hint);
    }, 1200);
  }
};

const playAudio = (text: string) => {
  playButtonSound();
  speakText(text);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-4 px-2">
    <!-- Visual Content Prompt (if any) -->
    <div v-if="step.visualContent" class="mb-6 p-6 rounded-3xl bg-amber-50 border-4 border-amber-200 text-center shadow-md">
      <div v-if="step.visualContent.type === 'math_formula'" class="text-3xl font-black text-amber-900">
        <MathFormula :formula="step.visualContent.content" :display-mode="true" />
      </div>
      <div v-else class="text-4xl sm:text-5xl font-black text-amber-900 tracking-wider">
        {{ step.visualContent.content }}
      </div>
      <div v-if="step.visualContent.subContent" class="mt-2 text-base text-amber-700 font-bold">
        {{ step.visualContent.subContent }}
      </div>
    </div>

    <!-- Question Prompt Banner -->
    <div class="w-full bg-white/90 backdrop-blur rounded-3xl p-5 sm:p-6 border-3 border-amber-200 shadow-lg text-center mb-6">
      <div class="flex items-center justify-center gap-3">
        <span class="text-xl sm:text-2xl font-black text-slate-800 leading-relaxed">
          {{ step.promptText }}
        </span>
        <button
          v-if="step.promptVoice"
          @click="playAudio(step.promptVoice)"
          class="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full transition-transform active:scale-95 shadow-sm"
          title="播放语音"
        >
          <Volume2 class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Options Grid -->
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="option in step.options"
        :key="option.id"
        @click="handleSelect(option)"
        :disabled="isAnswered && selectedId !== option.id"
        :class="[
          'relative p-5 rounded-3xl font-black text-xl transition-all duration-300 transform active:scale-95 flex items-center justify-between shadow-md border-4',
          selectedId === option.id
            ? isCorrect
              ? 'bg-emerald-500 text-white border-emerald-300 scale-105 shadow-emerald-200'
              : 'bg-rose-500 text-white border-rose-300 scale-95 shadow-rose-200 animate-shake'
            : 'bg-white hover:bg-amber-50/80 text-slate-800 border-slate-200 hover:border-amber-400 hover:scale-102'
        ]"
      >
        <div class="flex flex-col text-left">
          <span v-if="option.latex" class="text-xl sm:text-2xl tracking-wide">
            <MathFormula :formula="option.latex" />
          </span>
          <span v-else class="text-xl sm:text-2xl tracking-wide">{{ option.text }}</span>
          <span v-if="option.subText" class="text-sm font-semibold opacity-80 mt-0.5">
            {{ option.subText }}
          </span>
        </div>

        <!-- Result Badge -->
        <div v-if="selectedId === option.id" class="ml-3">
          <CheckCircle2 v-if="isCorrect" class="w-7 h-7 text-white animate-bounce" />
          <XCircle v-else class="w-7 h-7 text-white" />
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>

