import { Request, Response } from 'express';
import { DeepSeekService } from '../services/deepseekService.js';
import { TaskAnalysisRequest, TaskDecompositionRequest } from '../types/DeepSeekAPI.js';
import logger from '../utils/logger.js';

/**
 * 任务分析控制器 - 处理任务分析和拆解的API请求
 */
export class TaskAnalysisController {
  private deepseekService: DeepSeekService;

  constructor() {
    this.deepseekService = new DeepSeekService();
  }

  /**
   * 分析任务复杂度
   * @param req 请求对象
   * @param res 响应对象
   */
  public analyzeTaskComplexity = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: TaskAnalysisRequest = req.body;
      
      // 验证请求
      if (!request.taskId || !request.title) {
        res.status(400).json({ error: '缺少必要的任务信息' });
        return;
      }

      logger.info('收到任务分析请求', { taskId: request.taskId });
      
      const result = await this.deepseekService.analyzeTaskComplexity(request);
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('任务分析处理失败', { error });
      res.status(500).json({ error: `分析任务失败: ${(error as Error).message}` });
    }
  };

  /**
   * 拆解任务为子任务
   * @param req 请求对象
   * @param res 响应对象
   */
  public decomposeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: TaskDecompositionRequest = req.body;
      
      // 验证请求
      if (!request.taskId || !request.title || !request.complexity) {
        res.status(400).json({ error: '缺少必要的任务信息' });
        return;
      }

      logger.info('收到任务拆解请求', { taskId: request.taskId });
      
      const subTasks = await this.deepseekService.decomposeTask(request);
      
      res.status(200).json(subTasks);
    } catch (error) {
      logger.error('任务拆解处理失败', { error });
      res.status(500).json({ error: `拆解任务失败: ${(error as Error).message}` });
    }
  };
} 