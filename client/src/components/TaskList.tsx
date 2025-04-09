import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Empty, Modal, Space, Tag, Typography, message } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Task, TaskStatus, TaskPriority } from '../types/Task';
import TaskForm from './TaskForm';
import styles from './TaskList.module.css';
import * as taskService from '../services/taskService';

const { Title, Text } = Typography;

// 状态和优先级颜色映射
const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'blue',
  [TaskStatus.IN_PROGRESS]: 'orange',
  [TaskStatus.COMPLETED]: 'green',
  [TaskStatus.CANCELLED]: 'red'
};

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'gray',
  [TaskPriority.MEDIUM]: 'blue',
  [TaskPriority.HIGH]: 'orange',
  [TaskPriority.URGENT]: 'red',
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 获取任务列表
  const fetchTaskList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      if (response && response.data && response.data.code === 200) {
        setTasks(response.data.data.tasks);
        setError(null);
      } else {
        throw new Error('获取任务列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务列表失败');
      console.error('获取任务列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskList();
  }, [fetchTaskList]);

  // 处理任务完成
  const handleCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await taskService.completeTask(taskId);
      message.success('任务已完成');
      await fetchTaskList();
    } catch (err) {
      message.error('完成任务失败');
      console.error('完成任务失败:', err);
    }
  };

  // 处理任务删除
  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个任务吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await taskService.deleteTask(taskId);
          message.success('任务已删除');
          await fetchTaskList();
        } catch (err) {
          message.error('删除任务失败');
          console.error('删除任务失败:', err);
        }
      }
    });
  };

  // 处理编辑任务
  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
  };

  // 处理创建任务
  const handleCreateTask = () => {
    setShowCreateForm(true);
  };

  // 处理任务创建成功
  const handleTaskSuccess = async () => {
    setShowCreateForm(false);
    await fetchTaskList();
  };

  // 处理任务编辑成功
  const handleTaskEditSuccess = async () => {
    setEditingTask(null);
    await fetchTaskList();
  };

  // 显示加载状态
  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  // 显示错误状态
  if (error) {
    return (
      <div className={styles.error}>
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

  // 渲染任务列表
  return (
    <div className={styles.taskList}>
      <div className={styles.header}>
        <Title level={4}>任务列表</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateTask}
        >
          新建任务
        </Button>
      </div>
      
      {!tasks.length ? (
        <Empty
          description="暂无任务"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={tasks}
          renderItem={(task: Task) => (
            <List.Item key={task.id}>
              <Card
                className={styles.taskCard}
                hoverable
                actions={[
                  <Button
                    key="complete"
                    type="text"
                    icon={<CheckOutlined />}
                    onClick={(e) => handleCompleteTask(task.id.toString(), e)}
                    disabled={task.status === TaskStatus.COMPLETED}
                  >
                    完成
                  </Button>,
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => handleEditTask(task, e)}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDeleteTask(task.id.toString(), e)}
                  >
                    删除
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <Space>
                      <Text strong>{task.title}</Text>
                      <Tag color={statusColors[task.status]}>
                        {TaskStatus[task.status]}
                      </Tag>
                      <Tag color={priorityColors[task.priority]}>
                        优先级 {task.priority}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div className={styles.taskDescription}>
                      <p>{task.description}</p>
                      <Space wrap>
                        {task.tags?.map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                      {task.dueDate && (
                        <Text type="secondary">
                          截止日期: {new Date(task.dueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
      
      {/* 创建任务表单 */}
      <Modal
        title="创建新任务"
        open={showCreateForm}
        footer={null}
        onCancel={() => setShowCreateForm(false)}
      >
        <TaskForm 
          type="create"
          onSuccess={handleTaskSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>
      
      {/* 编辑任务表单 */}
      {editingTask && (
        <Modal
          title="编辑任务"
          open={!!editingTask}
          footer={null}
          onCancel={() => setEditingTask(null)}
        >
          <TaskForm 
            type="edit"
            initialValues={editingTask}
            onSuccess={handleTaskEditSuccess}
            onCancel={() => setEditingTask(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default TaskList; 