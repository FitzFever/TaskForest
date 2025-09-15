/**
 * 开发环境树木控制器
 * 用于提供开发环境下的树木相关API接口
 */
import logger from '../../utils/logger.js';
import { tasks, trees, addTask, addTree } from '../../dataStore.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 获取所有树木
 * @param {import('express').Request} req - 请求对象
 * @param {import('express').Response} res - 响应对象
 */
export function getTrees(req, res) {
  try {
    logger.info('获取树木列表');
    
    const allTrees = [...trees];
    
    // 获取全局批量创建的树木
    if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
      allTrees.push(...global.batchCreatedTrees);
    }
    
    // 去除重复的树木
    const treeMap = new Map();
    allTrees.forEach(tree => {
      treeMap.set(tree.id.toString(), tree);
    });
    
    const uniqueTrees = Array.from(treeMap.values());
    logger.info(`返回树木列表，总数: ${uniqueTrees.length}`);
    
    // 返回前端期望的格式
    res.json({
      code: 200,
      data: {
        trees: uniqueTrees,
        pagination: {
          total: uniqueTrees.length,
          page: 1,
          limit: uniqueTrees.length,
          pages: 1
        }
      },
      message: '获取树木列表成功',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`获取树木列表失败: ${error.message}`);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取树木列表失败',
      timestamp: Date.now()
    });
  }
} 