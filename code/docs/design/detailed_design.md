# TaskForest 详细设计文档

## 1. 数据模型设计

### 1.1 任务模型 (Task)
```typescript
interface Task {
  id: string;            // 任务唯一标识
  title: string;         // 任务标题
  description: string;   // 任务描述
  type: TaskType;        // 任务类型
  status: TaskStatus;    // 任务状态
  priority: Priority;    // 优先级
  dueDate: Date;        // 截止日期
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
  completedAt?: Date;   // 完成时间
  parentId?: string;    // 父任务ID
  tags: string[];       // 标签
  treeType: TreeType;   // 对应的树木类型
  growthStage: number;  // 生长阶段 (0-4)
}

enum TaskType {
  NORMAL = 'NORMAL',       // 普通任务
  RECURRING = 'RECURRING', // 重复任务
  PROJECT = 'PROJECT',     // 项目任务
  LEARNING = 'LEARNING',   // 学习任务
  WORK = 'WORK',          // 工作任务
  LEISURE = 'LEISURE'      // 休闲任务
}

enum TaskStatus {
  TODO = 'TODO',           // 待办
  IN_PROGRESS = 'IN_PROGRESS', // 进行中
  COMPLETED = 'COMPLETED',     // 已完成
  CANCELLED = 'CANCELLED'      // 已取消
}
```

### 1.2 树木模型 (Tree)
```typescript
interface Tree {
  id: string;            // 树木唯一标识
  taskId: string;        // 关联任务ID
  type: TreeType;        // 树木类型
  stage: number;         // 生长阶段
  position: Vector3;     // 位置坐标
  rotation: Vector3;     // 旋转角度
  scale: Vector3;        // 缩放比例
  createdAt: Date;      // 创建时间
  lastGrowth: Date;     // 最后生长时间
}

enum TreeType {
  OAK = 'OAK',           // 橡树 (普通任务)
  PINE = 'PINE',         // 松树 (重复任务)
  CHERRY = 'CHERRY',     // 樱花树 (重要任务)
  PALM = 'PALM',         // 棕榈树 (休闲任务)
  APPLE = 'APPLE',       // 苹果树 (学习任务)
  MAPLE = 'MAPLE',       // 枫树 (工作任务)
  WILLOW = 'WILLOW'      // 柳树 (项目任务)
}
```

## 2. 模块详细设计

### 2.1 任务管理模块

#### 2.1.1 任务服务 (TaskService)
```typescript
class TaskService {
  // 创建任务
  async createTask(taskData: CreateTaskDTO): Promise<Task>;
  
  // 更新任务
  async updateTask(id: string, taskData: UpdateTaskDTO): Promise<Task>;
  
  // 删除任务
  async deleteTask(id: string): Promise<void>;
  
  // 完成任务
  async completeTask(id: string): Promise<Task>;
  
  // 获取任务列表
  async getTasks(filters: TaskFilters): Promise<Task[]>;
  
  // 获取任务详情
  async getTaskById(id: string): Promise<Task>;
  
  // 更新任务进度
  async updateTaskProgress(id: string, progress: number): Promise<Task>;
}
```

#### 2.1.2 任务状态管理 (TaskStore)
```typescript
interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  loading: boolean;
  error: Error | null;
}

const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTask: null,
  filters: defaultFilters,
  loading: false,
  error: null,
  
  // Actions
  setTasks: (tasks: Task[]) => set({ tasks }),
  addTask: (task: Task) => set(state => ({ 
    tasks: [...state.tasks, task] 
  })),
  updateTask: (task: Task) => set(state => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t)
  })),
  // ... 其他操作
}));
```

### 2.2 3D 渲染模块

#### 2.2.1 场景管理器 (SceneManager)
```typescript
class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  
  // 初始化场景
  initialize(container: HTMLElement): void;
  
  // 添加树木到场景
  addTree(tree: Tree, model: THREE.Object3D): void;
  
  // 更新树木状态
  updateTree(tree: Tree): void;
  
  // 移除树木
  removeTree(treeId: string): void;
  
  // 更新场景
  update(): void;
  
  // 调整相机视角
  adjustCamera(target: Vector3): void;
  
  // 处理窗口大小变化
  handleResize(): void;
}
```

#### 2.2.2 模型加载器 (ModelLoader)
```typescript
class ModelLoader {
  private cache: Map<string, THREE.Object3D>;
  private loader: GLTFLoader;
  
  // 加载模型
  async loadModel(type: TreeType, stage: number): Promise<THREE.Object3D>;
  
  // 预加载模型
  async preloadModels(types: TreeType[]): Promise<void>;
  
  // 获取已缓存的模型
  getCachedModel(type: TreeType, stage: number): THREE.Object3D | null;
  
  // 清理缓存
  clearCache(): void;
}
```

### 2.3 数据管理模块

#### 2.3.1 数据库服务 (DatabaseService)
```typescript
class DatabaseService {
  private db: Database;
  
  // 初始化数据库
  async initialize(): Promise<void>;
  
  // 执行数据库迁移
  async migrate(): Promise<void>;
  
  // 备份数据库
  async backup(path: string): Promise<void>;
  
  // 恢复数据库
  async restore(path: string): Promise<void>;
  
  // 执行事务
  async transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
}
```

#### 2.3.2 数据同步管理器 (SyncManager)
```typescript
class SyncManager {
  // 执行数据同步
  async sync(): Promise<void>;
  
  // 检查更新
  async checkUpdates(): Promise<boolean>;
  
  // 解决冲突
  async resolveConflicts(conflicts: Conflict[]): Promise<void>;
  
  // 获取同步状态
  getSyncStatus(): SyncStatus;
}
```

### 2.4 AI 助手模块

#### 2.4.1 AI 服务 (AIService)
```typescript
class AIService {
  private openai: OpenAI;
  
  // 分析任务
  async analyzeTask(task: Task): Promise<TaskAnalysis>;
  
  // 拆解任务
  async breakdownTask(task: Task): Promise<Task[]>;
  
  // 生成任务建议
  async generateSuggestions(context: TaskContext): Promise<Suggestion[]>;
  
  // 优化任务描述
  async optimizeDescription(description: string): Promise<string>;
}
```

#### 2.4.2 上下文管理器 (ContextManager)
```typescript
class ContextManager {
  private context: Map<string, TaskContext>;
  
  // 更新任务上下文
  updateContext(taskId: string, context: TaskContext): void;
  
  // 获取任务上下文
  getContext(taskId: string): TaskContext;
  
  // 清理过期上下文
  cleanupContext(): void;
}
```

## 3. 接口设计

### 3.1 主进程 API
```typescript
interface MainAPI {
  // 应用生命周期
  quit(): void;
  minimize(): void;
  maximize(): void;
  
  // 文件操作
  exportData(path: string): Promise<void>;
  importData(path: string): Promise<void>;
  
  // 系统集成
  showNotification(options: NotificationOptions): void;
  setAutoLaunch(enable: boolean): Promise<void>;
}
```

### 3.2 渲染进程 API
```typescript
interface RendererAPI {
  // 任务操作
  createTask(task: CreateTaskDTO): Promise<Task>;
  updateTask(id: string, task: UpdateTaskDTO): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // 3D 场景操作
  addTree(tree: Tree): Promise<void>;
  updateTree(tree: Tree): Promise<void>;
  removeTree(id: string): Promise<void>;
  
  // 数据同步
  sync(): Promise<void>;
  backup(): Promise<void>;
  restore(): Promise<void>;
}
```

## 4. 组件设计

### 4.1 任务相关组件
```typescript
// 任务列表组件
const TaskList: FC<TaskListProps> = () => {
  // 实现...
};

// 任务详情组件
const TaskDetail: FC<TaskDetailProps> = () => {
  // 实现...
};

// 任务创建/编辑表单
const TaskForm: FC<TaskFormProps> = () => {
  // 实现...
};
```

### 4.2 3D 场景组件
```typescript
// 森林场景组件
const ForestScene: FC<ForestSceneProps> = () => {
  // 实现...
};

// 树木组件
const Tree: FC<TreeProps> = () => {
  // 实现...
};

// 场景控制组件
const SceneControls: FC<SceneControlsProps> = () => {
  // 实现...
};
```

## 5. 工具类设计

### 5.1 工具函数
```typescript
// 日期处理
const dateUtils = {
  formatDate: (date: Date): string => {},
  isOverdue: (date: Date): boolean => {},
  getDaysDiff: (date1: Date, date2: Date): number => {},
};

// 树木位置计算
const treeUtils = {
  calculatePosition: (index: number): Vector3 => {},
  calculateRotation: (type: TreeType): Vector3 => {},
  getGrowthScale: (stage: number): Vector3 => {},
};

// 数据验证
const validationUtils = {
  validateTask: (task: Task): ValidationResult => {},
  validateTree: (tree: Tree): ValidationResult => {},
};
```

### 5.2 常量定义
```typescript
const CONSTANTS = {
  // 树木相关
  TREE_TYPES: Object.values(TreeType),
  GROWTH_STAGES: 5,
  MIN_TREE_DISTANCE: 2,
  
  // 任务相关
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  
  // 3D 场景相关
  CAMERA_SETTINGS: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
  },
  
  // AI 相关
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
};
```

## 6. 错误处理

### 6.1 错误类型
```typescript
class TaskForestError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: any
  ) {
    super(message);
  }
}

enum ErrorCode {
  // 任务相关错误
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  INVALID_TASK_DATA = 'INVALID_TASK_DATA',
  
  // 3D 相关错误
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  RENDER_ERROR = 'RENDER_ERROR',
  
  // 数据相关错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  SYNC_FAILED = 'SYNC_FAILED',
  
  // AI 相关错误
  AI_REQUEST_FAILED = 'AI_REQUEST_FAILED',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
}
```

### 6.2 错误处理器
```typescript
class ErrorHandler {
  // 处理应用错误
  static handleError(error: TaskForestError): void {
    // 实现错误处理逻辑
  }
  
  // 处理异步错误
  static handleAsyncError(error: TaskForestError): Promise<void> {
    // 实现异步错误处理逻辑
  }
}
```

## 7. 测试规范

### 7.1 单元测试
```typescript
// 任务服务测试
describe('TaskService', () => {
  it('should create task', async () => {
    // 测试实现
  });
  
  it('should update task', async () => {
    // 测试实现
  });
});

// 3D 渲染测试
describe('SceneManager', () => {
  it('should initialize scene', () => {
    // 测试实现
  });
  
  it('should add tree to scene', () => {
    // 测试实现
  });
});
```

### 7.2 集成测试
```typescript
describe('TaskForest Integration', () => {
  it('should complete task flow', async () => {
    // 测试实现
  });
  
  it('should sync data', async () => {
    // 测试实现
  });
});
``` 