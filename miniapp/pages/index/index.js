import { USER_RANKS } from '../../data/achievementsData.js';

Page({
  data: {
    nickname: '小棋手',
    avatar: '🐼',
    stars: 3,
    coins: 100,
    exp: 0,
    solvedCount: 0,
    soundOn: true,
    showQuestModal: false
  },

  onShow() {
    const app = getApp();
    const d = (app && app.globalData) ? app.globalData : {};
    this.setData({
      nickname: d.nickname || '小棋手',
      avatar: d.avatar || '🐼',
      stars: d.stars !== undefined ? d.stars : 3,
      coins: d.coins !== undefined ? d.coins : 100,
      exp: d.exp || 0,
      solvedCount: (d.solvedPuzzles || []).length
    });
  },

  toggleSound() {
    this.setData({ soundOn: !this.data.soundOn });
    try { wx.vibrateShort({ type: 'light' }); } catch (_) {}
  },

  openHelp() {
    wx.showModal({
      title: '一诺弈学 · 使用指南',
      content: '欢迎来到少儿围棋启蒙世界！点击各大卡片即可开启趣味闯关、死活题库与人机对弈！',
      showCancel: false,
      confirmText: '明白啦'
    });
  },

  openQuestModal() {
    this.setData({ showQuestModal: true });
  },

  closeQuestModal() {
    this.setData({ showQuestModal: false });
  },

  stopBubble() {},

  navTo(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  }
});

