import React, { useState, useEffect } from 'react';
import { List, Card, Button, Tooltip, Modal, Empty, Row, Col, Typography, Space, Tag, message, Select, Form, DatePicker, Radio, Input, Divider } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined, EditOutlined, FilterOutlined, ReloadOutlined, SortAscendingOutlined, SearchOutlined, QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Task, TaskStatus, TaskPriority, TaskType } from '../types/Task';
import { TreeType } from '../types/Tree';
import TaskForm from './TaskForm';
import TagStats from './TagStats';
import TaskStats from './TaskStats';
import styles from './TaskList.module.css';
import * as taskService from '../services/taskService';
import { GetTasksParams } from '../services/taskService';
import { getDefaultTreeTypeForTask } from '../services/constantsService';

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

// 添加树木类型颜色映射
const treeTypeColors: Record<string, string> = {
  [TreeType.OAK]: 'green',     // 普通日常任务
  [TreeType.PINE]: 'cyan',     // 定期重复任务
  [TreeType.WILLOW]: 'purple', // 长期项目任务
  [TreeType.MAPLE]: 'orange',  // 工作类任务
  [TreeType.PALM]: 'lime',     // 休闲类任务
  [TreeType.APPLE]: 'volcano'  // 学习类任务
};

// 添加树木类型名称映射
const treeTypeNames: Record<string, string> = {
  [TreeType.OAK]: '橡树 (普通日常任务)',
  [TreeType.PINE]: '松树 (定期重复任务)',
  [TreeType.WILLOW]: '柳树 (长期项目任务)',
  [TreeType.MAPLE]: '枫树 (工作类任务)',
  [TreeType.PALM]: '棕榈树 (休闲类任务)',
  [TreeType.APPLE]: '苹果树 (学习类任务)'
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

  // 获取任务列表
  const fetchTaskList = async () => {
    try {
      setLoading(true);
      console.log('获取任务列表，过滤条件:', filters);
      
      const response = await taskService.getTasks(filters as GetTasksParams);
      
      if (response && response.data && response.data.code === 200) {
        // 提取任务列表
        const taskList = response.data.data.tasks as Task[];
        console.log('获取到任务列表:', taskList.length, '条记录');
        setTasks(taskList);
        
        // 更新常用标签
        updateCommonTags(taskList);
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

  useEffect(() => {
    fetchTaskList();
  }, []);

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
    
    // 显示加载状态和清除错误
    setLoading(true);
    setError(null);
    
    // 使用直接调用API的方式确保参数正确传递
    console.log('发送API请求...');
    taskService.getTasks(formattedValues as GetTasksParams)
      .then(response => {
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
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
    fetchTaskList();
  };

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    console.log('标签点击:', tag);
    
    // 如果标签已经在过滤条件中，不做任何操作
    if (filters.tags.includes(tag) || filters.tags.includes(`tag:${tag}`)) {
      console.log('标签已在过滤条件中，忽略');
      message.info(`标签"${tag}"已在筛选条件中`);
      return;
    }
    
    // 默认使用tag:前缀进行精确标签匹配
    // 这样符合API要求并提高搜索准确性
    const tagWithPrefix = `tag:${tag}`;
    console.log('添加精确标签到过滤器:', tagWithPrefix);
    
    // 打开筛选面板
    setShowFilters(true);
    
    // 更新表单和状态
    const newTags = [...filters.tags, tagWithPrefix];
    filterForm.setFieldValue('tags', newTags);
    
    const newFilters = {
      ...filters,
      tags: newTags
    };
    setFilters(newFilters);
    
    // 重新获取任务列表
    console.log('使用新过滤器获取任务:', newFilters);
    
    // 显示加载状态
    setLoading(true);
    setError(null);
    
    // 使用独立请求确保参数正确
    taskService.getTasks({
      ...newFilters,
      tags: newTags
    } as GetTasksParams)
      .then(response => {
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
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

  // 处理高级搜索
  const handleAdvancedSearch = (values: any) => {
    console.log('高级搜索参数:', values);
    
    // 构建查询关键字
    let keyword = '';
    
    if (values.title) {
      keyword += `${values.title} `;
    }
    
    if (values.description) {
      keyword += `${values.description} `;
    }
    
    if (values.keywords) {
      keyword += values.keywords;
    }
    
    console.log('构建的查询关键字:', keyword);
    setSearchKeyword(keyword.trim());
    
    // 应用搜索
    const newFilters = {
      ...filters,
      search: keyword.trim()
    };
    
    setFilters(newFilters);
    fetchTaskList();
    
    // 关闭高级搜索表单
    setShowAdvancedSearch(false);
  };
  
  // 处理快速搜索
  const handleQuickSearch = (value: string) => {
    console.log('搜索关键词:', value);
    setSearchKeyword(value);
    
    // 尝试直接通过API搜索
    taskService.getTasks({ search: value })
      .then(response => {
        if (response && response.data && response.data.code === 200) {
          // 提取任务列表
          const taskList = response.data.data.tasks as Task[];
          setTasks(taskList);
          
          // 更新过滤器但不触发新的搜索
          setFilters({
            ...filters,
            search: value
          });
          
          setError(null);
        } else {
          throw new Error('搜索失败');
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : '搜索失败');
        console.error('搜索失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
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
        <Space>
          <Input.Search
            placeholder="搜索任务..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleQuickSearch}
            style={{ width: 250 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <Button 
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            icon={<SearchOutlined />}
          >
            高级搜索
          </Button>
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            icon={<FilterOutlined />}
          >
            {showFilters ? '隐藏筛选' : '显示筛选'}
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateTask}
          >
            新建任务
          </Button>
        </Space>
      </div>
      
      {/* 高级搜索表单 */}
      {showAdvancedSearch && (
        <Card className={styles.filterCard} size="small" title="高级搜索" extra={
          <Button 
            type="link" 
            size="small" 
            onClick={() => setShowAdvancedSearch(false)}
          >
            收起
          </Button>
        }>
          <Form
            form={searchForm}
            layout="vertical"
            onFinish={handleAdvancedSearch}
            initialValues={{
              title: '',
              description: '',
              keywords: ''
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="title" label="标题包含">
                  <Input placeholder="搜索标题..." />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="description" label="描述包含">
                  <Input placeholder="搜索描述..." />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="keywords" label="关键词">
                  <Input placeholder="多个关键词用空格分隔" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  搜索
                </Button>
                <Button 
                  onClick={() => {
                    searchForm.resetFields();
                    setSearchKeyword('');
                    const newFilters = {
                      ...filters,
                      search: ''
                    };
                    setFilters(newFilters);
                    fetchTaskList();
                  }}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}
      
      {/* 任务统计信息 */}
      <TaskStats />
      
      {/* 筛选表单 */}
      {showFilters && (
        <Card className={styles.filterCard} size="small">
          <Form
            form={filterForm}
            layout="vertical"
            onFinish={handleApplyFilters}
            initialValues={filters}
          >
            {/* 在筛选表单顶部添加标签搜索使用说明 */}
            <div style={{ marginBottom: '16px', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              <Text strong>标签搜索使用说明：</Text>
              <ul style={{ marginTop: '8px', marginBottom: '0' }}>
                <li>直接点击已有标签将自动添加精确匹配</li>
                <li>输入标签名称进行精确匹配（例如：<Text code>报告</Text>）</li>
                <li>使用 <Text code>tag:</Text> 前缀进行特殊搜索（例如：<Text code>tag:报告</Text>）</li>
                <li>可以添加多个标签条件组合筛选</li>
              </ul>
            </div>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="status" label="状态">
                  <Select 
                    placeholder="选择状态" 
                    allowClear
                  >
                    <Select.Option value={TaskStatus.TODO}>待办</Select.Option>
                    <Select.Option value={TaskStatus.IN_PROGRESS}>进行中</Select.Option>
                    <Select.Option value={TaskStatus.COMPLETED}>已完成</Select.Option>
                    <Select.Option value={TaskStatus.CANCELLED}>已取消</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="priority" label="优先级">
                  <Select 
                    placeholder="选择优先级"
                    allowClear
                  >
                    <Select.Option value={TaskPriority.LOW}>低优先级</Select.Option>
                    <Select.Option value={TaskPriority.MEDIUM}>中优先级</Select.Option>
                    <Select.Option value={TaskPriority.HIGH}>高优先级</Select.Option>
                    <Select.Option value={TaskPriority.URGENT}>紧急</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="treeType" label="树木类型">
                  <Select 
                    placeholder="选择树木类型"
                    allowClear
                  >
                    <Select.Option value="OAK">橡树</Select.Option>
                    <Select.Option value="PINE">松树</Select.Option>
                    <Select.Option value="CHERRY">樱花树</Select.Option>
                    <Select.Option value="MAPLE">枫树</Select.Option>
                    <Select.Option value="PALM">棕榈树</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
              
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={
                  <Tooltip title="输入标签名称进行精确匹配。使用tag:前缀进行特殊搜索，例如：输入'tag:报告'将只匹配标签为'报告'的任务。中文需确保正确编码。">
                    标签 <InfoCircleOutlined style={{ fontSize: '12px' }} />
                  </Tooltip>
                } name="tags">
                  <Select
                    mode="tags"
                    placeholder="选择或输入标签（支持tag:前缀进行精确搜索）"
                    allowClear
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => 
                      option?.children ? option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
                    }
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            标签搜索示例: <Text code>报告</Text> 或 <Text code>tag:报告</Text>
                          </Text>
                        </Space>
                      </>
                    )}
                  >
                    {commonTags.map(tag => (
                      <Select.Option key={tag} value={tag}>
                        {tag}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={6}>
                <Form.Item name="startDate" label="开始日期">
                  <DatePicker placeholder="选择开始日期" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              
              <Col span={6}>
                <Form.Item name="endDate" label="结束日期">
                  <DatePicker placeholder="选择结束日期" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="sortBy" label="排序字段">
                  <Select placeholder="排序字段">
                    <Select.Option value="dueDate">截止日期</Select.Option>
                    <Select.Option value="createdAt">创建时间</Select.Option>
                    <Select.Option value="priority">优先级</Select.Option>
                    <Select.Option value="title">标题</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item name="sortOrder" label="排序方式">
                  <Radio.Group>
                    <Radio.Button value="asc">升序</Radio.Button>
                    <Radio.Button value="desc">降序</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loadingTasks}
                  icon={<FilterOutlined />}
                >
                  应用筛选
                </Button>
                <Button 
                  onClick={handleResetFilters}
                  icon={<ReloadOutlined />}
                >
                  重置
                </Button>
                {/* 开发环境下显示调试按钮 */}
                {process.env.NODE_ENV !== 'production' && (
                  <Button 
                    type="dashed" 
                    onClick={() => {
                      console.group('===== TaskList调试信息 =====');
                      console.log('当前筛选条件:', filters);
                      console.log('表单标签值:', filterForm.getFieldValue('tags'));
                      
                      if (filters.tags && filters.tags.length > 0) {
                        const params = new URLSearchParams();
                        const encodedTags = filters.tags.map(tag => 
                          tag.startsWith('tag:') 
                            ? `tag:${encodeURIComponent(tag.substring(4))}` 
                            : encodeURIComponent(tag)
                        );
                        params.append('tags', encodedTags.join(','));
                        console.log('完整URL参数:', params.toString());
                        console.log('接口测试命令:', `curl -s 'http://localhost:9000/api/tasks?${params.toString()}' | cat`);
                      }
                      
                      // 尝试实际发送API请求
                      taskService.getTasks(filters as GetTasksParams)
                        .then(response => {
                          console.log('API返回数据:', response.data);
                          message.success('API请求成功，详情见控制台');
                        })
                        .catch(err => {
                          console.error('API请求失败:', err);
                          message.error('API请求失败，详情见控制台');
                        })
                        .finally(() => {
                          console.groupEnd();
                        });
                    }}
                  >
                    调试筛选器
                  </Button>
                )}
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
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={tasks}
          renderItem={(task: Task) => (
            <List.Item key={task.id}>
              <Card
                className={styles.taskCard}
                hoverable
                actions={[
                  task.status !== TaskStatus.COMPLETED ? (
                    <Tooltip key="complete" title="完成任务">
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => handleCompleteTask(task.id.toString())}
                      >
                        完成
                      </Button>
                    </Tooltip>
                  ) : null,
                  <Tooltip key="edit" title="编辑任务">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditTask(task)}
                    >
                      编辑
                    </Button>
                  </Tooltip>,
                  <Tooltip key="delete" title="删除任务">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTask(task.id.toString())}
                    >
                      删除
                    </Button>
                  </Tooltip>
                ].filter(Boolean)}
              >
                <Card.Meta
                  title={
                    <Space>
                      <Text strong>{task.title}</Text>
                      <Tag color={statusColors[task.status as TaskStatus]}>
                        {task.status}
                      </Tag>
                      <Tag color={priorityColors[task.priority as TaskPriority]}>
                        优先级 {task.priority}
                      </Tag>
                      {task.treeType && (
                        <Tooltip title={`树木类型: ${treeTypeNames[task.treeType]}`}>
                          <Tag color={treeTypeColors[task.treeType]}>
                            {treeTypeNames[task.treeType]?.split(' ')[0] || task.treeType}
                          </Tag>
                        </Tooltip>
                      )}
                    </Space>
                  }
                  description={
                    <div className={styles.taskDescription}>
                      <p>{task.description}</p>
                      <Space wrap>
                        {task.tags?.map(tag => (
                          <Tag 
                            key={tag} 
                            onClick={() => handleTagClick(tag)}
                            className={styles.clickableTag}
                            color="blue"
                          >
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        {task.dueDate && (
                          <Text type="secondary">
                            截止日期: {new Date(task.dueDate).toLocaleDateString()}
                          </Text>
                        )}
                        {task.type && (
                          <Text type="secondary">
                            {task.type} → {task.treeType ? treeTypeNames[task.treeType] : getDefaultTreeTypeForTask(task.type)}
                          </Text>
                        )}
                      </div>
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