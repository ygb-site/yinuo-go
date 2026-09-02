<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppSelect,
  AppSection
} from '../../design-system';
import { useSchoolStore } from '../../stores/useSchoolStore';
import { useUserStore } from '../../stores/useUserStore';
import { TEXTBOOK_SUBJECT_LABEL, type TextbookSubjectId } from '../../domain/school';
import { lessonOptions } from '../../data/school/textbookCatalog';
import { resolveGradeLevel } from '../../domain/growth/tracks';
import SchoolChildTaskCard from '../school/SchoolChildTaskCard.vue';

const schoolStore = useSchoolStore();
const userStore = useUserStore();

const subjectId = ref<TextbookSubjectId>('chinese');
const parentNote = ref('');
const linkedLessonId = ref('');
const estimatedMinutes = ref(15);

const gradeLevel = computed(() => resolveGradeLevel(userStore.currentProfile.gradeLevel));

const subjectOptions = [
  { value: 'chinese', label: TEXTBOOK_SUBJECT_LABEL.chinese },
  { value: 'math', label: TEXTBOOK_SUBJECT_LABEL.math }
];

const minuteOptions = [
  { value: 10, label: '约 10 分钟' },
  { value: 15, label: '约 15 分钟' },
  { value: 20, label: '约 20 分钟' }
];

const linkedLessonOptions = computed(() => [
  { value: '', label: '不指定课时' },
  ...lessonOptions(gradeLevel.value, subjectId.value)
]);

const canSubmit = computed(() => parentNote.value.trim().length > 0);

const onSubjectChange = (value: string) => {
  subjectId.value = value as TextbookSubjectId;
  linkedLessonId.value = '';
};

const addItem = () => {
  if (!canSubmit.value) return;
  schoolStore.addHomework({
    subjectId: subjectId.value,
    parentNote: parentNote.value,
    linkedLessonId: linkedLessonId.value || undefined,
    estimatedMinutes: estimatedMinutes.value
  });
  parentNote.value = '';
  linkedLessonId.value = '';
};

const removeItem = (id: string) => {
  schoolStore.removeHomework(id);
};
</script>

<template>
  <AppSection title="今日校内作业" icon="clipboard-list" tone="learning">
    <div class="space-y-4">
      <AppCard variant="outlined" padding="lg" class="bg-white space-y-3">
        <p class="text-sm text-slate-600">
          记下人大附小京西校区今天真正留的作业。没有录入时儿童侧显示「尚未开始」，不会编造进度。
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="space-y-1 text-xs font-bold text-slate-600">
            科目
            <AppSelect
              :model-value="subjectId"
              :options="subjectOptions"
              size="sm"
              aria-label="作业科目"
              @update:model-value="onSubjectChange"
            />
          </label>
          <label class="space-y-1 text-xs font-bold text-slate-600">
            预计耗时
            <AppSelect
              :model-value="estimatedMinutes"
              :options="minuteOptions"
              size="sm"
              aria-label="预计耗时"
              @update:model-value="estimatedMinutes = Number($event)"
            />
          </label>
          <label class="space-y-1 text-xs font-bold text-slate-600 sm:col-span-2">
            对应课时（可选）
            <AppSelect
              :model-value="linkedLessonId"
              :options="linkedLessonOptions"
              size="sm"
              aria-label="对应课时"
              @update:model-value="linkedLessonId = String($event)"
            />
          </label>
        </div>
        <label class="space-y-1 text-xs font-bold text-slate-600 block">
          老师今天留了什么
          <textarea
            v-model="parentNote"
            rows="3"
            maxlength="200"
            class="w-full mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
            placeholder="例如：语文读《秋天》，生字各写两遍。"
          />
        </label>
        <AppButton :disabled="!canSubmit" size="sm" @click="addItem">记下作业</AppButton>
      </AppCard>

      <AppEmptyState
        v-if="schoolStore.todayHomework.length === 0"
        variant="empty"
        title="尚未开始"
        description="今天还没有录入校内作业。有作业再记，没有就不编。"
      />

      <div v-else class="space-y-2">
        <AppCard
          v-for="item in schoolStore.todayHomework"
          :key="item.id"
          variant="outlined"
          padding="md"
          class="bg-white"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-bold text-slate-900">
                {{ TEXTBOOK_SUBJECT_LABEL[item.subjectId] }} · {{ item.estimatedMinutes }} 分钟
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ item.parentNote }}</p>
            </div>
            <AppButton variant="ghost" size="sm" @click="removeItem(item.id)">删除</AppButton>
          </div>
        </AppCard>
      </div>

      <div v-if="schoolStore.childTasks.length > 0" class="space-y-2">
        <h4 class="text-xs font-bold text-slate-500">儿童将看到（不含双轨差异）</h4>
        <SchoolChildTaskCard
          v-for="task in schoolStore.childTasks"
          :key="task.id"
          :task="task"
          :done="task.status === 'done'"
        />
        <p
          v-for="task in schoolStore.generatedTasks.filter((item) => item.parent.dualTrackHint || item.parent.abilityBridge || item.parent.sleepNote)"
          :key="'p-' + task.id"
          class="text-xs text-slate-500"
        >
          家长备注 · {{ TEXTBOOK_SUBJECT_LABEL[task.subjectId] }}：
          {{ task.parent.sleepNote || task.parent.dualTrackHint || task.parent.abilityBridge }}
        </p>
      </div>
    </div>
  </AppSection>
</template>
