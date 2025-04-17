import React from 'react';
import { Tree } from '../types/Tree';
import { Space, Card, Tag, Typography, Progress } from 'antd';
import { GithubOutlined, AimOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';

const { Text, Title } = Typography;

// 扩展Tree类型以包含任务进度属性
interface ExtendedTree extends Tree {
  taskProgress?: number;
}

interface SimpleForestViewProps {
  trees: ExtendedTree[];
  onTreeClick?: (tree: ExtendedTree) => void;
}

// 辅助函数：根据健康状态获取颜色
const getTreeHealthColor = (healthState?: number) => {
  if (!healthState || healthState === undefined) return '#ccc';
  if (healthState >= 75) return '#52c41a'; // 健康 - 绿色
  if (healthState >= 50) return '#faad14'; // 一般 - 黄色
  if (healthState >= 25) return '#fa8c16'; // 较差 - 橙色
  return '#f5222d'; // 极差 - 红色
};

const SimpleForestView: React.FC<SimpleForestViewProps> = ({ trees, onTreeClick }) => {
  if (!trees || trees.length === 0) {
    return <div className="simple-forest-empty">无树木数据</div>;
  }

  return (
    <div className="simple-forest-view">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {trees.map((tree) => {
          // 获取树的健康状态颜色
          const healthColor = getTreeHealthColor(tree.healthState);
          
          return (
            <Card 
              key={tree.id} 
              hoverable 
              onClick={() => onTreeClick?.(tree)}
              style={{ borderLeft: `4px solid ${healthColor}` }}
            >
              <div className="tree-item-content">
                <div className="tree-info">
                  <Title level={5}>
                    <GithubOutlined style={{ marginRight: 8 }} />
                    {tree.type} 树
                  </Title>
                  <div className="tree-details">
                    <div className="tree-detail-item">
                      <Text type="secondary">ID:</Text> {tree.id}
                    </div>
                    <div className="tree-detail-item">
                      <Text type="secondary">生长阶段:</Text>
                      <Tag color={
                        tree.growthStage === 0 ? 'default' :
                        tree.growthStage === 1 ? 'lime' :
                        tree.growthStage === 2 ? 'green' :
                        'cyan'
                      }>
                        {tree.growthStage === 0 && '种子'}
                        {tree.growthStage === 1 && '幼苗'}
                        {tree.growthStage === 2 && '生长中'}
                        {tree.growthStage === 3 && '成熟'}
                      </Tag>
                    </div>
                    {tree.healthState !== undefined && (
                      <div className="tree-detail-item">
                        <Text type="secondary">健康状态:</Text>
                        <Tag color={
                          tree.healthState >= 75 ? 'success' :
                          tree.healthState >= 50 ? 'warning' :
                          tree.healthState >= 25 ? 'orange' : 'error'
                        }>
                          {tree.healthState}% {
                            tree.healthState >= 75 ? '健康' :
                            tree.healthState >= 50 ? '一般' :
                            tree.healthState >= 25 ? '较差' : '极差'
                          }
                        </Tag>
                      </div>
                    )}
                    {tree.taskProgress !== undefined && (
                      <div className="tree-detail-item task-progress">
                        <Text type="secondary">任务进度:</Text>
                        <Progress 
                          percent={tree.taskProgress} 
                          size="small"
                          status={
                            tree.taskProgress >= 100 ? 'success' :
                            tree.healthState && tree.healthState < 50 ? 'exception' : 'active'
                          }
                          style={{ width: 120 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="tree-health-indicator">
                  <div 
                    className="health-circle" 
                    style={{ backgroundColor: healthColor }}
                  >
                    {tree.healthState && tree.healthState >= 75 ? (
                      <HeartFilled style={{ color: 'white' }} />
                    ) : (
                      <HeartOutlined style={{ color: 'white' }} />
                    )}
                  </div>
                  <div className="growth-bar-container">
                    <div 
                      className="growth-bar" 
                      style={{ 
                        height: `${(tree.growthStage / 3) * 100}%`,
                        backgroundColor: tree.healthState && tree.healthState < 50 
                          ? '#faad14' 
                          : '#52c41a'
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </Space>
      
      <style>
        {`
          .simple-forest-view {
            padding: 16px;
            max-height: 80vh;
            overflow-y: auto;
          }
          .simple-forest-empty {
            padding: 40px;
            text-align: center;
            color: #999;
          }
          .tree-item-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .tree-info {
            flex: 1;
          }
          .tree-details {
            margin-top: 8px;
          }
          .tree-detail-item {
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .task-progress {
            margin-top: 8px;
          }
          .tree-health-indicator {
            display: flex;
            align-items: center;
            margin-left: 16px;
          }
          .health-circle {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
          }
          .growth-bar-container {
            width: 8px;
            height: 60px;
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          .growth-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            transition: height 0.3s;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

export default SimpleForestView; 