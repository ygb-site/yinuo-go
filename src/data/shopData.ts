export interface ShopAvatarItem {
  id: string;
  avatar: string;
  name: string;
  nameEn: string;
  desc: string;
  price: number;
}

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
