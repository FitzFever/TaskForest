import { Task, CreateTaskData, TaskStatus } from '../types/Task';
import TreeService from './TreeService';

/**
 * TaskService - 处理与任务相关的所有API调用
 */
class TaskService {
  /**
   * 获取所有任务
   */
  static async getTasks(): Promise<Task[]> {
    try {
      // @ts-ignore
      const tasks = await window.electron.getTasks();
      return tasks;
    } catch (error) {
      console.error('获取任务失败:', error);
      return [];
    }
  }

  /**
   * 创建新任务
   * 创建任务的同时会创建一棵树
   */
  static async createTask(taskData: CreateTaskData): Promise<Task | null> {
    try {
      // 首先创建任务
      // @ts-ignore
      const task = await window.electron.createTask(taskData);
      
      // 根据任务类别确定树木类型（如果有类别）
      const treeType = task.category?.treeType || 'oak';
      
      // 创建树并关联到任务
      await TreeService.createTree(treeType, task.id);
      
      console.log(`任务 ${task.id} 已创建，并种下了一棵 ${treeType} 树`);
      return task;
    } catch (error) {
      console.error('创建任务失败:', error);
      return null;
    }
  }

  /**
   * 更新任务
   */
  static async updateTask(taskId: number, taskData: Partial<Task>): Promise<Task | null> {
    try {
      // @ts-ignore
      const task = await window.electron.updateTask(taskId, taskData);
      return task;
    } catch (error) {
      console.error('更新任务失败:', error);
      return null;
    }
  }

  /**
   * 删除任务
   * 删除任务的同时会删除关联的树
   */
  static async deleteTask(taskId: number): Promise<boolean> {
    try {
      // @ts-ignore
      const result = await window.electron.deleteTask(taskId);
      return result;
    } catch (error) {
      console.error('删除任务失败:', error);
      return false;
    }
  }

  /**
   * 完成任务
   * 任务完成时会增加树的生长阶段
   */
  static async completeTask(taskId: number): Promise<Task | null> {
    try {
      // 完成任务
      // @ts-ignore
      const task = await window.electron.completeTask(taskId);
      
      // 任务完成后，增加树的生长阶段
      if (task) {
        try {
          await TreeService.growTree(task.id);
          console.log(`任务 ${task.id} 已完成，树木成长了!`);
        } catch (treeError) {
          console.error('任务完成，但树木生长失败:', treeError);
        }
      }
      
      return task;
    } catch (error) {
      console.error('完成任务失败:', error);
      return null;
    }
  }
}

export default TaskService; 