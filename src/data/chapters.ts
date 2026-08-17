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
  {
    id: 1,
    title: '第一章：棋盘小精灵（基础认知）',
    titleEn: 'Chapter 1: The Board Elves (Foundations)',
    icon: '🌱',
    themeColor: 'from-emerald-400 to-teal-500',
    description: '认识九路小棋盘，学会数棋子的“呼吸通道”——气，以及第一次提子！',
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
      }
    ]
  },
  {
    id: 2,
    title: '第二章：捕鱼小达人（基础吃子技巧）',
    titleEn: 'Chapter 2: Little Fisher (Fundamental Tesuji)',
    icon: '🎣',
    themeColor: 'from-amber-400 to-orange-500',
    description: '掌握围棋最实用经典的四大吃子手筋：抱吃、门吃、征吃与倒扑！',
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
              comment: '白棋逃到 (1, 2)，继续从 (1, 3) 兜头叫吃！'
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
        title: '2-4 倒扑（诱敌入网的魔术）',
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
  }
];

