# 树木健康状态系统实施指南

本文档为TaskForest项目中树木健康状态系统的实施指南，帮助开发者了解如何实现和集成这个核心功能。

## 1. 系统概述

树木健康状态系统是TaskForest的关键游戏化机制，将任务进度与截止日期转化为树木的视觉健康状态，为用户提供直观的任务管理反馈。

## 2. 实现步骤

### 2.1 数据模型扩展

首先，在Tree模型中添加健康状态相关字段：

```typescript
// 在Tree模型中添加的字段
interface TreeHealthFields {
  healthState: number;              // 健康状态值(0-100)
  lastHealthUpdate: Date;           // 最后健康状态更新时间
  healthDetails?: string;           // 健康状态详细信息(JSON字符串)
}
```

Prisma模型示例：

```prisma
model Tree {
  // 现有字段
  id           Int      @id @default(autoincrement())
  type         String
  growthStage  Int      @default(0)
  positionX    Float
  positionY    Float?
  positionZ    Float
  rotationY    Float?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  taskId       Int?
  task         Task?    @relation(fields: [taskId], references: [id])
  
  // 健康状态相关字段
  healthState       Float    @default(100)
  lastHealthUpdate  DateTime @default(now())
  healthDetails     String?
}
```

### 2.2 服务层实现

#### 2.2.1 创建TreeHealthService

创建`server/src/services/treeHealthService.ts`文件：

```typescript
import { PrismaClient } from '@prisma/client';
import { Task, Tree } from '../types';

// 健康状态类别枚举
export enum HealthCategory {
  HEALTHY = 'HEALTHY',         // 健康 (75-100)
  SLIGHTLY_WILTED = 'SLIGHTLY_WILTED', // 轻微枯萎 (50-75)
  MODERATELY_WILTED = 'MODERATELY_WILTED', // 中度枯萎 (25-50)
  SEVERELY_WILTED = 'SEVERELY_WILTED', // 严重枯萎 (0-25)
}

// 健康状态趋势枚举
export enum HealthTrend {
  IMPROVING = 'IMPROVING',     // 改善中
  STABLE = 'STABLE',          // 稳定
  DECLINING = 'DECLINING',     // 恶化中
  CRITICAL = 'CRITICAL',       // 严重恶化
}

const prisma = new PrismaClient();

class TreeHealthService {
  /**
   * 获取树木健康状态
   */
  async getTreeHealth(treeId: number) {
    // 实现获取树木健康状态
  }
  
  /**
   * 更新树木健康状态
   */
  async updateTreeHealth(treeId: number, healthState: number) {
    // 实现更新树木健康状态
  }
  
  /**
   * 获取任务关联的树木健康状态
   */
  async getTaskTreeHealth(taskId: number) {
    // 实现获取任务关联的树木健康状态
  }
  
  /**
   * 更新任务进度并影响树木健康状态
   */
  async updateTaskProgress(taskId: number, progress: number) {
    // 实现更新任务进度并影响树木健康状态
  }
  
  /**
   * 批量更新所有树木健康状态
   */
  async batchUpdateTreesHealth() {
    // 实现批量更新逻辑
  }
  
  /**
   * 计算树木健康状态
   */
  private calculateTreeHealth(task: Task, currentHealth?: number) {
    // 实现健康状态计算算法
  }
  
  /**
   * 计算健康状态趋势
   */
  private calculateHealthTrend(currentHealth: number, task: Task) {
    // 实现健康状态趋势计算
  }
}

export default new TreeHealthService();
```

### 2.3 控制器实现

创建`server/src/controllers/treeHealthController.ts`文件：

```typescript
import { Request, Response } from 'express';
import treeHealthService from '../services/treeHealthService';

class TreeHealthController {
  /**
   * 获取树木健康状态
   */
  async getTreeHealth(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const treeHealth = await treeHealthService.getTreeHealth(Number(id));
      return res.json({
        code: 200,
        data: treeHealth,
        message: 'success'
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }
  
  /**
   * 更新树木健康状态
   */
  async updateTreeHealth(req: Request, res: Response) {
    // 实现控制器方法
  }
  
  /**
   * 获取任务关联的树木健康状态
   */
  async getTaskTreeHealth(req: Request, res: Response) {
    // 实现控制器方法
  }
  
  /**
   * 更新任务进度
   */
  async updateTaskProgress(req: Request, res: Response) {
    // 实现控制器方法
  }
  
  /**
   * 批量更新树木健康状态
   */
  async batchUpdateTreesHealth(req: Request, res: Response) {
    // 实现控制器方法
  }
}

export default new TreeHealthController();
```

### 2.4 路由配置

更新`server/src/routes/treeRoutes.ts`文件：

```typescript
import { Router } from 'express';
import treeController from '../controllers/treeController';
import treeHealthController from '../controllers/treeHealthController';

const router = Router();

// 现有树木路由
router.get('/', treeController.getAllTrees);
router.get('/:id', treeController.getTreeById);
router.post('/', treeController.createTree);
router.put('/:id', treeController.updateTree);
router.delete('/:id', treeController.deleteTree);

// 健康状态相关路由
router.get('/:id/health', treeHealthController.getTreeHealth);
router.put('/:id/health', treeHealthController.updateTreeHealth);
router.post('/health/batch-update', treeHealthController.batchUpdateTreesHealth);

export default router;
```

更新`server/src/routes/taskRoutes.ts`文件：

```typescript
import { Router } from 'express';
import taskController from '../controllers/taskController';
import treeHealthController from '../controllers/treeHealthController';

const router = Router();

// 现有任务路由
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
// ...其他任务路由

// 健康状态相关路由
router.get('/:id/tree-health', treeHealthController.getTaskTreeHealth);
router.put('/:id/progress', treeHealthController.updateTaskProgress);

export default router;
```

### 2.5 前端服务实现

创建`client/src/services/treeHealthService.ts`文件：

```typescript
import api from './api';

// 健康状态类别枚举
export enum HealthCategory {
  HEALTHY = 'HEALTHY',
  SLIGHTLY_WILTED = 'SLIGHTLY_WILTED',
  MODERATELY_WILTED = 'MODERATELY_WILTED',
  SEVERELY_WILTED = 'SEVERELY_WILTED',
}

// 健康状态趋势枚举
export enum HealthTrend {
  IMPROVING = 'IMPROVING',
  STABLE = 'STABLE',
  DECLINING = 'DECLINING',
  CRITICAL = 'CRITICAL',
}

// 定义接口
export interface TreeHealthDetails {
  // 接口定义
}

export interface HealthPrediction {
  // 接口定义
}

export interface TaskTreeHealth {
  // 接口定义
}

// API服务实现
export const getTreeHealth = async (treeId: string): Promise<TreeHealthDetails> => {
  // 实现API调用
};

export const updateTreeHealth = async (
  treeId: string,
  healthState: number,
  notes?: string
): Promise<TreeHealthDetails> => {
  // 实现API调用
};

export const getTaskTreeHealth = async (taskId: string): Promise<TaskTreeHealth> => {
  // 实现API调用
};

export const updateTaskProgress = async (
  taskId: string,
  progress: number,
  notes?: string
): Promise<TaskProgressUpdateResponse> => {
  // 实现API调用
};

export const batchUpdateTreesHealth = async (): Promise<{ message: string }> => {
  // 实现API调用
};
```

### 2.6 前端组件实现

#### 2.6.1 创建TreeHealthPanel组件

创建`client/src/components/TreeHealthPanel.tsx`文件：

```tsx
import React, { useEffect, useState } from 'react';
import { Card, Progress, Tag, Tooltip, Statistic, Divider, Alert, Button } from 'antd';
import { 
  HeartOutlined, 
  ClockCircleOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons';
import { TreeHealthDetails, TaskTreeHealth, HealthCategory } from '../services/treeHealthService';
import * as treeHealthService from '../services/treeHealthService';

interface TreeHealthPanelProps {
  treeId?: string;
  taskId?: string;
  onProgressUpdate?: (taskId: string, progress: number) => void;
}

const TreeHealthPanel: React.FC<TreeHealthPanelProps> = ({ treeId, taskId, onProgressUpdate }) => {
  // 实现组件逻辑
  return (
    <Card>
      {/* 实现组件UI */}
    </Card>
  );
};

export default TreeHealthPanel;
```

#### 2.6.2 创建TreeHealthIndicator组件

创建`client/src/components/TreeHealthIndicator.tsx`文件：

```tsx
import React from 'react';
import { HealthCategory } from '../services/treeHealthService';

interface TreeHealthIndicatorProps {
  healthState: number;
  healthCategory: HealthCategory;
  size?: 'small' | 'default' | 'large';
}

const TreeHealthIndicator: React.FC<TreeHealthIndicatorProps> = ({ 
  healthState, 
  healthCategory,
  size = 'default'
}) => {
  // 实现组件逻辑
  return (
    <div>
      {/* 实现组件UI */}
    </div>
  );
};

export default TreeHealthIndicator;
```

### 2.7 3D渲染集成

更新`client/src/three/ForestScene.tsx`文件，添加健康状态渲染支持：

```tsx
// 在现有ForestScene组件中添加健康状态渲染支持

// 添加参数到TreeData接口
export interface TreeData {
  id: number | string;
  type: TreeType;
  growthStage: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  healthState?: number; // 健康状态值
}

// 在渲染树木时考虑健康状态
const renderTree = (tree: TreeData) => {
  // ...现有代码
  
  // 根据健康状态调整树木外观
  if (tree.healthState !== undefined) {
    const appearance = getTreeAppearance(tree.healthState);
    applyTreeAppearance(treeObj, appearance);
  }
  
  // ...现有代码
};

// 添加健康状态外观计算函数
const getTreeAppearance = (healthState: number) => {
  // 根据健康状态返回树木外观参数
};

// 添加外观应用函数
const applyTreeAppearance = (treeObj: any, appearance: any) => {
  // 应用外观参数到树木对象
};
```

### 2.8 定时更新任务设置

在`server/src/server.ts`文件中添加定时任务：

```typescript
import cron from 'node-cron';
import treeHealthService from './services/treeHealthService';

// ...现有代码

// 设置每天凌晨2点执行健康状态更新
cron.schedule('0 2 * * *', async () => {
  console.log('执行树木健康状态批量更新...');
  try {
    const result = await treeHealthService.batchUpdateTreesHealth();
    console.log('更新完成:', result);
  } catch (error) {
    console.error('更新失败:', error);
  }
});
```

## 3. 测试策略

### 3.1 单元测试

为TreeHealthService创建单元测试：

```typescript
// tests/services/treeHealthService.test.ts
import treeHealthService from '../../src/services/treeHealthService';
import { mockTask, mockTree } from '../mocks';

describe('TreeHealthService', () => {
  test('calculateTreeHealth 应正确计算健康任务', () => {
    // 测试用例实现
  });
  
  test('calculateTreeHealth 应正确处理超期任务', () => {
    // 测试用例实现
  });
  
  // 其他测试...
});
```

### 3.2 集成测试

```typescript
// tests/integration/treeHealth.test.ts
import request from 'supertest';
import app from '../../src/app';
import { setupTestDb, clearTestDb } from '../helpers';

describe('Tree Health API', () => {
  beforeAll(async () => {
    await setupTestDb();
  });
  
  afterAll(async () => {
    await clearTestDb();
  });
  
  test('GET /api/trees/:id/health 应返回树木健康状态', async () => {
    // 测试用例实现
  });
  
  // 其他测试...
});
```

## 4. 部署考虑事项

1. **数据库迁移**：确保现有树木数据添加健康状态字段
2. **性能监控**：监控健康状态计算和批量更新的性能
3. **定时任务配置**：确保cron任务正确配置和运行
4. **错误处理**：添加健康状态相关错误监控

## 5. 验收标准

- 树木健康状态正确反映任务进度和截止日期
- 健康状态变化有相应的视觉反馈
- 用户可以通过更新任务进度影响树木健康状态
- 批量更新任务正常运行且不影响系统性能

## 6. 常见问题

### 6.1 树木健康状态计算不正确

**可能原因**：
- 任务进度数据不正确
- 截止日期格式问题
- 算法参数调整不当

**解决方案**：
- 检查任务数据完整性
- 确保日期格式一致
- 调整算法参数并测试不同场景

### 6.2 健康状态更新延迟

**可能原因**：
- 批量更新任务未执行
- 前端未及时刷新数据
- 缓存问题

**解决方案**：
- 检查cron任务日志
- 实现WebSocket实时更新
- 调整缓存策略

## 7. 参考文档

- [树木健康状态系统详细设计](/docs/modules/tree_health_system.md)
- [API参考文档](/docs/api/api_reference.md)
- [开发快速指南](/docs/guides/development_quick_start.md) 