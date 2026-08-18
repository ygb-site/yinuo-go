import { CHAPTERS_DATA } from '../../data/chapters.js';
import { GoGame } from '../../engine/GoGame.js';

Page({
  data: {
    lesson: {},
    size: 5,
    centerCoord: 250,
    gridLines: [0, 1, 2, 3, 4],
    stonesList: [],
    touchGrid: [],
    lastMove: null,
    isCompleted: false
  },

  onLoad(options) {
    const lessonId = options.id || 'lesson_1_1';
    let target = null;
    for (const c of CHAPTERS_DATA) {
      const l = c.lessons.find(lvl => lvl.id === lessonId);
      if (l) { target = l; break; }
    }
    if (!target) target = CHAPTERS_DATA[0].lessons[0];

    const sz = target.boardSize || 5;
    this.game = new GoGame(sz);
    if (target.initialStones) {
      for (const s of target.initialStones) {
        this.game.setCell(s.r, s.c, s.color);
      }
    }
    this.game.turn = target.playerColor || 'B';

    const lines = [];
    for (let i = 0; i < sz; i++) lines.push(i);

    const touches = [];
    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        touches.push({
          key: r + '-' + c,
          r: r,
          c: c,
          x: c * 100,
          y: r * 100
        });
      }
    }

    this.setData({
      lesson: target,
      size: sz,
      centerCoord: Math.floor(sz / 2) * 100 + 50,
      gridLines: lines,
      touchGrid: touches,
      stonesList: this.getStonesList(sz),
      isCompleted: false,
      lastMove: null
    });
  },

  getStonesList(sz) {
    const list = [];
    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        const color = this.game.getCell(r, c);
        if (color) {
          list.push({
            key: r + '-' + c + '-' + color,
            r: r,
            c: c,
            color: color,
            cx: c * 100 + 50,
            cy: r * 100 + 50
          });
        }
      }
    }
    return list;
  },

  handleCellTap(e) {
    if (this.data.isCompleted) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);

    if (this.game.getCell(r, c)) return;

    const l = this.data.lesson;
    const ok = l.correctMoves && l.correctMoves.some(m => m.r === r && m.c === c);

    if (ok) {
      this.game.setCell(r, c, l.playerColor || 'B');
      try { wx.vibrateShort({ type: 'medium' }); } catch (_) {}
      this.setData({
        stonesList: this.getStonesList(this.data.size),
        lastMove: { cx: c * 100 + 50, cy: r * 100 + 50 },
        isCompleted: true
      });
      const app = getApp();
      if (app && app.updateLessonProgress) {
        app.updateLessonProgress(l.id, 3);
      }
    } else {
      try { wx.vibrateShort({ type: 'heavy' }); } catch (_) {}
      wx.showToast({ title: '差一点点，再试一次！', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  replay() {
    this.onLoad({ id: this.data.lesson.id });
  },

  goNext() {
    let all = [];
    for (const c of CHAPTERS_DATA) all.push(...c.lessons);
    const idx = all.findIndex(lvl => lvl.id === this.data.lesson.id);
    if (idx >= 0 && idx < all.length - 1) {
      const nextId = all[idx + 1].id;
      wx.redirectTo({ url: '/pages/lesson/lesson?id=' + nextId });
    } else {
      wx.navigateBack();
    }
  }
});

