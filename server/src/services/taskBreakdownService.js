import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置常量
const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const MAX_TOKENS = parseInt(process.env.DEEPSEEK_MAX_TOKENS || '4000', 10);
const TEMPERATURE = parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7');
const TIMEOUT = parseInt(process.env.DEEPSEEK_TIMEOUT || '30000', 10);

/**
 * 任务拆解服务
 */
export class TaskBreakdownService {
  /**
   * 验证API配置
   * @returns {boolean} 配置是否有效
   */
  static isConfigValid() {
    return !!API_KEY && !!API_URL;
  }

  /**
   * 分析任务复杂度
   * @param {Object} task 任务信息
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeTaskComplexity(task) {
    try {
      if (!TaskBreakdownService.isConfigValid()) {
        throw new Error('DeepSeek API配置无效');
      }

      const prompt = `
分析以下任务的复杂度:

任务标题: ${task.title}
任务描述: ${task.description || '无'}

请根据任务的内容、范围和难度，评估其复杂度。
只需返回复杂度评级，格式为JSON: {"complexity": "SIMPLE" 或 "MEDIUM" 或 "COMPLEX"}
      `;

      // 请求JSON输出
      const response = await this.callDeepSeekAPI(prompt, true);
      return this.parseAnalysisResponse(response, task);
    } catch (error) {
      console.error('分析任务复杂度失败', error);
      throw new Error(`分析任务复杂度失败: ${error.message}`);
    }
  }

  /**
   * 拆解任务为子任务
   * @param {Object} task 任务信息
   * @returns {Promise<Array>} 子任务列表
   */
  async decomposeTask(task) {
    try {
      if (!TaskBreakdownService.isConfigValid()) {
        throw new Error('DeepSeek API配置无效');
      }

      if (!task.complexity) {
        const analysisResult = await this.analyzeTaskComplexity(task);
        task.complexity = analysisResult.complexity;
      }

      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const defaultDueDate = nextWeek.toISOString().split('T')[0];

      const prompt = `
拆解以下任务为多个子任务:

任务标题: ${task.title}
任务描述: ${task.description || '无'}
任务复杂度: ${task.complexity}

请根据任务的复杂度，将任务拆解为合适数量的子任务。对于简单任务，拆解为2-3个子任务；中等任务，拆解为4-6个子任务；复杂任务，拆解为7-10个子任务。

请为每个子任务提供以下信息：
1. 标题：简洁明了的任务名称
2. 描述：详细说明任务内容和具体需求
3. 类型：从以下选项中选择一个（NORMAL, WORK, LEARNING, PROJECT, LEISURE）
4. 优先级：1-4的整数，1表示最高优先级，4表示最低优先级
5. 预计工时：完成任务预计需要的小时数
6. 建议截止日期：推荐的完成日期，格式为YYYY-MM-DD
7. 标签：2-3个相关标签，用于任务分类

返回JSON格式的子任务列表:
[
  {
    "title": "子任务标题",
    "description": "子任务的详细描述",
    "type": "NORMAL/WORK/LEARNING/PROJECT/LEISURE",
    "priority": 1-4之间的整数,
    "estimatedHours": 预计完成小时数(数字),
    "dueDate": "YYYY-MM-DD",
    "tags": ["标签1", "标签2"]
  },
  ...
]
      `;

      // 请求JSON输出
      const response = await this.callDeepSeekAPI(prompt, true);
      return this.parseDecompositionResponse(response);
    } catch (error) {
      console.error('拆解任务失败', error);
      throw new Error(`拆解任务失败: ${error.message}`);
    }
  }

  /**
   * 分析并拆解任务
   * @param {Object} task 任务信息
   * @returns {Promise<Object>} 任务分析和拆解结果
   */
  async analyzeAndDecomposeTask(task) {
    // 1. 分析任务复杂度
    const analysisResult = await this.analyzeTaskComplexity(task);
    
    // 2. 拆解任务
    const subTasks = await this.decomposeTask({
      ...task,
      complexity: analysisResult.complexity
    });
    
    return {
      analysis: analysisResult,
      subTasks: subTasks
    };
  }

  /**
   * 调用DeepSeek API
   * @param {string} prompt 提示词
   * @param {boolean} jsonOutput 是否要求JSON输出
   * @returns {Promise<Object>} API响应
   */
  async callDeepSeekAPI(prompt, jsonOutput = false) {
    try {
      const requestBody = {
        model: MODEL,
        messages: [
          { role: 'system', content: '你是一个专业的任务管理助手，擅长分析和拆解任务。你的回答应该准确、结构化且符合JSON格式。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      };

      // 如果需要JSON输出，添加response_format参数
      if (jsonOutput) {
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await axios.post(
        `${API_URL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: TIMEOUT,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('DeepSeek API请求失败', { 
          status: error.response?.status,
          data: error.response?.data
        });
        throw new Error(`DeepSeek API请求失败: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * 解析任务分析响应
   * @param {Object} response DeepSeek响应
   * @param {Object} task 原始任务
   * @returns {Object} 分析结果
   */
  parseAnalysisResponse(response, task) {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek返回内容为空');
      }

      // 尝试直接解析内容为JSON
      let result;
      try {
        result = JSON.parse(content);
      } catch (e) {
        // 如果无法直接解析，尝试提取JSON内容
        const jsonMatch = content.match(/{[\s\S]*}/);
        if (!jsonMatch) {
          throw new Error('无法从DeepSeek响应中提取JSON');
        }
        result = JSON.parse(jsonMatch[0]);
      }
      
      return {
        taskId: task.taskId,
        title: task.title,
        complexity: result.complexity,
      };
    } catch (error) {
      console.error('解析任务分析响应失败', error);
      throw new Error(`解析任务分析响应失败: ${error.message}`);
    }
  }

  /**
   * 解析任务拆解响应
   * @param {Object} response DeepSeek响应
   * @returns {Array} 子任务列表
   */
  parseDecompositionResponse(response) {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek返回内容为空');
      }

      // 尝试直接解析内容为JSON
      let result;
      try {
        result = JSON.parse(content);
      } catch (e) {
        // 如果无法直接解析，尝试提取JSON内容
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('无法从DeepSeek响应中提取JSON');
        }
        result = JSON.parse(jsonMatch[0]);
      }

      // 验证并格式化返回的子任务
      return result.map(subTask => ({
        title: subTask.title,
        description: subTask.description || '',
        type: this.validateTaskType(subTask.type),
        priority: this.validatePriority(subTask.priority),
        estimatedHours: subTask.estimatedHours || 1,
        dueDate: this.validateDate(subTask.dueDate),
        tags: Array.isArray(subTask.tags) ? subTask.tags : []
      }));
    } catch (error) {
      console.error('解析任务拆解响应失败', error);
      throw new Error(`解析任务拆解响应失败: ${error.message}`);
    }
  }

  /**
   * 验证任务类型
   * @param {string} type 任务类型
   * @returns {string} 有效的任务类型
   */
  validateTaskType(type) {
    const validTypes = ['NORMAL', 'WORK', 'LEARNING', 'PROJECT', 'LEISURE'];
    return validTypes.includes(type) ? type : 'NORMAL';
  }

  /**
   * 验证优先级
   * @param {number} priority 优先级
   * @returns {number} 有效的优先级
   */
  validatePriority(priority) {
    const num = Number(priority);
    if (isNaN(num) || num < 1 || num > 4) {
      return 2; // 默认中等优先级
    }
    return Math.floor(num);
  }

  /**
   * 验证日期格式
   * @param {string} date 日期字符串
   * @returns {string} 有效的日期字符串
   */
  validateDate(date) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      // 默认为一周后
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return nextWeek.toISOString().split('T')[0];
    }
    return date;
  }
}

// 导出实例
export const taskBreakdownService = new TaskBreakdownService(); 