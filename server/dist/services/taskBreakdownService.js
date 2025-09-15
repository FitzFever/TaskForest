import { deepseekService } from './aiService';
import { promptTemplateService } from './promptTemplateService';
import { responseParserService } from './responseParserService';
/**
 * 任务拆解服务，整合AI调用与结果处理
 */
export class TaskBreakdownService {
    /**
     * 拆解任务为多个子任务
     */
    async breakdownTask(taskInfo) {
        console.log('开始拆解任务:', taskInfo.description);
        // 1. 准备提示模板
        const prompt = promptTemplateService.generateBreakdownPrompt(taskInfo);
        // 2. 调用AI服务
        const response = await deepseekService.generateCompletion(prompt, {
            temperature: 0.4,
            json_output: true,
            max_tokens: 4000
        });
        // 3. 解析AI响应
        const breakdown = responseParserService.parseBreakdownResponse(response);
        // 4. 验证和优化拆解结果
        return this.validateAndOptimizeBreakdown(breakdown, taskInfo);
    }
    /**
     * 验证和优化拆解结果
     */
    validateAndOptimizeBreakdown(breakdown, taskInfo) {
        // 确保主任务包含原始任务信息
        breakdown.mainTask = {
            ...breakdown.mainTask,
            description: taskInfo.description,
            type: taskInfo.type || breakdown.mainTask.type,
            priority: taskInfo.priority || breakdown.mainTask.priority,
            dueDate: taskInfo.dueDate || breakdown.mainTask.dueDate
        };
        // 验证主任务字段
        if (!breakdown.mainTask.title) {
            breakdown.mainTask.title = taskInfo.title || '任务计划';
        }
        if (!breakdown.mainTask.type || !['NORMAL', 'WORK', 'LEARNING', 'PROJECT', 'LEISURE'].includes(breakdown.mainTask.type)) {
            breakdown.mainTask.type = 'PROJECT';
        }
        if (!breakdown.mainTask.priority || breakdown.mainTask.priority < 1 || breakdown.mainTask.priority > 4) {
            breakdown.mainTask.priority = 1;
        }
        if (!breakdown.mainTask.dueDate) {
            // 创建一个14天后的日期
            const date = new Date();
            date.setDate(date.getDate() + 14);
            breakdown.mainTask.dueDate = date.toISOString();
        }
        // 确保主任务标签是数组
        if (!Array.isArray(breakdown.mainTask.tags)) {
            breakdown.mainTask.tags = [];
        }
        // 开始时间和主任务截止时间
        const now = new Date();
        const mainDueDate = new Date(breakdown.mainTask.dueDate);
        // 如果主截止日期无效，设置为14天后
        if (isNaN(mainDueDate.getTime())) {
            mainDueDate.setTime(now.getTime() + 14 * 24 * 60 * 60 * 1000);
            breakdown.mainTask.dueDate = mainDueDate.toISOString();
        }
        // 验证并优化所有子任务
        breakdown.subTasks = breakdown.subTasks.map((subTask, index) => {
            // 确保子任务标题非空
            if (!subTask.title) {
                subTask.title = `子任务 ${index + 1}`;
            }
            // 确保子任务描述非空
            if (!subTask.description) {
                subTask.description = `${subTask.title}的详细内容`;
            }
            // 验证子任务类型
            if (!subTask.type || !['NORMAL', 'WORK', 'LEARNING', 'PROJECT', 'LEISURE'].includes(subTask.type)) {
                subTask.type = 'NORMAL';
            }
            // 验证子任务优先级
            if (!subTask.priority || subTask.priority < 1 || subTask.priority > 4) {
                subTask.priority = index === 0 ? 1 : 2; // 第一个子任务默认优先级较高
            }
            // 验证子任务时间估算
            if (!subTask.estimatedHours || isNaN(subTask.estimatedHours) || subTask.estimatedHours <= 0) {
                subTask.estimatedHours = 2; // 默认2小时
            }
            // 验证并设置子任务截止日期
            let subTaskDueDate = new Date(subTask.dueDate);
            // 如果子任务截止日期无效，或晚于主任务截止日期
            if (isNaN(subTaskDueDate.getTime()) || subTaskDueDate > mainDueDate) {
                // 计算均匀分布的截止日期
                const totalDays = Math.floor((mainDueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                const daysPerTask = Math.max(1, Math.floor(totalDays / (breakdown.subTasks.length + 1)));
                // 为每个子任务分配截止日期
                const targetDate = new Date(now);
                targetDate.setDate(now.getDate() + (index + 1) * daysPerTask);
                // 确保不晚于主任务截止日期
                if (targetDate > mainDueDate) {
                    targetDate.setTime(mainDueDate.getTime() - 24 * 60 * 60 * 1000); // 比主任务早1天
                }
                subTask.dueDate = targetDate.toISOString();
            }
            else {
                subTask.dueDate = subTaskDueDate.toISOString();
            }
            // 确保标签是数组
            if (!Array.isArray(subTask.suggestedTags)) {
                subTask.suggestedTags = [];
            }
            return subTask;
        });
        return breakdown;
    }
}
// 导出单例实例
export const taskBreakdownService = new TaskBreakdownService();
//# sourceMappingURL=taskBreakdownService.js.map