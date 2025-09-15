import { v4 as uuidv4 } from 'uuid';
import deepseekService from './deepseekService.js';
import batchTaskCreationService from './batchTaskCreationService.js';
import logger from '../utils/logger.js';

/**
 * 文本到任务转换服务
 * 负责将用户提供的文本转换为任务和任务树
 */
class TextToTaskService {
  /**
   * 从文本生成任务和任务树
   * @param {Object} data - 包含文本和其他选项的数据对象
   * @param {string} data.text - 要分析的文本内容
   * @param {boolean} data.createTree - 是否创建任务树
   * @param {string} data.treeType - 树的类型
   * @returns {Promise<Object>} 任务和任务树创建结果
   */
  async generateTasksFromText(data) {
    try {
      const { text, createTree = true, treeType = 'OAK' } = data;
      
      if (!text || text.trim().length === 0) {
        throw new Error('文本内容不能为空');
      }
      
      logger.info('开始从文本生成任务');
      
      // 步骤1: 从文本中提取任务标题和描述
      const taskInfo = await this.extractTaskInfoFromText(text);
      
      if (!taskInfo.success) {
        return {
          success: false,
          message: '从文本提取任务信息失败',
          error: taskInfo.error
        };
      }
      
      // 步骤2: 分析任务复杂度
      const analysisResult = await deepseekService.analyzeTaskComplexity({
        taskId: uuidv4(),
        title: taskInfo.data.title,
        description: taskInfo.data.description
      });
      
      if (!analysisResult.success) {
        return {
          success: false,
          message: '任务复杂度分析失败',
          error: analysisResult.error
        };
      }
      
      logger.info('任务复杂度分析完成', { 
        title: taskInfo.data.title, 
        complexity: analysisResult.data.complexity 
      });
      
      // 步骤3: 拆解任务为子任务
      const decompositionResult = await deepseekService.decomposeTask({
        taskId: analysisResult.data.taskId,
        title: taskInfo.data.title,
        description: taskInfo.data.description,
        complexity: analysisResult.data.complexity
      });
      
      if (!decompositionResult.success) {
        return {
          success: false,
          message: '任务拆解失败',
          error: decompositionResult.error
        };
      }
      
      logger.info('任务拆解完成', { 
        subTasksCount: decompositionResult.subTasks.length 
      });
      
      // 步骤4: 准备创建任务的数据
      const mainTask = {
        id: analysisResult.data.taskId,
        title: taskInfo.data.title,
        description: taskInfo.data.description,
        complexity: analysisResult.data.complexity,
        type: taskInfo.data.type || 'PROJECT',
        priority: taskInfo.data.priority || 'MEDIUM'
      };
      
      // 步骤5: 批量创建任务和任务树
      let result;
      if (createTree) {
        result = await batchTaskCreationService.createTasksWithTree(
          mainTask, 
          decompositionResult.subTasks,
          treeType
        );
      } else {
        result = await batchTaskCreationService.createTasks(
          mainTask, 
          decompositionResult.subTasks
        );
      }
      
      logger.info('任务创建成功', {
        mainTaskId: mainTask.id,
        subTasksCount: decompositionResult.subTasks.length,
        createTree
      });
      
      // 返回完整结果
      return {
        success: true,
        message: '成功从文本生成任务',
        data: {
          analysis: analysisResult.data,
          tasks: result
        }
      };
    } catch (error) {
      logger.error('从文本生成任务失败', { error: error.message });
      return {
        success: false,
        message: '从文本生成任务失败',
        error: error.message
      };
    }
  }
  
  /**
   * 从文本中提取任务信息
   * @param {string} text - 要分析的文本
   * @returns {Promise<Object>} 提取的任务信息
   */
  async extractTaskInfoFromText(text) {
    try {
      logger.info('开始从文本提取任务信息');
      
      // 调用DeepSeek API提取任务信息
      const prompt = this.buildExtractTaskPrompt(text);
      const response = await deepseekService.callDeepSeekAPI(prompt);
      
      const taskInfo = this.parseExtractTaskResponse(response);
      
      logger.info('任务信息提取成功', { title: taskInfo.title });
      
      return {
        success: true,
        data: taskInfo
      };
    } catch (error) {
      logger.error('从文本提取任务信息失败', { error: error.message });
      return {
        success: false,
        error: `从文本提取任务信息失败: ${error.message}`
      };
    }
  }
  
  /**
   * 构建提取任务信息的提示词
   * @param {string} text - 要分析的文本
   * @returns {string} 提示词
   */
  buildExtractTaskPrompt(text) {
    return `
从以下文本中提取一个任务的信息，包括标题、描述、类型和优先级：

---
${text}
---

请分析上述文本，提取出最主要的任务，并以JSON格式返回以下信息：
1. 标题（title）：简洁明了的任务标题，不超过10个词
2. 描述（description）：详细的任务描述，总结文本中的关键点
3. 类型（type）：从以下选项中选择一个: NORMAL, WORK, PROJECT, LEARNING, LEISURE
4. 优先级（priority）：从以下选项中选择一个: LOW, MEDIUM, HIGH

返回格式示例：
{
  "title": "任务标题",
  "description": "任务详细描述...",
  "type": "PROJECT",
  "priority": "MEDIUM"
}

请确保返回的是有效的JSON对象格式，不要添加任何额外的文本或说明。
    `;
  }
  
  /**
   * 解析提取任务信息的响应
   * @param {Object} response - DeepSeek API响应
   * @returns {Object} 解析后的任务信息
   */
  parseExtractTaskResponse(response) {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek返回内容为空');
      }
      
      let result;
      try {
        result = JSON.parse(content);
      } catch (e) {
        // 尝试从文本中提取JSON
        const jsonMatch = content.match(/{[\s\S]*}/);
        if (!jsonMatch) {
          throw new Error('无法从DeepSeek响应中提取JSON');
        }
        result = JSON.parse(jsonMatch[0]);
      }
      
      // 验证必要字段
      if (!result.title) {
        throw new Error('提取的任务信息缺少标题');
      }
      
      if (!result.description) {
        result.description = result.title;
      }
      
      if (!result.type || !['NORMAL', 'WORK', 'PROJECT', 'LEARNING', 'LEISURE'].includes(result.type)) {
        result.type = 'PROJECT';
      }
      
      if (!result.priority || !['LOW', 'MEDIUM', 'HIGH'].includes(result.priority)) {
        result.priority = 'MEDIUM';
      }
      
      return result;
    } catch (error) {
      logger.error('解析任务信息响应失败', { error: error.message });
      throw new Error(`解析任务信息响应失败: ${error.message}`);
    }
  }
}

export const textToTaskService = new TextToTaskService();
export default textToTaskService; 