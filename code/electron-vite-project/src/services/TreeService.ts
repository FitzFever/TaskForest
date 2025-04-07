import { Tree } from '../types/Tree';

/**
 * TreeService - 处理与树相关的所有API调用
 */
class TreeService {
  /**
   * 获取所有树
   */
  static async getTrees(): Promise<Tree[]> {
    try {
      const trees = await window.electron.getTrees();
      return trees as Tree[];
    } catch (error) {
      console.error('获取树木失败:', error);
      return [];
    }
  }

  /**
   * 创建新树
   */
  static async createTree(type: string, taskId: number): Promise<Tree | null> {
    try {
      const tree = await window.electron.createTree({
        type,
        growthStage: 1,
        taskId,
        positionX: Math.random() * 20 - 10, // 随机X位置
        positionZ: Math.random() * 20 - 10  // 随机Z位置
      });
      return tree as Tree;
    } catch (error) {
      console.error('创建树木失败:', error);
      return null;
    }
  }

  /**
   * 更新树的生长阶段
   */
  static async growTree(treeId: number): Promise<boolean> {
    try {
      await window.electron.growTree(treeId);
      return true;
    } catch (error) {
      console.error('更新树木失败:', error);
      return false;
    }
  }

  /**
   * 删除树
   */
  static async deleteTree(treeId: number): Promise<boolean> {
    try {
      await window.electron.deleteTree(treeId);
      return true;
    } catch (error) {
      console.error('删除树木失败:', error);
      return false;
    }
  }
}

export default TreeService; 