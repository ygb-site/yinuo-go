<script setup lang="ts">
import { computed } from 'vue';
import type { ClefType, StaffNoteItem } from '../../data/pianoStaffData';

const props = withDefaults(
  defineProps<{
    clef?: ClefType;
    activeNote?: StaffNoteItem | null;
    showNoteName?: boolean;       // whether to show C4 / Do text on the note
    showPositionBadge?: boolean;  // whether to show '第2线' badge
    interactive?: boolean;        // allow clicking lines/spaces
    height?: number;
    colorTheme?: 'amber' | 'emerald' | 'blue' | 'indigo';
  }>(),
  {
    clef: 'treble',
    activeNote: null,
    showNoteName: true,
    showPositionBadge: true,
    interactive: false,
    height: 180,
    colorTheme: 'indigo'
  }
);

// SVG Layout Constants
const width = 360;
const height = computed(() => props.height);
const lineSpacing = 16;
const staffCenterY = computed(() => height.value / 2);

// 5 Lines Y coordinates (index 1 to 5, from bottom to top)
const lines = computed(() => [
  { index: 5, y: staffCenterY.value - 2 * lineSpacing, name: '第五线' },
  { index: 4, y: staffCenterY.value - 1 * lineSpacing, name: '第四线' },
  { index: 3, y: staffCenterY.value, name: '第三线 (中线)' },
  { index: 2, y: staffCenterY.value + 1 * lineSpacing, name: '第二线' },
  { index: 1, y: staffCenterY.value + 2 * lineSpacing, name: '第一线' }
]);

// Note position
const noteX = 220;
const noteY = computed(() => {
  if (!props.activeNote) return staffCenterY.value;
  return staffCenterY.value - props.activeNote.stepOffset * (lineSpacing / 2);
});

// Stem direction
const stemDown = computed(() => {
  if (!props.activeNote) return false;
  return props.activeNote.stepOffset >= 0;
});

// Calculate ledger lines needed for activeNote
const ledgerLines = computed(() => {
  if (!props.activeNote) return [];
  const linesNeeded: { y: number }[] = [];
  const step = props.activeNote.stepOffset;

  // Below staff: stepOffset <= -6
  if (step <= -6) {
    for (let s = -6; s >= step; s -= 2) {
      linesNeeded.push({ y: staffCenterY.value - s * (lineSpacing / 2) });
    }
  }
  // Above staff: stepOffset >= 6
  if (step >= 6) {
    for (let s = 6; s <= step; s += 2) {
      linesNeeded.push({ y: staffCenterY.value - s * (lineSpacing / 2) });
    }
  }

  return linesNeeded;
});
</script>

<template>
  <div class="relative w-full flex flex-col items-center select-none">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full max-w-md h-auto overflow-visible drop-shadow-xs"
    >
      <defs>
        <filter id="noteGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#4f46e5" flood-opacity="0.35" />
        </filter>
        <linearGradient id="noteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#312e81" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
      </defs>

      <!-- Staff Background Plate -->
      <rect
        x="15"
        :y="staffCenterY - 3.8 * lineSpacing"
        width="330"
        :height="7.6 * lineSpacing"
        rx="16"
        class="fill-amber-50/40 stroke-amber-200/60"
        stroke-width="1.5"
      />

      <!-- 5 Staff Lines -->
      <g class="staff-lines">
        <line
          v-for="l in lines"
          :key="l.index"
          x1="30"
          :y1="l.y"
          x2="330"
          :y2="l.y"
          stroke="#475569"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </g>

      <!-- Clef Symbol -->
      <!-- Treble Clef (G-Clef) -->
      <g v-if="clef === 'treble'" transform="translate(42, 0)">
        <text
          x="12"
          :y="staffCenterY + 1.2 * lineSpacing"
          font-family="Georgia, serif"
          font-size="64"
          fill="#1e293b"
          class="font-black select-none pointer-events-none"
        >
          𝄞
        </text>
      </g>

      <!-- Bass Clef (F-Clef) -->
      <g v-else transform="translate(42, 0)">
        <text
          x="12"
          :y="staffCenterY + 0.6 * lineSpacing"
          font-family="Georgia, serif"
          font-size="52"
          fill="#1e293b"
          class="font-black select-none pointer-events-none"
        >
          𝄢
        </text>
      </g>

      <!-- Ledger Lines for Note -->
      <g v-if="activeNote && ledgerLines.length">
        <line
          v-for="(ll, i) in ledgerLines"
          :key="i"
          :x1="noteX - 18"
          :y1="ll.y"
          :x2="noteX + 18"
          :y2="ll.y"
          stroke="#334155"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>

      <!-- Active Note (Head & Stem) -->
      <g v-if="activeNote" class="transition-all duration-300 transform" filter="url(#noteGlow)">
        <!-- Note Stem -->
        <line
          :x1="stemDown ? noteX - 8 : noteX + 8"
          :y1="noteY"
          :x2="stemDown ? noteX - 8 : noteX + 8"
          :y2="stemDown ? noteY + 44 : noteY - 44"
          stroke="#1e1b4b"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- Note Head -->
        <ellipse
          :cx="noteX"
          :cy="noteY"
          rx="10"
          ry="7.5"
          transform="rotate(-20)"
          :transform-origin="`${noteX} ${noteY}`"
          fill="url(#noteGrad)"
        />

        <!-- Highlight Shine on note -->
        <ellipse
          :cx="noteX - 2.5"
          :cy="noteY - 2"
          rx="4.5"
          ry="2.2"
          transform="rotate(-20)"
          :transform-origin="`${noteX - 2.5} ${noteY - 2}`"
          fill="#818cf8"
          opacity="0.7"
        />
      </g>

      <!-- Landmark indicator if landmark -->
      <g v-if="activeNote?.isLandmark">
        <circle :cx="noteX + 22" :cy="noteY - 14" r="3.5" fill="#f59e0b" />
      </g>
    </svg>

    <!-- Interactive / Educational Position Label -->
    <div
      v-if="activeNote && showPositionBadge"
      class="mt-2.5 flex items-center justify-center gap-2 flex-wrap text-center"
    >
      <span class="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-2xs">
        📍 {{ activeNote.positionName }}
      </span>
      <span
        v-if="showNoteName"
        class="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
      >
        🎵 {{ activeNote.pitch }} · {{ activeNote.syllable }} ({{ activeNote.syllableZh }})
      </span>
      <span
        v-if="activeNote.isLandmark"
        class="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-200"
      >
        ⭐ 地标音
      </span>
    </div>
  </div>
</template>

