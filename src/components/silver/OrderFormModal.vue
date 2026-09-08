<script setup lang="ts">
import { ref, watch } from 'vue';
import { showAlert } from '../../utils/alert';
import { useSilverStore } from '../../stores/useSilverStore';
import type { FamilyOrder, OrderType, OrderCategory, SilverDenominationValue } from '../../types/silver';
import { X, Check, Sparkles, AlertTriangle } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  order?: FamilyOrder | null;
  defaultType?: OrderType;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', order: any): void;
}>();

const silverStore = useSilverStore();

const title = ref('');
const description = ref('');
const type = ref<OrderType>('reward');
const amount = ref<number>(5);
const category = ref<OrderCategory>('study');
const targetMemberId = ref('');

const denominations: SilverDenominationValue[] = [1, 5, 10, 50, 100];

const categories: { id: OrderCategory; label: string }[] = [
  { id: 'study', label: '学习功课' },
  { id: 'habit', label: '起居自律' },
  { id: 'chore', label: '家务劳动' },
  { id: 'character', label: '言行品性' },
  { id: 'life', label: '生活作息' }
];

watch(
  () => props.show,
  (open) => {
    if (open) {
      if (props.order) {
        title.value = props.order.title;
        description.value = props.order.description || '';
        type.value = props.order.type;
        amount.value = props.order.amount;
        category.value = props.order.category;
        targetMemberId.value = props.order.targetMemberId || '';
      } else {
        title.value = '';
        description.value = '';
        type.value = props.defaultType || 'reward';
        amount.value = 5;
        category.value = 'study';
        targetMemberId.value = '';
      }
    }
  },
  { immediate: true }
);

function handleSave() {
  if (!title.value.trim()) {
    showAlert({ title: '温馨提示', message: '请输入令名（公约名称）！', type: 'warning' });
    return;
  }
  if (amount.value <= 0) {
    showAlert({ title: '温馨提示', message: '银票面额须大于 0 两！', type: 'warning' });
    return;
  }

  if (props.order) {
    silverStore.updateOrder(props.order.id, {
      title: title.value.trim(),
      description: description.value.trim(),
      type: type.value,
      amount: amount.value,
      category: category.value,
      targetMemberId: targetMemberId.value || undefined
    });
  } else {
    silverStore.addOrder({
      title: title.value.trim(),
      description: description.value.trim(),
      type: type.value,
      amount: amount.value,
      category: category.value,
      targetMemberId: targetMemberId.value || undefined,
      enabled: true
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
      class="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#FAF5E8] border-2 border-[#8C6D46] shadow-2xl overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-[#E3D3B5] bg-[#F4ECDC]/90">
        <h3 class="text-base font-serif font-bold text-[#4A3319]">
          {{ order ? '修订家庭令' : '立下新家庭令（赏罚公约）' }}
        </h3>
        <button
          type="button"
          class="p-1 rounded-full text-[#7A5A30] hover:bg-[#E6D7B8] transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- 规约性质：赏 or 罚 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1.5">赏罚性质</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="py-2 px-3 rounded-xl border-2 font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              :class="
                type === 'reward'
                  ? 'border-amber-600 bg-amber-100/80 text-amber-900 shadow-xs'
                  : 'border-[#D9C6A3] bg-white/70 text-[#7A5A30]'
              "
              @click="type = 'reward'"
            >
              <Sparkles class="w-4 h-4 text-amber-600" />
              <span>【赏·奖赏令】达成嘉奖赐银票</span>
            </button>
            <button
              type="button"
              class="py-2 px-3 rounded-xl border-2 font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              :class="
                type === 'penalty'
                  ? 'border-rose-600 bg-rose-100/80 text-rose-900 shadow-xs'
                  : 'border-[#D9C6A3] bg-white/70 text-[#7A5A30]'
              "
              @click="type = 'penalty'"
            >
              <AlertTriangle class="w-4 h-4 text-rose-600" />
              <span>【罚·规诫令】违约违纪扣除银票</span>
            </button>
          </div>
        </div>

        <!-- 令名 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">
            令名（公约名称）<span class="text-rose-600">*</span>
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="如：晨间朗诵30分钟、按时就寝、吃饭拖延不收餐具等"
            class="w-full px-3 py-2 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
          />
        </div>

        <!-- 银票面额选择 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1.5">
            赏罚银票面额（两）
          </label>
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="v in denominations"
              :key="v"
              type="button"
              class="py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer"
              :class="
                amount === v
                  ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                  : 'border-[#D9C6A3] bg-white text-[#5C3F1B] hover:bg-amber-50'
              "
              @click="amount = v"
            >
              {{ v }}两
            </button>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-xs text-[#7A5A30]">自定两数：</span>
            <input
              v-model.number="amount"
              type="number"
              min="1"
              max="500"
              class="w-20 px-2 py-1 text-xs rounded-lg border border-[#D9C6A3] bg-white text-center font-bold text-amber-900"
            />
            <span class="text-xs text-[#7A5A30]">两</span>
          </div>
        </div>

        <!-- 所属类别 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1.5">规约类别</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-serif transition-all cursor-pointer border"
              :class="
                category === cat.id
                  ? 'border-amber-700 bg-amber-700 text-white'
                  : 'border-[#D9C6A3] bg-white text-[#6D4C1D] hover:bg-[#FAF5E8]'
              "
              @click="category = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- 详细说明 -->
        <div>
          <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">契约说明 / 达成标准</label>
          <textarea
            v-model="description"
            rows="2"
            placeholder="写清执行细节，例如：需主动完成且字迹端正、长辈提醒不超过1次等..."
            class="w-full px-3 py-2 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
          ></textarea>
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
          <span>镌刻公约</span>
        </button>
      </div>
    </div>
  </div>
</template>

