/**
 * 批量任务服务
 * 提供批量创建任务和任务树的功能
 */
import api from './api';
import { AxiosResponse } from 'axios';
import type { Task, ApiResponse, CreateTaskRequest, TaskType } from '../types/Task';

// 批量任务请求接口
export interface BatchTasksRequest {
  tasks: CreateTaskRequest[];
}

// 批量任务和任务树请求接口
export interface BatchTasksWithTreesRequest {
  tasks: {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    complexity?: string;
    dueDate?: string;
    type?: string;
    tags?: string[];
    subTasks: {
      title: string;
      description: string;
      status?: string;
      priority?: string;
      estimatedHours?: number;
      type?: string;
      tags?: string[];
    }[];
  }[];
  createTrees?: boolean;
}

// 批量任务创建响应接口
export interface BatchTasksResponse {
  tasks: Task[];
}

// 批量任务和任务树创建响应接口
export interface BatchTasksWithTreesResponse {
  tasks: {
    mainTask: Task;
    subTasks: Task[];
  }[];
  trees: {
    id: string;
    name: string;
    type: string;
    taskId: string;
    growthStage: number;
    health: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

/**
 * 批量创建任务
 * @param request 批量任务请求
 * @returns 批量任务创建响应
 */
export const createBatchTasks = async (
  request: BatchTasksRequest
): Promise<AxiosResponse<ApiResponse<BatchTasksResponse>>> => {
  try {
    const response = await api.post('/batch-tasks', request);
    return response;
  } catch (error) {
    console.error('批量创建任务失败:', error);
    throw error;
  }
};

/**
 * 批量创建任务和任务树
 * @param request 批量任务和任务树请求
 * @returns 批量任务和任务树创建响应
 */
export const createBatchTasksWithTrees = async (
  request: BatchTasksWithTreesRequest
): Promise<AxiosResponse<ApiResponse<BatchTasksWithTreesResponse>>> => {
  try {
    const response = await api.post('/batch-tasks/with-trees', request);
    return response;
  } catch (error) {
    console.error('批量创建任务和任务树失败:', error);
    throw error;
  }
};

/**
 * 从任务分解结果创建批量任务和任务树
 * @param mainTask 主任务
 * @param subTasks 子任务数组
 * @param createTrees 是否创建任务树
 * @returns 批量任务和任务树创建响应
 */
export const createTasksFromDecomposition = async (
  mainTask: {
    title: string;
    description: string;
    complexity?: string;
    priority?: string;
    dueDate?: string;
    type?: string;
    tags?: string[];
  },
  subTasks: {
    title: string;
    description: string;
    priority?: string;
    estimatedHours?: number;
    type?: string;
    tags?: string[];
  }[],
  createTrees: boolean = true
): Promise<AxiosResponse<ApiResponse<BatchTasksWithTreesResponse>>> => {
  try {
    // 确保复杂度参数与后端期望的格式匹配
    let complexity = mainTask.complexity;
    if (complexity === 'SIMPLE') complexity = 'LOW';
    else if (complexity === 'COMPLEX') complexity = 'HIGH';
    
    // 默认任务类型和标签
    const defaultType = 'NORMAL';
    const defaultTags = ['AI生成'];
    
    const request: BatchTasksWithTreesRequest = {
      tasks: [{
        ...mainTask,
        complexity,
        // 确保主任务有类型和标签
        type: mainTask.type || defaultType,
        tags: mainTask.tags || defaultTags,
        subTasks: subTasks.map(subTask => ({
          ...subTask,
          status: '未开始',
          // 确保子任务有类型和标签，用明确的类型值替代直接使用可能为undefined的字段
          type: (subTask.type && subTask.type.trim() !== '') ? subTask.type : defaultType,
          tags: (Array.isArray(subTask.tags) && subTask.tags.length > 0) ? subTask.tags : defaultTags,
          // 确保estimatedHours是一个数字
          estimatedHours: typeof subTask.estimatedHours === 'number' ? subTask.estimatedHours : 1
        }))
      }],
      createTrees
    };
    
    console.log('从任务分解结果创建批量任务请求:', JSON.stringify(request, null, 2));
    return await createBatchTasksWithTrees(request);
  } catch (error) {
    console.error('从任务分解结果创建批量任务失败:', error);
    throw error;
  }
}; 