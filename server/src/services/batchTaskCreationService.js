import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import taskService from './taskService.js';
import treeService from './treeService.js';

// 加载环境变量
dotenv.config();

/**
 * 批量任务创建服务
 * 负责处理批量创建任务和任务树结构
 */

// 任务 Repository 模拟实现
class TaskRepository {
  constructor() {
    this.tasks = new Map();
  }

  async createTask(task) {
    const taskId = task.id || uuidv4();
    const newTask = {
      ...task,
      id: taskId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: task.status || 'NOT_STARTED'
    };
    
    this.tasks.set(taskId, newTask);
    return newTask;
  }

  async getTasks() {
    return Array.from(this.tasks.values());
  }

  async getTaskById(id) {
    return this.tasks.get(id);
  }
}

// 任务树 Repository 模拟实现
class TaskTreeRepository {
  constructor() {
    this.trees = new Map();
    this.treeNodes = new Map();
  }

  async createTree(tree) {
    const treeId = tree.id || uuidv4();
    const newTree = {
      ...tree,
      id: treeId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.trees.set(treeId, newTree);
    return newTree;
  }

  async createTreeNode(node) {
    const nodeId = node.id || uuidv4();
    const newNode = {
      ...node,
      id: nodeId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.treeNodes.set(nodeId, newNode);
    return newNode;
  }
}

// 实例化 Repository
const taskRepository = new TaskRepository();
const taskTreeRepository = new TaskTreeRepository();

/**
 * 批量任务创建服务
 */
class BatchTaskCreationService {
  /**
   * 批量创建任务
   * @param {Array} tasks - 任务数组
   * @returns {Object} 创建结果
   */
  async createBatchTasks(tasks) {
    try {
      logger.info(`BatchTaskCreationService - 开始批量创建${tasks.length}个任务`);
      
      // 为每个任务生成ID（如果没有提供）
      const tasksWithIds = tasks.map(task => ({
        ...task,
        id: task.id || uuidv4()
      }));
      
      // 创建任务
      const createdTasks = [];
      for (const task of tasksWithIds) {
        try {
          const createdTask = await taskService.createTask(task);
          createdTasks.push(createdTask);
          logger.info(`任务创建成功 - ID: ${createdTask.id}, 标题: ${createdTask.title}`);
        } catch (error) {
          logger.error(`任务创建失败 - 标题: ${task.title}, 错误: ${error.message}`);
          throw new Error(`任务创建失败: ${error.message}`);
        }
      }
      
      logger.info(`BatchTaskCreationService - 成功创建了${createdTasks.length}个任务`);
      
      return {
        tasks: createdTasks
      };
    } catch (error) {
      logger.error(`BatchTaskCreationService - 批量创建任务失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 批量创建任务和任务树
   * @param {Array} tasks - 任务数组（包含子任务）
   * @param {Boolean} createTrees - 是否创建任务树
   * @returns {Object} 创建结果
   */
  async createBatchTasksWithTrees(tasks, createTrees = true) {
    try {
      logger.info(`BatchTaskCreationService - 开始批量创建${tasks.length}个任务和任务树`);
      
      // 为每个主任务和子任务生成ID（如果没有提供）
      const tasksWithIds = tasks.map(task => ({
        ...task,
        id: task.id || uuidv4(),
        subTasks: task.subTasks?.map(subTask => ({
          ...subTask,
          id: subTask.id || uuidv4()
        }))
      }));
      
      const result = {
        tasks: [],
        trees: []
      };
      
      // 处理每个主任务
      for (const taskData of tasksWithIds) {
        try {
          // 1. 创建主任务
          const mainTask = await taskService.createTask({
            id: taskData.id,
            title: taskData.title,
            description: taskData.description,
            status: taskData.status || '未开始',
            priority: taskData.priority || '中',
            complexity: taskData.complexity || '中',
            dueDate: taskData.dueDate
          });
          
          logger.info(`主任务创建成功 - ID: ${mainTask.id}, 标题: ${mainTask.title}`);
          
          // 2. 创建子任务
          const subTasks = [];
          if (taskData.subTasks && taskData.subTasks.length > 0) {
            for (const subTaskData of taskData.subTasks) {
              try {
                const subTask = await taskService.createTask({
                  id: subTaskData.id,
                  title: subTaskData.title,
                  description: subTaskData.description,
                  status: subTaskData.status || '未开始',
                  priority: subTaskData.priority || '中',
                  estimatedHours: subTaskData.estimatedHours,
                  type: subTaskData.type || 'NORMAL',
                  tags: Array.isArray(subTaskData.tags) ? subTaskData.tags : ['AI生成'],
                  parentId: mainTask.id  // 关联到主任务
                });
                
                subTasks.push(subTask);
                logger.info(`子任务创建成功 - ID: ${subTask.id}, 标题: ${subTask.title}`);
              } catch (error) {
                logger.error(`子任务创建失败 - 标题: ${subTaskData.title}, 错误: ${error.message}`);
                // 继续创建其他子任务，不中断流程
              }
            }
          }
          
          // 3. 创建任务树（如果需要）
          let tree = null;
          if (createTrees) {
            try {
              tree = await treeService.createTree({
                name: `${mainTask.title}的任务树`,
                type: this._getRandomTreeType(),
                taskId: mainTask.id
              });
              
              logger.info(`任务树创建成功 - ID: ${tree.id}, 名称: ${tree.name}`);
            } catch (error) {
              logger.error(`任务树创建失败 - 主任务ID: ${mainTask.id}, 错误: ${error.message}`);
              // 任务树创建失败不影响整体流程
            }
          }
          
          // 4. 添加到结果中
          result.tasks.push({
            mainTask,
            subTasks
          });
          
          if (tree) {
            result.trees.push(tree);
          }
        } catch (error) {
          logger.error(`处理主任务失败 - 标题: ${taskData.title}, 错误: ${error.message}`);
          // 继续处理其他主任务，不中断流程
        }
      }
      
      logger.info(`BatchTaskCreationService - 成功创建了${result.tasks.length}个主任务和${result.trees.length}个任务树`);
      
      return result;
    } catch (error) {
      logger.error(`BatchTaskCreationService - 批量创建任务和任务树失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取随机树类型
   * @returns {String} 树类型
   * @private
   */
  _getRandomTreeType() {
    const treeTypes = ['松树', '橡树', '枫树', '樱花树', '柳树'];
    return treeTypes[Math.floor(Math.random() * treeTypes.length)];
  }
}

// 导出服务实例
export default new BatchTaskCreationService(); 