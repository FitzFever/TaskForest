import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// 加载环境变量
dotenv.config();

// API基础URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

/**
 * 测试批量创建任务API
 */
async function testBatchTaskCreation() {
  console.log('\n开始测试批量任务创建API...');
  
  const taskData = {
    mainTask: {
      title: `测试主任务 ${uuidv4().substring(0, 8)}`,
      description: '这是一个用于测试批量创建功能的主任务。需要完成多个子任务才能完成该主任务。',
      complexity: 'MEDIUM'
    },
    subTasks: [
      {
        title: '子任务1 - 需求分析',
        description: '分析并记录系统需求，确定功能范围和优先级',
        estimatedHours: 4
      },
      {
        title: '子任务2 - 设计架构',
        description: '设计系统架构，包括组件划分和接口定义',
        estimatedHours: 6
      },
      {
        title: '子任务3 - 开发功能',
        description: '实现核心功能模块和业务逻辑',
        estimatedHours: 10
      },
      {
        title: '子任务4 - 测试验证',
        description: '编写并执行测试用例，验证功能正确性',
        estimatedHours: 5
      }
    ]
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/batch/tasks`, taskData);
    
    console.log('批量任务创建成功：');
    console.log(`状态码: ${response.status}`);
    console.log(`主任务ID: ${response.data.data.mainTask.id}`);
    console.log(`主任务标题: ${response.data.data.mainTask.title}`);
    console.log(`创建的子任务数量: ${response.data.data.subTasks.length}`);
    
    console.log('\n子任务列表:');
    response.data.data.subTasks.forEach((subTask, index) => {
      console.log(`  ${index + 1}. ${subTask.title} (ID: ${subTask.id})`);
    });
    
    return response.data;
  } catch (error) {
    console.error('批量任务创建失败:');
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
      console.error('错误详情:', error.response.data);
    } else {
      console.error('错误详情:', error.message);
    }
    return null;
  }
}

/**
 * 测试批量创建任务和任务树API
 */
async function testBatchTaskWithTreeCreation() {
  console.log('\n开始测试批量任务和任务树创建API...');
  
  const taskData = {
    mainTask: {
      title: `测试树任务 ${uuidv4().substring(0, 8)}`,
      description: '这是一个用于测试批量创建任务树功能的主任务。将生成关联的任务树。',
      complexity: 'HIGH'
    },
    subTasks: [
      {
        title: '子任务1 - 项目启动',
        description: '组织项目启动会议，确定项目目标和时间线',
        estimatedHours: 2
      },
      {
        title: '子任务2 - 技术选型',
        description: '评估并选择适合项目的技术栈和工具',
        estimatedHours: 4
      },
      {
        title: '子任务3 - 数据库设计',
        description: '设计数据库结构，包括表关系和索引',
        estimatedHours: 8
      },
      {
        title: '子任务4 - 前端开发',
        description: '实现用户界面和交互逻辑',
        estimatedHours: 12
      },
      {
        title: '子任务5 - 后端开发',
        description: '实现API和业务逻辑',
        estimatedHours: 14
      },
      {
        title: '子任务6 - 测试部署',
        description: '执行测试并部署到生产环境',
        estimatedHours: 8
      }
    ],
    tree: {
      name: `项目树 ${uuidv4().substring(0, 8)}`,
      type: 'OAK'
    }
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/batch/tasks/tree`, taskData);
    
    console.log('批量任务和任务树创建成功：');
    console.log(`状态码: ${response.status}`);
    console.log(`主任务ID: ${response.data.data.mainTask.id}`);
    console.log(`主任务标题: ${response.data.data.mainTask.title}`);
    console.log(`创建的子任务数量: ${response.data.data.subTasks.length}`);
    console.log(`任务树ID: ${response.data.data.tree.id}`);
    console.log(`任务树名称: ${response.data.data.tree.name}`);
    console.log(`任务树类型: ${response.data.data.tree.type}`);
    
    console.log('\n子任务列表:');
    response.data.data.subTasks.forEach((subTask, index) => {
      console.log(`  ${index + 1}. ${subTask.title} (ID: ${subTask.id})`);
    });
    
    return response.data;
  } catch (error) {
    console.error('批量任务和任务树创建失败:');
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
      console.error('错误详情:', error.response.data);
    } else {
      console.error('错误详情:', error.message);
    }
    return null;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('======== 批量任务API测试开始 ========');
  
  // 测试批量创建任务
  const batchTaskResult = await testBatchTaskCreation();
  
  // 测试批量创建任务和任务树
  const batchTaskTreeResult = await testBatchTaskWithTreeCreation();
  
  console.log('\n======== 批量任务API测试完成 ========');
  
  if (batchTaskResult && batchTaskTreeResult) {
    console.log('所有测试成功完成！');
  } else {
    console.log('部分测试失败，请检查错误日志。');
  }
}

// 执行测试
runAllTests(); 