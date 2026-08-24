import type { StoneColor, Point } from '../engine/types';

export interface DictEntry {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  category: 'board_positions' | 'basic' | 'moves_shapes' | 'tesuji' | 'life_death' | 'endgame_rules';
  categoryName: string;
  badgeColor: string;
  shortDesc: string;
  fullDesc: string;
  kidAnalogy: string;
  demoBoardSize: number;
  demoInitialStones: { r: number; c: number; color: StoneColor }[];
  demoInteractiveMoves: Point[];
  demoExplanation: string;
}

export const GO_DICTIONARY: DictEntry[] = [
  // =========================================================================
  // 🧭 1. 棋盘地名与坐标线 (Board Positions & Lines)
  // =========================================================================
  {
    id: 'tengen',
    chinese: '天元',
    pinyin: 'tiān yuán',
    english: 'Tengen (Center Star)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '棋盘正中心的星位交叉点，整张星空宇宙的中心坐标基准。',
    fullDesc: '棋盘正中心唯一的星位称为“天元”（Tengen）。在九路盘上为C3/E5点，在十九路盘上为K10点。象征着宇宙的起源与中心，具有极高的战略大局辐射力。',
    kidAnalogy: '就像太阳系的太阳，所有行星都围绕它旋转，是棋盘王国的宇宙中心！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '点击棋盘最中间闪闪发光的 C3 交叉点，点亮宇宙天元星！'
  },
  {
    id: 'hoshi',
    chinese: '星位',
    pinyin: 'xīng wèi',
    english: 'Star Point (Hoshi)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '棋盘角部与边部的特殊大黑点，攻守兼备的守护之星。',
    fullDesc: '棋盘上预先标注有黑色实心圆点的交叉点称为“星位”（Hoshi）。十九路盘共有9个星位（4个角星、4个边星、1个天元）。是开局布局最常用的黄金落子点。',
    kidAnalogy: '就像夜空中指引方向的北斗七星，是守护城堡四方的灯塔！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 1 }],
    demoExplanation: '点击左上角守护星位 B2，掌控角部势力！'
  },
  {
    id: 'san_san',
    chinese: '三·三',
    pinyin: 'sān sān',
    english: '3-3 Point (San-san)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '从角部数第3行第3列的交叉点，角部天然实地金库。',
    fullDesc: '位于角部三线与三线交叉的点称为“三·三”。落子在此能直接牢固占领角部实地，AI时代极度推崇的实地布局点。',
    kidAnalogy: '就像把城堡建在金库的最深处，直接把金币牢牢锁进箱子里！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '点击角部金库三·三点，稳稳夺取角地！'
  },
  {
    id: 'komoku',
    chinese: '小目',
    pinyin: 'xiǎo mù',
    english: 'Komoku (3-4 Point)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '位于三路与四路交叉的角部要害，兼顾围地与向外发展。',
    fullDesc: '位于三线与四线交叉的点称为“小目”（Komoku）。进可向中央取势，退可向角部守角，是古典围棋和现代围棋最主流的开局点之一。',
    kidAnalogy: '一只脚站在金库里，一只脚踏向大草原，攻守兼备全能小卫士！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '点击小目点，兼顾守角与外势！'
  },
  {
    id: 'line_death',
    chinese: '一路线（死亡线）',
    pinyin: 'yī lù xiàn',
    english: '1st Line (Line of Death)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '棋盘最边缘的一排线，气少易被杀，称为死亡线。',
    fullDesc: '一路线紧贴棋盘边沿，落子在此天生只有3口气（角上一路仅2气），容易被对方逼入绝境提吃，布局时严禁在一路上主动行棋。',
    kidAnalogy: '就像深不见底的大悬崖边缘，千万不要在悬崖边跑步哦！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 0, c: 1, color: 'W' }, { r: 1, c: 1, color: 'B' }],
    demoInteractiveMoves: [{ r: 0, c: 0 }],
    demoExplanation: '白棋在一路上被黑棋压迫，气数极短！'
  },
  {
    id: 'line_defeat',
    chinese: '二路线（败退线/逃生线）',
    pinyin: 'èr lù xiàn',
    english: '2nd Line (Line of Defeat / Escape)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '从边数第2条线，开局爬二路地盘极少且易被压制。',
    fullDesc: '二路线围地效率极低，开局在二路上连续爬行称为“爬败退线”；但中后盘也是渡过连回和做活的紧急逃生通道。',
    kidAnalogy: '就像贴地爬行的小地道，虽然可以逃跑，但抬不起头来！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 1, c: 1, color: 'B' }],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '在二路上爬行，效率远不如三路和四路。'
  },
  {
    id: 'line_territory',
    chinese: '三路线（实地线）',
    pinyin: 'sān lù xiàn',
    english: '3rd Line (Line of Territory)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '从边数第3条线，围取真金白银实地的黄金实地线。',
    fullDesc: '三路是圈取角部与边部目数效率最高的界线。下在三路容易构筑根据地，迅速建立活棋眼位和确定的领地。',
    kidAnalogy: '像在肥沃的土地上盖城堡，每一寸都是属于你的金币！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 2, c: 1 }],
    demoExplanation: '在三路上行棋，稳稳圈住边角地盘！'
  },
  {
    id: 'line_influence',
    chinese: '四路线（势力线）',
    pinyin: 'sì lù xiàn',
    english: '4th Line (Line of Influence / Power)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    shortDesc: '从边数第4条线，向中央广阔天地辐射外势的大宇宙线。',
    fullDesc: '四路线高耸巍峨，落子在此易于掌控中腹制空权，向四周形成强大的攻击厚势，是高飞取势的核心通道。',
    kidAnalogy: '像站在高高的瞭望塔上，把霸气的目光投向整片星空！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 3, c: 1 }],
    demoExplanation: '在四路昂首挺胸，向中腹施加巨大威慑！'
  },

  // =========================================================================
  // ⚡ 2. 基础规则与生命概念 (Basic Rules & Life Concepts)
  // =========================================================================
  {
    id: 'liberty',
    chinese: '气',
    pinyin: 'qì',
    english: 'Liberties (Qi)',
    category: 'basic',
    categoryName: '规则概念',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '与棋子直接相连的空交叉点，棋子呼吸生存的氧气管道。',
    fullDesc: '棋子在棋盘上生存必须依赖相邻的直线空交叉点，称为“气”（Liberties）。单子在中央有4气，边上3气，角上2气。无气则死。',
    kidAnalogy: '棋子的呼吸小气管！有气就能活蹦乱跳，没气就会被敌人抓走！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 2, c: 2, color: 'B' }],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '在黑子上方落子手拉手，两颗子手拉手共享6口气！'
  },
  {
    id: 'atari',
    chinese: '叫吃（打吃）',
    pinyin: 'jiào chī / dǎ chī',
    english: 'Atari',
    category: 'basic',
    categoryName: '规则概念',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '使对方棋子只剩最后一口气的紧迫进攻状态。',
    fullDesc: '落子后使对方某块棋子仅剩最后一口气，下一步即可提掉的状态称为“叫吃”（Atari）。此时对方必须立刻逃跑或提防。',
    kidAnalogy: '危险红色警报拉响！只剩最后1格电量啦，随时会被关机！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 1 }],
    demoExplanation: '在左侧落子堵气，让白子只剩右边最后1口气（叫吃）！'
  },
  {
    id: 'capture',
    chinese: '提子',
    pinyin: 'tí zǐ',
    english: 'Capture / Take Stones',
    category: 'basic',
    categoryName: '规则概念',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    shortDesc: '拔掉对方最后一口气，把无气敌子移出棋盘收为俘虏。',
    fullDesc: '当下下一子使对方棋子完全失去所有的气时，该棋子立即被提走移出棋盘，称为“提子”（Capture）。被提之子为死子。',
    kidAnalogy: '大网收紧！把被包围的小怪兽抓进俘虏盒子里！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 3 }],
    demoExplanation: '点击右侧空位堵死最后一口气，清脆提走白子！'
  },
  {
    id: 'forbidden_point',
    chinese: '禁着点（自杀禁令）',
    pinyin: 'jìn zhuó diǎn',
    english: 'Forbidden Point (Suicide Rule)',
    category: 'basic',
    categoryName: '规则概念',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    shortDesc: '落子后自身无气且不能提吃敌子的交叉点，严禁落子。',
    fullDesc: '如果某交叉点下子后自身处于0气状态，且无法提掉对方任何棋子，则该点为“禁着点”。围棋规则严禁自杀性落子。',
    kidAnalogy: '无底深渊陷阱！跳进去自己会没命，千万不能跳！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'W' },
      { r: 3, c: 2, color: 'W' },
      { r: 2, c: 1, color: 'W' },
      { r: 2, c: 3, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 3, c: 3 }],
    demoExplanation: '避开中间的自杀禁区，下在安全开阔的星位！'
  },
  {
    id: 'ko_rule',
    chinese: '打劫与劫争',
    pinyin: 'dǎ jié & jié zhēng',
    english: 'Ko Rule & Ko Fight',
    category: 'basic',
    categoryName: '规则概念',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    shortDesc: '禁止立即原位反提，一人一手找劫材的防无限循环规则。',
    fullDesc: '当一方提掉一子后，对方不得在下一步立即原位反提造成局面无限循环，必须先在棋盘别处走一手（找劫材）。',
    kidAnalogy: '像打乒乓球一样，你打一板我打一板，不能抱住球不放！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 1, color: 'B' },
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 4, color: 'W' },
      { r: 1, c: 3, color: 'W' },
      { r: 3, c: 3, color: 'W' },
      { r: 2, c: 2, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '点击 C3 提劫！白棋不能立即反提，必须去别处找劫材！'
  },
  {
    id: 'seki',
    chinese: '双活（共活）',
    pinyin: 'shuāng huó',
    english: 'Seki (Mutual Life)',
    category: 'basic',
    categoryName: '规则概念',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    shortDesc: '双方棋子纠缠在一起，谁先动手谁被吃，共同存活。',
    fullDesc: '双方均无两只真眼，但共享公气，任何一方先在公气落子都会使自己变成一口气被对方提掉，因此双方相安无事共同存活，称为“双活”（Seki）。',
    kidAnalogy: '互相握着对方的小辫子，谁先松手谁摔倒，干脆和平共处做朋友！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 1, c: 3, color: 'W' },
      { r: 2, c: 3, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '中间公气谁下谁死，形成和平共处的双活！'
  },

  // =========================================================================
  // 🥊 3. 常用行棋手法与形状 (Move Types & Shapes)
  // =========================================================================
  {
    id: 'nobi',
    chinese: '长',
    pinyin: 'zhǎng',
    english: 'Nobi (Extend)',
    category: 'moves_shapes',
    categoryName: '行棋手法',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '紧挨着自己的棋子向前直线延伸一步，增加气数与厚度。',
    fullDesc: '紧贴着己方已有的棋子沿直线继续落子称为“长”（Nobi）。是最扎实稳健的行棋手法，长气生力，绝无破绽。',
    kidAnalogy: '小树苗向上伸展出一截新树枝，长得更粗更壮！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 2, c: 2, color: 'B' }, { r: 2, c: 1, color: 'W' }],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '在黑子上方长出一子，气数大增！'
  },
  {
    id: 'hane',
    chinese: '扳',
    pinyin: 'bān',
    english: 'Hane (Turn Corner)',
    category: 'moves_shapes',
    categoryName: '行棋手法',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '在对方棋子前进的拐角斜前方阻截落子，封阻出头。',
    fullDesc: '在与己方棋子相连、同时紧贴对方棋子斜角方向落子称为“扳”（Hane）。扳头能强力封锁对方的发展方向。',
    kidAnalogy: '伸出小胳膊斜着一拐，挡住对方前进的去路！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 2, c: 2, color: 'B' }, { r: 2, c: 1, color: 'W' }],
    demoInteractiveMoves: [{ r: 1, c: 1 }],
    demoExplanation: '在白子头顶斜角处施展强力一扳，封死白子出头！'
  },
  {
    id: 'kiri',
    chinese: '断（分断）',
    pinyin: 'duàn',
    english: 'Kiri (Cut)',
    category: 'moves_shapes',
    categoryName: '行棋手法',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '把对方两颗斜向相连的棋子切断开来，使其孤立无援。',
    fullDesc: '落子在对方斜向未连接的交叉点，强行将对方切成两截称为“断”（Kiri）。俗话说“棋从断处生”，分断是战斗进攻的源头。',
    kidAnalogy: '一把利剑斩断敌人的手拉手队伍，让他们各自分开！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'W' },
      { r: 2, c: 2, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 1 }],
    demoExplanation: '下在 B3 切断白棋，让白棋两子不能救援！'
  },
  {
    id: 'tsugi',
    chinese: '粘（连接）',
    pinyin: 'zhān / lián jiē',
    english: 'Tsugi (Connect)',
    category: 'moves_shapes',
    categoryName: '行棋手法',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '把己方存在弱点的断点补强连上，固若金汤。',
    fullDesc: '在己方被叫吃或存在分断隐患的交叉点落子，使分散的棋子连为一体称为“粘”（Tsugi）。防守补强的核心手段。',
    kidAnalogy: '用万能强力胶水把两颗子粘在一起，变成坚硬的大石头！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'B' },
      { r: 2, c: 2, color: 'B' },
      { r: 1, c: 2, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 1 }],
    demoExplanation: '在断点处粘上一子，黑棋队伍坚如磐石！'
  },
  {
    id: 'tobi',
    chinese: '跳（一间跳）',
    pinyin: 'tiào',
    english: 'Tobi (Jump)',
    category: 'moves_shapes',
    categoryName: '行棋手法',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    shortDesc: '沿直线隔一个空交叉点向前跃进，快速出头。',
    fullDesc: '与已有棋子在同一直线上相隔一格落子称为“一间跳”（Tobi）。出头速度快且不易被分断，俗称“一间跳无恶手”。',
    kidAnalogy: '小青蛙向前轻轻一跳，越过一个空格向前大步迈进！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 3, c: 2, color: 'B' }],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '向上跳一格，快速向中腹出头！'
  },
  {
    id: 'kosumi',
    chinese: '尖',
    pinyin: 'jiān',
    english: 'Kosumi (Diagonal Move)',
    category: 'moves_shapes',
    categoryName: '行棋手法',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    shortDesc: '在己方棋子斜对角一格落子，扎实稳固不易被断。',
    fullDesc: '在与己方棋子成斜角对角线的交叉点落子称为“尖”（Kosumi）。尖的连接非常坚固，对方无法直接分断。',
    kidAnalogy: '斜着跨出一小步，像小螃蟹一样稳稳扎根！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 2, c: 2, color: 'B' }],
    demoInteractiveMoves: [{ r: 1, c: 1 }],
    demoExplanation: '斜角尖一步，形态牢不可破！'
  },
  {
    id: 'tiger_mouth',
    chinese: '虎口',
    pinyin: 'hǔ kǒu',
    english: "Tiger's Mouth (Kake)",
    category: 'moves_shapes',
    categoryName: '行棋手法',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '三颗同色棋子呈品字形包围，敌人跳进去就会被叫吃。',
    fullDesc: '三颗棋子呈凹形排列形成的形状称为“虎口”。对方若敢落入虎口之中，立即处于被叫吃状态，下一步即可提掉。',
    kidAnalogy: '大老虎张开的大嘴巴！谁跳进嘴里一口就被吃掉啦！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '三颗黑子围成威武虎口，白子跳入立刻只剩1气！'
  },

  // =========================================================================
  // 🎣 4. 经典吃子手筋武器库 (Tactical Capture Tesuji)
  // =========================================================================
  {
    id: 'double_atari',
    chinese: '双叫吃（双打）',
    pinyin: 'shuāng jiào chī',
    english: 'Double Atari (Ryō-atari)',
    category: 'tesuji',
    categoryName: '吃子手筋',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '一步棋同时叫吃对方两块不同的棋子，一箭双雕。',
    fullDesc: '一子落下同时使对方两处棋子各剩一口气的绝妙战术，对方顾此失彼只能救一处，我方必能提吃另一处。',
    kidAnalogy: '一箭双雕！一颗石子同时打中两只小鸟！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'W' },
      { r: 2, c: 1, color: 'W' },
      { r: 0, c: 2, color: 'B' },
      { r: 2, c: 0, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 1 }],
    demoExplanation: '落子 B2，同时叫吃上下两颗白子！'
  },
  {
    id: 'embrace_capture',
    chinese: '抱吃',
    pinyin: 'bào chī',
    english: 'Embrace / Hug Capture',
    category: 'tesuji',
    categoryName: '吃子手筋',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '把敌方棋子顺势往己方棋子多的怀里赶着叫吃。',
    fullDesc: '顺应对方逃跑方向，从外侧叫吃，将其逼入己方重兵包围圈或棋盘边缘的顺势吃子法。',
    kidAnalogy: '张开大大的双臂，把逃跑的小兔赶进自家怀抱里！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 4, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 1 }],
    demoExplanation: '从左侧叫吃，逼白子向右边怀里撞！'
  },
  {
    id: 'door_capture',
    chinese: '门吃',
    pinyin: 'mén chī',
    english: 'Door / Gate Capture',
    category: 'tesuji',
    categoryName: '吃子手筋',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '利用左右两颗棋子作门框，在正前方关门插闩提吃。',
    fullDesc: '利用两侧已有棋子作为门框，在敌子逃跑前方落子阻截并将其提吃，形象称为“门吃”。',
    kidAnalogy: '两扇大门一关，插上门闩，关门打狗！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 2, c: 1, color: 'B' },
      { r: 2, c: 3, color: 'B' },
      { r: 3, c: 2, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '在上方门口 C2 关门落子，提吃白子！'
  },
  {
    id: 'shicho',
    chinese: '征吃（扭羊头）',
    pinyin: 'zhēng chī / niǔ yáng tóu',
    english: 'The Ladder (Shicho)',
    category: 'tesuji',
    categoryName: '吃子手筋',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '左右连续折线叫吃，一路像阶梯一样追杀到棋盘边缘。',
    fullDesc: '交替从两侧连续叫吃，呈之字形阶梯状逼迫敌子撞向棋盘边缘或己方厚势提吃的经典杀法。',
    kidAnalogy: '小羊扭头走阶梯，左边打一下右边打一下，一路追到悬崖边！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 3 }],
    demoExplanation: '在 D3 叫吃，开启连续扭羊头追杀！'
  },
  {
    id: 'geta',
    chinese: '枷吃（飞枷）',
    pinyin: 'jiā chī',
    english: 'The Net (Geta)',
    category: 'tesuji',
    categoryName: '吃子手筋',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    shortDesc: '不贴身叫吃，而是隔一路虚罩封锁敌子所有逃跑路线。',
    fullDesc: '拉开一格距离虚扣在敌子前方，封死其所有逃生分支的高效手筋。比征子更稳健，不受引征影响。',
    kidAnalogy: '天罗地网从天而降，虚虚罩住，敌人怎么钻也钻不出大网！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 3 }],
    demoExplanation: '在斜上方 D2 飞枷织网，罩死白子！'
  },
  {
    id: 'snapback',
    chinese: '倒扑',
    pinyin: 'dào pū',
    english: 'The Snapback (Uttegaeshi)',
    category: 'tesuji',
    categoryName: '吃子手筋',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    shortDesc: '故意送子入虎口让对方提吃，随后反提对方整块大鱼。',
    fullDesc: '故意弃子送入对方虎口中被提，使对方棋子气数骤减为一口，随后立即反手提掉对方整块棋子的奇妙手筋。',
    kidAnalogy: '神奇魔术！故意扔个小诱饵，等敌人上钩立刻钓起一条大肥鱼！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'W' },
      { r: 2, c: 2, color: 'W' },
      { r: 0, c: 2, color: 'B' },
      { r: 1, c: 1, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 3, c: 2, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 3 }],
    demoExplanation: '投下诱饵倒扑！白棋吃了立刻会被全歼！'
  },
  {
    id: 'oikomi',
    chinese: '接不归',
    pinyin: 'jiē bù guī',
    english: 'Connect-and-Die (Oikomi)',
    category: 'tesuji',
    categoryName: '吃子手筋',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '对方被叫吃的棋子即使连回去也全是一口气，无法逃脱。',
    fullDesc: '对方被叫吃的棋子在接回友军后仍然处于叫吃（1口气）状态，我方下一步能将其连带大部队一起提吃的绝杀。',
    kidAnalogy: '连上了也是死路一条，葫芦娃救爷爷，来一个抓一双！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'W' },
      { r: 1, c: 3, color: 'W' },
      { r: 0, c: 2, color: 'B' },
      { r: 2, c: 2, color: 'B' },
      { r: 1, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 4 }],
    demoExplanation: '叫吃白子！白子接回也是一口气全灭！'
  },

  // =========================================================================
  // 🏰 5. 死活城堡与眼位 (Life & Death / Eyes)
  // =========================================================================
  {
    id: 'eye_space',
    chinese: '眼位',
    pinyin: 'yǎn wèi',
    english: 'Eye Space',
    category: 'life_death',
    categoryName: '死活城堡',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '被同一色棋子完全包围的空交叉点，做活的基本单元。',
    fullDesc: '由同一色棋子完整包围而形成的一个或多个空交叉点称为“眼”（Eye）。对方由于自杀禁令无法直接落入，是做活的屏障。',
    kidAnalogy: '小精灵的安全屋！门窗关紧，敌人完全进不来！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 3 }],
    demoExplanation: '在右侧落子闭合城墙，做成完美眼位！'
  },
  {
    id: 'real_false_eye',
    chinese: '真眼与假眼',
    pinyin: 'zhēn yǎn & jiǎ yǎn',
    english: 'Real Eye vs False Eye',
    category: 'life_death',
    categoryName: '死活城堡',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '真眼永久安全；假眼因斜角破损在紧气后会被叫吃分断。',
    fullDesc: '真眼四周连接紧密，对角斜点有己方保护；若斜角关键点被对方占领过多，会导致连接存在缺陷，称为“假眼”。',
    kidAnalogy: '真假美猴王！假眼房顶漏大风，被敌人一吹就塌啦！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 3, color: 'B' },
      { r: 1, c: 1, color: 'W' },
      { r: 3, c: 1, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 3 }],
    demoExplanation: '补强右上斜角，把假眼变真眼！'
  },
  {
    id: 'two_eyes',
    chinese: '两眼活棋',
    pinyin: 'liǎng yǎn huó qí',
    english: 'Two Eyes (Living Shape)',
    category: 'life_death',
    categoryName: '死活城堡',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '一块棋拥有两只互不相连的独立真眼，永生不灭。',
    fullDesc: '一块棋拥有两个或两个以上独立的真眼时，对方在任何一个眼里落子都构成自杀禁着点，因此该块棋永远无法被提吃，称为“活棋”。',
    kidAnalogy: '练成了不死神功！左边一个安全屋，右边一个安全屋，永远抓不到！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'B' },
      { r: 1, c: 2, color: 'B' },
      { r: 1, c: 3, color: 'B' },
      { r: 3, c: 1, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 3, c: 3, color: 'B' },
      { r: 2, c: 0, color: 'B' },
      { r: 2, c: 4, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '在中心 C3 一分为二，做出左右两只真眼做活！'
  },
  {
    id: 'straight_three',
    chinese: '直三要害',
    pinyin: 'zhí sān',
    english: 'Straight Three Eye Shape',
    category: 'life_death',
    categoryName: '死活城堡',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    shortDesc: '直排3个空交叉点，中间正中心是决定生死的唯一急所。',
    fullDesc: '内部有一直线相连的三个空交叉点，其正中心为要害急所。黑占则点杀破眼，白占则分出两眼做活。',
    kidAnalogy: '三连房间的心窝大门！谁先抢到中间谁就能说了算！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'W' },
      { r: 1, c: 2, color: 'W' },
      { r: 1, c: 3, color: 'W' },
      { r: 3, c: 1, color: 'W' },
      { r: 3, c: 2, color: 'W' },
      { r: 3, c: 3, color: 'W' },
      { r: 2, c: 0, color: 'W' },
      { r: 2, c: 4, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '点中直三正中心，破坏白棋做眼！'
  },

  // =========================================================================
  // 🏆 6. 终局胜负与裁判规则 (Endgame & Scoring Rules)
  // =========================================================================
  {
    id: 'moku_points',
    chinese: '目（目数）',
    pinyin: 'mù / mù shù',
    english: 'Moku / Territory Points',
    category: 'endgame_rules',
    categoryName: '终局规则',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '围棋中衡量围空面积的最小基本单位，1个被包围的空交叉点 = 1目。',
    fullDesc: '“目”是围棋计算领地大小的度量衡。棋子在棋盘上完全围住的空交叉点数量即为目数。终局时通过计算双方各自围得的总目数来决定胜负，目多者胜。',
    kidAnalogy: '就像在小镇上圈地盖房子，你完整围住的每一个小空格，就是一个金币小金库（1目）！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'B' },
      { r: 1, c: 2, color: 'B' },
      { r: 1, c: 3, color: 'B' },
      { r: 3, c: 1, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 3, c: 3, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 2, c: 3, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '中心 C3 是黑棋完整围住的空交叉点，计为 1 目领地！'
  },
  {
    id: 'half_point_win',
    chinese: '胜半子（半目胜）',
    pinyin: 'shèng bàn zǐ / bàn mù shèng',
    english: 'Half-Point Victory (0.5 Margin)',
    category: 'endgame_rules',
    categoryName: '终局规则',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '围棋比赛中最小、最刺激的极限差距胜负（仅领先 0.5 目或 3/4 子）。',
    fullDesc: '由于黑棋先下需要贴目（如贴3.5目、5.5目或7.5目），终局结算时计算出的净胜目数常会出现 0.5 目的最小差距。以 0.5 目的微小优势险胜称为“半目胜”或“胜半子”。',
    kidAnalogy: '就像跑步冲刺撞线，只比第二名快了半个脚尖！微弱却决定胜负的奇迹胜利！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 0, c: 0, color: 'B' },
      { r: 4, c: 4, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '围棋通过半目贴目消除和棋，分出胜者！'
  },
  {
    id: 'scoring_methods',
    chinese: '数子法与比目法',
    pinyin: 'shǔ zǐ fǎ & bǐ mù fǎ',
    english: 'Area Scoring vs Territory Scoring',
    category: 'endgame_rules',
    categoryName: '终局规则',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    shortDesc: '中国规则（数活子+围空）与日韩国际规则（数围空目数）的换算体系。',
    fullDesc: '中国围棋规则采用“数子法”（活子 + 围空交叉点，19路全盘共361子，超过184.25子者胜）；日韩规则采用“比目法”（只数围空的目数）。两者本质等价，数学上 1 子 = 2 目。',
    kidAnalogy: '称重苹果的方法不同：一个连箱子一起称，一个只称果肉，最终算出的甜度完全一样！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [],
    demoExplanation: '中国规则数子法计算活子与围空之和！'
  },

  // =========================================================================
  {
    id: 'yose',
    chinese: '官子（收官）',
    pinyin: 'guān zǐ / shōu guān',
    english: 'Endgame (Yose)',
    category: 'endgame_rules',
    categoryName: '终局规则',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    shortDesc: '终局阶段搜刮、微调领地边界与目数的细致争夺。',
    fullDesc: '棋局大轮廓确定后，双方在边界前沿争夺微小目数的终局阶段称为“官子”。一目之差往往能逆转全局胜负。',
    kidAnalogy: '最后清扫战场，把每一个散落的小金币都捡进兜里！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 0, c: 0, color: 'B' },
      { r: 1, c: 0, color: 'B' },
      { r: 2, c: 0, color: 'B' },
      { r: 0, c: 4, color: 'W' },
      { r: 1, c: 4, color: 'W' },
      { r: 2, c: 4, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 0, c: 1 }],
    demoExplanation: '在一路上先手推进官子，多抢一目地盘！'
  },
  {
    id: 'chinese_scoring',
    chinese: '终局数子点目',
    pinyin: 'zhōng jú shǔ zǐ',
    english: 'Scoring & Counting (Area Scoring)',
    category: 'endgame_rules',
    categoryName: '终局规则',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    shortDesc: '终局清理死子后，清点各自占据的交叉点领地判定胜负。',
    fullDesc: '双方连续停一手（Pass）后棋局结束。清理死子后，中国规则通过清点活子与围空总数判定胜负，超过归本目数者获胜。',
    kidAnalogy: '隆重的颁奖典礼！清点谁圈的城堡地盘更大，决出大冠军！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 0, c: 0, color: 'B' },
      { r: 0, c: 1, color: 'B' },
      { r: 4, c: 3, color: 'W' },
      { r: 4, c: 4, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '终局清点！黑棋领地遥遥领先，胜利！'
  },
  {
    id: 'pass_move',
    chinese: '虚手（停一手）',
    pinyin: 'xū shǒu / tíng yī shǒu',
    english: 'Pass',
    category: 'endgame_rules',
    categoryName: '终局规则',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
    shortDesc: '当认为全盘无合适落子点时放弃一手，双方连续虚手即终局。',
    fullDesc: '对局者放弃落子权利的一手称为“虚手”（Pass）。当双方选手连续两次虚手时，代表双方均认可棋局定型，进入数子胜负结算。',
    kidAnalogy: '双方举手示意“我下完啦”，表示棋盘已经完全画好界线！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [],
    demoExplanation: '双方连续虚手，对局正式圆满终局！'
  },
  {
    id: 'komi',
    chinese: '贴目',
    pinyin: 'tiē mù',
    english: 'Komi (Compensation Points)',
    category: 'endgame_rules',
    categoryName: '终局规则',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    shortDesc: '黑棋先下具有先手优势，终局时黑棋需贴还给白棋一定目数以示公平。',
    fullDesc: '由于黑方先落子享有开局主动权，为保证比赛公平，终局判定胜负时黑棋需贴还给白棋相应目数。',
    kidAnalogy: '黑精灵先跑一步，所以到终点时要让一小步给后跑的白精灵！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [],
    demoExplanation: '终局计算时计入贴目，确保对局绝对公平！'
  }
];
