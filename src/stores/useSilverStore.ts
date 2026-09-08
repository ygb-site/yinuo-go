import { defineStore } from 'pinia';
import type {
  FamilyMember,
  FamilyOrder,
  SilverTransaction,
  SilverDenominationConfig,
  SilverDenominationValue,
  RankingPeriod,
  MemberRankingStat,
  OrderType,
  SilverThemePreset,
  MemberNoteCustomization
} from '../types/silver';
import { sound } from '../utils/sound';

export const SILVER_DENOMINATIONS: Record<SilverDenominationValue, SilverDenominationConfig> = {
  1: {
    value: 1,
    label: '壹两',
    name: '壹两银票',
    color: '#3B82F6',
    borderColor: '#93C5FD',
    bgColor: '#EFF6FF',
    badge: '日常赏格',
    sealText: '勤勉',
    poem: '积跬步以至千里'
  },
  5: {
    value: 5,
    label: '伍两',
    name: '伍两银票',
    color: '#10B981',
    borderColor: '#6EE7B7',
    bgColor: '#ECFDF5',
    badge: '嘉行赏格',
    sealText: '有恒',
    poem: '精诚所至金石开'
  },
  10: {
    value: 10,
    label: '拾两',
    name: '拾两银票',
    color: '#F59E0B',
    borderColor: '#FCD34D',
    bgColor: '#FFFBEB',
    badge: '大功赏格',
    sealText: '自强',
    poem: '功不唐捐玉汝于成'
  },
  50: {
    value: 50,
    label: '伍拾两',
    name: '伍拾两银票',
    color: '#8B5CF6',
    borderColor: '#C4B5FD',
    bgColor: '#F5F3FF',
    badge: '特等功勋',
    sealText: '通宝',
    poem: '硕果累累齐家道'
  },
  100: {
    value: 100,
    label: '壹百两',
    name: '壹百两银票',
    color: '#DC2626',
    borderColor: '#FCA5A5',
    bgColor: '#FEF2F2',
    badge: '传家宝票',
    sealText: '天宝',
    poem: '百善孝行家道昌'
  }
};


export interface NoteThemePresetInfo {
  id: SilverThemePreset;
  name: string;
  tagColor: string;
  desc: string;
}

export const NOTE_THEME_PRESETS: NoteThemePresetInfo[] = [
  { id: 'classic', name: '古法宣纸', tagColor: '#8C6D46', desc: '传统古风 典雅端庄' },
  { id: 'gold', name: '赤金祥云', tagColor: '#D97706', desc: '金光闪闪 尊荣华贵' },
  { id: 'emerald', name: '青玉修竹', tagColor: '#059669', desc: '温润如玉 清新自律' },
  { id: 'purple', name: '紫气东来', tagColor: '#7C3AED', desc: '祥瑞福泽 贵雅明慧' },
  { id: 'azure', name: '霁月天青', tagColor: '#0284C7', desc: '天青过雨 空灵澄澈' },
  { id: 'ruby', name: '朱砂锦绣', tagColor: '#DC2626', desc: '朱砂炽盛 喜气洋洋' },
  { id: 'pink', name: '粉黛桃花', tagColor: '#DB2777', desc: '如沐春风 灵动活泼' }
];

const STORAGE_KEY = 'yinuo_family_silver_v1';

function getInitialMembers(): FamilyMember[] {
  return [
    {
      id: 'm_nuobao',
      name: '诺宝',
      role: '长子',
      avatar: '👦',
      title: '自律小状元',
      balance: 78,
      totalReward: 120,
      totalPenalty: 42,
      customNote: {
        enabled: true,
        bankName: '诺宝宝库',
        holderLabel: '持票少侠',
        sealText: '诺宝',
        motto: '日进有功，学海无涯',
        leftSlogan: '棋道精进',
        rightSlogan: '自律自强',
        themePreset: 'gold'
      },
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'm_mama',
      name: '妈妈',
      role: '大掌柜',
      avatar: '👩',
      title: '规约督察官',
      balance: 135,
      totalReward: 150,
      totalPenalty: 15,
      customNote: {
        enabled: true,
        bankName: '慈母银号',
        holderLabel: '大掌柜',
        sealText: '大掌柜',
        motto: '温润有方，家和事兴',
        leftSlogan: '赏罚分明',
        rightSlogan: '持家有道',
        themePreset: 'purple'
      },
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'm_baba',
      name: '爸爸',
      role: '总账房',
      avatar: '👨',
      title: '家风巡抚',
      balance: 62,
      totalReward: 95,
      totalPenalty: 33,
      customNote: {
        enabled: true,
        bankName: '慎独银庄',
        holderLabel: '总账房',
        sealText: '总账房',
        motto: '言出必行，立信齐家',
        leftSlogan: '正心修身',
        rightSlogan: '童叟无欺',
        themePreset: 'emerald'
      },
      createdAt: '2026-01-01T08:00:00.000Z'
    }
  ];
}

function getInitialOrders(): FamilyOrder[] {
  return [
    // 奖赏令
    {
      id: 'ord_read_30m',
      title: '专注早读/自主阅读30分钟',
      description: '全神贯注阅读课外书或经典诗文，不翻动其他杂物',
      type: 'reward',
      amount: 5,
      category: 'study',
      icon: 'book',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_homework_neat',
      title: '按时保质完成作业且字迹工整',
      description: '放学后主动完成各项学习任务，书写端正无涂抹',
      type: 'reward',
      amount: 10,
      category: 'study',
      icon: 'award',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_sleep_early',
      title: '晚间21:30前主动洗漱关灯上床',
      description: '作息自律早睡早起，精神饱满迎接第二天',
      type: 'reward',
      amount: 5,
      category: 'habit',
      icon: 'clock',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_clean_table',
      title: '餐后主动收拾碗筷并擦净餐桌',
      description: '分担家庭力所能及的家务，爱护生活环境',
      type: 'reward',
      amount: 1,
      category: 'chore',
      icon: 'sparkles',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_clean_room',
      title: '主动收纳玩具与整理个人书桌',
      description: '物品物归原位，保持书房整洁有序',
      type: 'reward',
      amount: 5,
      category: 'chore',
      icon: 'target',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_go_practice',
      title: '棋艺专精：完成5道死活题或复盘',
      description: '静心专注下棋复盘，深思熟虑探究棋理',
      type: 'reward',
      amount: 5,
      category: 'study',
      icon: 'swords',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_week_perfect',
      title: '整周全勤达标无严重违规',
      description: '一周持之以恒，言行合一自律自强',
      type: 'reward',
      amount: 50,
      category: 'habit',
      icon: 'trophy',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_honor_big',
      title: '荣获校级/社会重大荣誉表彰',
      description: '为家庭争光添彩，树立优良品格标杆',
      type: 'reward',
      amount: 100,
      category: 'character',
      icon: 'medal',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },

    // 规诫令（罚）
    {
      id: 'ord_meal_delay',
      title: '就餐拖延超40分钟或看电视吃饭',
      description: '不好好吃顿饭，注意力分散拖拉磨蹭',
      type: 'penalty',
      amount: 5,
      category: 'habit',
      icon: 'alert-triangle',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_screen_overtime',
      title: '使用电子设备/游戏超时未主动归还',
      description: '超过约定娱乐时间不收手，破坏家庭视力护眼规约',
      type: 'penalty',
      amount: 10,
      category: 'habit',
      icon: 'gamepad',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_messy_toys',
      title: '玩具绘本随地丢弃屡催不收拾',
      description: '制造凌乱且不负责收尾，缺乏公德与责任感',
      type: 'penalty',
      amount: 5,
      category: 'chore',
      icon: 'trash',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_bad_temper',
      title: '无故耍性子/对长辈家人无礼大叫',
      description: '遇事任性宣泄情绪，不讲道理礼貌缺失',
      type: 'penalty',
      amount: 10,
      category: 'character',
      icon: 'flame',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'ord_lying_dishonest',
      title: '隐瞒未写作业或弄虚作假撒谎',
      description: '严重违背诚实做人家风底线，立诫警示',
      type: 'penalty',
      amount: 50,
      category: 'character',
      icon: 'shield',
      enabled: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    }
  ];
}

function getInitialTransactions(): SilverTransaction[] {
  const now = new Date();
  const d = (daysAgo: number, hoursAgo = 0) => {
    const t = new Date(now.getTime() - (daysAgo * 86400000) - (hoursAgo * 3600000));
    return t.toISOString();
  };

  return [
    {
      id: 'tx_demo_1',
      memberId: 'm_nuobao',
      memberName: '诺宝',
      orderId: 'ord_homework_neat',
      orderTitle: '按时保质完成作业且字迹工整',
      type: 'reward',
      amount: 10,
      balanceAfter: 78,
      timestamp: d(0, 2),
      note: '数学作业与围棋打卡全对，字迹格外漂亮',
      operator: '妈妈'
    },
    {
      id: 'tx_demo_2',
      memberId: 'm_baba',
      memberName: '爸爸',
      orderId: 'ord_clean_room',
      orderTitle: '主动收纳玩具与整理个人书桌',
      type: 'reward',
      amount: 5,
      balanceAfter: 62,
      timestamp: d(0, 4),
      note: '协助收拾全屋书架与阳台植物',
      operator: '妈妈'
    },
    {
      id: 'tx_demo_3',
      memberId: 'm_nuobao',
      memberName: '诺宝',
      orderId: 'ord_meal_delay',
      orderTitle: '就餐拖延超40分钟或看电视吃饭',
      type: 'penalty',
      amount: 5,
      balanceAfter: 68,
      timestamp: d(1, 1),
      note: '午饭边看拼图边磨蹭，提醒两次才吃完',
      operator: '爸爸'
    },
    {
      id: 'tx_demo_4',
      memberId: 'm_mama',
      memberName: '妈妈',
      orderId: 'ord_week_perfect',
      orderTitle: '整周全勤达标无严重违规',
      type: 'reward',
      amount: 50,
      balanceAfter: 135,
      timestamp: d(2, 3),
      note: '本周作息自律兼顾全家营养膳食规划',
      operator: '总账房'
    },
    {
      id: 'tx_demo_5',
      memberId: 'm_nuobao',
      memberName: '诺宝',
      orderId: 'ord_read_30m',
      orderTitle: '专注早读/自主阅读30分钟',
      type: 'reward',
      amount: 5,
      balanceAfter: 73,
      timestamp: d(3, 2),
      note: '晨起自主朗读诗词与儿童文学',
      operator: '爸爸'
    },
    {
      id: 'tx_demo_6',
      memberId: 'm_nuobao',
      memberName: '诺宝',
      orderId: 'ord_go_practice',
      orderTitle: '棋艺专精：完成5道死活题或复盘',
      type: 'reward',
      amount: 5,
      balanceAfter: 68,
      timestamp: d(5, 5),
      note: '挑战死活大师关卡一次通关',
      operator: '爸爸'
    },
    {
      id: 'tx_demo_7',
      memberId: 'm_baba',
      memberName: '爸爸',
      orderId: 'ord_screen_overtime',
      orderTitle: '使用电子设备/游戏超时未主动归还',
      type: 'penalty',
      amount: 10,
      balanceAfter: 57,
      timestamp: d(6, 1),
      note: '晚上打手机游戏超过约定20分钟被抓',
      operator: '大掌柜'
    },
    {
      id: 'tx_demo_8',
      memberId: 'm_nuobao',
      memberName: '诺宝',
      orderId: 'ord_week_perfect',
      orderTitle: '整周全勤达标无严重违规',
      type: 'reward',
      amount: 50,
      balanceAfter: 63,
      timestamp: d(12, 4),
      note: '上上周生活起居自理标兵',
      operator: '全家公评'
    }
  ];
}

export const useSilverStore = defineStore('silverStore', {
  state: () => {
    let saved: any = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) saved = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load silver store from localStorage', e);
    }

    return {
      members: (saved?.members as FamilyMember[]) || getInitialMembers(),
      orders: (saved?.orders as FamilyOrder[]) || getInitialOrders(),
      transactions: (saved?.transactions as SilverTransaction[]) || getInitialTransactions(),
      selectedMemberId: (saved?.selectedMemberId as string) || 'm_nuobao',
      currentRankingPeriod: (saved?.currentRankingPeriod as RankingPeriod) || 'week'
    };
  },

  getters: {
    selectedMember(state): FamilyMember | undefined {
      return state.members.find(m => m.id === state.selectedMemberId) || state.members[0];
    },

    totalFamilyBalance(state): number {
      return state.members.reduce((sum, m) => sum + (m.balance || 0), 0);
    },

    rewardOrders(state): FamilyOrder[] {
      return state.orders.filter(o => o.type === 'reward' && o.enabled);
    },

    penaltyOrders(state): FamilyOrder[] {
      return state.orders.filter(o => o.type === 'penalty' && o.enabled);
    },

    // 智能分解银票面额（将总金额分解为 100两、50两、10两、5两、1两 各多少张）
    getDenominationBreakdown() {
      return (totalAmount: number): { value: SilverDenominationValue; count: number; subtotal: number }[] => {
        let remainder = Math.max(0, Math.floor(totalAmount));
        const denoms: SilverDenominationValue[] = [100, 50, 10, 5, 1];
        const res: { value: SilverDenominationValue; count: number; subtotal: number }[] = [];

        for (const v of denoms) {
          const count = Math.floor(remainder / v);
          res.push({
            value: v,
            count,
            subtotal: count * v
          });
          remainder %= v;
        }
        return res;
      };
    },

    // 综合榜单计算方法：传入时间段（day, week, month, year, total）
    getRankingsByPeriod(state) {
      return (period: RankingPeriod): MemberRankingStat[] => {
        const now = new Date();
        let startTimestamp = 0;

        if (period === 'day') {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          startTimestamp = start.getTime();
        } else if (period === 'week') {
          // 本周一 00:00:00
          const day = now.getDay() || 7;
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
          startTimestamp = start.getTime();
        } else if (period === 'month') {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          startTimestamp = start.getTime();
        } else if (period === 'year') {
          const start = new Date(now.getFullYear(), 0, 1);
          startTimestamp = start.getTime();
        } else {
          // total 历史累计
          startTimestamp = 0;
        }

        const statsMap = new Map<string, {
          reward: number;
          penalty: number;
          count: number;
        }>();

        state.members.forEach(m => {
          statsMap.set(m.id, { reward: 0, penalty: 0, count: 0 });
        });

        state.transactions.forEach(tx => {
          const txTime = new Date(tx.timestamp).getTime();
          if (txTime >= startTimestamp) {
            const entry = statsMap.get(tx.memberId);
            if (entry) {
              if (tx.type === 'reward') {
                entry.reward += tx.amount;
              } else {
                entry.penalty += tx.amount;
              }
              entry.count += 1;
            }
          }
        });

        const list: MemberRankingStat[] = state.members.map(m => {
          const stat = statsMap.get(m.id) || { reward: 0, penalty: 0, count: 0 };
          const net = stat.reward - stat.penalty;
          return {
            memberId: m.id,
            name: m.name,
            role: m.role,
            avatar: m.avatar,
            currentBalance: m.balance,
            periodReward: stat.reward,
            periodPenalty: stat.penalty,
            netScore: period === 'total' ? m.balance : net,
            actionCount: stat.count,
            rank: 1
          };
        });

        // 排序规则：netScore 降序，其次 actionCount 降序
        list.sort((a, b) => b.netScore - a.netScore || b.periodReward - a.periodReward);

        list.forEach((item, idx) => {
          item.rank = idx + 1;
        });

        return list;
      };
    }
  },

  actions: {
    persist() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        const data = {
          members: this.members,
          orders: this.orders,
          transactions: this.transactions,
          selectedMemberId: this.selectedMemberId,
          currentRankingPeriod: this.currentRankingPeriod
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to persist silver store to localStorage', e);
      }
    },

    selectMember(memberId: string) {
      this.selectedMemberId = memberId;
      this.persist();
    },

    setRankingPeriod(period: RankingPeriod) {
      this.currentRankingPeriod = period;
      this.persist();
    },

    // 核心动作：奉令结算（行赏 / 行罚）
    issueOrder(params: {
      memberId: string;
      orderId?: string;
      title: string;
      type: OrderType;
      amount: number;
      note?: string;
      operator?: string;
    }): SilverTransaction {
      const member = this.members.find(m => m.id === params.memberId);
      if (!member) {
        throw new Error('未找到对应家庭成员');
      }

      const amount = Math.max(0, Math.floor(params.amount));
      if (params.type === 'reward') {
        member.balance += amount;
        member.totalReward += amount;
        sound.playCoinSound();
      } else {
        member.balance = Math.max(0, member.balance - amount);
        member.totalPenalty += amount;
        sound.playErrorSound();
      }

      const tx: SilverTransaction = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        memberId: member.id,
        memberName: member.name,
        orderId: params.orderId,
        orderTitle: params.title,
        type: params.type,
        amount,
        balanceAfter: member.balance,
        timestamp: new Date().toISOString(),
        note: params.note || '',
        operator: params.operator || '当值掌柜'
      };

      this.transactions.unshift(tx);
      this.persist();
      return tx;
    },

    // 家庭成员 CRUD
    addMember(member: Omit<FamilyMember, 'id' | 'balance' | 'totalReward' | 'totalPenalty' | 'createdAt'> & { initialBalance?: number }) {
      const initBal = member.initialBalance || 0;
      const newMember: FamilyMember = {
        id: 'm_' + Date.now().toString(36),
        name: member.name.trim(),
        role: member.role.trim() || '家庭成员',
        avatar: member.avatar || '😊',
        title: member.title || '齐家新秀',
        balance: initBal,
        totalReward: initBal,
        totalPenalty: 0,
        customNote: (member as any).customNote || {
          enabled: true,
          bankName: member.name.trim() + '宝库',
          holderLabel: '持票人',
          sealText: member.name.trim(),
          motto: '日进有功，学海无涯',
          leftSlogan: '日进有功',
          rightSlogan: '童叟无欺',
          themePreset: 'classic'
        },
        createdAt: new Date().toISOString()
      };
      this.members.push(newMember);
      this.selectedMemberId = newMember.id;
      this.persist();
      return newMember;
    },

        updateMemberCustomNote(memberId: string, customNote: MemberNoteCustomization) {
      const idx = this.members.findIndex(m => m.id === memberId);
      if (idx !== -1) {
        this.members[idx].customNote = { ...customNote };
        this.persist();
      }
    },
    updateMember(id: string, updates: Partial<FamilyMember>) {
      const idx = this.members.findIndex(m => m.id === id);
      if (idx !== -1) {
        this.members[idx] = { ...this.members[idx], ...updates };
        this.persist();
      }
    },

    deleteMember(id: string) {
      if (this.members.length <= 1) {
        throw new Error('家庭至少保留一位成员');
      }
      this.members = this.members.filter(m => m.id !== id);
      this.transactions = this.transactions.filter(t => t.memberId !== id);
      if (this.selectedMemberId === id) {
        this.selectedMemberId = this.members[0].id;
      }
      this.persist();
    },

    // 家庭令 CRUD
    addOrder(order: Omit<FamilyOrder, 'id' | 'createdAt'>) {
      const newOrder: FamilyOrder = {
        id: 'ord_' + Date.now().toString(36),
        title: order.title.trim(),
        description: order.description?.trim() || '',
        type: order.type,
        amount: Math.max(1, Math.floor(order.amount)),
        category: order.category,
        icon: order.icon || (order.type === 'reward' ? 'sparkles' : 'alert-triangle'),
        targetMemberId: order.targetMemberId,
        enabled: true,
        createdAt: new Date().toISOString()
      };
      this.orders.unshift(newOrder);
      this.persist();
      return newOrder;
    },

    updateOrder(id: string, updates: Partial<FamilyOrder>) {
      const idx = this.orders.findIndex(o => o.id === id);
      if (idx !== -1) {
        this.orders[idx] = { ...this.orders[idx], ...updates };
        this.persist();
      }
    },

    deleteOrder(id: string) {
      this.orders = this.orders.filter(o => o.id !== id);
      this.persist();
    },

    // 撤销流水记账（回滚结存）
    deleteTransaction(txId: string) {
      const tx = this.transactions.find(t => t.id === txId);
      if (!tx) return;

      const member = this.members.find(m => m.id === tx.memberId);
      if (member) {
        if (tx.type === 'reward') {
          member.balance = Math.max(0, member.balance - tx.amount);
          member.totalReward = Math.max(0, member.totalReward - tx.amount);
        } else {
          member.balance += tx.amount;
          member.totalPenalty = Math.max(0, member.totalPenalty - tx.amount);
        }
      }

      this.transactions = this.transactions.filter(t => t.id !== txId);
      this.persist();
    },

    // 重置演示数据
    resetToDefault() {
      this.members = getInitialMembers();
      this.orders = getInitialOrders();
      this.transactions = getInitialTransactions();
      this.selectedMemberId = 'm_nuobao';
      this.currentRankingPeriod = 'week';
      this.persist();
    }
  }
});

