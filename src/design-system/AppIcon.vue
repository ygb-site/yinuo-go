<script setup lang="ts">
import { computed } from 'vue';
import { ICON_MAP, type IconName, type IconTone, ICON_TONE_CLASS_MAP } from './icons';

export interface AppIconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: IconTone;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<AppIconProps>(), {
  size: 'md',
  tone: 'inherit'
});

const iconComponent = computed(() => {
  return ICON_MAP[props.name] || ICON_MAP['sparkle'] || null;
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-3.5 h-3.5';
    case 'sm':
      return 'w-4 h-4';
    case 'lg':
      return 'w-6 h-6';
    case 'md':
    default:
      return 'w-5 h-5';
  }
});

const toneClass = computed(() => {
  return ICON_TONE_CLASS_MAP[props.tone] || 'text-current';
});
</script>

<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :class="['inline-block shrink-0', sizeClasses, toneClass]"
    :aria-label="ariaLabel"
    :aria-hidden="!ariaLabel"
  />
</template>

