<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CHAPTERS_DATA, type Lesson, type PuzzleNode, type LessonSubPuzzle } from '../data/chapters';
import { GoGame } from '../engine/GoGame';
import type { Point } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import { playHintSound, playButtonSound, playErrorSound, playStoneSound, playCaptureSound } from '../lib/audio';
import { speakText, stopSpeech } from '../utils/speech';
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
  Volume2,
  VolumeX,
  CheckCircle2,
  Wind,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles
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

// Multi-step sub-puzzle state
const currentStepIndex = ref(0);
const subPuzzlesList = computed<LessonSubPuzzle[]>(() => {
  const les = currentLesson.value;
  if (les.subPuzzles && les.subPuzzles.length > 0) {
    return les.subPuzzles;
  }
  return [
    {
      stepIndex: 1,
      title: les.title,
      subtitle: les.subtitle,
      goalText: les.goalText,
      storyDialogues: les.storyDialogues,
      boardSize: les.boardSize,
      initialStones: les.initialStones,
      playerColor: les.playerColor,
      targetHighlight: les.targetHighlight,
      puzzleRoot: les.puzzleRoot,
      hint: les.hint,
      explanation: les.explanation
    }
  ];
});

const currentSubPuzzle = computed<LessonSubPuzzle>(() => {
  const list = subPuzzlesList.value;
  return list[currentStepIndex.value] || list[0];
});

const totalSteps = computed(() => subPuzzlesList.value.length);

// Active Branch Tree for Practice Mode
const currentBranches = ref<PuzzleNode[]>([]);
const storyDialogueIndex = ref(0);

// Visual Aids
const showLiberties = ref(true);
const showAtari = ref(true);
const showBreathingTubes = ref(true);
const speechEnabled = ref(true);

// Mobile Concept Modal / Drawer State
const showConceptDrawer = ref(false);
const isConceptExpanded = ref(false);

const narrateText = (text: string) => {
  if (!speechEnabled.value || !userStore.soundEnabled) return;
  speakText(text);
};

const speakConcept = () => {
  if (!speechEnabled.value || !userStore.soundEnabled) return;
  const term = currentLesson.value.bilingualTerm;
  const text = `${term.chinese}，${term.pinyin}。${term.concept}。${currentLesson.value.explanation}`;
  speakText(text);
};

const toggleVoice = () => {
  speechEnabled.value = !speechEnabled.value;
  if (!speechEnabled.value) {
    stopSpeech();
  } else {
    narrateText(mascotDialogue.value);
  }
  playButtonSound();
};

const loadCurrentStep = (stepIdx: number) => {
  currentStepIndex.value = stepIdx;
  const sub = subPuzzlesList.value[stepIdx] || subPuzzlesList.value[0];
  const bSize = sub.boardSize || currentLesson.value.boardSize || 5;

  game.value = new GoGame(bSize);
  lastMove.value = null;
  highlightPoints.value = sub.targetHighlight ? [...sub.targetHighlight] : [];
  isBotThinking.value = false;
  storyDialogueIndex.value = 0;

  for (const st of sub.initialStones) {
    game.value.setCell(st.r, st.c, st.color);
  }
  game.value.turn = sub.playerColor;

  if (sub.storyDialogues && sub.storyDialogues.length > 0) {
    mascotMood.value = 'happy';
    mascotDialogue.value = sub.storyDialogues[0];
  } else {
    currentBranches.value = sub.puzzleRoot || [];
    mascotMood.value = 'happy';
    mascotDialogue.value = '【' + sub.title + '】' + sub.goalText;
  }

  narrateText(mascotDialogue.value);
};

const initLesson = () => {
  stopSpeech();
  isLessonComplete.value = false;
  showStarModal.value = false;
  earnedStars.value = 3;
  attemptCount.value = 0;
  showConceptDrawer.value = false;
  loadCurrentStep(0);
};

onMounted(() => {
  initLesson();
});

onUnmounted(() => {
  stopSpeech();
});

watch(() => route.params.id, () => {
  initLesson();
});

const handleMove = (point: Point) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (isLessonComplete.value || isBotThinking.value) return;

  const sub = currentSubPuzzle.value;
  const { r, c } = point;

  // 1. Story / Direct target mode
  if (sub.targetHighlight && sub.targetHighlight.length > 0 && (!sub.puzzleRoot || sub.puzzleRoot.length === 0)) {
    const isTarget = sub.targetHighlight.some(p => p.r === r && p.c === c);
    if (!isTarget) {
      playErrorSound();
      mascotMood.value = 'comforting';
      mascotDialogue.value = '请点击闪烁的高亮目标点进行学习演练哦！';
      narrateText(mascotDialogue.value);
      return;
    }

    const moveRes = game.value.playMove(r, c, sub.playerColor);
    if (!moveRes.success) {
      playErrorSound();
      mascotMood.value = 'comforting';
      mascotDialogue.value = '这个位置已经有棋子啦，换个地方试试吧！';
      narrateText(mascotDialogue.value);
      return;
    }
    playStoneSound();
    if (moveRes.capturedStones.length > 0) playCaptureSound();
    lastMove.value = point;
    highlightPoints.value = [];

    const remainingTargets = (sub.targetHighlight || []).filter(p => game.value.getCell(p.r, p.c) === null);

    if (sub.storyDialogues && storyDialogueIndex.value < sub.storyDialogues.length - 1 && remainingTargets.length > 0) {
      storyDialogueIndex.value++;
      mascotMood.value = 'excited';
      mascotDialogue.value = sub.storyDialogues[storyDialogueIndex.value];
      narrateText(mascotDialogue.value);
    } else {
      advanceStepOrWin();
    }
    return;
  }

  // 2. Multi-Branch Puzzle Decision Node
  const branches = sub.puzzleRoot || [];
  const matchedNode = branches.find(b => b.coord.r === r && b.coord.c === c);

  if (matchedNode && matchedNode.isCorrect) {
    const moveRes = game.value.playMove(r, c, sub.playerColor);
    playStoneSound();
    if (moveRes.capturedStones.length > 0) playCaptureSound();
    lastMove.value = point;
    mascotMood.value = 'excited';
    mascotDialogue.value = matchedNode.comment;
    highlightPoints.value = [];
    narrateText(mascotDialogue.value);

    if (matchedNode.opponentResponse) {
      isBotThinking.value = true;
      mascotMood.value = 'thinking';

      setTimeout(() => {
        if (matchedNode.opponentResponse) {
          const oppPoint = matchedNode.opponentResponse.coord;
          game.value.playMove(oppPoint.r, oppPoint.c, game.value.turn);
          playStoneSound();
          lastMove.value = oppPoint;
          mascotMood.value = 'surprised';
          mascotDialogue.value = matchedNode.opponentResponse.comment;
          narrateText(mascotDialogue.value);
        }
        isBotThinking.value = false;

        if (matchedNode.nextBranches && matchedNode.nextBranches.length > 0) {
          currentBranches.value = matchedNode.nextBranches;
        } else {
          advanceStepOrWin();
        }
      }, 500);
    } else {
      if (matchedNode.nextBranches && matchedNode.nextBranches.length > 0) {
        currentBranches.value = matchedNode.nextBranches;
      } else {
        advanceStepOrWin();
      }
    }
  } else {
    playErrorSound();
    userStore.recordMistake(currentLesson.value.id);
    attemptCount.value++;
    if (attemptCount.value >= 2) {
      earnedStars.value = Math.max(1, earnedStars.value - 1);
    }
    mascotMood.value = 'comforting';
    mascotDialogue.value = '这步棋没有击中要害！提示：' + sub.hint;
    narrateText(mascotDialogue.value);
  }
};

const advanceStepOrWin = () => {
  if (currentStepIndex.value < totalSteps.value - 1) {
    playCaptureSound();
    mascotMood.value = 'cheering';
    mascotDialogue.value = '太棒啦！第 ' + (currentStepIndex.value + 1) + ' 题攻克成功！进入下一道变式实战！';
    narrateText(mascotDialogue.value);

    setTimeout(() => {
      loadCurrentStep(currentStepIndex.value + 1);
    }, 900);
  } else {
    triggerWin();
  }
};

const triggerWin = () => {
  isLessonComplete.value = true;
  mascotMood.value = 'cheering';
  mascotDialogue.value = '太棒啦！你完美通关了【' + currentLesson.value.title + '】全部 ' + totalSteps.value + ' 道试炼！';
  narrateText(mascotDialogue.value);

  setTimeout(() => {
    showStarModal.value = true;
  }, 500);
};

const handleHint = () => {
  playHintSound();
  const sub = currentSubPuzzle.value;
  mascotMood.value = 'excited';
  mascotDialogue.value = '【小诺锦囊】' + sub.hint;
  narrateText(mascotDialogue.value);

  if (sub.targetHighlight && sub.targetHighlight.length > 0) {
    highlightPoints.value = [...sub.targetHighlight];
  } else if (sub.puzzleRoot && sub.puzzleRoot.length > 0) {
    const correctBranch = sub.puzzleRoot.find(b => b.isCorrect);
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
    router.push('/lesson/' + nextLessonItem.value.id);
  }
};

const handleBackToMap = () => {
  playButtonSound();
  router.push('/learn');
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-2.5 sm:py-6 px-2.5 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-3 sm:space-y-5">

      <!-- Top Header Navigation & Multi-step Pills -->
      <div class="bg-white rounded-3xl p-3 sm:p-5 border-2 border-orange-100 shadow-sm space-y-2 sm:space-y-3">
        <div class="flex items-center justify-between gap-2">
          <button
            @click="handleBackToMap"
            class="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-black text-xs sm:text-sm transition active:scale-95 cursor-pointer flex-shrink-0"
          >
            <ArrowLeft class="w-4 h-4" />
            <span class="hidden sm:inline">关卡地图</span>
            <span class="sm:hidden">返回</span>
          </button>

          <div class="text-center min-w-0 flex-1 px-1">
            <div class="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-wide truncate">
              {{ currentLesson.chapterId ? '第 ' + currentLesson.chapterId + ' 章 · 阶梯式递进教学' : '启蒙实战教学' }}
            </div>
            <h1 class="text-sm sm:text-xl lg:text-2xl font-cartoon font-bold text-gray-900 tracking-wide truncate">
              {{ currentLesson.title }}
            </h1>
          </div>

          <!-- Right Action: Voice Speech Toggle & Star Rating -->
          <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <!-- Mobile Quick Concept Badge Button (📱 移动端顶部一键唤起名师点睛) -->
            <button
              @click="showConceptDrawer = true; playButtonSound()"
              class="lg:hidden flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2 py-1.5 rounded-xl text-[11px] font-black transition active:scale-90 shadow-2xs cursor-pointer"
              title="查看本关名师点睛与双语术语"
            >
              <BookOpen class="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span class="max-w-[70px] truncate">点睛卡</span>
            </button>

            <!-- Voice Speech Button -->
            <button
              @click="toggleVoice"
              class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-black transition active:scale-90 cursor-pointer shadow-2xs"
              :class="speechEnabled ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-gray-100 border-gray-200 text-gray-400'"
              :title="speechEnabled ? '点击关闭语音朗读' : '点击开启语音伴读'"
            >
              <Volume2 v-if="speechEnabled" class="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <VolumeX v-else class="w-3.5 h-3.5 text-gray-400" />
              <span class="hidden md:inline ml-1">{{ speechEnabled ? '伴读中' : '静音' }}</span>
            </button>

            <!-- Stars Rating -->
            <div class="flex items-center gap-0.5 sm:gap-1 bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-amber-200 shadow-2xs">
              <Star
                v-for="s in 3"
                :key="s"
                class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                :class="s <= earnedStars ? 'text-amber-400 fill-current' : 'text-gray-200'"
              />
            </div>
          </div>
        </div>

        <!-- 1讲 2~3 练 Sub-puzzle Step Indicator Bar -->
        <div v-if="totalSteps > 1" class="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 border-t border-gray-100 overflow-x-auto no-scrollbar">
          <div
            v-for="(sub, sIdx) in subPuzzlesList"
            :key="sub.stepIndex"
            @click="loadCurrentStep(sIdx)"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition cursor-pointer flex-shrink-0 whitespace-nowrap"
            :class="
              currentStepIndex === sIdx
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                : sIdx < currentStepIndex
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-100 text-gray-400'
            "
          >
            <CheckCircle2 v-if="sIdx < currentStepIndex" class="w-3.5 h-3.5 text-emerald-600" />
            <span v-else class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/30 flex items-center justify-center text-[9px] sm:text-[10px]">
              {{ sIdx + 1 }}
            </span>
            <span>{{ sub.title.split('：')[1] || sub.title }}</span>
          </div>
        </div>
      </div>

      <!-- Main Two-Column Clean Workspace Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-start">
        
        <!-- Center/Left Column: Large Responsive Board (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-3 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-2.5 sm:space-y-4">
          <GoBoard
            :game="game"
            :readonly="isLessonComplete || isBotThinking"
            :showLiberties="showLiberties"
            :showAtari="showAtari"
            :showBreathingTubes="showBreathingTubes"
            :theme="userStore.theme"
            :manualMove="true"
            :highlightPoints="highlightPoints"
            :lastMove="lastMove"
            :sizePx="480"
            @move="handleMove"
          />

          <!-- Assistant Toggles & Step counter -->
          <div class="w-full flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-gray-100 text-xs font-bold text-gray-600">
            <div class="flex flex-wrap items-center gap-1 sm:gap-2">
              <button
                @click="showBreathingTubes = !showBreathingTubes"
                class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer"
                :class="showBreathingTubes ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-black' : 'bg-gray-50 border-gray-200'"
                title="开启/关闭具象化呼吸管道特效"
              >
                <Wind class="w-3.5 h-3.5 text-emerald-600" />
                <span>呼吸管</span>
              </button>

              <button
                @click="showLiberties = !showLiberties"
                class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer"
                :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' : 'bg-gray-50 border-gray-200'"
              >
                <Eye class="w-3.5 h-3.5 text-amber-600" />
                <span>数气</span>
              </button>

              <button
                @click="showAtari = !showAtari"
                class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer"
                :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-900 font-black' : 'bg-gray-50 border-gray-200'"
              >
                <AlertTriangle class="w-3.5 h-3.5 text-rose-600" />
                <span>叫吃警报</span>
              </button>
            </div>

            <span class="text-[10px] sm:text-[11px] text-gray-400 font-bold">
              第 {{ currentStepIndex + 1 }} / {{ totalSteps }} 题 · {{ currentSubPuzzle.boardSize }}x{{ currentSubPuzzle.boardSize }} 盘
            </span>
          </div>
        </div>

        <!-- Right Column: Story Dialogue, Action Controls & Bilingual Concept (5 cols) -->
        <div class="lg:col-span-5 space-y-3 sm:space-y-4">
          
          <!-- Mascot NuoNuo Speech Bubble Guidance (Clickable to Replay Voice) -->
          <div @click="narrateText(mascotDialogue)" class="cursor-pointer group" title="点击小诺重新朗读语音">
            <SpeechBubble
              :text="mascotDialogue"
              :mood="mascotMood"
              :subtext="'目标：' + currentSubPuzzle.goalText"
            />
          </div>

          <!-- Action Control Buttons Card -->
          <div class="bg-white rounded-3xl p-3.5 sm:p-5 border-2 border-orange-100 shadow-sm space-y-2.5 sm:space-y-3">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between">
              <span>行动指南 (Actions)</span>
              <span class="text-orange-600 font-bold truncate max-w-[200px]">目标：{{ currentSubPuzzle.goalText }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                @click="handleHint"
                class="py-2.5 sm:py-3 px-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Lightbulb class="w-4 h-4 fill-current" />
                <span>锦囊提示</span>
              </button>

              <button
                @click="handleRestart"
                class="py-2.5 sm:py-3 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <RotateCcw class="w-4 h-4" />
                <span>重新开始</span>
              </button>
            </div>
          </div>

          <!-- 📱 移动端与桌面端通用的“名师点睛”卡片 (带折叠与抽屉展开) -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-3.5 sm:p-5 border-2 border-orange-200 space-y-2.5 shadow-2xs">
            <!-- Header Bar -->
            <div
              @click="isConceptExpanded = !isConceptExpanded"
              class="flex items-center justify-between cursor-pointer group"
              title="点击展开/收起名师点睛详解"
            >
              <div class="flex items-center gap-1.5 text-xs sm:text-sm font-black text-orange-900">
                <BookOpen class="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>名师点睛与双语术语</span>
                <span class="lg:hidden text-[10px] font-black text-orange-600 bg-orange-200/60 px-1.5 py-0.2 rounded-md">
                  {{ isConceptExpanded ? '收起' : '展开' }}
                </span>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-[10px] sm:text-xs font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-full border border-orange-100 flex-shrink-0">
                  {{ currentLesson.bilingualTerm.english }}
                </span>
                <button class="lg:hidden p-1 text-orange-600">
                  <ChevronUp v-if="isConceptExpanded" class="w-4 h-4" />
                  <ChevronDown v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Content Area: Always visible on desktop (lg:block), Collapsible on mobile -->
            <div :class="['space-y-2.5 transition-all', isConceptExpanded ? 'block' : 'hidden lg:block']">
              <div class="bg-white/95 rounded-2xl p-3 border border-orange-100 flex items-center justify-between">
                <div>
                  <div class="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                    <span>{{ currentLesson.bilingualTerm.chinese }}</span>
                    <span class="text-[10px] sm:text-xs text-orange-600 font-semibold">{{ currentLesson.bilingualTerm.pinyin }}</span>
                  </div>
                  <p class="text-[11px] sm:text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                    {{ currentLesson.bilingualTerm.concept }}
                  </p>
                </div>

                <button
                  @click.stop="speakConcept"
                  class="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition active:scale-90 cursor-pointer flex-shrink-0 ml-2"
                  title="朗读本关名师点睛"
                >
                  <Volume2 class="w-4 h-4" />
                </button>
              </div>

              <p class="text-[11px] sm:text-xs text-gray-700 font-medium leading-relaxed bg-white/60 p-2.5 rounded-xl border border-orange-100/60">
                {{ currentLesson.explanation }}
              </p>
            </div>

            <!-- Mobile Quick Teaser Line when collapsed on mobile -->
            <div
              v-if="!isConceptExpanded"
              @click="showConceptDrawer = true; playButtonSound()"
              class="lg:hidden bg-white/90 rounded-2xl p-2.5 border border-orange-200 flex items-center justify-between text-xs font-black text-orange-950 cursor-pointer hover:bg-orange-50 transition active:scale-98"
            >
              <div class="flex items-center gap-1.5 truncate">
                <Sparkles class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span class="text-xs font-bold text-gray-800 truncate">{{ currentLesson.bilingualTerm.chinese }}：{{ currentLesson.bilingualTerm.concept }}</span>
              </div>
              <span class="text-orange-600 text-[11px] font-black flex-shrink-0 ml-1">查看详解 →</span>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- 📱 Mobile BottomSheet Modal for Key Concept (移动端全屏名师点睛抽屉) -->
    <Teleport to="body">
      <div
        v-if="showConceptDrawer"
        class="fixed inset-0 z-[10000] overflow-y-auto bg-black/60 backdrop-blur-sm select-none animate-fade-in flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="showConceptDrawer = false"
      >
        <div
          class="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border-t-4 sm:border-4 border-amber-300 text-left space-y-4 animate-pop-in max-h-[85vh] overflow-y-auto"
        >
          <!-- Drawer Close Button -->
          <button
            @click="showConceptDrawer = false; playButtonSound()"
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Drawer Header -->
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl shadow-sm flex-shrink-0">
              📖
            </div>
            <div>
              <div class="text-[10px] font-black text-orange-600 uppercase tracking-wide">
                本关名师点睛与双语术语
              </div>
              <h2 class="text-lg sm:text-xl font-cartoon font-bold text-gray-900">
                {{ currentLesson.bilingualTerm.chinese }}
              </h2>
            </div>
          </div>

          <!-- Bilingual Term Box -->
          <div class="bg-amber-50/90 rounded-2xl p-4 border border-amber-200 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base font-black text-gray-900">{{ currentLesson.bilingualTerm.chinese }}</span>
                <span class="text-xs font-bold text-orange-600">{{ currentLesson.bilingualTerm.pinyin }}</span>
              </div>
              <span class="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-orange-100">
                {{ currentLesson.bilingualTerm.english }}
              </span>
            </div>

            <p class="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
              {{ currentLesson.bilingualTerm.concept }}
            </p>
          </div>

          <!-- Detailed Pedagogical Explanation -->
          <div class="space-y-1.5">
            <h4 class="text-xs font-black text-gray-500 uppercase tracking-wide">
              导师深度解析
            </h4>
            <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              {{ currentLesson.explanation }}
            </p>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex gap-2.5 pt-2">
            <button
              @click="speakConcept"
              class="flex-1 py-3 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border border-amber-300"
            >
              <Volume2 class="w-4 h-4 text-amber-700" />
              <span>朗读知识点</span>
            </button>

            <button
              @click="showConceptDrawer = false; playButtonSound()"
              class="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>我知道啦，继续下棋！</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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

