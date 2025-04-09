/**
 * 树木健康状态显示面板组件
 */
import React, { useEffect, useState } from 'react';
import { Card, Progress, Tag, Tooltip, Statistic, Divider, Alert, Button, Typography, Slider, List } from 'antd';
import { 
  HeartOutlined, 
  ClockCircleOutlined, 
  ThunderboltOutlined, 
  UpCircleOutlined, 
  DownCircleOutlined, 
  MinusCircleOutlined, 
  AlertOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { TreeHealthDetails, TaskTreeHealth, HealthTrend, HealthCategory } from '../services/treeHealthService';
import * as treeHealthService from '../services/treeHealthService';

const { Title, Text } = Typography;

interface TreeHealthPanelProps {
  treeId?: string;
  taskId?: string;
  onProgressUpdate?: (taskId: string, progress: number) => void;
}

/**
 * 获取健康状态标签颜色
 */
const getHealthColor = (healthState: number): string => {
  if (healthState >= 75) return '#52c41a'; // 健康-绿色
  if (healthState >= 50) return '#faad14'; // 轻微枯萎-黄色
  if (healthState >= 25) return '#fa8c16'; // 中度枯萎-橙色
  return '#f5222d'; // 严重枯萎-红色
};

/**
 * 获取健康状态分类名称
 */
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

/**
 * 获取健康趋势名称和图标
 */
const getTrendInfo = (trend: HealthTrend): { name: string; icon: React.ReactNode; color: string } => {
  switch (trend) {
    case HealthTrend.IMPROVING:
      return { 
        name: '改善中', 
        icon: <UpCircleOutlined />, 
        color: '#52c41a' 
      };
    case HealthTrend.STABLE:
      return { 
        name: '稳定', 
        icon: <MinusCircleOutlined />, 
        color: '#1890ff' 
      };
    case HealthTrend.DECLINING:
      return { 
        name: '恶化中', 
        icon: <DownCircleOutlined />, 
        color: '#faad14' 
      };
    case HealthTrend.CRITICAL:
      return { 
        name: '严重恶化', 
        icon: <AlertOutlined />, 
        color: '#f5222d' 
      };
    default:
      return { 
        name: '未知趋势', 
        icon: <MinusCircleOutlined />, 
        color: '#d9d9d9' 
      };
  }
};

const TreeHealthPanel: React.FC<TreeHealthPanelProps> = ({ treeId, taskId, onProgressUpdate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [treeHealth, setTreeHealth] = useState<TreeHealthDetails | null>(null);
  const [taskHealth, setTaskHealth] = useState<TaskTreeHealth | null>(null);
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);

  // 加载树木健康状态
  useEffect(() => {
    const fetchTreeHealth = async () => {
      if (!treeId && !taskId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (treeId) {
          // 获取树木健康状态
          const healthData = await treeHealthService.getTreeHealth(treeId);
          setTreeHealth(healthData);
          
          // 如果有关联任务，设置初始进度值
          if (healthData.task?.progress !== undefined) {
            setUpdateProgress(healthData.task.progress);
          }
        } else if (taskId) {
          // 获取任务与树木健康关联
          const healthData = await treeHealthService.getTaskTreeHealth(taskId);
          setTaskHealth(healthData);
          // 设置初始进度值为当前任务进度
          setUpdateProgress(healthData.progress);
        }
      } catch (error) {
        console.error('获取健康状态失败:', error);
        setError('获取健康状态数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTreeHealth();
  }, [treeId, taskId]);

  // 处理进度更新
  const handleProgressUpdate = async () => {
    if (!updateProgress) return;
    
    // 确定任务ID：如果直接有taskId就用，没有就从treeHealth中获取
    const currentTaskId = taskId || treeHealth?.task?.id;
    
    if (!currentTaskId) {
      setError('无法更新进度：未找到关联任务');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 更新任务进度
      const result = await treeHealthService.updateTaskProgress(currentTaskId, updateProgress);
      
      // 更新本地数据
      if (taskHealth) {
        setTaskHealth({
          ...taskHealth,
          progress: result.progress,
          tree: {
            ...taskHealth.tree,
            healthState: result.tree?.healthStateAfter || taskHealth.tree.healthState
          }
        });
      } else if (treeHealth && treeHealth.task) {
        // 更新treeHealth中的任务进度
        setTreeHealth({
          ...treeHealth,
          healthState: result.tree?.healthStateAfter || treeHealth.healthState,
          task: {
            ...treeHealth.task,
            progress: updateProgress
          }
        });
      }
      
      // 调用父组件回调
      if (onProgressUpdate) {
        onProgressUpdate(currentTaskId, updateProgress);
      }
    } catch (error) {
      console.error('更新任务进度失败:', error);
      setError('更新任务进度失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染树木健康状态信息
  const renderTreeHealthInfo = () => {
    if (!treeHealth && !taskHealth) return null;
    
    // 确定显示的健康状态数据
    const healthState = treeHealth?.healthState || (taskHealth?.tree.healthState || 0);
    const healthCategory = treeHealth?.healthCategory || (taskHealth?.tree.healthCategory || HealthCategory.HEALTHY);
    const healthColor = getHealthColor(healthState);
    
    return (
      <div>
        <Title level={4}>树木健康状态</Title>
        
        {/* 健康状态进度条 */}
        <Tooltip title={`健康值: ${healthState}/100`}>
          <Progress 
            percent={healthState} 
            strokeColor={healthColor}
            status={healthState < 25 ? 'exception' : 'normal'}
            format={percent => (
              <span style={{ color: healthColor, fontWeight: 'bold' }}>{percent}</span>
            )}
          />
        </Tooltip>
        
        {/* 健康状态分类标签 */}
        <Tag color={healthColor} icon={<HeartOutlined />} style={{ marginTop: 8 }}>
          {getHealthCategoryName(healthCategory)}
        </Tag>
        
        {/* 任务相关信息 */}
        {(treeHealth?.task || taskHealth) && (
          <div style={{ marginTop: 16 }}>
            <Divider orientation="left">任务信息</Divider>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Statistic 
                title="当前进度" 
                value={treeHealth?.task?.progress || taskHealth?.progress || 0} 
                suffix="%" 
                valueStyle={{ color: '#1890ff' }}
                prefix={<ThunderboltOutlined />}
              />
              {(treeHealth?.details?.expectedProgress !== undefined || taskHealth?.healthPrediction?.recommendedProgress !== undefined) && (
                <Statistic 
                  title="推荐进度" 
                  value={treeHealth?.details?.expectedProgress || taskHealth?.healthPrediction?.recommendedProgress || 0} 
                  suffix="%" 
                  valueStyle={{ color: '#52c41a' }}
                />
              )}
            </div>
            
            {/* 任务截止日期 */}
            {(treeHealth?.task?.deadline || taskHealth?.deadline) && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                <ClockCircleOutlined /> 截止日期: {new Date(treeHealth?.task?.deadline || taskHealth?.deadline || '').toLocaleDateString()}
              </Text>
            )}
          </div>
        )}
        
        {/* 任务健康预测 */}
        {taskHealth?.healthPrediction && (
          <div style={{ marginTop: 16 }}>
            <Divider orientation="left">健康预测</Divider>
            
            {/* 健康趋势 */}
            <div style={{ marginBottom: 16 }}>
              <Text>当前趋势: </Text>
              {(() => {
                const { name, icon, color } = getTrendInfo(taskHealth.healthPrediction.currentTrend);
                return (
                  <Tag color={color} icon={icon}>
                    {name}
                  </Tag>
                );
              })()}
            </div>
            
            {/* 未来健康值预测 */}
            {taskHealth.healthPrediction.estimatedHealthAt.length > 0 && (
              <div>
                <Text>未来健康值预测:</Text>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  {taskHealth.healthPrediction.estimatedHealthAt.map((prediction, index) => (
                    <li key={index}>
                      <Text>
                        {new Date(prediction.date).toLocaleDateString()}: 
                        <Text style={{ color: getHealthColor(prediction.health), marginLeft: 8 }}>
                          {prediction.health}%
                        </Text>
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 显示推荐信息 */}
            {taskHealth.healthPrediction.recommendedProgress > taskHealth.progress && (
              <Alert
                message="健康提示"
                description={`为保持树木健康状态，建议将任务进度提升至少 ${taskHealth.healthPrediction.recommendedProgress}%`}
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // 渲染不同健康状态的具体效果
  const renderHealthEffects = () => {
    if (!treeHealth && !taskHealth) return null;
    
    // 确定显示的健康状态数据
    const healthCategory = treeHealth?.healthCategory || (taskHealth?.tree.healthCategory || HealthCategory.HEALTHY);
    
    const effectsList = {
      [HealthCategory.HEALTHY]: [
        { icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, effect: '枝繁叶茂，生机勃勃' },
        { icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, effect: '树木生长旺盛，叶片翠绿' },
        { icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />, effect: '任务进度正常，距离截止日期充足' }
      ],
      [HealthCategory.SLIGHTLY_WILTED]: [
        { icon: <InfoCircleOutlined style={{ color: '#faad14' }} />, effect: '部分叶片发黄，生长减缓' },
        { icon: <WarningOutlined style={{ color: '#faad14' }} />, effect: '树木活力下降，但仍有生机' },
        { icon: <WarningOutlined style={{ color: '#faad14' }} />, effect: '任务进度落后，需要关注' }
      ],
      [HealthCategory.MODERATELY_WILTED]: [
        { icon: <WarningOutlined style={{ color: '#fa8c16' }} />, effect: '大量叶片发黄，枝干干枯' },
        { icon: <WarningOutlined style={{ color: '#fa8c16' }} />, effect: '树木明显缺乏活力，生长停滞' },
        { icon: <AlertOutlined style={{ color: '#fa8c16' }} />, effect: '任务严重延期，接近截止日期' }
      ],
      [HealthCategory.SEVERELY_WILTED]: [
        { icon: <AlertOutlined style={{ color: '#f5222d' }} />, effect: '叶片脱落，枝干干裂' },
        { icon: <AlertOutlined style={{ color: '#f5222d' }} />, effect: '树木濒临死亡，急需抢救' },
        { icon: <AlertOutlined style={{ color: '#f5222d' }} />, effect: '任务严重超期，需要立即处理' }
      ]
    };
    
    return (
      <div style={{ marginTop: 16 }}>
        <Divider orientation="left">健康状态效果</Divider>
        <List
          size="small"
          dataSource={effectsList[healthCategory] || []}
          renderItem={item => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
                <span style={{ marginLeft: 8 }}>{item.effect}</span>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <Card loading={loading} bordered={false}>
      {error ? (
        <Alert message={error} type="error" />
      ) : (
        <>
          {renderTreeHealthInfo()}
          {renderHealthEffects()}
          {(taskId || (treeHealth?.task?.id && onProgressUpdate)) && (
            <div style={{ marginTop: 24 }}>
              <Divider orientation="left">更新进度</Divider>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress
                  type="circle"
                  percent={updateProgress || 0}
                  size={80}
                  style={{ marginRight: 16 }}
                />
                <div style={{ flex: 1 }}>
                  <Slider
                    value={updateProgress || 0}
                    onChange={(value) => setUpdateProgress(value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <Button 
                    type="primary" 
                    onClick={handleProgressUpdate} 
                    loading={loading}
                    disabled={updateProgress === null || 
                      (taskHealth && updateProgress === taskHealth.progress) ||
                      (treeHealth?.task && updateProgress === treeHealth.task.progress)}
                    style={{ marginTop: 8 }}
                  >
                    更新进度
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default TreeHealthPanel; 