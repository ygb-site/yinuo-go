
const fs = require('fs');

const boardVuePath = 'src/components/board/GoBoard.vue';
let code = fs.readFileSync(boardVuePath, 'utf8');

// 1. Add renderedStones computed and watch for total reactive synchronization
const renderedStonesCode = `
// Compute 100% reactive rendered stone list
const renderedStones = computed(() => {
  const _v = boardVersion.value;
  const _lm = props.lastMove;
  const _h = props.game.history ? props.game.history.length : 0;
  const s = size.value;
  const list: { r: number; c: number; color: StoneColor }[] = [];
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
import { watch } from 'vue';
watch(
  () => [props.game, props.lastMove, props.game?.history?.length, props.editMode],
  () => {
    boardVersion.value++;
  },
  { deep: true }
);
`;

if (!code.includes('const renderedStones = computed')) {
  code = code.replace(
    'const size = computed(() => props.game.size || 9);',
    'const size = computed(() => props.game.size || 9);\n' + renderedStonesCode
  );
}

// 2. Replace the template stone loop to iterate over renderedStones
const oldStoneTemplate = `          <!-- Stones on Board -->
          <g>
            <template v-for="r in size" :key="`stone-r-${r}-v${boardVersion}`">
              <template v-for="c in size" :key="`stone-c-${c}`">
                <g
                  v-if="game.getCell(r - 1, c - 1) !== null"
                  :transform="`translate(${(c - 1) * 100 + 50}, ${(r - 1) * 100 + 50})`"
                  class="transition-transform duration-150"
                  pointer-events="none"
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

                  <!-- Last Move Marker (最后一手标记) -->
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
                    :font-size="size >= 13 ? 24 : 22"
                    font-weight="900"
                    font-family="sans-serif"
                    class="pointer-events-none"
                  >
                    {{ libertiesMap.get(`${r - 1},${c - 1}`) }}
                  </text>
                </g>
              </template>
            </template>
          </g>`;

const newStoneTemplate = `          <!-- Stones on Board -->
          <g>
            <template v-for="stone in renderedStones" :key="`stone-${stone.r}-${stone.c}-${stone.color}-${boardVersion}`">
              <g
                :transform="`translate(${stone.c * 100 + 50}, ${stone.r * 100 + 50})`"
                class="transition-transform duration-150"
                pointer-events="none"
              >
                <!-- Atari Pulsing Aura Ring (叫吃呼吸红光) -->
                <circle
                  v-if="atariAlertPoints.has(`${stone.r},${stone.c}`)"
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
                <g v-if="atariAlertPoints.has(`${stone.r},${stone.c}`)">
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
                  v-if="showLiberties && libertiesMap.has(`${stone.r},${stone.c}`)"
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
                  {{ libertiesMap.get(`${stone.r},${stone.c}`) }}
                </text>
              </g>
            </template>
          </g>`;

code = code.replace(oldStoneTemplate, newStoneTemplate);

fs.writeFileSync(boardVuePath, code, 'utf8');
console.log('src/components/board/GoBoard.vue updated with renderedStones');

