import { DeepSeekService } from '../services/deepseekService.js';
import logger from '../utils/logger.js';
/**
 * DeepSeek服务使用示例
 */
async function runDeepSeekExample() {
    try {
        // 创建DeepSeek服务实例
        const deepseekService = new DeepSeekService();
        console.log('开始DeepSeek服务示例...');
        // 示例1: 分析任务复杂度
        const analysisRequest = {
            taskId: 'task-123',
            title: '实现用户登录功能',
            description: '开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。'
        };
        console.log('\n1. 分析任务复杂度:');
        console.log('请求:', JSON.stringify(analysisRequest, null, 2));
        try {
            const analysisResult = await deepseekService.analyzeTaskComplexity(analysisRequest);
            console.log('结果:', JSON.stringify(analysisResult, null, 2));
            // 示例2: 拆解任务
            if (analysisResult.complexity) {
                const decompositionRequest = {
                    taskId: analysisRequest.taskId,
                    title: analysisRequest.title,
                    description: analysisRequest.description,
                    complexity: analysisResult.complexity
                };
                console.log('\n2. 拆解任务:');
                console.log('请求:', JSON.stringify(decompositionRequest, null, 2));
                try {
                    const subTasks = await deepseekService.decomposeTask(decompositionRequest);
                    console.log('子任务列表:', JSON.stringify(subTasks, null, 2));
                }
                catch (error) {
                    console.error('任务拆解失败:', error.message);
                }
            }
        }
        catch (error) {
            console.error('任务分析失败:', error.message);
        }
        // 示例3: 分析复杂任务
        const complexTaskRequest = {
            taskId: 'task-456',
            title: '开发完整的电子商务平台',
            description: '设计并实现一个全功能电子商务平台，包括产品目录、购物车、结账流程、支付集成、用户账户管理、订单处理和库存管理。'
        };
        console.log('\n3. 分析复杂任务:');
        console.log('请求:', JSON.stringify(complexTaskRequest, null, 2));
        try {
            const complexResult = await deepseekService.analyzeTaskComplexity(complexTaskRequest);
            console.log('结果:', JSON.stringify(complexResult, null, 2));
            // 拆解复杂任务
            if (complexResult.complexity) {
                const complexDecompositionRequest = {
                    taskId: complexTaskRequest.taskId,
                    title: complexTaskRequest.title,
                    description: complexTaskRequest.description,
                    complexity: complexResult.complexity
                };
                console.log('\n4. 拆解复杂任务:');
                console.log('请求:', JSON.stringify(complexDecompositionRequest, null, 2));
                try {
                    const complexSubTasks = await deepseekService.decomposeTask(complexDecompositionRequest);
                    console.log('子任务列表:', JSON.stringify(complexSubTasks, null, 2));
                }
                catch (error) {
                    console.error('复杂任务拆解失败:', error.message);
                }
            }
        }
        catch (error) {
            console.error('复杂任务分析失败:', error.message);
        }
        console.log('\nDeepSeek服务示例完成');
    }
    catch (error) {
        logger.error('DeepSeek示例运行失败', { error });
        console.error('示例运行失败:', error.message);
    }
}
// 如果直接运行此文件，则执行示例
if (require.main === module) {
    runDeepSeekExample().catch(error => {
        console.error('运行示例时出错:', error);
        process.exit(1);
    });
}
export { runDeepSeekExample };
//# sourceMappingURL=deepseekExample.js.map