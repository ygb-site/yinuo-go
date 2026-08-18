<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  try {
    // 微信小程序端加载官方可爱卡通中文字体
    // @ts-ignore
    if (typeof wx !== 'undefined' && wx.loadFontFace) {
      // @ts-ignore
      wx.loadFontFace({
        family: 'ZCOOL KuaiLe',
        source: 'url("https://fonts.gstatic.com/s/zcoolkuaile/v19/zOL-4prXi3-ubrAiM6S3kg_Vnd0.woff2")',
        global: true
      });
      // @ts-ignore
      wx.loadFontFace({
        family: 'Fredoka',
        source: 'url("https://fonts.gstatic.com/s/fredoka/v14/X7nP43ZwgV7EhUfv79znDQ.woff2")',
        global: true
      });
    }
  } catch (e) {
    console.warn('Font load error:', e);
  }
});
</script>

<style>
@import './style.css';

page {
  background-color: #FDFBF7;
  color: #2D3748;
  font-family: 'ZCOOL KuaiLe', 'Fredoka', 'Quicksand', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
}

view, text, button, image, scroll-view {
  box-sizing: border-box;
}

.font-cartoon {
  font-family: 'ZCOOL KuaiLe', 'Fredoka', 'Quicksand', -apple-system, sans-serif !important;
}
</style>

