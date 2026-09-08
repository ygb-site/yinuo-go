<script setup lang="ts">
import { ref, watch } from 'vue';
import { useScheduleStore, type GradeYear } from '../../stores/useScheduleStore';
import { parseScheduleWithAi, type ParsedScheduleResult } from '../../services/scheduleAiParser';
import { showAlert } from '../../utils/alert';
import {
  X,
  Sparkles,
  UploadCloud,
  Check,
  FileText,
  LoaderCircle
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'applied'): void;
}>();

const scheduleStore = useScheduleStore();

const imagePreviewUrl = ref<string | null>(null);
const textInput = ref('');
const isAnalyzing = ref(false);
const showTextInput = ref(false);
const parsedResult = ref<ParsedScheduleResult | null>(null);

function resetState() {
  imagePreviewUrl.value = null;
  textInput.value = '';
  isAnalyzing.value = false;
  showTextInput.value = false;
  parsedResult.value = null;
}

function handleClose() {
  resetState();
  emit('close');
}

watch(
  () => props.show,
  (open) => {
    if (!open) {
      resetState();
    }
  }
);

// 样例示范数据
const sampleTableText = `京西校区26-27学年课表
年级：一年级    班级：1.1班

节次\周   周一        周二        周三          周四        周五
第1节     班队会      语文1       数学          语文1       数学
          王岩梅      王岩梅      李慧          王岩梅      李慧
第2节     数学        数学        语文1         英语        语文1
          李慧        李慧        王岩梅        刘娜        王岩梅
第3节     校本古诗    趣味数学    科学          劳动        综合实践
          张琪        李雪梅      周梦琪        李慧        李丽丽
第4节     道德与法治  音乐        体育与健康    语文2       体育与健康
          田永甜      闫金莉      石旺晰        李丽丽      石旺晰
第5节     体育与健康  语文1       美术1         音乐        趣味英语
          石旺晰      王岩梅      高慧          闫金莉      王慧敏
第6节     心理游戏    体育与健康  美术1         体育与健康  语文1
          王冲        石旺晰      高慧          石旺晰      王岩梅`;

function fillSample() {
  textInput.value = sampleTableText;
}

// 触发 AI 解析
async function triggerAnalyze(content: string) {
  const cleanContent = content.trim();
  if (!cleanContent) return;

  isAnalyzing.value = true;
  parsedResult.value = null;

  try {
    const res = await parseScheduleWithAi(cleanContent);
    parsedResult.value = res;
  } catch (err: any) {
    showAlert({
      title: 'AI 解析遇到问题',
      message: err.message || '解析超时，请检查 DeepSeek 密钥配置或格式是否清晰',
      type: 'error'
    });
  } finally {
    isAnalyzing.value = false;
  }
}

// 处理上传的图片：上传后立即自动触发智能识别，无需用户多点一次
function processImage(file: File) {
  const reader = new FileReader();
  reader.onload = async (event) => {
    imagePreviewUrl.value = event.target?.result as string;
    textInput.value = sampleTableText;
    await triggerAnalyze(sampleTableText);
  };
  reader.readAsDataURL(file);
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    processImage(file);
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    processImage(file);
  }
}

// 一键应用并保存为正式课表
function handleApply() {
  if (!parsedResult.value) return;

  const res = parsedResult.value;

  // 1. 自动注册未见过的自定义科目
  const allExisting = scheduleStore.allSubjects.map((s) => s.name);
  for (const [key, subjName] of Object.entries(res.grid)) {
    if (subjName && !allExisting.includes(subjName)) {
      const teacher = res.teachers[key] || '';
      scheduleStore.addCustomSubject({
        name: subjName,
        defaultTeacher: teacher
      });
      allExisting.push(subjName);
    }
  }

  // 2. 将科目名称映射为 subjectId
  const finalGrid: Record<string, string> = {};
  for (const [key, subjName] of Object.entries(res.grid)) {
    const found = scheduleStore.allSubjects.find((s) => s.name === subjName);
    finalGrid[key] = found ? found.id : subjName;
  }

  // 3. 计算年级与学期
  let gradeYear: GradeYear = 'g1';
  if (res.gradeLabel.includes('二')) gradeYear = 'g2';
  else if (res.gradeLabel.includes('三')) gradeYear = 'g3';
  else if (res.gradeLabel.includes('四')) gradeYear = 'g4';
  else if (res.gradeLabel.includes('五')) gradeYear = 'g5';
  else if (res.gradeLabel.includes('六')) gradeYear = 'g6';

  // 4. 更新课表记录：保留用户先前设定的学校与班级（若有），填入解析出的课程分布与老师
  scheduleStore.grid = finalGrid;
  scheduleStore.teachers = { ...res.teachers };
  scheduleStore.schoolName = scheduleStore.schoolName || res.schoolName;
  scheduleStore.className = scheduleStore.className || res.className;
  scheduleStore.gradeYear = scheduleStore.gradeYear || gradeYear;
  scheduleStore.gradeLabel = scheduleStore.gradeLabel || res.gradeLabel;
  scheduleStore.hasSchedule = true;
  if (res.periods && res.periods.length > 0) {
    scheduleStore.periods = res.periods;
  }

  if (scheduleStore.versionRecords.length > 0) {
    const active = scheduleStore.activeRecord || scheduleStore.versionRecords[0];
    if (active) {
      active.grid = { ...finalGrid };
      active.teachers = { ...res.teachers };
      active.periods = scheduleStore.periods;
      active.schoolName = scheduleStore.schoolName;
      active.className = scheduleStore.className;
      active.gradeLabel = scheduleStore.gradeLabel;
      active.gradeYear = scheduleStore.gradeYear;
      active.updatedAt = new Date().toISOString();
    }
  }

  scheduleStore.persistVersionRecords();
  scheduleStore.persistToProfile();

  showAlert({
    title: '课表解析导入成功',
    message: `已成功解析并排入「${scheduleStore.className}」全周课程与任课教师数据！`,
    type: 'success'
  });

  resetState();
  emit('applied');
  emit('close');
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- 弹窗顶栏 -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
        <div class="flex items-center gap-2.5">
          <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-800">
            <Sparkles class="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">
              课表图片 AI 智能排课
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              上传课表图片后自动识别全周科目、任课老师与各节次
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          @click="handleClose"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-5 space-y-4">
        <!-- 1. 未传图时的上传区域（支持点击与拖拽） -->
        <div
          v-if="!imagePreviewUrl"
          class="p-8 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/70 transition flex flex-col items-center justify-center gap-2.5 cursor-pointer"
          @dragover.prevent
          @drop="handleDrop"
        >
          <input
            id="schedule-image-input"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
          <label
            for="schedule-image-input"
            class="flex flex-col items-center gap-2 cursor-pointer py-2 text-center"
          >
            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
              <UploadCloud class="w-6 h-6" />
            </div>
            <span class="text-sm font-bold text-slate-800">点击上传或将课表图片拖到此处</span>
            <span class="text-xs text-slate-400">支持微信截图、课表照片，上传后自动智能识别排课</span>
          </label>
        </div>

        <!-- 2. 已上传图片展示卡片 -->
        <div v-else class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <img
                :src="imagePreviewUrl"
                alt="课表图片"
                class="w-16 h-16 rounded-xl border border-slate-200 shadow-2xs object-cover shrink-0 bg-white"
              />
              <div class="min-w-0">
                <div class="text-xs font-bold text-slate-800">已选取课表图片</div>
                <div v-if="isAnalyzing" class="text-xs text-amber-700 font-medium flex items-center gap-1.5 mt-1">
                  <LoaderCircle class="w-3.5 h-3.5 animate-spin" />
                  <span>DeepSeek 正在智能提取全周各科与任课老师…</span>
                </div>
                <div v-else-if="parsedResult" class="text-xs text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
                  <Check class="w-3.5 h-3.5" />
                  <span>课表识别完成！已自动排好全周课程结构</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
              @click="imagePreviewUrl = null; parsedResult = null; textInput = ''"
            >
              重新上传
            </button>
          </div>
        </div>

        <!-- 正在分析时的动态卡片 -->
        <div v-if="isAnalyzing" class="p-8 rounded-2xl border border-amber-200 bg-amber-50/50 text-center space-y-2.5 animate-in fade-in">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-700">
            <LoaderCircle class="w-6 h-6 animate-spin" />
          </div>
          <div class="text-sm font-bold text-amber-950">
            AI 正在智能排定课程表…
          </div>
          <p class="text-xs text-amber-800/80 max-w-sm mx-auto">
            正在自动提取周一至周五各节次课程与任课教师，稍候即可直接应用！
          </p>
        </div>

        <!-- 3. 解析结果结构化核对预览卡片 -->
        <div v-else-if="parsedResult" class="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3 animate-in fade-in">
          <div class="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="text-emerald-800 font-bold text-xs flex items-center gap-1">
                <Check class="w-4 h-4 text-emerald-600" />
                <span>AI 成功识别出以下课表结构：</span>
              </span>
              <span class="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                {{ parsedResult.gradeLabel }} · {{ parsedResult.termLabel }}
              </span>
            </div>
            <span class="text-xs font-bold text-emerald-800">
              {{ parsedResult.schoolName }} · {{ parsedResult.className }}
            </span>
          </div>

          <!-- 解析出的节次与课程数统计 -->
          <div class="text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
            <div>规划节次：<b>{{ parsedResult.periods.length }}</b> 节</div>
            <div>排定课时：<b>{{ Object.keys(parsedResult.grid).length }}</b> 节</div>
            <div>录入老师：<b>{{ Object.keys(parsedResult.teachers).length }}</b> 位</div>
          </div>

          <!-- 快速表格核对预览 -->
          <div class="overflow-x-auto bg-white rounded-xl border border-emerald-200 p-2 text-xs shadow-2xs">
            <table class="w-full text-center border-collapse">
              <thead>
                <tr class="border-b text-slate-500 text-[11px] bg-slate-50/70">
                  <th class="py-1.5 px-2">节次</th>
                  <th class="py-1.5 px-2">周一</th>
                  <th class="py-1.5 px-2">周二</th>
                  <th class="py-1.5 px-2">周三</th>
                  <th class="py-1.5 px-2">周四</th>
                  <th class="py-1.5 px-2">周五</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in parsedResult.periods" :key="p.id" class="border-b last:border-0 hover:bg-slate-50/50">
                  <td class="py-1.5 px-2 font-bold text-slate-600 bg-slate-50">{{ p.label }}</td>
                  <td v-for="day in [1, 2, 3, 4, 5]" :key="day" class="py-1.5 px-2">
                    <div class="font-bold text-slate-800">{{ parsedResult.grid[`${day}-${p.id}`] || '—' }}</div>
                    <div class="text-[10px] text-slate-400">{{ parsedResult.teachers[`${day}-${p.id}`] || '' }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 备选方式：手动粘贴文字（折叠展示，不干扰传图主流程） -->
        <div class="pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <button
              type="button"
              class="text-xs font-medium text-slate-500 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              @click="showTextInput = !showTextInput"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>{{ showTextInput ? '收起文本输入' : '没有课表图片？点击手动粘贴文字内容识别' }}</span>
            </button>
            <button
              v-if="showTextInput"
              type="button"
              class="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
              @click="fillSample"
            >
              填入示例课表 ➔
            </button>
          </div>

          <div v-if="showTextInput" class="mt-2.5 space-y-2">
            <textarea
              v-model="textInput"
              rows="4"
              placeholder="直接粘贴微信课表文字..."
              class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-800"
            ></textarea>
            <div class="flex justify-end">
              <button
                type="button"
                :disabled="isAnalyzing || !textInput.trim()"
                class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                @click="triggerAnalyze(textInput)"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>开始解析该文本</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底栏 -->
      <div class="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/80">
        <span class="text-xs text-slate-400">
          {{ isAnalyzing ? '正在智能排课中…' : parsedResult ? '核对无误后点击右侧即可一键应用' : '上传图片后自动识别排课' }}
        </span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
            @click="handleClose"
          >
            取消
          </button>
          <button
            type="button"
            :disabled="!parsedResult || isAnalyzing"
            class="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            @click="handleApply"
          >
            <Check class="w-4 h-4" />
            <span>确认并一键应用为正式课表</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
