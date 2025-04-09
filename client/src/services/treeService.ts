/**
 * 树木相关API服务
 */
import api from './api';

// API树木接口
export interface ApiTree {
  id: string;
  taskId: string;
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
  scale: {
    x: number;
    y: number;
    z: number;
  };
  createdAt: string;
  lastGrowth: string;
  healthState: number;
  task?: {
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
  };
}

// 树木列表响应接口
export interface TreeListResponse {
  trees: ApiTree[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// 更新树木请求接口
export interface UpdateTreeRequest {
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
  stage?: number;
}

/**
 * 获取所有树木
 * @returns 包含树木列表和分页信息的响应对象
 */
export const getAllTrees = async (): Promise<TreeListResponse> => {
  // 使用真实API
  try {
    const response = await api.get<TreeListResponse>('/trees');
    return response.data;
  } catch (error) {
    console.error('获取树木列表失败:', error);
    throw error;
  }
};

/**
 * 获取指定ID的树木
 * @param treeId 树木ID
 * @returns 树木对象
 */
export const getTree = async (treeId: string): Promise<ApiTree> => {
  // 使用真实API
  try {
    const response = await api.get<ApiTree>(`/trees/${treeId}`);
    return response.data;
  } catch (error) {
    console.error(`获取树木失败 ID:${treeId}:`, error);
    throw error;
  }
};

/**
 * 获取任务关联的树木
 * @param taskId 任务ID
 * @returns 树木对象
 */
export const getTreeByTaskId = async (taskId: string): Promise<ApiTree> => {
  // 使用真实API
  try {
    const response = await api.get<ApiTree>(`/trees/by-task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`获取任务树木失败 ID:${taskId}:`, error);
    throw error;
  }
};

/**
 * 更新树木
 * @param treeId 树木ID
 * @param updateData 更新数据
 * @returns 更新后的树木对象
 */
export const updateTree = async (treeId: string, updateData: UpdateTreeRequest): Promise<ApiTree> => {
  // 使用真实API
  try {
    const response = await api.put<ApiTree>(`/trees/${treeId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`更新树木失败 ID:${treeId}:`, error);
    throw error;
  }
};

// 导出默认对象
export default {
  getAllTrees,
  getTree,
  getTreeByTaskId,
  updateTree
}; 