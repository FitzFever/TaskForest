import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * DeepSeek API 配置
 */
export const deepseekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-370f866e93df4268a83e5eb78d51b62e',
  baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '4000', 10),
  temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7'),
  timeout: parseInt(process.env.DEEPSEEK_TIMEOUT || '300000', 10), // 请求超时时间，默认300秒(5分钟)，用于处理复杂任务
};

/**
 * 检查DeepSeek配置是否有效
 */
export const isDeepSeekConfigValid = () => {
  return !!deepseekConfig.apiKey && !!deepseekConfig.baseURL;
}; 