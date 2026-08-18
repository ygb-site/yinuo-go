import { TSUMEGO_PUZZLES } from '../../data/tsumegoLibrary.js';
import { GoGame } from '../../engine/GoGame.js';

Page({
  data: {
    puzzle: {},
    currentIndex: 0,
    totalPuzzles: TSUMEGO_PUZZLES.length,
    size: 5,
    centerCoord: 250,
    gridLines: [0, 1, 2, 3, 4],
    stonesList: [],
    touchGrid: [],
    lastMove: null,
    isSolved: false
  },

  onLoad(options) {
    const idx = options.idx ? parseInt(options.idx) : 0;
    this.loadPuzzle(idx);
  },

  loadPuzzle(idx) {
    const p = TSUMEGO_PUZZLES[idx] || TSUMEGO_PUZZLES[0];
    const sz = p.boardSize || 5;
    this.game = new GoGame(sz);

    if (p.initialStones) {
      for (const s of p.initialStones) {
        this.game.setCell(s.r, s.c, s.color);
      }
    }
    this.game.turn = p.playerColor || 'B';

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
      puzzle: p,
      currentIndex: idx,
      size: sz,
      centerCoord: Math.floor(sz / 2) * 100 + 50,
      gridLines: lines,
      touchGrid: touches,
      stonesList: this.getStonesList(sz),
      lastMove: null,
      isSolved: false
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
    if (this.data.isSolved) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);

    if (this.game.getCell(r, c)) return;

    const p = this.data.puzzle;
    const ok = p.correctMoves && p.correctMoves.some(m => m.r === r && m.c === c);

    if (ok) {
      this.game.setCell(r, c, p.playerColor || 'B');
      try { wx.vibrateShort({ type: 'medium' }); } catch (_) {}
      this.setData({
        stonesList: this.getStonesList(this.data.size),
        lastMove: { cx: c * 100 + 50, cy: r * 100 + 50 },
        isSolved: true
      });

      const app = getApp();
      if (app && app.recordPuzzleSolved) {
        app.recordPuzzleSolved(p.id);
      }
      wx.showToast({ title: '🎯 死活正解！', icon: 'success' });
    } else {
      try { wx.vibrateShort({ type: 'heavy' }); } catch (_) {}
      wx.showToast({ title: '没有命中死活急所，再试一次！', icon: 'none' });
    }
  },

  resetCurrent() {
    this.loadPuzzle(this.data.currentIndex);
  },

  showHint() {
    const p = this.data.puzzle;
    if (p.correctMoves && p.correctMoves.length > 0) {
      const colLetter = ['A', 'B', 'C', 'D', 'E'][p.correctMoves[0].c];
      const rowNum = this.data.size - p.correctMoves[0].r;
      wx.showModal({
        title: '💡 名师锦囊提示',
        content: '尝试走在 [' + colLetter + rowNum + '] 急所点试试看！',
        showCancel: false
      });
    }
  },

  nextPuzzle() {
    if (this.data.currentIndex < TSUMEGO_PUZZLES.length - 1) {
      this.loadPuzzle(this.data.currentIndex + 1);
    } else {
      wx.showToast({ title: '恭喜通关所有死活题！', icon: 'success' });
    }
  },

  goHome() {
    wx.navigateBack();
  },

  navTo(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.redirectTo({ url });
    }
  }
});

