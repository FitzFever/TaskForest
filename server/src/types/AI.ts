/**
 * 任务信息接口
 */
export interface TaskInfo {
  /**
   * 任务标题
   */
  title: string;
  
  /**
   * 任务描述
   */
  description: string;
  
  /**
   * 任务复杂度（选填，1-5）
   */
  complexity?: number;
  
  /**
   * 预估工时（选填，小时）
   */
  estimatedHours?: number;
  
  /**
   * 截止日期（选填）
   */
  dueDate?: string;
  
  /**
   * 任务类型（选填）
   */
  taskType?: string;
  
  /**
   * 优先级（选填，1-5）
   */
  priority?: number;
}

/**
 * 任务分析结果接口
 */
export interface TaskAnalysisResult {
  /**
   * 任务复杂度（1-5）
   */
  complexity: number;
  
  /**
   * 预估工时（小时）
   */
  estimatedHours: number;
  
  /**
   * 技能要求
   */
  skillsRequired: string[];
  
  /**
   * 分析总结
   */
  summary: string;
  
  /**
   * 潜在风险
   */
  potentialRisks?: string[];
}

/**
 * 子任务接口
 */
export interface SubTask {
  /**
   * 子任务标题
   */
  title: string;
  
  /**
   * 子任务描述
   */
  description: string;
  
  /**
   * 预估工时（小时）
   */
  estimatedHours: number;
  
  /**
   * 任务类型
   */
  taskType: string;
  
  /**
   * 优先级（1-5）
   */
  priority: number;
  
  /**
   * 子任务顺序
   */
  order: number;
  
  /**
   * 依赖任务IDs（完成本任务前需要完成的任务）
   */
  dependencies?: string[];
}

/**
 * 任务拆解结果接口
 */
export interface TaskBreakdownResult {
  /**
   * 主任务信息
   */
  mainTask: TaskInfo;
  
  /**
   * 子任务列表
   */
  subTasks: SubTask[];
  
  /**
   * 拆解策略说明
   */
  breakdownStrategy: string;
  
  /**
   * 整体时间线建议
   */
  timelineAdvice?: string;
}

/**
 * DeepSeek API响应类型
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
 * 任务信息类型
 */
export interface TaskInfo {
  title: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedHours: number;
  dueDate?: string;
  taskType: 'feature' | 'bugfix' | 'refactor' | 'documentation' | 'test' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * 任务分析结果类型
 */
export interface TaskAnalysisResult {
  complexity: 'simple' | 'medium' | 'complex';
  estimatedHours: number;
  skills: string[];
  risks: string[];
  suggestedDeadline?: string;
}

/**
 * 任务拆解项类型
 */
export interface SubTask {
  title: string;
  description: string;
  estimatedHours: number;
  dependsOn?: string[]; // 依赖的其他子任务的ID列表
  order: number; // 执行顺序
}

/**
 * 任务拆解结果类型
 */
export interface TaskDecompositionResult {
  mainTaskId: string;
  subTasks: SubTask[];
}

/**
 * AI任务分析请求参数
 */
export interface TaskAnalysisRequest {
  taskId: string;
  title: string;
  description: string;
}

/**
 * AI任务拆解请求参数
 */
export interface TaskDecompositionRequest {
  taskId: string;
  title: string;
  description: string;
  complexity: string;
  estimatedHours: number;
}

/**
 * 任务分析和拆解的完整响应
 */
export interface AITaskResponse {
  analysis: TaskAnalysisResult;
  decomposition: SubTask[];
} 