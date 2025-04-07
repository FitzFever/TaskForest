import { Task, CreateTaskData } from './Task';
import { Tree, CreateTreeData } from './Tree';

declare global {
  interface Window {
    electron: {
      // 树木相关API
      getTrees: () => Promise<Tree[]>;
      createTree: (tree: CreateTreeData) => Promise<Tree>;
      growTree: (treeId: number) => Promise<boolean>;
      deleteTree: (treeId: number) => Promise<boolean>;
      
      // 任务相关API
      getTasks: () => Promise<Task[]>;
      createTask: (task: CreateTaskData) => Promise<Task>;
      updateTask: (taskId: number, task: Partial<Task>) => Promise<Task>;
      deleteTask: (taskId: number) => Promise<boolean>;
      completeTask: (taskId: number) => Promise<Task>;
      
      // 通用IPC方法
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, callback: (...args: any[]) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
} 