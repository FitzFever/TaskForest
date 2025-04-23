import axios from 'axios';
import { deepseekConfig, isDeepSeekConfigValid } from '../config/deepseekConfig.js';
import { DeepSeekResponse, TaskAnalysisRequest, TaskAnalysisResult, TaskDecompositionRequest, SubTask } from '../types/DeepSeekAPI.js';
import logger from '../utils/logger.js';

/**
 * DeepSeek服务 - 负责与DeepSeek API交互
 */
export class DeepSeekService {
  /**
   * 分析任务复杂度
   * @param request 任务分析请求
   * @returns 任务分析结果
   */
  async analyzeTaskComplexity(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    try {
      if (!isDeepSeekConfigValid()) {
        throw new Error('DeepSeek API配置无效');
      }

      const prompt = this.buildTaskAnalysisPrompt(request);
      const response = await this.callDeepSeekAPI(prompt);
      
      return this.parseTaskAnalysisResponse(response, request);
    } catch (error) {
      logger.error('分析任务复杂度失败', { error, request });
      throw new Error(`分析任务复杂度失败: ${(error as Error).message}`);
    }
  }

  /**
   * 拆解任务
   * @param request 任务拆解请求
   * @returns 子任务列表
   */
  async decomposeTask(request: TaskDecompositionRequest): Promise<SubTask[]> {
    try {
      if (!isDeepSeekConfigValid()) {
        throw new Error('DeepSeek API配置无效');
      }

      const prompt = this.buildTaskDecompositionPrompt(request);
      const response = await this.callDeepSeekAPI(prompt);
      
      return this.parseTaskDecompositionResponse(response);
    } catch (error) {
      logger.error('拆解任务失败', { error, request });
      throw new Error(`拆解任务失败: ${(error as Error).message}`);
    }
  }

  /**
   * 调用DeepSeek API
   * @param prompt 提示词
   * @returns DeepSeek响应
   */
  private async callDeepSeekAPI(prompt: string): Promise<DeepSeekResponse> {
    try {
      const response = await axios.post(
        `${deepseekConfig.baseURL}/chat/completions`,
        {
          model: deepseekConfig.model,
          messages: [
            { role: 'system', content: '你是一个专业的任务管理助手，擅长分析和拆解任务。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: deepseekConfig.maxTokens,
          temperature: deepseekConfig.temperature,
        },
        {
          headers: {
            'Authorization': `Bearer ${deepseekConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: deepseekConfig.timeout,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('DeepSeek API请求失败', { 
          status: error.response?.status,
          data: error.response?.data
        });
        throw new Error(`DeepSeek API请求失败: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * 构建任务分析提示词
   * @param request 任务分析请求
   * @returns 提示词
   */
  private buildTaskAnalysisPrompt(request: TaskAnalysisRequest): string {
    return `
分析以下任务的复杂度:

任务标题: ${request.title}
任务描述: ${request.description || '无'}

请根据任务的内容、范围和难度，评估其复杂度。
只需返回复杂度评级，格式为JSON: {"complexity": "SIMPLE" 或 "MEDIUM" 或 "COMPLEX"}
    `;
  }

  /**
   * 构建任务拆解提示词
   * @param request 任务拆解请求
   * @returns 提示词
   */
  private buildTaskDecompositionPrompt(request: TaskDecompositionRequest): string {
    return `
拆解以下任务为多个子任务:

任务标题: ${request.title}
任务描述: ${request.description || '无'}
任务复杂度: ${request.complexity}

请根据任务的复杂度，将任务拆解为合适数量的子任务。对于简单任务，拆解为2-3个子任务；中等任务，拆解为4-6个子任务；复杂任务，拆解为7-10个子任务。

返回JSON格式的子任务列表:
[
  {
    "title": "子任务标题",
    "description": "子任务的详细描述",
    "estimatedHours": 预计完成小时数(数字)
  },
  ...
]
    `;
  }

  /**
   * 解析任务分析响应
   * @param response DeepSeek响应
   * @param request 原始请求
   * @returns 任务分析结果
   */
  private parseTaskAnalysisResponse(response: DeepSeekResponse, request: TaskAnalysisRequest): TaskAnalysisResult {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek返回内容为空');
      }

      // 提取JSON内容
      const jsonMatch = content.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('无法从DeepSeek响应中提取JSON');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        taskId: request.taskId,
        title: request.title,
        complexity: result.complexity,
      };
    } catch (error) {
      logger.error('解析任务分析响应失败', { error, response });
      throw new Error(`解析任务分析响应失败: ${(error as Error).message}`);
    }
  }

  /**
   * 解析任务拆解响应
   * @param response DeepSeek响应 
   * @returns 子任务列表
   */
  private parseTaskDecompositionResponse(response: DeepSeekResponse): SubTask[] {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek返回内容为空');
      }

      // 提取JSON内容
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('无法从DeepSeek响应中提取JSON');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('解析任务拆解响应失败', { error, response });
      throw new Error(`解析任务拆解响应失败: ${(error as Error).message}`);
    }
  }
} 