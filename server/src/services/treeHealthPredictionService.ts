/**
 * 树木健康状态预测服务
 * 负责预测树木健康状态变化
 */
import { PrismaClient } from '@prisma/client';
import { TaskData, TreeData, HealthTrend, HealthPrediction } from '../types/treeHealth.js';
import treeHealthCalculationService from './treeHealthCalculationService.js';

const prisma = new PrismaClient();

/**
 * 树木健康预测服务类
 */
class TreeHealthPredictionService {
  /**
   * 预测健康状态变化
   * @param task 任务对象
   * @param tree 树木对象
   * @returns 健康状态预测
   */
  async predictHealthStatus(task: TaskData, tree: TreeData): Promise<HealthPrediction> {
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
    const healthState = tree.healthState;
    const createdAt = new Date(task.createdAt);
    const totalDuration = deadline.getTime() - createdAt.getTime();
    const remainingTime = deadline.getTime() - now.getTime();
    const timeRatio = remainingTime / totalDuration;
    const expectedProgress = 100 - (timeRatio * 100);
    
    // 根据进度和预期进度差异确定趋势
    let trend: HealthTrend;
    if (task.progress === undefined) {
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
    const currentProgressRate = task.progress !== undefined
      ? task.progress / (1 - timeRatio)
      : 0;
    
    for (let i = 1; i <= numPredictions; i++) {
      const futureDate = new Date(now.getTime() + (i * predictionInterval * 24 * 60 * 60 * 1000));
      
      // 复制任务和树木对象以进行预测
      const futurePrediction: TaskData = {
        ...task,
        createdAt,
        dueDate: deadline,
      };
      
      // 预测未来进度（如果有当前进度）
      if (task.progress !== undefined) {
        const daysFromNow = i * predictionInterval;
        const daysFromStart = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) + daysFromNow;
        const daysTotal = (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        
        // 基于当前进度速率预测未来进度
        futurePrediction.progress = Math.min(100, task.progress + (currentProgressRate * daysFromNow / daysTotal) * 100);
      }
      
      // 计算该日期的预测健康状态
      const predictedHealth = treeHealthCalculationService.calculateHealthState(futurePrediction, tree);
      
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
   * 计算健康风险等级
   * @param task 任务对象
   * @param tree 树木对象
   * @returns 风险等级 (0-100)，值越高风险越大
   */
  calculateRiskLevel(task: TaskData, tree: TreeData): number {
    if (task.status === 'COMPLETED') return 0;
    if (!task.dueDate) return 30; // 无截止日期默认中等风险
    
    const now = new Date();
    const deadline = new Date(task.dueDate);
    
    // 已过期任务最高风险
    if (now > deadline) return 100;
    
    // 计算时间比例
    const timeRatio = treeHealthCalculationService.calculateTimeRatio(task);
    
    // 计算预期进度
    const expectedProgress = treeHealthCalculationService.calculateExpectedProgress(task);
    
    // 任务进度落后程度
    const progressDeficit = task.progress !== undefined ? Math.max(0, expectedProgress - task.progress) : expectedProgress;
    
    // 综合时间和进度因素计算风险
    const timeRiskFactor = 1 - timeRatio; // 剩余时间越少风险越高
    const progressRiskFactor = progressDeficit / 100; // 进度落后越多风险越高
    
    // 加权计算总风险 (时间因素占60%，进度因素占40%)
    const riskLevel = (timeRiskFactor * 60) + (progressRiskFactor * 40);
    
    return Math.min(100, Math.max(0, Math.round(riskLevel)));
  }
}

export default new TreeHealthPredictionService(); 