/**
 * 健康检查和树木健康相关路由
 */
import express from 'express';
import { tasks, trees } from '../../data/devData.js';

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
    
    // 获取关联的任务
    const task = tasks.find(t => t.id === tree.taskId);
    
    // 计算健康状态分类
    let healthCategory = 'HEALTHY';
    if (tree.healthState < 25) {
      healthCategory = 'SEVERELY_WILTED';
    } else if (tree.healthState < 50) {
      healthCategory = 'MODERATELY_WILTED';
    } else if (tree.healthState < 75) {
      healthCategory = 'SLIGHTLY_WILTED';
    }
    
    const response = {
      treeId: tree.id,
      healthState: tree.healthState,
      healthCategory,
      lastUpdated: new Date().toISOString()
    };
    
    // 如果有关联任务，添加任务信息
    if (task) {
      const now = new Date();
      const deadline = new Date(task.dueDate);
      const createdAt = new Date(task.createdAt);
      const totalDuration = deadline.getTime() - createdAt.getTime();
      const remainingTime = deadline.getTime() - now.getTime();
      
      // 确保时间比例在合理范围内
      const timeRatio = Math.max(0, Math.min(1, remainingTime / totalDuration));
      const expectedProgress = 100 - (timeRatio * 100);
      
      // 构建任务信息
      response.task = {
        id: task.id,
        title: task.title,
        progress: task.progress || 0,
        deadline: task.dueDate
      };
      
      // 添加详细信息
      response.details = {
        timeRatio,
        expectedProgress: Math.round(expectedProgress),
        actualProgress: task.progress || 0
      };
    }
    
    return res.status(200).json({
      code: 200,
      data: response,
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
    
    // 更新树木健康状态
    trees[treeIndex] = {
      ...trees[treeIndex],
      healthState,
      updatedAt: new Date().toISOString()
    };
    
    // 获取健康状态分类
    let healthCategory = 'HEALTHY';
    if (healthState < 25) {
      healthCategory = 'SEVERELY_WILTED';
    } else if (healthState < 50) {
      healthCategory = 'MODERATELY_WILTED';
    } else if (healthState < 75) {
      healthCategory = 'SLIGHTLY_WILTED';
    }
    
    return res.status(200).json({
      code: 200,
      data: {
        treeId,
        healthState,
        healthCategory,
        lastUpdated: new Date().toISOString()
      },
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

// 获取任务与树木健康关联
router.get('/tasks/:id/tree-health', (req, res) => {
  try {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 获取关联的树木
    const tree = trees.find(t => t.taskId === taskId);
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务没有关联的树木' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 计算健康状态分类
    let healthCategory = 'HEALTHY';
    if (tree.healthState < 25) {
      healthCategory = 'SEVERELY_WILTED';
    } else if (tree.healthState < 50) {
      healthCategory = 'MODERATELY_WILTED';
    } else if (tree.healthState < 75) {
      healthCategory = 'SLIGHTLY_WILTED';
    }
    
    // 计算健康状态趋势
    let currentTrend = 'STABLE';
    const now = new Date();
    const deadline = new Date(task.dueDate);
    const createdAt = new Date(task.createdAt);
    const totalDuration = deadline.getTime() - createdAt.getTime();
    const remainingTime = deadline.getTime() - now.getTime();
    
    // 确保时间比例在合理范围内
    const timeRatio = Math.max(0, Math.min(1, remainingTime / totalDuration));
    const expectedProgress = 100 - (timeRatio * 100);
    const progress = task.progress || 0;
    
    // 根据进度和预期进度差异确定趋势
    if (!progress) {
      currentTrend = 'DECLINING';
    } else if (progress >= expectedProgress) {
      currentTrend = 'IMPROVING';
    } else if (progress >= expectedProgress * 0.8) {
      currentTrend = 'STABLE';
    } else if (progress >= expectedProgress * 0.5) {
      currentTrend = 'DECLINING';
    } else {
      currentTrend = 'CRITICAL';
    }
    
    // 模拟健康状态预测
    const predictions = [];
    const daysToDeadline = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    
    if (daysToDeadline > 0) {
      // 计算每一天的健康状态变化预测
      const predictInterval = daysToDeadline <= 7 ? 1 : 7; // 一周以内每天预测，否则每周预测
      const numPredictions = Math.min(3, Math.ceil(daysToDeadline / predictInterval)); // 最多预测3个时间点
      
      for (let i = 1; i <= numPredictions; i++) {
        const futureDate = new Date(now.getTime() + (i * predictInterval * 24 * 60 * 60 * 1000));
        
        // 简化的健康状态计算模型
        const futureTimeRatio = Math.max(0, Math.min(1, (deadline.getTime() - futureDate.getTime()) / totalDuration));
        const futureExpectedProgress = 100 - (futureTimeRatio * 100);
        
        // 假设进度线性增长
        const estimatedProgress = Math.min(100, progress + (i * predictInterval / daysToDeadline) * (100 - progress));
        
        // 基于时间和进度计算预测的健康状态
        let predictedHealth = Math.min(100, Math.max(20, futureTimeRatio * 100));
        
        if (estimatedProgress < futureExpectedProgress * 0.8) {
          predictedHealth = Math.max(20, predictedHealth - ((futureExpectedProgress - estimatedProgress) / 2));
        } else if (estimatedProgress > futureExpectedProgress) {
          predictedHealth = Math.min(100, predictedHealth + ((estimatedProgress - futureExpectedProgress) / 2));
        }
        
        predictions.push({
          date: futureDate.toISOString(),
          health: Math.round(predictedHealth)
        });
      }
    }
    
    return res.status(200).json({
      code: 200,
      data: {
        taskId: task.id,
        taskTitle: task.title,
        progress: task.progress || 0,
        deadline: task.dueDate,
        tree: {
          id: tree.id,
          type: tree.type,
          stage: tree.stage,
          healthState: tree.healthState,
          healthCategory,
          lastUpdated: tree.updatedAt || new Date().toISOString()
        },
        healthPrediction: {
          currentTrend,
          estimatedHealthAt: predictions,
          recommendedProgress: Math.ceil(expectedProgress)
        }
      },
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
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 更新任务进度
    const oldProgress = tasks[taskIndex].progress || 0;
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      progress,
      updatedAt: new Date().toISOString()
    };
    
    // 判断是否需要更新任务状态
    if (progress === 100 && tasks[taskIndex].status !== 'COMPLETED') {
      tasks[taskIndex].status = 'COMPLETED';
      tasks[taskIndex].completedAt = new Date().toISOString();
    } else if (progress > 0 && progress < 100 && tasks[taskIndex].status === 'TODO') {
      tasks[taskIndex].status = 'IN_PROGRESS';
    }
    
    // 获取关联的树木并更新健康状态
    const treeIndex = trees.findIndex(t => t.taskId === taskId);
    const response = {
      taskId,
      progress,
      updatedAt: new Date().toISOString()
    };
    
    if (treeIndex !== -1) {
      // 计算健康状态变化
      const healthStateBefore = trees[treeIndex].healthState;
      
      // 计算新的健康状态值
      let healthStateAfter = healthStateBefore;
      
      // 如果任务已完成，树木完全健康
      if (progress === 100) {
        healthStateAfter = 100;
      } else {
        const task = tasks[taskIndex];
        const now = new Date();
        const deadline = new Date(task.dueDate);
        const createdAt = new Date(task.createdAt);
        
        // 计算任务总时长(毫秒)
        const totalDuration = deadline.getTime() - createdAt.getTime();
        
        // 计算剩余时间(毫秒)
        const remainingTime = deadline.getTime() - now.getTime();
        
        // 计算基础健康值
        if (remainingTime <= 0) {
          // 超过截止日期
          const overdueFactor = Math.min(Math.abs(remainingTime) / totalDuration, 1);
          healthStateAfter = Math.max(20, 100 - (overdueFactor * 80));
        } else {
          // 在截止日期前
          const timeRatio = remainingTime / totalDuration;
          healthStateAfter = Math.min(100, Math.max(20, timeRatio * 100));
          
          // 根据进度调整健康值
          const expectedProgress = 100 - (timeRatio * 100);
          
          if (progress > expectedProgress) {
            healthStateAfter = Math.min(100, healthStateAfter + ((progress - expectedProgress) / 2));
          } else if (progress < expectedProgress * 0.8) {
            healthStateAfter = Math.max(20, healthStateAfter - ((expectedProgress - progress) / 2));
          }
        }
        
        // 进度更新后给予健康值奖励
        const healthBonus = 10;
        if (progress > oldProgress) {
          healthStateAfter += healthBonus * ((progress - oldProgress) / 100);
          healthStateAfter = Math.min(100, healthStateAfter);
        }
      }
      
      // 根据任务进度计算生长阶段
      const tree = trees[treeIndex];
      let newStage = tree.stage;
      const task = tasks[taskIndex];
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
        
        console.log(`计算树木生长阶段: 任务进度=${task.progress}%, 当前阶段=${tree.stage}, 新阶段=${newStage}`);
      }
      
      // 更新树木健康状态和生长阶段
      if (Math.round(healthStateAfter) !== tree.healthState || newStage !== tree.stage) {
        trees[treeIndex] = {
          ...tree,
          healthState: Math.round(healthStateAfter),
          stage: newStage,
          updatedAt: new Date().toISOString()
        };
      }
      
      // 添加树木信息到响应
      response.tree = {
        id: trees[treeIndex].id,
        healthStateBefore,
        healthStateAfter: Math.round(healthStateAfter),
        healthChange: (Math.round(healthStateAfter) > healthStateBefore ? '+' : '') + 
          (Math.round(healthStateAfter) - healthStateBefore).toString(),
        stageBefore: trees[treeIndex].stage,
        stageAfter: newStage
      };
    }
    
    return res.status(200).json({
      code: 200,
      data: response,
      message: '任务进度和树木健康状态更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新任务进度失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新任务进度失败' },
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