<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

export interface AppButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brandSoft';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
  ariaLabel?: string;
  as?: 'button' | 'a' | 'router-link';
  to?: string;
  type?: 'button' | 'submit';
}

const props = withDefaults(defineProps<AppButtonProps>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  loading: false,
  disabled: false,
  iconOnly: false,
  as: 'button',
  type: 'button'
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
};

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-brand-strong text-text-on-brand hover:brightness-105 active:brightness-95 shadow-sm border border-transparent';
    case 'secondary':
      return 'bg-surface text-text hover:bg-surface-sunken border border-border shadow-xs';
    case 'brandSoft':
      return 'bg-brand-soft text-brand-strong hover:brightness-95 border border-transparent font-bold';
    case 'danger':
      return 'bg-danger text-text-on-brand hover:brightness-105 active:brightness-95 shadow-sm border border-transparent';
    case 'ghost':
      return 'bg-transparent text-text-secondary hover:text-text hover:bg-surface-sunken/60 border border-transparent';
    default:
      return 'bg-brand-strong text-text-on-brand shadow-sm';
  }
});

const sizeClasses = computed(() => {
  if (props.iconOnly) {
    switch (props.size) {
      case 'sm':
        return 'w-8 h-8 p-0 text-sm';
      case 'lg':
        return 'w-12 h-12 p-0 text-lg';
      case 'md':
      default:
        return 'w-10 h-10 p-0 text-base';
    }
  }

  switch (props.size) {
    case 'sm':
      return 'h-8 px-3 text-caption';
    case 'lg':
      return 'h-12 px-6 text-label';
    case 'md':
    default:
      return 'h-10 px-4 text-label';
  }
});
</script>

<template>
  <component
    :is="as === 'router-link' ? RouterLink : as"
    :to="as === 'router-link' ? to : undefined"
    :type="as === 'button' ? type : undefined"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || loading"
    :disabled="as === 'button' ? (disabled || loading) : undefined"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-md font-sans transition-all duration-fast select-none cursor-pointer',
      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
      variantClasses,
      sizeClasses,
      block ? 'w-full flex' : '',
      disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-[0.97]',
      loading ? 'cursor-wait pointer-events-none' : '',
      size === 'sm' || iconOnly ? 'relative' : ''
    ]"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Normal content -->
    <template v-else>
      <slot name="icon" />
      <slot />
      <slot name="suffix" />
    </template>
  </component>
</template>

