<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useTsumegoStore } from '../stores/tsumegoStore';
import { TSUMEGO_PUZZLES } from '../data/tsumegoLibrary';
import { BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
import { SHOP_THEMES } from '../data/shopData';
import { playButtonSound } from '../lib/audio';
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
  UserPlus,
  Heart,
  ArrowRight
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const tsumegoStore = useTsumegoStore();

const isEditingName = ref(false);
const newNickname = ref(userStore.nickname);

const favoritePuzzlesList = computed(() => {
  return TSUMEGO_PUZZLES.filter(p => tsumegoStore.isFavorite(p.id));
});

const goToTsumego = (puzzleId?: string) => {
  playButtonSound();
  if (puzzleId) {
    router.push({ path: '/tsumego', query: { id: puzzleId, cat: 'favorite' } });
  } else {
    router.push('/tsumego');
  }
};

const removeFavorite = (puzzleId: string, event: Event) => {
  event.stopPropagation();
  playButtonSound();
  tsumegoStore.toggleFavorite(puzzleId);
};

const avatarList = ['🦁', '🐰', '🐼', '🐱', '🦊', '🐶', '🦄', '🐯', '🐨', '🤖', '🐵', '🐥'];

const saveNickname = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (newNickname.value.trim()) {
    userStore.currentProfile.nickname = newNickname.value.trim();
  }
  isEditingName.value = false;
  playButtonSound();
};

const selectAvatar = (av: string) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  userStore.currentProfile.avatar = av;
  playButtonSound();
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
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  playButtonSound();
  const data = {
    userStore: userStore.$state,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yinuo-go-backup-' + (userStore.nickname || 'kids') + '.json';
  a.click();
  URL.revokeObjectURL(url);
};

const confirmReset = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  if (confirm('Reset progress?')) {
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
              <div class="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-0.5 rounded-full text-xs font-black mb-1">
                <span>🏆 宝贝个人成长成就中心</span>
              </div>
              <div class="flex items-center gap-2 justify-center sm:justify-start">
                <div v-if="!isEditingName" class="flex items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">{{ userStore.nickname }}</h1>
                  <button @click="isEditingName = true" class="p-1 text-gray-400 hover:text-orange-500 cursor-pointer" title="修改昵称">
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
                  <button @click="saveNickname" class="px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-xl cursor-pointer">
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
                  @click="userStore.openProfileModal()"
                  class="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Users class="w-3.5 h-3.5" />
                  <span>切换宝贝 (共 {{ userStore.profiles.length }} 位)</span>
                </button>
              </div>

              <!-- Avatar Quick Selector -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1.5 justify-center sm:justify-start">
                <button
                  v-for="av in avatarList.slice(0, 8)"
                  :key="av"
                  @click="selectAvatar(av)"
                  class="w-8 h-8 rounded-xl border text-base flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xs"
                  :class="userStore.avatar === av ? 'bg-orange-100 border-orange-500 ring-2 ring-orange-400/40' : 'bg-gray-50 border-gray-200 hover:bg-orange-50/50'"
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
                  :style="{ width: userStore.rankProgressPercent + '%' }"
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
            @click="userStore.openProfileModal()"
            class="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus class="w-4 h-4" />
            <span>创建第一位宝贝档案 🚀</span>
          </button>
        </div>
      </div>

      <!-- Favorite Puzzles Showcase (❤️ 宝贝死活题收藏本) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-100 shadow-sm space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart class="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 class="text-xl font-black text-gray-900">死活题专属收藏本 (Favorite Puzzles)</h2>
              <p class="text-xs text-gray-500 font-medium">收集重点难题与经典手筋，方便随时集中练习与巩固</p>
            </div>
          </div>
          <button
            @click="goToTsumego()"
            class="text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-full border border-rose-200 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <span>去死活题大本营</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Favorites List -->
        <div v-if="favoritePuzzlesList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="p in favoritePuzzlesList"
            :key="p.id"
            @click="goToTsumego(p.id)"
            class="rounded-3xl p-4 border-2 border-rose-100 hover:border-rose-300 bg-gradient-to-br from-white to-rose-50/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  {{ p.categoryLabel }}
                </span>
                <div class="flex items-center gap-1">
                  <div class="flex items-center text-amber-400 mr-1">
                    <Star v-for="s in p.difficultyStars" :key="s" class="w-3 h-3 fill-current" />
                  </div>
                  <button
                    @click="removeFavorite(p.id, $event)"
                    class="text-gray-300 hover:text-rose-500 p-1 transition cursor-pointer"
                    title="取消收藏"
                  >
                    <Heart class="w-4 h-4 fill-current text-rose-500 hover:scale-110" />
                  </button>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-black text-gray-900 group-hover:text-rose-600 transition flex items-center gap-1.5">
                  <span>{{ p.title }}</span>
                  <CheckCircle2 v-if="tsumegoStore.isSolved(p.id)" class="w-4 h-4 text-emerald-500" />
                </h4>
                <p class="text-xs text-gray-500 font-medium line-clamp-2 mt-1">
                  {{ p.prompt }}
                </p>
              </div>
            </div>

            <div class="pt-2 border-t border-rose-100 flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span class="text-rose-600 flex items-center gap-1">
                <span>{{ tsumegoStore.isSolved(p.id) ? '已攻克 🌟' : '待练习 🎯' }}</span>
              </span>
              <span class="text-orange-500 font-black flex items-center gap-1 group-hover:translate-x-0.5 transition">
                <span>立即做题</span>
                <ArrowRight class="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        <!-- Empty Favorites -->
        <div v-else class="py-8 px-4 text-center rounded-3xl bg-rose-50/40 border border-dashed border-rose-200 space-y-3">
          <div class="text-3xl">💖</div>
          <div class="space-y-1">
            <h4 class="text-sm font-black text-gray-800">还没有收藏任何死活题哦</h4>
            <p class="text-xs text-gray-500 font-medium max-w-md mx-auto">
              在「每日死活」模块做题时，点击棋盘左下方的【❤️ 收藏】按钮，即可把易错题、重点妙手题一键收入此处！
            </p>
          </div>
          <button
            @click="goToTsumego()"
            class="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-sm transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>去死活题库挑一挑 🎯</span>
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
            @click="!userStore.hasProfile && userStore.openProfileModal()"
            class="rounded-3xl p-4 border-2 transition-all flex flex-col justify-between cursor-pointer"
            :class="
              isBadgeUnlocked(badge.id)
                ? 'bg-white border-amber-300 shadow-sm hover:shadow-md'
                : 'bg-gray-50 border-gray-200 opacity-50 grayscale hover:opacity-75'
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
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide">
              已解锁的棋盘皮肤
            </div>
            <button
              @click="router.push('/shop')"
              class="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>前往商城解锁更多皮肤</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              v-for="t in SHOP_THEMES"
              :key="t.id"
              @click="userStore.unlockedThemes.includes(t.id) || t.id === 'wood' ? userStore.setTheme(t.id) : router.push('/shop')"
              class="p-3.5 rounded-2xl border-2 text-center transition cursor-pointer relative flex flex-col justify-between"
              :class="
                userStore.theme === t.id
                  ? 'border-orange-500 ring-2 ring-orange-300 shadow-sm bg-orange-50/40 font-black'
                  : (userStore.unlockedThemes.includes(t.id) || t.id === 'wood')
                  ? 'border-emerald-200 hover:border-emerald-400 bg-white'
                  : 'border-gray-100 bg-gray-50/80 opacity-70 hover:opacity-100'
              "
            >
              <div class="text-3xl mb-1">{{ t.icon }}</div>
              <div class="text-xs font-bold text-gray-900 truncate">{{ t.name }}</div>

              <div class="mt-2 pt-1 border-t border-gray-100">
                <span
                  v-if="userStore.theme === t.id"
                  class="text-[10px] text-orange-600 font-black"
                >
                  ✓ 使用中
                </span>
                <span
                  v-else-if="userStore.unlockedThemes.includes(t.id) || t.id === 'wood'"
                  class="text-[10px] text-emerald-700 font-bold"
                >
                  点击换上
                </span>
                <span
                  v-else
                  class="text-[10px] text-amber-700 font-bold flex items-center justify-center gap-0.5"
                >
                  <Lock class="w-3 h-3" /> {{ t.price }}币
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Export & Reset (Protected when no profile) -->
        <div class="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          <button
            @click="exportData"
            class="px-4 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 transition active:scale-95 cursor-pointer"
            :class="
              userStore.hasProfile
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-orange-600 hover:border-orange-300'
            "
          >
            <Download class="w-4 h-4" />
            <span>导出学习档案备份 (JSON)</span>
          </button>

          <button
            v-if="userStore.hasProfile"
            @click="confirmReset"
            class="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>重置当前宝贝进度</span>
          </button>
        </div>

      </div>

    </div>
  </div>
</template>
