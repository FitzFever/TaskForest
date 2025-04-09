import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { TreeType } from '../types/Tree';
import TreeModel from './TreeModel';
import { modelLoader } from './ModelLoader';

// 树木数据接口
export interface TreeData {
  id: number | string;
  type: TreeType;
  growthStage: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  isHighlighted?: boolean;
  healthState?: number; // 新增：树木健康值
}

// 森林场景属性接口
export interface ForestSceneProps {
  trees: TreeData[];
  onTreeClick?: (treeId: number | string) => void;
  width?: string;
  height?: string;
  selectedTreeId?: number | string;
  showHealthIndicators?: boolean; // 是否显示健康状态指示器
}

// 地面组件
const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#8bc34a"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

// 光照组件
const Lighting: React.FC = () => {
  const sunLight = useRef<THREE.DirectionalLight>(null);
  
  // 日光动画
  useFrame(({ clock }) => {
    if (sunLight.current) {
      const time = clock.getElapsedTime() * 0.1;
      // 缓慢变化光照强度，模拟自然光线变化
      sunLight.current.intensity = 1.2 + Math.sin(time) * 0.2;
    }
  });
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.5} />
      
      {/* 方向光（太阳光） */}
      <directionalLight
        ref={sunLight}
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* 半球光（天空光） */}
      <hemisphereLight
        color="#b1e1ff"
        groundColor="#b97a20"
        intensity={0.6}
      />
    </>
  );
};

// 相机控制器组件
const CameraController: React.FC = () => {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    // 初始化相机位置
    camera.position.set(10, 7, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      minDistance={5}
      maxDistance={30}
      minPolarAngle={Math.PI / 6} // 限制俯视角度
      maxPolarAngle={Math.PI / 2.2} // 限制仰视角度
      enablePan={true}
      panSpeed={0.5}
      target={new THREE.Vector3(0, 0, 0)}
      args={[camera, gl.domElement]}
    />
  );
};

/**
 * 森林场景组件
 * 用于展示树木集合
 */
const ForestScene: React.FC<ForestSceneProps> = ({
  trees = [],
  onTreeClick,
  width = '100%',
  height = '500px',
  selectedTreeId,
  showHealthIndicators = true
}) => {
  // 预加载常用树木模型
  useEffect(() => {
    modelLoader.preloadCommonModels();
    
    // 组件卸载时清理缓存
    return () => {
      // 如果需要在组件卸载时清理缓存，可以取消下面的注释
      // modelLoader.clearCache();
    };
  }, []);
  
  // 树木点击处理函数
  const handleTreeClick = (treeId: number | string) => (event: any) => {
    if (onTreeClick) {
      onTreeClick(treeId);
    }
  };
  
  return (
    <div style={{ width, height, position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [10, 7, 10], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: 'linear-gradient(to top, #87CEEB, #1E90FF)' }}
      >
        {/* 场景光照 */}
        <Lighting />
        
        {/* 相机控制 */}
        <CameraController />
        
        {/* 地面 */}
        <Ground />
        
        {/* 环境效果 */}
        <Sky
          distance={450000}
          sunPosition={[10, 5, 5]}
          inclination={0.5}
          azimuth={0.25}
        />
        <Stars radius={100} depth={50} count={1000} factor={4} fade />
        
        {/* 渲染树木集合 */}
        {trees.map((tree) => (
          <TreeModel
            key={tree.id}
            type={tree.type}
            growthStage={tree.growthStage}
            position={tree.position}
            rotation={tree.rotation}
            scale={tree.scale}
            onClick={handleTreeClick(tree.id)}
            isHighlighted={selectedTreeId === tree.id}
            healthState={tree.healthState || 100} // 默认100表示完全健康
          />
        ))}
        
        {/* 环境贴图 */}
        <Environment preset="sunset" />
      </Canvas>
      
      {/* 健康状态信息图例，条件渲染 */}
      {showHealthIndicators && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(255,255,255,0.7)',
          padding: '5px 10px',
          borderRadius: 4,
          fontSize: '12px',
          display: 'flex',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#4CAF50', marginRight: 5, borderRadius: '50%' }}></span>
            健康
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#CDDC39', marginRight: 5, borderRadius: '50%' }}></span>
            轻微枯萎
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#FFC107', marginRight: 5, borderRadius: '50%' }}></span>
            中度枯萎
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#FF5722', marginRight: 5, borderRadius: '50%' }}></span>
            严重枯萎
          </div>
        </div>
      )}
    </div>
  );
};

export default ForestScene; 