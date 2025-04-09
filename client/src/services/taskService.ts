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
  TreeType,
  ApiResponse,
  TaskPriority
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

export interface GetTasksParams {
  search?: string;
  status?: TaskStatus;
  tags?: string[];
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  treeType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * 获取任务列表
 */
export const getTasks = async (params?: GetTasksParams): Promise<AxiosResponse<ApiResponse<TaskListResponse>>> => {
  console.group('TaskService.getTasks');
  try {
    // 构建查询参数
    const queryParams: Record<string, any> = {};
    console.log('原始参数:', params);
    
    if (params) {
      if (params.search) {
        // 确保搜索参数正确编码
        queryParams.search = encodeURIComponent(params.search);
        console.log('编码后的搜索参数:', queryParams.search);
      }
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.tags && params.tags.length > 0) {
        // 确保标签正确编码
        console.log('处理标签参数（原始）:', params.tags);
        
        // 直接使用逗号分隔的字符串，符合API文档规范
        const encodedTags = params.tags.map(tag => {
          // 检查是否已经有tag:前缀
          if (tag.startsWith('tag:')) {
            // 保留tag:前缀，但编码其后的值
            const prefix = 'tag:';
            const value = tag.substring(4);
            console.log(`  - 特殊标签 [${tag}] -> 前缀:${prefix}, 值:${value}`);
            // 使用encodeURIComponent确保中文和特殊字符正确编码
            const result = `${prefix}${encodeURIComponent(value)}`;
            console.log(`  - 编码后 -> ${result}`);
            return result;
          }
          // 普通标签直接编码
          console.log(`  - 普通标签 [${tag}]`);
          // 使用encodeURIComponent确保中文和特殊字符正确编码
          const result = encodeURIComponent(tag);
          console.log(`  - 编码后 -> ${result}`);
          return result;
        });
        
        // 使用逗号拼接多个标签，符合API格式要求
        queryParams.tags = encodedTags.join(',');
        console.log('最终构建的标签参数:', queryParams.tags);
      }
      if (params.priority) {
        queryParams.priority = params.priority;
      }
      if (params.startDate) {
        queryParams.startDate = params.startDate;
      }
      if (params.endDate) {
        queryParams.endDate = params.endDate;
      }
      if (params.treeType) {
        queryParams.treeType = params.treeType;
      }
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
      }
      if (params.sortOrder) {
        queryParams.sortOrder = params.sortOrder;
      }
      if (params.page) {
        queryParams.page = params.page;
      }
      if (params.limit) {
        queryParams.limit = params.limit;
      }
    }
    
    // 构建完整请求URL以便调试
    const url = '/tasks';
    const fullRequestUrl = `${api.defaults.baseURL}${url}?${new URLSearchParams(queryParams).toString()}`;
    console.log('完整请求URL:', fullRequestUrl);
    console.log('控制台测试命令:', `curl -s '${fullRequestUrl}' | cat`);
    
    // 发送请求，附带查询参数
    const response = await api.get(url, { params: queryParams });
    console.log('API响应:', response.data);
    return response;
  } catch (error) {
    console.error('获取任务列表失败:', error);
    throw error;
  } finally {
    console.groupEnd();
  }
};

/**
 * 获取任务统计信息
 * @returns 任务统计数据
 */
export const getTaskStats = async (): Promise<AxiosResponse<ApiResponse<any>>> => {
  try {
    const response = await api.get('/tasks/stats');
    return response;
  } catch (error) {
    console.error('获取任务统计失败:', error);
    throw error;
  }
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