import taskIntegrationService from '../services/taskIntegrationService.js';
import logger from '../utils/logger.js';

/**
 * 任务集成控制器 - 处理与任务分析、拆解和创建相关的集成API请求
 */
const taskIntegrationController = {
  /**
   * 处理任务（一站式分析、拆解和创建）
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  processTask: async (req, res) => {
    try {
      const taskData = req.body;
      
      // 验证必要字段
      if (!taskData.title) {
        return res.status(400).json({
          success: false,
          message: '任务标题不能为空'
        });
      }
      
      logger.info(`开始处理任务: ${taskData.title}`);
      
      // 调用集成服务进行完整处理
      const result = await taskIntegrationService.processTask(taskData);
      
      return res.status(200).json({
        success: true,
        message: '任务处理成功',
        data: result
      });
    } catch (error) {
      logger.error(`处理任务失败: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `处理任务失败: ${error.message}`
      });
    }
  },

  /**
   * 获取所有已处理的任务及其子任务
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  getProcessedTasks: async (req, res) => {
    try {
      logger.info('请求获取所有已处理的任务');
      
      // 调用集成服务获取已处理的任务
      const processedTasks = await taskIntegrationService.getProcessedTasks();
      
      return res.status(200).json({
        success: true,
        message: '成功获取任务列表',
        data: processedTasks
      });
    } catch (error) {
      logger.error(`获取已处理任务失败: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `获取已处理任务失败: ${error.message}`
      });
    }
  }
};

export default taskIntegrationController; 