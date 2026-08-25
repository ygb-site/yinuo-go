<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useFontStore } from '../stores/useFontStore';
import {
  AppIcon,
  type IconName
} from '../design-system';
import Footer from '../components/Footer.vue';
import UserMenuDropdown from '../components/common/UserMenuDropdown.vue';
import { ShieldCheck, Type } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const fontStore = useFontStore();

interface NavTab {
  id: 'today' | 'learn' | 'play' | 'me' | 'lab';
  label: string;
  shortLabel: string;
  path: string;
  icon: IconName;
  badge?: string;
  desktopOnly?: boolean;
}

const navTabs: NavTab[] = [
  { id: 'today', label: '今天', shortLabel: '今天', path: '/', icon: 'compass' },
  { id: 'learn', label: '少儿围棋', shortLabel: '围棋', path: '/learn', icon: 'book', badge: '核心' },
  { id: 'play', label: '创建对局', shortLabel: '对局', path: '/match', icon: 'gamepad', badge: '热门' },
  { id: 'me', label: '成长档案', shortLabel: '我的', path: '/profile', icon: 'growth' },
  { id: 'lab', label: '模块清单', shortLabel: '模块', path: '/modules', icon: 'clipboard-list', badge: '整理', desktopOnly: true }
];

const desktopNavTabs = computed(() => navTabs);
const mobileNavTabs = computed(() => navTabs.filter((tab) => !tab.desktopOnly));

const currentSection = computed(() => {
  if (route.meta.section) {
    return route.meta.section as string;
  }
  const path = route.path;
  if (path === '/') return 'today';
  if (path.startsWith('/learn') || path.startsWith('/adventure') || path.startsWith('/lesson')) return 'learn';
  if (path.startsWith('/match') || path.startsWith('/puzzle') || path.startsWith('/checkers') || path.startsWith('/gomoku') || path.startsWith('/two-player')) return 'play';
  if (path.startsWith('/profile') || path.startsWith('/shop') || path.startsWith('/mistakes')) return 'me';
  if (path.startsWith('/modules')) return 'lab';
  return 'today';
});

const isTopLevelTab = computed(() => {
  return ['/', '/learn', '/match', '/puzzle', '/profile', '/modules'].includes(route.path);
});

const pageTitle = computed(() => {
  if (route.path === '/') return '学堂大厅';
  if (route.path.startsWith('/learn')) return '少儿围棋天地';
  if (route.path.startsWith('/match') || route.path.startsWith('/puzzle')) return '创建对局中心';
  if (route.path.startsWith('/profile')) return '成长中心';
  if (route.path.startsWith('/modules')) return '模块清单';
  return (route.meta.label as string) || (route.meta.title as string) || '一诺未来学堂';
});

const navigateTo = (path: string) => {
  if (route.path !== path) {
    router.push(path);
  }
};

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};

const goToParentDashboard = () => {
  router.push('/parent-dashboard');
};

const openFontStudio = () => {
  fontStore.openModal();
};

const mainScrollRef = ref<HTMLElement | null>(null);

watch(
  () => route.fullPath,
  () => {
    nextTick(() => {
      mainScrollRef.value?.scrollTo({ top: 0, left: 0 });
    });
  },
  { immediate: true }
);
</script>

<template>
  <div class="h-screen overflow-hidden overscroll-none flex bg-[#F6F3EB] text-slate-800 font-sans antialiased select-none">
      <!-- 🖥️ Desktop Left Navigation Sidebar (≥ 1024px)。平板竖屏走底栏，避免侧栏占宽把内容挤扁 -->
      <aside class="hidden lg:flex flex-col justify-between w-56 xl:w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 p-4 xl:p-5 shrink-0 h-screen sticky top-0 z-10 shadow-xs overflow-y-auto">
        <div class="space-y-6">
          <!-- App Brand Logo -->
          <div class="flex items-center gap-3 px-2 cursor-pointer group" @click="navigateTo('/')">
            <div class="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl lg:text-2xl shadow-sm group-hover:scale-105 transition-transform shrink-0">
              🌱
            </div>
            <div class="min-w-0">
              <div class="text-base lg:text-lg font-bold text-slate-900 tracking-tight leading-tight">一诺未来学堂</div>
              <div class="text-[10px] lg:text-[11px] text-amber-800 font-semibold tracking-wider">Personal Learning OS</div>
            </div>
          </div>

          <!-- Main Nav List -->
          <nav class="space-y-1.5" aria-label="Desktop Navigation">
            <button
              v-for="tab in desktopNavTabs"
              :key="tab.id"
              type="button"
              :class="[
                'w-full flex items-center justify-between px-3.5 lg:px-4 py-2.5 lg:py-3 rounded-2xl text-xs lg:text-sm font-bold transition-all duration-200 cursor-pointer text-left',
                currentSection === tab.id
                  ? 'bg-amber-100/90 text-amber-950 shadow-xs border border-amber-300/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              ]"
              @click="navigateTo(tab.path)"
            >
              <div class="flex items-center gap-2.5 lg:gap-3">
                <AppIcon :name="tab.icon" size="md" :tone="currentSection === tab.id ? 'brand' : 'muted'" />
                <span>{{ tab.label }}</span>
              </div>

              <span
                v-if="tab.badge"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="currentSection === tab.id ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'"
              >
                {{ tab.badge }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Bottom Sidebar: Font Center & Parent Gate -->
        <div class="pt-4 border-t border-slate-100 space-y-2.5">
          <!-- Font Studio Trigger -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-3 lg:px-3.5 py-2.5 rounded-2xl text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
            @click="openFontStudio"
            title="选择页面字体与大小排版"
          >
            <div class="flex items-center gap-2">
              <Type class="w-4 h-4 text-amber-600 shrink-0" />
              <span>字体中心 (换字体)</span>
            </div>
            <span class="text-amber-500 text-[10px] bg-white px-1.5 py-0.5 rounded-md border border-amber-200 font-bold">Aa</span>
          </button>

          <!-- Parent Gate -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-3 lg:px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
            @click="goToParentDashboard"
          >
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-blue-600 shrink-0" />
              <span class="truncate">家长学情空间</span>
            </div>
            <span class="text-slate-400">→</span>
          </button>
        </div>
      </aside>

      <!-- 📱 Main Body Column -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Top App Header -->
        <header v-if="!route.meta.hideShellHeader" class="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-14 md:h-16 px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
          <!-- Left: Back Button or Section Name -->
          <div class="flex items-center gap-3 min-w-0">
            <button
              v-if="!isTopLevelTab"
              type="button"
              class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer shrink-0"
              aria-label="返回上一页"
              @click="handleBack"
            >
              <AppIcon name="back" size="sm" />
            </button>
            <div v-else class="lg:hidden flex items-center gap-2 shrink-0">
              <span class="text-2xl">🌱</span>
            </div>

            <h1 class="text-base md:text-lg font-bold text-slate-800 truncate tracking-tight">
              {{ pageTitle }}
            </h1>
          </div>

          <!-- Right: Font Studio, Coins, Stars, Profile Avatar -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <!-- Quick Font Switcher Button -->
            <button
              type="button"
              class="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300/80 rounded-full text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
              @click="openFontStudio"
              title="切换字体与字号"
            >
              <Type class="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>字体</span>
            </button>

            <!-- Coins Pill -->
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/90 rounded-full text-xs font-black text-amber-900 shadow-2xs">
              <span>🪙</span>
              <span>{{ userStore.coins }}</span>
            </div>

            <!-- Stars Pill -->
            <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/60 border border-amber-200 rounded-full text-xs font-black text-amber-900">
              <span>⭐</span>
              <span>{{ userStore.totalStars }}</span>
            </div>

            <UserMenuDropdown />
          </div>
        </header>

        <!-- Dynamic Main View Slot -->
        <main ref="mainScrollRef" class="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-20 lg:pb-0">
          <slot />
          <Footer class="hidden lg:block border-t border-slate-200/40" />
        </main>
      </div>

    <!-- 📱 Phone & Tablet Bottom Navigation Bar (< 1024px) -->
    <nav
      class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Bottom Navigation"
    >
      <button
        v-for="tab in mobileNavTabs"
        :key="tab.id"
        type="button"
        :class="[
          'flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold transition-colors cursor-pointer select-none',
          currentSection === tab.id
            ? 'text-amber-600'
            : 'text-slate-400 hover:text-slate-700'
        ]"
        @click="navigateTo(tab.path)"
      >
        <AppIcon
          :name="tab.icon"
          size="sm"
          :tone="currentSection === tab.id ? 'brand' : 'muted'"
        />
        <span class="mt-0.5 text-xs">{{ tab.shortLabel }}</span>
      </button>
    </nav>
  </div>
</template>

