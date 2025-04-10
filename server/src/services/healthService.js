/**
 * 健康服务模块
 * 负责处理树木健康状态相关的业务逻辑
 */
import { tasks, trees } from '../dataStore.js';

/**
 * 健康状态分类枚举
 */
export const HealthCategory = {
  HEALTHY: 'HEALTHY',               // 健康 (75-100)
  SLIGHTLY_WILTED: 'SLIGHTLY_WILTED', // 轻微枯萎 (50-75)
  MODERATELY_WILTED: 'MODERATELY_WILTED', // 中度枯萎 (25-50)
  SEVERELY_WILTED: 'SEVERELY_WILTED'   // 严重枯萎 (0-25)
};

/**
 * 健康状态趋势枚举
 */
export const HealthTrend = {
  IMPROVING: 'IMPROVING', // 改善中
  STABLE: 'STABLE',      // 稳定
  DECLINING: 'DECLINING', // 恶化中
  CRITICAL: 'CRITICAL'    // 严重恶化
};

/**
 * 获取树木健康状态分类
 * @param {number} healthState - 健康状态值 (0-100)
 * @returns {string} 健康状态分类
 */
export function getHealthCategory(healthState) {
  if (healthState >= 75) return HealthCategory.HEALTHY;
  if (healthState >= 50) return HealthCategory.SLIGHTLY_WILTED;
  if (healthState >= 25) return HealthCategory.MODERATELY_WILTED;
  return HealthCategory.SEVERELY_WILTED;
}

/**
 * 计算任务进度与截止日期之间的时间比例
 * @param {Object} task - 任务对象
 * @returns {number} 时间比例 (0-1)
 */
export function calculateTimeRatio(task) {
  if (!task.dueDate) return 1; // 没有截止日期视为有足够时间
  
  const now = new Date();
  const deadline = new Date(task.dueDate);
  const createdAt = new Date(task.createdAt);
  
  const totalDuration = deadline.getTime() - createdAt.getTime();
  if (totalDuration <= 0) return 0; // 无效时间范围
  
  const remainingTime = deadline.getTime() - now.getTime();
  return Math.max(0, Math.min(1, remainingTime / totalDuration));
}

/**
 * 计算任务的预期进度
 * @param {Object} task - 任务对象
 * @returns {number} 预期进度 (0-100)
 */
export function calculateExpectedProgress(task) {
  const timeRatio = calculateTimeRatio(task);
  return Math.round(100 - (timeRatio * 100));
}

/**
 * 计算树木健康状态
 * @param {Object} task - 任务对象
 * @param {Object} tree - 树木对象
 * @returns {number} 健康状态值 (0-100)
 */
export function calculateHealthState(task, tree) {
  // 如果任务已完成，返回100%健康
  if (task.status === 'COMPLETED') return 100;
  
  // 如果没有设置截止日期，保持当前健康状态
  if (!task.dueDate) return tree.healthState;
  
  const now = new Date();
  const deadline = new Date(task.dueDate);
  const createdAt = new Date(task.createdAt);
  
  // 计算任务总时长(毫秒)
  const totalDuration = deadline.getTime() - createdAt.getTime();
  
  // 如果总时长不合理，保持当前健康状态
  if (totalDuration <= 0) return tree.healthState;
  
  // 计算剩余时间(毫秒)
  const remainingTime = deadline.getTime() - now.getTime();
  
  // 如果已超过截止日期
  if (remainingTime <= 0) {
    // 根据超过时长决定健康值(最低20%)
    const overdueFactor = Math.min(Math.abs(remainingTime) / totalDuration, 1);
    return Math.max(20, 100 - (overdueFactor * 80));
  }
  
  // 计算基础健康值(基于剩余时间比例)
  const timeRatio = remainingTime / totalDuration;
  let healthValue = Math.min(100, Math.max(20, timeRatio * 100));
  
  // 根据任务进度调整健康值
  if (task.progress !== undefined) {
    const expectedProgress = 100 - (timeRatio * 100);
    
    // 如果进度超前，提升健康值
    if (task.progress > expectedProgress) {
      healthValue = Math.min(100, healthValue + ((task.progress - expectedProgress) / 2));
    }
    // 如果进度落后，降低健康值
    else if (task.progress < expectedProgress * 0.8) {
      healthValue = Math.max(20, healthValue - ((expectedProgress - task.progress) / 2));
    }
  }
  
  // 进度更新后恢复一定健康值
  const healthBonus = 20;
  
  // 如果之前的健康状态低于当前计算值，给予恢复奖励
  if (tree.healthState < healthValue) {
    healthValue = Math.min(100, healthValue + healthBonus * 0.5);
  }
  
  return Math.round(healthValue);
}

/**
 * 预测健康状态趋势
 * @param {Object} task - 任务对象
 * @param {Object} tree - 树木对象
 * @returns {string} 健康状态趋势
 */
export function predictHealthTrend(task, tree) {
  if (task.status === 'COMPLETED') {
    return HealthTrend.STABLE;
  }
  
  if (!task.dueDate) {
    return HealthTrend.STABLE;
  }
  
  const now = new Date();
  const deadline = new Date(task.dueDate);
  
  // 已经过期的任务
  if (now > deadline) {
    return HealthTrend.CRITICAL;
  }
  
  const timeRatio = calculateTimeRatio(task);
  const expectedProgress = calculateExpectedProgress(task);
  const progress = task.progress || 0;
  
  // 根据进度和预期进度差异确定趋势
  if (progress >= expectedProgress) {
    return HealthTrend.IMPROVING;
  } else if (progress >= expectedProgress * 0.8) {
    return HealthTrend.STABLE;
  } else if (progress >= expectedProgress * 0.5) {
    return HealthTrend.DECLINING;
  } else {
    return HealthTrend.CRITICAL;
  }
}

/**
 * 预测健康状态变化
 * @param {Object} task - 任务对象
 * @param {Object} tree - 树木对象
 * @returns {Object} 健康状态预测
 */
export function predictHealthStatus(task, tree) {
  // 如果任务已完成或没有截止日期，不需要预测
  if (task.status === 'COMPLETED' || !task.dueDate) {
    return {
      currentTrend: HealthTrend.STABLE,
      estimatedHealthAt: [],
      recommendedProgress: task.progress || 0,
    };
  }

  const now = new Date();
  const deadline = new Date(task.dueDate);
  
  // 如果已经过了截止日期，预测未来健康状态会持续恶化
  if (now > deadline) {
    return {
      currentTrend: HealthTrend.CRITICAL,
      estimatedHealthAt: [],
      recommendedProgress: 100, // 建议立即完成任务
    };
  }

  // 计算当前健康状态趋势
  const trend = predictHealthTrend(task, tree);
  const createdAt = new Date(task.createdAt);
  const totalDuration = deadline.getTime() - createdAt.getTime();
  const remainingTime = deadline.getTime() - now.getTime();
  const timeRatio = remainingTime / totalDuration;
  const expectedProgress = 100 - (timeRatio * 100);
  
  // 计算未来几个时间点的健康状态预测
  const predictions = [];
  const daysToDeadline = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  
  // 如果距离截止日期不到一周，预测每天的健康状态
  // 否则预测每周的健康状态
  const predictionInterval = daysToDeadline <= 7 ? 1 : 7;
  const numPredictions = Math.min(3, Math.ceil(daysToDeadline / predictionInterval));
  
  // 假设任务进度保持当前速率
  const progress = task.progress || 0;
  const currentProgressRate = progress > 0
    ? progress / (1 - timeRatio)
    : 0;
  
  for (let i = 1; i <= numPredictions; i++) {
    const futureDate = new Date(now.getTime() + (i * predictionInterval * 24 * 60 * 60 * 1000));
    
    // 复制任务和树木对象以进行预测
    const futurePrediction = {
      ...task,
      createdAt: task.createdAt,
      dueDate: task.dueDate,
    };
    
    // 预测未来进度（如果有当前进度）
    if (progress > 0) {
      const daysFromNow = i * predictionInterval;
      const daysFromStart = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) + daysFromNow;
      const daysTotal = (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      // 基于当前进度速率预测未来进度
      futurePrediction.progress = Math.min(100, progress + (currentProgressRate * daysFromNow / daysTotal) * 100);
    }
    
    // 计算该日期的预测健康状态
    const predictedHealth = calculateHealthState(futurePrediction, tree);
    
    predictions.push({
      date: futureDate.toISOString(),
      health: predictedHealth,
    });
  }

  // 计算推荐的进度值
  // 基于当前时间和截止日期之间的比例
  const recommendedProgress = Math.ceil(expectedProgress);

  return {
    currentTrend: trend,
    estimatedHealthAt: predictions,
    recommendedProgress,
  };
}

/**
 * 批量更新所有树木健康状态
 * @returns {number} 更新的树木数量
 */
export function batchUpdateTreesHealth() {
  let updatedCount = 0;
  
  // 遍历所有树木
  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    const task = tasks.find(t => t.id === tree.taskId);
    
    if (task) {
      // 重新计算健康状态
      const healthState = calculateHealthState(task, tree);
      
      // 更新树木健康状态
      if (Math.round(healthState) !== tree.healthState) {
        trees[i] = {
          ...tree,
          healthState: Math.round(healthState),
          updatedAt: new Date().toISOString()
        };
        updatedCount++;
      }
    }
  }
  
  return updatedCount;
}

/**
 * 获取树木健康状态详情
 * @param {string} treeId - 树木ID
 * @returns {Object|null} 健康状态详情或null
 */
export function getTreeHealth(treeId) {
  const tree = trees.find(t => t.id === treeId);
  
  if (!tree) return null;
  
  // 计算健康状态分类
  const healthCategory = getHealthCategory(tree.healthState);
  
  // 构建基础健康状态详情
  const response = {
    treeId: tree.id,
    healthState: tree.healthState,
    healthCategory,
    lastUpdated: tree.updatedAt || new Date().toISOString()
  };
  
  // 获取关联的任务
  const task = tasks.find(t => t.id === tree.taskId);
  
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
  
  return response;
}

/**
 * 更新树木健康状态
 * @param {string} treeId - 树木ID
 * @param {number} healthState - 健康状态值
 * @param {string} [notes] - 可选的更新说明
 * @returns {Object|null} 更新后的健康状态或null
 */
export function updateTreeHealth(treeId, healthState, notes) {
  // 验证健康状态值
  if (typeof healthState !== 'number' || healthState < 0 || healthState > 100) {
    throw new Error('无效的健康状态值');
  }
  
  const treeIndex = trees.findIndex(t => t.id === treeId);
  
  if (treeIndex === -1) return null;
  
  // 更新树木健康状态
  trees[treeIndex] = {
    ...trees[treeIndex],
    healthState: Math.round(healthState),
    updatedAt: new Date().toISOString()
  };
  
  // 获取健康状态分类
  const healthCategory = getHealthCategory(healthState);
  
  return {
    treeId,
    healthState: Math.round(healthState),
    healthCategory,
    lastUpdated: new Date().toISOString(),
    notes
  };
}

/**
 * 获取任务关联的树木健康状态
 * @param {string} taskId - 任务ID
 * @returns {Object|null} 任务树木健康关联信息或null
 */
export function getTaskTreeHealth(taskId) {
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return null;
  
  // 获取关联的树木
  const tree = trees.find(t => t.taskId === taskId);
  
  if (!tree) return null;
  
  // 计算健康状态分类
  const healthCategory = getHealthCategory(tree.healthState);
  
  // 构建响应
  const response = {
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
    }
  };
  
  // 预测健康状态
  response.healthPrediction = predictHealthStatus(task, tree);
  
  return response;
}

/**
 * 更新任务进度和相关树木健康状态
 * @param {string} taskId - 任务ID
 * @param {number} progress - 进度值(0-100)
 * @param {string} [notes] - 可选的更新说明
 * @returns {Object|null} 更新结果或null
 */
export function updateTaskProgress(taskId, progress, notes) {
  // 验证进度值
  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    throw new Error('无效的进度值');
  }
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
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
  
  // 构建响应
  const response = {
    taskId,
    progress,
    updatedAt: new Date().toISOString()
  };
  
  // 获取关联的树木
  const treeIndex = trees.findIndex(t => t.taskId === taskId);
  
  if (treeIndex !== -1) {
    // 计算健康状态变化
    const healthStateBefore = trees[treeIndex].healthState;
    const healthStateAfter = calculateHealthState(tasks[taskIndex], trees[treeIndex]);
    
    // 更新树木健康状态
    trees[treeIndex] = {
      ...trees[treeIndex],
      healthState: Math.round(healthStateAfter),
      updatedAt: new Date().toISOString()
    };
    
    // 添加树木信息到响应
    response.tree = {
      id: trees[treeIndex].id,
      healthStateBefore,
      healthStateAfter: Math.round(healthStateAfter),
      healthChange: (Math.round(healthStateAfter) > healthStateBefore ? '+' : '') + 
        (Math.round(healthStateAfter) - healthStateBefore).toString()
    };
  }
  
  return response;
} 