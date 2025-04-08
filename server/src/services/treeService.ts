/**
 * 树木服务
 * 提供树木管理的业务逻辑
 */
import { prisma } from '../db.js';
import { Tree as TreeType, CreateTreeDto, UpdateTreeDto } from '../types/tree.js';

/**
 * 树木服务类
 * 处理与树木相关的所有业务逻辑
 */
export class TreeService {
  /**
   * 获取所有树木
   * @returns {Promise<TreeType[]>} 树木列表
   */
  async getAllTrees(): Promise<TreeType[]> {
    const trees = await prisma.tree.findMany();
    return trees as unknown as TreeType[];
  }

  /**
   * 根据ID获取单个树木
   * @param {string} id 树木ID
   * @returns {Promise<TreeType | null>} 找到的树木或null
   */
  async getTreeById(id: string): Promise<TreeType | null> {
    const tree = await prisma.tree.findUnique({
      where: { id }
    });
    return tree as unknown as TreeType | null;
  }

  /**
   * 创建新树木
   * @param {CreateTreeDto} treeData 树木数据
   * @returns {Promise<TreeType>} 创建的树木
   */
  async createTree(treeData: CreateTreeDto): Promise<TreeType> {
    const { species, taskId, stage = 1, healthState = 100, positionX = 0, positionY = 0, positionZ = 0, rotationY = 0 } = treeData;
    
    const newTree = await prisma.tree.create({
      data: {
        type: species,
        taskId,
        stage,
        healthState,
        positionX,
        positionY,
        positionZ,
        rotationY
      }
    });
    
    return newTree as unknown as TreeType;
  }

  /**
   * 更新树木
   * @param {string} id 树木ID
   * @param {UpdateTreeDto} treeData 更新数据
   * @returns {Promise<TreeType | null>} 更新后的树木或null
   */
  async updateTree(id: string, treeData: UpdateTreeDto): Promise<TreeType | null> {
    // 先检查树木是否存在
    const tree = await this.getTreeById(id);
    if (!tree) return null;

    const updateData: any = {};
    if (treeData.species) updateData.type = treeData.species;
    if (treeData.stage !== undefined) updateData.stage = treeData.stage;
    if (treeData.healthState !== undefined) updateData.healthState = treeData.healthState;
    if (treeData.lastWatered) updateData.lastGrowth = treeData.lastWatered;
    if (treeData.positionX !== undefined) updateData.positionX = treeData.positionX;
    if (treeData.positionY !== undefined) updateData.positionY = treeData.positionY;
    if (treeData.positionZ !== undefined) updateData.positionZ = treeData.positionZ;
    if (treeData.rotationY !== undefined) updateData.rotationY = treeData.rotationY;

    const updatedTree = await prisma.tree.update({
      where: { id },
      data: updateData
    });

    return updatedTree as unknown as TreeType;
  }

  /**
   * 删除树木
   * @param {string} id 树木ID
   * @returns {Promise<boolean>} 是否成功删除
   */
  async deleteTree(id: string): Promise<boolean> {
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
   * @param {string} id 树木ID
   * @param {boolean} taskCompleted 是否完成了任务
   * @returns {Promise<TreeType | null>} 更新后的树木或null
   */
  async growTree(id: string, taskCompleted: boolean = true): Promise<TreeType | null> {
    // 先检查树木是否存在
    const tree = await this.getTreeById(id);
    if (!tree) return null;

    // 只有在完成任务的情况下才增加成长
    if (taskCompleted) {
      // 最大生长阶段为5
      const newStage = Math.min(tree.stage + 1, 5);
      
      const updatedTree = await prisma.tree.update({
        where: { id },
        data: {
          stage: newStage,
          lastGrowth: new Date()
        }
      });
      
      return updatedTree as unknown as TreeType;
    }
    
    // 如果没有完成任务，只更新最后浇水时间
    const updatedTree = await prisma.tree.update({
      where: { id },
      data: {
        lastGrowth: new Date()
      }
    });
    
    return updatedTree as unknown as TreeType;
  }
}

// 导出单例实例
const treeService = new TreeService();
export default treeService; 