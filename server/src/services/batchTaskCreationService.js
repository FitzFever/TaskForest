import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import taskService from './taskService.js';
import TreeService from './treeService.js';
import { tasks, trees } from '../dataStore.js';  // 直接引入全局任务数组和树木数组
import { TASK_TYPE_TO_TREE_TYPE_MAPPING, getDefaultTreeTypeForTask } from '../constants/treeMapping.js';

// 加载环境变量
dotenv.config();

/**
 * 批量任务创建服务
 * 负责处理批量创建任务和任务树结构
 */

/**
 * 批量创建任务
 * @param {Array} tasksData - 任务数据数组
 * @returns {Promise<Object>} 创建结果
 */
async function createBatchTasks(tasksData) {
  try {
    logger.info(`开始批量创建任务，数量: ${tasksData.length}`);
    
    // 跟踪创建的任务和树木
    const createdTasks = [];
    const createdTrees = [];
    
    // 逐个创建任务并生成关联的树木
    for (const taskData of tasksData) {
      try {
        // 生成任务ID（如果没有提供）
        if (!taskData.id) {
          taskData.id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
        
        // 添加创建时间
        const now = new Date().toISOString();
        const task = {
          ...taskData,
          createdAt: taskData.createdAt || now,
          updatedAt: now
        };
        
        // 记录任务
        logger.debug(`创建任务: ${task.id} - ${task.title}`);
        
        // 创建关联的树木
        let tree = null;
        try {
          // 为任务创建树木
          logger.info(`为任务 ${task.id} 创建关联树木`);
          tree = await createTreeForTask(task);
          
          if (tree) {
            logger.info(`成功创建树木 ${tree.id} 关联到任务 ${task.id}`);
            createdTrees.push(tree);
            
            // 在任务中添加树木引用
            task.treeId = tree.id;
            task.treeType = tree.type;
          } else {
            logger.warn(`无法为任务 ${task.id} 创建树木`);
  }
        } catch (treeError) {
          logger.error(`为任务 ${task.id} 创建树木失败: ${treeError.message}`);
          // 继续处理下一个任务，即使创建树木失败
        }
        
        // 添加到结果
        createdTasks.push(task);
      } catch (taskError) {
        logger.error(`创建单个任务失败: ${taskError.message}`);
        // 继续处理下一个任务
  }
}

    // 确保全局变量存在并更新
    if (typeof global.getBatchCreatedTasks !== 'function') {
      global._batchCreatedTasks = global._batchCreatedTasks || [];
      global.getBatchCreatedTasks = () => global._batchCreatedTasks;
  }

    // 添加到全局变量（避免重复）
    const existingTasks = global.getBatchCreatedTasks() || [];
    const taskIds = new Set(existingTasks.map(t => t.id));
    
    for (const task of createdTasks) {
      if (!taskIds.has(task.id)) {
        existingTasks.push(task);
        taskIds.add(task.id);
      }
    }
    
    // 更新全局变量
    global._batchCreatedTasks = existingTasks;
    
    // 更新全局引用
    if (typeof global.batchCreatedTasks === 'undefined') {
      global.batchCreatedTasks = [];
  }
    global.batchCreatedTasks.push(...createdTasks);
    
    if (typeof global.batchCreatedTrees === 'undefined') {
      global.batchCreatedTrees = [];
    }
    global.batchCreatedTrees.push(...createdTrees);
    
    logger.info(`批量任务创建完成。创建了 ${createdTasks.length} 个任务和 ${createdTrees.length} 个树木`);
    
    return {
      tasks: createdTasks,
      trees: createdTrees
    };
  } catch (error) {
    logger.error(`批量创建任务失败: ${error.message}`, { error });
    throw new Error(`批量创建任务失败: ${error.message}`);
  }
}

  /**
 * 批量创建任务和任务树
 * @param {Array} tasksGroups - 任务组数组，每个任务组包含主任务和子任务
 * @param {boolean} createTrees - 是否为每个任务组创建任务树，默认为true
 * @returns {Promise<Object>} 返回创建的任务和任务树
   */
async function createBatchTasksWithTrees(tasksGroups, createTrees = true) {
  logger.info(`批量创建任务和任务树 - 开始处理 ${tasksGroups.length} 个任务组，创建树木: ${createTrees}`);
  
  if (!Array.isArray(tasksGroups)) {
    throw new Error('任务组必须是数组');
  }
  
  // 创建的所有任务
  const allTasks = [];
  
  // 按前端期望格式组织的任务组
  const formattedTaskGroups = [];
  
  // 为每个任务组创建主任务和子任务
  for (const group of tasksGroups) {
    try {
      // 检查请求格式并创建主任务
      let mainTask;
      
      // 处理两种可能的请求格式
      if (group.mainTask) {
        // 原预期的格式，包含mainTask和subTasks字段
        mainTask = {
          id: uuidv4(),
          title: group.mainTask.title,
          description: group.mainTask.description,
          status: group.mainTask.status || '未开始',
          priority: group.mainTask.priority || '中',
          dueDate: group.mainTask.dueDate,
          type: group.mainTask.type || '一般任务',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else if (group.title) {
        // 备用格式，任务组本身就是主任务，子任务在subTasks字段中
        mainTask = {
          id: uuidv4(),
          title: group.title,
          description: group.description || '',
          status: group.status || '未开始',
          priority: group.priority || '中',
          dueDate: group.dueDate,
          type: group.type || '一般任务',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        logger.warn('任务组格式不正确，跳过此任务组');
        continue;
      }
      
      // 将主任务添加到任务列表
      allTasks.push(mainTask);
      
      // 创建子任务（如果有）
      const subTasks = [];
      const subTasksData = group.subTasks || [];
      
      if (Array.isArray(subTasksData) && subTasksData.length > 0) {
        for (const subTaskData of subTasksData) {
          const subTask = {
            id: uuidv4(),
            parentId: mainTask.id, // 确保设置父任务ID
            title: subTaskData.title,
            description: subTaskData.description,
            status: subTaskData.status || '未开始',
            priority: subTaskData.priority || '中',
            estimatedHours: subTaskData.estimatedHours,
            type: subTaskData.type || (group.mainTask?.type || group.type) || '一般任务',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          subTasks.push(subTask);
          allTasks.push(subTask);
        }
      }
      
      // 保存按前端期望格式组织的任务组
      formattedTaskGroups.push({
        mainTask,
        subTasks
      });
      
      logger.info(`创建了任务组: 主任务"${mainTask.title}" (ID: ${mainTask.id})，包含 ${subTasks.length} 个子任务`);
    } catch (error) {
      logger.error(`创建任务组失败: ${error.message}`);
      throw error;
    }
  }
  
  // 创建的所有树木
  const allTrees = [];
  
  // 如果需要为每个任务组创建任务树
  if (createTrees) {
    logger.info(`准备为 ${formattedTaskGroups.length} 个任务组创建任务树`);
    
    for (const taskGroup of formattedTaskGroups) {
      try {
        // 使用新函数为任务组创建树结构
        const tree = createTreeForTaskGroup(taskGroup);
        
        if (tree) {
          try {
            const TreeModel = await import('../models/treeModel.js');
            
            // 使用TreeModel的createTree方法创建规范的树木
            const createdTree = TreeModel.createTree({
              ...tree,
              // 确保有正确的ID格式
              id: tree.id.startsWith('tree-') ? tree.id : `tree-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              // 确保树木有taskId字段
              taskId: tree.mainTaskId
            });
            
            allTrees.push(createdTree);
            logger.info(`为任务组 ${taskGroup.mainTask.id} 使用TreeModel成功创建了任务树 ${createdTree.id}`);
            
            // 确保将树木添加到全局batchCreatedTrees数组
            if (global.batchCreatedTrees === undefined) {
              global.batchCreatedTrees = [];
            }
            
            // 检查是否已存在相同ID的树木
            if (!global.batchCreatedTrees.some(t => t.id === createdTree.id)) {
              global.batchCreatedTrees.push(createdTree);
              logger.info(`已将树木 ${createdTree.id} 添加到全局batchCreatedTrees数组`);
            }
          } catch (modelError) {
            logger.error(`使用TreeModel创建树木失败: ${modelError.message}`);
          
            // 备选方案：直接添加到任务列表
            allTrees.push(tree);
            logger.info(`为任务组 ${taskGroup.mainTask.id} 创建了任务树 ${tree.id}（备选方案）`);
            
            // 使用dataStore的方法添加树木
            try {
              const { addTree } = await import('../dataStore.js');
              if (typeof addTree === 'function') {
                addTree(tree);
                logger.info(`树木 ${tree.id} 已使用addTree方法添加到数据存储`);
                
                // 同时确保添加到batchCreatedTrees
                if (global.batchCreatedTrees === undefined) {
                  global.batchCreatedTrees = [];
                }
                if (!global.batchCreatedTrees.some(t => t.id === tree.id)) {
                  global.batchCreatedTrees.push(tree);
                  logger.info(`已将树木 ${tree.id} 添加到全局batchCreatedTrees数组（备选方案）`);
                }
              } else {
                logger.warn(`找不到addTree方法，无法将树木添加到数据存储`);
              }
            } catch (error) {
              logger.error(`导入或使用addTree方法失败: ${error.message}`);
            }
          }
        } else {
          logger.warn(`为任务组 ${taskGroup.mainTask.id} 创建任务树失败`);
        }
      } catch (error) {
        logger.error(`为任务组创建任务树失败: ${error.message}`);
        // 继续处理其他任务组，不中断流程
      }
    }
  } else {
    logger.info('跳过任务树创建，因为createTrees参数为false');
  }
  
  // 将创建的任务添加到内存存储
  allTasks.forEach(task => {
    try {
      if (tasks && Array.isArray(tasks)) {
        tasks.push(task);
      }
    } catch (error) {
      logger.warn(`无法将任务添加到内存存储: ${error.message}`);
    }
  });
  
  // 将创建的树木添加到内存存储
  allTrees.forEach(tree => {
    try {
      if (trees && Array.isArray(trees)) {
        // 确保树木ID格式一致
        if (!tree.id.startsWith('tree-')) {
          tree.id = `tree-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          }
          
        // 确保存在taskId字段
        if (!tree.taskId && tree.mainTaskId) {
          tree.taskId = tree.mainTaskId;
        }
        
        // 添加必要的属性以与系统中的其他树匹配
        if (!tree.position) {
          tree.position = {
            x: Math.random() * 10 - 5,
            y: 0,
            z: Math.random() * 10 - 5
          };
        }
        
        if (!tree.stage && tree.stage !== 0) {
          tree.stage = 0;
        }
        
        if (!tree.healthState) {
          tree.healthState = 100;
        }
        
        // 添加到全局数组，确保不重复
        if (!trees.some(t => t.id === tree.id)) {
          trees.push(tree);
          logger.info(`成功将树木 ${tree.id} 添加到全局存储，关联任务ID: ${tree.taskId || 'None'}`);
        }
        
        // 同时确保添加到batchCreatedTrees
        if (global.batchCreatedTrees === undefined) {
          global.batchCreatedTrees = [];
        }
        if (!global.batchCreatedTrees.some(t => t.id === tree.id)) {
          global.batchCreatedTrees.push(tree);
          logger.info(`已将树木 ${tree.id} 添加到全局batchCreatedTrees数组（从allTrees）`);
        }
      }
    } catch (error) {
      logger.warn(`无法将树木添加到内存存储: ${error.message}`);
    }
  });
  
  // 记录全局batchCreatedTrees的状态
  if (global.batchCreatedTrees) {
    logger.info(`批量创建完成后，全局batchCreatedTrees数组包含 ${global.batchCreatedTrees.length} 棵树`);
    if (global.batchCreatedTrees.length > 0) {
      logger.debug(`第一棵树ID: ${global.batchCreatedTrees[0].id}, taskId: ${global.batchCreatedTrees[0].taskId || global.batchCreatedTrees[0].mainTaskId}`);
    }
  }
  
  logger.info(`批量创建完成: 创建了 ${allTasks.length} 个任务和 ${allTrees.length} 个任务树`);
  
  // 详细记录返回的格式，确保正确性
  logger.debug(`返回的任务组格式示例: ${JSON.stringify(formattedTaskGroups[0], null, 2)}`);
  
  // 确保返回的tasks是formattedTaskGroups而不是allTasks
  const response = {
    tasks: formattedTaskGroups,
    trees: allTrees
  };
  
  // 再次检查并记录最终返回的数据格式
  logger.info(`最终返回 ${response.tasks.length} 个任务组（每组包含主任务和子任务）和 ${response.trees.length} 个树木`);
  
  return response;
}

/**
 * 获取批处理任务的示例
 * @returns {Promise<Object>} 示例批处理任务
 */
async function getBatchedTasks() {
  logger.info(`获取批处理任务示例`);
  
  // 返回当前所有任务的统计信息和最近创建的任务
  const allTasks = tasks;
  const totalCount = allTasks.length;
  const recentTasks = allTasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  return {
    totalTasks: totalCount,
    recentlyCreated: recentTasks,
    message: `系统中共有 ${totalCount} 个任务`
  };
    }

/**
 * 标准化任务状态
 * @param {String} status - 任务状态
 * @returns {String} 标准化后的状态
 * @private
 */
function _normalizeStatus(status) {
  const statusMap = {
    '未开始': 'TODO',
    'NOT_STARTED': 'TODO',
    '进行中': 'IN_PROGRESS',
    '已完成': 'COMPLETED',
    '已取消': 'CANCELLED'
  };
  
  return statusMap[status] || status;
}

/**
 * 将任务类型映射到树木类型
 * @param {String} taskType - 任务类型
 * @returns {String} 树木类型
 * @private
 */
function _mapTaskTypeToTreeType(taskType) {
  const typeMap = {
    'PROJECT': 'REDWOOD',
    'WORK': 'MAPLE',
    'LEARNING': 'PINE',
    'NORMAL': 'OAK',
    'LEISURE': 'PALM'
  };
  
  return typeMap[taskType] || _getRandomTreeType();
  }
  
  /**
   * 获取随机树类型
   * @returns {String} 树类型
   * @private
   */
function _getRandomTreeType() {
  const treeTypes = ['OAK', 'PINE', 'MAPLE', 'CHERRY', 'WILLOW'];
  const randomIndex = Math.floor(Math.random() * treeTypes.length);
  return treeTypes[randomIndex];
}

/**
 * 为任务创建关联的树木
 * @param {Object} task - 任务对象
 * @returns {Promise<Object>} 创建的树木对象
 */
async function createTreeForTask(task) {
  try {
    // 如果任务没有指定树木类型，根据任务类型映射或随机选择一个
    let treeType = task.treeType;
    if (!treeType) {
      treeType = task.type ? _mapTaskTypeToTreeType(task.type) : _getRandomTreeType();
    }
    
    // 日志
    logger.info(`为任务 ${task.id} 创建树木，类型: ${treeType}`);
    
    // 创建树木数据
    const treeData = {
      id: `tree-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: treeType,
      growthStage: 1, // 初始阶段
      name: `${treeType.toLowerCase()}-${task.id}`,
      positionX: Math.random() * 10 - 5, // 随机位置
      positionZ: Math.random() * 10 - 5,
      taskId: task.id,
      createdAt: new Date().toISOString(),
      healthState: 100, // 初始健康状态
    };
    
    // 记录创建的树木
    logger.debug(`创建的树木数据: ${JSON.stringify(treeData)}`);
    
    // 确保全局变量存在
    if (typeof global.getBatchCreatedTrees !== 'function') {
      global._batchCreatedTrees = global._batchCreatedTrees || [];
      global.getBatchCreatedTrees = () => global._batchCreatedTrees;
    }
    
    // 添加到全局变量
    const existingTrees = global.getBatchCreatedTrees() || [];
    existingTrees.push(treeData);
    global._batchCreatedTrees = existingTrees;
    
    // 确保任务对象包含树木ID引用
    task.treeId = treeData.id;
    task.treeType = treeType;
    
    // 更新任务数据
    if (typeof global.getBatchCreatedTasks === 'function') {
      const tasks = global.getBatchCreatedTasks() || [];
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], treeId: treeData.id, treeType };
        global._batchCreatedTasks = tasks;
      }
    }
    
    return treeData;
  } catch (error) {
    logger.error(`创建任务关联树木失败: ${error.message}`, { error, taskId: task.id });
    throw new Error(`创建任务关联树木失败: ${error.message}`);
  }
}

/**
 * 根据任务ID查找关联的树木
 * @param {string|number} taskId - 任务ID
 * @returns {Promise<Object|null>} 找到的树木对象或null
 */
async function findTreeByTaskId(taskId) {
  try {
    logger.debug(`查找任务 ${taskId} 关联的树木`);
    
    // 转为字符串进行比较
    const taskIdStr = String(taskId);
    
    // 尝试从全局变量获取树木列表
    let allTrees = [];
    
    // 1. 检查模块级变量
    if (typeof global.batchCreatedTrees !== 'undefined' && Array.isArray(global.batchCreatedTrees)) {
      logger.debug(`从模块变量获取 ${global.batchCreatedTrees.length} 个树木`);
      allTrees = [...allTrees, ...global.batchCreatedTrees];
    }
    
    // 2. 检查全局获取函数
    if (typeof global.getBatchCreatedTrees === 'function') {
      const globalTrees = global.getBatchCreatedTrees() || [];
      logger.debug(`从全局函数获取 ${globalTrees.length} 个树木`);
      
      // 添加尚未包含的树木
      const existingIds = new Set(allTrees.map(t => t.id));
      globalTrees.forEach(tree => {
        if (!existingIds.has(tree.id)) {
          allTrees.push(tree);
          existingIds.add(tree.id);
        }
      });
    }
    
    // 3. 从 TreeService 获取树木列表
    try {
      // 这里可以添加从其他服务获取树木的逻辑
    } catch (error) {
      logger.warn(`从TreeService获取树木列表失败: ${error.message}`);
    }
    
    // 开始查找匹配的树木
    logger.debug(`开始在 ${allTrees.length} 个树木中查找任务ID为 ${taskIdStr} 的树木`);
    
    // 确保使用字符串比较
    const tree = allTrees.find(tree => String(tree.taskId) === taskIdStr);
    
    if (tree) {
      logger.info(`找到任务 ${taskIdStr} 关联的树木: ${tree.id}, 类型: ${tree.type}`);
      return tree;
    } else {
      logger.warn(`未找到任务 ${taskIdStr} 关联的树木`);
      return null;
    }
  } catch (error) {
    logger.error(`查找任务树木失败: ${error.message}`, { error, taskId });
    return null;
  }
}

/**
 * 根据ID查找任务
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object|null>} 找到的任务或null
 */
async function findTaskById(taskId) {
  // 先在导入的任务数组中查找
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    return task;
  }
  
  // 在批量创建的任务中查找
  let batchTasks = [];
  // 尝试从模块变量获取
  if (Array.isArray(global.batchCreatedTasks)) {
    batchTasks = [...batchTasks, ...global.batchCreatedTasks];
  }
  // 尝试从全局函数获取
  if (typeof global.getBatchCreatedTasks === 'function') {
    const globalTasks = global.getBatchCreatedTasks() || [];
    batchTasks = [...batchTasks, ...globalTasks];
  }
  
  // 在批量创建的任务中查找
  const batchTask = batchTasks.find(t => t.id === taskId);
  if (batchTask) {
    return batchTask;
  }
  
  return null;
}

/**
 * 为任务组创建树结构
 * @param {Object} taskGroup - 任务组，包含主任务和子任务
 * @param {Object} taskGroup.mainTask - 主任务对象
 * @param {Array} taskGroup.subTasks - 子任务数组
 * @returns {Object} 创建的树结构对象
 */
function createTreeForTaskGroup(taskGroup) {
  if (!taskGroup || !taskGroup.mainTask) {
    logger.error('创建树结构失败：任务组缺少主任务');
    return null;
  }

  const mainTask = taskGroup.mainTask;
  const subTasks = taskGroup.subTasks || [];
  
  try {
    // 根据主任务类型确定树的类型
    const taskType = mainTask.type || '一般任务';
    const treeType = getDefaultTreeTypeForTask(taskType);
    
    // 创建树结构对象 - 使用tree-前缀的ID以与现有系统保持一致
    const tree = {
      id: `tree-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${mainTask.title}的任务树`,
      description: `为任务"${mainTask.title}"自动创建的树结构`,
      type: treeType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mainTaskId: mainTask.id,
      taskId: mainTask.id, // 添加taskId字段以便通过taskId查找树木
      // 树的结构
      structure: {
        nodeType: 'root',
        id: uuidv4(),
        label: mainTask.title,
        taskId: mainTask.id,
        children: subTasks.map(subTask => ({
          nodeType: 'task',
          id: uuidv4(),
          label: subTask.title,
          taskId: subTask.id,
          children: []
        }))
      }
    };
    
    logger.info(`为任务"${mainTask.title}"创建了树结构，ID为${tree.id}`);
    return tree;
  } catch (error) {
    logger.error(`为任务组创建树结构失败: ${error.message}`);
    return null;
  }
}

/**
 * 增量批量创建任务
 * 一次创建一部分任务，避免一次性创建过多任务导致性能问题
 * @param {Array} tasksData - 任务数据数组
 * @param {number} batchSize - 每批次创建的任务数量，默认为10
 * @param {function} progressCallback - 进度回调函数
 * @returns {Promise<Object>} 创建结果
 */
async function createBatchTasksIncrementally(tasksData, batchSize = 10, progressCallback = null) {
  try {
    logger.info(`开始增量批量创建任务，总数量: ${tasksData.length}，批次大小: ${batchSize}`);
    
    // 验证输入
    if (!Array.isArray(tasksData) || tasksData.length === 0) {
      throw new Error('无效的任务列表');
    }
    
    const createdTasks = [];
    const createdTrees = [];
    
    // 将任务分成多个批次
    const batches = [];
    for (let i = 0; i < tasksData.length; i += batchSize) {
      batches.push(tasksData.slice(i, i + batchSize));
    }
    
    logger.info(`任务已分为 ${batches.length} 个批次进行处理`);
    
    // 按批次处理任务
    for (let i = 0; i < batches.length; i++) {
      const batchTasks = batches[i];
      
      logger.info(`处理第 ${i + 1}/${batches.length} 批任务，数量: ${batchTasks.length}`);
      
      // 创建当前批次的任务
      const result = await createBatchTasks(batchTasks);
      
      // 合并结果
      createdTasks.push(...result.tasks);
      createdTrees.push(...result.trees);
      
      // 调用进度回调函数
      if (typeof progressCallback === 'function') {
        const progress = ((i + 1) / batches.length) * 100;
        progressCallback({
          currentBatch: i + 1,
          totalBatches: batches.length,
          tasksCreated: createdTasks.length,
          treesCreated: createdTrees.length,
          percentComplete: Math.round(progress)
        });
      }
      
      // 如果不是最后一批，暂停一下以避免过度占用资源
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    logger.info(`增量批量任务创建完成。创建了 ${createdTasks.length} 个任务和 ${createdTrees.length} 个树木`);
    
    return {
      tasks: createdTasks,
      trees: createdTrees
    };
  } catch (error) {
    logger.error(`增量批量创建任务失败: ${error.message}`, { error });
    throw new Error(`增量批量创建任务失败: ${error.message}`);
  }
}

export default {
  createBatchTasks,
  createBatchTasksWithTrees,
  createBatchTasksIncrementally,
  getBatchedTasks,
  findTreeByTaskId,
  findTaskById,
  createTreeForTaskGroup
}; 