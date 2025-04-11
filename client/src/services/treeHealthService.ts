/**
 * 树木健康状态相关API服务
 */
import api from './api';

/**
 * 树木健康状态分类
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
  lastUpdated: string;
  task?: {
    id: string;
    title: string;
    progress?: number;
    deadline?: string;
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
  estimatedHealthAt: { date: string; health: number }[];
  recommendedProgress: number;
}

/**
 * 任务树木健康关联接口
 */
export interface TaskTreeHealth {
  taskId: string;
  taskTitle: string;
  progress: number;
  deadline?: string;
  taskType?: string; // 任务类型
  tree: {
    id: string;
    type: string;
    stage: number;
    healthState: number;
    healthCategory: HealthCategory;
    lastUpdated: string;
  };
  healthPrediction: HealthPrediction;
}

/**
 * 任务进度更新响应接口
 */
export interface TaskProgressUpdateResponse {
  taskId: string;
  progress: number;
  updatedAt: string;
  tree?: {
    id: string;
    healthStateBefore: number;
    healthStateAfter: number;
    healthChange: string;
  };
}

/**
 * 获取树木健康状态
 * @param treeId 树木ID
 * @returns 树木健康状态详情
 */
export const getTreeHealth = async (treeId: string): Promise<TreeHealthDetails> => {
  try {
    console.log(`获取树木健康状态: ${treeId}`);
    const response = await api.get<{
      code: number;
      data: TreeHealthDetails;
      message: string;
    }>(`/trees/${treeId}/health`);
    
    return response.data.data;
  } catch (error) {
    console.error(`获取树木健康状态失败: ${treeId}`, error);
    throw error;
  }
};

/**
 * 更新树木健康状态
 * @param treeId 树木ID
 * @param healthState 健康状态值(0-100)
 * @param notes 可选的说明
 * @returns 更新后的树木健康状态
 */
export const updateTreeHealth = async (
  treeId: string,
  healthState: number,
  notes?: string
): Promise<TreeHealthDetails> => {
  try {
    console.log(`更新树木健康状态: ${treeId} 值: ${healthState}`);
    const response = await api.put<{
      code: number;
      data: TreeHealthDetails;
      message: string;
    }>(`/trees/${treeId}/health`, { healthState, notes });
    
    return response.data.data;
  } catch (error) {
    console.error(`更新树木健康状态失败: ${treeId}`, error);
    throw error;
  }
};

/**
 * 获取任务与树木健康关联
 * @param taskId 任务ID
 * @returns 任务与树木健康关联信息
 */
export const getTaskTreeHealth = async (taskId: string): Promise<TaskTreeHealth> => {
  try {
    console.log(`获取任务与树木健康关联: ${taskId}`);
    const response = await api.get<{
      code: number;
      data: TaskTreeHealth;
      message: string;
    }>(`/tasks/${taskId}/tree-health`);
    
    return response.data.data;
  } catch (error) {
    console.error(`获取任务与树木健康关联失败: ${taskId}`, error);
    throw error;
  }
};

/**
 * 更新任务进度（影响健康状态）
 * @param taskId 任务ID
 * @param progress 进度值(0-100)
 * @param notes 可选的说明
 * @returns 更新结果，包含树木健康变化
 */
export const updateTaskProgress = async (
  taskId: string,
  progress: number,
  notes?: string
): Promise<TaskProgressUpdateResponse> => {
  try {
    console.log(`更新任务进度: ${taskId} 进度: ${progress}`);
    const response = await api.put<{
      code: number;
      data: TaskProgressUpdateResponse;
      message: string;
    }>(`/tasks/${taskId}/progress`, { progress, notes });
    
    return response.data.data;
  } catch (error) {
    console.error(`更新任务进度失败: ${taskId}`, error);
    throw error;
  }
};

/**
 * 批量更新所有树木健康状态
 * @returns 更新结果
 */
export const batchUpdateTreesHealth = async (): Promise<{ message: string }> => {
  try {
    console.log('批量更新所有树木健康状态');
    const response = await api.post<{
      code: number;
      data: { message: string };
      message: string;
    }>('/trees/health/batch-update');
    
    return response.data.data;
  } catch (error) {
    console.error('批量更新所有树木健康状态失败', error);
    throw error;
  }
}; 