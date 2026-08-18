<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { sound } from '../utils/sound';

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
      
      <!-- Brand Logo (100% Real Panda Logo Image) -->
      <div
        @click="navigateTo('/')"
        class="flex items-center gap-2 cursor-pointer flex-shrink-0"
      >
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-sm flex items-center justify-center border-2 border-white flex-shrink-0 overflow-hidden"
        >
          <image src="/static/logo/logo-avatar-circle-144.png" mode="aspectFit" class="w-full h-full" />
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

      <!-- Right Action Buttons (Panda Avatar + Sound + Help) -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div
          @click="navigateTo('/profile')"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs cursor-pointer active:scale-95 shadow-2xs"
        >
          <image src="/static/logo/logo-avatar-circle-144.png" mode="aspectFit" class="w-4 h-4" />
          <span class="max-w-[70px] truncate">{{ userStore.nickname || '1' }}</span>
          <span class="text-[10px] text-orange-500">▼</span>
        </div>

        <!-- Sound Button -->
        <button
          type="button"
          @click="toggleSound"
          class="p-2 rounded-2xl border transition active:scale-90 flex items-center justify-center cursor-pointer shadow-2xs"
          :class="userStore.soundEnabled ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-100 border-gray-200 text-gray-400'"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        </button>

        <!-- Help Button -->
        <button
          type="button"
          @click="showHelpModal = true"
          class="p-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 shadow-2xs transition active:scale-90 flex items-center justify-center cursor-pointer"
        >
          <svg class="w-4 h-4 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      </div>

    </div>
  </header>

  <!-- Mobile Bottom Navigation Bar (100% Exact 7-Tab Clean Vector Icons) -->
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
        class="p-1 rounded-xl transition-colors flex items-center justify-center"
        :class="isNavActive(item.path) ? 'bg-orange-100/80 text-orange-600' : 'text-gray-500'"
      >
        <!-- 1. 首页 (Compass) -->
        <svg v-if="item.name === '首页'" class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>

        <!-- 2. 趣味闯关 (Gamepad2) -->
        <svg v-else-if="item.name === '趣味闯关'" class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="6" y1="12" x2="10" y2="12"></line>
          <line x1="8" y1="10" x2="8" y2="14"></line>
          <line x1="15" y1="13" x2="15.01" y2="13"></line>
          <line x1="18" y1="11" x2="18.01" y2="11"></line>
          <rect width="20" height="12" x="2" y="6" rx="6"></rect>
        </svg>

        <!-- 3. 反应乐园 (Zap) -->
        <svg v-else-if="item.name === '反应乐园'" class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>

        <!-- 4. 吃子对弈 (Swords) -->
        <svg v-else-if="item.name === '吃子对弈'" class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
          <line x1="13" y1="19" x2="19" y2="13"></line>
          <line x1="16" y1="16" x2="20" y2="20"></line>
          <line x1="19" y1="21" x2="21" y2="19"></line>
          <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline>
          <line x1="5" y1="14" x2="9" y2="18"></line>
          <line x1="7" y1="17" x2="4" y2="20"></line>
          <line x1="3" y1="19" x2="5" y2="21"></line>
        </svg>

        <!-- 5. 每日死活 (Puzzle) -->
        <svg v-else-if="item.name === '每日死活'" class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.704 1.076.704 1.704s-.234 1.234-.704 1.704l-1.568 1.568a1.183 1.183 0 0 0-.289.878c.045.324-.06.653-.29.883l-1.568 1.568a2.41 2.41 0 0 1-1.704.704c-.628 0-1.234-.234-1.704-.704l-1.568-1.568a1.183 1.183 0 0 0-.878-.289c-.324.045-.653-.06-.883-.29l-1.568-1.568a2.41 2.41 0 0 1-.704-1.704c0-.628.234-1.234.704-1.704l1.568-1.568a1.183 1.183 0 0 0 .289-.878c-.045-.324.06-.653.29-.883l1.568-1.568a2.41 2.41 0 0 1 1.704-.704c.628 0 1.234.234 1.704.704l1.568 1.568c.23.23.335.559.883.29l1.568-1.568a2.41 2.41 0 0 1 1.704-.704c.628 0 1.234.234 1.704.704l1.568 1.568c.23.23.335.559.29.883z"></path>
        </svg>

        <!-- 6. 装扮商城 (ShoppingBag) -->
        <svg v-else-if="item.name === '装扮商城'" class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
          <path d="M3 6h18"></path>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>

        <!-- 7. 成长中心 (UserCheck) -->
        <svg v-else class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <polyline points="16 11 18 13 22 9"></polyline>
        </svg>
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
          ✕
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

