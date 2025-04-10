# TaskForest 动画和特效规范

## 概述

本文档定义了TaskForest项目中3D树木模型的动画和特效标准。包括生长动画、状态变化、交互反馈和环境特效，旨在创造生动且性能优良的视觉体验。

## 动画类型

### 1. 生长动画

树木从种子到成熟的完整生长过程动画，是应用核心视觉反馈。

#### 通用生长动画规范

- **帧率**：30fps
- **动画长度**：完整生长3-5秒（可根据任务类型调整）
- **动画曲线**：使用缓动函数(Easing)，开始较快，结束较慢
- **骨骼动画**：使用简化骨骼系统控制主要变形
- **关键阶段**：种子→幼苗→成长中→成熟，每个阶段有明确视觉变化
- **细节变化**：体积膨胀、颜色变化、结构展开、细节增加

#### 阶段过渡效果

每个生长阶段间的过渡动画需平滑且具有特色：

1. **种子→幼苗**：
   - 种子开裂，幼芽突出
   - 细微的光效或颜色变化
   - 持续时间：0.5-0.8秒

2. **幼苗→成长中**：
   - 茎干拉长，初始枝叶展开
   - 颜色由浅变深
   - 持续时间：1-1.5秒

3. **成长中→成熟**：
   - 分枝扩展，叶片丰满
   - 特殊元素出现（花朵、果实等）
   - 持续时间：1.5-2秒

### 2. 状态变化动画

表现树木生命状态变化，与任务完成情况相关。

#### 健康→枯萎过程

- **渐进变化**：从轻微到严重，4个主要状态
- **视觉表现**：
  - 颜色变化（从饱和到褪色）
  - 形态变化（从挺直到下垂）
  - 粒子效果（掉落的叶子）
- **变化速度**：缓慢且渐进，表示时间流逝
- **可逆性**：任务恢复后，树木可恢复健康状态

#### 季节变化动画

- **循环性**：季节循环变化（春→夏→秋→冬）
- **变化周期**：可配置，默认为实际应用使用时间的1/12
- **视觉特征**：
  - 春季：新芽、花朵
  - 夏季：茂密叶片
  - 秋季：变色叶片、果实
  - 冬季：落叶或积雪

### 3. 交互动画

用户与树木交互时的反馈动画。

#### 选择反馈

- **持续时间**：0.3秒
- **视觉效果**：
  - 轻微放大或高亮
  - 简短摇晃或波动效果
  - 可选轮廓光效

#### 点击反馈

- **持续时间**：0.5秒
- **视觉效果**：
  - 显著波动或弹性形变
  - 粒子飘散（叶片、花瓣等）
  - 信息卡片弹出过渡

#### 完成任务庆祝动画

- **持续时间**：1.5-2秒
- **视觉效果**：
  - 明亮光效从下至上
  - 螺旋上升的粒子效果
  - 树木轻微律动
  - 可能的声音配合

## 各树种特定动画

### 1. 橡树动画特性

- **生长特点**：稳健缓慢，强调树干粗壮感
- **特殊动画**：树冠展开有"爆发感"
- **粒子效果**：偶尔掉落橡果
- **交互反馈**：沉稳摇晃，体现坚固特性

### 2. 松树动画特性

- **生长特点**：垂直向上生长，层次分明
- **特殊动画**：针叶从内向外展开
- **粒子效果**：微小针叶飘落
- **交互反馈**：顶部轻微摆动

### 3. 樱花树动画特性

- **生长特点**：优雅分枝，强调花朵盛开
- **特殊动画**：花朵绽放特效
- **粒子效果**：花瓣随风飘落
- **交互反馈**：枝条柔和摆动，花瓣飞舞

### 4. 棕榈树动画特性

- **生长特点**：快速向上，叶片从顶部展开
- **特殊动画**：扇叶展开动画
- **粒子效果**：阳光透过叶片的光斑
- **交互反馈**：叶片摇晃，热带风情

### 5. 苹果树动画特性

- **生长特点**：均衡生长，果实逐渐形成
- **特殊动画**：花朵转变为果实过程
- **粒子效果**：花瓣和叶片飘落
- **交互反馈**：果实轻微晃动

### 6. 枫树动画特性

- **生长特点**：分枝丰富，叶片张开明显
- **特殊动画**：叶片季节变色（绿→红）
- **粒子效果**：秋季落叶旋转下落
- **交互反馈**：叶片飘动，季节感强

### 7. 柳树动画特性

- **生长特点**：垂直主干迅速生长，枝条下垂
- **特殊动画**：柳条垂落动画
- **粒子效果**：微风中的柳条飘动
- **交互反馈**：柳条轻轻摆动，似水流动

### 8. 稀有树种动画特性

- **生长特点**：不规则生长，带有魔幻元素
- **特殊动画**：脉动光效，内部发光
- **粒子效果**：发光粒子环绕上升
- **交互反馈**：水晶般的震动效果，光效增强

## 特效系统

### 1. 环境粒子系统

- **叶片/花瓣飘落**：
  - 每种树木定制的飘落粒子
  - 根据季节和健康状态调整频率
  - 最大同时粒子数：50-100

- **光效粒子**：
  - 阳光透过树叶的光斑
  - 季节特效（如冬季雪花）
  - 最大同时粒子数：30-50

### 2. 成就解锁特效

- **解锁新树种**：
  - 爆发型光效
  - 盘旋上升的粒子流
  - 3D文字或图标显示
  - 持续时间：2-3秒

- **完成里程碑**：
  - 森林整体光效
  - 多棵树木同时反应
  - 天空特效变化
  - 持续时间：3-4秒

### 3. 天气和光照特效

- **日夜循环**：
  - 光照角度和颜色变化
  - 阴影长度和软硬度调整
  - 完整循环时间：可配置，默认2分钟

- **天气变化**：
  - 阳光、多云、雨天、雪天
  - 对应粒子效果和光照变化
  - 持续时间：可配置，默认5-10分钟一次变化

## 动画技术实现

### 1. 骨骼动画系统

- **骨骼层级**：
  - 主干：1-2个骨骼
  - 主要分枝：3-5个骨骼
  - 次要分枝：根据需要，通常3-8个
  
- **权重绘制**：
  - 树干区域权重平滑过渡
  - 分枝处权重精确控制
  - 叶片可使用顶点组简化

- **动画混合**：
  - 支持多动画混合
  - 交互动画可叠加在生长动画上

### 2. 着色器效果

- **风吹动画**：
  - 使用顶点着色器实现
  - 基于噪声函数的自然摆动
  - 可控制强度和频率

- **生长控制**：
  - 使用参数化着色器控制生长阶段
  - 单一参数控制多种视觉变化

- **状态变化**：
  - 颜色插值实现健康度变化
  - 顶点位移实现形态变化

### 3. 粒子系统

- **叶片/花瓣系统**：
  - 基于树木位置和类型生成
  - 受风力和重力影响
  - 优化为实例化渲染

- **特效粒子**：
  - 完成/解锁特效
  - GPU加速粒子系统
  - 基于事件触发

## 优化策略

### 1. 动画性能优化

- **LOD动画系统**：
  - 远距离树木使用简化动画
  - 非交互树木降低动画更新频率
  - 视野外树木暂停动画

- **实例化动画**：
  - 使用GPU实例化技术
  - 类似树木共享动画数据
  - 减少CPU动画计算负担

- **批处理更新**：
  - 分批次更新动画状态
  - 避免同时更新所有树木

### 2. 特效性能优化

- **粒子池**：
  - 预分配粒子对象池
  - 避免运行时创建/销毁
  
- **距离衰减**：
  - 远处特效数量递减
  - 简化远处特效细节

- **视野剔除**：
  - 视野外特效暂停
  - 摄像机转向时平滑恢复

## 导出和集成规范

### 1. 动画导出格式

- **骨骼动画**：glTF格式，包含骨骼和蒙皮数据
- **变形动画**：导出关键帧变形目标
- **参数动画**：导出可在Three.js中控制的参数

### 2. 动画组织结构

- **文件命名**：`树种_动画类型_描述.glb/gltf`
- **动画轨道命名**：`动作类型.状态`，如`生长.种子到幼苗`

### 3. 集成注意事项

- 确保骨骼名称一致性
- 提供动画混合和过渡参数
- 记录每个动画的推荐播放速度和过渡时间

## 动画开发时间表

### 第1-2周：基础设置

- 建立骨骼系统
- 开发基础生长动画框架
- 测试动画导出/导入工作流

### 第3-4周：核心动画实现

- 所有树种的生长动画
- 状态变化基础动画
- 简单交互反馈

### 第5-6周：特效系统

- 粒子系统开发
- 特殊视觉效果实现
- 环境动画整合

### 第7-8周：优化和完善

- 性能测试和优化
- 动画细节完善
- 交付最终动画资产

---

*本文档由3D视觉设计师林小玲创建，作为TaskForest项目动画和特效规范指南* 