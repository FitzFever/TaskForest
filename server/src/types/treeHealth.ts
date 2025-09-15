/**
 * 树木健康状态相关类型定义
 */

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
 * 任务数据类型（兼容现有数据结构）
 */
export interface TaskData {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;
  progress?: number;
  completedAt?: Date | null;
  [key: string]: any;
}

/**
 * 树木数据类型（兼容现有数据结构）
 */
export interface TreeData {
  id: string;
  type: string;
  healthState: number;
  stage: number;
  createdAt: Date;
  updatedAt?: Date;
  taskId?: string;
  task?: TaskData;
  [key: string]: any;
}

/**
 * 健康状态更新结果
 */
export interface HealthUpdateResult {
  taskId: string;
  progress: number;
  updatedAt: Date;
  tree?: {
    id: string;
    healthStateBefore: number;
    healthStateAfter: number;
    healthChange: string;
  };
} 