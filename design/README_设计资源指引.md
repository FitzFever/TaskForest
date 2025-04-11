# TaskForest 设计资源指引

## 概述

本文档为TaskForest项目的开发人员提供设计资源指引，帮助您快速找到所需的设计资产并理解其使用方法。所有3D视觉设计资源均基于主流程优先策略进行开发，确保项目稳步推进。

## 设计资源位置

所有设计资源位于项目根目录的`/design`文件夹中，分为以下几类：

### 1. 3D模型文件 (.blend)

模型文件采用Blender 2.93+格式，按树种和生长阶段命名：

```
{树种}_{生长阶段}.blend
```

例如：
- `oak_seed.blend` - 橡树种子阶段
- `oak_sapling.blend` - 橡树幼苗阶段
- `oak_growing.blend` - 橡树成长阶段
- `oak_mature.blend` - 橡树成熟阶段

### 2. 概念设计图 (.png)

每种树木的概念设计图位于同一目录下，以树种命名：

```
{树种}.png
```

这些设计图是所有3D模型制作的参考标准，请确保实现与设计图保持风格一致。

### 3. 规范与计划文档 (.md)

规范文档提供详细的设计标准和项目规划：

- `TaskForest_3D视觉设计计划.md` - 整体设计方向和计划
- `TaskForest_3D视觉进度报告.md` - 当前进度和完成状态
- `TaskForest_3D模型制作计划.md` - 模型制作细节规范
- `TaskForest_材质和纹理规范.md` - 材质标准和参数
- `TaskForest_动画和特效规范.md` - 动画效果和实现指南

### 4. 生命周期说明文档

每种树木都有独立的生命周期说明文档，包含其所有生长阶段和使用方法：

- `models/README_OAK.md` - 橡树生命周期说明
- `models/README_PINE.md` - 松树生命周期说明
- `models/README_CHERRY.md` - 樱花树生命周期说明
- `models/README_PALM.md` - 棕榈树生命周期说明

## 设计资源组织

本目录包含所有TaskForest项目的设计资源，包括文档、原型、模型、图像等。

### 目录结构

- `design/models/` - 3D模型资源目录，包含所有树木和环境模型
  - `source/` - 模型源文件(.blend)
  - `export/` - 导出的模型文件(.glb)
  - `README_*.md` - 每种树木的生命周期说明文档
- `design/images/` - 图像资源
- `design/*.md` - 设计文档和规范

### 3D模型资源

所有3D模型资源统一放置在`models/`目录下进行管理，具体请参阅[3D模型资源目录](./models/README.md)。

项目通过符号链接方式，将`design/models/export`链接到`client/public/models`，这样既保持了设计资源的统一管理，又方便了客户端代码的引用。

## 开发人员获取资源指南

### 模型集成流程

1. **确认需要的树种和阶段**
   - 查阅`TaskForest_3D视觉进度报告.md`确认所需模型的完成状态
   - 所有标记为"✅ 完成"的模型可直接使用
   - 查阅各树种的生命周期说明文档（例如`models/README_OAK.md`、`models/README_PINE.md`、`models/README_CHERRY.md`或`models/README_PALM.md`）了解详细信息

2. **导出为Web友好格式**
   - 从.blend文件导出为glTF/GLB格式（推荐）
   - 导出命令：`blender -b {模型文件}.blend -P export_gltf.py -- {输出路径}`
   - 导出脚本位于`/scripts/export_gltf.py`
   - 也可直接使用`models/export/trees`目录下的预导出模型

3. **加载到Three.js**
   - 使用Three.js的GLTFLoader加载模型
   - 示例代码片段：
   ```javascript
   const loader = new THREE.GLTFLoader();
   loader.load('models/oak_seed.glb', function(gltf) {
     scene.add(gltf.scene);
   });
   ```
   - 详细加载示例请参考各树种生命周期说明文档

### 资源命名规范

为确保前后端一致性，请遵循以下命名规范：

1. **树种名称**：
   - 橡树: oak
   - 松树: pine
   - 樱花树: cherry
   - 棕榈树: palm
   - 苹果树: apple
   - 枫树: maple
   - 柳树: willow
   - 橡胶树: rubber_tree
   - 稀有树种: rare_tree_{编号}

2. **生长阶段**：
   - 种子: seed
   - 幼苗: sapling
   - 成长: growing
   - 成熟: mature

3. **命名示例**：
   - 橡树幼苗: oak_sapling
   - 松树成熟阶段: pine_mature

## 开发与设计协作指南

### 请求新资源

如需新设计资源，请通过以下方式提交请求：

1. 在项目管理系统创建"设计资源请求"任务
2. 明确指定所需树种、阶段和用途
3. 说明优先级和所需日期
4. 可选：附上参考图片或风格示例

### 反馈现有资源问题

如发现模型或材质问题，请提供：

1. 具体模型文件名
2. 问题截图或录屏
3. 问题描述和复现步骤
4. 建议的修改方向（可选）

### 每周设计同步会议

每周三下午2点进行设计-开发同步会议，讨论：
- 新完成的模型演示
- 集成过程中的技术问题
- 下周资源优先级确认
- 性能优化和改进建议

## 技术规格

### 模型规格

- 多边形数量：每个模型不超过2000个三角面
- 贴图尺寸：512x512 像素
- 动画关键帧：每个生长阶段5-10个关键帧
- 格式：GLB/glTF 2.0（最终交付）

### 性能注意事项

- 树木模型使用实例化渲染技术(Instancing)
- 远处树木使用LOD（Level of Detail）低精度版本
- 材质共享相同的纹理图集，减少渲染调用
- 小型装饰物使用合批(Batching)技术减少drawcalls

## 附录

### 当前完成情况

目前已完成的模型：
- 橡树全生命周期（种子、幼苗、成长、成熟）✅
- 松树全生命周期（种子、幼苗、成长、成熟）✅ 
- 樱花树全生命周期（种子、幼苗、成长、成熟）✅ 花期特殊版本 ⏳
- 棕榈树全生命周期（种子、幼苗、成长、成熟）✅
- 苹果树全生命周期（种子、幼苗、成长、成熟、果实期）✅
- 枫树全生命周期（种子、幼苗、成长、成熟、秋季特殊版本）✅
- 柳树全生命周期（种子、幼苗、成长、成熟）✅

已完成的文档：
- TaskForest_3D视觉进度报告.md
- TaskForest_3D模型制作计划.md
- TaskForest_材质和纹理规范.md
- TaskForest_动画和特效规范.md
- models/README_OAK.md - 橡树生命周期完整说明 ✅
- models/README_PINE.md - 松树生命周期完整说明 ✅
- models/README_CHERRY.md - 樱花树生命周期完整说明 ✅
- models/README_PALM.md - 棕榈树生命周期完整说明 ✅
- models/README_APPLE.md - 苹果树生命周期完整说明 ✅
- models/README_MAPLE.md - 枫树生命周期完整说明 ✅
- models/README_WILLOW.md - 柳树生命周期完整说明 ✅

请参考`TaskForest_3D视觉进度报告.md`获取最新进度信息。

### 注意事项

所有树种的全部生长阶段（种子、幼苗、成长、成熟）已在Blender中创建完成，相关模型文件已导出到`design/models/source/export/trees`目录。部分特殊版本（如樱花树花期）仍在开发中。

如发现任何模型文件缺失或导出问题，请联系设计团队进行修复。

### 联系方式

设计师：林小玲
邮箱：designer@taskforest.com
工作时间：周一至周五 9:00-18:00

---

*最后更新：2023-12-02* 