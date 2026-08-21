<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import {
  ENGLISH_VOCABULARY_REPOSITORY
} from '../../data/englishVocabularyData';
import type { VocabularyItem } from '../../types/curriculum';
import { SpeechService, type PronunciationEvaluationResult } from '../../services/speechService';
import { playButtonSound, playErrorSound, playVictorySound } from '../../lib/audio';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mic,
  MicOff,
  Sparkles,
  Search
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// Filters & State
const selectedGrade = ref<string>('all');
const selectedCategory = ref<string>('all');
const searchQuery = ref<string>('');

const currentIdx = ref(0);
const isFlipped = ref(false);

// Speech Recognition ASR State
const isListening = ref(false);
const recognizedTranscript = ref('');
const evaluationResult = ref<PronunciationEvaluationResult | null>(null);
let recognitionHandle: { stop: () => void } | null = null;

const gradeOptions = [
  { id: 'all', name: '全部年级' },
  { id: 'g1_t1', name: '一年级上册' },
  { id: 'g1_t2', name: '一年级下册' },
  { id: 'g2_t1', name: '二年级上册' },
  { id: 'g2_t2', name: '二年级下册' },
  { id: 'g3_t1', name: '三年级上册' }
];

const categories = computed(() => {
  const set = new Set<string>();
  ENGLISH_VOCABULARY_REPOSITORY.forEach(v => set.add(v.category));
  return Array.from(set);
});

const filteredCards = computed<VocabularyItem[]>(() => {
  let list = ENGLISH_VOCABULARY_REPOSITORY;

  if (selectedGrade.value !== 'all') {
    list = list.filter(v => v.grade === selectedGrade.value);
  }

  if (selectedCategory.value !== 'all') {
    list = list.filter(v => v.category === selectedCategory.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      v =>
        v.word.toLowerCase().includes(q) ||
        v.meaning.includes(q) ||
        v.exampleEn.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }

  return list.length > 0 ? list : ENGLISH_VOCABULARY_REPOSITORY;
});

const currentCard = computed<VocabularyItem>(() => {
  const list = filteredCards.value;
  if (currentIdx.value >= list.length) {
    currentIdx.value = 0;
  }
  return list[currentIdx.value] || ENGLISH_VOCABULARY_REPOSITORY[0];
});

const setCard = (idx: number) => {
  stopListening();
  currentIdx.value = idx;
  isFlipped.value = false;
  evaluationResult.value = null;
  recognizedTranscript.value = '';
  speakWord();
};

const nextCard = () => {
  playButtonSound();
  const list = filteredCards.value;
  setCard((currentIdx.value + 1) % list.length);
};

const prevCard = () => {
  playButtonSound();
  const list = filteredCards.value;
  setCard((currentIdx.value - 1 + list.length) % list.length);
};

const flipCard = () => {
  playButtonSound();
  isFlipped.value = !isFlipped.value;
};

const speakWord = () => {
  SpeechService.speak(currentCard.value.word, { lang: 'en-US', rate: 0.85 });
};

const speakExample = () => {
  playButtonSound();
  SpeechService.speak(currentCard.value.exampleEn, { lang: 'en-US', rate: 0.85 });
};

// 🎙️ ASR Speech Recognition & Real-time Scoring
const startListening = () => {
  if (isListening.value) {
    stopListening();
    return;
  }

  playButtonSound();
  isListening.value = true;
  recognizedTranscript.value = '';
  evaluationResult.value = null;

  recognitionHandle = SpeechService.startRecognition({
    lang: 'en-US',
    onResult: (text, isFinal) => {
      recognizedTranscript.value = text;
      if (isFinal) {
        handleSpeechResult(text);
      }
    },
    onError: (err) => {
      console.warn('[EnglishFlashcards] Speech Error:', err);
      isListening.value = false;
    },
    onEnd: () => {
      isListening.value = false;
      if (recognizedTranscript.value && !evaluationResult.value) {
        handleSpeechResult(recognizedTranscript.value);
      }
    }
  });
};

const stopListening = () => {
  if (recognitionHandle) {
    recognitionHandle.stop();
    recognitionHandle = null;
  }
  isListening.value = false;
};

const handleSpeechResult = (text: string) => {
  stopListening();
  const target = currentCard.value.word;
  const result = SpeechService.evaluatePronunciation(text, target);
  evaluationResult.value = result;

  if (result.isPassed) {
    playVictorySound();
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    userStore.addCoins(15, `口语发音达标【${target}】`);
    userStore.addExp(25);
    if (currentCard.value.knowledgePointId) {
      userStore.recordKnowledgePractice(currentCard.value.knowledgePointId, true);
    }
  } else {
    playErrorSound();
    if (currentCard.value.knowledgePointId) {
      userStore.recordKnowledgePractice(currentCard.value.knowledgePointId, false);
    }
  }
};

const markMastered = () => {
  playVictorySound();
  confetti({ particleCount: 70, spread: 50 });
  userStore.addCoins(20, `掌握单词【${currentCard.value.word}】`);
  userStore.addExp(30);
  if (currentCard.value.knowledgePointId) {
    userStore.recordKnowledgePractice(currentCard.value.knowledgePointId, true);
  }
};

const goBack = () => {
  SpeechService.stop();
  playButtonSound();
  router.push('/subject/english');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-purple-50/80 via-pink-50/40 to-amber-50/30 pb-20 select-none">
    <!-- Top Header -->
    <header class="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-5 px-4 shadow-lg sticky top-0 z-30">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <button
          @click="goBack"
          class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回英语馆</span>
        </button>

        <h1 class="text-lg sm:text-2xl font-cartoon font-bold flex items-center gap-2">
          <span>🔤</span>
          <span>小学英语单词闪卡 & 口语发音馆</span>
        </h1>

        <div class="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-black">
          <span>共 {{ filteredCards.length }} 词</span>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 mt-6">
      <!-- Search & Filters -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border-3 border-purple-100 shadow-md mb-6 flex flex-col gap-3">
        <div class="flex flex-col md:flex-row gap-3 items-center justify-between">
          <!-- Grade Selector -->
          <div class="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1">
            <button
              v-for="g in gradeOptions"
              :key="g.id"
              @click="selectedGrade = g.id; currentIdx = 0"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all',
                selectedGrade === g.id
                  ? 'bg-purple-600 text-white shadow-sm scale-105'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              ]"
            >
              {{ g.name }}
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full md:w-64">
            <Search class="w-4 h-4 text-purple-400 absolute left-3 top-3" />
            <input
              v-model="searchQuery"
              placeholder="搜索英文单词或释义..."
              class="w-full pl-9 pr-4 py-2 bg-purple-50/60 rounded-2xl border-2 border-purple-100 text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            @click="selectedCategory = 'all'; currentIdx = 0"
            :class="[
              'px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all',
              selectedCategory === 'all'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            全部主题
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat; currentIdx = 0"
            :class="[
              'px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all',
              selectedCategory === cat
                ? 'bg-pink-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Main Flashcard Container -->
      <div class="flex flex-col items-center">
        <!-- Card Counter -->
        <div class="text-xs font-black text-purple-600 bg-purple-100 px-4 py-1 rounded-full mb-3 shadow-inner">
          第 {{ currentIdx + 1 }} / {{ filteredCards.length }} 词 · {{ currentCard.category }}
        </div>

        <!-- 3D Flip Card -->
        <div
          @click="flipCard"
          class="w-full max-w-md h-80 sm:h-96 rounded-3xl bg-white border-4 border-purple-200 shadow-2xl p-6 sm:p-8 cursor-pointer relative transition-all duration-300 transform hover:scale-[1.02] flex flex-col items-center justify-between text-center group"
        >
          <!-- Top Badge: Part of Speech & Phonics Rule -->
          <div class="w-full flex items-center justify-between">
            <span class="px-3 py-1 bg-pink-100 text-pink-700 rounded-xl text-xs font-black border border-pink-200">
              {{ currentCard.partOfSpeech }}
            </span>
            <span v-if="currentCard.phonicsRule" class="px-3 py-1 bg-purple-100 text-purple-700 rounded-xl text-xs font-black border border-purple-200">
              {{ currentCard.phonicsRule }}
            </span>
          </div>

          <!-- Card Content (Front vs Back) -->
          <div v-if="!isFlipped" class="flex flex-col items-center my-auto">
            <div class="text-6xl sm:text-7xl mb-3 transform group-hover:scale-110 transition-transform">
              {{ currentCard.icon || '📖' }}
            </div>
            <h2 class="text-4xl sm:text-5xl font-black text-purple-900 tracking-wide font-serif">
              {{ currentCard.word }}
            </h2>
            <p class="text-lg font-bold text-purple-500 font-mono mt-1">
              {{ currentCard.phonetic }}
            </p>
            <span class="text-xs font-bold text-slate-400 mt-3 flex items-center gap-1">
              <span>👆 点击卡片翻面看中文与例句</span>
            </span>
          </div>

          <div v-else class="flex flex-col items-center my-auto animate-fadeIn">
            <span class="text-3xl font-black text-purple-900 mb-1">
              {{ currentCard.meaning }}
            </span>
            <span class="text-base font-bold text-purple-600 font-mono mb-4">
              {{ currentCard.word }} {{ currentCard.phonetic }}
            </span>

            <!-- Example Sentence -->
            <div class="w-full p-3 bg-purple-50 rounded-2xl border border-purple-100 text-left">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-purple-700 uppercase">例句 Example:</span>
                <button
                  @click.stop="speakExample"
                  class="p-1 text-purple-600 hover:text-purple-800"
                >
                  <Volume2 class="w-4 h-4" />
                </button>
              </div>
              <p class="text-sm font-bold text-slate-800 mt-1 font-serif">
                {{ currentCard.exampleEn }}
              </p>
              <p class="text-xs font-semibold text-slate-500 mt-0.5">
                {{ currentCard.exampleCn }}
              </p>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="w-full flex items-center justify-between pt-2 border-t border-purple-50">
            <button
              @click.stop="speakWord"
              class="p-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-2xl font-black text-xs flex items-center gap-1 active:scale-95 transition-all"
            >
              <Volume2 class="w-4 h-4" />
              <span>标准发音</span>
            </button>

            <button
              @click.stop="markMastered"
              class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-md"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>我已掌握 (+20币)</span>
            </button>
          </div>
        </div>

        <!-- 🎙️ ASR Interactive Voice Pronunciation Section -->
        <div class="w-full max-w-md bg-white rounded-3xl p-5 border-3 border-purple-100 shadow-lg mt-5 flex flex-col items-center">
          <div class="w-full flex items-center justify-between mb-3">
            <span class="text-sm font-black text-purple-900 flex items-center gap-1.5">
              <span>🎙️</span>
              <span>跟读评测 (AI ASR 语音识别)</span>
            </span>
            <span class="text-xs font-bold text-purple-500">点击麦克风读出该词</span>
          </div>

          <div class="flex items-center gap-4">
            <button
              @click="startListening"
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-90 shadow-lg',
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              ]"
              title="开始录音评测"
            >
              <Mic v-if="!isListening" class="w-8 h-8" />
              <MicOff v-else class="w-8 h-8" />
            </button>

            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-400">
                {{ isListening ? '正在聆听中... 请大声朗读' : '点击左侧麦克风大声读出' }}
              </span>
              <span class="text-base font-black text-purple-900 mt-0.5">
                {{ recognizedTranscript ? `“${recognizedTranscript}”` : currentCard.word }}
              </span>
            </div>
          </div>

          <!-- Feedback Banner -->
          <div
            v-if="evaluationResult"
            :class="[
              'w-full mt-4 p-3 rounded-2xl text-center text-xs font-black flex items-center justify-center gap-2 animate-fadeIn',
              evaluationResult.isPassed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            ]"
          >
            <Sparkles v-if="evaluationResult.isPassed" class="w-4 h-4 text-emerald-600" />
            <span>{{ evaluationResult.feedback }} (匹配得分: {{ evaluationResult.score }}%)</span>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-center gap-6 mt-6">
          <button
            @click="prevCard"
            class="px-6 py-3 bg-white hover:bg-purple-50 text-purple-700 font-black rounded-2xl border-2 border-purple-200 shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <ChevronLeft class="w-5 h-5" />
            <span>上一个</span>
          </button>

          <button
            @click="nextCard"
            class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>下一个</span>
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>

