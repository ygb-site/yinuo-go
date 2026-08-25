import { ref, onMounted, onUnmounted, computed } from 'vue';

export interface BoardSizeInput {
  headerH?: number;
  toolbarH?: number;
  sidePanelW?: number;
  safeTop?: number;
  safeBottom?: number;
  gap?: number;
  boardCells?: 9 | 13 | 19;
}

export function calculateBoardSize(
  viewportW: number,
  viewportH: number,
  input: BoardSizeInput = {}
): number {
  const headerH = input.headerH ?? 48;
  const toolbarH = input.toolbarH ?? 0;
  const sidePanelW = input.sidePanelW ?? (viewportW >= 1024 ? 340 : 0);
  const safeTop = input.safeTop ?? 0;
  const safeBottom = input.safeBottom ?? 0;
  const gap = input.gap ?? 16;
  const cells = input.boardCells ?? 9;

  const contentMaxW = viewportW >= 1440 ? 1200 : viewportW >= 1024 ? 960 : viewportW;
  const availableW = Math.min(viewportW, contentMaxW) - gap * 2 - (sidePanelW > 0 ? sidePanelW + gap : 0);
  const availableH = viewportH - headerH - toolbarH - safeTop - safeBottom - gap * 2;

  const rawSize = Math.min(availableW, availableH);

  // Min and max bounds according to 11-responsive specs
  let minBound = 300;
  let maxBound = 720;

  if (viewportW < 390) {
    minBound = 300;
    maxBound = 343;
  } else if (viewportW < 430) {
    minBound = 320;
    maxBound = 358;
  } else if (viewportW < 768) {
    minBound = 340;
    maxBound = 398;
  } else if (viewportW < 1024) {
    minBound = 400;
    maxBound = 600;
  } else if (viewportW < 1440) {
    minBound = 440;
    maxBound = 640;
  } else {
    minBound = 480;
    maxBound = 720;
  }

  // Integer grid cell alignment to prevent half-pixel line blur
  const cellAligned = Math.floor(rawSize / cells) * cells;
  return Math.max(minBound, Math.min(maxBound, cellAligned));
}

export function useBoardSize(input: BoardSizeInput = {}) {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 800);
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 600);

  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDimensions);
      updateDimensions();
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateDimensions);
    }
  });

  const boardSizePx = computed(() => {
    return calculateBoardSize(windowWidth.value, windowHeight.value, input);
  });

  return {
    boardSizePx,
    windowWidth,
    windowHeight
  };
}

