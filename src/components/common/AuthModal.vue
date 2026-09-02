<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUserStore } from '../../stores/useUserStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signInWithEmail } from '../../services/cloudSyncService';
import {
  playErrorSound,
  playWinSound,
  triggerConfetti
} from '../../lib/audio';
import {
  User,
  Lock,
  Mail,
  X,
  LogIn,
  AlertCircle
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const isConfigured = computed(() => isSupabaseConfigured());

const resetFormFields = () => {
  email.value = '';
  password.value = '';
  errorMessage.value = '';
};

const handleClose = () => {
  resetFormFields();
  emit('close');
};

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    // 已登录时不再打开这个弹窗（账号管理走头像菜单 / 成长中心）
    if (userStore.isLoggedIn) {
      emit('close');
      return;
    }
    resetFormFields();
  }
);

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

  const res = await signInWithEmail(email.value.trim(), password.value);
  isLoading.value = false;

  if (!res.success) {
    if (res.error && res.error.includes('Email not confirmed')) {
      errorMessage.value = '该账号尚未激活或验证，请检查邮箱与密码';
    } else if (
      res.error === 'Invalid login credentials' ||
      (res.error && res.error.includes('Invalid login credentials'))
    ) {
      errorMessage.value = '邮箱或密码错误，请重新输入';
    } else {
      errorMessage.value = '登录失败，请检查网络或稍后重试';
    }
    playErrorSound();
    return;
  }

  playWinSound();
  triggerConfetti();
  await userStore.setCloudUser(res.user?.id || '', res.user?.email || email.value.trim());
  handleClose();
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && !userStore.isLoggedIn"
      class="fixed inset-0 z-[10000] overflow-hidden bg-black/60 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-4 no-scrollbar modal-overlay"
      @click.self="handleClose"
    >
      <div
        class="relative w-full max-w-md max-h-[92vh] overflow-y-auto no-scrollbar modal-card transform rounded-3xl bg-white p-5 sm:p-7 text-center shadow-2xl border-4 border-amber-300 transition-all animate-pop-in space-y-4"
      >
        <button
          type="button"
          class="absolute top-3.5 right-3.5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
          title="关闭"
          @click="handleClose"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 mx-auto p-1.5 shadow-md flex items-center justify-center text-3xl text-white border-2 border-white">
          <User class="w-8 h-8" />
        </div>

        <div class="space-y-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-800">
            <span class="w-2 h-2 rounded-full bg-orange-500" />
            <span>家庭私有学堂</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-cartoon font-bold text-gray-900">登录家庭账号</h2>
          <p class="text-xs text-gray-500 font-medium max-w-sm mx-auto">
            本学堂仅限本家庭使用，不开放注册。用现有账号登录即可。
          </p>
        </div>

        <div
          v-if="errorMessage"
          class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2 text-left animate-shake"
        >
          <AlertCircle class="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form class="space-y-3.5 text-left" @submit.prevent="handleLogin">
          <div class="space-y-2.5">
            <div>
              <label class="text-xs font-black text-gray-600 block mb-1">家长邮箱</label>
              <div class="relative">
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="请输入您的登录邮箱"
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
                  type="password"
                  required
                  placeholder="请输入密码"
                  class="w-full pl-9 pr-3 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition"
                />
                <Lock class="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn class="w-4 h-4" />
            <span>{{ isLoading ? '正在登录中...' : '登录账号' }}</span>
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>
