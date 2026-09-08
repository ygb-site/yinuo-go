<script setup lang="ts">
import { ref, watch } from 'vue';
import { showAlert } from '../../utils/alert';
import { useSilverStore } from '../../stores/useSilverStore';
import type { FamilyMember } from '../../types/silver';
import { X, Check, UserPlus } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  member?: FamilyMember | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', member: any): void;
}>();

const silverStore = useSilverStore();

const name = ref('');
const role = ref('家庭成员');
const avatar = ref('👦');
const title = ref('自律先锋');
const initialBalance = ref(20);

const avatarOptions = ['👦', '👧', '👶', '👨', '👩', '👴', '👵', '🦁', '🐯', '🐼', '🦊', '🐱', '🐶', '👑', '🥋', '🪭', '⭐', '✨'];

const rolePresets = ['长子', '次子', '千金', '掌柜', '大掌柜', '总账房', '督察官', '爷爷', '奶奶', '姥姥', '姥爷'];

watch(
  () => props.show,
  (open) => {
    if (open) {
      if (props.member) {
        name.value = props.member.name;
        role.value = props.member.role;
        avatar.value = props.member.avatar;
        title.value = props.member.title || '';
        initialBalance.value = props.member.balance;
      } else {
        name.value = '';
        role.value = '家庭成员';
        avatar.value = '👦';
        title.value = '自律新星';
        initialBalance.value = 10;
      }
    }
  },
  { immediate: true }
);

function handleSave() {
  const finalName = name.value.trim();
  if (!finalName) {
    showAlert({ title: '温馨提示', message: '请输入家庭成员的姓名或昵称哦！', type: 'warning' });
    return;
  }

  if (props.member) {
    silverStore.updateMember(props.member.id, {
      name: finalName,
      role: role.value.trim(),
      avatar: avatar.value,
      title: title.value.trim()
    });
  } else {
    silverStore.addMember({
      name: finalName,
      role: role.value.trim(),
      avatar: avatar.value,
      title: title.value.trim(),
      initialBalance: Math.max(0, initialBalance.value)
    });
  }

  emit('save', null);
  emit('close');
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#FAF5E8] border-2 border-[#8C6D46] shadow-2xl overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-[#E3D3B5] bg-[#F4ECDC]/90">
        <h3 class="text-base font-serif font-bold text-[#4A3319] flex items-center gap-2">
          <UserPlus class="w-4 h-4 text-amber-800" />
          <span>{{ member ? '修润家庭成员' : '延请家庭成员入席' }}</span>
        </h3>
        <button
          type="button"
          class="p-1 rounded-full text-[#7A5A30] hover:bg-[#E6D7B8] transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <!-- 头像 Emoji 选择 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1.5">家庭头像徽印</label>
          <div class="flex items-center gap-3">
            <div
              class="w-14 h-14 rounded-2xl border-2 border-amber-600 bg-amber-100 flex items-center justify-center text-3xl shadow-inner shrink-0"
            >
              {{ avatar }}
            </div>
            <div class="flex-1 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1.5 bg-[#F5EEDD]/50 rounded-xl border border-[#E0D2BA]">
              <button
                v-for="emoji in avatarOptions"
                :key="emoji"
                type="button"
                class="w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-amber-200/60 transition-colors cursor-pointer"
                :class="avatar === emoji ? 'bg-amber-300 ring-1 ring-amber-600' : ''"
                @click="avatar = emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <!-- 姓名 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">
            姓名 / 昵称<span class="text-rose-600">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="如：诺宝、妹妹、爸爸、大掌柜"
            class="w-full px-3 py-2 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
          />
        </div>

        <!-- 家庭称谓 / 角色 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">家庭称谓 / 掌柜角色</label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <button
              v-for="r in rolePresets"
              :key="r"
              type="button"
              class="px-2 py-0.5 rounded text-[11px] font-serif border cursor-pointer transition-all"
              :class="role === r ? 'bg-amber-700 text-white border-amber-800' : 'bg-white text-[#6D4C1D] border-[#D9C6A3] hover:bg-amber-100'"
              @click="role = r"
            >
              {{ r }}
            </button>
          </div>
          <input
            v-model="role"
            type="text"
            placeholder="也可自定义称呼，如：少侠、总督察"
            class="w-full px-3 py-2 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
          />
        </div>

        <!-- 荣誉名号 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">荣誉尊称 / 榜头称号</label>
          <input
            v-model="title"
            type="text"
            placeholder="如：自律小状元、勤俭管家、家风标兵"
            class="w-full px-3 py-2 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
          />
        </div>

        <!-- 初始底金（新建时） -->
        <div v-if="!member">
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">初始赐予底金（银票两数）</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="initialBalance"
              type="number"
              min="0"
              class="w-24 px-3 py-2 text-xs rounded-xl border border-[#D9C6A3] bg-white font-bold text-center text-amber-900"
            />
            <span class="text-xs text-[#7A5A30]">两银票（开户底银）</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#E3D3B5] bg-[#F4ECDC]/90">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-serif text-[#6D4C1D] hover:bg-[#E6D7B8] cursor-pointer"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-serif font-bold text-white bg-amber-700 hover:bg-amber-800 shadow-md cursor-pointer flex items-center gap-1"
          @click="handleSave"
        >
          <Check class="w-4 h-4" />
          <span>确认登簿</span>
        </button>
      </div>
    </div>
  </div>
</template>

