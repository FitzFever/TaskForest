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
| status  | string | 否       | 任务状态筛选 (TODO, IN_PROGRESS, COMPLETED, CANCELLED)   |
| type    | string | 否       | 任务类型筛选 (NORMAL, RECURRING, PROJECT, 等)            |
| dueDate | string | 否       | 截止日期筛选，ISO8601格式 (YYYY-MM-DD)                   |
| tags    | string | 否       | 标签筛选，多个标签用逗号分隔                             |
| sort    | string | 否       | 排序字段 (dueDate, createdAt, priority, 等)             |
| order   | string | 否       | 排序方向 (asc, desc)，默认desc                          |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "tasks": [
      {
        "id": "1234-5678-90ab-cdef",
        "title": "完成项目报告",
        "description": "整理季度项目进展情况",
        "type": "WORK",
        "status": "TODO",
        "priority": 2,
        "dueDate": "2023-07-20T10:00:00Z",
        "createdAt": "2023-07-10T08:00:00Z",
        "updatedAt": "2023-07-10T08:00:00Z",
        "completedAt": null,
        "parentId": null,
        "tags": ["项目", "报告"],
        "treeType": "OAK",
        "growthStage": 1
      },
      // 更多任务...
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  },
  "message": "Success",
  "timestamp": 1625097600000
}
```

#### 1.2 获取单个任务

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
    "id": "1234-5678-90ab-cdef",
    "title": "完成项目报告",
    "description": "整理季度项目进展情况",
    "type": "WORK",
    "status": "TODO",
    "priority": 2,
    "dueDate": "2023-07-20T10:00:00Z",
    "createdAt": "2023-07-10T08:00:00Z",
    "updatedAt": "2023-07-10T08:00:00Z",
    "completedAt": null,
    "parentId": null,
    "tags": ["项目", "报告"],
    "treeType": "OAK",
    "growthStage": 1,
    "children": []  // 子任务列表
  },
  "message": "Success",
  "timestamp": 1625097600000
}
```

#### 1.3 创建任务

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
    "id": "abcd-1234-efgh-5678",
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
  "timestamp": 1625097600000
}
```

#### 1.4 更新任务

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
  "title": "完成Q2季度报告",
  "description": "整理第二季度项目进展详细报告",
  "priority": 1,
  "dueDate": "2023-07-22T10:00:00Z",
  "tags": ["项目", "报告", "重要"]
}
```

**请求参数说明**：与创建任务相同，但所有字段均为可选，只更新提供的字段。

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "abcd-1234-efgh-5678",
    "title": "完成Q2季度报告",
    "description": "整理第二季度项目进展详细报告",
    "type": "WORK",
    "status": "TODO",
    "priority": 1,
    "dueDate": "2023-07-22T10:00:00Z",
    "createdAt": "2023-07-12T15:30:00Z",
    "updatedAt": "2023-07-12T16:45:00Z",
    "completedAt": null,
    "parentId": null,
    "tags": ["项目", "报告", "重要"],
    "treeType": "OAK",
    "growthStage": 0
  },
  "message": "Task updated successfully",
  "timestamp": 1625097600000
}
```

#### 1.5 删除任务

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
  "timestamp": 1625097600000
}
```

#### 1.6 更新任务状态

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
    "id": "abcd-1234-efgh-5678",
    "status": "IN_PROGRESS",
    "updatedAt": "2023-07-12T17:30:00Z"
  },
  "message": "Task status updated successfully",
  "timestamp": 1625097600000
}
```

#### 1.7 完成任务

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
    "id": "abcd-1234-efgh-5678",
    "status": "COMPLETED",
    "completedAt": "2023-07-15T09:30:00Z",
    "updatedAt": "2023-07-15T09:30:00Z",
    "growthStage": 4  // 树木成长到最终阶段
  },
  "message": "Task completed successfully",
  "timestamp": 1625097600000
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
| page   | number | 否       | 页码，默认1                    |
| limit  | number | 否       | 每页数量，默认20               |
| type   | string | 否       | 树木类型筛选                   |
| stage  | number | 否       | 生长阶段筛选 (0-4)             |
| sort   | string | 否       | 排序字段 (createdAt, lastGrowth) |
| order  | string | 否       | 排序方向 (asc, desc)           |

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
          "y": 0.0,
          "z": -5.2
        },
        "rotation": {
          "x": 0.0,
          "y": 0.78,
          "z": 0.0
        },
        "scale": {
          "x": 1.0,
          "y": 1.0,
          "z": 1.0
        },
        "createdAt": "2023-07-12T15:30:00Z",
        "lastGrowth": "2023-07-14T10:15:00Z",
        "healthState": 85,
        "task": {
          "title": "完成Q2季度报告",
          "status": "IN_PROGRESS"
        }
      },
      // 更多树木...
    ],
    "pagination": {
      "total": 38,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  },
  "message": "Success",
  "timestamp": 1625097600000
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
      "y": 0.0,
      "z": -5.2
    },
    "rotation": {
      "x": 0.0,
      "y": 0.78,
      "z": 0.0
    },
    "scale": {
      "x": 1.0,
      "y": 1.0,
      "z": 1.0
    },
    "createdAt": "2023-07-12T15:30:00Z",
    "lastGrowth": "2023-07-14T10:15:00Z",
    "healthState": 85,
    "task": {
      "id": "abcd-1234-efgh-5678",
      "title": "完成Q2季度报告",
      "description": "整理第二季度项目进展详细报告",
      "status": "IN_PROGRESS",
      "dueDate": "2023-07-22T10:00:00Z"
    }
  },
  "message": "Success",
  "timestamp": 1625097600000
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
    "y": 0.0,
    "z": -6.5
  },
  "rotation": {
    "x": 0.0,
    "y": 1.57,
    "z": 0.0
  },
  "scale": {
    "x": 1.2,
    "y": 1.2,
    "z": 1.2
  }
}
```

**请求参数说明**：

| 参数名   | 类型   | 是否必须 | 说明           |
|----------|--------|----------|----------------|
| position | object | 否       | 位置坐标       |
| rotation | object | 否       | 旋转角度       |
| scale    | object | 否       | 缩放比例       |
| stage    | number | 否       | 生长阶段 (0-4) |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "tree-1234-abcd",
    "position": {
      "x": 12.0,
      "y": 0.0,
      "z": -6.5
    },
    "rotation": {
      "x": 0.0,
      "y": 1.57,
      "z": 0.0
    },
    "scale": {
      "x": 1.2,
      "y": 1.2,
      "z": 1.2
    },
    "updatedAt": "2023-07-15T11:20:00Z"
  },
  "message": "Tree updated successfully",
  "timestamp": 1625097600000
}
```

#### 2.4 获取任务关联的树木

```
GET /api/trees/by-task/:taskId
```

**路径参数**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| taskId | string | 是       | 任务唯一ID |

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
      "x": 12.0,
      "y": 0.0,
      "z": -6.5
    },
    "rotation": {
      "x": 0.0,
      "y": 1.57,
      "z": 0.0
    },
    "scale": {
      "x": 1.2,
      "y": 1.2,
      "z": 1.2
    },
    "createdAt": "2023-07-12T15:30:00Z",
    "lastGrowth": "2023-07-14T10:15:00Z",
    "healthState": 85
  },
  "message": "Success",
  "timestamp": 1625097600000
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

**请求参数说明**：

| 参数名 | 类型   | 是否必须 | 说明     |
|--------|--------|----------|----------|
| task   | object | 是       | 任务对象 |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "analysis": {
      "complexity": "medium",
      "estimatedHours": 8,
      "keyPoints": [
        "收集销售数据",
        "整理客户反馈",
        "汇总团队绩效",
        "图表数据可视化",
        "报告撰写和格式化"
      ],
      "suggestedDeadline": "2023-07-21T12:00:00Z",
      "recommendation": "建议将此任务拆分为子任务，分别处理数据收集、分析和报告撰写环节。"
    }
  },
  "message": "Task analysis completed",
  "timestamp": 1625097600000
}
```

#### 3.2 任务拆解

```
POST /api/ai/breakdown-task
```

**请求体**：

```json
{
  "taskId": "abcd-1234-efgh-5678"
}
```

**请求参数说明**：

| 参数名 | 类型   | 是否必须 | 说明       |
|--------|--------|----------|------------|
| taskId | string | 是       | 任务唯一ID |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "parentTask": {
      "id": "abcd-1234-efgh-5678",
      "title": "完成Q2季度报告"
    },
    "subtasks": [
      {
        "id": "sub-1111-aaaa",
        "title": "收集Q2销售数据",
        "description": "从CRM系统导出Q2销售数据，包括总销售额、产品销售明细和区域分布",
        "type": "WORK",
        "priority": 2,
        "dueDate": "2023-07-18T10:00:00Z",
        "status": "TODO"
      },
      {
        "id": "sub-2222-bbbb",
        "title": "整理客户反馈和满意度调查",
        "description": "汇总Q2客户反馈信息和满意度调查结果，标注关键问题和改进点",
        "type": "WORK",
        "priority": 2,
        "dueDate": "2023-07-19T10:00:00Z",
        "status": "TODO"
      },
      {
        "id": "sub-3333-cccc",
        "title": "汇总团队绩效数据",
        "description": "收集各团队Q2绩效报告，包括目标完成情况、加班时间和项目延期情况",
        "type": "WORK",
        "priority": 2,
        "dueDate": "2023-07-19T10:00:00Z",
        "status": "TODO"
      },
      {
        "id": "sub-4444-dddd",
        "title": "创建报表和数据可视化",
        "description": "将收集的数据制作成图表和数据可视化，准备插入报告",
        "type": "WORK",
        "priority": 1,
        "dueDate": "2023-07-20T16:00:00Z",
        "status": "TODO"
      },
      {
        "id": "sub-5555-eeee",
        "title": "撰写并格式化最终报告",
        "description": "编写报告文字内容，整合数据图表，并按照公司模板格式化",
        "type": "WORK",
        "priority": 1,
        "dueDate": "2023-07-21T16:00:00Z",
        "status": "TODO"
      }
    ]
  },
  "message": "Task breakdown completed",
  "timestamp": 1625097600000
}
```

#### 3.3 获取任务建议

```
POST /api/ai/suggestions
```

**请求体**：

```json
{
  "context": {
    "completedTasks": 25,
    "overdueTasks": 3,
    "upcomingDeadlines": 5,
    "focusTime": "10:00-12:00",
    "currentTime": "2023-07-15T09:30:00Z"
  }
}
```

**请求参数说明**：

| 参数名  | 类型   | 是否必须 | 说明                 |
|---------|--------|----------|---------------------|
| context | object | 是       | 用户上下文信息       |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "suggestions": [
      {
        "type": "PRIORITY",
        "title": "处理即将逾期的任务",
        "description": "您有3个任务已逾期，建议优先处理这些任务",
        "relatedTasks": ["task-id-1", "task-id-2", "task-id-3"]
      },
      {
        "type": "SCHEDULE",
        "title": "安排专注工作时段",
        "description": "根据您的工作习惯，10:00-12:00是您的高效时段，建议安排复杂任务在此时间段完成"
      },
      {
        "type": "BREAKDOWN",
        "title": "拆解复杂任务",
        "description": "您有2个大型任务截止日期临近，建议将其拆分为更小的子任务以提高完成效率",
        "relatedTasks": ["task-id-4", "task-id-5"]
      }
    ]
  },
  "message": "Suggestions generated",
  "timestamp": 1625097600000
}
```

### 4. 设置管理

#### 4.1 获取用户设置

```
GET /api/settings
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "theme": "light",
    "notifications": {
      "enabled": true,
      "dueDateReminder": 24,
      "dailyDigest": true
    },
    "display": {
      "taskListView": "kanban",
      "defaultSortField": "dueDate",
      "defaultSortOrder": "asc"
    },
    "forest": {
      "renderQuality": "high",
      "autoRotate": true,
      "weatherEffects": true,
      "ambientSound": true
    }
  },
  "message": "Success",
  "timestamp": 1625097600000
}
```

#### 4.2 更新用户设置

```
PUT /api/settings
```

**请求体**：

```json
{
  "theme": "dark",
  "notifications": {
    "dueDateReminder": 48
  },
  "forest": {
    "renderQuality": "medium",
    "weatherEffects": false
  }
}
```

**请求参数说明**：只需提供需要更新的设置项。

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "theme": "dark",
    "notifications": {
      "enabled": true,
      "dueDateReminder": 48,
      "dailyDigest": true
    },
    "display": {
      "taskListView": "kanban",
      "defaultSortField": "dueDate",
      "defaultSortOrder": "asc"
    },
    "forest": {
      "renderQuality": "medium",
      "autoRotate": true,
      "weatherEffects": false,
      "ambientSound": true
    }
  },
  "message": "Settings updated successfully",
  "timestamp": 1625097600000
}
```

### 5. 数据同步与备份

#### 5.1 数据同步

```
POST /api/sync
```

**请求体**：

```json
{
  "lastSyncTimestamp": 1625097000000,
  "changes": {
    "tasks": {
      "created": [],
      "updated": [],
      "deleted": []
    },
    "trees": {
      "created": [],
      "updated": [],
      "deleted": []
    },
    "settings": {
      "updated": false
    }
  }
}
```

**请求参数说明**：

| 参数名           | 类型    | 是否必须 | 说明                       |
|------------------|---------|----------|--------------------------|
| lastSyncTimestamp| number  | 是       | 上次同步时间戳             |
| changes          | object  | 是       | 客户端变更数据             |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "syncTimestamp": 1625097800000,
    "changes": {
      "tasks": {
        "created": [],
        "updated": [
          {
            "id": "task-id-1",
            "updatedAt": 1625097700000,
            "data": { /* 任务完整数据 */ }
          }
        ],
        "deleted": []
      },
      "trees": {
        "created": [],
        "updated": [
          {
            "id": "tree-id-1",
            "updatedAt": 1625097700000,
            "data": { /* 树木完整数据 */ }
          }
        ],
        "deleted": []
      },
      "settings": {
        "updated": false,
        "data": null
      }
    },
    "conflicts": []
  },
  "message": "Sync completed",
  "timestamp": 1625097600000
}
```

#### 5.2 数据备份

```
POST /api/backup
```

**请求体**：无

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "backupId": "backup-2023-07-15-093000",
    "timestamp": 1625097600000,
    "size": 256000,
    "downloadUrl": "/api/backup/download/backup-2023-07-15-093000"
  },
  "message": "Backup created successfully",
  "timestamp": 1625097600000
}
```

#### 5.3 数据恢复

```
POST /api/restore
```

**请求体**：

```json
{
  "backupId": "backup-2023-07-15-093000"
}
```

或使用表单上传备份文件。

**请求参数说明**：

| 参数名    | 类型   | 是否必须 | 说明             |
|-----------|--------|----------|----------------|
| backupId  | string | 否       | 备份ID          |
| file      | file   | 否       | 备份文件        |

注：backupId 和 file 二选一提供。

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "restoredAt": 1625097800000,
    "tasksCount": 45,
    "treesCount": 38
  },
  "message": "Data restored successfully",
  "timestamp": 1625097600000
}
```

## 错误代码与描述

| 错误代码             | HTTP状态码 | 描述                               |
|----------------------|------------|-----------------------------------|
| INVALID_REQUEST      | 400        | 请求参数无效                       |
| VALIDATION_ERROR     | 400        | 数据验证失败                       |
| UNAUTHORIZED         | 401        | 未授权访问                         |
| FORBIDDEN            | 403        | 权限不足                           |
| NOT_FOUND            | 404        | 资源不存在                         |
| CONFLICT             | 409        | 资源冲突                           |
| INTERNAL_ERROR       | 500        | 服务器内部错误                     |
| DATABASE_ERROR       | 500        | 数据库操作失败                     |
| AI_REQUEST_FAILED    | 500        | AI 服务请求失败                    |
| SYNC_CONFLICT        | 409        | 数据同步冲突                       |
| BACKUP_FAILED        | 500        | 备份创建失败                       |
| RESTORE_FAILED       | 500        | 数据恢复失败                       |

## 接口版本管理

API 版本通过 URL 路径控制，格式为 `/api/v{n}/resource`，例如：

- `/api/v1/tasks`
- `/api/v2/tasks`

当前最新版本为 v1。

## 接口变更日志

### v1 (当前版本)
- 初始 API 版本
- 包含任务管理、树木管理、AI 助手、设置管理和数据同步功能

## 附录

### 数据模型

#### Task (任务)

```typescript
interface Task {
  id: string;            // 任务唯一标识
  title: string;         // 任务标题
  description: string;   // 任务描述
  type: TaskType;        // 任务类型
  status: TaskStatus;    // 任务状态
  priority: number;      // 优先级
  dueDate: Date;         // 截止日期
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
  completedAt?: Date;    // 完成时间
  parentId?: string;     // 父任务ID
  tags: string[];        // 标签
  treeType: TreeType;    // 对应的树木类型
  growthStage: number;   // 生长阶段 (0-4)
}

enum TaskType {
  NORMAL = 'NORMAL',       // 普通任务
  RECURRING = 'RECURRING', // 重复任务
  PROJECT = 'PROJECT',     // 项目任务
  LEARNING = 'LEARNING',   // 学习任务
  WORK = 'WORK',           // 工作任务
  LEISURE = 'LEISURE'      // 休闲任务
}

enum TaskStatus {
  TODO = 'TODO',           // 待办
  IN_PROGRESS = 'IN_PROGRESS', // 进行中
  COMPLETED = 'COMPLETED',     // 已完成
  CANCELLED = 'CANCELLED'      // 已取消
}
```

#### Tree (树木)

```typescript
interface Tree {
  id: string;            // 树木唯一标识
  taskId: string;        // 关联任务ID
  type: TreeType;        // 树木类型
  stage: number;         // 生长阶段
  position: Vector3;     // 位置坐标
  rotation: Vector3;     // 旋转角度
  scale: Vector3;        // 缩放比例
  createdAt: Date;       // 创建时间
  lastGrowth: Date;      // 最后生长时间
  healthState: number;   // 健康状态 (0-100)
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

interface Vector3 {
  x: number;
  y: number;
  z: number;
}