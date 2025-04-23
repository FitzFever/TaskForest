import api from './api';
import { AxiosResponse } from 'axios';

/**
 * 任务分析和分解服务
 */

/**
 * 任务分析结果接口
 */
export interface TaskAnalysisResult {
  taskId: string;
  title: string;
  description: string;
  complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX';
  analysisDetails: string;
  estimatedHours: number;
}

/**
 * 子任务接口
 */
export interface SubTask {
  title: string;
  description: string;
  estimatedHours: number;
  priority?: string;
}

/**
 * 任务拆解结果接口
 */
export interface TaskBreakdownResult {
  analysis: TaskAnalysisResult;
  subTasks: SubTask[];
}

/**
 * 创建结果-任务树接口
 */
export interface TaskTree {
  taskId: string;
  treeType: string;
  growthStage: number;
  health: number;
}

/**
 * 任务分解服务类
 * 提供任务复杂度分析和任务分解功能
 */
class TaskBreakdownService {
  /**
   * 分析任务复杂度
   * @param taskData 任务数据
   * @returns 分析结果
   */
  async analyzeTaskComplexity(taskData: {
    taskId: string;
    title: string;
    description: string;
  }): Promise<TaskAnalysisResult> {
    try {
      console.log('发送任务分析请求:', taskData);
      
      const response = await api.post('/tasks/analyze', taskData);
      const responseData = response.data.data;
      
      console.log('收到任务分析响应:', responseData);
      
      // 确保复杂度字段符合前端接口要求
      // 后端返回 LOW/MEDIUM/HIGH，前端需要 SIMPLE/MEDIUM/COMPLEX
      let complexity = responseData.complexity || 'MEDIUM';
      if (complexity === 'LOW') complexity = 'SIMPLE';
      if (complexity === 'HIGH') complexity = 'COMPLEX';
      
      // 构建符合TaskAnalysisResult接口的返回对象
      return {
        taskId: responseData.taskId,
        title: responseData.title,
        description: responseData.description || '',
        complexity: complexity as 'SIMPLE' | 'MEDIUM' | 'COMPLEX',
        analysisDetails: responseData.analysis || '',
        estimatedHours: responseData.estimatedDays ? responseData.estimatedDays * 8 : 0
      };
    } catch (error) {
      console.error('任务复杂度分析失败:', error);
      throw error;
    }
  }

  /**
   * 将任务分解为子任务
   * @param taskData 任务数据
   * @returns 分解结果
   */
  async decomposeTask(taskData: {
    taskId: string;
    title: string;
    description: string;
    complexity?: string;
  }): Promise<SubTask[]> {
    try {
      // 确保complexity参数存在
      if (!taskData.complexity) {
        console.error('缺少复杂度参数，任务拆解可能失败');
      }
      
      console.log('发送任务拆解请求:', {
        ...taskData,
        complexity: taskData.complexity || 'MEDIUM' // 提供默认值
      });
      
      const response = await api.post('/tasks/decompose', {
        ...taskData,
        complexity: taskData.complexity || 'MEDIUM' // 提供默认值以防万一
      });
      
      // 处理可能的不同响应结构
      const responseData = response.data.data;
      
      // 检查响应结构
      if (responseData.subTasks && Array.isArray(responseData.subTasks)) {
        console.log('收到子任务数组:', responseData.subTasks);
        return responseData.subTasks;
      } else if (Array.isArray(responseData)) {
        console.log('收到子任务数组(直接格式):', responseData);
        return responseData;
      } else {
        console.error('未知的响应格式:', responseData);
        throw new Error('服务器返回了未知格式的数据');
      }
    } catch (error) {
      console.error('任务分解失败:', error);
      throw error;
    }
  }

  /**
   * 分析并分解任务
   * @param taskData 任务数据
   * @returns 完整的分析和分解结果
   */
  async analyzeAndDecomposeTask(taskData: {
    taskId: string;
    title: string;
    description: string;
  }): Promise<TaskBreakdownResult> {
    try {
      console.log('开始任务分析和拆解流程:', taskData);
      
      // 先分析复杂度
      const analysis = await this.analyzeTaskComplexity(taskData);
      console.log('任务分析完成，复杂度:', analysis.complexity);
      
      // 准备拆解请求参数，将前端复杂度值映射回后端格式
      let backendComplexity = 'MEDIUM';
      if (analysis.complexity === 'SIMPLE') backendComplexity = 'LOW';
      if (analysis.complexity === 'COMPLEX') backendComplexity = 'HIGH';
      
      // 保存一下原始请求，以便调试
      const decomposeRequest = {
        ...taskData,
        complexity: backendComplexity
      };
      console.log('发起任务分解请求，参数:', decomposeRequest);
      
      // 然后进行任务分解
      const subTasks = await this.decomposeTask(decomposeRequest);
      
      console.log('任务拆解完成，生成子任务数:', subTasks.length);
      
      return {
        analysis,
        subTasks
      };
    } catch (error) {
      console.error('任务分析和分解失败:', error);
      throw error;
    }
  }
}

export default new TaskBreakdownService(); 