/**
 * 任务相关API服务
 */
import api from './api';
import mockData from './mockData';

// 使用环境变量和环境来控制是否使用模拟数据
export const USE_MOCK = import.meta.env.VITE_REACT_APP_USE_MOCK === 'true';

// 每次API调用前都打印模拟状态
console.log('当前API调用模式:', USE_MOCK ? '使用模拟数据' : '使用真实API');
console.log('环境变量状态:', {
  VITE_REACT_APP_USE_MOCK: import.meta.env.VITE_REACT_APP_USE_MOCK,
  VITE_REACT_APP_DEV_API_URL: import.meta.env.VITE_REACT_APP_DEV_API_URL
});

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

// 任务列表响应接口
export interface TaskListResponse {
  tasks: ApiTask[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// 创建任务请求接口
export interface CreateTaskRequest {
  title: string;
  description: string;
  type: string;
  priority: number;
  dueDate: string;
  tags?: string[];
  treeType: string;
}

// 更新任务请求接口
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: string;
  priority?: number;
  dueDate?: string;
  tags?: string[];
  treeType?: string;
}

// 任务树接口
export interface TaskTree {
  id: string;
  treeType: string;
  growthStage: number;
}

// 任务统计接口
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  cancelled: number;
  completionRate: number;
}

/**
 * 获取所有任务
 * @returns 包含任务列表和分页信息的响应对象
 */
export const getAllTasks = async (): Promise<TaskListResponse> => {
  if (USE_MOCK) {
    // 使用模拟数据
    return mockData.getMockTaskListResponse();
  }
  
  // 使用真实API
  const response = await api.get<TaskListResponse>('/tasks');
  return response.data;
};

/**
 * 获取指定ID的任务
 * @param taskId 任务ID
 * @returns 任务对象
 */
export const getTask = async (taskId: string): Promise<ApiTask> => {
  if (USE_MOCK) {
    // 使用模拟数据
    const task = mockData.getMockTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    return task;
  }
  
  // 使用真实API
  const response = await api.get<ApiTask>(`/tasks/${taskId}`);
  return response.data;
};

/**
 * 创建新任务
 * @param taskData 任务数据
 * @returns 创建的任务对象
 */
export const createTask = async (taskData: CreateTaskRequest): Promise<ApiTask> => {
  if (USE_MOCK) {
    // 使用模拟数据
    const newTask = mockData.addMockTask({
      ...taskData,
      id: '', // 会由mockData自动分配ID
      status: 'TODO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: taskData.tags || [],
      growthStage: 0
    });
    return newTask;
  }
  
  // 使用真实API
  try {
    const response = await api.post<ApiTask>('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('创建任务失败:', error);
    throw error;
  }
};

/**
 * 更新任务
 * @param taskId 任务ID
 * @param updateData 更新数据
 * @returns 更新后的任务对象
 */
export const updateTask = async (taskId: string, updateData: UpdateTaskRequest): Promise<ApiTask> => {
  if (USE_MOCK) {
    // 使用模拟数据
    const updatedTask = mockData.updateMockTask(taskId, updateData);
    if (!updatedTask) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    return updatedTask;
  }
  
  // 使用真实API
  const response = await api.put<ApiTask>(`/tasks/${taskId}`, updateData);
  return response.data;
};

/**
 * 更新任务状态
 * @param taskId 任务ID
 * @param status 新状态
 * @returns 更新后的任务对象
 */
export const updateTaskStatus = async (taskId: string, status: string): Promise<ApiTask> => {
  if (USE_MOCK) {
    // 使用模拟数据
    const updatedTask = mockData.updateMockTask(taskId, { status });
    if (!updatedTask) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    return updatedTask;
  }
  
  // 使用真实API
  const response = await api.patch<ApiTask>(`/tasks/${taskId}/status`, { status });
  return response.data;
};

/**
 * 完成任务
 * @param taskId 任务ID
 * @returns 更新后的任务对象
 */
export const completeTask = async (taskId: string): Promise<ApiTask> => {
  if (USE_MOCK) {
    // 使用模拟数据
    const completedAt = new Date().toISOString();
    const updatedTask = mockData.updateMockTask(taskId, { 
      status: 'COMPLETED', 
      completedAt,
      growthStage: 4 // 设置为最高生长阶段
    });
    if (!updatedTask) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    return updatedTask;
  }
  
  // 使用真实API
  try {
    const response = await api.patch<ApiTask>(`/tasks/${taskId}/complete`, {});
    return response.data;
  } catch (error) {
    console.error('完成任务失败:', error);
    throw error;
  }
};

/**
 * 删除任务
 * @param taskId 任务ID
 * @returns 是否成功删除
 */
export const deleteTask = async (taskId: string): Promise<boolean> => {
  if (USE_MOCK) {
    // 使用模拟数据
    return mockData.deleteMockTask(taskId);
  }
  
  // 使用真实API
  await api.delete(`/tasks/${taskId}`);
  return true;
};

/**
 * 获取任务关联的树信息
 * @param id 任务ID
 */
export const getTaskTree = async (id: string): Promise<TaskTree | null> => {
  try {
    if (USE_MOCK) {
      return mockData.getMockTaskTree(id);
    }
    
    const response = await api.get<TaskTree>(`/tasks/${id}/tree`);
    return response.data;
  } catch (error) {
    console.error(`获取任务树信息失败 ID:${id}:`, error);
    return null;
  }
};

/**
 * 获取任务统计信息
 */
export const getTaskStats = async (): Promise<TaskStats> => {
  try {
    if (USE_MOCK) {
      const stats = mockData.getMockTaskStats();
      return {
        ...stats,
        cancelled: 0  // 添加缺失的cancelled字段
      };
    }
    
    const response = await api.get<TaskStats>('/tasks/stats');
    return response.data;
  } catch (error) {
    console.error('获取任务统计失败:', error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      cancelled: 0,
      completionRate: 0
    };
  }
}; 