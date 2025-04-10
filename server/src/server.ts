/**
 * TaskForest服务器启动文件
 */
import app from './app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 9000;

// 连接数据库并启动服务器
async function startServer() {
  try {
    // 验证数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log('✅ 服务已启动');
      console.log(`🔗 服务地址: http://localhost:${PORT}`);
      console.log(`🔗 API基础路径: http://localhost:${PORT}/api`);
      console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
      console.log('\n开发环境准备就绪. 按 Ctrl+C 停止服务.\n');
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