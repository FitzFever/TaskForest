import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeType } from '../types/Tree';
import { modelLoader } from './ModelLoader';

// TreeModel组件的props定义
export interface TreeModelProps {
  type: TreeType;
  growthStage: number; // 0-4，表示树木的生长阶段
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onClick?: (event: any) => void;
  isHighlighted?: boolean;
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
  isHighlighted = false
}) => {
  // 引用模型组
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 动画状态
  const [isSwaying, setIsSwaying] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  
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
  }, [type, growthStage]);

  // 处理点击事件
  const handleClick = (event: any) => {
    if (onClick) {
      if (event.stopPropagation) {
        event.stopPropagation(); // 防止事件冒泡
      }
      onClick(event);
      
      // 点击时切换旋转状态
      setIsRotating(!isRotating);
    }
  };

  // 使用useFrame实现树木摇摆效果
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // 自然摇摆效果
    if (isSwaying) {
      const time = Date.now() * 0.001;
      const swayAmount = 0.005; // 摇摆幅度
      
      groupRef.current.rotation.x = Math.sin(time * 0.5) * swayAmount;
      groupRef.current.rotation.z = Math.cos(time * 0.7) * swayAmount;
    }
    
    // 点击后的旋转效果
    if (isRotating) {
      groupRef.current.rotation.y += delta * 2;
    }
  });

  // 根据树木类型获取材质颜色
  const getTreeColor = (): string => {
    if (isHighlighted) {
      return '#ffff99'; // 高亮颜色
    }
    
    switch (type) {
      case TreeType.OAK:
        return '#2e7d32'; // 深绿色
      case TreeType.PINE:
        return '#1b5e20'; // 松树绿
      case TreeType.MAPLE:
        return '#4caf50'; // 枫树绿
      default:
        return '#81c784'; // 默认浅绿色
    }
  };

  // 树干颜色
  const getTrunkColor = (): string => {
    switch (type) {
      case TreeType.OAK:
        return '#5d4037'; // 橡树褐色
      case TreeType.PINE:
        return '#3e2723'; // 松树暗褐色
      case TreeType.MAPLE:
        return '#4e342e'; // 枫树红褐色
      default:
        return '#6d4c41'; // 默认褐色
    }
  };

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
    </group>
  );
};

export default TreeModel; 