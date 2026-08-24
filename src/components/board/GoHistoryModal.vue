<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  getSavedGoGames,
  deleteSavedGoGame,
  type SavedGoGame
} from '../../services/goHistoryService';
import { playButtonSound, playErrorSound, playWinSound } from '../../lib/audio';
import { showConfirm } from '../../utils/alert';
import {
  X,
  Search,
  Trash2,
  Play,
  Calendar,
  Clock,
  Layers
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'loadGame', game: SavedGoGame): void;
  (e: 'reviewGame', game: SavedGoGame): void;
}>();

const gamesList = ref<SavedGoGame[]>([]);
const searchQuery = ref('');
const filterMode = ref<'all' | 'twoplayer' | 'aimatch'>('all');

const refreshList = () => {
  gamesList.value = getSavedGoGames();
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      refreshList();
    }
  },
  { immediate: true }
);

const filteredGames = computed(() => {
  let list = gamesList.value;
  if (filterMode.value !== 'all') {
    list = list.filter(g => g.mode === filterMode.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      g =>
        g.title.toLowerCase().includes(q) ||
        g.blackName.toLowerCase().includes(q) ||
        g.whiteName.toLowerCase().includes(q) ||
        g.dateFormatted.includes(q)
    );
  }
  return list;
});

const handleLoad = (game: SavedGoGame) => {
  playButtonSound();
  emit('loadGame', game);
  emit('close');
};

const handleReview = (game: SavedGoGame) => {
  playButtonSound();
  emit('reviewGame', game);
};

const handleDelete = async (game: SavedGoGame) => {
  playErrorSound();
  const confirmed = await showConfirm({
    title: '删除棋谱提示',
    message: `确定要删除【${game.title}】的对局记录吗？删除后不可恢复哦！`,
    type: 'warning',
    confirmText: '确定删除',
    cancelText: '取消'
  });
  if (confirmed) {
    deleteSavedGoGame(game.id);
    refreshList();
    playWinSound();
  }
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-hidden bg-slate-900/75 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-5 text-center"
      @click.self="emit('close')"
    >
      <div
        class="relative w-full max-w-2xl max-h-[92vh] overflow-hidden transform rounded-3xl bg-[#FDFBF7] text-left shadow-2xl border-4 border-amber-300 transition-all flex flex-col animate-pop-in"
      >
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-3.5 sm:p-4 px-5 flex items-center justify-between shadow-sm shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/20 flex items-center justify-center text-lg sm:text-xl shrink-0">
              📜
            </div>
            <div>
              <h3 class="font-cartoon font-bold text-base sm:text-xl tracking-wide flex items-center gap-2">
                <span>历史棋谱与对局档案库</span>
                <span class="text-[10px] font-black bg-white/25 px-2 py-0.5 rounded-full">
                  已存 {{ gamesList.length }} 盘
                </span>
              </h3>
              <p class="text-[10px] sm:text-xs text-amber-100 font-medium">
                自动保存每一次对决与点目结果 · 随时调出棋盘与 AI 逐步复盘
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer shrink-0"
            title="关闭"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="p-3 sm:p-4 bg-white border-b border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <!-- Filter Tabs -->
          <div class="flex items-center bg-slate-100 p-1 rounded-xl gap-1 w-full sm:w-auto">
            <button
              @click="filterMode = 'all'"
              class="flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer"
              :class="filterMode === 'all' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              全部棋谱 ({{ gamesList.length }})
            </button>
            <button
              @click="filterMode = 'twoplayer'"
              class="flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer"
              :class="filterMode === 'twoplayer' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              双人对弈
            </button>
            <button
              @click="filterMode = 'aimatch'"
              class="flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer"
              :class="filterMode === 'aimatch' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              人机对弈
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索对局日期或玩家..."
              class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <!-- Games List Content -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 min-h-0">
          <div v-if="filteredGames.length > 0" class="space-y-2.5">
            <div
              v-for="game in filteredGames"
              :key="game.id"
              class="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-orange-100 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
            >
              <!-- Left: Meta Info -->
              <div class="space-y-1.5 min-w-0 flex-1">
                <!-- Title & Tags -->
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {{ game.title }}
                  </h4>
                  <span class="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 shrink-0">
                    {{ game.boardSize }}x{{ game.boardSize }} 盘
                  </span>
                  <span class="px-2 py-0.2 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 shrink-0">
                    {{ game.modeLabel }}
                  </span>
                </div>

                <!-- Players & Result -->
                <div class="flex items-center gap-3 text-xs font-bold text-slate-600 flex-wrap">
                  <span class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-black inline-block"></span>
                    <span>{{ game.blackName }}</span>
                  </span>
                  <span>VS</span>
                  <span class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-white border border-gray-400 inline-block"></span>
                    <span>{{ game.whiteName }}</span>
                  </span>
                  <span class="text-slate-300">•</span>
                  <span class="text-orange-700 font-extrabold">
                    {{
                      game.winner === 'B' ? '🏆 黑方胜' :
                      game.winner === 'W' ? '🏆 白方胜' :
                      game.winner === 'TIE' ? '🤝 和棋' :
                      '进行中'
                    }}
                  </span>
                </div>

                <!-- Sub details -->
                <div class="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                  <span class="flex items-center gap-1">
                    <Layers class="w-3 h-3 text-slate-400" />
                    <span>共 {{ game.totalMoves }} 手棋</span>
                  </span>
                  <span v-if="game.durationFormatted" class="flex items-center gap-1">
                    <Clock class="w-3 h-3 text-slate-400" />
                    <span>耗时 {{ game.durationFormatted }}</span>
                  </span>
                  <span class="flex items-center gap-1">
                    <Calendar class="w-3 h-3 text-slate-400" />
                    <span>{{ game.dateFormatted }}</span>
                  </span>
                </div>
              </div>

              <!-- Right: Actions Buttons -->
              <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                <!-- Load onto Board -->
                <button
                  @click="handleLoad(game)"
                  class="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-black transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer border border-orange-200"
                  title="载入棋盘"
                >
                  <Play class="w-3 h-3" />
                  <span>载入棋盘</span>
                </button>

                <!-- Step-by-Step AI Review -->
                <button
                  @click="handleReview(game)"
                  class="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white text-xs font-black transition active:scale-95 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  title="AI 逐步复盘"
                >
                  <Search class="w-3 h-3" />
                  <span>AI 复盘</span>
                </button>

                <!-- Delete Record -->
                <button
                  @click="handleDelete(game)"
                  class="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95 cursor-pointer"
                  title="删除记录"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16 space-y-3">
            <div class="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mx-auto shadow-inner border border-amber-200">
              ♟️
            </div>
            <div class="space-y-1">
              <h4 class="text-base font-black text-slate-800">暂无保存的对局棋谱</h4>
              <p class="text-xs text-slate-400 font-bold max-w-sm mx-auto">
                在对弈中落子对决或终局点目时，系统会自动将棋谱归档至此，也可点击“保存当前棋谱”随时留存！
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 px-5 bg-amber-50/60 border-t border-amber-100 text-right flex items-center justify-between text-xs font-bold text-slate-400 shrink-0">
          <span>💡 提示：棋谱保存在本地，换设备前可在设置中备份档案</span>
          <button
            @click="emit('close')"
            class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl cursor-pointer active:scale-95 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
