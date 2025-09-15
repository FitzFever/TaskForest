# TaskForest 设计资源指引

## 概述

本文档为TaskForest项目的开发人员提供设计资源指引，帮助您快速找到所需的设计资产并理解其使用方法。所有3D视觉设计资源均基于主流程优先策略进行开发，确保项目稳步推进。

## 设计资源组织

本目录包含所有TaskForest项目的设计资源，包括文档、原型、模型、图像等。

### 目录结构

```
design/
├── models/
│   ├── source/            # 模型源文件(Blender文件)
│   │   └── trees/         # 树木模型源文件
│   ├── export/            # 导出的模型文件
│   │   └── trees/         # 树木模型导出文件
│   └── scripts/           # 模型处理和导出脚本
├── export_all_tree_models.sh  # 一键导出脚本
└── README_*.md            # 各类文档
```

## 模型命名规范

为确保前端能正确加载模型，请严格遵循以下命名规范：

### 树木模型命名

1. **生长阶段模型**:
   - 种子阶段: `seedstage_{树种}.glb`
   - 幼苗阶段: `{树种}_sapling.glb`
   - 生长阶段: `{树种}_growing.glb`
   - 成熟阶段: `{树种}_mature.glb`

2. **通用树木模型**:
   - `{树种}.glb`

3. **健康状态模型**:
   - 健康: `healthy_tree.glb`
   - 轻微枯萎: `slightly_wilted_tree.glb`
   - 中度枯萎: `moderately_wilted_tree.glb`
   - 严重枯萎: `severely_wilted_tree.glb`

### 树木类型

项目支持以下树木类型（与代码中的TreeType枚举对应）：

1. `oak` - 橡树（普通日常任务）
2. `pine` - 松树（定期重复任务）
3. `willow` - 柳树（长期项目任务）
4. `maple` - 枫树（工作类任务）
5. `palm` - 棕榈树（休闲类任务）
6. `apple` - 苹果树（学习类任务）
7. `cherry` - 樱花树（特殊任务/成就）

## 模型更新与维护

### 更新Blender源文件

1. 在 `design/models/source/trees/` 目录中更新或添加Blender源文件
2. 遵循以下命名规范命名源文件:
   - `{树种}_seed.blend` - 种子阶段
   - `{树种}_sapling.blend` - 幼苗阶段
   - `{树种}_growing.blend` - 生长阶段
   - `{树种}_mature.blend` - 成熟阶段

### 导出模型

**方法一：使用一键导出脚本（推荐）**
```bash
# 在项目根目录执行
bash design/export_all_tree_models.sh
```

此脚本将：
1. 从各个独立的Blender源文件导出模型
2. 从合集文件中导出模型
3. 确保客户端目录与导出目录同步
4. 检查缺失的模型并生成报告

**方法二：针对特定模型手动导出**
```bash
# 导出单个模型
blender -b design/models/source/trees/oak_growing.blend -P design/models/scripts/export_gltf.py -- --output-dir design/models/export/trees --target-file oak_growing.glb
```

### 生成缺失模型

如果某些生长阶段的模型尚未创建，可以使用自动生成脚本创建缺失的模型：

```bash
# 在design/models/scripts目录下执行
python3 create_missing_models.py
```

此脚本会基于现有模型自动生成缺失的生长阶段模型，并同步到客户端目录。

### 验证模型完整性

使用以下命令检查模型完整性，确保所有需要的模型都可用：

```bash
python3 design/models/scripts/create_missing_models.py
```

执行后会生成完整性报告：`design/models/export/trees/model_report.json`

## 模型使用指南

### 集成流程

1. **确认需要的树种和阶段**
   - 查阅各树种的生命周期说明文档了解详细信息

2. **检查模型文件可用性**
   - 所有模型应该位于`client/public/models/trees/`目录
   - 缺失的模型可以使用`create_missing_models.py`脚本生成

3. **集成到Three.js**
   - 使用Three.js的GLTFLoader加载模型
   - 示例代码：
   ```javascript
   const loader = new THREE.GLTFLoader();
   loader.load('models/oak_growing.glb', function(gltf) {
     scene.add(gltf.scene);
   });
   ```

### 模型加载机制

前端的ModelLoader类使用以下策略加载模型：

1. 首先尝试加载指定树种和生长阶段的专用模型
2. 如果专用模型不存在，尝试加载该树种的通用模型
3. 如果通用模型也不存在，尝试加载其他相近阶段的模型
4. 如果所有尝试都失败，生成简单的几何模型代替

## 开发与设计协作

### 请求新资源

如需新设计资源，请通过以下方式提交请求：

1. 在项目管理系统创建"设计资源请求"任务
2. 明确指定所需树种、阶段和用途
3. 说明优先级和所需日期

### 反馈问题

如发现模型或材质问题，请提供：

1. 具体模型文件名
2. 问题截图或录屏
3. 问题描述和复现步骤

## 技术规格

- 多边形数量：每个模型不超过2000个三角面
- 贴图尺寸：512x512 像素
- 格式：GLB/glTF 2.0（最终交付）

### 性能注意事项

- 树木模型使用实例化渲染技术(Instancing)
- 远处树木使用LOD（Level of Detail）低精度版本
- 材质共享相同的纹理图集，减少渲染调用

## 常见问题解决

### 模型无法加载

1. 检查模型文件名是否符合命名规范
2. 确保模型文件已复制到客户端目录
3. 运行`create_missing_models.py`生成缺失模型

### 模型显示异常

1. 检查Blender导出设置是否正确
2. 确保模型比例和方向正确
3. 检查材质和纹理设置

## 附录

### 当前完成情况

**模型同步状态**：✅ 已完成

经过最新检查（2024-06-05），所有模型文件已成功导出并同步到前端目录，完整性报告显示没有缺失模型。模型文件包括：
- 7种树木类型：oak, pine, maple, palm, apple, willow, cherry
- 每种树木的4个生长阶段：seedstage, sapling, growing, mature
- 健康状态模型：healthy, slightly_wilted, moderately_wilted, severely_wilted

目前模型开发状态：
- 橡树：种子✅ 幼苗✅ 成长✅ 成熟✅
- 松树：种子✅ 幼苗✅ 成长✅ 成熟✅
- 樱花树：种子✅ 幼苗✅ 成长✅ 成熟✅
- 棕榈树：种子✅ 幼苗✅ 成长✅ 成熟✅
- 苹果树：种子✅ 幼苗✅ 成长✅ 成熟✅
- 枫树：种子✅ 幼苗✅ 成长✅ 成熟✅
- 柳树：种子✅ 幼苗✅ 成长✅ 成熟✅

**注意**：部分模型是基于相似阶段模型自动生成的，可能需要设计师进一步调整。模型完整性报告显示所有必要的模型文件都已经存在，且已同步到前端目录`client/public/models/trees/`中。

### 未来工作

设计资源开发的优先任务：
1. 优化模型多边形数量和纹理
2. 添加更多稀有树种
3. 开发季节变化效果

### 联系方式

设计师：林小玲  
邮箱：designer@taskforest.com  
工作时间：周一至周五 9:00-18:00

---

*最后更新：2024-06-05* 