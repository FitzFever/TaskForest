import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { tasks } from '../dataStore.js';

// 使用全局任务存储
const tasksMap = new Map();

// 初始化tasksMap
function initTasksMap() {
  tasks.forEach(task => {
    tasksMap.set(task.id, task);
  });
  logger.info(`从全局数据存储初始化了 ${tasksMap.size} 个任务`);
}

// 初始化
initTasksMap();

/**
 * 将任务Map同步到全局任务数组
 * @private
 */
function syncTasksToGlobal() {
  // 清空全局任务数组
  tasks.length = 0;
  
  // 将所有任务添加到全局数组
  for (const task of tasksMap.values()) {
    tasks.push(task);
  }
  
  logger.info(`已将 ${tasks.length} 个任务同步到全局数据存储，任务ID: ${tasks.map(task => task.id).join(', ')}`);
}

/**
 * 创建新任务
 * @param {Object} taskData - 任务数据
 * @returns {Promise<Object>} 创建的任务
 */
async function createTask(taskData) {
    try {
      // 生成唯一ID
      const taskId = taskData.id || uuidv4();
    
      logger.info(`开始创建任务，ID: ${taskId}, 输入数据: ${JSON.stringify(taskData)}`);
      
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
        treeType: taskData.treeType || 'OAK',  // 确保设置treeType
        growthStage: taskData.growthStage || 0, // 确保设置growthStage
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 增加对创建的任务结构的详细日志
      logger.info(`任务创建对象结构: ${JSON.stringify(task)}`);
    
      // 存储任务到Map
      tasksMap.set(taskId, task);
    
      // 确保全局tasks数组存在且有效
      if (!Array.isArray(tasks)) {
        logger.warn(`全局tasks数组无效，重新初始化为空数组`);
        global.tasks = [];
      }
      
      // 直接添加到全局tasks数组
      tasks.push(task);
      
      // 验证任务是否已成功添加到全局数组
      const addedToGlobal = tasks.some(t => t.id === taskId);
      if (!addedToGlobal) {
        logger.error(`任务同步到全局数组失败，ID: ${taskId}，尝试再次添加`);
        tasks.push({...task});
      }
      
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
async function getTask(taskId) {
  logger.info(`获取任务详情，ID: ${taskId}，当前任务Map大小: ${tasksMap.size}`);
  const task = tasksMap.get(taskId);
    if (!task) {
    logger.error(`任务不存在: ${taskId}，可用任务ID: ${Array.from(tasksMap.keys()).join(', ')}`);
      throw new Error(`任务不存在: ${taskId}`);
    }
    return task;
  }

  /**
   * 获取所有主任务（没有父任务的任务）
   * @returns {Promise<Array>} 主任务列表
   */
async function getMainTasks() {
    const mainTasks = [];
  for (const task of tasksMap.values()) {
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
async function getSubTasks(parentTaskId) {
    const subTasks = [];
  for (const task of tasksMap.values()) {
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
async function updateTaskStatus(taskId, status) {
  const task = await getTask(taskId);
    task.status = status;
    task.updatedAt = new Date().toISOString();
  tasksMap.set(taskId, task);
  
  // 同步到全局任务数组
  syncTasksToGlobal();
  
    return task;
  }

  /**
   * 更新任务
   * @param {string} taskId - 任务ID
   * @param {Object} updates - 要更新的字段
   * @returns {Promise<Object>} 更新后的任务
   */
async function updateTask(taskId, updates) {
  const task = await getTask(taskId);
    
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
  tasksMap.set(taskId, task);
  
  // 同步到全局任务数组
  syncTasksToGlobal();
    
    logger.info(`任务已更新: ${taskId}`);
    return task;
  }

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<boolean>} 是否删除成功
   */
async function deleteTask(taskId) {
    // 检查任务是否存在
  await getTask(taskId);
    
    // 删除任务
  tasksMap.delete(taskId);
  
  // 同步到全局任务数组
  syncTasksToGlobal();
    
    logger.info(`任务已删除: ${taskId}`);
    return true;
  }

/**
 * 获取所有任务
 * @returns {Promise<Array>} 所有任务列表
 */
async function getAllTasks() {
  return Array.from(tasksMap.values());
}

/**
 * 根据标签获取任务
 * @param {string} tag - 标签
 * @returns {Promise<Array>} 包含指定标签的任务列表
 */
async function getTasksByTag(tag) {
  const matchedTasks = [];
  for (const task of tasksMap.values()) {
    if (task.tags && task.tags.includes(tag)) {
      matchedTasks.push(task);
    }
  }
  return matchedTasks;
}

/**
 * 添加标签到任务
 * @param {string} taskId - 任务ID
 * @param {Array<string>} tags - 标签数组
 * @returns {Promise<Object>} 更新后的任务
 */
async function addTagsToTask(taskId, tags) {
  const task = await getTask(taskId);
  
  // 确保任务有tags数组
  if (!task.tags) {
    task.tags = [];
  }
  
  // 添加新标签（去重）
  for (const tag of tags) {
    if (!task.tags.includes(tag)) {
      task.tags.push(tag);
    }
  }
  
  task.updatedAt = new Date().toISOString();
  tasksMap.set(taskId, task);
  
  // 同步到全局任务数组
  syncTasksToGlobal();
  
  return task;
}

export default {
  createTask,
  getTask,
  getMainTasks,
  getSubTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getAllTasks,
  getTasksByTag,
  addTagsToTask
}; 