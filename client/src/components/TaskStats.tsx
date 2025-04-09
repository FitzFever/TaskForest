import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Progress, Tag, Space, Typography, Spin } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as taskService from '../services/taskService';

const { Title, Text } = Typography;

/**
 * 任务统计组件
 * 显示任务完成情况、状态分布和标签分布
 */
const TaskStats: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取任务统计信息
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await taskService.getTaskStats();
        if (response && response.data && response.data.code === 200) {
          setStats(response.data.data);
          setError(null);
        } else {
          throw new Error('获取任务统计失败');
        }
      } catch (err) {
        console.error('获取任务统计失败:', err);
        setError('获取统计信息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="加载统计信息..." />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="danger">{error || '获取统计信息失败'}</Text>
        </div>
      </Card>
    );
  }

  // 计算颜色
  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return '#52c41a';
    if (rate >= 50) return '#1890ff';
    return '#faad14';
  };

  return (
    <Card title="任务统计" style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic 
            title="总任务数" 
            value={stats.total} 
            suffix={`项`} 
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="已完成" 
            value={stats.completed} 
            suffix={`项`}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="进行中" 
            value={stats.inProgress} 
            suffix={`项`}
            valueStyle={{ color: '#1890ff' }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="待办" 
            value={stats.todo} 
            suffix={`项`}
            valueStyle={{ color: '#faad14' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Col>
      </Row>

      <div style={{ marginTop: '24px' }}>
        <Title level={5}>任务完成率</Title>
        <Progress 
          percent={stats.completionRate} 
          strokeColor={getCompletionColor(stats.completionRate)}
          status="active"
        />
      </div>

      {stats.tagStats && stats.tagStats.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Title level={5}>标签分布</Title>
          <Space wrap>
            {stats.tagStats.map((tagStat: any) => (
              <Tag key={tagStat.tag} color="blue">
                {tagStat.tag} ({tagStat.count})
              </Tag>
            ))}
          </Space>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <Title level={5}>优先级分布</Title>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic 
              title="低优先级" 
              value={stats.priorityStats[1]} 
              valueStyle={{ color: 'gray' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="中优先级" 
              value={stats.priorityStats[2]} 
              valueStyle={{ color: 'blue' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="高优先级" 
              value={stats.priorityStats[3]} 
              valueStyle={{ color: 'orange' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="紧急" 
              value={stats.priorityStats[4]} 
              valueStyle={{ color: 'red' }}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default TaskStats; 