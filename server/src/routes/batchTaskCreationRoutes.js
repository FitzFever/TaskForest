import express from 'express';
import { batchTaskCreationController } from '../controllers/batchTaskCreationController.js';

const router = express.Router();

/**
 * @swagger
 * /api/batch-tasks:
 *   post:
 *     summary: 批量创建任务
 *     description: 批量创建主任务和子任务
 *     tags: [批量任务]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mainTask
 *               - subTasks
 *             properties:
 *               mainTask:
 *                 type: object
 *                 required:
 *                   - title
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 主任务ID（可选，系统会自动生成）
 *                   title:
 *                     type: string
 *                     description: 主任务标题
 *                   description:
 *                     type: string
 *                     description: 主任务描述
 *                   priority:
 *                     type: string
 *                     enum: [LOW, MEDIUM, HIGH]
 *                     description: 优先级
 *                   estimatedHours:
 *                     type: number
 *                     description: 估计小时数
 *                   status:
 *                     type: string
 *                     enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                     description: 任务状态
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: 任务标签
 *               subTasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: 子任务标题
 *                     description:
 *                       type: string
 *                       description: 子任务描述
 *                     priority:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH]
 *                       description: 优先级
 *                     estimatedHours:
 *                       type: number
 *                       description: 估计小时数
 *                     status:
 *                       type: string
 *                       enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                       description: 任务状态
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 任务标签
 *     responses:
 *       201:
 *         description: 批量创建任务成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     mainTask:
 *                       type: object
 *                     subTasks:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.post('/', batchTaskCreationController.createTasks);

/**
 * @swagger
 * /api/batch-tasks/with-tree:
 *   post:
 *     summary: 批量创建任务和任务树
 *     description: 批量创建主任务和子任务，并同时创建关联的任务树
 *     tags: [批量任务]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mainTask
 *               - subTasks
 *             properties:
 *               mainTask:
 *                 type: object
 *                 required:
 *                   - title
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 主任务ID（可选，系统会自动生成）
 *                   title:
 *                     type: string
 *                     description: 主任务标题
 *                   description:
 *                     type: string
 *                     description: 主任务描述
 *                   priority:
 *                     type: string
 *                     enum: [LOW, MEDIUM, HIGH]
 *                     description: 优先级
 *                   estimatedHours:
 *                     type: number
 *                     description: 估计小时数
 *                   status:
 *                     type: string
 *                     enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                     description: 任务状态
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: 任务标签
 *               subTasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: 子任务标题
 *                     description:
 *                       type: string
 *                       description: 子任务描述
 *                     priority:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH]
 *                       description: 优先级
 *                     estimatedHours:
 *                       type: number
 *                       description: 估计小时数
 *                     status:
 *                       type: string
 *                       enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                       description: 任务状态
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 任务标签
 *               treeType:
 *                 type: string
 *                 description: 任务树类型
 *                 default: DEFAULT
 *                 enum: [DEFAULT, OAK, PINE, MAPLE, CHERRY, PROJECT]
 *     responses:
 *       201:
 *         description: 批量创建任务和任务树成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     mainTask:
 *                       type: object
 *                     subTasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                     tree:
 *                       type: object
 */
router.post('/with-tree', batchTaskCreationController.createTasksWithTree);

export default router; 