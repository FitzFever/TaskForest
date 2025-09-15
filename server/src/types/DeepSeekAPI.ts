/**
 * DeepSeek API的响应格式
 */
export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 任务复杂度枚举
 */
export enum TaskComplexity {
  SIMPLE = 'SIMPLE',
  MEDIUM = 'MEDIUM',
  COMPLEX = 'COMPLEX'
}

/**
 * 任务分析请求接口
 */
export interface TaskAnalysisRequest {
  taskId: string;
  title: string;
  description: string;
}

/**
 * 任务分析结果接口
 */
export interface TaskAnalysisResult {
  complexity: TaskComplexity;
  estimatedHours: number;
  skills: string[];
  risks: string[];
  suggestedDeadline: string;
}

/**
 * 任务拆解请求接口
 */
export interface TaskDecompositionRequest {
  taskId: string;
  title: string;
  description: string;
  complexity: TaskComplexity;
  estimatedHours: number;
}

/**
 * 子任务接口
 */
export interface SubTask {
  title: string;
  description: string;
  estimatedHours: number;
  dependsOn: number[];
  order: number;
}

/**
 * AI任务分析请求参数
 */
export interface AITaskResponse {
  analysis: TaskAnalysisResult;
  decomposition: SubTask[];
} 