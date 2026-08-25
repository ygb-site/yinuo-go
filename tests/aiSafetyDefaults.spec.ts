import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAiTutorStore } from '../src/stores/useAiTutorStore';
import { AiTutorService, KID_SAFE_AI_FALLBACK_TEXT } from '../src/services/aiTutorService';
import { redactSecrets, toSafeErrorDigest } from '../src/utils/safeError';

/** 一条足够真实的上游异常：既带状态码，也带回显的密钥 */
const RAW_UPSTREAM_ERROR = 'AI 接口请求异常 (401): {"error":"invalid_api_key","authorization":"Bearer sk-live-abcdef123456"}';

describe('AI 默认降险配置', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('自动朗读默认关闭', () => {
    expect(useAiTutorStore().config.autoSpeech).toBe(false);
  });

  it('默认 provider 是离线本地规则引擎 local-rule', () => {
    const tutorStore = useAiTutorStore();
    tutorStore.initProvider();
    expect(AiTutorService.getProviderId()).toBe('local-rule');
  });

  it('选了自定义大模型但没有密钥时，仍然回落到 local-rule', () => {
    const tutorStore = useAiTutorStore();
    tutorStore.saveConfig({ mode: 'custom_api', apiKey: '   ' });
    expect(AiTutorService.getProviderId()).toBe('local-rule');
  });
});

describe('AI 异常不进儿童可见文案', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('上游报错时聊天只出现统一兜底文案，不带原始错误信息', async () => {
    const tutorStore = useAiTutorStore();
    vi.spyOn(AiTutorService, 'askKidTutor').mockRejectedValue(new Error(RAW_UPSTREAM_ERROR));

    await tutorStore.sendUserMessage('这颗棋子还剩几口气？');

    const lastReply = tutorStore.chatMessages[tutorStore.chatMessages.length - 1];
    expect(lastReply.role).toBe('assistant');
    expect(lastReply.text).toBe(KID_SAFE_AI_FALLBACK_TEXT);

    // 整条对话流里都不能出现异常细节与密钥
    const wholeChat = tutorStore.chatMessages.map(m => m.text).join('\n');
    expect(wholeChat).not.toContain('401');
    expect(wholeChat).not.toContain('invalid_api_key');
    expect(wholeChat).not.toContain('sk-live');
    expect(wholeChat).not.toContain('Bearer');
  });

  it('落日志用的错误摘要已抹掉密钥', () => {
    const digest = toSafeErrorDigest(new Error(RAW_UPSTREAM_ERROR));
    expect(digest).not.toContain('sk-live-abcdef123456');
    expect(digest).toContain('***');
    // 状态码这类定位信息可以保留，它只进开发日志
    expect(digest).toContain('401');
  });

  it('脱敏覆盖 Bearer Token 与常见密钥字段', () => {
    expect(redactSecrets('Authorization: Bearer sk-live-abcdef123456')).not.toContain('sk-live');
    expect(redactSecrets('{"api_key":"sk-live-abcdef123456"}')).not.toContain('sk-live');
    expect(redactSecrets('token_9f8e7d6c5b4a3210')).toBe('***');
    expect(redactSecrets('')).toBe('');
  });
});
