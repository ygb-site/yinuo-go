<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { TSUMEGO_PUZZLES, type TsumegoPuzzle } from '../data/tsumegoLibrary';
import { GoBoard } from '../engine/GoBoard';
import type { Point } from '../engine/types';
import { useTsumegoStore } from '../stores/tsumegoStore';
import { useUserStore } from '../stores/useUserStore';
import { sound } from '../utils/sound';
import GoBoardComponent from '../components/board/GoBoard.vue';
import MascotNuoNuo, { type MascotMood } from '../components/MascotNuoNuo.vue';
import {
  Puzzle,
  Lightbulb,
  RotateCcw,
  Star,
  Heart,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Target
} from 'lucide-vue-next';

const tsumegoStore = useTsumegoStore();
const userStore = useUserStore();
const route = useRoute();

const selectedCategory = ref<string>('all');
const selectedDifficulty = ref<string>('all');
const activePuzzleId = ref<string>(TSUMEGO_PUZZLES[0].id);
const mobileTab = ref<'list' | 'board'>('list');

const filteredPuzzles = computed(() => {
  return TSUMEGO_PUZZLES.filter(p => {
    const matchCat =
      selectedCategory.value === 'all'
        ? true
        : selectedCategory.value === 'favorite'
        ? tsumegoStore.isFavorite(p.id)
        : p.category === selectedCategory.value;
    const matchDiff = selectedDifficulty.value === 'all' || p.difficulty === selectedDifficulty.value;
    return matchCat && matchDiff;
  });
});

const currentPuzzleIndex = computed(() => {
  return filteredPuzzles.value.findIndex(p => p.id === activePuzzleId.value);
});

const currentPuzzle = computed<TsumegoPuzzle>(() => {
  const found = TSUMEGO_PUZZLES.find(p => p.id === activePuzzleId.value);
  return found || filteredPuzzles.value[0] || TSUMEGO_PUZZLES[0];
});

// Board State
const board = ref<GoBoard>(new GoBoard(5));
const lastMove = ref<Point | null>(null);
const highlightPoints = ref<Point[]>([]);
const mascotMood = ref<MascotMood>('happy');
const mascotMessage = ref<string>('');
const isSolved = ref(false);
const isBotThinking = ref(false);
const waitingForNextStep = ref(false);

const initPuzzle = () => {
  const p = currentPuzzle.value;
  board.value = new GoBoard(p.boardSize);
  lastMove.value = null;
  highlightPoints.value = [];
  isSolved.value = false;
  isBotThinking.value = false;
  waitingForNextStep.value = false;

  for (const st of p.initialStones) {
    board.value.setCell(st.r, st.c, st.color);
  }
  board.value.turn = p.playerColor;

  mascotMood.value = 'happy';
  mascotMessage.value = `【${p.title}】${p.prompt}`;
};

onMounted(() => {
  if (route.query.id) {
    const targetId = String(route.query.id);
    if (TSUMEGO_PUZZLES.some(p => p.id === targetId)) {
      activePuzzleId.value = targetId;
      mobileTab.value = 'board';
    }
  }
  if (route.query.cat) {
    selectedCategory.value = String(route.query.cat);
  }
  initPuzzle();
});

watch(() => route.query, (newQuery) => {
  if (newQuery.id) {
    const targetId = String(newQuery.id);
    if (TSUMEGO_PUZZLES.some(p => p.id === targetId)) {
      activePuzzleId.value = targetId;
      mobileTab.value = 'board';
    }
  }
  if (newQuery.cat) {
    selectedCategory.value = String(newQuery.cat);
  }
});

watch(activePuzzleId, () => {
  initPuzzle();
});

const selectPuzzle = (puzzle: TsumegoPuzzle) => {
  activePuzzleId.value = puzzle.id;
  sound.playButtonSound();
  mobileTab.value = 'board';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const prevPuzzle = () => {
  const idx = currentPuzzleIndex.value;
  if (idx > 0) {
    selectPuzzle(filteredPuzzles.value[idx - 1]);
  }
};

const nextPuzzle = () => {
  const idx = currentPuzzleIndex.value;
  if (idx >= 0 && idx < filteredPuzzles.value.length - 1) {
    selectPuzzle(filteredPuzzles.value[idx + 1]);
  }
};

const handlePlay = (point: Point) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }

  if (isSolved.value || isBotThinking.value) return;

  const p = currentPuzzle.value;
  const { r, c } = point;

  // Check branch response if applicable (Step 2)
  if (waitingForNextStep.value && p.botBranchMoves) {
    if (point.r === p.botBranchMoves.nextValidMove.r && point.c === p.botBranchMoves.nextValidMove.c) {
      const moveRes = board.value.playMove(r, c, p.playerColor);
      sound.playStoneSound();
      if (moveRes.capturedStones.length > 0) sound.playCaptureSound();
      lastMove.value = point;
      triggerPuzzleSolve(p.botBranchMoves.winComment);
      return;
    } else {
      sound.playErrorSound();
      mascotMood.value = 'comforting';
      mascotMessage.value = '差一点点，注意白棋的反扑方向！';
      return;
    }
  }

  // First move check
  const isCorrect = p.correctMoves.some(cm => cm.r === r && cm.c === c);

  if (isCorrect) {
    const moveRes = board.value.playMove(r, c, p.playerColor);
    sound.playStoneSound();
    if (moveRes.capturedStones.length > 0) sound.playCaptureSound();
    lastMove.value = point;
    highlightPoints.value = [];

    // Bot response branch?
    if (p.botBranchMoves) {
      isBotThinking.value = true;
      mascotMood.value = 'thinking';
      mascotMessage.value = '白棋正在思考如何反扑...';

      setTimeout(() => {
        if (p.botBranchMoves) {
          board.value.playMove(
            p.botBranchMoves.botMove.r,
            p.botBranchMoves.botMove.c,
            board.value.getOpponentColor(p.playerColor)
          );
          sound.playStoneSound();
          lastMove.value = p.botBranchMoves.botMove;
          mascotMood.value = 'excited';
          mascotMessage.value = p.botBranchMoves.botComment;
          waitingForNextStep.value = true;
        }
        isBotThinking.value = false;
      }, 500);
      return;
    }

    triggerPuzzleSolve();
  } else {
    sound.playErrorSound();
    userStore.recordMistake(p.id);
    mascotMood.value = 'comforting';
    mascotMessage.value = `这步棋没有击中要害哦！提示：${p.hint}`;
  }
};

const triggerPuzzleSolve = (customWinMsg?: string) => {
  isSolved.value = true;
  mascotMood.value = 'cheering';
  mascotMessage.value = customWinMsg || '🎉 恭喜！完美解答这道死活题！点击下方名师解析查看精要！';
  tsumegoStore.solvePuzzle(currentPuzzle.value.id);
  sound.playWinSound();
  sound.fireCelebrationConfetti();
};

const handleHint = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playHintSound();
  sound.fireMiniSparkles();
  mascotMood.value = 'excited';
  mascotMessage.value = `【小诺提示】${currentPuzzle.value.hint}`;
  highlightPoints.value = [...currentPuzzle.value.correctMoves];
};

const handleRestart = () => {
  sound.playButtonSound();
  initPuzzle();
};

const toggleFavorite = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  tsumegoStore.toggleFavorite(currentPuzzle.value.id);
  const isFav = tsumegoStore.isFavorite(currentPuzzle.value.id);
  if (isFav) {
    sound.playCoinSound();
    mascotMood.value = 'excited';
    mascotMessage.value = `已将【${currentPuzzle.value.title}】加入我的收藏！随时可在左侧【❤️ 我的收藏】中集中复习！`;
  } else {
    sound.playButtonSound();
    mascotMood.value = 'happy';
    mascotMessage.value = `已从我的收藏中移出【${currentPuzzle.value.title}】。`;
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-8 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div class="space-y-1 sm:space-y-1.5 text-center md:text-left z-10">
          <div class="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <div class="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-black">
              <Puzzle class="w-3.5 h-3.5" />
              <span>每日死活实战题库 (Daily Tsumego)</span>
            </div>
          </div>
          <h2 class="text-xl sm:text-2xl font-cartoon font-bold text-gray-900 tracking-wide">
            死活妙手与手筋大本营
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            下围棋就像做算术题，每日攻克几道死活题，棋力突飞猛进！
          </p>
        </div>

        <div class="flex items-center gap-3 z-10">
          <div class="bg-rose-50 border border-rose-200 px-4 py-2 sm:py-2.5 rounded-2xl text-center shadow-2xs">
            <div class="text-[10px] sm:text-[11px] font-bold text-rose-700">已攻克题数</div>
            <div class="text-xl sm:text-2xl font-black text-rose-900">
              {{ tsumegoStore.totalSolvedCount }} / {{ TSUMEGO_PUZZLES.length }}
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Tab Switcher (lg:hidden) -->
      <div class="lg:hidden flex items-center bg-amber-100/70 p-1 rounded-2xl border border-orange-200 shadow-inner">
        <button
          @click="mobileTab = 'list'"
          class="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          :class="mobileTab === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-orange-600'"
        >
          <List class="w-4 h-4" />
          <span>📋 题库列表 ({{ filteredPuzzles.length }})</span>
        </button>
        <button
          @click="mobileTab = 'board'"
          class="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer truncate px-2"
          :class="mobileTab === 'board' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
        >
          <Target class="w-4 h-4 flex-shrink-0" />
          <span class="truncate">🎯 棋盘实战 ({{ currentPuzzle.title }})</span>
        </button>
      </div>

      <!-- Main Layout: Left Puzzle Explorer / Right Interactive Board -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        <!-- Left Column: Filter & Puzzle List (4 cols) -->
        <div
          class="lg:col-span-4 space-y-4"
          :class="{ 'hidden lg:block': mobileTab === 'board' }"
        >
          <!-- Category Filters -->
          <div class="bg-white rounded-3xl p-4 border-2 border-orange-100 shadow-sm space-y-3">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide">
              题目分类 (Category)
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                @click="selectedCategory = 'all'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                全部
              </button>
              <button
                @click="selectedCategory = 'favorite'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                :class="selectedCategory === 'favorite' ? 'bg-rose-500 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'"
              >
                <span>❤️ 我的收藏</span>
                <span
                  v-if="tsumegoStore.favoritePuzzleIds.length > 0"
                  class="text-[10px] px-1.5 py-0.2 rounded-full font-black"
                  :class="selectedCategory === 'favorite' ? 'bg-white text-rose-600' : 'bg-rose-200 text-rose-900'"
                >
                  {{ tsumegoStore.favoritePuzzleIds.length }}
                </span>
              </button>
              <button
                @click="selectedCategory = 'capturing'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="selectedCategory === 'capturing' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                ⚔️ 吃子
              </button>
              <button
                @click="selectedCategory = 'living'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="selectedCategory === 'living' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                🏰 做活
              </button>
              <button
                @click="selectedCategory = 'killing'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="selectedCategory === 'killing' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                ⚡ 杀棋
              </button>
              <button
                @click="selectedCategory = 'semeai'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="selectedCategory === 'semeai' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                🎯 对杀
              </button>
              <button
                @click="selectedCategory = 'ko'"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer"
                :class="selectedCategory === 'ko' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                🔄 劫争
              </button>
            </div>
          </div>

          <!-- Puzzle Scrollable List -->
          <div class="bg-white rounded-3xl p-3 border-2 border-orange-100 shadow-sm max-h-[520px] overflow-y-auto space-y-2">
            <div
              v-for="p in filteredPuzzles"
              :key="p.id"
              @click="selectPuzzle(p)"
              class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group"
              :class="
                activePuzzleId === p.id
                  ? 'bg-orange-50 border-orange-400 shadow-sm ring-2 ring-orange-300/40'
                  : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'
              "
            >
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-black text-gray-800 group-hover:text-orange-600">{{ p.title }}</span>
                  <Heart
                    v-if="tsumegoStore.isFavorite(p.id)"
                    class="w-3.5 h-3.5 text-rose-500 fill-current flex-shrink-0"
                  />
                  <CheckCircle2
                    v-if="tsumegoStore.isSolved(p.id)"
                    class="w-4 h-4 text-emerald-500 flex-shrink-0"
                  />
                </div>
                <div class="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                  <span class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {{ p.categoryLabel }}
                  </span>
                  <span>{{ p.difficultyStars }} 星难度</span>
                </div>
              </div>

              <div class="flex items-center gap-1 text-amber-400">
                <Star
                  v-for="s in p.difficultyStars"
                  :key="s"
                  class="w-3 h-3 fill-current"
                />
              </div>
            </div>
            <!-- Empty State for Favorites -->
            <div v-if="filteredPuzzles.length === 0" class="py-12 px-4 text-center space-y-2">
              <div class="text-3xl">💖</div>
              <div class="text-xs font-black text-gray-700">暂无收藏的死活题</div>
              <p class="text-[11px] text-gray-400 font-medium leading-relaxed">
                在做题时点击棋盘下方的【❤️ 收藏】按钮，即可把重点题加入此专属题库！
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive Board & Tutor (8 cols) -->
        <div
          class="lg:col-span-8 space-y-4"
          :class="{ 'hidden lg:block': mobileTab === 'list' }"
        >
          <!-- Mobile In-Board Stepper Header (lg:hidden) -->
          <div class="lg:hidden flex items-center justify-between bg-white rounded-2xl p-3 border border-orange-200 shadow-2xs">
            <button
              @click="mobileTab = 'list'"
              class="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-black flex items-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>选题列表</span>
            </button>

            <div class="text-xs font-black text-gray-700">
              第 {{ currentPuzzleIndex + 1 }} / {{ filteredPuzzles.length }} 题
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="prevPuzzle"
                :disabled="currentPuzzleIndex <= 0"
                class="p-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="上一题"
              >
                <ChevronLeft class="w-4 h-4 text-gray-700" />
              </button>
              <button
                @click="nextPuzzle"
                :disabled="currentPuzzleIndex >= filteredPuzzles.length - 1"
                class="p-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="下一题"
              >
                <ChevronRight class="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          <!-- Mascot NuoNuo -->
          <MascotNuoNuo
            :message="mascotMessage"
            :mood="mascotMood"
            :speakerName="'导师 · 小诺'"
            :subtext="`当前题目：${currentPuzzle.title}`"
          />

          <!-- Board Card -->
          <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            
            <!-- Desktop Puzzle Nav Indicator -->
            <div class="hidden lg:flex items-center justify-between w-full pb-2 border-b border-gray-100 text-xs font-bold text-gray-500">
              <div class="flex items-center gap-2">
                <span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md font-black">
                  {{ currentPuzzle.categoryLabel }}
                </span>
                <span class="font-black text-gray-800 text-sm">{{ currentPuzzle.title }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span>第 {{ currentPuzzleIndex + 1 }} / {{ filteredPuzzles.length }} 题</span>
                <div class="flex items-center gap-1">
                  <button
                    @click="prevPuzzle"
                    :disabled="currentPuzzleIndex <= 0"
                    class="px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition cursor-pointer"
                  >
                    上一题
                  </button>
                  <button
                    @click="nextPuzzle"
                    :disabled="currentPuzzleIndex >= filteredPuzzles.length - 1"
                    class="px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition cursor-pointer"
                  >
                    下一题
                  </button>
                </div>
              </div>
            </div>

            <!-- GoBoard -->
            <GoBoardComponent
              :board="board"
              :playerColor="currentPuzzle.playerColor"
              :lastMove="lastMove"
              :highlightPoints="highlightPoints"
              :showLiberties="userStore.showLibertiesOverlay"
              :showAtari="userStore.showAtariAlerts"
              :manualMove="true"
              :sizePx="440"
              :disabled="isSolved || isBotThinking"
              @play="handlePlay"
            />

            <!-- Next Puzzle Quick Button after Solved -->
            <div v-if="isSolved && currentPuzzleIndex < filteredPuzzles.length - 1" class="w-full flex justify-center pt-1 animate-bounce-subtle">
              <button
                @click="nextPuzzle"
                class="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>太棒了！攻克下一题 🚀</span>
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>

            <!-- Control Action Buttons -->
            <div class="w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <button
                @click="toggleFavorite"
                class="px-3.5 py-2 rounded-2xl border transition flex items-center gap-1.5 text-xs font-black active:scale-95 cursor-pointer"
                :class="
                  tsumegoStore.isFavorite(currentPuzzle.id)
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                "
              >
                <Heart
                  class="w-4 h-4"
                  :class="{ 'fill-current text-rose-500': tsumegoStore.isFavorite(currentPuzzle.id) }"
                />
                <span>{{ tsumegoStore.isFavorite(currentPuzzle.id) ? '已收藏' : '收藏' }}</span>
              </button>

              <div class="flex items-center gap-2">
                <button
                  @click="handleHint"
                  class="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb class="w-4 h-4 fill-current" />
                  <span>锦囊提示</span>
                </button>

                <button
                  @click="handleRestart"
                  class="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw class="w-4 h-4" />
                  <span>重试本题</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Explanation Box -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-orange-200 space-y-2">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2 text-xs font-black text-orange-900">
                <BookOpen class="w-4 h-4 text-orange-600" />
                <span>名师精解 (Master Commentary)</span>
              </div>
              <span class="text-xs font-bold text-gray-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-orange-100">
                {{ currentPuzzle.bilingualKey.term }} · {{ currentPuzzle.bilingualKey.en }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
              {{ currentPuzzle.explanation }}
            </p>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>




