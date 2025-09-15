/**
 * 树木健康状态服务
 * 负责计算和管理树木健康状态
 */
import { PrismaClient } from '@prisma/client';
import { 
  TreeHealthDetails, 
  HealthCategory, 
  TaskData, 
  TreeData,
  HealthUpdateResult
} from '../types/treeHealth.js';
import treeHealthCalculationService from './treeHealthCalculationService.js';
import treeHealthPredictionService from './treeHealthPredictionService.js';

const prisma = new PrismaClient();

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
      
      // 将数据库对象转换为类型安全对象
      const treeData: TreeData = {
        id: tree.id,
        type: tree.type,
        healthState: tree.healthState,
        stage: tree.stage,
        createdAt: tree.createdAt,
        updatedAt: tree.updatedAt as Date,
        taskId: tree.taskId
      };

      // 获取健康状态分类
      const healthCategory = this.getHealthCategory(treeData.healthState);

      // 构建基础健康状态详情
      const healthDetails: TreeHealthDetails = {
        treeId: treeData.id,
        healthState: treeData.healthState,
        healthCategory,
        lastUpdated: treeData.updatedAt || new Date(),
      };

      // 如果有关联任务，添加任务信息和详细信息
      if (tree.task) {
        const taskData: TaskData = {
          id: tree.task.id,
          title: tree.task.title,
          status: tree.task.status,
          createdAt: tree.task.createdAt,
          updatedAt: tree.task.updatedAt,
          dueDate: tree.task.dueDate,
          progress: (tree.task as any).progress
        };
        
        healthDetails.task = {
          id: taskData.id,
          title: taskData.title,
          progress: taskData.progress,
          deadline: taskData.dueDate,
        };

        // 如果任务有截止日期，计算时间比例和预期进度
        if (taskData.dueDate) {
          const now = new Date();
          const deadline = new Date(taskData.dueDate);
          const createdAt = new Date(taskData.createdAt);
          const totalDuration = deadline.getTime() - createdAt.getTime();
          const remainingTime = deadline.getTime() - now.getTime();
          const timeRatio = Math.max(0, Math.min(1, remainingTime / totalDuration));
          const expectedProgress = 100 - (timeRatio * 100);

          healthDetails.details = {
            timeRatio,
            expectedProgress: Math.round(expectedProgress),
            actualProgress: taskData.progress,
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

      // 将数据库对象转换为类型安全对象
      const treeData: TreeData = {
        id: updatedTree.id,
        type: updatedTree.type,
        healthState: updatedTree.healthState,
        stage: updatedTree.stage,
        createdAt: updatedTree.createdAt,
        updatedAt: updatedTree.updatedAt as Date,
      };

      // 返回更新后的健康状态详情
      return {
        treeId: treeData.id,
        healthState: treeData.healthState,
        healthCategory: this.getHealthCategory(treeData.healthState),
        lastUpdated: treeData.updatedAt || new Date(),
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

      // 将数据库对象转换为类型安全对象
      const taskData: TaskData = {
        id: task.id,
        title: task.title,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        dueDate: task.dueDate,
        progress: (task as any).progress
      };
      
      const treeData: TreeData = {
        id: task.tree.id,
        type: task.tree.type,
        healthState: task.tree.healthState,
        stage: task.tree.stage,
        createdAt: task.tree.createdAt,
        updatedAt: task.tree.updatedAt as Date,
        taskId: task.tree.taskId
      };

      // 获取树木健康状态详情
      const healthDetails = await this.getTreeHealth(treeData.id);
      if (!healthDetails) return null;

      // 计算健康状态预测
      const prediction = await treeHealthPredictionService.predictHealthStatus(taskData, treeData);

      // 构建响应
      return {
        taskId: taskData.id,
        taskTitle: taskData.title,
        progress: taskData.progress,
        deadline: taskData.dueDate,
        tree: {
          id: treeData.id,
          type: treeData.type,
          stage: treeData.stage,
          healthState: treeData.healthState,
          healthCategory: healthDetails.healthCategory,
          lastUpdated: treeData.updatedAt || new Date(),
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
  ): Promise<HealthUpdateResult | null> {
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

      // 将数据库对象转换为类型安全对象
      const taskData: TaskData = {
        id: task.id,
        title: task.title,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        dueDate: task.dueDate,
        progress: (task as any).progress
      };

      // 更新任务进度
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          progress: progress,
          // 记录进度更新历史可以在这里添加
        } as any, // 类型转换为any以避免类型错误
      });
      
      const updatedTaskData: TaskData = {
        ...taskData,
        progress,
        updatedAt: updatedTask.updatedAt
      };

      // 如果没有关联的树木，只返回任务更新结果
      if (!task.tree) {
        return {
          taskId: updatedTaskData.id,
          progress: updatedTaskData.progress || 0,
          updatedAt: updatedTaskData.updatedAt as Date,
        };
      }

      // 将树木数据库对象转换为类型安全对象
      const treeData: TreeData = {
        id: task.tree.id,
        type: task.tree.type,
        healthState: task.tree.healthState,
        stage: task.tree.stage,
        createdAt: task.tree.createdAt,
        updatedAt: task.tree.updatedAt as Date,
        taskId: task.tree.taskId
      };

      // 计算并更新树木健康状态
      const healthStateBefore = treeData.healthState;
      const healthStateAfter = treeHealthCalculationService.calculateHealthState(updatedTaskData, treeData);
      
      // 更新树木健康状态
      const updatedTree = await prisma.tree.update({
        where: { id: treeData.id },
        data: {
          healthState: healthStateAfter,
        },
      });

      // 返回更新结果
      return {
        taskId: updatedTaskData.id,
        progress: updatedTaskData.progress || 0,
        updatedAt: updatedTaskData.updatedAt as Date,
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
          // 将数据库对象转换为类型安全对象
          const taskData: TaskData = {
            id: task.id,
            title: task.title,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            dueDate: task.dueDate,
            progress: (task as any).progress
          };
          
          const treeData: TreeData = {
            id: task.tree.id,
            type: task.tree.type,
            healthState: task.tree.healthState,
            stage: task.tree.stage,
            createdAt: task.tree.createdAt,
            taskId: task.tree.taskId
          };
          
          const healthState = treeHealthCalculationService.calculateHealthState(taskData, treeData);
          
          await prisma.tree.update({
            where: { id: treeData.id },
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