<script setup lang="ts">
import { onMounted } from 'vue';
import GlobalLayer from './layouts/GlobalLayer.vue';
import AppShell from './layouts/AppShell.vue';
import { useUserStore } from './stores/useUserStore';
import { preloadCoreRoutes } from './router';
import { lockPortraitOrientation } from './utils/pwa';

const userStore = useUserStore();

onMounted(() => {
  lockPortraitOrientation();
  userStore.ensureAuthReady();
  preloadCoreRoutes();
});
</script>

<template>
  <div class="h-screen overflow-hidden overscroll-none bg-background text-text font-sans antialiased">
    <!-- Global Layer for Modals, Toasts, and Loaders -->
    <GlobalLayer />

    <!-- Unified Shell (Child / Parent / Immersive) -->
    <AppShell />
  </div>
</template>

