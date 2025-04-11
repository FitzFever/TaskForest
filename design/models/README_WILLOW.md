# 柳树 (Willow) 生命周期说明

## 概述

柳树是TaskForest中的一种具有标志性下垂枝叶的树种，以其柔软垂直的分支和狭长的叶子为特点。柳树在游戏中象征着适应性和韧性，能够在水源充足的环境中茁壮成长。柳树模型特别强调了80-85度的下垂枝条角度和细长的树干，营造出典型的"柳树帘"效果。

## 生长阶段

柳树的生命周期分为以下四个阶段：

### 1. 种子阶段 (Seed)

- **文件名**：`willow_seed.glb`
- **外观**：小型椭圆形种子，带有细小的纹理和一根嫩芽
- **特性**：
  - 尺寸：小，约0.2个单位
  - 颜色：淡棕色种子，带有浅绿色嫩芽
  - 多边形数量：约50个三角面

### 2. 幼苗阶段 (Sapling)

- **文件名**：`willow_sapling.glb`
- **外观**：单一细长主干，带有几片细长的叶子
- **特性**：
  - 尺寸：中小，高约0.8个单位
  - 颜色：褐色树干，银绿色叶子
  - 结构：纤细的主干，叶子呈60度角向下垂
  - 多边形数量：约150个三角面

### 3. 成长阶段 (Growing)

- **文件名**：`willow_growing.glb`
- **外观**：单一主干，多个下垂的分支，每个分支带有叶子
- **特性**：
  - 尺寸：中等，高约2.0个单位
  - 颜色：深褐色树干，银绿色叶子
  - 结构：主干上分布着均匀的分支，呈80-85度下垂
  - 多边形数量：约250个三角面

### 4. 成熟阶段 (Mature)

- **文件名**：`willow_mature.glb`
- **外观**：细长但粗壮的主干，多个长而下垂的分支，形成特色的"柳条帘"效果
- **特性**：
  - 尺寸：大型，高约3.0个单位
  - 颜色：深褐色树干，银绿色叶子群
  - 结构：单一主干，多个主分支均匀分布，以82度角度向下垂，叶子成组分布在分支上
  - 多边形数量：约400个三角面

## 技术细节

### 材质

1. **树皮材质**：
   - 基色：棕褐色至灰褐色
   - 特性：简洁平滑的表面，强调树干形态而非细节

2. **叶子材质**：
   - 基色：银绿色，RGB值约为(0.6, 0.7, 0.5)
   - 特性：简单的平面结构，通过形状和方向表达柳树叶特点

### LOD级别

- **LOD0**：完整简化模型，用于所有距离
- **LOD1**：可选，将叶子数量减少50%，用于远距离

## 集成指南

### 在Three.js中加载模型

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// 加载柳树模型
loader.load(
  'models/willow_mature.glb',
  function (gltf) {
    const willow = gltf.scene;
    
    // 调整位置和比例
    willow.position.set(x, 0, z);
    willow.scale.set(1, 1, 1);
    
    // 添加到场景
    scene.add(willow);
  }
);
```

### 生长阶段转换

当需要将柳树从一个生长阶段过渡到下一个阶段时，建议使用淡入淡出技术：

```javascript
function transitionToNextStage(currentStage, nextStage, duration = 2.0) {
  // 加载下一阶段模型
  loader.load(`models/willow_${nextStage}.glb`, function(gltf) {
    const nextModel = gltf.scene;
    nextModel.position.copy(currentModel.position);
    nextModel.rotation.copy(currentModel.rotation);
    nextModel.scale.set(0, 0, 0); // 从0开始缩放
    scene.add(nextModel);
    
    // 动画过渡
    const startTime = Date.now();
    function transition() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // 缩小当前模型
      currentModel.scale.set(1 - progress, 1 - progress, 1 - progress);
      
      // 放大新模型
      nextModel.scale.set(progress, progress, progress);
      
      if (progress < 1) {
        requestAnimationFrame(transition);
      } else {
        scene.remove(currentModel);
      }
    }
    transition();
  });
}
```

## 游戏环境适配

### 光照建议

柳树在游戏中最好在以下光照条件下展示：

- **环境光**：使用柔和的环境光来突出柳树垂直结构
- **方向光**：从侧面照射，创造分支的线性阴影效果

### 放置建议

柳树最适合放置在以下环境中：

- 靠近水体（湖泊、河流、池塘边）
- 潮湿的区域
- 庭院或园林景观中的焦点

## 特殊效果

### 风吹效果

简化的柳树模型仍然应该表现出对风的敏感反应：

```javascript
// 为柳树添加风吹效果
function addWillowWindEffect(willowTree, windStrength = 0.005, windSpeed = 1.5) {
  // 找到所有叶子和分支
  const leaves = [];
  willowTree.traverse(object => {
    if (object.name.includes('Leaf') || object.name.includes('Branch')) {
      leaves.push(object);
    }
  });
  
  // 原始位置
  const originalPositions = leaves.map(leaf => ({
    position: leaf.position.clone(),
    rotation: leaf.rotation.clone()
  }));
  
  // 动画循环
  let time = 0;
  function animateWind() {
    time += 0.01 * windSpeed;
    
    leaves.forEach((leaf, i) => {
      const original = originalPositions[i];
      const noise = Math.sin(time + i * 0.5) * windStrength;
      
      // 应用风力效果
      leaf.rotation.z = original.rotation.z + noise;
      
      // 轻微位移
      leaf.position.y = original.position.y + noise;
    });
    
    requestAnimationFrame(animateWind);
  }
  
  animateWind();
}
```

## 季节变化

柳树在不同季节的简化表现：

- **春季**：嫩绿色叶子
- **夏季**：银绿色叶子
- **秋季**：黄色叶子
- **冬季**：无叶

可以通过简单的颜色调整和隐藏叶子来实现季节变化：

```javascript
function setWillowSeason(willowTree, season) {
  const leafColor = {
    spring: new THREE.Color(0.65, 0.8, 0.4),
    summer: new THREE.Color(0.6, 0.7, 0.5),
    autumn: new THREE.Color(0.8, 0.75, 0.3),
    winter: null // 冬季无叶
  };
  
  willowTree.traverse(object => {
    if (object.name.includes('Leaf')) {
      if (season === 'winter') {
        object.visible = false;
      } else {
        object.visible = true;
        if (object.material) {
          object.material.color.copy(leafColor[season]);
        }
      }
    }
  });
}
```

---

*最后更新：2024-04-22* 