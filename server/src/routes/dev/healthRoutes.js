/**
 * 健康检查和树木健康相关路由
 */
import express from 'express';
import * as healthService from '../../services/healthService.js';
import { tasks, trees } from '../../data/devData.js';
import logger from '../../utils/logger.js';

const router = express.Router();

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'TaskForest API服务正常运行'
  });
});

// 获取树木健康状态
router.get('/trees/:id/health', (req, res) => {
  try {
    const treeId = req.params.id;
    
    if (!treeId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const healthDetails = healthService.getTreeHealth(treeId);
    
    if (!healthDetails) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: healthDetails,
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

// 更新树木健康状态
router.put('/trees/:id/health', (req, res) => {
  try {
    const treeId = req.params.id;
    const { healthState, notes } = req.body;
    
    // 验证健康状态值
    if (typeof healthState !== 'number' || healthState < 0 || healthState > 100) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '无效的健康状态值',
          details: {
            field: 'healthState',
            reason: 'out_of_range',
            allowedRange: [0, 100]
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const updatedHealth = healthService.updateTreeHealth(treeId, healthState, notes);
    
    if (!updatedHealth) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: updatedHealth,
      message: '树木健康状态更新成功',
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

// 获取任务关联的树木健康状态
router.get('/tasks/:id/tree-health', (req, res) => {
  try {
    const taskId = req.params.id;
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const healthDetails = healthService.getTaskTreeHealth(taskId);
    
    if (!healthDetails) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在或未关联树木' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: healthDetails,
      message: '获取任务树木健康关联成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务树木健康关联失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取任务树木健康关联失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

// 更新任务进度（影响健康状态）
router.put('/tasks/:id/progress', (req, res) => {
  try {
    const taskId = req.params.id;
    const { progress, notes } = req.body;
    
    logger.info(`收到更新任务进度请求: 任务ID=${taskId}, 进度=${progress}`);
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 验证进度值
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '无效的进度值',
          details: {
            field: 'progress',
            reason: 'out_of_range',
            allowedRange: [0, 100]
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const result = healthService.updateTaskProgress(taskId, progress, notes);
    
    if (!result) {
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
      data: result,
      message: '任务进度和树木健康状态更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新任务进度失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message || '更新任务进度失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

// 获取单个任务信息
router.get('/tasks/:id', (req, res) => {
  try {
    const taskId = req.params.id;
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
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
    console.error('获取任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

// 批量更新所有树木健康状态
router.post('/trees/health/batch-update', (req, res) => {
  try {
    let updatedCount = 0;
    
    // 遍历所有树木
    for (let i = 0; i < trees.length; i++) {
      const tree = trees[i];
      const task = tasks.find(t => t.id === tree.taskId);
      
      if (task) {
        // 重新计算健康状态
        let healthState = tree.healthState;
        
        // 如果任务已完成，树木完全健康
        if (task.status === 'COMPLETED') {
          healthState = 100;
        } else if (task.dueDate) {
          const now = new Date();
          const deadline = new Date(task.dueDate);
          const createdAt = new Date(task.createdAt);
          
          // 计算任务总时长(毫秒)
          const totalDuration = deadline.getTime() - createdAt.getTime();
          
          if (totalDuration > 0) {
            // 计算剩余时间(毫秒)
            const remainingTime = deadline.getTime() - now.getTime();
            
            // 如果已超过截止日期
            if (remainingTime <= 0) {
              // 根据超过时长决定健康值(最低20%)
              const overdueFactor = Math.min(Math.abs(remainingTime) / totalDuration, 1);
              healthState = Math.max(20, 100 - (overdueFactor * 80));
            } else {
              // 计算基础健康值(基于剩余时间比例)
              const timeRatio = remainingTime / totalDuration;
              healthState = Math.min(100, Math.max(20, timeRatio * 100));
              
              // 根据任务进度调整健康值
              if (task.progress) {
                const expectedProgress = 100 - (timeRatio * 100);
                
                if (task.progress > expectedProgress) {
                  healthState = Math.min(100, healthState + ((task.progress - expectedProgress) / 2));
                } else if (task.progress < expectedProgress * 0.8) {
                  healthState = Math.max(20, healthState - ((expectedProgress - task.progress) / 2));
                }
              }
            }
          }
        }
        
        // 根据任务进度计算生长阶段
        const tree = trees[i];
        let newStage = tree.stage;
        if (task.progress !== undefined) {
          if (task.progress >= 100) {
            newStage = 3; // 完成 - 完全成长阶段
          } else if (task.progress >= 66) {
            newStage = 2; // 进度超过66% - 成长阶段
          } else if (task.progress >= 33) {
            newStage = 1; // 进度超过33% - 幼苗阶段
          } else {
            newStage = 0; // 进度低于33% - 种子阶段
          }
          
          console.log(`批量更新树木生长阶段: 树木ID=${tree.id}, 任务进度=${task.progress}%, 当前阶段=${tree.stage}, 新阶段=${newStage}`);
        }
        
        // 更新树木健康状态和生长阶段
        if (Math.round(healthState) !== tree.healthState || newStage !== tree.stage) {
          trees[i] = {
            ...tree,
            healthState: Math.round(healthState),
            stage: newStage,
            updatedAt: new Date().toISOString()
          };
          updatedCount++;
        }
      }
    }
    
    return res.status(200).json({
      code: 200,
      data: { 
        message: `已完成所有树木健康状态更新，共更新${updatedCount}棵树` 
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

// 获取树木生长阶段历史记录
router.get('/trees/:id/growth-history', (req, res) => {
  try {
    const treeId = req.params.id;
    
    // 检查树木是否存在
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
    
    // 查找关联的任务
    const task = tasks.find(t => t.id === tree.taskId);
    
    // 基于任务进度计算各阶段时间点
    const growthStages = [];
    
    // 如果有关联任务，计算生长阶段
    if (task) {
      // 计算当前生长阶段
      let currentStage = 0;
      if (task.progress >= 100) {
        currentStage = 3;
      } else if (task.progress >= 66) {
        currentStage = 2;
      } else if (task.progress >= 33) {
        currentStage = 1;
      }
      
      // 加入生长阶段历史记录
      let stageNames = [
        "种子阶段 (0-33%)", 
        "幼苗阶段 (33-66%)", 
        "成长阶段 (66-100%)", 
        "成熟阶段 (100%)"
      ];
      
      // 已达到的生长阶段
      let growthHistory = [];
      for (let i = 0; i <= currentStage; i++) {
        growthHistory.push({
          stage: i,
          name: stageNames[i],
          reached: true,
          requirement: i === 0 ? "0%" : i === 1 ? "33%" : i === 2 ? "66%" : "100%"
        });
      }
      
      // 未达到的生长阶段
      for (let i = currentStage + 1; i <= 3; i++) {
        growthHistory.push({
          stage: i,
          name: stageNames[i],
          reached: false,
          requirement: i === 0 ? "0%" : i === 1 ? "33%" : i === 2 ? "66%" : "100%"
        });
      }
    }
    
    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        treeId: tree.id,
        currentStage: tree.stage,
        currentProgress: task ? task.progress : 0,
        growthStages,
        taskId: tree.taskId,
        taskTitle: task ? task.title : null
      },
      message: '获取树木生长阶段历史成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取树木生长阶段历史失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取树木生长阶段历史失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

export default router; 