/**
 * 树木健康状态服务
 * 负责计算和管理树木健康状态
 */
import { PrismaClient } from '@prisma/client';
import { Tree } from '../types/tree';
import { Task } from '../types/task';

const prisma = new PrismaClient();

/**
 * 健康状态分类
 */
export enum HealthCategory {
  HEALTHY = 'HEALTHY',         // 健康 (75-100)
  SLIGHTLY_WILTED = 'SLIGHTLY_WILTED', // 轻微枯萎 (50-75)
  MODERATELY_WILTED = 'MODERATELY_WILTED', // 中度枯萎 (25-50)
  SEVERELY_WILTED = 'SEVERELY_WILTED', // 严重枯萎 (0-25)
}

/**
 * 健康状态趋势
 */
export enum HealthTrend {
  IMPROVING = 'IMPROVING',     // 改善中
  STABLE = 'STABLE',          // 稳定
  DECLINING = 'DECLINING',     // 恶化中
  CRITICAL = 'CRITICAL',       // 严重恶化
}

/**
 * 树木健康详情接口
 */
export interface TreeHealthDetails {
  treeId: string;
  healthState: number;
  healthCategory: HealthCategory;
  lastUpdated: Date;
  task?: {
    id: string;
    title: string;
    progress?: number;
    deadline?: Date;
  };
  details?: {
    timeRatio: number;
    expectedProgress: number;
    actualProgress?: number;
  };
}

/**
 * 健康预测接口
 */
export interface HealthPrediction {
  currentTrend: HealthTrend;
  estimatedHealthAt: { date: Date; health: number }[];
  recommendedProgress: number;
}

/**
 * 树木健康状态服务类
 */
export class TreeHealthService {
  /**
   * 获取树木健康状态详情
   * @param treeId 树木ID
   * @returns 健康状态详情或null
   */
  async getTreeHealth(treeId: string): Promise<TreeHealthDetails | null> {
    try {
      // 获取树木信息，包括关联的任务
      const tree = await prisma.tree.findUnique({
        where: { id: treeId },
        include: {
          task: true,
        },
      });

      if (!tree) return null;

      // 获取健康状态分类
      const healthCategory = this.getHealthCategory(tree.healthState);

      // 构建基础健康状态详情
      const healthDetails: TreeHealthDetails = {
        treeId: tree.id,
        healthState: tree.healthState,
        healthCategory,
        lastUpdated: tree.updatedAt || new Date(),
      };

      // 如果有关联任务，添加任务信息和详细信息
      if (tree.task) {
        const task = tree.task;
        healthDetails.task = {
          id: task.id,
          title: task.title,
          progress: task.progress,
          deadline: task.deadline,
        };

        // 如果任务有截止日期，计算时间比例和预期进度
        if (task.deadline) {
          const now = new Date();
          const deadline = new Date(task.deadline);
          const createdAt = new Date(task.createdAt);
          const totalDuration = deadline.getTime() - createdAt.getTime();
          const remainingTime = deadline.getTime() - now.getTime();
          const timeRatio = Math.max(0, Math.min(1, remainingTime / totalDuration));
          const expectedProgress = 100 - (timeRatio * 100);

          healthDetails.details = {
            timeRatio,
            expectedProgress: Math.round(expectedProgress),
            actualProgress: task.progress,
          };
        }
      }

      return healthDetails;
    } catch (error) {
      console.error('获取树木健康状态失败:', error);
      throw error;
    }
  }

  /**
   * 更新树木健康状态
   * @param treeId 树木ID
   * @param healthState 健康状态值
   * @param notes 可选的更新说明
   * @returns 更新后的健康状态或null
   */
  async updateTreeHealth(
    treeId: string,
    healthState: number,
    notes?: string
  ): Promise<TreeHealthDetails | null> {
    try {
      // 验证健康状态值范围
      if (healthState < 0 || healthState > 100) {
        throw new Error('健康状态值必须在0-100范围内');
      }

      // 查找树木
      const tree = await prisma.tree.findUnique({
        where: { id: treeId },
      });

      if (!tree) return null;

      // 更新树木健康状态
      const updatedTree = await prisma.tree.update({
        where: { id: treeId },
        data: {
          healthState,
          // 记录健康状态变更历史可以在这里添加
        },
      });

      // 返回更新后的健康状态详情
      return {
        treeId: updatedTree.id,
        healthState: updatedTree.healthState,
        healthCategory: this.getHealthCategory(updatedTree.healthState),
        lastUpdated: updatedTree.updatedAt || new Date(),
      };
    } catch (error) {
      console.error('更新树木健康状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务关联的树木健康状态，包括预测
   * @param taskId 任务ID
   * @returns 任务树木健康关联信息或null
   */
  async getTaskTreeHealth(taskId: string): Promise<any | null> {
    try {
      // 获取任务信息
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          tree: true,
        },
      });

      if (!task || !task.tree) return null;

      // 获取树木健康状态详情
      const healthDetails = await this.getTreeHealth(task.tree.id);
      if (!healthDetails) return null;

      // 计算健康状态预测
      const prediction = await this.predictHealthStatus(task, task.tree);

      // 构建响应
      return {
        taskId: task.id,
        taskTitle: task.title,
        progress: task.progress,
        deadline: task.deadline,
        tree: {
          id: task.tree.id,
          type: task.tree.type,
          stage: task.tree.stage,
          healthState: task.tree.healthState,
          healthCategory: healthDetails.healthCategory,
          lastUpdated: task.tree.updatedAt || new Date(),
        },
        healthPrediction: prediction,
      };
    } catch (error) {
      console.error('获取任务树木健康关联失败:', error);
      throw error;
    }
  }

  /**
   * 更新任务进度，同时更新树木健康状态
   * @param taskId 任务ID
   * @param progress 进度值(0-100)
   * @param notes 可选的进度更新说明
   * @returns 更新结果或null
   */
  async updateTaskProgress(
    taskId: string,
    progress: number,
    notes?: string
  ): Promise<any | null> {
    try {
      // 验证进度范围
      if (progress < 0 || progress > 100) {
        throw new Error('进度值必须在0-100范围内');
      }

      // 获取任务和关联的树木
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          tree: true,
        },
      });

      if (!task) return null;

      // 更新任务进度
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          progress,
          // 记录进度更新历史可以在这里添加
        },
      });

      // 如果没有关联的树木，只返回任务更新结果
      if (!task.tree) {
        return {
          taskId: updatedTask.id,
          progress: updatedTask.progress,
          updatedAt: updatedTask.updatedAt,
        };
      }

      // 计算并更新树木健康状态
      const healthStateBefore = task.tree.healthState;
      const healthStateAfter = this.calculateHealthState(updatedTask, task.tree);
      
      // 更新树木健康状态
      const updatedTree = await prisma.tree.update({
        where: { id: task.tree.id },
        data: {
          healthState: healthStateAfter,
        },
      });

      // 返回更新结果
      return {
        taskId: updatedTask.id,
        progress: updatedTask.progress,
        updatedAt: updatedTask.updatedAt,
        tree: {
          id: updatedTree.id,
          healthStateBefore,
          healthStateAfter,
          healthChange: (healthStateAfter > healthStateBefore ? '+' : '') + 
            (healthStateAfter - healthStateBefore).toString(),
        },
      };
    } catch (error) {
      console.error('更新任务进度失败:', error);
      throw error;
    }
  }

  /**
   * 计算树木健康状态
   * @param task 任务对象
   * @param tree 树木对象
   * @returns 计算的健康状态值(0-100)
   */
  calculateHealthState(task: any, tree: any): number {
    // 如果任务已完成，返回100%健康
    if (task.status === 'COMPLETED') return 100;
    
    // 如果没有设置截止日期，保持当前健康状态
    if (!task.deadline) return tree.healthState;
    
    const now = new Date();
    const deadline = new Date(task.deadline);
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
    if (task.progress) {
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
   * 获取健康状态分类
   * @param healthState 健康状态值(0-100)
   * @returns 健康状态分类
   */
  getHealthCategory(healthState: number): HealthCategory {
    if (healthState >= 75) return HealthCategory.HEALTHY;
    if (healthState >= 50) return HealthCategory.SLIGHTLY_WILTED;
    if (healthState >= 25) return HealthCategory.MODERATELY_WILTED;
    return HealthCategory.SEVERELY_WILTED;
  }

  /**
   * 预测健康状态变化
   * @param task 任务对象
   * @param tree 树木对象
   * @returns 健康状态预测
   */
  async predictHealthStatus(task: any, tree: any): Promise<HealthPrediction> {
    // 如果任务已完成或没有截止日期，不需要预测
    if (task.status === 'COMPLETED' || !task.deadline) {
      return {
        currentTrend: HealthTrend.STABLE,
        estimatedHealthAt: [],
        recommendedProgress: task.progress || 0,
      };
    }

    const now = new Date();
    const deadline = new Date(task.deadline);
    
    // 如果已经过了截止日期，预测未来健康状态会持续恶化
    if (now > deadline) {
      return {
        currentTrend: HealthTrend.CRITICAL,
        estimatedHealthAt: [],
        recommendedProgress: 100, // 建议立即完成任务
      };
    }

    // 计算当前健康状态趋势
    const healthState = tree.healthState;
    const createdAt = new Date(task.createdAt);
    const totalDuration = deadline.getTime() - createdAt.getTime();
    const remainingTime = deadline.getTime() - now.getTime();
    const timeRatio = remainingTime / totalDuration;
    const expectedProgress = 100 - (timeRatio * 100);
    
    // 根据进度和预期进度差异确定趋势
    let trend: HealthTrend;
    if (!task.progress) {
      trend = HealthTrend.DECLINING;
    } else if (task.progress >= expectedProgress) {
      trend = HealthTrend.IMPROVING;
    } else if (task.progress >= expectedProgress * 0.8) {
      trend = HealthTrend.STABLE;
    } else if (task.progress >= expectedProgress * 0.5) {
      trend = HealthTrend.DECLINING;
    } else {
      trend = HealthTrend.CRITICAL;
    }

    // 计算未来几个时间点的健康状态预测
    const predictions = [];
    const daysToDeadline = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    
    // 如果距离截止日期不到一周，预测每天的健康状态
    // 否则预测每周的健康状态
    const predictionInterval = daysToDeadline <= 7 ? 1 : 7;
    const numPredictions = Math.min(3, Math.ceil(daysToDeadline / predictionInterval));
    
    // 假设任务进度保持当前速率
    const currentProgressRate = task.progress 
      ? task.progress / (1 - timeRatio)
      : 0;
    
    for (let i = 1; i <= numPredictions; i++) {
      const futureDate = new Date(now.getTime() + (i * predictionInterval * 24 * 60 * 60 * 1000));
      
      // 复制任务和树木对象以进行预测
      const futurePrediction = {
        ...task,
        createdAt,
        deadline,
      };
      
      // 预测未来进度（如果有当前进度）
      if (task.progress) {
        const daysFromNow = i * predictionInterval;
        const daysFromStart = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) + daysFromNow;
        const daysTotal = (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        
        // 基于当前进度速率预测未来进度
        futurePrediction.progress = Math.min(100, task.progress + (currentProgressRate * daysFromNow / daysTotal) * 100);
      }
      
      // 计算该日期的预测健康状态
      const predictedHealth = this.calculateHealthState(futurePrediction, tree);
      
      predictions.push({
        date: futureDate,
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
   * 计算任务树状态
   * 批量计算或定时刷新
   */
  async calculateAllTreesHealth(): Promise<void> {
    try {
      // 获取所有未完成任务及其关联的树木
      const tasksWithTrees = await prisma.task.findMany({
        where: {
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
          tree: { isNot: null },
        },
        include: {
          tree: true,
        },
      });

      // 批量更新树木健康状态
      for (const task of tasksWithTrees) {
        if (task.tree) {
          const healthState = this.calculateHealthState(task, task.tree);
          
          await prisma.tree.update({
            where: { id: task.tree.id },
            data: { healthState },
          });
        }
      }

      console.log(`已更新 ${tasksWithTrees.length} 棵树的健康状态`);
    } catch (error) {
      console.error('批量更新树木健康状态失败:', error);
      throw error;
    }
  }
}

export default new TreeHealthService(); 