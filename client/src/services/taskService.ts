/**
 * 任务相关API服务
 */
import api from './api';

// 任务类型定义
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  parentId?: string;
  tags: string[];
  treeType: string;
  growthStage: number;
}

// 任务列表响应
export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// 任务过滤条件
export interface TaskFilter {
  status?: string;
  type?: string;
  dueDate?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 获取任务列表
 * @param filter 过滤条件
 * @returns 任务列表响应
 */
export const getTasks = async (filter: TaskFilter = {}): Promise<TaskListResponse> => {
  const response = await api.get('/tasks', { params: filter });
  return response.data;
};

/**
 * 获取单个任务
 * @param id 任务ID
 * @returns 任务详情
 */
export const getTask = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

/**
 * 创建任务
 * @param task 任务数据
 * @returns 创建的任务
 */
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'growthStage'>): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

/**
 * 更新任务
 * @param id 任务ID
 * @param task 需要更新的任务字段
 * @returns 更新后的任务
 */
export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

/**
 * 删除任务
 * @param id 任务ID
 */
export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

/**
 * 更新任务状态
 * @param id 任务ID
 * @param status 新状态
 * @returns 更新结果
 */
export const updateTaskStatus = async (id: string, status: Task['status']): Promise<{ id: string; status: string; updatedAt: string }> => {
  const response = await api.put(`/tasks/${id}/status`, { status });
  return response.data;
};

/**
 * 完成任务
 * @param id 任务ID
 * @returns 完成结果
 */
export const completeTask = async (id: string): Promise<{ id: string; status: string; completedAt: string; updatedAt: string; growthStage: number }> => {
  const response = await api.post(`/tasks/${id}/complete`);
  return response.data;
};

// 导出任务服务
const taskService = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  completeTask
};

export default taskService; 