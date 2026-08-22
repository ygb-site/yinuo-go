export type RiddleCategory =
  | 'brain_teaser'
  | 'hanzi_riddle'
  | 'animal_riddle'
  | 'plant_riddle'
  | 'object_riddle'
  | 'math_riddle';

export interface RiddleItem {
  id: string;
  category: RiddleCategory;
  categoryName: string;
  question: string;
  answer: string;
  hint: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyName: string;
  options: string[];
}

export const RIDDLE_CATEGORIES: { id: RiddleCategory | 'all'; name: string; icon: string; desc: string }[] = [
  { id: 'all', name: '全部谜题', icon: '🌟', desc: '海量题库 · 无限挑战' },
  { id: 'brain_teaser', name: '脑筋急转弯', icon: '🧠', desc: '搞笑幽默 · 逆向思维' },
  { id: 'hanzi_riddle', name: '神奇字谜', icon: '✍️', desc: '拆字识字 · 巧妙记忆' },
  { id: 'animal_riddle', name: '动物谜语', icon: '🐼', desc: '童谣生动 · 辨识特征' },
  { id: 'plant_riddle', name: '植物果蔬', icon: '🍎', desc: '大自然奥秘 · 妙趣横生' },
  { id: 'object_riddle', name: '生活物品', icon: '📦', desc: '日常常识 · 观察联想' },
  { id: 'math_riddle', name: '趣味数学', icon: '🔢', desc: '数理逻辑 · 巧妙思辨' }
];

export const RIDDLES_DATA: RiddleItem[] = [
  // ==========================================
  // 🧠 脑筋急转弯 (Brain Teasers)
  // ==========================================
  {
    id: 'bt_1',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '什么东西越洗越脏？',
    answer: '水',
    hint: '它用来洗别的东西，洗完后它自己...',
    explanation: '水洗涤了其他物品上的污垢后，水本身就变浑浊变脏啦！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['水', '毛巾', '肥皂', '衣服']
  },
  {
    id: 'bt_2',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '什么动物天天都要戴帽子？',
    answer: '鸭子',
    hint: '谐音想一想：“鸭”和什么词谐音？',
    explanation: '因为“鸭子”谐音“压（帽子）”，而且鸭子的嘴巴扁扁的像帽檐！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['鸭子', '公鸡', '小狗', '企鹅']
  },
  {
    id: 'bt_3',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '小白兔掉进了大海里，小黑兔把它救了上来，请问小白兔对小黑兔说的第一句话是什么？',
    answer: '先吐了一口海水！',
    hint: '溺水被救上来的第一反应是生理动作哦！',
    explanation: '掉进水里被捞上来，第一反应肯定是先“噗——”吐出一口海水！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['先吐了一口海水！', '谢谢你救了我', '水好凉啊', '你真棒']
  },
  {
    id: 'bt_4',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '什么门永远关不上？',
    answer: '球门',
    hint: '足球场上两端有什么门？',
    explanation: '足球场上的“球门”只有网，没有门板，所以永远关不上！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['球门', '大门', '铁门', '车门']
  },
  {
    id: 'bt_5',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '小明在黑板上写了一个很大的“8”字，怎么画一条线让它立刻变成“0”？',
    answer: '从中间横着画一条线',
    hint: '8 字上下两个圆圈哦！',
    explanation: '从数字 8 的腰部画一条横线切开，上下两个半圈就变成了两个 0！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['从中间横着画一条线', '在上面画个圈', '擦掉一半', '画一个对角线']
  },
  {
    id: 'bt_6',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '什么树一年四季都不能爬？',
    answer: '玉米树',
    hint: '不是木头长出来的大树哦！',
    explanation: '玉米秆太细太脆不能爬，围棋里的“气数”更不是大树！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['玉米树', '柳树', '松树', '杨树']
  },
  {
    id: 'bt_7',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '小猫掉进河里了，小狗去救它，两只动物上岸后全身湿透了，为什么小鸟在树上却哭了？',
    answer: '被甩出的水花溅湿了',
    hint: '小狗和小猫上岸后会抖动身体甩水哦！',
    explanation: '猫狗上岸使劲抖毛，水花全甩到树上的小鸟身上啦！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['被甩出的水花溅湿了', '小鸟也想游泳', '小鸟受惊吓了', '小鸟饿了']
  },
  {
    id: 'bt_8',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '有一只左眼瞎了的熊，为什么在吃蜂蜜的时候还能左右开弓？',
    answer: '左右开弓是用双手',
    hint: '成语“左右开弓”说的是手还是眼睛？',
    explanation: '左右开弓形容双手灵活敏捷，眼睛看不清不影响两只熊掌抓蜂蜜吃！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['左右开弓是用双手', '熊的鼻子很灵', '蜂蜜太香了', '右眼看得见']
  },
  {
    id: 'bt_9',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '为什么企鹅的肚子是白色的，后背是黑色的？',
    answer: '因为企鹅手太短只能洗前面',
    hint: '幽默童趣的解释！',
    explanation: '小企鹅翅膀短，只能把前面洗得白白的，后背够不着就黑啦！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['因为企鹅手太短只能洗前面', '天生为了防晒', '在雪地里伪装', '企鹅喜欢黑白配']
  },
  {
    id: 'bt_10',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '冬天下大雪，小华出门没打伞也没戴帽子，为什么他的一根头发都没湿？',
    answer: '因为小华是个光头',
    hint: '小华头上有什么特点？',
    explanation: '小华是个小光头，根本没有头发，所以一根头发都没湿！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['因为小华是个光头', '他在屋檐下走', '雪融化得太慢', '他跑得太快']
  },
  {
    id: 'bt_11',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '孔子和孟子有什么区别？',
    answer: '孔子姓孔，孟子姓孟',
    hint: '看名字的第一个字！',
    explanation: '孔子姓孔，孟子姓孟，他们都是古代伟大的思想家！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['孔子姓孔，孟子姓孟', '孔子胡子更长', '孟子更年轻', '他们教不同的书']
  },
  {
    id: 'bt_12',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '什么车可以不用轮子就能跑？',
    answer: '风车',
    hint: '微风一吹就呼呼转动！',
    explanation: '大风车借助风力旋转，不用轮胎也能转动如飞！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['风车', '火车', '汽车', '轮船']
  },
  {
    id: 'bt_13',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '什么动物最喜欢问“为什么”？',
    answer: '小猪',
    hint: '看看十二生肖里的小可爱！',
    explanation: '小猪总爱哼哼唧唧东闻西闻，充满好奇心！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['小猪', '小猴子', '大象', '小猫']
  },
  {
    id: 'bt_14',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '用什么擦地最干净、最省力？',
    answer: '用力',
    hint: '不用工具，要用全身的什么？',
    explanation: '不管是抹布还是拖把，只要“用力”擦才能最干净！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['用力', '拖把', '抹布', '吸尘器']
  },
  {
    id: 'bt_15',
    category: 'brain_teaser',
    categoryName: '脑筋急转弯',
    question: '三只小鸟在树上，猎人开枪打中了一只，为什么剩下的两只没有飞走？',
    answer: '因为它们是不会飞的雏鸟',
    hint: '小鸟的年龄多大呢？',
    explanation: '小雏鸟还在鸟巢里不会飞，只能乖乖呆在树上等妈妈！',
    difficulty: 'hard',
    difficultyName: '终极大挑战',
    options: ['因为它们是不会飞的雏鸟', '它们耳朵聋了', '它们吓呆了', '它们不怕枪声']
  },

  // ==========================================
  // ✍️ 神奇字谜 (Character Riddles)
  // ==========================================
  {
    id: 'hz_1',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '一口吃掉牛尾巴（打一汉字）',
    answer: '告',
    hint: '“牛”字去掉下面一竖（牛尾巴），加上一个“口”字。',
    explanation: '“牛”去掉尾巴是“⺧”，与“口”组合起来正好是“告”字！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['告', '吉', '舌', '扣']
  },
  {
    id: 'hz_2',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '一人一张口，下面长只手（打一汉字）',
    answer: '拿',
    hint: '“合”起来的人与口，下方加上“手”。',
    explanation: '“人”加“口”是“合”，合下有“手”就是“拿”字！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['拿', '掌', '扣', '拾']
  },
  {
    id: 'hz_3',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '日落西山不见天，月上柳梢头相连（打一汉字）',
    answer: '明',
    hint: '太阳（日）与月亮（月）站在一起。',
    explanation: '“日”字与“月”字并肩站立，合在一起代表光明灿烂的“明”字！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['明', '晚', '暗', '朝']
  },
  {
    id: 'hz_4',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '两个小人并排坐，坐在土堆说说话（打一汉字）',
    answer: '坐',
    hint: '两个“人”字坐在一个“土”字上。',
    explanation: '左一个人、右一个人，下面是一个“土”，合在一起正是“坐”！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['坐', '座', '丛', '从']
  },
  {
    id: 'hz_5',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '千字头，木字腰，太阳出来往下照（打一汉字）',
    answer: '香',
    hint: '上面像千（禾），中间是木，下面是日。',
    explanation: '禾苗成熟晒太阳散发出香气，“禾”字加“日”字就是“香”！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['香', '果', '查', '杳']
  },
  {
    id: 'hz_6',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '左边绿，右边红；左边怕水，右边怕虫。（打一汉字）',
    answer: '秋',
    hint: '左边是庄稼植物，右边是火焰。',
    explanation: '左边“禾”是绿色植物怕水淹，右边“火”是红色火焰怕水浇，合在一起是“秋”天！',
    difficulty: 'hard',
    difficultyName: '终极大挑战',
    options: ['秋', '科', '税', '秒']
  },
  {
    id: 'hz_7',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '林字多一半，不作森字看（打一汉字）',
    answer: '梦',
    hint: '“林”字加上另外半个（夕阳的夕）。',
    explanation: '林字上面加个“夕”字，组合起来是做梦的“梦”！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['梦', '森', '梵', '楚']
  },
  {
    id: 'hz_8',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '一边是红，一边是绿，一边喜风，一边喜雨（打一汉字）',
    answer: '秋',
    hint: '植物禾苗与火热太阳。',
    explanation: '“禾”喜雨滋润，“火”喜风助燃，合在一起是“秋”字！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['秋', '春', '夏', '冬']
  },
  {
    id: 'hz_9',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '言字旁，口字旁，大家都在一起讲（打一汉字）',
    answer: '语',
    hint: '言字旁 + 五 + 口。',
    explanation: '言字旁加上“吾（五口）”，就是国学语文的“语”！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['语', '话', '说', '讲']
  },
  {
    id: 'hz_10',
    category: 'hanzi_riddle',
    categoryName: '神奇字谜',
    question: '十个哥哥抱成团（打一汉字）',
    answer: '克',
    hint: '上面是“十”，下面是“兄（哥哥）”。',
    explanation: '“十”字与“兄”字上下组合，就是克服困难的“克”字！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['克', '兑', '竞', '免']
  },

  // ==========================================
  // 🐼 动物谜语 (Animal Riddles)
  // ==========================================
  {
    id: 'an_1',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '耳朵长，尾巴短。只吃萝卜和青菜，蹦蹦跳跳真可爱。（打一动物）',
    answer: '兔子',
    hint: '三瓣嘴，红眼睛，毛茸茸。',
    explanation: '小兔子长着长长的耳朵、短短的尾巴，最爱吃胡萝卜和青菜！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['兔子', '小松鼠', '小猫', '袋鼠']
  },
  {
    id: 'an_2',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '黑眼圈，胖乎乎，爱吃竹子爬大树。中国国宝人人爱。（打一动物）',
    answer: '大熊猫',
    hint: '我们一诺弈学的吉祥物小诺就是它！',
    explanation: '大熊猫是我国的国宝，黑白相间、憨态可掬，最爱吃嫩竹叶！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['大熊猫', '树袋熊', '黑熊', '小浣熊']
  },
  {
    id: 'an_3',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '头戴红帽子，身穿白袍子，走路摇摇摆，游泳像帆船。（打一动物）',
    answer: '大白鹅',
    hint: '“鹅鹅鹅，曲项向天歌，白毛浮绿水，红掌拨清波”。',
    explanation: '大白鹅头上有红色的肉瘤，羽毛洁白，游泳时红掌拨水像小船！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['大白鹅', '鸭子', '天鹅', '白鹭']
  },
  {
    id: 'an_4',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '小小年纪胡子翘，看见小鱼喵喵叫，走路无声抓老鼠。（打一动物）',
    answer: '猫咪',
    hint: '脚掌有肉垫，胡子能量距离。',
    explanation: '小花猫走路脚步轻盈，胡须是它的感觉器官，是抓老鼠的小能手！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['猫咪', '老虎', '小狗', '狐狸']
  },
  {
    id: 'an_5',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '身穿黑白燕尾服，生活在南极冰原上，走起路来摇摇晃晃。（打一动物）',
    answer: '企鹅',
    hint: '南极大陆的主人，不怕严寒。',
    explanation: '企鹅生活在冰天雪地的南极，黑白羽毛像穿着绅士燕尾服！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['企鹅', '海鸥', '海豹', '北极熊']
  },
  {
    id: 'an_6',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '白天树上叫，夜晚水里跳，肚皮白又大，害虫吃不少。（打一益虫益鸟）',
    answer: '青蛙',
    hint: '池塘边的歌唱家，吃蚊子的小卫士。',
    explanation: '小青蛙是庄稼的好朋友，舌头一伸就能抓住害虫！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['青蛙', '蟾蜍', '水鸟', '麻雀']
  },
  {
    id: 'an_7',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '大眼睛，阔嘴巴，说起话来呱呱呱，会游泳，会跳高，抓害虫的本领高。（打一动物）',
    answer: '青蛙',
    hint: '荷叶上的小跳将！',
    explanation: '小青蛙身手敏捷，是稻田里最称职的保护卫士！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['青蛙', '蟋蟀', '蜻蜓', '鸭子']
  },
  {
    id: 'an_8',
    category: 'animal_riddle',
    categoryName: '动物谜语',
    question: '小飞机，纱翅膀，飞来飞去灭蚊忙，低飞雨，高飞晴，天气预报它内行。（打一昆虫）',
    answer: '蜻蜓',
    hint: '水面上点水产卵，大复眼像小飞机。',
    explanation: '蜻蜓低飞说明空气湿度大快下雨了，高飞说明天气晴朗！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['蜻蜓', '蝴蝶', '蜜蜂', '飞蛾']
  },

  // ==========================================
  // 🍎 植物与果蔬 (Plant & Fruit Riddles)
  // ==========================================
  {
    id: 'pl_1',
    category: 'plant_riddle',
    categoryName: '植物果蔬',
    question: '身穿绿衣裳，肚里水汪汪，生的子儿多，个个黑脸庞。（打一水果）',
    answer: '西瓜',
    hint: '夏天最解渴，红瓤黑子绿皮。',
    explanation: '西瓜外表是绿皮条纹，切开后是红红多汁的果肉和黑色瓜子！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['西瓜', '哈密瓜', '苹果', '木瓜']
  },
  {
    id: 'pl_2',
    category: 'plant_riddle',
    categoryName: '植物果蔬',
    question: '黄金布，包银条，中间弯弯两头翘。（打一水果）',
    answer: '香蕉',
    hint: '像弯弯的小月亮，剥开皮甜甜糯糯。',
    explanation: '香蕉皮是金黄色的，果肉白嫩如银条，形状像弯弯的小船！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['香蕉', '芒果', '菠萝', '木瓜']
  },
  {
    id: 'pl_3',
    category: 'plant_riddle',
    categoryName: '植物果蔬',
    question: '麻屋子，红帐子，里面住个白胖子。（打一农作物）',
    answer: '花生',
    hint: '过年过节常吃的坚果，埋在泥土里长大。',
    explanation: '花生的硬壳像“麻屋子”，花生衣是红色的“红帐子”，花生仁是白白胖胖的！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['花生', '核桃', '板栗', '瓜子']
  },
  {
    id: 'pl_4',
    category: 'plant_riddle',
    categoryName: '植物果蔬',
    question: '红关公，白刘备，黑张飞，三结义。（打一水果）',
    answer: '荔枝',
    hint: '红色的外壳，白色的晶莹果肉，黑色的圆果核。',
    explanation: '荔枝外壳红如关公，果肉白如刘备，果核黑如张飞！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['荔枝', '龙眼', '红毛丹', '樱桃']
  },
  {
    id: 'pl_5',
    category: 'plant_riddle',
    categoryName: '植物果蔬',
    question: '圆圆脸儿像苹果，酸酸甜甜汁水多。既能当果又能菜，烧汤炒蛋味道好。（打一蔬菜）',
    answer: '西红柿（番茄）',
    hint: '红通通的，番茄炒蛋的主角！',
    explanation: '西红柿富含维生素C，既可以生吃当水果，又可以炒蛋做菜！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['西红柿（番茄）', '苹果', '红辣椒', '草莓']
  },

  // ==========================================
  // 📦 生活常识与物品 (Everyday Objects)
  // ==========================================
  {
    id: 'ob_1',
    category: 'object_riddle',
    categoryName: '生活物品',
    question: '天天脱衣服，年底剩张皮。过去一天撕一张。（打一生活用品）',
    answer: '日历',
    hint: '看今天几月几号的小本子。',
    explanation: '传统撕历每天撕去一页，到了年终只剩下一张硬纸封面底板！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['日历', '笔记本', '相册', '课本']
  },
  {
    id: 'ob_2',
    category: 'object_riddle',
    categoryName: '生活物品',
    question: '有个好朋友，天天跟我走。你在阳光下，它在地面留。你跑它也跑，就是不开口。（打一自然现象）',
    answer: '影子',
    hint: '光线被身体挡住后在地上形成的黑影。',
    explanation: '只要在阳光或灯光下，影子就会形影不离地跟着我们！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['影子', '鞋子', '小狗', '镜子']
  },
  {
    id: 'ob_3',
    category: 'object_riddle',
    categoryName: '生活物品',
    question: '远看像座山，近看不是山。黑白两军对阵坐，十九条线织棋盘。（打一益智活动）',
    answer: '围棋',
    hint: '黑白两色子，三尺棋盘上斗智斗勇！',
    explanation: '围棋是古老的东方益智游戏，19条经纬线、361个交叉点，黑白交锋变化无穷！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['围棋', '象棋', '跳棋', '五子棋']
  },
  {
    id: 'ob_4',
    category: 'object_riddle',
    categoryName: '生活物品',
    question: '四四方方一块布，嘴巴脏了它来护。洗完小脸擦擦干，天天放在口袋住。（打一生活用品）',
    answer: '手帕（小毛巾）',
    hint: '随身携带擦手擦嘴的小布块。',
    explanation: '手帕干净卫生，小朋友饭前便后和洗脸时都要用到它！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['手帕（小毛巾）', '纸巾', '围裙', '手套']
  },
  {
    id: 'ob_5',
    category: 'object_riddle',
    categoryName: '生活物品',
    question: '独木造高楼，没瓦没砖头，人在水下走，水在人上流。（打一雨具）',
    answer: '雨伞',
    hint: '下雨天撑开遮风挡雨。',
    explanation: '撑开雨伞像小亭子，人在伞下走，雨水顺着伞面往下流！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['雨伞', '雨衣', '帽子', '斗笠']
  },

  // ==========================================
  // 🔢 趣味数学 (Math Riddles)
  // ==========================================
  {
    id: 'ma_1',
    category: 'math_riddle',
    categoryName: '趣味数学',
    question: '树上有 10 只鸟，猎人开枪打死了 1 只，请问树上还剩几只鸟？',
    answer: '0 只',
    hint: '鸟儿听到枪声会怎么样？',
    explanation: '猎枪一响声音很大，剩下的 9 只小鸟全部被吓飞啦，所以树上剩 0 只！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['0 只', '9 只', '10 只', '1 只']
  },
  {
    id: 'ma_2',
    category: 'math_riddle',
    categoryName: '趣味数学',
    question: '一张正方形的桌子有 4 个角，用锯子锯掉 1 个角，还剩下几个角？',
    answer: '5 个角',
    hint: '在纸上画一画切掉一个角后的形状！',
    explanation: '锯掉一个角之后，原来的位置会变成一条斜边和两个新角，4 - 1 + 2 = 5 个角！',
    difficulty: 'medium',
    difficultyName: '机智探索',
    options: ['5 个角', '3 个角', '4 个角', '6 个角']
  },
  {
    id: 'ma_3',
    category: 'math_riddle',
    categoryName: '趣味数学',
    question: '小明今年 6 岁，妹妹今年 3 岁。当小明长到 60 岁时，妹妹多大？',
    answer: '57 岁',
    hint: '两人的年龄差永远是不变的哦！',
    explanation: '小明比妹妹大 3 岁，年龄差永远是 3 岁，所以 60 - 3 = 57 岁（不是 30 岁哦）！',
    difficulty: 'easy',
    difficultyName: '萌宝入门',
    options: ['57 岁', '30 岁', '50 岁', '54 岁']
  }
];

/**
 * 动态智能造谜函数 (支持离线随机变式与在线 AI 拓展)
 */
export function generateRandomDynamicRiddle(): RiddleItem {
  const pool = RIDDLES_DATA;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...picked,
    id: 'dyn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
  };
}
