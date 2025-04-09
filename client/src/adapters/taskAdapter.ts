import { ApiTask, CreateTaskRequest, UpdateTaskRequest } from '../services/taskService';
import { Task, TaskPriority, TaskStatus, CreateTaskData } from '../types/Task';
import { TreeType } from '../types/Tree';

/**
 * 将后端API任务对象转换为前端使用的任务对象
 * @param apiTask 后端API返回的任务对象
 * @returns 前端使用的任务对象
 */
export const apiTaskToFrontendTask = (apiTask: ApiTask): Task => {
  console.log('API返回的原始任务数据:', apiTask);

  // 将API返回的状态字符串映射到前端枚举
  let status: TaskStatus;
  switch(apiTask.status) {
    case 'TODO':
      status = TaskStatus.TODO;
      break;
    case 'IN_PROGRESS':
      status = TaskStatus.IN_PROGRESS;
      break;
    case 'COMPLETED':
      status = TaskStatus.COMPLETED;
      break;
    default:
      status = TaskStatus.TODO; // 默认状态
  }

  // 将API返回的优先级映射到前端枚举
  let priority: TaskPriority;
  switch(apiTask.type) {
    case '低':
      priority = TaskPriority.LOW;
      break;
    case '中':
      priority = TaskPriority.MEDIUM;
      break;
    case '高':
      priority = TaskPriority.HIGH;
      break;
    case '紧急':
      priority = TaskPriority.URGENT;
      break;
    default:
      priority = TaskPriority.MEDIUM; // 默认优先级
  }

  // 将treeType转换为枚举值
  let treeType: TreeType;
  switch(apiTask.treeType?.toUpperCase()) {
    case 'OAK':
      treeType = TreeType.OAK;
      break;
    case 'PINE':
      treeType = TreeType.PINE;
      break;
    case 'CHERRY':
      treeType = TreeType.CHERRY;
      break;
    case 'MAPLE':
      treeType = TreeType.MAPLE;
      break;
    case 'PALM':
      treeType = TreeType.PALM;
      break;
    default:
      treeType = TreeType.OAK; // 默认树类型
  }

  // 返回映射后的前端任务对象
  const result = {
    id: parseInt(apiTask.id) || Math.floor(Math.random() * 10000), // 后端可能返回字符串ID，转为数字
    title: apiTask.title,
    description: apiTask.description,
    priority: priority,
    status: status,
    completed: status === TaskStatus.COMPLETED,
    deadline: apiTask.dueDate,
    completedAt: apiTask.completedAt,
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
    category: {
      id: 0, // 占位
      name: apiTask.treeType || 'oak',
      treeType: treeType.toString()
    },
    treeId: 0 // 占位
  };

  console.log('转换后的前端任务格式:', result);
  return result;
};

/**
 * 将前端任务对象转换为API请求格式
 * @param task 前端任务对象
 * @returns API请求格式的任务对象
 */
export const frontendTaskToApiTask = (task: Task): Partial<ApiTask> => {
  // 将前端状态枚举映射到API状态字符串
  let status: ApiTask['status'];
  switch(task.status) {
    case TaskStatus.TODO:
      status = 'TODO';
      break;
    case TaskStatus.IN_PROGRESS:
      status = 'IN_PROGRESS';
      break;
    case TaskStatus.COMPLETED:
      status = 'COMPLETED';
      break;
    default:
      status = 'TODO';
  }

  // 将前端优先级枚举映射到API类型字符串
  let type: string;
  switch(task.priority) {
    case TaskPriority.LOW:
      type = '低';
      break;
    case TaskPriority.MEDIUM:
      type = '中';
      break;
    case TaskPriority.HIGH:
      type = '高';
      break;
    case TaskPriority.URGENT:
      type = '紧急';
      break;
    default:
      type = '中';
  }

  return {
    id: task.id.toString(),
    title: task.title,
    description: task.description,
    status: status,
    type: type,
    dueDate: task.deadline || new Date().toISOString(),
    treeType: task.category?.treeType || '',
    tags: [] // 默认空标签
  };
};

/**
 * 将前端CreateTaskData转换为API的CreateTaskRequest
 * @param taskData 前端创建任务数据
 * @returns API创建任务请求
 */
export const createTaskDataToRequest = (taskData: CreateTaskData): CreateTaskRequest => {
  // 将前端优先级枚举映射到API类型字符串
  let type: string;
  switch(taskData.priority) {
    case TaskPriority.LOW:
      type = 'NORMAL';
      break;
    case TaskPriority.MEDIUM:
      type = 'WORK';
      break;
    case TaskPriority.HIGH:
      type = 'PROJECT';
      break;
    case TaskPriority.URGENT:
      type = 'LEARNING';
      break;
    default:
      type = 'NORMAL';
  }

  // 将前端优先级枚举映射到API的优先级(1-5)
  let priorityValue: number;
  switch(taskData.priority) {
    case TaskPriority.LOW:
      priorityValue = 1;
      break;
    case TaskPriority.MEDIUM:
      priorityValue = 2;
      break;
    case TaskPriority.HIGH:
      priorityValue = 4;
      break;
    case TaskPriority.URGENT:
      priorityValue = 5;
      break;
    default:
      priorityValue = 2; // 默认中优先级
  }

  console.log('正在转换任务数据为API请求格式:', taskData);

  // 创建符合API要求的请求对象
  const request: CreateTaskRequest = {
    title: taskData.title,
    description: taskData.description || '',
    type: type,
    priority: priorityValue,
    dueDate: taskData.deadline || new Date().toISOString(),
    treeType: taskData.treeType?.toUpperCase() || 'OAK',
    tags: []
  };

  console.log('转换后的API请求格式:', request);
  return request;
};

/**
 * 将前端Task转换为API的UpdateTaskRequest
 * @param task 前端任务
 * @returns API更新任务请求
 */
export const taskToUpdateRequest = (task: Task): UpdateTaskRequest => {
  // 将前端优先级枚举映射到API类型字符串
  let type: string;
  switch(task.priority) {
    case TaskPriority.LOW:
      type = '低';
      break;
    case TaskPriority.MEDIUM:
      type = '中';
      break;
    case TaskPriority.HIGH:
      type = '高';
      break;
    case TaskPriority.URGENT:
      type = '紧急';
      break;
    default:
      type = '中';
  }

  const request: UpdateTaskRequest = {
    title: task.title,
    description: task.description,
    type: type,
    dueDate: task.deadline,
    treeType: task.category?.treeType
  };

  console.log('更新任务请求数据:', request);
  return request;
};

/**
 * 将多个后端API任务对象转换为前端使用的任务对象数组
 * @param apiTasks 后端API返回的任务对象数组
 * @returns 前端使用的任务对象数组
 */
export const apiTasksToFrontendTasks = (apiTasks: ApiTask[]): Task[] => {
  return apiTasks.map(apiTaskToFrontendTask);
};

/**
 * 创建前端任务显示对象（简化版，用于列表展示）
 * @param apiTask API任务
 * @returns 显示用任务对象
 */
export const createTaskDisplayObject = (apiTask: ApiTask) => {
  // 将treeType转换为枚举值
  let treeType: TreeType;
  switch(apiTask.treeType?.toUpperCase()) {
    case 'OAK':
      treeType = TreeType.OAK;
      break;
    case 'PINE':
      treeType = TreeType.PINE;
      break;
    case 'CHERRY':
      treeType = TreeType.CHERRY;
      break;
    case 'MAPLE':
      treeType = TreeType.MAPLE;
      break;
    case 'PALM':
      treeType = TreeType.PALM;
      break;
    default:
      treeType = TreeType.OAK; // 默认树类型
  }

  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    status: apiTask.status,
    treeType: treeType,
    createdAt: apiTask.createdAt,
    completedAt: apiTask.completedAt
  };
};

export default {
  apiTaskToFrontendTask,
  frontendTaskToApiTask,
  apiTasksToFrontendTasks,
  createTaskDisplayObject,
  createTaskDataToRequest,
  taskToUpdateRequest
}; 