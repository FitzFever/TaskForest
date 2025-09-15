import React, { useState, useEffect } from 'react';
import { List, Card, Button, Tooltip, Modal, Empty, Typography, Space, Tag, message, Select, Form, DatePicker, Radio, Input, Divider, Pagination, Row, Col, Drawer } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined, EditOutlined, FilterOutlined, ReloadOutlined, SortAscendingOutlined, SearchOutlined, QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Task, TaskStatus, TaskPriority, TaskType } from '../types/Task';
import { TreeType } from '../types/Tree';
import TaskForm from './TaskForm';
import TagStats from './TagStats';
import TaskStats from './TaskStats';
import * as taskService from '../services/taskService';
import { GetTasksParams } from '../services/taskService';
import { getDefaultTreeTypeForTask } from '../services/constantsService';

// 导入CSS模块，使用require方式避免TypeScript检查错误
const styles = require('./TaskList.module.css');

const { Title, Text } = Typography;
const { Option } = Select;

// 状态和优先级颜色映射
const statusColors: Record<string, string> = {
  [TaskStatus.TODO]: 'blue',
  [TaskStatus.IN_PROGRESS]: 'orange',
  [TaskStatus.COMPLETED]: 'green'
};

const priorityColors: Record<string, string> = {
  [TaskPriority.LOW]: 'gray',
  [TaskPriority.MEDIUM]: 'blue',
  [TaskPriority.HIGH]: 'orange'
};

// 添加树木类型颜色映射
const treeTypeColors: Record<string, string> = {
  [TreeType.OAK]: 'green',     // 普通日常任务
  [TreeType.PINE]: 'cyan',     // 定期重复任务
  [TreeType.WILLOW]: 'purple', // 长期项目任务
  [TreeType.MAPLE]: 'orange',  // 工作类任务
  [TreeType.CHERRY]: 'red'     // 特殊任务
};

// 添加树木类型名称映射
const treeTypeNames: Record<string, string> = {
  [TreeType.OAK]: '橡树 (普通日常任务)',
  [TreeType.PINE]: '松树 (定期重复任务)',
  [TreeType.WILLOW]: '柳树 (长期项目任务)',
  [TreeType.MAPLE]: '枫树 (工作类任务)',
  [TreeType.CHERRY]: '樱花树 (特殊任务)'
};

// 定义filters状态的类型
interface FilterState {
  status?: TaskStatus;
  tags: string[];
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  treeType?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
}

const DebugPaginationOverlay = ({ pagination, visible = true }) => {
  if (!visible || process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div><b>分页调试</b></div>
      <div>当前页: {pagination.current}</div>
      <div>每页条数: {pagination.pageSize}</div>
      <div>总条数: {pagination.total}</div>
      <div>总页数: {Math.ceil(pagination.total / pagination.pageSize) || 0}</div>
    </div>
  );
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  
  // 过滤相关状态
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = useState<FilterState>({
    status: undefined,
    tags: [] as string[],
    priority: undefined,
    startDate: undefined,
    endDate: undefined,
    treeType: undefined,
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });
  const [commonTags, setCommonTags] = useState<string[]>([]);

  // 新增高级搜索相关状态
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [searchForm] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 添加分页相关状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 组件初始化标志
  const initialized = React.useRef(false);
  useEffect(() => {
    console.log('【TaskList】组件已挂载');
    initialized.current = true;
    
    // 组件挂载时先获取一次数据
    fetchTaskList();
    
    // 添加强制更新间隔，确保分页组件在开发环境中能够显示（仅用于调试）
    if (process.env.NODE_ENV === 'development') {
      const forceUpdateInterval = setInterval(() => {
        if (pagination.total <= 0 && tasks.length > 0) {
          console.log('【TaskList】强制更新分页状态');
          setPagination(prev => ({
            ...prev,
            total: Math.max(prev.total, tasks.length, 1)
          }));
        }
      }, 2000);
      
      return () => clearInterval(forceUpdateInterval);
    }
  }, []);

  // 监听分页和过滤器变化
  useEffect(() => {
    if (!initialized.current) return;
    
    console.log('【TaskList】分页或过滤器变化，重新获取数据');
    console.log('【TaskList】当前分页:', JSON.stringify(pagination, null, 2));
    console.log('【TaskList】当前过滤器:', JSON.stringify(filters, null, 2));
    
    // 设置一个短暂的延迟，避免同时发起多个请求
    const timer = setTimeout(() => {
      fetchTaskList();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [
    pagination.current, 
    pagination.pageSize, 
    JSON.stringify(filters)
  ]);

  // 获取任务列表
  const fetchTaskList = async () => {
    try {
      setLoading(true);
      console.log('【TaskList】获取任务列表开始');
      console.log('【TaskList】过滤条件:', JSON.stringify(filters, null, 2));
      console.log('【TaskList】分页参数:', JSON.stringify(pagination, null, 2));
      
      // 将分页参数添加到请求中，确保使用limit作为参数名称（与后端API一致）
      const params = {
        ...filters,
        page: pagination.current || 1, // 确保始终有默认值
        limit: pagination.pageSize || 10 // 确保始终有默认值
      };
      
      console.log('【TaskList】发送请求的完整参数:', JSON.stringify(params, null, 2));
      
      const response = await taskService.getTasks(params);
      console.log('【TaskList】获取到响应:', response);
      
      if (response.data && response.data.code === 200) {
        const { tasks: taskList, pagination: paginationInfo } = response.data.data;
        
        console.log('【TaskList】任务数量:', taskList.length);
        console.log('【TaskList】分页信息:', JSON.stringify(paginationInfo, null, 2));
        
        setTasks(taskList);
        
        // 更新分页信息，确保字段名称匹配
        const updatedPagination = {
          current: paginationInfo.page || pagination.current,
          pageSize: paginationInfo.limit || pagination.pageSize,
          // 确保total不为0，最小为1，这样分页组件总是会显示
          total: Math.max(paginationInfo.total || 0, taskList.length || 1)
        };
        
        console.log('【TaskList】更新后的分页状态:', JSON.stringify(updatedPagination, null, 2));
        setPagination(updatedPagination);
        
        // 收集所有任务标签
        const allTags = taskList.reduce((tags: string[], task: Task) => {
          return tags.concat(task.tags || []);
        }, []);
        
        // 找出出现频率最高的标签
        const tagCounts: Record<string, number> = {};
        allTags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        // 获取前5个最常用的标签
        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);
        
        setCommonTags(sortedTags);
        
      } else {
        throw new Error((response.data && response.data.message) || '获取任务列表失败');
      }
    } catch (err: any) {
      console.error('【TaskList】获取任务列表失败:', err);
      
      // 增强的错误处理
      let errorMsg = '获取任务列表失败，请重试';
      if (err?.response) {
        console.error('【TaskList】错误响应状态:', err.response.status);
        console.error('【TaskList】错误响应数据:', JSON.stringify(err.response.data, null, 2));
        errorMsg = `获取失败: ${err.response.status} - ${err.response.data?.message || '未知错误'}`;
      } else if (err?.request) {
        console.error('【TaskList】网络请求错误:', err.request);
        errorMsg = '网络请求失败，请检查网络连接';
      } else if (err?.message) {
        console.error('【TaskList】错误消息:', err.message);
        errorMsg = err.message;
      }
      
      // 在开发环境下添加更多调试信息
      if (process.env.NODE_ENV === 'development') {
        console.warn('【TaskList】调试提示: 请检查是否正确获取到分页数据');
        console.log('【TaskList】当前分页状态:', JSON.stringify(pagination, null, 2));
        console.log('【TaskList】当前过滤条件:', JSON.stringify(filters, null, 2));
      }
      
      setError(errorMsg);
      message.error(errorMsg);
      
      // 强制设置一些任务数据，以便可以看到分页组件（仅在开发环境）
      if (process.env.NODE_ENV === 'development' && tasks.length === 0) {
        console.log('【TaskList】在开发环境中设置模拟数据');
        setTasks([{
          id: 'debug-task-1',
          title: '调试任务-1',
          description: '这是一个调试用的任务，用于测试分页组件',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['调试', '测试'],
          treeType: TreeType.OAK,
          growthStage: 1,
          type: TaskType.NORMAL
        }]);
        
        // 强制设置分页数据，确保分页组件显示
        setPagination({
          current: 1,
          pageSize: 10,
          total: 20 // 设置大于pageSize的值，确保显示分页
        });
      }
      
    } finally {
      setLoading(false);
      console.log('【TaskList】获取任务列表结束');
    }
  };

  // 从任务中提取常用标签
  const updateCommonTags = (taskList: Task[]) => {
    // 收集所有标签
    const allTags: string[] = [];
    taskList.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        allTags.push(...task.tags);
      }
    });
    
    // 计算标签频率
    const tagCounts: Record<string, number> = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    // 排序并获取前10个最常用的标签
    const sortedTags = Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 10);
    
    setCommonTags(sortedTags);
  };

  // 处理任务完成
  const handleCompleteTask = (taskId: string) => {
    setLoadingTasks(true);
    taskService.completeTask(taskId)
      .then(() => {
        message.success('任务已完成');
        fetchTaskList();
      })
      .catch(error => {
        console.error('完成任务失败:', error);
        message.error('完成任务失败');
      })
      .finally(() => {
        setLoadingTasks(false);
      });
  };

  // 处理任务删除
  const handleDeleteTask = (taskId: string) => {
    setLoadingTasks(true);
    taskService.deleteTask(taskId)
      .then(() => {
        message.success('任务已删除');
        fetchTaskList();
      })
      .catch(error => {
        console.error('删除任务失败:', error);
        message.error('删除任务失败');
      })
      .finally(() => {
        setLoadingTasks(false);
      });
  };

  // 处理编辑任务
  const handleEditTask = (task: Task) => {
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

  // 添加处理分页变化的函数
  const handlePageChange = (page: number, pageSize?: number) => {
    console.log('【TaskList】分页变化，页码:', page, '每页大小:', pageSize);
    
    // 更新分页状态
    const newPagination = {
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize
    };
    
    console.log('【TaskList】更新分页状态:', JSON.stringify(newPagination, null, 2));
    setPagination(newPagination);
    
    // 不需要手动调用fetchTaskList，因为useEffect会监听pagination变化并自动触发
  };

  // 应用筛选
  const handleApplyFilters = (values: any) => {
    console.log('应用筛选，原始值:', values);
    
    // 标签特殊处理，确保中文标签和tag:前缀正确处理
    const processTags = values.tags?.map((tag: string) => {
      if (tag.startsWith('tag:')) {
        // 确保tag:前缀处理正确
        console.log(`处理特殊标签: ${tag}`);
        return tag; // 由taskService处理编码
      } else {
        // 普通标签
        console.log(`处理普通标签: ${tag}`);
        return tag; // 由taskService处理编码
      }
    }) || [];
    
    // 格式化日期和确保sortOrder类型正确
    const formattedValues: FilterState = {
      ...values,
      startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
      endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
      sortOrder: (values.sortOrder || 'asc') as 'asc' | 'desc',
      tags: processTags
    };
    
    console.log('格式化后的过滤条件:', formattedValues);
    setFilters(formattedValues);
    
    // 重置分页到第一页
    setPagination({
      ...pagination,
      current: 1
    });
    
    // 显示加载状态和清除错误
    setLoading(true);
    setError(null);
    
    // 使用直接调用API的方式确保参数正确传递
    console.log('发送API请求...');
    taskService.getTasks({
      ...formattedValues,
      page: 1,
      limit: pagination.pageSize // 使用limit替代pageSize，与API一致
    } as GetTasksParams)
      .then(response => {
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
          
          // 更新分页信息
          if (response.data.data.pagination) {
            setPagination({
              ...pagination,
              current: 1,
              pageSize: response.data.data.pagination.limit || pagination.pageSize, // 使用limit替代pageSize
              total: response.data.data.pagination.total || 0
            });
          }
          
          // 更新常用标签
          if (response.data.data.tasks) {
            updateCommonTags(response.data.data.tasks);
          }
          setError(null);
        } else {
          throw new Error('获取任务列表失败');
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : '获取任务列表失败');
        console.error('获取任务列表失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 重置筛选
  const handleResetFilters = () => {
    filterForm.resetFields();
    
    const defaultFilters: FilterState = {
      status: undefined,
      tags: [],
      priority: undefined,
      startDate: undefined,
      endDate: undefined,
      treeType: undefined,
      sortBy: 'dueDate',
      sortOrder: 'asc'
    };
    
    setFilters(defaultFilters);
    
    // 重置分页
    setPagination({
      ...pagination,
      current: 1
    });

    // 重新获取任务
    setLoading(true);
    
    taskService.getTasks({
      page: 1,
      limit: pagination.pageSize // 使用limit替代pageSize，与API一致
    } as GetTasksParams)
      .then(response => {
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
    
          // 更新分页信息
          if (response.data.data.pagination) {
            setPagination({
              ...pagination,
              current: 1,
              pageSize: response.data.data.pagination.limit || pagination.pageSize, // 使用limit替代pageSize
              total: response.data.data.pagination.total || 0
            });
          }
          
          // 更新常用标签
          if (response.data.data.tasks) {
            updateCommonTags(response.data.data.tasks);
          }
          setError(null);
        } else {
          throw new Error('获取任务列表失败');
    }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : '获取任务列表失败');
        console.error('获取任务列表失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    // 设置标签过滤器
    const newFilters: FilterState = {
      ...filters,
      tags: [tag]
    };
    
    // 更新过滤器状态
    setFilters(newFilters);
    filterForm.setFieldsValue({ tags: [tag] });
    
    // 使用新过滤器获取任务
    setLoading(true);
    
    taskService.getTasks({
      ...newFilters,
      page: 1,
      limit: pagination.pageSize // 使用limit替代pageSize，与API一致
    } as GetTasksParams)
      .then(response => {
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
          
          // 更新分页信息
          if (response.data.data.pagination) {
            setPagination({
              ...pagination,
              current: 1,
              pageSize: response.data.data.pagination.limit || pagination.pageSize, // 使用limit替代pageSize
              total: response.data.data.pagination.total || 0
            });
          }
          
          setError(null);
        } else {
          throw new Error('获取任务列表失败');
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : '获取任务列表失败');
        console.error('获取筛选后的任务失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 添加处理快速搜索的函数
  const handleQuickSearch = (value: string) => {
    console.log('搜索关键词:', value);
    setSearchKeyword(value);
    
    // 更新过滤器
    const newFilters: FilterState = {
      ...filters,
      search: value
    };
    setFilters(newFilters);
    
    // 重置分页到第一页
    setPagination({
      ...pagination,
      current: 1
    });
  
    // 使用新过滤器获取任务
    setLoading(true);
    
    taskService.getTasks({
      ...newFilters,
      page: 1,
      limit: pagination.pageSize // 使用limit替代pageSize，与API一致
    } as GetTasksParams)
      .then(response => {
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
          
          // 更新分页信息
          if (response.data.data.pagination) {
            setPagination({
              ...pagination,
              current: 1,
              pageSize: response.data.data.pagination.limit || pagination.pageSize, // 使用limit替代pageSize
              total: response.data.data.pagination.total || 0
            });
          }
          
          setError(null);
        } else {
          throw new Error('搜索任务失败');
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : '搜索任务失败');
        console.error('搜索任务失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 渲染任务卡片
  const renderTaskCard = (task: Task) => {
    const statusColor = statusColors[task.status] || 'default';
    const priorityColor = priorityColors[task.priority] || 'default';
    const treeTypeColor = (task.treeType && treeTypeColors[task.treeType]) || 'gray';
    
    // 计算树木生长阶段显示
    const growthStageText = task.growthStage ? `成长阶段: ${task.growthStage}/5` : '尚未种植';
    
    return (
      <Card
        className={styles.taskCard}
        hoverable
        size="small"
        title={
          <div className={styles.taskTitle}>
            <Text strong ellipsis style={{ maxWidth: '70%' }}>{task.title}</Text>
            <Space>
              <Tag color={statusColor}>{task.status}</Tag>
              <Tag color={priorityColor}>优先级 {task.priority}</Tag>
            </Space>
      </div>
        }
        extra={
        <Space>
            <Tooltip title="编辑">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTask(task);
                }} 
          />
            </Tooltip>
            <Tooltip title="完成">
          <Button 
                type="text" 
                icon={<CheckOutlined />} 
                disabled={task.status === TaskStatus.COMPLETED}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteTask(task.id.toString());
                }} 
              />
            </Tooltip>
            <Tooltip title="删除">
          <Button 
                type="text" 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: '确认删除',
                    content: `确定要删除任务 "${task.title}" 吗？关联的树木也将被删除！`,
                    okText: '删除',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk: () => handleDeleteTask(task.id.toString())
                  });
                }} 
              />
            </Tooltip>
          </Space>
        }
      >
        <div className={styles.taskContent}>
          {task.description && (
            <div className={styles.taskDescription}>
              <Text type="secondary" ellipsis>{task.description}</Text>
            </div>
          )}

          <div className={styles.taskMeta}>
            {task.dueDate && (
              <div className={styles.taskDueDate}>
                <Text type="secondary">截止日期: {new Date(task.dueDate).toLocaleDateString()}</Text>
              </div>
            )}
            
            {/* 添加树木相关信息 */}
            <div className={styles.taskTree}>
              <Space>
                <Tag color={treeTypeColor}>
                  {task.treeType && treeTypeNames[task.treeType] || `未知树种`}
                </Tag>
                <Text type="secondary">{growthStageText}</Text>
        </Space>
      </div>
      
            {task.tags && task.tags.length > 0 && (
              <div className={styles.taskTags}>
                <Space wrap>
                  {task.tags.map(tag => (
                    <Tag 
                      key={tag} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagClick(tag);
                      }}
          >
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // 列表底部添加分页组件
  const renderListFooter = () => {
    console.log('【TaskList】渲染分页组件:', JSON.stringify(pagination, null, 2));
    
    // 确保total至少为1
    const totalItems = Math.max(pagination.total, tasks.length, 1);
    const currentPage = pagination.current || 1;
    const pageSize = pagination.pageSize || 10;
    
    return (
      <div className={styles.paginationContainer}>
        <div style={{
          padding: '10px',
          backgroundColor: '#e6f7ff',
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          <Text type="secondary">分页状态: 第{currentPage}页 / 每页{pageSize}条 / 共{totalItems}条</Text>
        </div>
        
        <Pagination 
          className={styles.pagination}
          current={currentPage}
          pageSize={pageSize}
          total={totalItems}
          showTotal={(total) => `共 ${total} 条记录 (第${currentPage}页/共${Math.ceil(total/pageSize)}页)`}
          onChange={handlePageChange}
          showSizeChanger
          onShowSizeChange={(current, size) => handlePageChange(1, size)}
          showQuickJumper
          disabled={loading}
          style={{
            marginTop: '20px', 
            textAlign: 'center',
            display: 'block',
            width: '100%',
            border: '1px solid #f0f0f0',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}
        />
      </div>
    );
  };

  return (
    <div className={styles.taskListContainer}>
      {/* 页面内容 */}
      <div className={styles.header}>
        <Title level={3}>任务列表</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
          新建任务
        </Button>
      </div>
            
      {/* 筛选操作栏 */}
      <div className={styles.actionBar}>
              <Space>
                <Button 
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
          >
            筛选
          </Button>
          <Button
                  icon={<SearchOutlined />}
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                >
            高级搜索
                </Button>
        </Space>
        <div className={styles.searchContainer}>
          <Input.Search
            placeholder="快速搜索任务..."
            allowClear
            onSearch={handleQuickSearch}
            onChange={e => setSearchKeyword(e.target.value)}
          />
                <Button 
            icon={<ReloadOutlined />}
            onClick={handleResetFilters}
                >
                  重置
                </Button>
        </div>
      </div>
      
      {/* 筛选表单 */}
      {showFilters && (
        <Card className={styles.filterCard} size="small">
          <Form
            layout="vertical"
            form={filterForm}
            initialValues={filters}
            onFinish={handleApplyFilters}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="status" label="状态">
                  <Select 
                    placeholder="选择状态" 
                    allowClear
                  >
                    <Option value={TaskStatus.TODO}>待办</Option>
                    <Option value={TaskStatus.IN_PROGRESS}>进行中</Option>
                    <Option value={TaskStatus.COMPLETED}>已完成</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="priority" label="优先级">
                  <Select 
                    placeholder="选择优先级"
                    allowClear
                  >
                    <Option value={TaskPriority.LOW}>低优先级</Option>
                    <Option value={TaskPriority.MEDIUM}>中优先级</Option>
                    <Option value={TaskPriority.HIGH}>高优先级</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="tags" label="标签">
                  <Select
                    mode="tags"
                    placeholder="选择或输入标签"
                    allowClear
                  >
                    {commonTags.map(tag => (
                      <Option key={tag} value={tag}>{tag}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  应用筛选
                </Button>
                <Button onClick={handleResetFilters}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}
      
      {/* 标签统计组件 */}
      {tasks.length > 0 && (
        <TagStats tasks={tasks} onTagClick={handleTagClick} />
      )}
      
      {!tasks.length ? (
        <Empty
          description="暂无任务"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
        <List
            className={styles.taskList}
            grid={{ 
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 4,
              xxl: 4
            }}
          dataSource={tasks}
          renderItem={(task: Task) => (
            <List.Item key={task.id}>
                {renderTaskCard(task)}
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="暂无任务" /> }}
          />
          
          {/* 单独渲染分页组件，而不是作为List的footer */}
          {renderListFooter()}
          
          {/* 调试组件 - 在生产环境中应移除 */}
              <Card
            title="分页调试面板" 
            style={{ marginTop: '20px', backgroundColor: '#f0f7ff' }}
            extra={
              <Button type="primary" onClick={() => {
                console.log('手动刷新任务列表');
                fetchTaskList();
              }}>
                手动刷新
                      </Button>
            }
          >
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" title="当前分页状态">
                  <p><strong>当前页:</strong> {pagination.current}</p>
                  <p><strong>每页显示:</strong> {pagination.pageSize}</p>
                  <p><strong>总记录数:</strong> {pagination.total}</p>
                  <p><strong>总页数:</strong> {Math.ceil(pagination.total / pagination.pageSize) || 0}</p>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" title="手动设置页码">
                  <div style={{ marginBottom: '10px' }}>
                    <Input
                      type="number"
                      min={1}
                      placeholder="页码"
                      style={{ width: '100%' }}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (!isNaN(page) && page > 0) {
                          console.log(`手动设置页码: ${page}`);
                          handlePageChange(page, pagination.pageSize);
                        }
                      }}
                    />
                  </div>
                    <Button
                    block 
                    onClick={() => handlePageChange(1, pagination.pageSize)}
                    >
                    第一页
                    </Button>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" title="手动设置每页数量">
                  <div style={{ marginBottom: '10px' }}>
                    <Select
                      style={{ width: '100%' }}
                      value={pagination.pageSize}
                      onChange={(value) => {
                        console.log(`手动设置每页数量: ${value}`);
                        handlePageChange(1, value);
                      }}
                    >
                      <Option value={10}>10条/页</Option>
                      <Option value={20}>20条/页</Option>
                      <Option value={50}>50条/页</Option>
                    </Select>
                      </div>
              </Card>
              </Col>
              <Col span={6}>
                <Card size="small" title="网络请求信息">
                  <p><strong>加载状态:</strong> {loading ? '加载中' : '已完成'}</p>
                  <p><strong>错误信息:</strong> {error || '无'}</p>
                  <p><strong>任务数量:</strong> {tasks.length}</p>
                </Card>
              </Col>
            </Row>
          </Card>
        </>
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

      {/* 在最末尾添加Debug浮层 */}
      <DebugPaginationOverlay pagination={pagination} />
    </div>
  );
};

export default TaskList; 