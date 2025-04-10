/**
 * 树木相关路由
 */
import { Router } from 'express';
import { 
  getTrees, 
  getTreeById, 
  createTree, 
  updateTree, 
  deleteTree, 
  growTree,
  bindTaskToTree,
  unbindTaskFromTree
} from '../controllers/treeController.js';
import {
  getTreeHealth,
  updateTreeHealth,
  batchUpdateTreesHealth
} from '../controllers/treeHealthController.js';

const router = Router();

// 获取所有树木
router.get('/', getTrees);

// 获取单个树木
router.get('/:id', getTreeById);

// 创建树木
router.post('/', createTree);

// 更新树木
router.put('/:id', updateTree);

// 删除树木
router.delete('/:id', deleteTree);

// 树木生长
router.post('/:id/grow', growTree);

// 绑定树木到任务
router.post('/:id/bind-task/:taskId', bindTaskToTree);

// 解绑树木与任务
router.post('/:id/unbind-task', unbindTaskFromTree);

// 树木健康状态相关路由

// 获取树木健康状态
router.get('/:id/health', getTreeHealth);

// 更新树木健康状态
router.put('/:id/health', updateTreeHealth);

// 批量更新所有树木健康状态
router.post('/health/batch-update', batchUpdateTreesHealth);

export default router; 