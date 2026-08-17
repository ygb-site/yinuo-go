<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/useUserStore';
import { BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
import { playButtonSound } from '../lib/audio';
import ProfileSwitcherModal from '../components/common/ProfileSwitcherModal.vue';
import {
  Trophy,
  Star,
  Coins,
  CheckCircle2,
  Users,
  RotateCcw,
  Download,
  Lock,
  Edit2,
  UserPlus
} from 'lucide-vue-next';

const userStore = useUserStore();

const showSwitcherModal = ref(false);
const isEditingName = ref(false);
const newNickname = ref(userStore.nickname);

const avatarList = ['🦁', '🐰', '🐼', '🐱', '🦊', '🐶', '🦄', '🐯', '🐨', '🤖', '🐵', '🐥'];

const saveNickname = () => {
  if (newNickname.value.trim() && userStore.hasProfile) {
    userStore.currentProfile.nickname = newNickname.value.trim();
  }
  isEditingName.value = false;
  playButtonSound();
};

const selectAvatar = (av: string) => {
  if (userStore.hasProfile) {
    userStore.currentProfile.avatar = av;
    playButtonSound();
  }
};

const isBadgeUnlocked = (badgeId: string): boolean => {
  return userStore.unlockedBadges.includes(badgeId);
};

const getRarityBadgeClass = (rarity: AchievementBadge['rarity']) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-amber-300';
    case 'epic':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'rare':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'common':
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const exportData = () => {
  playButtonSound();
  const data = {
    userStore: userStore.$state,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yinuo-go-backup-${userStore.nickname || 'kids'}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const confirmReset = () => {
  if (confirm(`确定要重置当前宝贝「${userStore.nickname}」的闯关进度与金币吗？`)) {
    userStore.resetCurrentProfileProgress();
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-8">

      <!-- Kid's Exclusive ID Card (宝贝专属名片) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-64 h-64 bg-orange-100/60 rounded-full blur-3xl pointer-events-none"></div>

        <div v-if="userStore.hasProfile" class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <!-- Avatar & Name -->
          <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div class="relative">
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-400 p-1.5 shadow-xl border-4 border-white flex items-center justify-center text-5xl sm:text-6xl animate-bounce-subtle">
                {{ userStore.avatar }}
              </div>
              <span class="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-white shadow">
                {{ userStore.currentRank.badge }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center gap-2 justify-center sm:justify-start">
                <div v-if="!isEditingName" class="flex items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-black text-gray-900">{{ userStore.nickname }}</h1>
                  <button @click="isEditingName = true" class="p-1 text-gray-400 hover:text-orange-500" title="修改昵称">
                    <Edit2 class="w-4 h-4" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <input
                    v-model="newNickname"
                    type="text"
                    maxlength="10"
                    class="px-3 py-1 rounded-xl border border-orange-300 text-sm font-bold text-gray-800 focus:outline-none"
                  />
                  <button @click="saveNickname" class="px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-xl">
                    保存
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2 text-xs sm:text-sm font-bold text-orange-600 justify-center sm:justify-start">
                <span>{{ userStore.currentRank.title }}</span>
                <span>•</span>
                <span>{{ userStore.currentRank.titleEn }}</span>
              </div>

              <!-- Quick Switch Profile Button -->
              <div class="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                <button
                  @click="showSwitcherModal = true"
                  class="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                >
                  <Users class="w-3.5 h-3.5" />
                  <span>切换宝贝 (共 {{ userStore.profiles.length }} 位)</span>
                </button>
              </div>

              <!-- Avatar Quick Selector -->
              <div class="flex items-center gap-1.5 pt-1.5 justify-center sm:justify-start overflow-x-auto">
                <button
                  v-for="av in avatarList.slice(0, 8)"
                  :key="av"
                  @click="selectAvatar(av)"
                  class="w-7 h-7 rounded-lg border text-sm flex items-center justify-center transition transform hover:scale-110 active:scale-95"
                  :class="userStore.avatar === av ? 'bg-orange-100 border-orange-500 shadow-2xs' : 'bg-gray-50 border-gray-200'"
                >
                  {{ av }}
                </button>
              </div>
            </div>
          </div>

          <!-- Currency & Rank Progress Panel -->
          <div class="flex flex-col gap-3 min-w-[240px] w-full sm:w-auto">
            <div class="flex items-center justify-around bg-orange-50/80 rounded-2xl p-4 border border-orange-200 shadow-2xs">
              <div class="text-center">
                <div class="text-[10px] font-extrabold text-amber-700">金币余额</div>
                <div class="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
                  <Coins class="w-4 h-4 text-amber-500" />
                  <span>{{ userStore.coins }}</span>
                </div>
              </div>
              <div class="w-px h-8 bg-orange-200"></div>
              <div class="text-center">
                <div class="text-[10px] font-extrabold text-rose-700">闯关星星</div>
                <div class="text-xl font-black text-rose-900 flex items-center justify-center gap-1">
                  <Star class="w-4 h-4 text-rose-500 fill-current" />
                  <span>{{ userStore.totalStars }}</span>
                </div>
              </div>
            </div>

            <!-- EXP Bar -->
            <div class="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-1.5">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-gray-600">段位棋力 (XP)</span>
                <span class="text-orange-600 font-black">
                  {{ userStore.exp }} <span v-if="userStore.nextRank">/ {{ userStore.nextRank.minExp }}</span> XP
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all"
                  :style="{ width: `${userStore.rankProgressPercent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State (No Profile Yet) -->
        <div v-else class="relative z-10 py-6 text-center space-y-4">
          <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-400 p-1 shadow-md flex items-center justify-center text-4xl">
            👶
          </div>
          <div class="space-y-1">
            <h2 class="text-2xl font-black text-gray-900">欢迎来到成长中心！</h2>
            <p class="text-xs sm:text-sm text-gray-500 font-bold max-w-md mx-auto">
              创建宝贝档案后，每一个孩子的闯关星星、成就勋章与段位棋力都将独立隔离保存在本设备中。
            </p>
          </div>
          <button
            @click="showSwitcherModal = true"
            class="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2"
          >
            <UserPlus class="w-4 h-4" />
            <span>创建第一位宝贝档案 🚀</span>
          </button>
        </div>
      </div>

      <!-- Badge Showcase (徽章陈列室) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm space-y-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Trophy class="w-6 h-6 text-amber-500" />
            <h2 class="text-xl font-black text-gray-900">徽章陈列室 (Badge Showcase)</h2>
          </div>
          <span class="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            已收集 {{ userStore.unlockedBadges.length }} / {{ BADGES_DATA.length }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="badge in BADGES_DATA"
            :key="badge.id"
            class="rounded-3xl p-4 border-2 transition-all flex flex-col justify-between"
            :class="
              isBadgeUnlocked(badge.id)
                ? 'bg-white border-amber-300 shadow-sm hover:shadow-md'
                : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
            "
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-3xl">{{ badge.icon }}</span>
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-full border"
                  :class="getRarityBadgeClass(badge.rarity)"
                >
                  {{ badge.rarity }}
                </span>
              </div>

              <div>
                <h4 class="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <span>{{ badge.title }}</span>
                  <CheckCircle2 v-if="isBadgeUnlocked(badge.id)" class="w-4 h-4 text-emerald-500" />
                  <Lock v-else class="w-3.5 h-3.5 text-gray-400" />
                </h4>
                <div class="text-[10px] text-gray-400 font-bold">{{ badge.titleEn }}</div>
                <p class="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                  {{ badge.description }}
                </p>
              </div>
            </div>

            <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span class="text-indigo-600">+{{ badge.expReward }} XP</span>
              <span class="text-amber-600">+{{ badge.coinReward }} 金币</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme & Profile Settings -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm space-y-6">
        <h2 class="text-xl font-black text-gray-900">个性化设置与多档案管理</h2>

        <!-- Theme Selection -->
        <div class="space-y-2">
          <div class="text-xs font-black text-gray-500 uppercase tracking-wide">
            棋盘与皮肤主题
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              @click="userStore.setTheme('wood')"
              class="p-4 rounded-2xl border-2 text-left transition"
              :class="userStore.theme === 'wood' ? 'bg-amber-100 border-amber-500 font-black shadow-sm' : 'bg-gray-50 border-gray-200'"
            >
              <div class="text-2xl mb-1">🪵</div>
              <div class="text-xs font-bold text-amber-900">原木温润 (Classic Wood)</div>
            </button>

            <button
              @click="userStore.setTheme('candy')"
              class="p-4 rounded-2xl border-2 text-left transition"
              :class="userStore.theme === 'candy' ? 'bg-pink-100 border-pink-500 font-black shadow-sm' : 'bg-gray-50 border-gray-200'"
            >
              <div class="text-2xl mb-1">🍬</div>
              <div class="text-xs font-bold text-pink-900">糖果梦境 (Sweet Candy)</div>
            </button>

            <button
              @click="userStore.setTheme('jade')"
              class="p-4 rounded-2xl border-2 text-left transition"
              :class="userStore.theme === 'jade' ? 'bg-emerald-100 border-emerald-500 font-black shadow-sm' : 'bg-gray-50 border-gray-200'"
            >
              <div class="text-2xl mb-1">🍵</div>
              <div class="text-xs font-bold text-emerald-900">翡翠白玉 (Emerald Jade)</div>
            </button>

            <button
              @click="userStore.setTheme('neon')"
              class="p-4 rounded-2xl border-2 text-left transition"
              :class="userStore.theme === 'neon' ? 'bg-slate-800 text-cyan-300 border-cyan-400 font-black shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-800'"
            >
              <div class="text-2xl mb-1">🌌</div>
              <div class="text-xs font-bold">赛博星空 (Cyber Neon)</div>
            </button>
          </div>
        </div>

        <!-- Data Export & Reset -->
        <div class="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          <button
            @click="exportData"
            class="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs flex items-center gap-2 transition active:scale-95"
          >
            <Download class="w-4 h-4" />
            <span>导出学习档案备份 (JSON)</span>
          </button>

          <button
            v-if="userStore.hasProfile"
            @click="confirmReset"
            class="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2 transition active:scale-95"
          >
            <RotateCcw class="w-4 h-4" />
            <span>重置当前宝贝进度</span>
          </button>
        </div>

      </div>

    </div>

    <!-- Profile Switcher Modal -->
    <ProfileSwitcherModal
      :isOpen="showSwitcherModal"
      @close="showSwitcherModal = false"
    />
  </div>
</template>

