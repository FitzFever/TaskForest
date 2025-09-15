# 枫树(Maple)模型生命周期说明

## 概述

枫树模型包含完整的生命周期，从种子到成熟阶段，具有自然红色叶片和流畅连续的枝干结构。本文档详细说明各生长阶段的特点、使用方法和技术细节。

## 生长阶段

枫树具有以下4个主要生长阶段：

### 1. 种子阶段 (Seed)

**文件名**：`maple_seed.glb`

**特点**：
- 自然的翅膀状结构，体现枫树种子特征
- 浅棕色，一端有种子本体
- 轻巧的设计，暗示种子随风传播的特性

**使用场景**：
- 任务初始阶段
- 森林更新区域
- 种子传播教学内容

**技术细节**：
- 多边形数：约200面
- 贴图尺寸：512x512
- 动画帧数：30帧落叶动画

### 2. 幼苗阶段 (Sapling)

**文件名**：`maple_sapling.glb`

**特点**：
- 细小的主干和自然连接的初生分枝
- 3-4片红色的初生叶片，轮廓呈枫叶形状
- 枝干结构连续流畅，不是分离的部件
- 整体高度约0.35米

**使用场景**：
- 任务进行中的早期反馈
- 林地更新区域
- 园林景观元素

**技术细节**：
- 多边形数：约400面
- 贴图尺寸：512x512
- 动画帧数：30帧微微摇摆

### 3. 成长阶段 (Growing)

**文件名**：`maple_growing.glb`

**特点**：
- 逐渐加粗的主干和曲线型连续分枝
- 红色叶片自然分布在分枝末端
- 使用曲线技术实现平滑自然的分枝过渡
- 整体高度约1.2米

**使用场景**：
- 任务进行中期反馈
- 秋季森林和园林场景
- 环境装饰元素

**技术细节**：
- 多边形数：约1000面
- 贴图尺寸：512x512
- 动画帧数：30帧叶子自然摇摆

### 4. 成熟阶段 (Mature)

**文件名**：`maple_mature.glb`

**特点**：
- 粗壮的主干和流畅延伸的曲线分枝
- 红色叶群自然分布于各个分枝末端
- 分枝结构连续且有机，不是独立拼接的部件
- 整体高度约3.5-4米，与其他树种比例协调

**使用场景**：
- 任务完成阶段
- 秋季景观亮点
- 园林和景观设计

**技术细节**：
- 多边形数：约1800面
- 贴图尺寸：512x512
- 动画帧数：30帧轻微摇摆

## 特殊特性

### 1. 红叶特性

枫树模型的标志性特征是其红色叶片：
- 默认为红色叶片，突出秋季特性
- 叶片颜色鲜明但不过分突兀
- 可根据需要切换为其他季节颜色

### 2. 连续枝干结构

枫树模型采用先进的枝干设计：
- 使用曲线技术创建连续流畅的分枝
- 分枝从主干自然生长，不是独立的部件
- 有机的连接点和过渡区域

### 3. 形态特征

相比其他树种，枫树的特点：
- 鲜明的红色叶片
- 流畅开展的枝干结构
- 整体造型与景观协调

## 在Three.js中使用

使用GLTFLoader加载模型：

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// 加载枫树成熟阶段模型
loader.load('models/maple_mature.glb', (gltf) => {
  const mapleTree = gltf.scene;
  
  // 添加到场景
  scene.add(mapleTree);
  
  // 获取动画
  const mixer = new THREE.AnimationMixer(mapleTree);
  const clips = gltf.animations;
  
  if (clips && clips.length) {
    // 播放叶子摇摆动画
    const leafAnimation = mixer.clipAction(clips[0]);
    leafAnimation.play();
  }
  
  // 动画更新
  function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    mixer.update(delta);
    
    renderer.render(scene, camera);
  }
  
  animate();
});
```

## 生长过程展示

可以使用模型切换来展示完整生长过程：

```javascript
// 生长阶段模型路径
const stages = [
  'models/maple_seed.glb',
  'models/maple_sapling.glb',
  'models/maple_growing.glb',
  'models/maple_mature.glb'
];

let currentStage = 0;
let currentTree = null;

// 加载下一阶段
function loadNextStage() {
  if (currentStage >= stages.length) return;
  
  const loader = new GLTFLoader();
  
  loader.load(stages[currentStage], (gltf) => {
    // 移除当前树
    if (currentTree) scene.remove(currentTree);
    
    // 添加新树
    currentTree = gltf.scene;
    scene.add(currentTree);
    
    // 更新阶段
    currentStage++;
  });
}

// 使用示例：每10秒切换一个生长阶段
loadNextStage();
setInterval(loadNextStage, 10000);
```

## 季节变化展示

虽然枫树默认为红色，但可以展示其他季节变化：

```javascript
// 季节材质
const seasons = {
  spring: new THREE.MeshStandardMaterial({ color: 0x7CFC00 }),  // 嫩绿色
  summer: new THREE.MeshStandardMaterial({ color: 0x228B22 }),  // 深绿色
  autumn: new THREE.MeshStandardMaterial({ color: 0xCD5C5C }),  // 红色(默认)
  winter: new THREE.MeshStandardMaterial({ color: 0x8B4513 })   // 棕色
};

// 更改季节
function changeSeason(mapleTree, season) {
  // 查找所有叶子对象
  mapleTree.traverse((node) => {
    if (node.isMesh && node.name.includes('Leaf')) {
      node.material = seasons[season];
    }
  });
}

// 使用示例
loader.load('models/maple_mature.glb', (gltf) => {
  const mapleTree = gltf.scene;
  scene.add(mapleTree);
  
  // 默认已是秋季红叶
  
  // 切换到夏季绿叶
  document.getElementById('summer-button').addEventListener('click', () => {
    changeSeason(mapleTree, 'summer');
  });
  
  // 切换回秋季红叶
  document.getElementById('autumn-button').addEventListener('click', () => {
    changeSeason(mapleTree, 'autumn');
  });
});
```

## 技术注意事项

1. **曲线分枝技术**：枫树模型使用曲线技术创建连续的枝干，增强了视觉自然度。

2. **实例化渲染**：对于需要显示大量枫树的场景，建议使用Three.js的实例化渲染功能。

3. **LOD优化**：远处的枫树可使用低精度版本以提高性能。

4. **材质共享**：所有枫树模型使用共享材质，减少渲染调用。

## 与其他树种的区别

枫树与其他树种相比具有以下区别：

1. **叶子颜色**：默认为红色，突出秋季特性
2. **枝干结构**：使用曲线技术实现连续流畅的分枝
3. **分枝模式**：自然开展的分枝结构
4. **种子特征**：翅膀状种子，体现枫树特性

## 更新历史

- [2024-06-01] 完成枫树全部生长阶段模型
- [2024-06-01] 重新设计模型改进枝干连续性
- [2024-06-01] 恢复红色叶子作为默认特性
- [2024-06-01] 创建完整生命周期文档 