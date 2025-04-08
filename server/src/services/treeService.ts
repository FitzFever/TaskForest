/**
 * 树木服务类
 * 提供树木管理的业务逻辑
 */
import { prisma } from '../db.js';

// 树木模型接口
export interface Tree {
  id: number;
  name: string;
  species: string;
  growthStage: number;
  health: number;
  completedTasks: number;
  lastWatered: Date;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// 创建树木DTO
export interface CreateTreeDto {
  name: string;
  species: string;
  userId: number;
  growthStage?: number;
  health?: number;
  completedTasks?: number;
  lastWatered?: Date;
}

// 更新树木DTO
export interface UpdateTreeDto {
  name?: string;
  species?: string;
  growthStage?: number;
  health?: number;
  completedTasks?: number;
  lastWatered?: Date;
  userId?: number;
}

/**
 * 树木服务类
 * 处理与树木相关的所有业务逻辑
 */
export class TreeService {
  /**
   * 获取所有树木
   * @returns {Promise<Tree[]>} 树木列表
   */
  async getAllTrees(): Promise<Tree[]> {
    return await prisma.tree.findMany();
  }

  /**
   * 根据ID获取单个树木
   * @param {number} id 树木ID
   * @returns {Promise<Tree | null>} 找到的树木或null
   */
  async getTreeById(id: number): Promise<Tree | null> {
    return await prisma.tree.findUnique({
      where: { id }
    });
  }

  /**
   * 创建新树木
   * @param {CreateTreeDto} treeData 树木数据
   * @returns {Promise<Tree>} 创建的树木
   */
  async createTree(treeData: CreateTreeDto): Promise<Tree> {
    const { name, species, userId, growthStage = 1, health = 100, completedTasks = 0, lastWatered = new Date() } = treeData;
    
    return await prisma.tree.create({
      data: {
        name,
        species,
        userId,
        growthStage,
        health,
        completedTasks,
        lastWatered
      }
    });
  }

  /**
   * 更新树木
   * @param {number} id 树木ID
   * @param {UpdateTreeDto} treeData 更新数据
   * @returns {Promise<Tree | null>} 更新后的树木或null
   */
  async updateTree(id: number, treeData: UpdateTreeDto): Promise<Tree | null> {
    // 先检查树木是否存在
    const tree = await this.getTreeById(id);
    if (!tree) return null;

    return await prisma.tree.update({
      where: { id },
      data: treeData
    });
  }

  /**
   * 删除树木
   * @param {number} id 树木ID
   * @returns {Promise<boolean>} 是否成功删除
   */
  async deleteTree(id: number): Promise<boolean> {
    // 先检查树木是否存在
    const tree = await this.getTreeById(id);
    if (!tree) return false;

    await prisma.tree.delete({
      where: { id }
    });
    return true;
  }

  /**
   * 树木生长
   * @param {number} id 树木ID
   * @param {boolean} taskCompleted 是否完成了任务
   * @returns {Promise<Tree | null>} 更新后的树木或null
   */
  async growTree(id: number, taskCompleted: boolean = true): Promise<Tree | null> {
    // 先检查树木是否存在
    const tree = await this.getTreeById(id);
    if (!tree) return null;

    // 只有在完成任务的情况下才增加成长和更新完成任务数量
    if (taskCompleted) {
      // 最大生长阶段为5
      const newGrowthStage = Math.min(tree.growthStage + 1, 5);
      const newCompletedTasks = tree.completedTasks + 1;
      
      return await prisma.tree.update({
        where: { id },
        data: {
          growthStage: newGrowthStage,
          completedTasks: newCompletedTasks,
          lastWatered: new Date()
        }
      });
    }
    
    // 如果没有完成任务，只更新最后浇水时间
    return await prisma.tree.update({
      where: { id },
      data: {
        lastWatered: new Date()
      }
    });
  }
} 