import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { Card, Spin, Row, Col, Button, Alert, Divider, Typography, Tooltip } from 'antd';
import TreeModel from './TreeModel';
import TreeService from '../services/TreeService';
import { Tree } from '../types/Tree';

const { Title, Text } = Typography;

// 使用一个简单的UI组件替代3D场景
const SimpleForestView: React.FC<{ trees: Tree[], onClickTree: (tree: Tree) => void }> = ({ trees, onClickTree }) => {
  if (!trees.length) {
    return (
      <Alert
        message="暂无树木"
        description="您的森林中还没有树木。添加一个任务来种植一棵树！"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Alert
        message="使用简易视图"
        description="我们正在使用简易视图显示您的森林。3D视图可能不可用或遇到渲染问题。"
        type="warning"
        showIcon
        style={{ marginBottom: '20px' }}
      />
      <Row gutter={[16, 16]}>
        {trees.map(tree => (
          <Col key={tree.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => onClickTree(tree)}
              title={`${tree.type}树 #${tree.id}`}
              extra={
                <Tooltip title="查看详情">
                  <Button type="link" size="small">查看</Button>
                </Tooltip>
              }
            >
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ 
                  height: '100px', 
                  background: tree.type === 'oak' ? '#4a7d1a' : 
                              tree.type === 'pine' ? '#2d4c0e' : 
                              tree.type === 'cherry' ? '#e77c8e' : '#6a994e',
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
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [renderError, setRenderError] = useState<boolean>(false);
  const [use3D, setUse3D] = useState(true);

  // 获取树木数据
  const fetchTrees = async () => {
    try {
      setLoading(true);
      const fetchedTrees = await TreeService.getTrees();
      setTrees(fetchedTrees);
      console.log("已加载树木:", fetchedTrees.length);
    } catch (error) {
      console.error("获取树木失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  // 处理树木点击
  const handleTreeClick = (tree: Tree) => {
    console.log("选中树木:", tree);
    setSelectedTree(tree);
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

  // 渲染简易视图
  if (!use3D || renderError) {
    return (
      <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3}>我的森林</Title>
          <Button onClick={() => setUse3D(!use3D)}>
            {use3D ? '切换到简易视图' : '尝试3D视图'}
          </Button>
        </div>
        <SimpleForestView trees={trees} onClickTree={handleTreeClick} />
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
      
      <ErrorBoundary fallback={<SimpleForestView trees={trees} onClickTree={handleTreeClick} />}>
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
              <meshStandardMaterial color="green" />
            </mesh>
            
            {/* 树木 */}
            {trees.map((tree) => (
              <TreeModel
                key={tree.id}
                type={tree.type}
                growthStage={tree.growthStage}
                position={[tree.positionX, 0, tree.positionZ]}
                onClick={() => handleTreeClick(tree)}
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
          extra={<Button size="small" onClick={() => setSelectedTree(null)}>关闭</Button>}
        >
          <p><strong>ID:</strong> {selectedTree.id}</p>
          <p><strong>类型:</strong> {selectedTree.type}</p>
          <p><strong>生长阶段:</strong> {selectedTree.growthStage}/5</p>
          {selectedTree.task && (
            <>
              <Divider />
              <p><strong>关联任务:</strong> {selectedTree.task.title}</p>
              <p><strong>状态:</strong> {selectedTree.task.completed ? '已完成' : '进行中'}</p>
              {selectedTree.task.deadline && (
                <p><strong>截止日期:</strong> {new Date(selectedTree.task.deadline).toLocaleDateString()}</p>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default ForestScene; 