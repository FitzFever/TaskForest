import { TaskAnalysisService } from '../services/taskAnalysisService';
import { TaskBreakdownService } from '../services/taskBreakdownService';
import { BatchTaskCreationService } from '../services/batchTaskCreationService';
// 创建服务实例
const taskAnalysisService = new TaskAnalysisService();
const taskBreakdownService = new TaskBreakdownService();
const batchTaskCreationService = new BatchTaskCreationService();
/**
 * AI功能控制器，处理任务分析和拆解请求
 */
export class AIController {
    /**
     * 分析任务，提供复杂度和时间预估
     */
    async analyzeTask(req, res) {
        try {
            const taskInfo = req.body;
            if (!this.validateTaskInfo(taskInfo)) {
                res.status(400).json({
                    success: false,
                    message: '任务信息不完整，请提供标题和描述'
                });
                return;
            }
            const analysis = await taskAnalysisService.analyzeTask(taskInfo);
            res.status(200).json({
                success: true,
                data: analysis
            });
        }
        catch (error) {
            console.error('任务分析失败:', error);
            res.status(500).json({
                success: false,
                message: '任务分析失败',
                error: error.message
            });
        }
    }
    /**
     * 拆解任务，生成子任务列表
     */
    async breakdownTask(req, res) {
        try {
            const taskInfo = req.body;
            if (!this.validateTaskInfo(taskInfo)) {
                res.status(400).json({
                    success: false,
                    message: '任务信息不完整，请提供标题和描述'
                });
                return;
            }
            const breakdown = await taskBreakdownService.breakdownTask(taskInfo);
            res.status(200).json({
                success: true,
                data: breakdown
            });
        }
        catch (error) {
            console.error('任务拆解失败:', error);
            res.status(500).json({
                success: false,
                message: '任务拆解失败',
                error: error.message
            });
        }
    }
    /**
     * 分析并拆解任务，返回完整结果
     */
    async analyzeAndBreakdownTask(req, res) {
        try {
            const taskInfo = req.body;
            if (!this.validateTaskInfo(taskInfo)) {
                res.status(400).json({
                    success: false,
                    message: '任务信息不完整，请提供标题和描述'
                });
                return;
            }
            // 1. 先分析任务
            const analysis = await taskAnalysisService.analyzeTask(taskInfo);
            // 2. 再拆解任务
            const breakdown = await taskBreakdownService.breakdownTask({
                ...taskInfo,
                complexity: analysis.complexity,
                estimatedHours: analysis.estimatedHours
            });
            res.status(200).json({
                success: true,
                data: {
                    analysis,
                    breakdown
                }
            });
        }
        catch (error) {
            console.error('任务分析和拆解失败:', error);
            res.status(500).json({
                success: false,
                message: '任务分析和拆解失败',
                error: error.message
            });
        }
    }
    /**
     * 拆解并创建任务，自动创建主任务和子任务
     */
    async breakdownAndCreateTasks(req, res) {
        try {
            const { taskInfo, createTrees = true } = req.body;
            if (!this.validateTaskInfo(taskInfo)) {
                res.status(400).json({
                    success: false,
                    message: '任务信息不完整，请提供标题和描述'
                });
                return;
            }
            // 1. 拆解任务
            const breakdown = await taskBreakdownService.breakdownTask(taskInfo);
            // 2. 批量创建任务
            const creationResult = await batchTaskCreationService.createBatchTasks(breakdown, createTrees);
            res.status(201).json({
                success: true,
                message: '任务已成功拆解并创建',
                data: {
                    breakdown,
                    tasks: creationResult
                }
            });
        }
        catch (error) {
            console.error('任务拆解和创建失败:', error);
            res.status(500).json({
                success: false,
                message: '任务拆解和创建失败',
                error: error.message
            });
        }
    }
    /**
     * 验证任务信息是否完整
     */
    validateTaskInfo(taskInfo) {
        return !!(taskInfo && taskInfo.title && taskInfo.description);
    }
}
// 导出控制器实例
export const aiController = new AIController();
//# sourceMappingURL=aiController.js.map