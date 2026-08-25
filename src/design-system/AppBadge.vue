<script setup lang="ts">
import { computed } from 'vue';

export interface AppBadgeProps {
  variant?:
    | 'neutral'
    | 'brand'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'learning'
    | 'growth'
    | 'challenge';
  size?: 'sm' | 'md';
  shape?: 'pill' | 'square';
  dot?: boolean;
}

const props = withDefaults(defineProps<AppBadgeProps>(), {
  variant: 'neutral',
  size: 'md',
  shape: 'pill',
  dot: false
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'brand':
      return 'bg-brand-soft text-brand-strong border-transparent';
    case 'success':
      return 'bg-success-soft text-success border-transparent';
    case 'warning':
      return 'bg-warning-soft text-warning border-transparent';
    case 'danger':
      return 'bg-danger-soft text-danger border-transparent';
    case 'info':
      return 'bg-info-soft text-info border-transparent';
    case 'learning':
      return 'bg-info-soft text-learning border-transparent';
    case 'growth':
      return 'bg-success-soft text-growth border-transparent';
    case 'challenge':
      return 'bg-purple-100 text-challenge border-transparent';
    case 'neutral':
    default:
      return 'bg-surface-sunken text-text-secondary border-border';
  }
});

const sizeClasses = computed(() => {
  if (props.dot) {
    return props.size === 'sm' ? 'w-2 h-2 p-0' : 'w-2.5 h-2.5 p-0';
  }
  return props.size === 'sm'
    ? 'px-2 py-0.5 text-[11px] leading-tight font-bold'
    : 'px-2.5 py-1 text-caption font-bold';
});

const shapeClasses = computed(() => {
  return props.shape === 'square' ? 'rounded-sm' : 'rounded-full';
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center justify-center gap-1 border shrink-0 select-none',
      variantClasses,
      sizeClasses,
      shapeClasses
    ]"
  >
    <slot v-if="!dot" name="icon" />
    <slot v-if="!dot" />
  </span>
</template>

