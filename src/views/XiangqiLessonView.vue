<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, ChevronRight, Lightbulb, RotateCcw } from 'lucide-vue-next';
import XiangqiBoard from '../components/board/XiangqiBoard.vue';
import SpeechBubble from '../components/common/SpeechBubble.vue';
import {
  applyXiangqiMove,
  boardFromPieces,
  generateLegalMovesFrom,
  type XiangqiBoard as XiangqiBoardState
} from '../engine/xiangqi/xiangqiEngine';
import { getXiangqiLesson, XIANGQI_LESSONS } from '../data/xiangqiCurriculum';
import { useXiangqiLearnStore } from '../stores/xiangqiLearnStore';
import { useUserStore } from '../stores/useUserStore';
import { checkersAudio } from '../engine/checkers/checkersAudio';
import { sound } from '../utils/sound';

const route = useRoute();
const router = useRouter();
const learnStore = useXiangqiLearnStore();
const userStore = useUserStore();

const lesson = computed(() => getXiangqiLesson(String(route.params.id)) || XIANGQI_LESSONS[0]);
const stepIndex = ref(0);
const currentStep = computed(() => lesson.value.steps[stepIndex.value] || lesson.value.steps[0]);

const board = ref<XiangqiBoardState>(boardFromPieces(currentStep.value.pieces));
const selected = ref<{ r: number; c: number } | null>(null);
const lastMove = ref<{ fromR: number; fromC: number; toR: number; toC: number } | null>(null);
const mascotText = ref('');
const mascotMood = ref<'happy' | 'excited' | 'thinking' | 'cheering' | 'comforting'>('happy');
const showHint = ref(false);
const stepDone = ref(false);
const lessonDone = ref(false);

const legalTargets = computed(() => {
  if (!selected.value || stepDone.value) return [];
  return generateLegalMovesFrom(board.value, selected.value.r, selected.value.c);
});

const acceptedClickTargets = computed(() => {
  const step = currentStep.value;
  return step.targets && step.targets.length > 0 ? step.targets : [step.target];
});

const loadStep = () => {
  const step = currentStep.value;
  board.value = boardFromPieces(step.pieces);
  selected.value = step.selectAt ? { ...step.selectAt } : null;
  lastMove.value = null;
  mascotText.value = step.dialogue;
  mascotMood.value = 'happy';
  showHint.value = false;
  stepDone.value = false;
};

watch(() => lesson.value.id, () => {
  stepIndex.value = 0;
  lessonDone.value = false;
  loadStep();
}, { immediate: true });

watch(stepIndex, () => {
  loadStep();
});

const samePoint = (a: { r: number; c: number }, b: { r: number; c: number }) => a.r === b.r && a.c === b.c;

const completeStep = () => {
  stepDone.value = true;
  mascotMood.value = 'cheering';
  mascotText.value = currentStep.value.explanation;
  checkersAudio.playVictory();
  sound.fireMiniSparkles();

  if (stepIndex.value >= lesson.value.steps.length - 1) {
    lessonDone.value = true;
    learnStore.completeLesson(lesson.value.id, 3);
  }
};

const onPointClick = (r: number, c: number) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (stepDone.value || lessonDone.value) return;

  const step = currentStep.value;
  if (step.action === 'click') {
    if (acceptedClickTargets.value.some((pt) => samePoint({ r, c }, pt))) {
      completeStep();
      return;
    }
    sound.playErrorSound();
    mascotMood.value = 'comforting';
    if (step.blockedTargets?.some((pt) => samePoint({ r, c }, pt))) {
      mascotText.value = '红圈是飞不过去的格子，这一步先不用点它。请点挡住象眼或马腿的那枚棋子。';
      return;
    }
    mascotText.value = `还没点对哦。${step.hint}`;
    return;
  }

  if (
    selected.value
    && step.blockedTargets?.some((pt) => samePoint({ r, c }, pt))
  ) {
    sound.playErrorSound();
    mascotMood.value = 'comforting';
    mascotText.value = step.blockedHint || `这边走不过去。${step.hint}`;
    return;
  }

  if (selected.value && samePoint({ r, c }, step.target)) {
    const applied = applyXiangqiMove(board.value, selected.value.r, selected.value.c, r, c);
    if (!applied) {
      sound.playErrorSound();
      mascotMood.value = 'comforting';
      mascotText.value = '这一步按规则走不了，再看一眼高亮的格子。';
      return;
    }
    board.value = applied.board;
    lastMove.value = { fromR: selected.value.r, fromC: selected.value.c, toR: r, toC: c };
    selected.value = null;
    checkersAudio.playStep();
    completeStep();
    return;
  }

  if (step.selectAt && samePoint({ r, c }, step.selectAt)) {
    selected.value = { r, c };
    checkersAudio.playSelect();
    return;
  }

  sound.playErrorSound();
  mascotMood.value = 'comforting';
  mascotText.value = `差一点点。${step.hint}`;
};

const nextStep = () => {
  if (stepIndex.value < lesson.value.steps.length - 1) {
    stepIndex.value += 1;
    sound.playButtonSound();
    return;
  }
  const idx = XIANGQI_LESSONS.findIndex((item) => item.id === lesson.value.id);
  const next = XIANGQI_LESSONS[idx + 1];
  if (next) {
    router.push('/xiangqi/lesson/' + next.id);
    return;
  }
  router.push('/xiangqi');
};

const goHub = () => {
  sound.playButtonSound();
  router.push('/xiangqi');
};

const nextButtonText = computed(() => {
  if (stepIndex.value < lesson.value.steps.length - 1) return '下一步';
  const idx = XIANGQI_LESSONS.findIndex((item) => item.id === lesson.value.id);
  return idx >= 0 && idx < XIANGQI_LESSONS.length - 1 ? '下一关' : '完成，返回学堂';
});
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-6 px-3 sm:px-6 select-none">
    <div class="max-w-6xl mx-auto space-y-4">
      <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm flex items-center justify-between gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 text-xs font-black border border-orange-200 cursor-pointer"
          @click="goHub"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          返回学堂
        </button>
        <div class="min-w-0 text-center">
          <h1 class="text-base sm:text-lg font-black text-slate-900 truncate">{{ lesson.title }}</h1>
          <p class="text-xs text-slate-500">第 {{ stepIndex + 1 }} / {{ lesson.steps.length }} 步 · {{ currentStep.title }}</p>
        </div>
        <div class="w-20" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section class="lg:col-span-5 space-y-3">
          <div class="bg-white rounded-3xl p-4 border-2 border-orange-100">
            <SpeechBubble :text="mascotText" :mood="mascotMood" />
          </div>
          <div class="bg-white rounded-3xl p-4 border-2 border-slate-200 space-y-3">
            <p class="text-sm font-black text-slate-900">目标：{{ currentStep.goalText }}</p>
            <p
              v-if="currentStep.action === 'click' && currentStep.blockedTargets?.length"
              class="text-[11px] text-slate-500 leading-relaxed"
            >
              先点蓝圈里的棋子或交叉点。红圈加 × 是过不去的路，点对后才会出现「下一步」。
            </p>
            <p
              v-else-if="currentStep.blockedTargets?.length"
              class="text-[11px] text-slate-500 leading-relaxed"
            >
              红圈加 × 是过不去的路；绿点是还能走的格子。
            </p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex-1 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer"
                @click="showHint = true; sound.playHintSound();"
              >
                <span class="inline-flex items-center justify-center gap-1">
                  <Lightbulb class="w-3.5 h-3.5" />
                  提示
                </span>
              </button>
              <button
                type="button"
                class="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                @click="loadStep(); sound.playButtonSound();"
              >
                <span class="inline-flex items-center justify-center gap-1">
                  <RotateCcw class="w-3.5 h-3.5" />
                  重来
                </span>
              </button>
            </div>
            <p v-if="showHint" class="text-xs text-amber-800 bg-amber-50 rounded-xl p-3">{{ currentStep.hint }}</p>
            <button
              v-if="stepDone"
              type="button"
              class="w-full py-2.5 rounded-2xl bg-rose-500 text-white font-black text-sm cursor-pointer"
              @click="nextStep"
            >
              <span class="inline-flex items-center justify-center gap-1">
                {{ nextButtonText }}
                <ChevronRight class="w-4 h-4" />
              </span>
            </button>
          </div>
        </section>

        <section class="lg:col-span-7 bg-white rounded-3xl p-3 sm:p-5 border-2 border-slate-200">
          <XiangqiBoard
            :board="board"
            :selected="selected"
            :last-move="lastMove"
            :legal-targets="legalTargets"
            :highlights="currentStep.highlights || [currentStep.target]"
            :blocked-highlights="currentStep.blockedTargets || []"
            :disabled="stepDone"
            @point-click="onPointClick"
          />
        </section>
      </div>
    </div>
  </div>
</template>
