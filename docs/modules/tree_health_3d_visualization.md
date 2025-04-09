# 树木健康状态3D可视化指南

本文档详细说明如何在TaskForest项目中实现树木健康状态的3D可视化效果，包括模型处理、材质变化、动画效果和粒子系统。

## 1. 概述

树木健康状态的3D可视化是TaskForest项目的核心视觉特性，通过改变树木外观，直观地表现任务的健康状态和紧急程度。这种可视化包括叶片颜色变化、树木姿态调整、粒子效果和动画变化等。

## 2. 技术栈

- **Three.js**：核心3D渲染库
- **React Three Fiber**：React组件化封装
- **drei**：Three.js工具库
- **GSAP**：动画控制库
- **react-spring**：物理动画库

## 3. 树木模型结构

### 3.1 模型组织

树木模型按照以下结构组织：

```
TreeModel/
├── trunk (树干)
├── branches (主干分支)
├── leaves (叶片组)
│   ├── leaves_group_1
│   ├── leaves_group_2
│   └── ...
└── particles (粒子效果挂载点)
```

### 3.2 关键材质

各部分材质命名约定：

- 树干材质：`trunk_material`
- 分支材质：`branch_material`
- 叶片材质：`leaves_material_[group_index]`
- 粒子材质：`particle_material_[type]`

## 4. 健康状态视觉映射

### 4.1 叶片颜色与密度

不同健康状态下的叶片变化：

| 健康状态 | 健康值范围 | 叶片基础颜色 | HSL调整 | 不透明度 | 特殊效果 |
|---------|-----------|------------|---------|---------|---------|
| 健康 | 75-100 | #4CAF50 | hsl(120, 60%, 50%) | 1.0 | 叶片微光 |
| 轻微枯萎 | 50-75 | #8BC34A | hsl(90, 55%, 45%) | 0.9 | 少量黄叶 |
| 中度枯萎 | 25-50 | #CDDC39 | hsl(60, 50%, 40%) | 0.7 | 大量黄叶 |
| 严重枯萎 | 0-25 | #FF9800 | hsl(30, 45%, 35%) | 0.5 | 叶片脱落 |

### 4.2 树干与分支变化

| 健康状态 | 树干颜色 | 分支倾斜调整 | 树干缩放 |
|---------|---------|-------------|---------|
| 健康 | #795548 | 0° | 1.0 |
| 轻微枯萎 | #6D4C41 | 2° | 0.98 |
| 中度枯萎 | #5D4037 | 5° | 0.95 |
| 严重枯萎 | #4E342E | 8° | 0.9 |

### 4.3 粒子效果

| 健康状态 | 粒子颜色 | 粒子数量 | 粒子行为 | 粒子类型 |
|---------|---------|---------|---------|---------|
| 健康 | #8BC34A | 少量 | 上升 | 孢子/光点 |
| 轻微枯萎 | #FFF59D | 中等 | 缓慢下落 | 小黄叶 |
| 中度枯萎 | #FFC107 | 较多 | 下落 | 黄叶 |
| 严重枯萎 | #FF5722 | 大量 | 快速下落 | 枯叶 |

## 5. 实现方法

### 5.1 叶片颜色变化实现

```javascript
/**
 * 应用健康状态到叶片材质
 * @param {THREE.Material|THREE.Material[]} material 叶片材质
 * @param {number} healthState 健康状态值(0-100)
 */
function applyLeafHealthState(material, healthState) {
  // 确保处理材质数组
  const materials = Array.isArray(material) ? material : [material];
  
  // 计算健康状态对应的颜色
  let color, opacity;
  
  if (healthState >= 75) {
    // 健康状态
    color = new THREE.Color('#4CAF50');
    opacity = 1.0;
  } else if (healthState >= 50) {
    // 轻微枯萎
    color = new THREE.Color('#8BC34A');
    opacity = 0.9;
  } else if (healthState >= 25) {
    // 中度枯萎
    color = new THREE.Color('#CDDC39');
    opacity = 0.7;
  } else {
    // 严重枯萎
    color = new THREE.Color('#FF9800');
    opacity = 0.5;
  }
  
  // 应用到所有材质
  materials.forEach(mat => {
    if (!mat) return;
    
    // 设置颜色
    mat.color.copy(color);
    
    // 设置透明度（如果需要）
    if (opacity < 1.0) {
      mat.transparent = true;
      mat.opacity = opacity;
      
      // 更新混合模式
      mat.blending = THREE.NormalBlending;
    }
    
    // 更新材质
    mat.needsUpdate = true;
  });
}
```

### 5.2 树木姿态变化实现

```javascript
/**
 * 应用健康状态到树木姿态
 * @param {THREE.Object3D} treeObj 树木对象
 * @param {number} healthState 健康状态值(0-100)
 */
function applyTreePosture(treeObj, healthState) {
  // 找到树干和分支组
  const trunk = treeObj.getObjectByName('trunk');
  const branches = treeObj.getObjectByName('branches');
  
  if (!trunk && !branches) return;
  
  // 计算倾斜角度（健康状态越低，倾斜越明显）
  const maxTilt = 0.15; // 最大倾斜弧度
  const tiltFactor = Math.max(0, 1 - (healthState / 100));
  const tilt = maxTilt * tiltFactor;
  
  // 计算缩放因子（健康状态越低，缩放越小）
  const minScale = 0.9;
  const scale = minScale + ((1 - minScale) * (healthState / 100));
  
  // 应用到树干
  if (trunk) {
    // 使用GSAP进行平滑过渡
    gsap.to(trunk.rotation, {
      x: tilt * (Math.random() > 0.5 ? 1 : -1), // 随机倾斜方向
      duration: 1.5,
      ease: "power2.out"
    });
    
    gsap.to(trunk.scale, {
      y: scale,
      duration: 1.5,
      ease: "power2.out"
    });
  }
  
  // 应用到分支
  if (branches) {
    gsap.to(branches.rotation, {
      x: tilt * 1.5 * (Math.random() > 0.5 ? 1 : -1), // 分支倾斜更明显
      duration: 1.8,
      ease: "power2.out"
    });
  }
}
```

### 5.3 粒子效果实现

```javascript
/**
 * 创建健康状态相关粒子效果
 * @param {THREE.Object3D} treeObj 树木对象
 * @param {number} healthState 健康状态值(0-100)
 * @returns {THREE.Points} 粒子系统
 */
function createHealthParticles(treeObj, healthState) {
  // 确定粒子参数
  let particleConfig = {
    count: 0,       // 粒子数量
    color: '#FFFFFF', // 粒子颜色
    size: 0.05,     // 粒子大小
    speed: 0.01,    // 粒子速度
    direction: 'up', // 粒子方向
    lifetime: 2000  // 粒子生命周期(毫秒)
  };
  
  // 根据健康状态设置粒子参数
  if (healthState >= 75) {
    // 健康 - 少量上升孢子
    particleConfig.count = 10;
    particleConfig.color = '#8BC34A';
    particleConfig.direction = 'up';
  } else if (healthState >= 50) {
    // 轻微枯萎 - 少量下落叶片
    particleConfig.count = 15;
    particleConfig.color = '#FFF59D';
    particleConfig.size = 0.08;
    particleConfig.direction = 'down';
  } else if (healthState >= 25) {
    // 中度枯萎 - 中等下落叶片
    particleConfig.count = 25;
    particleConfig.color = '#FFC107';
    particleConfig.size = 0.1;
    particleConfig.speed = 0.02;
    particleConfig.direction = 'down';
  } else {
    // 严重枯萎 - 大量下落叶片
    particleConfig.count = 40;
    particleConfig.color = '#FF5722';
    particleConfig.size = 0.12;
    particleConfig.speed = 0.03;
    particleConfig.direction = 'down';
  }
  
  // 如果没有粒子，返回null
  if (particleConfig.count === 0) {
    return null;
  }
  
  // 创建粒子几何体
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = particleConfig.count;
  
  // 创建粒子位置
  const positions = new Float32Array(particlesCount * 3);
  const velocities = new Float32Array(particlesCount * 3);
  const lifetimes = new Float32Array(particlesCount);
  
  // 获取树木边界框
  const boundingBox = new THREE.Box3().setFromObject(treeObj);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // 设置初始粒子位置
  for (let i = 0; i < particlesCount; i++) {
    // 随机位置（在树木边界内）
    positions[i * 3] = (Math.random() - 0.5) * size.x * 0.8;
    positions[i * 3 + 1] = boundingBox.min.y + size.y * (0.7 + Math.random() * 0.3); // 从树的上部开始
    positions[i * 3 + 2] = (Math.random() - 0.5) * size.z * 0.8;
    
    // 随机速度
    velocities[i * 3] = (Math.random() - 0.5) * 0.01;
    velocities[i * 3 + 1] = particleConfig.direction === 'up' 
      ? particleConfig.speed + Math.random() * 0.01
      : -particleConfig.speed - Math.random() * 0.01;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    
    // 随机生命周期
    lifetimes[i] = Math.random() * particleConfig.lifetime;
  }
  
  // 设置粒子属性
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  particlesGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
  
  // 创建粒子材质
  const particlesMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(particleConfig.color),
    size: particleConfig.size,
    transparent: true,
    opacity: 0.8,
    map: getParticleTexture(healthState),
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  // 创建粒子系统
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  particles.name = 'health_particles';
  particles.userData.config = particleConfig;
  
  // 添加到树木对象
  treeObj.add(particles);
  
  // 返回粒子系统
  return particles;
}

/**
 * 更新粒子系统
 * @param {THREE.Points} particles 粒子系统
 * @param {number} deltaTime 时间增量(秒)
 */
function updateParticles(particles, deltaTime) {
  if (!particles) return;
  
  const geometry = particles.geometry;
  const positions = geometry.attributes.position.array;
  const velocities = geometry.attributes.velocity.array;
  const lifetimes = geometry.attributes.lifetime.array;
  const config = particles.userData.config;
  
  const count = positions.length / 3;
  const boundingBox = new THREE.Box3().setFromObject(particles.parent);
  
  // 更新每个粒子
  for (let i = 0; i < count; i++) {
    // 更新生命周期
    lifetimes[i] -= deltaTime * 1000;
    
    // 如果生命周期结束，重置粒子
    if (lifetimes[i] <= 0) {
      resetParticle(i, positions, velocities, lifetimes, boundingBox, config);
      continue;
    }
    
    // 更新位置
    positions[i * 3] += velocities[i * 3] * deltaTime;
    positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
    positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
    
    // 如果粒子超出边界，重置它
    if (
      positions[i * 3 + 1] < boundingBox.min.y || 
      positions[i * 3 + 1] > boundingBox.max.y * 1.5
    ) {
      resetParticle(i, positions, velocities, lifetimes, boundingBox, config);
    }
  }
  
  // 更新几何体
  geometry.attributes.position.needsUpdate = true;
}

/**
 * 重置粒子
 */
function resetParticle(index, positions, velocities, lifetimes, boundingBox, config) {
  // 重置实现...
}
```

### 5.4 完整的树木健康状态渲染

```javascript
/**
 * 根据健康状态渲染树木
 * @param {THREE.Object3D} treeObj 树木对象
 * @param {number} healthState 健康状态值(0-100)
 * @param {number} prevHealthState 之前的健康状态(可选)
 */
function renderTreeHealthState(treeObj, healthState, prevHealthState) {
  // 移除现有粒子系统
  const existingParticles = treeObj.getObjectByName('health_particles');
  if (existingParticles) {
    treeObj.remove(existingParticles);
  }
  
  // 查找叶片组
  const leaves = [];
  treeObj.traverse(child => {
    if (child.name.includes('leaves') && child.material) {
      leaves.push(child);
    }
  });
  
  // 应用健康状态到叶片
  leaves.forEach(leaf => {
    applyLeafHealthState(leaf.material, healthState);
  });
  
  // 应用健康状态到树木姿态
  applyTreePosture(treeObj, healthState);
  
  // 创建粒子效果
  const particles = createHealthParticles(treeObj, healthState);
  
  // 如果健康状态发生了显著变化，添加过渡动画
  if (prevHealthState !== undefined && Math.abs(healthState - prevHealthState) > 10) {
    addHealthChangeAnimation(treeObj, prevHealthState, healthState);
  }
  
  // 设置更新循环
  if (particles) {
    const updateLoop = (time, deltaTime) => {
      updateParticles(particles, deltaTime);
    };
    
    // 添加到渲染循环
    treeObj.userData.updateCallbacks = treeObj.userData.updateCallbacks || [];
    treeObj.userData.updateCallbacks.push(updateLoop);
  }
}
```

## 6. React Three Fiber 实现

### 6.1 树木健康状态组件

```jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

const TreeWithHealth = ({ 
  position, 
  rotation, 
  scale, 
  type = 'oak', 
  growthStage = 3, 
  healthState = 100, 
  previousHealth
}) => {
  const treeRef = useRef();
  const particlesRef = useRef();
  const { scene } = useGLTF(`/models/trees/${type}_stage_${growthStage}.glb`);
  
  // 健康状态弹性动画
  const { currentHealth } = useSpring({
    from: { currentHealth: previousHealth ?? healthState },
    to: { currentHealth: healthState },
    config: { tension: 120, friction: 14 }
  });
  
  // 克隆模型
  useEffect(() => {
    if (treeRef.current) {
      // 清除现有子对象
      while (treeRef.current.children.length) {
        treeRef.current.remove(treeRef.current.children[0]);
      }
      
      // 添加新模型
      const newTree = scene.clone();
      treeRef.current.add(newTree);
    }
  }, [type, growthStage, scene]);
  
  // 应用健康状态
  useEffect(() => {
    if (treeRef.current) {
      // 找到叶片
      const leaves = [];
      treeRef.current.traverse(child => {
        if (child.name.includes('leaves') && child.material) {
          leaves.push(child);
        }
      });
      
      // 应用健康状态到叶片
      leaves.forEach(leaf => {
        applyLeafHealthState(leaf.material, healthState);
      });
      
      // 创建粒子效果
      const particles = createHealthParticles(treeRef.current, healthState);
      particlesRef.current = particles;
    }
  }, [healthState]);
  
  // 更新循环
  useFrame((state, delta) => {
    // 更新粒子
    if (particlesRef.current) {
      updateParticles(particlesRef.current, delta);
    }
    
    // 应用姿态动画
    if (treeRef.current) {
      const health = currentHealth.get();
      applyTreePosture(treeRef.current, health);
    }
  });
  
  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <group ref={treeRef} />
    </group>
  );
};

export default TreeWithHealth;
```

### 6.2 健康状态变化效果

```jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HealthChangeEffect = ({ position, healthBefore, healthAfter }) => {
  const particlesRef = useRef();
  const timeRef = useRef(0);
  const durationRef = useRef(2); // 效果持续2秒
  
  // 创建效果
  useEffect(() => {
    // 确定是改善还是恶化
    const isImproving = healthAfter > healthBefore;
    
    // 确定粒子颜色
    const color = isImproving ? '#4CAF50' : '#FF9800';
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const particleCount = Math.abs(healthAfter - healthBefore) / 2;
    
    // 设置粒子属性...
    
    // 创建粒子系统
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [healthBefore, healthAfter]);
  
  // 更新粒子
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    // 更新时间
    timeRef.current += delta;
    
    // 更新粒子...
    
    // 如果效果结束，移除粒子
    if (timeRef.current >= durationRef.current) {
      if (particlesRef.current.parent) {
        particlesRef.current.parent.remove(particlesRef.current);
      }
      particlesRef.current = null;
    }
  });
  
  return particlesRef.current ? <primitive object={particlesRef.current} position={position} /> : null;
};

export default HealthChangeEffect;
```

## 7. 性能优化

### 7.1 LOD实现

为了提高性能，对于远处的树木，可以使用简化的健康状态渲染：

```jsx
import { LOD } from 'three';
import { useLOD } from '@react-three/drei';

const TreeWithHealthLOD = (props) => {
  const lodRef = useRef();
  
  // 设置不同细节级别
  useEffect(() => {
    if (lodRef.current) {
      const lod = new LOD();
      
      // 高细节（近距离）
      lod.addLevel(createDetailedTree(props), 0);
      
      // 中等细节（中等距离）
      lod.addLevel(createMediumTree(props), 10);
      
      // 低细节（远距离）
      lod.addLevel(createSimpleTree(props), 25);
      
      lodRef.current.add(lod);
    }
  }, [props]);
  
  return <group ref={lodRef} position={props.position} />;
};
```

### 7.2 实例化渲染

对于大量相似树木，使用实例化渲染提高性能：

```jsx
import { InstancedMesh, Matrix4 } from 'three';
import { useEffect, useRef } from 'react';

const TreesInstanced = ({ trees, treeType, growthStage }) => {
  const meshRef = useRef();
  
  useEffect(() => {
    // 加载基础几何体和材质...
    
    // 创建实例化网格
    const instancedMesh = new InstancedMesh(geometry, material, trees.length);
    
    // 设置每棵树的矩阵和健康状态
    const matrix = new Matrix4();
    const colorArray = new Float32Array(trees.length * 3);
    
    trees.forEach((tree, i) => {
      // 设置位置、旋转和缩放
      matrix.setPosition(tree.position.x, tree.position.y, tree.position.z);
      instancedMesh.setMatrixAt(i, matrix);
      
      // 设置健康状态颜色
      const color = getHealthColor(tree.healthState);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    });
    
    // 更新实例化网格
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));
    
    meshRef.current = instancedMesh;
  }, [trees, treeType, growthStage]);
  
  // 渲染...
};
```

## 8. 测试与调试

### 8.1 健康状态可视化调试

创建健康状态可视化调试工具：

```jsx
const TreeHealthDebugger = () => {
  const [healthState, setHealthState] = useState(100);
  
  return (
    <div>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TreeWithHealth 
          position={[0, 0, 0]} 
          type="oak" 
          growthStage={3} 
          healthState={healthState} 
        />
        <OrbitControls />
      </Canvas>
      
      <div className="controls">
        <label>健康状态: {healthState}</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={healthState} 
          onChange={(e) => setHealthState(parseInt(e.target.value))} 
        />
        
        <button onClick={() => setHealthState(100)}>健康</button>
        <button onClick={() => setHealthState(60)}>轻微枯萎</button>
        <button onClick={() => setHealthState(40)}>中度枯萎</button>
        <button onClick={() => setHealthState(15)}>严重枯萎</button>
      </div>
    </div>
  );
};
```

## 9. 拓展功能

### 9.1 季节变化效果

结合健康状态与季节变化：

```javascript
function applySeasonalEffect(treeObj, season, healthState) {
  // 季节参数
  const seasonalParams = {
    spring: {
      leafColor: '#8BC34A',
      particleEffect: 'blossom',
      ambientMultiplier: 1.1
    },
    summer: {
      leafColor: '#4CAF50',
      particleEffect: 'firefly',
      ambientMultiplier: 1.0
    },
    autumn: {
      leafColor: '#FFC107',
      particleEffect: 'falling_leaves',
      ambientMultiplier: 0.9
    },
    winter: {
      leafColor: '#ECEFF1',
      particleEffect: 'snow',
      ambientMultiplier: 0.7
    }
  };
  
  // 获取季节参数
  const params = seasonalParams[season];
  
  // 结合健康状态与季节
  const combinedHealthFactor = healthState / 100 * params.ambientMultiplier;
  
  // 应用效果...
}
```

### 9.2 天气影响效果

添加天气效果：

```javascript
function applyWeatherEffect(treeObj, weather, healthState) {
  // 天气参数
  const weatherParams = {
    sunny: {
      particleEffect: null,
      animation: 'gentle_sway',
      lightIntensity: 1.0
    },
    rainy: {
      particleEffect: 'rain',
      animation: 'sway_wind',
      lightIntensity: 0.7
    },
    windy: {
      particleEffect: 'wind',
      animation: 'heavy_sway',
      lightIntensity: 0.9
    },
    snowy: {
      particleEffect: 'snow',
      animation: 'gentle_sway',
      lightIntensity: 0.8
    }
  };
  
  // 获取天气参数
  const params = weatherParams[weather];
  
  // 应用天气影响...
}
```

## 10. 常见问题与解决方案

### 10.1 性能问题

**问题**: 大量树木渲染时帧率下降。

**解决方案**:
- 使用LOD降低远处树木的渲染复杂度
- 对相似树木使用实例化渲染
- 优化粒子系统，减少远处树木的粒子数量
- 使用遮挡剔除技术

### 10.2 模型兼容性

**问题**: 不同的树木模型使用不同的材质和命名方式。

**解决方案**:
- 创建材质映射表
- 实现模型预处理器
- 使用命名约定和标准化流程

## 11. 参考资源

- [Three.js文档](https://threejs.org/docs)
- [React Three Fiber文档](https://docs.pmnd.rs/react-three-fiber)
- [GLSL着色器参考](https://thebookofshaders.com/)
- [渐变色计算工具](https://gist.github.com/jdarling/4803411)
- [粒子系统最佳实践](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/)

---

这份文档详细介绍了如何在TaskForest项目中实现树木健康状态的3D可视化效果。随着项目的发展，可能需要根据实际需求和反馈进一步优化和扩展这些功能。 