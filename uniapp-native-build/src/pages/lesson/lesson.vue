<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Navbar from '../../components/Navbar.vue';
import GoBoard from '../../components/GoBoard.vue';
import StarModal from '../../components/common/StarModal.vue';
import { CHAPTERS_DATA, type Lesson } from '../../data/chapters';
import { GoGame } from '../../engine/GoGame';
import { useUserStore } from '../../stores/userStore';
import { sound } from '../../utils/sound';
import { BookOpen, Sparkles } from 'lucide-vue-next';

const userStore = useUserStore();
const lessonId = ref('lesson_1_1');

const currentLesson = computed(() => {
  for (const c of CHAPTERS_DATA) {
    const l = c.lessons.find(lvl => lvl.id === lessonId.value);
    if (l) return l;
  }
  return CHAPTERS_DATA[0].lessons[0];
});

const game = ref(new GoGame(5));
const isCompleted = ref(false);
const lastMove = ref<{ r: number; c: number } | null>(null);

const initBoard = () => {
  const l = currentLesson.value;
  const sz = (l.boardSize || 5) as any;
  game.value = new GoGame(sz);
  if (l.initialStones) {
    for (const s of l.initialStones) {
      game.value.setCell(s.r, s.c, s.color);
    }
  }
  game.value.turn = l.playerColor || 'B';
  isCompleted.value = false;
  lastMove.value = null;
};

onMounted(() => {
  // @ts-ignore
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1];
  if (cur && cur.options && cur.options.id) {
    lessonId.value = cur.options.id;
  }
  initBoard();
});

const handlePlay = (pt: { r: number; c: number }) => {
  if (isCompleted.value) return;
  const l = currentLesson.value;
  const ok = l.correctMoves && l.correctMoves.some(m => m.r === pt.r && m.c === pt.c);

  if (ok) {
    game.value.setCell(pt.r, pt.c, l.playerColor || 'B');
    lastMove.value = pt;
    isCompleted.value = true;
    sound.playWinSound();
    sound.fireCelebrationConfetti();
    userStore.updateLessonProgress(l.id, 3);
  } else {
    sound.playErrorSound();
    uni.showToast({ title: '差一点点，再试一次！', icon: 'none' });
  }
};

const handleNext = () => {
  const all: Lesson[] = [];
  for (const c of CHAPTERS_DATA) all.push(...c.lessons);
  const idx = all.findIndex(l => l.id === currentLesson.value.id);
  if (idx >= 0 && idx < all.length - 1) {
    lessonId.value = all[idx + 1].id;
    initBoard();
  } else {
    uni.navigateBack();
  }
};

const handleReplay = () => {
  initBoard();
};

const handleMap = () => {
  uni.navigateBack();
};
</script>

<template>
  <view class="min-h-screen bg-[#FDFBF7] flex flex-col font-sans select-none pb-24">
    <Navbar />

    <view class="flex-1 py-3 px-3 sm:px-6">
      <view class="max-w-4xl mx-auto space-y-4">
        
        <!-- Prompt Box -->
        <view class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm space-y-1">
          <view class="flex items-center gap-2">
            <text class="text-xs font-black bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
              {{ currentLesson.title }}
            </text>
          </view>
          <view class="text-base sm:text-lg font-black text-gray-900 leading-snug">
            {{ currentLesson.prompt }}
          </view>
        </view>

        <!-- GoBoard Area -->
        <view class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center">
          <GoBoard
            :game="game"
            :readonly="isCompleted"
            :lastMove="lastMove"
            @play="handlePlay"
          />
        </view>

      </view>
    </view>

    <!-- Star Victory Modal (100% Real Vue Component) -->
    <StarModal
      :isOpen="isCompleted"
      :lesson="currentLesson"
      :stars="3"
      :hasNextLesson="true"
      @next="handleNext"
      @replay="handleReplay"
      @map="handleMap"
      @close="isCompleted = false"
    />
  </view>
</template>

