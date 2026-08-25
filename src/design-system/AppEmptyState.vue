<script setup lang="ts">
import { computed } from 'vue';
import { HelpCircle, Lock, AlertCircle, Sparkles } from 'lucide-vue-next';

export interface AppEmptyStateProps {
  variant?: 'empty' | 'locked' | 'error' | 'first-time';
  title: string;
  description?: string;
  illustration?: 'none' | 'mascot' | 'board' | 'chart';
}

const props = withDefaults(defineProps<AppEmptyStateProps>(), {
  variant: 'empty',
  illustration: 'none'
});

const defaultIcon = computed(() => {
  switch (props.variant) {
    case 'locked':
      return Lock;
    case 'error':
      return AlertCircle;
    case 'first-time':
      return Sparkles;
    case 'empty':
    default:
      return HelpCircle;
  }
});

const toneColorClass = computed(() => {
  switch (props.variant) {
    case 'locked':
      return 'text-warning bg-warning-soft border-warning/30';
    case 'error':
      return 'text-danger bg-danger-soft border-danger/30';
    case 'first-time':
      return 'text-brand-strong bg-brand-soft border-brand/30';
    case 'empty':
    default:
      return 'text-text-muted bg-surface-sunken border-border';
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center p-6 md:p-10 text-center select-none w-full">
    <!-- Icon or custom illustration slot -->
    <div class="mb-4">
      <slot name="illustration">
        <div
          :class="[
            'w-16 h-16 rounded-full flex items-center justify-center border text-2xl shadow-xs',
            toneColorClass
          ]"
        >
          <component :is="defaultIcon" class="w-8 h-8" />
        </div>
      </slot>
    </div>

    <!-- Title & Description -->
    <h4 class="text-title text-text font-bold mb-1">
      {{ title }}
    </h4>
    <p v-if="description" class="text-body text-text-secondary max-w-md leading-relaxed mb-5">
      {{ description }}
    </p>

    <!-- Default Content Slot -->
    <slot />

    <!-- Action Slot (AppButton) -->
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>

