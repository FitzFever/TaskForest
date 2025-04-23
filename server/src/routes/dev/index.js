/**
 * TaskForest开发环境API路由
 * 整合所有子路由
 */
import express from 'express';
import taskRoutes from './taskRoutes.js';
import treeRoutes from './treeRoutes.js';
import healthRoutes from './healthRoutes.js';
import batchTaskRoutes from '../../routes/batchTaskRoutes.js';
import textToTaskRoutes from '../../routes/textToTaskRoutes.js';
import taskBreakdownRoutes from '../../routes/taskBreakdownRoutes.js';

const router = express.Router();

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