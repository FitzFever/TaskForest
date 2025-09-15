import axios from 'axios';
import dotenv from 'dotenv';
// 加载环境变量
dotenv.config();
// 测试配置
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TASK = {
    taskId: 'test-task-001',
    title: '开发用户登录功能',
    description: '实现完整的用户登录流程，包括表单验证、API对接、状态管理和错误处理。登录成功后需要存储JWT令牌并重定向到用户仪表盘。'
};
// 测试任务分析API
async function testTaskAnalysis() {
    console.log('\n----- 测试任务分析API -----');
    console.log('请求数据:', JSON.stringify(TEST_TASK, null, 2));
    try {
        console.log(`发送请求到: ${API_URL}/api/tasks/analyze`);
        const response = await axios.post(`${API_URL}/api/tasks/analyze`, TEST_TASK, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('API响应状态:', response.status);
        console.log('API响应数据:', JSON.stringify(response.data, null, 2));
        if (response.status === 200 && response.data && response.data.complexity) {
            console.log('✅ 任务分析API测试成功');
            return response.data;
        }
        else {
            console.log('❌ 任务分析API测试失败: 响应格式不正确');
            return null;
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('❌ 任务分析API测试失败:', error.message);
            console.error('状态码:', error.response?.status);
            console.error('响应数据:', error.response?.data);
        }
        else {
            console.error('❌ 任务分析API测试失败:', error.message);
        }
        return null;
    }
}
// 测试任务拆解API
async function testTaskDecomposition(analysisResult) {
    console.log('\n----- 测试任务拆解API -----');
    if (!analysisResult || !analysisResult.complexity) {
        console.log('⚠️ 跳过任务拆解测试: 缺少任务分析结果');
        return;
    }
    const decompositionRequest = {
        ...TEST_TASK,
        complexity: analysisResult.complexity,
        estimatedHours: 8 // 假设的预估时间
    };
    console.log('请求数据:', JSON.stringify(decompositionRequest, null, 2));
    try {
        console.log(`发送请求到: ${API_URL}/api/tasks/decompose`);
        const response = await axios.post(`${API_URL}/api/tasks/decompose`, decompositionRequest, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('API响应状态:', response.status);
        console.log('API响应数据:', JSON.stringify(response.data, null, 2));
        if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
            console.log('✅ 任务拆解API测试成功');
            console.log(`拆解出 ${response.data.length} 个子任务`);
        }
        else {
            console.log('❌ 任务拆解API测试失败: 响应格式不正确');
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('❌ 任务拆解API测试失败:', error.message);
            console.error('状态码:', error.response?.status);
            console.error('响应数据:', error.response?.data);
        }
        else {
            console.error('❌ 任务拆解API测试失败:', error.message);
        }
    }
}
// 运行测试
async function runTests() {
    console.log('======= DeepSeek API集成测试 =======');
    // 测试环境变量
    console.log('\n----- 检查环境变量 -----');
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        console.log('⚠️ 警告: 未找到DEEPSEEK_API_KEY环境变量');
    }
    else {
        console.log('✅ DEEPSEEK_API_KEY已配置');
    }
    // 运行API测试
    const analysisResult = await testTaskAnalysis();
    await testTaskDecomposition(analysisResult);
    console.log('\n======= 测试完成 =======');
}
// 执行测试
if (require.main === module) {
    runTests().catch(error => {
        console.error('测试运行错误:', error);
        process.exit(1);
    });
}
export { runTests };
//# sourceMappingURL=deepseekTest.js.map