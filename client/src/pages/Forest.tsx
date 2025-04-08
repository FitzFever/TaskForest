import React, { useState, useEffect } from 'react';
import { Card, Spin, Button, Radio, Tooltip } from 'antd';
import { EnvironmentOutlined, ReloadOutlined, ExpandOutlined, EyeOutlined } from '@ant-design/icons';

// 模拟树木数据
const MOCK_TREES = [
  { id: 1, type: 'oak', growthStage: 3, position: { x: -5, y: 0, z: 2 }, task: { title: '完成产品设计文档' } },
  { id: 2, type: 'pine', growthStage: 2, position: { x: 3, y: 0, z: -2 }, task: { title: '实现用户认证功能' } },
  { id: 3, type: 'cherry', growthStage: 5, position: { x: 0, y: 0, z: 5 }, task: { title: '修复导航栏显示问题' } },
];

const Forest: React.FC = () => {
  const [trees, setTrees] = useState(MOCK_TREES);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedTree, setSelectedTree] = useState<any>(null);

  // 模拟从API获取树木数据
  useEffect(() => {
    const fetchTrees = async () => {
      setLoading(true);
      try {
        // 实际项目中这里会调用API
        // const response = await api.getTrees();
        // setTrees(response.data);
        setLoading(false);
      } catch (error) {
        console.error('获取树木数据失败:', error);
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

  const handleTreeClick = (tree: any) => {
    setSelectedTree(tree);
  };

  // 简单的2D视图
  const SimplifiedView = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {trees.map(tree => (
        <div 
          key={tree.id}
          onClick={() => handleTreeClick(tree)}
          style={{ 
            width: '120px',
            height: '150px',
            background: '#f9f9f9',
            border: selectedTree?.id === tree.id ? '2px solid #1890ff' : '1px solid #e8e8e8',
            borderRadius: '8px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ 
            fontSize: '64px',
            marginBottom: '10px',
          }}>
            {tree.type === 'oak' && '🌳'}
            {tree.type === 'pine' && '🌲'}
            {tree.type === 'cherry' && '🌸'}
          </div>
          <div style={{ 
            fontSize: '12px',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            whiteSpace: 'nowrap'
          }}>
            {tree.task.title}
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            成长: {tree.growthStage}/5
          </div>
        </div>
      ))}
    </div>
  );

  // 3D视图占位
  const ThreeDView = () => (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      background: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%)',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        <Tooltip title="定位">
          <Button 
            type="primary" 
            shape="circle" 
            icon={<EnvironmentOutlined />} 
            style={{ marginRight: '8px', background: 'rgba(255, 255, 255, 0.7)', color: '#000' }}
          />
        </Tooltip>
        <Tooltip title="全屏">
          <Button 
            type="primary" 
            shape="circle" 
            icon={<ExpandOutlined />} 
            style={{ marginRight: '8px', background: 'rgba(255, 255, 255, 0.7)', color: '#000' }}
          />
        </Tooltip>
        <Tooltip title="刷新">
          <Button 
            type="primary" 
            shape="circle" 
            icon={<ReloadOutlined />} 
            style={{ background: 'rgba(255, 255, 255, 0.7)', color: '#000' }}
          />
        </Tooltip>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
          {/* 使用表情符号模拟3D树木 */}
          {trees.map(tree => (
            <span 
              key={tree.id} 
              style={{ 
                margin: '0 15px', 
                fontSize: 24 + tree.growthStage * 8,
                cursor: 'pointer',
                opacity: selectedTree?.id === tree.id ? 1 : 0.8,
                border: selectedTree?.id === tree.id ? '2px dashed #fff' : 'none',
                padding: '5px',
                borderRadius: '50%'
              }}
              onClick={() => handleTreeClick(tree)}
            >
              {tree.type === 'oak' && '🌳'}
              {tree.type === 'pine' && '🌲'}
              {tree.type === 'cherry' && '🌸'}
            </span>
          ))}
        </div>
        <p>点击树木查看详细信息</p>
        <p>（这里应该是Three.js渲染的3D场景）</p>
      </div>
    </div>
  );

  return (
    <div>
      <Card
        title="我的森林"
        extra={
          <Radio.Group 
            value={viewMode}
            onChange={e => setViewMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="3d"><EyeOutlined /> 3D视图</Radio.Button>
            <Radio.Button value="2d">简易视图</Radio.Button>
          </Radio.Group>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {viewMode === '3d' ? <ThreeDView /> : <SimplifiedView />}
            
            {selectedTree && (
              <Card 
                size="small" 
                title="树木详情" 
                style={{ marginTop: '20px' }}
              >
                <p><strong>类型:</strong> {
                  selectedTree.type === 'oak' ? '橡树' : 
                  selectedTree.type === 'pine' ? '松树' : 
                  selectedTree.type === 'cherry' ? '樱花树' : selectedTree.type
                }</p>
                <p><strong>生长阶段:</strong> {selectedTree.growthStage}/5</p>
                <p><strong>关联任务:</strong> {selectedTree.task.title}</p>
                <p><strong>位置坐标:</strong> X: {selectedTree.position.x}, Z: {selectedTree.position.z}</p>
              </Card>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Forest; 