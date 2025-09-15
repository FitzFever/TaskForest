import express from 'express';
import { batchTaskCreationController } from '../controllers/batchTaskCreationController.js';

const router = express.Router();

/**
 * @swagger
 * /api/batch-tasks:
 *   post:
 *     summary: 批量创建任务
 *     description: 批量创建多个任务
 *     tags: [批量任务]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 任务ID（可选，系统会自动生成）
 *                     title:
 *                       type: string
 *                       description: 任务标题
 *                     description:
 *                       type: string
 *                       description: 任务描述
 *                     type:
 *                       type: string
 *                       enum: [NORMAL, WORK, LEARNING, PROJECT, LEISURE]
 *                       description: 任务类型
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
 *                 message:
 *                   type: string
 *                   example: 批量任务创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.post('/', batchTaskCreationController.createTasks);

/**
 * @swagger
 * /api/batch-tasks/with-trees:
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
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 主任务ID（可选，系统会自动生成）
 *                     title:
 *                       type: string
 *                       description: 主任务标题
 *                     description:
 *                       type: string
 *                       description: 主任务描述
 *                     type:
 *                       type: string
 *                       enum: [NORMAL, WORK, LEARNING, PROJECT, LEISURE]
 *                       description: 任务类型
 *                     priority:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH]
 *                       description: 优先级
 *                     complexity:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH, VERY_HIGH]
 *                       description: 复杂度
 *                     status:
 *                       type: string
 *                       enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                       description: 任务状态
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 任务标签
 *                     subTasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - title
 *                         properties:
 *                           title:
 *                             type: string
 *                             description: 子任务标题
 *                           description:
 *                             type: string
 *                             description: 子任务描述
 *                           type:
 *                             type: string
 *                             enum: [NORMAL, WORK, LEARNING, PROJECT, LEISURE]
 *                             description: 任务类型
 *                           priority:
 *                             type: string
 *                             enum: [LOW, MEDIUM, HIGH]
 *                             description: 优先级
 *                           estimatedHours:
 *                             type: number
 *                             description: 估计小时数
 *                           status:
 *                             type: string
 *                             enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                             description: 任务状态
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: 任务标签
 *               createTrees:
 *                 type: boolean
 *                 description: 是否创建任务树
 *                 default: true
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
 *                 message:
 *                   type: string
 *                   example: 批量任务和任务树创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mainTask:
 *                             type: object
 *                           subTasks:
 *                             type: array
 *                             items:
 *                               type: object
 *                     trees:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.post('/with-trees', batchTaskCreationController.createTasksWithTree);

export default router; 