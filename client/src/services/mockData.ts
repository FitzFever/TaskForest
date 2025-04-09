/**
 * 模拟数据服务
 * 提供前端开发和测试时使用的模拟任务数据
 */

export interface MockTask {
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

// 模拟任务数据
export const mockTasks: MockTask[] = [
  {
    id: '1001',
    title: '完成项目报告',
    description: '完成季度项目进度报告并提交给项目经理',
    type: '工作',
    status: 'TODO',
    priority: 3,
    dueDate: '2023-05-20T00:00:00.000Z',
    createdAt: '2023-05-10T09:00:00.000Z',
    updatedAt: '2023-05-10T09:00:00.000Z',
    tags: ['报告', '项目'],
    treeType: 'OAK',
    growthStage: 1
  },
  {
    id: '1002',
    title: '安排团队会议',
    description: '为下周的项目启动安排团队会议',
    type: '工作',
    status: 'IN_PROGRESS',
    priority: 2,
    dueDate: '2023-05-15T00:00:00.000Z',
    createdAt: '2023-05-09T14:30:00.000Z',
    updatedAt: '2023-05-11T10:15:00.000Z',
    tags: ['会议', '团队'],
    treeType: 'PINE',
    growthStage: 2
  },
  {
    id: '1003',
    title: '健身锻炼',
    description: '进行30分钟有氧运动和力量训练',
    type: '个人',
    status: 'TODO',
    priority: 1,
    dueDate: '2023-05-14T00:00:00.000Z',
    createdAt: '2023-05-10T18:00:00.000Z',
    updatedAt: '2023-05-10T18:00:00.000Z',
    tags: ['健身', '健康'],
    treeType: 'MAPLE',
    growthStage: 0
  },
  {
    id: '1004',
    title: '学习React新特性',
    description: '学习并实践React 18的新特性和并发模式',
    type: '学习',
    status: 'COMPLETED',
    priority: 2,
    dueDate: '2023-05-08T00:00:00.000Z',
    createdAt: '2023-05-05T10:00:00.000Z',
    updatedAt: '2023-05-08T16:30:00.000Z',
    completedAt: '2023-05-08T16:30:00.000Z',
    tags: ['React', '编程', '学习'],
    treeType: 'APPLE',
    growthStage: 4
  },
  {
    id: '1005',
    title: '准备技术演讲',
    description: '为下个月的技术分享会准备关于前端优化的演讲',
    type: '工作',
    status: 'IN_PROGRESS',
    priority: 3,
    dueDate: '2023-05-25T00:00:00.000Z',
    createdAt: '2023-05-07T11:20:00.000Z',
    updatedAt: '2023-05-12T09:45:00.000Z',
    tags: ['演讲', '前端', '优化'],
    treeType: 'WILLOW',
    growthStage: 3
  }
];

// 任务ID计数器，用于创建新任务
let taskIdCounter = 1006;

/**
 * 获取所有模拟任务
 * @returns 任务列表
 */
export const getMockTasks = (): MockTask[] => {
  return [...mockTasks];
};

/**
 * 根据ID获取模拟任务
 * @param id 任务ID
 * @returns 任务对象，如果未找到则返回undefined
 */
export const getMockTask = (id: string): MockTask | undefined => {
  return mockTasks.find(task => task.id === id);
};

/**
 * 添加新的模拟任务
 * @param task 任务对象（不需要包含ID，函数会自动分配）
 * @returns 添加后的任务对象（包含ID）
 */
export const addMockTask = (task: MockTask): MockTask => {
  const newTask = {
    ...task,
    id: task.id || String(taskIdCounter++)
  };
  mockTasks.push(newTask);
  return newTask;
};

/**
 * 更新模拟任务
 * @param id 任务ID
 * @param updates 需要更新的字段
 * @returns 更新后的任务对象，如果未找到则返回undefined
 */
export const updateMockTask = (id: string, updates: Partial<MockTask>): MockTask | undefined => {
  const taskIndex = mockTasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return undefined;
  }
  
  const updatedTask = {
    ...mockTasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  mockTasks[taskIndex] = updatedTask;
  return updatedTask;
};

/**
 * 删除模拟任务
 * @param id 任务ID
 * @returns 是否成功删除
 */
export const deleteMockTask = (id: string): boolean => {
  const taskIndex = mockTasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return false;
  }
  
  mockTasks.splice(taskIndex, 1);
  return true;
};

/**
 * 获取模拟任务列表响应
 * @returns 包含任务列表和分页信息的响应对象
 */
export const getMockTaskListResponse = () => {
  const tasks = getMockTasks();
  return {
    tasks,
    pagination: {
      total: tasks.length,
      page: 1,
      limit: tasks.length,
      pages: 1
    }
  };
};

/**
 * 获取模拟任务状态
 * @param id 任务ID
 * @returns 任务状态信息
 */
export const getMockTaskStatus = (id: string) => {
  const task = getMockTask(id);
  if (!task) {
    return null;
  }
  
  return {
    id: task.id,
    status: task.status,
    updatedAt: new Date().toISOString()
  };
};

/**
 * 获取模拟任务树木
 * @param id 任务ID
 * @returns 任务树木信息
 */
export const getMockTaskTree = (id: string) => {
  const task = getMockTask(id);
  if (!task) {
    return null;
  }
  
  return {
    id: task.id,
    treeType: task.treeType,
    growthStage: task.growthStage
  };
};

/**
 * 获取模拟任务统计
 * @returns 任务统计信息
 */
export const getMockTaskStats = () => {
  const tasks = getMockTasks();
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'COMPLETED').length;
  const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const todo = tasks.filter(task => task.status === 'TODO').length;
  
  return {
    total,
    completed,
    inProgress,
    todo,
    completionRate: total > 0 ? (completed / total) * 100 : 0
  };
};

// 导出默认对象
export default {
  getMockTasks,
  getMockTask,
  addMockTask,
  updateMockTask,
  deleteMockTask,
  getMockTaskListResponse,
  getMockTaskStatus,
  getMockTaskTree,
  getMockTaskStats
}; 