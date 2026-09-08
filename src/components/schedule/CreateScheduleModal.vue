<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  useScheduleStore,
  type GradeYear,
  DEFAULT_SCHEDULE_PERIODS
} from '../../stores/useScheduleStore';
import { showAlert } from '../../utils/alert';
import {
  X,
  Check,
  School,
  GraduationCap,
  Users
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    show: boolean;
    mode?: 'create' | 'edit';
  }>(),
  {
    mode: 'create'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created'): void;
}>();

const scheduleStore = useScheduleStore();

const schoolName = ref('');
const gradeLabel = ref('');
const className = ref('');

function inferGradeYear(gradeStr: string): GradeYear {
  if (gradeStr.includes('二') || gradeStr.includes('2')) return 'g2';
  if (gradeStr.includes('三') || gradeStr.includes('3')) return 'g3';
  if (gradeStr.includes('四') || gradeStr.includes('4')) return 'g4';
  if (gradeStr.includes('五') || gradeStr.includes('5')) return 'g5';
  if (gradeStr.includes('六') || gradeStr.includes('6')) return 'g6';
  return 'g1';
}

watch(
  () => props.show,
  (open) => {
    if (open) {
      if (props.mode === 'edit') {
        schoolName.value = scheduleStore.schoolName || '中国人民大学附属小学京西分校';
        gradeLabel.value = scheduleStore.gradeLabel || '一年级';
        className.value = scheduleStore.className || '1.1班';
      } else {
        // 新建模式：学校默认继承已填学校，年级与班级清空方便用户新建其他年级
        schoolName.value = scheduleStore.schoolName || '中国人民大学附属小学京西分校';
        gradeLabel.value = '';
        className.value = '';
      }
    }
  },
  { immediate: true }
);

function handleConfirm() {
  const school = schoolName.value.trim();
  const grade = gradeLabel.value.trim();
  const cls = className.value.trim();

  if (!school) {
    showAlert({ title: '温馨提示', message: '请输入学校全称或简称哦！', type: 'warning' });
    return;
  }
  if (!grade) {
    showAlert({ title: '温馨提示', message: '请输入年级名称，例如“二年级”或“初一”！', type: 'warning' });
    return;
  }
  if (!cls) {
    showAlert({ title: '温馨提示', message: '请输入班级名称，例如“2.1班”或“二年级1班”！', type: 'warning' });
    return;
  }

  const computedGradeYear = inferGradeYear(grade);

  if (props.mode === 'edit') {
    scheduleStore.updateMeta({
      schoolName: school,
      className: cls,
      gradeYear: computedGradeYear,
      gradeLabel: grade
    });

    showAlert({
      title: '修改成功',
      message: `已更新为「${school} · ${grade} ${cls}」！`,
      type: 'success'
    });
  } else {
    scheduleStore.createSchedule({
      schoolName: school,
      className: cls,
      gradeYear: computedGradeYear,
      gradeLabel: grade,
      term: 'term1',
      termLabel: '上学期',
      studentName: '杨一诺',
      periods: DEFAULT_SCHEDULE_PERIODS
    });

    showAlert({
      title: '课表创建成功',
      message: `已成功创建「${school} · ${grade} ${cls}」课表档案！`,
      type: 'success'
    });
  }

  emit('created');
  emit('close');
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- 弹窗顶栏 -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <div class="flex items-center gap-2.5">
          <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-800">
            <GraduationCap class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">
              {{ mode === 'edit' ? '修改课表' : '新建课表' }}
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              {{ mode === 'edit' ? '修改学校、年级与班级信息' : '填写学校、年级与班级，开启专属课程表' }}
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
        <!-- 1. 学校名称 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <School class="w-3.5 h-3.5 text-amber-700" />
            <span>学校名称 *</span>
          </label>
          <input
            v-model="schoolName"
            type="text"
            placeholder="如：中国人民大学附属小学京西分校"
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <!-- 2. 年级名称 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <GraduationCap class="w-3.5 h-3.5 text-amber-700" />
            <span>年级 *</span>
          </label>
          <input
            v-model="gradeLabel"
            type="text"
            placeholder="如：二年级、三年级、初一、高二..."
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <!-- 3. 班级名称 -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Users class="w-3.5 h-3.5 text-amber-700" />
            <span>班级名称 *</span>
          </label>
          <input
            v-model="className"
            type="text"
            placeholder="如：2.1班、二年级1班、实验班..."
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <!-- 弹窗底栏 -->
      <div class="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/80">
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
          <span>{{ mode === 'edit' ? '保存修改' : '立即创建课表' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
