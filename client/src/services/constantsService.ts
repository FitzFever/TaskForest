/**
 * 常量相关API服务
 */
import api from './api';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '../types/Task';
import { TaskType, TreeType } from '../types/Task';

/**
 * 树木映射接口
 */
export interface TreeMappingsResponse {
  mappings: Record<string, string>;
  taskTypes: string[];
  treeTypes: string[];
}

/**
 * 获取任务类型与树木类型的映射关系
 * @returns 映射关系响应
 */
export const getTreeMappings = async (): Promise<AxiosResponse<ApiResponse<TreeMappingsResponse>>> => {
  try {
    const response = await api.get('/constants/tree-mappings');
    return response;
  } catch (error) {
    console.error('获取树木映射关系失败:', error);
    throw error;
  }
};

/**
 * 根据任务类型获取默认的树木类型
 * @param taskType 任务类型
 * @returns 对应的树木类型，如果没有映射关系则返回OAK
 */
export const getDefaultTreeTypeForTask = (taskType: TaskType): TreeType => {
  // 默认映射关系，与后端保持一致
  const defaultMappings: Record<TaskType, TreeType> = {
    [TaskType.NORMAL]: TreeType.OAK,      // 普通日常任务 -> 橡树
    [TaskType.RECURRING]: TreeType.PINE,   // 定期重复任务 -> 松树
    [TaskType.PROJECT]: TreeType.WILLOW,   // 长期项目任务 -> 柳树
    [TaskType.LEARNING]: TreeType.APPLE,   // 学习类任务 -> 苹果树
    [TaskType.WORK]: TreeType.MAPLE,       // 工作类任务 -> 枫树
    [TaskType.LEISURE]: TreeType.PALM      // 休闲类任务 -> 棕榈树
  };
  
  return defaultMappings[taskType] || TreeType.OAK;
}; 