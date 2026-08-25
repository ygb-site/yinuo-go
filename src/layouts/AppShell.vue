<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ChildShell from './ChildShell.vue';
import ParentShell from './ParentShell.vue';
import ImmersiveShell from './ImmersiveShell.vue';

const route = useRoute();

const shellMode = computed<'child' | 'parent' | 'immersive'>(() => {
  if (route.meta.mode) {
    return route.meta.mode as 'child' | 'parent' | 'immersive';
  }
  const path = route.path;
  if (path.startsWith('/parent-dashboard') || path.startsWith('/parent')) {
    return 'parent';
  }
  if (path.startsWith('/lesson/') || path === '/adventure') {
    return 'immersive';
  }
  return 'child';
});
</script>

<template>
  <component :is="shellMode === 'parent' ? ParentShell : shellMode === 'immersive' ? ImmersiveShell : ChildShell">
    <router-view />
  </component>
</template>

