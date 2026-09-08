<script setup lang="ts">
import { ref, computed } from 'vue';
import { showAlert, showConfirm } from '../../utils/alert';
import {
  useScheduleStore,
  type GradeYear,
  type TermSemester,
  GRADE_YEAR_OPTIONS,
  TERM_SEMESTER_OPTIONS,
  type ScheduleVersionRecord
} from '../../stores/useScheduleStore';
import { X, CheckCircle2, Trash2, Plus, Eye, Check, CalendarRange } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'openNew'): void;
}>();

const scheduleStore = useScheduleStore();

// 筛选：年级与学期
const selectedGrade = ref<GradeYear | 'all'>('all');
const selectedTerm = ref<TermSemester | 'all'>('all');

const filteredRecords = computed(() => {
  return scheduleStore.versionRecords.filter((r) => {
    if (selectedGrade.value !== 'all' && r.gradeYear !== selectedGrade.value) return false;
    if (selectedTerm.value !== 'all' && r.term !== selectedTerm.value) return false;
    return true;
  });
});

// 切换查看
function handleSelectVersion(record: ScheduleVersionRecord) {
  scheduleStore.switchVersionRecord(record.id);
  emit('close');
}

// 设为正式执行
function handleSetAsCurrent(record: ScheduleVersionRecord) {
  scheduleStore.setRecordAsCurrent(record.id);
}

// 删除版本
async function handleDelete(record: ScheduleVersionRecord) {
  if (record.isCurrent) {
    await showAlert({
      title: '无法删除',
      message: '当前正式执行中的课表版本不可删除！',
      type: 'warning'
    });
    return;
  }
  const confirmed = await showConfirm({
    title: '确认删除版本',
    message: `确定要删除课表版本「${record.title} (${record.versionDate})」吗？删除后不可恢复。`,
    confirmText: '确认删除',
    cancelText: '再想想'
  });
  if (confirmed) {
    scheduleStore.deleteVersionRecord(record.id);
    await showAlert({
      title: '删除成功',
      message: '该课表版本已成功归档移除。',
      type: 'info'
    });
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- 弹窗顶栏 -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <div class="flex items-center gap-2.5">
          <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-800">
            <CalendarRange class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">课表历史版本记录簿</h3>
            <p class="text-[11px] text-slate-400">
              分年级 · 分上下学期 · 按生效日期永久归档
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 筛选栏：1. 年级划分 2. 上下学期划分 -->
      <div class="p-4 border-b border-slate-100 bg-white space-y-2.5">
        <!-- 年级维度 -->
        <div class="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span class="text-xs font-bold text-slate-500 shrink-0">年级划分:</span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="selectedGrade === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="selectedGrade = 'all'"
          >
            全部年级
          </button>
          <button
            v-for="g in GRADE_YEAR_OPTIONS"
            :key="g.id"
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="selectedGrade === g.id ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="selectedGrade = g.id"
          >
            {{ g.label }}
          </button>
        </div>

        <!-- 学期维度 -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500 shrink-0">学期划分:</span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="selectedTerm === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="selectedTerm = 'all'"
          >
            全学期
          </button>
          <button
            v-for="t in TERM_SEMESTER_OPTIONS"
            :key="t.id"
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="selectedTerm === t.id ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="selectedTerm = t.id"
          >
            {{ t.label }} ({{ t.season }})
          </button>
        </div>
      </div>

      <!-- 版本卡片列表 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        <div v-if="filteredRecords.length === 0" class="py-12 text-center text-slate-400 text-xs">
          暂无此筛选条件下的课表版本记录
        </div>

        <div
          v-for="rec in filteredRecords"
          :key="rec.id"
          class="rounded-2xl border bg-white p-4 transition-all shadow-2xs hover:shadow-md"
          :class="
            scheduleStore.activeRecordId === rec.id
              ? 'border-amber-400 ring-2 ring-amber-400/30'
              : 'border-slate-200'
          "
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <!-- 左侧信息 -->
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                  {{ rec.gradeLabel }} · {{ rec.termLabel }}
                </span>
                <span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  📅 {{ rec.versionDate }} 版本
                </span>
                <span
                  v-if="rec.isCurrent"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  <span>当前在用</span>
                </span>
                <span
                  v-if="scheduleStore.activeRecordId === rec.id"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white"
                >
                  当前查看中
                </span>
              </div>

              <h4 class="text-sm font-bold text-slate-900 leading-snug">
                {{ rec.title }}
              </h4>
              <div class="text-[10px] text-slate-400 font-mono pt-0.5">
                {{ rec.schoolName }} · {{ rec.className }}
              </div>
            </div>

            <!-- 右侧操作栏 -->
            <div class="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                :class="
                  scheduleStore.activeRecordId === rec.id
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                "
                @click="handleSelectVersion(rec)"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>{{ scheduleStore.activeRecordId === rec.id ? '正在展示' : '切换载入' }}</span>
              </button>

              <button
                v-if="!rec.isCurrent"
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 cursor-pointer"
                title="将此历史版本作为正式执行课表"
                @click="handleSetAsCurrent(rec)"
              >
                <Check class="w-3.5 h-3.5" />
                <span>设为当前在用</span>
              </button>

              <button
                v-if="!rec.isCurrent"
                type="button"
                class="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="删除该历史版本"
                @click="handleDelete(rec)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底栏 -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
        <span class="text-xs text-slate-400">
          共收录 {{ scheduleStore.versionRecords.length }} 份课表版本档案
        </span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            @click="emit('close')"
          >
            关闭
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
            @click="
              emit('close');
              emit('openNew');
            "
          >
            <Plus class="w-4 h-4" />
            <span>保存为新日期版本</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

