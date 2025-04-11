import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ThreeEvent } from '@react-three/fiber';
import { TreeType } from '../types/Tree';
import { modelLoader } from './ModelLoader';
import { HealthCategory } from '../services/treeHealthService';
import { applyHealthTransitionEffect, applyGrowthStageEffect, HealthTransitionType } from './TreeAnimations';

// TreeModel组件的props定义
export interface TreeModelProps {
  type: TreeType;
  growthStage: number; // 0-4，表示树木的生长阶段
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onClick?: (event: any) => void;
  isHighlighted?: boolean;
  healthState?: number; // 新增：树木健康值 (0-100)
}

/**
 * 树木3D模型组件
 * 支持不同类型树木、生长阶段，以及鼠标交互
 */
const TreeModel: React.FC<TreeModelProps> = ({
  type = TreeType.OAK,
  growthStage = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onClick,
  isHighlighted = false,
  healthState = 100 // 默认健康值为100
}) => {
  // 引用模型组
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 动画状态
  const [isSwaying, setIsSwaying] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  
  // 记录上一次的健康状态和生长阶段，用于动画效果
  const prevHealthState = useRef<number>(healthState);
  const prevGrowthStage = useRef<number>(growthStage);
  
  // 获取场景对象，用于粒子效果
  const { scene } = useThree();
  
  // 计算缩放比例，根据生长阶段调整
  const treeScale = scale.map(s => s * (0.8 + growthStage * 0.25)) as [number, number, number];

  // 直接测试模型URL是否可访问
  useEffect(() => {
    const testModelAccess = async () => {
      const url = modelLoader.getPublicTreeModelUrl(type, growthStage);
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`模型文件访问测试: ${url} - ${response.ok ? '成功' : '失败'} (${response.status})`);
      } catch (err) {
        console.error(`模型文件访问测试失败: ${url}`, err);
      }
    };
    
    if (process.env.NODE_ENV === 'development') {
      testModelAccess();
    }
  }, [type, growthStage]);

  // 加载树木模型
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 更详细的模型加载日志，包含组件实例标识
        const componentId = `${type}-${position.join(',')}`;
        console.log(`[TreeModel ${componentId}] 开始加载模型: 类型=${type}, 阶段=${growthStage}, 位置=[${position.join(', ')}]`);
        
        // 检查模型URL是否可访问
        const modelUrl = modelLoader.getPublicTreeModelUrl(type, growthStage);
        console.log(`[TreeModel ${componentId}] 尝试加载模型URL: ${modelUrl}`);
        console.log(`[TreeModel ${componentId}] 完整URL: ${window.location.origin}${modelUrl}`);
        
        // 直接测试URL是否可访问
        let isModelAccessible = false;
        try {
          const response = await fetch(modelUrl, { method: 'HEAD' });
          isModelAccessible = response.ok;
          console.log(`[TreeModel ${componentId}] 模型文件访问测试: ${modelUrl} - ${isModelAccessible ? '成功' : '失败'} (${response.status})`);
        } catch (err) {
          console.error(`[TreeModel ${componentId}] 模型文件访问测试异常:`, err);
        }
        
        // 添加一个短暂延迟，确保模型加载请求不会同时发送
        // 这有助于防止可能的竞态条件
        await new Promise(resolve => setTimeout(resolve, 50 * Math.random()));
        
        // 尝试加载模型
        let loadedModel: THREE.Group | null = null;
        
        try {
          // 如果模型直接访问失败，直接尝试备用模型
          if (!isModelAccessible) {
            console.warn(`[TreeModel ${componentId}] 主模型URL不可访问，直接尝试备用模型`);
            
            // 尝试通用模型
            const fallbackUrl = `/models/trees/${type.toLowerCase()}.glb`;
            console.log(`[TreeModel ${componentId}] 尝试备用模型: ${fallbackUrl}`);
            
            // 检查备用模型是否可访问
            try {
              const fallbackResponse = await fetch(fallbackUrl, { method: 'HEAD' });
              if (fallbackResponse.ok) {
                console.log(`[TreeModel ${componentId}] 备用模型可访问`);
              } else {
                console.warn(`[TreeModel ${componentId}] 备用模型不可访问: ${fallbackResponse.status}`);
              }
            } catch (err) {
              console.error(`[TreeModel ${componentId}] 备用模型访问测试异常:`, err);
            }
          }
          
          loadedModel = await modelLoader.loadTreeModel(type, growthStage);
          console.log(`[TreeModel ${componentId}] 模型加载${loadedModel ? '成功' : '失败'}`);
        } catch (loadError) {
          console.error(`[TreeModel ${componentId}] 模型加载异常:`, loadError);
          throw loadError;
        }
        
        if (loadedModel) {
          // 复制模型，避免引用相同实例
          const modelCopy = loadedModel.clone();
          console.log(`[TreeModel ${componentId}] 模型加载并克隆成功`);
          
          // 设置模型名称，便于调试
          modelCopy.name = `tree-${type}-${growthStage}-${position.join(',')}`;
          
          // 设置投影和阴影
          modelCopy.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });
          
          // 根据健康状态调整模型颜色
          updateModelHealth(modelCopy, healthState);
          
          // 确保模型位置正确
          // 只设置y轴位置，避免影响x和z坐标
          modelCopy.position.y = 0;
          
          setModel(modelCopy);
        } else {
          console.warn(`[TreeModel ${componentId}] 模型加载失败，将创建后备模型`);
          throw new Error('模型加载失败或返回null');
        }
      } catch (err) {
        console.error(`加载树木模型失败 (${type}):`, err);
        setError(err instanceof Error ? err.message : '未知错误');
        
        // 检查所有可能的模型文件
        const checkFallbackModels = async () => {
          const baseUrl = `/models/trees`;
          const typeStr = type.toLowerCase();
          const possibleUrls = [
            `${baseUrl}/seedstage_${typeStr}.glb`,
            `${baseUrl}/${typeStr}_sapling.glb`,
            `${baseUrl}/${typeStr}_growing.glb`,
            `${baseUrl}/${typeStr}_mature.glb`,
            `${baseUrl}/${typeStr}.glb`
          ];
          
          console.log(`检查所有可能的模型文件:`);
          
          for (const url of possibleUrls) {
            try {
              const resp = await fetch(url, { method: 'HEAD' });
              console.log(`- ${url}: ${resp.ok ? '可访问' : '不可访问'} (${resp.status})`);
            } catch (e) {
              console.log(`- ${url}: 检查失败 (${e})`);
            }
          }
        };
        
        // 在开发环境中执行检查
        if (process.env.NODE_ENV === 'development') {
          checkFallbackModels();
        }
        
        // 创建后备模型 - 增强后备逻辑，确保能生成清晰可见的模型
        console.log(`为 ${type} 创建后备模型...`);
        const fallbackModel = createDetailedFallbackModel(type, growthStage, healthState);
        fallbackModel.name = `fallback-tree-${type}-${growthStage}`;
        console.log(`后备模型创建成功: ${fallbackModel.name}`);
        setModel(fallbackModel);
      } finally {
        setLoading(false);
      }
    };
    
    loadModel();
  }, [type, growthStage, healthState, position]);
  
  // 检查并应用健康状态或生长阶段变化的动画效果
  useEffect(() => {
    // 确保模型已加载且能获取场景
    if (!model || loading) return;
    
    // 检查健康状态变化
    if (prevHealthState.current !== healthState) {
      // 确定状态变化类型
      let transitionType: HealthTransitionType;
      if (healthState > prevHealthState.current) {
        transitionType = HealthTransitionType.RECOVERY;
      } else if (healthState < 50 && prevHealthState.current >= 50) {
        transitionType = HealthTransitionType.CRITICAL;
      } else {
        transitionType = HealthTransitionType.DECLINE;
      }
      
      // 应用健康状态变化动画
      applyHealthTransitionEffect(
        model,
        scene,
        prevHealthState.current,
        healthState,
        transitionType
      );
      
      // 更新上一次健康状态
      prevHealthState.current = healthState;
    }
    
    // 检查生长阶段变化
    if (prevGrowthStage.current !== growthStage) {
      // 应用生长阶段变化动画
      applyGrowthStageEffect(
        model,
        scene,
        prevGrowthStage.current,
        growthStage
      );
      
      // 更新上一次生长阶段
      prevGrowthStage.current = growthStage;
    }
  }, [model, loading, healthState, growthStage, scene]);
  
  // 更新模型健康状态
  const updateModelHealth = (modelObject: THREE.Group, health: number) => {
    const healthColor = getHealthColor(health);
    
    modelObject.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.material) {
          // 对叶子部分应用健康状态颜色
          if (mesh.name.includes('leaf') || mesh.name.includes('leaves') || 
              (mesh.name.includes('crown') && !mesh.name.includes('trunk'))) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  // 保持原色并与健康状态色调混合
                  const originalColor = new THREE.Color(mat.color);
                  const targetColor = new THREE.Color(healthColor);
                  // 混合原始颜色和健康状态颜色
                  const mixFactor = health < 50 ? 0.7 : 0.3; // 健康状态较差时，颜色影响更明显
                  mat.color.set(
                    originalColor.r * (1 - mixFactor) + targetColor.r * mixFactor,
                    originalColor.g * (1 - mixFactor) + targetColor.g * mixFactor,
                    originalColor.b * (1 - mixFactor) + targetColor.b * mixFactor
                  );
                }
              });
            } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
              const originalColor = new THREE.Color(mesh.material.color);
              const targetColor = new THREE.Color(healthColor);
              // 混合原始颜色和健康状态颜色
              const mixFactor = health < 50 ? 0.7 : 0.3; // 健康状态较差时，颜色影响更明显
              mesh.material.color.set(
                originalColor.r * (1 - mixFactor) + targetColor.r * mixFactor,
                originalColor.g * (1 - mixFactor) + targetColor.g * mixFactor,
                originalColor.b * (1 - mixFactor) + targetColor.b * mixFactor
              );
            }
          }
        }
      }
    });
  };
  
  // 根据健康状态获取颜色
  const getHealthColor = (health: number): string => {
    if (health >= 75) return '#4CAF50'; // 健康 - 绿色
    if (health >= 50) return '#CDDC39'; // 轻微枯萎 - 青柠色
    if (health >= 25) return '#FFC107'; // 中度枯萎 - 琥珀色
    return '#FF5722'; // 严重枯萎 - 深橙色
  };
  
  // 获取树木颜色 - 考虑健康状态
  const getTreeColor = (): string => {
    let baseColor;
    
    // 根据树木类型确定基础颜色
    switch (type) {
      case TreeType.OAK:
        baseColor = '#618833';
        break;
      case TreeType.PINE:
        baseColor = '#2D5824';
        break;
      case TreeType.MAPLE:
        baseColor = '#C74A28';
        break;
      case TreeType.APPLE:
        baseColor = '#E5A0A0';
        break;
      case TreeType.PALM:
        baseColor = '#8bc34a';
        break;
      case TreeType.WILLOW:
        baseColor = '#78909c';
        break;
      default:
        baseColor = '#4CAF50';
    }
    
    // 如果健康状态不佳，调整颜色
    if (healthState < 75) {
      const healthColor = getHealthColor(healthState);
      const originalColor = new THREE.Color(baseColor);
      const targetColor = new THREE.Color(healthColor);
      const mixFactor = healthState < 50 ? 0.6 : 0.3;
      
      const mixedColor = new THREE.Color(
        originalColor.r * (1 - mixFactor) + targetColor.r * mixFactor,
        originalColor.g * (1 - mixFactor) + targetColor.g * mixFactor,
        originalColor.b * (1 - mixFactor) + targetColor.b * mixFactor
      );
      
      return '#' + mixedColor.getHexString();
    }
    
    return baseColor;
  };
  
  // 获取树干颜色
  const getTrunkColor = (): string => {
    return '#8B4513'; // 棕色树干
  };
  
  // 处理树木点击事件
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (onClick) {
      onClick(event);
    }
  };
  
  // 处理树叶摇摆动画
  useFrame(({ clock }) => {
    if (!groupRef.current || !isSwaying) return;
    
    const time = clock.getElapsedTime();
    
    // 添加轻微摇摆效果
    if (groupRef.current.children.length > 0) {
      // 对每个子物体应用不同的摇摆
      groupRef.current.children.forEach((child, index) => {
        if (child.name.includes('crown') || child.name.includes('leaf')) {
          const swayAmount = 0.005; // 摇摆幅度
          const swaySpeed = 1.5 + index * 0.1; // 摇摆速度，每个子物体略有不同
          
          // 在X轴和Z轴上应用轻微摇摆
          child.rotation.x = Math.sin(time * swaySpeed) * swayAmount;
          child.rotation.z = Math.cos(time * swaySpeed * 0.7) * swayAmount;
        }
      });
    }
    
    // 如果树被高亮，添加旋转动画
    if (isHighlighted && isRotating) {
      groupRef.current.rotation.y += 0.01;
    }
  });
  
  // 创建后备树木模型（几何体）
  const createFallbackTree = (): THREE.Group => {
    console.log('创建备用几何树木');
    return createDetailedFallbackModel(type, growthStage, healthState);
  };
  
  // 创建更详细的后备模型，包含更多细节和变化
  const createDetailedFallbackModel = (
    treeType: TreeType, 
    stage: number,
    health: number
  ): THREE.Group => {
    console.log(`创建详细后备模型: 类型=${treeType}, 阶段=${stage}, 健康=${health}`);
    
    const group = new THREE.Group();
    group.name = `fallback-${treeType}-${stage}`;
    
    // 根据树木类型和生长阶段设置不同的尺寸和形状
    // 生长阶段影响尺寸
    const stageScale = Math.max(0.6, Math.min(1.8, 0.6 + stage * 0.3));
    console.log(`后备模型阶段缩放: ${stageScale}`);
    
    // 设置树干尺寸，基于生长阶段
    const trunkHeight = 1.0 * stageScale;
    const trunkRadius = 0.15 * stageScale;

    // 创建更详细的树干
    const trunkGeometry = new THREE.CylinderGeometry(
      trunkRadius * 0.8,  // 上部半径略小
      trunkRadius,        // 底部半径
      trunkHeight, 
      8
    );
    
    // 获取树干颜色
    const getTrunkColor = (): number => {
      switch(treeType) {
        case TreeType.PINE: return 0x614126;
        case TreeType.OAK: return 0x8b4513;
        case TreeType.MAPLE: return 0x6d4c41;
        case TreeType.CHERRY: return 0x795548;
        case TreeType.PALM: return 0x8d6e63;
        case TreeType.APPLE: return 0x5d4037;
        case TreeType.WILLOW: return 0x6d4c41;
        default: return 0x8b4513;
      }
    };
    
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: getTrunkColor(),
      roughness: 0.9,
      metalness: 0.1
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.name = "trunk";
    group.add(trunk);
    
    // 获取健康调整后的颜色
    const getHealthAdjustedColor = (baseColor: number, health: number): number => {
      const baseRGB = {
        r: (baseColor >> 16) & 0xff,
        g: (baseColor >> 8) & 0xff,
        b: baseColor & 0xff
      };
      
      // 健康度影响颜色
      const healthFactor = Math.max(0, Math.min(1, health / 100));
      
      // 健康度越低，颜色越偏褐色
      const targetRGB = {
        r: Math.min(255, baseRGB.r + (1 - healthFactor) * 50),
        g: Math.max(0, baseRGB.g - (1 - healthFactor) * 50),
        b: Math.max(0, baseRGB.b - (1 - healthFactor) * 100)
      };
      
      return (targetRGB.r << 16) | (targetRGB.g << 8) | targetRGB.b;
    };
    
    // 根据树木类型创建不同形状的树冠
    if (stage === 0) {
      // 种子阶段 - 只显示一个小球
      const seedGeometry = new THREE.SphereGeometry(0.15 * stageScale, 8, 8);
      const seedMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        roughness: 0.8,
        metalness: 0.2
      });
      const seed = new THREE.Mesh(seedGeometry, seedMaterial);
      seed.position.y = 0.05;
      seed.castShadow = true;
      seed.receiveShadow = true;
      seed.name = "seed";
      
      // 添加一个小的绿色新芽
      const sproutGeometry = new THREE.ConeGeometry(0.05 * stageScale, 0.1 * stageScale, 8);
      const sproutMaterial = new THREE.MeshStandardMaterial({ 
        color: getHealthAdjustedColor(0x7CFC00, health),
        roughness: 0.8,
        metalness: 0.1
      });
      const sprout = new THREE.Mesh(sproutGeometry, sproutMaterial);
      sprout.position.y = 0.15;
      sprout.castShadow = true;
      sprout.receiveShadow = true;
      sprout.name = "sprout";
      
      group.add(seed);
      group.add(sprout);
      
      // 添加一个红色标记，使种子更容易看到
      const markerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff6b6b,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.7
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.y = -0.02;
      marker.receiveShadow = true;
      marker.name = "marker";
      group.add(marker);
      
      return group;
    }
    
    // 根据树木类型创建不同形状的树冠
    const crownY = trunkHeight + 0.1;
    
    // 获取特定树木类型的树冠颜色
    const getCrownColor = (): number => {
      switch(treeType) {
        case TreeType.PINE: return 0x1b5e20;
        case TreeType.OAK: return 0x2e7d32;
        case TreeType.MAPLE: return 0x43a047;
        case TreeType.CHERRY: return 0xf8bbd0;
        case TreeType.PALM: return 0x81c784;
        case TreeType.APPLE: return 0xc8e6c9;
        case TreeType.WILLOW: return 0xa5d6a7;
        default: return 0x4caf50;
      }
    };
    
    // 根据树木类型和生长阶段创建树冠
    if (treeType === TreeType.PINE) {
      // 松树 - 圆锥形
      const coneHeight = 1.2 * stageScale;
      const coneGeometry = new THREE.ConeGeometry(0.6 * stageScale, coneHeight, 8);
      const coneMaterial = new THREE.MeshStandardMaterial({ 
        color: getHealthAdjustedColor(getCrownColor(), health),
        roughness: 0.8,
        metalness: 0.1
      });
      const crown = new THREE.Mesh(coneGeometry, coneMaterial);
      crown.position.y = trunkHeight + (coneHeight / 2);
      crown.castShadow = true;
      crown.receiveShadow = true;
      crown.name = "crown";
      group.add(crown);
      
      // 添加额外的锥体表示多层树冠
      if (stage > 1) {
        const topConeGeometry = new THREE.ConeGeometry(0.4 * stageScale, 0.8 * stageScale, 8);
        const topCone = new THREE.Mesh(topConeGeometry, coneMaterial);
        topCone.position.y = trunkHeight + coneHeight * 0.8;
        topCone.castShadow = true;
        topCone.name = "top_crown";
        group.add(topCone);
      }
    } else if (treeType === TreeType.PALM) {
      // 棕榈树 - 细长树干和伞状树冠
      const crownGeometry = new THREE.SphereGeometry(0.8 * stageScale, 8, 8);
      crownGeometry.scale(1, 0.5, 1);
      const crownMaterial = new THREE.MeshStandardMaterial({ 
        color: getHealthAdjustedColor(getCrownColor(), health),
        roughness: 0.7,
        metalness: 0.2
      });
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.y = trunkHeight + 0.3;
      crown.castShadow = true;
      crown.receiveShadow = true;
      crown.name = "crown";
      group.add(crown);
      
      // 添加棕榈叶
      for (let i = 0; i < 6; i++) {
        const leafGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.8 * stageScale);
        const leaf = new THREE.Mesh(leafGeometry, crownMaterial);
        leaf.position.y = trunkHeight + 0.3;
        leaf.rotation.y = (Math.PI * 2 / 6) * i;
        leaf.rotation.x = -Math.PI / 4;
        leaf.castShadow = true;
        leaf.name = `leaf_${i}`;
        group.add(leaf);
      }
    } else {
      // 其他树木类型 - 圆形或椭球形树冠
      let crownGeometry;
      if (treeType === TreeType.OAK || treeType === TreeType.MAPLE) {
        // 橡树和枫树 - 扁平球形
        crownGeometry = new THREE.SphereGeometry(0.8 * stageScale, 8, 8);
        crownGeometry.scale(1.2, 1, 1.2);
      } else if (treeType === TreeType.CHERRY) {
        // 樱花树 - 圆形树冠，粉色
        crownGeometry = new THREE.SphereGeometry(0.7 * stageScale, 8, 8);
      } else if (treeType === TreeType.WILLOW) {
        // 柳树 - 下垂的椭球形
        crownGeometry = new THREE.SphereGeometry(0.7 * stageScale, 8, 8);
        crownGeometry.scale(1, 1.3, 1);
      } else {
        // 默认和苹果树 - 标准球形
        crownGeometry = new THREE.SphereGeometry(0.7 * stageScale, 8, 8);
      }
      
      const crownMaterial = new THREE.MeshStandardMaterial({ 
        color: getHealthAdjustedColor(getCrownColor(), health),
        roughness: 0.8,
        metalness: 0.1
      });
      
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.y = trunkHeight + 0.4;
      crown.castShadow = true;
      crown.receiveShadow = true;
      crown.name = "crown";
      group.add(crown);
    }
    
    // 为种子添加红色标记底座，使其更明显
    if (stage === 1) {
      const markerGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.03, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff6b6b,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.6
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.y = -0.01;
      marker.receiveShadow = true;
      marker.name = "marker";
      group.add(marker);
    }
    
    return group;
  };
  
  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={treeScale}
      onClick={handleClick}
    >
      {/* 显示加载状态的占位符 */}
      {loading && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial color="#aaaaaa" wireframe />
        </mesh>
      )}
      
      {/* 显示错误状态的占位符 */}
      {error && !model && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial color="#ff6666" />
          <meshStandardMaterial color="#ff0000" wireframe />
        </mesh>
      )}
      
      {/* 渲染模型 */}
      {model && !loading && (
        // 直接在这里渲染模型的克隆版本
        <primitive 
          object={model} 
          // 对模型应用高亮效果
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        />
      )}
      
      {/* 如果树被高亮，添加高亮指示器 */}
      {isHighlighted && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color="#4285f4" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

export default TreeModel; 