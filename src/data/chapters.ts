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
  // 第一章：棋盘小精灵（基础规则与气）
  // ==========================================
  {
    id: 1,
    title: '第一章：棋盘小精灵（基础认知）',
    titleEn: 'Chapter 1: The Board Elves (Foundations)',
    icon: '🌱',
    themeColor: 'from-emerald-400 to-teal-500',
    description: '认识小棋盘，学会数棋子的“呼吸通道”——气，以及第一次提子与避开自杀禁区！',
    lessons: [
      {
        id: 'lesson_1_1',
        chapterId: 1,
        type: 'story',
        title: '1-1 棋盘与交叉点',
        titleEn: 'The Board & Intersections',
        subtitle: '认识天元与星位',
        description: '围棋是下在“横线与竖线的交叉点”上的，最中间的点叫天元！',
        storyDialogues: [
          '你好呀！我是小诺~ 欢迎来到神奇的围棋王国！',
          '请看棋盘：棋子不是放在方格子里，而是放在线与线相交的【交叉点】上哦！',
          '棋盘正中间那个最亮的大黑点，叫做【天元】（Tengen）。快在天元 (2, 2) 落下你的第一颗黑子吧！'
        ],
        boardSize: 5,
        initialStones: [],
        playerColor: 'B',
        goalText: '点击棋盘正中心的天元点 (2, 2) 放置黑子！',
        goalTextEn: 'Click the center Tengen point (2,2) to place your stone!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '太棒啦！这就是棋盘的正中心——天元星位！',
            isCorrect: true
          }
        ],
        hint: '请点击正中间闪闪发光的天元星位 (2, 2)。',
        explanation: '围棋棋盘由纵横各若干条直线组成，棋子下在交叉点上。棋盘中心的特殊标记点称为“天元”，四角和边上的标记点称为“星位”。',
        bilingualTerm: {
          chinese: '天元 / 星位',
          pinyin: 'tiān yuán / xīng wèi',
          english: 'Tengen / Star Points (Hoshi)',
          concept: '棋盘上的重要基准参考点，中心点为天元，角部星位为布局关键要位。'
        },
        rewards: { stars: 3, coins: 20, exp: 50 }
      },
      {
        id: 'lesson_1_2',
        chapterId: 1,
        type: 'story',
        title: '1-2 棋子的呼吸',
        titleEn: 'The Breath of a Stone',
        subtitle: '数数棋子有几口气 (Liberties)',
        description: '直线紧挨着棋子的空交叉点是棋子的“气”，气是棋子的生命呼吸孔！',
        storyDialogues: [
          '小黑子也是要呼吸的哦！',
          '与它直接连着横线和竖线的 4 个空交叉点，就是它的【气】（Liberties）！',
          '点击小黑子右侧的 (2, 3) 给它找一个小伙伴，手拉手气会变得更多！'
        ],
        boardSize: 5,
        initialStones: [{ r: 2, c: 2, color: 'B' }],
        playerColor: 'B',
        goalText: '点击右侧相邻空位 (2, 3) 与黑子连接！',
        goalTextEn: 'Place stone at (2,3) to connect and expand liberties!',
        targetHighlight: [{ r: 2, c: 3 }, { r: 2, c: 1 }, { r: 1, c: 2 }, { r: 3, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 3 },
            comment: '两颗黑子手拉手连在一起，共享所有的外围气，变得更坚强了！',
            isCorrect: true
          }
        ],
        hint: '点击黑子上下左右 4 个呼吸孔之一，推荐右边 (2, 3)。',
        explanation: '与棋子直接相邻的空交叉点称为“气”。中央单子有 4 气，边上 3 气，角上 2 气。同色棋子相连形成连通块（Group），共享所有外围气。',
        bilingualTerm: {
          chinese: '气',
          pinyin: 'qì',
          english: 'Liberties',
          concept: '与棋子正交紧邻的空交叉点。棋子没有气就无法在棋盘上生存。'
        },
        rewards: { stars: 3, coins: 25, exp: 60 }
      },
      {
        id: 'lesson_1_3',
        chapterId: 1,
        type: 'puzzle',
        title: '1-3 抓住它！叫吃与提子',
        titleEn: 'Catch It! Atari & Capture',
        subtitle: '当白子只剩 1 口气，一举吃掉它！',
        description: '当对方棋子被包围到只剩 1 口气时称为“叫吃”，堵住最后一口气即可提子！',
        storyDialogues: [
          '警报响起！白子被三颗黑子包围，只剩 (2, 3) 这一根吸管啦！',
          '这种危险状态叫【叫吃】（Atari）！快下在 (2, 3) 提走它！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (2, 3) 落子，提吃这颗只剩 1 口气的白子！',
        goalTextEn: 'Play at (2,3) to capture the white stone in Atari!',
        targetHighlight: [{ r: 2, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 3 },
            comment: '啪！大快人心的提子！白子被完全吃掉啦！',
            isCorrect: true
          }
        ],
        hint: '看右侧闪烁的红圈 (2, 3)，点它就能完成提子！',
        explanation: '当对方棋子只剩最后 1 气时称为“叫吃”（打吃/Atari）。下在最后一口气上，将死子拿离棋盘的动作称为“提子”（Capture）。',
        bilingualTerm: {
          chinese: '叫吃 / 提子',
          pinyin: 'jiào chī / tí zǐ',
          english: 'Atari / Capture',
          concept: '叫吃指只剩最后1气；提子指堵死最后一口气并将对方棋子移出棋盘。'
        },
        rewards: { stars: 3, coins: 35, exp: 80 }
      },
      {
        id: 'lesson_1_4',
        chapterId: 1,
        type: 'puzzle',
        title: '1-4 危险的禁区：禁着点',
        titleEn: 'Forbidden Zone: Illegal Suicide Move',
        subtitle: '没有气又不能吃子的地方不能下！',
        description: '下下去后自己没有气，而且又不能提吃对方任何棋子的位置，属于禁着点（自杀步）！',
        storyDialogues: [
          '请看！中间 (2, 2) 被四颗白子严密合围！',
          '如果黑子下在 (2, 2)，自己立刻零气而且吃不掉白子，这是违规的【禁着点】！',
          '请小棋手把黑子下在左上角开阔的安全基地 (0, 0)！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 2, c: 1, color: 'W' },
          { r: 2, c: 3, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '避开自杀禁着点，在安全开阔的角部 (0, 0) 筑建基地！',
        goalTextEn: 'Avoid illegal suicide move at (2,2) and play at the corner (0,0)!',
        targetHighlight: [{ r: 0, c: 0 }],
        puzzleRoot: [
          {
            coord: { r: 0, c: 0 },
            comment: '明智的选择！在角部开拓基地，既安全又拥有充足的呼吸气数！',
            isCorrect: true
          }
        ],
        hint: '不要自投罗网点 (2, 2)，请点击左上角的黄金角位 (0, 0)！',
        explanation: '禁着点（Suicide Move）：任何落子后自身连通块气数为0且不能提掉对方任何棋子的点均为非法禁着点，围棋规则禁止自杀。',
        bilingualTerm: {
          chinese: '禁着点 / 自杀步',
          pinyin: 'jìn zhuó diǎn / zì shā',
          english: 'Illegal Move / Suicide',
          concept: '落子后自身无气且无法提吃对方棋子的位置，为规则所禁止。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      }
    ]
  },

  // ==========================================
  // 第二章：捕鱼小达人（经典吃子手筋）
  // ==========================================
  {
    id: 2,
    title: '第二章：捕鱼小达人（经典吃子手筋）',
    titleEn: 'Chapter 2: Little Fisher (Fundamental Tesuji)',
    icon: '🎣',
    themeColor: 'from-amber-400 to-orange-500',
    description: '掌握围棋最实用经典的吃子手筋：抱吃、门吃、征吃、枷吃与倒扑！',
    lessons: [
      {
        id: 'lesson_2_1',
        chapterId: 2,
        type: 'puzzle',
        title: '2-1 抱吃（往怀里赶）',
        titleEn: 'Embrace Capture',
        subtitle: '将敌子赶向己方厚势',
        description: '从外侧迎头叫吃，像张开双臂一样把白子抱进己方大本营！',
        storyDialogues: [
          '白子想要往开阔的右边逃跑！',
          '小棋手，我们要从右边 (2, 3) 堵住它，把它往左边黑子的大怀抱里赶！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (2, 3) 迎头叫吃，抱住逃跑的白子！',
        goalTextEn: 'Play at (2,3) to embrace and trap the runner!',
        targetHighlight: [{ r: 2, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 3 },
            comment: '漂亮！白子无路可逃，被稳稳抱回家！',
            isCorrect: true
          }
        ],
        hint: '从右侧 (2, 3) 挡住它逃跑的方向！',
        explanation: '抱吃（Embrace Capture）：顺应对方逃跑方向迎头阻击，将对方弱子逼向己方已有重兵防守的厚势方向。',
        bilingualTerm: {
          chinese: '抱吃',
          pinyin: 'bào chī',
          english: 'Embrace Capture',
          concept: '迎头拦截并包抄敌子，将其赶入己方包围圈的吃子技巧。'
        },
        rewards: { stars: 3, coins: 40, exp: 90 }
      },
      {
        id: 'lesson_2_2',
        chapterId: 2,
        type: 'puzzle',
        title: '2-2 门吃（双子关门）',
        titleEn: 'Gate Capture',
        subtitle: '像关大门一样堵住敌人',
        description: '利用两颗并立的黑子如同两扇门框，在正前方插上门栓！',
        storyDialogues: [
          '白子想从黑子两扇门柱之间钻过去！',
          '快下在 (2, 1) 把大门紧紧关上，关门打敌人！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 1, color: 'B' },
          { r: 3, c: 1, color: 'B' },
          { r: 2, c: 0, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在正前方 (2, 1) 关上大门，叫吃白子！',
        goalTextEn: 'Play at (2,1) like closing the gate to capture the intruder!',
        targetHighlight: [{ r: 2, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 1 },
            comment: '门吃成功！大门一关，白子插翅难飞！',
            isCorrect: true
          }
        ],
        hint: '点在两扇门中间的正前方 (2, 1)！',
        explanation: '门吃（Gate Capture）：利用两颗同色棋子形成的门户形状，在敌方前进道路上关门拦截并完成叫吃。',
        bilingualTerm: {
          chinese: '门吃',
          pinyin: 'mén chī',
          english: 'Gate Capture',
          concept: '像关门一样利用两侧棋子封死敌方去路的吃子手筋。'
        },
        rewards: { stars: 3, coins: 45, exp: 100 }
      },
      {
        id: 'lesson_2_3',
        chapterId: 2,
        type: 'puzzle',
        title: '2-3 征吃（扭羊头）',
        titleEn: 'The Ladder (Twisted Sheep Head)',
        subtitle: '连续交替叫吃一路追到边缘',
        description: '像走楼梯一样左右交替叫吃，逼迫白子走 Z 字形直到撞墙！',
        storyDialogues: [
          '这是围棋中最壮观的追击手筋——征吃（扭羊头）！',
          '白子在 (1, 1)，我们下在 (2, 1) 向上叫吃，逼迫它向斜上方逃窜！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'W' },
          { r: 0, c: 1, color: 'B' },
          { r: 1, c: 0, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (2, 1) 连续发动征吃追击！',
        goalTextEn: 'Play at (2,1) to start the zigzag Ladder chase!',
        targetHighlight: [{ r: 2, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 1 },
            comment: '第一步叫吃成功！白棋被迫往 (1, 2) 逃跑！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 1, c: 2 },
              comment: '白棋逃到 (1, 2)，继续从 (0, 2) 兜头叫吃！'
            },
            nextBranches: [
              {
                coord: { r: 0, c: 2 },
                comment: '完美追击！白棋撞上棋盘边缘被全部提吃！',
                isCorrect: true
              }
            ]
          }
        ],
        hint: '下在 (2, 1) 封堵下方，让白棋只能往斜角扭动！',
        explanation: '征吃（Ladder）：连续斜向交替叫吃，使对方棋子始终保持 1 气并呈阶梯状逃窜，最终在边缘或友军处被全歼。',
        bilingualTerm: {
          chinese: '征子 / 扭羊头',
          pinyin: 'zhēng zǐ / niǔ yáng tóu',
          english: 'Ladder',
          concept: '连续交替打吃，迫使敌子呈梯形逃窜并最终将其捕获。'
        },
        rewards: { stars: 3, coins: 50, exp: 120 }
      },
      {
        id: 'lesson_2_4',
        chapterId: 2,
        type: 'puzzle',
        title: '2-4 枷吃（飞枷织大网）',
        titleEn: 'Net Capture (Geta)',
        subtitle: '不贴身也能捕获敌子的神奇织网',
        description: '在斜角处轻轻下一子像张开捕鱼网，敌方无论怎么逃都会自投罗网！',
        storyDialogues: [
          '白子 (2, 2) 想要突围！',
          '我们不需要贴着它叫吃，只要在斜上方 (3, 3) 织一张“飞枷大网”！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (3, 3) 下出飞枷，隔空罩住白子！',
        goalTextEn: 'Play the Geta Net move at (3,3) to trap White from a distance!',
        targetHighlight: [{ r: 3, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 3, c: 3 },
            comment: '太精妙了！飞枷大网已形成，白棋试图向右 (2, 3) 冲出！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 2, c: 3 },
              comment: '白棋逃至 (2, 3)，快下在 (1, 3) 迎头堵住吃掉它！'
            },
            nextBranches: [
              {
                coord: { r: 1, c: 3 },
                comment: '啪！大网收拢，白子全军覆没！',
                isCorrect: true
              }
            ]
          }
        ],
        hint: '在白子斜对面的 (3, 3) 下子织网！',
        explanation: '枷吃（Geta/Net）：不直接贴身打吃，而是在敌子行进方向的斜上方或跳位设置包围圈，使其无论朝哪边逃跑都会立刻被叫吃提掉。',
        bilingualTerm: {
          chinese: '枷吃 / 飞枷',
          pinyin: 'jiā chī / fēi jiā',
          english: 'Net / Geta',
          concept: '虚笼敌子、使其左右无法逃脱的潇洒吃子手筋。'
        },
        rewards: { stars: 3, coins: 55, exp: 130 }
      },
      {
        id: 'lesson_2_5',
        chapterId: 2,
        type: 'puzzle',
        title: '2-5 倒扑（诱敌入网的魔术）',
        titleEn: 'Snapback (Counter-Capture)',
        subtitle: '故意送吃一子，然后原位反提大批敌子！',
        description: '围棋中最神奇的反转大招：舍弃一子诱敌深入，随后瞬间回提！',
        storyDialogues: [
          '看准这个虎口 (2, 2)！',
          '勇敢把一颗黑子送给白棋吃！白棋贪吃提掉后，整块白棋气数紧缩，我们可以原位反提！'
        ],
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
        goalText: '勇敢点在 (2, 2) 投入诱饵黑子！',
        goalTextEn: 'Throw your bait stone into (2,2) for the Snapback!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '诱饵已就位！白棋贪吃提走黑子，但白棋整体只剩 1 气！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 2, c: 2 },
              comment: '白棋提掉诱饵，轮到黑棋在原位反提！'
            },
            nextBranches: [
              {
                coord: { r: 2, c: 2 },
                comment: '漂亮的倒扑！原位反提整块白子，大获全胜！',
                isCorrect: true
              }
            ]
          }
        ],
        hint: '不要害怕送吃，勇敢下在 (2, 2) 虎口中！',
        explanation: '倒扑（Snapback）：故意将己方一子送入敌方虎口，诱使对方提子后气数被压缩为 1 气，随后立刻在原位反提敌方整块棋子。',
        bilingualTerm: {
          chinese: '倒扑',
          pinyin: 'dào pū',
          english: 'Snapback',
          concept: '舍弃一子诱敌提吃，随后即刻回提对方多颗棋子的高级手筋。'
        },
        rewards: { stars: 3, coins: 60, exp: 150 }
      }
    ]
  },

  // ==========================================
  // 第三章：死活城堡与两只眼（两眼活棋与真假眼）
  // ==========================================
  {
    id: 3,
    title: '第三章：死活城堡与两只眼（两眼活棋）',
    titleEn: 'Chapter 3: The Castle of Life (Making Eyes)',
    icon: '🏰',
    themeColor: 'from-blue-400 to-indigo-500',
    description: '理解围棋最重要的生死法则：什么是眼位？如何区分真假眼与两眼做活！',
    lessons: [
      {
        id: 'lesson_3_1',
        chapterId: 3,
        type: 'story',
        title: '3-1 认识眼位（小鸟的坚固鸟巢）',
        titleEn: 'What is an Eye?',
        subtitle: '敌人无法落子的避风港',
        description: '被己方棋子完全包围的空交叉点称为“眼”。对方无法单子落入眼内！',
        storyDialogues: [
          '欢迎来到死活城堡！在围棋里，棋子如何才能永远不死呢？',
          '看！黑棋四颗子在 (1, 1) 围出了一个小空地，这就是【眼位】（Eye）！',
          '白棋无法单独下在 (1, 1)，因为那是自杀！请点击 (1, 3) 帮黑棋扩大城堡外墙！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 0, c: 1, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 1, c: 0, color: 'B' },
          { r: 1, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '点击 (1, 3) 扩展黑棋的坚固外墙！',
        goalTextEn: 'Click (1,3) to reinforce the castle wall around the eye!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '城堡变得更加宽敞坚固！眼位是棋子生存的根据地！',
            isCorrect: true
          }
        ],
        hint: '点击闪烁高亮的右侧拓展点 (1, 3)。',
        explanation: '眼（Eye）：若干同色棋子围住的一个或多个空交叉点。由于对方不能自杀落入单眼之中，眼位是棋子保持活棋的最基本保障。',
        bilingualTerm: {
          chinese: '眼位',
          pinyin: 'yǎn wèi',
          english: 'Eye / Eye Space',
          concept: '被己方棋子围住的空点，是棋子赖以做活的生命之穴。'
        },
        rewards: { stars: 3, coins: 50, exp: 120 }
      },
      {
        id: 'lesson_3_2',
        chapterId: 3,
        type: 'puzzle',
        title: '3-2 辨别真眼与假眼',
        titleEn: 'Real Eye vs False Eye',
        subtitle: '坚固的金刚眼 vs 漏气的假眼',
        description: '角部连接不牢固时会被对方分断破眼（假眼），必须补强关键对角交叉点！',
        storyDialogues: [
          '注意！黑棋在 (2, 2) 看似有一个眼位！',
          '但右下角的斜角 (3, 3) 还没连好！如果白棋占领 (3, 3)，黑棋的眼就会漏气变成【假眼】！',
          '快下在 (3, 3) 补牢对角，把假眼变成固若金汤的【真眼】！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 1, c: 3, color: 'W' },
          { r: 3, c: 1, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在斜对角 (3, 3) 补强连通，固化真眼！',
        goalTextEn: 'Play at (3,3) to secure the diagonal and make a Real Eye!',
        targetHighlight: [{ r: 3, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 3, c: 3 },
            comment: '完美巩固！四角连通无懈可击，(2, 2) 成为了永不崩塌的真眼！',
            isCorrect: true
          }
        ],
        hint: '下在右下对角点 (3, 3) 封堵白棋破眼！',
        explanation: '真眼与假眼：中腹的眼位需要至少 3 个对角点被己方占据；若对角被对方占据 2 个以上，围眼的棋子就存在断点，随时可能被提吃，该眼即为“假眼”。',
        bilingualTerm: {
          chinese: '真眼 / 假眼',
          pinyin: 'zhēn yǎn / jiǎ yǎn',
          english: 'Real Eye / False Eye',
          concept: '真眼连接完整不可被破坏；假眼存在缺陷，终将被对方分断吃掉。'
        },
        rewards: { stars: 3, coins: 55, exp: 130 }
      },
      {
        id: 'lesson_3_3',
        chapterId: 3,
        type: 'puzzle',
        title: '3-3 两只真眼保平安（双眼活棋）',
        titleEn: 'Two Eyes Live Forever',
        subtitle: '围棋最核心法则：两眼即可永生',
        description: '一块棋只要拥有两只互不相连的真眼，对方永远无法同时下在两个眼里，该棋永远不会死！',
        storyDialogues: [
          '这是围棋中最神圣的铁律：【两眼活棋】！',
          '黑棋中间有一块长条空地 (2, 1)、(2, 2)、(2, 3)（直三）！',
          '快下在正中间 (2, 2) 一分为二，立刻做出左右两只独立的真眼！'
        ],
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
        goalText: '下在中间要害 (2, 2)，做出两只真眼做活！',
        goalTextEn: 'Play at the vital center point (2,2) to divide into Two Real Eyes!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '两眼做活成功！(2, 1) 和 (2, 3) 成为两只神圣真眼，白棋永远无法吃掉黑棋！',
            isCorrect: true
          }
        ],
        hint: '点在三颗空点正中间的 (2, 2)！',
        explanation: '两眼活棋（Two Eyes for Life）：因为对手不能同时在两个眼位同时落子，且单落一子即为无气禁着点，因此拥有两个独立真眼的连通块将永久存活。',
        bilingualTerm: {
          chinese: '两眼活棋',
          pinyin: 'liǎng yǎn huó qí',
          english: 'Two Eyes / Unconditional Life',
          concept: '拥有两个独立真眼的棋子永远不会被提吃，是活棋的终极标准。'
        },
        rewards: { stars: 3, coins: 65, exp: 160 }
      },
      {
        id: 'lesson_3_4',
        chapterId: 3,
        type: 'puzzle',
        title: '3-4 点杀与破眼（直三要害）',
        titleEn: 'Vital Point Strike (Killing the Straight Three)',
        subtitle: '抢占敌人做眼的要害点，一举歼灭敌军',
        description: '对方有三个空位想做两眼？先下手为强占领中心要害，破掉对方的眼！',
        storyDialogues: [
          '白棋也想做出两只眼活命！',
          '白棋肚子里有 (2, 1)、(2, 2)、(2, 3) 三个空位！如果白棋抢到 (2, 2) 就会做活！',
          '小黑棋，快抢先下在 (2, 2) 进行【点杀】，彻底粉碎白棋做眼的梦想！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 1, color: 'W' },
          { r: 1, c: 2, color: 'W' },
          { r: 1, c: 3, color: 'W' },
          { r: 3, c: 1, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 3, c: 3, color: 'W' },
          { r: 2, c: 0, color: 'W' },
          { r: 2, c: 4, color: 'W' },
          { r: 0, c: 2, color: 'B' },
          { r: 4, c: 2, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '抢占中心要害 (2, 2) 点杀白棋直三！',
        goalTextEn: 'Strike at the vital center (2,2) to prevent White from making two eyes!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '命中红心！黑棋抢占了直三的中点，白棋无法做成两只眼，全军覆没！',
            isCorrect: true
          }
        ],
        hint: '“敌之要点即我之要点”，抢在 (2, 2) 落子！',
        explanation: '死活要害（Vital Point）：直三、弯三的中央点是做活与杀棋的唯一关键点。攻方占领该点即可破眼杀棋，守方占领该点即可做活。',
        bilingualTerm: {
          chinese: '点杀 / 要害',
          pinyin: 'diǎn shā / yào hài',
          english: 'Vital Point Strike',
          concept: '抢占敌方做眼必争之关键点，使敌方无法形成两只真眼。'
        },
        rewards: { stars: 3, coins: 70, exp: 170 }
      }
    ]
  },

  // ==========================================
  // 第四章：少儿实战攻防与对杀秘籍
  // ==========================================
  {
    id: 4,
    title: '第四章：少儿实战攻防与对杀秘籍',
    titleEn: 'Chapter 4: Tactical Battles & Capturing Races',
    icon: '⚡',
    themeColor: 'from-purple-500 to-violet-600',
    description: '学习实战中最关键的攻防利器：分断与连接、双叫吃、接不归以及紧气对杀！',
    lessons: [
      {
        id: 'lesson_4_1',
        chapterId: 4,
        type: 'puzzle',
        title: '4-1 分断与连接（棋从断处生）',
        titleEn: 'Cut and Connect',
        subtitle: '把敌人切成两半，把队友紧密相连',
        description: '围棋谚语“棋从断处生”——切断对方的联系，对方就会出现薄弱破绽！',
        storyDialogues: [
          '白棋两颗子斜斜相交在 (1, 2) 和 (2, 3)！',
          '它们之间看似连在一起，其实只要黑棋下在交叉口 (2, 2)，就能将它们彻底【分断】（Cut）！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 2, c: 3, color: 'W' },
          { r: 1, c: 3, color: 'B' },
          { r: 2, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (2, 2) 落下关键分断手，切开两颗白子！',
        goalTextEn: 'Play at (2,2) to execute the decisive Cut between enemy stones!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '切断成功！白棋被一分为二，各自只剩 2 气，陷入苦战！',
            isCorrect: true
          }
        ],
        hint: '下在两颗白棋交错的正中心 (2, 2)！',
        explanation: '分断（Cut）：落子于对方棋子斜向连接点，破坏其整体协同性；连接（Connect）：将己方分散棋子连为一体，增强生命力。',
        bilingualTerm: {
          chinese: '分断 / 连接',
          pinyin: 'fēn duàn / lián jiē',
          english: 'Cut / Connect',
          concept: '分断削弱敌军力量，连接增强己方厚势，是围棋战术攻防之基。'
        },
        rewards: { stars: 3, coins: 60, exp: 140 }
      },
      {
        id: 'lesson_4_2',
        chapterId: 4,
        type: 'puzzle',
        title: '4-2 双叫吃（一石二鸟）',
        titleEn: 'Double Atari (Two Birds One Stone)',
        subtitle: '一手棋同时叫吃两处敌人！',
        description: '落下一颗子，同时让对方两个不同的棋子都陷入 1 气的绝境，必得其一！',
        storyDialogues: [
          '观察白棋：(1, 2) 和 (2, 3) 两处白子都只有 2 口气！',
          '只要黑棋下在它们的交汇气孔 (1, 3)，就能同时叫吃两边的白棋！白棋顾此失彼！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 2, c: 3, color: 'W' },
          { r: 1, c: 1, color: 'B' },
          { r: 2, c: 2, color: 'B' },
          { r: 3, c: 3, color: 'B' },
          { r: 2, c: 4, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (1, 3) 发动震撼的【双叫吃】！',
        goalTextEn: 'Play at (1,3) to launch the Double Atari strike!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '双叫吃发动！白棋大惊失色，选择连接上方 (0, 2)！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 0, c: 2 },
              comment: '白棋保住了上方，我们快在 (1, 4) 提吃右下白子！'
            },
            nextBranches: [
              {
                coord: { r: 1, c: 4 },
                comment: '啪！一石二鸟，稳稳吃掉白子！',
                isCorrect: true
              }
            ]
          }
        ],
        hint: '点在两处白棋共同紧邻的交叉点 (1, 3)！',
        explanation: '双叫吃（Double Atari）：一手棋同时威胁敌方两块棋使其均处于只剩 1 气的叫吃状态。敌方一次只能拯救一块，己方必能吃掉另一块。',
        bilingualTerm: {
          chinese: '双叫吃 / 双打',
          pinyin: 'shuāng jiào chī / shuāng dǎ',
          english: 'Double Atari',
          concept: '一手棋同时打吃两处敌子，令对方无法两全的绝杀战术。'
        },
        rewards: { stars: 3, coins: 65, exp: 160 }
      },
      {
        id: 'lesson_4_3',
        chapterId: 4,
        type: 'puzzle',
        title: '4-3 接不归（连上也是死路一条）',
        titleEn: 'Connect and Die (Crane Nest)',
        subtitle: '就算敌人想要连起来，也逃不掉被全歼的命运！',
        description: '对方棋子虽然试图手拉手逃跑，但连上后气数依然只有 1 气，直接被一锅端！',
        storyDialogues: [
          '看白棋 (1, 2) 只剩 1 口气！它旁边还有一颗孤单的 (1, 4)！',
          '黑棋下在 (1, 3) 发起致命一击，白棋就算连上也是 1 气，这就是经典的【接不归】！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'W' },
          { r: 1, c: 4, color: 'W' },
          { r: 0, c: 2, color: 'B' },
          { r: 2, c: 2, color: 'B' },
          { r: 0, c: 3, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 2, c: 4, color: 'B' },
          { r: 1, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (1, 3) 落子，完成接不归绝杀！',
        goalTextEn: 'Play at (1,3) to trigger the Connect-and-Die capture!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '绝妙一击！接不归大获全胜，白棋连起来也被整串提吃！',
            isCorrect: true
          }
        ],
        hint: '在中间唯一的连接点 (1, 3) 落子封喉！',
        explanation: '接不归（Connect and Die）：处于叫吃状态的敌子在连接友军后，整体气数仍然只有 1 气，仍逃脱不了被整体提吃的结局。',
        bilingualTerm: {
          chinese: '接不归',
          pinyin: 'jiē bù guī',
          english: 'Connect and Die / Crane Nest',
          concept: '被叫吃的棋子即使连同同伴也无法增加气数，一同被吃。'
        },
        rewards: { stars: 3, coins: 70, exp: 170 }
      },
      {
        id: 'lesson_4_4',
        chapterId: 4,
        type: 'puzzle',
        title: '4-4 紧气对杀（数清谁的气更多）',
        titleEn: 'Capturing Race (Semeai)',
        subtitle: '分秒必争！先紧对手一口外气',
        description: '当双方互相包围对方时，比拼的就是谁的气多！必须抢先收紧对手的外气！',
        storyDialogues: [
          '激烈的对杀爆发了！',
          '黑棋两颗子 (2, 1)、(2, 2) 只有 2 气；白棋两颗子 (2, 3)、(2, 4) 也只有 2 气！',
          '轮到黑棋先走，必须果断收紧白棋的外气 (1, 3)，抢先一步叫吃白棋！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 2, c: 1, color: 'B' },
          { r: 2, c: 2, color: 'B' },
          { r: 2, c: 3, color: 'W' },
          { r: 2, c: 4, color: 'W' },
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 0, c: 3, color: 'B' },
          { r: 0, c: 4, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (1, 3) 抢先收紧白棋外气！',
        goalTextEn: 'Play at (1,3) to tighten the capturing race liberties first!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '抢先叫吃！白棋气数只剩 1 气，试图垂死反扑 (3, 1)！',
            isCorrect: true,
            opponentResponse: {
              coord: { r: 3, c: 1 },
              comment: '白棋反扑，但轮到黑棋在 (3, 3) 彻底提吃白棋！'
            },
            nextBranches: [
              {
                coord: { r: 3, c: 3 },
                comment: '对杀大获全胜！数清气数、先下手为强是对杀的制胜法则！',
                isCorrect: true
              }
            ]
          }
        ],
        hint: '在上方 (1, 3) 紧白棋的气，抢占先手！',
        explanation: '对杀（Semeai）：双方互无活路的棋子互相包围并比拼收气速度。通常原则是“先紧外气、后紧公气”，气多者或有眼者胜。',
        bilingualTerm: {
          chinese: '对杀 / 紧气',
          pinyin: 'duì shā / jǐn qì',
          english: 'Capturing Race / Semeai',
          concept: '互相包围的无眼或单眼棋子争相收紧对方气数以决生死的决斗。'
        },
        rewards: { stars: 3, coins: 75, exp: 180 }
      }
    ]
  },

  // ==========================================
  // 第五章：筑城圈地与终局点目（领地意识与完整胜负）
  // ==========================================
  {
    id: 5,
    title: '第五章：筑城圈地与终局点目（领地与胜负）',
    titleEn: 'Chapter 5: Territory & Final Scoring',
    icon: '🗺️',
    themeColor: 'from-cyan-500 to-blue-600',
    description: '领悟围棋的本质是“圈地盘”：金角银边、封锁边界、劫争规则以及中国规则终局数子！',
    lessons: [
      {
        id: 'lesson_5_1',
        chapterId: 5,
        type: 'story',
        title: '5-1 金角银边草肚皮',
        titleEn: 'Corners First, Sides Second, Center Last',
        subtitle: '最省力的高效围空秘诀',
        description: '角上只需两面阻拦就能圈出大片领地，因此开局必须优先占领角部星位！',
        storyDialogues: [
          '围棋的最终胜负不是比谁吃子多，而是比谁围的【地盘】（Territory）更大！',
          '古人总结“金角银边草肚皮”——在角上圈地最省力！',
          '在 7 路大棋盘上，点击左上角的黄金角位 (1, 1) 建立你的第一座城堡吧！'
        ],
        boardSize: 7,
        initialStones: [],
        playerColor: 'B',
        goalText: '点击左上角黄金星位 (1, 1) 开疆拓土！',
        goalTextEn: 'Play at the golden corner (1,1) to establish your base!',
        targetHighlight: [{ r: 1, c: 1 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 1 },
            comment: '好一步金角！以角为依托，你可以轻松向两侧扩张大片领地！',
            isCorrect: true
          }
        ],
        hint: '点击左上角闪烁的星位 (1, 1)。',
        explanation: '金角银边草肚皮：围棋经典战略。围相同大小的空，角上所需棋子最少，边上次之，中央所需棋子最多。因此布局阶段先占角、后拆边、再争中腹。',
        bilingualTerm: {
          chinese: '领地 / 目数',
          pinyin: 'lǐng dì / mù shù',
          english: 'Territory / Points',
          concept: '用棋子围成的空交叉点属于领地，终局时计算领地大小决胜负。'
        },
        rewards: { stars: 3, coins: 65, exp: 150 }
      },
      {
        id: 'lesson_5_2',
        chapterId: 5,
        type: 'puzzle',
        title: '5-2 封锁边界与收官',
        titleEn: 'Sealing the Borders (Endgame)',
        subtitle: '修补缺口，筑起防守的长城',
        description: '当双方地盘接近时，必须堵住边境上的缺口，防止敌人潜入偷袭！',
        storyDialogues: [
          '黑棋在左半边筑起了宏伟的城堡，白棋在右半边！',
          '但在边界 (3, 3) 出现了一个大缺口！白棋正虎视眈眈想要钻进来！',
          '快下在 (3, 3) 筑起城墙，完美封锁边界！'
        ],
        boardSize: 7,
        initialStones: [
          { r: 0, c: 3, color: 'B' },
          { r: 1, c: 3, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 4, c: 3, color: 'B' },
          { r: 5, c: 3, color: 'B' },
          { r: 6, c: 3, color: 'B' },
          { r: 0, c: 4, color: 'W' },
          { r: 1, c: 4, color: 'W' },
          { r: 2, c: 4, color: 'W' },
          { r: 3, c: 4, color: 'W' },
          { r: 4, c: 4, color: 'W' },
          { r: 5, c: 4, color: 'W' },
          { r: 6, c: 4, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在 (3, 3) 挡住缺口，完成边界封锁！',
        goalTextEn: 'Play at (3,3) to seal the boundary gap in the endgame!',
        targetHighlight: [{ r: 3, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 3, c: 3 },
            comment: '大门关好啦！黑棋领地固若金汤，白棋一步也进不来！',
            isCorrect: true
          }
        ],
        hint: '点击黑棋防线上唯一的缺口 (3, 3)！',
        explanation: '收官与封锁（Endgame Border Sealing）：终局阶段双方划分领地界限，及时挡住边界缺口可确保己方领地不被对方侵入蚕食。',
        bilingualTerm: {
          chinese: '收官 / 边界',
          pinyin: 'shōu guān / biān jiè',
          english: 'Endgame / Boundary Sealing',
          concept: '对局尾声阶段划定并巩固各自地盘边界的精细操作。'
        },
        rewards: { stars: 3, coins: 70, exp: 160 }
      },
      {
        id: 'lesson_5_3',
        chapterId: 5,
        type: 'puzzle',
        title: '5-3 劫争的奥秘（打劫规则）',
        titleEn: 'The Mystery of Ko (Ko Rule)',
        subtitle: '禁止同形重复！不能立刻回提',
        description: '当双方互相提单子会造成无限死循环时，规则规定不能立即回提，必须先在别处“寻劫”！',
        storyDialogues: [
          '白棋刚在 (2, 2) 提了黑棋一子！',
          '根据围棋神圣的【劫争规则】（Ko Rule），黑棋不能立刻在 (2, 2) 反提！',
          '黑棋在上方 (0, 2) 发动了一次强大的威胁，白棋在 (0, 1) 应答了！现在黑棋可以回到 (2, 2) 提劫了！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 1, c: 2, color: 'B' },
          { r: 3, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 1, c: 3, color: 'W' },
          { r: 3, c: 3, color: 'W' },
          { r: 2, c: 4, color: 'W' },
          { r: 2, c: 3, color: 'B' },
          { r: 2, c: 2, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在 (2, 2) 提掉白子，赢下劫争！',
        goalTextEn: 'Play at (2,2) to recapture the Ko stone!',
        targetHighlight: [{ r: 2, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 2, c: 2 },
            comment: '提劫成功！黑棋掌控了劫争的主动权！',
            isCorrect: true
          }
        ],
        hint: '在白子只剩 1 口气的 (2, 2) 进行提劫！',
        explanation: '劫争规则（Ko Rule）：为了防止对局陷入互相提吃一颗单子的无限循环，规定一方提劫后，对方不能立刻回提，必须在棋盘其他地方下一手（寻劫），若对方应答，方可在下一手回提。',
        bilingualTerm: {
          chinese: '劫争 / 打劫',
          pinyin: 'jié zhēng / dǎ jié',
          english: 'Ko / Ko Fight',
          concept: '防止局势无限循环的特殊规则，是围棋最富变幻的战术核心。'
        },
        rewards: { stars: 3, coins: 75, exp: 180 }
      },
      {
        id: 'lesson_5_4',
        chapterId: 5,
        type: 'puzzle',
        title: '5-4 终局点目与清理死子',
        titleEn: 'Scoring & Dead Stone Removal',
        subtitle: '清理领地内的死棋，计算谁是胜利者',
        description: '终局时，己方领地内已经无法做活的敌方棋子属于死子，清理后计算领地总目数！',
        storyDialogues: [
          '整盘棋即将结束！黑棋占领了左边大片领地！',
          '在黑棋大本营角落 (0, 0) 里有一颗死掉的孤单白子！',
          '在 (0, 0) 把它提吃清理干净，清点黑棋满满的胜利果实吧！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 0, c: 0, color: 'W' },
          { r: 0, c: 1, color: 'B' },
          { r: 1, c: 0, color: 'B' },
          { r: 1, c: 1, color: 'B' },
          { r: 2, c: 0, color: 'B' },
          { r: 2, c: 1, color: 'B' },
          { r: 2, c: 2, color: 'B' },
          { r: 2, c: 3, color: 'B' },
          { r: 2, c: 4, color: 'B' },
          { r: 3, c: 2, color: 'W' },
          { r: 4, c: 2, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在 (0, 0) 提吃并清理白方死子！',
        goalTextEn: 'Play at (0,0) to capture and remove the dead stone from your territory!',
        targetHighlight: [{ r: 0, c: 0 }],
        puzzleRoot: [
          {
            coord: { r: 0, c: 0 },
            comment: '完美清理！黑棋左侧领地完整纯净，获得最终大胜！',
            isCorrect: true
          }
        ],
        hint: '点击左上角只剩 0 气边缘的 (0, 0) 完成提吃！',
        explanation: '终局数子（Area Scoring）：在双方都停着（Pass）后，确认双方死子并移出棋盘。中国规则通过数黑白活子与所围空点之和来判定胜负。',
        bilingualTerm: {
          chinese: '终局 / 数子点目',
          pinyin: 'zhōng jú / shǔ zǐ',
          english: 'End of Game / Area Scoring',
          concept: '对局结束时清理死子并计算各自控制领地总和以判定胜负。'
        },
        rewards: { stars: 3, coins: 80, exp: 200 }
      }
    ]
  },

  // ==========================================
  // 第六章：小棋圣进阶之战（大局观与实战通关）
  // ==========================================
  {
    id: 6,
    title: '第六章：小棋圣进阶之战（大局观与实战）',
    titleEn: 'Chapter 6: The Junior Grandmaster (Mastery)',
    icon: '👑',
    themeColor: 'from-rose-500 via-amber-500 to-yellow-500',
    description: '掌握舍小取大的弃子智慧、经典少儿定式，完成九路盘实战大考验！',
    lessons: [
      {
        id: 'lesson_6_1',
        chapterId: 6,
        type: 'puzzle',
        title: '6-1 弃子争先（舍小取大的智慧）',
        titleEn: 'Sacrifice & Initiative (Sente)',
        subtitle: '不要舍不得一颗死子，抢占全局主动权',
        description: '小棋手常犯的错误是盲目拯救救不活的小棋子。学会舍弃一子换取外围雄厚势力！',
        storyDialogues: [
          '黑棋一颗子 (2, 2) 已经陷入白棋重围，救它只会送更多！',
          '明智的小棋手选择舍弃它，在上方 (1, 3) 封锁外围，构筑坚不可摧的巍峨城墙！'
        ],
        boardSize: 5,
        initialStones: [
          { r: 2, c: 2, color: 'B' },
          { r: 2, c: 1, color: 'W' },
          { r: 3, c: 2, color: 'W' },
          { r: 2, c: 3, color: 'W' },
          { r: 0, c: 2, color: 'B' },
          { r: 0, c: 3, color: 'B' },
          { r: 1, c: 1, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '放弃内侧弱子，在 (1, 3) 封锁外部大势！',
        goalTextEn: 'Sacrifice the inner stone and play at (1,3) to seal the outer territory!',
        targetHighlight: [{ r: 1, c: 3 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 3 },
            comment: '大局观超凡！白棋虽然吃掉一小颗黑子，但黑棋赢得了整片北方辽阔疆土！',
            isCorrect: true
          }
        ],
        hint: '不要救 (2, 2)，在右上外围 (1, 3) 封锁大门！',
        explanation: '弃子争先（Sacrifice & Sente）：主动舍弃局部的次要残子，换取宝贵的先手权利或外围厚势，是高水平棋手必备的大局观。',
        bilingualTerm: {
          chinese: '弃子 / 先手',
          pinyin: 'qì zǐ / xiān shǒu',
          english: 'Sacrifice / Sente',
          concept: '舍弃局部次要利益以争夺全局主动权的高级战略思维。'
        },
        rewards: { stars: 3, coins: 80, exp: 200 }
      },
      {
        id: 'lesson_6_2',
        chapterId: 6,
        type: 'puzzle',
        title: '6-2 经典少儿星位定式',
        titleEn: 'Fundamental Star Point Joseki',
        subtitle: '最标准的角部攻防招法',
        description: '当白棋来进攻黑棋的角部星位时，黑棋用“小飞守角”或“尖顶”优雅稳守！',
        storyDialogues: [
          '黑棋占有左上角星位 (2, 2)！',
          '白棋从右边 (2, 4) 跨步进逼（挂角）想要抢夺角部！',
          '黑棋在 (1, 2) 稳健守角，既保住角部实地，又让白棋无隙可乘！'
        ],
        boardSize: 7,
        initialStones: [
          { r: 2, c: 2, color: 'B' },
          { r: 2, c: 4, color: 'W' }
        ],
        playerColor: 'B',
        goalText: '在 (1, 2) 稳稳守住黄金角地！',
        goalTextEn: 'Play at (1,2) to execute the standard Star Point Joseki defense!',
        targetHighlight: [{ r: 1, c: 2 }],
        puzzleRoot: [
          {
            coord: { r: 1, c: 2 },
            comment: '招法精妙！角部固若金汤，白棋只能在边上拆边谋生！',
            isCorrect: true
          }
        ],
        hint: '在黑子上方 (1, 2) 筑起角部防御线！',
        explanation: '定式（Joseki）：在角部攻防中，双方经过千锤百炼得出的互不吃亏的最佳下法。掌握基本定式是规范棋型与布局的基础。',
        bilingualTerm: {
          chinese: '定式 / 守角',
          pinyin: 'dìng shì / shǒu jiǎo',
          english: 'Joseki / Corner Defense',
          concept: '角部经过世代棋手检验的标准攻防着法体系。'
        },
        rewards: { stars: 3, coins: 90, exp: 220 }
      },
      {
        id: 'lesson_6_3',
        chapterId: 6,
        type: 'puzzle',
        title: '6-3 毕业试炼：决战九路巅峰',
        titleEn: 'Graduation Challenge: 9x9 Master Showdown',
        subtitle: '综合运用吃子、死活与大局观一锤定音！',
        description: '终极考核！白棋中腹要害出现破绽，找出必杀手筋，通关少儿启蒙全部课程！',
        storyDialogues: [
          '恭喜你来到了启蒙大冒险的终极关卡！',
          '九路棋盘激战正酣，白棋三颗中央要害子 (4, 4)、(4, 5)、(5, 4) 气数告急！',
          '小棋圣，请在 (3, 4) 投下制胜叫吃，给白棋致命一击！'
        ],
        boardSize: 9,
        initialStones: [
          { r: 4, c: 4, color: 'W' },
          { r: 4, c: 5, color: 'W' },
          { r: 5, c: 4, color: 'W' },
          { r: 5, c: 5, color: 'B' },
          { r: 4, c: 3, color: 'B' },
          { r: 5, c: 3, color: 'B' },
          { r: 6, c: 4, color: 'B' },
          { r: 4, c: 6, color: 'B' }
        ],
        playerColor: 'B',
        goalText: '在 (3, 4) 落下必胜叫吃，问鼎小棋圣！',
        goalTextEn: 'Play the winning blow at (3,4) to become a Go Master!',
        targetHighlight: [{ r: 3, c: 4 }],
        puzzleRoot: [
          {
            coord: { r: 3, c: 4 },
            comment: '天元封喉！白棋中央大龙被全歼，恭喜你荣登【一诺小棋圣】巅峰！',
            isCorrect: true
          }
        ],
        hint: '在白棋三子正上方 (3, 4) 完成天降叫吃！',
        explanation: '实战综合胜势（Mastery）：融会贯通数气、吃子手筋、死活判断与大局观，在对局中敏锐捕捉战机，即可战胜对手。',
        bilingualTerm: {
          chinese: '小棋圣 / 棋道精通',
          pinyin: 'xiǎo qí shèng',
          english: 'Junior Grandmaster',
          concept: '融汇围棋基础与高级技巧，具备独立下出高水平棋局的能力。'
        },
        rewards: { stars: 3, coins: 150, exp: 500 }
      }
    ]
  }
];
