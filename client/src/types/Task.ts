/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = '低',
  MEDIUM = '中',
  HIGH = '高',
  URGENT = '紧急'
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = '待处理',
  IN_PROGRESS = '进行中',
  COMPLETED = '已完成',
}

/**
 * 任务类型定义
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
  deadline?: string;
  completedAt?: string;
  categoryId?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    treeType: string;
  };
  treeId?: number;
}

/**
 * 创建任务的请求数据类型
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  categoryId?: number;
  treeType?: string;
}

/**
 * 任务筛选条件
 */
export interface TaskFilters {
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  search?: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
} 