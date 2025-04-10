/**
 * 树木健康状态计算服务
 * 负责计算树木健康状态的各种算法
 */
import { PrismaClient } from '@prisma/client';
import { TaskData, TreeData } from '../types/treeHealth.js';

const prisma = new PrismaClient();

/**
 * 树木健康计算服务类
 */
class TreeHealthCalculationService {
  /**
   * 计算树木健康状态
   * @param task 任务对象
   * @param tree 树木对象
   * @returns 计算的健康状态值(0-100)
   */
  calculateHealthState(task: TaskData, tree: TreeData): number {
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
   * 计算预期进度
   * @param task 任务对象
   * @returns 预期进度值 (0-100)
   */
  calculateExpectedProgress(task: TaskData): number {
    if (!task.dueDate) return 0;
    
    const now = new Date();
    const deadline = new Date(task.dueDate);
    const createdAt = new Date(task.createdAt);
    
    const totalDuration = deadline.getTime() - createdAt.getTime();
    if (totalDuration <= 0) return 100;
    
    const remainingTime = deadline.getTime() - now.getTime();
    const timeRatio = Math.max(0, Math.min(1, remainingTime / totalDuration));
    
    return Math.round(100 - (timeRatio * 100));
  }

  /**
   * 计算时间比例
   * @param task 任务对象
   * @returns 时间比例 (0-1，1表示所有时间都剩余，0表示没有剩余时间)
   */
  calculateTimeRatio(task: TaskData): number {
    if (!task.dueDate) return 1;
    
    const now = new Date();
    const deadline = new Date(task.dueDate);
    const createdAt = new Date(task.createdAt);
    
    const totalDuration = deadline.getTime() - createdAt.getTime();
    if (totalDuration <= 0) return 0;
    
    const remainingTime = deadline.getTime() - now.getTime();
    return Math.max(0, Math.min(1, remainingTime / totalDuration));
  }
}

export default new TreeHealthCalculationService(); 