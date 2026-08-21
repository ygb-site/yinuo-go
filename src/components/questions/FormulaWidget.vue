<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FormulaQuestionStep, ChoiceOption } from '../../types/curriculum';
import MathFormula from '../math/MathFormula.vue';
import { playButtonSound, playWinSound, playErrorSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, CheckCircle2, XCircle, HelpCircle } from 'lucide-vue-next';

const props = defineProps<{
  step: FormulaQuestionStep;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
  (e: 'fail', message?: string): void;
}>();

const selectedOptionId = ref<string | null>(null);
const userInputValue = ref<string>('');
const isAnswerChecked = ref<boolean>(false);
const isCorrectAnswer = ref<boolean>(false);
const feedbackMessage = ref<string>('');

const isChoiceMode = computed(() => {
  return Boolean(props.step.options && props.step.options.length > 0);
});

const handleOptionSelect = (option: ChoiceOption) => {
  if (isAnswerChecked.value) return;
  playButtonSound();
  selectedOptionId.value = option.id;

  const correctIds = props.step.correctOptionIds || (props.step.correctAnswer ? [props.step.correctAnswer] : []);
  const isRight = correctIds.includes(option.id) || (props.step.correctAnswer && option.text === props.step.correctAnswer);

  isAnswerChecked.value = true;
  isCorrectAnswer.value = Boolean(isRight);

  if (isRight) {
    playWinSound();
    feedbackMessage.value = '太棒了！公式推导完全正确！🎉';
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => {
      emit('pass');
    }, 1200);
  } else {
    playErrorSound();
    feedbackMessage.value = props.step.explanation || '公式计算不太对哦，仔细看一下提示再试一次！';
    emit('fail', feedbackMessage.value);
  }
};

const handleInputSubmit = () => {
  if (isAnswerChecked.value || !userInputValue.value.trim()) return;
  playButtonSound();

  const userVal = userInputValue.value.trim();
  const correctVal = (props.step.correctAnswer || '').trim();
  const isRight = userVal.toLowerCase() === correctVal.toLowerCase();

  isAnswerChecked.value = true;
  isCorrectAnswer.value = isRight;

  if (isRight) {
    playWinSound();
    feedbackMessage.value = '太聪明啦！算式计算完全正确！🌟';
    confetti({ particleCount: 70, spread: 60 });
    setTimeout(() => {
      emit('pass');
    }, 1200);
  } else {
    playErrorSound();
    feedbackMessage.value = props.step.explanation || `正确答案是 ${correctVal}，再动动小脑筋！`;
    emit('fail', feedbackMessage.value);
  }
};

const appendKey = (key: string) => {
  if (isAnswerChecked.value) return;
  playButtonSound();
  if (key === 'C') {
    userInputValue.value = '';
  } else if (key === 'DEL') {
    userInputValue.value = userInputValue.value.slice(0, -1);
  } else {
    if (userInputValue.value.length < 12) {
      userInputValue.value += key;
    }
  }
};

const resetQuestion = () => {
  selectedOptionId.value = null;
  userInputValue.value = '';
  isAnswerChecked.value = false;
  isCorrectAnswer.value = false;
  feedbackMessage.value = '';
};

const readPrompt = () => {
  playButtonSound();
  speakText(props.step.promptVoice || props.step.promptText);
};
</script>

<template>
  <div class="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-3 border-amber-200 flex flex-col items-center select-none animate-fadeIn">
    <!-- Header Prompt & Voice -->
    <div class="w-full flex items-start justify-between gap-4 mb-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black mb-2">
          <span>📐 数学公式与精算</span>
        </div>
        <h3 class="text-xl sm:text-2xl font-cartoon font-bold text-slate-800 leading-snug tracking-wide">
          {{ step.promptText }}
        </h3>
        <p v-if="step.subtitle" class="text-sm font-bold text-slate-400 mt-1">
          {{ step.subtitle }}
        </p>
      </div>

      <button
        @click="readPrompt"
        class="flex-shrink-0 p-3 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-700 rounded-2xl border-2 border-amber-200 shadow-sm transition-all"
        title="朗读题目"
      >
        <Volume2 class="w-6 h-6" />
      </button>
    </div>

    <!-- KaTeX Formula Display Area -->
    <div class="w-full my-4 p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/60 rounded-3xl border-2 border-amber-200 shadow-inner flex flex-col items-center justify-center">
      <span class="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Standard Mathematical Expression</span>
      <MathFormula :formula="step.latex" :display-mode="true" />
      <div v-if="step.subFormula" class="mt-2 text-slate-600 font-bold text-sm">
        <MathFormula :formula="step.subFormula" />
      </div>
    </div>

    <!-- Choice Options Mode -->
    <div v-if="isChoiceMode && step.options" class="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      <button
        v-for="opt in step.options"
        :key="opt.id"
        @click="handleOptionSelect(opt)"
        :disabled="isAnswerChecked"
        :class="[
          'p-4 rounded-2xl border-3 font-black text-lg transition-all transform flex items-center justify-between gap-3 shadow-md active:scale-95',
          selectedOptionId === opt.id
            ? isCorrectAnswer
              ? 'bg-green-500 border-green-600 text-white scale-[1.02]'
              : 'bg-red-500 border-red-600 text-white'
            : 'bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-400 text-slate-800'
        ]"
      >
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm flex items-center justify-center font-black group-hover:bg-amber-200">
            {{ opt.id.toUpperCase().replace('OPT_', '') }}
          </span>
          <span v-if="opt.latex">
            <MathFormula :formula="opt.latex" />
          </span>
          <span v-else>{{ opt.text }}</span>
        </div>

        <CheckCircle2 v-if="selectedOptionId === opt.id && isCorrectAnswer" class="w-6 h-6 text-white" />
        <XCircle v-else-if="selectedOptionId === opt.id && !isCorrectAnswer" class="w-6 h-6 text-white" />
      </button>
    </div>

    <!-- Input Keypad Mode -->
    <div v-else class="w-full flex flex-col items-center mt-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="min-w-[160px] h-14 bg-amber-50 border-3 border-amber-300 rounded-2xl flex items-center justify-center px-4 text-2xl font-black text-slate-800 tracking-wider shadow-inner">
          {{ userInputValue || '?' }}
        </div>
        <button
          @click="handleInputSubmit"
          :disabled="isAnswerChecked || !userInputValue"
          class="px-6 h-14 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-lg rounded-2xl shadow-md active:scale-95 transition-all"
        >
          确定提交
        </button>
      </div>

      <!-- Numeric Keypad for Kids -->
      <div class="grid grid-cols-4 gap-2 w-full max-w-sm">
        <button
          v-for="k in ['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', 'DEL', '0', '.', '/', 'C']"
          :key="k"
          @click="appendKey(k)"
          :disabled="isAnswerChecked"
          :class="[
            'h-12 rounded-xl font-black text-lg shadow-sm border-2 active:scale-95 transition-all flex items-center justify-center',
            ['+', '-', '/', 'DEL', 'C'].includes(k)
              ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-amber-50'
          ]"
        >
          {{ k }}
        </button>
      </div>
    </div>

    <!-- Feedback Banner -->
    <div
      v-if="isAnswerChecked"
      :class="[
        'w-full mt-6 p-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 animate-bounceSmall',
        isCorrectAnswer ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-red-100 text-red-800 border-2 border-red-300'
      ]"
    >
      <Sparkles v-if="isCorrectAnswer" class="w-5 h-5 text-green-600" />
      <HelpCircle v-else class="w-5 h-5 text-red-600" />
      <span>{{ feedbackMessage }}</span>
      <button
        v-if="!isCorrectAnswer"
        @click="resetQuestion"
        class="ml-3 px-3 py-1 bg-white text-red-600 rounded-xl border border-red-300 text-xs font-black hover:bg-red-50"
      >
        再试一次
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes bounceSmall {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounceSmall {
  animation: bounceSmall 0.4s ease-in-out;
}
</style>


