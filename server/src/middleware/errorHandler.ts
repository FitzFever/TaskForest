import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 默认状态码和错误信息
  let statusCode = 500;
  let message = '服务器内部错误';
  let stack: string | undefined = undefined;

  // 如果是自定义操作错误，使用其状态码和消息
  if ('statusCode' in err && 'isOperational' in err) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 开发环境下提供错误堆栈
  if (config.environment === 'development' || config.environment === 'test') {
    stack = err.stack;
  }

  // 发送错误响应
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    stack,
    timestamp: new Date().toISOString()
  });
}; 