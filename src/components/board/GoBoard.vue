<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Point, StoneColor, ThemeType, BoardSize, StoneGroup } from '../../engine/types';
import { GoGame } from '../../engine/GoGame';
import { playStoneSound, playCaptureSound, playErrorSound } from '../../lib/audio';

const props = withDefaults(
  defineProps<{
    game: GoGame;
    readonly?: boolean;
    showLiberties?: boolean;
    boardSize?: BoardSize;
    showCoordinates?: boolean;
    showAtari?: boolean;
    showTerritory?: boolean;
    theme?: ThemeType;
    highlightPoints?: Point[];
    lastMove?: Point | null;
    sizePx?: number;
  }>(),
  {
    readonly: false,
    showLiberties: true,
    showCoordinates: true,
    showAtari: true,
    showTerritory: false,
    theme: 'wood',
    highlightPoints: () => [],
    lastMove: null,
    sizePx: 520
  }
);

const emit = defineEmits<{
  (e: 'move', point: Point, color: StoneColor): void;
  (e: 'capture', capturedStones: Point[]): void;
  (e: 'illegalMove', point: Point, reason: string): void;
  (e: 'selectStone', point: Point | null, group: StoneGroup | null): void;
}>();

const hoverPoint = ref<Point | null>(null);
const selectedStonePoint = ref<Point | null>(null);
const isShaking = ref(false);

const size = computed(() => props.game.size);

// Star points (Hoshi / 星位)
const starPoints = computed<Point[]>(() => {
  const s = size.value;
  if (s === 19) {
    return [
      { r: 3, c: 3 }, { r: 3, c: 9 }, { r: 3, c: 15 },
      { r: 9, c: 3 }, { r: 9, c: 9 }, { r: 9, c: 15 },
      { r: 15, c: 3 }, { r: 15, c: 9 }, { r: 15, c: 15 }
    ];
  }
  if (s === 13) {
    return [
      { r: 3, c: 3 }, { r: 3, c: 9 },
      { r: 6, c: 6 },
      { r: 9, c: 3 }, { r: 9, c: 9 }
    ];
  }
  if (s === 9) {
    return [
      { r: 2, c: 2 }, { r: 2, c: 6 },
      { r: 4, c: 4 },
      { r: 6, c: 2 }, { r: 6, c: 6 }
    ];
  }
  if (s === 7) {
    return [
      { r: 1, c: 1 }, { r: 1, c: 5 },
      { r: 3, c: 3 },
      { r: 5, c: 1 }, { r: 5, c: 5 }
    ];
  }
  if (s === 5) {
    return [{ r: 2, c: 2 }];
  }
  return [];
});

// External coordinates letters & numbers (A-J excluding I)
const columnLetters = computed(() => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  return letters.slice(0, size.value);
});

const rowNumbers = computed(() => {
  const res: number[] = [];
  for (let i = size.value; i >= 1; i--) {
    res.push(i);
  }
  return res;
});

// Calculate liberties for all groups
const libertiesMap = computed(() => {
  const map = new Map<string, number>();
  if (!props.showLiberties) return map;
  const groups = props.game.getAllGroups();
  for (const g of groups) {
    for (const st of g.stones) {
      map.set(`${st.r},${st.c}`, g.libertyCount);
    }
  }
  return map;
});

// Atari alert stones
const atariAlertPoints = computed<Set<string>>(() => {
  const set = new Set<string>();
  if (!props.showAtari) return set;
  const ataris = props.game.checkAtari();
  for (const at of ataris) {
    for (const st of at.group.stones) {
      set.add(`${st.r},${st.c}`);
    }
  }
  return set;
});

// Active selected stone liberties highlight
const activeSelectedLiberties = computed<Point[]>(() => {
  if (!selectedStonePoint.value) return [];
  return props.game.getLibertiesOf(selectedStonePoint.value.r, selectedStonePoint.value.c);
});

// Territory evaluation map
const territoryMap = computed(() => {
  if (!props.showTerritory) return null;
  return props.game.calculateScore().territoryMap;
});

// Trigger error vibration animation
const triggerShake = () => {
  isShaking.value = true;
  playErrorSound();
  setTimeout(() => {
    isShaking.value = false;
  }, 400);
};

// Check if move is the last move played
const isLastMovePoint = (r: number, c: number) => {
  if (props.lastMove) {
    return props.lastMove.r === r && props.lastMove.c === c;
  }
  const hist = props.game.history;
  if (hist.length > 0) {
    const last = hist[hist.length - 1];
    return last.point !== null && last.point.r === r && last.point.c === c;
  }
  return false;
};

// Handle Intersect Click
const handleCellClick = (r: number, c: number) => {
  if (props.readonly) return;

  const existingStone = props.game.getCell(r, c);

  // If clicking on an existing stone, toggle selection to show its liberties
  if (existingStone !== null) {
    if (selectedStonePoint.value && selectedStonePoint.value.r === r && selectedStonePoint.value.c === c) {
      selectedStonePoint.value = null;
      emit('selectStone', null, null);
    } else {
      selectedStonePoint.value = { r, c };
      const group = props.game.getGroup(r, c);
      emit('selectStone', { r, c }, group);
    }
    return;
  }

  // Clear selected stone upon placing a new move
  selectedStonePoint.value = null;

  const turnColor = props.game.turn;
  const check = props.game.isLegalMove(r, c, turnColor);

  if (!check.legal) {
    triggerShake();
    emit('illegalMove', { r, c }, check.reason || '非法禁着点');
    return;
  }

  // Play move on GoGame state machine
  const res = props.game.playMove(r, c, turnColor);
  if (res.success) {
    playStoneSound();
    emit('move', { r, c }, turnColor);

    if (res.capturedStones.length > 0) {
      playCaptureSound();
      emit('capture', res.capturedStones);
    }
  }
};

const handleCellEnter = (r: number, c: number) => {
  if (props.readonly) return;
  hoverPoint.value = { r, c };
};

const handleCellLeave = () => {
  hoverPoint.value = null;
};

// Theme styles
const themeContainerClass = computed(() => {
  switch (props.theme) {
    case 'candy':
      return 'bg-[#FFF0F5] border-[#F472B6] shadow-[0_15px_30px_-5px_rgba(244,114,182,0.3)]';
    case 'neon':
      return 'bg-[#0B1120] border-[#38BDF8] shadow-[0_15px_30px_-5px_rgba(56,189,248,0.35)]';
    case 'jade':
      return 'bg-[#ECFDF5] border-[#10B981] shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)]';
    case 'wood':
    default:
      return 'wood-pattern border-[#B47B36] shadow-[0_20px_35px_-10px_rgba(99,59,13,0.35)]';
  }
});

const gridLineColor = computed(() => {
  switch (props.theme) {
    case 'candy':
      return '#F472B6';
    case 'neon':
      return '#38BDF8';
    case 'jade':
      return '#059669';
    case 'wood':
    default:
      return '#6B3E11';
  }
});

const coordTextColor = computed(() => {
  switch (props.theme) {
    case 'candy':
      return 'text-pink-600';
    case 'neon':
      return 'text-cyan-400';
    case 'jade':
      return 'text-emerald-700';
    case 'wood':
    default:
      return 'text-[#7C4A19]';
  }
});
</script>

<template>
  <div
    class="relative rounded-3xl p-3 sm:p-6 border-4 sm:border-[6px] transition-all select-none mx-auto max-w-full"
    :class="[themeContainerClass, { 'animate-shake': isShaking }]"
    :style="{ width: `min(100%, ${sizePx}px)` }"
  >
    <!-- Top Coordinates (Letters) -->
    <div
      v-if="showCoordinates"
      class="grid grid-flow-col text-center font-black text-[10px] sm:text-xs mb-1.5 px-4"
      :class="coordTextColor"
      :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }"
    >
      <span v-for="letter in columnLetters" :key="letter">{{ letter }}</span>
    </div>

    <!-- Main Board Area with Left/Right Row Numbers -->
    <div class="flex items-center">
      <!-- Left Coordinates (Numbers) -->
      <div
        v-if="showCoordinates"
        class="flex flex-col justify-around h-full text-center font-black text-[10px] sm:text-xs mr-1.5 w-4"
        :class="coordTextColor"
      >
        <span v-for="num in rowNumbers" :key="num">{{ num }}</span>
      </div>

      <!-- SVG Board Grid & Stone Overlay -->
      <div class="relative w-full aspect-square cursor-pointer touch-manipulation">
        <svg
          class="w-full h-full overflow-visible"
          :viewBox="`0 0 ${size * 100} ${size * 100}`"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Defs for Stone Gradients & Shadows -->
          <defs>
            <!-- 3D Black Stone Radial Gradient -->
            <radialGradient id="blackStoneGrad" cx="35%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#4A5568" />
              <stop offset="35%" stop-color="#1A202C" />
              <stop offset="100%" stop-color="#090D14" />
            </radialGradient>

            <!-- 3D White Stone Radial Gradient -->
            <radialGradient id="whiteStoneGrad" cx="32%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="65%" stop-color="#F1F5F9" />
              <stop offset="100%" stop-color="#CBD5E1" />
            </radialGradient>

            <!-- Tactile Stone Drop Shadow -->
            <filter id="stoneShadow" x="-25%" y="-25%" width="155%" height="155%">
              <feDropShadow dx="3.5" dy="5.5" stdDeviation="4.5" flood-opacity="0.45" />
            </filter>

            <!-- Pulsing Red Aura for Atari Stones -->
            <filter id="atariGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          <!-- Board Grid Lines -->
          <g :stroke="gridLineColor" stroke-width="2.5" stroke-linecap="round">
            <!-- Horizontal Lines -->
            <line
              v-for="r in size"
              :key="`h-${r}`"
              :x1="50"
              :y1="(r - 1) * 100 + 50"
              :x2="(size - 1) * 100 + 50"
              :y2="(r - 1) * 100 + 50"
            />
            <!-- Vertical Lines -->
            <line
              v-for="c in size"
              :key="`v-${c}`"
              :x1="(c - 1) * 100 + 50"
              :y1="50"
              :x2="(c - 1) * 100 + 50"
              :y2="(size - 1) * 100 + 50"
            />
          </g>

          <!-- Star Points (Hoshi) -->
          <g :fill="gridLineColor">
            <circle
              v-for="sp in starPoints"
              :key="`star-${sp.r}-${sp.c}`"
              :cx="sp.c * 100 + 50"
              :cy="sp.r * 100 + 50"
              r="6.5"
            />
          </g>

          <!-- Territory Shading Overlay -->
          <g v-if="showTerritory && territoryMap">
            <template v-for="r in size" :key="`terr-r-${r}`">
              <template v-for="c in size" :key="`terr-c-${c}`">
                <rect
                  v-if="territoryMap[r - 1][c - 1] === 'B'"
                  :x="(c - 1) * 100 + 25"
                  :y="(r - 1) * 100 + 25"
                  width="50"
                  height="50"
                  rx="10"
                  fill="#1E293B"
                  fill-opacity="0.45"
                  stroke="#000000"
                  stroke-width="1.5"
                />
                <rect
                  v-else-if="territoryMap[r - 1][c - 1] === 'W'"
                  :x="(c - 1) * 100 + 25"
                  :y="(r - 1) * 100 + 25"
                  width="50"
                  height="50"
                  rx="10"
                  fill="#F8FAFC"
                  fill-opacity="0.75"
                  stroke="#64748B"
                  stroke-width="1.5"
                />
              </template>
            </template>
          </g>

          <!-- External Highlight / Hint Target Indicators -->
          <g>
            <template v-for="p in highlightPoints" :key="`hl-${p.r}-${p.c}`">
              <circle
                :cx="p.c * 100 + 50"
                :cy="p.r * 100 + 50"
                r="38"
                fill="#FFD43B"
                fill-opacity="0.3"
                stroke="#FAB005"
                stroke-width="4"
                stroke-dasharray="6,4"
                class="animate-pulse-fast"
              />
              <circle
                :cx="p.c * 100 + 50"
                :cy="p.r * 100 + 50"
                r="10"
                fill="#F59F00"
              />
            </template>
          </g>

          <!-- Selected Stone's Adjacent Active Liberties Dots -->
          <g v-if="activeSelectedLiberties.length > 0">
            <template v-for="lp in activeSelectedLiberties" :key="`lib-${lp.r}-${lp.c}`">
              <circle
                :cx="lp.c * 100 + 50"
                :cy="lp.r * 100 + 50"
                r="18"
                fill="#10B981"
                fill-opacity="0.6"
                stroke="#047857"
                stroke-width="2.5"
                class="animate-ping-once"
              />
              <circle
                :cx="lp.c * 100 + 50"
                :cy="lp.r * 100 + 50"
                r="7"
                fill="#FFFFFF"
              />
            </template>
          </g>

          <!-- Stones on Board -->
          <g>
            <template v-for="r in size" :key="`stone-r-${r}`">
              <template v-for="c in size" :key="`stone-c-${c}`">
                <g
                  v-if="game.getCell(r - 1, c - 1) !== null"
                  :transform="`translate(${(c - 1) * 100 + 50}, ${(r - 1) * 100 + 50})`"
                  class="transition-transform duration-150"
                >
                  <!-- Atari Pulsing Aura Ring (叫吃呼吸红光) -->
                  <circle
                    v-if="atariAlertPoints.has(`${r - 1},${c - 1}`)"
                    cx="0"
                    cy="0"
                    r="48"
                    fill="none"
                    stroke="#EF4444"
                    stroke-width="4"
                    stroke-dasharray="6,4"
                    class="animate-pulse-fast"
                  />

                  <!-- Selected Stone Ring Indicator -->
                  <circle
                    v-if="selectedStonePoint && selectedStonePoint.r === r - 1 && selectedStonePoint.c === c - 1"
                    cx="0"
                    cy="0"
                    r="47"
                    fill="none"
                    stroke="#10B981"
                    stroke-width="4"
                  />

                  <!-- Black Stone -->
                  <circle
                    v-if="game.getCell(r - 1, c - 1) === 'B'"
                    cx="0"
                    cy="0"
                    r="44"
                    fill="url(#blackStoneGrad)"
                    filter="url(#stoneShadow)"
                  />

                  <!-- White Stone -->
                  <circle
                    v-else-if="game.getCell(r - 1, c - 1) === 'W'"
                    cx="0"
                    cy="0"
                    r="44"
                    fill="url(#whiteStoneGrad)"
                    filter="url(#stoneShadow)"
                    stroke="#E2E8F0"
                    stroke-width="1.5"
                  />

                  <!-- Last Move Marker (最后一手标记: 小红点/发光圆环) -->
                  <g v-if="isLastMovePoint(r - 1, c - 1)">
                    <circle
                      cx="0"
                      cy="0"
                      r="13"
                      :fill="game.getCell(r - 1, c - 1) === 'B' ? '#FF6B6B' : '#3B82F6'"
                      stroke="#FFFFFF"
                      stroke-width="2.5"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="5"
                      fill="#FFFFFF"
                    />
                  </g>

                  <!-- Atari Danger Flame Badge -->
                  <g v-if="atariAlertPoints.has(`${r - 1},${c - 1}`)">
                    <circle
                      cx="25"
                      cy="-25"
                      r="16"
                      fill="#DC2626"
                      stroke="#FFFFFF"
                      stroke-width="2.5"
                      class="shadow"
                    />
                    <text
                      x="25"
                      y="-20"
                      text-anchor="middle"
                      fill="#FFFFFF"
                      font-size="14"
                      font-weight="900"
                    >
                      !
                    </text>
                  </g>

                  <!-- Liberty Count Text Badge -->
                  <text
                    v-if="showLiberties && libertiesMap.has(`${r - 1},${c - 1}`)"
                    cx="0"
                    cy="0"
                    x="0"
                    y="7"
                    text-anchor="middle"
                    :fill="game.getCell(r - 1, c - 1) === 'B' ? '#FFD43B' : '#1E293B'"
                    font-size="22"
                    font-weight="900"
                    font-family="sans-serif"
                    class="pointer-events-none"
                  >
                    {{ libertiesMap.get(`${r - 1},${c - 1}`) }}
                  </text>
                </g>
              </template>
            </template>
          </g>

          <!-- Hover Ghost Stone Preview (悬浮虚影) -->
          <g
            v-if="
              !readonly &&
              hoverPoint &&
              game.getCell(hoverPoint.r, hoverPoint.c) === null &&
              game.isLegalMove(hoverPoint.r, hoverPoint.c, game.turn).legal
            "
            :transform="`translate(${hoverPoint.c * 100 + 50}, ${hoverPoint.r * 100 + 50})`"
            opacity="0.6"
            class="pointer-events-none"
          >
            <circle
              cx="0"
              cy="0"
              r="43"
              :fill="game.turn === 'B' ? '#1E293B' : '#FFFFFF'"
              stroke="#F59E0B"
              stroke-width="3"
              stroke-dasharray="6,4"
            />
          </g>

          <!-- Interactive Click Target Hitboxes -->
          <g v-if="!readonly">
            <template v-for="r in size" :key="`hitbox-r-${r}`">
              <template v-for="c in size" :key="`hitbox-c-${c}`">
                <rect
                  :x="(c - 1) * 100"
                  :y="(r - 1) * 100"
                  width="100"
                  height="100"
                  fill="transparent"
                  class="cursor-pointer"
                  @click="handleCellClick(r - 1, c - 1)"
                  @mouseenter="handleCellEnter(r - 1, c - 1)"
                  @mouseleave="handleCellLeave"
                />
              </template>
            </template>
          </g>
        </svg>
      </div>

      <!-- Right Coordinates (Numbers) -->
      <div
        v-if="showCoordinates"
        class="flex flex-col justify-around h-full text-center font-black text-[10px] sm:text-xs ml-1.5 w-4"
        :class="coordTextColor"
      >
        <span v-for="num in rowNumbers" :key="num">{{ num }}</span>
      </div>
    </div>

    <!-- Bottom Coordinates (Letters) -->
    <div
      v-if="showCoordinates"
      class="grid grid-flow-col text-center font-black text-[10px] sm:text-xs mt-1.5 px-4"
      :class="coordTextColor"
      :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }"
    >
      <span v-for="letter in columnLetters" :key="letter">{{ letter }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px) rotate(-0.5deg); }
  40%, 80% { transform: translateX(6px) rotate(0.5deg); }
}

.animate-shake {
  animation: shake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes pingOnce {
  0% { transform: scale(0.6); opacity: 0; }
  50% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: 0.6; }
}

.animate-ping-once {
  animation: pingOnce 0.3s cubic-bezier(0, 0, 0.2, 1);
}
</style>

