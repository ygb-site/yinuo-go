<script setup lang="ts">
import { useLoadingStore } from '../../stores/useLoadingStore';

const loadingStore = useLoadingStore();
</script>

<template>
  <!-- Sleek Top Navigation Loading Progress Bar (No Popup) -->
  <div
    v-if="loadingStore.isLoading || loadingStore.loadingProgress > 0"
    class="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none"
  >
    <div
      class="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 shadow-[0_0_12px_rgba(249,115,22,0.7)] transition-all duration-200 ease-out"
      :style="{ width: loadingStore.loadingProgress + '%' }"
    ></div>
  </div>
</template>

