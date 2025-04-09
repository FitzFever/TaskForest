# 树木健康状态系统详细设计

## 1. 系统概述

树木健康状态系统是TaskForest的核心游戏化机制之一，负责根据任务进度和截止日期计算树木的健康状态，并将其可视化呈现给用户。本系统通过树木的健康状态变化，直观地反映任务完成情况，激励用户及时完成任务。

## 2. 健康状态分类

树木健康状态分为四个主要级别：

| 健康类别 | 健康值范围 | 视觉表现 | 触发条件 |
|---------|-----------|---------|---------|
| 健康(HEALTHY) | 75-100% | 枝繁叶茂，生机勃勃 | 任务进度正常，距离DDL充足 |
| 轻微枯萎(SLIGHTLY_WILTED) | 50-75% | 部分叶片发黄，生长减缓 | 任务进度落后，距离DDL较近 |
| 中度枯萎(MODERATELY_WILTED) | 25-50% | 大量叶片发黄，枝干干枯 | 任务严重延期，接近DDL |
| 严重枯萎(SEVERELY_WILTED) | 0-25% | 叶片脱落，枝干干裂 | 任务严重延期，超过DDL |

```typescript
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
```

## 3. 健康状态计算机制

### 3.1 基础计算公式

树木健康状态计算基于以下核心因素：

1. **时间因素**：距离截止日期的剩余时间比例
2. **进度因素**：任务实际进度与预期进度的差异
3. **历史因素**：任务进度更新频率及规律性

```
基础健康值计算公式:
基础健康值 = 100 * (剩余时间 / 总时间)

进度调整:
- 如果进度超前: 健康值 += (实际进度 - 预期进度) / 2
- 如果进度落后: 健康值 -= (预期进度 - 实际进度) / 2

健康值范围约束:
最终健康值 = min(100, max(0, 计算所得健康值))
```

### 3.2 特殊状态处理

- **任务已完成**：健康值设为100%
- **任务取消**：树木移除
- **无截止日期**：基于进度计算健康值
- **超过截止日期**：基于超期时长计算健康值衰减

### 3.3 恢复机制

- **进度更新**：更新任务进度时，健康值立即恢复20%
- **调整截止日期**：重新计算健康值
- **任务完成**：健康值恢复至100%

### 3.4 详细算法实现

```typescript
/**
 * 计算树木健康状态的详细算法
 * @param task 关联任务信息
 * @param currentHealth 当前健康值（可选）
 * @returns 计算后的健康值和相关详情
 */
function calculateTreeHealth(
  task: TaskInfo, 
  currentHealth?: number
): {healthState: number; details: HealthDetails} {
  // 1. 任务已完成，树木完全健康
  if (task.status === 'COMPLETED') {
    return {
      healthState: 100,
      details: {
        timeRatio: 1,
        expectedProgress: 100,
        actualProgress: 100,
        reason: 'TASK_COMPLETED'
      }
    };
  }
  
  // 2. 任务被取消，返回0（通常这种情况树木会被移除）
  if (task.status === 'CANCELLED') {
    return {
      healthState: 0,
      details: {
        timeRatio: 0,
        expectedProgress: 0,
        actualProgress: 0,
        reason: 'TASK_CANCELLED'
      }
    };
  }
  
  const now = new Date();
  
  // 3. 处理没有截止日期的情况
  if (!task.deadline) {
    // 无截止日期时，主要基于任务进度
    return {
      healthState: task.progress ? Math.min(100, task.progress) : 80,
      details: {
        timeRatio: 1,
        expectedProgress: 0,
        actualProgress: task.progress || 0,
        reason: 'NO_DEADLINE'
      }
    };
  }
  
  const deadline = new Date(task.deadline);
  const createdAt = new Date(task.createdAt);
  
  // 4. 计算任务总时长(毫秒)
  const totalDuration = deadline.getTime() - createdAt.getTime();
  
  // 5. 计算剩余时间(毫秒)
  const remainingTime = deadline.getTime() - now.getTime();
  
  // 6. 计算时间比例
  const timeRatio = Math.max(0, Math.min(1, remainingTime / totalDuration));
  
  // 7. 计算预期进度（随时间线性增长）
  const expectedProgress = Math.min(100, Math.max(0, 100 - (timeRatio * 100)));
  
  let healthState = 0;
  let reason = '';
  
  // 8. 超过截止日期的特殊处理
  if (remainingTime <= 0) {
    // 计算超过时长比例
    const overdueFactor = Math.min(Math.abs(remainingTime) / totalDuration, 1);
    // 超过截止日期但仍给予一定健康值（最低20%）
    healthState = Math.max(20, 100 - (overdueFactor * 80));
    reason = 'OVERDUE';
    
    // 根据实际进度调整健康值（即使超期，高进度也能提高健康状态）
    if (task.progress && task.progress > 50) {
      // 超过50%进度的任务即使超期也给予更多健康值
      healthState = Math.min(40, healthState + (task.progress - 50) / 5);
    }
  } else {
    // 9. 正常截止日期内的处理
    // 计算基础健康值(基于剩余时间比例)
    healthState = Math.min(100, Math.max(20, timeRatio * 100));
    reason = 'NORMAL';
    
    // 10. 根据任务进度调整健康值
    if (task.progress !== undefined) {
      // 如果进度超前，提升健康值
      if (task.progress > expectedProgress) {
        healthState = Math.min(100, healthState + ((task.progress - expectedProgress) / 2));
        reason = 'AHEAD_OF_SCHEDULE';
      }
      // 如果进度严重落后，降低健康值
      else if (task.progress < expectedProgress * 0.8) {
        healthState = Math.max(20, healthState - ((expectedProgress - task.progress) / 2));
        reason = 'BEHIND_SCHEDULE';
      }
    }
  }
  
  // 11. 考虑历史健康值，避免突变（可选）
  if (currentHealth !== undefined) {
    // 平滑变化处理，防止健康值突变
    const changeRate = 0.3; // 每次最多变化30%
    const maxChange = Math.abs(healthState - currentHealth) * changeRate;
    
    if (healthState > currentHealth) {
      // 健康值上升，限制上升速度
      healthState = Math.min(healthState, currentHealth + maxChange);
    } else {
      // 健康值下降，限制下降速度
      healthState = Math.max(healthState, currentHealth - maxChange);
    }
  }
  
  // 12. 对健康值进行四舍五入
  healthState = Math.round(healthState);
  
  return {
    healthState,
    details: {
      timeRatio,
      expectedProgress,
      actualProgress: task.progress,
      reason
    }
  };
}
```

### 3.5 健康状态趋势计算

```typescript
/**
 * 计算健康状态趋势
 * @param currentHealth 当前健康值
 * @param task 任务信息
 * @returns 健康趋势和预测数据
 */
function calculateHealthTrend(
  currentHealth: number,
  task: TaskInfo
): {trend: HealthTrend; predictions: Array<{date: Date; health: number}>} {
  if (!task.deadline) {
    return {
      trend: HealthTrend.STABLE,
      predictions: []
    };
  }
  
  const now = new Date();
  const deadline = new Date(task.deadline);
  const daysToDeadline = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  // 如果已经超过截止日期
  if (daysToDeadline === 0) {
    return {
      trend: currentHealth < 30 ? HealthTrend.CRITICAL : HealthTrend.DECLINING,
      predictions: [
        { date: new Date(now.getTime() + 86400000), health: Math.max(0, currentHealth - 10) },
        { date: new Date(now.getTime() + 172800000), health: Math.max(0, currentHealth - 20) }
      ]
    };
  }
  
  // 计算预期进度
  const progressRate = task.progress ? task.progress / 100 : 0;
  const timeElapsedRate = (now.getTime() - new Date(task.createdAt).getTime()) / 
                          (deadline.getTime() - new Date(task.createdAt).getTime());
  
  // 确定趋势
  let trend: HealthTrend;
  if (progressRate >= timeElapsedRate * 1.1) {
    trend = HealthTrend.IMPROVING;
  } else if (progressRate >= timeElapsedRate * 0.9) {
    trend = HealthTrend.STABLE;
  } else if (progressRate >= timeElapsedRate * 0.7) {
    trend = HealthTrend.DECLINING;
  } else {
    trend = HealthTrend.CRITICAL;
  }
  
  // 生成未来预测
  const predictions = [];
  for (let i = 1; i <= Math.min(3, daysToDeadline); i++) {
    const futureDate = new Date(now.getTime() + i * 86400000);
    const futureTimeElapsedRate = (futureDate.getTime() - new Date(task.createdAt).getTime()) / 
                                  (deadline.getTime() - new Date(task.createdAt).getTime());
    
    // 假设进度不变，计算未来健康值
    const predictedHealth = 100 - (futureTimeElapsedRate * 100) + 
                          (progressRate * 100 - futureTimeElapsedRate * 100) / 2;
    
    predictions.push({
      date: futureDate,
      health: Math.max(0, Math.min(100, Math.round(predictedHealth)))
    });
  }
  
  return { trend, predictions };
}
```

## 4. 核心接口设计

### 4.1 数据模型

```typescript
// 树木健康详情接口
export interface TreeHealthDetails {
  treeId: string;
  healthState: number;
  healthCategory: HealthCategory;
  lastUpdated: string;
  task?: {
    id: string;
    title: string;
    progress?: number;
    deadline?: string;
  };
  details?: {
    timeRatio: number;
    expectedProgress: number;
    actualProgress?: number;
  };
}

// 健康预测接口
export interface HealthPrediction {
  currentTrend: HealthTrend;
  estimatedHealthAt: { date: string; health: number }[];
  recommendedProgress: number;
}

// 任务树木健康关联接口
export interface TaskTreeHealth {
  taskId: string;
  taskTitle: string;
  progress: number;
  deadline?: string;
  tree: {
    id: string;
    type: string;
    stage: number;
    healthState: number;
    healthCategory: HealthCategory;
    lastUpdated: string;
  };
  healthPrediction: HealthPrediction;
}
```

### 4.2 API设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/trees/:id/health` | GET | 获取树木健康状态 |
| `/api/trees/:id/health` | PUT | 更新树木健康状态 |
| `/api/tasks/:id/tree-health` | GET | 获取任务关联的树木健康状态 |
| `/api/tasks/:id/progress` | PUT | 更新任务进度（自动更新树木健康状态） |
| `/api/trees/health/batch-update` | POST | 批量更新所有树木健康状态 |

### 4.3 API示例与请求响应格式

#### 获取树木健康状态
```
GET /api/trees/:id/health
```

响应格式：
```json
{
  "code": 200,
  "data": {
    "treeId": "123",
    "healthState": 85,
    "healthCategory": "HEALTHY",
    "lastUpdated": "2024-04-09T10:15:30Z",
    "task": {
      "id": "456",
      "title": "完成报告",
      "progress": 60,
      "deadline": "2024-04-15T23:59:59Z"
    },
    "details": {
      "timeRatio": 0.75,
      "expectedProgress": 25,
      "actualProgress": 60
    }
  },
  "message": "success"
}
```

#### 更新任务进度
```
PUT /api/tasks/:id/progress
```

请求体：
```json
{
  "progress": 75,
  "notes": "已完成报告初稿"
}
```

响应格式：
```json
{
  "code": 200,
  "data": {
    "taskId": "456",
    "progress": 75,
    "updatedAt": "2024-04-09T14:30:45Z",
    "tree": {
      "id": "123",
      "healthStateBefore": 85,
      "healthStateAfter": 95,
      "healthChange": "IMPROVED"
    }
  },
  "message": "success"
}
```

## 5. 前端组件设计

### 5.1 主要组件

- **TreeHealthPanel**: 树木健康状态详情面板
  - 显示当前健康值和类别
  - 显示健康趋势和预测
  - 提供进度更新控件

- **TreeHealthIndicator**: 树木健康状态指示器
  - 在3D场景中显示树木健康状态
  - 使用颜色编码不同健康级别

- **TreeGrowthAnimation**: 树木生长和健康状态动画
  - 树木生长阶段动画
  - 健康状态变化特效
  - 恢复和衰退视觉效果

### 5.2 健康状态可视化

健康状态通过以下视觉元素表现：

1. **叶片颜色**：从翠绿到黄色再到枯萎棕色
2. **叶片数量**：健康状态下茂密，枯萎状态下稀疏
3. **粒子效果**：恢复时的绿色粒子，衰退时的黄色粒子
4. **整体姿态**：健康挺拔vs枯萎下垂

### 5.3 组件交互流程

```
用户打开任务详情 -> 加载 TreeHealthPanel 组件
  -> 根据任务ID或树木ID获取健康数据
  -> 展示健康状态和预测
  -> 用户可更新进度
  -> 进度更新后重新计算健康状态
  -> 显示健康状态变化动画
  -> 更新树木外观
```

### 5.4 TreeHealthPanel组件实现详情

```typescript
// TreeHealthPanel组件主要职责：
// 1. 获取并显示树木健康状态
// 2. 允许用户更新任务进度
// 3. 显示健康预测和趋势

const TreeHealthPanel: React.FC<TreeHealthPanelProps> = ({ treeId, taskId, onProgressUpdate }) => {
  // 状态定义
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [treeHealth, setTreeHealth] = useState<TreeHealthDetails | null>(null);
  const [taskHealth, setTaskHealth] = useState<TaskTreeHealth | null>(null);
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);

  // 主要加载逻辑
  useEffect(() => {
    // 加载树木健康状态数据
    const fetchTreeHealth = async () => {
      // 健康数据加载逻辑...
    };
    
    fetchTreeHealth();
  }, [treeId, taskId]);

  // 处理进度更新
  const handleProgressUpdate = async () => {
    // 更新任务进度并反映在树木健康状态上
    // ...更新逻辑实现
  };

  // 渲染树木健康状态信息
  const renderTreeHealthInfo = () => {
    // 根据健康状态数据渲染UI
    // ...UI渲染逻辑
  };

  return (
    <Card loading={loading} bordered={false}>
      {/* 组件UI渲染逻辑 */}
    </Card>
  );
};
```

## 6. 状态转换与动画效果

### 6.1 状态转换规则

- 健康→轻微枯萎：健康值降至75%
- 轻微枯萎→中度枯萎：健康值降至50%
- 中度枯萎→严重枯萎：健康值降至25%
- 严重枯萎→死亡：健康值降至0%（极少发生）

### 6.2 状态变化动画

- **恢复动画**：绿色粒子上升，叶片逐渐变绿，树木微微晃动
- **衰退动画**：黄色粒子下落，叶片变黄或脱落，树木轻微弯曲
- **濒死警告**：红色光晕闪烁，强烈视觉提醒用户

### 6.3 动画实现细节

```typescript
/**
 * 根据健康状态获取树木外观
 * @param healthState 健康状态值(0-100)
 * @returns 树木外观参数
 */
function getTreeAppearance(healthState: number) {
  // 根据健康状态调整树木外观
  if (healthState >= 75) {
    return {
      leafColor: '#4CAF50',  // 健康的绿色
      leafDensity: 1.0,      // 完全茂密
      trunkColor: '#795548', // 健康的棕色
      animation: 'gentle_sway', // 轻柔摇摆
      particles: {
        enabled: false      // 健康状态不需要粒子效果
      }
    };
  } else if (healthState >= 50) {
    return {
      leafColor: '#8BC34A',  // 淡绿色
      leafDensity: 0.8,      // 略有脱落
      trunkColor: '#795548',
      animation: 'gentle_sway',
      particles: {
        enabled: healthState < 60, // 接近临界值时显示粒子
        color: '#FFF59D',    // 淡黄色粒子
        count: 5,
        direction: 'down'
      }
    };
  } else if (healthState >= 25) {
    return {
      leafColor: '#CDDC39',  // 黄绿色
      leafDensity: 0.5,      // 明显脱落
      trunkColor: '#6D4C41', // 深棕色
      animation: 'weak_sway',  // 微弱摇摆
      particles: {
        enabled: true,
        color: '#FFC107',    // 黄色粒子
        count: 10,
        direction: 'down'
      }
    };
  } else {
    return {
      leafColor: '#FF9800',  // 橙色/枯黄
      leafDensity: 0.2,      // 大量脱落
      trunkColor: '#5D4037', // 暗褐色
      animation: 'no_sway',    // 几乎不动
      particles: {
        enabled: true,
        color: '#FF5722',    // 红色粒子
        count: 15,
        direction: 'down',
        pulsate: healthState < 15 // 濒死状态闪烁
      }
    };
  }
}

/**
 * 健康状态变化动画
 * @param from 初始健康值
 * @param to 目标健康值
 * @param treeObject 树木Three.js对象
 */
function playHealthChangeAnimation(from: number, to: number, treeObject: any) {
  const duration = 1000; // 动画持续时间(毫秒)
  const startTime = Date.now();
  
  // 决定动画类型
  const isImproving = to > from;
  const particleColor = isImproving ? '#4CAF50' : '#FFC107';
  const particleDirection = isImproving ? 'up' : 'down';
  
  // 创建临时粒子系统
  const particles = createParticleSystem({
    color: particleColor,
    count: Math.abs(to - from) / 5, // 粒子数量与变化幅度相关
    direction: particleDirection,
    duration: duration + 500, // 粒子持续时间略长于主动画
    position: treeObject.position
  });
  
  // 添加粒子系统到场景
  scene.add(particles);
  
  // 动画函数
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    
    // 缓动函数，使动画更自然
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    // 计算当前健康值
    const currentValue = from + (to - from) * easeProgress;
    
    // 应用当前外观
    const appearance = getTreeAppearance(currentValue);
    applyTreeAppearance(treeObject, appearance);
    
    // 更新粒子系统
    updateParticles(particles, progress);
    
    // 继续动画或结束
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // 动画结束后的清理工作
      setTimeout(() => {
        scene.remove(particles);
        particles.dispose();
      }, 500);
    }
  }
  
  // 开始动画
  animate();
}
```

## 7. 定时更新与批量计算

为保证树木健康状态的及时更新，系统设计了定时更新机制：

1. **后端定时任务**：每天自动计算所有未完成任务的树木健康状态
2. **批量计算优化**：一次性处理多棵树木，减少数据库操作
3. **缓存中间结果**：缓存计算过程中的共用数据，提高性能
4. **推送通知**：健康状态显著变化时发送通知

定时更新流程：
```
后端定时任务触发 -> 获取所有未完成任务 -> 计算当前健康状态
  -> 更新树木健康记录 -> 前端轮询或WebSocket推送
  -> 更新树木外观 -> 必要时发送通知
```

### 7.1 批量更新实现

```typescript
/**
 * 批量更新所有树木健康状态
 * @returns 更新结果摘要
 */
async function batchUpdateTreesHealth(): Promise<UpdateSummary> {
  // 1. 获取所有未完成任务关联的树木
  const activeTrees = await prisma.tree.findMany({
    where: {
      task: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    },
    include: {
      task: true
    }
  });
  
  // 2. 准备当前时间和批处理大小
  const now = new Date();
  const batchSize = 50; // 每批处理的树木数量
  const results = {
    total: activeTrees.length,
    updated: 0,
    unchanged: 0,
    improved: 0,
    declined: 0,
    critical: 0
  };
  
  // 3. 分批处理树木健康状态更新
  for (let i = 0; i < activeTrees.length; i += batchSize) {
    const batch = activeTrees.slice(i, i + batchSize);
    const updatePromises = batch.map(async (tree) => {
      // 跳过无效任务的树木
      if (!tree.task) return null;
      
      // 计算新的健康状态
      const { healthState, details } = calculateTreeHealth(tree.task, tree.healthState);
      
      // 如果健康状态没有变化，跳过更新
      if (Math.abs(tree.healthState - healthState) < 1) {
        results.unchanged++;
        return null;
      }
      
      // 记录健康状态变化
      if (healthState > tree.healthState) {
        results.improved++;
      } else {
        results.declined++;
        // 检查是否进入危急状态
        if (healthState < 25 && tree.healthState >= 25) {
          results.critical++;
        }
      }
      
      // 更新树木健康状态
      return prisma.tree.update({
        where: { id: tree.id },
        data: {
          healthState,
          healthDetails: JSON.stringify(details),
          lastHealthUpdate: now
        }
      });
    });
    
    // 执行批量更新并等待完成
    const updateResults = await Promise.all(updatePromises);
    results.updated += updateResults.filter(Boolean).length;
  }
  
  // 4. 为健康状态严重恶化的树木发送通知
  if (results.critical > 0) {
    await sendHealthAlerts();
  }
  
  return results;
}
```

## 8. 未来扩展

树木健康状态系统计划的扩展方向：

1. **季节性影响**：不同季节对树木健康状态有不同影响
2. **环境因素**：虚拟天气、自然灾害等影响
3. **集体健康状态**：团队任务中的集体树木健康联动
4. **治愈道具**：游戏化道具用于恢复树木健康
5. **健康状态历史记录**：树木健康状态变化历史的可视化

### 8.1 季节影响系统扩展设计

```typescript
/**
 * 季节性影响因子计算
 * @param treeType 树木类型
 * @param date 当前日期
 * @returns 季节调整系数
 */
function calculateSeasonalFactor(treeType: string, date: Date = new Date()): number {
  // 获取月份(0-11)
  const month = date.getMonth();
  
  // 定义季节区间
  const seasons = {
    spring: [2, 3, 4],  // 3-5月
    summer: [5, 6, 7],  // 6-8月
    autumn: [8, 9, 10], // 9-11月
    winter: [11, 0, 1]  // 12-2月
  };
  
  // 针对不同树种的季节性调整
  const seasonalFactors = {
    oak: {
      spring: 1.1,  // 春季成长旺盛
      summer: 1.0,  // 夏季正常
      autumn: 0.9,  // 秋季略降
      winter: 0.8   // 冬季显著降低
    },
    pine: {
      spring: 1.05, // 春季略增
      summer: 1.0,  // 夏季正常
      autumn: 1.0,  // 秋季正常
      winter: 0.95  // 冬季略降
    },
    cherry: {
      spring: 1.2,  // 春季显著增长
      summer: 0.9,  // 夏季降低
      autumn: 0.8,  // 秋季较低
      winter: 0.7   // 冬季最低
    },
    // 其他树种...
  };
  
  // 确定当前季节
  let currentSeason = 'spring';
  for (const [season, months] of Object.entries(seasons)) {
    if (months.includes(month)) {
      currentSeason = season;
      break;
    }
  }
  
  // 获取对应树种和季节的调整因子
  return seasonalFactors[treeType]?.[currentSeason] || 1.0;
}
```

## 9. 实现注意事项

- **性能考量**：健康状态计算和视觉效果需平衡性能
- **数据一致性**：前后端健康状态计算逻辑保持一致
- **用户反馈**：状态变化需提供清晰的视觉和交互反馈
- **状态缓存**：适当缓存健康状态数据减少服务器负担

### 9.1 性能优化策略

1. **计算优化**
   - 使用增量计算而非完全重算
   - 批量处理临近截止日期的任务
   - 对健康状态变化不大的树木降低更新频率

2. **渲染优化**
   - 使用LOD (Level of Detail)技术
   - 对远处的树木减少特效复杂度
   - 使用GPU实例化渲染相似树木

3. **数据缓存**
   - 缓存暂时不变的健康状态
   - 实现客户端预测，减少服务器请求
   - 设置合理的状态更新间隔

### 9.2 测试策略

1. **单元测试**
   - 测试健康状态计算算法
   - 测试不同边界条件下的行为
   
2. **集成测试**
   - 测试前后端数据一致性
   - 测试定时更新任务
   
3. **可视化测试**
   - 使用健康状态模拟器验证视觉效果
   - 测试状态转换动画

## 10. 文档修订历史

| 版本 | 日期 | 修订内容 | 修订人 |
|------|------|---------|-------|
| v0.1 | 2024-04-10 | 初稿 | 系统架构师 |
| v0.2 | 2024-04-10 | 增加状态转换动画说明 | 系统架构师 | 
| v0.3 | 2024-04-12 | 增加健康状态算法实现细节 | 系统架构师 |
| v0.4 | 2024-04-12 | 增加前后端交互流程 | 系统架构师 | 