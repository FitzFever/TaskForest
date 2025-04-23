import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// 路由导入
import taskRoutes from './routes/taskRoutes.js';
import taskBreakdownRoutes from './routes/taskBreakdownRoutes.js';
import taskIntegrationRoutes from './routes/taskIntegrationRoutes.js';
import textToTaskRoutes from './routes/textToTaskRoutes.js';
import batchTaskRoutes from './routes/batchTaskRoutes.js';

// 获取当前模块的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskForest API',
      version: '1.0.0',
      description: 'TaskForest项目管理系统API文档',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: '开发服务器',
      },
    ],
  },
  apis: [
    path.join(__dirname, './routes/*.js'),
    path.join(__dirname, './controllers/*.js'),
    path.join(__dirname, './models/*.js'),
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // 增加请求体大小限制，以支持较长文本
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API文档路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API路由
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', taskBreakdownRoutes);
app.use('/api/tasks', taskIntegrationRoutes);
app.use('/api/text-to-task', textToTaskRoutes);
app.use('/api', batchTaskRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service is healthy' });
});

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '未找到请求的资源',
    path: req.path
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

export default app; 