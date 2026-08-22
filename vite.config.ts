import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * 开发/预览时把朗读请求转到百度 TTS。
 * 浏览器直连会带 Referer，接口返回空页，Audio 立刻 error，按钮状态一闪就回去。
 */
function ttsProxyPlugin(): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const incoming = new URL(req.url || '', 'http://127.0.0.1');
    const text = incoming.searchParams.get('text') || '';
    if (!text) {
      res.statusCode = 400;
      res.end('missing text');
      return;
    }

    const target =
      'https://fanyi.baidu.com/gettts?lan=zh&spd=4&source=web&text=' + encodeURIComponent(text);

    try {
      const remote = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      const buf = Buffer.from(await remote.arrayBuffer());
      const contentType = remote.headers.get('content-type') || '';
      if (!contentType.includes('audio') || buf.length < 800) {
        res.statusCode = 502;
        res.end('tts empty');
        return;
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-store');
      res.end(buf);
    } catch {
      res.statusCode = 502;
      res.end('tts fetch failed');
    }
  };

  const mount = (middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) => {
    middlewares.use((req, res, next) => {
      if (req.url && req.url.startsWith('/api/tts')) {
        void handle(req, res);
        return;
      }
      next();
    });
  };

  return {
    name: 'yinuo-tts-proxy',
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ttsProxyPlugin()],
  base: '/', // HTML5 History 模式（无 # 号模式）统一使用根路径 /
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('katex')) {
              return 'vendor-katex';
            }
            if (id.includes('hanzi-writer') || id.includes('pinyin-pro')) {
              return 'vendor-hanzi';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-vue-next')) {
              return 'vendor-lucide';
            }
            if (id.includes('canvas-confetti') || id.includes('howler')) {
              return 'vendor-effects';
            }
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor-vue-core';
            }
            return 'vendor-other';
          }
        }
      }
    }
  }
});

