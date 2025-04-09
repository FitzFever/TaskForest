# 树木健康状态系统

## 功能概述

树木健康状态系统是TaskForest的核心差异化功能，通过将任务进度、截止日期(DDL)与树木视觉表现关联起来，实现任务管理的可视化反馈机制。该系统能够根据任务的完成情况和时间限制，动态计算树木的健康值，并通过树木的外观变化直观展示任务的紧迫性和健康程度。

## 健康状态定义

树木的健康状态分为四个等级，基于健康值(0-100%)计算：

1. **健康状态**（0-25%）
   - 视觉表现：枝繁叶茂，生机勃勃
   - 触发条件：任务进度正常，距离DDL充足
   - 特点：树木生长旺盛，叶片翠绿

2. **轻微枯萎**（25-50%）
   - 视觉表现：部分叶片发黄，生长减缓
   - 触发条件：任务进度落后，距离DDL较近
   - 特点：树木活力下降，但仍有生机

3. **中度枯萎**（50-75%）
   - 视觉表现：大量叶片发黄，枝干干枯
   - 触发条件：任务严重延期，接近DDL
   - 特点：树木明显缺乏活力，生长停滞

4. **严重枯萎**（75-100%）
   - 视觉表现：叶片脱落，枝干干裂
   - 触发条件：任务严重延期，超过DDL
   - 特点：树木濒临死亡，急需抢救

## 生命状态计算机制

### 基础生命值计算

- 初始生命值：100%（完全健康）
- 生命值衰减速度基于截止日期和任务总时长计算：
  ```
  衰减速度 = 距离DDL时间 / 任务总时长
  ```
- 任务进度对健康值的影响：
  - 进度正常：生命值维持
  - 进度落后：生命值加速衰减
  - 进度超前：生命值恢复

### 状态转换规则

- 健康→轻微枯萎：生命值降至75%
- 轻微枯萎→中度枯萎：生命值降至50%
- 中度枯萎→严重枯萎：生命值降至25%
- 严重枯萎→死亡：生命值降至0%

### 生命值恢复机制

- 更新任务进度：生命值立即恢复20%
- 提前完成任务：生命值恢复至100%
- 调整DDL：根据新DDL重新计算生命值
- 任务完成：树木恢复至完全健康状态

### 特殊状态效果

- 濒死状态：树木呈现红色警示效果
- 恢复状态：树木呈现绿色治愈效果
- 死亡状态：树木呈现灰色，可重新种植

## 系统架构

### 数据模型

树木健康状态系统在`Tree`数据模型中增加了`healthState`字段：

```typescript
interface Tree {
  // 现有字段
  id: string;            // 树木唯一标识
  taskId: string;        // 关联任务ID
  type: TreeType;        // 树木类型
  stage: number;         // 生长阶段
  position: Vector3;     // 位置坐标
  rotation: Vector3;     // 旋转角度
  scale: Vector3;        // 缩放比例
  createdAt: Date;       // 创建时间
  lastGrowth: Date;      // 最后生长时间
  
  // 健康状态系统字段
  healthState: number;   // 健康状态值(0-100)
}
```

### 后端服务

健康状态系统主要由以下服务组件实现：

1. **TreeHealthService**: 负责计算和管理树木健康状态
2. **TaskProgressTracker**: 追踪任务进度和截止日期情况
3. **HealthStateCalculator**: 核心计算逻辑，根据任务情况计算健康值

### 前端展示

前端通过以下组件实现健康状态的可视化：

1. **TreeHealthRenderer**: 根据健康状态渲染不同的树木外观
2. **HealthIndicator**: 显示健康状态指标和预警信息
3. **ProgressUpdater**: 提供任务进度更新界面，影响树木健康状态

## API接口

健康状态系统提供以下API接口：

- 获取树木健康状态：`GET /api/trees/:id/health`
- 更新树木健康状态：`PUT /api/trees/:id/health`
- 更新任务进度(影响健康状态)：`PUT /api/tasks/:id/progress`
- 获取任务与树木健康关联：`GET /api/tasks/:id/tree-health`

详细API规范请参考[API参考文档](/docs/api/api_reference.md)。

## 实现方案

### 核心算法

健康状态计算的核心算法如下：

```typescript
function calculateTreeHealth(task: Task): number {
  // 如果任务已完成，树木完全健康
  if (task.status === 'COMPLETED') return 100;
  
  // 如果没有截止日期，保持健康
  if (!task.deadline) return 100;
  
  const now = new Date();
  const deadline = new Date(task.deadline);
  const createdAt = new Date(task.createdAt);
  
  // 计算任务总时长(毫秒)
  const totalDuration = deadline.getTime() - createdAt.getTime();
  
  // 计算剩余时间(毫秒)
  const remainingTime = deadline.getTime() - now.getTime();
  
  // 如果已超过截止日期
  if (remainingTime <= 0) {
    // 根据超过时长决定健康值(最低20%)
    const overdueFactor = Math.min(Math.abs(remainingTime) / totalDuration, 1);
    return Math.max(20, 100 - (overdueFactor * 80));
  }
  
  // 计算基础健康值(基于剩余时间比例)
  const timeRatio = remainingTime / totalDuration;
  let healthValue = Math.min(100, Math.max(20, timeRatio * 100));
  
  // 根据任务进度调整健康值
  if (task.progress) {
    const expectedProgress = 100 - (timeRatio * 100);
    
    // 如果进度超前，提升健康值
    if (task.progress > expectedProgress) {
      healthValue = Math.min(100, healthValue + ((task.progress - expectedProgress) / 2));
    }
    // 如果进度落后，降低健康值
    else if (task.progress < expectedProgress * 0.8) {
      healthValue = Math.max(20, healthValue - ((expectedProgress - task.progress) / 2));
    }
  }
  
  return Math.round(healthValue);
}
```

### 自动更新机制

树木健康状态通过以下机制自动更新：

1. **定时任务**: 系统定期计算所有活动任务的树木健康状态
2. **事件触发**: 当任务状态、进度或截止日期变更时，触发健康状态重新计算
3. **用户交互**: 用户手动更新任务进度时，立即更新健康状态

### 前端渲染

树木的视觉表现根据健康状态动态调整：

```typescript
function getTreeAppearance(healthState: number) {
  // 健康状态范围: 0-100
  if (healthState >= 75) {
    return {
      leafColor: '#4CAF50',  // 健康的绿色
      leafDensity: 1.0,      // 完全茂密
      trunkColor: '#795548', // 健康的棕色
      animation: 'gentle_sway' // 轻柔摇摆
    };
  } else if (healthState >= 50) {
    return {
      leafColor: '#8BC34A',  // 淡绿色
      leafDensity: 0.8,      // 略有脱落
      trunkColor: '#795548',
      animation: 'gentle_sway'
    };
  } else if (healthState >= 25) {
    return {
      leafColor: '#CDDC39',  // 黄绿色
      leafDensity: 0.5,      // 明显脱落
      trunkColor: '#6D4C41', // 深棕色
      animation: 'weak_sway'  // 微弱摇摆
    };
  } else {
    return {
      leafColor: '#FF9800',  // 橙色/枯黄
      leafDensity: 0.2,      // 大量脱落
      trunkColor: '#5D4037', // 暗褐色
      animation: 'no_sway'    // 几乎不动
    };
  }
}
```

## 相关文档

- [API参考文档](/docs/api/api_reference.md)
- [数据库模型](/docs/architecture/architecture_overview.md)
- [任务管理](/docs/guides/development_quick_start.md)
- [开发规范](/docs/development/standards.md)
- [项目路线图](/docs/development/roadmap.md)

## 开发计划

1. **阶段1**: 数据模型扩展和基础后端实现
   - 添加`healthState`字段到Tree模型
   - 实现健康状态计算逻辑
   - 开发自动更新机制

2. **阶段2**: API接口开发
   - 实现健康状态查询和更新API
   - 集成任务进度更新与健康状态计算
   - 添加健康状态事件通知

3. **阶段3**: 前端实现
   - 开发健康状态可视化组件
   - 实现树木外观动态调整
   - 添加健康状态提示和预警UI

4. **阶段4**: 测试和优化
   - 性能测试和优化
   - 用户体验测试
   - 边缘情况处理

## 参考资料

- [TaskForest产品说明文档](/product/TaskForest产品说明文档.md)
- [TaskForest流程图说明](/product/TaskForest流程图说明.md) 