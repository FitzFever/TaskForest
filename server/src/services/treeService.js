import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * 树木类型枚举
 * @enum {string}
 */
export const TreeType = {
  OAK: 'OAK',        // 橡树 - 普通工作任务
  MAPLE: 'MAPLE',    // 枫树 - 创意任务
  PINE: 'PINE',      // 松树 - 学习任务
  REDWOOD: 'REDWOOD', // 红杉 - 项目任务
  WILLOW: 'WILLOW'   // 柳树 - 生活任务
};

/**
 * 生长阶段枚举
 * @enum {string}
 */
export const GrowthStage = {
  SEED: 'SEED',            // 种子
  SEEDLING: 'SEEDLING',    // 幼苗
  SAPLING: 'SAPLING',      // 树苗
  YOUNG: 'YOUNG',          // 小树
  MATURE: 'MATURE',        // 成熟树
  FLOWERING: 'FLOWERING'   // 开花/结果
};

/**
 * 树木服务 - 处理与树木相关的操作
 */
class TreeService {
  constructor() {
    // 模拟数据库存储
    this.trees = new Map();
  }

  /**
   * 创建新树木
   * @param {Object} treeData - 树木数据
   * @returns {Promise<Object>} 创建的树木
   */
  async createTree(treeData) {
    try {
      logger.info(`TreeService - 开始创建树 - TaskId: ${treeData.taskId}, 类型: ${treeData.type}`, { treeData });
      
      // 确保必要的字段存在
      if (!treeData.taskId) {
        logger.error('创建树失败 - 缺少必要的taskId字段');
        throw new Error('创建树失败: 缺少必要的taskId字段');
      }
      
      // 创建树
      const tree = await this.treeRepository.createTree({
        id: treeData.id || uuidv4(),
        name: treeData.name || `${treeData.type || '默认'}树`,
        type: treeData.type || this._getRandomTreeType(),
        taskId: treeData.taskId,
        growthStage: treeData.growthStage || 0,
        health: treeData.health || 100
      });
      
      logger.info(`TreeService - 树创建成功 - ID: ${tree.id}, 名称: ${tree.name}, 关联任务ID: ${tree.taskId}`);
      return tree;
    } catch (error) {
      logger.error(`TreeService - 创建树失败: ${error.message}`, { 
        error, 
        treeData,
        stack: error.stack 
      });
      throw new Error(`创建树失败: ${error.message}`);
    }
  }

  /**
   * 获取树木详情
   * @param {string} treeId - 树木ID
   * @returns {Promise<Object>} 树木详情
   */
  async getTree(treeId) {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`树木不存在: ${treeId}`);
    }
    return tree;
  }

  /**
   * 根据任务ID获取树木
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 树木详情
   */
  async getTreeByTaskId(taskId) {
    for (const tree of this.trees.values()) {
      if (tree.taskId === taskId) {
        return tree;
      }
    }
    return null;
  }

  /**
   * 获取主树木（没有父树木的树木）
   * @returns {Promise<Array>} 主树木列表
   */
  async getMainTrees() {
    const mainTrees = [];
    for (const tree of this.trees.values()) {
      if (!tree.parentTreeId) {
        mainTrees.push(tree);
      }
    }
    return mainTrees;
  }

  /**
   * 获取子树木列表
   * @param {string} parentTreeId - 父树木ID
   * @returns {Promise<Array>} 子树木列表
   */
  async getSubTrees(parentTreeId) {
    const subTrees = [];
    for (const tree of this.trees.values()) {
      if (tree.parentTreeId === parentTreeId) {
        subTrees.push(tree);
      }
    }
    return subTrees;
  }

  /**
   * 更新树木健康状态
   * @param {string} treeId - 树木ID
   * @param {number} health - 新健康值
   * @returns {Promise<Object>} 更新后的树木
   */
  async updateTreeHealth(treeId, health) {
    const tree = await this.getTree(treeId);
    
    tree.health = Math.max(0, Math.min(100, health)); // 限制在0-100之间
    tree.updatedAt = new Date().toISOString();
    
    // 根据健康值调整生长阶段
    tree.growthStage = this.calculateGrowthStage(tree);
    
    this.trees.set(treeId, tree);
    logger.info(`树木健康已更新: ${treeId} - 健康值: ${tree.health}`);
    
    return tree;
  }

  /**
   * 更新树木生长阶段
   * @param {string} treeId - 树木ID
   * @param {string} growthStage - 新生长阶段
   * @returns {Promise<Object>} 更新后的树木
   */
  async updateGrowthStage(treeId, growthStage) {
    const tree = await this.getTree(treeId);
    
    if (!Object.values(GrowthStage).includes(growthStage)) {
      throw new Error(`无效的生长阶段: ${growthStage}`);
    }
    
    tree.growthStage = growthStage;
    tree.updatedAt = new Date().toISOString();
    
    this.trees.set(treeId, tree);
    logger.info(`树木生长阶段已更新: ${treeId} - 阶段: ${growthStage}`);
    
    return tree;
  }

  /**
   * 更新树木位置
   * @param {string} treeId - 树木ID
   * @param {Object} position - 新位置坐标
   * @returns {Promise<Object>} 更新后的树木
   */
  async updateTreePosition(treeId, position) {
    const tree = await this.getTree(treeId);
    
    tree.position = position;
    tree.updatedAt = new Date().toISOString();
    
    this.trees.set(treeId, tree);
    logger.info(`树木位置已更新: ${treeId}`);
    
    return tree;
  }

  /**
   * 计算生长阶段
   * @param {Object} tree - 树木对象
   * @returns {string} 生长阶段
   * @private
   */
  calculateGrowthStage(tree) {
    const age = new Date() - new Date(tree.createdAt);
    const ageInDays = age / (1000 * 60 * 60 * 24);
    const health = tree.health;
    
    // 基于树龄和健康值计算生长阶段
    if (health < 20) {
      return GrowthStage.SEED;
    } else if (ageInDays < 1 || health < 40) {
      return GrowthStage.SEEDLING;
    } else if (ageInDays < 3 || health < 60) {
      return GrowthStage.SAPLING;
    } else if (ageInDays < 7 || health < 80) {
      return GrowthStage.YOUNG;
    } else if (ageInDays < 14 || health < 95) {
      return GrowthStage.MATURE;
    } else {
      return GrowthStage.FLOWERING;
    }
  }

  /**
   * 根据任务类型获取推荐的树木类型
   * @param {string} taskType - 任务类型
   * @returns {string} 树木类型
   */
  getRecommendedTreeType(taskType) {
    const typeMap = {
      'PROJECT': TreeType.REDWOOD,
      'WORK': TreeType.OAK,
      'LEARNING': TreeType.PINE,
      'CREATIVE': TreeType.MAPLE,
      'LEISURE': TreeType.WILLOW,
      'TASK': TreeType.OAK
    };
    
    return typeMap[taskType] || TreeType.OAK;
  }
}

export const treeService = new TreeService();
export default treeService; 