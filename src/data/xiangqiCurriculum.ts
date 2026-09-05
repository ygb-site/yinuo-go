import type { XiangqiPieceType, XiangqiSetupPiece, XiangqiSide } from '../engine/xiangqi/xiangqiEngine';

export interface XiangqiLessonStep {
  title: string;
  dialogue: string;
  goalText: string;
  hint: string;
  explanation: string;
  pieces: XiangqiSetupPiece[];
  action: 'click' | 'move';
  selectAt?: { r: number; c: number };
  target: { r: number; c: number };
  /** 点击其中任一格也算对，用来认「多条过不去的路」 */
  targets?: { r: number; c: number }[];
  highlights?: { r: number; c: number }[];
  /** 按规则走不到的格子，棋盘上画红圈给孩子对照 */
  blockedTargets?: { r: number; c: number }[];
  blockedHint?: string;
}

export interface XiangqiLesson {
  id: string;
  chapterId: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  steps: XiangqiLessonStep[];
}

export interface XiangqiEndgame {
  id: string;
  title: string;
  category: 'mate';
  categoryLabel: string;
  difficulty: 'beginner' | 'easy' | 'medium';
  difficultyStars: number;
  prompt: string;
  hint: string;
  explanation: string;
  side: XiangqiSide;
  pieces: XiangqiSetupPiece[];
  solution: { fromR: number; fromC: number; toR: number; toC: number };
}

function p(r: number, c: number, type: XiangqiPieceType, side: XiangqiSide): XiangqiSetupPiece {
  return { r, c, type, side };
}

export const XIANGQI_LESSONS: XiangqiLesson[] = [
  {
    id: 'xq_l1',
    chapterId: 1,
    title: '1-1 楚河汉界',
    subtitle: '认识棋盘中间的大河',
    description: '象棋棋盘中间隔着楚河汉界，红黑两边隔河对望。',
    icon: '🌊',
    steps: [
      {
        title: '找到大河',
        dialogue: '你好呀！我是小诺。象棋棋盘中间有一条河，左边写着楚河，右边写着汉界。点一点河中间那个空交叉点吧！',
        goalText: '点击楚河汉界中间的交叉点',
        hint: '就在棋盘正中间、楚河和汉界之间那一格的交叉点。',
        explanation: '河把棋盘分成两边。象不能过河，兵过河后才能横着走。',
        pieces: [p(9, 4, 'king', 'red'), p(0, 3, 'king', 'black')],
        action: 'click',
        target: { r: 4, c: 4 },
        highlights: [{ r: 4, c: 4 }]
      }
    ]
  },
  {
    id: 'xq_l2',
    chapterId: 1,
    title: '1-2 将帅住在九宫',
    subtitle: '将和帅只能在米字格里活动',
    description: '红帅、黑将都住在己方的九宫里，一次只能走一格直线。',
    icon: '👑',
    steps: [
      {
        title: '点亮九宫',
        dialogue: '红帅住在自己这边的米字格里，这个格子叫九宫。先点一下九宫正中心认识一下家！',
        goalText: '点击红方九宫中心',
        hint: '红帅头顶上、米字交叉的那个点。',
        explanation: '九宫只有 3×3 一共九个点。将帅不能走出这个小院子。',
        pieces: [p(9, 4, 'king', 'red'), p(0, 3, 'king', 'black')],
        action: 'click',
        target: { r: 8, c: 4 },
        highlights: [
          { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 },
          { r: 8, c: 3 }, { r: 8, c: 4 }, { r: 8, c: 5 },
          { r: 9, c: 3 }, { r: 9, c: 4 }, { r: 9, c: 5 }
        ]
      },
      {
        title: '帅走一步',
        dialogue: '帅一次只能走一格直线：上、下、左、右。请把红帅往前走一格。',
        goalText: '红帅向上走一格',
        hint: '先点红帅，再点它正上方的交叉点。',
        explanation: '帅不能斜走，也不能跑出九宫。',
        pieces: [p(9, 4, 'king', 'red'), p(0, 3, 'king', 'black')],
        action: 'move',
        selectAt: { r: 9, c: 4 },
        target: { r: 8, c: 4 },
        highlights: [{ r: 8, c: 4 }]
      }
    ]
  },
  {
    id: 'xq_l3',
    chapterId: 1,
    title: '1-3 士走斜线',
    subtitle: '仕只在九宫里走斜角',
    description: '仕是帅的贴身护卫，只能在九宫里斜着走一格。',
    icon: '🛡',
    steps: [
      {
        title: '仕进中宫',
        dialogue: '红仕是帅的卫士，只会斜着走一格，而且不能离开九宫。请把它走到中间来。',
        goalText: '把左边的仕走到九宫中心',
        hint: '先点左边那枚仕，再点九宫正中。',
        explanation: '仕的路线像九宫里的斜线。它保护帅，自己却很少出门。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 3, 'advisor', 'red'),
          p(9, 5, 'advisor', 'red'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 9, c: 3 },
        target: { r: 8, c: 4 },
        highlights: [{ r: 8, c: 4 }]
      }
    ]
  },
  {
    id: 'xq_l4',
    chapterId: 1,
    title: '1-4 象走田字',
    subtitle: '相走田，不能过河',
    description: '相走田字。田心被堵叫塞象眼，飞不过去；相也不能过河。',
    icon: '🐘',
    steps: [
      {
        title: '相飞田',
        dialogue: '红相走“田”字：斜着飞两格。田字正中心现在是空的，所以飞得过去。请把左边的相飞到右前方。',
        goalText: '把左相飞到右前方的田字格',
        hint: '先点左边的相，再点它右前方隔一格的交叉点。蓝圈中间那一格就是空着的象眼。',
        explanation: '飞象要经过田字正中心。中心空着，就能飞。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 2, 'elephant', 'red'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 9, c: 2 },
        target: { r: 7, c: 4 },
        highlights: [{ r: 7, c: 4 }, { r: 8, c: 3 }]
      },
      {
        title: '找出象眼',
        dialogue: '同样是这只相，田字中心现在站着一枚卒。这个中心叫「象眼」。请先点出被堵住的象眼！',
        goalText: '点出堵住象眼的卒',
        hint: '看左相右前方、田字正中间那枚黑卒，点它。',
        explanation: '对！田字四个角是落点，正中心是象眼。眼里有棋子，就叫塞象眼。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 2, 'elephant', 'red'),
          p(8, 3, 'pawn', 'black'),
          p(0, 3, 'king', 'black')
        ],
        action: 'click',
        selectAt: { r: 9, c: 2 },
        target: { r: 8, c: 3 },
        highlights: [{ r: 8, c: 3 }],
        blockedTargets: [{ r: 7, c: 4 }]
      },
      {
        title: '塞眼飞不过',
        dialogue: '象眼被堵住了。请点出相本来想飞、现在飞不过去的那个交叉点。',
        goalText: '点出被塞眼、飞不过去的格子',
        hint: '从左相再往右上飞一个田字，那个空交叉点就是。红圈标出来了。',
        explanation: '田心有子就不能斜着飞过去。己方、对方的棋子堵在象眼，都不行。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 2, 'elephant', 'red'),
          p(8, 3, 'pawn', 'black'),
          p(0, 3, 'king', 'black')
        ],
        action: 'click',
        selectAt: { r: 9, c: 2 },
        target: { r: 7, c: 4 },
        highlights: [{ r: 8, c: 3 }],
        blockedTargets: [{ r: 7, c: 4 }]
      },
      {
        title: '换一边飞',
        dialogue: '右边塞眼了，左边的田心还是空的。请把相飞到还能去的那边。',
        goalText: '把相飞到没有塞眼的一边',
        hint: '先点相，再点它左前方隔一格的交叉点。右边红圈那条路飞不过去。',
        explanation: '塞象眼只挡住这一条田字。另一只眼空着，相还能飞。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 2, 'elephant', 'red'),
          p(8, 3, 'pawn', 'black'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 9, c: 2 },
        target: { r: 7, c: 0 },
        highlights: [{ r: 7, c: 0 }, { r: 8, c: 1 }],
        blockedTargets: [{ r: 7, c: 4 }],
        blockedHint: '右边飞不过去！田心（象眼）被堵住了，这叫塞象眼。换左边那只空着的眼。'
      },
      {
        title: '相不能过河',
        dialogue: '相还有一个规矩：永远不能过河。这只相已经站到河边了。请点出河对岸它飞不过去的格子。',
        goalText: '点出过了河、相到不了的格子',
        hint: '从河边的相再往前飞一个田字，就掉到楚河汉界那边了。红圈就是。',
        explanation: '象眼空着也不行——相是守家的，不能过楚河汉界。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(5, 2, 'elephant', 'red'),
          p(0, 3, 'king', 'black')
        ],
        action: 'click',
        selectAt: { r: 5, c: 2 },
        target: { r: 3, c: 4 },
        targets: [
          { r: 3, c: 4 },
          { r: 3, c: 0 }
        ],
        blockedTargets: [
          { r: 3, c: 4 },
          { r: 3, c: 0 }
        ]
      }
    ]
  },
  {
    id: 'xq_l5',
    chapterId: 1,
    title: '1-5 马走日字',
    subtitle: '马走日，别蹩马腿',
    description: '马走日字。旁边卡住一格叫蹩马脚，经过这条腿的日字路就跳不过去。',
    icon: '🐴',
    steps: [
      {
        title: '马跳日',
        dialogue: '马走日：先直一格，再斜一格。现在四周都空着，请把这匹红马跳到右前方。',
        goalText: '红马跳到右前方',
        hint: '先点马，再点它右上方那个空交叉点。',
        explanation: '马腿空着，日字路就能跳。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 1, 'horse', 'red'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 9, c: 1 },
        target: { r: 8, c: 3 },
        highlights: [{ r: 8, c: 3 }]
      },
      {
        title: '找出马腿',
        dialogue: '马往前跳，要先经过正前方这一格。这一格叫「马腿」。现在马腿上站着一枚卒。请点出这枚挡路的卒！',
        goalText: '点出挡住马腿的卒',
        hint: '看马头顶上贴着的那枚黑卒，点它。',
        explanation: '对！马先直一格、再斜一格。直的那一格就是马腿。腿上有棋子，叫蹩马脚。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 1, 'horse', 'red'),
          p(8, 1, 'pawn', 'black'),
          p(0, 3, 'king', 'black')
        ],
        action: 'click',
        selectAt: { r: 9, c: 1 },
        target: { r: 8, c: 1 },
        highlights: [{ r: 8, c: 1 }],
        blockedTargets: [
          { r: 7, c: 0 },
          { r: 7, c: 2 }
        ]
      },
      {
        title: '蹩住就跳不过',
        dialogue: '马腿被堵住了。前面两条日字路都跳不过去。请点出马本来想去、现在去不了的格子。',
        goalText: '点出被蹩住、跳不过去的格子',
        hint: '看马左前方或右前方再隔一格的空交叉点，红圈标出来了。',
        explanation: '这就是蹩马脚：马腿上有子，经过这条腿的日字路就被卡死。别的方向还能跳。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 1, 'horse', 'red'),
          p(8, 1, 'pawn', 'black'),
          p(0, 3, 'king', 'black')
        ],
        action: 'click',
        selectAt: { r: 9, c: 1 },
        target: { r: 7, c: 2 },
        targets: [
          { r: 7, c: 2 },
          { r: 7, c: 0 }
        ],
        highlights: [{ r: 8, c: 1 }],
        blockedTargets: [
          { r: 7, c: 0 },
          { r: 7, c: 2 }
        ]
      },
      {
        title: '没蹩的路还能走',
        dialogue: '正前方蹩住了，但马右边的腿是空的。请把马跳到还能去的那个位置。',
        goalText: '把马跳到没有被蹩住的格子',
        hint: '先点马，再点它右上方那个空交叉点。前面两条红圈去不了。',
        explanation: '蹩马脚只挡住经过那条腿的日字。旁边的腿空着，马还能跳。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 1, 'horse', 'red'),
          p(8, 1, 'pawn', 'black'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 9, c: 1 },
        target: { r: 8, c: 3 },
        highlights: [{ r: 8, c: 3 }],
        blockedTargets: [
          { r: 7, c: 0 },
          { r: 7, c: 2 }
        ],
        blockedHint: '这边跳不过去！马正前方的卒蹩住了马腿，前面两条日字路都不能跳。换一条空着的路。'
      }
    ]
  },
  {
    id: 'xq_l6',
    chapterId: 1,
    title: '1-6 车行直线',
    subtitle: '车是战场上的急先锋',
    description: '车可以横走竖走，想走多远就走多远，路上不能隔着棋子。',
    icon: '🚗',
    steps: [
      {
        title: '车进中路',
        dialogue: '车是最猛的棋子，横平竖直想走多远都行。请把底线的车往前开出来。',
        goalText: '红车向前开出三格',
        hint: '先点左边的车，再点它正上方第三个交叉点。',
        explanation: '车不能拐弯，也不能跳过别的棋子。路是空的，就能一溜烟开过去。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(9, 0, 'chariot', 'red'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 9, c: 0 },
        target: { r: 6, c: 0 },
        highlights: [{ r: 6, c: 0 }]
      }
    ]
  },
  {
    id: 'xq_l7',
    chapterId: 1,
    title: '1-7 炮翻山吃子',
    subtitle: '炮走路像车，吃子要隔山',
    description: '炮移动时像车一样直走；要吃子时，中间必须隔着正好一枚棋子。',
    icon: '🧨',
    steps: [
      {
        title: '隔山打马',
        dialogue: '炮吃子要“翻山”：中间隔一枚棋子，才能打到后面的敌人。请用炮隔着卒，把黑马打掉！',
        goalText: '红炮翻山吃掉黑马',
        hint: '先点炮，再点远处那匹黑马。中间那枚卒就是炮架。',
        explanation: '中间没有棋子，炮不能吃；隔了两枚也不行。必须正好隔一枚。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(7, 1, 'cannon', 'red'),
          p(5, 1, 'pawn', 'black'),
          p(3, 1, 'horse', 'black'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 7, c: 1 },
        target: { r: 3, c: 1 },
        highlights: [{ r: 3, c: 1 }, { r: 5, c: 1 }]
      }
    ]
  },
  {
    id: 'xq_l8',
    chapterId: 1,
    title: '1-8 兵卒过河',
    subtitle: '过河的兵会横着走',
    description: '兵没过河只能向前；过了河就能向前或左右，永远不能后退。',
    icon: '🪖',
    steps: [
      {
        title: '兵先向前',
        dialogue: '河这边的兵还没过河，只能朝前走一格。请把它推过河！',
        goalText: '把兵向前推一格',
        hint: '先点红兵，再点它正上方的交叉点。',
        explanation: '没过河的兵胆子很小，只会往前拱。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(6, 4, 'pawn', 'red'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 6, c: 4 },
        target: { r: 5, c: 4 },
        highlights: [{ r: 5, c: 4 }]
      },
      {
        title: '过河就能横走',
        dialogue: '这枚兵已经过河啦！现在它可以向前，也可以向左向右。请让它横走一步。',
        goalText: '过河兵向右横走一格',
        hint: '先点过河的兵，再点它右边的交叉点。',
        explanation: '过河的兵变勇敢了，但仍然不能后退，也不能斜走。',
        pieces: [
          p(9, 4, 'king', 'red'),
          p(4, 4, 'pawn', 'red'),
          p(0, 3, 'king', 'black')
        ],
        action: 'move',
        selectAt: { r: 4, c: 4 },
        target: { r: 4, c: 5 },
        highlights: [{ r: 4, c: 5 }, { r: 3, c: 4 }, { r: 4, c: 3 }]
      }
    ]
  }
];

export const XIANGQI_ENDGAMES: XiangqiEndgame[] = [
  {
    id: 'xq_eg_1',
    title: '车沉底线',
    category: 'mate',
    categoryLabel: '双车杀',
    difficulty: 'beginner',
    difficultyStars: 1,
    prompt: '红先。底线再来一辆车，就能把黑将困死。',
    hint: '把右边的车开到黑将同一行的底线。',
    explanation: '一车看住将门，另一车沉底，黑将左右逃不掉，这就是双车错杀。',
    side: 'red',
    pieces: [
      p(9, 3, 'king', 'red'),
      p(0, 4, 'king', 'black'),
      p(1, 0, 'chariot', 'red'),
      p(3, 8, 'chariot', 'red')
    ],
    solution: { fromR: 3, fromC: 8, toR: 0, toC: 8 }
  },
  {
    id: 'xq_eg_2',
    title: '闷宫将',
    category: 'mate',
    categoryLabel: '车杀',
    difficulty: 'beginner',
    difficultyStars: 1,
    prompt: '红先。黑将贴在九宫边上，车沉底就能把它堵住。',
    hint: '把左边的车开到黑将同一行的底线。',
    explanation: '将贴边时，底线来车，逃跑格又被另一辆车看住，就是闷杀。',
    side: 'red',
    pieces: [
      p(9, 5, 'king', 'red'),
      p(0, 3, 'king', 'black'),
      p(1, 8, 'chariot', 'red'),
      p(4, 0, 'chariot', 'red')
    ],
    solution: { fromR: 4, fromC: 0, toR: 0, toC: 0 }
  },
  {
    id: 'xq_eg_3',
    title: '马后炮',
    category: 'mate',
    categoryLabel: '马炮杀',
    difficulty: 'easy',
    difficultyStars: 2,
    prompt: '红先。把马跳到炮前面，炮就能隔马将死。',
    hint: '红马跳到中路，正好站在炮和将之间。',
    explanation: '马既当炮架，又看住将的两侧，炮从后面翻山打将，就是马后炮。',
    side: 'red',
    pieces: [
      p(9, 3, 'king', 'red'),
      p(0, 4, 'king', 'black'),
      p(5, 4, 'cannon', 'red'),
      p(4, 3, 'horse', 'red'),
      p(1, 0, 'chariot', 'red')
    ],
    solution: { fromR: 4, fromC: 3, toR: 2, toC: 4 }
  },
  {
    id: 'xq_eg_4',
    title: '白脸将',
    category: 'mate',
    categoryLabel: '车杀',
    difficulty: 'easy',
    difficultyStars: 2,
    prompt: '红先。车占中路，把黑将对面看死。',
    hint: '把底线的车横到中路来。',
    explanation: '车正对着将，将左右被马看住，无处可逃，这叫白脸将。',
    side: 'red',
    pieces: [
      p(9, 3, 'king', 'red'),
      p(0, 4, 'king', 'black'),
      p(8, 0, 'chariot', 'red'),
      p(2, 2, 'horse', 'red'),
      p(2, 6, 'horse', 'red'),
      p(1, 8, 'chariot', 'red')
    ],
    solution: { fromR: 8, fromC: 0, toR: 8, toC: 4 }
  },
  {
    id: 'xq_eg_5',
    title: '挂角马',
    category: 'mate',
    categoryLabel: '马杀',
    difficulty: 'easy',
    difficultyStars: 2,
    prompt: '红先。马挂到将的斜角上，再有车守住逃跑线。',
    hint: '把马跳到将右下方的挂角位置。',
    explanation: '马在九宫斜角检查将，车封住将门，就是挂角马杀。',
    side: 'red',
    pieces: [
      p(9, 3, 'king', 'red'),
      p(0, 4, 'king', 'black'),
      p(3, 1, 'horse', 'red'),
      p(1, 8, 'chariot', 'red'),
      p(2, 0, 'chariot', 'red'),
      p(0, 3, 'advisor', 'black'),
      p(0, 5, 'advisor', 'black')
    ],
    solution: { fromR: 3, fromC: 1, toR: 2, toC: 3 }
  },
  {
    id: 'xq_eg_6',
    title: '重炮将',
    category: 'mate',
    categoryLabel: '炮杀',
    difficulty: 'medium',
    difficultyStars: 3,
    prompt: '红先。中路已有一门炮，把另一门炮也架到中路上。',
    hint: '把横着的炮移到和将同一条直线。',
    explanation: '两门炮叠在一条线上，前面的炮当架子，后面的炮打将，将逃不掉。',
    side: 'red',
    pieces: [
      p(9, 3, 'king', 'red'),
      p(0, 4, 'king', 'black'),
      p(3, 4, 'cannon', 'red'),
      p(6, 0, 'cannon', 'red'),
      p(1, 8, 'chariot', 'red'),
      p(2, 2, 'horse', 'red'),
      p(2, 6, 'horse', 'red')
    ],
    solution: { fromR: 6, fromC: 0, toR: 6, toC: 4 }
  }
];

export const XIANGQI_CHAPTERS = [
  {
    id: 1,
    title: '第一章：棋盘与棋子',
    description: '先认河、认九宫，再学会车马炮兵怎么走。'
  }
];

export function getXiangqiLesson(id: string): XiangqiLesson | undefined {
  return XIANGQI_LESSONS.find((item) => item.id === id);
}

export function getXiangqiEndgame(id: string): XiangqiEndgame | undefined {
  return XIANGQI_ENDGAMES.find((item) => item.id === id);
}
