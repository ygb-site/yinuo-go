<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DragMatchQuestionStep } from '../../types/curriculum';
import { playButtonSound, playWinSound, playErrorSound, playStoneSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import { Volume2, Check } from 'lucide-vue-next';

const props = defineProps<{
  step: DragMatchQuestionStep;
  themeColor?: string;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
  (e: 'fail', message?: string): void;
}>();

interface CardItem {
  id: string;
  pairId: string;
  side: 'left' | 'right';
  text: string;
  sub?: string;
  icon?: string;
}

const leftCards = computed<CardItem[]>(() => {
  return props.step.pairs.map((p, idx) => ({
    id: `left_${idx}`,
    pairId: p.id,
    side: 'left',
    text: p.left.text,
    sub: p.left.sub,
    icon: p.left.icon
  }));
});

const rightCards = ref<CardItem[]>(
  [...props.step.pairs]
    .sort(() => 0.5 - Math.random())
    .map((p, idx) => ({
      id: `right_${idx}`,
      pairId: p.id,
      side: 'right',
      text: p.right.text,
      sub: p.right.sub,
      icon: p.right.icon
    }))
);

const selectedLeft = ref<CardItem | null>(null);
const selectedRight = ref<CardItem | null>(null);
const matchedPairIds = ref<string[]>([]);

const handleSelectLeft = (card: CardItem) => {
  if (matchedPairIds.value.includes(card.pairId)) return;
  playStoneSound();
  selectedLeft.value = card;
  checkMatch();
};

const handleSelectRight = (card: CardItem) => {
  if (matchedPairIds.value.includes(card.pairId)) return;
  playStoneSound();
  selectedRight.value = card;
  checkMatch();
};

const checkMatch = () => {
  if (!selectedLeft.value || !selectedRight.value) return;

  if (selectedLeft.value.pairId === selectedRight.value.pairId) {
    matchedPairIds.value.push(selectedLeft.value.pairId);
    playWinSound();
    selectedLeft.value = null;
    selectedRight.value = null;

    if (matchedPairIds.value.length === props.step.pairs.length) {
      setTimeout(() => {
        emit('pass');
      }, 700);
    }
  } else {
    playErrorSound();
    const l = selectedLeft.value;
    const r = selectedRight.value;
    setTimeout(() => {
      if (selectedLeft.value === l) selectedLeft.value = null;
      if (selectedRight.value === r) selectedRight.value = null;
      emit('fail', '两边不匹配哦，再仔细观察一下吧！');
    }, 600);
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
        💡 点击左边一张卡片，再点击右边对应的一张卡片进行配对
      </p>
    </div>

    <!-- Match Area (Left & Right columns) -->
    <div class="w-full grid grid-cols-2 gap-4 sm:gap-6">
      <!-- Left Column -->
      <div class="flex flex-col gap-3">
        <button
          v-for="card in leftCards"
          :key="card.id"
          @click="handleSelectLeft(card)"
          :disabled="matchedPairIds.includes(card.pairId)"
          :class="[
            'p-4 sm:p-5 rounded-2xl font-black text-base sm:text-lg border-3 transition-all transform flex items-center justify-between text-left shadow-sm',
            matchedPairIds.includes(card.pairId)
              ? 'bg-emerald-100/90 text-emerald-800 border-emerald-400 opacity-60'
              : selectedLeft?.id === card.id
                ? 'bg-amber-400 text-slate-900 border-amber-500 scale-103 shadow-md ring-4 ring-amber-200'
                : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
          ]"
        >
          <span>{{ card.text }}</span>
          <Check v-if="matchedPairIds.includes(card.pairId)" class="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
        </button>
      </div>

      <!-- Right Column -->
      <div class="flex flex-col gap-3">
        <button
          v-for="card in rightCards"
          :key="card.id"
          @click="handleSelectRight(card)"
          :disabled="matchedPairIds.includes(card.pairId)"
          :class="[
            'p-4 sm:p-5 rounded-2xl font-black text-base sm:text-lg border-3 transition-all transform flex items-center justify-between text-left shadow-sm',
            matchedPairIds.includes(card.pairId)
              ? 'bg-emerald-100/90 text-emerald-800 border-emerald-400 opacity-60'
              : selectedRight?.id === card.id
                ? 'bg-amber-400 text-slate-900 border-amber-500 scale-103 shadow-md ring-4 ring-amber-200'
                : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
          ]"
        >
          <span>{{ card.text }}</span>
          <Check v-if="matchedPairIds.includes(card.pairId)" class="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
        </button>
      </div>
    </div>
  </div>
</template>

