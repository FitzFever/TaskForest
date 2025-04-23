import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

// API基础URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

/**
 * 测试批量任务创建API
 */
async function testBatchTaskCreationAPI() {
  logger.info('开始测试批量任务创建API');
  
  try {
    // 准备测试数据
    const testData = {
      mainTask: {
        id: uuidv4(),
        title: 'API测试：开发移动应用',
        description: '设计并开发一个适用于iOS和Android的移动应用',
        priority: 'HIGH',
        estimatedHours: 120,
        status: 'NOT_STARTED',
        tags: ['mobile', 'development', 'app']
      },
      subTasks: [
        {
          title: '需求分析和规格说明',
          description: '与客户沟通，分析需求并创建规格文档',
          priority: 'HIGH',
          estimatedHours: 16,
          status: 'NOT_STARTED',
          tags: ['documentation', 'analysis']
        },
        {
          title: 'UI/UX设计',
          description: '设计用户界面和用户体验',
          priority: 'HIGH',
          estimatedHours: 24,
          status: 'NOT_STARTED',
          tags: ['design', 'ui']
        },
        {
          title: 'iOS开发',
          description: '使用Swift开发iOS版本',
          priority: 'MEDIUM',
          estimatedHours: 40,
          status: 'NOT_STARTED',
          tags: ['ios', 'swift']
        },
        {
          title: 'Android开发',
          description: '使用Kotlin开发Android版本',
          priority: 'MEDIUM',
          estimatedHours: 40,
          status: 'NOT_STARTED',
          tags: ['android', 'kotlin']
        },
        {
          title: '测试和QA',
          description: '执行单元测试、集成测试和用户验收测试',
          priority: 'HIGH',
          estimatedHours: 24,
          status: 'NOT_STARTED',
          tags: ['testing', 'qa']
        }
      ]
    };
    
    // 测试1: 创建任务（不带树）
    logger.info('测试1: 批量创建任务（不带树）');
    try {
      const createTasksResponse = await axios.post(`${API_BASE_URL}/api/batch-tasks`, testData);
      
      if (createTasksResponse.status === 201 && createTasksResponse.data.success) {
        logger.info('批量创建任务成功');
        logger.info(`主任务ID: ${createTasksResponse.data.data.mainTask.id}`);
        logger.info(`子任务数量: ${createTasksResponse.data.data.subTasks.length}`);
        
        // 记录第一个子任务的详细信息作为示例
        const firstSubTask = createTasksResponse.data.data.subTasks[0];
        logger.info(`子任务示例: ${firstSubTask.title}, ID: ${firstSubTask.id}`);
      } else {
        logger.error('批量创建任务失败');
        logger.error(JSON.stringify(createTasksResponse.data, null, 2));
      }
    } catch (error) {
      logger.error('批量创建任务API调用失败:', error.response?.data || error.message);
    }
    
    // 测试2: 创建任务和任务树
    logger.info('\n测试2: 批量创建任务和任务树');
    try {
      const treeTestData = {
        ...testData,
        treeType: 'OAK'
      };
      
      const createTasksWithTreeResponse = await axios.post(`${API_BASE_URL}/api/batch-tasks/with-tree`, treeTestData);
      
      if (createTasksWithTreeResponse.status === 201 && createTasksWithTreeResponse.data.success) {
        logger.info('批量创建任务和任务树成功');
        logger.info(`主任务ID: ${createTasksWithTreeResponse.data.data.mainTask.id}`);
        logger.info(`子任务数量: ${createTasksWithTreeResponse.data.data.subTasks.length}`);
        logger.info(`任务树ID: ${createTasksWithTreeResponse.data.data.tree.id}`);
        logger.info(`任务树类型: ${createTasksWithTreeResponse.data.data.tree.type}`);
      } else {
        logger.error('批量创建任务和任务树失败');
        logger.error(JSON.stringify(createTasksWithTreeResponse.data, null, 2));
      }
    } catch (error) {
      logger.error('批量创建任务和任务树API调用失败:', error.response?.data || error.message);
    }
    
    logger.info('批量任务创建API测试完成');
  } catch (error) {
    logger.error('测试执行过程中出错:', error);
  }
}

// 执行测试
testBatchTaskCreationAPI()
  .then(() => {
    logger.info('测试脚本执行完成');
  })
  .catch(error => {
    logger.error('测试脚本执行失败:', error);
    process.exit(1);
  }); 