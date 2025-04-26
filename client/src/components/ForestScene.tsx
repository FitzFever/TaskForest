import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { Card, Spin, Row, Col, Button, Alert, Divider, Typography, Tooltip } from 'antd';
import { TreeType, Tree } from '../types/Tree';
import * as treeService from '../services/treeService'; // 导入树木服务
import TreeModel from './TreeModel'; // 导入独立的TreeModel组件
import useTreeStore from '../store/treeStore';

const { Title, Text } = Typography;

// 定义TreeData类型，用于API返回的树木数据类型
interface TreeData {
  id: string | number;
  taskId?: string;
  type: TreeType;
  growthStage: number;
  position: [number, number, number];
  rotation: [number, number, number];
  healthState?: number;
}

// 简易视图组件 - 在3D渲染不可用时使用
const SimpleForestView: React.FC<{ onClickTree: (id: number | string) => void }> = ({ onClickTree }) => {
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
                <p><strong>生长阶段:</strong> {tree.growthStage}/5</p>
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
  // 添加调试状态 - 显示树木类型统计
  const [treeTypeCounts, setTreeTypeCounts] = useState<Record<string, number>>({});
  // 调试开关 - 是否强制使用几何体渲染代替3D模型
  const [forceUseGeometry, setForceUseGeometry] = useState(false);
  // 添加树木生长阶段统计状态
  const [stageStats, setStageStats] = useState<Record<number, number>>({});

  // 初始化组件
  useEffect(() => {
    console.log('ForestScene: 初始化或生长阶段系统更新');
    console.log('当前生长阶段计算规则: 0-3阶段体系');
    console.log('- 阶段0(种子): 进度 0-33%');
    console.log('- 阶段1(幼苗): 进度 33-66%');
    console.log('- 阶段2(成长): 进度 66-100%');
    console.log('- 阶段3(成熟): 进度 100%');
    
    refreshData();
    
    // 设置树木数据刷新定时器
    const intervalId = setInterval(() => {
      refreshData();
    }, 60000); // 每分钟刷新一次
    
    return () => clearInterval(intervalId);
  }, []);

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
        console.log('API树木数据总数:', response.data?.data?.pagination?.total || '未知');
        console.log('API返回树木数据:', response.data?.data?.trees?.length || 0, '棵树');
        
        // 记录所有树木类型，用于调试
        if (response.data?.data?.trees) {
          const treeTypes = response.data.data.trees.map(tree => tree.type);
          const uniqueTypes = [...new Set(treeTypes)];
          console.log('API返回的树木类型:', uniqueTypes);
          console.log('树木类型统计:', treeTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}));
        }
        
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
        
        let treesData = response.data.data.trees.map(tree => {
          // 确保TreeData的字段格式正确
          const position: [number, number, number] = [
            (tree.position?.x || 0), 
            (tree.position?.y || 0), 
            (tree.position?.z || 0)
          ];

          // 确保树木类型有效
          const type = tree.type ? 
            (Object.values(TreeType).includes(tree.type as TreeType) ? 
              tree.type as TreeType : 
              TreeType.OAK) :
            TreeType.OAK;
          
          return {
            id: tree.id,
            type,
            growthStage: tree.stage || tree.growthStage || 0,
            position,
            rotation: [0, 0, 0] as [number, number, number],
            healthState: tree.healthState !== undefined ? tree.healthState : 100,
            taskId: tree.taskId || tree.mainTaskId
          };
        });
        
        // 过滤掉没有任务ID的树木
        const validTreesData = treesData.filter(tree => {
          const hasTaskId = Boolean(tree.taskId);
          if (!hasTaskId) {
            console.log(`[ForestScene] 过滤掉没有任务ID的树木: ${tree.id}`);
          }
          return hasTaskId;
        });
        
        if (treesData.length !== validTreesData.length) {
          console.log(`[ForestScene] 过滤前树木数量: ${treesData.length}, 过滤后: ${validTreesData.length}`);
        }
        
        // 更新为过滤后的树木数据
        treesData = validTreesData;
        
        console.log('树木数据总数:', treesData.length, '棵树');
        console.log('树木坐标示例:', treesData.length > 0 ? {
          位置类型: treesData[0].position ? 'position对象' : 'positionX/Z属性',
          位置值: treesData[0].position || { x: treesData[0].positionX, z: treesData[0].positionZ }
        } : '无树木数据');
        
        // 统计各类型树木数量
        const typeCounts = treesData.reduce((acc, tree) => {
          const type = tree.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('各类型树木数量:', typeCounts);
        setTreeTypeCounts(typeCounts);
        
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

  // 更新后在useEffect中添加生长阶段统计计算
  useEffect(() => {
    if (trees.length > 0) {
      // 计算各生长阶段的树木数量
      const stats: Record<number, number> = {};
      trees.forEach(tree => {
        const stage = tree.growthStage || 0;
        stats[stage] = (stats[stage] || 0) + 1;
      });
      setStageStats(stats);
      
      // 输出统计信息到控制台
      console.log('树木生长阶段统计:', stats);
    }
  }, [trees]);

  // 处理树木点击
  const handleTreeClick = (treeId: number | string) => {
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
      selectTree(tree);
    }
  };

  // 处理树木生长
  const handleGrowTree = async (treeId: number | string) => {
    try {
      // 获取当前树木数据
      const tree = trees.find(t => t.id === treeId);
      if (!tree) return;
      
      // 确保不超过最大生长阶段
      if (tree.growthStage >= 5) return;
      
      // 调用API更新树木阶段
      const treeIdString = typeof treeId === 'number' ? `tree-${treeId}` : treeId.toString();
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
  const handleTreeModelClick = (treeId: number | string) => () => {
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
              // 添加树木渲染前的详细日志
              console.log(`准备渲染树木[${index}]: ID=${tree.id}, 类型=${tree.type}`, tree);
              
              // 确保生长阶段在0-3范围内
              const validGrowthStage = Math.max(0, Math.min(3, tree.growthStage || 0));
              if (validGrowthStage !== tree.growthStage) {
                console.warn(`树木 ${tree.id} 生长阶段值(${tree.growthStage})超出范围(0-3)，已调整为${validGrowthStage}`);
                tree.growthStage = validGrowthStage;
              }
              
              // 确保使用包含健康状态和生长阶段的唯一键
              const treeKey = `tree-${tree.id}-${tree.growthStage}-${tree.healthState}-${tree.type}`;
              
              // 确保位置信息有效
              let posX = 0;
              let posZ = 0;
              
              // 处理不同格式的位置信息
              if (typeof tree.positionX === 'number' && !isNaN(tree.positionX)) {
                posX = tree.positionX;
              } else if (tree.position && typeof tree.position.x === 'number' && !isNaN(tree.position.x)) {
                posX = tree.position.x;
              } else {
                // 如果位置信息无效，分配一个基于索引的位置
                console.warn(`树木 ${tree.id} X坐标无效，分配基于索引的位置`);
                posX = (index % 5) * 3 - 6; // 创建一个5x5的网格
              }
              
              if (typeof tree.positionZ === 'number' && !isNaN(tree.positionZ)) {
                posZ = tree.positionZ;
              } else if (tree.position && typeof tree.position.z === 'number' && !isNaN(tree.position.z)) {
                posZ = tree.position.z;
              } else {
                // 如果位置信息无效，分配一个基于索引的位置
                console.warn(`树木 ${tree.id} Z坐标无效，分配基于索引的位置`);
                posZ = Math.floor(index / 5) * 3 - 6; // 创建一个5x5的网格
              }
              
              // 输出更详细的树木渲染日志
              console.log(
                `渲染树木[${index+1}/${trees.length}]: ` + 
                `ID=${tree.id}, 类型=${tree.type}, ` + 
                `生长阶段=${tree.growthStage}, 健康状态=${tree.healthState}, ` + 
                `位置=(${posX.toFixed(1)},${posZ.toFixed(1)}), ` + 
                `Key=${treeKey}`
              );
              
              // 检查树木数据完整性
              if (tree.growthStage === undefined || tree.growthStage === null) {
                console.error(`⚠️ 树木 ${tree.id} 生长阶段未定义，使用默认值0`);
                tree.growthStage = 0;
              }
              
              // 检查树木类型是否有效
              if (!tree.type || typeof tree.type !== 'string') {
                console.error(`⚠️ 树木 ${tree.id} 类型无效: ${tree.type}，使用默认类型OAK`);
                tree.type = TreeType.OAK;
              }
              
              // 检查树木健康状态是否有效
              if (tree.healthState === undefined || tree.healthState === null) {
                console.warn(`⚠️ 树木 ${tree.id} 健康状态未定义，使用默认值100`);
                tree.healthState = 100;
              }

              // 确保数据有效后才渲染树木模型
              return (
                <TreeModel
                  key={treeKey}
                  type={tree.type as TreeType}
                  growthStage={tree.growthStage}
                  healthState={tree.healthState}
                  position={[posX, 0, posZ]}
                  onClick={handleTreeModelClick(tree.id)}
                  useGeometry={forceUseGeometry}
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

        {/* 调试控制面板 */}
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 5, color: 'white' }}>
          <div>
            <label style={{ marginRight: 10 }}>
              <input 
                type="checkbox" 
                checked={forceUseGeometry} 
                onChange={(e) => setForceUseGeometry(e.target.checked)}
              /> 
              强制使用几何体渲染（解决模型加载问题）
            </label>
          </div>
          <div style={{ marginTop: 10 }}>
            <div>树木类型统计:</div>
            {Object.entries(treeTypeCounts).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{type}:</span> <span>{count}棵</span>
              </div>
            ))}
            <div style={{ marginTop: 5 }}>
              <strong>总计:</strong> {trees.length}棵
            </div>
          </div>
          
          {/* 新增：生长阶段统计 */}
          <div style={{ marginTop: 10 }}>
            <div>生长阶段统计:</div>
            {Object.entries(stageStats).map(([stage, count]) => (
              <div key={stage} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>阶段{stage} ({getGrowthStageName(Number(stage))}):</span> <span>{count}棵</span>
              </div>
            ))}
          </div>
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
  // 确保进度值有效
  if (progress === undefined || progress === null || isNaN(progress)) {
    console.warn(`进度值无效: ${progress}，使用默认值0`);
    return 0;
  }
  
  // 规范化进度值到0-100范围
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // 记录计算日志
  console.log(`计算生长阶段: 进度=${normalizedProgress}% -> ${
    normalizedProgress >= 100 ? '成熟(3)' : 
    normalizedProgress >= 66 ? '成长阶段(2)' : 
    normalizedProgress >= 33 ? '幼苗(1)' : 
    '种子(0)'
  }`);
  
  if (normalizedProgress >= 100) return 3; // 完全成熟
  if (normalizedProgress >= 66) return 2;  // 成长阶段
  if (normalizedProgress >= 33) return 1;  // 幼苗
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
    case 2: return '成长中';
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
    case 2: return '#228B22'; // 生长中 - 绿色
    case 3: return '#006400'; // 成熟 - 深绿色
    default: return '#CCCCCC'; // 未知 - 灰色
  }
}

export default ForestScene;