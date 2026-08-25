<script setup lang="ts">
import { computed } from 'vue';
import { ICON_MAP, type IconName } from './icons';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
}

export interface AppTabsProps {
  modelValue: string;
  items: TabItem[];
  variant?: 'underline' | 'pill' | 'segmented';
  size?: 'sm' | 'md';
  scrollable?: boolean;
}

const props = withDefaults(defineProps<AppTabsProps>(), {
  variant: 'segmented',
  size: 'md',
  scrollable: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', id: string): void;
  (e: 'change', id: string): void;
}>();

const handleSelect = (item: TabItem) => {
  if (item.disabled) return;
  emit('update:modelValue', item.id);
  emit('change', item.id);
};

const handleKeydown = (event: KeyboardEvent, currentIndex: number) => {
  const enabledItems = props.items.filter((item) => !item.disabled);
  if (enabledItems.length === 0) return;

  let newIndex = currentIndex;

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    newIndex = (currentIndex + 1) % props.items.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    newIndex = (currentIndex - 1 + props.items.length) % props.items.length;
  } else if (event.key === 'Home') {
    event.preventDefault();
    newIndex = 0;
  } else if (event.key === 'End') {
    event.preventDefault();
    newIndex = props.items.length - 1;
  }

  const targetItem = props.items[newIndex];
  if (targetItem && !targetItem.disabled) {
    handleSelect(targetItem);
  }
};

const containerVariantClasses = computed(() => {
  switch (props.variant) {
    case 'underline':
      return 'border-b border-border gap-6';
    case 'pill':
      return 'gap-2';
    case 'segmented':
    default:
      return 'bg-surface-sunken p-1 rounded-lg gap-1 border border-border/60';
  }
});
</script>

<template>
  <div
    :class="[
      'flex items-center select-none',
      scrollable ? 'overflow-x-auto no-scrollbar' : '',
      containerVariantClasses
    ]"
    role="tablist"
  >
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.id"
      :aria-disabled="item.disabled"
      :disabled="item.disabled"
      :tabindex="modelValue === item.id ? 0 : -1"
      :class="[
        'inline-flex items-center justify-center gap-1.5 font-sans font-bold transition-all duration-fast cursor-pointer shrink-0',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand',
        size === 'sm' ? 'px-3 py-1 text-caption' : 'px-4 py-2 text-label',
        variant === 'segmented'
          ? modelValue === item.id
            ? 'bg-surface text-brand-strong shadow-xs rounded-md'
            : 'text-text-secondary hover:text-text rounded-md hover:bg-surface/50'
          : '',
        variant === 'pill'
          ? modelValue === item.id
            ? 'bg-brand-strong text-text-on-brand rounded-full shadow-xs'
            : 'bg-surface-sunken text-text-secondary hover:text-text rounded-full hover:bg-surface-sunken/80'
          : '',
        variant === 'underline'
          ? modelValue === item.id
            ? 'text-brand-strong border-b-2 border-brand-strong pb-2 -mb-px'
            : 'text-text-secondary hover:text-text border-b-2 border-transparent pb-2 -mb-px'
          : '',
        item.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'active:scale-98'
      ]"
      @click="handleSelect(item)"
      @keydown="handleKeydown($event, index)"
    >
      <component
        :is="ICON_MAP[item.icon]"
        v-if="item.icon && ICON_MAP[item.icon]"
        class="w-4 h-4 shrink-0"
      />
      <span>{{ item.label }}</span>
      <span
        v-if="item.badge !== undefined"
        class="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-soft text-brand-strong font-bold"
      >
        {{ item.badge }}
      </span>
    </button>
  </div>
</template>

