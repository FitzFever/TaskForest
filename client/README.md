# TaskForest 前端项目

TaskForest 前端项目是一个基于 React 的任务管理应用，集成了3D森林可视化功能，帮助用户通过树木的生长状态直观地了解任务完成情况。

## 技术栈

- **React 18**: 用于构建用户界面
- **TypeScript 5**: 提供类型安全
- **Vite**: 用于快速开发和构建
- **Ant Design 5**: UI组件库
- **Three.js**: 3D渲染引擎
- **Axios**: HTTP请求客户端
- **React Router**: 路由管理
- **Zustand**: 状态管理（轻量级）

## 项目结构

```
client/
├── public/          # 静态资源
├── src/
│   ├── adapters/    # 数据适配器
│   ├── api/         # API调用
│   ├── assets/      # 资源文件
│   ├── components/  # 共享组件
│   ├── contexts/    # React上下文
│   ├── hooks/       # 自定义Hooks
│   ├── pages/       # 页面组件
│   ├── services/    # 服务层
│   ├── stores/      # 状态存储
│   ├── types/       # TypeScript类型
│   ├── utils/       # 工具函数
│   ├── App.tsx      # 主应用组件
│   └── main.tsx     # 入口文件
├── .eslintrc.json   # ESLint配置
├── .prettierrc      # Prettier配置
├── tsconfig.json    # TypeScript配置
├── vite.config.ts   # Vite配置
└── package.json     # 项目依赖
```

## 开发进度

### 已完成功能 ✅

- 基础项目设置与配置
- 主界面布局与导航
- 任务列表视图与操作
- 任务创建与编辑表单
- 任务状态和优先级管理
- 基础API服务封装
- 简单的错误处理和加载状态
- 响应式设计适配
- 暗黑模式支持
- 基础3D场景集成

### 进行中 🔄

- 任务标签系统优化 (70%)
- 任务筛选和搜索功能增强 (80%)
- 树木与任务关联展示 (60%)
- 树木健康状态可视化 (50%)
- 用户设置界面 (20%)
- 数据可视化组件 (10%)
- 性能优化与代码重构 (30%)

### 待实现 ⬜

- 高级3D交互功能
- 任务统计仪表板
- 环境效果（天气、时间变化）
- 成就和奖励系统
- 引导教程
- 数据导入/导出功能
- 离线支持
- 移动端深度优化

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## API文档

前端服务与后端API交互主要通过 `src/services` 目录下的服务类实现，主要包括：

- `taskService.ts`: 任务相关API
- `treeService.ts`: 树木相关API
- `userService.ts`: 用户相关API
- `api.ts`: 基础API配置

详细API参数和返回值请参考 `src/types` 目录下的类型定义。

## 组件库

项目使用 Ant Design 组件库，同时封装了一些自定义组件以满足特定需求：

- `TaskCard`: 任务卡片组件
- `TaskForm`: 任务表单组件
- `TreeView`: 树木3D视图组件
- `FilterPanel`: 过滤面板组件
- `PageLayout`: 页面布局组件

## 贡献指南

1. 确保遵循项目的代码风格和TypeScript类型定义
2. 提交前运行代码检查和格式化
3. 编写必要的测试用例
4. 提交PR前先与相关团队成员讨论设计决策 