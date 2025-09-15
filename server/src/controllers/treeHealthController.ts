/**
 * 树木健康状态控制器
 * 处理树木健康状态相关的API请求
 */
import { Request, Response } from 'express';
import treeHealthService from '../services/treeHealthService.js';

/**
 * 获取树木健康状态
 * @route GET /api/trees/:id/health
 */
export async function getTreeHealth(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const healthDetails = await treeHealthService.getTreeHealth(id);
    
    if (!healthDetails) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: healthDetails,
      message: '获取树木健康状态成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取树木健康状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取树木健康状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 更新树木健康状态
 * @route PUT /api/trees/:id/health
 */
export async function updateTreeHealth(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { healthState, notes } = req.body;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 验证健康状态值
    if (typeof healthState !== 'number' || healthState < 0 || healthState > 100) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '无效的健康状态值',
          details: {
            field: 'healthState',
            reason: 'out_of_range',
            allowedRange: [0, 100]
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const updatedHealth = await treeHealthService.updateTreeHealth(id, healthState, notes);
    
    if (!updatedHealth) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: updatedHealth,
      message: '树木健康状态更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新树木健康状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新树木健康状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 获取任务与树木健康关联
 * @route GET /api/tasks/:id/tree-health
 */
export async function getTaskTreeHealth(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const healthDetails = await treeHealthService.getTaskTreeHealth(id);
    
    if (!healthDetails) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在或没有关联的树木' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: healthDetails,
      message: '获取任务树木健康关联成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务树木健康关联失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取任务树木健康关联失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 更新任务进度（影响健康状态）
 * @route PUT /api/tasks/:id/progress
 */
export async function updateTaskProgress(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { progress, notes } = req.body;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 验证进度值
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '无效的进度值',
          details: {
            field: 'progress',
            reason: 'out_of_range',
            allowedRange: [0, 100]
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const result = await treeHealthService.updateTaskProgress(id, progress, notes);
    
    if (!result) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: result,
      message: '任务进度和树木健康状态更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新任务进度失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新任务进度失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 批量更新所有树木健康状态
 * @route POST /api/trees/health/batch-update
 */
export async function batchUpdateTreesHealth(req: Request, res: Response) {
  try {
    await treeHealthService.calculateAllTreesHealth();
    
    return res.status(200).json({
      code: 200,
      data: { message: '已完成所有树木健康状态更新' },
      message: '批量更新树木健康状态成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('批量更新树木健康状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '批量更新树木健康状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
} 