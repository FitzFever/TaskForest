# TaskForest系统概要设计文档

## 1. 系统架构设计

### 1.1 整体架构

TaskForest采用前后端分离架构，主要由以下几部分组成：

- **前端应用层**：基于React+TypeScript构建的用户界面
- **后端服务层**：基于Node.js+Express构建的RESTful API服务
- **数据持久层**：使用SQLite数据库存储任务和树木数据
- **3D渲染引擎**：使用Three.js实现森林可视化

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  前端应用层     │<────>│  后端服务层     │<────>│  数据持久层     │
│  React+TS       │      │  Node+Express   │      │  SQLite         │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        ∧                        ∧
        │                        │
        v                        v
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│  3D渲染引擎     │      │  AI服务接口     │
│  Three.js       │      │  (可选模块)     │
│                 │      │                 │
└─────────────────┘      └─────────────────┘
```

### 1.2 技术栈选择

| 层级 | 技术选择 | 说明 |
|------|---------|------|
| 前端框架 | React+TypeScript | 提供类型安全和组件化开发 |
| 状态管理 | Zustand | 轻量级状态管理方案 |
| UI组件库 | Ant Design | 成熟的企业级组件库 |
| 3D渲染 | Three.js+React Three Fiber | 提供3D森林渲染能力 |
| 后端框架 | Node.js+Express | 高效的RESTful API服务 |
| ORM工具 | Prisma | 类型安全的数据库访问 |
| 数据库 | SQLite | 轻量级嵌入式数据库 |
| 构建工具 | Vite | 快速的前端构建工具 |

## 2. 核心模块设计

### 2.1 任务管理模块

#### 2.1.1 数据模型

```typescript
// 任务数据模型
interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  progress?: number;  // 任务进度(0-100)
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  treeType?: TreeType;
  categoryId?: number;
  treeId?: number;
}

// 任务类型枚举
enum TaskType {
  NORMAL = 'NORMAL',       // 普通日常任务
  RECURRING = 'RECURRING', // 定期重复任务
  PROJECT = 'PROJECT',     // 长期项目任务
  LEARNING = 'LEARNING',   // 学习类任务
  WORK = 'WORK',           // 工作类任务
  LEISURE = 'LEISURE'      // 休闲类任务
}

// 树木类型枚举
enum TreeType {
  OAK = 'OAK',         // 橡树
  PINE = 'PINE',       // 松树
  WILLOW = 'WILLOW',   // 柳树
  APPLE = 'APPLE',     // 苹果树
  MAPLE = 'MAPLE',     // 枫树
  PALM = 'PALM',       // 棕榈树
  CHERRY = 'CHERRY'    // 樱花树
}
```

#### 2.1.2 任务类型与树木类型映射机制

TaskForest实现了任务类型与树木类型的自动映射关系，使不同类型的任务能够对应到特定的树木类型：

| 任务类型    | 树木类型 | 说明           |
|------------|----------|----------------|
| NORMAL     | OAK      | 普通日常任务 -> 橡树 |
| RECURRING  | PINE     | 定期重复任务 -> 松树 |
| PROJECT    | WILLOW   | 长期项目任务 -> 柳树 |
| LEARNING   | APPLE    | 学习类任务 -> 苹果树 |
| WORK       | MAPLE    | 工作类任务 -> 枫树   |
| LEISURE    | PALM     | 休闲类任务 -> 棕榈树 |

映射实现方式：

```typescript
// 任务类型与树木类型映射关系常量
const TASK_TYPE_TO_TREE_TYPE_MAPPING: Record<TaskType, TreeType> = {
  'NORMAL': 'OAK',      // 普通日常任务 -> 橡树
  'RECURRING': 'PINE',  // 定期重复任务 -> 松树
  'PROJECT': 'WILLOW',  // 长期项目任务 -> 柳树
  'LEARNING': 'APPLE',  // 学习类任务 -> 苹果树
  'WORK': 'MAPLE',      // 工作类任务 -> 枫树
  'LEISURE': 'PALM',    // 休闲类任务 -> 棕榈树
};

// 根据任务类型获取默认的树木类型
function getDefaultTreeTypeForTask(taskType: TaskType): TreeType {
  return TASK_TYPE_TO_TREE_TYPE_MAPPING[taskType] || 'OAK';
}
```

在创建任务时，系统会根据任务类型自动选择对应的树木类型，用户也可以手动指定树木类型覆盖默认映射。

#### 2.1.3 核心API设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/tasks` | GET | 获取任务列表 |
| `/api/tasks/:id` | GET | 获取任务详情 |
| `/api/tasks` | POST | 创建新任务 |
| `/api/tasks/:id` | PUT | 更新任务 |
| `/api/tasks/:id` | DELETE | 删除任务 |
| `/api/tasks/:id/progress` | PUT | 更新任务进度 |
| `/api/tasks/:id/tree-health` | GET | 获取任务关联的树木健康状态 |

#### 2.1.4 组件设计

- **TaskList**: 任务列表组件
- **TaskDetail**: 任务详情组件
- **TaskForm**: 任务创建/编辑组件
- **TaskFilter**: 任务筛选组件
- **TaskStats**: 任务统计组件

### 2.2 树木生命状态系统

#### 2.2.1 数据模型

```typescript
// 树木数据模型
interface Tree {
  id: number;
  type: TreeType;
  growthStage: number;
  positionX: number;
  positionY?: number;
  positionZ: number;
  rotationY?: number;
  healthState: number;  // 健康状态(0-100)
  createdAt: string;
  updatedAt?: string;
  taskId?: number;
}

// 健康状态类别
enum HealthCategory {
  HEALTHY,         // 健康 (75-100)
  SLIGHTLY_WILTED, // 轻微枯萎 (50-75)
  MODERATELY_WILTED, // 中度枯萎 (25-50)
  SEVERELY_WILTED, // 严重枯萎 (0-25)
}
```

#### 2.2.2 核心API设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/trees` | GET | 获取树木列表 |
| `/api/trees/:id` | GET | 获取树木详情 |
| `/api/trees` | POST | 创建新树木 |
| `/api/trees/:id/health` | GET | 获取树木健康状态 |
| `/api/trees/:id/health` | PUT | 更新树木健康状态 |
| `/api/trees/health/batch-update` | POST | 批量更新树木健康状态 |

#### 2.2.3 健康状态计算逻辑

树木健康状态计算基于以下因素：
1. **时间因素**：距离DDL的剩余时间比例
2. **进度因素**：任务实际进度与预期进度的差异
3. **历史因素**：任务进度更新频率及规律性

```
健康值计算公式:
基础健康值 = 100 * (剩余时间 / 总时间)

进度调整:
- 如果进度超前: 健康值 += (实际进度 - 预期进度) / 2
- 如果进度落后: 健康值 -= (预期进度 - 实际进度) / 2

健康状态分类:
- 健康(HEALTHY): 75-100
- 轻微枯萎(SLIGHTLY_WILTED): 50-75
- 中度枯萎(MODERATELY_WILTED): 25-50
- 严重枯萎(SEVERELY_WILTED): 0-25
```

#### 2.2.4 组件设计

- **TreeHealthPanel**: 树木健康状态展示面板
- **TreeHealthSimulator**: 树木健康状态模拟器
- **TreeHealthIndicator**: 树木健康状态指示器
- **TreeGrowthAnimation**: 树木生长动画组件

### 2.3 3D森林可视化模块

#### 2.3.1 场景设计

- **场景组成**：地面、天空、树木、装饰物
- **交互方式**：旋转、缩放、平移、点选树木
- **性能优化**：LOD系统、实例化渲染、视锥剔除

#### 2.3.2 树木表现

树木外观根据以下因素变化：
1. **树木类型**：不同任务类型对应不同树种
2. **生长阶段**：0-4阶段，对应种子到成熟树木
3. **健康状态**：影响树叶颜色和茂密程度
4. **季节变化**：根据当前季节调整外观

#### 2.3.3 组件设计

- **ForestScene**: 森林场景组件
- **TreeModel**: 树木模型组件
- **TreeAnimation**: 树木动画组件
- **Environment**: 环境效果组件(光照、天空等)

## 3. 数据流设计

### 3.1 前端状态管理

使用Zustand实现状态管理，主要Store设计如下：

```typescript
// 任务Store
interface TaskStore {
  tasks: Task[];
  loading: boolean;
  currentTask: Task | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: string, task: UpdateTaskRequest) => Promise<void>;
  updateTaskProgress: (id: string, progress: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

// 树木Store
interface TreeStore {
  trees: Tree[];
  selectedTree: Tree | null;
  loading: boolean;
  fetchTrees: () => Promise<void>;
  getTreeHealth: (treeId: string) => Promise<TreeHealthDetails>;
  updateTreeHealth: (treeId: string, health: number) => Promise<void>;
  selectTree: (treeId: string | null) => void;
}
```

### 3.2 核心数据流程

#### 3.2.1 任务创建到树木生成流程

```
用户创建任务 -> 前端提交任务数据 -> 后端创建任务记录
  -> 后端创建关联树木 -> 计算初始健康状态 -> 返回任务和树木数据
  -> 前端更新状态 -> 渲染新树木到森林场景
```

#### 3.2.2 任务进度更新流程

```
用户更新任务进度 -> 前端提交进度数据 -> 后端更新任务进度
  -> 重新计算树木健康状态 -> 更新树木记录 -> 返回更新结果
  -> 前端更新树木外观 -> 显示健康状态变化动画
```

#### 3.2.3 树木健康状态定期更新

```
后端定时任务触发 -> 获取所有未完成任务 -> 计算当前健康状态
  -> 更新树木健康记录 -> 前端轮询或WebSocket推送
  -> 更新树木外观 -> 必要时发送通知
```

## 4. 用户界面设计

### 4.1 核心页面布局

```
┌─────────────────────────────────────────────┐
│ 导航栏 [任务 | 森林 | 统计 | 设置]          │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────┐        ┌─────────────┐      │
│ │             │        │             │      │
│ │  任务面板   │        │  详情面板   │      │
│ │             │        │             │      │
│ │             │        │             │      │
│ └─────────────┘        └─────────────┘      │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │              3D森林场景                 │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2 关键组件交互

#### 4.2.1 任务详情与树木健康状态交互

任务详情组件和树木健康状态组件通过以下方式进行交互：

1. 用户打开任务详情，同时加载关联树木ID
2. 使用树木ID或任务ID加载健康状态
3. 显示树木当前健康状态和预测数据
4. 提供进度更新控件
5. 进度更新后，刷新健康状态数据

#### 4.2.2 森林场景交互

森林场景组件提供以下交互功能：

1. 360°自由视角调整（旋转、缩放、平移）
2. 点击树木显示关联任务信息
3. 时间筛选器切换不同时期森林状态
4. 类别筛选器展示特定类型的树木
5. 健康状态指示器显示树木生命状态

## 5. 安全设计

### 5.1 前端安全

- 所有API请求应验证数据类型和边界
- 使用HTTPOnly Cookie存储认证信息
- 防止XSS攻击的输入过滤和转义
- 防止CSRF攻击的令牌机制
- 敏感操作二次确认机制

### 5.2 后端安全

- 输入验证和净化
- 参数化SQL查询防止注入
- 请求速率限制
- 日志记录和审计
- 数据备份和恢复机制

## 6. 扩展性设计

### 6.1 模块化设计

系统采用模块化设计，核心功能独立封装，便于扩展：

- 任务管理核心与UI表现分离
- 树木健康计算逻辑独立封装
- 3D渲染系统与业务逻辑解耦
- 主题和样式系统可插拔

### 6.2 未来扩展点

1. **社交功能**：好友森林参观、任务协作
2. **云同步**：多设备数据同步
3. **更多游戏化元素**：成就、徽章系统扩展
4. **VR/AR支持**：沉浸式森林体验
5. **高级数据分析**：任务模式识别和建议系统

## 7. 实现里程碑

### 7.1 第一阶段：基础功能实现

- 基础任务CRUD功能
- 简单树木生成和显示
- 基本3D森林场景
- 任务与树木关联逻辑

### 7.2 第二阶段：核心系统完善

- 树木健康状态计算系统
- 任务进度更新机制
- 树木生长动画效果
- 健康状态可视化

### 7.3 第三阶段：用户体验优化

- 丰富树木类型和视觉效果
- 任务统计和分析功能
- 森林场景交互优化
- 主题和季节变化效果

### 7.4 第四阶段：高级功能

- AI任务拆解辅助
- 成就和徽章系统
- 社交和分享功能
- 跨平台适配优化

## 8. 关键技术难点及解决方案

### 8.1 树木健康状态实时计算

**难点**：需要考虑多种因素，保持计算逻辑与视觉表现一致性。

**解决方案**：
- 采用时间比例和进度比例的加权计算方式
- 服务端定时任务批量更新健康状态
- 客户端轮询或WebSocket实时更新
- 缓存中间计算结果提高性能

### 8.2 3D森林渲染性能

**难点**：大量树木同时渲染可能导致性能问题。

**解决方案**：
- 实现实例化渲染(Instanced Rendering)
- 距离视点远的树木使用低精度模型(LOD)
- 视锥剔除(Frustum Culling)优化
- 使用对象池管理树木实例
- 延迟加载非视野内树木

### 8.3 任务进度与DDL评估

**难点**：准确评估任务进度与截止日期关系。

**解决方案**：
- 历史任务数据学习用户完成模式
- 提供进度预测和警告机制
- 允许用户手动调整进度期望
- 结合任务类型细分计算方法

## 9. 系统限制及约束

1. **最大树木数量**：单一森林场景最多支持1000棵树木
2. **最大任务数量**：单用户最多支持10000条任务记录
3. **3D场景硬件要求**：WebGL 2.0支持，至少2GB显存
4. **离线使用限制**：离线时仅支持有限功能，需定期同步
5. **浏览器兼容性**：支持Chrome 80+、Firefox 75+、Safari 14+

## 10. 参考文档

1. TaskForest产品说明文档
2. TaskForest开发规范文档
3. Three.js官方文档
4. React Three Fiber文档
5. Ant Design组件库文档
6. TaskForest API参考文档

## 11. 文档修订历史

| 版本 | 日期 | 修订内容 | 修订人 |
|------|------|---------|-------|
| v0.1 | 2024-04-09 | 初稿 | 系统架构师 |
| v0.2 | 2024-04-10 | 增加树木健康状态系统详细设计 | 系统架构师 | 