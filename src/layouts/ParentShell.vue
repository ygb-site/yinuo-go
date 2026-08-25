<script setup lang="ts">
import { useRouter } from 'vue-router';
import { AppIcon, AppButton } from '../design-system';
import UserMenuDropdown from '../components/common/UserMenuDropdown.vue';

const router = useRouter();

const exitParentMode = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F8F9FC] text-slate-800 font-sans antialiased select-none">
    <!-- Parent Top Bar (Neutral, Professional Tone) -->
    <header class="sticky top-0 z-sticky bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between gap-4 shrink-0">
      <!-- Left: Exit to Child Mode & Title -->
      <div class="flex items-center gap-4 min-w-0">
        <AppButton
          variant="secondary"
          size="sm"
          @click="exitParentMode"
        >
          <template #icon>
            <AppIcon name="back" size="sm" />
          </template>
          <span>返回学堂</span>
        </AppButton>

        <div class="h-5 w-px bg-slate-200" />

        <div class="flex items-center gap-2">
          <AppIcon name="parent" size="md" tone="info" />
          <h1 class="text-title font-bold text-slate-900 truncate">
            家长学情与成长空间
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <UserMenuDropdown />
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>


