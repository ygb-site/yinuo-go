<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { sound } from '../utils/sound';
import {
  getLocalGameRecords,
  deleteUnifiedGameRecord,
  type UnifiedGameRecord,
  type GameType
} from '../services/gameRecordsService';
import type { CheckersPlayerCount } from '../engine/checkers/checkersEngine';
import type { GoMatchBoardSize } from '../engine/types';
import { AppSelect, type AppSelectOption } from '../design-system';
import {
  Sparkles,
  Play,
  History,
  X,
  Trash2
} from 'lucide-vue-next';

const router = useRouter();

type GameKind = 'gomoku' | 'checkers' | 'xiangqi' | 'go';
const selectedGame = ref<GameKind>('gomoku');

const GAME_OPTIONS: { id: GameKind; icon: string; name: string }[] = [
  { id: 'gomoku', icon: '⚪', name: '欢乐五子棋' },
  { id: 'checkers', icon: '⭐', name: '快乐六角跳棋' },
  { id: 'xiangqi', icon: '🐴', name: '中国象棋 · Xiangqi' },
  { id: 'go', icon: '♟️', name: '少儿经典围棋' }
];

const gameSelectOptions: AppSelectOption<GameKind>[] = GAME_OPTIONS.map((g) => ({
  value: g.id,
  icon: g.icon,
  label: g.name
}));

const checkersPlayerOptions: AppSelectOption<CheckersPlayerCount>[] = [
  { value: 2, label: '2 人 · 南北对坐' },
  { value: 3, label: '3 人 · 隔座三角' },
  { value: 4, label: '4 人 · 两对对坐' },
  { value: 5, label: '5 人 · 空出一角' },
  { value: 6, label: '6 人 · 全星开局' }
];

const goSizeOptions: AppSelectOption<GoMatchBoardSize>[] = [
  { value: 7, icon: '🟢', label: '7×7 路 · 入门小盘' },
  { value: 9, icon: '🟡', label: '9×9 路 · 极速吃子' },
  { value: 13, icon: '🟠', label: '13×13 路 · 中盘练兵' },
  { value: 19, icon: '🔴', label: '19×19 路 · 标准大盘' }
];

const onSelectChange = () => {
  sound.playButtonSound();
};

const checkersPlayers = ref<CheckersPlayerCount>(2);
const goSize = ref<GoMatchBoardSize>(9);

const showRecordsModal = ref<boolean>(false);
const allRecords = ref<UnifiedGameRecord[]>(getLocalGameRecords('all'));
const filterGameType = ref<GameType | 'all'>('all');

const refreshRecords = () => {
  allRecords.value = getLocalGameRecords('all');
};

const filteredRecords = computed(() => {
  if (filterGameType.value === 'all') return allRecords.value;
  return allRecords.value.filter((r) => r.gameType === filterGameType.value);
});

const openRecordsModal = () => {
  refreshRecords();
  showRecordsModal.value = true;
  sound.playButtonSound();
};

const goToReplay = (rec: UnifiedGameRecord) => {
  showRecordsModal.value = false;
  sound.playButtonSound();
  if (rec.gameType === 'checkers') {
    router.push('/checkers');
    return;
  }
  if (rec.gameType === 'gomoku') {
    router.push('/gomoku');
    return;
  }
  if (rec.gameType === 'xiangqi') {
    router.push('/xiangqi/play');
    return;
  }
  router.push('/two-player');
};

const handleDeleteRecord = (id: string) => {
  deleteUnifiedGameRecord(id);
  refreshRecords();
};

const launchMatch = () => {
  sound.playButtonSound();

  if (selectedGame.value === 'gomoku') {
    router.push({
      path: '/gomoku',
      query: {
        mode: 'twoPlayer'
      }
    });
    return;
  }

  if (selectedGame.value === 'checkers') {
    router.push({
      path: '/checkers',
      query: {
        mode: 'twoPlayer',
        players: String(checkersPlayers.value)
      }
    });
    return;
  }

  if (selectedGame.value === 'xiangqi') {
    router.push({
      path: '/xiangqi/play',
      query: {
        mode: 'twoPlayer'
      }
    });
    return;
  }

  router.push({
    path: '/two-player',
    query: {
      size: String(goSize.value)
    }
  });
};

</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#F8F6F2] py-4 md:py-8 px-3.5 sm:px-6 lg:px-8 select-none font-sans">
    <div class="max-w-5xl mx-auto space-y-6 md:space-y-8">

      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-6 sm:p-8 text-white shadow-md border-2 border-white/80">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div class="absolute right-8 top-4 text-7xl opacity-15 pointer-events-none">⚔️</div>

        <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-100">
              <Sparkles class="w-3.5 h-3.5 text-amber-200" />
              <span>智趣博弈大厅 · 亲子同屏开局</span>
            </div>

            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-white drop-shadow-sm">
              创建对局中心 ⚔️
            </h1>

            <p class="text-xs sm:text-sm text-white/95 font-medium max-w-xl leading-relaxed">
              选好棋种，需要时再选人数或路数，一键开始亲子同屏对局。
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <button
              type="button"
              class="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/30 backdrop-blur-md shadow-xs active:scale-95 transition-all cursor-pointer"
              title="查看历史对局记录与复盘"
              @click="openRecordsModal"
            >
              <History class="w-4 h-4 text-amber-200" />
              <span>历史对局记录</span>
              <span v-if="allRecords.length > 0" class="px-2 py-0.2 text-[11px] rounded-full bg-amber-400 text-slate-950 font-black">
                {{ allRecords.length }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200/90 shadow-2xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-black text-slate-900">创建对局面板</h2>
            <p class="text-xs text-slate-500 mt-1 font-medium">选好棋种就能开，只开亲子同屏。</p>
          </div>
          <button
            type="button"
            class="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xs hover:shadow-sm transition active:scale-95 cursor-pointer"
            @click="launchMatch"
          >
            <Play class="w-4 h-4 fill-white" />
            <span>开始对局</span>
          </button>
        </div>

        <div class="space-y-2.5">
          <label class="text-xs sm:text-sm font-black text-slate-800" for="match-game-kind">♟️ 对弈棋类</label>
          <AppSelect
            id="match-game-kind"
            v-model="selectedGame"
            :options="gameSelectOptions"
            variant="emphasis"
            aria-label="对弈棋类"
            @change="onSelectChange"
          />
        </div>

        <div v-if="selectedGame === 'checkers'" class="space-y-2.5 animate-fade-in pt-4 border-t border-slate-100">
          <label class="text-xs sm:text-sm font-black text-slate-800" for="checkers-players">👥 对战人数</label>
          <AppSelect
            id="checkers-players"
            v-model="checkersPlayers"
            :options="checkersPlayerOptions"
            aria-label="对战人数"
            @change="onSelectChange"
          />
        </div>

        <div v-if="selectedGame === 'go'" class="space-y-2.5 animate-fade-in pt-4 border-t border-slate-100">
          <label class="text-xs sm:text-sm font-black text-slate-800" for="go-size">📐 棋盘路数</label>
          <AppSelect
            id="go-size"
            v-model="goSize"
            :options="goSizeOptions"
            aria-label="棋盘路数"
            @change="onSelectChange"
          />
        </div>
      </div>

    </div>

    <div
      v-if="showRecordsModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="showRecordsModal = false"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full h-[540px] max-h-[88vh] shadow-2xl border-2 border-slate-200/90 flex flex-col space-y-4 overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0 shadow-2xs">
              📜
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900">历史对局记录与智能复盘</h3>
              <p class="text-xs text-slate-400 mt-0.5">全棋类棋谱自动留存，支持随时分步滑动推演与接盘探索</p>
            </div>
          </div>
          <button
            type="button"
            class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
            @click="showRecordsModal = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
            :class="filterGameType === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
            @click="filterGameType = 'all'; sound.playButtonSound();"
          >
            全部棋谱 ({{ allRecords.length }})
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
            :class="filterGameType === 'gomoku' ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
            @click="filterGameType = 'gomoku'; sound.playButtonSound();"
          >
            ⚪ 五子棋
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
            :class="filterGameType === 'checkers' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
            @click="filterGameType = 'checkers'; sound.playButtonSound();"
          >
            ⭐ 六角跳棋
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
            :class="filterGameType === 'xiangqi' ? 'bg-rose-600 text-white border-rose-600 shadow-2xs' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
            @click="filterGameType = 'xiangqi'; sound.playButtonSound();"
          >
            🐴 中国象棋 · Xiangqi
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
            :class="filterGameType === 'go' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
            @click="filterGameType = 'go'; sound.playButtonSound();"
          >
            ♟️ 少儿围棋
          </button>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto pr-1">
          <div v-if="filteredRecords.length > 0" class="space-y-2.5">
            <div
              v-for="rec in filteredRecords"
              :key="rec.id"
              class="bg-slate-50 hover:bg-amber-50/60 rounded-2xl p-3.5 border border-slate-200/90 hover:border-amber-400 flex items-center justify-between gap-3 transition-all"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  {{ rec.gameType === 'checkers' ? '⭐' : rec.gameType === 'gomoku' ? '⚪' : rec.gameType === 'xiangqi' ? '🐴' : '♟️' }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-slate-900">
                      {{ rec.gameTypeName }} · {{ rec.modeName }}
                    </span>
                    <span
                      class="text-[10px] font-bold px-2 py-0.2 rounded-full"
                      :class="rec.isUserWinner ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'"
                    >
                      胜者: {{ rec.winnerAvatar }} {{ rec.winnerName }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>总步数: {{ rec.totalMoves }} 步</span>
                    <span>•</span>
                    <span>{{ rec.playedAt }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  class="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  @click="goToReplay(rec)"
                >
                  <Play class="w-3.5 h-3.5 fill-white" />
                  <span>进入复盘</span>
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 active:scale-95 transition-all cursor-pointer"
                  title="删除此记录"
                  @click="handleDeleteRecord(rec.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div v-else class="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
            <span class="text-4xl mb-2.5">📭</span>
            <span class="font-medium text-slate-500">暂无该分类对局记录</span>
            <span class="text-xs text-slate-400 mt-1">快去开启一盘精彩对弈吧！</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
