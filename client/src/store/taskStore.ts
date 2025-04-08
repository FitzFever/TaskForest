import { create } from 'zustand';
import { TaskPriority, TaskStatus, Task } from '../types/Task';

// 任务状态界面
export interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  
  // 筛选相关状态
  filters: {
    status: TaskStatus | null;
    priority: TaskPriority | null;
    search: string;
  };
}

// 任务操作接口
interface TaskActions {
  // 设置任务列表
  setTasks: (tasks: Task[]) => void;
  
  // 添加新任务
  addTask: (task: Task) => void;
  
  // 更新任务
  updateTask: (updatedTask: Task) => void;
  
  // 删除任务
  removeTask: (taskId: number) => void;
  
  // 选择当前任务
  selectTask: (task: Task | null) => void;
  
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  
  // 设置错误信息
  setError: (error: string | null) => void;
  
  // 设置筛选条件
  setFilter: (filterType: 'status' | 'priority' | 'search', value: any) => void;
  
  // 清除筛选条件
  clearFilters: () => void;
}

// 组合任务状态和操作
export type TaskStore = TaskState & TaskActions;

// 默认筛选设置
const defaultFilters = {
  status: null,
  priority: null,
  search: '',
};

// 创建store
const useTaskStore = create<TaskStore>((set) => ({
  // 初始状态
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  filters: defaultFilters,
  
  // 操作实现
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ),
    selectedTask: state.selectedTask?.id === updatedTask.id 
      ? updatedTask 
      : state.selectedTask
  })),
  
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId),
    selectedTask: state.selectedTask?.id === taskId 
      ? null 
      : state.selectedTask
  })),
  
  selectTask: (task) => set({ selectedTask: task }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilter: (filterType, value) => set((state) => ({
    filters: {
      ...state.filters,
      [filterType]: value
    }
  })),
  
  clearFilters: () => set({ filters: defaultFilters }),
}));

export default useTaskStore; 