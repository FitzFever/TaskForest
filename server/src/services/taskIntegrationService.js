import { v4 as uuidv4 } from 'uuid';
import deepseekService from './deepseekService.js';
import taskService from './taskService.js';
import treeService from './treeService.js';
import logger from '../utils/logger.js';

/**
 * 任务集成服务
 * 整合DeepSeek API的任务分析和分解功能，并与TaskService集成
 */
class TaskIntegrationService {
  constructor() {
    // 存储已处理任务的集合
    this.processedTasks = [];
  }

  /**
   * 处理任务：分析、分解并存储
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>} 处理结果
   */
  async processTask(taskData) {
    logger.info('开始处理任务', { taskId: taskData.id });
    
    try {
      // 1. 分析任务复杂度
      const analysisResult = await this.analyzeTaskComplexity(taskData);
      if (!analysisResult.success) {
        return {
          success: false,
          message: '任务复杂度分析失败',
          error: analysisResult.error
        };
      }
      
      const complexity = analysisResult.data.complexity;
      logger.info('任务复杂度分析完成', { taskId: taskData.id, complexity });
      
      // 2. 拆解任务
      const decompositionResult = await this.decomposeTask({
        ...taskData,
        complexity
      });
      
      if (!decompositionResult.success) {
        return {
          success: false,
          message: '任务拆解失败',
          error: decompositionResult.error
        };
      }
      
      const subTasks = decompositionResult.data.subTasks;
      logger.info('任务拆解完成', { 
        taskId: taskData.id, 
        subTasksCount: subTasks.length 
      });
      
      // 3. 创建主任务
      const mainTaskResult = await this.createMainTask({
        ...taskData,
        complexity
      });
      
      if (!mainTaskResult.success) {
        return {
          success: false,
          message: '创建主任务失败',
          error: mainTaskResult.error
        };
      }
      
      // 4. 创建子任务
      const subTasksResult = await this.createSubTasks(subTasks, taskData.id);
      
      // 5. 创建树（如果需要）
      let treeResult = { success: true, data: null };
      if (taskData.createTree) {
        // 根据任务类型或者默认选择树的类型
        const treeType = taskData.treeType || this.determineTreeType(taskData);
        
        treeResult = await this.createTree({
          taskId: taskData.id,
          treeType: treeType,
          name: `${taskData.title}的树`,
          description: `为任务 "${taskData.title}" 创建的树`
        });
      }
      
      // 6. 返回完整结果
      return {
        success: true,
        message: '任务处理完成',
        data: {
          analysis: analysisResult.data,
          decomposition: decompositionResult.data,
          mainTask: mainTaskResult.data,
          subTasks: subTasksResult.data,
          tree: treeResult.data
        }
      };
    } catch (error) {
      logger.error('处理任务失败', { 
        taskId: taskData.id, 
        error: error.message 
      });
      
      return {
        success: false,
        message: '处理任务失败',
        error: error.message
      };
    }
  }
  
  /**
   * 获取所有已处理的任务
   * @returns {Promise<Array>} 已处理任务列表
   */
  async getProcessedTasks() {
    try {
      logger.info(`获取已处理任务，共 ${this.processedTasks.length} 个任务`);
      
      if (this.processedTasks.length === 0) {
        // 如果内存中没有任务，尝试从任务服务获取
        const mainTasks = await taskService.getMainTasks();
        
        const processedTasks = [];
        for (const mainTask of mainTasks) {
          const subTasks = await taskService.getSubTasks(mainTask.id);
          
          // 获取相关树木
          const mainTree = await treeService.getTreeByTaskId(mainTask.id);
          let subTrees = [];
          
          if (mainTree) {
            subTrees = await treeService.getSubTrees(mainTree.id);
          }
          
          processedTasks.push({
            mainTask,
            subTasks,
            trees: mainTree ? {
              mainTree,
              subTrees
            } : null,
            timestamp: mainTask.createdAt
          });
        }
        
        return processedTasks;
      }
      
      return this.processedTasks;
    } catch (error) {
      logger.error('获取已处理任务失败:', error);
      throw new Error(`获取已处理任务失败: ${error.message}`);
    }
  }
  
  /**
   * 分析任务复杂度
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeTaskComplexity(taskData) {
    logger.info('分析任务复杂度', { taskId: taskData.id });
    
    try {
      const result = await deepseekService.analyzeTaskComplexity({
        taskId: taskData.id,
        title: taskData.title,
        description: taskData.description || ''
      });
      
      return result;
    } catch (error) {
      logger.error('分析任务复杂度失败', { 
        taskId: taskData.id, 
        error: error.message 
      });
      
      return {
        success: false,
        error: `分析任务复杂度失败: ${error.message}`
      };
    }
  }
  
  /**
   * 分解任务
   * @param {Object} taskData - 任务数据（包含复杂度）
   * @returns {Promise<Object>} 分解结果
   */
  async decomposeTask(taskData) {
    try {
      const response = await deepseekService.decomposeTask({
        taskId: taskData.id || uuidv4(),
        title: taskData.title,
        description: taskData.description,
        complexity: taskData.complexity
      });
      
      if (!response.success) {
        throw new Error(response.error || '任务分解失败');
      }
      
      return response;
    } catch (error) {
      logger.error('分解任务失败:', error);
      throw new Error(`任务分解失败: ${error.message}`);
    }
  }
  
  /**
   * 创建主任务
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>} 创建的主任务
   */
  async createMainTask(taskData) {
    try {
      // 确保任务有ID
      const taskId = taskData.id || uuidv4();
      
      // 准备任务数据
      const mainTaskData = {
        id: taskId,
        title: taskData.title,
        description: taskData.description,
        complexity: taskData.complexity,
        type: taskData.type || 'PROJECT',
        priority: taskData.priority || 'MEDIUM',
        status: 'TODO',
        tags: taskData.tags || [],
        estimatedHours: taskData.estimatedHours || 0,
        dueDate: taskData.dueDate || null
      };
      
      // 创建任务
      const mainTask = await taskService.createTask(mainTaskData);
      logger.info('主任务创建成功:', { taskId: mainTask.id });
      
      return mainTask;
    } catch (error) {
      logger.error('创建主任务失败:', error);
      throw new Error(`创建主任务失败: ${error.message}`);
    }
  }
  
  /**
   * 创建子任务
   * @param {Array} subTasksData - 子任务数据数组
   * @param {string} parentTaskId - 父任务ID
   * @returns {Promise<Array>} 创建的子任务数组
   */
  async createSubTasks(subTasksData, parentTaskId) {
    try {
      if (!Array.isArray(subTasksData)) {
        throw new Error('子任务数据必须是数组');
      }
      
      const createdSubTasks = [];
      
      for (const subTaskData of subTasksData) {
        // 准备子任务数据
        const subTask = {
          id: uuidv4(),
          title: subTaskData.title,
          description: subTaskData.description,
          type: 'TASK',
          priority: 'MEDIUM',
          status: 'TODO',
          tags: [],
          complexity: 'LOW',
          estimatedHours: subTaskData.estimatedHours || 0,
          parentTaskId: parentTaskId
        };
        
        // 创建子任务
        const createdSubTask = await taskService.createTask(subTask);
        createdSubTasks.push(createdSubTask);
        
        logger.info('子任务创建成功:', { 
          taskId: createdSubTask.id, 
          title: createdSubTask.title 
        });
      }
      
      return createdSubTasks;
    } catch (error) {
      logger.error('创建子任务失败:', error);
      throw new Error(`创建子任务失败: ${error.message}`);
    }
  }
  
  /**
   * 为任务创建树木
   * @param {Object} mainTask - 主任务
   * @param {Array} subTasks - 子任务数组
   * @returns {Promise<Object>} 创建的树木信息
   */
  async createTreesForTasks(mainTask, subTasks) {
    try {
      // 创建主树
      const mainTree = await treeService.createTree({
        taskId: mainTask.id,
        type: this.mapTaskTypeToTreeType(mainTask.type),
        health: 100,
        growthStage: 'SEEDLING'
      });
      
      logger.info('主树创建成功:', { 
        treeId: mainTree.id, 
        taskId: mainTask.id,
        type: mainTree.type
      });
      
      // 创建子树
      const subTrees = [];
      for (const subTask of subTasks) {
        const subTree = await treeService.createTree({
          taskId: subTask.id,
          parentTreeId: mainTree.id,
          type: this.mapTaskTypeToTreeType(subTask.type || 'TASK'),
          health: 100,
          growthStage: 'SEED'
        });
        
        subTrees.push(subTree);
        
        logger.info('子树创建成功:', { 
          treeId: subTree.id, 
          taskId: subTask.id,
          parentTreeId: mainTree.id
        });
      }
      
      return {
        mainTree,
        subTrees
      };
    } catch (error) {
      logger.error('创建树木失败:', error);
      throw new Error(`创建树木失败: ${error.message}`);
    }
  }
  
  /**
   * 映射任务类型到树木类型
   * @param {string} taskType - 任务类型
   * @returns {string} 树木类型
   */
  mapTaskTypeToTreeType(taskType) {
    const typeMap = {
      'PROJECT': 'REDWOOD',
      'WORK': 'OAK',
      'LEARNING': 'PINE',
      'CREATIVE': 'MAPLE',
      'LEISURE': 'WILLOW',
      'TASK': 'OAK',
      'NORMAL': 'OAK'
    };
    
    return typeMap[taskType] || 'OAK';
  }
}

export default new TaskIntegrationService(); 