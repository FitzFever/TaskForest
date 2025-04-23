import express from 'express';
import { taskBreakdownController } from '../controllers/taskBreakdownController.js';

const router = express.Router();

/**
 * @swagger
 * /api/tasks/analyze:
 *   post:
 *     summary: 分析任务复杂度
 *     description: 使用DeepSeek API分析任务的复杂度
 *     tags: [任务拆解]
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
 *                 description: 任务ID（可选）
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *     responses:
 *       200:
 *         description: 成功分析任务
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 任务分析成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     complexity:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH]
 *                     analysis:
 *                       type: string
 */
router.post('/analyze', taskBreakdownController.analyzeTask);

/**
 * @swagger
 * /api/tasks/decompose:
 *   post:
 *     summary: 拆解任务为子任务
 *     description: 使用DeepSeek API将任务拆解为子任务
 *     tags: [任务拆解]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - complexity
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: 任务ID（可选）
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               complexity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 description: 任务复杂度
 *     responses:
 *       200:
 *         description: 成功拆解任务
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 任务拆解成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     complexity:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH]
 *                     subTasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           estimatedHours:
 *                             type: number
 */
router.post('/decompose', taskBreakdownController.decomposeTask);

/**
 * @swagger
 * /api/tasks/analyze-and-decompose:
 *   post:
 *     summary: 分析并拆解任务
 *     description: 使用DeepSeek API分析任务复杂度并将任务拆解为子任务
 *     tags: [任务拆解]
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
 *                 description: 任务ID（可选）
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *     responses:
 *       200:
 *         description: 成功分析并拆解任务
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 任务分析和拆解成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: object
 *                     decomposition:
 *                       type: object
 */
router.post('/analyze-and-decompose', taskBreakdownController.analyzeAndDecomposeTask);

/**
 * @swagger
 * /api/tasks/batch-create:
 *   post:
 *     summary: 创建任务和任务树
 *     description: 批量创建主任务和子任务，并可选地建立任务树
 *     tags: [任务拆解]
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
 *                     description: 主任务ID（可选，将自动生成）
 *                   title:
 *                     type: string
 *                     description: 主任务标题
 *                   description:
 *                     type: string
 *                     description: 主任务描述
 *                   type:
 *                     type: string
 *                     enum: [NORMAL, WORK, LEARNING, PROJECT, LEISURE]
 *                     description: 任务类型
 *                   priority:
 *                     type: string
 *                     enum: [LOW, MEDIUM, HIGH]
 *                     description: 优先级
 *                   complexity:
 *                     type: string
 *                     enum: [LOW, MEDIUM, HIGH]
 *                     description: 复杂度
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                     description: 截止日期
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: 任务标签
 *               subTasks:
 *                 type: array
 *                 description: 子任务列表
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
 *                     estimatedHours:
 *                       type: number
 *                       description: 预计完成时间（小时）
 *                     type:
 *                       type: string
 *                       enum: [NORMAL, WORK, LEARNING, PROJECT, LEISURE]
 *                       description: 任务类型
 *                     priority:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH]
 *                       description: 优先级
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                       description: 截止日期
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 任务标签
 *               createTrees:
 *                 type: boolean
 *                 description: 是否创建任务树
 *                 default: true
 *     responses:
 *       200:
 *         description: 成功创建任务
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       nullable: true
 */
router.post('/batch-create', taskBreakdownController.createTasksAndTrees.bind(taskBreakdownController));

/**
 * @swagger
 * /api/tasks/batch:
 *   post:
 *     summary: 批量创建任务和子任务
 *     description: 批量创建主任务和子任务，可选择是否同时创建任务树
 *     tags: [Tasks]
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
 *                     description: 主任务ID（可选）
 *                   title:
 *                     type: string
 *                     description: 主任务标题
 *                   description:
 *                     type: string
 *                     description: 主任务描述
 *                   type:
 *                     type: string
 *                     description: 任务类型
 *                     enum: [NORMAL, WORK, PROJECT]
 *                   priority:
 *                     type: string
 *                     description: 任务优先级
 *                     enum: [LOW, MEDIUM, HIGH]
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                     description: 截止日期
 *               subTasks:
 *                 type: array
 *                 description: 子任务列表
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
 *                     estimatedHours:
 *                       type: number
 *                       description: 预计小时数
 *               createTree:
 *                 type: boolean
 *                 description: 是否创建任务树
 *                 default: false
 *               treeType:
 *                 type: string
 *                 description: 树的类型
 *                 default: 'DEFAULT'
 *     responses:
 *       201:
 *         description: 批量创建任务成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/batch', taskBreakdownController.batchCreateTasks);

/**
 * @swagger
 * /api/tasks/analyze-decompose-create:
 *   post:
 *     summary: 分析、拆解任务并批量创建
 *     description: 一站式服务，分析任务复杂度，拆解成子任务，并批量创建任务和子任务
 *     tags: [Tasks]
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
 *                 description: 任务ID（可选）
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               type:
 *                 type: string
 *                 description: 任务类型
 *                 enum: [NORMAL, WORK, PROJECT]
 *               priority:
 *                 type: string
 *                 description: 任务优先级
 *                 enum: [LOW, MEDIUM, HIGH]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *               createTree:
 *                 type: boolean
 *                 description: 是否创建任务树
 *                 default: false
 *               treeType:
 *                 type: string
 *                 description: 树的类型
 *                 default: 'DEFAULT'
 *     responses:
 *       201:
 *         description: 任务分析、拆解和创建成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/analyze-decompose-create', taskBreakdownController.analyzeDecomposeAndCreate);

export default router; 