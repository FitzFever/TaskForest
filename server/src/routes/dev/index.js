/**
 * TaskForest开发环境API路由
 * 整合所有子路由
 */
import express from 'express';
import taskRoutes from './taskRoutes.js';
import treeRoutes from './treeRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

// 使用任务相关路由
router.use('/tasks', taskRoutes);

// 使用树木相关路由
router.use('/trees', treeRoutes);

// 使用健康检查路由
router.use('/', healthRoutes);

export default router; 