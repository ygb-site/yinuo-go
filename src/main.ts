import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import './style.css';
import { registerPwaServiceWorker } from './utils/pwa';
import { purgeLegacyPersistedApiKey } from './stores/useAiTutorStore';

// 启动即清理历史版本落盘的第三方模型密钥，不依赖 store 是否被 hydrate
purgeLegacyPersistedApiKey();

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.mount('#app');

// 注册 PWA 离线支持与安装侦听
registerPwaServiceWorker();
