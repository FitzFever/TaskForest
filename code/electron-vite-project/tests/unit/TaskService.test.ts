import TaskService from '../../src/services/TaskService';
import TreeService from '../../src/services/TreeService';
import { Task, TaskPriority, TaskStatus } from '../../src/types/Task';

// 手动模拟TreeService而不是使用jest.mock
const originalTreeService = TreeService;
// @ts-ignore
TreeService.createTree = jest.fn().mockImplementation(() => Promise.resolve({ id: 1 }));
// @ts-ignore
TreeService.growTree = jest.fn().mockImplementation(() => Promise.resolve(true));

// 重置所有 mock
beforeEach(() => {
  jest.clearAllMocks();
});

describe('TaskService', () => {
  // 模拟任务数据
  const mockTask: Task = {
    id: 1,
    title: '测试任务',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.IN_PROGRESS,
    completed: false,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    category: {
      id: 1,
      name: '工作',
      treeType: 'oak'
    }
  };

  describe('getTasks', () => {
    it('应该从API获取所有任务', async () => {
      // @ts-ignore
      window.electron.getTasks = jest.fn().mockImplementation(() => Promise.resolve([mockTask]));
      
      const tasks = await TaskService.getTasks();
      
      // @ts-ignore
      expect(window.electron.getTasks).toHaveBeenCalledTimes(1);
      expect(tasks).toEqual([mockTask]);
    });

    it('应该在API调用失败时返回空数组', async () => {
      const errorMsg = '获取任务失败';
      // @ts-ignore
      window.electron.getTasks = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const tasks = await TaskService.getTasks();
      
      // @ts-ignore
      expect(window.electron.getTasks).toHaveBeenCalledTimes(1);
      expect(tasks).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('createTask', () => {
    it('应该创建一个任务和一棵树', async () => {
      // @ts-ignore
      window.electron.createTask = jest.fn().mockImplementation(() => Promise.resolve(mockTask));
      // @ts-ignore
      TreeService.createTree = jest.fn().mockImplementation(() => Promise.resolve({ id: 1 }));
      
      const taskData = {
        title: '测试任务',
        priority: TaskPriority.MEDIUM
      };
      
      const task = await TaskService.createTask(taskData);
      
      // @ts-ignore
      expect(window.electron.createTask).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.electron.createTask).toHaveBeenCalledWith(taskData);
      // @ts-ignore
      expect(TreeService.createTree).toHaveBeenCalledWith('oak', 1);
      expect(task).toEqual(mockTask);
    });

    it('应该在API调用失败时返回null', async () => {
      const errorMsg = '创建任务失败';
      // @ts-ignore
      window.electron.createTask = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const taskData = {
        title: '测试任务',
        priority: TaskPriority.MEDIUM
      };
      
      const task = await TaskService.createTask(taskData);
      
      // @ts-ignore
      expect(window.electron.createTask).toHaveBeenCalledTimes(1);
      expect(task).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('应该更新任务', async () => {
      // @ts-ignore
      window.electron.updateTask = jest.fn().mockImplementation(() => Promise.resolve({
        ...mockTask,
        title: '更新的标题'
      }));
      
      const taskData = {
        title: '更新的标题'
      };
      
      const task = await TaskService.updateTask(1, taskData);
      
      // @ts-ignore
      expect(window.electron.updateTask).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.electron.updateTask).toHaveBeenCalledWith(1, taskData);
      expect(task).toEqual({
        ...mockTask,
        title: '更新的标题'
      });
    });

    it('应该在API调用失败时返回null', async () => {
      const errorMsg = '更新任务失败';
      // @ts-ignore
      window.electron.updateTask = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const taskData = {
        title: '更新的标题'
      };
      
      const task = await TaskService.updateTask(1, taskData);
      
      // @ts-ignore
      expect(window.electron.updateTask).toHaveBeenCalledTimes(1);
      expect(task).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('应该删除任务', async () => {
      // @ts-ignore
      window.electron.deleteTask = jest.fn().mockImplementation(() => Promise.resolve(true));
      
      const result = await TaskService.deleteTask(1);
      
      // @ts-ignore
      expect(window.electron.deleteTask).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.electron.deleteTask).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('应该在API调用失败时返回false', async () => {
      const errorMsg = '删除任务失败';
      // @ts-ignore
      window.electron.deleteTask = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const result = await TaskService.deleteTask(1);
      
      // @ts-ignore
      expect(window.electron.deleteTask).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('completeTask', () => {
    it('应该完成任务并增长树', async () => {
      // @ts-ignore
      window.electron.completeTask = jest.fn().mockImplementation(() => Promise.resolve({
        ...mockTask,
        status: TaskStatus.COMPLETED,
        completed: true,
        completedAt: '2023-01-02'
      }));
      // @ts-ignore
      TreeService.growTree = jest.fn().mockImplementation(() => Promise.resolve(true));
      
      const task = await TaskService.completeTask(1);
      
      // @ts-ignore
      expect(window.electron.completeTask).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.electron.completeTask).toHaveBeenCalledWith(1);
      // @ts-ignore
      expect(TreeService.growTree).toHaveBeenCalledWith(1);
      expect(task).toEqual({
        ...mockTask,
        status: TaskStatus.COMPLETED,
        completed: true,
        completedAt: '2023-01-02'
      });
    });

    it('应该在API调用失败时返回null', async () => {
      const errorMsg = '完成任务失败';
      // @ts-ignore
      window.electron.completeTask = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const task = await TaskService.completeTask(1);
      
      // @ts-ignore
      expect(window.electron.completeTask).toHaveBeenCalledTimes(1);
      expect(task).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('应该能处理树木生长失败的情况', async () => {
      // @ts-ignore
      window.electron.completeTask = jest.fn().mockImplementation(() => Promise.resolve({
        ...mockTask,
        status: TaskStatus.COMPLETED,
        completed: true,
        completedAt: '2023-01-02'
      }));
      // @ts-ignore
      TreeService.growTree = jest.fn().mockImplementation(() => Promise.reject(new Error('树木生长失败')));
      
      const task = await TaskService.completeTask(1);
      
      // @ts-ignore
      expect(window.electron.completeTask).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(TreeService.growTree).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('任务完成，但树木生长失败:', expect.any(Error));
      expect(task).toEqual({
        ...mockTask,
        status: TaskStatus.COMPLETED,
        completed: true,
        completedAt: '2023-01-02'
      });
    });
  });
}); 