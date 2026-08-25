<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppIcon } from '../design-system';
import { showConfirm } from '../utils/alert';

const route = useRoute();
const router = useRouter();

const handleBack = () => {
  const needsConfirm = route.meta.confirmLeave !== false;
  if (needsConfirm) {
    showConfirm({
      title: '要暂停本关吗？',
      message: '当前的对局与练习进度已自动保存，随时可以回来继续哦！',
      type: 'warning',
      confirmText: '退出',
      cancelText: '继续学习'
    }).then((confirmed) => {
      if (confirmed) {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/learn');
        }
      }
    });
  } else {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/learn');
    }
  }
};

const miniStatus = computed(() => {
  return (route.meta.miniStatus as string) || (route.meta.title as string) || '专注学习中';
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-text select-none overflow-x-hidden">
    <!-- Minimal Immersive Header (48px) -->
    <header class="sticky top-0 z-sticky bg-surface/80 backdrop-blur-md border-b border-border/60 h-12 px-3 md:px-6 flex items-center justify-between gap-3 shrink-0">
      <!-- Left: Back Button with Confirm Guard -->
      <button
        type="button"
        class="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-sunken transition cursor-pointer"
        aria-label="返回"
        @click="handleBack"
      >
        <AppIcon name="back" size="sm" />
      </button>

      <!-- Center: Mini Status / Level Title -->
      <div class="text-label font-bold text-text truncate max-w-xs md:max-w-md">
        {{ miniStatus }}
      </div>

      <!-- Right: Action Slot (Hints / Sound Toggle) -->
      <div class="flex items-center gap-2">
        <slot name="header-actions" />
      </div>
    </header>

    <!-- Main Board / Puzzle Stage -->
    <main class="flex-1 flex flex-col items-center justify-center p-2 md:p-6 w-full">
      <slot />
    </main>
  </div>
</template>


