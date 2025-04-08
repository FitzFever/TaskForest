/**
 * 全局错误处理中间件
 * 统一处理应用中的错误响应格式
 */
import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

/**
 * 自定义错误类，包含状态码和错误类型
 */
export class ApiError extends Error {
  statusCode: number;
  type: string;
  details?: any;

  constructor(statusCode: number, message: string, type: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.name = 'ApiError';
  }
}

// 错误处理中间件
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // 默认错误响应
  let statusCode = 500;
  let message = '服务器内部错误';
  let type = 'INTERNAL_ERROR';
  let details: any = undefined;

  // 处理自定义API错误
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    type = err.type;
    details = err.details;
  } 
  // 处理Prisma错误
  else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = '数据库操作错误';
    type = 'DATABASE_ERROR';
    details = err.message;
  } 
  // 处理Express验证错误
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '请求参数验证失败';
    type = 'VALIDATION_ERROR';
    details = err.message;
  }

  // 发送错误响应
  res.status(statusCode).json({
    code: statusCode,
    message,
    error: {
      type,
      message,
      details
    },
    timestamp: Date.now()
  });
}; 