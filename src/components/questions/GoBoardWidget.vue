<script setup lang="ts">
import { ref, watch } from 'vue';
import type { GoBoardQuestionStep, PuzzleNode } from '../../types/curriculum';
import { GoGame } from '../../engine/GoGame';
import type { Point, StoneColor } from '../../engine/types';
import { playStoneSound, playCaptureSound, playErrorSound, playWinSound } from '../../lib/audio';
import { speakText } from '../../utils/speech';
import GoBoard from '../board/GoBoard.vue';
import { RotateCcw, Lightbulb } from 'lucide-vue-next';

const props = defineProps<{
  step: GoBoardQuestionStep;
  themeColor?: string;
}>();

const emit = defineEmits<{
  (e: 'pass'): void;
  (e: 'fail', message?: string, detail?: any): void;
}>();

const game = ref<GoGame>(new GoGame(props.step.boardSize || 9));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);
const currentBranches = ref<PuzzleNode[]>([]);
const isBotThinking = ref(false);
const isCompleted = ref(false);

const initStep = () => {
  isCompleted.value = false;
  isBotThinking.value = false;
  game.value = new GoGame(props.step.boardSize || 9);
  
  if (props.step.initialStones) {
    props.step.initialStones.forEach(s => {
      game.value.setCell(s.r, s.c, s.color);
    });
  }

  currentBranches.value = props.step.puzzleRoot ? [...props.step.puzzleRoot] : [];
  lastMove.value = null;
  highlightPoints.value = props.step.targetHighlight ? [...props.step.targetHighlight] : [];
};

watch(() => props.step, () => {
  initStep();
}, { immediate: true });

const handlePlayerMove = (r: number, c: number) => {
  if (isCompleted.value || isBotThinking.value) return;

  const playerColor: StoneColor = props.step.playerColor || 'B';
  const moveResult = game.value.playMove(r, c, playerColor);

  if (!moveResult.success) {
    playErrorSound();
    emit('fail', moveResult.errorReason || '这里不能落子哦！');
    return;
  }

  lastMove.value = { r, c };
  if (moveResult.capturedStones && moveResult.capturedStones.length > 0) {
    playCaptureSound();
  } else {
    playStoneSound();
  }

  // Branch evaluation
  const branches = currentBranches.value;
  if (!branches || branches.length === 0) {
    // If no branches defined, any valid move passes
    isCompleted.value = true;
    playWinSound();
    setTimeout(() => {
      emit('pass');
    }, 700);
    return;
  }

  const matched = branches.find(b => b.coord.r === r && b.coord.c === c);
  if (!matched) {
    // Invalid branch
    playErrorSound();
    emit('fail', props.step.hint || '这步棋不太对哦，再想想看！');
    setTimeout(() => {
      initStep();
    }, 900);
    return;
  }

  if (matched.isCorrect) {
    // Correct move!
    if (matched.opponentResponse) {
      // Bot needs to answer
      isBotThinking.value = true;
      const resp = matched.opponentResponse;
      currentBranches.value = matched.nextBranches || [];

      setTimeout(() => {
        const botColor: StoneColor = playerColor === 'B' ? 'W' : 'B';
        const botRes = game.value.playMove(resp.coord.r, resp.coord.c, botColor);
        lastMove.value = resp.coord;

        if (botRes.capturedStones && botRes.capturedStones.length > 0) {
          playCaptureSound();
        } else {
          playStoneSound();
        }
        isBotThinking.value = false;

        if (resp.comment) {
          speakText(resp.comment);
        }

        if (currentBranches.value.length === 0) {
          // Finished branch sequence
          isCompleted.value = true;
          playWinSound();
          setTimeout(() => {
            emit('pass');
          }, 800);
        }
      }, 600);
    } else {
      // Directly win
      isCompleted.value = true;
      playWinSound();
      setTimeout(() => {
        emit('pass');
      }, 700);
    }
  } else {
    // Wrong branch
    playErrorSound();
    if (matched.comment) {
      emit('fail', matched.comment);
    }
    setTimeout(() => {
      initStep();
    }, 1000);
  }
};

const handleReset = () => {
  initStep();
};

const handleShowHint = () => {
  if (props.step.hint) {
    speakText(props.step.hint);
    emit('fail', props.step.hint);
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
    <!-- Prompt -->
    <div class="w-full bg-white/90 backdrop-blur rounded-3xl p-4 sm:p-5 border-3 border-emerald-200 shadow-md text-center mb-4">
      <div class="text-lg sm:text-xl font-black text-slate-800">
        {{ step.promptText || step.goalText }}
      </div>
    </div>

    <!-- Board -->
    <div class="relative w-full flex justify-center mb-4">
      <GoBoard
        :game="game"
        :readonly="isCompleted || isBotThinking"
        :lastMove="lastMove"
        :highlightPoints="highlightPoints"
        :showLiberties="true"
        :showAtari="true"
        @move="(point) => handlePlayerMove(point.r, point.c)"
      />
    </div>

    <!-- Action Bar -->
    <div class="flex items-center gap-3">
      <button
        @click="handleReset"
        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm flex items-center gap-1.5 active:scale-95 transition-all"
      >
        <RotateCcw class="w-4 h-4" />
        重摆
      </button>

      <button
        @click="handleShowHint"
        class="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-2xl text-sm flex items-center gap-1.5 active:scale-95 transition-all"
      >
        <Lightbulb class="w-4 h-4 text-amber-600" />
        提示
      </button>
    </div>
  </div>
</template>

