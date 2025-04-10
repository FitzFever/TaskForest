import React, { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { TaskStatus, Task, TaskStats } from '../../types/Task';
import * as taskService from '../../services/taskService';
import * as treeHealthService from '../../services/treeHealthService';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskStatsDisplay from './components/TaskStats';
import styles from './styles.module.css';
import { GetTasksParams } from '../../services/taskService';
import { getHealthCategory } from '../../utils/healthUtils';
import { TASK_UPDATE_EVENT } from '../ForestPage';

const TaskPage: React.FC = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    cancelled: 0,
    completionRate: 0
  });
  const [filters, setFilters] = useState<any>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // 加载任务列表（增强版 - 包含健康状态）
  const loadTasks = async (params: any = {}) => {
    setLoading(true);
    setLoadError(null);
    console.log('Loading tasks with params:', params);
    try {
      const response = await taskService.getTasks(params);
      console.log('Tasks API response:', response);
      
      if (response.data && response.data.data && Array.isArray(response.data.data.tasks)) {
        // 为每个任务获取树木健康状态
        const enhancedTasks = await Promise.all(
          response.data.data.tasks.map(async (task) => {
            // 无需检查treeId，对每个任务尝试获取树木健康状态
            try {
              const healthData = await treeHealthService.getTaskTreeHealth(task.id.toString());
              return {
                ...task,
                treeId: healthData.tree.id, // 添加treeId
                healthState: healthData.tree.healthState,
                healthCategory: healthData.tree.healthCategory
              };
            } catch (error) {
              console.error(`获取任务${task.id}健康状态失败:`, error);
              // 如果API失败但有健康状态数值，使用辅助函数计算分类
              if (task.healthState !== undefined) {
                return {
                  ...task,
                  healthCategory: getHealthCategory(task.healthState)
                };
              }
              return task;
            }
          })
        );
        
        setTasks(enhancedTasks);
      } else {
        console.error('Invalid tasks response format:', response);
        setLoadError('任务数据格式错误，请刷新页面重试');
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setLoadError('加载任务失败，请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载任务统计
  const loadStats = async () => {
    try {
      const response = await taskService.getTaskStats();
      console.log('Stats API response:', response);
      
      if (response.data && response.data.data) {
        setStats(response.data.data);
      } else {
        console.error('Invalid stats response format:', response);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // 触发森林更新事件
  const triggerForestUpdate = () => {
    console.log('触发森林更新事件');
    // 创建并分发自定义事件
    const event = new Event(TASK_UPDATE_EVENT);
    window.dispatchEvent(event);
  };

  // 创建任务
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdTask = await taskService.createTask(taskData);
      if (createdTask) {
        message.success('任务创建成功');
        setIsCreateModalVisible(false);
        await loadTasks();
        await loadStats();
        // 触发森林更新
        triggerForestUpdate();
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
        await loadTasks();
        await loadStats();
        // 触发森林更新
        triggerForestUpdate();
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
        await loadTasks();
        await loadStats();
        // 触发森林更新
        triggerForestUpdate();
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
      await loadTasks();
      await loadStats();
      // 触发森林更新
      triggerForestUpdate();
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