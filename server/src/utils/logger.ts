import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

// 确保日志目录存在
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * 创建Winston logger实例
 */
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'taskforest-server' },
  transports: [
    // 控制台输出
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
        )
      ),
    }),
    // 信息日志文件
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      level: 'info',
    }),
    // 错误日志文件
    new transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  ],
});

// 开发环境下的额外配置
if (process.env.NODE_ENV !== 'production') {
  // 更简洁的控制台输出格式
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

export default logger; 