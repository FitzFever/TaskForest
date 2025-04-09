/**
 * 任务相关API服务
 */
import api from './api';
import { AxiosResponse } from 'axios';
import type { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskListResponse,
  TaskStats,
  TaskStatus,
  TaskType,
  TreeType
} from '../types/Task';

// API任务接口
export interface ApiTask {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags: string[];
  treeType: string;
  growthStage: number;
}

// 任务树接口
export interface TaskTree {
  id: string;
  treeType: TreeType;
  growthStage: number;
}

// API标准响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

/**
 * 获取任务列表
 */
export const getTasks = async (params?: {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  type?: TaskType;
  sort?: string;
  order?: string;
}): Promise<AxiosResponse<ApiResponse<{
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}>>> => {
  const response = await api.get('/tasks', { params });
  return response;
};

/**
 * 获取任务统计信息
 */
export const getTaskStats = async (): Promise<AxiosResponse<ApiResponse<TaskStats>>> => {
  const response = await api.get('/tasks/stats');
  return response;
};

/**
 * 创建任务
 */
export const createTask = async (task: CreateTaskRequest): Promise<AxiosResponse<ApiResponse<Task>>> => {
  const response = await api.post('/tasks', task);
  return response;
};

/**
 * 更新任务
 */
export const updateTask = async (
  taskId: string, 
  task: UpdateTaskRequest
): Promise<AxiosResponse<ApiResponse<Task>>> => {
  const response = await api.put(`/tasks/${taskId}`, task);
  return response;
};

/**
 * 更新任务状态
 */
export const updateTaskStatus = async (
  taskId: string, 
  status: TaskStatus
): Promise<AxiosResponse<ApiResponse<Task>>> => {
  const response = await api.put(`/tasks/${taskId}/status`, { status });
  return response;
};

/**
 * 完成任务
 */
export const completeTask = async (taskId: string): Promise<AxiosResponse<ApiResponse<Task>>> => {
  const response = await api.patch(`/tasks/${taskId}/complete`);
  return response;
};

/**
 * 删除任务
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

/**
 * 获取指定ID的任务
 * @param taskId 任务ID
 * @returns 任务对象
 */
export const getTask = async (taskId: string): Promise<AxiosResponse<ApiResponse<Task>>> => {
  const response = await api.get(`/tasks/${taskId}`);
  return response;
};

/**
 * 获取任务关联的树信息
 * @param id 任务ID
 */
export const getTaskTree = async (id: string): Promise<AxiosResponse<ApiResponse<TaskTree>> | null> => {
  try {
    const response = await api.get(`/tasks/${id}/tree`);
    return response;
  } catch (error) {
    console.error(`获取任务树信息失败 ID:${id}:`, error);
    return null;
  }
}; 