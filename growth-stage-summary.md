前后端生长阶段逻辑统一总结

## 修改内容

1. ForestScene.tsx: 更新了calculateGrowthStage函数，将生长阶段统一为4阶段(0-3)
2. TreeHealthPanel.tsx: 更新了生长阶段计算逻辑与名称，保持与ForestScene一致
3. SimpleForestView.tsx: 更新生长阶段显示，移除了多余阶段
4. ModelLoader.ts: 修改了模型加载和URL生成逻辑，支持4个生长阶段的模型文件命名

## 生长阶段对应表

| 进度范围 | 阶段值 | 阶段名称 | 阶段颜色 |
|---------|------|--------|--------|
| 0-33%   | 0    | 种子    | #8B4513 |
| 33-66%  | 1    | 幼苗    | #90EE90 |
| 66-100% | 2    | 成长阶段 | #228B22 |
| 100%    | 3    | 成熟    | #006400 |

## 模型文件命名规则

模型文件应按以下规则命名：

- 阶段0 (种子): seedstage_[树木类型].glb
- 阶段1 (幼苗): [树木类型]_sapling.glb
- 阶段2 (成长): [树木类型]_growing.glb
- 阶段3 (成熟): [树木类型]_mature.glb

如果某些阶段的模型文件不存在，系统会自动降级到最近的可用模型。

## 生长阶段计算逻辑

```javascript
// 根据任务进度计算生长阶段
function calculateGrowthStage(progress) {
  if (progress >= 100) {
    return 3; // 完成 - 成熟阶段
  } else if (progress >= 66) {
    return 2; // 进度超过66% - 成长阶段
  } else if (progress >= 33) {
    return 1; // 进度超过33% - 幼苗阶段
  } else {
    return 0; // 进度低于33% - 种子阶段
  }
}
```
