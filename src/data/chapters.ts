import type { StoneColor, Point, BoardSize } from '../engine/types';

/**
 * 死活题/教学题多分支走法节点 (Multi-Branch Puzzle Decision Node)
 */
export interface PuzzleNode {
  coord: Point;
  comment: string;
  isCorrect: boolean;
  opponentResponse?: {
    coord: Point;
    comment: string;
  } | null;
  nextBranches?: PuzzleNode[];
}

/**
 * 关卡定义 (Lesson Definition)
 */
export interface Lesson {
  id: string;
  chapterId: number;
  type: 'story' | 'puzzle'; // story 讲解模式 | puzzle 死活练习模式
  title: string;
  titleEn: string;
  subtitle: string;
  description: string;
  storyDialogues?: string[];
  boardSize: BoardSize;
  initialStones: { r: number; c: number; color: StoneColor }[];
  playerColor: StoneColor;
  goalText: string;
  goalTextEn: string;
  targetHighlight?: Point[];
  puzzleRoot?: PuzzleNode[];
  hint: string;
  explanation: string;
  bilingualTerm: {
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

/**
 * 章节定义 (Chapter Definition)
 */
export interface Chapter {
  id: number;
  title: string;
  titleEn: string;
  icon: string;
  themeColor: string;
  description: string;
  lessons: Lesson[];
}

export const CHAPTERS_DATA: Chapter[] = [
  // ==========================================
  // 第一章：小精灵的呼吸与吃子魔法（规则启蒙与气）
  // ==========================================
  {
    id: 1,
    title: '第一章：小精灵的呼吸与吃子魔法（规则与气）',
    titleEn: 'Chapter 1: Stone Spirits & The Magic of Capture',
    icon: '✨',
    themeColor: 'from-emerald-400 to-teal-500',
    description: '欢迎来到围棋世界！认识棋盘交叉点、棋子的呼吸管（气）、叫吃预警与吃子魔法！通关解锁【吃子对弈场】！',
    lessons: [
      {
        id: 'lesson_1_1',
        chapterId: 1,
        type: 'story',
        title: '1-1 棋盘与黑白小精灵',
        titleEn: '1-1 Board & Spirit Stones',
        subtitle: '认识交叉点与正中心天元',
        description: '围棋棋子不下在方格子里，而是住在“横线与竖线的交叉点”上！黑先白后，一人下一颗。',
        storyDialogues: [
          '你好呀！我是导师小诺~ 欢迎来到神奇的围棋世界！🐼',
          '请仔细看棋盘：围棋棋子不是放在方格子里，而是稳稳落在【交叉点】上！',
          '棋盘正中间那个最亮的点叫做【天元】（Tengen）。快在正中间的交叉点（C3）落下你的第一颗黑精灵吧！'
        ],
        boardSize: 5,
        initialStones: [],
        playerColor: 'B',
        goalText: '点击棋盘正中心天元（C3 交叉点）放置第一颗黑子！',
        goalTextEn: 'Click the center Tengen point (C3) to place your stone!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '太棒啦！棋子稳稳落在交叉点上！黑白小精灵正式开启冒险之旅！',
            isCorrect: true
          }
        ],
        hint: '请点击正中间闪闪发光的交叉点 C3。',
        explanation: '围棋棋盘由纵横交叉的直线构成，棋子必须下在线与线的交叉点上。黑棋先下，白棋后下，轮流落子，落子后不能随意移动。',
        bilingualTerm: {
          chinese: '交叉点与天元',
          pinyin: 'jiāo chā diǎn & tiān yuán',
          english: 'Intersections & Tengen',
          concept: '棋子着点必须是纵横线交叉处，正中心最醒目的星位称为天元。'
        },
        rewards: { stars: 3, coins: 25, exp: 60 }
      },
      {
        id: 'lesson_1_2',
        chapterId: 1,
        type: 'story',
        title: '1-2 棋子的呼吸通道：气',
        titleEn: '1-2 Stone Breathing (Liberties)',
        subtitle: '数清棋子四周的4条呼吸管',
        description: '棋子就像小精灵一样需要呼吸！紧挨着它四周的直线就是它的【呼吸管道（气）】。',
        storyDialogues: [
          '黑子落下了，它也是有生命的哦！看它上下左右连着的4条直线，就是它的【气】（呼吸管道）！',
          '中间的子有4口气，边上的子有3口气，角落的子只有2口气！',
          '如果让两个黑子手拉手连在一起，气就会合在一起变多！快在黑子上方（C2）下子，帮它们连手长气吧！'
        ],
        boardSize: 5,
        initialStones: [{ r: 2, c: 2, color: 'B' }],
        playerColor: 'B',
        goalText: '在黑子上方（C2）落子，手拉手连起来增加呼吸管！',
        goalTextEn: 'Play on C2 to connect with the black stone and increase liberties!',
        targetHighlight: [{ r: 1, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 2 },
            comment: '手拉手好朋友！两颗黑子连成一体，呼吸管（气）一下子变成6条啦！',
            isCorrect: true
          }
        ],
        hint: '点击黑子正上方的交叉点 C2。',
        explanation: '与棋子直接相邻且未被占领的交叉点称为“气”（Liberties）。单子在中央有4气，边上有3气，角上有2气。互相紧挨连接的同色棋子共享所有气！',
        bilingualTerm: {
          chinese: '气',
          pinyin: 'qì',
          english: 'Liberties (Qi)',
          concept: '棋子在棋盘上生存所依赖的相邻空交叉点，无气则死。'
        },
        rewards: { stars: 3, coins: 25, exp: 60 }
      },
      {
        id: 'lesson_1_3',
        chapterId: 1,
        type: 'puzzle',
        title: '1-3 危险警报拉响：叫吃（打吃）',
        titleEn: '1-3 Danger Alarm: Atari!',
        subtitle: '只剩最后一口气的危险预警',
        description: '当对方棋子的气被堵得只剩下【最后1口】时，就叫【叫吃】（Atari）！危险红灯闪烁！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在白子左侧（B3）落子，堵住它左边的呼吸管，形成【叫吃】！',
        goalTextEn: 'Play on B3 to reduce the white stone to its final liberty (Atari)!',
        targetHighlight: [{ r: 2, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 1 },
            comment: '滴嘟滴嘟！白棋现在只剩右边最后1口气啦！打吃成功！',
            isCorrect: true
          }
        ],
        hint: '在白子左侧交叉点 B3（r:2, c:1）下黑子堵住气。',
        explanation: '当一方落子后，使对方某块棋子仅剩最后一口气，下一步即可提掉的状态称为“叫吃”（打吃 / Atari）。',
        bilingualTerm: {
          chinese: '叫吃（打吃）',
          pinyin: 'jiào chī / dǎ chī',
          english: 'Atari',
          concept: '棋子只剩下最后一口气的紧迫状态，对方下一步就能提走。'
        },
        rewards: { stars: 3, coins: 30, exp: 70 }
      },
      {
        id: 'lesson_1_4',
        chapterId: 1,
        type: 'puzzle',
        title: '1-4 抓捕白怪大作战：提子',
        titleEn: '1-4 Capture the Spirit: Capture!',
        subtitle: '拔掉最后一口气，把被吃的白子抓出棋盘',
        description: '白棋已经只剩最后1口气啦！把这最后一口气堵死，就能把白子提离棋盘，收入俘虏盒！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在白子右侧最后一口气（D3）落子，完成【提子】！',
        goalTextEn: 'Place black on D3 to completely surround and capture the white stone!',
        targetHighlight: [{ r: 2, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 3 },
            comment: '啪！清脆提子！白棋四周全部没气，被吃掉拿走啦！太爽啦！',
            isCorrect: true
          }
        ],
        hint: '请点击白子右侧唯一的呼吸空位 D3（r:2, c:3）。',
        explanation: '当下下一子使对方棋子完全失去所有的气时，该棋子立即被提走移出棋盘，称为“提子”（Capture）。提走的棋子为俘虏（死子）。',
        bilingualTerm: {
          chinese: '提子',
          pinyin: 'tí zǐ',
          english: 'Capture / Take Stones',
          concept: '下子拔掉对方最后一口气，将无气敌子移出棋盘的动作。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_1_5',
        chapterId: 1,
        type: 'puzzle',
        title: '1-5 危险自救：逃跑与长气',
        titleEn: '1-5 Escape and Extend Liberties',
        subtitle: '黑子被叫吃了，快逃到安全空旷的地方！',
        description: '黑子被白棋包围叫吃，只剩上方最后1口气！快往空旷上方逃跑，增加呼吸管！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'W' },
          { r: 2, c: 3, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在上方（C2）落子逃跑，帮黑子长出更多气！',
        goalTextEn: 'Play on C2 to extend liberties and escape the danger!',
        targetHighlight: [{ r: 1, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 2 },
            comment: '太棒啦！黑子成功逃出生天，手拉手长出了3条新气，安全啦！',
            isCorrect: true
          }
        ],
        hint: '点击上方唯一的逃生出口 C2（r:1, c:2）。',
        explanation: '当自己的棋子被叫吃时，若不想被对方提掉，可以通过向宽广处逃跑（长气 / 连回）来摆脱危机。',
        bilingualTerm: {
          chinese: '长气与逃跑',
          pinyin: 'zhǎng qì & táo pǎo',
          english: 'Extend Liberties & Escape',
          concept: '增加自身棋子气数的下法，是防守自救的基本功。'
        },
        rewards: { stars: 3, coins: 30, exp: 70 }
      },
      {
        id: 'lesson_1_6',
        chapterId: 1,
        type: 'story',
        title: '1-6 危险禁区：禁着点（不能自杀）',
        titleEn: '1-6 Forbidden Point (No Suicide)',
        subtitle: '自身无气且不能吃对方的位置严禁落子',
        description: '四周都被敌人堵死且没有气的地方，自己跳进去就是自杀，围棋规则严禁下在【禁着点】！但若能提吃敌人就可以下！',
        storyDialogues: [
          '小棋手注意啦！棋盘上有一些“无底深渊”，掉进去自己就会没命！',
          '请看中间被4颗白棋紧紧围住的那个十字路口，黑子放进去自身立刻0气，且吃不掉任何白棋，这就是【禁着点】（禁止落子）！',
          '聪明的小棋手不会自投罗网，我们在安全的开阔星位（D4）下子吧！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'W' },
          { r: 2, c: 3, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '避开中间的自杀禁着点，在安全开阔的右下星位（D4）落子！',
        goalTextEn: 'Avoid the suicide trap and place your stone safely on D4!',
        targetHighlight: [{ r: 3, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 3, c: 3 },
            comment: '太机智啦！识破自杀陷阱，下在安全大路上！第一章圆满毕业！',
            isCorrect: true
          }
        ],
        hint: '请点击右下角安全的星位 D4（r:3, c:3）。',
        explanation: '围棋规则禁止“自杀”：如果某交叉点落子后自身无气，且无法提掉对方任何棋子，则该点为“禁着点”。但若落子能提掉对方，则该步合法且属于提子。',
        bilingualTerm: {
          chinese: '禁着点',
          pinyin: 'jìn zhuó diǎn',
          english: 'Forbidden Point / Suicide Point',
          concept: '落子后自身处于无气状态且不能提吃敌子的交叉点，规则禁止落子。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      }
    ]
  },

  // ==========================================
  // 第二章：捕鱼小达人（经典吃子手筋与武器库）
  // ==========================================
  {
    id: 2,
    title: '第二章：捕鱼小达人（经典吃子手筋）',
    titleEn: 'Chapter 2: Tactical Capture Arsenal (Tesuji)',
    icon: '🎣',
    themeColor: 'from-amber-400 to-orange-500',
    description: '掌握双叫吃、抱吃、门吃、扭羊头、大网飞枷与神奇倒扑！通关解锁【60秒反应乐园】与【双人面对面】！',
    lessons: [
      {
        id: 'lesson_2_1',
        chapterId: 2,
        type: 'puzzle',
        title: '2-1 双叫吃：一石二鸟',
        titleEn: '2-1 Double Atari (Two Birds One Stone)',
        subtitle: '一子落下，同时叫吃两处敌子',
        description: '一箭双雕！一颗黑子落下来，同时把左右两个小白怪都打到只剩1口气！对方顾得了头顾不了尾！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'W' },
          { r: 0, c: 2, color: 'B' },
          { r: 2, c: 0, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在交叉点（B2）落子，同时叫吃两颗白子！',
        goalTextEn: 'Play on B2 to deliver a devastating Double Atari!',
        targetHighlight: [{ r: 1, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 1 },
            comment: '漂亮的一箭双雕！两颗白子同时被叫吃，必吃其一！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 1, c: 3 },
              comment: '白棋试图救上方白子，但另一颗已经逃不掉啦！'
            }
          }
        ],
        hint: '请点击两颗白子夹角的中间要害点 B2（r:1, c:1）。',
        explanation: '“双叫吃”（Double Atari）是一子落下同时使对方两处棋子各剩一口气的绝妙战术，对方只能救一处，我方必能提吃另一处。',
        bilingualTerm: {
          chinese: '双叫吃',
          pinyin: 'shuāng jiào chī',
          english: 'Double Atari (Ryō-atari)',
          concept: '一步棋同时叫吃对方两块不同的棋子，是启蒙实战杀伤力最大的手筋。'
        },
        rewards: { stars: 3, coins: 30, exp: 70 }
      },
      {
        id: 'lesson_2_2',
        chapterId: 2,
        type: 'puzzle',
        title: '2-2 抱吃（往怀里赶）',
        titleEn: '2-2 Hug Capture (Embrace)',
        subtitle: '把敌子往自家怀里赶，堵住逃跑路线',
        description: '白棋想往外逃？像张开双臂抱抱一样，把白棋往自家棋子多的怀里赶！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 4, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在左侧（B3）落子，把白子往右边黑子的怀里赶！',
        goalTextEn: 'Play on B3 to steer the white stone into your friendly embrace!',
        targetHighlight: [{ r: 2, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 1 },
            comment: '抱吃成功！白子被赶进黑子大本营的怀里，插翅难飞！',
            isCorrect: true
          }
        ],
        hint: '请在白子左侧 B3（r:2, c:1）叫吃，逼它往右边怀里撞。',
        explanation: '“抱吃”是顺应对方逃跑方向，将其往己方坚实阵地或棋盘边缘逼赶的叫吃方法。',
        bilingualTerm: {
          chinese: '抱吃',
          pinyin: 'bào chī',
          english: 'Embrace / Hug Capture',
          concept: '从敌子背后叫吃，将其逼入己方重兵包围圈中顺势提吃。'
        },
        rewards: { stars: 3, coins: 30, exp: 70 }
      },
      {
        id: 'lesson_2_3',
        chapterId: 2,
        type: 'puzzle',
        title: '2-3 门吃（双子关门）',
        titleEn: '2-3 Door / Gate Capture',
        subtitle: '两扇大门一关，插上门闩',
        description: '两颗黑子就像两扇大门，敌人从门缝钻出来，立刻关门上闩把它吃掉！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 3, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在上方门头（C2）落子，关门打狗，吃掉白子！',
        goalTextEn: 'Play on C2 to slam the door shut and capture the trapped stone!',
        targetHighlight: [{ r: 1, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 2 },
            comment: '大门关上，门闩插好！白子被牢牢关在门里提走啦！',
            isCorrect: true
          }
        ],
        hint: '请在上方门口 C2（r:1, c:2）落子提吃。',
        explanation: '利用两旁已存在的己方棋子作为“门框”，在敌子逃跑前方落子阻截并将其提吃，形象称为“门吃”。',
        bilingualTerm: {
          chinese: '门吃',
          pinyin: 'mén chī',
          english: 'Door / Gate Capture',
          concept: '利用两侧棋子如同门框的形状，在正前方关门截杀敌子。'
        },
        rewards: { stars: 3, coins: 30, exp: 70 }
      },
      {
        id: 'lesson_2_4',
        chapterId: 2,
        type: 'puzzle',
        title: '2-4 征吃（扭羊头）',
        titleEn: '2-4 The Ladder (Shicho)',
        subtitle: '连续交替叫吃，一路追杀到悬崖边',
        description: '像小羊扭头一样左右连续叫吃，白棋跑一步就叫吃一步，一路追到悬崖边！',
        boardSize: 7,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在右侧（D3）叫吃，逼白子往下方逃跑！',
        goalTextEn: 'Play on D3 to deliver the first step of the relentless Ladder!',
        targetHighlight: [{ r: 2, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 3 },
            comment: '第一步叫吃！白棋只能往下逃！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 3, c: 2 },
              comment: '白子试图向下逃跑！'
            },
            nextBranches: [
              {
                coord: { r: 3, c: 1 },
                comment: '漂亮！再次从左侧叫吃，扭羊头成功捕获！',
                isCorrect: true
              }
            ]
          }
        ],
        hint: '从右边 D3（r:2, c:3）封堵叫吃，逼迫白子转向。',
        explanation: '“征吃”（又称扭羊头 / Ladder）是连续以之字形折线反复叫吃敌子，直至将其赶到棋盘边缘或撞上己方厚势提吃的经典杀法。',
        bilingualTerm: {
          chinese: '征吃（扭羊头）',
          pinyin: 'zhēng chī / niǔ yáng tóu',
          english: 'The Ladder (Shicho)',
          concept: '交替从两侧连续叫吃，呈阶梯状逼死逃跑敌子的手筋。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_2_5',
        chapterId: 2,
        type: 'puzzle',
        title: '2-5 枷吃（飞枷织大网）',
        titleEn: '2-5 The Net (Geta)',
        subtitle: '天罗地网，虚虚罩住敌方逃路',
        description: '不用贴身硬拼，在白子前方飞一步织一张大网，白棋怎么钻都逃不出大网！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在斜上方（D2）飞枷织网，罩住白子逃跑路线！',
        goalTextEn: 'Play on D2 to cast a loose yet inescapable net over the white stone!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '神之一枷！大网张开，白子无论往哪跑都是死路一条！',
            isCorrect: true
          }
        ],
        hint: '在白子斜上方交叉点 D2（r:1, c:3）落子织网。',
        explanation: '“枷吃”（Geta / The Net）是不直接贴身叫吃，而是拉开一格距离虚扣在敌子前方，封死其所有逃生分支的精妙手筋。比征子更稳健，不受引征影响。',
        bilingualTerm: {
          chinese: '枷吃（飞枷）',
          pinyin: 'jiā chī',
          english: 'The Net (Geta)',
          concept: '不贴身叫吃，而是隔一路虚罩封锁敌子逃路的高效手筋。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_2_6',
        chapterId: 2,
        type: 'puzzle',
        title: '2-6 倒扑（诱敌深入的魔术）',
        titleEn: '2-6 The Snapback (Uttegaeshi)',
        subtitle: '故意送给敌人一口，随后反提整块大鱼',
        description: '神奇的围棋魔术！故意送1颗黑子给白棋吃，等白棋吃了它自己只剩1口气，立刻反手提走整串白棋！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 2, c: 2, color: 'W' },
          { r: 0, c: 2, color: 'B' },
          { r: 1, c: 1, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在白棋虎口要害（D2 / r:1, c:3）投子倒扑！',
        goalTextEn: 'Sacrifice a stone into the tiger mouth at D2 to trigger a snapback!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '诱饵投下！白棋吃了这颗黑子，自身立刻变成1口气！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 1, c: 3 },
              comment: '白棋贪吃提走黑子，但自己只剩最后一口气啦！'
            },
            nextBranches: [
              {
                coord: { r: 1, c: 3 },
                comment: '反提！整串白棋全部被提掉！倒扑大获全胜！',
                isCorrect: true
              }
            ]
          }
        ],
        hint: '在白棋右侧的虎口心窝 D2（r:1, c:3）送入一颗黑子。',
        explanation: '“倒扑”（Snapback / Uttegaeshi）是故意弃子送入对方虎口中被提，使对方棋子气数减至一口，进而立即反提对方整块棋子的奇妙手筋。',
        bilingualTerm: {
          chinese: '倒扑',
          pinyin: 'dào pū',
          english: 'The Snapback (Uttegaeshi)',
          concept: '弃子诱敌自紧其气，随后反提对方多颗棋子的战术。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      }
    ]
  },

  // ==========================================
  // 第三章：死活城堡与无敌安全屋（眼位与活棋）
  // ==========================================
  {
    id: 3,
    title: '第三章：死活城堡与无敌安全屋（眼位与活棋）',
    titleEn: 'Chapter 3: The Living Castle (Eyes & Life)',
    icon: '🏰',
    themeColor: 'from-rose-400 to-amber-500',
    description: '认识小鸟安全屋（眼位）、真假眼识别、两眼活棋不死身与直三破眼！通关解锁【每日死活练兵场】与【错题本】！',
    lessons: [
      {
        id: 'lesson_3_1',
        chapterId: 3,
        type: 'story',
        title: '3-1 认识眼位：小鸟的安全屋',
        titleEn: '3-1 Eye Space: The Safe Haven',
        subtitle: '被己方完全包围的空交叉点',
        description: '被黑棋紧紧包围在中间的空交叉点叫做【眼】！敌人跳进来就是自杀禁着点，完全下不进来！',
        storyDialogues: [
          '小棋手，你想让你的棋子永远不被敌人吃掉吗？',
          '答案就是——建造【安全屋（眼位）】！',
          '请看中间被黑棋团团围住的交叉点 C3，白棋根本不敢下进来（自杀违规）！快在边上落子加固城墙吧！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在右侧（D3）落子，把城墙完全合拢，形成完美的【眼位】！',
        goalTextEn: 'Play on D3 to enclose a complete safe eye space!',
        targetHighlight: [{ r: 2, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 3 },
            comment: '完美的眼位建好啦！中间空地变成了敌人的自杀禁区！',
            isCorrect: true
          }
        ],
        hint: '点击右侧空位 D3（r:2, c:3）闭合眼位。',
        explanation: '由同一色棋子完全包围而形成的一个或多个空交叉点称为“眼”（Eye）。由于对方无法在无气情况下自杀落入，眼位构成了防守的核心屏障。',
        bilingualTerm: {
          chinese: '眼位',
          pinyin: 'yǎn wèi',
          english: 'Eye / Eye Space',
          concept: '被己方棋子完全包围的空交叉点，是做活的基本单元。'
        },
        rewards: { stars: 3, coins: 30, exp: 70 }
      },
      {
        id: 'lesson_3_2',
        chapterId: 3,
        type: 'puzzle',
        title: '3-2 辨别真眼与假眼',
        titleEn: '3-2 Real Eye vs False Eye',
        subtitle: '对角漏风的假眼不是安全屋，会被分断提走',
        description: '小心陷阱！如果眼位的对角被敌人占领，城墙就会漏风，变成【假眼】！快补强关键连接点！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 1, c: 1, color: 'W' },
          { r: 3, c: 1, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在关键斜角（D2）落子补强，把假眼变成固若金汤的真眼！',
        goalTextEn: 'Play on D2 to secure the diagonal and solidify a true eye!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '火眼金睛！斜角守护住，假眼成功变真眼，敌人再也无法破坏！',
            isCorrect: true
          }
        ],
        hint: '请点击右上角斜角关键防守点 D2（r:1, c:3）。',
        explanation: '“真眼”四周连接紧密，对角斜点有己方棋子保护；若斜角关键点被对方占领过多，导致连接存在缺陷，最终会被对方叫吃提子，称为“假眼”。',
        bilingualTerm: {
          chinese: '真眼与假眼',
          pinyin: 'zhēn yǎn & jiǎ yǎn',
          english: 'Real Eye vs False Eye',
          concept: '真眼永久安全，假眼在紧气后会暴露缺陷被敌方分断提吃。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_3_3',
        chapterId: 3,
        type: 'puzzle',
        title: '3-3 两只真眼保平安（双眼活棋）',
        titleEn: '3-3 Two Eyes for Immortality (Life)',
        subtitle: '围棋终极生存法则：拥有两只真眼，永生不灭',
        description: '只要一块棋拥有【两只互不相连的真眼】，白棋永远无法同时堵住两只眼，黑棋就获得了永不被吃的不死神功！',
        boardSize: 7,
        initialStones: [
          { r: 2, c: 1, color: 'B' },
          { r: 2, c: 2, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 2, c: 4, color: 'B' },
          { r: 2, c: 5, color: 'B' },
          { r: 4, c: 1, color: 'B' },
          { r: 4, c: 2, color: 'B' },
          { r: 4, c: 3, color: 'B' },
          { r: 4, c: 4, color: 'B' },
          { r: 4, c: 5, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 3, c: 5, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在中间（D4 / r:3, c:3）落子，一分为二，做出两只独立的真眼！',
        goalTextEn: 'Play on D4 to divide the space into two independent living eyes!',
        targetHighlight: [{ r: 3, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 3, c: 3 },
            comment: '两眼做活！左边一只眼，右边一只眼，白棋怎么也吃不掉这块黑大龙啦！',
            isCorrect: true
          }
        ],
        hint: '在正中央下黑子 D4（r:3, c:3），把大眼隔成左右两个独立小真眼。',
        explanation: '一块棋拥有两个或两个以上独立的真眼时，对方在任何一个眼里落子都构成自杀禁着点，因此该块棋永远无法被提吃，称为“活棋”（Life）。',
        bilingualTerm: {
          chinese: '两眼活棋',
          pinyin: 'liǎng yǎn huó qí',
          english: 'Two Eyes (Living Shape)',
          concept: '拥有两个独立真眼的棋块不可被提吃，是围棋最根本的生存法则。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      },
      {
        id: 'lesson_3_4',
        chapterId: 3,
        type: 'puzzle',
        title: '3-4 点杀与破眼（直三要害）',
        titleEn: '3-4 Vital Point: Destroying Eyes',
        subtitle: '直三中间点要害，破坏敌方做眼',
        description: '敌方有直排3个空位想做两只眼？抢先占据正中间的心窝要害点，破坏它做眼！',
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
        goalText: '在白棋直三正中央（C3 / r:2, c:2）点杀，破坏它做两只眼！',
        goalTextEn: 'Play on C3 to strike the vital center of the three-space eye!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '正中心窝要害！敌之要点即我之要点，白棋无法做成两只眼，死棋锁定！',
            isCorrect: true
          }
        ],
        hint: '点击白棋直三空地正中央的要害 C3（r:2, c:2）。',
        explanation: '“直三”形状的要害点在正中央。谁先占领中央点，谁就能决定生死（黑占则破眼杀棋，白占则做成两眼活棋）。',
        bilingualTerm: {
          chinese: '点杀与破眼',
          pinyin: 'diǎn shā & pò yǎn',
          english: 'Vital Placement / Eye Destruction',
          concept: '抢占对方做眼的关键要害点，使其无法形成双眼而死亡。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      },
      {
        id: 'lesson_3_5',
        chapterId: 3,
        type: 'puzzle',
        title: '3-5 乒乓球规则：打劫与劫争',
        titleEn: '3-5 The Ko Rule (No Infinite Loop)',
        subtitle: '禁止立即原位反提，一人一手先找劫材',
        description: '你提我一颗，我提你一颗，没完没了怎么办？围棋规则严禁立即反提，必须先在别处走一步（找劫材）！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 1, color: 'B' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 4, color: 'W' },
          { r: 1, c: 3, color: 'W' },
          { r: 3, c: 3, color: 'W' },
          { r: 2, c: 2, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在劫争交叉点（C3 / r:2, c:2）提吃白子！',
        goalTextEn: 'Capture the Ko stone at C3!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '提劫成功！白棋不能立即反提，必须去别处找劫材，第三章圆满通关！',
            isCorrect: true
          }
        ],
        hint: '点击正中间唯一的提劫点 C3（r:2, c:2）。',
        explanation: '“打劫”（Ko Rule）规定：当一方提掉一子后，对方不得在下一步立即原位反提造成局面无限循环，必须先在棋盘其他地方走一步（找劫材）。',
        bilingualTerm: {
          chinese: '打劫与劫争',
          pinyin: 'dǎ jié & jié zhēng',
          english: 'Ko Rule & Ko Fight',
          concept: '防止同形无限重复的全局规则，是围棋中最富悬念的博弈机制。'
        },
        rewards: { stars: 3, coins: 45, exp: 100 }
      }
    ]
  },

  // ==========================================
  // 第四章：圈地大作战与空间魔法（领地与大局观）
  // ==========================================
  {
    id: 4,
    title: '第四章：圈地大作战与空间魔法（领地与大局）',
    titleEn: 'Chapter 4: Territory Magic & Strategic Space',
    icon: '🗺️',
    themeColor: 'from-blue-400 to-indigo-500',
    description: '分断连接、金角银边草肚皮、天元星位与封锁筑城！围棋不仅是吃子，更是圈地盘！通关解锁【萌宠AI对弈】！',
    lessons: [
      {
        id: 'lesson_4_1',
        chapterId: 4,
        type: 'puzzle',
        title: '4-1 分断与连接：棋从断处生',
        titleEn: '4-1 Cut & Connect',
        subtitle: '切断敌人的联络，连接自己的队伍',
        description: '围棋名言：棋从断处生！切断敌人的队伍，它们就会各自孤立无援；连接自己的队伍，就会固若金汤！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'W' },
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在白棋斜角连接要害（B3 / r:2, c:1）下黑子，果断分断白棋！',
        goalTextEn: 'Play on B3 to cut white into two vulnerable separate groups!',
        targetHighlight: [{ r: 2, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 1 },
            comment: '一刀两断！白棋被切成两段，无法互相救援，黑棋大占优势！',
            isCorrect: true
          }
        ],
        hint: '在白棋两子之间的交汇点 B3（r:2, c:1）切断。',
        explanation: '“分断”（Cut）是将对方原本可能相连的棋子强行隔开，使其成为两条弱链；“连接”（Connect）是将己方两块棋连为一体，增强抗击打能力。',
        bilingualTerm: {
          chinese: '分断与连接',
          pinyin: 'fēn duàn & lián jiē',
          english: 'Cut & Connect (Kiri & Tsugi)',
          concept: '切断敌方联络使其受制，连接己方阵型以保平安。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_4_2',
        chapterId: 4,
        type: 'story',
        title: '4-2 空间第一法则：金角、银边、草肚皮',
        titleEn: '4-2 Gold Corner, Silver Side, Grass Belly',
        subtitle: '围棋占地效率最高的黄金法则',
        description: '为什么大师开局都先占角？因为角部有两面天然边界，用最少的棋子就能圈最大的领地！',
        storyDialogues: [
          '小诺考考你：围棋围地盘，哪里最划算？',
          '口诀说得好：【金角、银边、草肚皮】！',
          '角上有现成的棋盘两面边界，下两颗子就能圈一块大金库！快在金光闪闪的角部星位（B2）占领金角吧！'
        ],
        boardSize: 5,
        initialStones: [],
        playerColor: 'B',
        goalText: '在最省力圈地的角部星位（B2）落下金角第一子！',
        goalTextEn: 'Place your stone on the golden corner star point B2!',
        targetHighlight: [{ r: 1, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 1 },
            comment: '金角占领成功！两颗子就能围出一大片领地，效率第一名！',
            isCorrect: true
          }
        ],
        hint: '点击左上角星位 B2（r:1, c:1）。',
        explanation: '角部拥有棋盘边缘两条天然边界，围地效率最高称为“金角”；边部有一条天然边界称为“银边”；中央无天然边界需要四面筑墙，效率最低称为“草肚皮”。',
        bilingualTerm: {
          chinese: '金角银边草肚皮',
          pinyin: 'jīn jiǎo yín biān cǎo dù pí',
          english: 'Gold Corner, Silver Side, Grass Center',
          concept: '围棋空间占领效率的永恒法则：先占角、再占边、后争中央。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_4_3',
        chapterId: 4,
        type: 'story',
        title: '4-3 棋盘黄金地标：天元、星位与三三',
        titleEn: '4-3 Star Points, 3-3 & Tengen',
        subtitle: '角星位辐射势力，三三守住角部黄金金库',
        description: '棋盘上的黑色小星点就是【星位】（Hoshi），角上的三·三是天然金库，正中心是天元！',
        storyDialogues: [
          '棋盘四角有4颗耀眼的守护星，叫做【星位】（Hoshi）！',
          '在星位下子，既能守住角部领地，又能把威力辐射向整个棋盘！',
          '快在右上角星位（D2）落下守护之星吧！'
        ],
        boardSize: 5,
        initialStones: [],
        playerColor: 'B',
        goalText: '在右上角星位（D2 / r:1, c:3）落子，掌控角部空间！',
        goalTextEn: 'Play on the star point D2 to dominate the corner!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '守护星点亮！掌控角部实地与边路发展！',
            isCorrect: true
          }
        ],
        hint: '点击右上角星位 D2（r:1, c:3）。',
        explanation: '星位（Star Point）是棋盘上预先标注的标志性坐标，进可攻退可守，兼具取势与圈地的双重威力，是布局阶段的首选落子点之一。',
        bilingualTerm: {
          chinese: '星位',
          pinyin: 'xīng wèi',
          english: 'Star Point (Hoshi)',
          concept: '棋盘角部与边部的特殊标记点，是兼顾势力与实地的绝佳布局点。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_4_4',
        chapterId: 4,
        type: 'puzzle',
        title: '4-4 封锁边界与筑城领地',
        titleEn: '4-4 Enclosing Territories & Fortress',
        subtitle: '把城墙大门紧紧合拢，圈出黑白大领地',
        description: '围棋的胜负最终看谁圈的地盘大！把城墙的大门牢牢封锁，不让白棋溜进来抢地盘！',
        boardSize: 5,
        initialStones: [
          { r: 0, c: 2, color: 'B' },
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 2, color: 'B' },
          { r: 0, c: 3, color: 'W' },
          { r: 1, c: 3, color: 'W' },
          { r: 2, c: 3, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在下方边界（C4 / r:3, c:2）落子，封住左半边黑棋的城堡大门！',
        goalTextEn: 'Play on C4 to seal your castle border and secure territory!',
        targetHighlight: [{ r: 3, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 3, c: 2 },
            comment: '城墙合拢！左半边完完全全属于黑棋的领地啦！',
            isCorrect: true
          }
        ],
        hint: '点击下方分界点 C4（r:3, c:2）封锁大门。',
        explanation: '通过连贯的棋子在棋盘上划定边界，将空交叉点完全围在己方势力范围内，这些被完全封锁的空点即构成己方的“领地（目数/目）”。',
        bilingualTerm: {
          chinese: '领地与围空',
          pinyin: 'lǐng dì & wéi kōng',
          english: 'Territory / Surrounding Space',
          concept: '被己方棋子完整包围的空交叉点，是判定胜负的最终依据。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      },
      {
        id: 'lesson_4_5',
        chapterId: 4,
        type: 'puzzle',
        title: '4-5 紧气对杀：谁的气多谁胜利',
        titleEn: '4-5 Capturing Race (Semeai)',
        subtitle: '先紧外气，数清速度谁更快',
        description: '当黑白两块棋互相都没有做成两只眼、被纠缠在一起时，就看谁先紧完对方的气！数清步数，先紧外气！',
        boardSize: 5,
        initialStones: [
          { r: 2, c: 1, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 2, c: 2, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 1, c: 1, color: 'B' },
          { r: 4, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在外侧（D3 / r:2, c:3）紧白棋的外气，赢得对杀！',
        goalTextEn: 'Play on D3 to tighten white outer liberties and win the semeai!',
        targetHighlight: [{ r: 2, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 3 },
            comment: '精准紧气！白棋只剩最后1气，黑棋对杀大获全胜！第四章圆满毕业！',
            isCorrect: true
          }
        ],
        hint: '从外侧要害 D3（r:2, c:3）紧白棋的外气。',
        explanation: '“对杀”（Semeai / Capturing Race）指双方无眼弱棋相互包围时的气数竞赛。基本原则为：先紧外气、后紧公气、长己气、紧敌气。',
        bilingualTerm: {
          chinese: '对杀',
          pinyin: 'duì shā',
          english: 'Capturing Race (Semeai)',
          concept: '互相包围且均无两眼的棋子之间比拼紧气速度的生死决斗。'
        },
        rewards: { stars: 3, coins: 45, exp: 100 }
      }
    ]
  },

  // ==========================================
  // 第五章：终局定胜负与小棋圣毕业考（胜负与定段）
  // ==========================================
  {
    id: 5,
    title: '第五章：终局定胜负与小棋圣毕业考',
    titleEn: 'Chapter 5: Endgame, Counting & Graduation Exam',
    icon: '🏆',
    themeColor: 'from-purple-500 to-pink-500',
    description: '官子收官、终局数子点目、九路实战毕业考！通关解锁【定段升级考（荣誉证书）】与【自由打谱台】！',
    lessons: [
      {
        id: 'lesson_5_1',
        chapterId: 5,
        type: 'puzzle',
        title: '5-1 官子收官抢占金币',
        titleEn: '5-1 Endgame (Yose) Micro-Points',
        subtitle: '终局阶段搜刮每一个细小目数',
        description: '棋局接近尾声，大边界已经划定，此时争夺边界上的每一个细小空目，这就是【官子】！一目之差也能逆转胜负！',
        boardSize: 5,
        initialStones: [
          { r: 0, c: 0, color: 'B' },
          { r: 1, c: 0, color: 'B' },
          { r: 2, c: 0, color: 'B' },
          { r: 0, c: 4, color: 'W' },
          { r: 1, c: 4, color: 'W' },
          { r: 2, c: 4, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在边界最前沿（B1 / r:0, c:1）收官抢地盘！',
        goalTextEn: 'Play on B1 to push the boundary and claim valuable endgame points!',
        targetHighlight: [{ r: 0, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 0, c: 1 },
            comment: '抢占官子大金币！黑棋地盘又扩大了整整一目！',
            isCorrect: true
          }
        ],
        hint: '在顶部边界空位 B1（r:0, c:1）落子收官。',
        explanation: '“官子”（Endgame / Yose）是棋局最后阶段双方争夺领地微小边界与目数的细致较量，善于收官者往往能在细棋中稳操胜券。',
        bilingualTerm: {
          chinese: '官子与收官',
          pinyin: 'guān zǐ & shōu guān',
          english: 'Endgame (Yose)',
          concept: '终局阶段搜刮、微调领地边界和空目的细微争夺。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      },
      {
        id: 'lesson_5_2',
        chapterId: 5,
        type: 'story',
        title: '5-2 终局数子点目判定胜负',
        titleEn: '5-2 Counting Territory & Final Victory',
        subtitle: '清理死子，清点领地决出冠军',
        description: '双方都无棋可下时，棋局宣告结束！把死子全部拿走，清点各自围住的交叉点数量，地盘多者获胜！',
        storyDialogues: [
          '双方都觉得没有地方可以争夺时，连续停一手（Pass），棋局就正式终局啦！',
          '裁判老师会先把棋盘上的死子拿走，然后清点黑棋和白棋各自围住的地盘（目数）！',
          '在九路盘或五路盘上，谁圈住的地盘多，谁就是胜利者！快在最后的归宿点（C3）落下完美终局一子吧！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 0, c: 0, color: 'B' },
          { r: 0, c: 1, color: 'B' },
          { r: 4, c: 3, color: 'W' },
          { r: 4, c: 4, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在棋盘中心（C3）落下终局定音之子！',
        goalTextEn: 'Play on C3 to conclude the match and begin the final count!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '终局清点！黑棋领地遥遥领先，拿下整盘胜利！',
            isCorrect: true
          }
        ],
        hint: '点击正中心终局点 C3（r:2, c:2）。',
        explanation: '双方连续弃着（Pass）即宣告终局。清理死子后，中国规则通过计算活子+围空判定胜负，目数多者获胜。',
        bilingualTerm: {
          chinese: '终局数子',
          pinyin: 'zhōng jú shǔ zǐ',
          english: 'Final Counting (Territory Scoring)',
          concept: '棋局结束后清点领地面积判定最终胜负的庄严仪式。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      },
      {
        id: 'lesson_5_3',
        chapterId: 5,
        type: 'puzzle',
        title: '5-3 毕业试炼：九路盘决战小诺',
        titleEn: '5-3 Master Trial: 9x9 Graduation Challenge',
        subtitle: '综合运用所学，拿下小棋圣最高荣誉',
        description: '小诺师傅亲自把关！综合运用气、吃子、做眼与圈地，击败小诺，成为一名合格的围棋小高手！',
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'W' },
          { r: 2, c: 3, color: 'W' },
          { r: 1, c: 1, color: 'B' },
          { r: 1, c: 3, color: 'B' },
          { r: 3, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在白棋中央核心要害（C3 / r:2, c:2）落子，双叫吃锁定胜局！',
        goalTextEn: 'Strike the central vital point C3 to win the graduation trial!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '太精彩啦！神来之笔！恭喜你通过全部 25 关启蒙试炼，成为真正的围棋小棋圣！',
            isCorrect: true
          }
        ],
        hint: '点击正中心唯一的胜负手 C3（r:2, c:2）。',
        explanation: '恭喜你！你已经掌握了围棋从落子、气、吃子、手筋、两眼活棋到圈地数子的完整知识体系，正式解锁【定段升级考】！',
        bilingualTerm: {
          chinese: '小棋圣毕业',
          pinyin: 'xiǎo qí shèng bì yè',
          english: 'Graduation Master',
          concept: '掌握围棋启蒙全部规则与核心攻防，迈入段位进阶殿堂。'
        },
        rewards: { stars: 3, coins: 50, exp: 120 }
      }
    ]
  }
];

