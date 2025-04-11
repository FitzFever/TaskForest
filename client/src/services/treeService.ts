/**
 * 树木相关API服务
 */
import api from './api';
import { AxiosResponse } from 'axios';
import { Tree, CreateTreeData, TreeType } from '../types/Tree';
import { ApiResponse } from '../types/Task';

// 树木API接口
export interface ApiTree {
  id: string;
  type: string;
  stage: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  createdAt: string;
  lastGrowth: string;
  healthState: number;
  taskId: string;
  task?: {
    id: string;
    title: string;
    status: string;
    progress?: number;
  };
}

// API响应接口
export interface TreesResponse {
  trees: ApiTree[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * 获取所有树木列表
 * @returns 树木列表响应
 */
export const getTrees = async (): Promise<AxiosResponse<any>> => {
  try {
    const response = await api.get('/trees');
    return response;
  } catch (error) {
    console.error('获取树木列表失败:', error);
    throw error;
  }
};

/**
 * 获取单个树木信息
 * @param id 树木ID
 * @returns 响应
 */
export const getTree = async (id: string): Promise<AxiosResponse<ApiResponse<ApiTree>>> => {
  return await api.get(`/trees/${id}`);
};

/**
 * 根据任务ID获取关联的树木
 * @param taskId 任务ID
 * @returns 树木信息响应
 */
export const getTreeByTask = async (taskId: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await api.get(`/trees/by-task/${taskId}`);
    return response;
  } catch (error) {
    console.error(`获取任务(${taskId})关联的树木失败:`, error);
    throw error;
  }
};

/**
 * 根据任务ID获取关联的树木ID
 * 这是一个简化方法，直接返回树木对象
 * @param taskId 任务ID
 * @returns 树木对象或undefined
 */
export const getTreeByTaskId = async (taskId: string): Promise<Tree | undefined> => {
  try {
    const response = await getTreeByTask(taskId);
    if (response && response.data && response.data.data) {
      return response.data.data;
    }
    return undefined;
  } catch (error) {
    console.error(`获取任务(${taskId})关联的树木ID失败:`, error);
    return undefined;
  }
};

/**
 * 更新树木信息
 * @param id 树木ID
 * @param treeData 树木数据
 * @returns 响应
 */
export const updateTree = async (
  id: string,
  treeData: {
    position?: { x: number, y: number, z: number };
    rotation?: { x: number, y: number, z: number };
    stage?: number;
  }
): Promise<AxiosResponse<ApiResponse<ApiTree>>> => {
  return await api.put(`/trees/${id}`, treeData);
};

/**
 * 获取树木健康状态
 * @param id 树木ID
 * @returns 响应
 */
export const getTreeHealth = async (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
  return await api.get(`/trees/${id}/health`);
};

// 导出默认对象
export default {
  getTrees,
  getTree,
  getTreeByTask,
  getTreeByTaskId,
  updateTree,
  getTreeHealth
}; 