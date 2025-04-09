# TaskForest API 接口规范文档

本文档详细描述了 TaskForest 项目的 API 接口规范，供前端和后端开发参考。

## API 基础信息

- **基础URL**：`/api`
- **内容类型**：`application/json`
- **字符编码**：UTF-8
- **版本控制**：在URL中包含版本号，如 `/api/v1/tasks`

## 通用响应格式

所有 API 响应遵循以下格式：

```json
{
  "code": 200,              // HTTP 状态码
  "data": {},               // 响应数据（成功时）
  "error": null,            // 错误信息（失败时）
  "message": "Success",     // 响应消息
  "timestamp": 1625097600000  // 时间戳
}
```

错误响应示例：

```json
{
  "code": 400,
  "data": null,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "任务标题不能为空",
    "details": {
      "field": "title",
      "reason": "required"
    }
  },
  "message": "Bad Request",
  "timestamp": 1625097600000
}
```

## 状态码说明

- **200 OK**：请求成功
- **201 Created**：资源创建成功
- **204 No Content**：请求成功但无返回内容
- **400 Bad Request**：请求参数错误
- **401 Unauthorized**：未授权
- **403 Forbidden**：无权限
- **404 Not Found**：资源不存在
- **500 Internal Server Error**：服务器内部错误

## 分页、排序和筛选

### 分页参数

- **page**：页码，从1开始
- **limit**：每页记录数，默认20

```
GET /api/tasks?page=1&limit=20
```

### 排序参数

- **sort**：排序字段
- **order**：排序方向，asc（升序）或desc（降序）

```
GET /api/tasks?sort=dueDate&order=asc
```

### 筛选参数

根据资源属性进行筛选：

```
GET /api/tasks?status=TODO&type=WORK
```

## API 端点详细说明

### 1. 任务管理

#### 1.1 获取任务列表

```
GET /api/tasks
```

**请求参数**：

| 参数名  | 类型   | 是否必须 | 说明                                                     |
|---------|--------|----------|---------------------------------------------------------|
| page    | number | 否       | 页码，默认1                                              |
| limit   | number | 否       | 每页数量，默认20                                         |
| search  | string | 否       | 搜索关键词，检索任务标题和描述。支持高级语法:           |
|         |        |          | - 多关键词: 用空格分隔，例如 `项目 报告`（同时匹配两个词） |
|         |        |          | - 标题搜索: `title:关键词` 只在标题中搜索                |
|         |        |          | - 描述搜索: `desc:关键词` 只在描述中搜索                |
| status  | string | 否       | 任务状态筛选 (TODO, IN_PROGRESS, COMPLETED, CANCELLED)   |
| tags    | string | 否       | 标签筛选，多个标签用逗号分隔。支持高级语法:             |
|         |        |          | - 普通标签: 匹配包含该标签的任务                         |
|         |        |          | - 精确匹配: `tag:标签名` 精确匹配标签                    |
| priority| number | 否       | 优先级 (1=低, 2=中, 3=高, 4=紧急)                       |
| startDate | string | 否     | 开始日期，格式为 YYYY-MM-DD                             |
| endDate | string | 否       | 结束日期，格式为 YYYY-MM-DD                             |
| treeType| string | 否       | 树木类型 (OAK, PINE, CHERRY, MAPLE, PALM)               |
| sortBy  | string | 否       | 排序字段 (dueDate, createdAt, priority, title)          |
| sortOrder | string | 否     | 排序方式 (asc, desc)                                    |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "tasks": [
      {
        "id": "1001",
        "title": "完成项目报告",
        "description": "完成季度项目进度报告并提交给项目经理",
        "type": "WORK",
        "status": "TODO",
        "priority": 3,
        "dueDate": "2023-05-20T00:00:00.000Z",
        "createdAt": "2023-05-10T09:00:00.000Z",
        "updatedAt": "2023-05-10T09:00:00.000Z",
        "tags": ["报告", "项目"],
        "treeType": "OAK",
        "growthStage": 1
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  },
  "message": "获取任务列表成功",
  "timestamp": 1675487562589
}
```

**高级搜索示例**:
  - 查找标题包含"项目"且描述包含"报告"的任务:
    ```
    GET /api/tasks?search=title:项目 desc:报告
    ```
  - 精确匹配标签"紧急"的任务:
    ```
    GET /api/tasks?tags=tag:紧急
    ```
  - 查找具有优先级3且状态为待办的任务:
    ```
    GET /api/tasks?priority=3&status=TODO
    ```

#### 1.2 获取任务统计

```
GET /api/tasks/stats
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "total": 10,
    "completed": 3,
    "inProgress": 2,
    "todo": 5,
    "cancelled": 0,
    "completionRate": 30.0,
    "tagStats": [
      { "tag": "项目", "count": 5 },
      { "tag": "报告", "count": 3 }
    ],
    "priorityStats": {
      "1": 2,
      "2": 5,
      "3": 2,
      "4": 1
    }
  },
  "message": "获取任务统计成功",
  "timestamp": 1675487562589
}
```

#### 1.3 获取单个任务

```
GET /api/tasks/:id
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 任务唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "1001",
    "title": "完成项目报告",
    "description": "完成季度项目进度报告并提交给项目经理",
    "type": "WORK",
    "status": "TODO",
    "priority": 3,
    "dueDate": "2023-05-20T00:00:00.000Z",
    "createdAt": "2023-05-10T09:00:00.000Z",
    "updatedAt": "2023-05-10T09:00:00.000Z",
    "completedAt": null,
    "parentId": null,
    "tags": ["报告", "项目"],
    "treeType": "OAK",
    "growthStage": 1,
    "children": []  // 子任务列表
  },
  "message": "Success",
  "timestamp": 1675487562589
}
```

#### 1.4 创建任务

```
POST /api/tasks
```

**请求体**：

```json
{
  "title": "完成季度报告",
  "description": "整理Q2项目进展情况",
  "type": "WORK",
  "priority": 2,
  "dueDate": "2023-07-20T10:00:00Z",
  "tags": ["项目", "报告"],
  "parentId": null,
  "treeType": "OAK"
}
```

**请求参数说明**：

| 参数名      | 类型     | 是否必须 | 说明                                |
|-------------|----------|----------|-------------------------------------|
| title       | string   | 是       | 任务标题                            |
| description | string   | 否       | 任务描述                            |
| type        | string   | 是       | 任务类型                            |
| priority    | number   | 否       | 优先级(1-5)，默认3                  |
| dueDate     | string   | 是       | 截止日期，ISO8601格式               |
| tags        | string[] | 否       | 标签列表                            |
| parentId    | string   | 否       | 父任务ID，创建子任务时使用          |
| treeType    | string   | 否       | 树木类型，默认根据任务类型自动选择  |

**成功响应**：

```json
{
  "code": 201,
  "data": {
    "id": "1003",
    "title": "完成季度报告",
    "description": "整理Q2项目进展情况",
    "type": "WORK",
    "status": "TODO",
    "priority": 2,
    "dueDate": "2023-07-20T10:00:00Z",
    "createdAt": "2023-07-12T15:30:00Z",
    "updatedAt": "2023-07-12T15:30:00Z",
    "completedAt": null,
    "parentId": null,
    "tags": ["项目", "报告"],
    "treeType": "OAK",
    "growthStage": 0
  },
  "message": "Task created successfully",
  "timestamp": 1675487562589
}
```

#### 1.5 更新任务

```
PUT /api/tasks/:id
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 任务唯一ID |

**请求体**：

```json
{
  "title": "更新后的任务标题",
  "description": "更新后的描述",
  "priority": 3,
  "tags": ["更新", "报告"]
}
```

**请求参数说明**：与创建任务相同，但所有字段均为可选，只更新提供的字段。

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "1001",
    "title": "更新后的任务标题",
    "description": "更新后的描述",
    "type": "WORK",
    "status": "TODO",
    "priority": 3,
    "dueDate": "2023-05-20T00:00:00.000Z",
    "createdAt": "2023-05-10T09:00:00.000Z",
    "updatedAt": "2023-05-15T11:45:00.000Z",
    "tags": ["更新", "报告"],
    "treeType": "OAK",
    "growthStage": 1
  },
  "message": "Task updated successfully",
  "timestamp": 1675487562589
}
```

#### 1.6 删除任务

```
DELETE /api/tasks/:id
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 任务唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": null,
  "message": "Task deleted successfully",
  "timestamp": 1675487562589
}
```

#### 1.7 更新任务状态

```
PUT /api/tasks/:id/status
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 任务唯一ID |

**请求体**：

```json
{
  "status": "IN_PROGRESS"
}
```

**请求参数说明**：

| 参数名 | 类型   | 是否必须 | 说明                                           |
|--------|--------|----------|--------------------------------------------|
| status | string | 是       | 任务状态 (TODO, IN_PROGRESS, COMPLETED, CANCELLED) |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "1001",
    "status": "IN_PROGRESS",
    "updatedAt": "2023-07-12T17:30:00Z"
  },
  "message": "Task status updated successfully",
  "timestamp": 1675487562589
}
```

#### 1.8 完成任务

```
POST /api/tasks/:id/complete
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 任务唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "1001",
    "status": "COMPLETED",
    "completedAt": "2023-07-15T09:30:00Z",
    "updatedAt": "2023-07-15T09:30:00Z",
    "growthStage": 4  // 树木成长到最终阶段
  },
  "message": "Task completed successfully",
  "timestamp": 1675487562589
}
```

### 2. 树木管理

#### 2.1 获取树木列表

```
GET /api/trees
```

**请求参数**：

| 参数名 | 类型   | 是否必须 | 说明                           |
|--------|--------|----------|-------------------------------|
| page   | number | 否       | 页码，默认1                   |
| limit  | number | 否       | 每页数量，默认20              |
| type   | string | 否       | 树木类型筛选                   |
| stage  | number | 否       | 生长阶段筛选                   |
| sort   | string | 否       | 排序字段                      |
| order  | string | 否       | 排序方向 (asc, desc)          |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "trees": [
      {
        "id": "tree-1234-abcd",
        "taskId": "abcd-1234-efgh-5678",
        "type": "OAK",
        "stage": 2,
        "position": {
          "x": 10.5,
          "y": 0,
          "z": 15.2
        },
        "rotation": {
          "x": 0,
          "y": 45,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        },
        "createdAt": "2023-07-10T08:00:00Z",
        "lastGrowth": "2023-07-15T10:00:00Z",
        "healthState": 85,
        "task": {
          "id": "abcd-1234-efgh-5678",
          "title": "完成季度报告",
          "status": "IN_PROGRESS"
        }
      }
      // 更多树木...
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  },
  "message": "Success",
  "timestamp": 1675487562589
}
```

#### 2.2 获取单个树木

```
GET /api/trees/:id
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 树木唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "tree-1234-abcd",
    "taskId": "abcd-1234-efgh-5678",
    "type": "OAK",
    "stage": 2,
    "position": {
      "x": 10.5,
      "y": 0,
      "z": 15.2
    },
    "rotation": {
      "x": 0,
      "y": 45,
      "z": 0
    },
    "scale": {
      "x": 1,
      "y": 1,
      "z": 1
    },
    "createdAt": "2023-07-10T08:00:00Z",
    "lastGrowth": "2023-07-15T10:00:00Z",
    "healthState": 85,
    "task": {
      "id": "abcd-1234-efgh-5678",
      "title": "完成季度报告",
      "status": "IN_PROGRESS",
      "progress": 60,
      "dueDate": "2023-07-30T00:00:00Z"
    }
  },
  "message": "Success",
  "timestamp": 1675487562589
}
```

#### 2.3 更新树木

```
PUT /api/trees/:id
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 树木唯一ID |

**请求体**：

```json
{
  "position": {
    "x": 12.0,
    "y": 0,
    "z": 18.5
  },
  "rotation": {
    "y": 90
  },
  "stage": 3
}
```

**请求参数说明**：

| 参数名   | 类型   | 是否必须 | 说明               |
|----------|--------|----------|-------------------|
| position | object | 否       | 位置坐标 (x,y,z)   |
| rotation | object | 否       | 旋转角度 (x,y,z)   |
| scale    | object | 否       | 缩放比例 (x,y,z)   |
| stage    | number | 否       | 生长阶段 (0-4)     |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "tree-1234-abcd",
    "taskId": "abcd-1234-efgh-5678",
    "type": "OAK",
    "stage": 3,
    "position": {
      "x": 12.0,
      "y": 0,
      "z": 18.5
    },
    "rotation": {
      "x": 0,
      "y": 90,
      "z": 0
    },
    "scale": {
      "x": 1,
      "y": 1,
      "z": 1
    },
    "updatedAt": "2023-07-16T14:30:00Z"
  },
  "message": "Tree updated successfully",
  "timestamp": 1675487562589
}
```

#### 2.4 获取任务关联的树木

```
GET /api/trees/by-task/:taskId
```

**路径参数**：

| 参数名  | 类型   | 是否必须 | 说明       |
|---------|--------|----------|------------|
| taskId  | string | 是       | 任务唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "tree-1234-abcd",
    "taskId": "abcd-1234-efgh-5678",
    "type": "OAK",
    "stage": 2,
    "position": {
      "x": 10.5,
      "y": 0,
      "z": 15.2
    },
    "rotation": {
      "x": 0,
      "y": 45,
      "z": 0
    },
    "scale": {
      "x": 1,
      "y": 1,
      "z": 1
    },
    "createdAt": "2023-07-10T08:00:00Z",
    "lastGrowth": "2023-07-15T10:00:00Z",
    "healthState": 85
  },
  "message": "Success",
  "timestamp": 1675487562589
}
```

#### 2.5 获取树木健康状态

```
GET /api/trees/:id/health
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 树木唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "treeId": "tree-1234-abcd",
    "healthState": 85,
    "healthCategory": "HEALTHY",
    "lastUpdated": "2023-07-15T10:30:00Z",
    "task": {
      "id": "abcd-1234-efgh-5678",
      "title": "完成Q2季度报告",
      "progress": 60,
      "deadline": "2023-07-30T00:00:00Z"
    },
    "details": {
      "timeRatio": 0.75,
      "expectedProgress": 25,
      "actualProgress": 60
    }
  },
  "message": "Success",
  "timestamp": 1675487562589
}
```

#### 2.6 更新树木健康状态

```
PUT /api/trees/:id/health
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 树木唯一ID |

**请求体**：

```json
{
  "healthState": 90,
  "notes": "手动调整健康状态"
}
```

**请求参数说明**：

| 参数名      | 类型   | 是否必须 | 说明                 |
|-------------|--------|----------|---------------------|
| healthState | number | 是       | 健康状态值 (0-100)   |
| notes       | string | 否       | 更新说明             |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "treeId": "tree-1234-abcd",
    "healthState": 90,
    "healthCategory": "HEALTHY",
    "lastUpdated": "2023-07-16T08:45:00Z"
  },
  "message": "Tree health updated successfully",
  "timestamp": 1675487562589
}
```

#### 2.7 获取任务与树木健康关联

```
GET /api/tasks/:id/tree-health
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 任务唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "taskId": "abcd-1234-efgh-5678",
    "taskTitle": "完成Q2季度报告",
    "progress": 60,
    "deadline": "2023-07-30T00:00:00Z",
    "tree": {
      "id": "tree-1234-abcd",
      "type": "OAK",
      "stage": 2,
      "healthState": 85,
      "healthCategory": "HEALTHY",
      "lastUpdated": "2023-07-15T10:30:00Z"
    },
    "healthPrediction": {
      "currentTrend": "STABLE",
      "estimatedHealthAt": [
        { "date": "2023-07-20T00:00:00Z", "health": 82 },
        { "date": "2023-07-25T00:00:00Z", "health": 75 },
        { "date": "2023-07-30T00:00:00Z", "health": 65 }
      ],
      "recommendedProgress": 70
    }
  },
  "message": "Success",
  "timestamp": 1675487562589
}
```

#### 2.8 更新任务进度（影响健康状态）

```
PUT /api/tasks/:id/progress
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| id     | string | 是       | 任务唯一ID |

**请求体**：

```json
{
  "progress": 75,
  "notes": "已完成文档的75%"
}
```

**请求参数说明**：

| 参数名   | 类型   | 是否必须 | 说明                 |
|----------|--------|----------|---------------------|
| progress | number | 是       | 任务进度百分比 (0-100) |
| notes    | string | 否       | 进度更新说明         |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "taskId": "abcd-1234-efgh-5678",
    "progress": 75,
    "updatedAt": "2023-07-16T09:30:00Z",
    "tree": {
      "id": "tree-1234-abcd",
      "healthStateBefore": 85,
      "healthStateAfter": 95,
      "healthChange": "+10"
    }
  },
  "message": "Task progress and tree health updated successfully",
  "timestamp": 1675487562589
}
```

#### 2.9 批量更新树木健康状态

```
POST /api/trees/health/batch-update
```

**成功响应**：

```json
{
  "code": 200,
  "data": { 
    "message": "已完成所有树木健康状态更新" 
  },
  "message": "批量更新树木健康状态成功",
  "timestamp": 1675487562589
}
```

### 3. AI 助手

#### 3.1 分析任务

```
POST /api/ai/analyze-task
```

**请求体**：

```json
{
  "task": {
    "id": "abcd-1234-efgh-5678",
    "title": "完成Q2季度报告",
    "description": "整理第二季度项目进展详细报告，需要包含销售数据、客户反馈和团队绩效。"
  }
}
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "taskId": "abcd-1234-efgh-5678",
    "analysis": {
      "complexity": "MEDIUM",
      "estimatedTime": "4-6小时",
      "recommendedTags": ["报告", "销售", "客户反馈", "绩效"],
      "suggestedDeadline": "2023-07-25T00:00:00Z"
    },
    "breakdown": [
      {
        "title": "收集销售数据",
        "description": "从销售系统导出Q2销售数据，整理成报表格式",
        "estimatedDuration": "1-2小时"
      },
      {
        "title": "整理客户反馈",
        "description": "从客户反馈系统提取Q2反馈数据，分析关键点",
        "estimatedDuration": "1-2小时"
      },
      {
        "title": "评估团队绩效",
        "description": "收集团队KPI数据，分析Q2绩效表现",
        "estimatedDuration": "1小时"
      },
      {
        "title": "撰写最终报告",
        "description": "合并所有数据，撰写最终报告文档",
        "estimatedDuration": "2小时"
      }
    ]
  },
  "message": "Task analysis successful",
  "timestamp": 1675487562589
}
```

## 数据模型

### 核心数据模型

#### Task (任务)

```typescript
interface Task {
  id: string;            // 任务唯一标识
  title: string;         // 任务标题
  description?: string;  // 任务描述
  type: TaskType;        // 任务类型
  status: TaskStatus;    // 任务状态
  priority: number;      // 优先级(1-4)
  dueDate?: Date;        // 截止日期
  progress?: number;     // 进度(0-100)
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
  completedAt?: Date;    // 完成时间
  tags: string[];        // 标签数组
  parentId?: string;     // 父任务ID
  children?: Task[];     // 子任务数组
  treeId?: string;       // 关联的树木ID
  treeType: TreeType;    // 对应的树木类型
}

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum TaskType {
  NORMAL = 'NORMAL',
  RECURRING = 'RECURRING',
  PROJECT = 'PROJECT',
  LEARNING = 'LEARNING',
  WORK = 'WORK',
  LEISURE = 'LEISURE'
}
```

#### Tree (树木)

```typescript
interface Tree {
  id: string;            // 树木唯一标识
  taskId: string;        // 关联任务ID
  type: TreeType;        // 树木类型
  stage: number;         // 生长阶段(0-4)
  position: Vector3;     // 位置坐标
  rotation: Vector3;     // 旋转角度
  scale: Vector3;        // 缩放比例
  createdAt: Date;       // 创建时间
  lastGrowth: Date;      // 最后生长时间
  updatedAt: Date;       // 更新时间
  healthState: number;   // 健康状态 (0-100)
}

enum TreeType {
  OAK = 'OAK',           // 橡树
  PINE = 'PINE',         // 松树
  CHERRY = 'CHERRY',     // 樱花树
  MAPLE = 'MAPLE',       // 枫树
  PALM = 'PALM'          // 棕榈树
}
```

## 健康状态系统

### 健康状态分类

树木的健康状态分为四个等级，基于健康值(0-100%)计算：

1. **健康状态**（75-100%）- `HEALTHY`
   - 视觉表现：枝繁叶茂，生机勃勃
   - 特点：树木生长旺盛，叶片翠绿

2. **轻微枯萎**（50-75%）- `SLIGHTLY_WILTED`
   - 视觉表现：部分叶片发黄，生长减缓
   - 特点：树木活力下降，但仍有生机

3. **中度枯萎**（25-50%）- `MODERATELY_WILTED`
   - 视觉表现：大量叶片发黄，枝干干枯
   - 特点：树木明显缺乏活力，生长停滞

4. **严重枯萎**（0-25%）- `SEVERELY_WILTED`
   - 视觉表现：叶片脱落，枝干干裂
   - 特点：树木濒临死亡，急需抢救

### 健康状态计算

健康状态基于以下因素计算：

1. **截止日期接近程度**：距离DDL越近，健康状态越低
2. **任务进度**：进度落后于预期，健康状态下降；进度超前，健康状态回升
3. **时间与进度比**：根据已用时间与完成进度的比例调整健康状态
4. **进度更新奖励**：更新任务进度时，树木健康状态得到小幅提升

## 错误码定义

| 错误码  | 描述                    | 说明                                |
|---------|--------------------------|-------------------------------------|
| 400001  | INVALID_INPUT            | 输入参数无效                        |
| 400002  | MISSING_REQUIRED_FIELD   | 缺少必填字段                        |
| 400003  | VALUE_OUT_OF_RANGE       | 值超出允许范围                      |
| 404001  | TASK_NOT_FOUND           | 任务未找到                          |
| 404002  | TREE_NOT_FOUND           | 树木未找到                          |
| 409001  | DUPLICATE_RESOURCE       | 资源重复冲突                        |
| 500001  | DATABASE_ERROR           | 数据库操作错误                      |
| 500002  | INTERNAL_SERVER_ERROR    | 服务器内部错误                      |

## 版本历史

| 版本  | 日期        | 描述                               |
|-------|------------|------------------------------------|
| 1.0.0 | 2023-07-10 | 初始版本，包含基本的任务和树木管理  |
| 1.1.0 | 2023-08-01 | 添加树木健康状态系统               |
| 1.2.0 | 2023-09-15 | 添加AI助手功能                     | 