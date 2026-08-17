<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound } from '../lib/audio';
import ProfileSwitcherModal from './common/ProfileSwitcherModal.vue';
import {
  Volume2,
  VolumeX,
  Palette,
  Coins,
  Star,
  Menu,
  X,
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

const mobileMenuOpen = ref(false);
const showThemeDropdown = ref(false);
const showProfileModal = ref(false);

const navItems = [
  { path: '/', name: '首页', icon: Compass },
  { path: '/learn', name: '趣味闯关', icon: Gamepad2 },
  { path: '/tsumego', name: '每日死活', icon: Puzzle },
  { path: '/ai-match', name: '人机对弈', icon: Bot },
  { path: '/free-board', name: '自由打谱', icon: Grid },
  { path: '/dictionary', name: '术语字典', icon: BookMarked },
  { path: '/profile', name: '成长中心', icon: UserCheck }
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
  mobileMenuOpen.value = false;
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
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs select-none">
    <div class="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
      <div class="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
        
        <!-- Left: Brand Logo & Title -->
        <div
          @click="navigateTo('/')"
          class="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          title="返回首页"
        >
          <div
            class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-sm flex items-center justify-center border-2 border-white group-hover:rotate-6 transition-transform flex-shrink-0"
          >
            <span class="text-2xl">🐼</span>
          </div>
          <div class="flex flex-col justify-center">
            <div class="flex items-center gap-1.5">
              <span class="text-xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent leading-none whitespace-nowrap">
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

        <!-- Center: Capsule Navigation Tabs (Clean, non-wrapping, perfectly bounded) -->
        <nav class="hidden lg:flex items-center bg-amber-50/80 border border-orange-200/80 p-1 rounded-2xl shadow-inner gap-0.5 xl:gap-1 flex-shrink-0">
          <button
            v-for="item in navItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            class="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0"
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
            @click="showProfileModal = true"
            class="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-300/80 px-2.5 sm:px-3 py-1.5 rounded-2xl cursor-pointer shadow-2xs transition transform active:scale-95 flex-shrink-0"
            title="点击切换当前宝贝档案"
          >
            <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm shadow-inner border border-orange-200 flex-shrink-0">
              {{ userStore.avatar }}
            </div>
            <div class="flex items-center gap-1 whitespace-nowrap">
              <span class="text-xs sm:text-sm font-black text-gray-800 whitespace-nowrap max-w-[80px] sm:max-w-[100px] truncate">
                {{ userStore.nickname }}
              </span>
              <ChevronDown class="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            </div>
          </div>

          <!-- Mode B: No Profile Exists -> Create Profile Action Button -->
          <button
            v-else
            @click="showProfileModal = true"
            class="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border border-amber-300 px-3 py-1.5 rounded-2xl cursor-pointer shadow-sm transition transform active:scale-95 flex-shrink-0 text-xs font-black"
            title="点击创建宝贝档案"
          >
            <UserPlus class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="whitespace-nowrap">创建宝贝档案</span>
          </button>

          <!-- Stars & Coins (Only when profile exists) -->
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
            class="w-9 h-9 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition active:scale-90 flex items-center justify-center flex-shrink-0"
            :title="userStore.soundEnabled ? '音效已开启（点击静音）' : '音效已静音（点击开启）'"
          >
            <Volume2 v-if="userStore.soundEnabled" class="w-4 h-4 text-emerald-600" />
            <VolumeX v-else class="w-4 h-4 text-gray-400" />
          </button>

          <!-- Theme Dropdown Button -->
          <div class="relative flex-shrink-0">
            <button
              @click="showThemeDropdown = !showThemeDropdown"
              class="w-9 h-9 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-amber-600 transition active:scale-90 flex items-center justify-center"
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
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-amber-50 text-amber-900 transition"
              >
                <span>🪵 原木经典</span>
                <span v-if="userStore.theme === 'wood'">✓</span>
              </button>
              <button
                @click="selectTheme('candy')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-pink-50 text-pink-700 transition"
              >
                <span>🍬 糖果梦境</span>
                <span v-if="userStore.theme === 'candy'">✓</span>
              </button>
              <button
                @click="selectTheme('jade')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-emerald-50 text-emerald-800 transition"
              >
                <span>🍵 翡翠温玉</span>
                <span v-if="userStore.theme === 'jade'">✓</span>
              </button>
              <button
                @click="selectTheme('neon')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between hover:bg-slate-50 text-slate-800 transition"
              >
                <span>🌌 赛博星空</span>
                <span v-if="userStore.theme === 'neon'">✓</span>
              </button>
            </div>
          </div>

          <!-- Mobile Hamburger Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden w-9 h-9 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
            title="展开菜单"
          >
            <X v-if="mobileMenuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer Menu -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden bg-white border-t border-orange-100 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fade-in"
    >
      <div v-if="userStore.hasProfile" class="flex items-center justify-around py-2.5 mb-2 bg-orange-50 rounded-2xl border border-orange-200">
        <div class="flex items-center gap-1.5">
          <Star class="w-4 h-4 text-amber-500 fill-current" />
          <span class="text-xs font-black text-amber-900">星星: {{ userStore.totalStars }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Coins class="w-4 h-4 text-amber-500" />
          <span class="text-xs font-black text-amber-900">金币: {{ userStore.coins }}</span>
        </div>
      </div>

      <button
        v-for="item in navItems"
        :key="item.path"
        @click="navigateTo(item.path)"
        class="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-black transition"
        :class="
          isNavActive(item.path)
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
            : 'text-gray-700 hover:bg-orange-50'
        "
      >
        <div class="flex items-center gap-3">
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.name }}</span>
        </div>
        <span class="text-xs opacity-75 font-bold">进入 →</span>
      </button>
    </div>

    <!-- Profile Switcher / Creation Modal -->
    <ProfileSwitcherModal
      :isOpen="showProfileModal"
      @close="showProfileModal = false"
    />
  </header>
</template>

