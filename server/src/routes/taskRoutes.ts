/**
 * 任务相关路由配置
 */
import { Router } from 'express';
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask,
  updateTaskStatus,
  completeTask
} from '../controllers/taskController.js';
import {
  getTaskTreeHealth,
  updateTaskProgress
} from '../controllers/treeHealthController.js';

const router = Router();

// 获取任务列表
router.get('/', getTasks);

// 获取单个任务
router.get('/:id', getTask);

// 创建任务
router.post('/', createTask);

// 更新任务
router.put('/:id', updateTask);

// 删除任务
router.delete('/:id', deleteTask);

// 更新任务状态
router.put('/:id/status', updateTaskStatus);

// 完成任务
router.post('/:id/complete', completeTask);

// 树木健康状态相关路由

// 获取任务与树木健康关联
router.get('/:id/tree-health', getTaskTreeHealth);

// 更新任务进度（影响健康状态）
router.put('/:id/progress', updateTaskProgress);

export default router; 