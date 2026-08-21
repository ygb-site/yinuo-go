<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound } from '../lib/audio';
import {
  Volume2,
  VolumeX,
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
  LogIn,
  ShieldAlert,
  LogOut,
  User,
  Sparkles,
  BookMarked
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

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
watch(() => route.fullPath, () => {
  showUserMenu.value = false;
  showThemeDropdown.value = false;
});

// Multi-Subject Navigation Tabs
const navItems = [
  { path: '/', name: '学堂大厅', shortName: '大厅', icon: Compass, badge: '全科' },
  { path: '/learn', name: '围棋馆', shortName: '围棋', icon: Gamepad2, badge: '奕学' },
  { path: '/subject/math', name: '数理馆', shortName: '数学', icon: Flame, badge: '启思' },
  { path: '/subject/chinese', name: '语文馆', shortName: '语文', icon: Swords, badge: '博雅' },
  { path: '/subject/english', name: '英语馆', shortName: '英语', icon: Sparkles, badge: '灵犀' },
  { path: '/profile', name: '成长中心', shortName: '我的', icon: UserCheck, badge: '' }
];

const toggleSound = () => {
  userStore.toggleSound();
  playButtonSound();
};

const navigateTo = (path: string) => {
  showUserMenu.value = false;
  showThemeDropdown.value = false;
  playButtonSound();
  router.push(path);
};

const openProfileSwitcher = () => {
  showUserMenu.value = false;
  userStore.openProfileModal();
};

const handleLogout = async () => {
  showUserMenu.value = false;
  userStore.clearCloudUser();
  playButtonSound();
  router.push('/');
};

const isNavActive = (itemPath: string) => {
  if (itemPath === '/') return route.path === '/';
  if (itemPath === '/learn') {
    return (
      route.path === '/learn' ||
      route.path.startsWith('/lesson') ||
      route.path.startsWith('/adventure') ||
      route.path === '/dictionary' ||
      route.path === '/rhymes' ||
      route.path === '/practice' ||
      route.path === '/battle' ||
      route.path === '/tsumego' ||
      route.path === '/arcade' ||
      route.path === '/capture-go' ||
      route.path === '/two-player' ||
      route.path === '/ai-match' ||
      route.path === '/rank-exam' ||
      route.path === '/worksheet' ||
      route.path === '/free-board' ||
      route.path === '/mistakes'
    );
  }
  if (itemPath === '/subject/math') {
    return route.path.startsWith('/subject/math');
  }
  if (itemPath === '/subject/chinese') {
    return route.path.startsWith('/subject/chinese');
  }
  if (itemPath === '/subject/english') {
    return route.path.startsWith('/subject/english');
  }
  if (itemPath === '/profile') {
    return route.path === '/profile' || route.path === '/shop';
  }
  return route.path === itemPath;
};
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs select-none">
    <div class="max-w-7xl mx-auto px-2.5 sm:px-5 lg:px-6">
      <div class="flex items-center justify-between h-14 sm:h-18 gap-1.5 sm:gap-4">
        
        <!-- Left: Brand Logo & Title -->
        <div
          @click="navigateTo('/')"
          class="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          title="返回学堂大厅"
        >
          <div
            class="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-sm flex items-center justify-center border-2 border-white group-hover:rotate-6 transition-transform flex-shrink-0 overflow-hidden"
          >
            <img src="/logo/logo-avatar-circle-144.png" alt="一诺未来学堂" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col justify-center">
            <div class="flex items-center gap-1.5 leading-none">
              <span class="text-lg sm:text-2xl font-cartoon font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent whitespace-nowrap tracking-wide sm:tracking-wider">
                一诺未来学堂
              </span>
              <span class="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-2xs tracking-wider whitespace-nowrap">
                EDU
              </span>
            </div>
            <span class="hidden sm:block text-[10px] font-bold text-gray-400 leading-tight whitespace-nowrap mt-0.5">
              多元启蒙 · 围棋 / 数理 / 语文 / 英语
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

        <!-- Right: Actions, Coins, User Profile -->
        <div class="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          
          <button
            v-if="!userStore.isLoggedIn"
            @click="userStore.openAuthModal()"
            class="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white border border-amber-300 px-3 py-1.5 rounded-2xl cursor-pointer shadow-sm transition transform active:scale-95 text-xs font-black"
          >
            <LogIn class="w-3.5 h-3.5 flex-shrink-0" />
            <span>登录 / 注册</span>
          </button>

          <button
            v-else-if="!userStore.hasProfile"
            @click="userStore.openProfileModal()"
            class="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border border-emerald-300 px-3 py-1.5 rounded-2xl cursor-pointer shadow-sm transition transform active:scale-95 text-xs font-black"
          >
            <UserPlus class="w-3.5 h-3.5 flex-shrink-0" />
            <span>创建宝贝</span>
          </button>

          <div v-else ref="userMenuRef" class="relative flex-shrink-0">
            <button
              type="button"
              @click.stop="showUserMenu = !showUserMenu"
              class="flex items-center gap-1 sm:gap-1.5 bg-amber-50/90 hover:bg-amber-100/90 border border-orange-200 pl-1 sm:pl-1.5 pr-2 py-0.5 sm:py-1 rounded-full cursor-pointer transition shadow-2xs group"
            >
              <span class="text-base sm:text-lg select-none group-hover:scale-110 transition-transform">
                {{ userStore.avatar }}
              </span>
              <span class="text-xs font-black text-gray-800 max-w-[60px] sm:max-w-[80px] truncate">
                {{ userStore.nickname }}
              </span>
              <ChevronDown class="w-3 h-3 text-orange-400" />
            </button>

            <!-- User Menu Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-orange-100 p-2 z-50 animate-fade-in text-xs font-bold"
            >
              <div class="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                <span class="text-2xl">{{ userStore.avatar }}</span>
                <div class="min-w-0 flex-1">
                  <div class="font-black text-slate-800 truncate">{{ userStore.nickname }}</div>
                  <div class="text-[10px] text-amber-600">{{ userStore.currentRank.title }}</div>
                </div>
              </div>

              <div class="py-1 space-y-0.5">
                <button
                  @click="openProfileSwitcher"
                  class="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <User class="w-4 h-4 text-orange-500" />
                  <span>切换宝贝档案</span>
                </button>

                <button
                  @click="navigateTo('/mistakes')"
                  class="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-slate-700 flex items-center justify-between transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <BookMarked class="w-4 h-4 text-rose-500" />
                    <span>智能错题本</span>
                  </div>
                  <span
                    v-if="userStore.mistakeRecords && userStore.mistakeRecords.filter(m => !m.resolved).length > 0"
                    class="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black"
                  >
                    {{ userStore.mistakeRecords.filter(m => !m.resolved).length }}
                  </span>
                </button>

                <button
                  @click="navigateTo('/profile')"
                  class="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <UserCheck class="w-4 h-4 text-emerald-500" />
                  <span>成长中心 & 证书</span>
                </button>

                <button
                  @click="navigateTo('/shop')"
                  class="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-700 flex items-center gap-2 transition-colors"
                >
                  <ShoppingBag class="w-4 h-4 text-purple-500" />
                  <span>装扮商城</span>
                </button>

                <button
                  v-if="userStore.isAdmin"
                  @click="navigateTo('/admin')"
                  class="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors"
                >
                  <ShieldAlert class="w-4 h-4" />
                  <span>管理后台</span>
                </button>
              </div>

              <div class="pt-1 border-t border-gray-100">
                <button
                  @click="handleLogout"
                  class="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors text-[11px]"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Currency Pills (Coins & Stars) -->
          <div class="flex items-center gap-1 sm:gap-1.5">
            <div
              @click="navigateTo('/shop')"
              class="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 sm:px-2.5 py-1 rounded-full text-amber-700 text-xs font-black cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
              title="我的金币"
            >
              <Coins class="w-3.5 h-3.5 text-amber-500" />
              <span>{{ userStore.coins }}</span>
            </div>

            <div
              class="flex items-center gap-1 bg-amber-500/10 border border-amber-300 px-2 sm:px-2.5 py-1 rounded-full text-amber-600 text-xs font-black shadow-2xs"
              title="我的总星星"
            >
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{{ userStore.totalStars }}</span>
            </div>
          </div>

          <!-- Sound Toggle -->
          <button
            @click="toggleSound"
            class="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-transform active:scale-90"
            :title="userStore.soundEnabled ? '静音' : '开启音效'"
          >
            <Volume2 v-if="userStore.soundEnabled" class="w-4 h-4 text-emerald-600" />
            <VolumeX v-else class="w-4 h-4 text-slate-400" />
          </button>
        </div>

      </div>
    </div>
  </header>

  <!-- Mobile Bottom Navigation Bar (6 Tabs) -->
  <nav v-if="!route.path.includes('/lesson/')" class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-orange-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none">
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

