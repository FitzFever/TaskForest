import { batchTaskCreationService } from '../services/batchTaskCreationService.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * 测试批量任务创建
 */
async function testBatchTaskCreation() {
  try {
    logger.info('开始测试批量任务创建');
    
    // 创建主任务数据
    const mainTask = {
      id: uuidv4(),
      title: '开发用户认证系统',
      description: '设计并实现一个完整的用户认证系统，包括登录、注册、密码重置等功能',
      priority: 'HIGH',
      estimatedHours: 40,
      status: 'NOT_STARTED',
      tags: ['backend', 'security', 'authentication']
    };
    
    // 创建子任务数据
    const subTasks = [
      {
        title: '设计用户数据模型',
        description: '设计用户表结构，包括必要的字段和关系',
        priority: 'HIGH',
        estimatedHours: 4,
        status: 'NOT_STARTED',
        tags: ['database', 'design']
      },
      {
        title: '实现用户注册功能',
        description: '开发注册API，包括表单验证、邮箱验证等',
        priority: 'HIGH',
        estimatedHours: 8,
        status: 'NOT_STARTED',
        tags: ['backend', 'api']
      },
      {
        title: '实现用户登录功能',
        description: '开发登录API，包括密码验证、JWT生成等',
        priority: 'HIGH',
        estimatedHours: 6,
        status: 'NOT_STARTED',
        tags: ['backend', 'api', 'security']
      },
      {
        title: '实现密码重置功能',
        description: '开发密码重置功能，包括邮件发送、验证码验证等',
        priority: 'MEDIUM',
        estimatedHours: 8,
        status: 'NOT_STARTED',
        tags: ['backend', 'email']
      },
      {
        title: '集成单元测试',
        description: '为所有认证功能编写单元测试',
        priority: 'MEDIUM',
        estimatedHours: 10,
        status: 'NOT_STARTED',
        tags: ['testing', 'quality']
      }
    ];
    
    // 测试创建任务（不带树）
    logger.info('测试创建任务（不带树）');
    const tasksResult = await batchTaskCreationService.createTasks(mainTask, subTasks);
    
    // 打印结果
    logger.info('创建结果 - 主任务:');
    logger.info(JSON.stringify(tasksResult.mainTask, null, 2));
    
    logger.info(`创建结果 - 子任务 (${tasksResult.subTasks.length}个):`);
    tasksResult.subTasks.forEach((task, index) => {
      logger.info(`子任务 ${index + 1}: ${task.title}`);
    });
    
    // 测试创建任务（带树）
    logger.info('测试创建任务（带树）');
    const treeResult = await batchTaskCreationService.createTasksWithTree(mainTask, subTasks, 'PROJECT');
    
    // 打印结果
    logger.info('创建结果（带树）:');
    logger.info(JSON.stringify({
      mainTaskId: treeResult.mainTask.id,
      subTasksCount: treeResult.subTasks.length,
      treeId: treeResult.tree.id,
      treeType: treeResult.tree.type
    }, null, 2));
    
    logger.info('批量任务创建测试完成');
    return {
      tasksResult,
      treeResult
    };
  } catch (error) {
    logger.error('批量任务创建测试失败:', error);
    throw error;
  }
}

// 执行测试
testBatchTaskCreation()
  .then(result => {
    logger.info('测试成功完成');
  })
  .catch(error => {
    logger.error('测试执行失败:', error.message);
    process.exit(1);
  }); 