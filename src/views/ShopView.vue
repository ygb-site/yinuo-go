<script setup lang="ts">
import { useRouter } from 'vue-router';
import { SHOP_AVATARS, type ShopAvatarItem } from '../data/shopData';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound } from '../lib/audio';
import { showAlert } from '../utils/alert';
import {
  Coins,
  ShoppingBag,
  ArrowLeft
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const goBack = () => {
  playButtonSound();
  router.push('/profile');
};

const isAvatarUnlocked = (avatarChar: string) => {
  return userStore.unlockedAvatars.includes(avatarChar);
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
    return;
  }

  if (userStore.coins < item.price) {
    showAlert({ message: '金币余额不足哦！快去每日死活、极速乐园或闯关中赢取金币吧！', type: 'coin' });
    return;
  }
  userStore.buyAvatar(item.avatar, item.price);
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center md:text-left">
          <div class="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <button
              @click="goBack"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-black transition active:scale-95 cursor-pointer border border-orange-200 shadow-2xs"
              title="返回成长中心"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>返回成长中心</span>
            </button>
            <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
              <ShoppingBag class="w-3.5 h-3.5 text-amber-700" />
              <span>金币装扮商城</span>
            </div>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            萌宠头像工坊
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            用闯关和死活挑战赢取的金币兑换可爱头像，给宝贝换上专属形象！
          </p>
        </div>

        <div class="flex items-center gap-2 bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-2xs">
          <Coins class="w-7 h-7 text-amber-500" />
          <div>
            <div class="text-[10px] font-extrabold text-amber-700">当前金币余额</div>
            <div class="text-2xl font-black text-amber-900 font-mono">{{ userStore.coins }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
