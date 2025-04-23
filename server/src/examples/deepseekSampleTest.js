import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const API_KEY = process.env.DEEPSEEK_API_KEY; 
const API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// 直接测试DeepSeek API
async function testDeepSeekDirectly() {
  try {
    console.log('正在测试直接调用DeepSeek API...');
    console.log(`API URL: ${API_URL}`);
    console.log(`API KEY: ${API_KEY ? '已配置' : '未配置'}`);
    console.log(`MODEL: ${MODEL}`);
    
    if (!API_KEY) {
      throw new Error('未配置DeepSeek API密钥');
    }
    
    const response = await axios.post(
      `${API_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: '你是一个专业的任务管理助手，擅长分析和拆解任务。' },
          { role: 'user', content: '分析这个任务的复杂度：实现用户登录功能，返回"SIMPLE"、"MEDIUM"或"COMPLEX"' }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('DeepSeek API请求失败:', error.message);
      console.error('状态码:', error.response?.status);
      console.error('响应数据:', error.response?.data);
    } else {
      console.error('DeepSeek API请求失败:', error.message);
    }
    return null;
  }
}

// 运行测试
async function runTest() {
  console.log('======= DeepSeek API测试 =======');
  
  const result = await testDeepSeekDirectly();
  
  if (result) {
    console.log('✅ DeepSeek API测试成功!');
    
    // 解析返回的内容
    const content = result.choices?.[0]?.message?.content;
    if (content) {
      console.log('\n===== 分析结果 =====');
      console.log(content);
    }
  } else {
    console.log('❌ DeepSeek API测试失败!');
  }
  
  console.log('\n======= 测试完成 =======');
}

// 执行测试
runTest().catch(error => {
  console.error('测试运行错误:', error);
  process.exit(1);
}); 