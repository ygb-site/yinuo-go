<script setup lang="ts">
import { computed } from 'vue';

export interface AppAvatarProps {
  emoji?: string;
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: 'none' | 'brand' | 'rank';
  badge?: 'none' | 'online' | 'count';
  badgeCount?: number;
}

const props = withDefaults(defineProps<AppAvatarProps>(), {
  size: 'md',
  ring: 'none',
  badge: 'none'
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8 text-base';
    case 'lg':
      return 'w-14 h-14 text-2xl';
    case 'xl':
      return 'w-20 h-20 text-4xl';
    case 'md':
    default:
      return 'w-10 h-10 text-xl';
  }
});

const ringClasses = computed(() => {
  switch (props.ring) {
    case 'brand':
      return 'ring-2 ring-brand ring-offset-2 ring-offset-surface';
    case 'rank':
      return 'ring-2 ring-warning ring-offset-2 ring-offset-surface';
    case 'none':
    default:
      return 'border border-border/70';
  }
});

const initialLetter = computed(() => {
  if (props.name && props.name.length > 0) {
    return props.name.charAt(0).toUpperCase();
  }
  return '诺';
});
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center rounded-full bg-surface-sunken select-none shrink-0 cursor-pointer"
    :class="[sizeClasses, ringClasses]"
    @click="emit('click', $event)"
  >
    <!-- Image avatar -->
    <img
      v-if="src"
      :src="src"
      :alt="name || 'Avatar'"
      class="w-full h-full object-cover rounded-full"
    />

    <!-- Emoji avatar -->
    <span v-else-if="emoji" class="leading-none">
      {{ emoji }}
    </span>

    <!-- Text Initial -->
    <span v-else class="font-bold text-text-secondary leading-none">
      {{ initialLetter }}
    </span>

    <!-- Online badge -->
    <span
      v-if="badge === 'online'"
      class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-surface"
    />

    <!-- Count badge -->
    <span
      v-else-if="badge === 'count' && (badgeCount || 0) > 0"
      class="absolute -top-1 -right-1 px-1.5 py-0.2 bg-danger text-text-on-brand text-[10px] font-bold rounded-full ring-2 ring-surface leading-tight"
    >
      {{ (badgeCount || 0) > 99 ? '99+' : badgeCount }}
    </span>
  </div>
</template>

