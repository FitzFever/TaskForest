import React, { useState, useEffect } from 'react';
import { Card, Button, List, Input, Modal, Form, DatePicker, Select, message, Popconfirm, Tag, Space, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import * as taskService from '../services/taskService';
import { Task, TaskStatus, TaskPriority, TaskType, CreateTaskRequest } from '../types/Task';
import dayjs from 'dayjs';

// 删除模拟任务数据

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // 搜索参数
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: undefined,
    tags: [] as string[],
  });

  // 常用标签建议
  const [commonTags, setCommonTags] = useState<string[]>([
    '工作', '学习', '生活', '紧急', '重要', '项目', '会议', '报告', '健身'
  ]);

  // 从API获取任务
  const fetchTasks = async (params = searchParams) => {
    setLoading(true);
    try {
      // 调用真实API
      const response = await taskService.getTasks(params);
      console.log('获取到的任务响应:', response); // 添加日志输出
      // 访问正确的数据路径
      if (response && response.data && response.data.code === 200) {
        setTasks(response.data.data.tasks);
        
        // 分析并更新常用标签
        updateCommonTags(response.data.data.tasks);
      } else {
        throw new Error('API响应格式错误');
      }
    } catch (error) {
      console.error('获取任务失败:', error);
      message.error('获取任务列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 从任务中分析常用标签
  const updateCommonTags = (tasks: Task[]) => {
    // 汇总所有标签
    const allTags: string[] = [];
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        allTags.push(...task.tags);
      }
    });
    
    if (allTags.length > 0) {
      // 统计每个标签出现的次数
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // 排序并获取前10个最常用的标签
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, 10);
      
      if (sortedTags.length > 0) {
        setCommonTags(sortedTags);
      }
    }
  };

  // 初始加载任务
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // 处理搜索提交
  const handleSearch = (values: any) => {
    const params = {
      search: values.search || '',
      status: values.status,
      tags: values.tags || [],
    };
    setSearchParams(params);
    fetchTasks(params);
  };
  
  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    const emptyParams = {
      search: '',
      status: undefined,
      tags: [],
    };
    setSearchParams(emptyParams);
    fetchTasks(emptyParams);
  };

  // 处理创建任务
  const handleCreateTask = async (values: any) => {
    setLoading(true);
    
    try {
      // 调用真实API创建任务
      const taskRequest: CreateTaskRequest = {
        title: values.title,
        description: values.description || '',
        priority: values.priority === '高' ? TaskPriority.HIGH : 
                 values.priority === '中' ? TaskPriority.MEDIUM : TaskPriority.LOW,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        type: TaskType.NORMAL, // 使用枚举
        tags: values.tags || []
      };
      
      const createResponse = await taskService.createTask(taskRequest);
      if (createResponse && createResponse.data && (createResponse.data.code === 201 || createResponse.data.code === 200)) {
        message.success('任务创建成功');
        setModalVisible(false);
        form.resetFields();
        
        // 重新加载任务列表
        await fetchTasks();
      } else {
        throw new Error('创建任务失败');
      }
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理完成任务
  const handleCompleteTask = async (taskId: string) => {
    try {
      const completeResponse = await taskService.completeTask(taskId);
      if (completeResponse && completeResponse.data && completeResponse.data.code === 200) {
        message.success('任务已完成');
        
        // 重新加载任务列表
        await fetchTasks();
      } else {
        throw new Error('完成任务失败');
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      message.error('完成任务失败');
    }
  };
  
  // 处理编辑任务
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    // 设置表单初始值，注意日期需要转换为dayjs对象
    editForm.setFieldsValue({
      title: task.title,
      description: task.description,
      priority: task.priority === TaskPriority.HIGH ? '高' : 
                task.priority === TaskPriority.MEDIUM ? '中' : '低',
      dueDate: dayjs(task.dueDate),
      tags: task.tags || []
    });
    setEditModalVisible(true);
  };
  
  // 处理更新任务
  const handleUpdateTask = async (values: any) => {
    if (!editingTask) return;
    
    setLoading(true);
    try {
      const updateRequest = {
        title: values.title,
        description: values.description || '',
        priority: values.priority === '高' ? TaskPriority.HIGH : 
                 values.priority === '中' ? TaskPriority.MEDIUM : TaskPriority.LOW,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        tags: values.tags || []
      };
      
      const updateResponse = await taskService.updateTask(editingTask.id.toString(), updateRequest);
      if (updateResponse && updateResponse.data && updateResponse.data.code === 200) {
        message.success('任务更新成功');
        setEditModalVisible(false);
        
        // 重新加载任务列表
        await fetchTasks();
      } else {
        throw new Error('更新任务失败');
      }
    } catch (error) {
      console.error('更新任务失败:', error);
      message.error('更新任务失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理删除任务
  const handleDeleteTask = async (taskId: string) => {
    setLoading(true);
    try {
      await taskService.deleteTask(taskId);
      message.success('任务已删除');
      
      // 重新加载任务列表
      await fetchTasks();
    } catch (error) {
      console.error('删除任务失败:', error);
      message.error('删除任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    // 更新搜索表单
    const currentTags = searchForm.getFieldValue('tags') || [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      searchForm.setFieldsValue({ tags: newTags });
      
      // 执行搜索
      const params = {
        ...searchParams,
        tags: newTags
      };
      setSearchParams(params);
      fetchTasks(params);
    }
  };

  // 获取任务状态显示
  const getStatusText = (status: string) => {
    switch(status) {
      case TaskStatus.TODO: return <span style={{ color: '#faad14' }}>待办</span>;
      case TaskStatus.IN_PROGRESS: return <span style={{ color: '#1890ff' }}>进行中</span>;
      case TaskStatus.COMPLETED: return <span style={{ color: '#52c41a' }}>已完成</span>;
      default: return <span>{status}</span>;
    }
  };

  // 渲染标签
  const renderTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div style={{ marginTop: '8px' }}>
        {tags.map(tag => (
          <Tag key={tag} color="blue" style={{ marginRight: '4px', cursor: 'pointer' }} onClick={() => handleTagClick(tag)}>
            {tag}
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* 搜索表单 */}
      <Card style={{ marginBottom: '16px' }}>
        <Form 
          form={searchForm}
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{ 
            search: '', 
            status: undefined,
            tags: []
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="search" label="关键词">
                <Input 
                  placeholder="搜索任务标题或描述" 
                  prefix={<SearchOutlined />} 
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="状态">
                <Select allowClear placeholder="选择状态">
                  <Select.Option value={TaskStatus.TODO}>待办</Select.Option>
                  <Select.Option value={TaskStatus.IN_PROGRESS}>进行中</Select.Option>
                  <Select.Option value={TaskStatus.COMPLETED}>已完成</Select.Option>
                  <Select.Option value={TaskStatus.CANCELLED}>已取消</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="tags" label="标签">
                <Select
                  mode="tags"
                  allowClear
                  placeholder="选择或输入标签"
                  style={{ width: '100%' }}
                >
                  {commonTags.map(tag => (
                    <Select.Option key={tag} value={tag}>
                      {tag}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ marginRight: '8px' }}
                icon={<FilterOutlined />}
              >
                筛选
              </Button>
              <Button 
                onClick={handleResetSearch} 
                style={{ marginRight: '8px' }}
                icon={<ReloadOutlined />}
              >
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="我的任务"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
          >
            新建任务
          </Button>
        }
      >
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                <Button 
                  key="edit" 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditTask(task)}
                  disabled={task.status === TaskStatus.COMPLETED}
                >
                  编辑
                </Button>,
                task.status !== TaskStatus.COMPLETED ? (
                  <Button 
                    key="complete" 
                    type="link"
                    icon={<CheckOutlined />}
                    onClick={() => handleCompleteTask(task.id.toString())}
                  >
                    完成
                  </Button>
                ) : null,
                <Popconfirm
                  key="delete"
                  title="确定要删除此任务吗？"
                  description="删除后不可恢复"
                  onConfirm={() => handleDeleteTask(task.id.toString())}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="link" 
                    danger
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>{task.title}</span>
                    <span 
                      style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: 
                          task.priority === TaskPriority.HIGH ? '#ff4d4f' : 
                          task.priority === TaskPriority.MEDIUM ? '#faad14' : 
                          '#52c41a',
                        color: 'white',
                        marginRight: '8px'
                      }}
                    >
                      {task.priority === TaskPriority.HIGH ? '高优先级' : 
                       task.priority === TaskPriority.MEDIUM ? '中优先级' : 
                       '低优先级'}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: 
                          task.status === TaskStatus.COMPLETED ? '#52c41a' :
                          task.status === TaskStatus.IN_PROGRESS ? '#1890ff' :
                          '#faad14',
                        color: 'white'
                      }}
                    >
                      {task.status === TaskStatus.COMPLETED ? '已完成' :
                       task.status === TaskStatus.IN_PROGRESS ? '进行中' :
                       '待办'}
                    </span>
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: '4px' }}>
                      {task.description || '无描述'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      截止日期: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '无'} | 
                      创建时间: {new Date(task.createdAt).toLocaleString()}
                    </div>
                    {renderTags(task.tags)}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无任务，快去创建一个吧！' }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 个任务`
          }}
        />
      </Card>

      {/* 创建任务表单 */}
      <Modal
        title="创建新任务"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Select.Option value="低">低</Select.Option>
              <Select.Option value="中">中</Select.Option>
              <Select.Option value="高">高</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="输入或选择标签"
              allowClear
            >
              {commonTags.map(tag => (
                <Select.Option key={tag} value={tag}>
                  {tag}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              创建
            </Button>
            <Button onClick={() => setModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 编辑任务表单 */}
      <Modal
        title="编辑任务"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTask}
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Select.Option value="低">低</Select.Option>
              <Select.Option value="中">中</Select.Option>
              <Select.Option value="高">高</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="输入或选择标签"
              allowClear
            >
              {commonTags.map(tag => (
                <Select.Option key={tag} value={tag}>
                  {tag}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              更新
            </Button>
            <Button onClick={() => setEditModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Home; 