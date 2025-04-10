import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, message, Tooltip, Drawer, Empty } from 'antd';
import { PlusOutlined, ZoomInOutlined, ZoomOutOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ForestScene, { TreeData } from '../three/ForestScene';
import TreeHealthPanel from '../components/TreeHealthPanel';
import { TreeType } from '../types/Tree';
import { modelLoader } from '../three/ModelLoader';
import * as taskService from '../services/taskService';
import * as treeHealthService from '../services/treeHealthService';

// 自定义事件名称定义
export const TASK_UPDATE_EVENT = 'taskforest_task_updated';

/**
 * 森林页面组件
 * 展示森林场景和交互控制
 */
const ForestPage: React.FC = () => {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<number | string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [healthPanelVisible, setHealthPanelVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('');
  
  // 加载树木数据函数 - 提取为独立函数以便复用
  const loadTrees = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      // 预加载模型
      await modelLoader.preloadCommonModels();
      
      // 直接获取树木数据
      const treeResponse = await fetch('http://localhost:9000/api/trees');
      const treeData = await treeResponse.json();
      
      console.log('森林页面: 树木响应:', treeData); // 调试日志
      
      if (treeData && treeData.data && treeData.data.trees && treeData.data.trees.length > 0) {
        // 获取所有任务以验证树木关联
        const taskResponse = await taskService.getTasks();
        const validTaskIds = taskResponse.data.data.tasks.map(task => task.id.toString());
        console.log('森林页面: 有效任务IDs:', validTaskIds);
        
        // 将API返回的树木数据转换为组件所需格式，过滤掉无效任务关联的树木
        const formattedTrees = treeData.data.trees
          .filter(tree => !tree.taskId || validTaskIds.includes(tree.taskId.toString()))
          .map(tree => {
            return {
              id: tree.id,
              type: tree.type,
              growthStage: tree.stage,
              position: [tree.position.x, tree.position.y, tree.position.z],
              rotation: [tree.rotation.x, tree.rotation.y, tree.rotation.z],
              healthState: tree.healthState,
              taskId: tree.taskId
            } as TreeData;
          });
        
        console.log('森林页面: 格式化后的树木数据:', formattedTrees); // 调试日志
        setTrees(formattedTrees);
      } else {
        console.log('森林页面: 没有找到树木数据');
        setTrees([]); // 设置空数组，确保页面显示无数据状态
      }
    } catch (error) {
      console.error('加载树木数据失败:', error);
      setLoadError('加载森林数据失败，服务器连接问题');
      
      // 创建默认树木（演示用）
      createDefaultTrees();
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载树木数据
  useEffect(() => {
    loadTrees();
    
    // 添加全局事件监听器，当任务变更时刷新森林
    const handleTaskUpdate = () => {
      console.log('监听到任务更新事件，刷新森林');
      loadTrees();
    };
    
    // 添加全局事件监听
    window.addEventListener(TASK_UPDATE_EVENT, handleTaskUpdate);
    
    // 清理事件监听
    return () => {
      window.removeEventListener(TASK_UPDATE_EVENT, handleTaskUpdate);
    };
  }, []);
  
  // 创建默认树木（当API加载失败时使用）
  const createDefaultTrees = () => {
    const defaultTrees: TreeData[] = [
      {
        id: 1,
        type: TreeType.OAK,
        growthStage: 4,
        position: [-5, 0, 0],
        rotation: [0, Math.random() * Math.PI, 0],
        healthState: 90,
        taskId: '1'
      },
      {
        id: 2,
        type: TreeType.PINE,
        growthStage: 3,
        position: [-3, 0, 3],
        rotation: [0, Math.random() * Math.PI, 0],
        healthState: 70,
        taskId: '2'
      },
      {
        id: 3,
        type: TreeType.MAPLE,
        growthStage: 2,
        position: [0, 0, -2],
        rotation: [0, Math.random() * Math.PI, 0],
        healthState: 50,
        taskId: '3'
      },
      {
        id: 4,
        type: TreeType.CHERRY,
        growthStage: 1,
        position: [4, 0, 1],
        rotation: [0, Math.random() * Math.PI, 0],
        healthState: 30,
        taskId: '4'
      }
    ];
    
    setTrees(defaultTrees);
    message.warning('使用演示数据显示森林（API加载失败）');
  };
  
  // 处理树木点击
  const handleTreeClick = async (treeId: number | string) => {
    setSelectedTreeId(treeId);
    
    const clickedTree = trees.find(t => t.id === treeId);
    if (clickedTree) {
      // 如果树木关联了任务，显示健康面板
      if (clickedTree.taskId) {
        try {
          // 获取任务详情
          const taskData = await taskService.getTask(clickedTree.taskId);
          const taskTitle = taskData?.data?.data?.title || '未知任务';
          
          setSelectedTaskId(clickedTree.taskId);
          setSelectedTaskTitle(taskTitle);
          setHealthPanelVisible(true);
          
          message.info(`选中了${clickedTree.type}树，关联任务: ${taskTitle}`);
        } catch (error) {
          console.error('获取任务信息失败:', error);
          message.warning(`选中了${clickedTree.type}树，但无法获取关联任务信息`);
          
          setSelectedTaskId(clickedTree.taskId);
          setHealthPanelVisible(true);
        }
      } else {
        message.info(`选中了${clickedTree.type}树，生长阶段: ${clickedTree.growthStage}，未关联任务`);
      }
    }
  };
  
  // 关闭健康面板
  const closeHealthPanel = () => {
    setHealthPanelVisible(false);
  };
  
  // 处理任务进度更新
  const handleProgressUpdate = (taskId: string, progress: number) => {
    console.log(`任务${taskId}进度更新为${progress}%`);
    // 刷新森林
    handleRefresh();
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
    const randomGrowth = Math.floor(Math.random() * 4) + 1;
    
    // 创建新树
    const newTree: TreeData = {
      id: Date.now(),
      type: randomType,
      growthStage: randomGrowth,
      position: randomPosition(),
      rotation: [0, Math.random() * Math.PI * 2, 0],
      healthState: 100 // 新树默认健康
    };
    
    // 添加到树木集合中
    setTrees([...trees, newTree]);
    message.success('新的树苗已种植！');
  };
  
  // 刷新森林
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrees(); // 使用提取的loadTrees函数
    setRefreshing(false);
    message.success('森林已刷新');
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
                loading={refreshing}
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
        ) : loadError && trees.length === 0 ? (
          <div style={{ height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Empty 
              description={
                <span>
                  <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  {loadError}
                </span>
              }
            />
            <Button 
              type="primary" 
              onClick={() => window.location.reload()} 
              style={{ marginTop: 16 }}
            >
              重新加载
            </Button>
          </div>
        ) : trees.length === 0 ? (
          <div style={{ height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Empty description="暂无树木，请先创建任务并选择树木类型" />
            <Button 
              type="primary" 
              onClick={handleAddTree} 
              style={{ marginTop: 16 }}
            >
              添加示例树木
            </Button>
          </div>
        ) : (
          <ForestScene
            trees={trees}
            onTreeClick={handleTreeClick}
            height="600px"
            selectedTreeId={selectedTreeId || undefined}
            showHealthIndicators={true}
          />
        )}
      </Card>
      
      <Card title="场景控制" size="small">
        <p>点击森林中的树木可以查看详情。当前选中: {selectedTreeId ? `树木 #${selectedTreeId}` : '无'}</p>
        {selectedTaskId && selectedTaskTitle && (
          <p><strong>关联任务:</strong> {selectedTaskTitle}</p>
        )}
        <p>这个森林展示了任务的完成情况，每棵树代表一个任务，树的生长阶段代表任务的完成度，颜色代表健康状态。</p>
      </Card>
      
      {/* 健康状态面板抽屉 */}
      <Drawer
        title={selectedTaskTitle ? `树木健康状态 - ${selectedTaskTitle}` : "树木健康状态详情"}
        placement="right"
        onClose={closeHealthPanel}
        visible={healthPanelVisible}
        width={350}
      >
        {selectedTaskId && (
          <TreeHealthPanel
            taskId={selectedTaskId}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </Drawer>
    </div>
  );
};

export default ForestPage; 