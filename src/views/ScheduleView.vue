<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { domToPng } from 'modern-screenshot';
import {
  Check,
  Copy,
  Download,
  LoaderCircle,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Plus,
  Edit3,
  Trash2
} from 'lucide-vue-next';
import { AppModal } from '../design-system';
import ScheduleLayoutBoard from '../components/schedule/ScheduleLayoutBoard.vue';
import ScheduleAiImportModal from '../components/schedule/ScheduleAiImportModal.vue';
import CreateScheduleModal from '../components/schedule/CreateScheduleModal.vue';
import ScheduleCellPickerModal from '../components/schedule/ScheduleCellPickerModal.vue';
import { useUserStore } from '../stores/useUserStore';
import { showAlert, showConfirm } from '../utils/alert';
import {
  getScheduleSkin,
  type ScheduleSkinId
} from '../domain/schedule/scheduleSkins';
import {
  useScheduleStore,
  WEEKDAYS,
  getTodayWeekdayId,
  type WeekdayId,
} from '../stores/useScheduleStore';

const userStore = useUserStore();
const scheduleStore = useScheduleStore();
const todayId = computed(() => getTodayWeekdayId());

const mobileDay = ref<WeekdayId>(todayId.value || 1);
const pickerOpen = ref(false);
const showAiModal = ref(false);
const showCreateModal = ref(false);
const createModalMode = ref<'create' | 'edit'>('create');
const gradeDropdownOpen = ref(false);

const selectGrade = (recordId: string) => {
  scheduleStore.switchVersionRecord(recordId);
  gradeDropdownOpen.value = false;
};
const moreOpen = ref(false);

const openCreateNewModal = () => {
  createModalMode.value = 'create';
  showCreateModal.value = true;
};

const openEditModal = () => {
  createModalMode.value = 'edit';
  showCreateModal.value = true;
};

const handleDeleteCurrentGrade = async () => {
  moreOpen.value = false;
  const currentGrade = scheduleStore.gradeLabel || '当前年级';
  const currentClass = scheduleStore.className || '';
  const confirmed = await showConfirm({
    title: '删除当前年级课表',
    message: `确定要删除「${currentGrade} · ${currentClass}」的课表吗？其他年级的课表不受影响。`,
    confirmText: '确认删除',
    cancelText: '取消'
  });
  if (confirmed) {
    scheduleStore.deleteScheduleRecord(scheduleStore.activeRecordId);
    await showAlert({
      title: '已删除',
      message: `已移除「${currentGrade}」课表。`,
      type: 'info'
    });
  }
};
const exporting = ref(false);
const previewOpen = ref(false);
const previewDataUrl = ref('');
const exportSheetRef = ref<HTMLElement | null>(null);
const copying = ref(false);
const copyDone = ref(false);
let copyDoneTimer: ReturnType<typeof setTimeout> | null = null;

const skinId = ref<ScheduleSkinId>('poster');
const skin = computed(() => getScheduleSkin('poster'));

const exportFileName = computed(() => {
  const safeName = (scheduleStore.displayStudentName || '课程表').replace(/[\\/:*?"<>|]/g, '');
  return `${safeName}-${scheduleStore.gradeLabel || '一年级'}课程表.png`;
});

const openPicker = (day: WeekdayId, period: number) => {
  scheduleStore.selectCell(day, period);
  mobileDay.value = day;
  pickerOpen.value = true;
};

const onBoardPick = (day: WeekdayId, period: number) => {
  openPicker(day, period);
};

const handleDeleteSchedule = async () => {
  moreOpen.value = false;
  const confirmed = await showConfirm({
    title: '清空并重置课表',
    message: '确定要清空整张课表吗？将回到初始空白状态，可重新填写学校与班级。',
    confirmText: '清空课表',
    cancelText: '取消'
  });
  if (confirmed) {
    scheduleStore.deleteEntireSchedule();
    await showAlert({
      title: '课表已清空',
      message: '已回到空白状态，您可以重新创建或使用 AI 识图导入课表。',
      type: 'info'
    });
  }
};

const closeMoreMenu = () => {
  moreOpen.value = false;
  gradeDropdownOpen.value = false;
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
    showAlert({ title: '导出提示', message: '生成贴墙预览图失败，请重试', type: 'error' });
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
    showAlert({ title: '复制提示', message: '复制失败了，请改用「下载」保存图片，或检查剪贴板权限。', type: 'warning' });
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

      <!-- 1. 全新空白状态：尚未创建课表时的引导卡片 -->
      <div v-if="!scheduleStore.hasSchedule" class="py-16 sm:py-24 px-4 max-w-lg mx-auto text-center space-y-6 animate-in fade-in duration-300">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 text-amber-800 border-2 border-amber-300/80 shadow-md">
          <GraduationCap class="w-10 h-10" />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            开启你的专属课程表
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            当前尚未创建课表。请先创建课表档案，填写学校、年级与班级信息。
          </p>
        </div>

        <div class="flex items-center justify-center pt-2">
          <button
            type="button"
            class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            @click="openCreateNewModal"
          >
            <Plus class="w-4 h-4 stroke-[2.5]" />
            <span>创建专属课表</span>
          </button>
        </div>
      </div>

      <!-- 2. 正式课表大盘：已创建课表时呈现（完全还原图1样式） -->
      <div v-else class="space-y-4 animate-in fade-in duration-300">
        <!-- 手机星期切换 -->
        <div
          class="lg:hidden flex gap-1 p-1 rounded-2xl border bg-white/90 border-slate-200/70 shadow-2xs"
        >
          <button
            v-for="day in WEEKDAYS"
            :key="day.id"
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
            :class="[
              mobileDay === day.id
                ? 'bg-slate-900 text-white shadow-xs'
                : todayId === day.id
                  ? 'text-sky-700 bg-sky-50'
                  : 'text-slate-500 hover:bg-slate-50'
            ]"
            @click="mobileDay = day.id"
          >
            {{ day.name }}
          </button>
        </div>

        <!-- 一周课表卡片主体（如图1） -->
        <section class="rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm p-4 sm:p-6 space-y-4">
          <!-- 顶栏：标题、年级下拉选择与操作按钮 -->
          <div class="flex items-start sm:items-center justify-between gap-3 pb-1">
            <div class="min-w-0">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  一周课表
                </h1>

                <!-- 年级与班级下拉选择菜单 -->
                <div class="relative" @click.stop>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-950 text-xs font-bold transition cursor-pointer border border-amber-200/80 shadow-2xs"
                    title="点击切换或新建年级课表"
                    @click="gradeDropdownOpen = !gradeDropdownOpen"
                  >
                    <GraduationCap class="w-3.5 h-3.5 text-amber-700" />
                    <span>{{ scheduleStore.gradeLabel || '一年级' }} · {{ scheduleStore.className || '1.1班' }}</span>
                    <ChevronDown class="w-3.5 h-3.5 text-amber-700/70 transition-transform duration-200" :class="{ 'rotate-180': gradeDropdownOpen }" />
                  </button>

                  <!-- 年级选择下拉菜单 -->
                  <div
                    v-if="gradeDropdownOpen"
                    class="absolute left-0 top-full mt-1.5 w-64 rounded-2xl bg-white text-slate-800 shadow-xl border border-slate-200 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1"
                  >
                    <div class="px-2.5 py-1 text-[10px] font-bold text-slate-400">选择年级课表</div>
                    <button
                      v-for="rec in scheduleStore.versionRecords"
                      :key="rec.id"
                      type="button"
                      class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer"
                      :class="scheduleStore.activeRecordId === rec.id
                        ? 'bg-amber-100/80 text-amber-950 font-black'
                        : 'hover:bg-slate-50 text-slate-700'"
                      @click="selectGrade(rec.id)"
                    >
                      <span class="truncate">{{ rec.gradeLabel }} · {{ rec.className }}</span>
                      <Check v-if="scheduleStore.activeRecordId === rec.id" class="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    </button>

                    <div class="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-50 flex items-center gap-1.5 cursor-pointer transition"
                        @click="openCreateNewModal(); gradeDropdownOpen = false"
                      >
                        <Plus class="w-3.5 h-3.5 text-amber-600" />
                        <span>新建课表</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p class="text-xs sm:text-sm font-medium text-slate-500 mt-1 truncate">
                {{ scheduleStore.schoolName || '中国人民大学附属小学京西分校' }} · 官方核定课表
              </p>
            </div>

            <!-- 右侧操作区：AI 识图排课 + 导出贴墙 + 更多设置（无重复按钮） -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- AI 识图排课按钮 -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 shadow-xs active:scale-95 transition cursor-pointer"
                title="上传课表图片，DeepSeek 智能识别自动排课"
                @click="showAiModal = true"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>AI 识图排课</span>
              </button>

              <!-- 导出贴墙按钮（黑底圆角，带下载图标） -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                :disabled="exporting"
                @click="openExportPreview"
              >
                <LoaderCircle v-if="exporting" class="w-3.5 h-3.5 animate-spin" />
                <Download v-else class="w-3.5 h-3.5" />
                <span>{{ exporting ? '生成中…' : '导出贴墙' }}</span>
              </button>

              <!-- 更多下拉操作：不换行、无重复 -->
              <div class="relative" @click.stop>
                <button
                  type="button"
                  class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                  title="课表设置"
                  @click="moreOpen = !moreOpen"
                >
                  <MoreHorizontal class="w-4 h-4" />
                </button>
                <div
                  v-if="moreOpen"
                  class="absolute right-0 top-full mt-1.5 min-w-[12rem] whitespace-nowrap rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150 py-1"
                >
                  <button
                    type="button"
                    class="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-700"
                    @click="openEditModal(); moreOpen = false"
                  >
                    <Edit3 class="w-3.5 h-3.5 text-slate-500" />
                    <span>修改学校与班级</span>
                  </button>
                  <button
                    v-if="scheduleStore.versionRecords.length > 1"
                    type="button"
                    class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                    @click="handleDeleteCurrentGrade"
                  >
                    <Trash2 class="w-3.5 h-3.5 text-rose-500" />
                    <span>删除当前年级课表</span>
                  </button>
                  <button
                    type="button"
                    class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                    @click="handleDeleteSchedule"
                  >
                    <Trash2 class="w-3.5 h-3.5 text-rose-500" />
                    <span>清空重置所有课表</span>
                  </button>
                </div>
              </div>
            </div>
          </div>


          <!-- 课表大盘表格（圆角虚线加号，初次全空，如图1） -->
          <ScheduleLayoutBoard
            :skin-id="skinId"
            :interactive="true"
            :today-id="todayId"
            :mobile-day="mobileDay"
            @pick="onBoardPick"
          />
        </section>
      </div>
    </div>

    <!-- 离屏导出画布 -->
    <div
      class="fixed top-0 -left-[9999px] w-[1100px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref="exportSheetRef"
        class="p-10 font-sans text-slate-900"
        :style="{ backgroundColor: skin.exportBgHex }"
      >
        <div class="mb-6">
          <h1 class="text-[2.1rem] font-black tracking-tight mb-2">
            一周课表
          </h1>
          <p class="text-[15px] font-medium text-slate-500">
            {{ scheduleStore.schoolName || '中国人民大学附属小学京西分校' }} · {{ scheduleStore.gradeLabel || '一年级' }} {{ scheduleStore.className || '1.1班' }}官方课表
          </p>
        </div>

        <ScheduleLayoutBoard
          :skin-id="skinId"
          :interactive="false"
          :today-id="null"
          :mobile-day="mobileDay"
          :export-mode="true"
        />
      </div>
    </div>

    <!-- 导出预览弹窗 -->
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

    <!-- 排课选课弹窗（图2） -->
    <ScheduleCellPickerModal
      :open="pickerOpen"
      :day="scheduleStore.selectedDay"
      :period="scheduleStore.selectedPeriod"
      @close="pickerOpen = false"
    />

    <!-- 创建课表弹窗 -->
    <CreateScheduleModal
      :show="showCreateModal"
      :mode="createModalMode"
      @close="showCreateModal = false"
    />

    <!-- AI 识图排课弹窗 -->
    <ScheduleAiImportModal
      :show="showAiModal"
      @close="showAiModal = false"
    />
  </div>
</template>

