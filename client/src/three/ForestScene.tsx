import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, SoftShadows, Sparkles, Html } from '@react-three/drei';
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
  healthState?: number; // 树木健康值
  taskId?: string; // 关联的任务ID
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
    <>
      {/* 主地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#8bc34a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* 草地纹理层 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#a5d6a7" 
          roughness={1}
          metalness={0}
          opacity={0.9}
          transparent
        />
      </mesh>
    </>
  );
};

// 自定义云组件，不依赖外部资源
interface SimpleCloudProps {
  position: [number, number, number];
  scale?: number;
}

const SimpleCloud: React.FC<SimpleCloudProps> = ({ position, scale = 1 }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // 简单动画效果
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y += Math.sin(clock.getElapsedTime() * 0.2) * 0.002;
    }
  });
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh ref={mesh} castShadow>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.8}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[0.8, 0.2, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.8}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[-0.8, 0.3, 0]}>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.8}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[0.2, 0.4, 0.7]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.7}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

// 云朵组件
const Clouds: React.FC = () => {
  return (
    <>
      <SimpleCloud position={[-10, 15, -10]} scale={3} />
      <SimpleCloud position={[10, 10, -12]} scale={4} />
      <SimpleCloud position={[-8, 10, 8]} scale={5} />
      <SimpleCloud position={[12, 12, 5]} scale={3} />
    </>
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
      <ambientLight intensity={0.6} />
      
      {/* 方向光（太阳光） */}
      <directionalLight
        ref={sunLight}
        position={[10, 10, 5]}
        intensity={1.5}
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
        intensity={0.8}
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

// 添加粒子效果组件
const ParticleEffects: React.FC = () => {
  return (
    <>
      <Sparkles 
        count={50} 
        scale={[20, 5, 20]} 
        size={0.5} 
        speed={0.2} 
        color="#fff9c4" 
        position={[0, 1, 0]}
      />
    </>
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
  const [modelLoadErrors, setModelLoadErrors] = useState<string[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(process.env.NODE_ENV === 'development');
  const [isCheckingModels, setIsCheckingModels] = useState(false);
  
  // 定义模型检查结果类型
  interface ModelCheckItem {
    model: string;
    stage: number;
    url: string;
    status?: number;
    error?: string;
  }
  
  const [modelCheckResults, setModelCheckResults] = useState<{
    success: ModelCheckItem[], 
    failure: ModelCheckItem[]
  }>({
    success: [], 
    failure: []
  });
  
  // 预加载常用树木模型并检查模型文件
  useEffect(() => {
    console.log('加载森林场景模型...');
    // 预加载模型
    modelLoader.preloadCommonModels()
      .then(() => {
        console.log('模型预加载完成');
      })
      .catch(err => {
        console.error('模型预加载失败:', err);
        setModelLoadErrors(prev => [...prev, `模型预加载失败: ${err.message}`]);
      });
    
    // 检查模型文件
    if (process.env.NODE_ENV === 'development') {
      modelLoader.checkModelFiles()
        .then(() => {
          console.log('模型文件检查完成');
        })
        .catch(err => {
          console.error('模型文件检查失败:', err);
          setModelLoadErrors(prev => [...prev, `模型文件检查失败: ${err.message}`]);
        });
    }
  }, []);

  // 自动检查模型文件是否可访问
  const checkAllModelFiles = async () => {
    setIsCheckingModels(true);
    const results: {
      success: ModelCheckItem[], 
      failure: ModelCheckItem[]
    } = {
      success: [], 
      failure: []
    };
    const models = ['oak', 'pine', 'maple', 'willow', 'apple', 'palm', 'cherry'];
    const stages = [0, 1, 2, 3]; // seed, sapling, growing, mature
    
    console.log('开始检查所有模型文件...');
    
    for (const model of models) {
      for (const stage of stages) {
        let modelUrl;
        if (stage === 0) {
          modelUrl = `/models/trees/seedstage_${model}.glb`;
        } else {
          const stageMap = {
            1: 'sapling',
            2: 'growing',
            3: 'mature',
          };
          modelUrl = `/models/trees/${model}_${stageMap[stage]}.glb`;
        }
        
        try {
          const response = await fetch(modelUrl, { method: 'HEAD' });
          if (response.ok) {
            results.success.push({ model, stage, url: modelUrl, status: response.status });
            console.log(`✅ 模型存在: ${modelUrl}`);
          } else {
            results.failure.push({ model, stage, url: modelUrl, status: response.status });
            console.log(`❌ 模型不存在: ${modelUrl} (状态码: ${response.status})`);
          }
        } catch (error) {
          results.failure.push({ 
            model, 
            stage, 
            url: modelUrl, 
            error: error instanceof Error ? error.message : String(error) 
          });
          console.log(`❌ 检查失败: ${modelUrl} (${error})`);
        }
        
        // 添加短暂延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('------- 模型检查结果摘要 -------');
    console.log(`成功: ${results.success.length} 个模型`);
    console.log(`失败: ${results.failure.length} 个模型`);
    
    if (results.failure.length > 0) {
      console.log('失败模型列表:');
      results.failure.forEach(item => {
        console.log(`- ${item.model}/${item.stage}: ${item.url}`);
      });
    }
    
    setModelCheckResults(results);
    setIsCheckingModels(false);
    return results;
  };

  // 清除错误信息
  const clearErrors = () => {
    setModelLoadErrors([]);
  };

  // 切换调试信息显示
  const toggleDebugInfo = () => {
    setShowDebugInfo(prev => !prev);
  };

  // 处理树木点击事件
  const handleTreeClick = (treeId: number | string) => (event: any) => {
    if (onTreeClick) {
      onTreeClick(treeId);
      
      // 阻止事件传播
      event.stopPropagation();
    }
  };

  return (
    <div style={{ width, height, position: 'relative' }}>
      {/* 调试信息显示 */}
      {showDebugInfo && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          zIndex: 1000,
          fontSize: '12px',
          maxWidth: '300px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <strong>调试信息</strong>
            <button onClick={toggleDebugInfo} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
          </div>
          <div>
            <button onClick={checkAllModelFiles} disabled={isCheckingModels} style={{ marginRight: '5px', fontSize: '11px' }}>
              {isCheckingModels ? '检查中...' : '检查模型文件'}
            </button>
            <button onClick={clearErrors} style={{ fontSize: '11px' }}>清除错误</button>
          </div>
          {modelCheckResults.failure.length > 0 && (
            <div style={{ marginTop: '10px', color: '#ff5555' }}>
              <div>❌ {modelCheckResults.failure.length} 个模型文件不可访问:</div>
              <ul style={{ fontSize: '10px', paddingLeft: '15px' }}>
                {modelCheckResults.failure.slice(0, 5).map((item, index) => (
                  <li key={index}>{item.url}</li>
                ))}
                {modelCheckResults.failure.length > 5 && <li>...更多{modelCheckResults.failure.length - 5}个</li>}
              </ul>
            </div>
          )}
          {modelLoadErrors.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ color: '#ff5555' }}>加载错误:</div>
              <ul style={{ fontSize: '10px', paddingLeft: '15px' }}>
                {modelLoadErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ marginTop: '10px', fontSize: '10px' }}>
            <div>树木数量: {trees.length}</div>
            <div>打开测试页面: <a href="/model-test.html" target="_blank" style={{ color: '#55aaff' }}>模型测试页面</a></div>
          </div>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }} style={{ background: "#87CEEB" }}>
        {/* 相机控制 */}
        <CameraController />
        
        {/* 光照设置 */}
        <Lighting />
        
        {/* 天空 */}
        <Sky sunPosition={[100, 10, 100]} />
        <Stars radius={300} depth={50} count={1000} factor={4} />
        
        {/* 软阴影效果 */}
        <SoftShadows size={10} samples={16} focus={0.5} />
        
        {/* 粒子效果 */}
        <ParticleEffects />
        
        {/* 地面 */}
        <Ground />
        
        {/* 云彩装饰 */}
        <Clouds />
        
        {/* 渲染树木模型 */}
        {trees.map((tree) => (
          <TreeModel
            key={`tree-${tree.id}`}
            type={tree.type}
            growthStage={tree.growthStage}
            position={tree.position}
            rotation={tree.rotation || [0, 0, 0]}
            scale={tree.scale || [1, 1, 1]}
            onClick={handleTreeClick(tree.id)}
            isHighlighted={selectedTreeId === tree.id}
            healthState={tree.healthState}
          />
        ))}
      </Canvas>
      
      {/* 调试按钮 */}
      {process.env.NODE_ENV === 'development' && !showDebugInfo && (
        <button 
          onClick={toggleDebugInfo}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          显示调试信息
        </button>
      )}
    </div>
  );
};

export default ForestScene; 