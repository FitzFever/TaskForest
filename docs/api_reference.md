# TaskForest API 接口规范文档

本文档详细描述了 TaskForest 项目的 API 接口规范，供前端和后端开发参考。

## API 基础信息

- **服务器地址**：`http://localhost:9000`
- **基础URL**：`/api`
- **完整API路径**：`http://localhost:9000/api`
- **内容类型**：`application/json`
- **字符编码**：UTF-8
- **版本控制**：在URL中包含版本号，如 `/api/v1/tasks`
- **Swagger文档**：`http://localhost:9000/api-docs`

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
| type        | string   | 是       | 任务类型 (NORMAL, RECURRING, PROJECT, LEARNING, WORK, LEISURE) |
| priority    | number   | 否       | 优先级(1-5)，默认3                  |
| dueDate     | string   | 是       | 截止日期，ISO8601格式               |
| tags        | string[] | 否       | 标签列表                            |
| parentId    | string   | 否       | 父任务ID，创建子任务时使用          |
| treeType    | string   | 否       | 树木类型，若不指定则根据任务类型自动映射 |
| autoCreateTree | boolean | 否     | 是否自动创建关联树木，默认为true    |

**任务类型与树木类型的自动映射关系**:

系统会根据任务类型自动选择对应的树木类型：

| 任务类型    | 自动映射的树木类型 | 说明           |
|------------|-------------------|----------------|
| NORMAL     | OAK               | 普通日常任务 -> 橡树 |
| RECURRING  | PINE              | 定期重复任务 -> 松树 |
| PROJECT    | WILLOW            | 长期项目任务 -> 柳树 |
| LEARNING   | APPLE             | 学习类任务 -> 苹果树 |
| WORK       | MAPLE             | 工作类任务 -> 枫树   |
| LEISURE    | PALM              | 休闲类任务 -> 棕榈树 |

用户也可以通过`treeType`参数手动指定树木类型，将覆盖自动映射的结果。

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

### 2. 通知管理

#### 2.1 获取通知列表

```
GET /api/notifications
```

**请求参数**：

| 参数名    | 类型    | 是否必须 | 说明                                               |
|-----------|---------|----------|--------------------------------------------------|
| page      | number  | 否       | 页码，默认1                                       |
| limit     | number  | 否       | 每页数量，默认20                                  |
| read      | boolean | 否       | 通知已读状态 (true, false)                        |
| type      | string  | 否       | 通知类型 (DUE_DATE, TREE_HEALTH, TASK_ASSIGNED, TASK_UPDATED, SYSTEM)  |
| priority  | string  | 否       | 通知优先级 (LOW, MEDIUM, HIGH, CRITICAL)          |
| startDate | string  | 否       | 开始日期，格式为 YYYY-MM-DD                       |
| endDate   | string  | 否       | 结束日期，格式为 YYYY-MM-DD                       |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "notifications": [
      {
        "id": "2001",
        "title": "任务即将到期: 完成项目报告",
        "message": "您的任务 \"完成项目报告\" 将在 2023年5月20日 到期，请及时完成。",
        "type": "DUE_DATE",
        "priority": "HIGH",
        "createdAt": "2023-05-19T09:00:00.000Z",
        "read": false,
        "readAt": null,
        "taskId": "1001",
        "data": {
          "taskTitle": "完成项目报告",
          "dueDate": "2023-05-20T00:00:00.000Z",
          "priority": 3
        }
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "message": "获取通知列表成功",
  "timestamp": 1675487562589
}
```

#### 2.2 获取通知统计

```
GET /api/notifications/stats
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "total": 8,
    "unread": 3,
    "typeStats": {
      "DUE_DATE": 2,
      "TREE_HEALTH": 1,
      "TASK_ASSIGNED": 3,
      "TASK_UPDATED": 1,
      "SYSTEM": 1
    }
  },
  "message": "获取通知统计成功",
  "timestamp": 1675487562589
}
```

#### 2.3 创建通知

```
POST /api/notifications
```

**请求体**：

```json
{
  "title": "任务即将到期: 完成项目报告",
  "message": "您的任务 \"完成项目报告\" 将在 2023年5月20日 到期，请及时完成。",
  "type": "DUE_DATE",
  "priority": "HIGH",
  "taskId": "1001",
  "data": {
    "taskTitle": "完成项目报告",
    "dueDate": "2023-05-20T00:00:00.000Z",
    "priority": 3
  }
}
```

**成功响应**：

```json
{
  "code": 201,
  "data": {
    "id": "2001",
    "title": "任务即将到期: 完成项目报告",
    "message": "您的任务 \"完成项目报告\" 将在 2023年5月20日 到期，请及时完成。",
    "type": "DUE_DATE",
    "priority": "HIGH",
    "createdAt": "2023-05-19T09:00:00.000Z",
    "read": false,
    "readAt": null,
    "taskId": "1001",
    "data": {
      "taskTitle": "完成项目报告",
      "dueDate": "2023-05-20T00:00:00.000Z",
      "priority": 3
    }
  },
  "message": "创建通知成功",
  "timestamp": 1675487562589
}
```

#### 2.4 获取单个通知

```
GET /api/notifications/:id
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "2001",
    "title": "任务即将到期: 完成项目报告",
    "message": "您的任务 \"完成项目报告\" 将在 2023年5月20日 到期，请及时完成。",
    "type": "DUE_DATE",
    "priority": "HIGH",
    "createdAt": "2023-05-19T09:00:00.000Z",
    "read": false,
    "readAt": null,
    "taskId": "1001",
    "data": {
      "taskTitle": "完成项目报告",
      "dueDate": "2023-05-20T00:00:00.000Z",
      "priority": 3
    }
  },
  "message": "获取通知成功",
  "timestamp": 1675487562589
}
```

#### 2.5 标记通知为已读

```
PATCH /api/notifications/:id/read
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "2001",
    "read": true,
    "readAt": "2023-05-19T10:15:30.000Z"
  },
  "message": "通知已标记为已读",
  "timestamp": 1675487562589
}
```

#### 2.6 标记所有通知为已读

```
PATCH /api/notifications/read-all
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "success": true,
    "count": 3
  },
  "message": "所有通知已标记为已读",
  "timestamp": 1675487562589
}
```

#### 2.7 删除通知

```
DELETE /api/notifications/:id
```

**成功响应**：

```json
{
  "code": 204,
  "data": null,
  "message": "通知删除成功",
  "timestamp": 1675487562589
}
```

#### 2.8 清除所有通知

```
DELETE /api/notifications
```

**成功响应**：

```json
{
  "code": 204,
  "data": null,
  "message": "所有通知已清除",
  "timestamp": 1675487562589
}
```

#### 2.9 获取通知设置

```
GET /api/notifications/settings
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "enabled": true,
    "dueDateReminderHours": 24,
    "dailyDigestEnabled": true,
    "desktopNotificationsEnabled": true,
    "inAppNotificationsEnabled": true,
    "emailNotificationsEnabled": false
  },
  "message": "获取通知设置成功",
  "timestamp": 1675487562589
}
```

#### 2.10 更新通知设置

```
PUT /api/notifications/settings
```

**请求体**：

```json
{
  "enabled": true,
  "dueDateReminderHours": 48,
  "dailyDigestEnabled": false,
  "desktopNotificationsEnabled": true,
  "inAppNotificationsEnabled": true,
  "emailNotificationsEnabled": true
}
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "enabled": true,
    "dueDateReminderHours": 48,
    "dailyDigestEnabled": false,
    "desktopNotificationsEnabled": true,
    "inAppNotificationsEnabled": true,
    "emailNotificationsEnabled": true
  },
  "message": "更新通知设置成功",
  "timestamp": 1675487562589
}
```

#### 2.11 测试通知功能

```
POST /api/notifications/test
```

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "id": "test-001",
    "title": "测试通知",
    "message": "这是一条测试通知，用于验证通知功能是否正常工作。",
    "type": "SYSTEM",
    "priority": "MEDIUM",
    "createdAt": "2023-05-19T10:30:00.000Z",
    "read": false
  },
  "message": "测试通知已发送",
  "timestamp": 1675487562589
}
```

### 3. AI 智能助手

#### 3.1 任务分析

```
POST /api/analyze
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| taskId | string | 否 | 任务ID |
| title | string | 是 | 任务标题 |
| description | string | 否 | 任务详细描述 |

**请求示例：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "description": "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。"
}
```

**响应参数：**

| 参数名 | 类型 | 描述 |
|-------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 分析结果 |
| data.taskId | string | 任务ID |
| data.title | string | 任务标题 |
| data.complexity | string | 任务复杂度，可能为SIMPLE、MEDIUM或COMPLEX |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "taskId": "task-123",
    "title": "实现用户登录功能",
    "complexity": "MEDIUM"
  }
}
```

#### 3.2 任务拆解

```
POST /api/decompose
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| taskId | string | 否 | 任务ID |
| title | string | 是 | 任务标题 |
| description | string | 否 | 任务详细描述 |
| complexity | string | 否 | 任务复杂度，可为SIMPLE、MEDIUM或COMPLEX |

**URL查询参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| createTasks | boolean | 否 | 是否创建实际任务，默认为false |
| createTrees | boolean | 否 | 是否创建相关树木，默认为true。仅当createTasks为true时有效 |

**请求示例：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "description": "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。",
  "complexity": "MEDIUM"
}
```

**响应参数：**

| 参数名 | 类型 | 描述 |
|-------|------|------|
| success | boolean | 请求是否成功 |
| data | array | 子任务列表（如createTasks=false）或创建结果（如createTasks=true） |

**响应示例（createTasks=false）：**

```json
{
  "success": true,
  "data": [
    {
      "title": "设计登录表单界面",
      "description": "创建用户登录表单，包括用户名/邮箱输入框、密码输入框和登录按钮。",
      "estimatedHours": 2
    },
    {
      "title": "实现表单验证",
      "description": "添加前端表单验证，包括非空检查、邮箱格式验证和密码长度验证。",
      "estimatedHours": 1.5
    },
    // ... 更多子任务
  ]
}
```

**响应示例（createTasks=true）：**

```json
{
  "success": true,
  "data": {
    "mainTask": {
      "id": "task-123",
      "title": "实现用户登录功能",
      "description": "开发一个完整的用户登录功能...",
      "status": "TODO",
      "complexity": "MEDIUM",
      "createdAt": "2023-08-01T12:00:00Z"
    },
    "subTasks": [
      {
        "id": "subtask-1",
        "title": "设计登录表单界面",
        "description": "创建用户登录表单...",
        "status": "TODO",
        "parentTaskId": "task-123",
        "estimatedHours": 2,
        "createdAt": "2023-08-01T12:00:00Z"
      },
      // ... 更多子任务
    ],
    "trees": {
      "mainTree": {
        "id": "tree-1",
        "taskId": "task-123",
        "type": "REDWOOD",
        "health": 100,
        "createdAt": "2023-08-01T12:00:00Z"
      },
      "subTrees": [
        {
          "id": "tree-2",
          "taskId": "subtask-1",
          "type": "OAK",
          "parentTreeId": "tree-1",
          "health": 100,
          "createdAt": "2023-08-01T12:00:00Z"
        },
        // ... 更多子树
      ]
    }
  }
}
```

#### 3.3 批量创建任务

```
POST /api/tasks/batch
```

**请求体**：

```json
{
  "mainTask": {
    "title": "准备Q2季度报告",
    "description": "准备Q2季度报告，包括销售数据整理、客户反馈分析和团队绩效评估",
    "type": "PROJECT",
    "priority": 1,
    "dueDate": "2023-08-15T00:00:00Z",
    "tags": ["报告", "季度总结", "数据分析"]
  },
  "subTasks": [
    {
      "title": "收集Q2销售数据",
      "description": "从CRM系统导出Q2销售数据，包括总销售额、产品销售明细和区域分布",
      "type": "WORK",
      "priority": 2,
      "dueDate": "2023-08-05T00:00:00Z",
      "tags": ["数据收集", "销售"]
    },
    // ... 其他子任务
  ],
  "createTrees": true
}
```

**请求参数说明**：

| 参数名      | 类型    | 是否必须 | 说明                               |
|-------------|---------|----------|-----------------------------------|
| mainTask    | object  | 是       | 主任务对象                         |
| subTasks    | array   | 是       | 子任务对象数组                     |
| createTrees | boolean | 否       | 是否同时创建关联树木，默认为true   |

**成功响应**：

```json
{
  "code": 200,
  "data": {
    "mainTask": {
      "id": "task-main-1234",
      "title": "准备Q2季度报告",
      "description": "准备Q2季度报告，包括销售数据整理、客户反馈分析和团队绩效评估",
      "type": "PROJECT",
      "priority": 1,
      "dueDate": "2023-08-15T00:00:00Z",
      "status": "TODO",
      "createdAt": "2023-07-20T09:30:00Z",
      "tags": ["报告", "季度总结", "数据分析"],
      "treeId": "tree-main-5678",
      "subTaskIds": ["task-sub-1111", "task-sub-2222", "task-sub-3333", "task-sub-4444", "task-sub-5555"]
    },
    "subTasks": [
      {
        "id": "task-sub-1111",
        "title": "收集Q2销售数据",
        "description": "从CRM系统导出Q2销售数据，包括总销售额、产品销售明细和区域分布",
        "type": "WORK",
        "priority": 2,
        "dueDate": "2023-08-05T00:00:00Z",
        "status": "TODO",
        "createdAt": "2023-07-20T09:30:00Z",
        "tags": ["数据收集", "销售"],
        "parentTaskId": "task-main-1234",
        "treeId": "tree-sub-1111"
      },
      // ... 其他创建的子任务
    ],
    "trees": {
      "mainTree": {
        "id": "tree-main-5678",
        "taskId": "task-main-1234",
        "type": "WILLOW",
        "stage": 0,
        "position": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "healthState": 100,
        "createdAt": "2023-07-20T09:30:00Z",
        "subTreeIds": ["tree-sub-1111", "tree-sub-2222", "tree-sub-3333", "tree-sub-4444", "tree-sub-5555"]
      },
      "subTrees": [
        // ... 创建的子树木
      ]
    }
  },
  "message": "批量创建任务和树木成功",
  "timestamp": 1679568234000
}
```

### 4. 树木管理

#### 4.1 获取树木列表

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

#### 4.2 获取单个树木

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

#### 4.3 更新树木

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
| stage    | number | 否       | 生长阶段 (0-3)     |

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

#### 4.4 获取任务关联的树木

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

#### 4.5 获取树木健康状态

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

#### 4.6 更新树木健康状态

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

#### 4.7 获取任务与树木健康关联

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

#### 4.8 更新任务进度（影响健康状态）

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

#### 4.9 批量更新树木健康状态

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

### 8. 文本到任务转换

#### 8.1 从文本生成任务和任务树

```
POST /api/text-to-task
```

将长文本内容分析并转换为结构化任务和任务树。系统会使用DeepSeek AI智能分析文本内容，提取核心任务信息，分析任务复杂度，并拆解为合理的子任务结构。

**请求参数：**

| 参数名 | 类型 | 是否必须 | 说明 |
|--------|------|----------|------|
| text | string | 是 | 要分析的文本内容，如项目需求、会议记录等 |
| createTree | boolean | 否 | 是否同时创建任务树，默认为true |
| treeType | string | 否 | 树木类型 (OAK, PINE, MAPLE, CHERRY, WILLOW)，默认为OAK |

**请求示例：**

```json
{
  "text": "我们需要实现一个在线学习平台的用户管理模块，包含以下功能：\n1. 用户注册与登录：\n   - 支持邮箱注册、手机号注册\n   - 支持密码登录和验证码登录\n   - 实现第三方登录（微信、QQ）...",
  "createTree": true,
  "treeType": "PINE"
}
```

**成功响应：**

```json
{
  "success": true,
  "message": "成功从文本生成任务",
  "data": {
    "analysis": {
      "taskId": "f1d2e3b4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
      "title": "在线学习平台用户管理模块",
      "complexity": "HIGH",
      "description": "实现包含用户注册、登录、个人信息管理和权限控制的用户管理系统"
    },
    "tasks": {
      "mainTask": {
        "id": "f1d2e3b4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
        "title": "在线学习平台用户管理模块",
        "description": "实现包含用户注册、登录、个人信息管理和权限控制的用户管理系统",
        "complexity": "HIGH",
        "type": "PROJECT",
        "priority": "HIGH"
      },
      "subTasks": [
        {
          "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          "title": "用户注册功能开发",
          "description": "实现邮箱注册、手机号注册功能，包含表单验证和安全措施",
          "estimatedHours": 8,
          "parentTaskId": "f1d2e3b4-5a6b-7c8d-9e0f-1a2b3c4d5e6f"
        },
        {
          "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
          "title": "用户登录系统实现",
          "description": "开发密码登录、验证码登录和第三方登录功能",
          "estimatedHours": 10,
          "parentTaskId": "f1d2e3b4-5a6b-7c8d-9e0f-1a2b3c4d5e6f"
        },
        // ... 更多子任务
      ],
      "tree": {
        "id": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
        "name": "在线学习平台用户管理模块 任务树",
        "type": "PINE",
        "rootTaskId": "f1d2e3b4-5a6b-7c8d-9e0f-1a2b3c4d5e6f"
      }
    }
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "message": "从文本生成任务失败",
  "error": "文本内容不能为空"
}
```

**注意事项：**

1. 文本内容越详细和结构化，AI分析的结果越准确
2. 任务拆解的粒度和子任务数量会根据任务复杂度自动调整
3. API调用可能需要较长处理时间，建议使用异步处理
4. 文本长度限制为10MB

#### 8.2 文本分析进度查询

```
GET /api/text-to-task/:jobId/status
```

查询长文本分析任务的处理状态，用于异步处理大型文本内容的进度追踪。

**路径参数：**

| 参数名 | 类型 | 是否必须 | 说明 |
|--------|------|----------|------|
| jobId | string | 是 | 文本分析任务ID，从提交分析请求响应中获取 |

**成功响应：**

```json
{
  "success": true,
  "data": {
    "jobId": "job-1234-5678-90ab-cdef",
    "status": "COMPLETED",  // 可能值: PENDING, PROCESSING, COMPLETED, FAILED
    "progress": 100,
    "message": "分析完成",
    "startTime": "2023-10-01T12:30:45Z",
    "endTime": "2023-10-01T12:31:30Z"
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "message": "任务状态查询失败",
  "error": "找不到指定任务ID"
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
  stage: number;         // 生长阶段(0-3)
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

## 相关文档

为了更好地使用 API 接口和理解系统架构，请参阅以下相关文档：

### 详细 API 文档
- [树木健康 API](./api/tree_health_api.md) - 树木健康状态系统 API 详细说明

### 架构与设计
- [项目架构概览](./architecture/architecture_overview.md) - 系统整体架构设计
- [系统设计文档](./architecture/system_design.md) - 详细系统设计与技术选型

### 模块文档
- [树木健康系统概览](./modules/tree_health_readme.md) - 树木健康系统总体说明
- [树木健康系统设计](./modules/tree_health_system.md) - 树木健康系统详细设计

### 开发指南
- [开发任务清单](./development_tasks.md) - 详细开发任务和进度追踪
- [开发规范](./development/standards.md) - 项目编码规范与开发流程
- [开发路线图](./development/roadmap.md) - 项目开发计划与进度

### 项目参考
- [项目总览](../README.md) - 返回项目总览文档 

## AI任务分析与拆解

TaskForest集成了基于DeepSeek API的智能任务分析和拆解功能，帮助用户更高效地管理复杂任务。

### 任务复杂度分析

分析任务的复杂度，判断任务是简单、中等还是复杂。

```
POST /api/analyze
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| taskId | string | 否 | 任务ID |
| title | string | 是 | 任务标题 |
| description | string | 否 | 任务详细描述 |

**请求示例：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "description": "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。"
}
```

**响应参数：**

| 参数名 | 类型 | 描述 |
|-------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 分析结果 |
| data.taskId | string | 任务ID |
| data.title | string | 任务标题 |
| data.complexity | string | 任务复杂度，可能为SIMPLE、MEDIUM或COMPLEX |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "taskId": "task-123",
    "title": "实现用户登录功能",
    "complexity": "MEDIUM"
  }
}
```

### 任务拆解

将任务拆解为多个子任务。如果未提供复杂度，会自动先进行复杂度分析。支持自动创建任务和树。

```
POST /api/decompose
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| taskId | string | 否 | 任务ID |
| title | string | 是 | 任务标题 |
| description | string | 否 | 任务详细描述 |
| complexity | string | 否 | 任务复杂度，可为SIMPLE、MEDIUM或COMPLEX |

**URL查询参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| createTasks | boolean | 否 | 是否创建实际任务，默认为false |
| createTrees | boolean | 否 | 是否创建相关树木，默认为true。仅当createTasks为true时有效 |

**请求示例：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "description": "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。",
  "complexity": "MEDIUM"
}
```

**响应参数：**

| 参数名 | 类型 | 描述 |
|-------|------|------|
| success | boolean | 请求是否成功 |
| data | array | 子任务列表（如createTasks=false）或创建结果（如createTasks=true） |

**响应示例（createTasks=false）：**

```json
{
  "success": true,
  "data": [
    {
      "title": "设计登录表单界面",
      "description": "创建用户登录表单，包括用户名/邮箱输入框、密码输入框和登录按钮。",
      "estimatedHours": 2
    },
    {
      "title": "实现表单验证",
      "description": "添加前端表单验证，包括非空检查、邮箱格式验证和密码长度验证。",
      "estimatedHours": 1.5
    },
    // ... 更多子任务
  ]
}
```

**响应示例（createTasks=true）：**

```json
{
  "success": true,
  "data": {
    "mainTask": {
      "id": "task-123",
      "title": "实现用户登录功能",
      "description": "开发一个完整的用户登录功能...",
      "status": "TODO",
      "complexity": "MEDIUM",
      "createdAt": "2023-08-01T12:00:00Z"
    },
    "subTasks": [
      {
        "id": "subtask-1",
        "title": "设计登录表单界面",
        "description": "创建用户登录表单...",
        "status": "TODO",
        "parentTaskId": "task-123",
        "estimatedHours": 2,
        "createdAt": "2023-08-01T12:00:00Z"
      },
      // ... 更多子任务
    ],
    "trees": {
      "mainTree": {
        "id": "tree-1",
        "taskId": "task-123",
        "type": "REDWOOD",
        "health": 100,
        "createdAt": "2023-08-01T12:00:00Z"
      },
      "subTrees": [
        {
          "id": "tree-2",
          "taskId": "subtask-1",
          "type": "OAK",
          "parentTreeId": "tree-1",
          "health": 100,
          "createdAt": "2023-08-01T12:00:00Z"
        },
        // ... 更多子树
      ]
    }
  }
}
```

### 一次性分析并拆解

一次性对任务进行复杂度分析和子任务拆解。

```
POST /api/analyze-and-decompose
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| taskId | string | 否 | 任务ID |
| title | string | 是 | 任务标题 |
| description | string | 否 | 任务详细描述 |

**URL查询参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| createTasks | boolean | 否 | 是否创建实际任务，默认为false |
| createTrees | boolean | 否 | 是否创建相关树木，默认为true。仅当createTasks为true时有效 |

**请求示例：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "description": "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。"
}
```

**响应参数（createTasks=false）：**

| 参数名 | 类型 | 描述 |
|-------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 分析和拆解结果 |
| data.analysis | object | 复杂度分析结果 |
| data.analysis.taskId | string | 任务ID |
| data.analysis.title | string | 任务标题 |
| data.analysis.complexity | string | 任务复杂度 |
| data.subTasks | array | 子任务列表 |
| data.subTasks[].title | string | 子任务标题 |
| data.subTasks[].description | string | 子任务详细描述 |
| data.subTasks[].estimatedHours | number | 预计完成时间（小时） |

**响应参数（createTasks=true）：**

| 参数名 | 类型 | 描述 |
|-------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 分析、拆解和创建结果 |
| data.analysis | object | 复杂度分析结果 |
| data.subTasks | array | 子任务列表 |
| data.createdTasks | object | 创建的任务和树信息 |
| data.createdTasks.mainTask | object | 创建的主任务 |
| data.createdTasks.subTasks | array | 创建的子任务列表 |
| data.createdTasks.trees | object | 创建的树木信息（如createTrees=true） |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "analysis": {
      "taskId": "task-123",
      "title": "实现用户登录功能",
      "complexity": "MEDIUM"
    },
    "subTasks": [
      {
        "title": "设计登录表单界面",
        "description": "创建用户登录表单...",
        "estimatedHours": 2
      },
      {
        "title": "实现表单验证",
        "description": "添加前端表单验证...",
        "estimatedHours": 1.5
      },
      // ... 更多子任务
    ]
  }
}
```

### 将分析结果转化为任务和树

使用已有的分析结果，直接创建任务和相关的树。

```
POST /api/create-tasks
```

**请求参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| analysis | object | 是 | 任务分析结果 |
| analysis.taskId | string | 否 | 任务ID |
| analysis.title | string | 是 | 任务标题 |
| analysis.description | string | 否 | 任务详细描述 |
| analysis.complexity | string | 是 | 任务复杂度 |
| subTasks | array | 是 | 子任务列表 |
| subTasks[].title | string | 是 | 子任务标题 |
| subTasks[].description | string | 否 | 子任务详细描述 |
| subTasks[].estimatedHours | number | 是 | 预计完成时间（小时） |

**URL查询参数：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| createTrees | boolean | 否 | 是否创建相关树木，默认为true |

**请求示例：**

```json
{
  "analysis": {
    "taskId": "task-123",
    "title": "实现用户登录功能",
    "description": "开发一个完整的用户登录功能...",
    "complexity": "MEDIUM"
  },
  "subTasks": [
    {
      "title": "设计登录表单界面",
      "description": "创建用户登录表单...",
      "estimatedHours": 2
    },
    {
      "title": "实现表单验证",
      "description": "添加前端表单验证...",
      "estimatedHours": 1.5
    },
    // ... 更多子任务
  ]
}
```

**响应参数：**

| 参数名 | 类型 | 描述 |
|-------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 创建结果 |
| data.mainTask | object | 创建的主任务 |
| data.subTasks | array | 创建的子任务列表 |
| data.trees | object/null | 创建的树木信息（如createTrees=true）或null |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "mainTask": {
      "id": "task-123",
      "title": "实现用户登录功能",
      "description": "开发一个完整的用户登录功能...",
      "status": "TODO",
      "complexity": "MEDIUM",
      "createdAt": "2023-08-01T12:00:00Z"
    },
    "subTasks": [
      {
        "id": "subtask-1",
        "title": "设计登录表单界面",
        "description": "创建用户登录表单...",
        "status": "TODO",
        "parentTaskId": "task-123",
        "estimatedHours": 2,
        "createdAt": "2023-08-01T12:00:00Z"
      },
      // ... 更多子任务
    ],
    "trees": {
      "mainTree": {
        "id": "tree-1",
        "taskId": "task-123",
        "type": "REDWOOD",
        "health": 100,
        "createdAt": "2023-08-01T12:00:00Z"
      },
      "subTrees": [
        {
          "id": "tree-2",
          "taskId": "subtask-1",
          "type": "OAK",
          "parentTreeId": "tree-1",
          "health": 100,
          "createdAt": "2023-08-01T12:00:00Z"
        },
        // ... 更多子树
      ]
    }
  }
}
``` 

### 批量任务创建

**端点**: `POST /api/tasks/batch`

**描述**: 批量创建多个任务和任务树。

**请求参数**:

```json
{
  "tasks": [
    {
      "title": "主任务标题1",
      "description": "任务描述1",
      "status": "待处理",
      "priority": "高",
      "dueDate": "2023-12-31",
      "subTasks": [
        {
          "title": "子任务标题1",
          "description": "子任务描述1",
          "status": "待处理",
          "priority": "中",
          "dueDate": "2023-12-25"
        }
      ]
    },
    {
      "title": "主任务标题2",
      "description": "任务描述2",
      "status": "待处理",
      "priority": "中",
      "dueDate": "2024-01-15",
      "subTasks": []
    }
  ],
  "createTrees": true
}
```

**成功响应** (200 OK):

```json
{
  "success": true,
  "data": {
    "createdTasks": [
      {
        "id": "task-uuid-1",
        "title": "主任务标题1",
        "description": "任务描述1",
        "status": "待处理",
        "createdAt": "2023-11-10T12:00:00Z",
        "updatedAt": "2023-11-10T12:00:00Z",
        "subTasks": [
          {
            "id": "subtask-uuid-1",
            "title": "子任务标题1",
            "parentId": "task-uuid-1"
          }
        ],
        "treeId": "tree-uuid-1"
      },
      {
        "id": "task-uuid-2",
        "title": "主任务标题2",
        "description": "任务描述2",
        "status": "待处理",
        "createdAt": "2023-11-10T12:00:00Z",
        "updatedAt": "2023-11-10T12:00:00Z",
        "subTasks": [],
        "treeId": "tree-uuid-2"
      }
    ],
    "createdTrees": [
      {
        "id": "tree-uuid-1",
        "name": "树木1",
        "taskId": "task-uuid-1",
        "health": 100,
        "growthStage": "幼苗"
      },
      {
        "id": "tree-uuid-2",
        "name": "树木2",
        "taskId": "task-uuid-2",
        "health": 100,
        "growthStage": "幼苗"
      }
    ]
  }
}
```

**错误响应** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "请求格式不正确或缺少必要参数"
  }
}
```

**错误响应** (500 Internal Server Error):

```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "批量创建任务失败"
  }
}
```

### 批量任务创建

**端点**: `POST /api/batch-tasks`

**描述**: 批量创建多个任务。

**请求参数**:

```json
{
  "tasks": [
    {
      "title": "主任务标题1",
      "description": "任务描述1",
      "status": "未开始",
      "priority": "高",
      "dueDate": "2023-12-31",
      "subTasks": [
        {
          "title": "子任务标题1",
          "description": "子任务描述1",
          "status": "未开始",
          "priority": "中",
          "estimatedHours": 2.5
        }
      ]
    },
    {
      "title": "主任务标题2",
      "description": "任务描述2",
      "status": "未开始",
      "priority": "中",
      "dueDate": "2024-01-15",
      "subTasks": []
    }
  ]
}
```

**成功响应** (201 Created):

```json
{
  "success": true,
  "message": "批量任务创建成功",
  "data": {
    "tasks": [
      {
        "id": "task-uuid-1",
        "title": "主任务标题1",
        "description": "任务描述1",
        "status": "未开始",
        "createdAt": "2023-11-10T12:00:00Z",
        "updatedAt": "2023-11-10T12:00:00Z",
        "subTasks": [
          {
            "id": "subtask-uuid-1",
            "title": "子任务标题1",
            "parentId": "task-uuid-1"
          }
        ]
      },
      {
        "id": "task-uuid-2",
        "title": "主任务标题2",
        "description": "任务描述2",
        "status": "未开始",
        "createdAt": "2023-11-10T12:00:00Z",
        "updatedAt": "2023-11-10T12:00:00Z",
        "subTasks": []
      }
    ]
  }
}
```

**错误响应** (400 Bad Request):

```json
{
  "success": false,
  "message": "任务数据必须是非空数组"
}
```

**错误响应** (500 Internal Server Error):

```json
{
  "success": false,
  "message": "批量创建任务失败",
  "error": "服务器内部错误"
}
```

### 批量创建任务和任务树

**端点**: `POST /api/batch-tasks/with-trees`

**描述**: 批量创建多个任务及其子任务，并创建对应的任务树。

**请求参数**:

```json
{
  "tasks": [
    {
      "title": "主任务标题1",
      "description": "任务描述1",
      "status": "未开始",
      "priority": "高",
      "dueDate": "2023-12-31",
      "subTasks": [
        {
          "title": "子任务标题1",
          "description": "子任务描述1",
          "status": "未开始",
          "priority": "中",
          "estimatedHours": 2.5
        }
      ]
    },
    {
      "title": "主任务标题2",
      "description": "任务描述2",
      "status": "未开始",
      "priority": "中",
      "dueDate": "2024-01-15",
      "subTasks": []
    }
  ],
  "createTrees": true
}
```

**成功响应** (201 Created):

```json
{
  "success": true,
  "message": "批量任务和任务树创建成功",
  "data": {
    "tasks": [
      {
        "id": "task-uuid-1",
        "title": "主任务标题1",
        "description": "任务描述1",
        "status": "未开始",
        "createdAt": "2023-11-10T12:00:00Z",
        "updatedAt": "2023-11-10T12:00:00Z",
        "subTasks": [
          {
            "id": "subtask-uuid-1",
            "title": "子任务标题1",
            "parentId": "task-uuid-1"
          }
        ],
        "treeId": "tree-uuid-1"
      },
      {
        "id": "task-uuid-2",
        "title": "主任务标题2",
        "description": "任务描述2",
        "status": "未开始",
        "createdAt": "2023-11-10T12:00:00Z",
        "updatedAt": "2023-11-10T12:00:00Z",
        "subTasks": [],
        "treeId": "tree-uuid-2"
      }
    ],
    "trees": [
      {
        "id": "tree-uuid-1",
        "name": "树木1",
        "taskId": "task-uuid-1",
        "health": 100,
        "growthStage": "幼苗",
        "children": [
          {
            "id": "subtree-uuid-1",
            "name": "子树1",
            "taskId": "subtask-uuid-1",
            "health": 100,
            "growthStage": "幼苗",
            "parentId": "tree-uuid-1"
          }
        ]
      },
      {
        "id": "tree-uuid-2",
        "name": "树木2",
        "taskId": "task-uuid-2",
        "health": 100,
        "growthStage": "幼苗"
      }
    ]
  }
}
```

**错误响应** (400 Bad Request):

```json
{
  "success": false,
  "message": "任务数据必须是非空数组"
}
```

**错误响应** (500 Internal Server Error):

```json
{
  "success": false,
  "message": "批量创建任务和任务树失败",
  "error": "服务器内部错误"
}
```

### 文本到任务转换

**端点**: `POST /api/ai/text-to-tasks`

**描述**: 将长文本内容转换为结构化的任务和子任务。

**请求参数**:

```json
{
  "text": "需要开发一个用户认证系统，包括登录、注册、密码重置和双因素认证功能。系统需要支持多种登录方式，如手机号、邮箱和第三方账号登录。",
  "title": "用户认证系统开发",
  "createTrees": true
}
```

**成功响应** (200 OK):

```json
{
  "success": true,
  "data": {
    "mainTask": {
      "id": "task-uuid-1",
      "title": "用户认证系统开发",
      "description": "需要开发一个用户认证系统，包括登录、注册、密码重置和双因素认证功能。系统需要支持多种登录方式，如手机号、邮箱和第三方账号登录。",
      "complexity": "高",
      "estimatedHours": 40,
      "status": "待处理",
      "createdAt": "2023-11-10T12:00:00Z",
      "updatedAt": "2023-11-10T12:00:00Z",
      "treeId": "tree-uuid-1"
    },
    "subTasks": [
      {
        "id": "subtask-uuid-1",
        "title": "用户注册功能开发",
        "description": "实现用户注册表单、数据验证和存储",
        "complexity": "中",
        "estimatedHours": 8,
        "parentId": "task-uuid-1",
        "status": "待处理"
      },
      {
        "id": "subtask-uuid-2",
        "title": "用户登录功能开发",
        "description": "实现多种登录方式，包括手机号、邮箱和第三方账号登录",
        "complexity": "中",
        "estimatedHours": 10,
        "parentId": "task-uuid-1",
        "status": "待处理"
      }
    ],
    "tree": {
      "id": "tree-uuid-1",
      "name": "认证系统之树",
      "taskId": "task-uuid-1",
      "health": 100,
      "growthStage": "幼苗"
    }
  }
}
```

**错误响应** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TEXT",
    "message": "提供的文本内容不足以生成任务"
  }
}
```

**错误响应** (500 Internal Server Error):

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "AI服务处理失败"
  }
}
```