import { GoGame } from '../../engine/GoGame.js';
import { GoAI } from '../../engine/GoAI.js';

Page({
  data: {
    size: 7,
    centerCoord: 350,
    gridLines: [0, 1, 2, 3, 4, 5, 6],
    stonesList: [],
    touchGrid: [],
    lastMove: null,
    isPlayerTurn: true,
    aiLevelName: '小狗贝贝 25K',
    blackCaptures: 0,
    whiteCaptures: 0
  },

  onLoad() {
    this.resetGame();
  },

  resetGame() {
    this.game = new GoGame(7);
    const sz = 7;
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
      size: 7,
      centerCoord: 350,
      gridLines: lines,
      touchGrid: touches,
      stonesList: [],
      lastMove: null,
      isPlayerTurn: true,
      blackCaptures: 0,
      whiteCaptures: 0
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
    if (!this.data.isPlayerTurn) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);

    if (this.game.getCell(r, c)) return;

    const check = this.game.isLegalMove(r, c, 'B');
    if (!check.legal) {
      wx.showToast({ title: check.reason || '不能下在这里', icon: 'none' });
      return;
    }

    const res = this.game.playMove(r, c, 'B');
    if (res.success) {
      try { wx.vibrateShort({ type: 'light' }); } catch (_) {}
      this.setData({
        stonesList: this.getStonesList(7),
        lastMove: { cx: c * 100 + 50, cy: r * 100 + 50 },
        blackCaptures: this.game.captures.B,
        isPlayerTurn: false
      });

      // AI 智能应手
      setTimeout(() => {
        const aiMove = GoAI.getBestMove(this.game, 'W', 1);
        if (aiMove) {
          this.game.playMove(aiMove.r, aiMove.c, 'W');
          try { wx.vibrateShort({ type: 'light' }); } catch (_) {}
          this.setData({
            stonesList: this.getStonesList(7),
            lastMove: { cx: aiMove.c * 100 + 50, cy: aiMove.r * 100 + 50 },
            whiteCaptures: this.game.captures.W,
            isPlayerTurn: true
          });
        } else {
          this.setData({ isPlayerTurn: true });
        }
      }, 500);
    }
  },

  passMove() {
    this.game.pass();
    wx.showToast({ title: '黑棋停一手', icon: 'none' });
    this.setData({ isPlayerTurn: false });

    setTimeout(() => {
      const aiMove = GoAI.getBestMove(this.game, 'W', 1);
      if (aiMove) {
        this.game.playMove(aiMove.r, aiMove.c, 'W');
        this.setData({
          stonesList: this.getStonesList(7),
          lastMove: { cx: aiMove.c * 100 + 50, cy: aiMove.r * 100 + 50 },
          isPlayerTurn: true
        });
      } else {
        this.setData({ isPlayerTurn: true });
      }
    }, 500);
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

