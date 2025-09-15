import taskIntegrationService from '../services/taskIntegrationService.js';
import taskService from '../services/taskService.js';
import treeService from '../services/treeService.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 完整任务集成测试
 * 测试从任务分析到树木创建的整个流程
 */
async function testFullIntegration() {
  logger.info('=== 开始完整任务集成测试 ===');
  
  // 构造测试任务数据
  const taskData = {
    id: uuidv4(),
    title: '实现在线学习平台',
    description: `
      开发一个完整的在线学习平台，包含以下功能：
      1. 用户注册和个人资料管理
      2. 课程展示和搜索功能
      3. 课程内容播放系统（视频、音频、文档）
      4. 学习进度跟踪和测验系统
      5. 评论和评分系统
      6. 教师管理后台
      7. 支付模块集成
    `,
    type: 'PROJECT',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后截止
  };
  
  try {
    logger.info('开始处理任务:', { 
      taskId: taskData.id, 
      title: taskData.title 
    });
    
    // 1. 调用任务集成服务处理任务
    const result = await taskIntegrationService.processTask(taskData);
    
    // 2. 检查处理结果
    if (!result.success) {
      logger.error('任务处理失败:', result.error);
      return;
    }
    
    // 3. 检查各部分结果
    logger.info('任务处理成功:', {
      mainTaskId: result.mainTask.id,
      complexity: result.analysisResult.complexity,
      subTaskCount: result.subTasks.length
    });
    
    // 4. 验证主任务
    const retrievedMainTask = await taskService.getTask(result.mainTask.id);
    logger.info('成功验证主任务:', {
      mainTaskId: retrievedMainTask.id,
      title: retrievedMainTask.title,
      complexity: retrievedMainTask.complexity
    });
    
    // 5. 验证子任务
    for (const subTask of result.subTasks) {
      const retrievedSubTask = await taskService.getTask(subTask.id);
      logger.info('成功验证子任务:', {
        subTaskId: retrievedSubTask.id,
        title: retrievedSubTask.title,
        parentTaskId: retrievedSubTask.parentTaskId
      });
      
      // 确认子任务关联到正确的主任务
      if (retrievedSubTask.parentTaskId !== result.mainTask.id) {
        logger.error('子任务关联错误:', {
          subTaskId: retrievedSubTask.id,
          expectedParentId: result.mainTask.id,
          actualParentId: retrievedSubTask.parentTaskId
        });
      }
    }
    
    // 6. 验证树木
    const mainTree = result.trees.mainTree;
    const retrievedMainTree = await treeService.getTree(mainTree.id);
    logger.info('成功验证主树:', {
      mainTreeId: retrievedMainTree.id,
      type: retrievedMainTree.type,
      taskId: retrievedMainTree.taskId
    });
    
    // 7. 验证子树
    for (const subTree of result.trees.subTrees) {
      const retrievedSubTree = await treeService.getTree(subTree.id);
      logger.info('成功验证子树:', {
        subTreeId: retrievedSubTree.id,
        type: retrievedSubTree.type,
        parentTreeId: retrievedSubTree.parentTreeId
      });
      
      // 确认子树关联到正确的主树
      if (retrievedSubTree.parentTreeId !== mainTree.id) {
        logger.error('子树关联错误:', {
          subTreeId: retrievedSubTree.id,
          expectedParentId: mainTree.id,
          actualParentId: retrievedSubTree.parentTreeId
        });
      }
    }
    
    // 8. 验证任务与树木关联
    for (const subTask of result.subTasks) {
      // 查找对应的树木
      const matchingTree = result.trees.subTrees.find(tree => tree.taskId === subTask.id);
      
      if (!matchingTree) {
        logger.error('子任务缺少对应的树木:', {
          subTaskId: subTask.id,
          title: subTask.title
        });
      } else {
        logger.info('子任务树木关联正确:', {
          subTaskId: subTask.id,
          subTreeId: matchingTree.id
        });
      }
    }
    
    // 9. 验证处理后的任务列表
    const processedTasks = await taskIntegrationService.getProcessedTasks();
    logger.info('已处理任务列表获取成功:', {
      count: processedTasks.length
    });
    
    // 检查当前任务是否在已处理列表中
    const currentProcessedTask = processedTasks.find(
      task => task.mainTask.id === result.mainTask.id
    );
    
    if (currentProcessedTask) {
      logger.info('当前任务在已处理列表中:', {
        mainTaskId: currentProcessedTask.mainTask.id,
        subTaskCount: currentProcessedTask.subTasks.length,
        hasTree: !!currentProcessedTask.trees
      });
    } else {
      logger.error('当前任务未在已处理列表中', {
        mainTaskId: result.mainTask.id
      });
    }
    
    logger.info('=== 完整任务集成测试成功完成 ===');
    return result;
  } catch (error) {
    logger.error('集成测试失败:', error);
  }
}

// 执行测试
testFullIntegration()
  .then((result) => {
    if (result) {
      logger.info('集成测试结果汇总:', {
        success: true,
        mainTaskId: result.mainTask.id,
        subTaskCount: result.subTasks.length,
        complexity: result.analysisResult.complexity,
        mainTreeId: result.trees.mainTree.id,
        subTreeCount: result.trees.subTrees.length
      });
    }
    logger.info('测试脚本执行完成');
  })
  .catch((error) => {
    logger.error('测试脚本执行失败:', error);
  }); 