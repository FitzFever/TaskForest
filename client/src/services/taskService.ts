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
  pageSize?: number;
}

/**
 * 获取任务列表
 * @param params 查询参数
 * @returns 任务列表响应
 */
export const getTasks = async (params?: GetTasksParams): Promise<any> => {
  try {
    console.log('开始请求任务列表，原始参数:', JSON.stringify(params, null, 2));
    
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    // 添加默认分页参数，确保即使params为空也有分页
    let page = params?.page || 1;
    let limit = params?.limit || params?.pageSize || 10;
    
    // 记录最终使用的分页参数
    console.log(`最终分页参数: page=${page}, limit=${limit}`);
    
    // 添加分页参数
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (params) {
      // 添加其他过滤参数
      if (params.status) {
        queryParams.append('status', params.status);
        console.log(`添加状态过滤参数: status=${params.status}`);
      }
      
      if (params.priority) {
        queryParams.append('priority', params.priority.toString());
        console.log(`添加优先级过滤参数: priority=${params.priority}`);
      }
      
      if (params.search) {
        queryParams.append('search', params.search);
        console.log(`添加搜索参数: search=${params.search}`);
      }
      
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
        console.log(`添加排序字段参数: sortBy=${params.sortBy}`);
      }
      
      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
        console.log(`添加排序方向参数: sortOrder=${params.sortOrder}`);
      }
      
      // 处理标签过滤
      if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => {
          queryParams.append('tags', tag);
          console.log(`添加标签过滤参数: tags=${tag}`);
        });
      }
      
      // 处理日期过滤
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
        console.log(`添加开始日期参数: startDate=${params.startDate}`);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
        console.log(`添加结束日期参数: endDate=${params.endDate}`);
      }
      
      if (params.treeType) {
        queryParams.append('treeType', params.treeType);
        console.log(`添加树木类型参数: treeType=${params.treeType}`);
      }
    }
    
    // 构建请求URL
    const queryString = queryParams.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    
    console.log('最终请求URL:', url);
    
    // 发送请求
    const response = await api.get(url);
    console.log('获取任务列表响应状态:', response.status);
    
    // 打印完整响应结构以便调试
    console.log('API响应数据结构:', JSON.stringify(response.data, null, 2));
    
    // 基本校验确保响应有数据
    if (!response.data) {
      console.error('API响应缺少data字段:', response);
      throw new Error('API响应格式错误: 缺少data字段');
    }
    
    // 直接返回完整响应，让调用者处理具体数据结构
    return response;
    
  } catch (error) {
    console.error('获取任务列表失败:', error);
    throw error;
  }
};

/**
 * 获取任务统计
 * @returns 任务统计信息
 */
export const getTaskStats = async (): Promise<any> => {
  try {
    console.log('开始请求任务统计数据');
    
    const response = await api.get('/tasks/stats');
    console.log('获取任务统计响应:', response);
    
    // 校验响应格式
    if (response.data && response.data.data) {
      console.log('有效任务统计数据:', response.data.data);
      return response;
    } else {
      console.error('无效的任务统计数据结构:', response);
      throw new Error('任务统计数据格式不正确');
    }
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