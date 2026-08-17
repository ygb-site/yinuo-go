import type { StoneColor, Point } from '../engine/types';

export interface TsumegoPuzzle {
  id: string;
  title: string;
  titleEn: string;
  category: 'capturing' | 'living' | 'killing' | 'semeai' | 'ko';
  categoryLabel: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard';
  difficultyStars: number;
  boardSize: number;
  initialStones: { r: number; c: number; color: StoneColor }[];
  playerColor: StoneColor;
  prompt: string;
  hint: string;
  explanation: string;
  correctMoves: Point[];
  botBranchMoves?: {
    triggerMove: Point;
    botMove: Point;
    botComment: string;
    nextValidMove: Point;
    winComment: string;
  };
  bilingualKey: {
    term: string;
    en: string;
  };
}

export const TSUMEGO_PUZZLES: TsumegoPuzzle[] = [
  // Capturing
  {
    id: 'ts_cap_1',
    title: '入门第一课：一口气拔起白子',
    titleEn: 'First Capture: Instant Atari Take',
    category: 'capturing',
    categoryLabel: '吃子手筋',
    difficulty: 'beginner',
    difficultyStars: 1,
    boardSize: 5,
    initialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    playerColor: 'B',
    prompt: '黑先，白子只剩右边一口气，请一击将白子提掉！',
    hint: '点击白子右侧唯一的呼吸孔 D3 交叉点！',
    explanation: '白子被三颗黑子包围，下在右侧 D3 交叉点（列 D 行 3）即可堵死其最后一口气并完成提子。',
    correctMoves: [{ r: 2, c: 3 }],
    bilingualKey: { term: '叫吃与提子', en: 'Atari & Capture' }
  },
  {
    id: 'ts_cap_2',
    title: '抱吃：关照逃跑的小白子',
    titleEn: 'Embrace: Catching the Runner',
    category: 'capturing',
    categoryLabel: '吃子手筋',
    difficulty: 'easy',
    difficultyStars: 2,
    boardSize: 5,
    initialStones: [
      { r: 1, c: 2, color: 'W' },
      { r: 0, c: 2, color: 'B' },
      { r: 1, c: 1, color: 'B' },
      { r: 2, c: 1, color: 'B' }
    ],
    playerColor: 'B',
    prompt: '黑先，白子想要往右边逃窜，请用“抱吃”把它抱入己方包围圈！',
    hint: '从右上 D4 交叉点（列 D 行 4）迎头兜截！',
    explanation: '在 D4 交叉点（列 D 行 4）迎头叫吃，白子逃跑路线被彻底封死。',
    correctMoves: [{ r: 1, c: 3 }],
    bilingualKey: { term: '抱吃', en: 'Embrace Capture' }
  },
  {
    id: 'ts_cap_3',
    title: '门吃：双门并立插门栓',
    titleEn: 'Gate Capture: Closing the Door',
    category: 'capturing',
    categoryLabel: '吃子手筋',
    difficulty: 'easy',
    difficultyStars: 2,
    boardSize: 5,
    initialStones: [
      { r: 2, c: 2, color: 'W' },
      { r: 1, c: 1, color: 'B' },
      { r: 3, c: 1, color: 'B' },
      { r: 2, c: 0, color: 'B' }
    ],
    playerColor: 'B',
    prompt: '黑先，白子从两扇门中探出头，请关门打狗！',
    hint: '点在正前方 B3 交叉点（列 B 行 3）关上大门！',
    explanation: '门吃手筋：利用上下两颗黑子形成的门户，下在 B3 交叉点关门打狗。',
    correctMoves: [{ r: 2, c: 1 }],
    bilingualKey: { term: '门吃', en: 'Gate Capture' }
  },
  {
    id: 'ts_cap_4',
    title: '神奇倒扑：送吃一子回提大片',
    titleEn: 'Snapback: The Magic Counter-Capture',
    category: 'capturing',
    categoryLabel: '吃子手筋',
    difficulty: 'medium',
    difficultyStars: 3,
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
    prompt: '黑先，勇敢将诱饵黑子投入正中心 C3 虎口（天元），发动倒扑！',
    hint: '点在正中心 C3（天元）诱饵点，白棋提子后整块只剩 1 气，立即原位回提！',
    explanation: '倒扑是围棋经典杀招，先送一子让白棋气数只剩1气，随后原位反提整块白子。',
    correctMoves: [{ r: 2, c: 2 }],
    botBranchMoves: {
      triggerMove: { r: 2, c: 2 },
      botMove: { r: 2, c: 2 },
      botComment: '白棋贪吃提走诱饵，但整体只剩 1 气！',
      nextValidMove: { r: 2, c: 2 },
      winComment: '漂亮的倒扑！一举歼灭白棋大部队！'
    },
    bilingualKey: { term: '倒扑', en: 'Snapback' }
  },
  {
    id: 'ts_cap_5',
    title: '双叫吃：让敌人顾此失彼',
    titleEn: 'Double Atari: Pick Your Target',
    category: 'capturing',
    categoryLabel: '吃子手筋',
    difficulty: 'medium',
    difficultyStars: 3,
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
    prompt: '黑先，寻找能同时叫吃两颗白子的黄金交叉点！',
    hint: '下在 C4（白子上方）或 D3（白子右侧）都能形成一石二鸟的双叫吃！',
    explanation: '双叫吃一出，对方一回合只能接救一边，另一边必被拔起。',
    correctMoves: [{ r: 1, c: 2 }, { r: 2, c: 3 }],
    bilingualKey: { term: '双叫吃', en: 'Double Atari' }
  },
  {
    id: 'ts_cap_6',
    title: '接不归：连上也是死路一条',
    titleEn: 'Connect and Die (Crane Nest)',
    category: 'capturing',
    categoryLabel: '吃子手筋',
    difficulty: 'medium',
    difficultyStars: 3,
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
    prompt: '黑先，抓住白棋气紧的弱点，切断并形成接不归！',
    hint: '点在 B3 交叉点（断点）切断白棋，形成接不归！',
    explanation: '白棋气极短，即使白子接在 (2,1) 也逃脱不了叫吃命运。',
    correctMoves: [{ r: 2, c: 1 }],
    bilingualKey: { term: '接不归', en: 'Connect and Die' }
  },

  // Living (Life & Death)
  {
    id: 'ts_live_1',
    title: '做活：直三中央一点分两眼',
    titleEn: 'Straight Three: Vital Center Move',
    category: 'living',
    categoryLabel: '做活保命',
    difficulty: 'easy',
    difficultyStars: 2,
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
    prompt: '黑先，中间留有3格大眼空间，请在最核心的正中心下子，一分为二做活！',
    hint: '点击正中心 C3 交叉点（天元）！一分为二形成两只真眼！',
    explanation: '直三形状的做活急所正在正中心。占领后左右各成一只真眼，永久活棋！',
    correctMoves: [{ r: 2, c: 2 }],
    bilingualKey: { term: '直三做活', en: 'Three-in-a-row Eye Life' }
  },
  {
    id: 'ts_live_2',
    title: '防守假眼：补强对角连接',
    titleEn: 'False Eye Defense: Seal the Corner',
    category: 'living',
    categoryLabel: '做活保命',
    difficulty: 'medium',
    difficultyStars: 3,
    boardSize: 5,
    initialStones: [
      { r: 1, c: 1, color: 'B' },
      { r: 1, c: 3, color: 'B' },
      { r: 2, c: 0, color: 'B' },
      { r: 2, c: 2, color: 'B' },
      { r: 3, c: 1, color: 'B' },
      { r: 3, c: 3, color: 'B' },
      { r: 0, c: 2, color: 'W' }
    ],
    playerColor: 'B',
    prompt: '黑先，上方有白子窥视，请下在 (1, 2) 补强，将假眼变成真眼！',
    hint: '点在上方 C4 交叉点（列 C 行 4）补牢对角！',
    explanation: '补上 (1, 2) 后，上方对角不再漏风，眼位彻底固定为真眼。',
    correctMoves: [{ r: 1, c: 2 }],
    bilingualKey: { term: '真眼修补', en: 'Securing Real Eye' }
  },
  {
    id: 'ts_live_3',
    title: '弯四做活：黄金中腹要点',
    titleEn: 'Bent Four: Life in Corner',
    category: 'living',
    categoryLabel: '做活保命',
    difficulty: 'hard',
    difficultyStars: 4,
    boardSize: 5,
    initialStones: [
      { r: 0, c: 2, color: 'B' },
      { r: 1, c: 2, color: 'B' },
      { r: 2, c: 0, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 2, c: 2, color: 'B' }
    ],
    playerColor: 'B',
    prompt: '黑先，在左上角的弯四空间中，请找到唯一的做活双眼急所！',
    hint: '下在核心拐角 B4 交叉点（列 B 行 4）！',
    explanation: '弯四形状的做活要点在弯折的核心拐点 (1,1)，能同时兼顾两边眼位。',
    correctMoves: [{ r: 1, c: 1 }],
    bilingualKey: { term: '弯四做活', en: 'Bent-Four Life' }
  },

  // Killing
  {
    id: 'ts_kill_1',
    title: '点眼杀棋：直三正中点入',
    titleEn: 'Killing: Eye-Stealing on Straight Three',
    category: 'killing',
    categoryLabel: '杀棋破眼',
    difficulty: 'easy',
    difficultyStars: 2,
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
    prompt: '黑先，白棋企图做活，请抢占 (2, 2) 核心眼位将白棋点杀！',
    hint: '敌之要点即我之要点，抢占中心 C3 交叉点（天元）！',
    explanation: '直三眼位的死活关键就在 (2,2)。黑棋抢先点入，白棋无法做出两只真眼，成为死棋。',
    correctMoves: [{ r: 2, c: 2 }],
    bilingualKey: { term: '点眼杀棋', en: 'Eye-Stealing Strike' }
  },
  {
    id: 'ts_kill_2',
    title: '扑入破眼：制造致命假眼',
    titleEn: 'Throw-in: Creating a False Eye',
    category: 'killing',
    categoryLabel: '杀棋破眼',
    difficulty: 'medium',
    difficultyStars: 3,
    boardSize: 5,
    initialStones: [
      { r: 1, c: 1, color: 'W' },
      { r: 1, c: 3, color: 'W' },
      { r: 2, c: 0, color: 'W' },
      { r: 2, c: 2, color: 'W' },
      { r: 3, c: 1, color: 'W' },
      { r: 3, c: 3, color: 'W' },
      { r: 0, c: 1, color: 'B' },
      { r: 0, c: 3, color: 'B' }
    ],
    playerColor: 'B',
    prompt: '黑先，在 (1, 2) 扑入一子，让白棋的上方眼位彻底化为假眼！',
    hint: '果断扑在上方 C4 交叉点（列 C 行 4）！',
    explanation: '“扑”的手筋破坏了对方眼位的对角完整性，使白棋眼位沦为假眼无法做活。',
    correctMoves: [{ r: 1, c: 2 }],
    bilingualKey: { term: '扑破眼', en: 'Throw-in for Eye Destruction' }
  },

  // Semeai (Capturing Race)
  {
    id: 'ts_sem_1',
    title: '对杀入门：先紧外气抢先机',
    titleEn: 'Semeai Basics: Tighten External Liberties',
    category: 'semeai',
    categoryLabel: '对杀技巧',
    difficulty: 'medium',
    difficultyStars: 3,
    boardSize: 5,
    initialStones: [
      { r: 2, c: 1, color: 'B' },
      { r: 2, c: 2, color: 'B' },
      { r: 2, c: 3, color: 'W' },
      { r: 2, c: 4, color: 'W' },
      { r: 1, c: 1, color: 'B' },
      { r: 1, c: 4, color: 'W' }
    ],
    playerColor: 'B',
    prompt: '黑先，双方各有 2 口气，黑棋必须抢先紧白棋的外气！',
    hint: '下在右下方 D2 交叉点（列 D 行 2）收紧白棋外气！',
    explanation: '对杀（Semeai）中，气数相同的两块棋，谁先紧气谁就能先一步提掉对方！',
    correctMoves: [{ r: 3, c: 3 }, { r: 3, c: 4 }],
    bilingualKey: { term: '对杀 / 紧气', en: 'Capturing Race (Semeai)' }
  },

  // Ko rule
  {
    id: 'ts_ko_1',
    title: '劫争初探：不可立即反提',
    titleEn: 'Ko Battle: The Sacred Repetition Rule',
    category: 'ko',
    categoryLabel: '劫争技巧',
    difficulty: 'hard',
    difficultyStars: 4,
    boardSize: 5,
    initialStones: [
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 1, c: 3, color: 'W' },
      { r: 3, c: 3, color: 'W' },
      { r: 2, c: 4, color: 'W' },
      { r: 2, c: 3, color: 'W' } // White in atari
    ],
    playerColor: 'B',
    prompt: '黑先，白子在 D3 处于叫吃状态，请在 C3 交叉点先手提劫！',
    hint: '下在中心 C3 交叉点（天元）先手提劫！',
    explanation: '提劫后白棋不能立刻反提，必须先在别处找劫材。这就是围棋的“劫争”（Ko Rule）。',
    correctMoves: [{ r: 2, c: 2 }],
    bilingualKey: { term: '提劫', en: 'Taking the Ko' }
  }
];


