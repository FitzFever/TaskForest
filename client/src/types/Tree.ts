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
  id: number | string;
  type: TreeType | string;
  growthStage: number;
  positionX: number;
  positionY?: number;
  positionZ: number;
  rotationY?: number;
  createdAt: string;
  updatedAt?: string;
  taskId?: number | string;
  task?: Task;
  healthState?: number; // 树木健康状态(0-100)
  
  // 兼容新结构
  position?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
  structure?: any; // 树木结构数据
  name?: string; // 树木名称
  mainTaskId?: string; // 主任务ID
  lastGrowth?: string; // 最后生长时间
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