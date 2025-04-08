import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { Card, Spin, Row, Col, Button, Alert, Divider, Typography, Tooltip } from 'antd';
import { useTreeStore } from '../store';
import { TreeType } from '../types/Tree';

const { Title, Text } = Typography;

// 树木3D模型组件
const TreeModel: React.FC<{ 
  type: TreeType | string; 
  growthStage: number; 
  position: [number, number, number]; 
  onClick: () => void;
}> = ({ type, growthStage, position, onClick }) => {
  // 这里是简化版本，实际应该加载3D模型
  const scale = 0.5 + (growthStage * 0.15); // 根据生长阶段缩放
  
  return (
    <group position={position} onClick={onClick}>
      {/* 树干 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1 * scale, 8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      
      {/* 树冠/叶子 */}
      <mesh position={[0, 1.2 + scale/2, 0]} castShadow>
        {type === TreeType.PINE ? (
          <coneGeometry args={[0.8 * scale, 2 * scale, 8]} />
        ) : type === TreeType.OAK ? (
          <sphereGeometry args={[0.8 * scale, 16, 16]} />
        ) : type === TreeType.CHERRY ? (
          <sphereGeometry args={[0.9 * scale, 16, 16]} />
        ) : (
          <sphereGeometry args={[0.8 * scale, 16, 16]} />
        )}
        
        <meshStandardMaterial 
          color={
            type === TreeType.PINE ? '#2d4c0e' : 
            type === TreeType.OAK ? '#4a7d1a' : 
            type === TreeType.CHERRY ? '#e77c8e' : 
            type === TreeType.MAPLE ? '#d46a4c' : '#6a994e'
          } 
        />
      </mesh>
    </group>
  );
};

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
                  background: 
                    tree.type === TreeType.OAK ? '#4a7d1a' : 
                    tree.type === TreeType.PINE ? '#2d4c0e' : 
                    tree.type === TreeType.CHERRY ? '#e77c8e' : 
                    tree.type === TreeType.MAPLE ? '#d46a4c' : '#6a994e',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  margin: '0 auto',
                  width: `${50 + tree.growthStage * 10}px`
                }} />
                <div style={{ 
                  width: '20px', 
                  height: `${30 + tree.growthStage * 15}px`, 
                  background: 'brown',
                  margin: '0 auto'
                }} />
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <p><strong>生长阶段:</strong> {tree.growthStage}/5</p>
                <p><strong>关联任务:</strong> {tree.task?.title || '无'}</p>
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
    growTree
  } = useTreeStore();
  
  const [use3D, setUse3D] = useState(true);
  const [renderError, setRenderError] = useState(false);

  // 模拟从API获取树木数据
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        setLoading(true);
        
        // 这里应该是实际的API调用
        // const response = await treeService.getTrees();
        // setTrees(response.data);
        
        // 模拟数据
        setTimeout(() => {
          setTrees([
            {
              id: 1,
              type: TreeType.OAK,
              growthStage: 3,
              positionX: -5,
              positionZ: 2,
              createdAt: new Date().toISOString(),
              taskId: 1,
              task: {
                id: 1,
                title: '完成TaskForest项目设计',
                priority: 2 as any,
                status: 1 as any,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            },
            {
              id: 2,
              type: TreeType.PINE,
              growthStage: 2,
              positionX: 3,
              positionZ: -2,
              createdAt: new Date().toISOString(),
              taskId: 2,
              task: {
                id: 2,
                title: '实现树木生长动画',
                priority: 1 as any,
                status: 0 as any,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            },
            {
              id: 3,
              type: TreeType.CHERRY,
              growthStage: 5,
              positionX: 0,
              positionZ: 5,
              createdAt: new Date().toISOString(),
              taskId: 3,
              task: {
                id: 3,
                title: '编写API文档',
                priority: 0 as any,
                status: 2 as any,
                completed: true,
                completedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('获取树木失败');
        setLoading(false);
      }
    };

    fetchTrees();
  }, [setLoading, setError, setTrees]);

  // 处理树木点击
  const handleTreeClick = (treeId: number) => {
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
      selectTree(tree);
    }
  };

  // 处理树木生长
  const handleGrowTree = (treeId: number) => {
    growTree(treeId);
  };

  // 处理渲染错误
  const handleRenderError = () => {
    console.error("3D渲染失败，切换到简易视图");
    setRenderError(true);
    setUse3D(false);
  };

  // 如果正在加载
  if (loading) {
    return <Loader />;
  }

  // 显示错误
  if (error) {
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

  // 渲染简易视图
  if (!use3D || renderError) {
    return (
      <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3}>我的森林</Title>
          <Button onClick={() => setUse3D(!use3D)}>
            {renderError ? '3D渲染失败' : '尝试3D视图'}
          </Button>
        </div>
        <SimpleForestView onClickTree={handleTreeClick} />
      </div>
    );
  }

  // 渲染3D视图
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ marginBottom: '20px', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.8)', zIndex: 10 }}>
        <Title level={3} style={{ margin: 0 }}>我的森林</Title>
        <Button onClick={() => setUse3D(false)}>切换到简易视图</Button>
      </div>
      
      <ErrorBoundary fallback={<SimpleForestView onClickTree={handleTreeClick} />}>
        <div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
          <Canvas
            shadows
            camera={{ position: [10, 10, 10], fov: 50 }}
            onError={handleRenderError}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            
            {/* 地面 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#8fc490" />
            </mesh>
            
            {/* 树木 */}
            {trees.map((tree) => (
              <TreeModel
                key={tree.id}
                type={tree.type}
                growthStage={tree.growthStage}
                position={[tree.positionX, 0, tree.positionZ]}
                onClick={() => handleTreeClick(tree.id)}
              />
            ))}
            
            <Stars radius={100} depth={50} count={5000} factor={4} />
            <Environment preset="sunset" />
            <OrbitControls />
          </Canvas>
        </div>
      </ErrorBoundary>

      {selectedTree && (
        <Card
          title={`${selectedTree.type}树详情`}
          style={{
            position: 'absolute',
            right: 20,
            top: 70,
            width: 300,
            zIndex: 100,
            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
          }}
          extra={<Button size="small" onClick={() => selectTree(null)}>关闭</Button>}
          actions={[
            <Button 
              key="grow" 
              type="primary" 
              onClick={() => handleGrowTree(selectedTree.id)}
              disabled={selectedTree.growthStage >= 5}
            >
              {selectedTree.growthStage >= 5 ? '已完全成长' : '促进生长'}
            </Button>
          ]}
        >
          <p><strong>ID:</strong> {selectedTree.id}</p>
          <p><strong>类型:</strong> {selectedTree.type}</p>
          <p><strong>生长阶段:</strong> {selectedTree.growthStage}/5</p>
          {selectedTree.task && (
            <>
              <Divider />
              <p><strong>关联任务:</strong> {selectedTree.task.title}</p>
              <p><strong>状态:</strong> {selectedTree.task.completed ? '已完成' : '进行中'}</p>
              {selectedTree.task.completedAt && (
                <p><strong>完成日期:</strong> {new Date(selectedTree.task.completedAt).toLocaleDateString()}</p>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default ForestScene; 