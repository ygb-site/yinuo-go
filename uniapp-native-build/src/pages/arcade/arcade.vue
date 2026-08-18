<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '../../components/Navbar.vue';
import GoBoard from '../../components/GoBoard.vue';
import { GoGame } from '../../engine/GoGame';
import { GoAI } from '../../engine/GoAI';
import { useUserStore } from '../../stores/userStore';
import { sound } from '../../utils/sound';
import { Bot, RotateCcw, Swords, Flag } from 'lucide-vue-next';

const userStore = useUserStore();
const game = ref(new GoGame(7));
const lastMove = ref<{ r: number; c: number } | null>(null);
const isPlayerTurn = ref(true);

const resetGame = () => {
  game.value = new GoGame(7);
  lastMove.value = null;
  isPlayerTurn.value = true;
  sound.playButtonSound();
};

onMounted(() => {
  resetGame();
});

const handlePlay = (pt: { r: number; c: number }) => {
  if (!isPlayerTurn.value) return;
  lastMove.value = pt;
  isPlayerTurn.value = false;

  // AI 智能应手
  setTimeout(() => {
    const aiMove = GoAI.getBestMove(game.value, 'W', 1);
    if (aiMove) {
      game.value.playMove(aiMove.r, aiMove.c, 'W');
      lastMove.value = { r: aiMove.r, c: aiMove.c };
      sound.playStoneSound();
    }
    isPlayerTurn.value = true;
  }, 500);
};

const passMove = () => {
  game.value.pass();
  sound.playButtonSound();
  uni.showToast({ title: '黑棋停一手', icon: 'none' });
  isPlayerTurn.value = false;

  setTimeout(() => {
    const aiMove = GoAI.getBestMove(game.value, 'W', 1);
    if (aiMove) {
      game.value.playMove(aiMove.r, aiMove.c, 'W');
      lastMove.value = { r: aiMove.r, c: aiMove.c };
      sound.playStoneSound();
    }
    isPlayerTurn.value = true;
  }, 500);
};
</script>

<template>
  <view class="min-h-screen bg-[#FDFBF7] flex flex-col font-sans select-none pb-24">
    <Navbar />

    <view class="flex-1 py-3 px-3 sm:px-6">
      <view class="max-w-4xl mx-auto space-y-4">
        
        <!-- Header Card -->
        <view class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-emerald-100 shadow-sm flex items-center justify-between">
          <view class="space-y-1">
            <view class="flex items-center gap-2">
              <text class="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                7路小棋盘
              </text>
              <text class="text-xs font-bold text-gray-400">
                难度: 小狗贝贝 25K
              </text>
            </view>
            <view class="text-lg sm:text-xl font-black text-gray-900">
              🤖 萌宠对弈场
            </view>
            <view class="text-xs text-gray-600 font-medium">
              {{ isPlayerTurn ? '执黑先行 · 请在棋盘上落子' : '小萌宠思考中...' }}
            </view>
          </view>
        </view>

        <!-- GoBoard Area -->
        <view class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center">
          <GoBoard
            :game="game"
            :lastMove="lastMove"
            @play="handlePlay"
          />
        </view>

        <!-- Bottom Actions -->
        <view class="flex gap-3">
          <view
            @click="resetGame"
            class="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
          >
            <RotateCcw class="w-3.5 h-3.5 text-white" />
            <text>重新开局</text>
          </view>

          <view
            @click="passMove"
            class="flex-1 py-2.5 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
          >
            <Flag class="w-3.5 h-3.5 text-gray-500" />
            <text>停一手 (Pass)</text>
          </view>
        </view>

      </view>
    </view>
  </view>
</template>

