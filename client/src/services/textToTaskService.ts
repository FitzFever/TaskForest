/**
 * 文本到任务转换服务
 * 负责将长文本转换为结构化任务
 */
import api from './api';
import { AxiosResponse } from 'axios';
import type { Task, ApiResponse } from '../types/Task';

// 文本到任务请求接口
export interface TextToTaskRequest {
  text: string;
  createTree?: boolean;
  treeType?: string;
}

// 文本到任务响应接口
export interface TextToTaskResponse {
  analysis: {
    taskId: string;
    title: string;
    description: string;
    complexity: string;
    analysisDetails?: string;
    estimatedHours?: number;
  };
  tasks: {
    mainTask: Task;
    subTasks: Task[];
    trees?: {
      mainTree: any;
      subTrees: any[];
    };
  };
}

/**
 * 从文本生成任务和任务树
 * @param request 文本到任务请求
 * @returns 文本到任务响应
 */
export const generateTasksFromText = async (
  request: TextToTaskRequest
): Promise<AxiosResponse<ApiResponse<TextToTaskResponse>>> => {
  try {
    console.log('从文本生成任务请求:', request);
    const response = await api.post('/text-to-task', request);
    return response;
  } catch (error) {
    console.error('从文本生成任务失败:', error);
    throw error;
  }
};

export default {
  generateTasksFromText
}; 