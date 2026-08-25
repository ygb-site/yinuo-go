<script setup lang="ts">
import { computed } from 'vue';

export interface AppSkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'avatar' | 'board' | 'chart';
  lines?: number;
  width?: string;
  height?: string;
}

const props = withDefaults(defineProps<AppSkeletonProps>(), {
  variant: 'text',
  lines: 1
});

const customStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width) style.width = props.width;
  if (props.height) style.height = props.height;
  return style;
});
</script>

<template>
  <!-- Text lines variant -->
  <div v-if="variant === 'text'" class="space-y-2 w-full">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton-shimmer h-4 rounded-sm"
      :class="i === lines && lines > 1 ? 'w-3/4' : 'w-full'"
      :style="customStyle"
    />
  </div>

  <!-- Title variant -->
  <div
    v-else-if="variant === 'title'"
    class="skeleton-shimmer h-6 w-1/2 rounded-md"
    :style="customStyle"
  />

  <!-- Avatar variant -->
  <div
    v-else-if="variant === 'avatar'"
    class="skeleton-shimmer w-10 h-10 rounded-full shrink-0"
    :style="customStyle"
  />

  <!-- Card variant -->
  <div
    v-else-if="variant === 'card'"
    class="skeleton-shimmer h-32 w-full rounded-lg border border-border/40"
    :style="customStyle"
  />

  <!-- Board / Square variant -->
  <div
    v-else-if="variant === 'board'"
    class="skeleton-shimmer aspect-square w-full max-w-sm rounded-xl border border-border/40"
    :style="customStyle"
  />

  <!-- Chart variant -->
  <div
    v-else-if="variant === 'chart'"
    class="skeleton-shimmer h-48 w-full rounded-lg border border-border/40"
    :style="customStyle"
  />
</template>

