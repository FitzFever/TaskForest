import express from 'express';
import { textToTaskController } from '../controllers/textToTaskController.js';

const router = express.Router();

/**
 * @swagger
 * /api/text-to-task:
 *   post:
 *     summary: 从文本生成任务和任务树
 *     description: 分析提供的文本内容，提取任务信息，分析复杂度，拆解为子任务，并创建任务和任务树
 *     tags: [文本分析]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: 要分析的文本内容
 *               createTree:
 *                 type: boolean
 *                 description: 是否创建任务树
 *                 default: true
 *               treeType:
 *                 type: string
 *                 description: 树木类型
 *                 enum: [OAK, PINE, MAPLE, CHERRY, WILLOW]
 *                 default: OAK
 *     responses:
 *       201:
 *         description: 成功从文本生成任务和任务树
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
 *                   example: 成功从文本生成任务
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: object
 *                       description: 任务分析结果
 *                     tasks:
 *                       type: object
 *                       description: 创建的任务和任务树
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/', textToTaskController.generateTasksFromText);

export default router; 