export type SilverDenominationValue = 1 | 5 | 10 | 50 | 100;

export interface SilverDenominationConfig {
  value: SilverDenominationValue;
  label: string; // "壹两", "伍两", etc.
  name: string; // "壹两银票"
  color: string; // 主色调
  borderColor: string;
  bgColor: string;
  badge: string;
  sealText: string;
  poem: string;
}

export type SilverThemePreset = 'classic' | 'gold' | 'emerald' | 'purple' | 'azure' | 'ruby' | 'pink';

export interface MemberNoteCustomization {
  enabled: boolean; // 是否启用专属定制银票
  bankName?: string; // 钱庄招牌/堂号，如 "诺宝钱庄"、"诺宝宝库"
  holderLabel?: string; // 归属题头，如 "持票人"、"少侠"、"大掌柜"
  sealText?: string; // 专属印章核心铭文（2-4字），如 "诺宝"、"诺宝私印"
  motto?: string; // 专属立誓/座右铭，如 "日进有功，学海无涯"
  leftSlogan?: string; // 左侧竖排对联，如 "日进有功"
  rightSlogan?: string; // 右侧竖排对联，如 "童叟无欺"
  themePreset?: SilverThemePreset; // 专属古风主题色
}

export type OrderType = 'reward' | 'penalty'; // 赏（加银票） | 罚（扣银票）

export type OrderCategory = 'study' | 'habit' | 'chore' | 'character' | 'life';

export interface FamilyMember {
  id: string;
  name: string;
  role: string; // 如 "宝贝", "爸爸", "妈妈", "爷爷", "奶奶"
  avatar: string; // Emoji 或 图标
  title?: string; // 荣誉称号，如 "探花郎", "自律先锋"
  balance: number; // 当前银票两数
  totalReward: number; // 累计获得银票两数
  totalPenalty: number; // 累计扣除银票两数
  customNote?: MemberNoteCustomization; // 个人专属银票定制
  createdAt: string;
}

export interface FamilyOrder {
  id: string;
  title: string;
  description?: string;
  type: OrderType;
  amount: number; // 银票两数（常用 1, 5, 10, 50, 100）
  category: OrderCategory;
  icon?: string;
  targetMemberId?: string; // 为空表示全家通用，否则指定某人
  enabled: boolean;
  createdAt: string;
}

export interface SilverTransaction {
  id: string;
  memberId: string;
  memberName: string;
  orderId?: string;
  orderTitle: string;
  type: OrderType;
  amount: number; // 发生两数
  balanceAfter: number; // 结余两数
  timestamp: string; // ISO 字符串
  note?: string;
  operator?: string; // 经办人，如 "家规掌柜", "妈妈", "爸爸"
}

export type RankingPeriod = 'day' | 'week' | 'month' | 'year' | 'total';

export interface MemberRankingStat {
  memberId: string;
  name: string;
  role: string;
  avatar: string;
  currentBalance: number;
  periodReward: number;
  periodPenalty: number;
  netScore: number; // periodReward - periodPenalty
  actionCount: number;
  rank: number;
}
