# 苹果树 (Apple Tree) 生命周期说明

## 概述

苹果树是TaskForest中的一种矮壮型果树，以其圆形树冠和均匀分布的枝干结构为特点。苹果树在游戏中象征着丰收和实用性，通过不同生长阶段展现出从幼苗到结果的完整过程。

## 生长阶段

苹果树的生命周期分为以下五个阶段：

### 1. 种子阶段 (Seed)

- **文件名**：`apple_seed.glb`
- **外观**：小型圆形种子，呈浅棕色
- **特性**：
  - 尺寸：小，约0.2个单位
  - 颜色：浅棕色种子，带有微小的芽点
  - 多边形数量：约50个三角面

### 2. 幼苗阶段 (Sapling)

- **文件名**：`apple_sapling.glb`
- **外观**：单一短小主干，带有几片圆形叶子
- **特性**：
  - 尺寸：中小，高约0.6个单位
  - 颜色：褐色树干，鲜绿色叶子
  - 结构：矮小的主干，均匀分布的分支和叶子
  - 多边形数量：约150个三角面

### 3. 成长阶段 (Growing)

- **文件名**：`apple_growing.glb`
- **外观**：矮壮树干，枝干均匀分布，开始形成圆形树冠
- **特性**：
  - 尺寸：中等，高约1.5个单位
  - 颜色：深褐色树干，绿色叶子
  - 结构：主干粗短但坚实，分支向四周均匀展开
  - 多边形数量：约300个三角面

### 4. 成熟阶段 (Mature)

- **文件名**：`apple_mature.glb`
- **外观**：粗壮的主干，完整的圆形树冠，枝干分布均匀
- **特性**：
  - 尺寸：中等，高约2.2个单位，冠幅约2.5个单位
  - 颜色：深褐色树干，浓绿色叶子
  - 结构：典型的苹果树形态，主干粗壮，树冠饱满呈圆形
  - 多边形数量：约600个三角面

### 5. 果实期 (Fruit Stage)

- **文件名**：`apple_fruit.glb`
- **外观**：与成熟阶段相同，但分支上挂满红色苹果
- **特性**：
  - 形态：基于成熟阶段模型
  - 附加特征：枝条上分布着鲜红色的苹果果实
  - 苹果数量：约15-20个，分布在树冠外围
  - 多边形数量：约700个三角面

## 技术细节

### 材质

1. **树皮材质**：
   - 基色：棕褐色，RGB值约为(0.35, 0.25, 0.15)
   - 特性：适度粗糙的表面，突出树干粗壮特征

2. **叶子材质**：
   - 基色：鲜绿色，RGB值约为(0.1, 0.5, 0.1)
   - 特性：适度光泽，体现健康的叶片质感

3. **果实材质**：
   - 基色：鲜红色，RGB值约为(0.8, 0.1, 0.1)
   - 特性：光滑有光泽，突显苹果成熟的视觉效果

### LOD级别

- **LOD0**：完整模型，用于近距离查看
- **LOD1**：简化版本，用于中等距离，叶子数量减少40%
- **LOD2**：高度简化版本，用于远距离，保留基本轮廓

## 集成指南

### 在Three.js中加载模型

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// 加载苹果树模型
loader.load(
  'models/apple_mature.glb',  // 或 apple_fruit.glb 果实期
  function (gltf) {
    const appleTree = gltf.scene;
    
    // 调整位置和比例
    appleTree.position.set(x, 0, z);
    appleTree.scale.set(1, 1, 1);
    
    // 添加到场景
    scene.add(appleTree);
  }
);
```

### 生长阶段转换

当需要将苹果树从一个生长阶段过渡到下一个阶段时，建议使用淡入淡出技术：

```javascript
function transitionToNextStage(currentStage, nextStage, duration = 2.0) {
  // 加载下一阶段模型
  loader.load(`models/apple_${nextStage}.glb`, function(gltf) {
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

### 从成熟到果实期转换

苹果树特有的从成熟到果实期的转换：

```javascript
function transitionToFruitStage(matureTree, duration = 5.0) {
  // 加载果实期模型
  loader.load('models/apple_fruit.glb', function(gltf) {
    const fruitTree = gltf.scene;
    fruitTree.position.copy(matureTree.position);
    fruitTree.rotation.copy(matureTree.rotation);
    fruitTree.scale.copy(matureTree.scale);
    
    // 找到所有苹果
    const apples = [];
    fruitTree.traverse(object => {
      if (object.name.includes('Apple_')) {
        apples.push(object);
        object.scale.set(0, 0, 0);  // 初始不可见
      }
    });
    
    // 添加到场景但不显示苹果
    scene.add(fruitTree);
    
    // 逐渐显示苹果
    const startTime = Date.now();
    function growApples() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      apples.forEach((apple, index) => {
        // 分批次长出苹果
        const appleProgress = Math.max(0, Math.min(1, (progress * 1.5) - (index * 0.03)));
        apple.scale.set(appleProgress, appleProgress, appleProgress);
      });
      
      if (progress < 1) {
        requestAnimationFrame(growApples);
      } else {
        scene.remove(matureTree);
      }
    }
    
    growApples();
  });
}
```

## 游戏环境适配

### 光照建议

苹果树在游戏中最好在以下光照条件下展示：

- **环境光**：使用明亮的环境光，突出果实的红色
- **方向光**：从上方45°角照射，创造自然的树冠阴影
- **点光源**：在果实期可以添加轻微的点光源，强调果实的存在

### 放置建议

苹果树最适合放置在以下环境中：

- 农田区域和果园
- 玩家居住区附近
- 资源丰富的平原区域

## 特殊效果

### 风吹效果

```javascript
// 为苹果树添加风吹效果
function addAppleTreeWindEffect(appleTree, windStrength = 0.003, windSpeed = 1.2) {
  // 找到所有叶子
  const leaves = [];
  appleTree.traverse(object => {
    if (object.name.includes('Leaf')) {
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
      leaf.rotation.x = original.rotation.x + noise * 0.5;
      leaf.rotation.z = original.rotation.z + noise;
      
      // 轻微位移
      leaf.position.x = original.position.x + noise;
      leaf.position.y = original.position.y + noise * 0.5;
    });
    
    requestAnimationFrame(animateWind);
  }
  
  animateWind();
}
```

### 果实收获效果

对于果实期的苹果树，可以添加采摘效果：

```javascript
function harvestApple(appleTree, appleIndex) {
  // 找到要采摘的苹果
  let targetApple = null;
  let appleCounter = 0;
  
  appleTree.traverse(object => {
    if (object.name.includes('Apple_')) {
      if (appleCounter === appleIndex) {
        targetApple = object;
      }
      appleCounter++;
    }
  });
  
  if (targetApple) {
    // 记录原始位置
    const originalPosition = targetApple.position.clone();
    
    // 采摘动画
    const startTime = Date.now();
    const duration = 1.0; // 1秒
    
    function animateHarvest() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // 苹果向上轻微移动然后消失
      targetApple.position.y = originalPosition.y + progress * 0.2;
      targetApple.position.z = originalPosition.z + progress * 0.3;
      
      // 缩小并消失
      const scaleValue = 1 - progress;
      targetApple.scale.set(scaleValue, scaleValue, scaleValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateHarvest);
      } else {
        // 完全移除
        targetApple.visible = false;
      }
    }
    
    animateHarvest();
    return true;
  }
  
  return false;
}
```

## 季节变化

苹果树在不同季节的变化：

- **春季**：浅绿色叶子，可能有少量花朵
- **夏季**：深绿色叶子，茂密的树冠
- **秋季**：浅黄绿色叶子，带有果实
- **冬季**：无叶

可以通过调整材质来实现季节变化：

```javascript
function setAppleTreeSeason(appleTree, season) {
  const leafColor = {
    spring: new THREE.Color(0.6, 0.8, 0.4),
    summer: new THREE.Color(0.1, 0.5, 0.1),
    autumn: new THREE.Color(0.7, 0.7, 0.3),
    winter: null // 冬季无叶
  };
  
  appleTree.traverse(object => {
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
    
    // 果实仅在秋季显示
    if (object.name.includes('Apple_')) {
      object.visible = (season === 'autumn');
    }
  });
}
```

---

*最后更新：2024-04-22* 