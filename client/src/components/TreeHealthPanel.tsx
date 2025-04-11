/**
 * 树木健康状态显示面板组件
 */
import React, { useEffect, useState } from 'react';
import { Card, Progress, Tag, Tooltip, Statistic, Divider, Alert, Button, Typography, Slider, List, Empty, Spin, message } from 'antd';
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
  InfoCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { TreeHealthDetails, TaskTreeHealth, HealthTrend, HealthCategory } from '../services/treeHealthService';
import * as treeHealthService from '../services/treeHealthService';
import { getHealthColor, getHealthCategoryName } from '../utils/healthUtils';
import { TreeType } from '../types/Tree';
import { TaskType } from '../types/Task';

const { Title, Text } = Typography;

interface TreeHealthPanelProps {
  treeId?: string;
  taskId?: string;
  onProgressUpdate?: (taskId: string, progress: number) => void;
}

// 获取树木类型的颜色
const getTreeTypeColor = (treeType: TreeType): string => {
  const colorMap: Record<string, string> = {
    [TreeType.OAK]: 'green',
    [TreeType.PINE]: 'cyan',
    [TreeType.MAPLE]: 'orange',
    [TreeType.PALM]: 'lime',
    [TreeType.APPLE]: 'red',
    [TreeType.WILLOW]: 'blue'
  };
  
  return colorMap[treeType] || 'green';
};

// 获取树木类型的名称
const getTreeTypeName = (treeType: TreeType): string => {
  const nameMap: Record<string, string> = {
    [TreeType.OAK]: '橡树',
    [TreeType.PINE]: '松树',
    [TreeType.MAPLE]: '枫树',
    [TreeType.PALM]: '棕榈树',
    [TreeType.APPLE]: '苹果树',
    [TreeType.WILLOW]: '柳树'
  };
  
  return nameMap[treeType] || '未知树种';
};

// 获取任务类型的颜色
const getTaskTypeColor = (taskType: string): string => {
  const colorMap: Record<string, string> = {
    [TaskType.NORMAL]: 'blue',
    [TaskType.RECURRING]: 'green',
    [TaskType.PROJECT]: 'purple',
    [TaskType.LEARNING]: 'volcano',
    [TaskType.WORK]: 'red',
    [TaskType.LEISURE]: 'gold'
  };
  
  return colorMap[taskType] || 'default';
};

// 获取任务类型的名称
const getTaskTypeName = (taskType: string): string => {
  const nameMap: Record<string, string> = {
    [TaskType.NORMAL]: '普通日常任务',
    [TaskType.RECURRING]: '定期重复任务',
    [TaskType.PROJECT]: '长期项目任务',
    [TaskType.LEARNING]: '学习类任务',
    [TaskType.WORK]: '工作类任务',
    [TaskType.LEISURE]: '休闲类任务'
  };
  
  return nameMap[taskType] || taskType;
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
      if (!treeId && !taskId) {
        setError('未提供树木ID或任务ID，无法获取健康状态');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        if (treeId) {
          console.log('获取树木健康状态:', treeId); // 调试日志
          
          // 获取树木健康状态
          const healthData = await treeHealthService.getTreeHealth(treeId);
          console.log('获取到树木健康数据:', healthData); // 调试日志
          
          setTreeHealth(healthData);
          
          // 如果有关联任务，设置初始进度值
          if (healthData.task?.progress !== undefined) {
            setUpdateProgress(healthData.task.progress);
          }
        } else if (taskId) {
          console.log('获取任务关联的树木健康状态:', taskId); // 调试日志
          
          // 获取任务与树木健康关联
          const healthData = await treeHealthService.getTaskTreeHealth(taskId);
          console.log('获取到任务树木健康数据:', healthData); // 调试日志
          
          setTaskHealth(healthData);
          // 设置初始进度值为当前任务进度
          setUpdateProgress(healthData.progress);
        }
      } catch (error) {
        console.error('获取健康状态失败:', error);
        setError(`获取健康状态数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
        
        // 创建默认健康数据（用于演示）
        if (treeId) {
          setTreeHealth({
            treeId,
            healthState: 75,
            healthCategory: HealthCategory.HEALTHY,
            lastUpdated: new Date().toISOString(),
            task: {
              id: '1',
              title: '示例任务',
              progress: 80,
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          });
          setUpdateProgress(80);
        } else if (taskId) {
          setTaskHealth({
            taskId,
            taskTitle: '示例任务',
            progress: 60,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            tree: {
              id: '1',
              type: 'OAK',
              stage: 2,
              healthState: 65,
              healthCategory: HealthCategory.SLIGHTLY_WILTED,
              lastUpdated: new Date().toISOString()
            },
            healthPrediction: {
              currentTrend: HealthTrend.IMPROVING,
              estimatedHealthAt: [
                { date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), health: 80 },
                { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), health: 90 }
              ],
              recommendedProgress: 75
            }
          });
          setUpdateProgress(60);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTreeHealth();
  }, [treeId, taskId]);

  // 处理进度更新
  const handleProgressUpdate = async () => {
    if (!taskId || updateProgress === null) return;
    
    try {
      setLoading(true);
      
      console.log(`更新任务 ${taskId} 进度为 ${updateProgress}%`);
      
      // 更新任务进度
      await treeHealthService.updateTaskProgress(taskId, updateProgress);
      
      // 根据进度更新计算生长阶段
      let newGrowthStage = 0;
      if (updateProgress >= 100) {
        newGrowthStage = 3; // 完成 - 成熟阶段
      } else if (updateProgress >= 70) {
        newGrowthStage = 2; // 进度超过70% - 生长阶段
      } else if (updateProgress >= 30) {
        newGrowthStage = 1; // 进度超过30% - 幼苗阶段
      }
      
      // 通知父组件任务进度已更新
      if (onProgressUpdate) {
        onProgressUpdate(taskId, updateProgress);
      }
      
      // 重新获取健康状态数据
      if (treeId) {
        const healthData = await treeHealthService.getTreeHealth(treeId);
        setTreeHealth(healthData);
      } else if (taskId) {
        const healthData = await treeHealthService.getTaskTreeHealth(taskId);
        setTaskHealth(healthData);
      }
      
      // 显示成功消息
      message.success(
        `任务进度已更新为 ${updateProgress}%，树木进入${getGrowthStageName(newGrowthStage)}阶段`
      );
    } catch (error) {
      console.error('更新任务进度失败:', error);
      message.error('更新进度失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取生长阶段名称
  const getGrowthStageName = (stage: number): string => {
    const stageNames = [
      '种子',
      '幼苗',
      '成长',
      '成熟'
    ];
    
    return stageNames[stage] || '未知阶段';
  };
  
  // 渲染树木生长阶段信息
  const renderGrowthStageInfo = () => {
    // 计算生长阶段
    let growthStage = 0;
    let progress = 0;
    
    if (taskHealth) {
      progress = taskHealth.progress || 0;
    } else if (treeHealth && treeHealth.task) {
      progress = treeHealth.task.progress || 0;
    }
    
    // 根据进度确定生长阶段
    if (progress >= 100) {
      growthStage = 3; // 成熟
    } else if (progress >= 70) {
      growthStage = 2; // 生长
    } else if (progress >= 30) {
      growthStage = 1; // 幼苗
    } else {
      growthStage = 0; // 种子
    }
    
    // 计算到下一阶段的进度
    let nextStageThreshold = 100;
    let stageProgress = 0;
    
    if (growthStage === 0) {
      nextStageThreshold = 30;
      stageProgress = (progress / 30) * 100;
    } else if (growthStage === 1) {
      nextStageThreshold = 70;
      stageProgress = ((progress - 30) / 40) * 100;
    } else if (growthStage === 2) {
      nextStageThreshold = 100;
      stageProgress = ((progress - 70) / 30) * 100;
    } else {
      stageProgress = 100;
    }
    
    return (
      <div style={{ marginBottom: '16px' }}>
        <Divider orientation="left">生长阶段</Divider>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <Tag color={getGrowthStageColor(growthStage)}>{getGrowthStageName(growthStage)}</Tag>
            {growthStage < 3 && (
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                距离{getGrowthStageName(growthStage + 1)}阶段还需要{nextStageThreshold - progress}%进度
              </Text>
            )}
            {growthStage === 3 && (
              <Text type="success" style={{ marginLeft: '8px' }}>
                树木已经完全成熟！
              </Text>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <Progress 
              percent={stageProgress} 
              status={stageProgress === 100 ? 'success' : 'active'} 
              strokeColor={getGrowthStageColor(growthStage)}
              size="small"
            />
          </div>
        </div>
      </div>
    );
  };
  
  // 获取生长阶段颜色
  const getGrowthStageColor = (stage: number): string => {
    const stageColors = [
      '#8BC34A', // 种子 - 草绿色
      '#4CAF50', // 幼苗 - 绿色
      '#2E7D32', // 成长 - 深绿色
      '#1B5E20'  // 成熟 - 墨绿色
    ];
    
    return stageColors[stage] || stageColors[0];
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
        
        {/* 树木类型和任务类型关联 */}
        {taskHealth?.tree?.type && (
          <div style={{ marginTop: 16 }}>
            <Divider orientation="left">树木信息</Divider>
            <p>
              <strong>树木类型:</strong>{' '}
              <Tag color={getTreeTypeColor(taskHealth.tree.type as TreeType)}>
                {getTreeTypeName(taskHealth.tree.type as TreeType)}
              </Tag>
            </p>
            {taskHealth.taskType && (
              <p>
                <strong>任务类型:</strong>{' '}
                <Tag color={getTaskTypeColor(taskHealth.taskType)}>
                  {getTaskTypeName(taskHealth.taskType)}
                </Tag>
              </p>
            )}
            <Text type="secondary">不同任务类型对应不同的树木，完成任务将使树木完全生长</Text>
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

  // 如果没有treeId或taskId，显示错误提示
  if (!treeId && !taskId) {
    return (
      <Alert
        message="无法显示树木健康状态"
        description="未提供树木ID或任务ID，请确保正确关联了树木和任务"
        type="error"
        showIcon
      />
    );
  }

  // 如果加载中，显示加载状态
  if (loading && !treeHealth && !taskHealth) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0' }}>
        <Spin indicator={<SyncOutlined spin style={{ fontSize: 24 }} />} />
        <p style={{ marginTop: 16 }}>加载健康状态数据...</p>
      </div>
    );
  }

  // 如果有错误且没有数据，显示错误提示
  if (error && !treeHealth && !taskHealth) {
    return (
      <Alert
        message="获取健康状态失败"
        description={error}
        type="error"
        showIcon
        action={
          <Button type="primary" size="small" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        }
      />
    );
  }

  return (
    <Card loading={loading} bordered={false}>
      {error ? (
        <Alert message={error} type="error" />
      ) : (
        <>
          {renderTreeHealthInfo()}
          {renderGrowthStageInfo()}
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