# TaskForest 材质和纹理规范

## 概述

本文档定义了TaskForest项目中3D树木模型使用的材质和纹理标准。遵循这些规范可确保视觉一致性，并在保持美观的同时优化性能。

## 通用材质规范

### PBR材质设置

所有树木模型将使用基于物理的渲染(PBR)材质，包含以下主要贴图：

1. **基础颜色贴图(Base Color)** - 512×512px
2. **法线贴图(Normal Map)** - 512×512px
3. **金属度/粗糙度贴图(Metallic/Roughness)** - 512×512px
4. **环境光遮蔽贴图(Ambient Occlusion)** - 512×512px

### 通用材质特性

- **树干材质**：非金属(Metallic=0)，中高粗糙度(Roughness=0.7-0.9)
- **叶片材质**：非金属(Metallic=0)，中等粗糙度(Roughness=0.5-0.7)，使用Alpha通道实现透明度
- **种子材质**：非金属(Metallic=0)，低至中等粗糙度(Roughness=0.4-0.6)

### 纹理优化

- 使用纹理图集(Texture Atlas)组织相关元素
- 合并相似材质，减少材质切换
- 对称元素共享UV空间
- 针对主干、分枝和叶片分配适当的UV空间

## 各树种材质规范

### 1. 橡树材质规范

#### 树干材质

- **基础颜色**：深褐色 RGB(84, 59, 43)
- **纹理特征**：粗糙树皮，深浅纹理明显
- **法线强度**：高（0.8-1.0）
- **粗糙度**：高（0.85）
- **特殊效果**：树干底部有苔藓痕迹

#### 叶片材质

- **基础颜色**：深绿色 RGB(40, 78, 35)
- **纹理特征**：橡树叶脉络清晰，边缘略微起伏
- **透明度处理**：叶片边缘半透明过渡
- **粗糙度**：中（0.6）
- **双面渲染**：启用

#### 种子材质(橡果)

- **基础颜色**：棕色 RGB(99, 73, 53)
- **纹理特征**：橡果表面细微纹理
- **粗糙度**：中低（0.5）

### 2. 松树材质规范

#### 树干材质

- **基础颜色**：红褐色 RGB(94, 63, 45)
- **纹理特征**：纵向裂纹，鳞片状
- **法线强度**：中高（0.7）
- **粗糙度**：高（0.9）

#### 针叶材质

- **基础颜色**：深绿色 RGB(35, 67, 40)
- **纹理特征**：针状叶片，硬质感
- **透明度处理**：针叶边缘清晰
- **粗糙度**：中高（0.7）
- **特殊效果**：略微发亮的针尖

#### 种子材质(松果)

- **基础颜色**：棕色 RGB(89, 68, 48)
- **纹理特征**：松果鳞片细节
- **法线强度**：高（0.9）
- **粗糙度**：高（0.85）

### 3. 樱花树材质规范

#### 树干材质

- **基础颜色**：灰褐色 RGB(92, 80, 70)
- **纹理特征**：横向生长纹理，较为光滑
- **法线强度**：中（0.6）
- **粗糙度**：中（0.7）

#### 花朵材质

- **基础颜色**：粉色 RGB(247, 205, 227)
- **纹理特征**：花瓣质感，微微透明
- **透明度处理**：花瓣边缘渐变透明
- **粗糙度**：低（0.4）
- **特殊效果**：轻微自发光效果(Emission=0.1)

#### 叶片材质

- **基础颜色**：亮绿色 RGB(63, 122, 48)
- **纹理特征**：薄而柔软的叶片
- **透明度处理**：叶片边缘半透明
- **粗糙度**：中（0.5）

#### 种子材质

- **基础颜色**：浅棕色 RGB(120, 95, 70)
- **纹理特征**：光滑表面，顶部有粉色芽点
- **粗糙度**：低（0.4）

### 4. 棕榈树材质规范

#### 树干材质

- **基础颜色**：棕色 RGB(110, 82, 60)
- **纹理特征**：鳞片状横纹，粗糙质感
- **法线强度**：高（0.8）
- **粗糙度**：高（0.85）
- **特殊效果**：树干交接处的纤维质感

#### 叶片材质

- **基础颜色**：亮绿色 RGB(58, 124, 43)
- **纹理特征**：大型扇叶，有纹理脉络
- **透明度处理**：叶片边缘锯齿状清晰
- **粗糙度**：中（0.6）
- **特殊效果**：叶片表面微弱光泽

#### 种子材质

- **基础颜色**：深棕色 RGB(79, 58, 43)
- **纹理特征**：椭圆形，光滑表面
- **粗糙度**：中（0.6）

### 5. 苹果树材质规范

#### 树干材质

- **基础颜色**：灰褐色 RGB(90, 75, 60)
- **纹理特征**：细微垂直纹理，略显老旧
- **法线强度**：中（0.6）
- **粗糙度**：中高（0.75）

#### 叶片材质

- **基础颜色**：亮绿色 RGB(67, 125, 52)
- **纹理特征**：椭圆形叶片，叶脉清晰
- **透明度处理**：叶片边缘半透明
- **粗糙度**：中（0.55）

#### 苹果材质

- **基础颜色**：红色 RGB(195, 45, 43)
- **纹理特征**：光滑表面，微微发亮
- **法线强度**：低（0.3）
- **粗糙度**：低（0.3）
- **特殊效果**：轻微反光

#### 花朵材质

- **基础颜色**：白色/粉白色 RGB(245, 240, 235)
- **纹理特征**：柔软花瓣，微微透明
- **透明度处理**：花瓣边缘透明
- **粗糙度**：低（0.4）

#### 种子材质

- **基础颜色**：褐色 RGB(100, 80, 60)
- **纹理特征**：苹果籽扁平形状
- **粗糙度**：中低（0.5）

### 6. 枫树材质规范

#### 树干材质

- **基础颜色**：褐色 RGB(95, 70, 55)
- **纹理特征**：垂直纹理，略微不规则
- **法线强度**：中高（0.7）
- **粗糙度**：高（0.8）

#### 叶片材质(绿色版本)

- **基础颜色**：绿色 RGB(58, 112, 48)
- **纹理特征**：枫叶形状，叶脉明显
- **透明度处理**：叶片边缘清晰
- **粗糙度**：中（0.6）

#### 叶片材质(红色版本)

- **基础颜色**：红色 RGB(185, 65, 40)
- **纹理特征**：与绿色版本相同
- **透明度处理**：叶片边缘清晰
- **粗糙度**：中（0.6）
- **特殊效果**：轻微色彩变化

#### 种子材质

- **基础颜色**：褐色 RGB(110, 85, 60)
- **纹理特征**：带翅膀的种子形状
- **法线强度**：中（0.5）
- **粗糙度**：中（0.65）

### 7. 柳树材质规范

#### 树干材质

- **基础颜色**：灰褐色 RGB(100, 90, 75)
- **纹理特征**：垂直纹理，略显光滑
- **法线强度**：中（0.6）
- **粗糙度**：中高（0.75）

#### 枝条材质

- **基础颜色**：浅褐色 RGB(130, 110, 85)
- **纹理特征**：细长光滑
- **法线强度**：低（0.4）
- **粗糙度**：中（0.65）

#### 叶片材质

- **基础颜色**：浅绿色 RGB(100, 145, 75)
- **纹理特征**：细长柳叶，叶脉细微
- **透明度处理**：叶片边缘半透明
- **粗糙度**：中（0.55）
- **特殊效果**：叶片轻微摆动效果的法线贴图

#### 种子材质

- **基础颜色**：浅褐色 RGB(130, 115, 95)
- **纹理特征**：小巧细长种子
- **粗糙度**：中（0.6）

### 8. 稀有树种材质规范

#### 树干材质

- **基础颜色**：半透明蓝紫色 RGBA(80, 100, 180, 0.8)
- **纹理特征**：晶体状纹理，内部有发光脉络
- **法线强度**：高（0.9）
- **粗糙度**：低（0.3）
- **特殊效果**：内部发光效果(Emission=0.4)，用贴图控制发光区域

#### 叶片材质

- **基础颜色**：多彩渐变色(使用渐变贴图，基础为蓝紫色调)
- **纹理特征**：不规则形状，有晶体质感
- **透明度处理**：边缘透明，内部半透明
- **粗糙度**：低（0.3）
- **特殊效果**：边缘发光效果(Emission=0.5)

#### 果实材质

- **基础颜色**：亮紫色 RGB(170, 130, 220)
- **纹理特征**：球形晶体状，内部有纹路
- **法线强度**：中高（0.7）
- **粗糙度**：低（0.2）
- **特殊效果**：强烈发光效果(Emission=0.7)，脉动光效

#### 种子材质

- **基础颜色**：亮蓝色 RGB(100, 140, 230)
- **纹理特征**：晶体状，有内部结构
- **法线强度**：高（0.8）
- **粗糙度**：低（0.25）
- **特殊效果**：微弱发光效果(Emission=0.3)

## 材质创建流程

### 1. 参考收集

- 收集每种树木的真实参考图片
- 分析材质特性和视觉要素
- 创建材质参考板(Mood Board)

### 2. 贴图绘制

- 使用Substance Painter或Photoshop创建基础贴图
- 绘制特殊细节和自定义纹理
- 生成或调整法线贴图

### 3. 材质测试

- 在Blender中设置材质
- 调整参数以达到目标视觉效果
- 测试不同光照条件下的表现

### 4. 优化导出

- 压缩贴图，确保文件大小合适
- 合并相似材质，减少材质数量
- 导出为Three.js兼容格式

## 技术要求

### 贴图文件格式

- **颜色贴图**：PNG（带Alpha通道）
- **法线贴图**：PNG（RGB通道存储XYZ法线数据）
- **金属度/粗糙度贴图**：PNG（R通道=金属度，G通道=粗糙度）
- **环境遮蔽贴图**：PNG（单通道灰度图）

### 文件命名约定

格式：`树种_部位_贴图类型_分辨率.png`

示例：
- `橡树_树干_颜色_512.png`
- `松树_针叶_法线_512.png`
- `樱花树_花朵_金属粗糙_512.png`

### 文件组织结构

```
/材质/
  /橡树/
    /树干/
    /叶片/
    /种子/
  /松树/
    /树干/
    /针叶/
    /松果/
  ...（其他树种）
```

## 材质优先级计划

1. **第一阶段**：基础树干和叶片材质（所有树种）
2. **第二阶段**：种子和幼苗阶段材质
3. **第三阶段**：花朵、果实和特殊效果材质
4. **第四阶段**：特效和优化

---

*本文档由3D视觉设计师林小玲创建，作为TaskForest项目材质规范指南* 