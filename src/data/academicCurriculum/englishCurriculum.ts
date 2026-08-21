import type { UniversalChapter } from '../../types/curriculum';

export const ENGLISH_CHAPTERS: UniversalChapter[] = [
  // =========================================================
  // 🎒 一年级上册 (小学英语同步)
  // =========================================================
  {
    id: 101,
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: 'Unit 1: Hello & Greetings (问候与打招呼)',
    subtitle: 'Hello, Hi, Good morning, Goodbye & Self-introduction',
    icon: '👋',
    badge: '一年级上册',
    themeGradient: 'from-purple-500 to-pink-600',
    description: '学习最地道的日常英文打招呼、自我介绍与告别礼貌用语。',
    lessons: [
      {
        id: 'eng_g1t1_l1',
        subjectId: 'english',
        gradeLevel: 'g1_t1',
        chapterId: 101,
        chapterTitle: 'Unit 1: Hello & Greetings',
        chapterIcon: '👋',
        title: 'Hello! I am NuoNuo.',
        subtitle: '学会向新朋友用英文问好与介绍自己的名字',
        icon: '🐼',
        badge: 'Greetings',
        summary: '掌握 Hello / Hi / Good morning / Goodbye 基本句型。',
        knowledgePointId: 'english.g1.vocab.greetings',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'eg1t1_1_s1',
            type: 'single_choice',
            knowledgePointId: 'english.g1.vocab.greetings',
            difficulty: 1,
            title: '早上好用英语怎么说？',
            subtitle: '选择正确的问候语',
            promptText: '早上在学校见到老师和小伙伴，应该怎么打招呼？',
            promptVoice: 'Good morning! 早上好用英语怎么说呢？',
            hint: 'Morning 是早晨，Good morning 是早上好！',
            explanation: 'Good morning 用于早晨问候。',
            options: [
              { id: 'opt_gm', text: '☀️ Good morning', subText: '早上好' },
              { id: 'opt_gn', text: '🌙 Good night', subText: '晚安' },
              { id: 'opt_gb', text: '👋 Goodbye', subText: '再见' }
            ],
            correctOptionIds: ['opt_gm']
          },
          {
            id: 'eg1t1_1_s2',
            type: 'drag_match',
            knowledgePointId: 'english.g1.vocab.greetings',
            difficulty: 1,
            title: '日常英语连连看',
            subtitle: '将英文日常短语与中文意思配对',
            promptText: '请将日常英语短语与对应的中文意思配对：',
            promptVoice: '请把英文短语和中文意思连起来。',
            hint: 'Hello 是你好，Goodbye 是再见，Thank you 是谢谢！',
            explanation: 'Hello-你好, Goodbye-再见, Thank you-谢谢。',
            pairs: [
              { id: 'p1', left: { text: 'Hello!' }, right: { text: '你好！' } },
              { id: 'p2', left: { text: 'Goodbye!' }, right: { text: '再见！' } },
              { id: 'p3', left: { text: 'Thank you!' }, right: { text: '谢谢你！' } }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 102,
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: 'Unit 2: Colors & Magic Rainbow (色彩魔法)',
    subtitle: 'Red, Blue, Yellow, Green, Pink, Purple, Orange',
    icon: '🎨',
    badge: '一年级上册',
    themeGradient: 'from-pink-500 to-rose-600',
    description: '通过绚丽的彩虹与水果，掌握 7 种基础颜色的英文表达。',
    lessons: [
      {
        id: 'eng_g1t1_l2',
        subjectId: 'english',
        gradeLevel: 'g1_t1',
        chapterId: 102,
        chapterTitle: 'Unit 2: Colors & Magic Rainbow',
        chapterIcon: '🎨',
        title: 'Colors Around Us (身边的色彩)',
        subtitle: 'I see red, I see blue, I see yellow.',
        icon: '🌈',
        badge: 'Colors',
        summary: '熟练辨识红、黄、蓝、绿四种主色调英文。',
        knowledgePointId: 'english.g1.vocab.colors',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'eg1t1_2_s1',
            type: 'single_choice',
            knowledgePointId: 'english.g1.vocab.colors',
            difficulty: 1,
            title: '天空是什么颜色的？',
            subtitle: '选择 Blue (蓝色)',
            promptText: '晴朗的天空是蔚蓝色的，"蓝色"的英文是哪个单词？',
            promptVoice: 'The sky is blue! 蓝色的英文是什么？',
            hint: 'B-L-U-E spells Blue (蓝色)。',
            explanation: 'Blue 是蓝色。',
            options: [
              { id: 'opt_red', text: '🔴 Red', subText: '红色' },
              { id: 'opt_blue', text: '🔵 Blue', subText: '蓝色' },
              { id: 'opt_yellow', text: '🟡 Yellow', subText: '黄色' }
            ],
            correctOptionIds: ['opt_blue']
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 一年级下册
  // =========================================================
  {
    id: 103,
    subjectId: 'english',
    gradeLevel: 'g1_t2',
    unitNumber: 1,
    title: 'Unit 1: Numbers 1–10 (快乐数数)',
    subtitle: 'One, two, three … How many?',
    icon: '🔢',
    badge: '一年级下册',
    themeGradient: 'from-indigo-500 to-violet-600',
    description: '学会用英语数 1 到 10，并用 How many 问数量。',
    lessons: [
      {
        id: 'eng_g1t2_l1',
        subjectId: 'english',
        gradeLevel: 'g1_t2',
        chapterId: 103,
        chapterTitle: 'Unit 1: Numbers 1–10',
        chapterIcon: '🔢',
        title: 'Count from one to ten',
        subtitle: 'one two three four five',
        icon: '🖐️',
        badge: 'Numbers',
        summary: '听懂并说出 one 到 ten。',
        knowledgePointId: 'english.g1.vocab.numbers',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'eg1t2_1_s1',
            type: 'single_choice',
            knowledgePointId: 'english.g1.vocab.numbers',
            difficulty: 1,
            title: '3 用英语怎么说？',
            subtitle: '选择 three',
            promptText: '伸出 3 根手指，用英语数一数是哪个单词？',
            promptVoice: 'How do you say 3 in English? Three!',
            hint: 'th 开头，读作 three。',
            explanation: '3 的英文是 three。',
            options: [
              { id: 'opt_two', text: 'two', subText: '2' },
              { id: 'opt_three', text: 'three', subText: '3' },
              { id: 'opt_five', text: 'five', subText: '5' }
            ],
            correctOptionIds: ['opt_three']
          },
          {
            id: 'eg1t2_1_s2',
            type: 'drag_match',
            knowledgePointId: 'english.g1.vocab.numbers',
            difficulty: 1,
            title: '数字连连看',
            subtitle: '英文数字配阿拉伯数字',
            promptText: '请把英文数字和阿拉伯数字配对：',
            promptVoice: 'Match the numbers.',
            hint: 'one 是 1，five 是 5，ten 是 10。',
            explanation: 'one-1, five-5, ten-10。',
            pairs: [
              { id: 'p1', left: { text: 'one' }, right: { text: '1' } },
              { id: 'p2', left: { text: 'five' }, right: { text: '5' } },
              { id: 'p3', left: { text: 'ten' }, right: { text: '10' } }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 104,
    subjectId: 'english',
    gradeLevel: 'g1_t2',
    unitNumber: 2,
    title: 'Unit 2: Animals (可爱动物)',
    subtitle: 'cat, dog, bird, fish, panda',
    icon: '🐾',
    badge: '一年级下册',
    themeGradient: 'from-emerald-500 to-teal-600',
    description: '认识常见小动物的英文名字，能说 I like cats.',
    lessons: [
      {
        id: 'eng_g1t2_l2',
        subjectId: 'english',
        gradeLevel: 'g1_t2',
        chapterId: 104,
        chapterTitle: 'Unit 2: Animals',
        chapterIcon: '🐾',
        title: 'I like animals',
        subtitle: 'cat dog bird fish',
        icon: '🐼',
        badge: 'Animals',
        summary: '听辨常见动物单词。',
        knowledgePointId: 'english.g1.vocab.animals',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'eg1t2_2_s1',
            type: 'single_choice',
            knowledgePointId: 'english.g1.vocab.animals',
            difficulty: 1,
            title: '小狗用英语怎么说？',
            subtitle: '选择 dog',
            promptText: '汪汪叫的小动物，英文是哪个单词？',
            promptVoice: 'Woof woof! What is dog in English?',
            hint: 'd 开头，三个字母。',
            explanation: '小狗是 dog。',
            options: [
              { id: 'opt_cat', text: '🐱 cat', subText: '猫' },
              { id: 'opt_dog', text: '🐶 dog', subText: '狗' },
              { id: 'opt_bird', text: '🐦 bird', subText: '鸟' }
            ],
            correctOptionIds: ['opt_dog']
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 二年级上册 (小学英语进阶与自然拼读)
  // =========================================================
  {
    id: 201,
    subjectId: 'english',
    gradeLevel: 'g2_t1',
    unitNumber: 1,
    title: 'Unit 1: Phonics Short Vowels (短元音 CVC 拼读)',
    subtitle: 'Short a, e, i, o, u: Cat, Bed, Pig, Dog, Sun',
    icon: '🐱',
    badge: '二年级上册',
    themeGradient: 'from-violet-600 to-purple-700',
    description: '掌握辅音+元音+辅音（CVC）短元音拼读魔法，见词能读，听音能写。',
    lessons: [
      {
        id: 'eng_g2t1_l1',
        subjectId: 'english',
        gradeLevel: 'g2_t1',
        chapterId: 201,
        chapterTitle: 'Unit 1: Phonics Short Vowels',
        chapterIcon: '🐱',
        title: 'Short /æ/ sound in CAT',
        subtitle: 'C-A-T Cat, B-A-T Bat, H-A-T Hat',
        icon: '🎩',
        badge: 'Short a',
        summary: '掌握短元音 /æ/ 的拼读组合 -at。',
        knowledgePointId: 'english.g1.phonics.short_vowels',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'eg2t1_1_s1',
            type: 'fill_blank',
            knowledgePointId: 'english.g1.phonics.short_vowels',
            difficulty: 2,
            title: '拼写小猫的名字',
            subtitle: '补全单词 CAT',
            promptText: '可爱的小猫咪想要拼出自己的名字：[?] A T (猫咪)',
            promptVoice: 'What is the first letter in CAT? C-A-T Cat!',
            hint: '第一个字母是 C，发音为 /k/。',
            explanation: 'C + A + T = CAT。',
            template: '[?] A T',
            correctAnswers: ['C'],
            optionsPool: ['B', 'C', 'D', 'H'],
            keypadType: 'alphabet'
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 二年级下册
  // =========================================================
  {
    id: 202,
    subjectId: 'english',
    gradeLevel: 'g2_t2',
    unitNumber: 1,
    title: 'Unit 1: Weather (今天天气怎么样)',
    subtitle: 'sunny, rainy, cloudy, windy',
    icon: '🌤️',
    badge: '二年级下册',
    themeGradient: 'from-sky-500 to-blue-600',
    description: '用 It is sunny. 描述天气，听懂简单天气词。',
    lessons: [
      {
        id: 'eng_g2t2_l1',
        subjectId: 'english',
        gradeLevel: 'g2_t2',
        chapterId: 202,
        chapterTitle: 'Unit 1: Weather',
        chapterIcon: '🌤️',
        title: 'How is the weather?',
        subtitle: 'It is sunny / rainy / cloudy.',
        icon: '☀️',
        badge: 'Weather',
        summary: '掌握四种常见天气表达。',
        knowledgePointId: 'english.g2.vocab.weather',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'eg2t2_1_s1',
            type: 'single_choice',
            knowledgePointId: 'english.g2.vocab.weather',
            difficulty: 2,
            title: '下雨天怎么说？',
            subtitle: '选择 rainy',
            promptText: '窗外下着大雨，应该说 It is _____ .',
            promptVoice: 'It is raining. Rainy or sunny?',
            hint: 'rain 是雨，rainy 是下雨的。',
            explanation: '下雨天说 It is rainy.',
            options: [
              { id: 'opt_sunny', text: '☀️ sunny', subText: '晴朗的' },
              { id: 'opt_rainy', text: '🌧️ rainy', subText: '下雨的' },
              { id: 'opt_windy', text: '💨 windy', subText: '有风的' }
            ],
            correctOptionIds: ['opt_rainy']
          },
          {
            id: 'eg2t2_1_s2',
            type: 'drag_match',
            knowledgePointId: 'english.g2.vocab.weather',
            difficulty: 2,
            title: '天气连连看',
            subtitle: '英文天气词配中文',
            promptText: '请把天气单词和中文意思配对：',
            promptVoice: 'Match the weather words.',
            hint: 'sun 是太阳，cloud 是云。',
            explanation: 'sunny-晴朗, cloudy-多云, windy-有风。',
            pairs: [
              { id: 'p1', left: { text: 'sunny' }, right: { text: '晴朗的' } },
              { id: 'p2', left: { text: 'cloudy' }, right: { text: '多云的' } },
              { id: 'p3', left: { text: 'windy' }, right: { text: '有风的' } }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 203,
    subjectId: 'english',
    gradeLevel: 'g2_t2',
    unitNumber: 2,
    title: 'Unit 2: Clothes (穿什么衣服)',
    subtitle: 'shirt, dress, shoes, hat',
    icon: '👗',
    badge: '二年级下册',
    themeGradient: 'from-fuchsia-500 to-pink-600',
    description: '认识常见衣服，能听懂 Put on your hat.',
    lessons: [
      {
        id: 'eng_g2t2_l2',
        subjectId: 'english',
        gradeLevel: 'g2_t2',
        chapterId: 203,
        chapterTitle: 'Unit 2: Clothes',
        chapterIcon: '👗',
        title: 'Put on your hat',
        subtitle: 'shirt dress shoes hat',
        icon: '🧢',
        badge: 'Clothes',
        summary: '听辨常见服装单词。',
        knowledgePointId: 'english.g2.vocab.clothes',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'eg2t2_2_s1',
            type: 'single_choice',
            knowledgePointId: 'english.g2.vocab.clothes',
            difficulty: 2,
            title: '帽子用英语怎么说？',
            subtitle: '选择 hat',
            promptText: '冬天戴在头上的是什么？英文怎么说？',
            promptVoice: 'What do you wear on your head? Hat!',
            hint: '三个字母，h 开头。',
            explanation: '帽子是 hat。',
            options: [
              { id: 'opt_hat', text: '🧢 hat', subText: '帽子' },
              { id: 'opt_shoes', text: '👟 shoes', subText: '鞋子' },
              { id: 'opt_shirt', text: '👕 shirt', subText: '衬衫' }
            ],
            correctOptionIds: ['opt_hat']
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 三年级上册
  // =========================================================
  {
    id: 301,
    subjectId: 'english',
    gradeLevel: 'g3_t1',
    unitNumber: 1,
    title: 'Unit 1: School & Friends (校园与朋友)',
    subtitle: 'school, friend, classroom, This is my friend.',
    icon: '🏫',
    badge: '三年级上册',
    themeGradient: 'from-purple-600 to-indigo-700',
    description: '介绍学校和朋友，使用 This is my friend. 等句型。',
    lessons: [
      {
        id: 'eng_g3t1_l1',
        subjectId: 'english',
        gradeLevel: 'g3_t1',
        chapterId: 301,
        chapterTitle: 'Unit 1: School & Friends',
        chapterIcon: '🏫',
        title: 'This is my friend',
        subtitle: 'school friend happy',
        icon: '🤝',
        badge: 'Friends',
        summary: '能介绍朋友和学校。',
        knowledgePointId: 'english.g3.vocab.school',
        rewards: { stars: 3, coins: 70, exp: 140 },
        steps: [
          {
            id: 'eg3t1_1_s1',
            type: 'single_choice',
            knowledgePointId: 'english.g3.vocab.school',
            difficulty: 2,
            title: '朋友用英语怎么说？',
            subtitle: '选择 friend',
            promptText: '好朋友的英文是哪个单词？',
            promptVoice: 'A good friend is like sunshine. Friend!',
            hint: 'fr 开头。',
            explanation: '朋友是 friend。',
            options: [
              { id: 'opt_school', text: '🏫 school', subText: '学校' },
              { id: 'opt_friend', text: '🤝 friend', subText: '朋友' },
              { id: 'opt_happy', text: '😄 happy', subText: '开心的' }
            ],
            correctOptionIds: ['opt_friend']
          },
          {
            id: 'eg3t1_1_s2',
            type: 'fill_blank',
            knowledgePointId: 'english.g3.vocab.school',
            difficulty: 2,
            title: '补全介绍句',
            subtitle: 'This is my _____ .',
            promptText: '向老师介绍好朋友，可以说：This is my [?] .',
            promptVoice: 'This is my friend.',
            hint: 'friend 是朋友。',
            explanation: 'This is my friend. 用来介绍朋友。',
            template: 'This is my [?].',
            correctAnswers: ['friend'],
            optionsPool: ['friend', 'school', 'apple', 'cat'],
            keypadType: 'alphabet'
          }
        ]
      }
    ]
  }
];

