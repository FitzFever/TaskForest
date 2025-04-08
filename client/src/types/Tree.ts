import { Task } from './Task';

/**
 * 树木类型枚举
 */
export enum TreeType {
  OAK = 'oak',     // 橡树
  PINE = 'pine',   // 松树
  CHERRY = 'cherry', // 樱花树
  MAPLE = 'maple', // 枫树
  PALM = 'palm'    // 棕榈树
}

/**
 * 树木类型定义
 */
export interface Tree {
  id: number;
  type: TreeType | string;
  growthStage: number;
  positionX: number;
  positionY?: number;
  positionZ: number;
  rotationY?: number;
  createdAt: string;
  updatedAt?: string;
  taskId?: number;
  task?: Task;
}

/**
 * 创建树的请求数据类型
 */
export interface CreateTreeData {
  type: TreeType | string;
  growthStage: number;
  taskId?: number;
  positionX: number;
  positionZ: number;
}

/**
 * 树木生长阶段特性
 */
export interface TreeGrowthStage {
  stage: number;
  scale: number;
  leaves: number;
  color: string;
} 