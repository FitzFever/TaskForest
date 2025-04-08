/**
 * 任务相关路由配置
 */
import { Router } from 'express';
import taskController from '../controllers/taskController';

const router = Router();

// 获取任务列表
router.get('/', taskController.getTasks);

// 获取单个任务
router.get('/:id', taskController.getTask);

// 创建任务
router.post('/', taskController.createTask);

// 更新任务
router.put('/:id', taskController.updateTask);

// 删除任务
router.delete('/:id', taskController.deleteTask);

// 更新任务状态
router.put('/:id/status', taskController.updateTaskStatus);

// 完成任务
router.post('/:id/complete', taskController.completeTask);

export default router; 