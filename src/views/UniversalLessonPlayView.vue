<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getLessonById, getAllLessonsBySubject } from '../data/academicCurriculum';
import type { UniversalLesson, UniversalQuestionStep, SubjectId } from '../types/curriculum';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound, playVictorySound } from '../lib/audio';
import { speakText, stopSpeech } from '../utils/speech';
import UniversalQuestionRenderer from '../components/questions/UniversalQuestionRenderer.vue';
import SpeechBubble from '../components/common/SpeechBubble.vue';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Star,
  ChevronRight
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const lessonId = computed(() => (route.params.lessonId as string) || (route.params.id as string));
const currentLesson = computed<UniversalLesson | null>(() => {
  return getLessonById(lessonId.value);
});

const subjectId = computed<SubjectId>(() => {
  return (route.params.subjectId as SubjectId) || currentLesson.value?.subjectId || 'math';
});

const currentStepIndex = ref(0);
const earnedStars = ref(3);
const showStarModal = ref(false);
const attemptCount = ref(0);

const mascotText = ref('');
const mascotMood = ref<'happy' | 'thinking' | 'excited' | 'cheering' | 'comforting'>('happy');

const totalSteps = computed(() => currentLesson.value?.steps.length || 1);
const currentStep = computed<UniversalQuestionStep | null>(() => {
  if (!currentLesson.value) return null;
  return currentLesson.value.steps[currentStepIndex.value] || null;
});

const isLastStep = computed(() => {
  return currentStepIndex.value >= totalSteps.value - 1;
});

const updateMascotForStep = () => {
  if (!currentStep.value) return;
  mascotMood.value = 'happy';
  if (currentStep.value.dialogues && currentStep.value.dialogues.length > 0) {
    mascotText.value = currentStep.value.dialogues[0];
  } else {
    mascotText.value = currentStep.value.promptVoice || currentStep.value.promptText;
  }
};

watch(() => currentStepIndex.value, () => {
  updateMascotForStep();
});

watch(() => lessonId.value, () => {
  currentStepIndex.value = 0;
  earnedStars.value = 3;
  showStarModal.value = false;
  attemptCount.value = 0;
  updateMascotForStep();
}, { immediate: true });

onMounted(() => {
  updateMascotForStep();
});

onUnmounted(() => {
  stopSpeech();
});

const handleStepPass = () => {
  mascotMood.value = 'excited';
  mascotText.value = '太棒啦！回答完全正确！🎉';
  speakText('太棒啦！回答完全正确！');

  const kpId = currentStep.value?.knowledgePointId || currentLesson.value?.knowledgePointId;
  if (kpId) {
    userStore.recordKnowledgePractice(kpId, true);
  }

  if (isLastStep.value) {
    completeLesson();
  } else {
    setTimeout(() => {
      currentStepIndex.value++;
    }, 700);
  }
};

const handleStepFail = (msg?: string) => {
  attemptCount.value++;
  if (attemptCount.value >= 2) {
    earnedStars.value = Math.max(1, 3 - Math.floor(attemptCount.value / 2));
  }
  mascotMood.value = 'comforting';
  mascotText.value = msg || currentStep.value?.hint || '别灰心，再仔细观察一下哦！';

  const kpId = currentStep.value?.knowledgePointId || currentLesson.value?.knowledgePointId;
  if (kpId) {
    userStore.recordKnowledgePractice(kpId, false);
  }
};

const completeLesson = () => {
  if (!currentLesson.value) return;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  const rewards = currentLesson.value.rewards || { stars: 3, coins: 50, exp: 100 };
  userStore.addExp(rewards.exp);
  userStore.addCoins(rewards.coins, `通关 ${currentLesson.value.title}`);
  userStore.updateLessonProgress(currentLesson.value.id, earnedStars.value, rewards, currentLesson.value.knowledgePointId);

  playVictorySound();
  setTimeout(() => {
    showStarModal.value = true;
  }, 500);
};

const handleStarModalNext = () => {
  showStarModal.value = false;
  const allLessons = getAllLessonsBySubject(subjectId.value);
  const currentIdx = allLessons.findIndex((l: UniversalLesson) => l.id === lessonId.value);
  if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
    const nextL = allLessons[currentIdx + 1];
    router.push(`/subject/${subjectId.value}/lesson/${nextL.id}`);
  } else {
    if (subjectId.value === 'go') {
      router.push('/adventure');
    } else {
      router.push(`/subject/${subjectId.value}`);
    }
  }
};

const handleStarModalRetry = () => {
  showStarModal.value = false;
  currentStepIndex.value = 0;
  earnedStars.value = 3;
  attemptCount.value = 0;
  updateMascotForStep();
};

const goBack = () => {
  playButtonSound();
  if (subjectId.value === 'go') {
    router.push('/adventure');
  } else {
    router.push(`/subject/${subjectId.value}`);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 flex flex-col justify-between p-3 sm:p-6 select-none">
    <!-- Top Header Bar -->
    <header class="max-w-4xl w-full mx-auto flex items-center justify-between gap-4 bg-white/90 backdrop-blur rounded-3xl p-3 sm:p-4 border-2 border-slate-200 shadow-sm">
      <button
        @click="goBack"
        class="p-2.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl flex items-center gap-1.5 active:scale-95 transition-all text-sm"
      >
        <ArrowLeft class="w-5 h-5" />
        <span>{{ subjectId === 'chinese' ? '返回语文馆' : subjectId === 'math' ? '返回数理馆' : subjectId === 'english' ? '返回英语馆' : '返回围棋馆' }}</span>
      </button>

      <!-- Lesson Title & Step Progress -->
      <div class="flex flex-col items-center flex-1 max-w-md">
        <div class="flex items-center gap-2">
          <span class="text-lg font-cartoon font-bold text-slate-800 truncate tracking-wide">
            {{ currentLesson?.title || '精彩闯关' }}
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
            第 {{ currentStepIndex + 1 }}/{{ totalSteps }} 题
          </span>
        </div>

        <div class="flex items-center gap-1.5 mt-2 w-full max-w-xs">
          <div
            v-for="idx in totalSteps"
            :key="idx"
            :class="[
              'h-2 rounded-full flex-1 transition-all duration-300',
              idx - 1 < currentStepIndex
                ? 'bg-emerald-500'
                : idx - 1 === currentStepIndex
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-200'
            ]"
          ></div>
        </div>
      </div>

      <!-- Coin / Star Counter -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-sm">
          <Star class="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{{ earnedStars }}</span>
        </div>
      </div>
    </header>

    <!-- Main Question Interactive Zone -->
    <main class="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto my-4">
      <template v-if="currentStep">
        <UniversalQuestionRenderer
          :step="currentStep"
          :subject-id="subjectId"
          @pass="handleStepPass"
          @fail="handleStepFail"
        />
      </template>

      <div v-else class="text-center py-12 bg-white rounded-3xl p-8 border-2 border-slate-200">
        <p class="text-lg font-bold text-slate-600">未找到该关卡内容</p>
        <button
          @click="goBack"
          class="mt-4 px-6 py-2.5 bg-blue-500 text-white rounded-2xl font-black"
        >
          返回列表
        </button>
      </div>
    </main>

    <!-- Bottom Mascot Dialogue & Hint Bar -->
    <footer class="max-w-4xl w-full mx-auto">
      <SpeechBubble
        :text="mascotText"
        :mood="mascotMood"
        speaker="伴学诺诺"
      />
    </footer>

    <!-- Universal Star Completion Modal -->
    <div
      v-if="showStarModal && currentLesson"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl text-center">
        <div class="text-5xl mb-3 animate-bounce">🏆</div>
        <h2 class="text-2xl sm:text-3xl font-cartoon font-bold text-slate-900 tracking-wide">
          闯关大获全胜！
        </h2>
        <p class="text-sm font-bold text-slate-500 mt-1">
          恭喜通过【{{ currentLesson.title }}】
        </p>

        <!-- Stars display -->
        <div class="flex justify-center gap-2 my-6">
          <Star
            v-for="s in 3"
            :key="s"
            :class="[
              'w-10 h-10 transition-transform duration-300',
              s <= earnedStars ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-200'
            ]"
          />
        </div>

        <!-- Rewards pill -->
        <div class="flex justify-center gap-4 py-3 px-4 bg-amber-50 rounded-2xl border border-amber-200 mb-6 font-black text-sm text-amber-800">
          <span>🪙 +{{ currentLesson.rewards.coins }} 金币</span>
          <span>⚡ +{{ currentLesson.rewards.exp }} 经验</span>
        </div>

        <div class="flex gap-3">
          <button
            @click="handleStarModalRetry"
            class="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm flex-1 hover:bg-slate-200 active:scale-95 transition-all"
          >
            重玩本关
          </button>
          <button
            @click="handleStarModalNext"
            class="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm flex-1 shadow-lg hover:shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <span>下一关</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


