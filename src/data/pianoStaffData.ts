export type ClefType = 'treble' | 'bass';

export interface StaffNoteItem {
  id: string;             // e.g. 'treble_C4', 'treble_E4'
  clef: ClefType;
  pitch: string;          // e.g. 'C4'
  pitchClass: string;     // 'C', 'D', 'E', 'F', 'G', 'A', 'B'
  octave: number;         // 2, 3, 4, 5
  syllable: string;       // 'Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'
  syllableZh: string;     // '多', '来', '米', '发', '梭', '拉', '西'
  numberNotation: string; // '1', '2', '3', '4', '5', '6', '7'
  positionType: 'line' | 'space' | 'ledger_line' | 'ledger_space';
  positionName: string;   // '下加一线', '第一线', '第一间', etc.
  stepOffset: number;     // Step offset relative to line 3 (middle line = 0). Each step = half line spacing
  ledgerLines: number[];  // Array of offsets that need ledger lines drawn (e.g. [-6] for C4 on treble)
  mnemonic: string;       // 口诀速记
  tip: string;            // 学习技巧
  isLandmark?: boolean;   // 是否地标核心音 (中央C, 高音G, 低音F等)
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * 高音谱表 (Treble Clef / G Clef) 常用教学音符集
 * Line 3 (B4) is at stepOffset = 0
 * Line 1 (E4) is at stepOffset = -4
 * Line 5 (F5) is at stepOffset = +4
 * Line spacing is usually 12px or 16px, so each step is spacing / 2.
 */
export const TREBLE_STAFF_NOTES: StaffNoteItem[] = [
  {
    id: 'treble_A3',
    clef: 'treble',
    pitch: 'A3',
    pitchClass: 'A',
    octave: 3,
    syllable: 'La',
    syllableZh: '拉',
    numberNotation: '6̣',
    positionType: 'ledger_line',
    positionName: '下加二线',
    stepOffset: -8,
    ledgerLines: [-6, -8],
    mnemonic: '下加二线拉琴弦，低沉醇厚低音 La',
    tip: '下加二线比中央C还要低两个音级',
    difficulty: 'advanced'
  },
  {
    id: 'treble_B3',
    clef: 'treble',
    pitch: 'B3',
    pitchClass: 'B',
    octave: 3,
    syllable: 'Si',
    syllableZh: '西',
    numberNotation: '7̣',
    positionType: 'ledger_space',
    positionName: '下加一间',
    stepOffset: -7,
    ledgerLines: [-6],
    mnemonic: '下加一线下方贴，紧紧挨着中央 C 的小 Si',
    tip: '紧贴在中央C（下加一线）下面的空位就是 Si',
    difficulty: 'intermediate'
  },
  {
    id: 'treble_C4',
    clef: 'treble',
    pitch: 'C4',
    pitchClass: 'C',
    octave: 4,
    syllable: 'Do',
    syllableZh: '多',
    numberNotation: '1',
    positionType: 'ledger_line',
    positionName: '下加一线 (中央C)',
    stepOffset: -6,
    ledgerLines: [-6],
    mnemonic: '下加一线戴草帽，中央 C 是好宝宝！',
    tip: '★ 最重要的地标音！像一颗圆圆的苹果被横线穿过',
    isLandmark: true,
    difficulty: 'beginner'
  },
  {
    id: 'treble_D4',
    clef: 'treble',
    pitch: 'D4',
    pitchClass: 'D',
    octave: 4,
    syllable: 'Re',
    syllableZh: '来',
    numberNotation: '2',
    positionType: 'space',
    positionName: '下加一间 (一线下)',
    stepOffset: -5,
    ledgerLines: [],
    mnemonic: '紧挨一线吊篮悬，摇摇晃晃小鹿 Re！',
    tip: '吊在第一线正下方，没有横线穿过它',
    difficulty: 'beginner'
  },
  {
    id: 'treble_E4',
    clef: 'treble',
    pitch: 'E4',
    pitchClass: 'E',
    octave: 4,
    syllable: 'Mi',
    syllableZh: '米',
    numberNotation: '3',
    positionType: 'line',
    positionName: '第一线',
    stepOffset: -4,
    ledgerLines: [],
    mnemonic: '第一线住着 Mi，像只小猫咪咪叫！',
    tip: '五线谱最下面的一条线就是“第一线”，穿心而过是 Mi',
    difficulty: 'beginner'
  },
  {
    id: 'treble_F4',
    clef: 'treble',
    pitch: 'F4',
    pitchClass: 'F',
    octave: 4,
    syllable: 'Fa',
    syllableZh: '发',
    numberNotation: '4',
    positionType: 'space',
    positionName: '第一间',
    stepOffset: -3,
    ledgerLines: [],
    mnemonic: '第一间里开红花，欢欢喜喜发出芽 (Fa)！',
    tip: '「FACE 脸蛋口诀」的第1个字母 F！',
    difficulty: 'beginner'
  },
  {
    id: 'treble_G4',
    clef: 'treble',
    pitch: 'G4',
    pitchClass: 'G',
    octave: 4,
    syllable: 'Sol',
    syllableZh: '梭',
    numberNotation: '5',
    positionType: 'line',
    positionName: '第二线',
    stepOffset: -2,
    ledgerLines: [],
    mnemonic: '高音谱号肚圆圆，正好圈在第二线 (Sol)！',
    tip: '★ 高音谱号又叫 G 谱号，它的螺旋肚皮中心就在第二线 G (Sol)！',
    isLandmark: true,
    difficulty: 'beginner'
  },
  {
    id: 'treble_A4',
    clef: 'treble',
    pitch: 'A4',
    pitchClass: 'A',
    octave: 4,
    syllable: 'La',
    syllableZh: '拉',
    numberNotation: '6',
    positionType: 'space',
    positionName: '第二间',
    stepOffset: -1,
    ledgerLines: [],
    mnemonic: '第二间里拉手手，开心唱起跳舞歌 (La)！',
    tip: '「FACE 脸蛋口诀」的第2个字母 A！标准音440Hz也是它',
    difficulty: 'beginner'
  },
  {
    id: 'treble_B4',
    clef: 'treble',
    pitch: 'B4',
    pitchClass: 'B',
    octave: 4,
    syllable: 'Si',
    syllableZh: '西',
    numberNotation: '7',
    positionType: 'line',
    positionName: '第三线 (中线)',
    stepOffset: 0,
    ledgerLines: [],
    mnemonic: '第三线是正当中，小桥流水西湖边 (Si)！',
    tip: '第三线是五线谱的正中线，从此音符符干通常向下画',
    difficulty: 'beginner'
  },
  {
    id: 'treble_C5',
    clef: 'treble',
    pitch: 'C5',
    pitchClass: 'C',
    octave: 5,
    syllable: 'Do',
    syllableZh: '多',
    numberNotation: '1̇',
    positionType: 'space',
    positionName: '第三间',
    stepOffset: 1,
    ledgerLines: [],
    mnemonic: '第三间是高音 Do，清脆明亮百灵鸟！',
    tip: '「FACE 脸蛋口诀」的第3个字母 C！高八度小能手',
    isLandmark: true,
    difficulty: 'beginner'
  },
  {
    id: 'treble_D5',
    clef: 'treble',
    pitch: 'D5',
    pitchClass: 'D',
    octave: 5,
    syllable: 'Re',
    syllableZh: '来',
    numberNotation: '2̇',
    positionType: 'line',
    positionName: '第四线',
    stepOffset: 2,
    ledgerLines: [],
    mnemonic: '第四线是小鹿 Re，快步如飞向高奔！',
    tip: '穿过第四条横线的是 Re(D5)',
    difficulty: 'beginner'
  },
  {
    id: 'treble_E5',
    clef: 'treble',
    pitch: 'E5',
    pitchClass: 'E',
    octave: 5,
    syllable: 'Mi',
    syllableZh: '米',
    numberNotation: '3̇',
    positionType: 'space',
    positionName: '第四间',
    stepOffset: 3,
    ledgerLines: [],
    mnemonic: '第四间在最顶层，脸蛋 FACE 最后一员 Mi！',
    tip: '「FACE 脸蛋口诀」的第4个字母 E！',
    difficulty: 'beginner'
  },
  {
    id: 'treble_F5',
    clef: 'treble',
    pitch: 'F5',
    pitchClass: 'F',
    octave: 5,
    syllable: 'Fa',
    syllableZh: '发',
    numberNotation: '4̇',
    positionType: 'line',
    positionName: '第五线',
    stepOffset: 4,
    ledgerLines: [],
    mnemonic: '第五线在屋檐顶，风筝高飞发出声 (Fa)！',
    tip: '五线谱本体最顶端的线，五条线由下往上：Mi-Sol-Si-Re-Fa',
    difficulty: 'beginner'
  },
  {
    id: 'treble_G5',
    clef: 'treble',
    pitch: 'G5',
    pitchClass: 'G',
    octave: 5,
    syllable: 'Sol',
    syllableZh: '梭',
    numberNotation: '5̇',
    positionType: 'space',
    positionName: '上加一间 (五线上)',
    stepOffset: 5,
    ledgerLines: [],
    mnemonic: '端坐五线房顶上，高高一朵向阳花 (Sol)！',
    tip: '坐在第五线正上方，没有加横线穿过',
    difficulty: 'intermediate'
  },
  {
    id: 'treble_A5',
    clef: 'treble',
    pitch: 'A5',
    pitchClass: 'A',
    octave: 5,
    syllable: 'La',
    syllableZh: '拉',
    numberNotation: '6̇',
    positionType: 'ledger_line',
    positionName: '上加一线',
    stepOffset: 6,
    ledgerLines: [6],
    mnemonic: '上加一线顶高高，长长天线拉得高 (La)！',
    tip: '五线谱往上加的第一条小短线',
    difficulty: 'advanced'
  }
];

/**
 * 低音谱表 (Bass Clef / F Clef) 常用教学音符集
 * Line 3 (D3) is at stepOffset = 0
 * Line 4 (F3) is at stepOffset = +2 (F Clef landmark: two dots bracket line 4!)
 * Middle C (C4) is at stepOffset = +6 (上加一线)
 */
export const BASS_STAFF_NOTES: StaffNoteItem[] = [
  {
    id: 'bass_E2',
    clef: 'bass',
    pitch: 'E2',
    pitchClass: 'E',
    octave: 2,
    syllable: 'Mi',
    syllableZh: '米',
    numberNotation: '3̣̣',
    positionType: 'ledger_line',
    positionName: '下加一线',
    stepOffset: -6,
    ledgerLines: [-6],
    mnemonic: '低音谱下加一线，大鼓敲击深沉 Mi',
    tip: '低音区深邃浑厚的基底音',
    difficulty: 'advanced'
  },
  {
    id: 'bass_F2',
    clef: 'bass',
    pitch: 'F2',
    pitchClass: 'F',
    octave: 2,
    syllable: 'Fa',
    syllableZh: '发',
    numberNotation: '4̣̣',
    positionType: 'space',
    positionName: '下加一间',
    stepOffset: -5,
    ledgerLines: [],
    mnemonic: '下加一线楼顶悬，大树底下小发芽 (Fa)',
    tip: '低音谱第一线正下方',
    difficulty: 'intermediate'
  },
  {
    id: 'bass_G2',
    clef: 'bass',
    pitch: 'G2',
    pitchClass: 'G',
    octave: 2,
    syllable: 'Sol',
    syllableZh: '梭',
    numberNotation: '5̣̣',
    positionType: 'line',
    positionName: '第一线',
    stepOffset: -4,
    ledgerLines: [],
    mnemonic: '低音第一线是 Sol，绿色青草地上长！',
    tip: '口诀 G-B-D-F-A (Good Boys Do Fine Always) 的第一个音',
    difficulty: 'beginner'
  },
  {
    id: 'bass_A2',
    clef: 'bass',
    pitch: 'A2',
    pitchClass: 'A',
    octave: 2,
    syllable: 'La',
    syllableZh: '拉',
    numberNotation: '6̣̣',
    positionType: 'space',
    positionName: '第一间',
    stepOffset: -3,
    ledgerLines: [],
    mnemonic: '低音第一间是 La，All Cows Eat Grass 大象拉车！',
    tip: '间口诀 A-C-E-G (All Cows Eat Grass) 的第一个音',
    difficulty: 'beginner'
  },
  {
    id: 'bass_B2',
    clef: 'bass',
    pitch: 'B2',
    pitchClass: 'B',
    octave: 2,
    syllable: 'Si',
    syllableZh: '西',
    numberNotation: '7̣̣',
    positionType: 'line',
    positionName: '第二线',
    stepOffset: -2,
    ledgerLines: [],
    mnemonic: '低音第二线是 Si，大提琴声西风里',
    tip: '线口诀 G-B-D-F-A 第二音',
    difficulty: 'beginner'
  },
  {
    id: 'bass_C3',
    clef: 'bass',
    pitch: 'C3',
    pitchClass: 'C',
    octave: 3,
    syllable: 'Do',
    syllableZh: '多',
    numberNotation: '1̣',
    positionType: 'space',
    positionName: '第二间',
    stepOffset: -1,
    ledgerLines: [],
    mnemonic: '第二间住低音 Do，稳稳当当大客车',
    tip: '低音区最常弹的低八度 Do，间口诀 A-C-E-G 的第2音',
    isLandmark: true,
    difficulty: 'beginner'
  },
  {
    id: 'bass_D3',
    clef: 'bass',
    pitch: 'D3',
    pitchClass: 'D',
    octave: 3,
    syllable: 'Re',
    syllableZh: '来',
    numberNotation: '2̣',
    positionType: 'line',
    positionName: '第三线 (中线)',
    stepOffset: 0,
    ledgerLines: [],
    mnemonic: '第三线是低音 Re，正中分界平稳过',
    tip: '低音谱正中间一条线',
    difficulty: 'beginner'
  },
  {
    id: 'bass_E3',
    clef: 'bass',
    pitch: 'E3',
    pitchClass: 'E',
    octave: 3,
    syllable: 'Mi',
    syllableZh: '米',
    numberNotation: '3̣',
    positionType: 'space',
    positionName: '第三间',
    stepOffset: 1,
    ledgerLines: [],
    mnemonic: '第三间是小猫咪 (Mi)，胖乎乎在间里卧',
    tip: '间口诀 A-C-E-G 的第3音',
    difficulty: 'beginner'
  },
  {
    id: 'bass_F3',
    clef: 'bass',
    pitch: 'F3',
    pitchClass: 'F',
    octave: 3,
    syllable: 'Fa',
    syllableZh: '发',
    numberNotation: '4̣',
    positionType: 'line',
    positionName: '第四线',
    stepOffset: 2,
    ledgerLines: [],
    mnemonic: '两点相夹第四线，低音 F 谱号核心音 (Fa)！',
    tip: '★ 低音谱号又称 F 谱号，它的大黑点和后方两点紧紧夹着第四线 F(Fa)！',
    isLandmark: true,
    difficulty: 'beginner'
  },
  {
    id: 'bass_G3',
    clef: 'bass',
    pitch: 'G3',
    pitchClass: 'G',
    octave: 3,
    syllable: 'Sol',
    syllableZh: '梭',
    numberNotation: '5̣',
    positionType: 'space',
    positionName: '第四间',
    stepOffset: 3,
    ledgerLines: [],
    mnemonic: '第四间里大雁飞，一路向南阳光灿 (Sol)！',
    tip: '间口诀 A-C-E-G 的第4音',
    difficulty: 'beginner'
  },
  {
    id: 'bass_A3',
    clef: 'bass',
    pitch: 'A3',
    pitchClass: 'A',
    octave: 3,
    syllable: 'La',
    syllableZh: '拉',
    numberNotation: '6̣',
    positionType: 'line',
    positionName: '第五线',
    stepOffset: 4,
    ledgerLines: [],
    mnemonic: '低音顶端第五线，大手拉起小手来 (La)！',
    tip: '低音谱最上面的一条线是 A3',
    difficulty: 'beginner'
  },
  {
    id: 'bass_B3',
    clef: 'bass',
    pitch: 'B3',
    pitchClass: 'B',
    octave: 3,
    syllable: 'Si',
    syllableZh: '西',
    numberNotation: '7̣',
    positionType: 'space',
    positionName: '上加一间',
    stepOffset: 5,
    ledgerLines: [],
    mnemonic: '坐在低音五线上，抬头仰望中央 C (Si)',
    tip: '紧挨在中央C下方的空位',
    difficulty: 'intermediate'
  },
  {
    id: 'bass_C4',
    clef: 'bass',
    pitch: 'C4',
    pitchClass: 'C',
    octave: 4,
    syllable: 'Do',
    syllableZh: '多',
    numberNotation: '1',
    positionType: 'ledger_line',
    positionName: '上加一线 (中央C)',
    stepOffset: 6,
    ledgerLines: [6],
    mnemonic: '低音谱表上加一线，和高音谱下加一线是同一颗中央 C！',
    tip: '★ 双谱表大纽带！左右手相遇在中央C！',
    isLandmark: true,
    difficulty: 'beginner'
  }
];

export const ALL_STAFF_NOTES = [...TREBLE_STAFF_NOTES, ...BASS_STAFF_NOTES];

/**
 * 结构化的教程章节与知识点
 */
export interface TutorialChapter {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  content: {
    lead: string;
    sections: {
      heading: string;
      text: string;
      highlightPoints?: string[];
      diagramNotes?: StaffNoteItem[];
      interactiveTip?: string;
    }[];
    rhymes: {
      title: string;
      lines: string[];
    }[];
  };
}

export const PIANO_TUTORIAL_CHAPTERS: TutorialChapter[] = [
  {
    id: 'chapter_lines_spaces',
    title: '第一课：五线谱的骨架（五线与四间）',
    subtitle: '自下而上数线间，楼梯节节往上爬',
    badge: '基础必懂',
    icon: '🎼',
    content: {
      lead: '五线谱是由等距离的五条平行横线组成的。这五条线不仅本身能住音符，线与线之间的四个空隙（间）也能住音符！记住：不管是线还是间，永远都是【由下往上数】！',
      sections: [
        {
          heading: '1. 五条线：由下往上数 1、2、3、4、5',
          text: '最下面的一条线叫【第一线】，往上依次是【第二线】、【第三线】、【第四线】，最上面的是【第五线】。就像盖五层楼，一楼在最下面！',
          highlightPoints: ['第一线在最底下', '第三线是正中线', '第五线在最顶上']
        },
        {
          heading: '2. 四个间：线与线之间的小夹心',
          text: '第一线和第二线之间的空隙叫【第一间】，第二线和第三线之间叫【第二间】，以此类推，一共有【四个间】。音符像小鸟，不仅能在线上停，也能在间里歇！',
          highlightPoints: ['一共有4个间', '同样是由下往上数', '一个音符占一间或踩一线']
        },
        {
          heading: '3. 加线与加间：住不下了盖阁楼和地下室',
          text: '当声音比第五线还要高，或者比第一线还要低时，五线谱就会临时画出小短线，分别叫【上加线/上加间】和【下加线/下加间】。中央C就是住在高音谱的【下加一线】！',
          highlightPoints: ['不够高往上加：上加一线、上加一间', '不够低往下加：下加一线、下加一间']
        },
        {
          heading: '4. 音符小棍（符干）朝向秘密：以第三线为界',
          text: '五线谱正中间的【第三线】是黄金分水岭。凡是第三线以下的音符，小棍一律【朝上】（长在符头右边，像小写字母 d）；凡是第三线以上的音符，小棍一律【朝下】（长在符头左边，像小写字母 p）。正踩在第三线上的音符，朝上朝下都可以！',
          highlightPoints: ['三线以下朝上指（右侧像 d）', '三线以上朝下指（左侧像 p）', '正踩三线两可（随邻居走）', '目的是把小棍收纳在五条线内，谱面不打架']
        }
      ],
      rhymes: [
        {
          title: '🎵 五线谱数数歌',
          lines: [
            '五线谱，五条线，从下往上数仔细；',
            '一二三四五条线，四个房间藏里面；',
            '音符高了上加线，音符低了下加线；',
            '线上一踩间一钻，美妙音乐响云端！'
          ]
        }
      ]
    }
  },
  {
    id: 'chapter_treble_clef',
    title: '第二课：高音谱号（G谱号）与超强口诀',
    subtitle: '第二线是Sol，FACE脸蛋记四间',
    badge: '右手核心',
    icon: '𝄞',
    content: {
      lead: '高音谱号（Treble Clef）通常用于记录较高音域的乐器与钢琴的右手弹奏区。因为它的圆肚皮中心刚好围绕着第二线（G音 / Sol），所以它又叫“G谱号”！',
      sections: [
        {
          heading: '1. 认识 G 谱号的标志中心',
          text: '看看高音谱号优雅的螺旋线，从第二线起笔转了一个圈。这个圆圈锁定的第二线就是小字一组的 G (Sol)。只要找到第二线，就能往上往下数出所有音符！',
          highlightPoints: ['螺旋圆心锁定第二线', '第二线固定读 G (Sol)']
        },
        {
          heading: '2. 神奇的「FACE 脸蛋口诀」（四间速记法）',
          text: '高音谱四个间住着的四个音符，从下往上一看：第1间是 F，第2间是 A，第3间是 C，第4间是 E！这四个英文字母拼起来正好就是英文单词【FACE (脸蛋)】！只要记住脸蛋，四个间永远不会错！',
          highlightPoints: ['第1间 = F (Fa)', '第2间 = A (La)', '第3间 = C (高音Do)', '第4间 = E (高音Mi)']
        },
        {
          heading: '3. 五条线的五音口诀（一线到五线）',
          text: '一至五线分别是 E - G - B - D - F！口诀：“一线小猫 Mi，二线太阳 Sol，三线蝴蝶 Si，四线小鹿 Re，五线小鸟 Fa！” 英文经典口诀：“Every Good Boy Does Fine”。',
          highlightPoints: ['1线: E4 (Mi)', '2线: G4 (Sol)', '3线: B4 (Si)', '4线: D5 (Re)', '5线: F5 (Fa)']
        }
      ],
      rhymes: [
        {
          title: '🎵 高音谱 FACE 脸蛋歌',
          lines: [
            '圆圆脸蛋真好看，FACE 刚好在四间；',
            '一间 F (发) 呀二间 A (拉)，三间 C (多) 呀四间 E (咪)；',
            '下加一线中央 C，二线抱住小 Sol 咪；',
            '右手识谱快如风，钢琴曲子弹不停！'
          ]
        }
      ]
    }
  },
  {
    id: 'chapter_bass_clef',
    title: '第三课：低音谱号（F谱号）与低音密码',
    subtitle: '两点夹四线，浑厚深沉左手音',
    badge: '左手核心',
    icon: '𝄢',
    content: {
      lead: '低音谱号（Bass Clef）用于记录钢琴左手常弹的低音伴奏和浑厚低音乐器。低音谱号的大圆点在第四线，后面有两个小点分别点在第三间和第四间，正好把第四线夹在正中间！',
      sections: [
        {
          heading: '1. F 谱号的两点夹线标志',
          text: '低音谱号又称 F 谱号。因为它后面的两颗小圆点上下夹着的第四线，就是小字组的 F (Fa) 音！第四线就是低音谱的指路灯塔。',
          highlightPoints: ['两点相夹的是第四线', '第四线固定读 F (Fa)']
        },
        {
          heading: '2. 低音谱四间口诀：A - C - E - G',
          text: '低音谱的四个间从下往上是 A - C - E - G！口诀：“All Cows Eat Grass（所有奶牛吃青草）” 或者中文：“一间拉，二间多，三间咪，四间梭！”',
          highlightPoints: ['第1间 = A2 (La)', '第2间 = C3 (低音Do)', '第3间 = E3 (Mi)', '第4间 = G3 (Sol)']
        },
        {
          heading: '3. 低音谱五条线：G - B - D - F - A',
          text: '从第一线到第五线是 G - B - D - F - A。第一线是 Sol，第二线是 Si，第三线是 Re，第四线是 Fa，第五线是 La。口诀：“Good Boys Do Fine Always”。',
          highlightPoints: ['1线: G2 (Sol)', '2线: B2 (Si)', '3线: D3 (Re)', '4线: F3 (Fa)', '5线: A3 (La)']
        }
      ],
      rhymes: [
        {
          title: '🎵 低音谱两点歌',
          lines: [
            '低音谱号像耳朵，两个小点上下落；',
            '两点夹住第四线，那就是个小 Fa 脸；',
            '上加一线接中央 C，左手伴奏真好听；',
            '高低两谱手拉手，双音琴声乐悠悠！'
          ]
        }
      ]
    }
  },
  {
    id: 'chapter_grand_staff',
    title: '第四课：中央 C 与大谱表（双手桥梁）',
    subtitle: '双手相约中央C，钢琴88键一目了然',
    badge: '双手合奏',
    icon: '🎹',
    content: {
      lead: '钢琴弹奏是双手协同的艺术。把高音谱表（右手）放在上方，低音谱表（左手）放在下方，左边用垂直线和花括号连在一起，就构成了【大谱表（Grand Staff）】！',
      sections: [
        {
          heading: '1. 中央 C 是最神奇的金钥匙',
          text: '在高音谱表里，中央 C 住在【下加一线】；而在低音谱表里，中央 C 住在【上加一线】！它们其实是完全同一颗音（MIDI 60 / C4），就在两排谱表中间的最中央！',
          highlightPoints: ['高音谱下加一线 ＝ 中央C', '低音谱上加一线 ＝ 中央C', '中央C连接了高低两个世界']
        },
        {
          heading: '2. 琴键与谱面的镜像关系',
          text: '钢琴琴键最中间有琴锁或品牌LOGO的位置，旁边两个黑键左侧的白键就是中央 C。右手负责从中央 C 往右弹（高音谱），左手负责从中央 C 往左弹（低音谱）！',
          highlightPoints: ['两个黑键左边就是 C (Do)', '三个黑键左边就是 F (Fa)', '从左到右音调越来越高']
        }
      ],
      rhymes: [
        {
          title: '🎵 中央 C 连心桥',
          lines: [
            '高音谱下加一线，低音谱上加一线；',
            '中央 C 像小纽扣，把左右手紧相连；',
            '右手向上唱百灵，左手向下似清泉；',
            '小手放在琴键上，快乐音符跳得甜！'
          ]
        }
      ]
    }
  }
];

