import { Task } from './Task';

/**
 * 树木类型定义
 */
export interface Tree {
  id: number;
  type: string;
  growthStage: number;
  positionX: number;
  positionZ: number;
  createdAt: string;
  updatedAt: string;
  task?: Task;
}

/**
 * 创建树的请求数据类型
 */
export interface CreateTreeData {
  type: string;
  growthStage: number;
  taskId: number;
  positionX: number;
  positionZ: number;
} 