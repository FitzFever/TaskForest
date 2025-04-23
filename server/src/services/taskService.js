import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * 任务服务，处理任务相关操作
 */
class TaskService {
  constructor() {
    // 模拟数据库存储
    this.tasks = new Map();
  }

  /**
   * 创建新任务
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>} 创建的任务
   */
  async createTask(taskData) {
    try {
      // 生成唯一ID
      const taskId = taskData.id || uuidv4();
      
      // 创建任务对象
      const task = {
        id: taskId,
        title: taskData.title,
        description: taskData.description || '',
        type: taskData.type || 'NORMAL',
        priority: taskData.priority || 'MEDIUM',
        status: taskData.status || 'NOT_STARTED',
        tags: taskData.tags || [],
        complexity: taskData.complexity,
        estimatedHours: taskData.estimatedHours || 0,
        actualHours: 0,
        dueDate: taskData.dueDate || null,
        parentTaskId: taskData.parentTaskId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 存储任务
      this.tasks.set(taskId, task);
      
      logger.info(`任务已创建: ${taskId} - ${task.title}`);
      return task;
    } catch (error) {
      logger.error(`创建任务失败: ${error.message}`, { error });
      throw new Error(`创建任务失败: ${error.message}`);
    }
  }

  /**
   * 获取任务详情
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 任务详情
   */
  async getTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }
    return task;
  }

  /**
   * 获取所有主任务（没有父任务的任务）
   * @returns {Promise<Array>} 主任务列表
   */
  async getMainTasks() {
    const mainTasks = [];
    for (const task of this.tasks.values()) {
      if (!task.parentTaskId) {
        mainTasks.push(task);
      }
    }
    logger.info(`获取到 ${mainTasks.length} 个主任务`);
    return mainTasks;
  }

  /**
   * 获取子任务列表
   * @param {string} parentTaskId - 父任务ID
   * @returns {Promise<Array>} 子任务列表
   */
  async getSubTasks(parentTaskId) {
    const subTasks = [];
    for (const task of this.tasks.values()) {
      if (task.parentTaskId === parentTaskId) {
        subTasks.push(task);
      }
    }
    return subTasks;
  }

  /**
   * 更新任务状态
   * @param {string} taskId - 任务ID
   * @param {string} status - 新状态
   * @returns {Promise<Object>} 更新后的任务
   */
  async updateTaskStatus(taskId, status) {
    const task = await this.getTask(taskId);
    task.status = status;
    task.updatedAt = new Date().toISOString();
    this.tasks.set(taskId, task);
    return task;
  }

  /**
   * 更新任务
   * @param {string} taskId - 任务ID
   * @param {Object} updates - 要更新的字段
   * @returns {Promise<Object>} 更新后的任务
   */
  async updateTask(taskId, updates) {
    const task = await this.getTask(taskId);
    
    // 更新允许的字段
    const allowedUpdates = [
      'title', 'description', 'type', 'priority', 
      'status', 'tags', 'dueDate', 'estimatedHours'
    ];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });
    
    task.updatedAt = new Date().toISOString();
    this.tasks.set(taskId, task);
    
    logger.info(`任务已更新: ${taskId}`);
    return task;
  }

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteTask(taskId) {
    // 检查任务是否存在
    await this.getTask(taskId);
    
    // 删除任务
    this.tasks.delete(taskId);
    
    logger.info(`任务已删除: ${taskId}`);
    return true;
  }
}

export default new TaskService(); 