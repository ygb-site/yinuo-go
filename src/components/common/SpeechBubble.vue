<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    speaker?: string;
    avatar?: string;
    text: string;
    mood?: 'happy' | 'excited' | 'thinking' | 'cheering' | 'comforting' | 'surprised';
    subtext?: string;
  }>(),
  {
    speaker: '小诺 (NuoNuo)',
    avatar: '🐼',
    mood: 'happy'
  }
);

const moodEmoji = computed(() => {
  switch (props.mood) {
    case 'excited': return '🤩';
    case 'cheering': return '🎉';
    case 'thinking': return '🤔';
    case 'comforting': return '🤗';
    case 'surprised': return '😲';
    default: return '😊';
  }
});
</script>

<template>
  <div class="flex items-start gap-3 select-none">
    <!-- Character Avatar -->
    <div class="relative flex-shrink-0">
      <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-400 p-1 shadow-md border-2 border-white flex items-center justify-center">
        <div class="w-full h-full bg-white rounded-xl flex items-center justify-center">
          <span class="text-3xl sm:text-4xl animate-bounce-subtle">{{ moodEmoji }}</span>
        </div>
      </div>
      <span class="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white">
        9段
      </span>
    </div>

    <!-- Speech Container -->
    <div class="flex-1 relative rounded-2xl p-4 bg-orange-50/90 border-2 border-orange-200 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <span class="font-extrabold text-xs sm:text-sm text-orange-900 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          {{ speaker }}
        </span>
        <span v-if="subtext" class="text-[11px] font-bold text-orange-700/80">
          {{ subtext }}
        </span>
      </div>

      <p class="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
        {{ text }}
      </p>

      <slot></slot>
    </div>
  </div>
</template>

