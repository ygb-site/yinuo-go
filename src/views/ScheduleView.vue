<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { domToPng } from 'modern-screenshot';
import { Cloud, Download, LoaderCircle, MoreHorizontal } from 'lucide-vue-next';
import { AppModal } from '../design-system';
import { useUserStore } from '../stores/useUserStore';
import { gradeYearLabel } from '../types/curriculum';
import {
  useScheduleStore,
  WEEKDAYS,
  SCHEDULE_PERIODS,
  SCHEDULE_SUBJECTS,
  SUBJECT_CELL_CLASS,
  SUBJECT_DOT_CLASS,
  getTodayWeekdayId,
  type WeekdayId,
  type SubjectId
} from '../stores/useScheduleStore';

const userStore = useUserStore();
const scheduleStore = useScheduleStore();
const todayId = computed(() => getTodayWeekdayId());

/** 手机端按天查看；桌面看整周 */
const mobileDay = ref<WeekdayId>(todayId.value || 1);
const pickerOpen = ref(false);
const moreOpen = ref(false);
const exporting = ref(false);
const previewOpen = ref(false);
const previewDataUrl = ref('');
/** 导出用离屏画布：页头 + 完整一周表 */
const exportSheetRef = ref<HTMLElement | null>(null);

const gradeLabel = computed(() => gradeYearLabel(userStore.currentProfile.gradeLevel));

const exportFileName = computed(() => {
  const safeName = (scheduleStore.displayStudentName || '课程表').replace(/[\\/:*?"<>|]/g, '');
  return `${safeName}-${gradeLabel.value}课程表.png`;
});

const selectableSubjects = computed(() => [
  ...SCHEDULE_SUBJECTS.filter((s) => s.id !== 'empty'),
  ...SCHEDULE_SUBJECTS.filter((s) => s.id === 'empty')
]);

const selectedMeta = computed(() => {
  const day = WEEKDAYS.find((d) => d.id === scheduleStore.selectedDay);
  const period = SCHEDULE_PERIODS.find((p) => p.id === scheduleStore.selectedPeriod);
  const subject = scheduleStore.cellSubject(scheduleStore.selectedDay, scheduleStore.selectedPeriod);
  return { day, period, subject };
});

const todayCourses = computed(() => scheduleStore.todayCourses);

const syncHint = computed(() => {
  if (!userStore.isLoggedIn) return '本机保存 · 登录后同步云端';
  if (!userStore.hasProfile) return '请先创建学员档案';
  if (userStore.isSyncing) return '同步中…';
  if (userStore.syncError) return userStore.syncError;
  return '已同步云端';
});

const openPicker = (day: WeekdayId, period: number) => {
  scheduleStore.selectCell(day, period);
  mobileDay.value = day;
  pickerOpen.value = true;
};

const pickSubject = (subjectId: SubjectId) => {
  scheduleStore.setSelectedCellSubject(subjectId);
  pickerOpen.value = false;
};

const onPickerOpenUpdate = (open: boolean) => {
  pickerOpen.value = open;
};

const restoreOfficial = () => {
  scheduleStore.fillSample();
  moreOpen.value = false;
};

const clearSchedule = () => {
  scheduleStore.clearAll();
  moreOpen.value = false;
};

const closeMoreMenu = () => {
  moreOpen.value = false;
};

/** 生成预览图，确认后再下载 */
const openExportPreview = async () => {
  if (exporting.value) return;
  moreOpen.value = false;
  exporting.value = true;
  try {
    await nextTick();
    const sheet = exportSheetRef.value;
    if (!sheet) throw new Error('export sheet missing');

    previewDataUrl.value = await domToPng(sheet, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
    previewOpen.value = true;
  } catch (err) {
    console.error('ScheduleView.openExportPreview', err);
    window.alert('生成预览失败，请重试');
  } finally {
    exporting.value = false;
  }
};

const downloadPreviewImage = () => {
  if (!previewDataUrl.value) return;
  const link = document.createElement('a');
  link.download = exportFileName.value;
  link.href = previewDataUrl.value;
  link.click();
  previewOpen.value = false;
};

const onPreviewOpenUpdate = (open: boolean) => {
  previewOpen.value = open;
  if (!open) previewDataUrl.value = '';
};

onMounted(() => {
  document.addEventListener('click', closeMoreMenu);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', closeMoreMenu);
});

watch(
  () => [userStore.currentProfileId, userStore.isLoggedIn, userStore.profiles.length] as const,
  () => {
    scheduleStore.hydrateFromProfile();
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#F4F1EA] py-5 md:py-8 px-3.5 sm:px-6 lg:px-8 select-none font-sans">
    <div class="max-w-5xl mx-auto space-y-4">

      <!-- 页头 -->
      <header class="bg-white rounded-2xl border border-slate-200/70 px-5 sm:px-6 py-4 sm:py-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-1.5">
            <p class="text-[11px] font-semibold text-slate-400 tracking-wide">
              京西校区 26-27 学年 · {{ gradeLabel }}
            </p>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {{ scheduleStore.displayStudentName }}的课程表
            </h1>
            <p class="text-xs sm:text-sm font-medium text-slate-500">
              {{ scheduleStore.schoolName }}
              <span class="mx-1.5 text-slate-300">|</span>
              {{ scheduleStore.className }}
            </p>
            <p class="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Cloud class="w-3.5 h-3.5 shrink-0" />
              {{ syncHint }}
            </p>
          </div>

          <div class="relative shrink-0" @click.stop>
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              :aria-expanded="moreOpen"
              @click="moreOpen = !moreOpen"
            >
              <MoreHorizontal class="w-4 h-4" />
              更多
            </button>
            <div
              v-if="moreOpen"
              class="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-white text-slate-800 shadow-md border border-slate-200 overflow-hidden z-30"
            >
              <button
                type="button"
                class="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                @click="restoreOfficial"
              >
                恢复官方课表
              </button>
              <button
                type="button"
                class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                @click="clearSchedule"
              >
                清空课表
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- 今日一行 -->
      <section class="bg-white rounded-2xl border border-slate-200/70 px-4 sm:px-5 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <h2 class="text-sm font-bold text-slate-800">
            {{ todayId ? '今日课程' : '周末休息' }}
          </h2>
          <span class="text-[11px] font-medium text-slate-400">
            {{ todayId ? `${todayCourses.length} 节` : '好好放松' }}
          </span>
        </div>

        <div v-if="todayId && todayCourses.length > 0" class="flex flex-wrap gap-x-4 gap-y-2">
          <button
            v-for="row in todayCourses"
            :key="row.period.id"
            type="button"
            class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-sky-700 transition cursor-pointer"
            @click="openPicker(todayId, row.period.id)"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="SUBJECT_DOT_CLASS[row.subject.tone]"
              aria-hidden="true"
            />
            <span>{{ row.subject.name }}</span>
            <span class="text-xs font-medium text-slate-400">{{ row.period.label }}</span>
          </button>
        </div>
        <p v-else class="text-xs font-medium text-slate-400">
          {{ todayId ? '今天还没填课，点下面格子选课' : '周一到周五的课表可以提前看' }}
        </p>
      </section>

      <!-- 手机：星期切换 -->
      <div class="lg:hidden flex gap-1 p-1 rounded-2xl bg-white border border-slate-200/70">
        <button
          v-for="day in WEEKDAYS"
          :key="day.id"
          type="button"
          class="flex-1 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
          :class="[
            mobileDay === day.id
              ? 'bg-slate-900 text-white'
              : todayId === day.id
                ? 'text-sky-700 bg-sky-50'
                : 'text-slate-500 hover:bg-slate-50'
          ]"
          @click="mobileDay = day.id"
        >
          {{ day.name }}
        </button>
      </div>

      <!-- 一周课表：纸质表格 -->
      <section class="bg-white rounded-2xl border border-slate-200/70 p-3 sm:p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div class="mb-3 sm:mb-4 px-0.5 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-sm sm:text-base font-bold text-slate-800">一周课表</h2>
            <p class="text-[11px] text-slate-400 font-medium mt-0.5">点格子更换课程</p>
          </div>
          <button
            type="button"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            :disabled="exporting"
            @click="openExportPreview"
          >
            <LoaderCircle v-if="exporting" class="w-3.5 h-3.5 animate-spin" />
            <Download v-else class="w-3.5 h-3.5" />
            {{ exporting ? '生成中…' : '导出图片' }}
          </button>
        </div>

        <div class="hidden lg:block overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full table-fixed border-collapse">
            <colgroup>
              <col class="w-[4.5rem]" />
              <col v-for="day in WEEKDAYS" :key="`col-${day.id}`" />
            </colgroup>
            <thead>
              <tr class="bg-slate-50/90">
                <th class="h-11 px-2 text-[11px] font-bold text-slate-400 text-center border-b border-r border-slate-200">
                  节次
                </th>
                <th
                  v-for="day in WEEKDAYS"
                  :key="day.id"
                  class="h-11 px-1 text-center text-sm font-bold border-b border-slate-200"
                  :class="[
                    day.id < 5 ? 'border-r border-slate-200' : '',
                    todayId === day.id ? 'bg-sky-50 text-sky-700' : 'text-slate-600'
                  ]"
                >
                  <span class="inline-flex items-center gap-1.5">
                    {{ day.name }}
                    <span
                      v-if="todayId === day.id"
                      class="text-[10px] font-bold text-sky-600 bg-white border border-sky-200 px-1.5 py-0.5 rounded"
                    >今天</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="period in SCHEDULE_PERIODS" :key="period.id">
                <tr v-if="period.id === 5">
                  <td
                    colspan="6"
                    class="h-9 bg-[#FAFAF7] text-center text-[11px] font-semibold text-slate-400 border-y border-slate-200"
                  >
                    午 休
                  </td>
                </tr>
                <tr>
                  <td class="h-14 px-2 text-[11px] font-bold text-slate-400 text-center border-b border-r border-slate-200 bg-slate-50/50 align-middle">
                    {{ period.label }}
                  </td>
                  <td
                    v-for="day in WEEKDAYS"
                    :key="`${day.id}-${period.id}`"
                    class="h-14 p-0 border-b border-slate-200 align-middle"
                    :class="[
                      day.id < 5 ? 'border-r border-slate-200' : '',
                      todayId === day.id ? 'bg-sky-50/40' : 'bg-white'
                    ]"
                  >
                    <button
                      type="button"
                      class="w-full h-14 px-2 flex items-center justify-center text-[13px] font-semibold leading-tight text-center transition cursor-pointer hover:bg-slate-50/80 active:bg-slate-100"
                      :class="
                        scheduleStore.cellSubject(day.id, period.id).id === 'empty'
                          ? 'text-slate-300 font-medium'
                          : SUBJECT_CELL_CLASS[scheduleStore.cellSubject(day.id, period.id).tone]
                      "
                      :title="scheduleStore.cellSubject(day.id, period.id).name"
                      @click="openPicker(day.id, period.id)"
                    >
                      {{
                        scheduleStore.cellSubject(day.id, period.id).id === 'empty'
                          ? '＋'
                          : scheduleStore.cellSubject(day.id, period.id).name
                      }}
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- 手机：单日列表，同纸质风格 -->
        <div class="lg:hidden rounded-xl border border-slate-200 overflow-hidden">
          <template v-for="period in SCHEDULE_PERIODS" :key="period.id">
            <div
              v-if="period.id === 5"
              class="h-9 flex items-center justify-center text-[11px] font-semibold text-slate-400 bg-[#FAFAF7] border-y border-slate-200"
            >
              午 休
            </div>
            <button
              type="button"
              class="w-full flex items-stretch text-left transition active:bg-slate-50 cursor-pointer border-b border-slate-200 last:border-b-0"
              @click="openPicker(mobileDay, period.id)"
            >
              <div class="w-14 shrink-0 flex items-center justify-center text-[11px] font-bold text-slate-400 bg-slate-50/80 border-r border-slate-200 py-3.5">
                {{ period.label.replace('第', '').replace('节', '') }}
              </div>
              <div
                class="flex-1 flex items-center px-3.5 py-3.5 text-sm font-semibold min-h-[3.25rem]"
                :class="
                  scheduleStore.cellSubject(mobileDay, period.id).id === 'empty'
                    ? 'text-slate-300'
                    : SUBJECT_CELL_CLASS[scheduleStore.cellSubject(mobileDay, period.id).tone]
                "
              >
                {{
                  scheduleStore.cellSubject(mobileDay, period.id).id === 'empty'
                    ? '选择课程'
                    : scheduleStore.cellSubject(mobileDay, period.id).name
                }}
              </div>
            </button>
          </template>
        </div>
      </section>
    </div>

    <!-- 离屏导出画布：页头信息 + 完整一周表（手机也能导出整周） -->
    <div
      class="fixed top-0 -left-[9999px] w-[960px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref="exportSheetRef"
        class="bg-white p-10 font-sans text-slate-900"
      >
        <div class="mb-6 pb-5 border-b border-slate-200">
          <p class="text-xs font-semibold text-slate-400 tracking-wide mb-2">
            京西校区 26-27 学年 · {{ gradeLabel }}
          </p>
          <h1 class="text-3xl font-black tracking-tight mb-2">
            {{ scheduleStore.displayStudentName }}的课程表
          </h1>
          <p class="text-sm font-medium text-slate-500">
            {{ scheduleStore.schoolName }}
            <span class="mx-1.5 text-slate-300">|</span>
            {{ scheduleStore.className }}
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 overflow-hidden">
          <table class="w-full table-fixed border-collapse">
            <colgroup>
              <col class="w-[4.5rem]" />
              <col v-for="day in WEEKDAYS" :key="`export-col-${day.id}`" />
            </colgroup>
            <thead>
              <tr class="bg-slate-50">
                <th class="h-12 px-2 text-xs font-bold text-slate-400 text-center border-b border-r border-slate-200">
                  节次
                </th>
                <th
                  v-for="day in WEEKDAYS"
                  :key="`export-h-${day.id}`"
                  class="h-12 px-1 text-center text-sm font-bold text-slate-600 border-b border-slate-200"
                  :class="day.id < 5 ? 'border-r border-slate-200' : ''"
                >
                  {{ day.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="period in SCHEDULE_PERIODS" :key="`export-p-${period.id}`">
                <tr v-if="period.id === 5">
                  <td
                    colspan="6"
                    class="h-10 bg-[#FAFAF7] text-center text-xs font-semibold text-slate-400 border-y border-slate-200"
                  >
                    午 休
                  </td>
                </tr>
                <tr>
                  <td class="h-14 px-2 text-xs font-bold text-slate-400 text-center border-b border-r border-slate-200 bg-slate-50/50 align-middle">
                    {{ period.label }}
                  </td>
                  <td
                    v-for="day in WEEKDAYS"
                    :key="`export-${day.id}-${period.id}`"
                    class="h-14 px-2 border-b border-slate-200 align-middle bg-white"
                    :class="day.id < 5 ? 'border-r border-slate-200' : ''"
                  >
                    <div
                      class="h-full min-h-[3.25rem] flex items-center justify-center text-[13px] font-semibold leading-tight text-center"
                      :class="
                        scheduleStore.cellSubject(day.id, period.id).id === 'empty'
                          ? 'text-slate-300'
                          : SUBJECT_CELL_CLASS[scheduleStore.cellSubject(day.id, period.id).tone]
                      "
                    >
                      {{
                        scheduleStore.cellSubject(day.id, period.id).id === 'empty'
                          ? '—'
                          : scheduleStore.cellSubject(day.id, period.id).name
                      }}
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 导出预览：先看图，再下载 -->
    <AppModal
      :open="previewOpen"
      size="lg"
      presentation="center"
      @update:open="onPreviewOpenUpdate"
    >
      <template #header>
        <div class="min-w-0 pr-2">
          <h3 class="text-base font-bold text-slate-900 tracking-tight">导出预览</h3>
          <p class="text-[11px] text-slate-500 font-medium mt-0.5">
            确认无误后再下载 · {{ exportFileName }}
          </p>
        </div>
      </template>

      <div class="rounded-xl border border-slate-200 bg-slate-50 overflow-auto max-h-[55vh]">
        <img
          v-if="previewDataUrl"
          :src="previewDataUrl"
          :alt="exportFileName"
          class="block w-full h-auto"
        />
      </div>

      <template #footer>
        <button
          type="button"
          class="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white cursor-pointer active:scale-95 transition"
          @click="onPreviewOpenUpdate(false)"
        >
          取消
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer active:scale-95 transition"
          @click="downloadPreviewImage"
        >
          <Download class="w-3.5 h-3.5" />
          下载图片
        </button>
      </template>
    </AppModal>

    <AppModal
      :open="pickerOpen"
      size="md"
      presentation="auto"
      @update:open="onPickerOpenUpdate"
    >
      <template #header>
        <div class="min-w-0 pr-2">
          <h3 class="text-base font-bold text-slate-900 tracking-tight">选择课程</h3>
          <p class="text-[11px] text-slate-500 font-medium mt-0.5">
            {{ selectedMeta.day?.name }} · {{ selectedMeta.period?.label }}
            <span v-if="selectedMeta.subject.id !== 'empty'" class="ml-1 text-slate-400">
              · 当前 {{ selectedMeta.subject.name }}
            </span>
          </p>
        </div>
      </template>

      <div class="rounded-xl border border-slate-200 overflow-hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2">
          <button
            v-for="subject in selectableSubjects"
            :key="subject.id"
            type="button"
            class="flex items-center gap-2.5 px-3.5 py-3 text-left text-sm font-semibold border-b border-slate-100 sm:odd:border-r transition cursor-pointer active:scale-[0.99]"
            :class="[
              subject.id === 'empty' ? 'text-slate-400' : SUBJECT_CELL_CLASS[subject.tone],
              selectedMeta.subject.id === subject.id
                ? 'bg-sky-50'
                : 'bg-white hover:bg-slate-50'
            ]"
            @click="pickSubject(subject.id)"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="subject.id === 'empty' ? 'bg-slate-300' : SUBJECT_DOT_CLASS[subject.tone]"
              aria-hidden="true"
            />
            <span class="flex-1 leading-snug">{{ subject.name }}</span>
            <span
              v-if="selectedMeta.subject.id === subject.id"
              class="text-[10px] font-bold text-sky-600 shrink-0"
            >当前</span>
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
