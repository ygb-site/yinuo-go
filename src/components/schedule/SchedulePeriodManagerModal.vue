<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  useScheduleStore,
  type SchedulePeriod,
  type PeriodSlotType
} from '../../stores/useScheduleStore';
import { showAlert, showConfirm } from '../../utils/alert';
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Layers
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const scheduleStore = useScheduleStore();

// 新增节次表单
const showAddForm = ref(false);
const newPeriodLabel = ref('');
const newPeriodTime = ref('');
const newPeriodSlotType = ref<PeriodSlotType>('afternoon');

const slotOptions: { id: PeriodSlotType; label: string; icon: string }[] = [
  { id: 'morning_read', label: '早读 / 晨读', icon: '🌅' },
  { id: 'morning', label: '上午课程', icon: '☀️' },
  { id: 'afternoon', label: '下午课程', icon: '🌇' },
  { id: 'evening', label: '晚自习 / 托管', icon: '🌙' }
];

const hasMorningRead = computed(() =>
  scheduleStore.periods.some((p) => p.slotType === 'morning_read' || p.label.includes('早读'))
);

const hasEightPeriods = computed(() =>
  scheduleStore.periods.some((p) => p.label.includes('7') || p.label.includes('8'))
);

const hasEveningStudy = computed(() =>
  scheduleStore.periods.some((p) => p.slotType === 'evening' || p.label.includes('晚自习'))
);

function slotLabel(type: PeriodSlotType) {
  const map: Record<PeriodSlotType, string> = {
    morning_read: '早读',
    morning: '上午',
    afternoon: '下午',
    evening: '晚自习'
  };
  return map[type] || '课程';
}

function slotBadgeClass(type: PeriodSlotType) {
  const map: Record<PeriodSlotType, string> = {
    morning_read: 'bg-amber-100 text-amber-900 border-amber-200',
    morning: 'bg-orange-100 text-orange-900 border-orange-200',
    afternoon: 'bg-sky-100 text-sky-900 border-sky-200',
    evening: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  };
  return map[type] || 'bg-slate-100 text-slate-700';
}

// 快捷操作
function handleToggleMorningRead() {
  if (hasMorningRead.value) {
    // 移除早读
    const p = scheduleStore.periods.find((item) => item.slotType === 'morning_read' || item.label.includes('早读'));
    if (p) scheduleStore.removePeriod(p.id);
  } else {
    scheduleStore.enableMorningRead();
  }
}

function handleToggleEightPeriods() {
  if (hasEightPeriods.value) {
    scheduleStore.periods = scheduleStore.periods.filter((p) => !p.label.includes('7') && !p.label.includes('8'));
    scheduleStore.syncPeriodsToActiveRecord();
  } else {
    scheduleStore.enableEightPeriods();
  }
}

function handleToggleEveningStudy() {
  if (hasEveningStudy.value) {
    const p = scheduleStore.periods.find((item) => item.slotType === 'evening' || item.label.includes('晚自习'));
    if (p) scheduleStore.removePeriod(p.id);
  } else {
    scheduleStore.enableEveningStudy();
  }
}

async function handleResetDefault() {
  const confirmed = await showConfirm({
    title: '恢复标准 6 节课',
    message: '确认将节次重置为小学标准的 1~6 节课结构吗？',
    confirmText: '确认重置',
    cancelText: '取消'
  });
  if (confirmed) {
    scheduleStore.resetPeriodsToDefault();
    await showAlert({ title: '已恢复', message: '已恢复为标准 6 节课结构。', type: 'info' });
  }
}

async function handleRemovePeriod(period: SchedulePeriod) {
  if (scheduleStore.periods.length <= 1) {
    await showAlert({ title: '提示', message: '课表至少保留 1 个节次哦！', type: 'warning' });
    return;
  }
  const confirmed = await showConfirm({
    title: '删除节次',
    message: `确定要从课表中移除「${period.label}」吗？已排的该节课程将被清除。`,
    confirmText: '删除',
    cancelText: '取消'
  });
  if (confirmed) {
    scheduleStore.removePeriod(period.id);
  }
}

// 自定义添加
function handleAddPeriod() {
  const label = newPeriodLabel.value.trim();
  if (!label) {
    showAlert({ title: '温馨提示', message: '请输入节次名称，如“第7节”、“晚自修”等', type: 'warning' });
    return;
  }
  scheduleStore.addCustomPeriod({
    label,
    time: newPeriodTime.value.trim(),
    slotType: newPeriodSlotType.value
  });
  showAddForm.value = false;
  newPeriodLabel.value = '';
  newPeriodTime.value = '';
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- 弹窗顶栏 -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <div class="flex items-center gap-2.5">
          <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-800">
            <Layers class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">
              节次与时段设置（当前 {{ scheduleStore.periods.length }} 节）
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              支持自由增减早读/晨读、扩充至8节课、晚自习及定制时段
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-5 space-y-4">
        <!-- 常用一键快捷模板 -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <div class="text-xs font-bold text-slate-700">常用节次时段快捷开关：</div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5"
              :class="
                hasMorningRead
                  ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              "
              @click="handleToggleMorningRead"
            >
              <span>🌅 {{ hasMorningRead ? '✓ 已开启早读' : '＋ 开启早读/晨练' }}</span>
            </button>

            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5"
              :class="
                hasEightPeriods
                  ? 'bg-sky-700 text-white border-sky-800 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              "
              @click="handleToggleEightPeriods"
            >
              <span>📚 {{ hasEightPeriods ? '✓ 已开启8节课(含第7/8节)' : '＋ 扩充为8节课' }}</span>
            </button>

            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5"
              :class="
                hasEveningStudy
                  ? 'bg-indigo-700 text-white border-indigo-800 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              "
              @click="handleToggleEveningStudy"
            >
              <span>🌙 {{ hasEveningStudy ? '✓ 已开启晚自习' : '＋ 开启晚自习/托管' }}</span>
            </button>

            <button
              type="button"
              class="ml-auto px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer flex items-center gap-1"
              @click="handleResetDefault"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>重置6节</span>
            </button>
          </div>
        </div>

        <!-- 节次清单 -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-bold text-slate-700">当前排定的节次清单：</span>
            <button
              type="button"
              class="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              @click="showAddForm = !showAddForm"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>{{ showAddForm ? '收起表单' : '＋ 添加自定节次' }}</span>
            </button>
          </div>

          <!-- 自定义添加节次表单折叠区 -->
          <div
            v-if="showAddForm"
            class="mb-3 p-3.5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 space-y-3 animate-in fade-in"
          >
            <div class="text-xs font-bold text-amber-950">新建自定义课表节次：</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-medium text-slate-600 mb-1">节次名称 *</label>
                <input
                  v-model="newPeriodLabel"
                  type="text"
                  placeholder="如：早读、第7节、第8节、晚自修..."
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-slate-600 mb-1">时段范围 (选填)</label>
                <input
                  v-model="newPeriodTime"
                  type="text"
                  placeholder="如：16:30-17:15"
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <!-- 所属大时段 -->
            <div>
              <label class="block text-[11px] font-medium text-slate-600 mb-1">归属大时段</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  v-for="so in slotOptions"
                  :key="so.id"
                  type="button"
                  class="py-1 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1"
                  :class="
                    newPeriodSlotType === so.id
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  "
                  @click="newPeriodSlotType = so.id"
                >
                  <span>{{ so.icon }}</span>
                  <span>{{ so.label }}</span>
                </button>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition cursor-pointer"
                @click="handleAddPeriod"
              >
                添加并加入课表
              </button>
            </div>
          </div>

          <!-- 节次项列表卡片 -->
          <div class="space-y-2 max-h-64 overflow-y-auto p-0.5">
            <div
              v-for="p in scheduleStore.periods"
              :key="p.id"
              class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold px-2 py-0.5 rounded-md border" :class="slotBadgeClass(p.slotType)">
                  {{ slotLabel(p.slotType) }}
                </span>
                <div>
                  <span class="text-sm font-bold text-slate-800">{{ p.label }}</span>
                  <span v-if="p.time" class="text-xs text-slate-400 font-mono ml-2">({{ p.time }})</span>
                </div>
              </div>

              <button
                type="button"
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title="删除该节次"
                @click="handleRemovePeriod(p)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底栏 -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/80">
        <span class="text-xs text-slate-400">
          已自动同步当前课表版本与云端
        </span>
        <button
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm cursor-pointer"
          @click="emit('close')"
        >
          完成设置
        </button>
      </div>
    </div>
  </div>
</template>

