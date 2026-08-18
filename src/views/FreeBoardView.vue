<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { GoBoard } from '../engine/GoBoard';
import { SGFParser } from '../engine/sgfParser';
import type { Point, ScoreBreakdown } from '../engine/types';
import { useUserStore } from '../stores/userStore';
import { sound } from '../utils/sound';
import { showAlert } from '../utils/alert';
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
  Copy,
  FileText
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
  gameName: '一诺弈学练习谱',
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

const downloadSGF = () => {
  if (!sgfText.value.trim()) return;
  sound.playCoinSound();
  const blob = new Blob([sgfText.value], { type: 'application/x-go-sgf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${userStore.nickname || 'yinuo-go'}-game-${new Date().toISOString().split('T')[0]}.sgf`;
  a.click();
  URL.revokeObjectURL(url);
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
    showAlert({ message: 'SGF 格式解析错误，请检查输入的棋谱文本。', type: 'warning' });
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-8 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div class="space-y-1.5 sm:space-y-2 text-center md:text-left z-10">
          <div class="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-black">
            <Grid class="w-3.5 h-3.5" />
            <span>自由打谱台与沙盒 (Sandbox & SGF)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            自由对弈 · 摆棋复盘 · 棋谱导出
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            双人面对面下棋、自由摆设死活局、导出专属 SGF 棋谱永久珍藏！
          </p>
        </div>

        <!-- Mode Toggle & SGF Buttons -->
        <div class="flex flex-wrap items-center gap-2 z-10">
          <button
            @click="mode = 'play'"
            class="px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            :class="mode === 'play' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>双人对弈模式</span>
          </button>

          <button
            @click="mode = 'edit'"
            class="px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            :class="mode === 'edit' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>自由摆棋模式</span>
          </button>

          <button
            @click="exportSGF"
            class="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <FileText class="w-3.5 h-3.5 text-amber-600" />
            <span>SGF 棋谱</span>
          </button>
        </div>
      </div>

      <!-- Main Layout: On Mobile, Board is placed prominently at top -->
      <div class="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">

        <!-- Right / Top Column: Go Board (order-1 on mobile, 8 cols on desktop) -->
        <div class="order-1 lg:order-2 lg:col-span-8 space-y-4">
          <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            
            <!-- In-Board Mini Status Header (Mobile & Desktop) -->
            <div class="w-full flex items-center justify-between pb-2 border-b border-gray-100 text-xs font-bold">
              <div class="flex items-center gap-2">
                <span
                  class="w-3.5 h-3.5 rounded-full inline-block border"
                  :class="board.turn === 'B' ? 'bg-black border-black' : 'bg-white border-gray-400'"
                ></span>
                <span class="font-black text-gray-800">
                  当前：{{ board.turn === 'B' ? '黑方落子' : '白方落子' }}
                </span>
                <span class="text-[10px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {{ mode === 'play' ? '双人对弈' : '自由摆子' }}
                </span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="text-emerald-700 font-extrabold">黑提: {{ board.capturedByBlack }}</span>
                <span class="text-gray-300">|</span>
                <span class="text-rose-700 font-extrabold">白提: {{ board.capturedByWhite }}</span>
              </div>
            </div>

            <!-- GoBoard Component -->
            <GoBoardComponent
              :board="board"
              :playerColor="board.turn"
              :lastMove="lastMove"
              :showLiberties="showLiberties"
              :showAtari="showAtari"
              :showTerritory="showTerritory"
              :theme="userStore.theme"
              :editMode="mode === 'edit' ? editTool : null"
              :sizePx="460"
              @play="handlePlay"
            />

            <!-- In-Board Quick Action Bar -->
            <div class="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <div class="flex items-center gap-1.5">
                <button
                  @click="handleUndo"
                  class="py-2 px-3 sm:px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <span>悔棋一步</span>
                </button>

                <button
                  @click="handlePass"
                  class="py-2 px-3 sm:px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <span>虚手 (Pass)</span>
                </button>

                <button
                  @click="calculateScore"
                  class="py-2 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-sm flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <span>数子胜负</span>
                </button>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  @click="initBoard()"
                  class="py-2 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>清空</span>
                </button>
              </div>
            </div>

            <!-- Helper Toggles Bar -->
            <div class="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs font-bold">
              <div class="flex items-center gap-2">
                <button
                  @click="showLiberties = !showLiberties"
                  class="px-2.5 py-1 rounded-xl border transition flex items-center gap-1 active:scale-95 text-[11px] cursor-pointer"
                  :class="showLiberties ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <Eye class="w-3 h-3" />
                  <span>显示气数</span>
                </button>

                <button
                  @click="showAtari = !showAtari"
                  class="px-2.5 py-1 rounded-xl border transition flex items-center gap-1 active:scale-95 text-[11px] cursor-pointer"
                  :class="showAtari ? 'bg-rose-100 border-rose-300 text-rose-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <AlertTriangle class="w-3 h-3" />
                  <span>叫吃警报</span>
                </button>

                <button
                  @click="showTerritory = !showTerritory"
                  class="px-2.5 py-1 rounded-xl border transition flex items-center gap-1 active:scale-95 text-[11px] cursor-pointer"
                  :class="showTerritory ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-black' : 'bg-gray-50 border-gray-200 text-gray-600'"
                >
                  <Flame class="w-3 h-3" />
                  <span>领地染色</span>
                </button>
              </div>

              <div class="text-[11px] font-black text-gray-400">
                总手数: {{ board.history.length }}
              </div>
            </div>
          </div>
        </div>

        <!-- Left / Bottom Column: Setup & Size Control (order-2 on mobile, 4 cols on desktop) -->
        <div class="order-2 lg:order-1 lg:col-span-4 space-y-4">
          <!-- Setup Card -->
          <div class="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-3">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide">
              棋盘设置与路数切换
            </div>

            <!-- Size Switcher -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-xs font-bold text-gray-700">切换路数</span>
              <div class="flex gap-1">
                <button
                  v-for="s in [5, 7, 9, 13, 19]"
                  :key="s"
                  @click="initBoard(s)"
                  class="px-2.5 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer"
                  :class="boardSize === s ? 'bg-orange-500 text-white border-orange-500 shadow-xs' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'"
                >
                  {{ s }}x{{ s }}
                </button>
              </div>
            </div>

            <!-- Edit Mode Tool Selector -->
            <div v-if="mode === 'edit'" class="space-y-2 pt-2 border-t border-gray-100">
              <div class="text-xs font-bold text-gray-700">摆子笔刷</div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="editTool = 'B'"
                  class="py-2 px-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                  :class="editTool === 'B' ? 'bg-black text-white border-black shadow-xs' : 'bg-gray-50 border-gray-200'"
                >
                  <span class="w-3 h-3 rounded-full bg-white inline-block"></span>
                  <span>黑子</span>
                </button>

                <button
                  @click="editTool = 'W'"
                  class="py-2 px-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                  :class="editTool === 'W' ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' : 'bg-gray-50 border-gray-200'"
                >
                  <span class="w-3 h-3 rounded-full bg-black inline-block"></span>
                  <span>白子</span>
                </button>

                <button
                  @click="editTool = 'empty'"
                  class="py-2 px-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer"
                  :class="editTool === 'empty' ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-xs' : 'bg-gray-50 border-gray-200'"
                >
                  <span>擦除</span>
                </button>
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
        <div class="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border-4 border-amber-300 space-y-4 animate-pop-in">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-cartoon font-bold text-gray-900 flex items-center gap-2">
              <span>📜 SGF 通用围棋棋谱</span>
            </h3>
            <span class="text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              世界通用记谱格式
            </span>
          </div>

          <div class="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs text-amber-900 font-medium leading-relaxed space-y-1">
            <div class="font-bold text-amber-950 flex items-center gap-1">
              <span>💡 什么是 SGF？</span>
            </div>
            <p class="text-[11px] text-amber-800">
              SGF 是全世界通用的围棋棋谱代码（记录了整盘棋的每一步落子顺序）。
              <b>【复制/下载】</b>可将这盘棋发给老师或保存；<b>【导入】</b>粘贴外部棋谱可瞬间在棋盘上复原名局与死活题！
            </p>
          </div>

          <textarea
            v-model="sgfText"
            rows="6"
            class="w-full font-mono text-xs p-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="粘贴标准 SGF 文本..."
          ></textarea>

          <div class="flex flex-wrap sm:flex-nowrap gap-2">
            <button
              @click="copySGF"
              class="flex-1 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Copy class="w-4 h-4" />
              <span>{{ copyFeedback ? '已复制到剪贴板！' : '复制文本' }}</span>
            </button>

            <button
              @click="downloadSGF"
              class="flex-1 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Download class="w-4 h-4" />
              <span>下载 .sgf 文件</span>
            </button>

            <button
              @click="importSGF"
              class="flex-1 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Upload class="w-4 h-4" />
              <span>导入棋盘</span>
            </button>

            <button
              @click="sgfModalOpen = false"
              class="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
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
