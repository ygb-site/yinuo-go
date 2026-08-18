<script setup lang="ts">
import Navbar from '../../components/Navbar.vue';
import { useUserStore } from '../../stores/userStore';
import { Star, Coins, Puzzle, Award, Sparkles } from 'lucide-vue-next';

const userStore = useUserStore();
</script>

<template>
  <view class="min-h-screen bg-[#FDFBF7] flex flex-col font-sans select-none pb-24">
    <Navbar />

    <view class="flex-1 py-3 px-3 sm:px-6">
      <view class="max-w-4xl mx-auto space-y-4">
        
        <!-- Profile Hero Card (1:1 with Web) -->
        <view class="bg-white rounded-3xl p-5 sm:p-8 border-2 border-sky-100 shadow-sm flex flex-col items-center text-center space-y-3">
          <view class="text-5xl sm:text-6xl">{{ userStore.avatar || '🦁' }}</view>
          <view class="text-xl sm:text-2xl font-black text-gray-900">{{ userStore.nickname || '小棋手' }}</view>
          <view class="text-xs font-black bg-sky-100 text-sky-800 px-4 py-1 rounded-full border border-sky-200">
            🏅 {{ userStore.currentRank.title }}
          </view>

          <view class="grid grid-cols-3 gap-4 w-full pt-4 border-t border-gray-100">
            <view class="text-center">
              <view class="text-2xl font-black text-amber-500">{{ userStore.totalStars || 3 }}</view>
              <view class="text-[11px] font-bold text-gray-500 mt-0.5">⭐ 收集星星</view>
            </view>
            <view class="text-center">
              <view class="text-2xl font-black text-orange-500">{{ userStore.coins || 180 }}</view>
              <view class="text-[11px] font-bold text-gray-500 mt-0.5">🪙 金币余额</view>
            </view>
            <view class="text-center">
              <view class="text-2xl font-black text-purple-500">{{ userStore.solvedPuzzles?.length || 0 }}</view>
              <view class="text-[11px] font-bold text-gray-500 mt-0.5">🧩 已解死活</view>
            </view>
          </view>
        </view>

        <!-- Certificate Box -->
        <view class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm space-y-2">
          <view class="flex items-center gap-2 text-amber-900 font-black text-sm">
            <Award class="w-4 h-4 text-orange-600" />
            <text>官方段位荣誉认证</text>
          </view>
          <view class="text-xs text-gray-700 leading-relaxed font-medium">
            兹证明小棋手【{{ userStore.nickname }}】在【一诺弈学少儿启蒙学院】完成系统修习与死活对战考验，棋理通达，手筋敏锐，特授予【{{ userStore.currentRank.title }}】称号！
          </view>
        </view>

      </view>
    </view>
  </view>
</template>

