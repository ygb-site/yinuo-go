<script setup lang="ts">
import { ref, computed } from 'vue';
import { SHOP_THEMES, SHOP_AVATARS, type ShopThemeItem, type ShopAvatarItem } from '../data/shopData';
import { GoGame } from '../engine/GoGame';
import type { ThemeType } from '../engine/types';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound, playErrorSound, triggerConfetti } from '../lib/audio';
import GoBoard from '../components/board/GoBoard.vue';
import {
  Palette,
  Coins,
  Check,
  ShoppingBag,
  User
} from 'lucide-vue-next';

const userStore = useUserStore();

const activeTab = ref<'themes' | 'avatars'>('themes');
const previewTheme = ref<ThemeType>(userStore.theme);

const previewGame = computed(() => {
  const g = new GoGame(5);
  g.setCell(2, 2, 'B');
  g.setCell(1, 1, 'W');
  g.setCell(1, 3, 'W');
  g.setCell(3, 1, 'B');
  g.setCell(3, 3, 'B');
  return g;
});

const isThemeUnlocked = (id: ThemeType) => {
  return userStore.unlockedThemes.includes(id) || id === 'wood';
};

const isAvatarUnlocked = (avatarChar: string) => {
  return userStore.unlockedAvatars.includes(avatarChar);
};

const handleSelectOrBuyTheme = (item: ShopThemeItem) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }

  if (isThemeUnlocked(item.id)) {
    userStore.setTheme(item.id);
    previewTheme.value = item.id;
    playButtonSound();
  } else {
    if (userStore.coins < item.price) {
      playErrorSound();
      alert('金币不足哦！快去每日死活或闯关中赢取金币吧！');
      return;
    }
    const ok = userStore.buyTheme(item.id, item.price);
    if (ok) {
      previewTheme.value = item.id;
      triggerConfetti();
    }
  }
};

const handleSelectOrBuyAvatar = (item: ShopAvatarItem) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }

  if (isAvatarUnlocked(item.avatar)) {
    userStore.currentProfile.avatar = item.avatar;
    userStore.touchSave();
    playButtonSound();
  } else {
    if (userStore.coins < item.price) {
      playErrorSound();
      alert('金币不足哦！快去每日死活或闯关中赢取金币吧！');
      return;
    }
    userStore.buyAvatar(item.avatar, item.price);
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center md:text-left">
          <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
            <ShoppingBag class="w-3.5 h-3.5 text-amber-700" />
            <span>金币装扮商城 (Go Shop & Themes)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            萌趣皮肤与装扮工坊
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            用闯关和死活挑战赢取的金币兑换专属棋盘皮肤与可爱头像，打造独一无二的下棋风格！
          </p>
        </div>

        <!-- Coins Pill -->
        <div class="flex items-center gap-2 bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-2xs">
          <Coins class="w-7 h-7 text-amber-500" />
          <div>
            <div class="text-[10px] font-extrabold text-amber-700">当前金币余额</div>
            <div class="text-2xl font-black text-amber-900 font-mono">{{ userStore.coins }}</div>
          </div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex items-center justify-center">
        <div class="bg-amber-100/70 p-1.5 rounded-2xl border border-orange-200 shadow-inner flex items-center gap-1">
          <button
            @click="activeTab = 'themes'"
            class="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
            :class="activeTab === 'themes' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
          >
            <Palette class="w-4 h-4" />
            <span>🎨 棋盘主题皮肤</span>
          </button>
          <button
            @click="activeTab = 'avatars'"
            class="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
            :class="activeTab === 'avatars' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-600'"
          >
            <User class="w-4 h-4" />
            <span>🐼 萌宠形象头像</span>
          </button>
        </div>
      </div>

      <!-- Tab 1: Themes Grid + Live Board Preview -->
      <div v-if="activeTab === 'themes'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
        
        <!-- Left: Themes Card Grid (7 cols) -->
        <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="item in SHOP_THEMES"
            :key="item.id"
            @click="previewTheme = item.id"
            class="bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between group hover:shadow-md"
            :class="
              userStore.theme === item.id
                ? 'border-orange-500 ring-2 ring-orange-300 shadow-sm'
                : previewTheme === item.id
                ? 'border-amber-300'
                : 'border-gray-100 hover:border-orange-200'
            "
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-3xl">{{ item.icon }}</span>
                <span
                  v-if="userStore.theme === item.id"
                  class="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                >
                  <Check class="w-3 h-3" /> 使用中
                </span>
                <span
                  v-else-if="isThemeUnlocked(item.id)"
                  class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full"
                >
                  已拥有
                </span>
                <span
                  v-else
                  class="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1"
                >
                  <Coins class="w-3 h-3 text-amber-600" />
                  <span>{{ item.price }} 金币</span>
                </span>
              </div>

              <h3 class="font-cartoon font-bold text-base text-gray-900">{{ item.name }}</h3>
              <p class="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{{ item.desc }}</p>
            </div>

            <div class="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                @click.stop="handleSelectOrBuyTheme(item)"
                class="w-full py-2 rounded-xl text-xs font-black transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                :class="
                  userStore.theme === item.id
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : isThemeUnlocked(item.id)
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                "
              >
                <span v-if="userStore.theme === item.id">当前已装备</span>
                <span v-else-if="isThemeUnlocked(item.id)">一键装备此主题</span>
                <span v-else>立即兑换 ({{ item.price }} 金币)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Live Preview Board (5 cols) -->
        <div class="lg:col-span-5 bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-sm space-y-3">
          <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between">
            <span>实盘效果实时预览</span>
            <span class="text-orange-600 font-black">
              {{ SHOP_THEMES.find(t => t.id === previewTheme)?.name }}
            </span>
          </div>

          <GoBoard
            :game="previewGame"
            :readonly="true"
            :showLiberties="true"
            :showAtari="true"
            :theme="previewTheme"
            :sizePx="380"
          />
        </div>

      </div>

      <!-- Tab 2: Avatars Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 animate-fade-in">
        <div
          v-for="item in SHOP_AVATARS"
          :key="item.id"
          @click="handleSelectOrBuyAvatar(item)"
          class="bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer text-center space-y-2 group hover:shadow-md active:scale-95 relative"
          :class="
            userStore.avatar === item.avatar
              ? 'border-orange-500 ring-2 ring-orange-300 shadow-sm bg-orange-50/40'
              : isAvatarUnlocked(item.avatar)
              ? 'border-emerald-200 hover:border-emerald-400'
              : 'border-gray-100 hover:border-orange-200'
          "
        >
          <div class="w-16 h-16 rounded-2xl bg-amber-50 border border-orange-200 flex items-center justify-center text-3xl mx-auto shadow-inner group-hover:scale-110 transition-transform">
            {{ item.avatar }}
          </div>

          <div>
            <div class="font-cartoon font-bold text-sm text-gray-900">{{ item.name }}</div>
            <div class="text-[10px] text-gray-500 font-medium line-clamp-1 mt-0.5">{{ item.desc }}</div>
          </div>

          <div class="pt-2 border-t border-gray-100">
            <span
              v-if="userStore.avatar === item.avatar"
              class="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full inline-block"
            >
              ✓ 当前使用中
            </span>
            <span
              v-else-if="isAvatarUnlocked(item.avatar)"
              class="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block"
            >
              点击换上
            </span>
            <span
              v-else
              class="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
            >
              <Coins class="w-2.5 h-2.5 text-amber-600" />
              <span>{{ item.price }} 金币</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

