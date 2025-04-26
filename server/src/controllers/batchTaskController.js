import logger from '../utils/logger.js';
import batchTaskCreationService from '../services/batchTaskCreationService.js';
import taskService from '../services/taskService.js';
import { v4 as uuidv4 } from 'uuid';
import { trees, addTree } from '../dataStore.js'; // 导入全局树存储

  /**
 * 批量创建任务
 * @param {import('express').Request} req - 请求对象
 * @param {import('express').Response} res - 响应对象
 * @returns {Promise<void>}
   */
async function createBatchTasks(req, res) {
    try {
    const { tasks } = req.body;
      
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({
          success: false,
        message: '请求无效: 缺少任务数据或任务数据不是数组'
        });
      }

    logger.info(`批量创建任务 - 开始处理 ${tasks.length} 个任务`);
      
    // 调用服务创建批量任务
    const result = await batchTaskCreationService.createBatchTasks(tasks);
    const { tasks: createdTasks, trees: createdTrees } = result;
      
    // 日志记录结果
    logger.info(`批量创建任务结果 - 任务: ${createdTasks.length}, 树木: ${createdTrees.length}`);
    if (createdTrees && createdTrees.length > 0) {
      logger.info(`创建的树木ID: ${createdTrees.map(tree => tree.id).join(', ')}`);
    }

    // 返回成功响应
    const response = {
        success: true,
      message: `成功创建 ${createdTasks.length} 个任务`,
      data: {
        tasks: createdTasks,
        trees: createdTrees
      }
    };

    // 在开发环境模式下，使用预设的响应存储
    if (process.env.NODE_ENV === 'development') {
      res.locals.responseData = response;
      logger.info(`已将响应数据存储到res.locals.responseData中 (${createdTasks.length}个任务, ${createdTrees.length}个树木)`);
    }

    // 确保全局变量也被更新
    if (typeof global.storeBatchCreatedData === 'function') {
      global.storeBatchCreatedData(createdTasks, createdTrees);
      logger.info(`已通过全局函数存储批量创建的数据 (${createdTasks.length}个任务, ${createdTrees.length}个树木)`);
    }

    res.status(201).json(response);
    } catch (error) {
    logger.error(`批量创建任务失败: ${error.message}`, { error });
    res.status(500).json({
        success: false,
      message: `批量创建任务失败: ${error.message}`
      });
    }
  }

  /**
 * 批量创建任务和任务树
 * @param {import('express').Request} req - 请求对象
 * @param {import('express').Response} res - 响应对象
 */
export const createBatchTasksWithTrees = async (req, res) => {
  try {
    if (!req.body || !req.body.tasks || !Array.isArray(req.body.tasks)) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '请求必须包含有效的任务数组' },
        message: '请求参数错误',
        timestamp: Date.now()
      });
    }

    // 从请求中提取createTrees参数
    const createTrees = req.body.createTrees === true;
    
    console.log(`批量创建任务和树木控制器 - 创建树木标志: ${createTrees}`);

    // 创建任务和任务树
    const serviceResult = await batchTaskCreationService.createBatchTasksWithTrees(req.body.tasks, createTrees);
    
    // 提取原始的任务和树木
    const allTasks = serviceResult.allTasks || serviceResult.tasks || [];
    const createdTrees = serviceResult.trees || [];
    
    // 确保树木同时被添加到global.trees数组和global.batchCreatedTrees
    if (createdTrees && createdTrees.length > 0) {
      logger.info(`确保 ${createdTrees.length} 棵树木被正确添加到全局数组...`);
      
      // 初始化全局数组
      if (typeof global.batchCreatedTrees === 'undefined') {
        global.batchCreatedTrees = [];
        logger.info('初始化全局batchCreatedTrees数组');
      }
      
      // 将创建的树木添加到global.batchCreatedTrees
      for (const tree of createdTrees) {
        if (!global.batchCreatedTrees.some(t => t.id === tree.id)) {
          global.batchCreatedTrees.push(tree);
          logger.info(`树木 ${tree.id} 已添加到global.batchCreatedTrees`);
        }
        
        // 确保也添加到全局trees数组
        if (!global.trees?.some?.(t => t.id === tree.id)) {
          // 使用导入的trees和addTree变量确保树木同时添加到正确的地方
          const { trees, addTree } = await import('../dataStore.js');
          if (typeof addTree === 'function') {
            addTree(tree);
            logger.info(`使用addTree函数添加树木 ${tree.id} 到全局数组`);
          } else if (Array.isArray(trees)) {
            if (!trees.some(t => t.id === tree.id)) {
              trees.push(tree);
              logger.info(`直接添加树木 ${tree.id} 到全局trees数组`);
            }
          } else {
            logger.warn('无法添加树木到全局数组：trees不是数组或addTree函数不可用');
          }
        }
      }
      
      logger.info(`全局batchCreatedTrees数组现在包含 ${global.batchCreatedTrees.length} 棵树木`);
    }
    
    // 必须手动重组任务为前端期望的格式
    const formattedTasks = [];
    
    // 找出所有主任务和子任务
    const mainTasks = allTasks.filter(task => !task.parentId);
    const subTasksByParentId = {};
    
    // 按父任务ID分组所有子任务
    allTasks.forEach(task => {
      if (task.parentId) {
        if (!subTasksByParentId[task.parentId]) {
          subTasksByParentId[task.parentId] = [];
        }
        subTasksByParentId[task.parentId].push(task);
      }
    });
    
    // 创建格式化的任务组，每个任务组包含mainTask和subTasks
    mainTasks.forEach(mainTask => {
      formattedTasks.push({
        mainTask: mainTask,
        subTasks: subTasksByParentId[mainTask.id] || []
      });
    });
    
    // 构建完全符合期望的响应格式
    const responseData = {
      tasks: formattedTasks,
      trees: createdTrees
    };
    
    // 记录关键日志信息
    console.log(`响应格式示例: ${JSON.stringify(responseData.tasks[0])}`);
    console.log(`响应任务组数量: ${formattedTasks.length}, 树木数量: ${createdTrees.length}`);
    
    // 最终构建响应对象
    const response = {
      code: 201,
      data: responseData,
      message: `成功批量创建了 ${mainTasks.length} 个任务组和 ${createdTrees.length} 个任务树`,
      timestamp: Date.now()
    };
    
    // 返回响应
    res.status(201).json(response);
  } catch (error) {
    logger.error(`批量创建任务和任务树失败: ${error.message}`);

    // 返回错误响应
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '批量创建任务和任务树失败',
      timestamp: Date.now()
    });
  }
};

/**
 * 获取批量任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
 * @returns {Promise<void>}
   */
async function getTasksForBatch(req, res) {
    try {
    const result = await batchTaskCreationService.getBatchedTasks();
      
    // 获取任务关联的树木
    const tasksWithTrees = [];
    if (result.recentlyCreated && Array.isArray(result.recentlyCreated)) {
      for (const task of result.recentlyCreated) {
        // 查找任务的树木
        let tree = null;
        try {
          tree = await batchTaskCreationService.findTreeByTaskId(task.id);
        } catch (error) {
          logger.warn(`查找任务(${task.id})的树木失败: ${error.message}`);
      }
      
        tasksWithTrees.push({
          ...task,
          tree: tree || null,
          hasTree: !!tree
        });
      }
    }
    
    res.json({
      ...result,
      recentlyCreated: tasksWithTrees
    });
  } catch (error) {
    logger.error(`获取批量任务失败: ${error.message}`, { error });
    res.status(500).json({
            success: false,
      message: error.message
          });
        }
      }
      
// 为测试或调试提供的全局函数
global.storeBatchCreatedData = (tasks, trees) => {
  try {
    logger.info(`存储批量创建的数据: ${tasks?.length || 0}个任务, ${trees?.length || 0}个树木`);
    
    // 确保全局访问函数存在
    if (!global.getBatchCreatedTasks) {
      global._batchCreatedTasks = global._batchCreatedTasks || [];
      global.getBatchCreatedTasks = () => global._batchCreatedTasks || [];
    }
    
    if (!global.getBatchCreatedTrees) {
      global._batchCreatedTrees = global._batchCreatedTrees || [];
      global.getBatchCreatedTrees = () => global._batchCreatedTrees || [];
    }
    
    // 获取现有数据
    const existingTasks = global.getBatchCreatedTasks();
    const existingTrees = global.getBatchCreatedTrees();
    
    // 记录当前数据
    logger.debug(`现有数据：${existingTasks.length}个任务，${existingTrees.length}个树木`);
    
    // 合并数据
    const newTasks = [...existingTasks];
    const newTrees = [...existingTrees];
    
    // 添加新任务（避免重复）
    if (tasks && Array.isArray(tasks)) {
      const taskIds = new Set(newTasks.map(t => String(t.id)));
      tasks.forEach(task => {
        if (!taskIds.has(String(task.id))) {
          // 转换 ID 为字符串，确保一致性
          const processedTask = {
            ...task,
            id: String(task.id)
          };
          newTasks.push(processedTask);
          taskIds.add(String(task.id));
          logger.debug(`添加任务：${task.id} - ${task.title || 'Untitled'}`);
        }
      });
    }
    
    // 添加新树木（避免重复）
    if (trees && Array.isArray(trees)) {
      const treeIds = new Set(newTrees.map(t => String(t.id)));
      trees.forEach(tree => {
        if (tree && !treeIds.has(String(tree.id))) {
          // 转换 ID 为字符串，确保一致性
          const processedTree = {
            ...tree,
            id: String(tree.id),
            taskId: tree.taskId ? String(tree.taskId) : tree.taskId
          };
          newTrees.push(processedTree);
          treeIds.add(String(tree.id));
          
          // 添加到全局树木存储 - 确保树木能被检索到
          addTree(processedTree);
          
          logger.debug(`添加树木：${tree.id} - 类型：${tree.type}，关联任务ID：${tree.taskId || 'None'}`);
        }
      });
    }
    
    // 更新全局变量
    global._batchCreatedTasks = newTasks;
    global._batchCreatedTrees = newTrees;
    
    // 更新模块级变量（如果存在）
    if (typeof global.batchCreatedTasks !== 'undefined') {
      global.batchCreatedTasks = newTasks;
    }
    
    if (typeof global.batchCreatedTrees !== 'undefined') {
      global.batchCreatedTrees = newTrees;
    }
    
    logger.info(`全局数据已更新: ${newTasks.length}个任务, ${newTrees.length}个树木`);
    
    // 验证更新结果
    const finalTasks = global.getBatchCreatedTasks();
    const finalTrees = global.getBatchCreatedTrees();
    logger.debug(`验证更新结果：${finalTasks.length}个任务，${finalTrees.length}个树木`);
  } catch (error) {
    logger.error(`存储批量创建的数据失败：${error.message}`, { error });
    }
};

export default {
  createBatchTasks,
  createBatchTasksWithTrees,
  getTasksForBatch
};