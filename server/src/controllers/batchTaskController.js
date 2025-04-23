import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import batchTaskCreationService from '../services/batchTaskCreationService.js';

/**
 * 批量任务控制器
 * 处理批量任务创建相关的API请求
 */
class BatchTaskController {
  /**
   * 创建批量任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} 响应对象
   */
  async createBatchTasks(req, res) {
    try {
      logger.info(`BatchTaskController - 收到批量创建任务请求: ${JSON.stringify(req.body)}`);
      
      // 验证请求体
      if (!req.body.tasks || !Array.isArray(req.body.tasks) || req.body.tasks.length === 0) {
        logger.error('BatchTaskController - 创建失败：请求参数无效');
        return res.status(400).json({
          success: false,
          message: '请求参数无效，tasks必须是非空数组'
        });
      }
      
      // 调用批量创建服务
      const result = await batchTaskCreationService.createBatchTasks(req.body.tasks);
      
      // 返回创建结果
      return res.status(201).json({
        success: true,
        message: '批量任务创建成功',
        data: result
      });
    } catch (error) {
      logger.error(`BatchTaskController - 创建批量任务失败: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `批量任务创建失败: ${error.message}`
      });
    }
  }

  /**
   * 创建批量任务和任务树
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @returns {Object} 响应对象
   */
  async createBatchTasksWithTrees(req, res) {
    try {
      logger.info(`BatchTaskController - 收到批量创建任务和任务树请求: ${JSON.stringify(req.body)}`);
      
      // 验证请求体
      if (!req.body.tasks || !Array.isArray(req.body.tasks) || req.body.tasks.length === 0) {
        logger.error('BatchTaskController - 创建失败：请求参数无效');
        return res.status(400).json({
          success: false,
          message: '请求参数无效，tasks必须是非空数组'
        });
      }
      
      // 验证每个任务是否包含子任务
      for (const task of req.body.tasks) {
        if (!task.subTasks || !Array.isArray(task.subTasks) || task.subTasks.length === 0) {
          logger.error(`BatchTaskController - 创建失败：任务 ${task.title} 未包含子任务或子任务格式不正确`);
          return res.status(400).json({
            success: false,
            message: `任务 ${task.title} 未包含子任务或子任务格式不正确`
          });
        }
      }
      
      // 确定是否创建任务树
      const createTrees = req.body.createTrees === undefined ? true : Boolean(req.body.createTrees);
      
      // 调用批量创建服务
      const result = await batchTaskCreationService.createBatchTasksWithTrees(req.body.tasks, createTrees);
      
      // 返回创建结果
      return res.status(201).json({
        success: true,
        message: '批量任务和任务树创建成功',
        data: result
      });
    } catch (error) {
      logger.error(`BatchTaskController - 创建批量任务和任务树失败: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `批量任务和任务树创建失败: ${error.message}`
      });
    }
  }
}

export default new BatchTaskController(); 