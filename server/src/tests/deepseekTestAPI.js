import deepseekService from '../services/deepseekService.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 测试DeepSeek API服务
 */
async function testDeepSeekAPI() {
  logger.info('=== 开始测试DeepSeek API服务 ===');
  
  // 构造测试任务数据
  const taskData = {
    id: uuidv4(),
    title: '开发用户认证系统',
    description: `
      需要实现一个完整的用户认证系统，包含以下功能：
      1. 用户注册功能，支持邮箱验证
      2. 用户登录功能，支持密码和第三方OAuth登录
      3. 密码重置功能
      4. 用户权限管理
      5. 安全措施，包括防暴力破解、CSRF保护
    `,
    type: 'PROJECT',
    priority: 'HIGH'
  };
  
  try {
    // 测试1: 任务复杂度分析
    logger.info('测试1：分析任务复杂度');
    logger.info('发送任务数据:', { title: taskData.title });
    
    const analysisResult = await deepseekService.analyzeTask({
      taskId: taskData.id,
      title: taskData.title,
      description: taskData.description
    });
    
    if (analysisResult.success) {
      logger.info('任务分析成功:', {
        taskId: analysisResult.result.taskId,
        complexity: analysisResult.result.complexity
      });
    } else {
      logger.error('任务分析失败:', analysisResult.error);
      return;
    }
    
    // 测试2: 任务拆解
    logger.info('测试2：拆解任务');
    
    const decompositionResult = await deepseekService.decomposeTask({
      taskId: taskData.id,
      title: taskData.title,
      description: taskData.description,
      complexity: analysisResult.result.complexity
    });
    
    if (decompositionResult.success) {
      logger.info('任务拆解成功:', {
        taskId: decompositionResult.taskId,
        complexity: decompositionResult.complexity,
        subTaskCount: decompositionResult.subTasks.length
      });
      
      logger.info('子任务列表:');
      decompositionResult.subTasks.forEach((subTask, index) => {
        logger.info(`子任务 ${index + 1}:`, {
          title: subTask.title,
          estimatedHours: subTask.estimatedHours
        });
      });
    } else {
      logger.error('任务拆解失败:', decompositionResult.error);
    }
    
    logger.info('=== DeepSeek API测试完成 ===');
    return { analysisResult, decompositionResult };
  } catch (error) {
    logger.error('测试DeepSeek API服务失败:', error);
  }
}

// 执行测试
testDeepSeekAPI()
  .then((results) => {
    if (results) {
      logger.info('所有测试完成，结果汇总:', {
        analysisSuccess: results.analysisResult.success,
        decompositionSuccess: results.decompositionResult.success,
        complexity: results.analysisResult.success ? results.analysisResult.result.complexity : null,
        subTaskCount: results.decompositionResult.success ? results.decompositionResult.subTasks.length : 0
      });
    }
    logger.info('测试脚本执行完成');
  })
  .catch((error) => {
    logger.error('测试脚本执行失败:', error);
  }); 