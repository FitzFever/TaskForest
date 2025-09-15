/**
 * 批量任务服务
 * 提供批量创建任务和任务树的功能
 */
import api from './api';
import { AxiosResponse } from 'axios';
import type { Task, ApiResponse, CreateTaskRequest, TaskType } from '../types/Task';

// 批量任务请求接口
export interface BatchTasksRequest {
  tasks: CreateTaskRequest[];
}

// 批量任务和任务树请求接口
export interface BatchTasksWithTreesRequest {
  tasks: {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    complexity?: string;
    dueDate?: string;
    type?: string;
    tags?: string[];
    subTasks: {
      title: string;
      description: string;
      status?: string;
      priority?: string;
      estimatedHours?: number;
      type?: string;
      tags?: string[];
    }[];
  }[];
  createTrees?: boolean;
}

// 批量任务创建响应接口
export interface BatchTasksResponse {
  tasks: Task[];
}

// 批量任务和任务树创建响应接口
export interface BatchTasksWithTreesResponse {
  tasks: {
    mainTask: Task;
    subTasks: Task[];
  }[];
  trees: {
    id: string;
    name: string;
    type: string;
    taskId: string;
    mainTaskId?: string;
    growthStage: number;
    health: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

/**
 * 将后端返回的任务数组转换为前端期望的格式
 * @param tasks 任务数组
 * @returns 格式化的任务组数组
 */
export const adaptTasksToFrontendFormat = (tasks: any[]): { mainTask: Task, subTasks: Task[] }[] => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  
  console.log('适配任务数组:', tasks);
  
  // 检查是否已经是TaskGroup格式
  const firstItem = tasks[0];
  
  // 处理多层嵌套的情况
  if (firstItem && firstItem.mainTask && firstItem.mainTask.mainTask) {
    console.log('检测到多层嵌套的任务数据结构，正在展平...');
    return tasks.map(task => ({
      mainTask: task.mainTask.mainTask,
      subTasks: task.mainTask.subTasks || []
    }));
  }
  
  // 如果已经是期望的格式，直接返回
  if (firstItem && firstItem.mainTask && Array.isArray(firstItem.subTasks)) {
    console.log('任务数据已是期望格式，无需适配');
    return tasks as { mainTask: Task, subTasks: Task[] }[];
  }
  
  // 区分主任务和子任务
  const mainTasks = tasks.filter(task => !task.parentId);
  const subTaskMap: { [key: string]: Task[] } = {};
  
  // 按父任务ID分组子任务
  tasks.forEach(task => {
    if (task.parentId) {
      if (!subTaskMap[task.parentId]) {
        subTaskMap[task.parentId] = [];
      }
      subTaskMap[task.parentId].push(task);
    }
  });
  
  // 组装任务组
  const formattedTasks = mainTasks.map(mainTask => ({
    mainTask,
    subTasks: subTaskMap[mainTask.id] || []
  }));
  
  console.log('格式化后的任务组:', formattedTasks);
  
  return formattedTasks;
};

/**
 * 批量创建任务
 * @param request 批量任务请求
 * @returns 批量任务创建响应
 */
export const createBatchTasks = async (
  request: BatchTasksRequest
): Promise<AxiosResponse<ApiResponse<BatchTasksResponse>>> => {
  try {
    const response = await api.post('/batch-tasks', request);
    return response;
  } catch (error) {
    console.error('批量创建任务失败:', error);
    throw error;
  }
};

/**
 * 批量创建任务和任务树
 * @param request 批量任务和任务树请求
 * @returns 批量任务和任务树创建响应
 */
export const createBatchTasksWithTrees = async (
  request: BatchTasksWithTreesRequest
): Promise<AxiosResponse<ApiResponse<BatchTasksWithTreesResponse>>> => {
  try {
    // 确保createTrees参数被设置为true，以防止值为undefined
    const finalRequest = {
      ...request,
      createTrees: request.createTrees === false ? false : true // 默认true，除非明确指定为false
    };
    
    console.log('发送批量创建任务和树木请求:', JSON.stringify(finalRequest, null, 2));
    
    const response = await api.post('/batch-tasks/with-trees', finalRequest);
    
    console.log('批量创建任务和树木响应:', JSON.stringify(response.data, null, 2));
    
    // 适配响应格式
    if (response.data && response.data.data) {
      // 检查tasks和trees是否存在
      if (!response.data.data.tasks) {
        console.warn('响应中缺少tasks字段');
        response.data.data.tasks = [];
      }
      
      if (!response.data.data.trees) {
        console.warn('响应中缺少trees字段');
        response.data.data.trees = [];
      }
      
      // 检查嵌套结构并记录日志
      const tasks = response.data.data.tasks;
      if (tasks.length > 0) {
        const firstTask = tasks[0];
        if (firstTask.mainTask && firstTask.mainTask.mainTask) {
          console.log('检测到多层嵌套结构: tasks[0].mainTask.mainTask');
        } else if (firstTask.mainTask) {
          console.log('检测到标准嵌套结构: tasks[0].mainTask');
        } else {
          console.log('检测到扁平结构，没有嵌套');
        }
      }
      
      // 将tasks数据适配为前端期望的格式
      const adaptedTasks = adaptTasksToFrontendFormat(tasks);
      
      // 确保trees数组中每个树都有mainTaskId字段
      const trees = response.data.data.trees.map(tree => {
        if (!tree.mainTaskId && tree.taskId) {
          console.log(`树 ${tree.id} 添加mainTaskId字段，值为taskId: ${tree.taskId}`);
          return {
            ...tree,
            mainTaskId: tree.taskId // 确保有mainTaskId字段，用taskId填充
          };
        }
        return tree;
      });
      
      // 创建新的适配后的响应对象
      const adaptedData = {
        ...response.data,
        data: {
          ...response.data.data,
          tasks: adaptedTasks,
          trees: trees
        }
      };
      
      console.log('适配后的响应数据:', JSON.stringify(adaptedData, null, 2));
      
      // 替换原始响应
      response.data = adaptedData;
    } else {
      console.warn('响应没有预期的data字段:', response.data);
    }
    
    return response;
  } catch (error) {
    console.error('批量创建任务和任务树失败:', error);
    console.error('请检查浏览器控制台以获取详细的API响应和错误信息');
    console.error('如果是响应格式问题，请参考修复文档: /docs/trouble_shooting.md#前端API响应解析问题');
    
    // 提供更友好的错误消息
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      
      // 检查是否是数据格式问题
      if (error.message.includes('Cannot read') || error.message.includes('undefined')) {
        console.error('可能是API响应格式与前端期望不匹配，请检查API响应结构');
      }
      
      // 如果是网络错误，提供更具体的建议
      if (error.message.includes('Network Error')) {
        console.error('网络连接问题，请检查API服务是否运行');
      }
    }
    
    throw error;
  }
};

/**
 * 从任务分解结果创建批量任务和任务树
 * @param mainTask 主任务
 * @param subTasks 子任务数组
 * @param createTrees 是否创建任务树
 * @returns 批量任务和任务树创建响应
 */
export const createTasksFromDecomposition = async (
  mainTask: {
    title: string;
    description: string;
    complexity?: string;
    priority?: string;
    dueDate?: string;
    type?: string;
    tags?: string[];
  },
  subTasks: {
    title: string;
    description: string;
    priority?: string;
    estimatedHours?: number;
    type?: string;
    tags?: string[];
  }[],
  createTrees: boolean = true
): Promise<AxiosResponse<ApiResponse<BatchTasksWithTreesResponse>>> => {
  try {
    // 确保复杂度参数与后端期望的格式匹配
    let complexity = mainTask.complexity;
    if (complexity === 'SIMPLE') complexity = 'LOW';
    else if (complexity === 'COMPLEX') complexity = 'HIGH';
    
    // 默认任务类型和标签
    const defaultType = 'NORMAL';
    const defaultTags = ['AI生成'];
    
    const request: BatchTasksWithTreesRequest = {
      tasks: [{
        ...mainTask,
        complexity,
        // 确保主任务有类型和标签
        type: mainTask.type || defaultType,
        tags: mainTask.tags || defaultTags,
        subTasks: subTasks.map(subTask => ({
          ...subTask,
          status: '未开始',
          // 确保子任务有类型和标签，用明确的类型值替代直接使用可能为undefined的字段
          type: (subTask.type && subTask.type.trim() !== '') ? subTask.type : defaultType,
          tags: (Array.isArray(subTask.tags) && subTask.tags.length > 0) ? subTask.tags : defaultTags,
          // 确保estimatedHours是一个数字
          estimatedHours: typeof subTask.estimatedHours === 'number' ? subTask.estimatedHours : 1
        }))
      }],
      createTrees: createTrees === false ? false : true // 确保传递布尔值而不是undefined
    };
    
    console.log('从任务分解结果创建批量任务请求:', JSON.stringify(request, null, 2));
    console.log('是否创建树木标志:', createTrees === true ? 'true' : 'false');
    
    const response = await createBatchTasksWithTrees(request);
    
    // 详细记录响应内容，帮助调试
    if (response.data && response.data.code) {
      console.log(`批量创建响应状态码: ${response.data.code}, 消息: ${response.data.message}`);
    }
    
    // 检查是否创建了树木
    if (response.data && response.data.data && response.data.data.trees) {
      console.log(`成功创建了 ${response.data.data.trees.length} 棵树`);
      
      // 打印每棵树的详细信息
      response.data.data.trees.forEach((tree, index) => {
        console.log(`树 #${index+1} ID:${tree.id}, 关联任务ID:${tree.taskId || tree.mainTaskId}`);
      });
    } else {
      console.warn('响应中没有找到trees数组，可能未创建树木');
      // 如果响应有效但没有trees数组，创建一个空数组避免前端渲染错误
      if (response.data && response.data.data && !response.data.data.trees) {
        response.data.data.trees = [];
      }
    }
    
    return response;
  } catch (error) {
    console.error('从任务分解结果创建批量任务失败:', error);
    // 提供更友好的错误消息
    if (error instanceof Error) {
      console.log('错误详情:', error.message);
      
      // 如果是网络错误，提供更具体的建议
      if (error.message.includes('Network Error')) {
        console.error('网络连接问题，请检查API服务是否运行');
      }
    }
    throw error;
  }
}; 