export const providers = [
  { id: 'tencent', name: '腾讯云语音识别', fields: [['appId', 'AppId', false, 20], ['secretId', 'SecretId', true, 128], ['secretKey', 'SecretKey', true, 256]] },
  { id: 'aliyun', name: '阿里云百炼语音识别', fields: [['apiKey', 'API Key', true, 512], ['workspaceId', 'Workspace ID', false, 80]] },
  { id: 'deepseek', name: '文字 AI', fields: [['apiKey', 'API Key', true, 512], ['model', '模型', false, 80], ['workspaceId', 'Workspace ID（北京，可选）', false, 80]] }
] as const;
export type Provider = typeof providers[number];
export const textVendors = {
  deepseek: { name: 'DeepSeek', model: 'deepseek-flash', models: [['deepseek-flash', 'DeepSeek Flash'], ['deepseek-v4-pro', 'DeepSeek V4 Pro']], endpoint: 'https://api.deepseek.com/chat/completions' },
  openai: { name: 'OpenAI', model: '', models: [['gpt-6-sol', 'GPT-6 Sol'], ['gpt-6-astra', 'GPT-6 Astra'], ['gpt-5.6-sol', 'GPT-5.6 Sol'], ['gpt-5.6-luna', 'GPT-5.6 Luna']], endpoint: 'https://api.openai.com/v1/chat/completions' },
  bailian: { name: '千问 / 阿里云百炼', model: 'qwen-plus', models: [['qwen-plus', '千问 Plus'], ['qwen-flash', '千问 Flash'], ['qwen-max', '千问 Max']], endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions' },
  doubao: { name: '豆包 / 火山方舟', model: '', models: [['doubao-seed-2-1-lite-260915', '豆包 Seed 2.1 Lite'], ['doubao-seed-2-1-pro-260915', '豆包 Seed 2.1 Pro'], ['doubao-seed-2-0-mini-260428', '豆包 Seed 2.0 Mini']], endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions' }
};
export type TextVendor = keyof typeof textVendors;
export const customModelPattern = '[A-Za-z0-9_.:\\/\\-]{1,80}';
export const credentialRules: Record<string, readonly [RegExp, string]> = {
  appId: [/^[0-9]{1,20}$/, 'AppId 应为1至20位数字。'],
  secretId: [/^[A-Za-z0-9]{1,128}$/, 'SecretId 应为字母或数字，不要填写网址或其他字段。'],
  secretKey: [/^[A-Za-z0-9+/=_-]{1,256}$/, 'SecretKey 格式不正确，请复制对应供应商的密钥。'],
  apiKey: [/^[A-Za-z0-9_.-]{1,512}$/, 'API Key 格式不正确。只填写密钥，不要包含网址、Bearer 前缀、空格或换行。']
};
export interface ActionConfirmation { title: string; message: string; confirmLabel: string; kind?: string; icon?: string }
export interface CloudServices {
  context(): string;
  confirm(options: ActionConfirmation): Promise<boolean>;
  error(message: string): void;
  write(provider: Provider['id'], method: 'PUT' | 'DELETE', body: Record<string, unknown>): Promise<void>;
}
