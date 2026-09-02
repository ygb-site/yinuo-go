<script setup lang="ts">
import { computed } from 'vue';
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppSelect,
  AppSection,
  AppBadge
} from '../../design-system';
import { useSchoolStore } from '../../stores/useSchoolStore';
import { useUserStore } from '../../stores/useUserStore';
import { resolveGradeLevel } from '../../domain/growth/tracks';
import { chapterOptions, lessonsInChapter } from '../../data/school/textbookCatalog';

const schoolStore = useSchoolStore();
const userStore = useUserStore();

const gradeLevel = computed(() => resolveGradeLevel(userStore.currentProfile.gradeLevel));
const chapters = computed(() => [{ value: '', label: '尚未开始' }, ...chapterOptions(gradeLevel.value)]);

const schoolLessons = computed(() => {
  const id = schoolStore.layer.schoolTrack.activeChapterId;
  return id ? lessonsInChapter(id) : [];
});

const hometownLessons = computed(() => {
  const id = schoolStore.layer.hometownTrack.activeChapterId;
  return id ? lessonsInChapter(id) : [];
});

const onSchoolChapter = (value: string) => {
  schoolStore.setActiveChapter('school', value || null);
};

const onHometownChapter = (value: string) => {
  schoolStore.setActiveChapter('hometown', value || null);
};
</script>

<template>
  <AppSection title="两地教材进度（只给家长看）" icon="book-open" tone="growth">
    <div class="space-y-4">
      <AppCard variant="outlined" padding="lg" class="bg-white space-y-3">
        <p class="text-sm text-slate-600">
          北京记京西校区统编课时，衡水记同年级对应进度。一年级只做差异标记，不给孩子加第二套作业。
        </p>
        <div v-if="schoolStore.dualTrack.gradeOneRecordOnly" class="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          当前一年级：只记录差异，不增压。回老家窗口到达后再给补充学习建议。
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-slate-900">北京本校</h4>
              <AppBadge v-if="!schoolStore.dualTrack.schoolStarted" variant="neutral" size="sm">尚未开始</AppBadge>
            </div>
            <AppSelect
              :model-value="schoolStore.layer.schoolTrack.activeChapterId || ''"
              :options="chapters"
              size="sm"
              aria-label="北京当前单元"
              @update:model-value="onSchoolChapter"
            />
            <ul v-if="schoolLessons.length > 0" class="space-y-1">
              <li v-for="lesson in schoolLessons" :key="lesson.id" class="flex items-center justify-between gap-2 text-xs">
                <span class="text-slate-700">{{ lesson.title }}</span>
                <AppButton
                  v-if="!schoolStore.layer.schoolTrack.completedLessonIds.includes(lesson.id)"
                  variant="ghost"
                  size="sm"
                  @click="schoolStore.markLessonComplete('school', lesson.id)"
                >
                  记下已学
                </AppButton>
                <span v-else class="text-emerald-700 font-bold">已学</span>
              </li>
            </ul>
            <p v-else class="text-xs text-slate-400">{{ schoolStore.emptyLabel }}</p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-slate-900">衡水对照</h4>
              <AppBadge v-if="!schoolStore.dualTrack.hometownStarted" variant="neutral" size="sm">尚未开始</AppBadge>
            </div>
            <AppSelect
              :model-value="schoolStore.layer.hometownTrack.activeChapterId || ''"
              :options="chapters"
              size="sm"
              aria-label="衡水当前单元"
              @update:model-value="onHometownChapter"
            />
            <ul v-if="hometownLessons.length > 0" class="space-y-1">
              <li v-for="lesson in hometownLessons" :key="'h-' + lesson.id" class="flex items-center justify-between gap-2 text-xs">
                <span class="text-slate-700">{{ lesson.title }}</span>
                <AppButton
                  v-if="!schoolStore.layer.hometownTrack.completedLessonIds.includes(lesson.id)"
                  variant="ghost"
                  size="sm"
                  @click="schoolStore.markLessonComplete('hometown', lesson.id)"
                >
                  记下进度
                </AppButton>
                <span v-else class="text-emerald-700 font-bold">已记</span>
              </li>
            </ul>
            <p v-else class="text-xs text-slate-400">{{ schoolStore.emptyLabel }}</p>
          </div>
        </div>
      </AppCard>

      <AppCard variant="outlined" padding="lg" class="bg-white space-y-2">
        <h4 class="text-sm font-bold text-slate-900">知识点差异</h4>
        <AppEmptyState
          v-if="schoolStore.dualTrack.diffs.length === 0"
          variant="empty"
          title="尚未开始"
          description="有课时目录差异时会出现在这里，不会编造对比分数。"
        />
        <ul v-else class="space-y-2">
          <li
            v-for="diff in schoolStore.dualTrack.diffs.slice(0, 8)"
            :key="diff.lessonId"
            class="text-xs text-slate-600 border border-slate-100 rounded-xl px-3 py-2"
          >
            <span class="font-bold text-slate-800">{{ diff.beijingTitle }}</span>
            <span class="text-slate-400"> · </span>
            {{ diff.note || '两地同一课，节奏可能不同。' }}
          </li>
        </ul>
      </AppCard>

      <AppCard v-if="schoolStore.dualTrack.supplementEnabled" variant="outlined" padding="lg" class="bg-amber-50/60 border-amber-100 space-y-2">
        <h4 class="text-sm font-bold text-slate-900">回老家窗口已到 · 补充建议</h4>
        <p
          v-for="line in schoolStore.dualTrack.supplementSuggestions"
          :key="line"
          class="text-sm text-slate-700"
        >
          {{ line }}
        </p>
        <p v-if="schoolStore.dualTrack.supplementSuggestions.length === 0" class="text-sm text-slate-500">
          尚未开始。先记下两边当前单元，再看要对齐什么。
        </p>
      </AppCard>
    </div>
  </AppSection>
</template>
