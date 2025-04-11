import { Task } from './Task';

/**
 * 树木类型枚举
 */
export enum TreeType {
  OAK = 'OAK',     // 橡树 - 普通日常任务
  PINE = 'PINE',   // 松树 - 定期重复任务
  WILLOW = 'WILLOW', // 柳树 - 长期项目任务
  MAPLE = 'MAPLE', // 枫树 - 工作类任务
  PALM = 'PALM',   // 棕榈树 - 休闲类任务
  APPLE = 'APPLE',  // 苹果树 - 学习类任务
  CHERRY = 'CHERRY' // 樱花树 - 特殊任务
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