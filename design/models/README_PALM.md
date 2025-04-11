# 棕榈树(Palm)模型生命周期说明

## 概述

本文档详细说明了TaskForest项目中棕榈树(Palm)的3D模型生命周期和使用方法。棕榈树模型以其独特的热带风格和羽状叶特性为标志，为项目提供了丰富的生态多样性和视觉变化。

## 生命周期阶段

棕榈树模型包含以下四个主要生长阶段：

1. **种子阶段 (Seed Stage)**
   - 文件名: `palm_seed.glb`
   - 描述: 棕榈树的种子阶段，类似椰子的椭圆形种子，带有初始发芽结构
   - 尺寸: 小型，约0.1米高

2. **幼苗阶段 (Sapling Stage)**
   - 文件名: `palm_sapling.glb`
   - 描述: 棕榈树的幼苗阶段，有短粗的茎干和初始的扇形叶片
   - 尺寸: 小型，约0.3米高

3. **成长阶段 (Growing Stage)**
   - 文件名: `palm_growing.glb`
   - 描述: 棕榈树的成长阶段，茎干开始延长，树顶形成初步的羽状叶簇
   - 尺寸: 中型，约2.0米高

4. **成熟阶段 (Mature Stage)**
   - 文件名: `palm_mature.glb`
   - 描述: 棕榈树的成熟阶段，高大的直立茎干顶端分布着巨大的羽状叶冠，底部可见椰子果实
   - 尺寸: 大型，约4.0米高

## 模型特性

- **风格**: 所有模型保持一致的低多边形风格，适合游戏和网页应用
- **多边形数量**: 每个模型控制在2000个三角面以内
- **材质**: 
  - 树干：棕榈树特有的粗糙棕色
  - 叶片：热带植物特有的鲜亮绿色
  - 果实：椰子的深棕色
- **动画**: 包含基础的生长过程动画，从种子到成熟的变化过程
- **特色**: 棕榈树独特的羽状叶结构和垂直生长的树干

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
async function loadPalmTree(growthStage) {
  // growthStage可以是: 'seed', 'sapling', 'growing', 'mature'
  try {
    const treeModel = await loadTreeModel('palm', growthStage);
    scene.add(treeModel);
    return treeModel;
  } catch (error) {
    console.error('加载棕榈树模型失败:', error);
    return null;
  }
}
```

### 棕榈叶摇动效果示例

棕榈树的特色是叶片随风摆动效果，可以通过以下代码实现：

```javascript
import { MathUtils } from 'three';

// 为棕榈树添加叶片摇动效果
function addPalmLeafSwayEffect(palmTree) {
  // 查找所有叶片模型
  const leaflets = [];
  palmTree.traverse((object) => {
    if (object.name.includes('leaflet')) {
      leaflets.push(object);
    }
  });
  
  // 初始化叶片动画参数
  leaflets.forEach((leaflet, index) => {
    // 保存原始旋转
    leaflet.userData.originalRotation = {
      x: leaflet.rotation.x,
      y: leaflet.rotation.y,
      z: leaflet.rotation.z
    };
    
    // 添加随机摆动参数
    leaflet.userData.sway = {
      speed: 0.5 + Math.random() * 0.5,
      amplitude: 0.02 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2
    };
  });
  
  // 动画更新函数
  function animateLeaves(time) {
    time = time || 0;
    
    leaflets.forEach((leaflet) => {
      const { speed, amplitude, phase } = leaflet.userData.sway;
      const original = leaflet.userData.originalRotation;
      
      // 应用正弦摆动到Z轴旋转
      leaflet.rotation.z = original.z + Math.sin(time * 0.001 * speed + phase) * amplitude;
      
      // 轻微影响X轴旋转，模拟3D摆动
      leaflet.rotation.x = original.x + Math.cos(time * 0.001 * speed + phase) * amplitude * 0.3;
    });
    
    requestAnimationFrame(animateLeaves);
  }
  
  // 开始动画
  animateLeaves();
  
  return leaflets;
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

棕榈树模型的设计特别考虑了以下因素：

1. **热带风格与区域特色**
   - 棕榈树作为热带标志性树种，具有与温带树种截然不同的形态
   - 特意设计了其独特的向上生长形态与顶部羽状叶冠结构

2. **种类多样性**
   - 当前模型基于椰子棕榈设计
   - 未来可拓展如扇叶棕榈、海枣等多种棕榈树变种

3. **自然细节处理**
   - 树干的环状纹理模拟了真实棕榈树的生长痕迹
   - 羽状叶片的左右交错排列模拟了真实棕榈叶的结构
   - 底部的枯叶增加了场景的细节丰富度与真实感

## 创建与修改记录

- **2023-11-27**: 初始创建棕榈树种子阶段模型
- **2023-11-28**: 添加幼苗阶段模型
- **2023-11-29**: 添加成长阶段模型，完善羽状叶结构
- **2023-11-30**: 添加成熟阶段模型，添加椰子果实和枯叶细节
- **2023-12-01**: 优化模型多边形数量和材质效果
- **2023-12-02**: 完善生长动画和自然变化效果

## 未来计划

- 添加风吹动画效果，使叶片随风摆动
- 开发不同种类的棕榈树变种（扇叶棕榈、油棕等）
- 添加椰子掉落和生长的交互效果
- 优化低多边形版本，用于远距离观察和移动设备

## 热带园艺提示

棕榈树在游戏中适合以下场景：
- 海滩和沿海区域
- 热带雨林和丛林环境
- 沙漠绿洲
- 热带花园和度假区域
- 温室和室内大型装饰植物

---

文档最后更新: 2023-12-02 