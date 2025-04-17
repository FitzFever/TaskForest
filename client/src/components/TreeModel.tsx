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
  
  // 计算树木缩放比例
  const scale = 0.5 + (growthStage * 0.15); // 根据生长阶段缩放
  
  // 根据健康状态获取颜色
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
    return baseColor; // 健康状态良好 - 使用默认绿色
  };
  
  return (
    <group position={position} onClick={onClick}>
      {/* 树干 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1 * scale, 8]} />
        <meshStandardMaterial color={healthState < 25 ? '#5D4037' : 'brown'} />
      </mesh>
      
      {/* 树冠/叶子 */}
      <mesh position={[0, 1.2 + scale/2, 0]} castShadow>
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
    </group>
  );
};

export default TreeModel; 