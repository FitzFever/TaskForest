import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, message, Tooltip } from 'antd';
import { PlusOutlined, ZoomInOutlined, ZoomOutOutlined, SyncOutlined } from '@ant-design/icons';
import ForestScene, { TreeData } from '../three/ForestScene';
import { TreeType } from '../types/Tree';
import { modelLoader } from '../three/ModelLoader';

/**
 * 森林页面组件
 * 展示森林场景和交互控制
 */
const ForestPage: React.FC = () => {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreeId, setSelectedTreeId] = useState<number | string | null>(null);
  
  // 加载树木数据
  useEffect(() => {
    // 模拟从API加载树木数据
    const loadTrees = async () => {
      try {
        setLoading(true);
        
        // 预加载模型
        await modelLoader.preloadCommonModels();
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 生成测试数据
        const mockTrees: TreeData[] = [
          {
            id: 1,
            type: TreeType.OAK,
            growthStage: 4,
            position: [-5, 0, 0],
            rotation: [0, Math.random() * Math.PI, 0],
          },
          {
            id: 2,
            type: TreeType.PINE,
            growthStage: 3,
            position: [-3, 0, 3],
            rotation: [0, Math.random() * Math.PI, 0],
          },
          {
            id: 3,
            type: TreeType.MAPLE,
            growthStage: 2,
            position: [0, 0, -2],
            rotation: [0, Math.random() * Math.PI, 0],
          },
          {
            id: 4,
            type: TreeType.CHERRY,
            growthStage: 4,
            position: [4, 0, 1],
            rotation: [0, Math.random() * Math.PI, 0],
          },
          {
            id: 5,
            type: TreeType.OAK,
            growthStage: 1,
            position: [2, 0, -4],
            rotation: [0, Math.random() * Math.PI, 0],
          },
        ];
        
        setTrees(mockTrees);
      } catch (error) {
        console.error('加载树木数据失败:', error);
        message.error('加载森林数据失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };
    
    loadTrees();
  }, []);
  
  // 处理树木点击
  const handleTreeClick = (treeId: number | string) => {
    setSelectedTreeId(treeId);
    
    const clickedTree = trees.find(t => t.id === treeId);
    if (clickedTree) {
      message.info(`选中了${clickedTree.type}树，生长阶段: ${clickedTree.growthStage}`);
    }
  };
  
  // 添加新树木
  const handleAddTree = () => {
    // 生成随机位置
    const randomPosition = (): [number, number, number] => {
      const radius = 5 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return [x, 0, z];
    };
    
    // 随机选择树木类型
    const treeTypes = Object.values(TreeType);
    const randomType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
    
    // 随机生长阶段
    const randomGrowth = Math.floor(Math.random() * 5);
    
    // 创建新树
    const newTree: TreeData = {
      id: Date.now(),
      type: randomType,
      growthStage: randomGrowth,
      position: randomPosition(),
      rotation: [0, Math.random() * Math.PI * 2, 0],
    };
    
    // 添加到树木集合中
    setTrees([...trees, newTree]);
    message.success('新的树苗已种植！');
  };
  
  // 刷新森林
  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 更新树木生长状态
    const updatedTrees = trees.map(tree => ({
      ...tree,
      growthStage: Math.min(4, tree.growthStage + (Math.random() > 0.7 ? 1 : 0)),
    }));
    
    setTrees(updatedTrees);
    setLoading(false);
    message.success('森林已刷新，树木生长中...');
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <Card
        title="任务森林"
        extra={
          <div>
            <Tooltip title="添加新树木">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddTree} 
                style={{ marginRight: '8px' }}
              />
            </Tooltip>
            <Tooltip title="刷新森林">
              <Button 
                icon={<SyncOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              />
            </Tooltip>
          </div>
        }
        style={{ marginBottom: '20px' }}
      >
        {loading ? (
          <div style={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin tip="加载森林中..." size="large" />
          </div>
        ) : (
          <ForestScene
            trees={trees}
            onTreeClick={handleTreeClick}
            height="600px"
            selectedTreeId={selectedTreeId || undefined}
          />
        )}
      </Card>
      
      <Card title="场景控制" size="small">
        <p>点击森林中的树木可以查看详情。当前选中: {selectedTreeId ? `树木 #${selectedTreeId}` : '无'}</p>
        <p>这个森林展示了任务的完成情况，每棵树代表一个任务，树的生长阶段代表任务的完成度。</p>
      </Card>
    </div>
  );
};

export default ForestPage; 