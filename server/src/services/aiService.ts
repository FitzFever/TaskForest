import axios from 'axios';
import { config } from '../config';

export interface CompletionOptions {
  temperature?: number;
  max_tokens?: number;
  json_output?: boolean;
  functions?: any[];
}

export class DeepseekService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = config.deepseek.apiKey;
    this.baseUrl = config.deepseek.baseUrl;
  }
  
  /**
   * 使用Deepseek API生成文本补全
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 生成的文本
   */
  async generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<string> {
    try {
      // 构建请求参数
      const requestParams = this.prepareRequestParams(prompt, options);
      
      // 发送API请求
      const response = await this.sendRequest(requestParams);
      
      // 处理响应
      return this.processResponse(response);
    } catch (error) {
      console.error('Deepseek API调用失败:', error);
      throw new Error('AI服务调用失败，请稍后重试');
    }
  }
  
  /**
   * 准备请求参数
   */
  private prepareRequestParams(prompt: string, options: CompletionOptions): any {
    const params: any = {
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 4000,
    };
    
    // 如果需要JSON输出
    if (options.json_output) {
      params.response_format = { type: 'json_object' };
    }
    
    // 如果有函数调用
    if (options.functions && options.functions.length > 0) {
      params.functions = options.functions;
    }
    
    return params;
  }
  
  /**
   * 发送请求到Deepseek API
   */
  private async sendRequest(params: any): Promise<any> {
    return await axios.post(
      `${this.baseUrl}/chat/completions`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  /**
   * 处理API响应
   */
  private processResponse(response: any): string {
    if (!response?.data?.choices?.[0]?.message?.content) {
      throw new Error('无效的API响应格式');
    }
    
    return response.data.choices[0].message.content;
  }
}

// 导出单例实例
export const deepseekService = new DeepseekService(); 