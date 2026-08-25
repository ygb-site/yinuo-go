<script setup lang="ts">
import { computed } from 'vue';

export interface AppProgressProps {
  value: number;
  variant?: 'linear' | 'ring' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'learning' | 'growth' | 'challenge';
  segments?: number;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
}

const props = withDefaults(defineProps<AppProgressProps>(), {
  variant: 'linear',
  size: 'md',
  tone: 'brand',
  segments: 3,
  showValue: false,
  animated: true
});

const clampedValue = computed(() => {
  return Math.min(100, Math.max(0, Math.round(props.value || 0)));
});

const toneBarColor = computed(() => {
  switch (props.tone) {
    case 'learning':
      return 'bg-learning';
    case 'growth':
      return 'bg-growth';
    case 'challenge':
      return 'bg-challenge';
    case 'brand':
    default:
      return 'bg-brand';
  }
});

const toneStrokeColor = computed(() => {
  switch (props.tone) {
    case 'learning':
      return 'var(--color-learning)';
    case 'growth':
      return 'var(--color-growth)';
    case 'challenge':
      return 'var(--color-challenge)';
    case 'brand':
    default:
      return 'var(--color-brand)';
  }
});

const heightClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-1.5';
    case 'lg':
      return 'h-3.5';
    case 'md':
    default:
      return 'h-2.5';
  }
});

const ringDimensions = computed(() => {
  switch (props.size) {
    case 'sm':
      return { size: 36, stroke: 3, r: 15 };
    case 'lg':
      return { size: 64, stroke: 6, r: 26 };
    case 'md':
    default:
      return { size: 48, stroke: 4, r: 20 };
  }
});

const ringCircumference = computed(() => {
  return 2 * Math.PI * ringDimensions.value.r;
});

const ringDashOffset = computed(() => {
  const progress = clampedValue.value / 100;
  return ringCircumference.value * (1 - progress);
});
</script>

<template>
  <div
    class="w-full select-none"
    role="progressbar"
    :aria-valuenow="clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
  >
    <!-- Top label / value display if present -->
    <div v-if="label || showValue || $slots.label" class="flex items-center justify-between text-caption mb-1">
      <div class="text-text-secondary font-medium">
        <slot name="label">{{ label }}</slot>
      </div>
      <div v-if="showValue" class="text-text font-bold">
        {{ clampedValue }}%
      </div>
    </div>

    <!-- 1. Linear Progress -->
    <div
      v-if="variant === 'linear'"
      :class="['w-full bg-surface-sunken rounded-full overflow-hidden border border-border/40', heightClass]"
    >
      <div
        :class="[
          'h-full rounded-full',
          toneBarColor,
          animated ? 'transition-all duration-emphasis ease-emphasis' : ''
        ]"
        :style="{ width: clampedValue + '%' }"
      />
    </div>

    <!-- 2. Segmented Progress -->
    <div
      v-else-if="variant === 'segmented'"
      class="flex items-center gap-1.5 w-full"
    >
      <div
        v-for="i in segments"
        :key="i"
        :class="[
          'flex-1 rounded-full border border-border/40',
          heightClass,
          (clampedValue >= (i / segments) * 100)
            ? toneBarColor
            : 'bg-surface-sunken',
          animated ? 'transition-all duration-normal' : ''
        ]"
      />
    </div>

    <!-- 3. Ring Progress -->
    <div
      v-else-if="variant === 'ring'"
      class="inline-flex items-center justify-center relative"
      :style="{ width: ringDimensions.size + 'px', height: ringDimensions.size + 'px' }"
    >
      <svg
        :width="ringDimensions.size"
        :height="ringDimensions.size"
        class="transform -rotate-90"
      >
        <circle
          :cx="ringDimensions.size / 2"
          :cy="ringDimensions.size / 2"
          :r="ringDimensions.r"
          fill="none"
          stroke="var(--color-surface-sunken)"
          :stroke-width="ringDimensions.stroke"
        />
        <circle
          :cx="ringDimensions.size / 2"
          :cy="ringDimensions.size / 2"
          :r="ringDimensions.r"
          fill="none"
          :stroke="toneStrokeColor"
          :stroke-width="ringDimensions.stroke"
          stroke-linecap="round"
          :stroke-dasharray="ringCircumference"
          :stroke-dashoffset="ringDashOffset"
          :class="animated ? 'transition-all duration-emphasis ease-emphasis' : ''"
        />
      </svg>
      <div v-if="showValue" class="absolute inset-0 flex items-center justify-center text-caption font-bold text-text">
        {{ clampedValue }}%
      </div>
    </div>
  </div>
</template>

