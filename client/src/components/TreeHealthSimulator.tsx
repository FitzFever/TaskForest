import React, { useState, useEffect } from 'react';
import { Card, Button, Slider, Row, Col, Typography, Radio, Space, Divider, Tag, Tooltip } from 'antd';
import ForestScene, { TreeData } from '../three/ForestScene';
import { TreeType } from '../types/Tree';
import { HealthCategory } from '../services/treeHealthService';
import { 
  HeartOutlined, 
  HeartTwoTone, 
  HeartFilled, 
  WarningOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Group: RadioGroup, Button: RadioButton } = Radio;

/**
 * 树木健康状态模拟器组件
 * 用于展示树木健康状态变化的效果
 */
const TreeHealthSimulator: React.FC = () => {
  // 基础状态
  const [selectedTree, setSelectedTree] = useState<number | string | null>(null);
  const [healthValue, setHealthValue] = useState<number>(100);
  const [growthStage, setGrowthStage] = useState<number>(3);
  const [treeType, setTreeType] = useState<TreeType>(TreeType.OAK);
  
  // 创建示例树木数据
  const [trees, setTrees] = useState<TreeData[]>([
    {
      id: 1,
      type: TreeType.OAK,
      growthStage: 3,
      position: [0, 0, 0],
      healthState: 100
    },
    {
      id: 2,
      type: TreeType.PINE,
      growthStage: 3,
      position: [-4, 0, -2],
      healthState: 85
    },
    {
      id: 3,
      type: TreeType.CHERRY,
      growthStage: 3,
      position: [4, 0, -3],
      healthState: 55
    },
    {
      id: 4,
      type: TreeType.MAPLE,
      growthStage: 3,
      position: [-3, 0, 3],
      healthState: 30
    }
  ]);
  
  // 获取健康状态分类
  const getHealthCategory = (health: number): HealthCategory => {
    if (health >= 75) return HealthCategory.HEALTHY;
    if (health >= 50) return HealthCategory.SLIGHTLY_WILTED;
    if (health >= 25) return HealthCategory.MODERATELY_WILTED;
    return HealthCategory.SEVERELY_WILTED;
  };
  
  // 获取健康状态名称
  const getHealthCategoryName = (category: HealthCategory): string => {
    switch (category) {
      case HealthCategory.HEALTHY:
        return '健康';
      case HealthCategory.SLIGHTLY_WILTED:
        return '轻微枯萎';
      case HealthCategory.MODERATELY_WILTED:
        return '中度枯萎';
      case HealthCategory.SEVERELY_WILTED:
        return '严重枯萎';
      default:
        return '未知状态';
    }
  };
  
  // 获取健康状态颜色
  const getHealthColor = (health: number): string => {
    if (health >= 75) return '#4CAF50';
    if (health >= 50) return '#CDDC39';
    if (health >= 25) return '#FFC107';
    return '#FF5722';
  };
  
  // 处理树木点击
  const handleTreeClick = (treeId: number | string) => {
    setSelectedTree(treeId);
    
    // 找到点击的树木
    const clickedTree = trees.find(tree => tree.id === treeId);
    if (clickedTree) {
      setHealthValue(clickedTree.healthState || 100);
      setGrowthStage(clickedTree.growthStage);
      setTreeType(clickedTree.type);
    }
  };
  
  // 更新选中树木的健康状态
  const updateSelectedTreeHealth = (newHealthValue: number) => {
    if (selectedTree === null) return;
    
    setTrees(prevTrees => 
      prevTrees.map(tree => 
        tree.id === selectedTree 
          ? { ...tree, healthState: newHealthValue } 
          : tree
      )
    );
  };
  
  // 更新选中树木的生长阶段
  const updateSelectedTreeGrowth = (newStage: number) => {
    if (selectedTree === null) return;
    
    setTrees(prevTrees => 
      prevTrees.map(tree => 
        tree.id === selectedTree 
          ? { ...tree, growthStage: newStage } 
          : tree
      )
    );
  };
  
  // 更新选中树木的类型
  const updateSelectedTreeType = (newType: TreeType) => {
    if (selectedTree === null) return;
    
    setTrees(prevTrees => 
      prevTrees.map(tree => 
        tree.id === selectedTree 
          ? { ...tree, type: newType } 
          : tree
      )
    );
  };
  
  // 添加新树木
  const addNewTree = () => {
    // 生成随机位置
    const angle = Math.random() * Math.PI * 2;
    const distance = 3 + Math.random() * 4;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // 创建新树木
    const newTree: TreeData = {
      id: Date.now(),
      type: treeType,
      growthStage: growthStage,
      position: [x, 0, z],
      rotation: [0, Math.random() * Math.PI * 2, 0],
      healthState: healthValue
    };
    
    setTrees(prevTrees => [...prevTrees, newTree]);
    setSelectedTree(newTree.id);
  };
  
  // 在健康值变化时更新选中树木
  useEffect(() => {
    if (selectedTree !== null) {
      updateSelectedTreeHealth(healthValue);
    }
  }, [healthValue]);
  
  // 在生长阶段变化时更新选中树木
  useEffect(() => {
    if (selectedTree !== null) {
      updateSelectedTreeGrowth(growthStage);
    }
  }, [growthStage]);
  
  // 在树木类型变化时更新选中树木
  useEffect(() => {
    if (selectedTree !== null) {
      updateSelectedTreeType(treeType);
    }
  }, [treeType]);
  
  // 找到当前选中的树木
  const selectedTreeData = trees.find(tree => tree.id === selectedTree);
  const currentHealthCategory = selectedTreeData 
    ? getHealthCategory(selectedTreeData.healthState || 100) 
    : HealthCategory.HEALTHY;
  
  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>树木健康状态模拟器</Title>
      <Text>该工具可用于模拟和测试树木在不同健康状态下的视觉效果和动画效果。点击树木可以选择并调整参数。</Text>
      
      <Row gutter={24} style={{ marginTop: 20 }}>
        <Col span={16}>
          <Card title="森林场景" bordered={false}>
            <div style={{ height: 500 }}>
              <ForestScene
                trees={trees}
                onTreeClick={handleTreeClick}
                selectedTreeId={selectedTree || undefined}
                showHealthIndicators={true}
              />
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="健康状态控制" bordered={false} style={{ marginBottom: 16 }}>
            {selectedTree !== null ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>当前选中：</Text>
                  <Tag color="blue">树木 #{selectedTree}</Tag>
                  <Tag color="green">{TreeType[treeType]}</Tag>
                  <Tag color={getHealthColor(healthValue)}>
                    <HeartOutlined /> {getHealthCategoryName(currentHealthCategory)}
                  </Tag>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <Text>健康状态：</Text>
                  <Slider
                    min={0}
                    max={100}
                    value={healthValue}
                    onChange={setHealthValue}
                    marks={{
                      0: '0%',
                      25: '25%',
                      50: '50%',
                      75: '75%',
                      100: '100%'
                    }}
                    tooltip={{ formatter: (value) => `${value}%` }}
                    style={{ marginTop: 8 }}
                  />
                </div>
                
                <Space style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    danger 
                    onClick={() => setHealthValue(Math.max(0, healthValue - 25))}
                  >
                    <ArrowDownOutlined /> 健康下降
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setHealthValue(Math.min(100, healthValue + 25))}
                  >
                    <ArrowUpOutlined /> 健康恢复
                  </Button>
                </Space>
                
                <Divider />
                
                <div style={{ marginBottom: 16 }}>
                  <Text>生长阶段：</Text>
                  <Slider
                    min={0}
                    max={4}
                    value={growthStage}
                    onChange={setGrowthStage}
                    marks={{
                      0: '种子',
                      1: '幼苗',
                      2: '成长',
                      3: '成熟',
                      4: '茂盛'
                    }}
                    included={true}
                  />
                </div>
                
                <Divider />
                
                <div>
                  <Text>树木类型：</Text>
                  <div style={{ marginTop: 8 }}>
                    <RadioGroup 
                      value={treeType} 
                      onChange={e => setTreeType(e.target.value)}
                      buttonStyle="solid"
                    >
                      <RadioButton value={TreeType.OAK}>橡树</RadioButton>
                      <RadioButton value={TreeType.PINE}>松树</RadioButton>
                      <RadioButton value={TreeType.CHERRY}>樱花树</RadioButton>
                      <RadioButton value={TreeType.MAPLE}>枫树</RadioButton>
                    </RadioGroup>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">请点击森林中的树木以选择并调整其参数</Text>
              </div>
            )}
          </Card>
          
          <Card title="操作" bordered={false}>
            <Space>
              <Button type="primary" onClick={addNewTree}>添加新树木</Button>
              <Tooltip title="清除所有现有树木，重新开始">
                <Button 
                  danger 
                  onClick={() => {
                    setTrees([]);
                    setSelectedTree(null);
                  }}
                >
                  清空森林
                </Button>
              </Tooltip>
            </Space>
          </Card>
          
          <Card 
            title="健康状态图例" 
            bordered={false} 
            style={{ marginTop: 16 }} 
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HeartFilled style={{ color: '#4CAF50', marginRight: 8 }} />
                <span>健康 (75-100%): 树木生长良好，叶色翠绿</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HeartFilled style={{ color: '#CDDC39', marginRight: 8 }} />
                <span>轻微枯萎 (50-75%): 部分叶片发黄</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HeartFilled style={{ color: '#FFC107', marginRight: 8 }} />
                <span>中度枯萎 (25-50%): 大量叶片发黄</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HeartFilled style={{ color: '#FF5722', marginRight: 8 }} />
                <span>严重枯萎 (0-25%): 叶片脱落，急需救治</span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TreeHealthSimulator; 