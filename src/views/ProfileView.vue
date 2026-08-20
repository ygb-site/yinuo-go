<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useUnlockStore } from '../stores/unlockStore';
import { useTsumegoStore } from '../stores/tsumegoStore';
import { TSUMEGO_PUZZLES } from '../data/tsumegoLibrary';
import { BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
import CertificateModal from '../components/common/CertificateModal.vue';
import { showAlert, showConfirm } from '../utils/alert';
import { SHOP_THEMES } from '../data/shopData';
import { playButtonSound, playWinSound, playErrorSound, triggerConfetti } from '../lib/audio';
import { sound } from '../utils/sound';
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
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  LogIn,
  LogOut,
  User
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const tsumegoStore = useTsumegoStore();
const unlockStore = useUnlockStore();

const isEditingName = ref(false);
const newNickname = ref(userStore.nickname);
const showCertModal = ref(false);

// 5-Dimension Radar Chart Calculation
const radarStats = computed(() => {
  const cap = Math.min(100, Math.max(30, (userStore.stats.captureCount * 6 + (userStore.arcadeHighScores.speedCapture || 0) / 4) || 45));
  const lib = Math.min(100, Math.max(30, (userStore.totalStars * 3 + (userStore.arcadeHighScores.countLiberties || 0) / 4) || 50));
  const life = Math.min(100, Math.max(30, (userStore.solvedPuzzles.length * 4 + 35) || 40));
  const macro = Math.min(100, Math.max(30, (userStore.totalStars * 4 + 30) || 45));
  const grit = Math.min(100, Math.max(40, (userStore.stats.gamesPlayed * 8 + userStore.solvedMistakes.length * 15 + 50) || 65));

  return [
    { label: '吃子敏锐', value: cap, x: 100, y: 100 - cap * 0.75 },
    { label: '数气熟练', value: lib, x: 100 + lib * 0.71, y: 100 - lib * 0.23 },
    { label: '死活做眼', value: life, x: 100 + life * 0.44, y: 100 + life * 0.61 },
    { label: '大局观念', value: macro, x: 100 - macro * 0.44, y: 100 + macro * 0.61 },
    { label: '抗挫逆商', value: grit, x: 100 - grit * 0.71, y: 100 - grit * 0.23 }
  ];
});

const radarPolygonPoints = computed(() => {
  return radarStats.value.map(p => `${p.x},${p.y}`).join(' ');
});

const favoritePuzzlesList = computed(() => {
  return TSUMEGO_PUZZLES.filter(p => tsumegoStore.isFavorite(p.id));
});

const handleManualSync = async () => {
  if (!userStore.isLoggedIn) {
    userStore.openAuthModal();
    return;
  }
  playButtonSound();
  const ok = await userStore.syncToCloudNow();
  if (ok) {
    playWinSound();
    triggerConfetti();
    showAlert({
      title: '云端同步成功',
      message: '所有宝贝档案、通关星星与勋章已成功保存在云端数据库！',
      type: 'info'
    });
  } else {
    playErrorSound();
    showAlert({
      title: '同步失败',
      message: userStore.cloudSyncError || '请检查网络连接',
      type: 'warning'
    });
  }
};

const goToTsumego = (puzzleId?: string) => {
  const isUnlocked = unlockStore.isFeatureUnlocked('tsumego');
  if (!isUnlocked) {
    sound.playErrorSound();
    const feat = unlockStore.getFeature('tsumego');
    showConfirm({
      title: '暂未解锁死活题库',
      message: `小棋手别着急！【每日死活题】需要${feat?.unlockTip || '通关第3章【死活城堡】'}才能开启哦！快去继续主线闯关吧！`,
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
  if (puzzleId) {
    router.push({ path: '/tsumego', query: { id: puzzleId, cat: 'favorite' } });
  } else {
    router.push('/tsumego');
  }
};

const goToRankExam = () => {
  const isUnlocked = unlockStore.isFeatureUnlocked('rank-exam');
  if (!isUnlocked) {
    sound.playErrorSound();
    const feat = unlockStore.getFeature('rank-exam');
    showConfirm({
      title: '暂未解锁定段考',
      message: `小棋手别着急！【定段升级考】需要${feat?.unlockTip || '完成全部启蒙闯关'}才能开启哦！快去继续主线闯关吧！`,
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
  sound.playButtonSound();
  router.push('/rank-exam');
};

const goToShop = () => {
  const isUnlocked = unlockStore.isFeatureUnlocked('shop');
  if (!isUnlocked) {
    sound.playErrorSound();
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
  sound.playButtonSound();
  router.push('/shop');
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
  const trimmed = newNickname.value.trim();
  if (!trimmed) {
    showAlert({ message: '宝贝昵称不能为空哦！', type: 'warning' });
    return;
  }
  if (userStore.isNicknameTaken(trimmed, userStore.currentProfileId)) {
    showAlert({
      title: '昵称重复啦',
      message: `已经存在名为「${trimmed}」的宝贝档案啦，换一个更独特的可爱昵称吧！`,
      type: 'warning'
    });
    return;
  }
  userStore.currentProfile.nickname = trimmed;
  userStore.touchSave();
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

const confirmReset = async () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  const ok = await showConfirm({
    title: '重置当前宝贝进度',
    message: '确定要重置当前宝贝的所有闯关记录、星星与经验吗？此操作无法恢复！',
    type: 'delete',
    confirmText: '确定重置'
  });
  if (ok) {
    userStore.resetCurrentProfileProgress();
    showAlert({ message: '已成功重置当前宝贝的数据。', type: 'info' });
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6 sm:space-y-8">

      <!-- Case A: Logged In & Has Child Profile -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-64 h-64 bg-orange-100/60 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
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
                  <button @click="isEditingName = true; newNickname = userStore.nickname" class="p-1 text-gray-400 hover:text-orange-500 cursor-pointer" title="修改昵称">
                    <Edit2 class="w-4 h-4" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <input
                    v-model="newNickname"
                    type="text"
                    maxlength="10"
                    class="px-3 py-1 rounded-xl border border-orange-300 text-sm font-bold text-gray-800 focus:outline-none"
                    @keyup.enter="saveNickname"
                  />
                  <button @click="saveNickname" class="px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-xl cursor-pointer">
                    保存
                  </button>
                  <button @click="isEditingName = false" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl cursor-pointer">
                    取消
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

            <!-- EXP Bar & Rank Exam CTA -->
            <div class="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2">
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
              <div class="flex items-center gap-1.5 pt-1">
                <button
                  @click="goToRankExam"
                  class="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                  :class="
                    unlockStore.isFeatureUnlocked('rank-exam')
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  "
                >
                  <Trophy class="w-3.5 h-3.5" />
                  <span>{{ unlockStore.isFeatureUnlocked('rank-exam') ? '考级挑战' : '考级 (未解锁)' }}</span>
                </button>
                <button
                  @click="showCertModal = true"
                  class="flex-1 py-1.5 px-2 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-[11px] font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>荣誉证书 📜</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Case B: Not Logged In or No Profile -> Action Prompt -->
      <div v-else class="bg-white rounded-3xl p-8 sm:p-12 border-2 border-orange-100 shadow-sm text-center space-y-4">
        <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-400 p-1 shadow-md flex items-center justify-center text-4xl">
          👶
        </div>
        <div class="space-y-1">
          <h2 class="text-2xl font-black text-gray-900">
            {{ userStore.isLoggedIn ? '请创建您的第一个宝贝档案' : '登录开启宝贝成长中心' }}
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 font-bold max-w-md mx-auto">
            {{ userStore.isLoggedIn ? '创建宝贝档案后，即可为孩子记录闯关星星、成就勋章与段位棋力！' : '登录家长账号后，孩子的所有学习进度与勋章都将安全保存在云端，多设备自动打通！' }}
          </p>
        </div>
        <button
          v-if="!userStore.isLoggedIn"
          @click="userStore.openAuthModal()"
          class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
        >
          <LogIn class="w-4 h-4" />
          <span>立即登录 / 注册账号 🚀</span>
        </button>
        <button
          v-else
          @click="userStore.openProfileModal()"
          class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          <span>创建宝贝档案 👶</span>
        </button>
      </div>

      <!-- Parent Account Card (家长账号与多端同步中心) -->
      <div class="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white rounded-3xl p-5 sm:p-7 border-2 border-orange-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <ShieldCheck v-if="userStore.isLoggedIn" class="w-6 h-6" />
              <User v-else class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-xl font-black text-gray-900">家长账号与云端同步</h2>
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                  :class="userStore.isLoggedIn ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600 border border-gray-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="userStore.isLoggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'"></span>
                  <span>{{ userStore.isLoggedIn ? '已登录 · 实时自动保存' : '未登录' }}</span>
                </span>
                <span v-if="userStore.isAdmin" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-0.5">
                  <span>👑 管理员</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 font-medium mt-0.5">
                {{ userStore.isLoggedIn ? ('当前登录：' + userStore.currentUserEmail) : '登录后可在多台手机、iPad 或电脑上同步进度，随时随地学棋！' }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="userStore.isLoggedIn && userStore.isAdmin"
              @click="router.push('/admin')"
              class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert class="w-3.5 h-3.5" />
              <span>进入管理后台 👑</span>
            </button>

            <button
              v-if="userStore.isLoggedIn"
              @click="handleManualSync"
              :disabled="userStore.isSyncing"
              class="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': userStore.isSyncing }" />
              <span>{{ userStore.isSyncing ? '正在同步...' : '立即同步数据' }}</span>
            </button>

            <button
              v-if="!userStore.isLoggedIn"
              @click="userStore.openAuthModal()"
              class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn class="w-3.5 h-3.5" />
              <span>登录 / 注册 🚀</span>
            </button>

            <button
              v-if="userStore.isLoggedIn"
              @click="userStore.openAuthModal()"
              class="px-3.5 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl transition active:scale-95 cursor-pointer text-xs font-black flex items-center gap-1 shadow-2xs"
              title="退出登录"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span>退出</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 5-Dimension Learning Analytics Radar Chart Card -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="space-y-0.5">
            <div class="text-[11px] font-black text-orange-600 uppercase tracking-wide">
              Learning Analytics · 学情诊断
            </div>
            <h2 class="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <span>📊 宝贝棋力五维成长雷达图</span>
            </h2>
          </div>
          <span class="text-xs font-bold text-gray-500 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            基于对局、死活与极速反应综合分析
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <!-- SVG Radar Polygon -->
          <div class="md:col-span-6 flex justify-center">
            <div class="relative w-64 h-64">
              <svg viewBox="0 0 200 200" class="w-full h-full transform">
                <polygon points="100,25 171,48 144,132 56,132 29,48" fill="none" stroke="#FDE68A" stroke-width="1" stroke-dasharray="2,2" />
                <polygon points="100,40 157,59 135,126 65,126 43,59" fill="none" stroke="#FDE68A" stroke-width="1" stroke-dasharray="2,2" />
                <polygon points="100,55 143,69 127,119 73,119 57,69" fill="none" stroke="#FDE68A" stroke-width="1" stroke-dasharray="2,2" />
                <polygon points="100,70 128,79 118,113 82,113 72,79" fill="none" stroke="#FDE68A" stroke-width="1" stroke-dasharray="2,2" />
                <polygon points="100,85 114,90 109,106 91,106 86,90" fill="none" stroke="#FDE68A" stroke-width="1" stroke-dasharray="2,2" />

                <line x1="100" y1="100" x2="100" y2="25" stroke="#F59E0B" stroke-width="1" opacity="0.6" />
                <line x1="100" y1="100" x2="171" y2="48" stroke="#F59E0B" stroke-width="1" opacity="0.6" />
                <line x1="100" y1="100" x2="144" y2="132" stroke="#F59E0B" stroke-width="1" opacity="0.6" />
                <line x1="100" y1="100" x2="56" y2="132" stroke="#F59E0B" stroke-width="1" opacity="0.6" />
                <line x1="100" y1="100" x2="29" y2="48" stroke="#F59E0B" stroke-width="1" opacity="0.6" />

                <polygon :points="radarPolygonPoints" fill="rgba(249, 115, 22, 0.25)" stroke="#EA580C" stroke-width="2.5" />
                <circle v-for="pt in radarStats" :key="pt.label" :cx="pt.x" :cy="pt.y" r="4" fill="#EA580C" stroke="#FFFFFF" stroke-width="1.5" />

                <text x="100" y="15" text-anchor="middle" font-size="10" font-weight="900" fill="#9A3412">吃子敏锐</text>
                <text x="180" y="52" text-anchor="start" font-size="10" font-weight="900" fill="#9A3412">数气熟练</text>
                <text x="150" y="148" text-anchor="middle" font-size="10" font-weight="900" fill="#9A3412">死活做眼</text>
                <text x="50" y="148" text-anchor="middle" font-size="10" font-weight="900" fill="#9A3412">大局观念</text>
                <text x="20" y="52" text-anchor="end" font-size="10" font-weight="900" fill="#9A3412">抗挫逆商</text>
              </svg>
            </div>
          </div>

          <!-- Radar Diagnosis & Tips -->
          <div class="md:col-span-6 space-y-3">
            <div class="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-1.5">
              <div class="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>🐼 导师小诺的综合评语：</span>
              </div>
              <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                小棋手 <span class="font-black text-orange-600">{{ userStore.nickname }}</span> 手筋反应敏锐，战意高昂！吃子速度与数气基本功非常扎实，建议继续攻克每日死活与直三、弯四眼位做活练习，将更进一步突破段位瓶颈！
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 text-center text-xs font-bold">
              <div class="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
                <div class="text-gray-400 text-[10px]">死活攻克率</div>
                <div class="text-emerald-700 font-black text-sm">{{ Math.round((userStore.solvedPuzzles.length / 46) * 100) }}%</div>
              </div>
              <div class="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
                <div class="text-gray-400 text-[10px]">总对局场次</div>
                <div class="text-indigo-700 font-black text-sm">{{ userStore.stats.gamesPlayed + (userStore.captureGoStats.matches || 0) }} 局</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Favorite Puzzles Showcase -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-100 shadow-sm space-y-5">
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
            class="text-xs font-black px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            :class="
              unlockStore.isFeatureUnlocked('tsumego')
                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200'
            "
          >
            <span>{{ unlockStore.isFeatureUnlocked('tsumego') ? '去死活题大本营' : '死活大本营 🔒' }}</span>
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
            class="px-4 py-2 rounded-2xl text-white font-black text-xs shadow-sm transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            :class="
              unlockStore.isFeatureUnlocked('tsumego')
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-gray-400 hover:bg-gray-500'
            "
          >
            <span>{{ unlockStore.isFeatureUnlocked('tsumego') ? '去死活题库挑一挑 🎯' : '去死活题库挑一挑 (通关第3章解锁 🔒)' }}</span>
          </button>
        </div>
      </div>

      <!-- Badge Showcase -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm space-y-5">
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
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm space-y-6">
        <h2 class="text-xl font-black text-gray-900">个性化设置与多档案管理</h2>

        <!-- Theme Selection -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-xs font-black text-gray-500 uppercase tracking-wide">
              已解锁的棋盘皮肤
            </div>
            <button
              @click="goToShop"
              class="text-xs font-black flex items-center gap-1 cursor-pointer"
              :class="unlockStore.isFeatureUnlocked('shop') ? 'text-orange-600 hover:text-orange-700' : 'text-gray-400 hover:text-orange-600'"
            >
              <span>前往商城解锁更多皮肤</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              v-for="t in SHOP_THEMES"
              :key="t.id"
              @click="userStore.unlockedThemes.includes(t.id) || t.id === 'wood' ? userStore.setTheme(t.id) : goToShop()"
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

        <!-- Data Export & Reset -->
        <div class="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          <button
            @click="exportData"
            class="px-4 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 transition active:scale-95 cursor-pointer bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
          >
            <Download class="w-4 h-4" />
            <span>导出学习档案备份 (JSON)</span>
          </button>

          <button
            @click="confirmReset"
            class="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>重置当前宝贝进度</span>
          </button>
        </div>

      </div>

    </div>
    <!-- Certificate Modal -->
    <CertificateModal
      :isOpen="showCertModal"
      :rankTitle="userStore.currentRank.title"
      :rankLevel="userStore.currentRank.rankLevel"
      @close="showCertModal = false"
    />
  </div>
</template>

