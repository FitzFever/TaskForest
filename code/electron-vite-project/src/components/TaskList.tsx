import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Space, Typography, Alert, Modal, message } from 'antd';
import TaskService from '../services/TaskService';
import { Task, TaskPriority, TaskStatus } from '../types/Task';

const { Title, Text } = Typography;

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取所有任务
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await TaskService.getTasks();
      setTasks(data);
      console.log("获取到任务:", data.length);
    } catch (error) {
      console.error("获取任务失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取任务
  useEffect(() => {
    fetchTasks();
  }, []);

  // 完成任务
  const handleCompleteTask = async (taskId: number) => {
    try {
      Modal.confirm({
        title: '完成任务',
        content: '任务完成后，关联的树木将会成长。确定要完成此任务吗？',
        onOk: async () => {
          setLoading(true);
          const updatedTask = await TaskService.completeTask(taskId);
          if (updatedTask) {
            message.success('任务完成！树木成长了！');
            fetchTasks();
          } else {
            message.error('完成任务失败');
            setLoading(false);
          }
        },
      });
    } catch (error) {
      console.error("任务完成失败:", error);
      message.error('任务完成失败');
      setLoading(false);
    }
  };

  // 创建任务
  const handleCreateTask = () => {
    Modal.confirm({
      title: '创建任务',
      content: (
        <div>
          <p>这是任务表单的简化版本。在实际生产中，应该有完整的表单。</p>
          <p>创建任务后会自动种下一棵树！</p>
        </div>
      ),
      onOk: async () => {
        setLoading(true);
        try {
          const newTask = await TaskService.createTask({
            title: `示例任务 ${new Date().toLocaleTimeString()}`,
            priority: TaskPriority.MEDIUM,
            description: '这是自动创建的示例任务',
          });
          
          if (newTask) {
            message.success('任务创建成功！新树已种下！');
            fetchTasks();
          } else {
            message.error('创建任务失败');
            setLoading(false);
          }
        } catch (error) {
          console.error("创建任务失败:", error);
          message.error('创建任务失败');
          setLoading(false);
        }
      },
    });
  };

  // 获取任务的标签颜色
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
      case TaskPriority.URGENT:
        return 'red';
      case TaskPriority.MEDIUM:
        return 'orange';
      case TaskPriority.LOW:
        return 'blue';
      default:
        return 'default';
    }
  };

  // 获取状态的标签颜色
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.IN_PROGRESS:
        return 'processing';
      case TaskStatus.TODO:
        return 'default';
      default:
        return 'default';
    }
  };

  // 如果没有任务，显示引导信息
  if (!loading && tasks.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="没有任务"
          description='您的任务列表是空的。点击"创建任务"按钮添加您的第一个任务！'
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        <Button type="primary" onClick={handleCreateTask}>创建任务</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Title level={3}>任务列表</Title>
        <Button type="primary" onClick={handleCreateTask}>创建任务</Button>
      </div>

      <List
        loading={loading}
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
                <Button 
                  key="complete" 
                  size="small" 
                  type="primary" 
                  disabled={task.completed}
                  onClick={() => handleCompleteTask(task.id)}
                >
                  {task.completed ? '已完成' : '完成'}
                </Button>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Tag color={getPriorityColor(task.priority)}>
                    优先级: {task.priority}
                  </Tag>
                  <Tag color={getStatusColor(task.status)}>
                    {task.status}
                  </Tag>
                </Space>
                {task.description && (
                  <Text type="secondary">{task.description}</Text>
                )}
                {task.deadline && (
                  <div>截止日期: {new Date(task.deadline).toLocaleDateString()}</div>
                )}
                {task.category && (
                  <div>
                    <div>分类: {task.category.name}</div>
                    <div>树木类型: {task.category.treeType}</div>
                  </div>
                )}
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TaskList; 