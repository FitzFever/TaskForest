# 樱花树(Cherry)模型生命周期说明

## 概述

本文档详细说明了TaskForest项目中樱花树(Cherry)的3D模型生命周期和使用方法。樱花树模型以其优雅的分支和绚丽的花朵为特色，在项目中为用户提供独特的视觉体验。

## 生命周期阶段

樱花树模型包含以下四个主要生长阶段：

1. **种子阶段 (Seed Stage)**
   - 文件名: `cherry_seed.glb`
   - 描述: 樱花树的种子阶段，包含红褐色的樱桃种子
   - 尺寸: 小型，约0.05米高

2. **幼苗阶段 (Sapling Stage)**
   - 文件名: `cherry_sapling.glb`
   - 描述: 樱花树的幼苗阶段，有细小的主干和鲜绿色的初始叶片
   - 尺寸: 小型，约0.5米高

3. **成长阶段 (Growing Stage)**
   - 文件名: `cherry_growing.glb`
   - 描述: 樱花树的成长阶段，开始形成分支结构和叶片簇，部分花蕾出现
   - 尺寸: 中型，约1.5米高

4. **成熟阶段 (Mature Stage)**
   - 文件名: `cherry_mature.glb`
   - 描述: 樱花树的成熟阶段，盛开的粉色花朵覆盖整个树冠，呈现出标志性的满开景象
   - 尺寸: 大型，约3.0米高

## 模型特性

- **风格**: 所有模型保持一致的低多边形风格，适合游戏和网页应用
- **多边形数量**: 每个模型控制在2000个三角面以内
- **材质**: 
  - 树干：樱花树特有的红褐色
  - 叶片：明亮的绿色
  - 花朵：淡粉与白色相结合
- **动画**: 包含基础的生长过程动画，从种子到盛开的变化过程
- **特色**: 成熟阶段的樱花满开效果，以及地面的落花效果

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
async function loadCherryTree(growthStage) {
  // growthStage可以是: 'seed', 'sapling', 'growing', 'mature'
  try {
    const treeModel = await loadTreeModel('cherry', growthStage);
    scene.add(treeModel);
    return treeModel;
  } catch (error) {
    console.error('加载樱花树模型失败:', error);
    return null;
  }
}
```

### 樱花飘落效果示例

樱花树的一个特色是花瓣飘落效果，可以通过以下代码实现：

```javascript
import { Vector3 } from 'three';

// 为樱花树添加花瓣飘落效果
function addCherryBlossomFallingEffect(scene, treePosition) {
  const petalsCount = 50;
  const petalGeometry = new THREE.PlaneGeometry(0.05, 0.05);
  const petalMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcce0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  
  // 创建花瓣实例数组
  const petals = [];
  for (let i = 0; i < petalsCount; i++) {
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    
    // 随机位置（在树冠附近）
    const radius = 1.5 * Math.random();
    const angle = Math.random() * Math.PI * 2;
    const height = 2 + Math.random() * 1.5;
    
    petal.position.set(
      treePosition.x + Math.cos(angle) * radius,
      treePosition.y + height,
      treePosition.z + Math.sin(angle) * radius
    );
    
    // 随机旋转
    petal.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    // 添加额外属性用于动画
    petal.userData.velocity = new Vector3(
      (Math.random() - 0.5) * 0.01,
      -0.01 - Math.random() * 0.01,
      (Math.random() - 0.5) * 0.01
    );
    petal.userData.rotationSpeed = new Vector3(
      Math.random() * 0.02,
      Math.random() * 0.02,
      Math.random() * 0.02
    );
    
    scene.add(petal);
    petals.push(petal);
  }
  
  // 动画更新函数
  function updatePetals() {
    for (const petal of petals) {
      // 更新位置
      petal.position.add(petal.userData.velocity);
      
      // 更新旋转
      petal.rotation.x += petal.userData.rotationSpeed.x;
      petal.rotation.y += petal.userData.rotationSpeed.y;
      petal.rotation.z += petal.userData.rotationSpeed.z;
      
      // 重置落到地面的花瓣
      if (petal.position.y < 0.05) {
        const radius = 1.5 * Math.random();
        const angle = Math.random() * Math.PI * 2;
        const height = 2 + Math.random() * 1.5;
        
        petal.position.set(
          treePosition.x + Math.cos(angle) * radius,
          treePosition.y + height,
          treePosition.z + Math.sin(angle) * radius
        );
      }
    }
    
    requestAnimationFrame(updatePetals);
  }
  
  // 开始动画
  updatePetals();
  
  return petals;
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

樱花树模型的设计特别考虑了以下因素：

1. **季节变化与花期**
   - 成熟阶段模型展示盛开的樱花 (春季状态)
   - 可以额外开发夏季、秋季和冬季变体

2. **日式花园风格**
   - 樱花树的形态参考了传统日式园林中的樱花树
   - 分支结构强调优雅曲线，而非严格的几何形态

3. **花瓣的视觉表现**
   - 使用淡粉色调表现樱花特有的柔和色彩
   - 花瓣飘落效果增强场景的动态感和季节氛围

## 创建与修改记录

- **2023-11-21**: 初始创建樱花树种子阶段模型
- **2023-11-22**: 添加幼苗阶段模型
- **2023-11-23**: 添加成长阶段模型
- **2023-11-24**: 添加成熟阶段模型，实现花朵满开效果
- **2023-11-25**: 添加地面落花细节
- **2023-11-26**: 优化模型多边形数量和材质

## 未来计划

- 添加花瓣飘落动画效果
- 开发樱花树的季节变化版本（夏季、秋季、冬季）
- 添加与风互动的效果，使花瓣和枝条随风摆动
- 考虑添加不同品种的樱花树，如垂枝樱、山樱等

---

文档最后更新: 2023-11-26 