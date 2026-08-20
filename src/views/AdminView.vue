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
  ShieldCheck
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

// Reward Adjust Modal State
const adjustingUser = ref<UserProfileRow | null>(null);
const showAdjustModal = ref(false);
const adjustChildIndex = ref(0);
const addCoinsAmount = ref(100);
const addStarsAmount = ref(5);
const addExpAmount = ref(200);

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
  addCoinsAmount.value = 100;
  addStarsAmount.value = 5;
  addExpAmount.value = 200;
  showAdjustModal.value = true;
  playButtonSound();
};

const handleApplyAdjust = async () => {
  if (!adjustingUser.value) return;
  const u = adjustingUser.value;
  const profiles = [...(u.profiles_data || [])];
  if (profiles.length === 0) {
    showAlert({ message: '该家长尚未创建任何宝贝档案', type: 'warning' });
    return;
  }

  const child = profiles[adjustChildIndex.value] || profiles[0];
  child.coins = (child.coins || 0) + Number(addCoinsAmount.value);
  child.totalStars = (child.totalStars || 0) + Number(addStarsAmount.value);
  child.exp = (child.exp || 0) + Number(addExpAmount.value);

  const res = await updateUserByAdmin(u.id, { profiles_data: profiles });
  if (res.success) {
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
  <div class="min-h-[calc(100vh-5rem)] bg-[#F8FAFC] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 select-none text-gray-800">
    <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8">

      <!-- Header Bar -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center md:text-left">
          <div class="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <button
              @click="router.push('/')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black transition active:scale-95 cursor-pointer border border-gray-200"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>返回前台</span>
            </button>
            <div class="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-black">
              <ShieldAlert class="w-3.5 h-3.5 text-purple-700" />
              <span>一诺弈学 · 官方后台管理系统 (Admin Control)</span>
            </div>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            全站用户与教学数据中心
          </h1>
          <p class="text-xs sm:text-sm text-gray-500 font-medium">
            实时查看全站注册家庭、宝贝学情成长、发放关卡金币与系统资产监控。
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="loadAdminData"
            :disabled="isLoading"
            class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            <span>刷新云端数据</span>
          </button>
        </div>
      </div>

      <!-- Top Metric Cards Grid (6 维核心指标) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <!-- Parents -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-indigo-100 shadow-sm space-y-1 text-center">
          <div class="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-base">
            <Users class="w-4 h-4" />
          </div>
          <div class="text-[11px] font-bold text-gray-400">注册家长数</div>
          <div class="text-2xl font-black text-indigo-900 font-mono">{{ stats.totalParents }}</div>
        </div>

        <!-- Children -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-sm space-y-1 text-center">
          <div class="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-base">
            <span>👶</span>
          </div>
          <div class="text-[11px] font-bold text-gray-400">宝贝档案总数</div>
          <div class="text-2xl font-black text-orange-900 font-mono">{{ stats.totalChildren }}</div>
        </div>

        <!-- Stars -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-100 shadow-sm space-y-1 text-center">
          <div class="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-base">
            <Star class="w-4 h-4 fill-current text-amber-500" />
          </div>
          <div class="text-[11px] font-bold text-gray-400">全站累积星星</div>
          <div class="text-2xl font-black text-amber-900 font-mono">{{ stats.totalStars }}</div>
        </div>

        <!-- Games -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-rose-100 shadow-sm space-y-1 text-center">
          <div class="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-base">
            <Gamepad2 class="w-4 h-4" />
          </div>
          <div class="text-[11px] font-bold text-gray-400">总对局场次</div>
          <div class="text-2xl font-black text-rose-900 font-mono">{{ stats.totalGames }}</div>
        </div>

        <!-- Coins -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-100 shadow-sm space-y-1 text-center">
          <div class="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-base">
            <Coins class="w-4 h-4 text-amber-500" />
          </div>
          <div class="text-[11px] font-bold text-gray-400">全站金币池</div>
          <div class="text-2xl font-black text-amber-900 font-mono">{{ stats.totalCoins }}</div>
        </div>

        <!-- XP -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-purple-100 shadow-sm space-y-1 text-center">
          <div class="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-base">
            <Trophy class="w-4 h-4" />
          </div>
          <div class="text-[11px] font-bold text-gray-400">总经验产出</div>
          <div class="text-2xl font-black text-purple-900 font-mono">{{ stats.totalExp }}</div>
        </div>
      </div>

      <!-- User List Section -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-gray-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-indigo-600" />
            <h2 class="text-lg sm:text-xl font-black text-gray-900">家庭用户列表 (Registered Families)</h2>
            <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
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

        <!-- User Table -->
        <div class="overflow-x-auto rounded-2xl border border-gray-100">
          <table class="w-full text-left text-xs font-medium">
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
                      class="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-950"
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
                      class="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition cursor-pointer"
                      title="发放/调整金币星星"
                    >
                      <Coins class="w-4 h-4" />
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
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-indigo-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-orange-600" />
            <h2 class="text-lg sm:text-xl font-black text-gray-900">系统教学题库与资产资产概览</h2>
          </div>
          <span class="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            版本 1.0.0 · 生产就绪
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div class="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 space-y-1">
            <div class="text-xs font-black text-orange-900">启蒙主线课程</div>
            <div class="text-2xl font-black text-orange-600">
              {{ CHAPTERS_DATA.length }} 大章 / {{ CHAPTERS_DATA.reduce((a, b) => a + b.lessons.length, 0) }} 关
            </div>
            <div class="text-[10px] text-gray-500 font-bold">全分支阶梯题库已校准</div>
          </div>

          <div class="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-1">
            <div class="text-xs font-black text-rose-900">经典死活题库</div>
            <div class="text-2xl font-black text-rose-600">{{ TSUMEGO_PUZZLES.length }} 题</div>
            <div class="text-[10px] text-gray-500 font-bold">含吃子、做眼、死活急所</div>
          </div>

          <div class="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1">
            <div class="text-xs font-black text-amber-900">成就勋章体系</div>
            <div class="text-2xl font-black text-amber-600">{{ BADGES_DATA.length }} 枚</div>
            <div class="text-[10px] text-gray-500 font-bold">普通 / 稀有 / 史诗 / 传说</div>
          </div>

          <div class="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-1">
            <div class="text-xs font-black text-indigo-900">棋盘装扮皮肤</div>
            <div class="text-2xl font-black text-indigo-600">{{ SHOP_THEMES.length }} 款</div>
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
        <div class="bg-white rounded-3xl p-6 max-w-lg w-full border-4 border-indigo-300 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto modal-card text-left">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div class="text-[10px] font-black text-indigo-600 uppercase">家长账号档案学情</div>
              <h3 class="text-base sm:text-lg font-black text-gray-900">{{ inspectingUser.email }}</h3>
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

    <!-- Adjust Modal (奖励发放弹窗) -->
    <Teleport to="body">
      <div
        v-if="showAdjustModal && adjustingUser"
        class="fixed inset-0 z-[10000] overflow-hidden bg-black/60 backdrop-blur-md flex items-center justify-center p-4 modal-overlay select-none"
        @click.self="showAdjustModal = false"
      >
        <div class="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-amber-300 shadow-2xl space-y-4 modal-card text-left">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div class="text-[10px] font-black text-amber-600 uppercase">奖励调控与发放</div>
              <h3 class="text-base font-black text-gray-900">{{ adjustingUser.email }}</h3>
            </div>
            <button @click="showAdjustModal = false" class="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div v-if="adjustingUser.profiles_data && adjustingUser.profiles_data.length > 0" class="space-y-3">
            <div>
              <label class="text-xs font-black text-gray-600 block mb-1">选择发放对象宝贝：</label>
              <select
                v-model="adjustChildIndex"
                class="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none"
              >
                <option
                  v-for="(c, idx) in adjustingUser.profiles_data"
                  :key="c.id"
                  :value="idx"
                >
                  {{ c.avatar }} {{ c.nickname }} (现有: {{ c.coins }}币 · {{ c.totalStars }}星)
                </option>
              </select>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-[11px] font-black text-gray-600 block mb-1">赠送金币</label>
                <input
                  v-model="addCoinsAmount"
                  type="number"
                  class="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-amber-800"
                />
              </div>

              <div>
                <label class="text-[11px] font-black text-gray-600 block mb-1">赠送星星</label>
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
              @click="handleApplyAdjust"
              class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white rounded-2xl font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles class="w-4 h-4" />
              <span>立即发放奖励 🚀</span>
            </button>
          </div>
          <div v-else class="py-6 text-center text-gray-400 font-bold">
            该账号尚未创建宝贝档案，无法发放奖励
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

