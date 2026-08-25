import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  useAiTutorStore,
  purgeLegacyPersistedApiKey,
  AI_TUTOR_PERSIST_KEY,
  AI_TUTOR_PERSISTED_FIELDS
} from '../src/stores/useAiTutorStore';
import { useUserStore } from '../src/stores/useUserStore';
import { createSafeProfileArchive } from '../src/services/dataArchiveService';

/**
 * 极简 localStorage 桩：只需要满足密钥清理逻辑的读写语义
 */
function createStorageStub() {
  const backing = new Map<string, string>();
  return {
    backing,
    api: {
      getItem: (k: string) => (backing.has(k) ? backing.get(k)! : null),
      setItem: (k: string, v: string) => void backing.set(k, String(v)),
      removeItem: (k: string) => void backing.delete(k),
      clear: () => backing.clear(),
      key: (i: number) => Array.from(backing.keys())[i] ?? null,
      get length() {
        return backing.size;
      }
    }
  };
}

function installMemoryStorage() {
  const local = createStorageStub();
  const session = createStorageStub();
  vi.stubGlobal('window', { localStorage: local.api, sessionStorage: session.api });
  vi.stubGlobal('localStorage', local.api);
  vi.stubGlobal('sessionStorage', session.api);
  return { store: local.backing, sessionStore: session.backing };
}

const SECRET = 'sk-test-should-never-be-persisted-0001';

describe('第三方模型 API Key 不落盘保障', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.unstubAllGlobals();
  });

  it('落盘白名单不含密钥，按白名单序列化出的快照里没有 API Key', () => {
    const tutorStore = useAiTutorStore();
    tutorStore.saveConfig({ mode: 'custom_api', apiKey: SECRET });
    expect(tutorStore.config.apiKey).toBe(SECRET);

    expect(AI_TUTOR_PERSISTED_FIELDS).not.toContain('config.apiKey' as never);
    expect(AI_TUTOR_PERSISTED_FIELDS.some(f => f.toLowerCase().includes('apikey'))).toBe(false);

    // 复刻 persist 插件按 pick 生成落盘内容的过程
    const snapshot: Record<string, unknown> = {};
    for (const path of AI_TUTOR_PERSISTED_FIELDS) {
      const [root, field] = path.split('.');
      const rootValue = (tutorStore as any)[root];
      snapshot[path] = rootValue?.[field];
    }

    const serialized = JSON.stringify(snapshot);
    expect(serialized).not.toContain(SECRET);
    expect(serialized).not.toContain('apiKey');
    // 非密钥配置照常落盘，证明白名单本身是有效的
    expect(serialized).toContain('custom_api');
  });

  it('清理历史版本落盘数据后，浏览器存储里不再残留密钥', () => {
    const { store } = installMemoryStorage();
    store.set(
      AI_TUTOR_PERSIST_KEY,
      JSON.stringify({ config: { mode: 'custom_api', endpoint: 'https://x', apiKey: SECRET } })
    );

    purgeLegacyPersistedApiKey();

    const raw = store.get(AI_TUTOR_PERSIST_KEY) || '';
    expect(raw).not.toContain(SECRET);
    expect(raw).not.toContain('apiKey');
    // 非密钥配置应当被保留，清理不等于清空用户设置
    expect(raw).toContain('custom_api');
  });

  it('清理后不会再从云端配置恢复出密钥（旧数据不复活）', () => {
    const tutorStore = useAiTutorStore();

    tutorStore.applyRemoteConfig({
      mode: 'custom_api',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-v4-flash',
      autoSpeech: false,
      apiKey: SECRET
    } as any);

    expect(tutorStore.config.apiKey).toBe('');
    expect(tutorStore.config.mode).toBe('custom_api');
    expect(tutorStore.config.autoSpeech).toBe(false);
  });

  it('上传云端的 settings payload 不含密钥字段', () => {
    const tutorStore = useAiTutorStore();
    tutorStore.saveConfig({ mode: 'custom_api', apiKey: SECRET });

    // 复刻 syncToCloudNow 组装的 aiConfig 结构，验证其字段集合
    const aiConfigPayload = {
      mode: tutorStore.config.mode,
      endpoint: tutorStore.config.endpoint,
      model: tutorStore.config.model,
      autoSpeech: tutorStore.config.autoSpeech
    };

    const serialized = JSON.stringify({ soundEnabled: true, aiConfig: aiConfigPayload });
    expect(Object.keys(aiConfigPayload)).not.toContain('apiKey');
    expect(serialized).not.toContain(SECRET);
    expect(serialized).not.toContain('apiKey');
  });

  it('导出的儿童档案不含任何密钥字段', () => {
    const userStore = useUserStore();
    userStore.setCloudUser('parent_1', 'parent@example.com');
    const profile = userStore.createProfile('小诺', '🐼', 'g1_t1');
    expect(profile).not.toBeNull();

    const tutorStore = useAiTutorStore();
    tutorStore.saveConfig({ mode: 'custom_api', apiKey: SECRET });

    const serialized = JSON.stringify(createSafeProfileArchive(userStore.currentProfile));
    expect(serialized).not.toContain(SECRET);
    expect(serialized.toLowerCase()).not.toContain('apikey');
  });

  it('模拟页面刷新（store 重建）后内存中的密钥消失', () => {
    const first = useAiTutorStore();
    first.saveConfig({ mode: 'custom_api', apiKey: SECRET });
    expect(first.config.apiKey).toBe(SECRET);

    // 刷新等价于全新的 pinia 实例 + 仅从白名单字段 hydrate
    setActivePinia(createPinia());
    const afterReload = useAiTutorStore();
    expect(afterReload.config.apiKey).toBe('');
  });

  it('退出登录会立即清空内存中的密钥', () => {
    const userStore = useUserStore();
    userStore.setCloudUser('parent_2', 'parent2@example.com');
    const tutorStore = useAiTutorStore();
    tutorStore.saveConfig({ mode: 'custom_api', apiKey: SECRET });

    userStore.clearCloudUser();
    expect(tutorStore.config.apiKey).toBe('');
  });
});
