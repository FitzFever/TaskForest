/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * 任务类型枚举
 */
export enum TaskType {
  NORMAL = 'NORMAL',
  RECURRING = 'RECURRING',
  PROJECT = 'PROJECT',
  LEARNING = 'LEARNING',
  WORK = 'WORK',
  LEISURE = 'LEISURE'
}

/**
 * 树木类型枚举
 */
export enum TreeType {
  OAK = 'OAK',
  PINE = 'PINE',
  CHERRY = 'CHERRY',
  PALM = 'PALM',
  APPLE = 'APPLE',
  MAPLE = 'MAPLE',
  WILLOW = 'WILLOW'
}

/**
 * 任务接口
 */
export interface Task {
  id: string | number;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completed?: boolean;
  tags?: string[];
  treeType?: TreeType;
  growthStage?: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    treeType: string;
  };
  treeId?: number;
}

/**
 * 创建任务请求接口
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate?: string;
  deadline?: string;
  tags?: string[];
  treeType?: TreeType;
  categoryId?: number;
}

/**
 * 更新任务请求接口
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  dueDate?: string;
  deadline?: string;
  tags?: string[];
  treeType?: TreeType;
  categoryId?: number;
}

/**
 * 任务列表响应接口
 */
export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * API响应接口
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

/**
 * 任务统计接口
 */
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  cancelled: number;
  completionRate: number;
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