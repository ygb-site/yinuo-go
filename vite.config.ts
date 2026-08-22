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

/**
 * 开发/预览模式下提供 AI / LLM 跨域转发代理 (解决浏览器直接请求大模型 API 的 CORS 限制)
 */
function llmProxyPlugin(): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end('Method Not Allowed');
      return;
    }

    let bodyData = '';
    req.on('data', (chunk) => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      try {
        const { targetUrl, headers, payload } = JSON.parse(bodyData || '{}');
        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing targetUrl' }));
          return;
        }

        const remote = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(headers || {})
          },
          body: JSON.stringify(payload || {})
        });

        const dataText = await remote.text();
        res.statusCode = remote.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(dataText);
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err?.message || 'Proxy request failed' }));
      }
    });
  };

  const mount = (middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) => {
    middlewares.use((req, res, next) => {
      if (req.url && req.url.startsWith('/api/llm-proxy')) {
        void handle(req, res);
        return;
      }
      next();
    });
  };

  return {
    name: 'yinuo-llm-proxy',
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
  plugins: [vue(), ttsProxyPlugin(), llmProxyPlugin()],
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

