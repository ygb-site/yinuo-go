<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../../stores/useUserStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutCloud
} from '../../services/cloudSyncService';
import {
  playButtonSound,
  playWinSound,
  playErrorSound,
  triggerConfetti
} from '../../lib/audio';
import { showAlert } from '../../utils/alert';
import {
  User,
  Lock,
  Mail,
  X,
  LogIn,
  UserPlus,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();

type TabType = 'login' | 'register' | 'account';
const activeTab = ref<TabType>('login');

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const isConfigured = computed(() => isSupabaseConfigured());

onMounted(() => {
  if (userStore.isLoggedIn) {
    activeTab.value = 'account';
  } else {
    activeTab.value = 'login';
  }
});

const switchTab = (tab: TabType) => {
  activeTab.value = tab;
  errorMessage.value = '';
  successMessage.value = '';
  playButtonSound();
};

const handleClose = () => {
  emit('close');
};

const openProfileModalAndCloseAuth = () => {
  emit('close');
  userStore.openProfileModal();
};

const handleLogin = async () => {
  if (!email.value.trim() || !password.value) {
    errorMessage.value = '请输入邮箱与密码';
    playErrorSound();
    return;
  }

  if (!isConfigured.value) {
    errorMessage.value = '云端数据库连接未就绪，请联系管理员';
    playErrorSound();
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const res = await signInWithEmail(email.value.trim(), password.value);
  isLoading.value = false;

  if (!res.success) {
    if (res.error && res.error.includes('Email not confirmed')) {
      errorMessage.value = '该邮箱未验证。请在 Supabase 控制台的 Authentication -> Providers -> Email 中关闭【Confirm email】开关即可直接登录！';
    } else if (res.error === 'Invalid login credentials') {
      errorMessage.value = '邮箱或密码错误，请仔细检查';
    } else {
      errorMessage.value = res.error || '登录失败，请稍后重试';
    }
    playErrorSound();
    return;
  }

  playWinSound();
  triggerConfetti();
  successMessage.value = '🎉 登录成功！已载入您的云端档案。';

  // Load user data into store and stay in account view
  await userStore.setCloudUser(res.user?.id || '', res.user?.email || email.value.trim());
  activeTab.value = 'account';
};

const handleRegister = async () => {
  if (!email.value.trim() || !password.value) {
    errorMessage.value = '请输入邮箱与密码';
    playErrorSound();
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = '密码长度至少为 6 位字符';
    playErrorSound();
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致';
    playErrorSound();
    return;
  }

  if (!isConfigured.value) {
    errorMessage.value = '云端数据库连接未就绪，请联系管理员';
    playErrorSound();
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const res = await signUpWithEmail(email.value.trim(), password.value);
  isLoading.value = false;

  if (!res.success) {
    errorMessage.value = res.error || '注册失败，请稍后重试';
    playErrorSound();
    return;
  }

  playWinSound();
  triggerConfetti();
  successMessage.value = '🎉 注册成功！欢迎加入一诺弈学！';

  // Load user data into store and stay in account view (do not close modal, do not popup create profile)
  await userStore.setCloudUser(res.user?.id || '', res.user?.email || email.value.trim());
  activeTab.value = 'account';
};

const handleLogout = async () => {
  isLoading.value = true;
  await signOutCloud();
  userStore.clearCloudUser();
  isLoading.value = false;
  playButtonSound();
  activeTab.value = 'login';
  showAlert({
    title: '已退出登录',
    message: '账号已安全退出，随时可再次登录继续学棋！',
    type: 'info'
  });
};

const handleManualSync = async () => {
  if (!userStore.isLoggedIn) return;
  isLoading.value = true;
  playButtonSound();
  const ok = await userStore.syncToCloudNow();
  isLoading.value = false;
  if (ok) {
    playWinSound();
    triggerConfetti();
    successMessage.value = '云端同步成功！数据已实时更新。';
    setTimeout(() => {
      successMessage.value = '';
    }, 2500);
  } else {
    playErrorSound();
    errorMessage.value = userStore.cloudSyncError || '同步失败，请检查网络连接';
  }
};

const formatTime = (ts: number | null) => {
  if (!ts) return '尚未同步';
  const d = new Date(ts);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[10000] overflow-hidden bg-black/60 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-4 no-scrollbar modal-overlay"
      @click.self="handleClose"
    >
      <div
        class="relative w-full max-w-md max-h-[92vh] overflow-y-auto no-scrollbar modal-card transform rounded-3xl bg-white p-5 sm:p-7 text-center shadow-2xl border-4 border-amber-300 transition-all animate-pop-in space-y-4"
      >
        <!-- Close Button -->
        <button
          type="button"
          @click="handleClose"
          class="absolute top-3.5 right-3.5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
          title="关闭"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Top Header Icon -->
        <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 mx-auto p-1.5 shadow-md flex items-center justify-center text-3xl text-white border-2 border-white animate-bounce-subtle">
          <ShieldCheck v-if="userStore.isLoggedIn" class="w-8 h-8" />
          <User v-else class="w-8 h-8" />
        </div>

        <!-- Title & Subtitle -->
        <div class="space-y-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black" :class="userStore.isLoggedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'">
            <span class="w-2 h-2 rounded-full" :class="userStore.isLoggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'"></span>
            <span>{{ userStore.isLoggedIn ? '账号已登录 · 进度实时保存' : '少儿围棋成长档案' }}</span>
          </div>

          <h2 class="text-xl sm:text-2xl font-cartoon font-bold text-gray-900">
            {{ userStore.isLoggedIn ? '家长账号中心' : '登录一诺弈学账号' }}
          </h2>
          <p class="text-xs text-gray-500 font-medium max-w-sm mx-auto">
            {{ userStore.isLoggedIn ? '支持在手机、平板与电脑多端无缝同步学习数据' : '登录后即可创建宝贝档案、开启启蒙闯关并永久保存星星与勋章！' }}
          </p>
        </div>

        <!-- Segmented Tabs (When not logged in) -->
        <div v-if="!userStore.isLoggedIn" class="flex items-center bg-gray-100 p-1 rounded-2xl gap-1">
          <button
            @click="switchTab('login')"
            class="flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
            :class="activeTab === 'login' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            <LogIn class="w-3.5 h-3.5" />
            <span>账号登录</span>
          </button>

          <button
            @click="switchTab('register')"
            class="flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
            :class="activeTab === 'register' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>免费注册</span>
          </button>
        </div>

        <!-- Alert Banners -->
        <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2 text-left animate-shake">
          <AlertCircle class="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 text-left animate-fade-in">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- TAB 1: Logged In Account Dashboard -->
        <div v-if="userStore.isLoggedIn" class="space-y-3.5 text-left">
          <div class="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4 border border-orange-200 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-gray-500 uppercase tracking-wide">当前登录家长账号</span>
              <span class="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3 text-emerald-600" />
                <span>已登录 · 实时同步</span>
              </span>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-white border border-orange-200 flex items-center justify-center text-lg shadow-2xs">
                👤
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-black text-sm text-gray-900 truncate">
                  {{ userStore.currentUserEmail }}
                </div>
                <div class="text-[11px] text-gray-500 font-medium">
                  最后同步：{{ formatTime(userStore.lastSavedAt) }}
                </div>
              </div>
            </div>

            <div class="pt-2 border-t border-orange-200/60 flex items-center justify-between text-xs font-bold text-gray-600">
              <span>已绑定宝贝档案：{{ userStore.profiles.length }} 位</span>
              <span>累积总星星：{{ userStore.totalStars }} 颗 ⭐</span>
            </div>
          </div>

          <!-- Associated Children Preview or Prompt -->
          <div v-if="userStore.profiles.length > 0" class="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
            <div class="text-[11px] font-bold text-gray-500">我的宝贝档案：</div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="c in userStore.profiles"
                :key="c.id"
                class="inline-flex items-center gap-1 bg-white border border-orange-200 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-800 shadow-2xs"
                :class="c.id === userStore.currentProfileId ? 'ring-2 ring-orange-400 bg-orange-50/50' : ''"
              >
                <span>{{ c.avatar }}</span>
                <span>{{ c.nickname }}</span>
                <span class="text-orange-600 font-black">⭐{{ c.totalStars || 0 }}</span>
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-2">
            <button
              type="button"
              @click="openProfileModalAndCloseAuth"
              class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus class="w-4 h-4" />
              <span>{{ userStore.profiles.length > 0 ? '管理 / 切换宝贝档案' : '创建第一个宝贝档案 👶' }}</span>
            </button>

            <button
              type="button"
              @click="handleManualSync"
              :disabled="isLoading || userStore.isSyncing"
              class="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading || userStore.isSyncing }" />
              <span>{{ userStore.isSyncing ? '正在同步中...' : '立即同步数据 🚀' }}</span>
            </button>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                @click="handleClose"
                class="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles class="w-3.5 h-3.5 text-amber-500" />
                <span>进入围棋世界 🚀</span>
              </button>

              <button
                type="button"
                @click="handleLogout"
                :disabled="isLoading"
                class="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span>退出账号</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: Sign In Form -->
        <form v-else-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-3.5 text-left">
          <div class="space-y-2.5">
            <div>
              <label class="text-xs font-black text-gray-600 block mb-1">家长邮箱</label>
              <div class="relative">
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="请输入您的登录邮箱 (例如: name@example.com)"
                  class="w-full pl-9 pr-3 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition"
                />
                <Mail class="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label class="text-xs font-black text-gray-600 block mb-1">登录密码</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="请输入密码"
                  class="w-full pl-9 pr-10 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition"
                />
                <Lock class="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn class="w-4 h-4" />
            <span>{{ isLoading ? '正在登录中...' : '登录账号 🚀' }}</span>
          </button>
        </form>

        <!-- TAB 3: Sign Up Form -->
        <form v-else-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-3 text-left">
          <div class="space-y-2">
            <div>
              <label class="text-xs font-black text-gray-600 block mb-1">家长邮箱</label>
              <div class="relative">
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="请输入您的邮箱"
                  class="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition"
                />
                <Mail class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label class="text-xs font-black text-gray-600 block mb-1">设置密码</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="至少 6 位安全密码"
                  class="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition"
                />
                <Lock class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="text-xs font-black text-gray-600 block mb-1">确认密码</label>
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="再次输入相同密码"
                  class="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition"
                />
                <Lock class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UserPlus class="w-4 h-4" />
            <span>{{ isLoading ? '正在创建账号...' : '立即免费注册 ✨' }}</span>
          </button>
        </form>

        <!-- Bottom Footer -->
        <div class="pt-2 border-t border-gray-100 flex items-center justify-center text-[11px] text-gray-400 font-bold">
          <span>🛡️ 采用安全加密存储 · 个人数据独立隔离</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

