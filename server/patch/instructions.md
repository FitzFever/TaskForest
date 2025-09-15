# AI任务拆解修复指南

## 问题概述

TaskForest系统的AI任务拆解功能（decompose接口）失败，无法将AI分析的结果创建为任务。问题原因是DeepSeek API返回的数据格式与系统期望的格式不匹配，导致解析失败。

## 诊断信息

从错误日志中可以看到，DeepSeek API返回的格式为：
```json
{
  "subtasks": [
    {
      "title": "子任务1",
      "description": "...",
      "estimatedHours": 8
    },
    // ...更多子任务
  ]
}
```

而系统期望的格式是直接的数组：
```json
[
  {
    "title": "子任务1",
    "description": "...",
    "estimatedHours": 8
  },
  // ...更多子任务
]
```

## 修复方案

我们已经在`/server/patch/`目录下准备了三个修复文件：

1. `fixDeepseekParsing.js` - 包含修复后的`parseTaskDecompositionResponse`函数
2. `fixedDeepseekService.js` - 完整的修复版DeepSeek服务
3. `README.md` - 问题和修复说明

## 应用修复步骤

### 方案一：只替换解析函数（推荐）

这种方式只更改有问题的函数，对原有代码改动最小：

1. **备份原文件**：
   ```bash
   cd /Users/fitzchen/MyProject/TaskForest
   cp server/src/services/deepseekService.js server/src/services/deepseekService.js.bak
   ```

2. **编辑原服务文件**：
   打开 `server/src/services/deepseekService.js` 文件。

3. **替换解析函数**：
   找到 `parseTaskDecompositionResponse` 函数定义（大约在280行左右），替换为 `server/patch/fixDeepseekParsing.js` 中的新实现。
   
   > 注意：请将 `console.log` 和 `console.error` 改为 `logger.info` 和 `logger.error` 以匹配现有代码风格。

4. **重启服务器**：
   ```bash
   cd /Users/fitzchen/MyProject/TaskForest
   npm run restart-server
   ```

### 方案二：替换整个服务文件

如果方案一不起作用，可以尝试完全替换文件：

1. **备份原文件**：
   ```bash
   cd /Users/fitzchen/MyProject/TaskForest
   cp server/src/services/deepseekService.js server/src/services/deepseekService.js.bak
   ```

2. **复制替换整个文件**：
   ```bash
   cp server/patch/fixedDeepseekService.js server/src/services/deepseekService.js
   ```

3. **重启服务器**：
   ```bash
   cd /Users/fitzchen/MyProject/TaskForest
   npm run restart-server
   ```

## 验证修复

应用修复后，可通过以下方式验证是否成功：

1. **检查服务器日志**：
   ```bash
   tail -f server/logs/combined.log
   ```
   
   查看是否有"成功提取子任务数组"的日志输出。

2. **测试任务拆解API**：
   ```bash
   curl -X POST http://localhost:9000/api/tasks/decompose \
     -H "Content-Type: application/json" \
     -d '{"taskId":"test-task","title":"测试任务","description":"这是一个测试任务","complexity":"HIGH"}'
   ```
   
   查看是否返回成功结果。

3. **在浏览器中使用AI任务生成器**：
   访问 TaskForest 应用，尝试使用AI任务生成器功能进行任务拆解。

## 回滚策略

如果修复后出现新问题，可以恢复原有实现：

```bash
cd /Users/fitzchen/MyProject/TaskForest
cp server/src/services/deepseekService.js.bak server/src/services/deepseekService.js
npm run restart-server
```

## 联系支持

如果应用修复后仍有问题，请联系开发团队并提供以下信息：

1. 服务器日志（`server/logs/error.log` 和 `server/logs/combined.log`）
2. 尝试的修复步骤
3. 出现的具体错误信息

## 后续优化建议

1. 修改 DeepSeek API 调用的提示模板，明确指定返回格式要求
2. 为 decompose 接口添加更强的容错能力
3. 在前端添加更友好的错误提示，帮助用户理解可能的问题 