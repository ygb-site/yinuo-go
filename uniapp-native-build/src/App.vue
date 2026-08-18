<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('一诺弈学 Launch');
});
</script>

<style>
@import './style.css';

page {
  background-color: #FDFBF7;
  color: #2D3748;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

view, text, button, image, scroll-view {
  box-sizing: border-box;
}
</style>

