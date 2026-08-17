<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound } from '../lib/audio';
import {
  Volume2,
  VolumeX,
  Palette,
  Coins,
  Star,
  Gamepad2,
  Compass,
  Puzzle,
  Bot,
  Grid,
  BookMarked,
  UserCheck,
  ChevronDown,
  UserPlus
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const showThemeDropdown = ref(false);

const navItems = [
  { path: '/', name: '首页', shortName: '首页', icon: Compass },
  { path: '/learn', name: '趣味闯关', shortName: '闯关', icon: Gamepad2 },
  { path: '/tsumego', name: '每日死活', shortName: '死活', icon: Puzzle },
  { path: '/ai-match', name: '人机对弈', shortName: '对弈', icon: Bot },
  { path: '/free-board', name: '自由打谱', shortName: '打谱', icon: Grid },
  { path: '/dictionary', name: '术语字典', shortName: '字典', icon: BookMarked },
  { path: '/profile', name: '成长中心', shortName: '我的', icon: UserCheck }
];

const toggleSound = () => {
  userStore.toggleSound();
  playButtonSound();
};

const selectTheme = (theme: 'wood' | 'candy' | 'neon' | 'jade') => {
  userStore.setTheme(theme);
  showThemeDropdown.value = false;
};

const navigateTo = (path: string) => {
  playButtonSound();
  router.push(path);
};

const isNavActive = (itemPath: string) => {
  if (itemPath === '/') return route.path === '/';
  if (itemPath === '/learn') {
    return (
      route.path === '/learn' ||
      route.path.startsWith('/lesson') ||
      route.path.startsWith('/adventure')
    );
  }
  return route.path.startsWith(itemPath);
};
</script>

<template>
  <!-- Top Navigation Header -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs select-none">
    <div class="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
      <div class="flex items-center justify-between h-14 sm:h-18 gap-2 sm:gap-4">
        
        <!-- Left: Brand Logo & Title -->
        <div
          @click="navigateTo('/')"
          class="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          title="返回首页"
        >
          <div
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-sm flex items-center justify-center border-2 border-white group-hover:rotate-6 transition-transform flex-shrink-0"
          >
            <span class="text-xl sm:text-2xl">🐼</span>
          </div>
          <div class="flex flex-col justify-center">
            <div class="flex items-center gap-1.5">
              <span class="text-xl sm:text-2xl font-cartoon font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent leading-none whitespace-nowrap tracking-wider">
                一诺围棋
              </span>
              <span class="bg-orange-100 text-orange-800 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-orange-300 shadow-2xs whitespace-nowrap hidden sm:inline-block">
                YiNuo Go
              </span>
            </div>
            <span class="text-[10px] font-bold text-gray-400 leading-tight whitespace-nowrap hidden md:inline-block">
              少儿互动启蒙 · 快乐学棋
            </span>
          </div>
        </div>

        <!-- Center: Desktop Capsule Navigation Tabs -->
        <nav class="hidden lg:flex items-center bg-amber-50/80 border border-orange-200/80 p-1 rounded-2xl shadow-inner gap-0.5 xl:gap-1 flex-shrink-0">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            class="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer"
            :class="
              isNavActive(item.path)
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-orange-600 hover:bg-white/80'
            "
          >
            <component :is="item.icon" class="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
            <span>{{ item.name }}</span>
          </button>
        </nav>

        <!-- Right: Kid Profile Switcher, Stars, Coins & Actions -->
        <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          <!-- Mode A: Profile Exists -> Profile Selector Chip -->
          <div
            v-if="userStore.hasProfile"
            @click="userStore.openProfileModal()"
            class="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-300/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl cursor-pointer shadow-2xs transition transform active:scale-95 flex-shrink-0"
            title="点击切换当前宝贝档案"
          >
            <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center text-xs sm:text-sm shadow-inner border border-orange-200 flex-shrink-0">
              {{ userStore.avatar }}
            </div>
            <div class="flex items-center gap-1 whitespace-nowrap">
              <span class="text-xs sm:text-sm font-black text-gray-800 whitespace-nowrap max-w-[60px] sm:max-w-[100px] truncate">
                {{ userStore.nickname }}
              </span>
              <ChevronDown class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 flex-shrink-0" />
            </div>
          </div>

          <!-- Mode B: No Profile Exists -> Create Profile Action Button -->
          <button
            v-else
            @click="userStore.openProfileModal()"
            class="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border border-amber-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl cursor-pointer shadow-sm transition transform active:scale-95 flex-shrink-0 text-xs font-black"
            title="点击创建宝贝档案"
          >
            <UserPlus class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="whitespace-nowrap">创建档案</span>
          </button>

          <!-- Stars & Coins (Desktop / Tablet view) -->
          <div v-if="userStore.hasProfile" class="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <!-- Stars -->
            <div class="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-2xl text-xs font-black text-amber-900 shadow-2xs whitespace-nowrap" title="已收集星星">
              <Star class="w-3.5 h-3.5 text-amber-500 fill-current flex-shrink-0" />
              <span>{{ userStore.totalStars }}</span>
            </div>

            <!-- Coins -->
            <div class="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-2xl text-xs font-black text-amber-900 shadow-2xs whitespace-nowrap" title="金币余额">
              <Coins class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>{{ userStore.coins }}</span>
            </div>
          </div>

          <!-- Sound Toggle Button -->
          <button
            @click="toggleSound"
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition active:scale-90 flex items-center justify-center flex-shrink-0 cursor-pointer"
            :title="userStore.soundEnabled ? '音效已开启（点击静音）' : '音效已静音（点击开启）'"
          >
            <Volume2 v-if="userStore.soundEnabled" class="w-4 h-4 text-emerald-600" />
            <VolumeX v-else class="w-4 h-4 text-gray-400" />
          </button>

          <!-- Theme Dropdown Button -->
          <div class="relative flex-shrink-0">
            <button
              @click="showThemeDropdown = !showThemeDropdown"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-amber-600 transition active:scale-90 flex items-center justify-center cursor-pointer"
              title="切换棋盘主题皮肤"
            >
              <Palette class="w-4 h-4" />
            </button>

            <!-- Theme Dropdown Menu -->
            <div
              v-if="showThemeDropdown"
              class="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-1.5 z-50 animate-pop-in"
            >
              <button
                @click="selectTheme('wood')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-amber-50 text-amber-900 transition cursor-pointer"
              >
                <span>🪵 原木经典</span>
                <span v-if="userStore.theme === 'wood'">✓</span>
              </button>
              <button
                @click="selectTheme('candy')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-pink-50 text-pink-700 transition cursor-pointer"
              >
                <span>🍬 糖果梦境</span>
                <span v-if="userStore.theme === 'candy'">✓</span>
              </button>
              <button
                @click="selectTheme('jade')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-emerald-50 text-emerald-800 transition cursor-pointer"
              >
                <span>🍵 翡翠温玉</span>
                <span v-if="userStore.theme === 'jade'">✓</span>
              </button>
              <button
                @click="selectTheme('neon')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-slate-50 text-slate-800 transition cursor-pointer"
              >
                <span>🌌 赛博星空</span>
                <span v-if="userStore.theme === 'neon'">✓</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- Mobile Bottom Navigation Bar (📱 手机端固定底部快捷导航栏 - 1秒即达) -->
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-orange-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none">
    <button
      v-for="item in navItems"
      :key="item.path"
      @click="navigateTo(item.path)"
      class="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer min-w-0 relative group"
      :class="isNavActive(item.path) ? 'text-orange-600 font-black' : 'text-gray-400 hover:text-gray-600'"
    >
      <!-- Active Pill Glow Indicator -->
      <div
        v-if="isNavActive(item.path)"
        class="absolute -top-1.5 w-6 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-xs"
      ></div>

      <div
        class="p-1 rounded-xl transition-colors"
        :class="isNavActive(item.path) ? 'bg-orange-100/80 text-orange-600' : 'text-gray-500'"
      >
        <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
      </div>

      <span
        class="text-[10px] leading-none mt-0.5 whitespace-nowrap truncate max-w-full"
        :class="isNavActive(item.path) ? 'font-black text-orange-600' : 'font-bold text-gray-500'"
      >
        {{ item.shortName }}
      </span>
    </button>
  </nav>
</template>
