/**
 * 开发环境路由索引
 */
import express from 'express';
import taskRoutes from './taskRoutes.js';
import treeRoutes from './treeRoutes.js';
import healthRoutes from './healthRoutes.js';
import batchTaskRoutes from '../../routes/batchTaskRoutes.js';
import textToTaskRoutes from '../../routes/textToTaskRoutes.js';
import taskBreakdownRoutes from '../../routes/taskBreakdownRoutes.js';

const router = express.Router();

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'TaskForest开发环境服务正常运行'
  });
});

// 使用任务相关路由
router.use('/tasks', taskRoutes);

// 使用树木相关路由
router.use('/trees', treeRoutes);

// 使用批量任务路由
router.use('/batch-tasks', batchTaskRoutes);

// 使用文本到任务转换路由
router.use('/text-to-task', textToTaskRoutes);

// 使用任务分析和拆解路由
router.use('/tasks', taskBreakdownRoutes);

// 使用健康检查路由
router.use('/', healthRoutes);

export default router; 