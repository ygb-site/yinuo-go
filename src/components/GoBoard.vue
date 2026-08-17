<script setup lang="ts">
import { computed } from 'vue';
import GoBoard from './board/GoBoard.vue';
import type { Point, StoneColor, ThemeType, BoardSize, StoneGroup } from '../engine/types';
import { GoGame } from '../engine/GoGame';

const props = withDefaults(
  defineProps<{
    board?: GoGame;
    game?: GoGame;
    readonly?: boolean;
    interactive?: boolean;
    playerColor?: StoneColor;
    lastMove?: Point | null;
    showLiberties?: boolean;
    showAtari?: boolean;
    showCoordinates?: boolean;
    showTerritory?: boolean;
    highlightPoints?: Point[];
    theme?: ThemeType;
    boardSize?: BoardSize;
    sizePx?: number;
    disabled?: boolean;
    manualMove?: boolean;
    editMode?: 'B' | 'W' | 'empty' | null;
  }>(),
  {
    showCoordinates: true,
    showLiberties: true,
    showAtari: true,
    showTerritory: false,
    theme: 'wood',
    highlightPoints: () => [],
    lastMove: null,
    sizePx: 500,
    manualMove: false,
    editMode: null,
    // Vue 把未传入的 Boolean prop 默认成 false；这里必须显式默认 true，否则整盘会被当成只读
    interactive: true,
    readonly: false,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: 'play', point: Point): void;
  (e: 'move', point: Point, color: StoneColor): void;
  (e: 'capture', capturedStones: Point[]): void;
  (e: 'illegalMove', point: Point, reason: string): void;
  (e: 'selectStone', point: Point | null, group: StoneGroup | null): void;
  (e: 'hover', point: Point | null): void;
}>();

const activeGame = computed(() => props.game || props.board || new GoGame(props.boardSize || 9));

const handleMove = (p: Point, c: StoneColor) => {
  emit('play', p);
  emit('move', p, c);
};

const handleIllegal = (p: Point, reason: string) => {
  emit('illegalMove', p, reason);
};

const handleSelect = (p: Point | null, g: StoneGroup | null) => {
  emit('selectStone', p, g);
};
</script>

<template>
  <GoBoard
    :game="activeGame"
    :readonly="props.disabled || props.readonly || (props.interactive === false)"
    :showLiberties="props.showLiberties"
    :showCoordinates="props.showCoordinates"
    :showAtari="props.showAtari"
    :showTerritory="props.showTerritory"
    :theme="props.theme"
    :highlightPoints="props.highlightPoints"
    :lastMove="props.lastMove"
    :sizePx="props.sizePx"
    :manualMove="props.manualMove"
    :editMode="props.editMode"
    @move="handleMove"
    @capture="emit('capture', $event)"
    @illegalMove="handleIllegal"
    @selectStone="handleSelect"
  />
</template>

