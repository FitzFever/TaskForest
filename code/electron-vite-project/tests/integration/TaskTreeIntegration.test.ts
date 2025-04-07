import TaskService from '../../src/services/TaskService';
import TreeService from '../../src/services/TreeService';
import { TaskPriority, TaskStatus, CreateTaskData } from '../../src/types/Task';
import { Task } from '../../src/types/Task';
import { Tree } from '../../src/types/Tree';

// 模拟TreeService
jest.mock('../../src/services/TreeService', () => ({
  __esModule: true,
  default: {
    createTree: jest.fn().mockImplementation(() => Promise.resolve({
      id: 202,
      type: 'oak',
      growthStage: 1,
      positionX: 0,
      positionZ: 0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    })),
    growTree: jest.fn().mockImplementation(() => Promise.resolve(true)),
    deleteTree: jest.fn().mockImplementation(() => Promise.resolve(true)),
    getTrees: jest.fn().mockImplementation(() => Promise.resolve([]))
  }
}));

// 为window.electron属性创建全局模拟
// @ts-ignore
window.electron = {
  createTask: jest.fn(),
  getTasks: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  completeTask: jest.fn(),
  getTrees: jest.fn(),
  createTree: jest.fn(),
  growTree: jest.fn(),
  deleteTree: jest.fn()
};

// 模拟数据
const mockTaskId = 101;
const mockTreeId = 202;
const mockCategory = {
  id: 1,
  name: '工作',
  treeType: 'oak'
};
const mockTask: Task = {
  id: mockTaskId,
  title: '测试任务',
  description: '测试描述',
  priority: TaskPriority.MEDIUM,
  status: TaskStatus.IN_PROGRESS,
  completed: false,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  category: mockCategory
};
const mockTree: Tree = {
  id: mockTreeId,
  type: 'oak',
  growthStage: 1,
  positionX: 0,
  positionZ: 0,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01'
};

// 重置所有 mock
beforeEach(() => {
  jest.clearAllMocks();
  
  // 设置模拟返回值
  // @ts-ignore
  window.electron.createTask.mockResolvedValue(mockTask);
  // @ts-ignore
  window.electron.completeTask.mockResolvedValue({...mockTask, completed: true, status: TaskStatus.COMPLETED});
});

describe('任务与树木交互集成测试', () => {
  test('创建任务时应该同时创建一棵树', async () => {
    // 创建任务
    const taskData: CreateTaskData = {
      title: '测试任务',
      description: '测试描述',
      priority: TaskPriority.MEDIUM,
      categoryId: mockCategory.id
    };
    const task = await TaskService.createTask(taskData);
    
    // 验证任务创建成功
    expect(task).toEqual(mockTask);
    // @ts-ignore
    expect(window.electron.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '测试任务',
        description: '测试描述',
        priority: TaskPriority.MEDIUM
      })
    );
    
    // 验证树创建
    expect(TreeService.createTree).toHaveBeenCalledWith('oak', mockTaskId);
  });
  
  test('完成任务时应该增加树的生长阶段', async () => {
    // 完成任务
    const completedTask = await TaskService.completeTask(mockTaskId);
    
    // 验证任务已完成
    expect(completedTask).toEqual({...mockTask, completed: true, status: TaskStatus.COMPLETED});
    // @ts-ignore
    expect(window.electron.completeTask).toHaveBeenCalledWith(mockTaskId);
    
    // 验证树木生长
    expect(TreeService.growTree).toHaveBeenCalledWith(mockTaskId);
  });
  
  test('整个工作流：创建任务 -> 创建树 -> 完成任务 -> 树木生长', async () => {
    // 1. 创建任务
    const taskData: CreateTaskData = {
      title: '测试工作流任务',
      description: '测试描述',
      priority: TaskPriority.MEDIUM,
      categoryId: mockCategory.id
    };
    const task = await TaskService.createTask(taskData);
    
    expect(task).not.toBeNull();
    // @ts-ignore
    expect(window.electron.createTask).toHaveBeenCalled();
    
    // 2. 验证树木创建
    expect(TreeService.createTree).toHaveBeenCalled();
    
    // 3. 完成任务
    const completedTask = await TaskService.completeTask(mockTaskId);
    
    expect(completedTask).not.toBeNull();
    expect(completedTask?.completed).toBe(true);
    // @ts-ignore
    expect(window.electron.completeTask).toHaveBeenCalled();
    
    // 4. 验证树木生长
    expect(TreeService.growTree).toHaveBeenCalled();
  });
  
  test('即使树木生长失败，也应正确完成任务', async () => {
    // 设置树木生长失败
    (TreeService.growTree as jest.Mock).mockRejectedValueOnce(new Error('树木生长失败'));
    
    // 完成任务
    const completedTask = await TaskService.completeTask(mockTaskId);
    
    // 任务应该仍然被标记为完成
    expect(completedTask).not.toBeNull();
    expect(completedTask?.completed).toBe(true);
    // @ts-ignore
    expect(window.electron.completeTask).toHaveBeenCalledWith(mockTaskId);
    
    // 验证尝试了树木生长
    expect(TreeService.growTree).toHaveBeenCalledWith(mockTaskId);
    
    // 验证错误被捕获并记录
    expect(console.error).toHaveBeenCalledWith(
      '任务完成，但树木生长失败:',
      expect.any(Error)
    );
  });
}); 