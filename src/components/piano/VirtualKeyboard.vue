<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { pianoAudio } from '../../utils/pianoAudio';
import { Compass, Eye, Maximize2, Minimize2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    highlightPitch?: string; // e.g. 'C4'
  }>(),
  {
    highlightPitch: ''
  }
);

const emit = defineEmits<{
  (e: 'key-press', pitch: string): void;
}>();

const activePressedKey = ref<string | null>(null);
const scrollContainerRef = ref<HTMLElement | null>(null);

// View Mode: 'scrollable' (comfortable playing keys with horizontal scroll & auto-focus) vs 'panoramic' (all 88 keys fit on screen)
const viewMode = ref<'scrollable' | 'panoramic'>('scrollable');

// Label Display: 'all' | 'landmark' | 'none'
const labelMode = ref<'all' | 'landmark'>('all');

export interface PianoKeyDef {
  pitch: string;
  name: string;
  syllable: string;
  octave: number;
  isBlack: boolean;
  isMiddleC?: boolean;
}

export interface BlackPianoKeyDef extends PianoKeyDef {
  whiteIndex: number;
}

// Generate the 52 white keys
const whiteKeys: PianoKeyDef[] = [];
// Generate the 36 black keys
const blackKeys: BlackPianoKeyDef[] = [];

// 1. Octave 0 (A0, B0)
whiteKeys.push({ pitch: 'A0', name: 'A0', syllable: 'La', octave: 0, isBlack: false });
blackKeys.push({ pitch: 'A#0', name: 'A#0', syllable: '#La', octave: 0, isBlack: true, whiteIndex: 0 });
whiteKeys.push({ pitch: 'B0', name: 'B0', syllable: 'Si', octave: 0, isBlack: false });

// 2. Octaves 1 to 7
const pitchDefs = [
  { p: 'C', s: 'Do', black: true },
  { p: 'D', s: 'Re', black: true },
  { p: 'E', s: 'Mi', black: false },
  { p: 'F', s: 'Fa', black: true },
  { p: 'G', s: 'Sol', black: true },
  { p: 'A', s: 'La', black: true },
  { p: 'B', s: 'Si', black: false }
];

for (let oct = 1; oct <= 7; oct++) {
  pitchDefs.forEach(def => {
    const wIdx = whiteKeys.length;
    const isMiddleC = oct === 4 && def.p === 'C';
    whiteKeys.push({
      pitch: `${def.p}${oct}`,
      name: `${def.p}${oct}`,
      syllable: def.s,
      octave: oct,
      isBlack: false,
      isMiddleC
    });
    if (def.black) {
      blackKeys.push({
        pitch: `${def.p}#${oct}`,
        name: `${def.p}#${oct}`,
        syllable: `#${def.s}`,
        octave: oct,
        isBlack: true,
        whiteIndex: wIdx
      });
    }
  });
}

// 3. Octave 8 (C8)
whiteKeys.push({ pitch: 'C8', name: 'C8', syllable: 'Do', octave: 8, isBlack: false });

// Octave navigation shortcuts
const octaveShortcuts = [
  { label: '低音组 (C2)', targetPitch: 'C2', tag: '倍低音' },
  { label: '小字组 (C3)', targetPitch: 'C3', tag: '小汤2·低音C' },
  { label: '中央C (C4)', targetPitch: 'C4', tag: '小汤1·大本营', highlight: true },
  { label: '高音组 (C5)', targetPitch: 'C5', tag: '小汤2·高音C' },
  { label: '倍高音 (C6)', targetPitch: 'C6', tag: '拜厄·高音区' }
];

const handleKeyClick = (pitch: string) => {
  pianoAudio.playNote(pitch);
  activePressedKey.value = pitch;
  emit('key-press', pitch);
  setTimeout(() => {
    if (activePressedKey.value === pitch) {
      activePressedKey.value = null;
    }
  }, 250);
};

// Scroll smoothly to a specific pitch
const scrollToPitch = (pitch: string) => {
  if (viewMode.value !== 'scrollable' || !scrollContainerRef.value) return;
  const wIdx = whiteKeys.findIndex(k => k.pitch === pitch);
  if (wIdx === -1) return;

  const keyWidth = 32; // 32px per white key in scrollable mode
  const targetX = wIdx * keyWidth - scrollContainerRef.value.clientWidth / 2 + keyWidth / 2;
  scrollContainerRef.value.scrollTo({
    left: Math.max(0, targetX),
    behavior: 'smooth'
  });
};

// Auto scroll to highlighted pitch whenever it changes
watch(
  () => props.highlightPitch,
  (newPitch) => {
    if (newPitch) {
      nextTick(() => {
        scrollToPitch(newPitch);
      });
    }
  },
  { immediate: true }
);

onMounted(() => {
  nextTick(() => {
    scrollToPitch(props.highlightPitch || 'C4');
  });
});
</script>

<template>
  <div class="relative w-full mx-auto select-none p-3.5 sm:p-4 bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-800 space-y-3">
    <!-- Header Bar: 88-Key Title & Controls -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-1 border-b border-slate-800/80 pb-2.5">
      <div class="flex items-center gap-2">
        <span class="text-base">🎹</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-white">88 键全音域真钢键盘</span>
            <span class="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black">
              52 白键 + 36 黑键 · A0 ~ C8
            </span>
          </div>
          <p class="text-[10px] text-slate-400 font-medium">
            全键盘覆盖《小汤1》《小汤2》《拜厄》全音域 · 金色星标为中央 C (C4)
          </p>
        </div>
      </div>

      <!-- Controls: Panoramic Toggle & Label Toggle -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex items-center gap-1.5"
          :class="viewMode === 'panoramic' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
          @click="viewMode = viewMode === 'panoramic' ? 'scrollable' : 'panoramic'"
        >
          <component :is="viewMode === 'panoramic' ? Minimize2 : Maximize2" class="w-3.5 h-3.5" />
          <span>{{ viewMode === 'panoramic' ? '还原弹奏模式' : '88键全景鸟瞰' }}</span>
        </button>

        <button
          type="button"
          class="px-2 py-1 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer flex items-center gap-1"
          @click="labelMode = labelMode === 'all' ? 'landmark' : 'all'"
        >
          <Eye class="w-3 h-3" />
          <span>{{ labelMode === 'all' ? '唱名已显' : '精简键名' }}</span>
        </button>
      </div>
    </div>

    <!-- Octave Fast-Travel Navigator Bar (Especially for Thompson 1, 2, and Beyer) -->
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      <span class="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
        <Compass class="w-3 h-3" />
        <span>八度定位：</span>
      </span>
      <button
        v-for="oct in octaveShortcuts"
        :key="oct.targetPitch"
        type="button"
        class="px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer shrink-0 flex items-center gap-1"
        :class="[
          highlightPitch?.startsWith(oct.targetPitch[0]) && highlightPitch?.endsWith(oct.targetPitch[1])
            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs font-extrabold'
            : oct.highlight
            ? 'bg-indigo-900/60 text-amber-300 border-amber-500/50 hover:bg-indigo-800'
            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
        ]"
        @click="scrollToPitch(oct.targetPitch)"
      >
        <span>{{ oct.label }}</span>
        <span class="text-[8px] opacity-75 font-normal">({{ oct.tag }})</span>
      </button>
    </div>

    <!-- 1. Scrollable Mode: Real Touch & Fluid Scroll -->
    <div
      v-if="viewMode === 'scrollable'"
      ref="scrollContainerRef"
      class="relative overflow-x-auto p-2 bg-slate-950 rounded-2xl border border-slate-800/90 shadow-inner"
      style="scroll-behavior: smooth;"
    >
      <!-- White Keys Row -->
      <div class="relative flex" style="width: calc(52 * 32px); height: 160px;">
        <button
          v-for="k in whiteKeys"
          :key="k.pitch"
          type="button"
          class="h-full rounded-b-md flex flex-col justify-end items-center pb-2 cursor-pointer transition-all duration-75 relative shrink-0 border-r border-slate-300/80 select-none"
          style="width: 32px;"
          :class="[
            highlightPitch === k.pitch
              ? 'bg-amber-100 ring-4 ring-amber-400 z-10 shadow-lg scale-102'
              : activePressedKey === k.pitch
              ? 'bg-slate-200 translate-y-0.5 shadow-inner'
              : 'bg-white hover:bg-slate-50 shadow-2xs active:bg-slate-200'
          ]"
          @mousedown="handleKeyClick(k.pitch)"
          @touchstart.prevent="handleKeyClick(k.pitch)"
        >
          <!-- Middle C Special Gold Dot Indicator -->
          <span
            v-if="k.isMiddleC"
            class="absolute top-2 w-4 h-4 rounded-full bg-amber-400 border border-amber-500 shadow-sm flex items-center justify-center text-[9px] font-black text-amber-950 animate-pulse"
            title="中央 C (C4)"
          >
            ★
          </span>

          <span
            v-if="highlightPitch === k.pitch"
            class="absolute top-8 w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"
          ></span>

          <!-- Labels -->
          <template v-if="labelMode === 'all' || k.isMiddleC">
            <span
              class="text-[10px] font-black leading-tight"
              :class="k.isMiddleC ? 'text-amber-800 font-extrabold text-[11px]' : 'text-slate-800'"
            >
              {{ k.syllable }}
            </span>
            <span
              class="text-[9px] font-bold"
              :class="k.isMiddleC ? 'text-amber-600 font-extrabold' : 'text-slate-400'"
            >
              {{ k.name }}
            </span>
          </template>
        </button>

        <!-- Black Keys Positioned Above White Keys -->
        <button
          v-for="bk in blackKeys"
          :key="bk.pitch"
          type="button"
          class="absolute h-[62%] rounded-b-md cursor-pointer pointer-events-auto transition-all duration-75 shadow-xl flex flex-col justify-end items-center pb-1.5 z-20 border border-black/40"
          style="width: 20px;"
          :style="{
            left: `${(bk.whiteIndex + 1) * 32 - 10}px`
          }"
          :class="[
            highlightPitch === bk.pitch
              ? 'bg-amber-400 ring-2 ring-amber-300 shadow-amber-500/50'
              : activePressedKey === bk.pitch
              ? 'bg-slate-700 translate-y-0.5'
              : 'bg-gradient-to-b from-slate-800 via-slate-900 to-black hover:from-slate-700 hover:to-slate-900'
          ]"
          @mousedown="handleKeyClick(bk.pitch)"
          @touchstart.prevent="handleKeyClick(bk.pitch)"
        >
          <span
            v-if="labelMode === 'all' || highlightPitch === bk.pitch"
            class="text-[7px] text-slate-300 font-mono scale-90"
          >
            {{ bk.name.replace('#', '♯') }}
          </span>
        </button>
      </div>
    </div>

    <!-- 2. Panoramic Mode: All 88 Keys Compact in View -->
    <div
      v-else
      class="relative w-full p-2 bg-slate-950 rounded-2xl border border-slate-800/90 shadow-inner overflow-hidden"
    >
      <div class="relative flex w-full" style="height: 120px;">
        <button
          v-for="k in whiteKeys"
          :key="k.pitch"
          type="button"
          class="h-full rounded-b-xs flex flex-col justify-end items-center pb-1 cursor-pointer transition-colors duration-75 relative shrink-0 border-r border-slate-300/60"
          :style="{ width: `${100 / 52}%` }"
          :class="[
            highlightPitch === k.pitch
              ? 'bg-amber-400 z-10 shadow-lg'
              : activePressedKey === k.pitch
              ? 'bg-slate-200'
              : 'bg-white hover:bg-slate-100'
          ]"
          @mousedown="handleKeyClick(k.pitch)"
          @touchstart.prevent="handleKeyClick(k.pitch)"
        >
          <!-- Middle C Star in Panoramic View -->
          <span
            v-if="k.isMiddleC"
            class="absolute top-1 text-[8px] text-amber-600 font-black"
          >
            ★
          </span>
          <span
            v-if="k.isMiddleC"
            class="text-[7px] font-black text-amber-800 scale-75"
          >
            C4
          </span>
        </button>

        <!-- Black Keys in Panoramic View -->
        <button
          v-for="bk in blackKeys"
          :key="bk.pitch"
          type="button"
          class="absolute h-[60%] rounded-b-2xs cursor-pointer transition-colors duration-75 z-20 border border-black/40"
          :style="{
            width: `${(100 / 52) * 0.65}%`,
            left: `${((bk.whiteIndex + 1) * (100 / 52)) - ((100 / 52) * 0.325)}%`
          }"
          :class="[
            highlightPitch === bk.pitch
              ? 'bg-amber-400'
              : activePressedKey === bk.pitch
              ? 'bg-slate-700'
              : 'bg-black hover:bg-slate-800'
          ]"
          @mousedown="handleKeyClick(bk.pitch)"
          @touchstart.prevent="handleKeyClick(bk.pitch)"
        ></button>
      </div>
    </div>
  </div>
</template>

