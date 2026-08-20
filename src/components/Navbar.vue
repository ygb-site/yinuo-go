<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useUnlockStore } from '../stores/unlockStore';
import { SHOP_THEMES, type ShopThemeItem } from '../data/shopData';
import { playButtonSound, playErrorSound } from '../lib/audio';
import { showConfirm } from '../utils/alert';
import type { ThemeType } from '../engine/types';
import {
  Volume2,
  VolumeX,
  Palette,
  Coins,
  Star,
  Gamepad2,
  Compass,
  Flame,
  Swords,
  ShoppingBag,
  UserCheck,
  ChevronDown,
  UserPlus,
  Lock,
  LogIn,
  ShieldAlert,
  LogOut,
  User
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const unlockStore = useUnlockStore();

const showThemeDropdown = ref(false);
const themeDropdownRef = ref<HTMLElement | null>(null);

const showUserMenu = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

const handleGlobalClick = (event: Event) => {
  const target = event.target as Node;
  if (showThemeDropdown.value && themeDropdownRef.value && !themeDropdownRef.value.contains(target)) {
    showThemeDropdown.value = false;
  }
  if (showUserMenu.value && userMenuRef.value && !userMenuRef.value.contains(target)) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('pointerdown', handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleGlobalClick);
});

// 5 Core Focused Navigation Tabs
const navItems = [
  { path: '/', name: '首页', shortName: '首页', icon: Compass },
  { path: '/learn', name: '启蒙闯关', shortName: '闯关', icon: Gamepad2 },
  { path: '/practice', name: '技能训练', shortName: '练习', icon: Flame },
  { path: '/battle', name: '对弈竞技', shortName: '对弈', icon: Swords },
  { path: '/profile', name: '成长中心', shortName: '我的', icon: UserCheck }
];

const toggleSound = () => {
  userStore.toggleSound();
  playButtonSound();
};

const isThemeUnlocked = (id: ThemeType) => {
  return userStore.unlockedThemes.includes(id) || id === 'wood';
};

const selectOrBuyTheme = (theme: ShopThemeItem) => {
  if (isThemeUnlocked(theme.id)) {
    userStore.setTheme(theme.id);
    showThemeDropdown.value = false;
    playButtonSound();
  } else {
    showThemeDropdown.value = false;
    goToShop();
  }
};

const goToShop = () => {
  showThemeDropdown.value = false;
  const isUnlocked = unlockStore.isFeatureUnlocked('shop');
  if (!isUnlocked) {
    playErrorSound();
    const feat = unlockStore.getFeature('shop');
    showConfirm({
      title: '装扮商城暂未解锁',
      message: `小棋手别着急！【装扮商城】需要${feat?.unlockTip || '通关第1章【吃子魔法】'}才能开启哦！快去继续主线闯关吧！`,
      type: 'warning',
      confirmText: '前往闯关',
      cancelText: '知道了'
    }).then(confirmed => {
      if (confirmed) {
        router.push('/learn');
      }
    });
    return;
  }
  playButtonSound();
  router.push('/shop');
};

const navigateTo = (path: string) => {
  playButtonSound();
  showThemeDropdown.value = false;
  showUserMenu.value = false;
  router.push(path);
};

const handleLogout = () => {
  showUserMenu.value = false;
  userStore.openAuthModal();
};

const isNavActive = (itemPath: string) => {
  if (itemPath === '/') return route.path === '/';
  if (itemPath === '/learn') {
    return (
      route.path === '/learn' ||
      route.path.startsWith('/lesson') ||
      route.path.startsWith('/adventure') ||
      route.path === '/dictionary' ||
      route.path === '/rhymes'
    );
  }
  if (itemPath === '/practice') {
    return (
      route.path === '/practice' ||
      route.path.startsWith('/arcade') ||
      route.path.startsWith('/tsumego') ||
      route.path.startsWith('/mistakes') ||
      route.path.startsWith('/worksheet') ||
      route.path.startsWith('/free-board')
    );
  }
  if (itemPath === '/battle') {
    return (
      route.path === '/battle' ||
      route.path.startsWith('/capture-go') ||
      route.path.startsWith('/two-player') ||
      route.path.startsWith('/ai-match') ||
      route.path.startsWith('/rank-exam')
    );
  }
  if (itemPath === '/profile') {
    return route.path === '/profile';
  }
  return route.path === itemPath;
};
</script>

<template>
  <!-- Top Navigation Header (Shared Mobile & Desktop) -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs select-none">
    <div class="max-w-7xl mx-auto px-2.5 sm:px-5 lg:px-6">
      <div class="flex items-center justify-between h-14 sm:h-18 gap-1.5 sm:gap-4">
        
        <!-- Left: Brand Logo & Title -->
        <div
          @click="navigateTo('/')"
          class="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          title="返回首页"
        >
          <div
            class="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-sm flex items-center justify-center border-2 border-white group-hover:rotate-6 transition-transform flex-shrink-0 overflow-hidden"
          >
            <img src="/logo/logo-avatar-circle-144.png" alt="一诺弈学" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center">
            <div class="flex items-center gap-1.5 leading-none">
              <span class="text-lg sm:text-2xl font-cartoon font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent whitespace-nowrap tracking-wide sm:tracking-wider">
                一诺弈学
              </span>
              <span class="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-2xs tracking-wider whitespace-nowrap">
                Go
              </span>
            </div>
            <span class="hidden sm:block text-[10px] font-bold text-gray-400 leading-tight whitespace-nowrap mt-0.5">
              少儿互动启蒙 · 快乐学棋
            </span>
          </div>
        </div>

        <!-- Center: Desktop Capsule Navigation Tabs -->
        <nav class="hidden lg:flex items-center bg-amber-50/80 border border-orange-200/80 p-1 rounded-2xl shadow-inner gap-1 xl:gap-1.5 flex-shrink-0">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            class="flex items-center gap-1.5 px-3.5 xl:px-4 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer"
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

        <!-- Right: Admin Badge, User Profile / Login, Stars, Coins & Actions -->
        <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          


          <!-- CASE 1: Not Logged In -> Show Primary Login / Register Button -->
          <button
            v-if="!userStore.isLoggedIn"
            @click="userStore.openAuthModal()"
            class="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border border-amber-300 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl cursor-pointer shadow-2xs sm:shadow-md transition transform active:scale-95 text-xs font-black"
            title="登录或注册账号开启学棋"
          >
            <LogIn class="w-3.5 h-3.5 flex-shrink-0" />
            <span>登录 / 注册</span>
          </button>

          <!-- CASE 2: Logged In but No Child Profile Yet -> Show Create Profile Button -->
          <button
            v-else-if="!userStore.hasProfile"
            @click="userStore.openProfileModal()"
            class="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border border-emerald-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl cursor-pointer shadow-2xs transition transform active:scale-95 text-xs font-black"
            title="创建第一个宝贝档案"
          >
            <UserPlus class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="whitespace-nowrap">创建宝贝</span>
          </button>

          <!-- CASE 3: Logged In & Has Profile -> Show Child Avatar Switcher Dropdown -->
          <div v-else ref="userMenuRef" class="relative flex-shrink-0">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-300/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl cursor-pointer shadow-xs transition transform active:scale-95 flex-shrink-0"
              title="点击切换宝贝或查看账号"
            >
              <div class="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-full bg-white flex items-center justify-center text-xs sm:text-sm shadow-inner border border-orange-200 flex-shrink-0">
                {{ userStore.avatar }}
              </div>
              <div class="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                <span class="text-xs sm:text-sm font-black text-gray-800 whitespace-nowrap max-w-[48px] sm:max-w-[90px] truncate">
                  {{ userStore.nickname }}
                </span>
                <ChevronDown class="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              </div>
            </button>

            <!-- User Menu Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-52 bg-white rounded-3xl shadow-xl border-2 border-orange-100 p-2 z-50 animate-pop-in space-y-1 max-w-[calc(100vw-1rem)]"
            >
              <div class="px-3 py-2 border-b border-gray-100">
                <div class="text-[10px] font-black text-gray-400 uppercase tracking-wider">已登录家长</div>
                <div class="text-xs font-black text-gray-900 truncate">{{ userStore.currentUserEmail }}</div>
              </div>

              <button
                @click="showUserMenu = false; userStore.openProfileModal()"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <span>👶</span>
                  <span>切换 / 管理宝贝 ({{ userStore.profiles.length }})</span>
                </div>
              </button>

              <button
                @click="navigateTo('/profile')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <User class="w-3.5 h-3.5 text-orange-500" />
                  <span>成长中心与学情</span>
                </div>
              </button>

              <!-- Mobile Quick Theme Switch -->
              <button
                @click="showUserMenu = false; showThemeDropdown = true"
                class="sm:hidden w-full text-left px-3 py-2 rounded-xl text-xs font-black text-amber-800 bg-amber-50/80 hover:bg-amber-100 flex items-center justify-between transition cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <Palette class="w-3.5 h-3.5 text-amber-600" />
                  <span>切换棋盘皮肤</span>
                </div>
              </button>

              <button
                v-if="userStore.isAdmin"
                @click="navigateTo('/admin')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-purple-700 bg-purple-50 hover:bg-purple-100 flex items-center justify-between transition cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <ShieldAlert class="w-3.5 h-3.5 text-purple-600" />
                  <span>管理后台系统 👑</span>
                </div>
              </button>

              <div class="pt-1 mt-1 border-t border-gray-100">
                <button
                  @click="handleLogout"
                  class="w-full text-left px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>账号设置 / 退出登录</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Unified Golden Reward Capsule (Stars & Coins) -->
          <div
            v-if="userStore.hasProfile"
            class="flex items-center bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300/80 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xs gap-1 sm:gap-2.5 text-[11px] sm:text-xs font-black text-amber-950 flex-shrink-0"
          >
            <div class="flex items-center gap-1" title="已收集星星">
              <Star class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400 drop-shadow-2xs flex-shrink-0" />
              <span>{{ userStore.totalStars }}</span>
            </div>
            <div class="w-px h-3 bg-amber-300/80"></div>
            <div class="flex items-center gap-1" title="金币余额">
              <Coins class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 drop-shadow-2xs flex-shrink-0" />
              <span>{{ userStore.coins }}</span>
            </div>
          </div>

          <!-- Sound Toggle Button -->
          <button
            @click="toggleSound"
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border border-orange-200/80 bg-white/90 hover:bg-orange-50 text-gray-600 transition active:scale-90 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs"
            :title="userStore.soundEnabled ? '音效已开启（点击静音）' : '音效已静音（点击开启）'"
          >
            <Volume2 v-if="userStore.soundEnabled" class="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600" />
            <VolumeX v-else class="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400" />
          </button>

          <!-- Theme Dropdown Button (Desktop / Tablet only, hidden on mobile to prevent overflow) -->
          <div ref="themeDropdownRef" class="relative hidden sm:block flex-shrink-0">
            <button
              @click.stop="showThemeDropdown = !showThemeDropdown"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border border-orange-200/80 bg-white/90 hover:bg-orange-50 text-amber-600 transition active:scale-90 flex items-center justify-center cursor-pointer relative z-50 flex-shrink-0 shadow-xs"
              title="切换已解锁的棋盘皮肤"
            >
              <Palette class="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <!-- Theme Dropdown Menu (Desktop) -->
            <div
              v-if="showThemeDropdown"
              class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-2 z-50 animate-pop-in space-y-1 max-w-[calc(100vw-1rem)]"
            >
              <div class="text-[10px] font-black text-gray-400 px-2 py-1 uppercase tracking-wider">
                选择棋盘皮肤
              </div>

              <button
                v-for="item in SHOP_THEMES"
                :key="item.id"
                @click.stop="selectOrBuyTheme(item)"
                class="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center justify-between transition cursor-pointer"
                :class="
                  userStore.theme === item.id
                    ? 'bg-orange-50 text-orange-600'
                    : isThemeUnlocked(item.id)
                    ? 'hover:bg-amber-50 text-gray-800'
                    : 'text-gray-400 hover:bg-gray-50'
                "
              >
                <div class="flex items-center gap-1.5 truncate">
                  <span>{{ item.icon }}</span>
                  <span class="truncate">{{ item.name }}</span>
                </div>

                <span v-if="userStore.theme === item.id" class="text-orange-500 font-black">✓</span>
                <span v-else-if="!isThemeUnlocked(item.id)" class="text-[10px] text-amber-600 flex items-center gap-0.5">
                  <Lock class="w-3 h-3" />
                  <span>{{ item.price }}币</span>
                </span>
              </button>

              <div class="pt-1.5 mt-1 border-t border-gray-100">
                <button
                  type="button"
                  @click.stop="goToShop"
                  class="w-full py-1.5 px-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <ShoppingBag class="w-3.5 h-3.5" />
                  <span>前往装扮商城</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- Mobile Bottom Navigation Bar (📱 手机端固定底部快捷导航栏 5 大核心) -->
  <nav v-if="!route.path.startsWith('/lesson/')" class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-orange-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none">
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

