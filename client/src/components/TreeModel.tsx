import React, { useEffect, useRef } from 'react';
import { TreeType } from '../types/Tree';

// TreeModel组件接口
interface TreeModelProps {
  type: TreeType | string; 
  growthStage: number; 
  position: [number, number, number]; 
  onClick: () => void;
  healthState?: number;
}

// 树木3D模型组件
const TreeModel: React.FC<TreeModelProps> = ({ 
  type, 
  growthStage, 
  position, 
  onClick, 
  healthState = 100 
}) => {
  // 记录组件实例
  const renderCount = useRef(0);
  
  // 每次渲染时记录状态
  useEffect(() => {
    renderCount.current += 1;
    console.log(`树木(${type})渲染 #${renderCount.current} - 健康状态: ${healthState}, 生长阶段: ${growthStage}`);
    
    // 检查健康状态是否异常
    if (healthState === undefined || healthState === null) {
      console.warn(`警告: 树木(${type})缺少健康状态值, 使用默认值100`);
    }
  }, [type, growthStage, healthState]);
  
  // 计算树木缩放比例 - 更明显的阶段变化
  const getTreeScale = () => {
    const baseScale = 0.3; // 最小尺寸
    const stageMultiplier = 0.2; // 每个阶段增加的尺寸
    
    // 确保生长阶段在有效范围内
    const validStage = Math.max(1, Math.min(5, growthStage || 1));
    
    return baseScale + (validStage * stageMultiplier);
  };
  
  // 获取成长阶段的名称
  const getGrowthStageName = () => {
    switch(growthStage) {
      case 1: return '幼苗';
      case 2: return '小树';
      case 3: return '成长中';
      case 4: return '将成熟';
      case 5: return '成熟';
      default: return `未知阶段${growthStage}`;
    }
  };
  
  // 根据健康状态获取树叶颜色
  const getLeafColor = () => {
    // 记录健康状态计算
    console.log(`计算树木(${type})叶子颜色 - 健康状态: ${healthState}`);
    
    // 基础颜色（根据树木类型）
    const baseColor = 
      type === TreeType.PINE ? '#2d4c0e' : 
      type === TreeType.OAK ? '#4a7d1a' : 
      type === TreeType.CHERRY ? '#e77c8e' : 
      type === TreeType.MAPLE ? '#d46a4c' : 
      type === TreeType.PALM ? '#6a994e' :
      type === TreeType.WILLOW ? '#8ad472' :
      type === TreeType.APPLE ? '#91c73e' : '#6a994e';
      
    // 根据健康状态调整颜色
    if (healthState < 25) {
      console.log(`树木(${type})严重枯萎 - 褐色`);
      return '#A05A2C'; // 严重枯萎 - 褐色
    } else if (healthState < 50) {
      console.log(`树木(${type})中度枯萎 - 橙色`);
      return '#FFA500'; // 中度枯萎 - 橙色
    } else if (healthState < 75) {
      console.log(`树木(${type})轻微枯萎 - 黄绿色`);
      return '#CDDC39'; // 轻微枯萎 - 黄绿色
    }
    
    console.log(`树木(${type})健康状态良好 - 使用基础颜色`);
    return baseColor;
  };
  
  // 获取树干材质
  const getTrunkMaterial = () => {
    // 根据树木类型和健康状态决定树干颜色
    if (healthState < 30) {
      return '#5D4037'; // 极度不健康的树干
    }
    
    // 不同树木类型的树干颜色
    switch(type) {
      case TreeType.CHERRY: return '#96504b'; // 樱花树树干
      case TreeType.MAPLE: return '#6D4C41'; // 枫树树干
      case TreeType.PINE: return '#795548'; // 松树树干
      case TreeType.OAK: return '#8D6E63'; // 橡树树干
      default: return '#A1887F'; // 默认树干颜色
    }
  };
  
  // 计算实际的缩放值
  const scale = getTreeScale();
  
  // 树木显示名称 - 用于调试
  const displayName = `${type}-${getGrowthStageName()}-健康${healthState}%`;
  
  return (
    <group position={position} onClick={onClick} name={displayName}>
      {/* 根部 - 只在树木生长到第3阶段以上才显示 */}
      {growthStage >= 3 && (
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.4 * scale, 0.5 * scale, 0.1, 8]} />
          <meshStandardMaterial color={getTrunkMaterial()} />
        </mesh>
      )}
      
      {/* 树干 - 根据生长阶段高度不同 */}
      <mesh position={[0, 0.5 * scale, 0]} castShadow>
        <cylinderGeometry 
          args={[
            0.2 * scale, 
            0.3 * scale, 
            1 * scale * (0.6 + growthStage * 0.1), // 高度随生长阶段增加
            8
          ]} 
        />
        <meshStandardMaterial color={getTrunkMaterial()} />
      </mesh>
      
      {/* 树冠/叶子 - 只在生长阶段 >= 2 时才显示 */}
      {growthStage >= 2 && (
        <mesh position={[0, 1.2 * scale, 0]} castShadow>
        {type === TreeType.PINE ? (
          <coneGeometry args={[0.8 * scale, 2 * scale, 8]} />
        ) : type === TreeType.OAK ? (
          <sphereGeometry args={[0.8 * scale, 16, 16]} />
        ) : type === TreeType.CHERRY ? (
          <sphereGeometry args={[0.9 * scale, 16, 16]} />
        ) : type === TreeType.WILLOW ? (
          <sphereGeometry args={[1.0 * scale, 16, 16]} />
        ) : type === TreeType.APPLE ? (
          <sphereGeometry args={[0.85 * scale, 16, 16]} />
        ) : (
          <sphereGeometry args={[0.8 * scale, 16, 16]} />
        )}
        
        <meshStandardMaterial color={getLeafColor()} />
      </mesh>
      )}
      
      {/* 额外的枝叶 - 只在生长阶段 >= 4 时才显示 */}
      {growthStage >= 4 && (
        <>
          {/* 额外的枝叶球体，稍微偏移位置 */}
          <mesh position={[0.4 * scale, 1.0 * scale, 0.3 * scale]} castShadow>
            <sphereGeometry args={[0.5 * scale, 16, 16]} />
            <meshStandardMaterial color={getLeafColor()} />
          </mesh>
          
          <mesh position={[-0.3 * scale, 1.1 * scale, -0.4 * scale]} castShadow>
            <sphereGeometry args={[0.5 * scale, 16, 16]} />
            <meshStandardMaterial color={getLeafColor()} />
          </mesh>
        </>
      )}
      
      {/* 最顶层装饰 - 只在生长阶段 = 5 (完全成熟) 时才显示 */}
      {growthStage === 5 && (
        <>
          {type === TreeType.CHERRY && (
            // 樱花树的花朵
            <group position={[0, 1.5 * scale, 0]}>
              {[...Array(8)].map((_, i) => (
                <mesh 
                  key={i} 
                  position={[
                    Math.sin(i/8 * Math.PI * 2) * 0.6 * scale,
                    Math.random() * 0.5 * scale,
                    Math.cos(i/8 * Math.PI * 2) * 0.6 * scale
                  ]}
                  castShadow
                >
                  <sphereGeometry args={[0.15 * scale, 8, 8]} />
                  <meshStandardMaterial color="#ffb7c5" />
                </mesh>
              ))}
            </group>
          )}
          
          {type === TreeType.APPLE && (
            // 苹果树的果实
            <group position={[0, 1.5 * scale, 0]}>
              {[...Array(5)].map((_, i) => (
                <mesh 
                  key={i} 
                  position={[
                    Math.sin(i/5 * Math.PI * 2) * 0.7 * scale,
                    Math.random() * 0.4 * scale - 0.2 * scale,
                    Math.cos(i/5 * Math.PI * 2) * 0.7 * scale
                  ]}
                  castShadow
                >
                  <sphereGeometry args={[0.1 * scale, 8, 8]} />
                  <meshStandardMaterial color="#e74c3c" />
                </mesh>
              ))}
            </group>
          )}
        </>
      )}
    </group>
  );
};

export default TreeModel; 