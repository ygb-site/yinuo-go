export interface HanziVocabularyItem {
  id: string;
  char: string;
  pinyin: string;
  grade: '一年级上册' | '一年级下册' | '二年级上册' | '二年级下册';
  category: string;
  radical: string;
  strokeCount: number;
  meaning: string;
  words: string[];
  sampleSentence: string;
}

export const HANZI_VOCABULARY_LIST: HanziVocabularyItem[] = [
  {
    "id": "h_101",
    "char": "天",
    "pinyin": "tiān",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "大",
    "strokeCount": 4,
    "meaning": "天空、一天、日子、大自然",
    "words": [
      "蓝天",
      "晴天",
      "今天",
      "冬天"
    ],
    "sampleSentence": "蓝蓝的天空上面飘着白白的云朵。"
  },
  {
    "id": "h_102",
    "char": "地",
    "pinyin": "dì",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "土",
    "strokeCount": 6,
    "meaning": "大地、土地、地面、地方",
    "words": [
      "大地",
      "草地",
      "田地",
      "地球"
    ],
    "sampleSentence": "小羊在绿色的大草地上吃青草。"
  },
  {
    "id": "h_103",
    "char": "人",
    "pinyin": "rén",
    "grade": "一年级上册",
    "category": "人物家庭",
    "radical": "人",
    "strokeCount": 2,
    "meaning": "人类、个人、人们",
    "words": [
      "好人",
      "大人",
      "工人",
      "人们"
    ],
    "sampleSentence": "我们要做一个诚实懂礼貌的好人。"
  },
  {
    "id": "h_104",
    "char": "你",
    "pinyin": "nǐ",
    "grade": "一年级上册",
    "category": "人物家庭",
    "radical": "亻",
    "strokeCount": 7,
    "meaning": "称呼对方（单数）",
    "words": [
      "你好",
      "你们",
      "你的"
    ],
    "sampleSentence": "早上见到老师要大声说：“老师您好！”"
  },
  {
    "id": "h_105",
    "char": "我",
    "pinyin": "wǒ",
    "grade": "一年级上册",
    "category": "人物家庭",
    "radical": "戈",
    "strokeCount": 7,
    "meaning": "自己、我方",
    "words": [
      "我们",
      "我家",
      "我的",
      "自我"
    ],
    "sampleSentence": "我是一个活泼快乐的小学生。"
  },
  {
    "id": "h_106",
    "char": "他",
    "pinyin": "tā",
    "grade": "一年级上册",
    "category": "人物家庭",
    "radical": "亻",
    "strokeCount": 5,
    "meaning": "称呼对方以外的男性或人",
    "words": [
      "他们",
      "他人",
      "其他"
    ],
    "sampleSentence": "他是我的好朋友，我们一起做数学题。"
  },
  {
    "id": "h_107",
    "char": "一",
    "pinyin": "yī",
    "grade": "一年级上册",
    "category": "数字量词",
    "radical": "一",
    "strokeCount": 1,
    "meaning": "最小正整数、第一、全部",
    "words": [
      "一个",
      "一天",
      "第一",
      "一定"
    ],
    "sampleSentence": "一年之计在于春，一日之计在于晨。"
  },
  {
    "id": "h_108",
    "char": "二",
    "pinyin": "èr",
    "grade": "一年级上册",
    "category": "数字量词",
    "radical": "二",
    "strokeCount": 2,
    "meaning": "数字2、第二",
    "words": [
      "二人",
      "二月",
      "第二",
      "二胡"
    ],
    "sampleSentence": "二月春风似剪刀。"
  },
  {
    "id": "h_109",
    "char": "三",
    "pinyin": "sān",
    "grade": "一年级上册",
    "category": "数字量词",
    "radical": "一",
    "strokeCount": 3,
    "meaning": "数字3、第三",
    "words": [
      "三天",
      "三月",
      "三角",
      "三思"
    ],
    "sampleSentence": "三人行，必有我师焉。"
  },
  {
    "id": "h_110",
    "char": "四",
    "pinyin": "sì",
    "grade": "一年级上册",
    "category": "数字量词",
    "radical": "囗",
    "strokeCount": 5,
    "meaning": "数字4、四周",
    "words": [
      "四季",
      "四方",
      "四个",
      "四月"
    ],
    "sampleSentence": "一年有春夏秋冬四个季节。"
  },
  {
    "id": "h_111",
    "char": "五",
    "pinyin": "wǔ",
    "grade": "一年级上册",
    "category": "数字量词",
    "radical": "二",
    "strokeCount": 4,
    "meaning": "数字5",
    "words": [
      "五天",
      "五月",
      "五星",
      "五十"
    ],
    "sampleSentence": "天安门城楼上飘扬着五星红旗。"
  },
  {
    "id": "h_112",
    "char": "上",
    "pinyin": "shàng",
    "grade": "一年级上册",
    "category": "方位空间",
    "radical": "一",
    "strokeCount": 3,
    "meaning": "位置在高处、向上、去往",
    "words": [
      "上学",
      "上课",
      "天上",
      "上下"
    ],
    "sampleSentence": "背上小书包，我们开开心心去上学。"
  },
  {
    "id": "h_113",
    "char": "下",
    "pinyin": "xià",
    "grade": "一年级上册",
    "category": "方位空间",
    "radical": "一",
    "strokeCount": 3,
    "meaning": "位置在低处、向下、降下",
    "words": [
      "下雨",
      "下午",
      "树下",
      "下棋"
    ],
    "sampleSentence": "窗外下起了淅淅沥沥的春雨。"
  },
  {
    "id": "h_114",
    "char": "口",
    "pinyin": "kǒu",
    "grade": "一年级上册",
    "category": "人体五官",
    "radical": "口",
    "strokeCount": 3,
    "meaning": "嘴巴、出入口",
    "words": [
      "口水",
      "门口",
      "口渴",
      "开口"
    ],
    "sampleSentence": "吃饭要细嚼慢咽，不大声张口喧哗。"
  },
  {
    "id": "h_115",
    "char": "耳",
    "pinyin": "ěr",
    "grade": "一年级上册",
    "category": "人体五官",
    "radical": "耳",
    "strokeCount": 6,
    "meaning": "耳朵、听觉器官",
    "words": [
      "耳朵",
      "木耳",
      "耳目",
      "右耳"
    ],
    "sampleSentence": "小白兔有一对长长的白耳朵。"
  },
  {
    "id": "h_116",
    "char": "目",
    "pinyin": "mù",
    "grade": "一年级上册",
    "category": "人体五官",
    "radical": "目",
    "strokeCount": 5,
    "meaning": "眼睛、目光、目录",
    "words": [
      "目光",
      "目标",
      "题目",
      "目中"
    ],
    "sampleSentence": "保护眼睛，我们要认真做眼保健操。"
  },
  {
    "id": "h_117",
    "char": "手",
    "pinyin": "shǒu",
    "grade": "一年级上册",
    "category": "人体五官",
    "radical": "手",
    "strokeCount": 4,
    "meaning": "人体上肢前端、动手",
    "words": [
      "双手",
      "手指",
      "小手",
      "手心"
    ],
    "sampleSentence": "勤劳的双手能创造美好的生活。"
  },
  {
    "id": "h_118",
    "char": "足",
    "pinyin": "zú",
    "grade": "一年级上册",
    "category": "人体五官",
    "radical": "足",
    "strokeCount": 7,
    "meaning": "脚、充足、足够",
    "words": [
      "足球",
      "手足",
      "自足",
      "知足"
    ],
    "sampleSentence": "课间操场上，同学们在欢快地踢足球。"
  },
  {
    "id": "h_119",
    "char": "日",
    "pinyin": "rì",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "日",
    "strokeCount": 4,
    "meaning": "太阳、日子、白天",
    "words": [
      "红日",
      "日光",
      "今日",
      "日子"
    ],
    "sampleSentence": "一轮红日从东方冉冉升起。"
  },
  {
    "id": "h_120",
    "char": "月",
    "pinyin": "yuè",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "月",
    "strokeCount": 4,
    "meaning": "月亮、月份",
    "words": [
      "月亮",
      "月光",
      "岁月",
      "明月"
    ],
    "sampleSentence": "中秋节的夜空挂着圆圆的明月。"
  },
  {
    "id": "h_121",
    "char": "水",
    "pinyin": "shuǐ",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "水",
    "strokeCount": 4,
    "meaning": "水流、液体、河流",
    "words": [
      "河水",
      "喝水",
      "清水",
      "水果"
    ],
    "sampleSentence": "我们要节约用水，爱护每一滴水。"
  },
  {
    "id": "h_122",
    "char": "火",
    "pinyin": "huǒ",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "火",
    "strokeCount": 4,
    "meaning": "火光、火焰、红火",
    "words": [
      "烈火",
      "红火",
      "火车",
      "火苗"
    ],
    "sampleSentence": "冬天里围着火炉看书真温暖。"
  },
  {
    "id": "h_123",
    "char": "山",
    "pinyin": "shān",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "山",
    "strokeCount": 3,
    "meaning": "高山、山峰、山川",
    "words": [
      "高山",
      "山峰",
      "爬山",
      "山水"
    ],
    "sampleSentence": "远看山有色，近听水无声。"
  },
  {
    "id": "h_124",
    "char": "石",
    "pinyin": "shí",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "石",
    "strokeCount": 5,
    "meaning": "石头、岩石",
    "words": [
      "石头",
      "小石",
      "水石",
      "石桥"
    ],
    "sampleSentence": "小溪里有许多五彩斑斓的小石头。"
  },
  {
    "id": "h_125",
    "char": "田",
    "pinyin": "tián",
    "grade": "一年级上册",
    "category": "田园植物",
    "radical": "田",
    "strokeCount": 5,
    "meaning": "田地、农田、田野",
    "words": [
      "田地",
      "农田",
      "田野",
      "稻田"
    ],
    "sampleSentence": "金黄的麦浪在广阔的田野上翻滚。"
  },
  {
    "id": "h_126",
    "char": "禾",
    "pinyin": "hé",
    "grade": "一年级上册",
    "category": "田园植物",
    "radical": "禾",
    "strokeCount": 5,
    "meaning": "谷类庄稼、禾苗",
    "words": [
      "禾苗",
      "禾田",
      "木禾",
      "青禾"
    ],
    "sampleSentence": "锄禾日当午，汗滴禾下土。"
  },
  {
    "id": "h_127",
    "char": "木",
    "pinyin": "mù",
    "grade": "一年级上册",
    "category": "田园植物",
    "radical": "木",
    "strokeCount": 4,
    "meaning": "树木、木头",
    "words": [
      "树木",
      "木头",
      "积木",
      "草木"
    ],
    "sampleSentence": "小朋友在桌前认真地搭积木。"
  },
  {
    "id": "h_128",
    "char": "林",
    "pinyin": "lín",
    "grade": "一年级上册",
    "category": "田园植物",
    "radical": "木",
    "strokeCount": 8,
    "meaning": "成片的树木、森林",
    "words": [
      "树林",
      "森林",
      "林木",
      "竹林"
    ],
    "sampleSentence": "大森林是许多小动物快乐的家园。"
  },
  {
    "id": "h_129",
    "char": "土",
    "pinyin": "tǔ",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "土",
    "strokeCount": 3,
    "meaning": "泥土、土地、尘土",
    "words": [
      "泥土",
      "土地",
      "尘土",
      "水土"
    ],
    "sampleSentence": "小种子在湿润的泥土里悄悄发芽。"
  },
  {
    "id": "h_130",
    "char": "云",
    "pinyin": "yún",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "二",
    "strokeCount": 4,
    "meaning": "云彩、白云",
    "words": [
      "白云",
      "乌云",
      "彩云",
      "风云"
    ],
    "sampleSentence": "朵朵白云在蓝天上慢悠悠地散步。"
  },
  {
    "id": "h_131",
    "char": "雨",
    "pinyin": "yǔ",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "雨",
    "strokeCount": 8,
    "meaning": "降雨、雨水",
    "words": [
      "下雨",
      "雨水",
      "大雨",
      "春雨"
    ],
    "sampleSentence": "好雨知时节，当春乃发生。"
  },
  {
    "id": "h_132",
    "char": "风",
    "pinyin": "fēng",
    "grade": "一年级上册",
    "category": "自然天地",
    "radical": "风",
    "strokeCount": 4,
    "meaning": "空气流动、微风、大风",
    "words": [
      "春风",
      "微风",
      "大风",
      "秋风"
    ],
    "sampleSentence": "春风吹拂大地，吹醒了冬眠的小动物。"
  },
  {
    "id": "h_133",
    "char": "花",
    "pinyin": "huā",
    "grade": "一年级上册",
    "category": "田园植物",
    "radical": "艹",
    "strokeCount": 7,
    "meaning": "花朵、鲜花",
    "words": [
      "花朵",
      "开花",
      "红花",
      "鲜花"
    ],
    "sampleSentence": "春天公园里的鲜花争奇斗艳地盛开。"
  },
  {
    "id": "h_134",
    "char": "鸟",
    "pinyin": "niǎo",
    "grade": "一年级上册",
    "category": "飞禽走兽",
    "radical": "鸟",
    "strokeCount": 5,
    "meaning": "飞禽、鸟类",
    "words": [
      "小鸟",
      "飞鸟",
      "百鸟",
      "鸟鸣"
    ],
    "sampleSentence": "清晨小鸟在树枝上清脆地唱歌。"
  },
  {
    "id": "h_135",
    "char": "虫",
    "pinyin": "chóng",
    "grade": "一年级上册",
    "category": "飞禽走兽",
    "radical": "虫",
    "strokeCount": 6,
    "meaning": "昆虫、虫子",
    "words": [
      "昆虫",
      "小虫",
      "益虫",
      "毛虫"
    ],
    "sampleSentence": "啄木鸟在树干上捕捉害虫。"
  },
  {
    "id": "h_136",
    "char": "大",
    "pinyin": "dà",
    "grade": "一年级上册",
    "category": "大小多少",
    "radical": "大",
    "strokeCount": 3,
    "meaning": "体积或数量巨大、年纪长",
    "words": [
      "大人",
      "大家",
      "大山",
      "大雨"
    ],
    "sampleSentence": "大象的身子像一堵坚厚的高墙。"
  },
  {
    "id": "h_137",
    "char": "小",
    "pinyin": "xiǎo",
    "grade": "一年级上册",
    "category": "大小多少",
    "radical": "小",
    "strokeCount": 3,
    "meaning": "体积微小、年轻",
    "words": [
      "小鸟",
      "小手",
      "小心",
      "小河"
    ],
    "sampleSentence": "小小的红雨伞遮住了蒙蒙细雨。"
  },
  {
    "id": "h_138",
    "char": "多",
    "pinyin": "duō",
    "grade": "一年级上册",
    "category": "大小多少",
    "radical": "夕",
    "strokeCount": 6,
    "meaning": "数量丰富、多数",
    "words": [
      "多少",
      "许多",
      "多数",
      "多好"
    ],
    "sampleSentence": "图书馆里有许多有趣的童话书。"
  },
  {
    "id": "h_139",
    "char": "少",
    "pinyin": "shǎo",
    "grade": "一年级上册",
    "category": "大小多少",
    "radical": "小",
    "strokeCount": 4,
    "meaning": "数量稀少、短缺",
    "words": [
      "很少",
      "多少",
      "少年",
      "少女"
    ],
    "sampleSentence": "少说空话，多做实事。"
  },
  {
    "id": "h_140",
    "char": "早",
    "pinyin": "zǎo",
    "grade": "一年级上册",
    "category": "生活日常",
    "radical": "日",
    "strokeCount": 6,
    "meaning": "清晨、提早、早起",
    "words": [
      "早上",
      "早安",
      "很早",
      "早起"
    ],
    "sampleSentence": "早睡早起身体好。"
  },
  {
    "id": "h_201",
    "char": "春",
    "pinyin": "chūn",
    "grade": "一年级下册",
    "category": "四季自然",
    "radical": "日",
    "strokeCount": 9,
    "meaning": "春季、万物复苏",
    "words": [
      "春天",
      "春风",
      "春雨",
      "春日"
    ],
    "sampleSentence": "春风吹绿了大地，吹醒了花草。"
  },
  {
    "id": "h_202",
    "char": "夏",
    "pinyin": "xià",
    "grade": "一年级下册",
    "category": "四季自然",
    "radical": "夂",
    "strokeCount": 10,
    "meaning": "夏季、炎热夏天",
    "words": [
      "夏天",
      "夏季",
      "夏日",
      "初夏"
    ],
    "sampleSentence": "夏天池塘里盛开着美丽的荷花。"
  },
  {
    "id": "h_203",
    "char": "秋",
    "pinyin": "qiū",
    "grade": "一年级下册",
    "category": "四季自然",
    "radical": "禾",
    "strokeCount": 9,
    "meaning": "秋季、收获季节",
    "words": [
      "秋天",
      "秋季",
      "秋风",
      "中秋"
    ],
    "sampleSentence": "金秋十月，果园里硕果累累。"
  },
  {
    "id": "h_204",
    "char": "冬",
    "pinyin": "dōng",
    "grade": "一年级下册",
    "category": "四季自然",
    "radical": "夂",
    "strokeCount": 5,
    "meaning": "冬季、白雪寒冬",
    "words": [
      "冬天",
      "冬季",
      "冬雪",
      "立冬"
    ],
    "sampleSentence": "冬天里小朋友们在雪地里堆雪人。"
  },
  {
    "id": "h_205",
    "char": "青",
    "pinyin": "qīng",
    "grade": "一年级下册",
    "category": "色彩生字",
    "radical": "青",
    "strokeCount": 8,
    "meaning": "绿色、青草、年轻",
    "words": [
      "青草",
      "青蛙",
      "青年",
      "青山"
    ],
    "sampleSentence": "池塘边的小青蛙大声地呱呱叫。"
  },
  {
    "id": "h_206",
    "char": "清",
    "pinyin": "qīng",
    "grade": "一年级下册",
    "category": "偏旁家族",
    "radical": "氵",
    "strokeCount": 11,
    "meaning": "清澈、洁净、清楚",
    "words": [
      "清水",
      "清澈",
      "清楚",
      "清新"
    ],
    "sampleSentence": "清清的溪水里有许多小鱼游来游去。"
  },
  {
    "id": "h_207",
    "char": "晴",
    "pinyin": "qíng",
    "grade": "一年级下册",
    "category": "偏旁家族",
    "radical": "日",
    "strokeCount": 12,
    "meaning": "天空中没有乌云、晴天",
    "words": [
      "晴天",
      "晴空",
      "晴朗",
      "放晴"
    ],
    "sampleSentence": "今天是个万里无云的晴朗好天气。"
  },
  {
    "id": "h_208",
    "char": "眼",
    "pinyin": "yǎn",
    "grade": "一年级下册",
    "category": "偏旁家族",
    "radical": "目",
    "strokeCount": 11,
    "meaning": "眼睛、目光、孔洞",
    "words": [
      "眼睛",
      "眼前",
      "双眼",
      "眼神"
    ],
    "sampleSentence": "小猫圆溜溜的眼睛在夜里闪闪发光。"
  },
  {
    "id": "h_209",
    "char": "睛",
    "pinyin": "jīng",
    "grade": "一年级下册",
    "category": "偏旁家族",
    "radical": "目",
    "strokeCount": 13,
    "meaning": "眼珠、眼球",
    "words": [
      "眼睛",
      "定睛",
      "目不转睛"
    ],
    "sampleSentence": "上课时同学们目不转睛地看着黑板。"
  },
  {
    "id": "h_210",
    "char": "请",
    "pinyin": "qǐng",
    "grade": "一年级下册",
    "category": "礼貌用语",
    "radical": "讠",
    "strokeCount": 10,
    "meaning": "请求、邀请、礼貌词",
    "words": [
      "请问",
      "请坐",
      "邀请",
      "申请"
    ],
    "sampleSentence": "进老师办公室前要先敲门说“请进”。"
  },
  {
    "id": "h_211",
    "char": "问",
    "pinyin": "wèn",
    "grade": "一年级下册",
    "category": "学问习惯",
    "radical": "门",
    "strokeCount": 6,
    "meaning": "提问、询问、审问",
    "words": [
      "问题",
      "提问",
      "问好",
      "疑问"
    ],
    "sampleSentence": "敏而好学，不耻下问。"
  },
  {
    "id": "h_212",
    "char": "走",
    "pinyin": "zǒu",
    "grade": "一年级下册",
    "category": "运动动作",
    "radical": "走",
    "strokeCount": 7,
    "meaning": "步行、迈步行走、离开",
    "words": [
      "走路",
      "行走",
      "走开",
      "快走"
    ],
    "sampleSentence": "红灯停，绿灯行，过马路要走斑马线。"
  },
  {
    "id": "h_213",
    "char": "跑",
    "pinyin": "pǎo",
    "grade": "一年级下册",
    "category": "运动动作",
    "radical": "足",
    "strokeCount": 12,
    "meaning": "快速奔跑、奔腾",
    "words": [
      "跑步",
      "快跑",
      "长跑",
      "奔跑"
    ],
    "sampleSentence": "体育课上大家在跑道上欢快地跑步。"
  },
  {
    "id": "h_214",
    "char": "飞",
    "pinyin": "fēi",
    "grade": "一年级下册",
    "category": "运动动作",
    "radical": "飞",
    "strokeCount": 3,
    "meaning": "鸟类或飞机在空中飞行",
    "words": [
      "飞鸟",
      "飞机",
      "飞翔",
      "飞行"
    ],
    "sampleSentence": "雄鹰张开翅膀在天空中自由飞翔。"
  },
  {
    "id": "h_215",
    "char": "家",
    "pinyin": "jiā",
    "grade": "一年级下册",
    "category": "温馨家庭",
    "radical": "宀",
    "strokeCount": 10,
    "meaning": "家庭、房屋、家乡",
    "words": [
      "家庭",
      "回家",
      "大家",
      "家园"
    ],
    "sampleSentence": "鸟儿的家在树林，我们的家在大地。"
  },
  {
    "id": "h_216",
    "char": "爱",
    "pinyin": "ài",
    "grade": "一年级下册",
    "category": "情感道德",
    "radical": "爫",
    "strokeCount": 10,
    "meaning": "关爱、热爱、喜爱",
    "words": [
      "关爱",
      "热爱",
      "可爱",
      "爱心"
    ],
    "sampleSentence": "我们热爱祖国，热爱大自然。"
  },
  {
    "id": "h_217",
    "char": "心",
    "pinyin": "xīn",
    "grade": "一年级下册",
    "category": "情感道德",
    "radical": "心",
    "strokeCount": 4,
    "meaning": "心脏、心思、用心",
    "words": [
      "爱心",
      "用心",
      "开心",
      "小心"
    ],
    "sampleSentence": "做数学题要认真细心，不能马虎。"
  },
  {
    "id": "h_218",
    "char": "光",
    "pinyin": "guāng",
    "grade": "一年级下册",
    "category": "自然光景",
    "radical": "儿",
    "strokeCount": 6,
    "meaning": "光芒、光明、月光",
    "words": [
      "阳光",
      "月光",
      "光明",
      "明亮"
    ],
    "sampleSentence": "床前明月光，疑是地上霜。"
  },
  {
    "id": "h_219",
    "char": "明",
    "pinyin": "míng",
    "grade": "一年级下册",
    "category": "自然光景",
    "radical": "日",
    "strokeCount": 8,
    "meaning": "日月相合为明、明亮、明天",
    "words": [
      "明天",
      "明亮",
      "明白",
      "聪明"
    ],
    "sampleSentence": "日月明，田力男，小大尖。"
  },
  {
    "id": "h_220",
    "char": "书",
    "pinyin": "shū",
    "grade": "一年级下册",
    "category": "学习用具",
    "radical": "乛",
    "strokeCount": 4,
    "meaning": "书籍、书本、写字",
    "words": [
      "书本",
      "书包",
      "读书",
      "写字"
    ],
    "sampleSentence": "书籍是人类进步的阶梯。"
  },
  {
    "id": "h_301",
    "char": "海",
    "pinyin": "hǎi",
    "grade": "二年级上册",
    "category": "壮丽江海",
    "radical": "氵",
    "strokeCount": 10,
    "meaning": "大洋边缘的大片水域、辽阔",
    "words": [
      "大海",
      "海洋",
      "海水",
      "海鸥"
    ],
    "sampleSentence": "海鸥在大海的上空展翅高飞。"
  },
  {
    "id": "h_302",
    "char": "星",
    "pinyin": "xīng",
    "grade": "二年级上册",
    "category": "夜空星斗",
    "radical": "日",
    "strokeCount": 9,
    "meaning": "夜空中的恒星、光芒",
    "words": [
      "星星",
      "星空",
      "红星",
      "恒星"
    ],
    "sampleSentence": "夜空中的小星星就像无数闪烁的宝石。"
  },
  {
    "id": "h_303",
    "char": "歌",
    "pinyin": "gē",
    "grade": "二年级上册",
    "category": "艺术文化",
    "radical": "欠",
    "strokeCount": 14,
    "meaning": "歌曲、歌唱、诗歌",
    "words": [
      "歌唱",
      "唱歌",
      "儿歌",
      "国歌"
    ],
    "sampleSentence": "清晨同学们在教室里齐唱国歌。"
  },
  {
    "id": "h_304",
    "char": "树",
    "pinyin": "shù",
    "grade": "二年级上册",
    "category": "树之歌",
    "radical": "木",
    "strokeCount": 9,
    "meaning": "树木、植树",
    "words": [
      "树木",
      "大树",
      "植树",
      "松树"
    ],
    "sampleSentence": "杨树高，榕树壮，梧桐树叶像手掌。"
  },
  {
    "id": "h_305",
    "char": "杨",
    "pinyin": "yáng",
    "grade": "二年级上册",
    "category": "树之歌",
    "radical": "木",
    "strokeCount": 7,
    "meaning": "杨树、姓氏",
    "words": [
      "杨树",
      "白杨",
      "杨柳"
    ],
    "sampleSentence": "高大的白杨树像哨兵一样守卫在路旁。"
  },
  {
    "id": "h_306",
    "char": "松",
    "pinyin": "sōng",
    "grade": "二年级上册",
    "category": "树之歌",
    "radical": "木",
    "strokeCount": 8,
    "meaning": "松树、轻松、不紧",
    "words": [
      "松树",
      "松柏",
      "轻松",
      "松果"
    ],
    "sampleSentence": "松树四季披绿装，不怕严寒和冰霜。"
  },
  {
    "id": "h_307",
    "char": "柏",
    "pinyin": "bǎi",
    "grade": "二年级上册",
    "category": "树之歌",
    "radical": "木",
    "strokeCount": 9,
    "meaning": "柏树、常绿乔木",
    "words": [
      "柏树",
      "松柏",
      "翠柏"
    ],
    "sampleSentence": "烈士陵园里长满了苍翠的松柏。"
  },
  {
    "id": "h_308",
    "char": "桥",
    "pinyin": "qiáo",
    "grade": "二年级上册",
    "category": "建筑桥梁",
    "radical": "木",
    "strokeCount": 10,
    "meaning": "架在水上或空中的通道",
    "words": [
      "大桥",
      "石桥",
      "立交桥",
      "桥梁"
    ],
    "sampleSentence": "赵州桥是一座历史悠久的石拱桥。"
  },
  {
    "id": "h_309",
    "char": "船",
    "pinyin": "chuán",
    "grade": "二年级上册",
    "category": "交通运输",
    "radical": "舟",
    "strokeCount": 11,
    "meaning": "水上交通工具、帆船",
    "words": [
      "小船",
      "帆船",
      "轮船",
      "飞船"
    ],
    "sampleSentence": "弯弯的月儿小小的船，小小的船儿两头尖。"
  },
  {
    "id": "h_310",
    "char": "黄",
    "pinyin": "huáng",
    "grade": "二年级上册",
    "category": "名山奇景",
    "radical": "黄",
    "strokeCount": 11,
    "meaning": "黄色、黄山、黄河",
    "words": [
      "黄山",
      "黄河",
      "金黄",
      "黄色"
    ],
    "sampleSentence": "黄河之水天上来，奔流到海不复回。"
  },
  {
    "id": "h_311",
    "char": "楼",
    "pinyin": "lóu",
    "grade": "二年级上册",
    "category": "名篇诗词",
    "radical": "木",
    "strokeCount": 13,
    "meaning": "两层以上的房屋、楼阁",
    "words": [
      "高楼",
      "楼房",
      "更上一层楼",
      "鹳雀楼"
    ],
    "sampleSentence": "欲穷千里目，更上一层楼。"
  },
  {
    "id": "h_312",
    "char": "尽",
    "pinyin": "jìn",
    "grade": "二年级上册",
    "category": "名篇诗词",
    "radical": "尸",
    "strokeCount": 6,
    "meaning": "完、达到极限、竭尽",
    "words": [
      "尽头",
      "无尽",
      "尽力",
      "依山尽"
    ],
    "sampleSentence": "白日依山尽，黄河入海流。"
  },
  {
    "id": "h_313",
    "char": "每",
    "pinyin": "měi",
    "grade": "二年级上册",
    "category": "生活常用",
    "radical": "母",
    "strokeCount": 7,
    "meaning": "每一个、常常",
    "words": [
      "每天",
      "每次",
      "每人",
      "常常"
    ],
    "sampleSentence": "每天坚持阅读半小时，开卷有益。"
  },
  {
    "id": "h_314",
    "char": "步",
    "pinyin": "bù",
    "grade": "二年级上册",
    "category": "行动进步",
    "radical": "止",
    "strokeCount": 7,
    "meaning": "迈步、脚步、阶段",
    "words": [
      "脚步",
      "进步",
      "跑步",
      "散步"
    ],
    "sampleSentence": "不积跬步，无以至千里。"
  },
  {
    "id": "h_315",
    "char": "信",
    "pinyin": "xìn",
    "grade": "二年级上册",
    "category": "诚实品德",
    "radical": "亻",
    "strokeCount": 9,
    "meaning": "书信、信用、相信",
    "words": [
      "书信",
      "相信",
      "信任",
      "诚实"
    ],
    "sampleSentence": "人无信不立，我们要遵守诺言。"
  },
  {
    "id": "h_401",
    "char": "村",
    "pinyin": "cūn",
    "grade": "二年级下册",
    "category": "乡村诗韵",
    "radical": "木",
    "strokeCount": 7,
    "meaning": "村庄、乡村",
    "words": [
      "村庄",
      "农村",
      "乡村",
      "村居"
    ],
    "sampleSentence": "草长莺飞二月天，拂堤杨柳醉春烟。"
  },
  {
    "id": "h_402",
    "char": "居",
    "pinyin": "jū",
    "grade": "二年级下册",
    "category": "乡村诗韵",
    "radical": "尸",
    "strokeCount": 8,
    "meaning": "居住、住处、处在",
    "words": [
      "居住",
      "故居",
      "家居",
      "村居"
    ],
    "sampleSentence": "儿童散学归来早，忙趁东风放纸鸢。"
  },
  {
    "id": "h_403",
    "char": "诗",
    "pinyin": "shī",
    "grade": "二年级下册",
    "category": "经典古诗",
    "radical": "讠",
    "strokeCount": 8,
    "meaning": "古诗、诗歌、诗意",
    "words": [
      "古诗",
      "诗歌",
      "诗人",
      "写诗"
    ],
    "sampleSentence": "唐诗宋词是中华传统文化的瑰宝。"
  },
  {
    "id": "h_404",
    "char": "童",
    "pinyin": "tóng",
    "grade": "二年级下册",
    "category": "童心烂漫",
    "radical": "立",
    "strokeCount": 12,
    "meaning": "儿童、童年、童话",
    "words": [
      "儿童",
      "童年",
      "童话",
      "童心"
    ],
    "sampleSentence": "童年生活像一首首欢快动听的歌。"
  },
  {
    "id": "h_405",
    "char": "碧",
    "pinyin": "bì",
    "grade": "二年级下册",
    "category": "诗情画意",
    "radical": "石",
    "strokeCount": 14,
    "meaning": "青绿色的玉石、碧绿",
    "words": [
      "碧绿",
      "碧玉",
      "碧空",
      "碧波"
    ],
    "sampleSentence": "碧玉妆成一树高，万条垂下绿丝绦。"
  },
  {
    "id": "h_406",
    "char": "绿",
    "pinyin": "lǜ",
    "grade": "二年级下册",
    "category": "色彩生机",
    "radical": "纟",
    "strokeCount": 11,
    "meaning": "绿色、草木生机",
    "words": [
      "绿色",
      "绿水",
      "绿草",
      "碧绿"
    ],
    "sampleSentence": "不知细叶谁裁出，二月春风似剪刀。"
  },
  {
    "id": "h_407",
    "char": "剪",
    "pinyin": "jiǎn",
    "grade": "二年级下册",
    "category": "手巧动作",
    "radical": "刀",
    "strokeCount": 11,
    "meaning": "剪刀、裁剪、剪纸",
    "words": [
      "剪刀",
      "剪纸",
      "裁剪",
      "剪贴"
    ],
    "sampleSentence": "巧手的奶奶用剪刀剪出一只只小窗花。"
  },
  {
    "id": "h_408",
    "char": "神",
    "pinyin": "shén",
    "grade": "二年级下册",
    "category": "神州传统",
    "radical": "礻",
    "strokeCount": 9,
    "meaning": "神仙、神奇、神州大地",
    "words": [
      "神州",
      "神奇",
      "精神",
      "神秘"
    ],
    "sampleSentence": "我神州，称中华，山川美，可入画。"
  },
  {
    "id": "h_409",
    "char": "州",
    "pinyin": "zhōu",
    "grade": "二年级下册",
    "category": "神州传统",
    "radical": "川",
    "strokeCount": 6,
    "meaning": "古代行政区划、神州大地",
    "words": [
      "神州",
      "广州",
      "苏州",
      "中州"
    ],
    "sampleSentence": "黄河奔，长江涌，长城长，珠峰耸。"
  },
  {
    "id": "h_410",
    "char": "节",
    "pinyin": "jié",
    "grade": "二年级下册",
    "category": "传统节日",
    "radical": "艹",
    "strokeCount": 5,
    "meaning": "节日、骨节、节约",
    "words": [
      "节日",
      "春节",
      "端午节",
      "中秋节"
    ],
    "sampleSentence": "春节到，人欢笑，贴窗花，放鞭炮。"
  },
  {
    "id": "h_411",
    "char": "美",
    "pinyin": "měi",
    "grade": "二年级下册",
    "category": "美好品质",
    "radical": "八",
    "strokeCount": 9,
    "meaning": "美丽、美好、美食",
    "words": [
      "美丽",
      "美好",
      "美食",
      "美德"
    ],
    "sampleSentence": "祖国的山河处处风景如画，美不胜收。"
  },
  {
    "id": "h_412",
    "char": "食",
    "pinyin": "shí",
    "grade": "二年级下册",
    "category": "传统美食",
    "radical": "饣",
    "strokeCount": 9,
    "meaning": "食物、进食、饮食",
    "words": [
      "美食",
      "食物",
      "品尝",
      "粮食"
    ],
    "sampleSentence": "中国美食享誉全球，如烤鸭、饺子与火锅。"
  },
  {
    "id": "h_413",
    "char": "梦",
    "pinyin": "mèng",
    "grade": "二年级下册",
    "category": "彩色的梦",
    "radical": "木",
    "strokeCount": 11,
    "meaning": "梦境、梦想",
    "words": [
      "梦想",
      "梦境",
      "做梦",
      "美梦"
    ],
    "sampleSentence": "我有一大把彩色的梦，有的长，有的圆。"
  },
  {
    "id": "h_414",
    "char": "彩",
    "pinyin": "cǎi",
    "grade": "二年级下册",
    "category": "彩色的梦",
    "radical": "彡",
    "strokeCount": 11,
    "meaning": "色彩、五彩、精彩",
    "words": [
      "彩色",
      "彩虹",
      "精彩",
      "五彩"
    ],
    "sampleSentence": "雨后天空中架起了一道美丽的彩虹桥。"
  },
  {
    "id": "h_415",
    "char": "伞",
    "pinyin": "sǎn",
    "grade": "二年级下册",
    "category": "生活日常",
    "radical": "人",
    "strokeCount": 6,
    "meaning": "雨伞、遮阳伞",
    "words": [
      "雨伞",
      "跳伞",
      "阳伞",
      "伞柄"
    ],
    "sampleSentence": "下雨天大家撑起了五颜六色的小雨伞。"
  }
];
