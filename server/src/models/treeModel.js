/**
 * 树木模型
 * 提供树木数据的管理和操作功能
 */
import { v4 as uuidv4 } from 'uuid';
import { trees } from '../dataStore.js';

/**
 * 树木类型枚举
 */
export const TreeType = {
  OAK: 'OAK',
  MAPLE: 'MAPLE',
  PINE: 'PINE',
  WILLOW: 'WILLOW',
  APPLE: 'APPLE',
  PALM: 'PALM',
  REDWOOD: 'REDWOOD'
};

/**
 * 创建树木
 * @param {Object} treeData - 树木数据
 * @returns {Object} 创建的树木
 */
export function createTree(treeData) {
  if (!treeData) {
    throw new Error('树木数据不能为空');
  }

  const now = new Date().toISOString();
  
  // 创建新树木对象
  const newTree = {
    id: treeData.id || `tree-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: treeData.type || TreeType.OAK,
    name: treeData.name || `${treeData.type || TreeType.OAK} 树`,
    taskId: treeData.taskId || treeData.mainTaskId,
    position: treeData.position || {
      x: Math.random() * 10 - 5,
      y: 0, 
      z: Math.random() * 10 - 5
    },
    rotation: treeData.rotation || { x: 0, y: 0, z: 0 },
    scale: treeData.scale || { x: 1, y: 1, z: 1 },
    stage: treeData.stage || 0,
    growthStage: treeData.growthStage || 'SEEDLING',
    healthState: treeData.healthState || 100,
    mainTaskId: treeData.mainTaskId,
    createdAt: treeData.createdAt || now,
    updatedAt: treeData.updatedAt || now,
    lastGrowth: treeData.lastGrowth || now,
    structure: treeData.structure
  };
  
  // 添加到树木数组
  trees.push(newTree);
  
  console.log(`[TreeModel] 树木已创建: ID=${newTree.id}, taskId=${newTree.taskId}`);
  
  return newTree;
}

/**
 * 获取所有树木
 * @returns {Array} 树木列表
 */
export function getAllTrees() {
  const allTrees = [...trees];
  
  // 添加批量创建的树木（如果存在）
  if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
    console.log(`getAllTrees: 在global.batchCreatedTrees中发现 ${global.batchCreatedTrees.length} 棵树`);
    
    global.batchCreatedTrees.forEach(tree => {
      // 避免重复添加
      if (!allTrees.some(t => t.id === tree.id)) {
        allTrees.push(tree);
      }
    });
  }
  
  console.log(`getAllTrees: 总共返回 ${allTrees.length} 棵树`);
  return allTrees;
}

/**
 * 根据ID获取树木
 * @param {string} id - 树木ID
 * @returns {Object|null} 树木对象
 */
export function getTreeById(id) {
  return trees.find(tree => tree.id === id) || null;
}

/**
 * 根据任务ID获取树木
 * @param {string} taskId - 任务ID
 * @returns {Object|null} 树木对象
 */
export function getTreeByTaskId(taskId) {
  if (!taskId) return null;
  
  console.log(`【树木查询】查找任务ID为 ${taskId} 的树木`);
  
  // 检查全局trees数组
  const globalTrees = [...trees];
  console.log(`【树木查询】总树木数量: ${globalTrees.length}, 查找taskId: ${taskId}`);
  
  // 记录所有树木的taskId，用于调试
  if (globalTrees.length > 0) {
    console.log(`【树木查询】所有树木的taskId列表: ${globalTrees.map(t => t.taskId).join(', ')}`);
  }
  
  // 先检查taskId字段
  const treeByTaskId = globalTrees.find(tree => 
    tree && tree.taskId && String(tree.taskId) === String(taskId)
  );
  if (treeByTaskId) {
    console.log(`【树木查询】找到匹配taskId的树木: ${treeByTaskId.id}`);
    return treeByTaskId;
  }
  
  // 再检查mainTaskId字段
  const treeByMainTaskId = globalTrees.find(tree => 
    tree && tree.mainTaskId && String(tree.mainTaskId) === String(taskId)
  );
  if (treeByMainTaskId) {
    console.log(`【树木查询】找到匹配mainTaskId的树木: ${treeByMainTaskId.id}`);
    return treeByMainTaskId;
  }
  
  // 如果在全局数组中找不到，检查是否有批量创建的树木
  if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
    console.log(`【树木查询】检查批量创建的树木数组，长度: ${global.batchCreatedTrees.length}`);
    
    // 检查批量创建的树木
    const batchTree = global.batchCreatedTrees.find(tree => 
      (tree && tree.taskId && String(tree.taskId) === String(taskId)) || 
      (tree && tree.mainTaskId && String(tree.mainTaskId) === String(taskId))
    );
    
    if (batchTree) {
      console.log(`【树木查询】在批量创建的树木中找到匹配的树木: ${batchTree.id}`);
      return batchTree;
    }
  }
  
  console.log(`【树木查询】未找到任务ID为 ${taskId} 的树木`);
  return null;
}

/**
 * 更新树木
 * @param {string} id - 树木ID
 * @param {Object} updateData - 更新的数据
 * @returns {Object|null} 更新后的树木对象
 */
export function updateTree(id, updateData) {
  const index = trees.findIndex(tree => tree.id === id);
  
  if (index === -1) {
    return null;
  }
  
  trees[index] = {
    ...trees[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  return trees[index];
}

/**
 * 删除树木
 * @param {string} id - 树木ID
 * @returns {boolean} 删除成功返回true
 */
export function deleteTree(id) {
  const index = trees.findIndex(tree => tree.id === id);
  
  if (index === -1) {
    return false;
  }
  
  trees.splice(index, 1);
  return true;
}

export default {
  createTree,
  getAllTrees,
  getTreeById,
  getTreeByTaskId,
  updateTree,
  deleteTree,
  TreeType
};
