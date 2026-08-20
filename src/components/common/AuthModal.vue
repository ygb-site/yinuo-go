<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../../stores/useUserStore';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  saveCustomSupabaseConfig,
  getSupabaseClient
} from '../../lib/supabase';
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
  Settings,
  LogIn,
  UserPlus,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();

type TabType = 'login' | 'register' | 'config' | 'account';
const activeTab = ref<TabType>('login');

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Custom Supabase Config fields
const supabaseUrl = ref('');
const supabaseAnonKey = ref('');
const isTestingConnection = ref(false);
const configStatus = ref<{ ok?: boolean; msg?: string } | null>(null);

const isConfigured = computed(() => isSupabaseConfigured());

onMounted(() => {
  const cfg = getSupabaseConfig();
  supabaseUrl.value = cfg.url;
  supabaseAnonKey.value = cfg.anonKey;
  if (userStore.isLoggedIn) {
    activeTab.value = 'account';
  } else if (!isConfigured.value) {
    activeTab.value = 'config';
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

const handleLogin = async () => {
  if (!email.value.trim() || !password.value) {
    errorMessage.value = '请输入邮箱与密码';
    playErrorSound();
    return;
  }

  if (!isConfigured.value) {
    activeTab.value = 'config';
    errorMessage.value = '云端服务尚未配置，请先填入连接信息';
    playErrorSound();
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const res = await signInWithEmail(email.value.trim(), password.value);
  isLoading.value = false;

  if (!res.success) {
    errorMessage.value = res.error === 'Invalid login credentials'
      ? '邮箱或密码错误，请仔细检查'
      : (res.error || '登录失败，请稍后重试');
    playErrorSound();
    return;
  }

  playWinSound();
  triggerConfetti();
  successMessage.value = '🎉 登录成功！正在加载您的宝贝数据...';

  // Load user data into store
  await userStore.setCloudUser(res.user?.id || '', res.user?.email || email.value.trim());
  activeTab.value = 'account';

  setTimeout(() => {
    handleClose();
  }, 1000);
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
    activeTab.value = 'config';
    errorMessage.value = '云端服务尚未配置，请先填入连接信息';
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

  // Load user data into store
  await userStore.setCloudUser(res.user?.id || '', res.user?.email || email.value.trim());
  activeTab.value = 'account';

  setTimeout(() => {
    handleClose();
  }, 1200);
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

const handleSaveConfig = async () => {
  isTestingConnection.value = true;
  configStatus.value = null;

  const cleanUrl = supabaseUrl.value.trim();
  const cleanKey = supabaseAnonKey.value.trim();

  if (!cleanUrl || !cleanKey) {
    saveCustomSupabaseConfig('', '');
    configStatus.value = { ok: true, msg: '已重置为空（使用默认配置）' };
    isTestingConnection.value = false;
    return;
  }

  saveCustomSupabaseConfig(cleanUrl, cleanKey);
  const client = getSupabaseClient();

  if (!client) {
    configStatus.value = { ok: false, msg: 'URL 或 Key 格式不正确' };
    isTestingConnection.value = false;
    playErrorSound();
    return;
  }

  try {
    const { error } = await client.from('user_profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('permission') && !error.message.includes('policy') && error.message.includes('fetch')) {
      configStatus.value = { ok: false, msg: '连接失败：' + error.message };
      playErrorSound();
    } else {
      configStatus.value = { ok: true, msg: '✅ Supabase 云数据库连接成功！' };
      playWinSound();
    }
  } catch (err: any) {
    configStatus.value = { ok: false, msg: '网络连接异常：' + (err?.message || '') };
    playErrorSound();
  } finally {
    isTestingConnection.value = false;
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
                <span>实时同步中</span>
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

          <!-- Actions -->
          <div class="space-y-2">
            <button
              type="button"
              @click="handleManualSync"
              :disabled="isLoading || userStore.isSyncing"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading || userStore.isSyncing }" />
              <span>{{ userStore.isSyncing ? '正在同步中...' : '立即同步数据 🚀' }}</span>
            </button>

            <button
              type="button"
              @click="handleLogout"
              :disabled="isLoading"
              class="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span>退出当前账号</span>
            </button>
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

        <!-- TAB 4: Supabase Config Settings (Developer Custom Override) -->
        <div v-else-if="activeTab === 'config'" class="space-y-3.5 text-left">
          <div class="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs space-y-1.5">
            <div class="font-black text-amber-950 flex items-center gap-1.5">
              <span>🛠️ 开发者 / 自建云端配置</span>
            </div>
            <p class="text-[11px] text-gray-600 leading-relaxed font-medium">
              默认项目已预设云端数据库。如果你需要连接自建的 Supabase 实例，可在下方自定义覆盖。
            </p>
          </div>

          <div class="space-y-2">
            <div>
              <label class="text-xs font-black text-gray-700 block mb-1">Supabase Project URL</label>
              <div class="relative">
                <input
                  v-model="supabaseUrl"
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 focus:border-orange-500 focus:outline-none"
                />
                <Globe class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label class="text-xs font-black text-gray-700 block mb-1">Supabase Anon Public Key</label>
              <div class="relative">
                <input
                  v-model="supabaseAnonKey"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 focus:border-orange-500 focus:outline-none"
                />
                <Key class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div v-if="configStatus" class="p-2.5 rounded-xl text-xs font-bold" :class="configStatus.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
            {{ configStatus.msg }}
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              @click="handleSaveConfig"
              :disabled="isTestingConnection"
              class="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>{{ isTestingConnection ? '测试中...' : '保存并测试连接' }}</span>
            </button>

            <button
              type="button"
              @click="switchTab(userStore.isLoggedIn ? 'account' : 'login')"
              class="py-2.5 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
            >
              返回
            </button>
          </div>
        </div>

        <!-- Bottom Footer -->
        <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-bold">
          <span>🛡️ 采用安全加密存储</span>
          <button
            type="button"
            @click="switchTab('config')"
            class="text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
            title="高级开发者配置"
          >
            <Settings class="w-3 h-3" />
            <span>自建配置</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

