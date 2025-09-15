# 松树(Pine)模型生命周期说明

## 概述

本文档详细说明了TaskForest项目中松树(Pine)的3D模型生命周期和使用方法。松树模型以典型的锥形结构为特点，采用与项目整体风格一致的低多边形风格实现。

## 生命周期阶段

松树模型包含以下四个主要生长阶段：

1. **种子阶段 (Seed Stage)**
   - 文件名: `pine_seed.glb`
   - 描述: 松树的种子阶段，包含松果种子的初始形态
   - 尺寸: 小型，约0.1米高

2. **幼苗阶段 (Sapling Stage)**
   - 文件名: `pine_sapling.glb`
   - 描述: 松树的幼苗阶段，有细小的主干和初始针叶形态
   - 尺寸: 小型，约0.3米高

3. **成长阶段 (Growing Stage)**
   - 文件名: `pine_growing.glb`
   - 描述: 松树的成长阶段，开始形成典型的层级结构
   - 尺寸: 中型，约1.5米高

4. **成熟阶段 (Mature Stage)**
   - 文件名: `pine_mature.glb`
   - 描述: 松树的成熟阶段，具有完整的锥形树冠和多层针叶结构
   - 尺寸: 大型，约4.0米高

## 模型特性

- **风格**: 所有模型保持一致的低多边形风格，适合游戏和网页应用
- **多边形数量**: 每个模型控制在2000个三角面以内
- **材质**: 使用树干和针叶材质，针叶为深绿色，区别于其他树种
- **动画**: 包含基础的生长过程动画，从种子到成熟的变化过程
- **特点**: 松树的锥形结构和层级针叶是其标志性特征

## 使用方法

### 客户端加载示例

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 创建加载器
const loader = new GLTFLoader();

// 根据树木生长阶段加载相应模型
function loadTreeModel(treeType, stage) {
  const modelPath = `models/trees/${treeType}_${stage}.glb`;
  
  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        resolve(gltf.scene);
      },
      (xhr) => {
        console.log(`${treeType} ${stage} 加载进度: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error(`加载 ${treeType} ${stage} 失败:`, error);
        reject(error);
      }
    );
  });
}

// 使用示例
async function loadPineTree(growthStage) {
  // growthStage可以是: 'seed', 'sapling', 'growing', 'mature'
  try {
    const treeModel = await loadTreeModel('pine', growthStage);
    scene.add(treeModel);
    return treeModel;
  } catch (error) {
    console.error('加载松树模型失败:', error);
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

## 设计考量

松树模型的设计特别考虑了以下因素：

1. **真实性与游戏性平衡**:
   - 保留松树的关键特征（层级结构、锥形树冠、针叶）
   - 简化细节以优化性能和保持一致的艺术风格

2. **季节变化考虑**:
   - 松树作为常绿树种，在冬季依然保持绿色
   - 可以添加雪覆盖效果表现季节变化

3. **与其他树种区分**:
   - 明显不同于阔叶树种（如橡树）的形态
   - 针叶的色调略深，区别于其他针叶树种

## 创建与修改记录

- **2023-11-15**: 初始创建松树种子阶段模型
- **2023-11-16**: 添加幼苗阶段模型
- **2023-11-17**: 添加成长阶段模型
- **2023-11-18**: 添加成熟阶段模型
- **2023-11-19**: 优化模型多边形数量和材质
- **2023-11-20**: 完善生长动画和松果细节

## 未来计划

- 添加风吹动画效果，表现松针的轻微摆动
- 添加积雪效果变体，用于冬季场景
- 优化松树的松果细节，可能添加松果的脱落动画
- 考虑添加不同品种的松树变体（如日本黑松、威灵顿松等）

---

文档最后更新: 2023-11-20 