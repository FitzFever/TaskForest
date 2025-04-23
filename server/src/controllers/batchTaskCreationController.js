import { batchTaskCreationService } from '../services/batchTaskCreationService.js';
import logger from '../utils/logger.js';

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
      const { mainTask, subTasks } = req.body;
      
      if (!mainTask || !mainTask.title) {
        return res.status(400).json({
          success: false,
          message: '缺少主任务数据或主任务标题'
        });
      }
      
      if (!Array.isArray(subTasks) || subTasks.length === 0) {
        return res.status(400).json({
          success: false,
          message: '子任务数据必须是非空数组'
        });
      }
      
      // 确保所有子任务都有标题
      const invalidSubTasks = subTasks.filter(task => !task.title);
      if (invalidSubTasks.length > 0) {
        return res.status(400).json({
          success: false,
          message: '所有子任务必须包含标题'
        });
      }
      
      // 调用服务创建任务
      const result = await batchTaskCreationService.createTasks(mainTask, subTasks);
      
      return res.status(201).json({
        success: true,
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
      const { mainTask, subTasks, treeType } = req.body;
      
      if (!mainTask || !mainTask.title) {
        return res.status(400).json({
          success: false,
          message: '缺少主任务数据或主任务标题'
        });
      }
      
      if (!Array.isArray(subTasks) || subTasks.length === 0) {
        return res.status(400).json({
          success: false,
          message: '子任务数据必须是非空数组'
        });
      }
      
      // 确保所有子任务都有标题
      const invalidSubTasks = subTasks.filter(task => !task.title);
      if (invalidSubTasks.length > 0) {
        return res.status(400).json({
          success: false,
          message: '所有子任务必须包含标题'
        });
      }
      
      // 调用服务创建任务和任务树
      const result = await batchTaskCreationService.createTasksWithTree(mainTask, subTasks, treeType);
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('批量创建任务和任务树失败:', error);
      return res.status(500).json({
        success: false,
        message: '批量创建任务和任务树失败',
        error: error.message
      });
    }
  }
}

// 导出控制器实例
export const batchTaskCreationController = new BatchTaskCreationController(); 