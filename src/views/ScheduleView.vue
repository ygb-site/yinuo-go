<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { domToPng } from 'modern-screenshot';
import { Check, Cloud, Copy, Download, LoaderCircle, MoreHorizontal, Shapes } from 'lucide-vue-next';
import { AppModal } from '../design-system';
import ScheduleLayoutBoard from '../components/schedule/ScheduleLayoutBoard.vue';
import { useUserStore } from '../stores/useUserStore';
import { gradeYearLabel } from '../types/curriculum';
import {
  SCHEDULE_SKINS,
  SCRAPBOOK_COLOR_SPLITS,
  getScheduleSkin,
  readStoredScheduleSkinId,
  readStoredScrapbookSplit,
  storeScheduleSkinId,
  storeScrapbookSplit,
  type ScheduleSkinId,
  type ScrapbookColorSplit
} from '../domain/schedule/scheduleSkins';
import {
  useScheduleStore,
  WEEKDAYS,
  SCHEDULE_PERIODS,
  SCHEDULE_SUBJECTS,
  SUBJECT_CELL_CLASS,
  SUBJECT_DOT_CLASS,
  SUBJECT_POSTER_CLASS,
  getTodayWeekdayId,
  type WeekdayId,
  type SubjectId
} from '../stores/useScheduleStore';

const userStore = useUserStore();
const scheduleStore = useScheduleStore();
const todayId = computed(() => getTodayWeekdayId());

const mobileDay = ref<WeekdayId>(todayId.value || 1);
const pickerOpen = ref(false);
const moreOpen = ref(false);
const exporting = ref(false);
const previewOpen = ref(false);
const previewDataUrl = ref('');
const exportSheetRef = ref<HTMLElement | null>(null);
const copying = ref(false);
const copyDone = ref(false);
let copyDoneTimer: ReturnType<typeof setTimeout> | null = null;

const skinId = ref<ScheduleSkinId>(readStoredScheduleSkinId());
const skin = computed(() => getScheduleSkin(skinId.value));
const scrapbookSplit = ref<ScrapbookColorSplit>(readStoredScrapbookSplit());
const isScrapbook = computed(() => skinId.value === 'scrapbook');

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

const darkChrome = computed(() => skinId.value === 'chalkboard');

const selectSkin = (id: ScheduleSkinId) => {
  skinId.value = id;
  storeScheduleSkinId(id);
};

const selectScrapbookSplit = (id: ScrapbookColorSplit) => {
  scrapbookSplit.value = id;
  storeScrapbookSplit(id);
};

const openPicker = (day: WeekdayId, period: number) => {
  scheduleStore.selectCell(day, period);
  mobileDay.value = day;
  pickerOpen.value = true;
};

const onBoardPick = (day: WeekdayId, period: number) => {
  openPicker(day, period);
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
      backgroundColor: skin.value.exportBgHex
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
};

/** 复制图片到剪贴板，方便微信直接粘贴发送 */
const copyPreviewImage = async () => {
  if (!previewDataUrl.value || copying.value) return;
  copying.value = true;
  copyDone.value = false;
  try {
    const response = await fetch(previewDataUrl.value);
    const blob = await response.blob();
    const pngBlob =
      blob.type === 'image/png' ? blob : new Blob([await blob.arrayBuffer()], { type: 'image/png' });

    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      throw new Error('clipboard api unavailable');
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob })
    ]);

    copyDone.value = true;
    if (copyDoneTimer) clearTimeout(copyDoneTimer);
    copyDoneTimer = setTimeout(() => {
      copyDone.value = false;
    }, 2500);
  } catch (err) {
    console.error('ScheduleView.copyPreviewImage', err);
    window.alert('复制失败了，请改用「下载图片」，或检查浏览器是否允许剪贴板权限');
  } finally {
    copying.value = false;
  }
};

const onPreviewOpenUpdate = (open: boolean) => {
  previewOpen.value = open;
  if (!open) {
    previewDataUrl.value = '';
    copyDone.value = false;
    if (copyDoneTimer) {
      clearTimeout(copyDoneTimer);
      copyDoneTimer = null;
    }
  }
};

onMounted(() => {
  document.addEventListener('click', closeMoreMenu);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', closeMoreMenu);
  if (copyDoneTimer) clearTimeout(copyDoneTimer);
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
  <div
    class="min-h-[calc(100vh-5rem)] py-5 md:py-8 px-3.5 sm:px-6 lg:px-8 select-none font-sans transition-colors duration-300"
    :class="skin.pageBg"
  >
    <div class="max-w-6xl mx-auto space-y-4">

      <!-- 页头 -->
      <header
        class="relative overflow-hidden rounded-2xl border px-5 sm:px-6 py-4 sm:py-5"
        :class="
          darkChrome
            ? 'bg-[#14532D] border-emerald-900 text-emerald-50'
            : 'bg-white/90 border-slate-200/70 shadow-[0_1px_0_rgba(15,23,42,0.04)]'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-1.5">
            <p
              class="text-[11px] font-semibold tracking-wide"
              :class="darkChrome ? 'text-emerald-200/70' : 'text-slate-400'"
            >
              京西校区 26-27 学年 · {{ gradeLabel }}
            </p>
            <h1
              class="text-xl sm:text-2xl font-black tracking-tight"
              :class="darkChrome ? 'text-amber-50' : 'text-slate-900'"
            >
              {{ scheduleStore.displayStudentName }}的课程表
            </h1>
            <p
              class="text-xs sm:text-sm font-medium"
              :class="darkChrome ? 'text-emerald-100/70' : 'text-slate-500'"
            >
              {{ scheduleStore.schoolName }}
              <span class="mx-1.5 opacity-40">|</span>
              {{ scheduleStore.className }}
            </p>
            <p
              class="inline-flex items-center gap-1.5 text-[11px] font-medium"
              :class="darkChrome ? 'text-emerald-200/50' : 'text-slate-400'"
            >
              <Cloud class="w-3.5 h-3.5 shrink-0" />
              {{ syncHint }}
            </p>
          </div>

          <div class="relative shrink-0" @click.stop>
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold active:scale-95 transition cursor-pointer"
              :class="
                darkChrome
                  ? 'border-emerald-700 text-emerald-100 hover:bg-emerald-900/50'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              "
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

      <!-- 形态选择：强调「布局不同」 -->
      <section
        class="rounded-2xl border px-4 sm:px-5 py-3.5"
        :class="
          darkChrome
            ? 'bg-[#166534]/40 border-emerald-800'
            : 'bg-white/90 border-slate-200/70'
        "
      >
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="min-w-0 flex items-center gap-2">
            <Shapes
              class="w-4 h-4 shrink-0"
              :class="darkChrome ? 'text-emerald-200' : 'text-slate-500'"
            />
            <div class="min-w-0">
              <h2
                class="text-sm font-bold"
                :class="darkChrome ? 'text-emerald-50' : 'text-slate-800'"
              >课表形态</h2>
              <p
                class="text-[11px] font-medium mt-0.5"
                :class="darkChrome ? 'text-emerald-200/60' : 'text-slate-400'"
              >
                每种长得都不一样 · 当前「{{ skin.name }}」
              </p>
            </div>
          </div>
          <span
            class="text-[11px] font-medium shrink-0"
            :class="darkChrome ? 'text-emerald-200/60' : 'text-slate-400'"
          >10 种</span>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5 snap-x snap-mandatory">
          <button
            v-for="item in SCHEDULE_SKINS"
            :key="item.id"
            type="button"
            class="snap-start shrink-0 w-[8.25rem] rounded-xl border px-2.5 py-2.5 text-left transition active:scale-95 cursor-pointer"
            :class="
              skinId === item.id
                ? darkChrome
                  ? 'border-amber-300 bg-emerald-950 ring-2 ring-amber-300/50'
                  : 'border-slate-900 bg-slate-900 text-white ring-2 ring-slate-400/40'
                : darkChrome
                  ? 'border-emerald-700 bg-emerald-950/40 text-emerald-50 hover:border-emerald-500'
                  : 'border-slate-200 bg-white hover:border-slate-400'
            "
            :aria-pressed="skinId === item.id"
            @click="selectSkin(item.id)"
          >
            <div class="flex items-center gap-1 mb-1.5">
              <span
                v-for="(color, idx) in item.swatches"
                :key="`${item.id}-${idx}`"
                class="h-2.5 w-2.5 rounded-full border border-black/10"
                :style="{ backgroundColor: color }"
              />
              <span
                class="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded"
                :class="
                  skinId === item.id
                    ? darkChrome ? 'bg-amber-300 text-emerald-950' : 'bg-white text-slate-900'
                    : darkChrome ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-100 text-slate-500'
                "
              >{{ item.formLabel }}</span>
            </div>
            <p class="text-[12px] font-bold leading-tight">{{ item.name }}</p>
            <p
              class="text-[10px] font-medium mt-0.5 leading-snug line-clamp-2"
              :class="
                skinId === item.id
                  ? darkChrome ? 'text-emerald-100/70' : 'text-white/70'
                  : darkChrome ? 'text-emerald-200/50' : 'text-slate-400'
              "
            >
              {{ item.tagline }}
            </p>
          </button>
        </div>
      </section>

      <!-- 手账贴纸：粉蓝三种分色 Tab -->
      <section
        v-if="isScrapbook"
        class="rounded-2xl border border-pink-200/70 bg-white/90 px-4 sm:px-5 py-3.5"
      >
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="min-w-0">
            <h2 class="text-sm font-bold text-slate-800">粉蓝渐变</h2>
            <p class="text-[11px] font-medium text-slate-400 mt-0.5">
              粉色慢慢过渡到蓝色 · 三种方向都看看
            </p>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full bg-pink-400" />
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400" />
          </div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            v-for="item in SCRAPBOOK_COLOR_SPLITS"
            :key="item.id"
            type="button"
            class="rounded-xl border px-3 py-3 text-left transition active:scale-[0.99] cursor-pointer"
            :class="
              scrapbookSplit === item.id
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-pink-100 bg-gradient-to-r from-pink-50 to-sky-50 hover:border-pink-300'
            "
            :aria-pressed="scrapbookSplit === item.id"
            @click="selectScrapbookSplit(item.id)"
          >
            <p class="text-[13px] font-black">{{ item.name }}</p>
            <p
              class="text-[11px] font-medium mt-0.5"
              :class="scrapbookSplit === item.id ? 'text-white/70' : 'text-slate-500'"
            >
              {{ item.tagline }}
            </p>
          </button>
        </div>
      </section>

      <!-- 今日课程 -->
      <section
        class="rounded-2xl border px-4 sm:px-5 py-3.5"
        :class="
          darkChrome
            ? 'bg-[#166534]/40 border-emerald-800'
            : 'bg-white/90 border-slate-200/70'
        "
      >
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <h2
            class="text-sm font-bold"
            :class="darkChrome ? 'text-emerald-50' : 'text-slate-800'"
          >
            {{ todayId ? '今日课程' : '周末休息' }}
          </h2>
          <span
            class="text-[11px] font-medium"
            :class="darkChrome ? 'text-emerald-200/60' : 'text-slate-400'"
          >
            {{ todayId ? `${todayCourses.length} 节` : '好好放松' }}
          </span>
        </div>

        <div v-if="todayId && todayCourses.length > 0" class="flex flex-wrap gap-2">
          <button
            v-for="row in todayCourses"
            :key="row.period.id"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[13px] font-semibold transition cursor-pointer active:scale-95"
            :class="SUBJECT_POSTER_CLASS[row.subject.tone]"
            @click="openPicker(todayId, row.period.id)"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="SUBJECT_DOT_CLASS[row.subject.tone]"
              aria-hidden="true"
            />
            <span>{{ row.subject.name }}</span>
            <span class="text-[11px] font-medium opacity-60">{{ row.period.label }}</span>
          </button>
        </div>
        <p
          v-else
          class="text-xs font-medium"
          :class="darkChrome ? 'text-emerald-200/50' : 'text-slate-400'"
        >
          {{ todayId ? '今天还没填课，点下面格子选课' : '周一到周五的课表可以提前看' }}
        </p>
      </section>

      <!-- 手机星期切换（部分形态需要） -->
      <div
        class="lg:hidden flex gap-1 p-1 rounded-2xl border"
        :class="
          darkChrome
            ? 'bg-[#166534]/40 border-emerald-800'
            : 'bg-white/90 border-slate-200/70'
        "
      >
        <button
          v-for="day in WEEKDAYS"
          :key="day.id"
          type="button"
          class="flex-1 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
          :class="[
            mobileDay === day.id
              ? darkChrome
                ? 'bg-amber-300 text-emerald-950'
                : 'bg-slate-900 text-white'
              : todayId === day.id
                ? darkChrome
                  ? 'text-amber-200 bg-emerald-900/50'
                  : 'text-sky-700 bg-sky-50'
                : darkChrome
                  ? 'text-emerald-100/70'
                  : 'text-slate-500 hover:bg-slate-50'
          ]"
          @click="mobileDay = day.id"
        >
          {{ day.name }}
        </button>
      </div>

      <!-- 一周课表：真正换形态 -->
      <section
        class="rounded-2xl border p-3 sm:p-5"
        :class="
          darkChrome
            ? 'bg-transparent border-emerald-800'
            : 'bg-white/90 border-slate-200/70'
        "
      >
        <div class="mb-3 sm:mb-4 px-0.5 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <h2
              class="text-sm sm:text-base font-bold"
              :class="darkChrome ? 'text-emerald-50' : 'text-slate-800'"
            >一周课表</h2>
            <p
              class="text-[11px] font-medium mt-0.5"
              :class="darkChrome ? 'text-emerald-200/60' : 'text-slate-400'"
            >
              {{ skin.formLabel }} · {{ skin.tagline }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait shadow-sm"
            :class="
              darkChrome
                ? 'bg-amber-300 text-emerald-950 hover:bg-amber-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            "
            :disabled="exporting"
            @click="openExportPreview"
          >
            <LoaderCircle v-if="exporting" class="w-3.5 h-3.5 animate-spin" />
            <Download v-else class="w-3.5 h-3.5" />
            {{ exporting ? '生成中…' : '导出贴墙' }}
          </button>
        </div>

        <ScheduleLayoutBoard
          :skin-id="skinId"
          :interactive="true"
          :today-id="todayId"
          :mobile-day="mobileDay"
          :scrapbook-split="scrapbookSplit"
          @pick="onBoardPick"
        />
      </section>
    </div>

    <!-- 离屏导出 -->
    <div
      class="fixed top-0 -left-[9999px] w-[1100px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref="exportSheetRef"
        class="p-10 font-sans"
        :class="darkChrome ? 'text-emerald-50' : 'text-slate-900'"
        :style="{ backgroundColor: skin.exportBgHex }"
      >
        <div class="mb-6">
          <p
            class="text-sm font-bold tracking-wide mb-2"
            :class="darkChrome ? 'text-emerald-200/70' : 'text-slate-400'"
          >
            京西校区 26-27 学年 · {{ gradeLabel }}
          </p>
          <h1 class="text-[2.1rem] font-black tracking-tight mb-2">
            {{ scheduleStore.displayStudentName }}的课程表
          </h1>
          <p
            class="text-[15px] font-medium"
            :class="darkChrome ? 'text-emerald-100/70' : 'text-slate-500'"
          >
            {{ scheduleStore.schoolName }} · {{ scheduleStore.className }}
          </p>
        </div>

        <ScheduleLayoutBoard
          :skin-id="skinId"
          :interactive="false"
          :today-id="null"
          :mobile-day="mobileDay"
          :export-mode="true"
          :scrapbook-split="scrapbookSplit"
        />
      </div>
    </div>

    <AppModal
      :open="previewOpen"
      size="lg"
      presentation="center"
      @update:open="onPreviewOpenUpdate"
    >
      <template #header>
        <div class="min-w-0 pr-2">
          <h3 class="text-base font-bold text-slate-900 tracking-tight">贴墙预览</h3>
          <p class="text-[11px] text-slate-500 font-medium mt-0.5">
            {{ copyDone ? '已复制，去微信粘贴发送吧' : '可复制到微信，也可下载保存' }}
          </p>
        </div>
      </template>

      <div
        class="rounded-xl border border-slate-200 overflow-auto max-h-[55vh]"
        :style="{ backgroundColor: skin.exportBgHex }"
      >
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
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white cursor-pointer active:scale-95 transition"
          @click="downloadPreviewImage"
        >
          <Download class="w-3.5 h-3.5" />
          下载
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition disabled:opacity-60"
          :class="
            copyDone
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          "
          :disabled="copying"
          @click="copyPreviewImage"
        >
          <LoaderCircle v-if="copying" class="w-3.5 h-3.5 animate-spin" />
          <Check v-else-if="copyDone" class="w-3.5 h-3.5" />
          <Copy v-else class="w-3.5 h-3.5" />
          {{ copying ? '复制中…' : copyDone ? '已复制' : '复制图片' }}
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
              subject.id === 'empty' ? 'text-slate-400 bg-white' : SUBJECT_CELL_CLASS[subject.tone],
              selectedMeta.subject.id === subject.id
                ? 'bg-slate-50'
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
              class="text-[10px] font-bold text-slate-600 shrink-0"
            >当前</span>
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
