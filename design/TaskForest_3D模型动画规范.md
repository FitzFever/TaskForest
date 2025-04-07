# TaskForest 3D模型动画规范

## 1. 动画概述

TaskForest项目中的树木生长动画是实现用户成就可视化的核心元素。本文档定义了树木生长动画的技术规范，确保所有树木模型在不同生长阶段之间的过渡流畅一致。

## 2. 动画帧设置

所有树木生长动画均采用以下统一帧设置：

- **总帧数**：120帧
- **帧率**：30帧/秒
- **总动画时长**：4秒

## 3. 生长阶段划分

每棵树的生命周期被划分为四个主要阶段，在动画中的帧分配如下：

| 阶段 | 帧范围 | 说明 |
|------|--------|------|
| 种子阶段 | 1-30 | 展示种子外观及初始变化 |
| 幼苗阶段 | 31-70 | 种子发芽成为幼苗的过程 |
| 成长阶段 | 71-110 | 幼苗逐渐长大的过程 |
| 成熟阶段 | 111-120 | 最终成熟形态 |

## 4. 动画实现方法

当前采用的动画实现主要基于以下技术：

1. **对象可见性切换**：在适当的关键帧通过控制对象的可见性属性（hide_render 和 hide_viewport）实现不同生长阶段模型的切换

2. **缩放变换**：通过逐步缩放对象实现生长效果

3. **父子层级结构**：使用父对象控制整体动画，子对象表示树的不同部分

## 5. GLB导出规范

动画导出为GLB格式时，需遵循以下规范：

- **文件命名**：`树种名称_tree.glb`（例如：`oak_tree.glb`）
- **导出设置**：
  - 勾选"导出动画"选项
  - 包含所有场景对象
  - 确保材质和纹理正确导出

## 6. Three.js集成指南

在Three.js中加载和控制树木生长动画的标准实现方式：

```javascript
// 加载模型
const loader = new GLTFLoader();
let mixer;
let action;

loader.load('path/to/tree_model.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    
    // 设置动画
    mixer = new THREE.AnimationMixer(model);
    const animationClip = gltf.animations[0];
    action = mixer.clipAction(animationClip);
    action.clampWhenFinished = true;
    action.play();
    
    // 可选：暂停在初始状态
    action.paused = true;
    mixer.setTime(0);
});

// 在动画循环中更新
function animate() {
    requestAnimationFrame(animate);
    
    if (mixer) {
        // delta为自上一帧的时间差
        mixer.update(delta);
    }
    
    renderer.render(scene, camera);
}
```

### 控制特定生长阶段

通过设置特定时间点可以展示树木的特定生长阶段：

```javascript
// 跳转到特定帧/生长阶段
function setGrowthStage(frame) {
    if (mixer && action) {
        // 假设动画是30fps
        mixer.setTime(frame / 30);
    }
}

// 例：跳转到幼苗阶段
setGrowthStage(40);
```

## 7. 测试与验证

每个树木模型完成后，需进行以下测试：

- 在Blender内播放动画验证过渡效果
- 导出GLB后在Three.js测试环境中验证
- 确认动画在不同设备和浏览器中的性能表现

## 8. 注意事项与优化建议

- 保持多边形数量合理，避免过于复杂的几何体
- 动画过渡应平滑自然，避免突兀变化
- 考虑为低性能设备提供简化版模型
- 对于大型场景，考虑实现基于距离的LOD（细节层次）系统

## 9. 未来扩展

计划中的动画系统扩展：

- 增加树木摇摆效果（如风吹效果）
- 实现季节变化效果（如叶子颜色变化）
- 添加交互触发的特效（如点击树木产生粒子效果）

## 10. 更新历史

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2023-04-20 | 1.0 | 初始版本 |
| 2023-04-25 | 1.1 | 添加橡树模型动画规范 | 