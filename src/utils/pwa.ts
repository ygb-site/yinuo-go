import { ref } from 'vue';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const canInstallPwa = ref(false);
export const isPwaInstalled = ref(false);
export const isOffline = ref(!navigator.onLine);
export const hasPwaUpdate = ref(false);

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export function registerPwaServiceWorker() {
  lockPortraitOrientation();
  if (typeof window !== "undefined") {
    const handleUserGesture = () => lockPortraitOrientation();
    window.addEventListener("touchstart", handleUserGesture, { passive: true, once: true });
    window.addEventListener("pointerdown", handleUserGesture, { passive: true, once: true });
  }
  if (typeof window === 'undefined') return;

  // 1. Check if running as standalone PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
  isPwaInstalled.value = isStandalone;

  // 2. Network state listeners
  window.addEventListener('online', () => {
    isOffline.value = false;
  });
  window.addEventListener('offline', () => {
    isOffline.value = true;
  });

  // 3. Listen to beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    canInstallPwa.value = true;
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    canInstallPwa.value = false;
    isPwaInstalled.value = true;
  });

  // 4. Register Service Worker in production or local environments with SW support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  hasPwaUpdate.value = true;
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
}

/**
 * 调起浏览器原生安装 PWA 提示 (Prompt PWA Installation)
 */
export async function promptInstallPwa(): Promise<boolean> {
  if (!deferredInstallPrompt) {
    return false;
  }

  try {
    await deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      canInstallPwa.value = false;
      deferredInstallPrompt = null;
      return true;
    }
    return false;
  } catch (err) {
    console.error('[PWA] Prompt error:', err);
    return false;
  }
}

/**
 * 应用最新更新 (Apply PWA Update)
 */
export function applyPwaUpdate() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

/**
 * 锁定移动端设备为竖屏方向 (Lock Screen to Portrait Orientation)
 */
export function lockPortraitOrientation() {
  if (typeof window === "undefined" || !("screen" in window)) return;
  try {
    const orientation = (window.screen as any).orientation || (window.screen as any).mozOrientation || (window.screen as any).msOrientation;
    if (orientation && typeof orientation.lock === "function") {
      orientation.lock("portrait-primary").catch(() => {
        orientation.lock("portrait").catch(() => {});
      });
    }
  } catch {}
}
