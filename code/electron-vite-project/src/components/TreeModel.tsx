import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 强制使用简易模型
console.log('TreeModel - 强制使用简易模型');

interface TreeModelProps {
  type: string;
  growthStage: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

// 树木类型对颜色的映射
const typeToColor: Record<string, string> = {
  oak: '#4a7d1a',     // 橡树
  pine: '#2d4c0e',    // 松树
  cherry: '#e77c8e',  // 樱花树
  palm: '#6a994e',    // 棕榈树
  apple: '#7db547',   // 苹果树
  maple: '#d22e2e',   // 枫树
  willow: '#86c166',  // 柳树
  rubber: '#476c2d'   // 橡胶树
};

// 简易树木模型
const TreeModel: React.FC<TreeModelProps> = ({
  type,
  growthStage,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  onClick
}) => {
  // 引用组
  const groupRef = useRef<THREE.Group>(null);
  
  // 根据生长阶段计算比例
  const growthScale = 0.2 + (growthStage - 1) * 0.2;
  const treeColor = typeToColor[type] || '#4a7d1a';

  // 添加轻微旋转动画
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  // 点击事件
  const handleClick = (event: any) => {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    if (onClick) onClick();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation as any}
      scale={[scale, scale, scale]}
      onClick={handleClick}
    >
      {/* 树干 */}
      <mesh position={[0, growthScale / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.2, growthScale * 1.5, 8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      
      {/* 树冠 */}
      <mesh position={[0, growthScale * 1.5, 0]} castShadow>
        <coneGeometry args={[growthScale, growthScale * 2, 8]} />
        <meshStandardMaterial color={treeColor} />
      </mesh>
      
      {/* 仅在成熟阶段添加果实/装饰 */}
      {growthStage >= 4 && (
        <group>
          <mesh position={[0.3, growthScale * 1.3, 0.2]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={type === 'apple' ? 'red' : 'yellow'} />
          </mesh>
          <mesh position={[-0.2, growthScale * 1.7, 0.1]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={type === 'apple' ? 'red' : 'yellow'} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default TreeModel; 