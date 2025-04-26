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
  onGrowthStageChange?: (stage: number) => void;
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

const TreeHealthPanel: React.FC<TreeHealthPanelProps> = ({ treeId, taskId, onProgressUpdate, onGrowthStageChange }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [treeHealth, setTreeHealth] = useState<TreeHealthDetails | null>(null);
  const [taskHealth, setTaskHealth] = useState<TaskTreeHealth | null>(null);
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [growthStage, setGrowthStage] = useState<number>(0);

  // 加载树木健康状态
  useEffect(() => {
    fetchTreeHealth();
  }, [treeId, taskId]);

  // 提取健康状态获取函数，便于刷新调用
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
      // 由于treeHealthService已经增加了错误处理并返回模拟数据，
      // 这里理论上不应该再进入到catch块，但为了健壮性继续保留错误处理
      console.error('获取健康状态失败:', error);
      // 不直接设置错误状态，因为服务已经返回了备用数据
      // setError(`获取健康状态数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
      message.warning('使用备用数据显示树木健康状态');
    } finally {
      setLoading(false);
    }
  };

  // 处理进度更新
  const handleProgressUpdate = async () => {
    if (!taskId || updateProgress === null) return;
    
    try {
      setLoading(true);
      
      console.log(`更新任务 ${taskId} 进度为 ${updateProgress}%`);
      
      // 更新任务进度
      const progressResult = await treeHealthService.updateTaskProgress(taskId, updateProgress);
      
      // 根据进度值计算生长阶段（0-3）- 与ForestScene组件保持一致
      const newGrowthStage = calculateGrowthStage(updateProgress);
      
      console.log(`任务${taskId}的生长阶段已更新为: ${newGrowthStage} (${getGrowthStageName(newGrowthStage)})`);
      setGrowthStage(newGrowthStage);
      
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
      
      // 显示变化信息
      let healthChangeMessage = '';
      if (progressResult.tree) {
        const healthBefore = progressResult.tree.healthStateBefore;
        const healthAfter = progressResult.tree.healthStateAfter;
        const healthDiff = healthAfter - healthBefore;
        
        if (healthBefore !== healthAfter) {
          const changeSymbol = healthDiff > 0 ? '↑' : '↓';
          const changeColor = healthDiff > 0 ? '#52c41a' : '#f5222d';
          
          healthChangeMessage = `，健康状态从 ${healthBefore}% 变为 ${healthAfter}% (${changeSymbol}${Math.abs(healthDiff)}%)`;
          
          // 根据健康状态变化记录日志
          if (healthDiff > 0) {
            console.log(`树木健康状态改善: ${healthBefore}% → ${healthAfter}% (+${healthDiff}%)`);
          } else {
            console.warn(`树木健康状态恶化: ${healthBefore}% → ${healthAfter}% (${healthDiff}%)`);
          }
        }
      }
      
      // 显示成功消息
      message.success(
        `任务进度已更新为 ${updateProgress}%，树木进入${getGrowthStageName(newGrowthStage)}阶段${healthChangeMessage}`
      );
    } catch (error) {
      // 由于treeHealthService已经增加了错误处理并返回模拟数据，
      // 这里理论上不应该再进入到catch块，但为了健壮性继续保留错误处理
      console.error('更新任务进度失败:', error);
      message.warning('由于后端服务不可用，使用模拟数据更新进度');
    } finally {
      setLoading(false);
    }
  };
  
  // 计算生长阶段 (0-3)
  const calculateGrowthStage = (progress: number): number => {
    if (progress >= 100) {
      return 3; // 成熟阶段
    } else if (progress >= 66) {
      return 2; // 成长阶段
    } else if (progress >= 33) {
      return 1; // 幼苗阶段
    } else {
      return 0; // 种子阶段
    }
  };

  // 获取生长阶段名称
  const getGrowthStageName = (stage: number): string => {
    switch (stage) {
      case 0:
        return '种子';
      case 1:
        return '幼苗';
      case 2:
        return '成长';
      case 3:
        return '成熟';
      default:
        return '未知';
    }
  };

  // 获取生长阶段颜色
  const getGrowthStageColor = (stage: number): string => {
    switch (stage) {
      case 0:
        return '#8B4513'; // 种子阶段 - 棕色
      case 1:
        return '#90EE90'; // 幼苗阶段 - 浅绿色
      case 2:
        return '#228B22'; // 成长阶段 - 森林绿
      case 3:
        return '#006400'; // 成熟阶段 - 深绿色
      default:
        return '#d9d9d9';
    }
  };

  // 获取生长阶段进度
  const getGrowthStageProgress = (progress: number, logPrefixValue: string) => {
    // 计算当前生长阶段
    const stage = calculateGrowthStage(progress);
    
    let stageProgress = 0;
    // 计算在当前阶段内的进度百分比
    if (stage === 0) {
      // 种子阶段: 0% - 33%
      stageProgress = (progress / 33) * 100;
    } else if (stage === 1) {
      // 幼苗阶段: 33% - 66%
      stageProgress = ((progress - 33) / 33) * 100;
    } else if (stage === 2) {
      // 成长阶段: 66% - 100%
      stageProgress = ((progress - 66) / 34) * 100;
    } else {
      // 成熟阶段: 100%
      stageProgress = 100;
    }
    
    console.log(`${logPrefixValue} | 生长阶段: ${stage} (${getGrowthStageName(stage)}), 阶段内进度: ${stageProgress.toFixed(2)}%`);
    
    return {
      stage,
      stageName: getGrowthStageName(stage),
      stageColor: getGrowthStageColor(stage),
      stageProgress
    };
  };

  // 更新生长阶段状态
  useEffect(() => {
    if (taskHealth && taskHealth.progress !== undefined) {
      const newGrowthStage = calculateGrowthStage(taskHealth.progress);
      setGrowthStage(newGrowthStage);
      console.log(`任务${taskId}的进度为${taskHealth.progress}%，生长阶段已设置为: ${newGrowthStage} (${getGrowthStageName(newGrowthStage)})`);
    }
  }, [taskHealth, taskId]);

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

  // 手动刷新健康状态
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTreeHealth();
      message.success('健康状态数据已更新');
    } catch (error) {
      message.error('更新健康状态失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 批量更新所有树木健康状态
  const handleBatchUpdate = async () => {
    try {
      setRefreshing(true);
      const result = await treeHealthService.batchUpdateTreesHealth();
      message.success(`${result.message}`);
      // 更新当前显示的树木健康状态
      await fetchTreeHealth();
    } catch (error) {
      // 由于treeHealthService已经增加了错误处理并返回模拟结果，
      // 这里理论上不应该再进入到catch块，但为了健壮性继续保留错误处理
      console.error('批量更新树木健康状态失败:', error);
      message.warning('由于后端服务不可用，使用模拟数据进行批量更新');
    } finally {
      setRefreshing(false);
    }
  };

  // 如果没有treeId或taskId，显示错误提示
  if (!treeId && !taskId) {
    return (
      <Card title="树木健康状态" bordered={false}>
        <Alert message="请选择一棵树或任务" type="info" />
      </Card>
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

  // 渲染错误提示
  if (error) {
    return (
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>树木健康状态</span>
            <Button 
              type="primary" 
              onClick={handleRefresh} 
              loading={refreshing}
              icon={<SyncOutlined />}
            >
              重新获取
            </Button>
          </div>
        } 
        extra={
          <Button 
            type="link" 
            onClick={handleBatchUpdate}
            loading={refreshing}
          >
            批量更新所有树木
          </Button>
        }
        bordered={false}
      >
        <Alert
          message="获取健康状态失败"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>树木健康状态</span>
          <Button 
            type="text" 
            icon={<SyncOutlined spin={refreshing} />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            刷新
          </Button>
        </div>
      } 
      extra={
        <Button 
          type="link" 
          onClick={handleBatchUpdate}
          loading={refreshing}
        >
          批量更新所有树木
        </Button>
      }
      bordered={false}
    >
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