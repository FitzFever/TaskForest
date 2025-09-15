import React from 'react';
import { Card, Row, Col, Progress, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import styles from './styles.module.css';

interface TaskStatsProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    cancelled: number;
    completionRate: number;
  };
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  return (
    <div className={styles.taskStats}>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待办"
              value={stats.todo}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className={styles.progressCard}>
        <Row gutter={16} align="middle">
          <Col span={18}>
            <Progress
              percent={stats.completionRate}
              status="active"
              strokeWidth={20}
              format={percent => `完成率 ${percent?.toFixed(1)}%`}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已取消"
              value={stats.cancelled}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<StopOutlined />}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TaskStats; 