import { batchTaskCreationService } from '../services/batchTaskCreationService.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * 测试批量任务创建服务
 */
async function testBatchTaskCreation() {
  logger.info('=== 开始测试批量任务创建服务 ===');

  // 构造测试数据
  const taskId = uuidv4();
  const mainTask = {
    id: taskId,
    title: '开发用户注册功能',
    description: '实现一个完整的用户注册系统，包含表单验证、API集成、用户数据存储和邮件确认',
    type: 'PROJECT',
    priority: 'HIGH'
  };

  const subTasks = [
    {
      title: '设计注册表单界面',
      description: '创建用户注册表单的前端界面，包括字段验证和用户体验优化',
      estimatedHours: 4
    },
    {
      title: '实现表单验证逻辑',
      description: '添加各种字段验证，如邮箱格式、密码强度检查等',
      estimatedHours: 5
    },
    {
      title: '开发后端注册API',
      description: '创建用户注册的后端API接口，包括数据验证和用户存储',
      estimatedHours: 8
    },
    {
      title: '实现邮件确认功能',
      description: '添加注册后的邮件确认流程，包括邮件发送和验证链接处理',
      estimatedHours: 6
    }
  ];

  try {
    // 测试1: 创建任务和子任务（不创建树）
    logger.info('测试1：批量创建任务（不创建树）');
    
    const tasksResult = await batchTaskCreationService.createTasks(mainTask, subTasks);
    
    if (tasksResult) {
      logger.info('批量创建任务成功：', {
        mainTaskId: tasksResult.mainTask.id,
        subTasksCount: tasksResult.subTasks.length
      });
    } else {
      logger.error('批量创建任务失败');
      return;
    }
    
    // 测试2: 创建任务和子任务，并创建任务树
    logger.info('测试2：批量创建任务和任务树');
    
    const treeType = 'OAK'; // 可以是 OAK, PINE, MAPLE 等
    const tasksWithTreeResult = await batchTaskCreationService.createTasksWithTree(
      { ...mainTask, id: uuidv4() }, // 使用新ID避免冲突
      subTasks,
      treeType
    );
    
    if (tasksWithTreeResult) {
      logger.info('批量创建任务和树成功：', {
        mainTaskId: tasksWithTreeResult.mainTask.id,
        subTasksCount: tasksWithTreeResult.subTasks.length,
        treeId: tasksWithTreeResult.tree.id,
        treeType: tasksWithTreeResult.tree.type
      });
    } else {
      logger.error('批量创建任务和树失败');
    }
    
    logger.info('=== 批量任务创建服务测试完成 ===');
  } catch (error) {
    logger.error('测试批量任务创建服务失败：', error);
  }
}

// 执行测试
testBatchTaskCreation().catch(error => {
  logger.error('运行测试时发生错误：', error);
  process.exit(1);
}); 