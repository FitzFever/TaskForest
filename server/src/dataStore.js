/**
 * 内存数据存储
 * 用于存储应用程序运行时的数据
 */

// 任务数组
export const tasks = [];

// 树木数组
export const trees = [];

// 批量创建的任务
export const batchTasks = [];

// 批量创建的树木
export const batchTrees = [];

// 确保全局变量存在
if (typeof global.batchCreatedTasks === 'undefined') {
  global.batchCreatedTasks = [];
}

if (typeof global.batchCreatedTrees === 'undefined') {
  global.batchCreatedTrees = [];
}

// 存储批量创建的任务树的函数
export function storeBatchCreatedData(createdTasks, createdTrees) {
  console.log(`存储批量创建的数据: ${createdTasks.length}个任务, ${createdTrees.length}个树木`);
  
  // 存储任务
  if (Array.isArray(createdTasks)) {
    createdTasks.forEach(task => {
      if (!global.batchCreatedTasks.some(t => t.id === task.id)) {
        global.batchCreatedTasks.push(task);
      }
    });
  }
  
  // 存储树木
  if (Array.isArray(createdTrees)) {
    createdTrees.forEach(tree => {
      if (!global.batchCreatedTrees.some(t => t.id === tree.id)) {
        global.batchCreatedTrees.push(tree);
      }
      
      // 同时添加到全局trees数组
      if (!trees.some(t => t.id === tree.id)) {
        trees.push(tree);
        console.log(`树木 ${tree.id} 已添加到全局trees数组`);
      } else {
        console.log(`树木 ${tree.id} 已存在于全局trees数组中`);
      }
    });
  }
  
  console.log(`存储后: 全局batchCreatedTasks数量=${global.batchCreatedTasks.length}, batchCreatedTrees数量=${global.batchCreatedTrees.length}, 全局trees数量=${trees.length}`);
  return { success: true };
}

// 添加任务到存储
export function addTask(task) {
  if (!task || !task.id) {
    console.warn('无效的任务对象');
    return false;
  }
  
  tasks.push(task);
  return true;
}

// 添加树木到存储
export function addTree(tree) {
  if (!tree || !tree.id) {
    console.warn('无效的树木对象');
    return false;
  }
  
  // 确保树木有必要的属性
  const processedTree = {
    ...tree,
    // 如果是UUID格式，转换为tree-前缀格式
    id: tree.id.startsWith('tree-') ? tree.id : `tree-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    // 确保有taskId
    taskId: tree.taskId || tree.mainTaskId,
    // 确保有基本属性
    position: tree.position || { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
    rotation: tree.rotation || { x: 0, y: 0, z: 0 },
    scale: tree.scale || { x: 1, y: 1, z: 1 },
    stage: tree.stage || 0,
    healthState: tree.healthState || 100,
    createdAt: tree.createdAt || new Date().toISOString(),
    updatedAt: tree.updatedAt || new Date().toISOString()
  };
  
  console.log(`添加树木到全局存储: ID=${processedTree.id}, taskId=${processedTree.taskId}`);
  
  // 添加到trees数组前先检查是否已存在
  if (!trees.some(t => t.id === processedTree.id)) {
    trees.push(processedTree);
    console.log(`树木 ${processedTree.id} 已添加到全局trees数组`);
  } else {
    console.log(`树木 ${processedTree.id} 已存在于全局trees数组中`);
  }
  
  // 同时添加到batchCreatedTrees
  if (!global.batchCreatedTrees.some(t => t.id === processedTree.id)) {
    global.batchCreatedTrees.push(processedTree);
    console.log(`树木 ${processedTree.id} 已添加到 global.batchCreatedTrees`);
  } else {
    console.log(`树木 ${processedTree.id} 已存在于 global.batchCreatedTrees 中`);
  }
  
  return true;
}

// 打印当前存储状态（调试用）
export function printStoreStatus() {
  console.log(`====== 数据存储状态 ======`);
  console.log(`任务数量: ${tasks.length}`);
  console.log(`树木数量: ${trees.length}`);
  console.log(`全局批量任务数量: ${global.batchCreatedTasks ? global.batchCreatedTasks.length : 'undefined'}`);
  console.log(`全局批量树木数量: ${global.batchCreatedTrees ? global.batchCreatedTrees.length : 'undefined'}`);
  
  if (trees.length > 0) {
    console.log(`\n树木ID列表:`);
    trees.forEach((tree, index) => {
      console.log(`${index+1}. ${tree.id} - 关联任务ID: ${tree.taskId || '无'}`);
    });
  }
  
  if (global.batchCreatedTrees && global.batchCreatedTrees.length > 0) {
    console.log(`\n批量创建的树木ID列表:`);
    global.batchCreatedTrees.forEach((tree, index) => {
      console.log(`${index+1}. ${tree.id} - 关联任务ID: ${tree.taskId || tree.mainTaskId || '无'}`);
    });
  }
  
  console.log(`========================`);
}

// 根据ID查找任务
export function findTaskById(taskId) {
  return tasks.find(task => task.id === taskId);
}

// 根据ID查找树木
export function findTreeById(treeId) {
  return trees.find(tree => tree.id === treeId);
}

// 根据任务ID查找树木
export function findTreeByTaskId(taskId) {
  if (!taskId) return null;
  
  // 确保使用字符串比较
  const taskIdStr = String(taskId);
  
  // 先尝试在全局trees中查找
  const treeInGlobal = trees.find(tree => 
    (tree.taskId && String(tree.taskId) === taskIdStr) || 
    (tree.mainTaskId && String(tree.mainTaskId) === taskIdStr)
  );
  
  if (treeInGlobal) {
    console.log(`在全局trees中找到任务ID=${taskId}的树木: ${treeInGlobal.id}`);
    return treeInGlobal;
  }
  
  // 如果全局中没有，尝试在batchCreatedTrees中查找
  if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
    const treeInBatch = global.batchCreatedTrees.find(tree => 
      (tree.taskId && String(tree.taskId) === taskIdStr) || 
      (tree.mainTaskId && String(tree.mainTaskId) === taskIdStr)
    );
    
    if (treeInBatch) {
      console.log(`在batchCreatedTrees中找到任务ID=${taskId}的树木: ${treeInBatch.id}`);
      return treeInBatch;
    }
  }
  
  console.log(`未找到任务ID=${taskId}的树木`);
  return null;
}

// 获取所有任务
export function getAllTasks() {
  return [...tasks];
}

// 获取所有树木
export function getAllTrees() {
  // 合并全局trees和batchCreatedTrees
  const allTrees = [...trees];
  
  // 添加batch创建的树木，避免重复
  if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
    global.batchCreatedTrees.forEach(tree => {
      if (!allTrees.some(t => t.id === tree.id)) {
        allTrees.push(tree);
      }
    });
  }
  
  // 使用Map对树木进行去重（基于ID）
  const uniqueTreesMap = new Map();
  allTrees.forEach(tree => {
    if (tree && tree.id) {
      uniqueTreesMap.set(tree.id, tree);
    }
  });
  
  // 从Map中提取唯一的树木
  const uniqueTrees = Array.from(uniqueTreesMap.values());
  
  // 过滤掉没有关联任务ID的树木
  const validTrees = uniqueTrees.filter(tree => {
    const hasTaskId = Boolean(tree.taskId || tree.mainTaskId);
    if (!hasTaskId) {
      console.log(`[DataStore] 过滤掉没有任务ID的树木: ${tree.id}`);
    }
    return hasTaskId;
  });
  
  console.log(`[DataStore] getAllTrees: 总共找到 ${allTrees.length} 棵树，去重后 ${uniqueTrees.length} 棵，过滤后返回 ${validTrees.length} 棵有效的树`);
  return validTrees;
}

// 清空所有数据
export function clearAllData() {
  tasks.length = 0;
  trees.length = 0;
  batchTasks.length = 0;
  batchTrees.length = 0;
  
  if (global.batchCreatedTasks) {
    global.batchCreatedTasks.length = 0;
  }
  
  if (global.batchCreatedTrees) {
    global.batchCreatedTrees.length = 0;
  }
}

// 导出默认对象
export default {
  tasks,
  trees,
  batchTasks,
  batchTrees,
  addTask,
  addTree,
  findTaskById,
  findTreeById,
  findTreeByTaskId,
  getAllTasks,
  getAllTrees,
  clearAllData,
  printStoreStatus,
  storeBatchCreatedData
}; 