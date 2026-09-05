<script setup lang="ts">
import { computed } from 'vue';
import {
  XIANGQI_COLS,
  XIANGQI_LABEL,
  XIANGQI_ROWS,
  type XiangqiBoard,
  type XiangqiLegalMove,
  type XiangqiSide
} from '../../engine/xiangqi/xiangqiEngine';

const CELL_SIZE = 56;
const BOARD_PADDING = 48;
const BOARD_W = BOARD_PADDING * 2 + CELL_SIZE * (XIANGQI_COLS - 1);
const BOARD_H = BOARD_PADDING * 2 + CELL_SIZE * (XIANGQI_ROWS - 1);

const props = withDefaults(
  defineProps<{
    board: XiangqiBoard;
    selected?: { r: number; c: number } | null;
    lastMove?: { fromR: number; fromC: number; toR: number; toC: number } | null;
    legalTargets?: XiangqiLegalMove[];
    hintMove?: { toR: number; toC: number } | null;
    highlights?: { r: number; c: number }[];
    blockedHighlights?: { r: number; c: number }[];
    checkedKing?: { r: number; c: number } | null;
    disabled?: boolean;
  }>(),
  {
    selected: null,
    lastMove: null,
    legalTargets: () => [],
    hintMove: null,
    highlights: () => [],
    blockedHighlights: () => [],
    checkedKing: null,
    disabled: false
  }
);

const emit = defineEmits<{
  pointClick: [r: number, c: number];
}>();

const getSvgCoord = (r: number, c: number) => ({
  cx: BOARD_PADDING + c * CELL_SIZE,
  cy: BOARD_PADDING + r * CELL_SIZE
});

const pieceEntries = computed(() => {
  const list: { r: number; c: number; key: string; label: string; side: XiangqiSide }[] = [];
  for (let r = 0; r < XIANGQI_ROWS; r++) {
    for (let c = 0; c < XIANGQI_COLS; c++) {
      const cell = props.board[r]?.[c];
      if (!cell) continue;
      list.push({
        r,
        c,
        key: `${r}_${c}_${cell.side}_${cell.type}`,
        label: XIANGQI_LABEL[cell.side][cell.type],
        side: cell.side
      });
    }
  }
  return list;
});

const palaceLines = [
  { x1: getSvgCoord(0, 3).cx, y1: getSvgCoord(0, 3).cy, x2: getSvgCoord(2, 5).cx, y2: getSvgCoord(2, 5).cy },
  { x1: getSvgCoord(0, 5).cx, y1: getSvgCoord(0, 5).cy, x2: getSvgCoord(2, 3).cx, y2: getSvgCoord(2, 3).cy },
  { x1: getSvgCoord(7, 3).cx, y1: getSvgCoord(7, 3).cy, x2: getSvgCoord(9, 5).cx, y2: getSvgCoord(9, 5).cy },
  { x1: getSvgCoord(7, 5).cx, y1: getSvgCoord(7, 5).cy, x2: getSvgCoord(9, 3).cx, y2: getSvgCoord(9, 3).cy }
];

const handleSvgBoardClick = (e: MouseEvent) => {
  if (props.disabled) return;
  const svg = e.currentTarget as SVGSVGElement;
  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const loc = pt.matrixTransform(ctm.inverse());
  const c = Math.round((loc.x - BOARD_PADDING) / CELL_SIZE);
  const r = Math.round((loc.y - BOARD_PADDING) / CELL_SIZE);
  if (r < 0 || r >= XIANGQI_ROWS || c < 0 || c >= XIANGQI_COLS) return;
  emit('pointClick', r, c);
};
</script>

<template>
  <svg
    :viewBox="'0 0 ' + BOARD_W + ' ' + BOARD_H"
    class="w-full h-auto select-none rounded-2xl drop-shadow-md"
    :class="disabled ? 'cursor-default' : 'cursor-pointer'"
    @click="handleSvgBoardClick"
  >
    <rect x="0" y="0" :width="BOARD_W" :height="BOARD_H" rx="16" fill="#e8b86d" stroke="#7c2d12" stroke-width="5" />
    <rect x="10" y="10" :width="BOARD_W - 20" :height="BOARD_H - 20" rx="8" fill="none" stroke="#9a3412" stroke-width="1.5" stroke-opacity="0.45" />

    <rect
      :x="BOARD_PADDING"
      :y="getSvgCoord(4, 0).cy"
      :width="CELL_SIZE * 8"
      :height="CELL_SIZE"
      fill="#f3d19a"
    />
    <text
      :x="getSvgCoord(4, 2).cx"
      :y="(getSvgCoord(4, 0).cy + getSvgCoord(5, 0).cy) / 2 + 6"
      text-anchor="middle"
      fill="#9a3412"
      font-size="22"
      font-weight="900"
      font-family="serif"
    >楚 河</text>
    <text
      :x="getSvgCoord(4, 6).cx"
      :y="(getSvgCoord(4, 0).cy + getSvgCoord(5, 0).cy) / 2 + 6"
      text-anchor="middle"
      fill="#9a3412"
      font-size="22"
      font-weight="900"
      font-family="serif"
    >汉 界</text>

    <g stroke="#7c2d12" stroke-width="1.6" fill="none">
      <line
        v-for="r in XIANGQI_ROWS"
        :key="'h_' + r"
        :x1="BOARD_PADDING"
        :y1="BOARD_PADDING + (r - 1) * CELL_SIZE"
        :x2="BOARD_W - BOARD_PADDING"
        :y2="BOARD_PADDING + (r - 1) * CELL_SIZE"
      />
      <template v-for="c in XIANGQI_COLS" :key="'v_' + c">
        <line
          :x1="BOARD_PADDING + (c - 1) * CELL_SIZE"
          :y1="BOARD_PADDING"
          :x2="BOARD_PADDING + (c - 1) * CELL_SIZE"
          :y2="getSvgCoord(4, 0).cy"
        />
        <line
          :x1="BOARD_PADDING + (c - 1) * CELL_SIZE"
          :y1="getSvgCoord(5, 0).cy"
          :x2="BOARD_PADDING + (c - 1) * CELL_SIZE"
          :y2="BOARD_H - BOARD_PADDING"
        />
      </template>
      <line :x1="BOARD_PADDING" :y1="getSvgCoord(4, 0).cy" :x2="BOARD_PADDING" :y2="getSvgCoord(5, 0).cy" />
      <line :x1="BOARD_W - BOARD_PADDING" :y1="getSvgCoord(4, 0).cy" :x2="BOARD_W - BOARD_PADDING" :y2="getSvgCoord(5, 0).cy" />
      <line
        v-for="(line, idx) in palaceLines"
        :key="'palace_' + idx"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
      />
    </g>

    <g v-for="(pt, idx) in highlights" :key="'hl_' + idx" fill="#38bdf8" fill-opacity="0.32" pointer-events="none">
      <circle
        :cx="getSvgCoord(pt.r, pt.c).cx"
        :cy="getSvgCoord(pt.r, pt.c).cy"
        r="26"
        fill="none"
        stroke="#0284c7"
        stroke-width="3"
        class="animate-pulse"
      />
      <circle :cx="getSvgCoord(pt.r, pt.c).cx" :cy="getSvgCoord(pt.r, pt.c).cy" r="22" />
    </g>

    <g v-for="(pt, idx) in blockedHighlights" :key="'blk_' + idx" pointer-events="none">
      <circle
        :cx="getSvgCoord(pt.r, pt.c).cx"
        :cy="getSvgCoord(pt.r, pt.c).cy"
        r="22"
        fill="#ef4444"
        fill-opacity="0.16"
        stroke="#dc2626"
        stroke-width="3"
        stroke-dasharray="5 4"
      />
      <text
        :x="getSvgCoord(pt.r, pt.c).cx"
        :y="getSvgCoord(pt.r, pt.c).cy + 6"
        text-anchor="middle"
        fill="#b91c1c"
        font-size="18"
        font-weight="900"
      >×</text>
    </g>

    <g v-if="lastMove" fill="#f59e0b" fill-opacity="0.28">
      <circle :cx="getSvgCoord(lastMove.fromR, lastMove.fromC).cx" :cy="getSvgCoord(lastMove.fromR, lastMove.fromC).cy" r="22" />
      <circle :cx="getSvgCoord(lastMove.toR, lastMove.toC).cx" :cy="getSvgCoord(lastMove.toR, lastMove.toC).cy" r="22" />
    </g>

    <g v-if="selected">
      <circle
        :cx="getSvgCoord(selected.r, selected.c).cx"
        :cy="getSvgCoord(selected.r, selected.c).cy"
        r="24"
        fill="none"
        stroke="#2563eb"
        stroke-width="3"
      />
    </g>

    <g v-for="target in legalTargets" :key="'t_' + target.toR + '_' + target.toC">
      <circle
        v-if="!target.captured"
        :cx="getSvgCoord(target.toR, target.toC).cx"
        :cy="getSvgCoord(target.toR, target.toC).cy"
        r="7"
        fill="#16a34a"
        fill-opacity="0.85"
      />
      <circle
        v-else
        :cx="getSvgCoord(target.toR, target.toC).cx"
        :cy="getSvgCoord(target.toR, target.toC).cy"
        r="22"
        fill="none"
        stroke="#dc2626"
        stroke-width="3"
      />
    </g>

    <g v-if="hintMove">
      <circle
        :cx="getSvgCoord(hintMove.toR, hintMove.toC).cx"
        :cy="getSvgCoord(hintMove.toR, hintMove.toC).cy"
        r="26"
        fill="none"
        stroke="#f59e0b"
        stroke-width="3"
        stroke-dasharray="6 4"
      />
    </g>

    <g v-if="checkedKing">
      <circle
        :cx="getSvgCoord(checkedKing.r, checkedKing.c).cx"
        :cy="getSvgCoord(checkedKing.r, checkedKing.c).cy"
        r="26"
        fill="none"
        stroke="#ef4444"
        stroke-width="3"
        class="animate-pulse"
      />
    </g>

    <g>
      <g
        v-for="item in pieceEntries"
        :key="item.key"
        :transform="'translate(' + getSvgCoord(item.r, item.c).cx + ', ' + getSvgCoord(item.r, item.c).cy + ')'"
      >
        <circle cx="2" cy="3" r="21" fill="#000000" fill-opacity="0.22" />
        <circle
          cx="0"
          cy="0"
          r="21"
          :fill="item.side === 'red' ? '#fff7ed' : '#1e293b'"
          :stroke="item.side === 'red' ? '#b45309' : '#0f172a'"
          stroke-width="2.4"
        />
        <circle
          cx="0"
          cy="0"
          r="16.5"
          fill="none"
          :stroke="item.side === 'red' ? '#dc2626' : '#94a3b8'"
          stroke-width="1.2"
        />
        <text
          x="0"
          y="7"
          text-anchor="middle"
          font-size="20"
          font-weight="900"
          font-family="serif"
          :fill="item.side === 'red' ? '#b91c1c' : '#f8fafc'"
        >{{ item.label }}</text>
      </g>
    </g>
  </svg>
</template>
