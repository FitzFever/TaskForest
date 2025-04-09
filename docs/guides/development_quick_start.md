# TaskForest 开发快速指南

本文档为TaskForest项目的开发快速入门指南，帮助新加入开发团队的成员快速了解项目结构、开发流程和关键功能点。

## 1. 项目简介

TaskForest是一款将任务管理与游戏化体验相结合的应用，通过将任务转化为树木生长过程，为用户提供直观、有趣且富有成就感的任务管理体验。

核心特点：
- 视觉化任务管理：任务转化为树木生长过程
- 游戏化激励机制：基于树木健康状态的反馈系统
- 3D森林场景：直观展示任务完成情况
- 健康状态系统：根据任务进度和截止日期动态调整树木状态

## 2. 环境搭建

### 2.1 系统要求

- Node.js v16+
- npm 7+ 或 pnpm 6+
- Git
- 浏览器: Chrome 80+, Firefox 75+, Safari 14+
- 可选: VSCode (推荐)

### 2.2 开发环境设置

```bash
# 1. 克隆项目仓库
git clone https://github.com/your-username/taskforest.git
cd taskforest

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑.env文件设置必要参数

# 4. 启动前端开发服务器
cd client
pnpm dev

# 5. 启动后端服务器(新终端)
cd server
pnpm dev
```

### 2.3 VSCode推荐扩展

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens
- Three.js Editor

## 3. 项目结构

```
taskforest/
├── client/               # 前端项目
│   ├── public/           # 静态资源
│   ├── src/
│   │   ├── components/   # React组件
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API服务
│   │   ├── store/        # 状态管理
│   │   ├── three/        # 3D渲染相关
│   │   ├── types/        # TypeScript类型
│   │   └── utils/        # 工具函数
│   └── vite.config.ts    # Vite配置
│
├── server/               # 后端项目
│   ├── prisma/           # 数据库模型
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── middlewares/  # 中间件
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── services/     # 服务
│   │   └── utils/        # 工具函数
│   └── server.js         # 服务器入口
│
├── docs/                 # 文档
│   ├── api/              # API文档
│   ├── architecture/     # 架构文档
│   ├── guides/           # 指南文档
│   └── modules/          # 模块文档
│
└── README.md             # 项目说明
```

## 4. 核心功能模块

### 4.1 任务管理模块

- 位置: `client/src/services/taskService.ts`
- 相关组件: `TaskList`, `TaskForm`, `TaskDetail`
- API端点: `/api/tasks`

**主要功能**:
- 任务CRUD操作
- 任务分类和标签管理
- 任务筛选和排序
- 任务进度更新

### 4.2 树木生命状态系统

- 位置: `client/src/services/treeHealthService.ts` 和 `server/src/services/treeHealthService.ts`
- 相关组件: `TreeHealthPanel`, `TreeHealthSimulator`
- API端点: `/api/trees/:id/health`, `/api/tasks/:id/tree-health`

**主要功能**:
- 树木健康状态计算
- 健康状态可视化
- 任务进度与树木健康联动
- 健康状态预测

### 4.3 3D森林可视化

- 位置: `client/src/three/`
- 主要组件: `ForestScene`, `TreeModel`

**主要功能**:
- 3D森林场景渲染
- 树木模型加载和管理
- 树木健康状态视觉表现
- 交互控制(旋转、缩放、点选)

## 5. 开发流程

### 5.1 Git工作流

1. 从`develop`分支创建功能分支: `feature/your-feature-name`
2. 开发完成后提交Pull Request到`develop`分支
3. 代码审查通过后合并到`develop`

### 5.2 代码风格

- 使用ESLint和Prettier进行代码格式化
- 遵循TypeScript类型安全实践
- 组件使用函数式组件和React Hooks
- 使用CSS Modules进行样式隔离

### 5.3 测试

- 单元测试: Jest
- 组件测试: React Testing Library
- API测试: Supertest
- 运行测试: `pnpm test`

## 6. 快速上手案例

### 6.1 创建新组件

1. 在`client/src/components`下创建组件目录:

```tsx
// TaskProgress.tsx
import React from 'react';
import { Progress } from 'antd';
import styles from './TaskProgress.module.css';

interface TaskProgressProps {
  value: number;
  showInfo?: boolean;
}

const TaskProgress: React.FC<TaskProgressProps> = ({ 
  value, 
  showInfo = true 
}) => {
  return (
    <div className={styles.progressWrapper}>
      <Progress 
        percent={value} 
        showInfo={showInfo}
        status={value === 100 ? 'success' : 'active'} 
      />
    </div>
  );
};

export default TaskProgress;
```

2. 创建样式文件:

```css
/* TaskProgress.module.css */
.progressWrapper {
  margin: 12px 0;
}
```

3. 在现有组件中使用:

```tsx
import TaskProgress from '../components/TaskProgress';

// 在组件内使用
<TaskProgress value={task.progress || 0} />
```

### 6.2 调用API服务

```tsx
// 在组件中调用API服务
import { useState, useEffect } from 'react';
import * as taskService from '../services/taskService';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks();
      if (response && response.data) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 组件内容...
}
```

### 6.3 更新树木健康状态

```tsx
// 在组件中更新任务进度和树木健康状态
import { updateTaskProgress } from '../services/treeHealthService';

const handleProgressUpdate = async (taskId, progress) => {
  try {
    const result = await updateTaskProgress(taskId, progress);
    // 更新UI显示
  } catch (error) {
    console.error('更新进度失败:', error);
  }
};
```

## 7. 常见问题与解决方案

### 7.1 3D渲染相关

**问题**: 3D场景加载缓慢或性能问题
**解决**: 
- 检查是否启用了实例化渲染
- 减少场景中的树木数量
- 启用LOD (Level of Detail)系统

### 7.2 API交互问题

**问题**: API请求失败或返回错误
**解决**:
- 检查API URL路径是否正确
- 验证请求参数格式
- 查看服务器日志查找后端错误
- 确认API拦截器处理逻辑

### 7.3 树木健康状态问题

**问题**: 树木健康状态计算不符合预期
**解决**:
- 检查任务截止日期和进度数据是否正确
- 验证健康状态计算公式实现
- 确认前后端计算逻辑一致性

## 8. 相关文档

- [系统概要设计文档](../architecture/system_design.md)
- [树木健康状态系统详细设计](../modules/tree_health_system.md)
- [API参考文档](../api/api_reference.md)
- [开发规范文档](../development/standards.md)

## 9. 贡献指南

1. 确保您的代码符合项目的代码风格和规范
2. 提交前运行测试确保没有破坏现有功能
3. 提交信息遵循约定式提交规范
4. 提交PR前请先同步最新的develop分支

---

如有任何问题，请联系项目负责人或查阅详细文档。 