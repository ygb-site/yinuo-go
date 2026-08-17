<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { GoBoard } from '../engine/GoBoard';
import { SGFParser } from '../engine/sgfParser';
import type { Point, ScoreBreakdown } from '../engine/types';
import { useUserStore } from '../stores/userStore';
import { sound } from '../utils/sound';
import GoBoardComponent from '../components/GoBoard.vue';
import ScoreModal from '../components/ScoreModal.vue';
import {
  Grid,
  Download,
  Upload,
  RotateCcw,
  Play,
  Edit3,
  Eye,
  AlertTriangle,
  Flame,
  Copy
} from 'lucide-vue-next';

const userStore = useUserStore();

const boardSize = ref<number>(9);
const mode = ref<'play' | 'edit'>('play');
const editTool = ref<'B' | 'W' | 'empty'>('B');

const board = ref<GoBoard>(new GoBoard(9));
const lastMove = ref<Point | null>(null);
const showLiberties = ref(userStore.showLibertiesOverlay);
const showAtari = ref(userStore.showAtariAlerts);
const showTerritory = ref(false);

const sgfModalOpen = ref(false);
const sgfText = ref('');
const copyFeedback = ref(false);

const scoreResult = ref<ScoreBreakdown | null>(null);
const showScoreModal = ref(false);

const initBoard = (size = boardSize.value) => {
  boardSize.value = size;
  board.value = new GoBoard(size);
  lastMove.value = null;
  scoreResult.value = null;
  showScoreModal.value = false;
};

onMounted(() => {
  initBoard();
});

const handlePlay = (point: Point) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  lastMove.value = point;
};

const handlePass = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playButtonSound();
  const ends = board.value.pass();
  if (ends) {
    calculateScore();
  }
};

const handleUndo = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playButtonSound();
  if (board.value.undo()) {
    lastMove.value = board.value.history.length > 0 ? board.value.history[board.value.history.length - 1].point : null;
  }
};

const calculateScore = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playWinSound();
  scoreResult.value = board.value.calculateScore();
  showScoreModal.value = true;
};

const exportSGF = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playButtonSound();
  sgfText.value = SGFParser.exportToSGF(board.value, {
    gameName: '一诺围棋练习谱',
    blackPlayer: userStore.nickname || '小棋手',
    whitePlayer: '好友'
  });
  sgfModalOpen.value = true;
};

const copySGF = () => {
  navigator.clipboard.writeText(sgfText.value);
  copyFeedback.value = true;
  sound.playCoinSound();
  setTimeout(() => (copyFeedback.value = false), 2000);
};

const importSGF = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (!sgfText.value.trim()) return;
  try {
    const parsed = SGFParser.parseSGF(sgfText.value);
    boardSize.value = parsed.boardSize;
    board.value = new GoBoard(parsed.boardSize, parsed.komi);
    for (const m of parsed.moves) {
      if (m.point) {
        board.value.playMove(m.point.r, m.point.c, m.color);
      } else {
        board.value.pass(m.color);
      }
    }
    sgfModalOpen.value = false;
    sound.playWinSound();
    lastMove.value = board.value.history.length > 0 ? board.value.history[board.value.history.length - 1].point : null;
  } catch (e) {
    sound.playErrorSound();
    alert('SGF 格式解析错误，请检查输入的棋谱文本。');
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-6 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1 text-center md:text-left">
          <div class="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full">
            <Grid class="w-3.5 h-3.5" />
            <span>自由打谱台与沙盒 (Sandbox & SGF)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-gray-900">
            自由对弈 · 摆棋复盘 · 棋谱导出
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium">
            双人面对面下棋、自由摆设死活局、导出专属 SGF 棋谱永久珍藏！
          </p>
        </div>

        <!-- Mode Toggle & SGF Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="mode = 'play'"
            class="px-4 py-2 rounded-2xl border-2 transition font-black text-xs flex items-center gap-1.5 active:scale-95"
            :class="mode === 'play' ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-700 border-gray-200'"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>双人对弈模式</span>
          </button>

          <button
            @click="mode = 'edit'"
            class="px-4 py-2 rounded-2xl border-2 transition font-black text-xs flex items-center gap-1.5 active:scale-95"
            :class="mode === 'edit' ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white text-gray-700 border-gray-200'"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>自由摆棋模式</span>
          </button>

          <button
            @click="exportSGF"
            class="px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Download class="w-3.5 h-3.5" />
            <span>SGF 棋谱</span>
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Left Controls & Status (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          <!-- Status / Current Turn Card -->
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-gray-500 uppercase tracking-wide">
                当前状态
              </span>
              <span
                class="text-xs font-black px-2.5 py-0.5 rounded-full"
                :class="mode === 'play' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'"
              >
                {{ mode === 'play' ? '对弈中' : '摆棋编辑' }}
              </span>
            </div>

            <!-- Current Turn indicator in Play Mode -->
            <div
              v-if="mode === 'play'"
              class="flex items-center gap-3 p-4 rounded-2xl border-2 transition"
              :class="board.turn === 'B' ? 'bg-gray-900 text-white border-black' : 'bg-white text-gray-900 border-gray-300 shadow-sm'"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center border-2"
                :class="board.turn === 'B' ? 'bg-black border-gray-600' : 'bg-white border-gray-400'"
              ></div>
              <div>
                <div class="text-xs font-semibold opacity-75">轮到走子</div>
                <div class="text-base font-black">
                  {{ board.turn === 'B' ? '黑方 (Black)' : '白方 (White)' }}
                </div>
              </div>
            </div>

            <!-- Edit Tool Selector in Edit Mode -->
            <div v-else class="space-y-2">
              <div class="text-xs font-bold text-gray-600">选择摆子工具：</div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="editTool = 'B'"
                  class="py-2 px-3 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 transition"
                  :class="editTool === 'B' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200'"
                >
                  <span class="w-3 h-3 rounded-full bg-black"></span>
                  <span>摆黑子</span>
                </button>
                <button
                  @click="editTool = 'W'"
                  class="py-2 px-3 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 transition"
                  :class="editTool === 'W' ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-gray-50 text-gray-700 border-gray-200'"
                >
                  <span class="w-3 h-3 rounded-full bg-white border border-gray-400"></span>
                  <span>摆白子</span>
                </button>
                <button
                  @click="editTool = 'empty'"
                  class="py-2 px-3 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 transition"
                  :class="editTool === 'empty' ? 'bg-rose-100 text-rose-800 border-rose-400' : 'bg-gray-50 text-gray-700 border-gray-200'"
                >
                  <span>擦除</span>
                </button>
              </div>
            </div>

            <!-- Board Size Selector -->
            <div class="space-y-2 pt-3 border-t border-gray-100">
              <div class="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>切换棋盘路数：</span>
              </div>
              <div class="flex gap-1.5">
                <button
                  v-for="s in [5, 7, 9, 13, 19]"
                  :key="s"
                  @click="initBoard(s)"
                  class="flex-1 py-1.5 rounded-xl border text-xs font-black transition"
                  :class="boardSize === s ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
                >
                  {{ s }}x{{ s }}
                </button>
              </div>
            </div>

            <!-- Capture Counts -->
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-center">
              <div class="bg-gray-50 rounded-xl p-2 border border-gray-200">
                <div class="text-[10px] text-gray-500 font-bold">黑方提子</div>
                <div class="text-lg font-black text-gray-900">{{ board.capturedByBlack }}</div>
              </div>
              <div class="bg-gray-50 rounded-xl p-2 border border-gray-200">
                <div class="text-[10px] text-gray-500 font-bold">白方提子</div>
                <div class="text-lg font-black text-gray-900">{{ board.capturedByWhite }}</div>
              </div>
            </div>
          </div>

          <!-- Board Operations -->
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-2.5">
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="handleUndo"
                class="py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <span>悔棋一步</span>
              </button>

              <button
                @click="handlePass"
                class="py-2.5 px-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <span>虚手 (Pass)</span>
              </button>
            </div>

            <button
              @click="calculateScore"
              class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>数子与判定胜负 (Count Score)</span>
            </button>

            <button
              @click="initBoard()"
              class="w-full py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>清空棋盘</span>
            </button>
          </div>
        </div>

        <!-- Right Go Board (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="bg-white rounded-3xl p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            <GoBoardComponent
              :board="board"
              :playerColor="board.turn"
              :lastMove="lastMove"
              :showLiberties="showLiberties"
              :showAtari="showAtari"
              :showTerritory="showTerritory"
              :theme="userStore.theme"
              :editMode="mode === 'edit' ? editTool : null"
              :sizePx="480"
              @play="handlePlay"
            />

            <!-- Helper Toggles Bar -->
            <div class="w-full flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs font-bold">
              <div class="flex items-center gap-2">
                <button
                  @click="showLiberties = !showLiberties"
                  class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95"
                  :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>显示气数</span>
                </button>

                <button
                  @click="showAtari = !showAtari"
                  class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95"
                  :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <AlertTriangle class="w-3.5 h-3.5" />
                  <span>叫吃警报</span>
                </button>

                <button
                  @click="showTerritory = !showTerritory"
                  class="px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95"
                  :class="showTerritory ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <Flame class="w-3.5 h-3.5" />
                  <span>领地染色</span>
                </button>
              </div>

              <div class="text-xs font-black text-gray-400">
                总手数: {{ board.history.length }}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- SGF Export / Import Modal -->
    <Teleport to="body">
      <div
        v-if="sgfModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md select-none animate-fade-in"
      >
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-4 border-amber-300 space-y-4 animate-pop-in">
          <h3 class="text-xl font-black text-gray-900 flex items-center gap-2">
            <span>📜 SGF 围棋棋谱</span>
          </h3>
          <p class="text-xs text-gray-500 font-medium">
            可直接复制以下 SGF 代码保存，或粘贴外部棋谱进行导入：
          </p>

          <textarea
            v-model="sgfText"
            rows="6"
            class="w-full font-mono text-xs p-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="粘贴标准 SGF 文本..."
          ></textarea>

          <div class="flex gap-2">
            <button
              @click="copySGF"
              class="flex-1 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Copy class="w-4 h-4" />
              <span>{{ copyFeedback ? '已复制到剪贴板！' : '复制棋谱' }}</span>
            </button>
            <button
              @click="importSGF"
              class="flex-1 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Upload class="w-4 h-4" />
              <span>导入棋盘</span>
            </button>
            <button
              @click="sgfModalOpen = false"
              class="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Score Breakdown Modal -->
    <ScoreModal
      v-if="scoreResult"
      :isOpen="showScoreModal"
      :score="scoreResult"
      userColor="B"
      @close="showScoreModal = false"
      @restart="initBoard"
    />
  </div>
</template>

