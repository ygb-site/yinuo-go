<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUserStore, type ChildProfile } from '../../stores/useUserStore';
import { playButtonSound, playWinSound, triggerConfetti } from '../../lib/audio';
import { showAlert, showConfirm } from '../../utils/alert';
import {
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Star,
  RotateCcw,
  Sparkles,
  Database
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();

const isCreating = ref(false);
const newName = ref('');
const selectedAvatar = ref('🦁');

const availableAvatars = ['🦁', '🐰', '🐼', '🐱', '🦊', '🐶', '🦄', '🐯', '🐨', '🤖', '🐵', '🐥'];

// If no profiles exist, show create form by default when modal opens
const hasNoProfiles = computed(() => userStore.profiles.length === 0);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      newName.value = '';
      if (hasNoProfiles.value) {
        isCreating.value = true;
      } else {
        isCreating.value = false;
      }
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit('close');
};

const handleSwitch = (id: string) => {
  userStore.switchProfile(id);
  playButtonSound();
  emit('close');
};

const handleCreate = () => {
  const trimmed = newName.value.trim();
  if (!trimmed) {
    showAlert({ message: '请先输入宝贝的名字或可爱昵称哦！', type: 'warning' });
    return;
  }
  userStore.createProfile(trimmed, selectedAvatar.value);
  newName.value = '';
  isCreating.value = false;
  playWinSound();
  triggerConfetti();
  emit('close');
};

const handleDelete = async (profile: ChildProfile) => {
  const ok = await showConfirm({
    title: '删除宝贝档案',
    message: `确定要删除宝贝「${profile.nickname}」的档案吗？对应的数据与星星将无法恢复！`,
    type: 'delete',
    confirmText: '确定删除'
  });
  if (ok) {
    userStore.deleteProfile(profile.id);
  }
};

const handleClearAll = async () => {
  const ok = await showConfirm({
    title: '重置所有档案',
    message: '确定要清空所有档案并重新开始吗？所有宝贝的闯关进度与星星都将被清除！',
    type: 'delete',
    confirmText: '确定重置'
  });
  if (ok) {
    userStore.clearAllProfiles();
    isCreating.value = true;
  }
};
</script>

<template>
  <!-- Mount directly to document.body only when isOpen is true -->
  
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-md select-none animate-fade-in"
      @click.self="handleClose"
    >
      <div class="flex min-h-screen items-center justify-center p-4 sm:p-6 text-center">
        <div
          class="relative w-full max-w-md transform rounded-3xl bg-white p-6 sm:p-7 text-left shadow-2xl border-4 border-amber-300 transition-all my-8 animate-pop-in flex flex-col z-[10000]"
        >
          <!-- Close Button (Always available so user is never trapped) -->
          <button
            @click="handleClose"
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            title="关闭弹窗"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Header -->
          <div class="text-center mb-5 flex-shrink-0">
            <div
              class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 mx-auto p-1 shadow-md border-2 border-white flex items-center justify-center text-3xl mb-2"
            >
              <span>{{ isCreating || hasNoProfiles ? selectedAvatar : (userStore.hasProfile ? userStore.avatar : '👶') }}</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-gray-900">
              {{ isCreating || hasNoProfiles ? '创建专属宝贝档案' : '切换宝贝角色' }}
            </h3>
            <p class="text-xs text-gray-500 font-bold mt-1">
              {{
                isCreating || hasNoProfiles
                  ? '输入宝贝昵称并挑选可爱萌宠，开启围棋智慧大冒险！'
                  : '每个孩子拥有完全独立隔离的闯关进度与星星成就！'
              }}
            </p>
          </div>

          <!-- Mode 1: List Profiles (when profiles exist and not creating) -->
          <div v-if="!hasNoProfiles && !isCreating" class="space-y-3">
            <div class="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
              <div
                v-for="profile in userStore.profiles"
                :key="profile.id"
                @click="handleSwitch(profile.id)"
                class="p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group"
                :class="
                  userStore.currentProfileId === profile.id
                    ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-2 ring-amber-300/40'
                    : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50/40'
                "
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-200 to-orange-300 p-1 border border-white flex items-center justify-center text-2xl shadow-xs flex-shrink-0"
                  >
                    {{ profile.avatar }}
                  </div>

                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-black text-sm text-gray-900">{{ profile.nickname }}</span>
                      <span
                        v-if="userStore.currentProfileId === profile.id"
                        class="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1"
                      >
                        <CheckCircle2 class="w-3 h-3" />
                        当前使用
                      </span>
                    </div>
                    <div class="flex items-center gap-2.5 text-xs font-bold text-gray-500 mt-0.5">
                      <span class="flex items-center gap-1 text-amber-600">
                        <Star class="w-3.5 h-3.5 fill-current text-amber-500" />
                        {{ profile.totalStars || 0 }} 星
                      </span>
                      <span>•</span>
                      <span class="text-orange-600">{{ profile.coins || 0 }} 金币</span>
                      <span>•</span>
                      <span>{{ (profile.badges || []).length }} 徽章</span>
                    </div>
                  </div>
                </div>

                <!-- Delete button -->
                <button
                  v-if="userStore.profiles.length > 1"
                  @click.stop="handleDelete(profile)"
                  class="p-2 text-gray-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition opacity-80 hover:opacity-100"
                  title="删除此档案"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Add Profile Button -->
            <button
              @click="isCreating = true"
              class="w-full py-3 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50/50 text-orange-600 font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Plus class="w-4 h-4" />
              <span>添加新宝贝档案</span>
            </button>

            <!-- Reset / Clear All (Bottom Action) -->
            <div class="pt-2 flex items-center justify-between border-t border-gray-100">
              <span class="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                <Database class="w-3 h-3 text-emerald-500" />
                <span>数据仅存在本地</span>
              </span>
              <button
                @click="handleClearAll"
                class="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 hover:underline"
              >
                <RotateCcw class="w-3 h-3" />
                <span>清空所有重置</span>
              </button>
            </div>
          </div>

          <!-- Mode 2: Create Profile Form -->
          <div v-else class="space-y-4">
            <div>
              <label class="block text-xs font-black text-gray-700 mb-1.5">
                宝贝名字 / 昵称 (Nickname)：
              </label>
              <input
                v-model="newName"
                type="text"
                placeholder="例如：乐乐、小葡萄、轩轩..."
                maxlength="10"
                autofocus
                class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-400"
                @keyup.enter="handleCreate"
              />
            </div>

            <div>
              <label class="block text-xs font-black text-gray-700 mb-1.5">
                挑选一个喜欢的专属卡通头像：
              </label>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="av in availableAvatars"
                  :key="av"
                  type="button"
                  @click="selectedAvatar = av"
                  class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 text-2xl flex items-center justify-center transition transform hover:scale-110 active:scale-95"
                  :class="
                    selectedAvatar === av
                      ? 'bg-orange-100 border-orange-500 shadow-md ring-2 ring-orange-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  "
                >
                  {{ av }}
                </button>
              </div>
            </div>

            <!-- Form Buttons -->
            <div class="flex gap-2.5 pt-2">
              <button
                v-if="!hasNoProfiles"
                type="button"
                @click="isCreating = false"
                class="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm transition active:scale-95"
              >
                返回列表
              </button>
              <button
                v-else
                type="button"
                @click="handleClose"
                class="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm transition active:scale-95"
              >
                先随便逛逛
              </button>
              <button
                type="button"
                @click="handleCreate"
                class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles class="w-4 h-4" />
                <span>开启学棋之旅 🚀</span>
              </button>
            </div>

            <!-- Privacy Note -->
            <p class="text-[11px] text-gray-400 text-center font-bold">
              🔒 数据仅存在本地
            </p>
          </div>

        </div>
      </div>
    </div>
  
</template>


