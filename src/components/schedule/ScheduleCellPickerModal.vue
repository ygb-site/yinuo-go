<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { showAlert } from '../../utils/alert';
import {
  useScheduleStore,
  WEEKDAYS,
  SCHEDULE_PERIODS,
  type WeekdayId,
  type ScheduleSubject,
  type SubjectTone
} from '../../stores/useScheduleStore';
import {
  X,
  Check,
  Plus,
  User,
  Search,
  Sparkles,
  BookOpen
} from 'lucide-vue-next';

const props = defineProps<{
  open: boolean;
  day: WeekdayId;
  period: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const scheduleStore = useScheduleStore();

// 当前选择的课程 ID 和任课老师
const selectedSubjectId = ref<string>('empty');
const initialSubjectId = ref<string>('empty');
const teacherInput = ref<string>('');

// 新增自定课程的表单状态
const showAddSubject = ref(false);
const newSubjectName = ref('');
const newSubjectEmoji = ref('📖');
const newSubjectTone = ref<SubjectTone>('sky');
const newSubjectTeacher = ref('');
const searchQuery = ref('');

const emojiCandidates = ['📖', '🔢', '🔤', '🔬', '🌱', '⚽', '🎵', '🎨', '💻', '🏊', '🥋', '🎭', '🧪', '🖌️', '♟️', '🧗', '🤖', '🎺', '🧠'];
const toneCandidates: { id: SubjectTone; label: string; bg: string }[] = [
  { id: 'sky', label: '天蓝', bg: 'bg-sky-400' },
  { id: 'rose', label: '绯红', bg: 'bg-rose-400' },
  { id: 'indigo', label: '靛蓝', bg: 'bg-indigo-400' },
  { id: 'amber', label: '琥珀', bg: 'bg-amber-400' },
  { id: 'emerald', label: '青翠', bg: 'bg-emerald-400' },
  { id: 'violet', label: '紫藤', bg: 'bg-violet-400' },
  { id: 'teal', label: '松绿', bg: 'bg-teal-400' },
  { id: 'orange', label: '暖橙', bg: 'bg-orange-400' },
  { id: 'cyan', label: '青碧', bg: 'bg-cyan-400' },
  { id: 'lime', label: '黄绿', bg: 'bg-lime-500' }
];

const initialSubjectName = computed(() => {
  if (!initialSubjectId.value || initialSubjectId.value === 'empty') return '空课';
  return scheduleStore.allSubjects.find((s) => s.id === initialSubjectId.value)?.name || initialSubjectId.value;
});

const currentSelectedName = computed(() => {
  if (!selectedSubjectId.value || selectedSubjectId.value === 'empty') return '空课';
  return scheduleStore.allSubjects.find((s) => s.id === selectedSubjectId.value)?.name || selectedSubjectId.value;
});

const dayName = computed(() => WEEKDAYS.find((d) => d.id === props.day)?.name || `周${props.day}`);
const periodLabel = computed(() => SCHEDULE_PERIODS.find((p) => p.id === props.period)?.label || `第${props.period}节`);

// 打开弹窗时，从 store 读取当前格子的科目和任课老师
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      const curSubj = scheduleStore.cellSubject(props.day, props.period);
      initialSubjectId.value = curSubj.id;
      selectedSubjectId.value = curSubj.id;
      teacherInput.value = scheduleStore.cellTeacher(props.day, props.period) || curSubj.defaultTeacher || '';
      showAddSubject.value = false;
      newSubjectName.value = '';
      newSubjectTeacher.value = '';
      searchQuery.value = '';
    }
  },
  { immediate: true }
);

// 过滤并置顶：将当前已选科目排在列表第 1 位
const filteredSubjects = computed(() => {
  const all = scheduleStore.allSubjects.filter((s) => s.id !== 'empty');
  const q = searchQuery.value.trim().toLowerCase();
  let list = all;
  if (q) {
    list = all.filter((s) => s.name.toLowerCase().includes(q) || (s.shortName && s.shortName.toLowerCase().includes(q)));
  }
  const anchorId = initialSubjectId.value;
  return [...list].sort((a, b) => {
    if (a.id === anchorId) return -1;
    if (b.id === anchorId) return 1;
    return 0;
  });
});

// 选定某个已有科目
function handleSelectSubject(subj: ScheduleSubject) {
  selectedSubjectId.value = subj.id;
  // 如果当前没填老师，且该科目有默认老师，自动带出
  if (!teacherInput.value && subj.defaultTeacher) {
    teacherInput.value = subj.defaultTeacher;
  }
}

// 快速填入已知任课老师
function handleQuickPickTeacher(tName: string) {
  teacherInput.value = tName;
}

// 新增自定义科目并立即选定
function handleCreateCustomSubject() {
  const name = newSubjectName.value.trim();
  if (!name) {
    showAlert({ title: '温馨提示', message: '请输入课程全称哦！', type: 'warning' });
    return;
  }
  const created = scheduleStore.addCustomSubject({
    name,
    emoji: newSubjectEmoji.value,
    tone: newSubjectTone.value,
    defaultTeacher: newSubjectTeacher.value.trim()
  });

  selectedSubjectId.value = created.id;
  if (newSubjectTeacher.value.trim()) {
    teacherInput.value = newSubjectTeacher.value.trim();
  }
  showAddSubject.value = false;
  newSubjectName.value = '';
}

// 设为空课
function handleSetEmpty() {
  selectedSubjectId.value = 'empty';
  teacherInput.value = '';
  handleConfirm();
}

// 确认保存（只记录最终状态）
function handleConfirm() {
  scheduleStore.setCellSchedule(
    props.day,
    props.period,
    selectedSubjectId.value,
    selectedSubjectId.value === 'empty' ? '' : teacherInput.value.trim()
  );
  emit('saved');
  emit('close');
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- 弹窗顶栏 -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <div>
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>排定课程与任课老师</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200/60">
              {{ dayName }} · {{ periodLabel }}
            </span>
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">
            可自主增设新科目并指定任课老师，随年级与学期永久归档
          </p>
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
        <!-- 1. 任课教师录入与快捷标签 -->
        <div class="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40">
          <label class="block text-xs font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-amber-700" />
            <span>任课老师姓名（支持自由输入或点选）：</span>
          </label>
          <div class="relative flex items-center">
            <input
              v-model="teacherInput"
              type="text"
              placeholder="如：王老师、李老师..."
              class="w-full pl-3.5 pr-20 py-2.5 text-xs rounded-xl border border-amber-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
            <button
              v-if="teacherInput"
              type="button"
              class="absolute right-2 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 shadow-2xs"
              title="清空老师姓名"
              @click="teacherInput = ''"
            >
              <X class="w-3.5 h-3.5 text-amber-800" />
              <span>清空</span>
            </button>
          </div>

          <!-- 快速点选本校任课教师名录（初次进入无老师时显示为空） -->
          <div v-if="scheduleStore.knownTeachers.length > 0" class="mt-2 flex items-center gap-1 flex-wrap">
            <span class="text-[10px] text-amber-800/70 font-medium">常用教师名录:</span>
            <button
              v-for="t in scheduleStore.knownTeachers.slice(0, 16)"
              :key="t"
              type="button"
              class="px-2 py-0.5 rounded-md text-[11px] font-bold border transition cursor-pointer"
              :class="
                teacherInput === t
                  ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/60'
              "
              @click="handleQuickPickTeacher(t)"
            >
              {{ t }}
            </button>
          </div>
          <div v-else class="mt-2 text-[10px] text-amber-700/60">
            常用教师名录：暂无教师记录（输入后排课将自动沉淀）
          </div>
        </div>

        <!-- 2. 科目选择与搜索 -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <label class="text-xs font-bold text-slate-700">
              选择课程（已支持自定义课程）：
            </label>
            <button
              type="button"
              class="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200/80 transition"
              @click="showAddSubject = !showAddSubject"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>{{ showAddSubject ? '收起添加表单' : '添加新课程' }}</span>
            </button>
          </div>

          <!-- 快速添加新课程表单折叠区 -->
          <div
            v-if="showAddSubject"
            class="mb-3 p-3.5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 space-y-3"
          >
            <div class="text-xs font-bold text-amber-900 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-amber-600" />
              <span>录入新课程（自定义添加课程）</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-medium text-slate-600 mb-1">课程全称 *</label>
                <input
                  v-model="newSubjectName"
                  type="text"
                  placeholder="如：语文、数学、少儿编程、游泳..."
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-slate-600 mb-1">默认任课教师 (选填)</label>
                <input
                  v-model="newSubjectTeacher"
                  type="text"
                  placeholder="如：陈老师、李老师..."
                  class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <!-- Emoji & 色调选择 -->
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <span class="text-[11px] text-slate-500">图标:</span>
                <select
                  v-model="newSubjectEmoji"
                  class="px-2 py-1 text-sm rounded-lg border border-slate-200 bg-white"
                >
                  <option v-for="em in emojiCandidates" :key="em" :value="em">{{ em }}</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5 flex-1 overflow-x-auto pb-0.5">
                <span class="text-[11px] text-slate-500 shrink-0">色系:</span>
                <button
                  v-for="tc in toneCandidates"
                  :key="tc.id"
                  type="button"
                  class="w-5 h-5 rounded-full border-2 transition shrink-0 cursor-pointer"
                  :class="[
                    tc.bg,
                    newSubjectTone === tc.id ? 'border-slate-800 scale-110 shadow-xs' : 'border-white'
                  ]"
                  :title="tc.label"
                  @click="newSubjectTone = tc.id"
                />
              </div>

              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition cursor-pointer shrink-0"
                @click="handleCreateCustomSubject"
              >
                保存并选用
              </button>
            </div>
          </div>

          <!-- 搜索框（仅在有课程时或有输入时显示） -->
          <div v-if="scheduleStore.allSubjects.length > 0" class="relative mb-2">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="快速搜索科目名..."
              class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <!-- 课程矩阵 / 空状态（初次进入当前年级时显示为空） -->
          <div v-if="filteredSubjects.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
            <button
              v-for="s in filteredSubjects"
              :key="s.id"
              type="button"
              class="flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition cursor-pointer"
              :class="[
                selectedSubjectId === s.id
                  ? 'border-amber-600 bg-slate-900 text-white shadow-md ring-2 ring-amber-400'
                  : s.id === initialSubjectId
                    ? 'border-amber-400 bg-amber-50/70 text-slate-800 shadow-2xs ring-1 ring-amber-300/60'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
              ]"
              @click="handleSelectSubject(s)"
            >
              <span class="text-base">{{ s.emoji }}</span>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold truncate flex items-center gap-1">
                  <span>{{ s.name }}</span>
                  <span
                    v-if="s.id === initialSubjectId && selectedSubjectId !== s.id"
                    class="text-[9px] text-amber-800 bg-amber-100/90 px-1 py-0.2 rounded font-medium shrink-0"
                  >
                    原定
                  </span>
                </div>
                <div
                  class="text-[10px] truncate"
                  :class="selectedSubjectId === s.id ? 'text-slate-300' : 'text-slate-400'"
                >
                  {{ s.defaultTeacher ? `${s.defaultTeacher} 老师` : (s.isCustom ? '自定义课程' : '课程科目') }}
                </div>
              </div>

              <!-- 右侧徽章状态：已选/拟选 vs 课表原定 -->
              <span
                v-if="selectedSubjectId === s.id"
                class="text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs shrink-0 bg-amber-400 text-slate-950 flex items-center gap-0.5"
              >
                <Check class="w-3 h-3 stroke-[3]" />
                <span>{{ s.id === initialSubjectId ? '已选' : '拟选' }}</span>
              </span>

              <span
                v-else-if="s.id === initialSubjectId"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs shrink-0 bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5"
                title="当前课表中实际排定的课程"
              >
                <span>课表原定</span>
              </span>
            </button>
          </div>

          <!-- 空状态引导：初次进入当前年级无课程时 -->
          <div
            v-else-if="!showAddSubject"
            class="py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2"
          >
            <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <BookOpen class="w-5 h-5" />
            </div>
            <p class="text-xs font-bold text-slate-700">
              {{ searchQuery ? '未搜索到匹配的课程科目' : '当前年级暂无预设课程' }}
            </p>
            <p class="text-[11px] text-slate-400">
              {{ searchQuery ? '可清除搜索关键词或点击添加' : '请点击右上角「+ 添加新课程」添加课程信息，或使用 AI 识图导入' }}
            </p>
            <button
              type="button"
              class="mt-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
              @click="showAddSubject = true"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>立即添加课程</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 弹窗底栏 -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/80">
        <button
          type="button"
          class="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 cursor-pointer"
          @click="handleSetEmpty"
        >
          设为空课
        </button>

        <div class="flex items-center gap-2">
          <!-- 变动对比提示（仅当选中不同课程时提示） -->
          <div
            v-if="selectedSubjectId !== initialSubjectId"
            class="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg shadow-2xs"
          >
            <span class="opacity-70">原「{{ initialSubjectName }}」</span>
            <span class="text-amber-700 font-black">➔</span>
            <span>拟改「{{ currentSelectedName }}」</span>
          </div>

          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
            @click="emit('close')"
          >
            取消
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition"
            :class="selectedSubjectId !== initialSubjectId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'"
            @click="handleConfirm"
          >
            <Check class="w-4 h-4" />
            <span>{{ selectedSubjectId !== initialSubjectId ? '确认变更排课' : '确定排入课表' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

