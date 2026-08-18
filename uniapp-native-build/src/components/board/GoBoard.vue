<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Point, StoneColor, ThemeType, BoardSize, StoneGroup } from '../../engine/types';
import { GoGame } from '../../engine/GoGame';
import { useUserStore } from '../../stores/useUserStore';
import { playStoneSound, playCaptureSound, playErrorSound, playButtonSound } from '../../lib/audio';

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
    manualMove?: boolean;
    editMode?: 'B' | 'W' | 'empty' | null;
    confirmTouch?: boolean;
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
    sizePx: 520,
    manualMove: false,
    editMode: null,
    confirmTouch: undefined
  }
);

const emit = defineEmits<{
  (e: 'move', point: Point, color: StoneColor): void;
  (e: 'play', point: Point): void;
  (e: 'capture', capturedStones: Point[]): void;
  (e: 'illegalMove', point: Point, reason: string): void;
  (e: 'selectStone', point: Point | null, group: StoneGroup | null): void;
}>();

const userStore = useUserStore();

const hoverPoint = ref<Point | null>(null);
const selectedStonePoint = ref<Point | null>(null);
const pendingConfirmPoint = ref<Point | null>(null);
const isShaking = ref(false);

const isTouchConfirmActive = computed(() => {
  return props.confirmTouch ?? userStore.touchConfirmEnabled;
});


const boardVersion = ref(0);

const size = computed(() => props.game?.size || 9);

// 100% Guaranteed Reactive Stone List calculation
const renderedStones = computed(() => {
  void boardVersion.value;
  void props.lastMove;
  void props.game?.version;
  void props.game?.history?.length;
  const s = size.value;
  const list: { r: number; c: number; color: StoneColor }[] = [];
  if (!props.game) return list;

  for (let r = 0; r < s; r++) {
    for (let c = 0; c < s; c++) {
      const cell = props.game.getCell(r, c);
      if (cell !== null) {
        list.push({ r, c, color: cell });
      }
    }
  }
  return list;
});

// Watch for any external game mutations, moves, passes, resets
watch(
  () => [props.game, props.game?.version, props.lastMove, props.game?.history?.length, props.editMode],
  () => {
    boardVersion.value++;
  },
  { deep: true, immediate: true }
);

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

// External coordinates letters & numbers (A-T excluding I)
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
  if (!props.showLiberties || !props.game) return map;
  void boardVersion.value;
  void props.game?.version;
  const groups = props.game.getAllGroups();
  for (const g of groups) {
    for (const st of g.stones) {
      map.set(st.r + ',' + st.c, g.libertyCount);
    }
  }
  return map;
});

// Atari alert stones
const atariAlertPoints = computed<Set<string>>(() => {
  const set = new Set<string>();
  if (!props.showAtari || !props.game) return set;
  void boardVersion.value;
  void props.game?.version;
  const ataris = props.game.checkAtari();
  for (const at of ataris) {
    for (const st of at.group.stones) {
      set.add(st.r + ',' + st.c);
    }
  }
  return set;
});

// Active selected stone liberties highlight
const activeSelectedLiberties = computed<Point[]>(() => {
  if (!selectedStonePoint.value || !props.game) return [];
  void boardVersion.value;
  return props.game.getLibertiesOf(selectedStonePoint.value.r, selectedStonePoint.value.c);
});

// Territory evaluation map
const territoryMap = computed(() => {
  if (!props.showTerritory || !props.game) return null;
  void boardVersion.value;
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
  const hist = props.game?.history;
  if (hist && hist.length > 0) {
    const last = hist[hist.length - 1];
    return last.point !== null && last.point.r === r && last.point.c === c;
  }
  return false;
};

// Global Board Click Interceptor
const handleBoardContainerClick = (e: MouseEvent) => {
  if (!userStore.hasProfile) {
    e.stopPropagation();
    e.preventDefault();
    userStore.openProfileModal();
  }
};

// Handle Intersect Click
const handleCellClick = (r: number, c: number) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }

  if (props.readonly || !props.game) return;

  // Handle Edit Mode (placing Black, White, or Erasing directly)
  if (props.editMode) {
    if (props.editMode === 'empty') {
      props.game.setCell(r, c, null);
    } else {
      props.game.setCell(r, c, props.editMode);
    }
    boardVersion.value++;
    playStoneSound();
    emit('play', { r, c });
    emit('move', { r, c }, props.editMode === 'empty' ? 'B' : props.editMode);
    return;
  }

  const existingStone = props.game.getCell(r, c);

  // If clicking on an existing stone, toggle selection to show its liberties
  if (existingStone !== null) {
    pendingConfirmPoint.value = null;
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

  // Touch confirm check: first tap selects, second tap on same spot confirms
  if (isTouchConfirmActive.value && (!pendingConfirmPoint.value || pendingConfirmPoint.value.r !== r || pendingConfirmPoint.value.c !== c)) {
    pendingConfirmPoint.value = { r, c };
    playButtonSound();
    return;
  }

  pendingConfirmPoint.value = null;
  executeMove(r, c);
};

const executeMove = (r: number, c: number) => {
  // Handle Manual Mode (parent view controls move logic)
  if (props.manualMove) {
    emit('play', { r, c });
    emit('move', { r, c }, props.game.turn);
    boardVersion.value++;
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
    boardVersion.value++;
    playStoneSound();
    emit('move', { r, c }, turnColor);
    emit('play', { r, c });

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
    case 'galaxy':
      return 'bg-[#180C2E] border-[#A855F7] shadow-[0_15px_30px_-5px_rgba(168,85,247,0.35)]';
    case 'forest':
      return 'bg-[#F0FDF4] border-[#22C55E] shadow-[0_15px_30px_-5px_rgba(34,197,94,0.3)]';
    case 'gold':
      return 'bg-[#FFFBEB] border-[#F59E0B] shadow-[0_15px_30px_-5px_rgba(245,158,11,0.35)]';
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
    case 'galaxy':
      return '#C084FC';
    case 'forest':
      return '#15803D';
    case 'gold':
      return '#B45309';
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
    case 'galaxy':
      return 'text-purple-300';
    case 'forest':
      return 'text-emerald-800';
    case 'gold':
      return 'text-amber-800';
    case 'wood':
    default:
      return 'text-[#7C4A19]';
  }
});
</script>

<template>
  <div
    class="relative rounded-3xl p-3 sm:p-6 border-4 sm:border-[6px] transition-all select-none mx-auto max-w-full cursor-pointer"
    :class="[themeContainerClass, { 'animate-shake': isShaking }]"
    :style="{ width: 'min(100%, ' + sizePx + 'px)' }"
    @click.capture="handleBoardContainerClick"
  >

    <!-- Top Coordinates (Letters) -->
    <div
      v-if="showCoordinates"
      class="grid grid-flow-col text-center font-black text-[9px] sm:text-xs mb-1.5 px-3 sm:px-4"
      :class="coordTextColor"
      :style="{ gridTemplateColumns: 'repeat(' + size + ', 1fr)' }"
    >
      <span v-for="letter in columnLetters" :key="letter">{{ letter }}</span>
    </div>

    <!-- Main Board Area with Left/Right Row Numbers -->
    <div class="flex items-center">
      <!-- Left Coordinates (Numbers) -->
      <div
        v-if="showCoordinates"
        class="flex flex-col justify-around h-full text-center font-black text-[9px] sm:text-xs mr-1 sm:mr-1.5 w-3 sm:w-4"
        :class="coordTextColor"
      >
        <span v-for="num in rowNumbers" :key="num">{{ num }}</span>
      </div>

      <!-- SVG Board Grid & Stone Overlay -->
      <div class="relative w-full aspect-square cursor-pointer touch-manipulation">
        <svg
          class="w-full h-full overflow-visible"
          :viewBox="'0 0 ' + (size * 100) + ' ' + (size * 100)"
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
              :key="'h-' + r"
              :x1="50"
              :y1="(r - 1) * 100 + 50"
              :x2="(size - 1) * 100 + 50"
              :y2="(r - 1) * 100 + 50"
            />
            <!-- Vertical Lines -->
            <line
              v-for="c in size"
              :key="'v-' + c"
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
              :key="'star-' + sp.r + '-' + sp.c"
              :cx="sp.c * 100 + 50"
              :cy="sp.r * 100 + 50"
              :r="size >= 13 ? 7.5 : 6.5"
            />
          </g>

          <!-- Territory Shading Overlay -->
          <g v-if="showTerritory && territoryMap">
            <template v-for="r in size" :key="'terr-r-' + r">
              <template v-for="c in size" :key="'terr-c-' + c">
                <rect
                  v-if="territoryMap[r - 1] && territoryMap[r - 1][c - 1] === 'B'"
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
                  v-else-if="territoryMap[r - 1] && territoryMap[r - 1][c - 1] === 'W'"
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
            <template v-for="p in highlightPoints" :key="'hl-' + p.r + '-' + p.c">
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
            <template v-for="lp in activeSelectedLiberties" :key="'lib-' + lp.r + '-' + lp.c">
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

          <!-- Stones on Board (100% Reactive renderedStones) -->
          <g>
            <template v-for="stone in renderedStones" :key="'stone-' + stone.r + '-' + stone.c + '-' + stone.color + '-' + boardVersion">
              <g
                :transform="'translate(' + (stone.c * 100 + 50) + ', ' + (stone.r * 100 + 50) + ')'"
                class="transition-transform duration-150"
                pointer-events="none"
              >
                <!-- Atari Pulsing Aura Ring (叫吃呼吸红光) -->
                <circle
                  v-if="atariAlertPoints.has(stone.r + ',' + stone.c)"
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
                  v-if="selectedStonePoint && selectedStonePoint.r === stone.r && selectedStonePoint.c === stone.c"
                  cx="0"
                  cy="0"
                  r="47"
                  fill="none"
                  stroke="#10B981"
                  stroke-width="4"
                />

                <!-- Black Stone -->
                <circle
                  v-if="stone.color === 'B'"
                  cx="0"
                  cy="0"
                  r="44"
                  fill="url(#blackStoneGrad)"
                  filter="url(#stoneShadow)"
                />

                <!-- White Stone -->
                <circle
                  v-else-if="stone.color === 'W'"
                  cx="0"
                  cy="0"
                  r="44"
                  fill="url(#whiteStoneGrad)"
                  filter="url(#stoneShadow)"
                  stroke="#E2E8F0"
                  stroke-width="1.5"
                />

                <!-- Last Move Marker (最后一手标记) -->
                <g v-if="isLastMovePoint(stone.r, stone.c)">
                  <circle
                    cx="0"
                    cy="0"
                    r="13"
                    :fill="stone.color === 'B' ? '#FF6B6B' : '#3B82F6'"
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
                <g v-if="atariAlertPoints.has(stone.r + ',' + stone.c)">
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
                  v-if="showLiberties && libertiesMap.has(stone.r + ',' + stone.c)"
                  cx="0"
                  cy="0"
                  x="0"
                  y="7"
                  text-anchor="middle"
                  :fill="stone.color === 'B' ? '#FFD43B' : '#1E293B'"
                  :font-size="size >= 13 ? 24 : 22"
                  font-weight="900"
                  font-family="sans-serif"
                  class="pointer-events-none"
                >
                  {{ libertiesMap.get(stone.r + ',' + stone.c) }}
                </text>
              </g>
            </template>
          </g>

          <!-- Hover Ghost Stone Preview (悬浮虚影) -->
          <g
            v-if="
              !readonly &&
              hoverPoint &&
              game?.getCell(hoverPoint.r, hoverPoint.c) === null &&
              game?.isLegalMove(hoverPoint.r, hoverPoint.c, game.turn).legal
            "
            :transform="'translate(' + (hoverPoint.c * 100 + 50) + ', ' + (hoverPoint.r * 100 + 50) + ')'"
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
          <g>
            <template v-for="r in size" :key="'hitbox-r-' + r">
              <template v-for="c in size" :key="'hitbox-c-' + c">
                <rect
                  :x="(c - 1) * 100"
                  :y="(r - 1) * 100"
                  width="100"
                  height="100"
                  fill="#FFFFFF"
                  fill-opacity="0.001"
                  pointer-events="all"
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
        class="flex flex-col justify-around h-full text-center font-black text-[9px] sm:text-xs ml-1 sm:ml-1.5 w-3 sm:w-4"
        :class="coordTextColor"
      >
        <span v-for="num in rowNumbers" :key="num">{{ num }}</span>
      </div>
    </div>

    <!-- Bottom Coordinates (Letters) -->
    <div
      v-if="showCoordinates"
      class="grid grid-flow-col text-center font-black text-[9px] sm:text-xs mt-1.5 px-3 sm:px-4"
      :class="coordTextColor"
      :style="{ gridTemplateColumns: 'repeat(' + size + ', 1fr)' }"
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
