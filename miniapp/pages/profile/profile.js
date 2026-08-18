import { USER_RANKS } from '../../data/achievementsData.js';

Page({
  data: {
    nickname: '小棋手',
    avatar: '🦁',
    stars: 3,
    coins: 180,
    exp: 0,
    solvedCount: 0,
    rankTitle: '围棋小新星 25K'
  },

  onShow() {
    const app = getApp();
    const d = (app && app.globalData) ? app.globalData : {};
    let rank = USER_RANKS[0];
    for (const r of USER_RANKS) {
      if ((d.exp || 0) >= r.minExp) rank = r;
      else break;
    }

    this.setData({
      nickname: d.nickname || '小棋手',
      avatar: d.avatar || '🦁',
      stars: d.stars !== undefined ? d.stars : 3,
      coins: d.coins !== undefined ? d.coins : 180,
      exp: d.exp || 0,
      solvedCount: (d.solvedPuzzles || []).length,
      rankTitle: rank.title
    });
  },

  goHome() {
    wx.navigateBack();
  },

  navTo(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  }
});

