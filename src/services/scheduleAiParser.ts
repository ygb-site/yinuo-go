export const BUILTIN_DEEPSEEK_API_KEY = (import.meta.env.VITE_DEEPSEEK_API_KEY as string) || '';
import { useAiTutorStore } from '../stores/useAiTutorStore';
import type { ScheduleGrid, SchedulePeriod } from '../stores/useScheduleStore';

export interface ParsedScheduleResult {
  schoolName: string;
  className: string;
  gradeLabel: string;
  termLabel: string;
  versionDate: string;
  periods: SchedulePeriod[];
  grid: ScheduleGrid;
  teachers: Record<string, string>;
  rawSubjects: string[];
}

const SCHEDULE_PARSER_SYSTEM_PROMPT = `你是一个专业的小学课表结构化提取助手。
你的任务是从用户提供的课表文本（或OCR识别文本）中，极其精准地提取并输出标准的结构化 JSON 数据。

要求：
1. 识别并提取：学校名称（如“中国人民大学附属小学京西分校”）、班级（如“1.1班”）、年级（如“一年级”）、学期（如“上学期”）、生效版本日期（如“2026.09.07”，若无则取当前年月日）。
2. 提取节次列表：
   - 识别是否有“早读/晨读”（slotType: "morning_read"）
   - 上午第1~4节（slotType: "morning"）
   - 下午第5~6节或第7~8节（slotType: "afternoon"）
   - 晚自习/课后托管（slotType: "evening"）
3. 提取周一至周五（1~5）各节次的课程名称与任课教师姓名。
   - grid 的 key 格式为 "day-period"，例如 "1-1" 表示周一第1节，值为科目名称（如 "班队会", "语文1", "数学", "校本古诗" 等）
   - teachers 的 key 格式同样为 "day-period"，例如 "1-1"，值为任课老师姓名（如 "王岩梅", "李慧", "张琪" 等）
4. 输出必须是且仅是一个合法的 JSON 对象，不要包含 markdown 代码块反引号以外的多余客套话。格式范例：
{
  "schoolName": "中国人民大学附属小学京西分校",
  "className": "1.1班",
  "gradeLabel": "一年级",
  "termLabel": "上学期",
  "versionDate": "2026.09.07",
  "periods": [
    { "id": 1, "label": "第1节", "slotType": "morning" },
    { "id": 2, label: "第2节", "slotType": "morning" }
  ],
  "grid": {
    "1-1": "班队会",
    "1-2": "数学"
  },
  "teachers": {
    "1-1": "王岩梅",
    "1-2": "李慧"
  }
}
`;

/**
 * 借助项目现有的 DeepSeek / AI 接口进行课表文本的结构化提取
 */
export async function parseScheduleWithAi(textInput: string): Promise<ParsedScheduleResult> {
  const tutorStore = useAiTutorStore();
  const endpoint = (tutorStore.config.endpoint || 'https://api.deepseek.com/v1/chat/completions').trim();
  // 优先使用用户配置的 key，若未配置则直接使用内置专属密钥
  const apiKey = (tutorStore.config.apiKey || BUILTIN_DEEPSEEK_API_KEY).trim();
  // DeepSeek 官方兼容模型名称：若为旧占位名则自动切换为官方标准的 deepseek-chat
  const model = (!tutorStore.config.model || tutorStore.config.model.includes('flash'))
    ? 'deepseek-chat'
    : tutorStore.config.model;

  if (!apiKey) {
    throw new Error('未检测到有效的 DeepSeek API Key 密钥');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SCHEDULE_PARSER_SYSTEM_PROMPT },
        { role: 'user', content: `请帮我解析以下课表内容：\n\n${textInput}` }
      ],
      temperature: 0.1,
      max_tokens: 2500
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek 接口请求失败 (${response.status}): ${err.slice(0, 120)}`);
  }

  const resJson = await response.json();
  const rawContent = resJson?.choices?.[0]?.message?.content || '';

  // 提取 JSON 内容
  let jsonStr = rawContent.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const parsed = JSON.parse(jsonStr);

  return {
    schoolName: parsed.schoolName || '中国人民大学附属小学京西分校',
    className: parsed.className || '1.1班',
    gradeLabel: parsed.gradeLabel || '一年级',
    termLabel: parsed.termLabel || '上学期',
    versionDate: parsed.versionDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    periods: Array.isArray(parsed.periods) && parsed.periods.length > 0 ? parsed.periods : [
      { id: 1, label: '第1节', time: '08:00', slotType: 'morning' },
      { id: 2, label: '第2节', time: '08:50', slotType: 'morning' },
      { id: 3, label: '第3节', time: '09:50', slotType: 'morning' },
      { id: 4, label: '第4节', time: '10:40', slotType: 'morning' },
      { id: 5, label: '第5节', time: '14:00', slotType: 'afternoon' },
      { id: 6, label: '第6节', time: '14:50', slotType: 'afternoon' }
    ],
    grid: parsed.grid || {},
    teachers: parsed.teachers || {},
    rawSubjects: Array.from(new Set(Object.values(parsed.grid || {}))) as string[]
  };
}

