import type { StaffNoteItem } from './pianoStaffData';
import { TREBLE_STAFF_NOTES, BASS_STAFF_NOTES } from './pianoStaffData';

export type BookType = 'thompson1' | 'thompson2' | 'beyer';

export interface BookCurriculumDef {
  id: BookType;
  title: string;
  shortTitle: string;
  tag: string;
  badgeColor: string;
  icon: string;
  description: string;
  keyTarget: string;
  // Notes in this book's scope
  notes: StaffNoteItem[];
  // Practical tips for this book
  tips: { title: string; desc: string }[];
  // Classic melody pieces for sight-reading interactive play
  pieces: ClassicPiece[];
}

export interface ClassicPiece {
  id: string;
  title: string;
  book: BookType;
  subtitle: string;
  clef: 'treble' | 'bass' | 'both';
  difficulty: string;
  noteSequence: {
    pitch: string;
    syllable: string;
    duration: number; // beats: 1, 2, 4
    finger?: number;  // 1, 2, 3, 4, 5
    clef: 'treble' | 'bass';
  }[];
}

// 1. 小汤1音符库：中央C五指位置 (右手C4-G4，左手F3-C4)
const T1_TREBLE = TREBLE_STAFF_NOTES.filter(n => ['C4', 'D4', 'E4', 'F4', 'G4'].includes(n.pitch));
const T1_BASS = BASS_STAFF_NOTES.filter(n => ['F3', 'G3', 'A3', 'B3', 'C4'].includes(n.pitch));

// 2. 小汤2音符库：低音C手位(C3-G3) + 高音C手位(C5-G5) + 中央C
const T2_TREBLE = TREBLE_STAFF_NOTES.filter(n =>
  ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'].includes(n.pitch)
);
const T2_BASS = BASS_STAFF_NOTES.filter(n =>
  ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'].includes(n.pitch)
);

// 3. 拜厄基础音符库：大范围双手五指视奏与八度拓展
const BEYER_ALL = [
  ...BASS_STAFF_NOTES.filter(n => ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'].includes(n.pitch)),
  ...TREBLE_STAFF_NOTES.filter(n => ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'].includes(n.pitch))
];

export const PIANO_BOOKS_DATA: Record<BookType, BookCurriculumDef> = {
  thompson1: {
    id: 'thompson1',
    title: '《约翰·汤普森简易钢琴教程 1》',
    shortTitle: '小汤 1',
    tag: '中央C五指入门',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: '🐣',
    description: '从中央 C 起跑，双手五指固定在中央 C 附近。建立五线谱大谱表感、全音符/二分音符/四分音符节奏感。',
    keyTarget: '核心音域：右手 C4~G4（中央C~第二线），左手 F3~C4（第四线~上加一线）',
    notes: [...T1_TREBLE, ...T1_BASS],
    tips: [
      {
        title: '戒掉“看指法猜音”',
        desc: '小汤1很多孩子只看上面的 1、2、3 数字，手指机械下按，根本不看线与间！建议用本系统的“盲识模式”，遮盖指法数字练认谱。'
      },
      {
        title: '锁定两大灯塔音',
        desc: '高音谱锁定第二线 G (Sol)，低音谱锁定第四线 F (Fa)，中间锁定戴草帽的中央 C！其余音顺着线间上下爬一步就能找到。'
      },
      {
        title: '左右手大谱表不混淆',
        desc: '高音谱号在上面管右手，低音谱号在下面管左手；中央C是唯一的连心桥。'
      }
    ],
    pieces: [
      {
        id: 't1_piece_1',
        title: '《请弹吧》(右手五指)',
        book: 'thompson1',
        subtitle: '小汤1经典第4首 · 右手五音流利视奏',
        clef: 'treble',
        difficulty: '初学必弹',
        noteSequence: [
          { pitch: 'C4', syllable: 'Do', duration: 1, finger: 1, clef: 'treble' },
          { pitch: 'D4', syllable: 'Re', duration: 1, finger: 2, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 1, finger: 3, clef: 'treble' },
          { pitch: 'F4', syllable: 'Fa', duration: 1, finger: 4, clef: 'treble' },
          { pitch: 'G4', syllable: 'Sol', duration: 2, finger: 5, clef: 'treble' },
          { pitch: 'F4', syllable: 'Fa', duration: 1, finger: 4, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 1, finger: 3, clef: 'treble' },
          { pitch: 'D4', syllable: 'Re', duration: 1, finger: 2, clef: 'treble' },
          { pitch: 'C4', syllable: 'Do', duration: 2, finger: 1, clef: 'treble' }
        ]
      },
      {
        id: 't1_piece_2',
        title: '《小矮人进行曲》(左手五指)',
        book: 'thompson1',
        subtitle: '小汤1经典第8首 · 左手低音谱五指大本营',
        clef: 'bass',
        difficulty: '左手核心',
        noteSequence: [
          { pitch: 'C4', syllable: 'Do', duration: 1, finger: 1, clef: 'bass' },
          { pitch: 'B3', syllable: 'Si', duration: 1, finger: 2, clef: 'bass' },
          { pitch: 'A3', syllable: 'La', duration: 1, finger: 3, clef: 'bass' },
          { pitch: 'G3', syllable: 'Sol', duration: 1, finger: 4, clef: 'bass' },
          { pitch: 'F3', syllable: 'Fa', duration: 2, finger: 5, clef: 'bass' },
          { pitch: 'G3', syllable: 'Sol', duration: 1, finger: 4, clef: 'bass' },
          { pitch: 'A3', syllable: 'La', duration: 1, finger: 3, clef: 'bass' },
          { pitch: 'B3', syllable: 'Si', duration: 1, finger: 2, clef: 'bass' },
          { pitch: 'C4', syllable: 'Do', duration: 2, finger: 1, clef: 'bass' }
        ]
      },
      {
        id: 't1_piece_3',
        title: '《爷爷的大钟》(双手会师)',
        book: 'thompson1',
        subtitle: '小汤1经典第5首 · 双手中央C交替敲响',
        clef: 'both',
        difficulty: '双手交替',
        noteSequence: [
          { pitch: 'C4', syllable: 'Do', duration: 1, finger: 1, clef: 'treble' },
          { pitch: 'D4', syllable: 'Re', duration: 1, finger: 2, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 2, finger: 3, clef: 'treble' },
          { pitch: 'C4', syllable: 'Do', duration: 1, finger: 1, clef: 'bass' },
          { pitch: 'B3', syllable: 'Si', duration: 1, finger: 2, clef: 'bass' },
          { pitch: 'A3', syllable: 'La', duration: 2, finger: 3, clef: 'bass' },
          { pitch: 'C4', syllable: 'Do', duration: 2, finger: 1, clef: 'treble' }
        ]
      }
    ]
  },

  thompson2: {
    id: 'thompson2',
    title: '《约翰·汤普森简易钢琴教程 2》',
    shortTitle: '小汤 2',
    tag: '低音C位与八分音符',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: '🌱',
    description: '左手手位大迁移至低音 C (C3)，右手拓展至高音 C (C5)。攻坚八分音符、连线断奏与升降号启蒙。',
    keyTarget: '核心音域：左手向下拓展至 C3~G3（第二间~第四间），右手向上拓展至 C5~G5',
    notes: [...T2_TREBLE, ...T2_BASS],
    tips: [
      {
        title: '攻克左手移位恐慌',
        desc: '小汤2最大的难点是左手不再紧挨中央C，而是跳到了低音C（第二间）。记住：低音C在第二间，5指按C3，1指按G3！'
      },
      {
        title: '四间 FACE 依然是右手神技',
        desc: '高音C在第三间，正好是 FACE 里的 C！只要看到第三间，右手小手快速就位。'
      },
      {
        title: '八分音符一拍走两个',
        desc: '小尾巴牵手的八分音符，半拍一个，下踩和抬脚各打一下，视奏速度比小汤1翻倍。'
      }
    ],
    pieces: [
      {
        id: 't2_piece_1',
        title: '《盲人》(低音C五指位置)',
        book: 'thompson2',
        subtitle: '小汤2开篇第2首 · 左手移位至低音C (C3) 经典曲',
        clef: 'bass',
        difficulty: '低音移位',
        noteSequence: [
          { pitch: 'C3', syllable: 'Do', duration: 1, finger: 5, clef: 'bass' },
          { pitch: 'E3', syllable: 'Mi', duration: 1, finger: 3, clef: 'bass' },
          { pitch: 'G3', syllable: 'Sol', duration: 2, finger: 1, clef: 'bass' },
          { pitch: 'C3', syllable: 'Do', duration: 1, finger: 5, clef: 'bass' },
          { pitch: 'E3', syllable: 'Mi', duration: 1, finger: 3, clef: 'bass' },
          { pitch: 'G3', syllable: 'Sol', duration: 2, finger: 1, clef: 'bass' },
          { pitch: 'G3', syllable: 'Sol', duration: 1, finger: 1, clef: 'bass' },
          { pitch: 'F3', syllable: 'Fa', duration: 1, finger: 2, clef: 'bass' },
          { pitch: 'E3', syllable: 'Mi', duration: 1, finger: 3, clef: 'bass' },
          { pitch: 'D3', syllable: 'Re', duration: 1, finger: 4, clef: 'bass' },
          { pitch: 'C3', syllable: 'Do', duration: 2, finger: 5, clef: 'bass' }
        ]
      },
      {
        id: 't2_piece_2',
        title: '《布谷鸟》(高八度布谷叫声)',
        book: 'thompson2',
        subtitle: '小汤2经典第10首 · 高音C与低音伴奏对答',
        clef: 'treble',
        difficulty: '三度双跳',
        noteSequence: [
          { pitch: 'G4', syllable: 'Sol', duration: 1, finger: 5, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 2, finger: 3, clef: 'treble' },
          { pitch: 'G4', syllable: 'Sol', duration: 1, finger: 5, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 2, finger: 3, clef: 'treble' },
          { pitch: 'C5', syllable: 'Do', duration: 1, finger: 5, clef: 'treble' },
          { pitch: 'A4', syllable: 'La', duration: 1, finger: 3, clef: 'treble' },
          { pitch: 'G4', syllable: 'Sol', duration: 2, finger: 2, clef: 'treble' }
        ]
      }
    ]
  },

  beyer: {
    id: 'beyer',
    title: '《拜厄钢琴基础教程 (Op. 101)》',
    shortTitle: '拜厄',
    tag: '视奏极速提速与独立性',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    icon: '🦅',
    description: '儿童钢琴古典正规入门殿堂。攻坚双手独立触键、主题与变奏曲式、0.5 秒极速盲识反应。',
    keyTarget: '核心音域：覆盖 C3 ~ C6 全谱表快速音程变奏视奏',
    notes: BEYER_ALL,
    tips: [
      {
        title: '视奏目光超前看一小节',
        desc: '拜厄练习曲的音符规整连贯。弹第 1 小节时，眼睛就要扫向第 2 小节，提前预判线和间。'
      },
      {
        title: '音程距离感替代数线法',
        desc: '线到线是三度（跳着弹），线到相邻间是二度（挨着弹）。看音符不要每次从第一线重新数，看它们的跳动间隔！'
      },
      {
        title: '双手同度对照',
        desc: '拜厄 No.12~31 很多小节右手和左手是平行或对称进行的，抓住两只手的关联，识谱速度翻倍。'
      }
    ],
    pieces: [
      {
        id: 'beyer_piece_1',
        title: '《拜厄 No.8》(右手五指独立)',
        book: 'beyer',
        subtitle: '拜厄基础教程单手五指均匀经典条目',
        clef: 'treble',
        difficulty: '独立视奏',
        noteSequence: [
          { pitch: 'C4', syllable: 'Do', duration: 1, finger: 1, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 1, finger: 3, clef: 'treble' },
          { pitch: 'D4', syllable: 'Re', duration: 1, finger: 2, clef: 'treble' },
          { pitch: 'F4', syllable: 'Fa', duration: 1, finger: 4, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 1, finger: 3, clef: 'treble' },
          { pitch: 'G4', syllable: 'Sol', duration: 1, finger: 5, clef: 'treble' },
          { pitch: 'F4', syllable: 'Fa', duration: 1, finger: 4, clef: 'treble' },
          { pitch: 'D4', syllable: 'Re', duration: 1, finger: 2, clef: 'treble' },
          { pitch: 'C4', syllable: 'Do', duration: 2, finger: 1, clef: 'treble' }
        ]
      },
      {
        id: 'beyer_piece_2',
        title: '《拜厄 No.12》(双手主题变奏)',
        book: 'beyer',
        subtitle: '拜厄双手段落转折与视奏加速起点',
        clef: 'treble',
        difficulty: '双手变奏',
        noteSequence: [
          { pitch: 'G4', syllable: 'Sol', duration: 1, finger: 5, clef: 'treble' },
          { pitch: 'F4', syllable: 'Fa', duration: 1, finger: 4, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 1, finger: 3, clef: 'treble' },
          { pitch: 'D4', syllable: 'Re', duration: 1, finger: 2, clef: 'treble' },
          { pitch: 'C4', syllable: 'Do', duration: 2, finger: 1, clef: 'treble' },
          { pitch: 'E4', syllable: 'Mi', duration: 1, finger: 3, clef: 'treble' },
          { pitch: 'G4', syllable: 'Sol', duration: 2, finger: 5, clef: 'treble' }
        ]
      }
    ]
  }
};

