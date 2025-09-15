import { PrismaClient } from '@prisma/client';
// 创建Prisma客户端实例
export const prisma = new PrismaClient();
// 用于简化事务处理的辅助函数
export const db = {
    // 事务函数
    async transaction(callback) {
        return await prisma.$transaction(async (tx) => {
            return await callback(tx);
        });
    }
};
// 初始化数据库连接
export async function initDatabase() {
    try {
        await prisma.$connect();
        console.log('数据库连接成功');
        return prisma;
    }
    catch (error) {
        console.error('数据库连接失败:', error);
        process.exit(1);
    }
}
// 关闭数据库连接
export async function closeDatabase() {
    await prisma.$disconnect();
    console.log('数据库连接已关闭');
}
//# sourceMappingURL=index.js.map