<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppIcon, AppButton } from '../design-system';
import UserMenuDropdown from '../components/common/UserMenuDropdown.vue';

const router = useRouter();
const route = useRoute();

const exitParentMode = () => {
  router.push('/');
};

const parentNav = [
  { path: '/parent-dashboard', label: '学情看板' }
];

const pageTitle = computed(() => {
  return (route.meta.title as string) || '家长学情与成长空间';
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F8F9FC] text-slate-800 font-sans antialiased select-none">
    <header class="sticky top-0 z-sticky bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between gap-4 shrink-0">
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

        <div class="flex items-center gap-2 min-w-0">
          <AppIcon name="parent" size="md" tone="info" />
          <h1 class="text-title font-bold text-slate-900 truncate">
            {{ pageTitle }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <nav class="hidden sm:flex items-center gap-1" aria-label="家长空间">
          <router-link
            v-for="item in parentNav"
            :key="item.path"
            :to="item.path"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition"
            :class="route.path === item.path ? 'bg-blue-50 text-blue-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
          >
            {{ item.label }}
          </router-link>
        </nav>
        <UserMenuDropdown />
      </div>
    </header>

    <nav class="sm:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-2" aria-label="家长空间">
      <router-link
        v-for="item in parentNav"
        :key="item.path"
        :to="item.path"
        class="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold transition"
        :class="route.path === item.path ? 'bg-blue-50 text-blue-800' : 'text-slate-500 bg-slate-50'"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <main class="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>
