import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const API_KEY = process.env.DEEPSEEK_API_KEY; 
const API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// 测试任务拆解功能
async function testTaskDecomposition() {
  try {
    console.log('正在测试任务拆解功能...');
    console.log(`API URL: ${API_URL}`);
    console.log(`API KEY: ${API_KEY ? '已配置' : '未配置'}`);
    console.log(`MODEL: ${MODEL}`);
    
    if (!API_KEY) {
      throw new Error('未配置DeepSeek API密钥');
    }
    
    const testTask = {
      title: "实现用户登录功能",
      description: "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。登录成功后需要存储JWT令牌并重定向到用户仪表盘。",
      complexity: "MEDIUM"
    };
    
    console.log('测试任务:', JSON.stringify(testTask, null, 2));
    
    const prompt = `
拆解以下任务为多个子任务:

任务标题: ${testTask.title}
任务描述: ${testTask.description}
任务复杂度: ${testTask.complexity}

请根据任务的复杂度，将任务拆解为合适数量的子任务。对于简单任务，拆解为2-3个子任务；中等任务，拆解为4-6个子任务；复杂任务，拆解为7-10个子任务。

返回JSON格式的子任务列表:
[
  {
    "title": "子任务标题",
    "description": "子任务的详细描述",
    "estimatedHours": 预计完成小时数(数字)
  },
  ...
]
    `;
    
    const response = await axios.post(
      `${API_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: '你是一个专业的任务管理助手，擅长分析和拆解任务。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
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
    
    // 提取内容
    const content = response.data.choices?.[0]?.message?.content;
    if (content) {
      console.log('\n===== 拆解结果 =====');
      console.log(content);
      
      // 尝试解析JSON
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const subTasks = JSON.parse(jsonMatch[0]);
          console.log('\n===== 解析后的子任务 =====');
          console.log(`共拆解为 ${subTasks.length} 个子任务：`);
          
          subTasks.forEach((task, index) => {
            console.log(`\n${index + 1}. ${task.title} (预计 ${task.estimatedHours} 小时)`);
            console.log(`   描述: ${task.description}`);
          });
          
          return subTasks;
        }
      } catch (error) {
        console.error('解析JSON失败:', error.message);
      }
    }
    
    return null;
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
  console.log('======= DeepSeek 任务拆解测试 =======\n');
  
  const result = await testTaskDecomposition();
  
  if (result) {
    console.log('\n✅ 任务拆解测试成功!');
  } else {
    console.log('\n❌ 任务拆解测试失败!');
  }
  
  console.log('\n======= 测试完成 =======');
}

// 执行测试
runTest().catch(error => {
  console.error('测试运行错误:', error);
  process.exit(1);
}); 