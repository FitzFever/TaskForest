import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ThreeEvent } from '@react-three/fiber';
import { TreeType } from '../types/Tree';
import { modelLoader } from './ModelLoader';
import { HealthCategory } from '../services/treeHealthService';
import { 
  applyHealthTransitionEffect, 
  applyGrowthStageEffect, 
  HealthTransitionType,
  applyHealthTransitionEffectAtPosition,
  applyGrowthStageEffectAtPosition
} from './TreeAnimations';
import { 
  GLOBAL_TREE_SCALE_MULTIPLIER, 
  TREE_BASE_SCALE, 
  TREE_TYPE_SCALE_FACTORS 
} from '../constants/treeConfig';

// TreeModel组件的props定义
export interface TreeModelProps {
  type: TreeType;
  growthStage: number; // 0-3，表示树木的生长阶段
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
  
  // 记录上一次的健康状态和生长阶段，用于监测变化
  const prevHealthState = useRef<number>(healthState);
  const prevGrowthStage = useRef<number>(growthStage);
  
  // 获取场景对象
  const { scene } = useThree();
  
  // 计算缩放比例，根据生长阶段调整
  const treeScale = useMemo(() => {
    // 使用全局缩放因子和树木类型特定缩放
    const typeScaleFactor = TREE_TYPE_SCALE_FACTORS[type] || 1.0;
    const { BASE_MULTIPLIER, MIN_SCALE_FACTOR, GROWTH_FACTOR } = TREE_BASE_SCALE.THREE_D;
    
    // 计算最终缩放值 = 基础缩放 * 全局缩放系数 * 树木类型系数 * 生长阶段系数
    return scale.map(s => 
      s * GLOBAL_TREE_SCALE_MULTIPLIER * typeScaleFactor * 
      (MIN_SCALE_FACTOR + (growthStage * GROWTH_FACTOR))
    ) as [number, number, number];
  }, [scale, growthStage, type]);

  // 生成模型唯一标识符
  const modelKey = useMemo(() => {
    // 使用所有关键属性构建唯一标识
    const positionKey = position.map(p => p.toFixed(2)).join(',');
    return `tree_${type}_stage${growthStage}_health${healthState}_pos${positionKey}`;
  }, [type, growthStage, position, healthState]);
  
  // 统一模型原点位置的函数，确保不同生长阶段模型的基准点一致
  const normalizeModelPosition = (model: THREE.Group, modelId: string) => {
    try {
      // 计算模型的包围盒
      const boundingBox = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      
      console.log(`[TreeModel ${modelId}] 模型边界盒: 
        中心=(${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}), 
        尺寸=(${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)})`);
      
      // 重置位置到世界坐标原点
      model.position.set(0, 0, 0);
      
      // 移动模型，使底部中心位于原点
      model.position.x = -center.x;
      model.position.z = -center.z;
      
      // 设置y轴位置，使模型底部与地面接触
      model.position.y = -boundingBox.min.y;
      
      console.log(`[TreeModel ${modelId}] 统一模型位置后: (${model.position.x.toFixed(2)}, ${model.position.y.toFixed(2)}, ${model.position.z.toFixed(2)})`);
    } catch (error) {
      console.error(`[TreeModel ${modelId}] 规范化模型位置失败:`, error);
      // 如果失败，设置一个默认位置
      model.position.set(0, 0, 0);
    }
  };

  // 加载树木模型
  useEffect(() => {
    // 确保生长阶段和健康状态有效
    if (growthStage === undefined || growthStage === null) {
      console.error(`[TreeModel] 无效的生长阶段: ${growthStage}, 类型: ${type}`);
      return;
    }

    if (healthState === undefined || healthState === null) {
      console.warn(`[TreeModel] 无效的健康状态: ${healthState}, 使用默认值100`);
    }

    // 标记当前加载会话，避免竞态条件
    const loadingSession = Date.now();
    console.log(`[TreeModel ${modelKey}] 开始加载模型: 类型=${type}, 阶段=${growthStage}, 位置=[${position.join(', ')}], 健康值=${healthState}`);
    
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    const loadModel = async () => {
      try {
        // 获取模型URL用于日志记录
        const modelUrl = modelLoader.getPublicTreeModelUrl(type, growthStage);
        console.log(`[TreeModel ${modelKey}] 尝试加载模型URL: ${modelUrl}, 生长阶段: ${growthStage}`);
        
        // 添加一个短暂延迟，以避免同时发送过多模型加载请求
        await new Promise(resolve => setTimeout(resolve, 50 * Math.random()));
        
        // 如果组件已卸载，则停止加载
        if (!isMounted) return;
        
        // 尝试加载模型，重试最多3次
        let loadedModel: THREE.Group | null = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          attempts++;
          try {
            // 确保传递有效的生长阶段值
            const validGrowthStage = Math.max(0, Math.min(3, growthStage));
            loadedModel = await modelLoader.loadTreeModel(type, validGrowthStage);
            
            if (loadedModel) {
              console.log(`[TreeModel ${modelKey}] 模型加载成功 (尝试 ${attempts}/${maxAttempts})`);
              break;
            } else {
              console.warn(`[TreeModel ${modelKey}] 模型加载返回null (尝试 ${attempts}/${maxAttempts})`);
              // 如果是最后一次尝试，给出更详细的日志
              if (attempts === maxAttempts) {
                console.error(`[TreeModel ${modelKey}] 所有加载尝试失败，将使用后备模型`);
              }
              // 短暂等待后重试
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (loadErr) {
            console.warn(`[TreeModel ${modelKey}] 模型加载尝试 ${attempts}/${maxAttempts} 失败:`, loadErr);
            // 等待后重试，增加等待时间
            await new Promise(resolve => setTimeout(resolve, 300 * attempts));
          }
        }
        
        // 如果组件已卸载或开始了新的加载，则放弃这次结果
        if (!isMounted) return;
        
        if (loadedModel) {
          console.log(`[TreeModel ${modelKey}] 模型加载成功`);
          
          // 复制模型，避免引用相同实例
          const modelCopy = loadedModel.clone();
          
          // 设置模型名称，便于调试
          modelCopy.name = modelKey;
          
          // 设置投影和阴影
          modelCopy.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });
          
          // 根据健康状态调整模型颜色
          updateModelHealth(modelCopy, healthState);
          
          // 应用位置规范化
          normalizeModelPosition(modelCopy, modelKey);
          
          // 更新模型状态
          setModel(modelCopy);
          setLoading(false);
        } else {
          throw new Error('所有模型加载尝试均失败');
        }
      } catch (err) {
        // 确保组件仍然挂载
        if (!isMounted) return;
        
        console.error(`[TreeModel ${modelKey}] 加载失败:`, err);
        setError(err instanceof Error ? err.message : '未知错误');
        
        // 创建后备模型
        const fallbackModel = createFallbackTree();
        fallbackModel.name = `fallback-${modelKey}`;
        
        // 对后备模型也应用相同的位置标准化处理
        normalizeModelPosition(fallbackModel, `fallback-${modelKey}`);
        
        setModel(fallbackModel);
        setLoading(false);
      }
    };
    
    loadModel();
    
    // 清理函数
    return () => {
      isMounted = false;
      console.log(`[TreeModel ${modelKey}] 组件卸载，停止加载过程`);
    };
  }, [type, growthStage, position, healthState, modelKey]);

  // 监控健康状态和生长阶段变化
  useEffect(() => {
    // 如果健康状态发生变化，更新模型外观
    if (model && prevHealthState.current !== healthState) {
      console.log(`[TreeModel ${modelKey}] 健康状态变化: ${prevHealthState.current}% → ${healthState}%`);
      
      // 更新模型健康状态
      updateModelHealth(model, healthState);
      
      // 更新上一次的健康状态
      prevHealthState.current = healthState;
    }
    
    // 如果生长阶段发生变化，记录变化
    if (prevGrowthStage.current !== growthStage) {
      console.log(`[TreeModel ${modelKey}] 生长阶段变化: ${prevGrowthStage.current} → ${growthStage}`);
      prevGrowthStage.current = growthStage;
    }
  }, [model, healthState, growthStage, modelKey]);
  
  // 简单的树叶摇摆动画
  useFrame(({ clock }) => {
    if (!groupRef.current || !isSwaying || healthState < 25) return;
    
    // 随时间调整摇摆强度（与健康状态挂钩）
    const time = clock.getElapsedTime();
    const swayFactor = 0.005 * (healthState / 100); // 根据健康状态调整摇摆幅度
    
    // 简单的摇摆效果
    groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.01 * swayFactor;
    groupRef.current.rotation.z = Math.sin(time * 0.7) * 0.02 * swayFactor;
    
    // 处理高亮效果
    if (isHighlighted) {
      groupRef.current.scale.set(
        treeScale[0] * (1 + Math.sin(time) * 0.05),
        treeScale[1] * (1 + Math.sin(time) * 0.05),
        treeScale[2] * (1 + Math.sin(time) * 0.05)
      );
    }
  });
  
  // 更新模型健康状态
  const updateModelHealth = (modelObject: THREE.Group, health: number) => {
    try {
      // 遍历模型的所有部分
      modelObject.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          
          // 只调整树叶和树冠部分的颜色
          if (mesh.name.includes('leaf') || mesh.name.includes('leaves') ||
              (mesh.name.includes('crown') && !mesh.name.includes('trunk'))) {
            
            // 计算健康状态颜色
            const healthColor = getHealthColor(health);
            
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.color.set(healthColor);
                }
              });
            } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.color.set(healthColor);
            }
          }
        }
      });
    } catch (error) {
      console.error(`[TreeModel ${modelKey}] 更新健康状态颜色失败:`, error);
    }
  };
  
  // 获取根据健康状态计算的颜色
  const getHealthColor = (health: number): string => {
    if (health >= 75) return '#4CAF50'; // 健康 - 绿色
    if (health >= 50) return '#8BC34A'; // 轻微枯萎 - 淡绿色
    if (health >= 25) return '#CDDC39'; // 中度枯萎 - 黄绿色
    return '#FFC107';                   // 严重枯萎 - 黄色
  };
  
  // 处理点击事件
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (onClick) {
      // 防止事件冒泡
      event.stopPropagation();
      onClick(event);
    }
  };
  
  // 创建后备树木模型（几何体）
  const createFallbackTree = (): THREE.Group => {
    // 创建简单的替代模型
    const fallbackGroup = new THREE.Group();
    
    // 创建简单的树干
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.5;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.name = 'trunk';
    
    // 创建简单的树冠
    const crownGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({ 
      color: getHealthColor(healthState)
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 1.3;
    crown.castShadow = true;
    crown.receiveShadow = true;
    crown.name = 'crown';
    
    // 将部件添加到组
    fallbackGroup.add(trunk);
    fallbackGroup.add(crown);
    
    return fallbackGroup;
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={isHighlighted ? treeScale.map(s => s * 1.1) as [number, number, number] : treeScale}
      onClick={handleClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
      name={`tree-${type}-${growthStage}-${healthState}`}
      userData={{ 
        type,
        growthStage,
        healthState,
        modelKey
      }}
    >
      {loading && !model && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#cccccc" wireframe />
        </mesh>
      )}
      
      {error && !model && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      
      {model && (
        <primitive object={model} />
      )}
    </group>
  );
};

export default React.memo(TreeModel, (prevProps, nextProps) => {
  // 仅当关键属性发生变化时重新渲染组件
  return (
    prevProps.type === nextProps.type &&
    prevProps.growthStage === nextProps.growthStage &&
    prevProps.healthState === nextProps.healthState &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.position[2] === nextProps.position[2] &&
    prevProps.isHighlighted === nextProps.isHighlighted
  );
}); 