<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import { AppAvatar } from '../../design-system';
import { signOutCloud } from '../../services/cloudSyncService';
import { playButtonSound } from '../../lib/audio';
import { showAlert } from '../../utils/alert';
import {
  User,
  UserCheck,
  BarChart3,
  ShoppingBag,
  ShieldAlert,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const unresolvedMistakeCount = computed(() => {
  return (userStore.mistakeRecords || []).filter((m) => !m.resolved).length;
});

const close = () => {
  isOpen.value = false;
};

const toggle = () => {
  playButtonSound();
  isOpen.value = !isOpen.value;
};

const onDocPointerDown = (event: PointerEvent) => {
  if (!rootRef.value) return;
  if (!rootRef.value.contains(event.target as Node)) {
    close();
  }
};

const goTo = (path: string) => {
  close();
  playButtonSound();
  if (path !== '/' && !userStore.requireLogin()) return;
  if (route.path !== path) {
    router.push(path);
  }
};

const openProfiles = () => {
  close();
  playButtonSound();
  userStore.openProfileModal();
};

const openLogin = () => {
  playButtonSound();
  userStore.openAuthModal();
};

const handleLogout = async () => {
  close();
  playButtonSound();
  await signOutCloud();
  userStore.clearCloudUser();
  showAlert({
    title: '已退出登录',
    message: '账号已安全退出，随时可再次登录继续学棋！',
    type: 'info'
  });
  if (route.path !== '/') {
    router.push('/');
  }
};

watch(
  () => route.fullPath,
  () => {
    close();
  }
);

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown);
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown);
});
</script>

<template>
  <!-- 未登录：直接打开登录 -->
  <button
    v-if="!userStore.isLoggedIn"
    type="button"
    class="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white border border-amber-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl cursor-pointer shadow-sm transition transform active:scale-95 text-[11px] sm:text-xs font-black whitespace-nowrap"
    @click="openLogin"
  >
    <LogIn class="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
    <span>登录</span>
  </button>

  <!-- 已登录但还没有宝贝档案 -->
  <button
    v-else-if="!userStore.hasProfile"
    type="button"
    class="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border border-emerald-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl cursor-pointer shadow-sm transition transform active:scale-95 text-[11px] sm:text-xs font-black whitespace-nowrap"
    @click="openProfiles"
  >
    <UserPlus class="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
    <span>建宝贝</span>
  </button>

  <!-- 已登录且有档案：自定义用户中心下拉 -->
  <div v-else ref="rootRef" class="relative shrink-0">
    <button
      type="button"
      class="flex items-center gap-1 sm:gap-1.5 bg-amber-50/90 hover:bg-amber-100 border border-orange-200 pl-0.5 pr-1.5 sm:pr-2 py-0.5 sm:py-1 rounded-full cursor-pointer transition shadow-2xs"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      aria-label="打开用户中心"
      @click.stop="toggle"
    >
      <AppAvatar
        :emoji="userStore.avatar || '🐼'"
        :name="userStore.nickname"
        size="sm"
      />
      <span class="hidden sm:inline text-[11px] sm:text-xs font-black text-gray-800 max-w-[80px] truncate">
        {{ userStore.nickname }}
      </span>
      <ChevronDown
        class="w-3 h-3 text-orange-400 shrink-0 transition-transform duration-fast"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <div
      v-if="isOpen"
      role="menu"
      class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-orange-100 p-2 z-popover"
    >
      <div class="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
        <span class="text-2xl leading-none">{{ userStore.avatar }}</span>
        <div class="min-w-0 flex-1">
          <div class="font-black text-slate-800 truncate text-xs">{{ userStore.nickname }}</div>
          <div class="text-[10px] text-amber-600 font-bold">{{ userStore.currentRank.title }}</div>
        </div>
      </div>

      <div class="py-1 space-y-0.5">
        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
          @click="openProfiles"
        >
          <User class="w-4 h-4 text-orange-500 shrink-0" />
          <span>切换宝贝档案</span>
        </button>

        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-slate-700 flex items-center justify-between transition-colors cursor-pointer text-xs font-bold"
          @click="goTo('/mistakes')"
        >
          <div class="flex items-center gap-2 min-w-0">
            <BookMarked class="w-4 h-4 text-rose-500 shrink-0" />
            <span>智能错题本</span>
          </div>
          <span
            v-if="unresolvedMistakeCount > 0"
            class="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black"
          >
            {{ unresolvedMistakeCount }}
          </span>
        </button>

        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 rounded-xl text-left hover:bg-blue-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
          @click="goTo('/parent-dashboard')"
        >
          <BarChart3 class="w-4 h-4 text-blue-500 shrink-0" />
          <span>家长学情看板</span>
        </button>

        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
          @click="goTo('/profile')"
        >
          <UserCheck class="w-4 h-4 text-emerald-500 shrink-0" />
          <span>成长中心</span>
        </button>

        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
          @click="goTo('/shop')"
        >
          <ShoppingBag class="w-4 h-4 text-purple-500 shrink-0" />
          <span>装扮商城</span>
        </button>

        <button
          v-if="userStore.isAdmin"
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
          @click="goTo('/admin')"
        >
          <ShieldAlert class="w-4 h-4 shrink-0" />
          <span>管理后台</span>
        </button>
      </div>

      <div class="pt-1 border-t border-gray-100">
        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors text-[11px] font-bold cursor-pointer"
          @click="handleLogout"
        >
          <LogOut class="w-3.5 h-3.5 shrink-0" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  </div>
</template>
