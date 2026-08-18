import type { StoneColor, Point } from '../engine/types';

export interface GoRhymeCard {
  id: string;
  title: string;
  titleEn: string;
  rhyme: string;
  rhymePinyin: string;
  meaning: string;
  category: 'opening' | 'tactics' | 'life_death' | 'endgame';
  categoryLabel: string;
  boardSize: number;
  stones: { r: number; c: number; color: StoneColor }[];
  highlight: Point[];
  explanation: string;
  audioKeyLine: string;
}

export const GO_RHYMES_DATA: GoRhymeCard[] = [
  {
    id: 'rhyme_1',
    title: '金角银边草肚皮',
    titleEn: 'Corners Gold, Sides Silver, Center Grass',
    rhyme: '金角银边草肚皮，开局先往角上飞。两子占角地盘稳，中间空旷少去追！',
    rhymePinyin: 'jīn jiǎo yín biān cǎo dù pí, kāi jú xiān wǎng jiǎo shàng fēi.',
    meaning: '角部有两面边界天然防护，占地效率最高（金角）；边上次之（银边）；中央四面漏风，围地最难（草肚皮）。',
    category: 'opening',
    categoryLabel: '布局大局观',
    boardSize: 5,
    stones: [
      { r: 1, c: 1, color: 'B' },
      { r: 1, c: 3, color: 'B' },
      { r: 3, c: 1, color: 'B' }
    ],
    highlight: [{ r: 1, c: 1 }, { r: 1, c: 3 }],
    explanation: '在角上只需几颗子就能围出一大块实地；在中央需要十几颗子才能围住相同的目数，因此开局先占角、再拆边、后逐鹿中原。',
    audioKeyLine: '金角银边草肚皮，开局先占角！'
  },
  {
    id: 'rhyme_2',
    title: '棋逢断处生生机',
    titleEn: 'Sever at the Cut: Opportunity Lies in Cutting',
    rhyme: '棋逢断处生生机，看准弱点切断伊。对方气短难招架，分断两截赢先机！',
    rhymePinyin: 'qí féng duàn chù shēng shēng jī, kàn zhǔn ruò diǎn qiē duàn yī.',
    meaning: '对手连接薄弱处往往潜藏巨大的战斗机会。只要能安全分断对手，就能一分为二展开攻击。',
    category: 'tactics',
    categoryLabel: '战斗手筋',
    boardSize: 5,
    stones: [
      { r: 1, c: 2, color: 'W' },
      { r: 2, c: 3, color: 'W' },
      { r: 1, c: 3, color: 'B' },
      { r: 3, c: 2, color: 'B' }
    ],
    highlight: [{ r: 2, c: 2 }],
    explanation: '当下在 C3 断点切断白棋两子时，白棋形成两块互不相干的弱棋，攻守之势瞬间逆转。',
    audioKeyLine: '棋逢断处生生机，断开对方弱连络！'
  },
  {
    id: 'rhyme_3',
    title: '有打有吃莫慌张',
    titleEn: 'Keep Calm When in Atari',
    rhyme: '有打有吃莫慌张，看清逃路再接上。若遇重围逃不脱，弃子争先更有方！',
    rhymePinyin: 'yǒu dǎ yǒu chī mò huāng zhāng, kàn qīng táo lù zài jiē shàng.',
    meaning: '自己的棋子被叫吃时不要盲目接回。先看能不能逃，逃不掉就果断弃子抢占别处大场。',
    category: 'tactics',
    categoryLabel: '防守口诀',
    boardSize: 5,
    stones: [
      { r: 2, c: 2, color: 'B' },
      { r: 1, c: 2, color: 'W' },
      { r: 2, c: 1, color: 'W' },
      { r: 3, c: 2, color: 'W' }
    ],
    highlight: [{ r: 2, c: 3 }],
    explanation: '中心黑子只剩右边一口气。如果能往右边与援军接上就接；如果右边也是死路，就不要盲目送死，去占角部大场。',
    audioKeyLine: '有打有吃莫慌张，看清逃路再接上！'
  },
  {
    id: 'rhyme_4',
    title: '二子拔花三十目',
    titleEn: 'Two Stones Ponnuki is Worth 30 Points',
    rhyme: '二子拔花三十目，厚势冲天如猛虎。中腹开花射四方，全盘辐射大威力！',
    rhymePinyin: 'èr zǐ bá huā sān shí mù, hòu shì chōng tiān rú měng hǔ.',
    meaning: '在中腹提掉对方两颗要子（拔花），形成的龟甲厚势极具威力，价值相当于三十目棋。',
    category: 'tactics',
    categoryLabel: '厚势棋理',
    boardSize: 5,
    stones: [
      { r: 1, c: 2, color: 'B' },
      { r: 3, c: 2, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 2, c: 3, color: 'B' }
    ],
    highlight: [{ r: 2, c: 2 }],
    explanation: '提掉对方要子形成的“开花”形态气长无比、坚不可摧，向四周投射巨大的威慑力。',
    audioKeyLine: '二子拔花三十目，厚势威武冲天！'
  },
  {
    id: 'rhyme_5',
    title: '敌之要点即我之要点',
    titleEn: "Opponent's Vital Point is My Vital Point",
    rhyme: '敌之要点即我点，抢先一步定乾坤。死活做眼分秒争，谁占急所谁称神！',
    rhymePinyin: 'dí zhī yào diǎn jí wǒ diǎn, qiǎng xiān yī bù dìng qián kūn.',
    meaning: '对手下了就能做活或成势的关键点，正是我方点杀或破坏的最佳攻击点。',
    category: 'life_death',
    categoryLabel: '死活急所',
    boardSize: 5,
    stones: [
      { r: 1, c: 1, color: 'W' },
      { r: 1, c: 2, color: 'W' },
      { r: 1, c: 3, color: 'W' },
      { r: 3, c: 1, color: 'W' },
      { r: 3, c: 2, color: 'W' },
      { r: 3, c: 3, color: 'W' }
    ],
    highlight: [{ r: 2, c: 2 }],
    explanation: '直三眼位的正中心：白棋占了就能做活，黑棋占了就能点杀。这就是“敌之急所即我之急所”。',
    audioKeyLine: '敌之要点即我之要点，抢先占领！'
  },
  {
    id: 'rhyme_6',
    title: '死子莫急拔，余味常在心',
    titleEn: 'Do Not Hurry to Take Dead Stones',
    rhyme: '死子莫急拔，余味常在心。已成瓮中捉鳖势，保留先手占大金！',
    rhymePinyin: 'sǐ zǐ mò jí bá, yú wèi cháng zài xīn.',
    meaning: '对方已经绝对跑不掉的死子，不需要急着立刻提掉浪费手数，应当去抢占更大的地方。',
    category: 'endgame',
    categoryLabel: '先手效率',
    boardSize: 5,
    stones: [
      { r: 1, c: 1, color: 'W' },
      { r: 0, c: 1, color: 'B' },
      { r: 1, c: 0, color: 'B' },
      { r: 2, c: 1, color: 'B' },
      { r: 1, c: 2, color: 'B' }
    ],
    highlight: [{ r: 3, c: 3 }],
    explanation: '门吃或枷吃住的死子不会长脚跑掉。在对方没有威胁时，应把宝贵的手数投入到空旷大场。',
    audioKeyLine: '死子莫急拔，保留先手占大场！'
  }
];

