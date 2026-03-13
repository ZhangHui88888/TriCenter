import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

let apiKey = localStorage.getItem('deepseek_api_key') || '';

export function setDeepSeekApiKey(key: string) {
  apiKey = key;
  localStorage.setItem('deepseek_api_key', key);
}

export function getDeepSeekApiKey(): string {
  return apiKey;
}

export function hasDeepSeekApiKey(): boolean {
  return !!apiKey;
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function chatWithDeepSeek(
  messages: DeepSeekMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  if (!apiKey) {
    throw new Error('请先设置 DeepSeek API Key');
  }

  const response = await axios.post<DeepSeekResponse>(
    DEEPSEEK_API_URL,
    {
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream: false,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0]?.message?.content || '';
}

export async function generateReportSection(
  enterpriseName: string,
  industry: string,
  sectionPrompt: string
): Promise<string> {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: `你是一位专业的外贸市场调研分析师，正在为常州跨境电商三中心撰写企业市场调研报告。
请基于你的知识和联网信息，为指定企业生成专业的调研内容。
要求：
1. 内容专业、数据尽量准确（如无确切数据可给出合理估算并标注"预估"）
2. 分析有深度，建议有可操作性
3. 输出格式为纯文本，适合填入调研报告模板
4. 如果是表格数据，用 | 分隔列，每行一条`,
    },
    {
      role: 'user',
      content: `企业名称：${enterpriseName}\n所属行业：${industry}\n\n请生成以下调研内容：\n${sectionPrompt}`,
    },
  ];

  return chatWithDeepSeek(messages, { temperature: 0.5, maxTokens: 4096 });
}
