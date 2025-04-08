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
  growTree 
} from '../controllers/treeController.js';

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

export default router; 