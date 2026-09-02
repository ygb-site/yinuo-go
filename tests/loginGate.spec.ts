import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../src/stores/useUserStore';

describe('未登录导航拦截', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('requireLogin：未登录弹登录框并返回 false', () => {
    const store = useUserStore();
    expect(store.requireLogin()).toBe(false);
    expect(store.showAuthModal).toBe(true);
  });

  it('requireLogin：已登录返回 true，不反复弹窗', () => {
    const store = useUserStore();
    store.isLoggedIn = true;
    store.showAuthModal = false;
    expect(store.requireLogin()).toBe(true);
    expect(store.showAuthModal).toBe(false);
  });

  it('路由守卫在鉴权就绪后拦截非首页', () => {
    const source = readFileSync(resolve(__dirname, '../src/router/index.ts'), 'utf8');
    expect(source).toMatch(/ensureAuthReady/);
    expect(source).toMatch(/openAuthModal/);
    expect(source).toMatch(/isPublicHome/);
  });

  it('侧栏与首页点击会走 requireLogin', () => {
    const shell = readFileSync(resolve(__dirname, '../src/layouts/ChildShell.vue'), 'utf8');
    expect(shell).toMatch(/requireLogin/);
    expect(shell).toMatch(/goToParentDashboard/);
    expect(shell).not.toMatch(/goToCompanionHandbook/);

    const home = readFileSync(resolve(__dirname, '../src/views/HomeView.vue'), 'utf8');
    expect(home).toMatch(/requireLogin/);
  });
});
