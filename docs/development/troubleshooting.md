# TaskForest 开发常见问题解决指南

本文档总结了在 TaskForest 项目开发过程中可能遇到的常见技术问题和解决方案，帮助开发人员快速定位和解决问题。

## ESM 模块问题

### 导入路径必须添加 .js 后缀

**问题**：使用 ESM 模块系统时，导入模块路径缺少扩展名导致报错。

**解决方案**：
```typescript
// ❌ 错误
import { someFunction } from '../utils/helpers';

// ✅ 正确
import { someFunction } from '../utils/helpers.js';
```

> 注意：即使源文件是 .ts 文件，ESM 模式下导入时也必须使用 .js 后缀，因为 TypeScript 编译后的文件是 .js。

### TypeScript 配置支持 ESM

确保 tsconfig.json 包含适当的 ESM 支持配置：

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "target": "ESNext",
    "esModuleInterop": true,
    "type": "module"
  }
}
```

### package.json 设置

在 package.json 中必须声明模块类型：

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsc && node dist/app.js"
  }
}
```

## Prisma 与类型系统问题

### 类型不匹配

**问题**：Prisma 生成的模型类型与自定义接口定义不匹配。

**解决方案**：

1. **ID 类型匹配**：确保 ID 类型一致（Prisma 默认使用 string）

```typescript
// 在 Controller 中
async function getById(req: Request, res: Response) {
  const id = req.params.id; // 使用字符串类型，而非 parseInt
  const item = await prisma.model.findUnique({ where: { id } });
}
```

2. **字段命名一致**：处理模型与 DTO 字段名称不一致的情况

```typescript
// 创建映射关系
const updateData: any = {};
if (dto.species) updateData.type = dto.species;
if (dto.lastWatered) updateData.lastGrowth = dto.lastWatered;

await prisma.model.update({
  where: { id },
  data: updateData
});
```

3. **类型断言**：处理接口不完全匹配

```typescript
const dbData = await prisma.model.findMany();
return dbData as unknown as CustomInterface[];
```

### Prisma 查询条件问题

使用字符串类型的标签过滤时的正确方式：

```typescript
// ❌ 错误 - 对应于数组类型字段
where.tags = { hasSome: tags };

// ✅ 正确 - 对应字符串类型字段
const tagConditions = tags.map(tag => ({
  tags: { contains: tag }
}));
where.OR = tagConditions;
```

## 前端配置问题

### Vite 配置

确保 `client/vite.config.ts` 正确配置：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### 入口文件

确保存在以下关键入口文件：
- `client/src/main.tsx` - React 应用入口
- `client/index.html` - HTML 模板
- `client/public/index.html` - 静态 HTML 文件（如有需要）
- `client/src/App.tsx` - React 根组件

### 端口被占用

如果端口被占用，Vite 会自动尝试其他端口：
```
Port 5173 is in use, trying another one...
VITE v5.4.17  ready in 121 ms
➜  Local:   http://localhost:5174/
```

确保在代理配置和API请求中使用正确的端口。

## 构建与启动问题

### 后端构建流程

推荐的构建和启动流程：

```bash
# 正确方法：先编译再运行
npm run build # 执行 tsc
npm run start # 执行 node dist/app.js
```

### 避免 ts-node 直接运行 ESM

**问题**：在 ESM 模式下使用 ts-node 直接运行可能遇到模块解析错误。

**解决方案**：修改 package.json 的 dev 脚本：

```json
{
  "scripts": {
    "dev": "tsc && node dist/app.js",
    "dev:watch": "tsc --watch & nodemon dist/app.js"
  }
}
```

### 服务器启动检查

确保服务器成功启动的验证方法：

```bash
# 检查健康端点
curl http://localhost:3000/health
# 期望输出: {"status":"ok","timestamp":"2023-xx-xx"}

# 检查 API 端点
curl http://localhost:3000/api/tasks
```

## 数据库相关问题

### Prisma 初始化

确保 Prisma 客户端正确初始化：

```typescript
// db.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function initDatabase() {
  try {
    await prisma.$connect();
    console.log('数据库连接成功');
    console.log('数据库已准备就绪');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}
```

### 数据库路径

确保正确设置数据库路径：

```
DATABASE_URL="file:./dev.db"  # 相对于 prisma 目录
```

## 环境变量问题

如果环境变量未正确加载，请检查：

1. `.env` 文件是否存在且格式正确
2. 是否已调用 `dotenv.config()`
3. 环境变量名称是否正确（区分大小写）

## 路由问题

确保路由注册顺序和中间件应用顺序正确：

```typescript
// 注册中间件
app.use(cors());
app.use(express.json());

// 挂载主路由
app.use('/api', router);

// 健康检查端点
app.get('/health', (req, res) => {...});

// 错误处理中间件放在最后
app.use(errorHandler);
``` 