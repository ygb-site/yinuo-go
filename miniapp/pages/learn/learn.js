import { CHAPTERS_DATA } from '../../data/chapters.js';

Page({
  data: {
    nickname: '1',
    coins: 180,
    totalStars: 3,
    chapters: [],
    activeChapterId: 1,
    activeChapter: {}
  },

  onShow() {
    const app = getApp();
    const d = (app && app.globalData) ? app.globalData : {};

    const progress = d.progress || {};
    let earnedStars = d.stars !== undefined ? d.stars : 3;

    const allLessons = [];
    for (const c of CHAPTERS_DATA) {
      allLessons.push(...c.lessons);
    }

    const decoratedChapters = CHAPTERS_DATA.map(c => {
      const lessons = c.lessons.map(l => {
        const idx = allLessons.findIndex(item => item.id === l.id);
        let isUnlocked = true;
        if (idx > 0) {
          const prev = allLessons[idx - 1];
          isUnlocked = !!(progress[prev.id] && progress[prev.id].completed) || (l.id === 'lesson_1_1' || l.id === 'c1_l1');
        }
        const rec = progress[l.id];
        const stars = rec ? (rec.stars || 0) : (l.id === 'lesson_1_1' ? 3 : 0);
        return {
          ...l,
          isUnlocked,
          stars
        };
      });

      return {
        ...c,
        lessons
      };
    });

    const currentChap = decoratedChapters.find(c => c.id === this.data.activeChapterId) || decoratedChapters[0];

    this.setData({
      nickname: d.nickname || '1',
      coins: d.coins !== undefined ? d.coins : 180,
      totalStars: earnedStars,
      chapters: decoratedChapters,
      activeChapter: currentChap
    });
  },

  selectChapter(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const chap = this.data.chapters.find(c => c.id === id) || this.data.chapters[0];
    this.setData({
      activeChapterId: id,
      activeChapter: chap
    });
    try { wx.vibrateShort({ type: 'light' }); } catch (_) {}
  },

  startLesson(e) {
    const unlocked = e.currentTarget.dataset.unlocked;
    const id = e.currentTarget.dataset.id;
    if (!unlocked) {
      wx.showToast({ title: '请先通关上一关解锁哦！', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/lesson/lesson?id=' + id
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

