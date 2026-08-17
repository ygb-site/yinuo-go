import type { StoneColor, Point } from '../engine/types';

export interface DictEntry {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  category: 'basic' | 'tesuji' | 'life_death' | 'opening_shape';
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
  {
    id: 'liberties',
    chinese: '气',
    pinyin: 'qì',
    english: 'Liberties',
    category: 'basic',
    categoryName: '基础概念',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    shortDesc: '棋子的呼吸孔。紧挨着棋子的上下左右空交叉点。',
    fullDesc: '棋子只有依靠相连的空交叉点才能生存。中腹独子有4气，边上3气，角上2气。所有气被堵死时即被提吃。',
    kidAnalogy: '就像小潜水员的氧气管，有管子连着外面才能呼吸，管子都被拔掉就危险啦！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 2, c: 2, color: 'B' }],
    demoInteractiveMoves: [{ r: 1, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 3 }],
    demoExplanation: '黑子周围上下左右4个发光空点都是它的气！'
  },
  {
    id: 'capture',
    chinese: '提子 / 吃子',
    pinyin: 'tí zǐ',
    english: 'Capture',
    category: 'basic',
    categoryName: '基础概念',
    badgeColor: 'bg-red-100 text-red-700 border-red-300',
    shortDesc: '堵死对方棋子最后一口气，并将其从棋盘上拿走。',
    fullDesc: '当一方落子使得对方某颗或某块棋子完全失去所有气时，该棋子立即死亡，由提子方拿离棋盘作为俘虏。',
    kidAnalogy: '就像把敌方的小怪兽关进宝箱，整只收归己有！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 3 }],
    demoExplanation: '点击 (2, 3) 堵住最后一口气，就能立即提吃这颗白子！'
  },
  {
    id: 'atari',
    chinese: '叫吃 / 打吃',
    pinyin: 'jiào chī / dǎ chī',
    english: 'Atari',
    category: 'basic',
    categoryName: '基础概念',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    shortDesc: '棋子只剩下最后一口气的危险预警状态。',
    fullDesc: '当某颗或某块棋子只剩下一口气时，对方下一步就可以将其提吃，这种状态在围棋中称为“叫吃”。',
    kidAnalogy: '就像游戏里的血条只剩最后一滴血，屏幕闪红光啦！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 3 }],
    demoExplanation: '白子被叫吃中，红圈警报闪烁，只剩 (2, 3) 一口气！'
  },
  {
    id: 'suicide',
    chinese: '禁着点 / 自杀步',
    pinyin: 'jìn zhuó diǎn / zì shā',
    english: 'Illegal Move / Suicide',
    category: 'basic',
    categoryName: '基础概念',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    shortDesc: '落子后自身完全无气且不能提吃对方棋子的位置，禁止落子。',
    fullDesc: '围棋规则严禁自杀。但特殊情况：如果落子虽然自己无气，但能同时提吃对方周围棋子，则此着合法且对方棋子被提走。',
    kidAnalogy: '不能自己往熔岩陷阱里跳，但如果这一跳能踩掉怪兽，那就是神仙跳！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'W' },
      { r: 3, c: 2, color: 'W' },
      { r: 2, c: 1, color: 'W' },
      { r: 2, c: 3, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 0, c: 0 }, { r: 4, c: 4 }],
    demoExplanation: '中心 (2, 2) 是白子的虎口，黑子单独下进去属于自杀禁着点。'
  },
  {
    id: 'ko',
    chinese: '劫争 / 打劫',
    pinyin: 'jié zhēng / dǎ jié',
    english: 'Ko Rule',
    category: 'basic',
    categoryName: '基础概念',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-300',
    shortDesc: '双方不能在同一位置来回无限互提，必须隔一手（找劫材）才能反提。',
    fullDesc: '劫争规则是为了防止棋局陷入无限死循环而设立的核心规则。被提劫一方必须先在棋盘其他地方下子（找劫），对方应答后才能回来反提。',
    kidAnalogy: '打乒乓球规则：一人打一下，不能自己抢连着打两下！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 1, c: 3, color: 'W' },
      { r: 3, c: 3, color: 'W' },
      { r: 2, c: 4, color: 'W' },
      { r: 2, c: 3, color: 'W' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '黑棋下在 (2, 2) 提掉白子，白棋下一步不得立即回提 (2, 3)。'
  },
  {
    id: 'double_atari',
    chinese: '双叫吃',
    pinyin: 'shuāng jiào chī',
    english: 'Double Atari',
    category: 'tesuji',
    categoryName: '手筋战术',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-300',
    shortDesc: '一子落下，同时让对方两处不同的棋子进入叫吃状态。',
    fullDesc: '由于对方在一回合内只能挽救其中一处，另一处必将被我方提吃，是极具威力的攻击手筋。',
    kidAnalogy: '同时抓两只小鸡，母鸡只能护一只，另一只就被我们抓住啦！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'W' },
      { r: 3, c: 3, color: 'W' },
      { r: 0, c: 1, color: 'B' },
      { r: 1, c: 0, color: 'B' },
      { r: 3, c: 4, color: 'B' },
      { r: 4, c: 3, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 2 }, { r: 2, c: 3 }],
    demoExplanation: '下在 (1, 2) 或 (2, 3)，同时叫吃两颗白子！'
  },
  {
    id: 'snapback',
    chinese: '倒扑',
    pinyin: 'dào pū',
    english: 'Snapback',
    category: 'tesuji',
    categoryName: '手筋战术',
    badgeColor: 'bg-pink-100 text-pink-700 border-pink-300',
    shortDesc: '故意送给对方一颗诱饵子，诱敌提吃后立即原位反提整块敌子。',
    fullDesc: '经典实战杀招。关键在于送子后对方的气数被大幅压缩为1气，从而无法脱身。',
    kidAnalogy: '孙悟空故意被妖怪吞进肚子里，然后在肚子里大闹天宫！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 2, color: 'W' },
      { r: 1, c: 3, color: 'W' },
      { r: 2, c: 3, color: 'W' },
      { r: 0, c: 2, color: 'B' },
      { r: 0, c: 3, color: 'B' },
      { r: 1, c: 1, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 3, c: 3, color: 'B' },
      { r: 2, c: 4, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '勇敢把黑子投入 (2, 2) 诱饵点，白吃后黑棋立即回提！'
  },
  {
    id: 'gate_capture',
    chinese: '门吃',
    pinyin: 'mén chī',
    english: 'Gate Capture',
    category: 'tesuji',
    categoryName: '手筋战术',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    shortDesc: '借助两颗并立的友军棋子如同大门两框，封堵并叫吃敌方突围子。',
    fullDesc: '利用两子之间的空档，在敌子试图逃跑时于正前方直接关门堵截。',
    kidAnalogy: '关起门来打怪兽，大门一关插上门闩！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 1, color: 'B' },
      { r: 3, c: 1, color: 'B' },
      { r: 2, c: 0, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 1 }],
    demoExplanation: '下在 (2, 1) 关上大门，白子无路可逃！'
  },
  {
    id: 'net_capture',
    chinese: '枷吃（封手）',
    pinyin: 'jiā chī',
    english: 'Net (Loose Capture)',
    category: 'tesuji',
    categoryName: '手筋战术',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    shortDesc: '不贴身紧气，而是从外围虚虚罩住对方，让敌子怎么冲都逃不掉。',
    fullDesc: '又称“飞枷”或“天罗地网”。即便不直接叫吃，敌方逃跑时也会自己撞入死路。',
    kidAnalogy: '撒下一张捕鱼大网，鱼儿怎么游都在网兜里！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 1, color: 'B' },
      { r: 3, c: 1, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 1, c: 3 }],
    demoExplanation: '在 (1, 3) 轻轻撒下一张网，白棋无法冲出！'
  },
  {
    id: 'ladder',
    chinese: '征子（扭羊头）',
    pinyin: 'zhēng zǐ / niǔ yáng tóu',
    english: 'Ladder',
    category: 'tesuji',
    categoryName: '手筋战术',
    badgeColor: 'bg-violet-100 text-violet-700 border-violet-300',
    shortDesc: '连续斜向交替叫吃，逼迫敌子走阶梯状路径，直到棋盘边缘或撞上友军被提吃。',
    fullDesc: '征子成立的前提是征子路线上没有对方接应的棋子（引征）。只要前方空旷，必定一路吃到底。',
    kidAnalogy: '像走阶梯一样左一下右一下，把敌军一直赶到天涯海角！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'W' },
      { r: 0, c: 1, color: 'B' },
      { r: 1, c: 0, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 1 }],
    demoExplanation: '连续逼迫白子走 Z 字形，一路追击！'
  },
  {
    id: 'real_eye',
    chinese: '真眼 vs 假眼',
    pinyin: 'zhēn yǎn vs jiǎ yǎn',
    english: 'Real Eye vs False Eye',
    category: 'life_death',
    categoryName: '死活眼位',
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-300',
    shortDesc: '真眼坚不可摧无法被入子；假眼因对角被占，关键时刻会被提吃。',
    fullDesc: '角部真眼需0对角受制；边部真眼需对角无敌子；中腹真眼至少需3个对角点受己方控制。',
    kidAnalogy: '真眼是钢筋水泥的安全屋；假眼是用纸糊的，大风一吹就破！',
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
    demoExplanation: '在 (2, 2) 稳健落子，将大空间划分为两只真眼！'
  },
  {
    id: 'two_eyes',
    chinese: '两眼做活',
    pinyin: 'liǎng yǎn zuò huó',
    english: 'Making Two Eyes (Life)',
    category: 'life_death',
    categoryName: '死活眼位',
    badgeColor: 'bg-green-100 text-green-700 border-green-300',
    shortDesc: '一块棋拥有两只完全独立的真眼，即永远无法被敌方提吃，宣告活棋。',
    fullDesc: '由于对方不能同时在两个眼位落子（单下一子算自杀），因此两眼活棋是围棋生存的核心根基。',
    kidAnalogy: '拥有两个独立的秘密基地，敌人进哪个都会被反吃，立于不败之地！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 1, c: 1, color: 'B' },
      { r: 1, c: 3, color: 'B' },
      { r: 2, c: 0, color: 'B' },
      { r: 2, c: 2, color: 'B' },
      { r: 2, c: 4, color: 'B' },
      { r: 3, c: 1, color: 'B' },
      { r: 3, c: 3, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 2 }],
    demoExplanation: '两只真眼形成，黑棋万世长存，永远吃不掉！'
  },
  {
    id: 'corner_gold',
    chinese: '金角银边草肚皮',
    pinyin: 'jīn jiǎo yín biān cǎo dù pí',
    english: 'Corners Gold, Sides Silver, Center Grass',
    category: 'opening_shape',
    categoryName: '大局布局',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    shortDesc: '围地效率角部最高（金），边上次之（银），中腹最难围（草）。',
    fullDesc: '角部依靠两条天然棋盘边界，只需极少棋子就能围出大领地；边部需一条边界；中腹四面漏风需大量棋子。',
    kidAnalogy: '在墙角盖房子只需要砌两面墙；在空地上盖房子要砌四面墙！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 1 }, { r: 3, c: 3 }],
    demoExplanation: '四个角落的黄金星位是开局最有效率的占位点！'
  },
  {
    id: 'territory_points',
    chinese: '目数 / 领地',
    pinyin: 'mù shù / lǐng dì',
    english: 'Territory / Points',
    category: 'opening_shape',
    categoryName: '大局布局',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-300',
    shortDesc: '一方棋子完全包围并占领的安全空交叉点，1个交叉点为1目。',
    fullDesc: '对局结束时，双方比较围得的总目数（或数子法中的总子数+地盘），目数多者获胜。',
    kidAnalogy: '就像把空地圈成自己的大果园，里面的每一棵果树（交叉点）都是你的得分！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 0, c: 2, color: 'B' },
      { r: 1, c: 2, color: 'B' },
      { r: 2, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 4, c: 2, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 2, c: 0 }, { r: 2, c: 1 }],
    demoExplanation: '黑棋竖起中线城墙，左侧所有空点都是黑棋的稳固领地！'
  }
];

