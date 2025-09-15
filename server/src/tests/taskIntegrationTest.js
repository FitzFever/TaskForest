import taskIntegrationService from '../services/taskIntegrationService.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 测试任务集成服务
 */
async function testTaskIntegration() {
  logger.info('=== 开始测试任务集成服务 ===');
  
  // 构造测试任务数据
  const taskData = {
    id: uuidv4(),
    title: '实现用户认证系统',
    description: `
      需要开发一个完整的用户认证系统，包含以下功能：
      1. 用户注册功能，支持邮箱验证
      2. 用户登录功能，支持密码和第三方OAuth登录
      3. 密码重置功能
      4. 用户权限管理
      5. 安全措施，包括防暴力破解、CSRF保护、XSS防护
      6. 用户会话管理，包含自动登出机制
      7. 支持两步验证（2FA）
    `,
    type: 'PROJECT',
    priority: 'HIGH'
  };
  
  try {
    logger.info('正在处理任务:', { taskId: taskData.id, title: taskData.title });
    
    // 调用任务集成服务处理任务
    const result = await taskIntegrationService.processTask(taskData);
    
    if (result.mainTask) {
      logger.info('任务处理成功');
      logger.info('主任务:', {
        id: result.mainTask.id,
        title: result.mainTask.title,
        complexity: result.mainTask.complexity
      });
      
      logger.info(`创建了 ${result.subTasks.length} 个子任务:`);
      result.subTasks.forEach((subtask, index) => {
        logger.info(`子任务 ${index+1}:`, {
          id: subtask.id,
          title: subtask.title,
          estimatedHours: subtask.estimatedHours
        });
      });
      
      logger.info('完整处理结果:', JSON.stringify(result, null, 2));
    } else {
      logger.error('任务处理失败:', result.error);
    }
  } catch (error) {
    logger.error('测试任务集成服务失败:', error);
  }
  
  logger.info('=== 任务集成服务测试完成 ===');
}

// 执行测试
testTaskIntegration()
  .then(() => {
    logger.info('测试脚本执行完成');
  })
  .catch(error => {
    logger.error('测试脚本执行失败:', error);
  }); 