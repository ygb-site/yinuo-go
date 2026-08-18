import type { StoneColor, Point } from '../engine/types';

export interface LevelStep {
  playerMove: Point;
  botResponse?: Point | null;
  botComment?: string;
}

export interface LevelItem {
  id: string;
  chapterId: number;
  chapterTitle: string;
  chapterTitleEn: string;
  chapterIcon: string;
  title: string;
  titleEn: string;
  subtitle: string;
  story: string;
  boardSize: number;
  initialStones: { r: number; c: number; color: StoneColor }[];
  playerColor: StoneColor;
  goal: string;
  goalEn: string;
  type: 'place_stone' | 'capture' | 'save' | 'make_life' | 'count_liberties' | 'step_by_step';
  solutionSequence?: LevelStep[];
  validMoves?: Point[];
  targetLibertiesCount?: number;
  hint: string;
  explanation: string;
  termBilingual: {
    chinese: string;
    pinyin: string;
    english: string;
    concept: string;
  };
  rewards: {
    stars: number;
    coins: number;
    exp: number;
  };
}

export interface ChapterInfo {
  id: number;
  title: string;
  titleEn: string;
  icon: string;
  themeColor: string;
  description: string;
  levels: LevelItem[];
}

export const CURRICULUM_CHAPTERS: ChapterInfo[] = [
  {
    id: 1,
    title: '第一章：走进棋盘与神奇的“气”',
    titleEn: 'Chapter 1: The Board & Magic Liberties',
    icon: '🌱',
    themeColor: 'from-emerald-400 to-teal-500',
    description: '认识九路小棋盘，学会数棋子的“呼吸通道”——气！',
    levels: [
      {
        id: 'c1_l1',
        chapterId: 1,
        chapterTitle: '走进棋盘与神奇的“气”',
        chapterTitleEn: 'The Board & Magic Liberties',
        chapterIcon: '🌱',
        title: '小黑子的第一口气',
        titleEn: 'The First Breath of a Stone',
        subtitle: '数数棋盘正中心的一颗子有几口气？',
        story: '你好呀小棋手！我是小诺~ 棋盘上的线交织的地方叫“交叉点”。棋子放在上面，它上下左右紧邻的空交叉点，就是它的“气”（Liberties），也就是它的呼吸孔哦！',
        boardSize: 5,
        initialStones: [{ r: 2, c: 2, color: 'B' }],
        playerColor: 'B',
        goal: '请观察中心的小黑子，它有上下左右 4 个呼吸孔，点击任意一个空交叉点给它作伴吧！',
        goalEn: 'Click any adjacent liberty point (Up, Down, Left, Right) to connect with it!',
        type: 'place_stone',
        validMoves: [{ r: 1, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 3 }],
        hint: '看正中间的黑子：它的上方(1,2)、下方(3,2)、左边(2,1)、右边(2,3)都是它的气哦！',
        explanation: '在围棋中，单独一颗棋子如果放在棋盘中间（中腹），最多拥有上下左右 4 口气。气是棋子的生命线！',
        termBilingual: {
          chinese: '气',
          pinyin: 'qì',
          english: 'Liberty / Liberties',
          concept: '直线紧挨着棋子的空交叉点。没有气的棋子就无法生存。'
        },
        rewards: { stars: 3, coins: 20, exp: 50 }
      },
      {
        id: 'c1_l2',
        chapterId: 1,
        chapterTitle: '走进棋盘与神奇的“气”',
        chapterTitleEn: 'The Board & Magic Liberties',
        chapterIcon: '🌱',
        title: '团结力量大：手拉手气更多',
        titleEn: 'Connected Stones Have More Air',
        subtitle: '连在一起的棋子会共享所有的气！',
        story: '小黑子一个人只有4口气，如果两颗黑子手拉手紧挨着（用直线连起来），它们就是一个整体，气会变得更多更结实哦！',
        boardSize: 5,
        initialStones: [{ r: 2, c: 2, color: 'B' }, { r: 2, c: 3, color: 'B' }],
        playerColor: 'B',
        goal: '在 (2, 1) 或者 (2, 4) 下一子，让黑子队伍变得更长！',
        goalEn: 'Place a stone at (2,1) or (2,4) to extend your black army!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 1 }, { r: 2, c: 4 }, { r: 1, c: 2 }, { r: 3, c: 2 }],
        hint: '手拉手连在一起的棋子叫“一条龙”或者“一块棋”，它们共享所有的外围空点！',
        explanation: '相连的同色棋子属于同一个“块”（Group），共享气数。连起来后，敌人更难一下子堵住所有的气！',
        termBilingual: {
          chinese: '连（连接）',
          pinyin: 'lián',
          english: 'Connect',
          concept: '将两颗或多颗同色棋子沿直线紧密相连，共同分享气与生命。'
        },
        rewards: { stars: 3, coins: 25, exp: 60 }
      },
      {
        id: 'c1_l3',
        chapterId: 1,
        chapterTitle: '走进棋盘与神奇的“气”',
        chapterTitleEn: 'The Board & Magic Liberties',
        chapterIcon: '🌱',
        title: '堵住对手的气',
        titleEn: 'Blocking Opponent Liberties',
        subtitle: '抢占白子身边的空位，让白子喘不过气！',
        story: '白子出现啦！它正大摇大摆地坐在中间。如果我们把黑子放在它身旁，就能堵住它的一口气（紧气）！',
        boardSize: 5,
        initialStones: [{ r: 2, c: 2, color: 'W' }, { r: 1, c: 2, color: 'B' }, { r: 3, c: 2, color: 'B' }],
        playerColor: 'B',
        goal: '在 (2, 1) 或 (2, 3) 落子，继续堵住白子的气！',
        goalEn: 'Place a stone to reduce the white stone to only 1 liberty!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 1 }, { r: 2, c: 3 }],
        hint: '白子现在只剩下左边 (2,1) 和右边 (2,3) 两口气了，快占领其中一个！',
        explanation: '把棋子下在对手棋子相邻的空位上，叫做“紧气”（Tighten Liberties）。当对手的气越来越少，就处于危险之中！',
        termBilingual: {
          chinese: '紧气',
          pinyin: 'jǐn qì',
          english: 'Tightening / Reducing Liberties',
          concept: '下在对方棋子的气位上，使对方的气数减少。'
        },
        rewards: { stars: 3, coins: 30, exp: 70 }
      },
      {
        id: 'c1_l4',
        chapterId: 1,
        chapterTitle: '走进棋盘与神奇的“气”',
        chapterTitleEn: 'The Board & Magic Liberties',
        chapterIcon: '🌱',
        title: '角部落单的小白子',
        titleEn: 'Corner Stones Have Fewer Liberties',
        subtitle: '角上的棋子天生只有 2 口气！',
        story: '棋盘的边缘和角上可不一样哦！角上的棋子被棋盘边界挡住了两边，天生只有 2 口气！看，右上角 (0, 4) 的白子很脆弱！',
        boardSize: 5,
        initialStones: [{ r: 0, c: 4, color: 'W' }, { r: 1, c: 4, color: 'B' }],
        playerColor: 'B',
        goal: '下在 (0, 3)，把角落白子的最后一口气叫吃！',
        goalEn: 'Place at (0,3) to put the corner white stone in Atari!',
        type: 'place_stone',
        validMoves: [{ r: 0, c: 3 }],
        hint: '角上的棋子只有 2 口气：下面 (1,4) 已经被黑子占领，只剩下左边 (0,3) 了！',
        explanation: '角部棋子天生只有 2 气，边上棋子天生只有 3 气，中央棋子有 4 气。因此角落更容易被包围吃掉！',
        termBilingual: {
          chinese: '角与边',
          pinyin: 'jiǎo yǔ biān',
          english: 'Corner & Side',
          concept: '角部边界紧缩，气最少（2气）；边上3气；中腹最开阔（4气）。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      }
    ]
  },
  {
    id: 2,
    title: '第二章：吃子大作战（叫吃与提子）',
    titleEn: 'Chapter 2: Capture Battles (Atari & Capture)',
    icon: '⚔️',
    themeColor: 'from-amber-400 to-orange-500',
    description: '掌握围棋最爽快的动作——提子（吃子）与叫吃预警！',
    levels: [
      {
        id: 'c2_l1',
        chapterId: 2,
        chapterTitle: '吃子大作战',
        chapterTitleEn: 'Capture Battles',
        chapterIcon: '⚔️',
        title: '什么是“叫吃”（打吃）？',
        titleEn: 'What is Atari?',
        subtitle: '当棋子只剩下最后 1 口气，警报响起！',
        story: '当一颗棋子（或一块棋）被包围得只剩下最后一口气时，就叫做“叫吃”（Atari，又称打吃）。这时候再下一子，就能把它抓走啦！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goal: '白子只剩右边 (2, 3) 最后一口气，快下在 (2, 3) 把它提掉！',
        goalEn: 'Place stone at (2,3) to capture the white stone!',
        type: 'capture',
        validMoves: [{ r: 2, c: 3 }],
        hint: '看闪烁的光圈，下在 (2, 3) 就能完成大快人心的提子！',
        explanation: '当对方棋子只剩最后一口气时，将这最后一口气占领并把对方棋子从棋盘上拿走，这一步叫“提子”（Capture）！',
        termBilingual: {
          chinese: '叫吃（打吃）/ 提子',
          pinyin: 'jiào chī / tí zǐ',
          english: 'Atari / Capture',
          concept: '叫吃是让对方剩1气；提子是堵住最后一口气并将死子从棋盘移除。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      },
      {
        id: 'c2_l2',
        chapterId: 2,
        chapterTitle: '吃子大作战',
        chapterTitleEn: 'Capture Battles',
        chapterIcon: '⚔️',
        title: '大胃王：一口气提吃两颗子',
        titleEn: 'Double Stone Capture',
        subtitle: '连在一起的两颗白子也只剩最后一口气啦！',
        story: '哇！两颗白子抱团在一起，但它们四周已经被黑子团团围住，只留下 (2, 3) 这一根微弱的吸管。',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 1, color: 'W' },
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 1, color: 'B' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 0, color: 'B' }
        ],
        playerColor: 'B',
        goal: '下在 (2, 3)，一下子提掉这两颗白子！',
        goalEn: 'Place at (2,3) to capture both white stones at once!',
        type: 'capture',
        validMoves: [{ r: 2, c: 3 }],
        hint: '点击右侧空位 (2,3)，享受双倍提子的快乐！',
        explanation: '连在一起的棋子同生共死。只要堵住它们共享的最后一口气，整块棋子都会被同时提走！',
        termBilingual: {
          chinese: '提多子',
          pinyin: 'tí duō zǐ',
          english: 'Group Capture',
          concept: '连成一体的棋子若全部失去气，将被整体提离棋盘。'
        },
        rewards: { stars: 3, coins: 45, exp: 100 }
      },
      {
        id: 'c2_l3',
        chapterId: 2,
        chapterTitle: '吃子大作战',
        chapterTitleEn: 'Capture Battles',
        chapterIcon: '⚔️',
        title: '绝处逢生：逃跑救出小黑子',
        titleEn: 'Escape from Danger',
        subtitle: '自己的棋子被叫吃了，该怎么逃跑？',
        story: '糟糕！我们的小黑子在 (2, 2) 被三颗白子包围，只剩 (2, 3) 一口气，亮起红灯啦！快下在 (2, 3) 和外界的小黑子会师，逃出生天！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'B' },
          { r: 1, c: 2, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'W' },
          { r: 1, c: 3, color: 'B' }
        ],
        playerColor: 'B',
        goal: '下在 (2, 3) 逃跑并连接同伴，增加气数！',
        goalEn: 'Play at (2,3) to connect with your friend and gain more liberties!',
        type: 'save',
        validMoves: [{ r: 2, c: 3 }],
        hint: '下在 (2, 3) 之后，黑子就连成一片，气数一下子变成 3 口气啦！',
        explanation: '当己方棋子被叫吃（剩1气）时，可以通过“长气”（延展）或者与友军“连接”来逃脱危险。',
        termBilingual: {
          chinese: '逃 / 长气',
          pinyin: 'táo / zhǎng qì',
          english: 'Escape / Extend Liberties',
          concept: '走出叫吃状态，让棋子重新获得更多的气。'
        },
        rewards: { stars: 3, coins: 50, exp: 110 }
      },
      {
        id: 'c2_l4',
        chapterId: 2,
        chapterTitle: '吃子大作战',
        chapterTitleEn: 'Capture Battles',
        chapterIcon: '⚔️',
        title: '别往陷阱跳：自杀步（禁着点）',
        titleEn: 'The Suicide Rule (Forbidden Points)',
        subtitle: '没有气又不能吃对方的地方，千万不能下！',
        story: '围棋有一条神圣的规则：如果你下在一个地方，落子后自己完全没有气，而且不能吃掉对方任何子，这就是“自杀”（禁着点），规则不允许这样走哦！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'W' },
          { r: 2, c: 3, color: 'W' }
        ],
        playerColor: 'B',
        goal: '中间 (2, 2) 是白子的老虎嘴，黑子下进去会自杀！请在外面安全的 (0, 0) 占位！',
        goalEn: 'Point (2,2) is a suicide trap. Play safely at (0,0) instead!',
        type: 'place_stone',
        validMoves: [{ r: 0, c: 0 }, { r: 0, c: 4 }, { r: 4, c: 0 }, { r: 4, c: 4 }],
        hint: '千万不要点中间被 4 颗白子围死的 (2,2)，那是禁着点！点角上的安全空位。',
        explanation: '禁着点（自杀步）是围棋的核心规则。但记住：如果落子虽然自己无气，但能【瞬间提吃】对方的棋子，那就不算自杀，是合法的！',
        termBilingual: {
          chinese: '禁着点 / 自杀',
          pinyin: 'jìn zhuó diǎn / zì shā',
          english: 'Illegal Point / Suicide Rule',
          concept: '落子后自身无气且无法提吃对方棋子的交叉点，禁止落子。'
        },
        rewards: { stars: 3, coins: 50, exp: 120 }
      }
    ]
  },
  {
    id: 3,
    title: '第三章：神奇吃子手筋宝典',
    titleEn: 'Chapter 3: Magical Tesuji Weapons',
    icon: '⚡',
    themeColor: 'from-purple-500 to-indigo-600',
    description: '掌握大师级吃子技巧：双叫吃、门吃、抱吃、枷吃与倒扑！',
    levels: [
      {
        id: 'c3_l1',
        chapterId: 3,
        chapterTitle: '神奇吃子手筋宝典',
        chapterTitleEn: 'Magical Tesuji Weapons',
        chapterIcon: '⚡',
        title: '双叫吃：顾此失彼的绝招',
        titleEn: 'Double Atari (Fork)',
        subtitle: '一步棋同时叫吃对方两处棋子！',
        story: '小狐狸阿福最喜欢的绝招登场啦！下在关键交叉点，同时把两颗互不相连的白子逼入只剩1气的绝境，白棋救得了左边救不了右边！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'W' },
          { r: 3, c: 3, color: 'W' },
          { r: 0, c: 1, color: 'B' },
          { r: 1, c: 0, color: 'B' },
          { r: 3, c: 4, color: 'B' },
          { r: 4, c: 3, color: 'B' }
        ],
        playerColor: 'B',
        goal: '找到那个神奇的十字路口 (2, 2) 或 (1, 3)，同时叫吃两颗白子！',
        goalEn: 'Find the magic fork point (2,2) or (1,2) to attack both white stones!',
        type: 'step_by_step',
        solutionSequence: [
          {
            playerMove: { r: 1, c: 2 },
            botResponse: { r: 0, c: 2 },
            botComment: '白棋试图救上边的子，但右下角的子完蛋啦！'
          },
          {
            playerMove: { r: 2, c: 3 },
            botResponse: null,
            botComment: '太棒啦！成功抓获白子！'
          }
        ],
        validMoves: [{ r: 1, c: 2 }, { r: 2, c: 3 }],
        hint: '下在 (1, 2) 可以同时压制 (1, 1) 的白子和附近的通路！',
        explanation: '“双叫吃”（Double Atari）是实战中最常见且威力巨大的手筋，对手一回合只能救一边，另一边必被吃掉！',
        termBilingual: {
          chinese: '双叫吃',
          pinyin: 'shuāng jiào chī',
          english: 'Double Atari',
          concept: '一子落下，同时对敌方两块或两颗棋子产生叫吃威胁。'
        },
        rewards: { stars: 3, coins: 60, exp: 140 }
      },
      {
        id: 'c3_l2',
        chapterId: 3,
        chapterTitle: '神奇吃子手筋宝典',
        chapterTitleEn: 'Magical Tesuji Weapons',
        chapterIcon: '⚡',
        title: '门吃：关起大门打敌人',
        titleEn: 'Gate Capture',
        subtitle: '两颗黑子像两扇大门，敌子一冲进来就关门！',
        story: '门吃就像两扇大门立在两旁。白子想从中间钻出来，黑子直接下在正前方，啪的一声把大门关上，白子无路可逃！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 1, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 2, c: 0, color: 'B' }
        ],
        playerColor: 'B',
        goal: '下在 (2, 1) 关上大门，叫吃并锁死中间的白子！',
        goalEn: 'Place at (2,1) like closing the gate to capture the intruder!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 1 }],
        hint: '看 (1,1) 和 (3,1) 就像两扇门柱，下在 (2,1) 正好把门栓插上！',
        explanation: '门吃（Gate Capture）：利用两颗同色棋子形成的门户，封住敌子出路并形成叫吃的手筋。',
        termBilingual: {
          chinese: '门吃',
          pinyin: 'mén chī',
          english: 'Gate Capture',
          concept: '像关门一样截断敌方前进道路并完成吃子。'
        },
        rewards: { stars: 3, coins: 60, exp: 140 }
      },
      {
        id: 'c3_l3',
        chapterId: 3,
        chapterTitle: '神奇吃子手筋宝典',
        chapterTitleEn: 'Magical Tesuji Weapons',
        chapterIcon: '⚡',
        title: '抱吃：像温暖的怀抱一样吃子',
        titleEn: 'Embrace Capture',
        subtitle: '把敌人往己方厚实的大本营怀里赶！',
        story: '抱吃讲究方向感！当敌人想逃跑时，我们要从外面往里兜过来，像张开温暖的双手把它抱回我们黑子的大怀抱里！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goal: '下在 (2, 3)，把白子往左边黑子的大包围圈里赶并叫吃！',
        goalEn: 'Place at (2,3) to herd the white stone into your waiting hug!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 3 }],
        hint: '从右边 (2, 3) 堵住，白子就被团团抱住啦！',
        explanation: '抱吃（Embrace Capture）：从外侧迎头叫吃，将对方逼向己方已经占优的厚势方向，使其无法逃脱。',
        termBilingual: {
          chinese: '抱吃',
          pinyin: 'bào chī',
          english: 'Embrace Capture',
          concept: '顺应敌方逃跑方向，兜头盖脸将其赶入己方包围圈中。'
        },
        rewards: { stars: 3, coins: 65, exp: 150 }
      },
      {
        id: 'c3_l4',
        chapterId: 3,
        chapterTitle: '神奇吃子手筋宝典',
        chapterTitleEn: 'Magical Tesuji Weapons',
        chapterIcon: '⚡',
        title: '倒扑：舍不得孩子套不着狼',
        titleEn: 'Snapback (Counter-throw)',
        subtitle: '故意送一颗子给对方吃，然后瞬间反吃一大片！',
        story: '这是围棋里最帅气、最神奇的魔术——倒扑（Snapback）！看这个虎口，黑棋故意送一颗子进去给白棋吃，白棋吃了之后反而只剩最后一口气，黑棋立刻反提！',
        boardSize: 5,
        initialStones: [
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
        playerColor: 'B',
        goal: '勇往直前！在 (2, 2) 投入诱饵黑子，发动倒扑神技！',
        goalEn: 'Throw your bait stone into (2,2) to execute the famous Snapback!',
        type: 'step_by_step',
        solutionSequence: [
          {
            playerMove: { r: 2, c: 2 },
            botResponse: { r: 2, c: 2 }, // Bot captures bait
            botComment: '哈哈！白棋贪吃把诱饵吃掉了，但现在白棋整体只剩 1 口气啦！'
          },
          {
            playerMove: { r: 2, c: 2 }, // Black snapback captures whole group!
            botResponse: null,
            botComment: '太厉害啦！倒扑大获全胜，提掉整片白子！'
          }
        ],
        validMoves: [{ r: 2, c: 2 }],
        hint: '不要害怕送吃，勇敢点在 (2, 2)！白棋提掉之后你可以在原位瞬间反提！',
        explanation: '倒扑（Snapback）：将己方棋子故意投入敌方虎口中送吃，诱使对方提子后气数紧缩为 1 气，从而立即回提对方整块棋子。',
        termBilingual: {
          chinese: '倒扑',
          pinyin: 'dào pū',
          english: 'Snapback',
          concept: '舍弃一子诱敌深入，待敌提吃后立即回提对方多颗棋子的高级手筋。'
        },
        rewards: { stars: 3, coins: 80, exp: 200 }
      },
      {
        id: 'c3_l5',
        chapterId: 3,
        chapterTitle: '神奇吃子手筋宝典',
        chapterTitleEn: 'Magical Tesuji Weapons',
        chapterIcon: '⚡',
        title: '接不归：想连却连不上的痛',
        titleEn: 'Connect and Die',
        subtitle: '气数不足，连上反而死得更多！',
        story: '有时候白棋想和同伴连起来，但因为外部气被收得太紧，连上之后依然是叫吃状态，根本逃不掉，这就叫“接不归”！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'W' },
          { r: 1, c: 2, color: 'W' },
          { r: 2, c: 2, color: 'W' },
          { r: 0, c: 1, color: 'B' },
          { r: 0, c: 2, color: 'B' },
          { r: 1, c: 0, color: 'B' },
          { r: 2, c: 0, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goal: '下在 (2, 1)，切断并直接叫吃这串白子！',
        goalEn: 'Place at (2,1) to make them unable to connect back safely!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 1 }],
        hint: '点在 (2, 1) 的断点上，白子就算连上也没有气了！',
        explanation: '接不归（Shortage of Liberties / Connect and Die）：对方数颗棋子气数极短，即便连在一起也依然处于叫吃状态无法脱身。',
        termBilingual: {
          chinese: '接不归',
          pinyin: 'jiē bù guī',
          english: 'Connect and Die (Crane Nest)',
          concept: '由于气数不足，弱子即便相连也依然难逃被提吃的命运。'
        },
        rewards: { stars: 3, coins: 75, exp: 180 }
      }
    ]
  },
  {
    id: 4,
    title: '第四章：死活城堡与做眼秘籍',
    titleEn: 'Chapter 4: Life, Death & Two Eyes',
    icon: '🏰',
    themeColor: 'from-rose-500 to-red-600',
    description: '围棋最核心的灵魂：真眼与假眼、做活两只眼保平安！',
    levels: [
      {
        id: 'c4_l1',
        chapterId: 4,
        chapterTitle: '死活城堡与做眼秘籍',
        chapterTitleEn: 'Life, Death & Two Eyes',
        chapterIcon: '🏰',
        title: '什么是“眼”？安全的小木屋',
        titleEn: 'What is an Eye?',
        subtitle: '被同色棋子完整围起来的空交叉点叫眼！',
        story: '棋子围成一圈，留出中间一个空位，这个空位就叫做“眼”（Eye）。敌人如果单下一颗子进眼位，因为没有气算自杀步，所以进不来！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 1, c: 1, color: 'B' },
          { r: 3, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goal: '在 (2, 3) 下子，完整封闭右边，做出一个安全的小眼！',
        goalEn: 'Place stone at (2,3) to complete the eye structure!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 3 }],
        hint: '把右侧 (2, 3) 堵上，中间 (2, 2) 就变成黑棋的小家啦！',
        explanation: '眼位是棋子生存的根据地。只有一只眼的棋，如果外部气全被收紧，敌人是可以下进眼位提子的；所以需要“两只独立的眼”！',
        termBilingual: {
          chinese: '眼 / 眼位',
          pinyin: 'yǎn / yǎn wèi',
          english: 'Eye / Eye Shape',
          concept: '被一方棋子四面包围形成的完整内部空交叉点。'
        },
        rewards: { stars: 3, coins: 70, exp: 160 }
      },
      {
        id: 'c4_l2',
        chapterId: 4,
        chapterTitle: '死活城堡与做眼秘籍',
        chapterTitleEn: 'Life, Death & Two Eyes',
        chapterIcon: '🏰',
        title: '火眼金睛：真眼还是假眼？',
        titleEn: 'Real Eye vs False Eye',
        subtitle: '看清楚对角点！对角被占就会变成假眼！',
        story: '小心！不是所有看起来像眼的地方都是安全的。如果对角被敌人占据，这颗眼就是“假眼”（False Eye），关键时刻会漏风被吃掉！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'B' },
          { r: 1, c: 3, color: 'B' },
          { r: 2, c: 0, color: 'B' },
          { r: 2, c: 2, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 3, c: 3, color: 'B' },
          { r: 0, c: 2, color: 'W' } // White occupying diagonal
        ],
        playerColor: 'B',
        goal: '在 (2, 1) 或者 (2, 3) 巩固连接，保护真正的眼位！',
        goalEn: 'Protect the genuine real eye by reinforcing connection!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 1 }, { r: 2, c: 3 }, { r: 1, c: 2 }],
        hint: '中腹的真眼需要至少 3 个对角点安全！下在 (1, 2) 紧密连接！',
        explanation: '真眼（Real Eye）是稳固不可破的；假眼（False Eye）因为对角缺陷，在紧气时会被对方叫吃提走。',
        termBilingual: {
          chinese: '真眼 vs 假眼',
          pinyin: 'zhēn yǎn vs jiǎ yǎn',
          english: 'Real Eye vs False Eye',
          concept: '真眼对角完整不漏风；假眼对角受制于人，无法作为活棋依靠。'
        },
        rewards: { stars: 3, coins: 75, exp: 170 }
      },
      {
        id: 'c4_l3',
        chapterId: 4,
        chapterTitle: '死活城堡与做眼秘籍',
        chapterTitleEn: 'Life, Death & Two Eyes',
        chapterIcon: '🏰',
        title: '两只真眼保平安（活棋）',
        titleEn: 'Two Eyes Live! (Life)',
        subtitle: '只要拥有两只独立的真眼，神仙也吃不掉！',
        story: '围棋里最强大的魔法：【两眼活棋】！因为白棋不能同时在两个眼位落子，无论如何都不可能提吃拥有两个真眼的黑棋！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'B' },
          { r: 1, c: 2, color: 'B' },
          { r: 1, c: 3, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 3, c: 3, color: 'B' },
          { r: 2, c: 0, color: 'B' },
          { r: 2, c: 4, color: 'B' }
        ],
        playerColor: 'B',
        goal: '在中间 (2, 2) 下子！将一大个空间一分为二，做成左右两只完美的真眼！',
        goalEn: 'Play at (2,2) to divide the room into TWO independent real eyes!',
        type: 'make_life',
        validMoves: [{ r: 2, c: 2 }],
        hint: '点在最关键的“分水岭” (2, 2)，左边一个眼 (2,1)，右边一个眼 (2,3)，万无一失！',
        explanation: '“两眼活棋”是围棋死活的根本真理。两只完全独立的真眼，对手永远无法完成同时紧气，棋子永久存活！',
        termBilingual: {
          chinese: '做活（两眼做活）',
          pinyin: 'zuò huó',
          english: 'Making Life (Living Group)',
          concept: '做出两只或更多独立真眼，使整块棋立于不败之地。'
        },
        rewards: { stars: 3, coins: 85, exp: 210 }
      },
      {
        id: 'c4_l4',
        chapterId: 4,
        chapterTitle: '死活城堡与做眼秘籍',
        chapterTitleEn: 'Life, Death & Two Eyes',
        chapterIcon: '🏰',
        title: '点眼杀棋：抢占敌人的做活要点',
        titleEn: 'Eye-Stealing to Kill',
        subtitle: '敌之要点即我之要点，抢先破坏做眼！',
        story: '熊猫师傅说：“敌人的关键命门，就是我们的出击点！”白棋正想在中间做出两只眼，我们抢先一步点进它的做活要点！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'W' },
          { r: 1, c: 2, color: 'W' },
          { r: 1, c: 3, color: 'W' },
          { r: 3, c: 1, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 3, c: 3, color: 'W' },
          { r: 2, c: 0, color: 'W' },
          { r: 2, c: 4, color: 'W' }
        ],
        playerColor: 'B',
        goal: '抢占核心急所 (2, 2) 点眼，让白棋无法做出两只眼！',
        goalEn: 'Occupy the vital center point (2,2) to prevent white from living!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 2 }],
        hint: '毫不犹豫点在 (2, 2)！破坏它的两眼分割线！',
        explanation: '点眼（Eye-Stealing Move）：在对方要做成两眼的交界关键点抢先落子，将其眼位变成死形或假眼。',
        termBilingual: {
          chinese: '点眼 / 破眼',
          pinyin: 'diǎn yǎn / pò yǎn',
          english: 'Eye-Stealing / Killing Move',
          concept: '占据对方做眼的唯一急所，使对方无法形成两只活眼。'
        },
        rewards: { stars: 3, coins: 85, exp: 220 }
      }
    ]
  },
  {
    id: 5,
    title: '第五章：圈地盘与大师对局',
    titleEn: 'Chapter 5: Territory & Board Mastery',
    icon: '👑',
    themeColor: 'from-blue-500 to-cyan-500',
    description: '金角银边草肚皮、围出最多地盘、赢得整盘对局！',
    levels: [
      {
        id: 'c5_l1',
        chapterId: 5,
        chapterTitle: '圈地盘与大师对局',
        chapterTitleEn: 'Chapter 5: Territory & Board Mastery',
        chapterIcon: '👑',
        title: '金角银边草肚皮',
        titleEn: 'Corners, Sides, Center',
        subtitle: '为什么大家都喜欢先抢占角落？',
        story: '围棋界最有名的一句口诀：金角、银边、草肚皮！在角上只要几颗子就能围出一大片地盘（金子般珍贵），在边上次之（银子），在中腹最费力气（像草一样）。',
        boardSize: 7,
        initialStones: [],
        playerColor: 'B',
        goal: '请在星位黄金角落 (2, 2) 或者 (2, 4) 投下你的第一颗金子棋！',
        goalEn: 'Place your opening stone at the golden corner (2,2) or (2,4)!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 2 }, { r: 4, c: 4 }],
        hint: '点在四个角落的星位点（比如 2,2），效率最高！',
        explanation: '角部有棋盘天然两堵边墙相助，围地效率最高；因此开局布局（Opening）普遍先占角、再占边、最后争中腹。',
        termBilingual: {
          chinese: '金角银边草肚皮',
          pinyin: 'jīn jiǎo yín biān cǎo dù pí',
          english: 'Corners are Gold, Sides are Silver, Center is Grass',
          concept: '阐明围棋布局阶段占地效率的黄金法则。'
        },
        rewards: { stars: 3, coins: 90, exp: 240 }
      },
      {
        id: 'c5_l2',
        chapterId: 5,
        chapterTitle: '圈地盘与大师对局',
        chapterTitleEn: 'Chapter 5: Territory & Board Mastery',
        chapterIcon: '👑',
        title: '围出我们的大领地',
        titleEn: 'Fencing Large Territory',
        subtitle: '用最少的棋子，围出最广阔安全的城堡！',
        story: '看看我们的黑棋防线！只要下在 (3, 3) 筑起中路城墙，整片左下方就全部成为黑棋的领地（目数）啦！',
        boardSize: 7,
        initialStones: [
          { r: 2, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 5, color: 'W' },
          { r: 3, c: 5, color: 'W' }
        ],
        playerColor: 'B',
        goal: '在 (3, 3) 建立核心枢纽，守住左半边大领地！',
        goalEn: 'Play at (3,3) to secure the large left-hand territory!',
        type: 'place_stone',
        validMoves: [{ r: 3, c: 3 }],
        hint: '在 (3, 3) 落子，连结上下黑子，构筑铜墙铁壁！',
        explanation: '围棋的最终胜负不是看谁吃子多，而是看谁围到的“领地”（目数 / Territory）更多！高效围地是获胜的王道。',
        termBilingual: {
          chinese: '地盘 / 目数',
          pinyin: 'dì pán / mù shù',
          english: 'Territory / Points (Moku)',
          concept: '对局结束时，一方完全控制并围住的空交叉点数量。'
        },
        rewards: { stars: 3, coins: 95, exp: 250 }
      },
      {
        id: 'c5_l3',
        chapterId: 5,
        chapterTitle: '圈地盘与大师对局',
        chapterTitleEn: 'Chapter 5: Territory & Board Mastery',
        chapterIcon: '👑',
        title: '官子决战：堵住边界最后漏洞',
        titleEn: 'Endgame: Closing the Border',
        subtitle: '对局最后一步：收官定乾坤！',
        story: '对局接近尾声，这叫“官子阶段”（Endgame）。白棋想要从 (2, 4) 钻进我们的领地，快在 (2, 4) 把它严严实实挡在门外！',
        boardSize: 7,
        initialStones: [
          { r: 1, c: 3, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 3, c: 3, color: 'B' },
          { r: 2, c: 5, color: 'W' }
        ],
        playerColor: 'B',
        goal: '在 (2, 4) 挡住白棋的侵入，完成收官！',
        goalEn: 'Block the white stone at (2,4) to finalize the boundary!',
        type: 'place_stone',
        validMoves: [{ r: 2, c: 4 }],
        hint: '在 (2, 4) 迎头痛击（挡），保卫每一目地盘！',
        explanation: '官子（Endgame）：双方划定最后边界的阶段。每守住一个交叉点就多得一目棋，细心收官往往能反败为胜！',
        termBilingual: {
          chinese: '官子 / 收官',
          pinyin: 'guān zǐ / shōu guān',
          english: 'Endgame (Yose)',
          concept: '对局后期将边界完全封闭、确定所有领地目数归属的过程。'
        },
        rewards: { stars: 3, coins: 100, exp: 300 }
      }
    ]
  }
];


