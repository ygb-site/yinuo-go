<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import HanziWriter from 'hanzi-writer';
import { playButtonSound, playWinSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import { Play, RotateCcw, Volume2, Sparkles } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    character: string;
    pinyin?: string;
    meaning?: string;
    size?: number;
  }>(),
  {
    size: 220
  }
);

const emit = defineEmits<{
  (e: 'complete'): void;
}>();

const writerContainerRef = ref<HTMLElement | null>(null);
let writer: any = null;
const isAnimating = ref(false);
const isQuizMode = ref(false);
const quizMessage = ref('');
const loadError = ref(false);

const initWriter = () => {
  if (!writerContainerRef.value || !props.character) return;
  writerContainerRef.value.innerHTML = "";
  loadError.value = false;

  try {
    writer = HanziWriter.create(writerContainerRef.value, props.character, {
      width: props.size,
      height: props.size,
      padding: 12,
      showOutline: true,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 220,
      strokeColor: "#b91c1c",     // Red classical calligraphy color
      outlineColor: "#fecaca",
      drawingColor: "#1e3a8a",
      showCharacter: true,
      charDataLoader: (char, onComplete, onErr) => {
        // High-performance CDN on-demand loader with in-memory caching
        const cdnUrl = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`;
        fetch(cdnUrl)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then(data => onComplete(data))
          .catch(err => {
            console.warn("[HanziWriter] Failed to load character data via CDN:", char, err);
            loadError.value = true;
            if (onErr) onErr(err);
          });
      }
    });
  } catch (err) {
    console.warn("HanziWriter error", err);
    loadError.value = true;
  }
};

onMounted(() => {
  initWriter();
});

watch(() => props.character, () => {
  initWriter();
});

const animateStrokes = () => {
  if (!writer || isAnimating.value) return;
  playButtonSound();
  isAnimating.value = true;
  isQuizMode.value = false;
  quizMessage.value = '正在逐笔演示标准笔顺...';

  writer.animateCharacter({
    onComplete: () => {
      isAnimating.value = false;
      quizMessage.value = '笔顺演示完毕！';
    }
  });
};

const startQuiz = () => {
  if (!writer) return;
  playButtonSound();
  isQuizMode.value = true;
  quizMessage.value = '请在田字格中按正确的笔画书写描红！';

  writer.quiz({
    onCorrectStroke: () => {
      playWinSound();
      quizMessage.value = '笔画正确！继续写下一笔！';
    },
    onMistake: () => {
      quizMessage.value = '笔顺不太对哦，再试试看！';
    },
    onComplete: (summary: any) => {
      playWinSound();
      quizMessage.value = `太棒啦！正确写完全字 (错 ${summary.totalMistakes} 处)！`;
      emit('complete');
    }
  });
};

const resetWriter = () => {
  playButtonSound();
  isQuizMode.value = false;
  quizMessage.value = '';
  initWriter();
};

const speakChar = () => {
  playButtonSound();
  speakText(`${props.character}，${props.pinyin || ''}，${props.meaning || ''}`);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center select-none">
    <!-- Tianzige Container -->
    <div
      class="relative rounded-3xl bg-[#FFFDF9] border-6 border-red-500 shadow-xl overflow-hidden flex items-center justify-center"
      :style="{ width: (size + 24) + 'px', height: (size + 24) + 'px' }"
    >
      <!-- Tianzige red grid background -->
      <div class="absolute inset-0 border-b-2 border-r-2 border-red-200 border-dashed pointer-events-none"></div>
      <div class="absolute inset-y-0 left-1/2 w-0.5 border-r-2 border-red-200 border-dashed pointer-events-none"></div>
      <div class="absolute inset-x-0 top-1/2 h-0.5 border-b-2 border-red-200 border-dashed pointer-events-none"></div>

      <!-- Hanzi Writer Mount Point -->
      <div ref="writerContainerRef" class="relative z-10 flex items-center justify-center"></div>

      <!-- Fallback static big char if load error -->
      <div v-if="loadError" class="relative z-10 text-8xl font-black text-slate-900">
        {{ character }}
      </div>

      <!-- Pinyin Tag -->
      <div v-if="pinyin" class="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-red-600 text-white rounded-full font-bold text-sm shadow-sm z-20">
        {{ pinyin }}
      </div>

      <!-- Sound button -->
      <button
        @click="speakChar"
        class="absolute bottom-2.5 right-2.5 p-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full shadow-md transition-transform active:scale-95 z-20 cursor-pointer"
        title="朗读发音"
      >
        <Volume2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Quiz Status Message -->
    <div v-if="quizMessage" class="mt-3 text-xs sm:text-sm font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-fade-in">
      {{ quizMessage }}
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-2.5 mt-4">
      <button
        @click="animateStrokes"
        :disabled="isAnimating"
        class="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
      >
        <Play class="w-4 h-4 fill-current" />
        <span>看笔顺动画</span>
      </button>

      <button
        @click="startQuiz"
        class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
      >
        <Sparkles class="w-4 h-4 text-amber-300" />
        <span>笔顺描红测验</span>
      </button>

      <button
        @click="resetWriter"
        class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl active:scale-95 transition-all cursor-pointer"
        title="重置"
      >
        <RotateCcw class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

