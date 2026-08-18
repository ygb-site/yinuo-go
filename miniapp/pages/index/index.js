Page({
  data: {
    // 绑定您自己的官方专属独立域名（合法备案后在小程序中 100% 直连秒开，0 拦截！）
    webUrl: 'https://yinuogo.cn/'
  },
  onLoad(options) {
    if (options && options.url) {
      this.setData({ webUrl: decodeURIComponent(options.url) });
    }
  },
  onShareAppMessage() {
    return {
      title: '一诺弈学 (YiNuo Go) - 少儿互动启蒙围棋世界',
      path: '/pages/index/index'
    };
  }
});
