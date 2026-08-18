<script setup lang="ts">
import { computed } from 'vue';
import { Volume2 } from 'lucide-vue-next';
import { isSpeaking, toggleSpeech } from '../utils/speech';

export type MascotMood = 'happy' | 'excited' | 'thinking' | 'cheering' | 'comforting' | 'surprised';

const props = withDefaults(
  defineProps<{
    message: string;
    mood?: MascotMood;
    speakerName?: string;
    subtext?: string;
    showSpeechBubble?: boolean;
    compact?: boolean;
  }>(),
  {
    mood: 'happy',
    speakerName: '小诺 (NuoNuo)',
    showSpeechBubble: true,
    compact: false
  }
);

const moodEmoji = computed(() => {
  switch (props.mood) {
    case 'excited':
      return '🤩';
    case 'cheering':
      return '🎉';
    case 'thinking':
      return '🤔';
    case 'comforting':
      return '🤗';
    case 'surprised':
      return '😲';
    case 'happy':
    default:
      return '😊';
  }
});

const moodBorderColor = computed(() => {
  switch (props.mood) {
    case 'excited':
      return 'border-amber-400 bg-amber-50';
    case 'cheering':
      return 'border-emerald-400 bg-emerald-50';
    case 'thinking':
      return 'border-indigo-400 bg-indigo-50';
    case 'comforting':
      return 'border-pink-400 bg-pink-50';
    default:
      return 'border-orange-300 bg-orange-50';
  }
});

const handleVoice = () => {
  toggleSpeech(props.message);
};
</script>

<template>
  <div class="flex items-start gap-3 select-none" :class="{ 'flex-col sm:flex-row': !compact }">
    <!-- Mascot Avatar Character -->
    <div class="relative flex-shrink-0">
      <div
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 p-1 shadow-lg transform transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-2 border-white"
        @click="handleVoice"
      >
        <div class="w-full h-full bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
          <span class="text-3xl sm:text-4xl animate-bounce-subtle">{{ moodEmoji }}</span>
          <div class="absolute top-0 right-1 w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
          <div class="absolute top-0 left-1 w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
        </div>
      </div>
      <span class="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow border border-white">
        9段
      </span>
    </div>

    <!-- Speech Bubble -->
    <div
      v-if="showSpeechBubble"
      class="flex-1 relative rounded-2xl p-4 sm:p-5 border-2 shadow-sm transition-all"
      :class="moodBorderColor"
    >
      <div
        class="hidden sm:block absolute top-4 -left-2 w-3.5 h-3.5 rotate-45 border-l-2 border-b-2 border-inherit bg-inherit"
      ></div>

      <!-- Speaker Title & Voice Button -->
      <div class="flex items-center justify-between mb-1.5">
        <span class="font-extrabold text-xs sm:text-sm text-amber-900 flex items-center gap-1.5">
          <span class="inline-block w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          {{ speakerName }}
        </span>

        <div class="flex items-center gap-2">
          <span v-if="subtext" class="text-[11px] text-amber-700/80 font-medium">
            {{ subtext }}
          </span>

          <button
            type="button"
            @click="handleVoice"
            class="p-1 px-2 rounded-xl transition flex items-center gap-1 text-[11px] font-black cursor-pointer active:scale-90"
            :class="
              isSpeaking
                ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300'
                : 'bg-white/80 hover:bg-orange-100 text-orange-800 border border-orange-200'
            "
            title="点击朗读小诺说的话"
          >
            <Volume2 class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ isSpeaking ? '正在朗读...' : '听小诺说' }}</span>
          </button>
        </div>
      </div>

      <!-- Message Body -->
      <p class="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
        {{ message }}
      </p>

      <slot name="extra"></slot>
    </div>
  </div>
</template>

