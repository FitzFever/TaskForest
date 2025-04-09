# TaskForest API 参考文档

## 任务管理 API

### 获取任务列表

获取任务列表，支持多种查询参数和分页。

- **URL:** `/api/tasks`
- **方法:** `GET`
- **查询参数:**
  - `search`: 搜索关键词，检索任务标题和描述。支持高级语法:
    - 多关键词: 用空格分隔，例如 `项目 报告`（同时匹配两个词）
    - 标题搜索: `title:关键词` 只在标题中搜索
    - 描述搜索: `desc:关键词` 只在描述中搜索
  - `status`: 任务状态 (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
  - `tags`: 标签，多个标签使用逗号分隔。支持高级语法:
    - 普通标签: 匹配包含该标签的任务
    - 精确匹配: `tag:标签名` 精确匹配标签
  - `priority`: 优先级 (1=低, 2=中, 3=高, 4=紧急)
  - `startDate`: 开始日期，格式为 YYYY-MM-DD
  - `endDate`: 结束日期，格式为 YYYY-MM-DD
  - `treeType`: 树木类型 (OAK, PINE, CHERRY, MAPLE, PALM)
  - `sortBy`: 排序字段 (dueDate, createdAt, priority, title)
  - `sortOrder`: 排序方式 (asc, desc)
  - `page`: 页码，默认为 1
  - `limit`: 每页条数，默认为 10

- **成功响应:**
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

- **错误响应:**
  ```json
  {
    "code": 500,
    "data": null,
    "error": { "message": "获取任务列表失败" },
    "message": "获取任务列表失败",
    "timestamp": 1675487562589
  }
  ```

- **高级搜索示例:**
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

### 获取任务统计

获取任务统计信息，包括各种状态的任务数量、完成率、标签分布和优先级分布。

- **URL:** `/api/tasks/stats`
- **方法:** `GET`

- **成功响应:**
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

- **错误响应:**
  ```json
  {
    "code": 500,
    "data": null,
    "error": { "message": "获取任务统计失败" },
    "message": "获取任务统计失败",
    "timestamp": 1675487562589
  }
  ```

### 获取单个任务

按ID获取任务详细信息。

- **URL:** `/api/tasks/:id`
- **方法:** `GET`
- **参数:**
  - `id`: 任务ID

- **成功响应:**
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
      "tags": ["报告", "项目"],
      "treeType": "OAK",
      "growthStage": 1
    },
    "message": "Success",
    "timestamp": 1675487562589
  }
  ```

- **错误响应:**
  ```json
  {
    "code": 404,
    "data": null,
    "error": { "message": "Task not found" },
    "message": "Not Found",
    "timestamp": 1675487562589
  }
  ```

### 创建任务

创建新任务。

- **URL:** `/api/tasks`
- **方法:** `POST`
- **请求体:**
  ```json
  {
    "title": "新任务",
    "description": "任务描述",
    "type": "WORK",
    "priority": 2,
    "dueDate": "2023-06-30",
    "tags": ["项目", "会议"],
    "treeType": "PINE"
  }
  ```

- **成功响应:**
  ```json
  {
    "code": 201,
    "data": {
      "id": "1003",
      "title": "新任务",
      "description": "任务描述",
      "type": "WORK",
      "status": "TODO",
      "priority": 2,
      "dueDate": "2023-06-30T00:00:00.000Z",
      "createdAt": "2023-05-15T10:30:00.000Z",
      "updatedAt": "2023-05-15T10:30:00.000Z",
      "tags": ["项目", "会议"],
      "treeType": "PINE",
      "growthStage": 0
    },
    "message": "Task created successfully",
    "timestamp": 1675487562589
  }
  ```

### 更新任务

更新现有任务。

- **URL:** `/api/tasks/:id`
- **方法:** `PUT`
- **参数:**
  - `id`: 任务ID
- **请求体:**
  ```json
  {
    "title": "更新后的任务标题",
    "description": "更新后的描述",
    "priority": 3,
    "tags": ["更新", "报告"]
  }
  ```

- **成功响应:**
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

### 完成任务

将任务标记为已完成。

- **URL:** `/api/tasks/:id/complete`
- **方法:** `PATCH`
- **参数:**
  - `id`: 任务ID

- **成功响应:**
  ```json
  {
    "code": 200,
    "data": {
      "id": "1001",
      "title": "完成项目报告",
      "description": "完成季度项目进度报告并提交给项目经理",
      "type": "WORK",
      "status": "COMPLETED",
      "priority": 3,
      "dueDate": "2023-05-20T00:00:00.000Z",
      "createdAt": "2023-05-10T09:00:00.000Z",
      "updatedAt": "2023-05-15T14:20:00.000Z",
      "completedAt": "2023-05-15T14:20:00.000Z",
      "tags": ["报告", "项目"],
      "treeType": "OAK",
      "growthStage": 4
    },
    "message": "Task completed successfully",
    "timestamp": 1675487562589
  }
  ```

### 删除任务

删除任务。

- **URL:** `/api/tasks/:id`
- **方法:** `DELETE`
- **参数:**
  - `id`: 任务ID

- **成功响应:**
  ```json
  {
    "code": 200,
    "data": null,
    "message": "Task deleted successfully",
    "timestamp": 1675487562589
  }
  ```

## 树木管理 API

### 获取树木列表

获取所有树木。

- **URL:** `/api/trees`
- **方法:** `GET`

### 获取单个树木

按ID获取树木详细信息。

- **URL:** `/api/trees/:id`
- **方法:** `GET`
- **参数:**
  - `id`: 树木ID

### 获取任务关联的树木

获取与特定任务关联的树木。

- **URL:** `/api/trees/by-task/:taskId`
- **方法:** `GET`
- **参数:**
  - `taskId`: 任务ID 