import axios from 'axios';
import { deepseekConfig, isDeepSeekConfigValid } from '../config/deepseekConfig.js';
import logger from '../utils/logger.js';

/**
 * DeepSeek服务 - 负责与DeepSeek API交互
 */
class DeepSeekService {
  constructor() {
    // 增加最大重试次数，增强稳定性
    this.retryCount = 0;
    this.maxRetries = 5; // 从3次增加到5次
    
    // 记录服务初始化信息
    logger.info('DeepSeek服务初始化', {
      baseURL: deepseekConfig.baseURL,
      model: deepseekConfig.model,
      timeout: deepseekConfig.timeout,
      maxRetries: this.maxRetries
    });
  }

  /**
   * 分析任务复杂度
   * @param {Object} request 任务分析请求
   * @returns {Promise<Object>} 任务分析结果
   */
  async analyzeTask(request) {
    logger.info('分析任务:', { taskId: request.taskId });
    
    try {
      if (!isDeepSeekConfigValid()) {
        throw new Error('DeepSeek API配置无效');
      }

      const prompt = this.buildTaskAnalysisPrompt(request);
      const response = await this.callDeepSeekAPI(prompt);
      
      const result = this.parseTaskAnalysisResponse(response, request);
      
      logger.info('任务分析完成', { 
        taskId: request.taskId, 
        complexity: result.complexity 
      });
      
      return {
        success: true,
        result
      };
    } catch (error) {
      logger.error('任务分析失败', { 
        taskId: request.taskId, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 分析任务复杂度（兼容性方法）
   * @param {Object} request 请求对象，包含任务ID、标题和描述
   * @returns {Promise<Object>} 分析结果，格式化为与集成服务兼容的结构
   */
  async analyzeTaskComplexity(request) {
    logger.info('调用任务复杂度分析方法', { taskId: request.taskId });
    
    try {
      const result = await this.analyzeTask(request);
      
      // 如果成功，将结果转换为新的格式
      if (result.success) {
        return {
          success: true,
          data: result.result
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      logger.error('任务复杂度分析失败', { 
        taskId: request.taskId, 
        error: error.message 
      });
      
      return {
        success: false,
        error: `任务复杂度分析失败: ${error.message}`
      };
    }
  }

  /**
   * 拆解任务
   * @param {Object} request 任务拆解请求
   * @returns {Promise<Object>} 子任务列表
   */
  async decomposeTask(request) {
    try {
      if (!isDeepSeekConfigValid()) {
        throw new Error('DeepSeek API配置无效');
      }

      const prompt = this.buildTaskDecompositionPrompt(request);
      const response = await this.callDeepSeekAPI(prompt);
      
      const subTasks = this.parseTaskDecompositionResponse(response);
      
      // 返回前端所需的数据结构
      return {
        success: true,
        data: {
          taskId: request.taskId,
          title: request.title,
          description: request.description || '',
          complexity: request.complexity,
          subTasks: subTasks
        }
      };
    } catch (error) {
      logger.error('拆解任务失败', { error: error.message, request });
      return {
        success: false,
        error: `拆解任务失败: ${error.message}`
      };
    }
  }

  /**
   * 调用DeepSeek API
   * @param {string} prompt 提示词
   * @returns {Promise<Object>} DeepSeek响应
   */
  async callDeepSeekAPI(prompt) {
    this.retryCount = 0;
    try {
      // 记录开始请求的时间，方便后续计算总耗时
      const startTime = Date.now();
      logger.info('开始调用DeepSeek API', { 
        promptLength: prompt.length,
        noTimeout: true 
      });
      
      const response = await axios.post(
        `${deepseekConfig.baseURL}/chat/completions`,
        {
          model: deepseekConfig.model,
          messages: [
            { role: 'system', content: '你是一个专业的任务管理助手，擅长分析和拆解任务。请务必返回有效的JSON格式数据。' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: deepseekConfig.maxTokens,
          temperature: deepseekConfig.temperature,
        },
        {
          headers: {
            'Authorization': `Bearer ${deepseekConfig.apiKey}`,
            'Content-Type': 'application/json',
          }
          // 不设置timeout参数，实现无超时限制
        }
      );

      // 记录请求完成的时间
      const endTime = Date.now();
      logger.info('DeepSeek API请求完成', { 
        elapsedTimeMs: endTime - startTime,
        totalTokens: response.data?.usage?.total_tokens
      });

      return response.data;
    } catch (error) {
      logger.error('DeepSeek API请求失败', { 
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        message: error.message,
        config: error.config
      });

      // 检查是否需要重试
      const shouldRetry = (
        // 网络错误，包括超时
        error.code === 'ECONNABORTED' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ECONNRESET' ||
        error.message.includes('timeout') ||
        error.message.includes('aborted') ||
        // 或者服务器错误
        (error.response && error.response.status >= 500)
      );

      if (shouldRetry && this.retryCount < this.maxRetries) {
        this.retryCount++;
        const retryDelay = 1000 * Math.pow(2, this.retryCount); // 指数退避
        logger.warn(`DeepSeek API请求失败，${retryDelay/1000}秒后进行第${this.retryCount}次重试，错误: ${error.message}`);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.callDeepSeekAPI(prompt);
      }
      
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek API请求失败: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * 构建任务分析提示词
   * @param {Object} request 任务分析请求
   * @returns {string} 提示词
   */
  buildTaskAnalysisPrompt(request) {
    return `
分析以下任务的复杂度和特性:

任务标题: ${request.title}
任务描述: ${request.description || '无'}

请根据任务的内容、范围和难度，评估其复杂度和提出建议。
返回格式为JSON对象，包含以下字段:
{
  "complexity": "LOW" 或 "MEDIUM" 或 "HIGH", // 任务复杂度
  "type": "NORMAL" 或 "WORK" 或 "LEARNING" 或 "PROJECT" 或 "LEISURE", // 建议的任务类型
  "priority": "LOW" 或 "MEDIUM" 或 "HIGH", // 建议的任务优先级
  "estimatedDays": 数字, // 预计完成天数
  "analysis": "对任务的简要分析",  // 简短的任务分析说明
  "recommendedTags": ["标签1", "标签2", "标签3"] // 建议的任务标签，3-5个
}

注意：
1. 请确保返回的是有效的JSON对象格式，不要添加任何额外的文本或说明。
2. 所有字段都必须包含合理的值。
3. 任务类型应从NORMAL(普通)、WORK(工作)、LEARNING(学习)、PROJECT(项目)、LEISURE(休闲)中选择最合适的。
4. 标签应该反映任务的性质和领域，提供3-5个有意义的标签。
    `;
  }

  /**
   * 构建任务拆解提示词
   * @param {Object} request 任务拆解请求
   * @returns {string} 提示词
   */
  buildTaskDecompositionPrompt(request) {
    return `
拆解以下任务为多个子任务:

任务标题: ${request.title}
任务描述: ${request.description || '无'}
任务复杂度: ${request.complexity}

请根据任务的复杂度，将任务拆解为合适数量的子任务。对于简单(LOW)任务，拆解为2-3个子任务；中等(MEDIUM)任务，拆解为4-6个子任务；复杂(HIGH)任务，拆解为7-10个子任务。

请以JSON格式返回子任务列表:
[
  {
    "title": "子任务标题",
    "description": "子任务的详细描述",
    "estimatedHours": 预计完成小时数(数字),
    "type": "NORMAL" 或 "WORK" 或 "LEARNING" 或 "PROJECT" 或 "LEISURE",
    "tags": ["标签1", "标签2"]
  },
  ...
]

注意：
1. 请确保返回的是有效的JSON数组，不要添加任何额外的文本或说明。
2. 每个子任务必须包含标题、描述、预计小时数、任务类型和标签。
3. 任务类型应从NORMAL(普通)、WORK(工作)、LEARNING(学习)、PROJECT(项目)、LEISURE(休闲)中选择最合适的。
4. 标签应该反映任务的性质和领域，每个子任务提供2-3个标签。
    `;
  }

  /**
   * 解析任务分析响应
   * @param {Object} response DeepSeek响应
   * @param {Object} request 原始请求
   * @returns {Object} 任务分析结果
   */
  parseTaskAnalysisResponse(response, request) {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        logger.error('DeepSeek返回内容为空');
        throw new Error('DeepSeek返回内容为空');
      }

      // 记录原始响应内容，辅助调试
      logger.debug('DeepSeek分析响应原始内容:', content.substring(0, 200) + '...');

      let result;
      try {
        // 尝试解析整个内容为JSON
        result = JSON.parse(content);
      } catch (e) {
        // 如果解析失败，尝试使用正则表达式提取JSON
        logger.warn('DeepSeek返回的内容不是有效的JSON，尝试提取JSON部分', { content });
        const jsonMatch = content.match(/{[\s\S]*}/);
        if (!jsonMatch) {
          throw new Error('无法从DeepSeek响应中提取JSON');
        }
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (err) {
          logger.error('无法解析提取的JSON对象', { match: jsonMatch[0].substring(0, 100) });
          throw new Error('无法解析DeepSeek响应中的JSON');
        }
      }

      logger.debug('解析后的结果结构:', { 
        resultKeys: Object.keys(result)
      });
      
      // 转换复杂度为大写
      if (result.complexity) {
        result.complexity = result.complexity.toUpperCase();
      }
      
      // 确保请求对象存在，避免undefined错误
      const safeRequest = request || {};
      
      // 准备默认值以确保返回完整的任务分析结果
      return {
        taskId: safeRequest.taskId || 'unknown-task',
        title: safeRequest.title || '',
        description: safeRequest.description || '',
        complexity: result.complexity || 'MEDIUM',
        type: result.type || 'NORMAL',
        priority: result.priority || 'MEDIUM',
        estimatedDays: result.estimatedDays || 7,
        analysis: result.analysis || '',
        recommendedTags: Array.isArray(result.recommendedTags) ? result.recommendedTags : []
      };
    } catch (error) {
      logger.error('解析任务分析响应失败', { 
        error: error.message, 
        responseContent: response.choices[0]?.message?.content 
      });
      throw new Error(`解析任务分析响应失败: ${error.message}`);
    }
  }

  /**
   * 解析任务拆解响应
   * @param {Object} response DeepSeek响应 
   * @returns {Array} 子任务列表
   */
  parseTaskDecompositionResponse(response) {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        logger.error('DeepSeek返回内容为空');
        throw new Error('DeepSeek返回内容为空');
      }

      // 记录原始响应内容，辅助调试
      logger.debug('DeepSeek原始响应:', content.substring(0, 200) + '...');

      let result;
      try {
        // 尝试解析整个内容为JSON
        result = JSON.parse(content);
      } catch (e) {
        // 如果解析失败，尝试使用正则表达式提取JSON
        logger.warn('DeepSeek返回的内容不是有效的JSON，尝试提取JSON部分', { content });
        let jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          // 找到数组格式的JSON
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (err) {
            logger.error('无法解析提取的JSON数组', { match: jsonMatch[0].substring(0, 100) });
          }
        } 
        
        if (!jsonMatch || !result) {
          // 尝试查找对象格式的JSON
          jsonMatch = content.match(/{[\s\S]*}/);
          if (!jsonMatch) {
            throw new Error('无法从DeepSeek响应中提取JSON');
          }
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (err) {
            logger.error('无法解析提取的JSON对象', { match: jsonMatch[0].substring(0, 100) });
            throw new Error('无法解析DeepSeek响应中的JSON');
          }
        }
      }

      logger.debug('解析后的结果结构:', { 
        isArray: Array.isArray(result),
        hasSubTasks: result.subTasks ? true : false,
        hasSubtasks: result.subtasks ? true : false,
        resultKeys: Object.keys(result)
      });
      
      // 处理不同的返回格式
      let subTasksArray;
      
      if (Array.isArray(result)) {
        // 直接是数组格式
        subTasksArray = result;
      } else if (typeof result === 'object') {
        // 对象格式，尝试提取子任务数组
        if (result.subTasks && Array.isArray(result.subTasks)) {
          subTasksArray = result.subTasks;
        } else if (result.subtasks && Array.isArray(result.subtasks)) {
          subTasksArray = result.subtasks;
        } else if (result.sub_tasks && Array.isArray(result.sub_tasks)) {
          subTasksArray = result.sub_tasks;
        } else {
          // 检查是否有任何数组类型的属性
          const arrayProps = Object.entries(result)
            .filter(([_, value]) => Array.isArray(value))
            .map(([key, value]) => ({ key, length: value.length }));
          
          if (arrayProps.length > 0) {
            // 使用找到的第一个数组属性
            const firstArrayProp = arrayProps[0];
            logger.debug(`使用找到的数组属性: ${firstArrayProp.key}，长度: ${firstArrayProp.length}`);
            subTasksArray = result[firstArrayProp.key];
          } else {
            logger.error('DeepSeek返回的结构中没有数组类型的属性', { result: JSON.stringify(result).substring(0, 200) });
            throw new Error('DeepSeek返回的子任务不是数组格式');
          }
        }
      } else {
        logger.error('DeepSeek返回的结果既不是对象也不是数组', { resultType: typeof result });
        throw new Error('DeepSeek返回了无效的结果格式');
      }
      
      if (!subTasksArray || !Array.isArray(subTasksArray) || subTasksArray.length === 0) {
        logger.error('无法提取有效的子任务数组', { subTasksArray });
        throw new Error('无法提取有效的子任务数组');
      }
      
      logger.info(`成功提取子任务数组，共${subTasksArray.length}个子任务`);
      
      // 处理和规范化子任务
      return subTasksArray.map((subTask, index) => {
        if (!subTask.title) {
          subTask.title = `子任务${index + 1}`;
        }
        if (!subTask.description) {
          subTask.description = `${subTask.title}的详细实现`;
        }
        if (!subTask.estimatedHours || typeof subTask.estimatedHours !== 'number') {
          subTask.estimatedHours = 1;
        }
        if (!subTask.type) {
          subTask.type = 'NORMAL';
        }
        if (!Array.isArray(subTask.tags)) {
          subTask.tags = [];
        }
        return subTask;
      });
    } catch (error) {
      logger.error('解析任务拆解响应失败', { 
        error: error.message, 
        responseContent: response.choices[0]?.message?.content 
      });
      throw new Error(`解析任务拆解响应失败: ${error.message}`);
    }
  }
}

export const deepseekService = new DeepSeekService();
export default deepseekService; 