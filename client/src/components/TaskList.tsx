import React, { useEffect } from 'react';
import { List, Card, Tag, Button, Typography, Space, Spin, Empty } from 'antd';
import { useTaskStore } from '../store';
import { TaskStatus, TaskPriority } from '../types/Task';

const { Title, Text } = Typography;

// 优先级标签颜色映射
const priorityColors = {
  [TaskPriority.LOW]: 'blue',
  [TaskPriority.MEDIUM]: 'green',
  [TaskPriority.HIGH]: 'orange',
  [TaskPriority.URGENT]: 'red',
};

// 状态标签颜色映射
const statusColors = {
  [TaskStatus.TODO]: 'default',
  [TaskStatus.IN_PROGRESS]: 'processing',
  [TaskStatus.COMPLETED]: 'success',
};

const TaskList: React.FC = () => {
  // 从store获取状态和方法
  const { 
    tasks,
    loading,
    error,
    selectedTask,
    selectTask,
    setLoading,
    setError,
    setTasks,
  } = useTaskStore();

  // 模拟从API获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // 这里应该是实际的API调用
        // const response = await taskService.getTasks();
        // setTasks(response.data);
        
        // 模拟数据
        setTimeout(() => {
          setTasks([
            {
              id: 1,
              title: '完成TaskForest项目设计',
              description: '设计TaskForest项目的UI和业务逻辑',
              priority: TaskPriority.HIGH,
              status: TaskStatus.IN_PROGRESS,
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: '实现树木生长动画',
              description: '为完成的任务添加树木生长动画效果',
              priority: TaskPriority.MEDIUM,
              status: TaskStatus.TODO,
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 3,
              title: '编写API文档',
              description: '为TaskForest项目编写详细的API文档',
              priority: TaskPriority.LOW,
              status: TaskStatus.COMPLETED,
              completed: true,
              completedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('获取任务列表失败');
        setLoading(false);
      }
    };

    fetchTasks();
  }, [setLoading, setError, setTasks]);

  // 处理任务点击
  const handleTaskClick = (task) => {
    selectTask(task);
  };

  // 显示加载中
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>加载任务列表中...</p>
      </div>
    );
  }

  // 显示错误
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">{error}</Text>
        <Button 
          onClick={() => setError(null)} 
          style={{ marginTop: '20px' }}
          type="primary"
        >
          重试
        </Button>
      </div>
    );
  }

  // 显示空列表
  if (tasks.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <Title level={3}>我的任务</Title>
        <Empty 
          description="暂无任务，点击下方按钮创建任务" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button type="primary">创建任务</Button>
        </div>
      </div>
    );
  }

  // 渲染任务列表
  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>我的任务</Title>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item>
            <Card 
              title={task.title}
              hoverable
              onClick={() => handleTaskClick(task)}
              style={{ 
                borderLeft: `3px solid ${priorityColors[task.priority]}`,
                backgroundColor: selectedTask?.id === task.id ? '#f0f7ff' : 'white'
              }}
              extra={
                <Space>
                  <Tag color={statusColors[task.status]}>
                    {task.status}
                  </Tag>
                  <Tag color={priorityColors[task.priority]}>
                    {task.priority}
                  </Tag>
                </Space>
              }
            >
              <p>{task.description || '暂无描述'}</p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '10px' 
              }}>
                <Text type="secondary">
                  创建于: {new Date(task.createdAt).toLocaleDateString()}
                </Text>
                {task.completedAt && (
                  <Text type="success">
                    完成于: {new Date(task.completedAt).toLocaleDateString()}
                  </Text>
                )}
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TaskList; 