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
export const TreeModel: React.FC<TreeModelProps> = ({
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
  const treeScale = scale.map(s => s * (0.4 + growthStage * 0.15)) as [number, number, number];

  // 加载树木模型
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 使用ModelLoader加载树木模型
        const loadedModel = await modelLoader.loadTreeModel(type);
        
        if (loadedModel) {
          // 复制模型，避免引用相同实例
          const modelCopy = loadedModel.clone();
          
          // 根据生长阶段调整模型
          if (growthStage < 2) {
            // 幼苗阶段，简化模型
            modelCopy.children.forEach((child) => {
              if (child.name.includes('branch') || child.name.includes('leaf')) {
                child.visible = growthStage > 0; // 第0阶段不显示枝叶
              }
            });
          }
          
          // 根据健康状态调整模型颜色
          updateModelHealth(modelCopy, healthState);
          
          setModel(modelCopy);
        } else {
          throw new Error('模型加载失败');
        }
      } catch (err) {
        console.error('加载树木模型失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };
    
    loadModel();
  }, [type, growthStage, healthState]);
  
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
      case TreeType.CHERRY:
        baseColor = '#E5A0A0';
        break;
      case TreeType.MAPLE:
        baseColor = '#C74A28';
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
  
  // 树木摇摆动画
  useFrame((_, delta) => {
    if (groupRef.current && isSwaying) {
      const speed = 0.5; // 摇摆速度
      const now = Date.now() / 1000;
      
      // 轻微不规则摇摆
      const swayX = Math.sin(now * speed) * 0.01;
      const swayZ = Math.cos(now * speed * 0.7) * 0.01;
      
      groupRef.current.rotation.x = rotation[0] + swayX;
      groupRef.current.rotation.z = rotation[2] + swayZ;
      
      // 高亮效果
      if (isHighlighted && groupRef.current.scale.x <= treeScale[0] * 1.1) {
        groupRef.current.scale.multiplyScalar(1 + delta * 0.5);
      } else if (!isHighlighted && groupRef.current.scale.x > treeScale[0]) {
        groupRef.current.scale.multiplyScalar(1 - delta * 0.5);
      }
      
      // 旋转动画
      if (isRotating) {
        groupRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  // 创建默认树木模型（加载失败时使用）
  const createFallbackTree = () => {
    const height = 1 + growthStage * 0.5;
    const trunkRadius = 0.1 + growthStage * 0.05;
    const crownRadius = 0.3 + growthStage * 0.1;
    
    return (
      <>
        {/* 树干 */}
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, height, 8]} />
          <meshStandardMaterial color={getTrunkColor()} />
        </mesh>
        
        {/* 树冠 */}
        <mesh position={[0, height + crownRadius * 0.7, 0]}>
          {type === TreeType.PINE ? (
            <coneGeometry args={[crownRadius, crownRadius * 2, 8]} />
          ) : (
            <sphereGeometry args={[crownRadius, 8, 8]} />
          )}
          <meshStandardMaterial color={getTreeColor()} />
        </mesh>
        
        {/* 成熟树木添加果实装饰 */}
        {growthStage >= 3 && type === TreeType.CHERRY && (
          <>
            {[...Array(5)].map((_, i) => {
              const angle = (i / 5) * Math.PI * 2;
              const radius = crownRadius * 0.8;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              return (
                <mesh key={i} position={[x, height + crownRadius * 0.5, z]}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial color="#e91e63" />
                </mesh>
              );
            })}
          </>
        )}
        
        {/* 健康状态较差时的视觉效果 */}
        {healthState < 50 && (
          <mesh position={[0, height + crownRadius, 0]}>
            <sphereGeometry args={[crownRadius * 1.1, 8, 8]} />
            <meshStandardMaterial 
              color={getHealthColor(healthState)} 
              transparent={true} 
              opacity={0.3} 
            />
          </mesh>
        )}
      </>
    );
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      scale={treeScale}
      onClick={handleClick}
    >
      {loading ? (
        // 加载中显示简单占位符
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#cccccc" transparent opacity={0.5} />
        </mesh>
      ) : error || !model ? (
        // 加载失败或没有模型，显示备用树木
        createFallbackTree()
      ) : (
        // 显示加载的模型
        <primitive object={model} />
      )}
      
      {/* 添加健康状态指示器 */}
      {healthState < 75 && !loading && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color={getHealthColor(healthState)} />
        </mesh>
      )}
    </group>
  );
};

export default TreeModel; 