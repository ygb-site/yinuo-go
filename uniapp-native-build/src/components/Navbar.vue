<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { sound } from '../utils/sound';
import {
  Compass,
  Gamepad2,
  Zap,
  Swords,
  Puzzle,
  ShoppingBag,
  UserCheck,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  Check
} from 'lucide-vue-next';

const userStore = useUserStore();
const currentPath = ref('/');
const showHelpModal = ref(false);

const navItems = [
  { path: '/', name: '首页', shortName: '首页' },
  { path: '/learn', name: '趣味闯关', shortName: '闯关' },
  { path: '/arcade', name: '反应乐园', shortName: '乐园' },
  { path: '/capture-go', name: '吃子对弈', shortName: '吃子' },
  { path: '/tsumego', name: '每日死活', shortName: '死活' },
  { path: '/shop', name: '装扮商城', shortName: '商城' },
  { path: '/profile', name: '成长中心', shortName: '我的' }
];

const toggleSound = () => {
  userStore.toggleSound();
  sound.playButtonSound();
};

const navigateTo = (path: string) => {
  sound.playButtonSound();
  currentPath.value = path;
  let url = '/pages/index/index';
  if (path === '/learn') url = '/pages/learn/learn';
  else if (path === '/arcade' || path === '/capture-go') url = '/pages/arcade/arcade';
  else if (path === '/tsumego') url = '/pages/tsumego/tsumego';
  else if (path === '/profile' || path === '/shop') url = '/pages/profile/profile';
  else if (path === '/' || path === '') {
    uni.reLaunch({ url: '/pages/index/index' });
    return;
  }
  uni.navigateTo({ url });
};

const isNavActive = (path: string) => {
  if (path === '/') return currentPath.value === '/' || currentPath.value === '';
  return currentPath.value.startsWith(path);
};
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-orange-100 shadow-xs select-none">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
      
      <!-- Brand Logo -->
      <div
        @click="navigateTo('/')"
        class="flex items-center gap-2 cursor-pointer flex-shrink-0"
      >
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-sm flex items-center justify-center border-2 border-white flex-shrink-0 overflow-hidden"
        >
          <span class="text-xl sm:text-2xl">🐼</span>
        </div>
        <div class="flex flex-col justify-center">
          <div class="flex items-center gap-1 sm:gap-1.5">
            <span class="text-base sm:text-xl font-cartoon font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent leading-none whitespace-nowrap tracking-wider">
              一诺弈学
            </span>
            <span class="bg-orange-100 text-orange-800 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-orange-300 shadow-2xs whitespace-nowrap">
              YiNuo Go
            </span>
          </div>
          <span class="text-[9px] font-bold text-gray-400 leading-tight whitespace-nowrap">
            少儿互动启蒙 · 快乐学棋
          </span>
        </div>
      </div>

      <!-- Right Action Buttons -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div
          @click="navigateTo('/profile')"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs cursor-pointer active:scale-95 shadow-2xs"
        >
          <span>{{ userStore.avatar || '🐼' }}</span>
          <span class="max-w-[70px] truncate">{{ userStore.nickname || '小棋手' }}</span>
        </div>

        <button
          type="button"
          @click="toggleSound"
          class="p-2 rounded-2xl border transition active:scale-90 flex items-center justify-center cursor-pointer shadow-2xs"
          :class="userStore.soundEnabled ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-100 border-gray-200 text-gray-400'"
        >
          <Volume2 v-if="userStore.soundEnabled" class="w-4 h-4" />
          <VolumeX v-else class="w-4 h-4" />
        </button>

        <button
          type="button"
          @click="showHelpModal = true"
          class="p-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 shadow-2xs transition active:scale-90 flex items-center justify-center cursor-pointer"
        >
          <HelpCircle class="w-4 h-4" />
        </button>
      </div>

    </div>
  </header>

  <!-- Mobile Bottom Navigation Bar (1:1 with Web) -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-orange-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none">
    <button
      v-for="item in navItems"
      :key="item.path"
      @click="navigateTo(item.path)"
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer min-w-0 relative group"
      :class="isNavActive(item.path) ? 'text-orange-600 font-black' : 'text-gray-400 hover:text-gray-600'"
    >
      <div
        v-if="isNavActive(item.path)"
        class="absolute -top-1.5 w-6 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-xs"
      ></div>

      <div
        class="p-1 rounded-xl transition-colors"
        :class="isNavActive(item.path) ? 'bg-orange-100/80 text-orange-600' : 'text-gray-500'"
      >
        <Compass v-if="item.name === '首页'" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <Gamepad2 v-else-if="item.name === '趣味闯关'" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <Zap v-else-if="item.name === '反应乐园'" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <Swords v-else-if="item.name === '吃子对弈'" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <Puzzle v-else-if="item.name === '每日死活'" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <ShoppingBag v-else-if="item.name === '装扮商城'" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <UserCheck v-else class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
      </div>

      <span
        class="text-[10px] leading-none mt-0.5 whitespace-nowrap truncate max-w-full"
        :class="isNavActive(item.path) ? 'font-black text-orange-600' : 'font-bold text-gray-500'"
      >
        {{ item.shortName }}
      </span>
    </button>
  </nav>

  <!-- Help Modal -->
  <div
    v-if="showHelpModal"
    class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    @click.self="showHelpModal = false"
  >
    <div class="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-amber-300 shadow-2xl space-y-4 text-left">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-black text-gray-900">一诺弈学 · 使用指南</h3>
        <button @click="showHelpModal = false" class="p-1 rounded-full text-gray-400 hover:text-gray-700">
          <X class="w-5 h-5" />
        </button>
      </div>
      <p class="text-xs text-gray-600 leading-relaxed font-medium">
        欢迎来到少儿围棋启蒙世界！点击底部导航与各大卡片即可开启趣味闯关、死活题库与人机对弈！
      </p>
      <button
        @click="showHelpModal = false"
        class="w-full py-2.5 rounded-2xl bg-orange-500 text-white font-black text-xs shadow-md"
      >
        明白啦！
      </button>
    </div>
  </div>
</template>

