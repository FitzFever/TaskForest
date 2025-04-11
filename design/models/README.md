# TaskForest 3D模型资源索引

## 概述

本文档为TaskForest项目的3D模型资源提供详细索引，帮助开发人员快速找到并使用所需的模型资源。所有模型遵循统一的设计规范和命名标准，确保项目整体视觉风格的一致性。

## 目录结构

- `source/` - 模型源文件(.blend)
- `export/` - 导出的模型文件
  - `trees/` - 树木模型
  - `objects/` - 其他物体模型
  - `effects/` - 特效模型

## 树木模型资源

### 基础树种

所有树木按照统一的命名规范进行组织，支持多种生长阶段和健康状态：

#### 生长阶段模型

| 树种 | 种子阶段 | 幼苗阶段 | 成熟阶段 |
| --- | --- | --- | --- |
| 橡树 (Oak) | ✅ seedstage_oak.glb | ❌ | ✅ oak_mature.glb |
| 松树 (Pine) | ✅ seedstage_pine.glb | ❌ | ✅ pine_mature.glb |
| 樱花树 (Cherry) | ❌ | ❌ | ✅ cherry_mature.glb |
| 棕榈树 (Palm) | ❌ | ✅ palm_sapling.glb | ✅ palm_mature.glb |
| 苹果树 (Apple) | ✅ seedstage_apple.glb | ✅ apple_sapling.glb | ✅ apple_mature.glb |
| 枫树 (Maple) | ❌ | ❌ | ✅ maple_mature.glb |
| 柳树 (Willow) | ❌ | ❌ | ✅ willow_mature.glb |
| 橡胶树 (Rubber) | ❌ | ❌ | ✅ rubber_mature.glb |

#### 健康状态模型

这些模型用于表示树木的不同健康状态：

| 健康状态 | 模型文件 | 说明 |
| --- | --- | --- |
| 健康 | healthy_tree.glb | 树木处于完全健康状态 |
| 轻微枯萎 | slightly_wilted_tree.glb | 树木开始显示轻微枯萎迹象 |
| 中度枯萎 | moderately_wilted_tree.glb | 树木明显枯萎但仍可挽救 |
| 严重枯萎 | severely_wilted_tree.glb | 树木严重枯萎，需要紧急救治 |

#### 特殊模型

| 名称 | 模型文件 | 说明 |
| --- | --- | --- |
| 杨桃果实 | starfruit.glb | 特殊成就奖励物品 |

## 使用指南

### 模型查看器

项目提供了简单的模型查看器，可用于快速预览模型：

```bash
# 启动模型查看服务
cd design/models
node serve.js

# 在浏览器中访问
http://localhost:8080/viewer.html
```

### 集成到项目

1. 所有模型均已导出为标准的GLB格式，可直接用于Three.js项目
2. 模型加载示例：

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/trees/oak_mature.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

## 开发注意事项

1. 所有模型都已优化，单个模型面数控制在2000以内
2. 树木模型由树干(trunk)和树冠(crown)组件组成，通过Empty对象作为父节点
3. 材质已经预设，无需额外设置
4. 支持按需加载不同生长阶段和健康状态的模型

## 模型开发计划

### 待完成工作

- [ ] 完成所有树种的种子阶段模型
- [ ] 完成所有树种的幼苗阶段模型
- [ ] 添加树木季节变化模型(春、夏、秋、冬)
- [ ] 开发特殊成就奖励相关的额外模型

---

*最后更新：2023年4月11日* 