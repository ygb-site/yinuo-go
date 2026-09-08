import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { parseScheduleWithAi, BUILTIN_DEEPSEEK_API_KEY } from '../src/services/scheduleAiParser';
import { useAiTutorStore } from '../src/stores/useAiTutorStore';

describe('AI Schedule Parser Service', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should use configured API key when store has custom key', async () => {
    const store = useAiTutorStore();
    store.config.apiKey = 'test-custom-key';
    let capturedHeaders: any = null;
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      capturedHeaders = opts.headers;
      return Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ schoolName: '京西校区', grid: {}, teachers: {} }) } }]
        })
      });
    });
    await parseScheduleWithAi('测试课表');
    expect(capturedHeaders['Authorization']).toBe('Bearer test-custom-key');
  });

  it('should throw error when no API key is provided and builtin key is empty', async () => {
    const store = useAiTutorStore();
    store.config.apiKey = '';
    if (!BUILTIN_DEEPSEEK_API_KEY) {
      await expect(parseScheduleWithAi('测试课表')).rejects.toThrow('未检测到有效的 DeepSeek API Key 密钥');
    }
  });

  it('should parse schedule json response correctly from AI output', async () => {
    const store = useAiTutorStore();
    store.config.apiKey = 'test-key';
    const mockJson = JSON.stringify({
      schoolName: '京西校区',
      className: '1.1班',
      gradeLabel: '一年级',
      termLabel: '上学期',
      versionDate: '2026.09.07',
      periods: [{ id: 1, label: '第1节', slotType: 'morning' }],
      grid: { '1-1': '班队会' },
      teachers: { '1-1': '王岩梅' }
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: mockJson } }] })
    });
    const res = await parseScheduleWithAi('test input');
    expect(res.schoolName).toBe('京西校区');
    expect(res.grid['1-1']).toBe('班队会');
    expect(res.teachers['1-1']).toBe('王岩梅');
  });
});
