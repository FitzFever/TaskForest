import express from 'express';
import batchTaskController from '../controllers/batchTaskController.js';

const router = express.Router();

/**
 * @swagger
 * /api/batch-tasks:
 *   post:
 *     summary: 批量创建任务
 *     description: 创建多个任务
 *     tags:
 *       - 批量任务管理
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
 *                 description: 任务列表
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - description
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: 任务标题
 *                     description:
 *                       type: string
 *                       description: 任务描述
 *                     status:
 *                       type: string
 *                       description: 任务状态
 *                       default: "未开始"
 *                       enum: ["未开始", "进行中", "已完成"]
 *                     priority:
 *                       type: string
 *                       description: 任务优先级
 *                       default: "中"
 *                       enum: ["低", "中", "高"]
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       description: 任务截止日期
 *     responses:
 *       201:
 *         description: 批量任务创建成功
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
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/', batchTaskController.createBatchTasks);

/**
 * @swagger
 * /api/batch-tasks/with-trees:
 *   post:
 *     summary: 批量创建任务和任务树
 *     description: 创建多个任务及其子任务，并创建对应的任务树
 *     tags:
 *       - 批量任务管理
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
 *                 description: 主任务列表
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - description
 *                     - subTasks
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: 主任务标题
 *                     description:
 *                       type: string
 *                       description: 主任务描述
 *                     status:
 *                       type: string
 *                       description: 主任务状态
 *                       default: "未开始"
 *                       enum: ["未开始", "进行中", "已完成"]
 *                     priority:
 *                       type: string
 *                       description: 主任务优先级
 *                       default: "中"
 *                       enum: ["低", "中", "高"]
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       description: 主任务截止日期
 *                     subTasks:
 *                       type: array
 *                       description: 子任务列表
 *                       items:
 *                         type: object
 *                         required:
 *                           - title
 *                           - description
 *                         properties:
 *                           title:
 *                             type: string
 *                             description: 子任务标题
 *                           description:
 *                             type: string
 *                             description: 子任务描述
 *                           status:
 *                             type: string
 *                             description: 子任务状态
 *                             default: "未开始"
 *                             enum: ["未开始", "进行中", "已完成"]
 *                           priority:
 *                             type: string
 *                             description: 子任务优先级
 *                             default: "中"
 *                             enum: ["低", "中", "高"]
 *                           estimatedHours:
 *                             type: number
 *                             description: 预计完成时间（小时）
 *               createTrees:
 *                 type: boolean
 *                 description: 是否为每个主任务创建任务树
 *                 default: true
 *     responses:
 *       201:
 *         description: 批量任务和任务树创建成功
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
 *                     trees:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/with-trees', batchTaskController.createBatchTasksWithTrees);

export default router; 