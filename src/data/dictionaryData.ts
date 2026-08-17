import type { StoneColor, Point } from '../engine/types';

export interface DictEntry {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  category: 'board_positions' | 'basic' | 'tesuji' | 'life_death' | 'opening_shape';
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
  // ==========================================
  // 🧭 棋盘地名与位置 (Board Positions & Lines)
  // ==========================================
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
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    shortDesc: '棋盘角部和边上预先标记的小黑点，开局占角取势的首选要塞。',
    fullDesc: '星位（Hoshi）在十九路棋盘上有9个（4个角星、4个边星与天元），九路盘上有5个。角星位位于四路（4-4）交叉点，既能俯瞰全局，又便于迅速围控角地。',
    kidAnalogy: '就像夜空中闪烁的北极星，是小棋手们开局安家落户的最佳地标！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 1 }, { r: 3, c: 3 }],
    demoExplanation: '点击角部闪光的 B4 星位，开启稳健高效的开局布局！'
  },
  {
    id: 'sansan',
    chinese: '三·三',
    pinyin: 'sān sān',
    english: 'San-San (3-3 Point)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '距离两条边线都为第3条线的交叉点，直接锁死角部地盘金库。',
    fullDesc: '三·三（San-San）是围棋角部最纯粹的实地要塞。一子落在三·三，敌方很难再从角部掏空地盘，是坚固的金库大门锁。',
    kidAnalogy: '就像在自家的金库大门上装了一把大铁锁，里面的金币谁也抢不走！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 3 }],
    demoExplanation: '点击右上角的 D4 (三·三) 交叉点，牢牢守住角部地盘！'
  },
  {
    id: 'komoku',
    chinese: '小目',
    pinyin: 'xiǎo mù',
    english: 'Komoku (3-4 Point)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    shortDesc: '一侧距离边3路、一侧距离边4路，攻守兼备的千年经典起手点。',
    fullDesc: '小目（Komoku）在传统围棋中应用极其广泛。落在3路的一侧便于稳守角地，落在4路的一侧便于向边路与中腹进攻发展，兼顾实地与外势。',
    kidAnalogy: '就像左手拿着坚固的盾牌（守地），右手拿着锋利的长剑（进攻）！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 2 }],
    demoExplanation: '点击 C4 小目交叉点，体验攻守兼备的经典走法！'
  },
  {
    id: 'line_1_death',
    chinese: '一路线 · 死亡线',
    pinyin: 'yī lù xiàn · sǐ wáng xiàn',
    english: '1st Line (Death Line)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    shortDesc: '棋盘最边缘的一条线。气最少，最靠近悬崖，容易被吃。',
    fullDesc: '一路线（Line 1）紧贴棋盘悬崖绝壁，棋子在此处通常只有2~3口气且无处伸展。平时应尽量避免主动在一路上落子，以免掉落悬崖被提吃。',
    kidAnalogy: '就像悬崖边上的万丈深渊，稍微不留神就会掉下去摔碎！',
    demoBoardSize: 5,
    demoInitialStones: [
      { r: 0, c: 1, color: 'W' },
      { r: 1, c: 1, color: 'B' },
      { r: 0, c: 0, color: 'B' }
    ],
    demoInteractiveMoves: [{ r: 0, c: 2 }],
    demoExplanation: '在 C5 (一路悬崖) 封堵白子，白子在死亡线上瞬间被提吃！'
  },
  {
    id: 'line_2_escape',
    chinese: '二路线 · 逃生线',
    pinyin: 'èr lù xiàn · táo shēng xiàn',
    english: '2nd Line (Escape Line)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    shortDesc: '从边缘数第2条线。通常用于低头逃跑或连接，围不到大房子。',
    fullDesc: '二路线（Line 2）又称败退线或渡线。在危急时刻沿二路爬行可以保命连络，但“二路爬行难胜”，不能指望靠二路围出大目数。',
    kidAnalogy: '就像地下紧急逃生通道，只能用来低头逃跑，不能在里面盖大城堡！',
    demoBoardSize: 5,
    demoInitialStones: [{ r: 3, c: 2, color: 'B' }],
    demoInteractiveMoves: [{ r: 3, c: 1 }, { r: 3, c: 3 }],
    demoExplanation: '点击二路线上的 B2 或 D2，体验低位逃生连络！'
  },
  {
    id: 'line_3_territory',
    chinese: '三路线 · 实地线',
    pinyin: 'sān lù xiàn · shí dì xiàn',
    english: '3rd Line (Territory Line)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shortDesc: '围棋的黄金地盘线！圈地效率最高、最稳固的筑城线。',
    fullDesc: '三路线（Line 3）被称为“实地线”。下在三路不仅易于生根活棋，而且能以极高效率构筑城墙，将边角实地稳稳收入囊中。',
    kidAnalogy: '黄金盖房线！砌砖最快、墙壁最牢固，满满都是金币！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 2 }, { r: 3, c: 2 }],
    demoExplanation: '点击三路线上的 C4 交叉点，筑起坚不可摧的黄金城堡！'
  },
  {
    id: 'line_4_influence',
    chinese: '四路线 · 势力线',
    pinyin: 'sì lù xiàn · shì lì xiàn',
    english: '4th Line (Influence Line)',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    shortDesc: '高高站立，向中腹广阔天地放射强大影响力的大局线。',
    fullDesc: '四路线（Line 4）被称为“势力线”或“外势线”。站在四路居高临下，便于在中盘向中腹大平原发动猛烈攻势，统领全局战局。',
    kidAnalogy: '就像高高的瞭望塔和巨炮，向着星空宇宙发射强大的魔法力量！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 1 }],
    demoExplanation: '点击四路线上的 B4 星位，感受君临天下的大局气势！'
  },
  {
    id: 'corner_gold',
    chinese: '金角银边草肚皮',
    pinyin: 'jīn jiǎo yín biān cǎo dù pí',
    english: 'Corners Gold, Sides Silver, Center Grass',
    category: 'board_positions',
    categoryName: '棋盘地名',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    shortDesc: '围地效率角部最高（金），边上次之（银），中腹最难围（草）。',
    fullDesc: '角部依靠两条天然棋盘边界，只需极少棋子就能围出大领地；边部需一条边界；中腹四面漏风需大量棋子。',
    kidAnalogy: '在墙角盖房子只需要砌两面墙；在空地上盖房子要砌四面墙！',
    demoBoardSize: 5,
    demoInitialStones: [],
    demoInteractiveMoves: [{ r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 1 }, { r: 3, c: 3 }],
    demoExplanation: '四个角落的黄金星位是开局最有效率的占位点！'
  },

  // ==========================================
  // 🌱 基础概念 (Basic Concepts)
  // ==========================================
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
    demoExplanation: '点击 D3 (白子右侧) 堵住最后一口气，就能立即提吃这颗白子！'
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
    demoExplanation: '白子被叫吃中，红圈警报闪烁，只剩 D3 一口气！'
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
    demoExplanation: '中心 C3 是白子的虎口，黑子单独下进去属于自杀禁着点。'
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
    demoExplanation: '黑棋下在 C3 提掉白子，白棋下一步不得立即回提 D3。'
  },

  // ==========================================
  // ⚡ 吃子手筋 (Tesuji Tactics)
  // ==========================================
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
    demoExplanation: '下在 C4 或 D3，同时叫吃两颗白子！'
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
    demoExplanation: '勇敢把黑子投入 C3 诱饵点，白吃后黑棋立即回提！'
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
    demoExplanation: '下在 B3 关上大门，白子无路可逃！'
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
    demoExplanation: '在 D4 轻轻撒下一张网，白棋无法冲出！'
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

  // ==========================================
  // 🏰 死活眼位 (Life & Death)
  // ==========================================
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
    demoExplanation: '在 C3 稳健落子，将大空间划分为两只真眼！'
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

  // ==========================================
  // 👑 布局地盘 (Opening & Territory)
  // ==========================================
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
