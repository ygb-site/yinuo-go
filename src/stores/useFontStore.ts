import { defineStore } from 'pinia';
import { ref } from 'vue';

export type FontTheme =
  | 'rounded'
  | 'wenkai'
  | 'kuaile'
  | 'huangyou'
  | 'smiley'
  | 'mashanzheng'
  | 'songti'
  | 'notosans'
  | 'modern'
  | 'handwriting'
  | 'longcang'
  | 'liujian';

export type FontSizeScale = 'compact' | 'normal' | 'large' | 'xl';
export type LetterSpacing = 'normal' | 'wide' | 'wider';
export type FontCategory = 'all' | 'kids' | 'calligraphy' | 'reading';

export interface FontOption {
  id: FontTheme;
  name: string;
  category: 'kids' | 'calligraphy' | 'reading';
  badge: string;
  desc: string;
  sample: string;
  fontFamily: string;
}

export const FONT_OPTIONS: FontOption[] = [
  // 1. 少儿萌趣
  {
    id: 'rounded',
    name: '少儿温润圆体 (推荐)',
    category: 'kids',
    badge: '护眼不挤',
    desc: '中宫开阔、柔和圆角，字面大而饱满，阅读和做题极佳。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Nunito", "Quicksand", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "YouYuan", sans-serif'
  },
  {
    id: 'kuaile',
    name: '站酷快乐体',
    category: 'kids',
    badge: '经典动漫',
    desc: '活泼夸张的动漫标题字，笔画粗壮有力，童趣十足。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"ZCOOL KuaiLe", "Fredoka", "Chalkboard SE", "Comic Sans MS", "PingFang SC", sans-serif'
  },
  {
    id: 'huangyou',
    name: '站酷黄油体',
    category: 'kids',
    badge: '几何厚实',
    desc: '方正厚实带有圆角切角，字形规整醒目，力量感满满。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"ZCOOL QingKe HuangYou", "Fredoka", "PingFang SC", sans-serif'
  },
  {
    id: 'smiley',
    name: '得意黑 (Smiley Sans)',
    category: 'kids',
    badge: '现代萌趣',
    desc: '微斜宽体字，极具设计感与张力，时尚且生动。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Smiley Sans", "SmileySans-Oblique", "Fredoka", "PingFang SC", sans-serif'
  },

  // 2. 国学与书法书卷
  {
    id: 'wenkai',
    name: '霞鹜文楷 (绘本风)',
    category: 'calligraphy',
    badge: '国学清秀',
    desc: '如硬笔书法般清秀优雅，字形舒展，书卷气浓厚。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"LXGW WenKai Screen", "LXGW WenKai", "Kaiti", "STKaiti", "PingFang SC", serif'
  },
  {
    id: 'mashanzheng',
    name: '马善政毛笔楷书',
    category: 'calligraphy',
    badge: '水墨国风',
    desc: '笔锋苍劲有力，传统中国书法水墨韵味浓厚。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Ma Shan Zheng", "Kaiti", "STKaiti", serif'
  },
  {
    id: 'songti',
    name: '思源典雅宋体',
    category: 'calligraphy',
    badge: '古风刻本',
    desc: '横细竖粗、雕版刻本质感，典雅肃穆，书香气息浓。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif'
  },
  {
    id: 'longcang',
    name: '龙藏行草书法',
    category: 'calligraphy',
    badge: '潇洒飘逸',
    desc: '连笔行草、随性灵动，如云流水般自由洒脱。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Long Cang", "Kaiti", cursive, serif'
  },

  // 3. 现代规范与阅读
  {
    id: 'notosans',
    name: '思源黑体 (大字版)',
    category: 'reading',
    badge: '规范护眼',
    desc: 'Google & Adobe 联合打造，字面大、间距规范，全年龄适读。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
  },
  {
    id: 'modern',
    name: '现代极简苹方',
    category: 'reading',
    badge: '苹果原厂',
    desc: '苹果系统标准苹方黑体，线条极致纯净，高辨识度。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  },
  {
    id: 'handwriting',
    name: '黑板粉笔手写体',
    category: 'reading',
    badge: '课堂板书',
    desc: '带有少儿板书的亲切随性手写风格。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Chalkboard SE", "Comic Sans MS", "Fredoka", "PingFang SC", cursive, sans-serif'
  },
  {
    id: 'liujian',
    name: '刘建草楷水墨',
    category: 'calligraphy',
    badge: '写意丹青',
    desc: '写意笔触，挥毫泼墨，充满传统水墨画意境。',
    sample: '早上好，小彩虹！每下一颗棋子都在变聪明。',
    fontFamily: '"Liu Jian Mao Cao", "Ma Shan Zheng", "Kaiti", cursive, serif'
  }
];

export const useFontStore = defineStore('fontStudio', () => {
  const currentFont = ref<FontTheme>(
    (localStorage.getItem('yinuo_font_theme') as FontTheme) || 'rounded'
  );
  const fontSizeScale = ref<FontSizeScale>(
    (localStorage.getItem('yinuo_font_scale') as FontSizeScale) || 'normal'
  );
  const letterSpacing = ref<LetterSpacing>(
    (localStorage.getItem('yinuo_letter_spacing') as LetterSpacing) || 'wide'
  );
  const isModalOpen = ref(false);

  const applyFontSettings = () => {
    const selected = FONT_OPTIONS.find((f) => f.id === currentFont.value) || FONT_OPTIONS[0];
    const root = document.documentElement;

    // Apply font-family
    root.style.setProperty('--font-global', selected.fontFamily);
    root.style.setProperty('--font-display', selected.fontFamily);
    root.style.setProperty('--font-sans', selected.fontFamily);

    // Apply scale multiplier
    let scaleRem = '16px';
    if (fontSizeScale.value === 'compact') scaleRem = '15px';
    if (fontSizeScale.value === 'normal') scaleRem = '16px';
    if (fontSizeScale.value === 'large') scaleRem = '17.5px';
    if (fontSizeScale.value === 'xl') scaleRem = '19px';
    root.style.setProperty('--font-base-size', scaleRem);

    // Apply letter spacing
    let spacingVal = '0.01em';
    if (letterSpacing.value === 'normal') spacingVal = '0';
    if (letterSpacing.value === 'wide') spacingVal = '0.025em';
    if (letterSpacing.value === 'wider') spacingVal = '0.05em';
    root.style.setProperty('--font-global-spacing', spacingVal);

    // Save to storage
    localStorage.setItem('yinuo_font_theme', currentFont.value);
    localStorage.setItem('yinuo_font_scale', fontSizeScale.value);
    localStorage.setItem('yinuo_letter_spacing', letterSpacing.value);
  };

  const setFontTheme = (theme: FontTheme) => {
    currentFont.value = theme;
    applyFontSettings();
  };

  const setFontSizeScale = (scale: FontSizeScale) => {
    fontSizeScale.value = scale;
    applyFontSettings();
  };

  const setLetterSpacing = (spacing: LetterSpacing) => {
    letterSpacing.value = spacing;
    applyFontSettings();
  };

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  // Initialize immediately on load
  applyFontSettings();

  return {
    currentFont,
    fontSizeScale,
    letterSpacing,
    isModalOpen,
    fontOptions: FONT_OPTIONS,
    setFontTheme,
    setFontSizeScale,
    setLetterSpacing,
    openModal,
    closeModal,
    applyFontSettings
  };
});

