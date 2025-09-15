import { deepseekService } from './aiService';
import { promptTemplateService } from './promptTemplateService';
import { responseParserService } from './responseParserService';
/**
 * 任务分析服务，整合AI调用与结果处理
 */
export class TaskAnalysisService {
    /**
     * 分析任务，获取复杂度、预估时间和关键点
     */
    async analyzeTask(taskInfo) {
        console.log('开始分析任务:', taskInfo.description);
        // 1. 准备提示模板
        const prompt = promptTemplateService.generateAnalysisPrompt(taskInfo);
        // 2. 调用AI服务
        const response = await deepseekService.generateCompletion(prompt, {
            temperature: 0.3,
            json_output: true
        });
        // 3. 解析AI响应
        const analysis = responseParserService.parseAnalysisResponse(response);
        // 4. 验证和格式化
        return this.validateAndEnhanceAnalysis(analysis, taskInfo);
    }
    /**
     * 验证和增强分析结果
     */
    validateAndEnhanceAnalysis(analysis, taskInfo) {
        // 验证复杂度
        const validComplexities = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
        if (!validComplexities.includes(analysis.complexity)) {
            analysis.complexity = 'MEDIUM';
        }
        // 验证预估小时数
        if (isNaN(analysis.estimatedHours) || analysis.estimatedHours <= 0) {
            analysis.estimatedHours = 4; // 默认4小时
        }
        // 如果没有提供截止日期，使用AI建议的截止日期
        if (!taskInfo.dueDate && analysis.suggestedDeadline) {
            try {
                // 验证日期格式
                const date = new Date(analysis.suggestedDeadline);
                if (isNaN(date.getTime())) {
                    throw new Error('无效的日期格式');
                }
                analysis.suggestedDeadline = date.toISOString();
            }
            catch (error) {
                // 如果日期无效，创建一个7天后的日期
                const date = new Date();
                date.setDate(date.getDate() + 7);
                analysis.suggestedDeadline = date.toISOString();
            }
        }
        // 确保标签都是字符串类型
        analysis.recommendedTags = analysis.recommendedTags.map(tag => String(tag));
        // 确保关键点都是字符串类型
        analysis.keyPoints = analysis.keyPoints.map(point => String(point));
        return analysis;
    }
}
// 导出单例实例
export const taskAnalysisService = new TaskAnalysisService();
//# sourceMappingURL=taskAnalysisService.js.map