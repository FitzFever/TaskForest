// 服务器配置
// 默认配置
export const config = {
    port: Number(process.env.PORT) || 3000,
    environment: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'file:../data/taskforest.db',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    logLevel: process.env.LOG_LEVEL || 'info',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};
// 根据环境加载不同配置
if (config.environment === 'production') {
    // 生产环境特定配置
    config.corsOrigin = process.env.CORS_ORIGIN || 'https://taskforest.app';
}
else if (config.environment === 'test') {
    // 测试环境特定配置
    config.databaseUrl = 'file::memory:';
}
//# sourceMappingURL=index.js.map