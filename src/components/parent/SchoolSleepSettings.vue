<script setup lang="ts">
import { computed } from 'vue';
import { AppCard, AppSelect, AppSection } from '../../design-system';
import { useSchoolStore } from '../../stores/useSchoolStore';
import { BEDTIME_OPTIONS, computeSleepBudget, formatBedtimeLabel } from '../../domain/school';

const schoolStore = useSchoolStore();

const budget = computed(() => computeSleepBudget(schoolStore.layer.bedtimeMinutes));
const bedtimeOptions = BEDTIME_OPTIONS.map((item) => ({ value: item.value, label: item.label }));

const onChange = (value: string | number) => {
  schoolStore.setBedtimeMinutes(Number(value));
};
</script>

<template>
  <AppSection title="就寝时间（睡眠优先）" icon="clock" tone="challenge">
    <AppCard variant="outlined" padding="lg" class="bg-white space-y-3">
      <p class="text-sm text-slate-600">
        作业和睡觉冲突时，先睡觉。超过就寝时间后，当日预习/复习会自动收起，不催着补完。
      </p>
      <label class="space-y-1 text-xs font-bold text-slate-600 block max-w-xs">
        今晚就寝
        <AppSelect
          :model-value="schoolStore.layer.bedtimeMinutes"
          :options="bedtimeOptions"
          size="sm"
          aria-label="就寝时间"
          @update:model-value="onChange"
        />
      </label>
      <p class="text-xs text-slate-500">
        当前设定 {{ formatBedtimeLabel(schoolStore.layer.bedtimeMinutes) }}
        ·
        {{ budget.pastBedtime ? '已过就寝，学校任务已让路' : `距就寝约 ${budget.remainingMinutes} 分钟` }}
      </p>
    </AppCard>
  </AppSection>
</template>
