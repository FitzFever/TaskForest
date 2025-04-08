/**
 * 数据库连接配置
 * 初始化并导出Prisma客户端实例
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
// 加载环境变量
dotenv.config();
// 创建Prisma客户端实例
export const prisma = new PrismaClient();
// 监听Prisma查询事件（开发环境下便于调试）
if (process.env.NODE_ENV === 'development') {
    prisma.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        console.log(`查询 ${params.model}.${params.action} 耗时: ${after - before}ms`);
        return result;
    });
}
/**
 * 初始化数据库连接
 */
export async function initDatabase() {
    try {
        // 测试数据库连接
        await prisma.$connect();
        console.log('数据库连接成功');
        // 检查数据库连接是否需要初始化或迁移
        console.log('数据库已准备就绪');
    }
    catch (error) {
        console.error('数据库连接或初始化失败:', error);
        process.exit(1);
    }
}
// 初始化数据库
initDatabase().catch(console.error);
// 为了确保应用正常退出时关闭数据库连接
process.on('exit', () => {
    prisma.$disconnect()
        .catch((e) => console.error('关闭数据库连接时出错:', e));
});
// 处理进程终止信号
process.on('SIGINT', () => {
    console.log('正在关闭数据库连接...');
    prisma.$disconnect()
        .catch((e) => console.error('关闭数据库连接时出错:', e))
        .finally(() => process.exit(0));
});
//# sourceMappingURL=db.js.map