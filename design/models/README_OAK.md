# 橡树(Oak)模型生命周期说明

## 概述

本文档详细说明了TaskForest项目中橡树(Oak)的3D模型生命周期和使用方法。橡树作为项目中的第一种树木模型，具有完整的生长阶段和动画效果。

## 生命周期阶段

橡树模型包含以下四个主要生长阶段：

1. **种子阶段 (Seed Stage)**
   - 文件名: `oak_seed.glb`
   - 描述: 橡树的种子(橡果)阶段，植入土壤后的初始状态
   - 尺寸: 小型，约0.1米高

2. **幼苗阶段 (Sapling Stage)**
   - 文件名: `oak_sapling.glb`
   - 描述: 橡树的幼苗阶段，有细小的主干和几片初始叶子
   - 尺寸: 小型，约0.4米高

3. **成长阶段 (Growing Stage)**
   - 文件名: `oak_growing.glb`
   - 描述: 橡树的成长阶段，开始形成基本树形，有主干和初始分支
   - 尺寸: 中型，约1.8米高

4. **成熟阶段 (Mature Stage)**
   - 文件名: `oak_mature.glb`
   - 描述: 橡树的成熟阶段，完整的树冠和复杂分支结构
   - 尺寸: 大型，约3.5米高

## 模型特性

- **风格**: 所有模型保持一致的低多边形风格，适合游戏和网页应用
- **多边形数量**: 每个模型控制在2000个三角面以内
- **材质**: 使用简单的树干和树叶材质，保持风格统一
- **动画**: 包含基础的生长过程动画，从种子到成熟的变化过程

## 使用方法

### 客户端加载示例

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 创建加载器
const loader = new GLTFLoader();

// 根据树木生长阶段加载相应模型
function loadTreeModel(stage) {
  const modelPath = `models/trees/oak_${stage}.glb`;
  
  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        resolve(gltf.scene);
      },
      (xhr) => {
        console.log(`${stage} 加载进度: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error(`加载 ${stage} 失败:`, error);
        reject(error);
      }
    );
  });
}

// 使用示例
async function loadOakTree(growthStage) {
  // growthStage可以是: 'seed', 'sapling', 'growing', 'mature'
  try {
    const treeModel = await loadTreeModel(growthStage);
    scene.add(treeModel);
    return treeModel;
  } catch (error) {
    console.error('加载树模型失败:', error);
    return null;
  }
}
```

### 动画播放示例

```javascript
import { AnimationMixer } from 'three';

// 创建动画混合器并播放动画
function playGrowthAnimation(model) {
  if (model.animations && model.animations.length > 0) {
    const mixer = new AnimationMixer(model);
    const action = mixer.clipAction(model.animations[0]);
    action.play();
    
    // 在动画循环中更新混合器
    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer.update(delta);
      renderer.render(scene, camera);
    }
    
    animate();
  }
}
```

## 技术规格

- **格式**: glTF/GLB 2.0
- **网格复杂度**: 低-中等多边形(Low-Medium Poly)
- **纹理分辨率**: 512x512像素
- **骨骼/变形目标**: 无(静态模型)
- **动画**: 包含120帧生长循环
- **文件大小**: 每个模型小于1MB

## 创建与修改记录

- **2023-10-15**: 初始创建橡树种子阶段模型
- **2023-10-20**: 添加幼苗阶段模型
- **2023-10-25**: 添加成长阶段模型
- **2023-10-30**: 添加成熟阶段模型
- **2023-11-05**: 优化模型多边形数量和材质
- **2023-11-10**: 完善生长动画

## 未来计划

- 添加季节变化效果(夏季/秋季叶子颜色)
- 添加风吹动画效果
- 添加多种橡树变种

---

文档最后更新: 2023-11-15 