# 树木健康状态系统 API 参考文档

本文档详细说明了TaskForest项目中树木健康状态系统相关的API接口，包括请求参数、响应格式和错误处理。

## 1. 概述

树木健康状态API提供对树木健康状态的查询和更新能力，以及通过任务进度影响树木健康状态的功能。所有响应均遵循统一的格式：

```json
{
  "code": 200,      // 状态码
  "data": {},       // 响应数据
  "message": "success" // 响应消息
}
```

## 2. API 端点

### 2.1 获取树木健康状态

获取指定树木的健康状态详情。

**请求：**

```
GET /api/trees/:id/health
```

**路径参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 树木ID |

**请求示例：**

```
GET /api/trees/123/health
```

**成功响应 (200 OK)：**

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

**错误响应：**

- 404 Not Found：树木不存在
```json
{
  "code": 404,
  "message": "树木不存在"
}
```

- 500 Internal Server Error：服务器错误
```json
{
  "code": 500,
  "message": "获取树木健康状态失败"
}
```

### 2.2 更新树木健康状态

手动更新指定树木的健康状态。

**请求：**

```
PUT /api/trees/:id/health
```

**路径参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 树木ID |

**请求体：**

```json
{
  "healthState": 75,
  "notes": "手动调整健康状态"
}
```

**请求参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| healthState | number | 是 | 新的健康状态值(0-100) |
| notes | string | 否 | 更新说明 |

**成功响应 (200 OK)：**

```json
{
  "code": 200,
  "data": {
    "treeId": "123",
    "healthState": 75,
    "healthCategory": "HEALTHY",
    "lastUpdated": "2024-04-09T12:30:45Z",
    "task": {
      "id": "456",
      "title": "完成报告",
      "progress": 60,
      "deadline": "2024-04-15T23:59:59Z"
    }
  },
  "message": "success"
}
```

**错误响应：**

- 400 Bad Request：参数无效
```json
{
  "code": 400,
  "message": "健康状态值必须在0-100之间"
}
```

- 404 Not Found：树木不存在
```json
{
  "code": 404,
  "message": "树木不存在"
}
```

- 500 Internal Server Error：服务器错误
```json
{
  "code": 500,
  "message": "更新树木健康状态失败"
}
```

### 2.3 获取任务关联的树木健康状态

获取指定任务关联的树木健康状态及预测信息。

**请求：**

```
GET /api/tasks/:id/tree-health
```

**路径参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 任务ID |

**请求示例：**

```
GET /api/tasks/456/tree-health
```

**成功响应 (200 OK)：**

```json
{
  "code": 200,
  "data": {
    "taskId": "456",
    "taskTitle": "完成报告",
    "progress": 60,
    "deadline": "2024-04-15T23:59:59Z",
    "tree": {
      "id": "123",
      "type": "oak",
      "stage": 3,
      "healthState": 85,
      "healthCategory": "HEALTHY",
      "lastUpdated": "2024-04-09T10:15:30Z"
    },
    "healthPrediction": {
      "currentTrend": "IMPROVING",
      "estimatedHealthAt": [
        {
          "date": "2024-04-10T00:00:00Z",
          "health": 87
        },
        {
          "date": "2024-04-12T00:00:00Z",
          "health": 90
        }
      ],
      "recommendedProgress": 65
    }
  },
  "message": "success"
}
```

**错误响应：**

- 404 Not Found：任务不存在或未关联树木
```json
{
  "code": 404,
  "message": "任务不存在或未关联树木"
}
```

- 500 Internal Server Error：服务器错误
```json
{
  "code": 500,
  "message": "获取任务关联树木健康状态失败"
}
```

### 2.4 更新任务进度

更新任务进度，同时影响关联树木的健康状态。

**请求：**

```
PUT /api/tasks/:id/progress
```

**路径参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 任务ID |

**请求体：**

```json
{
  "progress": 75,
  "notes": "完成报告初稿"
}
```

**请求参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| progress | number | 是 | 任务进度(0-100) |
| notes | string | 否 | 进度更新说明 |

**成功响应 (200 OK)：**

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

**错误响应：**

- 400 Bad Request：参数无效
```json
{
  "code": 400,
  "message": "进度值必须在0-100之间"
}
```

- 404 Not Found：任务不存在
```json
{
  "code": 404,
  "message": "任务不存在"
}
```

- 500 Internal Server Error：服务器错误
```json
{
  "code": 500,
  "message": "更新任务进度失败"
}
```

### 2.5 批量更新树木健康状态

触发批量更新所有树木的健康状态（通常由定时任务自动执行）。

**请求：**

```
POST /api/trees/health/batch-update
```

**请求体：**

无需请求体

**成功响应 (200 OK)：**

```json
{
  "code": 200,
  "data": {
    "message": "批量更新成功",
    "summary": {
      "total": 50,
      "updated": 30,
      "unchanged": 15,
      "improved": 10,
      "declined": 20,
      "critical": 5
    }
  },
  "message": "success"
}
```

**错误响应：**

- 500 Internal Server Error：服务器错误
```json
{
  "code": 500,
  "message": "批量更新树木健康状态失败"
}
```

## 3. 数据模型

### 3.1 TreeHealthDetails

树木健康状态详情。

| 字段 | 类型 | 描述 |
|------|------|------|
| treeId | string | 树木ID |
| healthState | number | 健康状态值(0-100) |
| healthCategory | string | 健康状态分类，枚举值：HEALTHY, SLIGHTLY_WILTED, MODERATELY_WILTED, SEVERELY_WILTED |
| lastUpdated | string | 最后更新时间(ISO日期字符串) |
| task | object | 关联任务信息(可选) |
| task.id | string | 任务ID |
| task.title | string | 任务标题 |
| task.progress | number | 任务进度(0-100)(可选) |
| task.deadline | string | 任务截止日期(ISO日期字符串)(可选) |
| details | object | 健康状态详细信息(可选) |
| details.timeRatio | number | 时间比例(0-1) |
| details.expectedProgress | number | 预期进度(0-100) |
| details.actualProgress | number | 实际进度(0-100)(可选) |

### 3.2 HealthPrediction

健康状态预测信息。

| 字段 | 类型 | 描述 |
|------|------|------|
| currentTrend | string | 当前趋势，枚举值：IMPROVING, STABLE, DECLINING, CRITICAL |
| estimatedHealthAt | array | 未来健康值预测 |
| estimatedHealthAt[].date | string | 预测日期(ISO日期字符串) |
| estimatedHealthAt[].health | number | 预测健康值(0-100) |
| recommendedProgress | number | 推荐进度(0-100) |

### 3.3 TaskTreeHealth

任务树木健康关联信息。

| 字段 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |
| taskTitle | string | 任务标题 |
| progress | number | 任务进度(0-100) |
| deadline | string | 任务截止日期(ISO日期字符串)(可选) |
| tree | object | 树木信息 |
| tree.id | string | 树木ID |
| tree.type | string | 树木类型 |
| tree.stage | number | 生长阶段 |
| tree.healthState | number | 健康状态值(0-100) |
| tree.healthCategory | string | 健康状态分类 |
| tree.lastUpdated | string | 最后更新时间(ISO日期字符串) |
| healthPrediction | object | 健康预测信息 |

### 3.4 TaskProgressUpdateResponse

任务进度更新响应信息。

| 字段 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |
| progress | number | 更新后的进度(0-100) |
| updatedAt | string | 更新时间(ISO日期字符串) |
| tree | object | 树木信息(可选) |
| tree.id | string | 树木ID |
| tree.healthStateBefore | number | 更新前健康状态值(0-100) |
| tree.healthStateAfter | number | 更新后健康状态值(0-100) |
| tree.healthChange | string | 健康变化类型：IMPROVED, DECLINED, UNCHANGED |

## 4. 枚举值

### 4.1 HealthCategory

健康状态分类。

| 值 | 描述 | 健康值范围 |
|------|------|------|
| HEALTHY | 健康 | 75-100 |
| SLIGHTLY_WILTED | 轻微枯萎 | 50-75 |
| MODERATELY_WILTED | 中度枯萎 | 25-50 |
| SEVERELY_WILTED | 严重枯萎 | 0-25 |

### 4.2 HealthTrend

健康状态趋势。

| 值 | 描述 |
|------|------|
| IMPROVING | 改善中 |
| STABLE | 稳定 |
| DECLINING | 恶化中 |
| CRITICAL | 严重恶化 |

## 5. 常见错误代码

| 代码 | 描述 | 可能原因 |
|------|------|------|
| 400 | 参数无效 | 健康状态值或进度值超出范围 |
| 404 | 资源不存在 | 指定的树木或任务不存在 |
| 500 | 服务器错误 | 内部服务器错误，请查看服务器日志 |

## 6. 限制和注意事项

1. 健康状态值和进度值必须在0-100范围内
2. 批量更新操作可能需要较长处理时间，建议不要频繁调用
3. 健康状态预测基于当前数据，实际情况可能因任务进度变化而改变

## 3. 任务类型与树木类型映射

### 3.1 映射关系说明

TaskForest系统实现了任务类型与树木类型的自动映射关系，使得不同类型的任务默认创建对应类型的树木，增强了游戏化体验：

| 任务类型        | 树木类型 | 说明                |
|---------------|----------|---------------------|
| NORMAL        | OAK      | 普通日常任务 -> 橡树   |
| RECURRING     | PINE     | 定期重复任务 -> 松树   |
| PROJECT       | WILLOW   | 长期项目任务 -> 柳树   |
| LEARNING      | APPLE    | 学习类任务 -> 苹果树   |
| WORK          | MAPLE    | 工作类任务 -> 枫树     |
| LEISURE       | PALM     | 休闲类任务 -> 棕榈树   |

### 3.2 查询映射关系

```
GET /api/constants/tree-mappings
```

**描述**：获取任务类型与树木类型的映射关系

**认证要求**：无

**参数**：无

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "mappings": {
      "NORMAL": "OAK",
      "RECURRING": "PINE",
      "PROJECT": "WILLOW",
      "LEARNING": "APPLE",
      "WORK": "MAPLE",
      "LEISURE": "PALM"
    },
    "taskTypes": ["NORMAL", "RECURRING", "PROJECT", "LEARNING", "WORK", "LEISURE"],
    "treeTypes": ["OAK", "PINE", "WILLOW", "APPLE", "MAPLE", "PALM", "CHERRY"]
  },
  "message": "获取映射关系成功",
  "timestamp": 1675487562589
}
```

### 3.3 创建任务时的映射应用

在创建任务时，如果未指定`treeType`参数，系统将根据任务类型自动选择对应的树木类型：

```
POST /api/tasks
```

**请求体示例**：

```json
{
  "title": "学习React基础知识",
  "description": "完成React官方文档的学习",
  "type": "LEARNING",
  "priority": 2,
  "dueDate": "2023-07-30T00:00:00Z",
  "tags": ["学习", "编程", "前端"]
}
```

**响应示例**：

```json
{
  "code": 201,
  "data": {
    "id": "1005",
    "title": "学习React基础知识",
    "description": "完成React官方文档的学习",
    "type": "LEARNING",
    "status": "TODO",
    "priority": 2,
    "dueDate": "2023-07-30T00:00:00Z",
    "createdAt": "2023-07-20T10:30:00Z",
    "updatedAt": "2023-07-20T10:30:00Z",
    "tags": ["学习", "编程", "前端"],
    "treeType": "APPLE",
    "growthStage": 0
  },
  "message": "任务创建成功，已分配苹果树",
  "timestamp": 1675487562589
}
```

在上述示例中，由于任务类型为"LEARNING"，系统自动将树木类型设置为"APPLE"（苹果树）。 