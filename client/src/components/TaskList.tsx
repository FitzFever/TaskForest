import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Button, Typography, Space, Spin, Empty, Modal, message } from 'antd';
import { useTaskStore } from '../store';
import { TaskStatus, TaskPriority, Task, CreateTaskData } from '../types/Task';
import * as taskService from '../services/taskService';
import TaskForm from './TaskForm';
import { PlusOutlined, EditOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './TaskList.module.css';
import { TreeType } from '../types/Tree';
import taskAdapter from '../adapters/taskAdapter';

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
  'CANCELLED': 'error', // 使用字符串而不是枚举值
};

const TaskList: React.FC = () => {
  // Modal状态
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
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

  // 从API获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // 调用API获取任务列表
        const response = await taskService.getAllTasks();
        // 将后端任务数据映射为前端格式
        const frontendTasks = (response.tasks || []).map(taskAdapter.apiTaskToFrontendTask);
        setTasks(frontendTasks);
        
        setLoading(false);
      } catch (err) {
        setError('获取任务列表失败');
        console.error('获取任务列表失败', err);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [setLoading, setError, setTasks]);

  // 处理任务点击
  const handleTaskClick = (task: Task) => {
    selectTask(task);
  };

  // 处理任务删除
  const handleDeleteTask = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    
    try {
      setLoading(true);
      await taskService.deleteTask(id.toString()); // 转换为字符串ID
      // 从本地状态中移除被删除的任务
      setTasks(tasks.filter(task => task.id !== id));
      setLoading(false);
    } catch (err) {
      setError('删除任务失败');
      console.error('删除任务失败', err);
      setLoading(false);
    }
  };

  // 处理完成任务
  const handleCompleteTask = async (id: number) => {
    try {
      await taskService.completeTask(id.toString());
      // 更新本地任务状态
      setTasks(tasks.map(task => 
        task.id === id 
          ? { ...task, status: TaskStatus.COMPLETED, completed: true, completedAt: new Date().toISOString() } 
          : task
      ));
      message.success('任务完成！');
    } catch (error) {
      console.error('完成任务失败:', error);
      message.error('完成任务失败');
    }
  };

  // 处理编辑任务
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // 处理创建任务按钮点击
  const handleCreateTask = () => {
    setShowCreateForm(true);
  };

  // 处理任务创建成功
  const handleTaskSuccess = (task: Task) => {
    console.log('任务创建成功，更新列表:', task);
    // 手动获取最新任务列表
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // 调用API获取任务列表
        const response = await taskService.getAllTasks();
        // 将后端任务数据映射为前端格式
        const frontendTasks = (response.tasks || []).map(taskAdapter.apiTaskToFrontendTask);
        setTasks(frontendTasks);
        
        setLoading(false);
      } catch (err) {
        setError('获取任务列表失败');
        console.error('获取任务列表失败', err);
        setLoading(false);
      }
    };

    fetchTasks();
    setShowCreateForm(false);
    message.success('任务创建成功！');
  };

  // 处理任务更新成功
  const handleTaskEditSuccess = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setEditingTask(null);
    message.success('任务更新成功！');
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
      
      {tasks.length === 0 ? (
        <Empty description="暂无任务" />
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={tasks}
          renderItem={task => (
            <List.Item>
              <Card 
                title={task.title}
                onClick={() => handleTaskClick(task)}
                extra={
                  <Space>
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<EditOutlined />} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
                      }}
                    />
                    <Button 
                      type="text" 
                      size="small" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={(e) => handleDeleteTask(task.id, e)}
                    />
                  </Space>
                }
              >
                <p>{task.description || '无描述'}</p>
                <div>
                  <Tag color={priorityColors[task.priority]}>
                    {task.priority}
                  </Tag>
                  <Tag color={statusColors[task.status]}>
                    {task.status}
                  </Tag>
                  {task.deadline && <Tag>截止: {task.deadline}</Tag>}
                </div>
                <div style={{ marginTop: '10px' }}>
                  {task.status !== TaskStatus.COMPLETED && (
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<CheckOutlined />} 
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      完成
                    </Button>
                  )}
                </div>
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