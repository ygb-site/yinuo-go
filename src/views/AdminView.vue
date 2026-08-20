<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import {
  fetchAdminUserList,
  fetchAdminStats,
  updateUserByAdmin,
  deleteUserByAdmin,
  type UserProfileRow,
  type AdminStats
} from '../services/cloudSyncService';
import { playButtonSound, playWinSound, playErrorSound, triggerConfetti } from '../lib/audio';
import { showAlert, showConfirm } from '../utils/alert';
import { CHAPTERS_DATA } from '../data/chapters';
import { TSUMEGO_PUZZLES } from '../data/tsumegoLibrary';
import { BADGES_DATA } from '../data/achievementsData';
import { SHOP_THEMES } from '../data/shopData';
import {
  ShieldAlert,
  Users,
  Star,
  Coins,
  Trophy,
  Gamepad2,
  RefreshCw,
  Search,
  ArrowLeft,
  Trash2,
  Eye,
  BookOpen,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Gift
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(true);
const stats = ref<AdminStats>({
  totalParents: 0,
  totalChildren: 0,
  totalStars: 0,
  totalGames: 0,
  totalCoins: 0,
  totalExp: 0
});
const usersList = ref<UserProfileRow[]>([]);
const searchQuery = ref('');

// Inspector Modal State
const inspectingUser = ref<UserProfileRow | null>(null);
const showInspectModal = ref(false);

// Reward & Level Adjust Modal State
const adjustingUser = ref<UserProfileRow | null>(null);
const showAdjustModal = ref(false);
const adjustChildIndex = ref(0);
const adjustActiveTab = ref<'chapter' | 'rewards'>('chapter');

// Chapter Unlock Setting
const targetChapterUnlock = ref<number>(6);

// Rewards Setting
const addCoinsAmount = ref(200);
const addStarsAmount = ref(6);
const addExpAmount = ref(300);

const loadAdminData = async () => {
  isLoading.value = true;
  const [statsRes, usersRes] = await Promise.all([
    fetchAdminStats(),
    fetchAdminUserList()
  ]);

  isLoading.value = false;

  if (statsRes.success) {
    stats.value = statsRes.stats;
  }
  if (usersRes.success) {
    usersList.value = usersRes.users;
  } else {
    showAlert({
      title: '获取管理数据失败',
      message: usersRes.error || '请确认当前账号拥有数据库管理员权限',
      type: 'warning'
    });
  }
};

onMounted(() => {
  if (!userStore.isLoggedIn || !userStore.isAdmin) {
    showAlert({
      title: '权限不足',
      message: '当前账号非管理员，无权访问管理后台！',
      type: 'warning'
    });
    router.push('/');
    return;
  }
  loadAdminData();
});

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return usersList.value;
  return usersList.value.filter(u => {
    const matchEmail = (u.email || '').toLowerCase().includes(q);
    const matchChildren = (u.profiles_data || []).some(c => (c.nickname || '').toLowerCase().includes(q));
    return matchEmail || matchChildren;
  });
});

const openInspect = (u: UserProfileRow) => {
  inspectingUser.value = u;
  showInspectModal.value = true;
  playButtonSound();
};

const openAdjust = (u: UserProfileRow) => {
  adjustingUser.value = u;
  adjustChildIndex.value = 0;
  adjustActiveTab.value = 'chapter';
  targetChapterUnlock.value = 6;
  addCoinsAmount.value = 200;
  addStarsAmount.value = 6;
  addExpAmount.value = 300;
  showAdjustModal.value = true;
  playButtonSound();
};

/**
 * 👑 管理员核心功能：一键将指定宝贝关卡进度调控至指定章节（解锁全部对应玩法）
 */
const handleUnlockChapterProgress = async () => {
  if (!adjustingUser.value) return;
  const u = adjustingUser.value;
  const profiles = [...(u.profiles_data || [])];
  if (profiles.length === 0) {
    showAlert({ message: '该家长尚未创建任何宝贝档案', type: 'warning' });
    return;
  }

  const child = profiles[adjustChildIndex.value] || profiles[0];
  const targetChapter = Number(targetChapterUnlock.value);

  if (targetChapter === 0) {
    child.progress = {};
    child.totalStars = 0;
    child.badges = [];
    child.exp = 0;
  } else {
    if (!child.progress) child.progress = {};
    if (!child.badges) child.badges = [];

    let totalStarsCount = 0;
    for (const chapter of CHAPTERS_DATA) {
      if (chapter.id <= targetChapter) {
        for (const lesson of chapter.lessons) {
          child.progress[lesson.id] = {
            completed: true,
            stars: 3,
            completedAt: new Date().toISOString()
          };
          totalStarsCount += 3;
        }
      }
    }

    child.totalStars = totalStarsCount;
    child.exp = Math.max(child.exp || 0, targetChapter * 250);
    child.coins = Math.max(child.coins || 0, targetChapter * 150);

    const badgeList = ['first_move', 'first_door'];
    if (targetChapter >= 1) badgeList.push('chapter_1_clear');
    if (targetChapter >= 2) badgeList.push('chapter_2_clear');
    if (targetChapter >= 3) badgeList.push('chapter_3_clear');
    if (targetChapter >= 4) badgeList.push('chapter_4_clear');
    if (targetChapter >= 5) badgeList.push('chapter_5_clear');
    if (targetChapter >= 6) badgeList.push('chapter_6_clear');

    child.badges = Array.from(new Set([...child.badges, ...badgeList]));
  }

  const res = await updateUserByAdmin(u.id, { profiles_data: profiles });
  if (res.success) {
    if (userStore.currentUserId === u.id) {
      userStore.profiles = profiles;
    }
    playWinSound();
    triggerConfetti();
    showAlert({
      title: '章节进度已更新',
      message: targetChapter === 0
        ? `已成功重置宝贝「${child.nickname}」的闯关进度为初始状态。`
        : `已成功将宝贝「${child.nickname}」一键解锁通关至【第 ${targetChapter} 章】（共获 ${child.totalStars} 星星 ⭐），对应模式已全部解锁开启！`,
      type: 'success'
    });
    showAdjustModal.value = false;
    loadAdminData();
  } else {
    playErrorSound();
    showAlert({ message: res.error || '修改失败', type: 'warning' });
  }
};

const handleApplyRewards = async () => {
  if (!adjustingUser.value) return;
  const u = adjustingUser.value;
  const profiles = [...(u.profiles_data || [])];
  if (profiles.length === 0) {
    showAlert({ message: '该家长尚未创建任何宝贝档案', type: 'warning' });
    return;
  }

  const child = profiles[adjustChildIndex.value] || profiles[0];
  const addCoins = Number(addCoinsAmount.value);
  const addStars = Number(addStarsAmount.value);
  child.coins = (child.coins || 0) + addCoins;
  child.totalStars = (child.totalStars || 0) + addStars;
  child.exp = (child.exp || 0) + Number(addExpAmount.value);
  if (!child.coinLog) child.coinLog = [];
  if (!child.starLog) child.starLog = [];
  const now = Date.now();
  if (addCoins) {
    child.coinLog.unshift({
      id: 'c_' + now,
      at: now,
      amount: addCoins,
      balance: child.coins,
      reason: '管理员发放金币',
      icon: '🎁'
    });
  }
  if (addStars) {
    child.starLog.unshift({
      id: 's_' + now,
      at: now,
      amount: addStars,
      balance: child.totalStars,
      reason: '管理员发放星星',
      icon: '🌟'
    });
  }

  const res = await updateUserByAdmin(u.id, { profiles_data: profiles });
  if (res.success) {
    if (userStore.currentUserId === u.id) {
      userStore.profiles = profiles;
    }
    playWinSound();
    triggerConfetti();
    showAlert({ message: `成功为宝贝「${child.nickname}」发放金币与经验奖励！`, type: 'info' });
    showAdjustModal.value = false;
    loadAdminData();
  } else {
    playErrorSound();
    showAlert({ message: res.error || '修改失败', type: 'warning' });
  }
};

const handleToggleAdmin = async (u: UserProfileRow) => {
  const newRole = !u.is_admin;
  const ok = await showConfirm({
    title: newRole ? '授予管理员权限' : '撤销管理员权限',
    message: `确定要将用户「${u.email}」${newRole ? '提升为系统管理员' : '撤销管理员权限'}吗？`,
    type: 'warning',
    confirmText: '确定修改'
  });

  if (ok) {
    const res = await updateUserByAdmin(u.id, { is_admin: newRole });
    if (res.success) {
      playButtonSound();
      u.is_admin = newRole;
      showAlert({ message: '管理员权限已成功更新！', type: 'info' });
    } else {
      playErrorSound();
      showAlert({ message: res.error || '修改权限失败', type: 'warning' });
    }
  }
};

const handleDeleteUser = async (u: UserProfileRow) => {
  const ok = await showConfirm({
    title: '删除用户档案',
    message: `确定要从云数据库彻底删除用户「${u.email}」及其全部宝贝数据吗？该操作不可逆！`,
    type: 'delete',
    confirmText: '彻底删除'
  });

  if (ok) {
    const res = await deleteUserByAdmin(u.id);
    if (res.success) {
      playButtonSound();
      showAlert({ message: '用户已成功删除', type: 'info' });
      loadAdminData();
    } else {
      playErrorSound();
      showAlert({ message: res.error || '删除失败', type: 'warning' });
    }
  }
};

const formatTime = (iso?: string) => {
  if (!iso) return '未知';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#F8FAFC] py-5 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none text-gray-800">
    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">

      <!-- Header Bar -->
      <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div class="space-y-1 text-center md:text-left w-full md:w-auto">
          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center md:justify-start">
            <button
              @click="router.push('/')"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black transition active:scale-95 cursor-pointer border border-gray-200"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>返回前台</span>
            </button>
            <div class="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-black">
              <ShieldAlert class="w-3.5 h-3.5 text-purple-700" />
              <span>一诺弈学 · 官方后台管理系统</span>
            </div>
          </div>
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-cartoon font-bold text-gray-900 tracking-wide pt-1">
            全站用户与教学数据中心
          </h1>
          <p class="text-xs text-gray-500 font-medium">
            一键调控宝贝关卡进度、解锁全套玩法、实时查看全站学情与发放金币星星。
          </p>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <button
            @click="loadAdminData"
            :disabled="isLoading"
            class="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            <span>刷新云端数据</span>
          </button>
        </div>
      </div>

      <!-- Top Metric Cards Grid (6 维核心指标 · 自适应整洁卡片) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        <!-- Parents -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-indigo-100 shadow-sm space-y-1 text-center">
          <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-sm">
            <Users class="w-4 h-4" />
          </div>
          <div class="text-[10px] sm:text-[11px] font-bold text-gray-400">注册家长数</div>
          <div class="text-xl sm:text-2xl font-black text-indigo-900 font-mono">{{ stats.totalParents }}</div>
        </div>

        <!-- Children -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-orange-100 shadow-sm space-y-1 text-center">
          <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-sm">
            <span>👶</span>
          </div>
          <div class="text-[10px] sm:text-[11px] font-bold text-gray-400">宝贝档案总数</div>
          <div class="text-xl sm:text-2xl font-black text-orange-900 font-mono">{{ stats.totalChildren }}</div>
        </div>

        <!-- Stars -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-amber-100 shadow-sm space-y-1 text-center">
          <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-sm">
            <Star class="w-4 h-4 fill-current text-amber-500" />
          </div>
          <div class="text-[10px] sm:text-[11px] font-bold text-gray-400">全站累积星星</div>
          <div class="text-xl sm:text-2xl font-black text-amber-900 font-mono">{{ stats.totalStars }}</div>
        </div>

        <!-- Games -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-rose-100 shadow-sm space-y-1 text-center">
          <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-sm">
            <Gamepad2 class="w-4 h-4" />
          </div>
          <div class="text-[10px] sm:text-[11px] font-bold text-gray-400">总对局场次</div>
          <div class="text-xl sm:text-2xl font-black text-rose-900 font-mono">{{ stats.totalGames }}</div>
        </div>

        <!-- Coins -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-amber-100 shadow-sm space-y-1 text-center">
          <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-sm">
            <Coins class="w-4 h-4 text-amber-500" />
          </div>
          <div class="text-[10px] sm:text-[11px] font-bold text-gray-400">全站金币池</div>
          <div class="text-xl sm:text-2xl font-black text-amber-900 font-mono">{{ stats.totalCoins }}</div>
        </div>

        <!-- XP -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-purple-100 shadow-sm space-y-1 text-center">
          <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-sm">
            <Trophy class="w-4 h-4" />
          </div>
          <div class="text-[10px] sm:text-[11px] font-bold text-gray-400">总经验产出</div>
          <div class="text-xl sm:text-2xl font-black text-purple-900 font-mono">{{ stats.totalExp }}</div>
        </div>
      </div>

      <!-- User List Section -->
      <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-gray-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <Users class="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <h2 class="text-base sm:text-lg font-black text-gray-900">家庭用户管理</h2>
            <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              共 {{ filteredUsers.length }} 户
            </span>
          </div>

          <!-- Search Bar -->
          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索家长邮箱或宝贝昵称..."
              class="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:border-indigo-500 focus:outline-none"
            />
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <!-- 📱 Clean Mobile & Tablet Card Layout (< 1280px 专属全宽家庭卡片，杜绝表格挤压) -->
        <div class="xl:hidden space-y-3">
          <div v-if="filteredUsers.length === 0" class="py-8 text-center text-gray-400 font-bold text-xs bg-gray-50 rounded-2xl">
            没有找到匹配的用户记录
          </div>

          <div
            v-for="u in filteredUsers"
            :key="u.id"
            class="bg-gradient-to-br from-white via-indigo-50/10 to-gray-50/50 rounded-2xl p-4 border-2 border-indigo-100 shadow-xs space-y-3 text-left"
          >
            <!-- Card Header: Email & Role -->
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="font-black text-sm text-gray-900 truncate">{{ u.email }}</div>
                <div class="text-[10px] text-gray-400 font-mono mt-0.5">ID: {{ u.id.slice(0, 8) }}... · 注册: {{ formatTime(u.created_at) }}</div>
              </div>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-black border flex-shrink-0 flex items-center gap-1"
                :class="u.is_admin ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-gray-100 text-gray-600 border-gray-200'"
              >
                <ShieldCheck v-if="u.is_admin" class="w-3 h-3 text-purple-600" />
                <span>{{ u.is_admin ? '管理员' : '普通用户' }}</span>
              </span>
            </div>

            <!-- Card Body: Children Profiles List -->
            <div class="bg-amber-50/80 p-3 rounded-2xl border border-orange-200 space-y-2">
              <div class="text-[10px] font-bold text-gray-500 flex items-center justify-between">
                <span>关联宝贝档案：</span>
                <span class="text-amber-900 font-black">
                  总币: {{ (u.profiles_data || []).reduce((acc, cur) => acc + (cur.coins || 0), 0) }} · 
                  总星: {{ (u.profiles_data || []).reduce((acc, cur) => acc + (cur.totalStars || 0), 0) }} ⭐
                </span>
              </div>

              <div v-if="u.profiles_data && u.profiles_data.length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="c in u.profiles_data"
                  :key="c.id"
                  class="inline-flex items-center gap-1.5 bg-white border border-orange-200 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-800 shadow-2xs"
                >
                  <span class="text-base">{{ c.avatar }}</span>
                  <span class="font-black text-gray-900">{{ c.nickname }}</span>
                  <span class="text-orange-600 font-black">⭐{{ c.totalStars || 0 }}星</span>
                  <span class="text-gray-400 text-[10px]">({{ Object.keys(c.progress || {}).length }}关)</span>
                </span>
              </div>
              <div v-else class="text-gray-400 text-xs italic py-1">尚未创建宝贝档案</div>
            </div>

            <!-- Card Footer Actions (4 大触控按钮) -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                @click="openInspect(u)"
                class="py-2.5 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center gap-1.5 border border-sky-200 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Eye class="w-3.5 h-3.5 text-sky-600" />
                <span>查看学情</span>
              </button>

              <button
                @click="openAdjust(u)"
                class="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center gap-1.5 border border-amber-300 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Zap class="w-3.5 h-3.5 text-amber-600" />
                <span>进度/奖励调控</span>
              </button>

              <button
                @click="handleToggleAdmin(u)"
                class="py-2.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <ShieldAlert class="w-3.5 h-3.5 text-purple-600" />
                <span>{{ u.is_admin ? '撤销管理' : '设为管理' }}</span>
              </button>

              <button
                @click="handleDeleteUser(u)"
                class="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Trash2 class="w-3.5 h-3.5 text-rose-600" />
                <span>删除用户</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 🖥️ Large Desktop Full Table View (>= 1280px 大屏幕宽表格) -->
        <div class="hidden xl:block overflow-x-auto rounded-2xl border border-gray-100">
          <table class="w-full text-left text-xs font-medium min-w-[860px]">
            <thead class="bg-gray-50 text-gray-500 text-[11px] font-black uppercase border-b border-gray-100">
              <tr>
                <th class="py-3 px-4">家长账号</th>
                <th class="py-3 px-4">关联宝贝 (昵称/等级/星星)</th>
                <th class="py-3 px-4">金币/经验</th>
                <th class="py-3 px-4">权限角色</th>
                <th class="py-3 px-4">注册/更新时间</th>
                <th class="py-3 px-4 text-right">操作管理</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-400 font-bold">
                  没有找到匹配的用户记录
                </td>
              </tr>

              <tr
                v-for="u in filteredUsers"
                :key="u.id"
                class="hover:bg-indigo-50/30 transition-colors"
              >
                <!-- Email -->
                <td class="py-3.5 px-4">
                  <div class="font-black text-gray-900">{{ u.email }}</div>
                  <div class="text-[10px] text-gray-400 font-mono">ID: {{ u.id.slice(0, 8) }}...</div>
                </td>

                <!-- Children -->
                <td class="py-3.5 px-4">
                  <div v-if="u.profiles_data && u.profiles_data.length > 0" class="flex flex-wrap gap-1.5">
                    <span
                      v-for="c in u.profiles_data"
                      :key="c.id"
                      class="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-950"
                    >
                      <span>{{ c.avatar }}</span>
                      <span>{{ c.nickname }}</span>
                      <span class="text-orange-600 font-black">⭐{{ c.totalStars || 0 }}</span>
                    </span>
                  </div>
                  <span v-else class="text-gray-400 italic">尚未创建宝贝</span>
                </td>

                <!-- Coins & XP -->
                <td class="py-3.5 px-4 font-bold text-gray-700">
                  <div class="flex items-center gap-1 text-amber-700">
                    <Coins class="w-3.5 h-3.5 text-amber-500" />
                    <span>{{ (u.profiles_data || []).reduce((acc, cur) => acc + (cur.coins || 0), 0) }} 币</span>
                  </div>
                  <div class="text-[10px] text-gray-400">
                    {{ (u.profiles_data || []).reduce((acc, cur) => acc + (cur.exp || 0), 0) }} XP
                  </div>
                </td>

                <!-- Role -->
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-flex items-center gap-1"
                    :class="u.is_admin ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-gray-100 text-gray-600 border-gray-200'"
                  >
                    <ShieldCheck v-if="u.is_admin" class="w-3 h-3 text-purple-600" />
                    <span>{{ u.is_admin ? '管理员' : '普通用户' }}</span>
                  </span>
                </td>

                <!-- Timestamp -->
                <td class="py-3.5 px-4 text-gray-500 text-[11px]">
                  <div>更新: {{ formatTime(u.updated_at) }}</div>
                  <div class="text-[10px] text-gray-400">注册: {{ formatTime(u.created_at) }}</div>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="openInspect(u)"
                      class="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition cursor-pointer"
                      title="查看学情与档案明细"
                    >
                      <Eye class="w-4 h-4" />
                    </button>

                    <button
                      @click="openAdjust(u)"
                      class="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-black transition cursor-pointer flex items-center gap-1 text-xs border border-amber-200"
                      title="调控章节关卡解锁与金币奖励"
                    >
                      <Zap class="w-3.5 h-3.5 text-amber-600" />
                      <span>进度/奖励调控</span>
                    </button>

                    <button
                      @click="handleToggleAdmin(u)"
                      class="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition cursor-pointer"
                      :title="u.is_admin ? '撤销管理员权限' : '设为管理员'"
                    >
                      <ShieldAlert class="w-4 h-4" />
                    </button>

                    <button
                      @click="handleDeleteUser(u)"
                      class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition cursor-pointer"
                      title="删除用户"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- System Content & Curriculum Overview Card -->
      <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-indigo-100 shadow-sm space-y-3 sm:space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-orange-600" />
            <h2 class="text-base sm:text-lg font-black text-gray-900">系统教学题库与课程资产概览</h2>
          </div>
          <span class="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            版本 1.0.0 · 生产就绪
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-center">
          <div class="bg-orange-50/70 p-3 sm:p-4 rounded-2xl border border-orange-200 space-y-0.5">
            <div class="text-xs font-black text-orange-900">启蒙主线课程</div>
            <div class="text-xl sm:text-2xl font-black text-orange-600">
              {{ CHAPTERS_DATA.length }} 大章 / {{ CHAPTERS_DATA.reduce((a, b) => a + b.lessons.length, 0) }} 关
            </div>
            <div class="text-[10px] text-gray-500 font-bold">全分支阶梯题库已校准</div>
          </div>

          <div class="bg-rose-50/70 p-3 sm:p-4 rounded-2xl border border-rose-200 space-y-0.5">
            <div class="text-xs font-black text-rose-900">经典死活题库</div>
            <div class="text-xl sm:text-2xl font-black text-rose-600">{{ TSUMEGO_PUZZLES.length }} 题</div>
            <div class="text-[10px] text-gray-500 font-bold">含吃子、做眼、死活急所</div>
          </div>

          <div class="bg-amber-50/70 p-3 sm:p-4 rounded-2xl border border-amber-200 space-y-0.5">
            <div class="text-xs font-black text-amber-900">成就勋章体系</div>
            <div class="text-xl sm:text-2xl font-black text-amber-600">{{ BADGES_DATA.length }} 枚</div>
            <div class="text-[10px] text-gray-500 font-bold">普通 / 稀有 / 史诗 / 传说</div>
          </div>

          <div class="bg-indigo-50/70 p-3 sm:p-4 rounded-2xl border border-indigo-200 space-y-0.5">
            <div class="text-xs font-black text-indigo-900">棋盘装扮皮肤</div>
            <div class="text-xl sm:text-2xl font-black text-indigo-600">{{ SHOP_THEMES.length }} 款</div>
            <div class="text-[10px] text-gray-500 font-bold">原木、星空、翡翠、糖果等</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Inspector Modal (学情查看弹窗) -->
    <Teleport to="body">
      <div
        v-if="showInspectModal && inspectingUser"
        class="fixed inset-0 z-[10000] overflow-hidden bg-black/60 backdrop-blur-md flex items-center justify-center p-4 modal-overlay select-none"
        @click.self="showInspectModal = false"
      >
        <div class="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full border-4 border-indigo-300 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto modal-card text-left">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div class="text-[10px] font-black text-indigo-600 uppercase">家长账号档案学情</div>
              <h3 class="text-base sm:text-lg font-black text-gray-900 truncate max-w-[260px]">{{ inspectingUser.email }}</h3>
            </div>
            <button @click="showInspectModal = false" class="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Children list in inspector -->
          <div v-if="inspectingUser.profiles_data && inspectingUser.profiles_data.length > 0" class="space-y-3">
            <div
              v-for="c in inspectingUser.profiles_data"
              :key="c.id"
              class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ c.avatar }}</span>
                  <div>
                    <div class="font-black text-sm text-gray-900">{{ c.nickname }}</div>
                    <div class="text-[10px] text-gray-500 font-mono">创建于: {{ formatTime(new Date(c.createdAt).toISOString()) }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-black text-orange-600">⭐ {{ c.totalStars || 0 }} 星</div>
                  <div class="text-xs font-bold text-amber-700">🪙 {{ c.coins || 0 }} 金币 · {{ c.exp || 0 }} XP</div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-center text-xs font-bold text-gray-600">
                <div class="bg-white p-2 rounded-xl border border-amber-100">
                  <div class="text-[10px] text-gray-400">通关关卡数</div>
                  <div class="text-sm font-black text-gray-900">{{ Object.keys(c.progress || {}).length }} 关</div>
                </div>
                <div class="bg-white p-2 rounded-xl border border-amber-100">
                  <div class="text-[10px] text-gray-400">死活答对题数</div>
                  <div class="text-sm font-black text-gray-900">{{ (c.solvedPuzzles || []).length }} 题</div>
                </div>
                <div class="bg-white p-2 rounded-xl border border-amber-100">
                  <div class="text-[10px] text-gray-400">已解锁勋章</div>
                  <div class="text-sm font-black text-gray-900">{{ (c.badges || []).length }} 枚</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center text-gray-400 font-bold">
            该账号尚未创建宝贝档案
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Adjust Modal (👑 章节关卡极速解锁 & 奖励发放调控弹窗) -->
    <Teleport to="body">
      <div
        v-if="showAdjustModal && adjustingUser"
        class="fixed inset-0 z-[10000] overflow-hidden bg-black/60 backdrop-blur-md flex items-center justify-center p-4 modal-overlay select-none"
        @click.self="showAdjustModal = false"
      >
        <div class="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border-4 border-amber-300 shadow-2xl space-y-4 modal-card text-left">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div class="text-[10px] font-black text-amber-600 uppercase">宝贝进度与奖励调控</div>
              <h3 class="text-base font-black text-gray-900 truncate max-w-[260px]">{{ adjustingUser.email }}</h3>
            </div>
            <button @click="showAdjustModal = false" class="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div v-if="adjustingUser.profiles_data && adjustingUser.profiles_data.length > 0" class="space-y-4">
            <!-- Select Target Child -->
            <div>
              <label class="text-xs font-black text-gray-700 block mb-1">选择指定宝贝：</label>
              <select
                v-model="adjustChildIndex"
                class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none bg-gray-50 focus:bg-white"
              >
                <option
                  v-for="(c, idx) in adjustingUser.profiles_data"
                  :key="c.id"
                  :value="idx"
                >
                  {{ c.avatar }} {{ c.nickname }} (现有: ⭐{{ c.totalStars || 0 }}星 · 🪙{{ c.coins }}币 · 通关{{ Object.keys(c.progress || {}).length }}关)
                </option>
              </select>
            </div>

            <!-- Tabs: Chapter Unlock vs Rewards -->
            <div class="flex items-center bg-gray-100 p-1 rounded-2xl gap-1">
              <button
                @click="adjustActiveTab = 'chapter'"
                class="flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1"
                :class="adjustActiveTab === 'chapter' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              >
                <Zap class="w-3.5 h-3.5" />
                <span>🚀 极速章节关卡解锁</span>
              </button>

              <button
                @click="adjustActiveTab = 'rewards'"
                class="flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1"
                :class="adjustActiveTab === 'rewards' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              >
                <Gift class="w-3.5 h-3.5" />
                <span>🎁 金币与星星发放</span>
              </button>
            </div>

            <!-- TAB 1: 章节关卡一键调整 -->
            <div v-if="adjustActiveTab === 'chapter'" class="space-y-3">
              <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                <div class="font-black text-amber-900 flex items-center gap-1">
                  <Sparkles class="w-3.5 h-3.5 text-amber-600" />
                  <span>管理员一键跳关 / 玩法全开说明：</span>
                </div>
                <p class="text-[11px] text-gray-600 leading-relaxed font-medium">
                  选择想要解锁的目标章节，系统会自动将所选章节前的所有关卡置为满星（3星）通关，并自动解锁吃子棋、装扮商城、每日死活、亲子面对面与定段考等全部对应玩法！
                </p>
              </div>

              <div>
                <label class="text-xs font-black text-gray-700 block mb-1.5">一键解锁通关进度至：</label>
                <select
                  v-model="targetChapterUnlock"
                  class="w-full px-3 py-2.5 rounded-xl border border-orange-300 text-xs font-bold text-orange-950 focus:outline-none bg-orange-50/50"
                >
                  <option :value="1">第 1 章：棋盘与生命之气（通关 4 关 · 解锁吃子对弈场）</option>
                  <option :value="2">第 2 章：吃子魔法与大救援（通关 8 关 · 解锁装扮商城）</option>
                  <option :value="3">第 3 章：做活之眼与双眼活棋（通关 13 关 · 解锁每日死活题库）</option>
                  <option :value="4">第 4 章：经典手筋与吃子陷阱（通关 18 关 · 解锁亲子面对面对弈）</option>
                  <option :value="5">第 5 章：地盘划定与城堡争夺（通关 23 关 · 解锁段位升级考）</option>
                  <option :value="6">第 6 章：终局数子与棋道大成（通关全部 28 关 · 毕业大满贯 👑）</option>
                  <option :value="0">⚠️ 重置回第 1 关初始未闯关状态</option>
                </select>
              </div>

              <button
                @click="handleUnlockChapterProgress"
                class="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap class="w-4 h-4" />
                <span>立即应用章节解锁并保存到云端 🚀</span>
              </button>
            </div>

            <!-- TAB 2: 金币与星星发放 -->
            <div v-else class="space-y-3">
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="text-[11px] font-black text-gray-600 block mb-1">增加金币</label>
                  <input
                    v-model="addCoinsAmount"
                    type="number"
                    class="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-amber-800"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-black text-gray-600 block mb-1">增加星星</label>
                  <input
                    v-model="addStarsAmount"
                    type="number"
                    class="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-orange-800"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-black text-gray-600 block mb-1">增加经验</label>
                  <input
                    v-model="addExpAmount"
                    type="number"
                    class="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-indigo-800"
                  />
                </div>
              </div>

              <button
                @click="handleApplyRewards"
                class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Gift class="w-4 h-4" />
                <span>立即发放金币与经验 🚀</span>
              </button>
            </div>

          </div>
          <div v-else class="py-6 text-center text-gray-400 font-bold">
            该账号尚未创建宝贝档案，无法调整章节与发放奖励
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

