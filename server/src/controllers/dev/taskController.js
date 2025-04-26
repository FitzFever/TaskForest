/**
 * 开发环境任务控制器
 * 用于提供开发环境下的任务相关API接口
 */
import logger from '../../utils/logger.js';
import { tasks, trees, addTask, addTree } from '../../dataStore.js';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultTreeTypeForTask } from '../../constants/treeMapping.js';

/**
 * 获取所有任务
 * @param {import('express').Request} req - 请求对象
 * @param {import('express').Response} res - 响应对象
 */
export function getTasks(req, res) {
  try {
    logger.info('获取任务列表');
    
    const allTasks = [...tasks];
    
    // 获取全局批量创建的任务
    if (global.batchCreatedTasks && Array.isArray(global.batchCreatedTasks)) {
      allTasks.push(...global.batchCreatedTasks);
    }
    
    // 返回前端期望的格式
    res.json({
      code: 200,
      data: {
        tasks: allTasks,
        pagination: {
          total: allTasks.length,
          page: 1,
          limit: allTasks.length,
          pages: 1
        }
      },
      message: '获取任务列表成功',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`获取任务列表失败: ${error.message}`);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取任务列表失败',
      timestamp: Date.now()
    });
  }
}

/**
 * 获取单个任务
 * @param {import('express').Request} req - 请求对象
 * @param {import('express').Response} res - 响应对象
 */
export function getTask(req, res) {
  try {
    const taskId = req.params.id;
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '任务ID不能为空' },
        message: '请求参数错误',
        timestamp: Date.now()
      });
    }
    
    logger.info(`获取单个任务，ID: ${taskId}`);
    
    // 在所有可能的数组中查找任务
    let allTasks = [...tasks];
    
    // 获取全局批量创建的任务
    if (global.batchCreatedTasks && Array.isArray(global.batchCreatedTasks)) {
      allTasks = [...allTasks, ...global.batchCreatedTasks];
    }
    
    // 查找任务
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: task,
      message: '获取任务成功',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`获取单个任务失败: ${error.message}`);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取任务失败',
      timestamp: Date.now()
    });
  }
}

/**
 * 添加任务到开发环境数据
 * @param {import('express').Request} req - 请求对象
 * @param {import('express').Response} res - 响应对象
 */
export function addTaskToDevData(req, res) {
  try {
    const taskData = req.body;
    
    if (!taskData.title) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '任务标题不能为空' },
        message: '请求参数错误',
        timestamp: Date.now()
      });
    }
    
    logger.info(`收到创建任务请求，数据: ${JSON.stringify(taskData)}`);
    
    // 创建任务对象
    const taskId = taskData.id || uuidv4();
    const task = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || '未开始',
      priority: taskData.priority || '中',
      type: taskData.type || '一般任务',
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: taskData.tags || []
    };
    
    logger.info(`创建任务: ${task.id} - ${task.title}`);
    
    // 确保全局任务数组存在且有效
    if (!Array.isArray(global.tasks)) {
      logger.warn('全局tasks数组无效，重新初始化为空数组');
      global.tasks = [];
    }
    
    // 添加任务到数据存储
    addTask(task);
    global.tasks.push(task);
    
    // 如果需要创建树，则创建关联的树
    let tree = null;
    if (taskData.createTree !== false) {
      const treeType = getDefaultTreeTypeForTask(task.type);
      
      tree = {
        id: uuidv4(),
        taskId: task.id,
        type: treeType,
        name: `${task.title}的树`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        growthStage: 0,
        health: 100,
        position: {
          x: Math.floor(Math.random() * 20) - 10,  // -10到10之间
          y: 0,
          z: Math.floor(Math.random() * 20) - 10   // -10到10之间
        }
      };
      
      logger.info(`为任务 ${task.id} 创建树: ${tree.id} - ${tree.type}`);
      
      // 确保全局树木数组存在且有效
      if (!Array.isArray(global.trees)) {
        logger.warn('全局trees数组无效，重新初始化为空数组');
        global.trees = [];
      }
      
      // 添加树到数据存储
      addTree(tree);
      global.trees.push(tree);
      
      // 检查树是否成功添加到全局数组
      const treeAdded = global.trees.some(t => t.id === tree.id);
      if (!treeAdded) {
        logger.error(`树 ${tree.id} 未能添加到全局trees数组，再次尝试添加`);
        global.trees.push({...tree});
      }
      
      // 更新任务，添加对树的引用
      task.treeId = tree.id;
      task.treeType = treeType;
    }
    
    res.status(201).json({
      code: 201,
      data: { task, tree },
      message: '任务创建成功' + (tree ? '，并已关联树木' : ''),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`创建任务失败: ${error.message}`, { error });
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '创建任务失败',
      timestamp: Date.now()
    });
  }
}

/**
 * 从开发环境数据中删除任务
 * @param {import('express').Request} req - 请求对象
 * @param {import('express').Response} res - 响应对象
 */
export function deleteTaskFromDevData(req, res) {
  try {
    const taskId = req.params.id;
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '任务ID不能为空' },
        message: '请求参数错误',
        timestamp: Date.now()
      });
    }
    
    // 在任务数组中查找任务
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: `未找到ID为${taskId}的任务` },
        message: '任务不存在',
        timestamp: Date.now()
      });
    }
    
    // 从任务数组中移除任务
    const removedTask = tasks.splice(taskIndex, 1)[0];
    
    // 查找并删除关联的树
    let removedTree = null;
    const treeIndex = trees.findIndex(t => t.taskId === taskId);
    
    if (treeIndex !== -1) {
      removedTree = trees.splice(treeIndex, 1)[0];
    }
    
    res.json({
      code: 200,
      data: {
        taskId: removedTask.id,
        treeDeleted: !!removedTree
      },
      message: '任务删除成功',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`删除任务失败: ${error.message}`);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '删除任务失败',
      timestamp: Date.now()
    });
  }
} 