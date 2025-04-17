import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { Card, Spin, Row, Col, Button, Alert, Divider, Typography, Tooltip } from 'antd';
import { useTreeStore } from '../store';
import { TreeType } from '../types/Tree';
import * as treeService from '../services/treeService'; // 导入树木服务
import TreeModel from './TreeModel'; // 导入独立的TreeModel组件

const { Title, Text } = Typography;

// 定义TreeData类型，用于API返回的树木数据类型
interface TreeData {
  id: string;
  taskId?: string;
  type: string;
  stage: number;
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number };
  scale: { x: number, y: number, z: number };
  createdAt: string;
  lastGrowth: string;
  healthState?: number;
  task?: {
    id: string;
    title: string;
    status: string;
    progress?: number;
  };
}

// 简易视图组件 - 在3D渲染不可用时使用
const SimpleForestView: React.FC<{ onClickTree: (id: number) => void }> = ({ onClickTree }) => {
  const { trees } = useTreeStore();
  
  if (!trees.length) {
    return (
      <Alert
        message="暂无树木"
        description="您的森林中还没有树木。完成任务来种植一棵树！"
        type="info"
        showIcon
      />
    );
  }

  // 获取树木颜色，基于类型和健康状态
  const getTreeHealthColor = (tree: any) => {
    // 基础颜色
    const baseColor = 
      tree.type === TreeType.PINE ? '#2d4c0e' : 
      tree.type === TreeType.OAK ? '#4a7d1a' : 
      tree.type === TreeType.CHERRY ? '#e77c8e' : 
      tree.type === TreeType.MAPLE ? '#d46a4c' : 
      tree.type === TreeType.PALM ? '#6a994e' :
      tree.type === TreeType.WILLOW ? '#8ad472' :
      tree.type === TreeType.APPLE ? '#91c73e' : '#6a994e';
    
    // 如果没有健康状态信息，返回基础颜色
    if (tree.healthState === undefined) {
      console.warn(`树木 ${tree.id} 缺少健康状态信息`);
      return baseColor;
    }
    
    // 根据健康状态调整颜色
    if (tree.healthState < 25) {
      return '#A05A2C'; // 严重枯萎 - 褐色
    } else if (tree.healthState < 50) {
      return '#FFA500'; // 中度枯萎 - 橙色
    } else if (tree.healthState < 75) {
      return '#CDDC39'; // 轻微枯萎 - 黄绿色
    }
    
    return baseColor; // 健康状态良好 - 使用默认绿色
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        {trees.map(tree => (
          <Col key={tree.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => onClickTree(tree.id)}
              title={`${tree.type}树`}
              extra={
                <Tooltip title="查看详情">
                  <Button type="link" size="small">查看</Button>
                </Tooltip>
              }
            >
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ 
                  height: '100px', 
                  background: getTreeHealthColor(tree),
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  margin: '0 auto',
                  width: `${50 + tree.growthStage * 10}px`
                }} />
                <div style={{ 
                  width: '20px', 
                  height: `${30 + tree.growthStage * 15}px`, 
                  background: tree.healthState && tree.healthState < 25 ? '#5D4037' : 'brown',
                  margin: '0 auto'
                }} />
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <p><strong>生长阶段:</strong> {tree.growthStage}/3</p>
                <p><strong>关联任务:</strong> {tree.task?.title || '无'}</p>
                {tree.healthState !== undefined && (
                  <p><strong>健康状态:</strong> {tree.healthState}%</p>
                )}
                {tree.task?.progress !== undefined && (
                  <p><strong>任务进度:</strong> {tree.task.progress}%</p>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("森林场景渲染错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// 加载组件
const Loader: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    flexDirection: 'column',
    padding: '40px'
  }}>
    <Spin size="large" />
    <p style={{ marginTop: '20px' }}>正在加载森林...</p>
  </div>
);

// 主森林场景组件
const ForestScene: React.FC = () => {
  const { 
    trees, 
    loading, 
    error, 
    selectedTree, 
    selectTree, 
    setTrees, 
    setLoading,
    setError,
    growTree,
    lastUpdated // 获取上次更新时间戳
  } = useTreeStore();
  
  const [use3D, setUse3D] = useState(true);
  const [renderError, setRenderError] = useState(false);
  // 添加数据就绪状态跟踪
  const [dataReady, setDataReady] = useState(false);
  // 添加数据来源跟踪
  const [dataSource, setDataSource] = useState<'cache' | 'api' | null>(null);

  // 初始化组件
  useEffect(() => {
    // 检查localStorage中是否有缓存的树木数据
    try {
      const storedData = localStorage.getItem('taskforest-tree-storage');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.state && parsedData.state.trees && parsedData.state.trees.length > 0) {
          console.log('从本地存储加载树木数据:', parsedData.state.trees.length, '棵树');
          console.log('上次更新时间:', new Date(parsedData.state.lastUpdated).toLocaleString());
          
          // 直接从缓存加载树木数据到状态
          setTrees(parsedData.state.trees);
          
          // 标记数据为缓存来源
          setDataSource('cache');
          // 确保树木数据已就绪
          setDataReady(true);
        }
      }
    } catch (err) {
      console.error('读取缓存的树木数据失败:', err);
    }
  }, [setTrees]);

  // 从API获取树木数据
  useEffect(() => {
    // 确保在组件挂载时执行，并在卸载时清理
    let isMounted = true;
    
    const fetchTrees = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 使用树木服务获取数据
        const response = await treeService.getTrees();
        console.log('API树木数据:', response.data);
        
        if (!isMounted) return;
        
        if (!response.data || !response.data.data || !response.data.data.trees) {
          console.error('API返回的树木数据格式错误:', response.data);
          setError('获取树木数据失败，返回数据格式不正确');
          
          // 如果API失败但有缓存数据，保持使用缓存数据
          if (dataSource === 'cache' && trees.length > 0) {
            console.log('API加载失败，继续使用缓存的树木数据');
            setDataReady(true); // 确保数据就绪
          } else {
            setDataReady(false);
          }
          
          setLoading(false);
          return;
        }
        
        // 将API树木数据转换为应用格式并先更新到本地存储
        const treesData = response.data.data.trees.map(apiTree => {
          console.log(`处理树木 ${apiTree.id}, 健康状态: ${apiTree.healthState}, 生长阶段: ${apiTree.stage}`);
          
          // 根据任务进度计算生长阶段
          let calculatedGrowthStage = apiTree.stage;
          
          // 如果有关联任务，并且有进度信息，则根据进度更新生长阶段
          if (apiTree.task && apiTree.task.progress !== undefined) {
            const progress = apiTree.task.progress;
            
            // 根据进度值计算生长阶段（0-3）
            calculatedGrowthStage = calculateGrowthStage(progress);
            
            // 打印生长阶段信息，帮助调试
            console.log(`树木 ${apiTree.id} 任务进度: ${progress}%, 计算生长阶段: ${calculatedGrowthStage}`);
            
            // 如果计算的生长阶段高于后端返回的生长阶段，则更新服务器的值
            if (calculatedGrowthStage > apiTree.stage) {
              // 异步更新树木生长阶段
              const treeIdString = apiTree.id;
              console.log(`更新树木 ${treeIdString} 的生长阶段: ${apiTree.stage} → ${calculatedGrowthStage}`);
              
              // 异步更新不阻塞主数据流程
              treeService.updateTree(treeIdString, {
                stage: calculatedGrowthStage
              }).then(response => {
                console.log(`树木 ${treeIdString} 生长阶段更新成功:`, response.data);
              }).catch(error => {
                console.error(`树木 ${treeIdString} 生长阶段更新失败:`, error);
              });
            } else if (calculatedGrowthStage < apiTree.stage) {
              // 如果API返回的阶段高于计算的阶段，记录异常但保留API返回的值
              console.warn(`树木 ${apiTree.id} 阶段异常: API返回${apiTree.stage}，但根据进度${progress}%计算应为${calculatedGrowthStage}`);
              calculatedGrowthStage = apiTree.stage; // 使用API返回的更高阶段值，避免树木"退化"
              console.log(`使用API返回的更高阶段: ${calculatedGrowthStage}`);
            }
          }
          
          // 确保健康状态存在，如果不存在则设为默认值
          const healthState = apiTree.healthState !== undefined && apiTree.healthState !== null 
            ? apiTree.healthState 
            : 100; // 默认为完全健康
          
          // 转换为前端数据结构
          return {
            id: Number(apiTree.id.replace('tree-', '')),
            type: apiTree.type as TreeType,
            growthStage: calculatedGrowthStage, // 使用计算的生长阶段，而不是API返回的值
            positionX: apiTree.position.x,
            positionZ: apiTree.position.z,
            createdAt: apiTree.createdAt,
            taskId: Number(apiTree.taskId),
            healthState: healthState, // 确保有健康状态值
            task: apiTree.task ? {
              id: Number(apiTree.task.id),
              title: apiTree.task.title,
              priority: 1 as any,
              status: 0 as any,
              completed: apiTree.task.status === 'COMPLETED',
              completedAt: apiTree.task.status === 'COMPLETED' ? new Date().toISOString() : undefined,
              createdAt: apiTree.createdAt,
              updatedAt: apiTree.lastGrowth,
              progress: apiTree.task.progress
            } : undefined
          };
        });
        
        if (!isMounted) return;
        
        // 设置树木数据，healthState已经包含在API返回中
        console.log('处理后的树木数据:', treesData);
        
        // 验证健康状态
        const validData = treesData.every(tree => 
          tree.healthState !== undefined && tree.healthState !== null
        );
        
        if (!validData) {
          console.warn('部分树木缺少健康状态数据，已自动修正为默认值');
        }
        
        // 如果有缓存数据，合并并保留更高级的生长阶段
        if (dataSource === 'cache' && trees.length > 0) {
          console.log('合并API数据与缓存数据，保留更高级的生长阶段');
          
          const mergedTreesData = treesData.map(apiTree => {
            const cachedTree = trees.find(t => t.id === apiTree.id);
            if (cachedTree && cachedTree.growthStage > apiTree.growthStage) {
              console.log(`保留缓存中更高级的生长阶段: 树木ID=${apiTree.id}, API=${apiTree.growthStage}, 缓存=${cachedTree.growthStage}`);
              return {
                ...apiTree,
                growthStage: cachedTree.growthStage
              };
            }
            return apiTree;
          });
          
          // 更新为合并后的数据
          setTrees(mergedTreesData);
        } else {
          // 直接使用API数据
          setTrees(treesData);
        }
        
        // 更新树木数据源为API
        setDataSource('api');
        setDataReady(true); // 标记数据已就绪
        setLoading(false);
        
        console.log('树木数据加载完成，设置状态为就绪');
      } catch (err) {
        if (!isMounted) return;
        console.error('获取树木失败:', err);
        setError('获取树木数据失败，请稍后重试');
        setLoading(false);
        
        // 如果API失败但有缓存数据，保持使用缓存数据
        if (dataSource === 'cache' && trees.length > 0) {
          console.log('API加载失败，继续使用缓存的树木数据');
          setDataReady(true);
        } else {
          setDataReady(false);
        }
      }
    };

    // 页面加载或刷新时立即获取数据
    fetchTrees();
    
    // 可选：设置定期刷新 - 每60秒刷新一次数据
    const refreshInterval = setInterval(() => {
      console.log('定期刷新树木数据...');
      fetchTrees();
    }, 60000);
    
    // 清理函数
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      console.log('森林场景组件卸载，清理资源');
    };
  }, [setLoading, setError, setTrees, dataSource, trees.length]);

  // 处理树木点击
  const handleTreeClick = (treeId: number) => {
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
      selectTree(tree);
    }
  };

  // 处理树木生长
  const handleGrowTree = async (treeId: number) => {
    try {
      // 获取当前树木数据
      const tree = trees.find(t => t.id === treeId);
      if (!tree) return;
      
      // 确保不超过最大生长阶段
      if (tree.growthStage >= 3) return;
      
      // 调用API更新树木阶段
      const treeIdString = `tree-${treeId}`;
      const updatedApiTree = await treeService.updateTree(treeIdString, {
        stage: tree.growthStage + 1
      });
      
      console.log('树木生长结果:', updatedApiTree);
      
      // 更新本地状态
      growTree(treeId);
    } catch (error) {
      console.error('促进树木生长失败:', error);
      setError('促进树木生长失败，请稍后重试');
    }
  };

  // 刷新数据
  const refreshData = () => {
    console.log('手动刷新数据...');
    setLoading(true);
    setDataReady(false);
    // 通过修改依赖项触发useEffect
    setError(null);
  };

  // 处理渲染错误
  const handleRenderError = () => {
    console.error("3D渲染失败，切换到简易视图");
    setRenderError(true);
    setUse3D(false);
  };

  // 新增一个处理点击事件的包装函数，忽略事件参数
  const handleTreeModelClick = (treeId: number) => () => {
    handleTreeClick(treeId);
  };

  // 如果正在加载且没有缓存数据，或者数据未就绪
  if ((loading && dataSource !== 'cache') || (!dataReady && trees.length === 0)) {
    return <Loader />;
  }

  // 显示错误
  if (error && (!dataReady || trees.length === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">{error}</Text>
        <Button 
          onClick={() => setError(null)} 
          style={{ marginTop: '20px' }}
          type="primary"
        >
          重试
        </Button>
      </div>
    );
  }

  // 检查是否有树木数据
  if ((!trees || trees.length === 0) && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Alert
          message="森林为空"
          description="您的森林中还没有树木。完成任务来种植你的第一棵树！"
          type="info"
          showIcon
        />
        <Button 
          onClick={refreshData} 
          style={{ marginTop: '20px' }}
        >
          刷新数据
        </Button>
      </div>
    );
  }

  // 渲染简易视图
  if (!use3D || renderError) {
    return (
      <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3}>我的森林</Title>
          <div>
            <Button 
              onClick={refreshData} 
              style={{ marginRight: '8px' }}
            >
              刷新数据
            </Button>
            <Button onClick={() => setUse3D(!use3D)}>
              {renderError ? '3D渲染失败' : '尝试3D视图'}
            </Button>
          </div>
        </div>
        <SimpleForestView onClickTree={handleTreeClick} />
      </div>
    );
  }

  // 渲染3D视图
  return (
    <ErrorBoundary fallback={
      <div className="forest-fallback">
        <Alert
          message="3D渲染不可用"
          description="您的浏览器或设备不支持3D渲染，正在显示简化版本的森林视图。"
          type="warning"
          showIcon
        />
        <SimpleForestView onClickTree={handleTreeClick} />
      </div>
    }>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {(loading && !dataReady) && <Loader />}
        
        {error && (
          <Alert 
            message="加载错误" 
            description={error}
            type="error" 
            showIcon 
            style={{ margin: '20px' }}
          />
        )}

        {dataReady && (
          <Canvas
            shadows
            style={{ width: '100%', height: '80vh' }}
            camera={{ position: [0, 5, 8], fov: 50 }}
            onCreated={() => {
              console.log('Three.js Canvas渲染成功');
            }}
          >
            {/* 环境光源 */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-near={0.1}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            
            {/* 地面 */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.1, 0]} 
              receiveShadow
            >
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#8a9a5b" roughness={1} />
            </mesh>

            {/* 渲染树木 */}
            {trees.map((tree, index) => {
              // 确保生长阶段在0-3范围内
              const validGrowthStage = Math.max(0, Math.min(3, tree.growthStage || 0));
              if (validGrowthStage !== tree.growthStage) {
                console.warn(`树木 ${tree.id} 生长阶段值(${tree.growthStage})超出范围(0-3)，已调整为${validGrowthStage}`);
                tree.growthStage = validGrowthStage;
              }
              
              // 确保使用包含健康状态和生长阶段的唯一键
              const treeKey = `tree-${tree.id}-${tree.growthStage}-${tree.healthState}`;
              
              // 输出更详细的树木渲染日志
              console.log(
                `渲染树木[${index+1}/${trees.length}]: ` + 
                `ID=${tree.id}, 类型=${tree.type}, ` + 
                `生长阶段=${tree.growthStage}, 健康状态=${tree.healthState}, ` + 
                `位置=(${tree.positionX.toFixed(1)},${tree.positionZ.toFixed(1)}), ` + 
                `Key=${treeKey}`
              );
              
              // 检查树木数据完整性
              if (tree.growthStage === undefined || tree.growthStage === null) {
                console.error(`⚠️ 树木 ${tree.id} 生长阶段未定义，使用默认值0`);
                tree.growthStage = 0;
              }

              return (
                <TreeModel
                  key={treeKey}
                  type={tree.type as TreeType}
                  growthStage={tree.growthStage}
                  healthState={tree.healthState}
                  position={[tree.positionX, 0, tree.positionZ]}
                  onClick={() => handleTreeClick(tree.id)}
                />
              );
            })}
            
            {/* 轨道控制 */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              minDistance={3}
              maxDistance={20}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2.5}
            />
            
            {/* 环境 */}
            <Environment preset="forest" background={false} />
            <Stars radius={100} depth={50} count={1000} factor={2} fade />
          </Canvas>
        )}
        
        {/* 简易模式切换按钮 */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <Button onClick={() => setUse3D(!use3D)}>
            切换到{use3D ? '简易' : '3D'}模式
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

/**
 * 根据进度百分比计算生长阶段（0-3）
 * @param progress 进度百分比（0-100）
 * @returns 生长阶段（0-3）
 */
function calculateGrowthStage(progress: number): number {
  if (progress >= 100) return 3; // 成熟
  if (progress >= 66) return 2;  // 生长中
  if (progress >= 33) return 1;  // 幼苗
  return 0; // 种子
}

/**
 * 获取生长阶段名称
 * @param stage 生长阶段
 * @returns 阶段名称
 */
function getGrowthStageName(stage: number): string {
  switch (stage) {
    case 0: return '种子';
    case 1: return '幼苗';
    case 2: return '生长中';
    case 3: return '成熟';
    default: return '未知';
  }
}

/**
 * 获取生长阶段颜色
 * @param stage 生长阶段
 * @returns 阶段对应的颜色
 */
function getGrowthStageColor(stage: number): string {
  switch (stage) {
    case 0: return '#8B4513'; // 种子 - 棕色
    case 1: return '#90EE90'; // 幼苗 - 淡绿色
    case 2: return '#32CD32'; // 生长中 - 绿色
    case 3: return '#006400'; // 成熟 - 深绿色
    default: return '#CCCCCC'; // 未知 - 灰色
  }
}

export default ForestScene; 