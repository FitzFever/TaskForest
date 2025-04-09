# 树木健康状态系统前端组件开发指南

本文档提供TaskForest项目中树木健康状态系统相关前端组件的设计思路、实现方法和使用指南，帮助开发者理解和扩展这些组件。

## 1. 组件概述

树木健康状态系统的前端组件主要包括：

1. **TreeHealthPanel**：树木健康状态详情面板
2. **TreeHealthIndicator**：树木健康状态指示器
3. **TreeGrowthAnimation**：树木生长和健康状态动画组件
4. **TreeHealth3DRenderer**：3D场景中树木健康状态渲染器

这些组件共同协作，将树木健康状态以直观的方式展示给用户，并允许用户通过更新任务进度来影响树木健康状态。

## 2. TreeHealthPanel 组件

### 2.1 组件功能

TreeHealthPanel是一个核心UI组件，用于显示树木的健康状态详情、健康预测以及提供任务进度更新功能。

### 2.2 组件API

```tsx
interface TreeHealthPanelProps {
  treeId?: string;           // 树木ID（与taskId二选一）
  taskId?: string;           // 任务ID（与treeId二选一）
  showProgress?: boolean;    // 是否显示进度更新控件（默认true）
  onProgressUpdate?: (taskId: string, progress: number) => void; // 进度更新回调
  style?: React.CSSProperties; // 自定义样式
  className?: string;        // 自定义类名
}
```

### 2.3 使用示例

```tsx
// 基于树木ID使用
<TreeHealthPanel treeId="123" />

// 基于任务ID使用
<TreeHealthPanel 
  taskId="456" 
  onProgressUpdate={(taskId, progress) => {
    console.log(`任务${taskId}进度更新为${progress}%`);
    // 执行其他操作...
  }}
/>

// 隐藏进度更新控件
<TreeHealthPanel treeId="123" showProgress={false} />
```

### 2.4 实现细节

TreeHealthPanel组件内部实现：

```tsx
import React, { useEffect, useState } from 'react';
import { Card, Progress, Tag, Tooltip, Statistic, Divider, Alert, Button, Typography, Slider } from 'antd';
import { 
  HeartOutlined, 
  ClockCircleOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons';
import { TreeHealthDetails, TaskTreeHealth, HealthCategory, HealthTrend } from '../services/treeHealthService';
import * as treeHealthService from '../services/treeHealthService';

const { Title, Text } = Typography;

const TreeHealthPanel: React.FC<TreeHealthPanelProps> = ({ 
  treeId, 
  taskId, 
  showProgress = true,
  onProgressUpdate,
  style,
  className
}) => {
  // 状态定义
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [treeHealth, setTreeHealth] = useState<TreeHealthDetails | null>(null);
  const [taskHealth, setTaskHealth] = useState<TaskTreeHealth | null>(null);
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);

  // 加载数据
  useEffect(() => {
    // 实现数据加载逻辑
  }, [treeId, taskId]);

  // 更新进度
  const handleProgressUpdate = async () => {
    // 实现进度更新逻辑
  };

  // 渲染健康状态、预测和进度更新UI
  return (
    <Card 
      loading={loading} 
      bordered={false} 
      style={style}
      className={className}
    >
      {/* 组件UI实现 */}
    </Card>
  );
};

export default TreeHealthPanel;
```

### 2.5 设计考虑

TreeHealthPanel设计中的主要考虑点：

1. **数据加载模式**：支持通过树木ID或任务ID两种方式加载健康状态
2. **响应式设计**：适应不同屏幕尺寸的布局
3. **交互反馈**：进度更新有明确的视觉反馈
4. **错误处理**：优雅处理数据加载和更新过程中的错误
5. **定制性**：通过props提供灵活的样式定制能力

## 3. TreeHealthIndicator 组件

### 3.1 组件功能

TreeHealthIndicator是一个轻量级组件，用于在列表或其他紧凑界面中显示树木健康状态的简明指示器。

### 3.2 组件API

```tsx
interface TreeHealthIndicatorProps {
  healthState: number;        // 健康状态值(0-100)
  healthCategory?: HealthCategory; // 健康状态类别(可选)
  size?: 'small' | 'default' | 'large'; // 尺寸（默认'default'）
  showText?: boolean;         // 是否显示文本（默认true）
  style?: React.CSSProperties; // 自定义样式
  className?: string;         // 自定义类名
}
```

### 3.3 使用示例

```tsx
// 基本使用
<TreeHealthIndicator healthState={85} />

// 带类别的使用
<TreeHealthIndicator 
  healthState={45} 
  healthCategory={HealthCategory.MODERATELY_WILTED} 
/>

// 小尺寸无文本
<TreeHealthIndicator 
  healthState={20} 
  size="small" 
  showText={false} 
/>
```

### 3.4 实现细节

TreeHealthIndicator组件内部实现：

```tsx
import React from 'react';
import { Tooltip, Tag } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { HealthCategory } from '../services/treeHealthService';

// 尺寸映射
const sizeMap = {
  small: 16,
  default: 24,
  large: 32
};

// 获取健康状态名称
const getHealthCategoryName = (category: HealthCategory): string => {
  // 实现类别名称转换
};

// 获取健康状态颜色
const getHealthColor = (healthState: number): string => {
  // 实现健康值到颜色的映射
};

const TreeHealthIndicator: React.FC<TreeHealthIndicatorProps> = ({
  healthState,
  healthCategory,
  size = 'default',
  showText = true,
  style,
  className
}) => {
  // 计算显示类别
  const category = healthCategory || (
    healthState >= 75 ? HealthCategory.HEALTHY :
    healthState >= 50 ? HealthCategory.SLIGHTLY_WILTED :
    healthState >= 25 ? HealthCategory.MODERATELY_WILTED :
    HealthCategory.SEVERELY_WILTED
  );
  
  // 获取颜色和名称
  const color = getHealthColor(healthState);
  const name = getHealthCategoryName(category);
  
  // 渲染指示器
  return (
    <Tooltip title={`健康状态: ${healthState}%`}>
      <div 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center',
          ...style 
        }}
        className={className}
      >
        {healthState >= 50 ? (
          <HeartFilled 
            style={{ 
              color, 
              fontSize: sizeMap[size] 
            }} 
          />
        ) : (
          <HeartOutlined 
            style={{ 
              color, 
              fontSize: sizeMap[size] 
            }} 
          />
        )}
        
        {showText && (
          <Tag 
            color={color} 
            style={{ marginLeft: 4 }}
          >
            {name}
          </Tag>
        )}
      </div>
    </Tooltip>
  );
};

export default TreeHealthIndicator;
```

## 4. TreeGrowthAnimation 组件

### 4.1 组件功能

TreeGrowthAnimation组件用于在2D环境中显示树木生长和健康状态变化的动画效果。

### 4.2 组件API

```tsx
interface TreeGrowthAnimationProps {
  healthState: number;        // 健康状态值(0-100)
  previousHealth?: number;    // 先前的健康状态(可选)
  growthStage: number;        // 生长阶段(0-5)
  treeType: string;           // 树木类型
  width?: number;             // 宽度(默认200)
  height?: number;            // 高度(默认250)
  animated?: boolean;         // 是否启用动画(默认true)
  style?: React.CSSProperties; // 自定义样式
  className?: string;         // 自定义类名
}
```

### 4.3 使用示例

```tsx
// 基本使用
<TreeGrowthAnimation 
  healthState={85} 
  growthStage={3} 
  treeType="oak" 
/>

// 带健康状态变化动画
<TreeGrowthAnimation 
  healthState={60} 
  previousHealth={85} 
  growthStage={4} 
  treeType="cherry" 
  width={300}
  height={350}
/>

// 静态显示(无动画)
<TreeGrowthAnimation 
  healthState={40} 
  growthStage={2} 
  treeType="pine" 
  animated={false} 
/>
```

### 4.4 实现细节

TreeGrowthAnimation组件使用Canvas绘制动画，内部实现：

```tsx
import React, { useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { treeAssets } from '../assets/trees';

const TreeGrowthAnimation: React.FC<TreeGrowthAnimationProps> = ({
  healthState,
  previousHealth,
  growthStage,
  treeType,
  width = 200,
  height = 250,
  animated = true,
  style,
  className
}) => {
  // 创建Canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 设置健康状态变化动画
  const { currentHealth } = useSpring({
    from: { currentHealth: previousHealth ?? healthState },
    to: { currentHealth: healthState },
    config: { duration: 1000 },
    immediate: !animated || previousHealth === undefined
  });
  
  // 渲染树木
  useEffect(() => {
    const renderTree = () => {
      // 实现树木渲染逻辑
    };
    
    // 设置动画循环
    let animationId: number;
    const animate = () => {
      renderTree();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // 清理
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentHealth, growthStage, treeType, width, height]);
  
  // 渲染组件
  return (
    <div 
      style={{ width, height, ...style }} 
      className={className}
    >
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
      />
    </div>
  );
};

export default TreeGrowthAnimation;
```

## 5. TreeHealth3DRenderer 组件

### 5.1 组件功能

TreeHealth3DRenderer组件负责在Three.js 3D场景中根据健康状态渲染树木，通常作为ForestScene组件的一部分。

### 5.2 集成方式

这个组件通常不直接使用，而是作为TreeModel或ForestScene的内部功能：

```tsx
// 在ForestScene组件中集成
const renderTree = (tree: TreeData) => {
  // 加载树木模型
  const model = treeModels[tree.type][tree.growthStage];
  
  // 应用健康状态
  if (tree.healthState !== undefined) {
    applyTreeHealthState(model, tree.healthState);
  }
  
  return model;
};

// 在TreeModel组件中集成
const TreeModel: React.FC<TreeModelProps> = ({
  type,
  growthStage,
  healthState,
  position,
  rotation
}) => {
  // 实现代码...
  
  return (
    <group position={position} rotation={rotation}>
      <primitive object={model} />
      {healthState !== undefined && (
        <TreeHealth3DEffect healthState={healthState} />
      )}
    </group>
  );
};
```

### 5.3 健康状态效果实现

基本实现逻辑：

```tsx
// 应用健康状态到树木模型
const applyTreeHealthState = (model: THREE.Object3D, healthState: number) => {
  // 获取健康状态外观参数
  const appearance = getTreeAppearance(healthState);
  
  // 遍历树木材质并应用外观
  model.traverse(node => {
    if (node instanceof THREE.Mesh) {
      const material = node.material as THREE.MeshStandardMaterial;
      
      // 叶片材质处理
      if (material.name.includes('leaf') || material.name.includes('leaves')) {
        // 应用叶片颜色
        material.color.set(appearance.leafColor);
        
        // 设置叶片密度（通过透明度或缩放）
        if (appearance.leafDensity < 1.0) {
          material.transparent = true;
          material.opacity = appearance.leafDensity;
        }
      }
      
      // 树干材质处理
      if (material.name.includes('trunk') || material.name.includes('bark')) {
        material.color.set(appearance.trunkColor);
      }
    }
  });
  
  // 应用动画效果
  applyTreeAnimation(model, appearance.animation);
  
  // 如果需要粒子效果
  if (appearance.particles.enabled) {
    addParticleEffect(model, appearance.particles);
  }
};
```

## 6. 健康状态与视觉效果映射

### 6.1 健康状态视觉表现

不同健康状态的视觉表现：

| 健康状态 | 叶片颜色 | 叶片密度 | 树干颜色 | 动画效果 | 粒子效果 |
|---------|---------|---------|---------|---------|---------|
| 健康 (75-100%) | #4CAF50 (翠绿) | 100% | #795548 (健康棕) | 轻柔摇摆 | 无 |
| 轻微枯萎 (50-75%) | #8BC34A (淡绿) | 80% | #795548 (健康棕) | 轻柔摇摆 | 接近临界时淡黄粒子 |
| 中度枯萎 (25-50%) | #CDDC39 (黄绿) | 50% | #6D4C41 (深棕) | 微弱摇摆 | 黄色下落粒子 |
| 严重枯萎 (0-25%) | #FF9800 (橙黄) | 20% | #5D4037 (暗褐) | 几乎不动 | 红色下落粒子、濒死闪烁 |

### 6.2 状态转换效果

健康状态变化时的过渡效果：

1. **改善效果**：
   - 叶片颜色从黄向绿渐变
   - 绿色上升粒子
   - 树木轻微晃动
   - 叶片密度增加

2. **恶化效果**：
   - 叶片颜色从绿向黄渐变
   - 黄色/橙色下落粒子
   - 树木微微下垂
   - 叶片密度减少

## 7. 组件组合模式

### 7.1 在任务详情中使用

```tsx
// TaskDetail.tsx
import { TreeHealthPanel, TreeHealthIndicator } from '../components';

const TaskDetail: React.FC<{ taskId: string }> = ({ taskId }) => {
  return (
    <div className="task-detail">
      <div className="task-header">
        <h1>{task.title}</h1>
        <TreeHealthIndicator 
          healthState={task.tree?.healthState || 100} 
          size="large" 
        />
      </div>
      
      <div className="task-content">
        {/* 任务内容... */}
      </div>
      
      <div className="task-sidebar">
        <TreeHealthPanel 
          taskId={taskId}
          onProgressUpdate={handleProgressUpdate}
        />
      </div>
    </div>
  );
};
```

### 7.2 在森林场景中使用

```tsx
// ForestView.tsx
import { ForestScene, TreeGrowthAnimation } from '../components';

const ForestView: React.FC = () => {
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  
  return (
    <div className="forest-view">
      <div className="main-scene">
        <ForestScene 
          trees={trees}
          onTreeClick={(treeId) => {
            const tree = trees.find(t => t.id === treeId);
            setSelectedTree(tree || null);
          }}
        />
      </div>
      
      {selectedTree && (
        <div className="tree-preview">
          <TreeGrowthAnimation 
            healthState={selectedTree.healthState || 100}
            growthStage={selectedTree.growthStage}
            treeType={selectedTree.type}
            width={150}
            height={200}
          />
          <TreeHealthPanel 
            treeId={selectedTree.id.toString()}
          />
        </div>
      )}
    </div>
  );
};
```

## 8. 性能优化

### 8.1 渲染优化

1. **按需渲染**：
   - 使用React.memo包装组件
   - 在ForestScene中对远处的树木使用低精度模型
   - 使用useCallback避免不必要的回调函数重建

2. **动画优化**：
   - 使用requestAnimationFrame而非setTimeout
   - 只在健康状态变化时触发动画
   - 使用canvas代替DOM动画

### 8.2 数据加载优化

1. **缓存策略**：
   - 缓存健康状态数据避免频繁请求
   - 使用React Query管理数据获取和缓存

2. **批量加载**：
   - 一次性加载多棵树木的健康状态
   - 视口内树木优先加载健康状态

## 9. 常见问题与解决方案

### 9.1 动画性能问题

**问题**：大量树木同时显示动画效果导致性能下降。

**解决方案**：
- 限制同时播放的动画数量
- 根据视距调整动画复杂度
- 使用GPU加速动画
- 对于非焦点树木禁用动画

### 9.2 状态更新延迟

**问题**：进度更新后树木健康状态变化有延迟。

**解决方案**：
- 使用乐观更新策略
- 实现客户端预测
- 添加加载状态指示器
- 使用WebSocket实时推送更新

## 10. 扩展指南

### 10.1 添加新的视觉效果

添加新的健康状态视觉效果的步骤：

1. 在`getTreeAppearance`函数中添加新的外观参数
2. 在渲染组件中实现新参数的视觉效果
3. 更新文档和类型定义

### 10.2 创建自定义健康状态组件

创建自定义健康状态组件的方法：

1. 使用现有的健康状态服务API获取数据
2. 实现自定义UI组件
3. 复用健康状态计算和转换逻辑

## 11. 参考文档

- [树木健康状态系统详细设计](/docs/modules/tree_health_system.md)
- [树木健康状态实施指南](/docs/guides/tree_health_implementation_guide.md)
- [API参考文档](/docs/api/tree_health_api.md)
- [React Three Fiber文档](https://docs.pmnd.rs/react-three-fiber)
- [Ant Design组件库文档](https://ant.design/components/overview) 