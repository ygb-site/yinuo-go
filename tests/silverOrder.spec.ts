import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSilverStore, SILVER_DENOMINATIONS } from '../src/stores/useSilverStore';

describe('SilverOrder Store & Family Points System', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with standard 5 denominations and default demo data', () => {
    const store = useSilverStore();
    expect(SILVER_DENOMINATIONS[1].label).toBe('壹两');
    expect(SILVER_DENOMINATIONS[5].label).toBe('伍两');
    expect(SILVER_DENOMINATIONS[10].label).toBe('拾两');
    expect(SILVER_DENOMINATIONS[50].label).toBe('伍拾两');
    expect(SILVER_DENOMINATIONS[100].label).toBe('壹百两');

    expect(store.members.length).toBeGreaterThanOrEqual(3);
    expect(store.orders.length).toBeGreaterThan(0);
    expect(store.transactions.length).toBeGreaterThan(0);
  });

  it('should correctly break down balance into banknote counts', () => {
    const store = useSilverStore();
    // 168两: 100两x1, 50两x1, 10两x1, 5两x1, 1两x3
    const breakdown = store.getDenominationBreakdown(168);
    const count100 = breakdown.find(b => b.value === 100)?.count;
    const count50 = breakdown.find(b => b.value === 50)?.count;
    const count10 = breakdown.find(b => b.value === 10)?.count;
    const count5 = breakdown.find(b => b.value === 5)?.count;
    const count1 = breakdown.find(b => b.value === 1)?.count;

    expect(count100).toBe(1);
    expect(count50).toBe(1);
    expect(count10).toBe(1);
    expect(count5).toBe(1);
    expect(count1).toBe(3);
  });

  it('should issue reward order and update member balance and ledger', () => {
    const store = useSilverStore();
    const member = store.members[0];
    const initialBal = member.balance;

    const tx = store.issueOrder({
      memberId: member.id,
      title: '专注阅读30分钟',
      type: 'reward',
      amount: 10,
      note: '特别认真'
    });

    expect(member.balance).toBe(initialBal + 10);
    expect(tx.amount).toBe(10);
    expect(tx.type).toBe('reward');
    expect(store.transactions[0].id).toBe(tx.id);
  });

  it('should issue penalty order and deduct balance', () => {
    const store = useSilverStore();
    const member = store.members[0];
    const initialBal = member.balance;

    const tx = store.issueOrder({
      memberId: member.id,
      title: '看电视超时未收',
      type: 'penalty',
      amount: 5,
      note: '提醒后收看'
    });

    expect(member.balance).toBe(Math.max(0, initialBal - 5));
    expect(tx.type).toBe('penalty');
    expect(tx.amount).toBe(5);
  });

  it('should correctly rollback balance when transaction is deleted', () => {
    const store = useSilverStore();
    const member = store.members[0];
    const initialBal = member.balance;

    const tx = store.issueOrder({
      memberId: member.id,
      title: '测试奖励',
      type: 'reward',
      amount: 20
    });
    expect(member.balance).toBe(initialBal + 20);

    store.deleteTransaction(tx.id);
    expect(member.balance).toBe(initialBal);
  });

  it('should compute rankings across different periods (day/week/month/year/total)', () => {
    const store = useSilverStore();
    const dayRanking = store.getRankingsByPeriod('day');
    const weekRanking = store.getRankingsByPeriod('week');
    const totalRanking = store.getRankingsByPeriod('total');

    expect(dayRanking.length).toBe(store.members.length);
    expect(weekRanking.length).toBe(store.members.length);
    expect(totalRanking.length).toBe(store.members.length);
    expect(totalRanking[0].rank).toBe(1);
    expect(totalRanking[0].netScore).toBeGreaterThanOrEqual(totalRanking[1].netScore);
  });
});


  it('should support personalized silver notes with member name, seal, and bankName', () => {
    const store = useSilverStore();
    const nuobao = store.members.find(m => m.name === '诺宝');
    expect(nuobao).toBeDefined();
    expect(nuobao?.customNote?.enabled).toBe(true);
    expect(nuobao?.customNote?.bankName).toBe('诺宝宝库');
    expect(nuobao?.customNote?.sealText).toBe('诺宝');

    // Update custom note
    store.updateMemberCustomNote(nuobao!.id, {
      enabled: true,
      bankName: '诺宝状元钱庄',
      holderLabel: '持票少侠',
      sealText: '状元之印',
      motto: '棋道精进，自强不息',
      leftSlogan: '棋道精进',
      rightSlogan: '自律自强',
      themePreset: 'gold'
    });

    const updated = store.members.find(m => m.name === '诺宝');
    expect(updated?.customNote?.bankName).toBe('诺宝状元钱庄');
    expect(updated?.customNote?.sealText).toBe('状元之印');
    expect(updated?.customNote?.themePreset).toBe('gold');
  });

  it('should auto-initialize custom note when adding a new family member', () => {
    const store = useSilverStore();
    const newMember = store.addMember({
      name: '小石头',
      role: '次子',
      avatar: '👶',
      title: '弈道新星',
      initialBalance: 30
    });

    expect(newMember.name).toBe('小石头');
    expect(newMember.customNote).toBeDefined();
    expect(newMember.customNote?.bankName).toContain('小石头');
  });
