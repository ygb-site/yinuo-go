<script setup lang="ts">
import { computed } from 'vue';
import { Sun, Sunset } from 'lucide-vue-next';
import {
  WEEKDAYS,
  MORNING_PERIODS,
  AFTERNOON_PERIODS,
  SUBJECT_CELL_CLASS,
  SUBJECT_POSTER_CLASS,
  useScheduleStore,
  type WeekdayId,
  type SchedulePeriod
} from '../../stores/useScheduleStore';
import type { ScheduleSkinId, ScrapbookColorSplit } from '../../domain/schedule/scheduleSkins';

const props = withDefaults(
  defineProps<{
    skinId: ScheduleSkinId;
    /** 可点击换课；导出时关闭 */
    interactive?: boolean;
    todayId: WeekdayId | null;
    mobileDay: WeekdayId;
    /** 导出画布用更大字号与固定宽度构图 */
    exportMode?: boolean;
    /** 手账贴纸粉蓝分色方式 */
    scrapbookSplit?: ScrapbookColorSplit;
  }>(),
  {
    interactive: true,
    exportMode: false,
    scrapbookSplit: 'am-pm'
  }
);

const emit = defineEmits<{
  pick: [day: WeekdayId, period: number];
}>();

const scheduleStore = useScheduleStore();

/** 贴墙导出不带「今天」选中高亮，五天一视同仁 */
const highlightTodayId = computed(() => (props.exportMode ? null : props.todayId));

const morningPeriods = MORNING_PERIODS;
const afternoonPeriods = AFTERNOON_PERIODS;
const allPeriods = [...MORNING_PERIODS, ...AFTERNOON_PERIODS];

const cellOf = (day: WeekdayId, period: number) => scheduleStore.cellSubject(day, period);

const periodShort = (period: SchedulePeriod) =>
  period.label.replace('第', '').replace('节', '');

const onPick = (day: WeekdayId, period: number) => {
  if (!props.interactive) return;
  emit('pick', day, period);
};

/** 便签微倾角，固定伪随机，导出也不抖 */
const stickyTilt = (day: WeekdayId, period: number) => {
  const tilts = [-2.4, 1.8, -1.2, 2.6, -1.8, 1.4, -2.8, 2.1];
  return tilts[(day * 7 + period) % tilts.length];
};

const stickyTone: Record<string, string> = {
  rose: 'bg-[#FFE4E8] text-rose-900 border-rose-300/50',
  sky: 'bg-[#DDF4FF] text-sky-900 border-sky-300/50',
  indigo: 'bg-[#E4E4FF] text-indigo-900 border-indigo-300/50',
  amber: 'bg-[#FFF3D6] text-amber-950 border-amber-300/50',
  emerald: 'bg-[#DDF8E8] text-emerald-900 border-emerald-300/50',
  orange: 'bg-[#FFE8D6] text-orange-950 border-orange-300/50',
  violet: 'bg-[#F0E6FF] text-violet-900 border-violet-300/50',
  pink: 'bg-[#FFE0F0] text-pink-900 border-pink-300/50',
  teal: 'bg-[#D9F5F2] text-teal-900 border-teal-300/50',
  cyan: 'bg-[#D8F7FF] text-cyan-900 border-cyan-300/50',
  slate: 'bg-[#EEF1F4] text-slate-700 border-slate-300/50',
  lime: 'bg-[#E8F9C8] text-lime-900 border-lime-300/50'
};

const chalkTone: Record<string, string> = {
  rose: 'text-rose-300',
  sky: 'text-sky-300',
  indigo: 'text-indigo-300',
  amber: 'text-amber-200',
  emerald: 'text-emerald-300',
  orange: 'text-orange-300',
  violet: 'text-violet-300',
  pink: 'text-pink-300',
  teal: 'text-teal-300',
  cyan: 'text-cyan-300',
  slate: 'text-slate-200',
  lime: 'text-lime-300'
};

const brickTone: Record<string, string> = {
  rose: 'bg-rose-300 text-rose-950 border-rose-900',
  sky: 'bg-sky-300 text-sky-950 border-sky-900',
  indigo: 'bg-indigo-300 text-indigo-950 border-indigo-900',
  amber: 'bg-amber-300 text-amber-950 border-amber-900',
  emerald: 'bg-emerald-300 text-emerald-950 border-emerald-900',
  orange: 'bg-orange-300 text-orange-950 border-orange-900',
  violet: 'bg-violet-300 text-violet-950 border-violet-900',
  pink: 'bg-pink-300 text-pink-950 border-pink-900',
  teal: 'bg-teal-300 text-teal-950 border-teal-900',
  cyan: 'bg-cyan-300 text-cyan-950 border-cyan-900',
  slate: 'bg-slate-300 text-slate-900 border-slate-800',
  lime: 'bg-lime-300 text-lime-950 border-lime-900'
};

const dayAccent: Record<WeekdayId, string> = {
  1: 'from-rose-400 to-rose-500',
  2: 'from-sky-400 to-sky-500',
  3: 'from-violet-400 to-violet-500',
  4: 'from-amber-400 to-amber-500',
  5: 'from-emerald-400 to-emerald-500'
};

/**
 * 手账粉蓝渐变：返回 0(偏粉) → 1(偏蓝) 的过渡系数，避免硬切
 * am-pm：按节次从上到下
 * week-split / page-split：按星期从左到右
 * diagonal：左上粉 → 右下蓝（天 + 节次一起加权）
 */
const scrapbookBlend = (day: WeekdayId, period: number) => {
  if (props.scrapbookSplit === 'am-pm') {
    return (period - 1) / 5;
  }
  if (props.scrapbookSplit === 'diagonal') {
    const x = (day - 1) / 4;
    const y = (period - 1) / 5;
    return Math.min(1, Math.max(0, (x + y) / 2));
  }
  // week-split / page-split：周一偏粉 → 周五偏蓝
  return (day - 1) / 4;
};

const scrapbookMix = (t: number, pink: string, mid: string, blue: string) => {
  if (t < 0.45) return pink;
  if (t > 0.55) return blue;
  return mid;
};

const scrapbookDayPill = (day: WeekdayId) => {
  const t = scrapbookBlend(day, 1);
  return scrapbookMix(
    t,
    'bg-white border-pink-300 text-pink-600',
    'bg-white border-fuchsia-200 text-fuchsia-600',
    'bg-white border-sky-300 text-sky-600'
  );
};

const scrapbookCellStyle = (day: WeekdayId, period: number, empty: boolean) => {
  const t = scrapbookBlend(day, period);
  // 柔和底色：粉 → 淡紫 → 蓝
  const r = Math.round(255 - t * 30);
  const g = Math.round(240 - t * 8 + (t > 0.5 ? (t - 0.5) * 40 : 0));
  const b = Math.round(247 + t * 8);
  const border = empty
    ? scrapbookMix(t, 'rgba(244,114,182,0.35)', 'rgba(232,121,249,0.35)', 'rgba(56,189,248,0.4)')
    : scrapbookMix(t, 'rgba(244,114,182,0.45)', 'rgba(232,121,249,0.4)', 'rgba(56,189,248,0.5)');
  return {
    backgroundColor: empty ? 'rgba(255,255,255,0.72)' : `rgba(${r}, ${g}, ${b}, 0.55)`,
    borderColor: border
  };
};

const scrapbookPeriodLabel = (day: WeekdayId, period: number) => {
  const t = scrapbookBlend(day, period);
  return scrapbookMix(t, 'text-pink-400', 'text-fuchsia-400', 'text-sky-500');
};

const scrapbookBoardStyle = computed(() => {
  if (props.scrapbookSplit === 'am-pm') {
    return {
      background:
        'linear-gradient(180deg, #FFF0F7 0%, #FFF5FB 35%, #F5F0FF 55%, #EAF6FF 78%, #E0F2FE 100%)'
    };
  }
  if (props.scrapbookSplit === 'week-split') {
    return {
      background:
        'linear-gradient(90deg, #FFF0F7 0%, #FFE4F0 22%, #F3E8FF 48%, #E0F2FE 75%, #BAE6FD 100%)'
    };
  }
  if (props.scrapbookSplit === 'diagonal') {
    return {
      background:
        'linear-gradient(135deg, #FFF0F7 0%, #FFE4F0 22%, #F3E8FF 48%, #E0F2FE 72%, #BAE6FD 100%)'
    };
  }
  // page-split：左右渐变，中间柔和过渡带
  return {
    background:
      'linear-gradient(90deg, #FFF0F7 0%, #FFE8F3 28%, #F5EEFF 50%, #E8F6FF 72%, #DBF0FF 100%)'
  };
});
</script>

<template>
  <div>
    <!-- ========== 1. 暖纸海报：圆角色块 + 侧栏 ========== -->
    <div v-if="skinId === 'poster'" class="space-y-3">
      <div
        class="hidden lg:block overflow-x-auto rounded-2xl border border-amber-200/60 bg-white/70"
        :class="exportMode ? '!block' : ''"
      >
        <table class="w-full table-fixed border-collapse">
          <colgroup>
            <col class="w-[3.25rem]" />
            <col class="w-[4.25rem]" />
            <col v-for="day in WEEKDAYS" :key="`p-col-${day.id}`" />
          </colgroup>
          <thead>
            <tr class="bg-gradient-to-b from-amber-50 to-[#FFF8EE]">
              <th colspan="2" class="h-12 text-[11px] font-bold text-amber-700/70 border-b border-r border-amber-200/60">时段</th>
              <th
                v-for="day in WEEKDAYS"
                :key="`p-h-${day.id}`"
                class="h-12 text-sm font-bold border-b border-amber-200/60"
                :class="[
                  day.id < 5 ? 'border-r border-amber-200/50' : '',
                  highlightTodayId === day.id ? 'bg-amber-100/70 text-amber-900' : 'text-slate-700'
                ]"
              >
                {{ day.name }}
                <span
                  v-if="!exportMode && highlightTodayId === day.id"
                  class="ml-1 text-[10px] font-bold text-amber-800 bg-white border border-amber-200 px-1.5 py-0.5 rounded-md"
                >今天</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="section in [
              { title: '上午', periods: morningPeriods, rail: 'from-amber-100 to-orange-50 text-amber-800', icon: 'sun' },
              { title: '下午', periods: afternoonPeriods, rail: 'from-sky-100 to-cyan-50 text-sky-800', icon: 'sunset' }
            ]" :key="section.title">
              <tr v-for="(period, index) in section.periods" :key="`p-${period.id}`">
                <td
                  v-if="index === 0"
                  :rowspan="section.periods.length"
                  class="align-middle border-b border-r border-amber-200/50 px-1 bg-gradient-to-b"
                  :class="section.rail"
                >
                  <div class="flex flex-col items-center gap-1 py-3">
                    <Sun v-if="section.icon === 'sun'" class="w-4 h-4 opacity-80" />
                    <Sunset v-else class="w-4 h-4 opacity-80" />
                    <span class="text-[13px] font-black" style="writing-mode: vertical-rl; letter-spacing: 0.18em;">{{ section.title }}</span>
                  </div>
                </td>
                <td class="h-[4.1rem] text-center border-b border-r border-amber-200/50 bg-[#FFFBF5]/60 text-[12px] font-bold text-slate-600">
                  {{ period.label }}
                </td>
                <td
                  v-for="day in WEEKDAYS"
                  :key="`p-${day.id}-${period.id}`"
                  class="h-[4.1rem] p-1.5 border-b border-amber-200/45"
                  :class="[day.id < 5 ? 'border-r border-amber-200/45' : '', highlightTodayId === day.id ? 'bg-amber-50/50' : '']"
                >
                  <button
                    type="button"
                    class="w-full h-full min-h-[3.1rem] rounded-xl flex items-center justify-center px-1.5 border text-[13px] font-bold"
                    :class="
                      cellOf(day.id, period.id).id === 'empty'
                        ? 'border-dashed border-amber-200 text-amber-300'
                        : SUBJECT_POSTER_CLASS[cellOf(day.id, period.id).tone]
                    "
                    :disabled="!interactive"
                    @click="onPick(day.id, period.id)"
                  >
                    {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 手机：海报列表 -->
      <div v-if="!exportMode" class="lg:hidden space-y-3">
        <div
          v-for="section in [
            { title: '上午', periods: morningPeriods, banner: 'bg-amber-50 text-amber-800' },
            { title: '下午', periods: afternoonPeriods, banner: 'bg-sky-50 text-sky-800' }
          ]"
          :key="`pm-${section.title}`"
          class="rounded-2xl border border-amber-200/55 overflow-hidden bg-white/70"
        >
          <div class="px-3.5 py-2 text-xs font-black" :class="section.banner">{{ section.title }}</div>
          <button
            v-for="period in section.periods"
            :key="`pm-${period.id}`"
            type="button"
            class="w-full flex border-b border-amber-100 last:border-0"
            @click="onPick(mobileDay, period.id)"
          >
            <div class="w-12 flex items-center justify-center text-[12px] font-black text-slate-600 bg-[#FFFBF5] border-r border-amber-100 py-3.5">
              {{ periodShort(period) }}
            </div>
            <div class="flex-1 px-3 py-2.5 flex items-center min-h-[3.4rem]">
              <span
                v-if="cellOf(mobileDay, period.id).id !== 'empty'"
                class="inline-flex px-2.5 py-1.5 rounded-xl border text-sm font-bold"
                :class="SUBJECT_POSTER_CLASS[cellOf(mobileDay, period.id).tone]"
              >{{ cellOf(mobileDay, period.id).name }}</span>
              <span v-else class="text-sm text-amber-300 font-medium">选择课程</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 2. 学校纸表：密线、字色、分组横条 ========== -->
    <div v-else-if="skinId === 'classic'">
      <div
        class="hidden lg:block overflow-x-auto bg-white border-2 border-slate-800"
        :class="exportMode ? '!block' : ''"
      >
        <table class="w-full table-fixed border-collapse">
          <thead>
            <tr class="bg-slate-100">
              <th class="h-11 w-20 text-xs font-black text-slate-800 border border-slate-800">节次</th>
              <th
                v-for="day in WEEKDAYS"
                :key="`c-h-${day.id}`"
                class="h-11 text-sm font-black border border-slate-800"
                :class="highlightTodayId === day.id ? 'bg-yellow-100' : 'text-slate-800'"
              >{{ day.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="6" class="h-8 bg-slate-800 text-center text-[11px] font-black tracking-[0.35em] text-white border border-slate-800">
                上 午
              </td>
            </tr>
            <tr v-for="period in morningPeriods" :key="`c-m-${period.id}`">
              <td class="h-12 text-center text-xs font-bold text-slate-700 border border-slate-800 bg-slate-50">{{ period.label }}</td>
              <td
                v-for="day in WEEKDAYS"
                :key="`c-m-${day.id}-${period.id}`"
                class="h-12 p-0 border border-slate-800"
                :class="highlightTodayId === day.id ? 'bg-yellow-50' : 'bg-white'"
              >
                <button
                  type="button"
                  class="w-full h-12 text-[13px] font-bold"
                  :class="cellOf(day.id, period.id).id === 'empty' ? 'text-slate-300' : SUBJECT_CELL_CLASS[cellOf(day.id, period.id).tone]"
                  :disabled="!interactive"
                  @click="onPick(day.id, period.id)"
                >
                  {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '' : '·') : cellOf(day.id, period.id).name }}
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="6" class="h-8 bg-slate-700 text-center text-[11px] font-black tracking-[0.35em] text-white border border-slate-800">
                下 午
              </td>
            </tr>
            <tr v-for="period in afternoonPeriods" :key="`c-a-${period.id}`">
              <td class="h-12 text-center text-xs font-bold text-slate-700 border border-slate-800 bg-slate-50">{{ period.label }}</td>
              <td
                v-for="day in WEEKDAYS"
                :key="`c-a-${day.id}-${period.id}`"
                class="h-12 p-0 border border-slate-800"
                :class="highlightTodayId === day.id ? 'bg-yellow-50' : 'bg-white'"
              >
                <button
                  type="button"
                  class="w-full h-12 text-[13px] font-bold"
                  :class="cellOf(day.id, period.id).id === 'empty' ? 'text-slate-300' : SUBJECT_CELL_CLASS[cellOf(day.id, period.id).tone]"
                  :disabled="!interactive"
                  @click="onPick(day.id, period.id)"
                >
                  {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '' : '·') : cellOf(day.id, period.id).name }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!exportMode" class="lg:hidden border-2 border-slate-800 bg-white overflow-hidden">
        <div class="bg-slate-800 text-white text-center text-xs font-black py-2 tracking-widest">{{ WEEKDAYS.find(d => d.id === mobileDay)?.name }}</div>
        <template v-for="(group, gi) in [{ t: '上午', ps: morningPeriods }, { t: '下午', ps: afternoonPeriods }]" :key="group.t">
          <div class="bg-slate-700 text-white text-[11px] font-black text-center py-1.5 tracking-[0.3em]">{{ group.t }}</div>
          <button
            v-for="period in group.ps"
            :key="`cm-${gi}-${period.id}`"
            type="button"
            class="w-full flex border-b border-slate-800"
            @click="onPick(mobileDay, period.id)"
          >
            <div class="w-16 py-3 text-xs font-bold text-center border-r border-slate-800 bg-slate-50">{{ period.label }}</div>
            <div
              class="flex-1 py-3 px-3 text-sm font-bold"
              :class="cellOf(mobileDay, period.id).id === 'empty' ? 'text-slate-300' : SUBJECT_CELL_CLASS[cellOf(mobileDay, period.id).tone]"
            >
              {{ cellOf(mobileDay, period.id).id === 'empty' ? '选择课程' : cellOf(mobileDay, period.id).name }}
            </div>
          </button>
        </template>
      </div>
    </div>

    <!-- ========== 3. 五日分栏：每天一张竖卡 ========== -->
    <div v-else-if="skinId === 'day-cards'">
      <div
        class="hidden lg:grid grid-cols-5 gap-3"
        :class="exportMode ? '!grid' : ''"
      >
        <div
          v-for="day in WEEKDAYS"
          :key="`dc-${day.id}`"
          class="rounded-2xl overflow-hidden border bg-white shadow-sm"
          :class="highlightTodayId === day.id ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'"
        >
          <div
            class="px-3 py-2.5 text-center text-white bg-gradient-to-r"
            :class="dayAccent[day.id]"
          >
            <p class="text-sm font-black">{{ day.name }}</p>
            <p v-if="!exportMode && highlightTodayId === day.id" class="text-[10px] font-bold opacity-90 mt-0.5">今天</p>
          </div>
          <div class="p-2.5 space-y-2">
            <p class="text-[10px] font-black text-slate-400 tracking-widest px-1">上午</p>
            <button
              v-for="period in morningPeriods"
              :key="`dc-m-${day.id}-${period.id}`"
              type="button"
              class="w-full rounded-xl border px-2 py-2 text-left"
              :class="
                cellOf(day.id, period.id).id === 'empty'
                  ? 'border-dashed border-slate-200 text-slate-300'
                  : SUBJECT_POSTER_CLASS[cellOf(day.id, period.id).tone]
              "
              :disabled="!interactive"
              @click="onPick(day.id, period.id)"
            >
              <p class="text-[10px] font-bold opacity-50">{{ period.label }}</p>
              <p class="text-[13px] font-black leading-snug mt-0.5">
                {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
              </p>
            </button>
            <p class="text-[10px] font-black text-slate-400 tracking-widest px-1 pt-1">下午</p>
            <button
              v-for="period in afternoonPeriods"
              :key="`dc-a-${day.id}-${period.id}`"
              type="button"
              class="w-full rounded-xl border px-2 py-2 text-left"
              :class="
                cellOf(day.id, period.id).id === 'empty'
                  ? 'border-dashed border-slate-200 text-slate-300'
                  : SUBJECT_POSTER_CLASS[cellOf(day.id, period.id).tone]
              "
              :disabled="!interactive"
              @click="onPick(day.id, period.id)"
            >
              <p class="text-[10px] font-bold opacity-50">{{ period.label }}</p>
              <p class="text-[13px] font-black leading-snug mt-0.5">
                {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
              </p>
            </button>
          </div>
        </div>
      </div>
      <div v-if="!exportMode" class="lg:hidden space-y-2">
        <div class="rounded-2xl border border-indigo-200 bg-white overflow-hidden">
          <div class="px-3 py-2 text-white text-sm font-black bg-gradient-to-r" :class="dayAccent[mobileDay]">
            {{ WEEKDAYS.find(d => d.id === mobileDay)?.name }}
          </div>
          <div class="p-3 space-y-2">
            <button
              v-for="period in allPeriods"
              :key="`dcm-${period.id}`"
              type="button"
              class="w-full rounded-xl border px-3 py-2.5 text-left"
              :class="
                cellOf(mobileDay, period.id).id === 'empty'
                  ? 'border-dashed border-slate-200 text-slate-300'
                  : SUBJECT_POSTER_CLASS[cellOf(mobileDay, period.id).tone]
              "
              @click="onPick(mobileDay, period.id)"
            >
              <span class="text-[11px] font-bold opacity-50 mr-2">{{ period.label }}</span>
              <span class="text-sm font-black">
                {{ cellOf(mobileDay, period.id).id === 'empty' ? '选择课程' : cellOf(mobileDay, period.id).name }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 4. 上下分板 ========== -->
    <div v-else-if="skinId === 'split'" class="space-y-4">
      <div
        v-for="board in [
          { title: '上午', subtitle: '精神最好的时候', periods: morningPeriods, wrap: 'border-amber-300 bg-amber-50/40', head: 'bg-amber-500 text-white' },
          { title: '下午', subtitle: '轻松收个尾', periods: afternoonPeriods, wrap: 'border-sky-300 bg-sky-50/40', head: 'bg-sky-500 text-white' }
        ]"
        :key="board.title"
        class="rounded-3xl border-2 overflow-hidden"
        :class="board.wrap"
      >
        <div class="px-4 py-3 flex items-end justify-between" :class="board.head">
          <div>
            <h3 class="text-lg font-black tracking-wide">{{ board.title }}</h3>
            <p class="text-[11px] font-medium opacity-90">{{ board.subtitle }}</p>
          </div>
          <span class="text-xs font-bold opacity-80">{{ board.periods.length }} 节</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full table-fixed border-collapse bg-white/70">
            <thead>
              <tr>
                <th class="h-10 w-16 text-[11px] font-bold text-slate-400 border-b border-slate-200">节次</th>
                <th
                  v-for="day in WEEKDAYS"
                  :key="`sp-h-${board.title}-${day.id}`"
                  class="h-10 text-sm font-bold text-slate-700 border-b border-slate-200"
                >{{ day.shortName }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in board.periods" :key="`sp-${board.title}-${period.id}`">
                <td class="h-14 text-center text-xs font-black text-slate-500 border-b border-slate-100">{{ periodShort(period) }}</td>
                <td
                  v-for="day in WEEKDAYS"
                  :key="`sp-${board.title}-${day.id}-${period.id}`"
                  class="h-14 p-1.5 border-b border-slate-100"
                >
                  <button
                    type="button"
                    class="w-full h-full rounded-2xl border text-[12px] font-bold px-1"
                    :class="
                      cellOf(day.id, period.id).id === 'empty'
                        ? 'border-dashed border-slate-200 text-slate-300'
                        : SUBJECT_POSTER_CLASS[cellOf(day.id, period.id).tone]
                    "
                    :disabled="!interactive"
                    @click="onPick(day.id, period.id)"
                  >
                    {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========== 5. 便签贴墙 ========== -->
    <div
      v-else-if="skinId === 'sticky'"
      class="rounded-3xl p-4 sm:p-6 border border-[#c4a57a]"
      style="background:
        radial-gradient(circle at 20% 20%, rgba(120,80,40,0.08) 0 2px, transparent 3px),
        radial-gradient(circle at 80% 40%, rgba(120,80,40,0.08) 0 2px, transparent 3px),
        radial-gradient(circle at 40% 70%, rgba(120,80,40,0.08) 0 1.5px, transparent 2px),
        #e8d5b5;"
    >
      <div class="hidden lg:block space-y-5" :class="exportMode ? '!block' : ''">
        <div v-for="section in [{ title: '上午', periods: morningPeriods }, { title: '下午', periods: afternoonPeriods }]" :key="`st-${section.title}`">
          <div class="inline-block mb-3 px-3 py-1 rounded-md bg-[#fff8e7] border border-[#d2b48c] text-xs font-black text-[#7a5a32] shadow-sm -rotate-1">
            {{ section.title }}
          </div>
          <div class="grid grid-cols-5 gap-3">
            <div v-for="day in WEEKDAYS" :key="`st-${section.title}-${day.id}`" class="space-y-3">
              <p class="text-center text-[11px] font-black text-[#6b4f2e]/80">{{ day.name }}</p>
              <button
                v-for="period in section.periods"
                :key="`st-${day.id}-${period.id}`"
                type="button"
                class="w-full min-h-[4.5rem] rounded-sm border px-2 py-2 shadow-[2px_3px_0_rgba(90,60,30,0.18)] text-left transition"
                :class="
                  cellOf(day.id, period.id).id === 'empty'
                    ? 'bg-[#fff8e7]/70 border-[#d2b48c] text-[#c4a57a]'
                    : stickyTone[cellOf(day.id, period.id).tone]
                "
                :style="{ transform: `rotate(${stickyTilt(day.id, period.id)}deg)` }"
                :disabled="!interactive"
                @click="onPick(day.id, period.id)"
              >
                <p class="text-[10px] font-bold opacity-50">{{ period.label }}</p>
                <p class="text-[13px] font-black leading-snug mt-1">
                  {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '空白') : cellOf(day.id, period.id).name }}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!exportMode" class="lg:hidden space-y-3">
        <p class="text-center text-sm font-black text-[#6b4f2e]">{{ WEEKDAYS.find(d => d.id === mobileDay)?.name }}</p>
        <button
          v-for="period in allPeriods"
          :key="`stm-${period.id}`"
          type="button"
          class="w-full min-h-[4rem] rounded-sm border px-3 py-2.5 shadow-[2px_3px_0_rgba(90,60,30,0.18)] text-left"
          :class="
            cellOf(mobileDay, period.id).id === 'empty'
              ? 'bg-[#fff8e7]/70 border-[#d2b48c] text-[#c4a57a]'
              : stickyTone[cellOf(mobileDay, period.id).tone]
          "
          :style="{ transform: `rotate(${stickyTilt(mobileDay, period.id)}deg)` }"
          @click="onPick(mobileDay, period.id)"
        >
          <p class="text-[10px] font-bold opacity-50">{{ period.label }} · {{ period.id <= 4 ? '上午' : '下午' }}</p>
          <p class="text-sm font-black mt-1">
            {{ cellOf(mobileDay, period.id).id === 'empty' ? '贴一张课' : cellOf(mobileDay, period.id).name }}
          </p>
        </button>
      </div>
    </div>

    <!-- ========== 6. 粉笔黑板 ========== -->
    <div
      v-else-if="skinId === 'chalkboard'"
      class="rounded-3xl border-8 border-[#5c4030] p-4 sm:p-6 shadow-xl"
      style="background:
        linear-gradient(180deg, rgba(255,255,255,0.04), transparent 40%),
        repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px),
        #1a4d2e;"
    >
      <div class="text-center mb-4">
        <p class="text-emerald-100/80 text-xs font-bold tracking-[0.35em]">CHALKBOARD</p>
        <p class="text-amber-100 text-lg font-black mt-1" style="font-family: 'Songti SC', serif;">本周课程</p>
      </div>
      <div class="hidden lg:block overflow-x-auto" :class="exportMode ? '!block' : ''">
        <table class="w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th class="h-10 w-16 text-[11px] font-bold text-emerald-100/50">节次</th>
              <th
                v-for="day in WEEKDAYS"
                :key="`ch-h-${day.id}`"
                class="h-10 text-sm font-bold text-amber-100"
                :class="highlightTodayId === day.id ? 'underline decoration-amber-200/60' : ''"
              >{{ day.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="6" class="py-2 text-center text-[11px] font-bold tracking-[0.4em] text-emerald-200/70">— 上午 —</td>
            </tr>
            <tr v-for="period in morningPeriods" :key="`ch-m-${period.id}`">
              <td class="h-12 text-center text-xs font-bold text-emerald-100/40">{{ periodShort(period) }}</td>
              <td v-for="day in WEEKDAYS" :key="`ch-m-${day.id}-${period.id}`" class="h-12 p-1">
                <button
                  type="button"
                  class="w-full h-full rounded-lg text-[13px] font-bold border border-transparent hover:border-emerald-100/20"
                  :class="cellOf(day.id, period.id).id === 'empty' ? 'text-emerald-100/20' : chalkTone[cellOf(day.id, period.id).tone]"
                  :disabled="!interactive"
                  @click="onPick(day.id, period.id)"
                >
                  {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '' : '·') : cellOf(day.id, period.id).name }}
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="6" class="py-2 text-center text-[11px] font-bold tracking-[0.4em] text-sky-200/70">— 下午 —</td>
            </tr>
            <tr v-for="period in afternoonPeriods" :key="`ch-a-${period.id}`">
              <td class="h-12 text-center text-xs font-bold text-emerald-100/40">{{ periodShort(period) }}</td>
              <td v-for="day in WEEKDAYS" :key="`ch-a-${day.id}-${period.id}`" class="h-12 p-1">
                <button
                  type="button"
                  class="w-full h-full rounded-lg text-[13px] font-bold border border-transparent hover:border-emerald-100/20"
                  :class="cellOf(day.id, period.id).id === 'empty' ? 'text-emerald-100/20' : chalkTone[cellOf(day.id, period.id).tone]"
                  :disabled="!interactive"
                  @click="onPick(day.id, period.id)"
                >
                  {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '' : '·') : cellOf(day.id, period.id).name }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!exportMode" class="lg:hidden space-y-1">
        <p class="text-center text-amber-100 text-sm font-black mb-2">{{ WEEKDAYS.find(d => d.id === mobileDay)?.name }}</p>
        <button
          v-for="period in allPeriods"
          :key="`chm-${period.id}`"
          type="button"
          class="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg border border-emerald-100/10"
          @click="onPick(mobileDay, period.id)"
        >
          <span class="w-8 text-xs font-bold text-emerald-100/40">{{ periodShort(period) }}</span>
          <span
            class="text-sm font-bold"
            :class="cellOf(mobileDay, period.id).id === 'empty' ? 'text-emerald-100/25' : chalkTone[cellOf(mobileDay, period.id).tone]"
          >
            {{ cellOf(mobileDay, period.id).id === 'empty' ? '点这里写课' : cellOf(mobileDay, period.id).name }}
          </span>
        </button>
      </div>
    </div>

    <!-- ========== 7. 手账贴纸：粉→蓝柔和渐变 ========== -->
    <div
      v-else-if="skinId === 'scrapbook'"
      class="rounded-[2rem] border-4 border-pink-200/80 p-4 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(244,114,182,0.12)]"
      :style="scrapbookBoardStyle"
    >
      <!-- 粉蓝渐变胶带 -->
      <div
        class="absolute -top-1 left-8 w-28 h-5 rotate-[-4deg] rounded-sm shadow-sm"
        style="background: linear-gradient(90deg, #F9A8D4, #E9D5FF);"
        aria-hidden="true"
      />
      <div
        class="absolute top-10 -right-4 w-28 h-4 rotate-[8deg] rounded-sm shadow-sm"
        style="background: linear-gradient(90deg, #E9D5FF, #7DD3FC);"
        aria-hidden="true"
      />
      <div
        class="absolute bottom-5 left-1/2 -translate-x-1/2 w-24 h-3.5 rotate-[-2deg] rounded-sm opacity-80"
        style="background: linear-gradient(90deg, #FBCFE8, #BAE6FD);"
        aria-hidden="true"
      />

      <div class="relative pt-2">
        <div class="hidden lg:grid grid-cols-5 gap-3" :class="exportMode ? '!grid' : ''">
          <div v-for="day in WEEKDAYS" :key="`sb-${day.id}`" class="space-y-2">
            <div class="text-center">
              <span
                class="inline-block px-3 py-1 rounded-full border-2 text-xs font-black shadow-sm"
                :class="scrapbookDayPill(day.id)"
              >
                {{ day.name }}
              </span>
            </div>
            <button
              v-for="period in allPeriods"
              :key="`sb-${day.id}-${period.id}`"
              type="button"
              class="w-full rounded-2xl border-2 px-2 py-2 text-left shadow-sm backdrop-blur-[1px]"
              :class="cellOf(day.id, period.id).id === 'empty' ? 'border-dashed' : ''"
              :style="scrapbookCellStyle(day.id, period.id, cellOf(day.id, period.id).id === 'empty')"
              :disabled="!interactive"
              @click="onPick(day.id, period.id)"
            >
              <p class="text-[10px] font-bold" :class="scrapbookPeriodLabel(day.id, period.id)">
                {{ period.id <= 4 ? '☀' : '🌤' }} {{ period.label }}
              </p>
              <p
                class="text-[13px] font-black mt-1 leading-snug"
                :class="cellOf(day.id, period.id).id === 'empty' ? 'text-slate-300' : SUBJECT_CELL_CLASS[cellOf(day.id, period.id).tone]"
              >
                <span v-if="cellOf(day.id, period.id).id !== 'empty'" class="mr-1">{{ cellOf(day.id, period.id).emoji }}</span>
                {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '贴一张') : cellOf(day.id, period.id).name }}
              </p>
            </button>
          </div>
        </div>

        <div v-if="!exportMode" class="lg:hidden space-y-3">
          <button
            v-for="period in allPeriods"
            :key="`sbm-${period.id}`"
            type="button"
            class="w-full rounded-2xl border-2 px-3 py-2.5 text-left shadow-sm"
            :class="cellOf(mobileDay, period.id).id === 'empty' ? 'border-dashed' : ''"
            :style="scrapbookCellStyle(mobileDay, period.id, cellOf(mobileDay, period.id).id === 'empty')"
            @click="onPick(mobileDay, period.id)"
          >
            <p class="text-[10px] font-bold" :class="scrapbookPeriodLabel(mobileDay, period.id)">
              {{ period.id <= 4 ? '☀ 上午' : '🌤 下午' }} · {{ period.label }}
            </p>
            <p
              class="text-sm font-black mt-1"
              :class="cellOf(mobileDay, period.id).id === 'empty' ? 'text-slate-300' : SUBJECT_CELL_CLASS[cellOf(mobileDay, period.id).tone]"
            >
              <span v-if="cellOf(mobileDay, period.id).id !== 'empty'" class="mr-1">{{ cellOf(mobileDay, period.id).emoji }}</span>
              {{ cellOf(mobileDay, period.id).id === 'empty' ? '贴一张课' : cellOf(mobileDay, period.id).name }}
            </p>
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 8. 一日轴线 ========== -->
    <div v-else-if="skinId === 'timeline'">
      <div class="hidden lg:grid grid-cols-5 gap-4" :class="exportMode ? '!grid' : ''">
        <div v-for="day in WEEKDAYS" :key="`tl-${day.id}`" class="relative">
          <p
            class="text-center text-sm font-black mb-4"
            :class="highlightTodayId === day.id ? 'text-indigo-600' : 'text-slate-700'"
          >{{ day.name }}</p>
          <div class="absolute left-1/2 top-10 bottom-2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-sky-300 via-indigo-300 to-violet-300" />
          <div class="relative space-y-4">
            <button
              v-for="period in allPeriods"
              :key="`tl-${day.id}-${period.id}`"
              type="button"
              class="relative w-full pl-0"
              :disabled="!interactive"
              @click="onPick(day.id, period.id)"
            >
              <span
                class="absolute left-1/2 top-3 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white shadow"
                :class="period.id <= 4 ? 'bg-sky-400' : 'bg-violet-400'"
              />
              <div
                class="mx-1 mt-0 rounded-xl border bg-white px-2 py-2 shadow-sm text-center"
                :class="
                  cellOf(day.id, period.id).id === 'empty'
                    ? 'border-dashed border-slate-200 text-slate-300'
                    : SUBJECT_POSTER_CLASS[cellOf(day.id, period.id).tone]
                "
              >
                <p class="text-[10px] font-bold opacity-50">{{ period.label }}</p>
                <p class="text-[12px] font-black leading-snug mt-0.5">
                  {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div v-if="!exportMode" class="lg:hidden relative pl-6">
        <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-300 to-violet-400" />
        <button
          v-for="period in allPeriods"
          :key="`tlm-${period.id}`"
          type="button"
          class="relative w-full mb-3 text-left"
          @click="onPick(mobileDay, period.id)"
        >
          <span
            class="absolute -left-[1.35rem] top-3 h-3 w-3 rounded-full border-2 border-white shadow"
            :class="period.id <= 4 ? 'bg-sky-400' : 'bg-violet-400'"
          />
          <div
            class="rounded-xl border bg-white px-3 py-2.5 shadow-sm"
            :class="
              cellOf(mobileDay, period.id).id === 'empty'
                ? 'border-dashed border-slate-200 text-slate-300'
                : SUBJECT_POSTER_CLASS[cellOf(mobileDay, period.id).tone]
            "
          >
            <p class="text-[10px] font-bold opacity-50">{{ period.label }} · {{ period.id <= 4 ? '上午' : '下午' }}</p>
            <p class="text-sm font-black mt-0.5">
              {{ cellOf(mobileDay, period.id).id === 'empty' ? '选择课程' : cellOf(mobileDay, period.id).name }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- ========== 9. 杂志便当格：上三下二，不跨行，高度随内容 ========== -->
    <div v-else-if="skinId === 'bento'">
      <div
        class="hidden lg:grid grid-cols-6 gap-3"
        :class="exportMode ? '!grid' : ''"
      >
        <div
          v-for="day in WEEKDAYS"
          :key="`bn-${day.id}`"
          class="rounded-3xl border bg-white p-3.5 flex flex-col min-h-0 overflow-hidden"
          :class="[
            day.id <= 3 ? 'col-span-2' : 'col-span-3',
            highlightTodayId === day.id
              ? 'border-orange-300 ring-2 ring-orange-200'
              : 'border-stone-200'
          ]"
        >
          <div class="flex items-center justify-between mb-2.5 shrink-0">
            <h3 class="text-base font-black text-stone-800">{{ day.name }}</h3>
            <span
              class="text-[10px] font-black px-2 py-0.5 rounded-full"
              :class="highlightTodayId === day.id ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500'"
            >{{ highlightTodayId === day.id && !exportMode ? 'TODAY' : `DAY ${day.id}` }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="period in allPeriods"
              :key="`bn-${day.id}-${period.id}`"
              type="button"
              class="rounded-2xl border px-2 py-2 text-left min-h-[3.25rem]"
              :class="[
                period.id === 1 || period.id === 5 ? 'col-span-2' : '',
                cellOf(day.id, period.id).id === 'empty'
                  ? 'border-dashed border-stone-200 text-stone-300'
                  : SUBJECT_POSTER_CLASS[cellOf(day.id, period.id).tone]
              ]"
              :disabled="!interactive"
              @click="onPick(day.id, period.id)"
            >
              <p class="text-[10px] font-bold opacity-50">{{ period.id <= 4 ? '上午' : '下午' }} · {{ periodShort(period) }}</p>
              <p class="text-[13px] font-black leading-snug mt-0.5">
                {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
              </p>
            </button>
          </div>
        </div>
      </div>
      <div v-if="!exportMode" class="lg:hidden space-y-3">
        <div
          class="rounded-3xl border bg-white p-3 overflow-hidden"
          :class="highlightTodayId === mobileDay ? 'border-orange-300 ring-2 ring-orange-200' : 'border-stone-200'"
        >
          <div class="flex items-center justify-between mb-2.5">
            <h3 class="text-base font-black text-stone-800">
              {{ WEEKDAYS.find((d) => d.id === mobileDay)?.name }}
            </h3>
            <span
              class="text-[10px] font-black px-2 py-0.5 rounded-full"
              :class="highlightTodayId === mobileDay ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500'"
            >{{ highlightTodayId === mobileDay ? 'TODAY' : `DAY ${mobileDay}` }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="period in allPeriods"
              :key="`bnm-${period.id}`"
              type="button"
              class="rounded-2xl border px-2.5 py-2.5 text-left min-h-[3.75rem]"
              :class="[
                period.id === 1 || period.id === 5 ? 'col-span-2' : '',
                cellOf(mobileDay, period.id).id === 'empty'
                  ? 'border-dashed border-stone-200 text-stone-300'
                  : SUBJECT_POSTER_CLASS[cellOf(mobileDay, period.id).tone]
              ]"
              @click="onPick(mobileDay, period.id)"
            >
              <p class="text-[10px] font-bold opacity-50">{{ period.label }}</p>
              <p class="text-sm font-black mt-1">
                {{ cellOf(mobileDay, period.id).id === 'empty' ? '选择课程' : cellOf(mobileDay, period.id).name }}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 10. 卡通积木 ========== -->
    <div v-else-if="skinId === 'bricks'">
      <div class="hidden lg:block overflow-x-auto" :class="exportMode ? '!block' : ''">
        <div class="min-w-[760px] flex gap-3">
          <div class="w-[4.5rem] shrink-0 flex flex-col gap-3">
            <div class="h-12" />
            <div class="flex-1 min-h-[18rem] rounded-2xl border-[3px] border-slate-900 bg-amber-300 flex items-center justify-center shadow-[4px_4px_0_#0f172a]">
              <span class="text-sm font-black" style="writing-mode: vertical-rl; letter-spacing: 0.2em;">上午</span>
            </div>
            <div class="flex-1 min-h-[9rem] rounded-2xl border-[3px] border-slate-900 bg-sky-300 flex items-center justify-center shadow-[4px_4px_0_#0f172a]">
              <span class="text-sm font-black" style="writing-mode: vertical-rl; letter-spacing: 0.2em;">下午</span>
            </div>
          </div>
          <div class="flex-1 space-y-3">
            <div class="grid grid-cols-5 gap-3">
              <div
                v-for="day in WEEKDAYS"
                :key="`br-h-${day.id}`"
                class="h-12 rounded-2xl border-[3px] border-slate-900 bg-white flex items-center justify-center text-sm font-black shadow-[4px_4px_0_#0f172a]"
                :class="highlightTodayId === day.id ? 'bg-yellow-300' : ''"
              >{{ day.name }}</div>
            </div>
            <div
              v-for="period in morningPeriods"
              :key="`br-m-${period.id}`"
              class="grid grid-cols-5 gap-3"
            >
              <button
                v-for="day in WEEKDAYS"
                :key="`br-m-${day.id}-${period.id}`"
                type="button"
                class="min-h-[4.25rem] rounded-2xl border-[3px] px-2 text-[13px] font-black shadow-[4px_4px_0_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#0f172a]"
                :class="
                  cellOf(day.id, period.id).id === 'empty'
                    ? 'bg-white border-slate-900 text-slate-300'
                    : brickTone[cellOf(day.id, period.id).tone]
                "
                :disabled="!interactive"
                @click="onPick(day.id, period.id)"
              >
                {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
              </button>
            </div>
            <div
              v-for="period in afternoonPeriods"
              :key="`br-a-${period.id}`"
              class="grid grid-cols-5 gap-3"
            >
              <button
                v-for="day in WEEKDAYS"
                :key="`br-a-${day.id}-${period.id}`"
                type="button"
                class="min-h-[4.25rem] rounded-2xl border-[3px] px-2 text-[13px] font-black shadow-[4px_4px_0_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#0f172a]"
                :class="
                  cellOf(day.id, period.id).id === 'empty'
                    ? 'bg-white border-slate-900 text-slate-300'
                    : brickTone[cellOf(day.id, period.id).tone]
                "
                :disabled="!interactive"
                @click="onPick(day.id, period.id)"
              >
                {{ cellOf(day.id, period.id).id === 'empty' ? (exportMode ? '—' : '＋') : cellOf(day.id, period.id).name }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!exportMode" class="lg:hidden space-y-3">
        <button
          v-for="period in allPeriods"
          :key="`brm-${period.id}`"
          type="button"
          class="w-full min-h-[3.75rem] rounded-2xl border-[3px] border-slate-900 px-3 py-2.5 text-left text-sm font-black shadow-[4px_4px_0_#0f172a]"
          :class="
            cellOf(mobileDay, period.id).id === 'empty'
              ? 'bg-white text-slate-300'
              : brickTone[cellOf(mobileDay, period.id).tone]
          "
          @click="onPick(mobileDay, period.id)"
        >
          <span class="opacity-60 mr-2">{{ period.label }}</span>
          {{ cellOf(mobileDay, period.id).id === 'empty' ? '放一块积木' : cellOf(mobileDay, period.id).name }}
        </button>
      </div>
    </div>
  </div>
</template>
