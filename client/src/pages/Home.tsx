import React, { useState, useEffect } from 'react';
import { Card, Button, List, Input, Modal, Form, DatePicker, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// 模拟任务数据
const MOCK_TASKS = [
  { id: 1, title: '完成产品设计文档', status: 'TODO', priority: '高', dueDate: '2025-04-15' },
  { id: 2, title: '实现用户认证功能', status: 'IN_PROGRESS', priority: '中', dueDate: '2025-04-20' },
  { id: 3, title: '修复导航栏显示问题', status: 'COMPLETED', priority: '低', dueDate: '2025-04-10' },
];

const Home: React.FC = () => {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟从API获取任务
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // 实际项目中这里会调用API
        // const response = await api.getTasks();
        // setTasks(response.data);
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
      // 模拟API调用
      const newTask = {
        id: Date.now(),
        title: values.title,
        status: 'TODO',
        priority: values.priority,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      };
      
      setTasks([...tasks, newTask]);
      message.success('任务创建成功');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('创建任务失败');
    } finally {
      setLoading(false);
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
                task.status !== 'COMPLETED' ? (
                  <Button key="complete" type="link">完成</Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={task.title}
                description={`优先级: ${task.priority} | 截止日期: ${task.dueDate}`}
              />
              <div>
                {task.status === 'TODO' && <span style={{ color: '#faad14' }}>待办</span>}
                {task.status === 'IN_PROGRESS' && <span style={{ color: '#1890ff' }}>进行中</span>}
                {task.status === 'COMPLETED' && <span style={{ color: '#52c41a' }}>已完成</span>}
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