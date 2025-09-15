/**
 * API Routes - Main entry point for all API routes
 */
import { Router } from 'express';
import taskRoutes from './taskRoutes.js';
import treeRoutes from './treeRoutes.js';
// 在此导入其他路由
// import aiRoutes from './aiRoutes.js';
// import settingsRoutes from './settingsRoutes.js';

const router = Router();

// Mount task routes
router.use('/tasks', taskRoutes);

// Mount tree routes
router.use('/trees', treeRoutes);

// 挂载其他路由
// router.use('/ai', aiRoutes);
// router.use('/settings', settingsRoutes);

export default router; 