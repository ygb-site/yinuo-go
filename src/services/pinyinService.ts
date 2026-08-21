import { pinyin } from 'pinyin-pro';

export interface PinyinCharDetail {
  char: string;
  pinyin: string;
  initial: string;
  final: string;
  tone: number;
  isPolyphone?: boolean;
  polyphones?: string[];
}

/**
 * 小学语文教材高频多音字精准纠错词表 (Primary School Polyphone Correction Map)
 */
const PRIMARY_POLYPHONE_MAP: Record<string, { defaultPinyin: string; polyphones: string[] }> = {
  '行': { defaultPinyin: 'xíng', polyphones: ['xíng', 'háng'] },
  '乐': { defaultPinyin: 'lè', polyphones: ['lè', 'yuè'] },
  '长': { defaultPinyin: 'cháng', polyphones: ['cháng', 'zhǎng'] },
  '得': { defaultPinyin: 'dé', polyphones: ['dé', 'de', 'děi'] },
  '着': { defaultPinyin: 'zhe', polyphones: ['zhe', 'zháo', 'zhuó', 'zhāo'] },
  '地': { defaultPinyin: 'dì', polyphones: ['dì', 'de'] },
  '重': { defaultPinyin: 'zhòng', polyphones: ['zhòng', 'chóng'] },
  '教': { defaultPinyin: 'jiāo', polyphones: ['jiāo', 'jiào'] },
  '数': { defaultPinyin: 'shù', polyphones: ['shù', 'shǔ'] },
  '少': { defaultPinyin: 'shǎo', polyphones: ['shǎo', 'shào'] },
  '好': { defaultPinyin: 'hǎo', polyphones: ['hǎo', 'hào'] },
  '发': { defaultPinyin: 'fā', polyphones: ['fā', 'fà'] },
  '间': { defaultPinyin: 'jiān', polyphones: ['jiān', 'jiàn'] },
  '种': { defaultPinyin: 'zhòng', polyphones: ['zhòng', 'zhǒng'] },
  '为': { defaultPinyin: 'wèi', polyphones: ['wèi', 'wéi'] }
};

export class PinyinService {
  /**
   * 获取任意文本的标准带声调拼音 (e.g. "天地人" -> "tiān dì rén")
   */
  public static getPinyin(text: string, separator = ' '): string {
    if (!text) return '';
    return pinyin(text, { toneType: 'symbol', type: 'string', separator });
  }

  /**
   * 获取无声调拼音 (e.g. "tiān" -> "tian")
   */
  public static getPinyinNone(text: string, separator = ' '): string {
    if (!text) return '';
    return pinyin(text, { toneType: 'none', type: 'string', separator });
  }

  /**
   * 获取声调数字拼音 (e.g. "tiān" -> "tian1")
   */
  public static getPinyinNum(text: string, separator = ' '): string {
    if (!text) return '';
    return pinyin(text, { toneType: 'num', type: 'string', separator });
  }

  /**
   * 获取首字母拼音 (e.g. "天地人" -> "t d r")
   */
  public static getFirstLetters(text: string): string {
    if (!text) return '';
    return pinyin(text, { pattern: 'first', type: 'string', separator: '' });
  }

  /**
   * 获取单个汉字详细拼音音节解析 (声母、韵母、声调、多音字)
   */
  public static getCharPinyinDetail(char: string): PinyinCharDetail {
    if (!char) {
      return { char: '', pinyin: '', initial: '', final: '', tone: 0 };
    }

    const py = pinyin(char, { toneType: 'symbol', type: 'string' });
    const initial = pinyin(char, { pattern: 'initial', type: 'string' });
    const final = pinyin(char, { pattern: 'final', toneType: 'symbol', type: 'string' });
    const numPy = pinyin(char, { toneType: 'num', type: 'string' });
    const toneMatch = numPy.match(/\d/);
    const tone = toneMatch ? parseInt(toneMatch[0], 10) : 0;

    const polyInfo = PRIMARY_POLYPHONE_MAP[char];

    return {
      char,
      pinyin: py || (polyInfo ? polyInfo.defaultPinyin : ''),
      initial: initial || '零声母',
      final: final || py,
      tone,
      isPolyphone: Boolean(polyInfo),
      polyphones: polyInfo ? polyInfo.polyphones : undefined
    };
  }

  /**
   * 批量拆解字符串中每一个汉字及其对应拼音
   */
  public static parseSentence(text: string): { char: string; pinyin: string }[] {
    if (!text) return [];
    const pinyinArr = pinyin(text, { toneType: 'symbol', type: 'array' });
    const chars = Array.from(text);
    return chars.map((char, index) => ({
      char,
      pinyin: pinyinArr[index] || ''
    }));
  }
}

