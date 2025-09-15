require('dotenv').config();

// 服务器配置

interface Config {
  server: {
    port: string | number;
    env: string;
  };
  deepseek: {
    apiKey: string;
    baseUrl: string;
    betaUrl: string;
  };
  database: {
    url: string;
  };
  logging: {
    level: string;
  };
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

// 默认配置
export const config: Config = {
  server: {
    port: process.env.PORT || 9000,
    env: process.env.NODE_ENV || 'development',
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
    betaUrl: 'https://api.deepseek.com/beta'
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};

// 根据环境加载不同配置
if (config.environment === 'production') {
  // 生产环境特定配置
  config.corsOrigin = process.env.CORS_ORIGIN || 'https://taskforest.app';
} else if (config.environment === 'test') {
  // 测试环境特定配置
  config.databaseUrl = 'file::memory:';
} 