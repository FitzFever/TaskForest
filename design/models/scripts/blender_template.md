# Blender 树木模型创建模板

本文档提供在Blender中创建TaskForest树木模型的模板和步骤指南。每棵树都应使用此模板作为起点，确保一致的结构和风格。

## 模板文件

模板文件(`tree_template.blend`)包含基本的树木结构，包括：
- 适当的骨骼系统
- 基础材质设置
- 常用的修改器和约束
- 正确的导出设置

你可以通过以下步骤创建这个模板：

## 创建树木模型的步骤

### 1. 基础设置

```python
# 在Blender的Python控制台中执行以下代码创建基本设置

import bpy

# 清除场景
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# 设置单位为米
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0

# 添加基础光照
light_data = bpy.data.lights.new(name="TreeLight", type='SUN')
light_data.energy = 5.0
light_object = bpy.data.objects.new(name="TreeLight", object_data=light_data)
bpy.context.collection.objects.link(light_object)
light_object.rotation_euler = (0.785398, 0, 0.785398)  # 45度角
```

### 2. 创建树干结构

```python
# 创建基础树干
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1,
    depth=1.0,
    enter_editmode=False,
    location=(0, 0, 0.5)
)
trunk = bpy.context.active_object
trunk.name = "TreeTrunk"

# 创建树干材质
trunk_mat = bpy.data.materials.new(name="TrunkMaterial")
trunk_mat.use_nodes = True
trunk.data.materials.append(trunk_mat)
```

### 3. 设置骨骼系统

```python
# 添加骨骼
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
armature = bpy.context.active_object
armature.name = "TreeArmature"

# 设置骨骼编辑模式
bpy.ops.armature.select_all(action='SELECT')
bpy.ops.armature.delete()  # 删除默认骨骼

# 添加主干骨骼
bpy.ops.armature.bone_primitive_add()
bone = armature.data.edit_bones[0]
bone.name = "trunk"
bone.head = (0, 0, 0)
bone.tail = (0, 0, 1)

# 添加分支骨骼
branch = armature.data.edit_bones.new("branch1")
branch.head = (0, 0, 0.7)
branch.tail = (0.3, 0, 1.2)
branch.parent = bone

branch = armature.data.edit_bones.new("branch2")
branch.head = (0, 0, 0.7)
branch.tail = (-0.3, 0, 1.2)
branch.parent = bone

# 退出编辑模式
bpy.ops.object.mode_set(mode='OBJECT')

# 将树干与骨骼绑定
trunk.parent = armature
trunk.parent_type = 'ARMATURE'
```

### 4. 设置树叶系统

```python
# 创建基础叶片
bpy.ops.mesh.primitive_plane_add(
    size=0.2,
    enter_editmode=False,
    location=(0, 0, 1.2)
)
leaf = bpy.context.active_object
leaf.name = "TreeLeaf"

# 创建叶片材质
leaf_mat = bpy.data.materials.new(name="LeafMaterial")
leaf_mat.use_nodes = True
leaf.data.materials.append(leaf_mat)

# 使用粒子系统创建叶片
# 选择树干
bpy.ops.object.select_all(action='DESELECT')
trunk.select_set(True)
bpy.context.view_layer.objects.active = trunk

# 添加粒子系统
bpy.ops.object.particle_system_add()
particle_system = trunk.particle_systems[0]
particle_system.name = "LeafSystem"
particle_settings = particle_system.settings
particle_settings.type = 'HAIR'
particle_settings.render_type = 'OBJECT'
particle_settings.instance_object = leaf
particle_settings.count = 100
particle_settings.hair_length = 0.5
particle_settings.use_advanced_hair = True
```

### 5. 创建正确的材质

```python
# 设置树干材质
nodes = trunk_mat.node_tree.nodes
links = trunk_mat.node_tree.links

# 清除所有节点并重新创建
nodes.clear()

# 创建输出节点
output = nodes.new(type='ShaderNodeOutputMaterial')
output.location = (300, 0)

# 创建BSDF节点
bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
bsdf.location = (0, 0)
bsdf.inputs['Base Color'].default_value = (0.33, 0.22, 0.15, 1.0)  # 棕色
bsdf.inputs['Roughness'].default_value = 0.7
bsdf.inputs['Specular'].default_value = 0.1

# 连接节点
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

# 设置叶片材质（透明）
nodes = leaf_mat.node_tree.nodes
links = leaf_mat.node_tree.links

# 清除所有节点并重新创建
nodes.clear()

# 创建输出节点
output = nodes.new(type='ShaderNodeOutputMaterial')
output.location = (300, 0)

# 创建BSDF节点
bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
bsdf.location = (0, 0)
bsdf.inputs['Base Color'].default_value = (0.15, 0.5, 0.15, 1.0)  # 绿色
bsdf.inputs['Roughness'].default_value = 0.3
bsdf.inputs['Specular'].default_value = 0.2
bsdf.inputs['Alpha'].default_value = 0.9  # 半透明

# 连接节点
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

# 启用透明
leaf_mat.blend_method = 'BLEND'
```

### 6. 导出设置

```python
# 设置导出选项
bpy.context.scene.gltf_export_format = 'GLB'
bpy.context.scene.gltf_export_texcoords = True
bpy.context.scene.gltf_export_normals = True
bpy.context.scene.gltf_export_tangents = True
bpy.context.scene.gltf_export_materials = True
bpy.context.scene.gltf_export_colors = True
bpy.context.scene.gltf_export_cameras = False
bpy.context.scene.gltf_export_extras = False
bpy.context.scene.gltf_export_yup = True
```

## 基于模板创建不同树种

在使用此模板时，应基于`design`目录中的原型图调整模型以匹配特定树种的特点。主要调整点包括：

1. **树干形状**：调整几何体以匹配特定树种的树干形状
2. **分支结构**：添加或修改分支骨骼以匹配自然生长模式
3. **叶片形状**：为每种树设计独特的叶片几何体
4. **材质颜色**：应用适当的材质颜色和纹理
5. **整体比例**：根据规范调整整体比例

## 不同生长阶段的调整

针对每个树种的不同生长阶段，需要进行以下调整：

### 种子阶段
- 禁用叶片粒子系统
- 创建种子特有的几何体
- 缩小整体比例

### 幼苗阶段
- 启用简单的叶片系统
- 缩小树干和分支
- 减少复杂度

### 成长阶段
- 增加树干高度
- 增加分支数量
- 中等密度的叶片

### 成熟阶段
- 完整的树干和分支结构
- 最大密度的叶片
- 添加树皮细节和纹理

## 健康状态变体

通过调整材质和形态可以表现不同的健康状态：

### 健康
- 鲜艳的叶片颜色
- 笔直的树干

### 轻微枯萎
- 轻微黄化的叶片
- 调整叶片角度

### 中度枯萎
- 明显的叶片变色
- 部分叶片下垂

### 严重枯萎
- 褐色的叶片
- 大部分叶片下垂或脱落
- 树干可能倾斜

## 命名约定

在使用模板保存文件时，请遵循以下命名约定：

- `{tree_type}_{growth_stage}.blend`
  例如：`oak_seed.blend`, `pine_mature.blend`

## 导出模型

完成模型后，使用提供的导出脚本：

```bash
cd scripts
./batch_export.sh tree_type
```

或直接在Blender中使用"导出GLB"功能，保存到正确的目录并使用正确的文件名。 