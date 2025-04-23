import axios from 'axios';

// 测试配置
const API_URL = process.env.API_URL || 'http://localhost:9000';
const TEST_TASK = {
  taskId: 'test-001',
  title: '实现用户登录功能',
  description: '开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。登录成功后需要存储JWT令牌并重定向到用户仪表盘。'
};

// 测试任务分析API
async function testAnalyzeAPI() {
  console.log('\n----- 测试任务分析API -----');
  console.log('请求数据:', JSON.stringify(TEST_TASK, null, 2));
  
  try {
    console.log(`发送请求到: ${API_URL}/api/analyze`);
    const response = await axios.post(`${API_URL}/api/analyze`, TEST_TASK, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data && response.data.success) {
      console.log('✅ 任务分析API测试成功');
      return response.data.data;
    } else {
      console.log('❌ 任务分析API测试失败: 响应格式不正确');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 任务分析API测试失败:', error.message);
      console.error('状态码:', error.response?.status);
      console.error('响应数据:', error.response?.data);
    } else {
      console.error('❌ 任务分析API测试失败:', error.message);
    }
    return null;
  }
}

// 测试任务拆解API
async function testDecomposeAPI(task) {
  console.log('\n----- 测试任务拆解API -----');
  console.log('请求数据:', JSON.stringify(task || TEST_TASK, null, 2));
  
  try {
    console.log(`发送请求到: ${API_URL}/api/decompose`);
    const response = await axios.post(`${API_URL}/api/decompose`, task || TEST_TASK, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data && response.data.success) {
      console.log('✅ 任务拆解API测试成功');
      console.log(`子任务数量: ${response.data.data.length}`);
      return response.data.data;
    } else {
      console.log('❌ 任务拆解API测试失败: 响应格式不正确');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 任务拆解API测试失败:', error.message);
      console.error('状态码:', error.response?.status);
      console.error('响应数据:', error.response?.data);
    } else {
      console.error('❌ 任务拆解API测试失败:', error.message);
    }
    return null;
  }
}

// 测试一次性分析并拆解API
async function testAnalyzeAndDecomposeAPI() {
  console.log('\n----- 测试一次性分析并拆解API -----');
  console.log('请求数据:', JSON.stringify(TEST_TASK, null, 2));
  
  try {
    console.log(`发送请求到: ${API_URL}/api/analyze-and-decompose`);
    const response = await axios.post(`${API_URL}/api/analyze-and-decompose`, TEST_TASK, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data && response.data.success) {
      console.log('✅ 一次性分析并拆解API测试成功');
      return response.data.data;
    } else {
      console.log('❌ 一次性分析并拆解API测试失败: 响应格式不正确');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 一次性分析并拆解API测试失败:', error.message);
      console.error('状态码:', error.response?.status);
      console.error('响应数据:', error.response?.data);
    } else {
      console.error('❌ 一次性分析并拆解API测试失败:', error.message);
    }
    return null;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('======= 开始API测试 =======');
  
  // 测试分析API
  const analysisResult = await testAnalyzeAPI();
  
  // 测试拆解API
  let taskWithComplexity = null;
  if (analysisResult) {
    taskWithComplexity = {
      ...TEST_TASK,
      complexity: analysisResult.complexity
    };
  }
  await testDecomposeAPI(taskWithComplexity);
  
  // 测试一次性分析并拆解API
  await testAnalyzeAndDecomposeAPI();
  
  console.log('\n======= API测试完成 =======');
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试运行错误:', error);
  process.exit(1);
}); 