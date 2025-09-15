/**
 * TaskForest服务器启动文件
 */
import app from './app.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

// 加载环境变量
dotenv.config();

// 获取端口配置
const PORT = process.env.PORT || 3000;

// 连接数据库并启动服务器
async function startServer() {
  try {
    // 验证数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`TaskForest API服务已启动，监听端口: ${PORT}`);
      console.log(`服务访问地址: http://localhost:${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 启动服务器失败:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// 处理进程结束信号
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('数据库连接已关闭');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('数据库连接已关闭');
  process.exit(0);
});

// 启动服务器
startServer(); 