import express from 'express';
import taskIntegrationController from '../controllers/taskIntegrationController.js';

const router = express.Router();

/**
 * @swagger
 * /api/tasks/integration/process:
 *   post:
 *     summary: 一站式处理任务（分析复杂度、拆解任务、创建任务）
 *     tags: [任务集成]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: 任务ID（可选，不提供则自动生成）
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务详细描述
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: 任务截止日期
 *     responses:
 *       200:
 *         description: 任务处理成功
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
 *                   example: 任务处理成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     mainTask:
 *                       type: object
 *                       description: 主任务信息
 *                     subTasks:
 *                       type: array
 *                       description: 子任务列表
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/integration/process', taskIntegrationController.processTask);

/**
 * @swagger
 * /api/tasks/integration/processed:
 *   get:
 *     summary: 获取所有已处理的主任务及其子任务
 *     tags: [任务集成]
 *     responses:
 *       200:
 *         description: 成功获取任务列表
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
 *                   example: 成功获取任务列表
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mainTask:
 *                         type: object
 *                         description: 主任务信息
 *                       subTasks:
 *                         type: array
 *                         description: 子任务列表
 *       500:
 *         description: 服务器错误
 */
router.get('/integration/processed', taskIntegrationController.getProcessedTasks);

export default router; 