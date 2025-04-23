import { deepseekService } from '../services/deepseekService.js';
import batchTaskCreationService from '../services/batchTaskCreationService.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * 任务拆解控制器
 * 处理任务分析和拆解相关接口
 */
export class TaskBreakdownController {
  /**
   * 分析任务复杂度
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async analyzeTask(req, res) {
    try {
      const { taskId, title, description } = req.body;
      
      if (!title) {
        return res.status(400).json({
          code: 400,
          message: '任务标题不能为空',
          data: null
        });
      }
      
      logger.info('分析任务复杂度', { taskId, title });
      
      // 调用DeepSeek服务分析任务
      const result = await deepseekService.analyzeTask({
        taskId: taskId || uuidv4(),
        title,
        description
      });
      
      if (!result.success) {
        return res.status(500).json({
          code: 500,
          message: result.error,
          data: null
        });
      }
      
      return res.status(200).json({
        code: 200,
        message: '任务分析成功',
        data: result.result
      });
    } catch (error) {
      logger.error('任务分析失败', error);
      return res.status(500).json({
        code: 500,
        message: `任务分析失败: ${error.message}`,
        data: null
      });
    }
  }

  /**
   * 拆解任务为子任务
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async decomposeTask(req, res) {
    try {
      const { taskId, title, description, complexity } = req.body;
      
      if (!title) {
        return res.status(400).json({
          code: 400,
          message: '任务标题不能为空',
          data: null
        });
      }
      
      if (!complexity) {
        return res.status(400).json({
          code: 400,
          message: '任务复杂度不能为空',
          data: null
        });
      }
      
      logger.info('拆解任务', { taskId, title, complexity });
      
      // 调用DeepSeek服务拆解任务
      const result = await deepseekService.decomposeTask({
        taskId: taskId || uuidv4(),
        title,
        description,
        complexity
      });
      
      if (!result.success) {
        return res.status(500).json({
          code: 500,
          message: result.error,
          data: null
        });
      }
      
      return res.status(200).json({
        code: 200,
        message: '任务拆解成功',
        data: result.data
      });
    } catch (error) {
      logger.error('任务拆解失败', error);
      return res.status(500).json({
        code: 500,
        message: `任务拆解失败: ${error.message}`,
        data: null
      });
    }
  }

  /**
   * 分析并拆解任务
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async analyzeAndDecomposeTask(req, res) {
    try {
      const { taskId, title, description } = req.body;
      
      if (!title) {
        return res.status(400).json({
          code: 400,
          message: '任务标题不能为空',
          data: null
        });
      }
      
      const generatedTaskId = taskId || uuidv4();
      
      logger.info('分析并拆解任务', { taskId: generatedTaskId, title });
      
      // 先分析任务复杂度
      const analysisResult = await deepseekService.analyzeTask({
        taskId: generatedTaskId,
        title,
        description
      });
      
      if (!analysisResult.success) {
        return res.status(500).json({
          code: 500,
          message: analysisResult.error,
          data: null
        });
      }
      
      // 再拆解任务
      const decompositionResult = await deepseekService.decomposeTask({
        taskId: generatedTaskId,
        title,
        description,
        complexity: analysisResult.result.complexity
      });
      
      if (!decompositionResult.success) {
        return res.status(500).json({
          code: 500,
          message: decompositionResult.error,
          data: null
        });
      }
      
      return res.status(200).json({
        code: 200,
        message: '任务分析和拆解成功',
        data: {
          analysis: analysisResult.result,
          decomposition: decompositionResult.data
        }
      });
    } catch (error) {
      logger.error('任务分析和拆解失败', error);
      return res.status(500).json({
        code: 500,
        message: `任务分析和拆解失败: ${error.message}`,
        data: null
      });
    }
  }

  /**
   * 创建任务和任务树
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象 
   */
  async createTasksAndTrees(req, res) {
    try {
      const { mainTask, subTasks, createTrees = true } = req.body;

      if (!mainTask || !subTasks || !Array.isArray(subTasks)) {
        return res.status(400).json({
          success: false,
          message: '请求格式无效，需要提供主任务和子任务数组'
        });
      }

      const result = await batchTaskCreationService.createTasksAndTrees({
        mainTask,
        subTasks
      }, createTrees);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('创建任务失败:', error);
      return res.status(500).json({
        success: false,
        message: `创建任务失败: ${error.message}`
      });
    }
  }

  /**
   * 映射任务类型到树木类型
   * @param {string} taskType 任务类型
   * @returns {string} 树木类型
   */
  mapTaskTypeToTreeType(taskType) {
    const mappings = {
      'NORMAL': 'OAK',
      'WORK': 'MAPLE',
      'LEARNING': 'PINE',
      'PROJECT': 'REDWOOD',
      'LEISURE': 'WILLOW'
    };
    
    return mappings[taskType] || 'OAK';
  }

  /**
   * 批量创建任务和子任务
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async batchCreateTasks(req, res) {
    try {
      const { mainTask, subTasks, createTree = false, treeType } = req.body;
      
      // 参数验证
      if (!mainTask || !mainTask.title) {
        return res.status(400).json({
          success: false,
          message: '主任务必须包含标题'
        });
      }
      
      if (!Array.isArray(subTasks) || subTasks.length === 0) {
        return res.status(400).json({
          success: false,
          message: '必须提供至少一个子任务'
        });
      }
      
      // 根据是否创建树调用不同的服务方法
      let result;
      if (createTree) {
        result = await batchTaskCreationService.createTasksWithTree(
          mainTask, subTasks, treeType
        );
      } else {
        result = await batchTaskCreationService.createTasks(
          mainTask, subTasks
        );
      }
      
      // 返回成功结果
      return res.status(201).json({
        success: true,
        message: `成功创建主任务及${subTasks.length}个子任务${createTree ? '并建立任务树' : ''}`,
        data: result
      });
    } catch (error) {
      console.error('批量创建任务失败:', error);
      res.status(500).json({
        success: false,
        message: `批量创建任务失败: ${error.message}`
      });
    }
  }
  
  /**
   * 分析并拆解任务，然后批量创建
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async analyzeDecomposeAndCreate(req, res) {
    try {
      const { taskId, title, description, createTree = false, treeType, type, priority, dueDate } = req.body;
      
      // 参数验证
      if (!title) {
        return res.status(400).json({
          success: false,
          message: '任务必须包含标题'
        });
      }
      
      // 1. 先分析任务复杂度
      const analysisResult = await deepseekService.analyzeTaskComplexity({
        taskId, title, description
      });
      
      if (!analysisResult.success) {
        return res.status(500).json({
          success: false,
          message: '任务分析失败',
          error: analysisResult.error
        });
      }
      
      const complexity = analysisResult.data.complexity;
      
      // 2. 拆解任务
      const decompositionResult = await deepseekService.decomposeTask({
        taskId, title, description, complexity
      });
      
      if (!decompositionResult.success) {
        return res.status(500).json({
          success: false,
          message: '任务拆解失败',
          error: decompositionResult.error
        });
      }
      
      // 3. 准备批量创建的数据
      const mainTask = {
        id: taskId,
        title,
        description,
        complexity,
        type: type || analysisResult.data.type || 'NORMAL',
        priority: priority || analysisResult.data.priority || 'MEDIUM',
        dueDate: dueDate || null
      };
      
      const subTasks = decompositionResult.data.subTasks;
      
      // 4. 批量创建任务
      let creationResult;
      if (createTree) {
        creationResult = await batchTaskCreationService.createTasksWithTree(
          mainTask, subTasks, treeType
        );
      } else {
        creationResult = await batchTaskCreationService.createTasks(
          mainTask, subTasks
        );
      }
      
      // 5. 返回结果
      return res.status(201).json({
        success: true,
        message: '任务分析、拆解和创建成功',
        data: {
          analysis: analysisResult.data,
          decomposition: decompositionResult.data,
          creation: creationResult
        }
      });
    } catch (error) {
      console.error('任务分析、拆解和创建失败:', error);
      res.status(500).json({
        success: false,
        message: `任务分析、拆解和创建失败: ${error.message}`
      });
    }
  }
}

export const taskBreakdownController = new TaskBreakdownController();
export default taskBreakdownController; 