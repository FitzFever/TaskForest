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
│   ├── hooks/            # 自定义 Hooks
│   ├── store/            # Zustand 状态管理
│   │   ├── taskStore.ts  # 任务状态
│   │   ├── treeStore.ts  # 树木状态
│   │   ├── sceneStore.ts # 场景状态
│   │   └── index.ts      # 状态导出
│   ├── pages/            # 页面组件
│   │   ├── Dashboard.tsx # 仪表盘页面
│   │   ├── TaskList.tsx  # 任务列表页面
│   │   ├── Forest.tsx    # 森林页面
│   │   └── Settings.tsx  # 设置页面
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
│   ├── types/            # 类型定义
│   ├── constants/        # 常量定义
│   ├── assets/           # 静态资源
│   ├── App.tsx           # 应用入口组件
│   ├── main.tsx          # 入口文件
│   └── electron/         # Electron 相关代码
├── public/               # 公共资源
│   ├── models/           # 3D 模型文件
│   ├── textures/         # 纹理文件
│   └── icons/            # 图标资源
├── electron/             # Electron 主进程
│   ├── main.ts           # 主进程入口
│   ├── preload.ts        # 预加载脚本
│   └── ipc.ts            # IPC 通信
├── tests/                # 测试文件
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

### 组件开发规范

1. 使用函数式组件和 React Hooks
2. 组件文件结构：
   ```
   ComponentName/
   ├── index.tsx      # 组件主文件
   ├── styles.module.css  # 组件样式
   └── ComponentName.test.tsx  # 组件测试
   ```
3. Props 类型使用 TypeScript interface 定义
4. 遵循单一职责原则，一个组件只负责一种功能

### 代码风格

1. 使用 ESLint 和 Prettier 保持代码风格一致
2. 变量和函数使用 camelCase 命名
3. 组件使用 PascalCase 命名
4. 常量使用 UPPER_SNAKE_CASE 命名
5. 文件名使用 kebab-case 命名

### 状态管理

1. 使用 Zustand 进行状态管理
2. 按领域划分 store (任务、树木、场景等)
3. 保持 store 结构扁平化
4. 异步操作使用 async/await

### 样式管理

1. 使用 CSS Modules 避免样式冲突
2. 全局样式使用 Tailwind 工具类
3. 自定义组件样式使用 CSS Modules
4. 复杂样式使用 BEM 命名方式

## 性能优化

### 3D 渲染优化

1. 使用 LOD (Level of Detail) 系统
2. 实现实例化渲染 (Instanced Rendering)
3. 使用模型缓存和资源预加载
4. 合理使用后处理效果
5. 实现视锥体剔除

### React 性能优化

1. 使用 React.memo 避免不必要的重渲染
2. 使用 useCallback 和 useMemo 缓存函数和计算结果
3. 实现虚拟列表优化长列表渲染
4. 使用 React Suspense 和懒加载优化首次加载
5. 避免不必要的状态更新

## API 接口调用

使用封装的 API 服务调用后端接口：

```typescript
// 示例：获取任务列表
import { taskService } from "../services";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await taskService.getTasks();
        setTasks(response.data);
      } catch (error) {
        // 错误处理
      }
    };
    
    fetchTasks();
  }, []);

  // 组件渲染
};
```

## 文档

- [API 服务接口文档](../docs/api/api_reference.md)
- [状态管理设计](../docs/design/state_management.md)
- [3D 渲染文档](../docs/design/3d_rendering.md)
- [组件设计文档](../docs/design/components.md)

## 贡献

请参阅[贡献指南](../docs/development/contributing.md)了解如何为前端项目做出贡献。 