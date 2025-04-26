import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { trees } from '../dataStore.js';

// 使用兼容ES模块的方式导入PrismaClient
let PrismaClient = null;
let prisma = null;

try {
  // 动态导入@prisma/client
  const hasPrisma = await import('@prisma/client').catch(() => false);
  
  if (hasPrisma) {
    PrismaClient = hasPrisma.PrismaClient;
    // 初始化Prisma客户端
    try {
      prisma = new PrismaClient();
      logger.info('PrismaClient初始化成功');
    } catch (error) {
      logger.error(`初始化PrismaClient失败: ${error.message}`);
      prisma = null;
    }
  } else {
    logger.warn('未找到@prisma/client模块，将使用内存存储');
  }
} catch (error) {
  logger.warn(`Prisma导入失败: ${error.message}，将使用内存存储`);
}

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
    // 使用全局树木存储
    this.treesMap = new Map();
    
    // 初始化treesMap
    this.initTreesMap();
  }
  
  /**
   * 从全局树木数组初始化树木Map
   * @private
   */
  initTreesMap() {
    trees.forEach(tree => {
      this.treesMap.set(tree.id, tree);
    });
    logger.info(`从全局数据存储初始化了 ${this.treesMap.size} 个树木`);
  }
  
  /**
   * 将树木Map同步到全局树木数组
   * @private
   */
  syncTreesToGlobal() {
    try {
      console.log(`[TreeService] 开始同步树木数据到全局存储，当前Map中有 ${this.treesMap.size} 棵树`);
      console.log(`[TreeService] 同步前全局数组中有 ${trees.length} 棵树`);
      
      if (!Array.isArray(trees)) {
        console.error('[TreeService] 全局trees不是数组，无法同步');
        return;
      }
      
      // 清空全局树木数组
      trees.length = 0;
      
      // 将所有树木添加到全局数组
      const allTrees = Array.from(this.treesMap.values());
      allTrees.forEach(tree => {
        // 确保树对象有效
        if (tree && tree.id) {
          trees.push({...tree}); // 使用解构赋值创建副本
        } else {
          console.warn(`[TreeService] 跳过无效树对象:`, tree);
        }
      });
      
      console.log(`[TreeService] 同步完成，全局数组现在有 ${trees.length} 棵树`);
      
      // 验证同步结果
      if (trees.length !== this.treesMap.size) {
        console.warn(`[TreeService] 同步后全局树木数量(${trees.length})与Map中树木数量(${this.treesMap.size})不匹配`);
      }
      
      // 确保全局变量batchCreatedTrees也被更新（如果存在）
      if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
        // 清除已有的树木条目
        const existingIds = new Set(global.batchCreatedTrees.map(t => t.id));
        
        // 将新树木添加到全局变量（避免重复）
        allTrees.forEach(tree => {
          if (!existingIds.has(tree.id)) {
            global.batchCreatedTrees.push({...tree});
            existingIds.add(tree.id);
          }
        });
        
        console.log(`[TreeService] 更新全局变量batchCreatedTrees，现在有 ${global.batchCreatedTrees.length} 棵树`);
      }
    } catch (error) {
      console.error(`[TreeService] 同步树木到全局存储时出错:`, error);
    }
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
      const tree = {
        id: treeData.id || uuidv4(),
        name: treeData.name || `${treeData.type || '默认'}树`,
        type: treeData.type || this._getRandomTreeType(),
        taskId: treeData.taskId,
        growthStage: treeData.growthStage || 0,
        health: treeData.health || 100,
        // 添加parentTreeId字段
        parentTreeId: treeData.parentTreeId || null,
        // 添加位置信息
        position: treeData.position || {
          x: Math.floor(Math.random() * 20) - 10,  // -10到10之间
          y: 0,
          z: Math.floor(Math.random() * 20) - 10   // -10到10之间
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`[TreeService] 创建树木: ID=${tree.id}, 类型=${tree.type}, 任务ID=${tree.taskId}`);
      
      // 存储树木到Map
      this.treesMap.set(tree.id, tree);
      
      // 同步到全局树木数组
      this.syncTreesToGlobal();
      
      // 手动确保树木添加到全局数组
      if (!trees.some(t => t.id === tree.id)) {
        console.log(`[TreeService] 发现树木未添加到全局数组，手动添加: ${tree.id}`);
        trees.push(tree);
      }
      
      // 同步到开发环境数据中的trees数组 (devData.js)
      try {
        // 尝试同步到batchCreatedTrees
        if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
          if (!global.batchCreatedTrees.some(t => t.id === tree.id)) {
            console.log(`[TreeService] 同步树木到global.batchCreatedTrees: ${tree.id}`);
            global.batchCreatedTrees.push({...tree});
          }
        }
        
        // 尝试通过访问dev数据的方式来同步
        if (typeof global.addTreeToDevData === 'function') {
          console.log(`[TreeService] 通过global.addTreeToDevData同步树木: ${tree.id}`);
          global.addTreeToDevData(tree);
        }
        
        // 尝试动态导入devData模块 (备用方案)
        try {
          const devDataPath = '../../data/devData.js';
          import(devDataPath).then(devData => {
            if (devData && devData.trees && Array.isArray(devData.trees)) {
              if (!devData.trees.some(t => t.id === tree.id)) {
                console.log(`[TreeService] 通过动态导入同步树木到devData.trees: ${tree.id}`);
                devData.trees.push({...tree});
              }
            }
          }).catch(err => {
            console.error(`[TreeService] 动态导入devData失败: ${err.message}`);
          });
        } catch (importError) {
          console.error(`[TreeService] 尝试导入devData模块失败: ${importError.message}`);
        }
      } catch (syncError) {
        console.error(`[TreeService] 同步树木到开发环境数据失败: ${syncError.message}`);
      }
      
      // 打印全局树木数组信息
      console.log(`[TreeService] 全局树木数组现在包含 ${trees.length} 棵树`);
      console.log(`[TreeService] 树木Map现在包含 ${this.treesMap.size} 棵树`);
      
      if (tree.parentTreeId) {
        logger.info(`TreeService - 树创建成功 - ID: ${tree.id}, 名称: ${tree.name}, 关联任务ID: ${tree.taskId}, 父树ID: ${tree.parentTreeId}`);
      } else {
        logger.info(`TreeService - 树创建成功 - ID: ${tree.id}, 名称: ${tree.name}, 关联任务ID: ${tree.taskId}`);
      }
      
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
    const tree = this.treesMap.get(treeId);
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
    for (const tree of this.treesMap.values()) {
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
    for (const tree of this.treesMap.values()) {
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
    for (const tree of this.treesMap.values()) {
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
    
    this.treesMap.set(treeId, tree);
    
    // 同步到全局树木数组
    this.syncTreesToGlobal();
    
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
    
    this.treesMap.set(treeId, tree);
    
    // 同步到全局树木数组
    this.syncTreesToGlobal();
    
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
    
    this.treesMap.set(treeId, tree);
    
    // 同步到全局树木数组
    this.syncTreesToGlobal();
    
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

  /**
   * 获取随机树木类型
   * @returns {string} 随机的树木类型
   * @private
   */
  _getRandomTreeType() {
    const treeTypes = ['松树', '橡树', '枫树', '樱花树', '柳树'];
    return treeTypes[Math.floor(Math.random() * treeTypes.length)];
  }
}

const treeService = new TreeService();
export default treeService; 