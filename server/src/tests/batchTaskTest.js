import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import batchTaskCreationService from '../services/batchTaskCreationService.js';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// API地址，根据环境变量配置
const PORT = 9000; // 开发服务器使用9000端口
const API_URL = `http://localhost:${PORT}/api`;

console.log(`测试API地址: ${API_URL}`);

/**
 * 批量任务创建服务测试
 */

/**
 * 测试批量任务创建
 */
const testBatchTaskCreation = async () => {
  logger.info('开始测试批量任务创建...');
  
  try {
    // 模拟任务数据
    const tasks = [
      {
        title: '网站开发项目',
        description: '开发一个企业网站，包含首页、关于我们、产品展示、新闻中心和联系我们等页面',
        priority: '高',
        status: '未开始',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后
      },
      {
        title: '移动应用开发',
        description: '开发一个Android和iOS应用，包含用户登录、个人中心、消息通知等功能',
        priority: '中',
        status: '未开始',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60天后
      }
    ];
    
    // 调用批量创建服务
    const result = await batchTaskCreationService.createBatchTasks(tasks);
    
    // 输出结果
    logger.info(`批量创建任务成功，共创建${result.tasks.length}个任务`);
    result.tasks.forEach((task, index) => {
      logger.info(`任务${index + 1}: ID=${task.id}, 标题=${task.title}`);
    });
    
  } catch (error) {
    logger.error(`批量创建任务测试失败: ${error.message}`);
  }
};

/**
 * 测试批量任务和任务树创建
 */
const testBatchTaskWithTreesCreation = async () => {
  logger.info('开始测试批量任务和任务树创建...');
  
  try {
    // 模拟任务数据
    const tasks = [
      {
        title: '电子商务平台开发',
        description: '开发一个完整的电子商务平台，包含用户系统、商品管理、购物车、订单和支付系统',
        priority: '高',
        complexity: '高',
        status: '未开始',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90天后
        subTasks: [
          {
            title: '用户认证系统',
            description: '实现用户注册、登录、密码找回等功能',
            estimatedHours: 40,
            priority: '高'
          },
          {
            title: '商品管理系统',
            description: '实现商品的分类、上架、下架、库存管理等功能',
            estimatedHours: 60,
            priority: '高'
          },
          {
            title: '购物车功能',
            description: '实现添加商品到购物车、修改数量、删除商品等功能',
            estimatedHours: 30,
            priority: '中'
          },
          {
            title: '订单管理系统',
            description: '实现订单创建、状态跟踪、历史查询等功能',
            estimatedHours: 50,
            priority: '高'
          },
          {
            title: '支付系统集成',
            description: '集成第三方支付接口，实现在线支付功能',
            estimatedHours: 35,
            priority: '中'
          }
        ]
      }
    ];
    
    // 调用批量创建服务
    const result = await batchTaskCreationService.createBatchTasksWithTrees(tasks);
    
    // 输出结果
    logger.info(`批量创建任务和任务树成功，共创建${result.tasks.length}个主任务和${result.trees.length}个任务树`);
    
    // 输出主任务信息
    result.tasks.forEach((taskGroup, index) => {
      logger.info(`主任务${index + 1}: ID=${taskGroup.mainTask.id}, 标题=${taskGroup.mainTask.title}`);
      
      // 输出子任务信息
      logger.info(`子任务数量: ${taskGroup.subTasks.length}`);
      taskGroup.subTasks.forEach((subTask, subIndex) => {
        logger.info(`  子任务${subIndex + 1}: ID=${subTask.id}, 标题=${subTask.title}`);
      });
    });
    
    // 输出任务树信息
    result.trees.forEach((tree, index) => {
      logger.info(`任务树${index + 1}: ID=${tree.id}, 名称=${tree.name}, 类型=${tree.type}`);
    });
    
  } catch (error) {
    logger.error(`批量创建任务和任务树测试失败: ${error.message}`);
  }
};

/**
 * 运行测试
 */
const runTests = async () => {
  try {
    // 测试批量任务创建
    await testBatchTaskCreation();
    
    console.log('\n---------------------------------------\n');
    
    // 测试批量任务和任务树创建
    await testBatchTaskWithTreesCreation();
    
  } catch (error) {
    logger.error(`测试执行失败: ${error.message}`);
  }
};

// 执行测试
runTests().then(() => {
  logger.info('批量任务创建服务测试完成');
}); 