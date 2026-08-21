import type { VocabularyItem, GradeLevel } from '../types/curriculum';

export const ENGLISH_VOCABULARY_REPOSITORY: VocabularyItem[] = [
  // =========================================================
  // 🎒 一年级上册 (Grade 1 Term 1)
  // =========================================================
  {
    id: 'vocab_g1_apple',
    word: 'apple',
    phonetic: '/ˈæpl/',
    meaning: '苹果',
    partOfSpeech: 'n.',
    grade: 'g1_t1',
    unit: 1,
    category: '水果 Fruits',
    phonicsRule: '短元音 a 发 /æ/ 音',
    exampleEn: 'I like red apples.',
    exampleCn: '我喜欢红苹果。',
    icon: '🍎',
    knowledgePointId: 'english.g1.vocab.colors',
    difficulty: 1
  },
  {
    id: 'vocab_g1_book',
    word: 'book',
    phonetic: '/bʊk/',
    meaning: '书本',
    partOfSpeech: 'n.',
    grade: 'g1_t1',
    unit: 1,
    category: '文具 School Supplies',
    phonicsRule: '双元音 oo 发短音 /ʊ/',
    exampleEn: 'Open your English book.',
    exampleCn: '打开你的英语书。',
    icon: '📖',
    knowledgePointId: 'english.g1.vocab.greetings',
    difficulty: 1
  },
  {
    id: 'vocab_g1_cat',
    word: 'cat',
    phonetic: '/kæt/',
    meaning: '猫咪',
    partOfSpeech: 'n.',
    grade: 'g1_t1',
    unit: 2,
    category: '动物 Animals',
    phonicsRule: '标准 CVC 辅元辅拼读 /k/-/æ/-/t/',
    exampleEn: 'The cat is very cute.',
    exampleCn: '这只小猫非常可爱。',
    icon: '🐱',
    knowledgePointId: 'english.g1.vocab.animals',
    difficulty: 1
  },
  {
    id: 'vocab_g1_dog',
    word: 'dog',
    phonetic: '/dɒɡ/',
    meaning: '小狗',
    partOfSpeech: 'n.',
    grade: 'g1_t1',
    unit: 2,
    category: '动物 Animals',
    phonicsRule: '短元音 o 发 /ɒ/ 音',
    exampleEn: 'My dog can run fast.',
    exampleCn: '我的小狗跑得很快。',
    icon: '🐶',
    knowledgePointId: 'english.g1.vocab.animals',
    difficulty: 1
  },
  {
    id: 'vocab_g1_red',
    word: 'red',
    phonetic: '/red/',
    meaning: '红色的',
    partOfSpeech: 'adj.',
    grade: 'g1_t1',
    unit: 3,
    category: '色彩 Colors',
    phonicsRule: '短元音 e 发 /e/ 音',
    exampleEn: 'This balloon is red.',
    exampleCn: '这个气球是红色的。',
    icon: '🔴',
    knowledgePointId: 'english.g1.vocab.colors',
    difficulty: 1
  },
  {
    id: 'vocab_g1_blue',
    word: 'blue',
    phonetic: '/bluː/',
    meaning: '蓝色的',
    partOfSpeech: 'adj.',
    grade: 'g1_t1',
    unit: 3,
    category: '色彩 Colors',
    phonicsRule: '辅音连缀 bl + ue /uː/',
    exampleEn: 'The sky is deep blue.',
    exampleCn: '天空是蔚蓝色的。',
    icon: '🔵',
    knowledgePointId: 'english.g1.vocab.colors',
    difficulty: 1
  },
  {
    id: 'vocab_g1_yellow',
    word: 'yellow',
    phonetic: '/ˈjeləʊ/',
    meaning: '黄色的',
    partOfSpeech: 'adj.',
    grade: 'g1_t1',
    unit: 3,
    category: '色彩 Colors',
    phonicsRule: '首字母 y 发半元音 /j/',
    exampleEn: 'The sun is bright and yellow.',
    exampleCn: '太阳明亮且金黄。',
    icon: '🟡',
    knowledgePointId: 'english.g1.vocab.colors',
    difficulty: 1
  },
  {
    id: 'vocab_g1_green',
    word: 'green',
    phonetic: '/ɡriːn/',
    meaning: '绿色的',
    partOfSpeech: 'adj.',
    grade: 'g1_t1',
    unit: 3,
    category: '色彩 Colors',
    phonicsRule: '双元音 ee 发长音 /iː/',
    exampleEn: 'Grass is fresh and green.',
    exampleCn: '青草新鲜翠绿。',
    icon: '🟢',
    knowledgePointId: 'english.g1.vocab.colors',
    difficulty: 1
  },

  // =========================================================
  // 🎒 一年级下册 (Grade 1 Term 2)
  // =========================================================
  {
    id: 'vocab_g1t2_panda',
    word: 'panda',
    phonetic: '/ˈpændə/',
    meaning: '大熊猫',
    partOfSpeech: 'n.',
    grade: 'g1_t2',
    unit: 1,
    category: '动物 Animals',
    phonicsRule: '双音节 pan-da',
    exampleEn: 'The panda eats bamboo happily.',
    exampleCn: '大熊猫开心地吃竹子。',
    icon: '🐼',
    knowledgePointId: 'english.g1.vocab.animals',
    difficulty: 2
  },
  {
    id: 'vocab_g1t2_tiger',
    word: 'tiger',
    phonetic: '/ˈtaɪɡə(r)/',
    meaning: '老虎',
    partOfSpeech: 'n.',
    grade: 'g1_t2',
    unit: 1,
    category: '动物 Animals',
    phonicsRule: '开音节 ti-ger 元音 i 发 /aɪ/',
    exampleEn: 'The tiger is the king of the forest.',
    exampleCn: '老虎是森林之王。',
    icon: '🐯',
    knowledgePointId: 'english.g1.vocab.animals',
    difficulty: 2
  },
  {
    id: 'vocab_g1t2_water',
    word: 'water',
    phonetic: '/ˈwɔːtə(r)/',
    meaning: '水 / 喝水',
    partOfSpeech: 'n.',
    grade: 'g1_t2',
    unit: 2,
    category: '饮食 Food & Drink',
    phonicsRule: '元音组合 a 发 /ɔː/',
    exampleEn: 'Please drink some clean water.',
    exampleCn: '请喝一些干净的水。',
    icon: '💧',
    knowledgePointId: 'english.g1.vocab.greetings',
    difficulty: 1
  },
  {
    id: 'vocab_g1t2_milk',
    word: 'milk',
    phonetic: '/mɪlk/',
    meaning: '牛奶',
    partOfSpeech: 'n.',
    grade: 'g1_t2',
    unit: 2,
    category: '饮食 Food & Drink',
    phonicsRule: '短元音 i 发 /ɪ/ 音',
    exampleEn: 'A cup of warm milk for breakfast.',
    exampleCn: '早餐喝一杯热牛奶。',
    icon: '🥛',
    knowledgePointId: 'english.g1.vocab.greetings',
    difficulty: 1
  },

  // =========================================================
  // 🎒 二年级上册 (Grade 2 Term 1)
  // =========================================================
  {
    id: 'vocab_g2_father',
    word: 'father',
    phonetic: '/ˈfɑːðə(r)/',
    meaning: '父亲，爸爸',
    partOfSpeech: 'n.',
    grade: 'g2_t1',
    unit: 1,
    category: '家庭 Family',
    phonicsRule: 'th 发浊辅音 /ð/',
    exampleEn: 'My father is tall and strong.',
    exampleCn: '我的爸爸又高又强壮。',
    icon: '👨',
    knowledgePointId: 'english.g2.vocab.family',
    difficulty: 2
  },
  {
    id: 'vocab_g2_mother',
    word: 'mother',
    phonetic: '/ˈmʌðə(r)/',
    meaning: '母亲，妈妈',
    partOfSpeech: 'n.',
    grade: 'g2_t1',
    unit: 1,
    category: '家庭 Family',
    phonicsRule: 'th 发浊辅音 /ð/，o 发 /ʌ/',
    exampleEn: 'I love my gentle mother.',
    exampleCn: '我爱我温柔的妈妈。',
    icon: '👩',
    knowledgePointId: 'english.g2.vocab.family',
    difficulty: 2
  },
  {
    id: 'vocab_g2_sun',
    word: 'sun',
    phonetic: '/sʌn/',
    meaning: '太阳',
    partOfSpeech: 'n.',
    grade: 'g2_t1',
    unit: 2,
    category: '自然 Nature',
    phonicsRule: '短元音 u 发 /ʌ/',
    exampleEn: 'The warm sun shines brightly.',
    exampleCn: '温暖的太阳高照。',
    icon: '☀️',
    knowledgePointId: 'english.g1.phonics.short_vowels',
    difficulty: 1
  },
  {
    id: 'vocab_g2_rain',
    word: 'rain',
    phonetic: '/reɪn/',
    meaning: '雨水 / 下雨',
    partOfSpeech: 'n.',
    grade: 'g2_t1',
    unit: 2,
    category: '自然 Nature',
    phonicsRule: '元音组合 ai 发双元音 /eɪ/',
    exampleEn: 'Rain makes little flowers grow.',
    exampleCn: '雨水让小花茁壮成长。',
    icon: '🌧️',
    knowledgePointId: 'english.g2.phonics.blends',
    difficulty: 2
  },

  // =========================================================
  // 🎒 二年级下册 (Grade 2 Term 2)
  // =========================================================
  {
    id: 'vocab_g2t2_sunny',
    word: 'sunny',
    phonetic: '/ˈsʌni/',
    meaning: '晴朗的',
    partOfSpeech: 'adj.',
    grade: 'g2_t2',
    unit: 1,
    category: '天气 Weather',
    phonicsRule: 'y 在词尾发 /i/',
    exampleEn: 'It is sunny today.',
    exampleCn: '今天天气晴朗。',
    icon: '☀️',
    knowledgePointId: 'english.g2.vocab.weather',
    difficulty: 2
  },
  {
    id: 'vocab_g2t2_rainy',
    word: 'rainy',
    phonetic: '/ˈreɪni/',
    meaning: '下雨的',
    partOfSpeech: 'adj.',
    grade: 'g2_t2',
    unit: 1,
    category: '天气 Weather',
    phonicsRule: 'ai 发 /eɪ/，y 发 /i/',
    exampleEn: 'It is rainy. Take an umbrella.',
    exampleCn: '今天下雨，带上伞吧。',
    icon: '🌧️',
    knowledgePointId: 'english.g2.vocab.weather',
    difficulty: 2
  },
  {
    id: 'vocab_g2t2_hat',
    word: 'hat',
    phonetic: '/hæt/',
    meaning: '帽子',
    partOfSpeech: 'n.',
    grade: 'g2_t2',
    unit: 2,
    category: '服装 Clothes',
    phonicsRule: '短元音 a 发 /æ/，CVC 拼读',
    exampleEn: 'Put on your hat.',
    exampleCn: '戴上你的帽子。',
    icon: '🧢',
    knowledgePointId: 'english.g2.vocab.clothes',
    difficulty: 1
  },
  {
    id: 'vocab_g2t2_shoes',
    word: 'shoes',
    phonetic: '/ʃuːz/',
    meaning: '鞋子',
    partOfSpeech: 'n.',
    grade: 'g2_t2',
    unit: 2,
    category: '服装 Clothes',
    phonicsRule: 'sh 发 /ʃ/，oe 发长音 /uː/',
    exampleEn: 'I put on my shoes.',
    exampleCn: '我穿上鞋子。',
    icon: '👟',
    knowledgePointId: 'english.g2.vocab.clothes',
    difficulty: 2
  },

  // =========================================================
  // 🎒 三年级上册 (Grade 3 Term 1)
  // =========================================================
  {
    id: 'vocab_g3_school',
    word: 'school',
    phonetic: '/skuːl/',
    meaning: '学校',
    partOfSpeech: 'n.',
    grade: 'g3_t1',
    unit: 1,
    category: '校园生活 School',
    phonicsRule: 'sch 发 /sk/，oo 发长音 /uː/',
    exampleEn: 'We walk to school together.',
    exampleCn: '我们一起走着去上学。',
    icon: '🏫',
    knowledgePointId: 'english.g1.vocab.greetings',
    difficulty: 2
  },
  {
    id: 'vocab_g3_friend',
    word: 'friend',
    phonetic: '/frend/',
    meaning: '朋友',
    partOfSpeech: 'n.',
    grade: 'g3_t1',
    unit: 1,
    category: '人际交往 Social',
    phonicsRule: '辅音连缀 fr + 特殊元音 ie 发 /e/',
    exampleEn: 'A good friend is like sunshine.',
    exampleCn: '好朋友就像阳光一样温暖。',
    icon: '🤝',
    knowledgePointId: 'english.g1.vocab.greetings',
    difficulty: 2
  },
  {
    id: 'vocab_g3_happy',
    word: 'happy',
    phonetic: '/ˈhæpi/',
    meaning: '快乐的，高兴的',
    partOfSpeech: 'adj.',
    grade: 'g3_t1',
    unit: 2,
    category: '情绪 Feeling',
    phonicsRule: '词尾 y 发短音 /i/',
    exampleEn: 'We are very happy today.',
    exampleCn: '我们今天非常开心。',
    icon: '😄',
    knowledgePointId: 'english.g1.phonics.short_vowels',
    difficulty: 2
  }
];

export function getVocabularyByGrade(grade: GradeLevel): VocabularyItem[] {
  return ENGLISH_VOCABULARY_REPOSITORY.filter(v => v.grade === grade);
}

export function searchVocabulary(query: string, grade?: GradeLevel): VocabularyItem[] {
  const q = query.trim().toLowerCase();
  return ENGLISH_VOCABULARY_REPOSITORY.filter(v => {
    if (grade && v.grade !== grade) return false;
    if (!q) return true;
    return (
      v.word.toLowerCase().includes(q) ||
      v.meaning.includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.exampleEn.toLowerCase().includes(q)
    );
  });
}

