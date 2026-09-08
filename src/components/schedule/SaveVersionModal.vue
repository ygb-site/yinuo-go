<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  useScheduleStore,
  type GradeYear,
  type TermSemester,
  GRADE_YEAR_OPTIONS,
  TERM_SEMESTER_OPTIONS
} from '../../stores/useScheduleStore';
import { X, Check, Calendar, Bookmark } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', record: any): void;
}>();

const scheduleStore = useScheduleStore();

const gradeYear = ref<GradeYear>('g1');
const term = ref<TermSemester>('term1');
const versionDate = ref('');
const title = ref('');
const note = ref('');
const setAsCurrent = ref(true);

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

watch(
  () => props.show,
  (open) => {
    if (open) {
      const active = scheduleStore.activeRecord;
      gradeYear.value = active?.gradeYear || 'g1';
      term.value = active?.term || 'term1';
      versionDate.value = getTodayString();
      title.value = `${active?.gradeLabel || '一年级'}${active?.termLabel || '上学期'} ${versionDate.value}微调版`;
      note.value = '';
      setAsCurrent.value = true;
    }
  },
  { immediate: true }
);

function handleConfirm() {
  const gOpt = GRADE_YEAR_OPTIONS.find((g) => g.id === gradeYear.value);
  const tOpt = TERM_SEMESTER_OPTIONS.find((t) => t.id === term.value);
  const cleanDate = versionDate.value.trim() || getTodayString();

  const record = scheduleStore.saveNewVersionRecord({
    gradeYear: gradeYear.value,
    gradeLabel: gOpt?.label || '一年级',
    term: term.value,
    termLabel: tOpt?.label || '上学期',
    versionDate: cleanDate,
    title: title.value.trim() || `${gOpt?.label}${tOpt?.label} ${cleanDate}版`,
    note: note.value.trim(),
    setAsCurrent: setAsCurrent.value
  });

  emit('saved', record);
  emit('close');
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <Bookmark class="w-4 h-4 text-amber-600" />
          <span>归档为新课表版本</span>
        </h3>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <!-- 1. 年级划分 (大类) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">
            第 1 层：年级划分（大类）
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="g in GRADE_YEAR_OPTIONS"
              :key="g.id"
              type="button"
              class="py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer"
              :class="
                gradeYear === g.id
                  ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              "
              @click="gradeYear = g.id"
            >
              {{ g.label }}
            </button>
          </div>
        </div>

        <!-- 2. 学期划分 (上下) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">
            第 2 层：学期划分（上下学期）
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="t in TERM_SEMESTER_OPTIONS"
              :key="t.id"
              type="button"
              class="py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              :class="
                term === t.id
                  ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              "
              @click="term = t.id"
            >
              <span>{{ t.label }}</span>
              <span class="text-[11px] font-normal opacity-70">({{ t.season }})</span>
            </button>
          </div>
        </div>

        <!-- 3. 生效日期 (如 2026.09.07) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            第 3 层：版本生效日期（例如 2026.09.07）
          </label>
          <div class="relative">
            <Calendar class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="versionDate"
              type="text"
              placeholder="格式：YYYY.MM.DD，如 2026.09.07"
              class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-slate-800"
            />
          </div>
        </div>

        <!-- 版本名称与备注 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            版本名称 / 简题
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="如：京西校区 26-27 学年最新核定版"
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            变更说明 / 备注（备查）
          </label>
          <textarea
            v-model="note"
            rows="2"
            placeholder="记录这次课表调整的原因，例如：按校方通知调整周一第3节为校本古诗，周四第4节为语文2等..."
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          ></textarea>
        </div>

        <!-- 是否立即设为当前在用 -->
        <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
          <input
            v-model="setAsCurrent"
            type="checkbox"
            class="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
          />
          <span>归档后立即作为当前在用的正式课表</span>
        </label>
      </div>

      <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/80">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
          @click="handleConfirm"
        >
          <Check class="w-4 h-4" />
          <span>确认归档版本</span>
        </button>
      </div>
    </div>
  </div>
</template>

