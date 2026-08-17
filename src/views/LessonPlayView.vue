<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CHAPTERS_DATA, type Lesson, type PuzzleNode } from '../data/chapters';
import { GoGame } from '../engine/GoGame';
import type { Point } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import { playHintSound, playButtonSound, playErrorSound } from '../lib/audio';
import GoBoard from '../components/board/GoBoard.vue';
import SpeechBubble from '../components/common/SpeechBubble.vue';
import StarModal from '../components/common/StarModal.vue';
import {
  Lightbulb,
  RotateCcw,
  Eye,
  AlertTriangle,
  ArrowLeft,
  Star,
  BookOpen,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// Flatten all lessons
const allLessons = computed<Lesson[]>(() => {
  const list: Lesson[] = [];
  for (const c of CHAPTERS_DATA) {
    list.push(...c.lessons);
  }
  return list;
});

const currentLesson = computed<Lesson>(() => {
  const id = route.params.id as string;
  const found = allLessons.value.find(l => l.id === id);
  return found || allLessons.value[0];
});

const currentIndex = computed(() => {
  return allLessons.value.findIndex(l => l.id === currentLesson.value.id);
});

const hasNextLesson = computed(() => {
  return currentIndex.value < allLessons.value.length - 1;
});

const nextLessonItem = computed(() => {
  if (hasNextLesson.value) {
    return allLessons.value[currentIndex.value + 1];
  }
  return null;
});

// Board & Play State
const game = ref<GoGame>(new GoGame(5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);
const mascotMood = ref<'happy' | 'excited' | 'thinking' | 'cheering' | 'comforting' | 'surprised'>('happy');
const mascotDialogue = ref<string>('');
const isLessonComplete = ref(false);
const showStarModal = ref(false);
const isBotThinking = ref(false);
const earnedStars = ref(3);
const attemptCount = ref(0);

// Active Branch Tree for Practice Mode
const currentBranches = ref<PuzzleNode[]>([]);
const storyDialogueIndex = ref(0);

const showLiberties = ref(true);
const showAtari = ref(true);

const initLesson = () => {
  const lesson = currentLesson.value;
  game.value = new GoGame(lesson.boardSize);
  lastMove.value = null;
  highlightPoints.value = [];
  isLessonComplete.value = false;
  showStarModal.value = false;
  isBotThinking.value = false;
  earnedStars.value = 3;
  attemptCount.value = 0;
  storyDialogueIndex.value = 0;

  for (const st of lesson.initialStones) {
    game.value.setCell(st.r, st.c, st.color);
  }
  game.value.turn = lesson.playerColor;

  if (lesson.type === 'story') {
    mascotMood.value = 'happy';
    mascotDialogue.value = lesson.storyDialogues && lesson.storyDialogues[0] ? lesson.storyDialogues[0] : lesson.description;
    highlightPoints.value = lesson.targetHighlight ? [...lesson.targetHighlight] : [];
  } else {
    currentBranches.value = lesson.puzzleRoot || [];
    mascotMood.value = 'happy';
    mascotDialogue.value = `【${lesson.title}】${lesson.description} 目标：${lesson.goalText}`;
  }
};

onMounted(() => {
  initLesson();
});

watch(() => route.params.id, () => {
  initLesson();
});

const handleMove = (point: Point) => {
  if (isLessonComplete.value || isBotThinking.value) return;

  const lesson = currentLesson.value;
  const { r, c } = point;

  // 1. Story Mode
  if (lesson.type === 'story') {
    const isTarget = lesson.targetHighlight?.some(p => p.r === r && p.c === c);
    if (!isTarget && lesson.targetHighlight && lesson.targetHighlight.length > 0) {
      playErrorSound();
      mascotMood.value = 'comforting';
      mascotDialogue.value = '请点击闪烁的高亮目标点进行学习演练哦！';
      return;
    }

    lastMove.value = point;
    highlightPoints.value = [];

    if (lesson.storyDialogues && storyDialogueIndex.value < lesson.storyDialogues.length - 1) {
      storyDialogueIndex.value++;
      mascotMood.value = 'excited';
      mascotDialogue.value = lesson.storyDialogues[storyDialogueIndex.value];
    } else {
      triggerWin();
    }
    return;
  }

  // 2. Practice Mode
  lastMove.value = point;
  const branches = currentBranches.value;
  const matchedNode = branches.find(b => b.coord.r === r && b.coord.c === c);

  if (matchedNode && matchedNode.isCorrect) {
    mascotMood.value = 'excited';
    mascotDialogue.value = matchedNode.comment;
    highlightPoints.value = [];

    if (matchedNode.opponentResponse) {
      isBotThinking.value = true;
      mascotMood.value = 'thinking';

      setTimeout(() => {
        if (matchedNode.opponentResponse) {
          const oppPoint = matchedNode.opponentResponse.coord;
          game.value.playMove(oppPoint.r, oppPoint.c, game.value.turn);
          lastMove.value = oppPoint;
          mascotMood.value = 'surprised';
          mascotDialogue.value = matchedNode.opponentResponse.comment;
        }
        isBotThinking.value = false;

        if (matchedNode.nextBranches && matchedNode.nextBranches.length > 0) {
          currentBranches.value = matchedNode.nextBranches;
        } else {
          triggerWin();
        }
      }, 500);
    } else {
      if (matchedNode.nextBranches && matchedNode.nextBranches.length > 0) {
        currentBranches.value = matchedNode.nextBranches;
      } else {
        triggerWin();
      }
    }
  } else {
    attemptCount.value++;
    if (attemptCount.value >= 2) {
      earnedStars.value = Math.max(1, earnedStars.value - 1);
    }
    mascotMood.value = 'comforting';
    mascotDialogue.value = `这步棋没有击中要害！提示：${lesson.hint}`;
  }
};

const triggerWin = () => {
  isLessonComplete.value = true;
  mascotMood.value = 'cheering';
  mascotDialogue.value = `太棒啦！你完美通关了【${currentLesson.value.title}】！`;

  setTimeout(() => {
    showStarModal.value = true;
  }, 400);
};

const handleHint = () => {
  playHintSound();
  const lesson = currentLesson.value;
  mascotMood.value = 'excited';
  mascotDialogue.value = `【小诺锦囊】${lesson.hint}`;

  if (lesson.type === 'story' && lesson.targetHighlight) {
    highlightPoints.value = [...lesson.targetHighlight];
  } else if (currentBranches.value.length > 0) {
    const correctBranch = currentBranches.value.find(b => b.isCorrect);
    if (correctBranch) {
      highlightPoints.value = [correctBranch.coord];
    }
  }
};

const handleRestart = () => {
  playButtonSound();
  initLesson();
};

const handleNextLesson = () => {
  if (nextLessonItem.value) {
    showStarModal.value = false;
    router.push(`/lesson/${nextLessonItem.value.id}`);
  }
};

const handleBackToMap = () => {
  playButtonSound();
  router.push('/learn');
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-6 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- Top Header Navigation -->
      <div class="flex items-center justify-between bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm">
        <button
          @click="handleBackToMap"
          class="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-extrabold text-xs sm:text-sm transition active:scale-95"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>关卡大地图</span>
        </button>

        <div class="text-center">
          <div class="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-wide">
            {{ currentLesson.type === 'story' ? '📖 互动讲解模式' : '🧩 死活实战模式' }}
          </div>
          <h1 class="text-base sm:text-xl font-black text-gray-900">
            {{ currentLesson.title }}
          </h1>
        </div>

        <!-- Star Rating Pill -->
        <div class="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200">
          <Star
            v-for="s in 3"
            :key="s"
            class="w-4 h-4"
            :class="s <= earnedStars ? 'text-amber-400 fill-current' : 'text-gray-200'"
          />
        </div>
      </div>

      <!-- Main Two-Column Clean Workspace Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Center/Left Column: Large Responsive Board (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
          <GoBoard
            :game="game"
            :readonly="isLessonComplete || isBotThinking"
            :showLiberties="showLiberties"
            :showAtari="showAtari"
            :theme="userStore.theme"
            :highlightPoints="highlightPoints"
            :lastMove="lastMove"
            :sizePx="520"
            @move="handleMove"
          />

          <!-- Assistant Toggles -->
          <div class="w-full flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-bold text-gray-600">
            <div class="flex items-center gap-2">
              <button
                @click="showLiberties = !showLiberties"
                class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95"
                :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' : 'bg-gray-50 border-gray-200'"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>显示气数</span>
              </button>

              <button
                @click="showAtari = !showAtari"
                class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95"
                :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-900 font-black' : 'bg-gray-50 border-gray-200'"
              >
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>叫吃预警</span>
              </button>
            </div>

            <span class="text-[11px] text-gray-400 font-bold">
              {{ currentLesson.boardSize }}x{{ currentLesson.boardSize }} 棋盘
            </span>
          </div>
        </div>

        <!-- Right Column: Story Dialogue & Action Controls (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          
          <!-- Mascot NuoNuo Speech Bubble Guidance -->
          <SpeechBubble
            :text="mascotDialogue"
            :mood="mascotMood"
            :subtext="`目标：${currentLesson.goalText}`"
          />

          <!-- Action Control Buttons Card -->
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-3">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide">
              本关行动指南 (Actions)
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <button
                @click="handleHint"
                class="py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Lightbulb class="w-4 h-4 fill-current" />
                <span>锦囊提示</span>
              </button>

              <button
                @click="handleRestart"
                class="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RotateCcw class="w-4 h-4" />
                <span>重新开始</span>
              </button>
            </div>
          </div>

          <!-- Bilingual Concept Commentary Card -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-orange-200 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs font-black text-orange-900">
                <BookOpen class="w-4 h-4 text-orange-600" />
                <span>名师点睛与双语术语</span>
              </div>
              <span class="text-xs font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-full border border-orange-100">
                {{ currentLesson.bilingualTerm.english }}
              </span>
            </div>

            <div class="bg-white/90 rounded-2xl p-3 border border-orange-100">
              <div class="font-black text-sm text-gray-900">
                {{ currentLesson.bilingualTerm.chinese }}
                <span class="text-xs text-orange-600 ml-1 font-semibold">{{ currentLesson.bilingualTerm.pinyin }}</span>
              </div>
              <p class="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                {{ currentLesson.bilingualTerm.concept }}
              </p>
            </div>

            <p class="text-xs text-gray-700 font-medium leading-relaxed">
              {{ currentLesson.explanation }}
            </p>
          </div>

        </div>

      </div>

    </div>

    <!-- Star Celebration Modal -->
    <StarModal
      :isOpen="showStarModal"
      :lesson="currentLesson"
      :stars="earnedStars"
      :hasNextLesson="hasNextLesson"
      @next="handleNextLesson"
      @replay="handleRestart"
      @map="handleBackToMap"
      @close="showStarModal = false"
    />
  </div>
</template>


