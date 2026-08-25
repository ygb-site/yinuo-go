<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Check, ChevronDown } from 'lucide-vue-next';

export interface AppSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  icon?: string;
}

export interface AppSelectProps<T extends string | number = string | number> {
  modelValue: T;
  options: AppSelectOption<T>[];
  variant?: 'default' | 'emphasis';
  size?: 'sm' | 'md';
  ariaLabel?: string;
  disabled?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<AppSelectProps<T>>(), {
  variant: 'default',
  size: 'md',
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
  (e: 'change', value: T): void;
}>();

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const highlightedIndex = ref(0);

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue) || props.options[0];
});

const triggerClasses = computed(() => {
  const sizeClass = props.size === 'sm'
    ? 'px-3 py-2 pr-10 text-xs min-h-11'
    : 'px-4 py-3.5 pr-12 text-sm min-h-12';

  if (props.variant === 'emphasis') {
    return [
      sizeClass,
      'border-amber-500 bg-amber-50 text-amber-950',
      isOpen.value ? 'ring-2 ring-amber-300' : ''
    ];
  }

  return [
    sizeClass,
    'border-slate-200 bg-white text-slate-800',
    isOpen.value ? 'border-amber-400 ring-2 ring-amber-200' : 'hover:border-slate-300'
  ];
});

const chevronClass = computed(() => {
  if (props.variant === 'emphasis') return 'text-amber-700';
  return 'text-slate-400';
});

const close = () => {
  isOpen.value = false;
};

const toggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const selectOption = (opt: AppSelectOption<T>) => {
  if (props.disabled) return;
  if (opt.value !== props.modelValue) {
    emit('update:modelValue', opt.value);
    emit('change', opt.value);
  }
  close();
};

const syncHighlight = () => {
  const idx = props.options.findIndex((opt) => opt.value === props.modelValue);
  highlightedIndex.value = idx >= 0 ? idx : 0;
};

const moveHighlight = (delta: number) => {
  if (props.options.length === 0) return;
  const next = (highlightedIndex.value + delta + props.options.length) % props.options.length;
  highlightedIndex.value = next;
  const el = listRef.value?.querySelector(`[data-select-idx="${next}"]`) as HTMLElement | null;
  el?.scrollIntoView({ block: 'nearest' });
};

const onDocPointerDown = (event: PointerEvent) => {
  if (!rootRef.value) return;
  if (!rootRef.value.contains(event.target as Node)) {
    close();
  }
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  if (event.key === 'Escape') {
    if (!isOpen.value) return;
    event.preventDefault();
    close();
    return;
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (!isOpen.value) {
      isOpen.value = true;
      return;
    }
    moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (!isOpen.value) return;
    event.preventDefault();
    const opt = props.options[highlightedIndex.value];
    if (opt) selectOption(opt);
    return;
  }

  if (event.key === 'Home' && isOpen.value) {
    event.preventDefault();
    highlightedIndex.value = 0;
    return;
  }

  if (event.key === 'End' && isOpen.value) {
    event.preventDefault();
    highlightedIndex.value = Math.max(0, props.options.length - 1);
  }
};

watch(isOpen, async (open) => {
  if (!open) return;
  syncHighlight();
  await nextTick();
  const el = listRef.value?.querySelector(`[data-select-idx="${highlightedIndex.value}"]`) as HTMLElement | null;
  el?.scrollIntoView({ block: 'nearest' });
});

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown);
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown);
});
</script>

<template>
  <div
    ref="rootRef"
    class="relative w-full"
    :class="isOpen ? 'z-popover' : 'z-base'"
  >
    <button
      :id="id"
      type="button"
      class="w-full appearance-none rounded-2xl border-2 font-bold cursor-pointer shadow-xs text-left flex items-center gap-2.5 transition-all duration-fast focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
      :class="[triggerClasses, disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '']"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :disabled="disabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span
        v-if="selectedOption?.icon"
        class="text-lg leading-none shrink-0"
        aria-hidden="true"
      >
        {{ selectedOption.icon }}
      </span>
      <span class="truncate flex-1">{{ selectedOption?.label || '' }}</span>
      <ChevronDown
        class="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-fast"
        :class="[
          chevronClass,
          isOpen ? 'rotate-180' : '',
          size === 'sm' ? 'w-4 h-4 right-3' : 'w-5 h-5 right-4'
        ]"
      />
    </button>

    <ul
      v-if="isOpen"
      ref="listRef"
      role="listbox"
      class="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-64 overflow-y-auto rounded-2xl border-2 border-slate-200 bg-white p-1.5 shadow-e3"
      :aria-labelledby="id"
    >
      <li
        v-for="(opt, index) in options"
        :key="String(opt.value)"
        role="option"
        :data-select-idx="index"
        :aria-selected="opt.value === modelValue"
        class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold cursor-pointer transition-colors"
        :class="
          opt.value === modelValue
            ? 'bg-amber-50 text-amber-950'
            : highlightedIndex === index
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-700 hover:bg-slate-50'
        "
        @pointerdown.prevent="selectOption(opt)"
        @mouseenter="highlightedIndex = index"
      >
        <span v-if="opt.icon" class="text-lg leading-none shrink-0" aria-hidden="true">{{ opt.icon }}</span>
        <span class="truncate flex-1">{{ opt.label }}</span>
        <Check
          v-if="opt.value === modelValue"
          class="w-4 h-4 text-amber-600 shrink-0"
        />
      </li>
    </ul>
  </div>
</template>
