import batchTaskCreationService from '../services/batchTaskCreationService.js';
import logger from '../utils/logger.js';
import { storeBatchCreatedData } from '../dataStore.js';

/**
 * 批量任务创建控制器
 * 提供批量创建任务和任务树的API接口
 */
class BatchTaskCreationController {
  /**
   * 批量创建任务（不创建任务树）
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async createTasks(req, res) {
    try {
      const { tasks } = req.body;
      
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({
          success: false,
          message: '任务数据必须是非空数组'
        });
      }
      
      // 验证每个任务必须有标题
      const invalidTasks = tasks.filter(task => !task.title);
      if (invalidTasks.length > 0) {
        return res.status(400).json({
          success: false,
          message: '所有任务必须包含标题'
        });
      }
      
      // 调用服务创建任务
      const result = await batchTaskCreationService.createBatchTasks(tasks);
      
      // 存储创建的任务到全局变量
      storeBatchCreatedData(result.tasks, []);
      
      return res.status(201).json({
        success: true,
        message: '批量任务创建成功',
        data: result
      });
    } catch (error) {
      logger.error('批量创建任务失败:', error);
      return res.status(500).json({
        success: false,
        message: '批量创建任务失败',
        error: error.message
      });
    }
  }
  
  /**
   * 批量创建任务并创建任务树
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async createTasksWithTree(req, res) {
    try {
      const { tasks, createTrees = true } = req.body;
      
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({
          success: false,
          message: '任务数据必须是非空数组'
        });
      }
      
      // 验证每个任务必须有标题
      const invalidTasks = tasks.filter(task => !task.title);
      if (invalidTasks.length > 0) {
        return res.status(400).json({
          success: false,
          message: '所有任务必须包含标题'
        });
      }
      
      // 调用服务创建任务和任务树
      const result = await batchTaskCreationService.createBatchTasksWithTrees(tasks, createTrees);
      
      // 获取所有创建的任务
      const allCreatedTasks = [];
      if (result.tasks && Array.isArray(result.tasks)) {
        result.tasks.forEach(taskGroup => {
          if (taskGroup.mainTask) {
            allCreatedTasks.push(taskGroup.mainTask);
            
            if (taskGroup.subTasks && Array.isArray(taskGroup.subTasks)) {
              allCreatedTasks.push(...taskGroup.subTasks);
            }
          }
        });
      }
      
      // 存储创建的任务和树木到全局变量
      const storeResult = storeBatchCreatedData(allCreatedTasks, result.trees || []);
      console.log(`存储批量创建的数据结果:`, storeResult);
      
      console.log(`批量创建任务和树木控制器处理完成`);
      
      return res.status(201).json({
        code: 201,
        data: result,
        message: `成功批量创建了 ${result.tasks.length} 个任务组和 ${result.trees ? result.trees.length : 0} 个任务树`,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('批量创建任务和任务树失败:', error);
      return res.status(500).json({
        code: 500,
        data: null,
        error: {
          message: '批量创建任务和任务树失败',
          details: error.message
        },
        message: 'Internal Server Error',
        timestamp: Date.now()
      });
    }
  }
}

// 导出控制器实例
export const batchTaskCreationController = new BatchTaskCreationController(); 