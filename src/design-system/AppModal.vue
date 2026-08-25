<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

export interface AppModalProps {
  open: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  presentation?: 'auto' | 'center' | 'sheet';
  dismissible?: boolean;
  hideClose?: boolean;
  scrollBehavior?: 'body' | 'content';
}

const props = withDefaults(defineProps<AppModalProps>(), {
  open: false,
  size: 'md',
  presentation: 'auto',
  dismissible: true,
  hideClose: false,
  scrollBehavior: 'content'
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'close'): void;
  (e: 'opened'): void;
  (e: 'closed'): void;
}>();



const handleClose = () => {
  if (!props.dismissible) return;
  emit('update:open', false);
  emit('close');
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget && props.dismissible) {
    handleClose();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open && props.dismissible) {
    handleClose();
  }
};

// Body scroll lock management
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
      emit('opened');
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      emit('closed');
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-sm';
    case 'lg':
      return 'max-w-3xl';
    case 'full':
      return 'max-w-full h-full rounded-none m-0';
    case 'md':
    default:
      return 'max-w-xl';
  }
});

const presentationClasses = computed(() => {
  if (props.presentation === 'sheet') {
    return 'self-end w-full rounded-b-none rounded-t-2xl';
  }
  if (props.presentation === 'center') {
    return 'self-center mx-4 rounded-xl';
  }
  // Auto: sheet on mobile, center on desktop
  return 'self-end md:self-center w-full md:w-auto mx-0 md:mx-4 rounded-b-none md:rounded-b-xl rounded-t-2xl md:rounded-t-xl';
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-normal ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-fast ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-modal bg-text/50 backdrop-blur-xs flex justify-center overflow-y-auto"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
      >
        <div
          
          :class="[
            'bg-surface w-full shadow-e4 border border-border/80 flex flex-col my-0 md:my-8 max-h-[90vh] transition-all',
            sizeClasses,
            presentationClasses
          ]"
          @click.stop
        >
          <!-- Media Slot (if provided, top image/hero) -->
          <div v-if="$slots.media" class="w-full shrink-0">
            <slot name="media" />
          </div>

          <!-- Header -->
          <div
            v-if="title || !hideClose || $slots.header"
            class="flex items-center justify-between p-4 md:p-6 border-b border-border/60 shrink-0"
          >
            <slot name="header">
              <h3 class="text-title text-text font-bold">
                {{ title }}
              </h3>
            </slot>

            <button
              v-if="!hideClose"
              type="button"
              class="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-sunken transition-colors cursor-pointer"
              aria-label="关闭"
              @click="handleClose"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body Content -->
          <div
            :class="[
              'p-4 md:p-6',
              scrollBehavior === 'content' ? 'overflow-y-auto flex-1' : ''
            ]"
          >
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="p-4 md:p-6 border-t border-border/60 bg-surface-sunken/40 flex items-center justify-end gap-3 shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>



