/**
 * 树木健康状态相关的路由处理
 */
import express from 'express';
import { trees } from '../dataStore.js';

const router = express.Router();

/**
 * 获取树木健康状态
 * @route GET /api/tree-health/:treeId
 */
router.get('/:treeId', (req, res) => {
  try {
    const { treeId } = req.params;
    
    if (!treeId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const tree = trees.find(t => t.id === treeId);
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 计算健康状态类别
    let healthCategory;
    const healthValue = tree.health;
    
    if (healthValue >= 75) {
      healthCategory = 'HEALTHY';
    } else if (healthValue >= 50) {
      healthCategory = 'SLIGHTLY_WILTED';
    } else if (healthValue >= 25) {
      healthCategory = 'MODERATELY_WILTED';
    } else {
      healthCategory = 'SEVERELY_WILTED';
    }
    
    // 模拟健康趋势（在实际应用中应该基于历史数据）
    const healthTrend = Math.random() > 0.5 ? 'IMPROVING' : 'DECLINING';
    
    const healthStatus = {
      treeId: tree.id,
      currentHealth: tree.health,
      healthCategory,
      healthTrend,
      lastUpdated: tree.updatedAt,
      taskId: tree.taskId,
      taskProgress: Math.floor(Math.random() * 100), // 模拟任务进度
      environmentFactors: tree.environmentFactors
    };
    
    return res.status(200).json({
      code: 200,
      data: healthStatus,
      message: '获取树木健康状态成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取树木健康状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取树木健康状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 更新树木健康状态
 * @route PUT /api/tree-health/:treeId
 */
router.put('/:treeId', (req, res) => {
  try {
    const { treeId } = req.params;
    const { health, environmentFactors } = req.body;
    
    if (!treeId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const treeIndex = trees.findIndex(t => t.id === treeId);
    
    if (treeIndex === -1) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 验证健康值是否有效
    if (health !== undefined && (health < 0 || health > 100)) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '健康值必须在0到100之间',
          details: {
            field: 'health',
            value: health,
            allowed: '0-100'
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 更新树木健康状态
    const updatedTree = { ...trees[treeIndex] };
    
    if (health !== undefined) {
      updatedTree.health = health;
    }
    
    if (environmentFactors) {
      // 验证环境因素
      const { sunlight, water, nutrients } = environmentFactors;
      
      if (sunlight !== undefined) {
        if (sunlight < 0 || sunlight > 100) {
          return res.status(400).json({
            code: 400,
            data: null,
            error: { 
              message: '阳光值必须在0到100之间',
              details: {
                field: 'environmentFactors.sunlight',
                value: sunlight,
                allowed: '0-100'
              }
            },
            message: 'Bad Request',
            timestamp: Date.now()
          });
        }
        updatedTree.environmentFactors.sunlight = sunlight;
      }
      
      if (water !== undefined) {
        if (water < 0 || water > 100) {
          return res.status(400).json({
            code: 400,
            data: null,
            error: { 
              message: '水分值必须在0到100之间',
              details: {
                field: 'environmentFactors.water',
                value: water,
                allowed: '0-100'
              }
            },
            message: 'Bad Request',
            timestamp: Date.now()
          });
        }
        updatedTree.environmentFactors.water = water;
      }
      
      if (nutrients !== undefined) {
        if (nutrients < 0 || nutrients > 100) {
          return res.status(400).json({
            code: 400,
            data: null,
            error: { 
              message: '营养值必须在0到100之间',
              details: {
                field: 'environmentFactors.nutrients',
                value: nutrients,
                allowed: '0-100'
              }
            },
            message: 'Bad Request',
            timestamp: Date.now()
          });
        }
        updatedTree.environmentFactors.nutrients = nutrients;
      }
    }
    
    updatedTree.updatedAt = new Date().toISOString();
    trees[treeIndex] = updatedTree;
    
    // 计算健康状态类别
    let healthCategory;
    const healthValue = updatedTree.health;
    
    if (healthValue >= 75) {
      healthCategory = 'HEALTHY';
    } else if (healthValue >= 50) {
      healthCategory = 'SLIGHTLY_WILTED';
    } else if (healthValue >= 25) {
      healthCategory = 'MODERATELY_WILTED';
    } else {
      healthCategory = 'SEVERELY_WILTED';
    }
    
    const healthStatus = {
      treeId: updatedTree.id,
      currentHealth: updatedTree.health,
      healthCategory,
      healthTrend: 'STABLE', // 默认为稳定
      lastUpdated: updatedTree.updatedAt,
      taskId: updatedTree.taskId,
      environmentFactors: updatedTree.environmentFactors
    };
    
    return res.status(200).json({
      code: 200,
      data: healthStatus,
      message: '更新树木健康状态成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新树木健康状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新树木健康状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 任务进度对树木健康的影响
 * @route PUT /api/tree-health/task-progress/:taskId
 */
router.put('/task-progress/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const { progress } = req.body;
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '进度值必须在0到100之间',
          details: {
            field: 'progress',
            value: progress,
            allowed: '0-100'
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 查找与任务关联的树木
    const treeIndex = trees.findIndex(t => t.taskId === taskId);
    
    if (treeIndex === -1) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '没有找到与此任务关联的树木' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 更新树木的健康值，基于任务进度
    const updatedTree = { ...trees[treeIndex] };
    const newHealth = Math.min(100, Math.max(0, 50 + progress * 0.5));
    updatedTree.health = newHealth;
    updatedTree.growthProgress = progress;
    
    // 根据进度更新生长阶段
    if (progress >= 75) {
      updatedTree.growthStage = 'mature';
    } else if (progress >= 50) {
      updatedTree.growthStage = 'growing';
    } else if (progress >= 25) {
      updatedTree.growthStage = 'sapling';
    } else {
      updatedTree.growthStage = 'seed';
    }
    
    updatedTree.updatedAt = new Date().toISOString();
    trees[treeIndex] = updatedTree;
    
    return res.status(200).json({
      code: 200,
      data: {
        taskId,
        progress,
        treeId: updatedTree.id,
        currentHealth: updatedTree.health,
        growthStage: updatedTree.growthStage,
        growthProgress: updatedTree.growthProgress
      },
      message: '任务进度更新成功，树木健康状态已更新',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新任务进度与树木健康状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新任务进度与树木健康状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 批量更新所有树木的健康状态
 * @route POST /api/tree-health/batch-update
 */
router.post('/batch-update', (req, res) => {
  try {
    // 假设这个API会基于某些规则批量更新所有树木的健康状态
    // 例如，模拟环境变化、时间流逝等因素对树木健康的影响
    
    const updatedTrees = trees.map(tree => {
      // 简单模拟：随机微调健康状态，在实际应用中应该有更复杂的算法
      const healthChange = Math.floor(Math.random() * 10) - 5; // -5到+5的随机变化
      const newHealth = Math.min(100, Math.max(0, tree.health + healthChange));
      
      // 随机调整环境因素
      const sunlightChange = Math.floor(Math.random() * 6) - 3;
      const waterChange = Math.floor(Math.random() * 6) - 3;
      const nutrientsChange = Math.floor(Math.random() * 6) - 3;
      
      const updatedTree = {
        ...tree,
        health: newHealth,
        environmentFactors: {
          sunlight: Math.min(100, Math.max(0, tree.environmentFactors.sunlight + sunlightChange)),
          water: Math.min(100, Math.max(0, tree.environmentFactors.water + waterChange)),
          nutrients: Math.min(100, Math.max(0, tree.environmentFactors.nutrients + nutrientsChange))
        },
        updatedAt: new Date().toISOString()
      };
      
      return updatedTree;
    });
    
    // 更新树木数组
    for (let i = 0; i < updatedTrees.length; i++) {
      trees[i] = updatedTrees[i];
    }
    
    return res.status(200).json({
      code: 200,
      data: {
        count: updatedTrees.length,
        message: '所有树木的健康状态已更新'
      },
      message: '批量更新树木健康状态成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('批量更新树木健康状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '批量更新树木健康状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

export default router; 