/**
 * 清理工具 - 用于删除系统默认示例数据
 */
import { trees, tasks } from '../dataStore.js';
import logger from './logger.js';

/**
 * 清理默认示例数据
 * 删除ID以'tree-'开头且数字小于2000的树木和相应的任务
 */
export function cleanupDefaultData() {
  try {
    logger.info('开始清理默认示例数据...');
    
    // 识别默认树木（ID为tree-1001到tree-1999）
    const defaultTreePattern = /^tree-([1-9]|[1-9][0-9]|1[0-9]{2}|1999)$/;
    const isDefaultTree = id => defaultTreePattern.test(id) || /^tree-1[0-9]{3}$/.test(id);
    
    // 找出所有默认树木
    const defaultTrees = trees.filter(tree => isDefaultTree(tree.id));
    
    if (defaultTrees.length === 0) {
      logger.info('未找到默认示例树木数据');
      return { 
        success: true, 
        message: '未找到需要清理的默认数据',
        treesRemoved: 0,
        tasksRemoved: 0
      };
    }
    
    // 收集相关联的任务ID
    const relatedTaskIds = defaultTrees.map(tree => tree.taskId).filter(Boolean);
    
    // 删除默认树木
    let initialTreeCount = trees.length;
    
    // 使用filter原地更新数组
    let index = trees.length;
    while (index--) {
      if (isDefaultTree(trees[index].id)) {
        trees.splice(index, 1);
      }
    }
    
    // 删除关联的默认任务
    let initialTaskCount = tasks.length;
    
    // 使用filter原地更新数组
    index = tasks.length;
    while (index--) {
      if (relatedTaskIds.includes(tasks[index].id)) {
        tasks.splice(index, 1);
      }
    }
    
    // 从全局批量创建的树木中也删除默认树
    if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
      const initialBatchCount = global.batchCreatedTrees.length;
      
      index = global.batchCreatedTrees.length;
      while (index--) {
        if (isDefaultTree(global.batchCreatedTrees[index].id)) {
          global.batchCreatedTrees.splice(index, 1);
        }
      }
      
      logger.info(`从全局批量创建的树木中删除了 ${initialBatchCount - global.batchCreatedTrees.length} 棵默认树`);
    }
    
    const treesRemoved = initialTreeCount - trees.length;
    const tasksRemoved = initialTaskCount - tasks.length;
    
    logger.info(`清理完成：删除了 ${treesRemoved} 棵默认树和 ${tasksRemoved} 个相关任务`);
    
    return {
      success: true,
      message: `成功清理默认数据`,
      treesRemoved,
      tasksRemoved
    };
  } catch (error) {
    logger.error(`清理默认数据时出错: ${error.message}`, { error });
    return {
      success: false,
      message: `清理失败: ${error.message}`,
      error
    };
  }
}

export default {
  cleanupDefaultData
}; 