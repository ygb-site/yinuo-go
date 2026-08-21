export interface PoemLine {
  text: string;
  pinyin: string;
}

export interface PoemItem {
  id: string;
  title: string;
  dynasty: string;
  author: string;
  category: string;
  lines: PoemLine[];
  appreciation: string;
}

export const POETRY_LIBRARY: PoemItem[] = [
  {
    "id": "p_1",
    "title": "咏鹅",
    "dynasty": "唐",
    "author": "骆宾王",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "鹅，鹅，鹅，",
        "pinyin": "é ， é ， é ，"
      },
      {
        "text": "曲项向天歌。",
        "pinyin": "qǔ xiàng xiàng tiān gē 。"
      },
      {
        "text": "白毛浮绿水，",
        "pinyin": "bái máo fú lǜ shuǐ ，"
      },
      {
        "text": "红掌拨清波。",
        "pinyin": "hóng zhǎng bō qīng bō 。"
      }
    ],
    "appreciation": "这首诗形象地描绘了大白鹅在水中欢快游弋、美丽洁白的姿态，充满童趣与生命力。"
  },
  {
    "id": "p_2",
    "title": "静夜思",
    "dynasty": "唐",
    "author": "李白",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "床前明月光，",
        "pinyin": "chuáng qián míng yuè guāng ，"
      },
      {
        "text": "疑是地上霜。",
        "pinyin": "yí shì dì shàng shuāng 。"
      },
      {
        "text": "举头望明月，",
        "pinyin": "jǔ tóu wàng míng yuè ，"
      },
      {
        "text": "低头思故乡。",
        "pinyin": "dī tóu sī gù xiāng 。"
      }
    ],
    "appreciation": "诗仙李白千古传诵的名篇，借皎洁的月光抒发对家乡深沉的眷恋与思念。"
  },
  {
    "id": "p_3",
    "title": "春晓",
    "dynasty": "唐",
    "author": "孟浩然",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "春眠不觉晓，",
        "pinyin": "chūn mián bù jué xiǎo ，"
      },
      {
        "text": "处处闻啼鸟。",
        "pinyin": "chù chù wén tí niǎo 。"
      },
      {
        "text": "夜来风雨声，",
        "pinyin": "yè lái fēng yǔ shēng ，"
      },
      {
        "text": "花落知多少。",
        "pinyin": "huā luò zhī duō shǎo 。"
      }
    ],
    "appreciation": "抓住春天早晨刚醒时的所闻所感，生动描摹出春天的明媚与生机。"
  },
  {
    "id": "p_4",
    "title": "悯农（其二）",
    "dynasty": "唐",
    "author": "李绅",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "锄禾日当午，",
        "pinyin": "chú hé rì dāng wǔ ，"
      },
      {
        "text": "汗滴禾下土。",
        "pinyin": "hàn dī hé xià tǔ 。"
      },
      {
        "text": "谁知盘中餐，",
        "pinyin": "shuí zhī pán zhōng cān ，"
      },
      {
        "text": "粒粒皆辛苦。",
        "pinyin": "lì lì jiē xīn kǔ 。"
      }
    ],
    "appreciation": "描绘烈日下农民辛勤劳动的场景，告诫我们要珍惜每一粒粮食。"
  },
  {
    "id": "p_5",
    "title": "登鹳雀楼",
    "dynasty": "唐",
    "author": "王之涣",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "白日依山尽，",
        "pinyin": "bái rì yī shān jìn ，"
      },
      {
        "text": "黄河入海流。",
        "pinyin": "huáng hé rù hǎi liú 。"
      },
      {
        "text": "欲穷千里目，",
        "pinyin": "yù qióng qiān lǐ mù ，"
      },
      {
        "text": "更上一层楼。",
        "pinyin": "gèng shàng yì céng lóu 。"
      }
    ],
    "appreciation": "前两句写景壮阔，后两句借景抒怀，蕴含着站得高才能看得远的哲理。"
  },
  {
    "id": "p_6",
    "title": "江雪",
    "dynasty": "唐",
    "author": "柳宗元",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "千山鸟飞绝，",
        "pinyin": "qiān shān niǎo fēi jué ，"
      },
      {
        "text": "万径人踪灭。",
        "pinyin": "wàn jìng rén zōng miè 。"
      },
      {
        "text": "孤舟蓑笠翁，",
        "pinyin": "gū zhōu suō lì wēng ，"
      },
      {
        "text": "独钓寒江雪。",
        "pinyin": "dú diào hán jiāng xuě 。"
      }
    ],
    "appreciation": "用极简练的笔墨勾勒出一幅幽静寒冷的冬江雪景图，表现了诗人傲岸清高的品格。"
  },
  {
    "id": "p_7",
    "title": "古朗月行（节选）",
    "dynasty": "唐",
    "author": "李白",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "小时不识月，",
        "pinyin": "xiǎo shí bù shí yuè ，"
      },
      {
        "text": "呼作白玉盘。",
        "pinyin": "hū zuò bái yù pán 。"
      },
      {
        "text": "又疑瑶台镜，",
        "pinyin": "yòu yí yáo tái jìng ，"
      },
      {
        "text": "飞在青云端。",
        "pinyin": "fēi zài qīng yún duān 。"
      }
    ],
    "appreciation": "以儿童天真烂漫的视角将圆月比作白玉盘与瑶台镜，奇思妙想，浪漫绝伦。"
  },
  {
    "id": "p_8",
    "title": "寻隐者不遇",
    "dynasty": "唐",
    "author": "贾岛",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "松下问童子，",
        "pinyin": "sōng xià wèn tóng zǐ ，"
      },
      {
        "text": "言师采药去。",
        "pinyin": "yán shī cǎi yào qù 。"
      },
      {
        "text": "只在此山中，",
        "pinyin": "zhī zài cǐ shān zhōng ，"
      },
      {
        "text": "云深不知处。",
        "pinyin": "yún shēn bù zhī chù 。"
      }
    ],
    "appreciation": "通过与童子的简短问答，将隐士悠然采药、云山深处的意境烘托得淋漓尽致。"
  },
  {
    "id": "p_9",
    "title": "村居",
    "dynasty": "清",
    "author": "高鼎",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "草长莺飞二月天，",
        "pinyin": "cǎo zhǎng yīng fēi èr yuè tiān ，"
      },
      {
        "text": "拂堤杨柳醉春烟。",
        "pinyin": "fú dī yáng liǔ zuì chūn yān 。"
      },
      {
        "text": "儿童散学归来早，",
        "pinyin": "ér tóng sàn xué guī lái zǎo ，"
      },
      {
        "text": "忙趁东风放纸鸢。",
        "pinyin": "máng chèn dōng fēng fàng zhǐ yuān 。"
      }
    ],
    "appreciation": "描写江南早春二月的美丽风光，以及儿童放学后在春风中欢快放风筝的明媚场景。"
  },
  {
    "id": "p_10",
    "title": "咏柳",
    "dynasty": "唐",
    "author": "贺知章",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "碧玉妆成一树高，",
        "pinyin": "bì yù zhuāng chéng yí shù gāo ，"
      },
      {
        "text": "万条垂下绿丝绦。",
        "pinyin": "wàn tiáo chuí xià lǜ sī tāo 。"
      },
      {
        "text": "不知细叶谁裁出，",
        "pinyin": "bù zhī xì yè shuí cái chū ，"
      },
      {
        "text": "二月春风似剪刀。",
        "pinyin": "èr yuè chūn fēng sì jiǎn dāo 。"
      }
    ],
    "appreciation": "将早春柳树的新绿比作碧玉与绿丝绦，把二月春风化为巧夺天工的剪刀。"
  },
  {
    "id": "p_11",
    "title": "小池",
    "dynasty": "宋",
    "author": "杨万里",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "泉眼无声惜细流，",
        "pinyin": "quán yǎn wú shēng xī xì liú ，"
      },
      {
        "text": "树阴照水爱晴柔。",
        "pinyin": "shù yīn zhào shuǐ ài qíng róu 。"
      },
      {
        "text": "小荷才露尖尖角，",
        "pinyin": "xiǎo hé cái lù jiān jiān jiǎo ，"
      },
      {
        "text": "早有蜻蜓立上头。",
        "pinyin": "zǎo yǒu qīng tíng lì shàng tóu 。"
      }
    ],
    "appreciation": "细致描摹初夏初晴时小荷塘生机勃勃的景致，清新自然，富有情趣。"
  },
  {
    "id": "p_12",
    "title": "池上",
    "dynasty": "唐",
    "author": "白居易",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "小娃撑小艇，",
        "pinyin": "xiǎo wá chēng xiǎo tǐng ，"
      },
      {
        "text": "偷采白莲回。",
        "pinyin": "tōu cǎi bái lián huí 。"
      },
      {
        "text": "不解藏踪迹，",
        "pinyin": "bù jiě cáng zōng jì ，"
      },
      {
        "text": "浮萍一道开。",
        "pinyin": "fú píng yí dào kāi 。"
      }
    ],
    "appreciation": "描绘乡村儿童天真顽皮、偷采白莲的生活趣事，纯真可爱。"
  },
  {
    "id": "p_13",
    "title": "赋得古原草送别（草）",
    "dynasty": "唐",
    "author": "白居易",
    "category": "唐诗三百首·五言绝句",
    "lines": [
      {
        "text": "离离原上草，",
        "pinyin": "lí lí yuán shàng cǎo ，"
      },
      {
        "text": "一岁一枯荣。",
        "pinyin": "yí suì yì kū róng 。"
      },
      {
        "text": "野火烧不尽，",
        "pinyin": "yě huǒ shāo bú jìn ，"
      },
      {
        "text": "春风吹又生。",
        "pinyin": "chūn fēng chuī yòu shēng 。"
      }
    ],
    "appreciation": "赞美野草顽强不屈的生命力，成为自强不息精神的千古绝唱。"
  },
  {
    "id": "p_14",
    "title": "绝句（两个黄鹂）",
    "dynasty": "唐",
    "author": "杜甫",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "两个黄鹂鸣翠柳，",
        "pinyin": "liǎng gè huáng lí míng cuì liǔ ，"
      },
      {
        "text": "一行白鹭上青天。",
        "pinyin": "yì háng bái lù shàng qīng tiān 。"
      },
      {
        "text": "窗含西岭千秋雪，",
        "pinyin": "chuāng hán xī lǐng qiān qiū xuě ，"
      },
      {
        "text": "门泊东吴万里船。",
        "pinyin": "mén bó dōng wú wàn lǐ chuán 。"
      }
    ],
    "appreciation": "诗圣杜甫在成都草堂写下的明丽画卷，四句成四景，色彩绚丽，对仗工整。"
  },
  {
    "id": "p_15",
    "title": "望庐山瀑布",
    "dynasty": "唐",
    "author": "李白",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "日照香炉生紫烟，",
        "pinyin": "rì zhào xiāng lú shēng zǐ yān ，"
      },
      {
        "text": "遥看瀑布挂前川。",
        "pinyin": "yáo kàn pù bù guà qián chuān 。"
      },
      {
        "text": "飞流直下三千尺，",
        "pinyin": "fēi liú zhí xià sān qiān chǐ ，"
      },
      {
        "text": "疑是银河落九天。",
        "pinyin": "yí shì yín hé luò jiǔ tiān 。"
      }
    ],
    "appreciation": "李白浪漫主义的巅峰之作，将庐山瀑布气势磅礴的下泻比作银河从九天坠落。"
  },
  {
    "id": "p_16",
    "title": "早发白帝城",
    "dynasty": "唐",
    "author": "李白",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "朝辞白帝彩云间，",
        "pinyin": "cháo cí bái dì cǎi yún jiān ，"
      },
      {
        "text": "千里江陵一日还。",
        "pinyin": "qiān lǐ jiāng líng yí rì hái 。"
      },
      {
        "text": "两岸猿声啼不住，",
        "pinyin": "liǎng àn yuán shēng tí bú zhù ，"
      },
      {
        "text": "轻舟已过万重山。",
        "pinyin": "qīng zhōu yǐ guò wàn chóng shān 。"
      }
    ],
    "appreciation": "写长江三峡水流湍急与小舟顺流而下的轻快，抒发诗人遇赦重获自由的喜悦。"
  },
  {
    "id": "p_17",
    "title": "相思",
    "dynasty": "唐",
    "author": "王维",
    "category": "唐诗三百首·五言绝句",
    "lines": [
      {
        "text": "红豆生南国，",
        "pinyin": "hóng dòu shēng nán guó ，"
      },
      {
        "text": "春来发几枝。",
        "pinyin": "chūn lái fā jǐ zhī 。"
      },
      {
        "text": "愿君多采撷，",
        "pinyin": "yuàn jūn duō cǎi xié ，"
      },
      {
        "text": "此物最相思。",
        "pinyin": "cǐ wù zuì xiāng sī 。"
      }
    ],
    "appreciation": "借红豆抒发对友人的深厚情谊，寄情于物，委婉含蓄。"
  },
  {
    "id": "p_18",
    "title": "九月九日忆山东兄弟",
    "dynasty": "唐",
    "author": "王维",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "独在异乡为异客，",
        "pinyin": "dú zài yì xiāng wèi yì kè ，"
      },
      {
        "text": "每逢佳节倍思亲。",
        "pinyin": "měi féng jiā jié bèi sī qīn 。"
      },
      {
        "text": "遥知兄弟登高处，",
        "pinyin": "yáo zhī xiōng dì dēng gāo chù ，"
      },
      {
        "text": "遍插茱萸少一人。",
        "pinyin": "biàn chā zhū yú shǎo yì rén 。"
      }
    ],
    "appreciation": "重阳节思乡念亲的千古名作，表达了游子对故乡亲人的深切怀念。"
  },
  {
    "id": "p_19",
    "title": "鹿柴",
    "dynasty": "唐",
    "author": "王维",
    "category": "唐诗三百首·五言绝句",
    "lines": [
      {
        "text": "空山不见人，",
        "pinyin": "kōng shān bú jiàn rén ，"
      },
      {
        "text": "但闻人语响。",
        "pinyin": "dàn wén rén yǔ xiǎng 。"
      },
      {
        "text": "返景入深林，",
        "pinyin": "fǎn jǐng rù shēn lín ，"
      },
      {
        "text": "复照青苔上。",
        "pinyin": "fù zhào qīng tái shàng 。"
      }
    ],
    "appreciation": "以声衬静，描绘深山幽林中的光影变幻，充满禅意与宁静之美。"
  },
  {
    "id": "p_20",
    "title": "竹里馆",
    "dynasty": "唐",
    "author": "王维",
    "category": "唐诗三百首·五言绝句",
    "lines": [
      {
        "text": "独坐幽篁里，",
        "pinyin": "dú zuò yōu huáng lǐ ，"
      },
      {
        "text": "弹琴复长啸。",
        "pinyin": "tán qín fù cháng xiào 。"
      },
      {
        "text": "深林人不知，",
        "pinyin": "shēn lín rén bù zhī ，"
      },
      {
        "text": "明月来相照。",
        "pinyin": "míng yuè lái xiāng zhào 。"
      }
    ],
    "appreciation": "描写诗人独自在竹林弹琴长啸的高雅情怀与月夜相伴的清幽意境。"
  },
  {
    "id": "p_21",
    "title": "逢雪宿芙蓉山主人",
    "dynasty": "唐",
    "author": "刘长卿",
    "category": "唐诗三百首·五言绝句",
    "lines": [
      {
        "text": "日暮苍山远，",
        "pinyin": "rì mù cāng shān yuǎn ，"
      },
      {
        "text": "天寒白屋贫。",
        "pinyin": "tiān hán bái wū pín 。"
      },
      {
        "text": "柴门闻犬吠，",
        "pinyin": "chái mén wén quǎn fèi ，"
      },
      {
        "text": "风雪夜归人。",
        "pinyin": "fēng xuě yè guī rén 。"
      }
    ],
    "appreciation": "描绘风雪夜宿山家的生动画面，犬吠声更添寒夜归家的温馨与宁静。"
  },
  {
    "id": "p_22",
    "title": "回乡偶书",
    "dynasty": "唐",
    "author": "贺知章",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "少小离家老大回，",
        "pinyin": "shǎo xiǎo lí jiā lǎo dà huí ，"
      },
      {
        "text": "乡音无改鬓毛衰。",
        "pinyin": "xiāng yīn wú gǎi bìn máo shuāi 。"
      },
      {
        "text": "儿童相见不相识，",
        "pinyin": "ér tóng xiāng jiàn bù xiāng shí ，"
      },
      {
        "text": "笑问客从何处来。",
        "pinyin": "xiào wèn kè cóng hé chù lái 。"
      }
    ],
    "appreciation": "老年回到故乡的感慨，字句质朴无华，却道尽岁月沧桑与乡愁。"
  },
  {
    "id": "p_23",
    "title": "凉州词",
    "dynasty": "唐",
    "author": "王翰",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "葡萄美酒夜光杯，",
        "pinyin": "pú táo měi jiǔ yè guāng bēi ，"
      },
      {
        "text": "欲饮琵琶马上催。",
        "pinyin": "yù yǐn pí pa mǎ shàng cuī 。"
      },
      {
        "text": "醉卧沙场君莫笑，",
        "pinyin": "zuì wò shā chǎng jūn mò xiào ，"
      },
      {
        "text": "古来征战几人回。",
        "pinyin": "gǔ lái zhēng zhàn jǐ rén huí 。"
      }
    ],
    "appreciation": "边塞将士开怀痛饮、视死如归的豪迈气概，雄壮悲凉。"
  },
  {
    "id": "p_24",
    "title": "出塞",
    "dynasty": "唐",
    "author": "王昌龄",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "秦时明月汉时关，",
        "pinyin": "qín shí míng yuè hàn shí guān ，"
      },
      {
        "text": "万里长征人未还。",
        "pinyin": "wàn lǐ cháng zhēng rén wèi hái 。"
      },
      {
        "text": "但使龙城飞将在，",
        "pinyin": "dàn shǐ lóng chéng fēi jiāng zài ，"
      },
      {
        "text": "不教胡马度阴山。",
        "pinyin": "bú jiào hú mǎ dù yīn shān 。"
      }
    ],
    "appreciation": "被誉为唐代七绝压卷之作，慨叹边关战事，渴望良将平定边患。"
  },
  {
    "id": "p_25",
    "title": "芙蓉楼送辛渐",
    "dynasty": "唐",
    "author": "王昌龄",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "寒雨连江夜入吴，",
        "pinyin": "hán yǔ lián jiāng yè rù wú ，"
      },
      {
        "text": "平明送客楚山孤。",
        "pinyin": "píng míng sòng kè chǔ shān gū 。"
      },
      {
        "text": "洛阳亲友如相问，",
        "pinyin": "luò yáng qīn yǒu rú xiāng wèn ，"
      },
      {
        "text": "一片冰心在玉壶。",
        "pinyin": "yí piàn bīng xīn zài yù hú 。"
      }
    ],
    "appreciation": "以“一片冰心在玉壶”表明自己冰清玉洁、坚守节操的心志。"
  },
  {
    "id": "p_26",
    "title": "夜宿山寺",
    "dynasty": "唐",
    "author": "李白",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "危楼高百尺，",
        "pinyin": "wēi lóu gāo bǎi chǐ ，"
      },
      {
        "text": "手可摘星辰。",
        "pinyin": "shǒu kě zhāi xīng chén 。"
      },
      {
        "text": "不敢高声语，",
        "pinyin": "bù gǎn gāo shēng yǔ ，"
      },
      {
        "text": "恐惊天上人。",
        "pinyin": "kǒng jīng tiān shàng rén 。"
      }
    ],
    "appreciation": "以极其夸张浪漫的笔调表现山寺高耸入云霄的奇峻气势。"
  },
  {
    "id": "p_27",
    "title": "黄鹤楼送孟浩然之广陵",
    "dynasty": "唐",
    "author": "李白",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "故人西辞黄鹤楼，",
        "pinyin": "gù rén xī cí huáng hè lóu ，"
      },
      {
        "text": "烟花三月下扬州。",
        "pinyin": "yān huā sān yuè xià yáng zhōu 。"
      },
      {
        "text": "孤帆远影碧空尽，",
        "pinyin": "gū fān yuǎn yǐng bì kōng jìn ，"
      },
      {
        "text": "唯见长江天际流。",
        "pinyin": "wéi jiàn cháng jiāng tiān jì liú 。"
      }
    ],
    "appreciation": "在烟花三月的明媚春光中送别挚友，诗意悠长，水天相接。"
  },
  {
    "id": "p_28",
    "title": "别董大",
    "dynasty": "唐",
    "author": "高适",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "千里黄云白日曛，",
        "pinyin": "qiān lǐ huáng yún bái rì xūn ，"
      },
      {
        "text": "北风吹雁雪纷纷。",
        "pinyin": "běi fēng chuī yàn xuě fēn fēn 。"
      },
      {
        "text": "莫愁前路无知己，",
        "pinyin": "mò chóu qián lù wú zhī jǐ ，"
      },
      {
        "text": "天下谁人不识君。",
        "pinyin": "tiān xià shuí rén bù shí jūn 。"
      }
    ],
    "appreciation": "豪迈雄浑的送别诗，对友人的才华充满赞许与鼓励，充满信心。"
  },
  {
    "id": "p_29",
    "title": "枫桥夜泊",
    "dynasty": "唐",
    "author": "张继",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "月落乌啼霜满天，",
        "pinyin": "yuè luò wū tí shuāng mǎn tiān ，"
      },
      {
        "text": "江枫渔火对愁眠。",
        "pinyin": "jiāng fēng yú huǒ duì chóu mián 。"
      },
      {
        "text": "姑苏城外寒山寺，",
        "pinyin": "gū sū chéng wài hán shān sì ，"
      },
      {
        "text": "夜半钟声到客船。",
        "pinyin": "yè bàn zhōng shēng dào kè chuán 。"
      }
    ],
    "appreciation": "江南水乡秋夜的羁旅愁思，寒山寺的半夜钟声成为千古绝唱。"
  },
  {
    "id": "p_30",
    "title": "游子吟",
    "dynasty": "唐",
    "author": "孟郊",
    "category": "唐诗三百首·古体乐府",
    "lines": [
      {
        "text": "慈母手中线，",
        "pinyin": "cí mǔ shǒu zhōng xiàn ，"
      },
      {
        "text": "游子身上衣。",
        "pinyin": "yóu zǐ shēn shàng yī 。"
      },
      {
        "text": "临行密密缝，",
        "pinyin": "lín xíng mì mì fèng ，"
      },
      {
        "text": "意恐迟迟归。",
        "pinyin": "yì kǒng chí chí guī 。"
      },
      {
        "text": "谁言寸草心，",
        "pinyin": "shuí yán cùn cǎo xīn ，"
      },
      {
        "text": "报得三春晖。",
        "pinyin": "bào dé sān chūn huī 。"
      }
    ],
    "appreciation": "赞颂母爱最伟大的诗篇，将母亲的深恩比作温暖大地的春晖。"
  },
  {
    "id": "p_31",
    "title": "清明",
    "dynasty": "唐",
    "author": "杜牧",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "清明时节雨纷纷，",
        "pinyin": "qīng míng shí jié yǔ fēn fēn ，"
      },
      {
        "text": "路上行人欲断魂。",
        "pinyin": "lù shang xíng rén yù duàn hún 。"
      },
      {
        "text": "借问酒家何处有？",
        "pinyin": "jiè wèn jiǔ jiā hé chù yǒu ？"
      },
      {
        "text": "牧童遥指杏花村。",
        "pinyin": "mù tóng yáo zhǐ xìng huā cūn 。"
      }
    ],
    "appreciation": "清明时节的细雨与游子羁旅，牧童遥指杏花村的情趣盎然。"
  },
  {
    "id": "p_32",
    "title": "山行",
    "dynasty": "唐",
    "author": "杜牧",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "远上寒山石径斜，",
        "pinyin": "yuǎn shàng hán shān shí jìng xié ，"
      },
      {
        "text": "白云生处有人家。",
        "pinyin": "bái yún shēng chù yǒu rén jiā 。"
      },
      {
        "text": "停车坐爱枫林晚，",
        "pinyin": "tíng chē zuò ài fēng lín wǎn ，"
      },
      {
        "text": "霜叶红于二月花。",
        "pinyin": "shuāng yè hóng yú èr yuè huā 。"
      }
    ],
    "appreciation": "秋山晚景的生机与美丽，赞颂经霜枫叶比二月春花还要绚烂红火。"
  },
  {
    "id": "p_33",
    "title": "江南春",
    "dynasty": "唐",
    "author": "杜牧",
    "category": "唐诗三百首·七言绝句",
    "lines": [
      {
        "text": "千里莺啼绿映红，",
        "pinyin": "qiān lǐ yīng tí lǜ yìng hóng ，"
      },
      {
        "text": "水村山郭酒旗风。",
        "pinyin": "shuǐ cūn shān guō jiǔ qí fēng 。"
      },
      {
        "text": "南朝四百八十寺，",
        "pinyin": "nán cháo sì bǎi bā shí sì ，"
      },
      {
        "text": "多少楼台烟雨中。",
        "pinyin": "duō shǎo lóu tái yān yǔ zhōng 。"
      }
    ],
    "appreciation": "全景式展现江南春天的明媚生机与烟雨楼台的历史苍茫。"
  },
  {
    "id": "p_34",
    "title": "乐游原",
    "dynasty": "唐",
    "author": "李商隐",
    "category": "唐诗三百首·五言绝句",
    "lines": [
      {
        "text": "向晚意不适，",
        "pinyin": "xiàng wǎn yì bú shì ，"
      },
      {
        "text": "驱车登古原。",
        "pinyin": "qū chē dēng gǔ yuán 。"
      },
      {
        "text": "夕阳无限好，",
        "pinyin": "xī yáng wú xiàn hǎo ，"
      },
      {
        "text": "只是近黄昏。",
        "pinyin": "zhǐ shì jìn huáng hūn 。"
      }
    ],
    "appreciation": "对夕阳美景的由衷赞美与对韶华易逝、黄昏将至的深沉感慨。"
  },
  {
    "id": "p_35",
    "title": "敕勒歌",
    "dynasty": "北朝民歌",
    "author": "佚名",
    "category": "小学一二年级必背",
    "lines": [
      {
        "text": "敕勒川，阴山下。",
        "pinyin": "chì lè chuān ， yīn shān xià 。"
      },
      {
        "text": "天似穹庐，笼盖四野。",
        "pinyin": "tiān sì qióng lú ， lóng gài sì yě 。"
      },
      {
        "text": "天苍苍，野茫茫。",
        "pinyin": "tiān cāng cāng ， yě máng máng 。"
      },
      {
        "text": "风吹草低见牛羊。",
        "pinyin": "fēng chuī cǎo dī jiàn niú yáng 。"
      }
    ],
    "appreciation": "北朝民歌代表作，生动辽阔地勾勒出北方大草原苍茫雄浑的壮美风光。"
  }
];
