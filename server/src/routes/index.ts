/**
 * API路由主入口
 */
import { Router } from 'express';
import taskRoutes from './taskRoutes';
// 在此导入其他路由
// import treeRoutes from './treeRoutes';
// import aiRoutes from './aiRoutes';
// import settingsRoutes from './settingsRoutes';

const router = Router();

// 挂载任务路由
router.use('/tasks', taskRoutes);

// 挂载其他路由
// router.use('/trees', treeRoutes);
// router.use('/ai', aiRoutes);
// router.use('/settings', settingsRoutes);

export default router; 