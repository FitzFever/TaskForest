import React, { useState } from 'react';
import { List, Card, Tag, Button, Space, Typography, Alert } from 'antd';

const { Title } = Typography;

// 简单的任务列表示例数据
const exampleTasks = [
  {
    id: 1,
    title: '完成项目报告',
    priority: '高',
    status: '进行中',
    deadline: '2023-12-25',
    category: { name: '工作', treeType: 'oak' }
  },
  {
    id: 2,
    title: '学习React',
    priority: '中',
    status: '进行中',
    deadline: '2023-12-30',
    category: { name: '学习', treeType: 'pine' }
  },
  {
    id: 3,
    title: '锻炼30分钟',
    priority: '低',
    status: '已完成',
    deadline: '2023-12-20',
    category: { name: '健康', treeType: 'maple' }
  }
];

const TaskList: React.FC = () => {
  const [tasks] = useState(exampleTasks);

  // 获取任务的标签颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高':
        return 'red';
      case '中':
        return 'orange';
      case '低':
        return 'blue';
      default:
        return 'default';
    }
  };

  // 获取状态的标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成':
        return 'success';
      case '进行中':
        return 'processing';
      case '待处理':
        return 'default';
      default:
        return 'default';
    }
  };

  // 如果没有任务，显示引导信息
  if (tasks.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="没有任务"
          description='您的任务列表是空的。点击"创建任务"按钮添加您的第一个任务！'
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        <Button type="primary">创建任务</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Title level={3}>任务列表</Title>
        <Button type="primary">创建任务</Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item>
            <Card
              title={task.title}
              extra={
                <Button size="small" type="link">查看</Button>
              }
              actions={[
                <Button key="edit" size="small">编辑</Button>,
                <Button key="complete" size="small" type="primary" disabled={task.status === '已完成'}>
                  完成
                </Button>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Tag color={getPriorityColor(task.priority)}>优先级: {task.priority}</Tag>
                  <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                </Space>
                <div>截止日期: {task.deadline}</div>
                <div>分类: {task.category.name}</div>
                <div>树木类型: {task.category.treeType}</div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TaskList; 