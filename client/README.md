# TaskForest 前端项目

TaskForest 前端项目基于 React + TypeScript 构建，结合 Three.js 实现 3D 森林可视化，通过 Electron 打包为桌面应用。

## 技术栈

- **框架**: React 18 + TypeScript 5
- **构建工具**: Vite 4
- **状态管理**: Zustand 4
- **UI 组件库**: Ant Design 5
- **3D 渲染**: Three.js + React Three Fiber
- **动画效果**: GSAP + Framer Motion
- **样式方案**: TailwindCSS 3 + CSS Modules
- **测试框架**: Jest + React Testing Library

## 项目结构

```
client/
├── src/                  # 源代码目录
│   ├── components/       # React 组件
│   │   ├── layout/       # 布局组件
│   │   ├── task/         # 任务相关组件
│   │   ├── tree/         # 树木相关组件
│   │   ├── forest/       # 森林场景组件
│   │   ├── statistics/   # 统计分析组件
│   │   └── shared/       # 共享组件
│   ├── pages/            # 页面组件
│   │   ├── Dashboard.tsx # 仪表盘页面
│   │   ├── TaskList.tsx  # 任务列表页面
│   │   ├── Forest.tsx    # 森林页面
│   │   └── Settings.tsx  # 设置页面
│   ├── store/            # Zustand 状态管理
│   │   ├── taskStore.ts  # 任务状态
│   │   ├── treeStore.ts  # 树木状态
│   │   ├── sceneStore.ts # 场景状态
│   │   └── index.ts      # 状态导出
│   ├── services/         # API 服务
│   │   ├── api.ts        # API 客户端
│   │   ├── taskService.ts # 任务服务
│   │   ├── treeService.ts # 树木服务
│   │   └── aiService.ts   # AI 助手服务
│   ├── three/            # Three.js 相关代码
│   │   ├── models/       # 3D 模型管理
│   │   ├── scenes/       # 场景管理
│   │   ├── renderers/    # 渲染器
│   │   ├── controls/     # 相机控制
│   │   └── utils/        # 3D 工具函数
│   ├── utils/            # 工具函数
│   │   ├── date.ts       # 日期处理
│   │   ├── format.ts     # 格式化工具
│   │   └── storage.ts    # 本地存储工具
│   ├── App.tsx           # 应用入口组件
│   └── main.tsx          # 入口文件
├── public/               # 公共资源
│   ├── models/           # 3D 模型文件
│   ├── textures/         # 纹理文件
│   └── icons/            # 图标资源
├── .eslintrc.js          # ESLint 配置
├── .prettierrc           # Prettier 配置
├── tailwind.config.js    # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── package.json          # 项目依赖
```

## 开发指南

### 安装依赖

```bash
# 进入前端目录
cd client

# 安装依赖
pnpm install
```

### 启动开发服务器

```bash
# 启动 Web 版本开发服务器
pnpm dev

# 启动 Electron 版本开发服务器
pnpm electron:dev
```

### 构建应用

```bash
# 构建 Web 版本
pnpm build

# 构建 Electron 桌面应用
pnpm electron:build
```

## 开发规范

详细的开发规范请参考 [开发规范文档](../docs/development/standards.md)。

主要规范要点：

1. 使用函数式组件和 React Hooks
2. 遵循单一职责原则，一个组件只负责一种功能
3. 使用 TypeScript 类型定义，避免 any 类型
4. 使用 CSS Modules 管理样式，避免样式冲突
5. 使用 Zustand 进行状态管理，按领域划分 store

## API 接口调用

详细的 API 接口文档请参考 [API 文档](../docs/api/api_reference.md)。

## 贡献

请参阅[贡献指南](../docs/development/contributing.md)了解如何为前端项目做出贡献。 