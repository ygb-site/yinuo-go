<script setup lang="ts">
import { AppCard, AppBadge } from '../../design-system';
import type { DailyStudyTask } from '../../domain/school';

const props = defineProps<{
  task: DailyStudyTask;
  interactive?: boolean;
  done?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<template>
  <AppCard
    variant="outlined"
    padding="md"
    :interactive="Boolean(interactive)"
    :class="done ? 'border-emerald-300 bg-emerald-50' : ''"
    @click="interactive ? emit('toggle') : undefined"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-sm font-bold text-slate-900">
          {{ done ? '✓' : '○' }} {{ task.child.verbTitle }}
        </div>
        <p class="text-xs text-slate-500 mt-1">{{ task.child.shortHint }}</p>
      </div>
      <AppBadge variant="neutral" size="sm">{{ task.estimatedMinutes }} 分钟</AppBadge>
    </div>
  </AppCard>
</template>
