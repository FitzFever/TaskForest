import express from 'express';
import { TaskAnalysisController } from '../controllers/taskAnalysisController.js';
const router = express.Router();
const taskAnalysisController = new TaskAnalysisController();
/**
 * @swagger
 * /api/tasks/analyze:
 *   post:
 *     summary: 分析任务复杂度
 *     tags: [Task Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - title
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: 任务ID
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *     responses:
 *       200:
 *         description: 分析成功
 *       400:
 *         description: 请求参数有误
 *       500:
 *         description: 服务器错误
 */
router.post('/analyze', taskAnalysisController.analyzeTaskComplexity);
/**
 * @swagger
 * /api/tasks/decompose:
 *   post:
 *     summary: 将任务拆解为子任务
 *     tags: [Task Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - title
 *               - complexity
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: 任务ID
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               complexity:
 *                 type: string
 *                 enum: [SIMPLE, MEDIUM, COMPLEX]
 *                 description: 任务复杂度
 *     responses:
 *       200:
 *         description: 拆解成功
 *       400:
 *         description: 请求参数有误
 *       500:
 *         description: 服务器错误
 */
router.post('/decompose', taskAnalysisController.decomposeTask);
export default router;
//# sourceMappingURL=taskAnalysisRoutes.js.map