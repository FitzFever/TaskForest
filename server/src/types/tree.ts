/**
 * 树木相关类型定义
 */

// 树木基础接口
export interface Tree {
  id: string;
  taskId: string;
  type: string;
  stage: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  createdAt: Date;
  lastGrowth: Date;
  healthState: number;
  userId: string;
}

// 创建树木DTO
export interface CreateTreeDto {
  taskId: string;
  species: string; // 对应Tree的type字段
  stage?: number;
  healthState?: number;
  userId: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  rotationY?: number;
}

// 更新树木DTO
export interface UpdateTreeDto {
  species?: string; // 对应Tree的type字段
  stage?: number;
  healthState?: number;
  lastWatered?: Date; // 对应Tree的lastGrowth字段
  userId?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  rotationY?: number;
}

// 树木生长请求DTO
export interface GrowTreeRequestDto {
  taskCompleted?: boolean;
}

// 树木生长响应DTO
export interface GrowTreeResponseDto {
  tree: Tree;
  message: string;
  completedTasks: number;
}

// 树木列表响应DTO
export interface TreeListResponseDto {
  trees: Tree[];
  total: number;
  page: number;
  pageSize: number;
}

// 常量定义
export const MAX_GROWTH_STAGE = 5; // 最大生长阶段
export const TREE_SPECIES = {
  OAK: 'OAK',       // 橡树 (普通任务)
  PINE: 'PINE',     // 松树 (重复任务)
  CHERRY: 'CHERRY', // 樱花树 (重要任务)
  PALM: 'PALM',     // 棕榈树 (休闲任务)
  APPLE: 'APPLE',   // 苹果树 (学习任务)
  MAPLE: 'MAPLE',   // 枫树 (工作任务)
  WILLOW: 'WILLOW', // 柳树 (项目任务)
} as const;

// 树木类型
export type TreeSpecies = typeof TREE_SPECIES[keyof typeof TREE_SPECIES]; 