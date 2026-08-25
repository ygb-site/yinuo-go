<script setup lang="ts">
import { ref, computed } from 'vue';
import { ICON_MAP, type IconName } from './icons';
import { ChevronDown } from 'lucide-vue-next';

export interface AppSectionProps {
  title?: string;
  description?: string;
  icon?: IconName;
  tone?: 'none' | 'learning' | 'growth' | 'challenge';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  density?: 'compact' | 'default' | 'spacious';
}

const props = withDefaults(defineProps<AppSectionProps>(), {
  tone: 'none',
  collapsible: false,
  defaultCollapsed: false,
  density: 'default'
});

const emit = defineEmits<{
  (e: 'toggle', collapsed: boolean): void;
}>();

const isCollapsed = ref(props.defaultCollapsed);

const toggleCollapse = () => {
  if (!props.collapsible) return;
  isCollapsed.value = !isCollapsed.value;
  emit('toggle', isCollapsed.value);
};

const toneIconClass = computed(() => {
  switch (props.tone) {
    case 'learning':
      return 'bg-info-soft text-learning';
    case 'growth':
      return 'bg-success-soft text-growth';
    case 'challenge':
      return 'bg-purple-100 text-challenge';
    case 'none':
    default:
      return 'bg-brand-soft text-brand-strong';
  }
});

const spacingClasses = computed(() => {
  switch (props.density) {
    case 'compact':
      return 'space-y-2.5';
    case 'spacious':
      return 'space-y-6';
    case 'default':
    default:
      return 'space-y-4';
  }
});
</script>

<template>
  <section class="w-full" :class="spacingClasses">
    <!-- Section Header (if title or slot exists) -->
    <div
      v-if="title || $slots.action"
      class="flex items-center justify-between gap-3 px-1 select-none"
    >
      <div
        class="flex items-center gap-2.5 min-w-0"
        :class="collapsible ? 'cursor-pointer' : ''"
        @click="toggleCollapse"
      >
        <!-- Icon -->
        <div
          v-if="icon && ICON_MAP[icon]"
          :class="[
            'w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-sm shadow-xs',
            toneIconClass
          ]"
        >
          <component :is="ICON_MAP[icon]" class="w-4 h-4" />
        </div>

        <!-- Title & Description -->
        <div class="min-w-0">
          <h2 class="text-title text-text font-bold truncate flex items-center gap-1.5">
            <span>{{ title }}</span>
            <ChevronDown
              v-if="collapsible"
              class="w-4 h-4 text-text-muted transition-transform duration-normal"
              :class="isCollapsed ? '-rotate-90' : ''"
            />
          </h2>
          <p v-if="description" class="text-caption text-text-muted truncate">
            {{ description }}
          </p>
        </div>
      </div>

      <!-- Header Action Slot -->
      <div v-if="$slots.action" class="shrink-0 flex items-center gap-2">
        <slot name="action" />
      </div>
    </div>

    <!-- Section Content (Collapsible) -->
    <div v-show="!isCollapsed" class="w-full">
      <slot />
    </div>

    <!-- Section Footer Slot -->
    <div v-if="$slots.footer && !isCollapsed" class="pt-2">
      <slot name="footer" />
    </div>
  </section>
</template>

