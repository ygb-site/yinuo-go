/**
 * 汉语拼音标准发音与教学拼读词典 (Primary Pinyin Standard Pronunciation & Blending Library)
 * 严格遵循部编版小学一年级语文拼音标准，将声母（呼读音）、韵母（带调发音）、拼读音节
 * 转化为纯正标准汉语发音（如声母 b 对应'玻 bō'、拼读 b+à 对应'玻-啊-爸'），
 * 彻底杜绝 Web Speech / TTS 将单个拼音字母误读为英文字母的问题。
 */

export interface PinyinInitialItem {
  pinyin: string;
  name: string;
  sound: string;
  spokenName: string;
  pinyinWithTone: string;
  rhyme: string;
  rhymeSpoken: string;
  sampleChar: string;
  sampleWord: string;
  icon: string;
}

export interface PinyinFinalItem {
  pinyin: string;
  name: string;
  sound: string;
  spokenName: string;
  rhyme: string;
  rhymeSpoken: string;
  sampleChar: string;
  sampleWord: string;
  icon: string;
}

export interface PinyinZhengtiItem {
  pinyin: string;
  name: string;
  sound: string;
  spokenName: string;
  rhyme: string;
  rhymeSpoken: string;
  sampleChar: string;
  sampleWord: string;
  icon: string;
}

// 23 个声母全套数据
export const PINYIN_INITIALS_DATA: PinyinInitialItem[] = [
  { pinyin: 'b', name: '声母 b', sound: '玻', spokenName: '声母 玻', pinyinWithTone: 'bō', rhyme: '收听广播 b b b，右下半圆 b b b', rhymeSpoken: '收听广播 玻 玻 玻，右下半圆 玻 玻 玻', sampleChar: '八', sampleWord: '八个', icon: '📻' },
  { pinyin: 'p', name: '声母 p', sound: '坡', spokenName: '声母 坡', pinyinWithTone: 'pō', rhyme: '泼水泼水 p p p，右上半圆 p p p', rhymeSpoken: '泼水泼水 坡 坡 坡，右上半圆 坡 坡 坡', sampleChar: '爬', sampleWord: '爬山', icon: '🧗' },
  { pinyin: 'm', name: '声母 m', sound: '摸', spokenName: '声母 摸', pinyinWithTone: 'mō', rhyme: '两个门洞 m m m，摸人捉迷藏 m m m', rhymeSpoken: '两个门洞 摸 摸 摸，摸人捉迷藏 摸 摸 摸', sampleChar: '妈', sampleWord: '妈妈', icon: '👩' },
  { pinyin: 'f', name: '声母 f', sound: '佛', spokenName: '声母 佛', pinyinWithTone: 'fó', rhyme: '一根拐杖 f f f，手扶拐杖 f f f', rhymeSpoken: '一根拐杖 佛 佛 佛，手扶拐杖 佛 佛 佛', sampleChar: '风', sampleWord: '大风', icon: '💨' },
  { pinyin: 'd', name: '声母 d', sound: '得', spokenName: '声母 得', pinyinWithTone: 'dé', rhyme: '左下半圆 d d d，得得马蹄 d d d', rhymeSpoken: '左下半圆 得 得 得，得得马蹄 得 得 得', sampleChar: '大', sampleWord: '大山', icon: '⛰️' },
  { pinyin: 't', name: '声母 t', sound: '特', spokenName: '声母 特', pinyinWithTone: 'tè', rhyme: '伞柄朝下 t t t，特别特别 t t t', rhymeSpoken: '伞柄朝下 特 特 特，特别特别 特 特 特', sampleChar: '天', sampleWord: '蓝天', icon: '☀️' },
  { pinyin: 'n', name: '声母 n', sound: '讷', spokenName: '声母 讷', pinyinWithTone: 'nè', rhyme: '一个门洞 n n n，小哪吒 n n n', rhymeSpoken: '一个门洞 讷 讷 讷，小哪吒 讷 讷 讷', sampleChar: '你', sampleWord: '你好', icon: '👋' },
  { pinyin: 'l', name: '声母 l', sound: '勒', spokenName: '声母 勒', pinyinWithTone: 'lè', rhyme: '一根小棒 l l l，快乐快乐 l l l', rhymeSpoken: '一根小棒 勒 勒 勒，快乐快乐 勒 勒 勒', sampleChar: '乐', sampleWord: '快乐', icon: '😄' },
  { pinyin: 'g', name: '声母 g', sound: '哥', spokenName: '声母 哥', pinyinWithTone: 'gē', rhyme: '一只白鸽 g g g，鸽子鸽子 g g g', rhymeSpoken: '一只白鸽 哥 哥 哥，鸽子鸽子 哥 哥 哥', sampleChar: '歌', sampleWord: '唱歌', icon: '🕊️' },
  { pinyin: 'k', name: '声母 k', sound: '科', spokenName: '声母 科', pinyinWithTone: 'kē', rhyme: '蝌蚪蝌蚪 k k k，水里游 k k k', rhymeSpoken: '蝌蚪蝌蚪 科 科 科，水里游 科 科 科', sampleChar: '开', sampleWord: '开花', icon: '🌸' },
  { pinyin: 'h', name: '声母 h', sound: '喝', spokenName: '声母 喝', pinyinWithTone: 'hē', rhyme: '一把椅子 h h h，坐下喝水 h h h', rhymeSpoken: '一把椅子 喝 喝 喝，坐下喝水 喝 喝 喝', sampleChar: '河', sampleWord: '小河', icon: '🌊' },
  { pinyin: 'j', name: '声母 j', sound: '鸡', spokenName: '声母 鸡', pinyinWithTone: 'jī', rhyme: '母鸡母鸡 j j j，蝴蝶飞来 j j j', rhymeSpoken: '母鸡母鸡 鸡 鸡 鸡，蝴蝶飞来 鸡 鸡 鸡', sampleChar: '鸡', sampleWord: '小鸡', icon: '🐥' },
  { pinyin: 'q', name: '声母 q', sound: '七', spokenName: '声母 七', pinyinWithTone: 'qī', rhyme: '七个气球 q q q，气球升天 q q q', rhymeSpoken: '七个气球 七 七 七，气球升天 七 七 七', sampleChar: '七', sampleWord: '七个', icon: '🎈' },
  { pinyin: 'x', name: '声母 x', sound: '西', spokenName: '声母 西', pinyinWithTone: 'xī', rhyme: '刀切西瓜 x x x，大红西瓜 x x x', rhymeSpoken: '刀切西瓜 西 西 西，大红西瓜 西 西 西', sampleChar: '西', sampleWord: '西瓜', icon: '🍉' },
  { pinyin: 'zh', name: '翘舌声母 zh', sound: '知', spokenName: '翘舌声母 知', pinyinWithTone: 'zhī', rhyme: '蜘蛛织网 zh zh zh，织毛衣 zh zh zh', rhymeSpoken: '蜘蛛织网 知 知 知，织毛衣 知 知 知', sampleChar: '中', sampleWord: '中国', icon: '🇨🇳' },
  { pinyin: 'ch', name: '翘舌声母 ch', sound: '吃', spokenName: '翘舌声母 吃', pinyinWithTone: 'chī', rhyme: '小皮尺 ch ch ch，大皮尺 ch ch ch', rhymeSpoken: '小皮尺 吃 吃 吃，大皮尺 吃 吃 吃', sampleChar: '春', sampleWord: '春天', icon: '🌱' },
  { pinyin: 'sh', name: '翘舌声母 sh', sound: '诗', spokenName: '翘舌声母 诗', pinyinWithTone: 'shī', rhyme: '狮子狮子 sh sh sh，威风凛凛 sh sh sh', rhymeSpoken: '狮子狮子 诗 诗 诗，威风凛凛 诗 诗 诗', sampleChar: '手', sampleWord: '小手', icon: '🦁' },
  { pinyin: 'r', name: '翘舌声母 r', sound: '日', spokenName: '翘舌声母 日', pinyinWithTone: 'rì', rhyme: '一轮红日 r r r，日光普照 r r r', rhymeSpoken: '一轮红日 日 日 日，日光普照 日 日 日', sampleChar: '日', sampleWord: '红日', icon: '🌅' },
  { pinyin: 'z', name: '平舌声母 z', sound: '资', spokenName: '平舌声母 资', pinyinWithTone: 'zī', rhyme: '写字写字 z z z，认真写字 z z z', rhymeSpoken: '写字写字 资 资 资，认真写字 资 资 资', sampleChar: '早', sampleWord: '早上', icon: '✍️' },
  { pinyin: 'c', name: '平舌声母 c', sound: '疵', spokenName: '平舌声母 疵', pinyinWithTone: 'cī', rhyme: '小刺猬 c c c，满身长刺 c c c', rhymeSpoken: '小刺猬 疵 疵 疵，满身长刺 疵 疵 疵', sampleChar: '草', sampleWord: '小草', icon: '🦔' },
  { pinyin: 's', name: '平舌声母 s', sound: '思', spokenName: '平舌声母 思', pinyinWithTone: 'sī', rhyme: '蚕儿吐丝 s s s，半个圆圈 s s s', rhymeSpoken: '蚕儿吐丝 思 思 思，半个圆圈 思 思 思', sampleChar: '四', sampleWord: '四个', icon: '🐛' },
  { pinyin: 'y', name: '声母 y', sound: '衣', spokenName: '声母 衣', pinyinWithTone: 'yī', rhyme: '树杈树杈 y y y，大树杈 y y y', rhymeSpoken: '树杈树杈 衣 衣 衣，大树杈 衣 衣 衣', sampleChar: '月', sampleWord: '月亮', icon: '🌙' },
  { pinyin: 'w', name: '声母 w', sound: '乌', spokenName: '声母 乌', pinyinWithTone: 'wū', rhyme: '小屋屋顶 w w w，漂亮小屋 w w w', rhymeSpoken: '小屋屋顶 乌 乌 乌，漂亮小屋 乌 乌 乌', sampleChar: '我', sampleWord: '我们', icon: '🏠' }
];

// 6 单韵母
export const PINYIN_DAN_YUNMU: PinyinFinalItem[] = [
  { pinyin: 'a', name: '单韵母 a', sound: '啊', spokenName: '单韵母 啊', rhyme: '圆圆脸蛋扎小辫，张大嘴巴 a a a', rhymeSpoken: '圆圆脸蛋扎小辫，张大嘴巴 啊 啊 啊', sampleChar: '阿', sampleWord: '阿姨', icon: '👧' },
  { pinyin: 'o', name: '单韵母 o', sound: '窝', spokenName: '单韵母 窝', rhyme: '太阳出来红通通，公鸡打鸣 o o o', rhymeSpoken: '太阳出来红通通，公鸡打鸣 窝 窝 窝', sampleChar: '窝', sampleWord: '鸟窝', icon: '🐓' },
  { pinyin: 'e', name: '单韵母 e', sound: '鹅', spokenName: '单韵母 鹅', rhyme: '清清池塘一只鹅，水中倒影 e e e', rhymeSpoken: '清清池塘一只鹅，水中倒影 鹅 鹅 鹅', sampleChar: '鹅', sampleWord: '白鹅', icon: '🦢' },
  { pinyin: 'i', name: '单韵母 i', sound: '衣', spokenName: '单韵母 衣', rhyme: '衣服衣服穿身上，一颗小扣 i i i', rhymeSpoken: '衣服衣服穿身上，一颗小扣 衣 衣 衣', sampleChar: '衣', sampleWord: '衣服', icon: '👕' },
  { pinyin: 'u', name: '单韵母 u', sound: '乌', spokenName: '单韵母 乌', rhyme: '乌龟乌龟慢吞吞，嘴巴突出 u u u', rhymeSpoken: '乌龟乌龟慢吞吞，嘴巴突出 乌 乌 乌', sampleChar: '乌', sampleWord: '乌龟', icon: '🐢' },
  { pinyin: 'ü', name: '单韵母 ü', sound: '迂', spokenName: '单韵母 迂', rhyme: '小鱼吐泡跃龙门，吹起口哨 ü ü ü', rhymeSpoken: '小鱼吐泡跃龙门，吹起口哨 迂 迂 迂', sampleChar: '鱼', sampleWord: '小鱼', icon: '🐟' }
];

// 18 复韵母与鼻韵母
export const PINYIN_FU_YUNMU: PinyinFinalItem[] = [
  { pinyin: 'ai', name: '复韵母 ai', sound: '挨', spokenName: '复韵母 挨', rhyme: '挨在一起 ai ai ai，紧挨着 ai ai ai', rhymeSpoken: '挨在一起 挨 挨 挨，紧挨着 挨 挨 挨', sampleChar: '爱', sampleWord: '爱心', icon: '❤️' },
  { pinyin: 'ei', name: '复韵母 ei', sound: '诶', spokenName: '复韵母 诶', rhyme: '小鹿拔草 ei ei ei，加油使劲 ei ei ei', rhymeSpoken: '小鹿拔草 诶 诶 诶，加油使劲 诶 诶 诶', sampleChar: '北', sampleWord: '北方', icon: '🧭' },
  { pinyin: 'ui', name: '复韵母 ui', sound: '微', spokenName: '复韵母 微', rhyme: '围巾围巾 ui ui ui，漂亮围巾 ui ui ui', rhymeSpoken: '围巾围巾 微 微 微，漂亮围巾 微 微 微', sampleChar: '水', sampleWord: '河水', icon: '🧣' },
  { pinyin: 'ao', name: '复韵母 ao', sound: '袄', spokenName: '复韵母 袄', rhyme: '一件棉袄 ao ao ao，暖和棉袄 ao ao ao', rhymeSpoken: '一件棉袄 袄 袄 袄，暖和棉袄 袄 袄 袄', sampleChar: '高', sampleWord: '高山', icon: '🧥' },
  { pinyin: 'ou', name: '复韵母 ou', sound: '欧', spokenName: '复韵母 欧', rhyme: '海鸥海鸥 ou ou ou，飞越大海 ou ou ou', rhymeSpoken: '海鸥海鸥 欧 欧 欧，飞越大海 欧 欧 欧', sampleChar: '狗', sampleWord: '小狗', icon: '🐶' },
  { pinyin: 'iu', name: '复韵母 iu', sound: '优', spokenName: '复韵母 优', rhyme: '邮票邮票 iu iu iu，游泳健将 iu iu iu', rhymeSpoken: '邮票邮票 优 优 优，游泳健将 优 优 优', sampleChar: '九', sampleWord: '九个', icon: '🏊' },
  { pinyin: 'ie', name: '复韵母 ie', sound: '椰', spokenName: '复韵母 椰', rhyme: '一片椰树 ie ie ie，椰子甜甜 ie ie ie', rhymeSpoken: '一片椰树 椰 椰 椰，椰子甜甜 椰 椰 椰', sampleChar: '叶', sampleWord: '树叶', icon: '🌴' },
  { pinyin: 'üe', name: '复韵母 üe', sound: '约', spokenName: '复韵母 约', rhyme: '一轮明月 üe üe üe，月光如水 üe üe üe', rhymeSpoken: '一轮明月 约 约 约，月光如水 约 约 约', sampleChar: '月', sampleWord: '月光', icon: '🌕' },
  { pinyin: 'er', name: '特殊韵母 er', sound: '耳', spokenName: '特殊韵母 耳', rhyme: '一只耳朵 er er er，耳听八方 er er er', rhymeSpoken: '一只耳朵 耳 耳 耳，耳听八方 耳 耳 耳', sampleChar: '耳', sampleWord: '耳朵', icon: '👂' },
  { pinyin: 'an', name: '前鼻韵母 an', sound: '安', spokenName: '前鼻韵母 安', rhyme: '天安门前 an an an', rhymeSpoken: '天安门前 安 安 安', sampleChar: '安', sampleWord: '安全', icon: '🏛️' },
  { pinyin: 'en', name: '前鼻韵母 en', sound: '恩', spokenName: '前鼻韵母 恩', rhyme: '按动门铃 en en en', rhymeSpoken: '按动门铃 恩 恩 恩', sampleChar: '人', sampleWord: '大人', icon: '🔔' },
  { pinyin: 'in', name: '前鼻韵母 in', sound: '因', spokenName: '前鼻韵母 因', rhyme: '绿树成荫 in in in', rhymeSpoken: '绿树成荫 因 因 因', sampleChar: '金', sampleWord: '金子', icon: '🌲' },
  { pinyin: 'un', name: '前鼻韵母 un', sound: '温', spokenName: '前鼻韵母 温', rhyme: '白云滚滚 un un un', rhymeSpoken: '白云滚滚 温 温 温', sampleChar: '春', sampleWord: '春天', icon: '☁️' },
  { pinyin: 'ün', name: '前鼻韵母 ün', sound: '晕', spokenName: '前鼻韵母 晕', rhyme: '白云飘飘 ün ün ün', rhymeSpoken: '白云飘飘 晕 晕 晕', sampleChar: '云', sampleWord: '白云', icon: '⛅' },
  { pinyin: 'ang', name: '后鼻韵母 ang', sound: '昂', spokenName: '后鼻韵母 昂', rhyme: '昂首挺胸 ang ang ang', rhymeSpoken: '昂首挺胸 昂 昂 昂', sampleChar: '羊', sampleWord: '小羊', icon: '🐑' },
  { pinyin: 'eng', name: '后鼻韵母 eng', sound: '鞥', spokenName: '后鼻韵母 鞥', rhyme: '一盏台灯 eng eng eng', rhymeSpoken: '一盏台灯 鞥 鞥 鞥', sampleChar: '风', sampleWord: '大风', icon: '💡' },
  { pinyin: 'ing', name: '后鼻韵母 ing', sound: '鹰', spokenName: '后鼻韵母 鹰', rhyme: '雄鹰翱翔 ing ing ing', rhymeSpoken: '雄鹰翱翔 鹰 鹰 鹰', sampleChar: '星', sampleWord: '星星', icon: '🦅' },
  { pinyin: 'ong', name: '后鼻韵母 ong', sound: '轰', spokenName: '后鼻韵母 轰', rhyme: '敲响大钟 ong ong ong', rhymeSpoken: '敲响大钟 轰 轰 轰', sampleChar: '中', sampleWord: '中国', icon: '🔔' }
];

// 16 整体认读音节
export const PINYIN_ZHENGTI_DATA: PinyinZhengtiItem[] = [
  { pinyin: 'zhi', name: '整体认读 zhi', sound: '织', spokenName: '整体认读 织', rhyme: '织毛衣 zhi，不用拼，直接读', rhymeSpoken: '织毛衣 织，不用拼，直接读', sampleChar: '只', sampleWord: '一只鸟', icon: '🧶' },
  { pinyin: 'chi', name: '整体认读 chi', sound: '吃', spokenName: '整体认读 吃', rhyme: '吃西瓜 chi，不用拼，直接读', rhymeSpoken: '吃西瓜 吃，不用拼，直接读', sampleChar: '吃', sampleWord: '吃饭', icon: '🍉' },
  { pinyin: 'shi', name: '整体认读 shi', sound: '狮', spokenName: '整体认读 狮', rhyme: '小狮子 shi，不用拼，直接读', rhymeSpoken: '小狮子 狮，不用拼，直接读', sampleChar: '十', sampleWord: '十个', icon: '🦁' },
  { pinyin: 'ri', name: '整体认读 ri', sound: '日', spokenName: '整体认读 日', rhyme: '红日升 ri，不用拼，直接读', rhymeSpoken: '红日升 日，不用拼，直接读', sampleChar: '日', sampleWord: '今日', icon: '☀️' },
  { pinyin: 'zi', name: '整体认读 zi', sound: '字', spokenName: '整体认读 字', rhyme: '写大字 zi，不用拼，直接读', rhymeSpoken: '写大字 字，不用拼，直接读', sampleChar: '子', sampleWord: '儿子', icon: '✍️' },
  { pinyin: 'ci', name: '整体认读 ci', sound: '刺', spokenName: '整体认读 刺', rhyme: '小刺猬 ci，不用拼，直接读', rhymeSpoken: '小刺猬 刺，不用拼，直接读', sampleChar: '次', sampleWord: '一次', icon: '🦔' },
  { pinyin: 'si', name: '整体认读 si', sound: '丝', spokenName: '整体认读 丝', rhyme: '吐细丝 si，不用拼，直接读', rhymeSpoken: '吐细丝 丝，不用拼，直接读', sampleChar: '四', sampleWord: '四季', icon: '🧵' },
  { pinyin: 'yi', name: '整体认读 yi', sound: '衣', spokenName: '整体认读 衣', rhyme: '一件衣服 yi，大y带小i', rhymeSpoken: '一件衣服 衣，大y带小i', sampleChar: '一', sampleWord: '第一', icon: '👕' },
  { pinyin: 'wu', name: '整体认读 wu', sound: '屋', spokenName: '整体认读 屋', rhyme: '漂亮小屋 wu，大w带小u', rhymeSpoken: '漂亮小屋 屋，大w带小u', sampleChar: '五', sampleWord: '五个', icon: '🏠' },
  { pinyin: 'yu', name: '整体认读 yu', sound: '鱼', spokenName: '整体认读 鱼', rhyme: '金鱼吐泡 yu，大y带小ü脱帽', rhymeSpoken: '金鱼吐泡 鱼，大y带小ü脱帽', sampleChar: '鱼', sampleWord: '小鱼', icon: '🐟' },
  { pinyin: 'ye', name: '整体认读 ye', sound: '椰', spokenName: '整体认读 椰', rhyme: '椰子椰树 ye，大y带ie', rhymeSpoken: '椰子椰树 椰，大y带ie', sampleChar: '也', sampleWord: '也是', icon: '🌴' },
  { pinyin: 'yue', name: '整体认读 yue', sound: '月', spokenName: '整体认读 月', rhyme: '明月高悬 yue，大y带üe', rhymeSpoken: '明月高悬 月，大y带üe', sampleChar: '月', sampleWord: '月亮', icon: '🌙' },
  { pinyin: 'yuan', name: '整体认读 yuan', sound: '圆', spokenName: '整体认读 圆', rhyme: '公园游玩 yuan，大y带üan', rhymeSpoken: '公园游玩 圆，大y带üan', sampleChar: '元', sampleWord: '一元钱', icon: '⛲' },
  { pinyin: 'yin', name: '整体认读 yin', sound: '音', spokenName: '整体认读 音', rhyme: '音乐美妙 yin，大y带in', rhymeSpoken: '音乐美妙 音，大y带in', sampleChar: '音', sampleWord: '音乐', icon: '🎵' },
  { pinyin: 'yun', name: '整体认读 yun', sound: '云', spokenName: '整体认读 云', rhyme: '白云飘荡 yun，大y带ün', rhymeSpoken: '白云飘荡 云，大y带ün', sampleChar: '云', sampleWord: '云彩', icon: '⛅' },
  { pinyin: 'ying', name: '整体认读 ying', sound: '鹰', spokenName: '整体认读 鹰', rhyme: '老鹰飞翔 ying，大y带ing', rhymeSpoken: '老鹰飞翔 鹰，大y带ing', sampleChar: '鹰', sampleWord: '雄鹰', icon: '🦅' }
];

// 四声调汉字发音对照
export const PINYIN_TONES_MAP: Record<string, { t1: { sym: string; char: string }; t2: { sym: string; char: string }; t3: { sym: string; char: string }; t4: { sym: string; char: string } }> = {
  a: {
    t1: { sym: 'ā', char: '啊' },
    t2: { sym: 'á', char: '蛤' },
    t3: { sym: 'ǎ', char: '哑' },
    t4: { sym: 'à', char: '爸' }
  },
  o: {
    t1: { sym: 'ō', char: '窝' },
    t2: { sym: 'ó', char: '喔' },
    t3: { sym: 'ǒ', char: '喔' },
    t4: { sym: 'ò', char: '卧' }
  },
  e: {
    t1: { sym: 'ē', char: '婀' },
    t2: { sym: 'é', char: '鹅' },
    t3: { sym: 'ě', char: '恶' },
    t4: { sym: 'è', char: '饿' }
  },
  i: {
    t1: { sym: 'ī', char: '衣' },
    t2: { sym: 'í', char: '姨' },
    t3: { sym: 'ǐ', char: '椅' },
    t4: { sym: 'ì', char: '意' }
  },
  u: {
    t1: { sym: 'ū', char: '屋' },
    t2: { sym: 'ú', char: '无' },
    t3: { sym: 'ǔ', char: '五' },
    t4: { sym: 'ù', char: '物' }
  },
  ü: {
    t1: { sym: 'ǖ', char: '迂' },
    t2: { sym: 'ǘ', char: '鱼' },
    t3: { sym: 'ǚ', char: '雨' },
    t4: { sym: 'ǜ', char: '玉' }
  }
};

// 单独带调韵母的发音映射
export const YUNMU_SOUND_MAP: Record<string, { sound: string; name: string }> = {
  'ā': { sound: '啊', name: '一声 ā' },
  'á': { sound: '蛤', name: '二声 á' },
  'ǎ': { sound: '哑', name: '三声 ǎ' },
  'à': { sound: '啊', name: '四声 à' },
  'ō': { sound: '窝', name: '一声 ō' },
  'ó': { sound: '喔', name: '二声 ó' },
  'ǒ': { sound: '喔', name: '三声 ǒ' },
  'ò': { sound: '卧', name: '四声 ò' },
  'ē': { sound: '婀', name: '一声 ē' },
  'é': { sound: '鹅', name: '二声 é' },
  'ě': { sound: '恶', name: '三声 ě' },
  'è': { sound: '饿', name: '四声 è' },
  'ī': { sound: '衣', name: '一声 ī' },
  'í': { sound: '姨', name: '二声 í' },
  'ǐ': { sound: '椅', name: '三声 ǐ' },
  'ì': { sound: '意', name: '四声 ì' },
  'ū': { sound: '屋', name: '一声 ū' },
  'ú': { sound: '无', name: '二声 ú' },
  'ǔ': { sound: '五', name: '三声 ǔ' },
  'ù': { sound: '物', name: '四声 ù' },
  'ǖ': { sound: '迂', name: '一声 ǖ' },
  'ǘ': { sound: '鱼', name: '二声 ǘ' },
  'ǚ': { sound: '雨', name: '三声 ǚ' },
  'ǜ': { sound: '玉', name: '四声 ǜ' },
  'ái': { sound: '癌', name: '二声 ái' },
  'ài': { sound: '爱', name: '四声 ài' },
  'ǎo': { sound: '袄', name: '三声 ǎo' },
  'ào': { sound: '傲', name: '四声 ào' },
  'ān': { sound: '安', name: '一声 ān' },
  'àn': { sound: '按', name: '四声 àn' },
  'āng': { sound: '央', name: '一声 āng' },
  'àng': { sound: '盎', name: '四声 àng' }
};

// 拼读音节汉字词典 (Syllable -> Character & Sample Word)
export const BLENDED_SYLLABLES_MAP: Record<string, { char: string; word: string }> = {
  // b
  'bā': { char: '八', word: '八个' },
  'bá': { char: '拔', word: '拔萝卜' },
  'bǎ': { char: '把', word: '把手' },
  'bà': { char: '爸', word: '爸爸' },
  'bō': { char: '波', word: '水波' },
  'bó': { char: '伯', word: '伯伯' },
  'bǒ': { char: '跛', word: '跛行' },
  'bò': { char: '播', word: '广播' },
  'bē': { char: '波', word: '水波' },
  'bé': { char: '伯', word: '伯伯' },
  'bě': { char: '把', word: '把关' },
  'bè': { char: '贝', word: '宝贝' },
  'bī': { char: '逼', word: '逼近' },
  'bí': { char: '鼻', word: '鼻子' },
  'bǐ': { char: '笔', word: '毛笔' },
  'bì': { char: '闭', word: '闭眼' },
  'bū': { char: '晡', word: '平晡' },
  'bú': { char: '不', word: '不是' },
  'bǔ': { char: '补', word: '补习' },
  'bù': { char: '不', word: '不用' },
  'bái': { char: '白', word: '白云' },
  'bài': { char: '败', word: '打败' },
  'bǎo': { char: '宝', word: '宝贝' },
  'bào': { char: '抱', word: '拥抱' },
  'bān': { char: '班', word: '班级' },
  'bàn': { char: '半', word: '半天' },
  'bāng': { char: '帮', word: '帮助' },
  'bàng': { char: '棒', word: '棒棒糖' },

  // p
  'pā': { char: '趴', word: '趴下' },
  'pá': { char: '爬', word: '爬山' },
  'pǎ': { char: '琶', word: '琵琶' },
  'pà': { char: '怕', word: '害怕' },
  'pō': { char: '坡', word: '山坡' },
  'pó': { char: '婆', word: '婆婆' },
  'pǒ': { char: '叵', word: '叵测' },
  'pò': { char: '破', word: '破开' },
  'pē': { char: '坡', word: '山坡' },
  'pé': { char: '婆', word: '婆婆' },
  'pě': { char: '叵', word: '叵测' },
  'pè': { char: '配', word: '配合' },
  'pī': { char: '批', word: '批评' },
  'pí': { char: '皮', word: '皮肤' },
  'pǐ': { char: '匹', word: '一匹马' },
  'pì': { char: '屁', word: '放屁' },
  'pū': { char: '扑', word: '扑倒' },
  'pú': { char: '葡', word: '葡萄' },
  'pǔ': { char: '普', word: '普通' },
  'pù': { char: '瀑', word: '瀑布' },
  'pái': { char: '排', word: '排队' },
  'pài': { char: '派', word: '派出' },
  'pǎo': { char: '跑', word: '跑步' },
  'pào': { char: '泡', word: '水泡' },
  'pān': { char: '攀', word: '攀登' },
  'pàn': { char: '盼', word: '盼望' },
  'pāng': { char: '乓', word: '乒乓' },
  'pàng': { char: '胖', word: '胖胖' },

  // m
  'mā': { char: '妈', word: '妈妈' },
  'má': { char: '麻', word: '麻烦' },
  'mǎ': { char: '马', word: '小马' },
  'mà': { char: '骂', word: '责骂' },
  'mō': { char: '摸', word: '抚摸' },
  'mó': { char: '模', word: '模型' },
  'mǒ': { char: '抹', word: '抹布' },
  'mò': { char: '墨', word: '墨水' },
  'mē': { char: '么', word: '什么' },
  'mé': { char: '么', word: '怎么' },
  'mě': { char: '么', word: '这么' },
  'mè': { char: '妹', word: '妹妹' },
  'mī': { char: '咪', word: '猫咪' },
  'mí': { char: '迷', word: '迷路' },
  'mǐ': { char: '米', word: '大米' },
  'mì': { char: '密', word: '秘密' },
  'mū': { char: '姆', word: '保姆' },
  'mú': { char: '模', word: '模样' },
  'mǔ': { char: '母', word: '母亲' },
  'mù': { char: '木', word: '树木' },
  'mái': { char: '埋', word: '掩埋' },
  'mài': { char: '买', word: '买菜' },
  'mǎo': { char: '卯', word: '卯时' },
  'mào': { char: '帽', word: '帽子' },
  'mān': { char: '曼', word: '曼妙' },
  'màn': { char: '慢', word: '慢慢' },
  'māng': { char: '盲', word: '盲人' },
  'màng': { char: '蟒', word: '大蟒' },

  // f
  'fā': { char: '发', word: '出发' },
  'fá': { char: '罚', word: '奖罚' },
  'fǎ': { char: '法', word: '办法' },
  'fà': { char: '发', word: '头发' },
  'fō': { char: '佛', word: '大佛' },
  'fó': { char: '佛', word: '佛祖' },
  'fē': { char: '飞', word: '飞翔' },
  'fé': { char: '肥', word: '肥沃' },
  'fě': { char: '匪', word: '匪徒' },
  'fè': { char: '费', word: '费用' },
  'fī': { char: '飞', word: '飞翔' },
  'fū': { char: '夫', word: '大夫' },
  'fú': { char: '服', word: '衣服' },
  'fǔ': { char: '斧', word: '斧头' },
  'fù': { char: '父', word: '父母' },
  'fái': { char: '白', word: '白云' },
  'fài': { char: '快', word: '快乐' },
  'fǎo': { char: '好', word: '好人' },
  'fào': { char: '放', word: '放假' },
  'fān': { char: '翻', word: '翻书' },
  'fàn': { char: '饭', word: '米饭' },
  'fāng': { char: '方', word: '方向' },
  'fàng': { char: '放', word: '放学' },

  // d
  'dā': { char: '搭', word: '搭积木' },
  'dá': { char: '答', word: '回答' },
  'dǎ': { char: '打', word: '拍打' },
  'dà': { char: '大', word: '大山' },
  'dō': { char: '都', word: '都好' },
  'dó': { char: '多', word: '多少' },
  'dǒ': { char: '斗', word: '北斗' },
  'dò': { char: '豆', word: '大豆' },
  'dē': { char: '得', word: '得到' },
  'dé': { char: '得', word: '得意' },
  'dě': { char: '得', word: '怎的' },
  'dè': { char: '得', word: '得空' },
  'dī': { char: '低', word: '低头' },
  'dí': { char: '敌', word: '敌人' },
  'dǐ': { char: '底', word: '底下' },
  'dì': { char: '地', word: '大地' },
  'dū': { char: '都', word: '首都' },
  'dú': { char: '读', word: '读书' },
  'dǔ': { char: '赌', word: '打赌' },
  'dù': { char: '度', word: '温度' },
  'dái': { char: '呆', word: '发呆' },
  'dài': { char: '带', word: '带领' },
  'dǎo': { char: '岛', word: '小岛' },
  'dào': { char: '到', word: '到达' },
  'dān': { char: '单', word: '单纯' },
  'dàn': { char: '蛋', word: '鸡蛋' },
  'dāng': { char: '当', word: '当时' },
  'dàng': { char: '荡', word: '荡秋千' },

  // t
  'tā': { char: '他', word: '他们' },
  'tá': { char: '塔', word: '宝塔' },
  'tǎ': { char: '塔', word: '水塔' },
  'tà': { char: '踏', word: '踏步' },
  'tō': { char: '脱', word: '脱下' },
  'tó': { char: '头', word: '石头' },
  'tǒ': { char: '妥', word: '妥当' },
  'tò': { char: '拓', word: '开拓' },
  'tē': { char: '特', word: '特别' },
  'té': { char: '特', word: '特此' },
  'tě': { char: '特', word: '特写' },
  'tè': { char: '特', word: '特别' },
  'tī': { char: '踢', word: '踢球' },
  'tí': { char: '提', word: '提醒' },
  'tǐ': { char: '体', word: '身体' },
  'tì': { char: '替', word: '代替' },
  'tū': { char: '突', word: '突然' },
  'tú': { char: '图', word: '图画' },
  'tǔ': { char: '土', word: '泥土' },
  'tù': { char: '兔', word: '小兔' },
  'tái': { char: '台', word: '讲台' },
  'tài': { char: '太', word: '太阳' },
  'tǎo': { char: '讨', word: '讨人喜欢' },
  'tào': { char: '套', word: '手套' },
  'tān': { char: '摊', word: '地摊' },
  'tàn': { char: '叹', word: '叹气' },
  'tāng': { char: '汤', word: '热汤' },
  'tàng': { char: '趟', word: '一趟' },

  // n
  'nā': { char: '南', word: '南方' },
  'ná': { char: '拿', word: '拿手' },
  'nǎ': { char: '哪', word: '哪里' },
  'nà': { char: '那', word: '那个' },
  'nō': { char: '挪', word: '挪动' },
  'nó': { char: '挪', word: '挪步' },
  'nē': { char: '呢', word: '人呢' },
  'né': { char: '哪', word: '哪吒' },
  'ně': { char: '哪', word: '哪个' },
  'nè': { char: '讷', word: '木讷' },
  'nī': { char: '妮', word: '小妮' },
  'ní': { char: '泥', word: '泥土' },
  'nǐ': { char: '你', word: '你好' },
  'nì': { char: '逆', word: '逆风' },
  'nū': { char: '奴', word: '奴隶' },
  'nú': { char: '奴', word: '守财奴' },
  'nǔ': { char: '努', word: '努力' },
  'nù': { char: '怒', word: '发怒' },
  'nǎi': { char: '奶', word: '牛奶' },
  'nài': { char: '耐', word: '耐心' },
  'nǎo': { char: '脑', word: '大脑' },
  'nào': { char: '闹', word: '热闹' },
  'nān': { char: '囡', word: '小囡' },
  'nán': { char: '南', word: '南方' },
  'nàn': { char: '难', word: '困难' },
  'nāng': { char: '囊', word: '皮囊' },
  'nàng': { char: '囔', word: '嘟囔' },

  // l
  'lā': { char: '拉', word: '拉车' },
  'lá': { char: '拉', word: '划拉' },
  'lǎ': { char: '喇', word: '喇叭' },
  'là': { char: '蜡', word: '蜡烛' },
  'lō': { char: '咯', word: '咯咯' },
  'ló': { char: '罗', word: '萝卜' },
  'lē': { char: '勒', word: '勒马' },
  'lé': { char: '勒', word: '勒紧' },
  'lè': { char: '乐', word: '快乐' },
  'lī': { char: '哩', word: '英哩' },
  'lí': { char: '梨', word: '鸭梨' },
  'lǐ': { char: '里', word: '手里' },
  'lì': { char: '立', word: '立正' },
  'lū': { char: '噜', word: '呼噜' },
  'lú': { char: '炉', word: '火炉' },
  'lǔ': { char: '鲁', word: '鲁班' },
  'lù': { char: '路', word: '马路' },
  'lái': { char: '来', word: '回来' },
  'lài': { char: '赖', word: '赖床' },
  'lǎo': { char: '老', word: '老师' },
  'lào': { char: '烙', word: '烙饼' },
  'lán': { char: '蓝', word: '蓝天' },
  'làn': { char: '烂', word: '灿烂' },
  'láng': { char: '狼', word: '大灰狼' },
  'làng': { char: '浪', word: '海浪' },

  // g
  'gā': { char: '嘎', word: '嘎嘎叫' },
  'gǎ': { char: '尕', word: '尕娃' },
  'gà': { char: '尬', word: '尴尬' },
  'gō': { char: '歌', word: '唱歌' },
  'gē': { char: '哥', word: '哥哥' },
  'gé': { char: '格', word: '格子' },
  'gě': { char: '葛', word: '葛藤' },
  'gè': { char: '个', word: '一个' },
  'gū': { char: '姑', word: '姑姑' },
  'gǔ': { char: '古', word: '古代' },
  'gù': { char: '故', word: '故事' },
  'gāi': { char: '该', word: '应该' },
  'gài': { char: '盖', word: '盖被子' },
  'gǎo': { char: '稿', word: '写稿' },
  'gào': { char: '告', word: '告诉' },
  'gān': { char: '干', word: '干净' },
  'gàn': { char: '干', word: '干活' },
  'gāng': { char: '钢', word: '钢琴' },
  'gàng': { char: '杠', word: '杠杆' },

  // k
  'kā': { char: '咖', word: '咖啡' },
  'kǎ': { char: '卡', word: '卡片' },
  'kē': { char: '科', word: '科学' },
  'ké': { char: '咳', word: '咳嗽' },
  'kě': { char: '渴', word: '口渴' },
  'kè': { char: '客', word: '客人' },
  'kū': { char: '哭', word: '哭泣' },
  'kǔ': { char: '苦', word: '辛苦' },
  'kù': { char: '裤', word: '裤子' },
  'kāi': { char: '开', word: '开花' },
  'kài': { char: '慨', word: '慷慨' },
  'kǎo': { char: '考', word: '考试' },
  'kào': { char: '靠', word: '依靠' },
  'kān': { char: '看', word: '看守' },
  'kàn': { char: '看', word: '看见' },
  'kāng': { char: '康', word: '健康' },
  'kàng': { char: '抗', word: '抗争' },

  // h
  'hā': { char: '哈', word: '哈哈大笑' },
  'hē': { char: '喝', word: '喝水' },
  'hé': { char: '河', word: '小河' },
  'hè': { char: '贺', word: '祝贺' },
  'hū': { char: '呼', word: '呼吸' },
  'hú': { char: '湖', word: '西湖' },
  'hǔ': { char: '虎', word: '老虎' },
  'hù': { char: '护', word: '保护' },
  'hái': { char: '孩', word: '孩子' },
  'hài': { char: '害', word: '害怕' },
  'hǎo': { char: '好', word: '好人' },
  'hào': { char: '号', word: '口号' },
  'hān': { char: '憨', word: '憨厚' },
  'hàn': { char: '汗', word: '汗水' },
  'hāng': { char: '夯', word: '夯实' },
  'hàng': { char: '行', word: '树行' },

  // j
  'jī': { char: '鸡', word: '小鸡' },
  'jí': { char: '极', word: '极好' },
  'jǐ': { char: '几', word: '几个' },
  'jì': { char: '记', word: '日记' },
  'jū': { char: '居', word: '居住' },
  'jú': { char: '局', word: '局长' },
  'jǔ': { char: '举', word: '举手' },
  'jù': { char: '句', word: '句子' },
  'jiā': { char: '家', word: '回家' },
  'jià': { char: '架', word: '书架' },
  'jiǎo': { char: '脚', word: '小脚' },
  'jiào': { char: '叫', word: '叫声' },
  'jiān': { char: '尖', word: '尖角' },
  'jiàn': { char: '见', word: '看见' },
  'jiāng': { char: '江', word: '长江' },
  'jiàng': { char: '匠', word: '木匠' },

  // q
  'qī': { char: '七', word: '七个' },
  'qí': { char: '骑', word: '骑马' },
  'qǐ': { char: '起', word: '起来' },
  'qì': { char: '汽', word: '汽车' },
  'qū': { char: '区', word: '小区' },
  'qú': { char: '渠', word: '水渠' },
  'qǔ': { char: '曲', word: '歌曲' },
  'qù': { char: '去', word: '回去' },
  'qiā': { char: '掐', word: '掐指' },
  'qià': { char: '恰', word: '恰好' },
  'qiǎo': { char: '巧', word: '巧手' },
  'qiào': { char: '翘', word: '翘起' },
  'qiān': { char: '千', word: '千万' },
  'qiàn': { char: '欠', word: '欠条' },
  'qiāng': { char: '枪', word: '手枪' },
  'qiàng': { char: '抢', word: '抢答' },

  // x
  'xī': { char: '西', word: '西瓜' },
  'xí': { char: '习', word: '学习' },
  'xǐ': { char: '洗', word: '洗手' },
  'xì': { char: '戏', word: '游戏' },
  'xū': { char: '须', word: '必须' },
  'xú': { char: '徐', word: '徐徐' },
  'xǔ': { char: '许', word: '许多' },
  'xù': { char: '序', word: '顺序' },
  'xiā': { char: '虾', word: '大虾' },
  'xià': { char: '下', word: '上下' },
  'xiǎo': { char: '小', word: '大小' },
  'xiào': { char: '笑', word: '欢笑' },
  'xiān': { char: '先', word: '首先' },
  'xiàn': { char: '现', word: '现在' },
  'xiāng': { char: '香', word: '香气' },
  'xiàng': { char: '向', word: '方向' },

  // zh
  'zhā': { char: '扎', word: '扎辫子' },
  'zhá': { char: '炸', word: '油炸' },
  'zhǎ': { char: '眨', word: '眨眼' },
  'zhà': { char: '炸', word: '爆炸' },
  'zhē': { char: '遮', word: '遮阳' },
  'zhé': { char: '折', word: '折纸' },
  'zhě': { char: '者', word: '作者' },
  'zhè': { char: '这', word: '这里' },
  'zhī': { char: '知', word: '知识' },
  'zhí': { char: '直', word: '直尺' },
  'zhǐ': { char: '纸', word: '白纸' },
  'zhì': { char: '志', word: '志气' },
  'zhū': { char: '猪', word: '小猪' },
  'zhú': { char: '竹', word: '竹子' },
  'zhǔ': { char: '主', word: '主人' },
  'zhù': { char: '住', word: '居住' },
  'zhái': { char: '宅', word: '住宅' },
  'zhài': { char: '寨', word: '山寨' },
  'zhǎo': { char: '找', word: '寻找' },
  'zhào': { char: '照', word: '拍照' },
  'zhān': { char: '沾', word: '沾水' },
  'zhàn': { char: '站', word: '立正' },
  'zhāng': { char: '张', word: '一张纸' },
  'zhàng': { char: '帐', word: '帐篷' },

  // ch
  'chā': { char: '叉', word: '交叉' },
  'chá': { char: '茶', word: '喝茶' },
  'chǎ': { char: '岔', word: '岔路' },
  'chà': { char: '差', word: '差不多' },
  'chē': { char: '车', word: '小车' },
  'chè': { char: '彻', word: '彻底' },
  'chī': { char: '吃', word: '吃饭' },
  'chí': { char: '迟', word: '迟到' },
  'chǐ': { char: '尺', word: '尺子' },
  'chì': { char: '翅', word: '翅膀' },
  'chū': { char: '出', word: '出门' },
  'chú': { char: '除', word: '除法' },
  'chǔ': { char: '楚', word: '清楚' },
  'chù': { char: '处', word: '到处' },
  'chái': { char: '柴', word: '木柴' },
  'chào': { char: '抄', word: '抄写' },
  'chǎo': { char: '吵', word: '吵闹' },
  'chān': { char: '搀', word: '搀扶' },
  'chàn': { char: '颤', word: '颤抖' },
  'chāng': { char: '昌', word: '昌盛' },
  'chàng': { char: '唱', word: '唱歌' },

  // sh
  'shā': { char: '沙', word: '沙子' },
  'shá': { char: '啥', word: '什么' },
  'shǎ': { char: '傻', word: '傻笑' },
  'shà': { char: '厦', word: '大厦' },
  'shē': { char: '奢', word: '奢侈' },
  'shé': { char: '折', word: '折本' },
  'shě': { char: '舍', word: '舍得' },
  'shè': { char: '社', word: '社会' },
  'shī': { char: '诗', word: '古诗' },
  'shí': { char: '十', word: '十个' },
  'shǐ': { char: '始', word: '开始' },
  'shì': { char: '是', word: '是的' },
  'shū': { char: '书', word: '看书' },
  'shú': { char: '熟', word: '成熟' },
  'shǔ': { char: '数', word: '数数' },
  'shù': { char: '树', word: '大树' },
  'shāi': { char: '筛', word: '筛选' },
  'shài': { char: '晒', word: '晒太阳' },
  'shǎo': { char: '少', word: '多少' },
  'shào': { char: '少', word: '少年' },
  'shān': { char: '山', word: '大山' },
  'shàn': { char: '扇', word: '扇子' },
  'shāng': { char: '伤', word: '伤心' },
  'shàng': { char: '上', word: '上下' },

  // r
  'rě': { char: '惹', word: '惹人喜爱' },
  'rè': { char: '热', word: '天气热' },
  'rì': { char: '日', word: '红日' },
  'rú': { char: '如', word: '如果' },
  'rǔ': { char: '乳', word: '牛奶' },
  'rù': { char: '入', word: '出入' },
  'ráo': { char: '饶', word: '饶恕' },
  'rào': { char: '绕', word: '围绕' },
  'rán': { char: '然', word: '然后' },
  'rǎn': { char: '染', word: '染色' },
  'ràng': { char: '让', word: '礼让' },

  // z
  'zā': { char: '扎', word: '包扎' },
  'zá': { char: '杂', word: '复杂' },
  'zǎ': { char: '咋', word: '咋样' },
  'zé': { char: '则', word: '原则' },
  'zè': { char: '仄', word: '平仄' },
  'zī': { char: '资', word: '资本' },
  'zǐ': { char: '紫', word: '紫色' },
  'zì': { char: '字', word: '汉字' },
  'zū': { char: '租', word: '出租' },
  'zú': { char: '足', word: '足球' },
  'zǔ': { char: '组', word: '组长' },
  'zāi': { char: '栽', word: '栽树' },
  'zài': { char: '在', word: '现在' },
  'zǎo': { char: '早', word: '早上' },
  'zào': { char: '造', word: '造句' },
  'zān': { char: '簪', word: '发簪' },
  'zàn': { char: '赞', word: '赞美' },
  'zāng': { char: '脏', word: '弄脏' },
  'zàng': { char: '藏', word: '宝藏' },

  // c
  'cā': { char: '擦', word: '擦黑板' },
  'cè': { char: '测', word: '测试' },
  'cī': { char: '疵', word: '瑕疵' },
  'cí': { char: '词', word: '词语' },
  'cǐ': { char: '此', word: '因此' },
  'cì': { char: '次', word: '一次' },
  'cū': { char: '粗', word: '粗细' },
  'cù': { char: '促', word: '急促' },
  'cāi': { char: '猜', word: '猜谜' },
  'cài': { char: '菜', word: '买菜' },
  'cǎo': { char: '草', word: '小草' },
  'cān': { char: '餐', word: '午餐' },
  'càn': { char: '灿', word: '灿烂' },
  'cāng': { char: '仓', word: '仓库' },
  'càng': { char: '操', word: '操场' },

  // s
  'sā': { char: '撒', word: '撒娇' },
  'sǎ': { char: '洒', word: '洒水' },
  'sà': { char: '飒', word: '飒爽' },
  'sè': { char: '色', word: '颜色' },
  'sī': { char: '丝', word: '雨丝' },
  'sǐ': { char: '死', word: '死守' },
  'sì': { char: '四', word: '四个' },
  'sū': { char: '苏', word: '复苏' },
  'sú': { char: '俗', word: '风俗' },
  'sù': { char: '速', word: '速度' },
  'sāi': { char: '腮', word: '腮帮' },
  'sài': { char: '赛', word: '比赛' },
  'sǎo': { char: '扫', word: '打扫' },
  'sào': { char: '嫂', word: '大嫂' },
  'sān': { char: '三', word: '三个' },
  'sǎn': { char: '伞', word: '雨伞' },
  'sàn': { char: '散', word: '散步' },
  'sāng': { char: '桑', word: '桑叶' },
  'sàng': { char: '丧', word: '沮丧' }
};

/**
 * 获取声母的标准汉字发音
 */
export function getInitialSound(sheng: string): { sound: string; spokenName: string; pinyinWithTone: string } {
  const found = PINYIN_INITIALS_DATA.find((i) => i.pinyin === sheng);
  if (found) {
    return { sound: found.sound, spokenName: found.spokenName, pinyinWithTone: found.pinyinWithTone };
  }
  return { sound: sheng, spokenName: sheng, pinyinWithTone: sheng };
}

/**
 * 获取韵母（或带声调韵母）的标准汉字发音
 */
export function getFinalSound(yun: string): { sound: string; name: string } {
  if (YUNMU_SOUND_MAP[yun]) {
    return YUNMU_SOUND_MAP[yun];
  }
  const danFound = PINYIN_DAN_YUNMU.find((d) => d.pinyin === yun);
  if (danFound) return { sound: danFound.sound, name: danFound.name };

  const fuFound = PINYIN_FU_YUNMU.find((f) => f.pinyin === yun);
  if (fuFound) return { sound: fuFound.sound, name: fuFound.name };

  return { sound: yun, name: yun };
}

/**
 * 魔法拼读核心合成器 (Initial + Vowel -> Spoken Chinese text & Sample Character)
 */
export function getBlendedPinyinDetail(sheng: string, yun: string): {
  sheng: string;
  yun: string;
  blendedPinyin: string;
  shengSound: string;
  yunSound: string;
  blendedSound: string;
  sampleChar: string;
  sampleWord: string;
  spokenSpellingText: string;
} {
  const blendedPinyin = sheng + yun;
  const initialInfo = getInitialSound(sheng);
  const finalInfo = getFinalSound(yun);

  const matched = BLENDED_SYLLABLES_MAP[blendedPinyin];
  const sampleChar = matched ? matched.char : '';
  const sampleWord = matched ? matched.word : '';

  // 拼读标准汉语读音示范：'玻——啊——爸！爸爸的爸！'
  const blendedSound = sampleChar || finalInfo.sound;
  let spokenSpellingText = `${initialInfo.sound}——${finalInfo.sound}——${blendedSound}！`;
  if (sampleChar && sampleWord) {
    spokenSpellingText += `${sampleWord}的${sampleChar}！`;
  }

  return {
    sheng,
    yun,
    blendedPinyin,
    shengSound: initialInfo.sound,
    yunSound: finalInfo.sound,
    blendedSound,
    sampleChar,
    sampleWord,
    spokenSpellingText
  };
}
