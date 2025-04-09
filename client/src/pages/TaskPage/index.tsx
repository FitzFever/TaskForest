import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { TaskStatus, Task, TaskStats } from '../../types/Task';
import * as taskService from '../../services/taskService';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskStatsDisplay from './components/TaskStats';
import styles from './styles.module.css';

const TaskPage: React.FC = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    cancelled: 0,
    completionRate: 0
  });

  // 加载任务列表
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      if (response && response.tasks) {
        setTasks(response.tasks);
      }
    } catch (error) {
      message.error('加载任务列表失败');
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载任务统计
  const loadStats = async () => {
    try {
      const response = await taskService.getTaskStats();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('加载任务统计失败:', error);
    }
  };

  // 创建任务
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdTask = await taskService.createTask(taskData);
      if (createdTask) {
        message.success('任务创建成功');
        setIsCreateModalVisible(false);
        loadTasks();
        loadStats();
      }
    } catch (error) {
      message.error('创建任务失败');
      console.error('创建任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新任务状态
  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      setLoading(true);
      const updatedTask = await taskService.updateTaskStatus(taskId, status);
      if (updatedTask) {
        message.success('任务状态更新成功');
        loadTasks();
        loadStats();
      }
    } catch (error) {
      message.error('更新任务状态失败');
      console.error('更新任务状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 完成任务
  const handleCompleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      const completedTask = await taskService.completeTask(taskId);
      if (completedTask) {
        message.success('任务完成！');
        loadTasks();
        loadStats();
      }
    } catch (error) {
      message.error('完成任务失败');
      console.error('完成任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      await taskService.deleteTask(taskId);
      message.success('任务删除成功');
      loadTasks();
      loadStats();
    } catch (error) {
      message.error('删除任务失败');
      console.error('删除任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    loadStats();
  }, []);

  return (
    <div className={styles.taskPage}>
      <div className={styles.header}>
        <h1>任务管理</h1>
        <button 
          className={styles.createButton}
          onClick={() => setIsCreateModalVisible(true)}
        >
          创建新任务
        </button>
      </div>

      <TaskStatsDisplay stats={stats} />

      <TaskList
        tasks={tasks}
        loading={loading}
        onStatusChange={handleUpdateTaskStatus}
        onComplete={handleCompleteTask}
        onDelete={handleDeleteTask}
      />

      <TaskForm
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateTask}
        loading={loading}
      />
    </div>
  );
};

export default TaskPage; 