<script setup lang="ts">
import { computed } from 'vue';

export interface AppCardProps {
  variant?: 'plain' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accent?: 'none' | 'learning' | 'growth' | 'challenge';
  interactive?: boolean;
  as?: 'div' | 'article' | 'section';
}

const props = withDefaults(defineProps<AppCardProps>(), {
  variant: 'outlined',
  padding: 'md',
  accent: 'none',
  interactive: false,
  as: 'div'
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'plain':
      return 'bg-surface';
    case 'elevated':
      return 'bg-surface shadow-e1 border border-border/60';
    case 'outlined':
    default:
      return 'bg-surface border border-border shadow-e0';
  }
});

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-3';
    case 'lg':
      return 'p-5 md:p-8';
    case 'md':
    default:
      return 'p-4 md:p-6';
  }
});

const accentClasses = computed(() => {
  switch (props.accent) {
    case 'learning':
      return 'border-l-4 border-l-learning';
    case 'growth':
      return 'border-l-4 border-l-growth';
    case 'challenge':
      return 'border-l-4 border-l-challenge';
    case 'none':
    default:
      return '';
  }
});

const interactiveClasses = computed(() => {
  if (!props.interactive) return '';
  return 'cursor-pointer hover:shadow-e2 hover:border-brand/40 active:scale-[0.985] transition-all duration-normal select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand';
});

const handleClick = (event: MouseEvent) => {
  if (props.interactive) {
    emit('click', event);
  }
};
</script>

<template>
  <component
    :is="as"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    :class="[
      'rounded-lg relative overflow-hidden',
      variantClasses,
      paddingClasses,
      accentClasses,
      interactiveClasses
    ]"
    @click="handleClick"
    @keydown.enter.space="interactive && handleClick($event as any)"
  >
    <div v-if="$slots.media" class="mb-4 -mx-4 -mt-4 md:-mx-6 md:-mt-6">
      <slot name="media" />
    </div>

    <div v-if="$slots.header" class="mb-3">
      <slot name="header" />
    </div>

    <slot />

    <div v-if="$slots.footer" class="mt-4 pt-3 border-t border-border/80">
      <slot name="footer" />
    </div>
  </component>
</template>

