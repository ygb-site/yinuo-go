<script setup lang="ts">
import { ref } from 'vue';
import type { OrderingQuestionStep, OrderItem } from '../../types/curriculum';
import { playButtonSound, playWinSound, playErrorSound, playStoneSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import { Volume2, RotateCcw } from 'lucide-vue-next';

const props = defineProps<{
  step: OrderingQuestionStep;
  themeColor?: string;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
  (e: 'fail', message?: string): void;
}>();

const availableItems = ref<OrderItem[]>([...props.step.items]);
const selectedItems = ref<OrderItem[]>([]);
const isChecking = ref(false);

const handleSelectItem = (item: OrderItem) => {
  if (isChecking.value) return;
  playStoneSound();
  availableItems.value = availableItems.value.filter(i => i.id !== item.id);
  selectedItems.value.push(item);

  if (selectedItems.value.length === props.step.items.length) {
    checkOrder();
  }
};

const handleRemoveItem = (item: OrderItem) => {
  if (isChecking.value) return;
  playButtonSound();
  selectedItems.value = selectedItems.value.filter(i => i.id !== item.id);
  availableItems.value.push(item);
};

const resetAll = () => {
  playButtonSound();
  availableItems.value = [...props.step.items];
  selectedItems.value = [];
  isChecking.value = false;
};

const checkOrder = () => {
  isChecking.value = true;
  const currentIds = selectedItems.value.map(i => i.id);
  const isCorrect = props.step.correctOrder.every((id, idx) => id === currentIds[idx]);

  if (isCorrect) {
    playWinSound();
    setTimeout(() => {
      emit('pass');
    }, 700);
  } else {
    playErrorSound();
    setTimeout(() => {
      resetAll();
      emit('fail', props.step.hint);
    }, 1000);
  }
};

const playAudio = (text: string) => {
  playButtonSound();
  speakText(text);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-4 px-2">
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
      <p class="text-xs sm:text-sm text-slate-500 font-bold mt-2">
        💡 点击下方卡片，按正确的顺序填入上方序列中
      </p>
    </div>

    <!-- Output Sequence Line -->
    <div class="w-full bg-amber-50/80 rounded-3xl p-5 sm:p-6 border-3 border-dashed border-amber-300 min-h-[5.5rem] flex flex-wrap items-center justify-center gap-3 mb-6 shadow-inner">
      <template v-if="selectedItems.length > 0">
        <button
          v-for="(item, idx) in selectedItems"
          :key="item.id"
          @click="handleRemoveItem(item)"
          class="px-5 py-3 rounded-2xl bg-amber-400 border-2 border-amber-500 text-slate-900 font-black text-lg sm:text-xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span class="w-6 h-6 rounded-full bg-white/80 text-amber-800 text-xs flex items-center justify-center font-black">
            {{ idx + 1 }}
          </span>
          <span>{{ item.text }}</span>
        </button>
      </template>
      <span v-else class="text-slate-400 font-bold text-base sm:text-lg">
        按顺序点击下方选项填入这里...
      </span>
    </div>

    <!-- Reset action -->
    <div v-if="selectedItems.length > 0" class="mb-4 flex justify-end w-full">
      <button
        @click="resetAll"
        class="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        重新排序
      </button>
    </div>

    <!-- Candidate Pool -->
    <div class="w-full flex flex-wrap justify-center gap-3 sm:gap-4">
      <button
        v-for="item in availableItems"
        :key="item.id"
        @click="handleSelectItem(item)"
        class="px-5 py-3.5 rounded-2xl bg-white border-3 border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-800 font-black text-lg sm:text-xl shadow-md hover:scale-105 active:scale-95 transition-all"
      >
        {{ item.text }}
      </button>
    </div>
  </div>
</template>

