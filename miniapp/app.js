App({
  globalData: {
    nickname: '小棋手',
    avatar: '🦁',
    exp: 0,
    coins: 100,
    stars: 3,
    progress: {
      lesson_1_1: { completed: true, stars: 3 }
    },
    solvedPuzzles: []
  },

  onLaunch() {
    try {
      const saved = wx.getStorageSync('yinuo_user_profile');
      if (saved) {
        const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
        Object.assign(this.globalData, parsed);
      }
    } catch (e) {
      console.warn('Load user data error:', e);
    }
  },

  saveUserData() {
    try {
      wx.setStorageSync('yinuo_user_profile', JSON.stringify(this.globalData));
    } catch (e) {
      console.warn('Save user data error:', e);
    }
  },

  addExp(amount) {
    this.globalData.exp = (this.globalData.exp || 0) + amount;
    this.saveUserData();
  },

  addCoins(amount) {
    this.globalData.coins = (this.globalData.coins || 0) + amount;
    this.saveUserData();
  },

  updateLessonProgress(lessonId, stars) {
    this.globalData.progress = this.globalData.progress || {};
    const prev = this.globalData.progress[lessonId]?.stars || 0;
    this.globalData.progress[lessonId] = {
      completed: true,
      stars: Math.max(prev, stars)
    };
    if (stars > prev) {
      this.globalData.stars = (this.globalData.stars || 0) + (stars - prev);
    }
    this.addExp(60);
    this.addCoins(25);
    this.saveUserData();
  },

  recordPuzzleSolved(puzzleId) {
    this.globalData.solvedPuzzles = this.globalData.solvedPuzzles || [];
    if (!this.globalData.solvedPuzzles.includes(puzzleId)) {
      this.globalData.solvedPuzzles.push(puzzleId);
      this.addExp(50);
      this.addCoins(20);
      this.saveUserData();
    }
  }
});

