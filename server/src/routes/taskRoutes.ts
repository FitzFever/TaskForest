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

export default router; 