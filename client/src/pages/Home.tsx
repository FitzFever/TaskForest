import React, { useState, useEffect } from 'react';
import { Card, Button, List, Input, Modal, Form, DatePicker, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import * as taskService from '../services/taskService';
import { Task, TaskStatus, TaskPriority, TaskType, CreateTaskRequest } from '../types/Task';

// 删除模拟任务数据

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 从API获取任务
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // 调用真实API
        const response = await taskService.getTasks();
        console.log('获取到的任务响应:', response); // 添加日志输出
        // 访问正确的数据路径
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
        } else {
          throw new Error('API响应格式错误');
        }
        setLoading(false);
      } catch (error) {
        console.error('获取任务失败:', error);
        message.error('获取任务列表失败');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
        tags: []
      };
      
      const createResponse = await taskService.createTask(taskRequest);
      if (createResponse && createResponse.data && (createResponse.data.code === 201 || createResponse.data.code === 200)) {
        message.success('任务创建成功');
        setModalVisible(false);
        form.resetFields();
        
        // 重新加载任务列表
        const response = await taskService.getTasks();
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
        }
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
        const response = await taskService.getTasks();
        if (response && response.data && response.data.code === 200) {
          setTasks(response.data.data.tasks);
        } else {
          throw new Error('获取任务列表失败');
        }
      } else {
        throw new Error('完成任务失败');
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      message.error('完成任务失败');
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

  return (
    <div>
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
                <Button key="edit" type="link">编辑</Button>,
                task.status !== TaskStatus.COMPLETED ? (
                  <Button 
                    key="complete" 
                    type="link"
                    onClick={() => handleCompleteTask(task.id.toString())}
                  >
                    完成
                  </Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={task.title}
                description={`优先级: ${TaskPriority[task.priority]} | 截止日期: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '无'}`}
              />
              <div>
                {getStatusText(task.status)}
              </div>
            </List.Item>
          )}
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
    </div>
  );
};

export default Home; 