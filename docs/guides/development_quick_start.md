# TaskForest 开发快速指南

本指南为开发人员提供快速上手 TaskForest 项目开发的步骤和最佳实践。

## 环境准备

1. **安装必要工具**
   ```bash
   # 安装 Node.js (推荐使用 nvm)
   nvm install 18
   nvm use 18
   
   # 安装 pnpm
   npm install -g pnpm@7
   
   # 检查版本
   node -v  # 应该是 v18.x.x
   pnpm -v  # 应该是 7.x.x
   ```

2. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/taskforest.git
   cd taskforest
   ```

3. **安装依赖**
   ```bash
   # 全局安装
   pnpm install
   
   # 安装前端依赖
   cd client && pnpm install && cd ..
   
   # 安装后端依赖
   cd server && pnpm install && cd ..
   ```

## 开发流程

### 前端开发

1. **启动前端服务**
   ```bash
   cd client
   pnpm dev
   ```
   
   服务将在 http://localhost:5173 运行

2. **前端开发规范**
   - 使用函数式组件和 React Hooks
   - 状态管理使用 Zustand
   - 3D 渲染使用 Three.js
   - 样式使用 TailwindCSS + CSS Modules
   - 保持组件小而专注

3. **前端目录结构**
   ```
   client/src/
   ├── components/   # 通用组件
   ├── pages/        # 页面组件
   ├── store/        # Zustand 状态管理
   ├── services/     # API 服务
   ├── three/        # Three.js 3D 相关
   └── utils/        # 工具函数
   ```

### 后端开发

1. **启动后端服务**
   ```bash
   cd server
   pnpm dev
   ```
   
   服务将在 http://localhost:3000 运行

2. **数据库准备**
   ```bash
   # 应用 Prisma 迁移
   cd server
   npx prisma db push
   
   # 生成 Prisma 客户端
   npx prisma generate
   ```

3. **后端开发规范**
   - 使用 ESM 模块系统（导入路径需要 .js 后缀）
   - 遵循控制器-服务-数据模型三层结构
   - 使用 Prisma 进行数据库操作
   - 保持 RESTful API 设计
   - 使用异步/await 处理异步操作

4. **后端目录结构**
   ```
   server/src/
   ├── controllers/  # API 控制器
   ├── services/     # 业务逻辑
   ├── models/       # 数据模型（Prisma 生成）
   ├── routes/       # 路由配置
   ├── middleware/   # 中间件
   └── utils/        # 工具函数
   ```

## 开发最佳实践

### TypeScript 类型定义

1. **保持类型一致性**
   - 为所有接口和 API 响应定义类型
   - 避免使用 `any` 类型
   - 使用 Prisma 生成的类型作为基础

2. **前后端类型共享** (如适用)
   ```typescript
   // types/task.ts
   export interface Task {
     id: string;
     title: string;
     status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
     // ...
   }
   ```

### 前后端通信

1. **API 服务封装**
   ```typescript
   // client/src/services/api.ts
   async function getTasks() {
     const response = await fetch('/api/tasks');
     if (!response.ok) throw new Error('Failed to fetch tasks');
     return response.json();
   }
   ```

2. **错误处理**
   ```typescript
   try {
     const data = await apiService.getTasks();
     // 处理成功响应
   } catch (error) {
     // 错误处理
     console.error('Error fetching tasks:', error);
   }
   ```

### 状态管理

1. **Zustand 存储示例**
   ```typescript
   // client/src/store/taskStore.ts
   import create from 'zustand';
   
   interface TaskState {
     tasks: Task[];
     isLoading: boolean;
     error: string | null;
     fetchTasks: () => Promise<void>;
     // ...其他操作
   }
   
   export const useTaskStore = create<TaskState>((set) => ({
     tasks: [],
     isLoading: false,
     error: null,
     fetchTasks: async () => {
       set({ isLoading: true, error: null });
       try {
         const tasks = await apiService.getTasks();
         set({ tasks, isLoading: false });
       } catch (error) {
         set({ error: error.message, isLoading: false });
       }
     },
     // ...其他操作
   }));
   ```

### 数据库操作

1. **Prisma 操作示例**
   ```typescript
   // server/src/services/taskService.ts
   import { prisma } from '../db.js';
   
   async function getTasks(filter = {}) {
     return await prisma.task.findMany({
       where: filter,
       orderBy: { createdAt: 'desc' },
     });
   }
   ```

## 常见问题解决

如果遇到开发问题，请参阅 [开发常见问题解决指南](../development/troubleshooting.md)。

## 提交代码

1. **代码提交规范**
   ```bash
   # 提交代码
   git add .
   git commit -m "feat: 添加任务过滤功能"
   git push
   ```

2. **提交前检查**
   - 运行测试 (如果有)
   - 代码格式化
   - 确保无编译错误

3. **提交信息规范**
   - feat: 新功能
   - fix: 错误修复
   - docs: 文档更新
   - style: 代码风格调整
   - refactor: 代码重构
   - perf: 性能优化
   - test: 测试相关
   - chore: 构建过程或辅助工具变动 