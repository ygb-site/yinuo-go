import type { ThemeType } from '../engine/types';

export interface ShopThemeItem {
  id: ThemeType;
  name: string;
  nameEn: string;
  desc: string;
  price: number;
  icon: string;
  previewBg: string;
  borderColor: string;
  lineColor: string;
}

export interface ShopAvatarItem {
  id: string;
  avatar: string;
  name: string;
  nameEn: string;
  desc: string;
  price: number;
}

export const SHOP_THEMES: ShopThemeItem[] = [
  {
    id: 'wood',
    name: '经典原木',
    nameEn: 'Classic Kaya Wood',
    desc: '传统榧木温润质感，棋院标准木纹色泽',
    price: 0,
    icon: '🪵',
    previewBg: 'bg-[#DEB887]',
    borderColor: '#B47B36',
    lineColor: '#6B3E11'
  },
  {
    id: 'candy',
    name: '糖果梦境',
    nameEn: 'Sweet Candy Dream',
    desc: '草莓与马卡龙粉嫩梦幻色调，甜美活泼',
    price: 60,
    icon: '🍬',
    previewBg: 'bg-[#FFE4E1]',
    borderColor: '#F472B6',
    lineColor: '#F472B6'
  },
  {
    id: 'jade',
    name: '翡翠温玉',
    nameEn: 'Imperial Jade',
    desc: '江南碧玉青竹雅致风骨，护眼清新',
    price: 80,
    icon: '🍵',
    previewBg: 'bg-[#D1FAE5]',
    borderColor: '#10B981',
    lineColor: '#059669'
  },
  {
    id: 'galaxy',
    name: '赛博星空',
    nameEn: 'Cosmic Nebula',
    desc: '深邃璀璨宇宙星云，泛光紫晶线条',
    price: 120,
    icon: '🌌',
    previewBg: 'bg-[#2E1065]',
    borderColor: '#A855F7',
    lineColor: '#C084FC'
  },
  {
    id: 'forest',
    name: '青草森林',
    nameEn: 'Fresh Meadow',
    desc: '大自然青葱草坪，生机盎然与阳光气息',
    price: 90,
    icon: '🍀',
    previewBg: 'bg-[#DCFCE7]',
    borderColor: '#22C55E',
    lineColor: '#15803D'
  },
  {
    id: 'gold',
    name: '皇家金砂',
    nameEn: 'Royal Golden Amber',
    desc: '华贵耀金琉璃沙质感，大师尊贵专属',
    price: 150,
    icon: '👑',
    previewBg: 'bg-[#FEF3C7]',
    borderColor: '#F59E0B',
    lineColor: '#B45309'
  }
];

export const SHOP_AVATARS: ShopAvatarItem[] = [
  {
    id: 'lion',
    avatar: '🦁',
    name: '威武小狮',
    nameEn: 'Brave Lion',
    desc: '勇往直前、棋力强大的丛林之王',
    price: 0
  },
  {
    id: 'baby',
    avatar: '👶',
    name: '聪明萌宝',
    nameEn: 'Cute Baby',
    desc: '灵气满满、充满好奇心的小棋手',
    price: 0
  },
  {
    id: 'cat',
    avatar: '🐱',
    name: '机智咪咪',
    nameEn: 'Clever Kitty',
    desc: '身手敏捷、落子无声的妙手小猫',
    price: 0
  },
  {
    id: 'panda',
    avatar: '🐼',
    name: '导师小诺',
    nameEn: 'Master Panda NuoNuo',
    desc: '博学多才的国宝九段围棋导师',
    price: 0
  },
  {
    id: 'tiger',
    avatar: '🐯',
    name: '斑斓萌虎',
    nameEn: 'Tiger Cub',
    desc: '虎虎生威，落子气势磅礴压倒全场',
    price: 50
  },
  {
    id: 'dragon',
    avatar: '🐲',
    name: '凌云祥龙',
    nameEn: 'Cosmic Dragon',
    desc: '神龙出世，掌控大局的大盘掌控者',
    price: 100
  },
  {
    id: 'robot',
    avatar: '🤖',
    name: '算力超人',
    nameEn: 'AI Robot',
    desc: '精确到每一目的围棋 AI 智慧大脑',
    price: 80
  },
  {
    id: 'wizard',
    avatar: '🧙‍♂️',
    name: '围棋魔法师',
    nameEn: 'Go Wizard',
    desc: '能变出绝杀神之一手的手筋魔法大师',
    price: 120
  },
  {
    id: 'fox',
    avatar: '🦊',
    name: '灵巧赤狐',
    nameEn: 'Swift Fox',
    desc: '算路深远、善于巧设陷阱的机灵鬼',
    price: 70
  },
  {
    id: 'unicorn',
    avatar: '🦄',
    name: '梦幻独角兽',
    nameEn: 'Magic Unicorn',
    desc: '纯洁神圣、带来胜局好运的吉祥物',
    price: 150
  }
];

