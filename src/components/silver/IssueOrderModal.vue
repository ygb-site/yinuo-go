<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { showAlert } from '../../utils/alert';
import { useSilverStore, SILVER_DENOMINATIONS } from '../../stores/useSilverStore';
import type { FamilyOrder, OrderType, SilverDenominationValue } from '../../types/silver';
import SilverNoteCard from './SilverNoteCard.vue';
import confetti from 'canvas-confetti';
import { X, AlertTriangle, Sparkles, Coins, Stamp } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  initialMemberId?: string;
  initialOrder?: FamilyOrder | null;
  defaultType?: OrderType;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', data: any): void;
}>();

const silverStore = useSilverStore();

const selectedMemberId = ref('');
const orderType = ref<OrderType>('reward');
const selectedOrderId = ref<string>('');
const titleInput = ref('');
const amountInput = ref<number>(5);
const noteInput = ref('');
const operatorInput = ref('掌柜');
const isSubmitting = ref(false);

const denominations: SilverDenominationValue[] = [1, 5, 10, 50, 100];

// 监听打开状态进行初始化
watch(
  () => props.show,
  (val) => {
    if (val) {
      selectedMemberId.value = props.initialMemberId || silverStore.selectedMemberId || silverStore.members[0]?.id || '';
      orderType.value = props.defaultType || props.initialOrder?.type || 'reward';

      if (props.initialOrder) {
        selectedOrderId.value = props.initialOrder.id;
        titleInput.value = props.initialOrder.title;
        amountInput.value = props.initialOrder.amount;
        orderType.value = props.initialOrder.type;
      } else {
        selectedOrderId.value = '';
        titleInput.value = '';
        amountInput.value = 5;
      }
      noteInput.value = '';
      operatorInput.value = '家风掌柜';
    }
  },
  { immediate: true }
);

// 过滤可用令列表
const availableOrders = computed(() => {
  return silverStore.orders.filter(o => o.type === orderType.value && o.enabled);
});

// 选择现有令
function handleSelectOrder(order: FamilyOrder) {
  selectedOrderId.value = order.id;
  titleInput.value = order.title;
  amountInput.value = order.amount;
}

// 选择面额快捷按钮
function handleSelectDenomination(val: number) {
  amountInput.value = val;
}

const currentMember = computed(() => {
  return silverStore.members.find(m => m.id === selectedMemberId.value);
});

// 确认颁发
function handleConfirm() {
  const finalTitle = titleInput.value.trim();
  if (!finalTitle) {
    showAlert({ title: '温馨提示', message: '请选择或拟定要奉行的令名！', type: 'warning' });
    return;
  }
  if (!selectedMemberId.value) {
    showAlert({ title: '温馨提示', message: '请选择受令的家庭成员！', type: 'warning' });
    return;
  }
  if (amountInput.value <= 0) {
    showAlert({ title: '温馨提示', message: '银票面额必须大于 0 两！', type: 'warning' });
    return;
  }

  isSubmitting.value = true;

  try {
    const tx = silverStore.issueOrder({
      memberId: selectedMemberId.value,
      orderId: selectedOrderId.value || undefined,
      title: finalTitle,
      type: orderType.value,
      amount: amountInput.value,
      note: noteInput.value.trim(),
      operator: operatorInput.value.trim() || '掌柜'
    });

    // 触发礼花特效
    if (orderType.value === 'reward') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6']
      });
    }

    emit('success', tx);
    emit('close');
  } catch (err: any) {
    showAlert({ title: '操作未完成', message: err.message || '操作未完成，请重试', type: 'error' });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
  >
    <div
      class="relative w-full max-w-xl overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#FAF5E8] border-2 border-[#8C6D46] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- 弹窗顶栏古风横批 -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-[#E3D3B5] bg-[#F4ECDC]/90"
      >
        <div class="flex items-center gap-2">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg border border-[#A2773C] text-amber-800 shadow-inner"
            :class="orderType === 'reward' ? 'bg-amber-100' : 'bg-red-100 text-red-700 border-red-300'"
          >
            <Coins v-if="orderType === 'reward'" class="w-5 h-5" />
            <AlertTriangle v-else class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-serif font-bold text-[#4A3319] flex items-center gap-2">
              <span>{{ orderType === 'reward' ? '颁发奖赏令 · 赐银票' : '奉行规诫令 · 罚银票' }}</span>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-sans font-bold"
                :class="orderType === 'reward' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
              >
                {{ orderType === 'reward' ? '+银票' : '-银票' }}
              </span>
            </h3>
            <p class="text-[11px] text-[#8C6B3E] font-sans">见票即行 · 赏善惩违 · 齐家修身</p>
          </div>
        </div>

        <button
          type="button"
          class="p-1.5 rounded-full text-[#7A5A30] hover:bg-[#E6D7B8] transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-4 sm:p-5 max-h-[80vh] overflow-y-auto space-y-4">
        <!-- 赏/罚 阵营快速切换 -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-[#EFE5CE]/70 rounded-xl border border-[#D9C6A3]">
          <button
            type="button"
            class="py-2 rounded-lg font-serif font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="
              orderType === 'reward'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-[#6D4C1D] hover:bg-[#E6DAC0]'
            "
            @click="orderType = 'reward'"
          >
            <Sparkles class="w-4 h-4" />
            <span>【赏】励行奖赏令（+两）</span>
          </button>
          <button
            type="button"
            class="py-2 rounded-lg font-serif font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="
              orderType === 'penalty'
                ? 'bg-rose-700 text-white shadow-md'
                : 'text-[#6D4C1D] hover:bg-[#E6DAC0]'
            "
            @click="orderType = 'penalty'"
          >
            <AlertTriangle class="w-4 h-4" />
            <span>【罚】检视规诫令（-两）</span>
          </button>
        </div>

        <!-- 1. 选择受令家庭成员 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1.5">
            第一步：选择受令成员
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="m in silverStore.members"
              :key="m.id"
              type="button"
              class="flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer"
              :class="
                selectedMemberId === m.id
                  ? 'border-amber-600 bg-amber-50/90 shadow-sm'
                  : 'border-[#E0D2BA] bg-white/70 hover:bg-[#FAF5E8]'
              "
              @click="selectedMemberId = m.id"
            >
              <span class="text-2xl">{{ m.avatar }}</span>
              <div class="min-w-0">
                <div class="text-xs font-bold text-[#4A3319] truncate">{{ m.name }}</div>
                <div class="text-[10px] text-[#8C6D46]">
                  存银: <b class="text-amber-800">{{ m.balance }}</b>两
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- 2. 选择令库中的规约 / 手动填写 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-serif font-bold text-[#5C3F1B]">
              第二步：选择或拟定{{ orderType === 'reward' ? '奖赏令' : '规诫令' }}
            </label>
            <span class="text-[10px] text-[#8C6B3E]">支持点选快捷载入</span>
          </div>

          <!-- 快速点选令标签 -->
          <div class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-[#F5EEDD]/50 rounded-xl border border-[#E0D2BA]">
            <button
              v-for="ord in availableOrders"
              :key="ord.id"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer border flex items-center gap-1"
              :class="
                selectedOrderId === ord.id
                  ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                  : 'bg-white/80 text-[#5C3F1B] border-[#D9C6A3] hover:bg-amber-100/60'
              "
              @click="handleSelectOrder(ord)"
            >
              <span>{{ ord.title }}</span>
              <span class="text-[10px] font-mono opacity-90 font-bold">
                {{ orderType === 'reward' ? '+' : '-' }}{{ ord.amount }}两
              </span>
            </button>
          </div>

          <!-- 手动令名 -->
          <input
            v-model="titleInput"
            type="text"
            placeholder="或在此自定义拟定令名（如：今日主动洗脚、朗读背诵等）"
            class="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
          />
        </div>

        <!-- 3. 选择银票面额（1两, 5两, 10两, 50两, 100两） -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1.5">
            第三步：核定银票面额（核心道具）
          </label>
          <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
            <button
              v-for="val in denominations"
              :key="val"
              type="button"
              class="py-2 px-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer"
              :class="
                amountInput === val
                  ? 'border-amber-600 bg-amber-50 shadow-md ring-2 ring-amber-400'
                  : 'border-[#D9C6A3] bg-white/70 hover:bg-amber-50/50'
              "
              @click="handleSelectDenomination(val)"
            >
              <span class="font-serif font-bold text-sm text-[#4A3319]">{{ val }}两</span>
              <span class="text-[9px] text-[#8C6D46] scale-90">{{ SILVER_DENOMINATIONS[val]?.label }}</span>
            </button>
          </div>

          <!-- 自定义两数输入 -->
          <div class="mt-2 flex items-center gap-2">
            <span class="text-xs text-[#7A5A30]">自定义面额:</span>
            <input
              v-model.number="amountInput"
              type="number"
              min="1"
              max="1000"
              class="w-24 px-2.5 py-1 text-xs font-bold rounded-lg border border-[#D9C6A3] bg-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
            />
            <span class="text-xs text-[#7A5A30]">两银票</span>
          </div>
        </div>

        <!-- 实时仿真银票票样预览 -->
        <div class="p-3 bg-[#F4ECDC]/70 rounded-xl border border-[#D9C6A3] flex flex-col items-center">
          <div class="text-[11px] font-serif font-bold text-[#6D4C1D] mb-1.5 self-start flex items-center gap-1">
            <Stamp class="w-3.5 h-3.5 text-amber-800" />
            <span>实时奉颁银票样（盖印出票）：</span>
          </div>
          <SilverNoteCard
            :value="amountInput || 1"
            :member-name="currentMember?.name"
            :member-role="currentMember?.role"
            :member-avatar="currentMember?.avatar"
            :custom-note="currentMember?.customNote"
            size="md"
            class="max-w-[300px]"
          />
        </div>

        <!-- 4. 批注与经办掌柜 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-serif text-[#5C3F1B] mb-1">赏罚嘉言 / 批注说明</label>
            <input
              v-model="noteInput"
              type="text"
              placeholder="如：字迹端正、持之以恒、继续加油"
              class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label class="block text-xs font-serif text-[#5C3F1B] mb-1">经办人 / 当值掌柜</label>
            <input
              v-model="operatorInput"
              type="text"
              placeholder="如：妈妈、爸爸、家风掌柜"
              class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      <!-- 弹窗底部操作按钮 -->
      <div
        class="flex items-center justify-between px-5 py-3 border-t border-[#E3D3B5] bg-[#F4ECDC]/90"
      >
        <div class="text-xs text-[#7A5A30]">
          受令人：<b class="text-[#4A3319]">{{ currentMember?.name || '未选' }}</b>
          （变动：<span :class="orderType === 'reward' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'">
            {{ orderType === 'reward' ? '+' : '-' }}{{ amountInput }}两
          </span>）
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-serif text-[#6D4C1D] hover:bg-[#E6D7B8] transition-colors cursor-pointer"
            @click="emit('close')"
          >
            取消
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl text-xs font-serif font-bold text-white shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            :class="
              orderType === 'reward'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600'
            "
            @click="handleConfirm"
          >
            <Stamp class="w-4 h-4" />
            <span>{{ orderType === 'reward' ? '大印盖定 · 颁赏银票' : '铁面朱印 · 扣罚银票' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

