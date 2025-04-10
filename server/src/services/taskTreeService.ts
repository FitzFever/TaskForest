/**
 * 任务-树木关联服务
 * 负责处理任务与树木之间的绑定关系
 */
import { PrismaClient } from '@prisma/client';
import { TaskData, TreeData } from '../types/treeHealth.js';

const prisma = new PrismaClient();

/**
 * 任务树木关联服务类
 */
class TaskTreeService {
  /**
   * 创建树木并关联到任务
   * @param taskId 任务ID
   * @param treeType 树木类型
   * @returns 创建的树木对象
   */
  async createTreeForTask(taskId: string, treeType: string): Promise<TreeData | null> {
    try {
      // 先检查任务是否存在
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        throw new Error('任务不存在');
      }

      // 检查任务是否已关联树木
      const existingTree = await prisma.tree.findFirst({
        where: { taskId: taskId }
      });

      if (existingTree) {
        throw new Error('任务已关联树木');
      }

      // 创建新树木并关联到任务
      const newTree = await prisma.tree.create({
        data: {
          type: treeType || 'OAK', // 默认橡树
          stage: 1, // 初始阶段
          healthState: 100, // 初始健康状态
          taskId: taskId
        }
      });

      return {
        id: newTree.id,
        type: newTree.type,
        healthState: newTree.healthState,
        stage: newTree.stage,
        createdAt: newTree.createdAt,
        updatedAt: newTree.updatedAt as Date,
        taskId: newTree.taskId
      };
    } catch (error) {
      console.error('创建任务关联树木失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务关联的树木
   * @param taskId 任务ID
   * @returns 关联的树木对象
   */
  async getTreeByTaskId(taskId: string): Promise<TreeData | null> {
    try {
      const tree = await prisma.tree.findFirst({
        where: { taskId: taskId }
      });

      if (!tree) return null;

      return {
        id: tree.id,
        type: tree.type,
        healthState: tree.healthState,
        stage: tree.stage,
        createdAt: tree.createdAt,
        updatedAt: tree.updatedAt as Date,
        taskId: tree.taskId
      };
    } catch (error) {
      console.error('获取任务关联树木失败:', error);
      throw error;
    }
  }

  /**
   * 获取树木关联的任务
   * @param treeId 树木ID
   * @returns 关联的任务对象
   */
  async getTaskByTreeId(treeId: string): Promise<TaskData | null> {
    try {
      const tree = await prisma.tree.findUnique({
        where: { id: treeId },
        include: { task: true }
      });

      if (!tree || !tree.task) return null;

      return {
        id: tree.task.id,
        title: tree.task.title,
        status: tree.task.status,
        createdAt: tree.task.createdAt,
        updatedAt: tree.task.updatedAt,
        dueDate: tree.task.dueDate,
        progress: (tree.task as any).progress
      };
    } catch (error) {
      console.error('获取树木关联任务失败:', error);
      throw error;
    }
  }

  /**
   * 更新任务状态时同步更新树木
   * @param taskId 任务ID
   * @param status 新任务状态
   * @param progress 任务进度
   * @returns 更新后的树木
   */
  async updateTreeOnTaskChange(taskId: string, status: string, progress?: number): Promise<TreeData | null> {
    try {
      const tree = await prisma.tree.findFirst({
        where: { taskId: taskId }
      });

      if (!tree) return null;

      // 根据任务状态更新树木
      let stage = tree.stage;
      let healthState = tree.healthState;

      // 任务完成时，树木进入成熟阶段，健康状态最高
      if (status === 'COMPLETED') {
        stage = 4; // 成熟阶段
        healthState = 100;
      } 
      // 任务取消时，树木健康状态降低
      else if (status === 'CANCELLED') {
        healthState = Math.max(20, healthState - 30);
      }
      // 进行中状态，根据进度更新树木阶段
      else if (status === 'IN_PROGRESS' && progress !== undefined) {
        if (progress >= 75) {
          stage = 3; // 高级阶段
        } else if (progress >= 50) {
          stage = 2; // 中级阶段
        } else if (progress >= 25) {
          stage = 1; // 初级阶段
        }
      }

      // 更新树木
      const updatedTree = await prisma.tree.update({
        where: { id: tree.id },
        data: { 
          stage, 
          healthState,
          updatedAt: new Date()
        }
      });

      return {
        id: updatedTree.id,
        type: updatedTree.type,
        healthState: updatedTree.healthState,
        stage: updatedTree.stage,
        createdAt: updatedTree.createdAt,
        updatedAt: updatedTree.updatedAt as Date,
        taskId: updatedTree.taskId
      };
    } catch (error) {
      console.error('更新树木状态失败:', error);
      throw error;
    }
  }

  /**
   * 解除任务与树木的关联
   * @param taskId 任务ID
   * @returns 是否成功解除关联
   */
  async unlinkTaskTree(taskId: string): Promise<boolean> {
    try {
      const tree = await prisma.tree.findFirst({
        where: { taskId: taskId }
      });

      if (!tree) return false;

      // 删除关联的树木记录，而不是仅解除关联
      await prisma.tree.delete({
        where: { id: tree.id }
      });

      return true;
    } catch (error) {
      console.error('解除任务树木关联失败:', error);
      throw error;
    }
  }
}

export default new TaskTreeService(); 