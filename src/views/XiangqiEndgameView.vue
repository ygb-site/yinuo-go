<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Lightbulb, RotateCcw, Star } from 'lucide-vue-next';
import XiangqiBoard from '../components/board/XiangqiBoard.vue';
import SpeechBubble from '../components/common/SpeechBubble.vue';
import {
  applyXiangqiMove,
  boardFromPieces,
  findKing,
  generateLegalMovesFrom,
  getPositionStatus,
  oppositeSide,
  type XiangqiBoard as XiangqiBoardState
} from '../engine/xiangqi/xiangqiEngine';
import { XIANGQI_ENDGAMES, type XiangqiEndgame } from '../data/xiangqiCurriculum';
import { useXiangqiLearnStore } from '../stores/xiangqiLearnStore';
import { useUserStore } from '../stores/useUserStore';
import { checkersAudio } from '../engine/checkers/checkersAudio';
import { sound } from '../utils/sound';

const route = useRoute();
const router = useRouter();
const learnStore = useXiangqiLearnStore();
const userStore = useUserStore();

const activeId = ref(XIANGQI_ENDGAMES[0].id);
const puzzle = computed<XiangqiEndgame>(() => {
  return XIANGQI_ENDGAMES.find((item) => item.id === activeId.value) || XIANGQI_ENDGAMES[0];
});
const puzzleIndex = computed(() => XIANGQI_ENDGAMES.findIndex((item) => item.id === activeId.value));

const board = ref<XiangqiBoardState>(boardFromPieces(puzzle.value.pieces));
const selected = ref<{ r: number; c: number } | null>(null);
const lastMove = ref<{ fromR: number; fromC: number; toR: number; toC: number } | null>(null);
const hintOn = ref(false);
const solved = ref(false);
const mascotText = ref('');
const mascotMood = ref<'happy' | 'excited' | 'cheering' | 'comforting'>('happy');

const legalTargets = computed(() => {
  if (!selected.value || solved.value) return [];
  return generateLegalMovesFrom(board.value, selected.value.r, selected.value.c);
});

const checkedKing = computed(() => {
  const status = getPositionStatus(board.value, oppositeSide(puzzle.value.side));
  if (status !== 'check' && status !== 'checkmate') return null;
  return findKing(board.value, oppositeSide(puzzle.value.side));
});

const initPuzzle = () => {
  board.value = boardFromPieces(puzzle.value.pieces);
  selected.value = null;
  lastMove.value = null;
  hintOn.value = false;
  solved.value = false;
  mascotText.value = `【${puzzle.value.title}】${puzzle.value.prompt}`;
  mascotMood.value = 'happy';
};

watch(activeId, () => {
  initPuzzle();
}, { immediate: true });

watch(() => route.query.id, (id) => {
  if (id && XIANGQI_ENDGAMES.some((item) => item.id === String(id))) {
    activeId.value = String(id);
  }
}, { immediate: true });

const selectPuzzle = (item: XiangqiEndgame) => {
  activeId.value = item.id;
  sound.playButtonSound();
};

const triggerSolve = () => {
  solved.value = true;
  selected.value = null;
  mascotMood.value = 'cheering';
  mascotText.value = `🎉 ${puzzle.value.explanation}`;
  learnStore.completeEndgame(puzzle.value.id);
  checkersAudio.playVictory();
  sound.fireCelebrationConfetti();
};

const onPointClick = (r: number, c: number) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (solved.value) return;

  const cell = board.value[r][c];
  if (selected.value) {
    const dest = legalTargets.value.find((m) => m.toR === r && m.toC === c);
    if (dest) {
      const applied = applyXiangqiMove(board.value, dest.fromR, dest.fromC, dest.toR, dest.toC);
      if (!applied) return;
      board.value = applied.board;
      lastMove.value = { fromR: dest.fromR, fromC: dest.fromC, toR: dest.toR, toC: dest.toC };
      selected.value = null;
      checkersAudio.playStep();
      const status = getPositionStatus(board.value, oppositeSide(puzzle.value.side));
      if (status === 'checkmate') {
        triggerSolve();
        return;
      }
      sound.playErrorSound();
      userStore.recordMistake(puzzle.value.id);
      mascotMood.value = 'comforting';
      mascotText.value = `这步没有将死。${puzzle.value.hint}`;
      setTimeout(() => initPuzzle(), 700);
      return;
    }
    if (cell && cell.side === puzzle.value.side) {
      selected.value = { r, c };
      checkersAudio.playSelect();
      return;
    }
    selected.value = null;
    return;
  }

  if (!cell || cell.side !== puzzle.value.side) return;
  selected.value = { r, c };
  checkersAudio.playSelect();
};

const showHint = () => {
  hintOn.value = true;
  selected.value = { r: puzzle.value.solution.fromR, c: puzzle.value.solution.fromC };
  mascotText.value = `【小诺提示】${puzzle.value.hint}`;
  sound.playHintSound();
};

const prevPuzzle = () => {
  if (puzzleIndex.value > 0) selectPuzzle(XIANGQI_ENDGAMES[puzzleIndex.value - 1]);
};

const nextPuzzle = () => {
  if (puzzleIndex.value < XIANGQI_ENDGAMES.length - 1) selectPuzzle(XIANGQI_ENDGAMES[puzzleIndex.value + 1]);
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-6 px-3 sm:px-6 select-none">
    <div class="max-w-7xl mx-auto space-y-4">
      <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 text-xs font-black border border-orange-200 cursor-pointer mb-2"
            @click="router.push('/xiangqi'); sound.playButtonSound();"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            返回学堂
          </button>
          <h1 class="text-xl font-black text-slate-900">象棋残局训练营 <span class="text-sm font-bold text-slate-400">Xiangqi Endgames</span></h1>
          <p class="text-xs text-slate-500 mt-1">红先，一步将死。已攻克 {{ learnStore.solvedEndgameCount }} / {{ XIANGQI_ENDGAMES.length }} 道</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside class="lg:col-span-4 space-y-2">
          <button
            v-for="item in XIANGQI_ENDGAMES"
            :key="item.id"
            type="button"
            class="w-full text-left rounded-2xl p-3.5 border-2 transition cursor-pointer"
            :class="item.id === activeId ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200 hover:border-amber-300'"
            @click="selectPuzzle(item)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-black text-slate-900">{{ item.title }}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="learnStore.isEndgameSolved(item.id) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                {{ learnStore.isEndgameSolved(item.id) ? '已攻克' : item.categoryLabel }}
              </span>
            </div>
            <div class="mt-1 flex items-center gap-0.5">
              <Star
                v-for="n in item.difficultyStars"
                :key="n"
                class="w-3 h-3 text-amber-400 fill-current"
              />
            </div>
          </button>
        </aside>

        <section class="lg:col-span-8 space-y-3">
          <div class="bg-white rounded-3xl p-4 border-2 border-orange-100">
            <SpeechBubble :text="mascotText" :mood="mascotMood" />
          </div>
          <div class="bg-white rounded-3xl p-3 sm:p-5 border-2 border-slate-200">
            <XiangqiBoard
              :board="board"
              :selected="selected"
              :last-move="lastMove"
              :legal-targets="legalTargets"
              :hint-move="hintOn ? { toR: puzzle.solution.toR, toC: puzzle.solution.toC } : null"
              :checked-king="checkedKing"
              :disabled="solved"
              @point-click="onPointClick"
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer" :disabled="puzzleIndex === 0" @click="prevPuzzle">
              <ChevronLeft class="w-4 h-4 inline" /> 上一题
            </button>
            <button type="button" class="px-3 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer" @click="showHint">
              <Lightbulb class="w-3.5 h-3.5 inline" /> 提示
            </button>
            <button type="button" class="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer" @click="initPuzzle(); sound.playButtonSound();">
              <RotateCcw class="w-3.5 h-3.5 inline" /> 重来
            </button>
            <button type="button" class="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold cursor-pointer" :disabled="puzzleIndex >= XIANGQI_ENDGAMES.length - 1" @click="nextPuzzle">
              下一题 <ChevronRight class="w-4 h-4 inline" />
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
